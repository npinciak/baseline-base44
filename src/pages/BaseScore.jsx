import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import BaseScoreSection from '@/components/profile/BaseScoreSection';
import useBaseScore from '@/hooks/useBaseScore';
import useLearningState from '@/hooks/useLearningState';
import { nextLesson } from '@/lib/curriculum';

export default function BaseScore() {
  const { loading, stats } = useBaseScore();
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
    <div className="min-h-screen bg-black px-6 py-10 md:px-10">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 260, damping: 22 }}
        className="min-w-0 max-w-lg mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl font-light tracking-tight text-white mb-3">Your <span className="font-extrabold">BaseScore™</span></h1>
          <p className="text-white/60 text-sm leading-relaxed">Understand your whole financial picture. Tap any of the five parts to start improving it.</p>
        </div>
        <BaseScoreSection stats={stats} stacked knowledgeHref={next ? `/lesson/${next.id}` : '/dashboard'}
          cta={{ to: next ? `/lesson/${next.id}` : '/dashboard', label: 'Improve My Score' }} />
        {stats?.base_score != null && <Link to="/basescore-quiz" className="block text-center text-sm text-white/60 hover:text-white transition-colors">Retake the assessment</Link>}
      </motion.div>
    </div>
  );
}