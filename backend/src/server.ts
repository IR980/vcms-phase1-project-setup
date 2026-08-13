import http from "http";

import app from "./app";

import { connectDB, disconnectDB } from "./config/db";

import { env } from "./config/env";

import dotenv from "dotenv";

dotenv.config();

/**
 * ============================================================
 * SERVER
 * ============================================================
 */

let server: http.Server;

let isShuttingDown = false;

/**
 * ============================================================
 * BOOTSTRAP APPLICATION
 * ============================================================
 */

const bootstrap = async (): Promise<void> => {
  try {
    /**
     * --------------------------------------------------------
     * DATABASE
     * --------------------------------------------------------
     */

    await connectDB();

    /**
     * --------------------------------------------------------
     * HTTP SERVER
     * --------------------------------------------------------
     */

    server = http.createServer(app);

    /**
     * --------------------------------------------------------
     * SERVER TIMEOUTS
     * --------------------------------------------------------
     */

    server.keepAliveTimeout = 65_000;

    server.headersTimeout = 66_000;

    server.requestTimeout = 60_000;

    /**
     * --------------------------------------------------------
     * START SERVER
     * --------------------------------------------------------
     *
     * 0.0.0.0 is important for Render / container platforms.
     */

    server.listen(env.PORT, "0.0.0.0", () => {
      console.log("==========================================");

      console.log("🚀 Vehicle Compliance Management System");

      console.log("==========================================");

      console.log(`Environment : ${env.NODE_ENV}`);

      console.log(`Port        : ${env.PORT}`);

      console.log(`Host        : 0.0.0.0`);

      console.log(`API         : /api/v1`);

      console.log(`Health      : /api/v1/health`);

      console.log("==========================================");
    });
  } catch (error) {
    console.error("❌ Application startup failed");

    console.error(error);

    process.exit(1);
  }
};

/**
 * ============================================================
 * GRACEFUL SHUTDOWN
 * ============================================================
 */

const shutdown = async (signal: string, exitCode = 0): Promise<void> => {
  /**
   * Prevent shutdown from executing twice.
   */
  if (isShuttingDown) {
    return;
  }

  isShuttingDown = true;

  console.log(`\n${signal} received. Closing application...`);

  try {
    /**
     * --------------------------------------------------------
     * HTTP SERVER
     * --------------------------------------------------------
     */

    if (server) {
      await new Promise<void>((resolve, reject) => {
        server.close((error) => {
          if (error) {
            reject(error);

            return;
          }

          resolve();
        });
      });

      console.log("✅ HTTP Server Closed");
    }

    /**
     * --------------------------------------------------------
     * DATABASE
     * --------------------------------------------------------
     */

    await disconnectDB();

    console.log("✅ MongoDB Connection Closed");

    process.exit(exitCode);
  } catch (error) {
    console.error("❌ Shutdown Error:", error);

    process.exit(1);
  }
};

/**
 * ============================================================
 * PROCESS SIGNALS
 * ============================================================
 */

process.on("SIGINT", () => {
  void shutdown("SIGINT");
});

process.on("SIGTERM", () => {
  void shutdown("SIGTERM");
});

/**
 * ============================================================
 * UNCAUGHT EXCEPTION
 * ============================================================
 */

process.on("uncaughtException", (error) => {
  console.error("❌ Uncaught Exception");

  console.error(error);

  void shutdown("uncaughtException", 1);
});

/**
 * ============================================================
 * UNHANDLED PROMISE REJECTION
 * ============================================================
 */

process.on("unhandledRejection", (reason) => {
  console.error("❌ Unhandled Promise Rejection");

  console.error(reason);

  void shutdown("unhandledRejection", 1);
});

/**
 * ============================================================
 * BOOTSTRAP
 * ============================================================
 */

void bootstrap();
