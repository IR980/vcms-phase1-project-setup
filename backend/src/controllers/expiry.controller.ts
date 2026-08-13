/**
 * ============================================================
 * EXPIRY CONTROLLER
 * ============================================================
 *
 * Phase 7 — Expiry Detection Engine
 *
 * Responsibility:
 *
 * 1. Receive HTTP requests
 * 2. Read query parameters / route parameters
 * 3. Call expiryService
 * 4. Return standardized API responses
 *
 * IMPORTANT:
 *
 * Business logic does NOT belong here.
 * All expiry calculations are handled by expiry.service.ts.
 */

import type { Request, Response } from "express";

import expiryService from "../services/expiry.service";

import { EXPIRY_STATUS } from "../config/expiry";

import type {
  ExpiryQueryFilter,
  ExpiryListOptions,
} from "../types/expiry.types";

import { ApiResponse } from "../utils/ApiResponse";

import { ApiError } from "../utils/ApiError";

/**
 * ============================================================
 * HELPER FUNCTIONS
 * ============================================================
 */

/**
 * Convert query value to string.
 */
const getQueryString = (value: unknown): string | undefined => {
  if (typeof value === "string" && value.trim().length > 0) {
    return value.trim();
  }

  return undefined;
};

/**
 * Convert query value to positive integer.
 */
const getPositiveInteger = (value: unknown, defaultValue: number): number => {
  if (typeof value !== "string") {
    return defaultValue;
  }

  const parsed = Number.parseInt(value, 10);

  if (Number.isNaN(parsed) || parsed < 1) {
    return defaultValue;
  }

  return parsed;
};

/**
 * Convert query value to boolean.
 */
const getBoolean = (value: unknown): boolean | undefined => {
  if (typeof value !== "string") {
    return undefined;
  }

  const normalized = value.trim().toLowerCase();

  if (normalized === "true") {
    return true;
  }

  if (normalized === "false") {
    return false;
  }

  return undefined;
};

/**
 * Convert query value to number.
 */
const getNumber = (value: unknown): number | undefined => {
  if (typeof value !== "string") {
    return undefined;
  }

  const parsed = Number(value);

  if (Number.isNaN(parsed)) {
    return undefined;
  }

  return parsed;
};

/**
 * ============================================================
 * BUILD EXPIRY FILTER
 * ============================================================
 */
const buildExpiryFilter = (req: Request): ExpiryQueryFilter => {
  const query = req.query;

  const filter: ExpiryQueryFilter = {};

  /**
   * Company.
   */
  const companyId = getQueryString(query.companyId);

  if (companyId) {
    filter.companyId = companyId;
  }

  /**
   * Vehicle.
   */
  const vehicleId = getQueryString(query.vehicleId);

  if (vehicleId) {
    filter.vehicleId = vehicleId;
  }

  /**
   * Driver.
   */
  const driverId = getQueryString(query.driverId);

  if (driverId) {
    filter.driverId = driverId;
  }

  /**
   * Document type.
   */
  const documentType = getQueryString(query.documentType);

  if (documentType) {
    filter.documentType = documentType as ExpiryQueryFilter["documentType"];
  }

  /**
   * Owner type.
   */
  const ownerType = getQueryString(query.ownerType);

  if (ownerType) {
    filter.ownerType = ownerType as ExpiryQueryFilter["ownerType"];
  }

  /**
   * Expiry status.
   */
  const status = getQueryString(query.status);

  if (status) {
    filter.status = status as ExpiryQueryFilter["status"];
  }

  /**
   * Include expired.
   */
  const includeExpired = getBoolean(query.includeExpired);

  if (includeExpired !== undefined) {
    filter.includeExpired = includeExpired;
  }

  /**
   * Include rejected.
   */
  const includeRejected = getBoolean(query.includeRejected);

  if (includeRejected !== undefined) {
    filter.includeRejected = includeRejected;
  }

  /**
   * Minimum days remaining.
   */
  const minDaysRemaining = getNumber(query.minDaysRemaining);

  if (minDaysRemaining !== undefined) {
    filter.minDaysRemaining = minDaysRemaining;
  }

  /**
   * Maximum days remaining.
   */
  const maxDaysRemaining = getNumber(query.maxDaysRemaining);

  if (maxDaysRemaining !== undefined) {
    filter.maxDaysRemaining = maxDaysRemaining;
  }

  return filter;
};

