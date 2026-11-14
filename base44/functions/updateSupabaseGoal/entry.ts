import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { goalSubscription } from '../../shared/goalPolicy.ts';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { supabaseGoalId, name, goal_type, image, target_amount, current_amount, target_date } = body;

    if (!supabaseGoalId) return Response.json({ error: 'supabaseGoalId required' }, { status: 400 });
    const existing = await base44.functions.invoke('getSupabaseGoals',{});
    const ownGoal = existing.data?.goals?.find(g=>g.id === supabaseGoalId);
    const profileId = existing.data?.userProfileId;
    if (!ownGoal || !profileId) return Response.json({error:'Goal not found'},{status:404});
    const {paid} = await goalSubscription(base44,user);
    if (!paid && ((name !== undefined && name !== ownGoal.name && name !== 'Emergency Fund') || (goal_type !== undefined && goal_type !== ownGoal.goal_type && goal_type !== 'emergency'))) return Response.json({code:'GOAL_LIMIT',error:'The free goal is an emergency fund. Other goals require a subscription.'},{status:403});
    if ((target_amount !== undefined && (!Number.isFinite(target_amount) || target_amount <= 0)) || (current_amount !== undefined && (!Number.isFinite(current_amount) || current_amount < 0))) return Response.json({error:'Enter valid goal amounts.'},{status:400});

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

    const res = await fetch(`${supabaseUrl}/rest/v1/goals?id=eq.${encodeURIComponent(supabaseGoalId)}&user_profile_id=eq.${encodeURIComponent(profileId)}`, {
      method: 'PATCH',
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