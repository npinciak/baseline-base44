import { X } from 'lucide-react';
import { CATEGORY_META } from '@/components/calendar/categoryMeta';

const field = 'w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#2EFD7A] transition-colors';

export default function EventFormModal({ form, setForm, editing, saving, onSave, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-end md:items-center justify-center z-50 p-4">
      <div className="bg-neutral-950 border border-white/10 rounded-3xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-heading font-bold">{editing ? 'Edit Event' : 'New Financial Event'}</h3>
          <button onClick={onClose} className="text-white/60 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <div className="space-y-4">
          <div className="flex gap-2">
            {['expense', 'income'].map((t) => (
              <button key={t} onClick={() => setForm((p) => ({ ...p, type: t }))}
                className={`flex-1 py-2 rounded-xl text-sm font-semibold capitalize transition-all ${form.type === t ? 'bg-[#2EFD7A] text-black' : 'bg-white/[0.05] text-white/60'}`}>
                {t}
              </button>
            ))}
          </div>

          <div>
            <label className="text-xs text-white/60 font-medium mb-1 block">Name</label>
            <input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="e.g. Rent, Netflix, Salary" className={field} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-white/60 font-medium mb-1 block">Amount ($)</label>
              <input type="number" value={form.amount} onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))} placeholder="0.00" className={field} />
            </div>
            <div>
              <label className="text-xs text-white/60 font-medium mb-1 block">Day of Month</label>
              <input type="number" min="1" max="31" value={form.day_of_month} onChange={(e) => setForm((p) => ({ ...p, day_of_month: e.target.value }))} className={field} />
            </div>
          </div>

          <div>
            <label className="text-xs text-white/60 font-medium mb-1 block">Category</label>
            <select value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))} className={field}>
              {Object.entries(CATEGORY_META).map(([val, { label }]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={() => setForm((p) => ({ ...p, is_recurring: !p.is_recurring }))}
              className={`relative w-10 h-5 rounded-full transition-all ${form.is_recurring ? 'bg-[#2EFD7A]' : 'bg-white/[0.05] border border-white/10'}`}>
              <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${form.is_recurring ? 'left-5' : 'left-0.5'}`} />
            </button>
            <span className="text-sm text-white/60">Recurring</span>
            {form.is_recurring && (
              <select value={form.frequency} onChange={(e) => setForm((p) => ({ ...p, frequency: e.target.value }))}
                className="ml-auto bg-white/[0.05] border border-white/10 rounded-lg px-3 py-1 text-xs focus:outline-none focus:border-[#2EFD7A] transition-colors">
                {['monthly', 'weekly', 'biweekly', 'yearly'].map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
            )}
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 py-3 bg-white/[0.05] text-white rounded-xl font-semibold transition-all">Cancel</button>
          <button onClick={onSave} disabled={saving || !form.name || !form.amount}
            className="flex-1 py-3 bg-[#2EFD7A] text-black rounded-xl font-semibold hover:bg-[#2EFD7A]/90 transition-all disabled:opacity-50">
            {saving ? 'Saving...' : editing ? 'Save Changes' : 'Add Event'}
          </button>
        </div>
      </div>
    </div>
  );
}