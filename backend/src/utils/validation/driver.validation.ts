// import { z } from "zod";

// import {
//   DriverGender,
//   DriverStatus,
//   LicenseType,
// } from "../../models/Driver.model";

// /**
//  * MongoDB ObjectId validation
//  */
// const objectIdSchema = z
//   .string()
//   .regex(/^[0-9a-fA-F]{24}$/, "Invalid ID format");

// /**
//  * Date validation
//  */
// const optionalDateSchema = z
//   .union([
//     z.string().datetime({
//       offset: true,
//     }),
//     z.string().date(),
//     z.date(),
//   ])
//   .optional();

// const requiredDateSchema = z.union([
//   z.string().datetime({
//     offset: true,
//   }),
//   z.string().date(),
//   z.date(),
// ]);

// /**
//  * Base Driver Schema
//  *
//  * IMPORTANT:
//  * Keep this as a plain Zod object.
//  *
//  * We use this schema for .partial()
//  * when creating updateDriverSchema.
//  */
// const driverBaseSchema = z.object({
//   companyId: objectIdSchema,

//   employeeId: z
//     .string()
//     .trim()
//     .max(50, "Employee ID cannot exceed 50 characters")
//     .optional(),

//   firstName: z
//     .string()
//     .trim()
//     .min(2, "First name must be at least 2 characters")
//     .max(50, "First name cannot exceed 50 characters"),

//   lastName: z
//     .string()
//     .trim()
//     .max(50, "Last name cannot exceed 50 characters")
//     .optional(),

//   dateOfBirth: optionalDateSchema,

//   gender: z.nativeEnum(DriverGender).optional(),

//   profilePhoto: z
//     .string()
//     .trim()
//     .url("Invalid profile photo URL")
//     .optional()
//     .or(z.literal("")),

//   mobileNumber: z
//     .string()
//     .trim()
//     .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),

//   email: z
//     .string()
//     .trim()
//     .email("Invalid email address")
//     .optional()
//     .or(z.literal("")),

//   address: z
//     .string()
//     .trim()
//     .max(250, "Address cannot exceed 250 characters")
//     .optional(),

//   city: z
//     .string()
//     .trim()
//     .max(50, "City cannot exceed 50 characters")
//     .optional(),

//   state: z
//     .string()
//     .trim()
//     .max(50, "State cannot exceed 50 characters")
//     .optional(),

//   pincode: z
//     .string()
//     .trim()
//     .regex(/^\d{6}$/, "Enter a valid 6-digit pincode")
//     .optional()
//     .or(z.literal("")),

//   emergencyContactName: z
//     .string()
//     .trim()
//     .max(100, "Emergency contact name cannot exceed 100 characters")
//     .optional(),

//   emergencyContactNumber: z
//     .string()
//     .trim()
//     .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number")
//     .optional()
//     .or(z.literal("")),

//   licenseNumber: z
//     .string()
//     .trim()
//     .min(5, "License number is required")
//     .max(30, "License number cannot exceed 30 characters"),

//   licenseType: z.nativeEnum(LicenseType),

//   licenseIssueDate: optionalDateSchema,

//   licenseExpiryDate: requiredDateSchema,

//   issuingAuthority: z
//     .string()
//     .trim()
//     .max(150, "Issuing authority cannot exceed 150 characters")
//     .optional(),

//   joiningDate: optionalDateSchema,

//   department: z
//     .string()
//     .trim()
//     .max(100, "Department cannot exceed 100 characters")
//     .optional(),

//   assignedVehicle: objectIdSchema.optional(),

//   status: z.nativeEnum(DriverStatus).optional(),
// });

// /**
//  * Create Driver Validation
//  *
//  * Base schema + cross-field validation.
//  */
// export const createDriverSchema = driverBaseSchema.refine(
//   (data) => {
//     if (!data.licenseIssueDate || !data.licenseExpiryDate) {
//       return true;
//     }

//     return new Date(data.licenseExpiryDate) >= new Date(data.licenseIssueDate);
//   },
//   {
//     message: "License expiry date must be after the issue date",
//     path: ["licenseExpiryDate"],
//   },
// );

