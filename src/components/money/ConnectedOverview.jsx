import LockedToolCard from '@/components/money/LockedToolCard';

/** Total Balance + Recent Transactions row. Same spot and layout for every role; each cell locks on its own. */
export default function ConnectedOverview({ balanceTool, transactionsTool, onCompleteMove }) {
  const cell = (t) => (t.access.unlocked ? t.node : <LockedToolCard toolKey={t.key} access={t.access} onCompleteMove={onCompleteMove} />);
  return (
    <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] gap-6 items-stretch">
      <div id="balance" className="scroll-mt-6 min-w-0 h-full">{cell(balanceTool)}</div>
      <div id="transactions" className="scroll-mt-6 min-w-0">{cell(transactionsTool)}</div>
    </div>
  );
}