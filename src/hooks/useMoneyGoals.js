import { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';

export default function useMoneyGoals(learning) {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [creating, setCreating] = useState(false);
  const [upgrade, setUpgrade] = useState(false);
  const chapter = learning.chapters.find(c => c.id === 'money-in');
  const emergency = goals.find(g => /emergency/i.test(g.name));
  const unlocked = !!(chapter?.learned || chapter?.moveDone);
  const load = useCallback(async () => {
    setError('');
    try {
      const res = await base44.functions.invoke('getSupabaseGoals', {});
      if (!Array.isArray(res.data.goals)) throw new Error('Could not load goals.');
      setGoals(res.data.goals);
    } catch { setError('Could not load your goals. Please try again.'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);
  const open = () => { setError(''); if (goals.length >= 2) setUpgrade(true); else setCreating(true); };
  const save = async (form) => {
    setSaving(true); setError('');
    try {
      const result = await base44.functions.invoke('createSupabaseGoal', {
        name: !emergency && unlocked ? 'Emergency Fund' : form.name.trim(), goal_type: 'other',
        target_amount: Number(form.target_amount), current_amount: Number(form.saved_amount) || 0,
        target_date: form.target_date || null, currency_code: 'USD',
      });
      if (!result.data.goal) throw new Error(result.data.error || 'Goal was not saved.');
      await load(); setCreating(false);
      if (!emergency && unlocked && !chapter.moveDone) await learning.completeMove(chapter);
    } catch (e) {
      if (e.response?.data?.code === 'GOAL_LIMIT') { setCreating(false); setUpgrade(true); }
      else setError('Could not save your goal. Please try again.');
    } finally { setSaving(false); }
  };
  const confirmEmergency = async () => {
    setSaving(true); setError('');
    try { await learning.completeMove(chapter); }
    catch { setError('Your goal is saved, but the money move could not be completed. Please try again.'); }
    finally { setSaving(false); }
  };
  return { goals, loading, error, saving, creating, setCreating, upgrade, setUpgrade, chapter, emergency, unlocked, load, open, save, confirmEmergency };
}