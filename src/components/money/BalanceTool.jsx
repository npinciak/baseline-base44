import { Landmark } from 'lucide-react';
import FeaturePanel from '@/components/money/FeaturePanel';

const money = (n) => `${n < 0 ? '-' : ''}$${Math.abs(Math.round(n)).toLocaleString()}`;

export default function BalanceTool({ balance, accountCount }) {
  return (
    <FeaturePanel icon={Landmark} kicker="Total balance" className="h-full">
      <p className="text-4xl sm:text-5xl font-display font-extrabold text-white tabular-nums leading-tight">{money(balance)}</p>
      <p className="text-sm text-white/60 mt-2">Across {accountCount} linked account{accountCount === 1 ? '' : 's'}</p>
    </FeaturePanel>
  );
}