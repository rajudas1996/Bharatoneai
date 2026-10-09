export type AspectRatio = '9:16' | '1:1' | '4:5' | '16:9';

export type ClipTransitionType = 
  | 'none' 
  | 'fade' 
  | 'dissolve' 
  | 'slide-left' 
  | 'slide-right' 
  | 'zoom-in' 
  | 'flash' 
  | 'blur';

export interface VideoClipItem {
  id: string;
  type: 'video' | 'image';
  name: string;
  url: string;
  duration: number; // in seconds
  volume: number; // 0 to 1
  isMuted: boolean;
  brightness: number; // -100 to 100
  contrast: number; // -100 to 100
  saturation: number; // -100 to 100
  temperature: number; // -100 to 100
  blur: number; // 0 to 20
  rotation: number; // 0, 90, 180, 270
  flipH: boolean;
  flipV: boolean;
  fit: 'cover' | 'contain' | 'fill';
  transition: ClipTransitionType;
  transitionDuration: number; // default 0.5s
  thumbnail?: string;
}

export interface AudioTrackItem {
  id: string;
  name: string;
  url: string;
  startTime: number; // seconds
  duration: number; // seconds
  volume: number; // 0 to 1
  isMuted: boolean;
  category?: string;
}

export interface TextOverlayItem {
  id: string;
  text: string;
  startTime: number; // seconds
  duration: number; // seconds
  x: number; // 0 - 100%
  y: number; // 0 - 100%
  fontSize: number; // px
  color: string;
  backgroundColor: string; // pill background, transparent if none
  fontFamily: string;
  fontWeight: string;
  animation: 'none' | 'fade' | 'bounce' | 'slide-up' | 'typewriter' | 'glow';
}

export interface StickerOverlayItem {
  id: string;
  content: string; // Emoji char or sticker text
  label: string;
  startTime: number; // seconds
  duration: number; // seconds
  x: number; // 0 - 100%
  y: number; // 0 - 100%
  scale: number; // 0.5 to 2.5
}
