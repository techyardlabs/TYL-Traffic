import { FullCampaignConfig, PlaywrightExecutionTask, LiveSimulationEvent } from '../types/campaign';

/**
 * Formats a Residential Proxy connection URI according to provider standard formats
 */
export function buildResidentialProxyUri(
  config: FullCampaignConfig['geoProxy'],
  countryCode: string,
  city?: string
): string {
  const host = config.customProxyHost || 'brd.superproxy.io';
  const port = config.customProxyPort || 22225;
  const username = config.customProxyUsername || 'customer_spark';
  const password = config.customProxyPassword || 'pass_token';

  switch (config.provider) {
    case 'bright_data': {
      let userPart = `${username}-country-${countryCode.toLowerCase()}`;
      if (city) userPart += `-city-${city.toLowerCase().replace(/\s+/g, '')}`;
      if (config.sessionType === 'sticky_10m') {
        userPart += `-session-${Math.random().toString(36).substring(2, 8)}`;
      }
      return `http://${userPart}:${password}@${host}:${port}`;
    }
    case 'oxylabs': {
      let userPart = `customer-${username}-cc-${countryCode.toLowerCase()}`;
      if (city) userPart += `-city-${city.toLowerCase()}`;
      if (config.sessionType === 'sticky_10m') {
        userPart += `-sessid-${Math.random().toString(36).substring(2, 8)}`;
      }
      return `http://${userPart}:${password}@${host}:${port}`;
    }
    case 'smartproxy': {
      return `http://user-${username}-country-${countryCode.toLowerCase()}:${password}@${host}:${port}`;
    }
    case 'webshare': {
      return `http://${username}-${countryCode.toLowerCase()}:${password}@${host}:${port}`;
    }
    default:
      return `http://${username}:${password}@${host}:${port}`;
  }
}

/**
 * Generates dynamic User-Agent and viewport dimensions based on device targeting
 */
export function generateDeviceFingerprint(config: FullCampaignConfig['deviceTargeting']) {
  const isMobile = Math.random() * 100 < config.mobileRatioPercent;

  if (isMobile) {
    const isIos = Math.random() * 100 < config.mobileOS.ios;
    if (isIos) {
      return {
        type: 'mobile' as const,
        os: 'iOS',
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1',
        viewport: { width: 393, height: 852 },
        hasTouch: true,
        pixelRatio: 3.0,
        locale: 'en-US',
        timezone: 'America/New_York'
      };
    } else {
      return {
        type: 'mobile' as const,
        os: 'Android',
        userAgent: 'Mozilla/5.0 (Linux; Android 14; SM-S928B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.6613.88 Mobile Safari/537.36',
        viewport: { width: 412, height: 915 },
        hasTouch: true,
        pixelRatio: 2.625,
        locale: 'en-US',
        timezone: 'America/Chicago'
      };
    }
  } else {
    const totalDesktop = config.desktopOS.windows + config.desktopOS.macos + config.desktopOS.linux;
    const rand = Math.random() * (totalDesktop || 100);
    
    if (rand < config.desktopOS.windows) {
      return {
        type: 'desktop' as const,
        os: 'Windows',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
        viewport: { width: 1920, height: 1080 },
        hasTouch: false,
        pixelRatio: 1.0,
        locale: 'en-US',
        timezone: 'America/New_York'
      };
    } else if (rand < config.desktopOS.windows + config.desktopOS.macos) {
      return {
        type: 'desktop' as const,
        os: 'macOS',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
        viewport: { width: 1440, height: 900 },
        hasTouch: false,
        pixelRatio: 2.0,
        locale: 'en-US',
        timezone: 'America/Los_Angeles'
      };
    } else {
      return {
        type: 'desktop' as const,
        os: 'Linux',
        userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
        viewport: { width: 1920, height: 1080 },
        hasTouch: false,
        pixelRatio: 1.0,
        locale: 'en-US',
        timezone: 'UTC'
      };
    }
  }
}

