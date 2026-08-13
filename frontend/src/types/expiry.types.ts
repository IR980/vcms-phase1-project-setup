/**
 * ============================================================
 * EXPIRY TYPES
 * ============================================================
 *
 * Phase 7 — Frontend Expiry Detection Engine
 *
 * Responsibility:
 *
 * - Expiry API response types
 * - Expiry filters
 * - Dashboard types
 * - Pagination types
 * - Reminder candidate types
 *
 * IMPORTANT:
 *
 * These are frontend types only.
 * Business logic remains on the backend.
 */

/**
 * ============================================================
 * EXPIRY STATUS
 * ============================================================
 *
 * Must match:
 *
 * server/src/config/expiry.ts
 */
export const EXPIRY_STATUS = {
  EXPIRED: "expired",
  EXPIRING_TODAY: "expiring_today",
  EXPIRING_IN_7_DAYS: "expiring_in_7_days",
  EXPIRING_IN_15_DAYS: "expiring_in_15_days",
  EXPIRING_IN_30_DAYS: "expiring_in_30_days",
  VALID: "valid",
} as const;

export type ExpiryStatus =
  (typeof EXPIRY_STATUS)[keyof typeof EXPIRY_STATUS];

/**
 * ============================================================
 * DOCUMENT TYPE
 * ============================================================
 *
 * Must match backend DocumentType.
 */
export const EXPIRY_DOCUMENT_TYPE = {
  RC : "rc",

  PUC : "puc",

  FITNESS : "fitness",

  INSURANCE : "insurance",

  PERMIT : "permit",

  ROAD_TAX : "road_tax",

  DRIVING_LICENSE : "driving_license",

  MEDICAL_CERTIFICATE : "medical_certificate",

  OTHER : "other",
} as const;

/**
 * Type derived from the constant object.
 */
export type ExpiryDocumentType =
  (typeof EXPIRY_DOCUMENT_TYPE)[keyof typeof EXPIRY_DOCUMENT_TYPE];

/**
 * ============================================================
 * DOCUMENT OWNER TYPE
 * ============================================================
 */
export const EXPIRY_DOCUMENT_OWNER_TYPE = {
  VEHICLE: "vehicle",

  DRIVER: "driver",
} as const;

export type ExpiryDocumentOwnerType =
  (typeof EXPIRY_DOCUMENT_OWNER_TYPE)[keyof typeof EXPIRY_DOCUMENT_OWNER_TYPE];
/**
 * ============================================================
 * VERIFICATION STATUS
 * ============================================================
 *
 * Must match backend DocumentVerificationStatus.
 */
export const EXPIRY_VERIFICATION_STATUS = {
  UPLOADED: "uploaded",

  PENDING_VERIFICATION: "pending_verification",

  VERIFIED: "verified",

  REJECTED: "rejected",
} as const;

export type ExpiryVerificationStatus =
  (typeof EXPIRY_VERIFICATION_STATUS)[keyof typeof EXPIRY_VERIFICATION_STATUS];

/**
 * ============================================================
 * DOCUMENT EXPIRY RESULT
 * ============================================================
 *
 * Represents one document after expiry calculation.
 */
export interface DocumentExpiryResult {
  /**
   * MongoDB document ID.
   */
  documentId: string;

  /**
   * MongoDB company ID.
   */
  companyId: string;

  /**
   * Document type.
   */
  documentType: ExpiryDocumentType;

  /**
   * Document owner.
   */
  ownerType: ExpiryDocumentOwnerType;

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
   * Original uploaded file name.
   */
  originalFileName?: string;

  /**
   * Expiry date.
   *
   * Backend returns this as an ISO date string through JSON.
   */
  expiryDate: string;

  /**
   * Number of calendar days remaining.
   *
   * Negative:
   *   expired
   *
   * Zero:
   *   expires today
   *
   * Positive:
   *   days remaining
   */
  daysRemaining: number;

  /**
   * Calculated expiry status.
   */
  status: ExpiryStatus;

  /**
   * Whether document is already expired.
   */
  isExpired: boolean;

  /**
   * Whether document is inside configured warning period.
   */
  isExpiringSoon: boolean;

