import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const headers = {
      'apikey': serviceKey,
      'Authorization': `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation',
    };

    const res = await fetch(`${supabaseUrl}/rest/v1/heartbeat`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ created_at: new Date().toISOString() }),
    });

    const data = await res.json();

    if (!res.ok) {
      return Response.json({ error: data }, { status: res.status });
    }

    return Response.json({ success: true, record: data[0] });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});