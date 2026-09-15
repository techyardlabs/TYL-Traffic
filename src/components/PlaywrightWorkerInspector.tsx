import React, { useState } from 'react';
import { 
  X, 
  Code2, 
  Copy, 
  Check, 
  Cpu, 
  Server, 
  Layers, 
  Network, 
  ShieldCheck, 
  Terminal,
  Activity
} from 'lucide-react';
import { PLAYWRIGHT_WORKER_CODE_TEMPLATE } from '../lib/workerEngine';
import { MOCK_WORKER_CLUSTERS } from '../data/mockData';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const PlaywrightWorkerInspector: React.FC<Props> = ({
  isOpen,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'code' | 'architecture' | 'clusters'>('code');
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(PLAYWRIGHT_WORKER_CODE_TEMPLATE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-5xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Code2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                Playwright Execution Engine & Worker Cluster
                <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-mono">
                  BULLMQ & CHROMIUM
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Playwright stealth worker loop, proxy connector, fingerprint camouflage, and distributed task runner
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {activeTab === 'code' && (
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy Worker Code</span>
                  </>
                )}
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 py-2.5 bg-slate-950 border-b border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('code')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
              activeTab === 'code'
                ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Playwright Worker Loop (Node.js/TS)
          </button>
          <button
            onClick={() => setActiveTab('architecture')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
              activeTab === 'architecture'
                ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Microservices System Architecture
          </button>
          <button
            onClick={() => setActiveTab('clusters')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
              activeTab === 'clusters'
                ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Active Cluster Nodes Telemetry ({MOCK_WORKER_CLUSTERS.length})
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto bg-slate-950 flex-1">
          
          {activeTab === 'code' && (
            <pre className="font-mono text-xs text-indigo-200 whitespace-pre-wrap leading-relaxed select-text">
              {PLAYWRIGHT_WORKER_CODE_TEMPLATE}
            </pre>
          )}

          {activeTab === 'architecture' && (
            <div className="space-y-6 text-xs text-slate-300">
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                
                {/* Step 1 */}
                <div className="p-4 rounded-xl bg-slate-900 border border-indigo-500/30 space-y-2">
                  <div className="flex items-center justify-between text-indigo-400 font-bold uppercase">
                    <span>1. Client & API</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20">Next.js / Nest</span>
                  </div>
                  <p className="text-slate-400">
                    Campaign config validated via Zod & React Hook Form. Hourly speed scheduler generates target delivery tokens.
                  </p>
                </div>

                {/* Step 2 */}
                <div className="p-4 rounded-xl bg-slate-900 border border-violet-500/30 space-y-2">
                  <div className="flex items-center justify-between text-violet-400 font-bold uppercase">
                    <span>2. Queue Orchestrator</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-violet-500/20">Redis + BullMQ</span>
                  </div>
                  <p className="text-slate-400">
                    Token rate limiter prevents IP bans. Tasks dispatched to worker clusters with geo-target matching.
                  </p>
                </div>

                {/* Step 3 */}
                <div className="p-4 rounded-xl bg-slate-900 border border-emerald-500/30 space-y-2">
                  <div className="flex items-center justify-between text-emerald-400 font-bold uppercase">
                    <span>3. Worker Engine</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20">Playwright Cluster</span>
                  </div>
                  <p className="text-slate-400">
                    Headless Chromium instances launch with injected stealth fingerprints and residential proxy handshakes.
                  </p>
                </div>

                {/* Step 4 */}
                <div className="p-4 rounded-xl bg-slate-900 border border-amber-500/30 space-y-2">
                  <div className="flex items-center justify-between text-amber-400 font-bold uppercase">
                    <span>4. Metrics Ingestion</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20">PostgreSQL</span>
                  </div>
                  <p className="text-slate-400">
                    Delivery success, dwell times, and bounce telemetry aggregated in real-time for live Recharts visualization.
                  </p>
                </div>

              </div>

              {/* Architecture Blueprint Card */}
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  Headless Camouflage & Antidetect Architecture
                </h4>
                <p className="text-slate-400 leading-relaxed">
                  The Playwright execution engine overrides <code className="text-indigo-300 font-mono">navigator.webdriver</code>, introduces deterministic pixel noise to HTML5 Canvas contexts, spoofs WebGL UNMASKED_VENDOR and UNMASKED_RENDERER tokens with Intel/NVIDIA signatures, and applies natural cubic bezier mouse curves to emulate organic human interactions.
                </p>
              </div>

            </div>
          )}

          {activeTab === 'clusters' && (
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 font-mono">
                      <th className="pb-3">Node Hostname</th>
                      <th className="pb-3">Region</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3">Active Browsers</th>
                      <th className="pb-3">CPU Load</th>
                      <th className="pb-3">Memory Load</th>
                      <th className="pb-3">Proxy Latency</th>
                      <th className="pb-3">Total Executed</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {MOCK_WORKER_CLUSTERS.map((node) => (
                      <tr key={node.id} className="hover:bg-slate-900/50">
                        <td className="py-3 text-indigo-300 font-bold">{node.id}</td>
                        <td className="py-3 text-slate-300">{node.region}</td>
                        <td className="py-3">
                          <span className="inline-flex items-center gap-1 text-emerald-400 font-bold">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            {node.status}
                          </span>
                        </td>
                        <td className="py-3 text-slate-200">{node.activeBrowsers} / {node.maxSlots}</td>
                        <td className="py-3 text-slate-300">{node.cpuLoadPercent}%</td>
                        <td className="py-3 text-slate-300">{node.memoryLoadPercent}%</td>
                        <td className="py-3 text-amber-300">{node.proxyLatencyMs}ms</td>
                        <td className="py-3 text-slate-200">{node.totalSessionsExecuted.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
