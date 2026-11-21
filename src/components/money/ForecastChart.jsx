import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, CartesianGrid } from 'recharts';
import { Telescope, Zap, RotateCcw } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import FeaturePanel from '@/components/money/FeaturePanel';
import GoalSlider from '@/components/money/GoalSlider';
import ForecastProgressHero from '@/components/money/ForecastProgressHero';
import ScenarioChips from '@/components/money/ScenarioChips';
import { money } from '@/lib/goalPlan';
import { monthlyFromPlan, monthsToTarget, balanceSeries, monthLabel, fullDate } from '@/lib/goalForecast';

const SAMPLE_GOAL = { id: 'sample', name: 'Emergency Fund', target_amount: 3000, current_amount: 600, sample: true };
const isEmergency = (g) => g.goal_type === 'emergency' || /emergency/i.test(g.name || '');

function ForecastTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  return (
    <div className="rounded-xl border border-white/15 bg-black/90 backdrop-blur px-3 py-2 text-xs shadow-xl">
      <p className="text-white/60 mb-1">{monthLabel(p.m)}</p>
      <p className="text-white font-bold text-sm">{money(p.scenario)}</p>
      {p.base !== p.scenario && <p className="text-white/50">Current plan: {money(p.base)}</p>}
    </div>
  );
}

