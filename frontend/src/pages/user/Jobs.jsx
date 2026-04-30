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

    if (appliedJobIds.has(job.jobId)) {
      showToast("You've already applied for this job!", "warning");
      return;
    }

    if (applyingJobId === job.jobId) return;

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

      if (!error.response) {
        showToast("Network error: Could not reach the server. Is the backend running?", "error");
        return;
      }

      const status = error.response.status;
      const serverMsg = error.response.data?.message || error.response.data?.error || "";

      if (status === 400) {
        // Profile/resume related issues
        if (serverMsg.toLowerCase().includes("profile") || serverMsg.toLowerCase().includes("jobseeker")) {
          showToast("Complete your profile first! Redirecting...", "warning");
          setTimeout(() => navigate("/profile"), 2000);
        } else if (serverMsg.toLowerCase().includes("resume")) {
          showToast("Please upload your resume first! Redirecting...", "warning");
          setTimeout(() => navigate("/resume"), 2000);
        } else {
          showToast(serverMsg || "Cannot apply right now.", "error");
        }
      } else if (status === 401) {
        showToast("Session expired. Please log in again.", "error");
        localStorage.removeItem("accessToken");
        setTimeout(() => navigate("/login"), 1500);
      } else if (status === 403) {
        showToast("Permission denied. Only job seekers can apply.", "error");
      } else if (status === 404) {
        showToast("Job not found. It may have been removed.", "error");
      } else if (status === 409) {
        // Already applied (conflict)
        setAppliedJobIds(prev => new Set([...prev, job.jobId]));
        showToast("You've already applied for this job!", "warning");
      } else if (status >= 500) {
        showToast(`Server error: ${serverMsg || "Please try again later."}`, "error");
      } else {
        showToast(`Unexpected error (${status}). Please try again.`, "error");
      }
    } finally {
      setApplyingJobId(null);
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
    if (appliedJobIds.has(job.jobId)) {
      return { text: "✓ Applied", disabled: true, className: "apply-btn applied" };
    }
    if (applyingJobId === job.jobId) {
      return { text: "Applying...", disabled: true, className: "apply-btn applying" };
    }
    return { text: "Apply Now", disabled: false, className: "apply-btn" };
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
      {toast && (
        <div className={`jobs-toast jobs-toast-${toast.type}`}>
          <span>{toast.message}</span>
          <button onClick={() => setToast(null)} className="toast-close">✕</button>
        </div>
      )}

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
              <div className="job-card-top">
                <div className="job-card-title-row">
                  <h3 className="job-title" style={{ color: "#f5f5fc",textDecoration: "none" }}>{job.title}</h3>
                  <span className="job-type-badge" style={{ color: "#f5f5fc" }}>
                    {(job.employmentType || "").replace(/_/g, " ")}
                  </span>
                </div>
                <p className="job-company-name" style={{ color: "#a5b4fc" }}>🏢 {job.companyName}</p>
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
                  className="save-btn"
                  onClick={() => handleSaveClick(job)}
                  disabled={savingJobId === job.jobId}
                >
                  {job.isSaved || job.saved ? "♥ Saved" : "♡ Save"}
                </button>
                <button className="view-btn" onClick={() => setViewingJob(job)}>
                  View Details
                </button>
                <button
                  className={applyState.className}
                  onClick={() => handleApplyClick(job)}
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
            <div className="job-details-modal">
              <h2>{viewingJob.title}</h2>
              <p className="modal-company">{viewingJob.companyName}</p>
              <div className="job-info-grid">
                <div className="info-item"><strong>Location:</strong> {viewingJob.location}</div>
                <div className="info-item"><strong>Salary:</strong> {viewingJob.salaryOrStipend || viewingJob.salary || "Not disclosed"}</div>
                <div className="info-item"><strong>Type:</strong> {(viewingJob.employmentType || "").replace(/_/g, " ")}</div>
                {viewingJob.experienceRequired != null && (
                  <div className="info-item"><strong>Experience:</strong> {viewingJob.experienceRequired} years</div>
                )}
                {viewingJob.postedAt && (
                  <div className="info-item"><strong>Posted:</strong> {formatDate(viewingJob.postedAt)} ({timeAgo(viewingJob.postedAt)})</div>
                )}
                {viewingJob.lastDate && (
                  <div className="info-item"><strong>Last Date:</strong> {formatDate(viewingJob.lastDate)}</div>
                )}
              </div>

              {viewingJob.requiredSkills && (
                <div className="job-description-section">
                  <h3>Required Skills</h3>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {viewingJob.requiredSkills.split(",").map((skill, i) => (
                      <span key={i} style={{
                        padding: "6px 14px",
                        background: "rgba(108,143,220,0.15)",
                        border: "1px solid rgba(108,143,220,0.3)",
                        borderRadius: 20,
                        fontSize: "0.85rem",
                        color: "#a5b4fc"
                      }}>{skill.trim()}</span>
                    ))}
                  </div>
                </div>
              )}

              <div className="job-description-section">
                <h3>Job Description</h3>
                <p>{viewingJob.description || "No description available"}</p>
              </div>

              {viewingJob.redirectUrl && (
                <a
                  href={viewingJob.redirectUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-block",
                    marginBottom: 15,
                    color: "#7dd3c0",
                    textDecoration: "underline",
                    fontSize: "0.95rem"
                  }}
                >
                  🔗 View on company website
                </a>
              )}

              {(() => {
                const applyState = getApplyButtonState(viewingJob);
                return (
                  <button
                    className={applyState.className}
                    onClick={() => handleApplyClick(viewingJob)}
                    disabled={applyState.disabled}
                    style={{
                      width: "100%",
                      padding: "14px 20px",
                      marginTop: 10,
                      fontSize: "1.05rem",
                      ...(appliedJobIds.has(viewingJob.jobId) ? {
                        background: "linear-gradient(135deg, #059669, #10b981)",
                        cursor: "default"
                      } : {})
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