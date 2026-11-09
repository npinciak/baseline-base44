import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import { isOwner } from '../../shared/ownerAccess.ts';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (!isOwner(user)) return Response.json({ error: 'Forbidden' }, { status: 403 });

    const apiKey = Deno.env.get('MX_API');
    const clientId = Deno.env.get('MX_CLIENT');
    const apiVersion = Deno.env.get('MX_API_VERSION') || 'v20250224';

    if (!apiKey || !clientId) {
      console.error('MX credentials are not configured');
      return Response.json({ success: false, error: 'MX credentials are not configured' }, { status: 500 });
    }

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

    // Diagnostics stay server-side: never echo credentials or MX user data back.
    console.log('MX connectivity check', { status: response.status_code, success: response.success });

    return Response.json({ status: response.status_code, success: response.success });
  } catch (error) {
    console.error('MX connectivity check failed:', error.message);
    return Response.json({ success: false, error: 'MX connectivity check failed' }, { status: 500 });
  }
});