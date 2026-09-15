import React, { useState, useEffect } from 'react';
import { Skill, SkillAsset } from '../types';
import { CategoryIcon } from './CategoryIcon';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import {
  X,
  Copy,
  Check,
  Sparkles,
  Terminal,
  HelpCircle,
  Play,
  FileCode,
  Layers,
  BookOpen,
  Info,
  Star,
  RotateCcw,
  Wrench,
  Code2,
  AlertTriangle,
  Bot,
  User
} from 'lucide-react';

interface SkillModalProps {
  skill: Skill | null;
  onClose: () => void;
  onCopyPrompt: (text: string) => void;
  isFavorite: boolean;
  onToggleFavorite: (skillId: string) => void;
}

export const SkillModal: React.FC<SkillModalProps> = ({
  skill,
  onClose,
  onCopyPrompt,
  isFavorite,
  onToggleFavorite
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'prompt' | 'markdown' | 'assets' | 'meta'>('overview');
  const [copiedPrompt, setCopiedPrompt] = useState<string | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<SkillAsset | null>(null);
  const [assetContent, setAssetContent] = useState<string>('');
  const [loadingAsset, setLoadingAsset] = useState<boolean>(false);

  // Prompt Studio state
  const [customGoal, setCustomGoal] = useState('');
  const [targetHarness, setTargetHarness] = useState('Generic / Claude / Antigravity');
  const [taskMode, setTaskMode] = useState('execute');

  useEffect(() => {
    if (skill) {
      setActiveTab('overview');
      setSelectedAsset(skill.assets[0] || null);
      setCustomGoal('');
    }
  }, [skill]);

  // Fetch asset content when selected
  useEffect(() => {
    if (skill && selectedAsset) {
      setLoadingAsset(true);
      fetch(`/api/skills/${encodeURIComponent(skill.id)}/asset?path=${encodeURIComponent(selectedAsset.relativePath)}`)
        .then((res) => {
          if (!res.ok) throw new Error('Failed to load asset');
          return res.text();
        })
        .then((data) => {
          setAssetContent(data);
          setLoadingAsset(false);
        })
        .catch(() => {
          setAssetContent('// Unable to preview asset content.');
          setLoadingAsset(false);
        });
    }
  }, [skill, selectedAsset]);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!skill) return null;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPrompt(label);
    onCopyPrompt(text);
    setTimeout(() => setCopiedPrompt(null), 2000);
  };

  const generateCustomPrompt = () => {
    const goal = customGoal.trim() || 'solve my current coding problem';
    switch (taskMode) {
      case 'execute':
        return `Please use the "${skill.id}" skill to ${goal}. Follow all instructions and standard patterns defined in the skill.`;
      case 'review':
        return `Using the "${skill.id}" skill guidelines, perform a rigorous code and architecture review on ${goal}.`;
      case 'plan':
        return `Using the "${skill.id}" skill methodology, draft a step-by-step implementation plan before writing any code for ${goal}.`;
      case 'diagnose':
        return `Apply the "${skill.id}" skill diagnostic checklist to investigate and debug ${goal}.`;
      default:
        return `Use the "${skill.id}" skill for ${goal}.`;
    }
  };

  const renderMarkdown = (md: string) => {
    const rawHtml = marked.parse(md) as string;
    const cleanHtml = DOMPurify.sanitize(rawHtml);
    return { __html: cleanHtml };
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div
        className="glass-panel w-full max-w-4xl max-h-[90vh] rounded-2xl flex flex-col shadow-2xl border border-slate-200 dark:border-slate-700/80 overflow-hidden bg-white dark:bg-slate-900/95 transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 flex items-start justify-between gap-4 transition-colors">
          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30 flex items-center gap-1.5">
                <CategoryIcon name={skill.category} className="w-3.5 h-3.5" />
                <span className="capitalize">{skill.category.replace(/-/g, ' ')}</span>
              </span>
              {skill.author && (
                <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 flex items-center gap-1.5">
                  <User className="w-3 h-3 text-indigo-600 dark:text-cyan-400" />
                  <span>{skill.author}</span>
                </span>
              )}
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
                {skill.harnessLabel}
              </span>
              {skill.overridesGlobal && (
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-700/60 flex items-center gap-1 font-medium">
                  <RotateCcw className="w-3 h-3" />
                  Overrides Global
                </span>
              )}
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800">
                ~{skill.stats.tokenEstimate} tokens
              </span>
            </div>

            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight truncate">
                {skill.title}
              </h2>
              <button
                onClick={() => onToggleFavorite(skill.id)}
                className={`p-1.5 rounded-lg transition ${
                  isFavorite
                    ? 'text-amber-500 bg-amber-50 dark:bg-amber-400/10'
                    : 'text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
                title={isFavorite ? 'Remove from Starred' : 'Star this skill'}
              >
                <Star className={`w-5 h-5 ${isFavorite ? 'fill-amber-500' : ''}`} />
              </button>
            </div>

            <div className="flex items-center gap-3">
              <p className="text-xs font-mono text-indigo-600 dark:text-cyan-400 flex items-center gap-1">
                <Terminal className="w-3.5 h-3.5" />
                <span>{skill.id}</span>
              </p>
              <button
                onClick={() => handleCopy(skill.slashCommand, 'modal-slash')}
                className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-indigo-700 dark:text-cyan-300 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-cyan-500/40 transition flex items-center gap-1 shadow-sm"
                title="Copy slash command"
              >
                {copiedPrompt === 'modal-slash' ? <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> : null}
                <span>{copiedPrompt === 'modal-slash' ? 'Command Copied!' : skill.slashCommand}</span>
              </button>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition shrink-0"
            title="Close (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex items-center px-5 border-b border-slate-200 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-950/40 gap-1 overflow-x-auto text-xs font-medium transition-colors">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-3 border-b-2 flex items-center gap-1.5 transition ${
              activeTab === 'overview'
                ? 'border-indigo-600 dark:border-cyan-500 text-indigo-700 dark:text-cyan-300 font-semibold'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Overview & Usage</span>
          </button>

          <button
            onClick={() => setActiveTab('prompt')}
            className={`px-3 py-3 border-b-2 flex items-center gap-1.5 transition ${
              activeTab === 'prompt'
                ? 'border-indigo-600 dark:border-cyan-500 text-indigo-700 dark:text-cyan-300 font-semibold'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Bot className="w-4 h-4 text-purple-500" />
            <span>AI Prompt Studio</span>
          </button>

          <button
            onClick={() => setActiveTab('markdown')}
            className={`px-3 py-3 border-b-2 flex items-center gap-1.5 transition ${
              activeTab === 'markdown'
                ? 'border-indigo-600 dark:border-cyan-500 text-indigo-700 dark:text-cyan-300 font-semibold'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>Full SKILL.md</span>
          </button>

          {skill.assets.length > 0 && (
            <button
              onClick={() => setActiveTab('assets')}
              className={`px-3 py-3 border-b-2 flex items-center gap-1.5 transition ${
                activeTab === 'assets'
                  ? 'border-indigo-600 dark:border-cyan-500 text-indigo-700 dark:text-cyan-300 font-semibold'
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <FileCode className="w-4 h-4 text-amber-500" />
              <span>Bundled Files ({skill.assets.length})</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('meta')}
            className={`px-3 py-3 border-b-2 flex items-center gap-1.5 transition ${
              activeTab === 'meta'
                ? 'border-indigo-600 dark:border-cyan-500 text-indigo-700 dark:text-cyan-300 font-semibold'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Info className="w-4 h-4" />
            <span>Metadata & Paths</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* TAB 1: OVERVIEW & USAGE */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              
              {/* Description Banner */}
              <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 rounded-xl p-4 text-sm text-slate-700 dark:text-slate-200 leading-relaxed shadow-sm">
                {skill.description}
              </div>

              {/* Detected Tools Pill Row */}
              {skill.detectedTools.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Wrench className="w-3.5 h-3.5 text-emerald-500" />
                    Required Tools & MCP Servers
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {skill.detectedTools.map((tool) => (
                      <span
                        key={tool}
                        className="text-xs px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-700/50 text-emerald-800 dark:text-emerald-300 font-medium flex items-center gap-1"
                      >
                        <Wrench className="w-3 h-3" />
                        {tool}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* When to Use Card */}
              <div className="bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-500/30 rounded-xl p-5 space-y-2">
                <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-semibold text-sm">
                  <HelpCircle className="w-4 h-4" />
                  <span>When to Use This Skill</span>
                </div>
                <div
                  className="markdown-body text-xs leading-relaxed pl-1"
                  dangerouslySetInnerHTML={renderMarkdown(skill.whenToUse)}
                />
              </div>

              {/* How to Use Card */}
              <div className="bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-500/30 rounded-xl p-5 space-y-2">
                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-semibold text-sm">
                  <Play className="w-4 h-4" />
                  <span>How to Use / Instructions</span>
                </div>
                <div
                  className="markdown-body text-xs leading-relaxed pl-1"
                  dangerouslySetInnerHTML={renderMarkdown(skill.howToUse)}
                />
              </div>

              {/* Trigger Phrases / Slash Commands */}
              {skill.triggers.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Triggers & Slash Commands
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {skill.triggers.map((t) => (
                      <span
                        key={t}
                        className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-indigo-700 dark:text-cyan-300 font-mono"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Ready Prompts */}
              {skill.prompts.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Quick AI Prompts
                  </h4>
                  <div className="space-y-2">
                    {skill.prompts.map((prompt, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 flex items-center justify-between gap-3 text-xs"
                      >
                        <code className="text-slate-800 dark:text-slate-300 font-mono flex-1 overflow-x-auto">
                          {prompt}
                        </code>
                        <button
                          onClick={() => handleCopy(prompt, `prompt-${idx}`)}
                          className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 text-xs font-medium shrink-0 transition shadow-sm"
                        >
                          {copiedPrompt === `prompt-${idx}` ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5 text-indigo-600 dark:text-cyan-400" />
                          )}
                          <span>{copiedPrompt === `prompt-${idx}` ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

          {/* TAB 2: AI PROMPT STUDIO */}
          {activeTab === 'prompt' && (
            <div className="space-y-5">
              <div className="bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-500/30 rounded-xl p-4">
                <h3 className="text-sm font-bold text-indigo-800 dark:text-indigo-300 mb-1 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  AI Agent Prompt Generator
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Generate the optimal instruction to paste into Claude Code, Antigravity, Cursor, or ChatGPT to execute this skill.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">Action Intent</label>
                  <select
                    value={taskMode}
                    onChange={(e) => setTaskMode(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-indigo-500 dark:focus:border-cyan-500"
                  >
                    <option value="execute">Execute feature / task using skill</option>
                    <option value="review">Perform code review with skill guidelines</option>
                    <option value="plan">Create implementation plan first</option>
                    <option value="diagnose">Diagnose / debug an issue</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">Target AI Harness</label>
                  <select
                    value={targetHarness}
                    onChange={(e) => setTargetHarness(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-indigo-500 dark:focus:border-cyan-500"
                  >
                    <option value="Generic / Claude / Antigravity">Claude Code / Antigravity</option>
                    <option value="Cursor / Cline">Cursor / Cline</option>
                    <option value="OpenAI Codex">OpenAI Codex</option>
                    <option value="Custom Prompt">Generic LLM</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">Describe your specific task (optional)</label>
                <input
                  type="text"
                  value={customGoal}
                  onChange={(e) => setCustomGoal(e.target.value)}
                  placeholder="e.g. refactor the auth controller, write unit tests for payments, setup docker container..."
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-indigo-500 dark:focus:border-cyan-500"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-400">
                  <span>Generated AI Prompt</span>
                  <button
                    onClick={() => handleCopy(generateCustomPrompt(), 'studio-prompt')}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 font-medium transition shadow-sm"
                  >
                    {copiedPrompt === 'studio-prompt' ? (
                      <Check className="w-3.5 h-3.5" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>{copiedPrompt === 'studio-prompt' ? 'Copied to Clipboard!' : 'Copy Generated Prompt'}</span>
                  </button>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-mono text-xs text-indigo-700 dark:text-cyan-300 leading-relaxed">
                  {generateCustomPrompt()}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: FULL MARKDOWN */}
          {activeTab === 'markdown' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pb-2 border-b border-slate-200 dark:border-slate-800">
                <span>Rendering <code className="text-indigo-600 dark:text-cyan-400 font-mono">{skill.filePath}</code></span>
                <button
                  onClick={() => handleCopy(skill.rawContent, 'raw-markdown')}
                  className="flex items-center gap-1 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition"
                >
                  {copiedPrompt === 'raw-markdown' ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedPrompt === 'raw-markdown' ? 'Copied' : 'Copy Raw'}</span>
                </button>
              </div>

              <div
                className="markdown-body p-4 bg-slate-50/50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/90 rounded-xl overflow-x-auto"
                dangerouslySetInnerHTML={renderMarkdown(skill.rawContent)}
              />
            </div>
          )}

          {/* TAB 4: BUNDLED ASSETS */}
          {activeTab === 'assets' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* File list */}
                <div className="space-y-1.5">
                  <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                    Skill Assets
                  </h4>
                  {skill.assets.map((asset) => {
                    const isSelected = selectedAsset?.relativePath === asset.relativePath;
                    return (
                      <button
                        key={asset.relativePath}
                        onClick={() => setSelectedAsset(asset)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-mono transition text-left ${
                          isSelected
                            ? 'bg-indigo-100 dark:bg-indigo-600/30 text-indigo-900 dark:text-indigo-200 border border-indigo-300 dark:border-indigo-500/50 font-semibold'
                            : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <FileCode className="w-3.5 h-3.5 text-indigo-600 dark:text-cyan-400 shrink-0" />
                          <span className="truncate">{asset.relativePath}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 shrink-0">{asset.sizeBytes} B</span>
                      </button>
                    );
                  })}
                </div>

                {/* File content viewer */}
                <div className="md:col-span-2 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-mono text-indigo-600 dark:text-cyan-300">{selectedAsset?.relativePath}</span>
                    <button
                      onClick={() => handleCopy(assetContent, 'asset-content')}
                      className="flex items-center gap-1 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition"
                    >
                      {copiedPrompt === 'asset-content' ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>Copy</span>
                    </button>
                  </div>

                  <pre className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono text-slate-800 dark:text-slate-200 overflow-x-auto max-h-96">
                    {loadingAsset ? 'Loading asset...' : assetContent}
                  </pre>
                </div>

              </div>
            </div>
          )}

          {/* TAB 5: METADATA & PATHS */}
          {activeTab === 'meta' && (
            <div className="space-y-4 text-xs font-mono">
              <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-2.5">
                <div>
                  <span className="text-slate-500">Skill ID: </span>
                  <span className="text-indigo-600 dark:text-cyan-300 font-bold">{skill.id}</span>
                </div>
                {skill.author && (
                  <div>
                    <span className="text-slate-500">Author / Creator: </span>
                    <span className="text-indigo-600 dark:text-indigo-300 font-semibold">{skill.author}</span>
                  </div>
                )}
                <div>
                  <span className="text-slate-500">Slash Command: </span>
                  <span className="text-indigo-600 dark:text-cyan-300">{skill.slashCommand}</span>
                </div>
                <div>
                  <span className="text-slate-500">Source Directory: </span>
                  <span className="text-slate-700 dark:text-slate-300">{skill.sourceDir}</span>
                </div>
                <div>
                  <span className="text-slate-500">File Path: </span>
                  <span className="text-slate-700 dark:text-slate-300">{skill.filePath}</span>
                </div>
                <div>
                  <span className="text-slate-500">Real Path: </span>
                  <span className="text-slate-700 dark:text-slate-300">{skill.realFilePath}</span>
                </div>
                {skill.overridesGlobal && (
                  <div>
                    <span className="text-slate-500">Override Status: </span>
                    <span className="text-indigo-600 dark:text-cyan-300">Overrides global skill ({skill.overriddenPath})</span>
                  </div>
                )}
                {skill.isSymlink && (
                  <div>
                    <span className="text-slate-500">Symlink Target: </span>
                    <span className="text-purple-600 dark:text-purple-300">{skill.symlinkTarget}</span>
                  </div>
                )}
                <div>
                  <span className="text-slate-500">Last Modified: </span>
                  <span className="text-slate-600 dark:text-slate-400">{new Date(skill.updatedAt || '').toLocaleString()}</span>
                </div>
              </div>

              {Object.keys(skill.frontmatter).length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-sans font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-xs">
                    Raw YAML Frontmatter
                  </h4>
                  <pre className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-amber-700 dark:text-amber-300 overflow-x-auto">
                    {JSON.stringify(skill.frontmatter, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80 flex items-center justify-between text-xs transition-colors">
          <div className="flex items-center gap-2 text-slate-500">
            <span>Press <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono">Esc</kbd> to close</span>
          </div>

          <button
            onClick={() => handleCopy(`Use the "${skill.id}" skill for my task.`, 'footer-copy')}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-medium flex items-center gap-2 shadow-lg shadow-indigo-500/20 transition"
          >
            {copiedPrompt === 'footer-copy' ? <Check className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
            <span>{copiedPrompt === 'footer-copy' ? 'Copied Prompt!' : 'Use This Skill'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
