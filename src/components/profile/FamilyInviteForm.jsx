import { useState } from 'react';
import { UserPlus } from 'lucide-react';

const input = 'w-full bg-white/[0.05] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#2EFD7A]';

export default function FamilyInviteForm({ busy, onInvite }) {
  const [form, setForm] = useState({ display_name: '', email: '', role: 'child' });
  const [sent, setSent] = useState('');
  const submit = async (e) => {
    e.preventDefault();
    const res = await onInvite(form);
    if (res?.ok) { setSent(form.email); setForm({ display_name: '', email: '', role: 'child' }); }
  };
  return (
    <form onSubmit={submit} className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 space-y-3">
      <p className="text-white text-sm font-semibold flex items-center gap-2"><UserPlus className="w-4 h-4 text-[#2EFD7A]" /> Invite a family member</p>
      <div className="grid sm:grid-cols-2 gap-2">
        <input aria-label="Name" placeholder="Name" value={form.display_name} onChange={e => setForm(f => ({ ...f, display_name: e.target.value }))} maxLength={40} className={input} />
        <input aria-label="Email" type="email" placeholder="Their email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className={input} />
      </div>
      <div className="flex gap-2">
        <select aria-label="Role" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} className={`${input} w-auto`}>
          <option value="child" className="bg-black">Child</option>
          <option value="parent" className="bg-black">Parent</option>
        </select>
        <button disabled={busy || !form.display_name.trim() || !form.email.trim()} className="flex-1 py-2.5 rounded-xl bg-[#2EFD7A] text-black text-sm font-semibold disabled:opacity-50">{busy ? 'Sending…' : 'Send invite'}</button>
      </div>
      {sent && <p className="text-xs text-[#2EFD7A]">Invite sent to {sent}. They'll see it on their Profile after signing in.</p>}
    </form>
  );
}