/**
 * ============================================================
 * GET EXPIRY DOCUMENTS
 * ============================================================
 *
 * GET /api/v1/expiry
 *
 * Example:
 *
 * GET /api/v1/expiry?page=1&limit=20
 *
 * GET /api/v1/expiry?companyId=...
 *
 * GET /api/v1/expiry?status=expired
 *
 * GET /api/v1/expiry?vehicleId=...
 */
export const getExpiryDocuments = async (req: Request, res: Response) => {
  const page = getPositiveInteger(req.query.page, 1);

  const limit = Math.min(getPositiveInteger(req.query.limit, 20), 100);

  const sortOrder = getQueryString(req.query.sortOrder);

  if (sortOrder && sortOrder !== "asc" && sortOrder !== "desc") {
    throw new ApiError(400, "sortOrder must be either asc or desc");
  }

  const filter = buildExpiryFilter(req);

  const options: ExpiryListOptions = {
    page,

    limit,

    filter,

    sortOrder: sortOrder as "asc" | "desc" | undefined,
  };

  const result = await expiryService.getExpiryDocuments(options);

  return res
    .status(200)
    .json(
      new ApiResponse(200, "Expiry documents fetched successfully", result),
    );
};

/**
 * ============================================================
 * GET SINGLE DOCUMENT EXPIRY
 * ============================================================
 *
 * GET /api/v1/expiry/document/:id
 */
export const getDocumentExpiry = async (req: Request, res: Response) => {
  const documentId = req.params.id;

  if (!documentId || typeof documentId !== "string") {
    throw new ApiError(400, "Document ID is required");
  }

  const result = await expiryService.getDocumentExpiry(documentId);

  return res
    .status(200)
    .json(
      new ApiResponse(200, "Document expiry calculated successfully", result),
    );
};

/**
 * ============================================================
 * GET EXPIRY SUMMARY
 * ============================================================
 *
 * GET /api/v1/expiry/summary
 *
 * Optional:
 *
 * ?companyId=...
 */
export const getExpirySummary = async (req: Request, res: Response) => {
  const companyId = getQueryString(req.query.companyId);

  const result = await expiryService.getExpirySummary(companyId);

  return res
    .status(200)
    .json(new ApiResponse(200, "Expiry summary fetched successfully", result));
};

/**
 * ============================================================
 * GET EXPIRY DASHBOARD
 * ============================================================
 *
 * GET /api/v1/expiry/dashboard
 */
export const getExpiryDashboard = async (req: Request, res: Response) => {
  const companyId = getQueryString(req.query.companyId);

  const result = await expiryService.getExpiryDashboard(companyId);

  return res
    .status(200)
    .json(
      new ApiResponse(200, "Expiry dashboard fetched successfully", result),
    );
};

/**
 * ============================================================
 * GET EXPIRED DOCUMENTS
 * ============================================================
 *
 * GET /api/v1/expiry/expired
 */
export const getExpiredDocuments = async (req: Request, res: Response) => {
  const companyId = getQueryString(req.query.companyId);

  const limit = Math.min(getPositiveInteger(req.query.limit, 50), 100);

  const result = await expiryService.getExpiredDocuments(companyId, limit);

  return res
    .status(200)
    .json(
      new ApiResponse(200, "Expired documents fetched successfully", result),
    );
};

/**
 * ============================================================
 * GET EXPIRING TODAY
 * ============================================================
 *
 * GET /api/v1/expiry/today
 */
export const getExpiringToday = async (req: Request, res: Response) => {
  const companyId = getQueryString(req.query.companyId);

  const limit = Math.min(getPositiveInteger(req.query.limit, 50), 100);

  const result = await expiryService.getExpiringToday(companyId, limit);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "Documents expiring today fetched successfully",
        result,
      ),
    );
};

