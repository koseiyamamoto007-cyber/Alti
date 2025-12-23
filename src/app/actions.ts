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

        const result = await genAI.models.generateContent({
            model: "gemini-2.0-flash",
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
        // @google/genai v1 typically returns the response object directly (result IS the response)
        // Check for common paths
        const candidates = result.candidates || (result as any).response?.candidates;
        const text = candidates?.[0]?.content?.parts?.[0]?.text;

        if (text) return text;

        // Fallback for different response structure (e.g. text() helper if it exists on result)
        // @ts-ignore
        if (typeof result.text === 'function') return result.text();

        return "AI response received but could not extract text.";

    } catch (error: any) {
        console.error("Gemini API Error (2.0):", {
            message: error.message,
            status: error.status,
            details: error
        });

        // Fallback to gemini-1.5-flash if 2.0 fails (e.g. 404 Not Found)
        if (error.message?.includes("404") || error.message?.includes("not found")) {
            console.log("Attempting fallback to gemini-1.5-flash...");
            try {
                // Re-initialize might not be needed if genAI instance is reused, but model needs change
                // Note: We need to use 'genai' namespace we imported
                const genAI = new genai.GoogleGenAI({ apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY });
                const fallbackResult = await genAI.models.generateContent({
                    model: "gemini-1.5-flash",
                    contents: [
                        {
                            role: "user",
                            parts: [{
                                text: `You are an AI assistant for a goal-tracking app called "Alti".
                            Your goal is to help users stay motivated and achieve their goals.
                            Keep your responses concise, encouraging, and helpful.
                            User message: ${message}`
                            }]
                        }
                    ]
                });

                const candidates = fallbackResult.candidates || (fallbackResult as any).response?.candidates;
                const text = candidates?.[0]?.content?.parts?.[0]?.text;
                if (text) return text + " (Note: Model 2.0 unavailable, using 1.5)";
            } catch (fallbackError: any) {
                console.error("Fallback Gemini API Error (1.5):", fallbackError);
            }
        }

        return `Sorry, I'm having trouble connecting to my brain right now. Error: ${error.message || "Unknown error"}`;
    }
}
