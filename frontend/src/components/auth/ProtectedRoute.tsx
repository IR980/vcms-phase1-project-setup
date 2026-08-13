import { Navigate, Outlet } from "react-router-dom";

import { UserRole } from "../../types/auth.types";
import useAuth from "../../hooks/useAuth";

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
}

const ProtectedRoute = ({
  allowedRoles,
}: ProtectedRouteProps) => {
  const {
    isAuthenticated,
    isLoading,
    user,
  } = useAuth();

  /**
   * Loading
   */
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg font-semibold">
          Loading...
        </div>
      </div>
    );
  }

  /**
   * Not Logged In
   */
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  /**
   * Role Check
   */
  if (
    allowedRoles &&
    user &&
    !allowedRoles.includes(user.role)
  ) {
    return (
      <Navigate
        to="/unauthorized"
        replace
      />
    );
  }

  return <Outlet />;
};

export default ProtectedRoute;