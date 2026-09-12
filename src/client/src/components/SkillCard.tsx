import React, { useState } from 'react';
import { Skill } from '../types';
import { CategoryIcon } from './CategoryIcon';
import {
  Copy,
  Check,
  ArrowRight,
  Sparkles,
  Layers,
  FileCode,
  Terminal,
  HelpCircle,
  Play
} from 'lucide-react';

interface SkillCardProps {
  skill: Skill;
  onSelect: (skill: Skill) => void;
  onCopyPrompt: (text: string) => void;
}

export const SkillCard: React.FC<SkillCardProps> = ({ skill, onSelect, onCopyPrompt }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    const promptText = `Use the "${skill.id}" skill to help me with this task. Follow its instructions and best practices.`;
    navigator.clipboard.writeText(promptText);
    setCopied(true);
    onCopyPrompt(promptText);
    setTimeout(() => setCopied(false), 2000);
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'agent-ops':
        return 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30';
      case 'testing-qa':
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
      case 'architecture-backend':
        return 'bg-blue-500/15 text-blue-300 border-blue-500/30';
      case 'frontend-design':
        return 'bg-pink-500/15 text-pink-300 border-pink-500/30';
      case 'devops-infra':
        return 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30';
      case 'security-compliance':
        return 'bg-rose-500/15 text-rose-300 border-rose-500/30';
      case 'ai-ml':
        return 'bg-violet-500/15 text-violet-300 border-violet-500/30';
      case 'data-analytics':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      case 'workflow-productivity':
        return 'bg-orange-500/15 text-orange-300 border-orange-500/30';
      default:
        return 'bg-teal-500/15 text-teal-300 border-teal-500/30';
    }
  };

  return (
    <div
      onClick={() => onSelect(skill)}
      className="glass-card rounded-2xl p-5 flex flex-col justify-between cursor-pointer group relative overflow-hidden transition-all duration-300"
    >
      {/* Top Accent Gradient Border Glow */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-cyan-500/0 via-indigo-500/40 to-cyan-500/0 opacity-0 group-hover:opacity-100 transition-opacity" />

      <div>
        {/* Header Badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span
            className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full border flex items-center gap-1.5 ${getCategoryColor(
              skill.category
            )}`}
          >
            <CategoryIcon name={skill.category} className="w-3 h-3" />
            <span className="capitalize">{skill.category.replace(/-/g, ' ')}</span>
          </span>

          <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400">
            <span title="Estimated Token Footprint" className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800">
              ~{skill.stats.tokenEstimate} tok
            </span>
            {skill.assets.length > 0 && (
              <span title={`${skill.assets.length} bundled script/reference files`} className="px-1.5 py-0.5 rounded bg-indigo-950/60 border border-indigo-800/40 text-indigo-300 flex items-center gap-1">
                <FileCode className="w-3 h-3" />
                {skill.assets.length}
              </span>
            )}
          </div>
        </div>

        {/* Title & Identifier */}
        <div className="mb-2.5">
          <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition line-clamp-1">
            {skill.title}
          </h3>
          <p className="text-xs font-mono text-slate-400 flex items-center gap-1 mt-0.5">
            <Terminal className="w-3 h-3 text-cyan-400/80" />
            <span>{skill.id}</span>
          </p>
        </div>

        {/* Description */}
        <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed mb-3.5">
          {skill.description}
        </p>

        {/* "When to use" Snippet Callout */}
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-2.5 mb-3.5 group-hover:border-slate-700 transition">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-400 mb-1">
            <HelpCircle className="w-3 h-3" />
            <span>When to use</span>
          </div>
          <p className="text-[11px] text-slate-300 line-clamp-2 leading-normal">
            {skill.whenToUse}
          </p>
        </div>

        {/* Tags */}
        {skill.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {skill.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-[10px] px-2 py-0.5 rounded-md bg-slate-900/90 text-slate-400 border border-slate-800/80 font-mono"
              >
                #{tag}
              </span>
            ))}
            {skill.tags.length > 3 && (
              <span className="text-[10px] px-1.5 py-0.5 text-slate-500 font-mono">
                +{skill.tags.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Bottom Action Footer */}
      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs mt-2">
        <button
          onClick={handleCopy}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition font-medium text-[11px] ${
            copied
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700/80 hover:text-white'
          }`}
          title="Copy ready-to-use AI agent prompt"
        >
          {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-cyan-400" />}
          <span>{copied ? 'Prompt Copied!' : 'Copy Prompt'}</span>
        </button>

        <span className="text-cyan-400 group-hover:text-cyan-300 flex items-center gap-1 text-[11px] font-medium group-hover:translate-x-0.5 transition-transform">
          Details
          <ArrowRight className="w-3 h-3" />
        </span>
      </div>
    </div>
  );
};
