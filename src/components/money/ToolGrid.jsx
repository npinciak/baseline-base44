// One layout for unlocked and locked tools, so both views keep identical widths.
export const WIDE_TOOLS = ['spending', 'calendar', 'cashflow', 'money_flow', 'coach', 'strategies', 'forecast', 'networth'];

export default function ToolGrid({ tools, render }) {
  return (
    <div className="grid lg:grid-cols-2 gap-6 items-stretch">
      {tools.map(t => (
        <div key={t.key} id={t.key} className={`scroll-mt-6 min-w-0 ${WIDE_TOOLS.includes(t.key) ? 'lg:col-span-2' : ''}`}>
          {render(t)}
        </div>
      ))}
    </div>
  );
}