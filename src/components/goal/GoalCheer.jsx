import { Sparkles } from 'lucide-react';
import { money } from '@/lib/goalPlan';

function message(pct) {
  if (pct >= 100) return 'You did it. This goal is fully funded!';
  if (pct >= 75) return 'The finish line is in sight. Keep going!';
  if (pct >= 50) return "You're over halfway there. That's real momentum.";
  if (pct >= 25) return "A quarter of the way. You're building something.";
  if (pct > 0) return "You've started, and that's the hardest part.";
  return 'Every goal starts at zero. Set your plan below and make the first move.';
}

export default function GoalCheer({ saved, target }) {
  const pct = target > 0 ? Math.min(100, Math.round((saved / target) * 100)) : 0;
  return (
    <div className="px-5 py-4 border-t border-white/10 space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="flex items-center gap-1.5 text-white/80 font-medium"><Sparkles className="w-3.5 h-3.5 text-[#2EFD7A]" /> {message(pct)}</span>
        <span className="text-white/50 shrink-0 ml-3">{money(saved)} / {money(target)}</span>
      </div>
      <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
        <div className="h-full rounded-full bg-gradient-to-r from-[#047857] to-[#2EFD7A] transition-all duration-700" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}