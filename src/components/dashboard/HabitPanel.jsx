import { Link } from 'react-router-dom';
import { BookOpen, PiggyBank, ArrowRight } from 'lucide-react';

function HabitCard({ to, Icon, tone, kicker, title, detail, pct, cta }) {
  const isBlue = tone === 'blue';
  const color = isBlue ? '#2EA0FD' : '#2EFD7A';
  return (
    <Link
      to={to}
      className="group relative flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition-all hover:border-white/30 hover:bg-white/[0.06]"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${color}1f` }}>
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
        <p className="text-[11px] tracking-widest uppercase font-semibold" style={{ color }}>{kicker}</p>
      </div>
      <div className="min-w-0">
        <p className="text-white text-lg font-semibold leading-snug truncate">{title}</p>
        <p className="text-white/60 text-sm mt-0.5 truncate">{detail}</p>
      </div>
      <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-white group-hover:gap-2.5 transition-all">
        {cta} <ArrowRight className="w-4 h-4" style={{ color }} />
      </span>
    </Link>
  );
}

export default function HabitPanel({ modules, progress, goals }) {
  const done = new Set(progress.filter((p) => p.completed).map((p) => p.lesson_id));
  const next = modules.find((m) => (m.lessons?.length || 0) > 0 && m.lessons.some((l) => !done.has(l.id))) || modules[0];
  const nextTotal = next?.lessons?.length || 0;
  const nextDone = next ? (next.lessons || []).filter((l) => done.has(l.id)).length : 0;

  const active = goals.filter((g) => (g.current_amount || 0) < g.target_amount);
  const goal = [...active].sort((a, b) => (b.current_amount / b.target_amount) - (a.current_amount / a.target_amount))[0];
  const left = goal ? Math.max(0, goal.target_amount - (goal.current_amount || 0)) : 0;

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-white/60 text-xs font-light tracking-widest uppercase mb-1">Today's habits</h2>
        <p className="text-white text-lg font-light">Learn a little. <span className="font-extrabold">Save a little.</span> Repeat.</p>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <HabitCard
          to={next ? `/lesson/${next.id}` : '/dashboard'}
          Icon={BookOpen}
          tone="blue"
          kicker="Learn"
          title={next ? next.title : 'New lessons coming soon'}
          detail={next ? `${nextDone} of ${nextTotal} lessons done` : 'Check back shortly'}
          pct={nextTotal ? (nextDone / nextTotal) * 100 : 0}
          cta="Do today's lesson"
        />
        <HabitCard
          to={goal ? `/goals/${goal.id}` : '/goals'}
          Icon={PiggyBank}
          tone="green"
          kicker="Save"
          title={goal ? goal.name : 'Set your first savings goal'}
          detail={goal ? `$${Math.round(left).toLocaleString()} left to reach $${Math.round(goal.target_amount).toLocaleString()}` : 'Small, steady deposits add up'}
          pct={goal ? Math.min(100, ((goal.current_amount || 0) / goal.target_amount) * 100) : 0}
          cta={goal ? 'Add to this goal' : 'Create a goal'}
        />
      </div>
    </div>
  );
}