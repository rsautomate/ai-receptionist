require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const CALENDLY_LINK = process.env.CALENDLY_LINK;

app.post('/webhook', async (req, res) => {
  const incomingMsg = req.body.SpeechResult || req.body.Body || '';
  const name = req.body.Caller || 'client';

  try {
    const gptResponse = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are an AI receptionist. Be friendly, helpful, and encourage bookings. If they seem ready to book, reply with this Calendly link: ${CALENDLY_LINK}`,
          },
          {
            role: 'user',
            content: incomingMsg,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const botReply = gptResponse.data.choices[0].message.content;
    res.json({ message: botReply });
  } catch (err) {
    console.error('GPT error:', err.response?.data || err.message);
    res.status(500).send('Error generating response');
  }
});

// Add a root route to prevent Render crash
app.get('/', (req, res) => {
  res.send('AI Receptionist is live');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
