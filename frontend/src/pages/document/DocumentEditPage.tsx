import { useEffect, useState } from "react";

import { useNavigate, useParams } from "react-router-dom";

import { ArrowLeft, FileText, Loader2, AlertCircle } from "lucide-react";

import DocumentForm from "../../components/document/DocumentForm/DocumentForm";

import { useDocumentStore } from "../../store/document.store";

import type { UpdateDocumentFormData } from "../../types/document.types";

/**
 * ============================================================
 * COMPONENT
 * ============================================================
 */
const DocumentEditPage = () => {
  /**
   * ==========================================================
   * ROUTER
   * ==========================================================
   */
  const { id } = useParams<{
    id: string;
  }>();

  const navigate = useNavigate();

  /**
   * ==========================================================
   * STORE
   * ==========================================================
   */
  const document = useDocumentStore((state) =>
    state.documents.find((doc) => doc._id === id),
  );

  const isLoading = useDocumentStore((state) => state.isLoading);

  const isUpdating = useDocumentStore((state) => state.isUpdating);

  const storeError = useDocumentStore((state) => state.error);

  const getDocumentById = useDocumentStore((state) => state.fetchDocumentById);

  const updateDocument = useDocumentStore((state) => state.updateDocument);

  const clearError = useDocumentStore((state) => state.clearError);

  /**
   * ==========================================================
   * LOCAL ERROR
   * ==========================================================
   */
  const [submitError, setSubmitError] = useState<string | null>(null);

  /**
   * ==========================================================
   * LOAD DOCUMENT
   * ==========================================================
   *
   * Important:
   *
   * We fetch only when the document ID changes.
   *
   * Do NOT put `document` in this dependency array.
   * Otherwise the store update can trigger another request.
   */
  useEffect(() => {
    if (!id) {
      return;
    }

    clearError();

    void getDocumentById(id);

    // Intentionally depends only on route ID.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  /**
   * ==========================================================
   * INVALID ID
   * ==========================================================
   */
  if (!id) {
    return (
      <div className="mx-auto w-full max-w-5xl">
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
   * ==========================================================
   * BACK
   * ==========================================================
   */
  const handleBack = () => {
    if (isUpdating) {
      return;
    }

    navigate(`/documents/${id}`);
  };

  /**
   * ==========================================================
   * CANCEL
   * ==========================================================
   */
  const handleCancel = () => {
    if (isUpdating) {
      return;
    }

    navigate(`/documents/${id}`);
  };

  /**
   * ==========================================================
   * SUBMIT
   * ==========================================================
   */
  const handleSubmit = async (
    data:
      | UpdateDocumentFormData
      | import("../../types/document.types").CreateDocumentFormData,
  ) => {
    /**
     * ------------------------------------------------------
     * Edit page should only receive update data.
     * ------------------------------------------------------
     */
    if ("companyId" in data) {
      /**
       * DocumentForm supports create + update.
       *
       * This page should never create a new document.
       */
      setSubmitError("Invalid form submission for edit mode.");

      return;
    }

    setSubmitError(null);

    clearError();

    try {
      /**
       * ----------------------------------------------------
       * Update document
       * ----------------------------------------------------
       *
       * If `data.file` exists:
       *
       * Backend will upload the new file to Cloudinary
       * and update the document.
       *
       * If `data.file` is undefined:
       *
       * Existing Cloudinary file remains unchanged.
       */
      const updatedDocument = await updateDocument(
        id,
        data as UpdateDocumentFormData,
      );

      /**
       * ----------------------------------------------------
       * Store handled the API error.
       * ----------------------------------------------------
       */
      if (!updatedDocument) {
        return;
      }

      /**
       * ----------------------------------------------------
       * Success
       * ----------------------------------------------------
       */
      navigate(`/documents/${id}`, {
        replace: true,
      });
    } catch (error) {
      /**
       * Unexpected error protection.
       */
      const message =
        error instanceof Error ? error.message : "Unable to update document.";

      setSubmitError(message);
    }
  };

  /**
   * ==========================================================
   * PAGE ERROR
   * ==========================================================
   */
  const pageError = submitError || storeError;

  /**
   * ==========================================================
   * LOADING DOCUMENT
   * ==========================================================
   */
  if (isLoading && !document) {
    return (
      <div className="mx-auto w-full max-w-5xl space-y-6">
        {/* Header skeleton */}
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 animate-pulse rounded-lg bg-gray-200" />

          <div className="space-y-2">
            <div className="h-5 w-48 animate-pulse rounded bg-gray-200" />

            <div className="h-3 w-72 animate-pulse rounded bg-gray-100" />
          </div>
        </div>

        {/* Form skeleton */}
        <div className="space-y-6">
          <div className="h-96 animate-pulse rounded-xl border border-gray-200 bg-gray-50" />

          <div className="h-72 animate-pulse rounded-xl border border-gray-200 bg-gray-50" />
        </div>
      </div>
    );
  }

  /**
   * ==========================================================
   * DOCUMENT NOT FOUND
   * ==========================================================
   */
  if (!document && !isLoading) {
    return (
      <div className="mx-auto w-full max-w-5xl space-y-6">
        {/* Header */}
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={() => navigate("/documents")}
            className="mt-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-600 transition hover:bg-gray-50 hover:text-gray-900"
            aria-label="Back to documents"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          </button>

          <div>
            <h1 className="text-xl font-semibold text-gray-900 sm:text-2xl">
              Edit Document
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Update document information.
            </p>
          </div>
        </div>

        {/* Error */}
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-5"
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
                {storeError || "The requested document could not be found."}
              </p>

              <button
                type="button"
                onClick={() => navigate("/documents")}
                className="mt-4 inline-flex items-center justify-center rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
              >
                Back to Documents
              </button>
            </div>
          </div>
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
    <div className="mx-auto w-full max-w-5xl space-y-6">
      {/* ==================================================== */}
      {/* PAGE HEADER */}
      {/* ==================================================== */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          {/* Back */}
          <button
            type="button"
            onClick={handleBack}
            disabled={isUpdating}
            className="mt-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-600 transition hover:bg-gray-50 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-50"
            title="Back to document details"
            aria-label="Back to document details"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          </button>

          {/* Title */}
          <div>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" aria-hidden="true" />

              <h1 className="text-xl font-semibold tracking-tight text-gray-900 sm:text-2xl">
                Edit Document
              </h1>
            </div>

            <p className="mt-1 text-sm text-gray-500">
              Update document details, expiry information or replace the
              uploaded file.
            </p>
          </div>
        </div>
      </div>

      {/* ==================================================== */}
      {/* ERROR */}
      {/* ==================================================== */}
      {pageError && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3"
        >
          <AlertCircle
            className="mt-0.5 h-5 w-5 shrink-0 text-red-600"
            aria-hidden="true"
          />

          <div>
            <p className="text-sm font-semibold text-red-800">
              Unable to update document
            </p>

            <p className="mt-1 text-sm text-red-700">{pageError}</p>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* DOCUMENT FORM */}
      {/* ==================================================== */}
      {document && (
        <DocumentForm
          document={document}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={isUpdating}
          serverError={null}
        />
      )}

      {/* ==================================================== */}
      {/* UPDATE OVERLAY */}
      {/* ==================================================== */}
      {isUpdating && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-[1px]"
          aria-live="polite"
          aria-busy="true"
        >
          <div className="flex items-center gap-3 rounded-xl bg-white px-5 py-4 shadow-xl">
            <Loader2
              className="h-5 w-5 animate-spin text-blue-600"
              aria-hidden="true"
            />

            <div>
              <p className="text-sm font-semibold text-gray-900">
                Updating document
              </p>

              <p className="mt-0.5 text-xs text-gray-500">
                Please wait while the document is being saved.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentEditPage;
