import React, { useState, useEffect } from "react";
import axiosInstance from "../../api/axiosConfig";

function CompanyMyJobs({ company, onEditJob }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (company?.companyId) fetchJobs();
  }, [company]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(`/job/company/${company.companyId}`, { params: { page: 0, size: 100 } });
      setJobs(res.data.content || []);
    } catch (err) {
      console.error("Failed to fetch jobs", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (jobId) => {
    if (!confirm("Delete this job listing?")) return;
    try {
      await axiosInstance.delete(`/job/${jobId}`);
      setJobs(jobs.filter(j => j.jobId !== jobId));
      setToast({ msg: "Job deleted", type: "success" });
      setTimeout(() => setToast(null), 3000);
    } catch (err) {
      setToast({ msg: "Failed to delete job", type: "error" });
      setTimeout(() => setToast(null), 3000);
    }
  };

  const formatDate = (d) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  };

  return (
    <div>
      {toast && <div className={`comp-toast ${toast.type}`}>{toast.msg}</div>}

      <div className="comp-page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1>My Jobs</h1>
          <p>{jobs.length} job listing{jobs.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      {loading ? (
        <p style={{ color: "#94a3b8", textAlign: "center", padding: 40 }}>Loading...</p>
      ) : jobs.length === 0 ? (
        <div className="comp-empty">
          <p style={{ fontSize: "1.2rem" }}>No jobs posted yet</p>
          <p>Click "Post Job" in the sidebar to create your first listing!</p>
        </div>
      ) : (
        <div className="comp-section" style={{ padding: 0, overflow: "hidden" }}>
          <table className="comp-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Location</th>
                <th>Type</th>
                <th>Salary</th>
                <th>Posted</th>
                <th>Deadline</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <tr key={job.jobId}>
                  <td className="title-cell">{job.title}</td>
                  <td>{job.location || "—"}</td>
                  <td>
                    <span className="comp-badge" style={{ background: "rgba(108,143,220,0.15)", color: "#6c8fdc" }}>
                      {(job.employmentType || "").replace(/_/g, " ")}
                    </span>
                  </td>
                  <td>{job.salaryOrStipend || "—"}</td>
                  <td style={{ whiteSpace: "nowrap" }}>{formatDate(job.postedAt)}</td>
                  <td style={{ whiteSpace: "nowrap" }}>{formatDate(job.lastDate)}</td>
                  <td>
                    <div className="comp-actions">
                      <button className="comp-btn small edit" onClick={() => onEditJob(job)}>Edit</button>
                      <button className="comp-btn small delete" onClick={() => handleDelete(job.jobId)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default CompanyMyJobs;
