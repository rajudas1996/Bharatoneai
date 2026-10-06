import React, { useState, useRef, useEffect } from 'react';
import { 
  SlidersHorizontal, 
  RotateCw, 
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
  Image as ImageIcon
} from 'lucide-react';

interface FilterPreset {
  id: string;
  name: string;
  brightness: number;
  contrast: number;
  saturation: number;
  sepia: number;
  grayscale: number;
  hue: number;
}

const PRESET_FILTERS: FilterPreset[] = [
  { id: 'normal', name: 'Original', brightness: 100, contrast: 100, saturation: 100, sepia: 0, grayscale: 0, hue: 0 },
  { id: 'vivid_india', name: 'Vivid Bharat', brightness: 110, contrast: 125, saturation: 145, sepia: 5, grayscale: 0, hue: 10 },
  { id: 'golden_sunset', name: 'Golden Hour', brightness: 105, contrast: 115, saturation: 130, sepia: 25, grayscale: 0, hue: 15 },
  { id: 'cyberpunk', name: 'Cyber Neon', brightness: 115, contrast: 135, saturation: 160, sepia: 0, grayscale: 0, hue: 280 },
  { id: 'noir', name: 'Film Noir B&W', brightness: 105, contrast: 150, saturation: 0, sepia: 0, grayscale: 100, hue: 0 },
  { id: 'vintage', name: 'Vintage 1970s', brightness: 95, contrast: 110, saturation: 85, sepia: 40, grayscale: 0, hue: 350 },
  { id: 'emerald', name: 'Emerald Pop', brightness: 105, contrast: 120, saturation: 140, sepia: 0, grayscale: 0, hue: 90 },
];

