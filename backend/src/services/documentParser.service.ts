/**
 * ============================================================
 * DOCUMENT PARSER SERVICE
 * ============================================================
 *
 * Phase 7 — OCR & Automatic Document Data Extraction
 *
 * Responsibility:
 *
 * 1. Receive raw OCR text
 * 2. Determine document type
 * 3. Parse document-specific fields
 * 4. Validate extracted dates
 * 5. Sanitize extracted field values
 * 6. Calculate final confidence
 * 7. Decide whether manual review is required
 *
 * Flow:
 *
 * OCR Service
 *      ↓
 * Raw OCR Text
 *      ↓
 * Document Parser Service
 *      ↓
 * documentParser.util.ts
 *      ↓
 * Structured Document Data
 *      ↓
 * Sanitization
 *      ↓
 * Validation
 *      ↓
 * Final Parser Result
 */

import { DocumentType, DocumentOwnerType } from "../models/Document.model";

import type {
  OCRDocumentData,
  OCRExtractionResult,
  OCRParserResult,
  OCRReviewStatus,
} from "../types/ocr.types";

import {
  detectAndParseDocument,
  parseDocumentText,
  validateExtractedExpiryDate,
} from "../utils/ocr/documentParser.util";

/**
 * ============================================================
 * TYPES
 * ============================================================
 */

/**
 * Input required by parser service.
 */
export interface DocumentParserInput {
  /**
   * Raw OCR text returned by OCR engine.
   */
  extractedText: string;

  /**
   * Document type selected during upload.
   *
   * Example:
   *
   * rc
   * puc
   * insurance
   * fitness
   * permit
   * road_tax
   */
  documentType?: DocumentType;

  /**
   * Document owner.
   *
   * vehicle / driver
   */
  ownerType?: DocumentOwnerType;
}

/**
 * Final parser service result.
 */
export interface DocumentParserServiceResult {
  /**
   * Whether parsing completed successfully.
   */
  success: boolean;

  /**
   * Document type used by parser.
   */
  documentType: DocumentType;

  /**
   * Structured extracted data.
   */
  data: OCRDocumentData;

  /**
   * Field-level extraction results.
   */
  fields: OCRExtractionResult[];

  /**
   * Overall confidence.
   */
  confidence: number;

  /**
   * Manual review status.
   */
  reviewStatus: OCRReviewStatus;

  /**
   * Whether expiry date was extracted.
   */
  expiryDateExtracted: boolean;

  /**
   * Whether expiry date passed validation.
   */
  expiryDateValid: boolean;

  /**
   * Errors/warnings.
   */
  errors: string[];
}

/**
 * ============================================================
 * HELPERS
 * ============================================================
 */

/**
 * Normalize OCR text.
 *
 * IMPORTANT:
 *
 * We intentionally DO NOT destroy single line breaks.
 *
 * Date extractor/parser may need line structure such as:
 *
 * 31-Mar-202
 * 7
 *
 * or:
 *
 * Period
 * 01-Apr-2026 to
 * 31-Mar-2027
 */
const normalizeOCRText = (text: string): string => {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
};

/**
 * ============================================================
 * FIELD VALUE SANITIZATION
 * ============================================================
 */

/**
 * Maximum reasonable lengths for structured fields.
 *
 * These limits prevent a parser mistake from saving a huge
 * OCR paragraph as a field such as policyNumber.
 */
const FIELD_MAX_LENGTHS: Record<string, number> = {
  documentNumber: 120,
  policyNumber: 120,
  registrationNumber: 30,
  vehicleNumber: 30,
  ownerName: 150,
  driverName: 150,
  issuingAuthority: 200,
};

/**
 * Remove repeated whitespace.
 */
const cleanFieldValue = (value: unknown): string | undefined => {
  if (typeof value !== "string") {
    return undefined;
  }

  const cleaned = value
    .replace(/\r/g, " ")
    .replace(/\n/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!cleaned) {
    return undefined;
  }

  return cleaned;
};

