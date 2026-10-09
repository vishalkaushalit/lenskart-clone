import { createRequestClient } from '../../shared/requestClient';
export const frontendUrl = (import.meta.env.VITE_FRONTEND_URL || (import.meta.env.PROD ? window.location.origin : 'http://localhost:5173')).replace(/\/$/, '');
const apiUrl = (import.meta.env.VITE_API_URL || (import.meta.env.PROD ? `${window.location.origin}/api` : 'http://localhost:5001/api')).replace(/\/$/, '');

const request = createRequestClient(apiUrl);
export function apiRequest(path, options = {}) {
  const headers = new Headers(options.headers);
  if (options.body && !(options.body instanceof Blob) && !(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  return request(path, { ...options, headers }).catch(error => {
    if (error.status === 401 && path !== '/auth/me') window.dispatchEvent(new Event('admin-session-expired'));
    throw error;
  });
}

export const productImageUrl = (path) => path.startsWith('/') ? new URL(path, apiUrl).href : path;
