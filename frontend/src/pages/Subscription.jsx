import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Subscription() {
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:5000/api/plans")
      .then((res) => res.json())
      .then((data) => {
        setPlans(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching plans:", err);
        setLoading(false);
      });
  }, []);

  const handleSelectPlan = (plan) => {
    const userEmail = localStorage.getItem("userEmail");
    if (!userEmail) {
      alert("Please login first to choose a subscription plan.");
      navigate("/login");
      return;
    }

    // Pass the exact selected plan object into router state
    navigate("/payment", { state: { plan } });
  };

  return (
    <div style={{ maxWidth: "1000px", margin: "40px auto", padding: "0 20px" }}>
      <div style={{ textAlign: "center", marginBottom: "40px" }}>
        <h1 style={{ margin: "0 0 10px 0", color: "#0f172a" }}>Choose Your Car Wash Plan</h1>
        <p style={{ margin: 0, color: "#64748b", fontSize: "16px" }}>
          Doorstep apartment car cleaning packages tailored for your convenience.
        </p>
      </div>

      {loading ? (
        <p style={{ textAlign: "center", color: "#64748b" }}>Loading plans...</p>
      ) : plans.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px", background: "#fff", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
          <p style={{ color: "#64748b", margin: 0 }}>
            No plans available yet. Please add plans from the Super Admin dashboard.
          </p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "24px",
          }}
        >
          {plans.map((p) => (
            <div
              key={p._id}
              style={{
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "12px",
                padding: "28px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
              }}
            >
              <div>
                <h3 style={{ margin: "0 0 12px 0", color: "#0f172a", fontSize: "22px" }}>{p.name}</h3>
                <div style={{ margin: "16px 0" }}>
                  <span style={{ fontSize: "36px", fontWeight: "bold", color: "#2563eb" }}>₹{p.price}</span>
                  <span style={{ color: "#64748b", fontSize: "14px" }}> / month</span>
                </div>
                <p style={{ color: "#475569", fontSize: "15px", lineHeight: "1.5" }}>{p.description}</p>
              </div>

              <button
                onClick={() => handleSelectPlan(p)}
                style={{
                  marginTop: "24px",
                  padding: "12px",
                  background: "#2563eb",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "8px",
                  fontWeight: "bold",
                  fontSize: "15px",
                  cursor: "pointer",
                }}
              >
                Subscribe Now
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Subscription;