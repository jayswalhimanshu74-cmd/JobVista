import React, { useState, useEffect } from "react";
import "../../styles/companies.css";
import companyService from "../../api/companyService";
import jobService from "../../api/jobService";
import { isAuthenticated } from "../../utills/auth";
import { useNavigate } from "react-router-dom";

const Companies = () => {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [page, setPage] = useState(0);
  const [size] = useState(6);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [appliedJobs, setAppliedJobs] = useState(new Set());
  const [applyingId, setApplyingId] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchCompanies();
    fetchAppliedJobs();
  }, [page]);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await companyService.getAllCompanies(page, size);
      setCompanies(data.content);
      setTotalPages(data.totalPages);
    } catch (err) {
      setError("Failed to load companies");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAppliedJobs = async () => {
    if (!isAuthenticated()) return;
    try {
      const data = await jobService.getAppliedJobs({ page: 0, size: 200 });
      const ids = new Set((data.content || []).map((a) => a.jobId));
      setAppliedJobs(ids);
    } catch (e) { /* not logged in */ }
  };

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleViewJobs = async (company) => {
    setSelectedCompany({ ...company, loadingJobs: true, jobs: [] });
    try {
      const data = await companyService.getCompanyJobs(company.companyId || company.id, 0, 50);
      setSelectedCompany((prev) => ({ ...prev, jobs: data.content || [], loadingJobs: false }));
    } catch (err) {
      console.error(err);
      setSelectedCompany((prev) => ({ ...prev, jobs: [], loadingJobs: false }));
    }
  };

  const handleApply = async (jobId) => {
    if (!isAuthenticated()) {
      navigate("/login");
      return;
    }
    setApplyingId(jobId);
    try {
      await jobService.applyJob(jobId);
      setAppliedJobs((prev) => new Set([...prev, jobId]));
      showToast("✅ Applied successfully!");
    } catch (err) {
      const status = err.response?.status;
      if (status === 409) {
        setAppliedJobs((prev) => new Set([...prev, jobId]));
        showToast("Already applied", "info");
      } else {
        showToast(err.response?.data?.message || "Apply failed", "error");
      }
    } finally {
      setApplyingId(null);
    }
  };

  const handleCloseModal = () => {
    setSelectedCompany(null);
  };

  const formatDate = (d) => {
    if (!d) return "";
    return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  };

  return (
    <div className="companies-container">
      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", bottom: 28, left: "50%", transform: "translateX(-50%)",
          padding: "12px 24px", borderRadius: 12, zIndex: 99999, fontWeight: 500,
          background: toast.type === "error" ? "rgba(220,38,38,0.95)" : toast.type === "info" ? "rgba(15,23,42,0.95)" : "rgba(5,150,105,0.95)",
          color: "#fff", boxShadow: "0 8px 32px rgba(0,0,0,0.3)", fontFamily: "'Poppins',sans-serif",
          animation: "fadeIn 0.3s ease",
        }}>
          {toast.msg}
        </div>
      )}

      <div className="companies-header">
        <h1>Explore Top Companies</h1>
        <p>Discover amazing companies and apply to their open positions</p>
      </div>

      {loading && <p className="loading-text">Loading companies...</p>}
      {error && <p className="error-text">{error}</p>}

      <div className="companies-grid">
        {companies.map((company) => (
          <div key={company.id || company.companyId} className="company-card">
            <div className="company-header">
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {company.logoUrl ? (
                  <img src={company.logoUrl} alt="" style={{ width: 36, height: 36, borderRadius: 8, objectFit: "cover" }}
                    onError={(e) => { e.target.style.display = "none"; }} />
                ) : (
                  <span style={{
                    width: 36, height: 36, borderRadius: 8, display: "inline-flex",
                    alignItems: "center", justifyContent: "center",
                    background: "rgba(108,143,220,0.2)", color: "#6c8fdc",
                    fontSize: "1rem", fontWeight: 700, flexShrink: 0,
                  }}>
                    {(company.companyName || "?")[0].toUpperCase()}
                  </span>
                )}
                <h3>{company.companyName}</h3>
              </div>
            </div>

            {company.location && (
              <div className="company-industry">📍 {company.location}</div>
            )}

            {company.companyWebsite && (
              <div className="company-founded" style={{ fontSize: "0.85rem" }}>
                🌐 <a href={company.companyWebsite.startsWith("http") ? company.companyWebsite : `https://${company.companyWebsite}`}
                  target="_blank" rel="noopener noreferrer" style={{ color: "#6c8fdc", textDecoration: "none" }}>
                  {company.companyWebsite}
                </a>
              </div>
            )}

            {company.description && (
              <p className="company-description">
                {company.description.length > 100 ? company.description.slice(0, 100) + "..." : company.description}
              </p>
            )}

            <button className="view-jobs-btn" onClick={() => handleViewJobs(company)}>
              View Open Jobs →
            </button>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="pagination-container">
        <button className="page-btn" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>‹</button>
        {[...Array(totalPages)].map((_, i) => (
          <button key={i} className={`page-number ${page === i ? "active" : ""}`} onClick={() => setPage(i)}>{i + 1}</button>
        ))}
        <button className="page-btn" disabled={page + 1 >= totalPages} onClick={() => setPage((p) => p + 1)}>›</button>
      </div>

      {/* Company Jobs Modal */}
      {selectedCompany && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 700 }}>
            <button className="modal-close" onClick={handleCloseModal}>✕</button>

            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
              {selectedCompany.logoUrl ? (
                <img src={selectedCompany.logoUrl} alt="" style={{ width: 44, height: 44, borderRadius: 10, objectFit: "cover" }}
                  onError={(e) => { e.target.style.display = "none"; }} />
              ) : (
                <span style={{
                  width: 44, height: 44, borderRadius: 10, display: "inline-flex",
                  alignItems: "center", justifyContent: "center",
                  background: "rgba(108,143,220,0.2)", color: "#6c8fdc",
                  fontSize: "1.2rem", fontWeight: 700,
                }}>
                  {(selectedCompany.companyName || "?")[0].toUpperCase()}
                </span>
              )}
              <div>
                <h2 style={{ margin: 0 }}>{selectedCompany.companyName}</h2>
                {selectedCompany.location && <p className="modal-subtitle" style={{ margin: 0 }}>📍 {selectedCompany.location}</p>}
              </div>
            </div>

            {selectedCompany.description && (
              <div className="detail-section">
                <h3>About</h3>
                <p>{selectedCompany.description}</p>
              </div>
            )}

            <div className="detail-grid">
              {selectedCompany.companyEmail && (
                <div className="detail-item">
                  <span className="label">Email</span>
                  <span className="value">{selectedCompany.companyEmail}</span>
                </div>
              )}
              {selectedCompany.companyWebsite && (
                <div className="detail-item">
                  <span className="label">Website</span>
                  <span className="value">
                    <a href={selectedCompany.companyWebsite.startsWith("http") ? selectedCompany.companyWebsite : `https://${selectedCompany.companyWebsite}`}
                      target="_blank" rel="noopener noreferrer" style={{ color: "#6c8fdc", textDecoration: "none" }}>
                      {selectedCompany.companyWebsite}
                    </a>
                  </span>
                </div>
              )}
            </div>

            {/* Jobs List */}
            <div className="detail-section">
              <h3>Open Positions ({selectedCompany.jobs?.length || 0})</h3>

              {selectedCompany.loadingJobs ? (
                <p style={{ color: "#94a3b8", textAlign: "center", padding: 20 }}>Loading jobs...</p>
              ) : selectedCompany.jobs?.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {selectedCompany.jobs.map((job) => {
                    const jobId = job.jobId;
                    const isApplied = appliedJobs.has(jobId);
                    const isApplying = applyingId === jobId;

                    return (
                      <div key={jobId} style={{
                        background: "rgba(255,255,255,0.04)", borderRadius: 12,
                        padding: "14px 18px", border: "1px solid rgba(255,255,255,0.08)",
                        display: "flex", justifyContent: "space-between", alignItems: "center",
                        gap: 12, flexWrap: "wrap",
                      }}>
                        <div style={{ flex: 1, minWidth: 200 }}>
                          <p style={{ margin: "0 0 4px", fontWeight: 600, color: "#f5f5fc", fontSize: "0.95rem" }}>
                            💼 {job.title}
                          </p>
                          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", fontSize: "0.82rem", color: "#94a3b8" }}>
                            {job.location && <span>📍 {job.location}</span>}
                            {job.employmentType && (
                              <span style={{
                                padding: "2px 8px", borderRadius: 10,
                                background: "rgba(108,143,220,0.15)", color: "#6c8fdc", fontSize: "0.78rem",
                              }}>
                                {job.employmentType.replace(/_/g, " ")}
                              </span>
                            )}
                            {job.salaryOrStipend && <span>💰 {job.salaryOrStipend}</span>}
                            {job.postedAt && <span>📅 {formatDate(job.postedAt)}</span>}
                          </div>
                        </div>

                        <button
                          disabled={isApplied || isApplying}
                          onClick={() => handleApply(jobId)}
                          style={{
                            padding: "8px 20px", borderRadius: 8, border: "none",
                            fontWeight: 600, fontSize: "0.85rem", cursor: isApplied ? "default" : "pointer",
                            fontFamily: "'Poppins',sans-serif",
                            background: isApplied
                              ? "rgba(125,211,192,0.2)"
                              : "linear-gradient(135deg, #145046, #7dd3c0)",
                            color: isApplied ? "#7dd3c0" : "#fff",
                            transition: "all 0.3s ease",
                            minWidth: 100,
                          }}
                        >
                          {isApplying ? "..." : isApplied ? "✓ Applied" : "Apply"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p style={{ color: "#64748b", textAlign: "center", padding: 20 }}>No open positions available.</p>
              )}
            </div>

            <button className="modal-action-btn" onClick={handleCloseModal}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Companies;