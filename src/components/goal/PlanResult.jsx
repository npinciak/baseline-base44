import { Flag, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { money } from '@/lib/goalPlan';

export default function PlanResult({ p, amount, onUseNeeded }) {
  if (p.remaining === 0) {
    return <p className="text-sm text-[#2EFD7A] font-semibold">You've fully funded this goal. Time to celebrate!</p>;
  }
  if (!(amount > 0)) {
    return <p className="text-sm text-white/50">Enter an amount to see when you'll get there.</p>;
  }
  const Icon = p.onTrack === false ? AlertTriangle : p.onTrack ? CheckCircle2 : Flag;
  const tone = p.onTrack === false ? 'text-amber-300 border-amber-400/25 bg-amber-400/[0.06]' : 'text-[#2EFD7A] border-[#2EFD7A]/25 bg-[#2EFD7A]/[0.06]';
  return (
    <div className={`rounded-xl border p-4 ${tone}`}>
      <div className="flex items-start gap-3">
        <Icon className="w-5 h-5 shrink-0 mt-0.5" />
        <div className="text-sm text-white/80 space-y-1">
          <p>
            Saving <strong className="text-white">{money(amount)}</strong> per {p.f.unit}, you'll reach your goal around{' '}
            <strong className="text-white">{p.finishLabel}</strong> ({p.periods} {p.f.unit}{p.periods === 1 ? '' : 's'}).
          </p>
          {p.onTrack === true && <p>That's ahead of your {p.deadlineLabel} target. Nice.</p>}
          {p.onTrack === false && p.needed && (
            <p>
              To hit {p.deadlineLabel}, aim for <strong className="text-white">{money(p.needed)}</strong> per {p.f.unit}.{' '}
              <button onClick={() => onUseNeeded(p.needed)} className="underline font-semibold text-amber-200 hover:text-white">Use this amount</button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}