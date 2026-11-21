import { Compass, Sparkles, CalendarRange, Users } from "lucide-react";

const PILLARS = [
  { Icon: Compass, title: "BasePath", body: "Bite-sized lessons and real Money Moves that unlock tools as you go." },
  { Icon: Sparkles, title: "BaseScore™", body: "One 0 to 500 score for knowledge, preparedness, debt balance and credit health." },
  { Icon: CalendarRange, title: "Forecasting", body: "A flight search for your money. Test bills, goals and paychecks before they happen." },
  { Icon: Users, title: "Families", body: "Learners earn BaseCoins for good habits. Parents coach milestones alongside them." },
];

export default function AboutPillars() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
      {PILLARS.map(({ Icon, title, body }) => (
        <div
          key={title}
          className="group rounded-3xl border border-white/10 bg-white/[0.03] p-6 hover:border-[#2EFD7A]/50 transition-colors duration-300"
        >
          <Icon className="w-6 h-6 text-[#2EFD7A] mb-4 transition-transform duration-300 group-hover:scale-110" />
          <h3 className="font-heading text-lg font-bold text-white mb-1.5">{title}</h3>
          <p className="text-white/60 text-sm leading-relaxed">{body}</p>
        </div>
      ))}
    </div>
  );
}