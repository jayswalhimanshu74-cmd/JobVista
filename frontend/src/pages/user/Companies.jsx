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
      <div className="toast-container">
        {toast && (
          <div className={`app-toast toast-${toast.type}`}>
            <span>{toast.msg}</span>
            <button onClick={() => setToast(null)} className="toast-close">✕</button>
          </div>
        )}
      </div>

      <div className="companies-header">
        <h1>Explore Top Companies</h1>
        <p>Discover amazing companies and apply to their open positions</p>
      </div>

      {loading && <p className="loading-text">Loading companies...</p>}
      {error && <p className="error-text">{error}</p>}

      <div className="companies-grid">
        {companies.map((company) => (
          <div key={company.id || company.companyId} className="company-card">
            <div className="company-header-row">
              {company.logoUrl ? (
                <div className="company-logo-container small">
                  <img 
                    src={company.logoUrl} 
                    alt={company.companyName} 
                    className="company-logo-img"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.parentElement.innerHTML = `<span class="company-letter-logo small">${(company.companyName || "?")[0].toUpperCase()}</span>`;
                    }}
                  />
                </div>
              ) : (
                <span className="company-letter-logo small">
                  {(company.companyName || "?")[0].toUpperCase()}
                </span>
              )}
              <h3>{company.companyName}</h3>
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
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={handleCloseModal}>✕</button>

            <div className="modal-header">
              <div className="modal-logo-section">
                {selectedCompany.logoUrl ? (
                  <img src={selectedCompany.logoUrl} alt="" className="modal-company-logo" 
                       onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}/>
                ) : null}
                <span className="modal-letter-avatar" style={{display: selectedCompany.logoUrl ? 'none' : 'flex'}}>
                  {(selectedCompany.companyName || "C")[0]}
                </span>
              </div>
              <div>
                <h2 className="modal-company-title">{selectedCompany.companyName}</h2>
                {selectedCompany.location && <p className="modal-company-name">📍 {selectedCompany.location}</p>}
              </div>
            </div>

            <div className="modal-body">
              {selectedCompany.description && (
                <div className="detail-section">
                  <h3>About Company</h3>
                  <p>{selectedCompany.description}</p>
                </div>
              )}

              <div className="detail-grid">
                {selectedCompany.companyEmail && (
                  <div className="detail-item">
                    <span className="label">Contact Email</span>
                    <span className="value">{selectedCompany.companyEmail}</span>
                  </div>
                )}
                {selectedCompany.companyWebsite && (
                  <div className="detail-item">
                    <span className="label">Official Website</span>
                    <span className="value">
                      <a href={selectedCompany.companyWebsite.startsWith("http") ? selectedCompany.companyWebsite : `https://${selectedCompany.companyWebsite}`}
                        target="_blank" rel="noopener noreferrer" style={{ color: "var(--primary)", textDecoration: "none" }}>
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
                  <p style={{ color: "var(--text-light)", textAlign: "center", padding: 30 }}>Loading positions...</p>
                ) : selectedCompany.jobs?.length > 0 ? (
                  <div className="jobs-list">
                    {selectedCompany.jobs.map((job) => {
                      const jobId = job.jobId;
                      const isApplied = appliedJobs.has(jobId);
                      const isApplying = applyingId === jobId;

                      return (
                        <div key={jobId} className="job-item-card">
                          <div className="job-item-info">
                            <h4>{job.title}</h4>
                            <div className="job-item-meta">
                              {job.location && <span>📍 {job.location}</span>}
                              {job.employmentType && (
                                <span style={{ color: "var(--primary)", fontWeight: 600 }}>
                                  💼 {job.employmentType.replace(/_/g, " ")}
                                </span>
                              )}
                              {job.salaryOrStipend && <span>💰 {job.salaryOrStipend}</span>}
                            </div>
                          </div>

                          <button
                            disabled={isApplied || isApplying}
                            onClick={() => handleApply(jobId)}
                            className={`job-apply-btn ${isApplied ? "applied" : "primary"}`}
                          >
                            {isApplying ? "Applying..." : isApplied ? "✓ Applied" : "Apply Now"}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p style={{ color: "var(--text-light)", textAlign: "center", padding: 30 }}>
                    No open positions currently available at this company.
                  </p>
                )}
              </div>
            </div>

            <div className="modal-footer">
              <button className="modal-action-btn" onClick={handleCloseModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Companies;