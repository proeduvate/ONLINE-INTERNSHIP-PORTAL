const getApiBase = () => {
  let base = process.env.REACT_APP_API_BASE;
  if (!base || base.includes("internship-portal-backend.onrender.com")) {
    if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
      return "http://127.0.0.1:8000";
    }
    return "https://online-internship-portal.onrender.com";
  }
  return base;
};

export const API_BASE = getApiBase();
