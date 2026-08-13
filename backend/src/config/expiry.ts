/**
 * ============================================================
 * EXPIRY CONFIGURATION
 * ============================================================
 *
 * Phase 7 — Expiry Detection Engine
 *
 * This file contains all centralized expiry/compliance rules.
 *
 * IMPORTANT:
 *
 * Do not hard-code expiry thresholds inside:
 *
 * - controllers
 * - services
 * - routes
 * - frontend components
 *
 * Instead import values from this file.
 */

/**
 * ============================================================
 * EXPIRY WARNING THRESHOLDS
 * ============================================================
 *
 * These values represent the number of days remaining before
 * a document expires.
 *
 * Example:
 *
 * 30 days remaining
 *      ↓
 * EXPIRING_IN_30_DAYS
 *
 * 15 days remaining
 *      ↓
 * EXPIRING_IN_15_DAYS
 *
 * 7 days remaining
 *      ↓
 * EXPIRING_IN_7_DAYS
 */
export const EXPIRY_THRESHOLDS = {
  /**
   * Critical warning.
   */
  SEVEN_DAYS: 7,

  /**
   * High priority warning.
   */
  FIFTEEN_DAYS: 15,

  /**
   * Standard warning.
   */
  THIRTY_DAYS: 30,
} as const;

/**
 * ============================================================
 * DEFAULT EXPIRY WINDOW
 * ============================================================
 *
 * Used when the application needs to retrieve documents that
 * are going to expire soon.
 */
export const DEFAULT_EXPIRY_WINDOW_DAYS = EXPIRY_THRESHOLDS.THIRTY_DAYS;

/**
 * ============================================================
 * EXPIRY STATUS VALUES
 * ============================================================
 *
 * These values will be used by:
 *
 * - Expiry calculator
 * - Expiry service
 * - Document service
 * - Dashboard
 * - Reports
 * - Reminder engine
 */
export const EXPIRY_STATUS = {
  /**
   * Expiry date has already passed.
   */
  EXPIRED: "expired",

  /**
   * Document expires today.
   */
  EXPIRING_TODAY: "expiring_today",

  /**
   * Document expires within 7 days.
   */
  EXPIRING_IN_7_DAYS: "expiring_in_7_days",

  /**
   * Document expires within 15 days.
   */
  EXPIRING_IN_15_DAYS: "expiring_in_15_days",

  /**
   * Document expires within 30 days.
   */
  EXPIRING_IN_30_DAYS: "expiring_in_30_days",

  /**
   * Document has more than 30 days remaining.
   */
  VALID: "valid",
} as const;

/**
 * ============================================================
 * EXPIRY STATUS TYPE
 * ============================================================
 */
export type ExpiryStatus = (typeof EXPIRY_STATUS)[keyof typeof EXPIRY_STATUS];

/**
 * ============================================================
 * EXPIRY STATUS PRIORITY
 * ============================================================
 *
 * Lower number = higher priority.
 *
 * This is useful for:
 *
 * - Dashboard sorting
 * - Alerts
 * - Reports
 * - Reminder engine
 */
export const EXPIRY_STATUS_PRIORITY: Record<ExpiryStatus, number> = {
  [EXPIRY_STATUS.EXPIRED]: 1,

  [EXPIRY_STATUS.EXPIRING_TODAY]: 2,

  [EXPIRY_STATUS.EXPIRING_IN_7_DAYS]: 3,

  [EXPIRY_STATUS.EXPIRING_IN_15_DAYS]: 4,

  [EXPIRY_STATUS.EXPIRING_IN_30_DAYS]: 5,

  [EXPIRY_STATUS.VALID]: 6,
};

/**
 * ============================================================
 * EXPIRY STATUS LABELS
 * ============================================================
 *
 * Human-readable labels.
 *
 * Backend can use these for API responses/reports.
 *
 * Frontend should ideally have its own presentation layer,
 * but these labels are useful for server-generated reports.
 */
export const EXPIRY_STATUS_LABEL: Record<ExpiryStatus, string> = {
  [EXPIRY_STATUS.EXPIRED]: "Expired",

  [EXPIRY_STATUS.EXPIRING_TODAY]: "Expiring Today",

  [EXPIRY_STATUS.EXPIRING_IN_7_DAYS]: "Expiring Within 7 Days",

  [EXPIRY_STATUS.EXPIRING_IN_15_DAYS]: "Expiring Within 15 Days",

  [EXPIRY_STATUS.EXPIRING_IN_30_DAYS]: "Expiring Within 30 Days",

  [EXPIRY_STATUS.VALID]: "Valid",
};

/**
 * ============================================================
 * EXPIRY STATUS DESCRIPTIONS
 * ============================================================
 */
