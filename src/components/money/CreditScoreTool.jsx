import { Link } from 'react-router-dom';
import { CreditCard } from 'lucide-react';
import ToolCard, { StatTile } from '@/components/money/ToolCard';

const FACTORS = [
  { label: 'Payment history', weight: 35, tip: 'Pay every bill on time. Autopay the minimum as a safety net.' },
  { label: 'Credit utilization', weight: 30, tip: 'Keep card balances under 30% of your limits, under 10% is even better.' },
  { label: 'Length of history', weight: 15, tip: 'Keep your oldest card open, even if you rarely use it.' },
  { label: 'Credit mix', weight: 10, tip: 'A mix of cards and loans helps, but never borrow just for this.' },
  { label: 'New credit', weight: 10, tip: 'Space out new applications. Each hard check dips your score briefly.' },
];

export default function CreditScoreTool({ accounts, creditHealth }) {
  const cards = accounts.filter((a) => (a.account_type || a.type || '').toLowerCase().replace(/\s/g, '_') === 'credit_card' && a.credit_limit);
  const balance = cards.reduce((s, a) => s + Math.abs(a.balance ?? 0), 0);
  const limit = cards.reduce((s, a) => s + a.credit_limit, 0);
  const util = limit ? Math.round((balance / limit) * 100) : null;

  return (
    <ToolCard icon={CreditCard} title="Credit Score" subtitle="Your credit health from BaseScore and your linked cards">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
        <StatTile label="Credit health" value={creditHealth != null ? `${creditHealth}/100` : '—'}
          hint={creditHealth == null ? <Link to="/basescore-quiz" className="text-[#2EFD7A] underline">Take the BaseScore quiz</Link> : 'Part of your BaseScore'} />
        <StatTile label="Card utilization" value={util != null ? `${util}%` : '—'}
          hint={util == null ? 'Link a credit card to see this' : util <= 30 ? 'Nice, under 30%' : 'Aim for under 30%'} />
      </div>
      <p className="text-white/50 text-[11px] uppercase tracking-widest mb-3">What moves a credit score</p>
      <div className="space-y-3">
        {FACTORS.map((f) => (
          <div key={f.label}>
            <div className="flex justify-between text-xs mb-1"><span className="text-white/80">{f.label}</span><span className="text-white/50">{f.weight}%</span></div>
            <div className="h-1.5 rounded-full bg-white/10 overflow-hidden mb-1"><div className="h-full rounded-full bg-gradient-to-r from-[#17C964] to-[#2EFD7A]" style={{ width: `${f.weight * 2.5}%` }} /></div>
            <p className="text-white/50 text-xs">{f.tip}</p>
          </div>
        ))}
      </div>
    </ToolCard>
  );
}