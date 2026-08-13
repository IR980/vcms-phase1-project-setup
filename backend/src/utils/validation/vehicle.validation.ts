import { z } from "zod";

import {
  FuelType,
  VehicleStatus,
  VehicleType,
} from "../../models/Vehicle.model";

/**
 * MongoDB ObjectId
 */
const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId");

/**
 * Current Year
 */
const currentYear = new Date().getFullYear();

/**
 * Vehicle Number
 * Example:
 * DL01AB1234
 */
const vehicleNumberRegex = /^[A-Z]{2}[0-9]{1,2}[A-Z]{1,3}[0-9]{4}$/;

/**
 * Create Vehicle
 */
export const createVehicleSchema = z.object({
  body: z.object({
    companyId: objectId,

    vehicleNumber: z
      .string()
      .trim()
      .toUpperCase()
      .regex(vehicleNumberRegex, "Invalid vehicle number"),

    vehicleName: z.string().trim().max(100).optional(),

    vehicleType: z.nativeEnum(VehicleType),

    manufacturer: z.string().trim().min(2).max(100),

    vehicleModel: z.string().trim().min(1).max(100),

    manufacturingYear: z
      .number()
      .int()
      .min(1980)
      .max(currentYear + 1),

    color: z.string().trim().max(50).optional(),

    fuelType: z.nativeEnum(FuelType),

    transmission: z.string().trim().max(50).optional(),

    registrationNumber: z.string().trim().toUpperCase().min(5).max(20),

    registrationDate: z.coerce.date().optional(),

    chassisNumber: z.string().trim().toUpperCase().min(5).max(50),

    engineNumber: z.string().trim().toUpperCase().min(5).max(50),

    currentOdometer: z.number().min(0).default(0),

    assignedDriver: z.preprocess(
      (value) => (value === "" || value === null ? undefined : value),
      objectId.optional(),
    ),

    status: z.nativeEnum(VehicleStatus).optional(),
  }),
  params: z.object({}).optional(),

  query: z.object({}).optional(),
});

/**
 * Update Vehicle
 */
export const updateVehicleSchema = z.object({
  body: createVehicleSchema.shape.body.partial(),

  params: z.object({
    id: objectId,
  }),

  query: z.object({}).optional(),
});

/**
 * Params
 */
export const vehicleIdSchema = z.object({
  params: z.object({
    id: objectId,
  }),
});
/**
 * Query
 */
export const vehicleQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().min(1).default(1),

    limit: z.coerce.number().min(1).max(100).default(10),

    search: z.string().trim().optional(),

    companyId: objectId.optional(),

    status: z.nativeEnum(VehicleStatus).optional(),

    vehicleType: z.nativeEnum(VehicleType).optional(),

    fuelType: z.nativeEnum(FuelType).optional(),

    sortBy: z
      .enum([
        "vehicleNumber",
        "manufacturer",
        "vehicleModel",
        "manufacturingYear",
        "createdAt",
      ])
      .default("createdAt"),

    sortOrder: z.enum(["asc", "desc"]).default("desc"),
  }),
});

/**
 * Types
 */
export type CreateVehicleDto = z.infer<typeof createVehicleSchema>["body"];

export type UpdateVehicleDto = z.infer<typeof updateVehicleSchema>["body"];

export type VehicleQueryDto = z.infer<typeof vehicleQuerySchema>["query"];
