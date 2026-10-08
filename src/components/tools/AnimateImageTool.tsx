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
  ArrowRight,
  Layers,
  Camera,
  RefreshCw
} from 'lucide-react';
import { loadFreeAiImage, FreeAiModel, createSemanticFallbackImage } from '../../utils/aiClient';
import { safeStorage } from '../../utils/safeStorage';

interface MotionPreset {
  id: string;
  name: string;
  desc: string;
  type: 'dolly' | 'pan' | 'tilt' | 'orbit' | 'wave' | 'pulse';
}

const MOTION_PRESETS: MotionPreset[] = [
  { id: 'dolly_zoom', name: 'Cinematic Dolly Zoom', desc: 'Slow cinematic push into center with depth perspective', type: 'dolly' },
  { id: 'pan_left', name: 'Panoramic Sweep', desc: 'Smooth horizontal landscape sweep from left to right', type: 'pan' },
  { id: 'tilt_up', name: 'Dramatic Tilt & Rise', desc: 'Vertical upward camera movement revealing the horizon', type: 'tilt' },
  { id: 'orbit', name: '3D Orbital Pulse', desc: 'Dynamic rotational perspective with cinematic tilt', type: 'orbit' },
  { id: 'floating', name: 'Atmospheric Undulation', desc: 'Organic floating wave motion with gentle parallax', type: 'wave' },
  { id: 'light_stream', name: 'Neon Light Streaks', desc: 'Cyberpunk horizontal light streaks with zoom pulse', type: 'pulse' },
];

const PROMPT_SUGGESTIONS = [
  'Himalayan monastery basking in golden sunrise mist with prayer flags',
  'Futuristic Mumbai skyline with flying transit pods and glowing neon spires',
  'Royal Bengal Tiger walking silently through misty bamboo jungle',
  'Diwali oil lamps floating on the Ganges river at Varanasi ghats at night',
  'High-speed electric hypercar on coastal mountain highway at sunset',
  'Intricate Indian Peacock displaying iridescent feathers in rain palace'
];

interface AnimateImageToolProps {
  initialImage?: string | null;
  onNavigateTab?: (tab: string) => void;
}

