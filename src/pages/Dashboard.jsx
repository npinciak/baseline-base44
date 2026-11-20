import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import WindingLearningPath from '@/components/WindingLearningPath';
import AmbientBackdrop from '@/components/dashboard/AmbientBackdrop';
import DashboardWelcomeHero from '@/components/dashboard/DashboardWelcomeHero';
import useLearningState from '@/hooks/useLearningState';
import useAdminViewMode from '@/hooks/useAdminViewMode';
import { getGreetingName } from '@/lib/displayName';

const containerVariants = { hidden: {}, show: { transition: { staggerChildren: 0.12 } } };
const itemVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.98 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 260, damping: 22 } },
};

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const learning = useLearningState();
  const { effectiveIsAdmin } = useAdminViewMode(user);
  const navigate = useNavigate();

  useEffect(() => {
    const init = async () => {
      const u = await base44.auth.me();
      setUser(u);
      const [profileRes, statsArr] = await Promise.all([
        base44.functions.invoke('getUserProfile', {}).catch(() => null),
        base44.entities.UserStats.filter({ user_id: u.id }),
      ]);
      setProfile(profileRes?.data?.profile || null);
      if (statsArr.length === 0) { navigate('/onboarding'); return; }
      setStats(statsArr[0]);
      setLoading(false);
    };
    init().catch(() => setLoading(false));
  }, []);

  if (loading || learning.loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="w-8 h-8 border-4 border-white/10 border-t-[#2EFD7A] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-black px-6 md:px-10 py-10 overflow-hidden">
      <AmbientBackdrop dotsOnly />
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="relative z-10 max-w-5xl mx-auto"
      >
        <motion.div variants={itemVariants}>
          <DashboardWelcomeHero
            name={getGreetingName(user, profile)}
            stats={stats}
            chapters={learning.chapters}
            onCompleteMove={learning.completeMove}
          />
        </motion.div>

        <motion.section variants={itemVariants}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white/60 text-xs font-semibold tracking-widest uppercase">Your BasePath</h2>
            <span className="text-xs text-white/45">
              {learning.chapters.filter((c) => c.learned).length} of {learning.chapters.length} chapters mastered
            </span>
          </div>
          <WindingLearningPath
            chapters={learning.chapters}
            onCompleteMove={learning.completeMove}
            isAdmin={effectiveIsAdmin}
          />
        </motion.section>
      </motion.div>
    </div>
  );
}