export const getApiBase = () => {
  let base = process.env.REACT_APP_API_BASE;
  if (!base || base.includes("127.0.0.1") || base.includes("localhost") || base.includes("internship-portal-backend.onrender.com")) {
    return "https://online-internship-portal.onrender.com";
  }
  return base;
};

export const API_BASE = getApiBase();
