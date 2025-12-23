const { GoogleGenAI } = require("@google/genai");

async function listModels() {
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
        console.error("Missing API Key");
        return;
    }

    try {
        const genAI = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY });
        const response = await genAI.models.list();
        console.log("Response:", response);
    } catch (error) {
        console.error("Error listing models:", error);
    }
}

listModels();