/**
 * Builds the simulated execution task token pulled by Playwright worker nodes
 */
export function buildPlaywrightTask(campaign: FullCampaignConfig): PlaywrightExecutionTask {
  // Select target country based on weights
  const countryAllocations = campaign.geoProxy.countryAllocations;
  let selectedCountry = 'US';
  if (countryAllocations && countryAllocations.length > 0) {
    const totalWeight = countryAllocations.reduce((sum, c) => sum + c.percentage, 0);
    let randomThreshold = Math.random() * (totalWeight || 100);
    for (const alloc of countryAllocations) {
      randomThreshold -= alloc.percentage;
      if (randomThreshold <= 0) {
        selectedCountry = alloc.countryCode;
        break;
      }
    }
  }

  const device = generateDeviceFingerprint(campaign.deviceTargeting);
  const proxyUri = buildResidentialProxyUri(campaign.geoProxy, selectedCountry);

  // Determine Referrer based on traffic split
  const split = campaign.trafficSplitting;
  const randSplit = Math.random() * 100;
  let referrer = '';

  if (randSplit < split.directPercent) {
    referrer = ''; // Direct visit has no HTTP referrer
  } else if (randSplit < split.directPercent + split.organicPercent) {
    const searchEngines = split.searchEngines || [{ engine: 'google', percentage: 100 }];
    const engine = searchEngines[Math.floor(Math.random() * searchEngines.length)].engine;
    const kw = split.organicKeywords[Math.floor(Math.random() * split.organicKeywords.length)]?.keyword || 'website service';
    
    if (engine === 'google') referrer = `https://www.google.com/search?q=${encodeURIComponent(kw)}`;
    else if (engine === 'bing') referrer = `https://www.bing.com/search?q=${encodeURIComponent(kw)}`;
    else if (engine === 'duckduckgo') referrer = `https://duckduckgo.com/?q=${encodeURIComponent(kw)}`;
    else referrer = `https://search.yahoo.com/search?p=${encodeURIComponent(kw)}`;
  } else if (randSplit < split.directPercent + split.organicPercent + split.socialPercent) {
    const socials = split.socialNetworks || [{ network: 'twitter', percentage: 100 }];
    const soc = socials[Math.floor(Math.random() * socials.length)].network;
    if (soc === 'twitter') referrer = 'https://t.co/sparklink88';
    else if (soc === 'linkedin') referrer = 'https://www.linkedin.com/feed/';
    else if (soc === 'reddit') referrer = 'https://www.reddit.com/r/technology/';
    else if (soc === 'instagram') referrer = 'https://l.instagram.com/';
    else referrer = 'https://www.youtube.com/';
  } else {
    referrer = split.customReferrers[0]?.url || 'https://news.ycombinator.com/';
  }

  // Dwell time calculation
  const dwellMin = campaign.volumeBehavior.dwellTimeMinSeconds;
  const dwellMax = campaign.volumeBehavior.dwellTimeMaxSeconds;
  const dwellTimeSeconds = campaign.volumeBehavior.randomizeDwellTime
    ? Math.floor(dwellMin + Math.random() * (dwellMax - dwellMin + 1))
    : dwellMin;

  const willBounce = Math.random() * 100 < campaign.volumeBehavior.bounceRatePercent;
  const entryUrls = campaign.urlRouting.entryUrls.length > 0 
    ? campaign.urlRouting.entryUrls 
    : [`https://${campaign.targetDomain}`];
  const selectedEntry = entryUrls[Math.floor(Math.random() * entryUrls.length)];

  return {
    taskId: `tsk_${Math.random().toString(36).substring(2, 10)}`,
    campaignId: campaign.id,
    targetDomain: campaign.targetDomain,
    assignedWorkerId: `cluster-node-${['useast', 'euwest', 'apse'][Math.floor(Math.random() * 3)]}-${Math.floor(10 + Math.random() * 90)}`,
    proxyUri,
    country: selectedCountry,
    device,
    navigationFlow: {
      entryUrl: selectedEntry,
      innerUrls: campaign.urlRouting.innerUrls,
      exitUrl: campaign.urlRouting.exitUrls[0],
      pagesToVisit: willBounce ? 1 : campaign.urlRouting.innerPagesPerVisit,
      willBounce,
      dwellTimeSeconds
    },
    behaviorSimulation: {
      shouldScroll: campaign.behavioralSimulation.enableScrollEvents,
      scrollDepthPercent: Math.floor(
        campaign.behavioralSimulation.scrollDepthMinPercent +
        Math.random() * (campaign.behavioralSimulation.scrollDepthMaxPercent - campaign.behavioralSimulation.scrollDepthMinPercent)
      ),
      shouldClickInternal: campaign.behavioralSimulation.enableInternalLinkClicks,
      shouldInteractForms: campaign.behavioralSimulation.enableFormInteractions,
      stealthNoise: campaign.behavioralSimulation.stealthCanvasNoise
    },
    headersAndCookies: {
      referrer,
      acceptLanguage: campaign.advancedTracking.customAcceptLanguage || 'en-US,en;q=0.9',
      utmParams: campaign.advancedTracking.enableUtm ? {
        utm_source: campaign.advancedTracking.utmSource,
        utm_medium: campaign.advancedTracking.utmMedium,
        utm_campaign: campaign.advancedTracking.utmCampaign
      } : {},
      headers: {
        'Accept-Language': campaign.advancedTracking.customAcceptLanguage || 'en-US,en;q=0.9',
        'Sec-Ch-Ua-Mobile': device.type === 'mobile' ? '?1' : '?0'
      },
      cookies: campaign.advancedTracking.customCookies.map(c => ({
        name: c.name,
        value: c.value,
        domain: c.domain || campaign.targetDomain
      }))
    }
  };
}

