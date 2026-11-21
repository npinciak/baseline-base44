import { Repeat } from 'lucide-react';
import { CATEGORY_COLORS, CATEGORY_LABELS } from '@/lib/moneyData';

export default function RecurringList({ recurring }) {
  return (
    <section>
      <h2 className="text-lg font-heading font-bold mb-4 flex items-center gap-2 text-white">
        <Repeat className="w-5 h-5 text-[#2EFD7A]" /> Recurring Expenses
      </h2>
      {recurring.length === 0 ? (
        <div className="bg-white/[0.03] border border-dashed border-white/10 rounded-2xl p-8 text-center text-white/50 text-sm">No recurring expenses detected yet</div>
      ) : (
        <div className="bg-white/[0.03] border border-white/10 backdrop-blur-sm rounded-2xl max-h-[420px] overflow-y-auto divide-y divide-white/10">
          {recurring.map(({ name, avg, count, category }) => (
            <div key={name} className="flex items-center gap-4 px-5 py-4">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${CATEGORY_COLORS[category] || '#6B7280'}22` }}>
                <Repeat className="w-4 h-4" style={{ color: CATEGORY_COLORS[category] || '#6B7280' }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate capitalize text-white">{name}</p>
                <p className="text-xs text-white/40">{CATEGORY_LABELS[category]} · {count}x detected</p>
              </div>
              <span className="text-sm font-bold text-white">~${avg.toFixed(2)}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}