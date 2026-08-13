import { Request, Response } from "express";

import documentComplianceService from "../services/documentCompliance.service";

import {
  ComplianceSummaryDto,
  ComplianceListResponseDto,
  VehicleComplianceDto,
  DriverComplianceDto,
  CompanyComplianceDto,
  ComplianceDocumentDto,
} from "../types/compliance.dto";

import {
  expiringDocumentsQuerySchema,
  expiredDocumentsQuerySchema,
  validDocumentsQuerySchema,
  documentsWithoutExpiryQuerySchema,
  ocrPendingDocumentsQuerySchema,
  criticalDocumentsQuerySchema,
} from "../utils/validation/compliance.validation";

import { ApiError } from "../utils/ApiError";

/**
 * ============================================================
 * DOCUMENT COMPLIANCE CONTROLLER
 * ============================================================
 *
 * PHASE 8 — DOCUMENT COMPLIANCE & EXPIRY MONITORING
 *
 * Controller responsibilities:
 *
 * Request
 *    ↓
 * Validate
 *    ↓
 * Service
 *    ↓
 * Response
 *
 * Business logic remains inside:
 *
 * documentCompliance.service.ts
 */

/**
 * ============================================================
 * HELPERS
 * ============================================================
 */

/**
 * Get company ID.
 *
 * Current implementation expects companyId in query params
 * for compliance endpoints.
 *
 * Example:
 *
 * GET /api/v1/document-compliance/summary?companyId=...
 */
const getCompanyIdFromQuery = (req: Request): string => {
  const companyId = req.query.companyId;

  if (typeof companyId !== "string") {
    throw new ApiError(400, "companyId is required");
  }

  return companyId;
};

/**
 * Convert unknown query value into string.
 */
const getQueryString = (value: unknown): string | undefined => {
  if (typeof value === "string") {
    return value;
  }

  return undefined;
};

/**
 * ============================================================
 * GET COMPLIANCE SUMMARY
 * ============================================================
 *
 * GET
 *
 * /api/v1/document-compliance/summary
 *
 * Query:
 *
 * ?companyId=<MongoDB ObjectId>
 *
 * Response:
 *
 * {
 *   success: true,
 *   message: "...",
 *   data: {
 *     totalDocuments: 20,
 *     valid: 12,
 *     expiringSoon: 5,
 *     expired: 2,
 *     noExpiry: 1,
 *     ...
 *   }
 * }
 */
export const getComplianceSummary = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const companyId = getCompanyIdFromQuery(req);

  const summary =
    await documentComplianceService.getComplianceSummary(companyId);

  const data: ComplianceSummaryDto = summary;

  res.status(200).json({
    success: true,

    message: "Document compliance summary fetched successfully",

    data,
  });
};

/**
 * ============================================================
 * GET EXPIRING DOCUMENTS
 * ============================================================
 *
 * GET
 *
 * /api/v1/document-compliance/expiring
 *
 * Query:
 *
 * ?companyId=...
 * &days=30
 * &page=1
 * &limit=20
 * &documentType=puc
 * &ownerType=vehicle
 * &vehicleId=...
 */
export const getExpiringDocuments = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const companyId = getCompanyIdFromQuery(req);

  /**
   * Validation.
   */
  const parsed = expiringDocumentsQuerySchema.safeParse(req.query);

  if (!parsed.success) {
    throw new ApiError(
      400,
      "Invalid expiring documents query",
      parsed.error.flatten(),
    );
  }

  const query = parsed.data;

  const result = await documentComplianceService.getExpiringDocuments(
    companyId,
    {
      days: query.days,

      page: query.page,

      limit: query.limit,

      documentType: query.documentType,

      ownerType: query.ownerType,

      vehicleId: query.vehicleId,

      driverId: query.driverId,
    },
  );

  const data: ComplianceListResponseDto = result;

  res.status(200).json({
    success: true,

    message: "Expiring documents fetched successfully",

    data,
  });
};

/**
 * ============================================================
 * GET EXPIRED DOCUMENTS
 * ============================================================
 *
 * GET
 *
 * /api/v1/document-compliance/expired
 */
export const getExpiredDocuments = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const companyId = getCompanyIdFromQuery(req);

  const parsed = expiredDocumentsQuerySchema.safeParse(req.query);

  if (!parsed.success) {
    throw new ApiError(
      400,
      "Invalid expired documents query",
      parsed.error.flatten(),
    );
  }

  const query = parsed.data;

  const result = await documentComplianceService.getExpiredDocuments(
    companyId,
    {
      page: query.page,

      limit: query.limit,

      documentType: query.documentType,

      ownerType: query.ownerType,

      vehicleId: query.vehicleId,

      driverId: query.driverId,
    },
  );

  const data: ComplianceListResponseDto = result;

  res.status(200).json({
    success: true,

    message: "Expired documents fetched successfully",

    data,
  });
};

/**
 * ============================================================
 * GET VALID DOCUMENTS
 * ============================================================
 *
 * GET
 *
 * /api/v1/document-compliance/valid
 */
export const getValidDocuments = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const companyId = getCompanyIdFromQuery(req);

  const parsed = validDocumentsQuerySchema.safeParse(req.query);

  if (!parsed.success) {
    throw new ApiError(
      400,
      "Invalid valid-documents query",
      parsed.error.flatten(),
    );
  }

  const query = parsed.data;

  const result = await documentComplianceService.getValidDocuments(companyId, {
    days: query.days,

    page: query.page,

    limit: query.limit,

    documentType: query.documentType,

    ownerType: query.ownerType,

    vehicleId: query.vehicleId,

    driverId: query.driverId,
  });

  const data: ComplianceListResponseDto = result;

  res.status(200).json({
    success: true,

    message: "Valid documents fetched successfully",

    data,
  });
};

