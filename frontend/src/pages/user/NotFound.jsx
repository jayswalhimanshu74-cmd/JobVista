import { useEffect } from "react";
import { Link } from "react-router-dom";

function NotFound() {
    useEffect(() => {
        const meta = document.createElement("meta");
        meta.name = "robots";
        meta.content = "noindex";
        document.head.appendChild(meta);
        return () => document.head.removeChild(meta);
    }, []);

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "60vh",
                textAlign: "center",
            }}
        >
            <h2 style={{ fontSize: "1.5rem", color: "#111", marginBottom: "1rem" }}>
                404 — Page Not Found
            </h2>
            <p style={{ color: "#6b7280", marginBottom: "1.5rem" }}>
                The page you're looking for doesn't exist.
            </p>
            <Link
                to="/"
                style={{
                    padding: "10px 24px",
                    borderRadius: "8px",
                    background: "#2563eb",
                    color: "#fff",
                    textDecoration: "none",
                    fontWeight: 600,
                }}
            >
                Go Home
            </Link>
        </div>
    );
}

export default NotFound;