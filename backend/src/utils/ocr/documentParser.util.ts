// import { DocumentType } from "../../models/Document.model";

// import type {
//   OCRDocumentData,
//   OCRExtractionResult,
//   OCRParserResult,
// } from "../../types/ocr.types";

// import {
//   extractDocumentDates,
//   extractExpiryDate,
//   extractIssueDate,
//   extractInsurancePolicyDates,
//   extractRoadTaxPeriod,
// } from "./dateExtractor.util";

// /**
//  * ============================================================
//  * DOCUMENT PARSER UTILITY
//  * ============================================================
//  *
//  * Responsibility:
//  *
//  * OCR TEXT
//  *    ↓
//  * Detect / parse document type
//  *    ↓
//  * Extract:
//  *    - registration number
//  *    - policy/document number
//  *    - owner / driver
//  *    - issue date
//  *    - expiry date
//  *    - issuing authority
//  *    ↓
//  * Return OCRParserResult
//  *
//  * IMPORTANT:
//  *
//  * This utility does NOT save anything to MongoDB.
//  */

// /**
//  * ============================================================
//  * TYPES
//  * ============================================================
//  */

// interface ParsedField {
//   value?: string;
//   confidence: number;
//   matchedLabel?: string;
//   sourceText?: string;
// }

// /**
//  * ============================================================
//  * REGEX
//  * ============================================================
//  */

// /**
//  * Indian vehicle registration number.
//  *
//  * Examples:
//  *
//  * UP14AB1234
//  * UP-14-AB-1234
//  * DL01CA1234
//  * MH 12 AB 1234
//  */
// const REGISTRATION_NUMBER_REGEX =
//   /\b([A-Z]{2})\s*[-/]?\s*(\d{1,2})\s*[-/]?\s*([A-Z]{1,3})\s*[-/]?\s*(\d{1,4})\b/i;

// /**
//  * Road tax period.
//  */
// const ROAD_TAX_PERIOD_REGEX =
//   /\b(\d{1,2}[-/ ](?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*[-/ ]\d{4}|\d{1,2}[-/]\d{1,2}[-/]\d{4}|\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4})\s*(?:TO|TILL|UNTIL|-)\s*(\d{1,2}[-/ ](?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*[-/ ]\d{4}|\d{1,2}[-/]\d{1,2}[-/]\d{4}|\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4})\b/i;

// /**
//  * ============================================================
//  * LABELS
//  * ============================================================
//  */

// const DOCUMENT_NUMBER_LABELS = [
//   "DOCUMENT NO",
//   "DOCUMENT NUMBER",
//   "CERTIFICATE NO",
//   "CERTIFICATE NUMBER",
//   "PUC NO",
//   "PUC NUMBER",
//   "PERMIT NO",
//   "PERMIT NUMBER",
//   "LICENSE NO",
//   "LICENSE NUMBER",
//   "LICENCE NO",
//   "LICENCE NUMBER",
// ] as const;

// const REGISTRATION_LABELS = [
//   "REGISTRATION NO",
//   "REGISTRATION NUMBER",
//   "REGN NO",
//   "REGN. NO",
//   "REGD NO",
//   "REGD. NO",
//   "VEHICLE NO",
//   "VEHICLE NUMBER",
//   "VEHICLE REGISTRATION",
//   "REGISTRATION",
// ] as const;

// const OWNER_LABELS = [
//   "OWNER NAME",
//   "REGISTERED OWNER",
//   "NAME OF OWNER",
//   "OWNER",
// ] as const;

// const DRIVER_LABELS = [
//   "DRIVER NAME",
//   "NAME OF DRIVER",
//   "APPLICANT NAME",
// ] as const;

// const LICENSE_LABELS = [
//   "DL NO",
//   "DL NUMBER",
//   "DRIVING LICENSE NO",
//   "DRIVING LICENCE NO",
//   "LICENSE NO",
//   "LICENCE NO",
// ] as const;

// const POLICY_LABELS = ["POLICY NO", "POLICY NUMBER", "POLICY NO."] as const;

// const PERMIT_LABELS = ["PERMIT NO", "PERMIT NUMBER", "PERMIT NO."] as const;

// const CERTIFICATE_LABELS = [
//   "CERTIFICATE NO",
//   "CERTIFICATE NUMBER",
//   "CERTIFICATE NO.",
// ] as const;

// const AUTHORITY_LABELS = [
//   "ISSUING AUTHORITY",
//   "REGISTRATION AUTHORITY",
//   "ISSUED BY",
//   "RTO",
//   "TRANSPORT DEPARTMENT",
// ] as const;

// /**
//  * ============================================================
//  * TEXT NORMALIZATION
//  * ============================================================
//  */

// const normalizeText = (text: string): string => {
//   return text
//     .replace(/\r\n/g, "\n")
//     .replace(/\r/g, "\n")
//     .replace(/[ \t]+/g, " ")
//     .replace(/\n{3,}/g, "\n\n")
//     .trim();
// };

// const normalizeSearchText = (text: string): string => {
//   return normalizeText(text)
//     .toUpperCase()
//     .replace(/[|]/g, " ")
//     .replace(/\s+/g, " ")
//     .trim();
// };

// const escapeRegExp = (value: string): string => {
//   return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
// };

// /**
//  * ============================================================
//  * VALUE CLEANING
//  * ============================================================
//  */

// const cleanExtractedValue = (value: string): string => {
//   return value
//     .replace(/^[\s:;,.-]+/, "")
//     .replace(/[\s;,.-]+$/, "")
//     .replace(/\s{2,}/g, " ")
//     .trim();
// };

// /**
//  * Remove common OCR contamination after a label.
//  */
// const removeSuspiciousTrailingText = (value: string): string => {
//   return value
//     .split(/\bA\/C\s+PARTICULARS\b/i)[0]
//     .split(/\bA\/C\s+HEAD\b/i)[0]
//     .split(/\bCREDIT\s+AMOUNT\b/i)[0]
//     .split(/\bDEBIT\s+AMOUNT\b/i)[0]
//     .split(/\bBANK\s+REFERENCE\s+NUMBER\b/i)[0]
//     .split(/\bTRANSACTION\s+IDENTIFICATION\s+NUMBER\b/i)[0]
//     .split(/\bADDRESS\s*:/i)[0]
//     .split(/\bAGENT\s+CODE\s*:/i)[0]
//     .split(/\bPAYMENT\s+DATE\b/i)[0]
//     .split(/\bTRANSACTION\s+DATE\b/i)[0];

//   return cleanExtractedValue(value);
// };

// /**
//  ============================================================
//  * LABEL VALUE EXTRACTION
//  * ============================================================
//  */

// const findLabelValue = (
//   text: string,
//   labels: readonly string[],
// ): ParsedField | null => {
//   const normalized = normalizeText(text);

//   for (const label of labels) {
//     const regex = new RegExp(
//       `${escapeRegExp(label)}\\s*[:\\-]?\\s*([^\\n]{2,150})`,
//       "i",
//     );

//     const match = normalized.match(regex);

//     if (!match?.[1]) {
//       continue;
//     }

//     let value = cleanExtractedValue(match[1]);

//     value = removeSuspiciousTrailingText(value);

//     if (!value) {
//       continue;
//     }

//     return {
//       value,
//       confidence: 94,
//       matchedLabel: label,
//       sourceText: match[0],
//     };
//   }

//   return null;
// };

// /**
//  * ============================================================
//  * REGISTRATION NUMBER
//  * ============================================================
//  */

// const normalizeRegistrationNumber = (value: string): string => {
//   return value.toUpperCase().replace(/[^A-Z0-9]/g, "");
// };

// export const extractRegistrationNumber = (text: string): ParsedField | null => {
//   /**
//    * First try labelled registration number.
//    */
//   const labeled = findLabelValue(text, REGISTRATION_LABELS);

//   if (labeled?.value) {
//     const match = labeled.value.match(REGISTRATION_NUMBER_REGEX);

//     if (match) {
//       return {
//         value: normalizeRegistrationNumber(match[0]),
//         confidence: labeled.confidence,
//         matchedLabel: labeled.matchedLabel,
//         sourceText: labeled.sourceText,
//       };
//     }
//   }

//   /**
//    * Then search complete OCR text.
//    */
//   const normalized = normalizeSearchText(text);

//   const match = normalized.match(REGISTRATION_NUMBER_REGEX);

//   if (!match) {
//     return null;
//   }

//   return {
//     value: normalizeRegistrationNumber(match[0]),
//     confidence: 72,
//     sourceText: match[0],
//   };
// };

// /**
//  * ============================================================
//  * DOCUMENT NUMBER
//  * ============================================================
//  */

// const isBadDocumentNumber = (value: string): boolean => {
//   const upper = value.toUpperCase().trim();

//   const suspiciousTerms = [
//     "END/REN/DEC/CIM",
//     "A/C PARTICULARS",
//     "CREDIT AMOUNT",
//     "DEBIT AMOUNT",
//     "TOTAL AMOUNT",
//     "PARTICULARS",
//     "BANK REFERENCE",
//     "TRANSACTION IDENTIFICATION",
//     "ADDRESS",
//     "AGENT CODE",
//   ];

//   if (suspiciousTerms.some((term) => upper.includes(term))) {
//     return true;
//   }

//   if (upper === "NUMBER" || upper === "NO" || upper === "NO.") {
//     return true;
//   }

//   return false;
// };

// const extractLongNumber = (value: string): string | undefined => {
//   const matches = value.match(/\b\d{12,25}\b/g);

