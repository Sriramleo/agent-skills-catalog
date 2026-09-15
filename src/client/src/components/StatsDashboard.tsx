import {
  Sparkles,
  Bot,
  Zap,
  Tag,
  Layers,
  Terminal,
  FileCode,
  ShieldCheck,
  TrendingUp,
  Cpu,
  UserCheck
} from 'lucide-react';

interface StatsDashboardProps {
  catalog: SkillCatalogResult;
  onSelectCategory: (catId: string) => void;
  onSelectTag: (tag: string) => void;
  onSelectAuthor?: (author: string) => void;
}

export const StatsDashboard: React.FC<StatsDashboardProps> = ({
  catalog,
  onSelectCategory,
  onSelectTag,
  onSelectAuthor
}) => {
  const totalTokens = catalog.skills.reduce((acc, s) => acc + s.stats.tokenEstimate, 0);
  const avgTokens = catalog.skills.length > 0 ? Math.round(totalTokens / catalog.skills.length) : 0;
  const skillsWithAssets = catalog.skills.filter((s) => s.assets.length > 0).length;
  const skillsWithTriggers = catalog.skills.filter((s) => s.triggers.length > 0).length;

  return (
    <div className="space-y-6 animate-fade-in transition-colors">
      
      {/* Top Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="glass-card rounded-2xl p-5 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Skills</span>
            <div className="p-2 rounded-xl bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-500/20">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{catalog.totalSkills}</div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Across {catalog.harnesses.length} active harnesses</div>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Footprint</span>
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20">
              <Cpu className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-300 tracking-tight">
            ~{(totalTokens / 1000).toFixed(1)}k
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Tokens across catalog</div>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Avg Skill Tokens</span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-300 tracking-tight">
            ~{avgTokens}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Tokens per skill</div>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">With Assets</span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20">
              <FileCode className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-300 tracking-tight">{skillsWithAssets}</div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Skills include helper scripts/docs</div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Category Distribution Breakdown */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-200 dark:border-slate-800 space-y-4 shadow-lg transition-colors">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-200 flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-600 dark:text-cyan-400" />
              Category Breakdown
            </h3>
            <span className="text-xs text-slate-500">Click to filter</span>
          </div>

          <div className="space-y-3">
            {catalog.categories.map((cat) => {
              const pct = Math.round((cat.count / catalog.totalSkills) * 100);
              return (
                <div
                  key={cat.id}
                  onClick={() => onSelectCategory(cat.id)}
                  className="group cursor-pointer p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 transition"
                >
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-cyan-300 font-medium transition">
                      <CategoryIcon name={cat.icon} className="w-3.5 h-3.5 text-indigo-600 dark:text-cyan-400" />
                      <span>{cat.name}</span>
                    </div>
                    <div className="font-mono text-slate-500 dark:text-slate-400">
                      <span className="text-slate-900 dark:text-slate-200 font-bold">{cat.count}</span> ({pct}%)
                    </div>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-900 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-indigo-500 to-cyan-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Harness Sources & Popular Technologies */}
        <div className="space-y-6">
          
          {/* Harness Breakdown */}
          <div className="glass-panel rounded-2xl p-6 border border-slate-200 dark:border-slate-800 space-y-4 shadow-lg transition-colors">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-200 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              Harness Sources Distribution
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {catalog.harnesses.map((h) => (
                <div key={h.id} className="bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-slate-900 dark:text-slate-200">{h.name}</span>
                    <span className="text-xs font-mono font-bold text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-950/80 px-2 py-0.5 rounded border border-purple-200 dark:border-purple-800/40">
                      {h.count}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">{h.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Authors & Curators Breakdown */}
          {catalog.authors && catalog.authors.length > 0 && (
            <div className="glass-panel rounded-2xl p-6 border border-slate-200 dark:border-slate-800 space-y-4 shadow-lg transition-colors">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-200 flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-indigo-600 dark:text-cyan-400" />
                  Authors & Ecosystem Distribution
                </h3>
                <span className="text-xs text-slate-500">Click to filter</span>
              </div>

              <div className="flex flex-wrap gap-2">
                {catalog.authors.map(({ author, count }) => (
                  <button
                    key={author}
                    onClick={() => onSelectAuthor && onSelectAuthor(author)}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-cyan-500/50 text-slate-700 dark:text-slate-300 hover:text-indigo-800 dark:hover:text-cyan-200 text-xs font-medium transition flex items-center gap-1.5"
                  >
                    <span>{author}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-mono">
                      {count}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Top Technologies / Tags */}
          <div className="glass-panel rounded-2xl p-6 border border-slate-200 dark:border-slate-800 space-y-4 shadow-lg transition-colors">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-200 flex items-center gap-2">
              <Tag className="w-4 h-4 text-amber-500 dark:text-amber-400" />
              Technology & Intent Leaderboard
            </h3>

            <div className="flex flex-wrap gap-2">
              {catalog.tags.slice(0, 30).map(({ tag, count }) => (
                <button
                  key={tag}
                  onClick={() => onSelectTag(tag)}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-500/50 text-slate-700 dark:text-slate-300 hover:text-amber-800 dark:hover:text-amber-200 text-xs font-mono transition flex items-center gap-1.5"
                >
                  <span>#{tag}</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    {count}
                  </span>
                </button>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
