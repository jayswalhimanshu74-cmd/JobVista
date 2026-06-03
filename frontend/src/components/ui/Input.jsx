import React from "react";

const Input = ({
  label,
  type = "text",
  value,
  onChange,
  placeholder = "",
  error = null,
  required = false,
  disabled = false,
  name,
  style = {},
  ...props
}) => {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      {label && (
        <label style={{
          fontSize: "14px", fontWeight: 500,
          color: "#374151"
        }}>
          {label}
          {required && <span style={{ color: "#ef4444", marginLeft: "2px" }}>*</span>}
        </label>
      )}
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        style={{
          padding: "10px 14px",
          borderRadius: "8px",
          border: error ? "1px solid #f87171" : "1px solid #e5e7eb",
          fontSize: "14px",
          color: "#111",
          background: disabled ? "#f9fafb" : "#fff",
          outline: "none",
          width: "100%",
          boxSizing: "border-box",
          transition: "border-color 0.2s",
          ...style
        }}
        onFocus={e => e.target.style.borderColor = "#2563eb"}
        onBlur={e => e.target.style.borderColor = error ? "#f87171" : "#e5e7eb"}
        {...props}
      />
      {error && (
        <span style={{ fontSize: "12px", color: "#ef4444" }}>
          {error}
        </span>
      )}
    </div>
  );
};

export default Input;