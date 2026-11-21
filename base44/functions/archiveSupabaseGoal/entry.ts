import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const { supabaseGoalId } = await req.json().catch(() => ({}));
    if (!supabaseGoalId) return Response.json({ error: 'supabaseGoalId required' }, { status: 400 });

    const existing = await base44.functions.invoke('getSupabaseGoals', {});
    const goal = existing.data?.goals?.find((g) => g.id === supabaseGoalId);
    if (!goal) return Response.json({ error: 'Goal not found' }, { status: 404 });
    if (goal.archived) return Response.json({ error: 'Goal is already in your Trophy Case.' }, { status: 409 });
    const target = Number(goal.target_amount) || 0;
    if (!target || (Number(goal.current_amount) || 0) < target) {
      return Response.json({ error: 'Only fully funded goals can be archived.' }, { status: 400 });
    }

    const trophy = await base44.asServiceRole.entities.GoalTrophy.create({
      user_id: user.id,
      supabase_goal_id: goal.id,
      name: goal.name,
      target_amount: target,
      currency_code: goal.currency_code || 'USD',
      image: goal.image || '',
      archived_at: new Date().toISOString(),
    });
    return Response.json({ trophy });
  } catch (error) {
    console.error('archiveSupabaseGoal failed', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}