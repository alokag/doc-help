const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());

app.get('/webhook', (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode && token) {
        if (mode === 'subscribe' && token === process.env.VERIFICATION_TOKEN) {
            console.log('Webhook verified');
            return res.status(200).send(challenge);
        } else {
            return res.sendStatus(403);
        }
    }
});

app.post('/webhook', async (req, res) => {
    const body = req.body;
    if (body.object === 'whatsapp_business_account') {
        console.log('Received message:', body);

        // Handle incoming messages
        const from = body.entry[0].changes[0].value.messages[0].from;
        const msgBody = body.entry[0].changes[0].value.messages[0].text.body;

        // Chatbot Logic Here
        let responseMessage = 'Hello! How can I help you?'; // Sample response

        // Respond to the message
        await axios.post(`https://graph.facebook.com/v13.0/${process.env.WHATSAPP_NUMBER_ID}/messages`, {
            messaging_product: 'whatsapp',
            to: from,
            text: { body: responseMessage },
        }, {
            headers: { 'Authorization': `Bearer ${process.env.ACCESS_TOKEN}` }
        });

        res.sendStatus(200);
    } else {
        res.sendStatus(404);
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
