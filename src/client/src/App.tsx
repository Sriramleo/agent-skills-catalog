import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Fuse from 'fuse.js';
import { Skill, SkillCatalogResult, ViewMode } from './types';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { SkillCard } from './components/SkillCard';
import { SkillMatrix } from './components/SkillMatrix';
import { SkillModal } from './components/SkillModal';
import { StatsDashboard } from './components/StatsDashboard';
import {
  Sparkles,
  Search,
  CheckCircle2,
  Terminal,
  Zap,
  HelpCircle,
  AlertCircle,
  Keyboard,
  Star
} from 'lucide-react';

declare global {
  interface Window {
    __PRELOADED_CATALOG__?: SkillCatalogResult;
  }
}

const FAVORITES_STORAGE_KEY = 'agent_skills_favorites_v1';

export function App() {
  const [catalog, setCatalog] = useState<SkillCatalogResult | null>(
    window.__PRELOADED_CATALOG__ || null
  );
  const [isLoading, setIsLoading] = useState<boolean>(!window.__PRELOADED_CATALOG__);
  const [error, setError] = useState<string | null>(null);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedHarness, setSelectedHarness] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [showOnlyOverridden, setShowOnlyOverridden] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  // Favorites (LocalStorage)
  const [favorites, setFavorites] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem(FAVORITES_STORAGE_KEY);
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  // Active item index for Keyboard Navigation (j / k / Enter)
  const [activeIndex, setActiveIndex] = useState<number>(-1);

  // Modal State
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);

  // Toast Notification State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Save favorites to LocalStorage
  const toggleFavorite = useCallback((skillId: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(skillId)) {
        next.delete(skillId);
      } else {
        next.add(skillId);
      }
      try {
        localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(Array.from(next)));
      } catch {}
      return next;
    });
  }, []);

  // Fetch Catalog from API
  const fetchCatalog = async (forceRefresh = false) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/catalog${forceRefresh ? '?refresh=true' : ''}`);
      if (!res.ok) throw new Error(`HTTP Error ${res.status}: Failed to fetch skills catalog`);
      const json = await res.json();
      if (json.success && json.data) {
        setCatalog(json.data);
      } else {
        throw new Error(json.error || 'Invalid catalog response');
      }
    } catch (err: any) {
      if (window.__PRELOADED_CATALOG__) {
        setCatalog(window.__PRELOADED_CATALOG__);
      } else {
        setError(err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!window.__PRELOADED_CATALOG__) {
      fetchCatalog();
    }
  }, []);

  // Sync with URL parameters on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const qParam = params.get('q');
    const catParam = params.get('category');
    const harnessParam = params.get('harness');
    const tagParam = params.get('tag');
    const toolParam = params.get('tool');
    const viewParam = params.get('view') as ViewMode;
    const skillParam = params.get('skill');

    if (qParam) setSearchQuery(qParam);
    if (catParam) setSelectedCategory(catParam);
    if (harnessParam) setSelectedHarness(harnessParam);
    if (tagParam) setSelectedTag(tagParam);
    if (toolParam) setSelectedTool(toolParam);
    if (viewParam && ['grid', 'table', 'dashboard'].includes(viewParam)) setViewMode(viewParam);

    if (skillParam && catalog) {
      const found = catalog.skills.find((s) => s.id === skillParam);
      if (found) setSelectedSkill(found);
    }
  }, [catalog]);

  // Update URL parameters on filter change
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (selectedCategory) params.set('category', selectedCategory);
    if (selectedHarness) params.set('harness', selectedHarness);
    if (selectedTag) params.set('tag', selectedTag);
    if (selectedTool) params.set('tool', selectedTool);
    if (viewMode !== 'grid') params.set('view', viewMode);
    if (selectedSkill) params.set('skill', selectedSkill.id);

    const newUrl = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
    window.history.replaceState(null, '', newUrl);
  }, [searchQuery, selectedCategory, selectedHarness, selectedTag, selectedTool, viewMode, selectedSkill]);

  // Initialize Fuse.js for Instant Fuzzy Search
  const fuse = useMemo(() => {
    if (!catalog) return null;
    return new Fuse(catalog.skills, {
      keys: [
        { name: 'id', weight: 0.4 },
        { name: 'title', weight: 0.3 },
        { name: 'tags', weight: 0.2 },
        { name: 'detectedTools', weight: 0.2 },
        { name: 'description', weight: 0.15 },
        { name: 'whenToUse', weight: 0.1 }
      ],
      threshold: 0.35,
      ignoreLocation: true
    });
  }, [catalog]);

  // Filtered skills computation
  const filteredSkills = useMemo(() => {
    if (!catalog) return [];
    let list = catalog.skills;

    // 1. Text Search with Fuse
    if (searchQuery.trim() && fuse) {
      list = fuse.search(searchQuery.trim()).map((result) => result.item);
    }

    // 2. Category Filter
    if (selectedCategory) {
      list = list.filter((s) => s.category.toLowerCase() === selectedCategory.toLowerCase());
    }

    // 3. Harness Filter
    if (selectedHarness) {
      list = list.filter((s) => s.harness.toLowerCase() === selectedHarness.toLowerCase());
    }

    // 4. Tag Filter
    if (selectedTag) {
      list = list.filter((s) => s.tags.includes(selectedTag.toLowerCase()));
    }

    // 5. Tool / MCP Filter
    if (selectedTool) {
      list = list.filter((s) =>
        s.detectedTools.some((t) => t.toLowerCase() === selectedTool.toLowerCase())
      );
    }

    // 6. Starred Filter
    if (showOnlyFavorites) {
      list = list.filter((s) => favorites.has(s.id));
    }

    // 7. Overridden Filter
    if (showOnlyOverridden) {
      list = list.filter((s) => s.overridesGlobal);
    }

    return list;
  }, [
    catalog,
    searchQuery,
    selectedCategory,
    selectedHarness,
    selectedTag,
    selectedTool,
    showOnlyFavorites,
    showOnlyOverridden,
    favorites,
    fuse
  ]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleClearAllFilters = () => {
    setSearchQuery('');
    setSelectedCategory(null);
    setSelectedHarness(null);
    setSelectedTag(null);
    setSelectedTool(null);
    setShowOnlyFavorites(false);
    setShowOnlyOverridden(false);
  };

  // Keyboard navigation listeners (j / k / Enter / c / s)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if inside an input, textarea, or select
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (['input', 'textarea', 'select'].includes(tag)) return;

      if (selectedSkill) return; // Modal is open, Esc handled in modal

      if (e.key === 'j' || e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((prev) => Math.min(prev + 1, filteredSkills.length - 1));
      } else if (e.key === 'k' || e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter' && activeIndex >= 0 && activeIndex < filteredSkills.length) {
        e.preventDefault();
        setSelectedSkill(filteredSkills[activeIndex]);
      } else if (e.key === 'c' && activeIndex >= 0 && activeIndex < filteredSkills.length) {
        e.preventDefault();
        const activeSkill = filteredSkills[activeIndex];
        const prompt = `Use the "${activeSkill.id}" skill to help me with this task.`;
        navigator.clipboard.writeText(prompt);
        showToast(`Copied prompt for ${activeSkill.title}`);
      } else if (e.key === 's' && activeIndex >= 0 && activeIndex < filteredSkills.length) {
        e.preventDefault();
        const activeSkill = filteredSkills[activeIndex];
        toggleFavorite(activeSkill.id);
        showToast(favorites.has(activeSkill.id) ? `Unstarred ${activeSkill.title}` : `Starred ${activeSkill.title}`);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [filteredSkills, activeIndex, selectedSkill, favorites, toggleFavorite]);

  const hasActiveFilters = Boolean(
    searchQuery ||
    selectedCategory ||
    selectedHarness ||
    selectedTag ||
    selectedTool ||
    showOnlyFavorites ||
    showOnlyOverridden
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-indigo-600 text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-medium border border-indigo-400/40 animate-slide-up">
          <CheckCircle2 className="w-4 h-4 text-cyan-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        catalog={catalog}
        isLoading={isLoading}
        onRefresh={() => fetchCatalog(true)}
        totalVisible={filteredSkills.length}
      />

      {/* Main Container */}
      <main className="max-w-7xl w-full mx-auto px-4 lg:px-8 py-6 flex-1 flex flex-col">
        
        {/* Error Notification */}
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-950/40 border border-rose-800/80 text-rose-300 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => fetchCatalog(true)}
              className="px-3 py-1 bg-rose-900/60 hover:bg-rose-900 rounded-lg text-rose-200 font-medium"
            >
              Retry
            </button>
          </div>
        )}

        {/* Loading Skeleton */}
        {isLoading && !catalog && (
          <div className="flex-1 flex flex-col items-center justify-center py-20 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-500 animate-spin p-1 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[14px]" />
            </div>
            <p className="text-sm text-slate-400 font-medium animate-pulse">
              Scanning agent skills across all harnesses...
            </p>
          </div>
        )}

        {/* Loaded Content */}
        {catalog && (
          <div className="flex-1 flex flex-col lg:flex-row gap-8 items-start">
            
            {/* Left Sidebar Filters */}
            <Sidebar
              categories={catalog.categories}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              harnesses={catalog.harnesses}
              selectedHarness={selectedHarness}
              onSelectHarness={setSelectedHarness}
              tags={catalog.tags}
              selectedTag={selectedTag}
              onSelectTag={setSelectedTag}
              tools={catalog.tools || []}
              selectedTool={selectedTool}
              onSelectTool={setSelectedTool}
              favoritesCount={favorites.size}
              showOnlyFavorites={showOnlyFavorites}
              onToggleFavorites={() => setShowOnlyFavorites(!showOnlyFavorites)}
              overriddenCount={catalog.overriddenCount}
              showOnlyOverridden={showOnlyOverridden}
              onToggleOverridden={() => setShowOnlyOverridden(!showOnlyOverridden)}
              totalSkills={catalog.totalSkills}
              onClearAll={handleClearAllFilters}
              hasActiveFilters={hasActiveFilters}
            />

            {/* Right Main Panel */}
            <div className="flex-1 w-full space-y-6">
              
              {/* Active Filter Pills & Results Counter */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-white">
                    {viewMode === 'dashboard' ? 'Catalog Intelligence & Analytics' : 'Skills Directory'}
                  </span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-cyan-400 font-mono font-medium">
                    {filteredSkills.length} of {catalog.totalSkills}
                  </span>
                </div>

                {hasActiveFilters && (
                  <div className="flex flex-wrap items-center gap-1.5 text-xs">
                    {searchQuery && (
                      <span className="px-2 py-0.5 rounded-lg bg-cyan-950/60 border border-cyan-800/40 text-cyan-300 flex items-center gap-1 font-mono">
                        q: "{searchQuery}"
                      </span>
                    )}
                    {showOnlyFavorites && (
                      <span className="px-2 py-0.5 rounded-lg bg-amber-950/60 border border-amber-800/40 text-amber-300 flex items-center gap-1">
                        <Star className="w-3 h-3 fill-amber-300" />
                        Starred
                      </span>
                    )}
                    {selectedCategory && (
                      <span className="px-2 py-0.5 rounded-lg bg-indigo-950/60 border border-indigo-800/40 text-indigo-300 flex items-center gap-1">
                        cat: {selectedCategory}
                      </span>
                    )}
                    {selectedTool && (
                      <span className="px-2 py-0.5 rounded-lg bg-emerald-950/60 border border-emerald-800/40 text-emerald-300 flex items-center gap-1">
                        tool: {selectedTool}
                      </span>
                    )}
                    {selectedHarness && (
                      <span className="px-2 py-0.5 rounded-lg bg-purple-950/60 border border-purple-800/40 text-purple-300 flex items-center gap-1">
                        harness: {selectedHarness}
                      </span>
                    )}
                    {selectedTag && (
                      <span className="px-2 py-0.5 rounded-lg bg-amber-950/60 border border-amber-800/40 text-amber-300 flex items-center gap-1 font-mono">
                        #{selectedTag}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* VIEW MODE 1: GRID CARDS */}
              {viewMode === 'grid' && (
                <div>
                  {filteredSkills.length === 0 ? (
                    <div className="glass-panel rounded-2xl p-12 text-center space-y-3">
                      <Search className="w-8 h-8 text-slate-600 mx-auto" />
                      <h3 className="text-base font-semibold text-slate-300">No matching skills found</h3>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto">
                        Try adjusting your keywords, selecting a different category, or resetting all active filters.
                      </p>
                      <button
                        onClick={handleClearAllFilters}
                        className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition"
                      >
                        Reset Filters
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                      {filteredSkills.map((skill, idx) => (
                        <SkillCard
                          key={skill.id}
                          skill={skill}
                          onSelect={setSelectedSkill}
                          onCopyPrompt={(p) => showToast('AI Prompt copied to clipboard!')}
                          isFavorite={favorites.has(skill.id)}
                          onToggleFavorite={toggleFavorite}
                          isActive={activeIndex === idx}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* VIEW MODE 2: TABLE MATRIX */}
              {viewMode === 'table' && (
                <SkillMatrix
                  skills={filteredSkills}
                  onSelect={setSelectedSkill}
                  onCopyPrompt={(p) => showToast('AI Prompt copied to clipboard!')}
                  favorites={favorites}
                  onToggleFavorite={toggleFavorite}
                  activeIndex={activeIndex}
                />
              )}

              {/* VIEW MODE 3: STATS DASHBOARD */}
              {viewMode === 'dashboard' && (
                <StatsDashboard
                  catalog={catalog}
                  onSelectCategory={(catId) => {
                    setSelectedCategory(catId);
                    setViewMode('grid');
                  }}
                  onSelectTag={(t) => {
                    setSelectedTag(t);
                    setViewMode('grid');
                  }}
                />
              )}

            </div>
          </div>
        )}

      </main>

      {/* Footer with Keyboard Cheatsheet */}
      <footer className="w-full border-t border-slate-800/80 bg-slate-950 px-4 py-6 text-xs text-slate-500 text-center">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-slate-400 font-mono text-[11px]">
              <Keyboard className="w-3.5 h-3.5 text-cyan-400" />
              <kbd className="px-1 py-0.2 bg-slate-900 rounded border border-slate-800">j</kbd>/<kbd className="px-1 py-0.2 bg-slate-900 rounded border border-slate-800">k</kbd> navigate
              <kbd className="px-1 py-0.2 bg-slate-900 rounded border border-slate-800 ml-1">Enter</kbd> open
              <kbd className="px-1 py-0.2 bg-slate-900 rounded border border-slate-800 ml-1">c</kbd> copy
              <kbd className="px-1 py-0.2 bg-slate-900 rounded border border-slate-800 ml-1">s</kbd> star
              <kbd className="px-1 py-0.2 bg-slate-900 rounded border border-slate-800 ml-1">/</kbd> search
            </span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Production Safe (Read-Only)</span>
            <span>Zero Telemetry</span>
            <span>MIT License</span>
          </div>
        </div>
      </footer>

      {/* Detail Modal */}
      <SkillModal
        skill={selectedSkill}
        onClose={() => setSelectedSkill(null)}
        onCopyPrompt={(p) => showToast('Copied to clipboard!')}
        isFavorite={selectedSkill ? favorites.has(selectedSkill.id) : false}
        onToggleFavorite={toggleFavorite}
      />

    </div>
  );
}
