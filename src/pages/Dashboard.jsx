import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Target, ChevronRight, ChevronLeft, Plus } from 'lucide-react';
import LinkedAccountsWidget from '@/components/LinkedAccountsWidget';
import WindingLearningPath from '@/components/WindingLearningPath';
import GoalCard from '@/components/dashboard/GoalCard';
import GoalsSummaryWidget from '@/components/dashboard/GoalsSummaryWidget';
import CreateGoalModal from '@/components/dashboard/CreateGoalModal';

const EMPTY_FORM = { name: '', description: '', target_amount: '', saved_amount: '', target_date: '', image_url: '' };

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [goals, setGoals] = useState([]);
  const [modules, setModules] = useState([]);
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);
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
      const [statsArr, goalsRes, modulesRes, prog] = await Promise.all([
        base44.entities.UserStats.filter({ user_id: u.id }),
        base44.functions.invoke('getSupabaseGoals', {}).catch(() => ({ data: { goals: [] } })),
        base44.functions.invoke('getPayloadLessons', {}).catch(() => ({ data: { modules: [] } })),
        base44.entities.UserProgress.filter({ user_id: u.id }),
      ]);
      if (statsArr.length === 0) { navigate('/onboarding'); return; }
      setStats(statsArr[0]);
      setGoals(goalsRes?.data?.goals || []);
      setModules(modulesRes?.data?.modules || []);
      setProgress(prog);
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

  if (loading) {
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
    <div className="min-h-screen bg-black px-6 md:px-10 py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="max-w-5xl mx-auto"
      >
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-light tracking-tight text-white mb-2">
            {greeting()}, <span className="font-extrabold">{profile?.first_name || user?.full_name?.split(' ')[0] || 'there'}</span> 👋
          </h1>
          <p className="text-white/40 text-sm">Here's your financial progress at a glance.</p>
        </div>

        <div className="grid md:grid-cols-5 gap-8">
          {/* Main column */}
          <div className="md:col-span-4 space-y-10">

            {/* Goals Carousel */}
            <section>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-white/30 text-xs font-light tracking-widest uppercase">My Goals</h2>
                <Link to="/goals" className="text-xs text-[#2EFD7A] font-medium hover:opacity-80 transition-opacity flex items-center gap-1">
                  View all <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {activeGoals.length === 0 ? (
                <button
                  onClick={() => setShowGoalModal(true)}
                  className="w-full flex flex-col items-center justify-center bg-white/[0.03] border border-dashed border-white/15 rounded-2xl p-10 hover:border-[#2EFD7A]/40 transition-all group"
                >
                  <div className="w-12 h-12 bg-white/[0.05] rounded-xl flex items-center justify-center mb-3 group-hover:bg-[#2EFD7A]/15 transition-all">
                    <Target className="w-6 h-6 text-white/30 group-hover:text-[#2EFD7A] transition-all" />
                  </div>
                  <p className="text-sm text-white mb-1">No active goals</p>
                  <p className="text-xs text-white/30 mb-4">Start saving towards something meaningful</p>
                  <span className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#2EFD7A] text-black rounded-full text-sm font-semibold hover:bg-[#2EFD7A]/90 transition-all">
                    <Plus className="w-4 h-4" /> Create a Goal
                  </span>
                </button>
              ) : (
                <div className="relative">
                  <div className="overflow-hidden rounded-2xl">
                    {activeGoals.map((goal, i) => (
                      <div key={goal.id} className={`transition-all duration-300 ${i === carouselIndex ? 'block' : 'hidden'}`}>
                        <GoalCard goal={goal} onClick={() => navigate(`/goals/${goal.id}`)} />
                      </div>
                    ))}
                  </div>

                  {activeGoals.length > 1 && (
                    <div className="flex items-center justify-between mt-4">
                      <button
                        onClick={prevGoal}
                        disabled={carouselIndex === 0}
                        className="p-1.5 rounded-lg bg-white/[0.05] text-white/40 hover:text-white disabled:opacity-30 transition-all"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <div className="flex gap-1.5">
                        {activeGoals.map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setCarouselIndex(i)}
                            className={`h-2 rounded-full transition-all ${i === carouselIndex ? 'bg-[#2EFD7A] w-4' : 'bg-white/15 w-2'}`}
                          />
                        ))}
                      </div>
                      <button
                        onClick={nextGoal}
                        disabled={carouselIndex === activeGoals.length - 1}
                        className="p-1.5 rounded-lg bg-white/[0.05] text-white/40 hover:text-white disabled:opacity-30 transition-all"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </section>

            {/* Full Learning Path */}
            <section>
              <div className="mb-5">
                <h2 className="text-white/30 text-xs font-light tracking-widest uppercase mb-1">Learning Path</h2>
                <p className="text-white text-lg font-light">Master personal finance <span className="font-extrabold">one lesson at a time</span></p>
              </div>
              <WindingLearningPath modules={modules} progress={progress} />
            </section>
          </div>

          {/* Sidebar widgets */}
          <div className="md:col-span-1 space-y-5">
            {goals.length > 0 && <GoalsSummaryWidget goals={goals} />}
            <LinkedAccountsWidget />
          </div>
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