import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import WindingLearningPath from '@/components/WindingLearningPath';
import AmbientBackdrop from '@/components/dashboard/AmbientBackdrop';
import useLearningState from '@/hooks/useLearningState';
import { getGreetingName } from '@/lib/displayName';

const containerVariants = { hidden: {}, show: { transition: { staggerChildren: 0.12 } } };
const itemVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.98 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 260, damping: 22 } },
};

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const learning = useLearningState();
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

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="relative min-h-screen bg-black px-6 md:px-10 py-10 overflow-hidden">
      <AmbientBackdrop dotsOnly />
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="relative z-10 max-w-5xl mx-auto"
      >
        <motion.div variants={itemVariants} className="mb-8">
          <h1 className="text-3xl md:text-4xl font-light tracking-tight text-white mb-2">
            {greeting()}, <span className="font-extrabold">{getGreetingName(user, profile)}</span>
          </h1>
        </motion.div>

        <motion.section variants={itemVariants}>
          <div className="mb-5">
            <h2 className="text-white/60 text-xs font-light tracking-widest uppercase mb-1">BasePath</h2>
          </div>
          <WindingLearningPath chapters={learning.chapters} onCompleteMove={learning.completeMove} />
        </motion.section>
      </motion.div>
    </div>
  );
}