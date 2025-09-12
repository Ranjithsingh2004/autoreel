# 🎬 AutoReel - AI Video Generator

AutoReel is a complete AI-powered video generation platform that creates videos from text prompts using multiple AI APIs.

## 🚀 Features

- **Script Generation**: Gemini AI creates compelling video scripts (50 free/day)
- **Image Generation**: Stability AI generates high-quality images (25 free/day) 
- **Video Creation**: Fal.ai converts images to videos (free tier)
- **Cloud Storage**: Cloudinary stores and manages media assets (free tier)
- **4-Step Workflow**: Script → Images → Video → Subtitles

## 🔧 Setup Instructions

### 1. Install Dependencies

```bash

# Install server dependencies
cd server
npm install

# Install client dependencies  
cd ../client
npm install
```

### 2. Configure API Keys

Create `.env` file in the `server` folder:

```env
# Gemini AI API Key (free 50 requests/day)
# Get from: https://makersuite.google.com/app/apikey
GEMINI_API_KEY=your_gemini_api_key_here

# Stability AI API Key (25 free images/day)
# Get from: https://platform.stability.ai/account/keys
STABILITY_API_KEY=your_stability_api_key_here

# Fal.ai API Key (free video generation)
# Get from: https://fal.ai/dashboard/keys
FAL_KEY=your_fal_ai_key_here

# Cloudinary Configuration (free tier)
# Get from: https://cloudinary.com/console
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 3. Get Free API Keys

#### Gemini AI (Google)
1. Visit https://makersuite.google.com/app/apikey
2. Sign in with Google account
3. Create new API key
4. Free tier: 50 requests/day

#### Stability AI
1. Visit https://platform.stability.ai/account/keys
2. Create account and verify email
3. Generate API key
4. Free tier: 25 images/day

#### Fal.ai
1. Visit https://fal.ai/dashboard/keys
2. Sign up with GitHub/Google
3. Create API key
4. Free tier: Video generation included

#### Cloudinary
1. Visit https://cloudinary.com/console
2. Create free account
3. Get Cloud Name, API Key, and API Secret from dashboard
4. Free tier: 25GB storage, 25GB bandwidth/month

### 4. Run the Application

**Terminal 1 - Backend:**
```bash
cd server
npm start
```
Server runs on http://localhost:5000

**Terminal 2 - Frontend:**
```bash
cd client
npm start
```
React app runs on http://localhost:3000

## 🎯 How to Use

1. **Generate Script**: Enter your video idea, Gemini AI creates the script
2. **Generate Images**: Stability AI creates visual content from script scenes
3. **Create Video**: Fal.ai converts images into smooth video transitions
4. **Add Subtitles**: Final step adds subtitles and exports the complete video

## 🛠 Tech Stack

- **Frontend**: React 18, Bootstrap 5, Axios
- **Backend**: Node.js, Express, CORS
- **APIs**: Gemini AI, Stability AI, Fal.ai, Cloudinary
- **Storage**: Cloudinary for permanent media storage

## 📊 API Limits (Free Tiers)

| Service | Free Limit | Reset Period |
|---------|------------|--------------|
| Gemini AI | 50 requests | Daily |
| Stability AI | 25 images | Daily |
| Fal.ai | Video generation | Monthly |
| Cloudinary | 25GB storage | Monthly |

## 🔍 Health Check

Visit http://localhost:5000/api/health to check API status:

```json
{
  "status": "OK",
  "apis": {
    "gemini": true,
    "stability": true,
    "fal": true,
    "cloudinary": true
  }
}
```

## 📝 License

MIT License - Feel free to use and modify for your projects!
