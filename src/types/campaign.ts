export type CampaignStatus = 
  | 'RUNNING'
  | 'PAUSED'
  | 'COMPLETED'
  | 'ERROR_INSUFFICIENT_CREDITS'
  | 'DRAFT';

export type UserTier = 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE' | 'CUSTOM_SCALE';

export type ProxyProviderType = 
  | 'bright_data'
  | 'oxylabs'
  | 'smartproxy'
  | 'webshare'
  | 'custom_residential';

export type SearchEngine = 
  | 'google'
  | 'bing'
  | 'yahoo'
  | 'yandex'
  | 'duckduckgo'
  | 'baidu';

export type SocialNetwork = 
  | 'facebook'
  | 'twitter'
  | 'reddit'
  | 'linkedin'
  | 'instagram'
  | 'youtube'
  | 'tiktok'
  | 'pinterest';

export type DesktopOS = 'windows' | 'macos' | 'linux';
export type MobileOS = 'android' | 'ios';

export interface HourlyScheduleCurve {
  hour: number; // 0 to 23
  weight: number; // 0 to 100 percentage multiplier
}

export interface GeoTargetAllocation {
  countryCode: string; // e.g. "US", "GB", "DE", "IN", "CA"
  countryName: string;
  flag: string;
  percentage: number; // 0 - 100
  city?: string;
}

export interface CustomReferrerEntry {
  id: string;
  url: string;
  weight: number; // weight or %
}

export interface KeywordEntry {
  keyword: string;
  searchEngine: SearchEngine;
  weight: number;
}

export interface HeaderEntry {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
}

export interface CookieEntry {
  id: string;
  name: string;
  value: string;
  domain?: string;
  path?: string;
  enabled: boolean;
}

// Module A: Overview & Stats
export interface CampaignOverview {
  id: string;
  name: string;
  targetDomain: string;
  status: CampaignStatus;
  createdAt: string;
  updatedAt: string;
  dailyLimit: number;
  totalViewsTarget: number;
  totalViewsDelivered: number;
  totalVisitsDelivered: number;
  creditsRemaining: number;
  currentActiveWorkers: number;
}

// Module B: Volume & Behavior
export interface VolumeBehaviorConfig {
  visitsVolume: number; // e.g., 20000
  pagesPerVisit: number; // 1 to 10
  expectedTotalPageViews: number; // visits * pagesPerVisit
  bounceRatePercent: number; // 0 - 100
  returnRatePercent: number; // 0 - 100
  dwellTimeMinSeconds: number; // 10 - 300
  dwellTimeMaxSeconds: number; // 10 - 300
  randomizeDwellTime: boolean;
  scheduleCurvePreset: 'even' | 'business_hours' | 'evening_peak' | 'weekend_pulse' | 'custom';
  hourlySchedule: number[]; // 24 values (index 0 = 00:00, 23 = 23:00) with weights (0-100)
}

// Module C: URL Routing & Flow Architecture
export interface UrlRoutingConfig {
  entryUrls: string[];
  innerUrls: string[];
  exitUrls: string[];
  innerPagesPerVisit: number;
  autoCrawlSitemap: boolean;
  sitemapUrl?: string;
  crawlDepth: number;
  followInternalOnly: boolean;
}

// Module D: Source & Traffic Splitting
export interface TrafficSplittingConfig {
  directPercent: number;
  organicPercent: number;
  socialPercent: number;
  customPercent: number;
  
  // Specific Organic Breakdown
  searchEngines: {
    engine: SearchEngine;
    percentage: number;
  }[];
  organicKeywords: KeywordEntry[];
  
  // Specific Social Breakdown
  socialNetworks: {
    network: SocialNetwork;
    percentage: number;
  }[];
  
  // Custom Referrers
  customReferrers: CustomReferrerEntry[];
}

// Module E: Device & OS Targeting
export interface DeviceTargetingConfig {
  mobileRatioPercent: number; // e.g. 70
  desktopRatioPercent: number; // 100 - mobile
  
  desktopOS: {
    windows: number; // %
    macos: number;
    linux: number;
  };
  
  mobileOS: {
    android: number; // %
    ios: number;
  };
  
  screenResolutions: {
    resolution: string;
    type: 'desktop' | 'mobile';
    selected: boolean;
  }[];
}

// Module F: Residential Proxy & Geo-Targeting
export interface GeoProxyConfig {
  targetingType: 'global' | 'country' | 'city';
  provider: ProxyProviderType;
  authType: 'http_basic' | 'ip_whitelist';
  sessionType: 'rotating' | 'sticky_10m' | 'sticky_30m';
  countryAllocations: GeoTargetAllocation[];
  customProxyHost?: string;
  customProxyPort?: number;
  customProxyUsername?: string;
  customProxyPassword?: string;
}

