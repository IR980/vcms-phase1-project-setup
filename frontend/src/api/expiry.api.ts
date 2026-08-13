/**
 * ============================================================
 * EXPIRY API
 * ============================================================
 *
 * Phase 7 — Expiry Detection Engine
 *
 * Responsibility:
 *
 * - Communicate with backend expiry APIs
 * - Keep API calls strongly typed
 * - Keep HTTP logic outside components/store
 *
 * Backend base:
 *
 * /api/v1/expiry
 */

import api from "./api";

import type {
  DocumentExpiryResult,
  ExpiryDashboardResult,
  ExpiryListResult,
  ExpiryQueryFilter,
  ExpirySummary,
  ExpiryReminderCandidate,
  ExpiryEngineResult,
} from "../types/expiry.types";

/**
 * ============================================================
 * CONSTANT
 * ============================================================
 */

const EXPIRY_BASE_URL = "/expiry";

/**
 * ============================================================
 * API RESPONSE
 * ============================================================
 *
 * Backend ApiResponse normally returns:
 *
 * {
 *   statusCode,
 *   message,
 *   data
 * }
 */
interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

/**
 * ============================================================
 * GET EXPIRY DOCUMENTS
 * ============================================================
 *
 * GET /api/v1/expiry
 *
 * Examples:
 *
 * getExpiryDocuments()
 *
 * getExpiryDocuments({
 *   page: 1,
 *   limit: 20,
 *   filter: {
 *     companyId: "...",
 *     status: "expired"
 *   }
 * })
 */

export interface GetExpiryDocumentsParams {
  page?: number;

  limit?: number;

  sortOrder?: "asc" | "desc";

  filter?: ExpiryQueryFilter;
}

export const getExpiryDocuments = async (
  params?: GetExpiryDocumentsParams,
): Promise<ExpiryListResult> => {
  const response = await api.get<ApiResponse<ExpiryListResult>>(
    EXPIRY_BASE_URL,
    {
      params: {
        page: params?.page,

        limit: params?.limit,

        sortOrder: params?.sortOrder,

        /**
         * Filter values are flattened because
         * backend reads them from req.query.
         */
        companyId: params?.filter?.companyId,

        vehicleId: params?.filter?.vehicleId,

        driverId: params?.filter?.driverId,

        documentType: params?.filter?.documentType,

        ownerType: params?.filter?.ownerType,

        status: params?.filter?.status,

        minDaysRemaining: params?.filter?.minDaysRemaining,

        maxDaysRemaining: params?.filter?.maxDaysRemaining,

        includeExpired: params?.filter?.includeExpired,

        includeRejected: params?.filter?.includeRejected,
      },
    },
  );

  return response.data.data;
};

/**
 * ============================================================
 * GET EXPIRY SUMMARY
 * ============================================================
 *
 * GET /api/v1/expiry/summary
 *
 * Optional companyId.
 */
