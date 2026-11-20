import { useState } from 'react';
import { Wallet } from 'lucide-react';
import { CATEGORY_COLORS, CATEGORY_LABELS } from '@/lib/moneyData';

const PAGE = 5;

export default function TransactionList({ transactions }) {
  const [filter, setFilter] = useState('all');
  const [limit, setLimit] = useState(PAGE);
  const filtered = transactions.filter(tx => (filter === 'income' ? tx.is_income : filter === 'expenses' ? !tx.is_income : true));
  const shown = filtered.slice(0, limit);
  const pick = (f) => { setFilter(f); setLimit(PAGE); };
  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <h2 className="text-base font-heading font-bold flex items-center gap-2 text-white">
          <Wallet className="w-4 h-4 text-[#2EFD7A]" /> Recent Transactions
        </h2>
        <div className="flex gap-1 bg-white/[0.05] rounded-lg p-0.5">
          {['all', 'expenses', 'income'].map(f => (
            <button key={f} onClick={() => pick(f)} className={`px-2.5 py-1 rounded-md text-[11px] font-semibold capitalize transition-all ${filter === f ? 'bg-[#2EFD7A] text-black' : 'text-white/50 hover:text-white'}`}>
              {f}
            </button>
          ))}
        </div>
      </div>
      {shown.length === 0 ? (
        <div className="bg-white/[0.03] border border-dashed border-white/10 rounded-2xl p-6 text-center text-white/50 text-sm">No transactions found</div>
      ) : (
        <div className="bg-white/[0.03] border border-white/10 backdrop-blur-sm rounded-2xl overflow-hidden divide-y divide-white/[0.06]">
          {shown.map(tx => (
            <div key={tx.id} className="flex items-center gap-3 px-4 py-2">
              <div className="w-2 h-2 rounded-full shrink-0" style={{ background: CATEGORY_COLORS[tx.category] || '#6B7280' }} />
              <div className="flex-1 min-w-0 flex items-baseline gap-2">
                <p className="text-sm truncate text-white">{tx.description || tx.merchant_name || 'Transaction'}</p>
                <p className="text-[11px] text-white/40 shrink-0 hidden sm:block">{CATEGORY_LABELS[tx.category]}</p>
              </div>
              <span className="text-[11px] text-white/40 tabular-nums shrink-0">{tx.date}</span>
              <span className={`text-sm font-semibold tabular-nums w-20 text-right ${tx.is_income ? 'text-[#2EFD7A]' : 'text-white'}`}>
                {tx.is_income ? '+' : '-'}${Math.abs(tx.amount).toFixed(2)}
              </span>
            </div>
          ))}
          {filtered.length > PAGE && (
            <button onClick={() => setLimit(limit >= filtered.length ? PAGE : limit + PAGE)} className="w-full py-2 text-xs font-semibold text-[#2EFD7A] hover:bg-white/[0.03] transition-colors">
              {limit >= filtered.length ? 'Show less' : `Show more (${filtered.length - limit} left)`}
            </button>
          )}
        </div>
      )}
    </section>
  );
}