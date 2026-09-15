import React from 'react';
import { 
  Sliders, 
  Clock, 
  Shuffle, 
  Activity, 
  Sparkles, 
  RotateCcw,
  Zap,
  Layers
} from 'lucide-react';
import { FullCampaignConfig, VolumeBehaviorConfig } from '../types/campaign';
import { HOURLY_PRESETS } from '../data/mockData';

interface Props {
  config: VolumeBehaviorConfig;
  innerPagesCount: number;
  onUpdate: (updated: Partial<VolumeBehaviorConfig>) => void;
}

export const ModuleVolumeBehavior: React.FC<Props> = ({
  config,
  innerPagesCount,
  onUpdate
}) => {
  // Calculation of total expected pageviews
  const totalExpectedViews = config.visitsVolume * Math.max(1, innerPagesCount);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const visits = parseInt(e.target.value, 10);
    onUpdate({
      visitsVolume: visits,
      expectedTotalPageViews: visits * Math.max(1, innerPagesCount)
    });
  };

  const handleScheduleBarChange = (hourIndex: number, val: number) => {
    const newSchedule = [...config.hourlySchedule];
    newSchedule[hourIndex] = Math.max(0, Math.min(100, val));
    onUpdate({
      hourlySchedule: newSchedule,
      scheduleCurvePreset: 'custom'
    });
  };

  const applySchedulePreset = (presetKey: keyof typeof HOURLY_PRESETS) => {
    onUpdate({
      scheduleCurvePreset: presetKey as any,
      hourlySchedule: HOURLY_PRESETS[presetKey]
    });
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 md:p-6 mb-6 shadow-xl backdrop-blur-sm">
      
      {/* Section Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-slate-800/80">
        <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
          <Sliders className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            Module B: Volume & Behavior Sliders
            <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-mono">
              PACING & ENGAGEMENT
            </span>
          </h3>
          <p className="text-xs text-slate-400">
            Configure monthly visit volume, bounce rate probabilities, dwell times, and 24-hour speed curves
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-6">
        
        {/* Left Column: Volume, Bounce, Return & Dwell Time */}
        <div className="space-y-6">
          
          {/* Visits Volume Slider */}
          <div className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-200 flex items-center gap-2">
                <Zap className="h-4 w-4 text-amber-400" />
                Monthly Visits Volume
              </label>
              <div className="text-right">
                <span className="font-mono text-base font-extrabold text-indigo-300">
                  {config.visitsVolume.toLocaleString()}
                </span>
                <span className="text-xs text-slate-400 ml-1">Visits</span>
              </div>
            </div>

            <input
              id="slider-visits-volume"
              type="range"
              min="5000"
              max="150000"
              step="5000"
              value={config.visitsVolume}
              onChange={handleSliderChange}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer"
            />

            <div className="flex justify-between text-[11px] font-mono text-slate-500">
              <span>5k (Starter)</span>
              <span>20k (Pro)</span>
              <span>50k (Growth)</span>
              <span>100k+ (Enterprise)</span>
            </div>

            {/* Auto-calculated total expected page views */}
            <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5 text-indigo-400" />
                Auto-calculated Total Page Views:
              </span>
              <span className="font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                ~{totalExpectedViews.toLocaleString()} views
              </span>
            </div>
          </div>

          {/* Bounce Rate & Return Rate Sliders */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Bounce Rate */}
            <div className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300">
                  Bounce Rate
                </label>
                <span className="font-mono text-sm font-bold text-amber-300">
                  {config.bounceRatePercent}%
                </span>
              </div>
              <input
                id="slider-bounce-rate"
                type="range"
                min="0"
                max="100"
                value={config.bounceRatePercent}
                onChange={(e) => onUpdate({ bounceRatePercent: parseInt(e.target.value, 10) })}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer"
              />
              <p className="text-[11px] text-slate-400 leading-tight">
                % of sessions that terminate after 1 page view without navigating inner pages
              </p>
            </div>

            {/* Return Rate */}
            <div className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300">
                  Returning Visitor Rate
                </label>
                <span className="font-mono text-sm font-bold text-violet-300">
                  {config.returnRatePercent}%
                </span>
              </div>
              <input
                id="slider-return-rate"
                type="range"
                min="0"
                max="100"
                value={config.returnRatePercent}
                onChange={(e) => onUpdate({ returnRatePercent: parseInt(e.target.value, 10) })}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer"
              />
              <p className="text-[11px] text-slate-400 leading-tight">
                Simulates recurring cookies and repeat user profiles across sessions
              </p>
            </div>

          </div>

          {/* Dwell Time (Time on Page) */}
          <div className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-200 flex items-center gap-2">
                <Clock className="h-4 w-4 text-indigo-400" />
                Time on Page (Dwell Time Range)
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  id="toggle-randomize-dwell"
                  onClick={() => onUpdate({ randomizeDwellTime: !config.randomizeDwellTime })}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    config.randomizeDwellTime 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Shuffle className="h-3 w-3" />
                  <span>Randomize</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-1">
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Min Dwell:</span>
                  <span className="font-mono text-slate-200 font-bold">{config.dwellTimeMinSeconds}s</span>
                </div>
                <input
                  id="slider-dwell-min"
                  type="range"
                  min="10"
                  max="120"
                  step="5"
                  value={config.dwellTimeMinSeconds}
                  onChange={(e) => {
                    const min = parseInt(e.target.value, 10);
                    onUpdate({ 
                      dwellTimeMinSeconds: min,
                      dwellTimeMaxSeconds: Math.max(min + 10, config.dwellTimeMaxSeconds)
                    });
                  }}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Max Dwell:</span>
                  <span className="font-mono text-slate-200 font-bold">{config.dwellTimeMaxSeconds}s</span>
                </div>
                <input
                  id="slider-dwell-max"
                  type="range"
                  min="30"
                  max="300"
                  step="10"
                  value={config.dwellTimeMaxSeconds}
                  onChange={(e) => {
                    const max = parseInt(e.target.value, 10);
                    onUpdate({ 
                      dwellTimeMaxSeconds: max,
                      dwellTimeMinSeconds: Math.min(max - 10, config.dwellTimeMinSeconds)
                    });
                  }}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
              <span>Expected session length:</span>
              <span className="font-mono text-indigo-300 font-semibold">
                {config.dwellTimeMinSeconds}s - {config.dwellTimeMaxSeconds}s per page
              </span>
            </div>
          </div>

        </div>

        {/* Right Column: 24-Hour Adaptive Speed Scheduling Curve */}
        <div className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between space-y-4">
          
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800/70">
              <div>
                <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Activity className="h-4 w-4 text-emerald-400" />
                  Adaptive Speed Scheduling (24h Pacing Curve)
                </h4>
                <p className="text-[11px] text-slate-400">
                  Adjust delivery velocity across each hour of the day (00:00 to 23:00)
                </p>
              </div>

              {/* Preset Selector */}
              <div className="flex items-center gap-1 flex-wrap">
                {(['even', 'business_hours', 'evening_peak', 'weekend_pulse'] as const).map((preset) => (
                  <button
                    key={preset}
                    id={`btn-preset-curve-${preset}`}
                    onClick={() => applySchedulePreset(preset)}
                    className={`px-2 py-1 rounded text-[10px] font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
                      config.scheduleCurvePreset === preset
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {preset.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Interactive Hourly Bar Chart */}
            <div className="pt-4 space-y-2">
              <div className="h-44 flex items-end justify-between gap-1 px-1 bg-slate-900/40 rounded-xl border border-slate-800/60 p-2">
                {config.hourlySchedule.map((weight, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1 group relative">
                    {/* Hover Value Tooltip */}
                    <div className="absolute -top-7 hidden group-hover:flex px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] font-mono text-indigo-300 z-10 whitespace-nowrap shadow-lg">
                      {idx.toString().padStart(2, '0')}:00 • {weight}%
                    </div>
                    
                    {/* Interactive Bar */}
                    <div 
                      className="w-full bg-slate-800 hover:bg-slate-700 rounded-t transition-all relative overflow-hidden cursor-pointer"
                      style={{ height: '120px' }}
                      onClick={() => {
                        const nextWeight = weight >= 90 ? 10 : weight + 25;
                        handleScheduleBarChange(idx, nextWeight);
                      }}
                    >
                      <div 
                        className="w-full bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t absolute bottom-0 transition-all group-hover:from-indigo-500 group-hover:to-indigo-300"
                        style={{ height: `${weight}%` }}
                      />
                    </div>

                    {/* Hour Label */}
                    <span className="text-[9px] font-mono text-slate-500 group-hover:text-slate-300">
                      {idx % 4 === 0 ? `${idx}h` : ''}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                <span>00:00 (Midnight)</span>
                <span className="text-slate-500 font-mono text-[10px]">Click any bar to modulate hourly velocity</span>
                <span>23:00 (Night)</span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800/80 text-xs text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              Peak Delivery Window:
            </span>
            <span className="font-mono text-slate-200 font-semibold">
              {config.scheduleCurvePreset === 'business_hours' ? '09:00 - 17:00 (High Day Traffic)' : 'Optimized dynamic load'}
            </span>
          </div>

        </div>

      </div>
    </div>
  );
};
