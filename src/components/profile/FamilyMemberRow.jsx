import { useState } from 'react';
import { ChevronDown, X } from 'lucide-react';
import MemberProgress from '@/components/profile/MemberProgress';

export default function FamilyMemberRow({ member, isParent, busy, onRemove }) {
  const [open, setOpen] = useState(false);
  const canTrack = isParent && member.role === 'child';
  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-2xl px-4 py-3">
      <div className="flex items-center gap-3">
        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-black ${member.role === 'parent' ? 'bg-[#2EFD7A]' : 'bg-[#2EFD7A]'}`}>
          {member.display_name?.[0]?.toUpperCase() || '?'}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-semibold truncate">{member.display_name}{member.is_me && <span className="text-white/40 font-normal"> (you)</span>}</p>
          <p className="text-white/40 text-xs capitalize">{member.role}{member.status === 'invited' ? ' · Invite pending' : ''}</p>
        </div>
        {canTrack && (
          <button onClick={() => setOpen(o => !o)} aria-expanded={open} className="text-xs font-semibold text-[#2EFD7A] flex items-center gap-1">
            Progress <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
          </button>
        )}
        {isParent && !member.is_me && (
          <button disabled={busy} onClick={() => onRemove(member)} aria-label={`Remove ${member.display_name}`} className="p-1 text-white/30 hover:text-red-400 transition-colors">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      {open && <MemberProgress memberId={member.id} />}
    </div>
  );
}