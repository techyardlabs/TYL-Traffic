import React, { useState } from 'react';
import { 
  PieChart, 
  Search, 
  Share2, 
  Globe, 
  Plus, 
  Trash2, 
  Sliders, 
  Scale,
  Sparkles,
  ExternalLink,
  Tag
} from 'lucide-react';
import { 
  TrafficSplittingConfig, 
  SearchEngine, 
  SocialNetwork, 
  KeywordEntry, 
  CustomReferrerEntry 
} from '../types/campaign';

interface Props {
  config: TrafficSplittingConfig;
  onUpdate: (updated: Partial<TrafficSplittingConfig>) => void;
}

export const ModuleTrafficSplitting: React.FC<Props> = ({
  config,
  onUpdate
}) => {
  const [newKeyword, setNewKeyword] = useState('');
  const [newKeywordEngine, setNewKeywordEngine] = useState<SearchEngine>('google');
  const [newCustomUrl, setNewCustomUrl] = useState('');

  const totalAllocated = 
    config.directPercent + 
    config.organicPercent + 
    config.socialPercent + 
    config.customPercent;

  const isBalanced = totalAllocated === 100;

  // Auto-normalize to 100%
  const handleAutoBalance = () => {
    if (totalAllocated === 0) {
      onUpdate({ directPercent: 25, organicPercent: 50, socialPercent: 15, customPercent: 10 });
      return;
    }
    const factor = 100 / totalAllocated;
    const direct = Math.round(config.directPercent * factor);
    const organic = Math.round(config.organicPercent * factor);
    const social = Math.round(config.socialPercent * factor);
    const custom = Math.max(0, 100 - (direct + organic + social));
    onUpdate({
      directPercent: direct,
      organicPercent: organic,
      socialPercent: social,
      customPercent: custom
    });
  };

  const addKeyword = () => {
    if (!newKeyword.trim()) return;
    const entry: KeywordEntry = {
      keyword: newKeyword.trim(),
      searchEngine: newKeywordEngine,
      weight: 25
    };
    onUpdate({
      organicKeywords: [...config.organicKeywords, entry]
    });
    setNewKeyword('');
  };

  const removeKeyword = (index: number) => {
    onUpdate({
      organicKeywords: config.organicKeywords.filter((_, i) => i !== index)
    });
  };

  const addCustomReferrer = () => {
    if (!newCustomUrl.trim()) return;
    let url = newCustomUrl.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = `https://${url}`;
    }
    const entry: CustomReferrerEntry = {
      id: `cr_${Date.now()}`,
      url,
      weight: 50
    };
    onUpdate({
      customReferrers: [...config.customReferrers, entry]
    });
    setNewCustomUrl('');
  };

  const removeCustomReferrer = (id: string) => {
    onUpdate({
      customReferrers: config.customReferrers.filter(r => r.id !== id)
    });
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 md:p-6 mb-6 shadow-xl backdrop-blur-sm">
      
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <PieChart className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              Module D: Source & Traffic Splitting
              <span className={`text-[10px] px-2 py-0.5 rounded font-mono border ${
                isBalanced 
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
              }`}>
                {totalAllocated}% TOTAL ({isBalanced ? 'BALANCED' : `${100 - totalAllocated}% REMAINING`})
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Allocate traffic origins between Direct, Search Engines (Google/Bing), Social Media, and Custom Referrers
            </p>
          </div>
        </div>

        {!isBalanced && (
          <button
            id="btn-auto-balance-traffic"
            onClick={handleAutoBalance}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/80 hover:bg-indigo-600 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
          >
            <Scale className="h-3.5 w-3.5" />
            Auto-Balance to 100%
          </button>
        )}
      </div>

      {/* 4 Main Allocation Sliders */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-6">
        
        {/* Direct */}
        <div className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-4 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <Globe className="h-4 w-4 text-slate-400" />
              Direct Traffic
            </span>
            <span className="font-mono text-sm font-extrabold text-slate-200">
              {config.directPercent}%
            </span>
          </div>
          <input
            id="slider-split-direct"
            type="range"
            min="0"
            max="100"
            value={config.directPercent}
            onChange={(e) => onUpdate({ directPercent: parseInt(e.target.value, 10) })}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer"
          />
          <p className="text-[11px] text-slate-400">
            Direct address bar typing, bookmarks, or untagged mobile apps
          </p>
        </div>

        {/* Organic Search */}
        <div className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-4 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
              <Search className="h-4 w-4 text-indigo-400" />
              Organic Search
            </span>
            <span className="font-mono text-sm font-extrabold text-indigo-300">
              {config.organicPercent}%
            </span>
          </div>
          <input
            id="slider-split-organic"
            type="range"
            min="0"
            max="100"
            value={config.organicPercent}
            onChange={(e) => onUpdate({ organicPercent: parseInt(e.target.value, 10) })}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer"
          />
          <p className="text-[11px] text-slate-400">
            Google, Bing, Yahoo, DuckDuckGo search queries
          </p>
        </div>

        {/* Social Referrers */}
        <div className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-4 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-violet-300 flex items-center gap-1.5">
              <Share2 className="h-4 w-4 text-violet-400" />
              Social Referrals
            </span>
            <span className="font-mono text-sm font-extrabold text-violet-300">
              {config.socialPercent}%
            </span>
          </div>
          <input
            id="slider-split-social"
            type="range"
            min="0"
            max="100"
            value={config.socialPercent}
            onChange={(e) => onUpdate({ socialPercent: parseInt(e.target.value, 10) })}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer"
          />
          <p className="text-[11px] text-slate-400">
            Twitter/X, LinkedIn, Reddit, Instagram, YouTube
          </p>
        </div>

        {/* Custom Referrers */}
        <div className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-4 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
              <ExternalLink className="h-4 w-4 text-emerald-400" />
              Custom Referrers
            </span>
            <span className="font-mono text-sm font-extrabold text-emerald-300">
              {config.customPercent}%
            </span>
          </div>
          <input
            id="slider-split-custom"
            type="range"
            min="0"
            max="100"
            value={config.customPercent}
            onChange={(e) => onUpdate({ customPercent: parseInt(e.target.value, 10) })}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer"
          />
          <p className="text-[11px] text-slate-400">
            Custom user-defined HTTP Referer headers
          </p>
        </div>

      </div>

      {/* Sub-Panels: Organic Keywords & Custom Referrers List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
        
        {/* Organic Search Engines & Target Keywords */}
        <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <Search className="h-4 w-4 text-indigo-400" />
              Target Organic Keywords & SERP Emulation
            </h4>
            <span className="text-[10px] text-slate-500 font-mono">
              {config.organicKeywords.length} Keywords configured
            </span>
          </div>

          {/* Add Keyword Form */}
          <div className="flex gap-2">
            <select
              id="select-keyword-engine"
              value={newKeywordEngine}
              onChange={(e) => setNewKeywordEngine(e.target.value as SearchEngine)}
              className="bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="google">Google</option>
              <option value="bing">Bing</option>
              <option value="duckduckgo">DuckDuckGo</option>
              <option value="yahoo">Yahoo</option>
              <option value="yandex">Yandex</option>
            </select>
            <input
              id="input-new-keyword"
              type="text"
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addKeyword()}
              placeholder="e.g. b2b saas metrics dashboard"
              className="flex-1 bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <button
              id="btn-add-keyword"
              onClick={addKeyword}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" /> Add
            </button>
          </div>

          {/* Keywords Tag List */}
          <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto pr-1">
            {config.organicKeywords.map((kw, idx) => (
              <span 
                key={idx}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-indigo-500/30 text-xs font-medium text-slate-200"
              >
                <Tag className="h-3 w-3 text-indigo-400" />
                <span className="text-slate-400 font-mono text-[10px] uppercase">[{kw.searchEngine}]</span>
                <span>{kw.keyword}</span>
                <button
                  onClick={() => removeKeyword(idx)}
                  className="text-slate-500 hover:text-rose-400 ml-1 cursor-pointer"
                >
                  &times;
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Custom Referrer Headers */}
        <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <ExternalLink className="h-4 w-4 text-emerald-400" />
              Custom Referrer URLs
            </h4>
            <span className="text-[10px] text-slate-500 font-mono">
              {config.customReferrers.length} Custom domains
            </span>
          </div>

          {/* Add Custom Referrer Form */}
          <div className="flex gap-2">
            <input
              id="input-custom-referrer"
              type="text"
              value={newCustomUrl}
              onChange={(e) => setNewCustomUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addCustomReferrer()}
              placeholder="https://news.ycombinator.com/item?id=389104"
              className="flex-1 bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            <button
              id="btn-add-custom-referrer"
              onClick={addCustomReferrer}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" /> Add
            </button>
          </div>

          {/* Custom Referrer List */}
          <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
            {config.customReferrers.map((ref) => (
              <div 
                key={ref.id}
                className="flex items-center justify-between gap-2 p-2 rounded-lg bg-slate-900/80 border border-slate-800 text-xs"
              >
                <span className="font-mono text-slate-300 truncate">{ref.url}</span>
                <button
                  onClick={() => removeCustomReferrer(ref.id)}
                  className="text-slate-500 hover:text-rose-400 p-1 cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
