import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Flame, Coins, Award, CheckCircle, BookOpen, Trophy } from 'lucide-react';
import BaseScoreSection from '@/components/profile/BaseScoreSection';
import FamilySection from '@/components/profile/FamilySection';
import JourneySection from '@/components/profile/JourneySection';
import AmbientBackdrop from '@/components/dashboard/AmbientBackdrop';

const LEVEL_TITLES = ['Rookie', 'Learner', 'Saver', 'Investor', 'Planner', 'Strategist', 'Expert', 'Master', 'Guru', 'Legend'];

const containerVariants = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 22 } },
};

export default function Profile() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [badges, setBadges] = useState([]);
  const [userBadges, setUserBadges] = useState([]);
  const [progress, setProgress] = useState([]);
  const [modules, setModules] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const init = async () => {
      const u = await base44.auth.me();
      setUser(u);
      const profileRes = await base44.functions.invoke('getUserProfile', {}).catch(() => null);
      setProfile(profileRes?.data?.profile || null);
      const [statsArr, allBadges, ubArr, prog, mods, goalsRes] = await Promise.all([
        base44.entities.UserStats.filter({ user_id: u.id }),
        base44.entities.Badge.list(),
        base44.entities.UserBadge.filter({ user_id: u.id }),
        base44.entities.UserProgress.filter({ user_id: u.id }),
        base44.entities.Module.filter({ is_published: true }),
        base44.functions.invoke('getSupabaseGoals', {}).catch(() => ({ data: { goals: [] } })),
      ]);
      setStats(statsArr[0] || null);
      setBadges(allBadges);
      setUserBadges(ubArr);
      setProgress(prog);
      setModules(mods);
      setGoals(goalsRes?.data?.goals || []);
      setLoading(false);
    };
    init().catch(() => setLoading(false));
  }, []);

  const earnedBadgeIds = new Set(userBadges.map(ub => ub.badge_id));
  const earnedBadges = badges.filter(b => earnedBadgeIds.has(b.id));
  const completedModules = modules.filter(m => progress.some(p => p.module_id === m.id && p.completed));
  const totalLessonsCompleted = progress.filter(p => p.completed).length;

  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const recentProgress = progress.filter(p => p.completed && p.completed_at && new Date(p.completed_at) >= oneWeekAgo);
  const lessonsThisWeek = recentProgress.length;
  const recentTopicTags = [...new Set(
    recentProgress.map(p => modules.find(m => m.id === p.module_id)?.topic_tag).filter(Boolean)
  )];

  const activeGoal = goals.find(g => (g.current_amount || 0) < g.target_amount) || goals[0];

  const xpForLevel = (level) => level * 200;
  const xpProgress = stats ? ((stats.total_xp % xpForLevel(stats.current_level)) / xpForLevel(stats.current_level)) * 100 : 0;
  const levelTitle = LEVEL_TITLES[Math.min((stats?.current_level || 1) - 1, LEVEL_TITLES.length - 1)];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="w-8 h-8 border-4 border-white/10 border-t-[#2EFD7A] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-black px-4 md:px-10 py-10 overflow-hidden">
      <AmbientBackdrop />
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="relative z-10 max-w-2xl mx-auto"
      >
        <motion.h1 variants={itemVariants} className="text-3xl font-display font-extrabold text-white mb-8">My Profile</motion.h1>

        {/* User card */}
        <motion.div variants={itemVariants} className="bg-white/[0.03] border border-white/10 backdrop-blur-sm rounded-3xl p-6 mb-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#2EFD7A]/30 to-[#2EFD7A]/10 border border-[#2EFD7A]/20 flex items-center justify-center text-3xl font-display font-extrabold text-[#2EFD7A]">
              {profile?.first_name?.[0] || user?.full_name?.[0] || 'U'}
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-display font-extrabold text-white">
                {profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() : user?.full_name}
              </h2>
              <p className="text-white/50 text-sm">{user?.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs px-2.5 py-1 rounded-full bg-[#2EFD7A]/15 text-[#2EFD7A] font-semibold border border-[#2EFD7A]/20">
                  Level {stats?.current_level || 1} · {levelTitle}
                </span>
              </div>
            </div>
          </div>

          {/* XP Bar */}
          <div className="mt-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-white/50">Level {stats?.current_level || 1} → {(stats?.current_level || 1) + 1}</span>
              <span className="text-xs font-semibold text-[#2EFD7A]">{stats?.total_xp || 0} / {xpForLevel((stats?.current_level || 1) + 1)} Base Coins</span>
            </div>
            <div className="h-3 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full rounded-full xp-shimmer transition-all duration-700" style={{ width: `${xpProgress}%` }} />
            </div>
          </div>
        </motion.div>

        {/* Stats grid */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { icon: Flame, label: 'Day Streak', value: stats?.current_streak || 0, color: 'text-orange-400', bg: 'bg-orange-400/10' },
            { icon: Coins, label: 'Base Coins', value: stats?.total_xp || 0, color: 'text-[#2EFD7A]', bg: 'bg-[#2EFD7A]/10' },
            { icon: BookOpen, label: 'Lessons Done', value: totalLessonsCompleted, color: 'text-[#2BF9E9]', bg: 'bg-[#2BF9E9]/10' },
            { icon: Trophy, label: 'Best Streak', value: stats?.longest_streak || 0, color: 'text-amber-400', bg: 'bg-amber-400/10' },
          ].map(({ icon: Icon, label, value, color, bg }) => (
            <div key={label} className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 text-center">
              <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mx-auto mb-2`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <p className="text-2xl font-display font-extrabold text-white">{value}</p>
              <p className="text-xs text-white/50 mt-0.5">{label}</p>
            </div>
          ))}
        </motion.div>

        {/* BaseScore */}
        <motion.div variants={itemVariants} className="mb-6">
          <BaseScoreSection stats={stats} />
        </motion.div>

        {/* My Journey (For Kids) */}
        <motion.div variants={itemVariants} className="mb-6">
          <JourneySection stats={stats} goal={activeGoal} earnedBadges={earnedBadges} />
        </motion.div>

        {/* Family Dashboard (For Parents) */}
        <motion.div variants={itemVariants} className="mb-6">
          <FamilySection profile={profile} user={user} lessonsThisWeek={lessonsThisWeek} topicTags={recentTopicTags} goal={activeGoal} />
        </motion.div>

        {/* Badges */}
        <motion.div variants={itemVariants} className="bg-white/[0.03] border border-white/10 backdrop-blur-sm rounded-3xl p-6 mb-6">
          <h3 className="text-lg font-heading font-bold mb-4 flex items-center gap-2 text-white">
            <Award className="w-5 h-5 text-amber-400" /> Badges
          </h3>
          {badges.length === 0 ? (
            <p className="text-white/50 text-sm">No badges defined yet. Complete lessons to start earning!</p>
          ) : (
            <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
              {badges.map((badge) => {
                const earned = earnedBadgeIds.has(badge.id);
                return (
                  <div
                    key={badge.id}
                    className={`flex flex-col items-center gap-2 p-3 rounded-2xl border text-center transition-all duration-200 ${
                      earned ? 'border-amber-400/30 bg-amber-400/10' : 'border-white/10 bg-white/[0.02] opacity-50 grayscale'
                    }`}
                  >
                    <span className="text-3xl">{badge.icon || '🏅'}</span>
                    <span className="text-xs font-semibold leading-tight text-white">{badge.name}</span>
                    {earned && <span className="text-xs text-amber-400">Earned</span>}
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Completed modules */}
        <motion.div variants={itemVariants} className="bg-white/[0.03] border border-white/10 backdrop-blur-sm rounded-3xl p-6">
          <h3 className="text-lg font-heading font-bold mb-4 flex items-center gap-2 text-white">
            <CheckCircle className="w-5 h-5 text-[#2EFD7A]" /> Completed Modules
          </h3>
          {completedModules.length === 0 ? (
            <p className="text-white/50 text-sm">No modules completed yet. Start learning to track your progress!</p>
          ) : (
            <div className="space-y-3">
              {completedModules.map(mod => (
                <div key={mod.id} className="flex items-center gap-3 p-3 bg-white/[0.03] border border-white/10 rounded-xl">
                  <CheckCircle className="w-5 h-5 text-[#2EFD7A] shrink-0" />
                  <span className="text-sm font-medium text-white">{mod.title}</span>
                  <span className="ml-auto text-xs text-[#2EFD7A] font-semibold">+{mod.xp_reward} BC</span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}