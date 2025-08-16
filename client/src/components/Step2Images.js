import React, { useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';

export default function Step2Images({ onNext, script, setImages }) {
  const [loading, setLoading] = useState(false);
  const [prompts, setPrompts] = useState([]);
  const [previewImages, setPreviewImages] = useState([]); // shown under button

  const generate = async () => {
    setLoading(true);
    try {
      const r = await axios.post('/api/image', { prompt: script });
      const imgs = r.data?.images || [];
      const prs  = r.data?.prompts || [];
      setImages(imgs);              // pass to next step
      setPreviewImages(imgs);       // show below the button
      setPrompts(prs);
      onNext();                     // move to Step 3
    } catch (e) {
      console.error(e);
      setPreviewImages([]);
      setPrompts([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div className="card p-4 mt-4" initial={{opacity:0, y:40}} animate={{opacity:1, y:0}} transition={{duration:.5}}>
      <h4>Step 2: Generate Images</h4>
      <p className="text-muted">We craft prompts from your script and fetch images.</p>
      <button className="btn btn-primary" onClick={generate} disabled={loading}>
        {loading ? 'Generating Images…' : 'Generate Images →'}
      </button>

      {/* POP-UP OUTPUT */}
      {prompts.length > 0 && !loading && (
        <motion.div className="mt-3 p-3 bg-light rounded" initial={{opacity:0, height:0}} animate={{opacity:1, height:'auto'}}>
          <strong>Prompts used:</strong>
          <ul className="mb-0 mt-2">
            {prompts.map((p,i)=>(<li key={i}>{p}</li>))}
          </ul>
        </motion.div>
      )}

      {previewImages.length > 0 && !loading && (
        <motion.div className="mt-3" initial={{opacity:0, height:0}} animate={{opacity:1, height:'auto'}}>
          <div className="row">
            {previewImages.map((src, idx) => (
              <div className="col-6 col-md-4 mb-3" key={idx}>
                <img src={src} alt={`gen-${idx}`} className="img-fluid rounded shadow-sm" />
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
