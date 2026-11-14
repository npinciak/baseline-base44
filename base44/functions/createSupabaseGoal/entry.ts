import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { secrets } from 'base44:runtime';
import { goalSubscription, requireGoalLessons, freeGoalId } from '../../shared/goalPolicy.ts';

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
    const { paid } = await goalSubscription(base44, user);
    if (!paid && goals.length >= 1) return Response.json({ code: 'GOAL_LIMIT', error: 'Your free plan includes one emergency fund. Additional goals require an active subscription.' }, { status: 403 });
    if (!await requireGoalLessons(base44, user)) return Response.json({ code:'CHAPTER_REQUIRED', error:'Complete every lesson in Money In before setting up your emergency fund.' }, {status:403});
    const supabaseUrl = secrets.get('SUPABASE_URL');
    const serviceRoleKey = secrets.get('SUPABASE_SERVICE_ROLE_KEY');

    const payload = {
      ...(!paid ? { id: await freeGoalId(userProfileId) } : {}),
      name: !paid ? 'Emergency Fund' : name.trim(),
      goal_type: !paid ? 'emergency' : goal_type || null,
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
    if (res.status === 409 && !paid) return Response.json({code:'GOAL_LIMIT',error:'Your emergency fund already exists. Additional goals require a subscription.'},{status:403});
    if (!res.ok) return Response.json({ error: result }, { status: res.status });
    return Response.json({ goal: result[0] });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}