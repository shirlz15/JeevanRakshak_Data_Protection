const express = require("express");
const router = express.Router();
const Health = require("../models/healthModel");

function calculateRisk(hr, temp) {
  let score = 0;
  if (hr > 100) score += 40;
  if (temp > 38) score += 40;

  if (score > 70) return "high";
  if (score > 40) return "moderate";
  return "low";
}

function getStatus(risk) {
  if (risk === "high") return "emergency";
  if (risk === "moderate") return "warning";
  return "normal";
}

function getTimestamp() {
  return new Date().toISOString();
}

router.post("/", async (req, res) => {
  const { heartRate, temperature } = req.body;

  const risk = calculateRisk(heartRate, temperature);
  const status = getStatus(risk);
  const timestamp = getTimestamp();

  const data = { heartRate, temperature, risk, status, timestamp };

  await Health.create(data);

  res.json(data);
});

router.get("/", async (req, res) => {
  const latest = await Health.findOne().sort({ timestamp: -1 });
  res.json(latest);
});

module.exports = router;