import { useState, useEffect } from 'react';
import { motion, animate, useReducedMotion } from 'framer-motion';

export default function GoalProgressTracker({ goal }) {
  const reduce = useReducedMotion();
  const current = Math.max(0, Number(goal.current_amount) || 0);
  const target = Math.max(0, Number(goal.target_amount) || 0);
  const percent = target ? Math.min(100, Math.round(current / target * 100)) : 0;
  const filled = Math.round(percent / 4);
  const [displayPercent, setDisplayPercent] = useState(reduce ? percent : 0);
  useEffect(() => {
    if (reduce) { setDisplayPercent(percent); return; }
    const controls = animate(0, percent, { delay: 0.7, duration: Math.max(0.22, (filled - 1) * 0.045 + 0.22), ease: 'linear', onUpdate: value => setDisplayPercent(Math.round(value)) });
    return () => controls.stop();
  }, [percent, filled, reduce]);
  const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: goal.currency_code || 'USD', maximumFractionDigits: 0 });
  return (
    <motion.section initial={reduce ? false : { opacity: 0, y: 28, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 1 }} className="w-full max-w-2xl mx-auto rounded-2xl bg-background border border-border p-5 sm:p-7 font-body space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-xl sm:text-2xl font-normal leading-tight mb-3 break-words">{goal.name}</h3>
          <span className="inline-flex rounded-full bg-secondary px-3 py-2 text-sm text-foreground">{money.format(current)} / {money.format(target)}</span>
        </div>
        <p className="text-4xl sm:text-6xl font-light tracking-tight tabular-nums text-primary">{displayPercent}%</p>
      </div>
      <ul role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100} aria-label={`${goal.name}: ${percent}% saved`} className="flex gap-1 w-full list-none p-0 m-0">
        {Array.from({ length: 25 }, (_, i) => <motion.li key={i} initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: reduce ? 0 : 0.7 + i * 0.045, duration: 0.22 }} className={i < filled ? 'flex-1 min-w-0 h-12 sm:h-16 rounded-full border-2 border-primary bg-primary' : 'flex-1 min-w-0 h-12 sm:h-16 rounded-full border-2 border-foreground/60'} />)}
      </ul>
    </motion.section>
  );
}