//   if (!matches?.length) {
//     return undefined;
//   }

//   return matches[0];
// };

// /**
//  * ============================================================
//  * INSURANCE POLICY NUMBER
//  * ============================================================
//  */

// const extractPolicyNumberFromInsurance = (text: string): ParsedField | null => {
//   const normalized = normalizeSearchText(text);

//   const scheduleStart = normalized.indexOf("CERTIFICATE OF INSURANCE");

//   const scheduleText =
//     scheduleStart >= 0
//       ? normalized.slice(scheduleStart, scheduleStart + 3000)
//       : normalized;

//   /**
//    * First try labelled policy number.
//    */
//   const labelled = findLabelValue(scheduleText, POLICY_LABELS);

//   if (labelled?.value) {
//     const longNumber = extractLongNumber(labelled.value);

//     if (longNumber) {
//       return {
//         value: longNumber,
//         confidence: 98,
//         matchedLabel: labelled.matchedLabel,
//         sourceText: labelled.sourceText,
//       };
//     }
//   }

//   /**
//    * Fallback:
//    * Insurance policy numbers are often long numeric strings.
//    */
//   const policyNumberRegex = /\b(\d{16,25})\b/g;

//   const candidates: string[] = [];

//   let match: RegExpExecArray | null;

//   while ((match = policyNumberRegex.exec(scheduleText)) !== null) {
//     const value = match[1];

//     /**
//      * Known non-policy numbers from OCR tables.
//      */
//     const excludedNumbers = ["37010081268000003711", "91098900000001"];

//     if (excludedNumbers.includes(value)) {
//       continue;
//     }

//     if (!candidates.includes(value)) {
//       candidates.push(value);
//     }
//   }

//   if (!candidates.length) {
//     return null;
//   }

//   return {
//     value: candidates[0],
//     confidence: 96,
//     matchedLabel: "POLICY NUMBER",
//     sourceText: candidates[0],
//   };
// };

// export const extractDocumentNumber = (text: string): ParsedField | null => {
//   const labeled = findLabelValue(text, DOCUMENT_NUMBER_LABELS);

//   if (!labeled?.value) {
//     return null;
//   }

//   const useful = extractLongNumber(labeled.value);

//   if (useful) {
//     return {
//       value: useful,
//       confidence: labeled.confidence,
//       matchedLabel: labeled.matchedLabel,
//       sourceText: labeled.sourceText,
//     };
//   }

//   const cleaned = cleanExtractedValue(labeled.value);

//   if (!cleaned || isBadDocumentNumber(cleaned)) {
//     return null;
//   }

//   return {
//     value: cleaned,
//     confidence: 75,
//     matchedLabel: labeled.matchedLabel,
//     sourceText: labeled.sourceText,
//   };
// };

// export const extractPolicyNumber = (text: string): ParsedField | null => {
//   return extractPolicyNumberFromInsurance(text);
// };

// /**
//  * ============================================================
//  * OWNER / DRIVER
//  * ============================================================
//  */

// export const extractOwnerName = (text: string): ParsedField | null => {
//   return findLabelValue(text, OWNER_LABELS);
// };

// const looksLikeCompanyName = (value: string): boolean => {
//   const upper = value.toUpperCase();

//   return [
//     "ENTERPRISE",
//     "ENTERPRISES",
//     "PVT",
//     "PRIVATE",
//     "LIMITED",
//     "LTD",
//     "LLP",
//     "COMPANY",
//   ].some((term) => upper.includes(term));
// };

// export const extractDriverName = (text: string): ParsedField | null => {
//   const parsed = findLabelValue(text, DRIVER_LABELS);

//   if (!parsed?.value || looksLikeCompanyName(parsed.value)) {
//     return null;
//   }

//   return parsed;
// };

// /**
//  * ============================================================
//  * OTHER DOCUMENT NUMBERS
//  * ============================================================
//  */

// export const extractLicenseNumber = (text: string): ParsedField | null => {
//   return findLabelValue(text, LICENSE_LABELS);
// };

// export const extractPermitNumber = (text: string): ParsedField | null => {
//   return findLabelValue(text, PERMIT_LABELS);
// };

// export const extractCertificateNumber = (text: string): ParsedField | null => {
//   const labeled = findLabelValue(text, CERTIFICATE_LABELS);

//   if (!labeled?.value) {
//     return null;
//   }

//   const useful = extractLongNumber(labeled.value);

//   if (useful) {
//     return {
//       ...labeled,
//       value: useful,
//     };
//   }

//   return labeled;
// };

// /**
//  * ============================================================
//  * ISSUING AUTHORITY
//  * ============================================================
//  */

// export const extractIssuingAuthority = (text: string): ParsedField | null => {
//   const authority = findLabelValue(text, AUTHORITY_LABELS);

//   if (!authority?.value) {
//     return null;
//   }

//   let value = authority.value;

//   value = value
//     .split(/PAYMENT\s+DATE/i)[0]
//     .split(/TRANSACTION\s+DATE/i)[0]
//     .split(/VEHICLE\s+(?:NO|NUMBER)/i)[0];

//   value = cleanExtractedValue(value);

//   if (!value) {
//     return null;
//   }

//   return {
//     ...authority,
//     value,
//   };
// };

// /**
//  * ============================================================
//  * EXTRACTION RESULT
//  * ============================================================
//  */

// const createExtractionResult = (
//   field: OCRExtractionResult["field"],
//   parsed: ParsedField | null,
// ): OCRExtractionResult => {
//   if (!parsed?.value) {
//     return {
//       field,
//       rawValue: "",
//       confidence: 0,
//       success: false,
//       needsReview: true,
//       error: `Unable to extract ${field}`,
//     };
//   }

//   return {
//     field,
//     rawValue: parsed.value,
//     normalizedValue: parsed.value,
//     confidence: parsed.confidence,
//     success: true,
//     needsReview: parsed.confidence < 90,
//     matchedLabel: parsed.matchedLabel,
//     sourceText: parsed.sourceText,
//   };
// };

// /**
//  * ============================================================
//  * DATE HELPERS
//  * ============================================================
//  */

// const formatDateForOCR = (date: Date): string => {
//   const day = String(date.getDate()).padStart(2, "0");

//   const month = String(date.getMonth() + 1).padStart(2, "0");

//   return `${day}/${month}/${date.getFullYear()}`;
// };

// const formatDateForISO = (date: Date): string => {
//   const year = date.getFullYear();

//   const month = String(date.getMonth() + 1).padStart(2, "0");

//   const day = String(date.getDate()).padStart(2, "0");

//   return `${year}-${month}-${day}`;
// };

// const createDateExtractionResult = (
//   field: "issueDate" | "expiryDate",
//   parsed: ReturnType<typeof extractIssueDate>,
// ): OCRExtractionResult => {
//   if (!parsed?.date) {
//     return {
//       field,
//       rawValue: "",
//       confidence: 0,
//       success: false,
//       needsReview: true,
//       error: `Unable to extract ${field}`,
//     };
//   }

//   return {
//     field,
//     rawValue: parsed.rawValue,
//     normalizedValue: parsed.normalizedValue,
//     confidence: parsed.confidence ?? 0,
//     success: true,
//     needsReview: parsed.needsReview ?? true,
//     matchedLabel: parsed.matchedLabel,
//   };
// };

// /**
//  * ============================================================
//  * DOCUMENT TYPE DETECTION
//  * ============================================================
//  */

// export const detectDocumentType = (text: string): DocumentType => {
//   const normalized = normalizeSearchText(text);

//   if (
//     normalized.includes("POLLUTION UNDER CONTROL") ||
//     /\bPUC\b/.test(normalized)
//   ) {
//     return DocumentType.PUC;
//   }

//   if (
//     normalized.includes("CERTIFICATE OF INSURANCE") ||
//     normalized.includes("INSURANCE") ||
//     normalized.includes("POLICY SCHEDULE") ||
//     normalized.includes("MOTOR POLICY")
//   ) {
//     return DocumentType.INSURANCE;
//   }

//   if (
//     normalized.includes("FITNESS CERTIFICATE") ||
//     normalized.includes("CERTIFICATE OF FITNESS")
//   ) {
//     return DocumentType.FITNESS;
//   }

//   if (
//     normalized.includes("ROAD TAX") ||
//     normalized.includes("MOTOR VEHICLE TAX")
//   ) {
//     return DocumentType.ROAD_TAX;
//   }

//   if (
//     normalized.includes("DRIVING LICENCE") ||
//     normalized.includes("DRIVING LICENSE") ||
//     normalized.includes("DRIVER LICENCE") ||
//     normalized.includes("DRIVER LICENSE")
//   ) {
//     return DocumentType.DRIVING_LICENSE;
//   }

//   if (normalized.includes("MEDICAL CERTIFICATE")) {
//     return DocumentType.MEDICAL_CERTIFICATE;
//   }

//   if (
//     normalized.includes("PERMIT") &&
//     (normalized.includes("TRANSPORT") || normalized.includes("VEHICLE"))
//   ) {
//     return DocumentType.PERMIT;
//   }

//   if (
//     normalized.includes("REGISTRATION CERTIFICATE") ||
//     normalized.includes("CERTIFICATE OF REGISTRATION") ||
//     /\bRC\b/.test(normalized)
//   ) {
//     return DocumentType.RC;
//   }

//   return DocumentType.OTHER;
// };

// /**
//  * ============================================================
//  * DOCUMENT PARSERS
//  * ============================================================
//  */

// const parsePUC = (text: string): OCRDocumentData => {
//   const registration = extractRegistrationNumber(text);

