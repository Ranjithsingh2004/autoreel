import express from 'express';
import axios from 'axios';

const router = express.Router();

// NOTE: OpenRouter focuses on text models. For images we use Lexica (free search)
// We first ask OpenRouter to produce 3 descriptive prompts, then query Lexica.
router.post('/', async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt || !prompt.trim()) return res.status(400).json({ error: 'prompt is required' });

    // 1) Ask OpenRouter to craft 3 photo prompts
    const promptResp = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'openrouter/auto',
        messages: [
          { role: 'system', content: 'You write terse, vivid prompts for stock-like photos.' },
          { role: 'user', content: `Write 3 distinct image prompts (numbered) for the following script. Each prompt should describe a cinematic still frame. Script: ${prompt}`}
        ],
        temperature: 0.8,
        max_tokens: 220
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

    const promptText = promptResp.data?.choices?.[0]?.message?.content || '';
    const prompts = (promptText.match(/\d+\.\s*(.*)/g) || []).map(line => line.replace(/\d+\.\s*/, '').trim()).slice(0,3);

    // 2) Query Lexica for each prompt and collect first image result
    const images = [];
    for (const p of prompts) {
      try {
        const r = await axios.get(`https://lexica.art/api/v1/search?q=${encodeURIComponent(p)}`);
        const first = r.data?.images?.[0]?.src || null;
        if (first) images.push(first);
      } catch (e) {
        console.warn('Lexica query failed for prompt:', p);
      }
    }

    // fallback if none
    if (images.length === 0) {
      images.push('https://images.unsplash.com/photo-1520974735194-8d95df1caa3e');
      images.push('https://images.unsplash.com/photo-1495567720989-cebdbdd97913');
      images.push('https://images.unsplash.com/photo-1500530855697-b586d89ba3ee');
    }

    return res.json({ images, prompts });
  } catch (err) {
    console.error('Image route error:', err?.response?.data || err.message);
    return res.status(500).json({ error: 'Failed to fetch images' });
  }
});

export default router;
