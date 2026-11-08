import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle, Coins, X } from 'lucide-react';
import AmbientBackdrop from '@/components/dashboard/AmbientBackdrop';
import { CHAPTERS } from '@/lib/curriculum';

export default function LessonView() {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const [module, setModule] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [user, setUser] = useState(null);
  const [progress, setProgress] = useState([]);
  const [showCompletion, setShowCompletion] = useState(false);
  const [xpEarned, setXpEarned] = useState(0);
  const [loading, setLoading] = useState(true);
  const [allModules, setAllModules] = useState([]);

  useEffect(() => {
    const init = async () => {
      const u = await base44.auth.me();
      setUser(u);
      const [modulesRes, prog] = await Promise.all([
        base44.functions.invoke('getPayloadLessons', {}),
        base44.entities.UserProgress.filter({ user_id: u.id }),
      ]);
      const mods = modulesRes?.data?.modules || [];
      setAllModules(mods);
      const mod = mods.find(m => m.id === moduleId);
      setModule(mod || null);
      setLessons(mod?.lessons || []);
      setProgress(prog);
      setLoading(false);
    };
    init().catch(() => setLoading(false));
  }, [moduleId]);

  useEffect(() => {
    // For PayloadCMS question content, options come from the correct_answer field
    setSelectedAnswer(null);
    setAnswered(false);
  }, [currentIndex, lessons]);

  const currentLesson = lessons[currentIndex];
  const isCompleted = (lessonId) => progress.some(p => p.lesson_id === lessonId && p.completed);

  const handleComplete = async () => {
    if (!currentLesson || !user) return;

    const xp = currentLesson.xp_reward || 20;
    const alreadyCompleted = isCompleted(currentLesson.id);

    if (!alreadyCompleted) {
      setXpEarned(prev => prev + xp);

      // Record progress
      await base44.entities.UserProgress.create({
        user_id: user.id,
        lesson_id: currentLesson.id,
        module_id: moduleId,
        completed: true,
        xp_earned: xp,
        score: score,
        completed_at: new Date().toISOString(),
      });

      // Update local progress state so isCompleted reflects immediately
      setProgress(prev => [...prev, { lesson_id: currentLesson.id, module_id: moduleId, completed: true }]);

      // Credit Supabase wallet
      await base44.functions.invoke('creditWallet', { amount: xp }).catch(() => {});

      // Update UserStats
      const statsArr = await base44.entities.UserStats.filter({ user_id: user.id });
      if (statsArr.length > 0) {
        const s = statsArr[0];
        const today = new Date().toISOString().slice(0, 10);
        const lastActivity = s.last_activity_date;
        const daysDiff = lastActivity
          ? (new Date(today) - new Date(lastActivity)) / 86400000
          : null;
        // Only extend streak if last activity was exactly yesterday (not today, not 2+ days ago)
        const newStreak = daysDiff === 1 ? (s.current_streak + 1) : daysDiff === 0 ? s.current_streak : 1;
        const newXp = (s.total_xp || 0) + xp;
        const newLevel = Math.floor(newXp / 200) + 1;
        await base44.entities.UserStats.update(s.id, {
          total_xp: newXp,
          current_level: newLevel,
          current_streak: newStreak,
          longest_streak: Math.max(s.longest_streak || 0, newStreak),
          last_activity_date: today,
        });
      }
    }

    if (currentIndex < lessons.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setShowCompletion(true);
    }
  };

  const handleAnswer = (answer) => {
    if (answered) return;
    setSelectedAnswer(answer);
    setAnswered(true);
    if (currentLesson && answer === currentLesson.correct_answer) {
      setScore(s => s + 1);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="w-8 h-8 border-4 border-white/10 border-t-[#2EA0FD] rounded-full animate-spin" />
      </div>
    );
  }

  if (showCompletion) {
    const chapter = CHAPTERS.find(c => c.units.map(String).includes(moduleId));
    const chapterLearned = chapter && chapter.units
      .map(id => allModules.find(m => m.id === String(id)))
      .filter(Boolean)
      .every(m => m.lessons.every(l => isCompleted(l.id)));
    return (
      <div className="relative min-h-screen bg-black flex items-center justify-center p-6 overflow-hidden">
        <AmbientBackdrop />
        <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ type: 'spring', stiffness: 260, damping: 22 }} className="relative z-10 max-w-sm w-full text-center">
          <div className="w-24 h-24 rounded-full bg-[#2EFD7A]/15 border-4 border-[#2EFD7A] flex items-center justify-center mx-auto mb-6 shadow-[0_0_40px_rgba(46,253,122,0.35)]">
            <CheckCircle className="w-12 h-12 text-[#2EFD7A]" />
          </div>
          <h2 className="text-3xl font-display font-extrabold mb-2 text-white">{chapterLearned ? 'Chapter Complete!' : 'Lesson Complete!'}</h2>
          <p className="text-white/60 mb-6">You've finished <strong className="text-white">{module?.title}</strong></p>
          <div className="bg-white/[0.03] border border-white/10 backdrop-blur-sm rounded-2xl p-6 mb-6 shadow-[0_0_40px_-10px_rgba(46,160,253,0.3)]">
            <div className="flex items-center justify-center gap-2 text-3xl font-display font-extrabold text-[#2EA0FD]">
              <Coins className="w-8 h-8" />
              +{xpEarned} Base Coins
            </div>
            <p className="text-sm text-white/60 mt-1">added to your profile</p>
          </div>
          {chapterLearned && chapter.move && (
            <div className="text-left bg-[#2EFD7A]/[0.06] border border-[#2EFD7A]/30 rounded-2xl p-5 mb-6">
              <p className="text-[11px] tracking-widest uppercase font-semibold text-[#2EFD7A] mb-1">Money move unlocked</p>
              <p className="text-white font-semibold">{chapter.move.title}</p>
              <p className="text-white/60 text-sm mt-1">{chapter.move.detail}</p>
            </div>
          )}
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full py-4 bg-[#2EFD7A] text-black rounded-2xl font-bold text-lg hover:bg-[#2EFD7A]/90 hover:scale-[1.02] active:scale-95 transition-all duration-200"
          >
            Back to Learning Path
          </button>
        </motion.div>
      </div>
    );
  }

  if (!currentLesson) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <p className="text-white/60">No lessons found in this module.</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-black flex flex-col overflow-hidden">
      <AmbientBackdrop />
      {/* Header */}
      <div className="sticky top-0 bg-black/60 backdrop-blur-xl border-b border-white/10 px-4 py-3 flex items-center gap-4 z-10">
        <button onClick={() => navigate('/dashboard')} className="text-white/50 hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#2EFD7A] to-[#2EA0FD] shadow-[0_0_8px_rgba(46,160,253,0.6)] rounded-full transition-all duration-500"
              style={{ width: `${((currentIndex + 1) / lessons.length) * 100}%` }}
            />
          </div>
        </div>
        <span className="text-sm text-white/60 font-medium">{currentIndex + 1}/{lessons.length}</span>
      </div>

      {/* Content */}
      <motion.div key={currentIndex} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 260, damping: 24 }} className="relative z-10 flex-1 max-w-2xl mx-auto w-full px-4 py-8 text-white">
        <div className="mb-6">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#2EA0FD]">{module?.title}</span>
          <div className="flex items-center gap-3 mt-1">
            <h2 className="text-2xl font-display font-bold text-white">{currentLesson.title}</h2>
            {isCompleted(currentLesson.id) && (
              <span className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-[#2EFD7A]/15 text-[#2EFD7A] border border-[#2EFD7A]/30 shrink-0">
                <CheckCircle className="w-3 h-3" /> Completed
              </span>
            )}
          </div>
        </div>

        {/* text_card */}
        {currentLesson.content_type === 'text_card' && (
          <div className="bg-white/[0.03] border border-white/10 backdrop-blur-sm text-white rounded-2xl p-6 mb-6">
            <div
              className="prose prose-invert max-w-none text-base leading-relaxed"
              dangerouslySetInnerHTML={{ __html: currentLesson.text_content || '<p>No content yet.</p>' }}
            />
          </div>
        )}

        {/* key_takeaway */}
        {currentLesson.content_type === 'key_takeaway' && (
          <div className="bg-gradient-to-br from-[#2EA0FD]/20 to-[#2EFD7A]/5 border border-[#2EA0FD]/30 shadow-[0_0_40px_-10px_rgba(46,160,253,0.35)] rounded-3xl p-8 mb-6 min-h-48 flex items-center justify-center text-center">
            <div>
              <p className="text-4xl mb-4">
                {currentLesson.takeaway_icon === 'lightbulb' ? '💡'
                  : currentLesson.takeaway_icon === 'star' ? '⭐'
                  : currentLesson.takeaway_icon === 'fire' ? '🔥'
                  : currentLesson.takeaway_icon === 'rocket' ? '🚀'
                  : '💡'}
              </p>
              <div
                className="prose prose-invert max-w-none text-lg font-heading font-semibold leading-relaxed"
                dangerouslySetInnerHTML={{ __html: currentLesson.takeaway_text || '<p>Key takeaway here.</p>' }}
              />
            </div>
          </div>
        )}

        {/* question */}
        {currentLesson.content_type === 'question' && (
          <div className="mb-6">
            <div className="bg-white/[0.03] border border-white/10 backdrop-blur-sm text-white rounded-2xl p-6 mb-4">
              <div
                className="prose prose-invert max-w-none text-lg font-heading font-semibold"
                dangerouslySetInnerHTML={{ __html: currentLesson.question_prompt || '' }}
              />
            </div>
            {currentLesson.question_type === 'true_false' ? (
              <div className="grid grid-cols-2 gap-3">
                {['True', 'False'].map((opt) => {
                  let buttonClass = 'border-white/10 bg-white/[0.03] text-white hover:border-[#2EA0FD]/60 hover:bg-white/[0.06]';
                  if (answered) {
                    if (opt === currentLesson.correct_answer) buttonClass = 'border-[#2EFD7A] bg-[#2EFD7A]/15 text-[#2EFD7A]';
                    else if (opt === selectedAnswer) buttonClass = 'border-red-400 bg-red-400/15 text-red-400';
                    else buttonClass = 'border-white/10 bg-white/[0.03] text-white opacity-40';
                  } else if (selectedAnswer === opt) {
                    buttonClass = 'border-[#2EA0FD] bg-[#2EA0FD]/15 text-white';
                  }
                  return (
                    <button key={opt} onClick={() => handleAnswer(opt)}
                      className={`p-4 rounded-xl border transition-all duration-200 font-medium text-center ${buttonClass}`}>
                      {opt}
                    </button>
                  );
                })}
              </div>
            ) : (
              /* multiple_choice — treat correct_answer as one of the options; generate plausible distractors from explanation */
              <div className="space-y-3">
                {(() => {
                  const correct = currentLesson.correct_answer || '';
                  // Build options: correct answer + "False" / "I don't know" as distractors for single-answer questions
                  const opts = correct ? [correct, 'I\'m not sure', 'None of the above'] : [];
                  return opts.map((opt) => {
                    let buttonClass = 'border-white/10 bg-white/[0.03] text-white hover:border-[#2EA0FD]/60 hover:bg-white/[0.06]';
                    if (answered) {
                      if (opt === correct) buttonClass = 'border-[#2EFD7A] bg-[#2EFD7A]/15 text-[#2EFD7A]';
                      else if (opt === selectedAnswer) buttonClass = 'border-red-400 bg-red-400/15 text-red-400';
                      else buttonClass = 'border-white/10 bg-white/[0.03] text-white opacity-40';
                    } else if (selectedAnswer === opt) {
                      buttonClass = 'border-[#2EA0FD] bg-[#2EA0FD]/15 text-white';
                    }
                    return (
                      <button key={opt} onClick={() => handleAnswer(opt)}
                        className={`w-full text-left p-4 rounded-xl border transition-all duration-200 font-medium ${buttonClass}`}>
                        {opt}
                      </button>
                    );
                  });
                })()}
              </div>
            )}
            {answered && (
              <div className={`mt-4 p-4 rounded-xl border text-sm ${selectedAnswer === currentLesson.correct_answer ? 'border-[#2EFD7A]/30 bg-[#2EFD7A]/10 text-[#2EFD7A]' : 'border-red-400/30 bg-red-400/10 text-red-400'}`}>
                <strong>{selectedAnswer === currentLesson.correct_answer ? '✓ Correct! ' : '✗ Not quite. '}</strong>
                {selectedAnswer !== currentLesson.correct_answer && (
                  <span>The correct answer is: <strong>{currentLesson.correct_answer}</strong>. </span>
                )}
                <span dangerouslySetInnerHTML={{ __html: currentLesson.explanation || '' }} />
              </div>
            )}
          </div>
        )}

        {/* Fallback for unmapped content types */}
        {!['text_card', 'key_takeaway', 'question'].includes(currentLesson.content_type) && (
          <div className="bg-white/[0.03] border border-white/10 backdrop-blur-sm text-white rounded-2xl p-6 mb-6">
            <div
              className="prose prose-invert max-w-none text-base leading-relaxed"
              dangerouslySetInnerHTML={{ __html: currentLesson.text_content || currentLesson.takeaway_text || 'No content yet.' }}
            />
          </div>
        )}

        {/* Action */}
        <button
          onClick={handleComplete}
          disabled={currentLesson.content_type === 'question' && !answered}
          className="w-full py-4 bg-[#2EFD7A] text-black rounded-2xl font-bold text-lg hover:bg-[#2EFD7A]/90 hover:scale-[1.01] active:scale-[0.98] shadow-[0_0_24px_rgba(46,253,122,0.3)] transition-all duration-200 disabled:opacity-40 disabled:shadow-none flex items-center justify-center gap-2 group"
        >
          {isCompleted(currentLesson.id)
            ? (currentIndex < lessons.length - 1 ? 'Next' : 'Finish Review')
            : (currentIndex < lessons.length - 1 ? currentLesson.text_cta || 'Continue' : 'Complete Lesson')}
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
      </motion.div>
    </div>
  );
}