//   const certificate = extractCertificateNumber(text);

//   const dates = extractDocumentDates(text);

//   const authority = extractIssuingAuthority(text);

//   return {
//     registrationNumber: registration?.value,

//     vehicleNumber: registration?.value,

//     certificateNumber: certificate?.value,

//     documentNumber: certificate?.value,

//     issueDate: dates.issueDate?.date,

//     expiryDate: dates.expiryDate?.date,

//     issuingAuthority: authority?.value,
//   };
// };

// const parseRC = (text: string): OCRDocumentData => {
//   const registration = extractRegistrationNumber(text);

//   const owner = extractOwnerName(text);

//   const dates = extractDocumentDates(text);

//   const authority = extractIssuingAuthority(text);

//   const documentNumber = extractDocumentNumber(text);

//   return {
//     registrationNumber: registration?.value,

//     vehicleNumber: registration?.value,

//     ownerName: owner?.value,

//     documentNumber: documentNumber?.value,

//     issueDate: dates.issueDate?.date,

//     expiryDate: dates.expiryDate?.date,

//     issuingAuthority: authority?.value,
//   };
// };

// const parseFitness = (text: string): OCRDocumentData => {
//   const registration = extractRegistrationNumber(text);

//   const certificate = extractCertificateNumber(text);

//   const dates = extractDocumentDates(text);

//   const authority = extractIssuingAuthority(text);

//   return {
//     registrationNumber: registration?.value,

//     vehicleNumber: registration?.value,

//     certificateNumber: certificate?.value,

//     documentNumber: certificate?.value,

//     issueDate: dates.issueDate?.date,

//     expiryDate: dates.expiryDate?.date,

//     issuingAuthority: authority?.value,
//   };
// };

// const parseInsurance = (text: string): OCRDocumentData => {
//   const registration = extractRegistrationNumber(text);

//   const policy = extractPolicyNumber(text);

//   const dates = extractInsurancePolicyDates(text);

//   const authority = extractIssuingAuthority(text);

//   return {
//     registrationNumber: registration?.value,

//     vehicleNumber: registration?.value,

//     policyNumber: policy?.value,

//     documentNumber: policy?.value,

//     issueDate: dates.issueDate,

//     expiryDate: dates.expiryDate,

//     issuingAuthority: authority?.value,
//   };
// };

// const parsePermit = (text: string): OCRDocumentData => {
//   const registration = extractRegistrationNumber(text);

//   const permit = extractPermitNumber(text);

//   const dates = extractDocumentDates(text);

//   const authority = extractIssuingAuthority(text);

//   return {
//     registrationNumber: registration?.value,

//     vehicleNumber: registration?.value,

//     permitNumber: permit?.value,

//     documentNumber: permit?.value,

//     issueDate: dates.issueDate?.date,

//     expiryDate: dates.expiryDate?.date,

//     issuingAuthority: authority?.value,
//   };
// };

// const parseRoadTax = (text: string): OCRDocumentData => {
//   const registration = extractRegistrationNumber(text);

//   const documentNumber = extractDocumentNumber(text);

//   const authority = extractIssuingAuthority(text);

//   const period = extractRoadTaxPeriod(text);

//   return {
//     registrationNumber: registration?.value,

//     vehicleNumber: registration?.value,

//     documentNumber: documentNumber?.value,

//     issueDate: period.issueDate,

//     expiryDate: period.expiryDate,

//     issuingAuthority: authority?.value,
//   };
// };

// const parseDrivingLicense = (text: string): OCRDocumentData => {
//   const license = extractLicenseNumber(text);

//   const driver = extractDriverName(text);

//   const dates = extractDocumentDates(text);

//   const authority = extractIssuingAuthority(text);

//   return {
//     licenseNumber: license?.value,

//     documentNumber: license?.value,

//     driverName: driver?.value,

//     issueDate: dates.issueDate?.date,

//     expiryDate: dates.expiryDate?.date,

//     issuingAuthority: authority?.value,
//   };
// };

// const parseMedicalCertificate = (text: string): OCRDocumentData => {
//   const certificate = extractCertificateNumber(text);

//   const driver = extractDriverName(text);

//   const dates = extractDocumentDates(text);

//   const authority = extractIssuingAuthority(text);

//   return {
//     certificateNumber: certificate?.value,

//     documentNumber: certificate?.value,

//     driverName: driver?.value,

//     issueDate: dates.issueDate?.date,

//     expiryDate: dates.expiryDate?.date,

//     issuingAuthority: authority?.value,
//   };
// };

// const parseOther = (text: string): OCRDocumentData => {
//   const registration = extractRegistrationNumber(text);

//   const documentNumber = extractDocumentNumber(text);

//   const dates = extractDocumentDates(text);

//   const authority = extractIssuingAuthority(text);

//   return {
//     registrationNumber: registration?.value,

//     vehicleNumber: registration?.value,

//     documentNumber: documentNumber?.value,

//     issueDate: dates.issueDate?.date,

//     expiryDate: dates.expiryDate?.date,

//     issuingAuthority: authority?.value,
//   };
// };

// /**
//  * ============================================================
//  * PARSE BY DOCUMENT TYPE
//  * ============================================================
//  */

// const parseByDocumentType = (
//   documentType: DocumentType,
//   text: string,
// ): OCRDocumentData => {
//   switch (documentType) {
//     case DocumentType.PUC:
//       return parsePUC(text);

//     case DocumentType.RC:
//       return parseRC(text);

//     case DocumentType.FITNESS:
//       return parseFitness(text);

//     case DocumentType.INSURANCE:
//       return parseInsurance(text);

//     case DocumentType.PERMIT:
//       return parsePermit(text);

//     case DocumentType.ROAD_TAX:
//       return parseRoadTax(text);

//     case DocumentType.DRIVING_LICENSE:
//       return parseDrivingLicense(text);

//     case DocumentType.MEDICAL_CERTIFICATE:
//       return parseMedicalCertificate(text);

//     default:
//       return parseOther(text);
//   }
// };

// /**
//  * ============================================================
//  * CONFIDENCE
//  * ============================================================
//  */

// const calculateOverallConfidence = (fields: OCRExtractionResult[]): number => {
//   const successful = fields.filter((field) => field.success);

//   if (!successful.length) {
//     return 0;
//   }

//   const total = successful.reduce((sum, field) => sum + field.confidence, 0);

//   return Math.round(total / successful.length);
// };

// /**
//  * ============================================================
//  * REVIEW STATUS
//  * ============================================================
//  */

// const getReviewStatus = (
//   confidence: number,
//   expiryField: OCRExtractionResult | undefined,
// ) => {
//   if (!expiryField?.success) {
//     return "manual_required" as const;
//   }

//   if (expiryField.needsReview) {
//     return "needs_review" as const;
//   }

//   if (confidence >= 90) {
//     return "auto_accepted" as const;
//   }

//   if (confidence >= 70) {
//     return "needs_review" as const;
//   }

//   return "manual_required" as const;
// };

// /**
//  * ============================================================
//  * PARSE DOCUMENT TEXT
//  * ============================================================
//  */

// export const parseDocumentText = (
//   documentType: DocumentType,
//   text: string,
// ): OCRParserResult => {
//   const normalizedText = normalizeText(text);

//   if (!normalizedText) {
//     return {
//       success: false,

//       data: {},

//       fields: [],

//       confidence: 0,

//       reviewStatus: "manual_required",

//       errors: ["OCR text is empty"],
//     };
//   }

//   /**
//    * --------------------------------------------------------
//    * Structured data
//    * --------------------------------------------------------
//    */
//   const data = parseByDocumentType(documentType, normalizedText);

//   const fields: OCRExtractionResult[] = [];

//   /**
//    * --------------------------------------------------------
//    * Registration
//    * --------------------------------------------------------
//    */
//   const registration = extractRegistrationNumber(normalizedText);

//   if (registration) {
//     fields.push(createExtractionResult("registrationNumber", registration));
//   } else if (
//     documentType !== DocumentType.DRIVING_LICENSE &&
//     documentType !== DocumentType.MEDICAL_CERTIFICATE
//   ) {
//     fields.push({
//       field: "registrationNumber",

//       rawValue: "",

//       confidence: 0,

//       success: false,

//       needsReview: true,

//       error: "Unable to extract registrationNumber",
//     });
//   }

//   /**
//    * --------------------------------------------------------
//    * Document / policy number
//    * --------------------------------------------------------
//    */
//   const documentNumber =
//     documentType === DocumentType.INSURANCE
//       ? extractPolicyNumber(normalizedText)
//       : extractDocumentNumber(normalizedText);

//   if (documentNumber) {
//     fields.push(createExtractionResult("documentNumber", documentNumber));
//   }

//   /**
//    * --------------------------------------------------------
//    * Insurance policy number
//    * --------------------------------------------------------
//    */
//   if (documentType === DocumentType.INSURANCE) {
//     const policy = extractPolicyNumber(normalizedText);

//     if (policy) {
//       fields.push(createExtractionResult("policyNumber", policy));
//     }
//   }

//   /**
//    * --------------------------------------------------------
//    * PUC certificate
//    * --------------------------------------------------------
//    */
//   if (documentType === DocumentType.PUC) {
//     const certificate = extractCertificateNumber(normalizedText);

//     if (certificate) {
//       fields.push(createExtractionResult("certificateNumber", certificate));
//     }
//   }

//   /**
//    * --------------------------------------------------------
//    * Permit
//    * --------------------------------------------------------
//    */
//   if (documentType === DocumentType.PERMIT) {
//     const permit = extractPermitNumber(normalizedText);

