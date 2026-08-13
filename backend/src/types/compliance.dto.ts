/**
 * ============================================================
 * COMPLIANCE DTO
 * ============================================================
 *
 * PHASE 8 — DOCUMENT COMPLIANCE & EXPIRY MONITORING
 *
 * This file contains request and response DTOs used by:
 *
 * - compliance controller
 * - compliance routes
 * - frontend API
 * - compliance service
 *
 * IMPORTANT:
 *
 * Compliance status is calculated dynamically from expiryDate.
 * It is NOT stored as a separate database field.
 */

import {
  DocumentOwnerType,
  DocumentVerificationStatus,
} from "../models/Document.model";

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
 * PAGINATION REQUEST
 * ============================================================
 */
export interface CompliancePaginationDto {
  /**
   * Page number.
   *
   * Default: 1
   */
  page?: number;

  /**
   * Number of records per page.
   *
   * Default: 20
   */
  limit?: number;
}

/**
 * ============================================================
 * COMMON COMPLIANCE FILTER
 * ============================================================
 */
export interface ComplianceFilterDto extends CompliancePaginationDto {
  /**
   * Document type.
   *
   * Example:
   *
   * puc
   * rc
   * insurance
   */
  documentType?: string;

  /**
   * Vehicle / Driver.
   */
  ownerType?: DocumentOwnerType;

  /**
   * Vehicle MongoDB ObjectId.
   */
  vehicleId?: string;

  /**
   * Driver MongoDB ObjectId.
   */
  driverId?: string;
}

/**
 * ============================================================
 * EXPIRING DOCUMENT QUERY DTO
 * ============================================================
 */
export interface ExpiringDocumentsQueryDto extends ComplianceFilterDto {
  /**
   * Number of days within which documents should be considered
   * expiring.
   *
   * Default: 30
   *
   * Example:
   *
   * days=30
   */
  days?: number;
}

/**
 * ============================================================
 * EXPIRED DOCUMENT QUERY DTO
 * ============================================================
 */
export interface ExpiredDocumentsQueryDto extends ComplianceFilterDto {}

/**
 * ============================================================
 * VALID DOCUMENT QUERY DTO
 * ============================================================
 */
export interface ValidDocumentsQueryDto extends ComplianceFilterDto {
  /**
   * Number of days used as the expiring-soon boundary.
   *
   * Default: 30.
   */
  days?: number;
}

/**
 * ============================================================
 * DOCUMENT WITHOUT EXPIRY QUERY DTO
 * ============================================================
 */
export interface DocumentsWithoutExpiryQueryDto extends CompliancePaginationDto {}

/**
 * ============================================================
 * OCR PENDING QUERY DTO
 * ============================================================
 */
export interface OCRPendingDocumentsQueryDto extends CompliancePaginationDto {}

/**
 * ============================================================
 * COMPLIANCE DOCUMENT RESPONSE
 * ============================================================
 *
 * This is the document-level compliance object returned
 * to the frontend.
 */
export interface ComplianceDocumentDto {
  /**
   * MongoDB document ID.
   */
  _id: string;

  /**
   * Company ID.
   */
  companyId: string;

  /**
   * Document type.
   */
  documentType: string;

  /**
   * Owner type.
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
   * Issue date.
   */
  issueDate?: string;

  /**
   * Expiry date.
   */
  expiryDate?: string;

  /**
   * Uploaded file name.
   */
  originalFileName: string;

  /**
   * Cloudinary file URL.
   */
  fileUrl: string;

  /**
   * Verification status.
   */
  verificationStatus: DocumentVerificationStatus;

  /**
   * OCR processed.
   */
  isOcrProcessed: boolean;

  /**
   * Number of days remaining.
   *
   * Negative value means expired.
   */
  daysRemaining?: number;

  /**
   * Dynamic compliance status.
   */
  complianceStatus: ComplianceStatus;

  /**
   * Convenience boolean.
   */
  isExpired: boolean;

  /**
   * Convenience boolean.
   */
  isExpiringSoon: boolean;
}

/**
 * ============================================================
 * COMPLIANCE PAGINATION RESPONSE
 * ============================================================
 */
export interface CompliancePaginationResponseDto {
  page: number;

  limit: number;

  total: number;

  totalPages: number;

  hasNextPage: boolean;

  hasPreviousPage: boolean;
}

/**
 * ============================================================
 * COMPLIANCE LIST RESPONSE
 * ============================================================
 */
export interface ComplianceListResponseDto {
  documents: ComplianceDocumentDto[];

  pagination: CompliancePaginationResponseDto;
}

/**
 * ============================================================
 * COMPLIANCE SUMMARY RESPONSE
 * ============================================================
 *
 * Used by dashboard cards.
 */
export interface ComplianceSummaryDto {
  /**
   * Total documents.
   */
  totalDocuments: number;

  /**
   * Documents with valid expiry.
   */
  valid: number;

  /**
   * Documents expiring soon.
   */
  expiringSoon: number;

  /**
   * Already expired.
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
 * VEHICLE COMPLIANCE RESPONSE
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
   * Total documents belonging to vehicle.
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
   * Overall vehicle compliance status.
   */
  overallStatus: ComplianceStatus;
}

/**
 * ============================================================
 * DRIVER COMPLIANCE RESPONSE
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
   * Total documents.
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
   * Overall driver compliance status.
   */
  overallStatus: ComplianceStatus;
}

/**
 * ============================================================
 * COMPANY COMPLIANCE RESPONSE
 * ============================================================
 *
 * Used by the main compliance dashboard.
 */
export interface CompanyComplianceDto {
  /**
   * Company-level summary.
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
 * CRITICAL DOCUMENT QUERY
 * ============================================================
 */
export interface CriticalDocumentsQueryDto {
  /**
   * Number of records.
   *
   * Default: 20.
   */
  limit?: number;
}

/**
 * ============================================================
 * COMPLIANCE API ERROR
 * ============================================================
 */
export interface ComplianceErrorDto {
  success: false;

  message: string;

  errors?: Record<string, string[] | string>;
}

/**
 * ============================================================
 * GENERIC COMPLIANCE API RESPONSE
 * ============================================================
 */
export interface ComplianceApiResponseDto<T> {
  success: boolean;

  message: string;

  data: T;
}

/**
 * ============================================================
 * SUMMARY API RESPONSE
 * ============================================================
 */
export type ComplianceSummaryResponse =
  ComplianceApiResponseDto<ComplianceSummaryDto>;

/**
 * ============================================================
 * LIST API RESPONSE
 * ============================================================
 */
export type ComplianceListResponse =
  ComplianceApiResponseDto<ComplianceListResponseDto>;

/**
 * ============================================================
 * VEHICLE API RESPONSE
 * ============================================================
 */
export type VehicleComplianceResponse =
  ComplianceApiResponseDto<VehicleComplianceDto>;

/**
 * ============================================================
 * DRIVER API RESPONSE
 * ============================================================
 */
export type DriverComplianceResponse =
  ComplianceApiResponseDto<DriverComplianceDto>;

/**
 * ============================================================
 * COMPANY API RESPONSE
 * ============================================================
 */
export type CompanyComplianceResponse =
  ComplianceApiResponseDto<CompanyComplianceDto>;

/**
 * ============================================================
 * CRITICAL DOCUMENTS RESPONSE
 * ============================================================
 */
export type CriticalDocumentsResponse = ComplianceApiResponseDto<
  ComplianceDocumentDto[]
>;