// /**
//  * Update Driver Validation
//  *
//  * IMPORTANT:
//  * Do NOT use:
//  *
//  * createDriverSchema.partial()
//  *
//  * because createDriverSchema contains .refine().
//  */
// export const updateDriverSchema = driverBaseSchema.partial();

// /**
//  * Driver ID Validation
//  */
// export const driverIdSchema = z.object({
//   id: objectIdSchema,
// });

// /**
//  * Driver Query Validation
//  */
// export const driverQuerySchema = z.object({
//   page: z.coerce.number().int().min(1).default(1),

//   limit: z.coerce.number().int().min(1).max(100).default(10),

//   search: z.string().trim().optional(),

//   companyId: objectIdSchema.optional(),

//   status: z.nativeEnum(DriverStatus).optional(),

//   licenseType: z.nativeEnum(LicenseType).optional(),

//   assignedVehicle: objectIdSchema.optional(),

//   licenseExpiryFrom: z.string().date().optional(),

//   licenseExpiryTo: z.string().date().optional(),

//   sortBy: z
//     .enum([
//       "firstName",
//       "lastName",
//       "employeeId",
//       "licenseExpiryDate",
//       "joiningDate",
//       "createdAt",
//     ])
//     .default("createdAt"),

//   sortOrder: z.enum(["asc", "desc"]).default("desc"),
// });

import { z } from "zod";

import {
  DriverGender,
  DriverStatus,
  LicenseType,
} from "../../models/Driver.model";

/**
 * ============================================================
 * MongoDB ObjectId Validation
 * ============================================================
 */
const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid ID format");

/**
 * ============================================================
 * Date Validation
 * ============================================================
 *
 * Accepts:
 * - YYYY-MM-DD
 * - ISO datetime
 * - JavaScript Date
 */
const optionalDateSchema = z
  .union([
    z.string().datetime({
      offset: true,
    }),

    z.string().date(),

    z.date(),
  ])
  .optional();

const requiredDateSchema = z.union([
  z.string().datetime({
    offset: true,
  }),

  z.string().date(),

  z.date(),
]);

/**
 * ============================================================
 * Driver Fields
 * ============================================================
 *
 * IMPORTANT:
 * This is intentionally a plain object schema.
 *
 * Our validateBody middleware receives:
 *
 * {
 *   body: req.body,
 *   params: req.params,
 *   query: req.query
 * }
 *
 * Therefore the exported request schemas below
 * are structured accordingly.
 */
const driverBaseSchema = z.object({
  companyId: objectIdSchema,

  employeeId: z
    .string()
    .trim()
    .max(50, "Employee ID cannot exceed 50 characters")
    .optional(),

  firstName: z
    .string()
    .trim()
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name cannot exceed 50 characters"),

  lastName: z
    .string()
    .trim()
    .max(50, "Last name cannot exceed 50 characters")
    .optional(),

  dateOfBirth: optionalDateSchema,

  gender: z.nativeEnum(DriverGender).optional(),

  profilePhoto: z
    .string()
    .trim()
    .url("Invalid profile photo URL")
    .optional()
    .or(z.literal("")),

  mobileNumber: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),

  email: z
    .string()
    .trim()
    .email("Invalid email address")
    .optional()
    .or(z.literal("")),

  address: z
    .string()
    .trim()
    .max(250, "Address cannot exceed 250 characters")
    .optional(),

  city: z
    .string()
    .trim()
    .max(50, "City cannot exceed 50 characters")
    .optional(),

  state: z
    .string()
    .trim()
    .max(50, "State cannot exceed 50 characters")
    .optional(),

  pincode: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "Enter a valid 6-digit pincode")
    .optional()
    .or(z.literal("")),

  emergencyContactName: z
    .string()
    .trim()
    .max(100, "Emergency contact name cannot exceed 100 characters")
    .optional(),

  emergencyContactNumber: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number")
    .optional()
    .or(z.literal("")),

  licenseNumber: z
    .string()
    .trim()
    .min(5, "License number is required")
    .max(30, "License number cannot exceed 30 characters"),

  licenseType: z.nativeEnum(LicenseType),

  licenseIssueDate: optionalDateSchema,

  licenseExpiryDate: requiredDateSchema,

  issuingAuthority: z
    .string()
    .trim()
    .max(150, "Issuing authority cannot exceed 150 characters")
    .optional(),

  joiningDate: optionalDateSchema,

  department: z
    .string()
    .trim()
    .max(100, "Department cannot exceed 100 characters")
    .optional(),

  assignedVehicle: objectIdSchema.optional(),

  status: z.nativeEnum(DriverStatus).optional(),
});