/**
 * ============================================================
 * GET EXPIRING WITHIN 7 DAYS
 * ============================================================
 *
 * GET /api/v1/expiry/7-days
 */
export const getExpiringWithin7Days = async (req: Request, res: Response) => {
  const companyId = getQueryString(req.query.companyId);

  const limit = Math.min(getPositiveInteger(req.query.limit, 50), 100);

  const result = await expiryService.getExpiringWithin7Days(companyId, limit);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "Documents expiring within 7 days fetched successfully",
        result,
      ),
    );
};

/**
 * ============================================================
 * GET EXPIRING WITHIN 15 DAYS
 * ============================================================
 *
 * GET /api/v1/expiry/15-days
 */
export const getExpiringWithin15Days = async (req: Request, res: Response) => {
  const companyId = getQueryString(req.query.companyId);

  const limit = Math.min(getPositiveInteger(req.query.limit, 50), 100);

  const result = await expiryService.getExpiringWithin15Days(companyId, limit);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "Documents expiring within 15 days fetched successfully",
        result,
      ),
    );
};

/**
 * ============================================================
 * GET EXPIRING WITHIN 30 DAYS
 * ============================================================
 *
 * GET /api/v1/expiry/30-days
 */
export const getExpiringWithin30Days = async (req: Request, res: Response) => {
  const companyId = getQueryString(req.query.companyId);

  const limit = Math.min(getPositiveInteger(req.query.limit, 50), 100);

  const result = await expiryService.getExpiringWithin30Days(companyId, limit);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "Documents expiring within 30 days fetched successfully",
        result,
      ),
    );
};

/**
 * ============================================================
 * GET VALID DOCUMENTS
 * ============================================================
 *
 * GET /api/v1/expiry/valid
 */
export const getValidDocuments = async (req: Request, res: Response) => {
  const companyId = getQueryString(req.query.companyId);

  const limit = Math.min(getPositiveInteger(req.query.limit, 50), 100);

  const result = await expiryService.getValidDocuments(companyId, limit);

  return res
    .status(200)
    .json(new ApiResponse(200, "Valid documents fetched successfully", result));
};

/**
 * ============================================================
 * GET REMINDER CANDIDATES
 * ============================================================
 *
 * GET /api/v1/expiry/reminder-candidates
 *
 * This endpoint only identifies documents that need
 * notification.
 *
 * It does NOT send notifications.
 */
export const getReminderCandidates = async (req: Request, res: Response) => {
  const companyId = getQueryString(req.query.companyId);

  const result = await expiryService.getReminderCandidates(companyId);

  return res
    .status(200)
    .json(
      new ApiResponse(200, "Reminder candidates fetched successfully", result),
    );
};

/**
 * ============================================================
 * PROCESS SINGLE DOCUMENT
 * ============================================================
 *
 * GET /api/v1/expiry/process/:id
 *
 * Useful for testing/debugging a single document.
 */
export const processDocument = async (req: Request, res: Response) => {
  const documentId = req.params.id;

  if (!documentId || typeof documentId !== "string") {
    throw new ApiError(400, "Document ID is required");
  }

  const result = await expiryService.processDocument(documentId);

  return res
    .status(200)
    .json(
      new ApiResponse(200, "Document expiry processed successfully", result),
    );
};

/**
 * ============================================================
 * PROCESS ALL DOCUMENTS
 * ============================================================
 *
 * GET /api/v1/expiry/process
 *
 * Optional:
 *
 * ?companyId=...
 *
 * This endpoint is mainly useful for:
 *
 * - Admin dashboard
 * - Manual testing
 * - Future cron/job integration
 */
export const processAllDocuments = async (req: Request, res: Response) => {
  const companyId = getQueryString(req.query.companyId);

  const result = await expiryService.processAllDocuments(companyId);

  return res
    .status(200)
    .json(
      new ApiResponse(200, "Expiry processing completed successfully", result),
    );
};
