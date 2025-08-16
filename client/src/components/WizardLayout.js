import React, { useRef, useState, useEffect } from 'react';
import Step1Script from './Step1Script';
import Step2Images from './Step2Images';
import Step3Video from './Step3Video';
import Step4Subtitles from './Step4Subtitles';


export default function WizardLayout(){
  const [visible, setVisible] = useState(1);
  const [script, setScript] = useState('');
  const [images, setImages] = useState([]);

  const refs = [useRef(null), useRef(null), useRef(null), useRef(null)];
  const next = () => setVisible(v => Math.min(4, v + 1));

  useEffect(() => {
    if (visible > 1 && refs[visible-1]?.current){
      refs[visible-1].current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [visible]);

  return (
    <div className="container py-5">
      <h2 className="text-center mb-5">🎬 AutoReel Generator</h2>

      <div ref={refs[0]}>
        <Step1Script onNext={next} setScript={setScript} />
      </div>

      {visible >= 2 && (
        <div ref={refs[1]}>
          <Step2Images onNext={next} script={script} setImages={setImages} />
        </div>
      )}

      {visible >= 3 && (
        <div ref={refs[2]}>
          <Step3Video onNext={next} images={images} />
        </div>
      )}

      {visible >= 4 && (
        <div ref={refs[3]}>
          <Step4Subtitles script={script} />
        </div>
      )}
    </div>
  );
}