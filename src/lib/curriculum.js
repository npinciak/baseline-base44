// BasePath curriculum: chapters reference CMS lesson units by the id of their opening text card.
// Each unit keeps its CMS point → question → takeaway cadence. Order here is the learning order.
export const CHAPTERS = [
  { id: 'money-in', title: 'Money In', topic: 'budgeting', units: [34, 40, 37, 'bl-paycheck'],
    move: { key: 'create-emergency-fund', title: 'Set up your emergency fund', detail: 'Create a savings goal for unexpected expenses on Money. Choose a target and start building your cushion.', tool: 'goals' } },
  { id: 'money-out', title: 'Money Out', topic: 'budgeting', units: [43, 46, 49, 169],
    move: { key: 'list-fixed-bills', title: 'List your fixed bills', detail: 'Review your recurring charges and confirm which ones hit every month.', tool: 'recurring' } },
  { id: 'needs-wants', title: 'Needs vs. Wants', topic: 'budgeting', units: [187, 28, 190, 193],
    move: { key: 'spot-a-want', title: "Spot one want in last month's spending", detail: 'Open your spending breakdown and pick one purchase that was a want, not a need.', tool: 'spending' } },
  { id: 'build-budget', title: 'Build Your Budget', topic: 'budgeting', units: [25, 31, 172, 175],
    move: { key: 'sort-50-30-20', title: 'Sort your spending into 50/30/20', detail: 'Compare your needs, wants and savings against the 50/30/20 split.', tool: 'spending' } },
  { id: 'banking', title: 'Banking Basics', topic: 'saving', units: [100, 103, 106, 94],
    move: { key: 'connect-bank', title: 'Connect your bank account', detail: 'Link your checking or savings account so your real numbers show up.', tool: 'overview' } },
  { id: 'goals', title: 'Setting Goals', topic: 'saving', units: [19, 22, 16],
    move: { key: 'create-goal', title: 'Create your first savings goal', detail: 'Pick something you want and give it a target amount and date.', tool: 'goals' } },
  { id: 'saving-smart', title: 'Saving Smart', topic: 'saving', units: [178, 'bl-insurance', 181, 184],
    move: { key: 'first-deposit', title: 'Make a deposit toward your goal', detail: 'Move any amount, even $5, into savings and log it on your goal.', tool: 'goals' } },
  { id: 'growth', title: 'Interest & Growth', topic: 'investing', units: [91, 97, 79, 'bl-retirement'],
    move: { key: 'try-scenario', title: 'Run a "what if" forecast', detail: 'Shift your spending in the forecast and see how your future balance changes.', tool: 'forecast' } },
  { id: 'credit-101', title: 'Credit 101', topic: 'credit', units: [52, 58, 196, 208],
    move: { key: 'credit-rules', title: 'Write your personal credit rules', detail: "Write down when you will, and won't, use credit." } },
  { id: 'debt', title: 'Interest & Debt', topic: 'debt', units: [55, 61, 160],
    move: { key: 'true-cost', title: 'Find the true cost of buying on credit', detail: 'Pick something you want and work out what it costs at 20% APR paid over a year.' } },
  { id: 'credit-score', title: 'Credit Scores', topic: 'credit', units: [64, 67, 70, 115],
    move: { key: 'check-basescore', title: 'Check your BaseScore', detail: 'See where you stand today and which area to work on first.', tool: 'profile' } },
  { id: 'score-deep-dive', title: 'Your Score, Up Close', topic: 'credit', units: [109, 112, 199, 202],
    move: { key: 'check-utilization', title: 'Check your credit utilization', detail: 'If you have a card, divide the balance by the limit. Aim for under 30%.', tool: 'credit_score' } },
  { id: 'building-credit', title: 'Building Credit', topic: 'credit', units: [205, 211, 214, 'bl-identity'],
    move: { key: 'starter-credit-plan', title: 'Choose a starter credit plan', detail: 'Decide which first step fits you: authorized user, secured card, or student card.' } },
  { id: 'investing-basics', title: 'Investing Basics', topic: 'investing', units: [73, 76, 118, 121],
    move: { key: 'pick-a-company', title: 'Pick a company you would want to own', detail: 'Choose a company you use every week and look up whether it pays a dividend.' } },
  { id: 'investing-strategies', title: 'Investing Strategies', topic: 'investing', units: [82, 85, 88, 124],
    move: { key: 'choose-style', title: 'Choose your investing style', detail: 'Decide whether active or passive investing fits you better, and write down why.' } },
  { id: 'buying-car', title: 'Buying a Car', topic: 'debt', units: [154, 157, 163, 166],
    move: { key: 'price-a-car', title: 'Price a car by its total cost', detail: 'Pick a car and add up price, insurance, gas and interest for one year.' } },
  { id: 'home-basics', title: 'Home Basics', topic: 'saving', units: [127, 130, 133],
    move: { key: 'rent-vs-own', title: 'Compare renting and owning', detail: 'Look up rent and a home price near you and compare the monthly costs.' } },
  { id: 'home-budget', title: 'Home Buying Budget', topic: 'saving', units: [136, 139, 142],
    move: { key: 'home-budget', title: 'Estimate a home price you could afford', detail: 'Use the 28% rule on a future salary to estimate a price range.' } },
  { id: 'home-closing', title: 'Offer to Closing', topic: 'saving', units: [145, 148, 151],
    move: { key: 'closing-checklist', title: 'Make a closing-day checklist', detail: 'List every cost and step between making an offer and getting the keys.' } },
];

