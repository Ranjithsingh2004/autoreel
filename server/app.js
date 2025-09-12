import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import axios from "axios";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { v2 as cloudinary } from "cloudinary";
import * as fal from "@fal-ai/client";

const app = express();

// Increase payload limit for large image data
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors());

// API Keys Configuration
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const STABILITY_API_KEY = process.env.STABILITY_API_KEY;
const FAL_KEY = process.env.FAL_KEY;
const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;

// Initialize APIs
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
});

// Configure Fal.ai if API key exists
if (FAL_KEY) {
  fal.config({
    credentials: FAL_KEY,
  });
  console.log("✅ Fal.ai configured successfully");
} else {
  console.error("❌ Fal.ai API Key not found. Add FAL_KEY in .env");
}

// Validate API Keys
if (!GEMINI_API_KEY) console.error("❌ Gemini API Key not found. Add GEMINI_API_KEY in .env");
if (!STABILITY_API_KEY) console.error("❌ Stability AI API Key not found. Add STABILITY_API_KEY in .env");
if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
  console.error("❌ Cloudinary credentials not found. Add CLOUDINARY_* keys in .env");
}

// ---------------- SCRIPT GENERATOR ROUTE (Gemini AI) ----------------
app.post("/api/script", async (req, res) => {
  try {
    const { prompt } = req.body;
    
    if (!GEMINI_API_KEY) {
      return res.status(500).json({ error: "Gemini API key not configured. Please add GEMINI_API_KEY to .env file." });
    }
    
    console.log("🎬 Generating script for:", prompt);
    
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const enhancedPrompt = `Create a compelling video script for: ${prompt}. 
    Format it as a narrative with clear scenes. Keep it engaging and under 2 minutes when spoken.
    Include visual descriptions for each scene that can be used for image generation.
    
    Structure:
    Scene 1: [Visual description]
    Scene 2: [Visual description]
    Scene 3: [Visual description]
    Scene 4: [Visual description]`;
    
    let retries = 3;
    let result;
    
    while (retries > 0) {
      try {
        result = await model.generateContent(enhancedPrompt);
        console.log("✅ Script generated successfully");
        break;
      } catch (apiError) {
        retries--;
        if ((apiError.message.includes('overloaded') || apiError.message.includes('quota')) && retries > 0) {
          console.log(`⏳ Retrying... (${retries} attempts left)`);
          await new Promise(resolve => setTimeout(resolve, 3000));
          continue;
        }
        throw apiError;
      }
    }
    
    const script = result.response.text();
    res.json({ script });
  } catch (err) {
    console.error("❌ Script generation failed:", err.message);
    
    if (err.message.includes('quota') || err.message.includes('429')) {
      res.status(429).json({ error: "Gemini API quota exceeded. Please wait a few minutes." });
    } else if (err.message.includes('overloaded')) {
      res.status(503).json({ error: "Gemini API is overloaded. Please try again in a few minutes." });
    } else if (err.message.includes('API_KEY_INVALID')) {
      res.status(401).json({ error: "Invalid Gemini API key. Please check your .env file." });
    } else {
      res.status(500).json({ error: `Script generation failed: ${err.message}` });
    }
  }
});

