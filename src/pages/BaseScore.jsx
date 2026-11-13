import { motion } from 'framer-motion';
import AmbientBackdrop from '@/components/dashboard/AmbientBackdrop';
import BaseScoreSection from '@/components/profile/BaseScoreSection';
import useUserStats from '@/hooks/useUserStats';
import useLearningState from '@/hooks/useLearningState';
import { nextLesson } from '@/lib/curriculum';

export default function BaseScore() {
  const { loading, stats } = useUserStats();
  const learning = useLearningState();

  if (loading || learning.loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="w-8 h-8 border-4 border-white/10 border-t-[#2EFD7A] rounded-full animate-spin" />
      </div>
    );
  }

  const next = nextLesson(learning.chapters);

  return (
    <div className="relative min-h-screen bg-black px-4 py-8 overflow-hidden">
      <AmbientBackdrop />
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 260, damping: 22 }}
        className="relative z-10 max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-white mb-1">BaseScore™</h1>
          <p className="text-white/60">Your whole financial picture in five parts. Tap any part to start improving it.</p>
        </div>
        <BaseScoreSection stats={stats} knowledgeHref={next ? `/lesson/${next.id}` : '/dashboard'}
          cta={{ to: '/basescore-quiz', label: 'Retake the assessment' }} />
      </motion.div>
    </div>
  );
}