import React, { useState, useEffect, useContext } from "react";
import "../../styles/jobs.css";
import jobService from "../../api/jobService";
import { isAuthenticated } from "../../utills/auth";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import webSocketService from "../../api/webSocketService";

const Jobs = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [viewingJob, setViewingJob] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [applyingJobId, setApplyingJobId] = useState(null);
  const [savingJobId, setSavingJobId] = useState(null);
  const [appliedJobIds, setAppliedJobIds] = useState(new Set());
  const [withdrawingJobId, setWithdrawingJobId] = useState(null);

  // Toast state
  const [toast, setToast] = useState(null);
  const showToast = (message, type = "info") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    // Pre-fetch applied jobs so we can show "Applied" state
    if (isAuthenticated()) {
      fetchAppliedJobIds();
    }
  }, []);

  const fetchAppliedJobIds = async () => {
    try {
      const res = await jobService.getAppliedJobs({ page: 0, size: 200 });
      if (res?.content) {
        const ids = new Set(res.content.map(app => app.jobId));
        setAppliedJobIds(ids);
      }
    } catch (err) {
      // Silently ignore - user may not have a profile yet
    }
  };

  const fetchJobs = async (pageNumber = 0, keyword = "") => {
    try {
      setLoading(true);
      let response;

      if (keyword && keyword.trim() !== "") {
        response = await jobService.searchJobs({ keyword: keyword.trim(), page: pageNumber, size: 10 });
      } else {
        response = await jobService.getAllJobs({ page: pageNumber, size: 10 });
      }

      if (response?.content && Array.isArray(response.content)) {
        setJobs(response.content);
        setTotalPages(response.totalPages);
        setPage(response.number);
      } else {
        setJobs([]);
      }
    } catch (error) {
      console.error("Error fetching jobs", error);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  // Real-time search with debounce — also handles initial page load
  useEffect(() => {
    const delay = setTimeout(() => {
      fetchJobs(0, searchKeyword);
    }, searchKeyword ? 400 : 0); // Instant on first load, debounced on search
    return () => clearTimeout(delay);
  }, [searchKeyword]);

  // 🔥 Real-time job updates
  useEffect(() => {
    webSocketService.connect(() => {
      webSocketService.subscribe("/topic/jobs", (newJob) => {
        // Only update if we are on the first page and not currently searching
        if (page === 0 && !searchKeyword) {
          setJobs(prevJobs => {
            if (prevJobs.find(j => j.id === newJob.id)) return prevJobs;
            return [newJob, ...prevJobs].slice(0, 10);
          });
        }
      });
    });

    return () => {
      webSocketService.unsubscribe("/topic/jobs");
    };
  }, [page, searchKeyword]);

  const handleApplyClick = async (job) => {
    if (!isAuthenticated()) {
      showToast("Please login to apply for jobs", "warning");
      setTimeout(() => navigate("/login"), 1500);
      return;
    }

    if (!user || (user.role !== "USER" && user.role !== "ROLE_USER")) {
      showToast(`Only job seekers can apply. Your role: ${user?.role || "unknown"}`, "error");
      return;
    }

    // Guard against multiple actions
    if (appliedJobIds.has(job.jobId) || applyingJobId === job.jobId || withdrawingJobId === job.jobId) return;

    try {
      setApplyingJobId(job.jobId);
      await jobService.applyJob(job.jobId);
      
      // Mark as applied locally
      setAppliedJobIds(prev => new Set([...prev, job.jobId]));
      showToast(`🎉 Successfully applied to "${job.title}"!`, "success");
      
      // Close modal if open
      if (viewingJob?.jobId === job.jobId) {
        setViewingJob(null);
      }
    } catch (error) {
      console.error("Apply error:", error);
      const status = error.response?.status;

      if (status === 409) {
        setAppliedJobIds(prev => new Set([...prev, job.jobId]));
        showToast("You've already applied for this job!", "info");
      } else if (status >= 500) {
        showToast("Server error. Please try again in a moment.", "error");
      } else if (status === 401) {
        showToast("Session expired. Please log in again.", "error");
        localStorage.removeItem("accessToken");
        setTimeout(() => navigate("/login"), 1500);
      } else if (status === 403) {
        showToast("Permission denied. Only job seekers can apply.", "error");
      } else if (status === 404) {
        showToast("Job not found. It may have been removed.", "error");
      } else if (!error.response) {
        showToast("Network error: Could not reach the server.", "error");
      } else {
        const serverMsg = error.response.data?.message || error.response.data?.error || "";
        showToast(serverMsg || `Unexpected error (${status}). Please try again.`, "error");
      }
    } finally {
      setApplyingJobId(null);
    }
  };

  const handleWithdrawClick = async (job) => {
    if (withdrawingJobId === job.jobId || applyingJobId === job.jobId) return;

    if (!window.confirm(`Are you sure you want to withdraw your application for "${job.title}"?`)) {
      return;
    }

    try {
      setWithdrawingJobId(job.jobId);
      await jobService.withdrawJob(job.jobId);
      
      // Remove from applied locally
      setAppliedJobIds(prev => {
        const next = new Set(prev);
        next.delete(job.jobId);
        return next;
      });
      showToast("Application withdrawn successfully", "info");
      
      if (viewingJob?.jobId === job.jobId) {
        setViewingJob(null);
      }
    } catch (error) {
      console.error("Withdraw error:", error);
      const msg = error.response?.data?.message || "Failed to withdraw application.";
      showToast(msg, "error");
    } finally {
      setWithdrawingJobId(null);
    }
  };

  const handleSaveClick = async (job) => {
    if (!isAuthenticated()) {
      showToast("Please login to save jobs", "warning");
      setTimeout(() => navigate("/login"), 1500);
      return;
    }

    if (savingJobId === job.jobId) return;

    try {
      setSavingJobId(job.jobId);
      await jobService.toggleSaveJob(job.jobId);
      const wasSaved = job.isSaved || job.saved;
      setJobs(jobs.map(j =>
        j.jobId === job.jobId
          ? { ...j, isSaved: !wasSaved, saved: !wasSaved }
          : j
      ));
      showToast(wasSaved ? "Job removed from saved" : "Job saved! ♥", wasSaved ? "info" : "success");
    } catch (error) {
      console.error("Save error:", error);
      showToast("Failed to save job. Try again.", "error");
    } finally {
      setSavingJobId(null);
    }
  };

  const getApplyButtonState = (job) => {
    if (withdrawingJobId === job.jobId) {
      return { text: "Revoking...", disabled: true, className: "apply-btn withdrawing" };
    }
    if (appliedJobIds.has(job.jobId)) {
      return { 
        text: "Withdraw", 
        disabled: false, 
        className: "apply-btn applied withdraw-mode",
        onClick: (e) => {
          e.stopPropagation();
          handleWithdrawClick(job);
        }
      };
    }
    if (applyingJobId === job.jobId) {
      return { text: "Applying...", disabled: true, className: "apply-btn applying" };
    }
    return { 
      text: "Apply Now", 
      disabled: false, 
      className: "apply-btn",
      onClick: (e) => {
        e.stopPropagation();
        handleApplyClick(job);
      }
    };
  };

  const getPaginationNumbers = () => {
    const totalNumbersToShow = 5;
    const pages = [];
    if (totalPages <= totalNumbersToShow) {
      for (let i = 0; i < totalPages; i++) pages.push(i);
    } else {
      const start = Math.max(0, page - 2);
      const end = Math.min(totalPages - 1, page + 2);
      if (start > 0) { pages.push(0); if (start > 1) pages.push("..."); }
      for (let i = start; i <= end; i++) pages.push(i);
      if (end < totalPages - 1) { if (end < totalPages - 2) pages.push("..."); pages.push(totalPages - 1); }
    }
    return pages;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  };

  // Time ago helper — "2 hours ago", "3 days ago", etc.
  const timeAgo = (dateStr) => {
    if (!dateStr) return "";
    const now = new Date();
    const then = new Date(dateStr);
    const diffMs = now - then;
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return "Just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    const diffDay = Math.floor(diffHr / 24);
    if (diffDay < 7) return `${diffDay}d ago`;
    if (diffDay < 30) return `${Math.floor(diffDay / 7)}w ago`;
    return formatDate(dateStr);
  };

  return (
    <div className="jobs-container">
      {/* TOAST */}
      <div className="toast-container">
        {toast && (
          <div className={`app-toast toast-${toast.type}`}>
            <span>{toast.message}</span>
            <button onClick={() => setToast(null)} className="toast-close">✕</button>
          </div>
        )}
      </div>

      <div className="jobs-header">
        <h1>Find Your Dream Job</h1>
        <p>Explore thousands of job listings from top companies</p>
      </div>

      {/* ─── Enhanced Search Bar ─── */}
      <div className="job-search-wrapper">
        <div className="job-search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search jobs by title, company, location or keyword..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className="job-search-input"
          />
          {searchKeyword && (
            <button
              className="search-clear-btn"
              onClick={() => setSearchKeyword("")}
              title="Clear search"
            >
              ✕
            </button>
          )}
        </div>
        {searchKeyword && (
          <p className="search-results-info">
            {loading
              ? "Searching..."
              : `Showing results for "${searchKeyword}" — ${jobs.length} job${jobs.length !== 1 ? "s" : ""} found`}
          </p>
        )}
      </div>

      {loading && <p style={{ textAlign: "center", color: "#94a3b8", padding: 30 }}>Loading jobs...</p>}

      {!loading && jobs.length === 0 && (
        <div className="jobs-empty-state">
          <div className="empty-icon">💼</div>
          <p className="empty-title">No jobs found</p>
          <p className="empty-subtitle">
            {searchKeyword
              ? `No results for "${searchKeyword}". Try a different keyword.`
              : "Check back later for new opportunities!"}
          </p>
        </div>
      )}

      <div className="jobs-grid">
        {jobs.map((job, index) => {
          const applyState = getApplyButtonState(job);
          return (
            <div key={job.id || index} className="job-card">
              {/* Card Header */}
              <div className="job-card-header">
                <div className="company-info-row">
                  {job.companyLogo || job.logoUrl ? (
                    <div className="company-logo-container mini">
                      <img 
                        src={job.companyLogo || job.logoUrl} 
                        alt={job.companyName} 
                        className="company-logo-img"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.parentElement.innerHTML = `<span class="company-letter-logo mini">${(job.companyName || "?")[0].toUpperCase()}</span>`;
                        }}
                      />
                    </div>
                  ) : (
                    <span className="company-letter-logo mini">
                      {(job.companyName || "?")[0].toUpperCase()}
                    </span>
                  )}
                  <span className="job-company-name">{job.companyName}</span>
                </div>
                <div className="job-card-title-row">
                  <h3 className="job-title">{job.title}</h3>
                  <span className="job-type-badge">
                    {(job.employmentType || "").replace(/_/g, " ")}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="job-card-body">
                <div className="job-meta-row">
                  <span className="job-meta-item">📍 {job.location || "Remote"}</span>
                  <span className="job-meta-item salary">
                    💰 {job.salaryOrStipend || job.salary || "Not disclosed"}
                  </span> 
                </div>

                {job.requiredSkills && (
                  <div className="job-skills-preview">
                    {job.requiredSkills.split(",").slice(0, 3).map((skill, i) => (
                      <span key={i} className="skill-chip">{skill.trim()}</span>
                    ))}
                    {job.requiredSkills.split(",").length > 3 && (
                      <span className="skill-chip more">+{job.requiredSkills.split(",").length - 3}</span>
                    )}
                  </div>
                )}

                {/* Posted Time */}
                {job.postedAt && (
                  <div className="job-posted-time">
                    🕒 <span className="time-ago">{timeAgo(job.postedAt)}</span>
                    <span className="time-full">{formatDate(job.postedAt)}</span>
                  </div>
                )}
              </div>

              {/* Card Actions */}
              <div className="job-card-actions">
                <button
                  className={`save-btn ${job.isSaved || job.saved ? "saved" : ""}`}
                  onClick={() => handleSaveClick(job)}
                  disabled={savingJobId === job.jobId}
                  title={job.isSaved || job.saved ? "Remove from saved" : "Save job"}
                >
                  {job.isSaved || job.saved ? "❤️" : "🤍"}
                </button>
                <button className="view-btn" onClick={() => setViewingJob(job)}>
                  View Details
                </button>
                <button
                  className={applyState.className}
                  onClick={applyState.onClick || (() => handleApplyClick(job))}
                  disabled={applyState.disabled}
                >
                  {applyState.text}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {totalPages > 1 && (
        <div className="pagination-container">
          <button className="pagination-nav" disabled={page === 0} onClick={() => fetchJobs(page - 1, searchKeyword)}>‹</button>
          {getPaginationNumbers().map((num, index) =>
            num === "..." ? (
              <span key={index} className="pagination-ellipsis">...</span>
            ) : (
              <button
                key={num}
                onClick={() => fetchJobs(num, searchKeyword)}
                className={`pagination-number ${page === num ? "active" : ""}`}
              >
                {num + 1}
              </button>
            )
          )}
          <button className="pagination-nav" disabled={page + 1 >= totalPages} onClick={() => fetchJobs(page + 1, searchKeyword)}>›</button>
        </div>
      )}

      {/* JOB DETAILS MODAL */}
      {viewingJob && (
        <div className="modal-overlay" onClick={() => setViewingJob(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setViewingJob(null)}>✕</button>
            
            <div className="modal-header">
              <div className="modal-logo-section">
                {viewingJob.companyLogo || viewingJob.logoUrl ? (
                  <img src={viewingJob.companyLogo || viewingJob.logoUrl} alt="" className="modal-company-logo" 
                       onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}/>
                ) : null}
                <span className="modal-letter-avatar" style={{display: viewingJob.companyLogo || viewingJob.logoUrl ? 'none' : 'flex'}}>
                  {(viewingJob.companyName || "J")[0]}
                </span>
              </div>
              <div>
                <h2 className="modal-job-title">{viewingJob.title}</h2>
                <p className="modal-company-name">{viewingJob.companyName}</p>
              </div>
            </div>

            <div className="modal-body">
              <div className="modal-grid">
                <div className="modal-info-card">
                  <span className="modal-info-label">Location</span>
                  <span className="modal-info-value">📍 {viewingJob.location || "Remote"}</span>
                </div>
                <div className="modal-info-card">
                  <span className="modal-info-label">Salary Range</span>
                  <span className="modal-info-value">💰 {viewingJob.salaryOrStipend || viewingJob.salary || "Not disclosed"}</span>
                </div>
                <div className="modal-info-card">
                  <span className="modal-info-label">Job Type</span>
                  <span className="modal-info-value">💼 {(viewingJob.employmentType || "").replace(/_/g, " ")}</span>
                </div>
                {viewingJob.experienceRequired != null && (
                  <div className="modal-info-card">
                    <span className="modal-info-label">Experience</span>
                    <span className="modal-info-value">🎓 {viewingJob.experienceRequired} Years</span>
                  </div>
                )}
              </div>

              {viewingJob.requiredSkills && (
                <div className="modal-section">
                  <h3 className="modal-section-title">Required Skills</h3>
                  <div className="modal-skills-grid">
                    {viewingJob.requiredSkills.split(",").map((skill, i) => (
                      <span key={i} className="skill-chip">{skill.trim()}</span>
                    ))}
                  </div>
                </div>
              )}

              <div className="modal-section">
                <h3 className="modal-section-title">Job Description</h3>
                <div className="modal-description">
                  {viewingJob.description || "No detailed description available for this position."}
                </div>
              </div>

              {viewingJob.redirectUrl && (
                <div className="modal-redirect">
                  <a href={viewingJob.redirectUrl} target="_blank" rel="noopener noreferrer">
                    🔗 View Official Company Posting
                  </a>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="view-btn" style={{ minWidth: "150px" }} onClick={() => setViewingJob(null)}>
                Close
              </button>
              {(() => {
                const applyState = getApplyButtonState(viewingJob);
                return (
                  <button
                    className={applyState.className}
                    onClick={applyState.onClick || (() => handleApplyClick(viewingJob))}
                    disabled={applyState.disabled}
                    style={{ 
                      minWidth: "200px",
                      padding: "12px 30px",
                      fontSize: "1rem"
                    }}
                  >
                    {applyState.text}
                  </button>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
    
  );
};


export default Jobs;