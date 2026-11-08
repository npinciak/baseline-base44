import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { name, goal_type, image, target_amount, current_amount, target_date, currency_code } = body;
    if (typeof name !== 'string' || !name.trim() || !Number.isFinite(target_amount) || target_amount <= 0 || (current_amount != null && (!Number.isFinite(current_amount) || current_amount < 0))) {
      return Response.json({ error: 'A name and positive target amount are required.' }, { status: 400 });
    }
    const existing = await base44.functions.invoke('getSupabaseGoals', {});
    const { goals, userProfileId } = existing.data || {};
    if (!userProfileId || !Array.isArray(goals)) return Response.json({ error: 'Could not resolve your savings profile.' }, { status: 409 });
    if (goals.length >= 2) return Response.json({ code: 'GOAL_LIMIT', error: 'Your free plan includes two savings goals. Upgrade to add more.' }, { status: 403 });

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
      signal: AbortSignal.timeout(15000),
    });

    const result = await res.json();
    if (!res.ok) return Response.json({ error: result }, { status: res.status });
    return Response.json({ goal: result[0] });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}