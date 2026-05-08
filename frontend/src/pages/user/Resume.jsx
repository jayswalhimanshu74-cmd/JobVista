import React, { useEffect, useState } from "react";
import "../../styles/resume.css";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const emptyResume = {
  id: null,
  name: "",
  email: "",
  phone: "",
  address: "",
  title: "",
  linkedin: "",
  github: "",
  portfolio: "",
  summary: "",
  education: "",
  experience: "",
  projects: "",
  skills: "",
};

function validateResume(r) {
  const issues = [];
  if (!r.name || r.name.trim().length < 2) issues.push("Name is required");
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!r.email || !emailRe.test(r.email)) issues.push("Valid email is required");
  if (!r.title || r.title.trim().length < 2) issues.push("Professional title is required");
  if (!r.summary || r.summary.trim().split(/\s+/).length < 10) issues.push("Summary should be at least 10 words");
  if (!r.skills || r.skills.trim().length < 2) issues.push("List at least one skill");
  return issues;
}

function loadSaved() {
  try {
    const raw = localStorage.getItem("jobvista_resumes_v2");
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveAll(list) {
  localStorage.setItem("jobvista_resumes_v2", JSON.stringify(list));
}

function Resume() {
  const [form, setForm] = useState(emptyResume);
  const [resumes, setResumes] = useState([]);
  const [issues, setIssues] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setResumes(loadSaved());
  }, []);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const onSave = () => {
    const found = validateResume(form);
    setIssues(found);
    if (found.length > 0) {
      setMessage("Please fix the issues before saving.");
      return;
    }

    const all = [...resumes];
    if (form.id) {
      const idx = all.findIndex((r) => r.id === form.id);
      if (idx >= 0) all[idx] = { ...form };
    } else {
      const newItem = { ...form, id: Date.now() };
      all.unshift(newItem);
      setForm(newItem);
    }

    setResumes(all);
    saveAll(all);
    setMessage("Resume saved successfully! ✅");
    setTimeout(() => setMessage(""), 3000);
  };

  const onNew = () => {
    setForm(emptyResume);
    setIssues([]);
    setMessage("");
  };

  const onLoad = (id) => {
    const item = resumes.find((r) => r.id === id);
    if (item) {
      setForm(item);
      setIssues([]);
      setMessage("Loaded successfully!");
      setTimeout(() => setMessage(""), 2000);
    }
  };

  const onDelete = (id) => {
    if (window.confirm("Delete this resume?")) {
      const all = resumes.filter((r) => r.id !== id);
      setResumes(all);
      saveAll(all);
      if (form.id === id) setForm(emptyResume);
    }
  };

  const downloadPDF = async () => {
    const element = document.getElementById("resumePreview");
    if (!element) return;

    element.classList.add("exporting");

    // Use higher scale for better quality
    const canvas = await html2canvas(element, { 
      scale: 2, 
      useCORS: true,
      backgroundColor: "#ffffff"
    });

    element.classList.remove("exporting");

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    let heightLeft = imgHeight;
    let position = 0;

    // First page
    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // Subsequent pages
    while (heightLeft > 0) {
      position = heightLeft - imgHeight; // This moves the image "up" for the next slice
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(`${form.name.replace(/\s+/g, "_")}_Resume.pdf`);
  };

  return (
    <div className="resume-page">
      <div className="resume-header">
        <h1>Resume Builder</h1>
        <p>Craft a professional, interview-ready resume in minutes with our SaaS-grade editor</p>
      </div>

      <div className="resume-main-layout">
        
        {/* FORM SECTION */}
        <div className="resume-form-container">
          <section className="resume-form-card">
            <h2>Editor</h2>

            {/* Personal Details */}
            <div className="form-section">
              <h3 className="form-section-title">Personal Information</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>Full Name</label>
                  <input name="name" placeholder="John Doe" value={form.name} onChange={onChange} />
                </div>
                <div className="form-group">
                  <label>Professional Title</label>
                  <input name="title" placeholder="Full Stack Developer" value={form.title} onChange={onChange} />
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <input name="email" type="email" placeholder="john@example.com" value={form.email} onChange={onChange} />
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input name="phone" placeholder="+1 234 567 890" value={form.phone} onChange={onChange} />
                </div>
                <div className="form-group full">
                  <label>Address / Location</label>
                  <input name="address" placeholder="New York, USA" value={form.address} onChange={onChange} />
                </div>
              </div>
            </div>

            {/* Links */}
            <div className="form-section">
              <h3 className="form-section-title">Professional Links</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>LinkedIn</label>
                  <input name="linkedin" placeholder="linkedin.com/in/username" value={form.linkedin} onChange={onChange} />
                </div>
                <div className="form-group">
                  <label>GitHub</label>
                  <input name="github" placeholder="github.com/username" value={form.github} onChange={onChange} />
                </div>
                <div className="form-group full">
                  <label>Portfolio / Website</label>
                  <input name="portfolio" placeholder="yourportfolio.com" value={form.portfolio} onChange={onChange} />
                </div>
              </div>
            </div>

            {/* Professional Info */}
            <div className="form-section">
              <h3 className="form-section-title">Professional Background</h3>
              <div className="form-group full" style={{ marginBottom: 20 }}>
                <label>Professional Summary</label>
                <textarea name="summary" placeholder="Briefly describe your career goals and expertise..." value={form.summary} onChange={onChange} />
              </div>
              <div className="form-group full" style={{ marginBottom: 20 }}>
                <label>Work Experience</label>
                <textarea name="experience" placeholder="Company Name - Role (Year)&#10;• Key Achievement..." value={form.experience} onChange={onChange} />
              </div>
              <div className="form-group full" style={{ marginBottom: 20 }}>
                <label>Education</label>
                <textarea name="education" placeholder="University Name - Degree (Year)..." value={form.education} onChange={onChange} />
              </div>
              <div className="form-group full" style={{ marginBottom: 20 }}>
                <label>Key Projects</label>
                <textarea name="projects" placeholder="Project Name - Description..." value={form.projects} onChange={onChange} />
              </div>
              <div className="form-group full">
                <label>Skills (Comma separated)</label>
                <input name="skills" placeholder="React, Node.js, SQL, AWS..." value={form.skills} onChange={onChange} />
              </div>
            </div>

            <div className="form-actions">
              <button className="resume-btn secondary" onClick={onNew}>Clear New</button>
              <button className="resume-btn secondary" onClick={onSave}>Save Draft</button>
              <button className="resume-btn primary" style={{ gridColumn: "span 2" }} onClick={downloadPDF}>
                Export as PDF 🚀
              </button>
            </div>

            {message && <p className="status-msg" style={{ marginTop: 20, textAlign: "center", color: "var(--primary)", fontWeight: 600 }}>{message}</p>}
            {issues.length > 0 && (
              <div style={{ marginTop: 20, color: "#ef4444", fontSize: "0.9rem" }}>
                <strong>Please fix:</strong>
                <ul style={{ paddingLeft: 20 }}>
                  {issues.map((it, i) => <li key={i}>{it}</li>)}
                </ul>
              </div>
            )}
          </section>
        </div>

        {/* PREVIEW SECTION */}
        <div className="resume-preview-container">
          <div id="resumePreview" className="resume-preview-paper">
            <div className="res-header">
              <div className="res-header-top">
                <div className="res-header-main">
                  <h1>{form.name || "YOUR NAME"}</h1>
                  <p className="res-title">{form.title || "Professional Title"}</p>
                </div>
                <div className="res-contact-info">
                  {form.email && <div className="res-contact-item"><span>📧</span> {form.email}</div>}
                  {form.phone && <div className="res-contact-item"><span>📞</span> {form.phone}</div>}
                  {form.address && <div className="res-contact-item"><span>📍</span> {form.address}</div>}
                </div>
              </div>
              <div className="res-social-row">
                {form.linkedin && (
                  <div className="res-social-item" style={{padding:"10px"}}>
                    <span>🔗</span> {form.linkedin.replace(/^https?:\/\/(www\.)?/, "")}
                  </div>
                )}
                {form.github && (
                  <div className="res-social-item">
                    <span>💻</span> {form.github.replace(/^https?:\/\/(www\.)?/, "")}
                  </div>
                )}
                {form.portfolio && (
                  <div className="res-social-item">
                    <span>🌐</span> {form.portfolio.replace(/^https?:\/\/(www\.)?/, "")}
                  </div>
                )}
              </div>
            </div>
            
            <div className="res-body">
              {form.summary && (
                <div className="res-section">
                  <h4 className="res-section-title">Summary</h4>
                  <p className="res-text">{form.summary}</p>
                </div>
              )}

              {form.experience && (
                <div className="res-section">
                  <h4 className="res-section-title">Experience</h4>
                  <p className="res-text">{form.experience}</p>
                </div>
              )}

              {form.projects && (
                <div className="res-section">
                  <h4 className="res-section-title">Projects</h4>
                  <p className="res-text">{form.projects}</p>
                </div>
              )}

              {form.education && (
                <div className="res-section">
                  <h4 className="res-section-title">Education</h4>
                  <p className="res-text">{form.education}</p>
                </div>
              )}

              {form.skills && (
                <div className="res-section">
                  <h4 className="res-section-title">Skills</h4>
                  <div className="res-skills-tags">
                    {form.skills.split(",").map((s, i) => (
                      <span key={i} className="res-skill-tag">{s.trim()}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Saved Resumes List */}
          <section className="saved-resumes-card">
            <h3 style={{ fontSize: "1.2rem", fontWeight: 800 }}>Saved Resumes</h3>
            <div className="saved-list">
              {resumes.length === 0 ? (
                <p style={{ color: "var(--text-light)", fontSize: "0.9rem" }}>No saved resumes yet.</p>
              ) : (
                resumes.map((r) => (
                  <div key={r.id} className="saved-item">
                    <div className="saved-item-info">
                      <h4>{r.name}</h4>
                      <p>{r.title}</p>
                    </div>
                    <div className="saved-actions">
                      <button className="saved-btn load" onClick={() => onLoad(r.id)}>Load</button>
                      <button className="saved-btn delete" onClick={() => onDelete(r.id)}>Delete</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

      </div>
    </div>
  );
}

export default Resume;