// server/routes/image.js
import express from 'express';
import axios from 'axios';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { fal } from '@fal-ai/client'; 

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// This is the most likely source of the crash. We'll wrap it in a try...catch.
try {
    fal.config({
        credentials: process.env.FAL_KEY,
    });
    console.log("Fal.ai client initialized successfully.");
} catch (error) {
    console.error("Fal.ai client initialization failed:", error);
    // The server won't crash now, but the API calls will likely fail.
    // It will show the error and allow the server to continue running.
}

router.post('/', async (req, res) => {
    try {
        const { prompt } = req.body;
        if (!prompt || !prompt.trim()) return res.status(400).json({ error: 'prompt is required' });
        
        // This is your OpenRouter code, which is already in a try...catch.
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
        const prompts = (promptText.match(/\d+\.\s*(.*)/g) || []).map(line => line.replace(/\d+\.\s*/, '').trim()).slice(0, 3);

        const images = [];
        const imagePromises = prompts.map(async (p, index) => {
            try {
                // Call Fal.ai only if the client was initialized successfully
                if (!fal) {
                    throw new Error("Fal.ai client not initialized.");
                }

                const result = await fal.subscribe("fal-ai/flux/dev", {
                    input: { prompt: p },
                });

                const imageUrl = result.images[0].url;

                const imageResponse = await axios.get(imageUrl, { responseType: 'stream' });
                const imageFileName = `generated_image_${Date.now()}_${index}.jpg`;
                const imagePath = path.join(__dirname, '../public', imageFileName);

                const publicDir = path.join(__dirname, '../public');
                if (!fs.existsSync(publicDir)) {
                    fs.mkdirSync(publicDir, { recursive: true });
                }

                const writer = fs.createWriteStream(imagePath);
                imageResponse.data.pipe(writer);

                await new Promise((resolve, reject) => {
                    writer.on('finish', resolve);
                    writer.on('error', reject);
                });

                return `/static/${imageFileName}`;
            } catch (e) {
                console.warn('Fal.ai image generation failed for prompt:', p, e.message);
                return null;
            }
        });

        const finalImageUrls = await Promise.all(imagePromises);
        const validImages = finalImageUrls.filter(url => url !== null);

        if (validImages.length === 0) {
            return res.status(500).json({ error: 'Failed to generate images. Please try again.', images: [] });
        }

        return res.json({ images: validImages, prompts });
    } catch (err) {
        console.error('Image route error:', err?.response?.data || err.message);
        return res.status(500).json({ error: 'Failed to process image request.' });
    }
});

export default router;