/**
 * ============================================================
 * License Date Validation
 * ============================================================
 */
const validateLicenseDates = <
  T extends {
    licenseIssueDate?: string | Date;
    licenseExpiryDate: string | Date;
  },
>(
  data: T,
): boolean => {
  if (!data.licenseIssueDate || !data.licenseExpiryDate) {
    return true;
  }

  return (
    new Date(data.licenseExpiryDate).getTime() >=
    new Date(data.licenseIssueDate).getTime()
  );
};

/**
 * ============================================================
 * Create Driver Body Schema
 * ============================================================
 */
export const createDriverBodySchema = driverBaseSchema.refine(
  validateLicenseDates,
  {
    message: "License expiry date must be after the issue date",

    path: ["licenseExpiryDate"],
  },
);

/**
 * ============================================================
 * Update Driver Body Schema
 * ============================================================
 *
 * IMPORTANT:
 *
 * Do NOT do:
 *
 * createDriverBodySchema.partial()
 *
 * because the create schema contains a refinement.
 *
 * Instead:
 *
 * driverBaseSchema
 *      ↓
 *    partial()
 *      ↓
 *    refine()
 */
export const updateDriverBodySchema = driverBaseSchema.partial().refine(
  (data) => {
    if (!data.licenseIssueDate || !data.licenseExpiryDate) {
      return true;
    }

    return (
      new Date(data.licenseExpiryDate).getTime() >=
      new Date(data.licenseIssueDate).getTime()
    );
  },
  {
    message: "License expiry date must be after the issue date",

    path: ["licenseExpiryDate"],
  },
);

/**
 * ============================================================
 * Driver ID Schema
 * ============================================================
 */
export const driverIdSchema = z.object({
  id: objectIdSchema,
});

/**
 * ============================================================
 * Driver Query Schema
 * ============================================================
 */
export const driverQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),

  limit: z.coerce.number().int().min(1).max(100).default(10),

  search: z.string().trim().optional(),

  companyId: objectIdSchema.optional(),

  status: z.nativeEnum(DriverStatus).optional(),

  licenseType: z.nativeEnum(LicenseType).optional(),

  assignedVehicle: objectIdSchema.optional(),

  licenseExpiryFrom: z.string().date().optional(),

  licenseExpiryTo: z.string().date().optional(),

  sortBy: z
    .enum([
      "firstName",
      "lastName",
      "employeeId",
      "licenseExpiryDate",
      "joiningDate",
      "createdAt",
    ])
    .default("createdAt"),

  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

/**
 * ============================================================
 * Complete Request Schemas
 * ============================================================
 *
 * Your validateBody middleware validates:
 *
 * {
 *   body,
 *   params,
 *   query
 * }
 *
 * Therefore these schemas match that structure.
 */

/**
 * Create Driver Request
 */
export const createDriverSchema = z.object({
  body: createDriverBodySchema,

  params: z.object({}).optional(),

  query: z.object({}).optional(),
});

/**
 * Update Driver Request
 */
export const updateDriverSchema = z.object({
  body: updateDriverBodySchema,

  params: driverIdSchema,

  query: z.object({}).optional(),
});

/**
 * Get Driver By ID Request
 */
export const getDriverByIdSchema = z.object({
  body: z.object({}).optional(),

  params: driverIdSchema,

  query: z.object({}).optional(),
});

/**
 * Delete Driver Request
 */
export const deleteDriverSchema = z.object({
  body: z.object({}).optional(),

  params: driverIdSchema,

  query: z.object({}).optional(),
});

/**
 * Get Drivers Request
 */
export const getDriversSchema = z.object({
  body: z.object({}).optional(),

  params: z.object({}).optional(),

  query: driverQuerySchema,
});

/**
 * ============================================================
 * Default Export
 * ============================================================
 */
export default {
  createDriverSchema,
  updateDriverSchema,
  getDriverByIdSchema,
  deleteDriverSchema,
  getDriversSchema,
  driverIdSchema,
  driverQuerySchema,
};
