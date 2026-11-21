import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import GoalTimeline from '@/components/money/GoalTimeline';

function encouragement(percent, toNext, nextStop, money) {
  if (percent >= 100) return 'You did it. This goal is fully funded.';
  if (percent === 0) return `Your first ${money.format(toNext)} unlocks the ${nextStop}% milestone. Every journey starts here.`;
  return `Just ${money.format(toNext)} more to hit ${nextStop}%. Keep the momentum going.`;
}

export default function GoalProgressTracker({ goal }) {
  const current = Math.max(0, Number(goal.current_amount) || 0);
  const target = Math.max(0, Number(goal.target_amount) || 0);
  const percent = target ? Math.min(100, Math.round(current / target * 100)) : 0;
  const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: goal.currency_code || 'USD', maximumFractionDigits: 0 });
  const nextStop = [25, 50, 75, 100].find(s => s > percent) || 100;
  const toNext = Math.max(0, target * nextStop / 100 - current);
  const subject = `${goal.goal_type || ''} ${goal.name || ''}`.toLowerCase();
  const fallback = /vacation|travel|france|india|screening/.test(subject)
    ? 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop'
    : /car|truck/.test(subject)
      ? 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=600&auto=format&fit=crop'
      : /home|house/.test(subject)
        ? 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=600&auto=format&fit=crop'
        : 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=600&auto=format&fit=crop';
  return (
    <Link to={`/money/goals/${goal.id}`} aria-label={`Manage ${goal.name}, ${percent}% saved`} className="group relative flex flex-col sm:flex-row min-w-0 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#022C22]/70 via-black to-black text-foreground transition-all hover:border-[#2EFD7A]/40 hover:shadow-[0_0_40px_rgba(16,185,129,0.15)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2EFD7A] focus-visible:ring-inset">
      <div className="relative sm:w-56 h-36 sm:h-auto shrink-0 overflow-hidden">
        <img src={goal.image || fallback} alt={goal.name} onError={event => { event.currentTarget.onerror = null; event.currentTarget.src = fallback; }} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t sm:bg-gradient-to-r from-transparent via-black/20 to-black/90" />
      </div>
      <div className="relative min-w-0 flex-1 p-5 sm:p-7 space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-widest text-white/45">Your goal</p>
            <h3 className="text-xl sm:text-2xl font-display font-bold text-white truncate">{goal.name}</h3>
          </div>
          <ArrowUpRight className="w-5 h-5 text-white/30 group-hover:text-[#2EFD7A] transition-colors shrink-0" />
        </div>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-4xl sm:text-5xl font-display font-extrabold text-white tabular-nums leading-none">{money.format(current)}</p>
            <p className="text-sm text-white/50 mt-2">saved of <span className="text-white/80 font-semibold">{money.format(target)}</span></p>
          </div>
          <p className="text-5xl sm:text-6xl font-display font-extrabold tabular-nums leading-none bg-gradient-to-br from-[#2EFD7A] to-[#10B981] bg-clip-text text-transparent">{percent}%</p>
        </div>
        <div role="progressbar" aria-label={`${goal.name} savings progress`} aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}>
          <GoalTimeline percent={percent} target={target} money={money} />
        </div>
        <p className="text-sm text-white/70">{encouragement(percent, toNext, nextStop, money)}</p>
      </div>
    </Link>
  );
}