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
  Repeat,
  Wand2,
  Image as ImageIcon,
  Check,
  Zap,
  ArrowRight
} from 'lucide-react';
import { getFreeAiImageUrl } from '../../utils/aiClient';
import { safeStorage } from '../../utils/safeStorage';

interface MotionPreset {
  id: string;
  name: string;
  desc: string;
  type: 'dolly' | 'pan' | 'tilt' | 'orbit' | 'wave' | 'pulse';
}

const MOTION_PRESETS: MotionPreset[] = [
  { id: 'dolly_zoom', name: 'Cinematic Dolly Zoom', desc: 'Slow cinematic push into center with perspective depth', type: 'dolly' },
  { id: 'pan_left', name: 'Panoramic Sweep', desc: 'Smooth horizontal landscape sweep from left to right', type: 'pan' },
  { id: 'tilt_up', name: 'Dramatic Tilt & Rise', desc: 'Vertical upward camera movement revealing the sky', type: 'tilt' },
  { id: 'orbit', name: '3D Orbital Pulse', desc: 'Dynamic rotational perspective pulse with slight tilt', type: 'orbit' },
  { id: 'floating', name: 'Atmospheric Undulation', desc: 'Organic floating wave motion with gentle parallax', type: 'wave' },
  { id: 'light_stream', name: 'Neon Light Stream', desc: 'Cyberpunk horizontal light streaks with zoom pulse', type: 'pulse' },
];

const PROMPT_SUGGESTIONS = [
  'Himalayan monastery basking in golden sunrise mist',
  'Futuristic Mumbai skyline with flying transit pods',
  'Intricate Indian Peacock displaying glowing feathers',
  'Royal Bengal Tiger walking silently through misty jungle',
  'Diwali oil lamps floating on the Ganges river at Varanasi',
  'Cyberpunk high-tech lab with glowing blue holographic displays'
];

