import React, { useState, useEffect } from "react";
import axiosInstance from "../../api/axiosConfig";
import { 
  Briefcase, 
  MapPin, 
  Calendar, 
  Trash2, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  AlertCircle, 
  Check 
} from "lucide-react";

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
        params: { page: pageNum, size: 10 },
      });
      setJobs(res.data.content || []);
      setTotalPages(res.data.totalPages || 0);
      setTotalElements(res.data.totalElements || 0);
      setPage(res.data.number || 0);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error("Failed to fetch jobs", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!confirm("Are you sure you want to delete this job listing? This action cannot be undone.")) return;
    try {
      await axiosInstance.delete(`/job/${jobId}`);
      setJobs(jobs.filter((j) => (j.jobId || j.id) !== jobId));
      showToast("Job listing removed successfully");
    } catch (err) {
      showToast(err.response?.data || "Failed to delete job", "error");
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

  const renderPaginationButtons = () => {
    const buttons = [];
    const maxVisible = 5;
    let start = Math.max(0, page - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible);
    if (end - start < maxVisible) start = Math.max(0, end - maxVisible);

    for (let i = start; i < end; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => fetchJobs(i)}
          style={{
            width: "40px", height: "40px", borderRadius: "10px", border: "none",
            background: i === page ? "var(--primary-gradient)" : "var(--bg-accent)",
            color: i === page ? "white" : "var(--text-main)",
            fontWeight: 800, cursor: "pointer", transition: "var(--transition)"
          }}
        >
          {i + 1}
        </button>
      );
    }
    return buttons;
  };

  return (
    <div className="admin-jobs-content">
      {toast && (
        <div className={`comp-toast ${toast.type}`}>
          {toast.type === "success" ? <Check size={18} /> : <AlertCircle size={18} />}
          {toast.msg}
        </div>
      )}

      <header className="dashboard-header">
        <h1>Job Inventory</h1>
        <p>Global management of all employment opportunities on the platform</p>
      </header>

      <section className="dashboard-section" style={{ padding: "0 40px 40px" }}>
        <div className="section-title-wrapper" style={{ padding: "40px 0 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ margin: 0 }}>
            <Briefcase size={22} style={{ color: "var(--primary)", marginRight: "12px" }} />
            Active Listings ({totalElements})
          </h2>
        </div>

        {loading ? (
          <div className="comp-empty" style={{ padding: "80px" }}>
            <Clock className="animate-spin" size={40} />
            <p>Fetching platform job data...</p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="comp-empty" style={{ padding: "80px" }}>
            <AlertCircle size={48} style={{ color: "#94a3b8", marginBottom: "16px" }} />
            <p style={{ fontSize: "1.1rem", fontWeight: 700 }}>No listings found</p>
            <p>There are currently no active job postings available.</p>
          </div>
        ) : (
          <>
            <div className="data-table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Position Title</th>
                    <th>Listed By</th>
                    <th>Location</th>
                    <th>Type</th>
                    <th>Salary</th>
                    <th>Posted Date</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((job) => (
                    <tr key={job.jobId || job.id}>
                      <td className="title-cell">{job.title}</td>
                      <td>{job.companyName || "Private Firm"}</td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <MapPin size={14} /> {job.location || "Remote"}
                        </div>
                      </td>
                      <td>
                        <span className="comp-badge" style={{ background: "rgba(37,99,235,0.08)", color: "var(--primary)", fontWeight: 800, fontSize: "0.75rem" }}>
                          {formatEnum(job.employmentType)}
                        </span>
                      </td>
                      <td style={{ fontWeight: 700 }}>{job.salaryOrStipend || "TBA"}</td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <Calendar size={14} /> {formatDate(job.postedAt)}
                        </div>
                      </td>
                      <td>
                        <div className="actions-cell">
                          <button className="admin-btn danger" onClick={() => handleDeleteJob(job.jobId || job.id)} title="Delete Job">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="pagination-bar" style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "16px", marginTop: "40px" }}>
                <button
                  disabled={page === 0}
                  onClick={() => fetchJobs(page - 1)}
                  className="admin-btn edit"
                  style={{ borderRadius: "10px", padding: "10px" }}
                >
                  <ChevronLeft size={18} />
                </button>
                <div style={{ display: "flex", gap: "8px" }}>
                  {renderPaginationButtons()}
                </div>
                <button
                  disabled={page + 1 >= totalPages}
                  onClick={() => fetchJobs(page + 1)}
                  className="admin-btn edit"
                  style={{ borderRadius: "10px", padding: "10px" }}
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}

export default AdminJobs;
