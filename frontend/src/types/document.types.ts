/**
 * ============================================================
 * DOCUMENT TYPES
 * ============================================================
 *
 * Frontend types corresponding to the backend
 * Document.model.ts and document.dto.ts
 */

// import { data } from "react-router-dom";

/**
 * ============================================================
 * DOCUMENT TYPE
 * ============================================================
 */
export type DocumentType =
  | "rc"
  | "puc"
  | "fitness"
  | "insurance"
  | "permit"
  | "road_tax"
  | "driving_license"
  | "medical_certificate"
  | "other";

/**
 * ============================================================
 * DOCUMENT OWNER TYPE
 * ============================================================
 */
export type DocumentOwnerType = "vehicle" | "driver";

/**
 * ============================================================
 * VERIFICATION STATUS
 * ============================================================
 */
export type DocumentVerificationStatus =
  | "uploaded"
  | "pending_verification"
  | "verified"
  | "rejected";

/**
 * ============================================================
 * CLOUDINARY RESOURCE TYPE
 * ============================================================
 */
export type CloudinaryResourceType = "image" | "raw";

/**
 * ============================================================
 * COMPLIANCE STATUS
 * ============================================================
 *
 * Calculated by backend from expiryDate.
 */
export type ComplianceStatus = "valid" | "expiring_soon" | "expired";

/**
 * ============================================================
 * DOCUMENT
 * ============================================================
 */
export interface Document {
  _id: string;

  companyId: string;

  documentType: DocumentType;

  ownerType: DocumentOwnerType;

  vehicleId?: string;

  driverId?: string;

  documentNumber?: string;

  issueDate?: string;

  expiryDate: string;

  issuingAuthority?: string;

  /**
   * Cloudinary secure URL.
   */
  fileUrl: string;

  /**
   * Original uploaded filename.
   */
  originalFileName: string;

  /**
   * MIME type.
   */
  mimeType: string;

  /**
   * File size in bytes.
   */
  fileSize: number;

  /**
   * Cloudinary public ID.
   */
  cloudinaryPublicId: string;

  /**
   * Cloudinary resource type.
   */
  cloudinaryResourceType: CloudinaryResourceType;

  /**
   * Cloudinary file format.
   *
   * Example:
   *
   * pdf
   * jpg
   * png
   */
  cloudinaryFormat?: string;

  /**
   * Verification status.
   */
  verificationStatus: DocumentVerificationStatus;

  /**
   * OCR processing status.
   */
  isOcrProcessed: boolean;

  /**
   * OCR extracted text.
   */
  extractedText?: string;

  /**
   * Additional notes.
   */
  notes?: string;

  /**
   * Uploaded by user.
   */
  uploadedBy?: string;

  /**
   * Verified by user.
   */
  verifiedBy?: string;

  /**
   * Verification timestamp.
   */
  verifiedAt?: string;

  /**
   * ========================================================
   * COMPLIANCE INFORMATION
   * ========================================================
   *
   * These values are calculated by the backend.
   */
  daysRemaining?: number;

  complianceStatus: ComplianceStatus;

  createdAt: string;

  updatedAt: string;
}

/**
 * ============================================================
 * CREATE DOCUMENT FORM
 * ============================================================
 *
 * Used by the React document creation form.
 *
 * File is required when creating a document.
 */
export interface CreateDocumentFormData {
  companyId: string;

  documentType: DocumentType;

  ownerType: DocumentOwnerType;

  vehicleId?: string;

  driverId?: string;

  documentNumber?: string;

  issueDate?: string ;

  expiryDate: string | Date;

  issuingAuthority?: string;

  notes?: string;

  /**
   * Uploaded document.
   */
  file: File | null;
}

/**
 * ============================================================
 * UPDATE DOCUMENT FORM
 * ============================================================
 *
 * File is optional because the user may only update
 * document metadata.
 */
export interface UpdateDocumentFormData {
  documentType?: DocumentType;

  ownerType?: DocumentOwnerType;

  vehicleId?: string;

  driverId?: string;

  documentNumber?: string;

  issueDate?: string;

  expiryDate?: string;

  issuingAuthority?: string;

  verificationStatus?: DocumentVerificationStatus;

  notes?: string;

  /**
   * Optional replacement file.
   */
  file?: File | null;
}

/**
 * ============================================================
 * DOCUMENT QUERY
 * ============================================================
 */
export interface DocumentQueryParams {
  page?: number;

  limit?: number;

  search?: string;

  companyId?: string;

  documentType?: DocumentType;

  ownerType?: DocumentOwnerType;

  vehicleId?: string;

  driverId?: string;

  verificationStatus?: DocumentVerificationStatus;

  expiryFrom?: string;

  expiryTo?: string;

  expired?: boolean;

  /**
   * Documents expiring within N days.
   *
   * Example:
   *
   * 30
   */
  expiringWithin?: number;

  sortBy?:
    | "documentType"
    | "documentNumber"
    | "issueDate"
    | "expiryDate"
    | "createdAt";

  sortOrder?: "asc" | "desc";
}

/**
 * ============================================================
 * PAGINATION
 * ============================================================
 */
export interface DocumentPagination {
  page: number;

  limit: number;

  total: number;

  totalPages: number;

  hasNextPage: boolean;

