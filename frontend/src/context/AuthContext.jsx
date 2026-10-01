import {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';
import { apiRequest } from '../api/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    async function checkSession() {
      try {
        const data = await apiRequest('/auth/me');
        if (active) setUser(data.user);
      } catch (error) {
        if (active && error.status !== 401) {
          setError('Unable to check your login. Please reload the page.');
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    checkSession();

    return () => {
      active = false;
    };
  }, []);

  async function login(email, password) {
    const data = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    setUser(data.user);
    setError('');
    return data.user;
  }

  async function logout() {
    await apiRequest('/auth/logout', {
      method: 'POST',
    });

    setUser(null);
  }

  async function updateProfile(fields) {
    const data = await apiRequest('/account/profile', {
      method: 'PATCH',
      body: JSON.stringify(fields),
    });
    setUser(data.user);
    return data.user;
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, error, login, logout, updateProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
