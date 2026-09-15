import React, { useState, useEffect } from 'react';
import { 
  Server, 
  Database, 
  Cpu, 
  Activity, 
  Send, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Trash2, 
  Play, 
  Clock, 
  ExternalLink,
  Layers,
  ArrowRight,
  ShieldCheck,
  Zap,
  HardDrive,
  Key,
  Sliders
} from 'lucide-react';
import { FullCampaignConfig } from '../types/campaign';

interface ClusterQueueManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaign: FullCampaignConfig;
  onJobDispatched?: () => void;
}

interface ClusterStatsResponse {
  pending: number;
  processing: number;
  completedTotal: number;
  totalInQueue: number;
  recentCompleted: any[];
  workers: Array<{
    id: string;
    region: string;
    status: string;
    activeSlots: number;
    maxSlots: number;
    cpuLoadPercent: number;
    memoryLoadPercent: number;
    totalExecuted: number;
    lastHeartbeat: string;
  }>;
}

export const ClusterQueueManagerModal: React.FC<ClusterQueueManagerModalProps> = ({
  isOpen,
  onClose,
  campaign,
  onJobDispatched
}) => {
  const [stats, setStats] = useState<ClusterStatsResponse | null>(null);
  const [dbStatus, setDbStatus] = useState<{ connected: boolean; dialect?: string; message: string; tablesCount?: number; dbName?: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [batchCount, setBatchCount] = useState<number>(5);
  const [selectedCountry, setSelectedCountry] = useState<string>('US');
  const [statusNotice, setStatusNotice] = useState<string | null>(null);
  const [isInitializingSchema, setIsInitializingSchema] = useState(false);
  const [activeTab, setActiveTab] = useState<'queue' | 'database' | 'workers' | 'credentials'>('queue');
  const [dbGuideTab, setDbGuideTab] = useState<'hostinger' | 'postgres'>('hostinger');
  const [inputRedisUrl, setInputRedisUrl] = useState<string>('');
  const [inputDatabaseUrl, setInputDatabaseUrl] = useState<string>('');
  const [configStatus, setConfigStatus] = useState<{
    redisConfigured: boolean;
    redisMasked?: string;
    redisStatus?: { connected: boolean; message: string; pingMs?: number };
    dbConfigured: boolean;
    dbMasked?: string;
  } | null>(null);
  const [isSavingRedis, setIsSavingRedis] = useState(false);
  const [isSavingDb, setIsSavingDb] = useState(false);

  // Fetch config status
  const fetchConfigStatus = async () => {
    try {
      const res = await fetch('/api/config/status');
      if (res.ok) {
        const data = await res.json();
        setConfigStatus(data);
      }
    } catch (e) {
      console.warn('Could not fetch config status:', e);
    }
  };

  const handleSaveRedis = async () => {
    let raw = inputRedisUrl.trim();
    if (!raw) return;

    // Clean up if user pasted the redis-cli command line
    const match = raw.match(/(rediss?:\/\/[^\s]+)/);
    if (match) {
      raw = match[1];
    }
    // If upstash URL with redis://, upgrade to rediss:// for TLS
    if (raw.startsWith('redis://') && raw.includes('upstash.io')) {
      raw = raw.replace('redis://', 'rediss://');
    }

    setIsSavingRedis(true);
    try {
      const res = await fetch('/api/config/set-redis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ redisUrl: raw }),
      });
      const data = await res.json();
      setStatusNotice(data.message || 'REDIS_URL updated!');
      setInputRedisUrl('');
      fetchConfigStatus();
      fetchClusterStats();
      setTimeout(() => setStatusNotice(null), 5000);
    } catch (e: any) {
      setStatusNotice(`Redis update error: ${e.message}`);
    } finally {
      setIsSavingRedis(false);
    }
  };

  const handleSaveDb = async () => {
    if (!inputDatabaseUrl.trim()) return;
    setIsSavingDb(true);
    try {
      const res = await fetch('/api/config/set-db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ databaseUrl: inputDatabaseUrl.trim() }),
      });
      const data = await res.json();
      setStatusNotice(data.message || 'DATABASE_URL updated!');
      setInputDatabaseUrl('');
      fetchConfigStatus();
      fetchDbStatus();
      setTimeout(() => setStatusNotice(null), 5000);
    } catch (e: any) {
      setStatusNotice(`DB update error: ${e.message}`);
    } finally {
      setIsSavingDb(false);
    }
  };

  // Fetch cluster stats
  const fetchClusterStats = async () => {
    try {
      const res = await fetch('/api/cluster/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (e) {
      console.warn('Could not fetch cluster stats:', e);
    }
  };

  // Fetch DB status
  const fetchDbStatus = async () => {
    try {
      const res = await fetch('/api/db/status');
      if (res.ok) {
        const data = await res.json();
        setDbStatus(data);
      }
    } catch (e) {
      console.warn('Could not fetch DB status:', e);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchClusterStats();
      fetchDbStatus();
      fetchConfigStatus();
      const interval = setInterval(fetchClusterStats, 2000);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  // Dispatch traffic batch
  const handleDispatchTraffic = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/traffic/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaign,
          count: batchCount,
          targetCountry: selectedCountry,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStatusNotice(`Successfully queued ${data.enqueuedCount || 1} live traffic tasks to cluster!`);
        fetchClusterStats();
        if (onJobDispatched) onJobDispatched();
      } else {
        setStatusNotice(`Dispatch error: ${data.error}`);
      }
    } catch (err: any) {
      setStatusNotice(`Failed to dispatch traffic: ${err.message}`);
    } finally {
      setIsLoading(false);
      setTimeout(() => setStatusNotice(null), 5000);
    }
  };

  // Clear queue
  const handleClearQueue = async () => {
    try {
      await fetch('/api/traffic/queue/clear', { method: 'POST' });
      fetchClusterStats();
      setStatusNotice('Cluster pending queue flushed.');
      setTimeout(() => setStatusNotice(null), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  // Sync campaign to PostgreSQL
  const handleSaveToPostgres = async () => {
    try {
      const res = await fetch('/api/campaigns/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaign }),
      });
      const data = await res.json();
      setStatusNotice(`Campaign saved: ${data.persistedIn}`);
      fetchDbStatus();
      setTimeout(() => setStatusNotice(null), 4000);
    } catch (e: any) {
      setStatusNotice(`Save error: ${e.message}`);
    }
  };

  // Initialize DB tables
  const handleInitSchema = async () => {
    setIsInitializingSchema(true);
    try {
      const res = await fetch('/api/db/init-schema', { method: 'POST' });
      const data = await res.json();
      setStatusNotice(data.message);
      fetchDbStatus();
    } catch (e: any) {
      setStatusNotice(`Schema init error: ${e.message}`);
    } finally {
      setIsInitializingSchema(false);
      setTimeout(() => setStatusNotice(null), 5000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Server className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-100 text-base">Cluster Orchestrator & Live Queue Hub</h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  REAL ENGINE ACTIVE
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Dispatches real HTTP/Headless Playwright traffic jobs and synchronizes with PostgreSQL.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => { fetchClusterStats(); fetchDbStatus(); }}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title="Refresh"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
            >
              Close
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 py-2 border-b border-slate-800 bg-slate-900/50">
          <button
            onClick={() => setActiveTab('queue')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'queue' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Activity className="h-3.5 w-3.5" />
            <span>Traffic Dispatch & Queue</span>
            {stats && stats.pending > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold">
                {stats.pending}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('database')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'database' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Database className="h-3.5 w-3.5 text-emerald-400" />
            <span>Database (MySQL / PostgreSQL)</span>
            <span className={`h-2 w-2 rounded-full ${dbStatus?.connected ? 'bg-emerald-400' : 'bg-amber-400'}`} />
          </button>

          <button
            onClick={() => setActiveTab('workers')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'workers' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Cpu className="h-3.5 w-3.5 text-violet-400" />
            <span>Worker Node Mesh</span>
            <span className="text-[10px] text-slate-400 font-mono">({stats?.workers.length || 4})</span>
          </button>

          <button
            onClick={() => setActiveTab('credentials')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'credentials' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Key className="h-3.5 w-3.5 text-amber-400" />
            <span>Connection URLs &amp; Keys</span>
            <span className={`h-2 w-2 rounded-full ${configStatus?.redisConfigured ? 'bg-emerald-400' : 'bg-amber-400'}`} />
          </button>
        </div>

        {/* Status Notification */}
        {statusNotice && (
          <div className="px-6 py-2.5 bg-indigo-950/80 border-b border-indigo-800/60 text-indigo-200 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-indigo-400 animate-pulse" />
              <span>{statusNotice}</span>
            </div>
            <button onClick={() => setStatusNotice(null)} className="text-slate-400 hover:text-white">✕</button>
          </div>
        )}

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* TAB 1: TRAFFIC QUEUE & DISPATCH */}
          {activeTab === 'queue' && (
            <div className="space-y-6">
              
              {/* Dispatch Action Panel */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Send className="h-4 w-4 text-indigo-400" />
                    <h4 className="text-sm font-bold text-slate-200">Dispatch Live Traffic to Worker Cluster</h4>
                  </div>
                  <span className="text-xs text-slate-400">
                    Target Domain: <span className="font-mono text-indigo-300">{campaign.targetDomain}</span>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-medium text-slate-400 block mb-1">Batch Size (Concurrent Hits)</label>
                    <select
                      value={batchCount}
                      onChange={(e) => setBatchCount(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 font-medium focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value={1}>1 Real Visit (Test)</option>
                      <option value={5}>5 Concurrent Visits</option>
                      <option value={10}>10 Concurrent Visits</option>
                      <option value={25}>25 Heavy Load Batch</option>
                      <option value={50}>50 Cluster Blast</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-slate-400 block mb-1">Geo / Residential Country</label>
                    <select
                      value={selectedCountry}
                      onChange={(e) => setSelectedCountry(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 font-medium focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="US">🇺🇸 United States (Residential)</option>
                      <option value="DE">🇩🇪 Germany (Residential)</option>
                      <option value="GB">🇬🇧 United Kingdom (Residential)</option>
                      <option value="CA">🇨🇦 Canada (Residential)</option>
                      <option value="FR">🇫🇷 France (Residential)</option>
                      <option value="JP">🇯🇵 Japan (Residential)</option>
                    </select>
                  </div>

                  <div className="flex items-end gap-2">
                    <button
                      onClick={handleDispatchTraffic}
                      disabled={isLoading}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isLoading ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <Play className="h-4 w-4 fill-current" />
                      )}
                      <span>Dispatch Now</span>
                    </button>

                    <button
                      onClick={handleClearQueue}
                      className="p-2 rounded-lg bg-slate-800 hover:bg-rose-900/50 hover:border-rose-700 text-slate-400 hover:text-rose-300 border border-slate-700 transition-colors"
                      title="Clear Pending Queue"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Queue Real-Time Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800">
                  <div className="text-[11px] text-slate-400">Pending In Queue</div>
                  <div className="text-xl font-bold font-mono text-amber-400 mt-1">
                    {stats?.pending ?? 0}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Awaiting worker thread</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800">
                  <div className="text-[11px] text-slate-400">Processing Now</div>
                  <div className="text-xl font-bold font-mono text-indigo-400 mt-1">
                    {stats?.processing ?? 0}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Active Playwright slots</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800">
                  <div className="text-[11px] text-slate-400">Total Executed</div>
                  <div className="text-xl font-bold font-mono text-emerald-400 mt-1">
                    {(stats?.completedTotal ?? 0).toLocaleString()}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">This session</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800">
                  <div className="text-[11px] text-slate-400">Cluster Capacity</div>
                  <div className="text-xl font-bold font-mono text-slate-200 mt-1">
                    224 <span className="text-xs font-normal text-slate-500">slots</span>
                  </div>
                  <div className="text-[10px] text-emerald-400 mt-0.5">4 Nodes Online</div>
                </div>
              </div>

              {/* Recent Execution Stream */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Live Execution Telemetry & Dwell Log
                  </h4>
                  <span className="text-[11px] text-slate-500">Auto-refreshing 2s</span>
                </div>

                <div className="border border-slate-800 rounded-xl bg-slate-950/80 overflow-hidden">
                  <div className="max-h-64 overflow-y-auto divide-y divide-slate-800/60 font-mono text-[11px]">
                    {stats && stats.recentCompleted && stats.recentCompleted.length > 0 ? (
                      stats.recentCompleted.map((job: any) => (
                        <div key={job.id} className="p-2.5 flex items-center justify-between hover:bg-slate-900/60 transition-colors">
                          <div className="flex items-center gap-3">
                            <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
                              HTTP {job.httpStatus || 200}
                            </span>
                            <span className="text-slate-300 truncate max-w-xs">{job.targetUrl}</span>
                            <span className="text-slate-500">({job.country})</span>
                            <span className="text-slate-500">{job.deviceType}</span>
                          </div>

                          <div className="flex items-center gap-4 text-slate-400 text-[10px]">
                            <span>{job.pagesToVisit} pages</span>
                            <span>{job.dwellSeconds}s dwell</span>
                            <span className="text-indigo-400 font-bold">{job.durationMs}ms</span>
                            <span className="text-slate-500">{new Date(job.executedAt).toLocaleTimeString()}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center text-slate-500 text-xs">
                        No jobs executed yet. Click <span className="text-indigo-400 font-semibold">"Dispatch Now"</span> above to trigger real traffic through the cluster queue.
                      </div>
                    )}
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: DATABASE INTEGRATION (HOSTINGER MYSQL & POSTGRESQL) */}
          {activeTab === 'database' && (
            <div className="space-y-6">
              
              {/* Connection Status Box */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Database className="h-5 w-5 text-emerald-400" />
                    <div>
                      <h4 className="text-sm font-bold text-slate-200">
                        {dbStatus?.dialect === 'mysql' ? 'Hostinger MySQL / MariaDB' : dbStatus?.dialect === 'postgres' ? 'PostgreSQL' : 'Database Status & Diagnostics'}
                      </h4>
                      <p className="text-xs text-slate-400">
                        Managed via <code className="text-indigo-300">DATABASE_URL</code> (supports <span className="text-amber-300">mysql://</span> & <span className="text-sky-300">postgresql://</span>)
                      </p>
                    </div>
                  </div>

                  <div className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 border ${
                    dbStatus?.connected 
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                      : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                  }`}>
                    <span className={`h-2 w-2 rounded-full ${dbStatus?.connected ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`} />
                    <span>
                      {dbStatus?.connected 
                        ? `${dbStatus.dialect === 'mysql' ? 'Hostinger MySQL' : 'PostgreSQL'} Connected` 
                        : 'In-Memory / Config Needed'}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300">
                  {dbStatus?.message || 'Checking connection...'}
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    onClick={handleSaveToPostgres}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <HardDrive className="h-4 w-4" />
                    <span>
                      Save Campaign to {dbStatus?.dialect === 'mysql' ? 'MySQL' : dbStatus?.dialect === 'postgres' ? 'PostgreSQL' : 'Database'}
                    </span>
                  </button>

                  <button
                    onClick={handleInitSchema}
                    disabled={isInitializingSchema}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 text-emerald-400 ${isInitializingSchema ? 'animate-spin' : ''}`} />
                    <span>Run DB Table Migrations</span>
                  </button>
                </div>
              </div>

              {/* Dialect Switcher / Guide Selector */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                  <button
                    onClick={() => setDbGuideTab('hostinger')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      dbGuideTab === 'hostinger' 
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Hostinger Cloud Hosting (MySQL Setup Guide)
                  </button>
                  <button
                    onClick={() => setDbGuideTab('postgres')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      dbGuideTab === 'postgres' 
                        ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30' 
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    PostgreSQL Guide (Neon, Supabase, RDS)
                  </button>
                </div>

                {/* Hostinger MySQL Instructions */}
                {dbGuideTab === 'hostinger' && (
                  <div className="p-4 rounded-xl bg-slate-900/60 border border-amber-500/20 space-y-4">
                    <div className="flex items-center gap-2">
                      <span className="text-amber-400 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
                        <ShieldCheck className="h-4 w-4" />
                        Using Hostinger MySQL / phpMyAdmin
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      Yes! You do <strong>not</strong> need PostgreSQL. Hostinger Cloud Hosting includes MySQL &amp; MariaDB databases via hPanel. 
                      You can connect this app directly to your Hostinger database by setting <code className="text-amber-300 font-mono">DATABASE_URL</code>:
                    </p>

                    <div className="p-3 rounded-lg bg-slate-950 font-mono text-xs text-amber-200 border border-slate-800 overflow-x-auto select-all">
                      DATABASE_URL="mysql://u123456789_sparkuser:YourPassword@srv1234.hstgr.io:3306/u123456789_sparkdb"
                    </div>

                    <div className="space-y-2 text-xs text-slate-400">
                      <div className="font-semibold text-slate-300">How to get these values from Hostinger hPanel:</div>
                      <ol className="list-decimal list-inside space-y-1 pl-1">
                        <li>Log into your <strong>Hostinger hPanel</strong>.</li>
                        <li>Go to <strong>Databases &rarr; Management</strong> (or <em>MySQL Databases</em>).</li>
                        <li>Create a new database name and username (Hostinger prefixes them, e.g. <code className="text-slate-200">u123456789_...</code>).</li>
                        <li>
                          <strong>Important for Remote Connections:</strong> In hPanel, go to <strong>Databases &rarr; Remote MySQL</strong>, select your database, and enter <code className="text-amber-300 font-bold">%</code> (any host) or your app server IP to allow remote connections.
                        </li>
                        <li>
                          Note your <strong>MySQL Hostname</strong> (e.g. <code className="text-slate-200">srv1234.hstgr.io</code> or <code className="text-slate-200">sql123.main-hosting.eu</code>). If running directly on the Hostinger Cloud VPS, use <code className="text-slate-200">localhost:3306</code>.
                        </li>
                        <li>
                          Click the <strong>"Run DB Table Migrations"</strong> button above to automatically create all <code className="text-slate-200">campaigns</code>, <code className="text-slate-200">execution_logs</code>, and <code className="text-slate-200">queue_tasks</code> tables!
                        </li>
                      </ol>
                    </div>
                  </div>
                )}

                {/* PostgreSQL Instructions */}
                {dbGuideTab === 'postgres' && (
                  <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
                      <ShieldCheck className="h-4 w-4" />
                      Connecting PostgreSQL (Neon, Supabase, Cloud SQL, AWS RDS)
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Simply set your <code className="text-indigo-300">DATABASE_URL</code> with the <code className="text-sky-300">postgresql://</code> protocol:
                    </p>
                    
                    <div className="p-3 rounded-lg bg-slate-950 font-mono text-xs text-slate-300 border border-slate-800 overflow-x-auto">
                      DATABASE_URL="postgresql://postgres:[PASSWORD]@[HOST]:5432/sparktraffic?sslmode=require"
                    </div>

                    <div className="text-xs text-slate-400 space-y-1">
                      <p>• Automatically manages connection pooling (<code className="text-slate-300">max: 20</code>, idle timeouts).</p>
                      <p>• Persists campaign configurations in <code className="text-slate-300">campaigns (config_json JSONB)</code>.</p>
                      <p>• Logs all delivered visits with latency, proxy headers, and country codes in <code className="text-slate-300">execution_logs</code>.</p>
                    </div>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 3: WORKER CLUSTER MESH */}
          {activeTab === 'workers' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Headless Worker Cluster Node Mesh
                </h4>
                <span className="text-[11px] text-emerald-400 font-medium">All Nodes Responsive</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {stats?.workers.map((worker) => (
                  <div key={worker.id} className="p-4 rounded-xl bg-slate-950/50 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Cpu className="h-4 w-4 text-indigo-400" />
                        <span className="font-mono text-xs font-bold text-slate-200">{worker.id}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
                        {worker.status}
                      </span>
                    </div>

                    <div className="text-xs text-slate-400">{worker.region}</div>

                    <div className="space-y-2 pt-1">
                      <div>
                        <div className="flex justify-between text-[11px] mb-1">
                          <span className="text-slate-400">Concurrency Slots</span>
                          <span className="font-mono text-indigo-300">{worker.activeSlots} / {worker.maxSlots}</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                            style={{ width: `${(worker.activeSlots / worker.maxSlots) * 100}%` }}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-400 pt-1">
                        <div>CPU: <span className="text-slate-200">{worker.cpuLoadPercent}%</span></div>
                        <div>RAM: <span className="text-slate-200">{worker.memoryLoadPercent}%</span></div>
                        <div className="col-span-2">Total Executed: <span className="text-emerald-400 font-bold">{worker.totalExecuted.toLocaleString()}</span></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: CONNECTION URLS & CREDENTIALS CONFIG */}
          {activeTab === 'credentials' && (
            <div className="space-y-6">
              
              {/* Introduction Banner */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                <div className="flex items-center gap-2">
                  <Sliders className="h-4 w-4 text-indigo-400" />
                  <h4 className="text-sm font-bold text-slate-200">Active Connection Strings &amp; Secrets</h4>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  You can paste your connection strings directly into the inputs below to activate them immediately for this session, or configure them permanently in your environment settings.
                </p>
              </div>

              {/* REDIS / UPSTASH SECTION */}
              <div className="p-5 rounded-xl bg-slate-950/40 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 font-mono text-xs font-bold">
                      REDIS
                    </span>
                    <div>
                      <h5 className="text-xs font-bold uppercase tracking-wider text-slate-200">Upstash / Redis Queue Connection</h5>
                      <span className="text-[11px] text-slate-400">Environment variable: <code className="text-amber-300">REDIS_URL</code></span>
                    </div>
                  </div>

                  <div className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold flex items-center gap-1.5 border ${
                    configStatus?.redisConfigured 
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}>
                    <span className={`h-2 w-2 rounded-full ${configStatus?.redisConfigured ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                    <span>{configStatus?.redisConfigured ? 'Redis Connected' : 'In-Memory Queue Active'}</span>
                  </div>
                </div>

                {configStatus?.redisMasked && (
                  <div className="space-y-1.5">
                    <div className="text-[11px] font-mono text-emerald-400/90 bg-emerald-950/20 border border-emerald-900/40 px-3 py-1.5 rounded-lg flex items-center justify-between">
                      <span>Active URL: {configStatus.redisMasked}</span>
                      {configStatus.redisStatus?.pingMs !== undefined && (
                        <span className="text-emerald-300 font-bold">RTT: {configStatus.redisStatus.pingMs}ms</span>
                      )}
                    </div>
                    {configStatus.redisStatus?.message && (
                      <div className="text-[10px] font-mono text-slate-400 pl-1">
                        Status: {configStatus.redisStatus.message}
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-[11px] font-semibold text-slate-300">
                    Paste your Upstash Connection String here:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={inputRedisUrl}
                      onChange={(e) => setInputRedisUrl(e.target.value)}
                      placeholder="rediss://default:token@your-host.upstash.io:6379"
                      className="flex-1 px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 font-mono text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                    />
                    <button
                      onClick={handleSaveRedis}
                      disabled={isSavingRedis || !inputRedisUrl.trim()}
                      className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 text-white text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <RefreshCw className={`h-3.5 w-3.5 ${isSavingRedis ? 'animate-spin' : ''}`} />
                      <span>{isSavingRedis ? 'Activating...' : 'Activate Redis'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* DATABASE / HOSTINGER MYSQL / POSTGRESQL SECTION */}
              <div className="p-5 rounded-xl bg-slate-950/40 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Database className="h-5 w-5 text-emerald-400" />
                    <div>
                      <h5 className="text-xs font-bold uppercase tracking-wider text-slate-200">Database Connection (Hostinger MySQL or PostgreSQL)</h5>
                      <span className="text-[11px] text-slate-400">Environment variable: <code className="text-indigo-300">DATABASE_URL</code></span>
                    </div>
                  </div>

                  <div className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold flex items-center gap-1.5 border ${
                    dbStatus?.connected 
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}>
                    <span className={`h-2 w-2 rounded-full ${dbStatus?.connected ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                    <span>{dbStatus?.connected ? `${dbStatus.dialect === 'mysql' ? 'MySQL' : 'PostgreSQL'} Connected` : 'In-Memory Fallback'}</span>
                  </div>
                </div>

                {configStatus?.dbMasked && (
                  <div className="text-[11px] font-mono text-emerald-400/90 bg-emerald-950/20 border border-emerald-900/40 px-3 py-1.5 rounded-lg">
                    Active URL: {configStatus.dbMasked}
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-[11px] font-semibold text-slate-300">
                    Paste your Hostinger MySQL or PostgreSQL URI here:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={inputDatabaseUrl}
                      onChange={(e) => setInputDatabaseUrl(e.target.value)}
                      placeholder="mysql://u123456_user:pass@srv1234.hstgr.io:3306/u123456_dbname"
                      className="flex-1 px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 font-mono text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                    />
                    <button
                      onClick={handleSaveDb}
                      disabled={isSavingDb || !inputDatabaseUrl.trim()}
                      className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-600 text-white text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <RefreshCw className={`h-3.5 w-3.5 ${isSavingDb ? 'animate-spin' : ''}`} />
                      <span>{isSavingDb ? 'Connecting...' : 'Connect DB'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* PERMANENT STORAGE GUIDE */}
              <div className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-900/40 space-y-2 text-xs text-slate-300">
                <div className="font-bold text-indigo-300 flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4" />
                  How to configure these permanently
                </div>
                <div className="text-slate-400 space-y-1 pl-1">
                  <p>• <strong>In AI Studio Build</strong>: Click the <strong>Settings (Gear icon)</strong> in the top-right toolbar of the AI Studio window &rarr; <strong>Secrets / Environment Variables</strong> &rarr; add <code className="text-slate-200">REDIS_URL</code> and <code className="text-slate-200">DATABASE_URL</code>.</p>
                  <p>• <strong>In Local Development</strong>: Create a <code className="text-slate-200">.env</code> file in the project root directory.</p>
                  <p>• <strong>In Hostinger / Cloud Run Production</strong>: Add them to your container or hosting provider's Environment Variables panel.</p>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/70 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <span>Backend Queue & PostgreSQL Service Online on Port 3000</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
