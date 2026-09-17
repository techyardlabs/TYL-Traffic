import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  ChevronDown, 
  Settings, 
  Play, 
  Pause, 
  ExternalLink, 
  BarChart2, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Sparkles, 
  Globe, 
  TrendingUp, 
  Copy, 
  Check,
  HelpCircle,
  Zap,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { FullCampaignConfig, CampaignStatus } from '../types/campaign';

interface Props {
  campaigns: FullCampaignConfig[];
  activeCampaignId: string;
  onSelectCampaign: (id: string) => void;
  onOpenAddWebsite: () => void;
  onOpenConfigureSite: (id: string) => void;
  onToggleStatus: (id: string, newStatus: CampaignStatus) => void;
}

export const SparkProjectsDashboard: React.FC<Props> = ({
  campaigns,
  activeCampaignId,
  onSelectCampaign,
  onOpenAddWebsite,
  onOpenConfigureSite,
  onToggleStatus
}) => {
  const [metricFilter, setMetricFilter] = useState<'hits' | 'views' | 'visits'>('hits');
  const [dateRange, setDateRange] = useState('17.08.2026 - 16.09.2026');
  const [searchQuery, setSearchQuery] = useState('');
  const [showInactive, setShowInactive] = useState(true);
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'views'>('date');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  // Filter campaigns
  const filteredCampaigns = campaigns.filter(c => {
    if (!showInactive && (c.status === 'PAUSED' || c.status === 'COMPLETED')) {
      return false;
    }
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      c.targetDomain.toLowerCase().includes(query) ||
      c.name.toLowerCase().includes(query) ||
      (c.projectCode && c.projectCode.toLowerCase().includes(query)) ||
      (c.advancedTracking.gaMeasurementId && c.advancedTracking.gaMeasurementId.toLowerCase().includes(query))
    );
  }).sort((a, b) => {
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    if (sortBy === 'views') return b.totalViewsDelivered - a.totalViewsDelivered;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  // Calculate aggregate metrics
  const totalDeliveredHits = campaigns.reduce((acc, c) => acc + (c.totalViewsDelivered * 3), 0);
  const totalDeliveredViews = campaigns.reduce((acc, c) => acc + c.totalViewsDelivered, 0);
  const totalDeliveredVisits = campaigns.reduce((acc, c) => acc + c.totalVisitsDelivered, 0);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString();
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner Matching SparkTraffic "My projects" Header */}
      <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-5 md:p-6 shadow-xl backdrop-blur-sm space-y-5">
        
        {/* Row 1: Title and Realtime Metric Selector */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
              <span>My projects</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-mono font-normal">
                {campaigns.length} Websites Managed
              </span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Independent traffic routing, GA4 Measurement ID telemetry, and residential proxy pacing per website
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Metric Filter Dropdown */}
            <div className="relative">
              <select
                id="select-metric-filter"
                value={metricFilter}
                onChange={(e) => setMetricFilter(e.target.value as any)}
                className="appearance-none bg-slate-950 border border-slate-700/80 rounded-xl pl-3.5 pr-8 py-2 text-xs font-semibold text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="hits">Delivered Hits</option>
                <option value="views">Delivered Page Views</option>
                <option value="visits">Delivered Visits</option>
              </select>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400 absolute right-2.5 top-3 pointer-events-none" />
            </div>

            {/* Date Range Picker */}
            <div className="flex items-center gap-2 bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-300 font-mono">
              <Calendar className="h-3.5 w-3.5 text-indigo-400" />
              <span>{dateRange}</span>
            </div>

            {/* I don't see traffic help link */}
            <a 
              href="#ga4-guide"
              onClick={(e) => {
                e.preventDefault();
                const site = campaigns[0];
                if (site) onOpenConfigureSite(site.id);
              }}
              className="text-xs text-indigo-400 hover:text-indigo-300 underline font-medium flex items-center gap-1 cursor-pointer ml-1"
            >
              <span>I don't see the traffic</span>
              <HelpCircle className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>

        {/* Row 2: Realtime Aggregate Delivery Graph Preview */}
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                Total delivered:
              </span>
              <span className="text-lg font-black text-white font-mono">
                {metricFilter === 'hits' && `${formatNumber(totalDeliveredHits)} Hits`}
                {metricFilter === 'views' && `${formatNumber(totalDeliveredViews)} Views`}
                {metricFilter === 'visits' && `${formatNumber(totalDeliveredVisits)} Visits`}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Aggregated delivery stream across all configured residential proxy nodes & worker clusters
            </p>
          </div>

          {/* Sparkline Visual Simulation */}
          <div className="flex items-end gap-1.5 h-10 w-full md:w-64 px-2">
            {[24, 38, 45, 30, 52, 60, 48, 70, 65, 85, 92, 78, 88, 95, 100, 94].map((h, i) => (
              <div 
                key={i} 
                className="flex-1 bg-gradient-to-t from-indigo-600/40 to-indigo-500 rounded-t-sm transition-all hover:bg-indigo-400"
                style={{ height: `${h}%` }}
                title={`Interval ${i + 1}: ${h}% capacity`}
              />
            ))}
          </div>
        </div>

        {/* Row 3: Action Controls Bar (Matching SparkTraffic) */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-2">
          
          <div className="flex flex-wrap items-center gap-2.5">
            {/* + Create Project Button */}
            <button
              type="button"
              id="btn-create-project-main"
              onClick={onOpenAddWebsite}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Create project</span>
            </button>

            {/* Search Input */}
            <div className="relative min-w-[240px]">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Search className="h-3.5 w-3.5" />
              </div>
              <input
                id="input-search-projects"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search domain, ID, or GA4 tag..."
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <span>Sort:</span>
              <select
                id="select-sort-projects"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none cursor-pointer font-medium"
              >
                <option value="date">Date Created</option>
                <option value="views">Delivered Views</option>
                <option value="name">Website Name</option>
              </select>
            </div>

            {/* Show Inactive Toggle */}
            <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer select-none">
              <input
                type="checkbox"
                id="checkbox-show-inactive"
                checked={showInactive}
                onChange={(e) => setShowInactive(e.target.checked)}
                className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500"
              />
              <span>Show Inactive</span>
            </label>
          </div>

        </div>

      </div>

      {/* Projects List (Matching Card Design in image.png) */}
      <div className="space-y-3">
        {filteredCampaigns.map((project) => {
          const isRunning = project.status === 'RUNNING';
          const isCompleted = project.status === 'COMPLETED';
          const isPaused = project.status === 'PAUSED';
          const projectCode = project.projectCode || `WT${project.id.slice(-8).toUpperCase()}`;
          const gaId = project.advancedTracking.gaMeasurementId;

          return (
            <div 
              key={project.id}
              className={`bg-slate-900/90 border rounded-2xl p-4 sm:p-5 transition-all duration-200 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                activeCampaignId === project.id
                  ? 'border-indigo-500/60 bg-gradient-to-r from-indigo-950/20 via-slate-900 to-slate-900'
                  : 'border-slate-800/90 hover:border-slate-700'
              }`}
            >
              
              {/* Left Column: Status Badge, Project Title, Domain, Code */}
              <div className="flex items-start gap-3.5 flex-1 min-w-0">
                <input
                  type="checkbox"
                  className="mt-1 rounded border-slate-700 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />

                <div className="space-y-1.5 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Status Badge */}
                    {isCompleted && (
                      <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        DEMO Completed
                      </span>
                    )}
                    {isRunning && (
                      <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Active
                      </span>
                    )}
                    {isPaused && (
                      <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        Paused
                      </span>
                    )}

                    {/* Project Code */}
                    <button
                      type="button"
                      onClick={() => handleCopy(projectCode, project.id)}
                      className="text-xs font-mono font-bold text-slate-400 hover:text-white flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 cursor-pointer"
                      title="Click to copy Project Code"
                    >
                      <span>{projectCode}</span>
                      {copiedId === project.id ? (
                        <Check className="h-3 w-3 text-emerald-400" />
                      ) : (
                        <Copy className="h-3 w-3 text-slate-500" />
                      )}
                    </button>

                    {/* Google Analytics 4 Badge if Configured */}
                    {gaId ? (
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 flex items-center gap-1">
                        <BarChart2 className="h-3 w-3 text-amber-400" />
                        <span>GA4: {gaId}</span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onOpenConfigureSite(project.id)}
                        className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-amber-300 border border-slate-700/80 cursor-pointer"
                      >
                        + Add GA4 ID
                      </button>
                    )}

                    {project.projectType && (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                        {project.projectType}
                      </span>
                    )}
                  </div>

                  {/* Project Name & Domain */}
                  <div className="flex flex-wrap items-baseline gap-2">
                    <h3 className="text-sm font-bold text-white tracking-tight truncate max-w-sm">
                      {project.name}
                    </h3>
                    <a
                      href={`https://${project.targetDomain}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-mono text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                    >
                      <span>{project.targetDomain}</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>

                  {/* Quick rule preview */}
                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 pt-0.5">
                    <span>Target: <strong className="text-slate-200 font-mono">{project.totalViewsTarget.toLocaleString()}</strong> views</span>
                    <span>•</span>
                    <span>Delivered: <strong className="text-emerald-400 font-mono">{project.totalViewsDelivered.toLocaleString()}</strong></span>
                    <span>•</span>
                    <span>Dwell: <strong className="text-slate-200">{project.volumeBehavior.dwellTimeMinSeconds}s - {project.volumeBehavior.dwellTimeMaxSeconds}s</strong></span>
                    <span>•</span>
                    <span>Organic: <strong className="text-slate-200">{project.trafficSplitting.organicPercent}%</strong></span>
                  </div>
                </div>
              </div>

              {/* Right Column: Sparkline Preview & Action Buttons */}
              <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end pt-3 md:pt-0 border-t md:border-t-0 border-slate-800">
                
                {/* Realtime Mini Activity Sparkline */}
                <div className="flex items-end gap-1 h-7 w-24 px-1 bg-slate-950/60 rounded border border-slate-800/80 py-1">
                  {[30, 45, 60, 40, 80, 70, 95, 85].map((val, idx) => (
                    <div 
                      key={idx}
                      className={`flex-1 rounded-t-xs ${isRunning ? 'bg-indigo-500' : 'bg-slate-700'}`}
                      style={{ height: `${val}%` }}
                    />
                  ))}
                </div>

                {/* Activate / Pause Toggle Button */}
                <button
                  type="button"
                  id={`btn-toggle-status-${project.id}`}
                  onClick={() => onToggleStatus(project.id, isRunning ? 'PAUSED' : 'RUNNING')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isRunning 
                      ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700' 
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20'
                  }`}
                >
                  {isRunning ? (
                    <>
                      <Pause className="h-3.5 w-3.5" />
                      <span>Pause</span>
                    </>
                  ) : (
                    <>
                      <Play className="h-3.5 w-3.5" />
                      <span>Activate</span>
                    </>
                  )}
                </button>

                {/* Settings / Configure Traffic Button */}
                <button
                  type="button"
                  id={`btn-settings-${project.id}`}
                  onClick={() => onOpenConfigureSite(project.id)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-indigo-600 text-slate-200 hover:text-white border border-slate-700/80 hover:border-indigo-500 text-xs font-bold transition-all shadow-sm cursor-pointer"
                >
                  <Settings className="h-3.5 w-3.5" />
                  <span>Settings</span>
                </button>

              </div>

            </div>
          );
        })}

        {filteredCampaigns.length === 0 && (
          <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800 space-y-3">
            <Globe className="h-8 w-8 text-slate-600 mx-auto" />
            <p className="text-sm font-semibold text-slate-300">No websites match your search or filter</p>
            <button
              type="button"
              onClick={onOpenAddWebsite}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Add a New Website</span>
            </button>
          </div>
        )}
      </div>

    </div>
  );
};
