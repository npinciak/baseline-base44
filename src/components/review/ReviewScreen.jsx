const TYPE_STYLE = { text: 'bg-[#2EA0FD]/15 text-[#2EA0FD]', quiz: 'bg-[#2EFD7A]/15 text-[#2EFD7A]', flashcard: 'bg-white/10 text-white/70' };

const Html = ({ html }) => html ? <div className="prose prose-invert prose-sm max-w-none text-white/75" dangerouslySetInnerHTML={{ __html: html }} /> : null;

export default function ReviewScreen({ screen, index }) {
  return (
    <div className="border-t border-white/[0.06] py-3 space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-white/30 text-xs tabular-nums w-5">{index + 1}</span>
        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${TYPE_STYLE[screen.lesson_type] || TYPE_STYLE.text}`}>{screen.content_type || screen.lesson_type}</span>
        <p className="text-white text-sm font-medium truncate">{screen.title}</p>
        <span className="ml-auto text-white/25 text-[10px]">#{screen.id}</span>
      </div>
      <div className="pl-7 space-y-2">
        <Html html={screen.text_content} />
        <Html html={screen.question_prompt} />
        {screen.options?.length > 0 && (
          <ul className="space-y-1">
            {screen.options.map((label, i) => {
              const correct = label === screen.correct_answer;
              return <li key={i} className={`text-xs px-3 py-1.5 rounded-lg ${correct ? 'bg-[#2EFD7A]/15 text-[#2EFD7A] font-semibold' : 'bg-white/[0.04] text-white/60'}`}>{label}{correct && ' ✓'}</li>;
            })}
          </ul>
        )}
        {!screen.options?.length && screen.correct_answer && <p className="text-xs text-[#2EFD7A]">Answer: {String(screen.correct_answer)}</p>}
        {screen.explanation && <div className="text-xs border-l-2 border-white/10 pl-3"><Html html={screen.explanation} /></div>}
        <Html html={screen.takeaway_text} />
      </div>
    </div>
  );
}