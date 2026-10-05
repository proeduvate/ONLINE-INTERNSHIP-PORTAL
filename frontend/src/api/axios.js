import axios from 'axios';

export const getApiBase = () => {
  let base = process.env.REACT_APP_API_BASE;
  if (!base || base.includes("internship-portal-backend.onrender.com")) {
    return "https://online-internship-portal.onrender.com";
  }
  return base.replace("internship-portal-backend.onrender.com", "online-internship-portal.onrender.com");
};

export const API_BASE = getApiBase();

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token') || localStorage.getItem('authToken');
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
    window.dispatchEvent(new Event('unauthorized'));
  }
  return Promise.reject(error);
});

export default api;
