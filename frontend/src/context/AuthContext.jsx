import React, { createContext, useState, useEffect } from "react";
import { isAuthenticated, getUser } from "../utills/auth";
import authService from "../api/authService";
import axiosInstance from "../api/axiosConfig";
import { getAccessToken, setAccessToken } from "../utills/tokenStore";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [appliedJobs, setAppliedJobs] = useState(new Set());

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const res = await axiosInstance.post("/auth/refresh", {});
        const token = res.data.accessToken;
        setAccessToken(token);
        setLoggedIn(true);
        
        const role = await fetchUserProfile();
        if (role === "USER" || role === "ROLE_USER") {
          await fetchAppliedJobs();
        }
      } catch (err) {
        console.log("No active session or silent refresh failed.");
        setLoggedIn(false);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const res = await axiosInstance.get("/users/me");
      const userData = res.data;
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
      return userData.role; // Return role for chaining
    } catch (err) {
      console.error("Failed to fetch user profile", err);
      if (err.response?.status === 401) logout();
      return null;
    }
  };

  const fetchAppliedJobs = async () => {
    // Extra guard: only for candidates
    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
    const role = user?.role || storedUser.role;
    
    if (role !== "USER" && role !== "ROLE_USER") return;

    try {
      const res = await axiosInstance.get("/application/me", { params: { page: 0, size: 50 } });
      const content = res?.data?.content || res?.content;
      if (content) {
        const ids = new Set(content.map(app => app.jobId));
        setAppliedJobs(ids);
      }
    } catch (err) {
      console.error("Failed to fetch applied jobs in context", err);
    }
  };

  const login = (accessToken, userData) => {
    setAccessToken(accessToken);
    localStorage.setItem("user", JSON.stringify(userData));
    setLoggedIn(true);
    setUser(userData);
    
    fetchUserProfile().then(role => {
       if (role === "USER" || role === "ROLE_USER") {
         fetchAppliedJobs();
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

  if (loading) {
    return (
      <div style={{
        display: "flex", justifyContent: "center", alignItems: "center",
        minHeight: "100vh", fontFamily: "sans-serif", background: "#f9fafb"
      }}>
        <div style={{ textAlign: "center" }}>
          <h2 style={{ color: "#2563eb", marginBottom: "8px" }}>JobVista</h2>
          <p style={{ color: "#6b7280" }}>Loading your session...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ loggedIn, setLoggedIn, user, setUser, login, logout, appliedJobs, setAppliedJobs }}>
      {children}
    </AuthContext.Provider>
  );
};