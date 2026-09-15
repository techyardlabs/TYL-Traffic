import React, { useState } from 'react';
import { 
  X, 
  Database, 
  Copy, 
  Check, 
  FileCode, 
  Layers, 
  Terminal,
  Download
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const PrismaSchemaViewer: React.FC<Props> = ({
  isOpen,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'prisma' | 'sql' | 'drizzle'>('prisma');
  const [copied, setCopied] = useState(false);

  const prismaSchemaCode = `// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum CampaignStatus {
  DRAFT
  PENDING
  RUNNING
  PAUSED
  COMPLETED
  ERROR_INSUFFICIENT_CREDITS
  STOPPED_RATE_LIMIT
}

enum UserTier {
  STARTER
  PROFESSIONAL
  ENTERPRISE
  CUSTOM_SCALE
}

enum ProxyProvider {
  BRIGHT_DATA
  OXYLABS
  SMARTPROXY
  WEBSHARE
  CUSTOM_RESIDENTIAL
}

model User {
  id              String         @id @default(uuid())
  email           String         @unique
  passwordHash    String
  name            String?
  tier            UserTier       @default(STARTER)
  creditsBalance  Int            @default(25000)
  apiKey          String         @unique @default(cuid())
  concurrencyCap  Int            @default(50)
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt

  campaigns       Campaign[]
  transactions    CreditTransaction[]
  apiKeys         ApiKey[]

  @@index([email])
  @@index([apiKey])
  @@map("users")
}

model Campaign {
  id                  String         @id @default(uuid())
  userId              String
  user                User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  name                String
  targetDomain        String
  status              CampaignStatus @default(RUNNING)
  
  // Volume & Speed parameters
  dailyLimit          Int            @default(10000)
  totalViewsTarget    Int            @default(50000)
  totalViewsDelivered Int            @default(0)
  totalVisitsDelivered Int           @default(0)
  bounceRatePercent   Int            @default(25)
  returnRatePercent   Int            @default(15)
  dwellTimeMinSeconds Int            @default(30)
  dwellTimeMaxSeconds Int            @default(120)
  randomizeDwell      Boolean        @default(true)
  
  // Routing & Splitting
  innerPagesPerVisit  Int            @default(3)
  entryUrls           String[]
  innerUrls           String[]
  exitUrls            String[]
  autoCrawlSitemap    Boolean        @default(false)
  sitemapUrl          String?
  
  // Traffic Sources & Allocations (in %)
  directPercent       Int            @default(30)
  organicPercent      Int            @default(45)
  socialPercent       Int            @default(15)
  customPercent       Int            @default(10)
  
  // Complex JSON configuration state
  configJson          Json
  
  // Timestamps
  startedAt           DateTime?
  completedAt         DateTime?
  createdAt           DateTime       @default(now())
  updatedAt           DateTime       @updatedAt

  stats               CampaignStat[]
  executionLogs       ExecutionLog[]

  @@index([userId])
  @@index([status])
  @@index([targetDomain])
  @@map("campaigns")
}

model CampaignStat {
  id                  String    @id @default(uuid())
  campaignId          String
  campaign            Campaign  @relation(fields: [campaignId], references: [id], onDelete: Cascade)
  
  timestamp           DateTime  @default(now())
  deliveredViews      Int       @default(0)
  deliveredUsers      Int       @default(0)
  bounceCount         Int       @default(0)
  avgDwellTimeSeconds Float     @default(0)
  countryCode         String    @db.VarChar(5)
  deviceCategory      String    @default("DESKTOP") @db.VarChar(20)
  creditsConsumed     Int       @default(0)

  @@index([campaignId, timestamp])
  @@index([countryCode])
  @@map("campaign_stats")
}

model ProxyPool {
  id              String        @id @default(uuid())
  provider        ProxyProvider @default(BRIGHT_DATA)
  host            String
  port            Int
  username        String
  password        String
  authType        String        @default("HTTP_BASIC")
  active          Boolean       @default(true)
  countrySupport  String[]      @default(["US", "GB", "DE", "IN", "CA", "FR", "AU"])
  supportsSticky  Boolean       @default(true)
  maxConcurrency  Int           @default(1000)
  currentLoad     Int           @default(0)
  latencyAvgMs    Int           @default(180)
  lastCheckedAt   DateTime      @default(now())

  executionLogs   ExecutionLog[]

  @@index([provider, active])
  @@map("proxy_pools")
}

model WorkerNode {
  id              String         @id @default(uuid())
  hostname        String         @unique
  region          String         @default("us-east-1")
  ipAddress       String
  activeBrowsers  Int            @default(0)
  maxCapacity     Int            @default(64)
  cpuUsagePct     Float          @default(0.0)
  memoryUsagePct  Float          @default(0.0)
  status          String         @default("HEALTHY")
  lastHeartbeat   DateTime       @default(now())
  createdAt       DateTime       @default(now())

  executionLogs   ExecutionLog[]

  @@index([status, lastHeartbeat])
  @@map("worker_nodes")
}

model ExecutionLog {
  id                  String      @id @default(uuid())
  campaignId          String
  campaign            Campaign    @relation(fields: [campaignId], references: [id], onDelete: Cascade)
  
  workerId            String?
  worker              WorkerNode? @relation(fields: [workerId], references: [id], onDelete: SetNull)
  
  proxyPoolId         String?
  proxyPool           ProxyPool?  @relation(fields: [proxyPoolId], references: [id], onDelete: SetNull)
  
  ipAddress           String?
  geoCountry          String      @db.VarChar(5)
  geoCity             String?
  deviceType          String
  browserEngine       String      @default("Chromium-Stealth")
  userAgent           String
  
  entryUrl            String
  targetUrl           String
  pageViewsDelivered  Int         @default(1)
  dwellTimeSeconds    Int         @default(0)
  bounced             Boolean     @default(false)
  eventsTriggered     Int         @default(0)
  
  status              String      @default("SUCCESS") // SUCCESS, TIMEOUT, PROXY_ERROR, BLOCKED
  errorMessage        String?
  durationMs          Int         @default(0)
  createdAt           DateTime    @default(now())

  @@index([campaignId, createdAt])
  @@index([status])
  @@map("execution_logs")
}`;

  const sqlMigrationCode = `-- PostgreSQL Migration Script
CREATE TYPE "CampaignStatus" AS ENUM ('DRAFT', 'PENDING', 'RUNNING', 'PAUSED', 'COMPLETED', 'ERROR_INSUFFICIENT_CREDITS', 'STOPPED_RATE_LIMIT');
CREATE TYPE "UserTier" AS ENUM ('STARTER', 'PROFESSIONAL', 'ENTERPRISE', 'CUSTOM_SCALE');
CREATE TYPE "ProxyProvider" AS ENUM ('BRIGHT_DATA', 'OXYLABS', 'SMARTPROXY', 'WEBSHARE', 'CUSTOM_RESIDENTIAL');

CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL UNIQUE,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT,
    "tier" "UserTier" NOT NULL DEFAULT 'STARTER',
    "creditsBalance" INTEGER NOT NULL DEFAULT 25000,
    "apiKey" TEXT NOT NULL UNIQUE,
    "concurrencyCap" INTEGER NOT NULL DEFAULT 50,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

CREATE TABLE "campaigns" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "name" TEXT NOT NULL,
    "targetDomain" TEXT NOT NULL,
    "status" "CampaignStatus" NOT NULL DEFAULT 'RUNNING',
    "dailyLimit" INTEGER NOT NULL DEFAULT 10000,
    "totalViewsTarget" INTEGER NOT NULL DEFAULT 50000,
    "totalViewsDelivered" INTEGER NOT NULL DEFAULT 0,
    "totalVisitsDelivered" INTEGER NOT NULL DEFAULT 0,
    "bounceRatePercent" INTEGER NOT NULL DEFAULT 25,
    "returnRatePercent" INTEGER NOT NULL DEFAULT 15,
    "dwellTimeMinSeconds" INTEGER NOT NULL DEFAULT 30,
    "dwellTimeMaxSeconds" INTEGER NOT NULL DEFAULT 120,
    "configJson" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

CREATE TABLE "campaign_stats" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "campaignId" TEXT NOT NULL REFERENCES "campaigns"("id") ON DELETE CASCADE,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deliveredViews" INTEGER NOT NULL DEFAULT 0,
    "deliveredUsers" INTEGER NOT NULL DEFAULT 0,
    "bounceCount" INTEGER NOT NULL DEFAULT 0,
    "countryCode" VARCHAR(5) NOT NULL
);

CREATE TABLE "proxy_pools" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "provider" "ProxyProvider" NOT NULL DEFAULT 'BRIGHT_DATA',
    "host" TEXT NOT NULL,
    "port" INTEGER NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "latencyAvgMs" INTEGER NOT NULL DEFAULT 180
);

CREATE TABLE "execution_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "campaignId" TEXT NOT NULL REFERENCES "campaigns"("id") ON DELETE CASCADE,
    "ipAddress" TEXT,
    "geoCountry" VARCHAR(5) NOT NULL,
    "userAgent" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'SUCCESS',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "idx_campaigns_user" ON "campaigns"("userId");
CREATE INDEX "idx_stats_campaign_time" ON "campaign_stats"("campaignId", "timestamp");
CREATE INDEX "idx_logs_campaign" ON "execution_logs"("campaignId");`;

  const drizzleCode = `// src/db/schema.ts (Drizzle ORM Definition)
import { pgTable, text, integer, timestamp, jsonb, boolean, varchar, pgEnum } from 'drizzle-orm/pg-core';

export const campaignStatusEnum = pgEnum('campaign_status', [
  'DRAFT', 'PENDING', 'RUNNING', 'PAUSED', 'COMPLETED', 'ERROR_INSUFFICIENT_CREDITS'
]);

export const proxyProviderEnum = pgEnum('proxy_provider', [
  'BRIGHT_DATA', 'OXYLABS', 'SMARTPROXY', 'WEBSHARE', 'CUSTOM_RESIDENTIAL'
]);

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  creditsBalance: integer('credits_balance').default(25000).notNull(),
  apiKey: text('api_key').notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const campaigns = pgTable('campaigns', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  name: text('name').notNull(),
  targetDomain: text('target_domain').notNull(),
  status: campaignStatusEnum('status').default('RUNNING').notNull(),
  dailyLimit: integer('daily_limit').default(10000).notNull(),
  totalViewsDelivered: integer('total_views_delivered').default(0).notNull(),
  configJson: jsonb('config_json').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const campaignStats = pgTable('campaign_stats', {
  id: text('id').primaryKey(),
  campaignId: text('campaign_id').references(() => campaigns.id, { onDelete: 'cascade' }).notNull(),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
  deliveredViews: integer('delivered_views').default(0).notNull(),
  deliveredUsers: integer('delivered_users').default(0).notNull(),
  bounceCount: integer('bounce_count').default(0).notNull(),
  countryCode: varchar('country_code', { length: 5 }).notNull(),
});

export const proxyPools = pgTable('proxy_pools', {
  id: text('id').primaryKey(),
  provider: proxyProviderEnum('provider').default('BRIGHT_DATA').notNull(),
  host: text('host').notNull(),
  port: integer('port').notNull(),
  active: boolean('active').default(true).notNull(),
});`;

  const getActiveCode = () => {
    if (activeTab === 'prisma') return prismaSchemaCode;
    if (activeTab === 'sql') return sqlMigrationCode;
    return drizzleCode;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getActiveCode());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                Production Database Schema Blueprint
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                  POSTGRESQL & ORM
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Data models for User accounts, Campaigns, CampaignStat time-series, ProxyPools, and ExecutionLogs
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Copy Button */}
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy Schema</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Format Selector Tabs */}
        <div className="flex items-center gap-2 px-6 py-2.5 bg-slate-950 border-b border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('prisma')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
              activeTab === 'prisma'
                ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Prisma Schema (schema.prisma)
          </button>
          <button
            onClick={() => setActiveTab('sql')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
              activeTab === 'sql'
                ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Raw PostgreSQL Migration (DDL)
          </button>
          <button
            onClick={() => setActiveTab('drizzle')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
              activeTab === 'drizzle'
                ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Drizzle ORM (TypeScript)
          </button>
        </div>

        {/* Code View Area */}
        <div className="p-6 overflow-y-auto bg-slate-950 font-mono text-xs text-slate-300 leading-relaxed">
          <pre className="whitespace-pre-wrap select-text">
            {getActiveCode()}
          </pre>
        </div>

      </div>
    </div>
  );
};
