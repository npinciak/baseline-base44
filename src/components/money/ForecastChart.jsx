import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceDot, CartesianGrid } from 'recharts';
import ScenarioSlider from '@/components/money/ScenarioSlider';
import { Telescope, TrendingUp, TrendingDown, Sparkles, Lock } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { getLifetimeCoins } from '@/lib/coinLevels';
import { getStoredAdminViewMode } from '@/hooks/useAdminViewMode';

const SANDBOX_PRESETS = [
  { id: 'trim-wants', label: 'Trim Wants -15%', spendPct: -15, extraDailyIncome: 0 },
  { id: 'lean-month', label: 'Lean Month -25%', spendPct: -25, extraDailyIncome: 0 },
  { id: 'side-income', label: '+$200/mo Side Income', spendPct: 0, extraDailyIncome: 200 / 30 },
];

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

export default function ForecastChart({ startBalance, dailyIncome, dailySpend, isAdmin = false }) {
  const [days, setDays] = useState(90);
  const [change, setChange] = useState(0); // % change in spending
  const [extraDailyIncome, setExtraDailyIncome] = useState(0);
  const [presetsUnlocked, setPresetsUnlocked] = useState(Boolean(isAdmin));

  useEffect(() => {
    if (isAdmin) {
      setPresetsUnlocked(true);
      return;
    }
    base44.auth.me()
      .then((u) => {
        if (u?.role === 'admin' && getStoredAdminViewMode() === 'admin') {
          setPresetsUnlocked(true);
          return null;
        }
        return base44.entities.UserStats.filter({ user_id: u.id });
      })
      .then((arr) => {
        if (arr) setPresetsUnlocked(getLifetimeCoins(arr?.[0]) >= 1000);
      })
      .catch(() => {});
  }, [isAdmin]);

  const { data, end, baseEnd, low } = useMemo(() => {
    const spend = dailySpend * (1 + change / 100);
    const inc = dailyIncome + extraDailyIncome;
    const rows = Array.from({ length: days + 1 }, (_, i) => ({
      i,
      base: startBalance + i * (dailyIncome - dailySpend),
      scenario: startBalance + i * (inc - spend),
    }));
    const lowest = rows.reduce((m, r) => (r.scenario < m.scenario ? r : m), rows[0]);
    return { data: rows, end: rows[days].scenario, baseEnd: rows[days].base, low: lowest };
  }, [days, change, extraDailyIncome, startBalance, dailyIncome, dailySpend]);

  const gain = end - startBalance;
  const diff = end - baseEnd;
  const up = gain >= 0;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#06142a] via-black to-black p-5 sm:p-7 shadow-[0_0_60px_-15px_rgba(46,253,122,0.35)]">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-2">
        <div>
          <p className="flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-[#2EFD7A] font-semibold mb-2">
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
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${days === h.d ? 'bg-[#2EFD7A] text-black' : 'text-white/60 hover:text-white'}`}
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
                <stop offset="0%" stopColor="#2EFD7A" stopOpacity={0.55} />
                <stop offset="100%" stopColor="#2EFD7A" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="fcStroke" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#2EFD7A" />
                <stop offset="100%" stopColor="#2EFD7A" />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis dataKey="i" type="number" domain={[0, days]} tickCount={6} tickFormatter={dayLabel} stroke="rgba(255,255,255,0.35)" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis tickFormatter={(v) => `$${Math.round(v / 1000)}k`} stroke="rgba(255,255,255,0.35)" fontSize={11} tickLine={false} axisLine={false} width={44} domain={['auto', 'auto']} />
            <Tooltip content={<ForecastTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.3)', strokeDasharray: '4 4' }} />
            {change !== 0 && <Area type="monotone" dataKey="base" stroke="rgba(255,255,255,0.4)" strokeDasharray="5 5" strokeWidth={1.5} fill="none" dot={false} isAnimationActive={false} />}
            <Area type="monotone" dataKey="scenario" stroke="url(#fcStroke)" strokeWidth={3} fill="url(#fcFill)" dot={false} animationDuration={700} />
            <ReferenceDot x={days} y={end} r={6} fill="#2EFD7A" stroke="#fff" strokeWidth={2} />
            {low.i !== days && low.i !== 0 && <ReferenceDot x={low.i} y={low.scenario} r={5} fill="#F5A623" stroke="#fff" strokeWidth={2} />}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
        <div className="flex items-center justify-between text-sm mb-3">
          <span className="text-white font-semibold">
            What if I spend {change === 0 ? 'the same' : `${Math.abs(change)}% ${change < 0 ? 'less' : 'more'}`}
            {extraDailyIncome > 0 ? ' + $200/mo side income' : ''}?
          </span>
          {(change !== 0 || extraDailyIncome !== 0) && (
            <button onClick={() => { setChange(0); setExtraDailyIncome(0); }} className="text-xs text-[#2EFD7A] hover:underline">
              Reset
            </button>
          )}
        </div>
        <ScenarioSlider change={change} setChange={setChange} />

        <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-semibold text-white/65 flex items-center gap-1 mr-1">
            {presetsUnlocked ? <Sparkles className="w-3.5 h-3.5 text-[#2EFD7A]" /> : <Lock className="w-3.5 h-3.5 text-white/40" />}
            Level 3 Presets:
          </span>
          {SANDBOX_PRESETS.map((p) => {
            const active = change === p.spendPct && Math.abs(extraDailyIncome - p.extraDailyIncome) < 0.01;
            return (
              <button
                key={p.id}
                type="button"
                disabled={!presetsUnlocked}
                onClick={() => {
                  setChange(p.spendPct);
                  setExtraDailyIncome(p.extraDailyIncome);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                  !presetsUnlocked
                    ? 'border-white/10 bg-white/[0.02] text-white/35 cursor-not-allowed'
                    : active
                      ? 'border-[#2EFD7A] bg-[#2EFD7A]/20 text-[#2EFD7A]'
                      : 'border-white/15 bg-white/[0.04] text-white/80 hover:border-white/30'
                }`}
              >
                {p.label}
              </button>
            );
          })}
          {!presetsUnlocked && (
            <span className="text-[11px] text-white/45">Unlocks at 1,000 Lifetime BC (10 lessons)</span>
          )}
        </div>

        <p className="text-[11px] text-white/60 mt-3">A sandbox projection from your recent income and spending. Nothing here changes your real transactions.</p>
      </div>
    </div>
  );
}