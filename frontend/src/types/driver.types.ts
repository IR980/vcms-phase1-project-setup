import type {
  DriverGender,
  DriverStatus,
  LicenseType,
} from "../constants/driver.constants";

/**
 * Driver Gender
 */
export type DriverGenderType = DriverGender | string;

/**
 * Driver Status
 */
export type DriverStatusType = DriverStatus | string;

/**
 * License Type
 */
export type LicenseTypeValue = LicenseType | string;

/**
 * Populated Company
 */
export interface DriverCompany {
  _id: string;

  companyName: string;

  legalName?: string;

  email?: string;

  phone?: string;
}

/**
 * Populated Vehicle
 */
export interface DriverVehicle {
  _id: string;

  vehicleNumber: string;

  vehicleName?: string;

  vehicleType?: string;

  manufacturer?: string;

  vehicleModel?: string;

  registrationNumber?: string;

  status?: string;
}

/**
 * Driver
 */
export interface Driver {
  _id: string;

  companyId: string | DriverCompany;

  employeeId?: string;

  firstName: string;

  lastName?: string;

  dateOfBirth?: string;

  gender?: DriverGenderType;

  profilePhoto?: string;

  mobileNumber: string;

  email?: string;

  address?: string;

  city?: string;

  state?: string;

  pincode?: string;

  emergencyContactName?: string;

  emergencyContactNumber?: string;

  licenseNumber: string;

  licenseType: LicenseTypeValue;

  licenseIssueDate?: string;

  licenseExpiryDate: string;

  issuingAuthority?: string;

  joiningDate?: string;

  department?: string;

  assignedVehicle: string | DriverVehicle | null;

  status: DriverStatusType;

  isActive: boolean;

  isDeleted: boolean;

  createdBy: string;

  updatedBy?: string;

  createdAt: string;

  updatedAt: string;
}

/**
 * Create Driver DTO
 */
export interface CreateDriverDto {
  companyId: string;

  employeeId?: string;

  firstName: string;

  lastName?: string;

  dateOfBirth?: string;

  gender?: DriverGenderType;

  profilePhoto?: string;

  mobileNumber: string;

  email?: string;

  address?: string;

  city?: string;

  state?: string;

  pincode?: string;

  emergencyContactName?: string;

  emergencyContactNumber?: string;

  licenseNumber: string;

  licenseType: LicenseTypeValue;

  licenseIssueDate?: string;

  licenseExpiryDate: string;

  issuingAuthority?: string;

  joiningDate?: string;

  department?: string;

  assignedVehicle?: string;

  status?: DriverStatusType;
}

/**
 * Update Driver DTO
 */
export type UpdateDriverDto = Partial<CreateDriverDto>;

/**
 * Driver Query Parameters
 */
export interface DriverQueryParams {
  page?: number;

  limit?: number;

  search?: string;

  companyId?: string;

  status?: DriverStatusType;

  licenseType?: LicenseTypeValue;

  assignedVehicle?: string;

  licenseExpiryFrom?: string;

  licenseExpiryTo?: string;

  sortBy?:
    | "firstName"
    | "lastName"
    | "employeeId"
    | "licenseExpiryDate"
    | "joiningDate"
    | "createdAt";

  sortOrder?: "asc" | "desc";
}

/**
 * Pagination
 */
export interface DriverPagination {
  page: number;

  limit: number;

  total: number;

  totalPages: number;
}

/**
 * Driver List Data
 */
export interface DriverListData {
  drivers: Driver[];

  pagination: DriverPagination;
}

/**
 * Generic API Response
 */
export interface ApiResponse<T> {
  success: boolean;

  message: string;

  data: T;
}

/**
 * Driver List Response
 */
export type DriverListResponse = ApiResponse<DriverListData>;

/**
 * Single Driver Response
 */
export type DriverResponse = ApiResponse<Driver>;
