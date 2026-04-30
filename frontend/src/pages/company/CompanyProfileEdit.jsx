import React, { useState, useEffect } from "react";
import axiosInstance from "../../api/axiosConfig";

function CompanyProfileEdit({ company, onUpdated }) {
  const [form, setForm] = useState({
    companyName: "", companyEmail: "", companyWebsite: "",
    location: "", description: "", logoUrl: "",
  });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (company) {
      setForm({
        companyName: company.companyName || "",
        companyEmail: company.companyEmail || "",
        companyWebsite: company.companyWebsite || "",
        location: company.location || "",
        description: company.description || "",
        logoUrl: company.logoUrl || "",
      });
    }
  }, [company]);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.companyName.trim()) { showToast("Company name is required", "error"); return; }

    setSaving(true);
    try {
      await axiosInstance.put("/company/me", form);
      showToast("Profile updated!");
      onUpdated();
    } catch (err) {
      showToast(err.response?.data?.message || "Update failed", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      {toast && <div className={`comp-toast ${toast.type}`}>{toast.msg}</div>}

      <div className="comp-page-header">
        <h1>Company Profile</h1>
        <p>Update your company information</p>
      </div>

      <div className="comp-section">
        <form className="comp-form" onSubmit={handleSubmit}>
          <div className="comp-form-row">
            <div className="comp-field">
              <label>Company Name *</label>
              <input name="companyName" value={form.companyName} onChange={handleChange} required />
            </div>
            <div className="comp-field">
              <label>Company Email</label>
              <input name="companyEmail" type="email" value={form.companyEmail} onChange={handleChange} />
            </div>
          </div>

          <div className="comp-form-row">
            <div className="comp-field">
              <label>Website</label>
              <input name="companyWebsite" value={form.companyWebsite} onChange={handleChange} placeholder="https://..." />
            </div>
            <div className="comp-field">
              <label>Location</label>
              <input name="location" value={form.location} onChange={handleChange} placeholder="e.g. Mumbai, India" />
            </div>
          </div>

          <div className="comp-field">
            <label>Logo URL</label>
            <input name="logoUrl" value={form.logoUrl} onChange={handleChange} placeholder="https://company.com/logo.png" />
          </div>

          {form.logoUrl && (
            <div style={{ padding: 10 }}>
              <img src={form.logoUrl} alt="Preview" style={{ maxHeight: 80, borderRadius: 10, background: "rgba(255,255,255,0.1)" }}
                onError={(e) => { e.target.style.display = "none"; }} />
            </div>
          )}

          <div className="comp-field">
            <label>Description</label>
            <textarea name="description" value={form.description} onChange={handleChange}
              placeholder="Tell people about your company..." rows={5} />
          </div>

          <button type="submit" className="comp-btn primary" disabled={saving} style={{ alignSelf: "flex-start" }}>
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CompanyProfileEdit;
