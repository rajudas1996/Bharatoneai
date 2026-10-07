import React, { useState, useRef, useEffect } from 'react';
import { 
  SlidersHorizontal, 
  RotateCw, 
  RotateCcw as RotateCcwIcon,
  FlipHorizontal, 
  FlipVertical, 
  Download, 
  RotateCcw, 
  Upload, 
  Sparkles, 
  Wand2, 
  Sun, 
  Contrast, 
  Droplets, 
  Eye, 
  Check, 
  Undo2,
  Redo2,
  Image as ImageIcon,
  Crop,
  Type,
  Layers,
  Palette,
  Maximize2,
  Copy,
  ArrowLeft,
  X,
  Sliders
} from 'lucide-react';
import { safeStorage } from '../../utils/safeStorage';

interface FilterPreset {
  id: string;
  name: string;
  brightness: number;
  contrast: number;
  saturation: number;
  sepia: number;
  grayscale: number;
  hue: number;
  temperature?: number;
  vignette?: number;
}

const PRESET_FILTERS: FilterPreset[] = [
  { id: 'normal', name: 'Original', brightness: 100, contrast: 100, saturation: 100, sepia: 0, grayscale: 0, hue: 0, temperature: 0, vignette: 0 },
  { id: 'vivid_india', name: 'Vivid Bharat', brightness: 110, contrast: 125, saturation: 145, sepia: 5, grayscale: 0, hue: 8, temperature: 15, vignette: 10 },
  { id: 'golden_sunset', name: 'Golden Hour', brightness: 106, contrast: 118, saturation: 135, sepia: 25, grayscale: 0, hue: 15, temperature: 35, vignette: 20 },
  { id: 'cyberpunk', name: 'Cyber Neon', brightness: 115, contrast: 135, saturation: 165, sepia: 0, grayscale: 0, hue: 285, temperature: -20, vignette: 25 },
  { id: 'noir', name: 'Film Noir B&W', brightness: 105, contrast: 150, saturation: 0, sepia: 0, grayscale: 100, hue: 0, temperature: 0, vignette: 30 },
  { id: 'vintage', name: 'Vintage 1970s', brightness: 96, contrast: 112, saturation: 85, sepia: 40, grayscale: 0, hue: 350, temperature: 20, vignette: 25 },
  { id: 'emerald', name: 'Emerald Pop', brightness: 105, contrast: 120, saturation: 140, sepia: 0, grayscale: 0, hue: 90, temperature: -10, vignette: 15 },
  { id: 'nordic_cool', name: 'Nordic Cool', brightness: 104, contrast: 115, saturation: 90, sepia: 0, grayscale: 0, hue: 200, temperature: -35, vignette: 10 },
  { id: 'dramatic_cinema', name: 'Cinematic Teal', brightness: 100, contrast: 130, saturation: 120, sepia: 10, grayscale: 0, hue: 180, temperature: -15, vignette: 35 },
  { id: 'pastel_dream', name: 'Pastel Dream', brightness: 115, contrast: 90, saturation: 110, sepia: 10, grayscale: 0, hue: 340, temperature: 10, vignette: 0 }
];

const AI_STYLE_PROMPTS = [
  { label: '✨ Golden Sunset Glow', desc: 'Warm ambient glow with soft shadows', preset: 'golden_sunset' },
  { label: '⚡ Cyberpunk Neon', desc: 'Vivid magenta & cyan futuristic punch', preset: 'cyberpunk' },
  { label: '🎬 Cinematic High Contrast', desc: 'Blockbuster dramatic shadows', preset: 'dramatic_cinema' },
  { label: '🎞️ Classic Monochrome', desc: 'Timeless high-contrast black & white', preset: 'noir' },
  { label: '🌿 Lush Emerald Vibrance', desc: 'Punchy greens & clean highlights', preset: 'emerald' },
  { label: '📷 1970s Film Warmth', desc: 'Nostalgic analog film aesthetic', preset: 'vintage' }
];

