import { Navigate, useLocation } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { PageLoader } from "./common/States";

// roles: optional list of roles allowed to see the page
const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <PageLoader />;

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
