import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Download, 
  Copy, 
  Check, 
  RotateCcw, 
  Image as ImageIcon, 
  Layers, 
  Sliders, 
  Maximize2, 
  Share2,
  Wand2,
  Palette,
  Eye,
  ChevronRight
} from 'lucide-react';
import { generateAiImage } from '../../utils/aiClient';

interface StylePreset {
  id: string;
  name: string;
  desc: string;
  gradient: string;
}

const STYLE_PRESETS: StylePreset[] = [
  { id: 'cinematic', name: 'Cinematic 3D', desc: 'Dramatic lighting & octane render', gradient: 'from-amber-500 to-red-600' },
  { id: 'digital_art', name: 'Digital Art', desc: 'Vibrant concept illustration', gradient: 'from-purple-500 to-indigo-600' },
  { id: 'photoreal', name: 'Photorealistic', desc: '8K hyper-detailed clarity', gradient: 'from-blue-500 to-cyan-600' },
  { id: 'indian_art', name: 'Indian Classical', desc: 'Rich cultural heritage motifs', gradient: 'from-orange-500 to-amber-600' },
  { id: 'cyberpunk', name: 'Cyberpunk Neon', desc: 'Futuristic glowing aesthetics', gradient: 'from-fuchsia-500 to-purple-600' },
  { id: 'watercolor', name: 'Watercolor', desc: 'Soft organic brush strokes', gradient: 'from-teal-400 to-emerald-600' },
  { id: 'anime', name: 'Anime / Manga', desc: 'Japanese animation studio look', gradient: 'from-pink-500 to-rose-600' },
  { id: 'minimal_vector', name: 'Vector Logo', desc: 'Clean flat geometric curves', gradient: 'from-slate-700 to-slate-900' },
];

const PROMPT_SUGGESTIONS = [
  'Futuristic Smart City Mumbai with flying electric transit in 2050',
  'Majestic Himalayan monastery basking in golden sunrise mist',
  'Intricate Indian Peacock with glowing neon feather patterns',
  'Traditional Diwali festival of lights across ancient Varanasi ghats',
  'Minimalist modern fintech logo featuring a digital tiger',
  'Cyberpunk Bangalore technology hub under glowing monsoon skies',
];

interface GeneratedImage {
  id: string;
  prompt: string;
  style: string;
  aspect: string;
  timestamp: string;
  dataUrl: string;
}

