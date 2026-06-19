import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Target, Plus, X, CheckCircle, Pencil } from 'lucide-react';

const EMPTY_FORM = { name: '', description: '', target_amount: '', saved_amount: '', target_date: '' };

export default function SavingsGoals({ user }) {
  const [goals, setGoals] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    base44.entities.SavingsGoal.filter({ user_id: user.id }, '-created_date', 50).then(setGoals);
  }, [user]);

  const openCreate = () => {
    setEditingGoal(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEdit = (goal) => {
    setEditingGoal(goal);
    setForm({
      name: goal.name,
      description: goal.description || '',
      target_amount: goal.target_amount,
      saved_amount: goal.saved_amount || 0,
      target_date: goal.target_date || '',
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.target_amount) return;
    setSaving(true);
    const data = {
      name: form.name,
      description: form.description,
      target_amount: parseFloat(form.target_amount),
      saved_amount: parseFloat(form.saved_amount) || 0,
      target_date: form.target_date || undefined,
      is_completed: editingGoal ? editingGoal.is_completed : false,
    };
    if (editingGoal) {
      await base44.entities.SavingsGoal.update(editingGoal.id, data);
    } else {
      await base44.entities.SavingsGoal.create({ ...data, user_id: user.id });
    }
    const updated = await base44.entities.SavingsGoal.filter({ user_id: user.id }, '-created_date', 50);
    setGoals(updated);
    setShowModal(false);
    setSaving(false);
  };

  const handleMarkComplete = async (goal) => {
    await base44.entities.SavingsGoal.update(goal.id, { is_completed: true, saved_amount: goal.target_amount });
    setGoals(g => g.map(x => x.id === goal.id ? { ...x, is_completed: true, saved_amount: goal.target_amount } : x));
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-base font-heading font-semibold">Savings Goals</h3>
        <button
          onClick={openCreate}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/15 text-primary rounded-lg text-xs font-semibold hover:bg-primary/25 transition-all"
        >
          <Plus className="w-3.5 h-3.5" /> New Goal
        </button>
      </div>

      {goals.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center mx-auto mb-3">
            <Target className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground mb-3">No savings goals yet</p>
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-all"
          >
            <Plus className="w-4 h-4" /> Create a Goal
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {goals.map(goal => {
            const pct = Math.min(100, Math.round(((goal.saved_amount || 0) / goal.target_amount) * 100));
            return (
              <div key={goal.id} className={`rounded-xl border p-4 transition-all ${goal.is_completed ? 'border-primary/30 bg-primary/5' : 'border-border bg-secondary/30'}`}>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {goal.is_completed && <CheckCircle className="w-4 h-4 text-primary shrink-0" />}
                      <p className="text-sm font-semibold truncate">{goal.name}</p>
                    </div>
                    {goal.description && <p className="text-xs text-muted-foreground mt-0.5 truncate">{goal.description}</p>}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {!goal.is_completed && (
                      <>
                        <button onClick={() => openEdit(goal)} className="p-1.5 text-muted-foreground hover:text-foreground transition-colors">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleMarkComplete(goal)} className="p-1.5 text-muted-foreground hover:text-primary transition-colors" title="Mark complete">
                          <CheckCircle className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                  <span className="font-semibold text-foreground">${(goal.saved_amount || 0).toFixed(0)} saved</span>
                  <span>of ${goal.target_amount.toFixed(0)}</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${goal.is_completed ? 'bg-primary xp-shimmer' : 'bg-primary/60'}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="flex items-center justify-between mt-1.5">
                  <span className="text-xs text-primary font-semibold">{pct}%</span>
                  {goal.target_date && <span className="text-xs text-muted-foreground">by {goal.target_date}</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-end md:items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-3xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-heading font-bold">{editingGoal ? 'Edit Goal' : 'New Savings Goal'}</h3>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-muted-foreground font-medium mb-1 block">Goal Name</label>
                <input
                  value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. New MacBook, Vacation to Japan"
                  className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground font-medium mb-1 block">Description (optional)</label>
                <input
                  value={form.description}
                  onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  placeholder="Why is this important to you?"
                  className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground font-medium mb-1 block">Target Amount ($)</label>
                  <input
                    type="number"
                    value={form.target_amount}
                    onChange={e => setForm(p => ({ ...p, target_amount: e.target.value }))}
                    placeholder="0.00"
                    className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground font-medium mb-1 block">Already Saved ($)</label>
                  <input
                    type="number"
                    value={form.saved_amount}
                    onChange={e => setForm(p => ({ ...p, saved_amount: e.target.value }))}
                    placeholder="0.00"
                    className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground font-medium mb-1 block">Target Date (optional)</label>
                <input
                  type="date"
                  value={form.target_date}
                  onChange={e => setForm(p => ({ ...p, target_date: e.target.value }))}
                  className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-3 bg-secondary text-foreground rounded-xl font-semibold hover:bg-secondary/80 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.name || !form.target_amount}
                className="flex-1 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-all disabled:opacity-50"
              >
                {saving ? 'Saving...' : editingGoal ? 'Save Changes' : 'Create Goal'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}