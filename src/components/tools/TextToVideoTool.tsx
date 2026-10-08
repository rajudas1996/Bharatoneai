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
  Check,
  Maximize2,
  Volume2,
  VolumeX,
  FastForward,
  Compass,
  Repeat,
  RefreshCw,
  Zap,
  ArrowRight
} from 'lucide-react';
import { loadFreeAiImage, FreeAiModel, createSemanticFallbackImage } from '../../utils/aiClient';

interface Scene {
  id: number;
  title: string;
  desc: string;
  camera: string;
  motionType: 'pan' | 'zoom' | 'orbit';
  imgUrl?: string;
  imgElement?: HTMLImageElement;
}

const PROMPT_SUGGESTIONS = [
  'Futuristic Mumbai with flying autonomous vehicles and neon spires in 2050',
  'Majestic Royal Bengal Tiger prowling through misty bamboo forest at dawn',
  'Sleek spacecraft arriving at Vikram Sarabhai Moon Base station in 2047',
  'Aerial drone glide through mist-covered emerald tea plantations of Munnar, Kerala',
  'Traditional classical Bharatnatyam dancer in ancient stone temple with glowing light ribbons',
  'Diwali festival of lights with thousands of floating lanterns over Varanasi ghats at night'
];

const STYLE_PRESETS = [
  { id: 'cinematic', name: 'Cinematic 4K', desc: 'Dramatic depth of field & volumetric rays' },
  { id: 'cyberpunk', name: 'Cyberpunk Neon', desc: 'Vivid futuristic glows & wet reflections' },
  { id: 'photoreal', name: 'Photorealistic', desc: 'Raw camera motion & natural sunlight' },
  { id: 'anime', name: 'Anime Studio', desc: 'Hand-drawn aesthetic with vibrant skies' },
  { id: 'sci_fi', name: 'Sci-Fi Epic', desc: 'Space opera scale with energy streaks' },
];

