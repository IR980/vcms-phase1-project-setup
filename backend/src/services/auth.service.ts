import mongoose from "mongoose";

import { User, IUser } from "../models/User.model";

import { ApiError } from "../utils/ApiError";

import { generateAccessToken, generateRefreshToken,verifyRefreshToken } from "../utils/jwt";

import { RegisterDto, LoginDto, AuthResponse } from "../types/auth.types";

class AuthService {
  /**
   * Build Authentication Response
   */
  private static buildAuthResponse(user: IUser): AuthResponse {
    const accessToken = generateAccessToken({
      userId: user.id,
      companyId: user.companyId ? user.companyId.toString() : null,
      role: user.role,
      tokenVersion: user.tokenVersion,
    });

    const refreshToken = generateRefreshToken({
      userId: user.id,
      tokenVersion: user.tokenVersion,
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        companyId: user.companyId ? user.companyId.toString() : null,
      },
    };
  }

  /**
   * Register
   */
  static async register(payload: RegisterDto): Promise<AuthResponse> {
    const session = await mongoose.startSession();

    session.startTransaction();

    try {
      const exists = await User.findOne({
        email: payload.email.toLowerCase(),
      }).session(session);

      if (exists) {
        throw new ApiError(409, "Email already exists");
      }

      const user = await User.create(
        [
          {
            name: payload.name,
            email: payload.email.toLowerCase(),
            password: payload.password,
            phone: payload.phone,
            role: payload.role,
          },
        ],
        { session },
      );

      await session.commitTransaction();

      return this.buildAuthResponse(user[0]);
    } catch (error) {
      await session.abortTransaction();

      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Login User
   */
  static async login(payload: LoginDto): Promise<AuthResponse> {
    const user = await User.findOne({
      email: payload.email.toLowerCase(),
    }).select("+password");

    if (!user) {
      throw new ApiError(401, "Invalid email or password");
    }

    if (!user.isActive) {
      throw new ApiError(403, "Your account has been deactivated");
    }

    if (user.status !== "active") {
      throw new ApiError(403, `Your account is ${user.status}`);
    }

    const isPasswordValid = await user.comparePassword(payload.password);

    if (!isPasswordValid) {
      throw new ApiError(401, "Invalid email or password");
    }

    return this.buildAuthResponse(user);
  }
  /**
   * Refresh Access Token
   */
  static async refresh(refreshToken: string): Promise<AuthResponse> {
    const payload = verifyRefreshToken(refreshToken);

    const user = await User.findById(payload.userId).select("+password");

    if (!user) {
      throw new ApiError(401, "User not found");
    }

    if (!user.isActive) {
      throw new ApiError(403, "Account is inactive");
    }

    if (user.tokenVersion !== payload.tokenVersion) {
      throw new ApiError(401, "Refresh token has been invalidated");
    }

    return this.buildAuthResponse(user);
  }
  /**
   * Logout Current Device
   */
  static async logout(_userId: string): Promise<void> {
    return;
  }
  /**
   * Logout From All Devices
   */
  static async logoutAllDevices(userId: string): Promise<void> {
    const user = await User.findById(userId);

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    user.tokenVersion += 1;

    await user.save();
  }
  /**
   * Current Logged In User
   */
  static async me(userId: string) {
    const user = await User.findById(userId);

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    return user;
  }
}

export default AuthService;
