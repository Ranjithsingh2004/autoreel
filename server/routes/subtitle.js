import express from 'express';
import axios from 'axios';

const router = express.Router();

// Generate simple SRT-like captions using OpenRouter from the script
router.post('/', async (req, res) => {
  try {
    const { script } = req.body;
    if (!script || !script.trim()) return res.status(400).json({ error: 'script is required' });

    const r = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'openrouter/auto',
        messages: [
          { role: 'system', content: 'Return only SRT subtitles for the given short script.' },
          { role: 'user', content: `Create 6-10 SRT subtitles that match this short reel script. Keep each caption under 8 words. Script: ${script}` }
        ],
        temperature: 0.6,
        max_tokens: 350
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.HTTP_REFERER || 'http://localhost:3000',
          'X-Title': process.env.X_TITLE || 'Autoreel Prototype'
        }
      }
    );

    const srt = r.data?.choices?.[0]?.message?.content?.trim() || '';
    return res.json({ srt });
  } catch (err) {
    console.error('Subtitle route error:', err?.response?.data || err.message);
    return res.status(500).json({ error: 'Failed to create subtitles' });
  }
});

export default router;
