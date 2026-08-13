import { create } from "zustand";

import documentApi from "../api/document.api";

import type {
  Document,
  DocumentQueryParams,
  CreateDocumentFormData,
  UpdateDocumentFormData,
  DocumentFilterState,
  DocumentPagination,
} from "../types/document.types";
import { DEFAULT_DOCUMENT_FILTERS } from "../types/document.types";

/**
 * ============================================================
 * DOCUMENT STORE STATE
 * ============================================================
 */
interface DocumentStore {
  /**
   * ==========================================================
   * DATA
   * ==========================================================
   */

  /**
   * Document list.
   */
  documents: Document[];

  /**
   * Currently selected document.
   */
  selectedDocument: Document | null;

  /**
   * Pagination.
   */
  pagination: DocumentPagination | null;

  /**
   * ==========================================================
   * FILTERS
   * ==========================================================
   */
  filters: DocumentFilterState;

  /**
   * ==========================================================
   * LOADING STATES
   * ==========================================================
   */

  /**
   * Loading document list.
   */
  isLoading: boolean;

  /**
   * Loading single document.
   */
  isLoadingDocument: boolean;

  /**
   * Uploading new document.
   */
  isUploading: boolean;

  /**
   * Updating document.
   */
  isUpdating: boolean;

  /**
   * Deleting document.
   */
  isDeleting: boolean;

  /**
   * ==========================================================
   * ERROR
   * ==========================================================
   */
  error: string | null;

  /**
   * ==========================================================
   * ACTIONS
   * ==========================================================
   */

  /**
   * Fetch documents.
   */
  fetchDocuments: (params?: DocumentQueryParams) => Promise<void>;

  /**
   * Fetch single document.
   */
  fetchDocumentById: (id: string) => Promise<Document | null>;

  /**
   * Create/upload document.
   */
  createDocument: (data: CreateDocumentFormData) => Promise<Document | null>;

  /**
   * Update document.
   */
  updateDocument: (
    id: string,
    data: UpdateDocumentFormData,
  ) => Promise<Document | null>;

  /**
   * Delete document.
   */
  deleteDocument: (id: string) => Promise<boolean>;

  /**
   * Set selected document.
   */
  setSelectedDocument: (document: Document | null) => void;

  /**
   * Update filters.
   */
  setFilters: (filters: Partial<DocumentFilterState>) => void;

  /**
   * Reset filters.
   */
  resetFilters: () => void;

  /**
   * Clear error.
   */
  clearError: () => void;

  /**
   * Clear store.
   */
  clearStore: () => void;
}

/**
 * ============================================================
 * ERROR HELPER
 * ============================================================
 */
const getErrorMessage = (error: unknown): string => {
  /**
   * Axios errors normally contain:
   *
   * response.data.message
   */
  if (typeof error === "object" && error !== null) {
    const axiosError = error as {
      response?: {
        data?: {
          message?: string;
        };
      };

      message?: string;
    };

    if (axiosError.response?.data?.message) {
      return axiosError.response.data.message;
    }

    if (axiosError.message) {
      return axiosError.message;
    }
  }

  return "Something went wrong. Please try again.";
};

/**
 * ============================================================
 * DOCUMENT STORE
 * ============================================================
 */
