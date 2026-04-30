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

function App() {
  return (
    <Router>
       <Navbar />

      <div className="app-main">
        <Routes>
          <Route path="/" element={<Home />} />

         <Route
            path="/login"
            element={       
                <Login />  
            }  />

          <Route
            path="/signup"  element={
             <Signup/>
            }/>


          <Route path="/jobs" element={<Jobs />} />

          <Route path="/companies" element={<Companies />} />

  
          <Route path="/about" element={<About />} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/resume"  element={<ProtectedRoute><Resume /></ProtectedRoute>} />   
       <Route path="/admin" element={<ProtectedAdmin AdminComponent={Admin} />} />
       <Route path="/company-dashboard" element={<ProtectedRoute><CompanyDashboard /></ProtectedRoute>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

