export const CATEGORY_COLORS = {
  food_dining: '#2EA0FD', shopping: '#F5A623', transportation: '#2BF9E9',
  entertainment: '#c084fc', bills_utilities: '#f87171', health: '#34D399',
  travel: '#38BDF8', education: '#A78BFA', income: '#2EFD7A',
  transfers: '#94A3B8', other: '#6B7280',
};

export const CATEGORY_LABELS = {
  food_dining: 'Food & Dining', shopping: 'Shopping', transportation: 'Transportation',
  entertainment: 'Entertainment', bills_utilities: 'Bills & Utilities', health: 'Health',
  travel: 'Travel', education: 'Education', income: 'Income',
  transfers: 'Transfers', other: 'Other',
};

const MX_CATEGORY_MAP = {
  'Food & Dining': 'food_dining', 'Restaurants': 'food_dining', 'Groceries': 'food_dining',
  'Shopping': 'shopping', 'Clothing': 'shopping',
  'Transportation': 'transportation', 'Gas & Fuel': 'transportation', 'Auto': 'transportation',
  'Entertainment': 'entertainment',
  'Bills & Utilities': 'bills_utilities', 'Utilities': 'bills_utilities',
  'Health & Fitness': 'health', 'Healthcare': 'health',
  'Travel': 'travel', 'Hotels': 'travel', 'Airlines': 'travel',
  'Education': 'education',
  'Income': 'income', 'Paycheck': 'income', 'Transfer': 'transfers',
};

function mapMxCategory(mxCategory) {
  if (!mxCategory) return 'other';
  for (const [key, val] of Object.entries(MX_CATEGORY_MAP)) {
    if (mxCategory.includes(key)) return val;
  }
  return 'other';
}

export function normalizeMxTransaction(tx) {
  return {
    id: tx.guid,
    description: tx.description || tx.original_description || '',
    merchant_name: tx.merchant_name || '',
    amount: Math.abs(tx.amount),
    is_income: tx.type === 'CREDIT',
    date: tx.date ? tx.date.slice(0, 10) : '',
    category: mapMxCategory(tx.category),
  };
}

export function detectRecurring(transactions) {
  const groups = {};
  transactions.filter(tx => !tx.is_income).forEach(tx => {
    const key = (tx.merchant_name || tx.description || '').toLowerCase().trim();
    if (!key) return;
    if (!groups[key]) groups[key] = [];
    groups[key].push(tx);
  });
  return Object.entries(groups)
    .filter(([, txs]) => txs.length >= 2)
    .map(([name, txs]) => {
      const avg = txs.reduce((s, t) => s + Math.abs(t.amount), 0) / txs.length;
      return { name: txs[0].merchant_name || txs[0].description || name, avg, count: txs.length, category: txs[0].category };
    })
    .sort((a, b) => b.avg - a.avg)
    .slice(0, 10);
}

const DAY = 86400000;
const toTime = (d) => new Date(`${d}T12:00:00`).getTime();

/** Income / spend totals over the most recent 90 days of activity, plus daily averages. */
export function summarize(txs) {
  const dated = txs.filter(t => t.date);
  if (!dated.length) return { income: 0, spent: 0, days: 1, dailyIncome: 0, dailySpend: 0 };
  const latest = Math.max(...dated.map(t => toTime(t.date)));
  const recent = dated.filter(t => toTime(t.date) > latest - 90 * DAY);
  const earliest = Math.min(...recent.map(t => toTime(t.date)));
  const days = Math.max(7, Math.round((latest - earliest) / DAY) + 1);
  const income = recent.filter(t => t.is_income).reduce((s, t) => s + t.amount, 0);
  const spent = recent.filter(t => !t.is_income).reduce((s, t) => s + t.amount, 0);
  return { income, spent, days, dailyIncome: income / days, dailySpend: spent / days };
}

export function weeklyCashflow(txs, weeks = 8) {
  const dated = txs.filter(t => t.date);
  if (!dated.length) return [];
  const latest = Math.max(...dated.map(t => toTime(t.date)));
  return Array.from({ length: weeks }, (_, i) => {
    const end = latest - (weeks - 1 - i) * 7 * DAY;
    const start = end - 7 * DAY;
    const inWeek = dated.filter(t => toTime(t.date) > start && toTime(t.date) <= end);
    return {
      label: new Date(end).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      income: Math.round(inWeek.filter(t => t.is_income).reduce((s, t) => s + t.amount, 0)),
      spent: Math.round(inWeek.filter(t => !t.is_income).reduce((s, t) => s + t.amount, 0)),
    };
  });
}

export const SAMPLE_BALANCE = 6420;

/** Deterministic sample activity so the page has something to explore before a bank is linked. */
export function buildSampleTransactions() {
  const out = [];
  const today = Date.now();
  for (let d = 0; d < 84; d++) {
    const date = new Date(today - d * DAY);
    const iso = date.toISOString().slice(0, 10);
    const dom = date.getDate();
    const wobble = (d * 37) % 17;
    const add = (name, amount, category, is_income = false) =>
      out.push({ id: `s-${d}-${name}`, description: name, merchant_name: name, amount, is_income, date: iso, category });
    if (d % 14 === 3) add('Paycheck', 2400, 'income', true);
    if (dom === 1) add('Rent', 1450, 'bills_utilities');
    if (dom === 5) add('Netflix', 15.49, 'entertainment');
    if (dom === 8) add('Spotify', 10.99, 'entertainment');
    if (dom === 12) add('Gym Membership', 45, 'health');
    if (d % 3 === 0) add('Whole Foods', 55 + wobble, 'food_dining');
    if (d % 2 === 1) add('Local Coffee & Lunch', 18 + (wobble % 9), 'food_dining');
    if (d % 4 === 2) add('Uber', 22 + wobble, 'transportation');
    if (d % 9 === 6) add('Target', 60 + wobble * 2, 'shopping');
  }
  return out;
}