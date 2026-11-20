import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import GoalsCarousel from '@/components/money/GoalsCarousel';
import MoneyGoalForm from '@/components/money/MoneyGoalForm';
import GoalUpgradePrompt from '@/components/money/GoalUpgradePrompt';
import useMoneyGoals from '@/hooks/useMoneyGoals';

const GREEN_BTN = 'bg-[#2EFD7A] text-black hover:bg-[#2EFD7A]/90';

export default function GoalsBanner({ learning }) {
  const state = useMoneyGoals(learning);
  const available = state.unlocked;
  return (
    <section id="goals" className="scroll-mt-6 min-w-0 rounded-2xl bg-card/60 border border-border p-3 sm:p-4 space-y-2 text-foreground">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold">Savings goals</h2>
        {available && !state.loading && <Button size="sm" className={GREEN_BTN} disabled={!!state.error} onClick={state.open}>{state.forceEmergency ? 'Set up emergency fund' : 'New goal'}</Button>}
      </div>
      {state.loading ? <p role="status" className="text-muted-foreground">Loading your goals…</p> : <>
        {state.error && !state.creating && <div role="alert"><p>{state.error}</p><Button variant="outline" onClick={state.load}>Try again</Button></div>}
        {!state.unlocked && <p className="text-sm text-muted-foreground">Complete every lesson in Money In, then set up your emergency fund as its money move. <Link to="/dashboard" className="text-[#2EFD7A] underline">Continue BasePath</Link></p>}
        {state.forceEmergency && !state.goals.length && <p className="text-sm text-muted-foreground">Your first money move: set up an emergency fund.</p>}
        {state.emergency && state.unlocked && state.chapter && !state.chapter.moveDone && <Button className={GREEN_BTN} disabled={state.saving} onClick={state.confirmEmergency}>{state.saving ? 'Saving…' : 'Use my emergency fund for this money move'}</Button>}
        {state.toolUnlocked && state.goals.length > 0 && <GoalsCarousel goals={state.goals} />}
        {!state.paid && <p className="text-xs text-muted-foreground">Free: one emergency fund. Additional goals require an active subscription.</p>}
        {state.forceEmergency && state.goals.length > 0 && <p className="text-sm text-muted-foreground">Your existing goals are preserved. You can rename one to Emergency Fund, or remove an old goal before creating your free emergency fund.</p>}
        {!state.goals.length && state.unlocked && !state.error && <p className="text-sm text-muted-foreground">{state.forceEmergency ? 'No goals yet. Choose your emergency-fund target to get started.' : 'No goals yet. Create a savings goal to get started.'}</p>}
      </>}
      {state.creating && <MoneyGoalForm emergency={state.forceEmergency} saving={state.saving} error={state.error} onClose={() => state.setCreating(false)} onSave={state.save} />}
      {state.upgrade && <GoalUpgradePrompt onClose={() => state.setUpgrade(false)} />}
    </section>
  );
}