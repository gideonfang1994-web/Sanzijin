import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function generatePortraits() {
  const prompts = [
    {
      id: 'c1',
      prompt: "High-fidelity 2D digital painting of a brave young male knight named Aethelred. He has spiky brown hair, blue goggles on his forehead, a red scarf, and intricate blue and silver plate armor with mirror reflections. He holds a large glowing blue sword and a blue shield with a silver lion emblem. Semi-thick coating style, 3-stage lighting, vibrant colors, high saturation, white background."
    },
    {
      id: 'c2',
      prompt: "High-fidelity 2D digital painting of a cute young female sorceress named Elara. She has pink hair and green eyes. She wears a large purple wizard hat with gold stars and a crescent moon. She is holding a glowing star staff and an open magic book with arcane runes floating around. Purple and gold robes. Semi-thick coating style, magical glow effects, white background."
    },
    {
      id: 'c3',
      prompt: "High-fidelity 2D digital painting of an anthropomorphic fox ranger named Finn. He wears a green hood and dark brown leather armor with fine textures. He is holding a wooden bow with a silver arrow. Clever expression, fox ears visible. Forest theme, semi-thick coating style, professional lighting, white background."
    },
    {
      id: 'c4',
      prompt: "High-fidelity 2D digital painting of a mysterious assassin named Shadow-Step. He wears a dark hood and mask, with only glowing orange-red eyes visible. Black and red ninja-style armor with metallic plates. He is holding sharp daggers. Dark smoky atmosphere, semi-thick coating style, dramatic lighting, white background."
    }
  ];

  const results = [];
  for (const p of prompts) {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: p.prompt }] },
      config: { imageConfig: { aspectRatio: "3:4" } }
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        results.push({ id: p.id, data: `data:image/png;base64,${part.inlineData.data}` });
      }
    }
  }
  console.log(JSON.stringify(results));
}

generatePortraits();
