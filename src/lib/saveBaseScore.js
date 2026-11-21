import { base44 } from '@/api/base44Client';

// Quiz results taken before sign-up wait here until the user is logged in.
const PENDING_KEY = 'basescore_pending_result';

async function writeStats(user, result) {
  const existing = await base44.entities.UserStats.filter({ user_id: user.id });
  if (existing[0]) return base44.entities.UserStats.update(existing[0].id, result);
  return base44.entities.UserStats.create({ user_id: user.id, ...result });
}

/** Saves the quiz result now if signed in, otherwise keeps it until the next sign-in. */
export async function saveBaseScore(result) {
  const authed = await base44.auth.isAuthenticated();
  if (!authed) {
    localStorage.setItem(PENDING_KEY, JSON.stringify(result));
    return null;
  }
  const user = await base44.auth.me();
  localStorage.removeItem(PENDING_KEY);
  return writeStats(user, result);
}

/** Saves a result kept from before sign-in. Returns the updated stats, or null if none was pending. */
export async function savePendingBaseScore(user) {
  const raw = localStorage.getItem(PENDING_KEY);
  if (!raw) return null;
  localStorage.removeItem(PENDING_KEY);
  return writeStats(user, JSON.parse(raw));
}