import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { secrets } from 'base44:runtime';
import {
  LEVEL_2_MIN_COINS,
  STREAK_SHIELD_COST,
  getVerifiedLifetimeCoins,
  resolveSupabaseProfile,
} from '../../shared/coinEconomy.ts';

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const statsArr = await base44.asServiceRole.entities.UserStats.filter({ user_id: user.id });
    const existingStats = statsArr?.[0] || null;
    if (existingStats?.streak_shield_active) {
      return Response.json({ error: 'Your Streak Shield is already armed.' }, { status: 400 });
    }

    const supabaseUrl = secrets.get('SUPABASE_URL');
    const serviceKey = secrets.get('SUPABASE_SERVICE_ROLE_KEY');
    const headers = {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
    };

    const userProfileId = await resolveSupabaseProfile(user, supabaseUrl, headers);
    if (!userProfileId) {
      return Response.json({ error: 'Wallet profile not found' }, { status: 404 });
    }

    const walletRes = await fetch(
      `${supabaseUrl}/rest/v1/user_wallet?user_profile_id=eq.${userProfileId}&select=balance&limit=1`,
      { headers, signal: AbortSignal.timeout(10000) }
    );
    const wallets = await walletRes.json();
    if (!wallets?.length) return Response.json({ error: 'Wallet not found' }, { status: 404 });

    const initialSeen = Number(wallets[0].balance || 0);
    const lifetimeCoins = await getVerifiedLifetimeCoins(
      base44,
      user.id,
      userProfileId,
      supabaseUrl,
      headers,
      initialSeen
    );

    if (body?.dryRun === true) {
      return Response.json({
        ok: true,
        lifetimeCoins,
        walletBalance: initialSeen,
        eligible: lifetimeCoins >= LEVEL_2_MIN_COINS,
      });
    }

    if (lifetimeCoins < LEVEL_2_MIN_COINS) {
      return Response.json(
        { error: `Reach Level 2 (${LEVEL_2_MIN_COINS} Lifetime BC) to unlock Streak Shield.` },
        { status: 403 }
      );
    }

    let previousBalance = null;
    let newBalance = null;
    for (let attempt = 0; attempt < 5 && newBalance === null; attempt++) {
      const checkRes = await fetch(
        `${supabaseUrl}/rest/v1/user_wallet?user_profile_id=eq.${userProfileId}&select=balance&limit=1`,
        { headers, signal: AbortSignal.timeout(10000) }
      );
      const rows = await checkRes.json();
      const seen = Number(rows?.[0]?.balance ?? 0);
      if (seen < STREAK_SHIELD_COST) {
        return Response.json({ error: `Need ${STREAK_SHIELD_COST} Spendable BaseCoins to arm Streak Shield.` }, { status: 402 });
      }
      const candidate = seen - STREAK_SHIELD_COST;
      const patchRes = await fetch(
        `${supabaseUrl}/rest/v1/user_wallet?user_profile_id=eq.${userProfileId}&balance=eq.${seen}`,
        {
          method: 'PATCH',
          headers: { ...headers, Prefer: 'return=representation' },
          body: JSON.stringify({ balance: candidate }),
          signal: AbortSignal.timeout(10000),
        }
      );
      if (!patchRes.ok) return Response.json({ error: 'Failed to update wallet' }, { status: 500 });
      const updated = await patchRes.json().catch(() => []);
      if (Array.isArray(updated) && updated.length === 1) {
        previousBalance = seen;
        newBalance = candidate;
      }
    }

    if (newBalance === null) {
      return Response.json({ error: 'Wallet is busy, please try again.' }, { status: 409 });
    }

    try {
      if (existingStats) {
        await base44.asServiceRole.entities.UserStats.update(existingStats.id, {
          streak_shield_active: true,
        });
      } else {
        await base44.asServiceRole.entities.UserStats.create({
          user_id: user.id,
          streak_shield_active: true,
        });
      }
    } catch (err) {
      await fetch(
        `${supabaseUrl}/rest/v1/user_wallet?user_profile_id=eq.${userProfileId}&balance=eq.${newBalance}`,
        {
          method: 'PATCH',
          headers: { ...headers, Prefer: 'return=minimal' },
          body: JSON.stringify({ balance: previousBalance }),
          signal: AbortSignal.timeout(10000),
        }
      );
      throw err;
    }

    return Response.json({
      success: true,
      newBalance,
      coinsSpent: STREAK_SHIELD_COST,
      streak_shield_active: true,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}