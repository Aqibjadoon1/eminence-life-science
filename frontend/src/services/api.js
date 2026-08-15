/**
 * Centralised API utility bus.
 * All fetch calls go through this module — never call fetch/axios directly in components.
 */
import axios from 'axios';

const client = axios.create({
  baseURL: '/',
  withCredentials: true, // sends httpOnly cookies on every request
  headers: { 'Content-Type': 'application/json' },
});

// ── Response interceptor — normalise errors ──────────────────
client.interceptors.response.use(
  (res) => res,
  (err) => {
    const message =
      err.response?.data?.error ||
      err.response?.data?.message ||
      err.message ||
      'Something went wrong.';
    return Promise.reject(new Error(message));
  }
);

export default client;
