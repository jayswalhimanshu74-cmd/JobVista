import React, { useState, useEffect } from "react";
import axiosInstance from "../../api/axiosConfig";
import { Briefcase, Users, UserCheck, Clock, ListChecks } from "lucide-react";

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

  const formatEnum = (str) => {
    if (!str) return "—";
    return str
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  const statCards = [
    { title: "Live Jobs", value: stats.totalJobs, icon: <Briefcase size={24} />, color: "#2563eb" },
    { title: "Applications", value: stats.totalApps, icon: <Users size={24} />, color: "#7c3aed" },
    { title: "Talent Hired", value: stats.hired, icon: <UserCheck size={24} />, color: "#10b981" },
    { title: "To Review", value: stats.pending, icon: <Clock size={24} />, color: "#f59e0b" },
  ];

  return (
    <div className="company-overview-content">
      <header className="comp-page-header">
        <h1>Welcome back, {company?.companyName || "Partner"}</h1>
        <p>Monitor your hiring pipeline and talent acquisition performance</p>
      </header>

      <div className="comp-stats-grid">
        {statCards.map((s, i) => (
          <div className="comp-stat-card" key={i}>
            <div className="icon" style={{ color: s.color, backgroundColor: `${s.color}15` }}>
              {s.icon}
            </div>
            <div className="info">
              <h3>{s.title}</h3>
              <p className="value">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <section className="comp-section">
        <h2>
          <ListChecks size={24} className="section-icon" /> 
          Recent Applications
        </h2>
        {recentApps.length === 0 ? (
          <div className="comp-empty">
            <p>No applications received yet.</p>
            <p>Share your job posts to attract candidates.</p>
          </div>
        ) : (
          <div className="comp-table-container">
            <table className="comp-table">
              <thead>
                <tr>
                  <th>Candidate</th>
                  <th>Job Title</th>
                  <th>Status</th>
                  <th>Applied</th>
                </tr>
              </thead>
              <tbody>
                {recentApps.map((app, i) => (
                  <tr key={i}>
                    <td className="title-cell">{app.jobSeekerName || "Anonymous"}</td>
                    <td>{app.jobTitle}</td>
                    <td>
                      <span className={`comp-badge ${app.status?.toLowerCase()}`} style={{
                        background: app.status === "HIRED" ? "rgba(16,185,129,0.12)" : app.status === "REJECTED" ? "rgba(239,68,68,0.12)" : "rgba(37,99,235,0.12)",
                        color: app.status === "HIRED" ? "#10b981" : app.status === "REJECTED" ? "#ef4444" : "#2563eb",
                      }}>
                        {formatEnum(app.status)}
                      </span>
                    </td>
                    <td>{timeAgo(app.appliedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default CompanyOverview;


