import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    // Resolve user_profile_id from user_profiles via Base44 user.id
    const profileRes = await fetch(
      `${supabaseUrl}/rest/v1/user_profiles?user_id=eq.${user.id}&select=id&limit=1`,
      {
        headers: {
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
        },
      }
    );
    const profiles = await profileRes.json();
    if (!profiles || profiles.length === 0) {
      return Response.json({ goals: [], userProfileId: null });
    }
    const userProfileId = profiles[0].id;

    // Fetch goals for this user_profile_id
    const goalsRes = await fetch(
      `${supabaseUrl}/rest/v1/goals?user_profile_id=eq.${userProfileId}&select=id,name,goal_type,image,target_amount,current_amount,target_date,currency_code,source,vault_id,linked_accounts_balance,last_balance_sync_at&order=created_at.asc`,
      {
        headers: {
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
        },
      }
    );
    const goals = await goalsRes.json();
    return Response.json({ goals: goals || [], userProfileId });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});