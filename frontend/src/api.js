import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://carwash-project-production.up.railway.app",
});

export const login = (data) => API.post("/api/auth/login", data);
export const register = (data) => API.post("/api/auth/register", data);
export const getApartments = () => API.get("/api/apartments");

export default API;