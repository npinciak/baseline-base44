// Educational strategies only. No rates, offers or product endorsements.
export const SUGGESTION_CATEGORIES = [
  { key: 'saving', label: 'Saving' },
  { key: 'automating', label: 'Automating' },
  { key: 'financing', label: 'Financing' },
  { key: 'growing', label: 'Growing' },
];

export const SUGGESTIONS = [
  { id: 'hysa', category: 'saving', icon: 'PiggyBank', horizon: 'short', name: 'High-yield savings account', tagline: 'Keep goal money separate and earning interest.',
    why: 'Online banks and credit unions often pay more interest than a typical checking account, and your money stays easy to reach. Deposits are usually FDIC or NCUA insured up to legal limits.',
    note: 'Rates are variable and can change at any time.' },
  { id: 'cd', category: 'saving', icon: 'Lock', horizon: 'short', name: 'Certificate of deposit (CD)', tagline: 'Lock money away until your goal date.',
    why: 'A CD holds your money for a set term at a set rate. If your target date is fixed, matching the CD term to it can stop you from dipping into the savings early.',
    note: 'Withdrawing before the term ends usually costs a penalty.' },
  { id: 'mma', category: 'saving', icon: 'Landmark', horizon: 'short', name: 'Money market account', tagline: 'Savings with a little more flexibility.',
    why: 'Money market accounts combine savings-style interest with some checking features, like a debit card or limited checks, which helps if you will pay for the goal directly.',
    note: 'Some require a minimum balance to avoid fees.' },
  { id: 'tbills', category: 'saving', icon: 'Building2', horizon: 'short', name: 'Treasury bills', tagline: 'Short-term loans to the U.S. government.',
    why: 'T-bills mature in a year or less and are backed by the U.S. government. They can be a fit for money you will need within a set window.',
    note: 'Bought through TreasuryDirect or a brokerage account.' },
  { id: 'auto-transfer', category: 'automating', icon: 'Repeat', horizon: 'any', name: 'Payday auto-transfer', tagline: 'Save before you have a chance to spend.',
    why: 'Scheduling a transfer for the day your paycheck lands turns your savings plan into a habit you do not have to remember. Match it to the rhythm in your plan above.',
    note: 'Leave a buffer in checking so bills still clear.' },
  { id: 'roundups', category: 'automating', icon: 'Coins', horizon: 'any', name: 'Round-up savings', tagline: 'Spare change adds up quietly.',
    why: 'Many banks can round each card purchase up to the next dollar and move the difference to savings. It is a small, painless boost on top of your main plan.',
    note: 'Round-ups alone usually move slowly, so treat them as extra.' },
  { id: 'split-deposit', category: 'automating', icon: 'SplitSquareHorizontal', horizon: 'any', name: 'Split direct deposit', tagline: 'Send part of each paycheck straight to savings.',
    why: 'Most employers let you split direct deposit across accounts. The goal money never touches your spending account.',
    note: 'Ask your HR or payroll portal how to set it up.' },
  { id: 'preapproval', category: 'financing', icon: 'Car', horizon: 'any', fits: ['newCar'], name: 'Loan pre-approval', tagline: 'Know your budget before you shop.',
    why: 'If you will finance part of a car, getting pre-approved by a bank or credit union shows the rate you qualify for and gives you leverage against dealer financing.',
    note: 'A bigger down payment from this goal can mean a smaller loan.' },
  { id: 'credit-builder', category: 'financing', icon: 'CreditCard', horizon: 'any', fits: ['newCar', 'buyHome'], name: 'Credit-building card', tagline: 'Better credit can mean cheaper borrowing.',
    why: 'A secured or starter card used for small purchases and paid in full each month builds payment history, which affects the rates you are offered later.',
    note: 'Carrying a balance costs interest and can hurt your score.' },
  { id: 'index-funds', category: 'growing', icon: 'TrendingUp', horizon: 'long', name: 'Broad index funds', tagline: 'For goals five or more years away.',
    why: 'Index funds spread money across many companies. Over long periods markets have tended to grow, which can help long-term goals, but values rise and fall along the way.',
    note: 'You can lose money. Not a fit for cash you need soon.' },
  { id: 'roth', category: 'growing', icon: 'Sprout', horizon: 'long', name: 'Roth IRA', tagline: 'Tax-advantaged growth for the long run.',
    why: 'A Roth IRA is a retirement account where qualified withdrawals are tax-free. Some first-time homebuyer rules allow limited early use of earnings.',
    note: 'Income limits and withdrawal rules apply.' },
  { id: 'match', category: 'growing', icon: 'Briefcase', horizon: 'long', name: 'Employer 401(k) match', tagline: 'Free money many people leave behind.',
    why: 'If your employer matches retirement contributions, contributing enough to get the full match is one of the strongest ways to grow your money.',
    note: 'Meant for retirement. Early withdrawals have penalties.' },
];

// Partner referral destinations, configured per strategy id once a partnership is signed.
// Example: hysa: { partner: 'Partner Bank', url: 'https://partner.example/baseline' }
// Strategies without an entry show "Partner coming soon" instead of a link.
export const PARTNER_REFERRALS = {};

export function isGoodFit(s, goalType, monthsLeft) {
  if (s.fits?.includes(goalType)) return true;
  if (s.horizon === 'short') return monthsLeft == null || monthsLeft <= 36;
  if (s.horizon === 'long') return monthsLeft != null && monthsLeft >= 60;
  return false;
}