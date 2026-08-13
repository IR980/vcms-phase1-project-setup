import { Router } from "express";

import documentComplianceController from "../controllers/documentCompliance.controller";

/**
 * ============================================================
 * DOCUMENT COMPLIANCE ROUTES
 * ============================================================
 *
 * PHASE 8 — DOCUMENT COMPLIANCE & EXPIRY MONITORING
 *
 * Base path will be registered from app.ts:
 *
 * /api/v1/document-compliance
 *
 * Therefore:
 *
 * GET /api/v1/document-compliance/summary
 * GET /api/v1/document-compliance/company
 * GET /api/v1/document-compliance/expiring
 * GET /api/v1/document-compliance/expired
 * GET /api/v1/document-compliance/valid
 * GET /api/v1/document-compliance/no-expiry
 * GET /api/v1/document-compliance/ocr-pending
 * GET /api/v1/document-compliance/critical
 * GET /api/v1/document-compliance/vehicle/:vehicleId
 * GET /api/v1/document-compliance/driver/:driverId
 */

const router = Router();

/**
 * ============================================================
 * COMPANY COMPLIANCE SUMMARY
 * ============================================================
 *
 * GET
 *
 * /api/v1/document-compliance/summary
 *
 * Query:
 *
 * ?companyId=<MongoDB ObjectId>
 */
router.get("/summary", documentComplianceController.getComplianceSummary);

/**
 * ============================================================
 * COMPANY COMPLIANCE
 * ============================================================
 *
 * GET
 *
 * /api/v1/document-compliance/company
 *
 * Query:
 *
 * ?companyId=<MongoDB ObjectId>
 *
 * Returns:
 *
 * - summary
 * - expired
 * - expiringSoon
 * - noExpiry
 */
router.get("/company", documentComplianceController.getCompanyCompliance);

/**
 * ============================================================
 * EXPIRING DOCUMENTS
 * ============================================================
 *
 * GET
 *
 * /api/v1/document-compliance/expiring
 *
 * Query example:
 *
 * ?companyId=...
 * &days=30
 * &page=1
 * &limit=20
 */
router.get("/expiring", documentComplianceController.getExpiringDocuments);

/**
 * ============================================================
 * EXPIRED DOCUMENTS
 * ============================================================
 *
 * GET
 *
 * /api/v1/document-compliance/expired
 *
 * Query:
 *
 * ?companyId=...
 * &page=1
 * &limit=20
 */
router.get("/expired", documentComplianceController.getExpiredDocuments);

/**
 * ============================================================
 * VALID DOCUMENTS
 * ============================================================
 *
 * GET
 *
 * /api/v1/document-compliance/valid
 *
 * Query:
 *
 * ?companyId=...
 * &days=30
 * &page=1
 * &limit=20
 */
router.get("/valid", documentComplianceController.getValidDocuments);

/**
 * ============================================================
 * DOCUMENTS WITHOUT EXPIRY
 * ============================================================
 *
 * GET
 *
 * /api/v1/document-compliance/no-expiry
 *
 * Useful for:
 *
 * - OCR failed
 * - expiry not detected
 * - manual review
 */
router.get(
  "/no-expiry",
  documentComplianceController.getDocumentsWithoutExpiry,
);

/**
 * ============================================================
 * OCR PENDING DOCUMENTS
 * ============================================================
 *
 * GET
 *
 * /api/v1/document-compliance/ocr-pending
 *
 * Returns documents where:
 *
 * isOcrProcessed = false
 */
router.get("/ocr-pending", documentComplianceController.getOCRPendingDocuments);

/**
 * ============================================================
 * CRITICAL DOCUMENTS
 * ============================================================
 *
 * GET
 *
 * /api/v1/document-compliance/critical
 *
 * Critical:
 *
 * - Already expired
 * - Expiring within 7 days
 *
 * Query:
 *
 * ?companyId=...
 * &limit=20
 */
router.get("/critical", documentComplianceController.getCriticalDocuments);

/**
 * ============================================================
 * VEHICLE COMPLIANCE
 * ============================================================
 *
 * IMPORTANT:
 *
 * Keep this route before any generic /:id route if one is
 * added later.
 *
 * GET
 *
 * /api/v1/document-compliance/vehicle/:vehicleId
 *
 * Query:
 *
 * ?companyId=<MongoDB ObjectId>
 */
router.get(
  "/vehicle/:vehicleId",
  documentComplianceController.getVehicleCompliance,
);

/**
 * ============================================================
 * DRIVER COMPLIANCE
 * ============================================================
 *
 * GET
 *
 * /api/v1/document-compliance/driver/:driverId
 *
 * Query:
 *
 * ?companyId=<MongoDB ObjectId>
 */
router.get(
  "/driver/:driverId",
  documentComplianceController.getDriverCompliance,
);

/**
 * ============================================================
 * EXPORT ROUTER
 * ============================================================
 */

export default router;
