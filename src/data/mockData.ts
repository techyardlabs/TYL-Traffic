import { FullCampaignConfig, WorkerClusterNode, DeliveryDataPoint, GeoDeliveryMetric } from '../types/campaign';

export const HOURLY_PRESETS: Record<string, number[]> = {
  even: Array(24).fill(75),
  business_hours: [
    15, 10, 8, 5, 8, 15, 35, 60, 85, 95, 100, 92, 88, 94, 98, 90, 78, 65, 50, 42, 35, 28, 22, 18
  ],
  evening_peak: [
    20, 15, 10, 8, 12, 20, 30, 45, 55, 60, 65, 70, 72, 75, 80, 85, 92, 98, 100, 95, 88, 70, 50, 30
  ],
  weekend_pulse: [
    30, 22, 15, 12, 18, 25, 40, 55, 70, 82, 90, 95, 100, 98, 92, 88, 90, 94, 96, 88, 75, 60, 45, 35
  ]
};

export const INITIAL_CAMPAIGNS: FullCampaignConfig[] = [
  {
    id: 'cmp_984f2b1a',
    name: 'SaaS App Launch & Keyword Authority Booster',
    targetDomain: 'saasmetrics-cloud.io',
    status: 'RUNNING',
    createdAt: '2026-08-20T10:15:00Z',
    updatedAt: '2026-08-29T03:30:00Z',
    dailyLimit: 12000,
    totalViewsTarget: 60000,
    totalViewsDelivered: 41850,
    totalVisitsDelivered: 14220,
    creditsBalance: 84500,
    
    volumeBehavior: {
      visitsVolume: 20000,
      pagesPerVisit: 3,
      expectedTotalPageViews: 60000,
      bounceRatePercent: 24,
      returnRatePercent: 18,
      dwellTimeMinSeconds: 45,
      dwellTimeMaxSeconds: 150,
      randomizeDwellTime: true,
      scheduleCurvePreset: 'business_hours',
      hourlySchedule: HOURLY_PRESETS.business_hours
    },
    
    urlRouting: {
      entryUrls: [
        'https://saasmetrics-cloud.io/',
        'https://saasmetrics-cloud.io/features/analytics-engine',
        'https://saasmetrics-cloud.io/pricing',
        'https://saasmetrics-cloud.io/blog/b2b-growth-playbook'
      ],
      innerUrls: [
        'https://saasmetrics-cloud.io/integrations/stripe',
        'https://saasmetrics-cloud.io/docs/quickstart',
        'https://saasmetrics-cloud.io/case-studies/fintech-scale',
        'https://saasmetrics-cloud.io/security/compliance-soc2'
      ],
      exitUrls: [
        'https://saasmetrics-cloud.io/signup?plan=pro',
        'https://saasmetrics-cloud.io/contact-sales'
      ],
      innerPagesPerVisit: 3,
      autoCrawlSitemap: true,
      sitemapUrl: 'https://saasmetrics-cloud.io/sitemap.xml',
      crawlDepth: 2,
      followInternalOnly: true
    },
    
    trafficSplitting: {
      directPercent: 25,
      organicPercent: 50,
      socialPercent: 15,
      customPercent: 10,
      
      searchEngines: [
        { engine: 'google', percentage: 70 },
        { engine: 'bing', percentage: 15 },
        { engine: 'duckduckgo', percentage: 10 },
        { engine: 'yahoo', percentage: 5 }
      ],
      organicKeywords: [
        { keyword: 'b2b saas metrics dashboard', searchEngine: 'google', weight: 40 },
        { keyword: 'stripe analytics tool alternative', searchEngine: 'google', weight: 30 },
        { keyword: 'churn prediction ai software', searchEngine: 'bing', weight: 15 },
        { keyword: 'mrr tracking platform', searchEngine: 'duckduckgo', weight: 15 }
      ],
      
      socialNetworks: [
        { network: 'twitter', percentage: 40 },
        { network: 'linkedin', percentage: 35 },
        { network: 'reddit', percentage: 20 },
        { network: 'youtube', percentage: 5 }
      ],
      
      customReferrers: [
        { id: 'cr_1', url: 'https://news.ycombinator.com/item?id=389104', weight: 50 },
        { id: 'cr_2', url: 'https://www.producthunt.com/products/saasmetrics', weight: 35 },
        { id: 'cr_3', url: 'https://medium.com/better-programming/top-growth-tools', weight: 15 }
      ]
    },
    
    deviceTargeting: {
      mobileRatioPercent: 40,
      desktopRatioPercent: 60,
      
      desktopOS: {
        windows: 55,
        macos: 38,
        linux: 7
      },
      
      mobileOS: {
        ios: 65,
        android: 35
      },
      
      screenResolutions: [
        { resolution: '1920x1080 (Full HD)', type: 'desktop', selected: true },
        { resolution: '2560x1440 (2K QHD)', type: 'desktop', selected: true },
        { resolution: '1440x900 (MacBook Air)', type: 'desktop', selected: true },
        { resolution: '390x844 (iPhone 14/15)', type: 'mobile', selected: true },
        { resolution: '412x915 (Samsung S23/S24)', type: 'mobile', selected: true }
      ]
    },
    
    geoProxy: {
      targetingType: 'country',
      provider: 'bright_data',
      authType: 'http_basic',
      sessionType: 'rotating',
      countryAllocations: [
        { countryCode: 'US', countryName: 'United States', flag: '🇺🇸', percentage: 45 },
        { countryCode: 'GB', countryName: 'United Kingdom', flag: '🇬🇧', percentage: 20 },
        { countryCode: 'DE', countryName: 'Germany', flag: '🇩🇪', percentage: 15 },
        { countryCode: 'IN', countryName: 'India', flag: '🇮🇳', percentage: 10 },
        { countryCode: 'CA', countryName: 'Canada', flag: '🇨🇦', percentage: 10 }
      ],
      customProxyHost: 'brd.superproxy.io',
      customProxyPort: 22225,
      customProxyUsername: 'lum-customer-c_sparktraffic-zone-residential',
      customProxyPassword: 'secret_proxy_token_live'
    },
    
    behavioralSimulation: {
      enableScrollEvents: true,
      scrollSessionsPercent: 88,
      scrollDepthMinPercent: 35,
      scrollDepthMaxPercent: 92,
      scrollSpeed: 'natural_human',
      
      enableInternalLinkClicks: true,
      internalClickPercent: 72,
      
      enableFormInteractions: true,
      formInteractionPercent: 28,
      
      enableMouseJitter: true,
      mouseJitterIntensity: 'medium',
      
      adBlockBypassEmulation: true,
      stealthCanvasNoise: true,
      stealthWebGlVendorMask: true,
      stealthAudioContextSpoof: true
    },
    
    advancedTracking: {
      enableUtm: true,
      utmSource: 'google_organic_spark',
      utmMedium: 'organic_search',
      utmCampaign: 'launch_q3_authority',
      utmTerm: 'saas_analytics',
      utmContent: 'hero_cta_v2',
      
      autoSyncAcceptLanguage: true,
      customAcceptLanguage: 'en-US,en;q=0.9,de;q=0.8',
      
      customHeaders: [
        { id: 'h_1', key: 'Sec-CH-UA-Platform', value: '"macOS"', enabled: true },
        { id: 'h_2', key: 'DNT', value: '0', enabled: true },
        { id: 'h_3', key: 'Upgrade-Insecure-Requests', value: '1', enabled: true }
      ],
      
      customCookies: [
        { id: 'c_1', name: '_ga_session_seed', value: 'GA1.1.189283401.1712891', domain: 'saasmetrics-cloud.io', path: '/', enabled: true },
        { id: 'c_2', name: 'user_consent_granted', value: 'true', domain: 'saasmetrics-cloud.io', path: '/', enabled: true }
      ],
      
      timezoneSpoofing: 'auto_by_geo'
    }
  },
  
  {
    id: 'cmp_e520119c',
    name: 'E-Commerce Black Friday Dwell & Cart Flow',
    targetDomain: 'nordicapparel-store.com',
    status: 'RUNNING',
    createdAt: '2026-08-22T14:00:00Z',
    updatedAt: '2026-08-29T02:10:00Z',
    dailyLimit: 25000,
    totalViewsTarget: 100000,
    totalViewsDelivered: 78120,
    totalVisitsDelivered: 22400,
    creditsBalance: 42000,
    
    volumeBehavior: {
      visitsVolume: 35000,
      pagesPerVisit: 4,
      expectedTotalPageViews: 140000,
      bounceRatePercent: 18,
      returnRatePercent: 32,
      dwellTimeMinSeconds: 60,
      dwellTimeMaxSeconds: 240,
      randomizeDwellTime: true,
      scheduleCurvePreset: 'evening_peak',
      hourlySchedule: HOURLY_PRESETS.evening_peak
    },
    
    urlRouting: {
      entryUrls: [
        'https://nordicapparel-store.com/',
        'https://nordicapparel-store.com/collections/winter-jackets',
        'https://nordicapparel-store.com/collections/wool-sweaters'
      ],
      innerUrls: [
        'https://nordicapparel-store.com/products/arctic-expedition-parka-navy',
        'https://nordicapparel-store.com/products/merino-knit-crewneck-charcoal',
        'https://nordicapparel-store.com/cart',
        'https://nordicapparel-store.com/pages/sizing-guide'
      ],
      exitUrls: [
        'https://nordicapparel-store.com/checkout/start'
      ],
      innerPagesPerVisit: 4,
      autoCrawlSitemap: false,
      crawlDepth: 3,
      followInternalOnly: true
    },
    
    trafficSplitting: {
      directPercent: 20,
      organicPercent: 30,
      socialPercent: 40,
      customPercent: 10,
      searchEngines: [
        { engine: 'google', percentage: 80 },
        { engine: 'bing', percentage: 20 }
      ],
      organicKeywords: [
        { keyword: 'sustainable nordic winter coats', searchEngine: 'google', weight: 60 },
        { keyword: 'merino wool sweaters men', searchEngine: 'google', weight: 40 }
      ],
      socialNetworks: [
        { network: 'instagram', percentage: 45 },
        { network: 'tiktok', percentage: 30 },
        { network: 'pinterest', percentage: 25 }
      ],
      customReferrers: [
        { id: 'cr_4', url: 'https://www.gq.com/story/best-winter-jackets-roundup', weight: 70 },
        { id: 'cr_5', url: 'https://styleforum.net/threads/nordic-apparel-review', weight: 30 }
      ]
    },
    
    deviceTargeting: {
      mobileRatioPercent: 78,
      desktopRatioPercent: 22,
      desktopOS: { windows: 40, macos: 55, linux: 5 },
      mobileOS: { ios: 75, android: 25 },
      screenResolutions: [
        { resolution: '390x844 (iPhone 14/15)', type: 'mobile', selected: true },
        { resolution: '430x932 (iPhone Pro Max)', type: 'mobile', selected: true },
        { resolution: '1920x1080 (Full HD)', type: 'desktop', selected: true }
      ]
    },
    
    geoProxy: {
      targetingType: 'country',
      provider: 'oxylabs',
      authType: 'http_basic',
      sessionType: 'sticky_10m',
      countryAllocations: [
        { countryCode: 'US', countryName: 'United States', flag: '🇺🇸', percentage: 40 },
        { countryCode: 'GB', countryName: 'United Kingdom', flag: '🇬🇧', percentage: 25 },
        { countryCode: 'DE', countryName: 'Germany', flag: '🇩🇪', percentage: 20 },
        { countryCode: 'FR', countryName: 'France', flag: '🇫🇷', percentage: 15 }
      ],
      customProxyHost: 'pr.oxylabs.io',
      customProxyPort: 7777,
      customProxyUsername: 'customer-oxylabs-res-nordic',
      customProxyPassword: 'auth_oxy_secure_key'
    },
    
    behavioralSimulation: {
      enableScrollEvents: true,
      scrollSessionsPercent: 95,
      scrollDepthMinPercent: 50,
      scrollDepthMaxPercent: 98,
      scrollSpeed: 'deep_reading',
      enableInternalLinkClicks: true,
      internalClickPercent: 85,
      enableFormInteractions: true,
      formInteractionPercent: 45,
      enableMouseJitter: true,
      mouseJitterIntensity: 'high',
      adBlockBypassEmulation: true,
      stealthCanvasNoise: true,
      stealthWebGlVendorMask: true,
      stealthAudioContextSpoof: true
    },
    
    advancedTracking: {
      enableUtm: true,
      utmSource: 'instagram_reels_sponsor',
      utmMedium: 'social_paid_influencer',
      utmCampaign: 'black_friday_preview',
      utmTerm: 'sustainable_fashion',
      utmContent: 'winter_parka_video',
      autoSyncAcceptLanguage: true,
      customHeaders: [],
      customCookies: [],
      timezoneSpoofing: 'auto_by_geo'
    }
  }
];

