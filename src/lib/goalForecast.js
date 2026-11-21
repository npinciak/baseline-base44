import { addMonths, format } from 'date-fns';
import { freqOf } from '@/lib/goalPlan';

const MAX_MONTHS = 360;

/** Turns a saved plan contribution into a monthly amount. */
export const monthlyFromPlan = (plan) =>
  plan?.contribution_amount ? (plan.contribution_amount * 30.44) / freqOf(plan.frequency).days : 0;

/** Months until the goal is reached with monthly compounding; null if never within 30 years. */
export function monthsToTarget({ saved, target, monthly, rate }) {
  let bal = saved;
  for (let m = 0; m <= MAX_MONTHS; m++) {
    if (bal >= target) return m;
    bal = bal * (1 + rate / 100 / 12) + monthly;
  }
  return null;
}

export function balanceSeries({ saved, monthly, rate, months }) {
  const out = [saved];
  for (let m = 1; m <= months; m++) out.push(out[m - 1] * (1 + rate / 100 / 12) + monthly);
  return out;
}

export const monthLabel = (m) => format(addMonths(new Date(), m), 'MMM yyyy');
export const fullDate = (m) => format(addMonths(new Date(), m), 'MMM d, yyyy');