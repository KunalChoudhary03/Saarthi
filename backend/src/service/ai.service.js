const { GoogleGenAI } = require("@google/genai");

const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

if (!apiKey) {
  throw new Error("Missing GEMINI_API_KEY (or GOOGLE_API_KEY) in environment.");
}

const ai = new GoogleGenAI({
  apiKey
});

async function generateprompt(chatHistory){
  
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: chatHistory,
  });
  return response.text;
}

module.exports = generateprompt;