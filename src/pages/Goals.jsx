import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Target, Plus, X, Pencil, CheckCircle, Trash2, AlertTriangle, Link, ImageIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import GoalCreationWorkflow from '@/components/GoalCreationWorkflow';
import ImagePickerModal from '@/components/ImagePickerModal';
import AmbientBackdrop from '@/components/dashboard/AmbientBackdrop';
import TiltCard from '@/components/dashboard/TiltCard';
import { formatDistanceToNow } from 'date-fns';

const EMPTY_FORM = { name: '', description: '', target_amount: '', saved_amount: '', target_date: '', image_url: '', goal_type: '' };

const GOAL_TYPES = [
  { value: 'vacation', label: 'Go on Vacation' },
  { value: 'buyHome', label: 'Buy a Home' },
  { value: 'newCar', label: 'Buy a New Car' },
  { value: 'other', label: 'Something Else' },
  { value: 'unknown', label: 'Not Sure Yet' },
];

const containerVariants = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const itemVariants = {
  hidden: { opacity: 0, y: 18, scale: 0.97 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 280, damping: 20 } },
};

function LinkedBalanceRow({ balance, syncedAt }) {
  if (!balance || balance <= 0) return null;
  const syncLabel = syncedAt
    ? `synced ${formatDistanceToNow(new Date(syncedAt), { addSuffix: true })}`
    : '';
  return (
    <div className="flex items-center gap-1.5 mt-2 text-xs text-white/50">
      <Link className="w-3 h-3 text-[#2EFD7A]" />
      <span>Linked: <span className="text-white font-semibold">${parseFloat(balance).toLocaleString()}</span>
        {syncLabel && <span> · {syncLabel}</span>}
      </span>
    </div>
  );
}

