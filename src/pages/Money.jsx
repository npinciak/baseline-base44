import { useState, useEffect, useMemo, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Sparkles } from 'lucide-react';
import BankBalanceSection from '@/components/money/BankBalanceSection';
import GoalsBanner from '@/components/money/GoalsBanner';
import FinancialCalendar from '@/components/FinancialCalendar';
import AmbientBackdrop from '@/components/dashboard/AmbientBackdrop';
import ForecastChart from '@/components/money/ForecastChart';
import SpendingTool from '@/components/money/SpendingTool';
import CashflowBars from '@/components/money/CashflowBars';
import BalanceTool from '@/components/money/BalanceTool';
import TransactionList from '@/components/money/TransactionList';
import ConnectedOverview from '@/components/money/ConnectedOverview';
import SankeyCashflow from '@/components/money/SankeyCashflow';
import AssetsBreakdown, { SAMPLE_ACCOUNTS } from '@/components/money/AssetsBreakdown';
import RecurringList from '@/components/money/RecurringList';
import LockedToolCard from '@/components/money/LockedToolCard';
import { toolAccess } from '@/lib/curriculum';
import MoneySection from '@/components/money/MoneySection';
import ToolGrid from '@/components/money/ToolGrid';
import useLearningState from '@/hooks/useLearningState';
import useUserStats from '@/hooks/useUserStats';
import CreditScoreTool from '@/components/money/CreditScoreTool';
import MoneyCoach from '@/components/coach/MoneyCoach';
import SmartSuggestions from '@/components/goal/SmartSuggestions';
import useCategoryOverrides from '@/hooks/useCategoryOverrides';

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
  const learning = useLearningState();
  const { stats, loading: statsLoading } = useUserStats();
  const location = useLocation();

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

  const ready = !loading && !learning.loading && !statsLoading;
  useEffect(() => {
    if (ready && location.hash) {
      setTimeout(() => document.getElementById(location.hash.slice(1))?.scrollIntoView({ behavior: 'smooth' }), 300);
    }
  }, [ready, location.hash]);

  const isSample = transactions.length === 0;
  const sample = useMemo(() => buildSampleTransactions(), []);
  const overrides = useCategoryOverrides();
  const txs = useMemo(() => {
    if (isSample) return sample;
    const map = Object.fromEntries(overrides.active.map(o => [o.transaction_id, o.new_category]));
    return transactions.map(t => (map[t.id] ? { ...t, category: map[t.id], original_category: t.category } : t));
  }, [isSample, sample, transactions, overrides.active]);
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

  if (!ready) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="w-8 h-8 border-4 border-white/10 border-t-[#2EFD7A] rounded-full animate-spin" />
      </div>
    );
  }

  const bankingChapter = learning.chapters.find(c => c.id === 'banking');
  const bankUnlocked = Boolean(learning.isAdmin) || Boolean(bankingChapter?.learned);
  const shownAccounts = isSample ? SAMPLE_ACCOUNTS : accounts;
  const balanceTool = { key: 'balance', node: <BalanceTool balance={balance} accountCount={shownAccounts.length} />, access: toolAccess('balance', learning.chapters, learning.isAdmin) };
  const transactionsTool = { key: 'transactions', node: <TransactionList transactions={txs} />, access: toolAccess('transactions', learning.chapters, learning.isAdmin) };
  const tools = [
    { key: 'forecast', node: <ForecastChart startBalance={balance} dailyIncome={summary.dailyIncome} dailySpend={summary.dailySpend} isAdmin={learning.isAdmin} /> },
    { key: 'spending', node: <SpendingTool categoryList={categoryList} grandTotal={grandTotal} expenses={expenses} /> },
    { key: 'cashflow', node: <CashflowBars weeks={weeks} /> },
    { key: 'money_flow', node: <SankeyCashflow txs={txs} /> },
    { key: 'recurring', node: <RecurringList recurring={recurring} /> },
    { key: 'credit_score', node: <CreditScoreTool accounts={shownAccounts} creditHealth={stats?.score_credit_health ?? null} /> },
    { key: 'calendar', node: (
      <FinancialCalendar balance={isSample || accounts.length ? balance : null} txs={txs} isSample={isSample} />
    ) },
    { key: 'networth', node: <AssetsBreakdown accounts={shownAccounts} /> },
    { key: 'coach', node: <MoneyCoach txs={txs} isSample={isSample} overrides={overrides} /> },
    { key: 'strategies', node: <SmartSuggestions showFit={false} panel /> },
  ].map(t => ({ ...t, access: toolAccess(t.key, learning.chapters, learning.isAdmin) }));

  return (
    <div className="relative min-h-screen bg-black px-4 py-8 overflow-hidden">
      <AmbientBackdrop />
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="relative z-10 w-full min-w-0 max-w-6xl mx-auto space-y-6">
        <motion.div variants={itemVariants} className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-white mb-1">Money Hub</h1>
            <p className="text-white/60">See where your money is going, and where it could take you.</p>
          </div>
        </motion.div>

        {isSample && <motion.div variants={itemVariants}>
          <BankBalanceSection connected={false} balance={balance} accountCount={accounts.length} locked={!bankUnlocked} onConnected={load} />
        </motion.div>}

        <GoalsBanner learning={learning} />

        <motion.div variants={itemVariants}>
          <ConnectedOverview balanceTool={balanceTool} transactionsTool={transactionsTool} onCompleteMove={learning.completeMove} />
        </motion.div>



        {isSample && (
          <motion.div variants={itemVariants} className="flex flex-wrap items-center justify-between gap-4 px-5 py-4 bg-[#2EFD7A]/10 border border-[#2EFD7A]/30 rounded-2xl">
            <div className="flex items-center gap-3 text-sm text-white">
              <Sparkles className="w-5 h-5 text-[#2EFD7A] shrink-0" />
              <span>
                You're exploring <strong>sample data</strong>.{' '}
                {bankUnlocked
                  ? 'Link your bank to see your real numbers and future.'
                  : 'Finish the Banking Basics lessons on BasePath to unlock bank linking.'}
              </span>
            </div>
          </motion.div>
        )}


        <motion.div variants={itemVariants}>
          <div id="tools" className="scroll-mt-6">
            <ToolGrid tools={tools} render={t => (t.access.unlocked ? t.node
              : <LockedToolCard toolKey={t.key} access={t.access} onCompleteMove={learning.completeMove} />)} />
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}