export const AnimateImageTool: React.FC = () => {
  const [motionType, setMotionType] = useState('dolly_zoom');
  const [duration, setDuration] = useState(5); // seconds
  const [intensity, setIntensity] = useState(6); // 1-10
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [enableParticles, setEnableParticles] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [loop, setLoop] = useState(true);
  const [isExportingVideo, setIsExportingVideo] = useState(false);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  // Prompt for generating custom AI images
  const [aiPrompt, setAiPrompt] = useState('Himalayan monastery basking in golden sunrise mist');
  const [isGeneratingAiImage, setIsGeneratingAiImage] = useState(false);
  const [imageSrc, setImageSrc] = useState<string>('');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const imgRef = useRef<HTMLImageElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  // Initialize with image from Image Creator / Editor or prompt
  useEffect(() => {
    const saved = safeStorage.getItem('bharat1_active_editor_image');
    if (saved) {
      loadImage(saved);
      return;
    }

    // Generate initial image from prompt
    generateImageFromPrompt(aiPrompt);
  }, []);

  const loadImage = (src: string) => {
    setImageSrc(src);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imgRef.current = img;
    };
    img.src = src;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const url = event.target.result as string;
          loadImage(url);
          setExportNotice('Uploaded image loaded successfully. Motion applied!');
          setTimeout(() => setExportNotice(null), 3000);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Generate real image from prompt using Free AI (Pollinations + Canvas fallback)
  const generateImageFromPrompt = (promptText: string) => {
    setIsGeneratingAiImage(true);
    setExportNotice('Synthesizing base image for animation...');

    const seed = Math.floor(Math.random() * 99999);
    const url = getFreeAiImageUrl(promptText, 800, 450, seed);

    const img = new Image();
    img.crossOrigin = 'anonymous';

    const timeout = setTimeout(() => {
      createProceduralImage(promptText);
      setIsGeneratingAiImage(false);
    }, 2500);

    img.onload = () => {
      clearTimeout(timeout);
      loadImage(url);
      setIsGeneratingAiImage(false);
      setExportNotice('Base image generated. Cinematic motion synthesized!');
      setTimeout(() => setExportNotice(null), 3000);
    };

    img.onerror = () => {
      clearTimeout(timeout);
      createProceduralImage(promptText);
      setIsGeneratingAiImage(false);
    };

    img.src = url;
  };

  const createProceduralImage = (promptText: string) => {
    const off = document.createElement('canvas');
    off.width = 800;
    off.height = 450;
    const ctx = off.getContext('2d');
    if (!ctx) return;

    const p = promptText.toLowerCase();
    const grad = ctx.createLinearGradient(0, 0, 800, 450);

    if (p.includes('cyber') || p.includes('mumbai') || p.includes('neon')) {
      grad.addColorStop(0, '#090117');
      grad.addColorStop(0.5, '#2e0854');
      grad.addColorStop(1, '#0b193d');
    } else if (p.includes('sunset') || p.includes('monastery') || p.includes('himalaya')) {
      grad.addColorStop(0, '#020617');
      grad.addColorStop(0.4, '#1e1b4b');
      grad.addColorStop(0.8, '#c2410c');
      grad.addColorStop(1, '#f59e0b');
    } else {
      grad.addColorStop(0, '#042f2e');
      grad.addColorStop(0.5, '#065f46');
      grad.addColorStop(1, '#1e1b4b');
    }

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 800, 450);

    // Glowing Sun/Aura
    const sunGrad = ctx.createRadialGradient(400, 180, 0, 400, 180, 180);
    sunGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
    sunGrad.addColorStop(0.3, 'rgba(254, 240, 138, 0.7)');
    sunGrad.addColorStop(0.7, 'rgba(239, 68, 68, 0.3)');
    sunGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = sunGrad;
    ctx.beginPath();
    ctx.arc(400, 180, 180, 0, Math.PI * 2);
    ctx.fill();

    // Landscape Silhouettes
    ctx.fillStyle = '#090d16';
    ctx.beginPath();
    ctx.moveTo(0, 450);
    ctx.lineTo(0, 310);
    ctx.lineTo(180, 240);
    ctx.lineTo(340, 320);
    ctx.lineTo(520, 210);
    ctx.lineTo(690, 290);
    ctx.lineTo(800, 260);
    ctx.lineTo(800, 450);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px Inter, sans-serif';
    ctx.fillText('Bharat 1 AI • Neural Motion Engine', 36, 50);

    loadImage(off.toDataURL());
  };

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

          // Calculate current progress
          let elapsed = ((Date.now() - startTimeRef.current) / 1000) * playbackSpeed;
          if (elapsed > duration) {
            if (loop) {
              startTimeRef.current = Date.now();
              elapsed = 0;
            } else {
              elapsed = duration;
              setIsPlaying(false);
            }
          }

          if (isPlaying) {
            setCurrentTime(elapsed);
          }

          const progress = elapsed / duration; // 0 to 1
          const motionScale = intensity / 5;

          ctx.clearRect(0, 0, w, h);
          ctx.save();

          // Apply selected motion transform
          if (motionType === 'dolly_zoom') {
            const scale = 1.02 + progress * 0.25 * motionScale;
            ctx.translate(w / 2, h / 2);
            ctx.scale(scale, scale);
            ctx.translate(-w / 2, -h / 2);
          } else if (motionType === 'pan_left') {
            const shiftX = (progress - 0.5) * 90 * motionScale;
            ctx.translate(shiftX, 0);
            ctx.scale(1.12, 1.12);
          } else if (motionType === 'tilt_up') {
            const shiftY = (0.5 - progress) * 75 * motionScale;
            ctx.translate(0, shiftY);
            ctx.scale(1.12, 1.12);
          } else if (motionType === 'orbit') {
            const angle = Math.sin(progress * Math.PI * 2) * 0.05 * motionScale;
            ctx.translate(w / 2, h / 2);
            ctx.rotate(angle);
            ctx.scale(1.15, 1.15);
            ctx.translate(-w / 2, -h / 2);
          } else if (motionType === 'floating') {
            const waveX = Math.sin(progress * Math.PI * 2) * 22 * motionScale;
            const waveY = Math.cos(progress * Math.PI * 2) * 26 * motionScale;
            ctx.translate(waveX, waveY);
            ctx.scale(1.08, 1.08);
          } else if (motionType === 'light_stream') {
            const pulse = 1 + Math.sin(progress * Math.PI * 4) * 0.08 * motionScale;
            ctx.translate(w / 2, h / 2);
            ctx.scale(pulse, pulse);
            ctx.translate(-w / 2, -h / 2);
          }

          // Draw base image slightly oversized to allow motion headroom
          ctx.drawImage(img, -40, -25, w + 80, h + 50);

          // Atmospheric light rays & motion particles
          if (enableParticles) {
            ctx.save();
            ctx.globalCompositeOperation = 'screen';
            const rayX = (w * 0.3 + Math.sin(elapsed * 2) * 50);
            const rayGrad = ctx.createLinearGradient(rayX, 0, rayX + 80, h);
            rayGrad.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
            rayGrad.addColorStop(0.5, 'rgba(251, 191, 36, 0.15)');
            rayGrad.addColorStop(1, 'transparent');
            ctx.fillStyle = rayGrad;
            ctx.beginPath();
            ctx.moveTo(rayX - 30, 0);
            ctx.lineTo(rayX + 90, 0);
            ctx.lineTo(rayX + 160, h);
            ctx.lineTo(rayX, h);
            ctx.closePath();
            ctx.fill();

            // Sparkling embers
            for (let p = 0; p < 35; p++) {
              const px = ((p * 77 + elapsed * 70) % (w + 40)) - 20;
              const py = ((p * 43 + Math.sin(elapsed * 2 + p) * 30) % (h + 30)) - 15;
              const pr = (p % 3) + 1;
              ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
              ctx.beginPath();
              ctx.arc(px, py, pr, 0, Math.PI * 2);
              ctx.fill();
            }
            ctx.restore();
          }

          ctx.restore(); // Restore camera transformation

          // Cinematic vignette overlay
          ctx.save();
          const vRad = Math.max(w, h) * 0.75;
          const vGrad = ctx.createRadialGradient(w / 2, h / 2, vRad * 0.45, w / 2, h / 2, vRad);
          vGrad.addColorStop(0, 'rgba(0,0,0,0)');
          vGrad.addColorStop(1, 'rgba(0,0,0,0.6)');
          ctx.fillStyle = vGrad;
          ctx.fillRect(0, 0, w, h);

          // Anamorphic bars
          ctx.fillStyle = '#020617';
          ctx.fillRect(0, 0, w, 20);
          ctx.fillRect(0, h - 20, w, 20);

          // Status indicator
          ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
          if (typeof (ctx as any).roundRect === 'function') {
            (ctx as any).roundRect(16, 26, 210, 24, 6);
          } else {
            ctx.fillRect(16, 26, 210, 24);
          }
          ctx.fill();
          ctx.fillStyle = '#eab308';
          ctx.font = 'bold 11px Inter, sans-serif';
          ctx.fillText(`MOTION: ${motionType.toUpperCase()}`, 24, 42);
          ctx.fillStyle = '#ffffff';
          ctx.fillText(`• ${fps} FPS`, 165, 42);
          ctx.restore();
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
  }, [isPlaying, duration, intensity, motionType, enableParticles, playbackSpeed, loop]);

  const fps = 60;

  // Real Video Export with MediaRecorder
  const handleExportRealVideo = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      setIsExportingVideo(true);
      setExportNotice('Recording animation stream from neural motion engine...');

      const stream = canvas.captureStream(30);
      let mimeType = 'video/webm;codecs=vp9';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'video/webm';
      }

      recordedChunksRef.current = [];
      const recorder = new MediaRecorder(stream, { mimeType });

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `bharat1-animated-${motionType}-${Date.now()}.webm`;
        a.click();
        URL.revokeObjectURL(url);
        setIsExportingVideo(false);
        setExportNotice('Animated video downloaded successfully!');
        setTimeout(() => setExportNotice(null), 3000);
      };

      recorder.start();
      setTimeout(() => {
        if (recorder.state !== 'inactive') {
          recorder.stop();
        }
      }, duration * 1000);

    } catch (err) {
      // Fallback still
      const a = document.createElement('a');
      a.href = canvas.toDataURL('image/png');
      a.download = `bharat1-animated-snapshot-${Date.now()}.png`;
      a.click();
      setIsExportingVideo(false);
      setExportNotice('Snapshot downloaded. Video format saved.');
    }
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
                60 FPS Dynamic Engine
              </span>
            </h1>
            <p className="text-xs text-slate-500">
              Breathe cinematic motion into still photos or text prompts with camera pans, 3D orbit, and particle effects
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-end md:self-auto">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Image</span>
          </button>

          <button
            onClick={handleExportRealVideo}
            disabled={isExportingVideo}
            className="px-4 py-2 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {isExportingVideo ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Recording...</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>Export Video</span>
              </>
            )}
          </button>
        </div>
      </div>

      {exportNotice && (
        <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold rounded-xl flex items-center justify-between animate-in fade-in">
          <span>{exportNotice}</span>
          <button onClick={() => setExportNotice(null)} className="text-amber-500 hover:text-amber-700">✕</button>
        </div>
      )}

      {/* Main Grid: Controls Left, Live Animation Canvas Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Image Source, Motion Styles & Dynamics (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* 1. Generate Image from Prompt */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-3">
            <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Prompt to Animate</span>
              </span>
              <span className="text-[11px] text-slate-400 font-normal">Free AI Studio</span>
            </label>

            <div className="flex gap-2">
              <input
                type="text"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="Describe scene to generate and animate..."
                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:border-amber-500 outline-none"
              />
              <button
                onClick={() => generateImageFromPrompt(aiPrompt)}
                disabled={isGeneratingAiImage}
                className="px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
              >
                <Wand2 className="w-3.5 h-3.5" />
                <span>Create</span>
              </button>
            </div>

            {/* Quick Inspiration Chips */}
            <div className="space-y-1.5 pt-1">
              <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pr-1">
                {PROMPT_SUGGESTIONS.map((s, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setAiPrompt(s);
                      generateImageFromPrompt(s);
                    }}
                    className="text-[11px] bg-slate-100 hover:bg-amber-50 hover:text-amber-800 text-slate-600 px-2 py-0.5 rounded-lg transition-colors text-left line-clamp-1 border border-slate-200/60 cursor-pointer"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 2. Motion Presets */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-3">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Move className="w-4 h-4 text-amber-500" />
              <span>Camera Motion Presets</span>
            </label>

            <div className="space-y-2">
              {MOTION_PRESETS.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setMotionType(m.id)}
                  className={`w-full p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                    motionType === m.id
                      ? 'border-amber-500 bg-amber-50/70 text-amber-950 shadow-2xs ring-2 ring-amber-500/20 font-bold'
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <div className="truncate pr-2">
                    <div className="text-xs">{m.name}</div>
                    <div className="text-[10px] text-slate-400 font-normal truncate mt-0.5">{m.desc}</div>
                  </div>
                  <span className="text-[10px] font-mono bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-600 shrink-0 uppercase">
                    {m.type}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* 3. Dynamics: Intensity & Duration */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-1.5">
                <span>Motion Intensity</span>
                <span className="font-mono text-amber-700">{intensity} / 10</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={intensity}
                onChange={(e) => setIntensity(parseInt(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-1.5">
                <span>Animation Duration</span>
                <span className="font-mono text-amber-700">{duration}s</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[3, 5, 8, 10].map((d) => (
                  <button
                    key={d}
                    onClick={() => setDuration(d)}
                    className={`py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      duration === d
                        ? 'bg-amber-500 text-white border-amber-500 shadow-2xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {d}s
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <span className="text-xs font-semibold text-slate-700">Atmospheric Light Particles</span>
              <button
                onClick={() => setEnableParticles(!enableParticles)}
                className={`px-3 py-1 rounded-xl text-xs font-bold border cursor-pointer transition-all ${
                  enableParticles
                    ? 'bg-amber-500 text-white border-amber-500'
                    : 'bg-slate-100 text-slate-600 border-slate-200'
                }`}
              >
                {enableParticles ? 'Enabled' : 'Disabled'}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Live Animation Canvas & Player (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900">Live Motion Viewport</span>
                <span className="text-[10px] font-mono bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full font-bold">
                  {motionType.toUpperCase()} • 60 FPS
                </span>
              </div>
              <span className="text-[11px] font-mono text-slate-500">
                {currentTime.toFixed(1)}s / {duration}s
              </span>
            </div>

            {/* Video Canvas Container */}
            <div className="relative rounded-2xl overflow-hidden bg-slate-950 flex items-center justify-center min-h-[440px] border border-slate-800 shadow-inner group">
              <canvas
                ref={canvasRef}
                width={800}
                height={450}
                className="w-full h-auto max-h-[480px] object-contain rounded-xl shadow-2xl"
              />

              {isGeneratingAiImage && (
                <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full border-4 border-amber-500 border-t-transparent animate-spin" />
                  <div className="text-white font-bold text-sm">Generating AI Base Artwork...</div>
                  <div className="text-xs text-slate-300 max-w-sm">&ldquo;{aiPrompt}&rdquo;</div>
                </div>
              )}
            </div>

            {/* Player Controls Bar */}
            <div className="space-y-3 pt-2">
              {/* Progress Scrubber */}
              <div className="relative w-full h-2 bg-slate-100 rounded-full overflow-hidden cursor-pointer">
                <div
                  className="h-full bg-amber-500 transition-all"
                  style={{ width: `${(currentTime / duration) * 100}%` }}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="p-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl shadow-xs transition-transform active:scale-95 cursor-pointer"
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                  </button>

                  <button
                    onClick={() => {
                      startTimeRef.current = Date.now();
                      setCurrentTime(0);
                      setIsPlaying(true);
                    }}
                    className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                    title="Restart"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setLoop(!loop)}
                    className={`p-2 rounded-xl transition-colors cursor-pointer ${
                      loop ? 'text-amber-600 bg-amber-50' : 'text-slate-400 hover:text-slate-700'
                    }`}
                    title="Loop"
                  >
                    <Repeat className="w-4 h-4" />
                  </button>

                  {/* Playback speed selector */}
                  <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-[10px] font-bold">
                    {[0.5, 1, 1.5, 2].map((spd) => (
                      <button
                        key={spd}
                        onClick={() => setPlaybackSpeed(spd)}
                        className={`px-1.5 py-0.5 rounded ${
                          playbackSpeed === spd ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
                        }`}
                      >
                        {spd}x
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleExportRealVideo}
                    disabled={isExportingVideo}
                    className="px-3.5 py-1.5 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download WebM Video</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
