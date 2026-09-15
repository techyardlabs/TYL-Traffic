import pg from 'pg';
import mysql from 'mysql2/promise';

const { Pool: PgPool } = pg;

export type SupportedDialect = 'mysql' | 'postgres' | 'none';

let pgPoolInstance: pg.Pool | null = null;
let mysqlPoolInstance: mysql.Pool | null = null;
let activeDialect: SupportedDialect = 'none';
let lastError: string | null = null;

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
          connectionLimit: 15,
          queueLimit: 0,
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
          max: 20,
          idleTimeoutMillis: 30000,
          connectionTimeoutMillis: 5000,
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

export async function testDatabaseConnection(): Promise<{
  connected: boolean;
  dialect: SupportedDialect;
  message: string;
  tablesCount?: number;
  dbName?: string;
}> {
  const uri = process.env.DATABASE_URL;
  if (!uri) {
    return {
      connected: false,
      dialect: 'none',
      message: 'DATABASE_URL environment variable is not configured. Running with in-memory persistence.',
    };
  }

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
      return {
        connected: true,
        dialect: 'mysql',
        dbName: rows[0]?.db || 'MySQL DB',
        message: `Connected to Hostinger / Cloud MySQL database "${rows[0]?.db}" at ${rows[0]?.now}`,
        tablesCount: parseInt(tableRows[0]?.count || '0', 10),
      };
    } catch (err: any) {
      return {
        connected: false,
        dialect: 'mysql',
        message: `MySQL connection failed: ${err.message}. If on Hostinger, ensure "Remote MySQL" has authorized your IP or '%'.`,
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
        return {
          connected: true,
          dialect: 'postgres',
          dbName: res.rows[0]?.db,
          message: `Connected to PostgreSQL database "${res.rows[0]?.db}" at ${res.rows[0]?.now}`,
          tablesCount: parseInt(tableCheck.rows[0]?.count, 10),
        };
      } finally {
        client.release();
      }
    } catch (err: any) {
      return {
        connected: false,
        dialect: 'postgres',
        message: `PostgreSQL connection failed: ${err.message}`,
      };
    }
  }

  return {
    connected: false,
    dialect: 'none',
    message: `Unsupported or invalid protocol in DATABASE_URL. Must start with mysql:// or postgresql://`,
  };
}

export async function initializeDatabaseSchema(): Promise<{ success: boolean; message: string; dialect: string }> {
  const { dialect, pool } = getDatabasePool();
  if (!pool) {
    return { success: false, message: 'DATABASE_URL not set or invalid', dialect: 'none' };
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
        proxy_masked_uri TEXT,
        status_code INT,
        dwell_seconds INT,
        bounced BOOLEAN DEFAULT FALSE,
        pageviews_delivered INT DEFAULT 1,
        latency_ms INT,
        status VARCHAR(32) NOT NULL,
        error_message TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_exec_logs_campaign (campaign_id)
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
        INDEX idx_queue_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`
    ];

    try {
      for (const statement of mysqlDDL) {
        await myPool.query(statement);
      }
      return { success: true, message: 'Hostinger MySQL database schema initialized successfully!', dialect: 'mysql' };
    } catch (err: any) {
      return { success: false, message: `MySQL Schema creation failed: ${err.message}`, dialect: 'mysql' };
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
  const { dialect, pool } = getDatabasePool();
  if (!pool) {
    return { success: true, persistedIn: 'Local State (No DATABASE_URL configured)' };
  }

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
        campaign.name,
        campaign.targetDomain,
        campaign.volumeBehavior.dailyLimit,
        campaign.volumeBehavior.totalViewsTarget,
        campaign.volumeBehavior.bounceRatePercent,
        JSON.stringify(campaign),
      ]);
      return { success: true, persistedIn: 'Hostinger MySQL' };
    } catch (err: any) {
      return { success: false, persistedIn: `MySQL Error: ${err.message}` };
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
          campaign.name,
          campaign.targetDomain,
          campaign.volumeBehavior.dailyLimit,
          campaign.volumeBehavior.totalViewsTarget,
          campaign.volumeBehavior.bounceRatePercent,
          JSON.stringify(campaign),
        ]);
        return { success: true, persistedIn: 'PostgreSQL' };
      } finally {
        client.release();
      }
    } catch (err: any) {
      return { success: false, persistedIn: `PostgreSQL Error: ${err.message}` };
    }
  }

  return { success: true, persistedIn: 'Memory' };
}
