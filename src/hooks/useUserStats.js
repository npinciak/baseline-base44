import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';

/** Loads the signed-in user's stats record (BaseScore, streaks, XP). */
export default function useUserStats() {
  const [state, setState] = useState({ loading: true, stats: null });
  useEffect(() => {
    base44.auth.me()
      .then((u) => base44.entities.UserStats.filter({ user_id: u.id }))
      .then((rows) => setState({ loading: false, stats: rows[0] || null }));
  }, []);
  return state;
}