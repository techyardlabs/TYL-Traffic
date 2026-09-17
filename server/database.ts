import pg from 'pg';
import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { INITIAL_CAMPAIGNS } from '../src/data/mockData';

const { Pool: PgPool } = pg;

export type SupportedDialect = 'mysql' | 'postgres' | 'none';

let pgPoolInstance: pg.Pool | null = null;
let mysqlPoolInstance: mysql.Pool | null = null;
let activeDialect: SupportedDialect = 'none';
let lastError: string | null = null;

// Circuit breaker to avoid hammering database and spamming logs when credentials or network fail
interface DbCircuitBreaker {
  isTripped: boolean;
  nextAttemptTime: number;
  lastErrorMessage: string | null;
  errorCode: string | null;
  deniedUser: string | null;
  connectingHost: string | null;
  lastLoggedTime: number;
}

const dbCircuitBreaker: DbCircuitBreaker = {
  isTripped: false,
  nextAttemptTime: 0,
  lastErrorMessage: null,
  errorCode: null,
  deniedUser: null,
  connectingHost: null,
  lastLoggedTime: 0,
};

// Local storage file path for resilient fallback
const DATA_DIR = path.join(process.cwd(), 'data');
const CAMPAIGNS_FILE = path.join(DATA_DIR, 'campaigns_store.json');

// In-memory campaign cache
const inMemoryCampaigns = new Map<string, any>();

// Initialize in-memory cache from file or seed data
function initializeCampaignCache() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (fs.existsSync(CAMPAIGNS_FILE)) {
      const raw = fs.readFileSync(CAMPAIGNS_FILE, 'utf-8');
      const list = JSON.parse(raw);
      if (Array.isArray(list) && list.length > 0) {
        list.forEach((c) => {
          if (c && c.id) inMemoryCampaigns.set(c.id, c);
        });
        return;
      }
    }
  } catch (err: any) {
    console.warn('[Database] Local cache read notice:', err.message);
  }

  // Fallback to seed campaigns
  if (Array.isArray(INITIAL_CAMPAIGNS)) {
    INITIAL_CAMPAIGNS.forEach((c) => {
      inMemoryCampaigns.set(c.id, c);
    });
    persistToFile();
  }
}

function persistToFile() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const list = Array.from(inMemoryCampaigns.values());
    fs.writeFileSync(CAMPAIGNS_FILE, JSON.stringify(list, null, 2), 'utf-8');
  } catch (err: any) {
    console.warn('[Database] Failed to write local backup:', err.message);
  }
}

// Run initial cache load
initializeCampaignCache();

export function detectDialect(connectionString?: string): SupportedDialect {
  const uri = connectionString || process.env.DATABASE_URL || '';
  if (!uri) return 'none';
  if (uri.startsWith('mysql://') || uri.startsWith('mysql2://') || process.env.DB_TYPE === 'mysql') {
    return 'mysql';
  }
  if (uri.startsWith('postgres://') || uri.startsWith('postgresql://') || process.env.DB_TYPE === 'postgres') {
    return 'postgres';
  }
  return 'none';
}

function extractAccessDeniedDetails(errorMsg: string) {
  // Regex for "Access denied for user 'user'@'host' (using password: YES/NO)"
  const match = errorMsg.match(/Access denied for user '([^']+)'@'([^']+)'/i);
  if (match) {
    return {
      user: match[1],
      host: match[2],
    };
  }
  return null;
}

