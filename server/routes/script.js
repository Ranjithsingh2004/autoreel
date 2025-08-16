import express from 'express';
import axios from 'axios';

const router = express.Router();

// Uses OpenRouter chat completions to expand/clean the user's script
router.post('/', async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt || !prompt.trim()) {
      return res.status(400).json({ error: 'prompt is required' });
    }

    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'openrouter/auto',
        messages: [
          { role: 'system', content: 'You are a concise script writer for short social video reels. Keep sentences short and vivid.' },
          { role: 'user', content: `Turn this idea into a 6-10 sentence reel script with 4-6 shot cues (SHOT: ...). Keep it punchy. Idea: ${prompt}` }
        ],
        temperature: 0.7,
        max_tokens: 500
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

    const script = response.data?.choices?.[0]?.message?.content?.trim() || '';
    return res.json({ script });
  } catch (err) {
    console.error('Script route error:', err?.response?.data || err.message);
    return res.status(500).json({ error: 'Failed to generate script via OpenRouter' });
  }
});

export default router;