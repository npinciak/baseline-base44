import { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';

export default function useGoalPlan(goalId) {
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    base44.entities.GoalPlan.filter({ supabase_goal_id: goalId })
      .then(rows => setPlan(rows[0] || null))
      .finally(() => setLoading(false));
  }, [goalId]);

  const save = useCallback(async (changes) => {
    setSaving(true);
    const next = plan
      ? await base44.entities.GoalPlan.update(plan.id, changes)
      : await base44.entities.GoalPlan.create({ supabase_goal_id: goalId, ...changes });
    setPlan(next);
    setSaving(false);
  }, [plan, goalId]);

  return { plan, loading, saving, save };
}