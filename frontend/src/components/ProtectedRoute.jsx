import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute() {
  const { user, loading, error } = useAuth();
  const location = useLocation();

  if (loading) return <p className="p-8" role="status">Checking login...</p>;
  if (error) return <p className="p-8" role="alert">{error}</p>;
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search + location.hash }} />;
  }
  return <Outlet />;
}
