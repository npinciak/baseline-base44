import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { LESSON_REWARD } from '../../shared/coinEconomy.ts';

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

    // Record the award first so a repeat call can't double-credit.
    await base44.asServiceRole.entities.CoinAward.create({ user_id: user.id, module_id, amount: LESSON_REWARD });

    const walletRes = await fetch(`${supabaseUrl}/rest/v1/user_wallet?user_profile_id=eq.${userProfileId}&limit=1`, { headers, signal: AbortSignal.timeout(10000) });
    const wallets = await walletRes.json();
    const newBalance = (wallets?.[0]?.balance ?? 0) + LESSON_REWARD;
    const writeRes = wallets?.length
      ? await fetch(`${supabaseUrl}/rest/v1/user_wallet?user_profile_id=eq.${userProfileId}`, {
          method: 'PATCH', headers: { ...headers, Prefer: 'return=minimal' }, body: JSON.stringify({ balance: newBalance }), signal: AbortSignal.timeout(10000),
        })
      : await fetch(`${supabaseUrl}/rest/v1/user_wallet`, {
          method: 'POST', headers: { ...headers, Prefer: 'return=minimal' }, body: JSON.stringify({ user_profile_id: userProfileId, balance: newBalance }), signal: AbortSignal.timeout(10000),
        });
    if (!writeRes.ok) {
      const detail = await writeRes.text();
      return Response.json({ error: 'Failed to update wallet', detail }, { status: 500 });
    }

    return Response.json({ awarded: LESSON_REWARD, newBalance });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}