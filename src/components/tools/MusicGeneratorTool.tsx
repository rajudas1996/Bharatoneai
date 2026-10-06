import React, { useState } from 'react';
import { 
  Music, 
  Play, 
  Pause, 
  Download, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  RefreshCw, 
  Radio, 
  Sliders, 
  Disc3,
  Repeat
} from 'lucide-react';

const GENRES = [
  { id: 'ambient_corporate', label: 'Corporate Tech', desc: 'Modern upbeat clean synth acoustic' },
  { id: 'cinematic_epic', label: 'Cinematic Orchestral', desc: 'Dramatic brass, strings, and percussion' },
  { id: 'lofi_chill', label: 'Lo-Fi Chillhop', desc: 'Relaxed vinyl beat with warm electric piano' },
  { id: 'synthwave', label: 'Retro Synthwave', desc: '80s analog basslines and neon arpeggios' },
  { id: 'acoustic_warm', label: 'Warm Acoustic Indie', desc: 'Fingerpicked guitar and gentle strings' },
];

export const MusicGeneratorTool: React.FC = () => {
  const [prompt, setPrompt] = useState(
    'Inspiring corporate anthem with uplifting piano melody, subtle electro pulse, and confident rhythm'
  );
  const [genre, setGenre] = useState('ambient_corporate');
  const [tempoBpm, setTempoBpm] = useState(118);
  const [duration, setDuration] = useState('02:15');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(35);
  const [volume, setVolume] = useState(85);

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setIsPlaying(true);
      setProgress(0);
    }, 1400);
  };

  return (
    <div className="flex-1 overflow-y-auto px-6 py-6 max-w-7xl mx-auto space-y-6 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-slate-900">AI Music Generator</h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700">
              Lyria Harmonic Engine
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Compose original instrumental soundtracks, corporate themes, and ambient audio tracks
          </p>
        </div>

        <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
          48kHz • 24-bit Lossless Audio
        </span>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-5">
          {/* Prompt */}
          <div>
            <label className="text-xs font-bold text-slate-800 block mb-1.5">
              Composition Brief / Music Description
            </label>
            <textarea
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe mood, instruments, rhythm, and progression..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:border-red-500 outline-none resize-none leading-relaxed"
            />
          </div>

          {/* Genre Selection */}
          <div>
            <label className="text-xs font-bold text-slate-800 block mb-1.5">Genre & Style</label>
            <div className="space-y-1.5">
              {GENRES.map((g) => (
                <button
                  key={g.id}
                  onClick={() => setGenre(g.id)}
                  className={`w-full p-2.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                    genre === g.id
                      ? 'border-red-500 bg-red-50/70 text-red-950 font-bold'
                      : 'border-slate-200 bg-slate-50/60 hover:bg-white text-slate-700'
                  }`}
                >
                  <div>
                    <div className="text-xs">{g.label}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{g.desc}</div>
                  </div>
                  {genre === g.id && <Disc3 className="w-4 h-4 text-red-600 animate-spin" />}
                </button>
              ))}
            </div>
          </div>

          {/* Tempo BPM */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-800">Tempo (Beats Per Minute)</label>
              <span className="text-xs font-mono font-bold text-red-600">{tempoBpm} BPM</span>
            </div>
            <input
              type="range"
              min="70"
              max="160"
              value={tempoBpm}
              onChange={(e) => setTempoBpm(Number(e.target.value))}
              className="w-full accent-red-600 cursor-pointer"
            />
          </div>

          {/* Generate CTA */}
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="w-full py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.98]"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Synthesizing Audio Waveforms...</span>
              </>
            ) : (
              <>
                <Music className="w-4 h-4" />
                <span>Compose AI Music Track</span>
              </>
            )}
          </button>
        </div>

        {/* Right Audio Player & Waveform (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 flex flex-col justify-between min-h-[460px]">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-6">
              <span className="text-xs font-bold text-slate-900">Audio Playback & Studio Console</span>
              <button
                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-colors shadow-2xs"
                onClick={() => alert('Downloading master track: "Epoch Corporate Symphony.mp3"')}
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download WAV / MP3</span>
              </button>
            </div>

            {/* Audio Disc & Track Info */}
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-600 to-red-800 text-white flex items-center justify-center shrink-0 shadow-md">
                <Disc3 className={`w-8 h-8 ${isPlaying ? 'animate-spin' : ''}`} />
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-red-600">
                  AI Master Recording
                </span>
                <h3 className="text-base font-bold text-slate-900 leading-snug">
                  Echoes of Enterprise Strategy
                </h3>
                <p className="text-xs text-slate-500 font-mono">
                  {tempoBpm} BPM • {genre.replace('_', ' ').toUpperCase()} • Stereo 320kbps
                </p>
              </div>
            </div>

            {/* Simulated Animated Waveform Visualizer */}
            <div className="bg-slate-950 p-6 rounded-2xl my-4 text-white">
              <div className="flex items-end justify-between gap-1 h-24 mb-4">
                {Array.from({ length: 48 }).map((_, i) => {
                  const h = Math.abs(Math.sin(i * 0.3) * 75 + Math.cos(i * 0.7) * 20);
                  const active = i <= (progress / 100) * 48;
                  return (
                    <div
                      key={i}
                      className={`flex-1 rounded-full transition-all ${
                        active ? 'bg-red-500' : 'bg-slate-700/60'
                      }`}
                      style={{
                        height: `${Math.max(12, h)}%`,
                        animationDuration: `${0.8 + (i % 5) * 0.2}s`,
                      }}
                    />
                  );
                })}
              </div>

              {/* Progress & Time */}
              <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                <span>00:48</span>
                <div
                  className="flex-1 mx-4 h-1.5 bg-slate-800 rounded-full cursor-pointer relative overflow-hidden"
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const pct = ((e.clientX - rect.left) / rect.width) * 100;
                    setProgress(Math.max(0, Math.min(100, pct)));
                  }}
                >
                  <div className="bg-red-600 h-full rounded-full" style={{ width: `${progress}%` }} />
                </div>
                <span>{duration}</span>
              </div>
            </div>

            {/* Player Controls Bar */}
            <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-10 h-10 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-sm transition-transform active:scale-95"
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                </button>

                <button
                  onClick={() => setProgress(0)}
                  className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-colors"
                  title="Replay"
                >
                  <Repeat className="w-4 h-4" />
                </button>
              </div>

              {/* Volume Slider */}
              <div className="flex items-center gap-2 text-slate-600">
                <Volume2 className="w-4 h-4 text-slate-400" />
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={(e) => setVolume(Number(e.target.value))}
                  className="w-24 accent-red-600 cursor-pointer"
                />
                <span className="text-xs font-mono text-slate-500 w-8">{volume}%</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Harmonic Engine: Multitrack MIDI + Generative Latent Diffusion</span>
            <span className="font-mono text-emerald-600 font-bold">Latency: 18ms</span>
          </div>
        </div>
      </div>
    </div>
  );
};
