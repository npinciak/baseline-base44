import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Coins, Flame, Sparkles, Compass, CheckCircle2, Shield } from 'lucide-react';
import { LESSON_REWARD } from '@/lib/coinEconomy';
import { TOOL_LINKS, nextLesson } from '@/lib/curriculum';
import { getLevelInfo, getLifetimeCoins } from '@/lib/coinLevels';

const HERO_ART = 'https://media.base44.com/images/public/6a3542676f9044e70b439a84/a3d6b18e5_generated_image.png';

function timeGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

export default function DashboardWelcomeHero({ name, stats, chapters, onCompleteMove }) {
  const [completingMove, setCompletingMove] = useState(false);

  const upcomingMod = nextLesson(chapters);
  const activeChapter = chapters.find((c) => c.unlocked && !c.comingSoon && (!c.learned || (c.move && !c.moveDone)));
  const totalLessons = chapters.reduce((s, c) => s + c.modules.length, 0);
  const doneLessons = chapters.reduce((s, c) => s + c.lessonsDone, 0);
  const overallPct = totalLessons > 0 ? Math.round((doneLessons / totalLessons) * 100) : 0;

  const lifetimeCoins = getLifetimeCoins(stats, doneLessons);
  const levelInfo = getLevelInfo(lifetimeCoins);
  const streak = stats?.current_streak || 0;

  const isMoveStage = !upcomingMod && activeChapter?.learned && activeChapter?.move && !activeChapter?.moveDone;
  const isAllCaughtUp = !upcomingMod && !isMoveStage;

  let eyebrow = activeChapter ? `Chapter ${activeChapter.number} · ${activeChapter.title}` : 'BasePath Complete';
  let headline = `${timeGreeting()}, ${name}.`;
  let promptCopy = '';
  let ctaLabel = 'Continue Lesson';
  let ctaTo = upcomingMod ? `/lesson/${upcomingMod.id}` : '/money';

  if (upcomingMod && activeChapter) {
    const remainingInChapter = activeChapter.modules.length - activeChapter.lessonsDone;
    if (doneLessons === 0) {
      promptCopy = `Start strong with "${upcomingMod.title}" — a quick interactive lesson that earns your first +${LESSON_REWARD} BaseCoins and kicks off ${activeChapter.title}.`;
      ctaLabel = `Start First Lesson`;
    } else if (remainingInChapter === 1) {
      promptCopy = `You're one lesson away from finishing ${activeChapter.title}! Jump into "${upcomingMod.title}" (+${LESSON_REWARD} BC) to unlock this chapter's Money Move.`;
      ctaLabel = `Finish ${activeChapter.title}`;
    } else {
      promptCopy = `Pick up right where you left off with "${upcomingMod.title}". Complete it in a few minutes to bank +${LESSON_REWARD} BaseCoins${streak > 0 ? ` and protect your ${streak}-day streak` : ''}.`;
      ctaLabel = `Continue Lesson`;
    }
  } else if (isMoveStage) {
    eyebrow = `Chapter ${activeChapter.number} · Money Move Ready`;
    promptCopy = `Every lesson in ${activeChapter.title} is done! Put it into action — "${activeChapter.move.title}" — to unlock the next chapter on your path.`;
    ctaLabel = activeChapter.move.tool ? 'Open Tool & Complete Move' : 'Mark Money Move Done';
    ctaTo = activeChapter.move.tool ? (TOOL_LINKS[activeChapter.move.tool] || '/money') : null;
  } else if (isAllCaughtUp) {
    eyebrow = `${doneLessons} of ${totalLessons} Lessons Mastered`;
    promptCopy = `You've completed every published lesson and Money Move on BasePath. Explore our 3x Curriculum Expansion Roadmap to preview what's coming next.`;
    ctaLabel = 'Explore 3x Roadmap';
    ctaTo = '/roadmap';
  }

  const handleMoveDone = async () => {
    if (!activeChapter || completingMove) return;
    setCompletingMove(true);
    try {
      await onCompleteMove?.(activeChapter);
    } finally {
      setCompletingMove(false);
    }
  };

  return (
    <section
      aria-label="Personalized learning welcome"
      className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#050912] p-6 sm:p-8 mb-8"
    >
      {/* Subtle radial ambient glow inspired by the designed split hero */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 -left-16 h-72 w-96 rounded-full opacity-90"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(46,253,122,0.16) 0%, rgba(46,160,253,0.12) 45%, transparent 72%)',
        }}
      />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
        {/* Left Stage: Headline + Encouraging Prompt + Primary CTA */}
        <div className="lg:col-span-7 flex flex-col justify-between gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#2EFD7A]/15 text-[#2EFD7A] border border-[#2EFD7A]/30">
                <Sparkles className="w-3.5 h-3.5" />
                {eyebrow}
              </span>
              {streak > 0 && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-white/[0.06] text-white/85 border border-white/10">
                  <Flame className="w-3.5 h-3.5 text-[#2EFD7A]" />
                  {streak}d streak
                </span>
              )}
              {stats?.streak_shield_active && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-[#2EA0FD]/15 text-[#2EA0FD] border border-[#2EA0FD]/30">
                  <Shield className="w-3 h-3" />
                  Shield Armed
                </span>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl font-display font-extrabold tracking-tight text-white leading-[1.12]">
              {headline}
            </h1>
            <p className="mt-3 text-sm sm:text-base text-white/75 leading-relaxed max-w-xl">
              {promptCopy}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            {ctaTo ? (
              <Link
                to={ctaTo}
                className="group inline-flex items-center gap-3 rounded-full bg-[#2EFD7A] text-black pl-5 pr-2 py-2 text-sm font-bold shadow-[0_0_28px_rgba(46,253,122,0.3)] hover:bg-[#2EFD7A]/90 transition-all"
              >
                <span>{ctaLabel}</span>
                <span className="w-8 h-8 rounded-full bg-black/15 flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
                  <ArrowRight className="w-4 h-4 text-black" />
                </span>
              </Link>
            ) : (
              <button
                type="button"
                onClick={handleMoveDone}
                disabled={completingMove}
                className="group inline-flex items-center gap-3 rounded-full bg-[#2EFD7A] text-black pl-5 pr-2 py-2 text-sm font-bold shadow-[0_0_28px_rgba(46,253,122,0.3)] hover:bg-[#2EFD7A]/90 disabled:opacity-50 transition-all"
              >
                <span>{completingMove ? 'Saving...' : ctaLabel}</span>
                <span className="w-8 h-8 rounded-full bg-black/15 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-black" />
                </span>
              </button>
            )}

            {isMoveStage && activeChapter?.move?.tool && (
              <button
                type="button"
                onClick={handleMoveDone}
                disabled={completingMove}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/[0.04] px-4 py-2.5 text-xs font-semibold text-white/85 hover:bg-white/10 transition-colors"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-[#2EFD7A]" />
                {completingMove ? 'Marking...' : 'Mark Move Done'}
              </button>
            )}

            <Link
              to="/roadmap"
              className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.03] px-4 py-2.5 text-xs font-medium text-white/75 hover:text-white hover:border-white/30 transition-colors"
            >
              <Compass className="w-3.5 h-3.5 text-[#2EA0FD]" />
              3x Curriculum Roadmap
            </Link>
          </div>
        </div>

        {/* Right Stage: Rounded Media Card with Live Next-Lesson & Level Benefit Overlay */}
        <div className="lg:col-span-5 relative min-h-[210px] rounded-2xl overflow-hidden border border-white/10 bg-black flex flex-col justify-between p-5">
          <img
            src={HERO_ART}
            alt="Glowing Baseline learning path"
            className="absolute inset-0 h-full w-full object-cover opacity-75"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/30"
          />

          {/* Top pill inside media card: Up Next card */}
          <div className="relative z-10 flex items-center justify-between gap-2">
            <span className="text-[11px] uppercase tracking-widest font-semibold text-white/75">
              {upcomingMod ? 'Up Next' : isMoveStage ? 'Action Step' : 'Path Mastery'}
            </span>
            {upcomingMod && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/65 backdrop-blur-md border border-[#2EA0FD]/40 text-xs font-bold text-[#2EA0FD]">
                <Coins className="w-3.5 h-3.5" />
                +{LESSON_REWARD} BC
              </span>
            )}
          </div>

          {/* Bottom live lesson & level perk card */}
          <div className="relative z-10 mt-8 rounded-xl bg-black/70 backdrop-blur-md border border-white/15 p-3.5 space-y-2.5">
            {upcomingMod ? (
              <div>
                <p className="text-white font-bold text-sm truncate">{upcomingMod.title}</p>
                <p className="text-xs text-white/60 mt-0.5">
                  {activeChapter?.lessonsDone || 0} of {activeChapter?.modules?.length || 0} lessons done in {activeChapter?.title}
                </p>
              </div>
            ) : isMoveStage ? (
              <div>
                <p className="text-white font-bold text-sm truncate">{activeChapter.move.title}</p>
                <p className="text-xs text-white/60 mt-0.5 line-clamp-2">{activeChapter.move.detail}</p>
              </div>
            ) : (
              <div>
                <p className="text-white font-bold text-sm">All {totalLessons} current lessons completed</p>
                <p className="text-xs text-white/60 mt-0.5">142 new lessons planned across 4 roadmap stages</p>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between text-[11px] text-white/65 mb-1">
                <Link to="/profile#levels" className="hover:text-[#2EFD7A] transition-colors font-semibold">
                  Lv {levelInfo.current.level} · {levelInfo.current.title} →
                </Link>
                <span>{doneLessons}/{totalLessons} lessons ({overallPct}%)</span>
              </div>
              <div className="h-1.5 rounded-full bg-white/15 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#2EFD7A] to-[#2EA0FD] transition-all duration-500"
                  style={{ width: `${Math.max(overallPct, 4)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}