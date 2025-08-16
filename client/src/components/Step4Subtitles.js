import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';

export default function Step4Subtitles({ script }) {
  const [srt, setSrt] = useState('');
  const [loading, setLoading] = useState(false);

  const makeSubs = async () => {
    setLoading(true);
    try {
      const r = await axios.post('/api/subtitle', { script });
      setSrt(r.data?.srt || '');
    } catch (e) {
      console.error(e);
      setSrt('⚠️ Failed to generate subtitles.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { makeSubs(); }, []);

  return (
    <motion.div className="card p-4 mt-4" initial={{opacity:0, y:40}} animate={{opacity:1, y:0}} transition={{duration:.5}}>
      <h4>Step 4: Add Subtitles</h4>
      <p className="text-muted">Subtitles (SRT) are auto-generated from your script.</p>

      {/* POP-UP OUTPUT */}
      <motion.pre className="bg-light p-3 rounded" style={{whiteSpace:'pre-wrap'}}
        initial={{opacity:0, height:0}} animate={{opacity:1, height:'auto'}}>
        {loading ? 'Generating Subtitles…' : srt}
      </motion.pre>

      <button className="btn btn-dark" onClick={()=>alert('🎉 Reel created!')}>Finish</button>
    </motion.div>
  );
}
