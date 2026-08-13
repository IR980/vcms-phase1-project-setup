/**
 * ============================================================
 * EXPIRY STORE
 * ============================================================
 *
 * Phase 7 — Frontend Expiry Detection Engine
 *
 * Responsibility:
 *
 * - Manage expiry documents
 * - Manage expiry summary
 * - Manage dashboard data
 * - Manage loading/error states
 * - Connect expiry API with React UI
 *
 * State management:
 *
 * Zustand
 */

import { create } from "zustand";

import {
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
} from "../api/expiry.api";

import type {
  DocumentExpiryResult,
  ExpiryDashboardResult,
  ExpiryEngineResult,
  ExpiryListResult,
  ExpiryQueryFilter,
  ExpiryReminderCandidate,
  ExpirySummary,
  ExpiryBatchResult,
  GetExpiryDocumentsParams,
} from "../types/expiry.types";

/**
 * ============================================================
 * STORE STATE
 * ============================================================
 */
interface ExpiryState {
  /**
   * ----------------------------------------------------------
   * MAIN DATA
   * ----------------------------------------------------------
   */

  /**
   * Paginated expiry documents.
   */
  documents: DocumentExpiryResult[];

  /**
   * Pagination + documents response.
   */
  listResult: ExpiryListResult | null;

  /**
   * Dashboard data.
   */
  dashboard: ExpiryDashboardResult | null;

  /**
   * Summary cards data.
   */
  summary: ExpirySummary | null;

  /**
   * ----------------------------------------------------------
   * SPECIALIZED DOCUMENT LISTS
   * ----------------------------------------------------------
   */

  expiredDocuments: DocumentExpiryResult[];

  expiringTodayDocuments: DocumentExpiryResult[];

  expiring7DaysDocuments: DocumentExpiryResult[];

  expiring15DaysDocuments: DocumentExpiryResult[];

  expiring30DaysDocuments: DocumentExpiryResult[];

  validDocuments: DocumentExpiryResult[];

  /**
   * ----------------------------------------------------------
   * REMINDER CANDIDATES
   * ----------------------------------------------------------
   *
   * Used later by Phase 8.
   */
  reminderCandidates: ExpiryReminderCandidate[];

  /**
   * ----------------------------------------------------------
   * SINGLE DOCUMENT
   * ----------------------------------------------------------
   */
  selectedDocument: DocumentExpiryResult | null;

  /**
   * ----------------------------------------------------------
   * PROCESSING RESULT
   * ----------------------------------------------------------
   */
  lastEngineResult: ExpiryEngineResult | null;

  lastBatchResult: ExpiryBatchResult | null;

  /**
   * ----------------------------------------------------------
   * FILTERS
   * ----------------------------------------------------------
   */
  filters: ExpiryQueryFilter;

  /**
   * ----------------------------------------------------------
   * PAGINATION
   * ----------------------------------------------------------
   */
  page: number;

  limit: number;

  /**
   * ----------------------------------------------------------
   * LOADING STATES
   * ----------------------------------------------------------
   */

  isLoading: boolean;

  isDashboardLoading: boolean;

  isSummaryLoading: boolean;

  isDocumentLoading: boolean;

  isProcessing: boolean;

  isReminderLoading: boolean;

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

  setFilters: (filters: ExpiryQueryFilter) => void;

  updateFilters: (filters: Partial<ExpiryQueryFilter>) => void;

  clearFilters: () => void;

  setPage: (page: number) => void;

  setLimit: (limit: number) => void;

  clearError: () => void;

  clearSelectedDocument: () => void;

  clearExpiryData: () => void;

  /**
   * ----------------------------------------------------------
   * API ACTIONS
   * ----------------------------------------------------------
   */

  fetchDocuments: (
    params?: GetExpiryDocumentsParams,
  ) => Promise<ExpiryListResult | null>;

  fetchSummary: (companyId?: string) => Promise<ExpirySummary | null>;

  fetchDashboard: (companyId?: string) => Promise<ExpiryDashboardResult | null>;

  fetchExpiredDocuments: (
    companyId?: string,
    limit?: number,
  ) => Promise<DocumentExpiryResult[]>;

  fetchExpiringToday: (
    companyId?: string,
    limit?: number,
  ) => Promise<DocumentExpiryResult[]>;

  fetchExpiring7Days: (
    companyId?: string,
    limit?: number,
  ) => Promise<DocumentExpiryResult[]>;

  fetchExpiring15Days: (
    companyId?: string,
    limit?: number,
  ) => Promise<DocumentExpiryResult[]>;

  fetchExpiring30Days: (
    companyId?: string,
    limit?: number,
  ) => Promise<DocumentExpiryResult[]>;

  fetchValidDocuments: (
    companyId?: string,
    limit?: number,
  ) => Promise<DocumentExpiryResult[]>;

  fetchDocumentExpiry: (
    documentId: string,
  ) => Promise<DocumentExpiryResult | null>;

  fetchReminderCandidates: (
    companyId?: string,
  ) => Promise<ExpiryReminderCandidate[]>;

