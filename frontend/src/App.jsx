import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Navbar from "./components/layouts/Navbar";
import ProtectedAdmin from "./pages/admin/ProtectedAdmin";
import About from "./pages/user/About";
import Admin from "./pages/user/Admin";
import Companies from "./pages/user/Companies";
import Home from "./pages/user/Home";
import Jobs from "./pages/user/Jobs";
import Login from "./pages/user/Login";
import Profile from "./pages/user/Profile";
import Resume from "./pages/user/Resume";
import Signup from "./pages/user/Signup";
import ProtectedRoute from "./pages/user/ProtectedRoute";
import CompanyDashboard from "./pages/company/CompanyDashboard";
import ErrorBoundary from "./components/ui/ErrorBoundary";

function App() {
  return (
    <Router>
      <Navbar />

      <div className="app-main">
        <Routes>
          <Route path="/" element={
            <ErrorBoundary>
              <Home />
            </ErrorBoundary>} />

          <Route
            path="/login"
            element={<ErrorBoundary><Login /></ErrorBoundary>} />

          <Route
            path="/signup" element={<ErrorBoundary><Signup /></ErrorBoundary>} />


          <Route path="/jobs" element={<ErrorBoundary><Jobs /></ErrorBoundary>} />

          <Route path="/companies" element={<ErrorBoundary><Companies /></ErrorBoundary>} />


          <Route path="/about" element={<ErrorBoundary><About /></ErrorBoundary>} />
          <Route path="/profile" element={<ProtectedRoute>
            <ErrorBoundary>
              <Profile />
            </ErrorBoundary></ProtectedRoute>} />
          <Route path="/resume" element={<ProtectedRoute>
            <ErrorBoundary>
              <Resume />
            </ErrorBoundary></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedAdmin AdminComponent={Admin} />} />
          <Route path="/company-dashboard" element={<ProtectedRoute>
            <ErrorBoundary>
              <CompanyDashboard />
            </ErrorBoundary></ProtectedRoute>} />
          

          <Route path="*" element={
            <div style={{
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              minHeight: "60vh", textAlign: "center"
              }}>
                <h2 style={{ fontSize: "1.5rem", color: "#111", marginBottom: "1rem" }}>
                  404 — Page Not Found
                </h2>
                <p style={{ color: "#6b7280", marginBottom: "1.5rem" }}>
                  The page you're looking for doesn't exist.
                </p>
                <a href="/" style={{
                  padding: "10px 24px", borderRadius: "8px",
                  background: "#2563eb", color: "#fff",
                  textDecoration: "none", fontWeight: 600
                }}>
                  Go Home
                </a>
              </div>
            } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