//     if (permit) {
//       fields.push(createExtractionResult("permitNumber", permit));
//     }
//   }

//   /**
//    * --------------------------------------------------------
//    * Driving license
//    * --------------------------------------------------------
//    */
//   if (documentType === DocumentType.DRIVING_LICENSE) {
//     const license = extractLicenseNumber(normalizedText);

//     if (license) {
//       fields.push(createExtractionResult("licenseNumber", license));
//     }
//   }

//   /**
//    * --------------------------------------------------------
//    * Certificates
//    * --------------------------------------------------------
//    */
//   if (
//     documentType === DocumentType.FITNESS ||
//     documentType === DocumentType.MEDICAL_CERTIFICATE
//   ) {
//     const certificate = extractCertificateNumber(normalizedText);

//     if (certificate) {
//       fields.push(createExtractionResult("certificateNumber", certificate));
//     }
//   }

//   /**
//    * ========================================================
//    * DATE EXTRACTION
//    * ========================================================
//    */

//   let expiryField: OCRExtractionResult | undefined;

//   /**
//    * --------------------------------------------------------
//    * INSURANCE
//    * --------------------------------------------------------
//    *
//    * Insurance documents must first use
//    * extractInsurancePolicyDates().
//    */
//   if (documentType === DocumentType.INSURANCE) {
//     const policyDates = extractInsurancePolicyDates(normalizedText);

//     /**
//      * Issue date.
//      */
//     if (policyDates.issueDate) {
//       fields.push({
//         field: "issueDate",

//         rawValue:
//           policyDates.rawIssueDate ?? formatDateForOCR(policyDates.issueDate),

//         normalizedValue: formatDateForISO(policyDates.issueDate),

//         confidence: 99,

//         success: true,

//         needsReview: false,

//         matchedLabel: "POLICY PERIOD",
//       });
//     } else {
//       fields.push({
//         field: "issueDate",

//         rawValue: "",

//         confidence: 0,

//         success: false,

//         needsReview: true,

//         error: "Insurance policy start date could not be detected.",
//       });
//     }

//     /**
//      * Expiry date.
//      */
//     if (policyDates.expiryDate) {
//       expiryField = {
//         field: "expiryDate",

//         rawValue:
//           policyDates.rawExpiryDate ?? formatDateForOCR(policyDates.expiryDate),

//         normalizedValue: formatDateForISO(policyDates.expiryDate),

//         confidence: 99,

//         success: true,

//         needsReview: false,

//         matchedLabel: "POLICY PERIOD",
//       };
//     } else {
//       expiryField = {
//         field: "expiryDate",

//         rawValue: "",

//         confidence: 0,

//         success: false,

//         needsReview: true,

//         error: "Insurance policy expiry date could not be detected.",
//       };
//     }

//     fields.push(expiryField);
//   } else if (documentType === DocumentType.ROAD_TAX) {

//   /**
//    * --------------------------------------------------------
//    * ROAD TAX
//    * --------------------------------------------------------
//    */
//     const period = extractRoadTaxPeriod(normalizedText);

//     if (period.issueDate) {
//       fields.push({
//         field: "issueDate",

//         rawValue: period.rawIssueDate ?? formatDateForOCR(period.issueDate),

//         normalizedValue: formatDateForISO(period.issueDate),

//         confidence: 96,

//         success: true,

//         needsReview: false,

//         matchedLabel: "PERIOD",
//       });
//     } else {
//       fields.push({
//         field: "issueDate",

//         rawValue: "",

//         confidence: 0,

//         success: false,

//         needsReview: true,

//         error: "Unable to extract issue date from Road Tax period.",
//       });
//     }

//     if (period.expiryDate) {
//       expiryField = {
//         field: "expiryDate",

//         rawValue: period.rawExpiryDate ?? formatDateForOCR(period.expiryDate),

//         normalizedValue: formatDateForISO(period.expiryDate),

//         confidence: 98,

//         success: true,

//         needsReview: false,

//         matchedLabel: "PERIOD",
//       };
//     } else {
//       expiryField = {
//         field: "expiryDate",

//         rawValue: "",

//         confidence: 0,

//         success: false,

//         needsReview: true,

//         error: "Unable to extract expiryDate from Road Tax period.",
//       };
//     }

//     fields.push(expiryField);
//   } else {

//   /**
//    * --------------------------------------------------------
//    * OTHER DOCUMENTS
//    * --------------------------------------------------------
//    */
//     const issueDate = extractIssueDate(normalizedText);

//     fields.push(createDateExtractionResult("issueDate", issueDate));

//     const expiryDate = extractExpiryDate(normalizedText);

//     expiryField = createDateExtractionResult("expiryDate", expiryDate);

//     fields.push(expiryField);
//   }

//   /**
//    * --------------------------------------------------------
//    * Issuing authority
//    * --------------------------------------------------------
//    */
//   const authority = extractIssuingAuthority(normalizedText);

//   if (authority) {
//     fields.push(createExtractionResult("issuingAuthority", authority));
//   }

//   /**
//    * ========================================================
//    * CONFIDENCE
//    * ========================================================
//    */
//   const confidence = calculateOverallConfidence(fields);

//   /**
//    * ========================================================
//    * REVIEW STATUS
//    * ========================================================
//    */
//   const reviewStatus = getReviewStatus(confidence, expiryField);

//   /**
//    * ========================================================
//    * ERRORS
//    * ========================================================
//    */
//   const errors: string[] = [];

//   if (!expiryField?.success) {
//     errors.push(
//       "Expiry date could not be confidently extracted from the document.",
//     );
//   }

//   if (
//     !registration?.value &&
//     documentType !== DocumentType.DRIVING_LICENSE &&
//     documentType !== DocumentType.MEDICAL_CERTIFICATE
//   ) {
//     errors.push("Vehicle registration number could not be extracted.");
//   }

//   /**
//    * ========================================================
//    * SUCCESS
//    * ========================================================
//    *
//    * Parser success means that at least one useful
//    * field was extracted.
//    *
//    * The service layer will separately decide whether
//    * expiry is mandatory.
//    */
//   const success = fields.some((field) => field.success);

//   return {
//     success,

//     data,

//     fields,

//     confidence,

//     reviewStatus,

//     ...(errors.length ? { errors } : {}),
//   };
// };

// /**
//  * ============================================================
//  * AUTO DETECTION
//  * ============================================================
//  */

// export const detectAndParseDocument = (text: string) => {
//   const documentType = detectDocumentType(text);

//   return {
//     documentType,

//     result: parseDocumentText(documentType, text),
//   };
// };

// /**
//  * ============================================================
//  * EXPIRY VALIDATION
//  * ============================================================
//  */

// export const validateExtractedExpiryDate = (
//   expiryDate: Date | undefined,
//   issueDate: Date | undefined,
// ) => {
//   if (!expiryDate) {
//     return {
//       valid: false,
//       reason: "Expiry date was not extracted.",
//     };
//   }

//   if (Number.isNaN(expiryDate.getTime())) {
//     return {
//       valid: false,
//       reason: "Extracted expiry date is invalid.",
//     };
//   }

//   if (issueDate && expiryDate < issueDate) {
//     return {
//       valid: false,
//       reason: "Expiry date is before issue date.",
//     };
//   }

//   return {
//     valid: true,
//   };
// };

// /**
//  * ============================================================
//  * DEFAULT EXPORT
//  * ============================================================
//  */

// export default {
//   parseDocumentText,
//   detectAndParseDocument,
//   detectDocumentType,
//   extractRegistrationNumber,
//   extractDocumentNumber,
//   extractOwnerName,
//   extractDriverName,
//   extractLicenseNumber,
//   extractPolicyNumber,
//   extractPermitNumber,
//   extractCertificateNumber,
//   extractIssuingAuthority,
//   validateExtractedExpiryDate,
// };

import { DocumentType } from "../../models/Document.model";

import type {
  OCRDocumentData,
  OCRExtractionResult,
  OCRParserResult,
} from "../../types/ocr.types";

import {
  extractDocumentDates,
  extractExpiryDate,
  extractIssueDate,
  extractInsurancePolicyDates,
  extractRoadTaxPeriod,
} from "./dateExtractor.util";

/**
 * ============================================================
 * DOCUMENT PARSER UTILITY
 * ============================================================
 *
 * Phase 6 — OCR & Automatic Document Data Extraction
 *
 * OCR TEXT
 *    ↓
 * Normalize text
 *    ↓
 * Detect document type
 *    ↓
 * Parse document-specific fields
 *    ↓
 * Extract dates
 *    ↓
 * Validate expiry
 *    ↓
 * Return OCRParserResult
 *
 * IMPORTANT:
 *
 * This utility NEVER saves anything to MongoDB.
 */

/**
 * ============================================================
 * TYPES
 * ============================================================
 */

interface ParsedField {
  value?: string;
  confidence: number;
  matchedLabel?: string;
  sourceText?: string;
}

/**
 * ============================================================
 * REGEX
 * ============================================================
 */

/**
 * Indian vehicle registration number.
 *
 * Examples:
 *
 * RJ11GD3664
 * UP14AB1234
 * UP-14-AB-1234
 * DL01CA1234
 * MH 12 AB 1234
 */
const REGISTRATION_NUMBER_REGEX =
  /\b([A-Z]{2})\s*[-/]?\s*(\d{1,2})\s*[-/]?\s*([A-Z]{1,3})\s*[-/]?\s*(\d{1,4})\b/i;

