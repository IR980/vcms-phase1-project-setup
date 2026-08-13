/**
 * ============================================================
 * EXPIRY DASHBOARD PAGE
 * ============================================================
 *
 * Phase 7 — Expiry Detection Engine
 *
 * Responsibilities:
 *
 * - Load expiry dashboard data
 * - Display expiry summary cards
 * - Display critical documents
 * - Display upcoming documents
 * - Handle loading / error states
 * - Navigate to document details
 * - Navigate to filtered expiry list
 * - Refresh expiry data
 */

import { useCallback, useEffect } from "react";

import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  Clock3,
  FileWarning,
  RefreshCw,
  ShieldAlert,
  TimerReset,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import ExpirySummaryCard from "../../components/expiry/ExpirySummaryCard";

import ExpiryTable from "../../components/expiry/ExpiryTable";

import { useExpiryStore } from "../../store/expiry.store";

import type { DocumentExpiryResult } from "../../types/expiry.types";

/**
 * ============================================================
 * COMPONENT
 * ============================================================
 */
const ExpiryDashboardPage = () => {
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

  const dashboard = useExpiryStore((state) => state.dashboard);

  const summary = useExpiryStore((state) => state.summary);

  const isDashboardLoading = useExpiryStore(
    (state) => state.isDashboardLoading,
  );

  const error = useExpiryStore((state) => state.error);

  const fetchDashboard = useExpiryStore((state) => state.fetchDashboard);

  const fetchSummary = useExpiryStore((state) => state.fetchSummary);

  const clearError = useExpiryStore((state) => state.clearError);

  /**
   * ==========================================================
   * LOAD DASHBOARD
   * ==========================================================
   */
  const loadDashboard = useCallback(async () => {
    /**
     * ----------------------------------------------------
     * Clear previous error
     * ----------------------------------------------------
     */
    clearError();

    /**
     * ----------------------------------------------------
     * Fetch dashboard
     * ----------------------------------------------------
     *
     * Dashboard response already contains summary.
     *
     * We also call summary API separately so that
     * the store remains independently usable.
     */
    await fetchDashboard();

    await fetchSummary();
  }, [clearError, fetchDashboard, fetchSummary]);

  /**
   * ==========================================================
   * INITIAL LOAD
   * ==========================================================
   */
  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  /**
   * ==========================================================
   * VIEW DOCUMENT
   * ==========================================================
   *
   * Opens the actual document details page.
   *
   * Route:
   *
   * /documents/:id
   */
  const handleViewDocument = (document: DocumentExpiryResult) => {
    navigate(`/documents/${document.documentId}`);
  };

  /**
   * ==========================================================
   * NAVIGATE TO EXPIRY LIST
   * ==========================================================
   *
   * IMPORTANT:
   *
   * Do NOT use:
   *
   * /documents/expiry
   *
   * because /documents/:id would treat "expiry"
   * as a document ID.
   *
   * Correct route:
   *
   * /expiry/list
   */
  const handleExpiryFilter = (status: string) => {
    navigate(`/expiry/list?status=${encodeURIComponent(status)}`);
  };

  /**
   * ==========================================================
   * SUMMARY DATA
   * ==========================================================
   *
   * Dashboard summary is preferred.
   *
   * Store summary is used as fallback.
   */
  const dashboardSummary = dashboard?.summary ?? summary;

  /**
   * ==========================================================
   * DOCUMENT DATA
   * ==========================================================
   */
  const criticalDocuments = dashboard?.criticalDocuments ?? [];

  const upcomingDocuments = dashboard?.upcomingDocuments ?? [];

  /**
   * ============================================================
   * RENDER
   * ============================================================
   */
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* ================================================== */}
      {/* PAGE HEADER */}
      {/* ================================================== */}

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        {/* ================================================= */}
        {/* TITLE */}
        {/* ================================================= */}

        <div>
          <div className="flex items-center gap-2">
            <TimerReset className="h-6 w-6 text-blue-600" aria-hidden="true" />

            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              Document Expiry
            </h1>
          </div>

          <p className="mt-1 text-sm text-gray-500">
            Monitor vehicle and driver documents and identify upcoming
            compliance risks.
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
          disabled={isDashboardLoading}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshCw
            className={[
              "h-4 w-4",
              isDashboardLoading ? "animate-spin" : "",
            ].join(" ")}
            aria-hidden="true"
          />

          {isDashboardLoading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* ================================================== */}
      {/* ERROR */}
      {/* ================================================== */}

      {error && (
        <div
          role="alert"
          className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3"
        >
          <AlertTriangle
            className="mt-0.5 h-5 w-5 shrink-0 text-red-600"
            aria-hidden="true"
          />

          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-red-800">
              Unable to load expiry data
            </p>

            <p className="mt-1 text-sm text-red-700">{error}</p>
          </div>

          <button
            type="button"
            onClick={() => {
              void loadDashboard();
            }}
            className="shrink-0 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50"
          >
            Retry
          </button>
        </div>
      )}

      {/* ================================================== */}
      {/* SUMMARY CARDS */}
      {/* ================================================== */}

      <section aria-label="Expiry summary" className="mb-8">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Compliance Overview
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Current status of documents with expiry dates.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {/* ================================================= */}
          {/* TOTAL */}
          {/* ================================================= */}

          <ExpirySummaryCard
            title="Total"
            count={dashboardSummary?.total ?? 0}
            percentage={100}
            icon={CalendarClock}
            description="Documents tracked"
          />

          {/* ================================================= */}
          {/* EXPIRED */}
          {/* ================================================= */}

          <ExpirySummaryCard
            title="Expired"
            count={dashboardSummary?.expired.count ?? 0}
            percentage={dashboardSummary?.expired.percentage}
            icon={ShieldAlert}
            description="Immediate attention"
            className="border-red-100"
            onClick={() => handleExpiryFilter("expired")}
          />

          {/* ================================================= */}
          {/* TODAY */}
          {/* ================================================= */}

          <ExpirySummaryCard
            title="Today"
            count={dashboardSummary?.expiringToday.count ?? 0}
            percentage={dashboardSummary?.expiringToday.percentage}
            icon={FileWarning}
            description="Expires today"
            className="border-orange-100"
            onClick={() => handleExpiryFilter("expiring_today")}
          />

          {/* ================================================= */}
          {/* 7 DAYS */}
          {/* ================================================= */}

          <ExpirySummaryCard
            title="7 Days"
            count={dashboardSummary?.expiringIn7Days.count ?? 0}
            percentage={dashboardSummary?.expiringIn7Days.percentage}
            icon={Clock3}
            description="Due within 7 days"
            className="border-orange-100"
            onClick={() => handleExpiryFilter("expiring_in_7_days")}
          />

          {/* ================================================= */}
          {/* 15 DAYS */}
          {/* ================================================= */}

          <ExpirySummaryCard
            title="15 Days"
            count={dashboardSummary?.expiringIn15Days.count ?? 0}
            percentage={dashboardSummary?.expiringIn15Days.percentage}
            icon={Clock3}
            description="Due within 15 days"
            className="border-yellow-100"
            onClick={() => handleExpiryFilter("expiring_in_15_days")}
          />

          {/* ================================================= */}
          {/* 30 DAYS */}
          {/* ================================================= */}

          <ExpirySummaryCard
            title="30 Days"
            count={dashboardSummary?.expiringIn30Days.count ?? 0}
            percentage={dashboardSummary?.expiringIn30Days.percentage}
            icon={CheckCircle2}
            description="Due within 30 days"
            className="border-blue-100"
            onClick={() => handleExpiryFilter("expiring_in_30_days")}
          />
        </div>
      </section>

      {/* ================================================== */}
      {/* CRITICAL DOCUMENTS */}
      {/* ================================================== */}

      <section className="mb-8">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <ShieldAlert
                className="h-5 w-5 text-red-600"
                aria-hidden="true"
              />

              <h2 className="text-lg font-semibold text-gray-900">
                Critical Documents
              </h2>
            </div>

            <p className="mt-1 text-sm text-gray-500">
              Documents requiring immediate compliance attention.
            </p>
          </div>

          {criticalDocuments.length > 0 && (
            <span className="inline-flex w-fit rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700">
              {criticalDocuments.length} critical
            </span>
          )}
        </div>

        <ExpiryTable
          documents={criticalDocuments}
          loading={isDashboardLoading}
          onView={handleViewDocument}
          emptyMessage="No critical documents found."
        />
      </section>

      {/* ================================================== */}
      {/* UPCOMING DOCUMENTS */}
      {/* ================================================== */}

      <section className="mb-8">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Clock3 className="h-5 w-5 text-orange-600" aria-hidden="true" />

              <h2 className="text-lg font-semibold text-gray-900">
                Upcoming Expiry
              </h2>
            </div>

            <p className="mt-1 text-sm text-gray-500">
              Documents approaching their expiry date.
            </p>
          </div>

          {upcomingDocuments.length > 0 && (
            <span className="inline-flex w-fit rounded-full border border-orange-200 bg-orange-50 px-2.5 py-1 text-xs font-semibold text-orange-700">
              {upcomingDocuments.length} upcoming
            </span>
          )}
        </div>

        <ExpiryTable
          documents={upcomingDocuments}
          loading={isDashboardLoading}
          onView={handleViewDocument}
          emptyMessage="No upcoming document expiries found."
        />
      </section>

      {/* ================================================== */}
      {/* LAST UPDATED */}
      {/* ================================================== */}

      {dashboard?.calculatedAt && (
        <div className="flex items-center justify-end border-t border-gray-100 pt-4">
          <p className="text-xs text-gray-400">
            Last calculated:{" "}
            {new Date(dashboard.calculatedAt).toLocaleString("en-IN", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </p>
        </div>
      )}
    </div>
  );
};

export default ExpiryDashboardPage;
