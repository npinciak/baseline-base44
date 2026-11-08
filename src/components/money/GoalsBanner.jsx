import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import GoalsCarousel from '@/components/money/GoalsCarousel';
import MoneyGoalForm from '@/components/money/MoneyGoalForm';
import GoalUpgradePrompt from '@/components/money/GoalUpgradePrompt';
import useMoneyGoals from '@/hooks/useMoneyGoals';

const GREEN_BTN = 'bg-[#2EFD7A] text-black hover:bg-[#2EFD7A]/90';

export default function GoalsBanner({ learning }) {
  const state = useMoneyGoals(learning);
  const available = state.unlocked || state.goals.length > 0;
  return (
    <section id="goals" className="scroll-mt-6 min-w-0 rounded-2xl bg-card/60 border border-border p-3 sm:p-4 space-y-2 text-foreground">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold">Savings goals</h2>
        {available && !state.loading && <Button size="sm" className={GREEN_BTN} disabled={!!state.error} onClick={state.open}>{state.emergency || !state.unlocked ? 'New goal' : 'Set up emergency fund'}</Button>}
      </div>
      {state.loading ? <p role="status" className="text-muted-foreground">Loading your goals…</p> : <>
        {state.error && !state.creating && <div role="alert"><p>{state.error}</p><Button variant="outline" onClick={state.load}>Try again</Button></div>}
        {!state.unlocked && !state.goals.length && <p className="text-sm text-muted-foreground">Complete Chapter 1 to start your emergency fund. <Link to="/dashboard" className="text-[#2EFD7A] underline">Continue BasePath</Link></p>}
        {state.unlocked && !state.emergency && !state.goals.length && <p className="text-sm text-muted-foreground">Your first money move: set up an emergency fund.</p>}
        {state.emergency && state.unlocked && !state.chapter.moveDone && <Button className={GREEN_BTN} disabled={state.saving} onClick={state.confirmEmergency}>{state.saving ? 'Saving…' : 'Use my emergency fund for this money move'}</Button>}
        {state.goals.length > 0 && <GoalsCarousel goals={state.goals} />}
        {!state.goals.length && state.unlocked && !state.error && <p className="text-sm text-muted-foreground">No goals yet. Choose your emergency-fund target to get started.</p>}
      </>}
      {state.creating && <MoneyGoalForm emergency={state.unlocked && !state.emergency} saving={state.saving} error={state.error} onClose={() => state.setCreating(false)} onSave={state.save} />}
      {state.upgrade && <GoalUpgradePrompt onClose={() => state.setUpgrade(false)} />}
    </section>
  );
}