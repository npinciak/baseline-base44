import { LESSON_REWARD } from '@/lib/coinEconomy';

export const STREAK_SHIELD_COST = 200;
export const CAMP_I_REBATE = 200;
export const SUMMIT_REBATE = 500;

/**
 * BaseCoin Levels are driven by cumulative Lifetime Earned BaseCoins (100 BC per lesson).
 * Spending BaseCoins in Basecamp or on Streak Shields NEVER reduces a learner's Level.
 * All thresholds and costs use even numbers calibrated to the 71-lesson (7,100 BC) base
 * curriculum and 213-lesson (21,300 BC) 3x roadmap.
 */
export const COIN_LEVELS = [
  {
    level: 1,
    title: 'Trailhead',
    minLifetimeCoins: 0,
    lessonsNeeded: 0,
    benefitTitle: 'Starter Wallet & BasePath Access',
    costLabel: 'Included (0 BC)',
    costType: 'passive',
    summary: 'Earn 50 BaseCoins per completed lesson (100 with Baseline Plus) and track progress toward Basecamp gift cards.',
    whenUsed: 'Active automatically on every lesson you finish. Coins land in your spendable wallet. Levels count lessons, so they rise at the same pace on every plan.',
    actionType: 'dashboard',
    actionLabel: 'Continue BasePath',
  },
  {
    level: 2,
    title: 'Scout',
    minLifetimeCoins: 400,
    lessonsNeeded: 4,
    benefitTitle: 'Streak Shield (1-Day Freeze)',
    costLabel: `${STREAK_SHIELD_COST} Spendable BC per shield`,
    costType: 'spendable',
    coinsCost: STREAK_SHIELD_COST,
    summary: 'Arm a 1-day Streak Shield so missing a single busy day preserves your daily learning streak.',
    whenUsed: `Deducts ${STREAK_SHIELD_COST} BC from your spendable wallet (your Level never drops) and protects your streak the next time you miss one day.`,
    actionType: 'shield',
    actionLabel: 'Arm Streak Shield',
  },
  {
    level: 3,
    title: 'Climber',
    minLifetimeCoins: 1000,
    lessonsNeeded: 10,
    benefitTitle: 'Forecast Sandbox Presets',
    costLabel: 'Permanent unlock (0 BC)',
    costType: 'passive',
    summary: 'Unlocks one-tap "What-If" scenario presets on Money Forecast (Trim Wants, Lean Month, +$200 Side Income).',
    whenUsed: 'Applies instant spending and side-income simulations to your future balance projection without altering real bank history.',
    actionType: 'forecast',
    actionLabel: 'Open Forecast Sandbox',
  },
  {
    level: 4,
    title: 'Pathfinder',
    minLifetimeCoins: 2000,
    lessonsNeeded: 20,
    benefitTitle: `Camp I Member Pricing (-${CAMP_I_REBATE} BC on $10 Cards)`,
    costLabel: 'Automatic member rebate',
    costType: 'rebate',
    summary: `Saves ${CAMP_I_REBATE} BC on every $10 gift card in Basecamp (2,800 BC instead of 3,000 BC).`,
    whenUsed: 'Verified on the server at redemption: only 2,800 Spendable BC is deducted, leaving 200 BC in your wallet toward your next reward.',
    actionType: 'basecamp',
    actionLabel: 'View $10 Rewards',
  },
  {
    level: 5,
    title: 'Strategist',
    minLifetimeCoins: 3600,
    lessonsNeeded: 36,
    benefitTitle: 'Personal Money Playbook (PDF Export)',
    costLabel: 'Unlimited downloads (0 BC)',
    costType: 'passive',
    summary: 'Generate a personalized Baseline Money Playbook PDF with your BaseScore, completed Money Moves, and next milestones.',
    whenUsed: 'Builds and downloads an updated PDF snapshot of your progress whenever you want an offline checklist.',
    actionType: 'playbook',
    actionLabel: 'Download Playbook PDF',
  },
  {
    level: 6,
    title: 'Summit',
    minLifetimeCoins: 5600,
    lessonsNeeded: 56,
    benefitTitle: `Summit Perks (-${SUMMIT_REBATE} BC on $25 Cards)`,
    costLabel: 'Automatic summit rebate',
    costType: 'rebate',
    summary: `Saves ${SUMMIT_REBATE} BC on every $25 gift card in Basecamp (6,500 BC instead of 7,000 BC).`,
    whenUsed: 'Verified on the server at redemption: $25 gift cards deduct 6,500 Spendable BC while keeping your Summit level permanent.',
    actionType: 'basecamp',
    actionLabel: 'View $25 Summit Rewards',
  },
];

export function getLifetimeCoins(stats, completedLessonUnits = 0) {
  const fromStats = Number(stats?.total_xp || 0);
  const fromUnits = Number(completedLessonUnits || 0) * LESSON_REWARD;
  return Math.max(fromStats, fromUnits);
}

export function getLevelInfo(lifetimeCoins = 0) {
  const earned = Math.max(0, Number(lifetimeCoins) || 0);
  let current = COIN_LEVELS[0];
  for (const tier of COIN_LEVELS) {
    if (earned >= tier.minLifetimeCoins) current = tier;
  }
  const idx = COIN_LEVELS.findIndex((t) => t.level === current.level);
  const next = COIN_LEVELS[idx + 1] || null;
  if (!next) {
    return {
      current,
      next: null,
      lifetimeCoins: earned,
      progressPct: 100,
      coinsToNext: 0,
      lessonsToNext: 0,
    };
  }
  const span = next.minLifetimeCoins - current.minLifetimeCoins;
  const intoTier = earned - current.minLifetimeCoins;
  const coinsToNext = Math.max(0, next.minLifetimeCoins - earned);
  return {
    current,
    next,
    lifetimeCoins: earned,
    progressPct: Math.min(100, Math.max(0, Math.round((intoTier / span) * 100))),
    coinsToNext,
    lessonsToNext: Math.ceil(coinsToNext / LESSON_REWARD),
  };
}

export function getEffectiveCardCost(card, lifetimeCoins = 0) {
  const baseCost = Number(card?.coinsCost || 0);
  const amount = Number(card?.amount || 0);
  if (amount === 25 && lifetimeCoins >= 5600) {
    return { effectiveCost: baseCost - SUMMIT_REBATE, rebate: SUMMIT_REBATE, tierRequired: 6 };
  }
  if (amount === 10 && lifetimeCoins >= 2000) {
    return { effectiveCost: baseCost - CAMP_I_REBATE, rebate: CAMP_I_REBATE, tierRequired: 4 };
  }
  return {
    effectiveCost: baseCost,
    rebate: 0,
    unlockHint: amount === 25 ? `Level 6 (-${SUMMIT_REBATE} BC)` : amount === 10 ? `Level 4 (-${CAMP_I_REBATE} BC)` : null,
  };
}