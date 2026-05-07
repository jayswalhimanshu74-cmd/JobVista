import React from "react";
import { LayoutDashboard, Briefcase, Users, Building2, ClipboardList, LogOut } from "lucide-react";

function AdminSidebar({ activeTab, setActiveTab, onLogout }) {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={20} /> },
    { id: "jobs", label: "Job Listings", icon: <Briefcase size={20} /> },
    { id: "users", label: "User Directory", icon: <Users size={20} /> },
    { id: "companies", label: "Partner Companies", icon: <Building2 size={20} /> },
    { id: "applications", label: "Master Log", icon: <ClipboardList size={20} /> },
  ];

  return (
    <aside className="admin-sidebar">
      <div className="sidebar-header">
        <h1 className="sidebar-logo">JobVista Admin</h1>
        <p style={{ fontSize: "0.8rem", color: "var(--text-light)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px" }}>Control Center</p>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${activeTab === item.id ? "active" : ""}`}
            onClick={() => setActiveTab(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button
          className="logout-btn"
          onClick={() => {
            if (onLogout) onLogout();
          }}
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}

export default AdminSidebar;
