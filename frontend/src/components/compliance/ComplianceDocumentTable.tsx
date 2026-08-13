import { ExternalLink, FileText, Car, User, ScanText } from "lucide-react";

import type { ComplianceDocumentDto } from "../../types/compliance.dto";

import ComplianceStatusBadge from "./ComplianceStatusBadge";
import ComplianceExpiryBadge from "./ComplianceExpiryBadge";

/**
 * ============================================================
 * PROPS
 * ============================================================
 */

interface ComplianceDocumentTableProps {
  /**
   * Real documents returned by compliance API.
   */
  documents: ComplianceDocumentDto[];

  /**
   * Loading state.
   */
  isLoading?: boolean;

  /**
   * Optional title.
   */
  title?: string;

  /**
   * Empty-state message.
   */
  emptyMessage?: string;

  /**
   * Called when user wants to open document details.
   */
  onView?: (document: ComplianceDocumentDto) => void;

  /**
   * Optional custom class.
   */
  className?: string;
}

/**
 * ============================================================
 * DOCUMENT TYPE LABEL
 * ============================================================
 */

const getDocumentTypeLabel = (documentType: string): string => {
  const labels: Record<string, string> = {
    rc: "Registration Certificate",

    puc: "Pollution Certificate",

    fitness: "Fitness Certificate",

    insurance: "Insurance",

    permit: "Permit",

    road_tax: "Road Tax",

    driving_license: "Driving License",

    medical_certificate: "Medical Certificate",

    other: "Other",
  };

  return labels[documentType] ?? documentType;
};

/**
 * ============================================================
 * OWNER LABEL
 * ============================================================
 */

const getOwnerLabel = (document: ComplianceDocumentDto): string => {
  if (document.ownerType === "vehicle") {
    return "Vehicle";
  }

  if (document.ownerType === "driver") {
    return "Driver";
  }

  return "Unknown";
};

/**
 * ============================================================
 * COMPONENT
 * ============================================================
 */

