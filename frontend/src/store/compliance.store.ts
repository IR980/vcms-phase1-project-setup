import { create } from "zustand";

import {
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
} from "../api/compliance.api";

import type {
  ComplianceSummaryDto,
  CompanyComplianceDto,
  ComplianceListResponseDto,
  ComplianceDocumentDto,
  VehicleComplianceDto,
  DriverComplianceDto,
  ExpiringDocumentsParams,
  ValidDocumentsParams,
  ComplianceFilterParams,
  CompliancePaginationParams,
  CriticalDocumentsParams,
} from "../types/compliance.dto";

/**
 * ============================================================
 * COMPLIANCE STORE
 * ============================================================
 *
 * PHASE 8 — DOCUMENT COMPLIANCE & EXPIRY MONITORING
 *
 * Responsibilities:
 *
 * - Store compliance dashboard data
 * - Store summary
 * - Store expiring documents
 * - Store expired documents
 * - Store valid documents
 * - Store documents without expiry
 * - Store OCR pending documents
 * - Store critical documents
 * - Store vehicle compliance
 * - Store driver compliance
 * - Handle loading state
 * - Handle API errors
 *
 * Business logic remains inside:
 *
 * documentCompliance.service.ts
 */

/**
 * ============================================================
 * STORE STATE
 * ============================================================
 */

interface ComplianceState {
  /**
   * ----------------------------------------------------------
   * COMPANY
   * ----------------------------------------------------------
   */

  companyId: string | null;

  /**
   * ----------------------------------------------------------
   * SUMMARY
   * ----------------------------------------------------------
   */

  summary: ComplianceSummaryDto | null;

  /**
   * ----------------------------------------------------------
   * COMPANY COMPLIANCE
   * ----------------------------------------------------------
   */

  companyCompliance: CompanyComplianceDto | null;

  /**
   * ----------------------------------------------------------
   * DOCUMENT LISTS
   * ----------------------------------------------------------
   */

  expiringDocuments: ComplianceListResponseDto | null;

  expiredDocuments: ComplianceListResponseDto | null;

  validDocuments: ComplianceListResponseDto | null;

  documentsWithoutExpiry: ComplianceListResponseDto | null;

  ocrPendingDocuments: ComplianceListResponseDto | null;

  /**
   * ----------------------------------------------------------
   * CRITICAL DOCUMENTS
   * ----------------------------------------------------------
   */

  criticalDocuments: ComplianceDocumentDto[] | null;

  /**
   * ----------------------------------------------------------
   * VEHICLE COMPLIANCE
   * ----------------------------------------------------------
   */

  vehicleCompliance: VehicleComplianceDto | null;

  /**
   * ----------------------------------------------------------
   * DRIVER COMPLIANCE
   * ----------------------------------------------------------
   */

  driverCompliance: DriverComplianceDto | null;

  /**
   * ----------------------------------------------------------
   * LOADING
   * ----------------------------------------------------------
   */

  isLoading: boolean;

  isSummaryLoading: boolean;

  isListLoading: boolean;

  isVehicleLoading: boolean;

  isDriverLoading: boolean;

  /**
   * ----------------------------------------------------------
   * ERROR
   * ----------------------------------------------------------
   */

  error: string | null;

  /**
   * ----------------------------------------------------------
   * ACTIONS
   * ----------------------------------------------------------
   */

  setCompanyId: (companyId: string | null) => void;

  fetchSummary: (companyId: string) => Promise<ComplianceSummaryDto | null>;

  fetchCompanyCompliance: (
    companyId: string,
  ) => Promise<CompanyComplianceDto | null>;

  fetchExpiringDocuments: (
    companyId: string,
    params?: ExpiringDocumentsParams,
  ) => Promise<ComplianceListResponseDto | null>;

  fetchExpiredDocuments: (
    companyId: string,
    params?: ComplianceFilterParams,
  ) => Promise<ComplianceListResponseDto | null>;

  fetchValidDocuments: (
    companyId: string,
    params?: ValidDocumentsParams,
  ) => Promise<ComplianceListResponseDto | null>;

  fetchDocumentsWithoutExpiry: (
    companyId: string,
    params?: CompliancePaginationParams,
  ) => Promise<ComplianceListResponseDto | null>;

  fetchOCRPendingDocuments: (
    companyId: string,
    params?: CompliancePaginationParams,
  ) => Promise<ComplianceListResponseDto | null>;

  fetchCriticalDocuments: (
    companyId: string,
    params?: CriticalDocumentsParams,
  ) => Promise<ComplianceDocumentDto[] | null>;

  fetchVehicleCompliance: (
    companyId: string,
    vehicleId: string,
  ) => Promise<VehicleComplianceDto | null>;

  fetchDriverCompliance: (
    companyId: string,
    driverId: string,
  ) => Promise<DriverComplianceDto | null>;

  fetchDashboardData: (companyId: string) => Promise<void>;

  clearError: () => void;

  clearData: () => void;

  reset: () => void;
}

/**
 * ============================================================
 * INITIAL STATE
 * ============================================================
 */

