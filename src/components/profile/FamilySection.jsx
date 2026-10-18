import { Users } from 'lucide-react';

export default function FamilySection({ profile, user, lessonsThisWeek, topicTags, goal }) {
  const parentInitial = profile?.first_name?.[0] || user?.full_name?.[0] || 'P';
  const familyName = profile?.last_name ? `The ${profile.last_name} Family` : 'Your Family';
  const saved = goal?.current_amount || 0;
  const target = goal?.target_amount || 20000;
  const pct = Math.min(100, Math.round((saved / target) * 100));

  return (
    <div className="bg-white/[0.03] border border-white/10 backdrop-blur-sm rounded-3xl p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-white/60 text-xs font-light tracking-widest uppercase">For Parents · Family Dashboard</h3>
        <Users className="w-4 h-4 text-white/30" />
      </div>

      {/* Family card */}
      <div className="flex items-center gap-3 mb-5">
        <div className="flex -space-x-2">
          <div className="w-9 h-9 rounded-full bg-[#2EA0FD] border-2 border-black flex items-center justify-center text-xs font-bold text-black">{parentInitial}</div>
          <div className="w-9 h-9 rounded-full bg-[#2BF9E9] border-2 border-black flex items-center justify-center text-xs font-bold text-black">K</div>
        </div>
        <div>
          <p className="text-white text-sm font-bold">{familyName}</p>
          <p className="text-white/40 text-xs">Parent + 1 child</p>
        </div>
      </div>

      {/* Child progress */}
      <div className="bg-[#2EFD7A]/10 border border-[#2EFD7A]/30 rounded-2xl p-4 mb-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-7 h-7 rounded-full bg-[#2EFD7A] flex items-center justify-center text-[10px] font-bold text-black">K</div>
          <div>
            <p className="text-white text-sm font-bold">Kyle's Progress</p>
            <p className="text-[#2EFD7A] text-xs">{lessonsThisWeek} lesson{lessonsThisWeek === 1 ? '' : 's'} this week 🔥</p>
          </div>
        </div>
        <div className="flex gap-1.5">
          {(topicTags.length > 0 ? topicTags : ['Budget', 'Saving', 'Credit']).slice(0, 3).map((tag, i) => (
            <span key={tag} className={`text-[10px] px-2 py-0.5 rounded-full font-bold capitalize ${i === 0 ? 'bg-[#2EFD7A] text-black' : 'bg-white/10 text-white/50'}`}>{tag}</span>
          ))}
        </div>
      </div>

      {/* Parent nudge */}
      <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 mb-4">
        <p className="text-white/40 text-[10px] uppercase tracking-widest mb-1.5">Parent Nudge</p>
        <p className="text-white text-sm font-semibold mb-3">"Great job finishing this week's lessons! 🎉"</p>
        <div className="flex gap-2">
          <button className="flex-1 text-center py-2 rounded-lg bg-[#2EFD7A]/15 text-[#2EFD7A] text-xs font-bold hover:bg-[#2EFD7A]/25 transition-colors">Send Message</button>
          <button className="flex-1 text-center py-2 rounded-lg bg-white/10 text-white/60 text-xs font-bold hover:bg-white/15 transition-colors">Add Goal</button>
        </div>
      </div>

      {/* Shared goal */}
      <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 mb-5">
        <div className="flex justify-between items-center mb-1.5">
          <p className="text-white text-sm font-semibold">🎓 {goal?.name || 'College Fund'}</p>
          <span className="text-[#2EFD7A] text-xs font-bold">{pct}%</span>
        </div>
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-[#2EFD7A] rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
        </div>
        <p className="text-white/40 text-xs mt-1.5">${saved.toLocaleString()} of ${target.toLocaleString()}</p>
      </div>

      <button className="w-full py-3 rounded-full bg-white/10 hover:bg-white/15 text-white text-sm font-semibold transition-colors">
        Manage Family
      </button>
    </div>
  );
}