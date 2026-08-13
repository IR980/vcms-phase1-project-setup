/**
 * ============================================================
 * COMPLIANCE DTO TYPES
 * ============================================================
 *
 * PHASE 8 — DOCUMENT COMPLIANCE & EXPIRY MONITORING
 *
 * Frontend response/request types for:
 *
 * - Compliance Dashboard
 * - Expiring Documents
 * - Expired Documents
 * - Valid Documents
 * - OCR Pending Documents
 * - Vehicle Compliance
 * - Driver Compliance
 */

/**
 * ============================================================
 * COMPLIANCE STATUS
 * ============================================================
 */

export type ComplianceStatus =
  | "valid"
  | "expiring_soon"
  | "expired"
  | "no_expiry";

/**
 * ============================================================
 * OWNER TYPE
 * ============================================================
 */

export type ComplianceOwnerType = "vehicle" | "driver";

/**
 * ============================================================
 * VERIFICATION STATUS
 * ============================================================
 */

export type ComplianceVerificationStatus =
  | "uploaded"
  | "pending_verification"
  | "verified"
  | "rejected";

/**
 * ============================================================
 * COMPLIANCE DOCUMENT
 * ============================================================
 *
 * Represents one document with dynamically calculated
 * compliance information.
 */

export interface ComplianceDocumentDto {
  /**
   * MongoDB document ID.
   */
  _id: string;

  /**
   * Company MongoDB ObjectId.
   */
  companyId: string;

  /**
   * Document type.
   *
   * Examples:
   *
   * rc
   * puc
   * fitness
   * insurance
   * permit
   */
  documentType: string;

  /**
   * Document owner.
   */
  ownerType: ComplianceOwnerType;

  /**
   * Vehicle MongoDB ObjectId.
   */
  vehicleId?: string;

  /**
   * Driver MongoDB ObjectId.
   */
  driverId?: string;

  /**
   * Document number.
   */
  documentNumber?: string;

  /**
   * Issue date.
   *
   * ISO date string returned by backend.
   */
  issueDate?: string;

  /**
   * Expiry date.
   *
   * ISO date string returned by backend.
   */
  expiryDate?: string;

  /**
   * Original uploaded filename.
   */
  originalFileName: string;

  /**
   * Cloudinary secure URL.
   */
  fileUrl: string;

  /**
   * Document verification status.
   */
  verificationStatus: ComplianceVerificationStatus;

  /**
   * Whether OCR has processed this document.
   */
  isOcrProcessed: boolean;

  /**
   * Number of days remaining.
   *
   * Examples:
   *
   * 30  → expires in 30 days
   * 0   → expires today
   * -5  → expired 5 days ago
   */
  daysRemaining?: number;

  /**
   * Dynamically calculated compliance status.
   */
  complianceStatus: ComplianceStatus;

  /**
   * Convenience flag.
   */
  isExpired: boolean;

  /**
   * Convenience flag.
   */
  isExpiringSoon: boolean;
}

/**
 * ============================================================
 * PAGINATION
 * ============================================================
 */

export interface CompliancePaginationResponseDto {
  /**
   * Current page.
   */
  page: number;

  /**
   * Records per page.
   */
  limit: number;

  /**
   * Total records.
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
   * Whether previous page exists.
   */
  hasPreviousPage: boolean;
}

/**
 * ============================================================
 * COMPLIANCE LIST RESPONSE
 * ============================================================
 */

export interface ComplianceListResponseDto {
  /**
   * Compliance documents.
   */
  documents: ComplianceDocumentDto[];

  /**
   * Pagination information.
   */
  pagination: CompliancePaginationResponseDto;
}

/**
 * ============================================================
 * COMPLIANCE SUMMARY
 * ============================================================
 *
 * Used by dashboard summary cards.
 */

export interface ComplianceSummaryDto {
  /**
   * Total documents.
   */
  totalDocuments: number;

  /**
   * Valid documents.
   */
  valid: number;

  /**
   * Expiring within configured threshold.
   */
  expiringSoon: number;

  /**
   * Expired documents.
   */
  expired: number;

  /**
   * Documents without expiry date.
   */
  noExpiry: number;

  /**
   * OCR successfully processed.
   */
  ocrProcessed: number;

  /**
   * OCR not processed.
   */
  ocrPending: number;

  /**
   * Waiting for verification.
   */
  verificationPending: number;

  /**
   * Verified documents.
   */
  verified: number;

  /**
   * Rejected documents.
   */
  rejected: number;
}

/**
 * ============================================================
 * VEHICLE COMPLIANCE
 * ============================================================
 */

export interface VehicleComplianceDto {
  /**
   * Vehicle MongoDB ObjectId.
   */
  vehicleId: string;

  /**
   * Vehicle documents.
   */
  documents: ComplianceDocumentDto[];

  /**
   * Total vehicle documents.
   */
  totalDocuments: number;

