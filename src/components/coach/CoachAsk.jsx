import { useEffect, useRef, useState } from 'react';
import { Send, ShieldCheck, X, Loader2, RotateCcw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { base44 } from '@/api/base44Client';
import { buildQuestionContext } from '@/lib/coachInsights';

const STARTERS = ['Where did most of my money go last month?', 'Why is my food spending higher?', 'Which subscriptions could I cut?', 'How can I save $50 this month?'];

export default function CoachAsk({ txs, isSample, focus, clearFocus, thread, setThread, pending, clearPending }) {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }, [thread, loading]);

  const ask = async (text) => {
    const q = (text || question).trim();
    if (!q || loading) return;
    setQuestion('');
    const history = thread.slice(-6).map(m => `${m.role === 'user' ? 'User' : 'Coach'}: ${m.text}`).join('\n');
    setThread(t => [...t, { role: 'user', text: q }]);
    setLoading(true);
    const context = buildQuestionContext(q, txs, focus);
    const res = await base44.functions.invoke('moneyCoachAsk', { question: q, history, context, isSample });
    const reply = res?.data || {};
    setThread(t => [...t, { role: 'coach', text: reply.answer, followUps: (reply.follow_ups || []).slice(0, 2), used: context.transactions.length }]);
    setLoading(false);
  };

  useEffect(() => {
    if (pending) { clearPending(); ask(pending); }
  }, [pending]); // eslint-disable-line react-hooks/exhaustive-deps

  const last = thread[thread.length - 1];
  const chips = thread.length === 0 ? (focus ? ['Explain this', 'Is this normal for me?'] : STARTERS) : (!loading && last?.followUps) || [];

  return (
    <div className="space-y-3">
      {thread.length === 0 && (
        <div className="flex items-start gap-2 text-[11px] text-white/50">
          <ShieldCheck className="w-3.5 h-3.5 text-[#2EFD7A] shrink-0 mt-px" />
          Only monthly totals and transactions matching your question are sent to our AI service. Full history and account numbers are never shared.
        </div>
      )}

      {focus && (
        <div className="flex items-center gap-2 text-xs text-white/80 bg-[#2EFD7A]/10 border border-[#2EFD7A]/30 rounded-full pl-3 pr-1 py-1 w-fit max-w-full">
          <span className="truncate">About: {focus.label}</span>
          <button onClick={clearFocus} className="p-1 rounded-full hover:bg-white/10"><X className="w-3 h-3" /></button>
        </div>
      )}

      {thread.length > 0 && (
        <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
          {thread.map((m, i) => (
            <div key={i} className={m.role === 'user' ? 'flex justify-end' : ''}>
              <div className={`rounded-2xl px-3.5 py-2.5 text-sm max-w-[85%] ${m.role === 'user' ? 'bg-[#2EFD7A] text-black' : 'bg-white/[0.05] border border-white/10 text-white/85'}`}>
                {m.role === 'user' ? m.text : <div className="prose prose-sm prose-invert max-w-none"><ReactMarkdown>{m.text}</ReactMarkdown></div>}
                {m.role === 'coach' && <p className="text-[10px] text-white/40 mt-1.5">Based on monthly totals and {m.used} matching transaction{m.used === 1 ? '' : 's'}.</p>}
              </div>
            </div>
          ))}
          {loading && <div className="flex items-center gap-2 text-xs text-white/50"><Loader2 className="w-4 h-4 animate-spin" /> Looking through your numbers…</div>}
          <div ref={endRef} />
        </div>
      )}

      {chips.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {chips.map(s => (
            <button key={s} onClick={() => ask(s)} disabled={loading} className="px-3 py-1 rounded-full border border-white/15 text-xs text-white/80 hover:border-[#2EFD7A]/60 hover:text-white transition-all disabled:opacity-40">{s}</button>
          ))}
        </div>
      )}

      <form onSubmit={(e) => { e.preventDefault(); ask(); }} className="flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] pl-4 pr-1.5 py-1.5 focus-within:border-[#2EFD7A]/60 transition-colors">
        <input value={question} onChange={e => setQuestion(e.target.value)} placeholder={thread.length ? 'Ask a follow-up…' : 'Ask about a charge, category or trend…'}
          className="flex-1 min-w-0 bg-transparent text-sm text-white placeholder:text-white/35 outline-none" />
        {thread.length > 0 && (
          <button type="button" onClick={() => setThread([])} disabled={loading} title="New chat" className="w-8 h-8 rounded-full text-white/50 hover:text-white flex items-center justify-center disabled:opacity-40">
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        )}
        <button type="submit" disabled={!question.trim() || loading} className="w-8 h-8 rounded-full bg-[#2EFD7A] text-black flex items-center justify-center disabled:opacity-40">
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
        </button>
      </form>
    </div>
  );
}