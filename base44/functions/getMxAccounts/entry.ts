import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

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

    const userGuid = await resolveNextAuthUuid(supabaseUrl, supabaseHeaders, user);
    if (!userGuid) {
      return Response.json({ accounts: [] });
    }

    const apiKey = Deno.env.get('MX_API');
    const clientId = Deno.env.get('MX_CLIENT');
    const apiVersion = Deno.env.get('MX_API_VERSION') || 'v20250224';
    const authHeader = `Basic ${btoa(`${clientId}:${apiKey}`)}`;

    const response = await base44.asServiceRole.integrations.custom.call('mx', 'get:/users/{user_identifier}/accounts', {
      pathParams: { user_identifier: userGuid },
      queryParams: { page: 1, records_per_page: 50 },
      payload: {},
      headers: {
        'Authorization': authHeader,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Accept-Version': apiVersion,
      },
    });

    if (!response.success) {
      return Response.json({ accounts: [] });
    }

    return Response.json({ accounts: response.data?.accounts || [] });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});