export const MOCK_WORKER_CLUSTERS: WorkerClusterNode[] = [
  {
    id: 'node-useast-01',
    name: 'AWS us-east-1 Playwright Pool A',
    region: 'North Virginia (US)',
    status: 'ONLINE',
    activeBrowsers: 42,
    maxSlots: 64,
    cpuLoadPercent: 68.4,
    memoryLoadPercent: 71.2,
    totalSessionsExecuted: 148920,
    proxyLatencyMs: 142
  },
  {
    id: 'node-useast-02',
    name: 'AWS us-east-1 Playwright Pool B',
    region: 'North Virginia (US)',
    status: 'ONLINE',
    activeBrowsers: 56,
    maxSlots: 64,
    cpuLoadPercent: 84.1,
    memoryLoadPercent: 88.0,
    totalSessionsExecuted: 192300,
    proxyLatencyMs: 138
  },
  {
    id: 'node-euwest-01',
    name: 'GCP europe-west3 Frankfurt Engine',
    region: 'Frankfurt (EU)',
    status: 'ONLINE',
    activeBrowsers: 38,
    maxSlots: 64,
    cpuLoadPercent: 59.3,
    memoryLoadPercent: 62.8,
    totalSessionsExecuted: 112450,
    proxyLatencyMs: 165
  },
  {
    id: 'node-apse-01',
    name: 'GCP asia-southeast1 Singapore Pod',
    region: 'Singapore (APAC)',
    status: 'ONLINE',
    activeBrowsers: 29,
    maxSlots: 48,
    cpuLoadPercent: 47.9,
    memoryLoadPercent: 54.1,
    totalSessionsExecuted: 88700,
    proxyLatencyMs: 210
  }
];

