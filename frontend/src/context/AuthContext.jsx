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
      fetchUserProfile();
      fetchAppliedJobs();
    }
  }, []);

  const fetchUserProfile = async () => {
    try {
      // Use the centralized axios instance
      const res = await axiosInstance.get("/users/me");
      setUser(res.data);
      localStorage.setItem("user", JSON.stringify(res.data));
    } catch (err) {
      console.error("Failed to fetch user profile", err);
      // If unauthorized, logout
      if (err.response?.status === 401) logout();
    }
  };

  const fetchAppliedJobs = async () => {
    try {
      const res = await axiosInstance.get("/application/me", { params: { page: 0, size: 200 } });
      if (res?.data?.content) {
        const ids = new Set(res.data.content.map(app => app.jobId));
        setAppliedJobs(ids);
      } else if (res?.content) {
        const ids = new Set(res.content.map(app => app.jobId));
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
    fetchUserProfile(); // Get full profile
    fetchAppliedJobs(); // Fetch after login
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