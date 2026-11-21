import { CHAPTERS } from '@/lib/curriculum';
import { MAX_SCORE, SCORE_CATEGORIES } from '@/lib/baseScore';

// How BaseScore grows on the BasePath. The assessment answers are never changed;
// growth is added on top when the score is shown.
// - Every finished lesson adds to Financial Knowledge, plus the category its chapter teaches.
// - Every finished Money Move adds more to that chapter's category (real action counts most).
// - Growth per category is capped so the assessment still matters.
export const LESSON_POINTS = 2;
export const MOVE_POINTS = 5;
export const GROWTH_CAP = 40;

const TOPIC_CATEGORY = {
  budgeting: 'score_income_debt',
  debt: 'score_income_debt',
  saving: 'score_preparedness',
  taxes: 'score_preparedness',
  insurance: 'score_preparedness',
  credit: 'score_credit_health',
  investing: 'score_risk_appetite',
  retirement: 'score_risk_appetite',
};

const chapterOfUnit = new Map(CHAPTERS.flatMap((c) => c.units.map((u) => [String(u), c])));
const chapterOfMove = new Map(CHAPTERS.filter((c) => c.move).map((c) => [c.move.key, c]));

export function progressBoosts(progress = [], moves = []) {
  const boosts = {};
  const add = (key, n) => { if (key) boosts[key] = (boosts[key] || 0) + n; };
  new Set(progress.filter((p) => p.completed).map((p) => String(p.module_id))).forEach((unitId) => {
    add('score_financial_knowledge', LESSON_POINTS);
    add(TOPIC_CATEGORY[chapterOfUnit.get(unitId)?.topic], LESSON_POINTS);
  });
  new Set(moves.map((m) => m.move_key)).forEach((key) => {
    add(TOPIC_CATEGORY[chapterOfMove.get(key)?.topic], MOVE_POINTS);
  });
  Object.keys(boosts).forEach((k) => { boosts[k] = Math.min(GROWTH_CAP, boosts[k]); });
  return boosts;
}

/** Returns stats with BasePath growth applied. `score_gained` and `score_growth` explain the change. */
export function applyBasePathProgress(stats, progress, moves) {
  if (!stats || stats.base_score == null) return stats;
  const boosts = progressBoosts(progress, moves);
  const out = { ...stats, assessment_score: stats.base_score, score_growth: {} };
  let gained = 0;
  SCORE_CATEGORIES.forEach(({ key }) => {
    const start = stats[key];
    const boost = boosts[key] || 0;
    if (start == null && !boost) return;
    const next = Math.min(100, (start ?? 0) + boost);
    out[key] = next;
    out.score_growth[key] = next - (start ?? 0);
    gained += next - (start ?? 0);
  });
  out.base_score = Math.min(MAX_SCORE, stats.base_score + gained);
  out.score_gained = out.base_score - stats.base_score;
  return out;
}