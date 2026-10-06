import React, { useState } from 'react';
import { 
  Sparkles, 
  Image as ImageIcon, 
  Download, 
  Copy, 
  Share2, 
  Wand2, 
  Maximize2, 
  Check, 
  RefreshCw, 
  Sliders, 
  Layers, 
  Film,
  Zap
} from 'lucide-react';

interface ImageCreatorToolProps {
  onNavigateToTool?: (toolId: any) => void;
}

const STYLES = [
  { id: 'photorealistic', label: 'Photorealistic', desc: '8K Ultra HD photography with natural lighting' },
  { id: 'corporate_3d', label: 'Corporate 3D', desc: 'Modern isometric corporate illustration' },
  { id: 'cinematic', label: 'Cinematic', desc: 'Dramatic cinematic film still, anamorphic bokeh' },
  { id: 'minimalist', label: 'Minimalist', desc: 'Clean vector design with bold negative space' },
  { id: 'cyberpunk', label: 'Cyberpunk', desc: 'Neon lighting, reflective wet asphalt, futuristic' },
  { id: 'watercolor', label: 'Watercolor', desc: 'Hand-painted expressive brush strokes' },
];

const ASPECT_RATIOS = [
  { id: '16:9', label: '16:9 Landscape', icon: 'w-6 h-3.5' },
  { id: '1:1', label: '1:1 Square', icon: 'w-4 h-4' },
  { id: '9:16', label: '9:16 Story/Reel', icon: 'w-3.5 h-6' },
  { id: '4:3', label: '4:3 Standard', icon: 'w-5 h-4' },
  { id: '3:2', label: '3:2 Photo', icon: 'w-5.5 h-3.5' },
];

const SAMPLE_PROMPTS = [
  'Modern corporate boardroom with glass walls overlooking Mumbai skyline, natural daylight, cinematic',
  'Futuristic automated risk analytics command center, holographic data visualization, sleek red accents',
  'Professional corporate executive in tailored blazer presenting quarterly growth charts, warm studio lighting',
  'Abstract isometric architecture representation of digital insurance infrastructure, red and white clean aesthetic',
];

