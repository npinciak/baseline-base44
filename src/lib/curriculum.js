// BasePath curriculum: chapters reference CMS lesson units by the id of their opening text card.
// Each unit keeps its CMS point → question → takeaway cadence. Order here is the learning order.
export const CHAPTERS = [
  { id: 'money-in', title: 'Money In', topic: 'budgeting', units: [34, 40, 37, 175],
    move: { key: 'find-take-home', title: 'Find your monthly take-home pay', detail: 'Check your income and note what actually lands in your account each month.', tool: 'overview' } },
  { id: 'money-out', title: 'Money Out', topic: 'budgeting', units: [43, 46, 49, 169],
    move: { key: 'list-fixed-bills', title: 'List your fixed bills', detail: 'Review your recurring charges and confirm which ones hit every month.', tool: 'recurring' } },
  { id: 'needs-wants', title: 'Needs vs. Wants', topic: 'budgeting', units: [187, 28, 190, 193],
    move: { key: 'spot-a-want', title: "Spot one want in last month's spending", detail: 'Open your spending breakdown and pick one purchase that was a want, not a need.', tool: 'spending' } },
  { id: 'build-budget', title: 'Build Your Budget', topic: 'budgeting', units: [25, 31, 172],
    move: { key: 'sort-50-30-20', title: 'Sort your spending into 50/30/20', detail: 'Compare your needs, wants and savings against the 50/30/20 split.', tool: 'spending' } },
  { id: 'banking', title: 'Banking Basics', topic: 'saving', units: [100, 103, 106, 94],
    move: { key: 'connect-bank', title: 'Connect your bank account', detail: 'Link your checking or savings account so your real numbers show up.', tool: 'overview' } },
  { id: 'goals', title: 'Setting Goals', topic: 'saving', units: [19, 22, 16],
    move: { key: 'create-goal', title: 'Create your first savings goal', detail: 'Pick something you want and give it a target amount and date.', tool: 'goals' } },
  { id: 'saving-smart', title: 'Saving Smart', topic: 'saving', units: [178, 181, 184],
    move: { key: 'first-deposit', title: 'Make a deposit toward your goal', detail: 'Move any amount, even $5, into savings and log it on your goal.', tool: 'goals' } },
  { id: 'growth', title: 'Interest & Growth', topic: 'investing', units: [91, 97, 79],
    move: { key: 'try-scenario', title: 'Run a "what if" forecast', detail: 'Shift your spending in the forecast and see how your future balance changes.', tool: 'forecast' } },
  { id: 'credit-101', title: 'Credit 101', topic: 'credit', units: [52, 58, 196, 208],
    move: { key: 'credit-rules', title: 'Write your personal credit rules', detail: "Write down when you will, and won't, use credit." } },
  { id: 'debt', title: 'Interest & Debt', topic: 'debt', units: [55, 61, 160],
    move: { key: 'true-cost', title: 'Find the true cost of buying on credit', detail: 'Pick something you want and work out what it costs at 20% APR paid over a year.' } },
  { id: 'credit-score', title: 'Credit Scores', topic: 'credit', units: [64, 67, 70, 115],
    move: { key: 'check-basescore', title: 'Check your BaseScore', detail: 'See where you stand today and which area to work on first.', tool: 'profile' } },
  { id: 'score-deep-dive', title: 'Your Score, Up Close', topic: 'credit', units: [109, 112, 199, 202],
    move: { key: 'check-utilization', title: 'Check your credit utilization', detail: 'If you have a card, divide the balance by the limit. Aim for under 30%.', tool: 'networth' } },
  { id: 'building-credit', title: 'Building Credit', topic: 'credit', units: [205, 211, 214],
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

// Advanced Money tools: unlock after the chapter's lessons AND its money move are done.
// Tools not listed here are always available.
export const MONEY_TOOLS = {
  calendar: { label: 'Financial Calendar', chapter: 'money-out', blurb: 'See every bill and paycheck on a calendar, with your projected balance each day.' },
  cashflow: { label: 'Cashflow Map', chapter: 'build-budget', blurb: 'Watch your income flow into needs, wants and savings.' },
  networth: { label: 'Net Worth Breakdown', chapter: 'banking', blurb: 'See all your accounts together: what you own and what you owe.' },
  forecast: { label: 'Forecast & Scenarios', chapter: 'saving-smart', blurb: 'Project your future balance and test "what if" spending changes.' },
};

export const TOOL_LINKS = {
  overview: '/money#overview', recurring: '/money#recurring', spending: '/money#spending',
  networth: '/money#networth', forecast: '/money#forecast', calendar: '/money#calendar',
  goals: '/goals', profile: '/profile',
};

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
    const chapter = {
      ...c, number: i + 1, modules: units, lessonsDone, comingSoon: units.length === 0,
      learned: units.length > 0 && lessonsDone === units.length,
      moveDone: !!c.move && moveSet.has(c.move.key),
      unlocked: prev ? prev.unlocked && prev.lessonsDone > 0 : true,
    };
    if (!chapter.comingSoon) prev = chapter;
    return chapter;
  });
}

export const orderedModules = (chapters) => chapters.flatMap((c) => c.modules);

export function toolAccess(key, chapters) {
  const tool = MONEY_TOOLS[key];
  const chapter = chapters.find((c) => c.id === tool.chapter);
  return { ...tool, chapter, unlocked: !!chapter && chapter.learned && chapter.moveDone };
}