import { Landmark } from 'lucide-react';

const money = (n) => `${n < 0 ? '-' : ''}$${Math.abs(Math.round(n)).toLocaleString()}`;

export default function BalanceTool({ balance, accountCount }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-5 h-full">
      <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full blur-2xl opacity-20 bg-[#2EFD7A]" />
      <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-3 bg-white/10">
        <Landmark className="w-4 h-4 text-white/80" />
      </div>
      <p className="text-[11px] uppercase tracking-widest text-white/50">Total balance</p>
      <p className="text-3xl font-display font-extrabold text-white tabular-nums">{money(balance)}</p>
      <p className="text-xs text-white/40 mt-1">Across {accountCount} linked account{accountCount === 1 ? '' : 's'}</p>
    </div>
  );
}