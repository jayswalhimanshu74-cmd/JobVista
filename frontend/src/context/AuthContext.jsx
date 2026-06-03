import React, { createContext, useState, useEffect } from "react";
import { isAuthenticated, getUser } from "../utills/auth";
import authService from "../api/authService";
import axiosInstance from "../api/axiosConfig";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [appliedJobs, setAppliedJobs] = useState(new Set());

  useEffect(() => {
    const isAuth = isAuthenticated();
    setLoggedIn(isAuth);
    
    if (isAuth) {
      fetchUserProfile().then(role => {
        if (role === "USER" || role === "ROLE_USER") {
          fetchAppliedJobs();
        }
      });
    }
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
    localStorage.setItem("accessToken", accessToken);
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
    localStorage.clear();
    setLoggedIn(false);
    setUser(null);
    setAppliedJobs(new Set());
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ loggedIn, setLoggedIn, user, setUser, login, logout, appliedJobs, setAppliedJobs }}>
      {children}
    </AuthContext.Provider>
  );
};