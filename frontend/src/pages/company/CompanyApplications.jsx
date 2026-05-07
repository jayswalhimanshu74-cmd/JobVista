import React, { useState, useEffect } from "react";
import axiosInstance from "../../api/axiosConfig";
import { UserCheck, UserMinus, Star, Clock, AlertCircle, Check, X, FileText } from "lucide-react";

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
      setToast({ msg: `Candidate status updated to ${newStatus}`, type: "success" });
    } catch (err) {
      setToast({ msg: err.response?.data || "Failed to update candidate status", type: "error" });
    } finally {
      setUpdatingId(null);
      setTimeout(() => setToast(null), 3000);
    }
  };

  const formatEnum = (str) => {
    if (!str) return "—";
    return str
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join("-");
  };

  const timeAgo = (d) => {
    if (!d) return "—";
    const diff = Math.floor((Date.now() - new Date(d)) / 60000);
    if (diff < 1) return "Just now";
    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return new Date(d).toLocaleDateString("en-US", { day: "2-digit", month: "short" });
  };

  return (
    <div className="company-applications-content">
      {toast && (
        <div className={`comp-toast ${toast.type}`}>
          {toast.type === "success" ? <Check size={18} /> : <AlertCircle size={18} />}
          {toast.msg}
        </div>
      )}

      <header className="comp-page-header">
        <h1>Talent Acquisition</h1>
        <p>Review candidate profiles and manage your hiring pipeline</p>
      </header>

      <div className="comp-section" style={{ marginBottom: "24px" }}>
        <div className="comp-field" style={{ maxWidth: "450px" }}>
          <label>Filter by Job Posting</label>
          <select
            value={selectedJobId}
            onChange={(e) => setSelectedJobId(e.target.value)}
            style={{ width: "100%" }}
          >
            <option value="">— Select an active job —</option>
            {jobs.map(j => (
              <option key={j.jobId} value={j.jobId}>{j.title}</option>
            ))}
          </select>
        </div>
      </div>

      {!selectedJobId ? (
        <div className="comp-empty">
          <Clock size={48} style={{ color: "#94a3b8", marginBottom: "16px" }} />
          <p style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-main)" }}>No job selected</p>
          <p>Please select a job listing from the dropdown above to view applicants.</p>
        </div>
      ) : loading ? (
        <div className="comp-empty">
          <Clock className="animate-spin" size={40} />
          <p>Fetching candidate applications...</p>
        </div>
      ) : apps.length === 0 ? (
        <div className="comp-empty">
          <UserMinus size={48} style={{ color: "#94a3b8", marginBottom: "16px" }} />
          <p style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-main)" }}>No applications found</p>
          <p>No candidates have applied for this position yet.</p>
        </div>
      ) : (
        <div className="comp-section" style={{ padding: "0 40px 40px" }}>
          <div className="comp-table-container">
            <table className="comp-table">
              <thead>
                <tr>
                  <th>Candidate Name</th>
                  <th>Status</th>
                  <th>Applied On</th>
                  <th style={{ textAlign: "right" }}>Recruitment Actions</th>
                </tr>
              </thead>
              <tbody>
                {apps.map((app) => (
                  <tr key={app.applicationId}>
                    <td className="title-cell">
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div className="home-letter-avatar" style={{ width: "32px", height: "32px", fontSize: "0.9rem" }}>
                          {app.jobSeekerName?.charAt(0) || "A"}
                        </div>
                        {app.jobSeekerName || "Anonymous Candidate"}
                      </div>
                    </td>
                    <td>
                      <span className={`comp-badge ${app.status?.toLowerCase()}`} style={{
                        background: app.status === "HIRED" ? "rgba(16,185,129,0.12)" : app.status === "REJECTED" ? "rgba(239,68,68,0.12)" : "rgba(37,99,235,0.12)",
                        color: app.status === "HIRED" ? "#10b981" : app.status === "REJECTED" ? "#ef4444" : "#2563eb",
                      }}>
                        {formatEnum(app.status)}
                      </span>
                    </td>
                    <td>{timeAgo(app.appliedAt)}</td>
                    <td>
                      <div className="comp-actions" style={{ justifyContent: "flex-end" }}>
                        {app.status === "APPLIED" && (
                          <>
                            <button className="comp-btn edit" disabled={updatingId === app.applicationId}
                              onClick={() => handleStatusChange(app.applicationId, "SHORTLISTED")} title="Shortlist">
                              <Star size={16} /> Shortlist
                            </button>
                            <button className="comp-btn delete" disabled={updatingId === app.applicationId}
                              onClick={() => handleStatusChange(app.applicationId, "REJECTED")} title="Reject">
                              <X size={16} />
                            </button>
                          </>
                        )}
                        {app.status === "SHORTLISTED" && (
                          <>
                            <button className="comp-btn primary" disabled={updatingId === app.applicationId}
                              onClick={() => handleStatusChange(app.applicationId, "HIRED")} title="Hire">
                              <UserCheck size={16} /> Hire
                            </button>
                            <button className="comp-btn delete" disabled={updatingId === app.applicationId}
                              onClick={() => handleStatusChange(app.applicationId, "REJECTED")} title="Reject">
                              <X size={16} />
                            </button>
                          </>
                        )}
                        {app.status === "HIRED" && (
                          <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#10b981", fontWeight: 800 }}>
                            <Check size={18} /> Onboarded
                          </div>
                        )}
                        {app.status === "REJECTED" && (
                          <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#ef4444", fontWeight: 800 }}>
                            <X size={18} /> Rejected
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default CompanyApplications;

