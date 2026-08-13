/**
 * ==========================================
 * User Roles
 * ==========================================
 */
export const UserRole = {
  SUPER_ADMIN: "super_admin",
  COMPANY_ADMIN: "company_admin",
  FLEET_MANAGER: "fleet_manager",
  STAFF: "staff",
  DRIVER: "driver",
} as const;
/**
 * ==========================================
 * User Status
 * ==========================================
 */

export const UserStatus = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  SUSPENDED: "suspended",
  BLOCKED: "blocked",
} as const;

/**
 * ==========================================
 * Login DTO
 * ==========================================
 */

export interface LoginDto {
  email: string;
  password: string;
}

/**
 * ==========================================
 * Register DTO
 * ==========================================
 */

export interface RegisterDto {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role?: UserRole;
}

/**
 * ==========================================
 * Forgot Password
 * ==========================================
 */

export interface ForgotPasswordDto {
  email: string;
}

/**
 * ==========================================
 * Reset Password
 * ==========================================
 */

export interface ResetPasswordDto {
  token: string;
  password: string;
}

/**
 * ==========================================
 * Change Password
 * ==========================================
 */

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * ==========================================
 * Authenticated User
 * ==========================================
 */

export interface AuthUser {
  id: string;

  name: string;

  email: string;

  phone?: string;

  avatar?: string;

  role: UserRole;

  companyId: string | null;

  isActive: boolean;

  emailVerified: boolean;

  phoneVerified: boolean;

  createdAt?: string;

  updatedAt?: string;
}

/**
 * ==========================================
 * Authentication Response
 * ==========================================
 */

export interface AuthResponse {
  accessToken: string;

  refreshToken: string;

  user: AuthUser;
}

/**
 * ==========================================
 * Refresh Token Request
 * ==========================================
 */

export interface RefreshTokenDto {
  refreshToken: string;
}

/**
 * ==========================================
 * API Response
 * ==========================================
 */

export interface ApiResponse<T> {
  success: boolean;

  statusCode: number;

  message: string;

  data: T;

  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}

/**
 * ==========================================
 * API Error
 * ==========================================
 */

export interface ApiError {
  success: false;

  statusCode: number;

  message: string;

  errors?: unknown;
}

/**
 * ==========================================
 * Auth Store State
 * ==========================================
 */

export interface AuthState {
  user: AuthUser | null;

  isAuthenticated: boolean;

  isLoading: boolean;

  accessToken: string | null;

  refreshToken: string | null;
}

export type UserRole = (typeof UserRole)[keyof typeof UserRole];
