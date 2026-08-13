import { create } from "zustand";

import AuthApi from "../api/auth.api";
import type{
  AuthState,
  AuthUser,
  LoginDto,
  RegisterDto,
} from "../types/auth.types";

import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  isAuthenticated,
  setTokens,
} from "../utils/token";

interface AuthStore extends AuthState {
  login: (data: LoginDto) => Promise<void>;

  register: (data: RegisterDto) => Promise<void>;

  logout: () => Promise<void>;

  logoutAllDevices: () => Promise<void>;

  fetchCurrentUser: () => Promise<void>;

  restoreSession: () => Promise<void>;

  setUser: (user: AuthUser | null) => void;

  reset: () => void;
}

const initialState: AuthState = {
  user: null,

  isAuthenticated: false,

  isLoading: false,

  accessToken: null,

  refreshToken: null,
};

export const useAuthStore = create<AuthStore>(
  (set, get) => ({
    ...initialState,

    /**
     * Login
     */
    async login(data) {
      set({ isLoading: true });

      try {
        const result =
          await AuthApi.login(data);

        setTokens(
          result.accessToken,
          result.refreshToken
        );

        set({
          user: result.user,
          isAuthenticated: true,
          accessToken:
            result.accessToken,
          refreshToken:
            result.refreshToken,
        });
      } finally {
        set({ isLoading: false });
      }
    },

    /**
     * Register
     */
    async register(data) {
      set({ isLoading: true });

      try {
        const result =
          await AuthApi.register(data);

        setTokens(
          result.accessToken,
          result.refreshToken
        );

        set({
          user: result.user,
          isAuthenticated: true,
          accessToken:
            result.accessToken,
          refreshToken:
            result.refreshToken,
        });
      } finally {
        set({ isLoading: false });
      }
    },

    /**
     * Logout
     */
    async logout() {
      try {
        await AuthApi.logout();
      } finally {
        clearTokens();

        set({
          ...initialState,
        });
      }
    },

    /**
     * Logout All Devices
     */
    async logoutAllDevices() {
      try {
        await AuthApi.logoutAllDevices();
      } finally {
        clearTokens();

        set({
          ...initialState,
        });
      }
    },

    /**
     * Current User
     */
    async fetchCurrentUser() {
      try {
        const user =
          await AuthApi.me();

        set({
          user,
          isAuthenticated: true,
        });
      } catch {
        clearTokens();

        set({
          ...initialState,
        });
      }
    },

    /**
     * Restore Session
     */
    async restoreSession() {
      const accessToken =
        getAccessToken();

      const refreshToken =
        getRefreshToken();

      if (
        !accessToken ||
        !refreshToken ||
        !isAuthenticated()
      ) {
        return;
      }

      set({
        accessToken,
        refreshToken,
      });

      await get().fetchCurrentUser();
    },

    /**
     * Set User
     */
    setUser(user) {
      set({
        user,
        isAuthenticated: !!user,
      });
    },

    /**
     * Reset Store
     */
    reset() {
      clearTokens();

      set({
        ...initialState,
      });
    },
  })
);