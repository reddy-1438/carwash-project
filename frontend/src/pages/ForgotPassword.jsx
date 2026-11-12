import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState({ loading: false, msg: "", error: false });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, msg: "", error: false });

    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/forgot-password`, {
        email: email.trim(),
      });
      setStatus({
        loading: false,
        msg: res.data.message || "Password reset instructions sent to your email.",
        error: false,
      });
    } catch (err) {
      setStatus({
        loading: false,
        msg: err.response?.data?.message || "Failed to send reset link. Please check the email address.",
        error: true,
      });
    }
  };

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
      <h2 style={{ textAlign: "center", marginTop: 0, color: "#0f172a" }}>Forgot Password</h2>
      <p style={{ textAlign: "center", color: "#64748b", fontSize: "14px", marginTop: "-6px", marginBottom: "20px" }}>
        Enter your registered email to receive a reset link
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
            Registered Email Address
          </label>
          <input
            type="email"
            placeholder="e.g. resident@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
          {status.loading ? "Sending Link..." : "Send Reset Link"}
        </button>
      </form>

      <p style={{ textAlign: "center", fontSize: "14px", color: "#64748b", marginTop: "24px" }}>
        Remembered your password?{" "}
        <Link to="/login" style={{ color: "#2563eb", fontWeight: "600" }}>
          Back to Login
        </Link>
      </p>
    </div>
  );
}

export default ForgotPassword;