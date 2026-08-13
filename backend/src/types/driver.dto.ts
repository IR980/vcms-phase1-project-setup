import {
  DriverGender,
  DriverStatus,
  LicenseType,
} from "../models/Driver.model";

/**
 * Create Driver DTO
 */
export interface CreateDriverDto {
  companyId: string;

  employeeId?: string;

  firstName: string;

  lastName?: string;

  dateOfBirth?: string | Date;

  gender?: DriverGender;

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

  licenseType: LicenseType;

  licenseIssueDate?: string | Date;

  licenseExpiryDate: string | Date;

  issuingAuthority?: string;

  joiningDate?: string | Date;

  department?: string;

  assignedVehicle?: string;

  status?: DriverStatus;
}

/**
 * Update Driver DTO
 *
 * All fields are optional because
 * the update endpoint supports partial updates.
 */
export interface UpdateDriverDto extends Partial<CreateDriverDto> {}

/**
 * Driver Query DTO
 */
export interface DriverQueryDto {
  page: number;

  limit: number;

  search?: string;

  companyId?: string;

  status?: DriverStatus;

  licenseType?: LicenseType;

  assignedVehicle?: string;

  licenseExpiryFrom?: string;

  licenseExpiryTo?: string;

  sortBy:
    | "firstName"
    | "lastName"
    | "employeeId"
    | "licenseExpiryDate"
    | "joiningDate"
    | "createdAt";

  sortOrder: "asc" | "desc";
}
