import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function Payment() {
  const location = useLocation();
  const navigate = useNavigate();

  // Retrieve selected plan details from navigation state or fallback
  const plan = location.state?.plan || {
    name: "Standard Wash Plan",
    price: 499,
    description: "Exterior foam wash & tire dressing",
  };

  const userEmail = localStorage.getItem("userEmail") || "";
  const userName = localStorage.getItem("userName") || "Resident";

  const [paymentMethod, setPaymentMethod] = useState("upi"); // 'upi' or 'card'
  const [upiApp, setUpiApp] = useState("gpay"); // 'gpay', 'phonepe', 'paytm', 'qr'
  const [upiId, setUpiId] = useState("");
  const [cardDetails, setCardDetails] = useState({
    number: "4532 •••• •••• 8892",
    expiry: "08/28",
    cvv: "•••",
    name: userName,
  });

  const [status, setStatus] = useState("idle"); // 'idle' | 'processing' | 'success' | 'failed'
  const [txnId, setTxnId] = useState("");

  useEffect(() => {
    if (!userEmail) {
      alert("Please login first to purchase a subscription.");
      navigate("/login");
    }
  }, [userEmail, navigate]);

  const handleProcessPayment = async (e) => {
    e.preventDefault();
    setStatus("processing");

    // Generate a unique transaction reference
    const generatedTxn = `PAY_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;

    try {
      // 1.5s simulated network/gateway verification delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const res = await fetch("http://localhost:5000/api/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userEmail,
          planName: plan.name,
          amount: plan.price,
          paymentMethod: paymentMethod === "upi" ? `UPI (${upiApp.toUpperCase()})` : "Credit/Debit Card",
          transactionId: generatedTxn,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setTxnId(generatedTxn);
        setStatus("success");
      } else {
        alert(data.message || "Subscription processing failed.");
        setStatus("idle");
      }
    } catch (err) {
      console.error(err);
      alert("Payment processing error. Please ensure your backend is running.");
      setStatus("idle");
    }
  };

  return (
    <div style={{ maxWidth: "600px", margin: "40px auto", padding: "20px" }}>
      {/* Plan Summary Card */}
      <div
        style={{
          background: "#0f172a",
          color: "#fff",
          padding: "24px",
          borderRadius: "12px",
          marginBottom: "24px",
          boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
        }}
      >
        <span style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "1px", color: "#94a3b8" }}>
          Order Summary
        </span>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "8px" }}>
          <div>
            <h2 style={{ margin: 0, fontSize: "22px" }}>{plan.name}</h2>
            <p style={{ margin: "4px 0 0 0", color: "#cbd5e1", fontSize: "14px" }}>{plan.description}</p>
          </div>
          <div style={{ textAlign: "right" }}>
            <span style={{ fontSize: "32px", fontWeight: "bold", color: "#4ade80" }}>₹{plan.price}</span>
            <span style={{ display: "block", fontSize: "12px", color: "#94a3b8" }}>inclusive of taxes</span>
          </div>
        </div>
      </div>

      {/* Main Payment Container */}
      <div
        style={{
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: "12px",
          padding: "28px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
        }}
      >
        {status === "idle" && (
          <div>
            <h3 style={{ margin: "0 0 16px 0", color: "#0f172a" }}>Select Payment Mode</h3>

            {/* Mode Selector Tabs */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "20px" }}>
              <button
                type="button"
                onClick={() => setPaymentMethod("upi")}
                style={{
                  padding: "12px",
                  borderRadius: "8px",
                  border: paymentMethod === "upi" ? "2px solid #2563eb" : "1px solid #cbd5e1",
                  background: paymentMethod === "upi" ? "#eff6ff" : "#fff",
                  color: paymentMethod === "upi" ? "#1d4ed8" : "#475569",
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
              >
                📱 Instant UPI
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod("card")}
                style={{
                  padding: "12px",
                  borderRadius: "8px",
                  border: paymentMethod === "card" ? "2px solid #2563eb" : "1px solid #cbd5e1",
                  background: paymentMethod === "card" ? "#eff6ff" : "#fff",
                  color: paymentMethod === "card" ? "#1d4ed8" : "#475569",
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
              >
                💳 Debit / Credit Card
              </button>
            </div>

            {/* UPI Option */}
            {paymentMethod === "upi" && (
              <form onSubmit={handleProcessPayment} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ display: "flex", gap: "8px" }}>
                  {[
                    { id: "gpay", label: "Google Pay" },
                    { id: "phonepe", label: "PhonePe" },
                    { id: "paytm", label: "Paytm" },
                    { id: "qr", label: "Scan QR" },
                  ].map((app) => (
                    <button
                      key={app.id}
                      type="button"
                      onClick={() => setUpiApp(app.id)}
                      style={{
                        flex: 1,
                        padding: "8px 4px",
                        borderRadius: "6px",
                        fontSize: "13px",
                        fontWeight: upiApp === app.id ? "bold" : "normal",
                        background: upiApp === app.id ? "#1e293b" : "#f1f5f9",
                        color: upiApp === app.id ? "#fff" : "#334155",
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      {app.label}
                    </button>
                  ))}
                </div>

                {upiApp === "qr" ? (
                  <div style={{ textAlign: "center", padding: "20px 0" }}>
                    <div
                      style={{
                        width: "160px",
                        height: "160px",
                        margin: "0 auto 12px auto",
                        border: "2px dashed #94a3b8",
                        borderRadius: "8px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "40px",
                        background: "#f8fafc",
                      }}
                    >
                      📲
                    </div>
                    <p style={{ margin: 0, fontSize: "13px", color: "#64748b" }}>
                      Scan using any UPI App to pay <b>₹{plan.price}</b>
                    </p>
                  </div>
                ) : (
                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px" }}>
                      Enter your {upiApp.toUpperCase()} ID
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. mobile@okhdfcbank or user@ybl"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
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
                )}

                <button
                  type="submit"
                  style={{
                    padding: "14px",
                    background: "#16a34a",
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    fontWeight: "bold",
                    fontSize: "16px",
                    cursor: "pointer",
                    marginTop: "8px",
                  }}
                >
                  Confirm & Pay ₹{plan.price}
                </button>
              </form>
            )}

            {/* Card Option */}
            {paymentMethod === "card" && (
              <form onSubmit={handleProcessPayment} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "4px" }}>
                    Card Number
                  </label>
                  <input
                    type="text"
                    value={cardDetails.number}
                    onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })}
                    required
                    style={{ width: "100%", padding: "10px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", boxSizing: "border-box" }}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "4px" }}>
                      Valid Thru (MM/YY)
                    </label>
                    <input
                      type="text"
                      value={cardDetails.expiry}
                      onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                      required
                      style={{ width: "100%", padding: "10px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", boxSizing: "border-box" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "4px" }}>
                      CVV
                    </label>
                    <input
                      type="password"
                      value={cardDetails.cvv}
                      onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                      required
                      style={{ width: "100%", padding: "10px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", boxSizing: "border-box" }}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  style={{
                    padding: "14px",
                    background: "#2563eb",
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    fontWeight: "bold",
                    fontSize: "16px",
                    cursor: "pointer",
                    marginTop: "8px",
                  }}
                >
                  Pay ₹{plan.price} via Card
                </button>
              </form>
            )}
          </div>
        )}

        {/* Processing State */}
        {status === "processing" && (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <div style={{ fontSize: "40px", marginBottom: "16px" }}>⏳</div>
            <h3 style={{ margin: "0 0 8px 0" }}>Authorizing Payment...</h3>
            <p style={{ margin: 0, color: "#64748b", fontSize: "14px" }}>
              Please wait while we verify your transaction with the bank simulator.
            </p>
          </div>
        )}

        {/* Success State */}
        {status === "success" && (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ fontSize: "50px", color: "#16a34a", marginBottom: "12px" }}>✅</div>
            <h2 style={{ margin: "0 0 6px 0", color: "#0f172a" }}>Payment Successful!</h2>
            <p style={{ margin: "0 0 16px 0", color: "#64748b", fontSize: "14px" }}>
              Your car wash subscription is now active.
            </p>

            <div
              style={{
                background: "#f8fafc",
                padding: "16px",
                borderRadius: "8px",
                textAlign: "left",
                fontSize: "14px",
                marginBottom: "24px",
                border: "1px solid #e2e8f0",
              }}
            >
              <div style={{ marginBottom: "6px" }}>
                <span style={{ color: "#64748b" }}>Transaction ID: </span>
                <span style={{ fontWeight: "bold", color: "#0f172a" }}>{txnId}</span>
              </div>
              <div style={{ marginBottom: "6px" }}>
                <span style={{ color: "#64748b" }}>Plan: </span>
                <span style={{ fontWeight: "bold" }}>{plan.name}</span>
              </div>
              <div>
                <span style={{ color: "#64748b" }}>Amount Paid: </span>
                <span style={{ fontWeight: "bold", color: "#16a34a" }}>₹{plan.price}</span>
              </div>
            </div>

            <button
              onClick={() => navigate("/dashboard")}
              style={{
                padding: "12px 24px",
                background: "#2563eb",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                fontWeight: "bold",
                fontSize: "15px",
                cursor: "pointer",
                width: "100%",
              }}
            >
              Go to Resident Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Payment;