// Sample 24h realistic delivery time-series
export const SAMPLE_DELIVERY_SERIES: DeliveryDataPoint[] = [
  { timestamp: '2026-08-28T04:00:00Z', formattedTime: '04:00', pageViews: 1420, uniqueVisits: 480, bounces: 110, avgDwellTime: 78, activeWorkers: 18, successRate: 99.4 },
  { timestamp: '2026-08-28T06:00:00Z', formattedTime: '06:00', pageViews: 2100, uniqueVisits: 720, bounces: 165, avgDwellTime: 82, activeWorkers: 24, successRate: 99.8 },
  { timestamp: '2026-08-28T08:00:00Z', formattedTime: '08:00', pageViews: 3850, uniqueVisits: 1310, bounces: 290, avgDwellTime: 95, activeWorkers: 38, successRate: 99.6 },
  { timestamp: '2026-08-28T10:00:00Z', formattedTime: '10:00', pageViews: 5200, uniqueVisits: 1780, bounces: 410, avgDwellTime: 112, activeWorkers: 46, successRate: 99.2 },
  { timestamp: '2026-08-28T12:00:00Z', formattedTime: '12:00', pageViews: 6100, uniqueVisits: 2090, bounces: 480, avgDwellTime: 125, activeWorkers: 54, successRate: 99.7 },
  { timestamp: '2026-08-28T14:00:00Z', formattedTime: '14:00', pageViews: 6800, uniqueVisits: 2320, bounces: 530, avgDwellTime: 118, activeWorkers: 62, successRate: 99.5 },
  { timestamp: '2026-08-28T16:00:00Z', formattedTime: '16:00', pageViews: 5900, uniqueVisits: 2010, bounces: 460, avgDwellTime: 104, activeWorkers: 52, successRate: 99.9 },
  { timestamp: '2026-08-28T18:00:00Z', formattedTime: '18:00', pageViews: 4700, uniqueVisits: 1600, bounces: 370, avgDwellTime: 96, activeWorkers: 42, successRate: 99.3 },
  { timestamp: '2026-08-28T20:00:00Z', formattedTime: '20:00', pageViews: 3400, uniqueVisits: 1160, bounces: 270, avgDwellTime: 88, activeWorkers: 32, successRate: 99.1 },
  { timestamp: '2026-08-28T22:00:00Z', formattedTime: '22:00', pageViews: 2300, uniqueVisits: 790, bounces: 180, avgDwellTime: 80, activeWorkers: 22, successRate: 99.6 }
];

export const SAMPLE_GEO_DELIVERY: GeoDeliveryMetric[] = [
  { countryCode: 'US', countryName: 'United States', views: 18830, visits: 6390, sharePercent: 45.0 },
  { countryCode: 'GB', countryName: 'United Kingdom', views: 8370, visits: 2840, sharePercent: 20.0 },
  { countryCode: 'DE', countryName: 'Germany', views: 6280, visits: 2130, sharePercent: 15.0 },
  { countryCode: 'IN', countryName: 'India', views: 4180, visits: 1420, sharePercent: 10.0 },
  { countryCode: 'CA', countryName: 'Canada', views: 4190, visits: 1440, sharePercent: 10.0 }
];
