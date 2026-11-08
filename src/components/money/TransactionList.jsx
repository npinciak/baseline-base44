import { useState } from 'react';
import { Wallet } from 'lucide-react';
import { CATEGORY_COLORS, CATEGORY_LABELS } from '@/lib/moneyData';

export default function TransactionList({ transactions }) {
  const [filter, setFilter] = useState('all');
  const shown = transactions.filter(tx => (filter === 'income' ? tx.is_income : filter === 'expenses' ? !tx.is_income : true)).slice(0, 10);
  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-heading font-bold flex items-center gap-2 text-white">
          <Wallet className="w-5 h-5 text-[#2EA0FD]" /> Recent Transactions
        </h2>
        <div className="flex gap-1 bg-white/[0.05] rounded-xl p-1">
          {['all', 'expenses', 'income'].map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${filter === f ? 'bg-[#2EA0FD] text-black' : 'text-white/50 hover:text-white'}`}>
              {f}
            </button>
          ))}
        </div>
      </div>
      {shown.length === 0 ? (
        <div className="bg-white/[0.03] border border-dashed border-white/10 rounded-2xl p-8 text-center text-white/50 text-sm">No transactions found</div>
      ) : (
        <div className="bg-white/[0.03] border border-white/10 backdrop-blur-sm rounded-2xl overflow-hidden divide-y divide-white/10">
          {shown.map(tx => (
            <div key={tx.id} className="flex items-center gap-3 px-5 py-3.5">
              <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: `${CATEGORY_COLORS[tx.category] || '#6B7280'}22` }}>
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: CATEGORY_COLORS[tx.category] || '#6B7280' }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate text-white">{tx.description || tx.merchant_name || 'Transaction'}</p>
                <p className="text-xs text-white/40">{CATEGORY_LABELS[tx.category]} · {tx.date}</p>
              </div>
              <span className={`text-sm font-semibold ${tx.is_income ? 'text-[#2EFD7A]' : 'text-white'}`}>
                {tx.is_income ? '+' : '-'}${Math.abs(tx.amount).toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}