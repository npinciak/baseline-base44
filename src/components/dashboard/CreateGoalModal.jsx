import { X } from 'lucide-react';

const inputClass = "w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#2EFD7A]/50 transition-colors";
const labelClass = "text-xs text-white/30 font-light mb-1 block";

export default function CreateGoalModal({ form, setForm, onClose, onSubmit, saving }) {
  const field = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value }));

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-end md:items-center justify-center z-50 p-4">
      <div className="bg-white/[0.04] border border-white/10 backdrop-blur-sm rounded-3xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-light text-white">New <span className="font-extrabold">Savings Goal</span></h3>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className={labelClass}>Goal Name</label>
            <input value={form.name} onChange={field('name')} placeholder="e.g. New MacBook, Vacation to Japan" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Image URL (optional)</label>
            <input value={form.image_url} onChange={field('image_url')} placeholder="https://..." className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Description (optional)</label>
            <input value={form.description} onChange={field('description')} placeholder="Why is this important to you?" className={inputClass} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Target Amount ($)</label>
              <input type="number" value={form.target_amount} onChange={field('target_amount')} placeholder="0.00" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Already Saved ($)</label>
              <input type="number" value={form.saved_amount} onChange={field('saved_amount')} placeholder="0.00" className={inputClass} />
            </div>
          </div>
          <div>
            <label className={labelClass}>Target Date (optional)</label>
            <input type="date" value={form.target_date} onChange={field('target_date')} className={inputClass} />
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 py-3 bg-white/[0.05] text-white rounded-full font-medium hover:bg-white/10 transition-all">
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={saving || !form.name || !form.target_amount}
            className="flex-1 py-3 bg-[#2EFD7A] text-black rounded-full font-semibold hover:bg-[#2EFD7A]/90 transition-all disabled:opacity-40"
          >
            {saving ? 'Saving...' : 'Create Goal'}
          </button>
        </div>
      </div>
    </div>
  );
}