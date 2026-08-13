import { Router } from "express";

import {
  createCompany,
  getCompanies,
  getCompanyById,
  updateCompany,
  deleteCompany,
} from "../controllers/company.controller";

import { authenticate, authorize } from "../middleware/auth";
// import validate from "../middleware/validate";
import { validateBody } from "../middleware/validate";
import {
  createCompanySchema,
  updateCompanySchema,
  companyIdSchema,
  companyQuerySchema,
} from "../utils/validation/company.validation";

import { UserRole } from "../types/auth.types";

const router = Router();

/**
 * GET /api/companies
 * List Companies
 */
router.get(
  "/",
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.COMPANY_ADMIN),
  validateBody(companyQuerySchema),
  getCompanies,
);

/**
 * GET /api/companies/:id
 * Company Details
 */
router.get(
  "/:id",
  authenticate,
  authorize(
    UserRole.SUPER_ADMIN,
    UserRole.COMPANY_ADMIN,
    UserRole.FLEET_MANAGER,
  ),
  validateBody(companyIdSchema),
  getCompanyById,
);

/**
 * POST /api/companies
 * Create Company
 */
router.post(
  "/",
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.COMPANY_ADMIN),
  validateBody(createCompanySchema),
  createCompany,
);

/**
 * PUT /api/companies/:id
 * Update Company
 */
router.put(
  "/:id",
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.COMPANY_ADMIN),
  validateBody(updateCompanySchema),
  updateCompany,
);

/**
 * DELETE /api/companies/:id
 * Soft Delete Company
 */
router.delete(
  "/:id",
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.COMPANY_ADMIN),
  validateBody(companyIdSchema),
  deleteCompany,
);

export default router;
