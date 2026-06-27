import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const baseUrl = 'https://int-api.mx.com';
    const baseAuth = Deno.env.get('MX_BASE_AUTH');
    const apiKey = Deno.env.get('MX_API');
    const clientId = Deno.env.get('MX_CLIENT');
    const apiVersion = Deno.env.get('MX_API_VERSION');

    // Always build from hardcoded correct credentials
    const CLIENT_ID = '78480d58-2353-4403-8029-980413bd4e38';
    const API_KEY = 'cbf9262fc43347044d9e45e6882805e0f952f813';
    const authHeader = `Basic ${btoa(`${CLIENT_ID}:${API_KEY}`)}`;

    const res = await fetch(`${baseUrl}/users?page=1&records_per_page=10`, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Accept-Version': apiVersion || 'v20250224',
      },
    });

    const text = await res.text();
    let data;
    try { data = JSON.parse(text); } catch { data = text; }

    return Response.json({
      status: res.status,
      authHeader,
      baseUrl,
      apiVersion,
      data,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});