export const ImageEditorTool: React.FC = () => {
  // Current edit parameters
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [sepia, setSepia] = useState(0);
  const [grayscale, setGrayscale] = useState(0);
  const [blur, setBlur] = useState(0);
  const [hue, setHue] = useState(0);

  // Geometric transforms
  const [rotation, setRotation] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);

  // Active preset
  const [activePreset, setActivePreset] = useState('normal');

  // Image source
  const [imageSrc, setImageSrc] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Initialize with a high quality generated sample image
  useEffect(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 500;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Scenic illustration
      const grad = ctx.createLinearGradient(0, 0, 800, 500);
      grad.addColorStop(0, '#1e1b4b');
      grad.addColorStop(0.5, '#4338ca');
      grad.addColorStop(1, '#e11d48');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 800, 500);

      // Glowing Sun
      const sunGrad = ctx.createRadialGradient(400, 260, 0, 400, 260, 180);
      sunGrad.addColorStop(0, '#fef08a');
      sunGrad.addColorStop(0.4, '#f97316');
      sunGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = sunGrad;
      ctx.beginPath();
      ctx.arc(400, 260, 180, 0, Math.PI * 2);
      ctx.fill();

      // Architecture silhouettes
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.moveTo(0, 500);
      ctx.lineTo(0, 360);
      ctx.lineTo(150, 310);
      ctx.lineTo(260, 380);
      ctx.lineTo(400, 240);
      ctx.lineTo(540, 380);
      ctx.lineTo(650, 320);
      ctx.lineTo(800, 370);
      ctx.lineTo(800, 500);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 22px Inter, system-ui, sans-serif';
      ctx.fillText('Bharat 1 AI Studio • Studio Asset', 40, 70);
      ctx.font = '14px Inter, system-ui, sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.fillText('Ready for filters, enhancement, rotation, and export', 40, 96);

      setImageSrc(canvas.toDataURL('image/png'));
    }
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImageSrc(event.target.result as string);
          handleResetAll();
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleApplyPreset = (preset: FilterPreset) => {
    setActivePreset(preset.id);
    setBrightness(preset.brightness);
    setContrast(preset.contrast);
    setSaturation(preset.saturation);
    setSepia(preset.sepia);
    setGrayscale(preset.grayscale);
    setHue(preset.hue);
  };

  const handleResetAll = () => {
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setSepia(0);
    setGrayscale(0);
    setBlur(0);
    setHue(0);
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
    setActivePreset('normal');
  };

  const handleAutoEnhance = () => {
    setBrightness(108);
    setContrast(118);
    setSaturation(125);
    setSepia(0);
    setGrayscale(0);
    setHue(5);
    setActivePreset('auto_ai');
  };

  // Filter style string for CSS preview
  const filterString = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) sepia(${sepia}%) grayscale(${grayscale}%) blur(${blur}px) hue-rotate(${hue}deg)`;

  // Export processed image via canvas
  const handleDownload = () => {
    if (!imageSrc) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const is90or270 = rotation % 180 !== 0;
      canvas.width = is90or270 ? img.height : img.width;
      canvas.height = is90or270 ? img.width : img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.filter = filterString;
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
      ctx.drawImage(img, -img.width / 2, -img.height / 2);

      const link = document.createElement('a');
      link.download = `bharat1-edited-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
    img.src = imageSrc;
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
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 uppercase">
                Studio Grade
              </span>
            </h1>
            <p className="text-xs text-slate-500">
              Apply real-time photo filters, color grading, geometric transforms, and AI auto-enhancements
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
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
            <span>Upload Photo</span>
          </button>

          <button
            onClick={handleAutoEnhance}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
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
        {/* Left Column: Sliders & Transforms (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* 1. Preset Filters */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800">Filter Presets</label>
              <button
                onClick={handleResetAll}
                className="text-[11px] text-red-600 hover:underline font-semibold flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset All</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {PRESET_FILTERS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => handleApplyPreset(preset)}
                  className={`px-2.5 py-2 rounded-xl text-xs font-bold border transition-all text-center ${
                    activePreset === preset.id
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-800 shadow-2xs ring-2 ring-emerald-600/20'
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Color & Tone Adjustments */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
            <h2 className="text-xs font-bold text-slate-800">Color & Tone Sliders</h2>

            {/* Brightness */}
            <div>
              <div className="flex items-center justify-between text-xs text-slate-700 mb-1">
                <span className="font-medium flex items-center gap-1.5">
                  <Sun className="w-3.5 h-3.5 text-amber-500" /> Brightness
                </span>
                <span className="font-mono text-slate-500">{brightness}%</span>
              </div>
              <input
                type="range"
                min="30"
                max="180"
                value={brightness}
                onChange={(e) => setBrightness(parseInt(e.target.value))}
                className="w-full accent-emerald-600"
              />
            </div>

            {/* Contrast */}
            <div>
              <div className="flex items-center justify-between text-xs text-slate-700 mb-1">
                <span className="font-medium flex items-center gap-1.5">
                  <Contrast className="w-3.5 h-3.5 text-slate-600" /> Contrast
                </span>
                <span className="font-mono text-slate-500">{contrast}%</span>
              </div>
              <input
                type="range"
                min="30"
                max="200"
                value={contrast}
                onChange={(e) => setContrast(parseInt(e.target.value))}
                className="w-full accent-emerald-600"
              />
            </div>

            {/* Saturation */}
            <div>
              <div className="flex items-center justify-between text-xs text-slate-700 mb-1">
                <span className="font-medium flex items-center gap-1.5">
                  <Droplets className="w-3.5 h-3.5 text-blue-500" /> Saturation
                </span>
                <span className="font-mono text-slate-500">{saturation}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="250"
                value={saturation}
                onChange={(e) => setSaturation(parseInt(e.target.value))}
                className="w-full accent-emerald-600"
              />
            </div>

            {/* Hue Rotate */}
            <div>
              <div className="flex items-center justify-between text-xs text-slate-700 mb-1">
                <span className="font-medium">Hue Shift</span>
                <span className="font-mono text-slate-500">{hue}°</span>
              </div>
              <input
                type="range"
                min="0"
                max="360"
                value={hue}
                onChange={(e) => setHue(parseInt(e.target.value))}
                className="w-full accent-emerald-600"
              />
            </div>

            {/* Grayscale */}
            <div>
              <div className="flex items-center justify-between text-xs text-slate-700 mb-1">
                <span className="font-medium">Grayscale</span>
                <span className="font-mono text-slate-500">{grayscale}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={grayscale}
                onChange={(e) => setGrayscale(parseInt(e.target.value))}
                className="w-full accent-emerald-600"
              />
            </div>

            {/* Sepia */}
            <div>
              <div className="flex items-center justify-between text-xs text-slate-700 mb-1">
                <span className="font-medium">Sepia</span>
                <span className="font-mono text-slate-500">{sepia}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={sepia}
                onChange={(e) => setSepia(parseInt(e.target.value))}
                className="w-full accent-emerald-600"
              />
            </div>
          </div>

          {/* 3. Transform & Orientation */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-3">
            <h2 className="text-xs font-bold text-slate-800">Transforms</h2>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setRotation((prev) => (prev + 90) % 360)}
                className="p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 flex flex-col items-center justify-center gap-1 transition-colors"
              >
                <RotateCw className="w-4 h-4 text-emerald-600" />
                <span>Rotate 90°</span>
              </button>

              <button
                onClick={() => setFlipH((prev) => !prev)}
                className={`p-2.5 border rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1 transition-colors ${
                  flipH
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                    : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                }`}
              >
                <FlipHorizontal className="w-4 h-4" />
                <span>Flip H</span>
              </button>

              <button
                onClick={() => setFlipV((prev) => !prev)}
                className={`p-2.5 border rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1 transition-colors ${
                  flipV
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

        {/* Right Column: Live Viewport Canvas (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-900">Live Editor Preview</span>
              <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                Rot: {rotation}° • H-Flip: {flipH ? 'Yes' : 'No'}
              </span>
            </div>

            {/* Container for image transform and CSS filters */}
            <div className="relative rounded-2xl overflow-hidden bg-slate-900 flex items-center justify-center min-h-[440px] border border-slate-800 shadow-inner">
              {imageSrc ? (
                <div
                  className="transition-all duration-150 max-h-[500px] flex items-center justify-center p-4"
                  style={{
                    transform: `rotate(${rotation}deg) scale(${flipH ? -1 : 1}, ${flipV ? -1 : 1})`,
                  }}
                >
                  <img
                    src={imageSrc}
                    alt="Editor preview"
                    className="max-h-[460px] w-auto max-w-full object-contain rounded-lg shadow-2xl transition-all"
                    style={{ filter: filterString }}
                  />
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
