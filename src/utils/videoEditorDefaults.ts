import { VideoClipItem, AudioTrackItem, TextOverlayItem, StickerOverlayItem } from '../types/videoEditor.types';

// Preset sample stock clips (Images & Videos)
export const SAMPLE_STOCK_MEDIA: Omit<VideoClipItem, 'id'>[] = [
  {
    type: 'image',
    name: 'Mumbai Marine Drive Sunset',
    url: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=800&q=80',
    duration: 3.5,
    volume: 1,
    isMuted: false,
    brightness: 0,
    contrast: 10,
    saturation: 15,
    temperature: 10,
    blur: 0,
    rotation: 0,
    flipH: false,
    flipV: false,
    fit: 'cover',
    transition: 'dissolve',
    transitionDuration: 0.6,
  },
  {
    type: 'image',
    name: 'Bengaluru Tech Park Neon',
    url: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=800&q=80',
    duration: 3.0,
    volume: 1,
    isMuted: false,
    brightness: 5,
    contrast: 15,
    saturation: 20,
    temperature: -5,
    blur: 0,
    rotation: 0,
    flipH: false,
    flipV: false,
    fit: 'cover',
    transition: 'slide-left',
    transitionDuration: 0.5,
  },
  {
    type: 'image',
    name: 'Himalayan Mountain Peak',
    url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
    duration: 4.0,
    volume: 1,
    isMuted: false,
    brightness: 0,
    contrast: 0,
    saturation: 5,
    temperature: -10,
    blur: 0,
    rotation: 0,
    flipH: false,
    flipV: false,
    fit: 'cover',
    transition: 'zoom-in',
    transitionDuration: 0.6,
  },
  {
    type: 'image',
    name: 'Jaipur Palace Heritage',
    url: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=800&q=80',
    duration: 3.5,
    volume: 1,
    isMuted: false,
    brightness: 5,
    contrast: 10,
    saturation: 10,
    temperature: 15,
    blur: 0,
    rotation: 0,
    flipH: false,
    flipV: false,
    fit: 'cover',
    transition: 'flash',
    transitionDuration: 0.4,
  },
  {
    type: 'image',
    name: 'Modern Startup Team',
    url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
    duration: 3.0,
    volume: 1,
    isMuted: false,
    brightness: 0,
    contrast: 5,
    saturation: 0,
    temperature: 0,
    blur: 0,
    rotation: 0,
    flipH: false,
    flipV: false,
    fit: 'cover',
    transition: 'fade',
    transitionDuration: 0.5,
  }
];

// Preset Stock Music Library
export const SAMPLE_STOCK_AUDIO: { id: string; name: string; genre: string; duration: number }[] = [
  { id: 'audio-1', name: 'Energetic Reels Beat (128 BPM)', genre: 'Upbeat / Dance', duration: 18.0 },
  { id: 'audio-2', name: 'Lo-Fi Chill Sunset Glow', genre: 'Lo-Fi / Relaxing', duration: 24.0 },
  { id: 'audio-3', name: 'Bollywood Acoustic Vibes', genre: 'Indian Folk & Pop', duration: 20.0 },
  { id: 'audio-4', name: 'Cyberpunk Synthwave Pulse', genre: 'Electronic', duration: 16.0 },
  { id: 'audio-5', name: 'Corporate Tech Innovation', genre: 'Minimal / Modern', duration: 22.0 }
];

// Preset Emojis and Reels Stickers
export const STICKER_LIBRARY = [
  { emojiOrIcon: '🔥', label: 'Fire' },
  { emojiOrIcon: '✨', label: 'Sparkles' },
  { emojiOrIcon: '🚀', label: 'Rocket' },
  { emojiOrIcon: '💯', label: '100 Score' },
  { emojiOrIcon: '🇮🇳', label: 'India Flag' },
  { emojiOrIcon: '❤️', label: 'Heart' },
  { emojiOrIcon: '🎬', label: 'Clapper' },
  { emojiOrIcon: '⚡', label: 'Lightning' },
  { emojiOrIcon: '☕', label: 'Chai / Coffee' },
  { emojiOrIcon: '💼', label: 'Business' },
  { emojiOrIcon: '📈', label: 'Growth' },
  { emojiOrIcon: '🌟', label: 'Glowing Star' },
  { emojiOrIcon: '👏', label: 'Applause' },
  { emojiOrIcon: '🎉', label: 'Confetti' },
  { emojiOrIcon: '🎵', label: 'Music Notes' },
  { emojiOrIcon: 'Verified ✔️', label: 'Verified Badge' },
  { emojiOrIcon: 'NEW REEL 🔥', label: 'New Reel' },
  { emojiOrIcon: 'LINK IN BIO 🔗', label: 'Link in Bio' },
  { emojiOrIcon: 'TAP TO WATCH 👆', label: 'Tap to Watch' }
];

