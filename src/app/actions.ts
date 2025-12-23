"use server";

import * as genai from "@google/genai";

export async function generateAIResponse(message: string) {
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
        throw new Error("Missing Google Generative AI API Key");
    }

    try {
        const genAI = new genai.GoogleGenAI({ apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY });

        const prompt = `You are an AI assistant for a goal-tracking app called "Alti".
        Your goal is to help users stay motivated and achieve their goals.
        Keep your responses concise, encouraging, and helpful.
        User message: ${message}`;

        // Using gemini-2.5-flash as the latest stable model
        const result = await genAI.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [
                {
                    role: "user",
                    parts: [
                        { text: prompt }
                    ]
                }
            ]
        });

        // Debug log to understand response structure in Vercel if needed
        console.log("Gemini Response Keys:", Object.keys(result));

        // Attempt to extract text from response
        const candidates = result.candidates || (result as any).response?.candidates;
        const text = candidates?.[0]?.content?.parts?.[0]?.text;

        if (text) return text;

        // Fallback for different response structure
        // @ts-ignore
        if (typeof result.text === 'function') return result.text();

        return "AI response received but could not extract text.";

    } catch (error: any) {
        console.error("Gemini API Error:", {
            message: error.message,
            status: error.status,
            details: error
        });

        return `Sorry, I'm having trouble connecting to my brain right now. Error: ${error.message || "Unknown error"}`;
    }
}
