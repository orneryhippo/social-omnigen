import { GoogleGenAI, Type, Schema } from "@google/genai";
import { GeneratedContent, ImageSize, AspectRatio } from "../types";

// Helper to get the AI client.
// Note: We create a NEW instance each time to ensure we pick up the latest API key
// if the user switches it via window.aistudio.
const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found. Please select an API key.");
  }
  return new GoogleGenAI({ apiKey });
};

export const generateSocialText = async (
  idea: string,
  tone: string
): Promise<GeneratedContent> => {
  const ai = getAiClient();
  
  const responseSchema: Schema = {
    type: Type.OBJECT,
    properties: {
      linkedin: {
        type: Type.OBJECT,
        properties: {
          text: { type: Type.STRING, description: "The post text content." },
          imagePrompt: { type: Type.STRING, description: "A detailed visual description for an image generator." },
        },
        required: ["text", "imagePrompt"],
      },
      twitter: {
        type: Type.OBJECT,
        properties: {
          text: { type: Type.STRING, description: "The post text content." },
          imagePrompt: { type: Type.STRING, description: "A detailed visual description for an image generator." },
        },
        required: ["text", "imagePrompt"],
      },
      instagram: {
        type: Type.OBJECT,
        properties: {
          text: { type: Type.STRING, description: "The post text content." },
          imagePrompt: { type: Type.STRING, description: "A detailed visual description for an image generator." },
        },
        required: ["text", "imagePrompt"],
      },
    },
    required: ["linkedin", "twitter", "instagram"],
  };

  const prompt = `
    You are a world-class social media manager.
    Generate 3 distinct social media posts based on the following idea: "${idea}".
    
    Tone: ${tone}.
    
    1. LinkedIn: Long-form, professional, insightful.
    2. Twitter/X: Short, punchy, under 280 chars, engaging.
    3. Instagram: Visual-focused caption, engaging hook, 15-20 relevant hashtags.
    
    For each platform, also write a highly detailed, creative image generation prompt that captures the essence of the post and fits the platform's aesthetic.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: responseSchema,
      // Using a higher thinking budget for better creativity in the copy
      thinkingConfig: { thinkingBudget: 1024 }, 
    },
  });

  const text = response.text;
  if (!text) {
    throw new Error("No text returned from Gemini.");
  }

  try {
    return JSON.parse(text) as GeneratedContent;
  } catch (e) {
    console.error("Failed to parse JSON", e);
    throw new Error("Failed to parse social content.");
  }
};

export const generateSocialImage = async (
  prompt: string,
  aspectRatio: AspectRatio,
  size: ImageSize
): Promise<string> => {
  const ai = getAiClient();

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-image-preview",
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio,
          imageSize: size,
        },
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    
    throw new Error("No image data found in response.");
  } catch (error) {
    console.error("Image generation error:", error);
    throw error;
  }
};
