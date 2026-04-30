import React, { useState, useEffect } from "react";
import axiosInstance from "../../api/axiosConfig";

function AdminJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    fetchJobs(0);
  }, []);

  const fetchJobs = async (pageNum = 0) => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/job/all", {
        params: { page: pageNum, size: 15 },
      });
      setJobs(res.data.content || []);
      setTotalPages(res.data.totalPages || 0);
      setTotalElements(res.data.totalElements || 0);
      setPage(res.data.number || 0);
    } catch (err) {
      console.error("Failed to fetch jobs", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!confirm("Are you sure you want to delete this job?")) return;
    try {
      await axiosInstance.delete(`/job/${jobId}`);
      setJobs(jobs.filter((j) => j.jobId !== jobId));
      showToast("Job deleted successfully");
    } catch (err) {
      console.error("Delete failed", err);
      showToast(err.response?.data || "Failed to delete job", "error");
    }
  };

  const formatDate = (d) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
    });
  };

  const TYPE_COLORS = {
    FULL_TIME: { bg: "rgba(125,211,192,0.2)", color: "#7dd3c0" },
    PART_TIME: { bg: "rgba(108,143,220,0.2)", color: "#6c8fdc" },
    INTERNSHIP: { bg: "rgba(245,169,98,0.2)", color: "#f5a962" },
    CONTRACT: { bg: "rgba(168,85,247,0.2)", color: "#a855f7" },
    FREELANCE: { bg: "rgba(239,68,68,0.2)", color: "#ff6b6b" },
  };

  return (
    <div className="admin-jobs">
      {toast && (
        <div style={{
          position: "fixed", bottom: 28, left: "50%", transform: "translateX(-50%)",
          padding: "12px 24px", borderRadius: 12, zIndex: 99999, fontWeight: 500,
          background: toast.type === "error" ? "rgba(220,38,38,0.95)" : "rgba(5,150,105,0.95)",
          color: "#fff", boxShadow: "0 8px 32px rgba(0,0,0,0.3)", animation: "fadeIn 0.3s ease"
        }}>
          {toast.msg}
        </div>
      )}

      <div className="section-header">
        <div>
          <h1>Job Management</h1>
          <p style={{ color: "#94a3b8", margin: "6px 0 0", fontSize: "0.95rem" }}>
            {totalElements} job{totalElements !== 1 ? "s" : ""} on the platform
          </p>
        </div>
      </div>

      {loading ? (
        <p style={{ textAlign: "center", color: "#94a3b8", padding: 40 }}>Loading jobs...</p>
      ) : jobs.length === 0 ? (
        <div style={{ textAlign: "center", padding: 60, color: "#64748b", background: "rgba(255,255,255,0.03)", borderRadius: 12, border: "1px solid rgba(255,255,255,0.08)" }}>
          <p style={{ fontSize: "1.2rem" }}>No jobs found</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Job Title</th>
                <th>Company</th>
                <th>Location</th>
                <th>Type</th>
                <th>Salary</th>
                <th>Posted</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => {
                const empType = job.employmentType || "";
                const tc = TYPE_COLORS[empType] || { bg: "rgba(255,255,255,0.08)", color: "#94a3b8" };
                return (
                  <tr key={job.jobId || job.id}>
                    <td className="title-cell">{job.title || "—"}</td>
                    <td>{job.companyName || "—"}</td>
                    <td>{job.location || "—"}</td>
                    <td>
                      <span style={{
                        display: "inline-block", padding: "4px 10px", borderRadius: 14,
                        fontSize: "0.78rem", fontWeight: 600,
                        background: tc.bg, color: tc.color,
                        border: `1px solid ${tc.color}33`,
                      }}>
                        {empType ? empType.replace(/_/g, " ") : "—"}
                      </span>
                    </td>
                    <td style={{ whiteSpace: "nowrap" }}>{job.salaryOrStipend || "—"}</td>
                    <td style={{ whiteSpace: "nowrap" }}>{formatDate(job.postedAt)}</td>
                    <td className="action-cell">
                      <button
                        className="btn-small delete"
                        onClick={() => handleDeleteJob(job.jobId)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 24 }}>
          <button
            disabled={page === 0}
            onClick={() => fetchJobs(page - 1)}
            style={{
              padding: "8px 16px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)",
              background: "rgba(255,255,255,0.05)", color: "#cbd3de",
              cursor: page === 0 ? "not-allowed" : "pointer", opacity: page === 0 ? 0.4 : 1,
            }}
          >‹ Prev</button>
          <span style={{ padding: "8px 16px", color: "#94a3b8" }}>
            Page {page + 1} of {totalPages}
          </span>
          <button
            disabled={page + 1 >= totalPages}
            onClick={() => fetchJobs(page + 1)}
            style={{
              padding: "8px 16px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)",
              background: "rgba(255,255,255,0.05)", color: "#cbd3de",
              cursor: page + 1 >= totalPages ? "not-allowed" : "pointer",
              opacity: page + 1 >= totalPages ? 0.4 : 1,
            }}
          >Next ›</button>
        </div>
      )}
    </div>
  );
}

export default AdminJobs;
