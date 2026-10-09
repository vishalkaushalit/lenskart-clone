export const frontendUrl = (import.meta.env.VITE_FRONTEND_URL || (import.meta.env.PROD ? window.location.origin : 'http://localhost:5173')).replace(/\/$/, '');
const apiUrl = (import.meta.env.VITE_API_URL || (import.meta.env.PROD ? `${window.location.origin}/api` : 'http://localhost:5001/api')).replace(/\/$/, '');

export async function apiRequest(path, options = {}) {
  const response = await fetch(`${apiUrl}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      ...(options.body && !(options.body instanceof Blob) && !(options.body instanceof FormData) ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
  });
  const data = await response.json();
  if (!response.ok) {
    const error = new Error(data.message || 'Request failed.');
    error.status = response.status;
    throw error;
  }
  return data;
}

export const productImageUrl = (path) => path.startsWith('/') ? new URL(path, apiUrl).href : path;