const initialState = {
  companyId: null,

  summary: null,

  companyCompliance: null,

  expiringDocuments: null,

  expiredDocuments: null,

  validDocuments: null,

  documentsWithoutExpiry: null,

  ocrPendingDocuments: null,

  criticalDocuments: null,

  vehicleCompliance: null,

  driverCompliance: null,

  isLoading: false,

  isSummaryLoading: false,

  isListLoading: false,

  isVehicleLoading: false,

  isDriverLoading: false,

  error: null,
};

/**
 * ============================================================
 * ERROR HELPER
 * ============================================================
 */

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
};

/**
 * ============================================================
 * STORE
 * ============================================================
 */

export const useComplianceStore = create<ComplianceState>((set, _get) => ({
  ...initialState,

  /**
   * ======================================================
   * SET COMPANY ID
   * ======================================================
   */

  setCompanyId: (companyId) => {
    set({
      companyId,
    });
  },

  /**
   * ======================================================
   * FETCH SUMMARY
   * ======================================================
   */

  fetchSummary: async (companyId) => {
    set({
      isSummaryLoading: true,

      error: null,

      companyId,
    });

    try {
      const summary = await getComplianceSummary(companyId);

      set({
        summary,

        isSummaryLoading: false,
      });

      return summary;
    } catch (error) {
      const message = getErrorMessage(
        error,
        "Unable to load compliance summary.",
      );

      set({
        isSummaryLoading: false,

        error: message,
      });

      return null;
    }
  },

  /**
   * ======================================================
   * FETCH COMPANY COMPLIANCE
   * ======================================================
   */

  fetchCompanyCompliance: async (companyId) => {
    set({
      isLoading: true,

      error: null,

      companyId,
    });

    try {
      const data = await getCompanyCompliance(companyId);

      set({
        companyCompliance: data,

        summary: data.summary,

        isLoading: false,
      });

      return data;
    } catch (error) {
      const message = getErrorMessage(
        error,
        "Unable to load company compliance.",
      );

      set({
        isLoading: false,

        error: message,
      });

      return null;
    }
  },

  /**
   * ======================================================
   * FETCH EXPIRING DOCUMENTS
   * ======================================================
   */

  fetchExpiringDocuments: async (companyId, params) => {
    set({
      isListLoading: true,

      error: null,

      companyId,
    });

    try {
      const data = await getExpiringDocuments(companyId, params);

      set({
        expiringDocuments: data,

        isListLoading: false,
      });

      return data;
    } catch (error) {
      const message = getErrorMessage(
        error,
        "Unable to load expiring documents.",
      );

      set({
        isListLoading: false,

        error: message,
      });

      return null;
    }
  },

  /**
   * ======================================================
   * FETCH EXPIRED DOCUMENTS
   * ======================================================
   */

  fetchExpiredDocuments: async (companyId, params) => {
    set({
      isListLoading: true,

      error: null,

      companyId,
    });

    try {
      const data = await getExpiredDocuments(companyId, params);

      set({
        expiredDocuments: data,

        isListLoading: false,
      });

      return data;
    } catch (error) {
      const message = getErrorMessage(
        error,
        "Unable to load expired documents.",
      );

      set({
        isListLoading: false,

        error: message,
      });

      return null;
    }
  },

  /**
   * ======================================================
   * FETCH VALID DOCUMENTS
   * ======================================================
   */

  fetchValidDocuments: async (companyId, params) => {
    set({
      isListLoading: true,

      error: null,

      companyId,
    });

    try {
      const data = await getValidDocuments(companyId, params);

      set({
        validDocuments: data,

        isListLoading: false,
      });

      return data;
    } catch (error) {
      const message = getErrorMessage(error, "Unable to load valid documents.");

      set({
        isListLoading: false,

        error: message,
      });

      return null;
    }
  },

  /**
   * ======================================================
   * FETCH DOCUMENTS WITHOUT EXPIRY
   * ======================================================
   */

  fetchDocumentsWithoutExpiry: async (companyId, params) => {
    set({
      isListLoading: true,

      error: null,

      companyId,
    });

    try {
      const data = await getDocumentsWithoutExpiry(companyId, params);

      set({
        documentsWithoutExpiry: data,

        isListLoading: false,
      });

      return data;
    } catch (error) {
      const message = getErrorMessage(
        error,
        "Unable to load documents without expiry.",
      );

      set({
        isListLoading: false,

        error: message,
      });

      return null;
    }
  },

  /**
   * ======================================================
   * FETCH OCR PENDING DOCUMENTS
   * ======================================================
   */

  fetchOCRPendingDocuments: async (companyId, params) => {
    set({
      isListLoading: true,

      error: null,

      companyId,
    });

    try {
      const data = await getOCRPendingDocuments(companyId, params);

      set({
        ocrPendingDocuments: data,

        isListLoading: false,
      });

      return data;
    } catch (error) {
      const message = getErrorMessage(
        error,
        "Unable to load OCR pending documents.",
      );

      set({
        isListLoading: false,

        error: message,
      });

      return null;
    }
  },

  /**
   * ======================================================
   * FETCH CRITICAL DOCUMENTS
   * ======================================================
   */

  fetchCriticalDocuments: async (companyId, params) => {
    set({
      isListLoading: true,

      error: null,

      companyId,
    });

    try {
      const data = await getCriticalDocuments(companyId, params);

      set({
        criticalDocuments: data,

        isListLoading: false,
      });

      return data;
    } catch (error) {
      const message = getErrorMessage(
        error,
        "Unable to load critical documents.",
      );

      set({
        isListLoading: false,

        error: message,
      });

      return null;
    }
  },

  /**
   * ======================================================
   * FETCH VEHICLE COMPLIANCE
   * ======================================================
   */

  fetchVehicleCompliance: async (companyId, vehicleId) => {
    set({
      isVehicleLoading: true,

      error: null,

      companyId,
    });

    try {
      const data = await getVehicleCompliance(companyId, vehicleId);

      set({
        vehicleCompliance: data,

        isVehicleLoading: false,
      });

      return data;
    } catch (error) {
      const message = getErrorMessage(
        error,
        "Unable to load vehicle compliance.",
      );

      set({
        isVehicleLoading: false,

        error: message,
      });

      return null;
    }
  },

  /**
   * ======================================================
   * FETCH DRIVER COMPLIANCE
   * ======================================================
   */

  fetchDriverCompliance: async (companyId, driverId) => {
    set({
      isDriverLoading: true,

      error: null,

      companyId,
    });

    try {
      const data = await getDriverCompliance(companyId, driverId);

      set({
        driverCompliance: data,

        isDriverLoading: false,
      });

      return data;
    } catch (error) {
      const message = getErrorMessage(
        error,
        "Unable to load driver compliance.",
      );

      set({
        isDriverLoading: false,

        error: message,
      });

      return null;
    }
  },

  /**
   * ======================================================
   * FETCH DASHBOARD DATA
   * ======================================================
   *
   * Loads the most important data required by the
   * Compliance Dashboard.
   *
   * Requests:
   *
   * 1. Summary
   * 2. Expiring
   * 3. Expired
   * 4. Critical
   * 5. OCR Pending
   */
  fetchDashboardData: async (companyId) => {
    set({
      isLoading: true,

      error: null,

      companyId,
    });

    try {
      const [summary, expiring, expired, critical, ocrPending] =
        await Promise.all([
          getComplianceSummary(companyId),

          getExpiringDocuments(companyId, {
            days: 30,

            page: 1,

            limit: 10,
          }),

          getExpiredDocuments(companyId, {
            page: 1,

            limit: 10,
          }),

          getCriticalDocuments(companyId, {
            limit: 10,
          }),

          getOCRPendingDocuments(companyId, {
            page: 1,

            limit: 10,
          }),
        ]);

      set({
        summary,

        expiringDocuments: expiring,

        expiredDocuments: expired,

        criticalDocuments: critical,

        ocrPendingDocuments: ocrPending,

        isLoading: false,
      });
    } catch (error) {
      const message = getErrorMessage(
        error,
        "Unable to load compliance dashboard.",
      );

      set({
        isLoading: false,

        error: message,
      });
    }
  },

  /**
   * ======================================================
   * CLEAR ERROR
   * ======================================================
   */

  clearError: () => {
    set({
      error: null,
    });
  },

  /**
   * ======================================================
   * CLEAR DATA
   * ======================================================
   */

  clearData: () => {
    set({
      summary: null,

      companyCompliance: null,

      expiringDocuments: null,

      expiredDocuments: null,

      validDocuments: null,

      documentsWithoutExpiry: null,

      ocrPendingDocuments: null,

      criticalDocuments: null,

      vehicleCompliance: null,

      driverCompliance: null,
    });
  },

  /**
   * ======================================================
   * RESET STORE
   * ======================================================
   */

  reset: () => {
    set({
      ...initialState,
    });
  },
}));

/**
 * ============================================================
 * SELECTORS
 * ============================================================
 *
 * Optional reusable selectors.
 */

/**
 * Summary selector.
 */
export const selectComplianceSummary = (state: ComplianceState) =>
  state.summary;

/**
 * Expired documents selector.
 */
export const selectExpiredDocuments = (state: ComplianceState) =>
  state.expiredDocuments;

/**
 * Expiring documents selector.
 */
export const selectExpiringDocuments = (state: ComplianceState) =>
  state.expiringDocuments;

/**
 * Critical documents selector.
 */
export const selectCriticalDocuments = (state: ComplianceState) =>
  state.criticalDocuments;

/**
 * OCR pending selector.
 */
export const selectOCRPendingDocuments = (state: ComplianceState) =>
  state.ocrPendingDocuments;

/**
 * Vehicle compliance selector.
 */
export const selectVehicleCompliance = (state: ComplianceState) =>
  state.vehicleCompliance;

/**
 * Driver compliance selector.
 */
export const selectDriverCompliance = (state: ComplianceState) =>
  state.driverCompliance;