export default function ForecastChart({ live = false }) {
  const [goals, setGoals] = useState(live ? null : [SAMPLE_GOAL]);
  const [goalId, setGoalId] = useState(null);
  const [baseMonthly, setBaseMonthly] = useState(100);
  const [monthly, setMonthly] = useState(100);
  const [rate, setRate] = useState(0);

  useEffect(() => {
    if (!live) return;
    base44.functions.invoke('getSupabaseGoals', {})
      .then(res => {
        const active = (res.data?.goals || []).filter(g => !g.archived && Number(g.target_amount) > 0);
        setGoals(active.length ? active : [SAMPLE_GOAL]);
      })
      .catch(() => setGoals([SAMPLE_GOAL]));
  }, [live]);

  const goal = goals && (goals.find(g => g.id === goalId) || goals.find(isEmergency) || goals[0]);

  useEffect(() => {
    if (!goal) return;
    const apply = (amt) => { const v = Math.round(amt) || 100; setBaseMonthly(v); setMonthly(v); setRate(0); };
    if (goal.sample) { apply(100); return; }
    base44.entities.GoalPlan.filter({ supabase_goal_id: goal.id })
      .then(rows => apply(monthlyFromPlan(rows[0])))
      .catch(() => apply(100));
  }, [goal?.id]);

  const calc = useMemo(() => {
    if (!goal) return null;
    const saved = Number(goal.current_amount) || 0;
    const target = Number(goal.target_amount);
    const baseM = monthsToTarget({ saved, target, monthly: baseMonthly, rate: 0 });
    const scenM = monthsToTarget({ saved, target, monthly, rate });
    const horizon = Math.max(6, Math.min(120, Math.max(baseM ?? 120, scenM ?? 120)));
    const base = balanceSeries({ saved, monthly: baseMonthly, rate: 0, months: horizon });
    const scen = balanceSeries({ saved, monthly, rate, months: horizon });
    const data = base.map((b, m) => ({ m, base: Math.min(b, target * 1.15), scenario: Math.min(scen[m], target * 1.15) }));
    return { saved, target, baseM, scenM, horizon, data };
  }, [goal, baseMonthly, monthly, rate]);

  if (!calc) {
    return <FeaturePanel icon={Telescope} kicker="Future view"><div className="h-80 flex items-center justify-center"><div className="w-7 h-7 border-4 border-white/10 border-t-[#2EFD7A] rounded-full animate-spin" /></div></FeaturePanel>;
  }

  const { saved, target, baseM, scenM, horizon, data } = calc;
  const changed = monthly !== baseMonthly || rate !== 0;
  const sooner = baseM !== null && scenM !== null ? baseM - scenM : null;
  const pct = Math.min(100, Math.round((saved / target) * 100));
  const contribMax = Math.max(1000, Math.ceil((baseMonthly * 3) / 50) * 50);

  return (
    <FeaturePanel icon={Telescope} kicker="Future view" action={goals.length > 1 && (
      <div className="flex flex-wrap gap-1 bg-white/[0.05] rounded-xl p-1">
        {goals.map(g => (
          <button key={g.id} onClick={() => setGoalId(g.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${goal.id === g.id ? 'bg-[#2EFD7A] text-black' : 'text-white/60 hover:text-white'}`}>
            {g.name}
          </button>
        ))}
      </div>
    )}>
      <ForecastProgressHero goal={goal} saved={saved} target={target} monthly={monthly} rate={rate} />
      <div className="flex flex-wrap items-end justify-between gap-4 mb-2">
        <div>
          <p className="text-white/60 text-sm">At this pace, you could reach <span className="text-white font-semibold">{goal.name}</span> by</p>
          <motion.p key={scenM} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="text-4xl sm:text-6xl font-display font-extrabold text-white leading-tight">
            {scenM === null ? 'Not yet' : scenM === 0 ? 'Today' : fullDate(scenM)}
          </motion.p>
          <p className="flex items-center gap-1.5 text-sm font-semibold text-[#2EFD7A]">
            {changed && sooner > 0 ? <><Zap className="w-4 h-4" />{sooner} month{sooner === 1 ? '' : 's'} sooner than your current plan</>
              : scenM === null ? <span className="text-white/60 font-normal">Add a monthly amount to see a date.</span>
              : <span className="text-white/60 font-normal">{scenM} month{scenM === 1 ? '' : 's'} at your current plan</span>}
          </p>
        </div>
      </div>

      <div className="h-64 sm:h-80 -mx-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 20, right: 24, left: 8, bottom: 0 }}>
            <defs>
              <linearGradient id="fcFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2EFD7A" stopOpacity={0.55} />
                <stop offset="100%" stopColor="#2EFD7A" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis dataKey="m" type="number" domain={[0, horizon]} tickCount={6} tickFormatter={monthLabel} stroke="rgba(255,255,255,0.35)" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis tickFormatter={(v) => (v >= 1000 ? `$${Math.round(v / 100) / 10}k` : `$${Math.round(v)}`)} stroke="rgba(255,255,255,0.35)" fontSize={11} tickLine={false} axisLine={false} width={48} domain={[0, 'auto']} />
            <Tooltip content={<ForecastTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.3)', strokeDasharray: '4 4' }} />
            <ReferenceLine y={target} stroke="#F5A623" strokeDasharray="6 4" label={{ value: `Goal ${money(target)}`, position: 'insideTopLeft', fill: '#F5A623', fontSize: 11 }} />
            {changed && <Area type="monotone" dataKey="base" stroke="rgba(255,255,255,0.4)" strokeDasharray="5 5" strokeWidth={1.5} fill="none" dot={false} isAnimationActive={false} />}
            <Area type="monotone" dataKey="scenario" stroke="#2EFD7A" strokeWidth={3} fill="url(#fcFill)" dot={false} animationDuration={600} />
            {scenM !== null && <ReferenceLine x={scenM} stroke="#2EFD7A" strokeOpacity={0.6} />}
            {changed && baseM !== null && baseM !== scenM && <ReferenceLine x={baseM} stroke="rgba(255,255,255,0.35)" strokeDasharray="4 4" />}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4 space-y-5">
        <div>
          <p className="text-white font-semibold text-sm mb-2">Try a hopeful scenario</p>
          <ScenarioChips saved={saved} target={target} baseMonthly={baseMonthly} baseMonths={baseM} monthly={monthly} rate={rate}
            onPick={(s) => { setMonthly(Math.min(s.monthly, contribMax)); setRate(s.rate); }} />
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <GoalSlider label="What if my growth rate changes?" valueLabel={`${rate.toFixed(1)}% / yr`} value={rate} onChange={setRate}
            min={0} max={12} step={0.5} minLabel="0% (cash)" maxLabel="12%" />
          <GoalSlider label="What if I saved more?" valueLabel={`${money(monthly)} / mo`} value={monthly} onChange={setMonthly}
            min={0} max={contribMax} step={10} minLabel="$0" maxLabel={money(contribMax)} />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-white/10">
          <p className="text-[11px] text-white/60 max-w-2xl">
            {goal.sample ? 'Sample goal shown. ' : ''}Growth rates are illustrative, not guaranteed. Real returns change over time and can be lower. Nothing here changes your saved goal.
          </p>
          {changed && (
            <button onClick={() => { setMonthly(baseMonthly); setRate(0); }} className="flex items-center gap-1 text-xs text-[#2EFD7A] hover:underline">
              <RotateCcw className="w-3 h-3" /> Back to current plan
            </button>
          )}
        </div>
      </div>
    </FeaturePanel>
  );
}