/**
 * ============================================================
 * DOCUMENT NUMBER VALIDATION
 * ============================================================
 *
 * Prevent cases such as:
 *
 * TR CODE END/REN/DEC/CIM END/REN/DEC/CIM
 * A/C PARTICULARS...
 *
 * from becoming the actual document number.
 *
 * A valid document/policy number normally should not look
 * like an entire OCR sentence.
 */
const isReasonableDocumentNumber = (value: string): boolean => {
  const cleaned = cleanFieldValue(value);

  if (!cleaned) {
    return false;
  }

  const maxLength = FIELD_MAX_LENGTHS.documentNumber;

  if (cleaned.length > maxLength) {
    return false;
  }

  /**
   * Reject values containing obvious OCR/table text.
   */
  const suspiciousTerms = [
    "A/C PARTICULARS",
    "A/C HEAD",
    "CREDIT AMOUNT",
    "DEBIT AMOUNT",
    "TOTAL AMOUNT",
    "PARTICULARS",
    "BANK REFERENCE",
    "TRANSACTION IDENTIFICATION",
    "APPLICATION NO",
    "RECEIPT NO",
    "PAYMENT DATE",
    "TRANSACTION DATE",
    "ADDRESS",
    "AGENT CODE",
  ];

  const upper = cleaned.toUpperCase();

  if (suspiciousTerms.some((term) => upper.includes(term))) {
    return false;
  }

  return true;
};

/**
 * ============================================================
 * FIELD LOOKUP
 * ============================================================
 */
const getSuccessfulField = (
  fields: OCRExtractionResult[],
  fieldName: string,
): OCRExtractionResult | undefined => {
  return fields.find(
    (field) =>
      field.field === fieldName &&
      field.success &&
      typeof field.rawValue === "string" &&
      field.rawValue.trim().length > 0,
  );
};

/**
 * ============================================================
 * CLEAN FIELD RESULT
 * ============================================================
 */
const sanitizeExtractionFields = (
  fields: OCRExtractionResult[],
): OCRExtractionResult[] => {
  return fields.map((field) => {
    const cleaned = cleanFieldValue(field.rawValue);

    if (!cleaned) {
      return field;
    }

    const maxLength = FIELD_MAX_LENGTHS[field.field];

    /**
     * If field is too long, mark it for review.
     */
    if (maxLength && cleaned.length > maxLength) {
      return {
        ...field,

        rawValue: cleaned.slice(0, maxLength),

        normalizedValue: field.normalizedValue,

        confidence: Math.min(field.confidence, 50),

        needsReview: true,

        error: "Extracted value was unusually long and requires manual review.",
      };
    }

    return {
      ...field,

      rawValue: cleaned,

      normalizedValue: field.normalizedValue
        ? cleanFieldValue(field.normalizedValue)
        : field.normalizedValue,
    };
  });
};

/**
 * ============================================================
 * SANITIZE DOCUMENT DATA
 * ============================================================
 *
 * IMPORTANT:
 *
 * Field-level extraction is considered more trustworthy than
 * the aggregated data object when both exist.
 *
 * Example:
 *
 * field:
 *   rawValue = END/REN/DEC/CIM
 *
 * data:
 *   TR CODE END/REN/DEC/CIM A/C PARTICULARS...
 *
 * We use the field-level value.
 */
