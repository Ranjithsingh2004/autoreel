import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import axios from "axios";

const app = express();
app.use(cors());
app.use(express.json());

const FAL_KEY = process.env.FAL_KEY;
if (!FAL_KEY) {
  console.error("Fal.ai API Key not found. Add FAL_KEY in .env");
}

const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY;
if (!OPENROUTER_KEY) {
  console.error("OpenRouter API Key not found. Add OPENROUTER_API_KEY in .env");
}

// ---------------- SCRIPT GENERATOR ROUTE ----------------
app.post("/api/script", async (req, res) => {
  try {
    const { prompt } = req.body;

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openai/gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
      },
      {
        headers: {
          Authorization: `Bearer ${OPENROUTER_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.json({ script: response.data.choices[0].message.content });
  } catch (err) {
    console.error("OpenRouter request failed:", err.response?.data || err.message);
    res.status(500).json({ error: "Script generation failed" });
  }
});

// ---------------- IMAGE GENERATOR ROUTE ----------------
app.post("/api/image", async (req, res) => {
  try {
    const { prompt } = req.body;
    const response = await axios.post(
      "https://api.fal.ai/v1/images/generate",
      { prompt },
      { headers: { Authorization: `Bearer ${FAL_KEY}` } }
    );

    res.json({
      images: response.data.images.map(img => img.url),
      prompts: [prompt]
    });
  } catch (err) {
    console.error("Fal.ai request failed:", err.response?.data || err.message);
    res.status(500).json({ error: "Image generation failed" });
  }
});

app.listen(5000, () => console.log("Server running on http://localhost:5000"));
