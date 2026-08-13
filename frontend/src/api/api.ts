// import axios, {
//   AxiosError,
//   type AxiosInstance,
//   type AxiosRequestConfig,
//   type InternalAxiosRequestConfig,
// } from "axios";

// import {
//   getAccessToken,
//   getRefreshToken,
//   setTokens,
//   clearTokens,
// } from "../utils/token";

// /**
//  * Axios Instance
//  */
// const api: AxiosInstance = axios.create({
//   baseURL: import.meta.env.VITE_API_URL,
//   timeout: 30000,
//   withCredentials: true,
//   headers: {
//     "Content-Type": "application/json",
//   },
// });

// /**
//  * Request Interceptor
//  */
// api.interceptors.request.use(
//   (config: InternalAxiosRequestConfig) => {
//     const token = getAccessToken();

//     if (token && config.headers) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }

//     return config;
//   },
//   (error) => Promise.reject(error),
// );

// /**
//  * Refresh Token Queue
//  */
// let isRefreshing = false;

// let failedQueue: Array<{
//   resolve: (token: string) => void;
//   reject: (error: unknown) => void;
// }> = [];

// const processQueue = (error: unknown, token?: string) => {
//   failedQueue.forEach((promise) => {
//     if (error) {
//       promise.reject(error);
//     } else {
//       promise.resolve(token!);
//     }
//   });

//   failedQueue = [];
// };

// /**
//  * Response Interceptor
//  */
// api.interceptors.response.use(
//   (response) => response,

//   async (error: AxiosError) => {
//     const originalRequest = error.config as AxiosRequestConfig & {
//       _retry?: boolean;
//     };

//     if (error.response?.status === 401 && !originalRequest._retry) {
//       originalRequest._retry = true;

//       if (isRefreshing) {
//         return new Promise((resolve, reject) => {
//           failedQueue.push({
//             resolve: (token) => {
//               if (originalRequest.headers) {
//                 originalRequest.headers.Authorization = `Bearer ${token}`;
//               }

//               resolve(api(originalRequest));
//             },
//             reject,
//           });
//         });
//       }

//       isRefreshing = true;

//       try {
//         const refreshToken = getRefreshToken();

//         const response = await axios.post(
//           `${import.meta.env.VITE_API_URL}/auth/refresh`,
//           {
//             refreshToken,
//           },
//         );

//         const { accessToken, refreshToken: newRefresh } = response.data.data;

//         setTokens(accessToken, newRefresh);

//         processQueue(null, accessToken);

//         if (originalRequest.headers) {
//           originalRequest.headers.Authorization = `Bearer ${accessToken}`;
//         }

//         return api(originalRequest);
//       } catch (refreshError) {
//         processQueue(refreshError);

//         clearTokens();

//         window.location.href = "/login";

//         return Promise.reject(refreshError);
//       } finally {
//         isRefreshing = false;
//       }
//     }

//     return Promise.reject(error);
//   },
// );

// export default api;

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
 * Axios Instance
 * ============================================================
 */
const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 120000,
  withCredentials: true,
});

/**
 * ============================================================
 * Request Interceptor
 * ============================================================
 */
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();

    /**
     * --------------------------------------------------------
     * Authorization
     * --------------------------------------------------------
     */
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    /**
     * --------------------------------------------------------
     * Content-Type
     * --------------------------------------------------------
     *
     * IMPORTANT:
     *
     * Do NOT force application/json for FormData.
     *
     * Browser/Axios will automatically generate:
     *
     * multipart/form-data;
     * boundary=------------------------
     *
     * when the request body is FormData.
     */
    if (config.data instanceof FormData) {
      /**
       * Remove any previously configured JSON
       * Content-Type.
       *
       * The browser will set the correct multipart
       * Content-Type including the boundary.
       */
      delete config.headers["Content-Type"];
    } else {
      /**
       * Normal API requests use JSON.
       */
      config.headers["Content-Type"] = "application/json";
    }

    return config;
  },
  (error) => Promise.reject(error),
);

/**
 * ============================================================
 * Refresh Token Queue
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
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(token!);
    }
  });

  failedQueue = [];
};

/**
 * ============================================================
 * Response Interceptor
 * ============================================================
 */
api.interceptors.response.use(
  (response) => response,

  async (error: AxiosError) => {
    const originalRequest = error.config as
      | (AxiosRequestConfig & {
          _retry?: boolean;
        })
      | undefined;

    /**
     * --------------------------------------------------------
     * If there is no original request, reject.
     * --------------------------------------------------------
     */
    if (!originalRequest) {
      return Promise.reject(error);
    }

    /**
     * --------------------------------------------------------
     * Access token expired
     * --------------------------------------------------------
     */
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      /**
       * ------------------------------------------------------
       * Another refresh request is already running.
       * ------------------------------------------------------
       */
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token) => {
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${token}`;
              }

              resolve(api(originalRequest));
            },

            reject,
          });
        });
      }

      /**
       * ------------------------------------------------------
       * Start refresh
       * ------------------------------------------------------
       */
      isRefreshing = true;

      try {
        const refreshToken = getRefreshToken();

        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/auth/refresh`,
          {
            refreshToken,
          },
        );

        const { accessToken, refreshToken: newRefresh } = response.data.data;

        /**
         * Save new tokens.
         */
        setTokens(accessToken, newRefresh);

        /**
         * Resolve queued requests.
         */
        processQueue(null, accessToken);

        /**
         * Add new access token
         * to original request.
         */
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }

        /**
         * Retry original request.
         *
         * IMPORTANT:
         *
         * If original request was FormData,
         * Axios will preserve the FormData body.
         */
        return api(originalRequest);
      } catch (refreshError) {
        /**
         * Reject queued requests.
         */
        processQueue(refreshError);

        /**
         * Clear authentication.
         */
        clearTokens();

        /**
         * Redirect to login.
         */
        window.location.href = "/login";

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default api;
