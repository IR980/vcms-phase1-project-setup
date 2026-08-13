// import type { OCRDateResult } from "../../types/ocr.types";

// /**
//  * ============================================================
//  * DATE EXTRACTOR UTILITY
//  * ============================================================
//  *
//  * Responsibility:
//  *
//  * OCR text
//  *   ↓
//  * Find dates
//  *   ↓
//  * Identify issue / expiry context
//  *   ↓
//  * Insurance policy period detection
//  *   ↓
//  * Road tax period detection
//  *   ↓
//  * Return validated Date objects
//  *
//  * IMPORTANT:
//  *
//  * This utility NEVER invents an invalid date.
//  */

// /**
//  * ============================================================
//  * TYPES
//  * ============================================================
//  */

// interface DateCandidate {
//   rawValue: string;
//   normalizedValue: string;
//   date: Date;
//   index: number;
//   context: string;
// }

// export interface ExtractedDateRange {
//   issueDate?: Date;
//   expiryDate?: Date;
//   rawIssueDate?: string;
//   rawExpiryDate?: string;
// }

// interface DateRangeCandidate {
//   start: DateCandidate;
//   end: DateCandidate;
//   rawValue: string;
//   index: number;
// }

// /**
//  * ============================================================
//  * MONTHS
//  * ============================================================
//  */

// const MONTHS: Record<string, number> = {
//   JAN: 1,
//   JANUARY: 1,

//   FEB: 2,
//   FEBRUARY: 2,

//   MAR: 3,
//   MARCH: 3,

//   APR: 4,
//   APRIL: 4,

//   MAY: 5,

//   JUN: 6,
//   JUNE: 6,

//   JUL: 7,
//   JULY: 7,

//   AUG: 8,
//   AUGUST: 8,

//   SEP: 9,
//   SEPT: 9,
//   SEPTEMBER: 9,

//   OCT: 10,
//   OCTOBER: 10,

//   NOV: 11,
//   NOVEMBER: 11,

//   DEC: 12,
//   DECEMBER: 12,
// };

// const MONTH_PATTERN = Object.keys(MONTHS)
//   .sort((a, b) => b.length - a.length)
//   .join("|");

// /**
//  * ============================================================
//  * LABELS
//  * ============================================================
//  */

// const EXPIRY_LABELS = [
//   "VALID UPTO",
//   "VALID UP TO",
//   "VALID UNTIL",
//   "VALID TILL",
//   "VALID THROUGH",
//   "VALID THRU",

//   "EXPIRY DATE",
//   "EXPIRATION DATE",
//   "DATE OF EXPIRY",

//   "EXPIRY",
//   "EXPIRATION",

//   "VALIDITY UPTO",
//   "VALIDITY UP TO",
//   "VALIDITY TILL",
//   "VALIDITY UNTIL",

//   "VALID UPTO DATE",

//   "VALIDITY PERIOD UPTO",
//   "VALIDITY PERIOD UNTIL",
//   "VALIDITY PERIOD",
// ] as const;

// const ISSUE_LABELS = [
//   "VALID FROM",
//   "VALID FROM DATE",

//   "ISSUE DATE",
//   "DATE OF ISSUE",
//   "ISSUED ON",
//   "ISSUED DATE",
//   "ISSUE",

//   "START DATE",
//   "POLICY START DATE",

//   "COMMENCEMENT DATE",

//   "PAYMENT DATE",
//   "TRANSACTION DATE",
// ] as const;

// const CONTEXT_RADIUS = 140;

// /**
//  * ============================================================
//  * OCR LABEL NORMALIZATION
//  * ============================================================
//  *
//  * Tesseract can produce:
//  *
//  * VALIDITY
//  * VALIDITV
//  * VALIDlTY
//  * VALIDUFIE
//  * VALIDITV PERIOD
//  *
//  * We normalize common OCR distortions.
//  */

// const normalizeOCRLabelText = (text: string): string => {
//   return text
//     .toUpperCase()
//     .replace(/0/g, "O")
//     .replace(/1/g, "I")
//     .replace(/5/g, "S")
//     .replace(/8/g, "B")
//     .replace(/[^A-Z0-9\s]/g, " ")
//     .replace(/\s+/g, " ")
//     .trim();
// };

// /**
//  * ============================================================
//  * TEXT NORMALIZATION
//  * ============================================================
//  */

// const normalizeText = (text: string): string => {
//   if (!text) {
//     return "";
//   }

//   return text
//     .replace(/\r\n/g, "\n")
//     .replace(/\r/g, "\n")
//     .replace(/[ \t]+/g, " ")
//     .replace(/\n+/g, "\n")
//     .trim();
// };

// const normalizeSearchText = (text: string): string => {
//   return normalizeText(text)
//     .toUpperCase()
//     .replace(/[|]/g, " ")
//     .replace(/\s+/g, " ")
//     .trim();
// };

// /**
//  * ============================================================
//  * YEAR NORMALIZATION
//  * ============================================================
//  */

// const normalizeYear = (yearText: string): number => {
//   const year = Number(yearText);

//   if (yearText.length === 4) {
//     return year;
//   }

//   return year <= 69 ? 2000 + year : 1900 + year;
// };

// /**
//  * ============================================================
//  * SAFE DATE
//  * ============================================================
//  */

// const createSafeDate = (
//   day: number,
//   month: number,
//   year: number,
// ): Date | undefined => {
//   if (
//     day < 1 ||
//     day > 31 ||
//     month < 1 ||
//     month > 12 ||
//     year < 1900 ||
//     year > 2100
//   ) {
//     return undefined;
//   }

//   const date = new Date(year, month - 1, day);

//   if (
//     date.getFullYear() !== year ||
//     date.getMonth() !== month - 1 ||
//     date.getDate() !== day
//   ) {
//     return undefined;
//   }

//   return date;
// };

// /**
//  * ============================================================
//  * DATE → ISO
//  * ============================================================
//  */

// const dateToISO = (date: Date): string => {
//   const year = date.getFullYear();

//   const month = String(date.getMonth() + 1).padStart(2, "0");

//   const day = String(date.getDate()).padStart(2, "0");

//   return `${year}-${month}-${day}`;
// };

// /**
//  * ============================================================
//  * PARSE NUMERIC DATE
//  * ============================================================
//  */

// const parseNumericDate = (
//   dayText: string,
//   monthText: string,
//   yearText: string,
// ): Date | undefined => {
//   return createSafeDate(
//     Number(dayText),
//     Number(monthText),
//     normalizeYear(yearText),
//   );
// };

// /**
//  * ============================================================
//  * PARSE TEXT DATE
//  * ============================================================
//  */

// const parseTextualDate = (
//   dayText: string,
//   monthText: string,
//   yearText: string,
// ): Date | undefined => {
//   const month = MONTHS[monthText.toUpperCase().trim()];

//   if (!month) {
//     return undefined;
//   }

//   return createSafeDate(Number(dayText), month, normalizeYear(yearText));
// };

// /**
//  * ============================================================
//  * FLEXIBLE DATE PARSER
//  * ============================================================
//  *
//  * Supported:
//  *
//  * 18/07/2026
//  * 18-07-2026
//  * 18.07.2026
//  * 18 July 2026
//  * 18 Jul 2026
//  * 2026-07-18
//  */
// const parseFlexibleDate = (value: string): Date | undefined => {
//   const cleaned = value.trim().replace(/\s+/g, " ").replace(/[.,]$/, "");

//   /**
//    * DD/MM/YYYY
//    */
//   let match = cleaned.match(/^(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{2,4})$/);

//   if (match) {
//     return parseNumericDate(match[1], match[2], match[3]);
//   }

//   /**
//    * DD Month YYYY
//    */
//   match = cleaned.match(
//     new RegExp(
//       `^(\\d{1,2})[\\s./-]+(${MONTH_PATTERN})[\\s./-]+(\\d{2,4})$`,
//       "i",
//     ),
//   );

//   if (match) {
//     return parseTextualDate(match[1], match[2], match[3]);
//   }

