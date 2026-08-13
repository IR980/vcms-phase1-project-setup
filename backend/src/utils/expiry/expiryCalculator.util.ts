/**
 * ============================================================
 * EXPIRY CALCULATOR UTILITY
 * ============================================================
 *
 * Phase 7 — Expiry Detection Engine
 *
 * Responsibility:
 *
 * 1. Validate expiry date
 * 2. Calculate calendar days remaining
 * 3. Determine expiry status
 * 4. Determine warning threshold
 * 5. Determine expired / critical / upcoming state
 *
 * This utility does NOT:
 *
 * - access MongoDB
 * - send notifications
 * - update documents
 * - call controllers
 *
 * It is a pure calculation layer.
 */

import {
  EXPIRY_STATUS,
  EXPIRY_THRESHOLDS,
  getExpiryWarningThreshold,
  isExpiringSoon,
  isExpiryCritical,
  isExpired,
} from "../../config/expiry";

import type {
  ExpiryDateInput,
  ExpiryCalculationOptions,
  ExpiryCalculationResult,
} from "../../types/expiry.types";

import type { ExpiryStatus } from "../../config/expiry";

/**
 * ============================================================
 * CONSTANTS
 * ============================================================
 */

/**
 * Milliseconds in one calendar day.
 */
const MILLISECONDS_PER_DAY = 1000 * 60 * 60 * 24;

/**
 * ============================================================
 * DATE HELPERS
 * ============================================================
 */

/**
 * Convert supported input into Date.
 *
 * Throws an Error when the supplied date is invalid.
 */
const normalizeDate = (value: ExpiryDateInput): Date => {
  const date =
    value instanceof Date ? new Date(value.getTime()) : new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new Error("Invalid expiry date");
  }

  return date;
};

/**
 * ============================================================
 * START OF DAY
 * ============================================================
 *
 * Converts a date to local midnight.
 *
 * Example:
 *
 * 13 Aug 2026 18:45
 *       ↓
 * 13 Aug 2026 00:00
 *
 * We use calendar dates rather than hours because compliance
 * expiry should be calculated in days.
 */
const startOfDay = (date: Date): Date => {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};

/**
 * ============================================================
 * DAYS BETWEEN DATES
 * ============================================================
 */
const calculateCalendarDaysBetween = (fromDate: Date, toDate: Date): number => {
  const from = startOfDay(fromDate);

  const to = startOfDay(toDate);

  const difference = to.getTime() - from.getTime();

  return Math.round(difference / MILLISECONDS_PER_DAY);
};

/**
 * ============================================================
 * CALCULATE DAYS REMAINING
 * ============================================================
 *
 * Example:
 *
 * Today:
 *   13 Aug 2026
 *
 * Expiry:
 *   20 Aug 2026
 *
 * Result:
 *   7
 *
 * Expired:
 *
 * Today:
 *   13 Aug
 *
 * Expiry:
 *   10 Aug
 *
 * Result:
 *   -3
 */
export const calculateDaysRemaining = (
  expiryDate: ExpiryDateInput,
  referenceDate: Date = new Date(),
): number => {
  const expiry = normalizeDate(expiryDate);

  const reference = normalizeDate(referenceDate);

  return calculateCalendarDaysBetween(reference, expiry);
};

/**
 * ============================================================
 * GET EXPIRY STATUS
 * ============================================================
 *
 * Rules:
 *
 * < 0
 *   → expired
 *
 * = 0
 *   → expiring today
 *
 * 1 - 7
 *   → expiring in 7 days
 *
 * 8 - 15
 *   → expiring in 15 days
 *
 * 16 - 30
 *   → expiring in 30 days
 *
 * > 30
 *   → valid
 */
