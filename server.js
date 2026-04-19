import express from 'express';

const app = express();
app.use(express.json());

const ELEVEN_API_KEY = 'Psk_1028a2a36468097efc1891e250391b452222c78b7114e9c9';
const VOICE_ID = 'oTQK6KgOJHp8UGGZjwUu';

app.get('/health', (req, res) => {
  res.json({ ok: true });
});

app.post('/speak', async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Missing text' });
    }

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}?output_format=mp3_44100_128`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': ELEVEN_API_KEY,
          'Content-Type': 'application/json',
          Accept: 'audio/mpeg',
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
          },
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error('ElevenLabs error:', errText);
      return res.status(response.status).json({ error: errText });
    }

    const arrayBuffer = await response.arrayBuffer();
    const base64Audio = Buffer.from(arrayBuffer).toString('base64');

    res.json({
      audioBase64: base64Audio,
      mimeType: 'audio/mpeg',
    });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Speech generation failed' });
  }
});

app.listen(3001, '0.0.0.0', () => {
  console.log('Server running on http://0.0.0.0:3001');
});