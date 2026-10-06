import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, GenerateVideosOperation } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const port = 3000;

app.use(express.json({ limit: '50mb' }));

const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', hasApiKey: !!apiKey });
});

// 1. Image Generation endpoint (gemini-3.1-flash-image)
app.post('/api/ai/image/generate', async (req, res) => {
  try {
    const { prompt, aspectRatio = '16:9' } = req.body;
    if (!prompt) {
      res.status(400).json({ error: 'Prompt is required' });
      return;
    }

    if (!apiKey) {
      res.status(503).json({ error: 'GEMINI_API_KEY not configured on server' });
      return;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-image',
      contents: prompt,
      config: {
        imageConfig: {
          aspectRatio: aspectRatio as any,
          imageSize: '1K',
        },
      },
    });

    let imageUrl = '';
    const parts = response.candidates?.[0]?.content?.parts || [];
    for (const part of parts) {
      if (part.inlineData?.data) {
        imageUrl = `data:image/png;base64,${part.inlineData.data}`;
        break;
      }
    }

    res.json({ imageUrl, text: response.text });
  } catch (err: any) {
    console.error('Image generation error:', err);
    res.status(500).json({ error: err.message || 'Failed to generate image' });
  }
});

// 2. Image Editing endpoint (gemini-3.1-flash-image)
app.post('/api/ai/image/edit', async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/png', prompt } = req.body;
    if (!imageBase64 || !prompt) {
      res.status(400).json({ error: 'Both imageBase64 and prompt are required' });
      return;
    }

    if (!apiKey) {
      res.status(503).json({ error: 'GEMINI_API_KEY not configured on server' });
      return;
    }

    const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: cleanBase64,
              mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
    });

    let imageUrl = '';
    const parts = response.candidates?.[0]?.content?.parts || [];
    for (const part of parts) {
      if (part.inlineData?.data) {
        imageUrl = `data:image/png;base64,${part.inlineData.data}`;
        break;
      }
    }

    res.json({ imageUrl, text: response.text });
  } catch (err: any) {
    console.error('Image edit error:', err);
    res.status(500).json({ error: err.message || 'Failed to edit image' });
  }
});

// 3. Music Generation endpoint (lyria-3-clip-preview)
app.post('/api/ai/music/generate', async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      res.status(400).json({ error: 'Prompt is required' });
      return;
    }

    if (!apiKey) {
      res.status(503).json({ error: 'GEMINI_API_KEY not configured on server' });
      return;
    }

    const responseStream = await ai.models.generateContentStream({
      model: 'lyria-3-clip-preview',
      contents: prompt,
    });

    let audioBase64 = '';
    let lyrics = '';
    let mimeType = 'audio/wav';

    for await (const chunk of responseStream) {
      const parts = chunk.candidates?.[0]?.content?.parts;
      if (!parts) continue;
      for (const part of parts) {
        if (part.inlineData?.data) {
          if (!audioBase64 && part.inlineData.mimeType) {
            mimeType = part.inlineData.mimeType;
          }
          audioBase64 += part.inlineData.data;
        }
        if (part.text && !lyrics) {
          lyrics = part.text;
        }
      }
    }

    res.json({ audioBase64, mimeType, lyrics });
  } catch (err: any) {
    console.error('Music generation error:', err);
    res.status(500).json({ error: err.message || 'Failed to generate music' });
  }
});

// 4. Video Generation endpoint (Veo 3.1)
app.post('/api/ai/video/generate', async (req, res) => {
  try {
    const { prompt, aspectRatio = '16:9' } = req.body;
    if (!prompt) {
      res.status(400).json({ error: 'Prompt is required' });
      return;
    }

    if (!apiKey) {
      res.status(503).json({ error: 'GEMINI_API_KEY not configured on server' });
      return;
    }

    // Call Veo model
    const operation = await ai.models.generateVideos({
      model: 'veo-3.1-generate-preview',
      prompt,
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: aspectRatio as any,
      },
    });

    res.json({ operationName: operation.name });
  } catch (err: any) {
    console.error('Video generation error:', err);
    res.status(500).json({ error: err.message || 'Failed to generate video' });
  }
});

// 5. Maps Grounding endpoint (gemini-3.5-flash with googleMaps tool)
app.post('/api/ai/maps/query', async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) {
      res.status(400).json({ error: 'Query is required' });
      return;
    }

    if (!apiKey) {
      res.status(503).json({ error: 'GEMINI_API_KEY not configured on server' });
      return;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: query,
      config: {
        tools: [{ googleMaps: {} }],
      },
    });

    const grounding = response.candidates?.[0]?.groundingMetadata;

    res.json({
      text: response.text,
      groundingMetadata: grounding,
    });
  } catch (err: any) {
    console.error('Maps query error:', err);
    res.status(500).json({ error: err.message || 'Failed to execute maps query' });
  }
});

// Mount Vite middleware in development
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
    app.get('*', (req, res) => {
      res.sendFile('dist/index.html', { root: '.' });
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Bharat 1 AI Server running at http://localhost:${port}`);
  });
}

startServer();
