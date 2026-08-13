import { useCallback, useEffect } from "react";

import { useNavigate } from "react-router-dom";

import {
  AlertTriangle,
  FileText,
  RefreshCw,
  ScanText,
  ShieldCheck,
  XCircle,
} from "lucide-react";

import { useAuthStore } from "../../store/auth.store";

import { useComplianceStore } from "../../store/compliance.store";

import ComplianceSummaryCards from "../../components/compliance/ComplianceSummaryCards";

import CriticalDocumentsList from "../../components/compliance/CriticalDocumentsList";

import ExpiringDocumentsList from "../../components/compliance/ExpiringDocumentsList";

import OCRPendingDocumentsList from "../../components/compliance/OCRPendingDocumentsList";

import ComplianceLoading from "../../components/compliance/ComplianceLoading";

import ComplianceError from "../../components/compliance/ComplianceError";

/**
 * ============================================================
 * MONGODB OBJECT ID VALIDATION
 * ============================================================
 */

const isMongoObjectId = (value: string): boolean => {
  return /^[a-fA-F0-9]{24}$/.test(value);
};

/**
 * ============================================================
 * COMPONENT
 * ============================================================
 */

const DocumentCompliancePage = () => {
  /**
   * ==========================================================
   * ROUTER
   * ==========================================================
   */

  const navigate = useNavigate();

  /**
   * ==========================================================
   * AUTH STORE
   * ==========================================================
   *
   * IMPORTANT:
   *
   * Company ID comes from the authenticated user.
   *
   * We DO NOT read companyId from localStorage.
   *
   * We DO NOT use:
   *
   * C-001
   * CE-0001
   * ACTUAL_MONGODB_COMPANY_ID
   *
   */

  const user = useAuthStore((state) => state.user);

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const isAuthLoading = useAuthStore((state) => state.isLoading);

  /**
   * ==========================================================
   * COMPANY ID
   * ==========================================================
   */

  const userCompanyId = user?.companyId ?? null;

  /**
   * ==========================================================
   * COMPLIANCE STORE
   * ==========================================================
   */

  const summary = useComplianceStore((state) => state.summary);

  const expiringDocuments = useComplianceStore(
    (state) => state.expiringDocuments,
  );

  const criticalDocuments = useComplianceStore(
    (state) => state.criticalDocuments,
  );

  const ocrPendingDocuments = useComplianceStore(
    (state) => state.ocrPendingDocuments,
  );

  const isLoading = useComplianceStore((state) => state.isLoading);

  const isListLoading = useComplianceStore((state) => state.isListLoading);

  const error = useComplianceStore((state) => state.error);


  const setCompanyId = useComplianceStore((state) => state.setCompanyId);

  const fetchDashboardData = useComplianceStore(
    (state) => state.fetchDashboardData,
  );

  const clearError = useComplianceStore((state) => state.clearError);

  /**
   * ==========================================================
   * LOAD COMPLIANCE DASHBOARD
   * ==========================================================
   */

  const loadDashboard = useCallback(async () => {
    /**
     * Clear previous error.
     */

    clearError();

    /**
     * ------------------------------------------------------
     * No authenticated company
     * ------------------------------------------------------
     */

    if (!userCompanyId) {
      return;
    }

    /**
     * ------------------------------------------------------
     * Validate MongoDB ObjectId
     * ------------------------------------------------------
     */

    if (!isMongoObjectId(userCompanyId)) {
      return;
    }

    /**
     * ------------------------------------------------------
     * Save company ID in compliance store
     * ------------------------------------------------------
     */

    setCompanyId(userCompanyId);

    /**
     * ------------------------------------------------------
     * Fetch complete compliance dashboard
     * ------------------------------------------------------
     *
     * The store handles:
     *
     * 1. Summary
     * 2. Expiring documents
     * 3. Expired documents
     * 4. Critical documents
     * 5. OCR pending documents
     */

    await fetchDashboardData(userCompanyId);
  }, [clearError, fetchDashboardData, setCompanyId, userCompanyId]);

  /**
   * ==========================================================
   * INITIAL LOAD
   * ==========================================================
   */

  useEffect(() => {
    /**
     * Wait until authentication restoration is complete.
     */

    if (isAuthLoading) {
      return;
    }

    /**
     * User must be authenticated.
     */

    if (!isAuthenticated) {
      return;
    }

    /**
     * User must have a company.
     */

    if (!userCompanyId) {
      return;
    }

    /**
     * Invalid company ID should never be sent
     * to backend.
     */

    if (!isMongoObjectId(userCompanyId)) {
      return;
    }

    void loadDashboard();
  }, [isAuthLoading, isAuthenticated, loadDashboard, userCompanyId]);

  /**
   * ==========================================================
   * VIEW DOCUMENT
   * ==========================================================
   */

  const handleViewDocument = useCallback(
    (documentId: string) => {
      navigate(`/documents/${documentId}`);
    },
    [navigate],
  );

  /**
   * ==========================================================
   * AUTH LOADING
   * ==========================================================
   */

  if (isAuthLoading) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <ComplianceLoading
          message="Loading user session..."
          minHeightClass="min-h-72"
        />
      </div>
    );
  }

  /**
   * ==========================================================
   * NO AUTHENTICATED USER
   * ==========================================================
   */

  if (!isAuthenticated || !user) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6">
          <div className="flex items-start gap-3">
            <XCircle
              className="mt-0.5 h-5 w-5 shrink-0 text-red-600"
              aria-hidden="true"
            />

            <div>
              <h2 className="text-base font-semibold text-red-900">
                Authentication required
              </h2>

              <p className="mt-1 text-sm text-red-700">
                Please log in before opening the document compliance dashboard.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /**
   * ==========================================================
   * COMPANY NOT ASSIGNED
   * ==========================================================
   */

  if (!userCompanyId) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-6">
          <div className="flex items-start gap-3">
            <AlertTriangle
              className="mt-0.5 h-5 w-5 shrink-0 text-yellow-600"
              aria-hidden="true"
            />

            <div>
              <h2 className="text-base font-semibold text-yellow-900">
                Company not assigned
              </h2>

              <p className="mt-1 text-sm text-yellow-800">
                Your account is not currently associated with a company.
              </p>

              <p className="mt-2 text-xs text-yellow-700">
                Compliance data can only be loaded for a company.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /**
   * ==========================================================
   * INVALID COMPANY ID
   * ==========================================================
   */

  if (!isMongoObjectId(userCompanyId)) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6">
          <div className="flex items-start gap-3">
            <XCircle
              className="mt-0.5 h-5 w-5 shrink-0 text-red-600"
              aria-hidden="true"
            />

            <div className="min-w-0">
              <h2 className="text-base font-semibold text-red-900">
                Invalid company ID
              </h2>

              <p className="mt-1 text-sm text-red-700">
                The authenticated user contains an invalid company ID.
              </p>

              <p className="mt-2 break-all font-mono text-xs text-red-600">
                Company ID: {userCompanyId}
              </p>

              <p className="mt-2 text-xs text-red-600">
                The backend requires the actual 24-character MongoDB ObjectId.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /**
   * ==========================================================
   * INITIAL API ERROR
   * ==========================================================
   */

  if (error && !summary && !isLoading) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-blue-600" aria-hidden="true" />

            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              Document Compliance
            </h1>
          </div>

          <p className="mt-1 text-sm text-gray-500">
            Monitor document expiry, compliance status and OCR processing.
          </p>
        </div>

        <ComplianceError
          message={error}
          onRetry={() => {
            void loadDashboard();
          }}
        />
      </div>
    );
  }

  /**
   * ==========================================================
   * RENDER
   * ==========================================================
   */

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* ==================================================== */}
      {/* PAGE HEADER */}
      {/* ==================================================== */}

      <div className="mb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck
                className="h-6 w-6 text-blue-600"
                aria-hidden="true"
              />

              <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                Document Compliance
              </h1>
            </div>

            <p className="mt-1 text-sm text-gray-500">
              Monitor document expiry, compliance status and OCR processing.
            </p>

            {/* Company context */}

            <p className="mt-2 text-xs text-gray-400">
              Compliance for authenticated company
            </p>
          </div>

          {/* ================================================= */}
          {/* REFRESH */}
          {/* ================================================= */}

          <button
            type="button"
            onClick={() => {
              void loadDashboard();
            }}
            disabled={isLoading}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
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

        {/* ================================================== */}
        {/* REFRESH ERROR */}
        {/* ================================================== */}

        {error && summary && (
          <div className="mt-4 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
            <XCircle
              className="mt-0.5 h-4 w-4 shrink-0 text-red-600"
              aria-hidden="true"
            />

            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-red-800">
                Unable to refresh some compliance data.
              </p>

              <p className="mt-0.5 text-xs text-red-700">{error}</p>
            </div>

            <button
              type="button"
              onClick={() => {
                void loadDashboard();
              }}
              className="text-xs font-semibold text-red-700 hover:text-red-800"
            >
              Retry
            </button>
          </div>
        )}
      </div>

      {/* ==================================================== */}
      {/* INITIAL LOADING */}
      {/* ==================================================== */}

      {isLoading && !summary ? (
        <ComplianceLoading
          message="Loading compliance dashboard..."
          minHeightClass="min-h-72"
        />
      ) : (
        <>
          {/* ================================================= */}
          {/* SUMMARY */}
          {/* ================================================= */}

          <section>
            <ComplianceSummaryCards
              summary={summary}
              isLoading={isLoading && !summary}
            />
          </section>

          {/* ================================================= */}
          {/* QUICK STATISTICS */}
          {/* ================================================= */}

          {summary && (
            <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {/* VALID */}

              <div className="rounded-xl border border-green-200 bg-green-50 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                    <ShieldCheck
                      className="h-5 w-5 text-green-600"
                      aria-hidden="true"
                    />
                  </div>

                  <div>
                    <p className="text-xs font-medium text-green-700">
                      Valid Documents
                    </p>

                    <p className="text-xl font-bold text-green-800">
                      {summary.valid}
                    </p>
                  </div>
                </div>
              </div>

              {/* EXPIRING */}

              <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-100">
                    <AlertTriangle
                      className="h-5 w-5 text-yellow-600"
                      aria-hidden="true"
                    />
                  </div>

                  <div>
                    <p className="text-xs font-medium text-yellow-700">
                      Expiring Soon
                    </p>

                    <p className="text-xl font-bold text-yellow-800">
                      {summary.expiringSoon}
                    </p>
                  </div>
                </div>
              </div>

              {/* EXPIRED */}

              <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100">
                    <XCircle
                      className="h-5 w-5 text-red-600"
                      aria-hidden="true"
                    />
                  </div>

                  <div>
                    <p className="text-xs font-medium text-red-700">Expired</p>

                    <p className="text-xl font-bold text-red-800">
                      {summary.expired}
                    </p>
                  </div>
                </div>
              </div>

              {/* OCR */}

              <div className="rounded-xl border border-purple-200 bg-purple-50 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                    <ScanText
                      className="h-5 w-5 text-purple-600"
                      aria-hidden="true"
                    />
                  </div>

                  <div>
                    <p className="text-xs font-medium text-purple-700">
                      OCR Pending
                    </p>

                    <p className="text-xl font-bold text-purple-800">
                      {summary.ocrPending}
                    </p>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* ================================================= */}
          {/* CRITICAL */}
          {/* ================================================= */}

          <section className="mt-8">
            <CriticalDocumentsList
              documents={criticalDocuments ?? []}
              isLoading={isListLoading && criticalDocuments === null}
              onView={(document) => {
                handleViewDocument(document._id);
              }}
            />
          </section>

          {/* ================================================= */}
          {/* EXPIRING */}
          {/* ================================================= */}

          <section className="mt-8">
            <ExpiringDocumentsList
              documents={expiringDocuments?.documents ?? []}
              isLoading={isListLoading && expiringDocuments === null}
              days={30}
              onView={(document) => {
                handleViewDocument(document._id);
              }}
            />
          </section>

          {/* ================================================= */}
          {/* OCR PENDING */}
          {/* ================================================= */}

          <section className="mt-8">
            <OCRPendingDocumentsList
              documents={ocrPendingDocuments?.documents ?? []}
              isLoading={isListLoading && ocrPendingDocuments === null}
              onView={(document) => {
                handleViewDocument(document._id);
              }}
            />
          </section>

          {/* ================================================= */}
          {/* FOOTER */}
          {/* ================================================= */}

          <div className="mt-8 rounded-xl border border-gray-200 bg-gray-50 px-5 py-4">
            <div className="flex items-start gap-3">
              <FileText
                className="mt-0.5 h-5 w-5 shrink-0 text-gray-500"
                aria-hidden="true"
              />

              <div>
                <p className="text-sm font-semibold text-gray-800">
                  Compliance monitoring
                </p>

                <p className="mt-1 text-xs leading-5 text-gray-500">
                  Compliance status is calculated from documents registered for
                  the authenticated company.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DocumentCompliancePage;