//   /**
//    * YYYY-MM-DD
//    */
//   match = cleaned.match(/^(\d{4})[\/.\-](\d{1,2})[\/.\-](\d{1,2})$/);

//   if (match) {
//     return createSafeDate(Number(match[3]), Number(match[2]), Number(match[1]));
//   }

//   return undefined;
// };

// /**
//  * ============================================================
//  * DATE REGEX
//  * ============================================================
//  */

// const getDateRegex = (): RegExp => {
//   return new RegExp(
//     [
//       "\\b(?:",

//       /**
//        * DD/MM/YYYY
//        */
//       "\\d{1,2}[\\/.-]\\d{1,2}[\\/.-]\\d{2,4}",

//       "|",

//       /**
//        * DD Month YYYY
//        */
//       `\\d{1,2}[\\s.-]+(?:${MONTH_PATTERN})[\\s.-]+\\d{2,4}`,

//       "|",

//       /**
//        * YYYY-MM-DD
//        */
//       "\\d{4}[\\/.-]\\d{1,2}[\\/.-]\\d{1,2}",

//       ")\\b",
//     ].join(""),
//     "gi",
//   );
// };

// /**
//  * ============================================================
//  * CREATE DATE CANDIDATE
//  * ============================================================
//  */

// const createCandidate = (
//   text: string,
//   rawValue: string,
//   index: number,
//   date: Date,
// ): DateCandidate => {
//   const start = Math.max(0, index - CONTEXT_RADIUS);

//   const end = Math.min(text.length, index + rawValue.length + CONTEXT_RADIUS);

//   return {
//     rawValue,

//     normalizedValue: dateToISO(date),

//     date,

//     index,

//     context: text.slice(start, end),
//   };
// };

// /**
//  * ============================================================
//  * EXTRACT ALL DATE CANDIDATES
//  * ============================================================
//  */

// export const extractDateCandidates = (text: string): DateCandidate[] => {
//   const normalized = normalizeText(text);

//   const candidates: DateCandidate[] = [];

//   const regex = getDateRegex();

//   let match: RegExpExecArray | null;

//   while ((match = regex.exec(normalized)) !== null) {
//     const rawValue = match[0];

//     const date = parseFlexibleDate(rawValue);

//     if (!date) {
//       continue;
//     }

//     candidates.push(createCandidate(normalized, rawValue, match.index, date));
//   }

//   /**
//    * Remove duplicates.
//    */
//   const unique = new Map<string, DateCandidate>();

//   for (const candidate of candidates) {
//     const key = `${candidate.index}-${candidate.normalizedValue}`;

//     if (!unique.has(key)) {
//       unique.set(key, candidate);
//     }
//   }

//   return Array.from(unique.values()).sort((a, b) => a.index - b.index);
// };

// /**
//  * ============================================================
//  * FIND LABEL
//  * ============================================================
//  */

// const findMatchingLabel = (
//   text: string,
//   dateIndex: number,
//   labels: readonly string[],
// ): {
//   label?: string;
//   distance?: number;
// } => {
//   const normalized = normalizeOCRLabelText(text);

//   const start = Math.max(0, dateIndex - CONTEXT_RADIUS);

//   const end = Math.min(normalized.length, dateIndex + CONTEXT_RADIUS);

//   const context = normalized.slice(start, end);

//   let bestLabel: string | undefined;

//   let bestDistance = Number.POSITIVE_INFINITY;

//   for (const label of labels) {
//     const normalizedLabel = normalizeOCRLabelText(label);

//     const index = context.indexOf(normalizedLabel);

//     if (index === -1) {
//       continue;
//     }

//     const distance = Math.abs(dateIndex - start - index);

//     if (distance < bestDistance) {
//       bestDistance = distance;

//       bestLabel = label;
//     }
//   }

//   /**
//    * Additional OCR-tolerant
//    * matching for VALIDITY.
//    */
//   if (
//     !bestLabel &&
//     (context.includes("VALIDITY") ||
//       context.includes("VALIDITV") ||
//       context.includes("VALIDUFIE") ||
//       context.includes("VALIDITY PERIOD"))
//   ) {
//     bestLabel = "VALIDITY PERIOD";

//     bestDistance = 60;
//   }

//   return {
//     label: bestLabel,

//     distance: bestLabel !== undefined ? bestDistance : undefined,
//   };
// };

// /**
//  * ============================================================
//  * LABEL CONFIDENCE
//  * ============================================================
//  */

// const calculateLabelConfidence = (distance?: number): number => {
//   if (distance === undefined) {
//     return 0;
//   }

//   if (distance <= 20) {
//     return 98;
//   }

//   if (distance <= 40) {
//     return 94;
//   }

//   if (distance <= 70) {
//     return 88;
//   }

//   return 80;
// };

// /**
//  * ============================================================
//  * DATE RANGE EXTRACTION
//  * ============================================================
//  */

// const extractDateRangeCandidates = (text: string): DateRangeCandidate[] => {
//   const normalized = normalizeText(text);

//   const ranges: DateRangeCandidate[] = [];

//   const datePattern = [
//     "(",
//     "\\d{1,2}[\\/.-]\\d{1,2}[\\/.-]\\d{2,4}",
//     "|",
//     `\\d{1,2}[\\s.-]+(?:${MONTH_PATTERN})[\\s.-]+\\d{2,4}`,
//     ")",
//   ].join("");

//   /**
//    * Supports:
//    *
//    * 01/04/2025 TO 31/03/2026
//    * 01 Apr 2025 TO 31 Mar 2026
//    * 01-04-2025 - 31-03-2026
//    */
//   const rangeRegex = new RegExp(
//     `(${datePattern})\\s*(?:TO|TILL|UNTIL|THROUGH|[-–—])\\s*(${datePattern})`,
//     "gi",
//   );

//   let match: RegExpExecArray | null;

//   while ((match = rangeRegex.exec(normalized)) !== null) {
//     const startRaw = match[1];

//     const endRaw = match[2];

//     const startDate = parseFlexibleDate(startRaw);

//     const endDate = parseFlexibleDate(endRaw);

//     if (!startDate || !endDate) {
//       continue;
//     }

//     if (endDate < startDate) {
//       continue;
//     }

//     const endIndex = match.index + match[0].lastIndexOf(endRaw);

//     ranges.push({
//       start: createCandidate(normalized, startRaw, match.index, startDate),

//       end: createCandidate(normalized, endRaw, endIndex, endDate),

//       rawValue: match[0],

//       index: match.index,
//     });
//   }

//   return ranges;
// };

// /**
//  * ============================================================
//  * INSURANCE POLICY DATE EXTRACTION
//  * ============================================================
//  *
//  * Priority:
//  *
//  * 1. POLICY PERIOD
//  * 2. PERIOD OF INSURANCE
//  * 3. PERIOD OF COVER
//  * 4. POLICY VALIDITY
//  * 5. Validity / date range
//  *
//  * Example:
//  *
//  * POLICY PERIOD
//  * FROM 00:00 HRS OF
//  * 18 July 2025
//  * TO
//  * 18 July 2026
//  */
// export const extractInsurancePolicyDates = (
//   text: string,
// ): ExtractedDateRange => {
//   const normalized = normalizeSearchText(text);

//   /**
//    * --------------------------------------------------------
//    * Strong insurance policy period
//    * --------------------------------------------------------
//    */
//   const policyRegex = new RegExp(
//     [
//       "(?:POLICY\\s+PERIOD|",
//       "PERIOD\\s+OF\\s+INSURANCE|",
//       "PERIOD\\s+OF\\s+COVER|",
//       "POLICY\\s+VALIDITY)",

//       ".{0,180}?",

//       "(?:FROM|FROM\\s+00:00\\s+HRS\\s+OF)?",

//       "\\s*",

//       "(",

//       "\\d{1,2}[\\/.-]\\d{1,2}[\\/.-]\\d{2,4}",

//       "|",

