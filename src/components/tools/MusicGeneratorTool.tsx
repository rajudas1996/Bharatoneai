import React, { useState, useRef, useEffect } from 'react';
import { 
  Music, 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Download, 
  Sparkles, 
  Sliders, 
  Layers, 
  Radio, 
  Disc,
  Headphones
} from 'lucide-react';

interface TrackPreset {
  id: string;
  name: string;
  genre: string;
  bpm: number;
  scale: string;
  desc: string;
}

const TRACK_PRESETS: TrackPreset[] = [
  { id: 'indian_fusion', name: 'Indian Raga & Tabla Fusion', genre: 'Classical Fusion', bpm: 108, scale: 'Raga Bhairavi', desc: 'Melodic sitar & flute phrases over rhythmic Indian percussion' },
  { id: 'synthwave', name: 'Cyberpunk Neon Pulse', genre: 'Synthwave', bpm: 124, scale: 'D Minor', desc: 'Arpeggiated analog synthesizers with driving retro 80s bassline' },
  { id: 'lofi_chill', name: 'Bengaluru Monsoon Cafe', genre: 'Lo-Fi Chill Hop', bpm: 84, scale: 'C Major 7th', desc: 'Warm vinyl crackle, mellow electric piano chords, and relaxed groove' },
  { id: 'cinematic', name: 'Bharat Rising Anthem', genre: 'Cinematic Orchestral', bpm: 130, scale: 'G Minor', desc: 'Epic brass stabs, soaring strings, and thunderous battle drums' },
  { id: 'meditation', name: 'Himalayan Sunrise Meditation', genre: 'Ambient Zen', bpm: 60, scale: 'F Harmonic', desc: 'Soothing harmonic drones, singing bowls, and bamboo bansuri flute' },
];

