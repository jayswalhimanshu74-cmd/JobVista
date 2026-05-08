import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://jobvista-psro.onrender.com/api/v1";

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// Attach access token & Guard protected routes
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");

  // Define protected prefixes that require a token
  const protectedPrefixes = [
    "/users/me",
    "/application",
    "/saved-jobs",
    "/jobs/applied",
    "/notifications",
    "/company/profile",
    "/company/update",
    "/admin"
  ];

  const isProtected = protectedPrefixes.some(prefix => config.url.startsWith(prefix));

  if (isProtected && !token) {
    console.warn(`Blocking unauthorized request to protected endpoint: ${config.url}`);
    // Cancel the request by throwing an error or returning a rejected promise
    // We'll reject it so the caller can handle it
    const error = new Error("Unauthorized request blocked by guard");
    error.status = 401;
    return Promise.reject(error);
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
}, (error) => {
  return Promise.reject(error);
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
      const token = localStorage.getItem("accessToken");
      
      // If no token exists, don't try to refresh (guest mode or already logged out)
      if (!token) {
        return Promise.reject(error);
      }

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
        // ❌ Refresh failed or no refresh token → full logout
        console.error("Auth refresh failed, logging out...");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");

        // Redirect to login if not already on a public page
        const currentPath = window.location.pathname;
        const publicPaths = ["/", "/login", "/signup", "/jobs", "/companies", "/about"];
        
        if (!publicPaths.includes(currentPath) && currentPath !== "/login") {
          window.location.href = "/login?expired=true";
        }
        
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;