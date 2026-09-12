import axios from 'axios';

const resolveBaseUrl = () => {
  if (typeof window !== 'undefined') {
    // If accessing via localhost or 127.0.0.1, always connect to localhost backend
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:5000/api';
    }
    // If accessing via local network IP (e.g. 192.168.x.x), use that same IP for backend
    if (/^\d+\.\d+\.\d+\.\d+$/.test(window.location.hostname)) {
      return `http://${window.location.hostname}:5000/api`;
    }
  }

  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (envUrl && !envUrl.includes('192.168.1.2')) {
    return envUrl.replace(/\/$/, '');
  }

  return 'http://localhost:5000/api';
};

const apiBaseUrl = resolveBaseUrl();

const api = axios.create({
  baseURL: apiBaseUrl,
  timeout: 15000
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('veloop-token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
