const mongoose = require("mongoose");

const healthSchema = new mongoose.Schema({
  heartRate: Number,
  temperature: Number,
  risk: String,
  status: String,
  timestamp: String
});

module.exports = mongoose.model("Health", healthSchema);