import { useState } from 'react';
import { Users, User, Check, ArrowRight } from 'lucide-react';

export default function FamilySwitchCard({ defaultName, busy, onSwitch }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(defaultName);
  return (
    <div>
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-2xl border border-[#2EFD7A]/40 bg-[#2EFD7A]/10 p-3">
          <User className="w-4 h-4 text-[#2EFD7A] mb-2" />
          <p className="text-white text-sm font-semibold flex items-center gap-1">Individual <Check className="w-3.5 h-3.5 text-[#2EFD7A]" /></p>
          <p className="text-white/50 text-[11px]">Your current plan</p>
        </div>
        <button type="button" onClick={() => setOpen(true)} className="text-left rounded-2xl border border-white/10 bg-white/[0.02] p-3 hover:border-white/25 transition-colors">
          <Users className="w-4 h-4 text-white/50 mb-2" />
          <p className="text-white text-sm font-semibold flex items-center gap-1">Family <ArrowRight className="w-3.5 h-3.5 text-white/40" /></p>
          <p className="text-white/50 text-[11px]">Invite kids, follow progress</p>
        </button>
      </div>
      {open && (
        <form onSubmit={e => { e.preventDefault(); onSwitch(name); }} className="mt-5 space-y-3">
          <label className="block text-xs text-white/50" htmlFor="family-name">Family name</label>
          <input id="family-name" value={name} onChange={e => setName(e.target.value)} maxLength={60} className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#2EFD7A]" />
          <div className="flex gap-2">
            <button type="button" onClick={() => setOpen(false)} className="flex-1 py-2.5 rounded-full bg-white/10 text-white text-sm font-semibold">Cancel</button>
            <button disabled={busy || !name.trim()} className="flex-1 py-2.5 rounded-full bg-[#2EFD7A] text-black text-sm font-semibold disabled:opacity-50">{busy ? 'Creating…' : 'Create family'}</button>
          </div>
        </form>
      )}
    </div>
  );
}