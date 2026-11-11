const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema({
  userEmail: { type: String, required: true },
  planName: { type: String, required: true },
  amount: { type: Number, required: true },
  status: { type: String, default: "Active" },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Subscription", subscriptionSchema);