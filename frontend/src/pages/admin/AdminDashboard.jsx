import React, { useState, useEffect } from "react";
import axiosInstance from "../../api/axiosConfig";

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
    { title: "Total Jobs", value: stats.totalJobs, icon: "💼", color: "#6c8fdc" },
    { title: "Total Users", value: stats.totalUsers, icon: "👥", color: "#7dd3c0" },
    { title: "Total Companies", value: stats.totalCompanies, icon: "🏢", color: "#f5a962" },
    { title: "Applications", value: stats.totalApplications, icon: "📝", color: "#e74c3c" },
  ];

  // Build unified recent activities list
  const buildRecentActivities = () => {
    const activities = [];

    if (recentActivity.recentApplications) {
      recentActivity.recentApplications.forEach((app) => {
        activities.push({
          action: "📝 Application submitted",
          detail: (app.jobSeeker?.user?.name || "Someone") + " applied to " + (app.job?.title || "a job"),
          time: app.appliedAt,
          color: "#f5a962",
        });
      });
    }

    if (recentActivity.recentJobs) {
      recentActivity.recentJobs.forEach((job) => {
        activities.push({
          action: "💼 New job posted",
          detail: job.title + (job.companyName ? ` at ${job.companyName}` : ""),
          time: job.postedAt,
          color: "#6c8fdc",
        });
      });
    }

    if (recentActivity.recentUsers) {
      recentActivity.recentUsers.forEach((user) => {
        activities.push({
          action: "👤 New user registered",
          detail: user.name + ` (${user.role || "USER"})`,
          time: user.createdAt,
          color: "#7dd3c0",
        });
      });
    }

    // Sort by time descending
    activities.sort((a, b) => new Date(b.time) - new Date(a.time));
    return activities.slice(0, 10);
  };

  if (loading) {
    return (
      <div className="admin-dashboard" style={{ textAlign: "center", padding: 80, color: "#94a3b8" }}>
        Loading dashboard...
      </div>
    );
  }

  const allActivities = buildRecentActivities();

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <p>Welcome back, Admin! Here's your real-time platform overview.</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        {statCards.map((stat, index) => (
          <div key={index} className="stat-card">
            <div className="stat-icon" style={{ color: stat.color }}>
              {stat.icon}
            </div>
            <div className="stat-content">
              <h3>{stat.title}</h3>
              <p className="stat-value">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Two-column: Top Jobs + Top Companies */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
        {/* Top Jobs by Applications */}
        <div className="dashboard-section">
          <h2>🔥 Most Applied Jobs</h2>
          {topJobs.length === 0 ? (
            <p style={{ color: "#64748b", textAlign: "center", padding: 20 }}>No application data yet</p>
          ) : (
            <div className="activities-list">
              {topJobs.slice(0, 5).map((job, i) => (
                <div key={i} className="activity-item">
                  <div className="activity-info" style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{
                      display: "inline-flex", alignItems: "center", justifyContent: "center",
                      width: 28, height: 28, borderRadius: 8,
                      background: "rgba(108,143,220,0.15)", color: "#6c8fdc",
                      fontSize: "0.8rem", fontWeight: 700, flexShrink: 0,
                    }}>
                      {i + 1}
                    </span>
                    <p className="activity-action" style={{ margin: 0 }}>{job.jobTitle}</p>
                  </div>
                  <span style={{
                    padding: "4px 12px", borderRadius: 16, fontSize: "0.82rem", fontWeight: 600,
                    background: "rgba(125,211,192,0.12)", color: "#7dd3c0",
                    border: "1px solid rgba(125,211,192,0.2)", whiteSpace: "nowrap",
                  }}>
                    {job.applications}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Companies */}
        <div className="dashboard-section">
          <h2>🏢 Top Companies</h2>
          {topCompanies.length === 0 ? (
            <p style={{ color: "#64748b", textAlign: "center", padding: 20 }}>No company data yet</p>
          ) : (
            <div className="activities-list">
              {topCompanies.slice(0, 5).map((c, i) => (
                <div key={i} className="activity-item">
                  <div className="activity-info" style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{
                      display: "inline-flex", alignItems: "center", justifyContent: "center",
                      width: 28, height: 28, borderRadius: 8,
                      background: "rgba(245,169,98,0.15)", color: "#f5a962",
                      fontSize: "0.8rem", fontWeight: 700, flexShrink: 0,
                    }}>
                      {i + 1}
                    </span>
                    <p className="activity-action" style={{ margin: 0 }}>{c.companyName}</p>
                  </div>
                  <span style={{
                    padding: "4px 12px", borderRadius: 16, fontSize: "0.82rem", fontWeight: 600,
                    background: "rgba(245,169,98,0.12)", color: "#f5a962",
                    border: "1px solid rgba(245,169,98,0.2)", whiteSpace: "nowrap",
                  }}>
                    {c.jobsPosted} jobs
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Activities */}
      <div className="dashboard-section">
        <h2>⚡ Recent Activities</h2>
        {allActivities.length === 0 ? (
          <p style={{ color: "#64748b", textAlign: "center", padding: 30 }}>
            No recent activities yet.
          </p>
        ) : (
          <div className="activities-list">
            {allActivities.map((activity, i) => (
              <div key={i} className="activity-item" style={{ borderLeftColor: activity.color }}>
                <div className="activity-info">
                  <p className="activity-action">{activity.action}</p>
                  <p className="activity-detail">{activity.detail}</p>
                </div>
                <span className="activity-time">{timeAgo(activity.time)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
