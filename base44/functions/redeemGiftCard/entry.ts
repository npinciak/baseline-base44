import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import { GIFT_CARD_PRICES } from '../../shared/coinEconomy.ts';

function isUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { giftCardId } = await req.json().catch(() => ({}));
    const card = GIFT_CARD_PRICES[giftCardId];
    if (!card) return Response.json({ error: 'Unknown reward' }, { status: 400 });
    const { brand, amount: amountUsd, coinsCost } = card;

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const headers = { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, 'Content-Type': 'application/json' };

    // Resolve next_auth UUID
    let nextAuthUserId = isUuid(user.id) ? user.id : null;
    if (!nextAuthUserId && user.email) {
      const lookupRes = await fetch(
        `${supabaseUrl}/rest/v1/users?email=eq.${encodeURIComponent(user.email)}&select=id&limit=1`,
        { headers: { ...headers, 'Accept-Profile': 'next_auth' } }
      );
      const rows = await lookupRes.json();
      nextAuthUserId = rows?.[0]?.id ?? null;
    }
    if (!nextAuthUserId) return Response.json({ error: 'User not found' }, { status: 404 });

    // Get user_profile id
    const profileRes = await fetch(
      `${supabaseUrl}/rest/v1/user_profiles?user_id=eq.${nextAuthUserId}&select=id&limit=1`,
      { headers }
    );
    const profiles = await profileRes.json();
    if (!profiles?.length) return Response.json({ error: 'Profile not found' }, { status: 404 });
    const userProfileId = profiles[0].id;

    // Atomically deduct the coins with a compare-and-swap on the wallet balance:
    // the PATCH only matches while the balance still equals what we read, so
    // concurrent redemptions cannot all pass the check on the same snapshot.
    const MAX_ATTEMPTS = 5;
    let currentBalance = null;
    let newBalance = null;

    for (let attempt = 0; attempt < MAX_ATTEMPTS && newBalance === null; attempt++) {
      const walletRes = await fetch(
        `${supabaseUrl}/rest/v1/user_wallet?user_profile_id=eq.${userProfileId}&select=balance&limit=1`,
        { headers }
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
      // No row updated means the balance changed meanwhile: re-read and retry.
    }

    if (newBalance === null) {
      return Response.json({ error: 'Wallet is busy, please try again' }, { status: 409 });
    }

    // Insert redemption history
    const historyRes = await fetch(`${supabaseUrl}/rest/v1/redemption_history`, {
      method: 'POST',
      headers: { ...headers, Prefer: 'return=minimal' },
      body: JSON.stringify({
        user_profile_id: userProfileId,
        gift_card_id: giftCardId,
        brand,
        amount_usd: amountUsd,
        coins_spent: coinsCost,
        redeemed_at: new Date().toISOString(),
      }),
    });
    if (!historyRes.ok) {
      // Rollback balance (conditional, only if it still holds our deduction)
      await fetch(
        `${supabaseUrl}/rest/v1/user_wallet?user_profile_id=eq.${userProfileId}&balance=eq.${newBalance}`,
        {
          method: 'PATCH',
          headers: { ...headers, Prefer: 'return=minimal' },
          body: JSON.stringify({ balance: currentBalance }),
        }
      );
      return Response.json({ error: 'Failed to record redemption, transaction rolled back' }, { status: 500 });
    }

    return Response.json({ success: true, newBalance });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});