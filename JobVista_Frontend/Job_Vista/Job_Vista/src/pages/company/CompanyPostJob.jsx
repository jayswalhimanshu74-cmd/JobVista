import React, { useState, useEffect } from "react";
import axiosInstance from "../../api/axiosConfig";

const EMPTY_JOB = {
  title: "", description: "", location: "", salaryOrStipend: "",
  requiredSkills: "", jobType: "JOB", employmentType: "FULL_TIME",
  experienceRequired: 0, redirectUrl: "", source: "JOBVISTA",
};

function CompanyPostJob({ company, editingJob, onSaved }) {
  const [form, setForm] = useState(EMPTY_JOB);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const isEdit = !!editingJob;

  useEffect(() => {
    if (editingJob) {
      setForm({
        title: editingJob.title || "",
        description: editingJob.description || "",
        location: editingJob.location || "",
        salaryOrStipend: editingJob.salaryOrStipend || "",
        requiredSkills: editingJob.requiredSkills || "",
        jobType: editingJob.jobType || "JOB",
        employmentType: editingJob.employmentType || "FULL_TIME",
        experienceRequired: editingJob.experienceRequired || 0,
        redirectUrl: editingJob.redirectUrl || "",
        source: editingJob.source || "JOBVISTA",
      });
    } else {
      setForm(EMPTY_JOB);
    }
  }, [editingJob]);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { showToast("Title is required", "error"); return; }
    if (!form.description.trim()) { showToast("Description is required", "error"); return; }

    setSaving(true);
    try {
      if (isEdit) {
        await axiosInstance.put(`/job/${editingJob.jobId}`, form);
        showToast("Job updated!");
      } else {
        await axiosInstance.post("/job", form);
        showToast("Job posted!");
      }
      setTimeout(() => onSaved(), 1000);
    } catch (err) {
      console.error("Save job error", err);
      showToast(err.response?.data?.message || "Failed to save job", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      {toast && <div className={`comp-toast ${toast.type}`}>{toast.msg}</div>}

      <div className="comp-page-header">
        <h1>{isEdit ? "Edit Job" : "Post a New Job"}</h1>
        <p>{isEdit ? `Editing: ${editingJob.title}` : "Fill in the details to create a job listing"}</p>
      </div>

      <div className="comp-section">
        <form className="comp-form" onSubmit={handleSubmit}>
          <div className="comp-form-row">
            <div className="comp-field">
              <label>Job Title *</label>
              <input name="title" value={form.title} onChange={handleChange} placeholder="e.g. Frontend Developer" required />
            </div>
            <div className="comp-field">
              <label>Location</label>
              <input name="location" value={form.location} onChange={handleChange} placeholder="e.g. Mumbai, Remote" />
            </div>
          </div>

          <div className="comp-field">
            <label>Description *</label>
            <textarea name="description" value={form.description} onChange={handleChange} placeholder="Job responsibilities, requirements..." required rows={5} />
          </div>

          <div className="comp-form-row">
            <div className="comp-field">
              <label>Employment Type</label>
              <select name="employmentType" value={form.employmentType} onChange={handleChange}>
                <option value="FULL_TIME">Full Time</option>
                <option value="PART_TIME">Part Time</option>
                <option value="INTERNSHIP">Internship</option>
                <option value="CONTRACT">Contract</option>
                <option value="FREELANCE">Freelance</option>
              </select>
            </div>
            <div className="comp-field">
              <label>Job Type</label>
              <select name="jobType" value={form.jobType} onChange={handleChange}>
                <option value="JOB">Job</option>
                <option value="INTERNSHIP">Internship</option>
              </select>
            </div>
          </div>

          <div className="comp-form-row">
            <div className="comp-field">
              <label>Salary / Stipend</label>
              <input name="salaryOrStipend" value={form.salaryOrStipend} onChange={handleChange} placeholder="e.g. ₹5-8 LPA" />
            </div>
            <div className="comp-field">
              <label>Experience Required (years)</label>
              <input name="experienceRequired" type="number" min="0" value={form.experienceRequired} onChange={handleChange} />
            </div>
          </div>

          <div className="comp-field">
            <label>Required Skills</label>
            <input name="requiredSkills" value={form.requiredSkills} onChange={handleChange} placeholder="e.g. React, Node.js, PostgreSQL" />
          </div>

          <div className="comp-field">
            <label>External Redirect URL (optional)</label>
            <input name="redirectUrl" value={form.redirectUrl} onChange={handleChange} placeholder="https://careers.company.com/apply" />
          </div>

          <div style={{ display: "flex", gap: 12, marginTop: 10 }}>
            <button type="submit" className="comp-btn primary" disabled={saving}>
              {saving ? "Saving..." : isEdit ? "Update Job" : "Post Job"}
            </button>
            {isEdit && (
              <button type="button" className="comp-btn small delete" onClick={() => onSaved()}>
                Cancel Edit
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export default CompanyPostJob;
