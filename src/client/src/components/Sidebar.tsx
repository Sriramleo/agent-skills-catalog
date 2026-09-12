import React from 'react';
import { CategoryIcon } from './CategoryIcon';
import { SkillCategory, HarnessInfo } from '../types';
import { Layers, Tag, X, Filter, Sparkles, Terminal } from 'lucide-react';

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
  totalSkills,
  onClearAll,
  hasActiveFilters
}) => {
  return (
    <aside className="w-full lg:w-72 shrink-0 space-y-6">
      
      {/* Filters Header & Reset */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2 text-slate-300 font-semibold text-sm">
          <Filter className="w-4 h-4 text-cyan-400" />
          <span>Catalog Filters</span>
        </div>
        {hasActiveFilters && (
          <button
            onClick={onClearAll}
            className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 font-medium hover:underline transition"
          >
            <X className="w-3.5 h-3.5" />
            Reset all
          </button>
        )}
      </div>

      {/* Categories Section */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider px-2 mb-2">
          <span>Categories</span>
          <span className="text-[11px] font-mono text-slate-500">({categories.length})</span>
        </div>

        {/* "All Categories" Item */}
        <button
          onClick={() => onSelectCategory(null)}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition ${
            selectedCategory === null
              ? 'bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm'
              : 'text-slate-300 hover:bg-slate-900/80 hover:text-white border border-transparent'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>All Categories</span>
          </div>
          <span className="px-2 py-0.5 rounded-md bg-slate-800 text-[11px] font-mono text-slate-400">
            ${totalSkills}
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
                  ? 'bg-indigo-600/30 text-indigo-200 border border-indigo-500/50 shadow-sm'
                  : 'text-slate-300 hover:bg-slate-900/80 hover:text-white border border-transparent'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate pr-2">
                <span className={isSelected ? 'text-indigo-400' : 'text-slate-400'}>
                  <CategoryIcon name={cat.icon} />
                </span>
                <span className="truncate">{cat.name}</span>
              </div>
              <span className={`px-2 py-0.5 rounded-md text-[11px] font-mono shrink-0 ${
                isSelected ? 'bg-indigo-500/30 text-indigo-200' : 'bg-slate-800/80 text-slate-400'
              }`}>
                {cat.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Harness Sources Section */}
      {harnesses.length > 0 && (
        <div className="space-y-1.5 pt-4 border-t border-slate-800">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-2 mb-2">
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
                      ? 'bg-purple-600/30 text-purple-200 border border-purple-500/50'
                      : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <Terminal className="w-3.5 h-3.5 text-purple-400" />
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
        <div className="space-y-2 pt-4 border-t border-slate-800">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider px-2 mb-1">
            <span className="flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-amber-400" />
              Popular Tags
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5 px-1 max-h-48 overflow-y-auto pr-1">
            {tags.slice(0, 24).map(({ tag, count }) => {
              const isSelected = selectedTag === tag;
              return (
                <button
                  key={tag}
                  onClick={() => onSelectTag(isSelected ? null : tag)}
                  className={`text-[11px] px-2 py-0.5 rounded-md font-mono transition flex items-center gap-1 ${
                    isSelected
                      ? 'bg-amber-500/30 text-amber-200 border border-amber-500/60 font-semibold'
                      : 'bg-slate-900/90 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800'
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