const ComplianceDocumentTable = ({
  documents,
  isLoading = false,
  title = "Documents",
  emptyMessage = "No compliance documents found.",
  onView,
  className = "",
}: ComplianceDocumentTableProps) => {
  /**
   * ==========================================================
   * LOADING
   * ==========================================================
   */

  if (isLoading) {
    return (
      <div
        className={[
          "overflow-hidden rounded-xl",
          "border border-gray-200",
          "bg-white shadow-sm",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {/* Header */}

        <div className="border-b border-gray-200 px-5 py-4">
          <div className="h-5 w-32 animate-pulse rounded bg-gray-200" />
        </div>

        {/* Skeleton rows */}

        <div className="divide-y divide-gray-100">
          {Array.from({
            length: 5,
          }).map((_, index) => (
            <div key={index} className="animate-pulse px-5 py-4">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-lg bg-gray-200" />

                <div className="flex-1 space-y-2">
                  <div className="h-4 w-40 rounded bg-gray-200" />

                  <div className="h-3 w-24 rounded bg-gray-200" />
                </div>

                <div className="h-6 w-24 rounded-full bg-gray-200" />

                <div className="h-6 w-28 rounded-full bg-gray-200" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  /**
   * ==========================================================
   * EMPTY STATE
   * ==========================================================
   */

  if (!documents || documents.length === 0) {
    return (
      <div
        className={[
          "overflow-hidden rounded-xl",
          "border border-gray-200",
          "bg-white shadow-sm",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <div className="border-b border-gray-200 px-5 py-4">
          <h2 className="text-base font-semibold text-gray-900">{title}</h2>
        </div>

        <div className="flex min-h-48 flex-col items-center justify-center px-5 py-10 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
            <FileText className="h-6 w-6 text-gray-400" aria-hidden="true" />
          </div>

          <p className="mt-3 text-sm font-medium text-gray-700">
            {emptyMessage}
          </p>

          <p className="mt-1 text-xs text-gray-500">
            Documents will appear here when compliance records are available.
          </p>
        </div>
      </div>
    );
  }

  /**
   * ==========================================================
   * RENDER
   * ==========================================================
   */

  return (
    <div
      className={[
        "overflow-hidden rounded-xl",
        "border border-gray-200",
        "bg-white shadow-sm",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* ==================================================== */}
      {/* HEADER */}
      {/* ==================================================== */}

      <div className="flex items-center justify-between gap-4 border-b border-gray-200 px-5 py-4">
        <div>
          <h2 className="text-base font-semibold text-gray-900">{title}</h2>

          <p className="mt-0.5 text-xs text-gray-500">
            {documents.length}{" "}
            {documents.length === 1 ? "document" : "documents"}
          </p>
        </div>
      </div>

      {/* ==================================================== */}
      {/* DESKTOP TABLE */}
      {/* ==================================================== */}

      <div className="hidden overflow-x-auto md:block">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500"
              >
                Document
              </th>

              <th
                scope="col"
                className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500"
              >
                Owner
              </th>

              <th
                scope="col"
                className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500"
              >
                Expiry
              </th>

              <th
                scope="col"
                className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500"
              >
                Status
              </th>

              <th
                scope="col"
                className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500"
              >
                OCR
              </th>

              <th
                scope="col"
                className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500"
              >
                Action
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100 bg-white">
            {documents.map((document) => (
              <tr key={document._id} className="transition hover:bg-gray-50">
                {/* ======================================== */}
                {/* DOCUMENT */}
                {/* ======================================== */}

                <td className="px-5 py-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                      <FileText
                        className="h-5 w-5 text-blue-600"
                        aria-hidden="true"
                      />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-gray-900">
                        {getDocumentTypeLabel(document.documentType)}
                      </p>

                      <p className="mt-0.5 truncate text-xs text-gray-500">
                        {document.documentNumber || document.originalFileName}
                      </p>
                    </div>
                  </div>
                </td>

                {/* ======================================== */}
                {/* OWNER */}
                {/* ======================================== */}

                <td className="px-5 py-4">
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    {document.ownerType === "vehicle" ? (
                      <Car
                        className="h-4 w-4 text-gray-400"
                        aria-hidden="true"
                      />
                    ) : (
                      <User
                        className="h-4 w-4 text-gray-400"
                        aria-hidden="true"
                      />
                    )}

                    <div>
                      <p className="font-medium">{getOwnerLabel(document)}</p>

                      <p className="max-w-32 truncate text-xs text-gray-500">
                        {document.vehicleId || document.driverId || "—"}
                      </p>
                    </div>
                  </div>
                </td>

                {/* ======================================== */}
                {/* EXPIRY */}
                {/* ======================================== */}

                <td className="px-5 py-4">
                  <ComplianceExpiryBadge
                    expiryDate={document.expiryDate}
                    daysRemaining={document.daysRemaining}
                  />
                </td>

                {/* ======================================== */}
                {/* STATUS */}
                {/* ======================================== */}

                <td className="px-5 py-4">
                  <ComplianceStatusBadge status={document.complianceStatus} />
                </td>

                {/* ======================================== */}
                {/* OCR */}
                {/* ======================================== */}

                <td className="px-5 py-4">
                  {document.isOcrProcessed ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
                      <ScanText className="h-3.5 w-3.5" aria-hidden="true" />
                      Processed
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-yellow-200 bg-yellow-50 px-2.5 py-1 text-xs font-medium text-yellow-700">
                      <ScanText className="h-3.5 w-3.5" aria-hidden="true" />
                      Pending
                    </span>
                  )}
                </td>

                {/* ======================================== */}
                {/* ACTION */}
                {/* ======================================== */}

                <td className="px-5 py-4 text-right">
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => onView?.(document)}
                      disabled={!onView}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-default disabled:opacity-100"
                    >
                      <ExternalLink
                        className="h-3.5 w-3.5"
                        aria-hidden="true"
                      />
                      View
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ==================================================== */}
      {/* MOBILE CARDS */}
      {/* ==================================================== */}

      <div className="divide-y divide-gray-100 md:hidden">
        {documents.map((document) => (
          <div key={document._id} className="p-4">
            {/* ========================================== */}
            {/* DOCUMENT HEADER */}
            {/* ========================================== */}

            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                  <FileText
                    className="h-5 w-5 text-blue-600"
                    aria-hidden="true"
                  />
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-gray-900">
                    {getDocumentTypeLabel(document.documentType)}
                  </p>

                  <p className="mt-0.5 truncate text-xs text-gray-500">
                    {document.documentNumber || document.originalFileName}
                  </p>
                </div>
              </div>

              <ComplianceStatusBadge
                status={document.complianceStatus}
                showIcon={false}
              />
            </div>

            {/* ========================================== */}
            {/* DETAILS */}
            {/* ========================================== */}

            <div className="mt-4 grid grid-cols-1 gap-3">
              {/* Owner */}

              <div className="flex items-center justify-between gap-3">
                <span className="text-xs text-gray-500">Owner</span>

                <div className="flex max-w-[65%] items-center gap-1.5 text-right text-xs font-medium text-gray-700">
                  {document.ownerType === "vehicle" ? (
                    <Car
                      className="h-3.5 w-3.5 shrink-0 text-gray-400"
                      aria-hidden="true"
                    />
                  ) : (
                    <User
                      className="h-3.5 w-3.5 shrink-0 text-gray-400"
                      aria-hidden="true"
                    />
                  )}

                  <span className="truncate">
                    {getOwnerLabel(document)}
                    {" · "}
                    {document.vehicleId || document.driverId || "—"}
                  </span>
                </div>
              </div>

              {/* Expiry */}

              <div className="flex items-center justify-between gap-3">
                <span className="text-xs text-gray-500">Expiry</span>

                <ComplianceExpiryBadge
                  expiryDate={document.expiryDate}
                  daysRemaining={document.daysRemaining}
                  showIcon={false}
                />
              </div>

              {/* OCR */}

              <div className="flex items-center justify-between gap-3">
                <span className="text-xs text-gray-500">OCR</span>

                {document.isOcrProcessed ? (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700">
                    <ScanText className="h-3.5 w-3.5" aria-hidden="true" />
                    Processed
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-yellow-700">
                    <ScanText className="h-3.5 w-3.5" aria-hidden="true" />
                    Pending
                  </span>
                )}
              </div>
            </div>

            {/* ========================================== */}
            {/* ACTION */}
            {/* ========================================== */}

            {onView && (
              <button
                type="button"
                onClick={() => onView(document)}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                View Document
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ComplianceDocumentTable;