// Money tools: unlock once the chapter's money move is done (which requires its lessons).
// Tools without a chapter are always available. `group` drives the inventory on the Money page.
export const MONEY_TOOLS = {
  goals: { label: 'Savings Goals', group: 'plan', chapter: 'money-in', decision: 'keep', blurb: 'Build your emergency fund. Additional goals require a subscription.', audit: 'Free: one emergency fund. Paid: additional goals. Initial setup is the chapter money move, not an early tool unlock.' },
  recurring: { label: 'Recurring Bills', group: 'track', chapter: 'money-out', decision: 'keep', blurb: 'Spot the charges that repeat every month.', audit: 'Confirm repeating charges against bank statements. Detection is an estimate, not a confirmed bill schedule.' },
  spending: { label: 'Spending Breakdown', group: 'track', chapter: 'needs-wants', decision: 'keep', blurb: 'Understand where your money goes, category by category.', audit: 'Apply Needs vs. Wants. Categorization needs review; a spending chart is not a budget.' },
  calendar: { label: 'Calendar & Forecast', group: 'plan', chapter: 'saving-smart', decision: 'keep', blurb: 'Plan bill dates, paydays and savings, then explore your future balance.', audit: 'Unlock after Saving Smart and its deposit money move. Forecasts are sandbox estimates, never changes to bank history.' },
  cashflow: { label: 'Cashflow', group: 'track', chapter: 'build-budget', decision: 'review', blurb: 'Compare money coming in and going out over time.', audit: 'Owner decision pending: retain the income-versus-outgo time view, or combine it with Calendar. Category flow overlaps Spending Breakdown.' },
  networth: { label: 'Net Worth', group: 'grow', chapter: 'banking', decision: 'review', blurb: 'Compare assets and liabilities across your accounts.', audit: 'Owner decision pending: improve or retire. It is not a credit-utilization destination.' },
  knowledge: { label: 'Financial Knowledge', group: 'score', chapter: null, decision: 'keep', blurb: 'Track learning progress and return to your next lesson.', audit: 'Informational learning summary, not a gated financial tool.' },
  debt_ratio: { label: 'Income-to-Debt Ratio', group: 'score', chapter: 'debt', decision: 'review', blurb: 'Compare monthly debt payments with income.', audit: 'Owner decision pending: improve or include this supporting metric in Debt Payoff Planner.' },
  credit_score: { label: 'Credit Score', group: 'score', chapter: 'credit-score', decision: 'keep', blurb: 'Understand credit health, utilization and score factors.', audit: 'Keep separate from BaseScore. No bureau score should be implied without an actual credit-report source.' },
  risk: { label: 'Risk Appetite', group: 'grow', chapter: 'investing-basics', decision: 'removed', blurb: 'Removed from Money tools.', audit: 'Rejected by owner. Historical assessment data is preserved; no standalone Risk Appetite tool.' },
  budget_builder: { label: 'Budget Builder', group: 'plan', chapter: 'build-budget', decision: 'planned', blurb: 'Turn needs, wants and savings lessons into a spending plan.', audit: 'Candidate only: set category limits, compare planned versus actual, and choose a realistic savings amount. Not implemented.' },
  debt_payoff: { label: 'Debt Payoff Planner', group: 'plan', chapter: 'debt', decision: 'planned', blurb: 'Apply interest lessons to a debt repayment plan.', audit: 'Candidate only: balances, APRs, minimum payments, snowball versus avalanche, payoff date and total interest. Not implemented.' },
  investment_planning: { label: 'Investment Planning', group: 'grow', chapter: 'investing-strategies', decision: 'planned', blurb: 'Apply compounding and diversification to a long-term plan.', audit: 'Candidate only: contribution, horizon and return scenarios, with clear uncertainty. No trading or personalized investment advice. Not implemented.' },
};

