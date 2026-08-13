import { z } from "zod";

import { DocumentOwnerType, DocumentType } from "../../models/Document.model";

/**
 * ============================================================
 * COMMON SCHEMAS
 * ============================================================
 */

/**
 * MongoDB ObjectId
 */
const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid ID format");

/**
 * Positive integer
 */
const positiveIntSchema = z.coerce.number().int().positive();

/**
 * ============================================================
 * PAGINATION
 * ============================================================
 */

const paginationSchema = z.object({
  page: z.coerce.number().int().min(1, "Page must be at least 1").default(1),

  limit: z.coerce
    .number()
    .int()
    .min(1, "Limit must be at least 1")
    .max(100, "Limit cannot exceed 100")
    .default(20),
});

/**
 * ============================================================
 * COMMON COMPLIANCE FILTER
 * ============================================================
 */

const complianceFilterSchema = paginationSchema.extend({
  /**
   * Document type
   */
  documentType: z.nativeEnum(DocumentType).optional(),

  /**
   * Vehicle / Driver
   */
  ownerType: z.nativeEnum(DocumentOwnerType).optional(),

  /**
   * Vehicle ID
   */
  vehicleId: objectIdSchema.optional(),

  /**
   * Driver ID
   */
  driverId: objectIdSchema.optional(),
});

/**
 * ============================================================
 * EXPIRING DOCUMENTS
 * ============================================================
 *
 * GET:
 *
 * /compliance/expiring
 *
 * Example:
 *
 * ?days=30&page=1&limit=20
 */

export const expiringDocumentsQuerySchema = complianceFilterSchema.extend({
  /**
   * Number of days within which a document
   * is considered expiring soon.
   *
   * Default = 30
   */
  days: z.coerce
    .number()
    .int()
    .min(0, "Days cannot be negative")
    .max(3650, "Days cannot exceed 3650")
    .default(30),
});

/**
 * ============================================================
 * EXPIRED DOCUMENTS
 * ============================================================
 *
 * GET:
 *
 * /compliance/expired
 */

export const expiredDocumentsQuerySchema = complianceFilterSchema;

/**
 * ============================================================
 * VALID DOCUMENTS
 * ============================================================
 *
 * GET:
 *
 * /compliance/valid
 */

export const validDocumentsQuerySchema = complianceFilterSchema.extend({
  /**
   * Number of days used as the
   * expiring-soon boundary.
   *
   * Default = 30
   */
  days: z.coerce
    .number()
    .int()
    .min(0, "Days cannot be negative")
    .max(3650, "Days cannot exceed 3650")
    .default(30),
});

/**
 * ============================================================
 * DOCUMENTS WITHOUT EXPIRY
 * ============================================================
 *
 * GET:
 *
 * /compliance/no-expiry
 */

export const documentsWithoutExpiryQuerySchema = paginationSchema;

/**
 * ============================================================
 * OCR PENDING DOCUMENTS
 * ============================================================
 *
 * GET:
 *
 * /compliance/ocr-pending
 */

export const ocrPendingDocumentsQuerySchema = paginationSchema;

/**
 * ============================================================
 * VEHICLE COMPLIANCE
 * ============================================================
 *
 * GET:
 *
 * /compliance/vehicle/:vehicleId
 */

export const vehicleComplianceParamsSchema = z.object({
  vehicleId: objectIdSchema,
});

/**
 * ============================================================
 * DRIVER COMPLIANCE
 * ============================================================
 *
 * GET:
 *
 * /compliance/driver/:driverId
 */

export const driverComplianceParamsSchema = z.object({
  driverId: objectIdSchema,
});

/**
 * ============================================================
 * COMPANY PARAMS
 * ============================================================
 *
 * Used for company-level compliance APIs.
 */

export const companyComplianceParamsSchema = z.object({
  companyId: objectIdSchema,
});

/**
 * ============================================================
 * CRITICAL DOCUMENTS
 * ============================================================
 *
 * Critical documents:
 *
 * - Expired
 * - Expiring within 7 days
 *
 * GET:
 *
 * /compliance/critical
 */

export const criticalDocumentsQuerySchema = z.object({
  limit: z.coerce
    .number()
    .int()
    .min(1, "Limit must be at least 1")
    .max(100, "Limit cannot exceed 100")
    .default(20),
});

/**
 * ============================================================
 * COMPANY COMPLIANCE QUERY
 * ============================================================
 *
 * Used by:
 *
 * GET /compliance/summary
 * GET /compliance/company
 *
 * No additional query parameters required currently.
 */

export const companyComplianceQuerySchema = z.object({});

/**
 * ============================================================
 * GENERIC COMPANY ID + PAGINATION
 * ============================================================
 *
 * Useful when controller receives companyId
 * from query instead of params.
 */

export const companyPaginationQuerySchema = paginationSchema.extend({
  companyId: objectIdSchema,
});

/**
 * ============================================================
 * COMPANY ID QUERY
 * ============================================================
 */

export const companyIdQuerySchema = z.object({
  companyId: objectIdSchema,
});

/**
 * ============================================================
 * EXPORT COMMON SCHEMAS
 * ============================================================
 */

export {
  objectIdSchema,
  paginationSchema,
  complianceFilterSchema,
  positiveIntSchema,
};

/**
 * ============================================================
 * TYPES
 * ============================================================
 *
 * These inferred types can be used by controllers.
 */

export type ExpiringDocumentsQuery = z.infer<
  typeof expiringDocumentsQuerySchema
>;

export type ExpiredDocumentsQuery = z.infer<typeof expiredDocumentsQuerySchema>;

export type ValidDocumentsQuery = z.infer<typeof validDocumentsQuerySchema>;

export type DocumentsWithoutExpiryQuery = z.infer<
  typeof documentsWithoutExpiryQuerySchema
>;

export type OCRPendingDocumentsQuery = z.infer<
  typeof ocrPendingDocumentsQuerySchema
>;

export type CriticalDocumentsQuery = z.infer<
  typeof criticalDocumentsQuerySchema
>;

export type VehicleComplianceParams = z.infer<
  typeof vehicleComplianceParamsSchema
>;

export type DriverComplianceParams = z.infer<
  typeof driverComplianceParamsSchema
>;

export type CompanyComplianceParams = z.infer<
  typeof companyComplianceParamsSchema
>;

export type CompanyPaginationQuery = z.infer<
  typeof companyPaginationQuerySchema
>;

export type CompanyIdQuery = z.infer<typeof companyIdQuerySchema>;
