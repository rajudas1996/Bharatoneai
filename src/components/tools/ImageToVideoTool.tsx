import React, { useState } from 'react';
import { 
  Film, 
  Upload, 
  Play, 
  Pause, 
  Download, 
  Sparkles, 
  RefreshCw, 
  Sliders, 
  Video, 
  RotateCcw,
  Compass,
  CheckCircle2
} from 'lucide-react';

const CAMERA_MOTIONS = [
  { id: 'zoom_in', label: 'Slow Zoom In', desc: 'Gradually pushes toward focal subject' },
  { id: 'pan_right', label: 'Smooth Pan Right', desc: 'Horizontal tracking camera motion' },
  { id: 'orbit', label: 'Dynamic Orbit', desc: 'Rotational 3D camera circling focal point' },
  { id: 'tilt_up', label: 'Vertical Tilt Up', desc: 'Reveals vertical architecture & skyline' },
  { id: 'drone_flythrough', label: 'Drone Fly-Through', desc: 'Forward aerial movement with soft banking' },
];

export const ImageToVideoTool: React.FC = () => {
  const [motionPrompt, setMotionPrompt] = useState(
    'Cinematic camera slow zoom in with subtle dust particles and warm sun rays diffusing through windows'
  );
  const [selectedMotion, setSelectedMotion] = useState('zoom_in');
  const [motionStrength, setMotionStrength] = useState(7);
  const [duration, setDuration] = useState('5s');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [sourceImage, setSourceImage] = useState(
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80'
  );

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setIsPlaying(true);
    }, 1600);
  };

  return (
    <div className="flex-1 overflow-y-auto px-6 py-6 max-w-7xl mx-auto space-y-6 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-slate-900">Animate Image to Video</h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700">
              Veo 2 / SVD Motion Engine
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Turn static photography and corporate visuals into fluid cinematic video animations
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
            HD 1080p • 24 FPS
          </span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls Column (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-5">
          {/* Step 1: Source Image Selection */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-800">1. Source Image</label>
              <span className="text-[10px] text-slate-400">Click to change</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
                'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=800&q=80',
                'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
              ].map((imgUrl, idx) => (
                <button
                  key={idx}
                  onClick={() => setSourceImage(imgUrl)}
                  className={`relative rounded-xl overflow-hidden aspect-video border transition-all ${
                    sourceImage === imgUrl ? 'ring-2 ring-red-600 border-red-600' : 'border-slate-200'
                  }`}
                >
                  <img src={imgUrl} alt={`Sample ${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Motion Instructions */}
          <div>
            <label className="text-xs font-bold text-slate-800 block mb-1.5">
              2. Motion / Action Prompt
            </label>
            <textarea
              rows={3}
              value={motionPrompt}
              onChange={(e) => setMotionPrompt(e.target.value)}
              placeholder="Describe what moves: water flowing, clouds drifting, camera panning..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:border-red-500 outline-none resize-none leading-relaxed"
            />
          </div>

          {/* Step 3: Camera Dynamics */}
          <div>
            <label className="text-xs font-bold text-slate-800 block mb-1.5">
              3. Camera Motion Trajectory
            </label>
            <div className="space-y-1.5">
              {CAMERA_MOTIONS.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setSelectedMotion(m.id)}
                  className={`w-full p-2.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                    selectedMotion === m.id
                      ? 'border-red-500 bg-red-50/70 text-red-950 font-bold'
                      : 'border-slate-200 bg-slate-50/60 hover:bg-white text-slate-700'
                  }`}
                >
                  <div>
                    <div className="text-xs">{m.label}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{m.desc}</div>
                  </div>
                  {selectedMotion === m.id && (
                    <Compass className="w-4 h-4 text-red-600 shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Motion Strength & Duration */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-800">Motion Amplitude</label>
                <span className="text-xs font-mono font-bold text-red-600">{motionStrength}/10</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={motionStrength}
                onChange={(e) => setMotionStrength(Number(e.target.value))}
                className="w-full accent-red-600 cursor-pointer"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-800 block mb-1">Duration</label>
              <div className="grid grid-cols-3 gap-1">
                {['3s', '5s', '10s'].map((d) => (
                  <button
                    key={d}
                    onClick={() => setDuration(d)}
                    className={`py-1.5 rounded-lg border text-xs font-bold transition-all ${
                      duration === d
                        ? 'bg-red-600 text-white border-red-600 shadow-2xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !motionPrompt.trim()}
            className="w-full py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.98]"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Interpolating Latent Motion Flow...</span>
              </>
            ) : (
              <>
                <Film className="w-4 h-4" />
                <span>Animate into Video ({duration})</span>
              </>
            )}
          </button>
        </div>

        {/* Video Canvas Output Column (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 flex flex-col justify-between min-h-[500px]">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900">Motion Playback Monitor</span>
                <span className="text-[10px] font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                  {selectedMotion.toUpperCase()} • {duration}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors"
                >
                  {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{isPlaying ? 'Pause' : 'Play'}</span>
                </button>

                <a
                  href={sourceImage}
                  download="animated-motion.mp4"
                  className="flex items-center gap-1 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download MP4</span>
                </a>
              </div>
            </div>

            {/* Video Canvas Display */}
            <div className="relative rounded-xl overflow-hidden bg-slate-950 aspect-video flex items-center justify-center my-2 shadow-inner group">
              {isGenerating ? (
                <div className="text-center p-6 space-y-3">
                  <div className="w-12 h-12 border-3 border-red-500 border-t-transparent rounded-full animate-spin mx-auto" />
                  <div className="text-xs font-bold text-white">Synthesizing Optical Flow Fields</div>
                  <div className="text-[10px] text-slate-400">
                    Calculating {selectedMotion} trajectory and depth-map warp...
                  </div>
                </div>
              ) : (
                <div className="relative w-full h-full overflow-hidden">
                  {/* Animated image representing video playback simulation with CSS zoom/pan */}
                  <img
                    src={sourceImage}
                    alt="Animated Video Frame"
                    className={`w-full h-full object-cover transition-transform duration-1000 ${
                      isPlaying ? 'scale-115 translate-x-2' : 'scale-100 translate-x-0'
                    }`}
                  />

                  {/* Overlay Video Controls */}
                  <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-center justify-between text-white text-xs">
                    <div className="flex items-center gap-2">
                      <button onClick={() => setIsPlaying(!isPlaying)} className="hover:text-red-400">
                        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </button>
                      <span className="font-mono text-[11px]">00:03 / 00:0{duration.replace('s', '')}</span>
                    </div>

                    <div className="flex-1 mx-4">
                      <div className="w-full bg-white/30 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-red-600 h-full w-3/5 rounded-full" />
                      </div>
                    </div>

                    <span className="text-[10px] font-mono text-white/80">1080p @ 24fps</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Trajectory: &ldquo;{motionPrompt}&rdquo;</span>
            <span className="font-mono text-emerald-600 font-bold">Temporal Coherence: 98.7%</span>
          </div>
        </div>
      </div>
    </div>
  );
};
