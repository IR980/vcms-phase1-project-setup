import mongoose from "mongoose";

import { Driver, DriverStatus } from "../models/Driver.model";
import { Company } from "../models/Company.model";
import { Vehicle } from "../models/Vehicle.model";

import {
  CreateDriverDto,
  UpdateDriverDto,
  DriverQueryDto,
} from "../types/driver.dto";

import { ApiError } from "../utils/ApiError";

class DriverService {
  /**
   * Create Driver
   */
  async createDriver(payload: CreateDriverDto, userId: string) {
    /**
     * Validate Company
     */
    const company = await Company.findOne({
      _id: payload.companyId,
      isDeleted: false,
    });

    if (!company) {
      throw new ApiError(404, "Company not found");
    }

    /**
     * Check Employee ID
     *
     * Employee ID is unique within a company.
     */
    if (payload.employeeId) {
      const employeeExists = await Driver.exists({
        companyId: payload.companyId,
        employeeId: payload.employeeId.toUpperCase(),
        isDeleted: false,
      });

      if (employeeExists) {
        throw new ApiError(409, "Employee ID already exists");
      }
    }

    /**
     * Check License Number
     *
     * License number is unique within a company.
     */
    const licenseExists = await Driver.exists({
      companyId: payload.companyId,
      licenseNumber: payload.licenseNumber.toUpperCase(),
      isDeleted: false,
    });

    if (licenseExists) {
      throw new ApiError(409, "License number already exists");
    }

    /**
     * Validate Assigned Vehicle
     */
    if (payload.assignedVehicle) {
      const vehicle = await Vehicle.findOne({
        _id: payload.assignedVehicle,
        companyId: payload.companyId,
        isDeleted: false,
      });

      if (!vehicle) {
        throw new ApiError(404, "Assigned vehicle not found");
      }

      /**
       * Prevent assigning an already assigned vehicle
       */
      if (vehicle.assignedDriver) {
        throw new ApiError(
          409,
          "Vehicle is already assigned to another driver",
        );
      }
    }

    /**
     * Create Driver
     */
    const driver = await Driver.create({
      ...payload,

      employeeId: payload.employeeId?.toUpperCase(),

      licenseNumber: payload.licenseNumber.toUpperCase(),

      assignedVehicle: payload.assignedVehicle
        ? new mongoose.Types.ObjectId(payload.assignedVehicle)
        : null,

      createdBy: new mongoose.Types.ObjectId(userId),
    });

    /**
     * Update Vehicle Assignment
     */
    if (payload.assignedVehicle) {
      await Vehicle.findByIdAndUpdate(payload.assignedVehicle, {
        $set: {
          assignedDriver: driver._id,
        },
      });
    }

    return driver;
  }
  /**
   * Get Drivers
   */
  async getDrivers(query: DriverQueryDto) {
    const {
      page,
      limit,
      search,
      companyId,
      status,
      licenseType,
      assignedVehicle,
      licenseExpiryFrom,
      licenseExpiryTo,
      sortBy,
      sortOrder,
    } = query;

    /**
     * Base Filter
     */
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
     * Status Filter
     */
    if (status) {
      filter.status = status;
    }

    /**
     * License Type Filter
     */
    if (licenseType) {
      filter.licenseType = licenseType;
    }

    /**
     * Assigned Vehicle Filter
     */
    if (assignedVehicle) {
      filter.assignedVehicle = new mongoose.Types.ObjectId(assignedVehicle);
    }

    /**
     * Search
     */
    if (search) {
      filter.$or = [
        {
          firstName: {
            $regex: search,
            $options: "i",
          },
        },
        {
          lastName: {
            $regex: search,
            $options: "i",
          },
        },
        {
          employeeId: {
            $regex: search,
            $options: "i",
          },
        },
        {
          mobileNumber: {
            $regex: search,
            $options: "i",
          },
        },
        {
          email: {
            $regex: search,
            $options: "i",
          },
        },
        {
          licenseNumber: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    /**
     * License Expiry Filter
     */
    if (licenseExpiryFrom || licenseExpiryTo) {
      const expiryFilter: Record<string, Date> = {};

      if (licenseExpiryFrom) {
        expiryFilter.$gte = new Date(licenseExpiryFrom);
      }

      if (licenseExpiryTo) {
        const expiryTo = new Date(licenseExpiryTo);

        /**
         * Include the complete expiry date.
         *
         * Example:
         * 2026-08-31
         * becomes
         * 2026-08-31 23:59:59.999
         */
        expiryTo.setHours(23, 59, 59, 999);

        expiryFilter.$lte = expiryTo;
      }

      filter.licenseExpiryDate = expiryFilter;
    }

    /**
     * Total Records
     */
    const total = await Driver.countDocuments(filter);

    /**
     * Sorting
     */
    const sort: Record<string, 1 | -1> = {
      [sortBy]: sortOrder === "asc" ? 1 : -1,
    };

    /**
     * Fetch Drivers
     */
    const drivers = await Driver.find(filter)
      .populate("companyId", "companyName legalName")
      .populate(
        "assignedVehicle",
        "vehicleNumber vehicleName vehicleModel manufacturer",
      )
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    /**
     * Pagination
     */
    return {
      drivers,

      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
  /**
   * Get Driver By ID
   */
  async getDriverById(id: string) {
    /**
     * Validate ObjectId
     */
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError(400, "Invalid driver ID");
    }

    /**
     * Find Driver
     */
    const driver = await Driver.findOne({
      _id: id,
      isDeleted: false,
    })
      .populate("companyId", "companyName legalName email phone")
      .populate(
        "assignedVehicle",
        "vehicleNumber vehicleName vehicleType manufacturer vehicleModel registrationNumber status",
      );

    /**
     * Driver Not Found
     */
    if (!driver) {
      throw new ApiError(404, "Driver not found");
    }

    return driver;
  }
  /**
   * Update Driver
   */
  async updateDriver(id: string, payload: UpdateDriverDto, userId: string) {
    /**
     * Validate Driver ID
     */
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError(400, "Invalid driver ID");
    }

    /**
     * Find Existing Driver
     */
    const driver = await Driver.findOne({
      _id: id,
      isDeleted: false,
    });

    if (!driver) {
      throw new ApiError(404, "Driver not found");
    }

    /**
     * Determine Company
     *
     * If companyId is not provided in the update,
     * keep the existing company.
     */
    const companyId = payload.companyId ?? driver.companyId.toString();

    /**
     * Validate Company
     *
     * Only required when company is changed.
     */
    if (
      payload.companyId &&
      payload.companyId !== driver.companyId.toString()
    ) {
      const company = await Company.findOne({
        _id: payload.companyId,
        isDeleted: false,
      });

      if (!company) {
        throw new ApiError(404, "Company not found");
      }
    }

    /**
     * Check Employee ID
     */
    if (
      payload.employeeId &&
      payload.employeeId.toUpperCase() !== driver.employeeId
    ) {
      const employeeExists = await Driver.exists({
        companyId,
        employeeId: payload.employeeId.toUpperCase(),
        _id: {
          $ne: id,
        },
        isDeleted: false,
      });

      if (employeeExists) {
        throw new ApiError(409, "Employee ID already exists");
      }
    }

    /**
     * Check License Number
     */
    if (
      payload.licenseNumber &&
      payload.licenseNumber.toUpperCase() !== driver.licenseNumber
    ) {
      const licenseExists = await Driver.exists({
        companyId,
        licenseNumber: payload.licenseNumber.toUpperCase(),
        _id: {
          $ne: id,
        },
        isDeleted: false,
      });

      if (licenseExists) {
        throw new ApiError(409, "License number already exists");
      }
    }

    /**
     * Validate License Dates
     */
    const licenseIssueDate =
      payload.licenseIssueDate ?? driver.licenseIssueDate;

    const licenseExpiryDate =
      payload.licenseExpiryDate ?? driver.licenseExpiryDate;

    if (licenseIssueDate && licenseExpiryDate) {
      const issueDate = new Date(licenseIssueDate);

      const expiryDate = new Date(licenseExpiryDate);

      if (expiryDate < issueDate) {
        throw new ApiError(
          400,
          "License expiry date must be after the issue date",
        );
      }
    }

    /**
     * Handle Vehicle Assignment
     */
    if (payload.assignedVehicle !== undefined) {
      /**
       * If assigning a new vehicle
       */
      if (
        payload.assignedVehicle &&
        payload.assignedVehicle !== driver.assignedVehicle?.toString()
      ) {
        const vehicle = await Vehicle.findOne({
          _id: payload.assignedVehicle,
          companyId,
          isDeleted: false,
        });

        if (!vehicle) {
          throw new ApiError(404, "Assigned vehicle not found");
        }

        /**
         * Vehicle already assigned
         */
        if (
          vehicle.assignedDriver &&
          vehicle.assignedDriver.toString() !== id
        ) {
          throw new ApiError(
            409,
            "Vehicle is already assigned to another driver",
          );
        }
      }

      /**
       * Remove old vehicle assignment
       */
      if (
        driver.assignedVehicle &&
        (!payload.assignedVehicle ||
          payload.assignedVehicle !== driver.assignedVehicle.toString())
      ) {
        await Vehicle.findOneAndUpdate(
          {
            _id: driver.assignedVehicle,
            assignedDriver: driver._id,
          },
          {
            $set: {
              assignedDriver: null,
            },
          },
        );
      }

      /**
       * Assign new vehicle
       */
      if (payload.assignedVehicle) {
        await Vehicle.findByIdAndUpdate(payload.assignedVehicle, {
          $set: {
            assignedDriver: driver._id,
          },
        });
      }
    }

    /**
     * Normalize Fields
     */
    if (payload.employeeId !== undefined) {
      payload.employeeId = payload.employeeId.toUpperCase();
    }

    if (payload.licenseNumber !== undefined) {
      payload.licenseNumber = payload.licenseNumber.toUpperCase();
    }

    /**
     * Update Driver
     */
    Object.assign(driver, {
      ...payload,

      companyId: new mongoose.Types.ObjectId(companyId),

      updatedBy: new mongoose.Types.ObjectId(userId),
    });

    /**
     * Save
     */
    await driver.save();

    /**
     * Return Updated Driver
     */
    return Driver.findById(driver._id)
      .populate("companyId", "companyName legalName email phone")
      .populate(
        "assignedVehicle",
        "vehicleNumber vehicleName vehicleType manufacturer vehicleModel registrationNumber status",
      );
  }
  /**
   * Soft Delete Driver
   */
  async deleteDriver(id: string) {
    /**
     * Validate Driver ID
     */
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError(400, "Invalid driver ID");
    }

    /**
     * Find Driver
     */
    const driver = await Driver.findOne({
      _id: id,
      isDeleted: false,
    });

    if (!driver) {
      throw new ApiError(404, "Driver not found");
    }

    /**
     * Remove Vehicle Assignment
     *
     * Only clear the vehicle if it is currently
     * assigned to this driver.
     */
    if (driver.assignedVehicle) {
      await Vehicle.findOneAndUpdate(
        {
          _id: driver.assignedVehicle,
          assignedDriver: driver._id,
        },
        {
          $set: {
            assignedDriver: null,
          },
        },
      );
    }

    /**
     * Soft Delete Driver
     */
    driver.isDeleted = true;
    driver.isActive = false;
    driver.status = DriverStatus.INACTIVE;
    driver.assignedVehicle = null;
    await driver.save();

    return {
      message: "Driver deleted successfully",
    };
  }
}

export default new DriverService();
