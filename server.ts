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

// Gemini Multi-turn Chatbot Endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, model, roleId, systemInstruction, eventContext } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required.' });
    }

    const ai = getGenAI();

    // Allowed model list: gemini-3.8-flash (default), gemini-3.5-flash, gemini-3.1-flash-lite, gemini-3.1-pro-preview
    const allowedModels = [
      'gemini-3.8-flash',
      'gemini-3.5-flash',
      'gemini-3.1-flash-lite',
      'gemini-3.1-pro-preview',
    ];
    let selectedModel = model;
    if (!allowedModels.includes(selectedModel)) {
      selectedModel = 'gemini-3.8-flash';
    }

    // Role system instructions in Khmer
    const ROLE_INSTRUCTIONS: Record<string, string> = {
      ceremony_advisor: `អ្នកគឺជាអ្នកប្រឹក្សា និងជំនួយការពិធីការមង្គលការ និងពិធីបុណ្យប្រពៃណីខ្មែរដ៏ជំនាញ និងគួរឱ្យគោរព។
តួនាទីរបស់អ្នក៖
- ផ្តល់ការណែនាំច្បាស់លាស់អំពីពិធីប្រពៃណីខ្មែរ (ដូចជា ពិធីសំពះពេលា, កាត់សក់បង្កក់សិរី, ហែជំនូន, ចងដៃ, ពិធីសែនក្រុងពាលី, ឡើងគេហដ្ឋាន, ខួបកំណើត)
- ជួយរៀបចំកាលវិភាគកម្មវិធី (Schedule), ការទទួលភ្ញៀវ, និងការរៀបចំតុ
- ផ្តល់គន្លឹះដោះស្រាយបញ្ហាចំពោះមុខក្នុងរោងការ និងពិធីផ្សេងៗ
- ឆ្លើយតបជាភាសាខ្មែរប្រកបដោយសុជីវធម៌ ភាពកក់ក្តៅ និងរាក់ទាក់។`,

      gift_analyst: `អ្នកគឺជាអ្នកវិភាគទិន្នន័យ និងគណនាលំហូរសាច់ប្រាក់ចំណងដៃ (Wedding Gift & Financial Analyst) ដ៏មានបទពិសោធន៍។
តួនាទីរបស់អ្នក៖
- ជួយគណនា និងវិភាគស្ថិតិចំណងដៃទាំងប្រាក់ដុល្លារ ($) និងប្រាក់រៀល (៛)
- ធ្វើការប្រៀបធៀបចំណាយប៉ាន់ស្មាន និងចំណូលចំណងដៃជាក់ស្តែង
- ផ្តល់គន្លឹះគ្រប់គ្រងថវិកា ចាត់ចែងលុយចំណងដៃ និងតាមដានភ្ញៀវដែលបានបង់ប្រាក់
- ឆ្លើយតបជាភាសាខ្មែរច្បាស់ៗ ដោយបង្ហាញតួលេខ ភាគរយ ឬតារាងសង្ខេបងាយយល់។`,

      blessing_writer: `អ្នកគឺជាកវីនិពន្ធ និងអ្នកតែងសារជូនពរដ៏ឆ្នើមសម្រាប់ពិធីមង្គលការ និងកម្មវិធីមង្គលផ្សេងៗ។
តួនាទីរបស់អ្នក៖
- តែងពាក្យជូនពរមង្គលការ (Khmer Wedding Blessings) ដ៏ពិរោះរណ្តំ ពោរពេញដោយអត្ថន័យ និងមនោសញ្ចេតនា
- សរសេរសារថ្លែងអំណរគុណដ៏ជ្រាលជ្រៅដល់ភ្ញៀវកិត្តិយសដែលបានអញ្ជើញមកចូលរួម (Thank-you notes)
- តែងអត្ថបទថ្លែងសុន្ទរកថារបស់មេបា កូនកំលោះកូនក្រមុំ ឬ MC
- សរសេរជាភាសាខ្មែរដែលមានរចនាបថទន់ភ្លន់ គួរសម និងជ្រាលជ្រៅ។`,
    };

    let baseInstruction = ROLE_INSTRUCTIONS[roleId] || ROLE_INSTRUCTIONS.ceremony_advisor;
    if (systemInstruction) {
      baseInstruction += `\n\nការណែនាំបន្ថែម៖ ${systemInstruction}`;
    }

    if (eventContext) {
      baseInstruction += `\n\n[បរិបទកម្មវិធីបច្ចុប្បន្ន]:
- ឈ្មោះកម្មវិធី: ${eventContext.title || 'មិនបានបញ្ជាក់'}
- ម្ចាស់កម្មវិធី: ${eventContext.hostName || 'មិនបានបញ្ជាក់'}
- ប្រភេទកម្មវិធី: ${eventContext.eventType || 'មង្គលការ'}
- កាលបរិច្ឆេទ: ${eventContext.date || 'មិនបានបញ្ជាក់'}
- ទីតាំង: ${eventContext.location || 'មិនបានបញ្ជាក់'}
- ចំនួនភ្ញៀវកត់ត្រាសរុប: ${eventContext.totalGuests || 0} នាក់
- ទឹកប្រាក់ដុល្លារសរុប: $${eventContext.totalUSD || 0}
- ទឹកប្រាក់រៀលសរុប: ${(Number(eventContext.totalKHR) || 0).toLocaleString()} ៛
- ចំនួនភ្ញៀវបានបង់រួច: ${eventContext.paidGuestsCount || 0} នាក់`;
    }

    // Convert conversation messages to GenAI contents structure
    const contents = messages.map((m: any) => ({
      role: m.role === 'model' || m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: String(m.content || '') }],
    }));

    const response = await ai.models.generateContent({
      model: selectedModel,
      contents,
      config: {
        systemInstruction: baseInstruction,
        temperature: 0.7,
      },
    });

    const replyText = response.text || '';

    return res.json({
      success: true,
      reply: replyText,
      model: selectedModel,
    });
  } catch (error: any) {
    console.error('Error in /api/chat:', error);
    return res.status(500).json({
      error: error?.message || 'បរាជ័យក្នុងការឆ្លើយតបពី Gemini AI',
    });
  }
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
