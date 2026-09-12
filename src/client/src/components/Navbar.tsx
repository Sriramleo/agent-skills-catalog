import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Sparkles,
  LayoutGrid,
  Table as TableIcon,
  BarChart3,
  Download,
  RotateCw,
  X,
  FileCode,
  FileJson,
  Globe
} from 'lucide-react';
import { ViewMode, SkillCatalogResult } from '../types';

interface NavbarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  catalog: SkillCatalogResult | null;
  isLoading: boolean;
  onRefresh: () => void;
  totalVisible: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  searchQuery,
  onSearchChange,
  viewMode,
  onViewModeChange,
  catalog,
  isLoading,
  onRefresh,
  totalVisible
}) => {
  const [showExportMenu, setShowExportMenu] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  // Global Keyboard shortcut: "/" or "Ctrl+K" / "Cmd+K" to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === '/' || ((e.metaKey || e.ctrlKey) && e.key === 'k')) && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close export menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target as Node)) {
        setShowExportMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExportJSON = () => {
    if (!catalog) return;
    const blob = new Blob([JSON.stringify(catalog, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `skills-catalog-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  const handleExportMarkdown = () => {
    if (!catalog) return;
    let md = `# Agent Skills Catalog\n\nGenerated: ${new Date().toLocaleString()}\nTotal Skills: ${catalog.totalSkills}\n\n`;
    for (const cat of catalog.categories) {
      md += `## ${cat.name} (${cat.count})\n\n`;
      const skills = catalog.skills.filter((s) => s.category === cat.id);
      for (const s of skills) {
        md += `### ${s.title} (\`${s.id}\`)\n`;
        md += `- **Description**: ${s.description}\n`;
        md += `- **When to use**: ${s.whenToUse}\n`;
        md += `- **Harness**: ${s.harnessLabel} | Tokens: ~${s.stats.tokenEstimate}\n\n`;
      }
    }
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `agent-skills-catalog.md`;
    a.click();
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80 px-4 lg:px-8 py-3 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Brand / Logo */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-500 p-0.5 shadow-lg shadow-indigo-500/20 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base bg-gradient-to-r from-cyan-400 via-indigo-300 to-purple-300 bg-clip-text text-transparent">
                Skills Catalog
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono border border-indigo-500/30">
                v1.0
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">Universal Agent Skills Hub</p>
          </div>
        </div>

        {/* Live Search Bar */}
        <div className="flex-1 max-w-xl relative">
          <div className="relative flex items-center">
            <Search className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search by skill name, keyword, tag, or when-to-use... (Press / to focus)"
              className="w-full pl-10 pr-10 py-2 text-sm bg-slate-900/90 hover:bg-slate-900 focus:bg-slate-900 border border-slate-700/80 focus:border-cyan-500 rounded-xl text-slate-100 placeholder:text-slate-500 outline-none transition shadow-inner focus:ring-2 focus:ring-cyan-500/20"
            />
            {searchQuery ? (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 p-0.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-slate-200"
                title="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            ) : (
              <kbd className="absolute right-3 hidden sm:inline-flex items-center gap-0.5 text-[10px] font-mono font-medium text-slate-400 bg-slate-800 border border-slate-700 rounded px-1.5 py-0.5">
                /
              </kbd>
            )}
          </div>
        </div>

        {/* Action Controls & View Switcher */}
        <div className="flex items-center gap-2">
          
          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-900/80 border border-slate-800 rounded-xl p-1 text-slate-400">
            <button
              onClick={() => onViewModeChange('grid')}
              className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition ${
                viewMode === 'grid'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'hover:text-slate-200 hover:bg-slate-800/60'
              }`}
              title="Grid Cards View"
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden md:inline">Cards</span>
            </button>
            <button
              onClick={() => onViewModeChange('table')}
              className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition ${
                viewMode === 'table'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'hover:text-slate-200 hover:bg-slate-800/60'
              }`}
              title="Table View"
            >
              <TableIcon className="w-4 h-4" />
              <span className="hidden md:inline">Table</span>
            </button>
            <button
              onClick={() => onViewModeChange('dashboard')}
              className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition ${
                viewMode === 'dashboard'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'hover:text-slate-200 hover:bg-slate-800/60'
              }`}
              title="Analytics Dashboard"
            >
              <BarChart3 className="w-4 h-4" />
              <span className="hidden md:inline">Stats</span>
            </button>
          </div>

          {/* Export Dropdown */}
          <div className="relative" ref={exportMenuRef}>
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="px-3 py-2 text-xs font-medium bg-slate-900 hover:bg-slate-800 border border-slate-700/80 hover:border-slate-600 rounded-xl text-slate-200 flex items-center gap-1.5 transition"
              title="Export Catalog"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Export</span>
            </button>

            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-1.5 z-50 animate-slide-up text-xs">
                <button
                  onClick={handleExportJSON}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-200 hover:bg-slate-800 hover:text-cyan-300 transition text-left"
                >
                  <FileJson className="w-4 h-4 text-amber-400" />
                  <span>Download JSON</span>
                </button>
                <button
                  onClick={handleExportMarkdown}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-200 hover:bg-slate-800 hover:text-cyan-300 transition text-left"
                >
                  <FileCode className="w-4 h-4 text-emerald-400" />
                  <span>Export Markdown</span>
                </button>
                <div className="border-t border-slate-800 my-1"></div>
                <div className="px-3 py-1.5 text-[10px] text-slate-400">
                  Tip: Run <code className="text-cyan-400">--export ./docs</code> for static web hosting.
                </div>
              </div>
            )}
          </div>

          {/* Refresh Button */}
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-xl text-slate-400 hover:text-slate-200 transition disabled:opacity-50"
            title="Rescan Skill Directories"
          >
            <RotateCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
        </div>

      </div>
    </header>
  );
};
