import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          minHeight: "60vh", padding: "2rem", textAlign: "center"
        }}>
          <div style={{
            background: "#fef2f2", border: "1px solid #fecaca",
            borderRadius: "12px", padding: "2rem", maxWidth: "480px"
          }}>
            <h2 style={{ color: "#991b1b", fontSize: "1.25rem", marginBottom: "1rem" }}>
              Something went wrong
            </h2>
            <p style={{ color: "#6b7280", marginBottom: "1.5rem", lineHeight: "1.6" }}>
              An unexpected error occurred. Please try refreshing the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: "10px 24px", borderRadius: "8px",
                background: "#2563eb", color: "#fff",
                border: "none", cursor: "pointer",
                fontSize: "14px", fontWeight: 600
              }}
            >
              Refresh Page
            </button>
            {this.props.showDetails && this.state.error && (
              <pre style={{
                marginTop: "1rem", padding: "1rem",
                background: "#f9fafb", borderRadius: "8px",
                fontSize: "12px", textAlign: "left",
                overflow: "auto", color: "#374151"
              }}>
                {this.state.error.toString()}
              </pre>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;