  hasPreviousPage: boolean;
}

/**
 * ============================================================
 * DOCUMENT LIST RESPONSE
 * ============================================================
 */
export interface DocumentListData {
  documents: Document[];

  pagination: DocumentPagination;
}

/**
 * ============================================================
 * API RESPONSE
 * ============================================================
 */
export interface DocumentApiResponse<T> {
  success: boolean;

  message: string;

  data: T;
}

/**
 * ============================================================
 * DOCUMENT LIST API RESPONSE
 * ============================================================
 */
export type DocumentListApiResponse = DocumentApiResponse<DocumentListData>;

/**
 * ============================================================
 * SINGLE DOCUMENT API RESPONSE
 * ============================================================
 */
export type DocumentSingleApiResponse = DocumentApiResponse<Document>;

/**
 * ============================================================
 * DELETE RESPONSE
 * ============================================================
 */
export interface DeleteDocumentResponse {
  documentId: string;
}

export type DeleteDocumentApiResponse =
  DocumentApiResponse<DeleteDocumentResponse>;

/**
 * ============================================================
 * DOCUMENT FORM ERRORS
 * ============================================================
 */
export interface DocumentFormErrors {
  companyId?: string;

  documentType?: string;

  ownerType?: string;

  vehicleId?: string;

  driverId?: string;

  documentNumber?: string;

  issueDate?: string;

  expiryDate?: string;

  issuingAuthority?: string;

  notes?: string;

  file?: string;

  general?: string;
}

/**
 * ============================================================
 * DOCUMENT FILTER STATE
 * ============================================================
 *
 * Used by DocumentListPage / DocumentHeader.
 */
export interface DocumentFilterState {
  search: string;

  documentType: DocumentType | "";

  ownerType: DocumentOwnerType | "";

  companyId: string;

  vehicleId: string;

  driverId: string;

  verificationStatus: DocumentVerificationStatus | "";

  expiryFrom: string;

  expiryTo: string;

  expired: boolean | undefined;

  expiringWithin: number | undefined;

  sortBy:
    | "documentType"
    | "documentNumber"
    | "issueDate"
    | "expiryDate"
    | "createdAt";

  sortOrder: "asc" | "desc";
}

/**
 * ============================================================
 * DOCUMENT EXPIRY SUMMARY
 * ============================================================
 */
export interface DocumentExpirySummary {
  total: number;

  valid: number;

  expiringSoon: number;

  expired: number;
}

/**
 * ============================================================
 * DOCUMENT EXPIRY ITEM
 * ============================================================
 *
 * Used later for:
 *
 * - Dashboard alerts
 * - Expiry notifications
 * - Compliance widgets
 */
export interface DocumentExpiryItem {
  documentId: string;

  documentType: DocumentType;

  documentNumber?: string;

  companyId: string;

  vehicleId?: string;

  driverId?: string;

  expiryDate?: string;

  daysRemaining?: number;

  complianceStatus: "valid" | "expiring_soon" | "expired";
}

/**
 * ============================================================
 * DOCUMENT TYPE LABELS
 * ============================================================
 *
 * Useful for UI.
 */
export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  rc: "RC",

  puc: "PUC",

  fitness: "Fitness",

  insurance: "Insurance",

  permit: "Permit",

  road_tax: "Road Tax",

  driving_license: "Driving License",

  medical_certificate: "Medical Certificate",

  other: "Other",
};

/**
 * ============================================================
 * OWNER TYPE LABELS
 * ============================================================
 */
export const DOCUMENT_OWNER_TYPE_LABELS: Record<DocumentOwnerType, string> = {
  vehicle: "Vehicle",

  driver: "Driver",
};

/**
 * ============================================================
 * VERIFICATION STATUS LABELS
 * ============================================================
 */
export const DOCUMENT_VERIFICATION_STATUS_LABELS: Record<
  DocumentVerificationStatus,
  string
> = {
  uploaded: "Uploaded",

  pending_verification: "Pending Verification",

  verified: "Verified",

  rejected: "Rejected",
};

/**
 * ============================================================
 * COMPLIANCE STATUS LABELS
 * ============================================================
 */
export const COMPLIANCE_STATUS_LABELS: Record<ComplianceStatus, string> = {
  valid: "Valid",

  expiring_soon: "Expiring Soon",

  expired: "Expired",
};

/**
 * ============================================================
 * DEFAULT FORM DATA
 * ============================================================
 */
export const DEFAULT_DOCUMENT_FORM_DATA: CreateDocumentFormData = {
  companyId: "",

  documentType: "puc",

  ownerType: "vehicle",

  vehicleId: "",

  driverId: "",

  documentNumber: "",

  issueDate: "",

  expiryDate: "",

  issuingAuthority: "",

  notes: "",

  file: null,
};

/**
 * ============================================================
 * DEFAULT FILTER STATE
 * ============================================================
 */
export const DEFAULT_DOCUMENT_FILTERS: DocumentFilterState = {
  search: "",

  documentType: "",

  ownerType: "",

  companyId: "",

  vehicleId: "",

  driverId: "",

  verificationStatus: "",

  expiryFrom: "",

  expiryTo: "",

  expired: undefined,

  expiringWithin: undefined,

  sortBy: "expiryDate",

  sortOrder: "asc",
};
