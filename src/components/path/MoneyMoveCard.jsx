import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Zap, Check, Lock, ArrowRight, Unlock } from 'lucide-react';
import { MONEY_TOOLS, TOOL_LINKS } from '@/lib/curriculum';

/** The chapter's practice step: unlocks after the lessons, unlocks Money tools once done. */
export default function MoneyMoveCard({ chapter, onComplete }) {
  const [saving, setSaving] = useState(false);
  const { move } = chapter;
  if (!move) return null;
  const unlocks = Object.values(MONEY_TOOLS).filter((t) => t.chapter === chapter.id);
  const link = move.tool && TOOL_LINKS[move.tool];
  const ready = chapter.learned;

  const markDone = async () => { setSaving(true); await onComplete(chapter); setSaving(false); };

  return (
    <div className={`mx-4 mt-2 rounded-2xl border p-5 transition-colors ${chapter.moveDone ? 'border-[#2EFD7A]/40 bg-[#2EFD7A]/[0.06]' : 'border-white/10 bg-white/[0.03]'}`}>
      <div className="flex items-center gap-2 mb-2">
        {chapter.moveDone ? <Check className="w-4 h-4 text-[#2EFD7A]" /> : ready ? <Zap className="w-4 h-4 text-[#2EFD7A]" /> : <Lock className="w-4 h-4 text-white/40" />}
        <span className="text-[11px] tracking-widest uppercase font-semibold text-[#2EFD7A]">Money move</span>
      </div>
      <p className="text-white font-semibold leading-snug">{move.title}</p>
      <p className="text-white/60 text-sm mt-1">{ready ? move.detail : 'Finish this chapter’s lessons to unlock this move.'}</p>
      {unlocks.length > 0 && (
        <p className="flex items-center gap-1.5 text-xs text-[#2EA0FD] mt-3">
          <Unlock className="w-3.5 h-3.5" /> Unlocks {unlocks.map((t) => t.label).join(', ')}
        </p>
      )}
      {ready && !chapter.moveDone && (
        <div className="flex flex-wrap gap-2 mt-4">
          {link && (
            <Link to={link} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-white/15 text-white text-sm hover:border-white/40 transition-colors">
              Open tool <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
          {move.key !== 'create-emergency-fund' && <button onClick={markDone} disabled={saving} className="px-4 py-2 rounded-full bg-[#2EFD7A] text-black text-sm font-semibold hover:bg-[#2EFD7A]/90 disabled:opacity-50 transition-all">
            {saving ? 'Saving…' : 'I did it'}
          </button>}
        </div>
      )}
      {chapter.moveDone && <p className="text-sm text-[#2EFD7A] font-medium mt-3">Done. Nice work.</p>}
    </div>
  );
}