import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function ApartmentAdmin() {
  const navigate = useNavigate();
  const userRole = localStorage.getItem("userRole");
  const assignedApartment = localStorage.getItem("assignedApartment");

  useEffect(() => {
    if (userRole !== "society_admin") {
      alert("Access Denied: Society Admin credentials required.");
      navigate("/login");
    }
  }, [userRole, navigate]);

  const [data, setData] = useState({
    totalUsers: 0,
    totalSubscriptions: 0,
    revenue: 0,
    users: [],
    subscriptions: [],
  });
  const [reportData, setReportData] = useState(null);
  const [activeTab, setActiveTab] = useState("residents");
  const [loading, setLoading] = useState(true);

  // Fetch basic apartment data
  useEffect(() => {
    if (!assignedApartment) return;

    fetch(`http://localhost:5000/api/admin/apartment-data/${encodeURIComponent(assignedApartment)}`)
      .then((res) => res.json())
      .then((resData) => {
        setData({
          totalUsers: resData.totalUsers || 0,
          totalSubscriptions: resData.totalSubscriptions || 0,
          revenue: resData.revenue || 0,
          users: resData.users || [],
          subscriptions: resData.subscriptions || [],
        });
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [assignedApartment]);

  // Fetch report data
  const fetchReport = () => {
    fetch(`http://localhost:5000/api/admin/reports?apartment=${encodeURIComponent(assignedApartment)}`)
      .then((res) => res.json())
      .then((resData) => setReportData(resData))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    if (assignedApartment) {
      fetchReport();
    }
  }, [assignedApartment]);

  // Export CSV Helper
  const downloadCSV = () => {
    if (!reportData || !reportData.records.length) {
      alert("No subscription records available to export.");
      return;
    }

    const headers = ["Resident Name,Email,Flat No,Vehicle,Plan,Amount,Payment Method,Transaction ID,Status,Date"];
    const rows = reportData.records.map((r) =>
      `"${r.residentName}","${r.email}","${r.flatNo}","${r.vehicle}","${r.planName}",${r.amount},"${r.paymentMethod}","${r.transactionId}","${r.status}","${r.date}"`
    );

    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${assignedApartment}_Report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ padding: "40px 20px", maxWidth: "1050px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ margin: "0 0 6px 0" }}>🏢 {assignedApartment} Portal</h1>
          <p style={{ margin: 0, color: "#64748b", fontSize: "14px" }}>
            Society Supervisor Dashboard • Filtered exclusively for {assignedApartment}
          </p>
        </div>
        <span style={{ background: "#dbeafe", color: "#1e40af", padding: "6px 14px", borderRadius: "20px", fontSize: "13px", fontWeight: "bold" }}>
          Society Admin
        </span>
      </div>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px", marginTop: "24px" }}>
        <div style={{ padding: "20px", background: "#eff6ff", borderRadius: "10px", textAlign: "center", border: "1px solid #dbeafe" }}>
          <h3 style={{ margin: "0 0 8px 0", color: "#1e40af", fontSize: "15px" }}>Registered Residents</h3>
          <p style={{ fontSize: "28px", fontWeight: "bold", margin: 0 }}>{data.totalUsers}</p>
        </div>
        <div style={{ padding: "20px", background: "#f0fdf4", borderRadius: "10px", textAlign: "center", border: "1px solid #dcfce7" }}>
          <h3 style={{ margin: "0 0 8px 0", color: "#166534", fontSize: "15px" }}>Active Subscriptions</h3>
          <p style={{ fontSize: "28px", fontWeight: "bold", margin: 0 }}>{data.totalSubscriptions}</p>
        </div>
        <div style={{ padding: "20px", background: "#fef2f2", borderRadius: "10px", textAlign: "center", border: "1px solid #fee2e2" }}>
          <h3 style={{ margin: "0 0 8px 0", color: "#991b1b", fontSize: "15px" }}>Total Revenue</h3>
          <p style={{ fontSize: "28px", fontWeight: "bold", margin: 0, color: "#b91c1c" }}>₹{data.revenue}</p>
        </div>
      </div>

      {/* Tab Switcher */}
      <div style={{ marginTop: "32px", display: "flex", gap: "10px" }}>
        <button
          onClick={() => setActiveTab("residents")}
          style={{
            padding: "10px 18px",
            cursor: "pointer",
            background: activeTab === "residents" ? "#2563eb" : "#e2e8f0",
            color: activeTab === "residents" ? "#fff" : "#334155",
            border: "none",
            borderRadius: "6px",
            fontWeight: "bold",
          }}
        >
          Flat Residents ({data.users.length})
        </button>
        <button
          onClick={() => setActiveTab("subscriptions")}
          style={{
            padding: "10px 18px",
            cursor: "pointer",
            background: activeTab === "subscriptions" ? "#2563eb" : "#e2e8f0",
            color: activeTab === "subscriptions" ? "#fff" : "#334155",
            border: "none",
            borderRadius: "6px",
            fontWeight: "bold",
          }}
        >
          Subscriptions ({data.subscriptions.length})
        </button>
        <button
          onClick={() => setActiveTab("report")}
          style={{
            padding: "10px 18px",
            cursor: "pointer",
            background: activeTab === "report" ? "#2563eb" : "#e2e8f0",
            color: activeTab === "report" ? "#fff" : "#334155",
            border: "none",
            borderRadius: "6px",
            fontWeight: "bold",
          }}
        >
          📊 Society Summary Report
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>Loading records...</div>
      ) : (
        <>
          {/* Tab 1: Residents */}
          {activeTab === "residents" && (
            <div style={{ marginTop: "20px" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", background: "#ffffff", borderRadius: "8px", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
                <thead>
                  <tr style={{ background: "#f8fafc", textAlign: "left", borderBottom: "1px solid #e2e8f0" }}>
                    <th style={{ padding: "12px" }}>Flat No</th>
                    <th style={{ padding: "12px" }}>Resident Name</th>
                    <th style={{ padding: "12px" }}>Vehicle Reg No</th>
                    <th style={{ padding: "12px" }}>Mobile</th>
                    <th style={{ padding: "12px" }}>Email</th>
                  </tr>
                </thead>
                <tbody>
                  {data.users.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ padding: "20px", textAlign: "center", color: "#64748b" }}>
                        No registered residents found.
                      </td>
                    </tr>
                  ) : (
                    data.users.map((u) => (
                      <tr key={u._id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                        <td style={{ padding: "12px", fontWeight: "bold", color: "#2563eb" }}>{u.flatNo}</td>
                        <td style={{ padding: "12px", fontWeight: "600" }}>{u.name}</td>
                        <td style={{ padding: "12px" }}>{u.vehicle}</td>
                        <td style={{ padding: "12px" }}>{u.mobile}</td>
                        <td style={{ padding: "12px", color: "#64748b" }}>{u.email}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Tab 2: Subscriptions */}
          {activeTab === "subscriptions" && (
            <div style={{ marginTop: "20px" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", background: "#ffffff", borderRadius: "8px", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
                <thead>
                  <tr style={{ background: "#f8fafc", textAlign: "left", borderBottom: "1px solid #e2e8f0" }}>
                    <th style={{ padding: "12px" }}>Resident Email</th>
                    <th style={{ padding: "12px" }}>Plan</th>
                    <th style={{ padding: "12px" }}>Amount</th>
                    <th style={{ padding: "12px" }}>Status</th>
                    <th style={{ padding: "12px" }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {data.subscriptions.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ padding: "20px", textAlign: "center", color: "#64748b" }}>
                        No active subscriptions found.
                      </td>
                    </tr>
                  ) : (
                    data.subscriptions.map((sub) => (
                      <tr key={sub._id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                        <td style={{ padding: "12px" }}>{sub.userEmail}</td>
                        <td style={{ padding: "12px", fontWeight: "600" }}>{sub.planName}</td>
                        <td style={{ padding: "12px", color: "#16a34a", fontWeight: "bold" }}>₹{sub.amount}</td>
                        <td style={{ padding: "12px" }}>
                          <span style={{ background: "#dcfce7", color: "#166534", padding: "4px 8px", borderRadius: "4px", fontSize: "12px", fontWeight: "bold" }}>
                            {sub.status}
                          </span>
                        </td>
                        <td style={{ padding: "12px", color: "#64748b" }}>{new Date(sub.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Tab 3: Society Summary Report */}
          {activeTab === "report" && reportData && (
            <div style={{ marginTop: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <div>
                  <h3 style={{ margin: "0 0 4px 0" }}>Financial & Subscription Summary</h3>
                  <p style={{ margin: 0, color: "#64748b", fontSize: "14px" }}>
                    Society: <b>{reportData.scope}</b>
                  </p>
                </div>
                <button
                  onClick={downloadCSV}
                  style={{
                    padding: "10px 16px",
                    background: "#16a34a",
                    color: "#fff",
                    border: "none",
                    borderRadius: "6px",
                    fontWeight: "bold",
                    cursor: "pointer",
                  }}
                >
                  📥 Download Society Report (CSV)
                </button>
              </div>

              {/* Plan breakdown chips */}
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "20px" }}>
                {Object.entries(reportData.planBreakdown).map(([planName, count]) => (
                  <div key={planName} style={{ background: "#f1f5f9", padding: "8px 14px", borderRadius: "8px", fontSize: "13px" }}>
                    <b>{planName}:</b> {count} subscriber{count > 1 ? "s" : ""}
                  </div>
                ))}
              </div>

              {/* Detailed Breakdown Table */}
              <table style={{ width: "100%", borderCollapse: "collapse", background: "#ffffff", borderRadius: "8px", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
                <thead>
                  <tr style={{ background: "#f8fafc", textAlign: "left", borderBottom: "1px solid #e2e8f0", fontSize: "13px" }}>
                    <th style={{ padding: "10px" }}>Resident</th>
                    <th style={{ padding: "10px" }}>Flat</th>
                    <th style={{ padding: "10px" }}>Vehicle</th>
                    <th style={{ padding: "10px" }}>Plan</th>
                    <th style={{ padding: "10px" }}>Amount</th>
                    <th style={{ padding: "10px" }}>Payment Method</th>
                    <th style={{ padding: "10px" }}>Txn ID</th>
                    <th style={{ padding: "10px" }}>Date</th>
                  </tr>
                </thead>
                <tbody style={{ fontSize: "13px" }}>
                  {reportData.records.length === 0 ? (
                    <tr>
                      <td colSpan="8" style={{ padding: "20px", textAlign: "center", color: "#64748b" }}>
                        No records for this report period.
                      </td>
                    </tr>
                  ) : (
                    reportData.records.map((r) => (
                      <tr key={r.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                        <td style={{ padding: "10px", fontWeight: "600" }}>{r.residentName}</td>
                        <td style={{ padding: "10px", color: "#2563eb", fontWeight: "bold" }}>{r.flatNo}</td>
                        <td style={{ padding: "10px" }}>{r.vehicle}</td>
                        <td style={{ padding: "10px" }}>{r.planName}</td>
                        <td style={{ padding: "10px", color: "#16a34a", fontWeight: "bold" }}>₹{r.amount}</td>
                        <td style={{ padding: "10px" }}>{r.paymentMethod}</td>
                        <td style={{ padding: "10px", color: "#64748b", fontFamily: "monospace" }}>{r.transactionId}</td>
                        <td style={{ padding: "10px", color: "#64748b" }}>{r.date}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default ApartmentAdmin;