  processDocument: (documentId: string) => Promise<ExpiryEngineResult | null>;

  processAllDocuments: (
    companyId?: string,
  ) => Promise<ExpiryBatchResult | null>;

  /**
   * ----------------------------------------------------------
   * REFRESH
   * ----------------------------------------------------------
   */
  refreshDashboard: (companyId?: string) => Promise<void>;

  refreshDocuments: () => Promise<void>;
}

/**
 * ============================================================
 * ERROR HELPER
 * ============================================================
 */
const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong while processing expiry data.";
};

/**
 * ============================================================
 * INITIAL FILTERS
 * ============================================================
 */
const initialFilters: ExpiryQueryFilter = {};

/**
 * ============================================================
 * STORE
 * ============================================================
 */
export const useExpiryStore = create<ExpiryState>((set, get) => ({
  /**
   * ======================================================
   * INITIAL DATA
   * ======================================================
   */

  documents: [],

  listResult: null,

  dashboard: null,

  summary: null,

  expiredDocuments: [],

  expiringTodayDocuments: [],

  expiring7DaysDocuments: [],

  expiring15DaysDocuments: [],

  expiring30DaysDocuments: [],

  validDocuments: [],

  reminderCandidates: [],

  selectedDocument: null,

  lastEngineResult: null,

  lastBatchResult: null,

  /**
   * ======================================================
   * FILTERS
   * ======================================================
   */

  filters: initialFilters,

  page: 1,

  limit: 20,

  /**
   * ======================================================
   * LOADING
   * ======================================================
   */

  isLoading: false,

  isDashboardLoading: false,

  isSummaryLoading: false,

  isDocumentLoading: false,

  isProcessing: false,

  isReminderLoading: false,

  /**
   * ======================================================
   * ERROR
   * ======================================================
   */

  error: null,

  /**
   * ======================================================
   * SET FILTERS
   * ======================================================
   */
  setFilters: (filters) => {
    set({
      filters: {
        ...filters,
      },

      page: 1,
    });
  },

  /**
   * ======================================================
   * UPDATE FILTERS
   * ======================================================
   */
  updateFilters: (filters) => {
    set((state) => ({
      filters: {
        ...state.filters,
        ...filters,
      },

      page: 1,
    }));
  },

  /**
   * ======================================================
   * CLEAR FILTERS
   * ======================================================
   */
  clearFilters: () => {
    set({
      filters: {},

      page: 1,
    });
  },

  /**
   * ======================================================
   * SET PAGE
   * ======================================================
   */
  setPage: (page) => {
    set({
      page: Math.max(1, page),
    });
  },

  /**
   * ======================================================
   * SET LIMIT
   * ======================================================
   */
  setLimit: (limit) => {
    set({
      limit: Math.min(100, Math.max(1, limit)),

      page: 1,
    });
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
   * CLEAR SELECTED DOCUMENT
   * ======================================================
   */
  clearSelectedDocument: () => {
    set({
      selectedDocument: null,
    });
  },

  /**
   * ======================================================
   * CLEAR ALL EXPIRY DATA
   * ======================================================
   */
  clearExpiryData: () => {
    set({
      documents: [],

      listResult: null,

      dashboard: null,

      summary: null,

      expiredDocuments: [],

      expiringTodayDocuments: [],

      expiring7DaysDocuments: [],

      expiring15DaysDocuments: [],

      expiring30DaysDocuments: [],

      validDocuments: [],

      reminderCandidates: [],

      selectedDocument: null,

      lastEngineResult: null,

      lastBatchResult: null,

      error: null,
    });
  },

  /**
   * ======================================================
   * FETCH DOCUMENTS
   * ======================================================
   */
  fetchDocuments: async (params) => {
    set({
      isLoading: true,

      error: null,
    });

    try {
      const state = get();

      const requestParams = params ?? {
        page: state.page,

        limit: state.limit,

        filter: state.filters,
      };

      const result = await getExpiryDocuments(requestParams);

      set({
        documents: result.documents,

        listResult: result,

        page: result.pagination.page,

        limit: result.pagination.limit,

        isLoading: false,
      });

      return result;
    } catch (error) {
      set({
        isLoading: false,

        error: getErrorMessage(error),
      });

      return null;
    }
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
    });

    try {
      const result = await getExpirySummary(companyId);

      set({
        summary: result,

        isSummaryLoading: false,
      });

      return result;
    } catch (error) {
      set({
        isSummaryLoading: false,

        error: getErrorMessage(error),
      });

      return null;
    }
  },

  /**
   * ======================================================
   * FETCH DASHBOARD
   * ======================================================
   */
  fetchDashboard: async (companyId) => {
    set({
      isDashboardLoading: true,

      error: null,
    });

    try {
      const result = await getExpiryDashboard(companyId);

      set({
        dashboard: result,

        summary: result.summary,

        isDashboardLoading: false,
      });

      return result;
    } catch (error) {
      set({
        isDashboardLoading: false,

        error: getErrorMessage(error),
      });

      return null;
    }
  },

  /**
   * ======================================================
   * FETCH EXPIRED DOCUMENTS
   * ======================================================
   */
  fetchExpiredDocuments: async (companyId, limit = 50) => {
    try {
      const result = await getExpiredDocuments(companyId, limit);

      set({
        expiredDocuments: result,
      });

      return result;
    } catch (error) {
      set({
        error: getErrorMessage(error),
      });

      return [];
    }
  },

  /**
   * ======================================================
   * FETCH TODAY
   * ======================================================
   */
  fetchExpiringToday: async (companyId, limit = 50) => {
    try {
      const result = await getExpiringToday(companyId, limit);

      set({
        expiringTodayDocuments: result,
      });

      return result;
    } catch (error) {
      set({
        error: getErrorMessage(error),
      });

      return [];
    }
  },

  /**
   * ======================================================
   * FETCH 7 DAYS
   * ======================================================
   */
  fetchExpiring7Days: async (companyId, limit = 50) => {
    try {
      const result = await getExpiringWithin7Days(companyId, limit);

      set({
        expiring7DaysDocuments: result,
      });

      return result;
    } catch (error) {
      set({
        error: getErrorMessage(error),
      });

      return [];
    }
  },

  /**
   * ======================================================
   * FETCH 15 DAYS
   * ======================================================
   */
  fetchExpiring15Days: async (companyId, limit = 50) => {
    try {
      const result = await getExpiringWithin15Days(companyId, limit);

      set({
        expiring15DaysDocuments: result,
      });

      return result;
    } catch (error) {
      set({
        error: getErrorMessage(error),
      });

      return [];
    }
  },

  /**
   * ======================================================
   * FETCH 30 DAYS
   * ======================================================
   */
  fetchExpiring30Days: async (companyId, limit = 50) => {
    try {
      const result = await getExpiringWithin30Days(companyId, limit);

      set({
        expiring30DaysDocuments: result,
      });

      return result;
    } catch (error) {
      set({
        error: getErrorMessage(error),
      });

      return [];
    }
  },

  /**
   * ======================================================
   * FETCH VALID DOCUMENTS
   * ======================================================
   */
  fetchValidDocuments: async (companyId, limit = 50) => {
    try {
      const result = await getValidDocuments(companyId, limit);

      set({
        validDocuments: result,
      });

      return result;
    } catch (error) {
      set({
        error: getErrorMessage(error),
      });

      return [];
    }
  },

  /**
   * ======================================================
   * FETCH SINGLE DOCUMENT
   * ======================================================
   */
  fetchDocumentExpiry: async (documentId) => {
    set({
      isDocumentLoading: true,

      error: null,
    });

    try {
      const result = await getDocumentExpiry(documentId);

      set({
        selectedDocument: result,

        isDocumentLoading: false,
      });

      return result;
    } catch (error) {
      set({
        isDocumentLoading: false,

        error: getErrorMessage(error),
      });

      return null;
    }
  },

  /**
   * ======================================================
   * FETCH REMINDER CANDIDATES
   * ======================================================
   */
  fetchReminderCandidates: async (companyId) => {
    set({
      isReminderLoading: true,

      error: null,
    });

    try {
      const result = await getReminderCandidates(companyId);

      set({
        reminderCandidates: result,

        isReminderLoading: false,
      });

      return result;
    } catch (error) {
      set({
        isReminderLoading: false,

        error: getErrorMessage(error),
      });

      return [];
    }
  },

  /**
   * ======================================================
   * PROCESS SINGLE DOCUMENT
   * ======================================================
   */
  processDocument: async (documentId) => {
    set({
      isProcessing: true,

      error: null,
    });

    try {
      const result = await processDocumentExpiry(documentId);

      set({
        lastEngineResult: result,

        selectedDocument: result.expiry,

        isProcessing: false,
      });

      return result;
    } catch (error) {
      set({
        isProcessing: false,

        error: getErrorMessage(error),
      });

      return null;
    }
  },

  /**
   * ======================================================
   * PROCESS ALL DOCUMENTS
   * ======================================================
   */
  processAllDocuments: async (companyId) => {
    set({
      isProcessing: true,

      error: null,
    });

    try {
      const result = await processAllDocumentExpiry(companyId);

      set({
        lastBatchResult: result,

        isProcessing: false,
      });

      return result;
    } catch (error) {
      set({
        isProcessing: false,

        error: getErrorMessage(error),
      });

      return null;
    }
  },

  /**
   * ======================================================
   * REFRESH DASHBOARD
   * ======================================================
   */
  refreshDashboard: async (companyId) => {
    await Promise.all([
      get().fetchDashboard(companyId),

      get().fetchSummary(companyId),
    ]);
  },

  /**
   * ======================================================
   * REFRESH DOCUMENTS
   * ======================================================
   */
  refreshDocuments: async () => {
    await get().fetchDocuments({
      page: get().page,

      limit: get().limit,

      filter: get().filters,
    });
  },
}));

/**
 * ============================================================
 * DEFAULT EXPORT
 * ============================================================
 */
export default useExpiryStore;
