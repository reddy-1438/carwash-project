import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API, { getUserSubscriptions } from "../api";

function Dashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [subscriptions, setSubscriptions] = useState([]);
  const userEmail = localStorage.getItem("userEmail");

  useEffect(() => {
    if (!userEmail) {
      navigate("/login");
      return;
    }

    // Attempt to load full user details, falling back to localStorage cache if needed
    API.get(`/api/auth/users`)
      .then((res) => {
        const users = Array.isArray(res.data) ? res.data : [];
        const current = users.find((u) => u.email?.toLowerCase() === userEmail.toLowerCase());
        if (current) {
          setProfile(current);
        } else {
          // Local fallback from login state
          setProfile({
            name: localStorage.getItem("userName") || "Resident",
            email: userEmail,
            apartment: localStorage.getItem("assignedApartment") || "Registered Society",
            flatNo: "N/A",
            vehicle: "Registered Vehicle",
            mobile: "N/A",
          });
        }
      })
      .catch((err) => {
        console.error("Failed to load user profile:", err);
      });

    // Fetch user subscriptions via Railway production API
    getUserSubscriptions(userEmail)
      .then((res) => setSubscriptions(Array.isArray(res.data) ? res.data : []))
      .catch((err) => console.error("Failed to load subscriptions:", err));
  }, [userEmail, navigate]);

  return (
    <div style={{ padding: "40px 20px", maxWidth: "900px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>Customer Dashboard</h1>
        <Link
          to="/subscription"
          style={{
            padding: "10px 18px",
            background: "#2563eb",
            color: "#fff",
            textDecoration: "none",
            borderRadius: "6px",
            fontWeight: "bold",
          }}
        >
          + Subscribe to Plan
        </Link>
      </div>

      {profile && (
        <div
          style={{
            background: "#ffffff",
            padding: "24px",
            borderRadius: "10px",
            marginTop: "20px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.06)",
            border: "1px solid #e2e8f0",
          }}
        >
          <h3 style={{ marginTop: 0, marginBottom: "16px" }}>Owner & Vehicle Details</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", fontSize: "15px" }}>
            <p style={{ margin: 0 }}><strong>Name:</strong> {profile.name}</p>
            <p style={{ margin: 0 }}><strong>Email:</strong> {profile.email}</p>
            <p style={{ margin: 0 }}><strong>Mobile:</strong> {profile.mobile}</p>
            <p style={{ margin: 0 }}><strong>Apartment:</strong> {profile.apartment} {profile.flatNo ? `(Flat ${profile.flatNo})` : ""}</p>
            <p style={{ margin: 0 }}><strong>Vehicle:</strong> {profile.vehicle}</p>
          </div>
        </div>
      )}

      <div style={{ marginTop: "40px" }}>
        <h3 style={{ marginBottom: "16px" }}>My Subscriptions</h3>
        {subscriptions.length === 0 ? (
          <div
            style={{
              padding: "30px",
              background: "#fff",
              borderRadius: "8px",
              textAlign: "center",
              border: "1px dashed #cbd5e1",
              color: "#64748b",
            }}
          >
            No active subscriptions yet. Click "+ Subscribe to Plan" above to activate your apartment wash schedule.
          </div>
        ) : (
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              background: "#ffffff",
              borderRadius: "8px",
              overflow: "hidden",
              boxShadow: "0 2px 4px rgba(0,0,0,0.06)",
            }}
          >
            <thead>
              <tr style={{ background: "#f8fafc", textAlign: "left", borderBottom: "1px solid #e2e8f0" }}>
                <th style={{ padding: "14px" }}>Plan</th>
                <th style={{ padding: "14px" }}>Amount</th>
                <th style={{ padding: "14px" }}>Status</th>
                <th style={{ padding: "14px" }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {subscriptions.map((sub) => (
                <tr key={sub._id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "14px", fontWeight: "500" }}>{sub.planName}</td>
                  <td style={{ padding: "14px" }}>₹{sub.amount}</td>
                  <td style={{ padding: "14px", color: "#16a34a", fontWeight: "bold" }}>{sub.status}</td>
                  <td style={{ padding: "14px", color: "#64748b" }}>
                    {new Date(sub.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Dashboard;