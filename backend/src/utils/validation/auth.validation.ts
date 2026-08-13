import { z } from "zod";
import { UserRole } from "../../types/auth.types";

/**
 * Common Validators
 */
const email = z
  .string()
  .trim()
  .email("Please enter a valid email address.")
  .transform((value) => value.toLowerCase());

const password = z
  .string()
  .min(8, "Password must be at least 8 characters.")
  .max(100, "Password cannot exceed 100 characters.")
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.#_-]).+$/,
    "Password must contain uppercase, lowercase, number and special character.",
  );

const phone = z
  .string()
  .trim()
  .regex(/^[6-9]\d{9}$/, "Please enter a valid 10-digit mobile number.")
  .optional();

/**
 * Register
 */
export const registerSchema = z.object({
  body: z.object({
    name: z
      .string()
      .trim()
      .min(2, "Name is required.")
      .max(100, "Name cannot exceed 100 characters."),

    email,
    password,
    phone,

    role: z.nativeEnum(UserRole).optional(),
  }),
});

/**
 * Login
 */
export const loginSchema = z.object({
  body: z.object({
    email,
    password: z.string().min(1, "Password is required."),
  }),
});

/**
 * Refresh Token
 */
export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, "Refresh token is required."),
  }),
});

/**
 * Forgot Password
 */
export const forgotPasswordSchema = z.object({
  body: z.object({
    email,
  }),
});

/**
 * Reset Password
 */
export const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(1, "Reset token is required."),
    password,
  }),
});

/**
 * Change Password
 */
export const changePasswordSchema = z.object({
  body: z
    .object({
      currentPassword: z.string().min(1, "Current password is required."),

      newPassword: password,

      confirmPassword: z.string().min(1, "Confirm password is required."),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      path: ["confirmPassword"],
      message: "Passwords do not match.",
    }),
});

/**
 * Email Verification
 */
export const verifyEmailSchema = z.object({
  body: z.object({
    token: z.string().min(1, "Verification token is required."),
  }),
});

/**
 * Resend Verification Email
 */
export const resendVerificationSchema = z.object({
  body: z.object({
    email,
  }),
});
