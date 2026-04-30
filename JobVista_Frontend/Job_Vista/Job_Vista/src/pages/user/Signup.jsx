import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../../api/authService";
import axiosInstance from "../../api/axiosConfig";
import { AuthContext } from "../../context/AuthContext";
import "../../styles/signup.css";

function Signup() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const [role, setRole] = useState("USER");

  const [formData, setFormData] = useState({
    // Common
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    mobileNumber: "",

    // Job Seeker
    skills: "",
    experience: "",
    qualification: "",

    // Company
    companyName: "",
    companyEmail: "",
    companyWebsite: "",
    location: "",
    description: "",
    logoUrl: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    try {
      setLoading(true);

      // Step 1: Register the user
      let userPayload = {
        role,
        email: formData.email,
        password: formData.password,
        mobileNumber: formData.mobileNumber,
      };

      if (role === "USER") {
        userPayload.name = formData.name;
      } else if (role === "COMPANY") {
        // Backend requires a 'name' field for the User entity
        userPayload.name = formData.companyName;
      }

      await authService.register(userPayload);

      // Step 2: For COMPANY, auto-login and create company profile
      if (role === "COMPANY") {
        try {
          const tokenData = await authService.login({
            email: formData.email,
            password: formData.password,
          });

          // Set the token so axiosInstance can use it
          localStorage.setItem("accessToken", tokenData.accessToken);

          // Create company profile
          await axiosInstance.post("/company", {
            companyName: formData.companyName,
            companyEmail: formData.companyEmail || formData.email,
            location: formData.location,
            companyWebsite: formData.companyWebsite,
            description: formData.description,
            logoUrl: formData.logoUrl,
          });

          // Fetch user profile and set context
          const me = await authService.getCurrentUser();
          login(tokenData.accessToken, me);
          localStorage.setItem("user", JSON.stringify(me));

          navigate("/company-dashboard");
          return;
        } catch (companyErr) {
          console.error("Company setup error:", companyErr);
          // User was created but company profile failed — still redirect to login
          alert("Account created! Company profile setup can be done from your dashboard. Please login.");
          navigate("/login");
          return;
        }
      }

      // For USER role, just go to login
      alert("Signup successful! Please login.");
      navigate("/login");

    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        <h2>Create Account</h2>
        <p className="signup-subtitle">Join JobVista today</p>

        {/* ROLE TOGGLERS */}
        <div className="role-toggle p-2 m-2">
          <button
            type="button"
            className={`m-2 hover:bg-blue-800 text-white p-2 rounded-2xl ${role === "USER" ? "active-role" : ""}`}
            onClick={() => setRole("USER")}
          >
            Job-Seeker
          </button>

          <button
            type="button"
            className={`m-2 hover:bg-blue-800 text-white p-2 rounded-2xl ${role === "COMPANY" ? "active-role" : ""}`}
            onClick={() => setRole("COMPANY")}
          >
            Company
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form className="m-1" onSubmit={handleSubmit}>

          {/* COMMON FIELDS */}
          <input
            type="email"
            name="email"
            className="signup-input"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <input
            type="tel"
            name="mobileNumber"
            className="signup-input"
            placeholder="Mobile Number"
            value={formData.mobileNumber}
            onChange={handleChange}
            required
          />

          <input
            type="password"
            name="password"
            className="signup-input"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <input
            type="password"
            name="confirmPassword"
            className="signup-input"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />

          {/* JOB SEEKER FIELDS */}
          {role === "USER" && (
            <>
              <input
                type="text"
                name="name"
                className="signup-input"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}
                required
              />

              <input
                type="text"
                name="qualification"
                className="signup-input"
                placeholder="Qualification"
                value={formData.qualification}
                onChange={handleChange}
                required
              />

              <input
                type="text"
                name="skills"
                className="signup-input"
                placeholder="Skills"
                value={formData.skills}
                onChange={handleChange}
              />

              <input
                type="number"
                name="experience"
                className="signup-input"
                placeholder="Years of Experience"
                value={formData.experience}
                onChange={handleChange}
              />
            </>
          )}

          {/* COMPANY FIELDS */}
          {role === "COMPANY" && (
            <>
              <input
                type="text"
                name="companyName"
                className="signup-input"
                placeholder="Company Name"
                value={formData.companyName}
                onChange={handleChange}
                required
              />

              <input
                type="email"
                name="companyEmail"
                className="signup-input"
                placeholder="Company Email (contact email)"
                value={formData.companyEmail}
                onChange={handleChange}
                required
              />

              <input
                type="text"
                name="location"
                className="signup-input"
                placeholder="Company Location (e.g. Mumbai, India)"
                value={formData.location}
                onChange={handleChange}
                required
              />

              <input
                type="url"
                name="companyWebsite"
                className="signup-input"
                placeholder="Company Website (optional)"
                value={formData.companyWebsite}
                onChange={handleChange}
              />

              <textarea
                name="description"
                className="signup-input"
                placeholder="About your company..."
                value={formData.description}
                onChange={handleChange}
                rows={3}
                style={{ resize: "vertical", minHeight: 70 }}
              />

              <input
                type="url"
                name="logoUrl"
                className="signup-input"
                placeholder="Logo URL (optional)"
                value={formData.logoUrl}
                onChange={handleChange}
              />
            </>
          )}

          <button type="submit" className="signup-btn" disabled={loading}>
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        <p className="signup-bottom">
          Already have an account?
          <span
            className="signup-link"
            onClick={() => navigate("/login")}
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
}

export default Signup;