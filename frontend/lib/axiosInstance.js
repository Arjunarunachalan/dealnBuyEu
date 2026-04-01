import axios from "axios";
import { useAuthStore } from "../store/useAuthStore";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Send cookies (refresh token) automatically
});

// Request Interceptor: Attach access token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const accessToken = useAuthStore.getState().accessToken || localStorage.getItem("accessToken");
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401 token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 Unauthorized, try to refresh the access token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Cookie is sent automatically due to withCredentials
        const refreshRes = await axios.post(
          `${api.defaults.baseURL}/auth/refresh-token`,
          {},
          { withCredentials: true }
        );

        if (refreshRes.data?.accessToken) {
          useAuthStore.getState().login(
            useAuthStore.getState().user,
            refreshRes.data.accessToken
          );
          originalRequest.headers.Authorization = `Bearer ${refreshRes.data.accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.error("Session expired. Please log in again.");
        if (typeof window !== "undefined") {
          useAuthStore.getState().logout();
          window.location.href = "/registration_login";
        }
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