export const getExpiryStatus = (daysRemaining: number): ExpiryStatus => {
  /**
   * ----------------------------------------------------------
   * EXPIRED
   * ----------------------------------------------------------
   */
  if (daysRemaining < 0) {
    return EXPIRY_STATUS.EXPIRED;
  }

  /**
   * ----------------------------------------------------------
   * TODAY
   * ----------------------------------------------------------
   */
  if (daysRemaining === 0) {
    return EXPIRY_STATUS.EXPIRING_TODAY;
  }

  /**
   * ----------------------------------------------------------
   * 7 DAYS
   * ----------------------------------------------------------
   */
  if (daysRemaining <= EXPIRY_THRESHOLDS.SEVEN_DAYS) {
    return EXPIRY_STATUS.EXPIRING_IN_7_DAYS;
  }

  /**
   * ----------------------------------------------------------
   * 15 DAYS
   * ----------------------------------------------------------
   */
  if (daysRemaining <= EXPIRY_THRESHOLDS.FIFTEEN_DAYS) {
    return EXPIRY_STATUS.EXPIRING_IN_15_DAYS;
  }

  /**
   * ----------------------------------------------------------
   * 30 DAYS
   * ----------------------------------------------------------
   */
  if (daysRemaining <= EXPIRY_THRESHOLDS.THIRTY_DAYS) {
    return EXPIRY_STATUS.EXPIRING_IN_30_DAYS;
  }

  /**
   * ----------------------------------------------------------
   * VALID
   * ----------------------------------------------------------
   */
  return EXPIRY_STATUS.VALID;
};

/**
 * ============================================================
 * CALCULATE EXPIRY
 * ============================================================
 *
 * Main public utility.
 *
 * Example:
 *
 * const result = calculateExpiry(
 *   "2026-08-20",
 * );
 *
 * result:
 *
 * {
 *   expiryDate: Date,
 *   daysRemaining: 7,
 *   status: "expiring_in_7_days",
 *   isExpired: false,
 *   isExpiringSoon: true,
 *   isCritical: true,
 *   warningThreshold: 7
 * }
 */
export const calculateExpiry = (
  expiryDate: ExpiryDateInput,
  options: ExpiryCalculationOptions = {},
): ExpiryCalculationResult => {
  /**
   * ----------------------------------------------------------
   * NORMALIZE EXPIRY DATE
   * ----------------------------------------------------------
   */
  const normalizedExpiryDate = normalizeDate(expiryDate);

  /**
   * ----------------------------------------------------------
   * REFERENCE DATE
   * ----------------------------------------------------------
   *
   * Defaults to today.
   */
  const referenceDate = options.referenceDate ?? new Date();

  /**
   * ----------------------------------------------------------
   * CALCULATE DAYS
   * ----------------------------------------------------------
   */
  const daysRemaining =
    options.useCalendarDays === false
      ? Math.floor(
          (normalizedExpiryDate.getTime() - referenceDate.getTime()) /
            MILLISECONDS_PER_DAY,
        )
      : calculateDaysRemaining(normalizedExpiryDate, referenceDate);

  /**
   * ----------------------------------------------------------
   * STATUS
   * ----------------------------------------------------------
   */
  const status = getExpiryStatus(daysRemaining);

  /**
   * ----------------------------------------------------------
   * FLAGS
   * ----------------------------------------------------------
   */
  const expired = isExpired(daysRemaining);

  const expiringSoon = isExpiringSoon(daysRemaining);

  const critical = isExpiryCritical(daysRemaining);

  /**
   * ----------------------------------------------------------
   * WARNING THRESHOLD
   * ----------------------------------------------------------
   */
  const warningThreshold = getExpiryWarningThreshold(daysRemaining);

  return {
    expiryDate: normalizedExpiryDate,

    daysRemaining,

    status,

    isExpired: expired,

    isExpiringSoon: expiringSoon,

    isCritical: critical,

    warningThreshold,
  };
};

/**
 * ============================================================
 * CHECK EXPIRED
 * ============================================================
 */
export const checkExpired = (
  expiryDate: ExpiryDateInput,
  referenceDate?: Date,
): boolean => {
  const daysRemaining = calculateDaysRemaining(expiryDate, referenceDate);

  return daysRemaining < 0;
};

/**
 * ============================================================
 * CHECK EXPIRING TODAY
 * ============================================================
 */
export const checkExpiringToday = (
  expiryDate: ExpiryDateInput,
  referenceDate?: Date,
): boolean => {
  const daysRemaining = calculateDaysRemaining(expiryDate, referenceDate);

  return daysRemaining === 0;
};

/**
 * ============================================================
 * CHECK EXPIRING WITHIN 7 DAYS
 * ============================================================
 *
 * Includes today.
 *
 * Example:
 *
 * 0 → true
 * 5 → true
 * 7 → true
 * 8 → false
 *
 * Expired documents are excluded.
 */
