import { useState } from 'react';
import { Check, Pencil, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { getDisplayName, getInitial } from '@/lib/displayName';

export default function ProfileIdentityCard({ user, profile, levelInfo, onUpdated, children }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const displayName = getDisplayName(user, profile) || 'Baseline Member';
  const initial = getInitial(user, profile);
  const level = levelInfo?.current?.level || 1;
  const levelTitle = levelInfo?.current?.title || 'Trailhead';

  const startEdit = () => {
    setDraft(getDisplayName(user, profile));
    setEditing(true);
  };

  const handleSave = async (e) => {
    e?.preventDefault();
    const trimmed = draft.trim();
    if (!trimmed) return;
    setSaving(true);
    try {
      const [updatedUser, syncRes] = await Promise.all([
        base44.auth.updateMe({ display_name: trimmed }),
        base44.functions.invoke('syncUserProfile', { action: 'update', display_name: trimmed }).catch(() => null),
      ]);
      const nextProfile = syncRes?.data?.profile ?? profile;
      onUpdated?.(updatedUser || { ...user, display_name: trimmed }, nextProfile);
      window.dispatchEvent(new CustomEvent('profile-updated', {
        detail: { displayName: trimmed, profile: nextProfile },
      }));
      setEditing(false);
      toast({ title: 'Display name saved', description: `Showing "${trimmed}" across your profile and dashboard.` });
    } catch {
      toast({ title: 'Could not save display name', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-[#2EFD7A]/[0.08] via-white/[0.03] to-[#2EA0FD]/[0.08] border border-white/10 backdrop-blur-sm rounded-3xl p-6">
      <div className="flex items-center gap-5">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#2EFD7A]/30 to-[#2EFD7A]/10 border border-[#2EFD7A]/20 flex items-center justify-center text-3xl font-display font-extrabold text-[#2EFD7A] shrink-0">
          {initial}
        </div>
        <div className="flex-1 min-w-0">
          {editing ? (
            <form onSubmit={handleSave} className="flex items-center gap-2 mb-1 flex-wrap">
              <input
                type="text"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Display name"
                autoFocus
                maxLength={60}
                disabled={saving}
                aria-label="Profile display name"
                className="bg-black/50 border border-white/20 rounded-xl px-3.5 py-1.5 text-white text-base font-semibold outline-none focus:border-[#2EFD7A] flex-1 min-w-[160px]"
              />
              <button
                type="submit"
                disabled={saving || !draft.trim()}
                aria-label="Save display name"
                className="h-9 px-3 rounded-xl bg-[#2EFD7A] text-black text-xs font-semibold flex items-center gap-1.5 hover:bg-[#2EFD7A]/90 disabled:opacity-40 transition-colors"
              >
                <Check className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                disabled={saving}
                aria-label="Cancel editing name"
                className="w-9 h-9 rounded-xl bg-white/10 text-white/70 flex items-center justify-center hover:bg-white/15 hover:text-white disabled:opacity-40 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <div className="flex items-center gap-2.5">
              <h2 className="text-2xl font-display font-extrabold text-white truncate">{displayName}</h2>
              <button
                type="button"
                onClick={startEdit}
                aria-label="Edit display name"
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.06] border border-white/10 text-white/60 text-xs font-medium hover:bg-white/10 hover:text-white transition-colors shrink-0"
              >
                <Pencil className="w-3 h-3" />
                Edit
              </button>
            </div>
          )}
          <p className="text-white/50 text-sm truncate">{user?.email}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs px-2.5 py-1 rounded-full bg-[#2EFD7A]/15 text-[#2EFD7A] font-semibold border border-[#2EFD7A]/20">
              Level {level} · {levelTitle}
            </span>
          </div>
        </div>
      </div>

      {children}
    </div>
  );
}