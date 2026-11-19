
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getDashboardPath } from "../utils/roleConfig";

export default function PublicRoute() {
  const { user, isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to={getDashboardPath(user.role)} replace />;
  }

  return <Outlet />;
}
