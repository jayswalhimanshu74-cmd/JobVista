import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosConfig";
import { AuthContext } from "../../context/AuthContext";
import "../../styles/jobs.css";
import {
    MapPin, Briefcase, Clock, DollarSign, Building2,
    ArrowLeft, Bookmark, BookmarkCheck, Share2, ExternalLink
} from "lucide-react";

const JobDetails = () => {
    const { jobId } = useParams();
    const navigate = useNavigate();
    const { user, loggedIn, setAppliedJobs } = useContext(AuthContext);

    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [applying, setApplying] = useState(false);
    const [applied, setApplied] = useState(false);
    const [saved, setSaved] = useState(false);
    const [toast, setToast] = useState(null);

    const showToast = (message, type = "success") => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 4000);
    };

    useEffect(() => {
        const fetchJob = async () => {
            try {
                setLoading(true);
                const res = await axiosInstance.get(`/job/${jobId}`);
                setJob(res.data);
                setSaved(res.data.saved || res.data.isSaved || false);
            } catch (err) {
                console.error("Failed to fetch job", err);
                showToast("Failed to load job details", "error");
            } finally {
                setLoading(false);
            }
        };
        if (jobId) fetchJob();
    }, [jobId]);

    // Check if the current user has already applied to this job
    useEffect(() => {
        const checkApplicationStatus = async () => {
            const token = localStorage.getItem("accessToken");
            if (!token) return;
            try {
                const res = await axiosInstance.get("/application/me", { params: { page: 0, size: 50 } });
                const apps = res.data?.content || res.data || [];
                if (Array.isArray(apps)) {
                    const hasApplied = apps.some(app => String(app.jobId) === String(jobId) || String(app.job?.jobId) === String(jobId));
                    if (hasApplied) {
                        setApplied(true);
                    }
                }
            } catch (err) {
                // Guest or error
            }
        };
        if (jobId) checkApplicationStatus();
    }, [jobId]);

    const handleApply = async () => {
        const token = localStorage.getItem("accessToken");
        if (!loggedIn && !token) { 
            navigate("/login", { state: { from: { pathname: `/jobs/${jobId}` } } }); 
            return; 
        }
        try {
            setApplying(true);
            await axiosInstance.post(`/application/apply/${jobId}`);
            setApplied(true);
            if (setAppliedJobs) {
                setAppliedJobs(prev => new Set([...prev, jobId]));
            }
            showToast("Application submitted successfully!", "success");
        } catch (err) {
            if (err.response?.status === 409) {
                setApplied(true);
                if (setAppliedJobs) {
                    setAppliedJobs(prev => new Set([...prev, jobId]));
                }
                showToast("You have already applied for this job!", "info");
            } else {
                const msg = err.response?.data?.message || err.response?.data?.error || "Failed to apply";
                showToast(msg, "error");
            }
        } finally {
            setApplying(false);
        }
    };

    const handleSave = async () => {
        const token = localStorage.getItem("accessToken");
        if (!loggedIn && !token) { 
            navigate("/login", { state: { from: { pathname: `/jobs/${jobId}` } } }); 
            return; 
        }
        try {
            if (saved) {
                await axiosInstance.delete(`/saved-jobs/${jobId}`);
                setSaved(false);
                showToast("Job removed from saved");
            } else {
                await axiosInstance.post(`/saved-jobs/${jobId}`);
                setSaved(true);
                showToast("Job saved successfully!");
            }
        } catch (err) {
            showToast("Failed to save job", "error");
        }
    };

    if (loading) return (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
            <p style={{ color: "#666" }}>Loading job details...</p>
        </div>
    );

    if (!job) return (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
            <p style={{ color: "#666" }}>Job not found.</p>
        </div>
    );

    return (
        <div className="job-details-page">

            {/* Toast */}
            {toast && (
                <div style={{
                    position: "fixed", top: "1rem", right: "1rem", zIndex: 1000,
                    padding: "12px 20px", borderRadius: "8px", fontWeight: 500,
                    background: toast.type === "error" ? "#fee2e2" : "#dcfce7",
                    color: toast.type === "error" ? "#991b1b" : "#166534",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                }}>
                    {toast.message}
                </div>
            )}

            {/* Back Button */}
            <button onClick={() => navigate(-1)} style={{
                display: "flex", alignItems: "center", gap: "6px",
                background: "none", border: "none", cursor: "pointer",
                color: "#6b7280", fontSize: "14px", marginBottom: "1.5rem", padding: 0
            }}>
                <ArrowLeft size={16} /> Back to Jobs
            </button>

            {/* Application Success Confirmation */}
            {applied && (
                <div className="application-success-banner" style={{
                    backgroundColor: "#ecfdf5",
                    border: "1px solid #10b981",
                    color: "#065f46",
                    padding: "16px 20px",
                    borderRadius: "10px",
                    marginBottom: "1.5rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    boxShadow: "0 2px 8px rgba(16, 185, 129, 0.12)"
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <span style={{ fontSize: "1.5rem", fontWeight: "bold" }}>✓</span>
                        <div>
                            <strong style={{ fontSize: "1.05rem", display: "block" }}>Application Submitted Successfully!</strong>
                            <p style={{ margin: "4px 0 0", fontSize: "0.875rem", color: "#047857" }}>
                                Your application has been received. You can review and track your application status in your profile.
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => navigate("/profile")}
                        style={{
                            backgroundColor: "#059669",
                            color: "#fff",
                            border: "none",
                            padding: "8px 18px",
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontWeight: 600,
                            fontSize: "0.875rem",
                            whiteSpace: "nowrap"
                        }}
                    >
                        View in Profile
                    </button>
                </div>
            )}

            {/* Header Card */}
            <div className="job-details-card card">
                <div className="job-details-header">
                    <div>
                        <h1 style={{ fontSize: "1.8rem", fontWeight: 800, color: "#111", margin: "0 0 8px" }}>
                            {job.title}
                        </h1>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#6b7280", fontSize: "15px" }}>
                            <Building2 size={16} />
                            <span>{job.companyName}</span>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="job-details-actions">
                        <button onClick={handleSave} style={{
                            display: "flex", alignItems: "center", gap: "6px",
                            padding: "10px 16px", borderRadius: "8px", cursor: "pointer",
                            border: "1px solid #e5e7eb", background: saved ? "#f0fdf4" : "#fff",
                            color: saved ? "#16a34a" : "#374151", fontSize: "14px", fontWeight: 500
                        }}>
                            {saved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
                            {saved ? "Saved" : "Save"}
                        </button>

                        {job.redirectUrl ? (
                            <a href={job.redirectUrl} target="_blank" rel="noopener noreferrer" style={{
                                display: "flex", alignItems: "center", gap: "6px",
                                padding: "10px 20px", borderRadius: "8px",
                                background: "#2563eb", color: "#fff",
                                fontSize: "14px", fontWeight: 600, textDecoration: "none"
                            }}>
                                Apply Now <ExternalLink size={14} />
                            </a>
                        ) : (
                            <button onClick={handleApply} disabled={applying || applied} style={{
                                padding: "10px 24px", borderRadius: "8px", cursor: applied ? "default" : "pointer",
                                border: "none", fontSize: "14px", fontWeight: 600,
                                background: applied ? "#16a34a" : applying ? "#93c5fd" : "#2563eb",
                                color: "#fff"
                            }}>
                                {applied ? "✓ Applied" : applying ? "Applying..." : "Apply Now"}
                            </button>
                        )}
                    </div>
                </div>

                {/* Meta Info */}
                <div style={{
                    display: "flex", flexWrap: "wrap", gap: "1.5rem",
                    marginTop: "1.5rem", paddingTop: "1.5rem",
                    borderTop: "1px solid #f3f4f6"
                }}>
                    {job.location && (
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#6b7280", fontSize: "14px" }}>
                            <MapPin size={15} /> {job.location}
                        </div>
                    )}
                    {job.employmentType && (
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#6b7280", fontSize: "14px" }}>
                            <Clock size={15} /> {job.employmentType}
                        </div>
                    )}
                    {job.salaryOrStipend && (
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#6b7280", fontSize: "14px" }}>
                            <DollarSign size={15} /> {job.salaryOrStipend}
                        </div>
                    )}
                    {job.experienceRequired !== undefined && (
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#6b7280", fontSize: "14px" }}>
                            <Briefcase size={15} /> {job.experienceRequired === 0 ? "Fresher" : `${job.experienceRequired}+ years`}
                        </div>
                    )}
                </div>

                {/* Tags */}
                <div style={{ display: "flex", gap: "8px", marginTop: "1rem", flexWrap: "wrap" }}>
                    {job.jobType && (
                        <span style={{
                            padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: 500,
                            background: "#eff6ff", color: "#1d4ed8"
                        }}>{job.jobType}</span>
                    )}
                    {job.lastDate && (
                        <span style={{
                            padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: 500,
                            background: "#fef9c3", color: "#854d0e"
                        }}>
                            Last Date: {new Date(job.lastDate).toLocaleDateString()}
                        </span>
                    )}
                </div>
            </div>

            {/* Description Card */}
            <div className="job-details-card card">
                <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#111", marginBottom: "1rem" }}>
                    Job Description
                </h2>
                <p style={{ color: "#374151", lineHeight: "1.8", whiteSpace: "pre-wrap" }}>
                    {job.description}
                </p>
            </div>

            {/* Skills Card */}
            {job.requiredSkills && (
                <div className="job-details-card card">
                    <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#111", marginBottom: "1rem" }}>
                        Required Skills
                    </h2>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                        {job.requiredSkills.split(",").map((skill, i) => (
                            <span key={i} style={{
                                padding: "6px 14px", borderRadius: "20px", fontSize: "13px",
                                background: "#f3f4f6", color: "#374151", fontWeight: 500
                            }}>
                                {skill.trim()}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default JobDetails;