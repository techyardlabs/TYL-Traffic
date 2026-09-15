import React from 'react';
import { 
  MousePointer, 
  Eye, 
  ShieldCheck, 
  Sparkles, 
  Move, 
  CheckSquare, 
  FormInput, 
  Cpu, 
  Layers
} from 'lucide-react';
import { BehavioralSimulationConfig } from '../types/campaign';

interface Props {
  config: BehavioralSimulationConfig;
  onUpdate: (updated: Partial<BehavioralSimulationConfig>) => void;
}

export const ModuleBehavioralSimulation: React.FC<Props> = ({
  config,
  onUpdate
}) => {
  return (
    <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 md:p-6 mb-6 shadow-xl backdrop-blur-sm">
      
      {/* Section Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-slate-800/80">
        <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
          <MousePointer className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            Module G: In-Page Event & Behavioral Simulation
            <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-mono">
              HUMAN HEURISTICS & STEALTH
            </span>
          </h3>
          <p className="text-xs text-slate-400">
            Simulate realistic human-like smooth scrolling, internal anchor clicks, non-invasive form focus, and browser fingerprint masking
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 my-6">
        
        {/* 1. Human Scroll Simulation */}
        <div className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Move className="h-4 w-4 text-indigo-400" />
              <label className="text-xs font-bold text-slate-200">
                Smooth Scroll Simulation
              </label>
            </div>
            <button
              type="button"
              id="toggle-scroll-events"
              onClick={() => onUpdate({ enableScrollEvents: !config.enableScrollEvents })}
              className={`px-2.5 py-1 rounded text-xs font-semibold cursor-pointer ${
                config.enableScrollEvents 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {config.enableScrollEvents ? 'Enabled' : 'Disabled'}
            </button>
          </div>

          <div className="space-y-3">
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">% Sessions Scrolling:</span>
                <span className="font-mono text-indigo-300 font-bold">{config.scrollSessionsPercent}%</span>
              </div>
              <input
                id="slider-scroll-sessions"
                type="range"
                min="0"
                max="100"
                value={config.scrollSessionsPercent}
                onChange={(e) => onUpdate({ scrollSessionsPercent: parseInt(e.target.value, 10) })}
                className="w-full h-1.5 bg-slate-800 rounded appearance-none cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Scroll Depth Target:</span>
                <span className="font-mono text-indigo-300 font-bold">
                  {config.scrollDepthMinPercent}% - {config.scrollDepthMaxPercent}%
                </span>
              </div>
              <input
                id="slider-scroll-depth-max"
                type="range"
                min="20"
                max="100"
                value={config.scrollDepthMaxPercent}
                onChange={(e) => onUpdate({ scrollDepthMaxPercent: parseInt(e.target.value, 10) })}
                className="w-full h-1.5 bg-slate-800 rounded appearance-none cursor-pointer"
              />
            </div>

            <div className="pt-1">
              <label className="text-[11px] text-slate-400 block mb-1">Scroll Pacing Heuristic:</label>
              <select
                id="select-scroll-speed"
                value={config.scrollSpeed}
                onChange={(e) => onUpdate({ scrollSpeed: e.target.value as any })}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="natural_human">Natural Human (Variable pauses)</option>
                <option value="deep_reading">Deep Reading (Slow methodical)</option>
                <option value="fast_glance">Fast Glance (Quick scanner)</option>
              </select>
            </div>
          </div>
        </div>

        {/* 2. Internal Link Clicks & Form Interactions */}
        <div className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckSquare className="h-4 w-4 text-violet-400" />
              <label className="text-xs font-bold text-slate-200">
                In-Page Anchor & Form Clicks
              </label>
            </div>
            <span className="text-[10px] font-mono text-violet-300">INTERACTION</span>
          </div>

          <div className="space-y-4">
            {/* Internal Clicks */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Internal Link Clicks:</span>
                <span className="font-mono text-violet-300 font-bold">{config.internalClickPercent}%</span>
              </div>
              <input
                id="slider-internal-click"
                type="range"
                min="0"
                max="100"
                value={config.internalClickPercent}
                onChange={(e) => onUpdate({ internalClickPercent: parseInt(e.target.value, 10) })}
                className="w-full h-1.5 bg-slate-800 rounded appearance-none cursor-pointer"
              />
              <p className="text-[10px] text-slate-500">
                Visits will click on in-content hyperlinks to emulate active organic navigation.
              </p>
            </div>

            {/* Form Focus */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Simulated Form Focus:</span>
                <span className="font-mono text-violet-300 font-bold">{config.formInteractionPercent}%</span>
              </div>
              <input
                id="slider-form-interaction"
                type="range"
                min="0"
                max="100"
                value={config.formInteractionPercent}
                onChange={(e) => onUpdate({ formInteractionPercent: parseInt(e.target.value, 10) })}
                className="w-full h-1.5 bg-slate-800 rounded appearance-none cursor-pointer"
              />
              <p className="text-[10px] text-slate-500">
                Triggers non-invasive focus on search bars or inputs without payload submission.
              </p>
            </div>
          </div>
        </div>

        {/* 3. Fingerprint Camouflage & Stealth Masks */}
        <div className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <label className="text-xs font-bold text-slate-200">
                Stealth Fingerprint Camouflage
              </label>
            </div>
            <span className="text-[10px] font-mono text-emerald-400">ANTIDETECT</span>
          </div>

          <div className="space-y-2.5 pt-1">
            {[
              { 
                key: 'stealthCanvasNoise', 
                label: 'HTML5 Canvas Micro-Noise Injection', 
                desc: 'Alters pixel hashes uniquely per browser context'
              },
              { 
                key: 'stealthWebGlVendorMask', 
                label: 'WebGL Vendor & Renderer Spoofing', 
                desc: 'Masks SwiftShader with Intel / NVIDIA signatures'
              },
              { 
                key: 'stealthAudioContextSpoof', 
                label: 'AudioContext Fingerprint Randomization', 
                desc: 'Oscillator frequency perturbation'
              },
              { 
                key: 'adBlockBypassEmulation', 
                label: 'AdBlock / Tracker Emulation Bypass', 
                desc: 'Simulates common browser extension footprints'
              }
            ].map((item) => (
              <label 
                key={item.key}
                className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-900/60 border border-slate-800/60 cursor-pointer hover:border-slate-700"
              >
                <input
                  type="checkbox"
                  checked={(config as any)[item.key]}
                  onChange={(e) => onUpdate({ [item.key]: e.target.checked } as any)}
                  className="mt-0.5 rounded text-indigo-600 focus:ring-0 focus:ring-offset-0 bg-slate-800 border-slate-700"
                />
                <div className="text-left">
                  <span className="text-xs font-medium text-slate-200 block">{item.label}</span>
                  <span className="text-[10px] text-slate-400">{item.desc}</span>
                </div>
              </label>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
