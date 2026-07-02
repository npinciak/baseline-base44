import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, Target, CheckCircle, Pencil, Trash2, ImageIcon, X, Camera } from 'lucide-react';
import ImagePickerModal from '@/components/ImagePickerModal';

const GOAL_TYPES = [
  { value: 'vacation', label: 'Go on Vacation' },
  { value: 'buyHome', label: 'Buy a Home' },
  { value: 'newCar', label: 'Buy a New Car' },
  { value: 'other', label: 'Something Else' },
  { value: 'unknown', label: 'Not Sure Yet' },
];

export default function GoalDetail() {
  const { goalId } = useParams();
  const navigate = useNavigate();
  const [goal, setGoal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [imagePickerTarget, setImagePickerTarget] = useState('hero'); // 'hero' | 'edit'

  useEffect(() => {
    base44.functions.invoke('getSupabaseGoals', {})
      .then(res => {
        const found = (res?.data?.goals || []).find(g => g.id === goalId);
        setGoal(found || null);
        if (found) setForm({
          name: found.name || '',
          goal_type: found.goal_type || '',
          target_amount: found.target_amount || '',
          saved_amount: found.current_amount || 0,
          target_date: found.target_date || '',
          image_url: found.image || '',
        });
      })
      .finally(() => setLoading(false));
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
    setGoal(g => ({ ...g, name: form.name, goal_type: form.goal_type, image: imageUrl, current_amount: parseFloat(form.saved_amount) || 0, target_amount: parseFloat(form.target_amount), target_date: form.target_date }));
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
      // Persist immediately
      base44.functions.invoke('updateSupabaseGoal', { supabaseGoalId: goalId, image: url }).catch(() => {});
    } else {
      setForm(p => ({ ...p, image_url: url }));
    }
    setShowImagePicker(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!goal) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-muted-foreground">Goal not found.</p>
        <button onClick={() => navigate('/goals')} className="text-primary text-sm font-semibold hover:underline">Back to Goals</button>
      </div>
    );
  }

  const saved = goal.current_amount || 0;
  const pct = Math.min(100, Math.round((saved / goal.target_amount) * 100));
  const isComplete = saved >= goal.target_amount;
  const remaining = Math.max(0, goal.target_amount - saved);

  return (
    <div className="max-w-lg mx-auto">
      {/* Full-width hero card header */}
      <div className="relative h-72 bg-secondary overflow-hidden mb-6">
        {goal.image ? (
          <img src={goal.image} alt={goal.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Target className="w-14 h-14 text-muted-foreground/30" />
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Back — top left */}
        <button
          onClick={() => navigate('/goals')}
          className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1.5 bg-black/40 backdrop-blur-sm text-white rounded-full text-sm font-medium hover:bg-black/60 transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        {/* Edit image — top right */}
        <button
          onClick={() => { setImagePickerTarget('hero'); setShowImagePicker(true); }}
          title="Change image"
          className="absolute top-4 right-4 w-9 h-9 bg-black/40 backdrop-blur-sm text-white rounded-full flex items-center justify-center hover:bg-black/60 transition-all"
        >
          <Camera className="w-4 h-4" />
        </button>

        {/* Name + category — bottom left */}
        <div className="absolute bottom-0 left-0 right-0 px-5 pb-5">
          <h1 className="text-2xl font-display font-extrabold text-white mb-1">{goal.name}</h1>
          {goal.goal_type && (
            <span className="text-xs font-semibold text-white/70 uppercase tracking-wider">
              {GOAL_TYPES.find(t => t.value === goal.goal_type)?.label || goal.goal_type}
            </span>
          )}
        </div>

        {isComplete && (
          <div className="absolute inset-0 bg-primary/20 flex items-center justify-center pointer-events-none">
            <div className="bg-primary rounded-full p-3">
              <CheckCircle className="w-8 h-8 text-primary-foreground" />
            </div>
          </div>
        )}
      </div>

      <div className="px-4 pb-8">
        {/* Actions row */}
        <div className="flex items-center justify-end gap-2 mb-6">
          {!isComplete && (
            <button onClick={handleMarkComplete} title="Mark complete" className="p-2 rounded-xl bg-secondary text-muted-foreground hover:text-primary transition-colors">
              <CheckCircle className="w-4 h-4" />
            </button>
          )}
          <button onClick={() => setShowEdit(true)} className="p-2 rounded-xl bg-secondary text-muted-foreground hover:text-foreground transition-colors">
            <Pencil className="w-4 h-4" />
          </button>
          <button onClick={handleDelete} className="p-2 rounded-xl bg-secondary text-muted-foreground hover:text-destructive transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Progress card */}
        <div className="bg-card border border-border rounded-2xl p-6 mb-4">
          <div className="flex items-end justify-between mb-4">
            <div>
              <p className="text-4xl font-display font-extrabold text-primary">${saved.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">saved of ${goal.target_amount.toLocaleString()}</p>
            </div>
            <span className="text-2xl font-display font-extrabold">{pct}%</span>
          </div>
          <div className="h-3 bg-secondary rounded-full overflow-hidden mb-4">
            <div
              className={`h-full rounded-full transition-all duration-700 ${isComplete ? 'xp-shimmer' : 'bg-primary'}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-secondary rounded-xl p-4">
              <p className="text-xs text-muted-foreground mb-1">Still needed</p>
              <p className="text-lg font-display font-bold">${remaining.toLocaleString()}</p>
            </div>
            {goal.target_date && (
              <div className="bg-secondary rounded-xl p-4">
                <p className="text-xs text-muted-foreground mb-1">Target date</p>
                <p className="text-lg font-display font-bold">{goal.target_date}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit modal */}
      {showEdit && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-end md:items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto flex flex-col">
            <div className="relative h-44 bg-secondary rounded-t-3xl overflow-hidden shrink-0">
              {form.image_url ? (
                <img src={form.image_url} alt="Goal" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-muted-foreground/40">
                  <Target className="w-10 h-10" />
                  <span className="text-xs font-medium">No image selected</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
              <div className="absolute bottom-3 left-3 flex gap-2">
                <button type="button" onClick={() => { setImagePickerTarget('edit'); setShowImagePicker(true); }} className="flex items-center gap-1.5 px-3 py-1.5 bg-background/80 backdrop-blur-sm text-foreground rounded-lg text-xs font-semibold hover:bg-background transition-all">
                  <ImageIcon className="w-3.5 h-3.5" />
                  {form.image_url ? 'Change' : 'Add Image'}
                </button>
                {form.image_url && (
                  <button type="button" onClick={() => setForm(p => ({ ...p, image_url: '' }))} className="px-3 py-1.5 bg-background/80 backdrop-blur-sm text-muted-foreground rounded-lg text-xs font-semibold hover:bg-background hover:text-foreground transition-all">
                    Remove
                  </button>
                )}
              </div>
              <button onClick={() => setShowEdit(false)} className="absolute top-3 right-3 w-7 h-7 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <h3 className="text-lg font-heading font-bold">Edit Goal</h3>
              <div>
                <label className="text-xs text-muted-foreground font-medium mb-1 block">Goal Name</label>
                <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground font-medium mb-1 block">Category</label>
                <select value={form.goal_type} onChange={e => setForm(p => ({ ...p, goal_type: e.target.value }))} className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors">
                  <option value="">Select a category...</option>
                  {GOAL_TYPES.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground font-medium mb-1 block">Target Amount ($)</label>
                  <input type="number" value={form.target_amount} onChange={e => setForm(p => ({ ...p, target_amount: e.target.value }))} placeholder="0.00" className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground font-medium mb-1 block">Already Saved ($)</label>
                  <input type="number" value={form.saved_amount} onChange={e => setForm(p => ({ ...p, saved_amount: e.target.value }))} placeholder="0.00" className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors" />
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground font-medium mb-1 block">Target Date (optional)</label>
                <input type="date" value={form.target_date} onChange={e => setForm(p => ({ ...p, target_date: e.target.value }))} className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors" />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowEdit(false)} className="flex-1 py-3 bg-secondary text-foreground rounded-xl font-semibold hover:bg-secondary/80 transition-all">Cancel</button>
                <button onClick={handleSave} disabled={saving || !form.name || !form.target_amount} className="flex-1 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-all disabled:opacity-50">
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