const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

const app = express();
const PORT = process.env.PORT || 8080;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/carwash_db";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

app.use(cors());
app.use(express.json());

// -------------------------------------------------------------
// Root & Health Check Routes
// -------------------------------------------------------------
app.get("/", (req, res) => {
  res.json({
    status: "online",
    message: "Carwash Backend API is live and operational!",
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", uptime: process.uptime() });
});

// -------------------------------------------------------------
// MongoDB Connection & Auto-Seeding
// -------------------------------------------------------------
mongoose
  .connect(MONGO_URI)
  .then(async () => {
    console.log("MongoDB connected successfully.");
    await seedSuperAdmin();
    await seedDefaultPlans();
  })
  .catch((err) => console.error("MongoDB connection error:", err));

// -------------------------------------------------------------
// Mailer Setup (Real Production SMTP with Ethereal Fallback)
// -------------------------------------------------------------
let transporter;

async function setupMailer() {
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    // Production SMTP (e.g. Gmail App Password, Brevo, SendGrid)
    transporter = nodemailer.createTransport({
      service: process.env.SMTP_SERVICE || undefined,
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: Number(process.env.SMTP_PORT) || 465,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    console.log(`🚀 Production Mailer initialized using user: ${process.env.SMTP_USER}`);
  } else {
    // Fallback: Test Mailer via Ethereal
    try {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: testAccount.smtp.host,
        port: testAccount.smtp.port,
        secure: testAccount.smtp.secure,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      console.log("📬 Running with Ethereal Test Mailer (No real emails sent).");
      console.log(`Test Mail User: ${testAccount.user}`);
    } catch (err) {
      console.error("Failed to initialize test mailer:", err);
    }
  }
}
setupMailer();

// -------------------------------------------------------------
// Database Models & Schemas
// -------------------------------------------------------------
const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    mobile: { type: String, default: "" },
    apartment: { type: String, default: "" },
    flatNo: { type: String, default: "" },
    vehicle: { type: String, default: "" },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["customer", "society_admin", "super_admin"],
      default: "customer",
    },
    assignedApartment: { type: String, default: "" },
    isVerified: { type: Boolean, default: false },
    verificationToken: { type: String },
  },
  { timestamps: true }
);

const SubscriptionSchema = new mongoose.Schema(
  {
    userEmail: { type: String, required: true, lowercase: true, trim: true },
    planName: { type: String, required: true },
    amount: { type: Number, required: true },
    paymentMethod: { type: String, default: "UPI" },
    transactionId: { type: String, required: true },
    status: { type: String, default: "Active" },
  },
  { timestamps: true }
);

const PlanSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String, required: true },
  },
  { timestamps: true }
);

const ApartmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    address: { type: String, trim: true },
  },
  { timestamps: true }
);

const User = mongoose.model("User", UserSchema);
const Subscription = mongoose.model("Subscription", SubscriptionSchema);
const Plan = mongoose.model("Plan", PlanSchema);
const Apartment = mongoose.model("Apartment", ApartmentSchema);

// Auto-seed initial Super Admin
async function seedSuperAdmin() {
  try {
    const adminExists = await User.findOne({ role: "super_admin" });
    if (!adminExists) {
      const superAdmin = new User({
        name: "Super Admin",
        email: "admin@carwash.com",
        password: "admin123",
        role: "super_admin",
        isVerified: true,
      });
      await superAdmin.save();
      console.log("👑 Default Super Admin Created: admin@carwash.com / admin123");
    }
  } catch (err) {
    console.error("Error seeding super admin:", err);
  }
}

// Auto-seed default wash plans
async function seedDefaultPlans() {
  try {
    const planCount = await Plan.countDocuments();
    if (planCount === 0) {
      await Plan.insertMany([
        {
          name: "Basic Wash",
          price: 499,
          description: "Exterior foam wash, tire dressing, and crystal window cleaning.",
        },
        {
          name: "Standard Wash",
          price: 899,
          description: "Basic exterior wash plus interior vacuuming, dashboard polish, and door jambs.",
        },
        {
          name: "Premium Detailing",
          price: 1499,
          description: "Full interior deep steam clean, exterior polymer wax, tire shine, and engine wipe down.",
        },
      ]);
      console.log("🚗 Default wash plans seeded successfully!");
    }
  } catch (err) {
    console.error("Error seeding default plans:", err);
  }
}

