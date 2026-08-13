import { useCallback, useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";

import {
  RefreshCw,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";

import DocumentHeader from "../../components/document/DocumentHeader";

import DocumentTable from "../../components/document/DocumentTable";

import { useDocumentStore } from "../../store/document.store";

import type { Document, DocumentType } from "../../types/document.types";

/**
 * ============================================================
 * TYPES
 * ============================================================
 */

type ExpiryFilter = "" | "7" | "30" | "expired";

/**
 * ============================================================
 * COMPONENT
 * ============================================================
 */

const DocumentListPage = () => {
  /**
   * ==========================================================
   * ROUTER
   * ==========================================================
   */

  const navigate = useNavigate();

  /**
   * ==========================================================
   * STORE
   * ==========================================================
   */

  const documents = useDocumentStore((state) => state.documents);

  const pagination = useDocumentStore((state) => state.pagination);

  const filters = useDocumentStore((state) => state.filters);

  const isLoading = useDocumentStore((state) => state.isLoading);

  const isDeleting = useDocumentStore((state) => state.isDeleting);

  const error = useDocumentStore((state) => state.error);

  const fetchDocuments = useDocumentStore((state) => state.fetchDocuments);

  const setFilters = useDocumentStore((state) => state.setFilters);

  const resetFilters = useDocumentStore((state) => state.resetFilters);

  const deleteDocument = useDocumentStore((state) => state.deleteDocument);

  const clearError = useDocumentStore((state) => state.clearError);

  /**
   * ==========================================================
   * LOCAL SEARCH
   * ==========================================================
   */

  const [searchInput, setSearchInput] = useState(filters.search);

  /**
   * ==========================================================
   * LOCAL EXPIRY FILTER
   * ==========================================================
   */

  const [expiryFilter, setExpiryFilter] = useState<ExpiryFilter>(
    filters.expired
      ? "expired"
      : filters.expiringWithin === 7
        ? "7"
        : filters.expiringWithin === 30
          ? "30"
          : "",
  );

  /**
   * ==========================================================
   * INITIAL LOAD
   * ==========================================================
   */

  useEffect(() => {
    void fetchDocuments({
      page: 1,
      limit: 10,
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder,
    });

    // Intentionally only run on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * ==========================================================
   * SEARCH DEBOUNCE
   * ==========================================================
   */

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (searchInput === filters.search) {
        return;
      }

      setFilters({
        search: searchInput,
      });

      void fetchDocuments({
        page: 1,
        search: searchInput.trim(),
      });
    }, 400);

    return () => {
      window.clearTimeout(timer);
    };
  }, [searchInput, filters.search, setFilters, fetchDocuments]);

  /**
   * ==========================================================
   * DOCUMENT TYPE CHANGE
   * ==========================================================
   */

  const handleDocumentTypeChange = useCallback(
    (value: DocumentType | "") => {
      setFilters({
        documentType: value,
      });

      void fetchDocuments({
        page: 1,
        documentType: value || undefined,
      });
    },
    [setFilters, fetchDocuments],
  );

  /**
   * ==========================================================
   * EXPIRY FILTER CHANGE
   * ==========================================================
   */

  const handleExpiryFilterChange = useCallback(
    (value: ExpiryFilter) => {
      setExpiryFilter(value);

      /**
       * Clear expiry filters.
       */

      if (value === "") {
        setFilters({
          expired: undefined,
          expiringWithin: undefined,
        });

        void fetchDocuments({
          page: 1,
          expired: undefined,
          expiringWithin: undefined,
        });

        return;
      }

      /**
       * Expired.
       */

      if (value === "expired") {
        setFilters({
          expired: true,
          expiringWithin: undefined,
        });

        void fetchDocuments({
          page: 1,
          expired: true,
          expiringWithin: undefined,
        });

        return;
      }

      /**
       * Expiring within N days.
       */

      const days = Number(value);

      setFilters({
        expired: undefined,
        expiringWithin: days,
      });

      void fetchDocuments({
        page: 1,
        expired: undefined,
        expiringWithin: days,
      });
    },
    [setFilters, fetchDocuments],
  );

  /**
   * ==========================================================
   * CLEAR FILTERS
   * ==========================================================
   */

  const handleClearFilters = useCallback(() => {
    setSearchInput("");

    setExpiryFilter("");

    resetFilters();

    void fetchDocuments({
      page: 1,
      limit: 10,
      search: "",
      documentType: undefined,
      ownerType: undefined,
      companyId: undefined,
      vehicleId: undefined,
      driverId: undefined,
      verificationStatus: undefined,
      expiryFrom: undefined,
      expiryTo: undefined,
      expired: undefined,
      expiringWithin: undefined,
      sortBy: "expiryDate",
      sortOrder: "asc",
    });
  }, [resetFilters, fetchDocuments]);

  /**
   * ==========================================================
   * ACTIVE FILTER CHECK
   * ==========================================================
   */

  const hasActiveFilters = Boolean(
    searchInput ||
    filters.documentType ||
    filters.ownerType ||
    filters.companyId ||
    filters.vehicleId ||
    filters.driverId ||
    filters.verificationStatus ||
    filters.expiryFrom ||
    filters.expiryTo ||
    expiryFilter,
  );

  /**
   * ==========================================================
   * REFRESH
   * ==========================================================
   */

  const handleRefresh = useCallback(() => {
    void fetchDocuments({
      page: pagination?.page ?? 1,
      limit: pagination?.limit ?? 10,
    });
  }, [fetchDocuments, pagination?.page, pagination?.limit]);

  /**
   * ==========================================================
   * VIEW DOCUMENT
   * ==========================================================
   */

  const handleView = useCallback(
    (document: Document) => {
      navigate(`/documents/${document._id}`);
    },
    [navigate],
  );

  /**
   * ==========================================================
   * EDIT DOCUMENT
   * ==========================================================
   */

  const handleEdit = useCallback(
    (document: Document) => {
      navigate(`/documents/${document._id}/edit`);
    },
    [navigate],
  );

  /**
   * ==========================================================
   * OPEN CLOUDINARY FILE
   * ==========================================================
   */

  const handleOpenFile = useCallback((document: Document) => {
    if (!document.fileUrl) {
      return;
    }

    window.open(document.fileUrl, "_blank", "noopener,noreferrer");
  }, []);

  /**
   * ==========================================================
   * DELETE DOCUMENT
   * ==========================================================
   */

  const handleDelete = useCallback(
    async (document: Document) => {
      const documentName =
        document.documentNumber || document.originalFileName || "this document";

      const confirmed = window.confirm(
        `Are you sure you want to delete ${documentName}? This action cannot be undone.`,
      );

      if (!confirmed) {
        return;
      }

      await deleteDocument(document._id);
    },
    [deleteDocument],
  );

  /**
   * ==========================================================
   * PAGINATION
   * ==========================================================
   */

  const handlePageChange = useCallback(
    (page: number) => {
      if (page < 1 || page > (pagination?.totalPages ?? 1)) {
        return;
      }

      void fetchDocuments({
        page,
        limit: pagination?.limit ?? 10,
      });

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    },
    [fetchDocuments, pagination?.limit, pagination?.totalPages],
  );

  /**
   * ==========================================================
   * ADD DOCUMENT
   * ==========================================================
   */

  const handleAddDocument = useCallback(() => {
    navigate("/documents/new");
  }, [navigate]);

  /**
   * ==========================================================
   * OPEN COMPLIANCE DASHBOARD
   * ==========================================================
   */

  const handleOpenCompliance = useCallback(() => {
    navigate("/documents/compliance");
  }, [navigate]);

  /**
   * ==========================================================
   * PAGINATION VALUES
   * ==========================================================
   */

  const currentPage = pagination?.page ?? 1;

  const totalPages = pagination?.totalPages ?? 1;

  const totalDocuments = pagination?.total ?? documents.length;

  /**
   * ==========================================================
   * PAGE NUMBERS
   * ==========================================================
   */

  const getPageNumbers = (): number[] => {
    if (totalPages <= 5) {
      return Array.from(
        {
          length: totalPages,
        },
        (_, index) => index + 1,
      );
    }

    if (currentPage <= 3) {
      return [1, 2, 3, 4, 5];
    }

    if (currentPage >= totalPages - 2) {
      return [
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    }

    return [
      currentPage - 2,
      currentPage - 1,
      currentPage,
      currentPage + 1,
      currentPage + 2,
    ];
  };

  const pageNumbers = getPageNumbers();

  /**
   * ==========================================================
   * RENDER
   * ==========================================================
   */

  return (
    <div className="space-y-6">
      {/* ==================================================== */}
      {/* HEADER */}
      {/* ==================================================== */}

      <DocumentHeader
        search={searchInput}
        onSearchChange={setSearchInput}
        documentType={filters.documentType}
        onDocumentTypeChange={handleDocumentTypeChange}
        expiryFilter={expiryFilter}
        onExpiryFilterChange={handleExpiryFilterChange}
        onAddDocument={handleAddDocument}
        onClearFilters={handleClearFilters}
        hasActiveFilters={hasActiveFilters}
        disabled={isLoading || isDeleting}
      />

      {/* ==================================================== */}
      {/* ERROR */}
      {/* ==================================================== */}

      {error && (
        <div
          role="alert"
          className="flex items-start justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3"
        >
          <div className="flex items-start gap-3">
            <AlertCircle
              className="mt-0.5 h-5 w-5 shrink-0 text-red-600"
              aria-hidden="true"
            />

            <div>
              <p className="text-sm font-semibold text-red-800">
                Unable to load documents
              </p>

              <p className="mt-0.5 text-sm text-red-700">{error}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={clearError}
            className="text-xs font-medium text-red-600 hover:text-red-800"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ==================================================== */}
      {/* TOOLBAR */}
      {/* ==================================================== */}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Document count */}

        <div>
          <p className="text-sm text-gray-500">
            {totalDocuments} {totalDocuments === 1 ? "document" : "documents"}{" "}
            found
          </p>
        </div>

        {/* Actions */}

        <div className="flex flex-wrap items-center gap-2">
          {/* ================================================ */}
          {/* COMPLIANCE */}
          {/* ================================================ */}

          <button
            type="button"
            onClick={handleOpenCompliance}
            disabled={isLoading || isDeleting}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 text-sm font-medium text-blue-700 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            Compliance
          </button>

          {/* ================================================ */}
          {/* REFRESH */}
          {/* ================================================ */}

          <button
            type="button"
            onClick={handleRefresh}
            disabled={isLoading}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-3 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              className={["h-4 w-4", isLoading ? "animate-spin" : ""]
                .filter(Boolean)
                .join(" ")}
              aria-hidden="true"
            />
            Refresh
          </button>
        </div>
      </div>

      {/* ==================================================== */}
      {/* TABLE */}
      {/* ==================================================== */}

      <DocumentTable
        documents={documents}
        isLoading={isLoading}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onOpenFile={handleOpenFile}
        disabled={isDeleting}
      />

      {/* ==================================================== */}
      {/* PAGINATION */}
      {/* ==================================================== */}

      {pagination && totalPages > 1 && (
        <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          {/* Summary */}

          <p className="text-sm text-gray-500">
            Page{" "}
            <span className="font-medium text-gray-800">{currentPage}</span> of{" "}
            <span className="font-medium text-gray-800">{totalPages}</span>
          </p>

          {/* Controls */}

          <div className="flex items-center justify-center gap-1">
            {/* Previous */}

            <button
              type="button"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1 || isLoading}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </button>

            {/* Page numbers */}

            {pageNumbers.map((page) => (
              <button
                key={page}
                type="button"
                onClick={() => handlePageChange(page)}
                disabled={isLoading}
                className={[
                  "inline-flex h-9 min-w-9 items-center justify-center rounded-lg border px-2 text-sm font-medium transition",

                  page === currentPage
                    ? "border-blue-600 bg-blue-600 text-white"
                    : "border-gray-300 text-gray-600 hover:bg-gray-50",
                ].join(" ")}
              >
                {page}
              </button>
            ))}

            {/* Next */}

            <button
              type="button"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages || isLoading}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentListPage;
