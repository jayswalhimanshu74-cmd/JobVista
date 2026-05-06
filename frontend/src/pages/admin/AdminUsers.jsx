import React, { useState, useEffect } from "react";
import axiosInstance from "../../api/axiosConfig";
import { 
  Users, 
  UserCheck, 
  ShieldCheck, 
  Clock, 
  AlertCircle, 
  Check, 
  Mail, 
  Phone,
  Search,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterRole, setFilterRole] = useState("");
  const [page, setPage] = useState(0);
  const [toast, setToast] = useState(null);
  const PAGE_SIZE = 10;

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/users");
      setUsers(res.data || []);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error("Failed to fetch users", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (d) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-US", {
      day: "2-digit", month: "short", year: "numeric",
    });
  };

  const formatEnum = (str) => {
    if (!str) return "—";
    return str
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  const filteredUsers = filterRole
    ? users.filter((u) => u.role === filterRole)
    : users;

  // Pagination Logic
  const totalPages = Math.ceil(filteredUsers.length / PAGE_SIZE);
  const paginatedUsers = filteredUsers.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  useEffect(() => {
    setPage(0);
  }, [filterRole]);

  const renderPaginationButtons = () => {
    const buttons = [];
    const maxVisible = 5;
    let start = Math.max(0, page - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible);
    if (end - start < maxVisible) start = Math.max(0, end - maxVisible);

    for (let i = start; i < end; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => {
            setPage(i);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          style={{
            width: "40px", height: "40px", borderRadius: "10px", border: "none",
            background: i === page ? "var(--primary-gradient)" : "var(--bg-accent)",
            color: i === page ? "white" : "var(--text-main)",
            fontWeight: 800, cursor: "pointer", transition: "var(--transition)"
          }}
        >
          {i + 1}
        </button>
      );
    }
    return buttons;
  };

  const roleCounts = users.reduce((acc, u) => {
    acc[u.role] = (acc[u.role] || 0) + 1;
    return acc;
  }, {});

  const ROLE_CONFIG = {
    USER: { label: "Job Seekers", icon: <Users size={20} />, color: "#2563eb" },
    COMPANY: { label: "Companies", icon: <UserCheck size={20} />, color: "#7c3aed" },
    ADMIN: { label: "Admins", icon: <ShieldCheck size={20} />, color: "#10b981" },
  };

  return (
    <div className="admin-users-content">
      {toast && (
        <div className={`comp-toast ${toast.type}`}>
          {toast.type === "success" ? <Check size={18} /> : <AlertCircle size={18} />}
          {toast.msg}
        </div>
      )}

      <header className="dashboard-header">
        <h1>User Directory</h1>
        <p>Comprehensive management of all platform participants and permissions</p>
      </header>

      {/* Role Stats Grid */}
      <div className="stats-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)", marginBottom: "32px" }}>
        <div 
          className={`stat-card ${filterRole === "" ? "active" : ""}`} 
          onClick={() => setFilterRole("")}
          style={{ cursor: "pointer", border: filterRole === "" ? "2px solid var(--primary)" : "" }}
        >
          <div className="stat-content">
            <h3>Total Users</h3>
            <p className="stat-value" style={{ fontSize: "1.5rem" }}>{users.length}</p>
          </div>
        </div>
        {Object.entries(ROLE_CONFIG).map(([role, cfg]) => (
          <div 
            key={role} 
            className={`stat-card ${filterRole === role ? "active" : ""}`} 
            onClick={() => setFilterRole(role)}
            style={{ cursor: "pointer", border: filterRole === role ? `2px solid ${cfg.color}` : "" }}
          >
            <div className="stat-content">
              <h3>{cfg.label}</h3>
              <p className="stat-value" style={{ fontSize: "1.5rem" }}>{roleCounts[role] || 0}</p>
            </div>
          </div>
        ))}
      </div>

      <section className="dashboard-section" style={{ padding: "0 40px 40px" }}>
        <div className="section-title-wrapper" style={{ padding: "40px 0 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ margin: 0 }}>
            <Users size={22} style={{ color: "var(--primary)", marginRight: "12px" }} />
            {filterRole ? `${ROLE_CONFIG[filterRole].label}` : "Global Directory"} ({filteredUsers.length})
          </h2>
          <div className="filter-actions">
            <select 
              value={filterRole} 
              onChange={(e) => setFilterRole(e.target.value)}
              style={{ padding: "8px 16px", borderRadius: "10px", border: "1.5px solid var(--border-color)", fontWeight: 700 }}
            >
              <option value="">All Roles</option>
              {Object.entries(ROLE_CONFIG).map(([role, cfg]) => (
                <option key={role} value={role}>{cfg.label}</option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="comp-empty" style={{ padding: "80px" }}>
            <Clock className="animate-spin" size={40} />
            <p>Synchronizing platform users...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="comp-empty" style={{ padding: "80px" }}>
            <AlertCircle size={48} style={{ color: "#94a3b8", marginBottom: "16px" }} />
            <p style={{ fontSize: "1.1rem", fontWeight: 700 }}>No users found</p>
            <p>There are no accounts matching your current filter.</p>
          </div>
        ) : (
          <>
            <div className="data-table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Identity</th>
                    <th>Contact Details</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Joined On</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedUsers.map((user) => (
                    <tr key={user.id || user.userId}>
                      <td className="title-cell">
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <div className="home-letter-avatar" style={{ width: "32px", height: "32px", fontSize: "0.85rem" }}>
                            {user.name?.charAt(0) || "U"}
                          </div>
                          <div>
                            {user.name || "Anonymous User"}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                            <Mail size={12} /> {user.email || "No email"}
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                            <Phone size={12} /> {user.mobileNumber || "No mobile"}
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="comp-badge" style={{ 
                          background: user.role === "ADMIN" ? "rgba(16,185,129,0.08)" : user.role === "COMPANY" ? "rgba(124,58,237,0.08)" : "rgba(37,99,235,0.08)",
                          color: user.role === "ADMIN" ? "#10b981" : user.role === "COMPANY" ? "#7c3aed" : "#2563eb",
                          fontWeight: 800, fontSize: "0.75rem"
                        }}>
                          {user.role === "USER" ? "Job Seeker" : formatEnum(user.role)}
                        </span>
                      </td>
                      <td>
                        <span className="comp-badge" style={{ 
                          background: (user.status || "ACTIVE") === "ACTIVE" ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.12)",
                          color: (user.status || "ACTIVE") === "ACTIVE" ? "#10b981" : "#ef4444",
                          fontWeight: 800, fontSize: "0.7rem"
                        }}>
                          {formatEnum(user.status || "ACTIVE")}
                        </span>
                      </td>
                      <td>{formatDate(user.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="pagination-bar" style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "16px", marginTop: "40px" }}>
                <button
                  disabled={page === 0}
                  onClick={() => {
                    setPage(page - 1);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="admin-btn edit"
                  style={{ borderRadius: "10px", padding: "10px" }}
                >
                  <ChevronLeft size={18} />
                </button>
                <div style={{ display: "flex", gap: "8px" }}>
                  {renderPaginationButtons()}
                </div>
                <button
                  disabled={page + 1 >= totalPages}
                  onClick={() => {
                    setPage(page + 1);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="admin-btn edit"
                  style={{ borderRadius: "10px", padding: "10px" }}
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}

export default AdminUsers;