// -------------------------------------------------------------
// Authentication Routes (/api/auth)
// -------------------------------------------------------------
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, mobile, apartment, flatNo, vehicle, email, password } = req.body;

    if (!email || !password || !name || !apartment) {
      return res.status(400).json({ message: "Please provide all required fields." });
    }

    const cleanEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return res.status(400).json({ message: "An account with this email already exists." });
    }

    const token = crypto.randomBytes(32).toString("hex");

    const newUser = new User({
      name,
      mobile,
      apartment,
      flatNo,
      vehicle,
      email: cleanEmail,
      password: password.trim(),
      role: "customer",
      isVerified: false,
      verificationToken: token,
    });

    await newUser.save();

    // Link sends resident directly to the frontend VerifyEmail page
    const verificationUrl = `${FRONTEND_URL}/verify-email?token=${token}`;

    if (transporter) {
      const mailSender = process.env.SMTP_FROM || process.env.SMTP_USER || '"Apartment Car Wash" <no-reply@apartmentcarwash.com>';
      const info = await transporter.sendMail({
        from: mailSender,
        to: cleanEmail,
        subject: "Verify Your Car Wash Account",
        html: `
          <div style="font-family: Arial, sans-serif; padding: 24px; max-width: 520px; border: 1px solid #e2e8f0; border-radius: 8px;">
            <h2 style="color: #0f172a; margin-top: 0;">🏎️ Welcome to Apartment Car Wash!</h2>
            <p>Hi ${name},</p>
            <p>Thank you for signing up. Please verify your email address to activate your account:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" style="background: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                Verify Email Address
              </a>
            </div>
            <p style="font-size: 13px; color: #64748b;">Or paste this link into your browser:</p>
            <p style="font-size: 12px; color: #2563eb; word-break: break-all;">${verificationUrl}</p>
          </div>
        `,
      });

      console.log(`📩 Verification email dispatched to: ${cleanEmail}`);
      if (!process.env.SMTP_USER) {
        console.log("🔗 Ethereal Preview URL:", nodemailer.getTestMessageUrl(info));
      }
    }

    res.status(201).json({
      message: "Registration successful! A verification link has been sent to your email inbox.",
    });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ message: "Registration failed", error: err.message });
  }
});

// JSON API endpoint used by React's VerifyEmail.jsx
app.get("/api/auth/verify-email/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const user = await User.findOne({ verificationToken: token });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired verification link." });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    res.json({ message: "Email verified successfully! You can now log in." });
  } catch (err) {
    console.error("Verification error:", err);
    res.status(500).json({ message: "Verification failed on server." });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: cleanEmail });

    if (!user || user.password !== password.trim()) {
      return res.status(400).json({ message: "Invalid Email or Password" });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        message: "Your email is not verified yet. Please check your inbox and click the verification link.",
      });
    }

    res.json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        apartment: user.apartment,
        assignedApartment: user.assignedApartment,
        flatNo: user.flatNo,
        mobile: user.mobile,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Login failed", error: err.message });
  }
});