/**
 * Playwright Execution Worker Production Script Template (for Inspector & Export)
 */
export const PLAYWRIGHT_WORKER_CODE_TEMPLATE = `/**
 * High-Concurrency Playwright Stealth Execution Worker Node
 * Handles Residential Proxy Handshakes, Fingerprint Camouflage,
 * and Human-like Behavioral Emulation
 */
import { chromium, BrowserContext, Page } from 'playwright';
import { Worker, Job } from 'bullmq';
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL || 'redis://127.0.0.1:6379');

interface TrafficJobPayload {
  taskId: string;
  campaignId: string;
  proxyUri: string;
  targetDomain: string;
  device: {
    userAgent: string;
    viewport: { width: number; height: number };
    hasTouch: boolean;
    pixelRatio: number;
  };
  navigationFlow: {
    entryUrl: string;
    innerUrls: string[];
    pagesToVisit: number;
    willBounce: boolean;
    dwellTimeSeconds: number;
  };
  behaviorSimulation: {
    shouldScroll: boolean;
    scrollDepthPercent: number;
    shouldClickInternal: boolean;
    shouldInteractForms: boolean;
  };
  headersAndCookies: {
    referrer: string;
    acceptLanguage: string;
    utmParams: Record<string, string>;
  };
}

export const trafficWorker = new Worker<TrafficJobPayload>(
  'traffic_execution_queue',
  async (job: Job<TrafficJobPayload>) => {
    const data = job.data;
    const startTime = Date.now();

    // 1. Launch Isolated Chromium Instance with Fingerprint & Residential Proxy
    const browser = await chromium.launch({
      headless: true,
      proxy: {
        server: data.proxyUri,
      },
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-blink-features=AutomationControlled',
        '--disable-web-security',
        '--disable-infobars',
        '--window-position=0,0',
        \`--window-size=\${data.device.viewport.width},\${data.device.viewport.height}\`
      ]
    });

    const context: BrowserContext = await browser.newContext({
      userAgent: data.device.userAgent,
      viewport: data.device.viewport,
      hasTouch: data.device.hasTouch,
      deviceScaleFactor: data.device.pixelRatio,
      extraHTTPHeaders: {
        'Accept-Language': data.headersAndCookies.acceptLanguage,
        'Referer': data.headersAndCookies.referrer,
      },
      permissions: ['geolocation'],
      ignoreHTTPSErrors: true,
    });

    // 2. Inject Canvas & WebGL Stealth Masking Scripts
    await context.addInitScript(() => {
      // Overwrite navigator.webdriver
      Object.defineProperty(navigator, 'webdriver', { get: () => undefined });

      // Spoof Canvas Fingerprint with micro-noise
      const originalToDataURL = HTMLCanvasElement.prototype.toDataURL;
      HTMLCanvasElement.prototype.toDataURL = function(type) {
        const ctx = this.getContext('2d');
        if (ctx) {
          ctx.fillStyle = 'rgba(0, 0, 0, 0.01)';
          ctx.fillRect(0, 0, 1, 1);
        }
        return originalToDataURL.apply(this, arguments as any);
      };

      // Spoof WebGL Vendor and Renderer
      const getParameter = WebGLRenderingContext.prototype.getParameter;
      WebGLRenderingContext.prototype.getParameter = function(parameter) {
        if (parameter === 37445) return 'Intel Inc.'; // UNMASKED_VENDOR_WEBGL
        if (parameter === 37446) return 'Intel Iris OpenGL Engine'; // UNMASKED_RENDERER_WEBGL
        return getParameter.apply(this, [parameter]);
      };
    });

    const page: Page = await context.newPage();

    try {
      // 3. Navigate to Entry Landing Page
      let targetUrl = data.navigationFlow.entryUrl;
      if (Object.keys(data.headersAndCookies.utmParams).length > 0) {
        const urlObj = new URL(targetUrl);
        Object.entries(data.headersAndCookies.utmParams).forEach(([k, v]) => {
          urlObj.searchParams.set(k, v);
        });
        targetUrl = urlObj.toString();
      }

      await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 45000 });
      await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});

      // 4. In-Page Human Behavioral Simulation
      if (data.behaviorSimulation.shouldScroll) {
        const targetScrollY = data.behaviorSimulation.scrollDepthPercent;
        await page.evaluate(async (depthPercent) => {
          const totalHeight = document.body.scrollHeight - window.innerHeight;
          const targetPx = (totalHeight * depthPercent) / 100;
          let currentPx = 0;
          while (currentPx < targetPx) {
            const step = Math.floor(Math.random() * 40) + 20;
            currentPx += step;
            window.scrollTo({ top: currentPx, behavior: 'smooth' });
            await new Promise(r => setTimeout(r, Math.random() * 60 + 30));
          }
        }, targetScrollY);
      }

      // Dwell Pause
      const activeDwellMs = Math.min(data.navigationFlow.dwellTimeSeconds * 1000, 45000);
      await new Promise(r => setTimeout(r, activeDwellMs));

      // 5. Check Bounce or Hop to Inner URLs
      let deliveredPageViews = 1;
      if (!data.navigationFlow.willBounce && data.navigationFlow.innerUrls.length > 0) {
        const hops = Math.min(data.navigationFlow.pagesToVisit - 1, data.navigationFlow.innerUrls.length);
        for (let i = 0; i < hops; i++) {
          const nextUrl = data.navigationFlow.innerUrls[i];
          await page.goto(nextUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
          await new Promise(r => setTimeout(r, 4000));
          deliveredPageViews++;
        }
      }

      // 6. Aggregate Delivery Metrics & Report to Redis Ingestion
      await redis.hincrby(\`campaign:\${data.campaignId}:stats\`, 'deliveredViews', deliveredPageViews);
      await redis.hincrby(\`campaign:\${data.campaignId}:stats\`, 'deliveredVisits', 1);

      return {
        success: true,
        pageViews: deliveredPageViews,
        durationMs: Date.now() - startTime
      };
    } finally {
      await context.close();
      await browser.close();
    }
  },
  {
    connection: redis,
    concurrency: 16
  }
);`;
