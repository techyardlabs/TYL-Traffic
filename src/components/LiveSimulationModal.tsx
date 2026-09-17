import React, { useState, useEffect } from 'react';
import { 
  X, 
  Play, 
  RotateCcw, 
  CheckCircle2, 
  AlertCircle, 
  Terminal, 
  Globe, 
  Smartphone, 
  Monitor, 
  ShieldCheck, 
  Layers, 
  ArrowRight,
  Activity,
  Cpu
} from 'lucide-react';
import { FullCampaignConfig, PlaywrightExecutionTask, LiveSimulationEvent } from '../types/campaign';
import { buildPlaywrightTask } from '../lib/workerEngine';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  campaign: FullCampaignConfig;
  onSimulateSuccess?: () => void;
}

export const LiveSimulationModal: React.FC<Props> = ({
  isOpen,
  onClose,
  campaign,
  onSimulateSuccess
}) => {
  const [task, setTask] = useState<PlaywrightExecutionTask | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [events, setEvents] = useState<LiveSimulationEvent[]>([]);
  const [activeHopIndex, setActiveHopIndex] = useState(0);

  // Initialize or start simulation
  const startSimulation = () => {
    const newTask = buildPlaywrightTask(campaign);
    setTask(newTask);
    setIsRunning(true);
    setProgress(5);
    setScrollProgress(0);
    setActiveHopIndex(0);
    setEvents([
      {
        id: `ev_1`,
        timestamp: new Date().toISOString().split('T')[1].slice(0, 8),
        phase: 'QUEUE',
        message: `Task token pulled from Redis queue by worker [${newTask.assignedWorkerId}]`,
        level: 'info'
      }
    ]);
  };

  useEffect(() => {
    if (isOpen && !isRunning && events.length === 0) {
      startSimulation();
    }
  }, [isOpen]);

  // Simulation execution timeline effect
  useEffect(() => {
    if (!isRunning || !task) return;

    const timer1 = setTimeout(() => {
      setProgress(25);
      setEvents(prev => [
        ...prev,
        {
          id: `ev_2`,
          timestamp: new Date().toISOString().split('T')[1].slice(0, 8),
          phase: 'PROXY_INIT',
          message: `Residential proxy handshake established via ${campaign.geoProxy.provider.toUpperCase()} (${task.country}) [Latency: 142ms]`,
          level: 'success'
        }
      ]);
    }, 800);

    const timer2 = setTimeout(() => {
      setProgress(45);
      setEvents(prev => [
        ...prev,
        {
          id: `ev_3`,
          timestamp: new Date().toISOString().split('T')[1].slice(0, 8),
          phase: 'FINGERPRINT',
          message: `Injected stealth camouflage: Canvas micro-noise, WebGL Intel Iris, User-Agent [${task.device.os}]`,
          level: 'info'
        }
      ]);
    }, 1600);

    const timer3 = setTimeout(() => {
      setProgress(65);
      const isGaActive = !!(campaign.advancedTracking?.enableGoogleAnalytics && campaign.advancedTracking?.gaMeasurementId);
      
      // If GA4 is configured, dispatch telemetry directly
      if (isGaActive) {
        const measId = campaign.advancedTracking.gaMeasurementId.trim().toUpperCase();
        // Client beacon
        try {
          const clientParams = new URLSearchParams({
            v: '2',
            tid: measId,
            cid: `${Math.floor(100000000 + Math.random() * 900000000)}.${Math.floor(Date.now() / 1000)}`,
            sid: `${Math.floor(Date.now() / 1000)}`,
            sct: '1',
            seg: '1',
            en: 'page_view',
            dl: task.navigationFlow.entryUrl,
            dt: `Session - ${campaign.targetDomain}`,
            dr: task.headersAndCookies.referrer || 'https://www.google.com/',
            _p: String(Date.now()),
            _et: String(task.navigationFlow.dwellTimeSeconds * 1000)
          });
          fetch(`https://www.google-analytics.com/g/collect?${clientParams.toString()}`, {
            method: 'GET',
            mode: 'no-cors'
          }).catch(() => {});
        } catch (_) {}

        // Server hit
        fetch('/api/traffic/test-ga4', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            measurementId: measId,
            apiSecret: campaign.advancedTracking.gaApiSecret?.trim() || undefined,
            targetUrl: task.navigationFlow.entryUrl,
            pageTitle: `Live Simulation - ${campaign.targetDomain}`,
            dwellSeconds: task.navigationFlow.dwellTimeSeconds
          })
        }).catch(() => {});
      }

      setEvents(prev => [
        ...prev,
        {
          id: `ev_4`,
          timestamp: new Date().toISOString().split('T')[1].slice(0, 8),
          phase: 'NAVIGATE',
          message: `Navigated to Entry URL [${task.navigationFlow.entryUrl}] with Referrer [${task.headersAndCookies.referrer || 'Direct'}]${isGaActive ? ` (Dispatched GA4 telemetry to ${campaign.advancedTracking.gaMeasurementId})` : ''}`,
          level: 'success'
        }
      ]);
      setScrollProgress(task.behaviorSimulation.scrollDepthPercent);
    }, 2400);

    const timer4 = setTimeout(() => {
      setProgress(85);
      if (!task.navigationFlow.willBounce && task.navigationFlow.innerUrls.length > 0) {
        setActiveHopIndex(1);
        setEvents(prev => [
          ...prev,
          {
            id: `ev_5`,
            timestamp: new Date().toISOString().split('T')[1].slice(0, 8),
            phase: 'INNER_HOP',
            message: `Hopped to sub-page [${task.navigationFlow.innerUrls[0]}], executed in-page anchor clicks & dwell pause (${task.navigationFlow.dwellTimeSeconds}s)`,
            level: 'info'
          }
        ]);
      } else {
        setEvents(prev => [
          ...prev,
          {
            id: `ev_5`,
            timestamp: new Date().toISOString().split('T')[1].slice(0, 8),
            phase: 'INTERACT',
            message: `Executed dwell pause (${task.navigationFlow.dwellTimeSeconds}s), calculated bounce termination`,
            level: 'info'
          }
        ]);
      }
    }, 3500);

    const timer5 = setTimeout(() => {
      setProgress(100);
      setIsRunning(false);
      setEvents(prev => [
        ...prev,
        {
          id: `ev_6`,
          timestamp: new Date().toISOString().split('T')[1].slice(0, 8),
          phase: 'COMPLETED',
          message: `Session concluded successfully. Reported +${task.navigationFlow.pagesToVisit} PageViews and +1 Visit to ingestion metrics.`,
          level: 'success'
        }
      ]);
      if (onSimulateSuccess) onSimulateSuccess();
    }, 4500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      clearTimeout(timer5);
    };
  }, [isRunning, task]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Activity className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                Live Playwright Headless Worker Simulator
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                  ACTIVE TEST POD
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Visualizing token pull, residential proxy handshake, stealth fingerprint, and DOM navigation
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-restart-simulation"
              onClick={startSimulation}
              disabled={isRunning}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              <RotateCcw className={`h-3.5 w-3.5 ${isRunning ? 'animate-spin' : ''}`} />
              <span>Run Another Test</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-800 h-1">
          <div 
            className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Modal Body: 2 Columns (Virtual Viewport & Live Worker Log Stream) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 overflow-y-auto">
          
          {/* Column 1: Virtual Browser Viewport */}
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-bold flex items-center gap-1.5">
                {task?.device.type === 'mobile' ? <Smartphone className="h-4 w-4 text-violet-400" /> : <Monitor className="h-4 w-4 text-indigo-400" />}
                Virtual Browser Window ({task?.device.viewport.width}x{task?.device.viewport.height})
              </span>
              <span className="font-mono text-[11px] text-emerald-400">
                {task?.country} Residential IP Active
              </span>
            </div>

            {/* Browser Mockup Window */}
            <div className="rounded-xl border border-slate-700/80 bg-slate-950 overflow-hidden shadow-inner flex flex-col h-[340px]">
              
              {/* Browser Address Bar */}
              <div className="bg-slate-900 px-3 py-2 border-b border-slate-800 flex items-center gap-2 text-xs">
                <div className="flex gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-rose-500/80" />
                  <div className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
                  <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
                </div>
                <div className="flex-1 bg-slate-950 px-2.5 py-1 rounded text-[11px] font-mono text-slate-300 flex items-center justify-between truncate">
                  <span className="text-emerald-400 mr-1">🔒</span>
                  <span className="truncate">
                    {activeHopIndex > 0 && task?.navigationFlow.innerUrls[0] 
                      ? task.navigationFlow.innerUrls[0] 
                      : task?.navigationFlow.entryUrl}
                  </span>
                </div>
              </div>

              {/* Rendered Viewport Content Mockup */}
              <div className="flex-1 p-4 bg-slate-900/40 relative overflow-hidden flex flex-col justify-between">
                
                {/* Simulated Content Skeleton */}
                <div 
                  className="space-y-3 transition-transform duration-700 ease-out"
                  style={{ transform: `translateY(-${scrollProgress * 0.8}px)` }}
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <div className="h-4 w-28 bg-indigo-500/30 rounded" />
                    <div className="flex gap-2">
                      <div className="h-3 w-10 bg-slate-800 rounded" />
                      <div className="h-3 w-10 bg-slate-800 rounded" />
                      <div className="h-3 w-10 bg-slate-800 rounded" />
                    </div>
                  </div>

                  <div className="h-8 w-3/4 bg-slate-800/80 rounded" />
                  <div className="space-y-1.5">
                    <div className="h-3 w-full bg-slate-800/50 rounded" />
                    <div className="h-3 w-5/6 bg-slate-800/50 rounded" />
                    <div className="h-3 w-2/3 bg-slate-800/50 rounded" />
                  </div>

                  <div className="p-3 rounded-lg bg-indigo-950/30 border border-indigo-500/20 text-xs text-indigo-200">
                    Active Landing Section • Simulated Human Dwell: {task?.navigationFlow.dwellTimeSeconds}s
                  </div>

                  <div className="h-20 w-full bg-slate-800/40 rounded-lg p-2 space-y-1">
                    <div className="h-3 w-1/3 bg-slate-700/60 rounded" />
                    <div className="h-2 w-full bg-slate-800/60 rounded" />
                    <div className="h-2 w-4/5 bg-slate-800/60 rounded" />
                  </div>
                </div>

                {/* Simulated Virtual Mouse Cursor */}
                <div 
                  className="absolute z-20 pointer-events-none transition-all duration-500 ease-out"
                  style={{
                    top: `${40 + (scrollProgress % 40) * 4}px`,
                    left: `${60 + (progress % 50) * 6}px`
                  }}
                >
                  <div className="h-4 w-4 border-2 border-indigo-400 bg-indigo-500/60 rounded-full shadow-lg animate-ping" />
                </div>

                {/* Viewport Floating Status Badge */}
                <div className="mt-auto pt-2 flex items-center justify-between text-[11px] font-mono bg-slate-950/90 p-2 rounded border border-slate-800 text-slate-400">
                  <span>Scroll: {scrollProgress}%</span>
                  <span>Bounced: {task?.navigationFlow.willBounce ? 'YES (1-page)' : 'NO (Multi-hop)'}</span>
                  <span className="text-emerald-400 font-bold">{progress}% DONE</span>
                </div>
              </div>
            </div>

            {/* Active Fingerprint Summary */}
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs space-y-1.5">
              <div className="flex items-center justify-between text-slate-300 font-semibold">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                  Active Execution Fingerprint
                </span>
                <span className="font-mono text-[11px] text-indigo-300">{task?.device.os}</span>
              </div>
              <p className="font-mono text-[11px] text-slate-400 truncate">
                UA: {task?.device.userAgent}
              </p>
            </div>
          </div>

          {/* Column 2: Real-Time Worker Log Stream */}
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-bold flex items-center gap-1.5">
                <Terminal className="h-4 w-4 text-emerald-400" />
                Worker Cluster Log Stream
              </span>
              <span className="font-mono text-[11px] text-slate-400">
                {task?.assignedWorkerId}
              </span>
            </div>

            {/* Console Log Window */}
            <div className="bg-slate-950 rounded-xl border border-slate-800 p-4 font-mono text-xs space-y-3 h-[340px] overflow-y-auto">
              {events.map((ev) => (
                <div key={ev.id} className="space-y-0.5">
                  <div className="flex items-center gap-2 text-[11px]">
                    <span className="text-slate-500">[{ev.timestamp}]</span>
                    <span className={`font-bold uppercase ${
                      ev.phase === 'COMPLETED' ? 'text-emerald-400' :
                      ev.phase === 'PROXY_INIT' ? 'text-violet-400' :
                      ev.phase === 'NAVIGATE' ? 'text-indigo-400' :
                      'text-amber-400'
                    }`}>
                      [{ev.phase}]
                    </span>
                  </div>
                  <p className={`pl-2 border-l-2 ${
                    ev.level === 'success' ? 'border-emerald-500 text-slate-200' :
                    ev.level === 'warn' ? 'border-amber-500 text-amber-200' :
                    'border-indigo-500 text-slate-300'
                  }`}>
                    {ev.message}
                  </p>
                </div>
              ))}

              {isRunning && (
                <div className="flex items-center gap-2 text-slate-500 pt-2 animate-pulse">
                  <Cpu className="h-3.5 w-3.5 text-indigo-400" />
                  <span>Worker thread running Playwright browser context...</span>
                </div>
              )}
            </div>

            {/* Proxy URI & Referrer Footer */}
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs space-y-1">
              <div className="text-slate-400">Target Referrer:</div>
              <div className="font-mono text-indigo-300 truncate">
                {task?.headersAndCookies.referrer || '(Direct Address Bar Navigation)'}
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
