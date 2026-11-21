// Single source of truth for the BaseCoin economy and level benefit thresholds on the server.
// Earning: spendable BaseCoins per completed lesson (unit), credited once per lesson. Plus members earn 2x.
// Levels count completed lessons (LESSON_REWARD level points each) for everyone, so paying never buys progress.
export const LESSON_REWARD = 100;
export const FREE_LESSON_COINS = 50;
export const PLUS_LESSON_COINS = 100;
export const lessonCoins = (paid: boolean) => (paid ? PLUS_LESSON_COINS : FREE_LESSON_COINS);
export const STREAK_SHIELD_COST = 200;
export const LEVEL_2_MIN_COINS = 400;
export const LEVEL_4_MIN_COINS = 2000;
export const LEVEL_6_MIN_COINS = 5600;
export const CAMP_I_REBATE = 200;
export const SUMMIT_REBATE = 500;

const TEN = 3000;
const TWENTY_FIVE = 7000;
export const GIFT_CARD_PRICES = {
  'amazon-10': { brand: 'Amazon', amount: 10, coinsCost: TEN },
  'amazon-25': { brand: 'Amazon', amount: 25, coinsCost: TWENTY_FIVE },
  'starbucks-10': { brand: 'Starbucks', amount: 10, coinsCost: TEN },
  'starbucks-25': { brand: 'Starbucks', amount: 25, coinsCost: TWENTY_FIVE },
  'netflix-10': { brand: 'Netflix', amount: 10, coinsCost: TEN },
  'netflix-25': { brand: 'Netflix', amount: 25, coinsCost: TWENTY_FIVE },
  'spotify-10': { brand: 'Spotify', amount: 10, coinsCost: TEN },
  'target-10': { brand: 'Target', amount: 10, coinsCost: TEN },
  'target-25': { brand: 'Target', amount: 25, coinsCost: TWENTY_FIVE },
  'doordash-10': { brand: 'DoorDash', amount: 10, coinsCost: TEN },
};

export function isUuid(value) {
  return typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export function computeEffectiveGiftCardCost(card, lifetimeCoins = 0) {
  if (!card) return { effectiveCost: 0, rebate: 0 };
  if (card.amount === 25 && lifetimeCoins >= LEVEL_6_MIN_COINS) {
    return { effectiveCost: card.coinsCost - SUMMIT_REBATE, rebate: SUMMIT_REBATE };
  }
  if (card.amount === 10 && lifetimeCoins >= LEVEL_4_MIN_COINS) {
    return { effectiveCost: card.coinsCost - CAMP_I_REBATE, rebate: CAMP_I_REBATE };
  }
  return { effectiveCost: card.coinsCost, rebate: 0 };
}

export async function resolveSupabaseProfile(user, supabaseUrl, headers) {
  let nextAuthUserId = isUuid(user.id) ? user.id : null;
  if (!nextAuthUserId && user.email) {
    const lookupRes = await fetch(
      `${supabaseUrl}/rest/v1/users?email=eq.${encodeURIComponent(user.email)}&select=id&limit=1`,
      { headers: { ...headers, 'Accept-Profile': 'next_auth' }, signal: AbortSignal.timeout(10000) }
    );
    const rows = await lookupRes.json();
    nextAuthUserId = rows?.[0]?.id ?? null;
  }
  if (!nextAuthUserId) return null;

  const profileRes = await fetch(
    `${supabaseUrl}/rest/v1/user_profiles?user_id=eq.${nextAuthUserId}&select=id&limit=1`,
    { headers, signal: AbortSignal.timeout(10000) }
  );
  const profiles = await profileRes.json();
  return profiles?.[0]?.id ?? null;
}

export async function getVerifiedLifetimeCoins(base44, userId, userProfileId, supabaseUrl, headers, currentBalance = 0) {
  const [awards, redemptionsRes] = await Promise.all([
    base44.asServiceRole.entities.CoinAward.filter({ user_id: userId }).catch(() => []),
    userProfileId
      ? fetch(
          `${supabaseUrl}/rest/v1/redemption_history?user_profile_id=eq.${userProfileId}&select=coins_spent`,
          { headers, signal: AbortSignal.timeout(10000) }
        ).then((r) => r.json()).catch(() => [])
      : Promise.resolve([]),
  ]);
  // Level points come from the number of lessons completed, not the plan-dependent coin amount.
  const awardSum = (Array.isArray(awards) ? awards.length : 0) * LESSON_REWARD;
  const spentSum = (Array.isArray(redemptionsRes) ? redemptionsRes : []).reduce(
    (s, r) => s + Number(r.coins_spent || 0),
    0
  );
  return Math.max(awardSum, Number(currentBalance || 0) + spentSum);
}