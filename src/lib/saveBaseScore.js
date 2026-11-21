import { base44 } from '@/api/base44Client';

// Every quiz result is kept on this device until it is safely stored on the account,
// so a failed save or a sign-up in between never loses it.
const PENDING_KEY = 'basescore_pending_result';

export function readPendingBaseScore() {
  try {
    return JSON.parse(localStorage.getItem(PENDING_KEY) || 'null');
  } catch {
    return null;
  }
}

export function clearPendingBaseScore() {
  localStorage.removeItem(PENDING_KEY);
}

function notifySaved(stats) {
  window.dispatchEvent(new CustomEvent('basescore-saved', { detail: { stats } }));
}

async function writeStats(user, result) {
  const existing = await base44.entities.UserStats.filter({ user_id: user.id });
  const stats = existing[0]
    ? await base44.entities.UserStats.update(existing[0].id, result)
    : await base44.entities.UserStats.create({ user_id: user.id, ...result });
  clearPendingBaseScore();
  notifySaved(stats);
  return stats;
}

/** Keeps the result on this device, then stores it on the account when signed in. Throws if the save fails. */
export async function saveBaseScore(result) {
  localStorage.setItem(PENDING_KEY, JSON.stringify(result));
  const authed = await base44.auth.isAuthenticated();
  if (!authed) return { pending: true, stats: null };
  const user = await base44.auth.me();
  return { pending: false, stats: await writeStats(user, result) };
}

/** Stores a result kept from before sign-in. Returns the updated stats, or null if none was pending. */
export async function savePendingBaseScore(user) {
  const pending = readPendingBaseScore();
  if (!pending) return null;
  return writeStats(user, pending);
}