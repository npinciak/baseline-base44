import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Target, ChevronRight, ChevronLeft, Plus } from 'lucide-react';
import LinkedAccountsWidget from '@/components/LinkedAccountsWidget';
import WindingLearningPath from '@/components/WindingLearningPath';
import GoalCard from '@/components/dashboard/GoalCard';
import GoalsSummaryWidget from '@/components/dashboard/GoalsSummaryWidget';
import CreateGoalModal from '@/components/dashboard/CreateGoalModal';
import StatsBar from '@/components/dashboard/StatsBar';
import HabitPanel from '@/components/dashboard/HabitPanel';
import AmbientBackdrop from '@/components/dashboard/AmbientBackdrop';
import useLearningState from '@/hooks/useLearningState';
import { orderedModules } from '@/lib/curriculum';

const containerVariants = { hidden: {}, show: { transition: { staggerChildren: 0.12 } } };
const itemVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.98 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 260, damping: 22 } },
};

const EMPTY_FORM = { name: '', description: '', target_amount: '', saved_amount: '', target_date: '', image_url: '' };

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const learning = useLearningState();
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [goalForm, setGoalForm] = useState(EMPTY_FORM);
  const [savingGoal, setSavingGoal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const init = async () => {
      const u = await base44.auth.me();
      setUser(u);
      const profileRes = await base44.functions.invoke('getUserProfile', {}).catch(() => null);
      setProfile(profileRes?.data?.profile || null);
      const [statsArr, goalsRes] = await Promise.all([
        base44.entities.UserStats.filter({ user_id: u.id }),
        base44.functions.invoke('getSupabaseGoals', {}).catch(() => ({ data: { goals: [] } })),
      ]);
      if (statsArr.length === 0) { navigate('/onboarding'); return; }
      setStats(statsArr[0]);
      setGoals(goalsRes?.data?.goals || []);
      setLoading(false);
    };
    init().catch(() => setLoading(false));
  }, []);

  const activeGoals = goals.filter(g => (g.current_amount || 0) < g.target_amount);

  const prevGoal = () => setCarouselIndex(i => Math.max(0, i - 1));
  const nextGoal = () => setCarouselIndex(i => Math.min(activeGoals.length - 1, i + 1));

  const handleCreateGoal = async () => {
    if (!goalForm.name || !goalForm.target_amount) return;
    setSavingGoal(true);
    await base44.functions.invoke('createSupabaseGoal', {
      name: goalForm.name,
      target_amount: parseFloat(goalForm.target_amount),
      current_amount: parseFloat(goalForm.saved_amount) || 0,
      target_date: goalForm.target_date || null,
      image: goalForm.image_url || null,
      currency_code: 'USD',
    });
    const updated = await base44.functions.invoke('getSupabaseGoals', {}).catch(() => ({ data: { goals: [] } }));
    setGoals(updated?.data?.goals || []);
    setCarouselIndex(0);
    setShowGoalModal(false);
    setGoalForm(EMPTY_FORM);
    setSavingGoal(false);
  };

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
      <AmbientBackdrop />
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="relative z-10 max-w-5xl mx-auto"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="mb-8">
          <h1 className="text-3xl md:text-4xl font-light tracking-tight text-white mb-2">
            {greeting()}, <span className="font-extrabold">{profile?.first_name || user?.full_name?.split(' ')[0] || 'there'}</span>
          </h1>
          <p className="text-white/60 text-sm">Two small habits, done consistently, change your financial future.</p>
        </motion.div>

        <motion.div variants={itemVariants} className="mb-10">
          <HabitPanel modules={orderedModules(learning.chapters)} progress={learning.progress} goals={goals} />
        </motion.div>

        {stats && (
          <motion.div variants={itemVariants}>
            <StatsBar stats={stats} />
          </motion.div>
        )}

        <div className="grid md:grid-cols-5 gap-8">
          {/* Main column */}
          <div className="md:col-span-4 space-y-10">

            {/* Goals Carousel */}
            <motion.section variants={itemVariants}>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-white/60 text-xs font-light tracking-widest uppercase">My Goals</h2>
                <Link to="/goals" className="text-xs text-[#2EFD7A] font-medium hover:opacity-80 transition-opacity flex items-center gap-1">
                  View all <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {activeGoals.length === 0 ? (
                <button
                  onClick={() => setShowGoalModal(true)}
                  className="w-full flex flex-col items-center justify-center bg-white/[0.03] border border-dashed border-white/15 rounded-2xl p-10 hover:border-[#2EA0FD]/40 transition-all group"
                >
                  <div className="w-12 h-12 bg-white/[0.05] rounded-xl flex items-center justify-center mb-3 group-hover:bg-[#2EA0FD]/15 transition-all">
                    <Target className="w-6 h-6 text-white/50 group-hover:text-[#2EA0FD] transition-all" />
                  </div>
                  <p className="text-sm text-white mb-1">No active goals</p>
                  <p className="text-xs text-white/60 mb-4">Start saving towards something meaningful</p>
                  <span className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#2EFD7A] text-black rounded-full text-sm font-semibold hover:bg-[#2EFD7A]/90 transition-all">
                    <Plus className="w-4 h-4" /> Create a Goal
                  </span>
                </button>
              ) : (
                <div className="relative">
                  <div className="overflow-hidden rounded-2xl">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={activeGoals[carouselIndex]?.id || carouselIndex}
                        initial={{ opacity: 0, x: 40, scale: 0.97 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: -40, scale: 0.97 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 26 }}
                      >
                        <GoalCard goal={activeGoals[carouselIndex]} onClick={() => navigate(`/goals/${activeGoals[carouselIndex].id}`)} />
                      </motion.div>
                    </AnimatePresence>
                  </div>

                  {activeGoals.length > 1 && (
                    <div className="flex items-center justify-between mt-4">
                      <motion.button
                        whileTap={{ scale: 0.85 }}
                        onClick={prevGoal}
                        disabled={carouselIndex === 0}
                        className="p-1.5 rounded-lg bg-white/[0.05] text-white/60 hover:text-[#2EA0FD] hover:shadow-[0_0_12px_rgba(46,160,253,0.4)] disabled:opacity-30 transition-all"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </motion.button>
                      <div className="flex gap-1.5">
                        {activeGoals.map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setCarouselIndex(i)}
                            className={`h-2 rounded-full transition-all ${i === carouselIndex ? 'bg-gradient-to-r from-[#2EFD7A] to-[#2EA0FD] w-4' : 'bg-white/15 w-2'}`}
                          />
                        ))}
                      </div>
                      <motion.button
                        whileTap={{ scale: 0.85 }}
                        onClick={nextGoal}
                        disabled={carouselIndex === activeGoals.length - 1}
                        className="p-1.5 rounded-lg bg-white/[0.05] text-white/60 hover:text-[#2EA0FD] hover:shadow-[0_0_12px_rgba(46,160,253,0.4)] disabled:opacity-30 transition-all"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </motion.button>
                    </div>
                  )}
                </div>
              )}
            </motion.section>

            {/* Full Learning Path */}
            <motion.section variants={itemVariants}>
              <div className="mb-5">
                <h2 className="text-white/60 text-xs font-light tracking-widest uppercase mb-1">Learning Path</h2>
                <p className="text-white text-lg font-light">Master personal finance <span className="font-extrabold">one lesson at a time</span></p>
              </div>
              <WindingLearningPath chapters={learning.chapters} onCompleteMove={learning.completeMove} />
            </motion.section>
          </div>

          {/* Sidebar widgets */}
          <motion.div variants={itemVariants} className="md:col-span-1 space-y-5">
            {goals.length > 0 && <GoalsSummaryWidget goals={goals} />}
            <LinkedAccountsWidget />
          </motion.div>
        </div>
      </motion.div>

      {showGoalModal && (
        <CreateGoalModal
          form={goalForm}
          setForm={setGoalForm}
          onClose={() => setShowGoalModal(false)}
          onSubmit={handleCreateGoal}
          saving={savingGoal}
        />
      )}
    </div>
  );
}