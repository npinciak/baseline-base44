import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, ArrowRight, CheckCircle, Coins, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function LessonView() {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const [module, setModule] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [user, setUser] = useState(null);
  const [progress, setProgress] = useState([]);
  const [showCompletion, setShowCompletion] = useState(false);
  const [xpEarned, setXpEarned] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const u = await base44.auth.me();
      setUser(u);
      const [mod, lsns, prog] = await Promise.all([
        base44.entities.Module.filter({ id: moduleId }),
        base44.entities.Lesson.filter({ module_id: moduleId, is_published: true }, 'order_index', 50),
        base44.entities.UserProgress.filter({ user_id: u.id, module_id: moduleId }),
      ]);
      setModule(mod[0]);
      setLessons(lsns);
      setProgress(prog);
      setLoading(false);
    };
    init().catch(() => setLoading(false));
  }, [moduleId]);

  useEffect(() => {
    if (!lessons[currentIndex]) return;
    const lesson = lessons[currentIndex];
    if (lesson.lesson_type === 'quiz') {
      base44.entities.QuizQuestion.filter({ lesson_id: lesson.id }, 'order_index', 20).then(setQuestions);
    } else {
      setQuestions([]);
    }
    setSelectedAnswer(null);
    setAnswered(false);
  }, [currentIndex, lessons]);

  const currentLesson = lessons[currentIndex];
  const isCompleted = (lessonId) => progress.some(p => p.lesson_id === lessonId && p.completed);

  const handleComplete = async () => {
    if (!currentLesson || !user) return;

    const xp = currentLesson.xp_reward || 20;
    setXpEarned(xp);

    // Record progress
    const existing = progress.find(p => p.lesson_id === currentLesson.id);
    if (!existing) {
      await base44.entities.UserProgress.create({
        user_id: user.id,
        lesson_id: currentLesson.id,
        module_id: moduleId,
        completed: true,
        xp_earned: xp,
        score: score,
        completed_at: new Date().toISOString(),
      });
    }

    // Credit Supabase wallet
    await base44.functions.invoke('creditWallet', { amount: xp }).catch(() => {});

    // Update UserStats
    const statsArr = await base44.entities.UserStats.filter({ user_id: user.id });
    if (statsArr.length > 0) {
      const s = statsArr[0];
      const today = new Date().toISOString().slice(0, 10);
      const lastActivity = s.last_activity_date;
      const isConsecutive = lastActivity && (
        new Date(today) - new Date(lastActivity) <= 86400000
      );
      const newStreak = isConsecutive ? (s.current_streak + 1) : 1;
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

    if (currentIndex < lessons.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setShowCompletion(true);
    }
  };

  const handleAnswer = (idx) => {
    if (answered) return;
    setSelectedAnswer(idx);
    setAnswered(true);
    if (questions[0] && idx === questions[0].correct_index) {
      setScore(s => s + 1);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (showCompletion) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="max-w-sm w-full text-center">
          <div className="w-24 h-24 rounded-full bg-primary/20 border-4 border-primary flex items-center justify-center mx-auto mb-6 glow-teal">
            <CheckCircle className="w-12 h-12 text-primary" />
          </div>
          <h2 className="text-3xl font-display font-extrabold mb-2">Module Complete!</h2>
          <p className="text-muted-foreground mb-6">You've finished <strong className="text-foreground">{module?.title}</strong></p>
          <div className="bg-card border border-primary/20 rounded-2xl p-6 mb-6 glow-teal">
            <div className="flex items-center justify-center gap-2 text-3xl font-display font-extrabold text-primary">
              <Coins className="w-8 h-8" />
              +{xpEarned} Base Coins
            </div>
            <p className="text-sm text-muted-foreground mt-1">added to your profile</p>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-bold text-lg hover:bg-primary/90 transition-all duration-200"
          >
            Back to Learning Path
          </button>
        </div>
      </div>
    );
  }

  if (!currentLesson) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">No lessons found in this module.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="sticky top-0 bg-background/90 backdrop-blur-md border-b border-border px-4 py-3 flex items-center gap-4 z-10">
        <button onClick={() => navigate('/learn')} className="text-muted-foreground hover:text-foreground transition-colors">
          <X className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${((currentIndex + 1) / lessons.length) * 100}%` }}
            />
          </div>
        </div>
        <span className="text-sm text-muted-foreground font-medium">{currentIndex + 1}/{lessons.length}</span>
      </div>

      {/* Content */}
      <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">
        <div className="mb-6">
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">{module?.title}</span>
          <h2 className="text-2xl font-display font-bold mt-1">{currentLesson.title}</h2>
        </div>

        {/* Text lesson */}
        {currentLesson.lesson_type === 'text' && (
          <div className="bg-card border border-border rounded-2xl p-6 mb-6 prose prose-invert max-w-none">
            <ReactMarkdown>{currentLesson.content || 'No content yet.'}</ReactMarkdown>
          </div>
        )}

        {/* Flashcard lesson */}
        {currentLesson.lesson_type === 'flashcard' && (
          <div className="bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 rounded-3xl p-8 mb-6 min-h-48 flex items-center justify-center text-center">
            <div>
              <p className="text-lg font-heading font-semibold leading-relaxed">
                {currentLesson.content || 'Flashcard content here.'}
              </p>
            </div>
          </div>
        )}

        {/* Quiz lesson */}
        {currentLesson.lesson_type === 'quiz' && questions.length > 0 && (
          <div className="mb-6">
            <div className="bg-card border border-border rounded-2xl p-6 mb-4">
              <p className="text-lg font-heading font-semibold">{questions[0].question}</p>
            </div>
            <div className="space-y-3">
              {questions[0].options.map((opt, idx) => {
                let buttonClass = 'border-border bg-card hover:border-primary/40';
                if (answered) {
                  if (idx === questions[0].correct_index) buttonClass = 'border-primary bg-primary/15 text-primary';
                  else if (idx === selectedAnswer) buttonClass = 'border-destructive bg-destructive/15 text-destructive';
                  else buttonClass = 'border-border bg-card opacity-50';
                } else if (selectedAnswer === idx) {
                  buttonClass = 'border-primary bg-primary/15';
                }
                return (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(idx)}
                    className={`w-full text-left p-4 rounded-xl border transition-all duration-200 font-medium ${buttonClass}`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
            {answered && questions[0].explanation && (
              <div className={`mt-4 p-4 rounded-xl border text-sm ${selectedAnswer === questions[0].correct_index ? 'border-primary/30 bg-primary/10 text-primary' : 'border-destructive/30 bg-destructive/10 text-destructive'}`}>
                <strong>{selectedAnswer === questions[0].correct_index ? '✓ Correct! ' : '✗ Not quite. '}</strong>
                {questions[0].explanation}
              </div>
            )}
          </div>
        )}

        {/* Action */}
        <button
          onClick={handleComplete}
          disabled={currentLesson.lesson_type === 'quiz' && questions.length > 0 && !answered}
          className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-bold text-lg hover:bg-primary/90 transition-all duration-200 disabled:opacity-40 flex items-center justify-center gap-2 group glow-teal"
        >
          {currentIndex < lessons.length - 1 ? 'Continue' : 'Complete Module'}
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}