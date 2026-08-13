/**
 * ============================================================
 * EXPIRY TYPES
 * ============================================================
 *
 * Phase 7 — Expiry Detection Engine
 *
 * These types define the contract between:
 *
 * - Expiry Calculator
 * - Expiry Service
 * - Document Service
 * - Dashboard
 * - Reports
 * - Reminder Engine
 *
 * IMPORTANT:
 *
 * Business rules live in:
 *
 *   config/expiry.ts
 *
 * Type definitions live here.
 */

import {
  DocumentType,
  DocumentOwnerType,
  DocumentVerificationStatus,
} from "../models/Document.model";

import { ExpiryStatus } from "../config/expiry";

/**
 * ============================================================
 * EXPIRY DATE INPUT
 * ============================================================
 *
 * Accepted input types for expiry calculations.
 */
export type ExpiryDateInput = Date | string;

/**
 * ============================================================
 * EXPIRY CALCULATION RESULT
 * ============================================================
 *
 * Result returned by:
 *
 * expiryCalculator.util.ts
 */
export interface ExpiryCalculationResult {
  /**
   * Original expiry date.
   */
  expiryDate: Date;

  /**
   * Number of calendar days remaining.
   *
   * Examples:
   *
   * -5  → expired 5 days ago
   *  0  → expires today
   *  7  → expires in 7 days
   * 45  → valid for 45 more days
   */
  daysRemaining: number;

  /**
   * Calculated expiry status.
   */
  status: ExpiryStatus;

  /**
   * Whether the document has expired.
   */
  isExpired: boolean;

  /**
   * Whether the document is expiring soon.
   */
  isExpiringSoon: boolean;

  /**
   * Whether the document is in the critical warning period.
   *
   * Critical:
   *
   * expired
   * today
   * within 7 days
   */
  isCritical: boolean;

  /**
   * Nearest configured warning threshold.
   *
   * Example:
   *
   * daysRemaining = 5
   * warningThreshold = 7
   */
  warningThreshold: number | null;
}

/**
 * ============================================================
 * DOCUMENT EXPIRY RESULT
 * ============================================================
 *
 * Combines document information with calculated expiry data.
 *
 * Used by:
 *
 * - Document API
 * - Dashboard
 * - Reports
 */
export interface DocumentExpiryResult {
  /**
   * Document ID.
   */
  documentId: string;

  /**
   * Company ID.
   */
  companyId: string;

  /**
   * Document type.
   */
  documentType: DocumentType;

  /**
   * Document owner type.
   */
  ownerType: DocumentOwnerType;

  /**
   * Vehicle ID.
   */
  vehicleId?: string;

  /**
   * Driver ID.
   */
  driverId?: string;

  /**
   * Document number.
   */
  documentNumber?: string;

  /**
   * Original file name.
   */
  originalFileName?: string;

  /**
   * Document expiry date.
   */
  expiryDate: Date;

  /**
   * Calculated days remaining.
   */
  daysRemaining: number;

  /**
   * Expiry status.
   */
  status: ExpiryStatus;

  /**
   * Whether document is expired.
   */
  isExpired: boolean;

  /**
   * Whether document is expiring soon.
   */
  isExpiringSoon: boolean;

  /**
   * Whether document is critical.
   */
  isCritical: boolean;

  /**
   * Warning threshold.
   */
  warningThreshold: number | null;

  /**
   * Verification status.
   *
   * Useful because a rejected document should not be
   * considered fully compliant even if its expiry date
   * is still valid.
   */
  verificationStatus: DocumentVerificationStatus;
}

/**
 * ============================================================
 * EXPIRY CALCULATION OPTIONS
 * ============================================================
 *
 * Optional configuration for the calculator.
 */
export interface ExpiryCalculationOptions {
  /**
   * Reference date used for calculation.
   *
   * Defaults to current date.
   *
   * Useful for testing.
   */
  referenceDate?: Date;

  /**
   * Whether calendar-day calculation should be used.
   *
   * Default:
   *
   * true
   */
  useCalendarDays?: boolean;
}

/**
 * ============================================================
 * EXPIRY QUERY FILTER
 * ============================================================
 *
 * Used by expiry service to retrieve documents.
 */
export interface ExpiryQueryFilter {
  /**
   * Company MongoDB ObjectId.
   */
  companyId?: string;

  /**
   * Vehicle MongoDB ObjectId.
   */
  vehicleId?: string;

  /**
   * Driver MongoDB ObjectId.
   */
  driverId?: string;

  /**
   * Document type.
   */
  documentType?: DocumentType;

  /**
   * Owner type.
   */
  ownerType?: DocumentOwnerType;

  /**
   * Expiry status.
   */
  status?: ExpiryStatus;

  /**
   * Minimum remaining days.
   */
  minDaysRemaining?: number;

  /**
   * Maximum remaining days.
   */
  maxDaysRemaining?: number;

  /**
   * Include expired documents.
   */
  includeExpired?: boolean;

  /**
   * Include rejected documents.
   */
  includeRejected?: boolean;
}

/**
 * ============================================================
 * EXPIRY LIST OPTIONS
 * ============================================================
 */
export interface ExpiryListOptions {
  /**
   * Pagination page.
   */
  page?: number;

  /**
   * Number of documents per page.
   */
  limit?: number;

  /**
   * Sort direction.
   */
  sortOrder?: "asc" | "desc";

  /**
   * Filter.
   */
  filter?: ExpiryQueryFilter;
}

/**
 * ============================================================
 * EXPIRY PAGINATION
 * ============================================================
 */
export interface ExpiryPagination {
  /**
   * Current page.
   */
  page: number;

