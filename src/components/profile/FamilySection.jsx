import { Users } from 'lucide-react';
import useFamily from '@/hooks/useFamily';
import FamilySwitchCard from '@/components/profile/FamilySwitchCard';
import FamilyInviteForm from '@/components/profile/FamilyInviteForm';
import FamilyMemberRow from '@/components/profile/FamilyMemberRow';
import PendingInvites from '@/components/profile/PendingInvites';

export default function FamilySection({ profile, user }) {
  const fam = useFamily();
  const isParent = fam.me?.role === 'parent';
  const defaultName = profile?.last_name ? `The ${profile.last_name} Family` : 'My Family';
  const leave = () => window.confirm(isParent ? 'Leave this family account? If you are the only parent, the family will be closed.' : 'Leave this family account?') && fam.run({ action: 'remove', member_id: fam.members.find(m => m.is_me)?.id });

  return (
    <div className="bg-white/[0.03] border border-white/10 backdrop-blur-sm rounded-3xl p-6 md:p-8">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-white/60 text-xs font-light tracking-widest uppercase">{fam.family ? 'Family Account' : 'Account Type'}</h3>
        <Users className="w-4 h-4 text-white/30" />
      </div>
      {fam.loading ? <p role="status" className="text-white/40 text-sm">Loading…</p> : <>
        <PendingInvites pending={fam.pending} busy={fam.busy} onRespond={(action, id) => fam.run({ action, member_id: id })} />
        {!fam.family ? (
          <FamilySwitchCard defaultName={defaultName} busy={fam.busy} onSwitch={name => fam.run({ action: 'create', name })} />
        ) : (
          <div className="space-y-4">
            <div>
              <p className="text-white text-lg font-bold">{fam.family.name}</p>
              <p className="text-white/40 text-xs">{fam.members.length} member{fam.members.length === 1 ? '' : 's'} · You're a {fam.me.role}</p>
            </div>
            <div className="space-y-2">
              {fam.members.map(m => <FamilyMemberRow key={m.id} member={m} isParent={isParent} busy={fam.busy} onRemove={mem => window.confirm(`Remove ${mem.display_name} from the family?`) && fam.run({ action: 'remove', member_id: mem.id })} />)}
            </div>
            {isParent && <FamilyInviteForm busy={fam.busy} onInvite={form => fam.run({ action: 'invite', ...form })} />}
            <button onClick={leave} disabled={fam.busy} className="text-xs text-white/40 hover:text-white transition-colors">Leave family account</button>
          </div>
        )}
        {fam.error && <p role="alert" className="text-red-400 text-xs mt-3">{fam.error}</p>}
      </>}
    </div>
  );
}