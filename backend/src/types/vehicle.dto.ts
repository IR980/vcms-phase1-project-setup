import { FuelType, VehicleStatus, VehicleType } from "../models/Vehicle.model";

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

  registrationDate?: Date;

  chassisNumber: string;

  engineNumber: string;

  currentOdometer: number;

  assignedDriver?: string;

  status?: VehicleStatus;
}

export interface UpdateVehicleDto extends Partial<CreateVehicleDto> {}

export interface VehicleQueryDto {
  page: number;

  limit: number;

  search?: string;

  companyId?: string;

  status?: VehicleStatus;

  vehicleType?: VehicleType;

  fuelType?: FuelType;

  sortBy: string;

  sortOrder: "asc" | "desc";
}
