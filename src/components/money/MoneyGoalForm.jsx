import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function MoneyGoalForm({ emergency, saving, error, onClose, onSave }) {
  const [form, setForm] = useState({ name: emergency ? 'Emergency Fund' : '', target_amount: '', saved_amount: '', target_date: '' });
  const field = (key) => e => setForm(p => ({ ...p, [key]: e.target.value }));
  return (
    <Dialog open onOpenChange={open => !open && !saving && onClose()}>
      <DialogContent className="bg-card text-card-foreground border-border">
        <DialogHeader><DialogTitle>{emergency ? 'Start your emergency fund' : 'New savings goal'}</DialogTitle></DialogHeader>
        <p className="text-sm text-muted-foreground">{emergency ? 'Your first money move: choose a cushion for unexpected expenses. Start with a target that feels achievable.' : 'Give your next savings goal a name and a target.'}</p>
        <form onSubmit={e => { e.preventDefault(); onSave(form); }} className="space-y-4">
          <label className="block text-sm">Goal name<Input required readOnly={emergency} value={form.name} onChange={field('name')} className="mt-2" /></label>
          <label className="block text-sm">Target amount ($)<Input required type="number" min="0.01" step="0.01" value={form.target_amount} onChange={field('target_amount')} className="mt-2" /></label>
          <label className="block text-sm">Already saved ($)<Input type="number" min="0" step="0.01" value={form.saved_amount} onChange={field('saved_amount')} className="mt-2" /></label>
          <label className="block text-sm">Target date (optional)<Input type="date" value={form.target_date} onChange={field('target_date')} className="mt-2" /></label>
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          <div className="flex justify-end gap-3"><Button type="button" variant="outline" disabled={saving} onClick={onClose}>Cancel</Button><Button disabled={saving}>{saving ? 'Saving…' : 'Create goal'}</Button></div>
        </form>
      </DialogContent>
    </Dialog>
  );
}