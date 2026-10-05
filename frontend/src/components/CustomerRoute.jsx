import Loader from './Loader';
import PopupMessage from "./PopupMessage";
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function CustomerRoute() {
  const { user, loading, error } = useAuth();
  const location = useLocation();

  if (loading) return <Loader label="Checking login"/>;

  if (error) return <main className="p-8"><PopupMessage message={error} /><button type="button" onClick={() => window.location.reload()} className="rounded-lg bg-blue-600 px-5 py-3 text-white">Try again</button></main>;

  if (!user) {
    return (
      <Navigate
        to="/login"
        state={{ from: location.pathname + location.search + location.hash }}
        replace
      />
    );
  }

  if (user.role !== 'customer') {
    return (
      <p>
        Please use a customer account to access this page.
        {' '}
        {import.meta.env.VITE_ADMIN_URL && (
          <a href={`${import.meta.env.VITE_ADMIN_URL.replace(/\/$/, '')}/dashboard`}>
            Open admin dashboard
          </a>
        )}
      </p>
    );
  }

  return <Outlet />;
}