export const ImageCreatorTool: React.FC<ImageCreatorToolProps> = ({ onNavigateToTool }) => {
  const [prompt, setPrompt] = useState(SAMPLE_PROMPTS[0]);
  const [negativePrompt, setNegativePrompt] = useState('blurry, low quality, distorted, extra limbs, grain');
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [selectedStyle, setSelectedStyle] = useState('photorealistic');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentImage, setCurrentImage] = useState<string>(
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80'
  );
  const [history, setHistory] = useState<string[]>([
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1200&q=80',
  ]);
  const [copied, setCopied] = useState(false);

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    // Dynamic generation simulation with curated high quality visuals
    setTimeout(() => {
      const imagesPool = [
        'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
      ];
      const randomImg = imagesPool[Math.floor(Math.random() * imagesPool.length)];
      setCurrentImage(randomImg);
      setHistory((prev) => [randomImg, ...prev.slice(0, 5)]);
      setIsGenerating(false);
    }, 1400);
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 overflow-y-auto px-6 py-6 max-w-7xl mx-auto space-y-6 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-slate-900">AI Image Creator Workspace</h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700">
              Imagen 3 / SDXL
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Create high-fidelity marketing visuals, executive mockups, and corporate digital assets
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const random = SAMPLE_PROMPTS[Math.floor(Math.random() * SAMPLE_PROMPTS.length)];
              setPrompt(random);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
          >
            <Wand2 className="w-3.5 h-3.5 text-red-600" />
            <span>Random Prompt</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left Controls, Right Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-5">
          {/* Prompt */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-800">Prompt Description</label>
              <button
                onClick={handleCopyPrompt}
                className="text-[11px] text-slate-400 hover:text-slate-600 flex items-center gap-1"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <textarea
              rows={4}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe what you want to visualize in vivid detail..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:border-red-500 outline-none transition-all resize-none leading-relaxed"
            />

            {/* Inspiration Chips */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {SAMPLE_PROMPTS.slice(0, 2).map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => setPrompt(p)}
                  className="text-[10px] bg-slate-100 hover:bg-red-50 hover:text-red-700 text-slate-600 px-2 py-0.5 rounded-md truncate max-w-xs transition-colors"
                >
                  &ldquo;{p.slice(0, 38)}...&rdquo;
                </button>
              ))}
            </div>
          </div>

          {/* Style Selector */}
          <div>
            <label className="text-xs font-bold text-slate-800 block mb-1.5">Visual Aesthetic Style</label>
            <div className="grid grid-cols-2 gap-2">
              {STYLES.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSelectedStyle(s.id)}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    selectedStyle === s.id
                      ? 'border-red-500 bg-red-50/60 text-red-950 font-bold ring-1 ring-red-500'
                      : 'border-slate-200 bg-slate-50/50 hover:bg-white text-slate-700 font-medium'
                  }`}
                >
                  <div className="text-xs">{s.label}</div>
                  <div className="text-[10px] text-slate-400 truncate mt-0.5">{s.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Aspect Ratio */}
          <div>
            <label className="text-xs font-bold text-slate-800 block mb-1.5">Aspect Ratio</label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
              {ASPECT_RATIOS.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setAspectRatio(r.id)}
                  className={`py-2 px-1.5 rounded-lg border text-center transition-all ${
                    aspectRatio === r.id
                      ? 'border-red-500 bg-red-600 text-white font-bold shadow-2xs'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold'
                  }`}
                >
                  <span className="text-[11px] block">{r.id}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Negative Prompt */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Negative Prompt (Exclude)</label>
            <input
              type="text"
              value={negativePrompt}
              onChange={(e) => setNegativePrompt(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 outline-none focus:border-red-500"
            />
          </div>

          {/* Generate CTA Button */}
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="w-full py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.98]"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Synthesizing Image...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate High-Resolution Image</span>
              </>
            )}
          </button>
        </div>

        {/* Right Output & Actions (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 flex flex-col justify-between min-h-[460px]">
            {/* Top Toolbar */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900">Generated Canvas</span>
                <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                  {aspectRatio} • {selectedStyle.toUpperCase()}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <a
                  href={currentImage}
                  download="epoch-ai-generation.jpg"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 px-2.5 py-1 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-semibold transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </a>

                {onNavigateToTool && (
                  <>
                    <button
                      onClick={() => onNavigateToTool('image-edit')}
                      className="flex items-center gap-1 px-2.5 py-1 text-red-600 hover:bg-red-50 rounded-lg text-xs font-semibold transition-colors"
                      title="Open in Image Editor"
                    >
                      <Wand2 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => onNavigateToTool('image-to-video')}
                      className="flex items-center gap-1 px-2.5 py-1 text-slate-700 hover:bg-slate-100 rounded-lg text-xs font-semibold transition-colors"
                      title="Animate to Video"
                    >
                      <Film className="w-3.5 h-3.5" />
                      <span>Animate</span>
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Image Canvas Display */}
            <div className="relative rounded-xl overflow-hidden bg-slate-950 flex items-center justify-center my-3 max-h-[460px]">
              {isGenerating ? (
                <div className="h-80 flex flex-col items-center justify-center text-center p-6 space-y-3">
                  <div className="w-12 h-12 rounded-full border-3 border-red-500 border-t-transparent animate-spin" />
                  <div className="text-xs font-bold text-white">Rendering Latent Diffusion Matrix</div>
                  <div className="text-[10px] text-slate-400 max-w-xs">
                    Applying {selectedStyle} aesthetic, lighting shaders, and denoising passes...
                  </div>
                </div>
              ) : (
                <img
                  src={currentImage}
                  alt="AI Generated Result"
                  className="w-full h-auto max-h-[460px] object-cover transition-opacity duration-300"
                />
              )}
            </div>

            {/* Footer Prompt Recap */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span className="truncate max-w-md">Prompt: {prompt}</span>
              <span className="font-mono text-[10px] text-emerald-600 font-bold shrink-0">100% Quality Score</span>
            </div>
          </div>

          {/* History Gallery Strip */}
          <div className="bg-white rounded-xl border border-slate-200/90 p-3 shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Recent Generations Gallery
            </span>
            <div className="grid grid-cols-4 gap-2">
              {history.map((imgUrl, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentImage(imgUrl)}
                  className={`relative rounded-lg overflow-hidden border aspect-video group ${
                    currentImage === imgUrl ? 'ring-2 ring-red-600 border-red-600' : 'border-slate-200'
                  }`}
                >
                  <img src={imgUrl} alt={`History ${idx}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
