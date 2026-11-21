import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Lock, Check, BookOpen, ArrowRight } from 'lucide-react';
import LockedToolPreview from '@/components/money/LockedToolPreview';

/** Shown in place of an advanced Money tool until its chapter lessons and money move are done. */
export default function LockedToolCard({ access, onCompleteMove, toolKey }) {
  const [saving, setSaving] = useState(false);
  const { label, blurb, chapter } = access;
  const next = chapter.modules.find((m) => !m.completed);
  const markDone = async () => { setSaving(true); await onCompleteMove(chapter); setSaving(false); };

  return (
    <div className="relative isolate overflow-hidden rounded-3xl border border-white/10 bg-black min-h-[18rem] h-full">
      {/* Preview sits in normal flow so the locked card matches the unlocked tool's size */}
      <div aria-hidden="true" inert="" className="pointer-events-none select-none blur-sm opacity-50">
        <LockedToolPreview toolKey={toolKey} />
      </div>
      <div aria-hidden="true" className="absolute inset-0 bg-background/70 pointer-events-none" />
      <div className="absolute inset-0 overflow-y-auto p-6 sm:p-8 flex flex-col justify-center items-start gap-4">
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-[#2EFD7A] shrink-0" />
          <span className="text-[11px] tracking-widest uppercase font-semibold text-[#2EFD7A] whitespace-nowrap">Unlock this tool</span>
        </div>
        <div>
          <h3 className="text-white text-xl font-semibold">{label}</h3>
          <p className="text-white/60 text-sm mt-1 max-w-md">{blurb}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-white/5">
            {chapter.learned ? <Check className="w-4 h-4 text-[#2EFD7A]" /> : <BookOpen className="w-4 h-4 text-white/50" />}
          </div>
          <div className="min-w-0">
            <p className="text-sm text-white/80">Chapter {chapter.number}: {chapter.title}</p>
            {chapter.comingSoon && <p className="text-xs text-white/50 mt-0.5">Lessons coming soon</p>}
          </div>
        </div>
        {!chapter.learned && !chapter.comingSoon && (
          <Link to={chapter.unlocked && next ? `/lesson/${next.id}` : '/dashboard'}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#2EFD7A] text-black text-sm font-semibold hover:bg-[#2EFD7A]/90 transition-all">
            {chapter.unlocked ? 'Continue chapter' : 'Go to BasePath'} <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        )}
        {chapter.unlocked && chapter.learned && !chapter.moveDone && (
          <button onClick={markDone} disabled={saving}
            className="px-4 py-2 rounded-full bg-[#2EFD7A] text-black text-sm font-semibold hover:bg-[#2EFD7A]/90 disabled:opacity-50 transition-all">
            {saving ? 'Saving…' : `I did this: ${chapter.move.title}`}
          </button>
        )}
      </div>
    </div>
  );
}