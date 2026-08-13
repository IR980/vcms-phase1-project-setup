import "express-async-errors";
import "dotenv/config";
import "./config/cloudinary";
import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { randomUUID } from "crypto";
import dotenv from "dotenv";

dotenv.config();
import { env } from "@config/env";

import { errorHandler, notFoundHandler } from "@middleware/errorHandler";

import healthRoutes from "@routes/health.routes";
import authRoutes from "@routes/auth.routes";
import companyRoutes from "@routes/company.routes";

// Future Routes
import vehicleRoutes from "@routes/vehicle.routes";
import driverRoutes from "@routes/driver.routes";
import documentRoutes from "./routes/document.routes";
import documentComplianceRoutes from "./routes/documentCompliance.routes";
import expiryRoutes from "./routes/expiry.routes";
const app: Application = express();

/**
 * Trust Proxy
 * Required for Render / Railway / Nginx
 */
app.set("trust proxy", 1);

/**
 * Hide Express Header
 */
app.disable("x-powered-by");

/**
 * Request ID Middleware
 */
app.use((req, res, next) => {
  const requestId = randomUUID();

  req.headers["x-request-id"] = requestId;
  res.setHeader("x-request-id", requestId);

  next();
});

/**
 * Security
 */
app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: "cross-origin",
    },
  }),
);

/**
 * CORS
 */
app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

/**
 * Rate Limiter
 */
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: env.NODE_ENV === "production" ? 300 : 1000,
    standardHeaders: true,
    legacyHeaders: false,
  }),
);

/**
 * Compression
 */
app.use(compression());

/**
 * Body Parser
 */
app.disable("etag");
app.use(
  express.json({
    limit: "10mb",
  }),
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "10mb",
  }),
);
app.use("/api", (_req, res, next) => {
  res.setHeader(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate",
  );

  res.setHeader("Pragma", "no-cache");

  res.setHeader("Expires", "0");

  next();
});

/**
 * Cookies
 */
app.use(cookieParser());

/**
 * Logger
 */
if (env.NODE_ENV !== "test") {
  app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));
}

/**
 * Health
 */
app.use("/api/v1/health", healthRoutes);

/**
 * Authentication
 */
app.use("/api/v1/auth", authRoutes);

/**
 * Company
 */
app.use("/api/v1/companies", companyRoutes);

/**
 * vehicle
 */
app.use("/api/v1/vehicles", vehicleRoutes);

// driver
app.use("/api/v1/drivers", driverRoutes);
app.use("/api/v1/documents", documentRoutes);
app.use("/api/v1/expiry", expiryRoutes);
app.use("/api/v1/document-compliance", documentComplianceRoutes);
/**
 * 404 Handler
 */
app.use(notFoundHandler);

/**
 * Global Error Handler
 */
app.use(errorHandler);

export default app;
