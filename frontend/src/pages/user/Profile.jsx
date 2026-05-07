import React, { useState, useEffect, useContext } from "react";
import axiosInstance from "../../api/axiosConfig";
import jobService from "../../api/jobService";
import profileService from "../../api/profileService";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { 
  User, Mail, Phone, MapPin, Briefcase, GraduationCap, 
  Code, Star, Check, Trash2, Edit3, Clock, 
  AlertCircle, ChevronRight, ShieldCheck, FileText, Bookmark,
  Award, Globe, Target
} from "lucide-react";

const Profile = () => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  // 1. State Management
  const [user, setUser] = useState({
    fullName: "", email: "", phone: "", skills: "", 
    experience: "", education: "", careerGoal: "", 
    profilePicture: "", location: "", resumeUrl: ""
  });
  const [role, setRole] = useState("USER");
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const token = localStorage.getItem("accessToken");

  // 2. Utility Functions
  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const parseList = (v) => v ? v.split(",").map(s => s.trim()).filter(Boolean) : [];

  const getProfileProgress = () => {
    let fields = [user.fullName, user.phone, user.skills, user.experience, user.education, user.careerGoal, user.location];
    let completed = fields.filter(f => f && f.toString().length > 0).length;
    return Math.round((completed / fields.length) * 100);
  };

  // 3. Lifecycle & Data Fetching
  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const userRes = await profileService.getUserProfile();
        setRole(userRes.role);

        let specificData = {};
        if (userRes.role === "USER" || userRes.role === "ROLE_USER") {
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
          } catch (err) { console.log("No seeker profile"); }
        }

        setUser({
          fullName: userRes.name || "",
          email: userRes.email || "",
          phone: userRes.mobileNumber || "",
          profilePicture: userRes.profilePicture || "",
          ...specificData,
        });
        
        if (userRes.role === "USER" || userRes.role === "ROLE_USER") {
          jobService.getAppliedJobs({ page: 0, size: 50 }).then(res => setAppliedJobs(res.content || []));
          jobService.getSavedJobs({ page: 0, size: 50 }).then(res => setSavedJobs(res.content || []));
        }
      } catch (err) {
        if (err.response?.status === 401) logout();
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [token, logout, navigate]);

  // 4. Action Handlers
  const handleChange = (e) => setUser(prev => ({ ...prev, [e.target.name]: e.target.value ?? "" }));

  const handleSave = async () => {
    try {
      await profileService.updateUserProfile({ name: user.fullName, mobileNumber: user.phone });
      await profileService.updateSeekerProfile({
        skills: user.skills,
        experience: user.experience ? parseInt(user.experience) : null,
        education: user.education,
        location: user.location,
        profileSummary: user.careerGoal,
      });
      setEditing(false);
      showToast("Career profile synchronized!");
    } catch (err) {
      showToast("Update failed.", "error");
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const formData = new FormData();
    formData.append("file", file);
    
    try {
      showToast("Uploading professional headshot...", "success");
      const res = await axiosInstance.post("/users/upload-photo", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setUser(prev => ({ ...prev, profilePicture: res.data }));
      showToast("Profile image deployed!");
    } catch (err) {
      showToast("Upload failed. Ensure file is an image.", "error");
    }
  };

  const handleCoverUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    try {
      showToast("Updating career banner...", "success");
      const res = await axiosInstance.post("/users/upload-cover", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setUser(prev => ({ ...prev, coverPhoto: res.data }));
      showToast("Professional banner deployed!");
    } catch (err) {
      showToast("Banner upload failed.", "error");
    }
  };

  const getProfileImageUrl = (filename) => {
    if (!filename) return `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName || "U")}&background=2563eb&color=fff&size=120&bold=true`;
    if (filename.startsWith("http")) return filename;
    const baseUrl = import.meta.env.VITE_IMAGE_BASE_URL || "http://localhost:8080";
    return `${baseUrl}/uploads/profiles/${filename}`;
  };

  const getCoverImageUrl = (filename) => {
    if (!filename) return null;
    if (filename.startsWith("http")) return filename;
    const baseUrl = import.meta.env.VITE_IMAGE_BASE_URL || "http://localhost:8080";
    return `${baseUrl}/uploads/banners/${filename}`;
  };

  // 5. Structural Sub-Renderers
  const renderSidebar = () => (
    <aside className="dashboard-section" style={{ position: "sticky", top: "100px", padding: "32px", height: "fit-content" }}>
      <div style={{ textAlign: "center", marginBottom: "32px" }}>
        <div style={{ position: "relative", display: "inline-block", cursor: "pointer" }} onClick={() => document.getElementById("photo-upload").click()}>
          <img 
            src={getProfileImageUrl(user.profilePicture)} 
            alt="avatar" 
            style={{ width: "120px", height: "120px", borderRadius: "30px", objectFit: "cover", border: "4px solid white", boxShadow: "var(--card-shadow)", transition: "var(--transition)" }} 
            className="profile-img-hover"
          />
          <div style={{ 
            position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)", 
            borderRadius: "30px", display: "flex", alignItems: "center", 
            justifyContent: "center", opacity: 0, transition: "0.3s ease",
            color: "white"
          }} className="upload-overlay">
            <Edit3 size={24} />
          </div>
          <input type="file" id="photo-upload" hidden accept="image/*" onChange={handlePhotoUpload} />
        </div>
        <h2 style={{ marginTop: "20px", marginBottom: "4px" }}>{user.fullName || "User"}</h2>
        <div className="comp-badge" style={{ background: "rgba(37,99,235,0.08)", color: "var(--primary)", fontSize: "0.7rem", marginBottom: "16px" }}>
          {role.replace("ROLE_", "")}
        </div>
        
        <button 
          className={`admin-btn ${editing ? "danger" : "primary"}`} 
          onClick={() => { setEditing(!editing); setActiveTab("overview"); }}
          style={{ width: "100%", justifyContent: "center", padding: "12px", borderRadius: "14px" }}
        >
          {editing ? <><Clock size={16} /> Stop Editing</> : <><Edit3 size={16} /> Edit Profile</>}
        </button>
      </div>

      <div style={{ marginBottom: "32px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "0.8rem", fontWeight: 700 }}>
          <span>Profile Strength</span>
          <span>{getProfileProgress()}%</span>
        </div>
        <div style={{ height: "6px", background: "var(--bg-accent)", borderRadius: "10px", overflow: "hidden" }}>
          <div style={{ width: `${getProfileProgress()}%`, height: "100%", background: "var(--primary-gradient)", transition: "width 0.5s ease" }} />
        </div>
      </div>

      <nav style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {[
          { id: "overview", label: "Overview", icon: <User size={18} /> },
          { id: "applied", label: "Applications", icon: <FileText size={18} />, count: appliedJobs.length },
          { id: "saved", label: "Wishlist", icon: <Bookmark size={18} />, count: savedJobs.length },
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`admin-btn ${activeTab === tab.id ? "primary" : "edit"}`}
            style={{ justifyContent: "space-between", width: "100%", border: "none" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>{tab.icon} {tab.label}</div>
            {tab.count !== undefined && <span style={{ fontSize: "0.7rem", opacity: 0.8 }}>{tab.count}</span>}
          </button>
        ))}
      </nav>
    </aside>
  );

  const renderOverview = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
      {/* 1. Hero Profile Banner Section */}
      <section className="dashboard-section" style={{ padding: 0, overflow: "hidden", border: "none", background: "white", borderRadius: "32px" }}>
        <div 
          style={{ 
            height: "200px", 
            background: user.coverPhoto ? `url(${getCoverImageUrl(user.coverPhoto)}) center/cover no-repeat` : "var(--primary-gradient)", 
            position: "relative",
            cursor: "pointer"
          }} 
          onClick={() => document.getElementById("cover-upload").click()}
        >
          <div style={{ position: "absolute", inset: 0, opacity: 0.1, backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "24px 24px" }} />
          <div style={{ 
            position: "absolute", inset: 0, background: "rgba(0,0,0,0.2)", 
            display: "flex", alignItems: "center", justifyContent: "center", 
            opacity: 0, transition: "0.3s ease", color: "white"
          }} className="upload-overlay">
            <Edit3 size={32} />
          </div>
          <input type="file" id="cover-upload" hidden accept="image/*" onChange={handleCoverUpload} />
        </div>
        <div style={{ padding: "0 40px 40px", marginTop: "-40px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <div style={{ position: "relative" }}>
              <img 
                src={getProfileImageUrl(user.profilePicture)} 
                alt="avatar" 
                style={{ width: "100px", height: "100px", borderRadius: "24px", border: "6px solid white", boxShadow: "var(--shadow-lg)", objectFit: "cover" }} 
              />
            </div>
            <button className="admin-btn edit" onClick={() => setEditing(!editing)} style={{ marginBottom: "10px", borderRadius: "12px", background: "var(--bg-accent)", color: "var(--primary)" }}>
              {editing ? "Cancel Changes" : <><Edit3 size={16} /> Customize Profile</>}
            </button>
          </div>
          
          <div style={{ marginTop: "24px" }}>
            <h1 style={{ margin: 0, fontSize: "2rem", letterSpacing: "-1px" }}>{user.fullName || "Elite Professional"}</h1>
            <p style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: 600, color: "var(--primary)", marginTop: "4px" }}>
              <Globe size={16} /> {user.location || "Global Talent"} • {user.experience || "0"} Years Experience
            </p>
          </div>
        </div>
      </section>

      {/* 2. Professional Narrative & Contact */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "32px" }}>
        <section className="dashboard-section" style={{ padding: "40px", flex: 1 }}>
          <h3 style={{ margin: "0 0 24px", display: "flex", alignItems: "center", gap: "12px" }}>
            <FileText size={20} color="var(--primary)" /> Professional Summary
          </h3>
          {editing ? (
            <textarea className="comp-input" name="careerGoal" value={user.careerGoal} onChange={handleChange} rows={6} style={{ resize: "none", background: "var(--bg-accent)", border: "none" }} placeholder="Describe your professional journey and aspirations..." />
          ) : (
            <p style={{ lineHeight: 1.8, color: "var(--text-muted)", fontSize: "1.05rem" }}>
              {user.careerGoal || "Establish your career narrative to attract top-tier opportunities and showcase your professional vision."}
            </p>
          )}
        </section>

        <section className="dashboard-section" style={{ padding: "40px" }}>
          <h3 style={{ margin: "0 0 24px", display: "flex", alignItems: "center", gap: "12px" }}>
            <Phone size={20} color="var(--primary)" /> Quick Contact
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {[
              { icon: <Mail size={16} />, label: "Email Address", value: user.email, name: "email", readonly: true },
              { icon: <Phone size={16} />, label: "Contact Number", value: user.phone, name: "phone" }
            ].map((item, idx) => (
              <div key={idx}>
                <label style={{ fontSize: "0.7rem", fontWeight: 800, color: "var(--text-light)", textTransform: "uppercase", marginBottom: "6px", display: "block" }}>{item.label}</label>
                {editing && !item.readonly ? (
                  <input className="comp-input" name={item.name} value={item.value} onChange={handleChange} style={{ background: "var(--bg-accent)", border: "none" }} />
                ) : (
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", fontWeight: 700 }}>
                    <span style={{ color: "var(--primary)" }}>{item.icon}</span> {item.value || "Not linked"}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* 3. Skill Repository */}
      <section className="dashboard-section" style={{ padding: "40px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
          <h3 style={{ margin: 0, display: "flex", alignItems: "center", gap: "12px" }}>
            <Target size={20} color="var(--primary)" /> Core Competencies
          </h3>
          <span className="comp-badge" style={{ background: "var(--bg-accent)", color: "var(--primary)" }}>{parseList(user.skills).length} Specialized Skills</span>
        </div>
        
        {editing ? (
          <input className="comp-input" name="skills" value={user.skills} onChange={handleChange} placeholder="React, Java, Cloud Computing, etc." style={{ background: "var(--bg-accent)", border: "none" }} />
        ) : (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
            {parseList(user.skills).length > 0 ? parseList(user.skills).map((skill, i) => (
              <div key={i} style={{ 
                background: "white", 
                border: "1px solid var(--border-color)", 
                padding: "12px 20px", 
                borderRadius: "16px", 
                display: "flex", 
                alignItems: "center", 
                gap: "10px",
                boxShadow: "var(--shadow-sm)",
                transition: "var(--transition)"
              }} className="skill-tag-hover">
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--primary)" }} />
                <span style={{ fontWeight: 700, fontSize: "0.9rem" }}>{skill}</span>
              </div>
            )) : <p style={{ color: "var(--text-light)" }}>Add skills to highlight your expertise.</p>}
          </div>
        )}
      </section>

      {/* 4. Timeline Sections */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px" }}>
        <section className="dashboard-section" style={{ padding: "40px" }}>
          <h3 style={{ margin: "0 0 32px", display: "flex", alignItems: "center", gap: "12px" }}>
            <GraduationCap size={20} color="var(--primary)" /> Academic Pedigree
          </h3>
          <div style={{ position: "relative", paddingLeft: "24px", borderLeft: "2px dashed var(--border-color)" }}>
            <div style={{ position: "absolute", left: "-9px", top: 0, width: "16px", height: "16px", borderRadius: "50%", background: "var(--primary)", border: "4px solid white" }} />
            {editing ? (
              <textarea className="comp-input" name="education" value={user.education} onChange={handleChange} rows={3} style={{ background: "var(--bg-accent)", border: "none" }} />
            ) : (
              <div>
                <p style={{ fontWeight: 800, fontSize: "1.1rem", margin: "0 0 8px" }}>Academic Qualifications</p>
                <p style={{ color: "var(--text-muted)", lineHeight: 1.6 }}>{user.education || "Highlight your educational background and certifications."}</p>
              </div>
            )}
          </div>
        </section>

        <section className="dashboard-section" style={{ padding: "40px" }}>
          <h3 style={{ margin: "0 0 32px", display: "flex", alignItems: "center", gap: "12px" }}>
            <Briefcase size={20} color="var(--primary)" /> Industry Tenure
          </h3>
          <div style={{ position: "relative", paddingLeft: "24px", borderLeft: "2px dashed var(--border-color)" }}>
            <div style={{ position: "absolute", left: "-9px", top: 0, width: "16px", height: "16px", borderRadius: "50%", background: "var(--primary)", border: "4px solid white" }} />
            {editing ? (
              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <input className="comp-input" type="number" name="experience" value={user.experience} onChange={handleChange} style={{ background: "var(--bg-accent)", border: "none", width: "100px" }} />
                <span style={{ fontWeight: 700 }}>Years of Industry Experience</span>
              </div>
            ) : (
              <div>
                <p style={{ fontWeight: 800, fontSize: "1.1rem", margin: "0 0 8px" }}>Professional Experience</p>
                <p style={{ color: "var(--text-muted)", fontSize: "1.05rem", fontWeight: 600 }}>{user.experience ? `${user.experience} Years in the Industry` : "Showcase your professional timeline."}</p>
              </div>
            )}
          </div>
        </section>
      </div>

      {editing && (
        <button className="admin-btn primary" onClick={handleSave} style={{ padding: "20px", width: "100%", borderRadius: "20px", fontSize: "1.1rem", boxShadow: "0 20px 40px rgba(37, 99, 235, 0.2)" }}>
          <Check size={24} /> Deploy Profile Updates
        </button>
      )}
    </div>
  );

  const renderApplications = () => (
    <section className="dashboard-section" style={{ padding: "40px" }}>
      <h2 style={{ margin: "0 0 32px", display: "flex", alignItems: "center", gap: "12px" }}><FileText size={24} color="var(--primary)" /> Application History</h2>
      {appliedJobs.length === 0 ? (
        <div className="comp-empty"><AlertCircle size={40} /><p>No active applications.</p></div>
      ) : (
        <div className="data-table-container">
          <table className="data-table">
            <thead><tr><th>Job Role</th><th>Company</th><th>Status</th><th>Date</th></tr></thead>
            <tbody>
              {appliedJobs.map(app => (
                <tr key={app.applicationId}>
                  <td style={{ fontWeight: 700 }}>{app.jobTitle}</td>
                  <td>{app.companyName}</td>
                  <td>
                    <span className="comp-badge" style={{ 
                      background: app.status === "HIRED" ? "rgba(16,185,129,0.1)" : "rgba(37,99,235,0.1)",
                      color: app.status === "HIRED" ? "#10b981" : "#2563eb"
                    }}>{app.status}</span>
                  </td>
                  <td>{new Date(app.appliedAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );

  const renderWishlist = () => (
    <section className="dashboard-section" style={{ padding: "40px" }}>
      <h2 style={{ margin: "0 0 32px", display: "flex", alignItems: "center", gap: "12px" }}><Bookmark size={24} color="var(--primary)" /> Career Wishlist</h2>
      {savedJobs.length === 0 ? (
        <div className="comp-empty"><Star size={40} /><p>No opportunities saved.</p></div>
      ) : (
        <div className="data-table-container">
          <table className="data-table">
            <thead><tr><th>Title</th><th>Organization</th><th>Location</th><th>Action</th></tr></thead>
            <tbody>
              {savedJobs.map(job => (
                <tr key={job.jobId}>
                  <td style={{ fontWeight: 700 }}>{job.title}</td>
                  <td>{job.companyName}</td>
                  <td><MapPin size={14} /> {job.location || "Remote"}</td>
                  <td><button className="admin-btn edit" onClick={() => navigate('/jobs')}><ChevronRight size={16} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );

  // 6. Final Assembly
  if (loading) return (
    <div className="comp-empty" style={{ minHeight: "80vh" }}><Clock className="animate-spin" size={40} /><p>Assembling your dashboard...</p></div>
  );

  return (
    <div className="admin-main" style={{ padding: "100px 60px 60px", background: "var(--bg-main)", minHeight: "100vh" }}>
      {toast && (
        <div className={`comp-toast ${toast.type}`} style={{ zIndex: 1000 }}>
          <Check size={18} /> {toast.msg}
        </div>
      )}
      
      <div className="profile-dashboard-layout" style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", 
        gap: "32px", 
        alignItems: "start",
        maxWidth: "1400px",
        margin: "0 auto"
      }}>
        {/* Force the layout to be 320px 1fr on large screens via a media-query-like approach or just a refined grid */}
        <div style={{ display: "grid", gridTemplateColumns: "minmax(300px, 320px) 1fr", gap: "32px", width: "100%", gridColumn: "1 / -1" }}>
          {renderSidebar()}
          <main style={{ minWidth: 0 }}>
            {activeTab === "overview" && renderOverview()}
            {activeTab === "applied" && renderApplications()}
            {activeTab === "saved" && renderWishlist()}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Profile;
