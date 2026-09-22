import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

// Handle __dirname safely for both ESM (dev) and CJS (prod build)
const currentDir = typeof __dirname !== 'undefined' ? __dirname : process.cwd();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini Client
let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY || '';
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Maps Grounding Endpoint using Gemini 2.5 Flash and googleMaps tool
app.post('/api/maps/grounding', async (req, res) => {
  try {
    const { query, location, eventContext } = req.body;

    if (!query || typeof query !== 'string' || !query.trim()) {
      return res.status(400).json({ error: 'Query parameter is required.' });
    }

    const ai = getGenAI();

    // Construct enriched prompt for Cambodian celebration / event venue exploration
    const prompt = `You are a helpful event venue and location assistant for Cambodian events (weddings, birthdays, housewarmings, and celebrations).
The user is asking for location and venue information: "${query.trim()}".
${eventContext ? `Context regarding the event: ${eventContext}` : ''}

Please provide accurate, helpful details about the place(s), including:
1. Official venue or place name
2. Accurate address and neighborhood / city
3. Key highlights (e.g. capacity, hall features, parking, accessibility, atmosphere)
4. Useful tips for hosts and guests attending.
Respond in clear, polite Khmer (with English venue names where appropriate).`;

    const requestConfig: Record<string, any> = {
      tools: [{ googleMaps: {} }],
    };

    if (
      location &&
      typeof location.latitude === 'number' &&
      typeof location.longitude === 'number' &&
      !isNaN(location.latitude) &&
      !isNaN(location.longitude)
    ) {
      requestConfig.toolConfig = {
        retrievalConfig: {
          latLng: {
            latitude: location.latitude,
            longitude: location.longitude,
          },
        },
      };
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: requestConfig,
    });

    const candidate = response.candidates?.[0];
    const groundingMetadata = candidate?.groundingMetadata;
    const groundingChunks = groundingMetadata?.groundingChunks || [];

    // Extract all Google Maps places and review snippets
    const places = groundingChunks
      .map((chunk: any) => chunk.maps)
      .filter(Boolean)
      .map((map: any) => ({
        title: map.title || 'ទីតាំង',
        uri: map.uri || '',
        address: map.address || '',
        placeAnswerSources: map.placeAnswerSources || null,
      }));

    return res.json({
      success: true,
      text: response.text || '',
      places,
      groundingChunks,
    });
  } catch (error: any) {
    console.error('Error generating Google Maps grounded response:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to retrieve Google Maps data.',
    });
  }
});

async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
});
