import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import "../../styles/admin.css";
import AdminSidebar from "../../components/layouts/AdminSidebar";
import AdminApplications from "../admin/AdminApplications";
import AdminCompanies from "../admin/AdminCompanies";
import AdminDashboard from "../admin/AdminDashboard";
import AdminJobs from "../admin/AdminJobs";
import AdminUsers from "../admin/AdminUsers";

function Admin({ onLogout }) {
  const [activeTab, setActiveTab] = useState("dashboard");
  const navigate = useNavigate();

  const handleLogout = () => {
    if (onLogout) onLogout();
    navigate("/admin");
  };

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <AdminDashboard />;
      case "jobs":
        return <AdminJobs />;
      case "users":
        return <AdminUsers />;
      case "companies":
        return <AdminCompanies />;
      case "applications":
        return <AdminApplications />;
      default:
        return <AdminDashboard />;
    }
  };

  return (
    <div className="admin-container">
      <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} />
      <div className="admin-main">
        {renderContent()}
      </div>
    </div>
  );
}

export default Admin;
