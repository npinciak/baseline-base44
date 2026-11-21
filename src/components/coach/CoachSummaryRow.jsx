import { Sparkles, ChevronDown, Wand2, TrendingUp } from 'lucide-react';

const QUICK = ['Where did my money go?', 'Which subscriptions could I cut?', 'How can I save $50?'];

export default function CoachSummaryRow({ open, onToggle, onQuickAsk, onOpenTab, cleanupCount, trendCount }) {
  return (
    <div className="p-5 sm:p-6">
      <div className="flex items-start gap-4">
        <span className="w-11 h-11 rounded-2xl bg-[#2EFD7A]/15 flex items-center justify-center shrink-0">
          <Sparkles className="w-5 h-5 text-[#2EFD7A]" />
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] uppercase tracking-[0.25em] text-[#2EFD7A] font-semibold">Money Coach</p>
          <h3 className="text-xl font-display font-bold text-white">Your money, explained.</h3>
          <p className="text-sm text-white/55 mt-0.5">Ask a question or review what the coach spotted. Suggestions only.</p>
        </div>
        <button type="button" onClick={onToggle} aria-expanded={open}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/15 text-xs font-semibold text-white/80 hover:border-[#2EFD7A]/60 hover:text-white transition-all shrink-0">
          {open ? 'Close' : 'Open coach'}
          <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {!open && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button onClick={() => onOpenTab('cleanup')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.06] text-xs text-white/80 hover:bg-white/10 transition-colors">
            <Wand2 className="w-3.5 h-3.5 text-[#2EFD7A]" /> {cleanupCount} cleanup idea{cleanupCount === 1 ? '' : 's'}
          </button>
          <button onClick={() => onOpenTab('trends')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.06] text-xs text-white/80 hover:bg-white/10 transition-colors">
            <TrendingUp className="w-3.5 h-3.5 text-[#2EFD7A]" /> {trendCount} trend{trendCount === 1 ? '' : 's'}
          </button>
          <span className="hidden sm:block w-px h-5 bg-white/10 mx-1" />
          {QUICK.map(q => (
            <button key={q} onClick={() => onQuickAsk(q)} className="px-3 py-1.5 rounded-full border border-white/15 text-xs text-white/80 hover:border-[#2EFD7A]/60 hover:text-white transition-all">{q}</button>
          ))}
        </div>
      )}
    </div>
  );
}