export default function Goals() {
  const navigate = useNavigate();
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
  const [showImagePicker, setShowImagePicker] = useState(false);

  const loadGoals = async () => {
    try {
      const res = await base44.functions.invoke('getSupabaseGoals', {});
      setGoals(res.data.goals || []);
      setUserProfileId(res.data.userProfileId);
      setSupabaseError(false);
    } catch {
      setSupabaseError(true);
    }
  };

  useEffect(() => {
    const init = async () => {
      const u = await base44.auth.me();
      setUser(u);
      const statsArr = await base44.entities.UserStats.filter({ user_id: u.id });
      if (statsArr.length > 0) setUserStats(statsArr[0]);
      await loadGoals();
    };
    init().finally(() => setLoading(false));
  }, []);

  const openCreate = () => {
    if (!userStats?.first_goal_workflow_completed) {
      setShowWorkflow(true);
    } else {
      setEditingGoal(null);
      setForm(EMPTY_FORM);
      setShowModal(true);
    }
  };

  const handleWorkflowCreated = async () => {
    const statsArr = await base44.entities.UserStats.filter({ user_id: user.id });
    if (statsArr.length > 0) setUserStats(statsArr[0]);
    await loadGoals();
    setShowWorkflow(false);
  };

  const openEdit = (goal) => {
    setEditingGoal(goal);
    setForm({
      name: goal.name || '',
      description: '',
      target_amount: goal.target_amount || '',
      saved_amount: goal.current_amount || 0,
      target_date: goal.target_date || '',
      image_url: goal.image || '',
      goal_type: goal.goal_type || '',
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.target_amount) return;
    setSaving(true);

    let imageUrl = form.image_url;
    if (!imageUrl) {
      const searchTerm = form.goal_type && form.goal_type !== 'unknown' ? form.goal_type : form.name;
      const res = await base44.integrations.custom.call('unsplash', 'get:/search/photos', {
        queryParams: { query: searchTerm, per_page: 1 },
      }).catch(() => null);
      imageUrl = res?.data?.results?.[0]?.urls?.regular || '';
    }

    if (editingGoal) {
      await base44.functions.invoke('updateSupabaseGoal', {
        supabaseGoalId: editingGoal.id,
        name: form.name,
        goal_type: form.goal_type || null,
        image: form.image_url || null,
        target_amount: parseFloat(form.target_amount),
        current_amount: parseFloat(form.saved_amount) || 0,
        target_date: form.target_date || null,
      });
    } else {
      await base44.functions.invoke('createSupabaseGoal', {
        name: form.name,
        goal_type: form.goal_type || null,
        image: imageUrl || null,
        target_amount: parseFloat(form.target_amount),
        current_amount: parseFloat(form.saved_amount) || 0,
        target_date: form.target_date || null,
        currency_code: 'USD',
        userProfileId,
      });
    }

    await loadGoals();
    setShowModal(false);
    setSaving(false);
  };

  const handleDelete = async (goal) => {
    if (!confirm(`Delete "${goal.name}"? This cannot be undone.`)) return;
    await base44.functions.invoke('deleteSupabaseGoal', { supabaseGoalId: goal.id }).catch(() => {});
    setGoals(g => g.filter(x => x.id !== goal.id));
  };

  const handleMarkComplete = async (goal) => {
    await base44.functions.invoke('updateSupabaseGoal', {
      supabaseGoalId: goal.id,
      current_amount: goal.target_amount,
    }).catch(() => {});
    setGoals(g => g.map(x => x.id === goal.id ? { ...x, current_amount: goal.target_amount } : x));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="w-8 h-8 border-4 border-white/10 border-t-[#2EFD7A] rounded-full animate-spin" />
      </div>
    );
  }

  const GoalCard = ({ goal, isComplete }) => {
    const saved = goal.current_amount || 0;
    const pct = Math.min(100, Math.round((saved / goal.target_amount) * 100));
    return (
      <TiltCard className="rounded-2xl">
        <motion.div
          variants={itemVariants}
          onClick={() => navigate(`/goals/${goal.id}`)}
          className={`bg-white/[0.03] border backdrop-blur-sm rounded-2xl overflow-hidden flex flex-col cursor-pointer transition-colors duration-200 ${isComplete ? 'border-[#2EFD7A]/40 shadow-[0_0_24px_rgba(46,253,122,0.12)]' : 'border-white/10 hover:border-[#2EFD7A]/40'}`}
        >
          <div className="relative h-40 bg-white/[0.03] overflow-hidden">
            {goal.image ? (
              <img src={goal.image} alt={goal.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Target className="w-10 h-10 text-white/20" />
              </div>
            )}
            {!isComplete && (
              <button
                onClick={e => { e.stopPropagation(); openEdit(goal); }}
                className="absolute top-2 right-2 flex items-center gap-1.5 px-2.5 py-1.5 bg-black/70 backdrop-blur-sm text-white rounded-lg text-xs font-semibold hover:bg-black transition-all"
              >
                <ImageIcon className="w-3.5 h-3.5" /> Change image
              </button>
            )}
            {isComplete && (
              <div className="absolute inset-0 bg-[#2EFD7A]/20 flex items-center justify-center">
                <div className="bg-[#2EFD7A] rounded-full p-2">
                  <CheckCircle className="w-6 h-6 text-black" />
                </div>
              </div>
            )}
          </div>

          <div className="p-4 flex flex-col flex-1">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3 className="text-base font-heading font-bold leading-tight text-white">{goal.name}</h3>
              <div className="flex items-center gap-1 shrink-0">
                {!isComplete && (
                  <>
                    <button onClick={e => { e.stopPropagation(); openEdit(goal); }} className="p-1 text-white/40 hover:text-white transition-colors">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={e => { e.stopPropagation(); handleMarkComplete(goal); }} title="Mark complete" className="p-1 text-white/40 hover:text-[#2EFD7A] transition-colors">
                      <CheckCircle className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
                <button onClick={e => { e.stopPropagation(); handleDelete(goal); }} title="Delete goal" className="p-1 text-white/40 hover:text-red-400 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="mt-auto">
              <div className="flex items-end justify-between mb-2">
                <div>
                  <p className="text-2xl font-display font-extrabold text-[#2EA0FD]">${saved.toLocaleString()}</p>
                  <p className="text-xs text-white/50">of ${goal.target_amount.toLocaleString()} goal</p>
                </div>
                <span className="text-sm font-bold text-white">{pct}%</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${isComplete ? 'xp-shimmer' : 'bg-gradient-to-r from-[#2EFD7A] to-[#2BF9E9]'}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                />
              </div>
              <LinkedBalanceRow balance={goal.linked_accounts_balance} syncedAt={goal.last_balance_sync_at} />
              {goal.target_date && (
                <p className="text-xs text-white/40 mt-2">Target: {goal.target_date}</p>
              )}
            </div>
          </div>
        </motion.div>
      </TiltCard>
    );
  };

  const activeGoals = goals.filter(g => (g.current_amount || 0) < g.target_amount);
  const completedGoals = goals.filter(g => (g.current_amount || 0) >= g.target_amount);

  return (
    <div className="relative min-h-screen bg-black px-4 py-8 overflow-hidden">
      <AmbientBackdrop />
      <div className="relative z-10 max-w-3xl mx-auto">
        {supabaseError && (
          <div className="flex items-center justify-between gap-3 mb-6 px-4 py-3 bg-amber-500/10 border border-amber-500/25 rounded-xl text-sm text-amber-400">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>Could not load goals from the server. Please try again.</span>
            </div>
            <button onClick={() => setSupabaseError(false)} className="text-amber-400/60 hover:text-amber-400 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-display font-extrabold text-white mb-1">Savings Goals</h1>
            <p className="text-white/60">Track what you're saving towards</p>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#2EFD7A] text-black rounded-xl font-semibold text-sm hover:bg-[#2EFD7A]/90 transition-all duration-200"
          >
            <Plus className="w-4 h-4" /> New Goal
          </button>
        </div>

        {activeGoals.length === 0 && completedGoals.length === 0 ? (
          <div className="bg-white/[0.03] border border-dashed border-white/10 rounded-3xl p-16 text-center">
            <div className="w-16 h-16 bg-white/[0.05] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Target className="w-8 h-8 text-white/40" />
            </div>
            <h3 className="text-xl font-heading font-bold mb-2 text-white">No goals yet</h3>
            <p className="text-white/50 text-sm mb-6">Create your first savings goal to stay motivated.</p>
            <button
              onClick={openCreate}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#2EFD7A] text-black rounded-xl font-semibold hover:bg-[#2EFD7A]/90 transition-all"
            >
              <Plus className="w-4 h-4" /> Create a Goal
            </button>
          </div>
        ) : (
          <>
            {activeGoals.length > 0 && (
              <div className="mb-8">
                <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-4">My Goals</h2>
                <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid sm:grid-cols-2 gap-5">
                  {activeGoals.map(goal => <GoalCard key={goal.id} goal={goal} isComplete={false} />)}
                </motion.div>
              </div>
            )}

            {completedGoals.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-[#2EFD7A]" /> Completed Goals
                </h2>
                <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid sm:grid-cols-2 gap-5">
                  {completedGoals.map(goal => <GoalCard key={goal.id} goal={goal} isComplete={true} />)}
                </motion.div>
              </div>
            )}
          </>
        )}

        {showImagePicker && (
          <ImagePickerModal
            onSelect={({ url }) => { setForm(p => ({ ...p, image_url: url })); setShowImagePicker(false); }}
            onClose={() => setShowImagePicker(false)}
          />
        )}

        {showWorkflow && user && (
          <GoalCreationWorkflow
            user={user}
            onClose={() => setShowWorkflow(false)}
            onCreated={handleWorkflowCreated}
            skipPoints={false}
          />
        )}

        {showModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-end md:items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 22 }}
              className="bg-white/[0.05] border border-white/10 backdrop-blur-md rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto flex flex-col"
            >
              {/* Card media header */}
              <div className="relative h-44 bg-white/[0.03] rounded-t-3xl overflow-hidden shrink-0">
                {form.image_url ? (
                  <img src={form.image_url} alt="Goal" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-white/20">
                    <Target className="w-10 h-10" />
                    <span className="text-xs font-medium">No image selected</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-3 left-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowImagePicker(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-black/80 backdrop-blur-sm text-white rounded-lg text-xs font-semibold hover:bg-black transition-all"
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    {form.image_url ? 'Change' : 'Add Image'}
                  </button>
                  {form.image_url && (
                    <button
                      type="button"
                      onClick={() => setForm(p => ({ ...p, image_url: '' }))}
                      className="px-3 py-1.5 bg-black/80 backdrop-blur-sm text-white/60 rounded-lg text-xs font-semibold hover:bg-black hover:text-white transition-all"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="absolute top-3 right-3 w-7 h-7 rounded-full bg-black/80 backdrop-blur-sm flex items-center justify-center text-white/60 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form fields */}
              <div className="p-6 space-y-4">
                <h3 className="text-lg font-heading font-bold text-white">{editingGoal ? 'Edit Goal' : 'New Savings Goal'}</h3>
                <div>
                  <label className="text-xs text-white/50 font-medium mb-1 block">Goal Name</label>
                  <input
                    value={form.name}
                    onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                    placeholder="e.g. New MacBook, Vacation to Japan"
                    className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#2EFD7A] transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs text-white/50 font-medium mb-1 block">Category</label>
                  <select
                    value={form.goal_type}
                    onChange={e => setForm(p => ({ ...p, goal_type: e.target.value }))}
                    className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#2EFD7A] transition-colors"
                  >
                    <option value="" className="bg-black">Select a category...</option>
                    {GOAL_TYPES.map(({ value, label }) => (
                      <option key={value} value={value} className="bg-black">{label}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-white/50 font-medium mb-1 block">Target Amount ($)</label>
                    <input
                      type="number"
                      value={form.target_amount}
                      onChange={e => setForm(p => ({ ...p, target_amount: e.target.value }))}
                      placeholder="0.00"
                      className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#2EFD7A] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-white/50 font-medium mb-1 block">Already Saved ($)</label>
                    <input
                      type="number"
                      value={form.saved_amount}
                      onChange={e => setForm(p => ({ ...p, saved_amount: e.target.value }))}
                      placeholder="0.00"
                      className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#2EFD7A] transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-white/50 font-medium mb-1 block">Target Date (optional)</label>
                  <input
                    type="date"
                    value={form.target_date}
                    onChange={e => setForm(p => ({ ...p, target_date: e.target.value }))}
                    className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#2EFD7A] transition-colors"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setShowModal(false)} className="flex-1 py-3 bg-white/10 text-white rounded-xl font-semibold hover:bg-white/15 transition-all">
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving || !form.name || !form.target_amount}
                    className="flex-1 py-3 bg-[#2EFD7A] text-black rounded-xl font-semibold hover:bg-[#2EFD7A]/90 transition-all disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : editingGoal ? 'Save Changes' : 'Create Goal'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}