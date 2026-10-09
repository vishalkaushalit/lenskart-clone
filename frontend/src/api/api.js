import { createRequestClient } from './requestClient';

const API_URL = (import.meta.env.VITE_API_URL || (import.meta.env.PROD ? `${window.location.origin}/api` : 'http://localhost:5001/api')).replace(/\/$/, '');

const request = createRequestClient(API_URL);
export function apiRequest(path, options = {}) {
  const headers = new Headers(options.headers);
  if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  return request(path, { ...options, headers });
}
