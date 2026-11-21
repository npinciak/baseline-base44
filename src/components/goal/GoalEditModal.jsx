import { Target, ImageIcon, X } from 'lucide-react';
import { FIELD, BTN_T } from '@/lib/goalStyles';

const GOAL_TYPES = [
  { value: 'vacation', label: 'Go on Vacation' },
  { value: 'buyHome', label: 'Buy a Home' },
  { value: 'newCar', label: 'Buy a New Car' },
  { value: 'other', label: 'Something Else' },
  { value: 'unknown', label: 'Not Sure Yet' },
];
export { GOAL_TYPES };

const Field = ({ label, children }) => <div><label className="block text-[11px] text-[#8a9a93] font-medium mb-[5px]">{label}</label>{children}</div>;

export default function GoalEditModal({ form, setForm, saving, onSave, onClose, onPickImage }) {
  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-end md:items-center justify-center z-50 p-4">
      <div className="rounded-[20px] overflow-hidden bg-[#101417] border border-[#232a2e] shadow-[0_18px_40px_rgba(0,0,0,.45)] text-white w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="relative h-[130px] bg-[#161b1f] flex flex-col items-center justify-center gap-1.5 text-[#5d6b64] text-xs font-medium">
          {form.image_url ? <img src={form.image_url} alt="Goal" className="absolute inset-0 w-full h-full object-cover" /> : <><Target className="w-9 h-9" /><span>No image selected</span></>}
          <div className="absolute bottom-2.5 left-2.5 flex gap-2">
            <button type="button" onClick={onPickImage} className={`${BTN_T} flex items-center gap-1.5 px-3 py-1.5 rounded-[9px] bg-black/85 text-white text-[11px] font-semibold`}><ImageIcon className="w-3.5 h-3.5" />{form.image_url ? 'Change' : 'Add Image'}</button>
            {form.image_url && <button type="button" onClick={() => setForm(p => ({ ...p, image_url: '' }))} className={`${BTN_T} px-3 py-1.5 rounded-[9px] bg-black/85 text-[#9aa8a1] text-[11px] font-semibold hover:text-white`}>Remove</button>}
          </div>
          <button onClick={onClose} className={`${BTN_T} absolute top-2.5 right-2.5 w-[26px] h-[26px] rounded-full bg-black/85 flex items-center justify-center text-[#9aa8a1] hover:text-white`}><X className="w-3.5 h-3.5" /></button>
        </div>
        <div className="p-5 flex flex-col gap-3">
          <h3 className="text-[17px] font-bold">Edit Goal</h3>
          <Field label="Goal Name"><input value={form.name} onChange={set('name')} className={FIELD} /></Field>
          <Field label="Category">
            <select value={form.goal_type} onChange={set('goal_type')} className={FIELD}>
              <option value="" className="bg-black">Select a category...</option>
              {GOAL_TYPES.map(({ value, label }) => <option key={value} value={value} className="bg-black">{label}</option>)}
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-2.5">
            <Field label="Target Amount ($)"><input type="number" value={form.target_amount} onChange={set('target_amount')} placeholder="0.00" className={FIELD} /></Field>
            <Field label="Already Saved ($)"><input type="number" value={form.saved_amount} onChange={set('saved_amount')} placeholder="0.00" className={FIELD} /></Field>
          </div>
          <Field label="Target Date (optional)"><input type="date" value={form.target_date} onChange={set('target_date')} className={FIELD} /></Field>
          <div className="flex gap-2.5 pt-1">
            <button onClick={onClose} className={`${BTN_T} flex-1 py-[11px] rounded-xl text-[13px] font-semibold bg-[#1a2024] text-[#e9efec] hover:bg-[#252d32]`}>Cancel</button>
            <button onClick={onSave} disabled={saving || !form.name || !form.target_amount} className={`${BTN_T} flex-1 py-[11px] rounded-xl text-[13px] font-semibold bg-[#2efd7a] text-[#04140b] hover:shadow-[0_0_18px_rgba(46,253,122,.4)] disabled:opacity-50`}>{saving ? 'Saving...' : 'Save Changes'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}