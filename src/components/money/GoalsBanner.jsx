import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import GoalProgressTracker from '@/components/money/GoalProgressTracker';
import MoneyGoalForm from '@/components/money/MoneyGoalForm';
import GoalUpgradePrompt from '@/components/money/GoalUpgradePrompt';
import useMoneyGoals from '@/hooks/useMoneyGoals';

export default function GoalsBanner({ learning }) {
  const state = useMoneyGoals(learning);
  const available = state.unlocked || state.goals.length > 0;
  return (
    <section id="goals" className="scroll-mt-6 rounded-3xl bg-card/60 border border-border p-5 sm:p-6 space-y-5 text-foreground">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><p className="text-xs text-primary uppercase tracking-widest mb-1">Your first money tool</p><h2 className="text-xl font-semibold">Savings goals</h2></div>
        {available && !state.loading && <Button disabled={!!state.error} onClick={state.open}>{state.emergency || !state.unlocked ? 'New goal' : 'Set up emergency fund'}</Button>}
      </div>
      {state.loading ? <p role="status" className="text-muted-foreground">Loading your goals…</p> : <>
        {state.error && !state.creating && <div role="alert"><p>{state.error}</p><Button variant="outline" onClick={state.load}>Try again</Button></div>}
        {!state.unlocked && <p className="text-sm text-muted-foreground">Complete Chapter 1 to unlock your emergency-fund money move. {state.goals.length ? 'Your existing goals remain available below.' : <Link to="/dashboard" className="text-primary underline">Continue BasePath</Link>}</p>}
        {state.unlocked && !state.emergency && <div className="space-y-3"><p className="text-sm text-muted-foreground">Your first money move is to set up an emergency fund, a cushion for unexpected expenses.</p>{state.goals.length >= 2 && <Button variant="outline" onClick={state.open}>Set up emergency fund</Button>}</div>}
        {state.emergency && state.unlocked && !state.chapter.moveDone && <Button disabled={state.saving} onClick={state.confirmEmergency}>{state.saving ? 'Saving…' : 'Use my emergency fund for this money move'}</Button>}
        <div className="space-y-4">{state.goals.map(goal => <div key={goal.id}><GoalProgressTracker goal={goal} /><div className="max-w-2xl mx-auto mt-2 flex justify-between items-center text-sm"><span className="text-muted-foreground">{goal.target_date ? `Target: ${new Date(`${goal.target_date.slice(0, 10)}T12:00:00`).toLocaleDateString()}` : 'Save at your own pace'}</span><Link className="text-primary underline" to={`/money/goals/${goal.id}`}>Manage goal</Link></div></div>)}</div>
        {!state.goals.length && state.unlocked && !state.error && <p className="text-sm text-muted-foreground">No goals yet. Choose your emergency-fund target to get started.</p>}
      </>}
      {state.creating && <MoneyGoalForm emergency={state.unlocked && !state.emergency} saving={state.saving} error={state.error} onClose={() => state.setCreating(false)} onSave={state.save} />}
      {state.upgrade && <GoalUpgradePrompt onClose={() => state.setUpgrade(false)} />}
    </section>
  );
}