export const getApiBase = () => {
  let base = process.env.REACT_APP_API_BASE;
  if (!base || base.includes("internship-portal-backend.onrender.com")) {
    return "https://online-internship-portal.onrender.com";
  }
  return base.replace("internship-portal-backend.onrender.com", "online-internship-portal.onrender.com");
};

export const API_BASE = getApiBase();
