import React, { createContext, useState, useEffect } from "react";
import { isAuthenticated, getUser } from "../utills/auth";
import authService from "../api/authService";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [appliedJobs, setAppliedJobs] = useState(new Set());

  useEffect(() => {
    const isAuth = isAuthenticated();
    setLoggedIn(isAuth);
    setUser(getUser());
    
    if (isAuth) {
      fetchAppliedJobs();
    }
  }, []);

  const fetchAppliedJobs = async () => {
    try {
      // Import jobService dynamically or via a prop to avoid circular dependency if any
      // For now, assume it's available or use a basic fetch
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) return;

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://jobvista-psro.onrender.com/api/v1/'}application/me?page=0&size=200`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      const data = await response.json();
      if (data?.content) {
        const ids = new Set(data.content.map(app => app.jobId));
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
    fetchAppliedJobs(); // Fetch after login
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    localStorage.removeItem("profileData")
    setLoggedIn(false);
    setUser(null);
    setAppliedJobs(new Set());
  };

  return (
    <AuthContext.Provider value={{ loggedIn, setLoggedIn, user, setUser, login, logout, appliedJobs, setAppliedJobs }}>
      {children}
    </AuthContext.Provider>
  );
};