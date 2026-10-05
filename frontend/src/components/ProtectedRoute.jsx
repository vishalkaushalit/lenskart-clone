import PopupMessage from "./PopupMessage";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute() {
  const { user, loading, error } = useAuth();
  const location = useLocation();

  if (loading) return <p className="p-8" role="status">Checking login...</p>;
  if (error) return <main className="p-8"><PopupMessage message={error} /><button type="button" onClick={() => window.location.reload()} className="rounded-lg bg-blue-600 px-5 py-3 text-white">Try again</button></main>;
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search + location.hash }} />;
  }
  return <Outlet />;
}
