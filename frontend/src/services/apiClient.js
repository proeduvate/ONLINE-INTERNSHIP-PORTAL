export const getApiBase = () => {
  let base = process.env.REACT_APP_API_BASE;
  if (!base) {
    return "https://online-internship-portal-1.onrender.com";
  }
  return base;
};

export const API_BASE = getApiBase();
