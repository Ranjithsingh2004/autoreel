import express from 'express';

const router = express.Router();

// For demo: return a static placeholder video. In production you'd stitch images with ffmpeg.
router.post('/', async (req, res) => {
  try {
    // const { images } = req.body; // available if you want to log
    return res.json({ videoUrl: '/static/demo.mp4' });
  } catch (err) {
    console.error('Video route error:', err.message);
    return res.status(500).json({ error: 'Failed to create video' });
  }
});

export default router;