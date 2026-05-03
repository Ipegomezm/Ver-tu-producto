import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface ProductDNA {
  name: string;
  visualIdentity: string;
  colorPalette: string[];
  materials: string;
  uniqueMarkers: string;
}

export async function synthesizeProductDNA(description: string): Promise<ProductDNA> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Analyze this product description and synthesize a precise "Visual DNA" for high-consistency AI image generation. 
    Description: "${description}"
    
    Focus on:
    1. A unique, recognizable shape.
    2. Specific materials (e.g., brushed magnesium, translucent amber glass).
    3. A clear color palette.
    4. Unique visual markers (e.g., a specific circular vent pattern, a glowing blue ring).
    
    Ensure NO PEOPLE are described in the visual identity.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          visualIdentity: { type: Type.STRING },
          colorPalette: { type: Type.ARRAY, items: { type: Type.STRING } },
          materials: { type: Type.STRING },
          uniqueMarkers: { type: Type.STRING },
        },
        required: ["name", "visualIdentity", "colorPalette", "materials", "uniqueMarkers"],
      },
    },
  });

  return JSON.parse(response.text);
}

export async function generateMediumPrompt(dna: ProductDNA, medium: 'billboard' | 'newspaper' | 'social'): Promise<string> {
  const context = `Product: ${dna.name}. Visual Identity: ${dna.visualIdentity}. Materials: ${dna.materials}. Unique Markers: ${dna.uniqueMarkers}.`;
  
  const mediumSpecifics = {
    billboard: "A massive, high-impact outdoor billboard in a clean urban environment. wide-angle shot, professional commercial photography, high quality. The product is the absolute hero.",
    newspaper: "A high-contrast editorial photograph for a luxury newspaper advertisement. Crisp, focused, elegant composition. Noir or clean black and white aesthetic, high-end print look.",
    social: "A sharp, lifestyle-centric product shot for social media. Modern, minimalist, studio lighting with depth of field. Professional product staging."
  };

  return `A ${mediumSpecifics[medium]}. 
  The subject is: ${dna.name}, which is ${dna.visualIdentity}. 
  It features ${dna.materials} and ${dna.uniqueMarkers}. 
  Color palette: ${dna.colorPalette.join(", ")}. 
  STRICT CONSTRAINT: Absolute NO PEOPLE, NO HUMANS, NO FACES in the frame. Only the product and the environment. 
  Maintain absolute product consistency.`;
}

export async function generateBrandImage(prompt: string): Promise<string> {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-image",
    contents: {
      parts: [{ text: prompt }],
    },
    config: {
      imageConfig: {
        aspectRatio: prompt.includes("billboard") ? "16:9" : "1:1",
      },
    },
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  throw new Error("Failed to generate image part");
}
