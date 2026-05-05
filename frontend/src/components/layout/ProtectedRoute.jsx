// components/layout/ProtectedRoute.jsx
import PropTypes from "prop-types";
import { Navigate, Outlet } from "react-router-dom";

import { useAuth } from "../../context/AuthContext.jsx";

export function ProtectedRoute({ roles }) {
  const { isAuthenticated, hasAnyRole } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (roles?.length && !hasAnyRole(roles)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

ProtectedRoute.propTypes = {
  roles: PropTypes.arrayOf(PropTypes.string),
};
