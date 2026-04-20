import { GoogleGenAI } from '@google/genai';

// Initialize the Gemini client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

// Converts a File to the base64 part expected by the GenAI SDK
async function fileToGenerativePart(file: File) {
  const base64EncodedDataPromise = new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  
  return {
    inlineData: {
      data: await base64EncodedDataPromise,
      mimeType: file.type
    }
  };
}

export async function parseReceipt(imageFile: File, promptText: string) {
  try {
    const imagePart = await fileToGenerativePart(imageFile);
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            imagePart as any,
            { text: promptText }
          ]
        }
      ]
    });
    
    const text = response.text || '';
    // Strip markdown fences
    const clean = text.replace(/```json|```/g, '').trim();
    return JSON.parse(clean);
  } catch (err: any) {
    console.error("Gemini Error:", err);
    throw new Error(err.message || 'Failed to parse receipt');
  }
}
