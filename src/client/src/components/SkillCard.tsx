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
  Star,
  RotateCcw,
  Wrench,
  Zap,
  User
} from 'lucide-react';

interface SkillCardProps {
  skill: Skill;
  onSelect: (skill: Skill) => void;
  onCopyPrompt: (text: string) => void;
  isFavorite: boolean;
  onToggleFavorite: (skillId: string) => void;
  isActive?: boolean;
}

export const SkillCard: React.FC<SkillCardProps> = ({
  skill,
  onSelect,
  onCopyPrompt,
  isFavorite,
  onToggleFavorite,
  isActive = false
}) => {
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [copiedSlash, setCopiedSlash] = useState(false);

  const handleCopyPrompt = (e: React.MouseEvent) => {
    e.stopPropagation();
    const promptText = `Use the "${skill.id}" skill to help me with this task. Follow its instructions and best practices.`;
    navigator.clipboard.writeText(promptText);
    setCopiedPrompt(true);
    onCopyPrompt(promptText);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const handleCopySlash = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(skill.slashCommand);
    setCopiedSlash(true);
    onCopyPrompt(skill.slashCommand);
    setTimeout(() => setCopiedSlash(false), 2000);
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite(skill.id);
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'slash-commands':
        return 'bg-cyan-100 text-cyan-800 border-cyan-300 dark:bg-cyan-500/20 dark:text-cyan-300 dark:border-cyan-500/40 font-bold';
      case 'agent-ops':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-500/15 dark:text-indigo-300 dark:border-indigo-500/30';
      case 'testing-qa':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30';
      case 'architecture-backend':
        return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/15 dark:text-blue-300 dark:border-blue-500/30';
      case 'frontend-design':
        return 'bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-500/15 dark:text-pink-300 dark:border-pink-500/30';
      case 'devops-infra':
        return 'bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-500/15 dark:text-cyan-300 dark:border-cyan-500/30';
      case 'security-compliance':
        return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/15 dark:text-rose-300 dark:border-rose-500/30';
      case 'ai-ml':
        return 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-500/15 dark:text-violet-300 dark:border-violet-500/30';
      case 'data-analytics':
        return 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30';
      case 'workflow-productivity':
        return 'bg-orange-50 text-orange-800 border-orange-200 dark:bg-orange-500/15 dark:text-orange-300 dark:border-orange-500/30';
      default:
        return 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-500/15 dark:text-teal-300 dark:border-teal-500/30';
    }
  };

  return (
    <div
      onClick={() => onSelect(skill)}
      className={`glass-card rounded-2xl p-5 flex flex-col justify-between cursor-pointer group relative overflow-hidden transition-all duration-300 ${
        isActive ? 'ring-2 ring-indigo-500 dark:ring-cyan-400 shadow-lg shadow-indigo-500/10 dark:shadow-cyan-500/20' : ''
      } ${
        skill.isManualSlashCommand ? 'border-cyan-400/40 dark:border-cyan-500/30 bg-cyan-50/20 dark:bg-slate-900/80 hover:border-cyan-500' : ''
      }`}
    >
      {/* Top Accent Gradient Border Glow */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-cyan-500/0 via-indigo-500/40 to-cyan-500/0 opacity-0 group-hover:opacity-100 transition-opacity" />

      <div>
        {/* Header Badges & Favorite Button */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {skill.isManualSlashCommand ? (
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-500/20 text-cyan-800 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-400/50 flex items-center gap-1 shadow-sm">
                <Zap className="w-3 h-3 text-cyan-600 dark:text-cyan-400 fill-cyan-500 dark:fill-cyan-400" />
                <span>Manual Slash Command</span>
              </span>
            ) : (
              <span
                className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full border flex items-center gap-1.5 ${getCategoryColor(
                  skill.category
                )}`}
              >
                <CategoryIcon name={skill.category} className="w-3 h-3" />
                <span className="capitalize">{skill.category.replace(/-/g, ' ')}</span>
              </span>
            )}

            {skill.overridesGlobal && (
              <span
                title="This workspace skill overrides the global version"
                className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-100 dark:bg-cyan-950/80 text-cyan-800 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-700/50 flex items-center gap-1 font-medium"
              >
                <RotateCcw className="w-2.5 h-2.5" />
                Workspace
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <span title="Estimated Token Footprint" className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-medium">
              ~{skill.stats.tokenEstimate} tok
            </span>

            {/* Star Favorite Button */}
            <button
              onClick={handleFavoriteClick}
              className={`p-1 rounded-lg transition ${
                isFavorite
                  ? 'text-amber-500 dark:text-amber-400 hover:bg-amber-400/10'
                  : 'text-slate-400 hover:text-slate-600 dark:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title={isFavorite ? 'Remove from Starred (Press s)' : 'Star this skill (Press s)'}
            >
              <Star className={`w-4 h-4 ${isFavorite ? 'fill-amber-500 dark:fill-amber-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* Title & Slash Command Bar */}
        <div className="mb-2.5">
          <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-cyan-300 transition line-clamp-1">
            {skill.title}
          </h3>
          
          <div className="flex items-center justify-between gap-2 mt-1.5">
            <p className="text-xs font-mono text-slate-500 dark:text-slate-400 flex items-center gap-1 truncate">
              <Terminal className="w-3 h-3 text-indigo-600 dark:text-cyan-400 shrink-0" />
              <span className="truncate">{skill.id}</span>
            </p>

            {/* Prominent Slash Command Action Button */}
            <button
              onClick={handleCopySlash}
              className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-lg border transition flex items-center gap-1 shrink-0 shadow-sm ${
                copiedSlash
                  ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-500/50'
                  : 'bg-indigo-50 hover:bg-indigo-100 dark:bg-cyan-950/80 dark:hover:bg-cyan-900 text-indigo-700 dark:text-cyan-300 border-indigo-200 dark:border-cyan-700/60'
              }`}
              title="Click to copy slash command to clipboard"
            >
              {copiedSlash ? <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> : <Zap className="w-3 h-3 text-amber-500 dark:text-amber-400" />}
              <span>{copiedSlash ? 'Copied!' : skill.slashCommand}</span>
            </button>
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed mb-3">
          {skill.description}
        </p>

        {/* "When to use" Snippet Callout */}
        <div className="bg-amber-50/60 dark:bg-slate-950/70 border border-amber-200/70 dark:border-slate-800/80 rounded-xl p-2.5 mb-3 group-hover:border-amber-300 dark:group-hover:border-slate-700 transition">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-700 dark:text-amber-400 mb-0.5">
            <HelpCircle className="w-3 h-3 text-amber-600 dark:text-amber-400" />
            <span>When to use</span>
          </div>
          <p className="text-[11px] text-slate-700 dark:text-slate-300 line-clamp-2 leading-normal">
            {skill.whenToUse}
          </p>
        </div>

        {/* Author Badge & Detected Tools & Tags */}
        <div className="flex flex-wrap items-center gap-1 mb-3">
          {skill.author && (
            <span
              className="text-[10px] px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/40 font-medium flex items-center gap-1"
              title={`Author: ${skill.author}`}
            >
              <User className="w-2.5 h-2.5" />
              <span className="truncate max-w-[120px]">{skill.author}</span>
            </span>
          )}
          {skill.detectedTools.slice(0, 2).map((tool) => (
            <span
              key={tool}
              className="text-[10px] px-1.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40 font-mono flex items-center gap-1 font-medium"
            >
              <Wrench className="w-2.5 h-2.5" />
              {tool}
            </span>
          ))}
          {skill.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-900/90 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800/80 font-mono"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>

      {/* Bottom Action Footer */}
      <div className="pt-3 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-xs mt-1">
        <button
          onClick={handleCopyPrompt}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition font-medium text-[11px] shadow-sm ${
            copiedPrompt
              ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/40'
              : 'bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/80 hover:text-slate-900 dark:hover:text-white'
          }`}
          title="Copy ready-to-use AI agent prompt (Press c)"
        >
          {copiedPrompt ? <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3 h-3 text-indigo-600 dark:text-cyan-400" />}
          <span>{copiedPrompt ? 'Copied!' : 'Copy Prompt'}</span>
        </button>

        <span className="text-indigo-600 dark:text-cyan-400 group-hover:text-indigo-700 dark:group-hover:text-cyan-300 flex items-center gap-1 text-[11px] font-medium group-hover:translate-x-0.5 transition-transform">
          Details (Enter)
          <ArrowRight className="w-3 h-3" />
        </span>
      </div>
    </div>
  );
};
