// ===============================
// WhatsApp Doctor Chatbot MVP
// Tech: Node.js + Express + Meta WhatsApp Cloud API
// ===============================

// 1. Install dependencies:
// npm init -y
// npm install express axios dotenv body-parser

// 2. Create .env file:
// PORT=3000
// VERIFY_TOKEN=your_verify_token
// WHATSAPP_TOKEN=your_meta_access_token
// PHONE_NUMBER_ID=your_phone_number_id

// ===============================

require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;

// ===============================
// 3. Verify Webhook (Meta requirement)
// ===============================
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('Webhook verified');
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// ===============================
// 4. Receive Messages
// ===============================
app.post('/webhook', async (req, res) => {
  try {
    const entry = req.body.entry?.[0];
    const changes = entry?.changes?.[0];
    const message = changes?.value?.messages?.[0];

    if (!message) return res.sendStatus(200);

    const from = message.from;
    const text = message.text?.body?.toLowerCase() || '';

    console.log(`Incoming from ${from}: ${text}`);

    const reply = handleMessage(text);

    await sendMessage(from, reply);

    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

// ===============================
// 5. Bot Logic (MVP)
// ===============================
function handleMessage(text) {

  if (text.includes('hi') || text.includes('hello')) {
    return `Hello! 👋\n\nWelcome to Dr. Clinic Assistant.\n\n1️⃣ Book Appointment\n2️⃣ Doctor Availability\n3️⃣ Fees\n4️⃣ Emergency`;
  }

  if (text.includes('1') || text.includes('appointment')) {
    return `Please choose a slot:\n\n1. Today (5–8 PM)\n2. Tomorrow (10 AM–1 PM)\n\nReply with 1 or 2`;
  }

  if (text === '1') {
    return `✅ Appointment booked for TODAY (5–8 PM).\n\nPlease arrive 10 mins early.`;
  }

  if (text === '2') {
    return `✅ Appointment booked for TOMORROW (10 AM–1 PM).`;
  }

  if (text.includes('availability')) {
    return `Doctor is available:\n\n🕒 Mon-Sat\n5 PM – 8 PM`;
  }

  if (text.includes('fees')) {
    return `Consultation fee is ₹500.`;
  }

  if (text.includes('emergency') || text.includes('urgent') || text.includes('pain')) {
    return `🚨 This seems urgent. Please call the doctor immediately at +91XXXXXXXXXX.`;
  }

  return `Sorry, I didn't understand.\n\nType 'Hi' to see options.`;
}

// ===============================
// 6. Send WhatsApp Message
// ===============================
async function sendMessage(to, message) {
  try {
    await axios.post(
      `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: 'whatsapp',
        to: to,
        type: 'text',
        text: { body: message }
      },
      {
        headers: {
          Authorization: `Bearer ${WHATSAPP_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    console.error('Error sending message:', error.response?.data || error.message);
  }
}

// ===============================
// 7. Start Server
// ===============================
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// ===============================
// NEXT STEPS (IMPORTANT)
// ===============================
// 1. Replace tokens in .env
// 2. Use ngrok to expose localhost
//    npx ngrok http 3000
// 3. Add webhook URL in Meta dashboard
// 4. Test via WhatsApp

// ===============================
// FUTURE IMPROVEMENTS
// ===============================
// - Add MongoDB for real appointment storage
// - Add AI (OpenAI/Gemini)
// - Add Google Calendar integration
// - Add multi-language support

