import { Response, NextFunction } from "express";
import { AuthRequest } from "../types/request.types";
import AuthService from "../services/auth.service";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { env } from "../config/env";

const refreshCookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 30 * 24 * 60 * 60 * 1000,
};

export const register = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await AuthService.register(req.body);

    res.cookie("refreshToken", result.refreshToken, refreshCookieOptions);

    const { refreshToken, ...response } = result;

    res
      .status(201)
      .json(new ApiResponse(201, "User registered successfully.", response));
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await AuthService.login(req.body);

    res.cookie("refreshToken", result.refreshToken, refreshCookieOptions);

    const { refreshToken, ...response } = result;

    res.status(200).json(new ApiResponse(200, "Login successful.", response));
  } catch (error) {
    next(error);
  }
};

export const refresh = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      throw new ApiError(401, "Refresh token not found");
    }

    const result = await AuthService.refresh(refreshToken);

    res.cookie("refreshToken", result.refreshToken, refreshCookieOptions);

    const { refreshToken: _, ...response } = result;

    res
      .status(200)
      .json(new ApiResponse(200, "Token refreshed successfully.", response));
  } catch (error) {
    next(error);
  }
};

export const logout = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.user) {
      throw new ApiError(401, "Authentication required.");
    }

    await AuthService.logout(req.user.id);

    res.clearCookie("refreshToken", refreshCookieOptions);

    res
      .status(200)
      .json(new ApiResponse(200, "Logged out successfully.", null));
  } catch (error) {
    next(error);
  }
};

export const logoutAllDevices = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.user) {
      throw new ApiError(401, "Authentication required.");
    }

    await AuthService.logoutAllDevices(req.user.id);

    res.clearCookie("refreshToken", refreshCookieOptions);

    res
      .status(200)
      .json(new ApiResponse(200, "Logged out from all devices.", null));
  } catch (error) {
    next(error);
  }
};

export const me = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.user) {
      throw new ApiError(401, "Authentication required.");
    }

    const user = await AuthService.me(req.user.id);

    res
      .status(200)
      .json(new ApiResponse(200, "Current user fetched successfully.", user));
  } catch (error) {
    next(error);
  }
};