// Module G: In-Page Event & Behavioral Simulation
export interface BehavioralSimulationConfig {
  enableScrollEvents: boolean;
  scrollSessionsPercent: number; // e.g., 85%
  scrollDepthMinPercent: number; // e.g., 30%
  scrollDepthMaxPercent: number; // e.g., 95%
  scrollSpeed: 'natural_human' | 'fast_glance' | 'deep_reading';
  
  enableInternalLinkClicks: boolean;
  internalClickPercent: number; // e.g., 65%
  
  enableFormInteractions: boolean;
  formInteractionPercent: number; // e.g., 20%
  
  enableMouseJitter: boolean;
  mouseJitterIntensity: 'low' | 'medium' | 'high';
  
  adBlockBypassEmulation: boolean;
  stealthCanvasNoise: boolean;
  stealthWebGlVendorMask: boolean;
  stealthAudioContextSpoof: boolean;
}

// Module H: Advanced Tracking & Headers
export interface AdvancedTrackingConfig {
  enableUtm: boolean;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  utmTerm: string;
  utmContent: string;
  
  autoSyncAcceptLanguage: boolean;
  customAcceptLanguage?: string;
  
  customHeaders: HeaderEntry[];
  customCookies: CookieEntry[];
  
  customUserAgentOverride?: string;
  timezoneSpoofing: 'auto_by_geo' | 'manual' | 'disabled';
}

// Unified Full Campaign Configuration Model
export interface FullCampaignConfig {
  id: string;
  name: string;
  targetDomain: string;
  status: CampaignStatus;
  createdAt: string;
  updatedAt: string;
  dailyLimit: number;
  totalViewsTarget: number;
  totalViewsDelivered: number;
  totalVisitsDelivered: number;
  creditsBalance: number;
  
  volumeBehavior: VolumeBehaviorConfig;
  urlRouting: UrlRoutingConfig;
  trafficSplitting: TrafficSplittingConfig;
  deviceTargeting: DeviceTargetingConfig;
  geoProxy: GeoProxyConfig;
  behavioralSimulation: BehavioralSimulationConfig;
  advancedTracking: AdvancedTrackingConfig;
}

// Analytics and Delivery Metrics
export interface DeliveryDataPoint {
  timestamp: string;
  formattedTime: string;
  pageViews: number;
  uniqueVisits: number;
  bounces: number;
  avgDwellTime: number; // in seconds
  activeWorkers: number;
  successRate: number; // percentage
}

export interface GeoDeliveryMetric {
  countryCode: string;
  countryName: string;
  views: number;
  visits: number;
  sharePercent: number;
}

export interface DeviceDeliveryMetric {
  category: 'Desktop' | 'Mobile' | 'Tablet';
  views: number;
  sharePercent: number;
}

export interface WorkerClusterNode {
  id: string;
  name: string;
  region: string;
  status: 'ONLINE' | 'BUSY' | 'DRAINING' | 'OFFLINE';
  activeBrowsers: number;
  maxSlots: number;
  cpuLoadPercent: number;
  memoryLoadPercent: number;
  totalSessionsExecuted: number;
  proxyLatencyMs: number;
}

// Playwright Worker Execution Token
export interface PlaywrightExecutionTask {
  taskId: string;
  campaignId: string;
  targetDomain: string;
  assignedWorkerId: string;
  proxyUri: string;
  country: string;
  device: {
    type: 'desktop' | 'mobile';
    os: string;
    userAgent: string;
    viewport: { width: number; height: number };
    hasTouch: boolean;
    pixelRatio: number;
  };
  navigationFlow: {
    entryUrl: string;
    innerUrls: string[];
    exitUrl?: string;
    pagesToVisit: number;
    willBounce: boolean;
    dwellTimeSeconds: number;
  };
  behaviorSimulation: {
    shouldScroll: boolean;
    scrollDepthPercent: number;
    shouldClickInternal: boolean;
    shouldInteractForms: boolean;
    stealthNoise: boolean;
  };
  headersAndCookies: {
    referrer: string;
    acceptLanguage: string;
    utmParams: Record<string, string>;
    headers: Record<string, string>;
    cookies: { name: string; value: string; domain: string }[];
  };
}

export interface LiveSimulationEvent {
  id: string;
  timestamp: string;
  phase: 'QUEUE' | 'PROXY_INIT' | 'FINGERPRINT' | 'NAVIGATE' | 'INTERACT' | 'INNER_HOP' | 'COMPLETED' | 'ERROR';
  message: string;
  meta?: Record<string, unknown>;
  level: 'info' | 'success' | 'warn' | 'error';
}
