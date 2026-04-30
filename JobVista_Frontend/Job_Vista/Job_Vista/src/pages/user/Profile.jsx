import React, { useState, useEffect, useContext } from "react";
import axiosInstance from "../../api/axiosConfig";
import jobService from "../../api/jobService";
import profileService from "../../api/profileService";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [user, setUser] = useState({
    fullName: "", email: "", phone: "",
    skills: "", experience: "", education: "",
    careerGoal: "", profilePicture: "",
    companyName: "", companyEmail: "", companyLocation: "",
    companyWebsite: "", description: "", logoUrl: "",
  });
  const [role, setRole] = useState("USER");
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [activeTab, setActiveTab] = useState("profile");
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [companyPostedJobs, setCompanyPostedJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [postJobForm, setPostJobForm] = useState({ title: "", description: "", responsibilities: "", requirements: "", salaryMin: "", salaryMax: "", location: "", jobType: "FULL_TIME", experienceLevel: "ENTRY_LEVEL", applicationDeadline: "" });
  const token = localStorage.getItem("accessToken");

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const parseList = (v) => v ? v.split(",").map(s => s.trim()).filter(Boolean) : [];

  const avatarUrl = (u) =>
    u.profilePicture ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(u.fullName || "U")}&background=2563eb&color=fff&size=88&bold=true`;

  useEffect(() => {
    if (!token) { navigate("/login"); return; }

    const fetchProfile = async () => {
      try {
        const cached = localStorage.getItem("profileData");
        if (cached) {
          setUser(prev => ({ ...prev, ...JSON.parse(cached) }));
          setLoading(false);
        }
        const userRes = await profileService.getUserProfile();
        const userRole = userRes.role;
        setRole(userRole);

        let specificData = {};

        if (userRole === "COMPANY" || userRole === "ROLE_COMPANY") {
          try {
            const compRes = await profileService.getCompanyProfile();
            specificData = {
              companyId: compRes.companyId || "",
              companyName: compRes.companyName || "",
              companyEmail: compRes.companyEmail || "",
              companyLocation: compRes.location || "",
              companyWebsite: compRes.website || "",
              description: compRes.description || "",
              logoUrl: compRes.logoUrl || "",
            };

            // Fetch company jobs
            if (compRes.companyId) {
              const jobsRes = await axiosInstance.get(`/job/company/${compRes.companyId}?page=0&size=50`);
              setCompanyPostedJobs(jobsRes.data.content || []);
            }
          } catch (err) {
            console.log("No company profile yet");
          }
        } else {
          try {
            const seekerRes = await profileService.getSeekerProfile();
            specificData = {
              skills: seekerRes.skills || "",
              experience: seekerRes.experience?.toString() || "",
              education: seekerRes.education || "",
              careerGoal: seekerRes.profileSummary || "",
              location: seekerRes.location || "",
              resumeUrl: seekerRes.resumeUrl || "",
            };
          } catch (err) {
            console.log("No jobseeker profile yet");
          }
        }

        const merged = {
          fullName: userRes.name || "",
          email: userRes.email || "",
          phone: userRes.mobileNumber || "",
          profilePicture: userRes.profilePicture || "",
          ...specificData,
        };

        setUser(merged);
        localStorage.setItem("profileData", JSON.stringify(merged));

        try {
          const appRes = await jobService.getAppliedJobs({ page: 0, size: 50 });
          setAppliedJobs(appRes.content || []);
        } catch (err) {
          console.error("Error fetching applied jobs", err);
        }

        try {
          const savedRes = await jobService.getSavedJobs({ page: 0, size: 50 });
          setSavedJobs(savedRes.content || []);
        } catch (err) {
          console.error("Error fetching saved jobs", err);
        }

      } catch (err) {
        console.error("Error fetching profile", err);
        if (err.response?.status === 401) logout();
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchProfile();
  }, [token, logout, navigate]);

  const handleChange = (e) =>
    setUser(prev => ({ ...prev, [e.target.name]: e.target.value ?? "" }));

  const handleSave = async () => {
    try {
      await profileService.updateUserProfile({
        name: user.fullName,
        mobileNumber: user.phone,
      });

      if (role === "COMPANY" || role === "ROLE_COMPANY") {
        await profileService.updateCompanyProfile({
          companyName: user.companyName,
          companyEmail: user.companyEmail,
          location: user.companyLocation,
          website: user.companyWebsite,
          description: user.description,
          logoUrl: user.logoUrl,
        });
      } else {
        await profileService.updateSeekerProfile({
          skills: user.skills,
          experience: user.experience ? parseInt(user.experience) : null,
          education: user.education,
          location: user.location,
          profileSummary: user.careerGoal,
        });
      }

      localStorage.setItem("profileData", JSON.stringify(user));
      setEditing(false);
      showToast("Profile saved successfully! ✓");
    } catch (err) {
      showToast("Failed to save profile.");
    }
  };

  const handlePostJobChange = (e) => setPostJobForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handlePostJobSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title: postJobForm.title,
        description: postJobForm.description,
        responsibilities: postJobForm.responsibilities,
        requirements: postJobForm.requirements,
        salaryMin: parseInt(postJobForm.salaryMin),
        salaryMax: parseInt(postJobForm.salaryMax),
        location: postJobForm.location,
        jobType: postJobForm.jobType,
        experienceLevel: postJobForm.experienceLevel,
        applicationDeadline: postJobForm.applicationDeadline ? new Date(postJobForm.applicationDeadline).toISOString() : null,
      };
      await jobService.createJob(payload);
      showToast("Job posted successfully! ✓");
      setPostJobForm({ title: "", description: "", responsibilities: "", requirements: "", salaryMin: "", salaryMax: "", location: "", jobType: "FULL_TIME", experienceLevel: "ENTRY_LEVEL", applicationDeadline: "" });
      setActiveTab("manage");

      if (user.companyId) {
        const jobsRes = await axiosInstance.get(`/job/company/${user.companyId}?page=0&size=50`);
        setCompanyPostedJobs(jobsRes.data.content || []);
      }
    } catch (err) {
      showToast("Failed to post job.");
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete your account? This cannot be undone.")) return;
    try {
      await profileService.deleteAccount();
      localStorage.removeItem("profileData");
      logout();
    } catch (err) {
      showToast("Failed to delete account.");
    }
  };

  const handleViewApplicants = async (job) => {
    setSelectedJob(job);
    try {
      const res = await jobService.getJobApplicants(job.jobId, { page: 0, size: 50 });
      setApplicants(res.content || []);
    } catch (err) {
      showToast("Failed to fetch applicants");
    }
  };

  const handleUpdateStatus = async (appId, status) => {
    try {
      await jobService.updateApplicationStatus(appId, status);
      setApplicants(prev => prev.map(a => a.applicationId === appId ? { ...a, status } : a));
      showToast("Status updated");
    } catch (err) {
      showToast("Failed to update status");
    }
  };

  if (loading) return (
    <div style={S.page}>
      <div style={S.loading}>
        <div style={S.spinner} />
        Loading profile…
      </div>
    </div>
  );

  return (
    <div style={S.page}>
      <div style={S.wrapper}>

        {/* HERO */}
        <div style={S.hero}>
          <div style={S.heroTop}>
            <div style={{ position: "relative", flexShrink: 0 }}>
              <img src={avatarUrl(user)} alt="avatar" style={S.avatar} />
              <div style={S.avatarBadge} />
            </div>
            <div style={{ flex: 1, paddingTop: 4 }}>
              <h1 style={S.heroName}>{role === "COMPANY" || role === "ROLE_COMPANY" ? (user.companyName || user.fullName) : user.fullName || "Your Name"}</h1>
              <p style={S.heroEmail}>{role === "COMPANY" || role === "ROLE_COMPANY" ? (user.companyEmail || user.email) : user.email}</p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {[(role === "COMPANY" || role === "ROLE_COMPANY" ? "Company" : "Job Seeker"), (role === "COMPANY" || role === "ROLE_COMPANY" ? "Hiring" : "Open to Work")].map(t => (
                  <span key={t} style={S.tag}>{t}</span>
                ))}
              </div>
            </div>
            <div style={S.heroActions}>
              <button style={S.btnGhost} onClick={() => setEditing(!editing)}>
                {editing ? "✕ Cancel" : "✏ Edit Profile"}
              </button>
              <button style={S.btnDanger} onClick={handleDelete}>Delete</button>
            </div>
          </div>
          <div style={S.statsRow}>
            {role === "COMPANY" || role === "ROLE_COMPANY" ? [
              { num: user.companyLocation ? "✓" : "—", label: "Location" },
              { num: user.companyWebsite ? "✓" : "—", label: "Website" },
              { num: user.description ? "✓" : "—", label: "Desc" },
            ].map(({ num, label }) => (
              <div key={label} style={S.stat}>
                <div style={S.statNum}>{num}</div>
                <div style={S.statLabel}>{label}</div>
              </div>
            )) : [
              { num: parseList(user.skills).length, label: "Skills" },
              { num: user.experience ? "✓" : "—", label: "Experience" },
              { num: user.education ? "✓" : "—", label: "Education" },
            ].map(({ num, label }) => (
              <div key={label} style={S.stat}>
                <div style={S.statNum}>{num}</div>
                <div style={S.statLabel}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* EDIT BANNER */}
        {editing && (
          <div style={S.editBanner}>
            ✏️ &nbsp; You're in edit mode — make your changes and hit Save below.
          </div>
        )}

        {/* TABS */}
        <div style={S.tabs}>
          <button style={activeTab === 'profile' ? S.activeTab : S.tab} onClick={() => setActiveTab('profile')}>Profile Details</button>
          {role === "COMPANY" || role === "ROLE_COMPANY" ? (
            <>
              <button style={activeTab === 'manage' ? S.activeTab : S.tab} onClick={() => setActiveTab('manage')}>Manage Jobs</button>
              <button style={activeTab === 'post' ? S.activeTab : S.tab} onClick={() => setActiveTab('post')}>Post a Job</button>
            </>
          ) : (
            <>
              <button style={activeTab === 'applied' ? S.activeTab : S.tab} onClick={() => setActiveTab('applied')}>Applied Jobs</button>
              <button style={activeTab === 'saved' ? S.activeTab : S.tab} onClick={() => setActiveTab('saved')}>Saved Jobs</button>
            </>
          )}
        </div>

        {/* PROFILE TAB */}
        {activeTab === 'profile' && (
          <div style={S.grid}>

            {/* About / Description */}
            <div style={{ ...S.card, gridColumn: "1 / -1" }}>
              <CardHeader title={role === "COMPANY" || role === "ROLE_COMPANY" ? "Company Description" : "About"} icon="💼" />
              {editing
                ? <Field><textarea name={role === "COMPANY" || role === "ROLE_COMPANY" ? "description" : "careerGoal"} value={role === "COMPANY" || role === "ROLE_COMPANY" ? user.description : user.careerGoal} onChange={handleChange} rows={3} style={S.input} placeholder={role === "COMPANY" || role === "ROLE_COMPANY" ? "Describe your company..." : "Write about yourself..."} /></Field>
                : <p style={{ ...S.value, ...((role === "COMPANY" || role === "ROLE_COMPANY" ? user.description : user.careerGoal) ? {} : S.muted) }}>{(role === "COMPANY" || role === "ROLE_COMPANY" ? user.description : user.careerGoal) || "No description added yet."}</p>
              }
            </div>

            {role === "COMPANY" || role === "ROLE_COMPANY" ? (
              <>
                {/* Company Info */}
                <div style={S.card}>
                  <CardHeader title="Company Info" icon="🏢" />
                  <Field label="Company Name">
                    {editing ? <input name="companyName" value={user.companyName} onChange={handleChange} style={S.input} /> : <span style={S.value}>{user.companyName || <Muted>Not provided</Muted>}</span>}
                  </Field>
                  <Field label="Company Email">
                    {editing ? <input name="companyEmail" value={user.companyEmail} onChange={handleChange} style={S.input} /> : <span style={S.value}>{user.companyEmail || <Muted>Not provided</Muted>}</span>}
                  </Field>
                </div>

                {/* Location & Website */}
                <div style={S.card}>
                  <CardHeader title="Details" icon="📍" />
                  <Field label="Location">
                    {editing ? <input name="companyLocation" value={user.companyLocation} onChange={handleChange} style={S.input} /> : <span style={S.value}>{user.companyLocation || <Muted>Not provided</Muted>}</span>}
                  </Field>
                  <Field label="Website">
                    {editing ? <input name="companyWebsite" value={user.companyWebsite} onChange={handleChange} style={S.input} /> : <span style={S.value}>{user.companyWebsite || <Muted>Not provided</Muted>}</span>}
                  </Field>
                </div>
              </>
            ) : (
              <>
                {/* Contact */}
                <div style={S.card}>
                  <CardHeader title="Contact" icon="📞" />
                  <Field label="Phone">
                    {editing ? <input name="phone" value={user.phone} onChange={handleChange} style={S.input} placeholder="+91 00000 00000" /> : <span style={S.value}>{user.phone || <Muted>Not provided</Muted>}</span>}
                  </Field>
                  <Field label="Email">
                    <span style={S.value}>{user.email}</span>
                  </Field>
                </div>

                {/* Education */}
                <div style={S.card}>
                  <CardHeader title="Education" icon="🎓" />
                  <Field>
                    {editing ? <input name="education" value={user.education} onChange={handleChange} style={S.input} placeholder="Degree — University, Year" /> : <span style={{ ...S.value, ...(user.education ? {} : S.muted) }}>{user.education || "No education added"}</span>}
                  </Field>
                </div>

                {/* Skills */}
                <div style={{ ...S.card, gridColumn: "1 / -1" }}>
                  <CardHeader title="Skills" icon="⚡" />
                  {editing
                    ? <Field><input name="skills" value={user.skills} onChange={handleChange} style={S.input} placeholder="Java, React, Spring Boot…" /></Field>
                    : <div style={S.chips}>
                      {parseList(user.skills).length ? parseList(user.skills).map((sk, i) => <span key={i} style={S.chip}>{sk}</span>) : <span style={S.muted}>No skills added</span>}
                    </div>
                  }
                </div>

                {/* Experience */}
                <div style={{ ...S.card, gridColumn: "1 / -1" }}>
                  <CardHeader title="Experience" icon="🏢" />
                  {editing
                    ? <Field><textarea name="experience" value={user.experience} onChange={handleChange} rows={3} style={S.input} placeholder="Describe your experience..." /></Field>
                    : <p style={{ ...S.value, ...(user.experience ? {} : S.muted) }}>{user.experience || "No experience added"}</p>
                  }
                </div>
              </>
            )}

          </div>
        )}

        {/* APPLIED JOBS TAB */}
        {activeTab === 'applied' && (
          <div style={S.listContainer}>
            {appliedJobs.length === 0 ? <p style={S.empty}>No applied jobs found.</p> : appliedJobs.map(app => (
              <div key={app.applicationId} style={S.listItem}>
                <h4 style={{ margin: "0 0 5px 0", color: "#1e293b", fontSize: "16px" }}>{app.jobTitle} at {app.companyName}</h4>
                <p style={{ margin: "0 0 5px 0", color: "#64748b", fontSize: "14px" }}>Status: <strong style={{ color: app.status === 'PENDING' ? '#eab308' : '#3b82f6' }}>{app.status}</strong></p>
                <p style={{ margin: "0", color: "#94a3b8", fontSize: "12px" }}>Applied: {new Date(app.appliedAt).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        )}

        {/* SAVED JOBS TAB */}
        {activeTab === 'saved' && (
          <div style={S.listContainer}>
            {savedJobs.length === 0 ? <p style={S.empty}>No saved jobs found.</p> : savedJobs.map(job => (
              <div key={job.jobId} style={S.listItem}>
                <h4 style={{ margin: "0 0 5px 0", color: "#1e293b", fontSize: "16px" }}>{job.title} at {job.companyName}</h4>
                <p style={{ margin: "0 0 10px 0", color: "#64748b", fontSize: "14px" }}>Location: {job.location}</p>
                <button onClick={() => navigate('/jobs')} style={S.btnGhostDark}>View Jobs</button>
              </div>
            ))}
          </div>
        )}

        {/* MANAGE JOBS TAB (COMPANY) */}
        {activeTab === 'manage' && (
          <div style={S.listContainer}>
            {selectedJob ? (
              <div style={S.card}>
                <button onClick={() => setSelectedJob(null)} style={S.btnGhostDark}>&larr; Back to Jobs</button>
                <h3 style={{ marginTop: 15, marginBottom: 10 }}>Applicants for {selectedJob.title}</h3>
                {applicants.length === 0 ? <p style={S.empty}>No applicants yet.</p> : applicants.map(app => (
                  <div key={app.applicationId} style={{ ...S.listItem, marginBottom: 10 }}>
                    <h4 style={{ margin: "0 0 5px 0" }}>{app.jobSeekerName}</h4>
                    <p style={{ margin: "0 0 5px 0", fontSize: "14px" }}>Applied: {new Date(app.appliedAt).toLocaleDateString()}</p>
                    <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                      <select value={app.status} onChange={(e) => handleUpdateStatus(app.applicationId, e.target.value)} style={{ ...S.input, width: "auto", padding: "6px 10px" }}>
                        <option value="PENDING">Pending</option>
                        <option value="ACCEPTED">Accept</option>
                        <option value="REJECTED">Reject</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                {companyPostedJobs.length === 0 ? <p style={S.empty}>No jobs posted yet.</p> : companyPostedJobs.map(job => (
                  <div key={job.jobId} style={S.listItem}>
                    <h4 style={{ margin: "0 0 5px 0", color: "#1e293b", fontSize: "16px" }}>{job.title}</h4>
                    <p style={{ margin: "0 0 10px 0", color: "#64748b", fontSize: "14px" }}>{job.location} • {job.jobType}</p>
                    <button onClick={() => handleViewApplicants(job)} style={S.btnGhostDark}>View Applicants</button>
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        {/* POST JOB TAB (COMPANY) */}
        {activeTab === 'post' && (
          <div style={S.card}>
            <CardHeader title="Post a New Job" icon="📝" />
            <form onSubmit={handlePostJobSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <Field label="Job Title"><input required name="title" value={postJobForm.title} onChange={handlePostJobChange} style={S.input} placeholder="e.g. Senior Frontend Engineer" /></Field>
              <Field label="Description"><textarea required name="description" value={postJobForm.description} onChange={handlePostJobChange} rows={3} style={S.input} placeholder="Job description..." /></Field>
              <Field label="Responsibilities"><textarea name="responsibilities" value={postJobForm.responsibilities} onChange={handlePostJobChange} rows={3} style={S.input} placeholder="Key responsibilities..." /></Field>
              <Field label="Requirements"><textarea name="requirements" value={postJobForm.requirements} onChange={handlePostJobChange} rows={3} style={S.input} placeholder="Requirements/Qualifications..." /></Field>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <Field label="Min Salary"><input type="number" required name="salaryMin" value={postJobForm.salaryMin} onChange={handlePostJobChange} style={S.input} placeholder="e.g. 50000" /></Field>
                <Field label="Max Salary"><input type="number" required name="salaryMax" value={postJobForm.salaryMax} onChange={handlePostJobChange} style={S.input} placeholder="e.g. 80000" /></Field>
              </div>

              <Field label="Location"><input required name="location" value={postJobForm.location} onChange={handlePostJobChange} style={S.input} placeholder="Remote, New York, etc." /></Field>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <Field label="Job Type">
                  <select name="jobType" value={postJobForm.jobType} onChange={handlePostJobChange} style={S.input}>
                    <option value="FULL_TIME">Full Time</option><option value="PART_TIME">Part Time</option><option value="CONTRACT">Contract</option><option value="INTERNSHIP">Internship</option>
                  </select>
                </Field>
                <Field label="Experience Level">
                  <select name="experienceLevel" value={postJobForm.experienceLevel} onChange={handlePostJobChange} style={S.input}>
                    <option value="ENTRY_LEVEL">Entry Level</option><option value="MID_LEVEL">Mid Level</option><option value="SENIOR_LEVEL">Senior Level</option><option value="EXECUTIVE">Executive</option>
                  </select>
                </Field>
              </div>

              <Field label="Application Deadline (Optional)"><input type="date" name="applicationDeadline" value={postJobForm.applicationDeadline} onChange={handlePostJobChange} style={S.input} /></Field>

              <button type="submit" style={{ ...S.btnSave, marginTop: 10 }}>Post Job</button>
            </form>
          </div>
        )}

        {/* SAVE */}
        {editing && (
          <div style={{ display: "flex", gap: 10 }}>
            <button style={S.btnSave} onClick={handleSave}>Save Changes</button>
            <button style={S.btnCancel} onClick={() => setEditing(false)}>Cancel</button>
          </div>
        )}

        {/* TOAST */}
        {toast && <div style={S.toast}>{toast}</div>}
      </div>
    </div>
  );
};

// ── Sub-components ──
const CardHeader = ({ title, icon }) => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
    <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#94a3b8" }}>{title}</span>
    <span style={{ width: 32, height: 32, borderRadius: 8, background: "#dbeafe", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>{icon}</span>
  </div>
);

const Field = ({ label, children }) => (
  <div style={{ marginBottom: 14 }}>
    {label && <div style={{ fontSize: 11, fontWeight: 500, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>{label}</div>}
    {children}
  </div>
);

const Muted = ({ children }) => <span style={{ color: "#94a3b8", fontStyle: "italic" }}>{children}</span>;

// ── Styles ──
const S = {
  page: { background: "#f0f4f8", minHeight: "100vh", padding: "36px 20px 60px", display: "flex", justifyContent: "center", fontFamily: "'Poppins', sans-serif" },
  wrapper: { width: "100%", maxWidth: 860 },
  loading: { display: "flex", alignItems: "center", justifyContent: "center", minHeight: 300, gap: 10, color: "#94a3b8", fontSize: 15 },
  spinner: { width: 20, height: 20, border: "2px solid #e2e8f0", borderTopColor: "#2563eb", borderRadius: "50%", animation: "spin 0.7s linear infinite" },
  hero: { background: "linear-gradient(135deg,#1e3a8a 0%,#2563eb 60%,#3b82f6 100%)", borderRadius: 24, padding: "36px 36px 0", marginBottom: 20, boxShadow: "0 8px 32px rgba(37,99,235,0.15)" },
  heroTop: { display: "flex", alignItems: "flex-start", gap: 24 },
  avatar: { width: 88, height: 88, borderRadius: 20, objectFit: "cover", border: "3px solid rgba(255,255,255,0.3)" },
  avatarBadge: { position: "absolute", bottom: -4, right: -4, width: 22, height: 22, background: "#22c55e", borderRadius: "50%", border: "3px solid #1e3a8a" },
  heroName: { fontFamily: "'Poppins', sans-serif", fontSize: 26, fontWeight: 800, color: "#fff", letterSpacing: -0.5, marginBottom: 4 },
  heroEmail: { fontSize: 14, color: "rgba(255,255,255,0.65)", marginBottom: 12 },
  tag: { fontSize: 12, fontWeight: 500, padding: "4px 10px", borderRadius: 20, background: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.85)", border: "1px solid rgba(255,255,255,0.15)" },
  heroActions: { display: "flex", gap: 10, flexShrink: 0 },
  btnGhost: { fontFamily: "'Poppins', sans-serif", fontSize: 13, fontWeight: 500, padding: "9px 18px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.12)", color: "#fff", cursor: "pointer" },
  btnDanger: { fontFamily: "'Poppins', sans-serif", fontSize: 13, fontWeight: 500, padding: "9px 18px", borderRadius: 10, border: "1px solid rgba(220,38,38,0.25)", background: "rgba(220,38,38,0.18)", color: "#fca5a5", cursor: "pointer" },
  statsRow: { display: "flex", marginTop: 28, borderTop: "1px solid rgba(255,255,255,0.1)" },
  stat: { flex: 1, padding: "16px 0", textAlign: "center", borderRight: "1px solid rgba(255,255,255,0.1)" },
  statNum: { fontFamily: "'Poppins', sans-serif", fontSize: 22, fontWeight: 800, color: "#fff", lineHeight: 1, marginBottom: 3 },
  statLabel: { fontSize: 11, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.06em" },
  grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 },
  card: { background: "#fff", borderRadius: 18, padding: 24, boxShadow: "0 1px 3px rgba(0,0,0,0.06),0 4px 16px rgba(0,0,0,0.04)", border: "1px solid #e2e8f0" },
  editBanner: { display: "flex", alignItems: "center", gap: 10, background: "#dbeafe", border: "1px solid rgba(37,99,235,0.2)", borderRadius: 12, padding: "12px 18px", marginBottom: 16, fontSize: 13, color: "#1d4ed8", fontWeight: 500 },
  input: { width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid #e2e8f0", fontFamily: "'Poppins', sans-serif", fontSize: 14, color: "#0f172a", background: "#f8fafc", outline: "none", resize: "vertical" },
  chips: { display: "flex", flexWrap: "wrap", gap: 8 },
  chip: { fontSize: 13, fontWeight: 500, padding: "6px 14px", borderRadius: 20, background: "#dbeafe", color: "#1d4ed8", border: "1px solid rgba(37,99,235,0.15)" },
  value: { fontSize: 15, color: "#0f172a", lineHeight: 1.5 },
  muted: { color: "#94a3b8", fontStyle: "italic", fontSize: 14 },
  btnSave: { flex: 1, padding: 14, background: "#16a34a", color: "#fff", fontFamily: "'Poppins', sans-serif", fontSize: 15, fontWeight: 700, border: "none", borderRadius: 14, cursor: "pointer", boxShadow: "0 4px 16px rgba(22,163,74,0.25)" },
  btnCancel: { padding: "14px 24px", background: "#f8fafc", color: "#475569", fontFamily: "'Poppins', sans-serif", fontSize: 14, border: "1.5px solid #e2e8f0", borderRadius: 14, cursor: "pointer" },
  toast: { position: "fixed", bottom: 28, left: "50%", transform: "translateX(-50%)", background: "#0f172a", color: "#fff", padding: "12px 24px", borderRadius: 12, fontSize: 14, fontWeight: 500, zIndex: 9999, boxShadow: "0 8px 24px rgba(0,0,0,0.2)" },
  tabs: { display: "flex", gap: 10, marginBottom: 20, borderBottom: "1px solid #e2e8f0", paddingBottom: 10 },
  tab: { background: "transparent", border: "none", fontSize: 15, fontWeight: 600, color: "#94a3b8", cursor: "pointer", padding: "10px 15px" },
  activeTab: { background: "transparent", border: "none", fontSize: 15, fontWeight: 700, color: "#1d4ed8", cursor: "pointer", padding: "10px 15px", borderBottom: "2px solid #1d4ed8" },
  listContainer: { display: "flex", flexDirection: "column", gap: 15 },
  listItem: { background: "#fff", borderRadius: 12, padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.06)", border: "1px solid #e2e8f0" },
  empty: { textAlign: "center", color: "#94a3b8", marginTop: 40, fontStyle: "italic" },
  btnGhostDark: { fontFamily: "'Poppins', sans-serif", fontSize: 13, fontWeight: 500, padding: "6px 14px", borderRadius: 8, border: "1px solid #cbd5e1", background: "#f8fafc", color: "#334155", cursor: "pointer", marginTop: 10 },
};

export default Profile;