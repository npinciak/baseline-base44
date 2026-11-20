import { CHAPTERS } from '@/lib/curriculum';
import { LESSON_REWARD } from '@/lib/coinEconomy';

export const ANTI_REDUNDANCY_RULES = [
  {
    title: 'Student & Young-Adult First',
    detail: 'Prioritize campus, first-paycheck, renting, student loan, and starter-investing decisions before later-life milestones.',
  },
  {
    title: 'Short, Actionable Lessons',
    detail: 'Keep titles 2–4 words and walk through one concrete dollar example per lesson—no jargon walls.',
  },
  {
    title: 'Zero Duplicate Concepts',
    detail: 'Once a concept is taught in BasePath (Chapters 1–25), future chapters reference it and go straight to the new decision.',
  },
  {
    title: 'Publish Only When Ready',
    detail: 'Learners only see published chapters on BasePath; queued chapters below stay hidden until their lessons are live.',
  },
];

// Remaining developer backlog (non-overlapping with Chapters 1–25 already live on BasePath).
export const ROADMAP_STAGES = [
  {
    id: 'stage-1',
    number: 1,
    title: 'Campus, Gigs & Early Career Next',
    subtitle: 'Next wave of concise chapters for students, side hustlers, and recent grads.',
    rationale: 'Builds on the newly published Ch 20–25 student playbook with deeper paycheck, fee-defense, and roommate habits.',
    chapters: [
      {
        id: 'pay-raises',
        title: 'Raises & Negotiation',
        topic: 'budgeting',
        prerequisiteId: 'job-benefits',
        prerequisiteTitle: 'Ch 21 · First Job & Benefits',
        boundaryNote: 'Market pay bands, asking for a raise, and avoiding lifestyle creep.',
        moneyMove: 'Save 3 measurable wins and look up your role’s pay band.',
        units: ['Checking Real Market Pay', 'How to Ask for a Raise', 'Beating Lifestyle Creep'],
      },
      {
        id: 'banking-fees',
        title: 'Zero-Fee Banking & CDs',
        topic: 'saving',
        prerequisiteId: 'banking',
        prerequisiteTitle: 'Ch 5 · Banking Basics',
        boundaryNote: 'Turning off debit overdraft fees, T-bills/CDs for short-term cash, and wire safety.',
        moneyMove: 'Turn off debit overdraft coverage or set a low-balance alert.',
        units: ['Opting Out of Overdraft Fees', 'When CDs Beat Savings', 'Avoiding Wire & Transfer Traps'],
      },
      {
        id: 'shared-money',
        title: 'Roommates & Group Trips',
        topic: 'budgeting',
        prerequisiteId: 'renting-smart',
        prerequisiteTitle: 'Ch 23 · Renting Your Place',
        boundaryNote: 'Fair rent/utility splits, group travel budgets, and saying no without awkwardness.',
        moneyMove: 'Set a 3-rule shared-bill agreement with roommates or friends.',
        units: ['Splitting Rent & Bills Fairly', 'Group Trip Budgets', 'Scripts for Saying "Not in My Budget"'],
      },
      {
        id: 'bill-trimming',
        title: 'Lowering Monthly Bills',
        topic: 'budgeting',
        prerequisiteId: 'money-out',
        prerequisiteTitle: 'Ch 2 · Money Out',
        boundaryNote: 'Subscription audits, internet/phone retention scripts, and itemized medical bills.',
        moneyMove: 'Cancel one unused subscription or ask for a lower internet/phone rate.',
        units: ['The 10-Minute Subscription Audit', 'Scripts to Lower Phone & Wi-Fi', 'Checking Itemized Medical Bills'],
      },
    ],
  },
  {
    id: 'stage-2',
    number: 2,
    title: 'Everyday Ownership & Smart Spending',
    subtitle: 'Practical money rules for car ownership, travel, and launching a small hustle.',
    rationale: 'Covers post-purchase costs and side-business basics without repeating Ch 16 or Ch 20.',
    chapters: [
      {
        id: 'car-ownership',
        title: 'Owning a Car Smart',
        topic: 'insurance',
        prerequisiteId: 'buying-car',
        prerequisiteTitle: 'Ch 16 · Buying a Car',
        boundaryNote: 'Liability vs. collision coverage, refinancing high-APR auto loans, and repair vs. replace.',
        moneyMove: 'Compare 6-month auto insurance quotes and check liability limits.',
        units: ['Picking Auto Coverage Limits', 'Refinancing a High-APR Car Loan', 'When to Repair vs. Replace'],
      },
      {
        id: 'smart-travel',
        title: 'Smart Travel Money',
        topic: 'saving',
        prerequisiteId: 'needs-wants',
        prerequisiteTitle: 'Ch 3 · Needs vs. Wants',
        boundaryNote: '0% foreign transaction cards, declining terminal currency conversion, and valuing points.',
        moneyMove: 'Check whether your card charges a 3% foreign transaction fee.',
        units: ['Skipping 3% Foreign Fees', 'Always Pay in Local Currency', 'Using Points Without Overspending'],
      },
      {
        id: 'side-business',
        title: 'Lean Side Business',
        topic: 'budgeting',
        prerequisiteId: 'taxes-filing',
        prerequisiteTitle: 'Ch 20 · Taxes & Filing',
        boundaryNote: 'Separate business checking, pricing hourly/project work, and simple LLC basics.',
        moneyMove: 'Open a separate no-fee checking account for side-hustle cash.',
        units: ['Separating Side-Hustle Banking', 'Pricing Your Time Above W-2 Pay', 'Sole Proprietor vs. LLC Basics'],
      },
    ],
  },
  {
    id: 'stage-3',
    number: 3,
    title: 'Level-Two Investing',
    subtitle: 'Next-step investing topics once core index portfolios are running.',
    rationale: 'Extends Ch 14–15 and Ch 25 into bonds, capital gains, job-change rollovers, and target-date funds.',
    chapters: [
      {
        id: 'bonds-tbills',
        title: 'Bonds & Treasury Bills',
        topic: 'investing',
        prerequisiteId: 'smart-portfolios',
        prerequisiteTitle: 'Ch 25 · Smart Portfolios',
        boundaryNote: 'How bonds pay yield, state-tax-free T-bills, and money market funds.',
        moneyMove: 'Compare your savings APY with current 4-week T-bill yields.',
        units: ['How Bonds Pay Yield', 'State-Tax-Free Treasury Bills', 'Money Markets vs. Bank Savings'],
      },
      {
        id: 'rollovers-iras',
        title: '401(k) Rollovers & Roth Rules',
        topic: 'retirement',
        prerequisiteId: 'smart-portfolios',
        prerequisiteTitle: 'Ch 25 · Smart Portfolios',
        boundaryNote: 'Direct rollovers when switching jobs, Roth vs. Traditional math, and contribution withdrawal rules.',
        moneyMove: 'Confirm old workplace 401(k)s are rolled over or invested cleanly.',
        units: ['Switching Jobs: Direct Rollovers', 'Roth vs. Pre-Tax 401(k) Math', 'Roth Contribution Withdrawal Rules'],
      },
      {
        id: 'taxable-investing',
        title: 'Brokerage Taxes & Gains',
        topic: 'taxes',
        prerequisiteId: 'investing-basics',
        prerequisiteTitle: 'Ch 14 · Investing Basics',
        boundaryNote: '1-year line between short-term and long-term capital gains, dividends, and wash-sale basics.',
        moneyMove: 'Check your holding period before selling any investment.',
        units: ['Short-Term vs. Long-Term Gains', 'How Dividends Are Taxed', 'Avoiding the 30-Day Wash Sale'],
      },
    ],
  },
  {
    id: 'stage-4',
    number: 4,
    title: 'Later-Life Milestones',
    subtitle: 'Future chapters for couples, families, and long-term independence.',
    rationale: 'Held for later rollout so students aren’t overwhelmed early on.',
    chapters: [
      {
        id: 'couples-money',
        title: 'Couples & Shared Money',
        topic: 'budgeting',
        prerequisiteId: 'build-budget',
        prerequisiteTitle: 'Ch 4 · Build Your Budget',
        boundaryNote: 'Yours-Mine-Ours accounts, proportional bill splits, and monthly money check-ins.',
        moneyMove: 'Set a 20-minute monthly money check-in.',
        units: ['Yours-Mine-Ours Accounts', 'Fair Splits on Unequal Pay', 'Marriage & Individual Credit'],
      },
      {
        id: 'protecting-family',
        title: 'Beneficiaries, Life & 529s',
        topic: 'insurance',
        prerequisiteId: 'saving-smart',
        prerequisiteTitle: 'Ch 7 · Saving Smart',
        boundaryNote: 'Account beneficiaries, term vs. whole life insurance, and 529 education accounts.',
        moneyMove: 'Confirm a named beneficiary on your bank and retirement accounts.',
        units: ['Setting Account Beneficiaries', 'Term Life vs. Whole Life', '529 Plans & Roth Rollovers'],
      },
      {
        id: 'financial-independence',
        title: 'Work-Optional Math',
        topic: 'retirement',
        prerequisiteId: 'growth',
        prerequisiteTitle: 'Ch 8 · Interest & Growth',
        boundaryNote: 'Savings rate timelines, the 25× rule, and annual money checkups.',
        moneyMove: 'Multiply core annual expenses by 25 to see your long-term FI target.',
        units: ['The 25× Guideline', 'Why Savings Rate Wins Early', 'Your Annual Money Checkup'],
      },
    ],
  },
];

export function getRoadmapMetrics() {
  const existingChapters = CHAPTERS.length;
  const existingLessons = CHAPTERS.reduce((sum, ch) => sum + ch.units.length, 0);
  const newChapters = ROADMAP_STAGES.reduce((sum, st) => sum + st.chapters.length, 0);
  const newLessons = ROADMAP_STAGES.reduce(
    (sum, st) => sum + st.chapters.reduce((s, ch) => s + ch.units.length, 0),
    0
  );
  const totalChapters = existingChapters + newChapters;
  const totalLessons = existingLessons + newLessons;
  return {
    existingChapters,
    existingLessons,
    existingCoins: existingLessons * LESSON_REWARD,
    newChapters,
    newLessons,
    totalChapters,
    totalLessons,
    totalCoins: totalLessons * LESSON_REWARD,
    expansionMultiple: (totalLessons / 71).toFixed(1),
  };
}