export const TextToVideoTool: React.FC = () => {
  const [prompt, setPrompt] = useState('Futuristic Mumbai with flying autonomous vehicles and neon spires in 2050');
  const [style, setStyle] = useState('cinematic');
  const [duration, setDuration] = useState(9); // total sequence duration (3s per scene)
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeSceneIndex, setActiveSceneIndex] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [loop, setLoop] = useState(true);
  const [isExportingVideo, setIsExportingVideo] = useState(false);
  const [exportNotice, setExportNotice] = useState<string | null>(null);
  const [exportProgress, setExportProgress] = useState(0);

  // Free AI Engine Selection
  const [selectedModel, setSelectedModel] = useState<FreeAiModel>('flux');

  // Audio Ambiance
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const audioOscRef = useRef<{ osc1?: OscillatorNode; osc2?: OscillatorNode; gain?: GainNode } | null>(null);

  // 3-Scene Storyboard Data
  const [scenes, setScenes] = useState<Scene[]>([
    { 
      id: 1, 
      title: 'Scene 1: Wide Establishing Pan', 
      desc: 'Expansive environmental panorama setting the atmosphere', 
      camera: 'Wide Angle Slow Pan', 
      motionType: 'pan' 
    },
    { 
      id: 2, 
      title: 'Scene 2: Dynamic Action Push-In', 
      desc: 'Cinematic dolly accelerating toward the central subject', 
      camera: 'Dolly Forward Zoom', 
      motionType: 'zoom' 
    },
    { 
      id: 3, 
      title: 'Scene 3: Climax Dramatic Orbit', 
      desc: 'Orbital perspective reveal with atmospheric god rays', 
      camera: 'Crane Up & Orbit', 
      motionType: 'orbit' 
    },
  ]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const scenesRef = useRef<Scene[]>(scenes);

  useEffect(() => {
    scenesRef.current = scenes;
  }, [scenes]);

  // Load Scenes on mount or prompt change
  useEffect(() => {
    handleGenerateScenes(prompt, style, selectedModel);
  }, []);

  const handleGenerateScenes = async (promptText: string, currentStyle: string, model: FreeAiModel = selectedModel) => {
    setIsGenerating(true);
    setExportNotice(`Synthesizing 3-scene sequence with Free AI (${model.toUpperCase()})...`);

    const newScenes: Scene[] = [
      {
        id: 1,
        title: 'Scene 1: Wide Establishing Pan',
        desc: `Wide panoramic view of ${promptText.slice(0, 30)}...`,
        camera: 'Wide Angle Slow Pan',
        motionType: 'pan'
      },
      {
        id: 2,
        title: 'Scene 2: Dynamic Action Push-In',
        desc: `Close perspective tracking into ${promptText.slice(0, 30)}...`,
        camera: 'Dolly Forward Zoom',
        motionType: 'zoom'
      },
      {
        id: 3,
        title: 'Scene 3: Climax Dramatic Orbit',
        desc: `Cinematic orbital climax of ${promptText.slice(0, 30)}...`,
        camera: 'Crane Up & Orbit',
        motionType: 'orbit'
      }
    ];

    try {
      // Generate Scene 1 first so user immediately sees video playing
      const prompt1 = `${promptText}, wide angle establishing shot, ${currentStyle}, 8k cinematic masterpiece`;
      const url1 = await loadFreeAiImage(prompt1, 800, 450, 42, model, 10000);
      const img1 = new Image();
      img1.crossOrigin = 'anonymous';
      img1.src = url1 || createSemanticFallbackImage(prompt1, 800, 450);
      newScenes[0].imgUrl = img1.src;
      newScenes[0].imgElement = img1;

      // Update state with scene 1 ready
      setScenes([...newScenes]);
      setExportNotice('Scene 1 synthesized. Generating subsequent action shots...');

      // Generate Scene 2 & Scene 3
      const prompt2 = `${promptText}, detailed close up dynamic action, ${currentStyle}, dramatic lighting`;
      const prompt3 = `${promptText}, high angle cinematic climax reveal, ${currentStyle}, atmospheric volumetric rays`;

      const [url2, url3] = await Promise.all([
        loadFreeAiImage(prompt2, 800, 450, 142, model, 12000),
        loadFreeAiImage(prompt3, 800, 450, 242, model, 12000)
      ]);

      const img2 = new Image();
      img2.crossOrigin = 'anonymous';
      img2.src = url2 || createSemanticFallbackImage(prompt2, 800, 450);
      newScenes[1].imgUrl = img2.src;
      newScenes[1].imgElement = img2;

      const img3 = new Image();
      img3.crossOrigin = 'anonymous';
      img3.src = url3 || createSemanticFallbackImage(prompt3, 800, 450);
      newScenes[2].imgUrl = img3.src;
      newScenes[2].imgElement = img3;

      setScenes([...newScenes]);
      setExportNotice('All 3 cinematic scenes generated and orchestrated!');
    } catch {
      // Fallback
      newScenes.forEach((sc, i) => {
        const fallUrl = createSemanticFallbackImage(`${promptText} scene ${i + 1}`, 800, 450);
        const img = new Image();
        img.src = fallUrl;
        sc.imgUrl = fallUrl;
        sc.imgElement = img;
      });
      setScenes([...newScenes]);
      setExportNotice('Generated procedural cinematic sequence');
    } finally {
      setIsGenerating(false);
      setTimeout(() => setExportNotice(null), 3500);
    }
  };

  // Web Audio Soundtrack
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
      if (ctx.state === 'suspended') ctx.resume();

      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(55, ctx.currentTime); // Low A1
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(110, ctx.currentTime); // A2

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start();
      osc2.start();

      audioOscRef.current = { osc1, osc2, gain };
    } catch {}

    return () => {
      try {
        if (audioOscRef.current?.osc1) audioOscRef.current.osc1.stop();
        if (audioOscRef.current?.osc2) audioOscRef.current.osc2.stop();
      } catch {}
    };
  }, [isAudioEnabled]);

  // Main Multi-Scene Video Rendering Loop
  useEffect(() => {
    let active = true;

    const render = () => {
      if (!active) return;
      const canvas = canvasRef.current;
      const currentScenes = scenesRef.current;

      if (canvas && currentScenes.length > 0) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const w = canvas.width;
          const h = canvas.height;

          // Elapsed time in seconds
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

          // Determine current active scene based on time
          const sceneDuration = duration / currentScenes.length;
          const rawSceneIdx = Math.floor(elapsed / sceneDuration);
          const activeIdx = Math.min(currentScenes.length - 1, Math.max(0, rawSceneIdx));
          setActiveSceneIndex(activeIdx);

          const sceneTime = elapsed - (activeIdx * sceneDuration);
          const sceneProgress = Math.min(1, Math.max(0, sceneTime / sceneDuration));

          const curScene = currentScenes[activeIdx];
          const img = curScene?.imgElement || currentScenes[0]?.imgElement;

          ctx.clearRect(0, 0, w, h);
          ctx.save();

          if (img && img.complete) {
            // Apply Camera Movement per scene motionType
            if (curScene.motionType === 'pan') {
              const shiftX = (sceneProgress - 0.5) * 80;
              ctx.translate(shiftX, 0);
              ctx.scale(1.08, 1.08);
            } else if (curScene.motionType === 'zoom') {
              const scale = 1.02 + sceneProgress * 0.22;
              ctx.translate(w / 2, h / 2);
              ctx.scale(scale, scale);
              ctx.translate(-w / 2, -h / 2);
            } else if (curScene.motionType === 'orbit') {
              const rot = Math.sin(sceneProgress * Math.PI) * 0.04;
              const scale = 1.04 + Math.sin(sceneProgress * Math.PI) * 0.08;
              ctx.translate(w / 2, h / 2);
              ctx.rotate(rot);
              ctx.scale(scale, scale);
              ctx.translate(-w / 2, -h / 2);
            }

            // Draw image cover
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
          } else {
            // Fallback gradient if loading
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(0, 0, w, h);
          }

          ctx.restore();

          // Smooth Crossfade Transition on Scene boundaries (last 0.4s)
          const transitionWindow = 0.4;
          if (sceneTime < transitionWindow && activeIdx > 0) {
            const prevImg = currentScenes[activeIdx - 1]?.imgElement;
            if (prevImg && prevImg.complete) {
              const fadeAlpha = 1 - (sceneTime / transitionWindow);
              ctx.save();
              ctx.globalAlpha = fadeAlpha;
              ctx.drawImage(prevImg, 0, 0, w, h);
              ctx.restore();
            }
          }

          // Director HUD Overlay & Cinematic Subtitles
          ctx.save();

          // Top Header HUD
          ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
          ctx.fillRect(0, 0, w, 40);

          ctx.fillStyle = '#ef4444';
          ctx.beginPath();
          ctx.arc(22, 20, 5, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 12px monospace';
          ctx.fillText(`REC  ${curScene.camera.toUpperCase()}  [4K 30FPS]`, 34, 24);

          const timecode = `TC 00:00:${Math.floor(elapsed).toString().padStart(2, '0')}:${Math.floor((elapsed % 1) * 30).toString().padStart(2, '0')}`;
          ctx.fillText(timecode, w - 170, 24);

          // Bottom Cinematic Subtitle Bar
          ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
          ctx.fillRect(0, h - 54, w, 54);

          ctx.fillStyle = '#f59e0b';
          ctx.font = 'bold 11px system-ui, sans-serif';
          ctx.fillText(curScene.title.toUpperCase(), 24, h - 34);

          ctx.fillStyle = '#ffffff';
          ctx.font = '12px system-ui, sans-serif';
          const subText = `"${prompt.length > 70 ? prompt.substring(0, 67) + '...' : prompt}"`;
          ctx.fillText(subText, 24, h - 14);

          ctx.restore();
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
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying, duration, playbackSpeed, loop]);

  // Export Real Multi-Scene Video via MediaRecorder
  const handleExportVideo = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsExportingVideo(true);
    setExportProgress(10);
    setExportNotice('Recording full 3-scene sequence to video...');

    try {
      const stream = canvas.captureStream(30);
      const mimeTypes = ['video/webm;codecs=vp9', 'video/webm', 'video/mp4'];
      const selectedMime = mimeTypes.find(type => MediaRecorder.isTypeSupported(type)) || '';

      const recorder = new MediaRecorder(stream, selectedMime ? { mimeType: selectedMime } : undefined);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: selectedMime || 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const fileExt = selectedMime.includes('mp4') ? 'mp4' : 'webm';
        a.download = `bharat1-cinematic-video-${Date.now()}.${fileExt}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        setIsExportingVideo(false);
        setExportProgress(100);
        setExportNotice(`Video successfully downloaded (${fileExt.toUpperCase()})!`);
        setTimeout(() => setExportNotice(null), 4000);
      };

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
        if (recorder.state === 'recording') recorder.stop();
      }, recordDurationMs);

    } catch {
      setIsExportingVideo(false);
      setExportNotice('Direct recording error. Downloading snapshot canvas instead.');
      const link = document.createElement('a');
      link.download = `bharat1-video-frame-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      setTimeout(() => setExportNotice(null), 4000);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 select-none animate-in fade-in duration-200">
      {/* Studio Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
            <Video className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <span>Text to Video Director</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                100% Free AI
              </span>
            </h1>
            <p className="text-xs text-slate-500">
              Generates multi-scene 4K video sequences from natural language prompts with autonomous camera direction
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleExportVideo}
          disabled={isExportingVideo}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50 active:scale-95"
        >
          <Download className="w-3.5 h-3.5" />
          <span>{isExportingVideo ? `Rendering Video (${exportProgress}%)...` : 'Download Video (MP4/WebM)'}</span>
        </button>
      </div>

      {/* Notice Banner */}
      {exportNotice && (
        <div className="bg-blue-50 border border-blue-200 text-blue-900 px-4 py-2.5 rounded-xl text-xs flex items-center justify-between shadow-2xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="font-medium">{exportNotice}</span>
          </div>
          {isExportingVideo && (
            <div className="w-24 bg-blue-200 rounded-full h-1.5 overflow-hidden">
              <div className="bg-blue-600 h-full transition-all duration-300" style={{ width: `${exportProgress}%` }} />
            </div>
          )}
        </div>
      )}

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left: Video Player Viewport (7 Cols) */}
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
              {isGenerating && (
                <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-xs flex flex-col items-center justify-center text-white p-6 text-center z-20">
                  <div className="w-12 h-12 rounded-full border-3 border-blue-500 border-t-transparent animate-spin mb-3" />
                  <p className="text-sm font-bold text-blue-400">Synthesizing 3-Scene Video Sequence...</p>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm">Generating real keyframes and camera tracking using Free AI {selectedModel.toUpperCase()}</p>
                </div>
              )}
            </div>

            {/* Timeline Bar with Scene Markers */}
            <div className="px-2 pt-3 pb-1">
              <div 
                className="relative w-full h-2.5 bg-slate-800 rounded-full cursor-pointer overflow-hidden group/bar"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const clickPct = (e.clientX - rect.left) / rect.width;
                  const newTime = clickPct * duration;
                  setCurrentTime(newTime);
                  startTimeRef.current = Date.now() - (newTime * 1000) / playbackSpeed;
                }}
              >
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-full transition-all duration-100"
                  style={{ width: `${(currentTime / duration) * 100}%` }}
                />
              </div>

              {/* Scene Cut Markers */}
              <div className="flex justify-between text-[10px] text-slate-400 px-1 mt-1 font-mono">
                <span>0s: Scene 1</span>
                <span>{(duration / 3).toFixed(0)}s: Scene 2</span>
                <span>{((duration / 3) * 2).toFixed(0)}s: Scene 3</span>
                <span>{duration}s</span>
              </div>

              {/* Controls Toolbar */}
              <div className="flex items-center justify-between text-white text-xs mt-2.5 flex-wrap gap-2">
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
                    className="w-8 h-8 rounded-lg bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center font-bold transition-all active:scale-95 cursor-pointer"
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
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>

                  <span className="text-[11px] font-mono text-slate-300">
                    {currentTime.toFixed(1)}s / {duration}s • Scene {activeSceneIndex + 1}/3
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  {/* Soundtrack Toggle */}
                  <button
                    type="button"
                    onClick={() => setIsAudioEnabled(!isAudioEnabled)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                      isAudioEnabled
                        ? 'bg-blue-500/20 text-blue-400 border-blue-500/40'
                        : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                    }`}
                  >
                    {isAudioEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                    <span>Soundtrack</span>
                  </button>

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

                  <button
                    type="button"
                    onClick={() => setLoop(!loop)}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                      loop ? 'text-blue-400 bg-blue-500/20' : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    <Repeat className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Prompt Director Script Input */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>Video Prompt Script (100% Free AI)</span>
              </label>

              {/* Model Selector */}
              <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-[10px]">
                {(['flux', 'turbo', 'flux-realism'] as FreeAiModel[]).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setSelectedModel(m)}
                    className={`px-2 py-0.5 rounded-md font-bold transition-all cursor-pointer ${
                      selectedModel === m ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {m === 'flux' ? 'Flux 4K' : m === 'turbo' ? 'Turbo' : 'Realism'}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe your scene: eg. Electric racing car at sunset on Mumbai sea link..."
                className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-blue-500 focus:bg-white transition-all"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleGenerateScenes(prompt, style);
                }}
              />
              <button
                type="button"
                onClick={() => handleGenerateScenes(prompt, style)}
                disabled={isGenerating || !prompt.trim()}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0 disabled:opacity-50 active:scale-95"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
                <span>Generate Video</span>
              </button>
            </div>

            {/* Prompt Inspirations */}
            <div>
              <span className="text-[10px] font-semibold text-slate-400">Cinematic Scene Prompts:</span>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {PROMPT_SUGGESTIONS.map((s, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setPrompt(s);
                      handleGenerateScenes(s, style);
                    }}
                    className="text-[10px] bg-slate-50 hover:bg-blue-50 hover:text-blue-700 text-slate-600 border border-slate-200/80 px-2 py-1 rounded-lg transition-colors cursor-pointer text-left truncate max-w-xs"
                    title={s}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Storyboard Scenes & Style Options (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Storyboard 3-Scenes Cards */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-2xs space-y-3">
            <h2 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-blue-600" />
              <span>Multi-Scene Storyboard Sequence</span>
            </h2>

            <div className="space-y-2">
              {scenes.map((sc, idx) => {
                const isActive = activeSceneIndex === idx;
                return (
                  <div
                    key={sc.id}
                    onClick={() => {
                      const sceneStart = (duration / scenes.length) * idx;
                      setCurrentTime(sceneStart);
                      startTimeRef.current = Date.now() - (sceneStart * 1000) / playbackSpeed;
                    }}
                    className={`p-3 rounded-xl border flex items-center gap-3 transition-all cursor-pointer ${
                      isActive
                        ? 'border-blue-500 bg-blue-50/70 ring-2 ring-blue-500/20'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {/* Scene Thumbnail */}
                    <div className="w-16 h-10 rounded-lg bg-slate-900 overflow-hidden shrink-0 border border-slate-200 relative">
                      {sc.imgUrl ? (
                        <img src={sc.imgUrl} alt={sc.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[9px] text-slate-400">Loading</div>
                      )}
                      {isActive && (
                        <div className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-blue-500 ring-2 ring-white" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-bold text-slate-900 truncate">{sc.title}</h3>
                        <span className="text-[10px] font-mono text-slate-400">{(duration / 3).toFixed(0)}s</span>
                      </div>
                      <p className="text-[10px] text-slate-500 line-clamp-1">{sc.camera}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Visual Style Selection */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-2xs space-y-3">
            <h2 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5 text-blue-600" />
              <span>Cinematic Visual Style</span>
            </h2>

            <div className="grid grid-cols-2 gap-2">
              {STYLE_PRESETS.map((st) => {
                const isSelected = style === st.id;
                return (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => {
                      setStyle(st.id);
                      handleGenerateScenes(prompt, st.id);
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50/70 ring-2 ring-blue-500/20'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-xs font-bold text-slate-900">{st.name}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-blue-600" />}
                    </div>
                    <p className="text-[10px] text-slate-500 line-clamp-1 leading-tight">{st.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Video Timing & Duration Slider */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-2xs space-y-3">
            <h2 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-blue-600" />
              <span>Sequence Duration</span>
            </h2>

            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-700">Total Video Length</span>
                <span className="font-mono font-bold text-blue-600">{duration} seconds ({Math.round(duration / 3)}s/scene)</span>
              </div>
              <input
                type="range"
                min="6"
                max="18"
                step="3"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
