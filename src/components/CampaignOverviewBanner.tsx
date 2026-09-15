import React, { useState } from 'react';
import { 
  Globe, 
  CheckCircle2, 
  PauseCircle, 
  AlertTriangle, 
  Clock, 
  TrendingUp, 
  Users, 
  Eye, 
  Flame, 
  ExternalLink,
  Edit2,
  Check,
  Zap
} from 'lucide-react';
import { FullCampaignConfig, CampaignStatus } from '../types/campaign';

interface Props {
  campaign: FullCampaignConfig;
  onUpdateCampaign: (updated: Partial<FullCampaignConfig>) => void;
}

export const CampaignOverviewBanner: React.FC<Props> = ({
  campaign,
  onUpdateCampaign
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(campaign.name);
  const [tempDomain, setTempDomain] = useState(campaign.targetDomain);

  const getStatusBadge = (status: CampaignStatus) => {
    switch (status) {
      case 'RUNNING':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            <CheckCircle2 className="h-3.5 w-3.5" />
            RUNNING
          </span>
        );
      case 'PAUSED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
            <PauseCircle className="h-3.5 w-3.5" />
            PAUSED
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/15 text-blue-300 border border-blue-500/30">
            <Check className="h-3.5 w-3.5" />
            COMPLETED
          </span>
        );
      case 'ERROR_INSUFFICIENT_CREDITS':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30">
            <AlertTriangle className="h-3.5 w-3.5" />
            ERROR: NO CREDITS
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-500/15 text-slate-300 border border-slate-500/30">
            <Clock className="h-3.5 w-3.5" />
            DRAFT
          </span>
        );
    }
  };

  const handleSaveMeta = () => {
    onUpdateCampaign({
      name: tempName,
      targetDomain: tempDomain.replace(/^https?:\/\//, '').replace(/\/$/, '')
    });
    setIsEditingName(false);
  };

  const progressPercent = Math.min(100, Math.round((campaign.totalViewsDelivered / campaign.totalViewsTarget) * 100));

  return (
    <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 md:p-6 mb-6 shadow-xl backdrop-blur-sm">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-800/70">
        
        {/* Left Info */}
        <div className="space-y-2">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
              ID: {campaign.id}
            </span>
            {getStatusBadge(campaign.status)}
            <span className="text-xs text-slate-500">
              Started: {new Date(campaign.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>

          {/* Project Title & Domain Editing */}
          {isEditingName ? (
            <div className="flex items-center gap-2 pt-1 flex-wrap">
              <input
                id="edit-campaign-name"
                type="text"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                className="bg-slate-950 border border-indigo-500/60 rounded-lg px-3 py-1 text-base md:text-lg font-bold text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Campaign Name"
              />
              <input
                id="edit-campaign-domain"
                type="text"
                value={tempDomain}
                onChange={(e) => setTempDomain(e.target.value)}
                className="bg-slate-950 border border-indigo-500/60 rounded-lg px-3 py-1 text-sm font-mono text-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="target-domain.com"
              />
              <button
                id="btn-save-campaign-meta"
                onClick={handleSaveMeta}
                className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Check className="h-3.5 w-3.5" /> Save
              </button>
              <button
                onClick={() => setIsEditingName(false)}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <h1 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">
                {campaign.name}
              </h1>
              <button
                id="btn-edit-campaign-meta"
                onClick={() => {
                  setTempName(campaign.name);
                  setTempDomain(campaign.targetDomain);
                  setIsEditingName(true);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-slate-800/80 transition-colors cursor-pointer"
                title="Edit Campaign Name & Target Domain"
              >
                <Edit2 className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Root Domain Display */}
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <Globe className="h-4 w-4 text-indigo-400" />
            <span className="text-slate-400 font-medium">Target Root:</span>
            <a 
              href={`https://${campaign.targetDomain}`}
              target="_blank" 
              rel="noreferrer"
              className="font-mono text-indigo-300 hover:text-indigo-200 underline decoration-indigo-500/40 hover:decoration-indigo-400 flex items-center gap-1"
            >
              https://{campaign.targetDomain}
              <ExternalLink className="h-3 w-3 inline" />
            </a>
          </div>
        </div>

        {/* Right Target Delivery Progress Bar */}
        <div className="lg:w-80 bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5 text-indigo-400" />
              Target Delivery Progress
            </span>
            <span className="font-bold text-indigo-300">{progressPercent}%</span>
          </div>

          <div className="w-full bg-slate-800/80 h-2.5 rounded-full overflow-hidden">
            <div 
              className="bg-gradient-to-r from-indigo-500 via-indigo-400 to-emerald-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="flex justify-between text-[11px] font-mono text-slate-400">
            <span>{campaign.totalViewsDelivered.toLocaleString()} Delivered</span>
            <span>{campaign.totalViewsTarget.toLocaleString()} Goal</span>
          </div>
        </div>

      </div>

      {/* 4 Metric Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mt-6">
        
        <div className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-3.5 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Page Views</span>
            <Eye className="h-3.5 w-3.5 text-indigo-400" />
          </div>
          <div className="text-lg md:text-xl font-extrabold text-white font-mono">
            {campaign.totalViewsDelivered.toLocaleString()}
          </div>
          <div className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
            <span>+1,420 last hour</span>
          </div>
        </div>

        <div className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-3.5 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Unique Visits</span>
            <Users className="h-3.5 w-3.5 text-violet-400" />
          </div>
          <div className="text-lg md:text-xl font-extrabold text-white font-mono">
            {campaign.totalVisitsDelivered.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400">
            Avg. {((campaign.totalViewsDelivered) / (campaign.totalVisitsDelivered || 1)).toFixed(1)} views / visit
          </div>
        </div>

        <div className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-3.5 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Bounce Rate</span>
            <Flame className="h-3.5 w-3.5 text-amber-400" />
          </div>
          <div className="text-lg md:text-xl font-extrabold text-amber-300 font-mono">
            {campaign.volumeBehavior.bounceRatePercent}%
          </div>
          <div className="text-[11px] text-slate-400">
            Return Rate: {campaign.volumeBehavior.returnRatePercent}%
          </div>
        </div>

        <div className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-3.5 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Delivery Pace</span>
            <Zap className="h-3.5 w-3.5 text-emerald-400" />
          </div>
          <div className="text-lg md:text-xl font-extrabold text-emerald-300 font-mono">
            ~{Math.round(campaign.volumeBehavior.visitsVolume / 24).toLocaleString()} / hr
          </div>
          <div className="text-[11px] text-slate-400">
            24h Adaptive scheduling
          </div>
        </div>

      </div>
    </div>
  );
};