/**
 * ============================================================
 * LABELS
 * ============================================================
 */

const DOCUMENT_NUMBER_LABELS = [
  "DOCUMENT NO",
  "DOCUMENT NUMBER",

  "CERTIFICATE NO",
  "CERTIFICATE NUMBER",

  "PUC NO",
  "PUC NUMBER",

  "PERMIT NO",
  "PERMIT NUMBER",

  "LICENSE NO",
  "LICENSE NUMBER",
  "LICENCE NO",
  "LICENCE NUMBER",

  "APPLICATION NO",
  "APPLICATION NUMBER",

  "RECEIPT NO",
  "RECEIPT NUMBER",

  "APPLICATION NO / RECEIPT NO",
  "APPLICATION NUMBER / RECEIPT NUMBER",
] as const;

const REGISTRATION_LABELS = [
  "REGISTRATION NO",
  "REGISTRATION NUMBER",

  "REGN NO",
  "REGN. NO",

  "REGD NO",
  "REGD. NO",

  "VEHICLE NO",
  "VEHICLE NUMBER",

  "VEHICLE REGISTRATION",

  "REGISTRATION",
] as const;

const OWNER_LABELS = [
  "OWNER NAME",
  "REGISTERED OWNER",
  "NAME OF OWNER",
  "OWNER",
] as const;

const DRIVER_LABELS = [
  "DRIVER NAME",
  "NAME OF DRIVER",
  "APPLICANT NAME",
] as const;

const LICENSE_LABELS = [
  "DL NO",
  "DL NUMBER",
  "DRIVING LICENSE NO",
  "DRIVING LICENCE NO",
  "LICENSE NO",
  "LICENCE NO",
] as const;

const POLICY_LABELS = ["POLICY NO", "POLICY NUMBER", "POLICY NO."] as const;

const PERMIT_LABELS = ["PERMIT NO", "PERMIT NUMBER", "PERMIT NO."] as const;

const CERTIFICATE_LABELS = [
  "CERTIFICATE NO",
  "CERTIFICATE NUMBER",
  "CERTIFICATE NO.",
] as const;

const AUTHORITY_LABELS = [
  "ISSUING AUTHORITY",
  "REGISTRATION AUTHORITY",
  "ISSUED BY",
  "RTO",
  "TRANSPORT DEPARTMENT",
] as const;

/**
 * ============================================================
 * TEXT NORMALIZATION
 * ============================================================
 */

const normalizeText = (text: string): string => {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
};

