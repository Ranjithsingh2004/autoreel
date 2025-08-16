import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import scriptRoutes from './routes/script.js';
import imageRoutes from './routes/image.js';
import videoRoutes from './routes/video.js';
import subtitleRoutes from './routes/subtitle.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '4mb' }));

// serve static demo assets (e.g., placeholder video) from /public as /static
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/static', express.static(path.join(__dirname, 'public')));

app.use('/api/script', scriptRoutes);
app.use('/api/image', imageRoutes);
app.use('/api/video', videoRoutes);
app.use('/api/subtitle', subtitleRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));