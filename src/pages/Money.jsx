import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import {
  Wallet, ChevronDown, ChevronUp,
  Repeat, Tag, AlertCircle
} from 'lucide-react';
import ConnectBankButton from '@/components/ConnectBankButton';
import FinancialCalendar from '@/components/FinancialCalendar';
import AmbientBackdrop from '@/components/dashboard/AmbientBackdrop';

const CATEGORY_COLORS = {
  food_dining: '#2EFD7A', shopping: '#F5A623', transportation: '#2BF9E9',
  entertainment: '#c084fc', bills_utilities: '#f87171', health: '#34D399',
  travel: '#38BDF8', education: '#A78BFA', income: '#2EFD7A',
  transfers: '#94A3B8', other: '#6B7280',
};

const CATEGORY_LABELS = {
  food_dining: 'Food & Dining', shopping: 'Shopping', transportation: 'Transportation',
  entertainment: 'Entertainment', bills_utilities: 'Bills & Utilities', health: 'Health',
  travel: 'Travel', education: 'Education', income: 'Income',
  transfers: 'Transfers', other: 'Other',
};

function detectRecurring(transactions) {
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
function normalizeMxTransaction(tx) {
  return {
    id: tx.guid,
    description: tx.description || tx.original_description || '',
    merchant_name: tx.merchant_name || '',
    amount: Math.abs(tx.amount),
    is_income: tx.type === 'CREDIT',
    date: tx.date ? tx.date.slice(0, 10) : '',
    category: mapMxCategory(tx.category),
    _source: 'mx',
  };
}

const containerVariants = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 22 } },
};