export function getDatabasePool(): { dialect: SupportedDialect; pool: pg.Pool | mysql.Pool | null } {
  const uri = process.env.DATABASE_URL;
  if (!uri) {
    return { dialect: 'none', pool: null };
  }

  const dialect = detectDialect(uri);
  activeDialect = dialect;

  if (dialect === 'mysql') {
    if (!mysqlPoolInstance) {
      try {
        mysqlPoolInstance = mysql.createPool({
          uri,
          waitForConnections: true,
          connectionLimit: 10,
          queueLimit: 0,
          connectTimeout: 8000,
          ssl: uri.includes('ssl=') || uri.includes('sslmode=require') ? { rejectUnauthorized: false } : undefined,
        });
      } catch (err: any) {
        lastError = err.message;
        return { dialect: 'mysql', pool: null };
      }
    }
    return { dialect: 'mysql', pool: mysqlPoolInstance };
  }

  if (dialect === 'postgres') {
    if (!pgPoolInstance) {
      try {
        pgPoolInstance = new PgPool({
          connectionString: uri,
          ssl: uri.includes('sslmode=require') || uri.includes('neon.tech') || uri.includes('supabase.co')
            ? { rejectUnauthorized: false }
            : undefined,
          max: 15,
          idleTimeoutMillis: 30000,
          connectionTimeoutMillis: 8000,
        });
      } catch (err: any) {
        lastError = err.message;
        return { dialect: 'postgres', pool: null };
      }
    }
    return { dialect: 'postgres', pool: pgPoolInstance };
  }

  return { dialect: 'none', pool: null };
}

// Backwards compatibility for server.ts
export function getPgPool() {
  const { dialect, pool } = getDatabasePool();
  return dialect === 'postgres' ? (pool as pg.Pool) : null;
}

export async function resetDatabasePool(newUri?: string): Promise<void> {
  if (newUri !== undefined) {
    process.env.DATABASE_URL = newUri;
  }
  if (mysqlPoolInstance) {
    try {
      await mysqlPoolInstance.end();
    } catch (_) {}
    mysqlPoolInstance = null;
  }
  if (pgPoolInstance) {
    try {
      await pgPoolInstance.end();
    } catch (_) {}
    pgPoolInstance = null;
  }
  activeDialect = 'none';
  lastError = null;
  dbCircuitBreaker.isTripped = false;
  dbCircuitBreaker.nextAttemptTime = 0;
  dbCircuitBreaker.lastErrorMessage = null;
  dbCircuitBreaker.errorCode = null;
  dbCircuitBreaker.deniedUser = null;
  dbCircuitBreaker.connectingHost = null;
}

