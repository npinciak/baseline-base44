import { Mail } from 'lucide-react';

export default function PendingInvites({ pending, busy, onRespond }) {
  if (!pending.length) return null;
  return (
    <div className="space-y-2 mb-5">
      {pending.map(inv => (
        <div key={inv.id} className="bg-[#2EFD7A]/[0.06] border border-[#2EFD7A]/30 rounded-2xl p-4">
          <p className="text-white text-sm font-semibold flex items-center gap-2"><Mail className="w-4 h-4 text-[#2EFD7A]" /> You're invited to join {inv.family_name}</p>
          <p className="text-white/50 text-xs mt-1">You'll join as a {inv.role}. Your profile and progress stay your own.</p>
          <div className="flex gap-2 mt-3">
            <button disabled={busy} onClick={() => onRespond('decline', inv.id)} className="flex-1 py-2 rounded-full bg-white/10 text-white text-xs font-semibold disabled:opacity-50">Decline</button>
            <button disabled={busy} onClick={() => onRespond('accept', inv.id)} className="flex-1 py-2 rounded-full bg-[#2EFD7A] text-black text-xs font-semibold disabled:opacity-50">Join family</button>
          </div>
        </div>
      ))}
    </div>
  );
}