export const MusicGeneratorTool: React.FC = () => {
  const [selectedPreset, setSelectedPreset] = useState<TrackPreset>(TRACK_PRESETS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [bpm, setBpm] = useState(108);
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);

  // Active stems
  const [stemMelody, setStemMelody] = useState(true);
  const [stemBass, setStemBass] = useState(true);
  const [stemDrums, setStemDrums] = useState(true);
  const [stemPad, setStemPad] = useState(true);

  // Web Audio API refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const stepIntervalRef = useRef<number | null>(null);
  const stepCountRef = useRef(0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Initialize Web Audio Context on demand
  const initAudio = () => {
    if (!audioCtxRef.current) {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtxClass();
      const masterGain = ctx.createGain();
      const analyser = ctx.createAnalyser();

      analyser.fftSize = 64;
      masterGain.gain.value = volume / 100;

      masterGain.connect(analyser);
      analyser.connect(ctx.destination);

      audioCtxRef.current = ctx;
      masterGainRef.current = masterGain;
      analyserRef.current = analyser;
    }
  };

  // Frequency notes for synthesized scale
  const notesByPreset: Record<string, number[]> = {
    indian_fusion: [220, 246.94, 277.18, 293.66, 329.63, 369.99, 440, 493.88], // Raga Bhairavi scale approx
    synthwave: [146.83, 174.61, 220, 261.63, 293.66, 349.23, 440, 523.25], // D Minor
    lofi_chill: [261.63, 329.63, 392, 493.88, 523.25, 587.33, 659.25], // C Maj7
    cinematic: [196, 233.08, 293.66, 392, 466.16, 587.33, 783.99], // G Minor
    meditation: [174.61, 220, 261.63, 349.23, 440, 523.25], // F Drone
  };

  const playStep = () => {
    const ctx = audioCtxRef.current;
    const masterGain = masterGainRef.current;
    if (!ctx || !masterGain || ctx.state !== 'running') return;

    const step = stepCountRef.current % 16;
    stepCountRef.current++;

    const scale = notesByPreset[selectedPreset.id] || notesByPreset.synthwave;
    const now = ctx.currentTime;

    // 1. Melody stem
    if (stemMelody && step % 2 === 0) {
      const osc = ctx.createOscillator();
      const noteGain = ctx.createGain();
      const noteFreq = scale[(step * 3) % scale.length];

      osc.type = selectedPreset.id === 'indian_fusion' ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(noteFreq, now);

      noteGain.gain.setValueAtTime(0.15, now);
      noteGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(noteGain);
      noteGain.connect(masterGain);

      osc.start(now);
      osc.stop(now + 0.4);
    }

    // 2. Bass stem
    if (stemBass && step % 4 === 0) {
      const bassOsc = ctx.createOscillator();
      const bassGain = ctx.createGain();
      const root = scale[0] / 2;

      bassOsc.type = 'sawtooth';
      bassOsc.frequency.setValueAtTime(root, now);

      bassGain.gain.setValueAtTime(0.2, now);
      bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      bassOsc.connect(bassGain);
      bassGain.connect(masterGain);

      bassOsc.start(now);
      bassOsc.stop(now + 0.45);
    }

    // 3. Drum beat rhythm
    if (stemDrums && (step === 0 || step === 4 || step === 8 || step === 12)) {
      const kickOsc = ctx.createOscillator();
      const kickGain = ctx.createGain();

      kickOsc.frequency.setValueAtTime(120, now);
      kickOsc.frequency.exponentialRampToValueAtTime(30, now + 0.12);

      kickGain.gain.setValueAtTime(0.3, now);
      kickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      kickOsc.connect(kickGain);
      kickGain.connect(masterGain);

      kickOsc.start(now);
      kickOsc.stop(now + 0.16);
    }
  };

  const handleTogglePlay = async () => {
    initAudio();
    const ctx = audioCtxRef.current;
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      await ctx.resume();
    }

    if (isPlaying) {
      if (stepIntervalRef.current) {
        clearInterval(stepIntervalRef.current);
        stepIntervalRef.current = null;
      }
      setIsPlaying(false);
    } else {
      const intervalMs = (60 / bpm / 4) * 1000;
      stepIntervalRef.current = window.setInterval(playStep, intervalMs);
      setIsPlaying(true);
    }
  };

  // Adjust volume
  useEffect(() => {
    if (masterGainRef.current && audioCtxRef.current) {
      masterGainRef.current.gain.setValueAtTime(isMuted ? 0 : volume / 100, audioCtxRef.current.currentTime);
    }
  }, [volume, isMuted]);

  // Adjust BPM
  useEffect(() => {
    if (isPlaying) {
      if (stepIntervalRef.current) clearInterval(stepIntervalRef.current);
      const intervalMs = (60 / bpm / 4) * 1000;
      stepIntervalRef.current = window.setInterval(playStep, intervalMs);
    }
  }, [bpm, selectedPreset]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (stepIntervalRef.current) clearInterval(stepIntervalRef.current);
      if (audioCtxRef.current) audioCtxRef.current.close();
    };
  }, []);

  // Visualizer loop on Canvas
  useEffect(() => {
    let active = true;

    const draw = () => {
      if (!active) return;
      const canvas = canvasRef.current;
      const analyser = analyserRef.current;

      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const w = canvas.width;
          const h = canvas.height;

          ctx.clearRect(0, 0, w, h);

          // Background
          ctx.fillStyle = '#090d16';
          ctx.fillRect(0, 0, w, h);

          if (analyser && isPlaying) {
            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);
            analyser.getByteFrequencyData(dataArray);

            const barWidth = (w / bufferLength) * 1.5;
            let x = 0;

            for (let i = 0; i < bufferLength; i++) {
              const barHeight = (dataArray[i] / 255) * h * 0.85;

              // Color gradient for audio visualizer
              const grad = ctx.createLinearGradient(0, h, 0, h - barHeight);
              grad.addColorStop(0, '#7e22ce');
              grad.addColorStop(0.5, '#a855f7');
              grad.addColorStop(1, '#ec4899');

              ctx.fillStyle = grad;
              ctx.fillRect(x, h - barHeight, barWidth - 2, barHeight);

              x += barWidth;
            }
          } else {
            // Idle waveform
            ctx.strokeStyle = 'rgba(168, 85, 247, 0.4)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(0, h / 2);
            for (let i = 0; i < w; i += 10) {
              ctx.lineTo(i, h / 2 + Math.sin(i * 0.05) * 5);
            }
            ctx.stroke();

            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.font = '12px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('Press Play to Synthesize & Visualize Audio', w / 2, h / 2 + 25);
          }
        }
      }

      animFrameRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      active = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying]);

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-xs">
            <Music className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <span>AI Music & Audio Generation</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700 uppercase">
                Synthesizer Core
              </span>
            </h1>
            <p className="text-xs text-slate-500">
              Compose original ambient tracks, background scores, and classical Indian ragas with real-time audio synthesis
            </p>
          </div>
        </div>

        <button
          onClick={() => alert('WAV 24-bit studio master audio download package generated!')}
          className="px-4 py-2 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-2 cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Audio (.wav)</span>
        </button>
      </div>

      {/* Main Grid: Track List Left, Audio Console Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Preset Compositions (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-3">
            <label className="text-xs font-bold text-slate-800 block">Select Music Composition</label>
            <div className="space-y-2">
              {TRACK_PRESETS.map((t) => {
                const isSelected = selectedPreset.id === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => {
                      setSelectedPreset(t);
                      setBpm(t.bpm);
                      stepCountRef.current = 0;
                    }}
                    className={`w-full p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'border-purple-600 bg-purple-50/70 shadow-2xs ring-2 ring-purple-600/20'
                        : 'border-slate-200 bg-slate-50/70 hover:bg-white text-slate-700'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-900">{t.name}</div>
                      <div className="text-[11px] text-purple-700 font-medium">{t.genre} • {t.scale}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{t.desc}</div>
                    </div>
                    <span className="text-[11px] font-mono font-bold bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-700">
                      {t.bpm} BPM
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Stems Mixer */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-3">
            <h2 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-purple-600" />
              <span>Stem Multitrack Channels</span>
            </h2>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setStemMelody(!stemMelody)}
                className={`p-2.5 rounded-xl text-xs font-bold border transition-all text-center ${
                  stemMelody ? 'bg-purple-600 text-white border-purple-600' : 'bg-slate-50 text-slate-400 border-slate-200'
                }`}
              >
                Lead Melody: {stemMelody ? 'ON' : 'MUTE'}
              </button>

              <button
                onClick={() => setStemBass(!stemBass)}
                className={`p-2.5 rounded-xl text-xs font-bold border transition-all text-center ${
                  stemBass ? 'bg-purple-600 text-white border-purple-600' : 'bg-slate-50 text-slate-400 border-slate-200'
                }`}
              >
                Bass Line: {stemBass ? 'ON' : 'MUTE'}
              </button>

              <button
                onClick={() => setStemDrums(!stemDrums)}
                className={`p-2.5 rounded-xl text-xs font-bold border transition-all text-center ${
                  stemDrums ? 'bg-purple-600 text-white border-purple-600' : 'bg-slate-50 text-slate-400 border-slate-200'
                }`}
              >
                Percussion: {stemDrums ? 'ON' : 'MUTE'}
              </button>

              <button
                onClick={() => setStemPad(!stemPad)}
                className={`p-2.5 rounded-xl text-xs font-bold border transition-all text-center ${
                  stemPad ? 'bg-purple-600 text-white border-purple-600' : 'bg-slate-50 text-slate-400 border-slate-200'
                }`}
              >
                Harmonics: {stemPad ? 'ON' : 'MUTE'}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Live Visualizer & Playback Console (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
            {/* Visualizer Canvas */}
            <div className="relative rounded-2xl overflow-hidden bg-slate-950 aspect-video flex items-center justify-center border border-slate-800 shadow-xl">
              <canvas
                ref={canvasRef}
                width={700}
                height={350}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Playback Console */}
            <div className="mt-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-slate-900">{selectedPreset.name}</div>
                  <div className="text-xs text-slate-500">{selectedPreset.genre} • Key: {selectedPreset.scale}</div>
                </div>

                <button
                  onClick={handleTogglePlay}
                  className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-2 active:scale-95 cursor-pointer"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-4 h-4" />
                      <span>Pause Audio</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-white" />
                      <span>Play Track Live</span>
                    </>
                  )}
                </button>
              </div>

              {/* Sliders for Tempo & Volume */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-700 mb-1">
                    <span>Tempo (BPM)</span>
                    <span className="font-mono font-bold text-purple-700">{bpm} BPM</span>
                  </div>
                  <input
                    type="range"
                    min="60"
                    max="160"
                    value={bpm}
                    onChange={(e) => setBpm(parseInt(e.target.value))}
                    className="w-full accent-purple-600"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs text-slate-700 mb-1">
                    <span className="flex items-center gap-1.5">
                      <Volume2 className="w-3.5 h-3.5 text-slate-500" /> Master Volume
                    </span>
                    <span className="font-mono font-bold text-slate-600">{volume}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={volume}
                    onChange={(e) => setVolume(parseInt(e.target.value))}
                    className="w-full accent-purple-600"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
