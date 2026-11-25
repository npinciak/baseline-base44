import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import FamilySection from '@/components/profile/FamilySection';
import ProfileIdentityCard from '@/components/profile/ProfileIdentityCard';
import ProfileStats from '@/components/profile/ProfileStats';
import ProfileAchievements from '@/components/profile/ProfileAchievements';
import LevelBenefitsPanel from '@/components/levels/LevelBenefitsPanel';
import AmbientBackdrop from '@/components/dashboard/AmbientBackdrop';
import { getLevelInfo, getLifetimeCoins } from '@/lib/coinLevels';
import { buildChapters } from '@/lib/curriculum';
import { applyBasePathProgress } from '@/lib/baseScoreProgress';
import { downloadMoneyPlaybook } from '@/lib/playbookPdf';

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
  const [goals, setGoals] = useState([]);
  const [walletBalance, setWalletBalance] = useState(0);
  const [payloadModules, setPayloadModules] = useState([]);
  const [moves, setMoves] = useState([]);
  const [trophies, setTrophies] = useState([]);
  const [activatingShield, setActivatingShield] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const { toast } = useToast();

  const handleActivateShield = async () => {
    if (activatingShield) return;
    setActivatingShield(true);
    try {
      const res = await base44.functions.invoke('activateStreakShield', {});
      const nextBal = res?.data?.newBalance;
      if (typeof nextBal === 'number') {
        setWalletBalance(nextBal);
        window.dispatchEvent(new CustomEvent('wallet-updated', { detail: { balance: nextBal } }));
      }
      setStats((prev) => (prev ? { ...prev, streak_shield_active: true } : prev));
      toast({
        title: 'Streak Shield armed!',
        description: 'Your daily streak is now protected the next time you miss a single day.',
      });
    } catch (err) {
      toast({
        title: 'Could not arm Streak Shield',
        description: err?.response?.data?.error || 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setActivatingShield(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      const u = await base44.auth.me();
      setUser(u);
      const profileRes = await base44.functions.invoke('getUserProfile', {}).catch(() => null);
      setProfile(profileRes?.data?.profile || null);
      const [statsArr, allBadges, ubArr, prog, goalsRes, walletRes, payloadRes, movesArr, trophyArr] = await Promise.all([
        base44.entities.UserStats.filter({ user_id: u.id }),
        base44.entities.Badge.list(),
        base44.entities.UserBadge.filter({ user_id: u.id }),
        base44.entities.UserProgress.filter({ user_id: u.id }),
        base44.functions.invoke('getSupabaseGoals', {}).catch(() => ({ data: { goals: [] } })),
        base44.functions.invoke('getWallet', {}).catch(() => ({ data: { balance: 0 } })),
        base44.functions.invoke('getPayloadLessons', {}).catch(() => ({ data: { modules: [] } })),
        base44.entities.MoneyMoveCompletion.filter({ user_id: u.id }).catch(() => []),
        base44.entities.GoalTrophy.filter({ user_id: u.id }, '-archived_at').catch(() => []),
      ]);
      setTrophies(trophyArr || []);
      setStats(statsArr[0] || null);
      setBadges(allBadges);
      setUserBadges(ubArr);
      setProgress(prog);
      setGoals(goalsRes?.data?.goals || []);
      setWalletBalance(walletRes?.data?.balance ?? 0);
      setPayloadModules(payloadRes?.data?.modules || []);
      setMoves(movesArr || []);
      setLoading(false);
    };
    init().catch(() => setLoading(false));
  }, []);

  const earnedBadgeIds = new Set(userBadges.map(ub => ub.badge_id));
  const totalLessonsCompleted = progress.filter(p => p.completed).length;
  const chapters = buildChapters(payloadModules, progress, moves);
  const completedUnitsCount = chapters.reduce((s, c) => s + c.lessonsDone, 0);
  const lifetimeCoins = getLifetimeCoins(stats, completedUnitsCount);
  const levelInfo = getLevelInfo(lifetimeCoins);

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
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="relative z-10 max-w-5xl mx-auto space-y-6">
        <motion.h1 variants={itemVariants} className="text-3xl font-display font-extrabold text-white">My Profile</motion.h1>

        <motion.div variants={itemVariants}>
          <ProfileIdentityCard
            user={user}
            profile={profile}
            levelInfo={levelInfo}
            onUpdated={(nextUser, nextProfile) => {
              setUser(nextUser);
              setProfile(nextProfile);
            }}
          >
            <ProfileStats
              streak={stats?.current_streak}
              bestStreak={stats?.longest_streak}
              walletBalance={walletBalance}
              lessonsDone={completedUnitsCount || totalLessonsCompleted}
            />
          </ProfileIdentityCard>
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-6 items-start">
          <motion.div variants={itemVariants} className="lg:col-span-3 min-w-0">
            <LevelBenefitsPanel
              lifetimeCoins={lifetimeCoins}
              walletBalance={walletBalance}
              shieldActive={!!stats?.streak_shield_active}
              activatingShield={activatingShield}
              onActivateShield={handleActivateShield}
              onDownloadPlaybook={() =>
                downloadMoneyPlaybook({
                  user,
                  profile,
                  stats: applyBasePathProgress(stats, progress, moves),
                  chapters,
                  goals,
                  walletBalance,
                  lifetimeCoins,
                })
              }
            />
          </motion.div>

          <div className="lg:col-span-2 min-w-0 space-y-6">
            <motion.div variants={itemVariants}>
              <ProfileAchievements badges={badges} earnedBadgeIds={earnedBadgeIds} trophies={trophies} />
            </motion.div>
            <motion.div variants={itemVariants}>
              <FamilySection profile={profile} user={user} />
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}