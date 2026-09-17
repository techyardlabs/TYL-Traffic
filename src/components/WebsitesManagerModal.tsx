import React, { useState } from 'react';
import {
  X,
  Globe,
  Plus,
  Play,
  Pause,
  Trash2,
  Copy,
  ExternalLink,
  Sliders,
  PieChart,
  Laptop,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  ArrowRight,
  ShieldCheck,
  Zap,
  Activity
} from 'lucide-react';
import { FullCampaignConfig, CampaignStatus } from '../types/campaign';

interface WebsitesManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaigns: FullCampaignConfig[];
  currentCampaignId: string;
  onSelectCampaign: (id: string) => void;
  onOpenAddWebsite: () => void;
  onToggleStatus: (campaignId: string, newStatus: CampaignStatus) => void;
  onDuplicateWebsite: (campaignId: string) => void;
  onDeleteWebsite: (campaignId: string) => void;
}

export const WebsitesManagerModal: React.FC<WebsitesManagerModalProps> = ({
  isOpen,
  onClose,
  campaigns,
  currentCampaignId,
  onSelectCampaign,
  onOpenAddWebsite,
  onToggleStatus,
  onDuplicateWebsite,
  onDeleteWebsite
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  if (!isOpen) return null;

  const filteredCampaigns = campaigns.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.targetDomain.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'ALL' || c.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const runningCount = campaigns.filter(c => c.status === 'RUNNING').length;
  const pausedCount = campaigns.filter(c => c.status === 'PAUSED').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[88vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/30">
              <Globe className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">Websites &amp; Traffic Hub</h2>
                <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-800 text-indigo-400 border border-slate-700">
                  {campaigns.length} {campaigns.length === 1 ? 'Website' : 'Websites'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Manage your websites and configure separate traffic volumes, geo targets, and behavior rules.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-modal-add-website"
              onClick={() => {
                onClose();
                onOpenAddWebsite();
              }}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Add Website</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="px-6 py-3 border-b border-slate-800 bg-slate-900/50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search website by domain or name..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto text-xs">
            <span className="text-slate-500 text-[11px] mr-1 hidden sm:inline">Status:</span>
            {['ALL', 'RUNNING', 'PAUSED', 'DRAFT'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                  filterStatus === st
                    ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800/80'
                }`}
              >
                {st === 'ALL' ? `All (${campaigns.length})` : st}
              </button>
            ))}
          </div>
        </div>

        {/* Websites List */}
        <div className="p-6 space-y-3.5 overflow-y-auto flex-1">
          {filteredCampaigns.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-slate-800 rounded-2xl bg-slate-950/40">
              <Globe className="h-10 w-10 text-slate-600 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-white mb-1">No websites found</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
                {searchTerm ? 'No websites match your search query.' : 'You have not added any websites yet.'}
              </p>
              <button
                onClick={() => {
                  onClose();
                  onOpenAddWebsite();
                }}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Add Your First Website</span>
              </button>
            </div>
          ) : (
            filteredCampaigns.map((site) => {
              const isCurrent = site.id === currentCampaignId;
              const isRunning = site.status === 'RUNNING';
              const viewsProgress = site.totalViewsTarget > 0
                ? Math.min(100, Math.round((site.totalViewsDelivered / site.totalViewsTarget) * 100))
                : 0;

              return (
                <div
                  key={site.id}
                  className={`p-4 rounded-xl border transition-all ${
                    isCurrent
                      ? 'bg-slate-950/90 border-indigo-500/60 shadow-lg shadow-indigo-950/30 ring-1 ring-indigo-500/30'
                      : 'bg-slate-950/50 border-slate-800/90 hover:border-slate-700/80'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                    
                    {/* Left: Info */}
                    <div className="flex-1 space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-base font-bold text-white tracking-tight">
                          {site.name}
                        </span>

                        {isCurrent && (
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                            Active in Editor
                          </span>
                        )}

                        {/* Status Badge */}
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1 border ${
                            isRunning
                              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                              : site.status === 'PAUSED'
                              ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                              : 'bg-slate-800 text-slate-400 border-slate-700'
                          }`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${isRunning ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'}`} />
                          {site.status}
                        </span>
                      </div>

                      {/* Domain link & metrics */}
                      <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap">
                        <div className="flex items-center gap-1 font-mono text-indigo-300">
                          <Globe className="h-3.5 w-3.5 text-indigo-400" />
                          <a
                            href={`https://${site.targetDomain}`}
                            target="_blank"
                            rel="noreferrer"
                            className="hover:underline flex items-center gap-0.5"
                          >
                            <span>{site.targetDomain}</span>
                            <ExternalLink className="h-2.5 w-2.5 opacity-60" />
                          </a>
                        </div>
                        <span className="text-slate-600">•</span>
                        <span>Daily Limit: <strong className="text-slate-200 font-mono">{(site.dailyLimit || site.volumeBehavior.visitsVolume).toLocaleString()}</strong></span>
                        <span className="text-slate-600">•</span>
                        <span>Delivered: <strong className="text-emerald-400 font-mono">{site.totalVisitsDelivered.toLocaleString()} visits</strong></span>
                      </div>

                      {/* Traffic Rules Badges (Sources, Geo, Device) */}
                      <div className="flex items-center gap-2 pt-1 flex-wrap text-[11px]">
                        <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 font-mono">
                          🔍 Org {site.trafficSplitting?.organicPercent || 40}% / Direct {site.trafficSplitting?.directPercent || 30}% / Soc {site.trafficSplitting?.socialPercent || 20}%
                        </span>

                        <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 font-mono">
                          🌍 {site.geoProxy?.countryAllocations?.slice(0, 3).map(c => `${c.flag || c.countryCode}`).join(' ')}
                        </span>

                        <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 font-mono">
                          📱 Mobile {site.deviceTargeting?.mobileRatioPercent || 65}%
                        </span>

                        <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 font-mono">
                          ⏱ {site.volumeBehavior.dwellTimeMinSeconds}s - {site.volumeBehavior.dwellTimeMaxSeconds}s dwell
                        </span>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2 self-end lg:self-center shrink-0">
                      
                      {/* Play / Pause Toggle */}
                      <button
                        title={isRunning ? "Pause Traffic" : "Resume Traffic"}
                        onClick={() => onToggleStatus(site.id, isRunning ? 'PAUSED' : 'RUNNING')}
                        className={`p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                          isRunning
                            ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20'
                            : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                        }`}
                      >
                        {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 fill-current" />}
                        <span className="hidden sm:inline">{isRunning ? 'Pause' : 'Start'}</span>
                      </button>

                      {/* Select / Configure Traffic Rules */}
                      <button
                        onClick={() => {
                          onSelectCampaign(site.id);
                          onClose();
                        }}
                        className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                          isCurrent
                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                        }`}
                      >
                        <Sliders className="h-3.5 w-3.5" />
                        <span>{isCurrent ? 'Editing Rules' : 'Configure Rules'}</span>
                      </button>

                      {/* Duplicate Website Rules */}
                      <button
                        title="Duplicate Website & Traffic Rules"
                        onClick={() => onDuplicateWebsite(site.id)}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
                      >
                        <Copy className="h-4 w-4" />
                      </button>

                      {/* Delete Website */}
                      {campaigns.length > 1 && (
                        <button
                          title="Delete Website"
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to delete "${site.name}" (${site.targetDomain})?`)) {
                              onDeleteWebsite(site.id);
                            }
                          }}
                          className="p-2 rounded-xl bg-slate-800 hover:bg-rose-950/50 text-slate-400 hover:text-rose-400 border border-slate-700 hover:border-rose-900 transition-colors cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>

                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="text-xs text-slate-400 flex items-center gap-3">
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              {runningCount} Active Sites
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400">{pausedCount} Paused</span>
          </div>

          <button
            onClick={() => {
              onClose();
              onOpenAddWebsite();
            }}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Add Another Website</span>
          </button>
        </div>

      </div>
    </div>
  );
};