  /**
   * Valid documents.
   */
  valid: number;

  /**
   * Expiring soon.
   */
  expiringSoon: number;

  /**
   * Expired documents.
   */
  expired: number;

  /**
   * Documents without expiry.
   */
  noExpiry: number;

  /**
   * Overall vehicle compliance.
   */
  overallStatus: ComplianceStatus;
}

/**
 * ============================================================
 * DRIVER COMPLIANCE
 * ============================================================
 */

export interface DriverComplianceDto {
  /**
   * Driver MongoDB ObjectId.
   */
  driverId: string;

  /**
   * Driver documents.
   */
  documents: ComplianceDocumentDto[];

  /**
   * Total driver documents.
   */
  totalDocuments: number;

  /**
   * Valid documents.
   */
  valid: number;

  /**
   * Expiring soon.
   */
  expiringSoon: number;

  /**
   * Expired documents.
   */
  expired: number;

  /**
   * Documents without expiry.
   */
  noExpiry: number;

  /**
   * Overall driver compliance.
   */
  overallStatus: ComplianceStatus;
}

/**
 * ============================================================
 * COMPANY COMPLIANCE
 * ============================================================
 *
 * Used by the main compliance dashboard.
 */

export interface CompanyComplianceDto {
  /**
   * Company summary.
   */
  summary: ComplianceSummaryDto;

  /**
   * Expired documents.
   */
  expired: ComplianceDocumentDto[];

  /**
   * Documents expiring soon.
   */
  expiringSoon: ComplianceDocumentDto[];

  /**
   * Documents without expiry.
   */
  noExpiry: ComplianceDocumentDto[];
}

/**
 * ============================================================
 * API RESPONSE WRAPPER
 * ============================================================
 *
 * Matches backend:
 *
 * {
 *   success: true,
 *   message: "...",
 *   data: ...
 * }
 */

export interface ComplianceApiResponse<T> {
  success: boolean;

  message: string;

  data: T;
}

/**
 * ============================================================
 * SPECIFIC API RESPONSES
 * ============================================================
 */

export type ComplianceSummaryResponse =
  ComplianceApiResponse<ComplianceSummaryDto>;

export type ComplianceListResponse =
  ComplianceApiResponse<ComplianceListResponseDto>;

export type VehicleComplianceResponse =
  ComplianceApiResponse<VehicleComplianceDto>;

export type DriverComplianceResponse =
  ComplianceApiResponse<DriverComplianceDto>;

export type CompanyComplianceResponse =
  ComplianceApiResponse<CompanyComplianceDto>;

export type CriticalDocumentsResponse = ComplianceApiResponse<
  ComplianceDocumentDto[]
>;

/**
 * ============================================================
 * QUERY TYPES
 * ============================================================
 */

/**
 * Pagination.
 */
export interface CompliancePaginationParams {
  page?: number;

  limit?: number;
}

/**
 * Common filters.
 */
export interface ComplianceFilterParams extends CompliancePaginationParams {
  documentType?: string;

  ownerType?: "vehicle" | "driver";

  vehicleId?: string;

  driverId?: string;
}

/**
 * Expiring documents.
 */
export interface ExpiringDocumentsParams extends ComplianceFilterParams {
  days?: number;
}

/**
 * Valid documents.
 */
export interface ValidDocumentsParams extends ComplianceFilterParams {
  days?: number;
}

/**
 * Critical documents.
 */
export interface CriticalDocumentsParams {
  limit?: number;
}

/**
 * ============================================================
 * DOCUMENT TYPE LABELS
 * ============================================================
 *
 * Useful for frontend UI.
 */

export const COMPLIANCE_DOCUMENT_TYPE_LABELS: Record<string, string> = {
  rc: "Registration Certificate",

  puc: "Pollution Under Control",

  fitness: "Fitness Certificate",

  insurance: "Insurance",

  permit: "Permit",

  road_tax: "Road Tax",

  driving_license: "Driving License",

  medical_certificate: "Medical Certificate",

  other: "Other",
};

/**
 * ============================================================
 * STATUS LABELS
 * ============================================================
 */

export const COMPLIANCE_STATUS_LABELS: Record<ComplianceStatus, string> = {
  valid: "Valid",

  expiring_soon: "Expiring Soon",

  expired: "Expired",

  no_expiry: "Expiry Not Available",
};

/**
 * ============================================================
 * STATUS COLOR HELPERS
 * ============================================================
 *
 * Tailwind class names for reusable UI components.
 */

export const COMPLIANCE_STATUS_CLASSES: Record<ComplianceStatus, string> = {
  valid: "bg-green-50 text-green-700 border-green-200",

  expiring_soon: "bg-yellow-50 text-yellow-700 border-yellow-200",

  expired: "bg-red-50 text-red-700 border-red-200",

  no_expiry: "bg-gray-50 text-gray-700 border-gray-200",
};
