import { useState, useEffect } from 'react';
import { CalendarClock } from 'lucide-react';
import { FREQUENCIES, projectPlan } from '@/lib/goalPlan';
import PlanResult from '@/components/goal/PlanResult';
import { ICON_BOX, BTN_T } from '@/lib/goalStyles';

export default function GoalPlanner({ goal, plan, saving, onSave, children }) {
  const [frequency, setFrequency] = useState(plan?.frequency || 'monthly');
  const [amount, setAmount] = useState(plan?.contribution_amount ?? '');
  useEffect(() => {
    setFrequency(plan?.frequency || 'monthly');
    setAmount(plan?.contribution_amount ?? '');
  }, [plan]);

  const value = parseFloat(amount) || 0;
  const p = projectPlan({ saved: goal.current_amount || 0, target: goal.target_amount || 0, targetDate: goal.target_date, amount: value, frequency });
  const dirty = value !== (plan?.contribution_amount ?? 0) || frequency !== (plan?.frequency || 'monthly');

  return (
    <div className="rounded-[20px] border border-[#1f4a35] bg-gradient-to-b from-[#101a15] to-[#0d1210] p-[22px] shadow-[0_18px_40px_rgba(0,0,0,.45),inset_0_1px_0_rgba(255,255,255,.04)] text-[#e9efec] flex flex-col gap-[18px]">
      <div className="flex items-center gap-3">
        <div className={ICON_BOX}><CalendarClock className="w-4 h-4 text-[#2efd7a]" /></div>
        <div>
          <h3 className="text-base font-bold tracking-[-0.01em]">My savings plan</h3>
          <p className="text-xs text-[#7d8d86] mt-0.5">Pick a rhythm that fits your paycheck. You can change it anytime.</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {FREQUENCIES.map(f => (
          <button key={f.value} onClick={() => setFrequency(f.value)} className={`${BTN_T} px-4 py-2 rounded-full text-xs font-semibold border ${frequency === f.value ? 'bg-[#2efd7a] text-[#04140b] border-[#2efd7a]' : 'border-[#2f383d] text-[#aab8b1] hover:text-white hover:border-[#4a565c]'}`}>{f.label}</button>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[160px]">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6b7a73] text-lg">$</span>
          <input type="number" min="0" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0" className="w-full bg-[#0a0d0f] border border-[#232a2e] rounded-[14px] pl-[34px] pr-4 py-[14px] text-[22px] font-bold text-white focus:outline-none focus:border-[#2efd7a]" />
        </div>
        <button onClick={() => onSave({ contribution_amount: value, frequency })} disabled={saving || !dirty} className={`${BTN_T} px-[26px] py-[15px] rounded-[14px] border border-[#10b981]/50 bg-[linear-gradient(135deg,#022c22,#065f46_60%,#047857)] text-white text-[13px] font-bold hover:shadow-[0_0_22px_rgba(46,253,122,.3)] active:shadow-none disabled:opacity-40`}>{saving ? 'Saving…' : 'Save plan'}</button>
      </div>
      <PlanResult p={p} amount={value} onUseNeeded={n => setAmount(String(n))} />
      {children}
    </div>
  );
}