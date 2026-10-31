import React, { createContext, useState, useEffect } from "react";
import { isAuthenticated, getUser } from "../utills/auth";
import authService from "../api/authService";
import axiosInstance from "../api/axiosConfig";
import { getAccessToken, setAccessToken } from "../utills/tokenStore";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [loggedIn, setLoggedIn] = useState(() => isAuthenticated());
  const [user, setUser] = useState(() => getUser());
  const [appliedJobs, setAppliedJobs] = useState(new Set());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      const token = getAccessToken();
      if (token) {
        // User already has an access token in storage; refresh profile in background
        try {
          const res = await axiosInstance.get("/users/me");
          if (isMounted && res.data) {
            setUser(res.data);
            localStorage.setItem("user", JSON.stringify(res.data));
            const role = res.data.role;
            if (role === "USER" || role === "ROLE_USER") {
              fetchAppliedJobs(res.data);
            }
          }
        } catch (err) {
          // If token expired/invalid, clear it gracefully
          if (err.response?.status === 401) {
            setAccessToken(null);
            localStorage.removeItem("user");
            if (isMounted) {
              setLoggedIn(false);
              setUser(null);
            }
          }
        }
      } else {
        // No local token; attempt silent cookie refresh non-blockingly
        try {
          const res = await axiosInstance.post("/auth/refresh", {});
          if (isMounted && res.data?.accessToken) {
            setAccessToken(res.data.accessToken);
            setLoggedIn(true);
            const userRes = await axiosInstance.get("/users/me");
            if (isMounted && userRes.data) {
              setUser(userRes.data);
              localStorage.setItem("user", JSON.stringify(userRes.data));
              const role = userRes.data.role;
              if (role === "USER" || role === "ROLE_USER") {
                fetchAppliedJobs(userRes.data);
              }
            }
          }
        } catch {
          // Expected for guest visitors; no action required
        }
      }
    };

    initAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const fetchUserProfile = async () => {
    try {
      const res = await axiosInstance.get("/users/me");
      const userData = res.data;
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
      return userData.role;
    } catch (err) {
      console.error("Failed to fetch user profile", err);
      if (err.response?.status === 401) logout();
      return null;
    }
  };

  const fetchAppliedJobs = async (currentUser) => {
    const activeUser = currentUser || user || getUser();
    const role = activeUser?.role;
    
    if (role !== "USER" && role !== "ROLE_USER") return;

    try {
      const res = await axiosInstance.get("/application/me", { params: { page: 0, size: 50 } });
      const content = res?.data?.content || res?.content || res?.data;
      if (Array.isArray(content)) {
        const ids = new Set(content.map(app => app.jobId || app.job?.jobId));
        setAppliedJobs(ids);
      }
    } catch (err) {
      console.warn("Failed to fetch applied jobs in context", err);
    }
  };

  const login = (accessToken, userData) => {
    setAccessToken(accessToken);
    localStorage.setItem("user", JSON.stringify(userData));
    setLoggedIn(true);
    setUser(userData);
    
    fetchUserProfile().then(role => {
       if (role === "USER" || role === "ROLE_USER") {
         fetchAppliedJobs(userData);
       }
    });
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
    setAccessToken(null);
    localStorage.clear();
    setLoggedIn(false);
    setUser(null);
    setAppliedJobs(new Set());
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ loggedIn, setLoggedIn, user, setUser, login, logout, appliedJobs, setAppliedJobs, loading }}>
      {children}
    </AuthContext.Provider>
  );
};