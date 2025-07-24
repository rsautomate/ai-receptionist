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
          { role: 'system', content: 'You are a helpful AI receptionist for a business.' },
          { role: 'user', content: incomingMsg }
        ]
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const aiReply = gptResponse.data.choices[0].message.content.trim();
    const twiml = `<Response><Say>${aiReply}</Say></Response>`;
    res.type('text/xml').send(twiml);

  } catch (err) {
    console.error(err);
    res.status(500).send('<Response><Say>Sorry, I had an error.</Say></Response>');
  }
});

app.get('/', (req, res) => {
  res.send("AI Receptionist is running!");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
