import React from "react";

function CompanySidebar({ activeTab, setActiveTab, companyName }) {
  const tabs = [
    { id: "overview", label: "Overview", icon: "📊" },
    { id: "jobs", label: "My Jobs", icon: "💼" },
    { id: "post", label: "Post Job", icon: "➕" },
    { id: "applications", label: "Applications", icon: "📝" },
    { id: "profile", label: "Company Profile", icon: "🏢" },
  ];

  return (
    <aside className="company-sidebar">
      <div className="sidebar-brand">
        <h2>🏢 {companyName || "Company"}</h2>
        <p>Company Dashboard</p>
      </div>
      <div className="nav-items">
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
      </div>
    </aside>
  );
}

export default CompanySidebar;
