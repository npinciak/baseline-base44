import { CATEGORY_LABELS } from '@/lib/moneyData';

const DAY = 86400000;
const toTime = (d) => new Date(`${d}T12:00:00`).getTime();
const money = (n) => `$${Math.round(Math.abs(n)).toLocaleString()}`;
const keyOf = (tx) => (tx.merchant_name || tx.description || '').toLowerCase().trim();
const label = (c) => CATEGORY_LABELS[c] || c;

// Merchant keywords → the category they almost always belong to.
const KEYWORDS = [
  [/uber|lyft|shell|exxon|chevron|bp |sunoco|parking|transit|mta|metro/, 'transportation'],
  [/netflix|spotify|hulu|disney|youtube tv|hbo|max\b|steam|playstation|xbox|ticketmaster|cinema|amc/, 'entertainment'],
  [/whole foods|trader joe|kroger|safeway|starbucks|dunkin|coffee|restaurant|cafe|pizza|chipotle|mcdonald|doordash|grubhub|din tai fung|sweetgreen/, 'food_dining'],
  [/amazon|target|walmart|best buy|ikea|nike|zara|h&m|etsy/, 'shopping'],
  [/cvs|walgreens|pharmacy|gym|fitness|planet fitness|dental|clinic|hospital/, 'health'],
  [/comcast|xfinity|verizon|at&t|t-mobile|electric|power|water|utility|rent|insurance|con ed|eversource/, 'bills_utilities'],
  [/airline|delta|united|jetblue|southwest|american air|hotel|marriott|hilton|airbnb|expedia/, 'travel'],
  [/tuition|university|college|coursera|udemy|bookstore|chegg/, 'education'],
  [/zelle|venmo|transfer|paypal transfer|from savings|to savings/, 'transfers'],
];

/** Rule-based cleanup suggestions. Nothing here changes a transaction. */
export function suggestCleanups(txs) {
  const out = [];
  const seen = new Set();
  const byMerchant = {};
  txs.filter(t => !t.is_income).forEach(t => { (byMerchant[keyOf(t)] ||= []).push(t); });

  txs.forEach(tx => {
    if (tx.is_income) return;
    const text = `${tx.merchant_name} ${tx.description}`.toLowerCase();
    const hit = KEYWORDS.find(([re]) => re.test(text));
    if (hit && hit[1] !== tx.category && !seen.has(tx.id)) {
      seen.add(tx.id);
      out.push({ id: `kw-${tx.id}`, kind: 'category', tx, suggested: hit[1], confidence: 'Likely',
        rationale: `"${tx.merchant_name || tx.description}" usually belongs in ${label(hit[1])}, but it's filed under ${label(tx.category)}.` });
    }
  });

  Object.values(byMerchant).forEach(list => {
    if (list.length < 3) return;
    const counts = list.reduce((m, t) => ({ ...m, [t.category]: (m[t.category] || 0) + 1 }), {});
    const [top, n] = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
    list.filter(t => t.category !== top && !seen.has(t.id)).forEach(tx => {
      seen.add(tx.id);
      out.push({ id: `mix-${tx.id}`, kind: 'category', tx, suggested: top, confidence: 'Possible',
        rationale: `${n} of ${list.length} charges from ${tx.merchant_name || tx.description} are in ${label(top)}. This one is in ${label(tx.category)}.` });
    });
  });

  txs.filter(t => t.is_income && t.category !== 'income' && byMerchant[keyOf(t)]).forEach(tx => {
    out.push({ id: `ref-${tx.id}`, kind: 'refund', tx,
      rationale: `A ${money(tx.amount)} credit from a merchant you usually pay. It's likely a refund, so it may be counted as income. Match it to the original purchase.` });
  });

  return out.slice(0, 20);
}

function between(txs, from, to) {
  return txs.filter(t => t.date && toTime(t.date) > from && toTime(t.date) <= to);
}

