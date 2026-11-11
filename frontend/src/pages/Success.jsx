import { useNavigate } from "react-router-dom";

function Success() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: "60px", textAlign: "center" }}>
      <h1 style={{ color: "green", fontSize: "40px" }}>🎉 Payment Successful!</h1>
      <p style={{ fontSize: "18px" }}>Your car wash subscription has been activated.</p>
      <button
        onClick={() => navigate("/dashboard")}
        style={{
          marginTop: "20px",
          padding: "12px 24px",
          background: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
          fontWeight: "bold",
        }}
      >
        Go to Dashboard
      </button>
    </div>
  );
}

export default Success;