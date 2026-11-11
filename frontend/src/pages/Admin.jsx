import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";

function Admin() {
  const navigate = useNavigate();
  const userRole = localStorage.getItem("userRole");

  useEffect(() => {
    if (userRole !== "super_admin") {
      alert("Access Denied: Super Admin credentials required.");
      navigate("/login");
    }
  }, [userRole, navigate]);

  const [users, setUsers] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [plans, setPlans] = useState([]);
  const [apartments, setApartments] = useState([]);
  const [societyAdmins, setSocietyAdmins] = useState([]);
  const [activeTab, setActiveTab] = useState("societyAdmins");

  // Form states
  const [aptForm, setAptForm] = useState({ name: "", address: "" });
  const [adminForm, setAdminForm] = useState({
    name: "",
    email: "",
    password: "",
    assignedApartment: "",
  });
  const [planForm, setPlanForm] = useState({ name: "", price: "", description: "" });

  // Reporting states
  const [selectedReportApartment, setSelectedReportApartment] = useState("all");
  const [reportData, setReportData] = useState(null);

  const fetchPlans = () => {
    API.get("/api/plans")
      .then((res) => setPlans(Array.isArray(res.data) ? res.data : []))
      .catch((err) => console.error(err));
  };

  const fetchApartments = () => {
    API.get("/api/apartments")
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : [];
        setApartments(list);
        if (list.length > 0 && !adminForm.assignedApartment) {
          setAdminForm((prev) => ({ ...prev, assignedApartment: list[0].name }));
        }
      })
      .catch((err) => console.error(err));
  };

  const fetchSocietyAdmins = () => {
    API.get("/api/admin/society-admins")
      .then((res) => setSocietyAdmins(Array.isArray(res.data) ? res.data : []))
      .catch((err) => console.error(err));
  };

  const fetchReport = (apartmentScope) => {
    API.get(`/api/admin/reports?apartment=${encodeURIComponent(apartmentScope)}`)
      .then((res) => setReportData(res.data))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    API.get("/api/auth/users")
      .then((res) => setUsers(Array.isArray(res.data) ? res.data : []))
      .catch((err) => console.error(err));

    API.get("/api/subscription")
      .then((res) => setSubscriptions(Array.isArray(res.data) ? res.data : []))
      .catch((err) => console.error(err));

    fetchPlans();
    fetchApartments();
    fetchSocietyAdmins();
    fetchReport("all");
  }, []);

  const totalRevenue = subscriptions.reduce((sum, item) => sum + (item.amount || 0), 0);

  // Handlers
  const handleAddApartment = async (e) => {
    e.preventDefault();
    if (!aptForm.name.trim()) return;

    try {
      const res = await API.post("/api/apartments", aptForm);
      if (res.status === 200 || res.status === 201) {
        alert("Apartment added successfully!");
        setAptForm({ name: "", address: "" });
        fetchApartments();
      } else {
        alert(res.data?.message || "Failed to add apartment.");
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to add apartment.");
    }
  };

  const handleDeleteApartment = async (id) => {
    if (!window.confirm("Delete this apartment?")) return;
    try {
      const res = await API.delete(`/api/apartments/${id}`);
      if (res.status === 200) fetchApartments();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateSocietyAdmin = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/api/admin/create-society-admin", adminForm);
      if (res.status === 200 || res.status === 201) {
        alert(`Society Admin created for ${adminForm.assignedApartment}!`);
        setAdminForm({
          name: "",
          email: "",
          password: "",
          assignedApartment: apartments.length > 0 ? apartments[0].name : "",
        });
        fetchSocietyAdmins();
      } else {
        alert(res.data?.message || "Failed to create society admin.");
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to create society admin.");
    }
  };

  const handleDeleteSocietyAdmin = async (id) => {
    if (!window.confirm("Remove this Society Admin login?")) return;
    try {
      const res = await API.delete(`/api/admin/society-admins/${id}`);
      if (res.status === 200) fetchSocietyAdmins();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddPlan = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/api/plans", planForm);
      if (res.status === 200 || res.status === 201) {
        alert("Plan created!");
        setPlanForm({ name: "", price: "", description: "" });
        fetchPlans();
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to create plan.");
    }
  };

  const handleDeletePlan = async (id) => {
    if (!window.confirm("Delete plan?")) return;
    try {
      const res = await API.delete(`/api/plans/${id}`);
      if (res.status === 200) fetchPlans();
    } catch (err) {
      console.error(err);
    }
  };

  const handleScopeChange = (e) => {
    const val = e.target.value;
    setSelectedReportApartment(val);
    fetchReport(val);
  };

  const downloadCSV = () => {
    if (!reportData || !reportData.records.length) {
      alert("No data available to export.");
      return;
    }

    const headers = ["Resident Name,Email,Apartment,Flat No,Vehicle,Plan,Amount,Payment Method,Transaction ID,Status,Date"];
    const rows = reportData.records.map((r) =>
      `"${r.residentName}","${r.email}","${r.apartment}","${r.flatNo}","${r.vehicle}","${r.planName}",${r.amount},"${r.paymentMethod}","${r.transactionId}","${r.status}","${r.date}"`
    );

    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `SuperAdmin_Report_${selectedReportApartment}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ padding: "40px 20px", maxWidth: "1050px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>👑 Super Admin Central Control</h1>
        <span style={{ fontSize: "13px", background: "#fef3c7", color: "#92400e", padding: "6px 12px", borderRadius: "20px", fontWeight: "bold" }}>
          Super Admin Privileges
        </span>
      </div>

      {/* Global Analytics Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px", marginTop: "24px" }}>
        <div style={{ padding: "20px", background: "#eff6ff", borderRadius: "10px", textAlign: "center" }}>
          <h3 style={{ margin: "0 0 8px 0", color: "#1e40af", fontSize: "15px" }}>Global Residents</h3>
          <p style={{ fontSize: "28px", fontWeight: "bold", margin: 0 }}>{users.length}</p>
        </div>
        <div style={{ padding: "20px", background: "#f0fdf4", borderRadius: "10px", textAlign: "center" }}>
          <h3 style={{ margin: "0 0 8px 0", color: "#166534", fontSize: "15px" }}>Total Subscriptions</h3>
          <p style={{ fontSize: "28px", fontWeight: "bold", margin: 0 }}>{subscriptions.length}</p>
        </div>
        <div style={{ padding: "20px", background: "#fef2f2", borderRadius: "10px", textAlign: "center" }}>
          <h3 style={{ margin: "0 0 8px 0", color: "#991b1b", fontSize: "15px" }}>Platform Revenue</h3>
          <p style={{ fontSize: "28px", fontWeight: "bold", margin: 0, color: "#b91c1c" }}>₹{totalRevenue}</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{ marginTop: "32px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
        <button
          onClick={() => setActiveTab("societyAdmins")}
          style={{
            padding: "10px 18px",
            cursor: "pointer",
            background: activeTab === "societyAdmins" ? "#2563eb" : "#e2e8f0",
            color: activeTab === "societyAdmins" ? "#fff" : "#334155",
            border: "none",
            borderRadius: "6px",
            fontWeight: "bold",
          }}
        >
          🔑 Society Admins ({societyAdmins.length})
        </button>
        <button
          onClick={() => setActiveTab("reports")}
          style={{
            padding: "10px 18px",
            cursor: "pointer",
            background: activeTab === "reports" ? "#2563eb" : "#e2e8f0",
            color: activeTab === "reports" ? "#fff" : "#334155",
            border: "none",
            borderRadius: "6px",
            fontWeight: "bold",
          }}
        >
          📈 Reports & Analytics
        </button>
        <button
          onClick={() => setActiveTab("apartments")}
          style={{
            padding: "10px 18px",
            cursor: "pointer",
            background: activeTab === "apartments" ? "#2563eb" : "#e2e8f0",
            color: activeTab === "apartments" ? "#fff" : "#334155",
            border: "none",
            borderRadius: "6px",
            fontWeight: "bold",
          }}
        >
          🏢 Apartments ({apartments.length})
        </button>
        <button
          onClick={() => setActiveTab("plans")}
          style={{
            padding: "10px 18px",
            cursor: "pointer",
            background: activeTab === "plans" ? "#2563eb" : "#e2e8f0",
            color: activeTab === "plans" ? "#fff" : "#334155",
            border: "none",
            borderRadius: "6px",
            fontWeight: "bold",
          }}
        >
          ⚙️ Plans ({plans.length})
        </button>
        <button
          onClick={() => setActiveTab("users")}
          style={{
            padding: "10px 18px",
            cursor: "pointer",
            background: activeTab === "users" ? "#2563eb" : "#e2e8f0",
            color: activeTab === "users" ? "#fff" : "#334155",
            border: "none",
            borderRadius: "6px",
            fontWeight: "bold",
          }}
        >
          👥 Residents ({users.length})
        </button>
      </div>

      {/* Tab: Reports & Analytics */}
      {activeTab === "reports" && reportData && (
        <div style={{ marginTop: "20px" }}>
          <div style={{ background: "#ffffff", padding: "20px", borderRadius: "8px", border: "1px solid #e2e8f0", marginBottom: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <label style={{ fontWeight: "bold", fontSize: "14px" }}>Filter by Apartment:</label>
                <select
                  value={selectedReportApartment}
                  onChange={handleScopeChange}
                  style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "14px", fontWeight: "600" }}
                >
                  <option value="all">🌐 All Apartments (Combined)</option>
                  {apartments.map((apt) => (
                    <option key={apt._id} value={apt.name}>
                      🏢 {apt.name}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={downloadCSV}
                style={{
                  padding: "10px 18px",
                  background: "#16a34a",
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
              >
                📥 Download Filtered Report (CSV)
              </button>
            </div>

            {/* Filtered Metrics */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginTop: "20px" }}>
              <div style={{ padding: "14px", background: "#f8fafc", borderRadius: "6px", textAlign: "center" }}>
                <div style={{ color: "#64748b", fontSize: "13px" }}>Scope Residents</div>
                <div style={{ fontSize: "22px", fontWeight: "bold" }}>{reportData.totalResidents}</div>
              </div>
              <div style={{ padding: "14px", background: "#f8fafc", borderRadius: "6px", textAlign: "center" }}>
                <div style={{ color: "#64748b", fontSize: "13px" }}>Scope Subscriptions</div>
                <div style={{ fontSize: "22px", fontWeight: "bold" }}>{reportData.totalSubscriptions}</div>
              </div>
              <div style={{ padding: "14px", background: "#f8fafc", borderRadius: "6px", textAlign: "center" }}>
                <div style={{ color: "#64748b", fontSize: "13px" }}>Scope Revenue</div>
                <div style={{ fontSize: "22px", fontWeight: "bold", color: "#16a34a" }}>₹{reportData.totalRevenue}</div>
              </div>
            </div>
          </div>

          {/* Table */}
          <table style={{ width: "100%", borderCollapse: "collapse", background: "#ffffff", borderRadius: "8px", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
            <thead>
              <tr style={{ background: "#f8fafc", textAlign: "left", borderBottom: "1px solid #e2e8f0", fontSize: "13px" }}>
                <th style={{ padding: "10px" }}>Resident</th>
                <th style={{ padding: "10px" }}>Apartment</th>
                <th style={{ padding: "10px" }}>Flat No</th>
                <th style={{ padding: "10px" }}>Vehicle</th>
                <th style={{ padding: "10px" }}>Plan</th>
                <th style={{ padding: "10px" }}>Amount</th>
                <th style={{ padding: "10px" }}>Txn ID</th>
                <th style={{ padding: "10px" }}>Date</th>
              </tr>
            </thead>
            <tbody style={{ fontSize: "13px" }}>
              {reportData.records.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ padding: "20px", textAlign: "center", color: "#64748b" }}>
                    No subscription transactions recorded under this scope.
                  </td>
                </tr>
              ) : (
                reportData.records.map((r) => (
                  <tr key={r.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "10px", fontWeight: "600" }}>{r.residentName}</td>
                    <td style={{ padding: "10px", fontWeight: "bold", color: "#0f172a" }}>{r.apartment}</td>
                    <td style={{ padding: "10px", color: "#2563eb", fontWeight: "bold" }}>{r.flatNo}</td>
                    <td style={{ padding: "10px" }}>{r.vehicle}</td>
                    <td style={{ padding: "10px" }}>{r.planName}</td>
                    <td style={{ padding: "10px", color: "#16a34a", fontWeight: "bold" }}>₹{r.amount}</td>
                    <td style={{ padding: "10px", color: "#64748b", fontFamily: "monospace" }}>{r.transactionId}</td>
                    <td style={{ padding: "10px", color: "#64748b" }}>{r.date}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab: Society Admins Management */}
      {activeTab === "societyAdmins" && (
        <div style={{ marginTop: "20px" }}>
          <div style={{ background: "#fff", padding: "20px", borderRadius: "8px", border: "1px solid #e2e8f0", marginBottom: "24px" }}>
            <h3 style={{ marginTop: 0 }}>➕ Create Society Admin Login</h3>
            {apartments.length === 0 ? (
              <p style={{ color: "#b91c1c", fontSize: "14px" }}>
                ⚠️ Please add at least one Apartment in the "Apartments" tab first.
              </p>
            ) : (
              <form onSubmit={handleCreateSocietyAdmin} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "4px" }}>Manager Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Ramesh Kumar"
                    value={adminForm.name}
                    onChange={(e) => setAdminForm({ ...adminForm, name: e.target.value })}
                    required
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", boxSizing: "border-box" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "4px" }}>Assign Society</label>
                  <select
                    value={adminForm.assignedApartment}
                    onChange={(e) => setAdminForm({ ...adminForm, assignedApartment: e.target.value })}
                    required
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", boxSizing: "border-box", background: "#fff" }}
                  >
                    {apartments.map((apt) => (
                      <option key={apt._id} value={apt.name}>
                        {apt.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "4px" }}>Login Email</label>
                  <input
                    type="email"
                    placeholder="e.g. ramesh@concorde.com"
                    value={adminForm.email}
                    onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
                    required
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", boxSizing: "border-box" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "4px" }}>Password</label>
                  <input
                    type="password"
                    placeholder="Password"
                    value={adminForm.password}
                    onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
                    required
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", boxSizing: "border-box" }}
                  />
                </div>

                <div style={{ gridColumn: "span 2" }}>
                  <button
                    type="submit"
                    style={{ padding: "10px 20px", background: "#2563eb", color: "#fff", border: "none", borderRadius: "6px", fontWeight: "bold", cursor: "pointer" }}
                  >
                    Create Society Admin Account
                  </button>
                </div>
              </form>
            )}
          </div>

          <table style={{ width: "100%", borderCollapse: "collapse", background: "#ffffff", borderRadius: "8px", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
            <thead>
              <tr style={{ background: "#f8fafc", textAlign: "left", borderBottom: "1px solid #e2e8f0" }}>
                <th style={{ padding: "12px" }}>Manager Name</th>
                <th style={{ padding: "12px" }}>Email</th>
                <th style={{ padding: "12px" }}>Assigned Apartment</th>
                <th style={{ padding: "12px", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {societyAdmins.map((adm) => (
                <tr key={adm._id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "12px", fontWeight: "600" }}>👤 {adm.name}</td>
                  <td style={{ padding: "12px", color: "#2563eb" }}>{adm.email}</td>
                  <td style={{ padding: "12px", fontWeight: "bold" }}>🏢 {adm.assignedApartment}</td>
                  <td style={{ padding: "12px", textAlign: "right" }}>
                    <button
                      onClick={() => handleDeleteSocietyAdmin(adm._id)}
                      style={{ padding: "6px 12px", background: "#ef4444", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}
                    >
                      Remove Access
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab: Apartments */}
      {activeTab === "apartments" && (
        <div style={{ marginTop: "20px" }}>
          <div style={{ background: "#fff", padding: "20px", borderRadius: "8px", border: "1px solid #e2e8f0", marginBottom: "24px" }}>
            <h3 style={{ marginTop: 0 }}>➕ Add Apartment Society</h3>
            <form onSubmit={handleAddApartment} style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: "14px", alignItems: "end" }}>
              <input
                type="text"
                placeholder="Apartment Name"
                value={aptForm.name}
                onChange={(e) => setAptForm({ ...aptForm, name: e.target.value })}
                required
                style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
              />
              <input
                type="text"
                placeholder="Area / Landmark"
                value={aptForm.address}
                onChange={(e) => setAptForm({ ...aptForm, address: e.target.value })}
                style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
              />
              <button type="submit" style={{ padding: "9px 20px", background: "#2563eb", color: "#fff", border: "none", borderRadius: "6px", fontWeight: "bold", cursor: "pointer" }}>
                Add Apartment
              </button>
            </form>
          </div>

          <table style={{ width: "100%", borderCollapse: "collapse", background: "#ffffff", borderRadius: "8px", overflow: "hidden" }}>
            <thead>
              <tr style={{ background: "#f8fafc", textAlign: "left", borderBottom: "1px solid #e2e8f0" }}>
                <th style={{ padding: "12px" }}>Apartment</th>
                <th style={{ padding: "12px" }}>Address</th>
                <th style={{ padding: "12px", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {apartments.map((apt) => (
                <tr key={apt._id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "12px", fontWeight: "bold" }}>🏢 {apt.name}</td>
                  <td style={{ padding: "12px", color: "#64748b" }}>{apt.address || "—"}</td>
                  <td style={{ padding: "12px", textAlign: "right" }}>
                    <button onClick={() => handleDeleteApartment(apt._id)} style={{ padding: "6px 12px", background: "#ef4444", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab: Plans */}
      {activeTab === "plans" && (
        <div style={{ marginTop: "20px" }}>
          <div style={{ background: "#fff", padding: "20px", borderRadius: "8px", border: "1px solid #e2e8f0", marginBottom: "24px" }}>
            <h3 style={{ marginTop: 0 }}>➕ Add New Plan</h3>
            <form onSubmit={handleAddPlan} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
              <input
                type="text"
                placeholder="Plan Name"
                value={planForm.name}
                onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
                required
                style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
              />
              <input
                type="number"
                placeholder="Price (₹)"
                value={planForm.price}
                onChange={(e) => setPlanForm({ ...planForm, price: e.target.value })}
                required
                style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
              />
              <input
                type="text"
                placeholder="Description"
                value={planForm.description}
                onChange={(e) => setPlanForm({ ...planForm, description: e.target.value })}
                required
                style={{ gridColumn: "span 2", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
              />
              <button type="submit" style={{ padding: "10px 20px", background: "#2563eb", color: "#fff", border: "none", borderRadius: "6px", fontWeight: "bold", cursor: "pointer" }}>
                Create Plan
              </button>
            </form>
          </div>

          <table style={{ width: "100%", borderCollapse: "collapse", background: "#ffffff", borderRadius: "8px", overflow: "hidden" }}>
            <thead>
              <tr style={{ background: "#f8fafc", textAlign: "left", borderBottom: "1px solid #e2e8f0" }}>
                <th style={{ padding: "12px" }}>Plan Name</th>
                <th style={{ padding: "12px" }}>Price</th>
                <th style={{ padding: "12px" }}>Description</th>
                <th style={{ padding: "12px", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {plans.map((p) => (
                <tr key={p._id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "12px", fontWeight: "bold" }}>{p.name}</td>
                  <td style={{ padding: "12px", color: "#16a34a", fontWeight: "bold" }}>₹{p.price}</td>
                  <td style={{ padding: "12px" }}>{p.description}</td>
                  <td style={{ padding: "12px", textAlign: "right" }}>
                    <button onClick={() => handleDeletePlan(p._id)} style={{ padding: "6px 12px", background: "#ef4444", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab: Residents */}
      {activeTab === "users" && (
        <div style={{ marginTop: "20px" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", background: "#ffffff", borderRadius: "8px", overflow: "hidden" }}>
            <thead>
              <tr style={{ background: "#f8fafc", textAlign: "left", borderBottom: "1px solid #e2e8f0" }}>
                <th style={{ padding: "12px" }}>Name</th>
                <th style={{ padding: "12px" }}>Email</th>
                <th style={{ padding: "12px", fontWeight: "600" }}>Apartment</th>
                <th style={{ padding: "12px" }}>Flat No</th>
                <th style={{ padding: "12px" }}>Vehicle</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "12px" }}>{u.name}</td>
                  <td style={{ padding: "12px" }}>{u.email}</td>
                  <td style={{ padding: "12px", fontWeight: "600" }}>{u.apartment}</td>
                  <td style={{ padding: "12px" }}>{u.flatNo}</td>
                  <td style={{ padding: "12px" }}>{u.vehicle}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Admin;