  /**
   * Whether document requires critical attention.
   */
  isCritical: boolean;

  /**
   * Nearest expiry warning threshold.
   *
   * Example:
   *
   * 7
   * 15
   * 30
   *
   * null when no warning threshold applies.
   */
  warningThreshold: number | null;

  /**
   * Document verification status.
   */
  verificationStatus: ExpiryVerificationStatus;
}

/**
 * ============================================================
 * EXPIRY QUERY FILTER
 * ============================================================
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
  documentType?: ExpiryDocumentType;

  /**
   * Owner type.
   */
  ownerType?: ExpiryDocumentOwnerType;

  /**
   * Expiry status.
   */
  status?: ExpiryStatus;

  /**
   * Minimum days remaining.
   */
  minDaysRemaining?: number;

  /**
   * Maximum days remaining.
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
 * EXPIRY LIST PARAMETERS
 * ============================================================
 */
export interface GetExpiryDocumentsParams {
  /**
   * Page number.
   */
  page?: number;

  /**
   * Page size.
   */
  limit?: number;

  /**
   * Sort order.
   */
  sortOrder?: "asc" | "desc";

  /**
   * Expiry filters.
   */
  filter?: ExpiryQueryFilter;
}

/**
 * ============================================================
 * PAGINATION
 * ============================================================
 */
export interface ExpiryPagination {
  /**
   * Current page.
   */
  page: number;

  /**
   * Number of records per page.
   */
  limit: number;

  /**
   * Total matching records.
   */
  total: number;

  /**
   * Total number of pages.
   */
  totalPages: number;

  /**
   * Whether next page exists.
   */
  hasNextPage: boolean;

  /**
   * Whether previous page exists.
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
 * Used by dashboard summary cards.
 */
export interface ExpirySummary {
  /**
   * Total documents having expiry dates.
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
   * Documents valid beyond 30 days.
   */
  valid: ExpiryStatusCount;
}

/**
 * ============================================================
 * EXPIRY DASHBOARD RESULT
 * ============================================================
 */
export interface ExpiryDashboardResult {
  /**
   * Dashboard summary.
   */
  summary: ExpirySummary;

  /**
   * Most critical documents.
   */
  criticalDocuments: DocumentExpiryResult[];

  /**
   * Upcoming expiry documents.
   */
  upcomingDocuments: DocumentExpiryResult[];

  /**
   * Server calculation timestamp.
   */
  calculatedAt: string;
}

/**
 * ============================================================
 * EXPIRY REMINDER CANDIDATE
 * ============================================================
 *
 * Bridge between:
 *
 * Phase 7 — Expiry Detection
 *
 * and
 *
 * Phase 8 — Reminder Engine
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
  documentType: ExpiryDocumentType;

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
  expiryDate: string;

  /**
   * Days remaining.
   */
  daysRemaining: number;

  /**
   * Current expiry status.
   */
  status: ExpiryStatus;

  /**
   * Reminder threshold reached.
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
 * EXPIRY ENGINE RESULT
 * ============================================================
 */
export interface ExpiryEngineResult {
  /**
   * Whether processing succeeded.
   */
  success: boolean;

  /**
   * Document ID.
   */
  documentId: string;

  /**
   * Calculated expiry information.
   */
  expiry: DocumentExpiryResult;

  /**
   * Processing warnings.
   */
  warnings: string[];

  /**
   * Processing timestamp.
   */
  calculatedAt: string;
}

/**
 * ============================================================
 * EXPIRY BATCH RESULT
 * ============================================================
 */
export interface ExpiryBatchResult {
  /**
   * Total documents processed.
   */
  processed: number;

  /**
   * Successfully processed.
   */
  successful: number;

  /**
   * Failed documents.
   */
  failed: number;

  /**
   * Expired documents.
   */
  expired: number;

  /**
   * Expiring soon.
   */
  expiringSoon: number;

  /**
   * Critical documents.
   */
  critical: number;

  /**
   * Individual processing results.
   */
  results: ExpiryEngineResult[];

  /**
   * Processing timestamp.
   */
  processedAt: string;
}

/**
 * ============================================================
 * DEFAULT EXPORT
 * ============================================================
 */
export default {};