const express = require("express");
const router = express.Router();
const Subscription = require("../models/Subscription");

// 1. Create a new subscription (Payment)
router.post("/", async (req, res) => {
  try {
    const { userEmail, planName, amount, status } = req.body;

    const newSub = new Subscription({
      userEmail,
      planName,
      amount,
      status: status || "Active",
    });

    await newSub.save();
    res.status(201).json({ message: "Subscription activated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to create subscription", error });
  }
});

// 2. Get all subscriptions (Admin Dashboard)
router.get("/", async (req, res) => {
  try {
    const subs = await Subscription.find().sort({ createdAt: -1 });
    res.json(subs);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch subscriptions", error });
  }
});

// 3. Get subscriptions for a specific user (Customer Dashboard)
router.get("/user/:email", async (req, res) => {
  try {
    const userSubs = await Subscription.find({ userEmail: req.params.email }).sort({ createdAt: -1 });
    res.json(userSubs);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch user subscriptions", error });
  }
});

module.exports = router;