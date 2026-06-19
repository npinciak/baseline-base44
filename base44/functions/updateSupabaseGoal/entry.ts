import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { supabaseGoalId, name, goal_type, image, target_amount, current_amount, target_date } = body;

    if (!supabaseGoalId) return Response.json({ error: 'supabaseGoalId required' }, { status: 400 });

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    const payload = {};
    if (name !== undefined) payload.name = name;
    if (goal_type !== undefined) payload.goal_type = goal_type;
    if (image !== undefined) payload.image = image;
    if (target_amount !== undefined) payload.target_amount = target_amount;
    if (current_amount !== undefined) payload.current_amount = current_amount;
    if (target_date !== undefined) payload.target_date = target_date || null;
    payload.updated_at = new Date().toISOString();

    const res = await fetch(`${supabaseUrl}/rest/v1/goals?id=eq.${supabaseGoalId}`, {
      method: 'PATCH',
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
      },
      body: JSON.stringify(payload),
    });

    const result = await res.json();
    if (!res.ok) return Response.json({ error: result }, { status: res.status });
    return Response.json({ goal: result[0] });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});