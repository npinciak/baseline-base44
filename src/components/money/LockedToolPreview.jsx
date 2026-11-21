import RecurringList from '@/components/money/RecurringList';
import SpendingDonut from '@/components/money/SpendingDonut';
import CategoryList from '@/components/money/CategoryList';
import CashflowBars from '@/components/money/CashflowBars';
import SankeyCashflow from '@/components/money/SankeyCashflow';
import ForecastChart from '@/components/money/ForecastChart';
import AssetsBreakdown, { SAMPLE_ACCOUNTS } from '@/components/money/AssetsBreakdown';
import DebtRatioTool from '@/components/money/DebtRatioTool';
import CreditScoreTool from '@/components/money/CreditScoreTool';
import FinancialCalendar from '@/components/FinancialCalendar';
import { buildSampleTransactions, detectRecurring, summarize, weeklyCashflow, SAMPLE_BALANCE, CATEGORY_COLORS, CATEGORY_LABELS } from '@/lib/moneyData';

const sample = buildSampleTransactions();
const summary = summarize(sample);
const recurring = detectRecurring(sample);
const expenses = sample.filter(t => !t.is_income);
const totals = expenses.reduce((out, t) => ({ ...out, [t.category]: (out[t.category] || 0) + Math.abs(t.amount) }), {});
const categories = Object.entries(totals)
  .map(([cat, total]) => ({ cat, total, color: CATEGORY_COLORS[cat] || '#6B7280', label: CATEGORY_LABELS[cat] || cat }))
  .sort((a, b) => b.total - a.total);
const grandTotal = categories.reduce((s, c) => s + c.total, 0);

// Decorative sample content only: never render private financial data behind a blur.
// Mirrors the unlocked tool layouts on the Money page so the locked card keeps the same footprint.
export default function LockedToolPreview({ toolKey }) {
  switch (toolKey) {
    case 'recurring': return <RecurringList recurring={recurring} />;
    case 'spending': return (
      <div className="grid lg:grid-cols-2 gap-6">
        <SpendingDonut categoryList={categories} total={grandTotal} />
        <CategoryList categoryList={categories} grandTotal={grandTotal} expenses={expenses} />
      </div>
    );
    case 'cashflow': return <CashflowBars weeks={weeklyCashflow(sample)} />;
    case 'money_flow': return <SankeyCashflow txs={sample} />;
    case 'calendar': return <FinancialCalendar balance={SAMPLE_BALANCE} txs={sample} isSample readOnlyPreview />;
    case 'forecast': return <ForecastChart startBalance={SAMPLE_BALANCE} dailyIncome={summary.dailyIncome} dailySpend={summary.dailySpend} />;
    case 'networth': return <AssetsBreakdown accounts={SAMPLE_ACCOUNTS} />;
    case 'debt_ratio': return <DebtRatioTool accounts={SAMPLE_ACCOUNTS} summary={summary} recurring={recurring} />;
    case 'credit_score': return <CreditScoreTool accounts={SAMPLE_ACCOUNTS} creditHealth={66} />;
    default: return null;
  }
}