export default function Money() {
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [mxError, setMxError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [txFilter, setTxFilter] = useState('all');
  const [expandedCategory, setExpandedCategory] = useState(null);

  useEffect(() => {
    const init = async () => {
      const u = await base44.auth.me();
      setUser(u);

      const res = await base44.functions.invoke('getMxTransactions', {}).catch(() => null);
      if (res?.data?.transactions) {
        setTransactions(res.data.transactions.map(normalizeMxTransaction));
      } else if (res?.data?.error === 'No MX bank connection found') {
        setMxError('No MX bank connection found. Connect your bank to see transactions.');
      } else if (!res) {
        setMxError('Could not load MX transactions');
      }
      setLoading(false);
    };
    init().catch(() => setLoading(false));
  }, []);

  const expenses = transactions.filter(tx => !tx.is_income);
  const categoryTotals = {};
  expenses.forEach(tx => {
    categoryTotals[tx.category] = (categoryTotals[tx.category] || 0) + Math.abs(tx.amount);
  });
  const categoryList = Object.entries(categoryTotals)
    .map(([cat, total]) => ({ cat, total, label: CATEGORY_LABELS[cat] || cat, color: CATEGORY_COLORS[cat] || '#6B7280' }))
    .sort((a, b) => b.total - a.total);
  const grandTotal = categoryList.reduce((s, c) => s + c.total, 0);

  const recurring = detectRecurring(transactions);

  const filteredTxs = transactions.filter(tx => {
    if (txFilter === 'income') return tx.is_income;
    if (txFilter === 'expenses') return !tx.is_income;
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="w-8 h-8 border-4 border-white/10 border-t-[#2EFD7A] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-black px-4 py-8 overflow-hidden">
      <AmbientBackdrop />
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="relative z-10 max-w-3xl mx-auto space-y-8"
      >
        <motion.div variants={itemVariants}>
          <h1 className="text-3xl font-display font-extrabold text-white mb-1">Money</h1>
          <p className="text-white/60">Your full financial picture</p>
        </motion.div>

        <motion.div variants={itemVariants}>
          <FinancialCalendar />
        </motion.div>

        {mxError && (
          <motion.div variants={itemVariants} className="flex flex-col gap-3 px-4 py-4 bg-amber-500/10 border border-amber-500/25 rounded-2xl text-sm text-amber-400">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{mxError}</span>
            </div>
            <ConnectBankButton onConnected={() => window.location.reload()} />
          </motion.div>
        )}

        {/* Categories */}
        <motion.section variants={itemVariants}>
          <h2 className="text-lg font-heading font-bold mb-4 flex items-center gap-2 text-white">
            <Tag className="w-5 h-5 text-[#2EFD7A]" /> Categories
          </h2>
          {categoryList.length === 0 ? (
            <div className="bg-white/[0.03] border border-dashed border-white/10 rounded-2xl p-8 text-center text-white/50 text-sm">
              No expense data yet
            </div>
          ) : (
            <div className="bg-white/[0.03] border border-white/10 backdrop-blur-sm rounded-2xl overflow-hidden divide-y divide-white/10">
              {categoryList.map(({ cat, total, label, color }) => {
                const pct = grandTotal > 0 ? (total / grandTotal) * 100 : 0;
                const isExpanded = expandedCategory === cat;
                const catTxs = expenses.filter(tx => tx.category === cat);
                return (
                  <div key={cat}>
                    <button
                      onClick={() => setExpandedCategory(isExpanded ? null : cat)}
                      className="w-full flex items-center gap-4 px-5 py-4 hover:bg-white/[0.04] transition-colors text-left"
                    >
                      <div className="w-3 h-3 rounded-full shrink-0" style={{ background: color }} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-sm font-medium text-white">{label}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-white/50">{pct.toFixed(1)}%</span>
                            <span className="text-sm font-bold text-white">${total.toFixed(2)}</span>
                            {isExpanded ? <ChevronUp className="w-4 h-4 text-white/40" /> : <ChevronDown className="w-4 h-4 text-white/40" />}
                          </div>
                        </div>
                        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full rounded-full"
                            style={{ background: color }}
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.8, ease: 'easeOut' }}
                          />
                        </div>
                      </div>
                    </button>
                    {isExpanded && (
                      <div className="bg-white/[0.02] px-5 pb-3 space-y-2">
                        {catTxs.slice(0, 8).map(tx => (
                          <div key={tx.id} className="flex items-center justify-between py-1.5">
                            <div>
                              <p className="text-xs font-medium text-white/80">{tx.description || tx.merchant_name || 'Transaction'}</p>
                              <p className="text-xs text-white/40">{tx.date}</p>
                            </div>
                            <span className="text-xs font-semibold text-white/80">-${Math.abs(tx.amount).toFixed(2)}</span>
                          </div>
                        ))}
                        {catTxs.length > 8 && (
                          <p className="text-xs text-white/40 pb-1">+{catTxs.length - 8} more</p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </motion.section>

        {/* Recurring Expenses */}
        <motion.section variants={itemVariants}>
          <h2 className="text-lg font-heading font-bold mb-4 flex items-center gap-2 text-white">
            <Repeat className="w-5 h-5 text-[#2EFD7A]" /> Recurring Expenses
          </h2>
          {recurring.length === 0 ? (
            <div className="bg-white/[0.03] border border-dashed border-white/10 rounded-2xl p-8 text-center text-white/50 text-sm">
              No recurring expenses detected yet
            </div>
          ) : (
            <div className="bg-white/[0.03] border border-white/10 backdrop-blur-sm rounded-2xl overflow-hidden divide-y divide-white/10">
              {recurring.map(({ name, avg, count, category }) => (
                <div key={name} className="flex items-center gap-4 px-5 py-4">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${CATEGORY_COLORS[category] || '#6B7280'}22` }}>
                    <Repeat className="w-4 h-4" style={{ color: CATEGORY_COLORS[category] || '#6B7280' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate capitalize text-white">{name}</p>
                    <p className="text-xs text-white/40">{CATEGORY_LABELS[category]} · {count}x detected</p>
                  </div>
                  <span className="text-sm font-bold text-white">~${avg.toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}
        </motion.section>

        {/* All Transactions */}
        <motion.section variants={itemVariants}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-heading font-bold flex items-center gap-2 text-white">
              <Wallet className="w-5 h-5 text-[#2EFD7A]" /> All Transactions
            </h2>
            <div className="flex gap-1 bg-white/[0.05] rounded-xl p-1">
              {['all', 'expenses', 'income'].map(f => (
                <button
                  key={f}
                  onClick={() => setTxFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${txFilter === f ? 'bg-[#2EFD7A] text-black' : 'text-white/50 hover:text-white'}`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
          {filteredTxs.length === 0 ? (
            <div className="bg-white/[0.03] border border-dashed border-white/10 rounded-2xl p-8 text-center text-white/50 text-sm">
              No transactions found
            </div>
          ) : (
            <div className="bg-white/[0.03] border border-white/10 backdrop-blur-sm rounded-2xl overflow-hidden divide-y divide-white/10">
              {filteredTxs.map(tx => (
                <div key={tx.id} className="flex items-center gap-3 px-5 py-3.5">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: `${CATEGORY_COLORS[tx.category] || '#6B7280'}22` }}>
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: CATEGORY_COLORS[tx.category] || '#6B7280' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate text-white">{tx.description || tx.merchant_name || 'Transaction'}</p>
                    <p className="text-xs text-white/40">{CATEGORY_LABELS[tx.category]} · {tx.date}</p>
                  </div>
                  <span className={`text-sm font-semibold ${tx.is_income ? 'text-[#2EFD7A]' : 'text-white'}`}>
                    {tx.is_income ? '+' : '-'}${Math.abs(tx.amount).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </motion.section>
      </motion.div>
    </div>
  );
}