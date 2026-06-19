import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Lock, CheckCircle, Flame, Star, ChevronRight, Zap, BookOpen } from 'lucide-react';

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

const TOPIC_EMOJIS = {
  budgeting: '💵',
  investing: '📈',
  credit: '💳',
  taxes: '🧾',
  saving: '🐷',
  debt: '🔓',
  insurance: '🛡️',
  retirement: '🏖️',
};

export default function Learn() {
  const [modules, setModules] = useState([]);
  const [progress, setProgress] = useState([]);
  const [stats, setStats] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const init = async () => {
      const u = await base44.auth.me();
      setUser(u);
      const [mods, prog, statsArr] = await Promise.all([
        base44.entities.Module.filter({ is_published: true }, 'order_index', 50),
        base44.entities.UserProgress.filter({ user_id: u.id }),
        base44.entities.UserStats.filter({ user_id: u.id }),
      ]);
      setModules(mods);
      setProgress(prog);
      if (statsArr.length === 0) {
        navigate('/onboarding');
        return;
      }
      setStats(statsArr[0]);
      setLoading(false);
    };
    init().catch(() => setLoading(false));
  }, []);

  const getModuleProgress = (moduleId) => {
    const modProgress = progress.filter(p => p.module_id === moduleId && p.completed);
    return modProgress.length;
  };

  const isModuleUnlocked = (index) => {
    if (index === 0) return true;
    const prevModule = modules[index - 1];
    if (!prevModule) return false;
    return getModuleProgress(prevModule.id) > 0;
  };

  const xpForLevel = (level) => level * 200;
  const xpProgress = stats ? ((stats.total_xp % xpForLevel(stats.current_level)) / xpForLevel(stats.current_level)) * 100 : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-display font-extrabold mb-1">Learning Path</h1>
        <p className="text-muted-foreground">Master personal finance one lesson at a time</p>
      </div>

      {/* Stats row */}
      {stats && (
        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="bg-card border border-border rounded-2xl p-4 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Flame className="w-5 h-5 text-orange-400" />
              <span className="text-2xl font-display font-bold">{stats.current_streak}</span>
            </div>
            <p className="text-xs text-muted-foreground">Day Streak</p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-4 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Zap className="w-5 h-5 text-primary" />
              <span className="text-2xl font-display font-bold">{stats.total_xp}</span>
            </div>
            <p className="text-xs text-muted-foreground">Total XP</p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-4 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
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
            <div
              className="h-full rounded-full xp-shimmer transition-all duration-700"
              style={{ width: `${xpProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Learning path */}
      {modules.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p className="text-lg font-medium">No modules published yet</p>
          <p className="text-sm">Check back soon — content is coming!</p>
        </div>
      ) : (
        <div className="relative">
          {/* Connecting line */}
          <div className="absolute left-8 top-8 bottom-8 w-0.5 bg-border" />

          <div className="space-y-4">
            {modules.map((module, index) => {
              const unlocked = isModuleUnlocked(index);
              const completedCount = getModuleProgress(module.id);
              const colorClass = TOPIC_COLORS[module.topic_tag] || 'from-primary to-primary';
              const emoji = TOPIC_EMOJIS[module.topic_tag] || '📖';

              return (
                <div key={module.id} className="relative pl-20">
                  {/* Node */}
                  <div
                    className={`absolute left-0 w-16 h-16 rounded-2xl flex items-center justify-center text-2xl transition-all duration-300 ${
                      unlocked
                        ? `bg-gradient-to-br ${colorClass} shadow-lg ${completedCount > 0 ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''}`
                        : 'bg-secondary text-muted-foreground grayscale'
                    }`}
                  >
                    {unlocked ? emoji : <Lock className="w-6 h-6 text-muted-foreground" />}
                    {completedCount > 0 && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                        <CheckCircle className="w-3 h-3 text-primary-foreground" />
                      </div>
                    )}
                  </div>

                  {/* Card */}
                  <button
                    onClick={() => unlocked && navigate(`/learn/${module.id}`)}
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
                          }`}>
                            {module.difficulty}
                          </span>
                          <span className="text-xs text-muted-foreground capitalize">{module.topic_tag.replace('_', ' ')}</span>
                        </div>
                        <h3 className="text-base font-heading font-semibold mb-1">{module.title}</h3>
                        {module.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">{module.description}</p>
                        )}
                        <div className="flex items-center gap-3 mt-3">
                          <span className="flex items-center gap-1 text-xs text-primary font-medium">
                            <Zap className="w-3 h-3" /> {module.xp_reward} XP
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
    </div>
  );
}