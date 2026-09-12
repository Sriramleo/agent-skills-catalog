import React, { useState, useMemo } from 'react';
import { Skill } from '../types';
import { CategoryIcon } from './CategoryIcon';
import {
  ArrowUpDown,
  Copy,
  Check,
  ExternalLink,
  Terminal,
  FileCode
} from 'lucide-react';

interface SkillMatrixProps {
  skills: Skill[];
  onSelect: (skill: Skill) => void;
  onCopyPrompt: (text: string) => void;
}

type SortField = 'title' | 'category' | 'harness' | 'tokens' | 'assets';
type SortOrder = 'asc' | 'desc';

export const SkillMatrix: React.FC<SkillMatrixProps> = ({ skills, onSelect, onCopyPrompt }) => {
  const [sortField, setSortField] = useState<SortField>('title');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [copiedId, setCopiedId] = useState<string | null>(null);

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
  }, [skills, sortField, sortOrder]);

  const handleCopy = (e: React.MouseEvent, skill: Skill) => {
    e.stopPropagation();
    const prompt = `Use the "${skill.id}" skill to help me with this task.`;
    navigator.clipboard.writeText(prompt);
    setCopiedId(skill.id);
    onCopyPrompt(prompt);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="w-full glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-900/90 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800 select-none">
            <tr>
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
            {sortedSkills.map((skill) => (
              <tr
                key={skill.id}
                onClick={() => onSelect(skill)}
                className="hover:bg-slate-900/80 cursor-pointer transition group"
              >
                {/* Title & ID */}
                <td className="py-3 px-4 max-w-xs">
                  <div className="font-semibold text-slate-100 group-hover:text-cyan-300 transition truncate">
                    {skill.title}
                  </div>
                  <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1 truncate">
                    <Terminal className="w-3 h-3 text-cyan-400 shrink-0" />
                    <span>{skill.id}</span>
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
                      onClick={(e) => handleCopy(e, skill)}
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
