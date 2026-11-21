import { Sparkles } from 'lucide-react';
import { monthsToTarget } from '@/lib/goalForecast';

/** One-tap hopeful "what ifs" that show how much sooner the goal could arrive. */
export default function ScenarioChips({ saved, target, baseMonthly, baseMonths, monthly, rate, onPick }) {
  const scenarios = [
    { label: 'Round up +$25/mo', monthly: baseMonthly + 25, rate: 0 },
    { label: 'Side gig +$100/mo', monthly: baseMonthly + 100, rate: 0 },
    { label: 'High-yield savings ~4%', monthly: baseMonthly, rate: 4 },
  ].map(s => {
    const m = monthsToTarget({ saved, target, monthly: s.monthly, rate: s.rate });
    return { ...s, sooner: baseMonths !== null && m !== null ? baseMonths - m : null };
  });

  return (
    <div className="flex flex-wrap gap-2">
      {scenarios.map(s => {
        const active = s.monthly === monthly && s.rate === rate;
        return (
          <button key={s.label} onClick={() => onPick(s)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-semibold transition-all ${active ? 'bg-[#2EFD7A] text-black border-[#2EFD7A]' : 'bg-white/[0.04] text-white border-white/10 hover:border-[#2EFD7A]/50'}`}>
            <Sparkles className="w-3.5 h-3.5" />
            {s.label}
            {s.sooner > 0 && <span className={active ? 'text-black/70' : 'text-[#2EFD7A]'}>{s.sooner} mo sooner</span>}
          </button>
        );
      })}
    </div>
  );
}