/**
 * ============================================================
 * OCR TYPES
 * ============================================================
 *
 * Phase 7 — OCR & Automatic Document Data Extraction
 *
 * This file contains all TypeScript types/interfaces used
 * by the OCR module.
 *
 * Responsibilities:
 *
 * OCR Engine
 *     ↓
 * Raw OCR Result
 *     ↓
 * Parsed OCR Data
 *     ↓
 * Validation / Review
 *     ↓
 * Document Model
 */

/**
 * ============================================================
 * OCR PROVIDER
 * ============================================================
 *
 * Keep this type independent from the OCR service so other
 * modules can use it without importing implementation code.
 */
export type OCRProvider =
  | "tesseract"
  | "google_vision"
  | "aws_textract"
  | "azure_document_intelligence";

/**
 * ============================================================
 * OCR STATUS
 * ============================================================
 */
export type OCRStatus = "success" | "failed" | "skipped";

/**
 * ============================================================
 * OCR REVIEW STATUS
 * ============================================================
 *
 * Automatic extraction should not always be trusted blindly.
 *
 * high confidence:
 *     automatically usable
 *
 * medium confidence:
 *     should be reviewed
 *
 * low confidence:
 *     manual verification required
 */
export type OCRReviewStatus =
  | "auto_accepted"
  | "needs_review"
  | "manual_required";

/**
 * ============================================================
 * OCR FIELD NAME
 * ============================================================
 *
 * These are the fields that our VCMS system can extract
 * automatically from vehicle/driver documents.
 */
export type OCRFieldName =
  | "documentNumber"
  | "registrationNumber"
  | "issueDate"
  | "expiryDate"
  | "ownerName"
  | "vehicleNumber"
  | "driverName"
  | "licenseNumber"
  | "policyNumber"
  | "permitNumber"
  | "certificateNumber"
  | "issuingAuthority";

/**
 * ============================================================
 * OCR FIELD VALUE
 * ============================================================
 */
export interface OCRFieldValue {
  /**
   * Field name.
   */
  field: OCRFieldName;

  /**
   * Raw value exactly/approximately as detected by OCR.
   *
   * Example:
   *
   * "VALID UPTO: 28/08/2026"
   */
  rawValue: string;

  /**
   * Cleaned/normalized value.
   *
   * Example:
   *
   * "28/08/2026"
   */
  normalizedValue?: string;

  /**
   * Confidence for this individual field.
   *
   * Range:
   *
   * 0 - 100
   */
  confidence?: number;

  /**
   * Whether this field passed validation.
   */
  isValid?: boolean;

  /**
   * Whether user should review this field.
   */
  needsReview?: boolean;

  /**
   * Optional extraction source.
   *
   * Example:
   *
   * "VALID UPTO"
   * "EXPIRY DATE"
   * "VALID TILL"
   */
  matchedLabel?: string;

  /**
   * Optional source text around the match.
   *
   * Useful for debugging extraction.
   */
  sourceText?: string;
}

/**
 * ============================================================
 * OCR DATE RESULT
 * ============================================================
 */
export interface OCRDateResult {
  /**
   * Raw date detected from document.
   *
   * Example:
   *
   * "28/08/2026"
   */
  rawValue: string;

  /**
   * Normalized ISO date.
   *
   * Example:
   *
   * "2026-08-28"
   */
  normalizedValue?: string;

  /**
   * JavaScript Date.
   *
   * This is optional because parsing may fail.
   */
  date?: Date;

  /**
   * Confidence.
   */
  confidence?: number;

  /**
   * Label that led to this date.
   *
   * Example:
   *
   * "VALID UPTO"
   * "EXPIRY DATE"
   */
  matchedLabel?: string;

  /**
   * Whether this date requires user review.
   */
  needsReview?: boolean;
}

/**
 * ============================================================
 * OCR DOCUMENT DATA
 * ============================================================
 *
 * This is the important structured output of OCR.
 *
 * Raw OCR text is NOT enough.
 *
 * This object contains the useful business fields that
 * our VCMS application needs.
 */
export interface OCRDocumentData {
  /**
   * Document number.
   */
  documentNumber?: string;

  /**
   * Vehicle registration number.
   *
   * Example:
   *
   * UP16AB1234
   */
  registrationNumber?: string;

  /**
   * Vehicle number.
   */
  vehicleNumber?: string;

  /**
   * Driver name.
   */
  driverName?: string;

  /**
   * Owner name.
   */
  ownerName?: string;

  /**
   * Driving license number.
   */
  licenseNumber?: string;

  /**
   * Insurance policy number.
   */
  policyNumber?: string;

  /**
   * Permit number.
   */
  permitNumber?: string;

  /**
   * Certificate number.
   */
  certificateNumber?: string;

  /**
   * Issue date.
   */
  issueDate?: Date;

  /**
   * Expiry date.
   *
   * This is the most important field for the
   * VCMS compliance system.
   */
  expiryDate?: Date;

  /**
   * Issuing authority.
   */
  issuingAuthority?: string;
}

/**
 * ============================================================
 * OCR EXTRACTION RESULT
 * ============================================================
 *
 * Represents one extracted field.
 */
export interface OCRExtractionResult {
  /**
   * Extracted field.
   */
  field: OCRFieldName;

  /**
   * Raw OCR value.
   */
  rawValue: string;

  /**
   * Normalized value.
   */
  normalizedValue?: string;

  /**
   * Confidence from 0 to 100.
   */
  confidence: number;

  /**
   * Whether extraction succeeded.
   */
  success: boolean;

  /**
   * Whether human review is required.
   */
  needsReview: boolean;

  /**
   * Matched keyword/label.
   */
  matchedLabel?: string;

  /**
   * Original source text.
   */
  sourceText?: string;