//       `\\d{1,2}\\s+(?:${MONTH_PATTERN})\\s+\\d{2,4}`,

//       ")",

//       ".{0,180}?",

//       "(?:TO|TILL|UNTIL|THROUGH)",

//       ".{0,120}?",

//       "(",

//       "\\d{1,2}[\\/.-]\\d{1,2}[\\/.-]\\d{2,4}",

//       "|",

//       `\\d{1,2}\\s+(?:${MONTH_PATTERN})\\s+\\d{2,4}`,

//       ")",
//     ].join(""),
//     "i",
//   );

//   const match = normalized.match(policyRegex);

//   if (match?.[1] && match?.[2]) {
//     const issueDate = parseFlexibleDate(match[1]);

//     const expiryDate = parseFlexibleDate(match[2]);

//     if (issueDate && expiryDate && expiryDate >= issueDate) {
//       return {
//         issueDate,

//         expiryDate,

//         rawIssueDate: match[1],

//         rawExpiryDate: match[2],
//       };
//     }
//   }

//   /**
//    * --------------------------------------------------------
//    * Generic insurance range
//    * --------------------------------------------------------
//    */
//   const ranges = extractDateRangeCandidates(normalized);

//   if (ranges.length) {
//     const preferred = ranges.find((range) => {
//       const context = normalized
//         .slice(
//           Math.max(0, range.index - 160),
//           Math.min(
//             normalized.length,
//             range.index + range.rawValue.length + 160,
//           ),
//         )
//         .toUpperCase();

//       return (
//         context.includes("POLICY") ||
//         context.includes("INSURANCE") ||
//         context.includes("VALIDITY") ||
//         context.includes("VALID") ||
//         context.includes("PERIOD")
//       );
//     });

//     const selected = preferred ?? ranges[0];

//     return {
//       issueDate: selected.start.date,

//       expiryDate: selected.end.date,

//       rawIssueDate: selected.start.rawValue,

//       rawExpiryDate: selected.end.rawValue,
//     };
//   }

//   /**
//    * Nothing found.
//    */
//   return {};
// };

// /**
//  * ============================================================
//  * LABELED DATE
//  * ============================================================
//  */

// const extractLabeledDate = (
//   text: string,
//   labels: readonly string[],
// ): OCRDateResult | null => {
//   const candidates = extractDateCandidates(text);

//   const matches = candidates
//     .map((candidate) => {
//       const result = findMatchingLabel(text, candidate.index, labels);

//       if (!result.label) {
//         return null;
//       }

//       return {
//         candidate,

//         label: result.label,

//         confidence: calculateLabelConfidence(result.distance),
//       };
//     })
//     .filter(
//       (
//         value,
//       ): value is {
//         candidate: DateCandidate;
//         label: string;
//         confidence: number;
//       } => value !== null,
//     );

//   if (!matches.length) {
//     return null;
//   }

//   matches.sort((a, b) => b.confidence - a.confidence);

//   const best = matches[0];

//   return {
//     rawValue: best.candidate.rawValue,

//     normalizedValue: best.candidate.normalizedValue,

//     date: best.candidate.date,

//     confidence: best.confidence,

//     matchedLabel: best.label,

//     needsReview: best.confidence < 90,
//   };
// };

// /**
//  * ============================================================
//  * EXPIRY DATE
//  * ============================================================
//  */

// export const extractExpiryDate = (text: string): OCRDateResult | null => {
//   const normalized = normalizeText(text);

//   /**
//    * --------------------------------------------------------
//    * Insurance first
//    * --------------------------------------------------------
//    */
//   const insuranceDates = extractInsurancePolicyDates(normalized);

//   if (insuranceDates.expiryDate) {
//     return {
//       rawValue:
//         insuranceDates.rawExpiryDate ?? dateToISO(insuranceDates.expiryDate),

//       normalizedValue: dateToISO(insuranceDates.expiryDate),

//       date: insuranceDates.expiryDate,

//       confidence: 99,

//       matchedLabel: "POLICY PERIOD",

//       needsReview: false,
//     };
//   }

//   /**
//    * --------------------------------------------------------
//    * Explicit expiry labels
//    * --------------------------------------------------------
//    */
//   const labeled = extractLabeledDate(normalized, EXPIRY_LABELS);

//   if (labeled) {
//     return labeled;
//   }

//   /**
//    * --------------------------------------------------------
//    * Date ranges
//    * --------------------------------------------------------
//    */
//   const ranges = extractDateRangeCandidates(normalized);

//   if (ranges.length) {
//     const preferred = ranges.find((range) => {
//       const context = normalized
//         .slice(
//           Math.max(0, range.index - 120),
//           Math.min(
//             normalized.length,
//             range.index + range.rawValue.length + 120,
//           ),
//         )
//         .toUpperCase();

//       return (
//         context.includes("POLICY") ||
//         context.includes("PERIOD") ||
//         context.includes("VALID") ||
//         context.includes("TAX") ||
//         context.includes("INSURANCE")
//       );
//     });

//     const selected = preferred ?? ranges[0];

//     return {
//       rawValue: selected.end.rawValue,

//       normalizedValue: selected.end.normalizedValue,

//       date: selected.end.date,

//       confidence: preferred ? 94 : 85,

//       matchedLabel: preferred ? "VALIDITY PERIOD" : undefined,

//       needsReview: !preferred,
//     };
//   }

//   /**
//    * --------------------------------------------------------
//    * Generic fallback
//    * --------------------------------------------------------
//    */
//   const candidates = extractDateCandidates(normalized);

//   if (!candidates.length) {
//     return null;
//   }

//   /**
//    * Find issue date first.
//    */
//   const issue = extractLabeledDate(normalized, ISSUE_LABELS);

//   if (issue?.date) {
//     const later = candidates
//       .filter((candidate) => candidate.date > issue.date!)
//       .sort((a, b) => a.date.getTime() - b.date.getTime());

//     if (later.length) {
//       return {
//         rawValue: later[0].rawValue,

//         normalizedValue: later[0].normalizedValue,

//         date: later[0].date,

//         confidence: 65,

//         needsReview: true,
//       };
//     }
//   }

//   /**
//    * Latest date fallback.
//    */
//   if (candidates.length > 1) {
//     const latest = [...candidates].sort(
//       (a, b) => b.date.getTime() - a.date.getTime(),
//     )[0];

//     return {
//       rawValue: latest.rawValue,

//       normalizedValue: latest.normalizedValue,

//       date: latest.date,

//       confidence: 50,

//       needsReview: true,
//     };
//   }

//   return {
//     rawValue: candidates[0].rawValue,

//     normalizedValue: candidates[0].normalizedValue,

//     date: candidates[0].date,

//     confidence: 35,

//     needsReview: true,
//   };
// };

// /**
//  * ============================================================
//  * ISSUE DATE
//  * ============================================================
//  */

// export const extractIssueDate = (text: string): OCRDateResult | null => {
//   const normalized = normalizeText(text);

//   /**
//    * Insurance policy period.
//    */
//   const insuranceDates = extractInsurancePolicyDates(normalized);

//   if (insuranceDates.issueDate) {
//     return {
//       rawValue:
//         insuranceDates.rawIssueDate ?? dateToISO(insuranceDates.issueDate),

//       normalizedValue: dateToISO(insuranceDates.issueDate),

//       date: insuranceDates.issueDate,

//       confidence: 99,

//       matchedLabel: "POLICY PERIOD",

//       needsReview: false,
//     };
//   }

//   /**
//    * Explicit issue labels.
//    */
//   const labeled = extractLabeledDate(normalized, ISSUE_LABELS);

//   if (labeled) {
//     return labeled;
//   }

//   /**
//    * Date range start.
//    */
//   const ranges = extractDateRangeCandidates(normalized);

//   if (ranges.length) {
//     const preferred = ranges.find((range) => {
//       const context = normalized
//         .slice(
//           Math.max(0, range.index - 120),
//           Math.min(
//             normalized.length,
//             range.index + range.rawValue.length + 120,
//           ),
//         )
//         .toUpperCase();

