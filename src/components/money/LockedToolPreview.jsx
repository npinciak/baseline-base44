import RecurringList from '@/components/money/RecurringList';
import SpendingDonut from '@/components/money/SpendingDonut';
import CashflowBars from '@/components/money/CashflowBars';
import AssetsBreakdown, { SAMPLE_ACCOUNTS } from '@/components/money/AssetsBreakdown';
import DebtRatioTool from '@/components/money/DebtRatioTool';
import CreditScoreTool from '@/components/money/CreditScoreTool';
import FinancialCalendar from '@/components/FinancialCalendar';
import { buildSampleTransactions, detectRecurring, summarize, weeklyCashflow, SAMPLE_BALANCE, CATEGORY_COLORS, CATEGORY_LABELS } from '@/lib/moneyData';

const sample = buildSampleTransactions();
const summary = summarize(sample);
const recurring = detectRecurring(sample);
const totals = sample.filter(t => !t.is_income).reduce((out, t) => ({ ...out, [t.category]: (out[t.category] || 0) + t.amount }), {});
const categories = Object.entries(totals).map(([cat, total]) => ({ cat, total, color: CATEGORY_COLORS[cat], label: CATEGORY_LABELS[cat] }));

// Decorative sample content only: never render private financial data behind a blur.
export default function LockedToolPreview({ toolKey }) {
  switch (toolKey) {
    case 'recurring': return <RecurringList recurring={recurring} />;
    case 'spending': return <SpendingDonut categoryList={categories} total={summary.spent} />;
    case 'cashflow': return <CashflowBars weeks={weeklyCashflow(sample)} />;
    case 'calendar': return <FinancialCalendar balance={SAMPLE_BALANCE} txs={sample} isSample readOnlyPreview />;
    case 'networth': return <AssetsBreakdown accounts={SAMPLE_ACCOUNTS} />;
    case 'debt_ratio': return <DebtRatioTool accounts={SAMPLE_ACCOUNTS} summary={summary} recurring={recurring} />;
    case 'credit_score': return <CreditScoreTool accounts={SAMPLE_ACCOUNTS} creditHealth={66} />;
    default: return null;
  }
}