export const TOOL_GROUPS = [
  { key: 'track', label: 'Track' },
  { key: 'plan', label: 'Plan' },
  { key: 'grow', label: 'Grow' },
  { key: 'score', label: 'Score' },
];

export const TOOL_LINKS = {
  overview: '/money#overview', recurring: '/money#recurring', spending: '/money#spending',
  networth: '/money#networth', forecast: '/money#calendar', calendar: '/money#calendar',
  goals: '/money#goals', profile: '/basescore', credit_score: '/money#credit_score',
  debt_ratio: '/money#debt_ratio', risk: '/money#risk', knowledge: '/money#knowledge',
};

/** First incomplete lesson in the furthest unlocked chapter, or null when caught up. */
export function nextLesson(chapters) {
  for (const c of chapters) {
    if (!c.unlocked) break;
    const m = c.modules.find((x) => !x.completed);
    if (m) return m;
  }
  return null;
}

export function buildChapters(modules, progress, moves) {
  const byId = Object.fromEntries(modules.map((m) => [m.id, m]));
  const done = new Set(progress.filter((p) => p.completed).map((p) => p.lesson_id));
  const moveSet = new Set(moves.map((m) => m.move_key));
  const mapped = new Set(CHAPTERS.flatMap((c) => c.units.map(String)));
  const extra = modules.filter((m) => !mapped.has(m.id));
  const defs = extra.length
    ? [...CHAPTERS, { id: 'new-lessons', title: 'New Lessons', topic: 'saving', units: extra.map((m) => m.id), move: null }]
    : CHAPTERS;

  let prev = null;
  return defs.map((c, i) => {
    const units = c.units.map((u) => byId[String(u)]).filter(Boolean).map((m) => ({
      ...m, topic_tag: c.topic, completed: m.lessons.length > 0 && m.lessons.every((l) => done.has(l.id)),
    }));
    const lessonsDone = units.filter((u) => u.completed).length;
    const allUnitsPresent = units.length === c.units.length;
    const chapter = {
      ...c, number: i + 1, modules: units, lessonsDone, comingSoon: units.length === 0,
      learned: allUnitsPresent && units.length > 0 && lessonsDone === units.length,
      moveDone: !!c.move && moveSet.has(c.move.key),
      legacyTakeHomeDone: c.id === 'money-in' && moveSet.has('find-take-home'),
      unlocked: prev ? prev.unlocked && prev.learned && (!prev.move || prev.moveDone) : true,
    };
    prev = chapter;
    return chapter;
  });
}

export const orderedModules = (chapters) => chapters.flatMap((c) => c.modules);

export function toolAccess(key, chapters) {
  const tool = MONEY_TOOLS[key];
  if (!tool.chapter) return { ...tool, chapter: null, unlocked: true };
  const chapter = chapters.find((c) => c.id === tool.chapter);
  return { ...tool, chapter, unlocked: tool.decision !== 'removed' && tool.decision !== 'planned' && !!chapter && chapter.unlocked && chapter.learned && chapter.moveDone };
}