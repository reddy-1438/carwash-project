import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../api";

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
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
      if (err.response && err.response.data && err.response.data.message) {
        setErrorMsg(err.response.data.message);
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

      {errorMsg && (
        <div
          style={{
            background: "#fef2f2",
            color: "#b91c1c",
            padding: "10px",
            borderRadius: "6px",
            fontSize: "14px",
            marginBottom: "16px",
          }}
        >
          {errorMsg}
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
          <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px" }}>
            Password
          </label>
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