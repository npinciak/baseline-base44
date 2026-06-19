import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import {
  Flame, Zap, Star, Target, ChevronRight, ChevronLeft,
  Plus, BookOpen, Lock, CheckCircle,
  Wallet, TrendingUp, CreditCard, FileText, Unlock, Umbrella, Shield, PiggyBank
} from 'lucide-react';

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
  const [stats, setStats] = useState(null);
  const [goals, setGoals] = useState([]);
  const [modules, setModules] = useState([]);
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const init = async () => {
      const u = await base44.auth.me();
      setUser(u);
      const [statsArr, goalsArr, mods, prog] = await Promise.all([
        base44.entities.UserStats.filter({ user_id: u.id }),
        base44.entities.SavingsGoal.filter({ user_id: u.id }, '-created_date', 6),
        base44.entities.Module.filter({ is_published: true }, 'order_index', 20),
        base44.entities.UserProgress.filter({ user_id: u.id }),
      ]);
      if (statsArr.length === 0) { navigate('/onboarding'); return; }
      setStats(statsArr[0]);
      setGoals(goalsArr);
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

  // Find next recommended module
  const nextModuleIndex = modules.findIndex((m, i) => isModuleUnlocked(i) && getModuleCompletedCount(m.id) === 0);
  const nextModule = nextModuleIndex >= 0 ? modules[nextModuleIndex] : null;
  const inProgressModules = modules.filter(m => getModuleCompletedCount(m.id) > 0 && isModuleUnlocked(modules.indexOf(m)));

  const prevGoal = () => setCarouselIndex(i => Math.max(0, i - 1));
  const nextGoal = () => setCarouselIndex(i => Math.min(goals.length - 1, i + 1));

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
          {greeting()}, {user?.full_name?.split(' ')[0] || 'there'} 👋
        </h1>
        <p className="text-muted-foreground">Here's your financial progress at a glance.</p>
      </div>

      {/* Stats row */}
      {stats && (
        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="bg-card border border-border rounded-2xl p-4 text-center">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <Flame className="w-5 h-5 text-orange-400" />
              <span className="text-2xl font-display font-bold">{stats.current_streak}</span>
            </div>
            <p className="text-xs text-muted-foreground">Day Streak</p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-4 text-center">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <Zap className="w-5 h-5 text-primary" />
              <span className="text-2xl font-display font-bold">{stats.total_xp}</span>
            </div>
            <p className="text-xs text-muted-foreground">Total XP</p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-4 text-center">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <Star className="w-5 h-5 text-amber-400" />
              <span className="text-2xl font-display font-bold">{stats.current_level}</span>
            </div>
            <p className="text-xs text-muted-foreground">Level</p>
          </div>
        </div>
      )}

      {/* XP Progress */}
      {stats && (
        <div className="bg-card border border-border rounded-2xl p-4 mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Level {stats.current_level} → {stats.current_level + 1}</span>
            <span className="text-sm text-primary font-semibold">{Math.round(xpProgress)}%</span>
          </div>
          <div className="h-3 bg-secondary rounded-full overflow-hidden">
            <div className="h-full rounded-full xp-shimmer transition-all duration-700" style={{ width: `${xpProgress}%` }} />
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-5 gap-6">
        {/* Main column */}
        <div className="md:col-span-3 space-y-6">

          {/* Goals Carousel */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-heading font-bold">Savings Goals</h2>
              <Link to="/goals" className="text-xs text-primary font-semibold hover:underline flex items-center gap-1">
                View all <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {goals.length === 0 ? (
              <Link
                to="/goals"
                className="flex flex-col items-center justify-center bg-card border border-dashed border-border rounded-2xl p-10 hover:border-primary/40 transition-all group"
              >
                <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center mb-3 group-hover:bg-primary/15 transition-all">
                  <Target className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-all" />
                </div>
                <p className="text-sm font-semibold mb-1">No goals yet</p>
                <p className="text-xs text-muted-foreground mb-3">Start saving towards something meaningful</p>
                <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-semibold">
                  <Plus className="w-4 h-4" /> Create a Goal
                </span>
              </Link>
            ) : (
              <div className="relative">
                {/* Carousel card */}
                <div className="overflow-hidden rounded-2xl">
                  {goals.map((goal, i) => {
                    const saved = goal.saved_amount || 0;
                    const pct = Math.min(100, Math.round((saved / goal.target_amount) * 100));
                    return (
                      <div
                        key={goal.id}
                        className={`transition-all duration-300 ${i === carouselIndex ? 'block' : 'hidden'}`}
                      >
                        <div className="bg-card border border-border rounded-2xl overflow-hidden">
                          {goal.image_url ? (
                            <div className="h-36 overflow-hidden">
                              <img src={goal.image_url} alt={goal.name} className="w-full h-full object-cover" />
                            </div>
                          ) : (
                            <div className="h-36 bg-secondary flex items-center justify-center">
                              <Target className="w-10 h-10 text-muted-foreground/30" />
                            </div>
                          )}
                          <div className="p-5">
                            <div className="flex items-center justify-between mb-1">
                              <h3 className="font-heading font-bold text-base">{goal.name}</h3>
                              {goal.is_completed && <CheckCircle className="w-5 h-5 text-primary" />}
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

          {/* Learning path next steps */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-heading font-bold">Learning Path</h2>
              <Link to="/learn" className="text-xs text-primary font-semibold hover:underline flex items-center gap-1">
                Full path <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {modules.length === 0 ? (
              <div className="bg-card border border-border rounded-2xl p-8 text-center">
                <BookOpen className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No modules published yet — check back soon!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Next up */}
                {nextModule && (
                  <Link
                    to={`/learn/${nextModule.id}`}
                    className="flex items-center gap-4 bg-primary/10 border border-primary/25 rounded-2xl p-4 hover:border-primary/50 transition-all group"
                  >
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${TOPIC_COLORS[nextModule.topic_tag] || 'from-primary to-primary'} flex items-center justify-center shrink-0 shadow-md`}>
                      {(() => { const Icon = TOPIC_ICONS[nextModule.topic_tag] || BookOpen; return <Icon className="w-6 h-6 text-white" />; })()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-0.5">Up Next</p>
                      <p className="text-sm font-bold truncate">{nextModule.title}</p>
                      <p className="text-xs text-muted-foreground capitalize">{nextModule.topic_tag?.replace('_', ' ')} · {nextModule.difficulty}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-primary group-hover:translate-x-0.5 transition-transform shrink-0" />
                  </Link>
                )}

                {/* In progress */}
                {inProgressModules.slice(0, 2).map(mod => {
                  const completed = getModuleCompletedCount(mod.id);
                  const TopicIcon = TOPIC_ICONS[mod.topic_tag] || BookOpen;
                  return (
                    <Link
                      key={mod.id}
                      to={`/learn/${mod.id}`}
                      className="flex items-center gap-4 bg-card border border-border rounded-2xl p-4 hover:border-primary/30 transition-all"
                    >
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${TOPIC_COLORS[mod.topic_tag] || 'from-primary to-primary'} flex items-center justify-center shrink-0 opacity-80`}>
                        <TopicIcon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-0.5">In Progress</p>
                        <p className="text-sm font-semibold truncate">{mod.title}</p>
                        <p className="text-xs text-green-400 font-medium">{completed} lesson{completed !== 1 ? 's' : ''} done</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                    </Link>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        {/* Sidebar widgets */}
        <div className="md:col-span-2 space-y-5">
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
              <Link to="/finance" className="flex items-center gap-3 p-3 rounded-xl hover:bg-secondary transition-all group">
                <div className="w-8 h-8 rounded-lg bg-blue-500/15 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-blue-400" />
                </div>
                <span className="text-sm font-medium">Track Spending</span>
                <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link to="/learn" className="flex items-center gap-3 p-3 rounded-xl hover:bg-secondary transition-all group">
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
                  const saved = goal.saved_amount || 0;
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
    </div>
  );
}