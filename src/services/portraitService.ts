import { GoogleGenAI } from "@google/genai";
import { SHOP_ITEMS } from "../constants";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const PORTRAIT_PROMPTS: Record<string, string> = {
  c1: "High-end 2D Cel-shaded digital painting of a brave young male knight named Aethelred. He has spiky blue-tinted hair, silver-blue plate armor with gold lion emblems. Chibi-proportioned, vibrant colors, clean line art, white background.",
  c2: "High-end 2D Cel-shaded digital painting of a cute young female sorceress named Elara. She has pink hair and a purple wizard hat with gold stars. She wears purple and gold robes. Chibi-proportioned, magical glow effects, clean line art, white background.",
  c3: "High-end 2D Cel-shaded digital painting of an anthropomorphic fox ranger named Finn. He wears a green hood and brown leather armor. Clever expression, fox ears visible. Chibi-proportioned, clean line art, white background.",
  c4: "High-end 2D Cel-shaded digital painting of a mysterious chibi assassin named Shadow-Step. He wears a dark grey hood and mask with glowing orange eyes, and a long red scarf flowing behind him. Dark ninja-style armor. Clean line art, dramatic lighting, white background."
};

export const PORTRAIT_FALLBACKS: Record<string, string> = {
  c1: "https://picsum.photos/seed/aethelred_cel/400/600",
  c2: "https://picsum.photos/seed/elara_cel/400/600",
  c3: "https://picsum.photos/seed/finn_cel/400/600",
  c4: "https://picsum.photos/seed/shadow_cel/400/600"
};

export async function generateCharacterPortrait(characterId: string, equippedItems: string[] = []): Promise<string | null> {
  let basePrompt = PORTRAIT_PROMPTS[characterId];
  if (!basePrompt) return null;

  // Add equipment details to the prompt for visual syncing
  const items = equippedItems.map(id => SHOP_ITEMS.find(i => i.id === id)).filter(Boolean);
  if (items.length > 0) {
    const itemDescriptions = items.map(i => i?.name).join(", ");
    basePrompt += ` He/She is equipped with: ${itemDescriptions}. The equipment should be clearly visible and integrated into the character design.`;
  } else {
    basePrompt += " He/She is NOT holding any weapons or extra gear.";
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: basePrompt }] },
      config: { imageConfig: { aspectRatio: "3:4" } }
    });

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }
  } catch (error: any) {
    console.error("Error generating portrait:", error);
    // If quota is exhausted (429), we return the fallback immediately
    if (error.status === 429 || error.message?.includes("quota")) {
      console.warn(`Quota exhausted for ${characterId}, using fallback.`);
      return PORTRAIT_FALLBACKS[characterId] || null;
    }
  }
  return PORTRAIT_FALLBACKS[characterId] || null;
}
