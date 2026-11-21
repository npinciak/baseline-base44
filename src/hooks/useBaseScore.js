import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { applyBasePathProgress } from '@/lib/baseScoreProgress';

/** The signed-in user's BaseScore with BasePath lesson and Money Move growth applied. */
export default function useBaseScore() {
  const [state, setState] = useState({ loading: true, raw: null, progress: [], moves: [] });

  useEffect(() => {
    let alive = true;
    const load = async () => {
      const u = await base44.auth.me();
      const [rows, progress, moves] = await Promise.all([
        base44.entities.UserStats.filter({ user_id: u.id }),
        base44.entities.UserProgress.filter({ user_id: u.id }),
        base44.entities.MoneyMoveCompletion.filter({ user_id: u.id }),
      ]);
      if (alive) setState({ loading: false, raw: rows[0] || null, progress, moves });
    };
    load();
    const onSaved = (e) => e.detail?.stats && setState((s) => ({ ...s, raw: e.detail.stats }));
    window.addEventListener('basescore-saved', onSaved);
    return () => { alive = false; window.removeEventListener('basescore-saved', onSaved); };
  }, []);

  return { loading: state.loading, stats: applyBasePathProgress(state.raw, state.progress, state.moves) };
}