const sanitizeDocumentData = (
  data: OCRDocumentData,
  fields: OCRExtractionResult[],
): OCRDocumentData => {
  const sanitized: OCRDocumentData = {
    ...data,
  };

  /**
   * --------------------------------------------------------
   * DOCUMENT NUMBER
   * --------------------------------------------------------
   */
  const documentNumberField = getSuccessfulField(fields, "documentNumber");

  if (documentNumberField) {
    const value = cleanFieldValue(documentNumberField.rawValue);

    if (value && isReasonableDocumentNumber(value)) {
      sanitized.documentNumber = value;
    }
  } else if (sanitized.documentNumber) {
    const value = cleanFieldValue(sanitized.documentNumber);

    if (value && isReasonableDocumentNumber(value)) {
      sanitized.documentNumber = value;
    } else {
      sanitized.documentNumber = undefined;
    }
  }

  /**
   * --------------------------------------------------------
   * POLICY NUMBER
   * --------------------------------------------------------
   */
  const policyNumberField = getSuccessfulField(fields, "policyNumber");

  if (policyNumberField) {
    const value = cleanFieldValue(policyNumberField.rawValue);

    if (
      value &&
      value.length <= FIELD_MAX_LENGTHS.policyNumber &&
      !containsSuspiciousPolicyText(value)
    ) {
      sanitized.policyNumber = value;
    }
  } else if (sanitized.policyNumber) {
    const value = cleanFieldValue(sanitized.policyNumber);

    if (
      value &&
      value.length <= FIELD_MAX_LENGTHS.policyNumber &&
      !containsSuspiciousPolicyText(value)
    ) {
      sanitized.policyNumber = value;
    } else {
      sanitized.policyNumber = undefined;
    }
  }

  /**
   * --------------------------------------------------------
   * REGISTRATION NUMBER
   * --------------------------------------------------------
   */
  const registrationField = getSuccessfulField(fields, "registrationNumber");

  if (registrationField) {
    const value = cleanFieldValue(registrationField.rawValue);

    if (value && value.length <= FIELD_MAX_LENGTHS.registrationNumber) {
      sanitized.registrationNumber = normalizeRegistrationNumber(value);
    }
  }

  /**
   * --------------------------------------------------------
   * VEHICLE NUMBER
   * --------------------------------------------------------
   */
  const vehicleField = getSuccessfulField(fields, "vehicleNumber");

  if (vehicleField) {
    const value = cleanFieldValue(vehicleField.rawValue);

    if (value && value.length <= FIELD_MAX_LENGTHS.vehicleNumber) {
      sanitized.vehicleNumber = normalizeRegistrationNumber(value);
    }
  }

  /**
   * --------------------------------------------------------
   * OWNER NAME
   * --------------------------------------------------------
   */
  const ownerField = getSuccessfulField(fields, "ownerName");

  if (ownerField) {
    const value = cleanFieldValue(ownerField.rawValue);

    if (value && value.length <= FIELD_MAX_LENGTHS.ownerName) {
      sanitized.ownerName = value;
    }
  }

  /**
   * --------------------------------------------------------
   * DRIVER NAME
   * --------------------------------------------------------
   *
   * Only trust driverName when the parser explicitly
   * extracted a reasonable value.
   *
   * Do not blindly convert:
   *
   * NAME: MS CHANDRA ENTERPRISES
   *
   * into a driver.
   */
  const driverField = getSuccessfulField(fields, "driverName");

  if (driverField) {
    const value = cleanFieldValue(driverField.rawValue);

    if (
      value &&
      value.length <= FIELD_MAX_LENGTHS.driverName &&
      !looksLikeCompanyName(value)
    ) {
      sanitized.driverName = value;
    } else {
      sanitized.driverName = undefined;
    }
  }

  /**
   * --------------------------------------------------------
   * ISSUING AUTHORITY
   * --------------------------------------------------------
   */
  const authorityField = getSuccessfulField(fields, "issuingAuthority");

  if (authorityField) {
    const value = cleanFieldValue(authorityField.rawValue);

    if (value && value.length <= FIELD_MAX_LENGTHS.issuingAuthority) {
      sanitized.issuingAuthority = value;
    }
  }

  return sanitized;
};

/**
 * ============================================================
 * SUSPICIOUS POLICY TEXT
 * ============================================================
 */
