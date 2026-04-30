import React from "react";

function AdminSidebar({ activeTab, setActiveTab, onLogout }) {

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: "📊" },
    { id: "jobs", label: "Jobs", icon: "💼" },
    { id: "users", label: "Users", icon: "👥" },
    { id: "companies", label: "Companies", icon: "🏢" },
    { id: "applications", label: "Applications", icon: "📝" },
  ];
 
  return (
    <aside className="admin-sidebar">
      <div className="sidebar-header">
        <h1 className="sidebar-logo">JobVista Admin</h1>
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
          🚪 Logout
        </button>
      </div>
    </aside>
  );
}

export default AdminSidebar;
