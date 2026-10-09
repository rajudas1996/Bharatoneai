import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Scissors, 
  Trash2, 
  Copy, 
  Plus, 
  Volume2, 
  VolumeX, 
  Sliders, 
  Type, 
  Smile, 
  Music, 
  Film, 
  Sparkles, 
  Download, 
  RotateCw, 
  FlipHorizontal, 
  FlipVertical, 
  ChevronRight, 
  ChevronLeft, 
  Maximize2, 
  Eye, 
  Check, 
  Upload, 
  Repeat,
  Radio,
  Layers
} from 'lucide-react';
import { 
  AspectRatio, 
  VideoClipItem, 
  AudioTrackItem, 
  TextOverlayItem, 
  StickerOverlayItem, 
  ClipTransitionType 
} from '../../types/videoEditor.types';
import { 
  SAMPLE_STOCK_MEDIA, 
  SAMPLE_STOCK_AUDIO, 
  STICKER_LIBRARY, 
  audioSynth, 
  getInitialClips, 
  getInitialAudioTracks, 
  getInitialTextOverlays, 
  getInitialStickers 
} from '../../utils/videoEditorDefaults';

export const InstagramVideoEditor: React.FC = () => {
  // 1. Project State
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('9:16');
  const [clips, setClips] = useState<VideoClipItem[]>(() => getInitialClips());
  const [audioTracks, setAudioTracks] = useState<AudioTrackItem[]>(() => getInitialAudioTracks());
  const [textOverlays, setTextOverlays] = useState<TextOverlayItem[]>(() => getInitialTextOverlays());
  const [stickers, setStickers] = useState<StickerOverlayItem[]>(() => getInitialStickers());

  // 2. Playback State
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isLooping, setIsLooping] = useState<boolean>(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [masterVolume, setMasterVolume] = useState<number>(0.8);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // 3. Selection State
  const [activeTab, setActiveTab] = useState<'media' | 'audio' | 'text' | 'stickers' | 'adjust' | 'transitions'>('media');
  const [selectedClipId, setSelectedClipId] = useState<string | null>(clips[0]?.id || null);
  const [selectedTextId, setSelectedTextId] = useState<string | null>(null);
  const [selectedStickerId, setSelectedStickerId] = useState<string | null>(null);
  const [selectedAudioId, setSelectedAudioId] = useState<string | null>(audioTracks[0]?.id || null);

  // 4. Export Modal State
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [exportQuality, setExportQuality] = useState<'1080p' | '720p'>('1080p');
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportProgress, setExportProgress] = useState<number>(0);
  const [exportedUrl, setExportedUrl] = useState<string | null>(null);

  // Canvas & Audio refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const audioFileInputRef = useRef<HTMLInputElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());
  const mediaElementsCache = useRef<Map<string, HTMLImageElement | HTMLVideoElement>>(new Map());

  // Calculate project total duration
  const totalDuration = useMemo(() => {
    return clips.reduce((acc, clip) => acc + clip.duration, 0);
  }, [clips]);

  // Current active clip based on currentTime
  const activeClipIndex = useMemo(() => {
    let accumulated = 0;
    for (let i = 0; i < clips.length; i++) {
      if (currentTime >= accumulated && currentTime < accumulated + clips[i].duration) {
        return i;
      }
      accumulated += clips[i].duration;
    }
    return Math.max(0, clips.length - 1);
  }, [clips, currentTime]);

  const activeClip = clips[activeClipIndex] || null;

  // Selected clip object
  const selectedClip = useMemo(() => {
    return clips.find(c => c.id === selectedClipId) || activeClip || clips[0] || null;
  }, [clips, selectedClipId, activeClip]);

  // Preload Images into Cache
  useEffect(() => {
    clips.forEach(clip => {
      if (!mediaElementsCache.current.has(clip.id)) {
        if (clip.type === 'image') {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.src = clip.url;
          mediaElementsCache.current.set(clip.id, img);
        } else {
          const vid = document.createElement('video');
          vid.crossOrigin = 'anonymous';
          vid.src = clip.url;
          vid.muted = true;
          vid.playsInline = true;
          mediaElementsCache.current.set(clip.id, vid);
        }
      }
    });
  }, [clips]);

  // Main Canvas Rendering Loop
  const renderFrame = (time: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions based on aspect ratio
    let width = 720;
    let height = 1280; // 9:16 default
    if (aspectRatio === '1:1') {
      width = 720;
      height = 720;
    } else if (aspectRatio === '4:5') {
      width = 720;
      height = 900;
    } else if (aspectRatio === '16:9') {
      width = 1280;
      height = 720;
    }

    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }

    // 1. Draw Background
    ctx.save();
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);

    // 2. Locate active clip and clip local time
    let accumulatedTime = 0;
    let currentClip: VideoClipItem | null = null;
    let clipLocalTime = 0;

    for (const c of clips) {
      if (time >= accumulatedTime && time <= accumulatedTime + c.duration) {
        currentClip = c;
        clipLocalTime = time - accumulatedTime;
        break;
      }
      accumulatedTime += c.duration;
    }

    if (!currentClip && clips.length > 0) {
      currentClip = clips[clips.length - 1];
      clipLocalTime = currentClip.duration;
    }

    // 3. Render Media Clip with filters & transitions
    if (currentClip) {
      const media = mediaElementsCache.current.get(currentClip.id);

      // Check transition at clip entry
      let opacity = 1;
      let offsetX = 0;
      let scale = 1;

      const transDuration = currentClip.transitionDuration || 0.5;
      if (clipLocalTime < transDuration && currentClip.transition !== 'none') {
        const progress = clipLocalTime / transDuration;
        if (currentClip.transition === 'fade' || currentClip.transition === 'dissolve') {
          opacity = progress;
        } else if (currentClip.transition === 'slide-left') {
          offsetX = (1 - progress) * width;
        } else if (currentClip.transition === 'slide-right') {
          offsetX = -(1 - progress) * width;
        } else if (currentClip.transition === 'zoom-in') {
          scale = 0.6 + progress * 0.4;
          opacity = progress;
        } else if (currentClip.transition === 'flash') {
          opacity = progress < 0.3 ? 0.3 : 1;
        }
      }

      ctx.save();
      ctx.globalAlpha = opacity;

      // CSS / Canvas Filter String
      const brightnessVal = 100 + currentClip.brightness;
      const contrastVal = 100 + currentClip.contrast;
      const saturationVal = 100 + currentClip.saturation;
      const blurVal = currentClip.blur;
      ctx.filter = `brightness(${brightnessVal}%) contrast(${contrastVal}%) saturate(${saturationVal}%) blur(${blurVal}px)`;

      // Handle Transform (Rotation & Flip)
      ctx.translate(width / 2 + offsetX, height / 2);
      if (currentClip.rotation) {
        ctx.rotate((currentClip.rotation * Math.PI) / 180);
      }
      ctx.scale(currentClip.flipH ? -1 * scale : 1 * scale, currentClip.flipV ? -1 * scale : 1 * scale);

      if (media && (media instanceof HTMLImageElement ? media.complete : true)) {
        try {
          // Draw image to cover canvas
          const imgWidth = (media as any).videoWidth || (media as any).naturalWidth || width;
          const imgHeight = (media as any).videoHeight || (media as any).naturalHeight || height;

          const hRatio = width / imgWidth;
          const vRatio = height / imgHeight;
          const ratio = currentClip.fit === 'contain' ? Math.min(hRatio, vRatio) : Math.max(hRatio, vRatio);

          const drawW = imgWidth * ratio;
          const drawH = imgHeight * ratio;

          ctx.drawImage(media, -drawW / 2, -drawH / 2, drawW, drawH);
        } catch {
          // Fallback solid gradient
          const grad = ctx.createLinearGradient(-width / 2, -height / 2, width / 2, height / 2);
          grad.addColorStop(0, '#3b82f6');
          grad.addColorStop(1, '#8b5cf6');
          ctx.fillStyle = grad;
          ctx.fillRect(-width / 2, -height / 2, width, height);
        }
      } else {
        // Fallback modern gradient background
        const grad = ctx.createLinearGradient(-width / 2, -height / 2, width / 2, height / 2);
        grad.addColorStop(0, '#1e293b');
        grad.addColorStop(1, '#0f172a');
        ctx.fillStyle = grad;
        ctx.fillRect(-width / 2, -height / 2, width, height);
      }
      ctx.restore();

      // Flash white effect
      if (clipLocalTime < 0.25 && currentClip.transition === 'flash') {
        ctx.save();
        ctx.fillStyle = `rgba(255, 255, 255, ${1 - clipLocalTime / 0.25})`;
        ctx.fillRect(0, 0, width, height);
        ctx.restore();
      }
    }

    // 4. Render Active Stickers
    stickers.forEach(stk => {
      if (time >= stk.startTime && time <= stk.startTime + stk.duration) {
        ctx.save();
        const posX = (stk.x / 100) * width;
        const posY = (stk.y / 100) * height;

        ctx.translate(posX, posY);
        ctx.scale(stk.scale, stk.scale);

        if (stk.content.length <= 4) {
          // Single Emoji
          ctx.font = '54px "Apple Color Emoji", "Segoe UI Emoji", sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(stk.content, 0, 0);
        } else {
          // Sticker Pill
          ctx.font = 'bold 22px Inter, sans-serif';
          const textMetrics = ctx.measureText(stk.content);
          const pW = textMetrics.width + 32;
          const pH = 44;

          ctx.fillStyle = '#ef4444';
          ctx.beginPath();
          ctx.roundRect(-pW / 2, -pH / 2, pW, pH, 22);
          ctx.fill();

          ctx.fillStyle = '#ffffff';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(stk.content, 0, 0);
        }
        ctx.restore();
      }
    });

    // 5. Render Active Text Overlays with animations
    textOverlays.forEach(txt => {
      if (time >= txt.startTime && time <= txt.startTime + txt.duration) {
        const textLocalTime = time - txt.startTime;
        let animScale = 1;
        let animAlpha = 1;
        let animOffsetY = 0;

        if (txt.animation === 'bounce' && textLocalTime < 0.5) {
          const t = textLocalTime / 0.5;
          animScale = Math.sin(t * Math.PI) * 0.25 + 1;
        } else if (txt.animation === 'fade' && textLocalTime < 0.5) {
          animAlpha = textLocalTime / 0.5;
        } else if (txt.animation === 'slide-up' && textLocalTime < 0.4) {
          animOffsetY = (1 - textLocalTime / 0.4) * 40;
          animAlpha = textLocalTime / 0.4;
        }

        ctx.save();
        ctx.globalAlpha = animAlpha;

        const posX = (txt.x / 100) * width;
        const posY = (txt.y / 100) * height + animOffsetY;

        ctx.translate(posX, posY);
        ctx.scale(animScale, animScale);

        ctx.font = `${txt.fontWeight || 'bold'} ${txt.fontSize * 1.5}px ${txt.fontFamily || 'Inter, sans-serif'}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const metrics = ctx.measureText(txt.text);
        const textWidth = metrics.width;
        const textHeight = txt.fontSize * 1.8;

        // Draw pill background if defined
        if (txt.backgroundColor && txt.backgroundColor !== 'transparent') {
          ctx.fillStyle = txt.backgroundColor;
          const padX = 24;
          const padY = 12;
          ctx.beginPath();
          ctx.roundRect(-textWidth / 2 - padX, -textHeight / 2 - padY, textWidth + padX * 2, textHeight + padY * 2, 16);
          ctx.fill();
        }

        // Draw shadow / glow
        if (txt.animation === 'glow') {
          ctx.shadowColor = txt.color;
          ctx.shadowBlur = 15;
        } else {
          ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
          ctx.shadowBlur = 8;
          ctx.shadowOffsetX = 2;
          ctx.shadowOffsetY = 2;
        }

        ctx.fillStyle = txt.color;
        ctx.fillText(txt.text, 0, 0);
        ctx.restore();
      }
    });

    ctx.restore();
  };

  // Playback timer & requestAnimationFrame
  useEffect(() => {
    let animId: number;

    const loop = (now: number) => {
      const delta = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;

      if (isPlaying) {
        setCurrentTime(prev => {
          const next = prev + delta * playbackSpeed;
          if (next >= totalDuration) {
            if (isLooping) {
              return 0;
            } else {
              setIsPlaying(false);
              audioSynth.stop();
              return totalDuration;
            }
          }
          return next;
        });
      }

      renderFrame(currentTime);
      animId = requestAnimationFrame(loop);
    };

    lastTimeRef.current = performance.now();
    animId = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(animId);
  }, [isPlaying, currentTime, totalDuration, isLooping, playbackSpeed, clips, stickers, textOverlays, aspectRatio]);

  // Sync Audio Synthesizer with Playback
  useEffect(() => {
    if (isPlaying && !isMuted && audioTracks.length > 0) {
      const activeAudio = audioTracks[0];
      audioSynth.playTrack(activeAudio.name, activeAudio.volume * masterVolume);
    } else {
      audioSynth.stop();
    }

    return () => {
      audioSynth.stop();
    };
  }, [isPlaying, isMuted, masterVolume, audioTracks]);

  // Handle Play/Pause Toggle
  const togglePlayPause = () => {
    if (currentTime >= totalDuration) {
      setCurrentTime(0);
    }
    setIsPlaying(!isPlaying);
  };

  // Upload Media Clips
  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newClips: VideoClipItem[] = [];
    Array.from(files).forEach((file, idx) => {
      const isVideo = file.type.startsWith('video');
      const url = URL.createObjectURL(file);

      newClips.push({
        id: `clip-${Date.now()}-${idx}`,
        type: isVideo ? 'video' : 'image',
        name: file.name.replace(/\.[^/.]+$/, ''),
        url: url,
        duration: isVideo ? 5.0 : 3.5,
        volume: 1,
        isMuted: false,
        brightness: 0,
        contrast: 0,
        saturation: 0,
        temperature: 0,
        blur: 0,
        rotation: 0,
        flipH: false,
        flipV: false,
        fit: 'cover',
        transition: 'dissolve',
        transitionDuration: 0.5
      });
    });

    setClips(prev => [...prev, ...newClips]);
    setSelectedClipId(newClips[0]?.id || null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Add Stock Sample Clip
  const handleAddStockMedia = (stock: typeof SAMPLE_STOCK_MEDIA[0]) => {
    const newClip: VideoClipItem = {
      ...stock,
      id: `clip-${Date.now()}`
    };
    setClips(prev => [...prev, newClip]);
    setSelectedClipId(newClip.id);
  };

  // Upload Audio
  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const url = URL.createObjectURL(file);
    const newTrack: AudioTrackItem = {
      id: `audio-${Date.now()}`,
      name: file.name.replace(/\.[^/.]+$/, ''),
      url: url,
      startTime: 0,
      duration: totalDuration || 15,
      volume: 0.8,
      isMuted: false,
      category: 'Custom Upload'
    };

    setAudioTracks(prev => [newTrack, ...prev]);
    setSelectedAudioId(newTrack.id);
    if (audioFileInputRef.current) audioFileInputRef.current.value = '';
  };

  // Add Stock Audio Track
  const handleAddStockAudio = (track: typeof SAMPLE_STOCK_AUDIO[0]) => {
    const newAudio: AudioTrackItem = {
      id: `audio-${Date.now()}`,
      name: track.name,
      url: '',
      startTime: 0,
      duration: Math.max(track.duration, totalDuration),
      volume: 0.8,
      isMuted: false,
      category: track.genre
    };
    setAudioTracks([newAudio]);
    setSelectedAudioId(newAudio.id);
  };

  // Update Selected Clip Attributes
  const updateClipAttribute = <K extends keyof VideoClipItem>(key: K, value: VideoClipItem[K]) => {
    if (!selectedClipId) return;
    setClips(prev => prev.map(c => c.id === selectedClipId ? { ...c, [key]: value } : c));
  };

  // Delete Selected Clip
  const handleDeleteClip = (id: string) => {
    if (clips.length <= 1) {
      alert("At least one clip must remain in the project.");
      return;
    }
    const updated = clips.filter(c => c.id !== id);
    setClips(updated);
    if (selectedClipId === id) {
      setSelectedClipId(updated[0]?.id || null);
    }
  };

  // Duplicate Clip
  const handleDuplicateClip = (clip: VideoClipItem) => {
    const duplicated: VideoClipItem = {
      ...clip,
      id: `clip-${Date.now()}`,
      name: `${clip.name} (Copy)`
    };
    const index = clips.findIndex(c => c.id === clip.id);
    const updated = [...clips];
    updated.splice(index + 1, 0, duplicated);
    setClips(updated);
    setSelectedClipId(duplicated.id);
  };

  // Split Clip at Current Time
  const handleSplitClipAtPlayhead = () => {
    let accumulated = 0;
    for (let i = 0; i < clips.length; i++) {
      const c = clips[i];
      if (currentTime > accumulated && currentTime < accumulated + c.duration) {
        const firstDuration = Number((currentTime - accumulated).toFixed(1));
        const secondDuration = Number((c.duration - firstDuration).toFixed(1));

        if (firstDuration > 0.4 && secondDuration > 0.4) {
          const firstClip: VideoClipItem = {
            ...c,
            duration: firstDuration
          };
          const secondClip: VideoClipItem = {
            ...c,
            id: `clip-${Date.now()}`,
            name: `${c.name} Part 2`,
            duration: secondDuration
          };

          const updated = [...clips];
          updated.splice(i, 1, firstClip, secondClip);
          setClips(updated);
          setSelectedClipId(secondClip.id);
          return;
        }
      }
      accumulated += c.duration;
    }
  };

  // Reorder Clips
  const handleMoveClip = (index: number, direction: 'left' | 'right') => {
    const target = direction === 'left' ? index - 1 : index + 1;
    if (target < 0 || target >= clips.length) return;
    const updated = [...clips];
    const [moved] = updated.splice(index, 1);
    updated.splice(target, 0, moved);
    setClips(updated);
  };

  // Add Text Layer
  const handleAddText = (preset: 'title' | 'caption' | 'neon' | 'quote') => {
    const presets = {
      title: { text: 'Epic Reel Title ✨', fontSize: 26, color: '#ffffff', bg: 'rgba(0,0,0,0.7)', anim: 'bounce' as const },
      caption: { text: 'Swipe up for more 👆', fontSize: 18, color: '#facc15', bg: 'rgba(15,23,42,0.8)', anim: 'slide-up' as const },
      neon: { text: 'CYBER VIBES ⚡', fontSize: 28, color: '#06b6d4', bg: 'transparent', anim: 'glow' as const },
      quote: { text: '“Dream big, build bold.”', fontSize: 20, color: '#ffffff', bg: 'rgba(0,0,0,0.5)', anim: 'fade' as const },
    };

    const p = presets[preset];
    const newText: TextOverlayItem = {
      id: `txt-${Date.now()}`,
      text: p.text,
      startTime: Math.max(0, currentTime),
      duration: 3.5,
      x: 50,
      y: 50,
      fontSize: p.fontSize,
      color: p.color,
      backgroundColor: p.bg,
      fontFamily: 'Inter, sans-serif',
      fontWeight: '800',
      animation: p.anim
    };

    setTextOverlays(prev => [...prev, newText]);
    setSelectedTextId(newText.id);
    setActiveTab('text');
  };

  // Add Sticker / Emoji
  const handleAddSticker = (item: typeof STICKER_LIBRARY[0]) => {
    const newSticker: StickerOverlayItem = {
      id: `stk-${Date.now()}`,
      content: item.emojiOrIcon,
      label: item.label,
      startTime: Math.max(0, currentTime),
      duration: 3.5,
      x: 50,
      y: 40,
      scale: 1.2
    };

    setStickers(prev => [...prev, newSticker]);
    setSelectedStickerId(newSticker.id);
  };

  // Reset to default sample reel
  const handleResetSampleReel = () => {
    setClips(getInitialClips());
    setAudioTracks(getInitialAudioTracks());
    setTextOverlays(getInitialTextOverlays());
    setStickers(getInitialStickers());
    setCurrentTime(0);
    setIsPlaying(false);
  };

  // Real Canvas Video Export (creates actual WebM video or snapshot)
  const handleExportReel = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsExporting(true);
    setExportProgress(10);
    setCurrentTime(0);
    setIsPlaying(false);

    try {
      // 1. Check if MediaRecorder is supported
      if (typeof MediaRecorder !== 'undefined') {
        const stream = canvas.captureStream(30);
        let mimeType = 'video/webm;codecs=vp9';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'video/webm';
        }

        const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 4500000 });
        const recordedChunks: Blob[] = [];

        recorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            recordedChunks.push(event.data);
          }
        };

        recorder.onstop = () => {
          const blob = new Blob(recordedChunks, { type: 'video/webm' });
          const url = URL.createObjectURL(blob);
          setExportedUrl(url);
          setIsExporting(false);
          setExportProgress(100);

          // Trigger automatic download
          const a = document.createElement('a');
          a.href = url;
          a.download = `BharatOneAI_Reel_${Date.now()}.webm`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        };

        recorder.start();

        // Render project from 0 to totalDuration smoothly
        let recordTime = 0;
        const recordInterval = setInterval(() => {
          recordTime += 0.08;
          setExportProgress(Math.min(95, Math.round((recordTime / totalDuration) * 90)));
          renderFrame(recordTime);

          if (recordTime >= totalDuration) {
            clearInterval(recordInterval);
            recorder.stop();
          }
        }, 80);
      } else {
        // Fallback snapshot export
        const dataUrl = canvas.toDataURL('image/png');
        setExportedUrl(dataUrl);
        setIsExporting(false);
        setExportProgress(100);

        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = `BharatOneAI_Reel_Cover_${Date.now()}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    } catch {
      // Fallback download canvas cover
      const dataUrl = canvas.toDataURL('image/png');
      setExportedUrl(dataUrl);
      setIsExporting(false);
      setExportProgress(100);

      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `BharatOneAI_Reel_Cover_${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  // Format time (00:03.4)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = (seconds % 60).toFixed(1);
    return `${mins.toString().padStart(2, '0')}:${secs.padStart(4, '0')}`;
  };

  return (
    <div className="bg-slate-900 text-white rounded-3xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col select-none">
      {/* 1. TOP HEADER & WORKSPACE TOOLBAR */}
      <div className="bg-slate-950/90 border-b border-slate-800/80 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        {/* Branding & Title */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center text-white shadow-md">
            <Film className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm md:text-base font-extrabold text-white tracking-tight">
                Instagram Edits Studio
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30">
                PRO REELS
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Multi-track timeline, transitions, audio beats, stickers & video effects
            </p>
          </div>
        </div>

        {/* Aspect Ratio Selector */}
        <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
          {(['9:16', '1:1', '4:5', '16:9'] as AspectRatio[]).map(ratio => (
            <button
              key={ratio}
              type="button"
              onClick={() => setAspectRatio(ratio)}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                aspectRatio === ratio
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {ratio === '9:16' ? '9:16 Reel' : ratio === '1:1' ? '1:1 Post' : ratio === '4:5' ? '4:5 Portrait' : '16:9 Landscape'}
            </button>
          ))}
        </div>

        {/* Timecode & Action Buttons */}
        <div className="flex items-center gap-2.5">
          <div className="px-3 py-1 bg-slate-900 border border-slate-800 rounded-xl font-mono text-xs font-bold text-slate-300">
            <span className="text-rose-400">{formatTime(currentTime)}</span>
            <span className="text-slate-600 mx-1">/</span>
            <span>{formatTime(totalDuration)}</span>
          </div>

          <button
            type="button"
            onClick={handleResetSampleReel}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
            title="Reload default sample demo project"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Load Sample Reel</span>
          </button>

          <button
            type="button"
            onClick={() => setIsExportModalOpen(true)}
            className="px-4 py-1.5 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white text-xs font-extrabold rounded-xl shadow-lg transition-all active:scale-98 cursor-pointer flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Reel</span>
          </button>
        </div>
      </div>

      {/* 2. MAIN WORKSPACE (LEFT TOOLS PANEL & CENTER LIVE CANVAS) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[460px] bg-slate-900">
        {/* LEFT TOOLBOX NAVIGATION (Tabs) */}
        <div className="lg:col-span-4 xl:col-span-4 border-r border-slate-800/80 flex flex-col bg-slate-950/60">
          {/* Sub-Tabs Nav */}
          <div className="grid grid-cols-6 border-b border-slate-800/80 bg-slate-950/80 p-1 text-[11px] font-bold">
            <button
              onClick={() => setActiveTab('media')}
              className={`p-2 rounded-lg flex flex-col items-center gap-1 cursor-pointer transition-colors ${
                activeTab === 'media' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Film className="w-4 h-4" />
              <span>Media</span>
            </button>
            <button
              onClick={() => setActiveTab('audio')}
              className={`p-2 rounded-lg flex flex-col items-center gap-1 cursor-pointer transition-colors ${
                activeTab === 'audio' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Music className="w-4 h-4" />
              <span>Audio</span>
            </button>
            <button
              onClick={() => setActiveTab('text')}
              className={`p-2 rounded-lg flex flex-col items-center gap-1 cursor-pointer transition-colors ${
                activeTab === 'text' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Type className="w-4 h-4" />
              <span>Text</span>
            </button>
            <button
              onClick={() => setActiveTab('stickers')}
              className={`p-2 rounded-lg flex flex-col items-center gap-1 cursor-pointer transition-colors ${
                activeTab === 'stickers' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Smile className="w-4 h-4" />
              <span>Stickers</span>
            </button>
            <button
              onClick={() => setActiveTab('adjust')}
              className={`p-2 rounded-lg flex flex-col items-center gap-1 cursor-pointer transition-colors ${
                activeTab === 'adjust' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span>Adjust</span>
            </button>
            <button
              onClick={() => setActiveTab('transitions')}
              className={`p-2 rounded-lg flex flex-col items-center gap-1 cursor-pointer transition-colors ${
                activeTab === 'transitions' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Effects</span>
            </button>
          </div>

          {/* ACTIVE TAB CONTENT */}
          <div className="p-4 flex-1 overflow-y-auto max-h-[460px] space-y-4">
            {/* TAB 1: MEDIA UPLOAD & STOCK */}
            {activeTab === 'media' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-300">
                    Upload & Stock Media
                  </h3>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Media</span>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*,video/*"
                    onChange={handleMediaUpload}
                    className="hidden"
                  />
                </div>

                {/* Stock Presets */}
                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-2">
                    Quick Stock Footage & Photos (Click to Add):
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {SAMPLE_STOCK_MEDIA.map((stock, i) => (
                      <div
                        key={i}
                        onClick={() => handleAddStockMedia(stock)}
                        className="group relative rounded-xl overflow-hidden border border-slate-800 bg-slate-900 cursor-pointer hover:border-rose-500 transition-all"
                      >
                        <img
                          src={stock.url}
                          alt={stock.name}
                          className="w-full h-20 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-1.5">
                          <span className="text-[10px] font-bold text-white truncate">{stock.name}</span>
                          <span className="text-[9px] text-rose-300">{stock.duration}s • {stock.type}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Active Clips Summary */}
                <div className="pt-2 border-t border-slate-800">
                  <span className="text-[11px] font-bold text-slate-400 block mb-1">
                    Project Media ({clips.length} clips):
                  </span>
                  <div className="space-y-1.5">
                    {clips.map((c, i) => (
                      <div
                        key={c.id}
                        onClick={() => setSelectedClipId(c.id)}
                        className={`p-2 rounded-xl border flex items-center justify-between text-xs cursor-pointer transition-all ${
                          selectedClipId === c.id
                            ? 'bg-rose-600/20 border-rose-500 text-white'
                            : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2 overflow-hidden">
                          <span className="w-5 h-5 rounded-md bg-slate-800 flex items-center justify-center text-[10px] font-bold text-rose-400">
                            {i + 1}
                          </span>
                          <span className="truncate font-semibold">{c.name}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[10px] text-slate-400">{c.duration}s</span>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); handleDeleteClip(c.id); }}
                            className="p-1 hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: AUDIO & MUSIC */}
            {activeTab === 'audio' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-300">
                    Background Audio
                  </h3>
                  <button
                    onClick={() => audioFileInputRef.current?.click()}
                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Audio</span>
                  </button>
                  <input
                    ref={audioFileInputRef}
                    type="file"
                    accept="audio/*"
                    onChange={handleAudioUpload}
                    className="hidden"
                  />
                </div>

                {/* Stock Audio Tracks */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 block">
                    Royalty-Free Soundtrack Library:
                  </label>
                  {SAMPLE_STOCK_AUDIO.map(track => {
                    const isSelected = audioTracks.some(a => a.name === track.name);
                    return (
                      <div
                        key={track.id}
                        className={`p-2.5 rounded-xl border flex items-center justify-between transition-all ${
                          isSelected
                            ? 'bg-rose-600/20 border-rose-500 text-white'
                            : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <div>
                          <div className="text-xs font-bold">{track.name}</div>
                          <div className="text-[10px] text-slate-400">{track.genre} • {track.duration}s</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleAddStockAudio(track)}
                          className={`px-2.5 py-1 text-xs font-bold rounded-lg cursor-pointer transition-all ${
                            isSelected ? 'bg-rose-600 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                          }`}
                        >
                          {isSelected ? 'Selected' : 'Use'}
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Audio Volume Controls */}
                <div className="pt-2 border-t border-slate-800 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-300">Master Sound Volume</span>
                    <span className="font-mono text-rose-400">{Math.round(masterVolume * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={masterVolume}
                    onChange={(e) => setMasterVolume(parseFloat(e.target.value))}
                    className="w-full accent-rose-500 cursor-pointer"
                  />
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setIsMuted(!isMuted)}
                      className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded-lg text-slate-300 flex items-center gap-1.5 cursor-pointer"
                    >
                      {isMuted ? <VolumeX className="w-3.5 h-3.5 text-red-400" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
                      <span>{isMuted ? 'Unmute Audio' : 'Mute Audio'}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: TEXT & CAPTIONS */}
            {activeTab === 'text' && (
              <div className="space-y-4">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-300">
                  Text & Typography
                </h3>

                {/* Text Presets */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleAddText('title')}
                    className="p-2.5 bg-slate-900 border border-slate-800 hover:border-rose-500 rounded-xl text-left text-xs font-bold text-white transition-all cursor-pointer"
                  >
                    <span>✨ Title Heading</span>
                    <span className="block text-[10px] text-slate-400 mt-0.5">Bold animated header</span>
                  </button>
                  <button
                    onClick={() => handleAddText('caption')}
                    className="p-2.5 bg-slate-900 border border-slate-800 hover:border-rose-500 rounded-xl text-left text-xs font-bold text-white transition-all cursor-pointer"
                  >
                    <span>💬 Reel Caption</span>
                    <span className="block text-[10px] text-slate-400 mt-0.5">Bottom subtitle pill</span>
                  </button>
                  <button
                    onClick={() => handleAddText('neon')}
                    className="p-2.5 bg-slate-900 border border-slate-800 hover:border-rose-500 rounded-xl text-left text-xs font-bold text-white transition-all cursor-pointer"
                  >
                    <span>⚡ Neon Glow</span>
                    <span className="block text-[10px] text-slate-400 mt-0.5">Vibrant cyber style</span>
                  </button>
                  <button
                    onClick={() => handleAddText('quote')}
                    className="p-2.5 bg-slate-900 border border-slate-800 hover:border-rose-500 rounded-xl text-left text-xs font-bold text-white transition-all cursor-pointer"
                  >
                    <span>“ Quote Style</span>
                    <span className="block text-[10px] text-slate-400 mt-0.5">Minimalist aesthetic</span>
                  </button>
                </div>

                {/* Active Text Inspector */}
                {selectedTextId && (
                  <div className="pt-2 border-t border-slate-800 space-y-3">
                    {(() => {
                      const txt = textOverlays.find(t => t.id === selectedTextId);
                      if (!txt) return null;
                      return (
                        <>
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-rose-400">Edit Selected Text</span>
                            <button
                              type="button"
                              onClick={() => setTextOverlays(prev => prev.filter(t => t.id !== txt.id))}
                              className="text-[11px] text-red-400 hover:underline cursor-pointer"
                            >
                              Delete Layer
                            </button>
                          </div>

                          <input
                            type="text"
                            value={txt.text}
                            onChange={(e) => {
                              const val = e.target.value;
                              setTextOverlays(prev => prev.map(t => t.id === txt.id ? { ...t, text: val } : t));
                            }}
                            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-bold"
                          />

                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <label className="text-[10px] text-slate-400 block mb-1">Color</label>
                              <input
                                type="color"
                                value={txt.color}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setTextOverlays(prev => prev.map(t => t.id === txt.id ? { ...t, color: val } : t));
                                }}
                                className="w-full h-8 bg-transparent cursor-pointer rounded-lg"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] text-slate-400 block mb-1">Font Size: {txt.fontSize}px</label>
                              <input
                                type="range"
                                min="14"
                                max="48"
                                value={txt.fontSize}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value);
                                  setTextOverlays(prev => prev.map(t => t.id === txt.id ? { ...t, fontSize: val } : t));
                                }}
                                className="w-full accent-rose-500 cursor-pointer"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="text-[10px] text-slate-400 block mb-1">Animation</label>
                            <select
                              value={txt.animation}
                              onChange={(e) => {
                                const val = e.target.value as any;
                                setTextOverlays(prev => prev.map(t => t.id === txt.id ? { ...t, animation: val } : t));
                              }}
                              className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200"
                            >
                              <option value="none">None</option>
                              <option value="bounce">Bounce / Pop</option>
                              <option value="slide-up">Slide Up</option>
                              <option value="fade">Fade In</option>
                              <option value="glow">Neon Glow</option>
                            </select>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: STICKERS & EMOJIS */}
            {activeTab === 'stickers' && (
              <div className="space-y-4">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-300">
                  Stickers & Reels Reactions
                </h3>
                <div className="grid grid-cols-4 gap-2">
                  {STICKER_LIBRARY.map((stk, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleAddSticker(stk)}
                      className="p-2.5 bg-slate-900 border border-slate-800 hover:border-rose-500 rounded-xl flex flex-col items-center justify-center gap-1 cursor-pointer transition-all hover:scale-105 active:scale-95"
                    >
                      <span className="text-2xl">{stk.emojiOrIcon}</span>
                      <span className="text-[9px] text-slate-400 truncate max-w-full">{stk.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 5: ADJUSTMENTS & FILTERS */}
            {activeTab === 'adjust' && (
              <div className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-300">
                    Clip Color & Adjustments
                  </h3>
                  <span className="text-[10px] font-bold text-rose-400 truncate max-w-[140px]">
                    {selectedClip?.name || 'Selected Clip'}
                  </span>
                </div>

                {/* Sliders */}
                <div className="space-y-2.5 text-xs">
                  <div>
                    <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                      <span>Brightness</span>
                      <span className="font-mono">{selectedClip?.brightness ?? 0}</span>
                    </div>
                    <input
                      type="range"
                      min="-100"
                      max="100"
                      value={selectedClip?.brightness ?? 0}
                      onChange={(e) => updateClipAttribute('brightness', parseInt(e.target.value))}
                      className="w-full accent-rose-500 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                      <span>Contrast</span>
                      <span className="font-mono">{selectedClip?.contrast ?? 0}</span>
                    </div>
                    <input
                      type="range"
                      min="-100"
                      max="100"
                      value={selectedClip?.contrast ?? 0}
                      onChange={(e) => updateClipAttribute('contrast', parseInt(e.target.value))}
                      className="w-full accent-rose-500 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                      <span>Saturation</span>
                      <span className="font-mono">{selectedClip?.saturation ?? 0}</span>
                    </div>
                    <input
                      type="range"
                      min="-100"
                      max="100"
                      value={selectedClip?.saturation ?? 0}
                      onChange={(e) => updateClipAttribute('saturation', parseInt(e.target.value))}
                      className="w-full accent-rose-500 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                      <span>Warmth / Temperature</span>
                      <span className="font-mono">{selectedClip?.temperature ?? 0}</span>
                    </div>
                    <input
                      type="range"
                      min="-100"
                      max="100"
                      value={selectedClip?.temperature ?? 0}
                      onChange={(e) => updateClipAttribute('temperature', parseInt(e.target.value))}
                      className="w-full accent-rose-500 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Transform Actions */}
                <div className="pt-2 border-t border-slate-800 space-y-2">
                  <span className="text-[11px] font-bold text-slate-400 block">Transform & Framing:</span>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => updateClipAttribute('rotation', ((selectedClip?.rotation ?? 0) + 90) % 360)}
                      className="p-2 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl text-xs font-bold text-slate-300 flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                      <span>Rotate 90°</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => updateClipAttribute('flipH', !selectedClip?.flipH)}
                      className="p-2 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl text-xs font-bold text-slate-300 flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <FlipHorizontal className="w-3.5 h-3.5" />
                      <span>Flip H</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => updateClipAttribute('flipV', !selectedClip?.flipV)}
                      className="p-2 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl text-xs font-bold text-slate-300 flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <FlipVertical className="w-3.5 h-3.5" />
                      <span>Flip V</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 6: TRANSITIONS */}
            {activeTab === 'transitions' && (
              <div className="space-y-3.5">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-300">
                  Clip Transitions & Junctions
                </h3>
                <p className="text-[11px] text-slate-400">
                  Select a transition effect to animate entry into the selected clip:
                </p>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    { id: 'none', label: 'Cut (None)', desc: 'Immediate clip cut' },
                    { id: 'dissolve', label: 'Dissolve / Fade', desc: 'Smooth cross-fade' },
                    { id: 'slide-left', label: 'Slide Left', desc: 'Reels horizontal wipe' },
                    { id: 'slide-right', label: 'Slide Right', desc: 'Reverse horizontal wipe' },
                    { id: 'zoom-in', label: 'Zoom In', desc: 'Dynamic scale burst' },
                    { id: 'flash', label: 'White Flash', desc: 'High energy transition' }
                  ].map(trans => (
                    <button
                      key={trans.id}
                      type="button"
                      onClick={() => updateClipAttribute('transition', trans.id as ClipTransitionType)}
                      className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                        selectedClip?.transition === trans.id
                          ? 'bg-rose-600/20 border-rose-500 text-white shadow-xs'
                          : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="font-bold">{trans.label}</div>
                      <div className="text-[10px] text-slate-400">{trans.desc}</div>
                    </button>
                  ))}
                </div>

                <div className="pt-2 border-t border-slate-800">
                  <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                    <span>Transition Duration</span>
                    <span className="font-mono">{selectedClip?.transitionDuration ?? 0.5}s</span>
                  </div>
                  <input
                    type="range"
                    min="0.2"
                    max="1.5"
                    step="0.1"
                    value={selectedClip?.transitionDuration ?? 0.5}
                    onChange={(e) => updateClipAttribute('transitionDuration', parseFloat(e.target.value))}
                    className="w-full accent-rose-500 cursor-pointer"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* CENTER LIVE CANVAS PREVIEW */}
        <div className="lg:col-span-8 xl:col-span-8 p-4 flex flex-col items-center justify-center bg-slate-950/40 relative">
          {/* Viewport Frame Container */}
          <div 
            className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-800 bg-black flex items-center justify-center"
            style={{
              width: aspectRatio === '9:16' ? '280px' : aspectRatio === '1:1' ? '380px' : aspectRatio === '4:5' ? '320px' : '480px',
              height: aspectRatio === '9:16' ? '490px' : aspectRatio === '1:1' ? '380px' : aspectRatio === '4:5' ? '400px' : '270px',
              maxWidth: '100%'
            }}
          >
            {/* The HTML5 Canvas */}
            <canvas
              ref={canvasRef}
              className="w-full h-full object-contain cursor-pointer"
              onClick={togglePlayPause}
            />

            {/* Play/Pause Center Indicator on hover or paused */}
            {!isPlaying && (
              <div 
                onClick={togglePlayPause}
                className="absolute inset-0 bg-black/30 backdrop-blur-[1px] flex items-center justify-center cursor-pointer transition-opacity"
              >
                <div className="w-14 h-14 rounded-full bg-rose-600/90 text-white flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-all">
                  <Play className="w-6 h-6 ml-0.5" />
                </div>
              </div>
            )}

            {/* Bottom mini scrubber overlay */}
            <div className="absolute bottom-2 inset-x-3 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl flex items-center justify-between text-[11px] font-mono text-white">
              <span>{formatTime(currentTime)}</span>
              <div className="flex-1 mx-3 h-1 bg-white/20 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-rose-500 rounded-full" 
                  style={{ width: `${(currentTime / Math.max(0.1, totalDuration)) * 100}%` }}
                />
              </div>
              <span>{formatTime(totalDuration)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. MULTI-TRACK INTERACTIVE TIMELINE */}
      <div className="border-t border-slate-800 bg-slate-950 p-4 space-y-3">
        {/* Timeline Control Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={togglePlayPause}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{isPlaying ? 'Pause' : 'Play'}</span>
            </button>

            <button
              type="button"
              onClick={() => setCurrentTime(0)}
              className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl text-xs cursor-pointer transition-colors"
              title="Jump to Start"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => setIsLooping(!isLooping)}
              className={`p-2 rounded-xl text-xs cursor-pointer transition-colors ${
                isLooping ? 'bg-rose-600/20 text-rose-400 border border-rose-500/40' : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
              title="Toggle Loop"
            >
              <Repeat className="w-4 h-4" />
            </button>

            <div className="h-4 w-px bg-slate-800 mx-1" />

            {/* Split Clip Button */}
            <button
              type="button"
              onClick={handleSplitClipAtPlayhead}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
              title="Split selected clip at current playhead position"
            >
              <Scissors className="w-3.5 h-3.5 text-amber-400" />
              <span>Split Clip</span>
            </button>

            {/* Duplicate Clip Button */}
            {selectedClip && (
              <button
                type="button"
                onClick={() => handleDuplicateClip(selectedClip)}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                title="Duplicate current clip"
              >
                <Copy className="w-3.5 h-3.5 text-blue-400" />
                <span>Duplicate</span>
              </button>
            )}

            {/* Delete Clip Button */}
            {selectedClip && clips.length > 1 && (
              <button
                type="button"
                onClick={() => handleDeleteClip(selectedClip.id)}
                className="px-3 py-1.5 bg-slate-900 hover:bg-red-950/40 text-slate-300 hover:text-red-400 border border-slate-800 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                title="Delete current clip"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            )}
          </div>

          {/* Quick Playback Speed */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span>Speed:</span>
            {[0.5, 1, 1.5, 2].map(speed => (
              <button
                key={speed}
                type="button"
                onClick={() => setPlaybackSpeed(speed)}
                className={`px-2 py-0.5 rounded-md font-mono text-[11px] font-bold cursor-pointer ${
                  playbackSpeed === speed ? 'bg-rose-600 text-white' : 'hover:bg-slate-800 text-slate-400'
                }`}
              >
                {speed}x
              </button>
            ))}
          </div>
        </div>

        {/* Timeline Tracks Box */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 space-y-2.5 overflow-x-auto">
          {/* Time Scrubber Slider */}
          <div className="relative pt-1">
            <input
              type="range"
              min="0"
              max={totalDuration || 1}
              step="0.05"
              value={currentTime}
              onChange={(e) => setCurrentTime(parseFloat(e.target.value))}
              className="w-full accent-rose-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
            />
          </div>

          {/* TRACK 1: TEXT & STICKER OVERLAYS */}
          <div className="space-y-1">
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1">
              <Type className="w-3 h-3 text-purple-400" />
              <span>Text & Stickers Track</span>
            </div>
            <div className="h-8 bg-slate-950/80 rounded-xl border border-slate-800/80 relative overflow-hidden flex items-center px-1">
              {textOverlays.map(txt => {
                const left = (txt.startTime / Math.max(0.1, totalDuration)) * 100;
                const width = (txt.duration / Math.max(0.1, totalDuration)) * 100;
                const isSelected = selectedTextId === txt.id;

                return (
                  <div
                    key={txt.id}
                    onClick={() => { setSelectedTextId(txt.id); setActiveTab('text'); }}
                    className={`absolute h-6 rounded-lg px-2 flex items-center text-[10px] font-bold truncate cursor-pointer transition-all ${
                      isSelected ? 'bg-purple-600 text-white ring-1 ring-white' : 'bg-purple-900/60 text-purple-200 border border-purple-700/50'
                    }`}
                    style={{ left: `${left}%`, width: `${Math.max(4, width)}%` }}
                  >
                    <span>{txt.text}</span>
                  </div>
                );
              })}

              {stickers.map(stk => {
                const left = (stk.startTime / Math.max(0.1, totalDuration)) * 100;
                const width = (stk.duration / Math.max(0.1, totalDuration)) * 100;
                return (
                  <div
                    key={stk.id}
                    onClick={() => { setSelectedStickerId(stk.id); setActiveTab('stickers'); }}
                    className="absolute h-6 rounded-lg px-2 flex items-center text-[10px] font-bold bg-amber-600/60 text-amber-200 border border-amber-500/50 truncate cursor-pointer"
                    style={{ left: `${left}%`, width: `${Math.max(3, width)}%` }}
                  >
                    <span>{stk.content}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* TRACK 2: MAIN MEDIA CLIPS TRACK */}
          <div className="space-y-1">
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1">
              <Film className="w-3 h-3 text-rose-400" />
              <span>Clips & Video Sequence Track</span>
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {clips.map((clip, index) => {
                const isSelected = selectedClipId === clip.id;
                return (
                  <div
                    key={clip.id}
                    onClick={() => setSelectedClipId(clip.id)}
                    className={`group relative shrink-0 h-20 rounded-xl overflow-hidden border transition-all cursor-pointer flex flex-col justify-between p-1.5 ${
                      isSelected
                        ? 'border-rose-500 ring-2 ring-rose-500/40 bg-slate-800'
                        : 'border-slate-800 bg-slate-900/90 hover:border-slate-700'
                    }`}
                    style={{ width: `${Math.max(110, clip.duration * 38)}px` }}
                  >
                    {/* Background Preview */}
                    <img
                      src={clip.url}
                      alt={clip.name}
                      className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-50 transition-opacity"
                    />

                    {/* Clip Top Bar */}
                    <div className="relative z-10 flex items-center justify-between text-[10px] font-bold text-white">
                      <span className="truncate max-w-[80px] drop-shadow-md">{clip.name}</span>
                      <span className="px-1.5 py-0.2 bg-black/60 rounded text-[9px] font-mono text-rose-300">
                        {clip.duration}s
                      </span>
                    </div>

                    {/* Trim and Reorder Buttons */}
                    <div className="relative z-10 flex items-center justify-between text-[10px] text-slate-300 pt-2">
                      <div className="flex items-center gap-1">
                        {index > 0 && (
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); handleMoveClip(index, 'left'); }}
                            className="p-0.5 hover:text-white"
                            title="Move clip left"
                          >
                            <ChevronLeft className="w-3 h-3" />
                          </button>
                        )}
                        {index < clips.length - 1 && (
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); handleMoveClip(index, 'right'); }}
                            className="p-0.5 hover:text-white"
                            title="Move clip right"
                          >
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>

                      {/* Duration Adjuster */}
                      <div className="flex items-center gap-1 bg-black/60 px-1 py-0.5 rounded">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            updateClipAttribute('duration', Math.max(0.5, Number((clip.duration - 0.5).toFixed(1))));
                          }}
                          className="hover:text-rose-400 font-bold px-1"
                        >
                          -
                        </button>
                        <span className="font-mono text-[9px]">{clip.duration}s</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            updateClipAttribute('duration', Number((clip.duration + 0.5).toFixed(1)));
                          }}
                          className="hover:text-rose-400 font-bold px-1"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* TRACK 3: AUDIO SOUNDTRACK */}
          <div className="space-y-1">
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1">
              <Music className="w-3 h-3 text-emerald-400" />
              <span>Audio & Soundtrack Track</span>
            </div>
            <div className="h-8 bg-slate-950/80 rounded-xl border border-slate-800/80 relative overflow-hidden flex items-center px-3 text-xs font-bold text-emerald-400">
              {audioTracks.length > 0 ? (
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                    <span>{audioTracks[0].name}</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">
                    Vol: {Math.round((audioTracks[0].volume || 0.8) * masterVolume * 100)}%
                  </span>
                </div>
              ) : (
                <span className="text-slate-500 text-[11px]">No active audio track</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 4. REAL EXPORT MODAL */}
      {isExportModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-5 text-left shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-white">Export & Download Reel</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Render canvas composite into a video file or cover snapshot
                </p>
              </div>
              <span className="px-2.5 py-1 bg-rose-600/20 text-rose-300 border border-rose-500/30 rounded-lg text-xs font-bold">
                {aspectRatio}
              </span>
            </div>

            {/* Quality & Resolution */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 block">Resolution & Quality</label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setExportQuality('1080p')}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                    exportQuality === '1080p'
                      ? 'bg-rose-600/20 border-rose-500 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="font-bold">1080p Full HD</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">High bitrate for Reels</div>
                </button>
                <button
                  type="button"
                  onClick={() => setExportQuality('720p')}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                    exportQuality === '720p'
                      ? 'bg-rose-600/20 border-rose-500 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="font-bold">720p Standard HD</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Faster export speed</div>
                </button>
              </div>
            </div>

            {/* Progress Bar during render */}
            {isExporting && (
              <div className="space-y-2 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-rose-400">Rendering Video Frames...</span>
                  <span className="font-mono text-white">{exportProgress}%</span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-rose-500 to-amber-500 transition-all duration-150"
                    style={{ width: `${exportProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                disabled={isExporting}
                onClick={() => setIsExportModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white rounded-xl transition-colors cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                disabled={isExporting}
                onClick={handleExportReel}
                className="px-5 py-2.5 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white text-xs font-extrabold rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>{isExporting ? 'Exporting...' : 'Start Render & Download'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
