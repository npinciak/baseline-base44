import { useEffect, useMemo, useState } from 'react';
import { ChevronDown, Lock } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { buildChapters } from '@/lib/curriculum';
import ReviewScreen from '@/components/review/ReviewScreen';
import MoneyToolAudit from '@/components/review/MoneyToolAudit';

export default function CurriculumReview() {
  const [state, setState] = useState({ loading: true, allowed: false, modules: [] });
  const [openUnit, setOpenUnit] = useState(null);

  useEffect(() => {
    base44.functions.invoke('curriculumReview', {})
      .then(r => setState({ loading: false, allowed: true, modules: r.data.modules, reviews:r.data.reviews || [] }))
      .catch(() => setState({ loading: false, allowed: false, modules: [] }));
  }, []);

  const chapters = useMemo(() => buildChapters(state.modules, [], []), [state.modules]);
  const screenCount = state.modules.reduce((n, m) => n + m.lessons.length, 0);
  const saveReview = async review => {
    const result = await base44.functions.invoke('curriculumReview',{mode:'save',review});
    setState(s=>({...s,reviews:[...(s.reviews || []).filter(r=>r.tool_key !== review.tool_key),result.data.review]}));
  };
  const exportAudit = async rows => {
    const result = await base44.functions.invoke('curriculumReview',{mode:'export',rows});
    const url = URL.createObjectURL(new Blob(['\uFEFF',result.data.csv],{type:'text/csv;charset=utf-8;'}));
    const a=document.createElement('a'); a.href=url; a.download='baseline-money-tools-audit.csv'; a.click(); setTimeout(()=>URL.revokeObjectURL(url),1000);
  };

  if (state.loading) return <div className="flex items-center justify-center min-h-screen bg-black"><div className="w-8 h-8 border-4 border-white/10 border-t-[#2EA0FD] rounded-full animate-spin" /></div>;
  if (!state.allowed) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-center px-6">
      <Lock className="w-8 h-8 text-white/30 mb-3" />
      <p className="text-white text-xl font-bold">Owner access only</p>
      <p className="text-white/50 text-sm mt-1">Curriculum review is limited to the workspace owner.</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-black px-4 md:px-10 py-10">
      <div className="max-w-6xl min-w-0 mx-auto">
        <p className="text-[#2EA0FD] text-[11px] uppercase tracking-[0.25em] font-semibold mb-2">Owner tools</p>
        <h1 className="text-3xl font-display font-extrabold text-white">Curriculum Review</h1>
        <p className="text-white/50 text-sm mt-1 mb-8">{chapters.length} chapters · {state.modules.length} lessons · {screenCount} screens, exactly as learners see them.</p>
        <p className="text-sm text-muted-foreground">Unlocks follow the teaching chapters: emergency fund → bills → spending → budgeting → savings forecast → debt → credit → investing. Planned tools remain proposals, not available features. Full chapter completion and its money move are both required; paying never skips learning.</p>
        <MoneyToolAudit chapters={chapters} reviews={state.reviews} onSave={saveReview} onExport={exportAudit}/>
        <div className="space-y-6">
          {chapters.map(ch => (
            <section key={ch.id}>
              <div className="flex items-baseline gap-3 mb-2">
                <span className="text-white/30 text-sm tabular-nums">{String(ch.number).padStart(2, '0')}</span>
                <h2 className="text-white font-semibold">{ch.title}</h2>
                <span className="text-white/30 text-xs capitalize">{ch.topic}</span>
              </div>
              {ch.move && <p className="text-xs text-[#2EFD7A]/80 mb-2 pl-8">Money move: {ch.move.title}</p>}
              {ch.comingSoon && <p className="text-xs text-white/40 pl-8">No lessons mapped yet.</p>}
              <div className="space-y-2">
                {ch.modules.map(m => (
                  <div key={m.id} className="bg-white/[0.03] border border-white/10 rounded-2xl px-4">
                    <button onClick={() => setOpenUnit(openUnit === m.id ? null : m.id)} aria-expanded={openUnit === m.id} className="w-full flex items-center gap-3 py-3 text-left">
                      <span className="text-white text-sm font-medium flex-1">{m.title}</span>
                      <span className="text-white/40 text-xs">{m.lessons.length} screens</span>
                      <ChevronDown className={`w-4 h-4 text-white/40 transition-transform ${openUnit === m.id ? 'rotate-180' : ''}`} />
                    </button>
                    {openUnit === m.id && <div className="pb-2">{m.lessons.map((s, i) => <ReviewScreen key={s.id} screen={s} index={i} />)}</div>}
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}