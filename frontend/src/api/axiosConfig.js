import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://jobvista-psro.onrender.com/api/v1";

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// Attach access token
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// 🔥 AUTO REFRESH & RETRY LOGIC
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 1. Retry Logic for transient server errors (cold starts, etc.)
    if (
      error.response &&
      [502, 503, 504].includes(error.response.status) &&
      !originalRequest._retryCount
    ) {
      originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;
      if (originalRequest._retryCount <= 3) {
        console.warn(`Retrying request (${originalRequest._retryCount}/3) due to ${error.response.status}`);
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, originalRequest._retryCount * 1000));
        return axiosInstance(originalRequest);
      }
    }

    // 2. Token Refresh Logic
    if (
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        const res = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const newAccessToken = res.data.accessToken;

        localStorage.setItem("accessToken", newAccessToken);

        // Retry original request
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        return axiosInstance(originalRequest);

      } catch (err) {
        // ❌ Refresh failed → logout
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");

        // If admin, redirect to /admin
        const currentPath = window.location.pathname;
        if (currentPath === "/admin") {
          localStorage.removeItem("adminLoggedIn");
          window.location.reload(); 
        } else if (currentPath !== "/login") {
          window.location.href = "/login";
        }
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;