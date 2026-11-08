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

    // Fetch current wallet balance (server-side check)
    const walletRes = await fetch(
      `${supabaseUrl}/rest/v1/user_wallet?user_profile_id=eq.${userProfileId}&limit=1`,
      { headers }
    );
    const wallets = await walletRes.json();
    if (!wallets?.length) return Response.json({ error: 'Wallet not found' }, { status: 404 });

    const currentBalance = wallets[0].balance;
    if (currentBalance < coinsCost) {
      return Response.json({ error: 'Insufficient balance' }, { status: 402 });
    }

    const newBalance = currentBalance - coinsCost;

    // Decrement balance
    const patchRes = await fetch(`${supabaseUrl}/rest/v1/user_wallet?user_profile_id=eq.${userProfileId}`, {
      method: 'PATCH',
      headers: { ...headers, Prefer: 'return=minimal' },
      body: JSON.stringify({ balance: newBalance }),
    });
    if (!patchRes.ok) {
      return Response.json({ error: 'Failed to update wallet' }, { status: 500 });
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
      // Rollback balance
      await fetch(`${supabaseUrl}/rest/v1/user_wallet?user_profile_id=eq.${userProfileId}`, {
        method: 'PATCH',
        headers: { ...headers, Prefer: 'return=minimal' },
        body: JSON.stringify({ balance: currentBalance }),
      });
      return Response.json({ error: 'Failed to record redemption, transaction rolled back' }, { status: 500 });
    }

    return Response.json({ success: true, newBalance });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});