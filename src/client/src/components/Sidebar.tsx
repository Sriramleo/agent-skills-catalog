import React from 'react';
import { CategoryIcon } from './CategoryIcon';
import { SkillCategory, HarnessInfo } from '../types';
import {
  Layers,
  Tag,
  X,
  Filter,
  Star,
  Wrench,
  Terminal,
  RotateCcw,
  Sparkles
} from 'lucide-react';

interface SidebarProps {
  categories: SkillCategory[];
  selectedCategory: string | null;
  onSelectCategory: (catId: string | null) => void;
  harnesses: HarnessInfo[];
  selectedHarness: string | null;
  onSelectHarness: (harnessId: string | null) => void;
  tags: { tag: string; count: number }[];
  selectedTag: string | null;
  onSelectTag: (tag: string | null) => void;
  tools: { tool: string; count: number }[];
  selectedTool: string | null;
  onSelectTool: (tool: string | null) => void;
  favoritesCount: number;
  showOnlyFavorites: boolean;
  onToggleFavorites: () => void;
  overriddenCount: number;
  showOnlyOverridden: boolean;
  onToggleOverridden: () => void;
  totalSkills: number;
  onClearAll: () => void;
  hasActiveFilters: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  harnesses,
  selectedHarness,
  onSelectHarness,
  tags,
  selectedTag,
  onSelectTag,
  tools,
  selectedTool,
  onSelectTool,
  favoritesCount,
  showOnlyFavorites,
  onToggleFavorites,
  overriddenCount,
  showOnlyOverridden,
  onToggleOverridden,
  totalSkills,
  onClearAll,
  hasActiveFilters
}) => {
  return (
    <aside className="w-full lg:w-72 shrink-0 space-y-6 transition-colors">
      
      {/* Filters Header & Reset */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-semibold text-sm">
          <Filter className="w-4 h-4 text-indigo-600 dark:text-cyan-400" />
          <span>Catalog Filters</span>
        </div>
        {hasActiveFilters && (
          <button
            onClick={onClearAll}
            className="text-xs text-rose-500 hover:text-rose-600 dark:text-rose-400 dark:hover:text-rose-300 flex items-center gap-1 font-medium hover:underline transition"
          >
            <X className="w-3.5 h-3.5" />
            Reset all
          </button>
        )}
      </div>

      {/* Quick Toggles: Starred & Overrides */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={onToggleFavorites}
          className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium border transition shadow-sm ${
            showOnlyFavorites
              ? 'bg-amber-500/20 text-amber-700 dark:text-amber-200 border-amber-500/50'
              : 'bg-slate-100 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <Star className={`w-3.5 h-3.5 ${showOnlyFavorites ? 'fill-amber-500 text-amber-500' : 'text-amber-500'}`} />
            <span>Starred</span>
          </div>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
            {favoritesCount}
          </span>
        </button>

        {overriddenCount > 0 && (
          <button
            onClick={onToggleOverridden}
            className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium border transition shadow-sm ${
              showOnlyOverridden
                ? 'bg-cyan-500/20 text-cyan-700 dark:text-cyan-200 border-cyan-500/50'
                : 'bg-slate-100 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <RotateCcw className="w-3.5 h-3.5 text-cyan-500" />
              <span>Overrides</span>
            </div>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              {overriddenCount}
            </span>
          </button>
        )}
      </div>

      {/* Categories Section */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-2 mb-2">
          <span>Categories</span>
          <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500">({categories.length})</span>
        </div>

        {/* "All Categories" Item */}
        <button
          onClick={() => onSelectCategory(null)}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition ${
            selectedCategory === null
              ? 'bg-indigo-50 text-indigo-900 border border-indigo-200 dark:bg-indigo-600/25 dark:text-indigo-200 dark:border-indigo-500/40 shadow-sm font-semibold'
              : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-900/80 dark:hover:text-white border border-transparent'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Layers className="w-4 h-4 text-indigo-600 dark:text-cyan-400" />
            <span>All Categories</span>
          </div>
          <span className={`px-2 py-0.5 rounded-md text-[11px] font-mono shrink-0 ${
            selectedCategory === null
              ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-500/30 dark:text-indigo-200'
              : 'bg-slate-200 text-slate-600 dark:bg-slate-800/80 dark:text-slate-400'
          }`}>
            {totalSkills}
          </span>
        </button>

        {/* Category List */}
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(isSelected ? null : cat.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition ${
                isSelected
                  ? 'bg-indigo-50 text-indigo-900 border border-indigo-200 dark:bg-indigo-600/25 dark:text-indigo-200 dark:border-indigo-500/40 shadow-sm font-semibold'
                  : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-900/80 dark:hover:text-white border border-transparent'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate pr-2">
                <span className={isSelected ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400'}>
                  <CategoryIcon name={cat.icon} />
                </span>
                <span className="truncate">{cat.name}</span>
              </div>
              <span className={`px-2 py-0.5 rounded-md text-[11px] font-mono shrink-0 ${
                isSelected
                  ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-500/30 dark:text-indigo-200'
                  : 'bg-slate-200 text-slate-600 dark:bg-slate-800/80 dark:text-slate-400'
              }`}>
                {cat.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Tools & MCP Servers Section */}
      {tools && tools.length > 0 && (
        <div className="space-y-1.5 pt-4 border-t border-slate-200 dark:border-slate-800">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-2 mb-2 flex items-center gap-1.5">
            <Wrench className="w-3.5 h-3.5 text-emerald-500" />
            <span>Tools & MCP Servers</span>
          </div>
          <div className="space-y-1">
            {tools.slice(0, 8).map((t) => {
              const isSelected = selectedTool === t.tool;
              return (
                <button
                  key={t.tool}
                  onClick={() => onSelectTool(isSelected ? null : t.tool)}
                  className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs transition ${
                    isSelected
                      ? 'bg-emerald-50 dark:bg-emerald-600/30 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-500/50 font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-slate-200 border border-transparent'
                  }`}
                >
                  <span className="truncate">{t.tool}</span>
                  <span className="text-[11px] font-mono text-slate-500">{t.count}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Harness Sources Section */}
      {harnesses.length > 0 && (
        <div className="space-y-1.5 pt-4 border-t border-slate-200 dark:border-slate-800">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-2 mb-2">
            Harness Source
          </div>
          <div className="space-y-1">
            {harnesses.map((h) => {
              const isSelected = selectedHarness === h.id;
              return (
                <button
                  key={h.id}
                  onClick={() => onSelectHarness(isSelected ? null : h.id)}
                  className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs transition ${
                    isSelected
                      ? 'bg-purple-50 dark:bg-purple-600/30 text-purple-800 dark:text-purple-200 border border-purple-300 dark:border-purple-500/50 font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-slate-200 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <Terminal className="w-3.5 h-3.5 text-purple-500" />
                    <span className="truncate">{h.name}</span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-500">{h.count}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Popular Tags Section */}
      {tags.length > 0 && (
        <div className="space-y-2 pt-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-2 mb-1">
            <span className="flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-amber-500" />
              Popular Tags
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5 px-1 max-h-40 overflow-y-auto pr-1">
            {tags.slice(0, 20).map(({ tag, count }) => {
              const isSelected = selectedTag === tag;
              return (
                <button
                  key={tag}
                  onClick={() => onSelectTag(isSelected ? null : tag)}
                  className={`text-[11px] px-2 py-0.5 rounded-md font-mono transition flex items-center gap-1 ${
                    isSelected
                      ? 'bg-amber-100 dark:bg-amber-500/30 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-500/60 font-semibold'
                      : 'bg-slate-100 dark:bg-slate-900/90 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <span>#{tag}</span>
                  <span className="text-[9px] text-slate-500 opacity-80">({count})</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

    </aside>
  );
};