// ---------------- IMAGE GENERATOR ROUTE (Stability AI) ----------------
app.post("/api/image", async (req, res) => {
  try {
    const { prompt } = req.body;
    
    if (!STABILITY_API_KEY) {
      return res.status(500).json({ error: "Stability AI API key not configured." });
    }
    
    console.log("🎨 Generating image for:", prompt.substring(0, 50) + "...");
    
    const response = await axios.post(
      "https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image",
      {
        text_prompts: [{ text: prompt }],
        cfg_scale: 7,
        height: 1024,
        width: 1024,
        steps: 20,
        samples: 1,
      },
      {
        headers: {
          Authorization: `Bearer ${STABILITY_API_KEY}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        timeout: 60000, // 60 second timeout
      }
    );

    const images = response.data.artifacts.map(artifact => 
      `data:image/png;base64,${artifact.base64}`
    );
    
    console.log("✅ Image generated successfully");
    res.json({ images, prompts: [prompt] });
  } catch (err) {
    console.error("❌ Image generation failed:", err.response?.data || err.message);
    
    if (err.response?.status === 429) {
      res.status(429).json({ error: "Stability AI quota exceeded. You've used your 25 daily images." });
    } else if (err.response?.status === 401) {
      res.status(401).json({ error: "Invalid Stability AI API key." });
    } else {
      res.status(500).json({ error: "Image generation failed. Please try again." });
    }
  }
});

// ---------------- TEST IMAGE ROUTE (Saves Quota) ----------------
app.post("/api/test-image", async (req, res) => {
  try {
    // Return a placeholder image for testing without using quota
    const placeholderImage = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAyNCIgaGVpZ2h0PSIxMDI0IiB2aWV3Qm94PSIwIDAgMTAyNCAxMDI0IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cmVjdCB3aWR0aD0iMTAyNCIgaGVpZ2h0PSIxMDI0IiBmaWxsPSIjMTQ5MTlCIi8+Cjx0ZXh0IHg9IjUxMiIgeT0iNTEyIiBmaWxsPSJ3aGl0ZSIgZm9udC1zaXplPSI0OCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSI+VGVzdCBJbWFnZTwvdGV4dD4KPHN2Zz4=";
    
    console.log("🧪 Generated test image (no quota used)");
    res.json({ 
      images: [placeholderImage], 
      prompts: [req.body.prompt],
      isTest: true 
    });
  } catch (err) {
    res.status(500).json({ error: "Test image generation failed" });
  }
});

// ---------------- VIDEO GENERATOR ROUTE (Fal.ai) ----------------
app.post("/api/video", async (req, res) => {
  try {
    const { images, prompt } = req.body;
    
    console.log("🎬 Starting video generation...");
    
    if (!images || images.length === 0) {
      return res.status(400).json({ error: "No images provided for video generation" });
    }
    
    if (!FAL_KEY) {
      return res.status(500).json({ error: "Fal.ai API key not configured. Please add FAL_KEY to .env file." });
    }
    
    // Upload image to Cloudinary to get public URL
    let imageUrl = images[0];
    if (images[0].startsWith('data:')) {
      console.log("☁️ Uploading image to Cloudinary...");
      const uploadResult = await cloudinary.uploader.upload(images[0], {
        resource_type: "image",
        folder: "autoreel",
        transformation: [
          { width: 1024, height: 1024, crop: "fill" }
        ]
      });
      imageUrl = uploadResult.secure_url;
      console.log("✅ Image uploaded:", imageUrl);
    }
    
    console.log("🎥 Generating video with Fal.ai...");
    
    // Use Fal.ai stable-video-diffusion
    const result = await fal.subscribe("fal-ai/stable-video-diffusion", {
      input: {
        image_url: imageUrl,
        motion_bucket_id: 127,
        cond_aug: 0.02,
        steps: 25,
        fps: 6,
      },
      logs: true,
      onQueueUpdate: (update) => {
        console.log("📊 Queue status:", update.status);
      },
    });
    
    console.log("✅ Video generation completed");
    
    // Extract video URL with multiple fallback options
    const videoUrl = result.video?.url || 
                    result.data?.video?.url || 
                    result.url || 
                    result.video_url ||
                    result.output?.video?.url;
    
    if (!videoUrl) {
      console.error("❌ No video URL in result:", JSON.stringify(result, null, 2));
      throw new Error("No video URL returned from Fal.ai. Please try again.");
    }
    
    console.log("🎉 Video generated successfully:", videoUrl);
    
    res.json({ 
      video_url: videoUrl,
      duration: result.video?.duration || result.data?.video?.duration || 3,
      success: true
    });
    
  } catch (err) {
    console.error("❌ Video generation failed:", err);
    
    if (err.message?.includes('subscribe') || err.message?.includes('not a function')) {
      // Fallback to run method if subscribe fails
      try {
        console.log("🔄 Trying fallback method...");
        const result = await fal.run("fal-ai/stable-video-diffusion", {
          input: {
            image_url: imageUrl,
            motion_bucket_id: 127,
            cond_aug: 0.02,
            steps: 25,
            fps: 6,
          }
        });
        
        const videoUrl = result.video?.url || result.data?.video?.url || result.url;
        if (videoUrl) {
          console.log("✅ Fallback method succeeded");
          return res.json({ 
            video_url: videoUrl,
            duration: result.video?.duration || 3,
            success: true
          });
        }
      } catch (fallbackErr) {
        console.error("❌ Fallback method also failed:", fallbackErr);
      }
    }
    
    if (err.message?.includes('API_KEY_INVALID') || err.message?.includes('Unauthorized')) {
      res.status(401).json({ error: "Invalid Fal.ai API key. Please check your .env file." });
    } else if (err.message?.includes('quota') || err.message?.includes('429')) {
      res.status(429).json({ error: "Fal.ai API quota exceeded. Please try again later." });
    } else if (err.message?.includes('timeout')) {
      res.status(408).json({ error: "Video generation timed out. Please try again." });
    } else {
      res.status(500).json({ error: `Video generation failed: ${err.message}` });
    }
  }
});

// ---------------- CLOUDINARY UPLOAD ROUTE ----------------
app.post("/api/upload", async (req, res) => {
  try {
    const { file_data, resource_type = "image", public_id } = req.body;
    
    const uploadResult = await cloudinary.uploader.upload(file_data, {
      resource_type,
      public_id,
      folder: "autoreel",
    });
    
    res.json({
      url: uploadResult.secure_url,
      public_id: uploadResult.public_id,
    });
  } catch (err) {
    console.error("Cloudinary upload failed:", err.message);
    res.status(500).json({ error: "Upload failed" });
  }
});

// ---------------- HEALTH CHECK ROUTE ----------------
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "OK", 
    timestamp: new Date().toISOString(),
    apis: {
      gemini: !!GEMINI_API_KEY,
      stability: !!STABILITY_API_KEY,
      fal: !!FAL_KEY,
      cloudinary: !!(CLOUDINARY_CLOUD_NAME && CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET)
    }
  });
});

// ---------------- TEST ENDPOINTS ----------------
app.get("/api/test-fal", async (req, res) => {
  try {
    if (!FAL_KEY) {
      return res.status(500).json({ error: "FAL_KEY not configured" });
    }
    
    // Test Fal.ai connection
    const models = await fal.list();
    res.json({ 
      status: "Fal.ai connection successful", 
      availableModels: models?.slice(0, 5) || "Unable to fetch models"
    });
  } catch (err) {
    res.status(500).json({ 
      error: "Fal.ai connection failed", 
      details: err.message 
    });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 AutoReel Server running on http://localhost:${PORT}`);
  console.log("📝 Gemini AI: Script Generation");
  console.log("🎨 Stability AI: Image Generation (25/day limit)");
  console.log("🧪 Test Images: /api/test-image (no quota used)");
  console.log("🎬 Fal.ai: Video Generation");
  console.log("☁️ Cloudinary: Media Storage");
  console.log("🔍 Health Check: /api/health");
  console.log("🧪 Fal.ai Test: /api/test-fal");
});
