import express from "express";
import path from "path";
import fs from "fs";
import { trafficClusterManager } from "./server/queueManager";
import { testDatabaseConnection, initializeDatabaseSchema, saveCampaignToDb, getCampaignsFromDb, deleteCampaignFromDb, resetDatabasePool } from "./server/database";
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
  const PORT = 3000;

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
    await resetDatabasePool(cleanUrl);
    const testResult = await testDatabaseConnection();
    res.json({
      success: true,
      message: "DATABASE_URL updated! " + testResult.message,
      testResult,
    });
  });

  app.post("/api/config/clear-db", async (req, res) => {
    await resetDatabasePool("");
    delete process.env.DATABASE_URL;
    res.json({
      success: true,
      message: "Database disconnected. Now running in resilient Local Storage & Memory mode.",
    });
  });

  // Campaign List from MySQL, PostgreSQL or Memory
  app.get("/api/campaigns", async (req, res) => {
    try {
      const list = await getCampaignsFromDb();
      res.json({ success: true, campaigns: list });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
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

  // Campaign Delete from MySQL, PostgreSQL or Memory
  app.delete("/api/campaigns/:id", async (req, res) => {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: "Campaign ID required" });
    }
    const result = await deleteCampaignFromDb(id);
    res.json(result);
  });

  // Google Analytics 4 Realtime Hit Dispatch & Protocol Verification
  app.post("/api/traffic/test-ga4", async (req, res) => {
    try {
      const { 
        measurementId, 
        apiSecret, 
        targetUrl = 'https://teesariankhmedia.com/', 
        pageTitle = 'Home - Live Visitor Session',
        dwellSeconds = 45 
      } = req.body;

      if (!measurementId || typeof measurementId !== 'string') {
        return res.status(400).json({ 
          success: false, 
          error: "Google Analytics Measurement ID is required (e.g., G-XXXXXXXXXX or UA-XXXXX-Y)" 
        });
      }

      const cleanId = measurementId.trim().toUpperCase();
      const clientId = `tyl_${Math.floor(100000000 + Math.random() * 900000000)}.${Math.floor(Date.now() / 1000)}`;
      const sessionId = `${Math.floor(Date.now() / 1000)}`;

      // Build standard GA4 Measurement Protocol payload
      const gaPayload = {
        client_id: clientId,
        non_personalized_ads: false,
        events: [
          {
            name: "page_view",
            params: {
              page_location: targetUrl,
              page_title: pageTitle,
              session_id: sessionId,
              engagement_time_msec: dwellSeconds * 1000,
              traffic_type: "organic_stealth",
              campaign_source: "google",
              campaign_medium: "organic"
            }
          },
          {
            name: "scroll",
            params: {
              percent_scrolled: 90,
              session_id: sessionId,
              page_location: targetUrl
            }
          },
          {
            name: "user_engagement",
            params: {
              engagement_time_msec: dwellSeconds * 1000,
              session_id: sessionId
            }
          }
        ]
      };

      // Query Google Analytics 4 Measurement Protocol
      let debugUrl = `https://www.google-analytics.com/debug/mp/collect?measurement_id=${encodeURIComponent(cleanId)}`;
      let collectUrl = `https://www.google-analytics.com/mp/collect?measurement_id=${encodeURIComponent(cleanId)}`;
      
      if (apiSecret && typeof apiSecret === 'string' && apiSecret.trim()) {
        const cleanSecret = apiSecret.trim();
        debugUrl += `&api_secret=${encodeURIComponent(cleanSecret)}`;
        collectUrl += `&api_secret=${encodeURIComponent(cleanSecret)}`;
      }

      let validationMessages: any[] = [];
      try {
        const debugResp = await fetch(debugUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(gaPayload)
        });
        if (debugResp.ok) {
          const debugData = await debugResp.json();
          validationMessages = debugData.validationMessages || [];
        }
      } catch (dbgErr) {
        console.warn("[GA4 Debug Verification Note]:", dbgErr);
      }

      // Send live hit to production Google Analytics endpoint
      let dispatchStatus = 204;
      try {
        const liveResp = await fetch(collectUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(gaPayload)
        });
        dispatchStatus = liveResp.status;
      } catch (liveErr: any) {
        console.warn("[GA4 Live Dispatch]:", liveErr.message);
      }

      return res.json({
        success: true,
        measurementId: cleanId,
        clientId,
        sessionId,
        dispatchStatus,
        events: ["page_view", "scroll (90%)", "user_engagement"],
        validationMessages,
        dwellSeconds,
        targetUrl,
        timestamp: new Date().toISOString(),
        message: `Realtime hit dispatched to Google Analytics ID ${cleanId}! Check your GA4 'Realtime' report under 'Users in last 30 minutes'.`
      });
    } catch (err: any) {
      console.error("[GA4 Test Hit Error]:", err);
      return res.status(500).json({ 
        success: false, 
        error: `Failed to dispatch GA4 test hit: ${err.message}` 
      });
    }
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
