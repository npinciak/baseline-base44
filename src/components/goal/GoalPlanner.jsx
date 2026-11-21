import { useState, useEffect } from 'react';
import { CalendarClock } from 'lucide-react';
import { FREQUENCIES, projectPlan } from '@/lib/goalPlan';
import PlanResult from '@/components/goal/PlanResult';

export default function GoalPlanner({ goal, plan, saving, onSave }) {
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
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-5 text-white space-y-4">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-[#2EFD7A]/15 flex items-center justify-center"><CalendarClock className="w-4 h-4 text-[#2EFD7A]" /></div>
        <div>
          <h3 className="text-sm font-heading font-semibold">My savings plan</h3>
          <p className="text-xs text-white/50">Pick a rhythm that fits your paycheck. You can change it anytime.</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {FREQUENCIES.map(f => (
          <button key={f.value} onClick={() => setFrequency(f.value)} className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${frequency === f.value ? 'bg-[#2EFD7A] text-black border-[#2EFD7A]' : 'border-white/15 text-white/70 hover:text-white'}`}>{f.label}</button>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[160px]">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">$</span>
          <input type="number" min="0" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0" className="w-full bg-white/[0.05] border border-white/10 rounded-xl pl-8 pr-4 py-3 text-lg font-display font-bold focus:outline-none focus:border-[#2EFD7A]" />
        </div>
        <button onClick={() => onSave({ contribution_amount: value, frequency })} disabled={saving || !dirty} className="px-5 py-3 rounded-xl bg-gradient-to-br from-[#022C22] via-[#065F46] to-[#047857] border border-[#10B981]/40 text-sm font-semibold hover:brightness-110 disabled:opacity-40 transition-all">{saving ? 'Saving…' : 'Save plan'}</button>
      </div>
      <PlanResult p={p} amount={value} onUseNeeded={n => setAmount(String(n))} />
    </div>
  );
}