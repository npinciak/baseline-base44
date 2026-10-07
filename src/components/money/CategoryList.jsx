import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp, Tag } from 'lucide-react';

export default function CategoryList({ categoryList, grandTotal, expenses }) {
  const [expanded, setExpanded] = useState(null);
  return (
    <section>
      <h2 className="text-lg font-heading font-bold mb-4 flex items-center gap-2 text-white">
        <Tag className="w-5 h-5 text-[#2EA0FD]" /> Categories
      </h2>
      {categoryList.length === 0 ? (
        <div className="bg-white/[0.03] border border-dashed border-white/10 rounded-2xl p-8 text-center text-white/50 text-sm">No expense data yet</div>
      ) : (
        <div className="bg-white/[0.03] border border-white/10 backdrop-blur-sm rounded-2xl overflow-hidden divide-y divide-white/10">
          {categoryList.map(({ cat, total, label, color }) => {
            const pct = grandTotal > 0 ? (total / grandTotal) * 100 : 0;
            const isExpanded = expanded === cat;
            const catTxs = expenses.filter(tx => tx.category === cat);
            return (
              <div key={cat}>
                <button onClick={() => setExpanded(isExpanded ? null : cat)} className="w-full flex items-center gap-4 px-5 py-4 hover:bg-white/[0.04] transition-colors text-left">
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ background: color }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-medium text-white">{label}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-white/50">{pct.toFixed(1)}%</span>
                        <span className="text-sm font-bold text-white">${total.toFixed(2)}</span>
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-white/40" /> : <ChevronDown className="w-4 h-4 text-white/40" />}
                      </div>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <motion.div className="h-full rounded-full" style={{ background: color }} initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, ease: 'easeOut' }} />
                    </div>
                  </div>
                </button>
                {isExpanded && (
                  <div className="bg-white/[0.02] px-5 pb-3 space-y-2">
                    {catTxs.slice(0, 8).map(tx => (
                      <div key={tx.id} className="flex items-center justify-between py-1.5">
                        <div>
                          <p className="text-xs font-medium text-white/80">{tx.description || tx.merchant_name || 'Transaction'}</p>
                          <p className="text-xs text-white/40">{tx.date}</p>
                        </div>
                        <span className="text-xs font-semibold text-white/80">-${Math.abs(tx.amount).toFixed(2)}</span>
                      </div>
                    ))}
                    {catTxs.length > 8 && <p className="text-xs text-white/40 pb-1">+{catTxs.length - 8} more</p>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}