export async function testDatabaseConnection(): Promise<{
  connected: boolean;
  dialect: SupportedDialect;
  message: string;
  tablesCount?: number;
  dbName?: string;
  errorCode?: string;
  deniedUser?: string;
  connectingHost?: string;
  hostingerGuide?: {
    step1: string;
    step2: string;
    step3: string;
    step4: string;
  };
  fallbackActive: boolean;
  campaignsCount: number;
}> {
  const uri = process.env.DATABASE_URL;
  if (!uri) {
    return {
      connected: false,
      dialect: 'none',
      message: 'DATABASE_URL is not configured. Running with fast local file and in-memory persistence.',
      fallbackActive: true,
      campaignsCount: inMemoryCampaigns.size,
    };
  }

  // Clear circuit breaker on manual test
  dbCircuitBreaker.isTripped = false;
  dbCircuitBreaker.nextAttemptTime = 0;

  const { dialect, pool } = getDatabasePool();

  if (dialect === 'mysql' && pool) {
    const myPool = pool as mysql.Pool;
    try {
      const [rows]: [any[], any] = await myPool.query('SELECT NOW() as now, DATABASE() as db');
      const [tableRows]: [any[], any] = await myPool.query(`
        SELECT count(*) as count 
        FROM information_schema.tables 
        WHERE table_schema = DATABASE()
      `);
      dbCircuitBreaker.isTripped = false;
      return {
        connected: true,
        dialect: 'mysql',
        dbName: rows[0]?.db || 'MySQL DB',
        message: `Connected to Hostinger / Cloud MySQL database "${rows[0]?.db}" at ${rows[0]?.now}`,
        tablesCount: parseInt(tableRows[0]?.count || '0', 10),
        fallbackActive: false,
        campaignsCount: inMemoryCampaigns.size,
      };
    } catch (err: any) {
      const deniedInfo = extractAccessDeniedDetails(err.message);
      dbCircuitBreaker.isTripped = true;
      dbCircuitBreaker.nextAttemptTime = Date.now() + 30000;
      dbCircuitBreaker.lastErrorMessage = err.message;
      dbCircuitBreaker.errorCode = err.code || 'ER_ACCESS_DENIED_ERROR';
      if (deniedInfo) {
        dbCircuitBreaker.deniedUser = deniedInfo.user;
        dbCircuitBreaker.connectingHost = deniedInfo.host;
      }

      let guideMsg = `MySQL connection failed: ${err.message}`;
      if (deniedInfo) {
        guideMsg = `Hostinger MySQL Access Denied for user '${deniedInfo.user}' from cloud runner IP '${deniedInfo.host}'. Remote MySQL access must be authorized in Hostinger hPanel.`;
      }

      return {
        connected: false,
        dialect: 'mysql',
        errorCode: err.code || 'ER_ACCESS_DENIED_ERROR',
        deniedUser: deniedInfo?.user,
        connectingHost: deniedInfo?.host,
        message: guideMsg,
        hostingerGuide: {
          step1: "Log into Hostinger hPanel -> Databases -> Remote MySQL.",
          step2: `In 'IP (IPv4 or IPv6)', enter '%' to allow all remote connections (or enter '${deniedInfo?.host || '%'}').`,
          step3: `Select your database and click 'Create'.`,
          step4: "Ensure your database password in DATABASE_URL matches your Hostinger database user password."
        },
        fallbackActive: true,
        campaignsCount: inMemoryCampaigns.size,
      };
    }
  }

  if (dialect === 'postgres' && pool) {
    const pgPool = pool as pg.Pool;
    try {
      const client = await pgPool.connect();
      try {
        const res = await client.query('SELECT NOW() as now, current_database() as db');
        const tableCheck = await client.query(`
          SELECT count(*) as count 
          FROM information_schema.tables 
          WHERE table_schema = 'public'
        `);
        dbCircuitBreaker.isTripped = false;
        return {
          connected: true,
          dialect: 'postgres',
          dbName: res.rows[0]?.db,
          message: `Connected to PostgreSQL database "${res.rows[0]?.db}" at ${res.rows[0]?.now}`,
          tablesCount: parseInt(tableCheck.rows[0]?.count, 10),
          fallbackActive: false,
          campaignsCount: inMemoryCampaigns.size,
        };
      } finally {
        client.release();
      }
    } catch (err: any) {
      dbCircuitBreaker.isTripped = true;
      dbCircuitBreaker.nextAttemptTime = Date.now() + 30000;
      return {
        connected: false,
        dialect: 'postgres',
        message: `PostgreSQL connection failed: ${err.message}`,
        fallbackActive: true,
        campaignsCount: inMemoryCampaigns.size,
      };
    }
  }

  return {
    connected: false,
    dialect: 'none',
    message: `Unsupported or invalid protocol in DATABASE_URL. Must start with mysql:// or postgresql://`,
    fallbackActive: true,
    campaignsCount: inMemoryCampaigns.size,
  };
}

