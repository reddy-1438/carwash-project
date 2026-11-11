const express = require("express");
const router = express.Router();
const User = require("../models/User");

// 1. Register a new user
router.post("/register", async (req, res) => {
  try {
    const { name, mobile, apartment, flatNo, vehicle, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const newUser = new User({
      name,
      mobile,
      apartment,
      flatNo,
      vehicle,
      email,
      password,
    });

    await newUser.save();
    res.status(201).json({ message: "Registration successful" });
  } catch (error) {
    res.status(500).json({ message: "Error registering user", error });
  }
});

// 2. User login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || user.password !== password) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    res.json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        apartment: user.apartment,
        flatNo: user.flatNo,
        vehicle: user.vehicle,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Error during login", error });
  }
});

// 3. Get all users (for Admin Dashboard)
router.get("/users", async (req, res) => {
  try {
    const users = await User.find({}, "-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch users", error });
  }
});

// 4. Get a single user's profile details by email (for Customer Dashboard)
router.get("/user/:email", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email }, "-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Error fetching user", error });
  }
});

module.exports = router;