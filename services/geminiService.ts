import { GoogleGenAI } from "@google/genai";

// Initialize the Gemini client
// API Key is strictly from process.env.API_KEY as per guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_NAME = 'gemini-3-pro-preview';

export const chatWithGemini = async (
  message: string,
  history: { role: string; parts: { text: string }[] }[] = []
): Promise<string> => {
  try {
    const chat = ai.chats.create({
      model: MODEL_NAME,
      config: {
        systemInstruction: "You are BusyBot, an expert AI assistant for a textile shop called 'Busy Textile'. You help shop owners with inventory advice, fabric knowledge, sales trends analysis, and general business questions. Be concise, professional, and helpful.",
      },
      history: history,
    });

    const response = await chat.sendMessage({ message });
    return response.text || "I couldn't generate a response.";
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    throw new Error("Failed to communicate with Gemini.");
  }
};

export const analyzeImageWithGemini = async (base64Image: string, mimeType: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: [
            {
                text: "Analyze this image for a textile shop inventory system. Identify the material (e.g., Cotton, Silk), the likely pattern (e.g., Floral, Plain), color, and suggest a product name and short description. Format the output clearly."
            },
            {
                inlineData: {
                    mimeType: mimeType,
                    data: base64Image
                }
            }
        ]
      },
    });

    return response.text || "Could not analyze the image.";
  } catch (error) {
    console.error("Gemini Image Analysis Error:", error);
    throw new Error("Failed to analyze image.");
  }
};

// Helper to convert file to base64
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the Data-URL declaration (e.g., "data:image/jpeg;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = error => reject(error);
  });
};