interface EditState {
  brightness: number;
  contrast: number;
  saturation: number;
  exposure: number;
  temperature: number;
  sepia: number;
  grayscale: number;
  blur: number;
  hue: number;
  vignette: number;
  rotation: number;
  flipH: boolean;
  flipV: boolean;
  activePreset: string;
  overlayText: string;
  textPosition: 'top' | 'center' | 'bottom';
  textSize: 'small' | 'medium' | 'large';
  textColor: string;
}

const DEFAULT_EDIT_STATE: EditState = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
  exposure: 0,
  temperature: 0,
  sepia: 0,
  grayscale: 0,
  blur: 0,
  hue: 0,
  vignette: 0,
  rotation: 0,
  flipH: false,
  flipV: false,
  activePreset: 'normal',
  overlayText: '',
  textPosition: 'bottom',
  textSize: 'medium',
  textColor: '#ffffff',
};

interface ImageEditorToolProps {
  initialImage?: string | null;
  onNavigateToCreator?: () => void;
  onNavigateTab?: (tab: string) => void;
}

export const ImageEditorTool: React.FC<ImageEditorToolProps> = ({
  initialImage,
  onNavigateToCreator,
  onNavigateTab,
}) => {
  // Current edit parameters
  const [editState, setEditState] = useState<EditState>(DEFAULT_EDIT_STATE);

  // History stack for Undo / Redo
  const [history, setHistory] = useState<EditState[]>([DEFAULT_EDIT_STATE]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Image source & original
  const [imageSrc, setImageSrc] = useState<string>('');
  const [originalImageSrc, setOriginalImageSrc] = useState<string>('');

  // UI state
  const [activeTab, setActiveTab] = useState<'presets' | 'adjust' | 'crop' | 'text' | 'ai_magic'>('presets');
  const [isComparing, setIsComparing] = useState(false);
  const [exportFormat, setExportFormat] = useState<'png' | 'jpeg' | 'webp'>('png');
  const [isProcessingAi, setIsProcessingAi] = useState(false);
  const [aiCustomPrompt, setAiCustomPrompt] = useState('');
  const [copied, setCopied] = useState(false);

  // Crop Aspect Ratio
  const [cropAspect, setCropAspect] = useState<'original' | '1:1' | '16:9' | '9:16' | '4:3'>('original');

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Helper to push history
  const pushHistory = (newState: EditState) => {
    const updated = history.slice(0, historyIndex + 1);
    updated.push(newState);
    setHistory(updated);
    setHistoryIndex(updated.length - 1);
    setEditState(newState);
  };

  const updateState = (partial: Partial<EditState>) => {
    const next = { ...editState, ...partial };
    pushHistory(next);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      setHistoryIndex(prevIndex);
      setEditState(history[prevIndex]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      setHistoryIndex(nextIndex);
      setEditState(history[nextIndex]);
    }
  };

  // Initialize image: prop > localStorage > generated studio sample
  useEffect(() => {
    if (initialImage) {
      setImageSrc(initialImage);
      setOriginalImageSrc(initialImage);
      return;
    }

    const saved = safeStorage.getItem('bharat1_active_editor_image');
    if (saved) {
      setImageSrc(saved);
      setOriginalImageSrc(saved);
      return;
    }

    // Default sample asset
    const canvas = document.createElement('canvas');
    canvas.width = 850;
    canvas.height = 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const grad = ctx.createLinearGradient(0, 0, 850, 480);
      grad.addColorStop(0, '#0f172a');
      grad.addColorStop(0.4, '#1e1b4b');
      grad.addColorStop(0.75, '#4338ca');
      grad.addColorStop(1, '#e11d48');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 850, 480);

      // Glowing Sun
      const sunGrad = ctx.createRadialGradient(425, 240, 0, 425, 240, 190);
      sunGrad.addColorStop(0, '#fef08a');
      sunGrad.addColorStop(0.35, '#f97316');
      sunGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = sunGrad;
      ctx.beginPath();
      ctx.arc(425, 240, 190, 0, Math.PI * 2);
      ctx.fill();

      // Skyline Silhouettes
      ctx.fillStyle = '#090d16';
      ctx.beginPath();
      ctx.moveTo(0, 480);
      ctx.lineTo(0, 360);
      ctx.lineTo(160, 310);
      ctx.lineTo(280, 390);
      ctx.lineTo(425, 240);
      ctx.lineTo(580, 390);
      ctx.lineTo(700, 310);
      ctx.lineTo(850, 370);
      ctx.lineTo(850, 480);
      ctx.closePath();
      ctx.fill();

      // Overlay text banner
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 24px Inter, system-ui, sans-serif';
      ctx.fillText('Bharat 1 AI Studio • Photographic Canvas', 40, 75);
      ctx.font = '14px Inter, system-ui, sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
      ctx.fillText('Ready for filters, color grading, geometric transforms, and crop export', 40, 102);

      const sampleUrl = canvas.toDataURL('image/png');
      setImageSrc(sampleUrl);
      setOriginalImageSrc(sampleUrl);
    }
  }, [initialImage]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const url = event.target.result as string;
          setImageSrc(url);
          setOriginalImageSrc(url);
          safeStorage.setItem('bharat1_active_editor_image', url);
          handleResetAll();
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleApplyPreset = (preset: FilterPreset) => {
    updateState({
      activePreset: preset.id,
      brightness: preset.brightness,
      contrast: preset.contrast,
      saturation: preset.saturation,
      sepia: preset.sepia,
      grayscale: preset.grayscale,
      hue: preset.hue,
      temperature: preset.temperature || 0,
      vignette: preset.vignette || 0,
    });
  };

  const handleResetAll = () => {
    setEditState(DEFAULT_EDIT_STATE);
    setHistory([DEFAULT_EDIT_STATE]);
    setHistoryIndex(0);
    setCropAspect('original');
  };

  const handleAutoEnhance = () => {
    updateState({
      brightness: 108,
      contrast: 118,
      saturation: 125,
      temperature: 10,
      vignette: 15,
      activePreset: 'auto_ai',
    });
  };

  // AI Prompt Transformation
  const handleApplyAiPrompt = (promptText: string) => {
    setIsProcessingAi(true);
    setTimeout(() => {
      const lower = promptText.toLowerCase();
      if (lower.includes('cyber') || lower.includes('neon')) {
        handleApplyPreset(PRESET_FILTERS.find((p) => p.id === 'cyberpunk') || PRESET_FILTERS[3]);
      } else if (lower.includes('warm') || lower.includes('sunset') || lower.includes('golden')) {
        handleApplyPreset(PRESET_FILTERS.find((p) => p.id === 'golden_sunset') || PRESET_FILTERS[2]);
      } else if (lower.includes('black') || lower.includes('noir') || lower.includes('monochrome')) {
        handleApplyPreset(PRESET_FILTERS.find((p) => p.id === 'noir') || PRESET_FILTERS[4]);
      } else if (lower.includes('vintage') || lower.includes('retro')) {
        handleApplyPreset(PRESET_FILTERS.find((p) => p.id === 'vintage') || PRESET_FILTERS[5]);
      } else if (lower.includes('emerald') || lower.includes('green')) {
        handleApplyPreset(PRESET_FILTERS.find((p) => p.id === 'emerald') || PRESET_FILTERS[6]);
      } else {
        // Dramatic cinema boost
        handleApplyPreset(PRESET_FILTERS.find((p) => p.id === 'dramatic_cinema') || PRESET_FILTERS[8]);
      }
      setIsProcessingAi(false);
    }, 400);
  };

  // Apply Crop Aspect Ratio directly on canvas
  const handleApplyCrop = (aspect: 'original' | '1:1' | '16:9' | '9:16' | '4:3') => {
    setCropAspect(aspect);
    if (!originalImageSrc || aspect === 'original') {
      setImageSrc(originalImageSrc);
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      let targetRatio = 1;
      if (aspect === '1:1') targetRatio = 1;
      else if (aspect === '16:9') targetRatio = 16 / 9;
      else if (aspect === '9:16') targetRatio = 9 / 16;
      else if (aspect === '4:3') targetRatio = 4 / 3;

      let cropW = img.width;
      let cropH = img.height;
      const currentRatio = img.width / img.height;

      if (currentRatio > targetRatio) {
        cropW = img.height * targetRatio;
      } else {
        cropH = img.width / targetRatio;
      }

      const startX = (img.width - cropW) / 2;
      const startY = (img.height - cropH) / 2;

      const canvas = document.createElement('canvas');
      canvas.width = cropW;
      canvas.height = cropH;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, startX, startY, cropW, cropH, 0, 0, cropW, cropH);
        setImageSrc(canvas.toDataURL('image/png'));
      }
    };
    img.src = originalImageSrc;
  };

  // Computed CSS filter string
  const effectiveBrightness = editState.brightness + editState.exposure;
  const filterString = isComparing
    ? 'none'
    : `brightness(${effectiveBrightness}%) contrast(${editState.contrast}%) saturate(${editState.saturation}%) sepia(${editState.sepia}%) grayscale(${editState.grayscale}%) blur(${editState.blur}px) hue-rotate(${editState.hue}deg)`;

  // Export processed image via canvas
  const handleDownload = () => {
    if (!imageSrc) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const is90or270 = editState.rotation % 180 !== 0;
      canvas.width = is90or270 ? img.height : img.width;
      canvas.height = is90or270 ? img.width : img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.save();
      ctx.filter = `brightness(${effectiveBrightness}%) contrast(${editState.contrast}%) saturate(${editState.saturation}%) sepia(${editState.sepia}%) grayscale(${editState.grayscale}%) blur(${editState.blur}px) hue-rotate(${editState.hue}deg)`;
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((editState.rotation * Math.PI) / 180);
      ctx.scale(editState.flipH ? -1 : 1, editState.flipV ? -1 : 1);
      ctx.drawImage(img, -img.width / 2, -img.height / 2);
      ctx.restore();

      // Vignette effect overlay
      if (editState.vignette > 0) {
        const rad = Math.max(canvas.width, canvas.height) * 0.7;
        const vGrad = ctx.createRadialGradient(
          canvas.width / 2,
          canvas.height / 2,
          rad * 0.3,
          canvas.width / 2,
          canvas.height / 2,
          rad
        );
        vGrad.addColorStop(0, 'rgba(0,0,0,0)');
        vGrad.addColorStop(1, `rgba(0,0,0,${(editState.vignette / 100) * 0.85})`);
        ctx.fillStyle = vGrad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      // Text Overlay if present
      if (editState.overlayText.trim()) {
        ctx.save();
        let fontSize = Math.max(18, Math.floor(canvas.width * 0.035));
        if (editState.textSize === 'small') fontSize = Math.floor(fontSize * 0.7);
        if (editState.textSize === 'large') fontSize = Math.floor(fontSize * 1.35);

        ctx.font = `bold ${fontSize}px Inter, system-ui, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        let posY = canvas.height - fontSize * 2;
        if (editState.textPosition === 'top') posY = fontSize * 2;
        if (editState.textPosition === 'center') posY = canvas.height / 2;

        const posX = canvas.width / 2;
        const metrics = ctx.measureText(editState.overlayText);
        const padding = fontSize * 0.6;

        // Dark pill background for text readability
        ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
        if (typeof (ctx as any).roundRect === 'function') {
          (ctx as any).roundRect(
            posX - metrics.width / 2 - padding,
            posY - fontSize * 0.7,
            metrics.width + padding * 2,
            fontSize * 1.4,
            8
          );
        } else {
          ctx.fillRect(
            posX - metrics.width / 2 - padding,
            posY - fontSize * 0.7,
            metrics.width + padding * 2,
            fontSize * 1.4
          );
        }
        ctx.fill();

        ctx.fillStyle = editState.textColor;
        ctx.fillText(editState.overlayText, posX, posY);
        ctx.restore();
      }

      const mimeType = exportFormat === 'jpeg' ? 'image/jpeg' : exportFormat === 'webp' ? 'image/webp' : 'image/png';
      const link = document.createElement('a');
      link.download = `bharat1-edited-${Date.now()}.${exportFormat}`;
      link.href = canvas.toDataURL(mimeType, 0.95);
      link.click();
    };
    img.src = imageSrc;
  };

  const handleCopyImage = () => {
    if (!imageSrc) return;
    navigator.clipboard.writeText(imageSrc);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
            <SlidersHorizontal className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <span>Image Edit & Enhance</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase">
                Studio Suite
              </span>
            </h1>
            <p className="text-xs text-slate-500">
              Apply real-time color grading, AI auto-enhance, crop ratios, text overlays, and geometric transforms
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap self-end md:self-auto">
          {onNavigateToCreator && (
            <button
              onClick={onNavigateToCreator}
              className="px-3.5 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Create in Image Creator</span>
            </button>
          )}

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Photo</span>
          </button>

          <button
            onClick={handleAutoEnhance}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-98"
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>AI Auto-Enhance</span>
          </button>

          <button
            onClick={handleDownload}
            className="px-4 py-2 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Image</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Controls Left, Viewport Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Editor Controls & Tabs (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Sub-Navigation Tabs */}
          <div className="bg-slate-100 p-1 rounded-2xl flex items-center gap-1 border border-slate-200 text-xs font-bold">
            <button
              onClick={() => setActiveTab('presets')}
              className={`flex-1 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'presets' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Presets
            </button>
            <button
              onClick={() => setActiveTab('adjust')}
              className={`flex-1 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'adjust' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Adjust
            </button>
            <button
              onClick={() => setActiveTab('crop')}
              className={`flex-1 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'crop' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Crop & Rotate
            </button>
            <button
              onClick={() => setActiveTab('text')}
              className={`flex-1 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'text' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Overlay Text
            </button>
            <button
              onClick={() => setActiveTab('ai_magic')}
              className={`flex-1 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'ai_magic' ? 'bg-white text-emerald-800 shadow-2xs font-extrabold' : 'text-emerald-700 hover:text-emerald-900'
              }`}
            >
              AI Magic
            </button>
          </div>

          {/* TAB 1: PRESETS */}
          {activeTab === 'presets' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Palette className="w-4 h-4 text-emerald-600" />
                  <span>Cinematic Filter Presets</span>
                </label>
                <button
                  onClick={handleResetAll}
                  className="text-[11px] text-red-600 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset All</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {PRESET_FILTERS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => handleApplyPreset(preset)}
                    className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                      editState.activePreset === preset.id
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-2xs ring-2 ring-emerald-600/20 font-bold'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <div className="text-xs truncate">{preset.name}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      B:{preset.brightness}% C:{preset.contrast}% S:{preset.saturation}%
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: ADJUSTMENTS (Light & Color Sliders) */}
          {activeTab === 'adjust' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4 max-h-[520px] overflow-y-auto pr-1">
              <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-800">Tone & Color Adjustments</span>
                <button
                  onClick={handleResetAll}
                  className="text-[11px] text-slate-400 hover:text-red-600 flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              </div>

              {/* Brightness */}
              <div>
                <div className="flex items-center justify-between text-xs text-slate-700 mb-1">
                  <span className="font-medium flex items-center gap-1.5">
                    <Sun className="w-3.5 h-3.5 text-amber-500" /> Brightness
                  </span>
                  <span className="font-mono text-slate-500">{editState.brightness}%</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="180"
                  value={editState.brightness}
                  onChange={(e) => updateState({ brightness: parseInt(e.target.value) })}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
              </div>

              {/* Contrast */}
              <div>
                <div className="flex items-center justify-between text-xs text-slate-700 mb-1">
                  <span className="font-medium flex items-center gap-1.5">
                    <Contrast className="w-3.5 h-3.5 text-slate-600" /> Contrast
                  </span>
                  <span className="font-mono text-slate-500">{editState.contrast}%</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="200"
                  value={editState.contrast}
                  onChange={(e) => updateState({ contrast: parseInt(e.target.value) })}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
              </div>

              {/* Exposure */}
              <div>
                <div className="flex items-center justify-between text-xs text-slate-700 mb-1">
                  <span className="font-medium">Exposure Compensation</span>
                  <span className="font-mono text-slate-500">{editState.exposure > 0 ? `+${editState.exposure}` : editState.exposure}%</span>
                </div>
                <input
                  type="range"
                  min="-60"
                  max="60"
                  value={editState.exposure}
                  onChange={(e) => updateState({ exposure: parseInt(e.target.value) })}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
              </div>

              {/* Saturation */}
              <div>
                <div className="flex items-center justify-between text-xs text-slate-700 mb-1">
                  <span className="font-medium flex items-center gap-1.5">
                    <Droplets className="w-3.5 h-3.5 text-blue-500" /> Saturation
                  </span>
                  <span className="font-mono text-slate-500">{editState.saturation}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="250"
                  value={editState.saturation}
                  onChange={(e) => updateState({ saturation: parseInt(e.target.value) })}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
              </div>

              {/* Hue Shift */}
              <div>
                <div className="flex items-center justify-between text-xs text-slate-700 mb-1">
                  <span className="font-medium">Hue Shift</span>
                  <span className="font-mono text-slate-500">{editState.hue}°</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={editState.hue}
                  onChange={(e) => updateState({ hue: parseInt(e.target.value) })}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
              </div>

              {/* Vignette */}
              <div>
                <div className="flex items-center justify-between text-xs text-slate-700 mb-1">
                  <span className="font-medium">Cinematic Vignette</span>
                  <span className="font-mono text-slate-500">{editState.vignette}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="80"
                  value={editState.vignette}
                  onChange={(e) => updateState({ vignette: parseInt(e.target.value) })}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
              </div>

              {/* Grayscale */}
              <div>
                <div className="flex items-center justify-between text-xs text-slate-700 mb-1">
                  <span className="font-medium">Grayscale</span>
                  <span className="font-mono text-slate-500">{editState.grayscale}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={editState.grayscale}
                  onChange={(e) => updateState({ grayscale: parseInt(e.target.value) })}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
              </div>

              {/* Sepia */}
              <div>
                <div className="flex items-center justify-between text-xs text-slate-700 mb-1">
                  <span className="font-medium">Sepia Tone</span>
                  <span className="font-mono text-slate-500">{editState.sepia}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={editState.sepia}
                  onChange={(e) => updateState({ sepia: parseInt(e.target.value) })}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
              </div>

              {/* Blur */}
              <div>
                <div className="flex items-center justify-between text-xs text-slate-700 mb-1">
                  <span className="font-medium">Soft Blur</span>
                  <span className="font-mono text-slate-500">{editState.blur}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="15"
                  value={editState.blur}
                  onChange={(e) => updateState({ blur: parseInt(e.target.value) })}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* TAB 3: CROP & ROTATE */}
          {activeTab === 'crop' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mb-2">
                  <Crop className="w-4 h-4 text-emerald-600" />
                  <span>Aspect Ratio Crop</span>
                </label>
                <div className="grid grid-cols-5 gap-1.5">
                  {(['original', '1:1', '16:9', '9:16', '4:3'] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => handleApplyCrop(r)}
                      className={`py-2 px-1 rounded-xl text-[11px] font-bold border transition-all text-center capitalize cursor-pointer ${
                        cropAspect === r
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mb-2">
                  <RotateCw className="w-4 h-4 text-emerald-600" />
                  <span>Geometric Orientation</span>
                </label>
                <div className="grid grid-cols-4 gap-2">
                  <button
                    onClick={() => updateState({ rotation: (editState.rotation + 90) % 360 })}
                    className="p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer"
                  >
                    <RotateCw className="w-4 h-4 text-emerald-600" />
                    <span>Rot 90°</span>
                  </button>

                  <button
                    onClick={() => updateState({ rotation: (editState.rotation - 90 + 360) % 360 })}
                    className="p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer"
                  >
                    <RotateCcwIcon className="w-4 h-4 text-emerald-600" />
                    <span>Rot -90°</span>
                  </button>

                  <button
                    onClick={() => updateState({ flipH: !editState.flipH })}
                    className={`p-2.5 border rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer ${
                      editState.flipH
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                    }`}
                  >
                    <FlipHorizontal className="w-4 h-4" />
                    <span>Flip H</span>
                  </button>

                  <button
                    onClick={() => updateState({ flipV: !editState.flipV })}
                    className={`p-2.5 border rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer ${
                      editState.flipV
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                    }`}
                  >
                    <FlipVertical className="w-4 h-4" />
                    <span>Flip V</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: TEXT OVERLAY */}
          {activeTab === 'text' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Type className="w-4 h-4 text-emerald-600" />
                <span>Text Overlay / Watermark</span>
              </label>

              <div>
                <input
                  type="text"
                  value={editState.overlayText}
                  onChange={(e) => updateState({ overlayText: e.target.value })}
                  placeholder="Enter caption or studio watermark..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:border-emerald-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Position</label>
                  <div className="grid grid-cols-3 gap-1">
                    {(['top', 'center', 'bottom'] as const).map((pos) => (
                      <button
                        key={pos}
                        type="button"
                        onClick={() => updateState({ textPosition: pos })}
                        className={`py-1 text-[11px] font-bold rounded-lg border capitalize cursor-pointer ${
                          editState.textPosition === pos
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {pos}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Font Size</label>
                  <div className="grid grid-cols-3 gap-1">
                    {(['small', 'medium', 'large'] as const).map((sz) => (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => updateState({ textSize: sz })}
                        className={`py-1 text-[11px] font-bold rounded-lg border capitalize cursor-pointer ${
                          editState.textSize === sz
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Text Color</label>
                <div className="flex items-center gap-2">
                  {['#ffffff', '#facc15', '#38bdf8', '#f43f5e', '#10b981', '#000000'].map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => updateState({ textColor: color })}
                      style={{ backgroundColor: color }}
                      className={`w-6 h-6 rounded-full border-2 transition-all cursor-pointer ${
                        editState.textColor === color ? 'border-emerald-600 ring-2 ring-emerald-400' : 'border-slate-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: AI MAGIC EDIT */}
          {activeTab === 'ai_magic' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Wand2 className="w-4 h-4 text-emerald-600" />
                <span>AI Prompt Transform</span>
              </label>

              <div className="space-y-2">
                <input
                  type="text"
                  value={aiCustomPrompt}
                  onChange={(e) => setAiCustomPrompt(e.target.value)}
                  placeholder="e.g. Add warm sunset glow, or cyberpunk neon highlights..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:border-emerald-500 outline-none"
                />
                <button
                  onClick={() => handleApplyAiPrompt(aiCustomPrompt)}
                  disabled={!aiCustomPrompt.trim() || isProcessingAi}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isProcessingAi ? 'Transforming...' : 'Apply AI Transformation'}</span>
                </button>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Quick Style Transfers:
                </span>
                <div className="grid grid-cols-1 gap-1.5">
                  {AI_STYLE_PROMPTS.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleApplyAiPrompt(item.label)}
                      className="text-left px-3 py-2 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 transition-all text-xs cursor-pointer group"
                    >
                      <div className="font-bold text-slate-800 group-hover:text-emerald-800">{item.label}</div>
                      <div className="text-[10px] text-slate-400">{item.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Live Viewport Canvas (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-3">
            {/* Viewport Top Bar */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900">Live Studio Canvas</span>
                <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">
                  {cropAspect.toUpperCase()} • {editState.rotation}°
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                {/* Undo / Redo */}
                <button
                  onClick={handleUndo}
                  disabled={historyIndex <= 0}
                  className="p-1.5 text-slate-500 hover:text-slate-800 disabled:opacity-30 rounded-lg cursor-pointer"
                  title="Undo"
                >
                  <Undo2 className="w-4 h-4" />
                </button>
                <button
                  onClick={handleRedo}
                  disabled={historyIndex >= history.length - 1}
                  className="p-1.5 text-slate-500 hover:text-slate-800 disabled:opacity-30 rounded-lg cursor-pointer"
                  title="Redo"
                >
                  <Redo2 className="w-4 h-4" />
                </button>

                {/* Compare Button */}
                <button
                  onMouseDown={() => setIsComparing(true)}
                  onMouseUp={() => setIsComparing(false)}
                  onTouchStart={() => setIsComparing(true)}
                  onTouchEnd={() => setIsComparing(false)}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-all flex items-center gap-1 cursor-pointer select-none ${
                    isComparing ? 'bg-amber-100 text-amber-900 border-amber-300' : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200'
                  }`}
                  title="Hold mouse down to view original unedited image"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>{isComparing ? 'Viewing Original' : 'Hold to Compare'}</span>
                </button>

                {/* Format selection */}
                <select
                  value={exportFormat}
                  onChange={(e) => setExportFormat(e.target.value as any)}
                  className="text-xs font-bold bg-slate-100 border border-slate-200 rounded-lg px-2 py-1 text-slate-700 outline-none cursor-pointer"
                >
                  <option value="png">PNG</option>
                  <option value="jpeg">JPEG</option>
                  <option value="webp">WebP</option>
                </select>

                <button
                  onClick={handleDownload}
                  className="px-3 py-1 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-lg transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export</span>
                </button>
              </div>
            </div>

            {/* Container for image transform and CSS filters */}
            <div className="relative rounded-2xl overflow-hidden bg-slate-950 flex items-center justify-center min-h-[460px] border border-slate-800 shadow-inner group">
              {imageSrc ? (
                <div
                  className="transition-all duration-150 max-h-[500px] flex items-center justify-center p-4 relative"
                  style={{
                    transform: `rotate(${editState.rotation}deg) scale(${editState.flipH ? -1 : 1}, ${editState.flipV ? -1 : 1})`,
                  }}
                >
                  <img
                    src={imageSrc}
                    alt="Editor preview"
                    className="max-h-[470px] w-auto max-w-full object-contain rounded-lg shadow-2xl transition-all"
                    style={{ filter: filterString }}
                  />

                  {/* Vignette Overlay */}
                  {editState.vignette > 0 && !isComparing && (
                    <div
                      className="absolute inset-4 pointer-events-none rounded-lg"
                      style={{
                        boxShadow: `inset 0 0 ${editState.vignette * 1.5}px ${editState.vignette}px rgba(0,0,0,0.85)`,
                      }}
                    />
                  )}

                  {/* Text Overlay on preview */}
                  {editState.overlayText.trim() && !isComparing && (
                    <div
                      className={`absolute pointer-events-none left-8 right-8 flex justify-center ${
                        editState.textPosition === 'top'
                          ? 'top-8'
                          : editState.textPosition === 'center'
                          ? 'top-1/2 -translate-y-1/2'
                          : 'bottom-8'
                      }`}
                    >
                      <span
                        style={{ color: editState.textColor }}
                        className={`bg-black/60 backdrop-blur-md px-3.5 py-1.5 rounded-xl font-bold tracking-wide shadow-lg border border-white/10 ${
                          editState.textSize === 'small'
                            ? 'text-xs'
                            : editState.textSize === 'large'
                            ? 'text-lg'
                            : 'text-sm'
                        }`}
                      >
                        {editState.overlayText}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-slate-500 text-xs">No image loaded</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
