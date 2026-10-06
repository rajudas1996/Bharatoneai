import React, { useState } from 'react';
import { 
  Video, 
  Sparkles, 
  Play, 
  Pause, 
  Download, 
  RefreshCw, 
  Layers, 
  Sliders, 
  Check, 
  Maximize2 
} from 'lucide-react';

const VIDEO_PRESETS = [
  'Hyper-lapse of bustling financial district intersection at dusk, light trails of traffic, 4k ultra-wide',
  'Drone aerial shot slowly gliding over a futuristic green architecture corporate campus, golden hour',
  'Slow motion cinematic macro shot of water droplet splashing on glass table with clean studio lighting',
  'Futuristic automated container port with autonomous robotic cranes operating at night, neon reflections',
];

export const TextToVideoTool: React.FC = () => {
  const [prompt, setPrompt] = useState(VIDEO_PRESETS[0]);
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [duration, setDuration] = useState('5s');
  const [fps, setFps] = useState('60fps');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [videoThumbnail, setVideoThumbnail] = useState(
    'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1200&q=80'
  );

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const pool = [
        'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1477959858617-67f30bc75b82?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
      ];
      setVideoThumbnail(pool[Math.floor(Math.random() * pool.length)]);
      setIsGenerating(false);
      setIsPlaying(true);
    }, 1500);
  };

  return (
    <div className="flex-1 overflow-y-auto px-6 py-6 max-w-7xl mx-auto space-y-6 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-slate-900">Text to Video Studio</h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700">
              Sora / Veo 2 Engine
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Generate cinematic video scenes directly from natural language prompts
          </p>
        </div>

        <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
          Neural Motion Synthesizer
        </span>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-5">
          {/* Prompt */}
          <div>
            <label className="text-xs font-bold text-slate-800 block mb-1.5">
              Scene & Motion Description
            </label>
            <textarea
              rows={4}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe scene composition, lighting, camera angle, and subject actions..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:border-red-500 outline-none resize-none leading-relaxed"
            />

            {/* Inspiration Chips */}
            <div className="space-y-1 mt-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Prompt Inspiration:
              </span>
              {VIDEO_PRESETS.slice(0, 2).map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => setPrompt(p)}
                  className="w-full text-left text-[11px] p-2 rounded-lg bg-slate-50 hover:bg-red-50 hover:text-red-700 text-slate-600 border border-slate-200/60 transition-colors truncate"
                >
                  &ldquo;{p}&rdquo;
                </button>
              ))}
            </div>
          </div>

          {/* Settings Grid */}
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-xs font-bold text-slate-800 block mb-1">Aspect Ratio</label>
              <select
                value={aspectRatio}
                onChange={(e) => setAspectRatio(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 outline-none focus:border-red-500"
              >
                <option value="16:9">16:9 Landscape</option>
                <option value="9:16">9:16 Vertical</option>
                <option value="1:1">1:1 Square</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-800 block mb-1">Duration</label>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 outline-none focus:border-red-500"
              >
                <option value="4s">4 Seconds</option>
                <option value="5s">5 Seconds</option>
                <option value="8s">8 Seconds</option>
                <option value="12s">12 Seconds</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-800 block mb-1">Frame Rate</label>
              <select
                value={fps}
                onChange={(e) => setFps(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 outline-none focus:border-red-500"
              >
                <option value="24fps">24 FPS (Film)</option>
                <option value="60fps">60 FPS (Smooth)</option>
              </select>
            </div>
          </div>

          {/* Generate CTA */}
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="w-full py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.98]"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Generating Diffusion Video Frames...</span>
              </>
            ) : (
              <>
                <Video className="w-4 h-4" />
                <span>Generate Video from Text</span>
              </>
            )}
          </button>
        </div>

        {/* Right Output Video Player (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 flex flex-col justify-between min-h-[480px]">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <span className="text-xs font-bold text-slate-900">Rendered Video Monitor</span>
              <a
                href={videoThumbnail}
                download="text-to-video-output.mp4"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-colors shadow-2xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Video MP4</span>
              </a>
            </div>

            {/* Video Canvas */}
            <div className="relative rounded-xl overflow-hidden bg-slate-950 aspect-video flex items-center justify-center shadow-inner group">
              {isGenerating ? (
                <div className="text-center p-6 space-y-3">
                  <div className="w-12 h-12 border-3 border-red-500 border-t-transparent rounded-full animate-spin mx-auto" />
                  <div className="text-xs font-bold text-white">Synthesizing Temporal Latent Dynamics</div>
                  <div className="text-[10px] text-slate-400">
                    Applying {fps} diffusion model passes across {duration} timeline...
                  </div>
                </div>
              ) : (
                <div className="relative w-full h-full overflow-hidden">
                  <img
                    src={videoThumbnail}
                    alt="Video Render"
                    className={`w-full h-full object-cover transition-transform duration-1000 ${
                      isPlaying ? 'scale-110 translate-y-2' : 'scale-100'
                    }`}
                  />

                  {/* Player Overlay */}
                  <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-center justify-between text-white text-xs">
                    <button onClick={() => setIsPlaying(!isPlaying)} className="hover:text-red-400">
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </button>

                    <div className="flex-1 mx-4">
                      <div className="w-full bg-white/30 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-red-600 h-full w-2/3 rounded-full" />
                      </div>
                    </div>

                    <span className="font-mono text-[10px] text-white/90">
                      {aspectRatio} • {fps} • 1080p
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span className="truncate max-w-md">Prompt: &ldquo;{prompt}&rdquo;</span>
            <span className="font-mono text-emerald-600 font-bold shrink-0">FPS Consistency: 99.8%</span>
          </div>
        </div>
      </div>
    </div>
  );
};
