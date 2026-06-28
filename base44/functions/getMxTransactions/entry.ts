import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

function isUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

async function resolveNextAuthUuid(supabaseUrl, headers, user) {
  if (isUuid(user.id)) return user.id;
  if (!user.email) return null;
  const res = await fetch(
    `${supabaseUrl}/rest/v1/users?email=eq.${encodeURIComponent(user.email)}&select=id&limit=1`,
    { headers: { ...headers, 'Accept-Profile': 'next_auth' } }
  );
  const rows = await res.json();
  return rows?.[0]?.id ?? null;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const supabaseHeaders = { apikey: serviceRoleKey, Authorization: `Bearer ${serviceRoleKey}` };

    // Resolve next_auth UUID from user_profiles
    const nextAuthUserId = await resolveNextAuthUuid(supabaseUrl, supabaseHeaders, user);

    // Look up MX user GUID from user_profiles
    let userGuid = null;
    if (nextAuthUserId) {
      const profileRes = await fetch(
        `${supabaseUrl}/rest/v1/user_profiles?user_id=eq.${nextAuthUserId}&select=mx_user_guid&limit=1`,
        { headers: supabaseHeaders }
      );
      const profiles = await profileRes.json();
      userGuid = profiles?.[0]?.mx_user_guid ?? null;
    }

    // Fall back to BankConnection entity if not in user_profiles
    if (!userGuid) {
      const connections = await base44.asServiceRole.entities.BankConnection.filter({ user_id: user.id, provider: 'mx' });
      userGuid = connections?.[0]?.access_token_ref ?? null;
    }

    if (!userGuid) {
      return Response.json({ error: 'No MX bank connection found' }, { status: 404 });
    }

    const apiKey = Deno.env.get('MX_API');
    const clientId = Deno.env.get('MX_CLIENT');
    const apiVersion = Deno.env.get('MX_API_VERSION') || 'v20250224';
    const authHeader = `Basic ${btoa(`${clientId}:${apiKey}`)}`;

    const response = await base44.asServiceRole.integrations.custom.call('mx', `get:/users/{user_identifier}/transactions`, {
      pathParams: { user_identifier: userGuid },
      queryParams: { page: 1, records_per_page: 500, includes: 'merchants,classifications,repeating_transactions' },
      payload: {},
      headers: {
        'Authorization': authHeader,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Accept-Version': apiVersion,
      },
    });

    if (!response.success) {
      return Response.json({ error: 'MX API error', details: response.data }, { status: response.status_code });
    }

    return Response.json({ transactions: response.data?.transactions || [], pagination: response.data?.pagination });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});