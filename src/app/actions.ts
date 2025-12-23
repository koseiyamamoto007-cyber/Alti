"use server";

import * as genai from "@google/genai";

export async function generateAIResponse(message: string) {
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
        throw new Error("Missing Google Generative AI API Key");
    }

    try {
        const genAI = new genai.GoogleGenAI({ apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY });

        let result;

        try {
            // Attempting to use Gemini 3.0 Flash Preview (Experimental/Free tier)
            // Name 'gemini-3-flash-preview' confirmed via models.list()
            result = await genAI.models.generateContent({
                model: "gemini-3-flash-preview",
                config: {
                    temperature: 0.3,
                    systemInstruction: {
                        parts: [
                            { text: "あなたは目標達成アプリ『Elevate Pro』の専属AIコーチです。ユーザーに対し、常に具体的で実行可能なアドバイスを行い、励ますようなトーンで対話してください。" }
                        ]
                    }
                },
                contents: [
                    {
                        role: "user",
                        parts: [
                            { text: message }
                        ]
                    }
                ]
            });
        } catch (modelError: any) {
            console.warn("Gemini 3.0 Flash Preview failed, falling back to 2.5 Flash:", modelError.message);
            // Fallback to gemini-2.5-flash
            result = await genAI.models.generateContent({
                model: "gemini-2.5-flash",
                config: {
                    temperature: 0.3,
                    systemInstruction: {
                        parts: [
                            { text: "あなたは目標達成アプリ『Elevate Pro』の専属AIコーチです。ユーザーに対し、常に具体的で実行可能なアドバイスを行い、励ますようなトーンで対話してください。" }
                        ]
                    }
                },
                contents: [
                    {
                        role: "user",
                        parts: [
                            { text: message }
                        ]
                    }
                ]
            });
        }

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
