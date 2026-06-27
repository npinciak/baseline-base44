import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const baseUrl = Deno.env.get('MX_BASE_URL');
    const baseAuth = Deno.env.get('MX_BASE_AUTH');
    const apiKey = Deno.env.get('MX_API');
    const clientId = Deno.env.get('MX_CLIENT');
    const apiVersion = Deno.env.get('MX_API_VERSION');

    // Build Basic auth from client:api if MX_BASE_AUTH not set
    const credString = baseAuth || btoa(`${clientId}:${apiKey}`);
    const authHeader = `Basic ${credString}`;

    const res = await fetch(`${baseUrl}/users?page=1&records_per_page=10`, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Accept': apiVersion || 'application/vnd.mx.api.v1+json',
        'Content-Type': 'application/json',
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