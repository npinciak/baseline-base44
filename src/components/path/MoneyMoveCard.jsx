import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Zap, Check, Lock, ArrowRight, Unlock } from 'lucide-react';
import { MONEY_TOOLS, TOOL_LINKS } from '@/lib/curriculum';

/** The chapter's practice step: unlocks after the lessons, unlocks Money tools once done. */
export default function MoneyMoveCard({ chapter, onComplete }) {
  const [saving, setSaving] = useState(false);
  const { move } = chapter;
  if (!move) return null;
  const unlocks = [
    ...(move.unlocks ? [{ label: move.unlocks }] : []),
    ...Object.values(MONEY_TOOLS).filter((t) => t.chapter === chapter.id && !['removed', 'planned'].includes(t.decision)),
  ];
  const opensTool = move.key === 'create-emergency-fund' || move.key === 'connect-bank';
  const link = move.tool && TOOL_LINKS[move.tool];
  const ready = chapter.unlocked && chapter.learned;

  const markDone = async () => { setSaving(true); await onComplete(chapter); setSaving(false); };

  return (
    <div className={`mx-4 mt-2 rounded-2xl border p-5 transition-colors ${chapter.moveDone ? 'border-[#2EFD7A]/40 bg-[#2EFD7A]/[0.06]' : 'border-white/10 bg-white/[0.03]'}`}>
      <div className="flex items-center gap-2 mb-2">
        {chapter.moveDone ? <Check className="w-4 h-4 text-[#2EFD7A]" /> : ready ? <Zap className="w-4 h-4 text-[#2EFD7A]" /> : <Lock className="w-4 h-4 text-white/40" />}
        <span className={`text-[11px] tracking-widest uppercase font-semibold ${ready || chapter.moveDone ? 'text-[#2EFD7A]' : 'text-white/55'}`}>Money move</span>
      </div>
      <p className={`font-semibold leading-snug ${ready || chapter.moveDone ? 'text-white' : 'text-white/80'}`}>{move.title}</p>
      <p className="text-white/60 text-sm mt-1">{move.detail}</p>
      {!ready && !chapter.moveDone && (
        <p className="text-white/40 text-xs mt-2">
          {chapter.unlocked ? 'Finish this chapter’s lessons to unlock this move.' : 'Unlocks after you complete this chapter’s lessons.'}
        </p>
      )}
      {ready && !chapter.moveDone && !opensTool && <p className="text-white/60 text-xs mt-2">Use your bank statement, a calculator or your own notes for this practice step. The full tool opens after you complete the move.</p>}
      {unlocks.length > 0 && (
        <p className="flex items-center gap-1.5 text-xs text-[#2EA0FD] mt-3">
          <Unlock className="w-3.5 h-3.5" /> Unlocks {unlocks.map((t) => t.label).join(', ')}
        </p>
      )}
      {ready && !chapter.moveDone && (
        <div className="flex flex-wrap gap-2 mt-4">
          {link && opensTool && (
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