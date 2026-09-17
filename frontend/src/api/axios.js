import axios from 'axios';

export const API_BASE = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000/api/v1";

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  let url = config.url;

  // Normalize legacy routes to relative endpoints under /api/v1
  if (url === '/login' || url === '/api/auth/login') url = '/auth/login';
  else if (url === '/register' || url === '/api/auth/register') url = '/auth/register';
  else if (url === '/profile' || url === '/api/auth/me') url = '/users/profile';
  else if (url === '/users') url = '/users/';

  // Strip leading /api/v1/ or /api/ prefixes so requests correctly combine with baseURL
  if (url.startsWith('/api/v1/')) {
    url = url.substring('/api/v1'.length);
  } else if (url.startsWith('/api/')) {
    url = url.substring('/api'.length);
  }

  config.url = url;

  const token = localStorage.getItem('token') || localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

api.interceptors.response.use((response) => {
  return response;
}, (error) => {
  if (error.response && error.response.status === 401) {
    console.warn("Unauthorized, token expired or missing.");
    localStorage.removeItem('token');
    localStorage.removeItem('access_token');
    window.dispatchEvent(new Event('unauthorized'));
  }
  return Promise.reject(error);
});

export default api;
