import React, { useState, useEffect } from "react";
import axiosInstance from "../../api/axiosConfig";

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterRole, setFilterRole] = useState("");
  const [toast, setToast] = useState(null);

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
    } catch (err) {
      console.error("Failed to fetch users", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (d) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
    });
  };

  const filteredUsers = filterRole
    ? users.filter((u) => u.role === filterRole)
    : users;

  const roleCounts = users.reduce((acc, u) => {
    acc[u.role] = (acc[u.role] || 0) + 1;
    return acc;
  }, {});

  const ROLE_COLORS = {
    USER: { bg: "rgba(108,143,220,0.2)", color: "#6c8fdc", border: "rgba(108,143,220,0.3)" },
    COMPANY: { bg: "rgba(245,169,98,0.2)", color: "#f5a962", border: "rgba(245,169,98,0.3)" },
    ADMIN: { bg: "rgba(125,211,192,0.2)", color: "#7dd3c0", border: "rgba(125,211,192,0.3)" },
  };

  const STATUS_COLORS = {
    ACTIVE: { bg: "rgba(125,211,192,0.2)", color: "#7dd3c0", border: "rgba(125,211,192,0.3)" },
    INACTIVE: { bg: "rgba(239,68,68,0.2)", color: "#ff6b6b", border: "rgba(239,68,68,0.3)" },
  };

  return (
    <div className="admin-users">
      {toast && (
        <div style={{
          position: "fixed", bottom: 28, left: "50%", transform: "translateX(-50%)",
          padding: "12px 24px", borderRadius: 12, zIndex: 99999, fontWeight: 500,
          background: toast.type === "error" ? "rgba(220,38,38,0.95)" : "rgba(5,150,105,0.95)",
          color: "#fff", boxShadow: "0 8px 32px rgba(0,0,0,0.3)", animation: "fadeIn 0.3s ease"
        }}>
          {toast.msg}
        </div>
      )}

      <div className="section-header">
        <div>
          <h1>User Management</h1>
          <p style={{ color: "#94a3b8", margin: "6px 0 0", fontSize: "0.95rem" }}>
            {users.length} registered user{users.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="filter-actions">
          <select className="filter-select" value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
            <option value="">All Roles</option>
            <option value="USER">Job Seekers</option>
            <option value="COMPANY">Companies</option>
            <option value="ADMIN">Admins</option>
          </select>
        </div>
      </div>

      {/* Role counts */}
      <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
        {Object.entries(ROLE_COLORS).map(([role, c]) => (
          <div key={role} onClick={() => setFilterRole(filterRole === role ? "" : role)} style={{
            padding: "10px 20px", borderRadius: 10, cursor: "pointer",
            background: filterRole === role ? c.bg : "rgba(255,255,255,0.03)",
            border: `1px solid ${filterRole === role ? c.border : "rgba(255,255,255,0.08)"}`,
            transition: "all 0.3s ease",
          }}>
            <div style={{ fontSize: "1.3rem", fontWeight: 700, color: c.color }}>{roleCounts[role] || 0}</div>
            <div style={{ fontSize: "0.8rem", color: "#94a3b8" }}>{role === "USER" ? "Job Seekers" : role === "COMPANY" ? "Companies" : "Admins"}</div>
          </div>
        ))}
      </div>

      {loading ? (
        <p style={{ textAlign: "center", color: "#94a3b8", padding: 40 }}>Loading users...</p>
      ) : filteredUsers.length === 0 ? (
        <div style={{ textAlign: "center", padding: 60, color: "#64748b", background: "rgba(255,255,255,0.03)", borderRadius: 12, border: "1px solid rgba(255,255,255,0.08)" }}>
          <p style={{ fontSize: "1.2rem" }}>No users found</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Mobile</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => {
                const rc = ROLE_COLORS[user.role] || ROLE_COLORS.USER;
                const sc = STATUS_COLORS[user.status] || STATUS_COLORS.ACTIVE;
                return (
                  <tr key={user.id || user.userId}>
                    <td className="title-cell">{user.name || "—"}</td>
                    <td>{user.email || "—"}</td>
                    <td>{user.mobileNumber || "—"}</td>
                    <td>
                      <span style={{
                        display: "inline-block", padding: "5px 12px", borderRadius: 16,
                        fontSize: "0.82rem", fontWeight: 600,
                        background: rc.bg, color: rc.color, border: `1px solid ${rc.border}`,
                      }}>
                        {user.role === "USER" ? "Job Seeker" : user.role === "COMPANY" ? "Company" : "Admin"}
                      </span>
                    </td>
                    <td>
                      <span style={{
                        display: "inline-block", padding: "5px 12px", borderRadius: 16,
                        fontSize: "0.82rem", fontWeight: 600,
                        background: sc.bg, color: sc.color, border: `1px solid ${sc.border}`,
                      }}>
                        {(user.status || "ACTIVE").toLowerCase()}
                      </span>
                    </td>
                    <td>{formatDate(user.createdAt)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AdminUsers;
