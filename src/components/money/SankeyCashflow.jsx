import { useMemo, useState } from 'react';
import { CATEGORY_COLORS, CATEGORY_LABELS } from '@/lib/moneyData';

const W = 900;
const H = 380;
const NW = 12;
const GAP = 12;
const DAY = 86400000;
const INCOME_COLORS = ['#2EFD7A', '#2BF9E9', '#2EA0FD', '#A78BFA'];
const fmt = (n) => `$${Math.round(n).toLocaleString()}`;

function buildFlows(txs, days) {
  const dated = txs.filter(t => t.date);
  if (!dated.length) return { left: [], right: [], total: 0 };
  const latest = Math.max(...dated.map(t => new Date(`${t.date}T12:00:00`).getTime()));
  const recent = dated.filter(t => new Date(`${t.date}T12:00:00`).getTime() > latest - days * DAY);

  const inc = {};
  recent.filter(t => t.is_income).forEach(t => {
    const k = t.merchant_name || t.description || 'Income';
    inc[k] = (inc[k] || 0) + t.amount;
  });
  const incSorted = Object.entries(inc).sort((a, b) => b[1] - a[1]);
  const left = incSorted.slice(0, 3).map(([name, value], i) => ({ name, value, color: INCOME_COLORS[i] }));
  const restInc = incSorted.slice(3).reduce((s, [, v]) => s + v, 0);
  if (restInc > 0) left.push({ name: 'Other income', value: restInc, color: INCOME_COLORS[3] });

  const cats = {};
  recent.filter(t => !t.is_income).forEach(t => { cats[t.category] = (cats[t.category] || 0) + t.amount; });
  const spent = Object.values(cats).reduce((s, v) => s + v, 0);
  const income = left.reduce((s, n) => s + n.value, 0);
  const total = Math.max(income, spent);
  let right = [];
  let other = 0;
  Object.entries(cats).sort((a, b) => b[1] - a[1]).forEach(([cat, value]) => {
    if (value / total < 0.025) other += value;
    else right.push({ name: CATEGORY_LABELS[cat] || cat, value, color: CATEGORY_COLORS[cat] || '#6B7280' });
  });
  if (other > 0) right.push({ name: 'Other', value: other, color: '#6B7280' });
  if (spent > income) left.push({ name: 'From savings', value: spent - income, color: '#f87171' });
  if (income > spent) right.push({ name: 'Surplus', value: income - spent, color: '#2EFD7A' });
  return { left, right, total };
}

function place(items, scale, x) {
  const flows = items.reduce((s, n) => s + n.value * scale, 0);
  const colH = flows + (items.length - 1) * GAP;
  let y = (H - colH) / 2;
  return items.map(n => {
    const f = n.value * scale;
    const node = { ...n, x, y, f, h: Math.max(f, 3) };
    y += Math.max(f, 3) + GAP;
    return node;
  });
}

function Link({ x1, y0, x2, y1, f, color, id }) {
  const xm = (x1 + x2) / 2;
  const d = `M${x1},${y0} C${xm},${y0} ${xm},${y1} ${x2},${y1} L${x2},${y1 + f} C${xm},${y1 + f} ${xm},${y0 + f} ${x1},${y0 + f} Z`;
  return <path d={d} fill={color} fillOpacity="0.22" className="hover:fill-opacity-40 transition-all" id={id} />;
}

function Label({ n, side }) {
  const x = side === 'left' ? NW + 8 : W - NW - 8;
  const anchor = side === 'left' ? 'start' : 'end';
  const cy = n.y + n.h / 2;
  if (n.h < 26) {
    return (
      <text x={x} y={cy + 4} textAnchor={anchor} fontSize="11" fill="#fff">
        {n.name} <tspan fill="rgba(255,255,255,0.55)">{fmt(n.value)}</tspan>
      </text>
    );
  }
  return (
    <text x={x} textAnchor={anchor} fontSize="12" fill="#fff">
      <tspan x={x} y={cy - 2}>{n.name}</tspan>
      <tspan x={x} y={cy + 13} fontSize="11" fill="rgba(255,255,255,0.55)">{fmt(n.value)}</tspan>
    </text>
  );
}

export default function SankeyCashflow({ txs }) {
  const [days, setDays] = useState(30);
  const { left, right, total } = useMemo(() => buildFlows(txs, days), [txs, days]);

  const nodes = useMemo(() => {
    if (!total) return null;
    const maxGaps = Math.max(left.length, right.length) - 1;
    const scale = (H - maxGaps * GAP) / total;
    const cx = (W - NW) / 2;
    const cH = total * scale;
    return {
      cx, cY: (H - cH) / 2, cH, scale,
      L: place(left, scale, 0),
      R: place(right, scale, W - NW),
    };
  }, [left, right, total]);

  return (
    <div className="bg-white/[0.03] border border-white/10 backdrop-blur-sm rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold">Cashflow</h3>
        <div className="flex gap-1 bg-white/[0.05] rounded-lg p-1">
          {[30, 90].map(d => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${days === d ? 'bg-[#2EA0FD] text-black' : 'text-white/60 hover:text-white'}`}
            >
              {d}D
            </button>
          ))}
        </div>
      </div>
      {!nodes ? (
        <p className="text-white/50 text-sm py-10 text-center">No activity in this period.</p>
      ) : (
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
          {(() => {
            let inY = nodes.cY;
            return nodes.L.map((n, i) => {
              const el = <Link key={`l${i}`} x1={NW} y0={n.y} x2={nodes.cx} y1={inY} f={n.f} color={n.color} />;
              inY += n.f;
              return el;
            });
          })()}
          {(() => {
            let outY = nodes.cY;
            return nodes.R.map((n, i) => {
              const el = <Link key={`r${i}`} x1={nodes.cx + NW} y0={outY} x2={W - NW} y1={n.y} f={n.f} color={n.color} />;
              outY += n.f;
              return el;
            });
          })()}
          {nodes.L.map((n, i) => <rect key={`ln${i}`} x={0} y={n.y} width={NW} height={n.h} rx="3" fill={n.color} />)}
          {nodes.R.map((n, i) => <rect key={`rn${i}`} x={W - NW} y={n.y} width={NW} height={n.h} rx="3" fill={n.color} />)}
          <rect x={nodes.cx} y={nodes.cY} width={NW} height={nodes.cH} rx="3" fill="#2EFD7A" />
          <text x={nodes.cx + NW / 2} y={nodes.cY - 8} textAnchor="middle" fontSize="12" fill="#fff">
            Cash Flow <tspan fill="rgba(255,255,255,0.55)">{fmt(total)}</tspan>
          </text>
          {nodes.L.map((n, i) => <Label key={`ll${i}`} n={n} side="left" />)}
          {nodes.R.map((n, i) => <Label key={`rl${i}`} n={n} side="right" />)}
        </svg>
      )}
    </div>
  );
}