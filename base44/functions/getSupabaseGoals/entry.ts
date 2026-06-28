import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

function isUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const headers = { apikey: serviceRoleKey, Authorization: `Bearer ${serviceRoleKey}` };

    // Resolve canonical next_auth UUID (same logic as auth flow)
    let nextAuthUserId = isUuid(user.id) ? user.id : null;

    if (!nextAuthUserId && user.email) {
      const lookupRes = await fetch(
        `${supabaseUrl}/rest/v1/users?email=eq.${encodeURIComponent(user.email)}&select=id&limit=1`,
        { headers: { ...headers, 'Accept-Profile': 'next_auth' } }
      );
      const rows = await lookupRes.json();
      nextAuthUserId = rows?.[0]?.id ?? null;
    }

    if (!nextAuthUserId) {
      return Response.json({ goals: [], userProfileId: null });
    }

    // Resolve user_profile_id from user_profiles via next_auth UUID
    const profileRes = await fetch(
      `${supabaseUrl}/rest/v1/user_profiles?user_id=eq.${nextAuthUserId}&select=id&limit=1`,
      { headers }
    );
    const profiles = await profileRes.json();
    if (!profiles || profiles.length === 0) {
      return Response.json({ goals: [], userProfileId: null });
    }
    const userProfileId = profiles[0].id;

    // Fetch goals for this user_profile_id
    const goalsRes = await fetch(
      `${supabaseUrl}/rest/v1/goals?user_profile_id=eq.${userProfileId}&select=id,name,goal_type,image,target_amount,current_amount,target_date,currency_code,source,vault_id,linked_accounts_balance,last_balance_sync_at&order=created_at.asc`,
      { headers }
    );
    const goals = await goalsRes.json();
    return Response.json({ goals: goals || [], userProfileId });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});