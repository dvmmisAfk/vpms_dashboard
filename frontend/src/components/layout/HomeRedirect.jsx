// components/layout/HomeRedirect.jsx
import { Navigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext.jsx";
import { ROLES } from "../../utils/constants.js";

export default function HomeRedirect() {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (user?.role === ROLES.VISITOR) return <Navigate to="/my-pass" replace />;

  return <Navigate to="/dashboard" replace />;
}