/**
 * ============================================================
 * GET DOCUMENTS WITHOUT EXPIRY
 * ============================================================
 *
 * GET
 *
 * /api/v1/document-compliance/no-expiry
 */
export const getDocumentsWithoutExpiry = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const companyId = getCompanyIdFromQuery(req);

  const parsed = documentsWithoutExpiryQuerySchema.safeParse(req.query);

  if (!parsed.success) {
    throw new ApiError(400, "Invalid no-expiry query", parsed.error.flatten());
  }

  const query = parsed.data;

  const result = await documentComplianceService.getDocumentsWithoutExpiry(
    companyId,
    {
      page: query.page,

      limit: query.limit,
    },
  );

  const data: ComplianceListResponseDto = result;

  res.status(200).json({
    success: true,

    message: "Documents without expiry fetched successfully",

    data,
  });
};

/**
 * ============================================================
 * GET OCR PENDING DOCUMENTS
 * ============================================================
 *
 * GET
 *
 * /api/v1/document-compliance/ocr-pending
 */
export const getOCRPendingDocuments = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const companyId = getCompanyIdFromQuery(req);

  const parsed = ocrPendingDocumentsQuerySchema.safeParse(req.query);

  if (!parsed.success) {
    throw new ApiError(
      400,
      "Invalid OCR pending query",
      parsed.error.flatten(),
    );
  }

  const query = parsed.data;

  const result = await documentComplianceService.getOCRPendingDocuments(
    companyId,
    {
      page: query.page,

      limit: query.limit,
    },
  );

  const data: ComplianceListResponseDto = result;

  res.status(200).json({
    success: true,

    message: "OCR pending documents fetched successfully",

    data,
  });
};

/**
 * ============================================================
 * GET VEHICLE COMPLIANCE
 * ============================================================
 *
 * GET
 *
 * /api/v1/document-compliance/vehicle/:vehicleId
 *
 * Query:
 *
 * ?companyId=<MongoDB ObjectId>
 */
export const getVehicleCompliance = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const companyId = getCompanyIdFromQuery(req);

  const vehicleId = getQueryString(req.params.vehicleId);

  if (!vehicleId) {
    throw new ApiError(400, "vehicleId is required");
  }

  /**
   * Validate vehicle ID.
   *
   * Service also validates it, but doing this here gives
   * a clear controller-level contract.
   */
  if (!/^[0-9a-fA-F]{24}$/.test(vehicleId)) {
    throw new ApiError(400, "Invalid vehicle ID");
  }

  const result = await documentComplianceService.getVehicleCompliance(
    companyId,
    vehicleId,
  );

  const data: VehicleComplianceDto = result;

  res.status(200).json({
    success: true,

    message: "Vehicle compliance fetched successfully",

    data,
  });
};

/**
 * ============================================================
 * GET DRIVER COMPLIANCE
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
export const getDriverCompliance = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const companyId = getCompanyIdFromQuery(req);

  const driverId = getQueryString(req.params.driverId);

  if (!driverId) {
    throw new ApiError(400, "driverId is required");
  }

  if (!/^[0-9a-fA-F]{24}$/.test(driverId)) {
    throw new ApiError(400, "Invalid driver ID");
  }

  const result = await documentComplianceService.getDriverCompliance(
    companyId,
    driverId,
  );

  const data: DriverComplianceDto = result;

  res.status(200).json({
    success: true,

    message: "Driver compliance fetched successfully",

    data,
  });
};

/**
 * ============================================================
 * GET COMPANY COMPLIANCE
 * ============================================================
 *
 * GET
 *
 * /api/v1/document-compliance/company
 *
 * Query:
 *
 * ?companyId=<MongoDB ObjectId>
 */
export const getCompanyCompliance = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const companyId = getCompanyIdFromQuery(req);

  const result =
    await documentComplianceService.getCompanyCompliance(companyId);

  const data: CompanyComplianceDto = result;

  res.status(200).json({
    success: true,

    message: "Company compliance fetched successfully",

    data,
  });
};

/**
 * ============================================================
 * GET CRITICAL DOCUMENTS
 * ============================================================
 *
 * GET
 *
 * /api/v1/document-compliance/critical
 *
 * Query:
 *
 * ?companyId=...
 * &limit=20
 */
export const getCriticalDocuments = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const companyId = getCompanyIdFromQuery(req);

  const parsed = criticalDocumentsQuerySchema.safeParse(req.query);

  if (!parsed.success) {
    throw new ApiError(
      400,
      "Invalid critical documents query",
      parsed.error.flatten(),
    );
  }

  const documents = await documentComplianceService.getCriticalDocuments(
    companyId,
    parsed.data.limit,
  );

  const data: ComplianceDocumentDto[] = documents;

  res.status(200).json({
    success: true,

    message: "Critical documents fetched successfully",

    data,
  });
};

/**
 * ============================================================
 * DEFAULT EXPORT
 * ============================================================
 */

export default {
  getComplianceSummary,

  getExpiringDocuments,

  getExpiredDocuments,

  getValidDocuments,

  getDocumentsWithoutExpiry,

  getOCRPendingDocuments,

  getVehicleCompliance,

  getDriverCompliance,

  getCompanyCompliance,

  getCriticalDocuments,
};
