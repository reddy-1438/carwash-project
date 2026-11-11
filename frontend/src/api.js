import axios from "axios";

// Base API configuration
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://carwash-project-production.up.railway.app",
});

// Automatically inject stored login token into request headers if available
API.interceptors.request.use((config) => {
  const storedUser = localStorage.getItem("user");
  if (storedUser) {
    try {
      const user = JSON.parse(storedUser);
      if (user.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
      }
    } catch (e) {
      console.error("Failed to parse stored user", e);
    }
  }
  return config;
});

// Export helper API calls
export const getPlans = () => API.get("/api/plans");
export const getApartments = () => API.get("/api/apartments");
export const login = (formData) => API.post("/api/auth/login", formData);
export const register = (formData) => API.post("/api/auth/register", formData);
export const createSubscription = (subData) => API.post("/api/subscription", subData);
export const getUserSubscriptions = (email) => API.get(`/api/subscription/user/${email}`);
export const getAdminReports = (apartment = "all") => API.get(`/api/admin/reports?apartment=${apartment}`);

export default API;