  /**
   * Page size.
   */
  limit: number;

  /**
   * Total matching documents.
   */
  total: number;

  /**
   * Total pages.
   */
  totalPages: number;

  /**
   * Whether another page exists.
   */
  hasNextPage: boolean;

  /**
   * Whether a previous page exists.
   */
  hasPreviousPage: boolean;
}

/**
 * ============================================================
 * EXPIRY LIST RESULT
 * ============================================================
 */
export interface ExpiryListResult {
  /**
   * Expiry-aware documents.
   */
  documents: DocumentExpiryResult[];

  /**
   * Pagination information.
   */
  pagination: ExpiryPagination;
}

/**
 * ============================================================
 * EXPIRY STATUS COUNT
 * ============================================================
 *
 * Used by dashboard/analytics.
 */
export interface ExpiryStatusCount {
  /**
   * Number of documents.
   */
  count: number;

  /**
   * Percentage of total documents.
   */
  percentage: number;
}

/**
 * ============================================================
 * EXPIRY SUMMARY
 * ============================================================
 *
 * Main dashboard-ready expiry summary.
 */
export interface ExpirySummary {
  /**
   * Total documents with an expiry date.
   */
  total: number;

  /**
   * Expired documents.
   */
  expired: ExpiryStatusCount;

  /**
   * Documents expiring today.
   */
  expiringToday: ExpiryStatusCount;

  /**
   * Documents expiring within 7 days.
   */
  expiringIn7Days: ExpiryStatusCount;

  /**
   * Documents expiring within 15 days.
   */
  expiringIn15Days: ExpiryStatusCount;

  /**
   * Documents expiring within 30 days.
   */
  expiringIn30Days: ExpiryStatusCount;

  /**
   * Documents considered valid beyond 30 days.
   */
  valid: ExpiryStatusCount;
}

/**
 * ============================================================
 * EXPIRY DASHBOARD RESULT
 * ============================================================
 *
 * Future dashboard API can return this structure.
 */
export interface ExpiryDashboardResult {
  /**
   * Summary counts.
   */
  summary: ExpirySummary;

  /**
   * Most urgent documents.
   */
  criticalDocuments: DocumentExpiryResult[];

  /**
   * Documents expiring soon.
   */
  upcomingDocuments: DocumentExpiryResult[];

  /**
   * Last calculation timestamp.
   */
  calculatedAt: Date;
}

/**
 * ============================================================
 * EXPIRY ALERT
 * ============================================================
 *
 * This will be used by Phase 8 Reminder Engine.
 *
 * Phase 7 only detects the condition.
 *
 * Phase 8 will actually send notifications.
 */
export interface ExpiryAlert {
  /**
   * Document ID.
   */
  documentId: string;

  /**
   * Company ID.
   */
  companyId: string;

  /**
   * Document type.
   */
  documentType: DocumentType;

  /**
   * Vehicle ID.
   */
  vehicleId?: string;

  /**
   * Driver ID.
   */
  driverId?: string;

  /**
   * Expiry date.
   */
  expiryDate: Date;

  /**
   * Remaining days.
   */
  daysRemaining: number;

  /**
   * Current expiry status.
   */
  status: ExpiryStatus;

  /**
   * Whether this alert should be considered critical.
   */
  isCritical: boolean;
}

/**
 * ============================================================
 * EXPIRY ENGINE RESULT
 * ============================================================
 *
 * Result returned after processing a document through the
 * expiry detection engine.
 */
export interface ExpiryEngineResult {
  /**
   * Whether calculation was successful.
   */
  success: boolean;

  /**
   * Document ID.
   */
  documentId: string;

  /**
   * Expiry calculation.
   */
  expiry: DocumentExpiryResult;

  /**
   * Any warnings generated during calculation.
   */
  warnings: string[];

  /**
   * Calculation timestamp.
   */
  calculatedAt: Date;
}

/**
 * ============================================================
 * EXPIRY BATCH RESULT
 * ============================================================
 *
 * Used when processing many documents at once.
 */
export interface ExpiryBatchResult {
  /**
   * Number of documents processed.
   */
  processed: number;

  /**
   * Number successfully calculated.
   */
  successful: number;

  /**
   * Number failed.
   */
  failed: number;

  /**
   * Number expired.
   */
  expired: number;

  /**
   * Number expiring soon.
   */
  expiringSoon: number;

  /**
   * Number critical.
   */
  critical: number;

  /**
   * Individual results.
   */
  results: ExpiryEngineResult[];

  /**
   * Processing timestamp.
   */
  processedAt: Date;
}

/**
 * ============================================================
 * EXPIRY REMINDER CANDIDATE
 * ============================================================
 *
 * Bridge between Phase 7 and Phase 8.
 *
 * This does NOT send a reminder.
 *
 * It only identifies that a reminder may be required.
 */
export interface ExpiryReminderCandidate {
  /**
   * Document ID.
   */
  documentId: string;

  /**
   * Company ID.
   */
  companyId: string;

  /**
   * Document type.
   */
  documentType: DocumentType;

  /**
   * Vehicle ID.
   */
  vehicleId?: string;

  /**
   * Driver ID.
   */
  driverId?: string;

  /**
   * Expiry date.
   */
  expiryDate: Date;

  /**
   * Days remaining.
   */
  daysRemaining: number;

  /**
   * Current expiry status.
   */
  status: ExpiryStatus;

  /**
   * Reminder threshold that was reached.
   *
   * Examples:
   *
   * 30
   * 15
   * 7
   * 0
   */
  reminderThreshold: number;
}

/**
 * ============================================================
 * EXPORT
 * ============================================================
 */
export default {};
