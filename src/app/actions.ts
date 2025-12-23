"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";

export async function generateAIResponse(message: string) {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error("Missing Gemini API Key");
    }

    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

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
