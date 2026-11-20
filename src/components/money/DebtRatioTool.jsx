import { useState } from 'react';
import { Scale } from 'lucide-react';
import ToolCard, { StatTile } from '@/components/money/ToolCard';

const LIABILITIES = ['credit_card', 'loan', 'mortgage', 'line_of_credit'];
const DEBT_WORDS = /loan|mortgage|credit|card|auto pay|student|lending/i;
const usd = (n) => `$${Math.round(n).toLocaleString()}`;

function band(ratio) {
  if (ratio < 0.2) return { label: 'Great', color: '#2EFD7A', tip: 'Your debt payments are a small slice of your income.' };
  if (ratio <= 0.36) return { label: 'Healthy', color: '#2EFD7A', tip: 'Lenders generally see under 36% as healthy.' };
  if (ratio <= 0.43) return { label: 'Caution', color: '#facc15', tip: 'Paying down your smallest balance first can bring this down quickly.' };
  return { label: 'High', color: '#f87171', tip: 'Above 43% makes new loans harder to get. Focus on paying down debt before adding more.' };
}

export default function DebtRatioTool({ accounts, summary, recurring }) {
  const monthlyIncome = (summary.income / summary.days) * 30;
  const estimate = recurring.filter((r) => DEBT_WORDS.test(r.name)).reduce((s, r) => s + r.avg, 0);
  const [payments, setPayments] = useState(Math.round(estimate));
  const totalDebt = accounts.reduce((s, a) => {
    const type = (a.account_type || a.type || '').toLowerCase().replace(/\s/g, '_');
    return LIABILITIES.includes(type) ? s + Math.abs(a.balance ?? 0) : s;
  }, 0);
  const ratio = monthlyIncome > 0 ? payments / monthlyIncome : 0;
  const b = band(ratio);

  return (
    <ToolCard icon={Scale} title="Income-to-Debt Ratio" subtitle="Monthly debt payments divided by monthly income">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
        <StatTile label="Your ratio" value={monthlyIncome > 0 ? `${Math.round(ratio * 100)}%` : '—'} hint={monthlyIncome > 0 ? b.label : 'No income found yet'} />
        <StatTile label="Monthly income" value={usd(monthlyIncome)} hint="Average of recent deposits" />
        <StatTile label="Total debt" value={usd(totalDebt)} hint="Across linked cards and loans" />
      </div>
      <div className="h-2 rounded-full bg-white/10 overflow-hidden mb-4">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, ratio * 100)}%`, background: b.color }} />
      </div>
      <label className="block text-white/60 text-xs mb-1.5" htmlFor="debt-payments">Monthly debt payments (adjust if needed)</label>
      <input id="debt-payments" type="number" min="0" value={payments} onChange={(e) => setPayments(Math.max(0, Number(e.target.value) || 0))}
        className="w-40 rounded-xl bg-white/[0.05] border border-white/10 px-3 py-2 text-white tabular-nums focus:outline-none focus:border-[#2EFD7A]/50" />
      <p className="text-white/60 text-sm mt-4">{b.tip}</p>
    </ToolCard>
  );
}