//       return (
//         context.includes("POLICY") ||
//         context.includes("INSURANCE") ||
//         context.includes("VALIDITY") ||
//         context.includes("PERIOD")
//       );
//     });

//     const selected = preferred ?? ranges[0];

//     return {
//       rawValue: selected.start.rawValue,

//       normalizedValue: selected.start.normalizedValue,

//       date: selected.start.date,

//       confidence: preferred ? 94 : 85,

//       matchedLabel: preferred ? "POLICY PERIOD" : "VALIDITY PERIOD",

//       needsReview: !preferred,
//     };
//   }

//   /**
//    * Generic earliest date.
//    */
//   const candidates = extractDateCandidates(normalized);

//   if (!candidates.length) {
//     return null;
//   }

//   const earliest = [...candidates].sort(
//     (a, b) => a.date.getTime() - b.date.getTime(),
//   )[0];

//   return {
//     rawValue: earliest.rawValue,

//     normalizedValue: earliest.normalizedValue,

//     date: earliest.date,

//     confidence: 45,

//     needsReview: true,
//   };
// };

// /**
//  * ============================================================
//  * DOCUMENT DATES
//  * ============================================================
//  */

// export const extractDocumentDates = (text: string) => {
//   const issueDate = extractIssueDate(text);

//   const expiryDate = extractExpiryDate(text);

//   /**
//    * Invalid date relationship.
//    */
//   if (issueDate?.date && expiryDate?.date && expiryDate.date < issueDate.date) {
//     return {
//       issueDate: {
//         ...issueDate,

//         confidence: Math.min(issueDate.confidence ?? 0, 50),

//         needsReview: true,
//       },

//       expiryDate: {
//         ...expiryDate,

//         confidence: Math.min(expiryDate.confidence ?? 0, 50),

//         needsReview: true,
//       },
//     };
//   }

//   return {
//     issueDate,

//     expiryDate,
//   };
// };

// /**
//  * ============================================================
//  * ALL DATES
//  * ============================================================
//  */

// export const extractAllDates = (text: string): OCRDateResult[] => {
//   return extractDateCandidates(text).map((candidate) => ({
//     rawValue: candidate.rawValue,

//     normalizedValue: candidate.normalizedValue,

//     date: candidate.date,

//     confidence: 100,

//     needsReview: false,
//   }));
// };

// /**
//  * ============================================================
//  * ROAD TAX PERIOD
//  * ============================================================
//  */

// export const extractRoadTaxPeriod = (input: string): ExtractedDateRange => {
//   const normalized = normalizeText(input);

//   const ranges = extractDateRangeCandidates(normalized);

//   if (!ranges.length) {
//     return {};
//   }

//   const preferred = ranges.find((range) => {
//     const context = normalized
//       .slice(
//         Math.max(0, range.index - 100),
//         Math.min(normalized.length, range.index + range.rawValue.length + 100),
//       )
//       .toUpperCase();

//     return (
//       context.includes("TAX") ||
//       context.includes("PERIOD") ||
//       context.includes("VALIDITY")
//     );
//   });

//   const selected = preferred ?? ranges[0];

//   return {
//     issueDate: selected.start.date,

//     expiryDate: selected.end.date,

//     rawIssueDate: selected.start.rawValue,

//     rawExpiryDate: selected.end.rawValue,
//   };
// };

// /**
//  * ============================================================
//  * NORMALIZE DATE
//  * ============================================================
//  */

// export const normalizeExtractedDate = (date?: Date): string | undefined => {
//   if (!date) {
//     return undefined;
//   }

//   return dateToISO(date);
// };

// /**
//  * ============================================================
//  * EXPIRY STATUS
//  * ============================================================
//  */

// export const isExpired = (date: Date, now = new Date()): boolean => {
//   const first = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());

//   const second = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());

//   return first < second;
// };

// /**
//  * ============================================================
//  * DAYS REMAINING
//  * ============================================================
//  */

// export const getDaysRemaining = (
//   expiryDate: Date,
//   now = new Date(),
// ): number => {
//   const first = Date.UTC(
//     expiryDate.getFullYear(),
//     expiryDate.getMonth(),
//     expiryDate.getDate(),
//   );

//   const second = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());

//   return Math.round((first - second) / (1000 * 60 * 60 * 24));
// };

// /**
//  * ============================================================
//  * DEFAULT EXPORT
//  * ============================================================
//  */

// export default {
//   extractDateCandidates,

//   extractExpiryDate,

//   extractIssueDate,

//   extractDocumentDates,

//   extractAllDates,

//   extractRoadTaxPeriod,

//   extractInsurancePolicyDates,

//   normalizeExtractedDate,

//   isExpired,

//   getDaysRemaining,
// };

import type { OCRDateResult } from "../../types/ocr.types";

/**
 * ============================================================
 * DATE EXTRACTOR UTILITY
 * ============================================================
 *
 * Phase 6 — OCR & Automatic Document Data Extraction
 *
 * Responsibilities:
 *
 * OCR text
 *    ↓
 * Normalize OCR text
 *    ↓
 * Detect explicit dates
 *    ↓
 * Detect date ranges / validity periods
 *    ↓
 * Detect issue date
 *    ↓
 * Detect expiry date
 *    ↓
 * Validate date relationship
 *
 * IMPORTANT:
 *
 * This utility does NOT decide whether a document is RC,
 * PUC, Insurance, Road Tax etc.
 *
 * Document-specific interpretation is handled by:
 *
 * documentParser.util.ts
 *
 * This utility only focuses on dates.
 */

/**
 * ============================================================
 * TYPES
 * ============================================================
 */

export interface DateCandidate {
  rawValue: string;

  normalizedValue: string;

  date: Date;

  index: number;

  context: string;
}

export interface ExtractedDateRange {
  issueDate?: Date;

  expiryDate?: Date;

  rawIssueDate?: string;

  rawExpiryDate?: string;
}

interface DateRangeCandidate {
  start: DateCandidate;

  end: DateCandidate;

  rawValue: string;

  index: number;

  /**
   * Confidence of the range.
   */
  confidence: number;

  /**
   * Matched context.
   */
  matchedLabel?: string;
}

/**
 * ============================================================
 * MONTHS
 * ============================================================
 */

const MONTHS: Record<string, number> = {
  JAN: 1,
  JANUARY: 1,

  FEB: 2,
  FEBRUARY: 2,

  MAR: 3,
  MARCH: 3,

  APR: 4,
  APRIL: 4,

  MAY: 5,

  JUN: 6,
  JUNE: 6,

  JUL: 7,
  JULY: 7,

  AUG: 8,
  AUGUST: 8,

  SEP: 9,
  SEPT: 9,
  SEPTEMBER: 9,

  OCT: 10,
  OCTOBER: 10,

  NOV: 11,
  NOVEMBER: 11,

  DEC: 12,
  DECEMBER: 12,
};

const MONTH_PATTERN = Object.keys(MONTHS)
  .sort((a, b) => b.length - a.length)
  .join("|");

/**
 * ============================================================
 * LABELS
 * ============================================================
 */

const EXPIRY_LABELS = [
  "VALID UPTO",
  "VALID UP TO",
  "VALID UNTIL",
  "VALID TILL",
  "VALID THROUGH",
  "VALID THRU",

  "EXPIRY DATE",
  "EXPIRATION DATE",
  "DATE OF EXPIRY",

  "EXPIRY",
  "EXPIRATION",

  "VALIDITY UPTO",
  "VALIDITY UP TO",
  "VALIDITY TILL",
  "VALIDITY UNTIL",

  "VALID UPTO DATE",

  "VALIDITY PERIOD UPTO",
  "VALIDITY PERIOD UNTIL",
  "VALIDITY PERIOD",
] as const;

