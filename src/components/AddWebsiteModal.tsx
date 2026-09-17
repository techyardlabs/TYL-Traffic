import React, { useState } from 'react';
import {
  X,
  Globe,
  Plus,
  Zap,
  Sliders,
  PieChart,
  Globe2,
  Laptop,
  MousePointer,
  CheckCircle2,
  Sparkles,
  Search,
  Share2,
  ArrowRight,
  ShieldCheck,
  Play,
  FileText,
  BarChart2
} from 'lucide-react';
import { FullCampaignConfig, CampaignStatus, SearchEngine, SocialNetwork } from '../types/campaign';
import { HOURLY_PRESETS } from '../data/mockData';

interface AddWebsiteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddWebsite: (newCampaign: FullCampaignConfig, startImmediately: boolean) => void;
}

export const AddWebsiteModal: React.FC<AddWebsiteModalProps> = ({
  isOpen,
  onClose,
  onAddWebsite
}) => {
  if (!isOpen) return null;

  // Form State
  const [urlInput, setUrlInput] = useState('');
  const [siteName, setSiteName] = useState('');
  const [gaMeasurementId, setGaMeasurementId] = useState('');
  const [status, setStatus] = useState<CampaignStatus>('RUNNING');
  
  // Volume Rules
  const [dailyVisits, setDailyVisits] = useState(10000);
  const [pagesPerVisit, setPagesPerVisit] = useState(3);
  const [bounceRate, setBounceRate] = useState(25);
  const [dwellMin, setDwellMin] = useState(40);
  const [dwellMax, setDwellMax] = useState(120);

  // Traffic Source Rules (Summing to 100)
  const [organicPercent, setOrganicPercent] = useState(45);
  const [directPercent, setDirectPercent] = useState(30);
  const [socialPercent, setSocialPercent] = useState(15);
  const [referralPercent, setReferralPercent] = useState(10);
  const [keywordsText, setKeywordsText] = useState('buy online, best reviews, official site, services');

  // Geo Rules
  const [geoPreset, setGeoPreset] = useState<'US_ONLY' | 'TIER1' | 'EUROPE' | 'GLOBAL'>('TIER1');
  const [proxyProvider, setProxyProvider] = useState<'bright_data' | 'oxylabs' | 'smartproxy' | 'custom_residential'>('bright_data');

  // Device Rules
  const [mobilePercent, setMobilePercent] = useState(65);

  // Tab active
  const [activeTab, setActiveTab] = useState<'basics' | 'sources' | 'geo' | 'behavior'>('basics');

  // Auto clean domain
  const cleanDomain = (rawUrl: string) => {
    let cleaned = rawUrl.trim().toLowerCase();
    cleaned = cleaned.replace(/^https?:\/\//, '');
    cleaned = cleaned.replace(/\/.*$/, '');
    cleaned = cleaned.replace(/^www\./, '');
    return cleaned;
  };

  const handleUrlChange = (val: string) => {
    setUrlInput(val);
    const domain = cleanDomain(val);
    if (domain && (!siteName || siteName === 'New Website')) {
      const parts = domain.split('.');
      const capitalized = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
      setSiteName(`${capitalized} Traffic`);
    }
  };

  const calculateTotalPercent = () => {
    return organicPercent + directPercent + socialPercent + referralPercent;
  };

  const handleSubmit = (startImmediately: boolean) => {
    const domain = cleanDomain(urlInput) || 'my-website.com';
    const finalName = siteName.trim() || `${domain} Traffic`;
    const newId = `site_${Math.random().toString(36).substring(2, 9)}`;

    // Build Geo Allocations based on preset
    let countryAllocations = [
      { countryCode: 'US', countryName: 'United States', flag: '🇺🇸', percentage: 60 },
      { countryCode: 'GB', countryName: 'United Kingdom', flag: '🇬🇧', percentage: 20 },
      { countryCode: 'CA', countryName: 'Canada', flag: '🇨🇦', percentage: 10 },
      { countryCode: 'DE', countryName: 'Germany', flag: '🇩🇪', percentage: 10 }
    ];

    if (geoPreset === 'US_ONLY') {
      countryAllocations = [
        { countryCode: 'US', countryName: 'United States', flag: '🇺🇸', percentage: 100 }
      ];
    } else if (geoPreset === 'EUROPE') {
      countryAllocations = [
        { countryCode: 'DE', countryName: 'Germany', flag: '🇩🇪', percentage: 35 },
        { countryCode: 'GB', countryName: 'United Kingdom', flag: '🇬🇧', percentage: 35 },
        { countryCode: 'FR', countryName: 'France', flag: '🇫🇷', percentage: 20 },
        { countryCode: 'NL', countryName: 'Netherlands', flag: '🇳🇱', percentage: 10 }
      ];
    } else if (geoPreset === 'GLOBAL') {
      countryAllocations = [
        { countryCode: 'US', countryName: 'United States', flag: '🇺🇸', percentage: 40 },
        { countryCode: 'GB', countryName: 'United Kingdom', flag: '🇬🇧', percentage: 20 },
        { countryCode: 'IN', countryName: 'India', flag: '🇮🇳', percentage: 15 },
        { countryCode: 'DE', countryName: 'Germany', flag: '🇩🇪', percentage: 15 },
        { countryCode: 'BR', countryName: 'Brazil', flag: '🇧🇷', percentage: 10 }
      ];
    }

    // Build Keywords
    const keywordList = keywordsText
      .split(/[\n,]+/)
      .map(k => k.trim())
      .filter(Boolean)
      .map((k, idx) => ({
        keyword: k,
        searchEngine: (idx % 2 === 0 ? 'google' : 'bing') as SearchEngine,
        weight: 80 - (idx * 5)
      }));

    if (keywordList.length === 0) {
      keywordList.push({ keyword: `${domain} official`, searchEngine: 'google', weight: 100 });
    }

    const fullUrl = urlInput.startsWith('http') ? urlInput.trim() : `https://${domain}`;

    const newConfig: FullCampaignConfig = {
      id: newId,
      projectCode: `WT${Math.floor(10000000 + Math.random() * 90000000).toString(36).toUpperCase()}`,
      projectType: 'Economy',
      name: finalName,
      targetDomain: domain,
      status: startImmediately ? 'RUNNING' : 'DRAFT',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      dailyLimit: dailyVisits,
      totalViewsTarget: dailyVisits * pagesPerVisit * 7, // 1 week default target
      totalViewsDelivered: 0,
      totalVisitsDelivered: 0,
      creditsBalance: 50000,

      volumeBehavior: {
        visitsVolume: dailyVisits,
        pagesPerVisit: pagesPerVisit,
        expectedTotalPageViews: dailyVisits * pagesPerVisit,
        bounceRatePercent: bounceRate,
        returnRatePercent: 15,
        dwellTimeMinSeconds: dwellMin,
        dwellTimeMaxSeconds: dwellMax,
        randomizeDwellTime: true,
        scheduleCurvePreset: 'business_hours',
        hourlySchedule: HOURLY_PRESETS.business_hours
      },

      urlRouting: {
        entryUrls: [
          fullUrl,
          `${fullUrl.replace(/\/$/, '')}/about`,
          `${fullUrl.replace(/\/$/, '')}/features`,
          `${fullUrl.replace(/\/$/, '')}/blog`
        ],
        innerUrls: [
          `${fullUrl.replace(/\/$/, '')}/pricing`,
          `${fullUrl.replace(/\/$/, '')}/docs`,
          `${fullUrl.replace(/\/$/, '')}/contact`
        ],
        exitUrls: [
          `${fullUrl.replace(/\/$/, '')}/contact`,
          `${fullUrl.replace(/\/$/, '')}/checkout`
        ],
        innerPagesPerVisit: pagesPerVisit,
        autoCrawlSitemap: true,
        crawlDepth: 2,
        followInternalOnly: true
      },

      trafficSplitting: {
        directPercent: directPercent,
        organicPercent: organicPercent,
        socialPercent: socialPercent,
        customPercent: referralPercent,
        searchEngines: [
          { engine: 'google', percentage: 70 },
          { engine: 'bing', percentage: 20 },
          { engine: 'yahoo', percentage: 10 }
        ],
        organicKeywords: keywordList,
        socialNetworks: [
          { network: 'reddit', percentage: 35 },
          { network: 'twitter', percentage: 30 },
          { network: 'facebook', percentage: 20 },
          { network: 'linkedin', percentage: 15 }
        ],
        customReferrers: [
          { id: 'ref_1', url: 'https://news.ycombinator.com', weight: 40 },
          { id: 'ref_2', url: 'https://medium.com', weight: 35 },
          { id: 'ref_3', url: 'https://quora.com', weight: 25 }
        ]
      },

      deviceTargeting: {
        mobileRatioPercent: mobilePercent,
        desktopRatioPercent: 100 - mobilePercent,
        desktopOS: { windows: 65, macos: 30, linux: 5 },
        mobileOS: { android: 60, ios: 40 },
        screenResolutions: [
          { resolution: '1920x1080', type: 'desktop', selected: true },
          { resolution: '390x844', type: 'mobile', selected: true },
          { resolution: '412x915', type: 'mobile', selected: true },
          { resolution: '2560x1440', type: 'desktop', selected: true }
        ]
      },

      geoProxy: {
        targetingType: 'country',
        provider: proxyProvider,
        authType: 'http_basic',
        sessionType: 'rotating',
        countryAllocations: countryAllocations
      },

      behavioralSimulation: {
        enableScrollEvents: true,
        scrollSessionsPercent: 88,
        scrollDepthMinPercent: 35,
        scrollDepthMaxPercent: 92,
        scrollSpeed: 'natural_human',
        enableInternalLinkClicks: true,
        internalClickPercent: 75,
        enableFormInteractions: false,
        formInteractionPercent: 15,
        enableMouseJitter: true,
        mouseJitterIntensity: 'medium',
        adBlockBypassEmulation: true,
        stealthCanvasNoise: true,
        stealthWebGlVendorMask: true,
        stealthAudioContextSpoof: true
      },

      advancedTracking: {
        enableUtm: true,
        utmSource: 'tyl_network',
        utmMedium: 'organic_cpc',
        utmCampaign: 'traffic_boost',
        utmTerm: keywordList[0]?.keyword || 'official',
        utmContent: 'hero_cta',
        autoSyncAcceptLanguage: true,
        customHeaders: [
          { id: 'h_1', key: 'DNT', value: '1', enabled: true },
          { id: 'h_2', key: 'Upgrade-Insecure-Requests', value: '1', enabled: true }
        ],
        customCookies: [],
        timezoneSpoofing: 'auto_by_geo',
        enableGoogleAnalytics: !!gaMeasurementId.trim(),
        gaMeasurementId: gaMeasurementId.trim().toUpperCase() || undefined,
        gaDispatchMode: 'hybrid',
        gaSendPageViews: true,
        gaSendScrollEvents: true,
        gaSendUserEngagement: true,
        gaSendFormEvents: false,
        gaSendExternalClicks: true,
        gaSessionDwellSeconds: Math.round((dwellMin + dwellMax) / 2)
      }
    };

    onAddWebsite(newConfig, startImmediately);
    onClose();
  };

  const totalSplit = calculateTotalPercent();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/30">
              <Globe className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Add Website for Traffic</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Custom Rules
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Configure isolated traffic volume, sources, and proxy rules for this specific domain.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-6 pt-3 border-b border-slate-800/80 bg-slate-900/40 text-xs font-semibold overflow-x-auto">
          <button
            onClick={() => setActiveTab('basics')}
            className={`pb-2.5 px-3 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'basics'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Globe className="h-3.5 w-3.5" />
            <span>1. Website &amp; Volume</span>
          </button>
          <button
            onClick={() => setActiveTab('sources')}
            className={`pb-2.5 px-3 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'sources'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <PieChart className="h-3.5 w-3.5" />
            <span>2. Traffic Sources &amp; Keywords</span>
          </button>
          <button
            onClick={() => setActiveTab('geo')}
            className={`pb-2.5 px-3 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'geo'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Globe2 className="h-3.5 w-3.5" />
            <span>3. Geo &amp; Proxies</span>
          </button>
          <button
            onClick={() => setActiveTab('behavior')}
            className={`pb-2.5 px-3 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'behavior'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <MousePointer className="h-3.5 w-3.5" />
            <span>4. Behavior &amp; Device</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[68vh] overflow-y-auto">
          
          {/* TAB 1: Basics & Volume */}
          {activeTab === 'basics' && (
            <div className="space-y-5">
              
              {/* Target Domain Input */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between">
                  <span>Target Website URL or Domain *</span>
                  {urlInput && (
                    <span className="text-indigo-400 font-mono lowercase text-[11px]">
                      Target Root: {cleanDomain(urlInput)}
                    </span>
                  )}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Globe className="h-4 w-4" />
                  </div>
                  <input
                    id="input-new-website-url"
                    type="text"
                    required
                    value={urlInput}
                    onChange={(e) => handleUrlChange(e.target.value)}
                    placeholder="https://example.com or clientstore.org"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white font-mono placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <p className="text-[11px] text-slate-400">
                  Enter your website address. The system will automatically build entry landing paths and internal page flows for this domain.
                </p>
              </div>

              {/* Site Name / Label */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Website Label / Campaign Name
                </label>
                <input
                  id="input-new-website-name"
                  type="text"
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  placeholder="e.g. My E-commerce Store (USA Boost)"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Google Analytics 4 Measurement ID */}
              <div className="space-y-2 p-4 rounded-xl bg-amber-950/20 border border-amber-500/30">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-white flex items-center gap-1.5">
                    <BarChart2 className="h-4 w-4 text-amber-400" />
                    <span>Google Analytics 4 Measurement ID</span>
                    <span className="text-[10px] text-amber-400/80 font-normal font-mono">(Optional)</span>
                  </label>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold uppercase tracking-wider">
                    Better Traffic Results
                  </span>
                </div>
                <div className="relative">
                  <input
                    id="input-new-website-ga-id"
                    type="text"
                    value={gaMeasurementId}
                    onChange={(e) => setGaMeasurementId(e.target.value.toUpperCase())}
                    placeholder="G-XXXXXXXXXX (e.g. G-K8X9Y1Z2AB)"
                    className="w-full bg-slate-950 border border-amber-500/40 rounded-xl px-3.5 py-2.5 text-xs text-amber-200 font-mono tracking-wider placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  {gaMeasurementId && gaMeasurementId.startsWith('G-') && (
                    <span className="absolute right-3 top-2.5 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                      GA4
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400">
                  Injects native Google Analytics telemetry (<code className="text-amber-300">page_view</code>, <code className="text-amber-300">user_engagement</code>, and <code className="text-amber-300">scroll</code> events) directly into simulation workers to ensure 100% of visits reflect in your GA4 Realtime overview.
                </p>
              </div>

              {/* Daily Traffic Volume */}
              <div className="space-y-3 p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Zap className="h-3.5 w-3.5 text-amber-400" />
                      <span>Daily Traffic Delivery Goal</span>
                    </div>
                    <p className="text-[11px] text-slate-400">How many daily visits should this site receive?</p>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-extrabold text-indigo-400 font-mono">
                      {dailyVisits.toLocaleString()}
                    </span>
                    <span className="text-xs text-slate-400 ml-1">visits/day</span>
                  </div>
                </div>

                {/* Preset pills */}
                <div className="grid grid-cols-5 gap-2">
                  {[2000, 5000, 10000, 25000, 50000].map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setDailyVisits(v)}
                      className={`py-1.5 px-2 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer ${
                        dailyVisits === v
                          ? 'bg-indigo-600 text-white shadow-md'
                          : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                      }`}
                    >
                      {v >= 1000 ? `${v / 1000}k` : v}
                    </button>
                  ))}
                </div>

                <input
                  type="range"
                  min="1000"
                  max="100000"
                  step="1000"
                  value={dailyVisits}
                  onChange={(e) => setDailyVisits(parseInt(e.target.value, 10))}
                  className="w-full accent-indigo-500"
                />
              </div>

              {/* Pages per visit & Session Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-300">Pages Per Visit (Inner Clicks)</span>
                    <span className="font-mono text-indigo-400 font-bold">{pagesPerVisit} Pages</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="6"
                    value={pagesPerVisit}
                    onChange={(e) => setPagesPerVisit(parseInt(e.target.value, 10))}
                    className="w-full accent-indigo-500"
                  />
                  <div className="text-[10px] text-slate-400">
                    Results in ~{(dailyVisits * pagesPerVisit).toLocaleString()} total pageviews/day.
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-300">Dwell Time (Stay on site)</span>
                    <span className="font-mono text-emerald-400 font-bold">{dwellMin}s - {dwellMax}s</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[10px] text-slate-400">Min (sec)</span>
                      <input
                        type="number"
                        min="10"
                        max="300"
                        value={dwellMin}
                        onChange={(e) => setDwellMin(Math.max(10, parseInt(e.target.value, 10) || 10))}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400">Max (sec)</span>
                      <input
                        type="number"
                        min="20"
                        max="600"
                        value={dwellMax}
                        onChange={(e) => setDwellMax(Math.max(dwellMin + 5, parseInt(e.target.value, 10) || 30))}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white"
                      />
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: Traffic Sources & Splitting */}
          {activeTab === 'sources' && (
            <div className="space-y-5">
              <div className="p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-500/20 text-xs text-indigo-300 flex items-center justify-between">
                <span>Configure where visitors come from for this website. Total must equal 100%.</span>
                <span className={`font-mono font-bold px-2 py-0.5 rounded ${totalSplit === 100 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}`}>
                  Total: {totalSplit}%
                </span>
              </div>

              {/* Source Sliders */}
              <div className="space-y-4">
                
                {/* Organic Search */}
                <div className="space-y-1.5 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <Search className="h-3.5 w-3.5 text-blue-400" />
                      <span>Organic Search (Google, Bing, Yahoo)</span>
                    </span>
                    <span className="font-mono text-blue-400 font-bold">{organicPercent}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={organicPercent}
                    onChange={(e) => setOrganicPercent(parseInt(e.target.value, 10))}
                    className="w-full accent-blue-500"
                  />
                  <p className="text-[11px] text-slate-400">Simulates user typing keywords into search engines and clicking your organic result.</p>
                </div>

                {/* Direct Traffic */}
                <div className="space-y-1.5 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <Globe className="h-3.5 w-3.5 text-emerald-400" />
                      <span>Direct Traffic (Bookmarks, Typed URL)</span>
                    </span>
                    <span className="font-mono text-emerald-400 font-bold">{directPercent}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={directPercent}
                    onChange={(e) => setDirectPercent(parseInt(e.target.value, 10))}
                    className="w-full accent-emerald-500"
                  />
                </div>

                {/* Social Networks */}
                <div className="space-y-1.5 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <Share2 className="h-3.5 w-3.5 text-indigo-400" />
                      <span>Social Media (Reddit, Twitter/X, Facebook, LinkedIn)</span>
                    </span>
                    <span className="font-mono text-indigo-400 font-bold">{socialPercent}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={socialPercent}
                    onChange={(e) => setSocialPercent(parseInt(e.target.value, 10))}
                    className="w-full accent-indigo-500"
                  />
                </div>

                {/* Referral Links */}
                <div className="space-y-1.5 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <FileText className="h-3.5 w-3.5 text-amber-400" />
                      <span>Referral / Backlinks</span>
                    </span>
                    <span className="font-mono text-amber-400 font-bold">{referralPercent}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={referralPercent}
                    onChange={(e) => setReferralPercent(parseInt(e.target.value, 10))}
                    className="w-full accent-amber-500"
                  />
                </div>

              </div>

              {/* Target Organic Keywords */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between">
                  <span>Target Organic Search Keywords</span>
                  <span className="text-slate-500 text-[10px]">Comma-separated</span>
                </label>
                <textarea
                  rows={2}
                  value={keywordsText}
                  onChange={(e) => setKeywordsText(e.target.value)}
                  placeholder="e.g. buy gadgets online, best price 2026, tech review"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-200 font-mono placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <p className="text-[11px] text-slate-400">
                  Headless workers will populate referrer search query parameters and Google SERP click emulation with these keywords.
                </p>
              </div>

            </div>
          )}

          {/* TAB 3: Geo-Targeting & Residential Proxies */}
          {activeTab === 'geo' && (
            <div className="space-y-5">
              
              {/* Geographic Preset Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Target Country Geo Distribution
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { id: 'TIER1', label: 'Tier-1 Western', desc: '🇺🇸 US, 🇬🇧 UK, 🇨🇦 CA, 🇩🇪 DE' },
                    { id: 'US_ONLY', label: '100% United States', desc: '🇺🇸 All 50 US States' },
                    { id: 'EUROPE', label: 'Europe Mix', desc: '🇩🇪 DE, 🇬🇧 UK, 🇫🇷 FR, 🇳🇱 NL' },
                    { id: 'GLOBAL', label: 'Worldwide / Global', desc: '🇺🇸, 🇬🇧, 🇮🇳, 🇩🇪, 🇧🇷' }
                  ].map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setGeoPreset(preset.id as any)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        geoPreset === preset.id
                          ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-md'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                      }`}
                    >
                      <div className="text-xs font-bold text-white">{preset.label}</div>
                      <div className="text-[11px] text-slate-400 mt-1 font-mono">{preset.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Proxy Network Infrastructure */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  <span>Residential Proxy Network</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'bright_data', label: 'Bright Data (Luminati)', sub: '72M+ Residential Pool' },
                    { id: 'oxylabs', label: 'Oxylabs Residential', sub: '100M+ Real Peer IPs' },
                    { id: 'smartproxy', label: 'Smartproxy City-Level', sub: 'Low Latency Residential' },
                    { id: 'custom_residential', label: 'Hostinger / Local Node', sub: 'Direct Connection' }
                  ].map((prov) => (
                    <button
                      key={prov.id}
                      type="button"
                      onClick={() => setProxyProvider(prov.id as any)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        proxyProvider === prov.id
                          ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="text-xs font-bold text-white">{prov.label}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{prov.sub}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* IP Rotation Mode */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white">Rotating Sticky Session (Recommended)</div>
                  <div className="text-[11px] text-slate-400">Each visitor keeps their assigned IP across all inner page views, then rotates.</div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold">
                  Enabled
                </span>
              </div>

            </div>
          )}

          {/* TAB 4: Behavior & Devices */}
          {activeTab === 'behavior' && (
            <div className="space-y-5">
              
              {/* Device Targeting */}
              <div className="space-y-3 p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="flex justify-between items-center">
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Laptop className="h-3.5 w-3.5 text-indigo-400" />
                    <span>Device Ratio (Mobile vs Desktop)</span>
                  </div>
                  <div className="text-xs font-mono text-slate-300">
                    <span className="text-indigo-400 font-bold">{mobilePercent}% Mobile</span>
                    <span className="mx-1 text-slate-600">/</span>
                    <span className="text-emerald-400 font-bold">{100 - mobilePercent}% Desktop</span>
                  </div>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={mobilePercent}
                  onChange={(e) => setMobilePercent(parseInt(e.target.value, 10))}
                  className="w-full accent-indigo-500"
                />
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>100% Desktop</span>
                  <span>50 / 50</span>
                  <span>100% Mobile</span>
                </div>
              </div>

              {/* Behavioral Automation Checklist */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Human-Emulation Engine
                </label>
                <div className="space-y-2">
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-white">Natural Smooth Page Scrolling</div>
                      <div className="text-[11px] text-slate-400">Emulates human scroll wheel and finger swipes from 30% to 90% scroll depth.</div>
                    </div>
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-white">In-Page Internal Navigation</div>
                      <div className="text-[11px] text-slate-400">Headless browser discovers links on page and clicks naturally like a real buyer.</div>
                    </div>
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-white">Anti-Bot &amp; Canvas Noise Stealth</div>
                      <div className="text-[11px] text-slate-400">Masks WebGL, AudioContext, and Headless Chrome flags to pass Cloudflare &amp; GA4 cleanly.</div>
                    </div>
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span>Rules will be saved independently for this website.</span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer w-1/2 sm:w-auto"
            >
              Cancel
            </button>
            <button
              id="btn-save-website-draft"
              type="button"
              onClick={() => handleSubmit(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors cursor-pointer w-1/2 sm:w-auto"
            >
              Save as Draft
            </button>
            <button
              id="btn-save-website-run"
              type="button"
              onClick={() => handleSubmit(true)}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-1.5 transition-all cursor-pointer w-full sm:w-auto"
            >
              <Play className="h-3.5 w-3.5 fill-current" />
              <span>Add &amp; Start Traffic</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
