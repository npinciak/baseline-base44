import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { lessonCoins } from '../../shared/coinEconomy.ts';
import { goalSubscription } from '../../shared/goalPolicy.ts';

function isUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

// Credits the fixed lesson reward once per completed lesson (unit). The amount is set here, never by the caller.
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { moduleId } = await req.json().catch(() => ({}));
    if (!moduleId) return Response.json({ error: 'moduleId is required' }, { status: 400 });
    const module_id = String(moduleId);

    const done = await base44.asServiceRole.entities.UserProgress.filter({ user_id: user.id, module_id, completed: true }, '-created_date', 1);
    if (!done.length) return Response.json({ error: 'Lesson not completed' }, { status: 400 });
    const already = await base44.asServiceRole.entities.CoinAward.filter({ user_id: user.id, module_id }, '-created_date', 1);
    if (already.length) return Response.json({ awarded: 0 });

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const headers = { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, 'Content-Type': 'application/json' };

    let nextAuthUserId = isUuid(user.id) ? user.id : null;
    if (!nextAuthUserId && user.email) {
      const lookupRes = await fetch(
        `${supabaseUrl}/rest/v1/users?email=eq.${encodeURIComponent(user.email)}&select=id&limit=1`,
        { headers: { ...headers, 'Accept-Profile': 'next_auth' }, signal: AbortSignal.timeout(10000) }
      );
      const rows = await lookupRes.json();
      nextAuthUserId = rows?.[0]?.id ?? null;
    }
    if (!nextAuthUserId) return Response.json({ error: 'User profile not found' }, { status: 404 });

    const profileRes = await fetch(`${supabaseUrl}/rest/v1/user_profiles?user_id=eq.${nextAuthUserId}&select=id&limit=1`, { headers, signal: AbortSignal.timeout(10000) });
    const profiles = await profileRes.json();
    if (!profiles?.length) return Response.json({ error: 'Profile not found' }, { status: 404 });
    const userProfileId = profiles[0].id;

    // Plus members earn more spendable coins; the plan is verified here, never sent by the caller.
    const { paid } = await goalSubscription(base44, user);
    const LESSON_REWARD = lessonCoins(paid);

    // Claim the award before any credit. Overlapping requests each insert a row, then every one of
    // them elects the same single winner (earliest claim, ties broken by id) so exactly one credits.
    const claim = await base44.asServiceRole.entities.CoinAward.create({ user_id: user.id, module_id, amount: LESSON_REWARD });
    if (!claim?.id) return Response.json({ error: 'Failed to record award' }, { status: 500 });

    // Let overlapping claims land so all callers compare against the same set.
    await new Promise((resolve) => setTimeout(resolve, 400));
    const claims = await base44.asServiceRole.entities.CoinAward.filter({ user_id: user.id, module_id }, 'created_date', 50);
    const ordered = (Array.isArray(claims) ? claims : []).slice().sort((a, b) => {
      const dateA = String(a.created_date || '');
      const dateB = String(b.created_date || '');
      if (dateA !== dateB) return dateA < dateB ? -1 : 1;
      return String(a.id) < String(b.id) ? -1 : 1;
    });
    const winner = ordered[0];

    if (!winner || winner.id !== claim.id) {
      // Another request owns this lesson's reward; drop our duplicate claim row.
      await base44.asServiceRole.entities.CoinAward.delete(claim.id).catch(() => {});
      return Response.json({ awarded: 0 });
    }

    // Credit with a compare-and-set loop so simultaneous credits are applied exactly once each.
    let newBalance = null;
    for (let attempt = 0; attempt < 6 && newBalance === null; attempt++) {
      const walletRes = await fetch(`${supabaseUrl}/rest/v1/user_wallet?user_profile_id=eq.${userProfileId}&select=balance&limit=1`, { headers, signal: AbortSignal.timeout(10000) });
      const wallets = await walletRes.json();
      if (!Array.isArray(wallets)) return Response.json({ error: 'Failed to read wallet' }, { status: 500 });

      if (!wallets.length) {
        const createRes = await fetch(`${supabaseUrl}/rest/v1/user_wallet`, {
          method: 'POST', headers: { ...headers, Prefer: 'return=representation' }, body: JSON.stringify({ user_profile_id: userProfileId, balance: LESSON_REWARD }), signal: AbortSignal.timeout(10000),
        });
        if (createRes.ok) newBalance = LESSON_REWARD;
        continue;
      }

      const seen = Number(wallets[0].balance ?? 0);
      const candidate = seen + LESSON_REWARD;
      const patchRes = await fetch(`${supabaseUrl}/rest/v1/user_wallet?user_profile_id=eq.${userProfileId}&balance=eq.${seen}`, {
        method: 'PATCH', headers: { ...headers, Prefer: 'return=representation' }, body: JSON.stringify({ balance: candidate }), signal: AbortSignal.timeout(10000),
      });
      if (!patchRes.ok) {
        const detail = await patchRes.text();
        return Response.json({ error: 'Failed to update wallet', detail }, { status: 500 });
      }
      const updated = await patchRes.json().catch(() => []);
      if (Array.isArray(updated) && updated.length === 1) newBalance = candidate;
    }

    if (newBalance === null) {
      // Release the claim so the learner can retry the reward.
      await base44.asServiceRole.entities.CoinAward.delete(claim.id).catch(() => {});
      return Response.json({ error: 'Wallet is busy, please try again.' }, { status: 409 });
    }

    return Response.json({ awarded: LESSON_REWARD, newBalance });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}