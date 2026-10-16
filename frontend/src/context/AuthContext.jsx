import {
  useEffect,
  useState,
} from 'react';
import { useStore } from './StoreContext';
import { apiRequest } from '../api/api';

import {AuthContext} from './AuthState';

const sessionHintKey = 'store-session-present';
function hasSessionHint() {
  try { return localStorage.getItem(sessionHintKey) === '1'; }
  catch { return true; }
}
function rememberSession(present) {
  try {
    if (present) localStorage.setItem(sessionHintKey, '1');
    else localStorage.removeItem(sessionHintKey);
  } catch { /* Cookie sessions still work when browser storage is unavailable. */ }
}

export function AuthProvider({ children }) {
  const { notify } = useStore();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    async function checkSession() {
      if (!hasSessionHint()) {
        if (active) setLoading(false);
        return;
      }
      try {
        const data = await apiRequest('/auth/me');
        if (active) setUser(data.user);
      } catch (error) {
        if (error.status === 401) rememberSession(false);
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

    rememberSession(true);
    setUser(data.user);
    notify('Logged in successfully.');
    setError('');
    return data.user;
  }

  async function logout() {
    await apiRequest('/auth/logout', {
      method: 'POST',
    });

    rememberSession(false);
    setUser(null);
    notify('Logged out successfully.');
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
