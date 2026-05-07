import React, { useState, useEffect } from "react";
import axiosInstance from "../../api/axiosConfig";
import { Edit, Trash2, MapPin, Calendar, Clock, AlertCircle } from "lucide-react";

function CompanyMyJobs({ company, onEditJob }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (company?.companyId) fetchJobs();
  }, [company]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(`/job/company/${company.companyId}`, { params: { page: 0, size: 100 } });
      setJobs(res.data.content || []);
    } catch (err) {
      console.error("Failed to fetch jobs", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (jobId) => {
    if (!confirm("Are you sure you want to delete this job listing? This action cannot be undone.")) return;
    try {
      await axiosInstance.delete(`/job/${jobId}`);
      setJobs(jobs.filter(j => j.jobId !== jobId));
      setToast({ msg: "Job listing deleted successfully", type: "success" });
      setTimeout(() => setToast(null), 3000);
    } catch (err) {
      setToast({ msg: "Failed to delete job", type: "error" });
      setTimeout(() => setToast(null), 3000);
    }
  };

  const formatDate = (d) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" });
  };

  const formatEnum = (str) => {
    if (!str) return "—";
    return str
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  return (
    <div className="company-jobs-content">
      {toast && <div className={`comp-toast ${toast.type}`}>{toast.msg}</div>}

      <header className="comp-page-header">
        <h1>My Job Listings</h1>
        <p>Manage and track your active job opportunities</p>
      </header>

      {loading ? (
        <div className="comp-empty">
          <Clock className="animate-spin" size={40} />
          <p>Loading your job listings...</p>
        </div>
      ) : jobs.length === 0 ? (
        <div className="comp-empty">
          <AlertCircle size={48} style={{ color: "#94a3b8", marginBottom: "16px" }} />
          <p style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--text-main)" }}>No jobs posted yet</p>
          <p>Start hiring by creating your first job listing today.</p>
        </div>
      ) : (
        <div className="comp-section" style={{ padding: "0 40px 40px" }}>
          <div className="comp-table-container">
            <table className="comp-table">
              <thead>
                <tr>
                  <th>Job Title</th>
                  <th>Location</th>
                  <th>Type</th>
                  <th>Salary</th>
                  <th>Deadline</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => (
                  <tr key={job.jobId}>
                    <td className="title-cell">{job.title}</td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <MapPin size={14} /> {job.location || "Remote"}
                      </div>
                    </td>
                    <td>
                      <span className="comp-badge" style={{ background: "rgba(37,99,235,0.08)", color: "var(--primary)" }}>
                        {formatEnum(job.employmentType)}
                      </span>
                    </td>
                    <td style={{ fontWeight: 700, color: "var(--text-main)" }}>{job.salaryOrStipend || "Not specified"}</td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <Calendar size={14} /> {formatDate(job.lastDate)}
                      </div>
                    </td>
                    <td>
                      <div className="comp-actions" style={{ justifyContent: "flex-end" }}>
                        <button className="comp-btn edit" onClick={() => onEditJob(job)} title="Edit Job">
                          <Edit size={16} />
                        </button>
                        <button className="comp-btn delete" onClick={() => handleDelete(job.jobId)} title="Delete Job">
                          <Trash2 size={16} />
                        </button>
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

export default CompanyMyJobs;

