import api from "./api";

import type {
  ComplianceSummaryDto,
  ComplianceListResponseDto,
  VehicleComplianceDto,
  DriverComplianceDto,
  CompanyComplianceDto,
  ComplianceDocumentDto,
} from "../types/compliance.dto";

/**
 * ============================================================
 * COMPLIANCE API
 * ============================================================
 *
 * PHASE 8 — DOCUMENT COMPLIANCE & EXPIRY MONITORING
 *
 * Backend base:
 *
 * /api/v1/document-compliance
 *
 * This file contains ONLY API communication.
 *
 * Business logic remains inside:
 *
 * documentCompliance.service.ts
 */

/**
 * ============================================================
 * TYPES
 * ============================================================
 */

export interface CompliancePaginationParams {
  page?: number;
  limit?: number;
}

export interface ComplianceFilterParams extends CompliancePaginationParams {
  documentType?: string;
  ownerType?: "vehicle" | "driver";
  vehicleId?: string;
  driverId?: string;
}

export interface ExpiringDocumentsParams extends ComplianceFilterParams {
  /**
   * Number of days within which documents
   * should be considered expiring.
   *
   * Default: 30
   */
  days?: number;
}

export interface ValidDocumentsParams extends ComplianceFilterParams {
  /**
   * Expiring-soon boundary.
   *
   * Default: 30
   */
  days?: number;
}

export interface CriticalDocumentsParams {
  /**
   * Number of critical documents to return.
   *
   * Default: 20
   */
  limit?: number;
}

/**
 * ============================================================
 * API RESPONSE TYPES
 * ============================================================
 */

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

/**
 * ============================================================
 * API PATH
 * ============================================================
 */

const BASE_URL = "/document-compliance";

/**
 * ============================================================
 * GET COMPLIANCE SUMMARY
 * ============================================================
 *
 * GET:
 *
 * /api/v1/document-compliance/summary
 *
 * Query:
 *
 * companyId
 */
export const getComplianceSummary = async (
  companyId: string,
): Promise<ComplianceSummaryDto> => {
  const response = await api.get<ApiResponse<ComplianceSummaryDto>>(
    `${BASE_URL}/summary`,
    {
      params: {
        companyId,
      },
    },
  );

  return response.data.data;
};

/**
 * ============================================================
 * GET COMPANY COMPLIANCE
 * ============================================================
 *
 * GET:
 *
 * /api/v1/document-compliance/company
 *
 * Returns:
 *
 * - summary
 * - expired
 * - expiringSoon
 * - noExpiry
 */
export const getCompanyCompliance = async (
  companyId: string,
): Promise<CompanyComplianceDto> => {
  const response = await api.get<ApiResponse<CompanyComplianceDto>>(
    `${BASE_URL}/company`,
    {
      params: {
        companyId,
      },
    },
  );

  return response.data.data;
};

/**
 * ============================================================
 * GET EXPIRING DOCUMENTS
 * ============================================================
 *
 * GET:
 *
 * /api/v1/document-compliance/expiring
 *
 * Example:
 *
 * getExpiringDocuments(companyId, {
 *   days: 30,
 *   page: 1,
 *   limit: 20
 * });
 */
export const getExpiringDocuments = async (
  companyId: string,
  params?: ExpiringDocumentsParams,
): Promise<ComplianceListResponseDto> => {
  const response = await api.get<ApiResponse<ComplianceListResponseDto>>(
    `${BASE_URL}/expiring`,
    {
      params: {
        companyId,

        ...params,
      },
    },
  );

  return response.data.data;
};

/**
 * ============================================================
 * GET EXPIRED DOCUMENTS
 * ============================================================
 *
 * GET:
 *
 * /api/v1/document-compliance/expired
 */
export const getExpiredDocuments = async (
  companyId: string,
  params?: ComplianceFilterParams,
): Promise<ComplianceListResponseDto> => {
  const response = await api.get<ApiResponse<ComplianceListResponseDto>>(
    `${BASE_URL}/expired`,
    {
      params: {
        companyId,

        ...params,
      },
    },
  );

  return response.data.data;
};

