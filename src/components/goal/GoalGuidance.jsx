import { Lightbulb, Coffee, Layers, Zap } from 'lucide-react';
import { money, projectPlan } from '@/lib/goalPlan';

function buildTips(goal, plan) {
  const saved = goal.current_amount || 0;
  const target = goal.target_amount || 0;
  const amount = plan?.contribution_amount || 0;
  const p = projectPlan({ saved, target, targetDate: goal.target_date, amount, frequency: plan?.frequency });
  const nextMilestone = [0.25, 0.5, 0.75, 1].map(m => m * target).find(v => v > saved);
  const tips = [];
  if (nextMilestone) tips.push({ icon: Layers, title: `Next checkpoint: ${money(nextMilestone)}`, body: `You're ${money(nextMilestone - saved)} away. Breaking a big goal into quarters makes each win feel real.` });
  if (amount > 0) tips.push({ icon: Coffee, title: `That's about ${money(p.perDay)} a day`, body: `Small daily swaps, like skipping one takeout order a week, can cover what you set aside each ${p.f.unit}.` });
  else tips.push({ icon: Coffee, title: 'Start with any amount', body: 'Even $10 per paycheck builds the habit. Set a plan above and raise it later.' });
  tips.push({ icon: Zap, title: 'Pay yourself first', body: `Move your ${amount > 0 ? money(amount) : 'savings'} on payday, before spending, so it never feels like a choice.` });
  if (p.onTrack === false) tips.push({ icon: Lightbulb, title: 'Not quite on pace', body: 'Try a bigger contribution, a side gig boost, or push your target date a little. Every option is a win.' });
  return tips.slice(0, 3);
}

export default function GoalGuidance({ goal, plan }) {
  const tips = buildTips(goal, plan);
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-5 text-white">
      <h3 className="text-sm font-heading font-semibold mb-4">Your next moves</h3>
      <div className="space-y-3">
        {tips.map(({ icon: Icon, title, body }) => (
          <div key={title} className="flex gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#2EA0FD]/15 text-[#2EA0FD] flex items-center justify-center shrink-0"><Icon className="w-4 h-4" /></div>
            <div className="min-w-0">
              <p className="text-sm font-semibold leading-tight">{title}</p>
              <p className="text-xs text-white/60 mt-0.5">{body}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}