import axios, {
  AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from "axios";

import {
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearTokens,
} from "../utils/token";

/**
 * ============================================================
 * API BASE URL
 * ============================================================
 *
 * Local:
 *
 * VITE_API_URL=http://localhost:5001/api/v1
 *
 * Production:
 *
 * VITE_API_URL=https://vcms-backend.onrender.com/api/v1
 */
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5001/api/v1";

/**
 * ============================================================
 * AXIOS INSTANCE
 * ============================================================
 */
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,

  timeout: 120000,

  withCredentials: true,
});

/**
 * ============================================================
 * REQUEST INTERCEPTOR
 * ============================================================
 */
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    /**
     * --------------------------------------------------------
     * ACCESS TOKEN
     * --------------------------------------------------------
     */
    const token = getAccessToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    /**
     * --------------------------------------------------------
     * CONTENT TYPE
     * --------------------------------------------------------
     *
     * IMPORTANT:
     *
     * FormData must NOT have a manually defined
     * Content-Type.
     *
     * Browser/Axios automatically generates:
     *
     * multipart/form-data;
     * boundary=------------------------
     */
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    } else {
      config.headers["Content-Type"] = "application/json";
    }

    return config;
  },

  (error) => {
    return Promise.reject(error);
  },
);

/**
 * ============================================================
 * REFRESH TOKEN QUEUE
 * ============================================================
 */

let isRefreshing = false;

let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

/**
 * ============================================================
 * PROCESS QUEUE
 * ============================================================
 */
const processQueue = (error: unknown, token?: string) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else if (token) {
      resolve(token);
    } else {
      reject(new Error("Access token refresh failed"));
    }
  });

  failedQueue = [];
};

/**
 * ============================================================
 * RESPONSE INTERCEPTOR
 * ============================================================
 */
api.interceptors.response.use(
  (response) => response,

  async (error: AxiosError) => {
    /**
     * --------------------------------------------------------
     * ORIGINAL REQUEST
     * --------------------------------------------------------
     */
    const originalRequest = error.config as
      | (AxiosRequestConfig & {
          _retry?: boolean;
        })
      | undefined;

    /**
     * No original request.
     */
    if (!originalRequest) {
      return Promise.reject(error);
    }

    /**
     * --------------------------------------------------------
     * ONLY HANDLE 401
     * --------------------------------------------------------
     */
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    /**
     * Prevent infinite refresh loop.
     */
    originalRequest._retry = true;

    /**
     * --------------------------------------------------------
     * REFRESH TOKEN
     * --------------------------------------------------------
     */
    const refreshToken = getRefreshToken();

    /**
     * No refresh token available.
     */
    if (!refreshToken) {
      clearTokens();

      window.location.href = "/login";

      return Promise.reject(error);
    }

    /**
     * --------------------------------------------------------
     * ANOTHER REFRESH REQUEST RUNNING
     * --------------------------------------------------------
     */
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({
          resolve: (token) => {
            /**
             * Add new token.
             */
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }

            /**
             * Retry request.
             */
            resolve(api(originalRequest));
          },

          reject,
        });
      });
    }

    /**
     * --------------------------------------------------------
     * START TOKEN REFRESH
     * --------------------------------------------------------
     */
    isRefreshing = true;

    try {
      /**
       * ------------------------------------------------------
       * Refresh endpoint
       * ------------------------------------------------------
       *
       * API_BASE_URL already contains:
       *
       * /api/v1
       *
       * therefore:
       *
       * /auth/refresh
       */
      const response = await axios.post(
        `${API_BASE_URL}/auth/refresh`,
        {
          refreshToken,
        },
        {
          withCredentials: true,
        },
      );

      /**
       * ------------------------------------------------------
       * RESPONSE DATA
       * ------------------------------------------------------
       */
      const { accessToken, refreshToken: newRefreshToken } = response.data.data;

      /**
       * Validate access token.
       */
      if (!accessToken) {
        throw new Error("Refresh API did not return an access token");
      }

      /**
       * ------------------------------------------------------
       * SAVE TOKENS
       * ------------------------------------------------------
       */
      setTokens(accessToken, newRefreshToken || refreshToken);

      /**
       * ------------------------------------------------------
       * RESOLVE QUEUED REQUESTS
       * ------------------------------------------------------
       */
      processQueue(null, accessToken);

      /**
       * ------------------------------------------------------
       * UPDATE ORIGINAL REQUEST
       * ------------------------------------------------------
       */
      if (originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
      }

      /**
       * ------------------------------------------------------
       * RETRY ORIGINAL REQUEST
       * ------------------------------------------------------
       *
       * FormData remains intact.
       */
      return api(originalRequest);
    } catch (refreshError) {
      /**
       * ------------------------------------------------------
       * REFRESH FAILED
       * ------------------------------------------------------
       */
      processQueue(refreshError);

      /**
       * Clear authentication.
       */
      clearTokens();

      /**
       * Redirect user to login.
       */
      window.location.href = "/login";

      return Promise.reject(refreshError);
    } finally {
      /**
       * ------------------------------------------------------
       * RESET REFRESH STATE
       * ------------------------------------------------------
       */
      isRefreshing = false;
    }
  },
);

/**
 * ============================================================
 * EXPORT
 * ============================================================
 */
export default api;
