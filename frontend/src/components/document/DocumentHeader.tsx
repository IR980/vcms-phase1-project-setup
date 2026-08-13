import { Search, Upload, FileText, X } from "lucide-react";

import {
  type DocumentType,
  DOCUMENT_TYPE_LABELS,
} from "../../types/document.types";

/**
 * ============================================================
 * PROPS
 * ============================================================
 */
interface DocumentHeaderProps {
  /**
   * Page title.
   */
  title?: string;

  /**
   * Page description.
   */
  description?: string;

  /**
   * Current search value.
   */
  search: string;

  /**
   * Search change handler.
   */
  onSearchChange: (value: string) => void;

  /**
   * Current document type filter.
   */
  documentType: DocumentType | "";

  /**
   * Document type filter handler.
   */
  onDocumentTypeChange: (value: DocumentType | "") => void;

  /**
   * Expiry filter.
   *
   * Supported values:
   *
   * ""       = All
   * "30"     = Next 30 days
   * "7"      = Next 7 days
   * "expired" = Already expired
   */
  expiryFilter: "" | "7" | "30" | "expired";

  /**
   * Expiry filter handler.
   */
  onExpiryFilterChange: (value: "" | "7" | "30" | "expired") => void;

  /**
   * Upload button handler.
   */
  onAddDocument: () => void;

  /**
   * Optional clear filters handler.
   */
  onClearFilters?: () => void;

  /**
   * Whether filters are currently active.
   */
  hasActiveFilters?: boolean;

  /**
   * Disable controls.
   */
  disabled?: boolean;
}

/**
 * ============================================================
 * COMPONENT
 * ============================================================
 */
const DocumentHeader = ({
  title = "Documents",

  description = "Manage vehicle and driver documents and monitor their expiry dates.",

  search,

  onSearchChange,

  documentType,

  onDocumentTypeChange,

  expiryFilter,

  onExpiryFilterChange,

  onAddDocument,

  onClearFilters,

  hasActiveFilters = false,

  disabled = false,
}: DocumentHeaderProps) => {
  /**
   * ----------------------------------------------------------
   * Document type options
   * ----------------------------------------------------------
   */
  const documentTypes: DocumentType[] = [
    "rc",
    "puc",
    "fitness",
    "insurance",
    "permit",
    "road_tax",
    "driving_license",
    "medical_certificate",
    "other",
  ];

  return (
    <div className="space-y-5">
      {/* ================================================== */}
      {/* HEADER */}
      {/* ================================================== */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {/* Title */}
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <FileText className="h-5 w-5" aria-hidden="true" />
          </div>

          <div>
            <h1 className="text-xl font-semibold tracking-tight text-gray-900 sm:text-2xl">
              {title}
            </h1>

            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              {description}
            </p>
          </div>
        </div>

        {/* Add document */}
        <button
          type="button"
          onClick={onAddDocument}
          disabled={disabled}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          <Upload className="h-4 w-4" aria-hidden="true" />
          Upload Document
        </button>
      </div>

      {/* ================================================== */}
      {/* FILTER BAR */}
      {/* ================================================== */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
          {/* Search */}
          <div className="relative min-w-0 flex-1">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
              aria-hidden="true"
            />

            <input
              type="search"
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              disabled={disabled}
              placeholder="Search by document number, authority or file name..."
              className="h-10 w-full rounded-lg border border-gray-300 bg-white pl-9 pr-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-50"
            />
          </div>

          {/* Document Type */}
          <div className="w-full xl:w-52">
            <select
              value={documentType}
              onChange={(event) =>
                onDocumentTypeChange(event.target.value as DocumentType | "")
              }
              disabled={disabled}
              className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-50"
            >
              <option value="">All Document Types</option>

              {documentTypes.map((type) => (
                <option key={type} value={type}>
                  {DOCUMENT_TYPE_LABELS[type]}
                </option>
              ))}
            </select>
          </div>

          {/* Expiry */}
          <div className="w-full xl:w-48">
            <select
              value={expiryFilter}
              onChange={(event) =>
                onExpiryFilterChange(
                  event.target.value as "" | "7" | "30" | "expired",
                )
              }
              disabled={disabled}
              className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-50"
            >
              <option value="">All Expiry Status</option>

              <option value="7">Expiring in 7 Days</option>

              <option value="30">Expiring in 30 Days</option>

              <option value="expired">Expired Documents</option>
            </select>
          </div>

          {/* Clear filters */}
          {hasActiveFilters && onClearFilters && (
            <button
              type="button"
              onClick={onClearFilters}
              disabled={disabled}
              className="inline-flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-lg border border-gray-300 px-3 text-sm font-medium text-gray-600 transition hover:bg-gray-50 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <X className="h-4 w-4" aria-hidden="true" />
              Clear
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentHeader;
