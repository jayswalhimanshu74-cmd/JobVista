import React, { useState, useEffect } from "react";
import axiosInstance from "../../api/axiosConfig";

const STATUS_OPTIONS = ["APPLIED", "SHORTLISTED", "REJECTED", "HIRED"];

const STATUS_COLORS = {
  APPLIED:     { bg: "rgba(245,169,98,0.2)",  color: "#f5a962", border: "rgba(245,169,98,0.3)" },
  SHORTLISTED: { bg: "rgba(108,143,220,0.2)", color: "#6c8fdc", border: "rgba(108,143,220,0.3)" },
  HIRED:       { bg: "rgba(125,211,192,0.2)", color: "#7dd3c0", border: "rgba(125,211,192,0.3)" },
  REJECTED:    { bg: "rgba(239,68,68,0.2)",   color: "#ff6b6b", border: "rgba(239,68,68,0.3)" },
};

function AdminApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [updatingId, setUpdatingId] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchApplications = async (pageNum = 0, status = "") => {
    try {
      setLoading(true);
      const params = { page: pageNum, size: 15 };
      if (status) params.status = status;

      const res = await axiosInstance.get("/application/all", { params });
      setApplications(res.data.content || []);
      setTotalPages(res.data.totalPages || 0);
      setTotalElements(res.data.totalElements || 0);
      setPage(res.data.number || 0);
    } catch (err) {
      console.error("Failed to fetch applications", err);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications(0, statusFilter);
  }, [statusFilter]);

  const handleStatusChange = async (applicationId, newStatus) => {
    setUpdatingId(applicationId);
    try {
      await axiosInstance.put(`/application/${applicationId}/status`, null, {
        params: { status: newStatus },
      });
      setApplications((prev) =>
        prev.map((app) =>
          app.applicationId === applicationId ? { ...app, status: newStatus } : app
        )
      );
      showToast(`Status updated to ${newStatus}`);
    } catch (err) {
      console.error("Status update failed", err);
      showToast(err.response?.data?.message || "Failed to update status", "error");
    } finally {
      setUpdatingId(null);
    }
  };

  const formatDate = (d) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
    });
  };

  const statusCounts = applications.reduce((acc, app) => {
    acc[app.status] = (acc[app.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="admin-applications">
      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", bottom: 28, left: "50%", transform: "translateX(-50%)",
          padding: "12px 24px", borderRadius: 12, zIndex: 99999, fontWeight: 500,
          background: toast.type === "error" ? "rgba(220,38,38,0.95)" : "rgba(5,150,105,0.95)",
          color: "#fff", boxShadow: "0 8px 32px rgba(0,0,0,0.3)", fontFamily: "'Poppins',sans-serif",
          animation: "fadeIn 0.3s ease"
        }}>
          {toast.msg}
        </div>
      )}

      <div className="section-header">
        <div>
          <h1>Application Management</h1>
          <p style={{ color: "#94a3b8", margin: "6px 0 0", fontSize: "0.95rem" }}>
            {totalElements} total application{totalElements !== 1 ? "s" : ""} across the platform
          </p>
        </div>
        <div className="filter-actions">
          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Quick Stats */}
      <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
        {STATUS_OPTIONS.map((s) => {
          const c = STATUS_COLORS[s];
          return (
            <div key={s} onClick={() => setStatusFilter(statusFilter === s ? "" : s)} style={{
              padding: "10px 20px", borderRadius: 10, cursor: "pointer",
              background: statusFilter === s ? c.bg : "rgba(255,255,255,0.03)",
              border: `1px solid ${statusFilter === s ? c.border : "rgba(255,255,255,0.08)"}`,
              transition: "all 0.3s ease",
            }}>
              <div style={{ fontSize: "1.3rem", fontWeight: 700, color: c.color }}>
                {statusCounts[s] || 0}
              </div>
              <div style={{ fontSize: "0.8rem", color: "#94a3b8", textTransform: "capitalize" }}>
                {s.toLowerCase()}
              </div>
            </div>
          );
        })}
      </div>

      {loading ? (
        <p style={{ textAlign: "center", color: "#94a3b8", padding: 40 }}>Loading applications...</p>
      ) : applications.length === 0 ? (
        <div style={{
          textAlign: "center", padding: 60, color: "#64748b",
          background: "rgba(255,255,255,0.03)", borderRadius: 12,
          border: "1px solid rgba(255,255,255,0.08)"
        }}>
          <p style={{ fontSize: "1.2rem", marginBottom: 8 }}>No applications found</p>
          <p style={{ fontSize: "0.9rem" }}>
            {statusFilter ? `No ${statusFilter.toLowerCase()} applications. Try clearing the filter.` : "Applications will appear here when users apply for jobs."}
          </p>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Candidate</th>
                <th>Job Position</th>
                <th>Company</th>
                <th>Status</th>
                <th>Applied Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => {
                const sc = STATUS_COLORS[app.status] || STATUS_COLORS.APPLIED;
                return (
                  <tr key={app.applicationId}>
                    <td className="title-cell">{app.jobSeekerName || "—"}</td>
                    <td>{app.jobTitle || "—"}</td>
                    <td>{app.companyName || "—"}</td>
                    <td>
                      <span style={{
                        display: "inline-block", padding: "6px 14px", borderRadius: 20,
                        fontSize: "0.82rem", fontWeight: 600, textTransform: "capitalize",
                        background: sc.bg, color: sc.color, border: `1px solid ${sc.border}`,
                      }}>
                        {app.status?.toLowerCase()}
                      </span>
                    </td>
                    <td>{formatDate(app.appliedAt)}</td>
                    <td className="action-cell">
                      {app.status !== "SHORTLISTED" && app.status !== "HIRED" && (
                        <button
                          className="btn-small edit"
                          disabled={updatingId === app.applicationId}
                          onClick={() => handleStatusChange(app.applicationId, "SHORTLISTED")}
                        >
                          Shortlist
                        </button>
                      )}
                      {app.status !== "HIRED" && (
                        <button
                          className="btn-small view"
                          disabled={updatingId === app.applicationId}
                          onClick={() => handleStatusChange(app.applicationId, "HIRED")}
                        >
                          Hire
                        </button>
                      )}
                      {app.status !== "REJECTED" && app.status !== "HIRED" && (
                        <button
                          className="btn-small delete"
                          disabled={updatingId === app.applicationId}
                          onClick={() => handleStatusChange(app.applicationId, "REJECTED")}
                        >
                          Reject
                        </button>
                      )}
                      {app.status === "HIRED" && (
                        <span style={{ color: "#7dd3c0", fontWeight: 600, fontSize: "0.85rem" }}>✓ Hired</span>
                      )}
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
            onClick={() => fetchApplications(page - 1, statusFilter)}
            style={{
              padding: "8px 16px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)",
              background: "rgba(255,255,255,0.05)", color: "#cbd3de", cursor: page === 0 ? "not-allowed" : "pointer",
              opacity: page === 0 ? 0.4 : 1,
            }}
          >
            ‹ Prev
          </button>
          <span style={{ padding: "8px 16px", color: "#94a3b8" }}>
            Page {page + 1} of {totalPages}
          </span>
          <button
            disabled={page + 1 >= totalPages}
            onClick={() => fetchApplications(page + 1, statusFilter)}
            style={{
              padding: "8px 16px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)",
              background: "rgba(255,255,255,0.05)", color: "#cbd3de",
              cursor: page + 1 >= totalPages ? "not-allowed" : "pointer",
              opacity: page + 1 >= totalPages ? 0.4 : 1,
            }}
          >
            Next ›
          </button>
        </div>
      )}
    </div>
  );
}

export default AdminApplications;
