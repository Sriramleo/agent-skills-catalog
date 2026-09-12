import React, { useState, useMemo } from 'react';
import { Skill } from '../types';
import { CategoryIcon } from './CategoryIcon';
import {
  ArrowUpDown,
  Copy,
  Check,
  ExternalLink,
  Terminal,
  FileCode,
  Star,
  RotateCcw,
  Wrench
} from 'lucide-react';

interface SkillMatrixProps {
  skills: Skill[];
  onSelect: (skill: Skill) => void;
  onCopyPrompt: (text: string) => void;
  favorites: Set<string>;
  onToggleFavorite: (skillId: string) => void;
  activeIndex?: number;
}

type SortField = 'title' | 'category' | 'harness' | 'tokens' | 'assets' | 'favorite';
type SortOrder = 'asc' | 'desc';

export const SkillMatrix: React.FC<SkillMatrixProps> = ({
  skills,
  onSelect,
  onCopyPrompt,
  favorites,
  onToggleFavorite,
  activeIndex = -1
}) => {
  const [sortField, setSortField] = useState<SortField>('title');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedSlash, setCopiedSlash] = useState<string | null>(null);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const sortedSkills = useMemo(() => {
    return [...skills].sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'favorite':
          const aFav = favorites.has(a.id) ? 1 : 0;
          const bFav = favorites.has(b.id) ? 1 : 0;
          comparison = bFav - aFav;
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'category':
          comparison = a.category.localeCompare(b.category);
          break;
        case 'harness':
          comparison = a.harness.localeCompare(b.harness);
          break;
        case 'tokens':
          comparison = a.stats.tokenEstimate - b.stats.tokenEstimate;
          break;
        case 'assets':
          comparison = a.assets.length - b.assets.length;
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [skills, sortField, sortOrder, favorites]);

  const handleCopyPrompt = (e: React.MouseEvent, skill: Skill) => {
    e.stopPropagation();
    const prompt = `Use the "${skill.id}" skill to help me with this task.`;
    navigator.clipboard.writeText(prompt);
    setCopiedId(skill.id);
    onCopyPrompt(prompt);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCopySlash = (e: React.MouseEvent, skill: Skill) => {
    e.stopPropagation();
    navigator.clipboard.writeText(skill.slashCommand);
    setCopiedSlash(skill.id);
    onCopyPrompt(skill.slashCommand);
    setTimeout(() => setCopiedSlash(null), 2000);
  };

  return (
    <div className="w-full glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-900/90 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800 select-none">
            <tr>
              <th
                onClick={() => handleSort('favorite')}
                className="py-3.5 px-3 cursor-pointer hover:text-white transition text-center w-10"
                title="Sort by Starred"
              >
                <Star className="w-3.5 h-3.5 mx-auto text-amber-400" />
              </th>
              <th
                onClick={() => handleSort('title')}
                className="py-3.5 px-4 cursor-pointer hover:text-white transition"
              >
                <div className="flex items-center gap-1.5">
                  <span>Skill Name & ID</span>
                  <ArrowUpDown className="w-3.5 h-3.5" />
                </div>
              </th>
              <th
                onClick={() => handleSort('category')}
                className="py-3.5 px-4 cursor-pointer hover:text-white transition"
              >
                <div className="flex items-center gap-1.5">
                  <span>Category</span>
                  <ArrowUpDown className="w-3.5 h-3.5" />
                </div>
              </th>
              <th
                onClick={() => handleSort('harness')}
                className="py-3.5 px-4 cursor-pointer hover:text-white transition"
              >
                <div className="flex items-center gap-1.5">
                  <span>Harness</span>
                  <ArrowUpDown className="w-3.5 h-3.5" />
                </div>
              </th>
              <th
                onClick={() => handleSort('tokens')}
                className="py-3.5 px-4 cursor-pointer hover:text-white transition text-right"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>Tokens</span>
                  <ArrowUpDown className="w-3.5 h-3.5" />
                </div>
              </th>
              <th
                onClick={() => handleSort('assets')}
                className="py-3.5 px-4 cursor-pointer hover:text-white transition text-center"
              >
                <div className="flex items-center justify-center gap-1.5">
                  <span>Assets</span>
                  <ArrowUpDown className="w-3.5 h-3.5" />
                </div>
              </th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 bg-slate-950/40">
            {sortedSkills.map((skill, idx) => {
              const isFav = favorites.has(skill.id);
              const isRowActive = activeIndex === idx;

              return (
                <tr
                  key={skill.id}
                  onClick={() => onSelect(skill)}
                  className={`hover:bg-slate-900/80 cursor-pointer transition group ${
                    isRowActive ? 'bg-indigo-950/40 ring-1 ring-cyan-400' : ''
                  }`}
                >
                  {/* Favorite Column */}
                  <td className="py-3 px-3 text-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(skill.id);
                      }}
                      className={`p-1 rounded transition ${
                        isFav ? 'text-amber-400' : 'text-slate-600 hover:text-slate-400'
                      }`}
                      title={isFav ? 'Remove Star' : 'Star this skill'}
                    >
                      <Star className={`w-3.5 h-3.5 ${isFav ? 'fill-amber-400' : ''}`} />
                    </button>
                  </td>

                  {/* Title & ID & Overrides */}
                  <td className="py-3 px-4 max-w-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-100 group-hover:text-cyan-300 transition truncate">
                        {skill.title}
                      </span>
                      {skill.overridesGlobal && (
                        <span
                          title="Overrides global version"
                          className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/60"
                        >
                          Override
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5 truncate mt-0.5">
                      <Terminal className="w-3 h-3 text-cyan-400 shrink-0" />
                      <span>{skill.id}</span>
                      <button
                        onClick={(e) => handleCopySlash(e, skill)}
                        className="text-[10px] text-cyan-500 hover:text-cyan-300 font-mono"
                        title="Copy slash command"
                      >
                        {copiedSlash === skill.id ? '(Copied!)' : skill.slashCommand}
                      </button>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-900 border border-slate-800 text-slate-300">
                      <CategoryIcon name={skill.category} className="w-3 h-3 text-cyan-400" />
                      <span className="capitalize">{skill.category.replace(/-/g, ' ')}</span>
                    </span>
                  </td>

                  {/* Harness */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className="text-xs text-slate-400 font-mono">
                      {skill.harnessLabel}
                    </span>
                  </td>

                  {/* Tokens */}
                  <td className="py-3 px-4 text-right font-mono text-xs text-emerald-400 whitespace-nowrap">
                    ~{skill.stats.tokenEstimate.toLocaleString()}
                  </td>

                  {/* Assets */}
                  <td className="py-3 px-4 text-center whitespace-nowrap">
                    {skill.assets.length > 0 ? (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-indigo-950/80 text-indigo-300 text-[10px] font-mono border border-indigo-800/40">
                        <FileCode className="w-3 h-3" />
                        {skill.assets.length}
                      </span>
                    ) : (
                      <span className="text-slate-600 text-xs">—</span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={(e) => handleCopyPrompt(e, skill)}
                        className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 text-[11px] font-medium transition flex items-center gap-1"
                        title="Copy quick invocation prompt"
                      >
                        {copiedId === skill.id ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3 text-cyan-400" />
                        )}
                        <span>{copiedId === skill.id ? 'Copied' : 'Prompt'}</span>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
