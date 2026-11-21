import { useState } from 'react';
import { Send, ShieldCheck, X, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { base44 } from '@/api/base44Client';
import { buildQuestionContext } from '@/lib/coachInsights';

const STARTERS = ['Where did most of my money go last month?', 'Why is my food spending higher?', 'Which subscriptions could I cut?'];

export default function CoachAsk({ txs, isSample, focus, clearFocus }) {
  const [question, setQuestion] = useState('');
  const [thread, setThread] = useState([]);
  const [loading, setLoading] = useState(false);

  const ask = async (text) => {
    const q = (text || question).trim();
    if (!q || loading) return;
    setQuestion('');
    setThread(t => [...t, { role: 'user', text: q }]);
    setLoading(true);
    const context = buildQuestionContext(q, txs, focus);
    const answer = await base44.integrations.Core.InvokeLLM({
      prompt: `You are Baseline's Money Coach for students and young adults. Answer the question using ONLY the context below.
Rules: be friendly and brief (under 120 words). Cite specific numbers or transactions from the context as evidence.
Clearly separate what the data shows from estimates. If the context does not contain enough information, say so plainly.
Never recommend specific investments, never claim to move money or change accounts, and never invent transactions.
${isSample ? 'This is SAMPLE data, mention that once.' : ''}
Context (JSON): ${JSON.stringify(context)}
Question: ${q}`,
    });
    setThread(t => [...t, { role: 'coach', text: answer, used: context.transactions.length }]);
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2 px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white/60">
        <ShieldCheck className="w-4 h-4 text-[#2EFD7A] shrink-0" />
        When you ask, Baseline sends monthly totals and only the transactions that match your question to our AI service. Your full history and account numbers are never shared.
      </div>

      {focus && (
        <div className="flex items-center gap-2 text-xs text-white/80 bg-[#2EFD7A]/10 border border-[#2EFD7A]/30 rounded-full pl-3 pr-1 py-1 w-fit max-w-full">
          <span className="truncate">About: {focus.label}</span>
          <button onClick={clearFocus} className="p-1 rounded-full hover:bg-white/10"><X className="w-3 h-3" /></button>
        </div>
      )}

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {thread.length === 0 && (
          <div className="flex flex-wrap gap-2">
            {(focus ? ['Explain this', 'Is this normal for me?'] : STARTERS).map(s => (
              <button key={s} onClick={() => ask(s)} className="px-3 py-1.5 rounded-full border border-white/15 text-xs text-white/80 hover:border-[#2EFD7A]/60 transition-all">{s}</button>
            ))}
          </div>
        )}
        {thread.map((m, i) => (
          <div key={i} className={m.role === 'user' ? 'flex justify-end' : ''}>
            <div className={`rounded-2xl px-4 py-3 text-sm max-w-[85%] ${m.role === 'user' ? 'bg-[#2EFD7A] text-black' : 'bg-white/[0.05] border border-white/10 text-white/85'}`}>
              {m.role === 'user' ? m.text : <div className="prose prose-sm prose-invert max-w-none"><ReactMarkdown>{m.text}</ReactMarkdown></div>}
              {m.role === 'coach' && <p className="text-[10px] text-white/40 mt-2">Based on monthly totals and {m.used} matching transaction{m.used === 1 ? '' : 's'}.</p>}
            </div>
          </div>
        ))}
        {loading && <div className="flex items-center gap-2 text-xs text-white/50"><Loader2 className="w-4 h-4 animate-spin" /> Looking through your numbers…</div>}
      </div>

      <form onSubmit={(e) => { e.preventDefault(); ask(); }} className="flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] pl-4 pr-1.5 py-1.5 focus-within:border-[#2EFD7A]/60 transition-colors">
        <input value={question} onChange={e => setQuestion(e.target.value)} placeholder="Ask about a charge, category or trend…"
          className="flex-1 bg-transparent text-sm text-white placeholder:text-white/35 outline-none" />
        <button type="submit" disabled={!question.trim() || loading} className="w-8 h-8 rounded-full bg-[#2EFD7A] text-black flex items-center justify-center disabled:opacity-40">
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
}