export async function initializeDatabaseSchema(): Promise<{ success: boolean; message: string; dialect: string }> {
  const { dialect, pool } = getDatabasePool();
  if (!pool) {
    return { success: false, message: 'DATABASE_URL not configured. Running in local storage mode.', dialect: 'none' };
  }

  if (dialect === 'mysql') {
    const myPool = pool as mysql.Pool;
    const mysqlDDL = [
      `CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(64) PRIMARY KEY,
        email VARCHAR(191) UNIQUE NOT NULL,
        name VARCHAR(191),
        credits_balance INT NOT NULL DEFAULT 50000,
        api_key VARCHAR(128) UNIQUE NOT NULL,
        concurrency_cap INT NOT NULL DEFAULT 50,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

      `CREATE TABLE IF NOT EXISTS campaigns (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(191) NOT NULL,
        target_domain VARCHAR(191) NOT NULL,
        status VARCHAR(32) NOT NULL DEFAULT 'RUNNING',
        daily_limit INT NOT NULL DEFAULT 10000,
        total_views_target INT NOT NULL DEFAULT 50000,
        total_views_delivered INT NOT NULL DEFAULT 0,
        total_visits_delivered INT NOT NULL DEFAULT 0,
        bounce_rate_percent INT NOT NULL DEFAULT 25,
        return_rate_percent INT NOT NULL DEFAULT 15,
        config_json JSON NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

      `CREATE TABLE IF NOT EXISTS execution_logs (
        id VARCHAR(64) PRIMARY KEY,
        campaign_id VARCHAR(64),
        worker_id VARCHAR(64) NOT NULL,
        target_url TEXT NOT NULL,
        country VARCHAR(8) NOT NULL,
        proxy_provider VARCHAR(64) NOT NULL,
        proxy_masked_uri VARCHAR(191),
        status_code INT,
        dwell_seconds INT,
        bounced BOOLEAN DEFAULT FALSE,
        pageviews_delivered INT DEFAULT 1,
        latency_ms INT,
        status VARCHAR(32) NOT NULL,
        error_message TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_exec_campaign (campaign_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

      `CREATE TABLE IF NOT EXISTS queue_tasks (
        id VARCHAR(64) PRIMARY KEY,
        campaign_id VARCHAR(64),
        target_url TEXT NOT NULL,
        country VARCHAR(8) NOT NULL,
        device_type VARCHAR(16) NOT NULL,
        status VARCHAR(32) NOT NULL DEFAULT 'QUEUED',
        assigned_worker_id VARCHAR(64),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        executed_at DATETIME,
        INDEX idx_q_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
    ];

    try {
      for (const statement of mysqlDDL) {
        await myPool.query(statement);
      }
      return { success: true, message: 'Hostinger MySQL tables (users, campaigns, execution_logs, queue_tasks) initialized successfully', dialect: 'mysql' };
    } catch (err: any) {
      return { success: false, message: `Hostinger MySQL schema creation failed: ${err.message}`, dialect: 'mysql' };
    }
  }

  if (dialect === 'postgres') {
    const pgPool = pool as pg.Pool;
    const pgDDL = `
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        name TEXT,
        credits_balance INTEGER NOT NULL DEFAULT 50000,
        api_key TEXT UNIQUE NOT NULL,
        concurrency_cap INTEGER NOT NULL DEFAULT 50,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS campaigns (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        target_domain TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'RUNNING',
        daily_limit INTEGER NOT NULL DEFAULT 10000,
        total_views_target INTEGER NOT NULL DEFAULT 50000,
        total_views_delivered INTEGER NOT NULL DEFAULT 0,
        total_visits_delivered INTEGER NOT NULL DEFAULT 0,
        bounce_rate_percent INTEGER NOT NULL DEFAULT 25,
        return_rate_percent INTEGER NOT NULL DEFAULT 15,
        config_json JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS execution_logs (
        id TEXT PRIMARY KEY,
        campaign_id TEXT REFERENCES campaigns(id) ON DELETE CASCADE,
        worker_id TEXT NOT NULL,
        target_url TEXT NOT NULL,
        country TEXT NOT NULL,
        proxy_provider TEXT NOT NULL,
        proxy_masked_uri TEXT,
        status_code INTEGER,
        dwell_seconds INTEGER,
        bounced BOOLEAN DEFAULT FALSE,
        pageviews_delivered INTEGER DEFAULT 1,
        latency_ms INTEGER,
        status TEXT NOT NULL,
        error_message TEXT,
        timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS queue_tasks (
        id TEXT PRIMARY KEY,
        campaign_id TEXT REFERENCES campaigns(id) ON DELETE CASCADE,
        target_url TEXT NOT NULL,
        country TEXT NOT NULL,
        device_type TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'QUEUED',
        assigned_worker_id TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        executed_at TIMESTAMP WITH TIME ZONE
      );

      CREATE INDEX IF NOT EXISTS idx_exec_logs_campaign ON execution_logs(campaign_id);
      CREATE INDEX IF NOT EXISTS idx_queue_status ON queue_tasks(status);
    `;

    try {
      const client = await pgPool.connect();
      try {
        await client.query(pgDDL);
        return { success: true, message: 'PostgreSQL schema initialized successfully', dialect: 'postgres' };
      } finally {
        client.release();
      }
    } catch (err: any) {
      return { success: false, message: `PostgreSQL Schema creation failed: ${err.message}`, dialect: 'postgres' };
    }
  }

  return { success: false, message: 'No active database pool', dialect: 'none' };
}

export async function saveCampaignToDb(campaign: any): Promise<{ success: boolean; persistedIn: string }> {
  if (!campaign || !campaign.id) {
    return { success: false, persistedIn: 'Error: invalid campaign object' };
  }

  // Always keep in-memory and local disk persistence up-to-date first
  inMemoryCampaigns.set(campaign.id, campaign);
  persistToFile();

  const { dialect, pool } = getDatabasePool();
  if (!pool) {
    return { success: true, persistedIn: 'Local Storage & Memory Cache (Ready for DB sync)' };
  }

  // If circuit breaker is currently tripped, don't stall with another failing connection attempt
  if (dbCircuitBreaker.isTripped && Date.now() < dbCircuitBreaker.nextAttemptTime) {
    return {
      success: true,
      persistedIn: `Local Storage (Remote DB currently unreachable: ${dbCircuitBreaker.errorCode || 'Access Denied'})`,
    };
  }

  const dailyLimit = Number(campaign.dailyLimit || campaign.volumeBehavior?.visitsVolume || 10000);
  const totalViewsTarget = Number(campaign.totalViewsTarget || campaign.volumeBehavior?.expectedTotalPageViews || 50000);
  const bounceRate = Number(campaign.volumeBehavior?.bounceRatePercent ?? 25);
  const jsonStr = JSON.stringify(campaign);

  if (dialect === 'mysql') {
    const myPool = pool as mysql.Pool;
    const sql = `
      INSERT INTO campaigns (id, name, target_domain, daily_limit, total_views_target, bounce_rate_percent, config_json, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
      ON DUPLICATE KEY UPDATE
        name = VALUES(name),
        target_domain = VALUES(target_domain),
        daily_limit = VALUES(daily_limit),
        total_views_target = VALUES(total_views_target),
        bounce_rate_percent = VALUES(bounce_rate_percent),
        config_json = VALUES(config_json),
        updated_at = NOW();
    `;
    try {
      await myPool.query(sql, [
        campaign.id,
        campaign.name || 'Website Campaign',
        campaign.targetDomain || 'example.com',
        dailyLimit,
        totalViewsTarget,
        bounceRate,
        jsonStr,
      ]);
      dbCircuitBreaker.isTripped = false;
      return { success: true, persistedIn: 'Hostinger MySQL Database' };
    } catch (err: any) {
      const denied = extractAccessDeniedDetails(err.message);
      dbCircuitBreaker.isTripped = true;
      dbCircuitBreaker.nextAttemptTime = Date.now() + 30000;
      dbCircuitBreaker.errorCode = err.code || 'ER_ACCESS_DENIED_ERROR';
      if (denied) {
        dbCircuitBreaker.deniedUser = denied.user;
        dbCircuitBreaker.connectingHost = denied.host;
      }
      
      const now = Date.now();
      if (now - dbCircuitBreaker.lastLoggedTime > 30000) {
        console.warn(`[Database] MySQL remote connection notice (${err.code || 'Access denied'}). Saved safely to local disk store.`);
        dbCircuitBreaker.lastLoggedTime = now;
      }

      return {
        success: true,
        persistedIn: `Local Storage (Remote MySQL blocked: ${err.message})`,
      };
    }
  }

  if (dialect === 'postgres') {
    const pgPool = pool as pg.Pool;
    const sql = `
      INSERT INTO campaigns (id, name, target_domain, daily_limit, total_views_target, bounce_rate_percent, config_json, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        target_domain = EXCLUDED.target_domain,
        daily_limit = EXCLUDED.daily_limit,
        total_views_target = EXCLUDED.total_views_target,
        bounce_rate_percent = EXCLUDED.bounce_rate_percent,
        config_json = EXCLUDED.config_json,
        updated_at = NOW();
    `;
    try {
      const client = await pgPool.connect();
      try {
        await client.query(sql, [
          campaign.id,
          campaign.name || 'Website Campaign',
          campaign.targetDomain || 'example.com',
          dailyLimit,
          totalViewsTarget,
          bounceRate,
          jsonStr,
        ]);
        dbCircuitBreaker.isTripped = false;
        return { success: true, persistedIn: 'PostgreSQL Database' };
      } finally {
        client.release();
      }
    } catch (err: any) {
      dbCircuitBreaker.isTripped = true;
      dbCircuitBreaker.nextAttemptTime = Date.now() + 30000;
      return { success: true, persistedIn: `Local Storage (PostgreSQL error: ${err.message})` };
    }
  }

  return { success: true, persistedIn: 'Local Storage & Memory Cache' };
}

export async function getCampaignsFromDb(): Promise<any[]> {
  // Ensure we have fallback data ready
  if (inMemoryCampaigns.size === 0) {
    initializeCampaignCache();
  }

  const { dialect, pool } = getDatabasePool();
  if (!pool) {
    return Array.from(inMemoryCampaigns.values());
  }

  // If circuit breaker is currently active, return local cached campaigns without failing or spamming logs
  if (dbCircuitBreaker.isTripped && Date.now() < dbCircuitBreaker.nextAttemptTime) {
    return Array.from(inMemoryCampaigns.values());
  }

  if (dialect === 'mysql') {
    const myPool = pool as mysql.Pool;
    try {
      const [rows]: [any[], any] = await myPool.query('SELECT config_json FROM campaigns ORDER BY updated_at DESC');
      if (rows && rows.length > 0) {
        dbCircuitBreaker.isTripped = false;
        return rows.map((r: any) => {
          const cfg = typeof r.config_json === 'string' ? JSON.parse(r.config_json) : r.config_json;
          inMemoryCampaigns.set(cfg.id, cfg);
          return cfg;
        });
      }
    } catch (err: any) {
      const denied = extractAccessDeniedDetails(err.message);
      dbCircuitBreaker.isTripped = true;
      dbCircuitBreaker.nextAttemptTime = Date.now() + 30000;
      dbCircuitBreaker.errorCode = err.code || 'ER_ACCESS_DENIED_ERROR';
      if (denied) {
        dbCircuitBreaker.deniedUser = denied.user;
        dbCircuitBreaker.connectingHost = denied.host;
      }

      const now = Date.now();
      if (now - dbCircuitBreaker.lastLoggedTime > 30000) {
        console.warn(`[Database] Remote MySQL access blocked (${denied ? `User '${denied.user}' from host '${denied.host}'` : err.message}). Smoothly serving from local storage.`);
        dbCircuitBreaker.lastLoggedTime = now;
      }
    }
  }

  if (dialect === 'postgres') {
    const pgPool = pool as pg.Pool;
    try {
      const client = await pgPool.connect();
      try {
        const res = await client.query('SELECT config_json FROM campaigns ORDER BY updated_at DESC');
        if (res.rows && res.rows.length > 0) {
          dbCircuitBreaker.isTripped = false;
          return res.rows.map((r: any) => {
            const cfg = typeof r.config_json === 'string' ? JSON.parse(r.config_json) : r.config_json;
            inMemoryCampaigns.set(cfg.id, cfg);
            return cfg;
          });
        }
      } finally {
        client.release();
      }
    } catch (err: any) {
      dbCircuitBreaker.isTripped = true;
      dbCircuitBreaker.nextAttemptTime = Date.now() + 30000;
    }
  }

  return Array.from(inMemoryCampaigns.values());
}

export async function deleteCampaignFromDb(id: string): Promise<{ success: boolean; message: string }> {
  inMemoryCampaigns.delete(id);
  persistToFile();

  const { dialect, pool } = getDatabasePool();
  if (!pool) {
    return { success: true, message: 'Removed from local storage' };
  }

  if (dialect === 'mysql') {
    const myPool = pool as mysql.Pool;
    try {
      await myPool.query('DELETE FROM campaigns WHERE id = ?', [id]);
      return { success: true, message: 'Deleted from MySQL' };
    } catch (err: any) {
      return { success: true, message: `Removed from local storage (MySQL: ${err.message})` };
    }
  }

  if (dialect === 'postgres') {
    const pgPool = pool as pg.Pool;
    try {
      const client = await pgPool.connect();
      try {
        await client.query('DELETE FROM campaigns WHERE id = $1', [id]);
        return { success: true, message: 'Deleted from Postgres' };
      } finally {
        client.release();
      }
    } catch (err: any) {
      return { success: true, message: `Removed from local storage (Postgres: ${err.message})` };
    }
  }

  return { success: true, message: 'Removed' };
}
