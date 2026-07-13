import { useNavigate } from 'react-router-dom';
import {
  BookOpen, Lock, CheckCircle, Coins,
  Wallet, TrendingUp, CreditCard, FileText, Unlock, Umbrella, Shield, PiggyBank
} from 'lucide-react';

const TOPIC_ICONS = {
  budgeting: Wallet, investing: TrendingUp, credit: CreditCard,
  taxes: FileText, saving: PiggyBank, debt: Unlock,
  insurance: Umbrella, retirement: Shield,
};

const TOPIC_GRADIENTS = {
  budgeting: ['#14b8a6', '#10b981'],
  investing: ['#3b82f6', '#6366f1'],
  credit: ['#a855f7', '#8b5cf6'],
  taxes: ['#f97316', '#f59e0b'],
  saving: ['#22c55e', '#14b8a6'],
  debt: ['#ef4444', '#f43f5e'],
  insurance: ['#0ea5e9', '#3b82f6'],
  retirement: ['#f59e0b', '#eab308'],
};

// Alternating positions for the winding road: left-center, right-center
const POSITIONS = ['left', 'right'];

export default function WindingLearningPath({ modules, progress }) {
  const navigate = useNavigate();

  const getModuleCompletedCount = (moduleId) =>
    progress.filter(p => p.module_id === moduleId && p.completed).length;

  const isModuleUnlocked = (index) => {
    if (index === 0) return true;
    return getModuleCompletedCount(modules[index - 1]?.id) > 0;
  };

  if (modules.length === 0) {
    return (
      <div className="bg-card border border-border rounded-2xl p-8 text-center">
        <BookOpen className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">No modules published yet — check back soon!</p>
      </div>
    );
  }

  return (
    <div className="relative px-4">
      {/* SVG winding path drawn behind the nodes */}
      <WindingPathSVG count={modules.length} />

      <div className="relative space-y-2">
        {modules.map((module, index) => {
          const unlocked = isModuleUnlocked(index);
          const completedCount = getModuleCompletedCount(module.id);
          const isCompleted = completedCount > 0;
          const TopicIcon = TOPIC_ICONS[module.topic_tag] || BookOpen;
          const [fromColor, toColor] = TOPIC_GRADIENTS[module.topic_tag] || ['#14b8a6', '#14b8a6'];
          const side = POSITIONS[index % 2];

          return (
            <div key={module.id} className={`relative flex items-center gap-4 py-3 ${side === 'right' ? 'flex-row-reverse' : ''}`}>
              {/* Node button */}
              <button
                onClick={() => unlocked && navigate(`/lesson/${module.id}`)}
                disabled={!unlocked}
                className={`relative shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-lg
                  ${unlocked ? 'hover:scale-110 cursor-pointer active:scale-95' : 'cursor-not-allowed opacity-50 grayscale'}
                  ${isCompleted ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''}
                `}
                style={unlocked ? { background: `linear-gradient(135deg, ${fromColor}, ${toColor})` } : {}}
              >
                {unlocked
                  ? <TopicIcon className="w-7 h-7 text-white drop-shadow" />
                  : <Lock className="w-6 h-6 text-muted-foreground" />
                }
                {isCompleted && (
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-primary rounded-full flex items-center justify-center ring-2 ring-background">
                    <CheckCircle className="w-3 h-3 text-primary-foreground" />
                  </span>
                )}
                {/* pulse ring for next unlocked incomplete */}
                {unlocked && !isCompleted && (
                  <span className="absolute inset-0 rounded-2xl animate-ping opacity-20"
                    style={{ background: `linear-gradient(135deg, ${fromColor}, ${toColor})` }} />
                )}
              </button>

              {/* Card */}
              <button
                onClick={() => unlocked && navigate(`/lesson/${module.id}`)}
                disabled={!unlocked}
                className={`flex-1 text-left bg-card border rounded-2xl p-4 transition-all duration-200
                  ${unlocked
                    ? 'border-border hover:border-primary/40 hover:shadow-md hover:-translate-y-0.5 cursor-pointer'
                    : 'border-border opacity-50 cursor-not-allowed'
                  }
                `}
              >
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className={`text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    module.difficulty === 'beginner' ? 'bg-primary/15 text-primary' :
                    module.difficulty === 'intermediate' ? 'bg-amber-400/15 text-amber-400' :
                    'bg-red-400/15 text-red-400'
                  }`}>{module.difficulty}</span>
                  <span className="text-xs text-muted-foreground capitalize">{module.topic_tag?.replace('_', ' ')}</span>
                </div>
                <h3 className="text-sm font-heading font-semibold leading-snug mb-2">{module.title}</h3>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 text-xs text-primary font-medium">
                    <Coins className="w-3 h-3" /> {module.xp_reward} BC
                  </span>
                  {isCompleted && (
                    <span className="flex items-center gap-1 text-xs text-green-400 font-medium">
                      <CheckCircle className="w-3 h-3" /> Done
                    </span>
                  )}
                  {!unlocked && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Lock className="w-3 h-3" /> Locked
                    </span>
                  )}
                </div>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Renders an SVG winding dashed path behind the nodes
function WindingPathSVG({ count }) {
  if (count < 2) return null;

  // Each row is ~88px tall (py-3 + h-16 node). Path winds left→right→left
  const rowH = 88;
  const totalH = count * rowH;
  const leftX = 32;   // center of left node
  const rightX = 268; // center of right node (approx, card area excluded)
  const midX = (leftX + rightX) / 2;

  const points = Array.from({ length: count }, (_, i) => {
    const x = i % 2 === 0 ? leftX : rightX;
    const y = i * rowH + rowH / 2;
    return { x, y };
  });

  let d = '';
  points.forEach((pt, i) => {
    if (i === 0) {
      d += `M ${pt.x} ${pt.y}`;
    } else {
      const prev = points[i - 1];
      // Cubic bezier: control points fan out toward center then back
      const cp1x = midX;
      const cp1y = prev.y + rowH * 0.4;
      const cp2x = midX;
      const cp2y = pt.y - rowH * 0.4;
      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${pt.x} ${pt.y}`;
    }
  });

  return (
    <svg
      className="absolute inset-0 w-full pointer-events-none"
      style={{ height: totalH }}
      viewBox={`0 0 300 ${totalH}`}
      preserveAspectRatio="none"
    >
      <path
        d={d}
        fill="none"
        stroke="hsl(var(--border))"
        strokeWidth="3"
        strokeDasharray="8 6"
        strokeLinecap="round"
      />
      {/* Filled progress overlay — up to the last completed node */}
      <path
        d={d}
        fill="none"
        stroke="hsl(var(--primary))"
        strokeWidth="3"
        strokeDasharray="8 6"
        strokeLinecap="round"
        opacity="0.5"
        style={{ strokeDashoffset: 0 }}
      />
    </svg>
  );
}