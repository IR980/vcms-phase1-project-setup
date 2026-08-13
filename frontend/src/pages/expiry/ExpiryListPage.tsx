import { useCallback, useEffect } from "react";

import {
  AlertTriangle,
  ArrowLeft,
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  Filter,
  RefreshCw,
  RotateCcw,
} from "lucide-react";

import { useNavigate, useSearchParams } from "react-router-dom";

import ExpiryTable from "../../components/expiry/ExpiryTable";

import { useExpiryStore } from "../../store/expiry.store";

import {
  EXPIRY_DOCUMENT_OWNER_TYPE,
  EXPIRY_DOCUMENT_TYPE,
  EXPIRY_STATUS,
} from "../../types/expiry.types";

import type {
  DocumentExpiryResult,
  ExpiryDocumentOwnerType,
  ExpiryDocumentType,
  ExpiryStatus,
} from "../../types/expiry.types";

/**
 * ============================================================
 * COMPONENT
 * ============================================================
 */
const ExpiryListPage = () => {
  /**
   * ==========================================================
   * ROUTER
   * ==========================================================
   */
  const navigate = useNavigate();

  const [searchParams, setSearchParams] = useSearchParams();

  /**
   * ==========================================================
   * STORE
   * ==========================================================
   */

  const documents = useExpiryStore((state) => state.documents);

  const listResult = useExpiryStore((state) => state.listResult);

  const filters = useExpiryStore((state) => state.filters);

  const page = useExpiryStore((state) => state.page);

  const limit = useExpiryStore((state) => state.limit);

  const isLoading = useExpiryStore((state) => state.isLoading);

  const error = useExpiryStore((state) => state.error);

  const fetchDocuments = useExpiryStore((state) => state.fetchDocuments);

  const updateFilters = useExpiryStore((state) => state.updateFilters);

  const clearFilters = useExpiryStore((state) => state.clearFilters);

  const setPage = useExpiryStore((state) => state.setPage);

  const setLimit = useExpiryStore((state) => state.setLimit);

  const clearError = useExpiryStore((state) => state.clearError);

  /**
   * ==========================================================
   * URL PARAMETERS
   * ==========================================================
   */

  const statusParam = searchParams.get("status");

  const documentTypeParam = searchParams.get("documentType");

  const ownerTypeParam = searchParams.get("ownerType");

  /**
   * ==========================================================
   * TYPE GUARDS
   * ==========================================================
   */

  const isExpiryStatus = (value: string | null): value is ExpiryStatus => {
    if (!value) {
      return false;
    }

    return Object.values(EXPIRY_STATUS).includes(value as ExpiryStatus);
  };

  const isDocumentType = (
    value: string | null,
  ): value is ExpiryDocumentType => {
    if (!value) {
      return false;
    }

    return Object.values(EXPIRY_DOCUMENT_TYPE).includes(
      value as ExpiryDocumentType,
    );
  };

  const isOwnerType = (
    value: string | null,
  ): value is ExpiryDocumentOwnerType => {
    if (!value) {
      return false;
    }

    return Object.values(EXPIRY_DOCUMENT_OWNER_TYPE).includes(
      value as ExpiryDocumentOwnerType,
    );
  };

  /**
   * ==========================================================
   * BUILD URL FILTERS
   * ==========================================================
   *
   * URL is the source of truth for page filters.
   */
  const buildUrlFilters = useCallback(() => {
    const nextFilters = {
      ...filters,
    };

    let changed = false;

    /**
     * --------------------------------------------------------
     * STATUS
     * --------------------------------------------------------
     */
    const nextStatus = isExpiryStatus(statusParam) ? statusParam : undefined;

    if (nextFilters.status !== nextStatus) {
      nextFilters.status = nextStatus;

      changed = true;
    }

    /**
     * --------------------------------------------------------
     * DOCUMENT TYPE
     * --------------------------------------------------------
     */
    const nextDocumentType = isDocumentType(documentTypeParam)
      ? documentTypeParam
      : undefined;

    if (nextFilters.documentType !== nextDocumentType) {
      nextFilters.documentType = nextDocumentType;

      changed = true;
    }

    /**
     * --------------------------------------------------------
     * OWNER TYPE
     * --------------------------------------------------------
     */
    const nextOwnerType = isOwnerType(ownerTypeParam)
      ? ownerTypeParam
      : undefined;

    if (nextFilters.ownerType !== nextOwnerType) {
      nextFilters.ownerType = nextOwnerType;

      changed = true;
    }

    return {
      nextFilters,
      changed,
    };
  }, [filters, statusParam, documentTypeParam, ownerTypeParam]);

  /**
   * ==========================================================
   * SYNC URL → STORE
   * ==========================================================
   */
  useEffect(() => {
    const { nextFilters, changed } = buildUrlFilters();

    if (!changed) {
      return;
    }

    /**
     * Whenever URL filters change,
     * restart pagination from page 1.
     */
    setPage(1);

    updateFilters(nextFilters);
  }, [buildUrlFilters, setPage, updateFilters]);

  /**
   * ==========================================================
   * LOAD DOCUMENTS
   * ==========================================================
   */
  const loadDocuments = useCallback(async () => {
    clearError();

    await fetchDocuments({
      page,
      limit,
      filter: filters,
    });
  }, [clearError, fetchDocuments, page, limit, filters]);

  /**
   * ==========================================================
   * LOAD DATA
   * ==========================================================
   *
   * After URL → store synchronization,
   * fetch the current filtered data.
   */
  useEffect(() => {
    const { changed } = buildUrlFilters();

    /**
     * If URL and store are not synchronized yet,
     * wait for the synchronization effect.
     */
    if (changed) {
      return;
    }

    void loadDocuments();
  }, [buildUrlFilters, loadDocuments]);

  /**
   * ==========================================================
   * UPDATE URL PARAM
   * ==========================================================
   */
  const updateUrlParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);

    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    /**
     * New filters always start
     * from page 1.
     */
    setPage(1);

    setSearchParams(params);
  };

  /**
   * ==========================================================
   * STATUS CHANGE
   * ==========================================================
   */
  const handleStatusChange = (value: string) => {
    if (value && !isExpiryStatus(value)) {
      return;
    }

    updateUrlParam("status", value);
  };

  /**
   * ==========================================================
   * DOCUMENT TYPE CHANGE
   * ==========================================================
   */
  const handleDocumentTypeChange = (value: string) => {
    if (value && !isDocumentType(value)) {
      return;
    }

    updateUrlParam("documentType", value);
  };

  /**
   * ==========================================================
   * OWNER TYPE CHANGE
   * ==========================================================
   */
  const handleOwnerTypeChange = (value: string) => {
    if (value && !isOwnerType(value)) {
      return;
    }

    updateUrlParam("ownerType", value);
  };

  /**
   * ==========================================================
   * RESET FILTERS
   * ==========================================================
   */
  const handleResetFilters = () => {
    clearFilters();

    setPage(1);

    setSearchParams({});
  };

  /**
   * ==========================================================
   * PAGE CHANGE
   * ==========================================================
   */
  const handlePageChange = (nextPage: number) => {
    if (nextPage < 1) {
      return;
    }

    if (listResult && nextPage > listResult.pagination.totalPages) {
      return;
    }

    setPage(nextPage);
  };

  /**
   * ==========================================================
   * LIMIT CHANGE
   * ==========================================================
   */
  const handleLimitChange = (value: string) => {
    const nextLimit = Number(value);

    if (!Number.isFinite(nextLimit) || nextLimit <= 0) {
      return;
    }

    /**
     * Changing page size
     * should restart pagination.
     */
    setPage(1);

    setLimit(nextLimit);
  };

  /**
   * ==========================================================
   * VIEW DOCUMENT
   * ==========================================================
   */
  const handleViewDocument = (document: DocumentExpiryResult) => {
    navigate(`/documents/${document.documentId}`);
  };

  /**
   * ==========================================================
   * LABEL FORMATTER
   * ==========================================================
   */
  const formatLabel = (value: string) => {
    return value
      .split("_")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
  };

  /**
   * ==========================================================
   * PAGINATION
   * ==========================================================
   */
  const pagination = listResult?.pagination;

  const currentPage = pagination?.page ?? page;

  const totalPages = pagination?.totalPages ?? 1;

  const total = pagination?.total ?? 0;

  const hasPreviousPage = pagination?.hasPreviousPage ?? currentPage > 1;

  const hasNextPage = pagination?.hasNextPage ?? currentPage < totalPages;

  /**
   * ==========================================================
   * RENDER
   * ==========================================================
   */
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* ================================================== */}
      {/* HEADER */}
      {/* ================================================== */}

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          {/* ================================================== */}
          {/* BACK BUTTON */}
          {/* ================================================== */}

          <button
            type="button"
            onClick={() => navigate("/expiry")}
            disabled={isLoading}
            aria-label="Back to expiry dashboard"
            className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 shadow-sm transition hover:bg-gray-50 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          </button>

          {/* ================================================== */}
          {/* TITLE */}
          {/* ================================================== */}

          <div>
            <div className="flex items-center gap-2">
              <CalendarClock
                className="h-6 w-6 text-blue-600"
                aria-hidden="true"
              />

              <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                Document Expiry
              </h1>
            </div>

            <p className="mt-1 text-sm text-gray-500">
              View and manage vehicle and driver documents according to their
              expiry status.
            </p>
          </div>
        </div>

        {/* ================================================== */}
        {/* REFRESH */}
        {/* ================================================== */}

        <button
          type="button"
          onClick={() => {
            void loadDocuments();
          }}
          disabled={isLoading}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshCw
            className={["h-4 w-4", isLoading ? "animate-spin" : ""].join(" ")}
            aria-hidden="true"
          />

          {isLoading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* ================================================== */}
      {/* ERROR */}
      {/* ================================================== */}

      {error && (
        <div
          role="alert"
          className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3"
        >
          <AlertTriangle
            className="mt-0.5 h-5 w-5 shrink-0 text-red-600"
            aria-hidden="true"
          />

          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-red-800">
              Unable to load expiry documents
            </p>

            <p className="mt-1 text-sm text-red-700">{error}</p>
          </div>

          <button
            type="button"
            onClick={() => {
              void loadDocuments();
            }}
            className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50"
          >
            Retry
          </button>
        </div>
      )}

      {/* ================================================== */}
      {/* FILTERS */}
      {/* ================================================== */}

      <section className="mb-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-600" aria-hidden="true" />

            <div>
              <h2 className="text-sm font-semibold text-gray-900">Filters</h2>

              <p className="text-xs text-gray-500">
                Filter documents by expiry and ownership.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleResetFilters}
            className="inline-flex w-fit items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-600 transition hover:bg-gray-50"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            Reset
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* ================================================= */}
          {/* STATUS */}
          {/* ================================================= */}

          <div>
            <label
              htmlFor="expiry-status"
              className="mb-1.5 block text-xs font-semibold text-gray-700"
            >
              Expiry Status
            </label>

            <select
              id="expiry-status"
              value={filters.status ?? ""}
              onChange={(event) => handleStatusChange(event.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="">All statuses</option>

              {Object.values(EXPIRY_STATUS).map((status) => (
                <option key={status} value={status}>
                  {formatLabel(status)}
                </option>
              ))}
            </select>
          </div>

          {/* ================================================= */}
          {/* DOCUMENT TYPE */}
          {/* ================================================= */}

          <div>
            <label
              htmlFor="expiry-document-type"
              className="mb-1.5 block text-xs font-semibold text-gray-700"
            >
              Document Type
            </label>

            <select
              id="expiry-document-type"
              value={filters.documentType ?? ""}
              onChange={(event) => handleDocumentTypeChange(event.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="">All document types</option>

              {Object.values(EXPIRY_DOCUMENT_TYPE).map((type) => (
                <option key={type} value={type}>
                  {formatLabel(type)}
                </option>
              ))}
            </select>
          </div>

          {/* ================================================= */}
          {/* OWNER TYPE */}
          {/* ================================================= */}

          <div>
            <label
              htmlFor="expiry-owner-type"
              className="mb-1.5 block text-xs font-semibold text-gray-700"
            >
              Owner Type
            </label>

            <select
              id="expiry-owner-type"
              value={filters.ownerType ?? ""}
              onChange={(event) => handleOwnerTypeChange(event.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="">All owners</option>

              {Object.values(EXPIRY_DOCUMENT_OWNER_TYPE).map((type) => (
                <option key={type} value={type}>
                  {formatLabel(type)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* ================================================== */}
      {/* RESULT HEADER */}
      {/* ================================================== */}

      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Expiry Documents
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            {total === 0
              ? "No matching documents."
              : `${total} document${total === 1 ? "" : "s"} found.`}
          </p>
        </div>

        {filters.status && (
          <span className="inline-flex w-fit rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-semibold text-gray-600">
            Status: {formatLabel(filters.status)}
          </span>
        )}
      </div>

      {/* ================================================== */}
      {/* TABLE */}
      {/* ================================================== */}

      <ExpiryTable
        documents={documents}
        loading={isLoading}
        onView={handleViewDocument}
        emptyMessage="No documents match the selected filters."
      />

      {/* ================================================== */}
      {/* PAGINATION */}
      {/* ================================================== */}

      {!isLoading && total > 0 && (
        <div className="mt-5 flex flex-col gap-4 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-gray-500">
            Page{" "}
            <span className="font-semibold text-gray-700">{currentPage}</span>{" "}
            of <span className="font-semibold text-gray-700">{totalPages}</span>
          </p>

          <div className="flex items-center gap-3">
            {/* PAGE SIZE */}

            <select
              value={limit}
              onChange={(event) => handleLimitChange(event.target.value)}
              className="rounded-lg border border-gray-300 bg-white px-2.5 py-2 text-xs font-medium text-gray-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              aria-label="Documents per page"
            >
              <option value={10}>10 / page</option>

              <option value={20}>20 / page</option>

              <option value={50}>50 / page</option>

              <option value={100}>100 / page</option>
            </select>

            {/* PREVIOUS */}

            <button
              type="button"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={!hasPreviousPage || isLoading}
              className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              Previous
            </button>

            {/* NEXT */}

            <button
              type="button"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={!hasNextPage || isLoading}
              className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpiryListPage;
