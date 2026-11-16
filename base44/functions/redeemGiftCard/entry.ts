import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { secrets, waitUntil } from 'base44:runtime';
import {
  GIFT_CARD_PRICES,
  computeEffectiveGiftCardCost,
  getVerifiedLifetimeCoins,
  resolveSupabaseProfile,
} from '../../shared/coinEconomy.ts';
import { OWNER_EMAILS } from '../../shared/ownerAccess.ts';

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { giftCardId } = await req.json().catch(() => ({}));
    const card = GIFT_CARD_PRICES[giftCardId];
    if (!card) return Response.json({ error: 'Unknown reward' }, { status: 400 });
    const { brand, amount: amountUsd } = card;

    const supabaseUrl = secrets.get('SUPABASE_URL');
    const serviceKey = secrets.get('SUPABASE_SERVICE_ROLE_KEY');
    const headers = { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, 'Content-Type': 'application/json' };

    const userProfileId = await resolveSupabaseProfile(user, supabaseUrl, headers);
    if (!userProfileId) return Response.json({ error: 'Profile not found' }, { status: 404 });

    const initialWalletRes = await fetch(
      `${supabaseUrl}/rest/v1/user_wallet?user_profile_id=eq.${userProfileId}&select=balance&limit=1`,
      { headers, signal: AbortSignal.timeout(10000) }
    );
    const initialWallets = await initialWalletRes.json();
    if (!initialWallets?.length) return Response.json({ error: 'Wallet not found' }, { status: 404 });

    // Compute server-verified level rebate (never trust client-submitted coinsCost).
    const lifetimeCoins = await getVerifiedLifetimeCoins(
      base44,
      user.id,
      userProfileId,
      supabaseUrl,
      headers,
      Number(initialWallets[0].balance || 0)
    );
    const { effectiveCost: coinsCost, rebate } = computeEffectiveGiftCardCost(card, lifetimeCoins);

    const MAX_ATTEMPTS = 5;
    let currentBalance = null;
    let newBalance = null;

    for (let attempt = 0; attempt < MAX_ATTEMPTS && newBalance === null; attempt++) {
      const walletRes = await fetch(
        `${supabaseUrl}/rest/v1/user_wallet?user_profile_id=eq.${userProfileId}&select=balance&limit=1`,
        { headers, signal: AbortSignal.timeout(10000) }
      );
      const wallets = await walletRes.json();
      if (!wallets?.length) return Response.json({ error: 'Wallet not found' }, { status: 404 });

      const seenBalance = Number(wallets[0].balance);
      if (seenBalance < coinsCost) {
        return Response.json({ error: 'Insufficient balance' }, { status: 402 });
      }
      const candidate = seenBalance - coinsCost;

      const patchRes = await fetch(
        `${supabaseUrl}/rest/v1/user_wallet?user_profile_id=eq.${userProfileId}&balance=eq.${seenBalance}`,
        {
          method: 'PATCH',
          headers: { ...headers, Prefer: 'return=representation' },
          body: JSON.stringify({ balance: candidate }),
          signal: AbortSignal.timeout(10000),
        }
      );
      if (!patchRes.ok) {
        return Response.json({ error: 'Failed to update wallet' }, { status: 500 });
      }
      const updated = await patchRes.json().catch(() => []);
      if (Array.isArray(updated) && updated.length === 1) {
        currentBalance = seenBalance;
        newBalance = candidate;
      }
    }

    if (newBalance === null) {
      return Response.json({ error: 'Wallet is busy, please try again' }, { status: 409 });
    }

    const historyRes = await fetch(`${supabaseUrl}/rest/v1/redemption_history`, {
      method: 'POST',
      headers: { ...headers, Prefer: 'return=representation' },
      body: JSON.stringify({
        user_profile_id: userProfileId,
        gift_card_id: giftCardId,
        brand,
        amount_usd: amountUsd,
        coins_spent: coinsCost,
        redeemed_at: new Date().toISOString(),
      }),
      signal: AbortSignal.timeout(10000),
    });
    if (!historyRes.ok) {
      await fetch(
        `${supabaseUrl}/rest/v1/user_wallet?user_profile_id=eq.${userProfileId}&balance=eq.${newBalance}`,
        {
          method: 'PATCH',
          headers: { ...headers, Prefer: 'return=minimal' },
          body: JSON.stringify({ balance: currentBalance }),
          signal: AbortSignal.timeout(10000),
        }
      );
      return Response.json({ error: 'Failed to record redemption, transaction rolled back' }, { status: 500 });
    }

    const inserted = await historyRes.json().catch(() => []);
    const reference = String(inserted?.[0]?.id ?? crypto.randomUUID().slice(0, 8)).slice(0, 12);
    const itemName = `$${amountUsd} ${brand} gift card`;

    waitUntil(Promise.allSettled([
      base44.asServiceRole.integrations.Core.SendEmail({
        to: user.email,
        template_name: 'GiftCardRedeemed',
        category: 'transactional',
        variables: {
          first_name: (user.display_name || user.full_name || '').split(' ')[0] || 'there',
          order_id: reference,
          item_name: itemName,
          item_price: `$${amountUsd}.00`,
          total: `${coinsCost.toLocaleString()} BC`,
        },
      }),
      ...OWNER_EMAILS.map((to) => base44.asServiceRole.integrations.Core.SendEmail({
        to,
        category: 'transactional',
        subject: `Fulfill gift card: ${itemName} for ${user.email}`,
        body: `<p>${user.full_name || user.email} (${user.email}) redeemed a <strong>${itemName}</strong> for ${coinsCost} BaseCoins${rebate > 0 ? ` (applied ${rebate} BC Level rebate)` : ''}.</p><p>Redemption #${reference}. Please email them the gift card code within 3 business days.</p>`,
      })),
    ]));

    return Response.json({ success: true, newBalance, coinsCharged: coinsCost, rebateApplied: rebate, reference });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}