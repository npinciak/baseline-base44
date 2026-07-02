import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Flame, Coins, Award, CheckCircle, BookOpen, Trophy } from 'lucide-react';

const LEVEL_TITLES = ['Rookie', 'Learner', 'Saver', 'Investor', 'Planner', 'Strategist', 'Expert', 'Master', 'Guru', 'Legend'];

export default function Profile() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [badges, setBadges] = useState([]);
  const [userBadges, setUserBadges] = useState([]);
  const [progress, setProgress] = useState([]);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);

  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const init = async () => {
      const u = await base44.auth.me();
      setUser(u);
      const profileRes = await base44.functions.invoke('getUserProfile', {}).catch(() => null);
      setProfile(profileRes?.data?.profile || null);
      const [statsArr, allBadges, ubArr, prog, mods] = await Promise.all([
        base44.entities.UserStats.filter({ user_id: u.id }),
        base44.entities.Badge.list(),
        base44.entities.UserBadge.filter({ user_id: u.id }),
        base44.entities.UserProgress.filter({ user_id: u.id }),
        base44.entities.Module.filter({ is_published: true }),
      ]);
      setStats(statsArr[0] || null);
      setBadges(allBadges);
      setUserBadges(ubArr);
      setProgress(prog);
      setModules(mods);
      setLoading(false);
    };
    init().catch(() => setLoading(false));
  }, []);

  const earnedBadgeIds = new Set(userBadges.map(ub => ub.badge_id));
  const completedModules = modules.filter(m => progress.some(p => p.module_id === m.id && p.completed));
  const totalLessonsCompleted = progress.filter(p => p.completed).length;

  const xpForLevel = (level) => level * 200;
  const xpProgress = stats ? ((stats.total_xp % xpForLevel(stats.current_level)) / xpForLevel(stats.current_level)) * 100 : 0;
  const levelTitle = LEVEL_TITLES[Math.min((stats?.current_level || 1) - 1, LEVEL_TITLES.length - 1)];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-display font-extrabold mb-8">My Profile</h1>

      {/* User card */}
      <div className="bg-card border border-border rounded-3xl p-6 mb-6">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/30 to-primary/10 border border-primary/20 flex items-center justify-center text-3xl font-display font-extrabold text-primary">
            {profile?.first_name?.[0] || user?.full_name?.[0] || 'U'}
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-display font-extrabold">
              {profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() : user?.full_name}
            </h2>
            <p className="text-muted-foreground text-sm">{user?.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs px-2.5 py-1 rounded-full bg-primary/15 text-primary font-semibold border border-primary/20">
                Level {stats?.current_level || 1} · {levelTitle}
              </span>
            </div>
          </div>
        </div>

        {/* XP Bar */}
        <div className="mt-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">Level {stats?.current_level || 1} → {(stats?.current_level || 1) + 1}</span>
            <span className="text-xs font-semibold text-primary">{stats?.total_xp || 0} / {xpForLevel((stats?.current_level || 1) + 1)} Base Coins</span>
          </div>
          <div className="h-3 bg-secondary rounded-full overflow-hidden">
            <div className="h-full rounded-full xp-shimmer transition-all duration-700" style={{ width: `${xpProgress}%` }} />
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { icon: Flame, label: 'Day Streak', value: stats?.current_streak || 0, color: 'text-orange-400', bg: 'bg-orange-400/10' },
          { icon: Coins, label: 'Base Coins', value: stats?.total_xp || 0, color: 'text-primary', bg: 'bg-primary/10' },
          { icon: BookOpen, label: 'Lessons Done', value: totalLessonsCompleted, color: 'text-blue-400', bg: 'bg-blue-400/10' },
          { icon: Trophy, label: 'Best Streak', value: stats?.longest_streak || 0, color: 'text-amber-400', bg: 'bg-amber-400/10' },
        ].map(({ icon: Icon, label, value, color, bg }) => (
          <div key={label} className="bg-card border border-border rounded-2xl p-4 text-center">
            <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mx-auto mb-2`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <p className="text-2xl font-display font-extrabold">{value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Badges */}
      <div className="bg-card border border-border rounded-3xl p-6 mb-6">
        <h3 className="text-lg font-heading font-bold mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-400" /> Badges
        </h3>
        {badges.length === 0 ? (
          <p className="text-muted-foreground text-sm">No badges defined yet. Complete lessons to start earning!</p>
        ) : (
          <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
            {badges.map((badge) => {
              const earned = earnedBadgeIds.has(badge.id);
              return (
                <div
                  key={badge.id}
                  className={`flex flex-col items-center gap-2 p-3 rounded-2xl border text-center transition-all duration-200 ${
                    earned ? 'border-amber-400/30 bg-amber-400/10' : 'border-border bg-secondary opacity-50 grayscale'
                  }`}
                >
                  <span className="text-3xl">{badge.icon || '🏅'}</span>
                  <span className="text-xs font-semibold leading-tight">{badge.name}</span>
                  {earned && <span className="text-xs text-amber-400">Earned</span>}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Completed modules */}
      <div className="bg-card border border-border rounded-3xl p-6">
        <h3 className="text-lg font-heading font-bold mb-4 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-primary" /> Completed Modules
        </h3>
        {completedModules.length === 0 ? (
          <p className="text-muted-foreground text-sm">No modules completed yet. Start learning to track your progress!</p>
        ) : (
          <div className="space-y-3">
            {completedModules.map(mod => (
              <div key={mod.id} className="flex items-center gap-3 p-3 bg-secondary rounded-xl">
                <CheckCircle className="w-5 h-5 text-primary shrink-0" />
                <span className="text-sm font-medium">{mod.title}</span>
                <span className="ml-auto text-xs text-primary font-semibold">+{mod.xp_reward} BC</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}