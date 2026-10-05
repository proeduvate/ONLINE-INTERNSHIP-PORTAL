const getApiBase = () => {
  let base = process.env.REACT_APP_API_BASE;
  if (!base) {
    return "https://online-internship-portal.onrender.com";
  }
  return base;
};

export const API_BASE = getApiBase();
