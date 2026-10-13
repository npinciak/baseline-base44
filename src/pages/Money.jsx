import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Sparkles } from 'lucide-react';
import ConnectBankButton from '@/components/ConnectBankButton';
import FinancialCalendar from '@/components/FinancialCalendar';
import AmbientBackdrop from '@/components/dashboard/AmbientBackdrop';
import ForecastChart from '@/components/money/ForecastChart';
import SpendingDonut from '@/components/money/SpendingDonut';
import CashflowBars from '@/components/money/CashflowBars';
import MoneyKpis from '@/components/money/MoneyKpis';
import SankeyCashflow from '@/components/money/SankeyCashflow';
import AssetsBreakdown, { SAMPLE_ACCOUNTS } from '@/components/money/AssetsBreakdown';
import CategoryList from '@/components/money/CategoryList';
import RecurringList from '@/components/money/RecurringList';
import TransactionList from '@/components/money/TransactionList';
import {
  CATEGORY_COLORS, CATEGORY_LABELS, normalizeMxTransaction, detectRecurring,
  summarize, weeklyCashflow, buildSampleTransactions, SAMPLE_BALANCE,
} from '@/lib/moneyData';

const LIABILITIES = ['credit_card', 'loan', 'mortgage', 'line_of_credit'];

function netBalance(accounts) {
  return accounts.reduce((sum, a) => {
    const type = (a.account_type || a.type || '').toLowerCase().replace(/\s/g, '_');
    const bal = a.balance ?? a.available_balance ?? 0;
    return sum + (LIABILITIES.includes(type) ? -Math.abs(bal) : bal);
  }, 0);
}

const containerVariants = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 22 } },
};

export default function Money() {
  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const [txRes, acctRes] = await Promise.all([
      base44.functions.invoke('getMxTransactions', {}).catch(() => null),
      base44.functions.invoke('getMxAccounts', {}).catch(() => null),
    ]);
    setTransactions((txRes?.data?.transactions || []).map(normalizeMxTransaction));
    setAccounts(acctRes?.data?.accounts || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const isSample = transactions.length === 0;
  const sample = useMemo(() => buildSampleTransactions(), []);
  const txs = isSample ? sample : transactions;
  const balance = isSample ? SAMPLE_BALANCE : netBalance(accounts);

  const summary = useMemo(() => summarize(txs), [txs]);
  const weeks = useMemo(() => weeklyCashflow(txs), [txs]);
  const recurring = useMemo(() => detectRecurring(txs), [txs]);
  const expenses = useMemo(() => txs.filter(tx => !tx.is_income), [txs]);
  const categoryList = useMemo(() => {
    const totals = {};
    expenses.forEach(tx => { totals[tx.category] = (totals[tx.category] || 0) + Math.abs(tx.amount); });
    return Object.entries(totals)
      .map(([cat, total]) => ({ cat, total, label: CATEGORY_LABELS[cat] || cat, color: CATEGORY_COLORS[cat] || '#6B7280' }))
      .sort((a, b) => b.total - a.total);
  }, [expenses]);
  const grandTotal = categoryList.reduce((s, c) => s + c.total, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="w-8 h-8 border-4 border-white/10 border-t-[#2EA0FD] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-black px-4 py-8 overflow-hidden">
      <AmbientBackdrop />
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="relative z-10 max-w-6xl mx-auto space-y-6">
        <motion.div variants={itemVariants} className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-white mb-1">Mission Control</h1>
            <p className="text-white/60">See where your money is going, and where it could take you.</p>
          </div>
          {!isSample && <ConnectBankButton onConnected={load} />}
        </motion.div>

        {isSample && (
          <motion.div variants={itemVariants} className="flex flex-wrap items-center justify-between gap-4 px-5 py-4 bg-[#2EA0FD]/10 border border-[#2EA0FD]/30 rounded-2xl">
            <div className="flex items-center gap-3 text-sm text-white">
              <Sparkles className="w-5 h-5 text-[#2EA0FD] shrink-0" />
              <span>You're exploring <strong>sample data</strong>. Link your bank to see your real numbers and future.</span>
            </div>
            <ConnectBankButton onConnected={load} />
          </motion.div>
        )}

        <motion.div variants={itemVariants}>
          <MoneyKpis balance={balance} income={summary.income} spent={summary.spent} days={summary.days} />
        </motion.div>

        <motion.div variants={itemVariants}>
          <ForecastChart startBalance={balance} dailyIncome={summary.dailyIncome} dailySpend={summary.dailySpend} />
        </motion.div>

        <motion.div variants={itemVariants}>
          <SankeyCashflow txs={txs} />
        </motion.div>

        <motion.div variants={itemVariants}>
          <AssetsBreakdown accounts={isSample ? SAMPLE_ACCOUNTS : accounts} />
        </motion.div>

        <motion.div variants={itemVariants} className="grid lg:grid-cols-2 gap-6">
          <SpendingDonut categoryList={categoryList} total={grandTotal} />
          <CashflowBars weeks={weeks} />
        </motion.div>

        <motion.div variants={itemVariants}>
          <FinancialCalendar balance={isSample || accounts.length ? balance : null} txs={txs} isSample={isSample} />
        </motion.div>

        <motion.div variants={itemVariants} className="grid lg:grid-cols-2 gap-6 items-start">
          <CategoryList categoryList={categoryList} grandTotal={grandTotal} expenses={expenses} />
          <RecurringList recurring={recurring} />
        </motion.div>

        <motion.div variants={itemVariants}>
          <TransactionList transactions={txs} />
        </motion.div>
      </motion.div>
    </div>
  );
}