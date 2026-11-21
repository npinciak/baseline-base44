import { Wand2, MessageCircle, ArrowRight, Undo2 } from 'lucide-react';
import CoachTxLine from '@/components/coach/CoachTxLine';
import { CATEGORY_LABELS } from '@/lib/moneyData';

export default function CoachCleanup({ items, isSample, overrides, onAsk }) {
  const active = overrides?.active || [];
  const changedIds = new Set(active.map(o => o.transaction_id));
  const open = items.filter(i => !changedIds.has(i.tx.id));

  return (
    <div className="space-y-4">
      {open.length === 0 && (
        <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-sm text-white/50">
          <Wand2 className="w-6 h-6 mx-auto mb-2 text-[#2EFD7A]" /> Nothing looks off right now. Your categories look tidy.
        </div>
      )}
      {open.map(item => (
        <div key={item.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`text-[10px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-full ${item.kind === 'refund' ? 'bg-[#2EA0FD]/15 text-[#2EA0FD]' : 'bg-[#2EFD7A]/15 text-[#2EFD7A]'}`}>
              {item.kind === 'refund' ? 'Possible refund' : `${item.confidence} fix`}
            </span>
            {item.suggested && (
              <span className="flex items-center gap-1.5 text-xs text-white/70">
                {CATEGORY_LABELS[item.tx.category]} <ArrowRight className="w-3 h-3" /> <strong className="text-white">{CATEGORY_LABELS[item.suggested]}</strong>
              </span>
            )}
          </div>
          <CoachTxLine tx={item.tx} />
          <p className="text-sm text-white/65">{item.rationale}</p>
          <div className="flex flex-wrap gap-2">
            {item.suggested && overrides && (
              <button onClick={() => overrides.apply(item.tx, item.suggested)} disabled={isSample || overrides.saving}
                title={isSample ? 'Link your bank to change categories' : undefined}
                className="px-3 py-1.5 rounded-full bg-[#2EFD7A] text-black text-xs font-semibold hover:bg-[#2EFD7A]/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                Change to {CATEGORY_LABELS[item.suggested]}
              </button>
            )}
            <button onClick={() => onAsk({ label: `${item.tx.merchant_name || item.tx.description} on ${item.tx.date}`, txIds: [item.tx.id] })}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/15 text-xs text-white/80 hover:border-white/30 transition-all">
              <MessageCircle className="w-3.5 h-3.5" /> Ask about this
            </button>
          </div>
        </div>
      ))}

      {active.length > 0 && (
        <div className="pt-2">
          <p className="text-[11px] uppercase tracking-widest text-white/40 font-semibold mb-2">Your category changes</p>
          <div className="rounded-2xl border border-white/10 divide-y divide-white/10">
            {active.map(o => (
              <div key={o.id} className="flex items-center gap-3 px-4 py-3 text-xs">
                <span className="flex-1 min-w-0 truncate text-white/85">{o.merchant}</span>
                <span className="text-white/45">{CATEGORY_LABELS[o.original_category]} → <span className="text-white">{CATEGORY_LABELS[o.new_category]}</span></span>
                <button onClick={() => overrides.revert(o)} disabled={overrides.saving}
                  className="flex items-center gap-1 text-[#2EFD7A] hover:underline disabled:opacity-40"><Undo2 className="w-3.5 h-3.5" /> Undo</button>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-white/40 mt-2">Changes only affect how Baseline shows your money. Your bank's records stay as they are.</p>
        </div>
      )}
    </div>
  );
}