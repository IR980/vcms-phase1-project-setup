/**
 * ============================================================
 * OCR CONFIGURATION
 * ============================================================
 *
 * Phase 7 — OCR & Automatic Document Data Extraction
 *
 * This file contains ONLY OCR configuration.
 *
 * The actual OCR processing will be implemented separately in:
 *
 * server/src/services/ocr.service.ts
 *
 * Keeping configuration separate makes it easier to change
 * the OCR provider later without modifying the document module.
 */

/**
 * ============================================================
 * OCR PROVIDER
 * ============================================================
 *
 * Currently the project is prepared for a pluggable OCR
 * architecture.
 *
 * We intentionally keep the provider configurable through
 * environment variables.
 */
export enum OCRProvider {
  TESSERACT = "tesseract",

  GOOGLE_VISION = "google_vision",

  AWS_TEXTRACT = "aws_textract",

  AZURE_DOCUMENT_INTELLIGENCE = "azure_document_intelligence",
}

/**
 * ============================================================
 * OCR CONFIG INTERFACE
 * ============================================================
 */
export interface OCRConfig {
  /**
   * OCR provider.
   */
  provider: OCRProvider;

  /**
   * Whether OCR processing is enabled.
   */
  enabled: boolean;

  /**
   * Supported languages.
   *
   * Examples:
   *
   * eng
   * hin
   */
  languages: string[];

  /**
   * Maximum file size allowed for OCR.
   *
   * Value is in bytes.
   */
  maxFileSize: number;

  /**
   * OCR processing timeout.
   *
   * Value is in milliseconds.
   */
  timeout: number;

  /**
   * Whether OCR should automatically run after
   * document upload.
   */
  processAfterUpload: boolean;
}

/**
 * ============================================================
 * ENVIRONMENT HELPERS
 * ============================================================
 */

/**
 * Convert environment string to boolean.
 */
const parseBoolean = (
  value: string | undefined,
  defaultValue: boolean,
): boolean => {
  if (value === undefined) {
    return defaultValue;
  }

  return value.toLowerCase() === "true";
};

/**
 * Convert environment string to number.
 */
const parseNumber = (
  value: string | undefined,
  defaultValue: number,
): number => {
  if (!value) {
    return defaultValue;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : defaultValue;
};

/**
 * ============================================================
 * OCR PROVIDER
 * ============================================================
 */
const configuredProvider = process.env.OCR_PROVIDER?.trim();

/**
 * Validate provider.
 */
const getOCRProvider = (): OCRProvider => {
  switch (configuredProvider) {
    case OCRProvider.TESSERACT:
      return OCRProvider.TESSERACT;

    case OCRProvider.GOOGLE_VISION:
      return OCRProvider.GOOGLE_VISION;

    case OCRProvider.AWS_TEXTRACT:
      return OCRProvider.AWS_TEXTRACT;

    case OCRProvider.AZURE_DOCUMENT_INTELLIGENCE:
      return OCRProvider.AZURE_DOCUMENT_INTELLIGENCE;

    default:
      /**
       * Tesseract is the default provider for
       * local development.
       */
      return OCRProvider.TESSERACT;
  }
};

/**
 * ============================================================
 * OCR LANGUAGES
 * ============================================================
 *
 * Default:
 *
 * English + Hindi
 *
 * We keep this configurable because Indian vehicle
 * documents may contain both languages.
 */
const getOCRLanguages = (): string[] => {
  const value = process.env.OCR_LANGUAGES?.trim();

  if (!value) {
    return ["eng", "hin"];
  }

  return value
    .split(",")
    .map((language) => language.trim())
    .filter(Boolean);
};

/**
 * ============================================================
 * OCR CONFIG
 * ============================================================
 */
export const ocrConfig: OCRConfig = {
  /**
   * Provider.
   */
  provider: getOCRProvider(),

  /**
   * OCR enabled.
   */
  enabled: parseBoolean(process.env.OCR_ENABLED, true),

  /**
   * OCR languages.
   */
  languages: getOCRLanguages(),

  /**
   * Maximum OCR file size.
   *
   * Default: 10 MB
   */
  maxFileSize: parseNumber(process.env.OCR_MAX_FILE_SIZE, 10 * 1024 * 1024),

  /**
   * OCR timeout.
   *
   * Default: 60 seconds.
   */
  timeout: parseNumber(process.env.OCR_TIMEOUT, 60_000),

  /**
   * Automatically process uploaded
   * document after Cloudinary upload.
   */
  processAfterUpload: parseBoolean(process.env.OCR_PROCESS_AFTER_UPLOAD, true),
};

/**
 * ============================================================
 * OCR SUPPORTED MIME TYPES
 * ============================================================
 *
 * These match the document upload types already supported
 * by the Document module.
 */
export const OCR_SUPPORTED_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

/**
 * ============================================================
 * OCR SUPPORTED MIME TYPE CHECK
 * ============================================================
 */
export const isOCRSupportedMimeType = (mimeType: string): boolean => {
  return OCR_SUPPORTED_MIME_TYPES.includes(
    mimeType as (typeof OCR_SUPPORTED_MIME_TYPES)[number],
  );
};

/**
 * ============================================================
 * OCR CONFIG VALIDATION
 * ============================================================
 *
 * This function is useful during application startup.
 */
export const validateOCRConfig = (): void => {
  /**
   * OCR disabled:
   *
   * No further validation required.
   */
  if (!ocrConfig.enabled) {
    return;
  }

  /**
   * Validate file size.
   */
  if (ocrConfig.maxFileSize <= 0) {
    throw new Error("OCR_MAX_FILE_SIZE must be greater than 0");
  }

  /**
   * Validate timeout.
   */
  if (ocrConfig.timeout <= 0) {
    throw new Error("OCR_TIMEOUT must be greater than 0");
  }

  /**
   * Validate languages.
   */
  if (ocrConfig.languages.length === 0) {
    throw new Error("OCR_LANGUAGES must contain at least one language");
  }
};

/**
 * ============================================================
 * DEBUG INFORMATION
 * ============================================================
 *
 * Do NOT log API keys or credentials here.
 */
export const getOCRDebugConfig = () => {
  return {
    provider: ocrConfig.provider,

    enabled: ocrConfig.enabled,

    languages: ocrConfig.languages,

    maxFileSize: ocrConfig.maxFileSize,

    timeout: ocrConfig.timeout,

    processAfterUpload: ocrConfig.processAfterUpload,
  };
};

export default ocrConfig;
