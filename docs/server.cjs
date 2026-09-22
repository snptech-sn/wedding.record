var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_vite = require("vite");
var import_genai = require("@google/genai");
var import_dotenv = __toESM(require("dotenv"), 1);
import_dotenv.default.config();
var currentDir = typeof __dirname !== "undefined" ? __dirname : process.cwd();
var app = (0, import_express.default)();
var PORT = 3e3;
app.use(import_express.default.json());
var aiClient = null;
function getGenAI() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY || "";
    aiClient = new import_genai.GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build"
        }
      }
    });
  }
  return aiClient;
}
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: (/* @__PURE__ */ new Date()).toISOString() });
});
app.post("/api/maps/grounding", async (req, res) => {
  try {
    const { query, location, eventContext } = req.body;
    if (!query || typeof query !== "string" || !query.trim()) {
      return res.status(400).json({ error: "Query parameter is required." });
    }
    const ai = getGenAI();
    const prompt = `You are a helpful event venue and location assistant for Cambodian events (weddings, birthdays, housewarmings, and celebrations).
The user is asking for location and venue information: "${query.trim()}".
${eventContext ? `Context regarding the event: ${eventContext}` : ""}

Please provide accurate, helpful details about the place(s), including:
1. Official venue or place name
2. Accurate address and neighborhood / city
3. Key highlights (e.g. capacity, hall features, parking, accessibility, atmosphere)
4. Useful tips for hosts and guests attending.
Respond in clear, polite Khmer (with English venue names where appropriate).`;
    const requestConfig = {
      tools: [{ googleMaps: {} }]
    };
    if (location && typeof location.latitude === "number" && typeof location.longitude === "number" && !isNaN(location.latitude) && !isNaN(location.longitude)) {
      requestConfig.toolConfig = {
        retrievalConfig: {
          latLng: {
            latitude: location.latitude,
            longitude: location.longitude
          }
        }
      };
    }
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: requestConfig
    });
    const candidate = response.candidates?.[0];
    const groundingMetadata = candidate?.groundingMetadata;
    const groundingChunks = groundingMetadata?.groundingChunks || [];
    const places = groundingChunks.map((chunk) => chunk.maps).filter(Boolean).map((map) => ({
      title: map.title || "\u1791\u17B8\u178F\u17B6\u17C6\u1784",
      uri: map.uri || "",
      address: map.address || "",
      placeAnswerSources: map.placeAnswerSources || null
    }));
    return res.json({
      success: true,
      text: response.text || "",
      places,
      groundingChunks
    });
  } catch (error) {
    console.error("Error generating Google Maps grounded response:", error);
    return res.status(500).json({
      error: error?.message || "Failed to retrieve Google Maps data."
    });
  }
});
async function start() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}
start().catch((err) => {
  console.error("Failed to start server:", err);
});
//# sourceMappingURL=server.cjs.map
