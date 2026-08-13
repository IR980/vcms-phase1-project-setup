import { Response } from "express";

import vehicleService from "../services/vehicle.service";

import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";

import {
  CreateVehicleDto,
  UpdateVehicleDto,
  VehicleQueryDto,
} from "../types/vehicle.dto";
import { AuthRequest } from "../types/request.types";

/**
 * Create Vehicle
 */
export const createVehicle = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const vehicle = await vehicleService.createVehicle(
      req.body as CreateVehicleDto,
      req.user!.id,
    );

    return res
      .status(201)
      .json(new ApiResponse(201, "Vehicle created successfully", vehicle));
  },
);

/**
 * Get Vehicles
 */
export const getVehicles = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const result = await vehicleService.getVehicles(
      req.query as unknown as VehicleQueryDto,
    );

    return res
      .status(200)
      .json(new ApiResponse(200, "Vehicles fetched successfully", result));
  },
);

/**
 * Get Vehicle By ID
 */
export const getVehicleById = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const vehicle = await vehicleService.getVehicleById(req.params.id);

    return res
      .status(200)
      .json(new ApiResponse(200, "Vehicle fetched successfully", vehicle));
  },
);

/**
 * Update Vehicle
 */
export const updateVehicle = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const vehicle = await vehicleService.updateVehicle(
      req.params.id,
      req.body as UpdateVehicleDto,
      req.user!.id,
    );

    return res
      .status(200)
      .json(new ApiResponse(200, "Vehicle updated successfully", vehicle));
  },
);

/**
 * Delete Vehicle
 */
export const deleteVehicle = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const result = await vehicleService.deleteVehicle(
      req.params.id,
      req.user!.id,
    );

    return res
      .status(200)
      .json(new ApiResponse(200, "Vehicle deleted successfully", result));
  },
);
