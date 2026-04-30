import React, { useState, useEffect } from "react";
import axiosInstance from "../../api/axiosConfig";

function CompanyOverview({ company }) {
  const [jobs, setJobs] = useState([]);
  const [recentApps, setRecentApps] = useState([]);
  const [stats, setStats] = useState({ totalJobs: 0, totalApps: 0, hired: 0, pending: 0 });

  useEffect(() => {
    if (company?.companyId) fetchData();
  }, [company]);

  const fetchData = async () => {
    try {
      const jobsRes = await axiosInstance.get(`/job/company/${company.companyId}`, { params: { page: 0, size: 100 } });
      const jobList = jobsRes.data.content || [];
      setJobs(jobList);

      let allApps = [];
      for (const job of jobList.slice(0, 10)) {
        try {
          const appsRes = await axiosInstance.get(`/application/job/${job.jobId}`, { params: { page: 0, size: 50 } });
          if (appsRes.data.content) allApps = [...allApps, ...appsRes.data.content];
        } catch (e) { /* skip */ }
      }

      allApps.sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt));
      setRecentApps(allApps.slice(0, 5));

      setStats({
        totalJobs: jobList.length,
        totalApps: allApps.length,
        hired: allApps.filter(a => a.status === "HIRED").length,
        pending: allApps.filter(a => a.status === "APPLIED").length,
      });
    } catch (err) {
      console.error("Overview fetch error", err);
    }
  };

  const timeAgo = (d) => {
    if (!d) return "";
    const diff = Math.floor((Date.now() - new Date(d)) / 60000);
    if (diff < 1) return "Just now";
    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return `${Math.floor(diff / 1440)}d ago`;
  };

  const statCards = [
    { title: "Total Jobs", value: stats.totalJobs, icon: "💼", color: "#6c8fdc" },
    { title: "Applications", value: stats.totalApps, icon: "📝", color: "#f5a962" },
    { title: "Hired", value: stats.hired, icon: "✅", color: "#7dd3c0" },
    { title: "Pending", value: stats.pending, icon: "⏳", color: "#a855f7" },
  ];

  return (
    <div>
      <div className="comp-page-header">
        <h1>Welcome, {company?.companyName || "Company"}!</h1>
        <p>Here's your hiring overview</p>
      </div>

      <div className="comp-stats-grid">
        {statCards.map((s, i) => (
          <div className="comp-stat-card" key={i}>
            <span className="icon">{s.icon}</span>
            <div className="info">
              <h3>{s.title}</h3>
              <p className="value" style={{ color: s.color }}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="comp-section">
        <h2>📋 Recent Applications</h2>
        {recentApps.length === 0 ? (
          <p style={{ color: "#64748b", textAlign: "center", padding: 20 }}>No applications yet. Post jobs to start receiving applications!</p>
        ) : (
          <table className="comp-table">
            <thead>
              <tr><th>Candidate</th><th>Job</th><th>Status</th><th>Applied</th></tr>
            </thead>
            <tbody>
              {recentApps.map((app, i) => (
                <tr key={i}>
                  <td className="title-cell">{app.jobSeekerName || "—"}</td>
                  <td>{app.jobTitle || "—"}</td>
                  <td>
                    <span className="comp-badge" style={{
                      background: app.status === "HIRED" ? "rgba(125,211,192,0.2)" : app.status === "REJECTED" ? "rgba(239,68,68,0.2)" : "rgba(245,169,98,0.2)",
                      color: app.status === "HIRED" ? "#7dd3c0" : app.status === "REJECTED" ? "#ff6b6b" : "#f5a962",
                    }}>{app.status?.toLowerCase()}</span>
                  </td>
                  <td>{timeAgo(app.appliedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default CompanyOverview;