  /**
   * Error when extraction failed.
   */
  error?: string;
}

/**
 * ============================================================
 * OCR ENGINE RESULT
 * ============================================================
 *
 * This represents the direct output from the OCR engine.
 *
 * Example:
 *
 * Image
 *   ↓
 * Tesseract
 *   ↓
 * OCRRawResult
 */
export interface OCRRawResult {
  /**
   * OCR status.
   */
  success: boolean;

  /**
   * Processing status.
   */
  status: OCRStatus;

  /**
   * Raw extracted text.
   */
  text: string;

  /**
   * OCR provider.
   */
  provider: OCRProvider;

  /**
   * Languages used.
   */
  languages: string[];

  /**
   * Overall OCR confidence.
   */
  confidence?: number;

  /**
   * Processing time.
   */
  processingTimeMs: number;

  /**
   * Optional page count.
   *
   * Useful for PDF OCR.
   */
  pageCount?: number;

  /**
   * Optional error.
   */
  error?: string;
}

/**
 * ============================================================
 * OCR PARSER RESULT
 * ============================================================
 *
 * Raw OCR text is converted into structured document data.
 */
export interface OCRParserResult {
  /**
   * Whether parsing succeeded.
   */
  success: boolean;

  /**
   * Parsed document data.
   */
  data: OCRDocumentData;

  /**
   * Individual extraction results.
   */
  fields: OCRExtractionResult[];

  /**
   * Overall parser confidence.
   */
  confidence: number;

  /**
   * Review status.
   */
  reviewStatus: OCRReviewStatus;

  /**
   * Parser errors.
   */
  errors?: string[];
}

/**
 * ============================================================
 * COMPLETE OCR RESULT
 * ============================================================
 *
 * This combines:
 *
 * 1. OCR engine result
 * 2. Parsed structured data
 * 3. Field-level extraction
 * 4. Review information
 */
export interface OCRResult {
  /**
   * OCR processing success.
   */
  success: boolean;

  /**
   * OCR processing status.
   */
  status: OCRStatus;

  /**
   * Provider.
   */
  provider: OCRProvider;

  /**
   * Languages.
   */
  languages: string[];

  /**
   * Raw extracted text.
   */
  extractedText: string;

  /**
   * Structured document data.
   */
  data: OCRDocumentData;

  /**
   * Individual fields.
   */
  fields: OCRExtractionResult[];

  /**
   * Overall confidence.
   */
  confidence: number;

  /**
   * Review status.
   */
  reviewStatus: OCRReviewStatus;

  /**
   * Processing duration.
   */
  processingTimeMs: number;

  /**
   * Optional page count.
   */
  pageCount?: number;

  /**
   * Errors.
   */
  errors?: string[];
}

/**
 * ============================================================
 * OCR PROCESS INPUT
 * ============================================================
 */
export interface OCRProcessInput {
  /**
   * File buffer.
   */
  buffer: Buffer;

  /**
   * MIME type.
   */
  mimeType: string;

  /**
   * Original filename.
   */
  originalFileName?: string;

  /**
   * Document type.
   *
   * This allows document-specific parsing.
   *
   * Example:
   *
   * puc
   * insurance
   * fitness
   */
  documentType?: string;

  /**
   * Expected owner type.
   *
   * vehicle / driver
   */
  ownerType?: string;
}

/**
 * ============================================================
 * OCR CONFIGURATION TYPE
 * ============================================================
 */
export interface OCRRuntimeConfig {
  /**
   * Provider.
   */
  provider: OCRProvider;

  /**
   * Enabled.
   */
  enabled: boolean;

  /**
   * Languages.
   */
  languages: string[];

  /**
   * Maximum file size.
   */
  maxFileSize: number;

  /**
   * Timeout.
   */
  timeout: number;

  /**
   * Automatically process after upload.
   */
  processAfterUpload: boolean;
}

/**
 * ============================================================
 * OCR CONFIDENCE THRESHOLDS
 * ============================================================
 *
 * These thresholds determine whether extracted data can be
 * automatically accepted or should be reviewed.
 */
export const OCR_CONFIDENCE_THRESHOLDS = {
  /**
   * >= 90:
   *
   * High confidence.
   */
  AUTO_ACCEPT: 90,

  /**
   * >= 70:
   *
   * Medium confidence.
   */
  NEEDS_REVIEW: 70,

  /**
   * < 70:
   *
   * Low confidence.
   */
  MANUAL_REQUIRED: 70,
} as const;

/**
 * ============================================================
 * GET REVIEW STATUS
 * ============================================================
 */
export const getOCRReviewStatus = (confidence: number): OCRReviewStatus => {
  /**
   * High confidence.
   */
  if (confidence >= OCR_CONFIDENCE_THRESHOLDS.AUTO_ACCEPT) {
    return "auto_accepted";
  }

  /**
   * Medium confidence.
   */
  if (confidence >= OCR_CONFIDENCE_THRESHOLDS.NEEDS_REVIEW) {
    return "needs_review";
  }

  /**
   * Low confidence.
   */
  return "manual_required";
};

/**
 * ============================================================
 * NORMALIZE OCR TEXT
 * ============================================================
 *
 * Useful before parsing.
 */
export const normalizeOCRText = (text: string): string => {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
};

/**
 * ============================================================
 * CHECK OCR DATE
 * ============================================================
 */
export const isValidOCRDate = (date?: Date): boolean => {
  if (!date) {
    return false;
  }

  return !Number.isNaN(date.getTime());
};

/**
 * ============================================================
 * CHECK OCR CONFIDENCE
 * ============================================================
 */
export const isValidOCRConfidence = (confidence: number): boolean => {
  return Number.isFinite(confidence) && confidence >= 0 && confidence <= 100;
};
