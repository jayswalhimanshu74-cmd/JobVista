import React, { useState, useEffect } from "react";
import axiosInstance from "../../api/axiosConfig";
import { Briefcase, Users, Building2, ClipboardList, TrendingUp, Activity, CheckCircle, Info } from "lucide-react";

function AdminDashboard() {
  const [stats, setStats] = useState({
    totalJobs: "—",
    totalUsers: "—",
    totalCompanies: "—",
    totalApplications: "—",
  });
  const [topJobs, setTopJobs] = useState([]);
  const [topCompanies, setTopCompanies] = useState([]);
  const [recentActivity, setRecentActivity] = useState({ recentJobs: [], recentApplications: [], recentUsers: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [statsRes, appsRes, companiesRes, activityRes] = await Promise.allSettled([
        axiosInstance.get("/admin/stats"),
        axiosInstance.get("/admin/applications-per-job"),
        axiosInstance.get("/admin/top-companies"),
        axiosInstance.get("/admin/recent-activity"),
      ]);

      if (statsRes.status === "fulfilled") {
        const d = statsRes.value.data;
        setStats({
          totalJobs: formatNum(d.totalJobs),
          totalUsers: formatNum(d.totalUsers),
          totalCompanies: formatNum(d.totalCompanies),
          totalApplications: formatNum(d.totalApplications),
        });
      }

      if (appsRes.status === "fulfilled") {
        setTopJobs(appsRes.value.data || []);
      }

      if (companiesRes.status === "fulfilled") {
        setTopCompanies(companiesRes.value.data || []);
      }

      if (activityRes.status === "fulfilled") {
        setRecentActivity(activityRes.value.data || {});
      }
    } catch (err) {
      console.error("Dashboard fetch error", err);
    } finally {
      setLoading(false);
    }
  };

  const formatNum = (n) => {
    if (n == null) return "—";
    return n.toLocaleString();
  };

  const timeAgo = (dateStr) => {
    if (!dateStr) return "";
    const now = new Date();
    const then = new Date(dateStr);
    const diffMs = now - then;
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return "Just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    const diffDay = Math.floor(diffHr / 24);
    if (diffDay < 7) return `${diffDay}d ago`;
    return then.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
  };

  const statCards = [
    { title: "Active Listings", value: stats.totalJobs, icon: <Briefcase size={24} />, color: "#2563eb" },
    { title: "Registered Talent", value: stats.totalUsers, icon: <Users size={24} />, color: "#7c3aed" },
    { title: "Partner Entities", value: stats.totalCompanies, icon: <Building2 size={24} />, color: "#10b981" },
    { title: "Total Submissions", value: stats.totalApplications, icon: <ClipboardList size={24} />, color: "#f59e0b" },
  ];

  const buildRecentActivities = () => {
    const activities = [];

    if (recentActivity.recentApplications) {
      recentActivity.recentApplications.forEach((app) => {
        activities.push({
          icon: <ClipboardList size={14} />,
          action: "Application Received",
          detail: (app.jobSeeker?.user?.name || "Candidate") + " applied for " + (app.job?.title || "Listing"),
          time: app.appliedAt,
          color: "#f59e0b",
        });
      });
    }

    if (recentActivity.recentJobs) {
      recentActivity.recentJobs.forEach((job) => {
        activities.push({
          icon: <Briefcase size={14} />,
          action: "New Job Published",
          detail: job.title + (job.companyName ? ` at ${job.companyName}` : ""),
          time: job.postedAt,
          color: "#2563eb",
        });
      });
    }

    if (recentActivity.recentUsers) {
      recentActivity.recentUsers.forEach((user) => {
        activities.push({
          icon: <Users size={14} />,
          action: "New Registration",
          detail: user.name + ` signed up as ${user.role || "USER"}`,
          time: user.createdAt,
          color: "#10b981",
        });
      });
    }

    activities.sort((a, b) => new Date(b.time) - new Date(a.time));
    return activities.slice(0, 8);
  };

  if (loading) {
    return (
      <div className="admin-dashboard-loading" style={{ textAlign: "center", padding: "100px", color: "var(--text-light)" }}>
        <Activity className="animate-spin" size={48} style={{ marginBottom: "16px" }} />
        <p style={{ fontWeight: 700 }}>Synchronizing Control Panel Data...</p>
      </div>
    );
  }

  const allActivities = buildRecentActivities();

  return (
    <div className="admin-dashboard-content">
      <header className="dashboard-header">
        <h1>Master Overview</h1>
        <p>Real-time platform metrics and ecosystem performance tracking</p>
      </header>

      <div className="stats-grid">
        {statCards.map((stat, index) => (
          <div key={index} className="stat-card">
            <div className="stat-icon" style={{ color: stat.color, backgroundColor: `${stat.color}15` }}>
              {stat.icon}
            </div>
            <div className="stat-content">
              <h3>{stat.title}</h3>
              <p className="stat-value">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "40px" }}>
        <div className="dashboard-section">
          <h2>
            <TrendingUp size={22} style={{ color: "var(--primary)" }} />
            High-Performance Roles
          </h2>
          {topJobs.length === 0 ? (
            <div className="comp-empty" style={{ padding: "32px" }}>
              <p>Insufficient application data</p>
            </div>
          ) : (
            <div className="activities-list">
              {topJobs.slice(0, 5).map((job, i) => (
                <div key={i} className="activity-item">
                  <div className="activity-info" style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{
                      width: "32px", height: "32px", borderRadius: "10px",
                      background: "var(--bg-white)", color: "var(--primary)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "0.85rem", fontWeight: 900, boxShadow: "var(--shadow-sm)"
                    }}>
                      {i + 1}
                    </div>
                    <div>
                      <p className="activity-action">{job.jobTitle}</p>
                      <p className="activity-detail">{job.companyName || "Listed Partner"}</p>
                    </div>
                  </div>
                  <div className="comp-badge shortlisted" style={{ fontSize: "0.75rem" }}>
                    {job.applications} Apps
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="dashboard-section">
          <h2>
            <Building2 size={22} style={{ color: "var(--primary)" }} />
            Elite Partners
          </h2>
          {topCompanies.length === 0 ? (
            <div className="comp-empty" style={{ padding: "32px" }}>
              <p>Insufficent company activity</p>
            </div>
          ) : (
            <div className="activities-list">
              {topCompanies.slice(0, 5).map((c, i) => (
                <div key={i} className="activity-item">
                  <div className="activity-info" style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{
                      width: "32px", height: "32px", borderRadius: "10px",
                      background: "var(--bg-white)", color: "var(--primary)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "0.85rem", fontWeight: 900, boxShadow: "var(--shadow-sm)"
                    }}>
                      {i + 1}
                    </div>
                    <div>
                      <p className="activity-action">{c.companyName}</p>
                    </div>
                  </div>
                  <div className="comp-badge active" style={{ fontSize: "0.75rem", background: "rgba(16,185,129,0.1)", color: "#10b981" }}>
                    {c.jobsPosted} Listings
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <section className="dashboard-section">
        <h2>
          <Activity size={22} style={{ color: "var(--primary)" }} />
          System Pulse
        </h2>
        {allActivities.length === 0 ? (
          <div className="comp-empty" style={{ padding: "40px" }}>
            <p>No system logs recorded recently.</p>
          </div>
        ) : (
          <div className="activities-list">
            {allActivities.map((activity, i) => (
              <div key={i} className="activity-item" style={{ borderLeft: `4px solid ${activity.color}` }}>
                <div className="activity-info">
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "2px" }}>
                    <span style={{ color: activity.color }}>{activity.icon}</span>
                    <p className="activity-action">{activity.action}</p>
                  </div>
                  <p className="activity-detail">{activity.detail}</p>
                </div>
                <span className="activity-time">{timeAgo(activity.time)}</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}



export default AdminDashboard;
