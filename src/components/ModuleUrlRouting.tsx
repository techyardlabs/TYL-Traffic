import React, { useState } from 'react';
import { 
  Network, 
  Plus, 
  Trash2, 
  Link2, 
  Compass, 
  ArrowRight, 
  Sparkles,
  Layers,
  CheckCircle2,
  FileCode
} from 'lucide-react';
import { UrlRoutingConfig } from '../types/campaign';

interface Props {
  config: UrlRoutingConfig;
  targetDomain: string;
  onUpdate: (updated: Partial<UrlRoutingConfig>) => void;
}

export const ModuleUrlRouting: React.FC<Props> = ({
  config,
  targetDomain,
  onUpdate
}) => {
  const [newEntryUrl, setNewEntryUrl] = useState('');
  const [newInnerUrl, setNewInnerUrl] = useState('');
  const [newExitUrl, setNewExitUrl] = useState('');

  const addEntryUrl = () => {
    if (!newEntryUrl.trim()) return;
    let url = newEntryUrl.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = `https://${url}`;
    }
    onUpdate({ entryUrls: [...config.entryUrls, url] });
    setNewEntryUrl('');
  };

  const removeEntryUrl = (index: number) => {
    onUpdate({ entryUrls: config.entryUrls.filter((_, i) => i !== index) });
  };

  const addInnerUrl = () => {
    if (!newInnerUrl.trim()) return;
    let url = newInnerUrl.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = `https://${url}`;
    }
    onUpdate({ innerUrls: [...config.innerUrls, url] });
    setNewInnerUrl('');
  };

  const removeInnerUrl = (index: number) => {
    onUpdate({ innerUrls: config.innerUrls.filter((_, i) => i !== index) });
  };

  const addExitUrl = () => {
    if (!newExitUrl.trim()) return;
    let url = newExitUrl.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = `https://${url}`;
    }
    onUpdate({ exitUrls: [...config.exitUrls, url] });
    setNewExitUrl('');
  };

  const removeExitUrl = (index: number) => {
    onUpdate({ exitUrls: config.exitUrls.filter((_, i) => i !== index) });
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 md:p-6 mb-6 shadow-xl backdrop-blur-sm">
      
      {/* Section Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-slate-800/80">
        <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
          <Network className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            Module C: URL Routing & Flow Architecture
            <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-mono">
              SESSION NAVIGATION PATH
            </span>
          </h3>
          <p className="text-xs text-slate-400">
            Define landing pages, multi-hop sub-page pathways, sitemap discovery, and exit destinations
          </p>
        </div>
      </div>

      {/* Visual Navigation Flow Pipeline */}
      <div className="my-5 p-4 rounded-xl bg-slate-950/70 border border-slate-800/80">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-300 pb-3 border-b border-slate-800/60">
          <span className="flex items-center gap-1.5">
            <Compass className="h-4 w-4 text-indigo-400" />
            Session Navigation Flow Visualizer
          </span>
          <span className="font-mono text-indigo-300">
            Depth: {config.innerPagesPerVisit} {config.innerPagesPerVisit === 1 ? 'Page' : 'Pages'} per Session
          </span>
        </div>

        <div className="flex items-center gap-2 md:gap-4 overflow-x-auto py-3 text-xs">
          {/* Step 1: Entry Landing */}
          <div className="flex-1 min-w-[160px] p-3 rounded-lg bg-slate-900 border border-indigo-500/40 space-y-1">
            <div className="flex items-center justify-between text-[11px] text-indigo-400 font-bold uppercase tracking-wider">
              <span>Step 1: Entry URL</span>
              <span className="h-2 w-2 rounded-full bg-indigo-400" />
            </div>
            <p className="font-mono text-slate-200 text-xs truncate">
              {config.entryUrls[0] || `https://${targetDomain}`}
            </p>
            <span className="text-[10px] text-slate-500">
              {config.entryUrls.length} configured options
            </span>
          </div>

          <ArrowRight className="h-4 w-4 text-slate-600 shrink-0" />

          {/* Step 2: Inner Multi-Hops */}
          <div className="flex-1 min-w-[160px] p-3 rounded-lg bg-slate-900 border border-violet-500/40 space-y-1">
            <div className="flex items-center justify-between text-[11px] text-violet-400 font-bold uppercase tracking-wider">
              <span>Step 2: Inner Hops</span>
              <span className="h-2 w-2 rounded-full bg-violet-400" />
            </div>
            <p className="font-mono text-slate-200 text-xs truncate">
              {config.innerPagesPerVisit > 1 
                ? `${config.innerPagesPerVisit - 1} sub-page hops` 
                : '1-page visit'}
            </p>
            <span className="text-[10px] text-slate-500">
              {config.innerUrls.length} target sub-pages
            </span>
          </div>

          <ArrowRight className="h-4 w-4 text-slate-600 shrink-0" />

          {/* Step 3: Exit Destination */}
          <div className="flex-1 min-w-[160px] p-3 rounded-lg bg-slate-900 border border-emerald-500/40 space-y-1">
            <div className="flex items-center justify-between text-[11px] text-emerald-400 font-bold uppercase tracking-wider">
              <span>Step 3: Exit Hop</span>
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
            </div>
            <p className="font-mono text-slate-200 text-xs truncate">
              {config.exitUrls[0] || 'Natural Session Terminate'}
            </p>
            <span className="text-[10px] text-slate-500">
              {config.exitUrls.length > 0 ? `${config.exitUrls.length} designated URLs` : 'Natural Exit'}
            </span>
          </div>
        </div>
      </div>

      {/* Inner Pages Selector & Sitemap Crawler Switch */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        
        {/* Inner Pages Per Visit */}
        <div className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-200 flex items-center gap-2">
              <Layers className="h-4 w-4 text-indigo-400" />
              Inner Pages Per Visit (Page Views / Session)
            </label>
            <span className="font-mono text-base font-extrabold text-indigo-300">
              {config.innerPagesPerVisit}
            </span>
          </div>

          <input
            id="slider-inner-pages-per-visit"
            type="range"
            min="1"
            max="10"
            step="1"
            value={config.innerPagesPerVisit}
            onChange={(e) => onUpdate({ innerPagesPerVisit: parseInt(e.target.value, 10) })}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer"
          />

          <div className="flex justify-between text-[11px] font-mono text-slate-500">
            <span>1 (Single Page)</span>
            <span>3 (Standard Deep)</span>
            <span>5 (High Engagement)</span>
            <span>10 (Maximum)</span>
          </div>
        </div>

        {/* Automatic Sitemap & RSS Feed Crawling */}
        <div className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-200 flex items-center gap-2">
              <FileCode className="h-4 w-4 text-violet-400" />
              Auto-Crawl Sitemap / RSS Feed
            </label>
            <button
              type="button"
              id="toggle-sitemap-crawl"
              onClick={() => onUpdate({ autoCrawlSitemap: !config.autoCrawlSitemap })}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                config.autoCrawlSitemap
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {config.autoCrawlSitemap ? 'Active (Auto-Fetch)' : 'Disabled'}
            </button>
          </div>

          {config.autoCrawlSitemap && (
            <input
              id="input-sitemap-url"
              type="text"
              value={config.sitemapUrl || `https://${targetDomain}/sitemap.xml`}
              onChange={(e) => onUpdate({ sitemapUrl: e.target.value })}
              placeholder="https://yourdomain.com/sitemap.xml"
              className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-1.5 text-xs font-mono text-indigo-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          )}

          <p className="text-[11px] text-slate-400 leading-tight">
            Automatically parses XML sitemaps to dynamically rotate real URLs into the inner routing queue.
          </p>
        </div>

      </div>

      {/* 3 URL List Columns: Entry, Inner, and Exit */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* 1. Entry URLs */}
        <div className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
              <Link2 className="h-3.5 w-3.5" />
              Entry Landing URLs ({config.entryUrls.length})
            </span>
          </div>

          {/* Add Input */}
          <div className="flex gap-1.5">
            <input
              id="input-entry-url"
              type="text"
              value={newEntryUrl}
              onChange={(e) => setNewEntryUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addEntryUrl()}
              placeholder="https://domain.com/landing"
              className="flex-1 bg-slate-900 border border-slate-700/70 rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <button
              id="btn-add-entry-url"
              onClick={addEntryUrl}
              className="px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* List */}
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {config.entryUrls.map((url, idx) => (
              <div key={idx} className="flex items-center justify-between gap-2 p-2 rounded-lg bg-slate-900/80 border border-slate-800/60 text-xs">
                <span className="font-mono text-slate-300 truncate" title={url}>{url}</span>
                <button
                  onClick={() => removeEntryUrl(idx)}
                  className="text-slate-500 hover:text-rose-400 p-1 cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Inner URLs */}
        <div className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-violet-300 flex items-center gap-1.5">
              <Link2 className="h-3.5 w-3.5" />
              Inner Sub-Pages ({config.innerUrls.length})
            </span>
          </div>

          {/* Add Input */}
          <div className="flex gap-1.5">
            <input
              id="input-inner-url"
              type="text"
              value={newInnerUrl}
              onChange={(e) => setNewInnerUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addInnerUrl()}
              placeholder="https://domain.com/features"
              className="flex-1 bg-slate-900 border border-slate-700/70 rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-200 focus:outline-none focus:ring-1 focus:ring-violet-500"
            />
            <button
              id="btn-add-inner-url"
              onClick={addInnerUrl}
              className="px-2.5 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* List */}
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {config.innerUrls.map((url, idx) => (
              <div key={idx} className="flex items-center justify-between gap-2 p-2 rounded-lg bg-slate-900/80 border border-slate-800/60 text-xs">
                <span className="font-mono text-slate-300 truncate" title={url}>{url}</span>
                <button
                  onClick={() => removeInnerUrl(idx)}
                  className="text-slate-500 hover:text-rose-400 p-1 cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Exit URLs */}
        <div className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
              <Link2 className="h-3.5 w-3.5" />
              Exit Destination URLs ({config.exitUrls.length})
            </span>
          </div>

          {/* Add Input */}
          <div className="flex gap-1.5">
            <input
              id="input-exit-url"
              type="text"
              value={newExitUrl}
              onChange={(e) => setNewExitUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addExitUrl()}
              placeholder="https://domain.com/thank-you"
              className="flex-1 bg-slate-900 border border-slate-700/70 rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            <button
              id="btn-add-exit-url"
              onClick={addExitUrl}
              className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* List */}
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {config.exitUrls.length === 0 ? (
              <div className="text-[11px] text-slate-500 p-2 italic">
                No specific exit URL. Browser will conclude session naturally.
              </div>
            ) : (
              config.exitUrls.map((url, idx) => (
                <div key={idx} className="flex items-center justify-between gap-2 p-2 rounded-lg bg-slate-900/80 border border-slate-800/60 text-xs">
                  <span className="font-mono text-slate-300 truncate" title={url}>{url}</span>
                  <button
                    onClick={() => removeExitUrl(idx)}
                    className="text-slate-500 hover:text-rose-400 p-1 cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
