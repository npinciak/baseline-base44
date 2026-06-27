import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const apiKey = Deno.env.get('MX_API');
    const clientId = Deno.env.get('MX_CLIENT');
    const apiVersion = Deno.env.get('MX_API_VERSION') || 'v20250224';
    const authHeader = `Basic ${btoa(`${clientId}:${apiKey}`)}`;

    const response = await base44.asServiceRole.integrations.custom.call('mx', 'get:/users', {
      queryParams: { page: 1, records_per_page: 10 },
      payload: {},
      headers: {
        'Authorization': authHeader,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Accept-Version': apiVersion,
      },
    });

    return Response.json({
      status: response.status_code,
      success: response.success,
      authHeader,
      apiVersion,
      data: response.data,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});