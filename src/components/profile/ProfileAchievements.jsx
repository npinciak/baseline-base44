import { Award, Trophy } from 'lucide-react';
import ProfileSection from '@/components/profile/ProfileSection';

const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : null);

/** Badges and savings trophies in one place. */
export default function ProfileAchievements({ badges, earnedBadgeIds, trophies }) {
  const earnedCount = badges.filter((b) => earnedBadgeIds.has(b.id)).length;
  return (
    <ProfileSection id="trophies" icon={Award} title="Achievements"
      action={badges.length > 0 && <span className="text-xs text-white/50">{earnedCount} of {badges.length} badges</span>}>
      {badges.length === 0 ? (
        <p className="text-white/50 text-sm mb-5">Complete lessons to start earning badges.</p>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-5">
          {badges.map((badge) => {
            const earned = earnedBadgeIds.has(badge.id);
            return (
              <div key={badge.id} title={badge.description || badge.name}
                className={`flex flex-col items-center gap-1 p-2.5 rounded-2xl border text-center ${earned ? 'border-[#2EFD7A]/30 bg-[#2EFD7A]/10' : 'border-white/10 bg-white/[0.02] opacity-45 grayscale'}`}>
                <span className="text-2xl">{badge.icon || '🏅'}</span>
                <span className="text-[10px] font-semibold leading-tight text-white">{badge.name}</span>
              </div>
            );
          })}
        </div>
      )}

      <p className="text-[10px] uppercase tracking-widest text-white/40 mb-2 flex items-center gap-1.5">
        <Trophy className="w-3 h-3 text-[#2EFD7A]" /> Trophy case
      </p>
      {trophies.length === 0 ? (
        <p className="text-white/50 text-sm">Fully fund a savings goal, then move it here to celebrate the win.</p>
      ) : (
        <div className="space-y-2">
          {trophies.map((t) => {
            const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: t.currency_code || 'USD', maximumFractionDigits: 0 });
            return (
              <div key={t.id} className="flex items-center gap-3 p-3 rounded-2xl border border-[#2EFD7A]/25 bg-gradient-to-br from-[#2EFD7A]/10 to-[#2EA0FD]/5">
                <Trophy className="w-5 h-5 text-[#2EFD7A] shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{t.name}</p>
                  <p className="text-xs text-white/60">{money.format(t.target_amount)} saved{fmtDate(t.archived_at) ? ` · ${fmtDate(t.archived_at)}` : ''}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </ProfileSection>
  );
}