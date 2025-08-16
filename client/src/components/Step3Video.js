import React from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';

export default function Step3Video({ onNext, images }) {
  const [videoUrl, setVideoUrl] = React.useState(null);
  const [loading, setLoading] = React.useState(false);

  const createVideo = async () => {
    if (!images || images.length === 0) return;
    setLoading(true);
    try {
      const r = await axios.post('/api/video', { images });
      setVideoUrl(r.data?.videoUrl || '');
    } catch (e) {
      console.error(e);
      setVideoUrl('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div className="card p-4 mt-4" initial={{opacity:0, y:40}} animate={{opacity:1, y:0}} transition={{duration:.5}}>
      <h4>Step 3: Create Video</h4>

      {/* thumbnails (context) */}
      <div className="row">
        {images.map((src, idx) => (
          <div className="col-md-4" key={idx}>
            <img src={src} alt={`img-${idx}`} className="img-fluid mb-3 rounded" />
          </div>
        ))}
      </div>

      <div className="d-flex gap-2">
        <button className="btn btn-primary" onClick={createVideo} disabled={loading}>
          {loading ? 'Rendering Video…' : 'Generate Video'}
        </button>
        <button className="btn btn-success" onClick={onNext} disabled={!videoUrl}>
          Next: Add Subtitles →
        </button>
      </div>

      {/* POP-UP OUTPUT */}
      {videoUrl && !loading && (
        <motion.div className="mt-3" initial={{opacity:0, height:0}} animate={{opacity:1, height:'auto'}}>
          <video className="w-100 rounded shadow" src={videoUrl} controls />
        </motion.div>
      )}
    </motion.div>
  );
}
