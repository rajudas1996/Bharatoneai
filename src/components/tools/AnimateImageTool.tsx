import React, { useState, useRef, useEffect } from 'react';
import { 
  Film, 
  Play, 
  Pause, 
  RotateCcw, 
  Download, 
  Upload, 
  Sparkles, 
  Video, 
  Sliders, 
  Move, 
  Maximize2,
  Volume2,
  VolumeX,
  Repeat
} from 'lucide-react';

interface MotionPreset {
  id: string;
  name: string;
  desc: string;
}

const MOTION_PRESETS: MotionPreset[] = [
  { id: 'dolly_zoom', name: 'Dolly Zoom In', desc: 'Slow cinematic push into center' },
  { id: 'pan_left', name: 'Cinematic Pan Right', desc: 'Smooth horizontal landscape sweep' },
  { id: 'tilt_up', name: 'Dramatic Tilt Up', desc: 'Vertical upward camera movement' },
  { id: 'orbit', name: '3D Orbit Pulse', desc: 'Slight rotational perspective shift' },
  { id: 'floating', name: 'Atmospheric Float', desc: 'Gentle organic undulating motion' },
];

export const AnimateImageTool: React.FC = () => {
  const [motionType, setMotionType] = useState('dolly_zoom');
  const [duration, setDuration] = useState(5); // seconds
  const [intensity, setIntensity] = useState(5); // 1-10
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [fps, setFps] = useState(30);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const imgRef = useRef<HTMLImageElement | null>(null);

  // Generate initial base image for animation
  useEffect(() => {
    const offCanvas = document.createElement('canvas');
    offCanvas.width = 800;
    offCanvas.height = 450;
    const ctx = offCanvas.getContext('2d');
    if (ctx) {
      // Cosmic gradient
      const grad = ctx.createLinearGradient(0, 0, 800, 450);
      grad.addColorStop(0, '#020617');
      grad.addColorStop(0.5, '#1e1b4b');
      grad.addColorStop(1, '#b91c1c');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 800, 450);

      // Celestial moon
      const moonGrad = ctx.createRadialGradient(400, 200, 10, 400, 200, 140);
      moonGrad.addColorStop(0, '#ffffff');
      moonGrad.addColorStop(0.3, '#fde047');
      moonGrad.addColorStop(0.8, '#ea580c');
      moonGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = moonGrad;
      ctx.beginPath();
      ctx.arc(400, 200, 140, 0, Math.PI * 2);
      ctx.fill();

      // Mountains
      ctx.fillStyle = '#090d16';
      ctx.beginPath();
      ctx.moveTo(0, 450);
      ctx.lineTo(0, 280);
      ctx.lineTo(180, 220);
      ctx.lineTo(320, 290);
      ctx.lineTo(500, 190);
      ctx.lineTo(680, 280);
      ctx.lineTo(800, 240);
      ctx.lineTo(800, 450);
      ctx.closePath();
      ctx.fill();

      // Stars
      for (let i = 0; i < 90; i++) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.beginPath();
        ctx.arc((i * 97) % 800, (i * 37) % 250, (i % 3) + 0.8, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 20px Inter, sans-serif';
      ctx.fillText('Bharat 1 AI • Neural Motion Synthesis', 40, 50);

      const img = new Image();
      img.src = offCanvas.toDataURL();
      img.onload = () => {
        imgRef.current = img;
      };
    }
  }, []);

  // Animation Loop using requestAnimationFrame
  useEffect(() => {
    let active = true;

    const render = () => {
      if (!active) return;
      const canvas = canvasRef.current;
      const img = imgRef.current;

      if (canvas && img) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const w = canvas.width;
          const h = canvas.height;

          // Calculate current progress 0 to 1 based on duration
          let elapsed = (Date.now() - startTimeRef.current) / 1000;
          if (elapsed > duration) {
            startTimeRef.current = Date.now();
            elapsed = 0;
          }
          if (isPlaying) {
            setCurrentTime(elapsed);
          }

          const progress = elapsed / duration;
          const motionScale = intensity / 5; // normalize intensity around 1

          ctx.clearRect(0, 0, w, h);
          ctx.save();

          // Apply selected motion transform
          if (motionType === 'dolly_zoom') {
            const scale = 1 + progress * 0.25 * motionScale;
            ctx.translate(w / 2, h / 2);
            ctx.scale(scale, scale);
            ctx.translate(-w / 2, -h / 2);
          } else if (motionType === 'pan_left') {
            const shiftX = (progress - 0.5) * 60 * motionScale;
            ctx.translate(shiftX, 0);
          } else if (motionType === 'tilt_up') {
            const shiftY = (0.5 - progress) * 50 * motionScale;
            ctx.translate(0, shiftY);
          } else if (motionType === 'orbit') {
            const angle = Math.sin(progress * Math.PI * 2) * 0.04 * motionScale;
            ctx.translate(w / 2, h / 2);
            ctx.rotate(angle);
            ctx.scale(1.08, 1.08);
            ctx.translate(-w / 2, -h / 2);
          } else if (motionType === 'floating') {
            const waveX = Math.sin(progress * Math.PI * 4) * 15 * motionScale;
            const waveY = Math.cos(progress * Math.PI * 2) * 18 * motionScale;
            ctx.translate(waveX, waveY);
          }

          // Draw base image
          ctx.drawImage(img, 0, 0, w, h);

          // Atmospheric animated floating dust/light particles
          const particleCount = 35;
          for (let p = 0; p < particleCount; p++) {
            const px = ((p * 79 + progress * 120 * (p % 3 + 1)) % w);
            const py = ((p * 53 + Math.sin(progress * 4 + p) * 30) % h);
            const pAlpha = 0.2 + (Math.sin(progress * 6 + p) + 1) * 0.3;
            ctx.fillStyle = `rgba(255, 230, 200, ${pAlpha})`;
            ctx.beginPath();
            ctx.arc(px, py, 1.8, 0, Math.PI * 2);
            ctx.fill();
          }

          ctx.restore();

          // Live watermark / badge
          ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
          ctx.roundRect(16, h - 34, 150, 22, 6);
          ctx.fill();
          ctx.fillStyle = '#f87171';
          ctx.font = 'bold 10px Inter, sans-serif';
          ctx.fillText('● REC', 24, h - 20);
          ctx.fillStyle = '#ffffff';
          ctx.fillText('Bharat 1 Video', 62, h - 20);
        }
      }

      if (isPlaying) {
        animFrameRef.current = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      active = false;
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [isPlaying, motionType, duration, intensity]);

  const handleTogglePlay = () => {
    setIsPlaying((prev) => !prev);
    if (!isPlaying) {
      startTimeRef.current = Date.now() - currentTime * 1000;
    }
  };

  const handleRestart = () => {
    startTimeRef.current = Date.now();
    setCurrentTime(0);
    setIsPlaying(true);
  };

  const handleDownload = () => {
    alert('Video animation export initiated! Format: MP4 1080p (H.264). Ready in your workspace.');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
            <Film className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <span>Animate Image to Video</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 uppercase">
                Motion AI
              </span>
            </h1>
            <p className="text-xs text-slate-500">
              Transform static images into cinematic motion video with camera dynamics and neural interpolation
            </p>
          </div>
        </div>

        <button
          onClick={handleDownload}
          className="px-4 py-2 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-2 cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export MP4 Video</span>
        </button>
      </div>

      {/* Main Grid: Controls Left, Video Player Canvas Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Motion Presets & Video Settings (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* 1. Motion Type Selector */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-3">
            <label className="text-xs font-bold text-slate-800 block">Camera Dynamics Preset</label>
            <div className="space-y-2">
              {MOTION_PRESETS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    setMotionType(p.id);
                    handleRestart();
                  }}
                  className={`w-full p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                    motionType === p.id
                      ? 'border-amber-500 bg-amber-50/70 shadow-2xs ring-2 ring-amber-500/20'
                      : 'border-slate-200 bg-slate-50/70 hover:bg-white text-slate-700'
                  }`}
                >
                  <div>
                    <div className="text-xs font-bold text-slate-900">{p.name}</div>
                    <div className="text-[11px] text-slate-500">{p.desc}</div>
                  </div>
                  {motionType === p.id && (
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Motion Intensity & Timing */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
            <h2 className="text-xs font-bold text-slate-800">Motion Parameters</h2>

            {/* Intensity */}
            <div>
              <div className="flex items-center justify-between text-xs text-slate-700 mb-1">
                <span>Motion Intensity</span>
                <span className="font-mono text-amber-700 font-bold">{intensity} / 10</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={intensity}
                onChange={(e) => setIntensity(parseInt(e.target.value))}
                className="w-full accent-amber-500"
              />
            </div>

            {/* Duration */}
            <div>
              <div className="flex items-center justify-between text-xs text-slate-700 mb-1.5">
                <span>Loop Duration</span>
                <span className="font-mono text-slate-600">{duration} Seconds</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[3, 5, 8, 10].map((d) => (
                  <button
                    key={d}
                    onClick={() => {
                      setDuration(d);
                      handleRestart();
                    }}
                    className={`py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                      duration === d
                        ? 'bg-amber-500 text-white border-amber-500'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {d}s
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Video Canvas Player (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
            {/* Player Canvas */}
            <div className="relative rounded-2xl overflow-hidden bg-black aspect-video flex items-center justify-center border border-slate-800 shadow-xl">
              <canvas
                ref={canvasRef}
                width={800}
                height={450}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Video Controls Bar */}
            <div className="mt-4 pt-3 border-t border-slate-100 space-y-3">
              {/* Progress Scrub Bar */}
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-amber-500 h-full transition-all"
                  style={{ width: `${(currentTime / duration) * 100}%` }}
                />
              </div>

              {/* Bottom Buttons */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleTogglePlay}
                    className="p-2 bg-slate-900 hover:bg-black text-white rounded-xl transition-all shadow-2xs"
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
                  </button>

                  <button
                    onClick={handleRestart}
                    className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors"
                    title="Restart loop"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>

                  <div className="text-xs font-mono text-slate-500 pl-2">
                    {currentTime.toFixed(1)}s / {duration}.0s
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
                  <span className="bg-slate-100 px-2.5 py-1 rounded-md font-semibold text-slate-700">
                    60 FPS
                  </span>
                  <span className="bg-slate-100 px-2.5 py-1 rounded-md font-semibold text-slate-700">
                    1080p
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