export const getExpirySummary = async (
  companyId?: string,
): Promise<ExpirySummary> => {
  const response = await api.get<ApiResponse<ExpirySummary>>(
    `${EXPIRY_BASE_URL}/summary`,
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
 * GET EXPIRY DASHBOARD
 * ============================================================
 *
 * GET /api/v1/expiry/dashboard
 */
export const getExpiryDashboard = async (
  companyId?: string,
): Promise<ExpiryDashboardResult> => {
  const response = await api.get<ApiResponse<ExpiryDashboardResult>>(
    `${EXPIRY_BASE_URL}/dashboard`,
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
 * GET EXPIRED DOCUMENTS
 * ============================================================
 *
 * GET /api/v1/expiry/expired
 */
export const getExpiredDocuments = async (
  companyId?: string,
  limit = 50,
): Promise<DocumentExpiryResult[]> => {
  const response = await api.get<ApiResponse<DocumentExpiryResult[]>>(
    `${EXPIRY_BASE_URL}/expired`,
    {
      params: {
        companyId,
        limit,
      },
    },
  );

  return response.data.data;
};

/**
 * ============================================================
 * GET EXPIRING TODAY
 * ============================================================
 *
 * GET /api/v1/expiry/today
 */
export const getExpiringToday = async (
  companyId?: string,
  limit = 50,
): Promise<DocumentExpiryResult[]> => {
  const response = await api.get<ApiResponse<DocumentExpiryResult[]>>(
    `${EXPIRY_BASE_URL}/today`,
    {
      params: {
        companyId,
        limit,
      },
    },
  );

  return response.data.data;
};

/**
 * ============================================================
 * GET EXPIRING WITHIN 7 DAYS
 * ============================================================
 *
 * GET /api/v1/expiry/7-days
 */
export const getExpiringWithin7Days = async (
  companyId?: string,
  limit = 50,
): Promise<DocumentExpiryResult[]> => {
  const response = await api.get<ApiResponse<DocumentExpiryResult[]>>(
    `${EXPIRY_BASE_URL}/7-days`,
    {
      params: {
        companyId,
        limit,
      },
    },
  );

  return response.data.data;
};

/**
 * ============================================================
 * GET EXPIRING WITHIN 15 DAYS
 * ============================================================
 *
 * GET /api/v1/expiry/15-days
 */
export const getExpiringWithin15Days = async (
  companyId?: string,
  limit = 50,
): Promise<DocumentExpiryResult[]> => {
  const response = await api.get<ApiResponse<DocumentExpiryResult[]>>(
    `${EXPIRY_BASE_URL}/15-days`,
    {
      params: {
        companyId,
        limit,
      },
    },
  );

  return response.data.data;
};

/**
 * ============================================================
 * GET EXPIRING WITHIN 30 DAYS
 * ============================================================
 *
 * GET /api/v1/expiry/30-days
 */
export const getExpiringWithin30Days = async (
  companyId?: string,
  limit = 50,
): Promise<DocumentExpiryResult[]> => {
  const response = await api.get<ApiResponse<DocumentExpiryResult[]>>(
    `${EXPIRY_BASE_URL}/30-days`,
    {
      params: {
        companyId,
        limit,
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
 * GET /api/v1/expiry/valid
 */
export const getValidDocuments = async (
  companyId?: string,
  limit = 50,
): Promise<DocumentExpiryResult[]> => {
  const response = await api.get<ApiResponse<DocumentExpiryResult[]>>(
    `${EXPIRY_BASE_URL}/valid`,
    {
      params: {
        companyId,
        limit,
      },
    },
  );

  return response.data.data;
};

/**
 * ============================================================
 * GET SINGLE DOCUMENT EXPIRY
 * ============================================================
 *
 * GET /api/v1/expiry/document/:id
 */
export const getDocumentExpiry = async (
  documentId: string,
): Promise<DocumentExpiryResult> => {
  if (!documentId) {
    throw new Error("Document ID is required");
  }

  const response = await api.get<ApiResponse<DocumentExpiryResult>>(
    `${EXPIRY_BASE_URL}/document/${documentId}`,
  );

  return response.data.data;
};

/**
 * ============================================================
 * GET REMINDER CANDIDATES
 * ============================================================
 *
 * GET /api/v1/expiry/reminder-candidates
 *
 * Phase 7 identifies candidates.
 *
 * Phase 8 will send notifications.
 */
export const getReminderCandidates = async (
  companyId?: string,
): Promise<ExpiryReminderCandidate[]> => {
  const response = await api.get<ApiResponse<ExpiryReminderCandidate[]>>(
    `${EXPIRY_BASE_URL}/reminder-candidates`,
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
 * PROCESS SINGLE DOCUMENT
 * ============================================================
 *
 * GET /api/v1/expiry/process/:id
 *
 * Mainly useful for:
 *
 * - debugging
 * - testing
 * - admin tools
 */
export const processDocumentExpiry = async (
  documentId: string,
): Promise<ExpiryEngineResult> => {
  if (!documentId) {
    throw new Error("Document ID is required");
  }

  const response = await api.get<ApiResponse<ExpiryEngineResult>>(
    `${EXPIRY_BASE_URL}/process/${documentId}`,
  );

  return response.data.data;
};

/**
 * ============================================================
 * PROCESS ALL DOCUMENTS
 * ============================================================
 *
 * GET /api/v1/expiry/process
 *
 * Optional companyId.
 */
export const processAllDocumentExpiry = async (companyId?: string) => {
  const response = await api.get(`${EXPIRY_BASE_URL}/process`, {
    params: {
      companyId,
    },
  });

  return response.data.data;
};

/**
 * ============================================================
 * DEFAULT EXPORT
 * ============================================================
 */
export default {
  getExpiryDocuments,

  getExpirySummary,

  getExpiryDashboard,

  getExpiredDocuments,

  getExpiringToday,

  getExpiringWithin7Days,

  getExpiringWithin15Days,

  getExpiringWithin30Days,

  getValidDocuments,

  getDocumentExpiry,

  getReminderCandidates,

  processDocumentExpiry,

  processAllDocumentExpiry,
};
