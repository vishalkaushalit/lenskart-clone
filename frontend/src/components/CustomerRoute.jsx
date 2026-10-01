import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function CustomerRoute() {
  const { user, loading, error } = useAuth();
  const location = useLocation();

  if (loading) return <p>Checking login...</p>;

  if (error) return <p role="alert">{error}</p>;

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
