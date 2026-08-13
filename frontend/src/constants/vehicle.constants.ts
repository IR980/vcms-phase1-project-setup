import type{ FuelType, VehicleStatus, VehicleType } from "../types/vehicle.types";

/**
 * Vehicle Types
 */
export const VEHICLE_TYPES: {
  label: string;
  value: VehicleType;
}[] = [
  {
    label: "Truck",
    value: "truck",
  },
  {
    label: "Bus",
    value: "bus",
  },
  {
    label: "Car",
    value: "car",
  },
  {
    label: "Van",
    value: "van",
  },
  {
    label: "Pickup",
    value: "pickup",
  },
  {
    label: "Trailer",
    value: "trailer",
  },
  {
    label: "Other",
    value: "other",
  },
];

/**
 * Fuel Types
 */
export const FUEL_TYPES: {
  label: string;
  value: FuelType;
}[] = [
  {
    label: "Diesel",
    value: "diesel",
  },
  {
    label: "Petrol",
    value: "petrol",
  },
  {
    label: "CNG",
    value: "cng",
  },
  {
    label: "LNG",
    value: "lng",
  },
  {
    label: "Electric",
    value: "electric",
  },
  {
    label: "Hybrid",
    value: "hybrid",
  },
];

/**
 * Transmission Types
 */
export const TRANSMISSION_TYPES = [
  {
    label: "Manual",
    value: "Manual",
  },
  {
    label: "Automatic",
    value: "Automatic",
  },
  {
    label: "Semi Automatic",
    value: "Semi Automatic",
  },
] as const;

/**
 * Vehicle Status
 */
export const VEHICLE_STATUS = [
  {
    label: "Active",
    value: "active" satisfies VehicleStatus,
  },
  {
    label: "Inactive",
    value: "inactive" satisfies VehicleStatus,
  },
  {
    label: "Maintenance",
    value: "maintenance" satisfies VehicleStatus,
  },
  {
    label: "Sold",
    value: "sold" satisfies VehicleStatus,
  },
];

/**
 * Table Sort Options
 */
export const VEHICLE_SORT_OPTIONS = [
  {
    label: "Vehicle Number",
    value: "vehicleNumber",
  },
  {
    label: "Manufacturer",
    value: "manufacturer",
  },
  {
    label: "Vehicle Model",
    value: "vehicleModel",
  },
  {
    label: "Manufacturing Year",
    value: "manufacturingYear",
  },
  {
    label: "Created Date",
    value: "createdAt",
  },
];

/**
 * Pagination
 */
export const VEHICLE_PAGE_SIZES = [10, 20, 50, 100];

/**
 * Default Query
 */
export const DEFAULT_VEHICLE_QUERY = {
  page: 1,
  limit: 10,
  search: "",
  sortBy: "createdAt",
  sortOrder: "desc" as const,
};