/**
 * ============================================================
 * GET VALID DOCUMENTS
 * ============================================================
 *
 * GET:
 *
 * /api/v1/document-compliance/valid
 */
export const getValidDocuments = async (
  companyId: string,
  params?: ValidDocumentsParams,
): Promise<ComplianceListResponseDto> => {
  const response = await api.get<ApiResponse<ComplianceListResponseDto>>(
    `${BASE_URL}/valid`,
    {
      params: {
        companyId,

        ...params,
      },
    },
  );

  return response.data.data;
};

/**
 * ============================================================
 * GET DOCUMENTS WITHOUT EXPIRY
 * ============================================================
 *
 * GET:
 *
 * /api/v1/document-compliance/no-expiry
 *
 * Useful for:
 *
 * - OCR failed
 * - OCR did not detect expiry
 * - Manual review
 */
export const getDocumentsWithoutExpiry = async (
  companyId: string,
  params?: CompliancePaginationParams,
): Promise<ComplianceListResponseDto> => {
  const response = await api.get<ApiResponse<ComplianceListResponseDto>>(
    `${BASE_URL}/no-expiry`,
    {
      params: {
        companyId,

        ...params,
      },
    },
  );

  return response.data.data;
};

/**
 * ============================================================
 * GET OCR PENDING DOCUMENTS
 * ============================================================
 *
 * GET:
 *
 * /api/v1/document-compliance/ocr-pending
 */
export const getOCRPendingDocuments = async (
  companyId: string,
  params?: CompliancePaginationParams,
): Promise<ComplianceListResponseDto> => {
  const response = await api.get<ApiResponse<ComplianceListResponseDto>>(
    `${BASE_URL}/ocr-pending`,
    {
      params: {
        companyId,

        ...params,
      },
    },
  );

  return response.data.data;
};

/**
 * ============================================================
 * GET CRITICAL DOCUMENTS
 * ============================================================
 *
 * GET:
 *
 * /api/v1/document-compliance/critical
 *
 * Critical documents:
 *
 * - expired
 * - expiring within 7 days
 */
export const getCriticalDocuments = async (
  companyId: string,
  params?: CriticalDocumentsParams,
): Promise<ComplianceDocumentDto[]> => {
  const response = await api.get<ApiResponse<ComplianceDocumentDto[]>>(
    `${BASE_URL}/critical`,
    {
      params: {
        companyId,

        ...params,
      },
    },
  );

  return response.data.data;
};

/**
 * ============================================================
 * GET VEHICLE COMPLIANCE
 * ============================================================
 *
 * GET:
 *
 * /api/v1/document-compliance/vehicle/:vehicleId
 */
export const getVehicleCompliance = async (
  companyId: string,
  vehicleId: string,
): Promise<VehicleComplianceDto> => {
  const response = await api.get<ApiResponse<VehicleComplianceDto>>(
    `${BASE_URL}/vehicle/${vehicleId}`,
    {
      params: {
        companyId,
      },
    },
  );

  return response.data.data;
};

/**
 * ============================================================
 * GET DRIVER COMPLIANCE
 * ============================================================
 *
 * GET:
 *
 * /api/v1/document-compliance/driver/:driverId
 */
export const getDriverCompliance = async (
  companyId: string,
  driverId: string,
): Promise<DriverComplianceDto> => {
  const response = await api.get<ApiResponse<DriverComplianceDto>>(
    `${BASE_URL}/driver/${driverId}`,
    {
      params: {
        companyId,
      },
    },
  );

  return response.data.data;
};

/**
 * ============================================================
 * DEFAULT API OBJECT
 * ============================================================
 *
 * Optional convenience export.
 */
const complianceApi = {
  getComplianceSummary,

  getCompanyCompliance,

  getExpiringDocuments,

  getExpiredDocuments,

  getValidDocuments,

  getDocumentsWithoutExpiry,

  getOCRPendingDocuments,

  getCriticalDocuments,

  getVehicleCompliance,

  getDriverCompliance,
};

export default complianceApi;
