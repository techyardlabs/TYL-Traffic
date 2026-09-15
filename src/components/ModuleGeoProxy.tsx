import React, { useState } from 'react';
import { 
  Globe2, 
  Shield, 
  Server, 
  Sliders, 
  Copy, 
  Check, 
  Plus, 
  Trash2, 
  Zap,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { 
  GeoProxyConfig, 
  ProxyProviderType, 
  GeoTargetAllocation 
} from '../types/campaign';
import { buildResidentialProxyUri } from '../lib/workerEngine';

interface Props {
  config: GeoProxyConfig;
  onUpdate: (updated: Partial<GeoProxyConfig>) => void;
}

const AVAILABLE_COUNTRIES = [
  { countryCode: 'US', countryName: 'United States', flag: '🇺🇸' },
  { countryCode: 'GB', countryName: 'United Kingdom', flag: '🇬🇧' },
  { countryCode: 'DE', countryName: 'Germany', flag: '🇩🇪' },
  { countryCode: 'IN', countryName: 'India', flag: '🇮🇳' },
  { countryCode: 'CA', countryName: 'Canada', flag: '🇨🇦' },
  { countryCode: 'FR', countryName: 'France', flag: '🇫🇷' },
  { countryCode: 'AU', countryName: 'Australia', flag: '🇦🇺' },
  { countryCode: 'JP', countryName: 'Japan', flag: '🇯🇵' },
  { countryCode: 'BR', countryName: 'Brazil', flag: '🇧🇷' },
  { countryCode: 'NL', countryName: 'Netherlands', flag: '🇳🇱' }
];

export const ModuleGeoProxy: React.FC<Props> = ({
  config,
  onUpdate
}) => {
  const [copied, setCopied] = useState(false);
  const [selectedAddCountry, setSelectedAddCountry] = useState('FR');

  const totalGeoPercent = config.countryAllocations.reduce((sum, c) => sum + c.percentage, 0);

  const handleProviderChange = (provider: ProxyProviderType) => {
    let host = 'brd.superproxy.io';
    let port = 22225;
    let username = 'lum-customer-c_sparktraffic-zone-residential';

    if (provider === 'oxylabs') {
      host = 'pr.oxylabs.io';
      port = 7777;
      username = 'customer-oxylabs-res';
    } else if (provider === 'smartproxy') {
      host = 'gate.smartproxy.com';
      port = 7000;
      username = 'user-sp_residential';
    } else if (provider === 'webshare') {
      host = 'p.webshare.io';
      port = 80;
      username = 'res_webshare_zone';
    }

    onUpdate({
      provider,
      customProxyHost: host,
      customProxyPort: port,
      customProxyUsername: username
    });
  };

  const handleCountrySliderChange = (countryCode: string, newPercent: number) => {
    const updated = config.countryAllocations.map(c => 
      c.countryCode === countryCode ? { ...c, percentage: newPercent } : c
    );
    onUpdate({ countryAllocations: updated });
  };

  const handleAddCountry = () => {
    if (config.countryAllocations.some(c => c.countryCode === selectedAddCountry)) return;
    const match = AVAILABLE_COUNTRIES.find(c => c.countryCode === selectedAddCountry);
    if (!match) return;

    onUpdate({
      countryAllocations: [
        ...config.countryAllocations,
        { ...match, percentage: 10 }
      ]
    });
  };

  const handleRemoveCountry = (countryCode: string) => {
    onUpdate({
      countryAllocations: config.countryAllocations.filter(c => c.countryCode !== countryCode)
    });
  };

  // Preview generated URI
  const sampleCountry = config.countryAllocations[0]?.countryCode || 'US';
  const sampleProxyUri = buildResidentialProxyUri(config, sampleCountry);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(sampleProxyUri);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 md:p-6 mb-6 shadow-xl backdrop-blur-sm">
      
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Globe2 className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              Module F: Residential Proxy & Geo-Targeting
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                PEER-TO-PEER RESIDENTIAL POOLS
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Target country and city locations using real residential ISP IP addresses with automatic rotation or sticky sessions
            </p>
          </div>
        </div>

        {/* Targeting Mode Tabs */}
        <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
          {(['global', 'country', 'city'] as const).map((mode) => (
            <button
              key={mode}
              id={`tab-geo-mode-${mode}`}
              onClick={() => onUpdate({ targetingType: mode })}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors capitalize cursor-pointer ${
                config.targetingType === mode
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {mode === 'country' ? 'Multi-Country' : mode === 'city' ? 'City / State' : 'Global Mix'}
            </button>
          ))}
        </div>
      </div>

      {/* Provider Selector & Session Mode */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
        
        {/* Proxy Provider */}
        <div className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <Server className="h-4 w-4 text-indigo-400" />
              Residential Proxy Provider
            </label>
            <span className="text-[10px] font-mono text-emerald-400 font-bold">100M+ POOL ACTIVE</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: 'bright_data', label: 'Bright Data' },
              { id: 'oxylabs', label: 'Oxylabs' },
              { id: 'smartproxy', label: 'Smartproxy' },
              { id: 'webshare', label: 'Webshare' }
            ].map((p) => (
              <button
                key={p.id}
                id={`btn-provider-${p.id}`}
                onClick={() => handleProviderChange(p.id as ProxyProviderType)}
                className={`py-2 px-2.5 rounded-lg text-xs font-semibold border transition-all text-center cursor-pointer ${
                  config.provider === p.id
                    ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/60 shadow-sm'
                    : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* IP Session Type */}
        <div className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <RefreshCw className="h-4 w-4 text-violet-400" />
              IP Session Persistence
            </label>
            <span className="text-[10px] font-mono text-violet-300">Targeting Strategy</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'rotating', label: 'Rotating (New IP per visit)' },
              { id: 'sticky_10m', label: 'Sticky (10 Min Session)' },
              { id: 'sticky_30m', label: 'Sticky (30 Min Session)' }
            ].map((s) => (
              <button
                key={s.id}
                id={`btn-session-${s.id}`}
                onClick={() => onUpdate({ sessionType: s.id as any })}
                className={`py-2 px-2 rounded-lg text-[11px] font-semibold border transition-all text-center cursor-pointer ${
                  config.sessionType === s.id
                    ? 'bg-violet-600/20 text-violet-300 border-violet-500/60'
                    : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Multi-Country Allocation Sliders */}
      <div className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-4 space-y-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
          <div>
            <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <Sliders className="h-4 w-4 text-indigo-400" />
              Country Traffic Allocation Sliders
            </h4>
            <span className="text-[11px] text-slate-400">
              Distribute total volume across specific residential geo-locations
            </span>
          </div>

          {/* Add Country Dropdown */}
          <div className="flex items-center gap-2">
            <select
              id="select-add-country"
              value={selectedAddCountry}
              onChange={(e) => setSelectedAddCountry(e.target.value)}
              className="bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {AVAILABLE_COUNTRIES.map((c) => (
                <option key={c.countryCode} value={c.countryCode}>
                  {c.flag} {c.countryName} ({c.countryCode})
                </option>
              ))}
            </select>
            <button
              id="btn-add-country"
              onClick={handleAddCountry}
              className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" /> Add
            </button>
          </div>
        </div>

        {/* Sliders List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {config.countryAllocations.map((c) => (
            <div key={c.countryCode} className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-base">{c.flag}</span>
                  <span className="text-xs font-bold text-slate-200">{c.countryName}</span>
                  <span className="font-mono text-[10px] text-slate-500">[{c.countryCode}]</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-extrabold text-indigo-300">
                    {c.percentage}%
                  </span>
                  <button
                    onClick={() => handleRemoveCountry(c.countryCode)}
                    className="text-slate-500 hover:text-rose-400 p-0.5 cursor-pointer"
                    title="Remove country"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <input
                type="range"
                min="0"
                max="100"
                value={c.percentage}
                onChange={(e) => handleCountrySliderChange(c.countryCode, parseInt(e.target.value, 10))}
                className="w-full h-1.5 bg-slate-800 rounded appearance-none cursor-pointer"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Backend Direct Mapping to Proxy Endpoint Formats */}
      <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400 flex items-center gap-1.5 font-medium">
            <Shield className="h-3.5 w-3.5 text-emerald-400" />
            Direct Backend Proxy Endpoint Mapping Format
          </span>
          <button
            id="btn-copy-proxy-uri"
            onClick={copyToClipboard}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-200 font-semibold transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="h-3 w-3 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-3 w-3 text-slate-400" />
                <span>Copy URI</span>
              </>
            )}
          </button>
        </div>

        <p className="font-mono text-xs text-emerald-300 break-all bg-slate-900/90 p-2.5 rounded-lg border border-slate-800">
          {sampleProxyUri}
        </p>

        <p className="text-[11px] text-slate-500">
          Format: <code className="text-slate-400 font-mono">http://user-country-{'{country}'}-city-{'{city}'}:password@proxy_host:port</code>
        </p>
      </div>

    </div>
  );
};
