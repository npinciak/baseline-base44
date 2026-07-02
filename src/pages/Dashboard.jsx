import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import {
  Flame, Coins, Star, Target, ChevronRight, ChevronLeft,
  Plus, BookOpen, Lock, CheckCircle, X,
  Wallet, TrendingUp, CreditCard, FileText, Unlock, Umbrella, Shield, PiggyBank
} from 'lucide-react';

const EMPTY_FORM = { name: '', description: '', target_amount: '', saved_amount: '', target_date: '', image_url: '' };

const TOPIC_ICONS = {
  budgeting: Wallet, investing: TrendingUp, credit: CreditCard,
  taxes: FileText, saving: PiggyBank, debt: Unlock,
  insurance: Umbrella, retirement: Shield,
};

const TOPIC_COLORS = {
  budgeting: 'from-teal-500 to-emerald-500',
  investing: 'from-blue-500 to-indigo-500',
  credit: 'from-purple-500 to-violet-500',
  taxes: 'from-orange-500 to-amber-500',
  saving: 'from-green-500 to-teal-500',
  debt: 'from-red-500 to-rose-500',
  insurance: 'from-sky-500 to-blue-500',
  retirement: 'from-amber-500 to-yellow-500',
};

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
      const [statsArr, goalsRes, mods, prog] = await Promise.all([
        base44.entities.UserStats.filter({ user_id: u.id }),
        base44.functions.invoke('getSupabaseGoals', {}).catch(() => ({ data: { goals: [] } })),
        base44.entities.Module.filter({ is_published: true }, 'order_index', 50),
        base44.entities.UserProgress.filter({ user_id: u.id }),
      ]);
      if (statsArr.length === 0) { navigate('/onboarding'); return; }
      setStats(statsArr[0]);
      setGoals(goalsRes?.data?.goals || []);
      setModules(mods);
      setProgress(prog);
      setLoading(false);
    };
    init().catch(() => setLoading(false));
  }, []);

  const xpForLevel = (level) => level * 200;
  const xpProgress = stats ? ((stats.total_xp % xpForLevel(stats.current_level)) / xpForLevel(stats.current_level)) * 100 : 0;

  const getModuleCompletedCount = (moduleId) =>
    progress.filter(p => p.module_id === moduleId && p.completed).length;

  const isModuleUnlocked = (index) => {
    if (index === 0) return true;
    return getModuleCompletedCount(modules[index - 1]?.id) > 0;
  };

  const prevGoal = () => setCarouselIndex(i => Math.max(0, i - 1));
  const nextGoal = () => setCarouselIndex(i => Math.min(goals.length - 1, i + 1));

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
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin" />
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
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-display font-extrabold mb-1">
          {greeting()}, {profile?.first_name || user?.full_name?.split(' ')[0] || 'there'} 👋
        </h1>
        <p className="text-muted-foreground">Here's your financial progress at a glance.</p>
      </div>



      <div className="grid md:grid-cols-5 gap-6">
        {/* Main column */}
        <div className="md:col-span-4 space-y-6">

          {/* Goals Carousel */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-heading font-bold">My Goals</h2>
              <Link to="/goals" className="text-xs text-primary font-semibold hover:underline flex items-center gap-1">
                View all <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {goals.length === 0 ? (
              <button
                onClick={() => setShowGoalModal(true)}
                className="w-full flex flex-col items-center justify-center bg-card border border-dashed border-border rounded-2xl p-10 hover:border-primary/40 transition-all group"
              >
                <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center mb-3 group-hover:bg-primary/15 transition-all">
                  <Target className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-all" />
                </div>
                <p className="text-sm font-semibold mb-1">No goals yet</p>
                <p className="text-xs text-muted-foreground mb-3">Start saving towards something meaningful</p>
                <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-semibold">
                  <Plus className="w-4 h-4" /> Create a Goal
                </span>
              </button>
            ) : (
              <div className="relative">
                {/* Carousel card */}
                <div className="overflow-hidden rounded-2xl">
                  {goals.map((goal, i) => {
                    const saved = goal.current_amount || 0;
                    const pct = Math.min(100, Math.round((saved / goal.target_amount) * 100));
                    return (
                    <div
                    key={goal.id}
                    className={`transition-all duration-300 ${i === carouselIndex ? 'block' : 'hidden'}`}
                    >
                    <div className="bg-card border border-border rounded-2xl overflow-hidden">
                      {goal.image ? (
                        <div className="h-36 overflow-hidden">
                          <img src={goal.image} alt={goal.name} className="w-full h-full object-cover" />
                            </div>
                          ) : (
                            <div className="h-36 bg-secondary flex items-center justify-center">
                              <Target className="w-10 h-10 text-muted-foreground/30" />
                            </div>
                          )}
                          <div className="p-5">
                            <div className="flex items-center justify-between mb-1">
                              <h3 className="font-heading font-bold text-base">{goal.name}</h3>
                              {saved >= goal.target_amount && <CheckCircle className="w-5 h-5 text-primary" />}
                            </div>
                            <div className="flex items-end justify-between mb-3">
                              <div>
                                <p className="text-2xl font-display font-extrabold text-primary">${saved.toLocaleString()}</p>
                                <p className="text-xs text-muted-foreground">of ${goal.target_amount.toLocaleString()}</p>
                              </div>
                              <span className="text-sm font-bold">{pct}%</span>
                            </div>
                            <div className="h-2 bg-secondary rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${goal.is_completed ? 'xp-shimmer' : 'bg-primary'}`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Carousel controls */}
                {goals.length > 1 && (
                  <div className="flex items-center justify-between mt-3">
                    <button
                      onClick={prevGoal}
                      disabled={carouselIndex === 0}
                      className="p-1.5 rounded-lg bg-secondary text-muted-foreground hover:text-foreground disabled:opacity-30 transition-all"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <div className="flex gap-1.5">
                      {goals.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setCarouselIndex(i)}
                          className={`w-2 h-2 rounded-full transition-all ${i === carouselIndex ? 'bg-primary w-4' : 'bg-border'}`}
                        />
                      ))}
                    </div>
                    <button
                      onClick={nextGoal}
                      disabled={carouselIndex === goals.length - 1}
                      className="p-1.5 rounded-lg bg-secondary text-muted-foreground hover:text-foreground disabled:opacity-30 transition-all"
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
            <div className="mb-4">
              <h2 className="text-lg font-heading font-bold">Learning Path</h2>
              <p className="text-xs text-muted-foreground">Master personal finance one lesson at a time</p>
            </div>

            {modules.length === 0 ? (
              <div className="bg-card border border-border rounded-2xl p-8 text-center">
                <BookOpen className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No modules published yet — check back soon!</p>
              </div>
            ) : (
              <div className="relative">
                <div className="absolute left-8 top-8 bottom-8 w-0.5 bg-border" />
                <div className="space-y-4">
                  {modules.map((module, index) => {
                    const unlocked = isModuleUnlocked(index);
                    const completedCount = getModuleCompletedCount(module.id);
                    const colorClass = TOPIC_COLORS[module.topic_tag] || 'from-primary to-primary';
                    const TopicIcon = TOPIC_ICONS[module.topic_tag] || BookOpen;
                    return (
                      <div key={module.id} className="relative pl-20">
                        <div className={`absolute left-0 w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                          unlocked
                            ? `bg-gradient-to-br ${colorClass} shadow-lg ${completedCount > 0 ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''}`
                            : 'bg-secondary grayscale'
                        }`}>
                          {unlocked ? <TopicIcon className="w-7 h-7 text-white" /> : <Lock className="w-6 h-6 text-muted-foreground" />}
                          {completedCount > 0 && (
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                              <CheckCircle className="w-3 h-3 text-primary-foreground" />
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => unlocked && navigate(`/lesson/${module.id}`)}
                          disabled={!unlocked}
                          className={`w-full text-left bg-card border rounded-2xl p-5 transition-all duration-300 ${
                            unlocked
                              ? 'border-border hover:border-primary/40 hover:bg-card/80 cursor-pointer hover:-translate-y-0.5'
                              : 'border-border opacity-60 cursor-not-allowed'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                  module.difficulty === 'beginner' ? 'bg-primary/15 text-primary' :
                                  module.difficulty === 'intermediate' ? 'bg-amber-400/15 text-amber-400' :
                                  'bg-red-400/15 text-red-400'
                                }`}>{module.difficulty}</span>
                                <span className="text-xs text-muted-foreground capitalize">{module.topic_tag?.replace('_', ' ')}</span>
                              </div>
                              <h3 className="text-base font-heading font-semibold mb-1">{module.title}</h3>
                              {module.description && (
                                <p className="text-sm text-muted-foreground line-clamp-2">{module.description}</p>
                              )}
                              <div className="flex items-center gap-3 mt-3">
                                <span className="flex items-center gap-1 text-xs text-primary font-medium">
                                  <Coins className="w-3 h-3" /> {module.xp_reward} BC
                                </span>
                                {completedCount > 0 && (
                                  <span className="flex items-center gap-1 text-xs text-green-400 font-medium">
                                    <CheckCircle className="w-3 h-3" /> In progress
                                  </span>
                                )}
                              </div>
                            </div>
                            {unlocked && <ChevronRight className="w-5 h-5 text-muted-foreground mt-1" />}
                          </div>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </section>
        </div>

        {/* Sidebar widgets */}
        <div className="md:col-span-1 space-y-5">
          {/* Quick links */}
          <div className="bg-card border border-border rounded-2xl p-5">
            <h3 className="text-sm font-heading font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <Link to="/goals" className="flex items-center gap-3 p-3 rounded-xl hover:bg-secondary transition-all group">
                <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center">
                  <Target className="w-4 h-4 text-primary" />
                </div>
                <span className="text-sm font-medium">Add a Goal</span>
                <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto group-hover:translate-x-0.5 transition-transform" />
              </Link>

              <Link to="/dashboard" className="flex items-center gap-3 p-3 rounded-xl hover:bg-secondary transition-all group">
                <div className="w-8 h-8 rounded-lg bg-amber-500/15 flex items-center justify-center">
                  <BookOpen className="w-4 h-4 text-amber-400" />
                </div>
                <span className="text-sm font-medium">Continue Learning</span>
                <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Goals summary widget */}
          {goals.length > 0 && (
            <div className="bg-card border border-border rounded-2xl p-5">
              <h3 className="text-sm font-heading font-semibold mb-4">Goals Summary</h3>
              <div className="space-y-3">
                {goals.slice(0, 4).map(goal => {
                  const saved = goal.current_amount || 0;
                  const pct = Math.min(100, Math.round((saved / goal.target_amount) * 100));
                  return (
                    <div key={goal.id}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-medium truncate max-w-[140px]">{goal.name}</span>
                        <span className="text-muted-foreground">{pct}%</span>
                      </div>
                      <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${goal.is_completed ? 'bg-primary' : 'bg-primary/60'}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Streak widget */}
          {stats && (
            <div className="bg-gradient-to-br from-orange-500/10 to-amber-500/10 border border-orange-500/20 rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
                  <Flame className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <p className="text-2xl font-display font-extrabold">{stats.current_streak} days</p>
                  <p className="text-xs text-muted-foreground">Current streak</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Best: <span className="text-foreground font-semibold">{stats.longest_streak} days</span>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Create Goal Modal */}
      {showGoalModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-end md:items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-3xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-heading font-bold">New Savings Goal</h3>
              <button onClick={() => setShowGoalModal(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-muted-foreground font-medium mb-1 block">Goal Name</label>
                <input
                  value={goalForm.name}
                  onChange={e => setGoalForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. New MacBook, Vacation to Japan"
                  className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground font-medium mb-1 block">Image URL (optional)</label>
                <input
                  value={goalForm.image_url}
                  onChange={e => setGoalForm(p => ({ ...p, image_url: e.target.value }))}
                  placeholder="https://..."
                  className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground font-medium mb-1 block">Description (optional)</label>
                <input
                  value={goalForm.description}
                  onChange={e => setGoalForm(p => ({ ...p, description: e.target.value }))}
                  placeholder="Why is this important to you?"
                  className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground font-medium mb-1 block">Target Amount ($)</label>
                  <input
                    type="number"
                    value={goalForm.target_amount}
                    onChange={e => setGoalForm(p => ({ ...p, target_amount: e.target.value }))}
                    placeholder="0.00"
                    className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground font-medium mb-1 block">Already Saved ($)</label>
                  <input
                    type="number"
                    value={goalForm.saved_amount}
                    onChange={e => setGoalForm(p => ({ ...p, saved_amount: e.target.value }))}
                    placeholder="0.00"
                    className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground font-medium mb-1 block">Target Date (optional)</label>
                <input
                  type="date"
                  value={goalForm.target_date}
                  onChange={e => setGoalForm(p => ({ ...p, target_date: e.target.value }))}
                  className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowGoalModal(false)} className="flex-1 py-3 bg-secondary text-foreground rounded-xl font-semibold hover:bg-secondary/80 transition-all">
                Cancel
              </button>
              <button
                onClick={handleCreateGoal}
                disabled={savingGoal || !goalForm.name || !goalForm.target_amount}
                className="flex-1 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-all disabled:opacity-50"
              >
                {savingGoal ? 'Saving...' : 'Create Goal'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}