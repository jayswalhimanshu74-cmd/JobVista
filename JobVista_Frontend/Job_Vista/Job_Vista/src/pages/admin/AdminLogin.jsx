import React, { useState } from "react";
import axiosInstance from "../../api/axiosConfig";
import "../../styles/admin-login.css";

function AdminLogin({ onLoginSuccess }) {
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Authenticate against the real backend to get a JWT token
      const res = await axiosInstance.post("/auth/login", {
        email: credentials.email,
        password: credentials.password,
      });

      const { accessToken, role } = res.data;

      if (role !== "ADMIN") {
        setError("Access denied. You are not an admin.");
        localStorage.removeItem("accessToken");
        return;
      }

      // Store the JWT so axiosInstance attaches it to every request
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("adminLoggedIn", "true");

      onLoginSuccess();
    } catch (err) {
      console.error("Admin login failed", err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        setError("Invalid email or password!");
      } else {
        setError(err.response?.data?.message || "Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-card">
        <h2>Admin Login</h2>
        <p className="login-subtitle">Enter your admin credentials</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            className="input"
            placeholder="Admin Email"
            value={credentials.email}
            onChange={handleChange}
            required
            disabled={loading}
          />

          <input
            type="password"
            name="password"
            className="input"
            placeholder="Admin Password"
            value={credentials.password}
            onChange={handleChange}
            required
            disabled={loading}
          />

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Logging in..." : "Login to Admin"}
          </button>
        </form>

        <p className="demo-credentials">
          <strong>Demo Credentials:</strong>
          <br />
          Email: adm***********.com
          <br />
          Password: ********
        </p>
      </div>
    </div>
  );
}

export default AdminLogin;
