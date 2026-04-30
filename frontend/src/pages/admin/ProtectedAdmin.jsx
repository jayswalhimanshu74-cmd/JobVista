import React, { useState, useEffect } from "react";
import AdminLogin from "./AdminLogin";
import axiosInstance from "../../api/axiosConfig";

// ProtectedAdmin persists admin authentication via localStorage + JWT.
// On refresh it checks whether a valid admin token still exists.
// The axios interceptor will auto-refresh the token if it has expired.
function ProtectedAdmin({ AdminComponent }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    verifyAdminSession();
  }, []);

  const verifyAdminSession = async () => {
    const token = localStorage.getItem("accessToken");
    const adminFlag = localStorage.getItem("adminLoggedIn");

    if (!token || adminFlag !== "true") {
      setIsAuthenticated(false);
      setChecking(false);
      return;
    }

    try {
      // Verify the token is still valid by calling a lightweight endpoint
      // The axios interceptor will automatically refresh the token if it expired
      const res = await axiosInstance.get("/users/me");
      if (res.data && res.data.role === "ADMIN") {
        setIsAuthenticated(true);
      } else {
        // Valid token but not an admin
        localStorage.removeItem("adminLoggedIn");
        setIsAuthenticated(false);
      }
    } catch (err) {
      const status = err.response?.status;

      if (status === 401 || status === 403) {
        // Token is truly invalid/expired and refresh also failed
        localStorage.removeItem("adminLoggedIn");
        localStorage.removeItem("accessToken");
        setIsAuthenticated(false);
      } else {
        // Network error or server issue — if we have a valid-looking token
        // and adminFlag is set, give benefit of the doubt and let the admin in.
        // The next API call will properly fail if the token is really dead.
        console.warn("Admin verify network error, allowing cached session:", err.message);
        setIsAuthenticated(true);
      }
    } finally {
      setChecking(false);
    }
  };

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("adminLoggedIn");
    localStorage.removeItem("user");
    setIsAuthenticated(false);
  };

  if (checking) {
    return (
      <div style={{
        display: "flex", justifyContent: "center", alignItems: "center",
        minHeight: "100vh", background: "linear-gradient(90deg, #083787, #0f2f5f, #001435)",
        color: "#94a3b8", fontSize: "1.1rem", fontFamily: "'Poppins', sans-serif"
      }}>
        Verifying admin session...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AdminLogin onLoginSuccess={handleLoginSuccess} />;
  }

  return <AdminComponent onLogout={handleLogout} />;
}

export default ProtectedAdmin;
