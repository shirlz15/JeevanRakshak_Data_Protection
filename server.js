require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require("./config/db");
const Health = require("./models/healthModel");

const app = express();
const port = process.env.PORT || 5000;

// ─── Twilio Setup ───
const twilio = require('twilio');
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);
const TWILIO_NUMBER = process.env.TWILIO_PHONE_NUMBER;
const guardians = (process.env.GUARDIAN_NUMBERS || '').split(',').filter(Boolean);

connectDB();

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// ─── Risk Calculation ───
function calculateRisk(hr, temp) {
  let score = 0;
  if (hr > 100) score += 40;
  if (temp > 38) score += 40;
  return score > 70 ? "high" : score > 40 ? "moderate" : "low";
}

// ─── POST /api/data ───
app.post('/api/data', async (req, res) => {
  const { heartRate, temperature } = req.body;
  const risk = calculateRisk(heartRate, temperature);
  const data = {
    heartRate,
    temperature,
    risk,
    status: risk === "high" ? "emergency" : risk === "moderate" ? "warning" : "normal",
    timestamp: new Date().toISOString()
  };
  try {
    await Health.create(data);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "DB Error" });
  }
});

// ─── GET /api/data ───
app.get('/api/data', async (req, res) => {
  try {
    const latest = await Health.findOne().sort({ timestamp: -1 });
    res.json(latest);
  } catch (err) {
    res.status(500).json({ error: "DB Error" });
  }
});

// ─── Delay Utility ───
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// ─── Twilio Call Function ───
function sendCall(number, temperature, oxygen) {
  return twilioClient.calls.create({
    twiml: `<Response>
      <Say voice="alice" language="en-US">
        Emergency! Patient condition is critical.
        Temperature ${temperature} degrees.
        Oxygen level ${oxygen} percent.
        Please respond immediately.
      </Say>
    </Response>`,
    to: number,
    from: TWILIO_NUMBER
  });
}

// ─── GET /api/sensor (Real Twilio Alerts) ───
app.get('/api/sensor', async (req, res) => {
  const temperature = parseFloat(req.query.temp) || 37;
  const oxygen = parseFloat(req.query.oxy) || 98;
  const lat = req.query.lat || "9.9252";
  const lon = req.query.lon || "78.1198";

  console.log("📡 Sensor Data — Temp:", temperature, "Oxygen:", oxygen);

  const isEmergency = temperature > 38 || oxygen < 90;

  if (isEmergency) {
    try {
      // 🚀 Dispatch all alerts in parallel (Vercel Serverless Friendly)
      console.log("🚨 Dispatching Calls, SMS, and WhatsApp simultaneously...");
      
      const callPromises = guardians.map(num =>
        sendCall(num, temperature, oxygen)
          .then(() => console.log("✅ CALL:", num))
          .catch(err => console.log("❌ CALL ERROR:", num, err.message))
      );

      const smsPromises = guardians.map(num =>
        twilioClient.messages.create({
          body: `🚨 JEEVANRAKSHAK EMERGENCY ALERT!\n\n🌡 Temperature: ${temperature}°C\n🫁 Oxygen: ${oxygen}%\n\n📍 Location: https://maps.google.com/?q=${lat},${lon}\n\n⚠️ Critical health condition detected.\nAmbulance dispatched. Please respond immediately.`,
          from: TWILIO_NUMBER,
          to: num
        })
          .then(() => console.log("✅ SMS:", num))
          .catch(err => console.log("❌ SMS ERROR:", num, err.message))
      );

      const whatsappPromises = guardians.map(num =>
        twilioClient.messages.create({
          body: `🚨 JEEVANRAKSHAK EMERGENCY ALERT!\n\n🌡 Temperature: ${temperature}°C\n🫁 Oxygen: ${oxygen}%\n\n📍 Location: https://maps.google.com/?q=${lat},${lon}\n\n⚠️ Critical health condition detected.\nAmbulance dispatched. Please respond immediately.`,
          from: "whatsapp:+14155238886",
          to: "whatsapp:" + num
        })
          .then(() => console.log("✅ WHATSAPP:", num))
          .catch(err => console.log("❌ WHATSAPP ERROR:", num, err.message))
      );

      // Wait for all requests to Twilio to dispatch
      await Promise.all([...callPromises, ...smsPromises, ...whatsappPromises]);

      console.log("🚨 ALL ALERTS SENT SUCCESSFULLY");
      res.json({ status: "emergency", message: "🚨 Emergency Alert Triggered — Calls, SMS, WhatsApp sent to guardians" });

    } catch (err) {
      console.error("Alert system error:", err);
      res.status(500).json({ status: "error", message: "❌ Error sending alerts" });
    }
  } else {
    res.json({ status: "normal", message: "✅ Patient Normal — No alerts sent" });
  }
});

// ─── Language Maps ───
const languageMap = {
  "en-IN": "English", "ta-IN": "Tamil", "hi-IN": "Hindi",
  "te-IN": "Telugu", "ml-IN": "Malayalam", "kn-IN": "Kannada",
  "mr-IN": "Marathi", "gu-IN": "Gujarati", "bn-IN": "Bengali",
  "or-IN": "Odia", "ur-PK": "Urdu", "sa-IN": "Sanskrit",
  "fr-FR": "French", "es-ES": "Spanish", "de-DE": "German"
};

// ─── POST /api/voice (Groq AI — Multilingual) ───
app.post("/api/voice", async (req, res) => {
  try {
    const userText = req.body.text;
    const lang = req.body.lang || "en-IN";
    const languageName = languageMap[lang] || "English";

    console.log(`🎙 Voice request [${languageName}]: "${userText}"`);

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: `You are JeevanRakshak, a multilingual AI medical health assistant. You MUST reply ONLY in ${languageName} language. Give short, helpful medical advice. Include relevant emojis. Be compassionate and clear. If the condition sounds serious, advise visiting a doctor immediately.`
          },
          {
            role: "user",
            content: `The user speaks ${languageName} (locale: ${lang}). Reply ONLY in ${languageName}. Their message: "${userText}"`
          }
        ],
        temperature: 0.7,
        max_tokens: 300
      })
    });

    const data = await response.json();
    console.log("Groq response status:", response.status);

    if (!response.ok) {
      console.error("Groq API error:", JSON.stringify(data));
      return res.status(500).json({ reply: `AI service error: ${data.error?.message || 'Unknown error'}` });
    }
    if (!data.choices || !data.choices[0]) {
      console.error("Unexpected Groq response:", JSON.stringify(data));
      return res.status(500).json({ reply: "Unexpected AI response format" });
    }

    const reply = data.choices[0].message.content;
    console.log(`🤖 AI reply [${languageName}]: "${reply.substring(0, 80)}..."`);
    res.json({ reply });

  } catch (err) {
    console.error("Voice endpoint error:", err);
    res.status(500).json({ reply: "Server error: " + err.message });
  }
});

// ─── Start Server ───
app.listen(port, () => {
  console.log(`🚀 JeevanRakshak Unified Backend running at http://localhost:${port}`);
  console.log(`📞 Twilio: ${guardians.length} guardians configured`);
  console.log(`🌐 Languages: ${Object.values(languageMap).join(', ')}`);
});

module.exports = app;