import { GoogleGenAI } from "@google/genai";
import { SHOP_ITEMS } from "../constants";

let aiInstance: GoogleGenAI | null = null;

const getAi = () => {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY || "";
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
};

import knightAethelred from '../assets/images/knight_aethelred_1780235368291.png';
import witchElara from '../assets/images/witch_elara_1780235388581.png';
import rangerFinn from '../assets/images/ranger_finn_1780235407692.png';
import assassinShadow from '../assets/images/assassin_shadow_1780235432735.png';

export const BASELINE_CHARACTER_DESCRIPTIONS: Record<string, string> = {
  c1: "STUNNING ultra high-definition masterwork 2D digital anime illustration of a brave young male chibi knight named Aethelred. He has spiky silver-blue hair and charming bright blue eyes. He is wearing a simple basic light-gray training tunic with simple trousers.",
  c2: "STUNNING ultra high-definition masterwork 2D digital anime illustration of a cute young chibi sorceress named Elara. She has long flowing pastel pink hair and big energetic pink eyes. She is wearing a simple basic pink civilian gown.",
  c3: "STUNNING ultra high-definition masterwork 2D digital anime illustration of an anthropomorphic cute young fox ranger named Finn. He has pointy fox ears, fluffy brown cheeks, a clever smile, and a puffy orange-and-white tail, wearing a basic brown traveler shirt and basic boots.",
  c4: "STUNNING ultra high-definition masterwork 2D digital anime illustration of a mysterious chibi assassin apprentice named Shadow-Step. He has spiked black hair and cool sharp amber eyes, wearing a simple basic dark-grey sleeveless top and trousers."
};

export const ITEM_VISUAL_MAP: Record<string, string> = {
  // Aethelred (Warrior - c1)
  '破魔者之剑': 'carrying a sleek silver iron sword with red runic inscriptions on the hilt, gleaming with pure magic energy in his right hand',
  '勇气头盔': 'wearing a polished silver-blue knight steel helmet with a golden lion crest on top',
  '狮心盾': 'carrying a heavy brass heater shield decorated with an embossed glowing golden lion emblem in his left hand',
  '钢铁护肩': 'wearing heavy masterwork steel shoulder pauldrons with protective protective spikes',
  '炎龙重剑': 'carrying a massive masterwork crystalline greatsword radiating crackling ruby flames and fire embers in his right hand',
  '皇家卫队蓝甲': 'wearing royal blue steel plating chest plate armor adorned with royal gold ornaments',
  '不屈誓言巨盾': 'carrying a majestic giant white iron shield shaped like a fortress wall emitting safe holy halos in his left hand',
  '弑神圣光巨剑': 'holding a legendary gold-and-white broadsword of bright halos radiating pure blinding lasers in his right hand',
  '泰坦神域重甲': 'wearing an ultra-premium heavy gray plate cosmic suit decorated with cosmic star engravings and glowing blue runes',

  // Elara (Mage - c2)
  '星辰法杖': 'holding a glowing wizard cedar staff crowned with a floating light-blue star gem emitting starry particles in her right hand',
  '星光法帽': 'wearing a tall pointed purple wizard star hat decorated with glowing yellow starchief constellations',
  '星光披风': 'wearing a flowing mystical cape showing dynamic outer space galaxy nebulae on the fabric over her shoulders',
  '法术魔典': 'holding an ancient leather-bound elemental spellbook with glowing magic runes on the cover in her left hand',
  '虚空秘典': 'holding a dark mystical black hole grimoire that hovers above her left hand emitting starlight violet sparks',
  '高阶法袍': 'wearing royal high-rank violet silk witch garments detailed with brilliant silver wizard stitchings',
  '潮汐圣歌法杖': 'holding a gorgeous pearlescent seaglass sceptre with a spiralling water-shell crystal in her right hand',
  '混沌天演魔杖': 'holding a divine staff topped with floating orbital cosmic dust rings and small star portals in her right hand',
  '星界不灭神袍': 'wearing a breathtaking majestic pastel-pink divine goddess dress glowing with northern lights and safe stardust aura',

  // Finn (Ranger - c3)
  '森之弓': 'holding a vibrant recurve longbow crafted from bright green living woodland branches in his hand',
  '森林兜帽': 'wearing a cozy leaf-woven hunter cowl hood with cute small woodland flowers on the rim',
  '鹰眼箭袋': 'carrying a detailed leather arrow quiver stuffed with colorful eagle-feathers arrows on his back',
  '疾风靴': 'wearing light green scout boots decorated with tiny wings and emerald breeze feathers on his feet',
  '秘银轻弩': 'holding a precision-engineered mithril hand crossbow detailed with golden wings in his hand',
  '游侠皮甲套装': 'wearing a leafy camo combat leather armor vest suited for jungle shadows',
  '月影追风长弓': 'holding a silver crystal crescent-styled woodland bow that illuminates soft blue moonbeam rays in his hand',
  '神树万物长弓': 'holding an epic archery wooden longbow grown out of active green leaves and thick golden roots in his hand',
  '疾风虚空轻甲': 'wearing lightweight purple translucent phantom-like armor wrapping his torso and legs',

  // Shadow-Step (Assassin - c4)
  '刺客短刃': 'holding a dark obsidian combat dagger with sleek neon violet fumes in his hand',
  '影杀面具': 'wearing a black porcelain mask with sharp fox-eyes and mysterious dark markings over his face',
  '毒蝎手里剑': 'holding dual glowing toxic-green metal throwing star shurikens in his left hand',
  '血月暗黑双刃': 'holding twin curved crimson steel daggers dripping with bloody shadow embers in his hands',
  '潜行长靴': 'wearing black leather master boots wrapped with quiet shadowy steam',
  '夜行隐杀轻装': 'wearing a compressed dark ninja wraps suit with detailed blood-red belt line',
  '暗影斗篷': 'wearing a magical flowy black shadow cape that dynamically dissolves into black mist at the bottom over his back',
  '天诛无影神刃': 'holding brilliant ethereal twin sky-blue glass daggers humming with active windstorms in his hands',
  '寂灭影流神装': 'wearing legendary ninja champion black plate mail with shining neon orange ninja energy streams'
};

