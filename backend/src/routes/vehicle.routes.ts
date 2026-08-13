import { Router } from "express";

import {
  createVehicle,
  getVehicles,
  getVehicleById,
  updateVehicle,
  deleteVehicle,
} from "../controllers/vehicle.controller";
import { UserRole } from "../types/auth.types";
import { authenticate, authorize } from "../middleware/auth";
import { validateBody } from "../middleware/validate";

import {
  createVehicleSchema,
  updateVehicleSchema,
} from "../utils/validation/vehicle.validation";

const router = Router();

/**
 * All vehicle routes require authentication
 */
router.use(authenticate);

/**
 * Get Vehicles
 */
router.get("/", getVehicles);

/**
 * Get Vehicle By ID
 */
router.get("/:id", getVehicleById);

/**
 * Create Vehicle
 */
router.post(
  "/",
  authorize(UserRole.COMPANY_ADMIN, UserRole.STAFF),
  validateBody(createVehicleSchema),
  createVehicle,
);

/**
 * Update Vehicle
 */
router.put(
  "/:id",
  authorize(UserRole.COMPANY_ADMIN, UserRole.STAFF),
  validateBody(updateVehicleSchema),
  updateVehicle,
);

/**
 * Delete Vehicle
 */
router.delete("/:id", authorize(UserRole.COMPANY_ADMIN), deleteVehicle);

export default router;
