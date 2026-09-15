import React from 'react';
import { 
  X, 
  Sparkles, 
  Check, 
  Search, 
  ShoppingBag, 
  Laptop, 
  Globe2, 
  ArrowRight,
  Zap
} from 'lucide-react';
import { FullCampaignConfig } from '../types/campaign';
import { HOURLY_PRESETS } from '../data/mockData';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onApplyPreset: (presetUpdates: Partial<FullCampaignConfig>) => void;
}

export const CampaignPresetsModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onApplyPreset
}) => {
  if (!isOpen) return null;

  const presets = [
    {
      id: 'preset_seo',
      name: 'Organic SEO & Keyword Authority Maximizer',
      desc: 'Optimized for high Google SERP dwell time, low bounce rate, and organic keyword search query simulation.',
      icon: Search,
      color: 'text-indigo-400 border-indigo-500/30 bg-indigo-500/10',
      badge: 'SEO OPTIMIZED',
      apply: () => {
        onApplyPreset({
          volumeBehavior: {
            visitsVolume: 25000,
            pagesPerVisit: 4,
            expectedTotalPageViews: 100000,
            bounceRatePercent: 16,
            returnRatePercent: 22,
            dwellTimeMinSeconds: 60,
            dwellTimeMaxSeconds: 180,
            randomizeDwellTime: true,
            scheduleCurvePreset: 'business_hours',
            hourlySchedule: HOURLY_PRESETS.business_hours
          },
          trafficSplitting: {
            directPercent: 15,
            organicPercent: 75,
            socialPercent: 5,
            customPercent: 5,
            searchEngines: [
              { engine: 'google', percentage: 80 },
              { engine: 'bing', percentage: 20 }
            ],
            organicKeywords: [
              { keyword: 'best cloud saas software', searchEngine: 'google', weight: 50 },
              { keyword: 'enterprise analytics platform', searchEngine: 'google', weight: 50 }
            ],
            socialNetworks: [{ network: 'linkedin', percentage: 100 }],
            customReferrers: []
          },
          deviceTargeting: {
            desktopRatioPercent: 65,
            mobileRatioPercent: 35,
            desktopOS: { windows: 60, macos: 35, linux: 5 },
            mobileOS: { ios: 60, android: 40 },
            screenResolutions: [
              { resolution: '1920x1080 (Full HD)', type: 'desktop', selected: true }
            ]
          }
        });
        onClose();
      }
    },
    {
      id: 'preset_ecom',
      name: 'E-Commerce High-Dwell & Cart Flow',
      desc: 'Simulates mobile-first shoppers exploring catalog collections, product pages, and checkout navigation.',
      icon: ShoppingBag,
      color: 'text-violet-400 border-violet-500/30 bg-violet-500/10',
      badge: 'E-COMMERCE',
      apply: () => {
        onApplyPreset({
          volumeBehavior: {
            visitsVolume: 40000,
            pagesPerVisit: 5,
            expectedTotalPageViews: 200000,
            bounceRatePercent: 20,
            returnRatePercent: 35,
            dwellTimeMinSeconds: 75,
            dwellTimeMaxSeconds: 240,
            randomizeDwellTime: true,
            scheduleCurvePreset: 'evening_peak',
            hourlySchedule: HOURLY_PRESETS.evening_peak
          },
          trafficSplitting: {
            directPercent: 20,
            organicPercent: 30,
            socialPercent: 45,
            customPercent: 5,
            searchEngines: [{ engine: 'google', percentage: 100 }],
            organicKeywords: [{ keyword: 'sustainable apparel sale', searchEngine: 'google', weight: 100 }],
            socialNetworks: [
              { network: 'instagram', percentage: 50 },
              { network: 'tiktok', percentage: 35 },
              { network: 'pinterest', percentage: 15 }
            ],
            customReferrers: []
          },
          deviceTargeting: {
            desktopRatioPercent: 22,
            mobileRatioPercent: 78,
            desktopOS: { windows: 45, macos: 50, linux: 5 },
            mobileOS: { ios: 75, android: 25 },
            screenResolutions: [
              { resolution: '390x844 (iPhone 14/15)', type: 'mobile', selected: true }
            ]
          }
        });
        onClose();
      }
    },
    {
      id: 'preset_b2b',
      name: 'B2B SaaS Launch & ProductHunt Viral Spike',
      desc: 'Recreates high desktop engagement from HackerNews, ProductHunt, Reddit, and direct executive visits.',
      icon: Laptop,
      color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
      badge: 'VIRAL LAUNCH',
      apply: () => {
        onApplyPreset({
          volumeBehavior: {
            visitsVolume: 30000,
            pagesPerVisit: 3,
            expectedTotalPageViews: 90000,
            bounceRatePercent: 22,
            returnRatePercent: 15,
            dwellTimeMinSeconds: 45,
            dwellTimeMaxSeconds: 150,
            randomizeDwellTime: true,
            scheduleCurvePreset: 'business_hours',
            hourlySchedule: HOURLY_PRESETS.business_hours
          },
          trafficSplitting: {
            directPercent: 35,
            organicPercent: 30,
            socialPercent: 15,
            customPercent: 20,
            searchEngines: [{ engine: 'google', percentage: 80 }, { engine: 'duckduckgo', percentage: 20 }],
            organicKeywords: [{ keyword: 'saas metrics dashboard', searchEngine: 'google', weight: 100 }],
            socialNetworks: [{ network: 'twitter', percentage: 50 }, { network: 'reddit', percentage: 50 }],
            customReferrers: [
              { id: 'cr_ph', url: 'https://www.producthunt.com/posts/saas-launch', weight: 60 },
              { id: 'cr_hn', url: 'https://news.ycombinator.com/', weight: 40 }
            ]
          },
          deviceTargeting: {
            desktopRatioPercent: 70,
            mobileRatioPercent: 30,
            desktopOS: { windows: 50, macos: 45, linux: 5 },
            mobileOS: { ios: 70, android: 30 },
            screenResolutions: [
              { resolution: '1920x1080 (Full HD)', type: 'desktop', selected: true }
            ]
          }
        });
        onClose();
      }
    },
    {
      id: 'preset_geo',
      name: 'Multi-Country Local SEO & Geo Surge',
      desc: 'Strictly allocated residential proxies across Tier-1 regions with localized Accept-Language and timezones.',
      icon: Globe2,
      color: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
      badge: 'GEO FOCUSED',
      apply: () => {
        onApplyPreset({
          geoProxy: {
            targetingType: 'country',
            provider: 'bright_data',
            authType: 'http_basic',
            sessionType: 'rotating',
            countryAllocations: [
              { countryCode: 'US', countryName: 'United States', flag: '🇺🇸', percentage: 40 },
              { countryCode: 'GB', countryName: 'United Kingdom', flag: '🇬🇧', percentage: 20 },
              { countryCode: 'DE', countryName: 'Germany', flag: '🇩🇪', percentage: 20 },
              { countryCode: 'CA', countryName: 'Canada', flag: '🇨🇦', percentage: 10 },
              { countryCode: 'AU', countryName: 'Australia', flag: '🇦🇺', percentage: 10 }
            ],
            customProxyHost: 'brd.superproxy.io',
            customProxyPort: 22225,
            customProxyUsername: 'lum-customer-geo-boost',
            customProxyPassword: 'token_geo_secure'
          }
        });
        onClose();
      }
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                Campaign Configuration Presets
                <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-mono">
                  ONE-CLICK RECIPES
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Load battle-tested campaign parameters tailored for SEO, E-Commerce, or Product Launches
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Presets List */}
        <div className="p-6 overflow-y-auto space-y-3">
          {presets.map((preset) => {
            const Icon = preset.icon;
            return (
              <div
                key={preset.id}
                className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2.5 rounded-xl border ${preset.color} shrink-0 mt-0.5`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-white">{preset.name}</span>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {preset.badge}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed max-w-xl">
                      {preset.desc}
                    </p>
                  </div>
                </div>

                <button
                  onClick={preset.apply}
                  className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shrink-0 transition-colors cursor-pointer"
                >
                  <span>Apply Preset</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};
