import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Wand2, TrendingUp, MessageCircle, AlertTriangle } from 'lucide-react';
import CoachCleanup from '@/components/coach/CoachCleanup';
import CoachTrends from '@/components/coach/CoachTrends';
import CoachAsk from '@/components/coach/CoachAsk';
import CoachSummaryRow from '@/components/coach/CoachSummaryRow';
import { suggestCleanups, findTrends, dataFreshness, addSampleMess } from '@/lib/coachInsights';

const TABS = [
  { key: 'ask', label: 'Chat', Icon: MessageCircle },
  { key: 'cleanup', label: 'Cleanup', Icon: Wand2 },
  { key: 'trends', label: 'Trends', Icon: TrendingUp },
];

export default function MoneyCoach({ txs, isSample, overrides }) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState('ask');
  const [focus, setFocus] = useState(null);
  const [thread, setThread] = useState([]);
  const data = useMemo(() => (isSample ? addSampleMess(txs) : txs), [txs, isSample]);
  const cleanups = useMemo(() => suggestCleanups(data), [data]);
  const trends = useMemo(() => findTrends(data), [data]);
  const fresh = useMemo(() => dataFreshness(data), [data]);
  const askAbout = (f) => { setFocus(f); setTab('ask'); };

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#04170d] via-black to-[#06142a]">
      <CoachSummaryRow open={open} onToggle={() => setOpen(o => !o)} cleanupCount={cleanups.length} trendCount={trends.length} />
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }} className="overflow-hidden">
            <div className="border-t border-white/10 p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex gap-1 bg-white/[0.05] rounded-xl p-1">
                  {TABS.map(({ key, label, Icon }) => (
                    <button key={key} onClick={() => setTab(key)}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${tab === key ? 'bg-[#2EFD7A] text-black' : 'text-white/60 hover:text-white'}`}>
                      <Icon className="w-3.5 h-3.5" /> {label}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-white/45">Suggestions only. Never moves money or edits bank history.</p>
              </div>
              {(isSample || fresh.stale) && (
                <div className="flex items-start gap-2 px-3 py-2 rounded-xl border border-[#F5A623]/30 bg-[#F5A623]/10 text-[11px] text-white/80">
                  <AlertTriangle className="w-3.5 h-3.5 text-[#F5A623] shrink-0 mt-px" />
                  {isSample ? 'Showing sample data. Link your bank to get coaching on your real numbers.'
                    : `Your newest transaction is from ${fresh.latest || 'an unknown date'}, so recent activity may be missing.`}
                </div>
              )}
              <div className={tab === 'ask' ? '' : 'max-h-80 overflow-y-auto pr-1'}>
                {tab === 'cleanup' && <CoachCleanup items={cleanups} isSample={isSample} overrides={overrides} onAsk={askAbout} />}
                {tab === 'trends' && <CoachTrends trends={trends} onAsk={askAbout} />}
                {tab === 'ask' && <CoachAsk txs={data} isSample={isSample} focus={focus} clearFocus={() => setFocus(null)} thread={thread} setThread={setThread} />}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}