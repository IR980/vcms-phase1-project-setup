import { useEffect } from "react";

import { useAuthStore } from "../store/auth.store";

/**
 * Authentication Hook
 *
 * Acts as the single entry point for authentication.
 * Components should use this hook instead of accessing
 * the Zustand store directly.
 */
export const useAuth = () => {
  const {
    user,
    isAuthenticated,
    isLoading,
    accessToken,
    refreshToken,

    login,
    register,
    logout,
    logoutAllDevices,

    fetchCurrentUser,
    restoreSession,

    setUser,
    reset,
  } = useAuthStore();

  /**
   * Restore authentication session
   * once when the application starts.
   */
  useEffect(() => {
    void restoreSession();
  }, [restoreSession]);

  return {
    user,

    isAuthenticated,

    isLoading,

    accessToken,

    refreshToken,

    login,

    register,

    logout,

    logoutAllDevices,

    fetchCurrentUser,

    restoreSession,

    setUser,

    reset,
  };
};

export default useAuth;
