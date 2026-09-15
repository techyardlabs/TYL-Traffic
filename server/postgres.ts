import pg from 'pg';
const { Pool } = pg;

// Lazy PostgreSQL Pool Initialization
let poolInstance: pg.Pool | null = null;
let isConnected = false;
let lastError: string | null = null;

export function getPgPool(): pg.Pool | null {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    return null;
  }

  if (!poolInstance) {
    try {
      poolInstance = new Pool({
        connectionString,
        ssl: connectionString.includes('sslmode=require') || connectionString.includes('neon.tech') || connectionString.includes('supabase.co')
          ? { rejectUnauthorized: false }
          : undefined,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
      });

      poolInstance.on('error', (err) => {
        console.error('PostgreSQL client error:', err.message);
        lastError = err.message;
      });
    } catch (e: any) {
      console.error('Failed to initialize PostgreSQL pool:', e.message);
      lastError = e.message;
      return null;
    }
  }

  return poolInstance;
}

export async function testPgConnection(): Promise<{ connected: boolean; message: string; tablesCount?: number }> {
  const pool = getPgPool();
  if (!pool) {
    return {
      connected: false,
      message: 'DATABASE_URL environment variable is not configured. Running with in-memory persistence.',
    };
  }

  try {
    const client = await pool.connect();
    try {
      const res = await client.query('SELECT NOW() as now, current_database() as db');
      const tableCheck = await client.query(`
        SELECT count(*) as count 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
      `);
      isConnected = true;
      lastError = null;
      return {
        connected: true,
        message: `Connected to PostgreSQL database "${res.rows[0].db}" at ${res.rows[0].now}`,
        tablesCount: parseInt(tableCheck.rows[0].count, 10),
      };
    } finally {
      client.release();
    }
  } catch (err: any) {
    isConnected = false;
    lastError = err.message;
    return {
      connected: false,
      message: `PostgreSQL connection failed: ${err.message}`,
    };
  }
}

export async function initializePostgresSchema(): Promise<{ success: boolean; message: string }> {
  const pool = getPgPool();
  if (!pool) {
    return { success: false, message: 'DATABASE_URL not set' };
  }

  const ddl = `
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
    const client = await pool.connect();
    try {
      await client.query(ddl);
      return { success: true, message: 'PostgreSQL schema initialized successfully' };
    } finally {
      client.release();
    }
  } catch (err: any) {
    return { success: false, message: `Failed to initialize schema: ${err.message}` };
  }
}