const normalizeSearchText = (text: string): string => {
  return normalizeText(text)
    .toUpperCase()
    .replace(/[|]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

const escapeRegExp = (value: string): string => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

/**
 * ============================================================
 * VALUE CLEANING
 * ============================================================
 */

const cleanExtractedValue = (value: string): string => {
  return value
    .replace(/^[\s:;,.-]+/, "")
    .replace(/[\s;,.-]+$/, "")
    .replace(/\s{2,}/g, " ")
    .trim();
};

/**
 * ============================================================
 * SUSPICIOUS OCR TEXT
 * ============================================================
 */

const removeSuspiciousTrailingText = (value: string): string => {
  let cleaned = value;

  cleaned = cleaned.split(/\bA\/C\s+PARTICULARS\b/i)[0];

  cleaned = cleaned.split(/\bA\/C\s+HEAD\b/i)[0];

  cleaned = cleaned.split(/\bCREDIT\s+AMOUNT\b/i)[0];

  cleaned = cleaned.split(/\bDEBIT\s+AMOUNT\b/i)[0];

  cleaned = cleaned.split(/\bBANK\s+REFERENCE\s+NUMBER\b/i)[0];

  cleaned = cleaned.split(/\bTRANSACTION\s+IDENTIFICATION\s+NUMBER\b/i)[0];

  cleaned = cleaned.split(/\bADDRESS\s*:/i)[0];

  cleaned = cleaned.split(/\bAGENT\s+CODE\s*:/i)[0];

  cleaned = cleaned.split(/\bPAYMENT\s+DATE\b/i)[0];

  cleaned = cleaned.split(/\bTRANSACTION\s+DATE\b/i)[0];

  cleaned = cleaned.split(/\bVEHICLE\s+(?:NO|NUMBER)\b/i)[0];

  return cleanExtractedValue(cleaned);
};

/**
 * ============================================================
 * LABEL VALUE EXTRACTION
 * ============================================================
 */

const findLabelValue = (
  text: string,
  labels: readonly string[],
): ParsedField | null => {
  const normalized = normalizeText(text);

  for (const label of labels) {
    const regex = new RegExp(
      `${escapeRegExp(label)}\\s*[:\\-]?\\s*([^\\n]{2,180})`,
      "i",
    );

    const match = normalized.match(regex);

    if (!match?.[1]) {
      continue;
    }

    let value = cleanExtractedValue(match[1]);

    value = removeSuspiciousTrailingText(value);

    if (!value) {
      continue;
    }

    return {
      value,

      confidence: 94,

      matchedLabel: label,

      sourceText: match[0],
    };
  }

  return null;
};

/**
 * ============================================================
 * REGISTRATION NUMBER
 * ============================================================
 */

const normalizeRegistrationNumber = (value: string): string => {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, "");
};

export const extractRegistrationNumber = (text: string): ParsedField | null => {
  /**
   * First try labelled registration number.
   */
  const labeled = findLabelValue(text, REGISTRATION_LABELS);

  if (labeled?.value) {
    const match = labeled.value.match(REGISTRATION_NUMBER_REGEX);

    if (match) {
      return {
        value: normalizeRegistrationNumber(match[0]),

        confidence: labeled.confidence,

        matchedLabel: labeled.matchedLabel,

        sourceText: labeled.sourceText,
      };
    }
  }

  /**
   * Search complete OCR text.
   */
  const normalized = normalizeSearchText(text);

  const match = normalized.match(REGISTRATION_NUMBER_REGEX);

  if (!match) {
    return null;
  }

  return {
    value: normalizeRegistrationNumber(match[0]),

    confidence: 72,

    sourceText: match[0],
  };
};

/**
 * ============================================================
 * DOCUMENT NUMBER VALIDATION
 * ============================================================
 */

const isBadDocumentNumber = (value: string): boolean => {
  const upper = value.toUpperCase().trim();

  const suspiciousTerms = [
    "END/REN/DEC/CIM",
    "A/C PARTICULARS",
    "CREDIT AMOUNT",
    "DEBIT AMOUNT",
    "TOTAL AMOUNT",
    "PARTICULARS",
    "BANK REFERENCE",
    "TRANSACTION IDENTIFICATION",
    "ADDRESS",
    "AGENT CODE",
    "PAYMENT DATE",
    "TRANSACTION DATE",
  ];

  if (suspiciousTerms.some((term) => upper.includes(term))) {
    return true;
  }

  if (upper === "NUMBER" || upper === "NO" || upper === "NO.") {
    return true;
  }

  return false;
};

/**
 * ============================================================
 * LONG NUMBER
 * ============================================================
 */

const extractLongNumber = (value: string): string | undefined => {
  const matches = value.match(/\b\d{12,25}\b/g);

  if (!matches?.length) {
    return undefined;
  }

  return matches[0];
};

/**
 * ============================================================
 * INSURANCE POLICY NUMBER
 * ============================================================
 */

const extractPolicyNumberFromInsurance = (text: string): ParsedField | null => {
  const normalized = normalizeSearchText(text);

  const scheduleStart = normalized.indexOf("CERTIFICATE OF INSURANCE");

  const scheduleText =
    scheduleStart >= 0
      ? normalized.slice(scheduleStart, scheduleStart + 3000)
      : normalized;

  /**
   * First try labelled policy number.
   */
  const labelled = findLabelValue(scheduleText, POLICY_LABELS);

  if (labelled?.value) {
    const longNumber = extractLongNumber(labelled.value);

    if (longNumber) {
      return {
        value: longNumber,

        confidence: 98,

        matchedLabel: labelled.matchedLabel,

        sourceText: labelled.sourceText,
      };
    }
  }

  /**
   * Insurance policy numbers are often long numeric strings.
   */
  const policyNumberRegex = /\b(\d{16,25})\b/g;

  const candidates: string[] = [];

  let match: RegExpExecArray | null;

  while ((match = policyNumberRegex.exec(scheduleText)) !== null) {
    const value = match[1];

    /**
     * Known non-policy numbers from OCR tables.
     */
    const excludedNumbers = ["37010081268000003711", "91098900000001"];

    if (excludedNumbers.includes(value)) {
      continue;
    }

    if (!candidates.includes(value)) {
      candidates.push(value);
    }
  }

  if (!candidates.length) {
    return null;
  }

  return {
    value: candidates[0],

    confidence: 96,

    matchedLabel: "POLICY NUMBER",

    sourceText: candidates[0],
  };
};

export const extractDocumentNumber = (text: string): ParsedField | null => {
  const labeled = findLabelValue(text, DOCUMENT_NUMBER_LABELS);

  if (!labeled?.value) {
    return null;
  }

  /**
   * For receipt/application numbers, keep the useful ID.
   */
  const useful = extractLongNumber(labeled.value);

  if (useful) {
    return {
      value: useful,

      confidence: labeled.confidence,

      matchedLabel: labeled.matchedLabel,

      sourceText: labeled.sourceText,
    };
  }

  const cleaned = cleanExtractedValue(labeled.value);

  if (!cleaned || isBadDocumentNumber(cleaned)) {
    return null;
  }

  return {
    value: cleaned,

    confidence: 75,

    matchedLabel: labeled.matchedLabel,

    sourceText: labeled.sourceText,
  };
};

export const extractPolicyNumber = (text: string): ParsedField | null => {
  return extractPolicyNumberFromInsurance(text);
};

/**
 * ============================================================
 * OWNER
 * ============================================================
 */

export const extractOwnerName = (text: string): ParsedField | null => {
  return findLabelValue(text, OWNER_LABELS);
};

/**
 * ============================================================
 * DRIVER
 * ============================================================
 */

const looksLikeCompanyName = (value: string): boolean => {
  const upper = value.toUpperCase();

  return [
    "ENTERPRISE",
    "ENTERPRISES",
    "PVT",
    "PRIVATE",
    "LIMITED",
    "LTD",
    "LLP",
    "COMPANY",
  ].some((term) => upper.includes(term));
};

export const extractDriverName = (text: string): ParsedField | null => {
  const parsed = findLabelValue(text, DRIVER_LABELS);

  if (!parsed?.value || looksLikeCompanyName(parsed.value)) {
    return null;
  }

  return parsed;
};

/**
 * ============================================================
 * LICENSE
 * ============================================================
 */

export const extractLicenseNumber = (text: string): ParsedField | null => {
  return findLabelValue(text, LICENSE_LABELS);
};

/**
 * ============================================================
 * PERMIT
 * ============================================================
 */

export const extractPermitNumber = (text: string): ParsedField | null => {
  return findLabelValue(text, PERMIT_LABELS);
};

/**
 * ============================================================
 * CERTIFICATE
 * ============================================================
 */

export const extractCertificateNumber = (text: string): ParsedField | null => {
  const labeled = findLabelValue(text, CERTIFICATE_LABELS);

  if (!labeled?.value) {
    return null;
  }

  const useful = extractLongNumber(labeled.value);

  if (useful) {
    return {
      ...labeled,

      value: useful,
    };
  }

  return labeled;
};

/**
 * ============================================================
 * ISSUING AUTHORITY
 * ============================================================
 */

export const extractIssuingAuthority = (text: string): ParsedField | null => {
  const authority = findLabelValue(text, AUTHORITY_LABELS);

  if (!authority?.value) {
    return null;
  }

  let value = authority.value;

  value = value
    .split(/PAYMENT\s+DATE/i)[0]
    .split(/TRANSACTION\s+DATE/i)[0]
    .split(/VEHICLE\s+(?:NO|NUMBER)/i)[0];

  value = cleanExtractedValue(value);

  if (!value) {
    return null;
  }

  return {
    ...authority,

    value,
  };
};

/**
 * ============================================================
 * EXTRACTION RESULT
 * ============================================================
 */

const createExtractionResult = (
  field: OCRExtractionResult["field"],
  parsed: ParsedField | null,
): OCRExtractionResult => {
  if (!parsed?.value) {
    return {
      field,

      rawValue: "",

      confidence: 0,

      success: false,

      needsReview: true,

      error: `Unable to extract ${field}`,
    };
  }

  return {
    field,

    rawValue: parsed.value,

    normalizedValue: parsed.value,

    confidence: parsed.confidence,

    success: true,

    needsReview: parsed.confidence < 90,

    matchedLabel: parsed.matchedLabel,

    sourceText: parsed.sourceText,
  };
};

/**
 * ============================================================
 * DATE HELPERS
 * ============================================================
 */

const formatDateForOCR = (date: Date): string => {
  const day = String(date.getDate()).padStart(2, "0");

  const month = String(date.getMonth() + 1).padStart(2, "0");

  return `${day}/${month}/${date.getFullYear()}`;
};

const formatDateForISO = (date: Date): string => {
  const year = date.getFullYear();

  const month = String(date.getMonth() + 1).padStart(2, "0");

  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const createDateExtractionResult = (
  field: "issueDate" | "expiryDate",
  parsed:
    | ReturnType<typeof extractIssueDate>
    | ReturnType<typeof extractExpiryDate>,
): OCRExtractionResult => {
  if (!parsed?.date) {
    return {
      field,

      rawValue: "",

      confidence: 0,

      success: false,

      needsReview: true,

      error: `Unable to extract ${field}`,
    };
  }

  return {
    field,

    rawValue: parsed.rawValue,

    normalizedValue: parsed.normalizedValue,

    confidence: parsed.confidence ?? 0,

    success: true,

    needsReview: parsed.needsReview ?? true,

    matchedLabel: parsed.matchedLabel,
  };
};

/**
 * ============================================================
 * DOCUMENT TYPE DETECTION
 * ============================================================
 *
 * IMPORTANT:
 *
 * We use scoring instead of simply checking conditions
 * sequentially.
 *
 * This prevents:
 *
 * TAX RECEIPT
 * TRANSPORT DEPARTMENT
 *
 * from accidentally becoming RC.
 */
export const detectDocumentType = (text: string): DocumentType => {
  const normalized = normalizeSearchText(text);

  const scores: Record<string, number> = {};

  const addScore = (type: DocumentType, score: number) => {
    scores[type] = (scores[type] ?? 0) + score;
  };

  /**
   * --------------------------------------------------------
   * ROAD TAX
   * --------------------------------------------------------
   */

  if (normalized.includes("TAX RECEIPT")) {
    addScore(DocumentType.ROAD_TAX, 100);
  }

  if (normalized.includes("ROAD TAX")) {
    addScore(DocumentType.ROAD_TAX, 100);
  }

  if (normalized.includes("MOTOR VEHICLE TAX")) {
    addScore(DocumentType.ROAD_TAX, 100);
  }

  if (normalized.includes("MV TAX")) {
    addScore(DocumentType.ROAD_TAX, 80);
  }

  if (
    normalized.includes("TRANSPORT DEPARTMENT") &&
    normalized.includes("TAX")
  ) {
    addScore(DocumentType.ROAD_TAX, 70);
  }

  if (normalized.includes("GRAND TOTAL") && normalized.includes("MV TAX")) {
    addScore(DocumentType.ROAD_TAX, 60);
  }

  /**
   * --------------------------------------------------------
   * PUC
   * --------------------------------------------------------
   */

  if (normalized.includes("POLLUTION UNDER CONTROL")) {
    addScore(DocumentType.PUC, 100);
  }

  if (/\bPUC\b/.test(normalized)) {
    addScore(DocumentType.PUC, 90);
  }

  /**
   * --------------------------------------------------------
   * INSURANCE
   * --------------------------------------------------------
   */

  if (normalized.includes("CERTIFICATE OF INSURANCE")) {
    addScore(DocumentType.INSURANCE, 100);
  }

  if (normalized.includes("INSURANCE")) {
    addScore(DocumentType.INSURANCE, 70);
  }

  if (normalized.includes("POLICY SCHEDULE")) {
    addScore(DocumentType.INSURANCE, 80);
  }

  if (normalized.includes("MOTOR POLICY")) {
    addScore(DocumentType.INSURANCE, 80);
  }

  /**
   * --------------------------------------------------------
   * FITNESS
   * --------------------------------------------------------
   */

  if (normalized.includes("FITNESS CERTIFICATE")) {
    addScore(DocumentType.FITNESS, 100);
  }

  if (normalized.includes("CERTIFICATE OF FITNESS")) {
    addScore(DocumentType.FITNESS, 100);
  }

  /**
   * --------------------------------------------------------
   * DRIVING LICENSE
   * --------------------------------------------------------
   */

  if (
    normalized.includes("DRIVING LICENCE") ||
    normalized.includes("DRIVING LICENSE")
  ) {
    addScore(DocumentType.DRIVING_LICENSE, 100);
  }

  if (
    normalized.includes("DRIVER LICENCE") ||
    normalized.includes("DRIVER LICENSE")
  ) {
    addScore(DocumentType.DRIVING_LICENSE, 90);
  }

  /**
   * --------------------------------------------------------
   * MEDICAL CERTIFICATE
   * --------------------------------------------------------
   */

  if (normalized.includes("MEDICAL CERTIFICATE")) {
    addScore(DocumentType.MEDICAL_CERTIFICATE, 100);
  }

  /**
   * --------------------------------------------------------
   * PERMIT
   * --------------------------------------------------------
   */

  if (normalized.includes("PERMIT")) {
    addScore(DocumentType.PERMIT, 70);
  }

  if (normalized.includes("TRANSPORT PERMIT")) {
    addScore(DocumentType.PERMIT, 100);
  }

  /**
   * --------------------------------------------------------
   * RC
   * --------------------------------------------------------
   */

  if (normalized.includes("REGISTRATION CERTIFICATE")) {
    addScore(DocumentType.RC, 100);
  }

  if (normalized.includes("CERTIFICATE OF REGISTRATION")) {
    addScore(DocumentType.RC, 100);
  }

  /**
   * Only give a small score to standalone RC.
   *
   * This prevents Road Tax receipts containing unrelated
   * OCR fragments from becoming RC.
   */
  if (/\bRC\b/.test(normalized)) {
    addScore(DocumentType.RC, 30);
  }

  /**
   * --------------------------------------------------------
   * Determine highest score.
   * --------------------------------------------------------
   */

  const entries = Object.entries(scores);

  if (!entries.length) {
    return DocumentType.OTHER;
  }

  entries.sort((a, b) => b[1] - a[1]);

  return entries[0][0] as DocumentType;
};

/**
 * ============================================================
 * DOCUMENT PARSERS
 * ============================================================
 */

const parsePUC = (text: string): OCRDocumentData => {
  const registration = extractRegistrationNumber(text);

  const certificate = extractCertificateNumber(text);

  const dates = extractDocumentDates(text);

  const authority = extractIssuingAuthority(text);

  return {
    registrationNumber: registration?.value,

    vehicleNumber: registration?.value,

    certificateNumber: certificate?.value,

    documentNumber: certificate?.value,

    issueDate: dates.issueDate?.date,

    expiryDate: dates.expiryDate?.date,

    issuingAuthority: authority?.value,
  };
};

/**
 * ============================================================
 * RC PARSER
 * ============================================================
 */

const parseRC = (text: string): OCRDocumentData => {
  const registration = extractRegistrationNumber(text);

  const owner = extractOwnerName(text);

  const dates = extractDocumentDates(text);

  const authority = extractIssuingAuthority(text);

  const documentNumber = extractDocumentNumber(text);

  return {
    registrationNumber: registration?.value,

    vehicleNumber: registration?.value,

    ownerName: owner?.value,

    documentNumber: documentNumber?.value,

    issueDate: dates.issueDate?.date,

    expiryDate: dates.expiryDate?.date,

    issuingAuthority: authority?.value,
  };
};

/**
 * ============================================================
 * FITNESS PARSER
 * ============================================================
 */

const parseFitness = (text: string): OCRDocumentData => {
  const registration = extractRegistrationNumber(text);

  const certificate = extractCertificateNumber(text);

  const dates = extractDocumentDates(text);

  const authority = extractIssuingAuthority(text);

  return {
    registrationNumber: registration?.value,

    vehicleNumber: registration?.value,

    certificateNumber: certificate?.value,

    documentNumber: certificate?.value,

    issueDate: dates.issueDate?.date,

    expiryDate: dates.expiryDate?.date,

    issuingAuthority: authority?.value,
  };
};

/**
 * ============================================================
 * INSURANCE PARSER
 * ============================================================
 */

const parseInsurance = (text: string): OCRDocumentData => {
  const registration = extractRegistrationNumber(text);

  const policy = extractPolicyNumber(text);

  const dates = extractInsurancePolicyDates(text);

  const authority = extractIssuingAuthority(text);

  return {
    registrationNumber: registration?.value,

    vehicleNumber: registration?.value,

    policyNumber: policy?.value,

    documentNumber: policy?.value,

    issueDate: dates.issueDate,

    expiryDate: dates.expiryDate,

    issuingAuthority: authority?.value,
  };
};

/**
 * ============================================================
 * PERMIT PARSER
 * ============================================================
 */

const parsePermit = (text: string): OCRDocumentData => {
  const registration = extractRegistrationNumber(text);

  const permit = extractPermitNumber(text);

  const dates = extractDocumentDates(text);

  const authority = extractIssuingAuthority(text);

  return {
    registrationNumber: registration?.value,

    vehicleNumber: registration?.value,

    permitNumber: permit?.value,

    documentNumber: permit?.value,

    issueDate: dates.issueDate?.date,

    expiryDate: dates.expiryDate?.date,

    issuingAuthority: authority?.value,
  };
};

/**
 * ============================================================
 * ROAD TAX PARSER
 * ============================================================
 *
 * Example actual OCR:
 *
 * TAX RECEIPT
 * Transport Department, Government of Rajasthan
 * Registration Authority DHOLPUR 010, Rajasthan
 *
 * Application No. / Receipt No.
 * RJ260401V6501861 / RJ260401C5397054
 *
 * Vehicle No: RJ11GD3664
 *
 * Period
 * 01-Apr-2026 to 31-Mar-2027
 *
 * MV Tax
 *
 * RESULT:
 *
 * documentType = ROAD_TAX
 *
 * registrationNumber = RJ11GD3664
 *
 * issueDate = 2026-04-01
 *
 * expiryDate = 2027-03-31
 */
const parseRoadTax = (text: string): OCRDocumentData => {
  const registration = extractRegistrationNumber(text);

  const documentNumber = extractDocumentNumber(text);

  const authority = extractIssuingAuthority(text);

  /**
   * IMPORTANT:
   *
   * Road Tax must use the TAX PERIOD.
   *
   * Do NOT use Payment Date.
   *
   * Do NOT use Transaction Date.
   */
  const period = extractRoadTaxPeriod(text);

  return {
    registrationNumber: registration?.value,

    vehicleNumber: registration?.value,

    documentNumber: documentNumber?.value,

    issueDate: period.issueDate,

    expiryDate: period.expiryDate,

    issuingAuthority: authority?.value,
  };
};

/**
 * ============================================================
 * DRIVING LICENSE PARSER
 * ============================================================
 */

const parseDrivingLicense = (text: string): OCRDocumentData => {
  const license = extractLicenseNumber(text);

  const driver = extractDriverName(text);

  const dates = extractDocumentDates(text);

  const authority = extractIssuingAuthority(text);

  return {
    licenseNumber: license?.value,

    documentNumber: license?.value,

    driverName: driver?.value,

    issueDate: dates.issueDate?.date,

    expiryDate: dates.expiryDate?.date,

    issuingAuthority: authority?.value,
  };
};

/**
 * ============================================================
 * MEDICAL CERTIFICATE PARSER
 * ============================================================
 */

const parseMedicalCertificate = (text: string): OCRDocumentData => {
  const certificate = extractCertificateNumber(text);

  const driver = extractDriverName(text);

  const dates = extractDocumentDates(text);

  const authority = extractIssuingAuthority(text);

  return {
    certificateNumber: certificate?.value,

    documentNumber: certificate?.value,

    driverName: driver?.value,

    issueDate: dates.issueDate?.date,

    expiryDate: dates.expiryDate?.date,

    issuingAuthority: authority?.value,
  };
};

/**
 * ============================================================
 * OTHER PARSER
 * ============================================================
 */

const parseOther = (text: string): OCRDocumentData => {
  const registration = extractRegistrationNumber(text);

  const documentNumber = extractDocumentNumber(text);

  const dates = extractDocumentDates(text);

  const authority = extractIssuingAuthority(text);

  return {
    registrationNumber: registration?.value,

    vehicleNumber: registration?.value,

    documentNumber: documentNumber?.value,

    issueDate: dates.issueDate?.date,

    expiryDate: dates.expiryDate?.date,

    issuingAuthority: authority?.value,
  };
};

/**
 * ============================================================
 * PARSE BY DOCUMENT TYPE
 * ============================================================
 */

const parseByDocumentType = (
  documentType: DocumentType,
  text: string,
): OCRDocumentData => {
  switch (documentType) {
    case DocumentType.PUC:
      return parsePUC(text);

    case DocumentType.RC:
      return parseRC(text);

    case DocumentType.FITNESS:
      return parseFitness(text);

    case DocumentType.INSURANCE:
      return parseInsurance(text);

    case DocumentType.PERMIT:
      return parsePermit(text);

    case DocumentType.ROAD_TAX:
      return parseRoadTax(text);

    case DocumentType.DRIVING_LICENSE:
      return parseDrivingLicense(text);

    case DocumentType.MEDICAL_CERTIFICATE:
      return parseMedicalCertificate(text);

    default:
      return parseOther(text);
  }
};

/**
 * ============================================================
 * CONFIDENCE
 * ============================================================
 */

const calculateOverallConfidence = (fields: OCRExtractionResult[]): number => {
  const successful = fields.filter((field) => field.success);

  if (!successful.length) {
    return 0;
  }

  const total = successful.reduce((sum, field) => sum + field.confidence, 0);

  return Math.round(total / successful.length);
};

/**
 * ============================================================
 * REVIEW STATUS
 * ============================================================
 */

const getReviewStatus = (
  confidence: number,
  expiryField: OCRExtractionResult | undefined,
) => {
  /**
   * No expiry extracted.
   */
  if (!expiryField?.success) {
    return "manual_required" as const;
  }

  /**
   * Extracted but uncertain.
   */
  if (expiryField.needsReview) {
    return "needs_review" as const;
  }

  /**
   * High confidence.
   */
  if (confidence >= 90) {
    return "auto_accepted" as const;
  }

  /**
   * Medium confidence.
   */
  if (confidence >= 70) {
    return "needs_review" as const;
  }

  return "manual_required" as const;
};

/**
 * ============================================================
 * DATE FIELD VALIDATION
 * ============================================================
 */

const validateDateRelationship = (
  issueDate: Date | undefined,
  expiryDate: Date | undefined,
): string[] => {
  const errors: string[] = [];

  if (issueDate && Number.isNaN(issueDate.getTime())) {
    errors.push("Extracted issue date is invalid.");
  }

  if (expiryDate && Number.isNaN(expiryDate.getTime())) {
    errors.push("Extracted expiry date is invalid.");
  }

  if (issueDate && expiryDate && expiryDate < issueDate) {
    errors.push("Expiry date is before issue date.");
  }

  return errors;
};

/**
 * ============================================================
 * PARSE DOCUMENT TEXT
 * ============================================================
 */

export const parseDocumentText = (
  documentType: DocumentType,
  text: string,
): OCRParserResult => {
  const normalizedText = normalizeText(text);

  if (!normalizedText) {
    return {
      success: false,

      data: {},

      fields: [],

      confidence: 0,

      reviewStatus: "manual_required",

      errors: ["OCR text is empty"],
    };
  }

  /**
   * ========================================================
   * STRUCTURED DATA
   * ========================================================
   */

  const data = parseByDocumentType(documentType, normalizedText);

  const fields: OCRExtractionResult[] = [];

  /**
   * ========================================================
   * REGISTRATION
   * ========================================================
   */

  const registration = extractRegistrationNumber(normalizedText);

  if (registration) {
    fields.push(createExtractionResult("registrationNumber", registration));
  } else if (
    documentType !== DocumentType.DRIVING_LICENSE &&
    documentType !== DocumentType.MEDICAL_CERTIFICATE
  ) {
    fields.push({
      field: "registrationNumber",

      rawValue: "",

      confidence: 0,

      success: false,

      needsReview: true,

      error: "Unable to extract registrationNumber",
    });
  }

  /**
   * ========================================================
   * DOCUMENT NUMBER
   * ========================================================
   */

  const documentNumber =
    documentType === DocumentType.INSURANCE
      ? extractPolicyNumber(normalizedText)
      : extractDocumentNumber(normalizedText);

  if (documentNumber) {
    fields.push(createExtractionResult("documentNumber", documentNumber));
  }

  /**
   * ========================================================
   * POLICY NUMBER
   * ========================================================
   */

  if (documentType === DocumentType.INSURANCE) {
    const policy = extractPolicyNumber(normalizedText);

    if (policy) {
      fields.push(createExtractionResult("policyNumber", policy));
    }
  }

  /**
   * ========================================================
   * PUC CERTIFICATE
   * ========================================================
   */

  if (documentType === DocumentType.PUC) {
    const certificate = extractCertificateNumber(normalizedText);

    if (certificate) {
      fields.push(createExtractionResult("certificateNumber", certificate));
    }
  }

  /**
   * ========================================================
   * PERMIT
   * ========================================================
   */

  if (documentType === DocumentType.PERMIT) {
    const permit = extractPermitNumber(normalizedText);

    if (permit) {
      fields.push(createExtractionResult("permitNumber", permit));
    }
  }

  /**
   * ========================================================
   * DRIVING LICENSE
   * ========================================================
   */

  if (documentType === DocumentType.DRIVING_LICENSE) {
    const license = extractLicenseNumber(normalizedText);

    if (license) {
      fields.push(createExtractionResult("licenseNumber", license));
    }
  }

  /**
   * ========================================================
   * CERTIFICATE
   * ========================================================
   */

  if (
    documentType === DocumentType.FITNESS ||
    documentType === DocumentType.MEDICAL_CERTIFICATE
  ) {
    const certificate = extractCertificateNumber(normalizedText);

    if (certificate) {
      fields.push(createExtractionResult("certificateNumber", certificate));
    }
  }

  /**
   * ========================================================
   * DATE EXTRACTION
   * ========================================================
   */

  let expiryField: OCRExtractionResult | undefined;

  /**
   * ========================================================
   * INSURANCE
   * ========================================================
   *
   * Always prefer POLICY PERIOD.
   */
  if (documentType === DocumentType.INSURANCE) {
    const policyDates = extractInsurancePolicyDates(normalizedText);

    /**
     * Issue date.
     */
    if (policyDates.issueDate) {
      fields.push({
        field: "issueDate",

        rawValue:
          policyDates.rawIssueDate ?? formatDateForOCR(policyDates.issueDate),

        normalizedValue: formatDateForISO(policyDates.issueDate),

        confidence: 99,

        success: true,

        needsReview: false,

        matchedLabel: "POLICY PERIOD",
      });
    } else {
      fields.push({
        field: "issueDate",

        rawValue: "",

        confidence: 0,

        success: false,

        needsReview: true,

        error: "Insurance policy start date could not be detected.",
      });
    }

    /**
     * Expiry date.
     */
    if (policyDates.expiryDate) {
      expiryField = {
        field: "expiryDate",

        rawValue:
          policyDates.rawExpiryDate ?? formatDateForOCR(policyDates.expiryDate),

        normalizedValue: formatDateForISO(policyDates.expiryDate),

        confidence: 99,

        success: true,

        needsReview: false,

        matchedLabel: "POLICY PERIOD",
      };
    } else {
      expiryField = {
        field: "expiryDate",

        rawValue: "",

        confidence: 0,

        success: false,

        needsReview: true,

        error: "Insurance policy expiry date could not be detected.",
      };
    }

    fields.push(expiryField);
  } else if (documentType === DocumentType.ROAD_TAX) {

  /**
   * ========================================================
   * ROAD TAX
   * ========================================================
   *
   * IMPORTANT:
   *
   * For Road Tax:
   *
   * Payment Date       ❌
   * Transaction Date   ❌
   * Period end date    ✅
   *
   * Example:
   *
   * 01-Apr-2026 to 31-Mar-2027
   *
   * expiryDate =
   *
   * 2027-03-31
   */
    const period = extractRoadTaxPeriod(normalizedText);

    /**
     * Issue date.
     */
    if (period.issueDate) {
      fields.push({
        field: "issueDate",

        rawValue: period.rawIssueDate ?? formatDateForOCR(period.issueDate),

        normalizedValue: formatDateForISO(period.issueDate),

        confidence: 98,

        success: true,

        needsReview: false,

        matchedLabel: "PERIOD",
      });
    } else {
      fields.push({
        field: "issueDate",

        rawValue: "",

        confidence: 0,

        success: false,

        needsReview: true,

        error: "Unable to extract issue date from Road Tax period.",
      });
    }

    /**
     * Expiry date.
     */
    if (period.expiryDate) {
      expiryField = {
        field: "expiryDate",

        rawValue: period.rawExpiryDate ?? formatDateForOCR(period.expiryDate),

        normalizedValue: formatDateForISO(period.expiryDate),

        confidence: 99,

        success: true,

        needsReview: false,

        matchedLabel: "PERIOD",
      };
    } else {
      expiryField = {
        field: "expiryDate",

        rawValue: "",

        confidence: 0,

        success: false,

        needsReview: true,

        error: "Unable to extract expiryDate from Road Tax period.",
      };
    }

    fields.push(expiryField);
  } else {

  /**
   * ========================================================
   * OTHER DOCUMENTS
   * ========================================================
   */
    const dates = extractDocumentDates(normalizedText);

    /**
     * Issue date.
     */
    fields.push(createDateExtractionResult("issueDate", dates.issueDate));

    /**
     * Expiry date.
     */
    expiryField = createDateExtractionResult("expiryDate", dates.expiryDate);

    fields.push(expiryField);
  }

  /**
   * ========================================================
   * ISSUING AUTHORITY
   * ========================================================
   */

  const authority = extractIssuingAuthority(normalizedText);

  if (authority) {
    fields.push(createExtractionResult("issuingAuthority", authority));
  }

  /**
   * ========================================================
   * DATE VALIDATION
   * ========================================================
   */

  const dateErrors = validateDateRelationship(data.issueDate, data.expiryDate);

  /**
   * If expiry is logically invalid, force review.
   */
  if (dateErrors.length && expiryField) {
    expiryField.needsReview = true;

    expiryField.confidence = Math.min(expiryField.confidence, 50);
  }

  /**
   * ========================================================
   * CONFIDENCE
   * ========================================================
   */

  const confidence = calculateOverallConfidence(fields);

  /**
   * ========================================================
   * REVIEW STATUS
   * ========================================================
   */

  let reviewStatus = getReviewStatus(confidence, expiryField);

  /**
   * Invalid date relationship must always be reviewed.
   */
  if (dateErrors.length) {
    reviewStatus = "needs_review";
  }

  /**
   * ========================================================
   * ERRORS
   * ========================================================
   */

  const errors: string[] = [...dateErrors];

  if (!expiryField?.success) {
    errors.push(
      "Expiry date could not be confidently extracted from the document.",
    );
  }

  if (
    !registration?.value &&
    documentType !== DocumentType.DRIVING_LICENSE &&
    documentType !== DocumentType.MEDICAL_CERTIFICATE
  ) {
    errors.push("Vehicle registration number could not be extracted.");
  }

  /**
   * ========================================================
   * SUCCESS
   * ========================================================
   *
   * Parser success means that at least one useful field
   * was extracted.
   *
   * The service layer decides whether expiry is mandatory.
   */
  const success = fields.some((field) => field.success);

  return {
    success,

    data,

    fields,

    confidence,

    reviewStatus,

    ...(errors.length
      ? {
          errors,
        }
      : {}),
  };
};

/**
 * ============================================================
 * AUTO DETECTION
 * ============================================================
 */

export const detectAndParseDocument = (text: string) => {
  const documentType = detectDocumentType(text);

  const result = parseDocumentText(documentType, text);

  return {
    documentType,

    result,
  };
};

/**
 * ============================================================
 * EXPIRY VALIDATION
 * ============================================================
 */

export const validateExtractedExpiryDate = (
  expiryDate: Date | undefined,

  issueDate: Date | undefined,
) => {
  if (!expiryDate) {
    return {
      valid: false,

      reason: "Expiry date was not extracted.",
    };
  }

  if (Number.isNaN(expiryDate.getTime())) {
    return {
      valid: false,

      reason: "Extracted expiry date is invalid.",
    };
  }

  if (issueDate && expiryDate < issueDate) {
    return {
      valid: false,

      reason: "Expiry date is before issue date.",
    };
  }

  return {
    valid: true,
  };
};

/**
 * ============================================================
 * DEFAULT EXPORT
 * ============================================================
 */

export default {
  parseDocumentText,

  detectAndParseDocument,

  detectDocumentType,

  extractRegistrationNumber,

  extractDocumentNumber,

  extractOwnerName,

  extractDriverName,

  extractLicenseNumber,

  extractPolicyNumber,

  extractPermitNumber,

  extractCertificateNumber,

  extractIssuingAuthority,

  validateExtractedExpiryDate,
};