/** Compares the latest 30 days with the 30 before. Observed facts vs. estimates are labeled separately. */
export function findTrends(txs) {
  const dated = txs.filter(t => t.date);
  if (!dated.length) return { enough: false, items: [] };
  const latest = Math.max(...dated.map(t => toTime(t.date)));
  const earliest = Math.min(...dated.map(t => toTime(t.date)));
  if (latest - earliest < 45 * DAY) return { enough: false, items: [] };

  const now = between(dated, latest - 30 * DAY, latest);
  const prev = between(dated, latest - 60 * DAY, latest - 30 * DAY);
  const sum = (list, f) => list.filter(f).reduce((s, t) => s + t.amount, 0);
  const items = [];

  const cats = new Set(dated.filter(t => !t.is_income).map(t => t.category));
  cats.forEach(cat => {
    const a = sum(now, t => !t.is_income && t.category === cat);
    const b = sum(prev, t => !t.is_income && t.category === cat);
    const diff = a - b;
    if (b > 0 && Math.abs(diff) >= 40 && Math.abs(diff) / b >= 0.25) {
      const up = diff > 0;
      items.push({ id: `cat-${cat}`, tone: up ? 'warn' : 'good', category: cat,
        observed: `${label(cat)} spending ${up ? 'rose' : 'fell'} ${money(diff)} (${Math.round(Math.abs(diff) / b * 100)}%): ${money(a)} in the last 30 days vs ${money(b)} before.`,
        estimate: up ? `Returning to your earlier level would free about ${money(diff)} a month.` : `Keeping this up would leave about ${money(-diff)} more each month.`,
        evidence: now.filter(t => !t.is_income && t.category === cat).sort((x, y) => y.amount - x.amount).slice(0, 3) });
    }
  });

  const byMerchant = {};
  dated.filter(t => !t.is_income).sort((a, b) => toTime(a.date) - toTime(b.date)).forEach(t => { (byMerchant[keyOf(t)] ||= []).push(t); });
  Object.values(byMerchant).forEach(list => {
    if (list.length < 3) return;
    const last = list[list.length - 1];
    const before = list.slice(0, -1).reduce((s, t) => s + t.amount, 0) / (list.length - 1);
    if (before > 0 && last.amount > before * 1.1 && last.amount - before >= 2 && last.amount < before * 3) {
      items.push({ id: `price-${keyOf(last)}`, tone: 'warn', category: last.category,
        observed: `${last.merchant_name || last.description} charged ${money(last.amount)} on ${last.date}, up from about ${money(before)} before.`,
        estimate: `If it stays at this price, that's about ${money((last.amount - before) * 12)} more a year for a monthly charge.`,
        evidence: list.slice(-3).reverse() });
    }
  });

  const inc = sum(now, t => t.is_income);
  const out = sum(now, t => !t.is_income);
  if (inc > 0) {
    const rate = (inc - out) / inc;
    items.push({ id: 'rate', tone: rate >= 0.1 ? 'good' : 'warn',
      observed: `In the last 30 days ${money(inc)} came in and ${money(out)} went out.`,
      estimate: rate >= 0 ? `That's roughly a ${Math.round(rate * 100)}% savings rate.${rate < 0.1 ? ' Many people aim for 10-20%.' : ''}` : `You spent about ${money(out - inc)} more than you earned this month.`,
      evidence: [] });
  }

  return { enough: true, items: items.slice(0, 8) };
}

export function dataFreshness(txs) {
  const dated = txs.filter(t => t.date);
  if (!dated.length) return { latest: null, stale: true };
  const latest = Math.max(...dated.map(t => toTime(t.date)));
  return { latest: new Date(latest).toISOString().slice(0, 10), stale: Date.now() - latest > 7 * DAY };
}

/** Builds the smallest context that answers one question: summaries plus only matching transactions. */
export function buildQuestionContext(question, txs, focus) {
  const q = question.toLowerCase();
  const dated = txs.filter(t => t.date);
  const latest = dated.length ? Math.max(...dated.map(t => toTime(t.date))) : Date.now();
  const recent = between(dated, latest - 90 * DAY, latest);
  const months = [0, 1, 2].map(i => {
    const list = between(recent, latest - (i + 1) * 30 * DAY, latest - i * 30 * DAY);
    const byCat = {};
    list.filter(t => !t.is_income).forEach(t => { byCat[label(t.category)] = Math.round((byCat[label(t.category)] || 0) + t.amount); });
    return { period: `${i * 30}-${(i + 1) * 30} days ago`, income: Math.round(list.filter(t => t.is_income).reduce((s, t) => s + t.amount, 0)), spending_by_category: byCat };
  });

  const cats = Object.entries(CATEGORY_LABELS).filter(([k, v]) => q.includes(v.toLowerCase()) || q.includes(k.replace('_', ' '))).map(([k]) => k);
  const words = q.split(/[^a-z0-9&]+/).filter(w => w.length > 3);
  const matches = recent.filter(t => (focus?.txIds || []).includes(t.id) || (focus?.category && t.category === focus.category)
    || cats.includes(t.category) || words.some(w => keyOf(t).includes(w)));
  const pick = (matches.length ? matches : []).sort((a, b) => toTime(b.date) - toTime(a.date)).slice(0, 15)
    .map(t => ({ date: t.date, merchant: t.merchant_name || t.description, amount: t.amount, type: t.is_income ? 'in' : 'out', category: label(t.category) }));

  return { months, transactions: pick, latest_transaction: new Date(latest).toISOString().slice(0, 10), focus: focus?.label || null };
}

/** Sample-only messy entries so the coach has something to show before a bank is linked. */
export function addSampleMess(txs) {
  const d = (n) => new Date(Date.now() - n * DAY).toISOString().slice(0, 10);
  return [...txs,
    { id: 's-mess-1', description: 'UBER *TRIP', merchant_name: 'Uber', amount: 31, is_income: false, date: d(4), category: 'shopping' },
    { id: 's-mess-2', description: 'Starbucks', merchant_name: 'Starbucks', amount: 7.45, is_income: false, date: d(6), category: 'other' },
    { id: 's-mess-3', description: 'Target refund', merchant_name: 'Target', amount: 42, is_income: true, date: d(9), category: 'shopping' },
    { id: 's-mess-4', description: 'Netflix', merchant_name: 'Netflix', amount: 17.99, is_income: false, date: d(0), category: 'entertainment' },
  ];
}