const express = require("express");
const router = express.Router();
const Plan = require("../models/Plan");

// 1. Get all plans (Used by both Admin and Customer)
router.get("/", async (req, res) => {
  try {
    const plans = await Plan.find().sort({ price: 1 });
    res.json(plans);
  } catch (err) {
    res.status(500).json({ message: "Error fetching plans", error: err.message });
  }
});

// 2. Add a new plan (Admin)
router.post("/", async (req, res) => {
  try {
    const { name, price, description } = req.body;
    if (!name || !price || !description) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const newPlan = new Plan({
      name,
      price: Number(price),
      description,
    });

    const savedPlan = await newPlan.save();
    res.status(201).json(savedPlan);
  } catch (err) {
    res.status(500).json({ message: "Error adding plan", error: err.message });
  }
});

// 3. Update an existing plan (Admin)
router.put("/:id", async (req, res) => {
  try {
    const { name, price, description } = req.body;
    const updatedPlan = await Plan.findByIdAndUpdate(
      req.params.id,
      { name, price: Number(price), description },
      { new: true }
    );
    if (!updatedPlan) {
      return res.status(404).json({ message: "Plan not found" });
    }
    res.json(updatedPlan);
  } catch (err) {
    res.status(500).json({ message: "Error updating plan", error: err.message });
  }
});

// 4. Delete a plan (Admin)
router.delete("/:id", async (req, res) => {
  try {
    const deletedPlan = await Plan.findByIdAndDelete(req.params.id);
    if (!deletedPlan) {
      return res.status(404).json({ message: "Plan not found" });
    }
    res.json({ message: "Plan removed successfully." });
  } catch (err) {
    res.status(500).json({ message: "Error deleting plan", error: err.message });
  }
});

module.exports = router;