// Synthesizer helper to play real harmonic audio notes based on genre
class AudioSynthesizer {
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private intervalId: any = null;

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public playTrack(trackName: string, volume: number = 0.5) {
    this.stop();
    this.initCtx();
    if (!this.ctx) return;

    this.isPlaying = true;
    const ctx = this.ctx;
    let step = 0;

    // Musical scale sequences
    const chords = [
      [261.63, 329.63, 392.00], // C
      [220.00, 261.63, 329.63], // Am
      [174.61, 220.00, 261.63], // F
      [196.00, 246.94, 293.66], // G
    ];

    const playChord = () => {
      if (!this.isPlaying || !ctx) return;
      const now = ctx.currentTime;
      const currentChord = chords[step % chords.length];

      currentChord.forEach(freq => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = trackName.includes('Synth') ? 'sawtooth' : 'sine';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(volume * 0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.5);
      });

      // Percussion kick / click
      const kickOsc = ctx.createOscillator();
      const kickGain = ctx.createGain();
      kickOsc.type = 'triangle';
      kickOsc.frequency.setValueAtTime(120, now);
      kickOsc.frequency.exponentialRampToValueAtTime(0.01, now + 0.15);

      kickGain.gain.setValueAtTime(volume * 0.25, now);
      kickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      kickOsc.connect(kickGain);
      kickGain.connect(ctx.destination);
      kickOsc.start(now);
      kickOsc.stop(now + 0.15);

      step++;
    };

    playChord();
    this.intervalId = setInterval(playChord, 500); // 120 bpm eighth notes
  }

  public stop() {
    this.isPlaying = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}

export const audioSynth = new AudioSynthesizer();

// Initial Default Project for immediate interaction
export const getInitialClips = (): VideoClipItem[] => [
  {
    id: 'clip-1',
    type: 'image',
    name: 'Mumbai Marine Drive Sunset',
    url: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=800&q=80',
    duration: 3.5,
    volume: 1,
    isMuted: false,
    brightness: 0,
    contrast: 10,
    saturation: 15,
    temperature: 10,
    blur: 0,
    rotation: 0,
    flipH: false,
    flipV: false,
    fit: 'cover',
    transition: 'dissolve',
    transitionDuration: 0.6,
  },
  {
    id: 'clip-2',
    type: 'image',
    name: 'Bengaluru Tech Park Neon',
    url: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=800&q=80',
    duration: 3.5,
    volume: 1,
    isMuted: false,
    brightness: 5,
    contrast: 15,
    saturation: 20,
    temperature: -5,
    blur: 0,
    rotation: 0,
    flipH: false,
    flipV: false,
    fit: 'cover',
    transition: 'slide-left',
    transitionDuration: 0.5,
  },
  {
    id: 'clip-3',
    type: 'image',
    name: 'Himalayan Mountain Peak',
    url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
    duration: 4.0,
    volume: 1,
    isMuted: false,
    brightness: 0,
    contrast: 0,
    saturation: 5,
    temperature: -10,
    blur: 0,
    rotation: 0,
    flipH: false,
    flipV: false,
    fit: 'cover',
    transition: 'none',
    transitionDuration: 0.5,
  }
];

export const getInitialAudioTracks = (): AudioTrackItem[] => [
  {
    id: 'track-1',
    name: 'Energetic Reels Beat (128 BPM)',
    url: '',
    startTime: 0,
    duration: 11.0,
    volume: 0.8,
    isMuted: false,
    category: 'Upbeat / Dance'
  }
];

export const getInitialTextOverlays = (): TextOverlayItem[] => [
  {
    id: 'txt-1',
    text: 'BharatOne AI Studio ✨',
    startTime: 0.5,
    duration: 3.5,
    x: 50,
    y: 25,
    fontSize: 26,
    color: '#ffffff',
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    fontFamily: 'Inter, sans-serif',
    fontWeight: '800',
    animation: 'bounce'
  },
  {
    id: 'txt-2',
    text: 'Create Stunning Reels in Seconds 🚀',
    startTime: 4.0,
    duration: 3.2,
    x: 50,
    y: 75,
    fontSize: 20,
    color: '#ffd700',
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    fontFamily: 'Inter, sans-serif',
    fontWeight: '700',
    animation: 'slide-up'
  }
];

export const getInitialStickers = (): StickerOverlayItem[] => [
  {
    id: 'stk-1',
    content: '🔥',
    label: 'Fire',
    startTime: 1.0,
    duration: 4.0,
    x: 82,
    y: 22,
    scale: 1.4
  },
  {
    id: 'stk-2',
    content: 'Verified ✔️',
    label: 'Verified Badge',
    startTime: 4.5,
    duration: 3.5,
    x: 50,
    y: 84,
    scale: 1.1
  }
];
