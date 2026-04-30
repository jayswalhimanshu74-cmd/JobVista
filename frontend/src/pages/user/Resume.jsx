import React, { useEffect, useState } from "react";
import "../../styles/resume.css";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const emptyResume = {
  id: null,
  name: "",
  email: "",
  title: "",
  summary: "",
  education: "",
  experience: "",
  skills: "",
};

function validateResume(r) {
  const issues = [];
  if (!r.name || r.name.trim().length < 2) issues.push("Your name is too short");
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!r.email || !emailRe.test(r.email)) issues.push("Enter a valid email");
  if (!r.title || r.title.trim().length < 2) issues.push("Add a professional title");
  const summaryWords = (r.summary || "").trim().split(/\s+/).filter(Boolean).length;
  if (summaryWords < 15) issues.push("Summary should be at least 15 words");
  if (!r.skills || r.skills.trim().length < 3) issues.push("List some skills");
  return issues;
}

function loadSaved() {
  try {
    const raw = localStorage.getItem("jobvista_resumes_v1");
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveAll(list) {
  localStorage.setItem("jobvista_resumes_v1", JSON.stringify(list));
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

  const onValidate = () => {
    const found = validateResume(form);
    setIssues(found);
    setMessage(found.length === 0 ? "Resume looks valid ✅" : "Found issues");
  };

  const onSave = () => {
    const found = validateResume(form);
    setIssues(found);
    if (found.length > 0) {
      setMessage("Fix issues first");
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
    setMessage("Saved");
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
      setMessage("Loaded");
    }
  };

  const onDelete = (id) => {
    const all = resumes.filter((r) => r.id !== id);
    setResumes(all);
    saveAll(all);
    if (form.id === id) setForm(emptyResume);
  };

  // ✅ PDF DOWNLOAD FUNCTION
  const downloadPDF = async () => {
    const element = document.getElementById("resumePreview");

    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");

    const imgWidth = 210;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
    pdf.save(`${form.name || "resume"}.pdf`);
  };

  return (
    <div className="resume-page">
      <h1 className="resume-title">Resume Builder</h1>

      <div className="resume-container">

        {/* LEFT SIDE */}
        <section className="resume-card">
          <h2>Create Resume</h2>

          <div className="form-grid">

            <div className="form-row">
              <label>Name</label>
              <input name="name" value={form.name} onChange={onChange} />
            </div>

            <div className="form-row">
              <label>Email</label>
              <input name="email" value={form.email} onChange={onChange} />
            </div>

            <div className="form-row full">
              <label>Title</label>
              <input name="title" value={form.title} onChange={onChange} />
            </div>

            <div className="form-row full">
              <label>Summary</label>
              <textarea name="summary" value={form.summary} onChange={onChange} />
            </div>

            <div className="form-row full">
              <label>Education</label>
              <textarea name="education" value={form.education} onChange={onChange} />
            </div>

            <div className="form-row full">
              <label>Experience</label>
              <textarea name="experience" value={form.experience} onChange={onChange} />
            </div>

            <div className="form-row full">
              <label>Skills</label>
              <input name="skills" value={form.skills} onChange={onChange} />
            </div>

          </div>

          <div className="form-actions">
            <button className="btn primary" onClick={onValidate}>Validate</button>
            <button className="btn" onClick={onSave}>Save</button>
            <button className="btn" onClick={onNew}>New</button>
            <button className="btn primary" onClick={downloadPDF}>
              Download PDF
            </button>
          </div>

          <div className="status">
            {message && <div className="message">{message}</div>}
            {issues.length > 0 && (
              <ul className="issues">
                {issues.map((it, i) => <li key={i}>{it}</li>)}
              </ul>
            )}
          </div>
        </section>

        {/* RIGHT SIDE */}
        <aside className="tracker-card">

          {/* 🔥 RESUME PREVIEW */}
          <div id="resumePreview" className="resume-preview">
            <h1>{form.name}</h1>
            <h3>{form.title}</h3>
            <p>{form.email}</p>

            <h4>Summary</h4>
            <p>{form.summary}</p>

            <h4>Education</h4>
            <p>{form.education}</p>

            <h4>Experience</h4>
            <p>{form.experience}</p>

            <h4>Skills</h4>
            <p>{form.skills}</p>
          </div>

          <h2>Saved</h2>

          {resumes.map((r) => (
            <div key={r.id} className="resume-item">
              <div>
                <div className="name">{r.name}</div>
                <div className="muted">{r.title}</div>
              </div>

              <div className="actions">
                <button onClick={() => onLoad(r.id)}>Load</button>
                <button onClick={() => onDelete(r.id)}>Delete</button>
              </div>
            </div>
          ))}

        </aside>

      </div>
    </div>
  );
}

export default Resume;