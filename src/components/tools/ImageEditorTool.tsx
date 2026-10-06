import React, { useState } from 'react';
import { 
  Wand2, 
  Upload, 
  Download, 
  RefreshCw, 
  Sparkles, 
  Eye, 
  Columns, 
  Sliders, 
  RotateCcw,
  Check,
  Zap
} from 'lucide-react';

const PRESET_INSTRUCTIONS = [
  'Change lighting to warm golden hour studio backlight with subtle bokeh',
  'Replace the background with a minimalist high-rise corporate office',
  'Enhance clarity, boost HDR dynamic range, and sharpen fine details',
  'Apply professional black and white high-contrast editorial look',
  'Add modern holographic user interface HUD overlay elements',
];

const SAMPLE_IMAGES = [
  {
    name: 'Corporate Office',
    before: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1000&q=80',
    after: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1000&q=80',
  },
  {
    name: 'Executive Portrait',
    before: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=1000&q=80',
    after: 'https://images.unsplash.com/photo-1580894732444-8ecded7900cd?auto=format&fit=crop&w=1000&q=80',
  },
  {
    name: 'Modern Building',
    before: 'https://images.unsplash.com/photo-1541888946425-d0fbb186f5f8?auto=format&fit=crop&w=1000&q=80',
    after: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1000&q=80',
  },
];

export const ImageEditorTool: React.FC = () => {
  const [instruction, setInstruction] = useState(PRESET_INSTRUCTIONS[0]);
  const [currentSampleIndex, setCurrentSampleIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'split' | 'before' | 'after'>('split');
  const [isProcessing, setIsProcessing] = useState(false);
  const [intensity, setIntensity] = useState(80);

  const sample = SAMPLE_IMAGES[currentSampleIndex];

  const handleApplyEdit = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setViewMode('after');
    }, 1200);
  };

  return (
    <div className="flex-1 overflow-y-auto px-6 py-6 max-w-7xl mx-auto space-y-6 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-slate-900">AI Image Editor</h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
              Instruction-Guided Inpainting
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Modify existing photos by entering natural language edit instructions
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setViewMode('split')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
              viewMode === 'split' ? 'bg-white text-red-600 shadow-2xs' : 'text-slate-600'
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
            <span>Side-by-Side</span>
          </button>
          <button
            onClick={() => setViewMode('before')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
              viewMode === 'before' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
            }`}
          >
            <span>Original</span>
          </button>
          <button
            onClick={() => setViewMode('after')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
              viewMode === 'after' ? 'bg-white text-red-600 shadow-2xs' : 'text-slate-600'
            }`}
          >
            <span>Edited Result</span>
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: Instructions & Presets (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-5">
          {/* Instruction Input */}
          <div>
            <label className="text-xs font-bold text-slate-800 block mb-1.5">
              Editing Instruction
            </label>
            <textarea
              rows={3}
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              placeholder="Tell the AI what changes or modifications to apply..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:border-red-500 outline-none transition-all resize-none leading-relaxed"
            />

            {/* Quick Inspiration Pills */}
            <div className="space-y-1.5 mt-2.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Quick Edit Commands:
              </span>
              {PRESET_INSTRUCTIONS.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => setInstruction(p)}
                  className="w-full text-left text-[11px] p-2 rounded-lg bg-slate-50 hover:bg-red-50 hover:text-red-700 text-slate-600 border border-slate-200/60 transition-colors truncate"
                >
                  &ldquo;{p}&rdquo;
                </button>
              ))}
            </div>
          </div>

          {/* Edit Strength / Intensity */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-800">Modification Strength</label>
              <span className="text-xs font-mono font-bold text-red-600">{intensity}%</span>
            </div>
            <input
              type="range"
              min="20"
              max="100"
              value={intensity}
              onChange={(e) => setIntensity(Number(e.target.value))}
              className="w-full accent-red-600 cursor-pointer"
            />
          </div>

          {/* Sample Switcher */}
          <div>
            <label className="text-xs font-bold text-slate-800 block mb-1.5">Sample Input Images</label>
            <div className="grid grid-cols-3 gap-2">
              {SAMPLE_IMAGES.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setCurrentSampleIndex(idx);
                    setViewMode('split');
                  }}
                  className={`relative rounded-lg overflow-hidden border aspect-video group ${
                    currentSampleIndex === idx ? 'ring-2 ring-red-600 border-red-600' : 'border-slate-200'
                  }`}
                >
                  <img src={s.before} alt={s.name} className="w-full h-full object-cover" />
                  <span className="absolute inset-x-0 bottom-0 bg-black/60 text-white text-[9px] font-bold p-0.5 truncate text-center">
                    {s.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Execute CTA */}
          <button
            onClick={handleApplyEdit}
            disabled={isProcessing || !instruction.trim()}
            className="w-full py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.98]"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Applying Semantic Edits...</span>
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4" />
                <span>Apply Edits to Image</span>
              </>
            )}
          </button>
        </div>

        {/* Right Canvas: Before vs After (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 flex flex-col justify-between min-h-[500px]">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <span className="text-xs font-bold text-slate-900">
                Visual Inspection View • {sample.name}
              </span>
              <a
                href={sample.after}
                download="edited-output.jpg"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Result</span>
              </a>
            </div>

            {/* Display Canvas */}
            {isProcessing ? (
              <div className="h-80 bg-slate-950 rounded-xl flex flex-col items-center justify-center text-white space-y-3">
                <div className="w-10 h-10 border-3 border-red-500 border-t-transparent rounded-full animate-spin" />
                <div className="text-xs font-bold">Processing Instruction: &ldquo;{instruction}&rdquo;</div>
                <div className="text-[10px] text-slate-400">Re-rendering neural radiance field layers...</div>
              </div>
            ) : viewMode === 'split' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Before */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                    <span>Original Before</span>
                    <span className="text-[10px] font-mono bg-slate-100 px-1.5 py-0.2 rounded">RAW</span>
                  </div>
                  <div className="rounded-xl overflow-hidden border border-slate-200 aspect-4/3 bg-slate-100">
                    <img src={sample.before} alt="Original" className="w-full h-full object-cover" />
                  </div>
                </div>

                {/* After */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold text-red-600">
                    <span>AI Edited After</span>
                    <span className="text-[10px] font-mono bg-red-100 text-red-700 px-1.5 py-0.2 rounded font-bold">EDITED</span>
                  </div>
                  <div className="rounded-xl overflow-hidden border-2 border-red-500 aspect-4/3 bg-slate-100 shadow-sm">
                    <img src={sample.after} alt="AI Edited" className="w-full h-full object-cover" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-xl overflow-hidden border border-slate-200 aspect-16/9 bg-slate-900 max-h-[440px] flex items-center justify-center">
                <img
                  src={viewMode === 'before' ? sample.before : sample.after}
                  alt={viewMode}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Active Instruction: &ldquo;{instruction}&rdquo;</span>
            <span className="font-mono text-emerald-600 font-bold">Inpainting Accuracy 99.4%</span>
          </div>
        </div>
      </div>
    </div>
  );
};
