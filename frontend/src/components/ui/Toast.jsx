import React from "react";

const Toast = ({ message, type = "success", onClose }) => {
  if (!message) return null;

  const styles = {
    success: { background: "#dcfce7", color: "#166534", border: "1px solid #bbf7d0" },
    error: { background: "#fee2e2", color: "#991b1b", border: "1px solid #fecaca" },
    info: { background: "#eff6ff", color: "#1d4ed8", border: "1px solid #bfdbfe" },
    warning: { background: "#fef9c3", color: "#854d0e", border: "1px solid #fef08a" }
  };

  return (
    <div style={{
      position: "fixed", top: "1rem", right: "1rem", zIndex: 9999,
      padding: "12px 20px", borderRadius: "8px",
      fontSize: "14px", fontWeight: 500,
      display: "flex", alignItems: "center", gap: "10px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
      maxWidth: "360px",
      ...styles[type]
    }}>
      <span style={{ flex: 1 }}>{message}</span>
      {onClose && (
        <button onClick={onClose} style={{
          background: "none", border: "none",
          cursor: "pointer", fontSize: "16px",
          color: "inherit", padding: 0
        }}>✕</button>
      )}
    </div>
  );
};

export default Toast;