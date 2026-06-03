import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosConfig";
import { AuthContext } from "../../context/AuthContext";
import {
    MapPin, Briefcase, Clock, DollarSign, Building2,
    ArrowLeft, Bookmark, BookmarkCheck, Share2, ExternalLink
} from "lucide-react";

const JobDetails = () => {
    const { jobId } = useParams();
    const navigate = useNavigate();
    const { user, loggedIn } = useContext(AuthContext);

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
                setSaved(res.data.saved || false);
            } catch (err) {
                console.error("Failed to fetch job", err);
                showToast("Failed to load job details", "error");
            } finally {
                setLoading(false);
            }
        };
        if (jobId) fetchJob();
    }, [jobId]);

    const handleApply = async () => {
        if (!loggedIn) { navigate("/login"); return; }
        try {
            setApplying(true);
            await axiosInstance.post(`/application/apply/${jobId}`);
            setApplied(true);
            showToast("Application submitted successfully!");
        } catch (err) {
            const msg = err.response?.data?.message || "Failed to apply";
            showToast(msg, "error");
        } finally {
            setApplying(false);
        }
    };

    const handleSave = async () => {
        if (!loggedIn) { navigate("/login"); return; }
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
        <div style={{ maxWidth: "860px", margin: "2rem auto", padding: "0 1rem" }}>

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

            {/* Header Card */}
            <div style={{
                background: "#fff", border: "1px solid #e5e7eb",
                borderRadius: "12px", padding: "2rem", marginBottom: "1.5rem"
            }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
                    <div>
                        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#111", margin: "0 0 8px" }}>
                            {job.title}
                        </h1>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#6b7280", fontSize: "15px" }}>
                            <Building2 size={16} />
                            <span>{job.companyName}</span>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: "flex", gap: "10px" }}>
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
            <div style={{
                background: "#fff", border: "1px solid #e5e7eb",
                borderRadius: "12px", padding: "2rem", marginBottom: "1.5rem"
            }}>
                <h2 style={{ fontSize: "1.1rem", fontWeight: 600, color: "#111", marginBottom: "1rem" }}>
                    Job Description
                </h2>
                <p style={{ color: "#374151", lineHeight: "1.8", whiteSpace: "pre-wrap" }}>
                    {job.description}
                </p>
            </div>

            {/* Skills Card */}
            {job.requiredSkills && (
                <div style={{
                    background: "#fff", border: "1px solid #e5e7eb",
                    borderRadius: "12px", padding: "2rem"
                }}>
                    <h2 style={{ fontSize: "1.1rem", fontWeight: 600, color: "#111", marginBottom: "1rem" }}>
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