import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Lock, Check, BookOpen, Zap, ArrowRight } from 'lucide-react';
import LockedToolPreview from '@/components/money/LockedToolPreview';

function Step({ done, Icon, color, title, sub }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: done ? `${color}26` : 'rgba(255,255,255,0.05)' }}>
        {done ? <Check className="w-4 h-4" style={{ color }} /> : <Icon className="w-4 h-4 text-white/50" />}
      </div>
      <div className="min-w-0">
        <p className={`text-sm leading-tight ${done ? 'text-white' : 'text-white/80'}`}>{title}</p>
        <p className="text-xs text-white/50 mt-0.5">{sub}</p>
      </div>
    </div>
  );
}

/** Shown in place of an advanced Money tool until its chapter lessons and money move are done. */
export default function LockedToolCard({ access, onCompleteMove, toolKey }) {
  const [saving, setSaving] = useState(false);
  const { label, blurb, chapter } = access;
  const next = chapter.modules.find((m) => !m.completed);
  const markDone = async () => { setSaving(true); await onCompleteMove(chapter); setSaving(false); };

  return (
    <div className="relative isolate overflow-hidden rounded-2xl border border-border bg-card p-6 sm:p-8 flex flex-col xl:flex-row xl:items-center gap-6">
      <div aria-hidden="true" inert="" className="absolute inset-0 pointer-events-none select-none blur-sm opacity-50">
        <LockedToolPreview toolKey={toolKey} />
      </div>
      <div aria-hidden="true" className="absolute inset-0 bg-background/70 pointer-events-none" />
      <div className="relative flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-2">
          <Lock className="w-4 h-4 text-[#2EFD7A]" />
          <span className="text-[11px] tracking-widest uppercase font-semibold text-[#2EFD7A]">Unlock this tool</span>
        </div>
        <h3 className="text-white text-xl font-semibold">{label}</h3>
        <p className="text-white/60 text-sm mt-1 max-w-md">{blurb}</p>
      </div>
      <div className="relative min-w-0 xl:w-80 space-y-3">
        <Step done={chapter.learned} Icon={BookOpen} color="#2EFD7A" title={`Chapter ${chapter.number}: ${chapter.title}`}
          sub={chapter.comingSoon ? 'Lessons coming soon' : `${chapter.lessonsDone} of ${chapter.modules.length} lessons done`} />
        <Step done={chapter.moveDone} Icon={Zap} color="#2EFD7A" title={chapter.move.title} sub="Complete all chapter lessons, then this money move" />
        {!chapter.learned && !chapter.comingSoon && (
          <Link to={chapter.unlocked && next ? `/lesson/${next.id}` : '/dashboard'}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#2EFD7A] text-black text-sm font-semibold hover:bg-[#2EFD7A]/90 transition-all">
            {chapter.unlocked ? 'Continue chapter' : 'Go to BasePath'} <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        )}
        {chapter.unlocked && chapter.learned && !chapter.moveDone && (
          <button onClick={markDone} disabled={saving}
            className="px-4 py-2 rounded-full bg-[#2EFD7A] text-black text-sm font-semibold hover:bg-[#2EFD7A]/90 disabled:opacity-50 transition-all">
            {saving ? 'Saving…' : 'I did this move'}
          </button>
        )}
      </div>
    </div>
  );
}