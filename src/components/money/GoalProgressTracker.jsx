import { Link } from 'react-router-dom';

export default function GoalProgressTracker({ goal }) {
  const current = Math.max(0, Number(goal.current_amount) || 0);
  const target = Math.max(0, Number(goal.target_amount) || 0);
  const percent = target ? Math.min(100, Math.round(current / target * 100)) : 0;
  const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: goal.currency_code || 'USD', maximumFractionDigits: 0 });
  const subject = `${goal.goal_type || ''} ${goal.name || ''}`.toLowerCase();
  const fallback = /vacation|travel|france|india|screening/.test(subject)
    ? 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&auto=format&fit=crop'
    : /car|truck/.test(subject)
      ? 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=400&auto=format&fit=crop'
      : /home|house/.test(subject)
        ? 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400&auto=format&fit=crop'
        : 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=400&auto=format&fit=crop';
  return (
    <Link to={`/money/goals/${goal.id}`} aria-label={`Manage ${goal.name}, ${percent}% saved`} className="group flex min-w-0 overflow-hidden rounded-2xl border border-border bg-background/60 text-foreground transition-colors hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset">
      <img src={goal.image || fallback} alt={goal.name} onError={event => { event.currentTarget.onerror = null; event.currentTarget.src = fallback; }} className="w-24 sm:w-32 h-32 sm:h-36 shrink-0 object-cover" />
      <div className="min-w-0 flex-1 flex flex-col justify-center gap-3 p-4 sm:px-6">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-semibold text-base sm:text-lg leading-snug line-clamp-2">{goal.name}</h3>
          <span className="text-sm font-semibold text-primary tabular-nums shrink-0">{percent}%</span>
        </div>
        <div className="space-y-2">
          <p className="text-xs sm:text-sm text-muted-foreground"><span className="font-semibold text-foreground">{money.format(current)}</span> of {money.format(target)}</p>
          <div role="progressbar" aria-label={`${goal.name} savings progress`} aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100} className="h-1.5 rounded-full bg-secondary overflow-hidden">
            <div className="h-full rounded-full bg-primary" style={{ width: `${percent}%` }} />
          </div>
        </div>
      </div>
    </Link>
  );
}