import { addDays, differenceInCalendarDays, format } from 'date-fns';

export const FREQUENCIES = [
  { value: 'weekly', label: 'Weekly', unit: 'week', days: 7 },
  { value: 'biweekly', label: 'Every 2 weeks', unit: 'paycheck', days: 14 },
  { value: 'monthly', label: 'Monthly', unit: 'month', days: 30.44 },
];

export const freqOf = (value) => FREQUENCIES.find(f => f.value === value) || FREQUENCIES[2];

export const money = (n) => `$${Math.round(n).toLocaleString()}`;

/** Projects when the goal is reached with a given contribution, and what it takes to hit the target date. */
export function projectPlan({ saved, target, targetDate, amount, frequency }) {
  const f = freqOf(frequency);
  const remaining = Math.max(0, target - saved);
  const periods = amount > 0 ? Math.ceil(remaining / amount) : null;
  const finish = periods !== null ? addDays(new Date(), periods * f.days) : null;
  const deadline = targetDate ? new Date(`${targetDate}T00:00:00`) : null;
  const daysLeft = deadline ? differenceInCalendarDays(deadline, new Date()) : null;
  const periodsLeft = daysLeft !== null ? Math.max(1, Math.floor(daysLeft / f.days)) : null;
  const needed = periodsLeft ? Math.ceil(remaining / periodsLeft) : null;
  const onTrack = finish && deadline ? finish <= deadline : null;
  return {
    f, remaining, periods, needed, onTrack, daysLeft,
    finishLabel: finish ? format(finish, 'MMM d, yyyy') : null,
    deadlineLabel: deadline ? format(deadline, 'MMM d, yyyy') : null,
    perDay: amount > 0 ? amount / f.days : 0,
  };
}