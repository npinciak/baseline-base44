import { useMemo, useState } from 'react';
import { ShieldCheck, Search, Layers, BookOpen, Coins, CheckCircle2 } from 'lucide-react';
import { CHAPTERS } from '@/lib/curriculum';
import { ANTI_REDUNDANCY_RULES, ROADMAP_STAGES, getRoadmapMetrics } from '@/lib/curriculumRoadmap';
import RoadmapChapterCard from '@/components/roadmap/RoadmapChapterCard';

const TOPICS = ['all', 'taxes', 'budgeting', 'saving', 'debt', 'credit', 'investing', 'insurance', 'retirement'];

export default function CurriculumRoadmapView() {
  const [stageFilter, setStageFilter] = useState('all');
  const [topicFilter, setTopicFilter] = useState('all');
  const [query, setQuery] = useState('');
  const metrics = useMemo(() => getRoadmapMetrics(), []);

  const filteredStages = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ROADMAP_STAGES
      .filter((st) => stageFilter === 'all' || st.id === stageFilter)
      .map((st) => ({
        ...st,
        chapters: st.chapters.filter((ch) => {
          if (topicFilter !== 'all' && ch.topic !== topicFilter) return false;
          if (!q) return true;
          return (
            ch.title.toLowerCase().includes(q) ||
            ch.boundaryNote.toLowerCase().includes(q) ||
            ch.prerequisiteTitle.toLowerCase().includes(q) ||
            ch.units.some((u) => u.toLowerCase().includes(q))
          );
        }),
      }))
      .filter((st) => st.chapters.length > 0);
  }, [stageFilter, topicFilter, query]);

  return (
    <div className="space-y-8">
      {/* Measured Baseline -> 3x Expansion Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <p className="text-xs text-white/50 flex items-center gap-1.5"><Layers className="w-3.5 h-3.5 text-[#2EA0FD]" /> Live Today</p>
          <p className="text-2xl font-display font-extrabold text-white mt-1">{metrics.existingChapters} ch · {metrics.existingLessons} lessons</p>
          <p className="text-[11px] text-white/45 mt-0.5">Preserved 100% intact with tool unlocks</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <p className="text-xs text-white/50 flex items-center gap-1.5"><BookOpen className="w-3.5 h-3.5 text-[#2EFD7A]" /> Net-New Addition</p>
          <p className="text-2xl font-display font-extrabold text-[#2EFD7A] mt-1">+{metrics.newChapters} ch · +{metrics.newLessons} lessons</p>
          <p className="text-[11px] text-white/45 mt-0.5">Across 4 sequenced mastery stages</p>
        </div>
        <div className="rounded-2xl border border-[#2EFD7A]/30 bg-[#2EFD7A]/[0.06] p-4">
          <p className="text-xs text-[#2EFD7A] font-semibold flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" /> 3x Target Coverage</p>
          <p className="text-2xl font-display font-extrabold text-white mt-1">{metrics.totalChapters} ch · {metrics.totalLessons} lessons</p>
          <p className="text-[11px] text-white/60 mt-0.5">{metrics.expansionMultiple}x measured lesson depth</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <p className="text-xs text-white/50 flex items-center gap-1.5"><Coins className="w-3.5 h-3.5 text-[#2EA0FD]" /> BaseCoin Capacity</p>
          <p className="text-2xl font-display font-extrabold text-white mt-1">{metrics.totalCoins.toLocaleString()} BC</p>
          <p className="text-[11px] text-white/45 mt-0.5">Up from {metrics.existingCoins.toLocaleString()} BC today</p>
        </div>
      </div>

      {/* Existing 19-Chapter Coverage Baseline Strip */}
      <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-5">
        <p className="text-[11px] uppercase tracking-[0.2em] text-white/50 font-semibold mb-2">
          Audited Foundation (Chapters 1–{CHAPTERS.length} · Kept Intact as Prerequisites)
        </p>
        <div className="flex flex-wrap gap-1.5">
          {CHAPTERS.map((ch, i) => (
            <span
              key={ch.id}
              className="text-xs px-2.5 py-1 rounded-lg bg-black/50 border border-white/10 text-white/75"
            >
              <strong className="text-[#2EFD7A] mr-1">{i + 1}.</strong>
              {ch.title} <span className="text-white/40">({ch.units.length})</span>
            </span>
          ))}
        </div>
      </div>

      {/* Anti-Redundancy Charter */}
      <div className="rounded-3xl border border-[#2EA0FD]/25 bg-gradient-to-br from-[#2EA0FD]/[0.08] to-transparent p-5 sm:p-6">
        <p className="text-xs font-bold uppercase tracking-wider text-[#2EA0FD] flex items-center gap-1.5 mb-3">
          <ShieldCheck className="w-4 h-4" /> Anti-Redundancy Guardrails
        </p>
        <div className="grid sm:grid-cols-2 gap-3">
          {ANTI_REDUNDANCY_RULES.map((rule) => (
            <div key={rule.title} className="rounded-2xl bg-black/45 border border-white/10 p-3.5">
              <p className="text-sm font-bold text-white">{rule.title}</p>
              <p className="text-xs text-white/65 mt-1 leading-relaxed">{rule.detail}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setStageFilter('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                stageFilter === 'all' ? 'bg-[#2EFD7A] text-black' : 'bg-white/[0.05] text-white/70 hover:text-white'
              }`}
            >
              All 4 Stages ({metrics.newChapters})
            </button>
            {ROADMAP_STAGES.map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => setStageFilter(st.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                  stageFilter === st.id ? 'bg-[#2EFD7A] text-black' : 'bg-white/[0.05] text-white/70 hover:text-white'
                }`}
              >
                Stage {st.number} ({st.chapters.length})
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search topics, taxes, HSA, lease..."
              className="w-full bg-white/[0.04] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-white/40 outline-none focus:border-[#2EFD7A]"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {TOPICS.map((topic) => (
            <button
              key={topic}
              type="button"
              onClick={() => setTopicFilter(topic)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium capitalize transition-colors ${
                topicFilter === topic
                  ? 'bg-[#2EA0FD]/20 text-[#2EA0FD] border border-[#2EA0FD]/40'
                  : 'bg-white/[0.03] text-white/55 border border-white/10 hover:text-white'
              }`}
            >
              {topic === 'all' ? 'All topics' : topic}
            </button>
          ))}
        </div>
      </div>

      {/* Staged Chapters */}
      {filteredStages.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center text-sm text-white/60">
          No planned chapters match that filter. Try clearing the search or topic filter.
        </div>
      ) : (
        <div className="space-y-10">
          {filteredStages.map((stage) => (
            <section key={stage.id} className="space-y-4">
              <div className="border-l-2 border-[#2EFD7A] pl-4">
                <p className="text-xs font-bold uppercase tracking-widest text-[#2EFD7A]">
                  Stage {stage.number} · {stage.chapters.length} Chapters · {stage.chapters.reduce((s, c) => s + c.units.length, 0)} Lessons
                </p>
                <h3 className="text-xl sm:text-2xl font-display font-extrabold text-white mt-0.5">{stage.title}</h3>
                <p className="text-sm text-white/70 mt-1">{stage.subtitle}</p>
                <p className="text-xs text-white/50 mt-1.5 max-w-3xl">
                  <strong className="text-white/75">Why this stage exists:</strong> {stage.rationale}
                </p>
              </div>

              <div className="space-y-3">
                {stage.chapters.map((ch, idx) => (
                  <RoadmapChapterCard key={ch.id} chapter={ch} stageNumber={stage.number} indexInStage={idx} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}