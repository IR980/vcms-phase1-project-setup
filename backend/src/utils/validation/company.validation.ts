import { z } from "zod";
import { CompanyStatus } from "../../types/company.types";

/**
 * MongoDB ObjectId Validation
 */
export const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ObjectId");

/**
 * Company Name
 */
const companyName = z
  .string()
  .trim()
  .min(1, { message: "Company name is required" })
  .min(2, "Company name must be at least 2 characters")
  .max(150, "Company name cannot exceed 150 characters");

/**
 * Legal Name
 */
const legalName = z
  .string()
  .trim()
  .min(1, { message: "Legal name is required" })
  .min(2)
  .max(200);

/**
 * Owner Name
 */
const ownerName = z
  .string()
  .trim()
  .min(1, { message: "Owner name is required" })
  .min(2)
  .max(100);

/**
 * Email
 */
const email = z
  .string()
  .trim()
  .min(1, { message: "Email is required" })
  .email("Invalid email address")
  .toLowerCase();

/**
 * Indian Mobile Number
 */
const phone = z
  .string()
  .trim()
  .min(1, { message: "Phone number is required" })
  .regex(/^[6-9]\d{9}$/, "Invalid mobile number");

/**
 * GST Number
 */
const gstNumber = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[A-Z0-9]{3}$/, "Invalid GST number")
  .optional()
  .or(z.literal(""));

/**
 * PAN Number
 */
const panNumber = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Invalid PAN number")
  .optional()
  .or(z.literal(""));

/**
 * Website
 */
const website = z
  .string()
  .trim()
  .url("Invalid website URL")
  .optional()
  .or(z.literal(""));

/**
 * Create Company
 */
export const createCompanySchema = z.object({
  body: z.object({
    companyName,

    legalName,

    ownerName,

    email,

    phone,

    gstNumber,

    panNumber,

    address: z.string().trim().min(5).max(300),

    city: z.string().trim().min(2).max(100),

    state: z.string().trim().min(2).max(100),

    country: z.string().trim().default("India"),

    postalCode: z.string().regex(/^[1-9][0-9]{5}$/, "Invalid postal code"),

    logo: z.any().optional(),

    website,

    timezone: z.string().optional(),

    currency: z.string().optional(),
  }),
});

/**
 * Update Company
 */
export const updateCompanySchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),

  body: createCompanySchema.shape.body.partial(),
});

/**
 * Get Company By Id
 */
export const companyIdSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
});

/**
 * Company List Query
 */
export const companyQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),

    limit: z.coerce.number().int().min(1).max(100).default(10),

    search: z.string().trim().optional(),

    status: z.nativeEnum(CompanyStatus).optional(),

    sortBy: z
      .enum(["companyName", "createdAt", "updatedAt"])
      .default("createdAt"),

    sortOrder: z.enum(["asc", "desc"]).default("desc"),
  }),
});
