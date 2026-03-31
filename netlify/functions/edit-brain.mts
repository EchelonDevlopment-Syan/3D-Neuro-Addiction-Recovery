import type { Context, Config } from "@netlify/functions";
import { GoogleGenAI } from "@google/genai";

const MODEL_NAME = "gemini-2.5-flash-image";

export default async (req: Request, context: Context) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const { base64Image, userPrompt } = await req.json();

  const ai = new GoogleGenAI({ apiKey: Netlify.env.get("GEMINI_API_KEY") });

  const cleanBase64 = base64Image.replace(
    /^data:image\/(png|jpeg|jpg);base64,/,
    ""
  );

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: [
          { text: userPrompt },
          {
            inlineData: {
              mimeType: "image/png",
              data: cleanBase64,
            },
          },
        ],
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return Response.json({
          imageData: `data:image/png;base64,${part.inlineData.data}`,
        });
      }
    }

    return Response.json({ error: "No edited image returned" }, { status: 500 });
  } catch (error) {
    console.error("Error editing brain image:", error);
    return Response.json(
      { error: "Failed to edit brain image" },
      { status: 500 }
    );
  }
};

export const config: Config = {
  path: "/api/edit-brain",
};
