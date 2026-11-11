import { useEffect, useState, useRef } from "react";
import { useSearchParams, Link } from "react-router-dom";
import API from "../api";

function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState("verifying");
  const [message, setMessage] = useState("Verifying your email address...");
  const hasRequested = useRef(false);

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("No verification token found in the link.");
      return;
    }

    // Prevent double execution in React StrictMode
    if (hasRequested.current) return;
    hasRequested.current = true;

    API.get(`/api/auth/verify-email/${token}`)
      .then((res) => {
        setStatus("success");
        setMessage(res.data?.message || "Email verified successfully!");
      })
      .catch((err) => {
        console.error("Verification error:", err);
        setStatus("error");
        setMessage(
          err.response?.data?.message ||
            "Verification link is invalid or expired. Please register again or log in."
        );
      });
  }, [token]);

  return (
    <div
      style={{
        maxWidth: "460px",
        margin: "80px auto",
        padding: "36px",
        textAlign: "center",
        border: "1px solid #e2e8f0",
        borderRadius: "12px",
        background: "#ffffff",
        boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
      }}
    >
      {status === "verifying" && (
        <>
          <h2 style={{ color: "#2563eb" }}>⏳ Verifying...</h2>
          <p style={{ color: "#64748b" }}>{message}</p>
        </>
      )}

      {status === "success" && (
        <>
          <h2 style={{ color: "#16a34a" }}>✅ Email Verified!</h2>
          <p style={{ color: "#334155", marginBottom: "24px" }}>{message}</p>
          <Link
            to="/login"
            style={{
              padding: "10px 20px",
              background: "#2563eb",
              color: "#fff",
              textDecoration: "none",
              borderRadius: "6px",
              fontWeight: "bold",
            }}
          >
            Go to Login
          </Link>
        </>
      )}

      {status === "error" && (
        <>
          <h2 style={{ color: "#ef4444" }}>❌ Verification Failed</h2>
          <p style={{ color: "#64748b", marginBottom: "24px" }}>{message}</p>
          <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
            <Link
              to="/login"
              style={{
                padding: "10px 20px",
                background: "#2563eb",
                color: "#fff",
                textDecoration: "none",
                borderRadius: "6px",
                fontWeight: "bold",
              }}
            >
              Try Logging In
            </Link>
            <Link
              to="/register"
              style={{
                padding: "10px 20px",
                background: "#64748b",
                color: "#fff",
                textDecoration: "none",
                borderRadius: "6px",
                fontWeight: "bold",
              }}
            >
              Back to Register
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

export default VerifyEmail;