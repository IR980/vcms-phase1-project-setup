import { JwtPayload } from "jsonwebtoken";

/**
 * ==========================================
 * User Roles
 * ==========================================
 */
export enum UserRole {
  SUPER_ADMIN = "super_admin",
  COMPANY_ADMIN = "company_admin",
  FLEET_MANAGER = "fleet_manager",
  STAFF = "staff",
  DRIVER = "driver",
}

/**
 * ==========================================
 * User Status
 * ==========================================
 */
export enum UserStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  SUSPENDED = "suspended",
  BLOCKED = "blocked",
}

/**
 * ==========================================
 * Access Token Payload
 * ==========================================
 */
export interface AccessTokenPayload extends JwtPayload {
  userId: string;
  companyId: string | null;
  role: UserRole;
  tokenVersion: number;
}

/**
 * ==========================================
 * Refresh Token Payload
 * ==========================================
 */
export interface RefreshTokenPayload extends JwtPayload {
  userId: string;
  tokenVersion: number;
}

/**
 * ==========================================
 * Request User
 * ==========================================
 */
export interface AuthUser {
  id: string;
  companyId: string | null;
  role: UserRole;
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
 * Login DTO
 * ==========================================
 */
export interface LoginDto {
  email: string;
  password: string;
}

/**
 * ==========================================
 * Auth Response
 * ==========================================
 */
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    companyId: string | null;
  };
}
