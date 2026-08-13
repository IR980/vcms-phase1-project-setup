import { z } from "zod";

export const vehicleSchema = z.object({
  companyId: z.string().min(1, "Company is required"),

  vehicleNumber: z.string().min(1, "Vehicle number is required"),

  vehicleName: z.string().optional(),

  vehicleType: z.string().min(1, "Vehicle type is required"),

  manufacturer: z.string().min(1, "Manufacturer is required"),

  vehicleModel: z.string().min(1, "Vehicle model is required"),

  manufacturingYear: z
    .number()
    .min(1980, "Manufacturing year must be at least 1980")
    .max(
      new Date().getFullYear() + 1,
      "Manufacturing year cannot exceed current year",
    ),

  color: z.string().optional(),

  fuelType: z.string().min(1, "Fuel type is required"),

  transmission: z.string().optional(),

  registrationNumber: z.string().min(1, "Registration number is required"),

  registrationDate: z.string().optional(),

  chassisNumber: z.string().min(1, "Chassis number is required"),

  engineNumber: z.string().min(1, "Engine number is required"),

  currentOdometer: z.number().min(0, "Current odometer is required"),

  assignedDriver: z.string().optional(),

  status: z.string(),
});

export type VehicleFormData = z.infer<typeof vehicleSchema>;
