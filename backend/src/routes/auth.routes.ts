import { Router } from "express";

import {
  register,
  login,
  refresh,
  logout,
  logoutAllDevices,
  me,
} from "../controllers/auth.controller";

import { authenticate } from "../middleware/auth";
import { validateBody } from "../middleware/validate";

import {
  registerSchema,
  loginSchema,
} from "../utils/validation/auth.validation";

// const router = Router();

// /**
//  * Public Routes
//  */
// router.post("/register", validateBody(registerSchema), register);

// router.post("/login", validateBody(loginSchema), login);

// router.post("/refresh", refresh);

// /**
//  * Protected Routes
//  */
// router.post("/logout", authenticate, logout);

// router.post("/logout-all", authenticate, logoutAllDevices);

// router.get("/me", authenticate, me);

// export default router;

console.log("✅ auth.routes.ts loaded");

const router = Router();

router.get("/test", (_req, res) => {
  res.json({
    success: true,
    message: "Auth Route Working",
  });
});
router.post("/register", (req, res, next) => {
  console.log("✅ Register route hit");
  next();
}, validateBody(registerSchema), register);
// keep the rest of your routes...
router.post("/login", validateBody(loginSchema), login);
router.get("/me", authenticate, me);
router.post("/refresh", refresh);
router.post("/logout", authenticate, logout);
router.post("/logout-all", authenticate, logoutAllDevices);
export default router;