export const AnimateImageTool: React.FC<AnimateImageToolProps> = ({ initialImage, onNavigateTab }) => {
  const [motionType, setMotionType] = useState('dolly_zoom');
  const [duration, setDuration] = useState(6); // seconds
  const [intensity, setIntensity] = useState(6); // 1-10
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [enableParticles, setEnableParticles] = useState(true);
  const [vfxEffect, setVfxEffect] = useState<'embers' | 'rain' | 'bokeh' | 'scanline'>('embers');
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [loop, setLoop] = useState(true);
  const [isExportingVideo, setIsExportingVideo] = useState(false);
  const [exportNotice, setExportNotice] = useState<string | null>(null);
  const [exportProgress, setExportProgress] = useState(0);

  // Audio Ambiance State
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [audioPreset, setAudioPreset] = useState<'cinematic' | 'cyber' | 'rain' | 'temple'>('cinematic');
  const audioCtxRef = useRef<AudioContext | null>(null);
  const audioOscRef = useRef<{ osc1?: OscillatorNode; osc2?: OscillatorNode; gain?: GainNode } | null>(null);

  // Free AI Engine & Prompt Configuration
  const [aiPrompt, setAiPrompt] = useState('Himalayan monastery basking in golden sunrise mist with prayer flags');
  const [selectedModel, setSelectedModel] = useState<FreeAiModel>('flux');
  const [isGeneratingAiImage, setIsGeneratingAiImage] = useState(false);
  const [imageSrc, setImageSrc] = useState<string>('');
  const [generationSeed, setGenerationSeed] = useState(101);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const imgRef = useRef<HTMLImageElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Load initial image from props, safeStorage, or generate from prompt
  useEffect(() => {
    if (initialImage) {
      loadImage(initialImage);
      return;
    }

    const saved = safeStorage.getItem('bharat1_active_editor_image');
    if (saved) {
      loadImage(saved);
      return;
    }

    // Generate initial image from prompt
    handleGenerateFromPrompt(aiPrompt, selectedModel);
  }, [initialImage]);

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
          setExportNotice('Image loaded successfully. Motion applied!');
          setTimeout(() => setExportNotice(null), 3000);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Generate real image from prompt using Free AI (Pollinations Flux / Turbo / Realism)
  const handleGenerateFromPrompt = async (promptText: string, model: FreeAiModel = selectedModel) => {
    setIsGeneratingAiImage(true);
    setExportNotice(`Generating base image via Free AI (${model.toUpperCase()})...`);

    const newSeed = Math.floor(Math.random() * 999999);
    setGenerationSeed(newSeed);

    try {
      const loadedUrl = await loadFreeAiImage(promptText, 800, 450, newSeed, model, 12000);
      if (loadedUrl) {
        loadImage(loadedUrl);
        setExportNotice(`Generated image for: "${promptText.slice(0, 40)}..."`);
      } else {
        const fallbackUrl = createSemanticFallbackImage(promptText, 800, 450);
        loadImage(fallbackUrl);
        setExportNotice('Synthesized generative visual composition');
      }
    } catch {
      const fallbackUrl = createSemanticFallbackImage(promptText, 800, 450);
      loadImage(fallbackUrl);
      setExportNotice('Synthesized visual motion frame');
    } finally {
      setIsGeneratingAiImage(false);
      setTimeout(() => setExportNotice(null), 3500);
    }
  };

  // Web Audio Ambiance Synthesis
  useEffect(() => {
    if (!isAudioEnabled) {
      if (audioOscRef.current?.gain) {
        try {
          audioOscRef.current.gain.gain.setValueAtTime(0, audioCtxRef.current?.currentTime || 0);
        } catch {}
      }
      return;
    }

    try {
      if (!audioCtxRef.current) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      // Stop previous nodes
      if (audioOscRef.current?.osc1) {
        try { audioOscRef.current.osc1.stop(); } catch {}
      }
      if (audioOscRef.current?.osc2) {
        try { audioOscRef.current.osc2.stop(); } catch {}
      }

      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      gain.gain.setValueAtTime(0.08, ctx.currentTime);

      if (audioPreset === 'cinematic') {
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(110, ctx.currentTime); // A2 drone
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(164.81, ctx.currentTime); // E3 fifth
      } else if (audioPreset === 'cyber') {
        osc1.type = 'sawtooth';
        osc1.frequency.setValueAtTime(65.41, ctx.currentTime); // C2 bass
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(130.81, ctx.currentTime);
      } else if (audioPreset === 'temple') {
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(146.83, ctx.currentTime); // D3
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(220, ctx.currentTime); // A3
      } else {
        // rain drone
        osc1.type = 'triangle';
        osc1.frequency.setValueAtTime(98, ctx.currentTime);
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(146.83, ctx.currentTime);
      }

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start();
      osc2.start();

      audioOscRef.current = { osc1, osc2, gain };
    } catch {
      // Audio not supported in this browser
    }

    return () => {
      try {
        if (audioOscRef.current?.osc1) audioOscRef.current.osc1.stop();
        if (audioOscRef.current?.osc2) audioOscRef.current.osc2.stop();
      } catch {}
    };
  }, [isAudioEnabled, audioPreset]);

  // Animation Loop using requestAnimationFrame
  useEffect(() => {
    let active = true;

    const render = () => {
      if (!active) return;
      const canvas = canvasRef.current;
      const img = imgRef.current;

      if (canvas && img && img.complete) {
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

          const progress = Math.min(1, Math.max(0, elapsed / duration)); // 0 to 1
          const motionScale = intensity / 5;

          ctx.clearRect(0, 0, w, h);
          ctx.save();

          // Apply selected motion transform
          if (motionType === 'dolly_zoom') {
            const scale = 1.02 + progress * 0.22 * motionScale;
            ctx.translate(w / 2, h / 2);
            ctx.scale(scale, scale);
            ctx.translate(-w / 2, -h / 2);
          } else if (motionType === 'pan_left') {
            const shiftX = (progress - 0.5) * 85 * motionScale;
            ctx.translate(shiftX, 0);
            ctx.scale(1.08, 1.08);
          } else if (motionType === 'tilt_up') {
            const shiftY = (progress - 0.5) * 60 * motionScale;
            ctx.translate(0, shiftY);
            ctx.scale(1.08, 1.08);
          } else if (motionType === 'orbit') {
            const rot = Math.sin(progress * Math.PI * 2) * 0.035 * motionScale;
            const scale = 1.05 + Math.sin(progress * Math.PI) * 0.08 * motionScale;
            ctx.translate(w / 2, h / 2);
            ctx.rotate(rot);
            ctx.scale(scale, scale);
            ctx.translate(-w / 2, -h / 2);
          } else if (motionType === 'floating') {
            const waveY = Math.sin(progress * Math.PI * 4) * 12 * motionScale;
            const waveX = Math.cos(progress * Math.PI * 2) * 10 * motionScale;
            ctx.translate(waveX, waveY);
            ctx.scale(1.05, 1.05);
          } else if (motionType === 'light_stream') {
            const pulse = 1.03 + Math.sin(progress * Math.PI * 6) * 0.04 * motionScale;
            ctx.translate(w / 2, h / 2);
            ctx.scale(pulse, pulse);
            ctx.translate(-w / 2, -h / 2);
          }

          // Draw the base image filling canvas with cover aspect
          const imgAspect = img.width / img.height;
          const canvasAspect = w / h;
          let drawW = w;
          let drawH = h;
          let drawX = 0;
          let drawY = 0;

          if (imgAspect > canvasAspect) {
            drawW = h * imgAspect;
            drawX = (w - drawW) / 2;
          } else {
            drawH = w / imgAspect;
            drawY = (h - drawH) / 2;
          }

          ctx.drawImage(img, drawX, drawY, drawW, drawH);
          ctx.restore();

          // Atmospheric VFX Particle Overlays
          if (enableParticles) {
            ctx.save();
            const time = Date.now() * 0.001;

            if (vfxEffect === 'embers') {
              // Golden floating embers
              for (let i = 0; i < 28; i++) {
                const px = ((Math.sin(i * 9 + time * 0.4) * 0.5 + 0.5) * w + (time * 15 * (i % 3 + 1))) % w;
                const py = (h - ((time * 35 * (i % 2 + 1) + i * 25) % h));
                const pr = (i % 3) + 1.2;
                ctx.fillStyle = i % 2 === 0 ? 'rgba(251, 191, 36, 0.75)' : 'rgba(249, 115, 22, 0.65)';
                ctx.beginPath();
                ctx.arc(px, py, pr, 0, Math.PI * 2);
                ctx.fill();
              }
            } else if (vfxEffect === 'rain') {
              // Cinematic Rain
              ctx.strokeStyle = 'rgba(224, 242, 254, 0.45)';
              ctx.lineWidth = 1.2;
              for (let i = 0; i < 35; i++) {
                const rx = ((i * 37 + time * 90) % w);
                const ry = ((i * 49 + time * 400) % h);
                ctx.beginPath();
                ctx.moveTo(rx, ry);
                ctx.lineTo(rx - 4, ry + 18);
                ctx.stroke();
              }
            } else if (vfxEffect === 'scanline') {
              // Cyberpunk Scanlines & Vignette
              ctx.fillStyle = 'rgba(6, 182, 212, 0.04)';
              for (let y = 0; y < h; y += 4) {
                ctx.fillRect(0, y, w, 1);
              }
            } else if (vfxEffect === 'bokeh') {
              // Floating Soft Bokeh
              for (let i = 0; i < 14; i++) {
                const bx = ((Math.sin(i * 13 + time * 0.2) * 0.5 + 0.5) * w);
                const by = ((Math.cos(i * 17 + time * 0.15) * 0.5 + 0.5) * h);
                const br = (i % 4) * 8 + 12;
                const bGrad = ctx.createRadialGradient(bx, by, 0, bx, by, br);
                bGrad.addColorStop(0, 'rgba(255, 255, 255, 0.25)');
                bGrad.addColorStop(0.7, 'rgba(244, 114, 182, 0.12)');
                bGrad.addColorStop(1, 'transparent');
                ctx.fillStyle = bGrad;
                ctx.beginPath();
                ctx.arc(bx, by, br, 0, Math.PI * 2);
                ctx.fill();
              }
            }

            // Cinematic Letterbox Vignette
            const vigGrad = ctx.createRadialGradient(w / 2, h / 2, h * 0.45, w / 2, h / 2, w * 0.65);
            vigGrad.addColorStop(0, 'transparent');
            vigGrad.addColorStop(1, 'rgba(3, 7, 18, 0.55)');
            ctx.fillStyle = vigGrad;
            ctx.fillRect(0, 0, w, h);

            // Watermark brand
            ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.font = 'bold 11px system-ui, sans-serif';
            ctx.fillText('Bharat 1 AI • Motion Engine', 16, h - 14);

            ctx.restore();
          }
        }
      }

      if (isPlaying) {
        animFrameRef.current = requestAnimationFrame(render);
      }
    };

    if (isPlaying) {
      animFrameRef.current = requestAnimationFrame(render);
    }

    return () => {
      active = false;
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [isPlaying, motionType, intensity, duration, playbackSpeed, loop, enableParticles, vfxEffect]);

  // Export Real Video using MediaRecorder API
  const handleExportVideo = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsExportingVideo(true);
    setExportProgress(10);
    setExportNotice('Recording cinematic motion frames to video...');

    try {
      const stream = canvas.captureStream(30); // 30 FPS
      const mimeTypes = [
        'video/webm;codecs=vp9',
        'video/webm',
        'video/mp4'
      ];
      let selectedMime = mimeTypes.find(type => MediaRecorder.isTypeSupported(type)) || '';

      const recorder = new MediaRecorder(stream, selectedMime ? { mimeType: selectedMime } : undefined);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: selectedMime || 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const fileExt = selectedMime.includes('mp4') ? 'mp4' : 'webm';
        a.download = `bharat1-motion-${Date.now()}.${fileExt}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        setIsExportingVideo(false);
        setExportProgress(100);
        setExportNotice(`Video successfully downloaded (${fileExt.toUpperCase()})!`);
        setTimeout(() => setExportNotice(null), 4000);
      };

      // Restart animation from beginning for recording
      startTimeRef.current = Date.now();
      setIsPlaying(true);
      recorder.start();

      const recordDurationMs = duration * 1000;
      const interval = setInterval(() => {
        const currentElapsed = Date.now() - startTimeRef.current;
        const prog = Math.min(95, Math.round((currentElapsed / recordDurationMs) * 100));
        setExportProgress(prog);
      }, 300);

      setTimeout(() => {
        clearInterval(interval);
        if (recorder.state === 'recording') {
          recorder.stop();
        }
      }, recordDurationMs);

    } catch (err: any) {
      setIsExportingVideo(false);
      setExportNotice('Direct recording error. Downloading snapshot canvas instead.');
      const link = document.createElement('a');
      link.download = `bharat1-motion-frame-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      setTimeout(() => setExportNotice(null), 4000);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 select-none animate-in fade-in duration-200">
      {/* Studio Header Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                <span>Image to Video Animation</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                  100% Free AI
                </span>
              </h1>
              <p className="text-xs text-slate-500">
                Transform any prompt or photo into smooth cinematic motion video with 3D camera controls
              </p>
            </div>
          </div>
        </div>

        {/* Action Header Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            accept="image/*" 
            className="hidden" 
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Photo</span>
          </button>

          <button
            type="button"
            onClick={handleExportVideo}
            disabled={isExportingVideo}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50 active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isExportingVideo ? `Exporting (${exportProgress}%)...` : 'Download Video (MP4/WebM)'}</span>
          </button>
        </div>
      </div>

      {/* Notice Banner */}
      {exportNotice && (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 px-4 py-2.5 rounded-xl text-xs flex items-center justify-between shadow-2xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="font-medium">{exportNotice}</span>
          </div>
          {isExportingVideo && (
            <div className="w-24 bg-amber-200 rounded-full h-1.5 overflow-hidden">
              <div className="bg-amber-600 h-full transition-all duration-300" style={{ width: `${exportProgress}%` }} />
            </div>
          )}
        </div>
      )}

      {/* Main Studio Grid: Responsive 1-col on mobile, 12-col on large desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Video Viewport & Playback Controls (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-950 rounded-2xl p-2 sm:p-3 border border-slate-800 shadow-lg relative overflow-hidden group">
            {/* Real Interactive Canvas Viewport */}
            <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden flex items-center justify-center">
              <canvas
                ref={canvasRef}
                width={800}
                height={450}
                className="w-full h-full object-contain"
              />

              {/* Generating Overlay */}
              {isGeneratingAiImage && (
                <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex flex-col items-center justify-center text-white p-6 text-center z-20">
                  <div className="w-12 h-12 rounded-full border-3 border-amber-500 border-t-transparent animate-spin mb-3" />
                  <p className="text-sm font-bold text-amber-400">Synthesizing AI Visual Scene...</p>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm">Generating high-fidelity frame using Free AI {selectedModel.toUpperCase()} engine</p>
                </div>
              )}
            </div>

            {/* Timeline Progress Bar */}
            <div className="px-2 pt-3 pb-1">
              <div 
                className="relative w-full h-2 bg-slate-800 rounded-full cursor-pointer overflow-hidden group/bar"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const clickPct = (e.clientX - rect.left) / rect.width;
                  const newTime = clickPct * duration;
                  setCurrentTime(newTime);
                  startTimeRef.current = Date.now() - (newTime * 1000) / playbackSpeed;
                }}
              >
                <div 
                  className="h-full bg-gradient-to-r from-amber-500 to-red-500 rounded-full transition-all duration-100"
                  style={{ width: `${(currentTime / duration) * 100}%` }}
                />
              </div>

              {/* Playback Controls Toolbar */}
              <div className="flex items-center justify-between text-white text-xs mt-3 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (isPlaying) {
                        setIsPlaying(false);
                      } else {
                        startTimeRef.current = Date.now() - (currentTime * 1000) / playbackSpeed;
                        setIsPlaying(true);
                      }
                    }}
                    className="w-8 h-8 rounded-lg bg-amber-500 hover:bg-amber-600 text-white flex items-center justify-center font-bold transition-all active:scale-95 cursor-pointer"
                    title={isPlaying ? 'Pause' : 'Play'}
                  >
                    {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white ml-0.5" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      startTimeRef.current = Date.now();
                      setCurrentTime(0);
                      setIsPlaying(true);
                    }}
                    className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                    title="Restart from beginning"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>

                  <span className="text-[11px] font-mono text-slate-300">
                    {currentTime.toFixed(1)}s / {duration}s
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  {/* Audio Ambient Toggle */}
                  <button
                    type="button"
                    onClick={() => setIsAudioEnabled(!isAudioEnabled)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                      isAudioEnabled
                        ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                        : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                    }`}
                    title="Toggle synthesized background soundtrack"
                  >
                    {isAudioEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                    <span>Sound</span>
                  </button>

                  {/* Playback Speed */}
                  <select
                    value={playbackSpeed}
                    onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
                    className="bg-slate-800 text-slate-200 border border-slate-700 rounded-lg px-2 py-1 text-xs outline-none cursor-pointer"
                  >
                    <option value={0.5}>0.5x Speed</option>
                    <option value={1}>1.0x Normal</option>
                    <option value={1.5}>1.5x Fast</option>
                    <option value={2}>2.0x Double</option>
                  </select>

                  {/* Loop Toggle */}
                  <button
                    type="button"
                    onClick={() => setLoop(!loop)}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                      loop ? 'text-amber-400 bg-amber-500/20' : 'text-slate-500 hover:text-slate-300'
                    }`}
                    title="Toggle Loop"
                  >
                    <Repeat className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Prompt Generator Card: Direct AI Generation */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Generate New Image to Animate (100% Free AI)</span>
              </label>

              {/* Free AI Model Selector */}
              <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-[10px]">
                {(['flux', 'turbo', 'flux-realism', 'flux-3d'] as FreeAiModel[]).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setSelectedModel(m)}
                    className={`px-2 py-0.5 rounded-md font-bold transition-all cursor-pointer ${
                      selectedModel === m ? 'bg-amber-500 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {m === 'flux' ? 'Flux 4K' : m === 'turbo' ? 'Turbo' : m === 'flux-realism' ? 'Realism' : '3D'}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="Enter any prompt: eg. Futuristic Varanasi ghats with glowing lanterns..."
                className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-amber-500 focus:bg-white transition-all"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleGenerateFromPrompt(aiPrompt);
                }}
              />
              <button
                type="button"
                onClick={() => handleGenerateFromPrompt(aiPrompt)}
                disabled={isGeneratingAiImage || !aiPrompt.trim()}
                className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0 disabled:opacity-50 active:scale-95"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingAiImage ? 'animate-spin' : ''}`} />
                <span>Generate</span>
              </button>
            </div>

            {/* Quick Prompt Suggestions */}
            <div>
              <span className="text-[10px] font-semibold text-slate-400">Quick Prompt Inspirations:</span>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {PROMPT_SUGGESTIONS.map((s, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setAiPrompt(s);
                      handleGenerateFromPrompt(s);
                    }}
                    className="text-[10px] bg-slate-50 hover:bg-amber-50 hover:text-amber-700 text-slate-600 border border-slate-200/80 px-2 py-1 rounded-lg transition-colors cursor-pointer text-left truncate max-w-xs"
                    title={s}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Motion Camera & VFX Controls (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Motion Presets Grid */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-2xs space-y-3">
            <h2 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5 text-amber-500" />
              <span>Camera Motion Choreography</span>
            </h2>

            <div className="grid grid-cols-2 gap-2">
              {MOTION_PRESETS.map((preset) => {
                const isSelected = motionType === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      setMotionType(preset.id);
                      startTimeRef.current = Date.now();
                    }}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-amber-500 bg-amber-50/70 ring-2 ring-amber-500/20'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-900">{preset.name}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-amber-600" />}
                    </div>
                    <p className="text-[10px] text-slate-500 line-clamp-2 leading-tight">
                      {preset.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Intensity & Duration Sliders */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-2xs space-y-4">
            <h2 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-amber-500" />
              <span>Motion Physics & Duration</span>
            </h2>

            {/* Intensity Slider */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-700">Motion Intensity / Depth</span>
                <span className="font-mono font-bold text-amber-600">{intensity} / 10</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={intensity}
                onChange={(e) => setIntensity(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            {/* Duration Slider */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-700">Video Sequence Duration</span>
                <span className="font-mono font-bold text-amber-600">{duration} seconds</span>
              </div>
              <input
                type="range"
                min="3"
                max="12"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Atmospheric VFX Particles & Audio */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-amber-500" />
                <span>Atmospheric VFX & Particles</span>
              </h2>
              <button
                type="button"
                onClick={() => setEnableParticles(!enableParticles)}
                className={`text-[10px] px-2 py-0.5 rounded-full font-bold transition-all cursor-pointer ${
                  enableParticles ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-500'
                }`}
              >
                {enableParticles ? 'Enabled' : 'Off'}
              </button>
            </div>

            {enableParticles && (
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'embers', label: 'Golden Embers' },
                  { id: 'rain', label: 'Cinematic Rain' },
                  { id: 'bokeh', label: 'Floating Bokeh' },
                  { id: 'scanline', label: 'Cyber Scanlines' },
                ].map((fx) => (
                  <button
                    key={fx.id}
                    type="button"
                    onClick={() => setVfxEffect(fx.id as any)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      vfxEffect === fx.id
                        ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {fx.label}
                  </button>
                ))}
              </div>
            )}

            {/* Sound Preset Selector */}
            {isAudioEnabled && (
              <div className="pt-2 border-t border-slate-100">
                <span className="text-[10px] font-semibold text-slate-400 block mb-1.5">Soundtrack Vibe:</span>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { id: 'cinematic', label: 'Cinematic Pad' },
                    { id: 'cyber', label: 'Cyber Pulse' },
                    { id: 'temple', label: 'Meditative Bell' },
                    { id: 'rain', label: 'Rain Drone' },
                  ].map((aud) => (
                    <button
                      key={aud.id}
                      type="button"
                      onClick={() => setAudioPreset(aud.id as any)}
                      className={`px-2 py-1.5 rounded-lg text-[11px] font-semibold border transition-all cursor-pointer ${
                        audioPreset === aud.id
                          ? 'bg-amber-100 text-amber-900 border-amber-300'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {aud.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
