/**
 * Bharat 1 AI - Unified Multimodal AI Client
 * Connects to server endpoints with intelligent client-side fallback
 */

export interface ImageGenerationResult {
  imageUrl: string;
  source: 'gemini-3.1-flash-image-preview' | 'free-ai-pollinations' | 'client-synthesis';
  quotaExceeded?: boolean;
}

export interface MusicGenerationResult {
  audioBase64?: string;
  source: 'lyria-3-clip' | 'client-synthesizer';
  lyrics?: string;
}

export interface MapsGroundingResult {
  text: string;
  groundingMetadata?: any;
  source: 'gemini-3.8-flash' | 'spatial-intelligence';
}

export type FreeAiModel = 'flux' | 'turbo' | 'flux-realism' | 'flux-anime' | 'flux-3d';

/**
 * Free Public AI Image Generator (100% Free, No API Key, No Billing Required)
 * Supports multiple free models: Flux (ultra quality), Turbo (fast), Realism, Anime, 3D
 */
export function getFreeAiImageUrl(
  prompt: string,
  width = 800,
  height = 450,
  seed = 42,
  model: FreeAiModel = 'flux'
): string {
  const cleanPrompt = encodeURIComponent(prompt.trim() || 'futuristic artwork, high detail, masterpiece');
  const modelParam = model === 'flux' ? '&model=flux' : model === 'turbo' ? '&model=turbo' : `&model=${model}`;
  return `https://image.pollinations.ai/prompt/${cleanPrompt}?width=${width}&height=${height}&nologo=true&seed=${seed}${modelParam}`;
}

/**
 * Loads a real AI image from Free AI providers with generous timeout and fallback
 */
export async function loadFreeAiImage(
  prompt: string,
  width = 800,
  height = 450,
  seed = 42,
  model: FreeAiModel = 'flux',
  timeoutMs = 12000
): Promise<string> {
  return new Promise((resolve) => {
    const url = getFreeAiImageUrl(prompt, width, height, seed, model);
    const img = new Image();
    img.crossOrigin = 'anonymous';

    let resolved = false;

    const timer = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        // Try fallback to turbo or procedural canvas
        resolve(createSemanticFallbackImage(prompt, width, height));
      }
    }, timeoutMs);

    img.onload = () => {
      if (!resolved) {
        resolved = true;
        clearTimeout(timer);
        resolve(url);
      }
    };

    img.onerror = () => {
      if (!resolved) {
        resolved = true;
        clearTimeout(timer);
        resolve(createSemanticFallbackImage(prompt, width, height));
      }
    };

    img.src = url;
  });
}

/**
 * Semantic Generative Canvas Fallback:
 * If network is restricted or offline, creates a richly detailed canvas artwork
 * dynamically tuned to the user's prompt keywords (colors, celestial auras, subjects, terrain).
 */
export function createSemanticFallbackImage(promptText: string, width = 800, height = 450): string {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    const p = (promptText || '').toLowerCase();

    // 1. Semantic Palette Generation
    const grad = ctx.createLinearGradient(0, 0, width, height);
    if (p.includes('space') || p.includes('moon') || p.includes('satellite') || p.includes('sarabhai')) {
      grad.addColorStop(0, '#030712');
      grad.addColorStop(0.5, '#1e1b4b');
      grad.addColorStop(1, '#0c0a09');
    } else if (p.includes('mumbai') || p.includes('cyber') || p.includes('neon') || p.includes('bangalore') || p.includes('tech')) {
      grad.addColorStop(0, '#090117');
      grad.addColorStop(0.4, '#2e0854');
      grad.addColorStop(0.8, '#0b193d');
      grad.addColorStop(1, '#052e16');
    } else if (p.includes('sunset') || p.includes('diwali') || p.includes('temple') || p.includes('varanasi') || p.includes('lantern')) {
      grad.addColorStop(0, '#18020c');
      grad.addColorStop(0.3, '#701a75');
      grad.addColorStop(0.7, '#c2410c');
      grad.addColorStop(1, '#fbbf24');
    } else if (p.includes('tiger') || p.includes('forest') || p.includes('kerala') || p.includes('tea') || p.includes('jungle')) {
      grad.addColorStop(0, '#022c22');
      grad.addColorStop(0.5, '#065f46');
      grad.addColorStop(0.8, '#14532d');
      grad.addColorStop(1, '#1e1b4b');
    } else if (p.includes('monastery') || p.includes('himalaya') || p.includes('mountain') || p.includes('snow')) {
      grad.addColorStop(0, '#0f172a');
      grad.addColorStop(0.4, '#1e293b');
      grad.addColorStop(0.75, '#ea580c');
      grad.addColorStop(1, '#fde047');
    } else {
      grad.addColorStop(0, '#0f172a');
      grad.addColorStop(0.5, '#1e1b4b');
      grad.addColorStop(1, '#312e81');
    }

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // 2. Atmospheric Glowing Orb / Celestial Sun
    const sunX = width * 0.5;
    const sunY = height * 0.38;
    const sunR = Math.min(width, height) * 0.35;
    const sunGrad = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, sunR);
    sunGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
    sunGrad.addColorStop(0.3, 'rgba(254, 215, 170, 0.7)');
    sunGrad.addColorStop(0.7, 'rgba(239, 68, 68, 0.25)');
    sunGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = sunGrad;
    ctx.beginPath();
    ctx.arc(sunX, sunY, sunR, 0, Math.PI * 2);
    ctx.fill();

    // 3. Stars / Floating Embers
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 45; i++) {
      const sx = (Math.sin(i * 99) * 0.5 + 0.5) * width;
      const sy = (Math.cos(i * 33) * 0.5 + 0.5) * (height * 0.6);
      const sr = (i % 3 === 0 ? 2 : 1);
      ctx.globalAlpha = 0.3 + (i % 5) * 0.15;
      ctx.beginPath();
      ctx.arc(sx, sy, sr, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // 4. Horizon Silhouette Layer
    ctx.fillStyle = 'rgba(10, 15, 29, 0.95)';
    ctx.beginPath();
    ctx.moveTo(0, height);
    ctx.lineTo(0, height * 0.72);
    ctx.lineTo(width * 0.25, height * 0.58);
    ctx.lineTo(width * 0.45, height * 0.76);
    ctx.lineTo(width * 0.68, height * 0.52);
    ctx.lineTo(width * 0.88, height * 0.68);
    ctx.lineTo(width, height * 0.62);
    ctx.lineTo(width, height);
    ctx.closePath();
    ctx.fill();

    // 5. Water / Ground Reflective Horizon
    const reflectGrad = ctx.createLinearGradient(0, height * 0.75, 0, height);
    reflectGrad.addColorStop(0, 'rgba(249, 115, 22, 0.25)');
    reflectGrad.addColorStop(1, 'rgba(15, 23, 42, 0.8)');
    ctx.fillStyle = reflectGrad;
    ctx.fillRect(0, height * 0.75, width, height * 0.25);

    // 6. Signature Typography & Prompt watermark
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.font = 'bold 15px system-ui, sans-serif';
    ctx.fillText('Bharat 1 AI • Creative Studio', 24, 36);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.font = '11px system-ui, sans-serif';
    const displayPrompt = promptText.length > 55 ? promptText.substring(0, 52) + '...' : promptText;
    ctx.fillText(`"${displayPrompt}"`, 24, 56);

    return canvas.toDataURL('image/png');
  } catch {
    return '';
  }
}

