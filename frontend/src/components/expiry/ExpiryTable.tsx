import { FileText, ExternalLink } from "lucide-react";

import type { DocumentExpiryResult } from "../../types/expiry.types";

import ExpiryStatusBadge from "./ExpiryStatusBadge";

/**
 * ============================================================
 * PROPS
 * ============================================================
 */
interface ExpiryTableProps {
  documents: DocumentExpiryResult[];

  loading?: boolean;

  onView?: (document: DocumentExpiryResult) => void;

  emptyMessage?: string;
}

/**
 * ============================================================
 * HELPERS
 * ============================================================
 */

/**
 * Format document type.
 *
 * Example:
 *
 * road_tax → Road Tax
 */
const formatDocumentType = (value: string): string => {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

/**
 * Format expiry date.
 */
const formatDate = (value: string): string => {
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
 * DAYS REMAINING DISPLAY
 * ============================================================
 */
const getDaysRemainingText = (daysRemaining: number): string => {
  if (daysRemaining < 0) {
    const days = Math.abs(daysRemaining);

    return `${days} day${days === 1 ? "" : "s"} overdue`;
  }

  if (daysRemaining === 0) {
    return "Today";
  }

  return `${daysRemaining} day${daysRemaining === 1 ? "" : "s"} left`;
};

/**
 ============================================================
 * COMPONENT
 * ============================================================
 */
const ExpiryTable = ({
  documents,
  loading = false,
  onView,
  emptyMessage = "No expiry records found.",
}: ExpiryTableProps) => {
  /**
   * ----------------------------------------------------------
   * Loading
   * ----------------------------------------------------------
   */
  if (loading) {
    return (
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                {[
                  "Document",
                  "Owner",
                  "Expiry Date",
                  "Remaining",
                  "Status",
                  "Verification",
                  "Action",
                ].map((heading) => (
                  <th
                    key={heading}
                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {Array.from({
                length: 5,
              }).map((_, index) => (
                <tr
                  key={index}
                  className="border-b border-gray-100 last:border-0"
                >
                  {Array.from({
                    length: 7,
                  }).map((__, cellIndex) => (
                    <td key={cellIndex} className="px-4 py-4">
                      <div className="h-4 w-24 animate-pulse rounded bg-gray-100" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  /**
   * ----------------------------------------------------------
   * Empty
   * ----------------------------------------------------------
   */
  if (documents.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-12 text-center">
        <FileText
          className="mx-auto h-10 w-10 text-gray-300"
          aria-hidden="true"
        />

        <h3 className="mt-3 text-sm font-semibold text-gray-900">
          No documents
        </h3>

        <p className="mt-1 text-sm text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  /**
   * ----------------------------------------------------------
   * Table
   * ----------------------------------------------------------
   */
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Document
              </th>

              <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Owner
              </th>

              <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Expiry Date
              </th>

              <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Remaining
              </th>

              <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Status
              </th>

              <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Verification
              </th>

              <th className="whitespace-nowrap px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                Action
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100 bg-white">
            {documents.map((document) => (
              <tr
                key={document.documentId}
                className="transition hover:bg-gray-50"
              >
                {/* DOCUMENT */}
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                      <FileText
                        className="h-4 w-4 text-gray-600"
                        aria-hidden="true"
                      />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-gray-900">
                        {formatDocumentType(document.documentType)}
                      </p>

                      <p className="mt-0.5 truncate text-xs text-gray-500">
                        {document.documentNumber ||
                          document.originalFileName ||
                          document.documentId}
                      </p>
                    </div>
                  </div>
                </td>

                {/* OWNER */}
                <td className="px-4 py-4">
                  <div>
                    <p className="text-sm font-medium capitalize text-gray-800">
                      {document.ownerType}
                    </p>

                    <p className="mt-0.5 text-xs text-gray-500">
                      {document.vehicleId || document.driverId || "—"}
                    </p>
                  </div>
                </td>

                {/* EXPIRY DATE */}
                <td className="whitespace-nowrap px-4 py-4">
                  <p className="text-sm font-medium text-gray-900">
                    {formatDate(document.expiryDate)}
                  </p>
                </td>

                {/* REMAINING */}
                <td className="whitespace-nowrap px-4 py-4">
                  <p
                    className={[
                      "text-sm font-semibold",
                      document.isExpired
                        ? "text-red-600"
                        : document.isCritical
                          ? "text-orange-600"
                          : document.isExpiringSoon
                            ? "text-yellow-700"
                            : "text-green-600",
                    ].join(" ")}
                  >
                    {getDaysRemainingText(document.daysRemaining)}
                  </p>
                </td>

                {/* STATUS */}
                <td className="whitespace-nowrap px-4 py-4">
                  <ExpiryStatusBadge status={document.status} />
                </td>

                {/* VERIFICATION */}
                <td className="whitespace-nowrap px-4 py-4">
                  <span className="inline-flex rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs font-medium capitalize text-gray-600">
                    {document.verificationStatus.replace("_", " ")}
                  </span>
                </td>

                {/* ACTION */}
                <td className="whitespace-nowrap px-4 py-4 text-right">
                  {onView ? (
                    <button
                      type="button"
                      onClick={() => onView(document)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-50"
                    >
                      <ExternalLink
                        className="h-3.5 w-3.5"
                        aria-hidden="true"
                      />
                      View
                    </button>
                  ) : (
                    <span className="text-xs text-gray-400">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ExpiryTable;
