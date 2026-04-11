require('dotenv').config();
const twilio = require('twilio');
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

async function testTwilio() {
  const number = "+918220633440"; // First guardian number
  console.log(`Testing Twilio SMS to ${number}...`);
  try {
    const msg = await twilioClient.messages.create({
      body: "Test SMS from JeevanRakshak",
      from: process.env.TWILIO_PHONE_NUMBER,
      to: number
    });
    console.log("✅ SMS Success! SID:", msg.sid);
  } catch (err) {
    console.error("❌ SMS Error:", err.message);
  }

  console.log(`Testing Twilio Call to ${number}...`);
  try {
    const call = await twilioClient.calls.create({
      twiml: `<Response><Say>Test call</Say></Response>`,
      to: number,
      from: process.env.TWILIO_PHONE_NUMBER
    });
    console.log("✅ Call Success! SID:", call.sid);
  } catch (err) {
    console.error("❌ Call Error:", err.message);
  }
}

testTwilio();