// -------------------------------------------------------------
// Subscriptions & Payment Processing
// -------------------------------------------------------------
app.post("/api/subscription", async (req, res) => {
  try {
    const { userEmail, planName, amount, paymentMethod, transactionId } = req.body;

    if (!userEmail || !planName || !amount) {
      return res.status(400).json({ message: "Missing required subscription data." });
    }

    const generatedTxn = transactionId || `TXN_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    const newSub = new Subscription({
      userEmail: userEmail.trim().toLowerCase(),
      planName,
      amount: Number(amount),
      paymentMethod: paymentMethod || "UPI",
      transactionId: generatedTxn,
      status: "Active",
    });

    await newSub.save();

    res.status(201).json({
      message: "Payment processed and Subscription activated successfully!",
      subscription: newSub,
    });
  } catch (err) {
    console.error("Subscription Error:", err);
    res.status(500).json({ message: "Failed to process subscription", error: err.message });
  }
});

app.get("/api/subscription/user/:email", async (req, res) => {
  try {
    const userEmail = req.params.email.trim().toLowerCase();
    const subs = await Subscription.find({ userEmail }).sort({ createdAt: -1 });
    res.json(subs);
  } catch (err) {
    res.status(500).json({ message: "Error fetching user subscriptions", error: err.message });
  }
});

app.get("/api/subscription", async (req, res) => {
  try {
    const subscriptions = await Subscription.find().sort({ createdAt: -1 });
    res.json(subscriptions);
  } catch (err) {
    res.status(500).json({ message: "Error fetching subscriptions", error: err.message });
  }
});

// -------------------------------------------------------------
// Summary Reports Endpoint
// -------------------------------------------------------------
app.get("/api/admin/reports", async (req, res) => {
  try {
    const { apartment } = req.query;

    let userQuery = { role: "customer" };
    if (apartment && apartment !== "all") {
      userQuery.apartment = apartment;
    }

    const residents = await User.find(userQuery).select("-password").sort({ flatNo: 1 });
    const residentEmails = residents.map((r) => r.email.toLowerCase());

    const subscriptions = await Subscription.find({
      userEmail: { $in: residentEmails },
    }).sort({ createdAt: -1 });

    const totalResidents = residents.length;
    const totalSubscriptions = subscriptions.length;
    const totalRevenue = subscriptions.reduce((sum, s) => sum + (s.amount || 0), 0);

    const planBreakdown = {};
    subscriptions.forEach((sub) => {
      planBreakdown[sub.planName] = (planBreakdown[sub.planName] || 0) + 1;
    });

    const reportRows = subscriptions.map((sub) => {
      const resident = residents.find((r) => r.email.toLowerCase() === sub.userEmail.toLowerCase());
      return {
        id: sub._id,
        residentName: resident ? resident.name : "Unknown",
        email: sub.userEmail,
        apartment: resident ? resident.apartment : apartment !== "all" ? apartment : "N/A",
        flatNo: resident ? resident.flatNo : "N/A",
        vehicle: resident ? resident.vehicle : "N/A",
        planName: sub.planName,
        amount: sub.amount,
        paymentMethod: sub.paymentMethod || "UPI",
        transactionId: sub.transactionId || "N/A",
        status: sub.status,
        date: new Date(sub.createdAt).toLocaleDateString(),
      };
    });

    res.json({
      scope: apartment && apartment !== "all" ? apartment : "All Apartments",
      totalResidents,
      totalSubscriptions,
      totalRevenue,
      planBreakdown,
      records: reportRows,
    });
  } catch (err) {
    console.error("Report generation error:", err);
    res.status(500).json({ message: "Failed to generate report", error: err.message });
  }
});

// -------------------------------------------------------------
// Society Admins Management
// -------------------------------------------------------------
app.post("/api/admin/create-society-admin", async (req, res) => {
  try {
    const { name, email, password, assignedApartment } = req.body;

    if (!name || !email || !password || !assignedApartment) {
      return res.status(400).json({ message: "Name, email, password, and assigned apartment are required." });
    }

    const cleanEmail = email.trim().toLowerCase();
    const existing = await User.findOne({ email: cleanEmail });
    if (existing) {
      return res.status(400).json({ message: "A user with this email already exists." });
    }

    const newSocietyAdmin = new User({
      name: name.trim(),
      email: cleanEmail,
      password: password.trim(),
      role: "society_admin",
      assignedApartment: assignedApartment.trim(),
      isVerified: true,
    });

    await newSocietyAdmin.save();
    res.status(201).json({ message: "Society Admin created successfully!", admin: newSocietyAdmin });
  } catch (err) {
    res.status(500).json({ message: "Failed to create society admin", error: err.message });
  }
});

app.get("/api/admin/society-admins", async (req, res) => {
  try {
    const admins = await User.find({ role: "society_admin" }).select("-password").sort({ createdAt: -1 });
    res.json(admins);
  } catch (err) {
    res.status(500).json({ message: "Error loading society admins", error: err.message });
  }
});

app.delete("/api/admin/society-admins/:id", async (req, res) => {
  try {
    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Society Admin not found" });
    res.json({ message: "Society Admin removed successfully." });
  } catch (err) {
    res.status(500).json({ message: "Error deleting society admin", error: err.message });
  }
});

// -------------------------------------------------------------
// Apartment Management Routes (/api/apartments)
// -------------------------------------------------------------
app.get("/api/apartments", async (req, res) => {
  try {
    const apartments = await Apartment.find().sort({ name: 1 });
    res.json(apartments);
  } catch (err) {
    res.status(500).json({ message: "Error loading apartments", error: err.message });
  }
});

app.post("/api/apartments", async (req, res) => {
  try {
    const { name, address } = req.body;
    if (!name) {
      return res.status(400).json({ message: "Apartment society name is required." });
    }

    const cleanName = name.trim();
    const existing = await Apartment.findOne({ name: { $regex: new RegExp(`^${cleanName}$`, "i") } });
    if (existing) {
      return res.status(400).json({ message: "An apartment with this name already exists." });
    }

    const newApartment = new Apartment({
      name: cleanName,
      address: address ? address.trim() : "",
    });
    const saved = await newApartment.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ message: "Error adding apartment", error: err.message });
  }
});

app.delete("/api/apartments/:id", async (req, res) => {
  try {
    const deleted = await Apartment.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Apartment not found" });
    res.json({ message: "Apartment deleted successfully." });
  } catch (err) {
    res.status(500).json({ message: "Error deleting apartment", error: err.message });
  }
});

// -------------------------------------------------------------
// Society Manager Filtered Data Route
// -------------------------------------------------------------
app.get("/api/admin/apartment-data/:apartmentName", async (req, res) => {
  try {
    const { apartmentName } = req.params;

    const users = await User.find({ apartment: apartmentName, role: "customer" })
      .select("-password")
      .sort({ flatNo: 1 });

    const userEmails = users.map((u) => u.email.toLowerCase());

    const subscriptions = await Subscription.find({
      userEmail: { $in: userEmails },
    }).sort({ createdAt: -1 });

    const revenue = subscriptions.reduce((sum, sub) => sum + (sub.amount || 0), 0);

    res.json({
      apartment: apartmentName,
      totalUsers: users.length,
      totalSubscriptions: subscriptions.length,
      revenue,
      users,
      subscriptions,
    });
  } catch (err) {
    console.error("Apartment data error:", err);
    res.status(500).json({ message: "Failed to retrieve apartment data", error: err.message });
  }
});

// -------------------------------------------------------------
// Dynamic Plans CRUD Routes
// -------------------------------------------------------------
app.get("/api/plans", async (req, res) => {
  try {
    const plans = await Plan.find().sort({ price: 1 });
    res.json(plans);
  } catch (err) {
    res.status(500).json({ message: "Error loading plans", error: err.message });
  }
});

app.post("/api/plans", async (req, res) => {
  try {
    const { name, price, description } = req.body;
    if (!name || !price || !description) {
      return res.status(400).json({ message: "Name, price, and description are required." });
    }
    const newPlan = new Plan({ name: name.trim(), price: Number(price), description: description.trim() });
    const savedPlan = await newPlan.save();
    res.status(201).json(savedPlan);
  } catch (err) {
    res.status(500).json({ message: "Error creating plan", error: err.message });
  }
});

app.delete("/api/plans/:id", async (req, res) => {
  try {
    const deletedPlan = await Plan.findByIdAndDelete(req.params.id);
    if (!deletedPlan) return res.status(404).json({ message: "Plan not found" });
    res.json({ message: "Plan deleted successfully." });
  } catch (err) {
    res.status(500).json({ message: "Error deleting plan", error: err.message });
  }
});

// -------------------------------------------------------------
// General Users
// -------------------------------------------------------------
app.get("/api/auth/users", async (req, res) => {
  try {
    const users = await User.find({ role: "customer" }).select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Error fetching users", error: err.message });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Backend server running on http://0.0.0.0:${PORT}`);
});