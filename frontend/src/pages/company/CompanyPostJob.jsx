import React, { useState, useEffect } from "react";
import axiosInstance from "../../api/axiosConfig";
import { Send, Check, X, Info } from "lucide-react";

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
        showToast("Job listing updated successfully!");
      } else {
        await axiosInstance.post("/job", form);
        showToast("Job listing posted successfully!");
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
    <div className="company-post-job-content">
      {toast && (
        <div className={`comp-toast ${toast.type}`}>
          {toast.type === "success" ? <Check size={18} /> : <Info size={18} />}
          {toast.msg}
        </div>
      )}

      <header className="comp-page-header">
        <h1>{isEdit ? "Edit Opportunity" : "Create New Opportunity"}</h1>
        <p>{isEdit ? `Modifying: ${editingJob.title}` : "Fill in the details to attract the best talent for your team"}</p>
      </header>

      <section className="comp-section" style={{ maxWidth: "900px" }}>
        <form className="comp-form" onSubmit={handleSubmit}>
          <div className="comp-form-row">
            <div className="comp-field">
              <label>Job Title *</label>
              <input name="title" value={form.title} onChange={handleChange} placeholder="e.g. Senior Product Designer" required />
            </div>
            <div className="comp-field">
              <label>Location</label>
              <input name="location" value={form.location} onChange={handleChange} placeholder="e.g. Pune, Maharashtra (or Remote)" />
            </div>
          </div>

          <div className="comp-field">
            <label>Job Description *</label>
            <textarea name="description" value={form.description} onChange={handleChange} placeholder="Outline responsibilities, daily tasks, and what makes this role unique..." required rows={6} />
          </div>

          <div className="comp-form-row">
            <div className="comp-field">
              <label>Employment Category</label>
              <select name="employmentType" value={form.employmentType} onChange={handleChange}>
                <option value="FULL_TIME">Full Time</option>
                <option value="PART_TIME">Part Time</option>
                <option value="INTERNSHIP">Internship</option>
                <option value="CONTRACT">Contract</option>
                <option value="FREELANCE">Freelance</option>
              </select>
            </div>
            <div className="comp-field">
              <label>Posting Type</label>
              <select name="jobType" value={form.jobType} onChange={handleChange}>
                <option value="JOB">Job Listing</option>
                <option value="INTERNSHIP">Internship Program</option>
              </select>
            </div>
          </div>

          <div className="comp-form-row">
            <div className="comp-field">
              <label>Compensation Package</label>
              <input name="salaryOrStipend" value={form.salaryOrStipend} onChange={handleChange} placeholder="e.g. ₹12 - 18 LPA" />
            </div>
            <div className="comp-field">
              <label>Minimum Experience (Years)</label>
              <input name="experienceRequired" type="number" min="0" value={form.experienceRequired} onChange={handleChange} />
            </div>
          </div>

          <div className="comp-field">
            <label>Key Skills Required</label>
            <input name="requiredSkills" value={form.requiredSkills} onChange={handleChange} placeholder="e.g. React, TypeScript, UI/UX Design (comma separated)" />
          </div>

          <div className="comp-field">
            <label>External Application Link (Optional)</label>
            <input name="redirectUrl" value={form.redirectUrl} onChange={handleChange} placeholder="https://yourcompany.com/careers/apply" />
          </div>

          <div className="comp-form-actions" style={{ display: "flex", gap: "16px", marginTop: "20px" }}>
            <button type="submit" className="comp-btn primary" disabled={saving}>
              {saving ? "Publishing..." : isEdit ? "Update Listing" : "Publish Opportunity"}
              {!saving && <Send size={18} />}
            </button>
            {isEdit && (
              <button type="button" className="comp-btn edit" onClick={() => onSaved()}>
                <X size={18} /> Cancel
              </button>
            )}
          </div>
        </form>
      </section>
    </div>
  );
}

export default CompanyPostJob;

