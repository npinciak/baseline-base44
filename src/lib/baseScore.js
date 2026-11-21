// BaseScore: five sub-scores (0-100 each) summing to an overall score out of 500.
// Each category points at the place in the app where a user can improve it.
export const MAX_SCORE = 500;

export const SCORE_CATEGORIES = [
  { key: 'score_financial_knowledge', label: 'Financial Knowledge', color: '#c084fc', action: 'Continue your next lesson' },
  { key: 'score_income_debt', label: 'Income to Debt Ratio', color: '#60a5fa', action: 'Check your income-to-debt ratio', href: '/money#cashflow' },
  { key: 'score_preparedness', label: 'Preparedness', color: '#facc15', action: 'Build your emergency fund', href: '/money#goals' },
  { key: 'score_risk_appetite', label: 'Risk Appetite', color: '#fb923c', action: 'Explore your risk profile', href: '/money#risk' },
  { key: 'score_credit_health', label: 'Credit Health', color: '#f472b6', action: 'Open your credit score', href: '/money#credit_score' },
];

export function standingFor(score) {
  const pct = score / MAX_SCORE;
  if (pct >= 0.7) return 'Excellent';
  if (pct >= 0.45) return 'Good Standing';
  if (pct >= 0.25) return 'Fair';
  return 'Needs Work';
}