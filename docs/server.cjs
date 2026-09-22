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
app.post("/api/chat", async (req, res) => {
  try {
    const { messages, model, roleId, systemInstruction, eventContext } = req.body;
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "Messages array is required." });
    }
    const ai = getGenAI();
    const allowedModels = [
      "gemini-3.8-flash",
      "gemini-3.5-flash",
      "gemini-3.1-flash-lite",
      "gemini-3.1-pro-preview"
    ];
    let selectedModel = model;
    if (!allowedModels.includes(selectedModel)) {
      selectedModel = "gemini-3.8-flash";
    }
    const ROLE_INSTRUCTIONS = {
      ceremony_advisor: `\u17A2\u17D2\u1793\u1780\u1782\u17BA\u1787\u17B6\u17A2\u17D2\u1793\u1780\u1794\u17D2\u179A\u17B9\u1780\u17D2\u179F\u17B6 \u1793\u17B7\u1784\u1787\u17C6\u1793\u17BD\u1799\u1780\u17B6\u179A\u1796\u17B7\u1792\u17B8\u1780\u17B6\u179A\u1798\u1784\u17D2\u1782\u179B\u1780\u17B6\u179A \u1793\u17B7\u1784\u1796\u17B7\u1792\u17B8\u1794\u17BB\u178E\u17D2\u1799\u1794\u17D2\u179A\u1796\u17C3\u178E\u17B8\u1781\u17D2\u1798\u17C2\u179A\u178A\u17CF\u1787\u17C6\u1793\u17B6\u1789 \u1793\u17B7\u1784\u1782\u17BD\u179A\u17B1\u17D2\u1799\u1782\u17C4\u179A\u1796\u17D4
\u178F\u17BD\u1793\u17B6\u1791\u17B8\u179A\u1794\u179F\u17CB\u17A2\u17D2\u1793\u1780\u17D6
- \u1795\u17D2\u178F\u179B\u17CB\u1780\u17B6\u179A\u178E\u17C2\u1793\u17B6\u17C6\u1785\u17D2\u1794\u17B6\u179F\u17CB\u179B\u17B6\u179F\u17CB\u17A2\u17C6\u1796\u17B8\u1796\u17B7\u1792\u17B8\u1794\u17D2\u179A\u1796\u17C3\u178E\u17B8\u1781\u17D2\u1798\u17C2\u179A (\u178A\u17BC\u1785\u1787\u17B6 \u1796\u17B7\u1792\u17B8\u179F\u17C6\u1796\u17C7\u1796\u17C1\u179B\u17B6, \u1780\u17B6\u178F\u17CB\u179F\u1780\u17CB\u1794\u1784\u17D2\u1780\u1780\u17CB\u179F\u17B7\u179A\u17B8, \u17A0\u17C2\u1787\u17C6\u1793\u17BC\u1793, \u1785\u1784\u178A\u17C3, \u1796\u17B7\u1792\u17B8\u179F\u17C2\u1793\u1780\u17D2\u179A\u17BB\u1784\u1796\u17B6\u179B\u17B8, \u17A1\u17BE\u1784\u1782\u17C1\u17A0\u178A\u17D2\u178B\u17B6\u1793, \u1781\u17BD\u1794\u1780\u17C6\u178E\u17BE\u178F)
- \u1787\u17BD\u1799\u179A\u17C0\u1794\u1785\u17C6\u1780\u17B6\u179B\u179C\u17B7\u1797\u17B6\u1782\u1780\u1798\u17D2\u1798\u179C\u17B7\u1792\u17B8 (Schedule), \u1780\u17B6\u179A\u1791\u1791\u17BD\u179B\u1797\u17D2\u1789\u17C0\u179C, \u1793\u17B7\u1784\u1780\u17B6\u179A\u179A\u17C0\u1794\u1785\u17C6\u178F\u17BB
- \u1795\u17D2\u178F\u179B\u17CB\u1782\u1793\u17D2\u179B\u17B9\u17C7\u178A\u17C4\u17C7\u179F\u17D2\u179A\u17B6\u1799\u1794\u1789\u17D2\u17A0\u17B6\u1785\u17C6\u1796\u17C4\u17C7\u1798\u17BB\u1781\u1780\u17D2\u1793\u17BB\u1784\u179A\u17C4\u1784\u1780\u17B6\u179A \u1793\u17B7\u1784\u1796\u17B7\u1792\u17B8\u1795\u17D2\u179F\u17C1\u1784\u17D7
- \u1786\u17D2\u179B\u17BE\u1799\u178F\u1794\u1787\u17B6\u1797\u17B6\u179F\u17B6\u1781\u17D2\u1798\u17C2\u179A\u1794\u17D2\u179A\u1780\u1794\u178A\u17C4\u1799\u179F\u17BB\u1787\u17B8\u179C\u1792\u1798\u17CC \u1797\u17B6\u1796\u1780\u1780\u17CB\u1780\u17D2\u178F\u17C5 \u1793\u17B7\u1784\u179A\u17B6\u1780\u17CB\u1791\u17B6\u1780\u17CB\u17D4`,
      gift_analyst: `\u17A2\u17D2\u1793\u1780\u1782\u17BA\u1787\u17B6\u17A2\u17D2\u1793\u1780\u179C\u17B7\u1797\u17B6\u1782\u1791\u17B7\u1793\u17D2\u1793\u1793\u17D0\u1799 \u1793\u17B7\u1784\u1782\u178E\u1793\u17B6\u179B\u17C6\u17A0\u17BC\u179A\u179F\u17B6\u1785\u17CB\u1794\u17D2\u179A\u17B6\u1780\u17CB\u1785\u17C6\u178E\u1784\u178A\u17C3 (Wedding Gift & Financial Analyst) \u178A\u17CF\u1798\u17B6\u1793\u1794\u1791\u1796\u17B7\u179F\u17C4\u1792\u1793\u17CD\u17D4
\u178F\u17BD\u1793\u17B6\u1791\u17B8\u179A\u1794\u179F\u17CB\u17A2\u17D2\u1793\u1780\u17D6
- \u1787\u17BD\u1799\u1782\u178E\u1793\u17B6 \u1793\u17B7\u1784\u179C\u17B7\u1797\u17B6\u1782\u179F\u17D2\u1790\u17B7\u178F\u17B7\u1785\u17C6\u178E\u1784\u178A\u17C3\u1791\u17B6\u17C6\u1784\u1794\u17D2\u179A\u17B6\u1780\u17CB\u178A\u17BB\u179B\u17D2\u179B\u17B6\u179A ($) \u1793\u17B7\u1784\u1794\u17D2\u179A\u17B6\u1780\u17CB\u179A\u17C0\u179B (\u17DB)
- \u1792\u17D2\u179C\u17BE\u1780\u17B6\u179A\u1794\u17D2\u179A\u17C0\u1794\u1792\u17C0\u1794\u1785\u17C6\u178E\u17B6\u1799\u1794\u17C9\u17B6\u1793\u17CB\u179F\u17D2\u1798\u17B6\u1793 \u1793\u17B7\u1784\u1785\u17C6\u178E\u17BC\u179B\u1785\u17C6\u178E\u1784\u178A\u17C3\u1787\u17B6\u1780\u17CB\u179F\u17D2\u178F\u17C2\u1784
- \u1795\u17D2\u178F\u179B\u17CB\u1782\u1793\u17D2\u179B\u17B9\u17C7\u1782\u17D2\u179A\u1794\u17CB\u1782\u17D2\u179A\u1784\u1790\u179C\u17B7\u1780\u17B6 \u1785\u17B6\u178F\u17CB\u1785\u17C2\u1784\u179B\u17BB\u1799\u1785\u17C6\u178E\u1784\u178A\u17C3 \u1793\u17B7\u1784\u178F\u17B6\u1798\u178A\u17B6\u1793\u1797\u17D2\u1789\u17C0\u179C\u178A\u17C2\u179B\u1794\u17B6\u1793\u1794\u1784\u17CB\u1794\u17D2\u179A\u17B6\u1780\u17CB
- \u1786\u17D2\u179B\u17BE\u1799\u178F\u1794\u1787\u17B6\u1797\u17B6\u179F\u17B6\u1781\u17D2\u1798\u17C2\u179A\u1785\u17D2\u1794\u17B6\u179F\u17CB\u17D7 \u178A\u17C4\u1799\u1794\u1784\u17D2\u17A0\u17B6\u1789\u178F\u17BD\u179B\u17C1\u1781 \u1797\u17B6\u1782\u179A\u1799 \u17AC\u178F\u17B6\u179A\u17B6\u1784\u179F\u1784\u17D2\u1781\u17C1\u1794\u1784\u17B6\u1799\u1799\u179B\u17CB\u17D4`,
      blessing_writer: `\u17A2\u17D2\u1793\u1780\u1782\u17BA\u1787\u17B6\u1780\u179C\u17B8\u1793\u17B7\u1796\u1793\u17D2\u1792 \u1793\u17B7\u1784\u17A2\u17D2\u1793\u1780\u178F\u17C2\u1784\u179F\u17B6\u179A\u1787\u17BC\u1793\u1796\u179A\u178A\u17CF\u1786\u17D2\u1793\u17BE\u1798\u179F\u1798\u17D2\u179A\u17B6\u1794\u17CB\u1796\u17B7\u1792\u17B8\u1798\u1784\u17D2\u1782\u179B\u1780\u17B6\u179A \u1793\u17B7\u1784\u1780\u1798\u17D2\u1798\u179C\u17B7\u1792\u17B8\u1798\u1784\u17D2\u1782\u179B\u1795\u17D2\u179F\u17C1\u1784\u17D7\u17D4
\u178F\u17BD\u1793\u17B6\u1791\u17B8\u179A\u1794\u179F\u17CB\u17A2\u17D2\u1793\u1780\u17D6
- \u178F\u17C2\u1784\u1796\u17B6\u1780\u17D2\u1799\u1787\u17BC\u1793\u1796\u179A\u1798\u1784\u17D2\u1782\u179B\u1780\u17B6\u179A (Khmer Wedding Blessings) \u178A\u17CF\u1796\u17B7\u179A\u17C4\u17C7\u179A\u178E\u17D2\u178F\u17C6 \u1796\u17C4\u179A\u1796\u17C1\u1789\u178A\u17C4\u1799\u17A2\u178F\u17D2\u1790\u1793\u17D0\u1799 \u1793\u17B7\u1784\u1798\u1793\u17C4\u179F\u1789\u17D2\u1785\u17C1\u178F\u1793\u17B6
- \u179F\u179A\u179F\u17C1\u179A\u179F\u17B6\u179A\u1790\u17D2\u179B\u17C2\u1784\u17A2\u17C6\u178E\u179A\u1782\u17BB\u178E\u178A\u17CF\u1787\u17D2\u179A\u17B6\u179B\u1787\u17D2\u179A\u17C5\u178A\u179B\u17CB\u1797\u17D2\u1789\u17C0\u179C\u1780\u17B7\u178F\u17D2\u178F\u17B7\u1799\u179F\u178A\u17C2\u179B\u1794\u17B6\u1793\u17A2\u1789\u17D2\u1787\u17BE\u1789\u1798\u1780\u1785\u17BC\u179B\u179A\u17BD\u1798 (Thank-you notes)
- \u178F\u17C2\u1784\u17A2\u178F\u17D2\u1790\u1794\u1791\u1790\u17D2\u179B\u17C2\u1784\u179F\u17BB\u1793\u17D2\u1791\u179A\u1780\u1790\u17B6\u179A\u1794\u179F\u17CB\u1798\u17C1\u1794\u17B6 \u1780\u17BC\u1793\u1780\u17C6\u179B\u17C4\u17C7\u1780\u17BC\u1793\u1780\u17D2\u179A\u1798\u17BB\u17C6 \u17AC MC
- \u179F\u179A\u179F\u17C1\u179A\u1787\u17B6\u1797\u17B6\u179F\u17B6\u1781\u17D2\u1798\u17C2\u179A\u178A\u17C2\u179B\u1798\u17B6\u1793\u179A\u1785\u1793\u17B6\u1794\u1790\u1791\u1793\u17CB\u1797\u17D2\u179B\u1793\u17CB \u1782\u17BD\u179A\u179F\u1798 \u1793\u17B7\u1784\u1787\u17D2\u179A\u17B6\u179B\u1787\u17D2\u179A\u17C5\u17D4`
    };
    let baseInstruction = ROLE_INSTRUCTIONS[roleId] || ROLE_INSTRUCTIONS.ceremony_advisor;
    if (systemInstruction) {
      baseInstruction += `

\u1780\u17B6\u179A\u178E\u17C2\u1793\u17B6\u17C6\u1794\u1793\u17D2\u1790\u17C2\u1798\u17D6 ${systemInstruction}`;
    }
    if (eventContext) {
      baseInstruction += `

[\u1794\u179A\u17B7\u1794\u1791\u1780\u1798\u17D2\u1798\u179C\u17B7\u1792\u17B8\u1794\u1785\u17D2\u1785\u17BB\u1794\u17D2\u1794\u1793\u17D2\u1793]:
- \u1788\u17D2\u1798\u17C4\u17C7\u1780\u1798\u17D2\u1798\u179C\u17B7\u1792\u17B8: ${eventContext.title || "\u1798\u17B7\u1793\u1794\u17B6\u1793\u1794\u1789\u17D2\u1787\u17B6\u1780\u17CB"}
- \u1798\u17D2\u1785\u17B6\u179F\u17CB\u1780\u1798\u17D2\u1798\u179C\u17B7\u1792\u17B8: ${eventContext.hostName || "\u1798\u17B7\u1793\u1794\u17B6\u1793\u1794\u1789\u17D2\u1787\u17B6\u1780\u17CB"}
- \u1794\u17D2\u179A\u1797\u17C1\u1791\u1780\u1798\u17D2\u1798\u179C\u17B7\u1792\u17B8: ${eventContext.eventType || "\u1798\u1784\u17D2\u1782\u179B\u1780\u17B6\u179A"}
- \u1780\u17B6\u179B\u1794\u179A\u17B7\u1785\u17D2\u1786\u17C1\u1791: ${eventContext.date || "\u1798\u17B7\u1793\u1794\u17B6\u1793\u1794\u1789\u17D2\u1787\u17B6\u1780\u17CB"}
- \u1791\u17B8\u178F\u17B6\u17C6\u1784: ${eventContext.location || "\u1798\u17B7\u1793\u1794\u17B6\u1793\u1794\u1789\u17D2\u1787\u17B6\u1780\u17CB"}
- \u1785\u17C6\u1793\u17BD\u1793\u1797\u17D2\u1789\u17C0\u179C\u1780\u178F\u17CB\u178F\u17D2\u179A\u17B6\u179F\u179A\u17BB\u1794: ${eventContext.totalGuests || 0} \u1793\u17B6\u1780\u17CB
- \u1791\u17B9\u1780\u1794\u17D2\u179A\u17B6\u1780\u17CB\u178A\u17BB\u179B\u17D2\u179B\u17B6\u179A\u179F\u179A\u17BB\u1794: $${eventContext.totalUSD || 0}
- \u1791\u17B9\u1780\u1794\u17D2\u179A\u17B6\u1780\u17CB\u179A\u17C0\u179B\u179F\u179A\u17BB\u1794: ${(Number(eventContext.totalKHR) || 0).toLocaleString()} \u17DB
- \u1785\u17C6\u1793\u17BD\u1793\u1797\u17D2\u1789\u17C0\u179C\u1794\u17B6\u1793\u1794\u1784\u17CB\u179A\u17BD\u1785: ${eventContext.paidGuestsCount || 0} \u1793\u17B6\u1780\u17CB`;
    }
    const contents = messages.map((m) => ({
      role: m.role === "model" || m.role === "assistant" ? "model" : "user",
      parts: [{ text: String(m.content || "") }]
    }));
    const response = await ai.models.generateContent({
      model: selectedModel,
      contents,
      config: {
        systemInstruction: baseInstruction,
        temperature: 0.7
      }
    });
    const replyText = response.text || "";
    return res.json({
      success: true,
      reply: replyText,
      model: selectedModel
    });
  } catch (error) {
    console.error("Error in /api/chat:", error);
    return res.status(500).json({
      error: error?.message || "\u1794\u179A\u17B6\u1787\u17D0\u1799\u1780\u17D2\u1793\u17BB\u1784\u1780\u17B6\u179A\u1786\u17D2\u179B\u17BE\u1799\u178F\u1794\u1796\u17B8 Gemini AI"
    });
  }
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
