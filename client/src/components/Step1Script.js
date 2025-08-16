import React, { useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';

export default function Step1Script({ onNext, setScript }) {
  const [idea, setIdea] = useState('');
  const [loading, setLoading] = useState(false);
  const [outScript, setOutScript] = useState(''); // shown under button

  const handle = async () => {
    if (!idea.trim()) return;
    setLoading(true);
    try {
      const r = await axios.post('/api/script', { prompt: idea });
      const generated = r.data?.script || idea;
      setScript(generated);
      setOutScript(generated);          // show result below the button
      onNext();                         // move to Step 2
    } catch (e) {
      console.error(e);
      setOutScript('⚠️ Failed to generate script.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div className="card p-4 mt-4" initial={{opacity:0, y:40}} animate={{opacity:1, y:0}} transition={{duration:.5}}>
      <h4>Step 1: Generate Script</h4>
      <textarea className="form-control my-3" rows="4" placeholder="Type your idea..." value={idea} onChange={e=>setIdea(e.target.value)} />
      <button className="btn btn-primary" onClick={handle} disabled={loading}>
        {loading ? 'Generating Script…' : 'Generate Script →'}
      </button>

      {/* POP-UP OUTPUT */}
      {outScript && !loading && (
        <motion.div className="mt-3 p-3 bg-light rounded" initial={{opacity:0, height:0}} animate={{opacity:1, height:'auto'}}>
          <strong>Script:</strong>
          <div className="mt-2" style={{whiteSpace:'pre-wrap'}}>{outScript}</div>
        </motion.div>
      )}
    </motion.div>
  );
}
