
import { GoogleGenAI } from "@google/genai";

const MODEL_NAME = 'gemini-2.5-flash-image';

/**
 * Generates an initial brain visualization based on current neurochemical state.
 */
export const generateBrainStateImage = async (
  dopamine: number, 
  serotonin: number, 
  substance: string
): Promise<string> => {
  // Always create a new GoogleGenAI instance right before making an API call to ensure the latest API key is used.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = `
    A highly sophisticated, photorealistic 3D scientific visualization of a whole human brain, centered in the frame. 
    The view should be a side profile or 3/4 view, suspended in a dark void with digital data streams.
    
    Neurochemical status to visualize:
    - Dopamine receptors (frontal lobe area) are ${dopamine > 1 ? 'overstimulated and glowing intensely red' : dopamine < 0.5 ? 'dim and dark grey' : 'glowing with a healthy steady blue light'}.
    - Serotonin pathways (central brain) are ${serotonin > 1 ? 'bright' : serotonin < 0.5 ? 'fragmented and dark' : 'connected and flowing smoothly'}.
    
    The overall aesthetic should represent the effects of ${substance} on the brain.
    Cinematic lighting, 8k resolution, macro photography style, translucent brain tissue, HUD interface elements.
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image data generated");
  } catch (error) {
    console.error("Error generating brain state image:", error);
    throw error;
  }
};

/**
 * Edits an existing brain image based on user text prompt.
 */
export const editBrainImage = async (
  base64Image: string,
  userPrompt: string
): Promise<string> => {
  // Always create a new GoogleGenAI instance right before making an API call to ensure the latest API key is used.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Remove data URL prefix if present for the API call
  const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg);base64,/, '');

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: [
          {
            text: userPrompt,
          },
          {
            inlineData: {
              mimeType: 'image/png',
              data: cleanBase64,
            },
          },
        ],
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No edited image returned");
  } catch (error) {
    console.error("Error editing brain image:", error);
    throw error;
  }
};