const ISSUE_LABELS = [
  "VALID FROM",
  "VALID FROM DATE",

  "ISSUE DATE",
  "DATE OF ISSUE",
  "ISSUED ON",
  "ISSUED DATE",
  "ISSUE",

  "START DATE",
  "POLICY START DATE",

  "COMMENCEMENT DATE",

  "PAYMENT DATE",
  "TRANSACTION DATE",

  "FROM",
] as const;

/**
 * Labels that identify a validity/compliance period.
 *
 * These are especially important for:
 *
 * - Road Tax
 * - Tax Receipt
 * - Insurance
 * - Permit
 * - Fitness
 * - PUC
 */
const PERIOD_LABELS = [
  "PERIOD",
  "VALIDITY PERIOD",
  "VALIDITY",
  "POLICY PERIOD",
  "PERIOD OF INSURANCE",
  "PERIOD OF COVER",
  "TAX PERIOD",
  "ROAD TAX PERIOD",
  "COVER PERIOD",
  "VALID FROM",
  "VALID UPTO",
] as const;

const CONTEXT_RADIUS = 180;

/**
 * ============================================================
 * OCR TEXT NORMALIZATION
 * ============================================================
 */

/**
 * Normalizes common OCR mistakes without destroying useful
 * characters.
 *
 * Example:
 *
 * VALIDITV
 * VALIDlTY
 *
 * become easier to match.
 */
