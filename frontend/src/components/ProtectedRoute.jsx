import Loader from './Loader';
import PopupMessage from "./PopupMessage";
import { Navigate, Outlet, useLocation, useOutletContext } from "react-router-dom";
import { useAuth } from "../context/AuthState";

export default function ProtectedRoute() {
  const { user, loading, error } = useAuth();
  const location = useLocation();
  const layoutContext=useOutletContext();

  if (loading) return <Loader label="Checking login"/>;
  if (error) return <main className="p-8"><PopupMessage message={error} /><button type="button" onClick={() => window.location.reload()} className="rounded-lg bg-blue-600 px-5 py-3 text-white">Try again</button></main>;
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search + location.hash }} />;
  }
  return <Outlet context={layoutContext} />;
}
