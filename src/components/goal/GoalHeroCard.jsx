import { CheckCircle, Pencil, Trash2, CalendarDays } from 'lucide-react';
import GoalCheer from '@/components/goal/GoalCheer';
import { CARD, BTN_T, FALLBACK_GOAL_IMAGE } from '@/lib/goalStyles';

export default function GoalHeroCard({ goal, typeLabel, saved, target, onEdit, onComplete, onDelete }) {
  const pct = target > 0 ? Math.min(100, (saved / target) * 100) : 0;
  const remaining = Math.max(0, target - saved);
  const isComplete = saved >= target;
  return (
    <div className={`${CARD} overflow-hidden grid lg:grid-cols-[1.25fr_1fr]`}>
      <div>
        <div className="relative h-[300px]">
          <img src={goal.image || FALLBACK_GOAL_IMAGE} alt={goal.name} className="w-full h-full object-cover block" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,9,11,.1),rgba(7,9,11,.88))]" />
          {isComplete && <div className="absolute top-4 right-4 bg-[#2efd7a] text-[#04140b] text-[11px] font-extrabold px-3 py-1.5 rounded-full flex items-center gap-[5px]"><CheckCircle className="w-[13px] h-[13px]" /> Complete</div>}
          <div className="absolute inset-x-0 bottom-0 px-[26px] py-[22px] flex justify-between items-end gap-3">
            <div>
              <h1 className="text-[34px] leading-[1.1] font-extrabold tracking-[-0.02em]">{goal.name}</h1>
              {typeLabel && <span className="block text-[11px] font-bold tracking-[0.14em] uppercase text-[#7ee8ae] mt-1.5">{typeLabel}</span>}
            </div>
            <button onClick={onEdit} className={`${BTN_T} inline-flex items-center gap-1.5 px-[14px] py-[9px] rounded-xl text-xs font-semibold text-[#e9efec] bg-white/10 border border-white/[0.22] hover:bg-white/20 active:bg-white/[0.28] shrink-0`}><Pencil className="w-3.5 h-3.5" /> Edit Goal</button>
          </div>
        </div>
        <GoalCheer saved={saved} target={target} />
        <div className="flex justify-between px-[26px] py-3 border-t border-[#232a2e] bg-[#0b0e10]">
          {!isComplete ? <button onClick={onComplete} className={`${BTN_T} flex items-center gap-[5px] text-xs font-medium text-[#8a9a93] hover:text-[#2efd7a]`}><CheckCircle className="w-3.5 h-3.5" /> Mark complete</button> : <span />}
          <button onClick={onDelete} className={`${BTN_T} flex items-center gap-[5px] text-xs font-medium text-[#8a9a93] hover:text-[#ff6b6b]`}><Trash2 className="w-3.5 h-3.5" /> Delete</button>
        </div>
      </div>
      <div className="px-6 py-[22px] flex flex-col justify-center gap-5">
        <h3 className="text-sm font-bold">Overview</h3>
        <div className="flex items-center gap-[22px]">
          <div className="w-[150px] h-[150px] rounded-full flex items-center justify-center shrink-0" style={{ background: `conic-gradient(#2efd7a 0 ${pct}%, #1d2327 ${pct}% 100%)` }}>
            <div className="w-[112px] h-[112px] rounded-full bg-[#0e1113] flex flex-col items-center justify-center">
              <small className="text-[11px] text-[#8a9a93] font-semibold">Goal</small>
              <b className="text-xl font-extrabold">${target.toLocaleString()}</b>
            </div>
          </div>
          <div className="flex-1 flex flex-col gap-2.5 text-xs text-[#8a9a93]">
            <div className="flex justify-between items-center"><span className="flex items-center gap-2"><i className="w-2.5 h-2.5 rounded-full bg-[#2efd7a]" />Total Saved</span><b className="text-[13px] text-[#e9efec]">${saved.toLocaleString()}</b></div>
            <div className="flex justify-between items-center"><span className="flex items-center gap-2"><i className="w-2.5 h-2.5 rounded-full bg-[#1d2327] border border-[#2f383d]" />Need to save</span><b className="text-[13px] text-[#e9efec]">${remaining.toLocaleString()}</b></div>
          </div>
        </div>
        {goal.target_date && <div className="flex items-center gap-2 border-t border-[#232a2e] pt-3 text-xs text-[#8a9a93]"><CalendarDays className="w-3.5 h-3.5" /><span>Target: <b className="text-[#e9efec] font-semibold">{goal.target_date}</b></span></div>}
      </div>
    </div>
  );
}