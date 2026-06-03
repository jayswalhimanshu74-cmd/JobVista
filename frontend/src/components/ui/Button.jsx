import React from "react";

const variants = {
  primary: {
    background: "#2563eb", color: "#fff", border: "none"
  },
  secondary: {
    background: "#f3f4f6", color: "#374151", border: "1px solid #e5e7eb"
  },
  danger: {
    background: "#fee2e2", color: "#991b1b", border: "1px solid #fecaca"
  },
  success: {
    background: "#dcfce7", color: "#166534", border: "1px solid #bbf7d0"
  },
  outline: {
    background: "#fff", color: "#2563eb", border: "1px solid #2563eb"
  },
  ghost: {
    background: "none", color: "#6b7280", border: "none"
  }
};

const sizes = {
  sm: { padding: "6px 14px", fontSize: "13px", borderRadius: "6px" },
  md: { padding: "10px 20px", fontSize: "14px", borderRadius: "8px" },
  lg: { padding: "12px 28px", fontSize: "16px", borderRadius: "10px" }
};

const Button = ({
  children,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  onClick,
  type = "button",
  fullWidth = false,
  style = {},
  ...props
}) => {
  const variantStyle = variants[variant] || variants.primary;
  const sizeStyle = sizes[size] || sizes.md;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        ...variantStyle,
        ...sizeStyle,
        fontWeight: 600,
        cursor: disabled || loading ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1,
        width: fullWidth ? "100%" : "auto",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "6px",
        transition: "opacity 0.2s, transform 0.1s",
        ...style
      }}
      {...props}
    >
      {loading ? "Loading..." : children}
    </button>
  );
};

export default Button;