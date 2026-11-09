import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Navbar from "./components/layouts/Navbar";
import { Navigate, useParams } from "react-router-dom";
import ProtectedAdmin from "./pages/admin/ProtectedAdmin";
import About from "./pages/user/About";
import Admin from "./pages/user/Admin";
import Companies from "./pages/user/Companies";
import Home from "./pages/user/Home";
import Jobs from "./pages/user/Jobs";
import JobDetails from "./pages/user/JobDetails";
import Login from "./pages/user/Login";
import Profile from "./pages/user/Profile";
import Resume from "./pages/user/Resume";
import Signup from "./pages/user/Signup";
import ProtectedRoute from "./pages/user/ProtectedRoute";
import CompanyDashboard from "./pages/company/CompanyDashboard";
import ErrorBoundary from "./components/ui/ErrorBoundary";
import NotFound from "./pages/user/NotFound";

function App() {

  function JobRedirect() {
    const { jobId } = useParams();
    return <Navigate to={`/jobs/${jobId}`} replace />;
  }


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
          <Route path="/jobs/:jobId" element={<ErrorBoundary><JobDetails /></ErrorBoundary>} />
          <Route path="/job/:jobId" element={<ErrorBoundary><JobRedirect /></ErrorBoundary>} />

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

          <Route path="*" element={<NotFound />} />

        </Routes>
      </div>
    </Router>
  );
}

export default App;

