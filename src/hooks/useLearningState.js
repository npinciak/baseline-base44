import { useState, useEffect, useMemo, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { buildChapters } from '@/lib/curriculum';
import useAdminViewMode from '@/hooks/useAdminViewMode';

/** Loads lessons, lesson progress and money-move completions, and derives chapter status. */
export default function useLearningState() {
  const [state, setState] = useState({ loading: true, user: null, modules: [], progress: [], moves: [] });
  const { effectiveIsAdmin } = useAdminViewMode(state.user);

  useEffect(() => {
    const load = async () => {
      const user = await base44.auth.me();
      const [modRes, progress, moves] = await Promise.all([
        base44.functions.invoke('getPayloadLessons', {}).catch(() => null),
        base44.entities.UserProgress.filter({ user_id: user.id }),
        base44.entities.MoneyMoveCompletion.filter({ user_id: user.id }),
      ]);
      setState({ loading: false, user, modules: modRes?.data?.modules || [], progress, moves });
    };
    load();
  }, []);

  const chapters = useMemo(
    () => buildChapters(state.modules, state.progress, state.moves),
    [state.modules, state.progress, state.moves]
  );

  const isAdmin = effectiveIsAdmin;

  const completeMove = useCallback(async (chapter) => {
    if (!chapter?.move || (!isAdmin && (!chapter?.unlocked || !chapter?.learned))) {
      throw new Error('Complete every lesson in this chapter first.');
    }
    if (chapter.moveDone) return;
    const rec = await base44.entities.MoneyMoveCompletion.create({
      user_id: state.user.id,
      move_key: chapter.move.key,
      chapter_id: chapter.id,
      completed_at: new Date().toISOString(),
    });
    setState((s) => ({ ...s, moves: [...s.moves, rec] }));
  }, [state.user, isAdmin]);

  return { ...state, isAdmin, chapters, completeMove };
}