import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/login.css";

import authService from "../../api/authService";
import { AuthContext } from "../../context/AuthContext";

function Login() {

   const { login } = useContext(AuthContext);

  const navigate = useNavigate();
   const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await authService.login(formData);
      // cache user details for quick access
      try {
        const me = await authService.getCurrentUser();
        login(data.accessToken, me);
        localStorage.setItem("user", JSON.stringify(me));
        // Role-based redirect
        if (me.role === "COMPANY") {
          navigate("/company-dashboard");
        } else {
          navigate("/");
        }
      } catch {
        login(data.accessToken, { email: formData.email });
        navigate("/");
      }
    } catch (error) {
      console.error("Login failed", error);
      setError(error.response?.data?.message || "Login failed. Please check your credentials and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Welcome Back</h2>
        <p className="login-subtitle">Login to your account</p>

        {error && <div className="error-message" style={{ color: "red", marginBottom: "10px", fontSize: "14px", textAlign: "center" }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            className="input"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <input
            type="password"
            name="password"
            className="input"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="login-bottom">
          Don't have an account?
          <span
            className="login-link"
            onClick={() => navigate("/signup")}
          >
            Sign Up
          </span>
        </p>
      </div>
    </div>
  );
}

export default Login;