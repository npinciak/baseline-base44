import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Target, Plus, X, Pencil, CheckCircle, Trash2, AlertTriangle, Link } from 'lucide-react';
import GoalCreationWorkflow from '@/components/GoalCreationWorkflow';
import { formatDistanceToNow } from 'date-fns';

const EMPTY_FORM = { name: '', description: '', target_amount: '', saved_amount: '', target_date: '', image_url: '', goal_type: '' };

function LinkedBalanceRow({ balance, syncedAt }) {
  if (!balance || balance <= 0) return null;
  const syncLabel = syncedAt
    ? `synced ${formatDistanceToNow(new Date(syncedAt), { addSuffix: true })}`
    : '';
  return (
    <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground">
      <Link className="w-3 h-3 text-primary" />
      <span>Linked: <span className="text-foreground font-semibold">${parseFloat(balance).toLocaleString()}</span>
        {syncLabel && <span> · {syncLabel}</span>}
      </span>
    </div>
  );
}

export default function Goals() {
  const [user, setUser] = useState(null);
  const [userProfileId, setUserProfileId] = useState(null);
  const [goals, setGoals] = useState([]);
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [supabaseError, setSupabaseError] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showWorkflow, setShowWorkflow] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const mergeGoals = (supabaseGoals, base44Goals) => {
    // Supabase goals take precedence; deduplicate via base44 source = supabase id
    const supabaseIds = new Set(supabaseGoals.map(g => g.id));
    const base44Only = base44Goals.filter(g => !g.source || !supabaseIds.has(g.source));

    return [
      ...supabaseGoals.map(sg => {
        const b44 = base44Goals.find(g => g.source === sg.id);
        return {
          _supabaseId: sg.id,
          _base44Id: b44?.id || null,
          id: sg.id, // use supabase id as display key
          name: sg.name,
          description: b44?.description || '',
          goal_type: sg.goal_type,
          image_url: sg.image,
          target_amount: sg.target_amount,
          saved_amount: sg.current_amount,
          target_date: sg.target_date,
          currency_code: sg.currency_code,
          is_completed: b44?.is_completed || false,
          linked_accounts_balance: sg.linked_accounts_balance,
          last_balance_sync_at: sg.last_balance_sync_at,
          _source: 'supabase',
        };
      }),
      ...base44Only.map(g => ({
        _supabaseId: null,
        _base44Id: g.id,
        id: g.id,
        name: g.name,
        description: g.description || '',
        goal_type: g.goal_type,
        image_url: g.image_url,
        target_amount: g.target_amount,
        saved_amount: g.saved_amount || 0,
        target_date: g.target_date,
        currency_code: 'USD',
        is_completed: g.is_completed || false,
        linked_accounts_balance: null,
        last_balance_sync_at: null,
        _source: 'base44',
      })),
    ];
  };

  const loadGoals = async (u, statsArr) => {
    let supabaseGoals = [];
    let profileId = null;
    try {
      const res = await base44.functions.invoke('getSupabaseGoals', {});
      supabaseGoals = res.data.goals || [];
      profileId = res.data.userProfileId;
      setUserProfileId(profileId);
      setSupabaseError(false);
    } catch {
      setSupabaseError(true);
    }

    const b44Goals = await base44.entities.SavingsGoal.filter({ user_id: u.id }, '-created_date', 50);
    setGoals(mergeGoals(supabaseGoals, b44Goals));

    if (statsArr && statsArr.length > 0) setUserStats(statsArr[0]);
  };

  useEffect(() => {
    const init = async () => {
      const u = await base44.auth.me();
      setUser(u);
      const statsArr = await base44.entities.UserStats.filter({ user_id: u.id });
      await loadGoals(u, statsArr);
    };
    init().finally(() => setLoading(false));
  }, []);

  const openCreate = () => {
    const workflowDone = userStats?.first_goal_workflow_completed;
    if (!workflowDone) {
      setShowWorkflow(true);
    } else {
      setEditingGoal(null);
      setForm(EMPTY_FORM);
      setShowModal(true);
    }
  };

  const handleWorkflowCreated = async () => {
    const statsArr = await base44.entities.UserStats.filter({ user_id: user.id });
    await loadGoals(user, statsArr);
    setShowWorkflow(false);
  };

  const openEdit = (goal) => {
    setEditingGoal(goal);
    setForm({
      name: goal.name,
      description: goal.description || '',
      target_amount: goal.target_amount,
      saved_amount: goal.saved_amount || 0,
      target_date: goal.target_date || '',
      image_url: goal.image_url || '',
      goal_type: goal.goal_type || '',
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.target_amount) return;
    setSaving(true);

    if (editingGoal) {
      // Update Supabase if we have a supabase id
      if (editingGoal._supabaseId) {
        await base44.functions.invoke('updateSupabaseGoal', {
          supabaseGoalId: editingGoal._supabaseId,
          name: form.name,
          goal_type: form.goal_type || null,
          image: form.image_url || null,
          target_amount: parseFloat(form.target_amount),
          current_amount: parseFloat(form.saved_amount) || 0,
          target_date: form.target_date || null,
        });
      }
      // Update Base44
      if (editingGoal._base44Id) {
        await base44.entities.SavingsGoal.update(editingGoal._base44Id, {
          name: form.name,
          description: form.description,
          target_amount: parseFloat(form.target_amount),
          saved_amount: parseFloat(form.saved_amount) || 0,
          target_date: form.target_date || undefined,
          image_url: form.image_url || undefined,
        });
      }
    } else {
      // Create in Supabase first
      let supabaseId = null;
      if (userProfileId) {
        const res = await base44.functions.invoke('createSupabaseGoal', {
          name: form.name,
          goal_type: form.goal_type || null,
          image: form.image_url || null,
          target_amount: parseFloat(form.target_amount),
          current_amount: parseFloat(form.saved_amount) || 0,
          target_date: form.target_date || null,
          currency_code: 'USD',
          userProfileId,
        });
        supabaseId = res.data?.goal?.id || null;
      }
      // Create in Base44
      await base44.entities.SavingsGoal.create({
        user_id: user.id,
        name: form.name,
        description: form.description,
        target_amount: parseFloat(form.target_amount),
        saved_amount: parseFloat(form.saved_amount) || 0,
        target_date: form.target_date || undefined,
        image_url: form.image_url || undefined,
        is_completed: false,
        source: supabaseId || undefined,
      });
    }

    const statsArr = await base44.entities.UserStats.filter({ user_id: user.id });
    await loadGoals(user, statsArr);
    setShowModal(false);
    setSaving(false);
  };

  const handleDelete = async (goal) => {
    if (!confirm(`Delete "${goal.name}"? This cannot be undone.`)) return;

    // Delete from Supabase
    if (goal._supabaseId) {
      await base44.functions.invoke('deleteSupabaseGoal', { supabaseGoalId: goal._supabaseId }).catch(() => {});
    }
    // Delete from Base44
    if (goal._base44Id) {
      await base44.entities.SavingsGoal.delete(goal._base44Id).catch(() => {});
    }

    setGoals(g => g.filter(x => x.id !== goal.id));
  };

  const handleMarkComplete = async (goal) => {
    if (goal._supabaseId) {
      await base44.functions.invoke('updateSupabaseGoal', {
        supabaseGoalId: goal._supabaseId,
        current_amount: goal.target_amount,
      }).catch(() => {});
    }
    if (goal._base44Id) {
      await base44.entities.SavingsGoal.update(goal._base44Id, { is_completed: true, saved_amount: goal.target_amount });
    }
    setGoals(g => g.map(x => x.id === goal.id ? { ...x, is_completed: true, saved_amount: goal.target_amount } : x));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Supabase error banner */}
      {supabaseError && (
        <div className="flex items-center justify-between gap-3 mb-6 px-4 py-3 bg-amber-500/10 border border-amber-500/25 rounded-xl text-sm text-amber-400">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Could not load synced goals — showing local data only.</span>
          </div>
          <button onClick={() => setSupabaseError(false)} className="text-amber-400/60 hover:text-amber-400 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-extrabold mb-1">Savings Goals</h1>
          <p className="text-muted-foreground">Track what you're saving towards</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl font-semibold text-sm hover:bg-primary/90 transition-all duration-200"
        >
          <Plus className="w-4 h-4" /> New Goal
        </button>
      </div>

      {goals.length === 0 ? (
        <div className="bg-card border border-dashed border-border rounded-3xl p-16 text-center">
          <div className="w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Target className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-heading font-bold mb-2">No goals yet</h3>
          <p className="text-muted-foreground text-sm mb-6">Create your first savings goal to stay motivated.</p>
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-all"
          >
            <Plus className="w-4 h-4" /> Create a Goal
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-5">
          {goals.map(goal => {
            const saved = goal.saved_amount || 0;
            const pct = Math.min(100, Math.round((saved / goal.target_amount) * 100));
            return (
              <div
                key={goal.id}
                className={`bg-card border rounded-2xl overflow-hidden flex flex-col transition-all ${goal.is_completed ? 'border-primary/30' : 'border-border'}`}
              >
                {/* Image */}
                <div className="relative h-40 bg-secondary overflow-hidden">
                  {goal.image_url ? (
                    <img src={goal.image_url} alt={goal.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Target className="w-10 h-10 text-muted-foreground/40" />
                    </div>
                  )}
                  {goal.is_completed && (
                    <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                      <div className="bg-primary rounded-full p-2">
                        <CheckCircle className="w-6 h-6 text-primary-foreground" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4 flex flex-col flex-1">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="text-base font-heading font-bold leading-tight">{goal.name}</h3>
                    <div className="flex items-center gap-1 shrink-0">
                      {!goal.is_completed && (
                        <>
                          <button onClick={() => openEdit(goal)} className="p-1 text-muted-foreground hover:text-foreground transition-colors">
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleMarkComplete(goal)} title="Mark complete" className="p-1 text-muted-foreground hover:text-primary transition-colors">
                            <CheckCircle className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                      <button onClick={() => handleDelete(goal)} title="Delete goal" className="p-1 text-muted-foreground hover:text-destructive transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  {goal.description && (
                    <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{goal.description}</p>
                  )}

                  <div className="mt-auto">
                    <div className="flex items-end justify-between mb-2">
                      <div>
                        <p className="text-2xl font-display font-extrabold text-primary">${saved.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">of ${goal.target_amount.toLocaleString()} goal</p>
                      </div>
                      <span className="text-sm font-bold text-foreground">{pct}%</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${goal.is_completed ? 'xp-shimmer' : 'bg-primary'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <LinkedBalanceRow balance={goal.linked_accounts_balance} syncedAt={goal.last_balance_sync_at} />
                    {goal.target_date && (
                      <p className="text-xs text-muted-foreground mt-2">Target: {goal.target_date}</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* First-goal workflow */}
      {showWorkflow && user && (
        <GoalCreationWorkflow
          user={user}
          onClose={() => setShowWorkflow(false)}
          onCreated={handleWorkflowCreated}
          skipPoints={false}
        />
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-end md:items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-3xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
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
                <label className="text-xs text-muted-foreground font-medium mb-1 block">Image URL (optional)</label>
                <input
                  value={form.image_url}
                  onChange={e => setForm(p => ({ ...p, image_url: e.target.value }))}
                  placeholder="https://..."
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
              <button onClick={() => setShowModal(false)} className="flex-1 py-3 bg-secondary text-foreground rounded-xl font-semibold hover:bg-secondary/80 transition-all">
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