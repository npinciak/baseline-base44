import { useMemo, useState } from 'react';

const W = 900;
const H = 440;
const PAD = 30;
const NW = 12;
const GAP = 10;
const MINH = 18;
const DAY = 86400000;
const INCOME_COLORS = ['#2EFD7A', '#2BF9E9', '#2EA0FD', '#A78BFA'];
const SPEND_COLORS = ['#2EA0FD', '#F5A623', '#c084fc', '#f87171', '#38BDF8', '#34D399', '#fb7185', '#facc15'];
const fmt = (n) => `$${Math.round(n).toLocaleString()}`;
const short = (s) => (s.length > 24 ? `${s.slice(0, 22)}…` : s);

function groupTop(map, max, colors, restLabel, restColor) {
  const sorted = Object.entries(map).sort((a, b) => b[1] - a[1]);
  const items = sorted.slice(0, max).map(([name, value], i) => ({ name, value, color: colors[i % colors.length] }));
  const rest = sorted.slice(max).reduce((s, [, v]) => s + v, 0);
  if (rest > 0) items.push({ name: restLabel, value: rest, color: restColor });
  return items;
}

function buildFlows(txs, days) {
  const dated = txs.filter(t => t.date);
  if (!dated.length) return { left: [], right: [], total: 0 };
  const latest = Math.max(...dated.map(t => new Date(`${t.date}T12:00:00`).getTime()));
  const recent = dated.filter(t => new Date(`${t.date}T12:00:00`).getTime() > latest - days * DAY);

  const inc = {};
  const out = {};
  recent.forEach(t => {
    const k = (t.merchant_name || t.description || (t.is_income ? 'Income' : 'Other')).trim();
    const map = t.is_income ? inc : out;
    map[k] = (map[k] || 0) + t.amount;
  });

  const left = groupTop(inc, 3, INCOME_COLORS, 'Other income', INCOME_COLORS[3]);
  const right = groupTop(out, 7, SPEND_COLORS, 'Everything else', '#6B7280');
  const income = left.reduce((s, n) => s + n.value, 0);
  const spent = right.reduce((s, n) => s + n.value, 0);
  if (spent > income) left.push({ name: 'From savings', value: spent - income, color: '#f87171' });
  if (income > spent) right.push({ name: 'Surplus', value: income - spent, color: '#2EFD7A' });
  return { left, right, total: Math.max(income, spent) };
}

/** One shared scale so every node fits in the chart height, even tiny ones. */
function fitScale(total, ...cols) {
  const avail = H - PAD * 2;
  let best = Infinity;
  cols.forEach(items => {
    const gaps = (items.length - 1) * GAP;
    let s = (avail - gaps) / total;
    for (let i = 0; i < 6; i++) {
      const small = items.filter(n => n.value * s < MINH).length;
      const bigSum = items.filter(n => n.value * s >= MINH).reduce((a, n) => a + n.value, 0);
      if (!bigSum) break;
      s = (avail - gaps - small * MINH) / bigSum;
    }
    best = Math.min(best, s);
  });
  return best;
}

function place(items, scale, x) {
  const hs = items.map(n => Math.max(n.value * scale, MINH));
  const colH = hs.reduce((a, b) => a + b, 0) + (items.length - 1) * GAP;
  let y = (H - colH) / 2;
  return items.map((n, i) => {
    const node = { ...n, x, y, f: Math.min(n.value * scale, hs[i]), h: hs[i] };
    y += hs[i] + GAP;
    return node;
  });
}

function Link({ x1, y0, x2, y1, f, color }) {
  const xm = (x1 + x2) / 2;
  const d = `M${x1},${y0} C${xm},${y0} ${xm},${y1} ${x2},${y1} L${x2},${y1 + f} C${xm},${y1 + f} ${xm},${y0 + f} ${x1},${y0 + f} Z`;
  return <path d={d} fill={color} fillOpacity="0.25" />;
}

function Label({ n, side }) {
  const x = side === 'left' ? NW + 8 : W - NW - 8;
  const anchor = side === 'left' ? 'start' : 'end';
  const cy = n.y + n.h / 2;
  return (
    <text x={x} y={cy + 4} textAnchor={anchor} fontSize="12" fill="#fff">
      {short(n.name)} <tspan fill="rgba(255,255,255,0.6)">{fmt(n.value)}</tspan>
    </text>
  );
}

export default function SankeyCashflow({ txs }) {
  const [days, setDays] = useState(30);
  const { left, right, total } = useMemo(() => buildFlows(txs, days), [txs, days]);

  const nodes = useMemo(() => {
    if (!total) return null;
    const scale = fitScale(total, left, right);
    const cH = total * scale;
    return {
      cx: (W - NW) / 2, cY: (H - cH) / 2, cH,
      L: place(left, scale, 0),
      R: place(right, scale, W - NW),
    };
  }, [left, right, total]);

  return (
    <div className="bg-white/[0.03] border border-white/10 backdrop-blur-sm rounded-2xl p-5">
      <div className="flex items-center justify-between mb-2">
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
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto overflow-visible">
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
          <text x={nodes.cx + NW / 2} y={nodes.cY - 10} textAnchor="middle" fontSize="12" fill="#fff">
            Cash Flow <tspan fill="rgba(255,255,255,0.6)">{fmt(total)}</tspan>
          </text>
          {nodes.L.map((n, i) => <Label key={`ll${i}`} n={n} side="left" />)}
          {nodes.R.map((n, i) => <Label key={`rl${i}`} n={n} side="right" />)}
        </svg>
      )}
    </div>
  );
}