export const useDocumentStore = create<DocumentStore>((set, get) => ({
  /**
   * ======================================================
   * INITIAL STATE
   * ======================================================
   */

  documents: [],

  selectedDocument: null,

  pagination: null,

  filters: DEFAULT_DOCUMENT_FILTERS,

  isLoading: false,

  isLoadingDocument: false,

  isUploading: false,

  isUpdating: false,

  isDeleting: false,

  error: null,

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
      /**
       * --------------------------------------------------
       * Use current filters when params are not provided.
       * --------------------------------------------------
       */
      const currentFilters = get().filters;

      const queryParams: DocumentQueryParams = {
        /**
         * Empty strings should not be sent
         * unnecessarily.
         */
        ...(currentFilters.documentType
          ? {
              documentType: currentFilters.documentType,
            }
          : {}),

        ...(currentFilters.ownerType
          ? {
              ownerType: currentFilters.ownerType,
            }
          : {}),

        ...(currentFilters.verificationStatus
          ? {
              verificationStatus: currentFilters.verificationStatus,
            }
          : {}),

        ...(currentFilters.companyId
          ? {
              companyId: currentFilters.companyId,
            }
          : {}),

        ...(currentFilters.vehicleId
          ? {
              vehicleId: currentFilters.vehicleId,
            }
          : {}),

        ...(currentFilters.driverId
          ? {
              driverId: currentFilters.driverId,
            }
          : {}),

        ...(currentFilters.search
          ? {
              search: currentFilters.search,
            }
          : {}),

        ...(currentFilters.expiryFrom
          ? {
              expiryFrom: currentFilters.expiryFrom,
            }
          : {}),

        ...(currentFilters.expiryTo
          ? {
              expiryTo: currentFilters.expiryTo,
            }
          : {}),

        ...(currentFilters.expired !== undefined
          ? {
              expired: currentFilters.expired,
            }
          : {}),

        ...(currentFilters.expiringWithin !== undefined
          ? {
              expiringWithin: currentFilters.expiringWithin,
            }
          : {}),

        sortBy: currentFilters.sortBy,

        sortOrder: currentFilters.sortOrder,

        /**
         * Additional explicit parameters override
         * the current filters.
         */
        ...params,
      };

      /**
       * --------------------------------------------------
       * API
       * --------------------------------------------------
       */
      const response = await documentApi.getDocuments(queryParams);

      /**
       * --------------------------------------------------
       * Update store
       * --------------------------------------------------
       */
      set({
        documents: response.data.documents,

        pagination: response.data.pagination,

        isLoading: false,

        error: null,
      });
    } catch (error) {
      set({
        isLoading: false,

        error: getErrorMessage(error),
      });
    }
  },

  /**
   * ======================================================
   * FETCH DOCUMENT BY ID
   * ======================================================
   */
  fetchDocumentById: async (id) => {
    set({
      isLoadingDocument: true,

      error: null,
    });

    try {
      const response = await documentApi.getDocumentById(id);

      const document = response.data;

      set({
        selectedDocument: document,

        isLoadingDocument: false,

        error: null,
      });

      return document;
    } catch (error) {
      set({
        isLoadingDocument: false,

        error: getErrorMessage(error),
      });

      return null;
    }
  },

  /**
   * ======================================================
   * CREATE DOCUMENT
   * ======================================================
   */
  createDocument: async (data) => {
    set({
      isUploading: true,

      error: null,
    });

    try {
      const response = await documentApi.createDocument(data);

      const newDocument = response.data;

      /**
       * Add newly created document
       * to current list immediately.
       */
      set((state) => ({
        documents: [newDocument, ...state.documents],

        selectedDocument: newDocument,

        isUploading: false,

        error: null,
      }));

      return newDocument;
    } catch (error) {
      set({
        isUploading: false,

        error: getErrorMessage(error),
      });

      return null;
    }
  },

  /**
   * ======================================================
   * UPDATE DOCUMENT
   * ======================================================
   */
  updateDocument: async (id, data) => {
    set({
      isUpdating: true,

      error: null,
    });

    try {
      const response = await documentApi.updateDocument(id, data);

      const updatedDocument = response.data;

      /**
       * Update document inside current list.
       */
      set((state) => ({
        documents: state.documents.map((document) =>
          document._id === updatedDocument._id ? updatedDocument : document,
        ),

        selectedDocument: updatedDocument,

        isUpdating: false,

        error: null,
      }));

      return updatedDocument;
    } catch (error) {
      set({
        isUpdating: false,

        error: getErrorMessage(error),
      });

      return null;
    }
  },

  /**
   * ======================================================
   * DELETE DOCUMENT
   * ======================================================
   */
  deleteDocument: async (id) => {
    set({
      isDeleting: true,

      error: null,
    });

    try {
      await documentApi.deleteDocument(id);

      /**
       * Remove deleted document from
       * current state.
       */
      set((state) => ({
        documents: state.documents.filter((document) => document._id !== id),

        selectedDocument: state.selectedDocument
          ? state.selectedDocument._id === id
            ? null
            : state.selectedDocument
          : null,

        isDeleting: false,

        error: null,
      }));

      return true;
    } catch (error) {
      set({
        isDeleting: false,

        error: getErrorMessage(error),
      });

      return false;
    }
  },

  /**
   * ======================================================
   * SET SELECTED DOCUMENT
   * ======================================================
   */
  setSelectedDocument: (document) => {
    set({
      selectedDocument: document,
    });
  },

  /**
   * ======================================================
   * SET FILTERS
   * ======================================================
   */
  setFilters: (newFilters) => {
    set((state) => ({
      filters: {
        ...state.filters,

        ...newFilters,
      },
    }));
  },

  /**
   * ======================================================
   * RESET FILTERS
   * ======================================================
   */
  resetFilters: () => {
    set({
      filters: DEFAULT_DOCUMENT_FILTERS,
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
   * CLEAR STORE
   * ======================================================
   */
  clearStore: () => {
    set({
      documents: [],

      selectedDocument: null,

      pagination: null,

      filters: DEFAULT_DOCUMENT_FILTERS,

      isLoading: false,

      isLoadingDocument: false,

      isUploading: false,

      isUpdating: false,

      isDeleting: false,

      error: null,
    });
  },
}));

export default useDocumentStore;
