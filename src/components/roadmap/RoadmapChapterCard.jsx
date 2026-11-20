import { useState } from 'react';
import { ChevronDown, Link2, ShieldCheck, Sparkles, BookOpen } from 'lucide-react';
import { LESSON_REWARD } from '@/lib/coinEconomy';

export default function RoadmapChapterCard({ chapter, stageNumber, indexInStage }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.025] hover:border-white/20 transition-colors overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="w-full p-4 sm:p-5 text-left flex items-start justify-between gap-4"
      >
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#2EA0FD]/15 text-[#2EA0FD] border border-[#2EA0FD]/30">
              Stage {stageNumber}.{indexInStage + 1}
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/10 text-white/75 capitalize">
              {chapter.topic}
            </span>
            <span className="text-xs text-white/45 flex items-center gap-1">
              <BookOpen className="w-3 h-3" /> {chapter.units.length} lessons · +{chapter.units.length * LESSON_REWARD} BC
            </span>
          </div>

          <h4 className="text-base sm:text-lg font-heading font-bold text-white">{chapter.title}</h4>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-white/60">
            <span className="inline-flex items-center gap-1 text-[#2EFD7A]/90">
              <Link2 className="w-3.5 h-3.5" />
              Builds on {chapter.prerequisiteTitle}
            </span>
          </div>
        </div>

        <ChevronDown className={`w-5 h-5 text-white/50 shrink-0 mt-1 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="px-4 sm:px-5 pb-5 pt-2 border-t border-white/[0.07] space-y-4">
          <div className="rounded-xl bg-[#2EA0FD]/[0.07] border border-[#2EA0FD]/25 p-3.5 text-xs text-white/80 leading-relaxed">
            <p className="font-semibold text-[#2EA0FD] flex items-center gap-1.5 mb-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Anti-Redundancy Scope Boundary
            </p>
            {chapter.boundaryNote}
          </div>

          <div>
            <p className="text-[11px] uppercase tracking-wider text-white/45 font-semibold mb-2">
              Planned Lesson Units ({chapter.units.length})
            </p>
            <ol className="grid sm:grid-cols-2 gap-2">
              {chapter.units.map((unitTitle, idx) => (
                <li
                  key={unitTitle}
                  className="flex items-start gap-2.5 rounded-xl bg-black/45 border border-white/10 px-3 py-2.5 text-xs text-white/85"
                >
                  <span className="w-5 h-5 rounded-md bg-white/10 text-white/70 font-bold flex items-center justify-center shrink-0 tabular-nums">
                    {idx + 1}
                  </span>
                  <span className="leading-snug">{unitTitle}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="rounded-xl bg-[#2EFD7A]/[0.06] border border-[#2EFD7A]/25 p-3.5 text-xs">
            <p className="font-semibold text-[#2EFD7A] flex items-center gap-1.5 mb-0.5">
              <Sparkles className="w-3.5 h-3.5" /> Practical Money Move
            </p>
            <p className="text-white/80">{chapter.moneyMove}</p>
          </div>
        </div>
      )}
    </div>
  );
}