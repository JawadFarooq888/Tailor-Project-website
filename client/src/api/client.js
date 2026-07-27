import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '/api';
// The origin the backend runs on (API_BASE minus the trailing /api), used to resolve
// relative "/uploads/..." image paths returned by the API. When VITE_API_URL isn't set
// (local dev, or same-origin deployment), this is '' so paths resolve relative to the app itself.
const API_ORIGIN = API_BASE.replace(/\/api\/?$/, '');

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});

export function resolveImageUrl(path) {
  if (!path) return path;
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_ORIGIN}${path}`;
}

export default api;