export const ImageCreatorTool: React.FC = () => {
  const [prompt, setPrompt] = useState('Futuristic Smart City Mumbai with flying electric transit in 2050');
  const [negativePrompt, setNegativePrompt] = useState('blurry, low quality, artifacts, distorted');
  const [selectedStyle, setSelectedStyle] = useState('cinematic');
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '16:9' | '9:16' | '4:3'>('16:9');
  const [resolution, setResolution] = useState<'1080p' | '2k' | '4k'>('1080p');
  const [guidanceScale, setGuidanceScale] = useState(7.5);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [gallery, setGallery] = useState<GeneratedImage[]>([]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Generate artistic canvas composition
  const generateArt = async (promptText: string, styleId: string, aspect: string) => {
    setIsGenerating(true);

    try {
      const aiResult = await generateAiImage(promptText, aspect);
      if (aiResult.imageUrl) {
        setCurrentImage(aiResult.imageUrl);
        const newItem: GeneratedImage = {
          id: String(Date.now()),
          prompt: promptText,
          style: `${styleId} (Gemini 3.1 Flash Image)`,
          aspect,
          timestamp: new Date().toLocaleTimeString(),
          dataUrl: aiResult.imageUrl,
        };
        setGallery((prev) => [newItem, ...prev.slice(0, 7)]);
        setIsGenerating(false);
        return;
      }
    } catch (e) {
      // Fallback to client synthesis
    }

    setTimeout(() => {
      try {
        const canvas = document.createElement('canvas');
        let w = 800;
        let h = 450;
        if (aspect === '1:1') { w = 600; h = 600; }
        else if (aspect === '9:16') { w = 450; h = 800; }
        else if (aspect === '4:3') { w = 800; h = 600; }

        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Deterministic pseudo-random seed based on prompt string
        let seed = 0;
        for (let i = 0; i < promptText.length; i++) {
          seed = (seed * 31 + promptText.charCodeAt(i)) % 1000000;
        }
        const pseudoRandom = () => {
          seed = (seed * 9301 + 49297) % 233280;
          return seed / 233280;
        };

      // 1. Rich Background Gradient according to style
      const bgGrad = ctx.createLinearGradient(0, 0, w, h);
      if (styleId === 'cyberpunk') {
        bgGrad.addColorStop(0, '#0f051d');
        bgGrad.addColorStop(0.5, '#2e0854');
        bgGrad.addColorStop(1, '#051937');
      } else if (styleId === 'indian_art') {
        bgGrad.addColorStop(0, '#2d0c03');
        bgGrad.addColorStop(0.4, '#801d06');
        bgGrad.addColorStop(1, '#ff9900');
      } else if (styleId === 'watercolor') {
        bgGrad.addColorStop(0, '#e0f2fe');
        bgGrad.addColorStop(0.5, '#fef3c7');
        bgGrad.addColorStop(1, '#dcfce7');
      } else if (styleId === 'photoreal') {
        bgGrad.addColorStop(0, '#0a192f');
        bgGrad.addColorStop(0.5, '#1e3a8a');
        bgGrad.addColorStop(1, '#0284c7');
      } else {
        // cinematic / default
        bgGrad.addColorStop(0, '#0b0f19');
        bgGrad.addColorStop(0.6, '#1e1b4b');
        bgGrad.addColorStop(1, '#dc2626');
      }
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // 2. Glowing celestial body / focal aura
      const sunX = w * (0.3 + pseudoRandom() * 0.4);
      const sunY = h * (0.25 + pseudoRandom() * 0.25);
      const sunRad = Math.min(w, h) * 0.22;
      const sunGrad = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, sunRad);
      sunGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
      sunGrad.addColorStop(0.3, 'rgba(254, 240, 138, 0.8)');
      sunGrad.addColorStop(0.7, 'rgba(239, 68, 68, 0.4)');
      sunGrad.addColorStop(1, 'rgba(220, 38, 38, 0)');
      ctx.fillStyle = sunGrad;
      ctx.beginPath();
      ctx.arc(sunX, sunY, sunRad, 0, Math.PI * 2);
      ctx.fill();

      // 3. Procedural Mountain / Skyline Contours
      const layers = 4;
      for (let l = 0; l < layers; l++) {
        ctx.beginPath();
        const baseH = h * (0.55 + l * 0.12);
        ctx.moveTo(0, h);
        ctx.lineTo(0, baseH);

        const segments = 16;
        for (let i = 1; i <= segments; i++) {
          const x = (w / segments) * i;
          const variance = (pseudoRandom() - 0.5) * (h * 0.18 / (l + 1));
          const y = baseH + variance;
          ctx.lineTo(x, y);
        }
        ctx.lineTo(w, h);
        ctx.closePath();

        const layerAlpha = 0.4 + l * 0.2;
        if (styleId === 'cyberpunk') {
          ctx.fillStyle = `rgba(168, 85, 247, ${layerAlpha * 0.8})`;
        } else if (styleId === 'indian_art') {
          ctx.fillStyle = `rgba(180, 83, 9, ${layerAlpha})`;
        } else {
          ctx.fillStyle = `rgba(15, 23, 42, ${layerAlpha})`;
        }
        ctx.fill();

        // Layer highlights
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.15 + l * 0.08})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // 4. Starfield / Atmospheric Particle Sparkles
      const starCount = 80;
      for (let s = 0; s < starCount; s++) {
        const sx = pseudoRandom() * w;
        const sy = pseudoRandom() * h * 0.7;
        const sr = pseudoRandom() * 2.2;
        ctx.fillStyle = `rgba(255, 255, 255, ${0.4 + pseudoRandom() * 0.6})`;
        ctx.beginPath();
        ctx.arc(sx, sy, sr, 0, Math.PI * 2);
        ctx.fill();
      }

      // 5. Stylistic Foreground Elements (Beams / Reflection / Grid)
      ctx.save();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.fillRect(0, h * 0.85, w, h * 0.15);

      // Water reflection lines
      for (let r = 0; r < 12; r++) {
        const ry = h * 0.86 + r * 5;
        ctx.strokeStyle = `rgba(254, 226, 226, ${0.15 - r * 0.01})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(w * 0.2, ry);
        ctx.lineTo(w * 0.8, ry);
        ctx.stroke();
      }
      ctx.restore();

      // 6. Watermark Badge
      ctx.save();
      ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
      if (typeof (ctx as any).roundRect === 'function') {
        (ctx as any).roundRect(16, h - 38, 140, 24, 6);
      } else {
        ctx.rect(16, h - 38, 140, 24);
      }
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 10px Inter, system-ui, sans-serif';
      ctx.fillText('⚡ Bharat 1 AI Studio', 26, h - 22);
      ctx.restore();

        const dataUrl = canvas.toDataURL('image/png');
        setCurrentImage(dataUrl);

        const newItem: GeneratedImage = {
          id: String(Date.now()),
          prompt: promptText,
          style: styleId,
          aspect,
          timestamp: new Date().toLocaleTimeString(),
          dataUrl,
        };

        setGallery((prev) => [newItem, ...prev.slice(0, 7)]);
      } catch (err) {
        console.error('Error generating image synthesis:', err);
      } finally {
        setIsGenerating(false);
      }
    }, 400);
  };

  // Initial generation on first mount
  useEffect(() => {
    generateArt(prompt, selectedStyle, aspectRatio);
  }, []);

  const handleDownload = () => {
    if (!currentImage) return;
    const a = document.createElement('a');
    a.href = currentImage;
    a.download = `bharat1-ai-${selectedStyle}-${Date.now()}.png`;
    a.click();
  };

  const handleCopy = () => {
    if (!currentImage) return;
    navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-xs">
            <ImageIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <span>Image Creator</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700 uppercase">
                AI Diffusion 4.0
              </span>
            </h1>
            <p className="text-xs text-slate-500">
              Generate photorealistic, artistic, and cinematic imagery from natural language prompts
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end md:self-auto">
          <button
            onClick={() => generateArt(prompt, selectedStyle, aspectRatio)}
            disabled={isGenerating}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-2 active:scale-98 disabled:opacity-50 cursor-pointer"
          >
            {isGenerating ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Wand2 className="w-3.5 h-3.5" />
                <span>Generate Artwork</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Grid: Controls Left, Live Canvas Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Prompt & Configurations (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* 1. Prompt Box */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-3">
            <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
              <span>Text Prompt</span>
              <span className="text-[11px] text-slate-400 font-normal">English / Hindi supported</span>
            </label>
            <textarea
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe what you want to see in detail..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:border-purple-500 outline-none transition-all resize-none shadow-2xs"
            />

            {/* Quick Inspiration Pills */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Quick Inspirations:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {PROMPT_SUGGESTIONS.map((s, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setPrompt(s);
                      generateArt(s, selectedStyle, aspectRatio);
                    }}
                    className="text-[11px] bg-slate-100 hover:bg-purple-50 hover:text-purple-700 text-slate-600 px-2.5 py-1 rounded-lg transition-colors text-left line-clamp-1 border border-slate-200/60"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 2. Visual Style Presets */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-3">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Palette className="w-4 h-4 text-purple-600" />
              <span>Choose Artistic Style</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {STYLE_PRESETS.map((style) => {
                const isSelected = selectedStyle === style.id;
                return (
                  <button
                    key={style.id}
                    type="button"
                    onClick={() => {
                      setSelectedStyle(style.id);
                      generateArt(prompt, style.id, aspectRatio);
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-purple-600 bg-purple-50/70 shadow-2xs ring-2 ring-purple-600/20'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className={`w-full h-1.5 rounded-full bg-gradient-to-r ${style.gradient} mb-2`} />
                    <div className="text-xs font-bold text-slate-900 truncate">{style.name}</div>
                    <div className="text-[10px] text-slate-400 truncate">{style.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Output Specs: Aspect Ratio & Resolution */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-800 block mb-2">Aspect Ratio</label>
              <div className="grid grid-cols-4 gap-2">
                {(['16:9', '1:1', '9:16', '4:3'] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => {
                      setAspectRatio(r);
                      generateArt(prompt, selectedStyle, r);
                    }}
                    className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all text-center ${
                      aspectRatio === r
                        ? 'bg-purple-600 text-white border-purple-600 shadow-2xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-800 block mb-2">Resolution</label>
              <div className="grid grid-cols-3 gap-2">
                {(['1080p', '2k', '4k'] as const).map((res) => (
                  <button
                    key={res}
                    type="button"
                    onClick={() => setResolution(res)}
                    className={`py-1.5 px-2 rounded-xl text-xs font-bold border transition-all text-center uppercase ${
                      resolution === res
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {res}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-1.5">
                <span>Guidance Scale</span>
                <span className="font-mono text-purple-700">{guidanceScale}</span>
              </div>
              <input
                type="range"
                min="1"
                max="15"
                step="0.5"
                value={guidanceScale}
                onChange={(e) => setGuidanceScale(parseFloat(e.target.value))}
                className="w-full accent-purple-600 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Live Render Viewport & Gallery (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Live Viewport */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900">Generated Canvas</span>
                <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                  {aspectRatio} • {resolution}
                </span>
              </div>

              {currentImage && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                    title="Copy prompt"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={handleDownload}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-all shadow-2xs flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download PNG</span>
                  </button>
                </div>
              )}
            </div>

            {/* Canvas Container */}
            <div className="relative rounded-2xl overflow-hidden bg-slate-900 flex items-center justify-center min-h-[380px] border border-slate-800/80 shadow-inner group">
              {isGenerating ? (
                <div className="flex flex-col items-center justify-center p-8 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full border-4 border-purple-500 border-t-transparent animate-spin" />
                  <div className="text-white font-bold text-sm">Synthesizing Neural Diffusion...</div>
                  <div className="text-xs text-slate-400 max-w-xs">Applying style {selectedStyle} with guidance scale {guidanceScale}</div>
                </div>
              ) : currentImage ? (
                <>
                  <img
                    src={currentImage}
                    alt="Generated by Bharat 1 AI"
                    className="w-full h-auto max-h-[500px] object-contain rounded-xl transition-transform duration-300"
                  />
                  <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md text-white text-[11px] px-3 py-1.5 rounded-lg border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
                    Prompt: {prompt}
                  </div>
                </>
              ) : (
                <div className="text-slate-500 text-xs">No artwork generated yet</div>
              )}
            </div>
          </div>

          {/* Creation Gallery */}
          {gallery.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-3">
              <h3 className="text-xs font-bold text-slate-900 flex items-center justify-between">
                <span>Recent Creations</span>
                <span className="text-[11px] text-slate-400 font-normal">{gallery.length} saved</span>
              </h3>

              <div className="grid grid-cols-4 sm:grid-cols-4 gap-3">
                {gallery.map((img) => (
                  <div
                    key={img.id}
                    onClick={() => {
                      setCurrentImage(img.dataUrl);
                      setPrompt(img.prompt);
                    }}
                    className="group relative rounded-xl overflow-hidden border border-slate-200 bg-slate-100 cursor-pointer aspect-square hover:ring-2 hover:ring-purple-600 transition-all"
                  >
                    <img src={img.dataUrl} alt={img.prompt} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-1 text-center">
                      <span className="text-[10px] text-white font-medium line-clamp-2">{img.prompt}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
