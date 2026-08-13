import { Response } from "express";

import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";

import driverService from "../services/driver.service";

import {
  CreateDriverDto,
  UpdateDriverDto,
  DriverQueryDto,
} from "../types/driver.dto";
import { AuthRequest } from "../types/request.types";

/**
 * Create Driver
 */
export const createDriver = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json(new ApiResponse(401, "Unauthorized", null));
    }

    const driver = await driverService.createDriver(
      req.body as CreateDriverDto,
      userId.toString(),
    );

    return res
      .status(201)
      .json(new ApiResponse(201, "Driver created successfully", driver));
  },
);

/**
 * Get Drivers
 */
export const getDrivers = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const result = await driverService.getDrivers(
      req.query as unknown as DriverQueryDto,
    );

    return res
      .status(200)
      .json(new ApiResponse(200, "Drivers fetched successfully", result));
  },
);

/**
 * Get Driver By ID
 */
export const getDriverById = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const driver = await driverService.getDriverById(req.params.id);

    return res
      .status(200)
      .json(new ApiResponse(200, "Driver fetched successfully", driver));
  },
);

/**
 * Update Driver
 */
export const updateDriver = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json(new ApiResponse(401, "Unauthorized", null));
    }

    const driver = await driverService.updateDriver(
      req.params.id,
      req.body as UpdateDriverDto,
      userId.toString(),
    );

    return res
      .status(200)
      .json(new ApiResponse(200, "Driver updated successfully", driver));
  },
);

/**
 * Delete Driver
 */
export const deleteDriver = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const result = await driverService.deleteDriver(req.params.id);

    return res.status(200).json(new ApiResponse(200, result.message, null));
  },
);
