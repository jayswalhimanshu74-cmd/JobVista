import React from "react";
import { LayoutDashboard, Briefcase, PlusCircle, Users, Settings } from "lucide-react";

function CompanySidebar({ activeTab, setActiveTab, companyName }) {
  const tabs = [
    { id: "overview", label: "Dashboard", icon: <LayoutDashboard size={22} /> },
    { id: "jobs", label: "My Jobs", icon: <Briefcase size={22} /> },
    { id: "post", label: "Post a Job", icon: <PlusCircle size={22} /> },
    { id: "applications", label: "Applications", icon: <Users size={22} /> },
    { id: "profile", label: "Settings", icon: <Settings size={22} /> },
  ];

  return (
    <aside className="company-sidebar">
      <div className="sidebar-brand">
        <h2>
          <span>{companyName || "Company"}</span>
        </h2>
        <p>Business Central</p>
      </div>
      <nav className="nav-items">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`nav-btn ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="nav-icon">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
}

export default CompanySidebar;
