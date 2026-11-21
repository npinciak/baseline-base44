import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { supabaseGoalId } = body;

    if (!supabaseGoalId) return Response.json({ error: 'supabaseGoalId required' }, { status: 400 });

    // Only the caller's own goals are visible here, so this is the ownership check.
    const existing = await base44.functions.invoke('getSupabaseGoals', {});
    const ownGoal = existing.data?.goals?.find((g) => g.id === supabaseGoalId);
    const profileId = existing.data?.userProfileId;
    if (!ownGoal || !profileId) return Response.json({ error: 'Goal not found' }, { status: 404 });

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    const res = await fetch(
      `${supabaseUrl}/rest/v1/goals?id=eq.${encodeURIComponent(supabaseGoalId)}&user_profile_id=eq.${encodeURIComponent(profileId)}`,
      {
        method: 'DELETE',
        headers: {
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
          Prefer: 'return=representation',
        },
        signal: AbortSignal.timeout(15000),
      }
    );

    if (!res.ok) {
      const result = await res.json().catch(() => ({}));
      return Response.json({ error: result }, { status: res.status });
    }

    const deleted = await res.json().catch(() => []);
    if (!Array.isArray(deleted) || deleted.length === 0) {
      return Response.json({ error: 'Goal not found' }, { status: 404 });
    }

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}