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
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const headers = { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` };

    // Resolve next_auth UUID (same pattern as getUserProfile)
    let nextAuthUserId = isUuid(user.id) ? user.id : null;
    if (!nextAuthUserId && user.email) {
      const lookupRes = await fetch(
        `${supabaseUrl}/rest/v1/users?email=eq.${encodeURIComponent(user.email)}&select=id&limit=1`,
        { headers: { ...headers, 'Accept-Profile': 'next_auth' } }
      );
      const rows = await lookupRes.json();
      nextAuthUserId = rows?.[0]?.id ?? null;
    }
    if (!nextAuthUserId) return Response.json({ balance: 0, userProfileId: null });

    // Get user_profile id
    const profileRes = await fetch(
      `${supabaseUrl}/rest/v1/user_profiles?user_id=eq.${nextAuthUserId}&select=id&limit=1`,
      { headers }
    );
    const profiles = await profileRes.json();
    if (!profiles?.length) return Response.json({ balance: 0, userProfileId: null });
    const userProfileId = profiles[0].id;

    // Fetch wallet
    const walletRes = await fetch(
      `${supabaseUrl}/rest/v1/user_wallet?user_profile_id=eq.${userProfileId}&limit=1`,
      { headers }
    );
    const wallets = await walletRes.json();
    const balance = wallets?.[0]?.balance ?? 0;

    return Response.json({ balance, userProfileId });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});