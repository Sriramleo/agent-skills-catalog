import React from 'react';
import { Skill, SkillCatalogResult } from '../types';
import { CategoryIcon } from './CategoryIcon';
import {
  Sparkles,
  Layers,
  Terminal,
  FileCode,
  TrendingUp,
  Cpu,
  UserCheck,
  Tag,
  Filter
} from 'lucide-react';

interface StatsDashboardProps {
  catalog: SkillCatalogResult;
  filteredSkills?: Skill[];
  activeAuthorFilter?: string | null;
  activeCategoryFilter?: string | null;
  onSelectCategory: (catId: string) => void;
  onSelectTag: (tag: string) => void;
  onSelectAuthor?: (author: string) => void;
  onClearFilter?: () => void;
}

export const StatsDashboard: React.FC<StatsDashboardProps> = ({
  catalog,
  filteredSkills,
  activeAuthorFilter,
  activeCategoryFilter,
  onSelectCategory,
  onSelectTag,
  onSelectAuthor,
  onClearFilter
}) => {
  const isFiltered = Boolean(activeAuthorFilter || activeCategoryFilter || (filteredSkills && filteredSkills.length < catalog.totalSkills));
  const activeList = filteredSkills && filteredSkills.length > 0 ? filteredSkills : catalog.skills;

  const totalTokens = activeList.reduce((acc, s) => acc + (s.stats?.tokenEstimate || 0), 0);
  const avgTokens = activeList.length > 0 ? Math.round(totalTokens / activeList.length) : 0;
  const skillsWithAssets = activeList.filter((s) => s.assets && s.assets.length > 0).length;
  const skillsWithTriggers = activeList.filter((s) => s.triggers && s.triggers.length > 0).length;

  // Category breakdown for active list
  const categoryCounts = new Map<string, number>();
  for (const skill of activeList) {
    categoryCounts.set(skill.category, (categoryCounts.get(skill.category) || 0) + 1);
  }

  const categoryStats = catalog.categories.map((c) => ({
    ...c,
    activeCount: categoryCounts.get(c.id) || 0
  })).filter((c) => isFiltered ? c.activeCount > 0 : c.count > 0);

  // Author breakdown for active list
  const authorCounts = new Map<string, number>();
  for (const skill of activeList) {
    if (skill.author) {
      authorCounts.set(skill.author, (authorCounts.get(skill.author) || 0) + 1);
    }
  }

  const authorStats = Array.from(authorCounts.entries())
    .map(([author, count]) => ({ author, count }))
    .sort((a, b) => b.count - a.count);

  return (
    <div className="space-y-6 animate-fade-in transition-colors">
      
      {/* Active Filter Notice Banner */}
      {isFiltered && (
        <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-indigo-900 dark:text-indigo-200 font-medium">
            <Filter className="w-4 h-4 text-indigo-600 dark:text-cyan-400" />
            <span>
              Showing analytics for <strong>{activeList.length}</strong> filtered skills
              {activeAuthorFilter ? ` by ${activeAuthorFilter}` : ''}
              {activeCategoryFilter ? ` in category "${activeCategoryFilter}"` : ''}
            </span>
          </div>
          {onClearFilter && (
            <button
              onClick={onClearFilter}
              className="px-3 py-1 rounded-lg bg-indigo-200/60 dark:bg-indigo-900/60 hover:bg-indigo-200 dark:hover:bg-indigo-800 text-indigo-900 dark:text-indigo-200 font-medium transition"
            >
              View Global Catalog Stats ({catalog.totalSkills})
            </button>
          )}
        </div>
      )}

      {/* Top Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="glass-card rounded-2xl p-5 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {isFiltered ? 'Filtered Skills' : 'Total Skills'}
            </span>
            <div className="p-2 rounded-xl bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-500/20">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{activeList.length}</div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            {isFiltered ? `of ${catalog.totalSkills} total skills` : `Across ${catalog.harnesses?.length || 0} active harnesses`}
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Token Footprint</span>
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20">
              <Cpu className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-300 tracking-tight">
            ~{(totalTokens / 1000).toFixed(1)}k
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            {isFiltered ? 'Tokens in current selection' : 'Tokens across full catalog'}
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Avg Tokens</span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-300 tracking-tight">
            ~{avgTokens}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Average per skill</div>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">With Assets / Docs</span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20">
              <FileCode className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-300 tracking-tight">{skillsWithAssets}</div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Skills include helper assets</div>
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
            {categoryStats.map((cat) => {
              const currentCount = isFiltered ? cat.activeCount : cat.count;
              const denom = activeList.length || 1;
              const pct = Math.round((currentCount / denom) * 100);
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
                      <span className="text-slate-900 dark:text-slate-200 font-bold">{currentCount}</span> ({pct}%)
                    </div>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-900 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-indigo-500 to-cyan-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, Math.max(2, pct))}%` }}
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
              {(catalog.harnesses || []).map((h) => (
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
          {authorStats.length > 0 && (
            <div className="glass-panel rounded-2xl p-6 border border-slate-200 dark:border-slate-800 space-y-4 shadow-lg transition-colors">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-200 flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-indigo-600 dark:text-cyan-400" />
                  Authors & Ecosystem Distribution
                </h3>
                <span className="text-xs text-slate-500">Click to filter</span>
              </div>

              <div className="flex flex-wrap gap-2">
                {authorStats.map(({ author, count }) => (
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
          {catalog.tags && catalog.tags.length > 0 && (
            <div className="glass-panel rounded-2xl p-6 border border-slate-200 dark:border-slate-800 space-y-4 shadow-lg transition-colors">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-200 flex items-center gap-2">
                  <Tag className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                  Technology & Intent Leaderboard
                </h3>
                <span className="text-xs text-slate-500">Click to filter</span>
              </div>

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
          )}

        </div>

      </div>

    </div>
  );
};
