import React, { useState, useEffect } from "react";
import axiosInstance from "../../api/axiosConfig";

const STATUS_COLORS = {
  APPLIED: { bg: "rgba(245,169,98,0.2)", color: "#f5a962" },
  SHORTLISTED: { bg: "rgba(108,143,220,0.2)", color: "#6c8fdc" },
  HIRED: { bg: "rgba(125,211,192,0.2)", color: "#7dd3c0" },
  REJECTED: { bg: "rgba(239,68,68,0.2)", color: "#ff6b6b" },
};

function CompanyApplications({ company }) {
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState("");
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (company?.companyId) fetchJobs();
  }, [company]);

  const fetchJobs = async () => {
    try {
      const res = await axiosInstance.get(`/job/company/${company.companyId}`, { params: { page: 0, size: 100 } });
      setJobs(res.data.content || []);
    } catch (err) {
      console.error("Failed to fetch jobs", err);
    }
  };

  useEffect(() => {
    if (selectedJobId) fetchApplications(selectedJobId);
    else setApps([]);
  }, [selectedJobId]);

  const fetchApplications = async (jobId) => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(`/application/job/${jobId}`, { params: { page: 0, size: 50 } });
      setApps(res.data.content || []);
    } catch (err) {
      console.error("Failed to fetch apps", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (appId, newStatus) => {
    setUpdatingId(appId);
    try {
      await axiosInstance.put(`/application/${appId}/status`, null, { params: { status: newStatus } });
      setApps(prev => prev.map(a => a.applicationId === appId ? { ...a, status: newStatus } : a));
      setToast({ msg: `Status → ${newStatus}`, type: "success" });
    } catch (err) {
      setToast({ msg: err.response?.data || "Update failed", type: "error" });
    } finally {
      setUpdatingId(null);
      setTimeout(() => setToast(null), 3000);
    }
  };

  const timeAgo = (d) => {
    if (!d) return "—";
    const diff = Math.floor((Date.now() - new Date(d)) / 60000);
    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
  };

  return (
    <div>
      {toast && <div className={`comp-toast ${toast.type}`}>{toast.msg}</div>}

      <div className="comp-page-header">
        <h1>Applications</h1>
        <p>Review and manage applicants for your jobs</p>
      </div>

      <div style={{ marginBottom: 20 }}>
        <select
          style={{
            padding: "10px 16px", borderRadius: 10, background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.12)", color: "#f5f5fc", fontSize: "0.92rem",
            fontFamily: "inherit", minWidth: 300, outline: "none",
          }}
          value={selectedJobId}
          onChange={(e) => setSelectedJobId(e.target.value)}
        >
          <option value="">— Select a job to view applications —</option>
          {jobs.map(j => (
            <option key={j.jobId} value={j.jobId}>{j.title}</option>
          ))}
        </select>
      </div>

      {!selectedJobId ? (
        <div className="comp-empty">
          <p style={{ fontSize: "1.1rem" }}>Select a job above to see its applicants</p>
        </div>
      ) : loading ? (
        <p style={{ color: "#94a3b8", textAlign: "center", padding: 40 }}>Loading...</p>
      ) : apps.length === 0 ? (
        <div className="comp-empty">
          <p style={{ fontSize: "1.1rem" }}>No applications for this job yet</p>
        </div>
      ) : (
        <div className="comp-section" style={{ padding: 0, overflow: "hidden" }}>
          <table className="comp-table">
            <thead>
              <tr>
                <th>Candidate</th>
                <th>Status</th>
                <th>Applied</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {apps.map((app) => {
                const sc = STATUS_COLORS[app.status] || STATUS_COLORS.APPLIED;
                return (
                  <tr key={app.applicationId}>
                    <td className="title-cell">{app.jobSeekerName || "—"}</td>
                    <td>
                      <span className="comp-badge" style={{ background: sc.bg, color: sc.color }}>
                        {app.status?.toLowerCase()}
                      </span>
                    </td>
                    <td>{timeAgo(app.appliedAt)}</td>
                    <td>
                      <div className="comp-actions">
                        {app.status === "APPLIED" && (
                          <>
                            <button className="comp-btn small success" disabled={updatingId === app.applicationId}
                              onClick={() => handleStatusChange(app.applicationId, "SHORTLISTED")}>
                              Shortlist
                            </button>
                            <button className="comp-btn small delete" disabled={updatingId === app.applicationId}
                              onClick={() => handleStatusChange(app.applicationId, "REJECTED")}>
                              Reject
                            </button>
                          </>
                        )}
                        {app.status === "SHORTLISTED" && (
                          <>
                            <button className="comp-btn small success" disabled={updatingId === app.applicationId}
                              onClick={() => handleStatusChange(app.applicationId, "HIRED")}>
                              Hire
                            </button>
                            <button className="comp-btn small delete" disabled={updatingId === app.applicationId}
                              onClick={() => handleStatusChange(app.applicationId, "REJECTED")}>
                              Reject
                            </button>
                          </>
                        )}
                        {app.status === "HIRED" && (
                          <span style={{ color: "#7dd3c0", fontWeight: 600, fontSize: "0.85rem" }}>✓ Hired</span>
                        )}
                        {app.status === "REJECTED" && (
                          <span style={{ color: "#ff6b6b", fontWeight: 600, fontSize: "0.85rem" }}>✕ Rejected</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default CompanyApplications;
