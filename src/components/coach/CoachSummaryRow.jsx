import { Sparkles, ChevronDown } from 'lucide-react';

export default function CoachSummaryRow({ open, onToggle, cleanupCount, trendCount }) {
  const bits = [
    cleanupCount ? `${cleanupCount} cleanup idea${cleanupCount === 1 ? '' : 's'}` : null,
    trendCount ? `${trendCount} trend${trendCount === 1 ? '' : 's'}` : null,
  ].filter(Boolean);
  return (
    <button type="button" onClick={onToggle} aria-expanded={open}
      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/[0.03] transition-colors">
      <span className="w-9 h-9 rounded-xl bg-[#2EFD7A]/15 flex items-center justify-center shrink-0">
        <Sparkles className="w-4 h-4 text-[#2EFD7A]" />
      </span>
      <span className="flex-1 min-w-0">
        <span className="block text-sm font-heading font-bold text-white">Money Coach</span>
        <span className="block text-xs text-white/50 truncate">
          {bits.length ? `${bits.join(' · ')} · ask anything about your money` : 'Ask anything about your money'}
        </span>
      </span>
      <span className="hidden sm:inline text-xs font-semibold text-[#2EFD7A]">{open ? 'Close' : 'Open'}</span>
      <ChevronDown className={`w-4 h-4 text-white/60 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
    </button>
  );
}