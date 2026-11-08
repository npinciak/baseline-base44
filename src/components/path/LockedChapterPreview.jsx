import { Lock } from 'lucide-react';

/** Names-only preview of a locked chapter's lessons. Content and answers stay hidden. */
export default function LockedChapterPreview({ units }) {
  return (
    <div className="px-5 pb-2">
      <div className="flex items-center gap-2 mb-3 text-white/50">
        <Lock className="w-3.5 h-3.5" />
        <p className="text-xs">Unlocks as you progress. Start the previous chapter to open these lessons.</p>
      </div>
      <ul className="space-y-2">
        {units.map((u, i) => {
          const quizzes = (u.lessons || []).filter((l) => l.lesson_type === 'quiz').length;
          return (
            <li key={u.id} className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2.5">
              <span className="w-6 h-6 rounded-full bg-white/[0.06] flex items-center justify-center text-[10px] font-bold text-white/40 shrink-0">{i + 1}</span>
              <p className="flex-1 min-w-0 text-sm text-white/50 truncate">{u.title}</p>
              {quizzes > 0 && <span className="text-[10px] font-semibold uppercase tracking-wider text-white/35 shrink-0">{quizzes} {quizzes === 1 ? 'quiz' : 'quizzes'}</span>}
              <Lock className="w-3.5 h-3.5 text-white/25 shrink-0" />
            </li>
          );
        })}
      </ul>
    </div>
  );
}