import { useCallback, useEffect } from "react";

import { useNavigate, useParams } from "react-router-dom";

import {
  AlertCircle,
  ArrowLeft,
  CalendarDays,
  Car,
  CheckCircle2,
  Clock3,
  Download,
  Edit3,
  ExternalLink,
  FileText,
  Hash,
  Landmark,
  Loader2,
  ShieldCheck,
  Trash2,
  UserRound,
} from "lucide-react";

import DocumentExpiryBadge from "../../components/document/DocumentExpiryBadge";

import DocumentStatusBadge from "../../components/document/DocumentStatusBadge";

import { useDocumentStore } from "../../store/document.store";

import { DOCUMENT_TYPE_LABELS } from "../../types/document.types";

/**
 * ============================================================
 * DATE FORMATTER
 * ============================================================
 */
const formatDate = (value?: string | Date | null): string => {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

/**
 * ============================================================
 * COMPONENT
 * ============================================================
 */
const DocumentDetailsPage = () => {
  /**
   * ========================================================
   * ROUTER
   * ========================================================
   */
  const { id } = useParams<{
    id: string;
  }>();

  const navigate = useNavigate();

  /**
   * ========================================================
   * STORE
   * ========================================================
   *
   * IMPORTANT:
   *
   * These names match the actual document.store.ts:
   *
   * selectedDocument
   * fetchDocumentById
   * isLoadingDocument
   */
  const document = useDocumentStore((state) => state.selectedDocument);

  const isLoading = useDocumentStore((state) => state.isLoadingDocument);

  const isDeleting = useDocumentStore((state) => state.isDeleting);

  const error = useDocumentStore((state) => state.error);

  const fetchDocumentById = useDocumentStore(
    (state) => state.fetchDocumentById,
  );

  const deleteDocument = useDocumentStore((state) => state.deleteDocument);

  const clearError = useDocumentStore((state) => state.clearError);

  /**
   * ========================================================
   * LOAD DOCUMENT
   * ========================================================
   *
   * IMPORTANT:
   *
   * Do NOT put `document` in dependency array.
   *
   * Otherwise updating selectedDocument can trigger another
   * request and create unnecessary/infinite API calls.
   */
  useEffect(() => {
    if (!id) {
      return;
    }

    clearError();

    void fetchDocumentById(id);

    // Fetch only when route ID changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  /**
   * ========================================================
   * BACK
   * ========================================================
   */
  const handleBack = useCallback(() => {
    if (isDeleting) {
      return;
    }

    navigate("/documents");
  }, [navigate, isDeleting]);

  /**
   * ========================================================
   * EDIT
   * ========================================================
   */
  const handleEdit = useCallback(() => {
    if (!id || isDeleting) {
      return;
    }

    navigate(`/documents/${id}/edit`);
  }, [id, navigate, isDeleting]);

  /**
   * ========================================================
   * OPEN CLOUDINARY FILE
   * ========================================================
   */
  const handleOpenFile = useCallback(() => {
    if (!document?.fileUrl) {
      return;
    }

    window.open(document.fileUrl, "_blank", "noopener,noreferrer");
  }, [document?.fileUrl]);

  /**
   * ========================================================
   * DOWNLOAD
   * ========================================================
   *
   * Opens the Cloudinary URL. Actual browser download
   * behavior depends on Cloudinary delivery headers.
   */
  const handleDownload = useCallback(() => {
    if (!document?.fileUrl) {
      return;
    }

    window.open(document.fileUrl, "_blank", "noopener,noreferrer");
  }, [document?.fileUrl]);

  /**
   * ========================================================
   * DELETE
   * ========================================================
   */
  const handleDelete = useCallback(async () => {
    if (!document?._id || isDeleting) {
      return;
    }

    const documentName =
      document.documentNumber || document.originalFileName || "this document";

    const confirmed = window.confirm(
      `Are you sure you want to delete ${documentName}? This action cannot be undone.`,
    );

    if (!confirmed) {
      return;
    }

    const deleted = await deleteDocument(document._id);

    if (deleted) {
      navigate("/documents", {
        replace: true,
      });
    }
  }, [document, isDeleting, deleteDocument, navigate]);

  /**
   * ========================================================
   * INVALID ID
   * ========================================================
   */
  if (!id) {
    return (
      <div className="mx-auto w-full max-w-6xl">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6">
          <div className="flex items-start gap-3">
            <AlertCircle
              className="mt-0.5 h-5 w-5 shrink-0 text-red-600"
              aria-hidden="true"
            />

            <div>
              <h2 className="text-sm font-semibold text-red-800">
                Invalid document ID
              </h2>

              <p className="mt-1 text-sm text-red-700">
                The document ID is missing from the URL.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /**
   * ========================================================
   * LOADING STATE
   * ========================================================
   */
  if (isLoading && !document) {
    return (
      <div className="mx-auto w-full max-w-6xl space-y-6">
        {/* Header skeleton */}
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 animate-pulse rounded-lg bg-gray-200" />

          <div className="space-y-2">
            <div className="h-5 w-56 animate-pulse rounded bg-gray-200" />

            <div className="h-3 w-80 animate-pulse rounded bg-gray-100" />
          </div>
        </div>

        {/* Summary skeleton */}
        <div className="h-48 animate-pulse rounded-xl border border-gray-200 bg-gray-50" />

        {/* Information skeleton */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="h-80 animate-pulse rounded-xl border border-gray-200 bg-gray-50" />

          <div className="h-80 animate-pulse rounded-xl border border-gray-200 bg-gray-50" />
        </div>

        {/* File skeleton */}
        <div className="h-52 animate-pulse rounded-xl border border-gray-200 bg-gray-50" />
      </div>
    );
  }

  /**
   * ========================================================
   * NOT FOUND / ERROR
   * ========================================================
   */
  if (!document && !isLoading) {
    return (
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <button
          type="button"
          onClick={() => navigate("/documents")}
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to Documents
        </button>

        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-6"
        >
          <div className="flex items-start gap-3">
            <AlertCircle
              className="mt-0.5 h-5 w-5 shrink-0 text-red-600"
              aria-hidden="true"
            />

            <div>
              <h2 className="text-sm font-semibold text-red-800">
                Document not found
              </h2>

              <p className="mt-1 text-sm text-red-700">
                {error || "The requested document could not be found."}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /**
   * ========================================================
   * DOCUMENT TYPE LABEL
   * ========================================================
   */
  const documentTypeLabel =
    DOCUMENT_TYPE_LABELS[document!.documentType] ?? document!.documentType;

  /**
   * ========================================================
   * DAYS REMAINING TEXT
   * ========================================================
   */
  const daysRemaining: number | null =
    typeof document!.daysRemaining === "number"
      ? document!.daysRemaining
      : null;

  const daysRemainingText =
    daysRemaining === null
      ? "—"
      : daysRemaining < 0
        ? `${Math.abs(daysRemaining)} days overdue`
        : daysRemaining === 0
          ? "Expires today"
          : `${daysRemaining} days`;

  /**
   * ========================================================
   * RENDER
   * ========================================================
   */
  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      {/* ================================================== */}
      {/* PAGE HEADER */}
      {/* ================================================== */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-3">
          {/* Back */}
          <button
            type="button"
            onClick={handleBack}
            disabled={isDeleting}
            className="mt-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-600 transition hover:bg-gray-50 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-50"
            title="Back to documents"
            aria-label="Back to documents"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" aria-hidden="true" />

              <h1 className="text-xl font-semibold tracking-tight text-gray-900 sm:text-2xl">
                Document Details
              </h1>
            </div>

            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              View compliance information, expiry status and uploaded document
              details.
            </p>
          </div>
        </div>

        {/* ================================================= */}
        {/* ACTIONS */}
        {/* ================================================= */}
        <div className="flex flex-wrap items-center gap-2 pl-12 lg:pl-0">
          {/* Edit */}
          <button
            type="button"
            onClick={handleEdit}
            disabled={isDeleting}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Edit3 className="h-4 w-4" aria-hidden="true" />
            Edit
          </button>

          {/* Delete */}
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-3 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isDeleting ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Trash2 className="h-4 w-4" aria-hidden="true" />
            )}

            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>

      {/* ================================================== */}
      {/* ERROR */}
      {/* ================================================== */}
      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3"
        >
          <AlertCircle
            className="mt-0.5 h-5 w-5 shrink-0 text-red-600"
            aria-hidden="true"
          />

          <div>
            <p className="text-sm font-semibold text-red-800">Document error</p>

            <p className="mt-1 text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* ================================================== */}
      {/* COMPLIANCE SUMMARY */}
      {/* ================================================== */}
      <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {/* Header */}
        <div className="border-b border-gray-200 bg-gray-50/70 px-5 py-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            {/* Identity */}
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <FileText className="h-6 w-6" aria-hidden="true" />
              </div>

              <div className="min-w-0">
                <h2 className="truncate text-lg font-semibold text-gray-900">
                  {document!.documentNumber ||
                    document!.originalFileName ||
                    documentTypeLabel}
                </h2>

                <p className="mt-0.5 truncate text-sm text-gray-500">
                  {documentTypeLabel}
                </p>
              </div>
            </div>

            {/* Status */}
            <div className="flex flex-wrap items-center gap-2">
              <DocumentStatusBadge status={document!.verificationStatus} />

              <DocumentExpiryBadge
                status={document!.complianceStatus}
                daysRemaining={document!.daysRemaining}
              />
            </div>
          </div>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-1 divide-y divide-gray-100 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {/* Expiry */}
          <div className="flex items-center gap-3 px-5 py-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
              <CalendarDays className="h-5 w-5" aria-hidden="true" />
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                Expiry Date
              </p>

              <p className="mt-0.5 text-sm font-semibold text-gray-800">
                {formatDate(document!.expiryDate)}
              </p>
            </div>
          </div>

          {/* Days */}
          <div className="flex items-center gap-3 px-5 py-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
              <Clock3 className="h-5 w-5" aria-hidden="true" />
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                Days Remaining
              </p>

              <p className="mt-0.5 text-sm font-semibold text-gray-800">
                {daysRemainingText}
              </p>
            </div>
          </div>

          {/* Verification */}
          <div className="flex items-center gap-3 px-5 py-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-50 text-green-600">
              <ShieldCheck className="h-5 w-5" aria-hidden="true" />
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                Verification
              </p>

              <p className="mt-0.5 text-sm font-semibold capitalize text-gray-800">
                {document!.verificationStatus}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================== */}
      {/* INFORMATION GRID */}
      {/* ================================================== */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* ================================================= */}
        {/* DOCUMENT INFORMATION */}
        {/* ================================================= */}
        <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-5 py-4">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-gray-500" aria-hidden="true" />

              <h2 className="text-sm font-semibold text-gray-900">
                Document Information
              </h2>
            </div>
          </div>

          <div className="divide-y divide-gray-100">
            {/* Document Type */}
            <div className="flex items-start justify-between gap-4 px-5 py-4">
              <div className="flex items-center gap-3">
                <FileText
                  className="h-4 w-4 text-gray-400"
                  aria-hidden="true"
                />

                <span className="text-sm text-gray-500">Document Type</span>
              </div>

              <span className="text-right text-sm font-medium text-gray-800">
                {documentTypeLabel}
              </span>
            </div>

            {/* Document Number */}
            <div className="flex items-start justify-between gap-4 px-5 py-4">
              <div className="flex items-center gap-3">
                <Hash className="h-4 w-4 text-gray-400" aria-hidden="true" />

                <span className="text-sm text-gray-500">Document Number</span>
              </div>

              <span className="break-all text-right font-mono text-sm font-medium text-gray-800">
                {document!.documentNumber || "—"}
              </span>
            </div>

            {/* Issue Date */}
            <div className="flex items-start justify-between gap-4 px-5 py-4">
              <div className="flex items-center gap-3">
                <CalendarDays
                  className="h-4 w-4 text-gray-400"
                  aria-hidden="true"
                />

                <span className="text-sm text-gray-500">Issue Date</span>
              </div>

              <span className="text-right text-sm font-medium text-gray-800">
                {formatDate(document!.issueDate)}
              </span>
            </div>

            {/* Expiry Date */}
            <div className="flex items-start justify-between gap-4 px-5 py-4">
              <div className="flex items-center gap-3">
                <CalendarDays
                  className="h-4 w-4 text-gray-400"
                  aria-hidden="true"
                />

                <span className="text-sm text-gray-500">Expiry Date</span>
              </div>

              <span className="text-right text-sm font-semibold text-gray-800">
                {formatDate(document!.expiryDate)}
              </span>
            </div>

            {/* Issuing Authority */}
            <div className="flex items-start justify-between gap-4 px-5 py-4">
              <div className="flex items-center gap-3">
                <Landmark
                  className="h-4 w-4 text-gray-400"
                  aria-hidden="true"
                />

                <span className="text-sm text-gray-500">Issuing Authority</span>
              </div>

              <span className="max-w-[60%] text-right text-sm font-medium text-gray-800">
                {document!.issuingAuthority || "—"}
              </span>
            </div>
          </div>
        </section>

        {/* ================================================= */}
        {/* OWNER INFORMATION */}
        {/* ================================================= */}
        <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-5 py-4">
            <div className="flex items-center gap-2">
              {document!.ownerType === "vehicle" ? (
                <Car className="h-4 w-4 text-gray-500" aria-hidden="true" />
              ) : (
                <UserRound
                  className="h-4 w-4 text-gray-500"
                  aria-hidden="true"
                />
              )}

              <h2 className="text-sm font-semibold text-gray-900">
                Owner Information
              </h2>
            </div>
          </div>

          <div className="divide-y divide-gray-100">
            {/* Owner Type */}
            <div className="flex items-start justify-between gap-4 px-5 py-4">
              <span className="text-sm text-gray-500">Owner Type</span>

              <span className="text-right text-sm font-semibold capitalize text-gray-800">
                {document!.ownerType}
              </span>
            </div>

            {/* Vehicle ID */}
            {document!.ownerType === "vehicle" && (
              <div className="flex items-start justify-between gap-4 px-5 py-4">
                <div className="flex items-center gap-3">
                  <Car className="h-4 w-4 text-gray-400" aria-hidden="true" />

                  <span className="text-sm text-gray-500">Vehicle ID</span>
                </div>

                <span className="break-all text-right font-mono text-sm font-medium text-gray-800">
                  {document!.vehicleId || "—"}
                </span>
              </div>
            )}

            {/* Driver ID */}
            {document!.ownerType === "driver" && (
              <div className="flex items-start justify-between gap-4 px-5 py-4">
                <div className="flex items-center gap-3">
                  <UserRound
                    className="h-4 w-4 text-gray-400"
                    aria-hidden="true"
                  />

                  <span className="text-sm text-gray-500">Driver ID</span>
                </div>

                <span className="break-all text-right font-mono text-sm font-medium text-gray-800">
                  {document!.driverId || "—"}
                </span>
              </div>
            )}

            {/* Company ID */}
            <div className="flex items-start justify-between gap-4 px-5 py-4">
              <div className="flex items-center gap-3">
                <Landmark
                  className="h-4 w-4 text-gray-400"
                  aria-hidden="true"
                />

                <span className="text-sm text-gray-500">Company ID</span>
              </div>

              <span className="break-all text-right font-mono text-sm font-medium text-gray-800">
                {document!.companyId || "—"}
              </span>
            </div>
          </div>
        </section>
      </div>

      {/* ================================================== */}
      {/* UPLOADED FILE */}
      {/* ================================================== */}
      <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-5 py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-gray-500" aria-hidden="true" />

              <h2 className="text-sm font-semibold text-gray-900">
                Uploaded Document
              </h2>
            </div>

            {document!.fileUrl && (
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleOpenFile}
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                >
                  <ExternalLink className="h-4 w-4" aria-hidden="true" />
                  Open
                </button>

                <button
                  type="button"
                  onClick={handleDownload}
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 text-sm font-medium text-white transition hover:bg-blue-700"
                >
                  <Download className="h-4 w-4" aria-hidden="true" />
                  Download
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="p-5">
          {/* File information */}
          <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-gray-50 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-white text-blue-600 shadow-sm">
                <FileText className="h-6 w-6" aria-hidden="true" />
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-gray-800">
                  {document!.originalFileName || "Uploaded document"}
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  {document!.mimeType || "Document file"}
                </p>
              </div>
            </div>

            {!document!.fileUrl && (
              <p className="text-sm text-gray-500">
                File URL is not available.
              </p>
            )}
          </div>

          {/* ================================================= */}
          {/* IMAGE PREVIEW */}
          {/* ================================================= */}
          {document!.fileUrl && document!.mimeType?.startsWith("image/") && (
            <div className="mt-4 overflow-hidden rounded-xl border border-gray-200 bg-white">
              <img
                src={document!.fileUrl}
                alt={document!.originalFileName || "Document preview"}
                className="mx-auto max-h-150 w-full object-contain"
              />
            </div>
          )}

          {/* ================================================= */}
          {/* PDF PREVIEW */}
          {/* ================================================= */}
          {document!.fileUrl && document!.mimeType === "application/pdf" && (
            <div className="mt-4 overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
              <iframe
                src={document!.fileUrl}
                title="Document PDF preview"
                className="h-150 w-full"
              />
            </div>
          )}
        </div>
      </section>

      {/* ================================================== */}
      {/* NOTES */}
      {/* ================================================== */}
      {document!.notes && (
        <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-5 py-4">
            <h2 className="text-sm font-semibold text-gray-900">Notes</h2>
          </div>

          <div className="px-5 py-4">
            <p className="whitespace-pre-wrap text-sm leading-6 text-gray-600">
              {document!.notes}
            </p>
          </div>
        </section>
      )}

      {/* ================================================== */}
      {/* RECORD INFORMATION */}
      {/* ================================================== */}
      <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-5 py-4">
          <div className="flex items-center gap-2">
            <CheckCircle2
              className="h-4 w-4 text-gray-500"
              aria-hidden="true"
            />

            <h2 className="text-sm font-semibold text-gray-900">
              Record Information
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 px-5 py-4 sm:grid-cols-2">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Created
            </p>

            <p className="mt-1 text-sm text-gray-700">
              {formatDate(document!.createdAt)}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Last Updated
            </p>

            <p className="mt-1 text-sm text-gray-700">
              {formatDate(document!.updatedAt)}
            </p>
          </div>
        </div>
      </section>

      {/* ================================================== */}
      {/* DELETE OVERLAY */}
      {/* ================================================== */}
      {isDeleting && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-[1px]"
          aria-live="polite"
          aria-busy="true"
        >
          <div className="flex items-center gap-3 rounded-xl bg-white px-5 py-4 shadow-xl">
            <Loader2
              className="h-5 w-5 animate-spin text-red-600"
              aria-hidden="true"
            />

            <div>
              <p className="text-sm font-semibold text-gray-900">
                Deleting document
              </p>

              <p className="mt-0.5 text-xs text-gray-500">
                Removing the document and its stored file.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentDetailsPage;
