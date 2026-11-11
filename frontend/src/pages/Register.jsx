import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    apartment: "",
    flatNo: "",
    vehicle: "",
    email: "",
    password: "",
  });

  const [apartments, setApartments] = useState([]);
  const [loadingApartments, setLoadingApartments] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Fetch societies added by Admin
  useEffect(() => {
    fetch("http://localhost:5000/api/apartments")
      .then((res) => res.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setApartments(list);
        if (list.length > 0) {
          setFormData((prev) => ({ ...prev, apartment: list[0].name }));
        }
        setLoadingApartments(false);
      })
      .catch((err) => {
        console.error("Failed to load apartments", err);
        setLoadingApartments(false);
      });
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!/^\d{10}$/.test(formData.mobile)) {
      setErrorMsg("Mobile number must be exactly 10 digits.");
      return;
    }

    if (!formData.apartment) {
      setErrorMsg("Please select your apartment society.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccessMsg(data.message || "Registration successful! Verification link sent to your email.");
      } else {
        setErrorMsg(data.message || "Registration failed.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "460px", margin: "40px auto", padding: "28px", border: "1px solid #e2e8f0", borderRadius: "10px", background: "#ffffff", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)" }}>
      <h2 style={{ textAlign: "center", marginTop: 0, color: "#0f172a" }}>Resident Registration</h2>

      {errorMsg && (
        <div style={{ background: "#fef2f2", color: "#b91c1c", padding: "10px", borderRadius: "6px", fontSize: "14px", marginBottom: "16px" }}>
          {errorMsg}
        </div>
      )}

      {successMsg ? (
        <div style={{ background: "#f0fdf4", color: "#15803d", padding: "16px", borderRadius: "8px", textAlign: "center" }}>
          <h3>📩 Check Your Email!</h3>
          <p style={{ fontSize: "14px", lineHeight: "1.5" }}>{successMsg}</p>
          <p style={{ fontSize: "13px", color: "#64748b" }}>Click the link sent to your email to activate your account.</p>
          <Link to="/login" style={{ display: "inline-block", marginTop: "12px", padding: "8px 16px", background: "#2563eb", color: "#fff", textDecoration: "none", borderRadius: "6px", fontWeight: "bold" }}>
            Go to Login
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "4px" }}>Full Name</label>
            <input
              type="text"
              name="name"
              placeholder="e.g. Rahul Sharma"
              value={formData.name}
              onChange={handleChange}
              required
              style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1", boxSizing: "border-box" }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "4px" }}>10-Digit Mobile</label>
            <input
              type="tel"
              name="mobile"
              placeholder="e.g. 9876543210"
              value={formData.mobile}
              onChange={handleChange}
              required
              style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1", boxSizing: "border-box" }}
            />
          </div>

          {/* Dynamic Apartment Dropdown */}
          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "4px" }}>Select Apartment Society</label>
            {loadingApartments ? (
              <div style={{ fontSize: "13px", color: "#64748b" }}>Loading societies...</div>
            ) : apartments.length === 0 ? (
              <div style={{ fontSize: "13px", color: "#b91c1c" }}>
                No apartments found. Please ask Admin to add your society in Admin Panel!
              </div>
            ) : (
              <select
                name="apartment"
                value={formData.apartment}
                onChange={handleChange}
                required
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "6px",
                  border: "1px solid #cbd5e1",
                  background: "#fff",
                  boxSizing: "border-box",
                  fontSize: "14px",
                  cursor: "pointer",
                }}
              >
                {apartments.map((apt) => (
                  <option key={apt._id} value={apt.name}>
                    {apt.name} {apt.address ? `(${apt.address})` : ""}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "4px" }}>Flat / Unit No</label>
              <input
                type="text"
                name="flatNo"
                placeholder="e.g. A-402"
                value={formData.flatNo}
                onChange={handleChange}
                required
                style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1", boxSizing: "border-box" }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "4px" }}>Vehicle Reg No</label>
              <input
                type="text"
                name="vehicle"
                placeholder="e.g. KA01AB1234"
                value={formData.vehicle}
                onChange={handleChange}
                required
                style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1", boxSizing: "border-box" }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "4px" }}>Email Address</label>
            <input
              type="email"
              name="email"
              placeholder="e.g. resident@gmail.com"
              value={formData.email}
              onChange={handleChange}
              required
              style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1", boxSizing: "border-box" }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "4px" }}>Password</label>
            <input
              type="password"
              name="password"
              placeholder="Create password"
              value={formData.password}
              onChange={handleChange}
              required
              style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1", boxSizing: "border-box" }}
            />
          </div>

          <button
            type="submit"
            disabled={loading || apartments.length === 0}
            style={{
              padding: "12px",
              background: apartments.length === 0 ? "#94a3b8" : "#2563eb",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              fontWeight: "bold",
              fontSize: "15px",
              cursor: apartments.length === 0 ? "not-allowed" : "pointer",
              marginTop: "8px",
            }}
          >
            {loading ? "Sending Verification..." : "Create Account"}
          </button>
        </form>
      )}

      <p style={{ textAlign: "center", fontSize: "14px", color: "#64748b", marginTop: "20px" }}>
        Already registered? <Link to="/login" style={{ color: "#2563eb", fontWeight: "600" }}>Login here</Link>
      </p>
    </div>
  );
}

export default Register;