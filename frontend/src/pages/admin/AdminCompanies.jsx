import React, { useState, useEffect } from "react";
import axiosInstance from "../../api/axiosConfig";

function AdminCompanies() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    fetchCompanies(0);
  }, []);

  const fetchCompanies = async (pageNum = 0) => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/company/all", {
        params: { page: pageNum, size: 15 },
      });
      setCompanies(res.data.content || []);
      setTotalPages(res.data.totalPages || 0);
      setTotalElements(res.data.totalElements || 0);
      setPage(res.data.number || 0);
    } catch (err) {
      console.error("Failed to fetch companies", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCompany = async (id) => {
    if (!confirm("Are you sure you want to delete this company?")) return;
    try {
      await axiosInstance.delete(`/company/id/${id}`);
      setCompanies(companies.filter((c) => c.id !== id));
      showToast("Company deleted successfully");
    } catch (err) {
      console.error("Delete failed", err);
      showToast(err.response?.data || "Failed to delete company", "error");
    }
  };

  return (
    <div className="admin-companies">
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
          <h1>Company Management</h1>
          <p style={{ color: "#94a3b8", margin: "6px 0 0", fontSize: "0.95rem" }}>
            {totalElements} registered compan{totalElements !== 1 ? "ies" : "y"}
          </p>
        </div>
      </div>

      {loading ? (
        <p style={{ textAlign: "center", color: "#94a3b8", padding: 40 }}>Loading companies...</p>
      ) : companies.length === 0 ? (
        <div style={{ textAlign: "center", padding: 60, color: "#64748b", background: "rgba(255,255,255,0.03)", borderRadius: 12, border: "1px solid rgba(255,255,255,0.08)" }}>
          <p style={{ fontSize: "1.2rem" }}>No companies found</p>
          <p style={{ fontSize: "0.9rem" }}>Companies will appear here when users register with the COMPANY role.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Company Name</th>
                <th>Email</th>
                <th>Location</th>
                <th>Website</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {companies.map((company) => (
                <tr key={company.companyId || company.id}>
                  <td className="title-cell">
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      {company.logoUrl ? (
                        <img
                          src={company.logoUrl}
                          alt=""
                          style={{ width: 32, height: 32, borderRadius: 8, objectFit: "cover", background: "rgba(255,255,255,0.1)" }}
                          onError={(e) => { e.target.style.display = "none"; }}
                        />
                      ) : (
                        <span style={{
                          width: 32, height: 32, borderRadius: 8, display: "inline-flex",
                          alignItems: "center", justifyContent: "center",
                          background: "rgba(108,143,220,0.15)", color: "#6c8fdc",
                          fontSize: "0.9rem", fontWeight: 700, flexShrink: 0,
                        }}>
                          {(company.companyName || "?")[0].toUpperCase()}
                        </span>
                      )}
                      {company.companyName || "—"}
                    </div>
                  </td>
                  <td>{company.companyEmail || "—"}</td>
                  <td>{company.location || "—"}</td>
                  <td>
                    {company.companyWebsite ? (
                      <a
                        href={company.companyWebsite.startsWith("http") ? company.companyWebsite : `https://${company.companyWebsite}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: "#6c8fdc", textDecoration: "none", fontSize: "0.9rem" }}
                      >
                        🔗 Visit
                      </a>
                    ) : "—"}
                  </td>
                  <td style={{ maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {company.description || "—"}
                  </td>
                  <td className="action-cell">
                    <button
                      className="btn-small delete"
                      onClick={() => handleDeleteCompany(company.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 24 }}>
          <button
            disabled={page === 0}
            onClick={() => fetchCompanies(page - 1)}
            style={{
              padding: "8px 16px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)",
              background: "rgba(255,255,255,0.05)", color: "#cbd3de",
              cursor: page === 0 ? "not-allowed" : "pointer", opacity: page === 0 ? 0.4 : 1,
            }}
          >‹ Prev</button>
          <span style={{ padding: "8px 16px", color: "#94a3b8" }}>
            Page {page + 1} of {totalPages}
          </span>
          <button
            disabled={page + 1 >= totalPages}
            onClick={() => fetchCompanies(page + 1)}
            style={{
              padding: "8px 16px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)",
              background: "rgba(255,255,255,0.05)", color: "#cbd3de",
              cursor: page + 1 >= totalPages ? "not-allowed" : "pointer",
              opacity: page + 1 >= totalPages ? 0.4 : 1,
            }}
          >Next ›</button>
        </div>
      )}
    </div>
  );
}

export default AdminCompanies;
