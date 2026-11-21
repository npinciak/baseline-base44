import { useMemo, useState } from 'react';
import { ChevronRight, Landmark } from 'lucide-react';
import FeaturePanel from '@/components/money/FeaturePanel';

const GROUPS = [
  { key: 'cash', label: 'Cash', color: '#2EFD7A', types: ['checking', 'savings', 'cash', 'money_market'] },
  { key: 'investments', label: 'Investments', color: '#D4D4D8', types: ['investment', 'retirement', 'brokerage'] },
  { key: 'other', label: 'Other Assets', color: '#A78BFA', types: [] },
];
const LIABILITIES = ['credit_card', 'loan', 'mortgage', 'line_of_credit'];
const fmt = (n) => `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const SAMPLE_ACCOUNTS = [
  { guid: 's1', name: 'Everyday Checking', account_type: 'checking', balance: 3420 },
  { guid: 's2', name: 'High-Yield Savings', account_type: 'savings', balance: 6200 },
  { guid: 's3', name: 'Brokerage', account_type: 'investment', balance: 9800 },
];

function groupAccounts(accounts) {
  const groups = GROUPS.map(g => ({ ...g, items: [], total: 0 }));
  accounts.forEach(a => {
    const type = (a.account_type || a.type || '').toLowerCase().replace(/\s/g, '_');
    if (LIABILITIES.includes(type)) return;
    const bal = a.balance ?? a.available_balance ?? 0;
    const g = groups.find(x => x.types.includes(type)) || groups[2];
    g.items.push({ name: a.name || a.institution_name || 'Account', bal });
    g.total += bal;
  });
  return groups.filter(g => g.items.length);
}

export default function AssetsBreakdown({ accounts }) {
  const [open, setOpen] = useState({});
  const groups = useMemo(() => groupAccounts(accounts), [accounts]);
  const total = groups.reduce((s, g) => s + g.total, 0);
  if (!total) return null;

  return (
    <FeaturePanel icon={Landmark} kicker="Net worth">
      <p className="text-white/60 text-sm -mt-2 mb-4">Assets <span className="text-white font-semibold">· {fmt(total)}</span></p>
      <div className="flex gap-1 h-2 rounded-full overflow-hidden mb-3">
        {groups.map(g => <div key={g.key} style={{ width: `${(g.total / total) * 100}%`, background: g.color }} />)}
      </div>
      <div className="flex flex-wrap gap-x-5 gap-y-1 mb-5 text-xs">
        {groups.map(g => (
          <span key={g.key} className="flex items-center gap-1.5 text-white/60">
            <span className="w-2 h-2 rounded-full" style={{ background: g.color }} />
            {g.label} <strong className="text-white">{Math.round((g.total / total) * 100)}%</strong>
          </span>
        ))}
      </div>
      <div className="divide-y divide-white/10">
        {groups.map(g => {
          const pct = (g.total / total) * 100;
          return (
            <div key={g.key}>
              <button onClick={() => setOpen(o => ({ ...o, [g.key]: !o[g.key] }))} className="w-full flex items-center gap-3 py-3 text-left">
                <ChevronRight className={`w-4 h-4 text-white/50 transition-transform ${open[g.key] ? 'rotate-90' : ''}`} />
                <span className="flex-1 text-sm text-white">{g.label}</span>
                <div className="hidden sm:block w-20 h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, background: g.color }} />
                </div>
                <span className="w-16 text-right text-xs text-white/60">{pct.toFixed(2)}%</span>
                <span className="w-28 text-right text-sm font-semibold text-white">{fmt(g.total)}</span>
              </button>
              {open[g.key] && g.items.map((it, i) => (
                <div key={i} className="flex justify-between pl-7 pb-2 text-xs text-white/60">
                  <span>{it.name}</span><span>{fmt(it.bal)}</span>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </FeaturePanel>
  );
}