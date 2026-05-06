import React, { useState, useEffect } from "react";
import axiosInstance from "../../api/axiosConfig";
import { 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  Filter, 
  ClipboardList, 
  UserCheck, 
  UserX, 
  Star, 
  Check, 
  X,
  AlertCircle,
  Clock
} from "lucide-react";

const STATUS_OPTIONS = ["APPLIED", "SHORTLISTED", "REJECTED", "HIRED"];

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
      const params = { page: pageNum, size: 10 };
      if (status) params.status = status;

      const res = await axiosInstance.get("/application/all", { params });
      setApplications(res.data.content || []);
      setTotalPages(res.data.totalPages || 0);
      setTotalElements(res.data.totalElements || 0);
      setPage(res.data.number || 0);
      window.scrollTo({ top: 0, behavior: "smooth" });
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

  const renderPaginationButtons = () => {
    const buttons = [];
    const maxVisible = 5;
    let start = Math.max(0, page - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible);

    if (end - start < maxVisible) {
      start = Math.max(0, end - maxVisible);
    }

    for (let i = start; i < end; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => fetchApplications(i, statusFilter)}
          style={{
            width: "42px", height: "42px", borderRadius: "12px", border: "none",
            background: i === page ? "var(--primary-gradient)" : "var(--bg-accent)",
            color: i === page ? "white" : "var(--text-main)",
            fontWeight: 800, cursor: "pointer", transition: "var(--transition)",
            boxShadow: i === page ? "0 8px 16px rgba(37,99,235,0.2)" : "none"
          }}
        >
          {i + 1}
        </button>
      );
    }
    return buttons;
  };

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
      showToast(`Candidate status updated to ${newStatus}`);
    } catch (err) {
      showToast(err.response?.data?.message || "Status update failed", "error");
    } finally {
      setUpdatingId(null);
    }
  };

  const formatDate = (d) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-US", {
      day: "2-digit", month: "short", year: "numeric",
    });
  };

  const formatEnum = (str) => {
    if (!str) return "—";
    return str
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  return (
    <div className="admin-applications-content">
      {toast && (
        <div className={`comp-toast ${toast.type}`}>
          {toast.type === "success" ? <Check size={18} /> : <AlertCircle size={18} />}
          {toast.msg}
        </div>
      )}

      <header className="dashboard-header">
        <h1>Master Application Log</h1>
        <p>Global oversight of all recruitment activity across the platform</p>
      </header>

      {/* Filter Stats */}
      <div className="stats-grid" style={{ gridTemplateColumns: "repeat(5, 1fr)", marginBottom: "32px" }}>
        <div 
          className={`stat-card ${statusFilter === "" ? "active" : ""}`} 
          onClick={() => setStatusFilter("")}
          style={{ cursor: "pointer", border: statusFilter === "" ? "2px solid var(--primary)" : "" }}
        >
          <div className="stat-content">
            <h3>Total Logs</h3>
            <p className="stat-value" style={{ fontSize: "1.5rem" }}>{totalElements}</p>
          </div>
        </div>
        {STATUS_OPTIONS.map((s) => (
          <div 
            key={s} 
            className={`stat-card ${statusFilter === s ? "active" : ""}`} 
            onClick={() => setStatusFilter(s)}
            style={{ cursor: "pointer", border: statusFilter === s ? "2px solid var(--primary)" : "" }}
          >
            <div className="stat-content">
              <h3>{formatEnum(s)}</h3>
              <p className="stat-value" style={{ fontSize: "1.5rem" }}>—</p>
            </div>
          </div>
        ))}
      </div>

      <section className="dashboard-section" style={{ padding: "0 40px 40px" }}>
        <div className="section-title-wrapper" style={{ padding: "40px 0 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ margin: 0 }}>
            <ClipboardList size={22} style={{ color: "var(--primary)", marginRight: "12px" }} />
            Application Records
          </h2>
          <div style={{ display: "flex", gap: "12px" }}>
             <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ padding: "8px 16px", borderRadius: "10px", border: "1.5px solid var(--border-color)", fontWeight: 700 }}
            >
              <option value="">All Statuses</option>
              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{formatEnum(s)}</option>)}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="comp-empty" style={{ padding: "60px" }}>
            <Clock className="animate-spin" size={40} />
            <p>Synchronizing log records...</p>
          </div>
        ) : applications.length === 0 ? (
          <div className="comp-empty" style={{ padding: "60px" }}>
            <AlertCircle size={48} style={{ color: "#94a3b8", marginBottom: "16px" }} />
            <p style={{ fontSize: "1.1rem", fontWeight: 700 }}>No records found</p>
            <p>No applications match your current filter criteria.</p>
          </div>
        ) : (
          <>
            <div className="data-table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Candidate</th>
                    <th>Position</th>
                    <th>Company</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((app) => (
                    <tr key={app.applicationId}>
                      <td className="title-cell">
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <div className="home-letter-avatar" style={{ width: "32px", height: "32px", fontSize: "0.85rem" }}>
                            {app.jobSeekerName?.charAt(0) || "A"}
                          </div>
                          {app.jobSeekerName}
                        </div>
                      </td>
                      <td style={{ fontWeight: 700 }}>{app.jobTitle}</td>
                      <td>{app.companyName}</td>
                      <td>
                        <span className={`comp-badge ${app.status?.toLowerCase()}`} style={{
                          background: app.status === "HIRED" ? "rgba(16,185,129,0.1)" : app.status === "REJECTED" ? "rgba(239,68,68,0.1)" : "rgba(37,99,235,0.1)",
                          color: app.status === "HIRED" ? "#10b981" : app.status === "REJECTED" ? "#ef4444" : "#2563eb",
                          padding: "6px 12px", borderRadius: "999px", fontSize: "0.75rem", fontWeight: 800
                        }}>
                          {formatEnum(app.status)}
                        </span>
                      </td>
                      <td>{formatDate(app.appliedAt)}</td>
                      <td>
                        <div className="actions-cell">
                          {app.status === "APPLIED" && (
                            <button className="admin-btn primary" onClick={() => handleStatusChange(app.applicationId, "SHORTLISTED")} title="Shortlist">
                              <Star size={14} />
                            </button>
                          )}
                          {app.status === "SHORTLISTED" && (
                            <button className="admin-btn primary" style={{ background: "#10b981" }} onClick={() => handleStatusChange(app.applicationId, "HIRED")} title="Hire">
                              <UserCheck size={14} />
                            </button>
                          )}
                          {(app.status === "APPLIED" || app.status === "SHORTLISTED") && (
                            <button className="admin-btn danger" onClick={() => handleStatusChange(app.applicationId, "REJECTED")} title="Reject">
                              <UserX size={14} />
                            </button>
                          )}
                          {app.status === "HIRED" && <Check size={18} style={{ color: "#10b981" }} />}
                          {app.status === "REJECTED" && <X size={18} style={{ color: "#ef4444" }} />}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Premium Pagination */}
            {totalPages > 1 && (
              <div className="pagination-bar" style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "16px", marginTop: "40px" }}>
                <button
                  disabled={page === 0}
                  onClick={() => fetchApplications(page - 1, statusFilter)}
                  className="admin-btn edit"
                  style={{ borderRadius: "12px", padding: "12px" }}
                >
                  <ChevronLeft size={20} />
                </button>
                
                <div style={{ display: "flex", gap: "8px" }}>
                  {renderPaginationButtons()}
                </div>

                <button
                  disabled={page + 1 >= totalPages}
                  onClick={() => fetchApplications(page + 1, statusFilter)}
                  className="admin-btn edit"
                  style={{ borderRadius: "12px", padding: "12px" }}
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}

export default AdminApplications;


