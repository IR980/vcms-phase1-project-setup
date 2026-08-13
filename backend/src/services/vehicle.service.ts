import mongoose from "mongoose";

import { Vehicle } from "../models/Vehicle.model";
import { Company } from "../models/Company.model";

import {
  CreateVehicleDto,
  UpdateVehicleDto,
  VehicleQueryDto,
} from "../types/vehicle.dto";

import { ApiError } from "../utils/ApiError";

class VehicleService {
  /**
   * Create Vehicle
   */
  async createVehicle(payload: CreateVehicleDto, userId: string) {
    /**
     * Check Company
     */
    const company = await Company.findOne({
      _id: payload.companyId,
      isDeleted: false,
    });

    if (!company) {
      throw new ApiError(404, "Company not found");
    }

    /**
     * Vehicle Number
     */
    const vehicleNumberExists = await Vehicle.exists({
      companyId: payload.companyId,
      vehicleNumber: payload.vehicleNumber.toUpperCase(),
      isDeleted: false,
    });

    if (vehicleNumberExists) {
      throw new ApiError(409, "Vehicle number already exists");
    }

    /**
     * Registration Number
     */
    const registrationExists = await Vehicle.exists({
      companyId: payload.companyId,
      registrationNumber: payload.registrationNumber.toUpperCase(),
      isDeleted: false,
    });

    if (registrationExists) {
      throw new ApiError(409, "Registration number already exists");
    }

    /**
     * Chassis Number
     */
    const chassisExists = await Vehicle.exists({
      chassisNumber: payload.chassisNumber.toUpperCase(),
      isDeleted: false,
    });

    if (chassisExists) {
      throw new ApiError(409, "Chassis number already exists");
    }

    /**
     * Engine Number
     */
    const engineExists = await Vehicle.exists({
      engineNumber: payload.engineNumber.toUpperCase(),
      isDeleted: false,
    });

    if (engineExists) {
      throw new ApiError(409, "Engine number already exists");
    }

    /**
     * Create Vehicle
     */
    const vehicle = await Vehicle.create({
      ...payload,

      vehicleNumber: payload.vehicleNumber.toUpperCase(),

      registrationNumber: payload.registrationNumber.toUpperCase(),

      chassisNumber: payload.chassisNumber.toUpperCase(),

      engineNumber: payload.engineNumber.toUpperCase(),

      companyId: new mongoose.Types.ObjectId(payload.companyId),

      assignedDriver: payload.assignedDriver
        ? new mongoose.Types.ObjectId(payload.assignedDriver)
        : null,

      createdBy: new mongoose.Types.ObjectId(userId),
    });

    return vehicle;
  }
  /**
   * Get Vehicles
   */
  async getVehicles(query: VehicleQueryDto) {
    const {
      page,
      limit,
      search,
      companyId,
      status,
      vehicleType,
      fuelType,
      sortBy,
      sortOrder,
    } = query;

    const filter: Record<string, unknown> = {
      isDeleted: false,
    };

    /**
     * Company Filter
     */
    if (companyId) {
      filter.companyId = new mongoose.Types.ObjectId(companyId);
    }

    /**
     * Search
     */
    if (search) {
      filter.$or = [
        {
          vehicleNumber: {
            $regex: search,
            $options: "i",
          },
        },
        {
          registrationNumber: {
            $regex: search,
            $options: "i",
          },
        },
        {
          manufacturer: {
            $regex: search,
            $options: "i",
          },
        },
        {
          vehicleModel: {
            $regex: search,
            $options: "i",
          },
        },
        {
          vehicleName: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    /**
     * Status Filter
     */
    if (status) {
      filter.status = status;
    }

    /**
     * Vehicle Type Filter
     */
    if (vehicleType) {
      filter.vehicleType = vehicleType;
    }

    /**
     * Fuel Type Filter
     */
    if (fuelType) {
      filter.fuelType = fuelType;
    }

    /**
     * Total Count
     */
    const total = await Vehicle.countDocuments(filter);

    /**
     * Vehicles
     */
    const vehicles = await Vehicle.find(filter)
      .populate("companyId", "companyName")
      .populate("assignedDriver", "name email")
      .sort({
        [sortBy]: sortOrder === "asc" ? 1 : -1,
      })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return {
      vehicles,

      pagination: {
        page,

        limit,

        total,

        totalPages: Math.ceil(total / limit),
      },
    };
  }
  /**
   * Get Vehicle By ID
   */
  async getVehicleById(id: string) {
    const vehicle = await Vehicle.findOne({
      _id: id,
      isDeleted: false,
    })
      .populate({
        path: "companyId",
        select: "companyName legalName ownerName email phone status",
      })
      .populate({
        path: "assignedDriver",
        select: "name email role isActive",
      });

    if (!vehicle) {
      throw new ApiError(404, "Vehicle not found");
    }

    return vehicle;
  }
  /**
   * Update Vehicle
   */
  async updateVehicle(id: string, payload: UpdateVehicleDto, userId: string) {
    /**
     * Find Vehicle
     */
    const vehicle = await Vehicle.findOne({
      _id: id,
      isDeleted: false,
    });

    if (!vehicle) {
      throw new ApiError(404, "Vehicle not found");
    }

    /**
     * Validate Company
     */
    if (
      payload.companyId &&
      payload.companyId !== vehicle.companyId.toString()
    ) {
      const company = await Company.findOne({
        _id: payload.companyId,
        isDeleted: false,
      });

      if (!company) {
        throw new ApiError(404, "Company not found");
      }

      vehicle.companyId = new mongoose.Types.ObjectId(payload.companyId);
    }

    /**
     * Vehicle Number
     */
    if (
      payload.vehicleNumber &&
      payload.vehicleNumber.toUpperCase() !== vehicle.vehicleNumber
    ) {
      const exists = await Vehicle.exists({
        companyId: vehicle.companyId,
        vehicleNumber: payload.vehicleNumber.toUpperCase(),
        _id: { $ne: id },
        isDeleted: false,
      });

      if (exists) {
        throw new ApiError(409, "Vehicle number already exists");
      }

      vehicle.vehicleNumber = payload.vehicleNumber.toUpperCase();
    }

    /**
     * Registration Number
     */
    if (
      payload.registrationNumber &&
      payload.registrationNumber.toUpperCase() !== vehicle.registrationNumber
    ) {
      const exists = await Vehicle.exists({
        companyId: vehicle.companyId,
        registrationNumber: payload.registrationNumber.toUpperCase(),
        _id: { $ne: id },
        isDeleted: false,
      });

      if (exists) {
        throw new ApiError(409, "Registration number already exists");
      }

      vehicle.registrationNumber = payload.registrationNumber.toUpperCase();
    }

    /**
     * Chassis Number
     */
    if (
      payload.chassisNumber &&
      payload.chassisNumber.toUpperCase() !== vehicle.chassisNumber
    ) {
      const exists = await Vehicle.exists({
        chassisNumber: payload.chassisNumber.toUpperCase(),
        _id: { $ne: id },
        isDeleted: false,
      });

      if (exists) {
        throw new ApiError(409, "Chassis number already exists");
      }

      vehicle.chassisNumber = payload.chassisNumber.toUpperCase();
    }

    /**
     * Engine Number
     */
    if (
      payload.engineNumber &&
      payload.engineNumber.toUpperCase() !== vehicle.engineNumber
    ) {
      const exists = await Vehicle.exists({
        engineNumber: payload.engineNumber.toUpperCase(),
        _id: { $ne: id },
        isDeleted: false,
      });

      if (exists) {
        throw new ApiError(409, "Engine number already exists");
      }

      vehicle.engineNumber = payload.engineNumber.toUpperCase();
    }

    /**
     * Update Remaining Fields
     */
    Object.assign(vehicle, {
      ...payload,
      vehicleNumber: vehicle.vehicleNumber,
      registrationNumber: vehicle.registrationNumber,
      chassisNumber: vehicle.chassisNumber,
      engineNumber: vehicle.engineNumber,
    });

    /**
     * Driver
     */
    if (payload.assignedDriver !== undefined) {
      vehicle.assignedDriver = payload.assignedDriver
        ? new mongoose.Types.ObjectId(payload.assignedDriver)
        : undefined;
    }

    /**
     * Audit
     */
    vehicle.updatedBy = new mongoose.Types.ObjectId(userId);

    /**
     * Save
     */
    await vehicle.save();

    return vehicle;
  }
  /**
   * Soft Delete Vehicle
   */
  async deleteVehicle(id: string, userId: string) {
    /**
     * Find Vehicle
     */
    const vehicle = await Vehicle.findOne({
      _id: id,
      isDeleted: false,
    });

    if (!vehicle) {
      throw new ApiError(404, "Vehicle not found");
    }

    /**
     * Soft Delete
     */
    vehicle.isDeleted = true;

    vehicle.isActive = false;

    /**
     * Audit
     */
    vehicle.updatedBy = new mongoose.Types.ObjectId(userId);

    await vehicle.save();

    return {
      message: "Vehicle deleted successfully",
    };
  }
}

export default new VehicleService();
