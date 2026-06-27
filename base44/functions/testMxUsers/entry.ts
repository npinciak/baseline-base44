import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const res = await base44.integrations.custom.call('mx', 'get:/users', {
      queryParams: { page: 1, records_per_page: 10 }
    });

    return Response.json({ status: res.status_code, data: res.data });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});