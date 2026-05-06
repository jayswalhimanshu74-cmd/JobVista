import React, { useState, useEffect } from "react";
import axiosInstance from "../../api/axiosConfig";
import { 
  Building2, 
  ExternalLink, 
  Trash2, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  AlertCircle, 
  Check,
  Globe,
  MapPin,
  Mail
} from "lucide-react";

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
        params: { page: pageNum, size: 10 },
      });
      setCompanies(res.data.content || []);
      setTotalPages(res.data.totalPages || 0);
      setTotalElements(res.data.totalElements || 0);
      setPage(res.data.number || 0);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error("Failed to fetch companies", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCompany = async (id) => {
    if (!confirm("Are you sure you want to remove this corporate partner? This action will also affect their job listings.")) return;
    try {
      await axiosInstance.delete(`/company/id/${id}`);
      setCompanies(companies.filter((c) => c.id !== id));
      showToast("Corporate partner removed successfully");
    } catch (err) {
      showToast(err.response?.data || "Failed to remove company", "error");
    }
  };

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
          onClick={() => fetchCompanies(i)}
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

  return (
    <div className="admin-companies-content">
      {toast && (
        <div className={`comp-toast ${toast.type}`}>
          {toast.type === "success" ? <Check size={18} /> : <AlertCircle size={18} />}
          {toast.msg}
        </div>
      )}

      <header className="dashboard-header">
        <h1>Corporate Ecosystem</h1>
        <p>Strategic management of all listed companies and partner relationships</p>
      </header>

      <section className="dashboard-section" style={{ padding: "0 40px 40px" }}>
        <div className="section-title-wrapper" style={{ padding: "40px 0 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ margin: 0 }}>
            <Building2 size={22} style={{ color: "var(--primary)", marginRight: "12px" }} />
            Partner Portfolio ({totalElements})
          </h2>
        </div>

        {loading ? (
          <div className="comp-empty" style={{ padding: "80px" }}>
            <Clock className="animate-spin" size={40} />
            <p>Loading corporate records...</p>
          </div>
        ) : companies.length === 0 ? (
          <div className="comp-empty" style={{ padding: "80px" }}>
            <AlertCircle size={48} style={{ color: "#94a3b8", marginBottom: "16px" }} />
            <p style={{ fontSize: "1.1rem", fontWeight: 700 }}>No partners found</p>
            <p>There are no registered companies matching your database query.</p>
          </div>
        ) : (
          <>
            <div className="data-table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Corporate Identity</th>
                    <th>Headquarters</th>
                    <th>Contact</th>
                    <th>Market Presence</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {companies.map((company) => (
                    <tr key={company.companyId || company.id}>
                      <td className="title-cell">
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          {company.logoUrl ? (
                            <img 
                              src={company.logoUrl} 
                              alt="" 
                              style={{ width: "32px", height: "32px", borderRadius: "10px", objectFit: "cover" }} 
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div 
                            className="home-letter-avatar" 
                            style={{ 
                              width: "32px", height: "32px", fontSize: "0.85rem", 
                              background: "var(--bg-accent)", color: "var(--primary)",
                              display: company.logoUrl ? "none" : "flex"
                            }}
                          >
                            {(company.companyName || "?")[0].toUpperCase()}
                          </div>
                          <div>{company.companyName}</div>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.9rem" }}>
                          <MapPin size={14} /> {company.location || "Global"}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.9rem", color: "var(--text-muted)" }}>
                          <Mail size={14} /> {company.companyEmail || "No public email"}
                        </div>
                      </td>
                      <td>
                        {company.companyWebsite ? (
                          <a href={company.companyWebsite} target="_blank" rel="noreferrer" className="admin-btn edit" style={{ padding: "6px 12px", fontSize: "0.8rem" }}>
                            <Globe size={14} /> Ecosystem
                          </a>
                        ) : "—"}
                      </td>
                      <td>
                        <div className="actions-cell">
                          <button className="admin-btn danger" onClick={() => handleDeleteCompany(company.id)} title="Remove Partner">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="pagination-bar" style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "16px", marginTop: "40px" }}>
                <button
                  disabled={page === 0}
                  onClick={() => fetchCompanies(page - 1)}
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
                  onClick={() => fetchCompanies(page + 1)}
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

export default AdminCompanies;

