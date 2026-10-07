import React, { useState, useRef, useEffect } from 'react';
import { 
  Video, 
  Play, 
  Pause, 
  Sparkles, 
  Download, 
  Layers, 
  Sliders, 
  Film, 
  RotateCcw, 
  Wand2, 
  Clock, 
  Camera, 
  Music,
  Check
} from 'lucide-react';

interface Scene {
  id: number;
  title: string;
  desc: string;
  camera: string;
}

const SAMPLE_PROMPTS = [
  'Hyperloop express connecting Delhi to Mumbai at sunset with neon reflections',
  'Aerial drone glide through mist-covered tea plantations of Munnar, Kerala',
  'Spacecraft landing at Vikram Sarabhai Space Station on the Moon in 2047',
  'Traditional classical Bharatnatyam dancer in temple with flowing light ribbons',
];

export const TextToVideoTool: React.FC = () => {
  const [prompt, setPrompt] = useState('Aerial drone glide through mist-covered tea plantations of Munnar, Kerala');
  const [style, setStyle] = useState('cinematic');
  const [duration, setDuration] = useState(6);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [isRendering, setIsRendering] = useState(false);
  const [activeScene, setActiveScene] = useState(1);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  const scenes: Scene[] = [
    { id: 1, title: 'Scene 1: Establishing Shot', desc: 'Wide aerial angle sweeping over lush emerald hills', camera: 'Slow Wide Pan' },
    { id: 2, title: 'Scene 2: Close Dynamic Pass', desc: 'Morning sunbeams piercing through silver fog clouds', camera: 'Dolly Forward' },
    { id: 3, title: 'Scene 3: Climax Panorama', desc: 'Sunset glow washing over mountain valleys in 4K', camera: 'Crane Up & Orbit' },
  ];

  // Render simulated neural video frames
  useEffect(() => {
    let active = true;

    const render = () => {
      if (!active) return;
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const w = canvas.width;
          const h = canvas.height;

          let elapsed = (Date.now() - startTimeRef.current) / 1000;
          if (elapsed > duration) {
            startTimeRef.current = Date.now();
            elapsed = 0;
          }
          if (isPlaying) {
            setCurrentTime(elapsed);
          }

          const sceneIdx = Math.min(scenes.length - 1, Math.floor((elapsed / duration) * scenes.length));
          setActiveScene(sceneIdx + 1);

          const progress = (elapsed / duration) * Math.PI * 2;

          // Background procedural render
          const grad = ctx.createLinearGradient(0, 0, w, h);
          grad.addColorStop(0, '#042f2e');
          grad.addColorStop(0.4, '#065f46');
          grad.addColorStop(1, '#022c22');
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, w, h);

          // Moving sunlight rays
          ctx.save();
          const lightX = w * 0.7 + Math.sin(progress) * 40;
          const lightGrad = ctx.createRadialGradient(lightX, 60, 10, lightX, 60, 300);
          lightGrad.addColorStop(0, 'rgba(254, 240, 138, 0.7)');
          lightGrad.addColorStop(0.6, 'rgba(16, 185, 129, 0.2)');
          lightGrad.addColorStop(1, 'transparent');
          ctx.fillStyle = lightGrad;
          ctx.beginPath();
          ctx.arc(lightX, 60, 300, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();

          // Mountain contours moving with camera parallax
          const shift = Math.sin(progress) * 35;
          ctx.fillStyle = '#064e3b';
          ctx.beginPath();
          ctx.moveTo(0, h);
          ctx.lineTo(0, 240 + shift * 0.4);
          ctx.lineTo(200, 180 + shift * 0.3);
          ctx.lineTo(400, 260 + shift * 0.5);
          ctx.lineTo(600, 170 + shift * 0.3);
          ctx.lineTo(w, 230 + shift * 0.4);
          ctx.lineTo(w, h);
          ctx.closePath();
          ctx.fill();

          // Foreground Tea terraces
          ctx.fillStyle = '#022c22';
          ctx.beginPath();
          ctx.moveTo(0, h);
          ctx.lineTo(0, 340 + shift);
          ctx.lineTo(250, 290 + shift);
          ctx.lineTo(550, 360 + shift);
          ctx.lineTo(w, 310 + shift);
          ctx.lineTo(w, h);
          ctx.closePath();
          ctx.fill();

          // Mist layers
          ctx.fillStyle = 'rgba(240, 253, 250, 0.15)';
          ctx.fillRect(0, 260 + Math.sin(progress * 2) * 20, w, 60);

          // Scene indicator overlay
          ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
          if (typeof (ctx as any).roundRect === 'function') {
            (ctx as any).roundRect(16, 16, 180, 26, 6);
          } else {
            ctx.rect(16, 16, 180, 26);
          }
          ctx.fill();
          ctx.fillStyle = '#10b981';
          ctx.font = 'bold 11px Inter, sans-serif';
          ctx.fillText(`SCENE ${sceneIdx + 1} / 3`, 26, 33);
          ctx.fillStyle = '#ffffff';
          ctx.fillText(`• ${scenes[sceneIdx].camera}`, 94, 33);
        }
      }

      if (isPlaying) {
        animFrameRef.current = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      active = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying, duration, prompt]);

  const handleRenderNewPrompt = () => {
    setIsRendering(true);
    setTimeout(() => {
      setIsRendering(false);
      startTimeRef.current = Date.now();
      setCurrentTime(0);
      setIsPlaying(true);
    }, 1000);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
            <Video className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <span>Text to Video Studio</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 uppercase">
                Sora 2.0 Engine
              </span>
            </h1>
            <p className="text-xs text-slate-500">
              Generate full cinematic video sequences, multi-scene storyboards, and camera choreography from script prompts
            </p>
          </div>
        </div>

        <button
          onClick={() => alert('Full 4K Video export queued! You will receive notification when rendering finishes.')}
          className="px-4 py-2 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-2 cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export 4K Video</span>
        </button>
      </div>

      {/* Main Grid: Script Left, Video Renderer Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Script Prompts & Scenes (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* 1. Prompt Input */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-3">
            <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
              <span>Scene Script / Prompt</span>
              <span className="text-[11px] text-blue-600 font-semibold">Storyboard Enabled</span>
            </label>
            <textarea
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe your scene in detail..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:border-blue-500 outline-none transition-all resize-none shadow-2xs"
            />

            {/* Suggestions */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Preset Scripts:
              </span>
              <div className="flex flex-col gap-1.5">
                {SAMPLE_PROMPTS.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setPrompt(p);
                      handleRenderNewPrompt();
                    }}
                    className="text-[11px] bg-slate-50 hover:bg-blue-50 hover:text-blue-700 text-slate-600 px-2.5 py-1.5 rounded-lg transition-colors text-left truncate border border-slate-200/60"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleRenderNewPrompt}
              disabled={isRendering}
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              {isRendering ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Generating Video Shots...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-3.5 h-3.5" />
                  <span>Synthesize Storyboard</span>
                </>
              )}
            </button>
          </div>

          {/* 2. Storyboard Shot List */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-3">
            <h2 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Film className="w-4 h-4 text-blue-600" />
              <span>Storyboard Shots Breakdown</span>
            </h2>
            <div className="space-y-2">
              {scenes.map((s) => (
                <div
                  key={s.id}
                  className={`p-3 rounded-xl border transition-all ${
                    activeScene === s.id
                      ? 'border-blue-500 bg-blue-50/60 ring-2 ring-blue-500/20'
                      : 'border-slate-200 bg-slate-50/60 text-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-900">{s.title}</span>
                    <span className="text-[10px] font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-600">
                      {s.camera}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Live Video Canvas Player (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
            {/* Player Viewport */}
            <div className="relative rounded-2xl overflow-hidden bg-black aspect-video flex items-center justify-center border border-slate-800 shadow-xl">
              <canvas
                ref={canvasRef}
                width={800}
                height={450}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Video Controls */}
            <div className="mt-4 pt-3 border-t border-slate-100 space-y-3">
              {/* Scrub Bar */}
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-blue-600 h-full transition-all"
                  style={{ width: `${(currentTime / duration) * 100}%` }}
                />
              </div>

              {/* Action Bar */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="p-2 bg-slate-900 hover:bg-black text-white rounded-xl transition-all shadow-2xs"
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
                  </button>

                  <button
                    onClick={() => {
                      startTimeRef.current = Date.now();
                      setCurrentTime(0);
                      setIsPlaying(true);
                    }}
                    className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>

                  <div className="text-xs font-mono text-slate-500 pl-2">
                    {currentTime.toFixed(1)}s / {duration}.0s
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
                  <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-semibold">
                    4K Ultra HD
                  </span>
                  <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-semibold">
                    HDR10
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
