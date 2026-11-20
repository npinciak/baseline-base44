import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronUp, ChevronDown, Lock, Clock } from 'lucide-react';
import RingGauge from '@/components/dashboard/RingGauge';
import ChapterPath from '@/components/path/ChapterPath';
import MoneyMoveCard from '@/components/path/MoneyMoveCard';

export default function ChapterSection({ chapter, meta, defaultOpen, isAdmin = false, onCompleteMove }) {
  const [open, setOpen] = useState(defaultOpen);
  const navigate = useNavigate();
  const total = chapter.modules.length;
  const pct = total ? (chapter.lessonsDone / total) * 100 : 0;
  const sub = chapter.comingSoon ? 'Coming soon' : `${chapter.lessonsDone} of ${total} lessons${chapter.moveDone ? ' · move done' : ''}`;
  const canOpenLessons = chapter.unlocked || isAdmin;

  return (
    <div className={`rounded-2xl overflow-hidden border border-white/10 bg-white/[0.03] backdrop-blur-sm mb-4 ${chapter.comingSoon ? 'opacity-60' : ''}`}>
      <button onClick={() => setOpen((o) => !o)} className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/[0.04] transition-colors">
        <div className="flex items-center gap-3 text-left min-w-0">
          <div
            className="chapter-badge-gradient w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-black text-sm font-extrabold"
            style={{
              backgroundImage: `linear-gradient(135deg, ${meta.from} 0%, ${meta.mid || meta.to} 45%, ${meta.to} 80%, ${meta.from} 100%)`,
              boxShadow: `0 0 18px -4px ${meta.from}77`,
              animationDelay: `${(meta.index || 0) * -0.35}s`,
            }}
          >
            {chapter.number}
          </div>
          <div className="min-w-0">
            <p className="text-sm text-white leading-tight truncate">{chapter.title}</p>
            <p className="text-xs text-white/60 mt-0.5">{sub}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0 ml-4">
          <RingGauge pct={pct} size={30} strokeWidth={3} color={meta.from}>
            <span className="text-[9px] font-bold text-white">{Math.round(pct)}%</span>
          </RingGauge>
          {open ? <ChevronUp className="w-4 h-4 text-white/30" /> : <ChevronDown className="w-4 h-4 text-white/30" />}
        </div>
      </button>

      {open && (
        <div className="py-4">
          {chapter.comingSoon ? (
            <div className="flex flex-col items-center py-8 gap-2 text-white/40">
              <Clock className="w-6 h-6" />
              <p className="text-xs text-white/60">Lessons for this chapter are on the way.</p>
            </div>
          ) : (
            <>
              {!canOpenLessons && (
                <div className="mx-5 mb-2 flex items-center justify-center gap-1.5 text-xs text-white/50">
                  <Lock className="w-3.5 h-3.5 shrink-0" />
                  <span>Complete the previous chapter and its Money Move to unlock.</span>
                </div>
              )}
              <ChapterPath
                units={chapter.modules}
                meta={meta}
                unlocked={chapter.unlocked}
                isAdmin={isAdmin}
                onOpen={(id) => canOpenLessons && navigate(`/lesson/${id}`)}
              />
              <MoneyMoveCard chapter={chapter} onComplete={onCompleteMove} />
            </>
          )}
        </div>
      )}
    </div>
  );
}