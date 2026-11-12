import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { login } from "../api";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errorMsg, setErrorMsg] = useState("");
  const [unverifiedEmail, setUnverifiedEmail] = useState("");
  const [resendStatus, setResendStatus] = useState("");
  const [resending, setResending] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleResendLink = async () => {
    const targetEmail = unverifiedEmail || formData.email.trim();
    if (!targetEmail) return;

    setResending(true);
    setResendStatus("");
    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/resend-verification`, {
        email: targetEmail,
      });
      setResendStatus(res.data.message);
      setErrorMsg("");
      setUnverifiedEmail("");
    } catch (err) {
      setResendStatus(err.response?.data?.message || "Failed to resend verification email.");
    } finally {
      setResending(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setResendStatus("");
    setUnverifiedEmail("");
    setLoading(true);

    try {
      const res = await login(formData);
      const data = res.data;

      // Save role and apartment assignment
      localStorage.setItem("userEmail", data.user.email);
      localStorage.setItem("userRole", data.user.role || "customer");
      localStorage.setItem("userName", data.user.name || "");
      localStorage.setItem("assignedApartment", data.user.assignedApartment || "");

      // Role-based automatic redirect
      if (data.user.role === "super_admin") {
        navigate("/admin");
      } else if (data.user.role === "society_admin") {
        navigate("/admin/apartment");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      console.error(err);
      const errData = err.response?.data;
      if (errData?.message) {
        setErrorMsg(errData.message);
        // Check if backend flagged account as unverified (or message mentions verification)
        if (errData.unverified || errData.message.toLowerCase().includes("not verified")) {
          setUnverifiedEmail(errData.email || formData.email.trim());
        }
      } else {
        setErrorMsg("Failed to connect to the server.");
      }
    } finally {
      setLoading(false);
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
      <h2 style={{ textAlign: "center", marginTop: 0, color: "#0f172a" }}>Sign In</h2>
      <p style={{ textAlign: "center", color: "#64748b", fontSize: "14px", marginTop: "-6px", marginBottom: "20px" }}>
        Residents & Admins Portal
      </p>

      {resendStatus && (
        <div
          style={{
            background: "#dcfce7",
            color: "#166534",
            padding: "10px 12px",
            borderRadius: "6px",
            fontSize: "14px",
            marginBottom: "16px",
          }}
        >
          {resendStatus}
        </div>
      )}

      {errorMsg && (
        <div
          style={{
            background: "#fef2f2",
            color: "#b91c1c",
            padding: "12px",
            borderRadius: "6px",
            fontSize: "14px",
            marginBottom: "16px",
          }}
        >
          <div>{errorMsg}</div>
          {unverifiedEmail && (
            <button
              type="button"
              onClick={handleResendLink}
              disabled={resending}
              style={{
                marginTop: "8px",
                padding: "6px 12px",
                background: "#dc2626",
                color: "#ffffff",
                border: "none",
                borderRadius: "4px",
                fontSize: "13px",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              {resending ? "Sending..." : "Resend Verification Email"}
            </button>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <div>
          <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px" }}>
            Email Address
          </label>
          <input
            type="email"
            name="email"
            placeholder="e.g. resident@gmail.com or admin@carwash.com"
            value={formData.email}
            onChange={handleChange}
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
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
            <label style={{ fontSize: "13px", fontWeight: "600" }}>
              Password
            </label>
            <Link to="/forgot-password" style={{ fontSize: "12px", color: "#2563eb", textDecoration: "none", fontWeight: "600" }}>
              Forgot Password?
            </Link>
          </div>
          <input
            type="password"
            name="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
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
          disabled={loading}
          style={{
            padding: "12px",
            background: "#2563eb",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            fontWeight: "bold",
            fontSize: "15px",
            cursor: "pointer",
            marginTop: "6px",
          }}
        >
          {loading ? "Signing in..." : "Login"}
        </button>
      </form>

      <p style={{ textAlign: "center", fontSize: "14px", color: "#64748b", marginTop: "24px" }}>
        New resident?{" "}
        <Link to="/register" style={{ color: "#2563eb", fontWeight: "600" }}>
          Register here
        </Link>
      </p>
    </div>
  );
}

export default Login;