export const PORTRAIT_PROMPTS: Record<string, string> = {
  c1: "STUNNING ultra high-definition masterwork 2D digital anime illustration of a brave young male chibi warrior knight named Aethelred. He has spiky silver-blue hair, shining crystalline silver-blue plate armor adorned with radiant golden lion symbols. Epic lighting, sharp crisp lines, 8K resolution, masterpiece quality, sharp focus, clean white background.",
  c2: "STUNNING ultra high-definition masterwork 2D digital anime illustration of a cute young chibi sorceress named Elara. She has long flowing pastel pink hair, a matching magical wizard hat adorned with glowing golden stars, and elegant purple and gold wizard robes. Cosmic magic runes glowing, 8K resolution, masterpiece quality, sharp focus, clean white background.",
  c3: "STUNNING ultra high-definition masterwork 2D digital anime illustration of an anthropomorphic fox ranger named Finn. He wears a forest green hood, light leather armor, and brown leather boots. Clever smile, cute fox ears and a fluffy tail, vibrant jungle breeze, crisp sharp focus, 8K resolution, masterpiece quality, clean white background.",
  c4: "STUNNING ultra high-definition masterwork 2D digital anime illustration of a mysterious chibi assassin named Shadow-Step. He wears a sleek shadow hood and face covering mask with glowing yellow-orange eyes, and a long dynamic crimson red scarf flowing behind him. Mystical shadow embers, 8K resolution, masterpiece quality, sharp focus, clean white background."
};

export const PORTRAIT_FALLBACKS: Record<string, string> = {
  c1: knightAethelred,
  c2: witchElara,
  c3: rangerFinn,
  c4: assassinShadow
};

export async function generateCharacterPortrait(
  characterId: string, 
  equippedItems: string[] = [], 
  petNames: string[] = []
): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY || "";
  
  // If no equipment/pets are worn and there is no API key available, return default pre-rendered backup
  if (equippedItems.length === 0 && petNames.length === 0 && !apiKey) {
    return PORTRAIT_FALLBACKS[characterId] || null;
  }

  let basePrompt = "";
  const baseDescription = BASELINE_CHARACTER_DESCRIPTIONS[characterId];
  const items = equippedItems.map(id => SHOP_ITEMS.find(i => i.id === id)).filter(Boolean);

  if (items.length > 0 && baseDescription) {
    const itemDescriptions = items.map(item => {
      if (item && item.name && ITEM_VISUAL_MAP[item.name]) {
        return ITEM_VISUAL_MAP[item.name];
      }
      return item ? `equipped with ${item.name}` : "";
    }).filter(Boolean).join(", ");

    basePrompt = `${baseDescription} Now, the character is dressed for battle! Instead of basic clothes, he/she is beautifully equipped with: ${itemDescriptions}. These gears must be drawn extremely clearly, in pristine detail, and seamlessly integrated into the character's clothing and pose.`;
  } else {
    basePrompt = baseDescription || PORTRAIT_PROMPTS[characterId] || "";
  }

  const ai = getAi();

  // Add pet details to the prompt if they have been obtained
  if (petNames.length > 0) {
    const petList = petNames.join(", ");
    basePrompt += ` He/She is accompanied by his/her loyal pet: ${petList}. The pet must be drawn beautifully next to the character showing strong friendship in high resolution.`;
  } else {
    basePrompt += " He/She does not have any pets around.";
  }

  basePrompt += " The overall style must be a high-end 2D cel-shaded digital anime painting with sharp, crisp lines, vivid colors, clean white background, 3:4 aspect ratio, masterpiece quality, sharp focus.";

  // Attempt using Gemini 3.1 Flash Image first for highest 1K definition!
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-image',
      contents: { parts: [{ text: basePrompt }] },
      config: { 
        imageConfig: { 
          aspectRatio: "3:4",
          imageSize: "1K"
        } 
      }
    });

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }
  } catch (error: any) {
    console.warn("Error generating with gemini-3.1-flash-image, attempting gemini-2.5-flash-image", error);
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
    } catch (innerError: any) {
      console.error("Error generating with gemini-2.5-flash-image fallback:", innerError);
      return PORTRAIT_FALLBACKS[characterId] || null;
    }
  }
  return PORTRAIT_FALLBACKS[characterId] || null;
}
