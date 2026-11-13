import { Lock, ChevronRight } from 'lucide-react';
import { TOOL_GROUPS } from '@/lib/curriculum';

/** Compact index of every Money tool, grouped by job, with lock status. */
export default function ToolInventory({ tools }) {
  const jump = (key) => document.getElementById(key)?.scrollIntoView({ behavior: 'smooth' });
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {TOOL_GROUPS.map((g) => (
        <div key={g.key} className="min-w-0 rounded-2xl bg-white/[0.03] border border-white/10 p-3">
          <p className="text-white/50 text-[11px] uppercase tracking-widest px-2 pt-1 pb-2">{g.label}</p>
          {tools.filter((t) => t.access.group === g.key).map((t) => (
            <button key={t.key} onClick={() => jump(t.key)}
              className="w-full flex items-center justify-between gap-2 px-2 py-2 rounded-xl text-left text-sm hover:bg-white/[0.05] transition-colors group">
              <span className={t.access.unlocked ? 'text-white' : 'text-white/50'}>{t.access.label}</span>
              {t.access.unlocked
                ? <ChevronRight className="w-4 h-4 text-white/30 group-hover:text-[#2EFD7A] transition-colors" />
                : <span className="flex items-center gap-1 text-[11px] text-white/40 shrink-0"><Lock className="w-3 h-3" />Ch. {t.access.chapter?.number}</span>}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}