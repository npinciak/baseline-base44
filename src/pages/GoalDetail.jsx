import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import {
  ArrowLeft, Target, CheckCircle, Pencil, Trash2, ImageIcon, X,
  Link2, Wallet, TrendingUp, CreditCard, PiggyBank, BookOpen, CalendarDays
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { formatDistanceToNow } from 'date-fns';
import ImagePickerModal from '@/components/ImagePickerModal';
import ConnectBankButton from '@/components/ConnectBankButton';

const GOAL_TYPES = [
  { value: 'vacation', label: 'Go on Vacation' },
  { value: 'buyHome', label: 'Buy a Home' },
  { value: 'newCar', label: 'Buy a New Car' },
  { value: 'other', label: 'Something Else' },
  { value: 'unknown', label: 'Not Sure Yet' },
];

const GOAL_TOPIC_MAP = {
  vacation: ['saving'],
  travel: ['saving'],
  buyHome: ['investing', 'saving'],
  newCar: ['budgeting'],
  other: ['saving', 'budgeting'],
  unknown: ['saving', 'budgeting'],
};

const TOPIC_ICONS = {
  budgeting: CreditCard,
  investing: TrendingUp,
  credit: Wallet,
  saving: PiggyBank,
};

const TOPIC_COLORS = {
  budgeting: 'bg-orange-500/20 text-orange-400',
  investing: 'bg-blue-500/20 text-blue-400',
  credit: 'bg-purple-500/20 text-purple-400',
  saving: 'bg-[#2EFD7A]/15 text-[#2EFD7A]',
  taxes: 'bg-amber-500/20 text-amber-400',
  debt: 'bg-red-500/20 text-red-400',
  insurance: 'bg-sky-500/20 text-sky-400',
  retirement: 'bg-yellow-500/20 text-yellow-400',
};

function DonutChart({ saved, target }) {
  const remaining = Math.max(0, target - saved);
  const data = saved === 0 && remaining === 0
    ? [{ value: 1 }]
    : [{ value: saved }, { value: remaining }];
  const isEmpty = saved === 0 && remaining > 0;

  return (
    <div className="relative w-44 h-44 mx-auto">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={isEmpty ? [{ value: 1 }, { value: target }] : data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={85}
            startAngle={90}
            endAngle={-270}
            dataKey="value"
            strokeWidth={0}
          >
            <Cell fill={isEmpty ? 'hsl(var(--secondary))' : 'hsl(var(--primary))'} />
            <Cell fill="hsl(var(--secondary))" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      {/* Center label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <p className="text-xs text-white/60 font-medium">Goal</p>
        <p className="text-lg font-display font-extrabold">${target.toLocaleString()}</p>
      </div>
    </div>
  );
}

export default function GoalDetail() {
  const { goalId } = useParams();
  const navigate = useNavigate();
  const [goal, setGoal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [imagePickerTarget, setImagePickerTarget] = useState('edit');
  const [relevantModules, setRelevantModules] = useState([]);
  const [userProgress, setUserProgress] = useState([]);

  useEffect(() => {
    const init = async () => {
      const [goalsRes, user] = await Promise.all([
        base44.functions.invoke('getSupabaseGoals', {}),
        base44.auth.me(),
      ]);
      const found = (goalsRes?.data?.goals || []).find(g => g.id === goalId);
      setGoal(found || null);

      if (found) {
        setForm({
          name: found.name || '',
          goal_type: found.goal_type || '',
          target_amount: found.target_amount || '',
          saved_amount: found.current_amount || 0,
          target_date: found.target_date || '',
          image_url: found.image || '',
        });

        // Fetch relevant modules + user progress in parallel
        const [mods, prog] = await Promise.all([
          base44.entities.Module.filter({ is_published: true }, 'order_index', 50),
          base44.entities.UserProgress.filter({ user_id: user.id }),
        ]);

        const relevantTags = GOAL_TOPIC_MAP[found.goal_type] || ['saving', 'budgeting'];
        const filtered = mods.filter(m => relevantTags.includes(m.topic_tag)).slice(0, 3);
        setRelevantModules(filtered);
        setUserProgress(prog);
      }
    };
    init().finally(() => setLoading(false));
  }, [goalId]);

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
    await base44.functions.invoke('updateSupabaseGoal', {
      supabaseGoalId: goalId,
      name: form.name,
      goal_type: form.goal_type || null,
      image: imageUrl || null,
      target_amount: parseFloat(form.target_amount),
      current_amount: parseFloat(form.saved_amount) || 0,
      target_date: form.target_date || null,
    });
    setGoal(g => ({
      ...g,
      name: form.name,
      goal_type: form.goal_type,
      image: imageUrl,
      current_amount: parseFloat(form.saved_amount) || 0,
      target_amount: parseFloat(form.target_amount),
      target_date: form.target_date,
    }));
    setSaving(false);
    setShowEdit(false);
  };

  const handleDelete = async () => {
    if (!confirm(`Delete "${goal.name}"? This cannot be undone.`)) return;
    await base44.functions.invoke('deleteSupabaseGoal', { supabaseGoalId: goalId }).catch(() => {});
    navigate('/goals');
  };

  const handleMarkComplete = async () => {
    await base44.functions.invoke('updateSupabaseGoal', {
      supabaseGoalId: goalId,
      current_amount: goal.target_amount,
    }).catch(() => {});
    setGoal(g => ({ ...g, current_amount: g.target_amount }));
  };

  const handleImagePickerSelect = ({ url }) => {
    if (imagePickerTarget === 'hero') {
      setGoal(g => ({ ...g, image: url }));
      setForm(p => ({ ...p, image_url: url }));
      base44.functions.invoke('updateSupabaseGoal', { supabaseGoalId: goalId, image: url }).catch(() => {});
    } else {
      setForm(p => ({ ...p, image_url: url }));
    }
    setShowImagePicker(false);
  };

  const isModuleCompleted = (moduleId) =>
    userProgress.some(p => p.module_id === moduleId && p.completed);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-white/10 border-t-[#2EFD7A] rounded-full animate-spin" />
      </div>
    );
  }

  if (!goal) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-white/60">Goal not found.</p>
        <button onClick={() => navigate('/goals')} className="text-[#2EFD7A] text-sm font-semibold hover:underline">Back to Goals</button>
      </div>
    );
  }

  const saved = goal.current_amount || 0;
  const target = goal.target_amount || 0;
  const pct = Math.min(100, Math.round((saved / target) * 100));
  const isComplete = saved >= target;
  const remaining = Math.max(0, target - saved);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Back */}
      <button
        onClick={() => navigate('/goals')}
        className="flex items-center gap-1.5 text-white/60 hover:text-white text-sm font-medium mb-5 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Goals
      </button>

      {/* Two-column layout */}
      <div className="grid md:grid-cols-5 gap-5">

        {/* LEFT COLUMN */}
        <div className="md:col-span-3 space-y-4">

          {/* Hero card */}
          <div className="bg-white/[0.03] border border-white/10 backdrop-blur-sm text-white rounded-3xl overflow-hidden">
            {/* Image */}
            <div className="relative h-56 bg-white/[0.05]">
              {goal.image ? (
                <img src={goal.image} alt={goal.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Target className="w-14 h-14 text-white/30" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

              {/* Name + category bottom-left */}
              <div className="absolute bottom-0 left-0 right-0 px-5 pb-4 flex items-end justify-between gap-3">
                <div>
                  <h1 className="text-xl font-display font-extrabold text-white leading-tight mb-0.5">{goal.name}</h1>
                  {goal.goal_type && (
                    <span className="text-xs font-semibold text-white/65 uppercase tracking-wider">
                      {GOAL_TYPES.find(t => t.value === goal.goal_type)?.label || goal.goal_type}
                    </span>
                  )}
                </div>
                {/* Edit Goal button — bottom-right of overlay */}
                <button
                  onClick={() => setShowEdit(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white/15 backdrop-blur-sm text-white border border-white/25 rounded-xl text-xs font-semibold hover:bg-white/25 transition-all shrink-0"
                >
                  <Pencil className="w-3.5 h-3.5" /> Edit Goal
                </button>
              </div>

              {isComplete && (
                <div className="absolute top-4 right-4">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2EFD7A]/90 text-black rounded-full text-xs font-bold">
                    <CheckCircle className="w-3.5 h-3.5" /> Complete
                  </div>
                </div>
              )}
            </div>

            {/* Action strip under image */}
            <div className="flex items-center justify-between px-5 py-3 border-t border-white/10">
              <div className="flex items-center gap-2">
                {!isComplete && (
                  <button
                    onClick={handleMarkComplete}
                    className="text-xs text-white/60 hover:text-[#2EFD7A] transition-colors flex items-center gap-1 font-medium"
                  >
                    <CheckCircle className="w-3.5 h-3.5" /> Mark complete
                  </button>
                )}
              </div>
              <button
                onClick={handleDelete}
                className="text-xs text-white/60 hover:text-red-400 transition-colors flex items-center gap-1 font-medium"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
            </div>
          </div>

          {/* Link Account card */}
          <div className="bg-white/[0.03] border border-white/10 backdrop-blur-sm text-white rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-[#2EFD7A]/15 flex items-center justify-center">
                <Link2 className="w-4 h-4 text-[#2EFD7A]" />
              </div>
              <h3 className="text-sm font-heading font-semibold">Linked Account</h3>
            </div>

            {goal.linked_accounts_balance && goal.linked_accounts_balance > 0 ? (
              <div>
                <p className="text-3xl font-display font-extrabold text-[#2EFD7A] mb-1">
                  ${parseFloat(goal.linked_accounts_balance).toLocaleString()}
                </p>
                <p className="text-xs text-white/60">
                  {goal.last_balance_sync_at
                    ? `Last synced ${formatDistanceToNow(new Date(goal.last_balance_sync_at), { addSuffix: true })}`
                    : 'Balance from linked bank account'}
                </p>
              </div>
            ) : (
              <div className="text-center py-4">
                <div className="w-10 h-10 rounded-xl bg-white/[0.05] flex items-center justify-center mx-auto mb-3">
                  <Wallet className="w-5 h-5 text-white/60" />
                </div>
                <p className="text-sm text-white/60 mb-4">
                  Connect a bank account to track this goal automatically
                </p>
                <ConnectBankButton />
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="md:col-span-2 space-y-4">

          {/* Overview / Donut chart card */}
          <div className="bg-white/[0.03] border border-white/10 backdrop-blur-sm text-white rounded-2xl p-5">
            <h3 className="text-sm font-heading font-semibold mb-4">Overview</h3>

            <DonutChart saved={saved} target={target} />

            {/* Legend */}
            <div className="space-y-2 mt-5">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#2EFD7A] shrink-0" />
                  <span className="text-white/60 text-xs">Total Saved</span>
                </div>
                <span className="font-semibold text-xs">${saved.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-white/[0.05] border border-white/10 shrink-0" />
                  <span className="text-white/60 text-xs">Need to save</span>
                </div>
                <span className="font-semibold text-xs">${remaining.toLocaleString()}</span>
              </div>
              {goal.target_date && (
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/10">
                  <CalendarDays className="w-3.5 h-3.5 text-white/60 shrink-0" />
                  <span className="text-xs text-white/60">Target: <span className="text-white font-medium">{goal.target_date}</span></span>
                </div>
              )}
            </div>
          </div>

          {/* My Base Plan card */}
          <div className="bg-white/[0.03] border border-white/10 backdrop-blur-sm text-white rounded-2xl p-5">
            <h3 className="text-sm font-heading font-semibold mb-4">My Base Plan</h3>

            {relevantModules.length === 0 ? (
              <div className="text-center py-4">
                <BookOpen className="w-8 h-8 text-white/40 mx-auto mb-2" />
                <p className="text-xs text-white/60">No relevant lessons found.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {relevantModules.map(mod => {
                  const completed = isModuleCompleted(mod.id);
                  const IconComp = TOPIC_ICONS[mod.topic_tag] || BookOpen;
                  const colorClass = TOPIC_COLORS[mod.topic_tag] || 'bg-[#2EFD7A]/15 text-[#2EFD7A]';
                  return (
                    <button
                      key={mod.id}
                      onClick={() => navigate(`/lesson/${mod.id}`)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.05] transition-all group text-left"
                    >
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${colorClass}`}>
                        <IconComp className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold leading-tight truncate">{mod.title}</p>
                        {mod.description && (
                          <p className="text-xs text-white/60 truncate mt-0.5">{mod.description}</p>
                        )}
                      </div>
                      {completed && (
                        <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                          <CheckCircle className="w-3.5 h-3.5 text-green-400" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit modal */}
      {showEdit && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-end md:items-center justify-center z-50 p-4">
          <div className="bg-white/[0.03] border border-white/10 backdrop-blur-sm text-white rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto flex flex-col">
            <div className="relative h-44 bg-white/[0.05] rounded-t-3xl overflow-hidden shrink-0">
              {form.image_url ? (
                <img src={form.image_url} alt="Goal" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-white/40">
                  <Target className="w-10 h-10" />
                  <span className="text-xs font-medium">No image selected</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
              <div className="absolute bottom-3 left-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => { setImagePickerTarget('edit'); setShowImagePicker(true); }}
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
                onClick={() => setShowEdit(false)}
                className="absolute top-3 right-3 w-7 h-7 rounded-full bg-black/80 backdrop-blur-sm flex items-center justify-center text-white/60 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <h3 className="text-lg font-heading font-bold">Edit Goal</h3>
              <div>
                <label className="text-xs text-white/60 font-medium mb-1 block">Goal Name</label>
                <input
                  value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#2EFD7A] transition-colors"
                />
              </div>
              <div>
                <label className="text-xs text-white/60 font-medium mb-1 block">Category</label>
                <select
                  value={form.goal_type}
                  onChange={e => setForm(p => ({ ...p, goal_type: e.target.value }))}
                  className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#2EFD7A] transition-colors"
                >
                  <option value="">Select a category...</option>
                  {GOAL_TYPES.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-white/60 font-medium mb-1 block">Target Amount ($)</label>
                  <input
                    type="number"
                    value={form.target_amount}
                    onChange={e => setForm(p => ({ ...p, target_amount: e.target.value }))}
                    placeholder="0.00"
                    className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#2EFD7A] transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs text-white/60 font-medium mb-1 block">Already Saved ($)</label>
                  <input
                    type="number"
                    value={form.saved_amount}
                    onChange={e => setForm(p => ({ ...p, saved_amount: e.target.value }))}
                    placeholder="0.00"
                    className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#2EFD7A] transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-white/60 font-medium mb-1 block">Target Date (optional)</label>
                <input
                  type="date"
                  value={form.target_date}
                  onChange={e => setForm(p => ({ ...p, target_date: e.target.value }))}
                  className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#2EFD7A] transition-colors"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowEdit(false)} className="flex-1 py-3 bg-white/[0.05] text-white rounded-xl font-semibold hover:bg-white/[0.05]/80 transition-all">
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || !form.name || !form.target_amount}
                  className="flex-1 py-3 bg-[#2EFD7A] text-black rounded-xl font-semibold hover:bg-[#2EFD7A]/90 transition-all disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showImagePicker && (
        <ImagePickerModal
          onSelect={handleImagePickerSelect}
          onClose={() => setShowImagePicker(false)}
        />
      )}
    </div>
  );
}