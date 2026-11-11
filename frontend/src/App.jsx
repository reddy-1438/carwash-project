import { Routes, Route, Link, useNavigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Subscription from "./pages/Subscription";
import Admin from "./pages/Admin";
import ApartmentAdmin from "./pages/ApartmentAdmin";
import Payment from "./pages/Payment";
import Dashboard from "./pages/Dashboard";
import VerifyEmail from "./pages/VerifyEmail";

function App() {
  const navigate = useNavigate();
  const userEmail = localStorage.getItem("userEmail");
  const userRole = localStorage.getItem("userRole"); // "customer", "society_admin", "super_admin"

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f8fafc", fontFamily: "Arial, sans-serif" }}>
      {/* Top Navigation Bar */}
      <nav
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "16px 28px",
          backgroundColor: "#0f172a",
          color: "#ffffff",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        }}
      >
        <h2
          style={{ margin: 0, fontSize: "20px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}
          onClick={() => {
            if (userRole === "super_admin") navigate("/admin");
            else if (userRole === "society_admin") navigate("/admin/apartment");
            else navigate("/");
          }}
        >
          🚗 Apartment Car Wash
        </h2>

        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          {/* 1. Logged in as CUSTOMER / RESIDENT */}
          {userEmail && userRole === "customer" && (
            <>
              <Link to="/dashboard" style={{ color: "#ffffff", textDecoration: "none", fontWeight: "500" }}>
                Dashboard
              </Link>
              <Link to="/subscription" style={{ color: "#ffffff", textDecoration: "none", fontWeight: "500" }}>
                Plans
              </Link>
              <button
                onClick={handleLogout}
                style={{
                  background: "#ef4444",
                  color: "#fff",
                  border: "none",
                  padding: "6px 12px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                Logout
              </button>
            </>
          )}

          {/* 2. Logged in as SOCIETY ADMIN */}
          {userEmail && userRole === "society_admin" && (
            <>
              <Link
                to="/admin/apartment"
                style={{
                  color: "#38bdf8",
                  textDecoration: "none",
                  fontWeight: "bold",
                  border: "1px solid #38bdf8",
                  padding: "4px 10px",
                  borderRadius: "6px",
                  fontSize: "13px",
                }}
              >
                🏢 Society Portal
              </Link>
              <button
                onClick={handleLogout}
                style={{
                  background: "#ef4444",
                  color: "#fff",
                  border: "none",
                  padding: "6px 12px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                Logout
              </button>
            </>
          )}

          {/* 3. Logged in as SUPER ADMIN */}
          {userEmail && userRole === "super_admin" && (
            <>
              <Link
                to="/admin"
                style={{
                  color: "#f59e0b",
                  textDecoration: "none",
                  fontWeight: "bold",
                  border: "1px solid #f59e0b",
                  padding: "4px 10px",
                  borderRadius: "6px",
                  fontSize: "13px",
                }}
              >
                👑 Super Admin
              </Link>
              <button
                onClick={handleLogout}
                style={{
                  background: "#ef4444",
                  color: "#fff",
                  border: "none",
                  padding: "6px 12px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                Logout
              </button>
            </>
          )}

          {/* 4. Not logged in */}
          {!userEmail && (
            <>
              <Link to="/login" style={{ color: "#ffffff", textDecoration: "none", fontWeight: "500" }}>
                Login
              </Link>
              <Link
                to="/register"
                style={{
                  backgroundColor: "#2563eb",
                  color: "#ffffff",
                  textDecoration: "none",
                  padding: "6px 14px",
                  borderRadius: "6px",
                  fontWeight: "bold",
                }}
              >
                Register
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Main Content Area */}
      <main>
        <Routes>
          <Route path="/" element={<Subscription />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/subscription" element={<Subscription />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/apartment" element={<ApartmentAdmin />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;