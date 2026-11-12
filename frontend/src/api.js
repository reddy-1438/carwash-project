import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://carwash-project-production.up.railway.app",
});

// Auth endpoints
export const login = (data) => API.post("/api/auth/login", data);
export const register = (data) => API.post("/api/auth/register", data);
export const verifyEmail = (token) => API.get(`/api/auth/verify-email/${token}`);

// Apartments & Plans
export const getApartments = () => API.get("/api/apartments");
export const getPlans = () => API.get("/api/plans");

// Subscriptions
export const createSubscription = (data) => API.post("/api/subscription", data);
export const getUserSubscriptions = (email) => API.get(`/api/subscription/user/${encodeURIComponent(email)}`);

export default API;