import { useState } from "react";
import { Sparkles, Image as ImageIcon, Video } from "lucide-react";
import axios from 'axios';

export default function AutoreelGeneration() {
  const [currentStep, setCurrentStep] = useState(1);
  const [prompt, setPrompt] = useState('');
  const [script, setScript] = useState('');
  const [images, setImages] = useState([]);
  const [videoUrl, setVideoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const steps = [
    { id: 1, label: "Generate Script", icon: <Sparkles size={16} /> },
    { id: 2, label: "Create Images", icon: <ImageIcon size={16} /> },
    { id: 3, label: "Generate Video", icon: <Video size={16} /> },
  ];

  const getStepStatus = (stepId) => {
    if (stepId === 1) return script ? 'completed' : currentStep === 1 ? 'active' : 'inactive';
    if (stepId === 2) return images.length > 0 ? 'completed' : currentStep === 2 ? 'active' : 'inactive';
    if (stepId === 3) return videoUrl ? 'completed' : currentStep === 3 ? 'active' : 'inactive';
    return 'inactive';
  };

  const generateScript = async () => {
    if (!prompt.trim()) {
      setError('Please enter a topic for your video');
      return;
    }

    setLoading(true);
    setError('');
    console.log('Generating script for:', prompt);

    try {
      const response = await axios.post('/api/script', { prompt });
      console.log('Script response:', response.data);
      setScript(response.data.script);
      setCurrentStep(2);
    } catch (err) {
      console.error('Script generation error:', err);
      console.error('Error response:', err.response?.data);
      setError(err.response?.data?.error || 'Script generation failed');
    } finally {
      setLoading(false);
    }
  };

  const generateImages = async () => {
    if (!script.trim()) {
      setError('Please generate a script first');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const scenes = script.split('\n').filter(line => 
        line.toLowerCase().includes('scene') || 
        line.toLowerCase().includes('visual') ||
        line.length > 50
      ).slice(0, 4);

      const imagePromises = scenes.map(async (scene, index) => {
        const imagePrompt = `High quality, cinematic, ${scene.substring(0, 200)}`;
        const response = await axios.post('/api/image', { prompt: imagePrompt });
        return response.data.images[0];
      });

      const generatedImages = await Promise.all(imagePromises);
      setImages(generatedImages);
      setCurrentStep(3);
    } catch (err) {
      setError(err.response?.data?.error || 'Image generation failed');
    } finally {
      setLoading(false);
    }
  };

  const generateVideo = async () => {
    if (images.length === 0) {
      setError('Please generate images first');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.post('/api/video', {
        images: images,
        prompt: 'Create a smooth video transition'
      });

      setVideoUrl(response.data.video_url);
    } catch (err) {
      setError(err.response?.data?.error || 'Video generation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-teal-800 to-emerald-900 flex flex-col items-center py-20 px-4">
      {/* Title */}
      <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6 lg:mb-8">Auto Reel Generator</h1>
      <p className="text-gray-300 mb-16 lg:mb-20 text-center max-w-2xl lg:max-w-4xl text-lg lg:text-xl leading-tight whitespace-nowrap">
        Create viral social media content with AI-powered script, images, and video generation
      </p>

      {/* Stepper Container - Exact Figma Match */}
      <div className="bg-teal-800/40 backdrop-blur-lg border border-teal-600/30 rounded-full p-3 lg:p-4 mb-16 lg:mb-20 shadow-2xl">
        <div className="flex items-center">
          {steps.map((step, index) => {
            const status = getStepStatus(step.id);
            return (
              <div key={step.id} className="flex items-center">
                <button
                  className={`flex items-center gap-2 lg:gap-3 px-6 lg:px-7 py-3 lg:py-4 rounded-full font-medium lg:font-semibold transition-all duration-300 ${
                    status === 'active'
                      ? 'bg-teal-500 text-white shadow-lg'
                      : status === 'completed'
                      ? 'bg-teal-600 text-white'
                      : 'bg-transparent text-gray-300 hover:text-white'
                  }`}
                >
                  {step.icon}
                  <span className="text-sm lg:text-base">{step.label}</span>
                </button>
                
                {index < steps.length - 1 && (
                  <div className={`w-12 lg:w-16 h-0.5 mx-2 lg:mx-3 ${
                    getStepStatus(step.id + 1) !== 'inactive' ? 'bg-teal-500' : 'bg-gray-600'
                  }`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step 1 Card */}
      {currentStep >= 1 && (
        <div className="bg-teal-800/30 backdrop-blur-lg border border-teal-600/30 rounded-2xl p-8 lg:p-9 w-full max-w-2xl lg:max-w-3xl mb-8 lg:mb-10 shadow-xl">
          <h2 className="flex items-center gap-3 text-xl lg:text-2xl font-semibold text-white mb-6">
            <Sparkles size={24} className="text-teal-400 lg:w-6 lg:h-6" />
            Step 1: Enter Topic & Generate Script
          </h2>
          <div className="flex gap-4 lg:gap-5">
            <input
              type="text"
              placeholder="Enter your reel topic (Ex: Productivity Tips, Fitness Motivation)"
              className="flex-1 px-4 lg:px-5 py-3 lg:py-4 rounded-xl bg-teal-900/50 border border-teal-600/50 text-white placeholder-gray-400 focus:ring-2 focus:ring-teal-400 focus:outline-none text-base lg:text-lg"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && generateScript()}
            />
            <button 
              className="px-8 lg:px-9 py-3 lg:py-4 bg-teal-500 text-white rounded-xl hover:bg-teal-600 transition-all disabled:opacity-50 font-medium lg:font-semibold text-base lg:text-lg"
              onClick={generateScript}
              disabled={loading || !prompt.trim()}
            >
              {loading && currentStep === 1 ? 'Generating...' : 'Generate Script'}
            </button>
          </div>
          
          {script && (
            <div className="mt-6 lg:mt-7 p-6 lg:p-7 bg-teal-900/40 border border-teal-600/30 rounded-xl">
              <div className="text-teal-400 font-semibold lg:font-bold mb-3 flex items-center gap-2 text-base lg:text-lg">
                <Sparkles size={16} className="lg:w-5 lg:h-5" />
                Generated Script
              </div>
              <div className="text-white/90 whitespace-pre-wrap leading-relaxed text-base lg:text-lg">
                {script}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step 2 Card - Progressive Reveal */}
      {script && currentStep >= 2 && (
        <div className="bg-teal-800/30 backdrop-blur-lg border border-teal-600/30 rounded-2xl p-8 lg:p-9 w-full max-w-2xl lg:max-w-3xl mb-8 lg:mb-10 shadow-xl">
          <h2 className="flex items-center gap-3 text-xl lg:text-2xl font-semibold text-white mb-6">
            <ImageIcon size={24} className="text-teal-400 lg:w-6 lg:h-6" />
            Step 2: Generate Images
          </h2>
          <button 
            className="px-8 lg:px-9 py-3 lg:py-4 bg-teal-500 text-white rounded-xl hover:bg-teal-600 transition-all disabled:opacity-50 font-medium lg:font-semibold mb-6 text-base lg:text-lg"
            onClick={generateImages}
            disabled={loading || !script}
          >
            {loading && currentStep === 2 ? 'Generating Images...' : 'Generate Images'}
          </button>

          <div className="grid grid-cols-2 gap-4 lg:gap-5">
            {[1, 2, 3, 4].map((index) => (
              <div 
                key={index}
                className="aspect-square rounded-xl border-2 border-dashed border-teal-500/40 flex items-center justify-center text-white/60 font-medium lg:font-semibold bg-teal-900/20 text-base lg:text-lg"
              >
                {images[index - 1] ? (
                  <img 
                    src={images[index - 1]} 
                    alt={`Generated ${index}`} 
                    className="w-full h-full object-cover rounded-xl"
                  />
                ) : (
                  `Image ${index}`
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 3 Card - Progressive Reveal */}
      {images.length > 0 && currentStep >= 3 && (
        <div className="bg-teal-800/30 backdrop-blur-lg border border-teal-600/30 rounded-2xl p-8 lg:p-9 w-full max-w-2xl lg:max-w-3xl mb-8 lg:mb-10 shadow-xl">
          <h2 className="flex items-center gap-3 text-xl lg:text-2xl font-semibold text-white mb-6">
            <Video size={24} className="text-teal-400 lg:w-6 lg:h-6" />
            Step 3: Generate Final Video
          </h2>
          <button 
            className="px-8 lg:px-9 py-3 lg:py-4 bg-teal-500 text-white rounded-xl hover:bg-teal-600 transition-all disabled:opacity-50 font-medium lg:font-semibold mb-6 text-base lg:text-lg"
            onClick={generateVideo}
            disabled={loading || images.length === 0}
          >
            {loading && currentStep === 3 ? 'Generating Video...' : 'Generate Final Video'}
          </button>

          <div className="aspect-video rounded-xl border-2 border-dashed border-teal-500/40 flex items-center justify-center text-white/60 font-medium lg:font-semibold bg-teal-900/20 text-base lg:text-lg">
            {videoUrl ? (
              <video controls className="w-full h-full rounded-xl">
                <source src={videoUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            ) : (
              'Video Preview'
            )}
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mt-6 lg:mt-7 p-4 lg:p-5 bg-red-500/20 border border-red-400/50 rounded-xl text-red-200 text-center max-w-2xl lg:max-w-3xl w-full text-base lg:text-lg">
          {error}
        </div>
      )}
    </div>
  );
}