const normalizeOCRLabelText = (text: string): string => {
  return text
    .toUpperCase()
    .replace(/0/g, "O")
    .replace(/1/g, "I")
    .replace(/5/g, "S")
    .replace(/8/g, "B")
    .replace(/[^A-Z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

/**
 * ============================================================
 * BASIC TEXT NORMALIZATION
 * ============================================================
 */

const normalizeText = (text: string): string => {
  if (!text) {
    return "";
  }

  return text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n+/g, "\n")
    .trim();
};

/**
 * ============================================================
 * DATE-SPECIFIC OCR NORMALIZATION
 * ============================================================
 *
 * IMPORTANT FIX:
 *
 * OCR can split:
 *
 * 31-Mar-2027
 *
 * into:
 *
 * 31-Mar-202
 * 7
 *
 * This function joins the broken year.
 */
const normalizeDateOCRText = (text: string): string => {
  let normalized = normalizeText(text);

  /**
   * --------------------------------------------------------
   * Fix broken 4-digit year after a date separator.
   *
   * 31-Mar-202
   * 7
   *
   * becomes:
   *
   * 31-Mar-2027
   * --------------------------------------------------------
   */
  normalized = normalized.replace(
    /(\d{1,2}[\/.\-](?:\d{1,2}|[A-Za-z]{3,9})[\/.\-]\d{3})\s*\n\s*(\d)/gi,
    "$1$2",
  );

  /**
   * --------------------------------------------------------
   * Numeric date with broken year.
   *
   * 31/03/202
   * 7
   *
   * becomes:
   *
   * 31/03/2027
   * --------------------------------------------------------
   */
  normalized = normalized.replace(
    /(\d{1,2}[\/.\-]\d{1,2}[\/.\-]\d{3})\s*\n\s*(\d)/g,
    "$1$2",
  );

  /**
   * --------------------------------------------------------
   * Join date ranges split across lines.
   *
   * 01-Apr-2026
   * to
   * 31-Mar-2027
   *
   * is converted into a searchable one-line representation.
   * --------------------------------------------------------
   */
  normalized = normalized.replace(
    /(\d)\s*\n\s*(TO|TILL|UNTIL|THROUGH)\s*\n\s*(\d)/gi,
    "$1 $2 $3",
  );

  /**
   * --------------------------------------------------------
   * Multiple spaces.
   * --------------------------------------------------------
   */
  normalized = normalized.replace(/[ \t]+/g, " ");

  return normalized.trim();
};

/**
 * Search normalization.
 */
const normalizeSearchText = (text: string): string => {
  return normalizeDateOCRText(text)
    .toUpperCase()
    .replace(/[|]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

/**
 * ============================================================
 * YEAR NORMALIZATION
 * ============================================================
 */

const normalizeYear = (yearText: string): number => {
  const year = Number(yearText);

  if (yearText.length === 4) {
    return year;
  }

  return year <= 69 ? 2000 + year : 1900 + year;
};

/**
 * ============================================================
 * SAFE DATE
 * ============================================================
 *
 * Prevents JavaScript from silently converting:
 *
 * 31/02/2026
 *
 * into a March date.
 */
const createSafeDate = (
  day: number,
  month: number,
  year: number,
): Date | undefined => {
  if (
    day < 1 ||
    day > 31 ||
    month < 1 ||
    month > 12 ||
    year < 1900 ||
    year > 2100
  ) {
    return undefined;
  }

  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return undefined;
  }

  return date;
};

/**
 * ============================================================
 * DATE → ISO
 * ============================================================
 *
 * Date-only representation.
 *
 * IMPORTANT:
 *
 * We deliberately do NOT use toISOString() here because
 * timezone conversion can move an Indian date to the previous
 * UTC date.
 */
const dateToISO = (date: Date): string => {
  const year = date.getFullYear();

  const month = String(date.getMonth() + 1).padStart(2, "0");

  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

/**
 * ============================================================
 * PARSE NUMERIC DATE
 * ============================================================
 */

const parseNumericDate = (
  dayText: string,
  monthText: string,
  yearText: string,
): Date | undefined => {
  return createSafeDate(
    Number(dayText),
    Number(monthText),
    normalizeYear(yearText),
  );
};

/**
 * ============================================================
 * PARSE TEXTUAL DATE
 * ============================================================
 */

const parseTextualDate = (
  dayText: string,
  monthText: string,
  yearText: string,
): Date | undefined => {
  const month = MONTHS[monthText.toUpperCase().trim()];

  if (!month) {
    return undefined;
  }

  return createSafeDate(Number(dayText), month, normalizeYear(yearText));
};

/**
 * ============================================================
 * FLEXIBLE DATE PARSER
 * ============================================================
 *
 * Supports:
 *
 * 18/07/2026
 * 18-07-2026
 * 18.07.2026
 *
 * 18 July 2026
 * 18 Jul 2026
 *
 * 2026-07-18
 */
export const parseFlexibleDate = (value: string): Date | undefined => {
  const cleaned = value.trim().replace(/\s+/g, " ").replace(/[.,]$/, "");

  /**
   * DD/MM/YYYY
   */
  let match = cleaned.match(/^(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{2,4})$/);

  if (match) {
    return parseNumericDate(match[1], match[2], match[3]);
  }

  /**
   * DD Month YYYY
   */
  match = cleaned.match(
    new RegExp(
      `^(\\d{1,2})[\\s./-]+(${MONTH_PATTERN})[\\s./-]+(\\d{2,4})$`,
      "i",
    ),
  );

  if (match) {
    return parseTextualDate(match[1], match[2], match[3]);
  }

  /**
   * YYYY-MM-DD
   */
  match = cleaned.match(/^(\d{4})[\/.\-](\d{1,2})[\/.\-](\d{1,2})$/);

  if (match) {
    return createSafeDate(Number(match[3]), Number(match[2]), Number(match[1]));
  }

  return undefined;
};

/**
 * ============================================================
 * DATE REGEX
 * ============================================================
 */

const getDateRegex = (): RegExp => {
  return new RegExp(
    [
      "\\b(?:",

      /**
       * DD/MM/YYYY
       */
      "\\d{1,2}[\\/.-]\\d{1,2}[\\/.-]\\d{2,4}",

      "|",

      /**
       * DD Month YYYY
       */
      `\\d{1,2}[\\s.-]+(?:${MONTH_PATTERN})[\\s.-]+\\d{2,4}`,

      "|",

      /**
       * YYYY-MM-DD
       */
      "\\d{4}[\\/.-]\\d{1,2}[\\/.-]\\d{1,2}",

      ")\\b",
    ].join(""),
    "gi",
  );
};

/**
 * ============================================================
 * CREATE DATE CANDIDATE
 * ============================================================
 */

const createCandidate = (
  text: string,
  rawValue: string,
  index: number,
  date: Date,
): DateCandidate => {
  const start = Math.max(0, index - CONTEXT_RADIUS);

  const end = Math.min(text.length, index + rawValue.length + CONTEXT_RADIUS);

  return {
    rawValue,

    normalizedValue: dateToISO(date),

    date,

    index,

    context: text.slice(start, end),
  };
};

/**
 * ============================================================
 * EXTRACT ALL DATE CANDIDATES
 * ============================================================
 */

export const extractDateCandidates = (text: string): DateCandidate[] => {
  const normalized = normalizeDateOCRText(text);

  const candidates: DateCandidate[] = [];

  const regex = getDateRegex();

  let match: RegExpExecArray | null;

  while ((match = regex.exec(normalized)) !== null) {
    const rawValue = match[0];

    const date = parseFlexibleDate(rawValue);

    if (!date) {
      continue;
    }

    candidates.push(createCandidate(normalized, rawValue, match.index, date));
  }

  /**
   * Remove duplicates.
   */
  const unique = new Map<string, DateCandidate>();

  for (const candidate of candidates) {
    const key = `${candidate.index}-${candidate.normalizedValue}`;

    if (!unique.has(key)) {
      unique.set(key, candidate);
    }
  }

  return Array.from(unique.values()).sort((a, b) => a.index - b.index);
};

/**
 * ============================================================
 * FIND LABEL
 * ============================================================
 */

const findMatchingLabel = (
  text: string,
  dateIndex: number,
  labels: readonly string[],
): {
  label?: string;

  distance?: number;
} => {
  const normalized = normalizeOCRLabelText(text);

  const start = Math.max(0, dateIndex - CONTEXT_RADIUS);

  const end = Math.min(normalized.length, dateIndex + CONTEXT_RADIUS);

  const context = normalized.slice(start, end);

  let bestLabel: string | undefined;

  let bestDistance = Number.POSITIVE_INFINITY;

  for (const label of labels) {
    const normalizedLabel = normalizeOCRLabelText(label);

    const index = context.indexOf(normalizedLabel);

    if (index === -1) {
      continue;
    }

    const distance = Math.abs(dateIndex - start - index);

    if (distance < bestDistance) {
      bestDistance = distance;

      bestLabel = label;
    }
  }

  /**
   * OCR-tolerant matching.
   */
  if (
    !bestLabel &&
    (context.includes("VALIDITY") ||
      context.includes("VALIDITV") ||
      context.includes("VALIDUFIE") ||
      context.includes("VALIDITY PERIOD"))
  ) {
    bestLabel = "VALIDITY PERIOD";

    bestDistance = 60;
  }

  return {
    label: bestLabel,

    distance: bestLabel !== undefined ? bestDistance : undefined,
  };
};

/**
 * ============================================================
 * LABEL CONFIDENCE
 * ============================================================
 */

const calculateLabelConfidence = (distance?: number): number => {
  if (distance === undefined) {
    return 0;
  }

  if (distance <= 20) {
    return 98;
  }

  if (distance <= 40) {
    return 94;
  }

  if (distance <= 70) {
    return 88;
  }

  return 80;
};

/**
 * ============================================================
 * RANGE LABEL DETECTION
 * ============================================================
 */

const findPeriodLabel = (
  text: string,
  rangeIndex: number,
): {
  label?: string;

  confidence: number;
} => {
  const normalized = normalizeOCRLabelText(text);

  const start = Math.max(0, rangeIndex - CONTEXT_RADIUS);

  const end = Math.min(normalized.length, rangeIndex + CONTEXT_RADIUS);

  const context = normalized.slice(start, end);

  let bestLabel: string | undefined;

  let bestDistance = Number.POSITIVE_INFINITY;

  for (const label of PERIOD_LABELS) {
    const normalizedLabel = normalizeOCRLabelText(label);

    const index = context.indexOf(normalizedLabel);

    if (index === -1) {
      continue;
    }

    const absoluteIndex = start + index;

    const distance = Math.abs(rangeIndex - absoluteIndex);

    if (distance < bestDistance) {
      bestDistance = distance;

      bestLabel = label;
    }
  }

  if (!bestLabel) {
    return {
      confidence: 0,
    };
  }

  if (bestDistance <= 30) {
    return {
      label: bestLabel,

      confidence: 99,
    };
  }

  if (bestDistance <= 70) {
    return {
      label: bestLabel,

      confidence: 94,
    };
  }

  return {
    label: bestLabel,

    confidence: 88,
  };
};

/**
 * ============================================================
 * DATE RANGE EXTRACTION
 * ============================================================
 *
 * IMPORTANT:
 *
 * This is the main fix for your real OCR document.
 *
 * Example:
 *
 * 01-Apr-2026 to 31-Mar-2027
 *
 * returns:
 *
 * issueDate  = 01-Apr-2026
 * expiryDate = 31-Mar-2027
 */
export const extractDateRangeCandidates = (
  text: string,
): DateRangeCandidate[] => {
  const normalized = normalizeDateOCRText(text);

  const ranges: DateRangeCandidate[] = [];

  const datePattern = [
    "(",

    /**
     * DD/MM/YYYY
     */
    "\\d{1,2}[\\/.-]\\d{1,2}[\\/.-]\\d{2,4}",

    "|",

    /**
     * DD Month YYYY
     */
    `\\d{1,2}[\\s.-]+(?:${MONTH_PATTERN})[\\s.-]+\\d{2,4}`,

    ")",
  ].join("");

  /**
   * Supports:
   *
   * 01/04/2026 TO 31/03/2027
   *
   * 01-Apr-2026 to 31-Mar-2027
   *
   * 01 Apr 2026 - 31 Mar 2027
   *
   * 01-Apr-2026
   * TO
   * 31-Mar-2027
   */
  const rangeRegex = new RegExp(
    `(${datePattern})\\s*(?:TO|TILL|UNTIL|THROUGH|[-–—])\\s*(${datePattern})`,
    "gi",
  );

  let match: RegExpExecArray | null;

  while ((match = rangeRegex.exec(normalized)) !== null) {
    const startRaw = match[1];

    const endRaw = match[2];

    const startDate = parseFlexibleDate(startRaw);

    const endDate = parseFlexibleDate(endRaw);

    if (!startDate || !endDate) {
      continue;
    }

    /**
     * Expiry cannot be before issue.
     */
    if (endDate < startDate) {
      continue;
    }

    const endIndex = match.index + match[0].lastIndexOf(endRaw);

    const period = findPeriodLabel(normalized, match.index);

    ranges.push({
      start: createCandidate(normalized, startRaw, match.index, startDate),

      end: createCandidate(normalized, endRaw, endIndex, endDate),

      rawValue: match[0],

      index: match.index,

      confidence: period.confidence || 80,

      matchedLabel: period.label,
    });
  }

  return ranges;
};

/**
 * ============================================================
 * FIND BEST DATE RANGE
 * ============================================================
 */
const findBestDateRange = (
  text: string,
  preferredKeywords: readonly string[] = [],
): DateRangeCandidate | null => {
  const normalized = normalizeSearchText(text);

  const ranges = extractDateRangeCandidates(normalized);

  if (!ranges.length) {
    return null;
  }

  /**
   * Prefer ranges having explicit period labels.
   */
  const labeled = ranges.filter((range) => range.matchedLabel);

  if (labeled.length) {
    return labeled.sort((a, b) => b.confidence - a.confidence)[0];
  }

  /**
   * Prefer document-specific keywords.
   */
  const keywordRanges = ranges.filter((range) => {
    const context = normalized
      .slice(
        Math.max(0, range.index - 180),
        Math.min(normalized.length, range.index + range.rawValue.length + 180),
      )
      .toUpperCase();

    return preferredKeywords.some((keyword) => context.includes(keyword));
  });

  if (keywordRanges.length) {
    return keywordRanges[0];
  }

  return ranges[0];
};

/**
 * ============================================================
 * INSURANCE POLICY DATE EXTRACTION
 * ============================================================
 */
export const extractInsurancePolicyDates = (
  text: string,
): ExtractedDateRange => {
  const normalized = normalizeSearchText(text);

  /**
   * --------------------------------------------------------
   * Strong policy period
   * --------------------------------------------------------
   */
  const range = findBestDateRange(normalized, [
    "POLICY",
    "INSURANCE",
    "PERIOD",
    "VALIDITY",
    "COVER",
  ]);

  if (range) {
    const context = normalized
      .slice(
        Math.max(0, range.index - 180),
        Math.min(normalized.length, range.index + range.rawValue.length + 180),
      )
      .toUpperCase();

    if (
      context.includes("POLICY") ||
      context.includes("INSURANCE") ||
      context.includes("PERIOD") ||
      context.includes("VALIDITY") ||
      context.includes("COVER")
    ) {
      return {
        issueDate: range.start.date,

        expiryDate: range.end.date,

        rawIssueDate: range.start.rawValue,

        rawExpiryDate: range.end.rawValue,
      };
    }
  }

  return {};
};

/**
 * ============================================================
 * LABELED DATE
 * ============================================================
 */

const extractLabeledDate = (
  text: string,
  labels: readonly string[],
): OCRDateResult | null => {
  const candidates = extractDateCandidates(text);

  const matches = candidates
    .map((candidate) => {
      const result = findMatchingLabel(text, candidate.index, labels);

      if (!result.label) {
        return null;
      }

      return {
        candidate,

        label: result.label,

        confidence: calculateLabelConfidence(result.distance),
      };
    })
    .filter(
      (
        value,
      ): value is {
        candidate: DateCandidate;
        label: string;
        confidence: number;
      } => value !== null,
    );

  if (!matches.length) {
    return null;
  }

  matches.sort((a, b) => b.confidence - a.confidence);

  const best = matches[0];

  return {
    rawValue: best.candidate.rawValue,

    normalizedValue: best.candidate.normalizedValue,

    date: best.candidate.date,

    confidence: best.confidence,

    matchedLabel: best.label,

    needsReview: best.confidence < 90,
  };
};

/**
 * ============================================================
 * EXPLICIT EXPIRY DATE
 * ============================================================
 */
const extractExplicitExpiryDate = (text: string): OCRDateResult | null => {
  return extractLabeledDate(text, EXPIRY_LABELS);
};

/**
 * ============================================================
 * EXPLICIT ISSUE DATE
 * ============================================================
 */
const extractExplicitIssueDate = (text: string): OCRDateResult | null => {
  return extractLabeledDate(text, ISSUE_LABELS);
};

/**
 * ============================================================
 * EXPIRY DATE
 * ============================================================
 *
 * PRIORITY:
 *
 * 1. Explicit expiry label
 * 2. Document validity period
 * 3. Road-tax period
 * 4. Generic date after issue
 * 5. Latest date fallback
 *
 * IMPORTANT:
 *
 * Payment Date / Transaction Date must NOT automatically
 * become expiryDate.
 */
export const extractExpiryDate = (text: string): OCRDateResult | null => {
  const normalized = normalizeDateOCRText(text);

  /**
   * --------------------------------------------------------
   * 1. Explicit expiry label
   * --------------------------------------------------------
   *
   * Example:
   *
   * VALID UPTO: 31/03/2027
   */
  const explicit = extractExplicitExpiryDate(normalized);

  if (explicit) {
    return explicit;
  }

  /**
   * --------------------------------------------------------
   * 2. Insurance / policy period
   * --------------------------------------------------------
   */
  const insurance = extractInsurancePolicyDates(normalized);

  if (insurance.expiryDate) {
    return {
      rawValue: insurance.rawExpiryDate ?? dateToISO(insurance.expiryDate),

      normalizedValue: dateToISO(insurance.expiryDate),

      date: insurance.expiryDate,

      confidence: 99,

      matchedLabel: "POLICY PERIOD",

      needsReview: false,
    };
  }

  /**
   * --------------------------------------------------------
   * 3. Generic validity / tax period
   * --------------------------------------------------------
   *
   * This is the important fix for:
   *
   * TAX RECEIPT
   * Period
   * 01-Apr-2026 to 31-Mar-2027
   */
  const periodRange = findBestDateRange(normalized, [
    "PERIOD",
    "VALIDITY",
    "TAX",
    "ROAD TAX",
    "POLICY",
    "INSURANCE",
    "COVER",
  ]);

  if (periodRange) {
    return {
      rawValue: periodRange.end.rawValue,

      normalizedValue: periodRange.end.normalizedValue,

      date: periodRange.end.date,

      confidence: periodRange.confidence,

      matchedLabel: periodRange.matchedLabel ?? "VALIDITY PERIOD",

      needsReview: periodRange.confidence < 90,
    };
  }

  /**
   * --------------------------------------------------------
   * 4. Generic fallback after issue date
   * --------------------------------------------------------
   */
  const issue = extractExplicitIssueDate(normalized);

  const candidates = extractDateCandidates(normalized);

  if (issue?.date) {
    const later = candidates
      .filter((candidate) => candidate.date > issue.date!)
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    if (later.length) {
      return {
        rawValue: later[0].rawValue,

        normalizedValue: later[0].normalizedValue,

        date: later[0].date,

        confidence: 65,

        needsReview: true,
      };
    }
  }

  /**
   * --------------------------------------------------------
   * 5. Latest date fallback
   * --------------------------------------------------------
   *
   * Low confidence because this can include payment dates,
   * transaction dates etc.
   */
  if (candidates.length > 1) {
    const latest = [...candidates].sort(
      (a, b) => b.date.getTime() - a.date.getTime(),
    )[0];

    return {
      rawValue: latest.rawValue,

      normalizedValue: latest.normalizedValue,

      date: latest.date,

      confidence: 45,

      needsReview: true,
    };
  }

  if (candidates.length === 1) {
    return {
      rawValue: candidates[0].rawValue,

      normalizedValue: candidates[0].normalizedValue,

      date: candidates[0].date,

      confidence: 30,

      needsReview: true,
    };
  }

  return null;
};

/**
 * ============================================================
 * ISSUE DATE
 * ============================================================
 */
export const extractIssueDate = (text: string): OCRDateResult | null => {
  const normalized = normalizeDateOCRText(text);

  /**
   * --------------------------------------------------------
   * 1. Explicit issue date
   * --------------------------------------------------------
   */
  const explicit = extractExplicitIssueDate(normalized);

  /**
   * Do not immediately return PAYMENT DATE because it may
   * simply be a transaction timestamp.
   *
   * Prefer validity period first.
   */
  if (
    explicit &&
    explicit.matchedLabel !== "PAYMENT DATE" &&
    explicit.matchedLabel !== "TRANSACTION DATE"
  ) {
    return explicit;
  }

  /**
   * --------------------------------------------------------
   * 2. Policy / validity / tax period
   * --------------------------------------------------------
   *
   * For:
   *
   * 01-Apr-2026 to 31-Mar-2027
   *
   * issueDate = 01-Apr-2026
   */
  const periodRange = findBestDateRange(normalized, [
    "PERIOD",
    "VALIDITY",
    "TAX",
    "ROAD TAX",
    "POLICY",
    "INSURANCE",
    "COVER",
  ]);

  if (periodRange) {
    return {
      rawValue: periodRange.start.rawValue,

      normalizedValue: periodRange.start.normalizedValue,

      date: periodRange.start.date,

      confidence: periodRange.confidence,

      matchedLabel: periodRange.matchedLabel ?? "VALIDITY PERIOD",

      needsReview: periodRange.confidence < 90,
    };
  }

  /**
   * --------------------------------------------------------
   * 3. Payment / transaction date
   * --------------------------------------------------------
   *
   * Only use as a fallback.
   */
  if (explicit) {
    return {
      ...explicit,

      confidence: Math.min(explicit.confidence ?? 50, 70),

      needsReview: true,
    };
  }

  /**
   * --------------------------------------------------------
   * 4. Earliest date fallback
   * --------------------------------------------------------
   */
  const candidates = extractDateCandidates(normalized);

  if (!candidates.length) {
    return null;
  }

  const earliest = [...candidates].sort(
    (a, b) => a.date.getTime() - b.date.getTime(),
  )[0];

  return {
    rawValue: earliest.rawValue,

    normalizedValue: earliest.normalizedValue,

    date: earliest.date,

    confidence: 40,

    needsReview: true,
  };
};

/**
 * ============================================================
 * DOCUMENT DATES
 * ============================================================
 *
 * This is the recommended method for documentParser.util.ts.
 */
export const extractDocumentDates = (
  text: string,
): {
  issueDate: OCRDateResult | null;

  expiryDate: OCRDateResult | null;
} => {
  const normalized = normalizeDateOCRText(text);

  /**
   * --------------------------------------------------------
   * FIRST PRIORITY: date range
   * --------------------------------------------------------
   *
   * If a document explicitly contains:
   *
   * 01-Apr-2026 to 31-Mar-2027
   *
   * the range must win over Payment Date / Transaction Date.
   */
  const periodRange = findBestDateRange(normalized, [
    "PERIOD",
    "VALIDITY",
    "TAX",
    "ROAD TAX",
    "POLICY",
    "INSURANCE",
    "COVER",
  ]);

  if (periodRange) {
    const issueDate: OCRDateResult = {
      rawValue: periodRange.start.rawValue,

      normalizedValue: periodRange.start.normalizedValue,

      date: periodRange.start.date,

      confidence: periodRange.confidence,

      matchedLabel: periodRange.matchedLabel ?? "VALIDITY PERIOD",

      needsReview: periodRange.confidence < 90,
    };

    const expiryDate: OCRDateResult = {
      rawValue: periodRange.end.rawValue,

      normalizedValue: periodRange.end.normalizedValue,

      date: periodRange.end.date,

      confidence: periodRange.confidence,

      matchedLabel: periodRange.matchedLabel ?? "VALIDITY PERIOD",

      needsReview: periodRange.confidence < 90,
    };

    return {
      issueDate,

      expiryDate,
    };
  }

  /**
   * --------------------------------------------------------
   * SECOND PRIORITY: explicit labels
   * --------------------------------------------------------
   */
  const issueDate = extractIssueDate(normalized);

  const expiryDate = extractExpiryDate(normalized);

  /**
   * --------------------------------------------------------
   * Validate relationship
   * --------------------------------------------------------
   */
  if (issueDate?.date && expiryDate?.date && expiryDate.date < issueDate.date) {
    return {
      issueDate: {
        ...issueDate,

        confidence: Math.min(issueDate.confidence ?? 50, 50),

        needsReview: true,
      },

      expiryDate: {
        ...expiryDate,

        confidence: Math.min(expiryDate.confidence ?? 50, 50),

        needsReview: true,
      },
    };
  }

  return {
    issueDate,

    expiryDate,
  };
};

/**
 * ============================================================
 * ALL DATES
 * ============================================================
 */

export const extractAllDates = (text: string): OCRDateResult[] => {
  return extractDateCandidates(text).map((candidate) => ({
    rawValue: candidate.rawValue,

    normalizedValue: candidate.normalizedValue,

    date: candidate.date,

    confidence: 100,

    needsReview: false,
  }));
};

/**
 * ============================================================
 * ROAD TAX PERIOD
 * ============================================================
 *
 * Specifically handles:
 *
 * TAX RECEIPT
 * Transport Department
 *
 * Period
 * 01-Apr-2026 to 31-Mar-2027
 *
 * Result:
 *
 * issueDate  = 01-Apr-2026
 * expiryDate = 31-Mar-2027
 */
export const extractRoadTaxPeriod = (input: string): ExtractedDateRange => {
  const normalized = normalizeDateOCRText(input);

  const range = findBestDateRange(normalized, [
    "TAX",
    "PERIOD",
    "ROAD TAX",
    "MV TAX",
    "TAX RECEIPT",
  ]);

  if (!range) {
    return {};
  }

  return {
    issueDate: range.start.date,

    expiryDate: range.end.date,

    rawIssueDate: range.start.rawValue,

    rawExpiryDate: range.end.rawValue,
  };
};

/**
 * ============================================================
 * GENERIC VALIDITY PERIOD
 * ============================================================
 *
 * Useful for:
 *
 * PUC
 * Insurance
 * Fitness
 * Permit
 * Road Tax
 */
export const extractValidityPeriod = (input: string): ExtractedDateRange => {
  const normalized = normalizeDateOCRText(input);

  const range = findBestDateRange(normalized, [
    "VALIDITY",
    "VALID",
    "PERIOD",
    "POLICY",
    "INSURANCE",
    "TAX",
    "COVER",
  ]);

  if (!range) {
    return {};
  }

  return {
    issueDate: range.start.date,

    expiryDate: range.end.date,

    rawIssueDate: range.start.rawValue,

    rawExpiryDate: range.end.rawValue,
  };
};

/**
 * ============================================================
 * NORMALIZE EXTRACTED DATE
 * ============================================================
 */
export const normalizeExtractedDate = (date?: Date): string | undefined => {
  if (!date) {
    return undefined;
  }

  return dateToISO(date);
};

/**
 * ============================================================
 * DATE ONLY COMPARISON
 * ============================================================
 *
 * Prevents timezone-related date shifting.
 */
const dateOnlyTimestamp = (date: Date): number => {
  return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
};

/**
 * ============================================================
 * IS EXPIRED
 * ============================================================
 */
export const isExpired = (date: Date, now = new Date()): boolean => {
  return dateOnlyTimestamp(date) < dateOnlyTimestamp(now);
};

/**
 * ============================================================
 * DAYS REMAINING
 * ============================================================
 */
export const getDaysRemaining = (
  expiryDate: Date,
  now = new Date(),
): number => {
  return Math.round(
    (dateOnlyTimestamp(expiryDate) - dateOnlyTimestamp(now)) /
      (1000 * 60 * 60 * 24),
  );
};

/**
 * ============================================================
 * VALIDATE EXTRACTED DATE
 * ============================================================
 *
 * Used by documentParser.service.ts.
 */
export const validateExtractedDate = (
  date?: Date,
): {
  valid: boolean;

  reason?: string;
} => {
  if (!date) {
    return {
      valid: false,

      reason: "Date could not be extracted.",
    };
  }

  if (Number.isNaN(date.getTime())) {
    return {
      valid: false,

      reason: "Extracted date is invalid.",
    };
  }

  const year = date.getFullYear();

  if (year < 1900 || year > 2100) {
    return {
      valid: false,

      reason: "Extracted date is outside the supported year range.",
    };
  }

  return {
    valid: true,
  };
};

/**
 * ============================================================
 * VALIDATE DATE RANGE
 * ============================================================
 */
export const validateDateRange = (
  issueDate?: Date,
  expiryDate?: Date,
): {
  valid: boolean;

  reason?: string;
} => {
  if (issueDate && !validateExtractedDate(issueDate).valid) {
    return {
      valid: false,

      reason: "Extracted issue date is invalid.",
    };
  }

  if (expiryDate && !validateExtractedDate(expiryDate).valid) {
    return {
      valid: false,

      reason: "Extracted expiry date is invalid.",
    };
  }

  if (
    issueDate &&
    expiryDate &&
    dateOnlyTimestamp(expiryDate) < dateOnlyTimestamp(issueDate)
  ) {
    return {
      valid: false,

      reason: "Expiry date must be after issue date.",
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
  parseFlexibleDate,

  extractDateCandidates,

  extractDateRangeCandidates,

  extractExpiryDate,

  extractIssueDate,

  extractDocumentDates,

  extractAllDates,

  extractRoadTaxPeriod,

  extractValidityPeriod,

  extractInsurancePolicyDates,

  normalizeExtractedDate,

  validateExtractedDate,

  validateDateRange,

  isExpired,

  getDaysRemaining,
};
