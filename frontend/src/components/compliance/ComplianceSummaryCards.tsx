import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  FileText,
  ScanSearch,
  XCircle,
} from "lucide-react";

import type { ComplianceSummaryDto } from "../../types/compliance.dto";

/**
 * ============================================================
 * PROPS
 * ============================================================
 */

interface ComplianceSummaryCardsProps {
  /**
   * Compliance summary returned by API.
   */
  summary: ComplianceSummaryDto | null;

  /**
   * Loading state.
   */
  isLoading?: boolean;
}

/**
 * ============================================================
 * COMPONENT
 * ============================================================
 */

const ComplianceSummaryCards = ({
  summary,
  isLoading = false,
}: ComplianceSummaryCardsProps) => {
  /**
   * ==========================================================
   * LOADING STATE
   * ==========================================================
   */

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {Array.from({
          length: 5,
        }).map((_, index) => (
          <div
            key={index}
            className="animate-pulse rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="h-4 w-20 rounded bg-gray-200" />

                <div className="mt-3 h-8 w-16 rounded bg-gray-200" />
              </div>

              <div className="h-10 w-10 rounded-lg bg-gray-200" />
            </div>

            <div className="mt-4 h-3 w-28 rounded bg-gray-200" />
          </div>
        ))}
      </div>
    );
  }

  /**
   * ==========================================================
   * EMPTY SUMMARY
   * ==========================================================
   */

  if (!summary) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6 text-center shadow-sm">
        <FileText
          className="mx-auto h-8 w-8 text-gray-400"
          aria-hidden="true"
        />

        <p className="mt-2 text-sm font-medium text-gray-700">
          Compliance data is not available.
        </p>

        <p className="mt-1 text-xs text-gray-500">
          Load compliance data to view document statistics.
        </p>
      </div>
    );
  }

  /**
   * ==========================================================
   * CARD DATA
   * ==========================================================
   */

  const cards = [
    {
      key: "total",

      label: "Total Documents",

      value: summary.totalDocuments,

      icon: FileText,

      iconWrapper: "bg-blue-50 text-blue-600",

      description: "All registered documents",
    },

    {
      key: "valid",

      label: "Valid",

      value: summary.valid,

      icon: CheckCircle2,

      iconWrapper: "bg-green-50 text-green-600",

      description: "Documents currently valid",
    },

    {
      key: "expiring",

      label: "Expiring Soon",

      value: summary.expiringSoon,

      icon: Clock3,

      iconWrapper: "bg-yellow-50 text-yellow-600",

      description: "Expiring within 30 days",
    },

    {
      key: "expired",

      label: "Expired",

      value: summary.expired,

      icon: XCircle,

      iconWrapper: "bg-red-50 text-red-600",

      description: "Documents already expired",
    },

    {
      key: "ocr",

      label: "OCR Pending",

      value: summary.ocrPending,

      icon: ScanSearch,

      iconWrapper: "bg-purple-50 text-purple-600",

      description: "Documents waiting for OCR",
    },
  ];

  /**
   * ==========================================================
   * RENDER
   * ==========================================================
   */

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {cards.map(
        ({ key, label, value, icon: Icon, iconWrapper, description }) => (
          <div
            key={key}
            className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow duration-200 hover:shadow-md"
          >
            {/* ==================================================
                CARD HEADER
                ================================================== */}

            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-500">{label}</p>

                <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900">
                  {value}
                </p>
              </div>

              {/* ==================================================
                  ICON
                  ================================================== */}

              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${iconWrapper}`}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
              </div>
            </div>

            {/* ==================================================
                DESCRIPTION
                ================================================== */}

            <p className="mt-4 flex items-center gap-1.5 text-xs text-gray-500">
              {key === "expired" && summary.expired > 0 && (
                <AlertTriangle
                  className="h-3.5 w-3.5 text-red-500"
                  aria-hidden="true"
                />
              )}

              {description}
            </p>
          </div>
        ),
      )}
    </div>
  );
};

export default ComplianceSummaryCards;
