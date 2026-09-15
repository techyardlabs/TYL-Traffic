import React, { useState } from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid,
  Legend
} from 'recharts';
import { 
  BarChart3, 
  Calendar, 
  Globe2, 
  Smartphone, 
  Monitor, 
  ArrowUpRight,
  TrendingUp,
  Clock,
  ShieldCheck
} from 'lucide-react';
import { FullCampaignConfig } from '../types/campaign';
import { SAMPLE_DELIVERY_SERIES, SAMPLE_GEO_DELIVERY } from '../data/mockData';

interface Props {
  campaign: FullCampaignConfig;
}

export const ModuleAnalytics: React.FC<Props> = ({ campaign }) => {
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('24h');

  // Custom styling for tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-slate-700/80 p-3 rounded-xl shadow-2xl text-xs space-y-1.5 font-sans">
          <div className="font-bold text-slate-200 border-b border-slate-800 pb-1 flex items-center justify-between gap-4">
            <span>Time: {label}</span>
            <span className="text-[10px] text-emerald-400 font-mono">Status: Delivered</span>
          </div>
          <div className="flex items-center justify-between gap-4 text-indigo-300 font-mono">
            <span>Page Views:</span>
            <span className="font-bold">{payload[0]?.value?.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between gap-4 text-violet-300 font-mono">
            <span>Unique Visits:</span>
            <span className="font-bold">{payload[1]?.value?.toLocaleString()}</span>
          </div>
          {payload[2] && (
            <div className="flex items-center justify-between gap-4 text-amber-300 font-mono">
              <span>Bounced Visits:</span>
              <span>{payload[2]?.value?.toLocaleString()}</span>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 md:p-6 mb-6 shadow-xl backdrop-blur-sm">
      
      {/* Module Title & Date Range Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <BarChart3 className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base md:text-lg font-bold text-white tracking-tight flex items-center gap-2">
              Real-Time Traffic Delivery & Metrics
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                LIVE TELEMETRY
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Delivered Page Views vs. Unique Visitor sessions aggregated through residential proxy nodes
            </p>
          </div>
        </div>

        {/* Date Filter Buttons */}
        <div className="flex items-center gap-1.5 bg-slate-950/80 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
          <Calendar className="h-3.5 w-3.5 text-slate-400 ml-1.5 mr-0.5" />
          {(['24h', '7d', '30d'] as const).map((range) => (
            <button
              key={range}
              id={`filter-range-${range}`}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                timeRange === range
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {range === '24h' ? 'Last 24 Hours' : range === '7d' ? '7 Days' : '30 Days'}
            </button>
          ))}
        </div>
      </div>

      {/* Main Recharts Area Chart */}
      <div className="pt-6 pb-2">
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={SAMPLE_DELIVERY_SERIES} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="viewsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="visitsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="bounceGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis 
                dataKey="formattedTime" 
                stroke="#64748b" 
                fontSize={11} 
                tickLine={false}
              />
              <YAxis 
                stroke="#64748b" 
                fontSize={11} 
                tickLine={false}
                tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="top" 
                height={36} 
                iconType="circle"
                wrapperStyle={{ fontSize: '12px', paddingBottom: '8px' }}
              />
              <Area 
                type="monotone" 
                name="Delivered Page Views" 
                dataKey="pageViews" 
                stroke="#6366f1" 
                strokeWidth={2.5} 
                fillOpacity={1} 
                fill="url(#viewsGrad)" 
              />
              <Area 
                type="monotone" 
                name="Unique Visits" 
                dataKey="uniqueVisits" 
                stroke="#8b5cf6" 
                strokeWidth={2} 
                fillOpacity={1} 
                fill="url(#visitsGrad)" 
              />
              <Area 
                type="monotone" 
                name="Bounces (1-page exit)" 
                dataKey="bounces" 
                stroke="#f59e0b" 
                strokeWidth={1.5} 
                strokeDasharray="4 4"
                fillOpacity={1} 
                fill="url(#bounceGrad)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Breakdown Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-800/80">
        
        {/* Geo Distribution Table */}
        <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
            <span className="flex items-center gap-1.5">
              <Globe2 className="h-4 w-4 text-indigo-400" />
              Geo-Target Breakdown
            </span>
            <span className="text-[11px] text-slate-500 font-mono">Delivered Views</span>
          </div>

          <div className="space-y-2">
            {SAMPLE_GEO_DELIVERY.slice(0, 4).map((geo) => (
              <div key={geo.countryCode} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-slate-400 text-[11px]">{geo.countryCode}</span>
                  <span className="text-slate-300">{geo.countryName}</span>
                </div>
                <div className="flex items-center gap-2 font-mono">
                  <span className="text-slate-200">{geo.views.toLocaleString()}</span>
                  <span className="text-slate-500 text-[11px]">({geo.sharePercent}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Device Ratio Telemetry */}
        <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
            <span className="flex items-center gap-1.5">
              <Smartphone className="h-4 w-4 text-violet-400" />
              Device Delivery Split
            </span>
            <span className="text-[11px] text-slate-500 font-mono">Mobile vs Desktop</span>
          </div>

          <div className="space-y-3 pt-1">
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-slate-300 flex items-center gap-1">
                  <Monitor className="h-3.5 w-3.5 text-indigo-400" /> Desktop
                </span>
                <span className="font-mono text-indigo-300">{campaign.deviceTargeting.desktopRatioPercent}%</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-indigo-500 h-full rounded-full" 
                  style={{ width: `${campaign.deviceTargeting.desktopRatioPercent}%` }} 
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-slate-300 flex items-center gap-1">
                  <Smartphone className="h-3.5 w-3.5 text-violet-400" /> Mobile
                </span>
                <span className="font-mono text-violet-300">{campaign.deviceTargeting.mobileRatioPercent}%</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-violet-500 h-full rounded-full" 
                  style={{ width: `${campaign.deviceTargeting.mobileRatioPercent}%` }} 
                />
              </div>
            </div>
          </div>
        </div>

        {/* Session Quality & Stealth Integrity */}
        <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              Stealth Camouflage Score
            </span>
            <span className="text-emerald-400 font-mono text-[11px] font-bold">99.8% PASS</span>
          </div>

          <div className="space-y-2 text-xs text-slate-400">
            <div className="flex items-center justify-between">
              <span>Avg. Dwell Session:</span>
              <span className="font-mono text-slate-200 font-semibold flex items-center gap-1">
                <Clock className="h-3 w-3 text-indigo-400" />
                {Math.round((campaign.volumeBehavior.dwellTimeMinSeconds + campaign.volumeBehavior.dwellTimeMaxSeconds) / 2)}s
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Residential Proxy Health:</span>
              <span className="font-mono text-emerald-400">100% Validated</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Cloudflare / Datadome Bypass:</span>
              <span className="font-mono text-emerald-400">Stealth Active</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
