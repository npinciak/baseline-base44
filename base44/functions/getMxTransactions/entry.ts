import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { userGuid } = await req.json();
    if (!userGuid) return Response.json({ error: 'userGuid is required' }, { status: 400 });

    const apiKey = Deno.env.get('MX_API');
    const clientId = Deno.env.get('MX_CLIENT');
    const apiVersion = Deno.env.get('MX_API_VERSION') || 'v20250224';
    const authHeader = `Basic ${btoa(`${clientId}:${apiKey}`)}`;

    const response = await base44.asServiceRole.integrations.custom.call('mx', `get:/users/{user_identifier}/transactions`, {
      pathParams: { user_identifier: userGuid },
      queryParams: { page: 1, records_per_page: 500 },
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