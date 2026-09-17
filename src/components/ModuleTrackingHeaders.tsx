import React, { useState } from 'react';
import { 
  Tags, 
  Link, 
  Plus, 
  Trash2, 
  Cookie, 
  Languages, 
  Globe, 
  Copy, 
  Check,
  Code2,
  Activity,
  Sparkles,
  Send,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Shield,
  BarChart2
} from 'lucide-react';
import { AdvancedTrackingConfig, HeaderEntry, CookieEntry } from '../types/campaign';

interface Props {
  config: AdvancedTrackingConfig;
  targetDomain: string;
  onUpdate: (updated: Partial<AdvancedTrackingConfig>) => void;
}

export const ModuleTrackingHeaders: React.FC<Props> = ({
  config,
  targetDomain,
  onUpdate
}) => {
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [newHeaderKey, setNewHeaderKey] = useState('');
  const [newHeaderVal, setNewHeaderVal] = useState('');
  const [newCookieName, setNewCookieName] = useState('');
  const [newCookieVal, setNewCookieVal] = useState('');

  // GA4 Realtime Test State
  const [isTestingGa, setIsTestingGa] = useState(false);
  const [testGaResult, setTestGaResult] = useState<any | null>(null);
  const [testGaError, setTestGaError] = useState<string | null>(null);

  const handleTestGa4 = async () => {
    if (!config.gaMeasurementId?.trim()) {
      setTestGaError('Please enter a valid Google Analytics Measurement ID (e.g. G-XXXXXXXXXX)');
      return;
    }
    setIsTestingGa(true);
    setTestGaError(null);
    setTestGaResult(null);

    try {
      const res = await fetch('/api/traffic/test-ga4', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          measurementId: config.gaMeasurementId.trim(),
          apiSecret: config.gaApiSecret?.trim() || undefined,
          targetUrl: `https://${targetDomain}/`,
          pageTitle: `Home - ${targetDomain}`,
          dwellSeconds: config.gaSessionDwellSeconds || 45
        })
      });

      const data = await res.json();
      if (data.success) {
        setTestGaResult(data);
      } else {
        setTestGaError(data.error || 'Failed to dispatch test hit to Google Analytics');
      }
    } catch (err: any) {
      setTestGaError(err.message || 'Network error connecting to GA4 testing endpoint');
    } finally {
      setIsTestingGa(false);
    }
  };

  // Generated live UTM URL
  const buildFullUrl = () => {
    let base = `https://${targetDomain}`;
    if (!config.enableUtm) return base;
    const params = new URLSearchParams();
    if (config.utmSource) params.set('utm_source', config.utmSource);
    if (config.utmMedium) params.set('utm_medium', config.utmMedium);
    if (config.utmCampaign) params.set('utm_campaign', config.utmCampaign);
    if (config.utmTerm) params.set('utm_term', config.utmTerm);
    if (config.utmContent) params.set('utm_content', config.utmContent);

    const queryString = params.toString();
    return queryString ? `${base}?${queryString}` : base;
  };

  const copyUrl = () => {
    navigator.clipboard.writeText(buildFullUrl());
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const addHeader = () => {
    if (!newHeaderKey.trim() || !newHeaderVal.trim()) return;
    const entry: HeaderEntry = {
      id: `h_${Date.now()}`,
      key: newHeaderKey.trim(),
      value: newHeaderVal.trim(),
      enabled: true
    };
    onUpdate({ customHeaders: [...config.customHeaders, entry] });
    setNewHeaderKey('');
    setNewHeaderVal('');
  };

  const removeHeader = (id: string) => {
    onUpdate({ customHeaders: config.customHeaders.filter(h => h.id !== id) });
  };

  const addCookie = () => {
    if (!newCookieName.trim() || !newCookieVal.trim()) return;
    const entry: CookieEntry = {
      id: `c_${Date.now()}`,
      name: newCookieName.trim(),
      value: newCookieVal.trim(),
      domain: targetDomain,
      path: '/',
      enabled: true
    };
    onUpdate({ customCookies: [...config.customCookies, entry] });
    setNewCookieName('');
    setNewCookieVal('');
  };

  const removeCookie = (id: string) => {
    onUpdate({ customCookies: config.customCookies.filter(c => c.id !== id) });
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 md:p-6 mb-6 shadow-xl backdrop-blur-sm">
      
      {/* Section Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-slate-800/80">
        <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
          <Tags className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            Module H: Advanced Tracking & Headers
            <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono">
              GA4 MEASUREMENT ID & UTM
            </span>
          </h3>
          <p className="text-xs text-slate-400">
            Configure Google Analytics 4 Measurement ID for verified realtime tracking, build UTM tags, and customize HTTP headers
          </p>
        </div>
      </div>

      {/* PRIORITY FEATURE: Google Analytics Measurement ID Card */}
      <div className="my-6 p-4 md:p-5 rounded-xl bg-gradient-to-br from-amber-950/20 via-slate-950/80 to-slate-900/60 border border-amber-500/30 shadow-lg space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-amber-500/20">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30">
              <BarChart2 className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-white tracking-tight">
                  Google Analytics 4 Measurement ID Integration
                </h4>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold uppercase">
                  Better Traffic Results
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Directly registers sessions, page views, and engagement depth in your Google Analytics dashboard
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              id="toggle-enable-ga"
              onClick={() => onUpdate({ enableGoogleAnalytics: !config.enableGoogleAnalytics })}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                config.enableGoogleAnalytics 
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20' 
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {config.enableGoogleAnalytics ? 'GA4 Active' : 'GA4 Disabled'}
            </button>
          </div>
        </div>

        {config.enableGoogleAnalytics && (
          <div className="space-y-4 animate-in fade-in duration-150">
            {/* Explainer callout */}
            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200/90 leading-relaxed flex items-start gap-2.5">
              <Sparkles className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white font-semibold">How it improves traffic results:</strong> By specifying your site's GA4 Measurement ID, our browser automation engine directly dispatches native Google Analytics telemetry (<code className="text-amber-300">page_view</code>, <code className="text-amber-300">user_engagement</code>, and <code className="text-amber-300">scroll</code> events) while synchronizing with the Measurement Protocol. This ensures <strong className="text-white">100% of delivered visits appear instantly in your GA4 Realtime overview</strong> and avoid client-side ad-blocker drop-offs.
              </div>
            </div>

            {/* Inputs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              
              {/* Measurement ID */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-200 flex items-center justify-between">
                  <span>Google Analytics Measurement ID <span className="text-amber-400">*</span></span>
                  <span className="text-[10px] font-mono text-amber-400">G-XXXXXXXXXX</span>
                </label>
                <div className="relative">
                  <input
                    id="input-ga-measurement-id"
                    type="text"
                    value={config.gaMeasurementId || ''}
                    onChange={(e) => onUpdate({ gaMeasurementId: e.target.value.toUpperCase() })}
                    placeholder="e.g. G-K8X9Y1Z2AB"
                    className="w-full bg-slate-900 border border-amber-500/40 rounded-lg px-3 py-2 text-xs text-amber-200 font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  {config.gaMeasurementId && config.gaMeasurementId.startsWith('G-') && (
                    <span className="absolute right-2.5 top-2 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                      GA4
                    </span>
                  )}
                </div>
              </div>

              {/* API Secret (Optional) */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-200 flex items-center justify-between">
                  <span>Measurement Protocol API Secret</span>
                  <span className="text-[10px] text-slate-400">Optional</span>
                </label>
                <input
                  id="input-ga-api-secret"
                  type="password"
                  value={config.gaApiSecret || ''}
                  onChange={(e) => onUpdate({ gaApiSecret: e.target.value })}
                  placeholder="From GA4 Admin > Data Streams > Protocol Secrets"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {/* Dispatch Mode */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-200">
                  Telemetry Dispatch Architecture
                </label>
                <select
                  id="select-ga-dispatch-mode"
                  value={config.gaDispatchMode || 'hybrid'}
                  onChange={(e) => onUpdate({ gaDispatchMode: e.target.value as any })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="hybrid">Hybrid: Real Chromium GTAG + Server Protocol Fallback (Recommended)</option>
                  <option value="browser_gtag">Direct Browser: Headless Chromium Javascript Evaluation Only</option>
                  <option value="measurement_protocol">Measurement Protocol: Direct High-Speed API Dispatch</option>
                </select>
              </div>

            </div>

            {/* Event Emission Toggles */}
            <div className="pt-2 border-t border-slate-800/80">
              <label className="text-xs font-semibold text-slate-300 block mb-2">
                Simulated Google Analytics Events:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-900/80 border border-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.gaSendPageViews !== false}
                    onChange={(e) => onUpdate({ gaSendPageViews: e.target.checked })}
                    className="rounded border-slate-700 text-amber-500 focus:ring-amber-500"
                  />
                  <span className="font-mono text-[11px] text-slate-200">page_view</span>
                </label>

                <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-900/80 border border-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.gaSendScrollEvents !== false}
                    onChange={(e) => onUpdate({ gaSendScrollEvents: e.target.checked })}
                    className="rounded border-slate-700 text-amber-500 focus:ring-amber-500"
                  />
                  <span className="font-mono text-[11px] text-slate-200">scroll (90%)</span>
                </label>

                <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-900/80 border border-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.gaSendUserEngagement !== false}
                    onChange={(e) => onUpdate({ gaSendUserEngagement: e.target.checked })}
                    className="rounded border-slate-700 text-amber-500 focus:ring-amber-500"
                  />
                  <span className="font-mono text-[11px] text-slate-200">user_engagement</span>
                </label>

                <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-900/80 border border-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.gaSendExternalClicks === true}
                    onChange={(e) => onUpdate({ gaSendExternalClicks: e.target.checked })}
                    className="rounded border-slate-700 text-amber-500 focus:ring-amber-500"
                  />
                  <span className="font-mono text-[11px] text-slate-200">click (outbound)</span>
                </label>
              </div>
            </div>

            {/* Test Hit Button & Results */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                id="btn-test-ga4"
                disabled={isTestingGa || !config.gaMeasurementId?.trim()}
                onClick={handleTestGa4}
                className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                {isTestingGa ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-950" />
                    <span>Sending Realtime Hit to GA4...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-3.5 w-3.5 text-slate-950" />
                    <span>Send Realtime Test Hit to Google Analytics</span>
                  </>
                )}
              </button>

              <span className="text-[11px] text-slate-400">
                Target Site: <code className="text-indigo-300 font-mono">https://{targetDomain}/</code>
              </span>
            </div>

            {/* Success Feedback */}
            {testGaResult && (
              <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-xs text-emerald-200 space-y-1.5 animate-in fade-in duration-200">
                <div className="flex items-center gap-2 font-bold text-emerald-300">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Realtime Hit Successfully Dispatched!</span>
                </div>
                <p className="text-[11px] text-slate-300">
                  {testGaResult.message}
                </p>
                <div className="flex flex-wrap gap-2 text-[10px] font-mono text-emerald-400 pt-1">
                  <span className="bg-emerald-500/20 px-2 py-0.5 rounded">Client ID: {testGaResult.clientId}</span>
                  <span className="bg-emerald-500/20 px-2 py-0.5 rounded">Status: HTTP {testGaResult.dispatchStatus}</span>
                  <span className="bg-emerald-500/20 px-2 py-0.5 rounded">Events: {testGaResult.events?.join(', ')}</span>
                </div>
              </div>
            )}

            {/* Error Feedback */}
            {testGaError && (
              <div className="p-3 rounded-lg bg-red-950/40 border border-red-500/40 text-xs text-red-200 flex items-center gap-2 animate-in fade-in duration-200">
                <AlertTriangle className="h-4 w-4 text-red-400 shrink-0" />
                <span>{testGaError}</span>
              </div>
            )}

          </div>
        )}
      </div>

      {/* UTM Builder Panel */}
      <div className="my-6 p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link className="h-4 w-4 text-indigo-400" />
            <label className="text-xs font-bold text-slate-200">
              Google Analytics 4 / Custom UTM Parameter Builder
            </label>
          </div>
          <button
            type="button"
            id="toggle-utm"
            onClick={() => onUpdate({ enableUtm: !config.enableUtm })}
            className={`px-2.5 py-1 rounded text-xs font-semibold cursor-pointer ${
              config.enableUtm 
                ? 'bg-indigo-600 text-white' 
                : 'bg-slate-800 text-slate-400'
            }`}
          >
            {config.enableUtm ? 'UTM Enabled' : 'UTM Disabled'}
          </button>
        </div>

        {config.enableUtm && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {/* utm_source */}
              <div className="space-y-1">
                <label className="text-[11px] font-mono text-indigo-300">utm_source *</label>
                <input
                  id="input-utm-source"
                  type="text"
                  value={config.utmSource}
                  onChange={(e) => onUpdate({ utmSource: e.target.value })}
                  placeholder="google / newsletter"
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                />
              </div>

              {/* utm_medium */}
              <div className="space-y-1">
                <label className="text-[11px] font-mono text-indigo-300">utm_medium *</label>
                <input
                  id="input-utm-medium"
                  type="text"
                  value={config.utmMedium}
                  onChange={(e) => onUpdate({ utmMedium: e.target.value })}
                  placeholder="cpc / organic / social"
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                />
              </div>

              {/* utm_campaign */}
              <div className="space-y-1">
                <label className="text-[11px] font-mono text-indigo-300">utm_campaign *</label>
                <input
                  id="input-utm-campaign"
                  type="text"
                  value={config.utmCampaign}
                  onChange={(e) => onUpdate({ utmCampaign: e.target.value })}
                  placeholder="launch_q3_boost"
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                />
              </div>

              {/* utm_term */}
              <div className="space-y-1">
                <label className="text-[11px] font-mono text-slate-400">utm_term (opt)</label>
                <input
                  id="input-utm-term"
                  type="text"
                  value={config.utmTerm}
                  onChange={(e) => onUpdate({ utmTerm: e.target.value })}
                  placeholder="saas_analytics"
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                />
              </div>

              {/* utm_content */}
              <div className="space-y-1">
                <label className="text-[11px] font-mono text-slate-400">utm_content (opt)</label>
                <input
                  id="input-utm-content"
                  type="text"
                  value={config.utmContent}
                  onChange={(e) => onUpdate({ utmContent: e.target.value })}
                  placeholder="hero_cta_v2"
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                />
              </div>
            </div>

            {/* Generated URL Preview */}
            <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 overflow-hidden">
                <span className="text-[11px] text-slate-400 font-medium whitespace-nowrap">Preview URL:</span>
                <span className="font-mono text-xs text-indigo-300 truncate">{buildFullUrl()}</span>
              </div>
              <button
                id="btn-copy-utm-url"
                onClick={copyUrl}
                className="flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-200 font-medium shrink-0 cursor-pointer"
              >
                {copiedUrl ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                <span>{copiedUrl ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </>
        )}
      </div>

      {/* 2 Sub-Columns: Accept-Language & Custom Headers/Cookies */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Accept-Language & Headers */}
        <div className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-4 space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Languages className="h-4 w-4 text-indigo-400" />
                HTTP Accept-Language Header Override
              </label>
              <span className="text-[10px] font-mono text-emerald-400">GEO-SYNC</span>
            </div>
            <input
              id="input-accept-language"
              type="text"
              value={config.customAcceptLanguage || 'en-US,en;q=0.9,de;q=0.8'}
              onChange={(e) => onUpdate({ customAcceptLanguage: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <p className="text-[11px] text-slate-400">
              Matches target country language headers naturally for authentic localization signals.
            </p>
          </div>

          {/* Custom Headers */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <span className="text-xs font-bold text-slate-200 block">
              Custom HTTP Headers ({config.customHeaders.length})
            </span>

            <div className="flex gap-2">
              <input
                id="input-header-key"
                type="text"
                value={newHeaderKey}
                onChange={(e) => setNewHeaderKey(e.target.value)}
                placeholder="Header Name (e.g. X-Custom-Auth)"
                className="flex-1 bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <input
                id="input-header-val"
                type="text"
                value={newHeaderVal}
                onChange={(e) => setNewHeaderVal(e.target.value)}
                placeholder="Value"
                className="flex-1 bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <button
                id="btn-add-header"
                onClick={addHeader}
                className="px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
              {config.customHeaders.map((h) => (
                <div key={h.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-900/80 border border-slate-800 text-xs font-mono">
                  <span className="text-indigo-300">{h.key}: <span className="text-slate-300">{h.value}</span></span>
                  <button onClick={() => removeHeader(h.id)} className="text-slate-500 hover:text-rose-400 p-0.5 cursor-pointer">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Custom Cookie Injection */}
        <div className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-4 space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Cookie className="h-4 w-4 text-amber-400" />
                Custom HTTP Cookie Injection ({config.customCookies.length})
              </label>
              <span className="text-[10px] font-mono text-amber-300">SESSION PRELOAD</span>
            </div>

            <div className="flex gap-2">
              <input
                id="input-cookie-name"
                type="text"
                value={newCookieName}
                onChange={(e) => setNewCookieName(e.target.value)}
                placeholder="Cookie Name (e.g. session_token)"
                className="flex-1 bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
              <input
                id="input-cookie-val"
                type="text"
                value={newCookieVal}
                onChange={(e) => setNewCookieVal(e.target.value)}
                placeholder="Cookie Value"
                className="flex-1 bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
              <button
                id="btn-add-cookie"
                onClick={addCookie}
                className="px-2.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
              {config.customCookies.length === 0 ? (
                <div className="text-[11px] text-slate-500 p-2 italic">
                  No pre-injected cookies. Fresh session cookies will be initialized by Playwright workers.
                </div>
              ) : (
                config.customCookies.map((c) => (
                  <div key={c.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-900/80 border border-slate-800 text-xs font-mono">
                    <span className="text-amber-300">{c.name}=<span className="text-slate-300">{c.value}</span></span>
                    <button onClick={() => removeCookie(c.id)} className="text-slate-500 hover:text-rose-400 p-0.5 cursor-pointer">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