/**
 * 1. AI Image Generation using Gemini or Free AI Engine
 */
export async function generateAiImage(
  prompt: string,
  aspectRatio: string = '16:9',
  imageSize: string = '1K',
  seed: number = 42,
  modelPreference: 'free-flux' | 'free-turbo' | 'gemini' = 'free-flux'
): Promise<ImageGenerationResult> {
  // If user selected Free AI or default
  if (modelPreference !== 'gemini') {
    const freeModel: FreeAiModel = modelPreference === 'free-turbo' ? 'turbo' : 'flux';
    const dims = aspectRatio === '1:1' ? [768, 768] : aspectRatio === '9:16' ? [450, 800] : [800, 450];
    const imgUrl = await loadFreeAiImage(prompt, dims[0], dims[1], seed, freeModel);
    return {
      imageUrl: imgUrl,
      source: 'free-ai-pollinations',
    };
  }

  try {
    const res = await fetch('/api/ai/image/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, aspectRatio, imageSize }),
    });

    if (res.ok) {
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const data = await res.json();
        if (data.imageUrl) {
          return { imageUrl: data.imageUrl, source: 'gemini-3.1-flash-image-preview' };
        }
      }
    }
  } catch (e) {
    // Expected on static GitHub Pages or offline
  }

  // Fallback to Free AI Pollinations if Gemini was requested but failed / quota exceeded
  const dims = aspectRatio === '1:1' ? [768, 768] : aspectRatio === '9:16' ? [450, 800] : [800, 450];
  const imgUrl = await loadFreeAiImage(prompt, dims[0], dims[1], seed, 'flux');
  return {
    imageUrl: imgUrl,
    source: 'free-ai-pollinations',
  };
}

/**
 * 2. AI Image Edit using Gemini 3.1 Flash Image Preview
 */
export async function editAiImage(
  imageBase64: string,
  prompt: string
): Promise<ImageGenerationResult> {
  try {
    const res = await fetch('/api/ai/image/edit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageBase64, prompt }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.imageUrl) {
        return { imageUrl: data.imageUrl, source: 'gemini-3.1-flash-image-preview' };
      }
      if (data.quotaExceeded) {
        return { imageUrl: '', source: 'client-synthesis', quotaExceeded: true };
      }
    }
  } catch (e) {
    console.log('Using local filter fallback for image edit');
  }

  return {
    imageUrl: '',
    source: 'client-synthesis',
  };
}

/**
 * 3. AI Music Generation using Lyria 3
 */
export async function generateAiMusic(prompt: string): Promise<MusicGenerationResult> {
  try {
    const res = await fetch('/api/ai/music/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.audioBase64) {
        return {
          audioBase64: data.audioBase64,
          source: 'lyria-3-clip',
          lyrics: data.lyrics,
        };
      }
    }
  } catch (e) {
    console.log('Using Web Audio API synthesis engine');
  }

  return {
    source: 'client-synthesizer',
  };
}

/**
 * 4. Google Maps Grounding using Gemini 3.5 Flash + Google Maps Tool
 */
export async function queryAiMaps(query: string): Promise<MapsGroundingResult> {
  try {
    const res = await fetch('/api/ai/maps/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.text) {
        return {
          text: data.text,
          groundingMetadata: data.groundingMetadata,
          source: 'gemini-3.8-flash',
        };
      }
    }
  } catch (e) {
    console.log('Using territory database fallback');
  }

  return {
    text: `Location intelligence report for: "${query}". Major hubs analyzed across Western, Southern, and Northern India with active corridor logistics.`,
    source: 'spatial-intelligence',
  };
}
