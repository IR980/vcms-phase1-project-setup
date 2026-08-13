/**
 * ============================================================
 * EXPIRY ROUTES
 * ============================================================
 *
 * Phase 7 — Expiry Detection Engine
 *
 * Base path:
 *
 * /api/v1/expiry
 *
 * Business logic:
 *
 * routes
 *   ↓
 * controller
 *   ↓
 * service
 *   ↓
 * calculator
 *   ↓
 * MongoDB
 */

import { Router } from "express";

import {
  getExpiryDocuments,
  getDocumentExpiry,
  getExpirySummary,
  getExpiryDashboard,
  getExpiredDocuments,
  getExpiringToday,
  getExpiringWithin7Days,
  getExpiringWithin15Days,
  getExpiringWithin30Days,
  getValidDocuments,
  getReminderCandidates,
  processDocument,
  processAllDocuments,
} from "../controllers/expiry.controller";

/**
 * ============================================================
 * ROUTER
 * ============================================================
 */
const router = Router();

/**
 * ============================================================
 * EXPIRY DASHBOARD
 * ============================================================
 *
 * GET /api/v1/expiry/dashboard
 *
 * Returns:
 *
 * - summary
 * - critical documents
 * - upcoming documents
 * - calculatedAt
 *
 * IMPORTANT:
 *
 * Keep this route BEFORE:
 *
 * /document/:id
 *
 * to avoid route ambiguity.
 */
router.get("/dashboard", getExpiryDashboard);

/**
 * ============================================================
 * EXPIRY SUMMARY
 * ============================================================
 *
 * GET /api/v1/expiry/summary
 */
router.get("/summary", getExpirySummary);

/**
 * ============================================================
 * EXPIRED DOCUMENTS
 * ============================================================
 *
 * GET /api/v1/expiry/expired
 *
 * Optional:
 *
 * ?companyId=<ObjectId>
 * ?limit=50
 */
router.get("/expired", getExpiredDocuments);

/**
 * ============================================================
 * EXPIRING TODAY
 * ============================================================
 *
 * GET /api/v1/expiry/today
 */
router.get("/today", getExpiringToday);

/**
 * ============================================================
 * EXPIRING WITHIN 7 DAYS
 * ============================================================
 *
 * GET /api/v1/expiry/7-days
 */
router.get("/7-days", getExpiringWithin7Days);

/**
 * ============================================================
 * EXPIRING WITHIN 15 DAYS
 * ============================================================
 *
 * GET /api/v1/expiry/15-days
 */
router.get("/15-days", getExpiringWithin15Days);

/**
 * ============================================================
 * EXPIRING WITHIN 30 DAYS
 * ============================================================
 *
 * GET /api/v1/expiry/30-days
 */
router.get("/30-days", getExpiringWithin30Days);

/**
 * ============================================================
 * VALID DOCUMENTS
 * ============================================================
 *
 * GET /api/v1/expiry/valid
 */
router.get("/valid", getValidDocuments);

/**
 * ============================================================
 * REMINDER CANDIDATES
 * ============================================================
 *
 * GET /api/v1/expiry/reminder-candidates
 *
 * Phase 7 identifies candidates.
 *
 * Phase 8 will send notifications.
 */
router.get("/reminder-candidates", getReminderCandidates);

/**
 * ============================================================
 * PROCESS ALL DOCUMENTS
 * ============================================================
 *
 * GET /api/v1/expiry/process
 *
 * Optional:
 *
 * ?companyId=<ObjectId>
 *
 * Used for:
 *
 * - testing
 * - admin operation
 * - future scheduled job
 */
router.get("/process", processAllDocuments);

/**
 * ============================================================
 * GET ALL EXPIRY DOCUMENTS
 * ============================================================
 *
 * GET /api/v1/expiry
 *
 * Examples:
 *
 * GET /api/v1/expiry
 *
 * GET /api/v1/expiry?page=1&limit=20
 *
 * GET /api/v1/expiry?companyId=<ObjectId>
 *
 * GET /api/v1/expiry?status=expired
 *
 * GET /api/v1/expiry?vehicleId=<ObjectId>
 *
 * GET /api/v1/expiry?documentType=puc
 */
router.get("/", getExpiryDocuments);

/**
 * ============================================================
 * SINGLE DOCUMENT EXPIRY
 * ============================================================
 *
 * GET /api/v1/expiry/document/:id
 *
 * Example:
 *
 * GET /api/v1/expiry/document/68a123456789012345678901
 */
router.get("/document/:id", getDocumentExpiry);

/**
 * ============================================================
 * PROCESS SINGLE DOCUMENT
 * ============================================================
 *
 * GET /api/v1/expiry/process/:id
 *
 * Example:
 *
 * GET /api/v1/expiry/process/68a123456789012345678901
 *
 * IMPORTANT:
 *
 * This route must come AFTER:
 *
 * /process
 *
 * because Express matches routes from top to bottom.
 */
router.get("/process/:id", processDocument);

/**
 * ============================================================
 * EXPORT
 * ============================================================
 */
export default router;
