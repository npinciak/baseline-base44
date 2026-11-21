import { Flame, Coins, BookOpen, Trophy } from 'lucide-react';

export default function ProfileStats({ streak, bestStreak, walletBalance, lessonsDone }) {
  const items = [
    { icon: Flame, label: 'Day streak', value: streak, color: 'text-[#2EFD7A]' },
    { icon: Trophy, label: 'Best streak', value: bestStreak, color: 'text-[#2EFD7A]' },
    { icon: BookOpen, label: 'Lessons done', value: lessonsDone, color: 'text-[#2EA0FD]' },
    { icon: Coins, label: 'Spendable BC', value: walletBalance, color: 'text-[#2EA0FD]' },
  ];
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-px mt-6 rounded-2xl overflow-hidden bg-white/10">
      {items.map(({ icon: Icon, label, value, color }) => (
        <div key={label} className="bg-black/70 px-4 py-3.5 flex items-center gap-3">
          <Icon className={`w-5 h-5 shrink-0 ${color}`} />
          <div>
            <p className="text-xl font-display font-extrabold text-white tabular-nums leading-tight">{(value || 0).toLocaleString()}</p>
            <p className="text-[11px] text-white/50">{label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}