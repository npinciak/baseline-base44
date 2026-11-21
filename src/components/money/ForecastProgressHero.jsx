import { motion } from 'framer-motion';
import { Check, PartyPopper } from 'lucide-react';
import { money } from '@/lib/goalPlan';
import { monthsToTarget, monthLabel } from '@/lib/goalForecast';

const MILESTONES = [25, 50, 75, 100];

/** Leads Future View with what the learner has already done, then the next milestone within reach. */
export default function ForecastProgressHero({ goal, saved, target, monthly, rate }) {
  const pct = Math.min(100, Math.round((saved / target) * 100));
  const next = MILESTONES.find(m => m > pct);
  const nextAmount = next ? (target * next) / 100 : null;
  const nextMonths = nextAmount ? monthsToTarget({ saved, target: nextAmount, monthly, rate }) : null;
  const headline = saved <= 0 ? 'Your first dollar starts the story.' : pct >= 100 ? 'You did it!' : pct >= 50 ? 'More than halfway there.' : 'You’re already on your way.';

  return (
    <div className="rounded-2xl border border-[#2EFD7A]/25 bg-gradient-to-br from-[#2EFD7A]/[0.12] to-transparent p-5 mb-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-[#2EFD7A] flex items-center justify-center shrink-0">
            <PartyPopper className="w-5 h-5 text-black" />
          </div>
          <div>
            <p className="text-white font-bold text-lg leading-tight">{headline}</p>
            <p className="text-white/65 text-sm">
              <span className="text-[#2EFD7A] font-semibold">{money(saved)}</span> saved toward {goal.name}, {pct}% of {money(target)}.
            </p>
          </div>
        </div>
        {next && nextMonths !== null && (
          <p className="text-sm text-white/70">
            Next milestone: <span className="text-white font-semibold">{next}% ({money(nextAmount)})</span>{' '}
            {nextMonths === 0 ? 'this month' : `by ${monthLabel(nextMonths)}`}
          </p>
        )}
      </div>
      <div className="relative mt-4 h-2.5 bg-white/10 rounded-full">
        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1, ease: [0.2, 0.7, 0.2, 1] }}
          className="absolute inset-y-0 left-0 rounded-full bg-[#2EFD7A] shadow-[0_0_16px_#2EFD7A88]" />
        {MILESTONES.map(m => (
          <div key={m} className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2" style={{ left: `${m}%` }}>
            <div className={`w-5 h-5 rounded-full flex items-center justify-center border-2 ${pct >= m ? 'bg-[#2EFD7A] border-[#2EFD7A]' : 'bg-black border-white/25'}`}>
              {pct >= m && <Check className="w-3 h-3 text-black" strokeWidth={3} />}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}