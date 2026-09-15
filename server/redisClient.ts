import Redis from 'ioredis';

let redisInstance: Redis | null = null;
let lastPingStatus: { connected: boolean; message: string; pingMs?: number } = {
  connected: false,
  message: 'Redis not initialized',
};

// Default fallback to the user's provided Upstash instance
const DEFAULT_UPSTASH_URL =
  'rediss://default:gQAAAAAAAgJVAAIgcDE0MjRlOTI4NTZkMGU0YjAxYTgxMmYxMzE2YmY4ZTk0Yw@sincere-gannet-131669.upstash.io:6379';

export function getActiveRedisUrl(): string {
  const url = process.env.REDIS_URL || DEFAULT_UPSTASH_URL;
  // Ensure that if upstash.io is in the URL and it starts with redis://, upgrade to rediss:// for TLS
  if (url.startsWith('redis://') && url.includes('upstash.io')) {
    return url.replace('redis://', 'rediss://');
  }
  return url;
}

export function getRedisClient(): Redis | null {
  const redisUrl = getActiveRedisUrl();
  if (!redisUrl) return null;

  if (!redisInstance) {
    try {
      redisInstance = new Redis(redisUrl, {
        maxRetriesPerRequest: 3,
        connectTimeout: 7000,
        retryStrategy(times) {
          if (times > 5) return null;
          return Math.min(times * 300, 2000);
        },
      });

      redisInstance.on('connect', () => {
        lastPingStatus = {
          connected: true,
          message: 'Connected to Upstash Redis cluster (TLS)',
        };
      });

      redisInstance.on('error', (err) => {
        console.warn('Redis client notice:', err.message);
        lastPingStatus = {
          connected: false,
          message: `Redis notice: ${err.message}`,
        };
      });
    } catch (e: any) {
      console.error('Failed to instantiate Redis:', e.message);
      return null;
    }
  }

  return redisInstance;
}

export async function testRedisPing(): Promise<{ connected: boolean; message: string; pingMs?: number }> {
  const client = getRedisClient();
  if (!client) {
    return {
      connected: false,
      message: 'No REDIS_URL configured. Running with in-memory queue.',
    };
  }

  const start = Date.now();
  try {
    const pong = await client.ping();
    const duration = Date.now() - start;
    if (pong === 'PONG') {
      lastPingStatus = {
        connected: true,
        message: `Connected to Upstash Redis! PING response: ${pong} (${duration}ms latency)`,
        pingMs: duration,
      };
      return lastPingStatus;
    }
    return {
      connected: true,
      message: `Redis responded with: ${pong}`,
      pingMs: duration,
    };
  } catch (err: any) {
    lastPingStatus = {
      connected: false,
      message: `Redis ping failed: ${err.message}`,
    };
    return lastPingStatus;
  }
}

export function resetRedisClient(newUrl: string) {
  if (redisInstance) {
    try {
      redisInstance.disconnect();
    } catch (e) {
      // ignore
    }
    redisInstance = null;
  }
  process.env.REDIS_URL = newUrl;
  return getRedisClient();
}