export const checkExpiringWithin7Days = (
  expiryDate: ExpiryDateInput,
  referenceDate?: Date,
): boolean => {
  const daysRemaining = calculateDaysRemaining(expiryDate, referenceDate);

  return daysRemaining >= 0 && daysRemaining <= EXPIRY_THRESHOLDS.SEVEN_DAYS;
};

/**
 * ============================================================
 * CHECK EXPIRING WITHIN 15 DAYS
 * ============================================================
 */
export const checkExpiringWithin15Days = (
  expiryDate: ExpiryDateInput,
  referenceDate?: Date,
): boolean => {
  const daysRemaining = calculateDaysRemaining(expiryDate, referenceDate);

  return daysRemaining >= 0 && daysRemaining <= EXPIRY_THRESHOLDS.FIFTEEN_DAYS;
};

/**
 * ============================================================
 * CHECK EXPIRING WITHIN 30 DAYS
 * ============================================================
 */
export const checkExpiringWithin30Days = (
  expiryDate: ExpiryDateInput,
  referenceDate?: Date,
): boolean => {
  const daysRemaining = calculateDaysRemaining(expiryDate, referenceDate);

  return daysRemaining >= 0 && daysRemaining <= EXPIRY_THRESHOLDS.THIRTY_DAYS;
};

/**
 * ============================================================
 * CHECK CRITICAL EXPIRY
 * ============================================================
 *
 * Critical:
 *
 * expired
 * today
 * within 7 days
 */
export const checkCriticalExpiry = (
  expiryDate: ExpiryDateInput,
  referenceDate?: Date,
): boolean => {
  const daysRemaining = calculateDaysRemaining(expiryDate, referenceDate);

  return daysRemaining <= EXPIRY_THRESHOLDS.SEVEN_DAYS;
};

/**
 * ============================================================
 * CHECK VALID DOCUMENT
 * ============================================================
 *
 * Valid means:
 *
 * More than 30 days remaining.
 */
export const checkValidExpiry = (
  expiryDate: ExpiryDateInput,
  referenceDate?: Date,
): boolean => {
  const daysRemaining = calculateDaysRemaining(expiryDate, referenceDate);

  return daysRemaining > EXPIRY_THRESHOLDS.THIRTY_DAYS;
};

/**
 * ============================================================
 * GET STATUS FROM DATE
 * ============================================================
 *
 * Convenience method.
 */
export const getExpiryStatusFromDate = (
  expiryDate: ExpiryDateInput,
  referenceDate?: Date,
): ExpiryStatus => {
  const daysRemaining = calculateDaysRemaining(expiryDate, referenceDate);

  return getExpiryStatus(daysRemaining);
};

/**
 * ============================================================
 * GET DAYS UNTIL EXPIRY
 * ============================================================
 *
 * Alias useful for service layer.
 */
export const getDaysUntilExpiry = (
  expiryDate: ExpiryDateInput,
  referenceDate?: Date,
): number => {
  return calculateDaysRemaining(expiryDate, referenceDate);
};

/**
 * ============================================================
 * GET EXPIRY SUMMARY
 * ============================================================
 *
 * Small helper useful for dashboard calculations.
 */
export const getExpirySummary = (
  expiryDate: ExpiryDateInput,
  referenceDate?: Date,
) => {
  const result = calculateExpiry(expiryDate, {
    referenceDate,
    useCalendarDays: true,
  });

  return {
    expiryDate: result.expiryDate,

    daysRemaining: result.daysRemaining,

    status: result.status,

    isExpired: result.isExpired,

    isExpiringSoon: result.isExpiringSoon,

    isCritical: result.isCritical,

    warningThreshold: result.warningThreshold,
  };
};

/**
 * ============================================================
 * DEFAULT EXPORT
 * ============================================================
 */
export default {
  calculateDaysRemaining,

  getExpiryStatus,

  calculateExpiry,

  checkExpired,

  checkExpiringToday,

  checkExpiringWithin7Days,

  checkExpiringWithin15Days,

  checkExpiringWithin30Days,

  checkCriticalExpiry,

  checkValidExpiry,

  getExpiryStatusFromDate,

  getDaysUntilExpiry,

  getExpirySummary,
};
