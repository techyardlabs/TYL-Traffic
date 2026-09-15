import React from 'react';
import { 
  Play, 
  Pause, 
  Layers, 
  Cpu, 
  Database, 
  Code2, 
  Coins, 
  Activity, 
  Zap,
  Sparkles,
  Sliders,
  Server,
  ShieldCheck,
  User,
  LogOut
} from 'lucide-react';
import { FullCampaignConfig, CampaignStatus } from '../types/campaign';
import { useAuth } from '../context/AuthContext';
import { TylLogo } from './TylLogo';

interface HeaderProps {
  campaigns: FullCampaignConfig[];
  currentCampaign: FullCampaignConfig;
  onSelectCampaign: (id: string) => void;
  onToggleStatus: (status: CampaignStatus) => void;
  onOpenSimulation: () => void;
  onOpenPrismaSchema: () => void;
  onOpenWorkerInspector: () => void;
  onOpenPresets: () => void;
  onOpenClusterQueue: () => void;
  onOpenAccountSecurity?: () => void;
  activeWorkersCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  campaigns,
  currentCampaign,
  onSelectCampaign,
  onToggleStatus,
  onOpenSimulation,
  onOpenPrismaSchema,
  onOpenWorkerInspector,
  onOpenPresets,
  onOpenClusterQueue,
  onOpenAccountSecurity,
  activeWorkersCount
}) => {
  const { user, logout } = useAuth();
  const isRunning = currentCampaign.status === 'RUNNING';

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-8 py-3 transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        
        {/* Brand & Project Selector */}
        <div className="flex items-center gap-3">
          <TylLogo size="md" subtext="Empowered by Innovation" />
          <div className="hidden xl:flex items-center gap-1.5 pl-3 border-l border-slate-800 text-xs text-slate-400">
            <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>{activeWorkersCount} Cluster Nodes</span>
            </div>
          </div>
        </div>

        {/* Campaign Switcher & Preset Trigger */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="relative">
            <select
              id="campaign-selector"
              aria-label="Select active campaign"
              value={currentCampaign.id}
              onChange={(e) => onSelectCampaign(e.target.value)}
              className="bg-slate-950/80 border border-slate-700/80 hover:border-slate-600 text-slate-200 text-xs sm:text-sm font-medium rounded-lg px-3 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 appearance-none cursor-pointer"
            >
              {campaigns.map((cmp) => (
                <option key={cmp.id} value={cmp.id} className="bg-slate-900 text-slate-100">
                  {cmp.name} ({cmp.targetDomain})
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-400">
              <Layers className="h-3.5 w-3.5" />
            </div>
          </div>

          <button
            id="btn-presets"
            onClick={onOpenPresets}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700/60 text-xs font-semibold transition-all hover:border-indigo-500/40 cursor-pointer"
            title="Load Pre-configured Campaign Templates"
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span className="hidden sm:inline">Presets</span>
          </button>

          {/* Credits Balance Pill */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-950/70 border border-slate-800 text-xs font-mono text-slate-300">
            <Coins className="h-3.5 w-3.5 text-amber-400" />
            <span className="text-slate-400">Credits:</span>
            <span className="text-amber-300 font-bold">{(currentCampaign.creditsBalance).toLocaleString()}</span>
          </div>

          {/* Status Play/Pause Button */}
          <button
            id="btn-campaign-status"
            onClick={() => onToggleStatus(isRunning ? 'PAUSED' : 'RUNNING')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-semibold text-xs sm:text-sm transition-all shadow-md cursor-pointer ${
              isRunning 
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30' 
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/30'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="h-4 w-4 fill-current" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="h-4 w-4 fill-current" />
                <span>Start</span>
              </>
            )}
          </button>

          {/* Live Simulation Runner Button */}
          <button
            id="btn-live-simulation"
            onClick={onOpenSimulation}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs sm:text-sm font-semibold transition-all cursor-pointer"
            title="Interactive Visual Browser Simulator"
          >
            <Activity className="h-4 w-4 text-indigo-400" />
            <span>Virtual Runner</span>
          </button>

          {/* Live Cluster Queue Hub Button */}
          <button
            id="btn-cluster-queue"
            onClick={onOpenClusterQueue}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-indigo-600/25 transition-all border border-indigo-400/30 cursor-pointer"
            title="Dispatch Real Traffic & PostgreSQL Sync"
          >
            <Server className="h-4 w-4 text-indigo-200" />
            <span>Cluster Queue & DB</span>
          </button>

          {/* Dev/Architecture Inspection Tools */}
          <div className="hidden lg:flex items-center gap-1.5 pl-2 border-l border-slate-800">
            <button
              id="btn-inspect-prisma"
              onClick={onOpenPrismaSchema}
              className="p-2 rounded-lg bg-slate-800/60 hover:bg-slate-700/60 text-slate-300 hover:text-white border border-slate-700/50 transition-colors cursor-pointer"
              title="Inspect Prisma DB Schema"
            >
              <Database className="h-4 w-4 text-emerald-400" />
            </button>
            <button
              id="btn-inspect-worker"
              onClick={onOpenWorkerInspector}
              className="p-2 rounded-lg bg-slate-800/60 hover:bg-slate-700/60 text-slate-300 hover:text-white border border-slate-700/50 transition-colors cursor-pointer"
              title="Inspect Playwright Worker Engine"
            >
              <Code2 className="h-4 w-4 text-indigo-400" />
            </button>
          </div>

          {/* Authenticated Operator Profile & Access Control */}
          <div className="flex items-center gap-1.5 pl-2 border-l border-slate-800">
            <button
              id="btn-account-security"
              onClick={onOpenAccountSecurity}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-950/80 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-xs text-slate-300 transition-colors cursor-pointer"
              title="Workstation Security Profile & Change Passkey"
            >
              <div className="h-5 w-5 rounded-md bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <ShieldCheck className="h-3.5 w-3.5" />
              </div>
              <div className="flex flex-col text-left">
                <span className="font-semibold text-[11px] text-slate-200 leading-tight">
                  {user?.username || 'Operator'}
                </span>
                <span className="text-[9px] text-emerald-400 font-mono leading-tight">
                  Authorized
                </span>
              </div>
            </button>

            <button
              id="btn-quick-logout"
              onClick={logout}
              className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-colors cursor-pointer"
              title="Log Out of Cluster"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

      </div>
    </header>
  );
};