const containsSuspiciousPolicyText = (value: string): boolean => {
  const upper = value.toUpperCase();

  const suspiciousTerms = [
    "A/C PARTICULARS",
    "A/C HEAD",
    "CREDIT AMOUNT",
    "DEBIT AMOUNT",
    "TOTAL AMOUNT",
    "PARTICULARS",
    "TR CODE",
    "ADDRESS",
    "AGENT CODE",
    "BANK REFERENCE",
    "TRANSACTION IDENTIFICATION",
  ];

  return suspiciousTerms.some((term) => upper.includes(term));
};

/**
 * ============================================================
 * REGISTRATION NUMBER NORMALIZATION
 * ============================================================
 */
const normalizeRegistrationNumber = (value: string): string => {
  return value
    .toUpperCase()
    .replace(/\s+/g, "")
    .replace(/[^A-Z0-9-]/g, "");
};

/**
 * ============================================================
 * COMPANY NAME DETECTION
 * ============================================================
 */
const looksLikeCompanyName = (value: string): boolean => {
  const upper = value.toUpperCase();

  const companyTerms = [
    "ENTERPRISE",
    "ENTERPRISES",
    "PVT",
    "PRIVATE",
    "LIMITED",
    "LTD",
    "LLP",
    "COMPANY",
    "CHANDRA ENTERPRISES",
  ];

  return companyTerms.some((term) => upper.includes(term));
};

/**
 * ============================================================
 * REVIEW STATUS
 * ============================================================
 */
const calculateReviewStatus = (
  confidence: number,
  expiryDateExtracted: boolean,
  expiryDateValid: boolean,
  expiryNeedsReview: boolean,
): OCRReviewStatus => {
  /**
   * Expiry is mandatory for automatic compliance.
   */
  if (!expiryDateExtracted || !expiryDateValid) {
    return "manual_required";
  }

  /**
   * Parser explicitly marked expiry uncertain.
   */
  if (expiryNeedsReview) {
    return "needs_review";
  }

  /**
   * High confidence.
   */
  if (confidence >= 90) {
    return "auto_accepted";
  }

  /**
   * Medium confidence.
   */
  if (confidence >= 70) {
    return "needs_review";
  }

  return "manual_required";
};

/**
 * ============================================================
 * CALCULATE CONFIDENCE
 * ============================================================
 */
const calculateServiceConfidence = (result: OCRParserResult): number => {
  const successfulFields = result.fields.filter((field) => field.success);

  if (successfulFields.length === 0) {
    return 0;
  }

  const total = successfulFields.reduce(
    (sum, field) => sum + field.confidence,
    0,
  );

  const average = total / successfulFields.length;

  /**
   * Expiry gets additional weight.
   */
  const expiryField = result.fields.find(
    (field) => field.field === "expiryDate",
  );

  if (expiryField?.success) {
    const weighted = average * 0.6 + expiryField.confidence * 0.4;

    return Math.round(Math.min(100, weighted));
  }

  return Math.round(Math.min(100, average));
};

/**
 * ============================================================
 * GET EXPIRY FIELD
 * ============================================================
 */
const getExpiryField = (fields: OCRExtractionResult[]) => {
  return fields.find((field) => field.field === "expiryDate");
};

/**
 * ============================================================
 * PARSE WITH PROVIDED TYPE
 * ============================================================
 */
const parseWithDocumentType = (
  documentType: DocumentType,
  extractedText: string,
): OCRParserResult => {
  return parseDocumentText(documentType, extractedText);
};

/**
 * ============================================================
 * PARSE DOCUMENT
 * ============================================================
 */
