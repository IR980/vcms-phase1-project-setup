import { Eye, Pencil, Trash2, FileText, ExternalLink } from "lucide-react";

import {
  type Document,
  DOCUMENT_TYPE_LABELS,
} from "../../types/document.types";

import DocumentStatusBadge from "./DocumentStatusBadge";
import DocumentExpiryBadge from "./DocumentExpiryBadge";

/**
 * ============================================================
 * PROPS
 * ============================================================
 */
interface DocumentTableProps {
  /**
   * Documents to display.
   */
  documents: Document[];

  /**
   * Loading state.
   */
  isLoading?: boolean;

  /**
   * View document handler.
   */
  onView?: (document: Document) => void;

  /**
   * Edit document handler.
   */
  onEdit?: (document: Document) => void;

  /**
   * Delete document handler.
   */
  onDelete?: (document: Document) => void;

  /**
   * Optional file preview handler.
   *
   * If not provided, file opens in a new browser tab.
   */
  onOpenFile?: (document: Document) => void;

  /**
   * Disable all actions.
   */
  disabled?: boolean;
}

/**
 * ============================================================
 * DATE FORMATTER
 * ============================================================
 */
const formatDate = (value?: string): string => {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

/**
 * ============================================================
 * OWNER DISPLAY
 * ============================================================
 */
const getOwnerLabel = (document: Document): string => {
  if (document.ownerType === "vehicle") {
    return "Vehicle";
  }

  return "Driver";
};

/**
 * ============================================================
 * DOCUMENT TABLE
 * ============================================================
 */
const DocumentTable = ({
  documents,

  isLoading = false,

  onView,

  onEdit,

  onDelete,

  onOpenFile,

  disabled = false,
}: DocumentTableProps) => {
  /**
   * ==========================================================
   * LOADING STATE
   * ==========================================================
   */
  if (isLoading) {
    return (
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-262.5 w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                {[
                  "Document",
                  "Owner",
                  "Document No.",
                  "Issue Date",
                  "Expiry",
                  "Verification",
                  "Actions",
                ].map((heading) => (
                  <th
                    key={heading}
                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {Array.from({
                length: 6,
              }).map((_, index) => (
                <tr
                  key={index}
                  className="border-b border-gray-100 last:border-b-0"
                >
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 animate-pulse rounded-lg bg-gray-200" />

                      <div className="space-y-2">
                        <div className="h-3 w-24 animate-pulse rounded bg-gray-200" />

                        <div className="h-2.5 w-16 animate-pulse rounded bg-gray-100" />
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-4">
                    <div className="h-3 w-20 animate-pulse rounded bg-gray-200" />
                  </td>

                  <td className="px-4 py-4">
                    <div className="h-3 w-28 animate-pulse rounded bg-gray-200" />
                  </td>

                  <td className="px-4 py-4">
                    <div className="h-3 w-24 animate-pulse rounded bg-gray-200" />
                  </td>

                  <td className="px-4 py-4">
                    <div className="h-6 w-36 animate-pulse rounded-full bg-gray-200" />
                  </td>

                  <td className="px-4 py-4">
                    <div className="h-6 w-24 animate-pulse rounded-full bg-gray-200" />
                  </td>

                  <td className="px-4 py-4">
                    <div className="h-8 w-24 animate-pulse rounded bg-gray-200" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  /**
   * ==========================================================
   * EMPTY STATE
   * ==========================================================
   */
  if (documents.length === 0) {
    return (
      <div className="flex min-h-75 flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white px-6 py-12 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-500">
          <FileText className="h-7 w-7" aria-hidden="true" />
        </div>

        <h3 className="text-sm font-semibold text-gray-900">
          No documents found
        </h3>

        <p className="mt-1 max-w-sm text-sm text-gray-500">
          No documents match the current filters. Upload a document or change
          your search criteria.
        </p>
      </div>
    );
  }

  /**
   * ==========================================================
   * TABLE
   * ==========================================================
   */
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-275 w-full">
          {/* ================================================= */}
          {/* TABLE HEADER */}
          {/* ================================================= */}
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                Document
              </th>

              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                Owner
              </th>

              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                Document No.
              </th>

              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                Issue Date
              </th>

              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                Expiry
              </th>

              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                Verification
              </th>

              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                Actions
              </th>
            </tr>
          </thead>

          {/* ================================================= */}
          {/* TABLE BODY */}
          {/* ================================================= */}
          <tbody className="divide-y divide-gray-100">
            {documents.map((document) => (
              <tr
                key={document._id}
                className="group transition hover:bg-gray-50/70"
              >
                {/* ======================================= */}
                {/* DOCUMENT */}
                {/* ======================================= */}
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    {/* File icon */}
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                      <FileText className="h-5 w-5" aria-hidden="true" />
                    </div>

                    {/* Document info */}
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-gray-900">
                        {DOCUMENT_TYPE_LABELS[document.documentType] ??
                          document.documentType}
                      </p>

                      <p className="mt-0.5 max-w-47.5 truncate text-xs text-gray-500">
                        {document.originalFileName}
                      </p>
                    </div>
                  </div>
                </td>

                {/* ======================================= */}
                {/* OWNER */}
                {/* ======================================= */}
                <td className="px-4 py-4">
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {getOwnerLabel(document)}
                    </p>

                    <p className="mt-0.5 text-xs text-gray-500">
                      {document.ownerType === "vehicle"
                        ? document.vehicleId
                          ? `ID: ${document.vehicleId}`
                          : "Vehicle not linked"
                        : document.driverId
                          ? `ID: ${document.driverId}`
                          : "Driver not linked"}
                    </p>
                  </div>
                </td>

                {/* ======================================= */}
                {/* DOCUMENT NUMBER */}
                {/* ======================================= */}
                <td className="px-4 py-4">
                  <span className="font-mono text-sm text-gray-700">
                    {document.documentNumber || "—"}
                  </span>
                </td>

                {/* ======================================= */}
                {/* ISSUE DATE */}
                {/* ======================================= */}
                <td className="px-4 py-4">
                  <span className="text-sm text-gray-600">
                    {formatDate(document.issueDate)}
                  </span>
                </td>

                {/* ======================================= */}
                {/* EXPIRY */}
                {/* ======================================= */}
                <td className="px-4 py-4">
                  <div className="flex flex-col items-start gap-1.5">
                    <span className="text-xs text-gray-500">
                      {formatDate(document.expiryDate)}
                    </span>

                    <DocumentExpiryBadge
                      status={document.complianceStatus}
                      daysRemaining={document.daysRemaining}
                      size="sm"
                    />
                  </div>
                </td>

                {/* ======================================= */}
                {/* VERIFICATION */}
                {/* ======================================= */}
                <td className="px-4 py-4">
                  <DocumentStatusBadge
                    status={document.verificationStatus}
                    size="sm"
                  />
                </td>

                {/* ======================================= */}
                {/* ACTIONS */}
                {/* ======================================= */}
                <td className="px-4 py-4">
                  <div className="flex items-center justify-end gap-1">
                    {/* View */}
                    {onView && (
                      <button
                        type="button"
                        onClick={() => onView(document)}
                        disabled={disabled}
                        title="View document"
                        aria-label={`View ${DOCUMENT_TYPE_LABELS[document.documentType] ?? "document"}`}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition hover:bg-blue-50 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Eye className="h-4 w-4" aria-hidden="true" />
                      </button>
                    )}

                    {/* Open file */}
                    {onOpenFile && (
                      <button
                        type="button"
                        onClick={() => onOpenFile(document)}
                        disabled={disabled}
                        title="Open uploaded file"
                        aria-label="Open uploaded file"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <ExternalLink className="h-4 w-4" aria-hidden="true" />
                      </button>
                    )}

                    {/* Edit */}
                    {onEdit && (
                      <button
                        type="button"
                        onClick={() => onEdit(document)}
                        disabled={disabled}
                        title="Edit document"
                        aria-label="Edit document"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition hover:bg-amber-50 hover:text-amber-600 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Pencil className="h-4 w-4" aria-hidden="true" />
                      </button>
                    )}

                    {/* Delete */}
                    {onDelete && (
                      <button
                        type="button"
                        onClick={() => onDelete(document)}
                        disabled={disabled}
                        title="Delete document"
                        aria-label="Delete document"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ===================================================== */}
      {/* MOBILE HINT */}
      {/* ===================================================== */}
      <div className="border-t border-gray-100 px-4 py-2 text-center text-xs text-gray-400 lg:hidden">
        Swipe horizontally to view all document details.
      </div>
    </div>
  );
};

export default DocumentTable;
