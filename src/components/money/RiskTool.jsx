import { Link } from 'react-router-dom';
import { Gauge } from 'lucide-react';
import ToolCard, { StatTile } from '@/components/money/ToolCard';

const PROFILES = [
  { max: 35, label: 'Conservative', mix: { Stocks: 30, Bonds: 50, Cash: 20 }, tip: 'You prefer steady over fast. Keep a bigger cash and bond cushion.' },
  { max: 70, label: 'Balanced', mix: { Stocks: 60, Bonds: 30, Cash: 10 }, tip: 'You can ride out some ups and downs for better long-term growth.' },
  { max: 101, label: 'Growth', mix: { Stocks: 85, Bonds: 10, Cash: 5 }, tip: 'You are comfortable with big swings. Make sure your emergency fund is solid first.' },
];
const COLORS = { Stocks: '#2EFD7A', Bonds: '#D4D4D8', Cash: '#facc15' };
const INVEST = ['investment', 'retirement', 'brokerage'];
const CASH = ['checking', 'savings', 'cash', 'money_market'];

export default function RiskTool({ accounts, riskScore }) {
  const profile = riskScore != null ? PROFILES.find((p) => riskScore < p.max) : null;
  const typeOf = (a) => (a.account_type || a.type || '').toLowerCase().replace(/\s/g, '_');
  const invested = accounts.filter((a) => INVEST.includes(typeOf(a))).reduce((s, a) => s + (a.balance ?? 0), 0);
  const cash = accounts.filter((a) => CASH.includes(typeOf(a))).reduce((s, a) => s + (a.balance ?? 0), 0);
  const investedPct = invested + cash > 0 ? Math.round((invested / (invested + cash)) * 100) : null;

  return (
    <ToolCard icon={Gauge} title="Risk Appetite" subtitle="How much ups and downs you are comfortable with">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
        <StatTile label="Your profile" value={profile ? profile.label : '—'}
          hint={profile ? `Risk score ${riskScore}/100` : <Link to="/basescore-quiz" className="text-[#2EFD7A] underline">Take the BaseScore quiz</Link>} />
        <StatTile label="Invested today" value={investedPct != null ? `${investedPct}%` : '—'} hint="Share of your savings that is invested" />
      </div>
      {profile && <>
        <p className="text-white/50 text-[11px] uppercase tracking-widest mb-2">A typical {profile.label.toLowerCase()} mix</p>
        <div className="flex h-3 rounded-full overflow-hidden mb-2">
          {Object.entries(profile.mix).map(([k, v]) => <div key={k} style={{ width: `${v}%`, background: COLORS[k] }} />)}
        </div>
        <div className="flex flex-wrap gap-4 text-xs text-white/60 mb-4">
          {Object.entries(profile.mix).map(([k, v]) => <span key={k} className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{ background: COLORS[k] }} />{k} {v}%</span>)}
        </div>
        <p className="text-white/60 text-sm">{profile.tip}</p>
      </>}
    </ToolCard>
  );
}