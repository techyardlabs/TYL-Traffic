import express from "express";
import path from "path";
import fs from "fs";
import { trafficClusterManager } from "./server/queueManager";
import { testDatabaseConnection, initializeDatabaseSchema, saveCampaignToDb } from "./server/database";
import { testRedisPing, resetRedisClient, getActiveRedisUrl } from "./server/redisClient";
import { authenticateUser, verifyToken, updateAdminPassword, getPublicAuthInfo, requireAuth } from "./server/auth";

const currentDir = typeof __dirname !== "undefined" ? __dirname : process.cwd();

// Prevent unexpected unhandled exceptions from terminating the server in production
process.on("uncaughtException", (err) => {
  console.error("[TYL Traffic] Uncaught Exception:", err);
});
process.on("unhandledRejection", (reason, promise) => {
  console.error("[TYL Traffic] Unhandled Rejection at:", promise, "reason:", reason);
});

async function startServer() {
  const app = express();
  // Bound to port 3000 for standard dev / Hostinger, with dynamic port support in production
  const PORT = process.env.NODE_ENV === "production" && process.env.PORT && process.env.PORT !== "8080"
    ? parseInt(process.env.PORT, 10)
    : 3000;

  app.use(express.json());

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Authentication Endpoints
  app.get("/api/auth/status", (req, res) => {
    res.json(getPublicAuthInfo());
  });

  app.post("/api/auth/login", (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, error: "Username and password are required" });
    }
    const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
    const result = authenticateUser(username, password, clientIp);
    if (!result.success) {
      return res.status(401).json(result);
    }
    res.json(result);
  });

  app.get("/api/auth/me", (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ authenticated: false, error: "No bearer token provided" });
    }
    const token = authHeader.split(" ")[1];
    const result = verifyToken(token);
    if (!result.valid) {
      return res.status(401).json({ authenticated: false, error: result.error });
    }
    res.json({ authenticated: true, user: result.user });
  });

  app.post("/api/auth/logout", (req, res) => {
    res.json({ success: true, message: "Logged out successfully" });
  });

  app.post("/api/auth/change-password", requireAuth, (req, res) => {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ success: false, message: "Both old and new passwords are required" });
    }
    const result = updateAdminPassword(oldPassword, newPassword);
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  });

  // Redis Ping & Diagnostic Check
  app.get("/api/redis/ping", async (req, res) => {
    const result = await testRedisPing();
    res.json(result);
  });

  // Database Connection Status & Diagnostic Check (MySQL or PostgreSQL)
  app.get("/api/db/status", async (req, res) => {
    const result = await testDatabaseConnection();
    res.json(result);
  });

  // Initialize Database schema DDL (MySQL or PostgreSQL)
  app.post("/api/db/init-schema", async (req, res) => {
    const result = await initializeDatabaseSchema();
    res.json(result);
  });

  // Cluster & Queue Stats Endpoint
  app.get("/api/cluster/stats", (req, res) => {
    const stats = trafficClusterManager.getQueueStats();
    res.json(stats);
  });

  // Enqueue Live Traffic Job(s)
  app.post("/api/traffic/dispatch", (req, res) => {
    try {
      const { campaign, count = 1, targetCountry } = req.body;
      if (!campaign) {
        return res.status(400).json({ error: "Missing campaign configuration object" });
      }

      if (count > 1) {
        const jobs = trafficClusterManager.enqueueBatch(campaign, Math.min(count, 50));
        return res.json({ success: true, enqueuedCount: jobs.length, jobs });
      }

      const job = trafficClusterManager.enqueueJob(campaign, targetCountry);
      res.json({ success: true, job });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Clear Traffic Queue
  app.post("/api/traffic/queue/clear", (req, res) => {
    trafficClusterManager.clearQueue();
    res.json({ success: true, message: "Queue cleared" });
  });

  // Runtime environment / credentials configuration
  app.get("/api/config/status", async (req, res) => {
    const redisUrl = getActiveRedisUrl();
    const dbUrl = process.env.DATABASE_URL;
    const redisTest = await testRedisPing();
    res.json({
      redisConfigured: !!redisUrl,
      redisMasked: redisUrl ? redisUrl.replace(/:([^@]+)@/, ':****@') : null,
      redisStatus: redisTest,
      dbConfigured: !!dbUrl,
      dbMasked: dbUrl ? dbUrl.replace(/:([^@]+)@/, ':****@') : null,
    });
  });

  app.post("/api/config/set-redis", async (req, res) => {
    const { redisUrl } = req.body;
    if (!redisUrl || typeof redisUrl !== 'string') {
      return res.status(400).json({ error: "Invalid redisUrl provided" });
    }
    const cleanUrl = redisUrl.trim();
    resetRedisClient(cleanUrl);
    const testResult = await testRedisPing();
    res.json({
      success: testResult.connected,
      message: testResult.message,
      redisMasked: cleanUrl.replace(/:([^@]+)@/, ':****@'),
      testResult,
    });
  });

  app.post("/api/config/set-db", async (req, res) => {
    const { databaseUrl } = req.body;
    if (!databaseUrl || typeof databaseUrl !== 'string') {
      return res.status(400).json({ error: "Invalid databaseUrl provided" });
    }
    const cleanUrl = databaseUrl.trim();
    process.env.DATABASE_URL = cleanUrl;
    const testResult = await testDatabaseConnection();
    res.json({
      success: true,
      message: "DATABASE_URL updated! " + testResult.message,
      testResult,
    });
  });

  // Campaign Save to MySQL, PostgreSQL or Memory
  app.post("/api/campaigns/save", async (req, res) => {
    const { campaign } = req.body;
    if (!campaign || !campaign.id) {
      return res.status(400).json({ error: "Invalid campaign payload" });
    }

    const result = await saveCampaignToDb(campaign);
    res.json(result);
  });

  // Vite middleware setup (development) vs Static serving (production/Hostinger)
  const candidateDistPaths = [
    path.join(process.cwd(), "dist"),
    path.resolve(currentDir),
    path.resolve(currentDir, "..", "dist"),
  ];
  const distPath = candidateDistPaths.find((p) => fs.existsSync(path.join(p, "index.html")));

  if (process.env.NODE_ENV !== "development" && distPath) {
    // Production mode: Serve pre-built static bundle
    console.log(`[TYL Traffic] Serving production static assets from ${distPath}`);
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  } else {
    // Development mode: Boot Vite middleware
    try {
      const { createServer: createViteServer } = await import("vite");
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
    } catch (viteErr) {
      console.warn("[TYL Traffic] Vite middleware not loaded, falling back to static:", viteErr);
      if (distPath) {
        app.use(express.static(distPath));
        app.get("*", (req, res) => {
          res.sendFile(path.join(distPath, "index.html"));
        });
      }
    }
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`TYL Traffic Cluster Orchestrator running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
