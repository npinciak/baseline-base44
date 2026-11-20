import { useState } from 'react';
import { Users, ArrowRight } from 'lucide-react';

export default function FamilySwitchCard({ defaultName, busy, onSwitch }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(defaultName);
  return (
    <div>
      <div className="flex items-start gap-4">
        <div className="w-11 h-11 rounded-2xl bg-[#2EFD7A]/10 border border-[#2EFD7A]/25 flex items-center justify-center shrink-0">
          <Users className="w-5 h-5 text-[#2EFD7A]" />
        </div>
        <div className="flex-1">
          <p className="text-white font-semibold">Individual account</p>
          <p className="text-white/50 text-sm mt-0.5">Learning with your kids? Switch to a family account to invite them and follow their progress. Everyone keeps their own profile.</p>
        </div>
      </div>
      {!open ? (
        <button onClick={() => setOpen(true)} className="mt-5 w-full flex items-center justify-center gap-2 py-3 rounded-full bg-[#2EFD7A] text-black text-sm font-semibold hover:bg-[#2EFD7A]/90 transition-colors">
          Switch to family account <ArrowRight className="w-4 h-4" />
        </button>
      ) : (
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