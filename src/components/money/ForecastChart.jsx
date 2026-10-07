import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceDot, CartesianGrid } from 'recharts';
import ScenarioSlider from '@/components/money/ScenarioSlider';
import { Telescope, TrendingUp, TrendingDown } from 'lucide-react';

const HORIZONS = [{ d: 30, l: '1M' }, { d: 90, l: '3M' }, { d: 180, l: '6M' }, { d: 365, l: '1Y' }];
const fmt = (n) => `${n < 0 ? '-' : ''}$${Math.abs(Math.round(n)).toLocaleString()}`;
const dayLabel = (i) => new Date(Date.now() + i * 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

function ForecastTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  return (
    <div className="rounded-xl border border-white/15 bg-black/90 backdrop-blur px-3 py-2 text-xs shadow-xl">
      <p className="text-white/60 mb-1">{dayLabel(p.i)}</p>
      <p className="text-white font-bold text-sm">{fmt(p.scenario)}</p>
      {p.base !== p.scenario && <p className="text-white/50">Current pace: {fmt(p.base)}</p>}
    </div>
  );
}

export default function ForecastChart({ startBalance, dailyIncome, dailySpend }) {
  const [days, setDays] = useState(90);
  const [change, setChange] = useState(0); // % change in spending

  const { data, end, baseEnd, low } = useMemo(() => {
    const spend = dailySpend * (1 + change / 100);
    const rows = Array.from({ length: days + 1 }, (_, i) => ({
      i,
      base: startBalance + i * (dailyIncome - dailySpend),
      scenario: startBalance + i * (dailyIncome - spend),
    }));
    const lowest = rows.reduce((m, r) => (r.scenario < m.scenario ? r : m), rows[0]);
    return { data: rows, end: rows[days].scenario, baseEnd: rows[days].base, low: lowest };
  }, [days, change, startBalance, dailyIncome, dailySpend]);

  const gain = end - startBalance;
  const diff = end - baseEnd;
  const up = gain >= 0;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#06142a] via-black to-black p-5 sm:p-7 shadow-[0_0_60px_-15px_rgba(46,160,253,0.35)]">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-2">
        <div>
          <p className="flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-[#2EA0FD] font-semibold mb-2">
            <Telescope className="w-4 h-4" /> Future view
          </p>
          <p className="text-white/60 text-sm">Where you could be on {dayLabel(days)}</p>
          <motion.p key={`${days}-${Math.round(end)}`} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="text-4xl sm:text-6xl font-display font-extrabold text-white leading-tight">
            {fmt(end)}
          </motion.p>
          <p className={`flex items-center gap-1.5 text-sm font-semibold ${up ? 'text-[#2EFD7A]' : 'text-red-400'}`}>
            {up ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            {up ? '+' : ''}{fmt(gain)} from today
            {change !== 0 && <span className="text-white/50 font-normal">· {diff >= 0 ? '+' : ''}{fmt(diff)} vs. current pace</span>}
          </p>
        </div>
        <div className="flex gap-1 bg-white/[0.05] rounded-xl p-1">
          {HORIZONS.map(h => (
            <button
              key={h.d}
              onClick={() => setDays(h.d)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${days === h.d ? 'bg-[#2EA0FD] text-black' : 'text-white/60 hover:text-white'}`}
            >
              {h.l}
            </button>
          ))}
        </div>
      </div>

      <div className="h-64 sm:h-80 -mx-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 20, right: 24, left: 8, bottom: 0 }}>
            <defs>
              <linearGradient id="fcFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2EA0FD" stopOpacity={0.55} />
                <stop offset="100%" stopColor="#2EA0FD" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="fcStroke" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#2EA0FD" />
                <stop offset="100%" stopColor="#2BF9E9" />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis dataKey="i" type="number" domain={[0, days]} tickCount={6} tickFormatter={dayLabel} stroke="rgba(255,255,255,0.35)" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis tickFormatter={(v) => `$${Math.round(v / 1000)}k`} stroke="rgba(255,255,255,0.35)" fontSize={11} tickLine={false} axisLine={false} width={44} domain={['auto', 'auto']} />
            <Tooltip content={<ForecastTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.3)', strokeDasharray: '4 4' }} />
            {change !== 0 && <Area type="monotone" dataKey="base" stroke="rgba(255,255,255,0.4)" strokeDasharray="5 5" strokeWidth={1.5} fill="none" dot={false} isAnimationActive={false} />}
            <Area type="monotone" dataKey="scenario" stroke="url(#fcStroke)" strokeWidth={3} fill="url(#fcFill)" dot={false} animationDuration={700} />
            <ReferenceDot x={days} y={end} r={6} fill="#2BF9E9" stroke="#fff" strokeWidth={2} />
            {low.i !== days && low.i !== 0 && <ReferenceDot x={low.i} y={low.scenario} r={5} fill="#F5A623" stroke="#fff" strokeWidth={2} />}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
        <div className="flex items-center justify-between text-sm mb-3">
          <span className="text-white font-semibold">What if I spend {change === 0 ? 'the same' : `${Math.abs(change)}% ${change < 0 ? 'less' : 'more'}`}?</span>
          {change !== 0 && <button onClick={() => setChange(0)} className="text-xs text-[#2EA0FD] hover:underline">Reset</button>}
        </div>
        <ScenarioSlider change={change} setChange={setChange} />
        <p className="text-[11px] text-white/60 mt-3">A sandbox projection from your recent income and spending. Nothing here changes your real transactions.</p>
      </div>
    </div>
  );
}