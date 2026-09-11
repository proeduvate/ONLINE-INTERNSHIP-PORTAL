import axios from 'axios';

export const API_BASE = process.env.REACT_APP_API_BASE || "http://127.0.0.1:8000";

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
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
    console.warn("Unauthorized, token expired or missing. Clearing token.");
    localStorage.removeItem('token');
    // We don't force redirect here to prevent crashing UI state, but could emit event
    window.dispatchEvent(new Event('unauthorized'));
  }
  return Promise.reject(error);
});

export default api;
