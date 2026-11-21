import { TrendingUp, TrendingDown, MessageCircle, Eye, Calculator } from 'lucide-react';
import CoachTxLine from '@/components/coach/CoachTxLine';

export default function CoachTrends({ trends, onAsk }) {
  if (!trends.enough) {
    return (
      <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-sm text-white/50">
        Trends need about 45 days of transactions. Check back once more history comes in.
      </div>
    );
  }
  if (!trends.items.length) {
    return <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-sm text-white/50">No big shifts in the last 30 days. Steady is good.</div>;
  }
  return (
    <div className="grid lg:grid-cols-2 gap-4">
      {trends.items.map(t => {
        const Icon = t.tone === 'good' ? TrendingDown : TrendingUp;
        const color = t.tone === 'good' ? '#2EFD7A' : '#F5A623';
        return (
          <div key={t.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 flex flex-col gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${color}22` }}>
              <Icon className="w-4 h-4" style={{ color }} />
            </div>
            <p className="text-sm text-white flex gap-2"><Eye className="w-4 h-4 text-white/40 shrink-0 mt-0.5" /><span><span className="text-white/45">Observed: </span>{t.observed}</span></p>
            <p className="text-sm text-white/70 flex gap-2"><Calculator className="w-4 h-4 text-white/40 shrink-0 mt-0.5" /><span><span className="text-white/45">Estimate: </span>{t.estimate}</span></p>
            {t.evidence.length > 0 && <div className="space-y-1.5 pt-2 border-t border-white/10">{t.evidence.map(tx => <CoachTxLine key={tx.id} tx={tx} />)}</div>}
            <button onClick={() => onAsk({ label: t.observed, category: t.category, txIds: t.evidence.map(e => e.id) })}
              className="mt-auto self-start flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/15 text-xs text-white/80 hover:border-white/30 transition-all">
              <MessageCircle className="w-3.5 h-3.5" /> Explain this
            </button>
          </div>
        );
      })}
    </div>
  );
}