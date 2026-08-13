// export type VehicleStatus = "active" | "inactive" | "maintenance" | "sold";

// export type VehicleType =
//   | "truck"
//   | "bus"
//   | "car"
//   | "van"
//   | "pickup"
//   | "trailer"
//   | "other";

// export type FuelType =
//   | "diesel"
//   | "petrol"
//   | "cng"
//   | "lng"
//   | "electric"
//   | "hybrid";

// /**
//  * Company (Minimal)
//  */
// export interface CompanySummary {
//   _id: string;
//   companyName: string;
//   legalName?: string;
// }

// /**
//  * Driver (Minimal)
//  */
// export interface DriverSummary {
//   _id: string;
//   name: string;
//   email: string;
// }

// /**
//  * Vehicle
//  */
// export interface Vehicle {
//   _id: string;

//   companyId: string | CompanySummary;

//   vehicleNumber: string;

//   vehicleName?: string;

//   vehicleType: VehicleType;

//   manufacturer: string;

//   vehicleModel: string;

//   manufacturingYear: number;

//   color?: string;

//   fuelType: FuelType;

//   transmission?: string;

//   registrationNumber: string;

//   registrationDate?: string;

//   chassisNumber: string;

//   engineNumber: string;

//   currentOdometer: number;

//   assignedDriver?: string | DriverSummary | null;

//   status: VehicleStatus;

//   isActive: boolean;

//   isDeleted?: boolean;

//   createdBy: string;

//   updatedBy?: string;

//   createdAt: string;

//   updatedAt: string;
// }

// /**
//  * Create Vehicle DTO
//  */
// export interface CreateVehicleDto {
//   companyId: string;

//   vehicleNumber: string;

//   vehicleName?: string;

//   vehicleType: VehicleType;

//   manufacturer: string;

//   vehicleModel: string;

//   manufacturingYear: number;

//   color?: string;

//   fuelType: FuelType;

//   transmission?: string;

//   registrationNumber: string;

//   registrationDate?: string;

//   chassisNumber: string;

//   engineNumber: string;

//   currentOdometer: number;

//   assignedDriver?: string;

//   status?: VehicleStatus;
// }

// /**
//  * Update Vehicle DTO
//  */
// export type UpdateVehicleDto = Partial<CreateVehicleDto>;

// /**
//  * Vehicle Query
//  */
// export interface VehicleQueryDto {
//   page?: number;

//   limit?: number;

//   search?: string;

//   companyId?: string;

//   status?: VehicleStatus;

//   vehicleType?: VehicleType;

//   fuelType?: FuelType;

//   sortBy?:
//     | "vehicleNumber"
//     | "manufacturer"
//     | "vehicleModel"
//     | "manufacturingYear"
//     | "createdAt";

//   sortOrder?: "asc" | "desc";
// }

// /**
//  * Pagination
//  */
// export interface Pagination {
//   page: number;

//   limit: number;

//   total: number;

//   totalPages: number;
// }

// /**
//  * Vehicle List Response
//  */
// export interface VehicleListData {
//   vehicles: Vehicle[];

//   pagination: Pagination;
// }

// /**
//  * API Response
//  */
// export interface ApiResponse<T> {
//   success?: boolean;

//   statusCode?: number;

//   message: string;

//   data: T;
// }

// /**
//  * Vehicle Response
//  */
// export type VehicleResponse = ApiResponse<Vehicle>;

// /**
//  * Vehicle List Response
//  */
// export type VehicleListResponse = ApiResponse<VehicleListData>;

/**
 * ============================================================
 * Vehicle Status
 * ============================================================
 */
export type VehicleStatus = "active" | "inactive" | "maintenance" | "sold";

/**
 * ============================================================
 * Vehicle Type
 * ============================================================
 */
export type VehicleType =
  | "truck"
  | "bus"
  | "car"
  | "van"
  | "pickup"
  | "trailer"
  | "other";

/**
 * ============================================================
 * Fuel Type
 * ============================================================
 */
export type FuelType =
  | "diesel"
  | "petrol"
  | "cng"
  | "lng"
  | "electric"
  | "hybrid";

/**
 * ============================================================
 * Company Summary
 * ============================================================
 */
export interface CompanySummary {
  _id: string;
  companyName: string;
  legalName?: string;
}

/**
 * ============================================================
 * Driver Summary
 * ============================================================
 */
export interface DriverSummary {
  _id: string;
  name: string;
  email: string;
}

/**
 * ============================================================
 * Vehicle
 * ============================================================
 */
export interface Vehicle {
  _id: string;

  companyId: string | CompanySummary;

  vehicleNumber: string;

  vehicleName?: string;

  vehicleType: VehicleType;

  manufacturer: string;

  vehicleModel: string;

  manufacturingYear: number;

  color?: string;

  fuelType: FuelType;

  transmission?: string;

  registrationNumber: string;

  registrationDate?: string;

  chassisNumber: string;

  engineNumber: string;

  currentOdometer: number;

  assignedDriver?: string | DriverSummary | null;

  status: VehicleStatus;

  isActive: boolean;

  isDeleted?: boolean;

  createdBy: string;

  updatedBy?: string;

  createdAt: string;

  updatedAt: string;
}

/**
 * ============================================================
 * Create Vehicle DTO
 * ============================================================
 */
export interface CreateVehicleDto {
  companyId: string;

  vehicleNumber: string;

  vehicleName?: string;

  vehicleType: VehicleType;

  manufacturer: string;

  vehicleModel: string;

  manufacturingYear: number;

  color?: string;

  fuelType: FuelType;

  transmission?: string;

  registrationNumber: string;

  registrationDate?: string;

  chassisNumber: string;

  engineNumber: string;

  currentOdometer: number;

  assignedDriver?: string;

  status?: VehicleStatus;
}

/**
 * ============================================================
 * Update Vehicle DTO
 * ============================================================
 */
export type UpdateVehicleDto = Partial<CreateVehicleDto>;

/**
 * ============================================================
 * Vehicle Query
 * ============================================================
 */
export interface VehicleQueryDto {
  page?: number;

  limit?: number;

  search?: string;

  companyId?: string;

  status?: VehicleStatus;

  vehicleType?: VehicleType;

  fuelType?: FuelType;

  sortBy?:
    | "vehicleNumber"
    | "manufacturer"
    | "vehicleModel"
    | "manufacturingYear"
    | "createdAt";

  sortOrder?: "asc" | "desc";
}

/**
 * ============================================================
 * Pagination
 * ============================================================
 */
export interface Pagination {
  page: number;

  limit: number;

  total: number;

  totalPages: number;
}

/**
 * ============================================================
 * Vehicle List Data
 * ============================================================
 */
export interface VehicleListData {
  vehicles: Vehicle[];

  pagination: Pagination;
}

/**
 * ============================================================
 * Generic API Response
 * ============================================================
 */
export interface ApiResponse<T> {
  success?: boolean;

  statusCode?: number;

  message: string;

  data: T;
}

/**
 * ============================================================
 * Vehicle Response
 * ============================================================
 */
export type VehicleResponse = ApiResponse<Vehicle>;

/**
 * ============================================================
 * Vehicle List Response
 * ============================================================
 */
export type VehicleListResponse = ApiResponse<VehicleListData>;
