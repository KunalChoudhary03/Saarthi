const { GoogleGenAI } = require( "@google/genai");

const ai = new GoogleGenAI({
    
}); 

async function generateprompt(chatHistory){
  
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    system: "You are Saarthi, an AI assistant that helps users by answering their queries in a concise and informative manner.",
    contents: chatHistory,
  });
  return response.text;
}

module.exports = generateprompt;