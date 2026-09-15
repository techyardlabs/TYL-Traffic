import React from 'react';
import { 
  Laptop, 
  Smartphone, 
  Monitor, 
  Cpu, 
  Tablet, 
  Check, 
  Terminal, 
  Sparkles,
  Layers
} from 'lucide-react';
import { DeviceTargetingConfig } from '../types/campaign';

interface Props {
  config: DeviceTargetingConfig;
  onUpdate: (updated: Partial<DeviceTargetingConfig>) => void;
}

export const ModuleDeviceTargeting: React.FC<Props> = ({
  config,
  onUpdate
}) => {
  const handleRatioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const mobile = parseInt(e.target.value, 10);
    onUpdate({
      mobileRatioPercent: mobile,
      desktopRatioPercent: 100 - mobile
    });
  };

  const sampleUserAgent = config.mobileRatioPercent > 50
    ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1'
    : 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36';

  return (
    <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 md:p-6 mb-6 shadow-xl backdrop-blur-sm">
      
      {/* Section Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-slate-800/80">
        <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
          <Laptop className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            Module E: Device & OS Targeting
            <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-mono">
              USER-AGENT & RESOLUTION
            </span>
          </h3>
          <p className="text-xs text-slate-400">
            Configure desktop vs. mobile device ratios, operating systems, and viewport resolution matching
          </p>
        </div>
      </div>

      {/* Main Ratio Slider: Desktop vs Mobile */}
      <div className="my-6 p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Monitor className="h-4 w-4 text-indigo-400" />
            <span className="text-xs font-bold text-indigo-300">
              Desktop: {config.desktopRatioPercent}%
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-violet-300">
              Mobile: {config.mobileRatioPercent}%
            </span>
            <Smartphone className="h-4 w-4 text-violet-400" />
          </div>
        </div>

        <input
          id="slider-device-ratio"
          type="range"
          min="0"
          max="100"
          value={config.mobileRatioPercent}
          onChange={handleRatioChange}
          className="w-full h-2.5 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-lg appearance-none cursor-pointer"
        />

        <div className="flex justify-between text-[11px] font-mono text-slate-500">
          <span>100% Desktop (B2B SaaS / Workflows)</span>
          <span>50/50 Balanced</span>
          <span>100% Mobile (Social / E-Commerce)</span>
        </div>
      </div>

      {/* 2 Sub-Columns: Desktop OS Distribution & Mobile OS Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        
        {/* Desktop OS Breakdown */}
        <div className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
              <Monitor className="h-4 w-4" />
              Desktop Operating Systems
            </span>
            <span className="text-[10px] text-slate-500 font-mono">Total 100%</span>
          </div>

          <div className="space-y-3 pt-1">
            {/* Windows */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">Windows (10 / 11)</span>
                <span className="font-mono text-indigo-300 font-bold">{config.desktopOS.windows}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={config.desktopOS.windows}
                onChange={(e) => onUpdate({
                  desktopOS: { ...config.desktopOS, windows: parseInt(e.target.value, 10) }
                })}
                className="w-full h-1.5 bg-slate-800 rounded appearance-none cursor-pointer"
              />
            </div>

            {/* macOS */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">macOS (Sonoma / Ventura)</span>
                <span className="font-mono text-indigo-300 font-bold">{config.desktopOS.macos}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={config.desktopOS.macos}
                onChange={(e) => onUpdate({
                  desktopOS: { ...config.desktopOS, macos: parseInt(e.target.value, 10) }
                })}
                className="w-full h-1.5 bg-slate-800 rounded appearance-none cursor-pointer"
              />
            </div>

            {/* Linux */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">Linux (Ubuntu / Debian / Arch)</span>
                <span className="font-mono text-indigo-300 font-bold">{config.desktopOS.linux}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={config.desktopOS.linux}
                onChange={(e) => onUpdate({
                  desktopOS: { ...config.desktopOS, linux: parseInt(e.target.value, 10) }
                })}
                className="w-full h-1.5 bg-slate-800 rounded appearance-none cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Mobile OS Breakdown */}
        <div className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-xs font-bold text-violet-300 flex items-center gap-1.5">
              <Smartphone className="h-4 w-4" />
              Mobile Operating Systems
            </span>
            <span className="text-[10px] text-slate-500 font-mono">Total 100%</span>
          </div>

          <div className="space-y-4 pt-1">
            {/* iOS (Apple) */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">Apple iOS (iPhone / iPad)</span>
                <span className="font-mono text-violet-300 font-bold">{config.mobileOS.ios}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={config.mobileOS.ios}
                onChange={(e) => onUpdate({
                  mobileOS: { ...config.mobileOS, ios: parseInt(e.target.value, 10), android: 100 - parseInt(e.target.value, 10) }
                })}
                className="w-full h-1.5 bg-slate-800 rounded appearance-none cursor-pointer"
              />
            </div>

            {/* Android */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">Google Android (14 / 15)</span>
                <span className="font-mono text-violet-300 font-bold">{config.mobileOS.android}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={config.mobileOS.android}
                onChange={(e) => onUpdate({
                  mobileOS: { ...config.mobileOS, android: parseInt(e.target.value, 10), ios: 100 - parseInt(e.target.value, 10) }
                })}
                className="w-full h-1.5 bg-slate-800 rounded appearance-none cursor-pointer"
              />
            </div>

            <div className="p-2.5 rounded bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400">
              High-fidelity mobile touch simulation with simulated devicePixelRatio (2.0 - 3.0x).
            </div>
          </div>
        </div>

      </div>

      {/* Live Simulated User-Agent Preview */}
      <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400 flex items-center gap-1.5 font-medium">
            <Terminal className="h-3.5 w-3.5 text-emerald-400" />
            Active Fingerprint User-Agent Preview
          </span>
          <span className="text-[10px] text-emerald-400 font-mono font-bold">STEALTH SPOOF ACTIVE</span>
        </div>
        <p className="font-mono text-xs text-indigo-300 break-all bg-slate-900/90 p-2.5 rounded-lg border border-slate-800">
          {sampleUserAgent}
        </p>
      </div>

    </div>
  );
};
