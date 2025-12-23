"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";

export async function generateAIResponse(message: string) {
    console.log("Key exists:", !!process.env.GOOGLE_GENERATIVE_AI_API_KEY);

    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
        throw new Error("Missing Google Generative AI API Key");
    }

    try {
        const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `You are an AI assistant for a goal-tracking app called "Alti".
        Your goal is to help users stay motivated and achieve their goals.
        Keep your responses concise, encouraging, and helpful.
        User message: ${message}`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Gemini API Error:", error);
        return "Sorry, I'm having trouble connecting to my brain right now. Please try again later.";
    }
}
