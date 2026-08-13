import api from "./api";

import type{ AuthResponse, LoginDto, RegisterDto } from "../types/auth.types";

/**
 * Authentication API
 */
class AuthApi {
  /**
   * Register
   */
  async register(payload: RegisterDto): Promise<AuthResponse> {
    const response = await api.post("/auth/register", payload);

    return response.data.data;
  }

  /**
   * Login
   */
  async login(payload: LoginDto): Promise<AuthResponse> {
    const response = await api.post("/auth/login", payload);

    return response.data.data;
  }

  /**
   * Refresh Token
   */
  async refresh(refreshToken: string): Promise<AuthResponse> {
    const response = await api.post("/auth/refresh", {
      refreshToken,
    });

    return response.data.data;
  }

  /**
   * Logout Current Device
   */
  async logout(): Promise<void> {
    await api.post("/auth/logout");
  }

  /**
   * Logout All Devices
   */
  async logoutAllDevices(): Promise<void> {
    await api.post("/auth/logout-all");
  }

  /**
   * Current User
   */
  async me() {
    const response = await api.get("/auth/me");

    return response.data.data;
  }
}

export default new AuthApi();
