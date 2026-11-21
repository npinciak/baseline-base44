import { CATEGORY_COLORS, CATEGORY_LABELS } from '@/lib/moneyData';

/** One transaction shown as evidence: date, merchant, category, amount. */
export default function CoachTxLine({ tx }) {
  return (
    <div className="flex items-center gap-3 text-xs">
      <span className="w-2 h-2 rounded-full shrink-0" style={{ background: CATEGORY_COLORS[tx.category] || '#6B7280' }} />
      <span className="text-white/45 w-20 shrink-0">{tx.date}</span>
      <span className="text-white/85 truncate flex-1">{tx.merchant_name || tx.description}</span>
      <span className="text-white/45 hidden sm:inline">{CATEGORY_LABELS[tx.category] || tx.category}</span>
      <span className={`font-semibold ${tx.is_income ? 'text-[#2EFD7A]' : 'text-white'}`}>{tx.is_income ? '+' : ''}${tx.amount.toFixed(2)}</span>
    </div>
  );
}