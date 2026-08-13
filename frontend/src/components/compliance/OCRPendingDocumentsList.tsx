import {
  ScanText,
  ExternalLink,
  FileText,
  Car,
  User,
  AlertCircle,
} from "lucide-react";

import type { ComplianceDocumentDto } from "../../types/compliance.dto";

import ComplianceStatusBadge from "./ComplianceStatusBadge";
import ComplianceExpiryBadge from "./ComplianceExpiryBadge";
import ComplianceEmptyState from "./ComplianceEmptyState";
import ComplianceLoading from "./ComplianceLoading";

/**
 * ============================================================
 * PROPS
 * ============================================================
 */

interface OCRPendingDocumentsListProps {
  /**
   * Real documents returned by the OCR-pending API.
   */
  documents: ComplianceDocumentDto[];

  /**
   * API loading state.
   */
  isLoading?: boolean;

  /**
   * Open document details.
   */
  onView?: (document: ComplianceDocumentDto) => void;

  /**
   * Optional callback for OCR processing.
   *
   * This does NOT perform OCR itself.
   * The parent can connect it to the OCR API later.
   */
  onProcessOCR?: (document: ComplianceDocumentDto) => void;

  /**
   * Document count shown in header.
   */
  showCount?: boolean;

  /**
   * Optional title.
   */
  title?: string;

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

const OCRPendingDocumentsList = ({
  documents,
  isLoading = false,
  onView,
  onProcessOCR,
  showCount = true,
  title = "OCR Pending Documents",
  className = "",
}: OCRPendingDocumentsListProps) => {
  /**
   * ==========================================================
   * LOADING
   * ==========================================================
   */

  if (isLoading) {
    return (
      <ComplianceLoading
        message="Loading OCR pending documents..."
        minHeightClass="min-h-48"
        className={className}
      />
    );
  }

  /**
   * ==========================================================
   * EMPTY
   * ==========================================================
   */

  if (!documents || documents.length === 0) {
    return (
      <ComplianceEmptyState
        title="No OCR pending documents"
        message="All currently available documents have been processed by OCR."
        className={className}
      />
    );
  }

  /**
   * ==========================================================
   * RENDER
   * ==========================================================
   */

  return (
    <section
      className={[
        "overflow-hidden rounded-xl",
        "border border-purple-200",
        "bg-white shadow-sm",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* ==================================================== */}
      {/* HEADER */}
      {/* ==================================================== */}

      <div className="flex flex-col gap-3 border-b border-purple-100 bg-purple-50/50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-100">
            <ScanText className="h-5 w-5 text-purple-600" aria-hidden="true" />
          </div>

          <div>
            <h2 className="text-base font-semibold text-gray-900">{title}</h2>

            <p className="mt-0.5 text-xs text-gray-500">
              Documents waiting for automatic data extraction
            </p>
          </div>
        </div>

        {showCount && (
          <span className="inline-flex w-fit items-center rounded-full border border-purple-200 bg-white px-2.5 py-1 text-xs font-semibold text-purple-700">
            {documents.length}{" "}
            {documents.length === 1 ? "document" : "documents"}
          </span>
        )}
      </div>

      {/* ==================================================== */}
      {/* INFORMATION NOTICE */}
      {/* ==================================================== */}

      <div className="border-b border-purple-100 bg-purple-50/30 px-5 py-3">
        <div className="flex items-start gap-2">
          <AlertCircle
            className="mt-0.5 h-4 w-4 shrink-0 text-purple-600"
            aria-hidden="true"
          />

          <p className="text-xs leading-5 text-purple-800">
            These documents have not yet been processed by OCR. Once processed,
            document information such as expiry date can be extracted
            automatically.
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

          <tbody className="divide-y divide-gray-100">
            {documents.map((document) => (
              <tr
                key={document._id}
                className="transition hover:bg-purple-50/30"
              >
                {/* ======================================== */}
                {/* DOCUMENT */}
                {/* ======================================== */}

                <td className="px-5 py-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-50">
                      <FileText
                        className="h-5 w-5 text-purple-600"
                        aria-hidden="true"
                      />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-gray-900">
                        {getDocumentTypeLabel(document.documentType)}
                      </p>

                      <p className="mt-0.5 max-w-60 truncate text-xs text-gray-500">
                        {document.documentNumber || document.originalFileName}
                      </p>
                    </div>
                  </div>
                </td>

                {/* ======================================== */}
                {/* OWNER */}
                {/* ======================================== */}

                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
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

                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-700">
                        {getOwnerLabel(document)}
                      </p>

                      <p className="max-w-40 truncate text-xs text-gray-500">
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
                {/* OCR STATUS */}
                {/* ======================================== */}

                <td className="px-5 py-4">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-yellow-200 bg-yellow-50 px-2.5 py-1 text-xs font-semibold text-yellow-700">
                    <ScanText className="h-3.5 w-3.5" aria-hidden="true" />
                    Pending
                  </span>
                </td>

                {/* ======================================== */}
                {/* ACTION */}
                {/* ======================================== */}

                <td className="px-5 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    {onProcessOCR && (
                      <button
                        type="button"
                        onClick={() => onProcessOCR(document)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-purple-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                      >
                        <ScanText className="h-3.5 w-3.5" aria-hidden="true" />
                        Process OCR
                      </button>
                    )}

                    {onView && (
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
                    )}
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
            {/* HEADER */}
            {/* ========================================== */}

            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-50">
                  <FileText
                    className="h-5 w-5 text-purple-600"
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

              <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-yellow-200 bg-yellow-50 px-2 py-1 text-[11px] font-semibold text-yellow-700">
                <ScanText className="h-3 w-3" aria-hidden="true" />
                Pending
              </span>
            </div>

            {/* ========================================== */}
            {/* EXPIRY */}
            {/* ========================================== */}

            <div className="mt-4 flex items-center justify-between gap-3">
              <span className="text-xs text-gray-500">Expiry</span>

              <ComplianceExpiryBadge
                expiryDate={document.expiryDate}
                daysRemaining={document.daysRemaining}
                showIcon={false}
              />
            </div>

            {/* ========================================== */}
            {/* OWNER */}
            {/* ========================================== */}

            <div className="mt-3 flex items-center justify-between gap-3">
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

            {/* ========================================== */}
            {/* COMPLIANCE STATUS */}
            {/* ========================================== */}

            <div className="mt-3 flex items-center justify-between gap-3">
              <span className="text-xs text-gray-500">Compliance</span>

              <ComplianceStatusBadge
                status={document.complianceStatus}
                showIcon={false}
              />
            </div>

            {/* ========================================== */}
            {/* ACTIONS */}
            {/* ========================================== */}

            <div className="mt-4 flex gap-2">
              {onProcessOCR && (
                <button
                  type="button"
                  onClick={() => onProcessOCR(document)}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-purple-600 px-3 py-2.5 text-xs font-semibold text-white transition hover:bg-purple-700"
                >
                  <ScanText className="h-3.5 w-3.5" aria-hidden="true" />
                  Process OCR
                </button>
              )}

              {onView && (
                <button
                  type="button"
                  onClick={() => onView(document)}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-50"
                >
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                  View
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default OCRPendingDocumentsList;
