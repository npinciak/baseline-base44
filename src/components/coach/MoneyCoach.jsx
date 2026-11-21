import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Sparkles, Wand2, TrendingUp, MessageCircle, AlertTriangle } from 'lucide-react';
import CoachCleanup from '@/components/coach/CoachCleanup';
import CoachTrends from '@/components/coach/CoachTrends';
import CoachAsk from '@/components/coach/CoachAsk';
import { suggestCleanups, findTrends, dataFreshness, addSampleMess } from '@/lib/coachInsights';

const TABS = [
  { key: 'cleanup', label: 'Cleanup', Icon: Wand2 },
  { key: 'trends', label: 'Trends', Icon: TrendingUp },
  { key: 'ask', label: 'Ask', Icon: MessageCircle },
];

export default function MoneyCoach({ txs, isSample, overrides }) {
  const [tab, setTab] = useState('cleanup');
  const [focus, setFocus] = useState(null);
  const data = useMemo(() => (isSample ? addSampleMess(txs) : txs), [txs, isSample]);
  const cleanups = useMemo(() => suggestCleanups(data), [data]);
  const trends = useMemo(() => findTrends(data), [data]);
  const fresh = useMemo(() => dataFreshness(data), [data]);
  const askAbout = (f) => { setFocus(f); setTab('ask'); };

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#04170d] via-black to-[#06142a] p-5 sm:p-7 shadow-[0_0_60px_-20px_rgba(46,253,122,0.4)]">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <p className="flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-[#2EFD7A] font-semibold mb-2">
            <Sparkles className="w-4 h-4" /> Money Coach
          </p>
          <h3 className="text-2xl sm:text-3xl font-display font-bold text-white">Your money, explained.</h3>
          <p className="text-white/55 text-sm mt-1 max-w-lg">Suggestions only. The coach never moves money or changes your bank history.</p>
        </div>
        <div className="flex gap-1 bg-white/[0.05] rounded-xl p-1">
          {TABS.map(({ key, label, Icon }) => (
            <button key={key} onClick={() => setTab(key)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${tab === key ? 'bg-[#2EFD7A] text-black' : 'text-white/60 hover:text-white'}`}>
              <Icon className="w-3.5 h-3.5" /> {label}
            </button>
          ))}
        </div>
      </div>

      {(isSample || fresh.stale) && (
        <div className="flex items-start gap-2 mb-5 px-4 py-3 rounded-xl border border-[#F5A623]/30 bg-[#F5A623]/10 text-xs text-white/80">
          <AlertTriangle className="w-4 h-4 text-[#F5A623] shrink-0 mt-px" />
          {isSample ? 'Showing sample data. Link your bank to get coaching on your real numbers.'
            : `Your newest transaction is from ${fresh.latest || 'an unknown date'}, so recent activity may be missing.`}
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
          {tab === 'cleanup' && <CoachCleanup items={cleanups} isSample={isSample} overrides={overrides} onAsk={askAbout} />}
          {tab === 'trends' && <CoachTrends trends={trends} onAsk={askAbout} />}
          {tab === 'ask' && <CoachAsk txs={data} isSample={isSample} focus={focus} clearFocus={() => setFocus(null)} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}