export const parseDocument = async (
  input: DocumentParserInput,
): Promise<DocumentParserServiceResult> => {
  const errors: string[] = [];

  /**
   * ======================================================
   * VALIDATE INPUT
   * ======================================================
   */
  if (!input.extractedText || !input.extractedText.trim()) {
    return {
      success: false,

      documentType: input.documentType ?? DocumentType.OTHER,

      data: {},

      fields: [],

      confidence: 0,

      reviewStatus: "manual_required",

      expiryDateExtracted: false,

      expiryDateValid: false,

      errors: ["OCR text is empty."],
    };
  }

  /**
   * ======================================================
   * NORMALIZE OCR TEXT
   * ======================================================
   */
  const extractedText = normalizeOCRText(input.extractedText);

  /**
   * ======================================================
   * DOCUMENT TYPE
   * ======================================================
   *
   * Prefer user-selected type.
   */
  let documentType: DocumentType;

  let parserResult: OCRParserResult;

  if (input.documentType) {
    documentType = input.documentType;

    parserResult = parseWithDocumentType(documentType, extractedText);
  } else {
    /**
     * Automatic detection.
     */
    const detected = detectAndParseDocument(extractedText);

    documentType = detected.documentType;

    parserResult = detected.result;

    errors.push("Document type was automatically detected from OCR text.");
  }

  /**
   * ======================================================
   * SANITIZE FIELDS
   * ======================================================
   */
  const sanitizedFields = sanitizeExtractionFields(parserResult.fields);

  /**
   * ======================================================
   * SANITIZE DATA
   * ======================================================
   *
   * Field-level values are preferred over aggregated
   * parser data.
   */
  const sanitizedData = sanitizeDocumentData(
    parserResult.data,
    sanitizedFields,
  );

  /**
   * ======================================================
   * PARSER ERRORS
   * ======================================================
   */
  if (parserResult.errors?.length) {
    errors.push(...parserResult.errors);
  }

  /**
   * ======================================================
   * EXPIRY FIELD
   * ======================================================
   */
  const expiryField = getExpiryField(sanitizedFields);

  const expiryDate = sanitizedData.expiryDate;

  /**
   * ======================================================
   * EXPIRY DATE VALIDATION
   * ======================================================
   */
  const dateValidation = validateExtractedExpiryDate(
    expiryDate,
    sanitizedData.issueDate,
  );

  if (!dateValidation.valid && dateValidation.reason) {
    errors.push(dateValidation.reason);
  }

  /**
   * ======================================================
   * EXPIRY EXTRACTION
   * ======================================================
   */
  const expiryDateExtracted = Boolean(expiryDate);

  const expiryDateValid = dateValidation.valid;

  /**
   * ======================================================
   * CONFIDENCE
   * ======================================================
   */
  const confidence = calculateServiceConfidence({
    ...parserResult,

    data: sanitizedData,

    fields: sanitizedFields,
  });

  /**
   * ======================================================
   * REVIEW STATUS
   * ======================================================
   */
  const reviewStatus = calculateReviewStatus(
    confidence,

    expiryDateExtracted,

    expiryDateValid,

    Boolean(expiryField?.needsReview),
  );

  /**
   * ======================================================
   * REQUIRED FIELD CHECKS
   * ======================================================
   *
   * Registration number is important for vehicle
   * documents.
   *
   * We don't reject the document here because some
   * documents can still be valid without OCR detecting
   * the registration number.
   *
   * Instead, manual review is requested.
   */
  if (
    input.ownerType === DocumentOwnerType.VEHICLE &&
    !sanitizedData.registrationNumber
  ) {
    errors.push("Vehicle registration number could not be extracted.");
  }

  /**
   * ======================================================
   * FINAL SUCCESS
   * ======================================================
   */
  const success =
    parserResult.success && expiryDateExtracted && expiryDateValid;

  /**
   * If parser itself failed.
   */
  if (!parserResult.success && errors.length === 0) {
    errors.push("Unable to extract useful information from document.");
  }

  /**
   * Remove duplicate errors.
   */
  const uniqueErrors = Array.from(new Set(errors));

  return {
    success,

    documentType,

    data: sanitizedData,

    fields: sanitizedFields,

    confidence,

    reviewStatus,

    expiryDateExtracted,

    expiryDateValid,

    errors: uniqueErrors,
  };
};

/**
 * ============================================================
 * PARSE DOCUMENT WITH REQUIRED TYPE
 * ============================================================
 */
