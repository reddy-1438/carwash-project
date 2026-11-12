import { useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState({ loading: false, msg: "", error: false });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return setStatus({ loading: false, msg: "Passwords do not match.", error: true });
    }

    setStatus({ loading: true, msg: "", error: false });
    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/reset-password`, {
        token,
        newPassword: password,
      });
      setStatus({
        loading: false,
        msg: res.data.message || "Password updated! Redirecting to login...",
        error: false,
      });
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setStatus({
        loading: false,
        msg: err.response?.data?.message || "Reset link is invalid or has expired.",
        error: true,
      });
    }
  };

  if (!token) {
    return (
      <div
        style={{
          maxWidth: "420px",
          margin: "60px auto",
          padding: "32px",
          border: "1px solid #e2e8f0",
          borderRadius: "10px",
          background: "#ffffff",
          textAlign: "center",
        }}
      >
        <h3 style={{ color: "#b91c1c", marginTop: 0 }}>Invalid Reset Link</h3>
        <p style={{ color: "#64748b", fontSize: "14px" }}>No reset token was found in the URL.</p>
        <Link to="/forgot-password" style={{ color: "#2563eb", fontWeight: "600", fontSize: "14px" }}>
          Request a new reset link
        </Link>
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: "420px",
        margin: "60px auto",
        padding: "32px",
        border: "1px solid #e2e8f0",
        borderRadius: "10px",
        background: "#ffffff",
        boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
      }}
    >
      <h2 style={{ textAlign: "center", marginTop: 0, color: "#0f172a" }}>Create New Password</h2>
      <p style={{ textAlign: "center", color: "#64748b", fontSize: "14px", marginTop: "-6px", marginBottom: "20px" }}>
        Enter your new account password below
      </p>

      {status.msg && (
        <div
          style={{
            background: status.error ? "#fef2f2" : "#dcfce7",
            color: status.error ? "#b91c1c" : "#166534",
            padding: "12px",
            borderRadius: "6px",
            fontSize: "14px",
            marginBottom: "16px",
          }}
        >
          {status.msg}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <div>
          <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px" }}>
            New Password
          </label>
          <input
            type="password"
            placeholder="Enter new password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: "6px",
              border: "1px solid #cbd5e1",
              boxSizing: "border-box",
            }}
          />
        </div>

        <div>
          <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px" }}>
            Confirm New Password
          </label>
          <input
            type="password"
            placeholder="Re-enter new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: "6px",
              border: "1px solid #cbd5e1",
              boxSizing: "border-box",
            }}
          />
        </div>

        <button
          type="submit"
          disabled={status.loading}
          style={{
            padding: "12px",
            background: "#2563eb",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            fontWeight: "bold",
            fontSize: "15px",
            cursor: "pointer",
          }}
        >
          {status.loading ? "Updating Password..." : "Update Password"}
        </button>
      </form>
    </div>
  );
}

export default ResetPassword;