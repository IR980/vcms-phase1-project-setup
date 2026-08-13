// import { Router } from "express";

// import {
//   createDriver,
//   getDrivers,
//   getDriverById,
//   updateDriver,
//   deleteDriver,
// } from "../controllers/driver.controller";

// import {
//   createDriverSchema,
//   updateDriverSchema,
//   driverIdSchema,
//   driverQuerySchema,
// } from "../utils/validation/driver.validation";

// import { validateBody } from "../middleware/validate";
// import { authenticate, authorize } from "../middleware/auth";

// const router = Router();

// /**
//  * Driver Routes
//  */

// /**
//  * Create Driver
//  * POST /api/drivers
//  */
// router.post("/", authenticate, validateBody(createDriverSchema), createDriver);

// /**
//  * Get Drivers
//  * GET /api/drivers
//  */
// router.get("/", authenticate, validateBody(driverQuerySchema), getDrivers);

// /**
//  * Get Driver By ID
//  * GET /api/drivers/:id
//  */
// router.get("/:id", authenticate, validateBody(driverIdSchema), getDriverById);

// /**
//  * Update Driver
//  * PATCH /api/drivers/:id
//  */
// router.patch(
//   "/:id",
//   authenticate,
//   validateBody(driverIdSchema),
//   validateBody(updateDriverSchema),
//   updateDriver,
// );

// /**
//  * Delete Driver
//  * DELETE /api/drivers/:id
//  */
// router.delete("/:id", authenticate, validateBody(driverIdSchema), deleteDriver);

// export default router;

import { Router } from "express";

import {
  createDriver,
  getDrivers,
  getDriverById,
  updateDriver,
  deleteDriver,
} from "../controllers/driver.controller";

import { authenticate, authorize } from "../middleware/auth";

import validateBody from "../middleware/validate";

import {
  createDriverSchema,
  getDriversSchema,
  getDriverByIdSchema,
  updateDriverSchema,
  deleteDriverSchema,
} from "../utils/validation/driver.validation";

const router = Router();

/**
 * ============================================================
 * Driver Routes
 * ============================================================
 */

/**
 * GET /api/v1/drivers
 *
 * Get paginated drivers
 */
router.get("/", authenticate, validateBody(getDriversSchema), getDrivers);

/**
 * POST /api/v1/drivers
 *
 * Create driver
 */
router.post("/", authenticate, validateBody(createDriverSchema), createDriver);

/**
 * GET /api/v1/drivers/:id
 *
 * Get driver by ID
 */
router.get(
  "/:id",
  authenticate,
  validateBody(getDriverByIdSchema),
  getDriverById,
);

/**
 * PUT /api/v1/drivers/:id
 *
 * Update driver
 */
router.patch(
  "/:id",
  authenticate,
  validateBody(updateDriverSchema),
  updateDriver,
);

/**
 * DELETE /api/v1/drivers/:id
 *
 * Delete driver
 */
router.delete(
  "/:id",
  authenticate,
  validateBody(deleteDriverSchema),
  deleteDriver,
);

export default router;