export const parseDocumentByType = async (
  documentType: DocumentType,
  extractedText: string,
  ownerType?: DocumentOwnerType,
): Promise<DocumentParserServiceResult> => {
  return parseDocument({
    documentType,

    extractedText,

    ownerType,
  });
};

/**
 * ============================================================
 * PARSE DOCUMENT AUTOMATICALLY
 * ============================================================
 */
export const parseDocumentAutomatically = async (
  extractedText: string,
): Promise<DocumentParserServiceResult> => {
  return parseDocument({
    extractedText,
  });
};

/**
 * ============================================================
 * GET EXTRACTED EXPIRY DATE
 * ============================================================
 */
export const getExtractedExpiryDate = async (
  documentType: DocumentType,
  extractedText: string,
): Promise<Date | null> => {
  const result = await parseDocumentByType(documentType, extractedText);

  if (!result.expiryDateValid) {
    return null;
  }

  return result.data.expiryDate ?? null;
};

/**
 * ============================================================
 * GET EXTRACTED DOCUMENT DATA
 * ============================================================
 */
export const getExtractedDocumentData = async (
  documentType: DocumentType,
  extractedText: string,
): Promise<OCRDocumentData> => {
  const result = await parseDocumentByType(documentType, extractedText);

  return result.data;
};

/**
 * ============================================================
 * SHOULD AUTO UPDATE DOCUMENT
 * ============================================================
 */
export const shouldAutoUpdateDocument = (
  result: DocumentParserServiceResult,
): boolean => {
  /**
   * No valid expiry.
   */
  if (!result.expiryDateExtracted || !result.expiryDateValid) {
    return false;
  }

  /**
   * Manual review required.
   */
  if (result.reviewStatus === "manual_required") {
    return false;
  }

  /**
   * Auto accepted.
   */
  if (result.reviewStatus === "auto_accepted") {
    return true;
  }

  /**
   * needs_review is never automatically applied.
   */
  return false;
};

/**
 * ============================================================
 * GET DATABASE UPDATE DATA
 * ============================================================
 *
 * This method does NOT save anything to MongoDB.
 */
export const getDocumentUpdateData = (
  result: DocumentParserServiceResult,
): Partial<{
  documentNumber: string;

  issueDate: Date;

  expiryDate: Date;

  issuingAuthority: string;

  extractedText: string;

  isOcrProcessed: boolean;
}> => {
  const updateData: Partial<{
    documentNumber: string;

    issueDate: Date;

    expiryDate: Date;

    issuingAuthority: string;

    extractedText: string;

    isOcrProcessed: boolean;
  }> = {
    isOcrProcessed: true,
  };

  /**
   * --------------------------------------------------------
   * DOCUMENT NUMBER
   * --------------------------------------------------------
   */
  if (
    result.data.documentNumber &&
    isReasonableDocumentNumber(result.data.documentNumber)
  ) {
    updateData.documentNumber = result.data.documentNumber;
  }

  /**
   * --------------------------------------------------------
   * ISSUE DATE
   * --------------------------------------------------------
   */
  if (result.data.issueDate) {
    updateData.issueDate = result.data.issueDate;
  }

  /**
   * --------------------------------------------------------
   * EXPIRY DATE
   * --------------------------------------------------------
   *
   * Only use validated expiry.
   */
  if (result.expiryDateValid && result.data.expiryDate) {
    updateData.expiryDate = result.data.expiryDate;
  }

  /**
   * --------------------------------------------------------
   * ISSUING AUTHORITY
   * --------------------------------------------------------
   */
  if (result.data.issuingAuthority) {
    updateData.issuingAuthority = result.data.issuingAuthority;
  }

  return updateData;
};

/**
 * ============================================================
 * DEFAULT EXPORT
 * ============================================================
 */
export default {
  parseDocument,

  parseDocumentByType,

  parseDocumentAutomatically,

  getExtractedExpiryDate,

  getExtractedDocumentData,

  shouldAutoUpdateDocument,

  getDocumentUpdateData,
};