export const EXPIRY_STATUS_DESCRIPTION: Record<ExpiryStatus, string> = {
  [EXPIRY_STATUS.EXPIRED]: "The document has already expired.",

  [EXPIRY_STATUS.EXPIRING_TODAY]: "The document expires today.",

  [EXPIRY_STATUS.EXPIRING_IN_7_DAYS]: "The document will expire within 7 days.",

  [EXPIRY_STATUS.EXPIRING_IN_15_DAYS]:
    "The document will expire within 15 days.",

  [EXPIRY_STATUS.EXPIRING_IN_30_DAYS]:
    "The document will expire within 30 days.",

  [EXPIRY_STATUS.VALID]: "The document has more than 30 days remaining.",
};

/**
 * ============================================================
 * REMINDER THRESHOLDS
 * ============================================================
 *
 * Phase 8 will use these values.
 *
 * We define them here now so the expiry engine and reminder
 * engine follow the same business rules.
 *
 * IMPORTANT:
 *
 * This does NOT send reminders.
 * It only defines when reminders may become applicable.
 */
export const REMINDER_THRESHOLDS = {
  FIRST_REMINDER_DAYS: 30,

  SECOND_REMINDER_DAYS: 15,

  FINAL_REMINDER_DAYS: 7,

  EXPIRY_DAY_REMINDER: 0,
} as const;

/**
 * ============================================================
 * EXPIRY CALCULATION SETTINGS
 * ============================================================
 */
export const EXPIRY_CALCULATION_CONFIG = {
  /**
   * Calculate based on calendar days rather than hours.
   *
   * Example:
   *
   * Today = 13 Aug
   * Expiry = 20 Aug
   *
   * Result = 7 days
   */
  USE_CALENDAR_DAYS: true,

  /**
   * Documents without an expiry date should not be treated
   * as expired automatically.
   */
  MISSING_EXPIRY_STATUS: "valid" as const,
} as const;

/**
 * ============================================================
 * HELPER: GET WARNING THRESHOLD
 * ============================================================
 *
 * Returns the nearest configured warning threshold for the
 * number of remaining days.
 *
 * Examples:
 *
 * 5  → 7
 * 10 → 15
 * 20 → 30
 * 45 → null
 */
export const getExpiryWarningThreshold = (
  daysRemaining: number,
): number | null => {
  if (daysRemaining < 0) {
    return null;
  }

  if (daysRemaining <= EXPIRY_THRESHOLDS.SEVEN_DAYS) {
    return EXPIRY_THRESHOLDS.SEVEN_DAYS;
  }

  if (daysRemaining <= EXPIRY_THRESHOLDS.FIFTEEN_DAYS) {
    return EXPIRY_THRESHOLDS.FIFTEEN_DAYS;
  }

  if (daysRemaining <= EXPIRY_THRESHOLDS.THIRTY_DAYS) {
    return EXPIRY_THRESHOLDS.THIRTY_DAYS;
  }

  return null;
};

/**
 * ============================================================
 * HELPER: IS EXPIRING SOON
 * ============================================================
 */
export const isExpiringSoon = (daysRemaining: number): boolean => {
  return daysRemaining >= 0 && daysRemaining <= EXPIRY_THRESHOLDS.THIRTY_DAYS;
};

/**
 * ============================================================
 * HELPER: IS CRITICAL
 * ============================================================
 *
 * Critical means:
 *
 * - already expired
 * - expires today
 * - expires within 7 days
 */
export const isExpiryCritical = (daysRemaining: number): boolean => {
  return daysRemaining <= EXPIRY_THRESHOLDS.SEVEN_DAYS;
};

/**
 * ============================================================
 * HELPER: IS EXPIRED
 * ============================================================
 */
export const isExpired = (daysRemaining: number): boolean => {
  return daysRemaining < 0;
};

/**
 * ============================================================
 * HELPER: IS VALID
 * ============================================================
 */
export const isValidExpiry = (daysRemaining: number): boolean => {
  return daysRemaining > EXPIRY_THRESHOLDS.THIRTY_DAYS;
};

/**
 * ============================================================
 * EXPORT ALL CONFIGURATION
 * ============================================================
 */
export default {
  EXPIRY_THRESHOLDS,

  DEFAULT_EXPIRY_WINDOW_DAYS,

  EXPIRY_STATUS,

  EXPIRY_STATUS_PRIORITY,

  EXPIRY_STATUS_LABEL,

  EXPIRY_STATUS_DESCRIPTION,

  REMINDER_THRESHOLDS,

  EXPIRY_CALCULATION_CONFIG,

  getExpiryWarningThreshold,

  isExpiringSoon,

  isExpiryCritical,

  isExpired,

  isValidExpiry,
};
