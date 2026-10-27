import { useEffect, useState } from 'react';
import { useStore } from './StoreContext';
import { apiRequest } from '../api/api';

import { AuthContext } from './AuthState';

import { sessionHintKey, hasSessionHint, rememberSession } from '../../../shared/sessionHint.js';

export function AuthProvider({ children }) {
  const { notify } = useStore();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    let generation = 0;

    async function checkSession() {
      const current = ++generation;
      if (!hasSessionHint()) {
        if (active) {
          setUser(null);
          setError('');
          setLoading(false);
        }
        return;
      }
      try {
        const data = await apiRequest('/auth/me');
        if (active && current === generation) {
          setUser(data.user);
          setError('');
        }
      } catch (error) {
        if (!active || current !== generation) return;
        if (error.status === 401) {
          rememberSession(false);
          setUser(null);
        }
        if (active && error.status !== 401) {
          setError('Unable to check your login. Please reload the page.');
        }
      } finally {
        if (active && current === generation) setLoading(false);
      }
    }

    checkSession();
    function storageChanged(event) {
      if (event.key === sessionHintKey || event.key === null) checkSession();
    }
    window.addEventListener('storage', storageChanged);
    function refreshSession() {
      if (!document.hidden && hasSessionHint()) checkSession();
    }
    window.addEventListener('focus', refreshSession);

    return () => {
      window.removeEventListener('storage', storageChanged);
      window.removeEventListener('focus', refreshSession);
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
    <AuthContext.Provider value={{ user, loading, error, login, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}
