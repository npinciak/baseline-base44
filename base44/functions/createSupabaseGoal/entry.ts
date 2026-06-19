import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { name, goal_type, image, target_amount, current_amount, target_date, currency_code, userProfileId } = body;

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    const payload = {
      name,
      goal_type: goal_type || null,
      image: image || null,
      target_amount: target_amount || 0,
      current_amount: current_amount || 0,
      target_date: target_date || null,
      currency_code: currency_code || 'USD',
      user_profile_id: userProfileId,
    };

    const res = await fetch(`${supabaseUrl}/rest/v1/goals`, {
      method: 'POST',
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