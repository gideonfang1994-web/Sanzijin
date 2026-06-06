/**
 * Premium Layered SVG Avatar Generator for Hero Characters.
 * Allows characters to start completely unequipped, and overlay their bought
 * weapons, offhands, helmets, custom armor pieces, and pets in physical vector graphics!
 */

import { Character } from '../types';

// Let's reuse the item SVG fragment drawers to physically overlay items on the character
const CHARACTER_DEFS = `
  <defs>
    <!-- Dynamic character gradients -->
    <linearGradient id="charLight" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
    </linearGradient>
    <filter id="bodyShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="1" dy="4" stdDeviation="3" flood-color="#0f172a" flood-opacity="0.2" />
    </filter>
  </defs>
`;

export function getCharacterPortraitSvg(
  character: Character, 
  equippedItemNames: string[],
  activePetType?: 'DRAGON' | 'CAT' | 'OWL' | 'SLIME'
): string {
  const { id, color, name } = character;
  
  // Identify currently active equipment categories
  const hasHead = equippedItemNames.some(name => ['勇气头盔', '星光法帽', '森林兜帽', '影杀面具'].includes(name));
  const hasBody = equippedItemNames.some(name => ['皇家卫队蓝甲', '泰坦神域重甲', '高阶法袍', '星界不灭神袍', '游侠皮甲套装', '夜行隐杀轻装', '暗影斗篷'].includes(name));
  const hasShoulder = equippedItemNames.includes('钢铁护肩');
  const hasCloak = equippedItemNames.includes('星光披风') || equippedItemNames.includes('暗影斗篷');
  
  // Right hand weapons
  let rightHandWeapon = '';
  if (equippedItemNames.includes('破魔者之剑')) rightHandWeapon = 'IRON_SWORD';
  else if (equippedItemNames.includes('炎龙重剑')) rightHandWeapon = 'FIRE_SWORD';
  else if (equippedItemNames.includes('弑神圣光巨剑')) rightHandWeapon = 'HOLY_SWORD';
  else if (equippedItemNames.includes('星辰法杖')) rightHandWeapon = 'STAR_STAFF';
  else if (equippedItemNames.includes('潮汐圣歌法杖')) rightHandWeapon = 'WAVE_STAFF';
  else if (equippedItemNames.includes('混沌天演魔杖')) rightHandWeapon = 'VOID_Scepter';
  else if (equippedItemNames.includes('森之弓')) rightHandWeapon = 'WOOD_BOW';
  else if (equippedItemNames.includes('秘银轻弩')) rightHandWeapon = 'SILVER_CROSSBOW';
  else if (equippedItemNames.includes('月影追风长弓')) rightHandWeapon = 'MOON_BOW';
  else if (equippedItemNames.includes('神树万物长弓')) rightHandWeapon = 'TREE_BOW';
  else if (equippedItemNames.includes('刺客短刃')) rightHandWeapon = 'DAGGER';
  else if (equippedItemNames.includes('血月暗黑双刃')) rightHandWeapon = 'RED_DBL_BLADES';
  else if (equippedItemNames.includes('天诛无影神刃')) rightHandWeapon = 'GOLD_BLADE';

  // Left hand offhands
  let leftHandOffhand = '';
  if (equippedItemNames.includes('狮心盾')) leftHandOffhand = 'LION_SHIELD';
  else if (equippedItemNames.includes('不屈誓言巨盾')) leftHandOffhand = 'VOW_TOWER_SHIELD';
  else if (equippedItemNames.includes('法术魔典')) leftHandOffhand = 'SPELL_BOOK';
  else if (equippedItemNames.includes('虚空秘典')) leftHandOffhand = 'VOID_BOOK';
  else if (equippedItemNames.includes('鹰眼箭袋')) leftHandOffhand = 'ARROW_QUIVER';
  else if (equippedItemNames.includes('毒蝎手里剑')) leftHandOffhand = 'TOXIC_SHURIKEN';

  // Back items / boots
  const hasBoots = equippedItemNames.includes('疾风靴') || equippedItemNames.includes('潜行长靴');

  // Background gradient color
  const bgGradId = `bgGrad_${id}`;
  const charBgGrad = `
    <linearGradient id="${bgGradId}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${color}"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </linearGradient>
  `;

  let characterBodySvg = '';

  // 1. Warrior Aethelred c1
  if (id === 'c1') {
    characterBodySvg = `
      <!-- BACK CLOAK -->
      ${hasCloak ? `
        <!-- Flowing purple cape -->
        <path d="M120,290 L280,290 L320,580 L80,580 Z" fill="#5b21b6" stroke="#2e1065" stroke-width="6" filter="url(#bodyShadow)" />
        <path d="M120,290 L200,290 L110,575 L80,580 Z" fill="#7c3aed" opacity="0.4" />
      ` : ''}

      <!-- CHARACTER BASE BODY -->
      <g filter="url(#bodyShadow)">
        <!-- Legs/Tights -->
        <rect x="175" y="470" width="16" height="60" fill="#3b2314" stroke="#1f1107" stroke-width="3" rx="4" />
        <rect x="209" y="470" width="16" height="60" fill="#3b2314" stroke="#1f1107" stroke-width="3" rx="4" />
        <!-- Cadet Boots -->
        <rect x="170" y="525" width="22" height="25" fill="${hasBoots ? '#ea580c' : '#78350f'}" stroke="#1f1107" stroke-width="3" rx="5" />
        <rect x="208" y="525" width="22" height="25" fill="${hasBoots ? '#ea580c' : '#78350f'}" stroke="#1f1107" stroke-width="3" rx="5" />
        
        <!-- Base Body Chest torso -->
        <path d="M150,340 L250,340 Q255,480 200,480 Q145,480 150,340 Z" fill="#e2e8f0" stroke="#475569" stroke-width="4" />
        
        <!-- Inner default leather vest shirt (Unequipped view) -->
        <path d="M165,340 L235,340 L220,440 L180,440 Z" fill="#78350f" opacity="0.8" />
        <path d="M185,345 L215,345 L200,380 Z" fill="#ffedd5" /> <!-- Neck v-opening -->
      </g>

      <!-- CHEST ARMOR SYSTEM -->
      ${hasBody ? `
        <!-- Royal Guard blue chest plate or golden titan plate armor -->
        <g filter="url(#bodyShadow)">
          <path d="M148,335 C170,325 230,325 252,335 L240,460 C210,475 190,475 160,460 Z" fill="${equippedItemNames.includes('泰坦神域重甲') ? '#fbbf24' : '#0284c7'}" stroke="#1e293b" stroke-width="4.5" />
          <!-- Inner core details -->
          ${equippedItemNames.includes('泰坦神域重甲') ? `
            <circle cx="200" cy="385" r="16" fill="#0284c7" stroke="#fff" stroke-width="2.5" />
            <polygon points="200,375 208,390 192,390" fill="#38bdf8" />
          ` : `
            <path d="M175,355 L225,355 L215,420 L185,420 Z" fill="#0ea5e9" opacity="0.8" />
            <line x1="200" y1="365" x2="200" y2="420" stroke="#fbbf24" stroke-width="3" />
          `}
        </g>
      ` : ''}

      <!-- SHOULDER GUARDS -->
      ${hasShoulder ? `
        <g filter="url(#bodyShadow)">
          <!-- Left Shoulder -->
          <path d="M125,320 C125,305 165,300 170,325 C173,340 145,350 125,320 Z" fill="#94a3b8" stroke="#334155" stroke-width="4.5" />
          <circle cx="145" cy="325" r="2.5" fill="#e2e8f0" />
          <!-- Right Shoulder -->
          <path d="M275,320 C275,305 235,300 230,325 C227,340 255,350 275,320 Z" fill="#94a3b8" stroke="#334155" stroke-width="4.5" />
          <circle cx="255" cy="325" r="2.5" fill="#e2e8f0" />
        </g>
      ` : ''}

      <!-- HEAD & FACE BASE -->
      <g filter="url(#bodyShadow)">
        <!-- Neck -->
        <rect x="185" y="278" width="30" height="28" fill="#ffedd5" stroke="#475569" stroke-width="3" />
        <!-- Head Shell -->
        <circle cx="200" cy="245" r="42" fill="#ffedd5" stroke="#475569" stroke-width="4.5" />
        <!-- Spiky Blond hair (Visible if no Helmet) -->
        ${!hasHead ? `
          <path d="M152,240 Q150,170 185,185 Q200,165 215,185 Q250,170 248,240 Q255,210 242,205 Q225,200 200,215 Q175,200 158,205 Q145,210 152,240 Z" fill="#facc15" stroke="#b45309" stroke-width="3.5" />
        ` : ''}
        <!-- Cute Eyes and smile -->
        <circle cx="185" cy="242" r="4.5" fill="#025b96" />
        <circle cx="183.5" cy="239.5" r="1.5" fill="#fff" />
        <circle cx="215" cy="242" r="4.5" fill="#025b96" />
        <circle cx="213.5" cy="239.5" r="1.5" fill="#fff" />
        <path d="M190,265 Q200,274 210,265" fill="none" stroke="#b45309" stroke-width="3.5" stroke-linecap="round" />
        <ellipse cx="172" cy="250" rx="4" ry="2" fill="#fca5a5" opacity="0.6" />
        <ellipse cx="228" cy="250" rx="4" ry="2" fill="#fca5a5" opacity="0.6" />
      </g>

      <!-- HELMET SYSTEM -->
      ${hasHead ? `
        <g filter="url(#bodyShadow)" transform="translate(200, 230) scale(1.15)">
          <!-- Red Crest Plume -->
          <path d="M-5,-45 Q-20,-40 -18,-20 Q-5,-25 5,-45" fill="#ef4444" stroke="#991b1b" stroke-width="2.5" />
          <path d="M5,-45 Q20,-40 18,-20 Q5,-25 -5,-45" fill="#ef4444" stroke="#991b1b" stroke-width="2.5" />
          <!-- Plume center -->
          <path d="M-2,-50 Q0,-62 2,-50 Z" fill="#f43f5e" />
          <!-- Helmet metal bowl -->
          <path d="M-32,12 C-32,-30 32,-30 32,12 Z" fill="#94a3b8" stroke="#334155" stroke-width="4.5" />
          <!-- Visor forehead shield overlay -->
          <path d="M-26,0 L26,0 Q24,18 0,22 Q-24,18 -26,0 Z" fill="#cbd5e1" stroke="#334155" stroke-width="3" />
          <line x1="-12" y1="9" x2="12" y2="9" stroke="#475569" stroke-width="2.5" stroke-dasharray="1.5 2" />
        </g>
      ` : ''}

      <!-- RIGHT HAND WEAPON GRAPHICS -->
      <g filter="url(#bodyShadow)" transform="translate(100, 395)">
        <!-- Default fist hand skin -->
        <circle cx="0" cy="10" r="14" fill="#ffedd5" stroke="#475569" stroke-width="3.5" />
        
        <!-- Equipped Sword -->
        ${rightHandWeapon === 'IRON_SWORD' ? `
          <g transform="rotate(-65) translate(0, -32) scale(0.95)">
            <path d="M-6,-60 L6,-60 L8,15 L-8,15 Z" fill="#cbd5e1" stroke="#475569" stroke-width="4" />
            <path d="M-14,15 L14,15 L10,21 L-10,21 Z" fill="#b45309" stroke="#78350f" stroke-width="2.5" />
            <rect x="-3" y="21" width="6" height="24" fill="#78350f" stroke="#451a03" stroke-width="2.5" />
            <circle cx="0" cy="48" r="5" fill="#fbbf24" stroke="#78350f" stroke-width="2" />
          </g>
        ` : ''}
        ${rightHandWeapon === 'FIRE_SWORD' ? `
          <g transform="rotate(-65) translate(0, -45) scale(1.1)">
            <path d="M-10,-70 L10,-70 L13,10 L-13,10 Z" fill="url(#itemBgGrad)" stroke="#7f1d1d" stroke-width="4.5" />
            <path d="M-5,-60 Q0,-45 5,-30 L0,5" fill="none" stroke="#ef4444" stroke-width="3.5" />
            <path d="M-28,10 Q0,5 28,10 L22,22 L0,14 L-22,22 Z" fill="#3f1414" stroke="#7f1d1d" stroke-width="3" />
            <rect x="-5" y="22" width="10" height="30" fill="#451a03" stroke="#1c0a00" stroke-width="3" />
          </g>
        ` : ''}
        ${rightHandWeapon === 'HOLY_SWORD' ? `
          <g transform="rotate(-65) translate(0, -50) scale(1.15)">
            <path d="M-7,-75 L7,-75 L10,12 L-10,12 Z" fill="url(#holyGrad)" stroke="#d97706" stroke-width="4" />
            <line x1="0" y1="-70" x2="0" y2="10" stroke="#fff" stroke-width="3" />
            <path d="M-30,12 C-15,8 30,8 30,12 L20,22 Q0,16 -20,22 Z" fill="#fef08a" stroke="#ca8a04" stroke-width="3" />
            <rect x="-4" y="22" width="8" height="32" fill="#fff" stroke="#94a3b8" stroke-width="2.5" />
          </g>
        ` : ''}
      </g>

      <!-- LEFT HAND SHIELD GRAPHICS -->
      <g filter="url(#bodyShadow)" transform="translate(300, 395)">
        <circle cx="0" cy="10" r="14" fill="#ffedd5" stroke="#475569" stroke-width="3.5" />
        
        <!-- Equipped Shield -->
        ${leftHandOffhand === 'LION_SHIELD' ? `
          <g transform="translate(15, -12) scale(0.95)">
            <path d="M-28,-28 L28,-28 Q30,10 0,35 Q-30,10 -28,-28 Z" fill="url(#magicGold)" stroke="#78350f" stroke-width="4" />
            <circle cx="0" cy="-3" r="8" fill="#f59e0b" stroke="#78350f" stroke-width="1.5" />
          </g>
        ` : ''}
        ${leftHandOffhand === 'VOW_TOWER_SHIELD' ? `
          <g transform="translate(18, -15) scale(1.05)">
            <path d="M-28,-40 L28,-40 L32,12 C32,28 0,45 0,45 C0,45 -32,28 -32,12 Z" fill="#64748b" stroke="#1e293b" stroke-width="4.5" />
            <path d="M-4,-20 L4,-20 L4,-8 L16,-8 L16,0 L4,0 L4,20 L-4,20 L-4,0 L-16,0 L-16,-8 L-4,-8 Z" fill="url(#magicGold)" stroke="#78350f" stroke-width="2" />
          </g>
        ` : ''}
      </g>
    `;
  }
  
  // 2. Mage Elara c2
  else if (id === 'c2') {
    characterBodySvg = `
      <!-- BACK CLOAK -->
      ${hasCloak ? `
        <!-- Shimmering Star cloak cape -->
        <path d="M125,295 L275,295 L325,580 L75,580 Z" fill="url(#voidGrad)" stroke="#2e1065" stroke-width="5" filter="url(#bodyShadow)" />
        <star cx="110" cy="450" r="4" fill="#fff" />
        <star cx="280" cy="380" r="3.5" fill="#fde047" />
        <circle cx="200" cy="500" r="2" fill="#fff" />
      ` : ''}

      <!-- BASE BODY -->
      <g filter="url(#bodyShadow)">
        <!-- Legs -->
        <rect x="180" y="470" width="14" height="60" fill="#fca5a5" stroke="#475569" stroke-width="3" rx="3" />
        <rect x="206" y="470" width="14" height="60" fill="#fca5a5" stroke="#475569" stroke-width="3" rx="3" />
        <!-- Shoes -->
        <rect x="175" y="525" width="20" height="24" fill="#1e152a" stroke="#475569" stroke-width="3" rx="4" />
        <rect x="205" y="525" width="20" height="24" fill="#1e152a" stroke="#475569" stroke-width="3" rx="4" />

        <!-- Base Gown / Dress undergarment -->
        <path d="M155,335 L245,335 L235,480 L165,480 Z" fill="#311042" stroke="#2e1065" stroke-width="4" />
      </g>

      <!-- LUXURY ROBBES SYSTEM -->
      ${hasBody ? `
        <!-- Gown options nested -->
        <g filter="url(#bodyShadow)">
          <path d="M152,330 L248,330 L242,478 L158,478 Z" fill="${equippedItemNames.includes('星界不灭神袍') ? 'url(#voidGrad)' : '#6d28d9'}" stroke="#1e1b4b" stroke-width="4.5" />
          <!-- Gown details ribbon belt -->
          <rect x="170" y="390" width="60" height="8" rx="2" fill="#fbbf24" stroke="#78350f" stroke-width="1.5" />
          <path d="M152,330 L200,430 L248,330" fill="none" stroke="#fff" stroke-width="2.5" opacity="0.35" />
        </g>
      ` : ''}

      <!-- HEAD & CURLY MAGIC HAIR -->
      <g filter="url(#bodyShadow)">
        <!-- Neck -->
        <rect x="187" y="278" width="26" height="28" fill="#ffe4e6" stroke="#475569" stroke-width="2.5" />
        <!-- Huge fluffy purple twin hair buns background -->
        <circle cx="152" cy="195" r="22" fill="#8b5cf6" stroke="#4c1d95" stroke-width="3.5" />
        <circle cx="248" cy="195" r="22" fill="#8b5cf6" stroke="#4c1d95" stroke-width="3.5" />
        <!-- Face Circle -->
        <circle cx="200" cy="242" r="40" fill="#ffe4e6" stroke="#475569" stroke-width="4.5" />
        <!-- Lavender Hair front bangs -->
        ${!hasHead ? `
          <path d="M156,230 Q160,172 200,182 Q240,172 244,230 Q250,195 200,198 Q150,195 156,230 Z" fill="#a78bfa" stroke="#4c1d95" stroke-width="3.5" stroke-linejoin="round" />
        ` : ''}
        <!-- Cute glowing big purple eyes and smile -->
        <circle cx="186" cy="240" r="5" fill="#701a75" />
        <circle cx="184.5" cy="237.5" r="1.8" fill="#fff" />
        <circle cx="214" cy="240" r="5" fill="#701a75" />
        <circle cx="212.5" cy="237.5" r="1.8" fill="#fff" />
        <path d="M192,261 Q200,268 208,261" fill="none" stroke="#701a75" stroke-width="3" stroke-linecap="round" />
        <circle cx="174" cy="247" r="3.2" fill="#fda4af" opacity="0.8" />
        <circle cx="226" cy="247" r="3.2" fill="#fda4af" opacity="0.8" />
      </g>

      <!-- POINTY WIZARD HAT -->
      ${hasHead ? `
        <g filter="url(#bodyShadow)" transform="translate(200, 218) scale(1.1)">
          <!-- Brim -->
          <ellipse cx="0" cy="22" rx="46" ry="11" fill="#7c3aed" stroke="#2e1065" stroke-width="4.5" />
          <!-- Cone curving left -->
          <path d="M-28,16 Q-18,-45 -12,-52 Q18,-20 28,16 Z" fill="#6d28d9" stroke="#2e1065" stroke-width="4.5" stroke-linejoin="round" />
          <path d="M-21,12 Q0,9 21,12 L22,17 Q0,14 -22,17 Z" fill="#fbbf24" stroke="#78350f" stroke-width="2" />
          <!-- Gold buckle belt hook -->
          <rect x="-6" y="9" width="12" height="11" rx="2" fill="#fbbf24" stroke="#b45309" stroke-width="1.8" />
          <path d="M12,-10 L15,-7 L12,-4 L9,-7 Z" fill="#fde047" />
        </g>
      ` : ''}

      <!-- RIGHT HAND STAFF -->
      <g filter="url(#bodyShadow)" transform="translate(105, 385)">
        <circle cx="0" cy="10" r="12" fill="#ffe4e6" stroke="#475569" stroke-width="3" />
        
        <!-- Star / Wave / Void Staff -->
        ${rightHandWeapon === 'STAR_STAFF' ? `
          <g transform="rotate(-15) translate(0, -38) scale(0.85)">
            <rect x="-3" y="-30" width="6" height="95" fill="#78350f" stroke="#451a03" stroke-width="2.5" />
            <path d="M-12,-42 C-8,-28 8,-28 12,-42 C9,-38 -9,-38 -12,-42" fill="url(#magicGold)" stroke="#7d1a04" stroke-width="1.5" />
            <circle cx="0" cy="-42" r="11" fill="#38bdf8" stroke="#fff" stroke-width="1.8" />
            <circle cx="-3" cy="-45" r="3.2" fill="#fff" opacity="0.6" />
          </g>
        ` : ''}
        ${rightHandWeapon === 'WAVE_STAFF' ? `
          <g transform="rotate(-15) translate(0, -42) scale(0.9)">
            <rect x="-2.5" y="-30" width="5" height="95" fill="#f1f5f9" stroke="#475569" stroke-width="2.5" />
            <path d="M-13,-45 L0,-62 L13,-45 Q6,-40 0,-47 Q-6,-40 -13,-45 Z" fill="#fef08a" stroke="#ca8a04" stroke-width="2" />
            <circle cx="0" cy="-48" r="7" fill="#06b6d4" stroke="#fff" stroke-width="1.5" />
          </g>
        ` : ''}
        ${rightHandWeapon === 'VOID_Scepter' ? `
          <g transform="rotate(-15) translate(0, -50) scale(0.92)">
            <rect x="-3.5" y="-40" width="7" height="110" fill="url(#shadowGrad)" stroke="#1e1b4b" stroke-width="3" />
            <circle cx="0" cy="-46" r="12.5" fill="#090d16" stroke="#a78bfa" stroke-width="3.5" />
            <ellipse cx="0" cy="-46" rx="20" ry="5" fill="none" stroke="#c084fc" stroke-width="2.5" transform="rotate(22, 0, -46)" />
          </g>
        ` : ''}
      </g>

      <!-- LEFT HAND SPELLBOOK -->
      <g filter="url(#bodyShadow)" transform="translate(295, 385)">
        <circle cx="0" cy="10" r="12" fill="#ffe4e6" stroke="#475569" stroke-width="3" />
        
        <!-- Book details -->
        ${leftHandOffhand === 'SPELL_BOOK' ? `
          <g transform="translate(14, -12) scale(0.8)">
            <rect x="-24" y="-32" width="48" height="64" rx="6" fill="#78350f" stroke="#371003" stroke-width="4" />
            <circle cx="0" cy="0" r="9" fill="none" stroke="#a78bfa" stroke-width="2" stroke-dasharray="2 1" />
            <polygon points="0,-6 5,3 -5,3" fill="#c084fc" />
          </g>
        ` : ''}
        ${leftHandOffhand === 'VOID_BOOK' ? `
          <g transform="translate(14, -15) scale(0.85)">
            <rect x="-26" y="-34" width="52" height="68" rx="8" fill="url(#voidGrad)" stroke="#1e1b4b" stroke-width="3.5" />
            <circle cx="0" cy="0" r="10" fill="none" stroke="#f43f5e" stroke-width="2" />
          </g>
        ` : ''}
      </g>
    `;
  }
  
  // 3. Ranger Inari c3
  else if (id === 'c3') {
    characterBodySvg = `
      <!-- FOX TAIL ALWAYS VISIBLE BACKGROUND -->
      <g filter="url(#bodyShadow)">
        <path d="M225,430 C265,420 330,360 300,450 C275,520 220,480 225,430 Z" fill="#ea580c" stroke="#451a03" stroke-width="4" />
        <path d="M275,445 Q310,410 300,450 Q285,470 270,455 Z" fill="#fff" /> <!-- Fluffy white tip of tail -->
      </g>

      <!-- BASE BODY -->
      <g filter="url(#bodyShadow)">
        <rect x="182" y="470" width="13" height="60" fill="#fdba74" stroke="#451a03" stroke-width="3" rx="3.5" />
        <rect x="205" y="470" width="13" height="60" fill="#fdba74" stroke="#451a03" stroke-width="3" rx="3.5" />
        <!-- Cute Ranger shoes boots -->
        <rect x="176" y="525" width="20" height="24" fill="${hasBoots ? '#ea580c' : '#7c2d12'}" stroke="#451a03" stroke-width="3" rx="4" />
        <rect x="204" y="525" width="20" height="24" fill="${hasBoots ? '#ea580c' : '#7c2d12'}" stroke="#451a03" stroke-width="3" rx="4" />

        <!-- Green Organic linen base top -->
        <path d="M156,335 L244,335 L230,470 L170,470 Z" fill="#2f5233" stroke="#163a16" stroke-width="4.5" />
      </g>

      <!-- DETAILED LEATHER ARMOR SYSTEM -->
      ${hasBody ? `
        <g filter="url(#bodyShadow)">
          <path d="M152,330 L248,330 L236,468 L164,468 Z" fill="${equippedItemNames.includes('疾风虚空轻甲') ? '#111827' : '#1e3a1e'}" stroke="#14532d" stroke-width="4.5" />
          <path d="M152,330 L200,410 L248,330" fill="none" stroke="#d97706" stroke-width="2.5" />
          <circle cx="200" cy="375" r="4.5" fill="#facc15" />
        </g>
      ` : ''}

      <!-- HEAD & FOX FEATURES -->
      <g filter="url(#bodyShadow)">
        <!-- Neck -->
        <rect x="187" y="278" width="26" height="28" fill="#ffedd5" stroke="#475569" stroke-width="2.5" />
        
        <!-- Big cute Fox Ears behind hair -->
        <g transform="translate(162, 205) rotate(-20)">
          <polygon points="0,0 -12,-32 18,-20" fill="#ea580c" stroke="#451a03" stroke-width="3.5" />
          <polygon points="-2,-3 -9,-24 10,-15" fill="#feca87" />
        </g>
        <g transform="translate(238, 205) rotate(20) scale(-1, 1)">
          <polygon points="0,0 -12,-32 18,-20" fill="#ea580c" stroke="#451a03" stroke-width="3.5" />
          <polygon points="-2,-3 -9,-24 10,-15" fill="#feca87" />
        </g>

        <!-- Face Circle -->
        <circle cx="200" cy="242" r="39" fill="#ffedd5" stroke="#475569" stroke-width="4.5" />
        
        <!-- Short spiky ginger hair -->
        ${!hasHead ? `
          <path d="M158,230 C154,168 246,168 242,230 Q252,210 236,192 Q200,185 164,192 Q148,210 158,230 Z" fill="#ea580c" stroke="#451a03" stroke-width="3.5" />
        ` : ''}
        
        <!-- Emerald Green eyes & Cheek lines whiskers -->
        <path d="M165,246 L175,248" stroke="#451a03" stroke-width="2" />
        <path d="M235,246 L225,248" stroke="#451a03" stroke-width="2" />
        
        <circle cx="186" cy="240" r="5" fill="#047857" />
        <circle cx="184.5" cy="237.5" r="1.8" fill="#fff" />
        <circle cx="214" cy="240" r="5" fill="#047857" />
        <circle cx="212.5" cy="237.5" r="1.8" fill="#fff" />
        <path d="M193,259 Q200,265 207,259" fill="none" stroke="#b45309" stroke-width="2.5" stroke-linecap="round" />
        <ellipse cx="173" cy="248" rx="3" ry="1.5" fill="#fca5a5" opacity="0.8" />
        <ellipse cx="227" cy="248" rx="3" ry="1.5" fill="#fca5a5" opacity="0.8" />
      </g>

      <!-- FOREST LEAF COWL OR COOP HOOD -->
      ${hasHead ? `
        <g filter="url(#bodyShadow)" transform="translate(200, 226) scale(1.1)">
          <!-- Leaf styled green cowl -->
          <path d="M-30,22 C-34,-12 -30,-38 0,-40 C30,-38 34,-12 30,22 C18,22 10,14 0,16 C-10,14 -18,22 -30,22 Z" fill="#15803d" stroke="#14532d" stroke-width="4.5" />
          <path d="M-12,14 Q0,2 12,14 Q16,-20 0,-24 Q-16,-20 -12,14 Z" fill="#14532d" opacity="0.8" />
          <!-- Small hanging leaf charm -->
          <circle cx="0" cy="24" r="4.5" fill="#4ade80" stroke="#14532d" stroke-width="1.2" />
        </g>
      ` : ''}

      <!-- RIGHT HAND WEAPON BOW -->
      <g filter="url(#bodyShadow)" transform="translate(100, 390)">
        <circle cx="0" cy="10" r="12" fill="#ffedd5" stroke="#475569" stroke-width="3" />
        
        <!-- Bow design standard leaves -->
        ${rightHandWeapon === 'WOOD_BOW' ? `
          <g transform="rotate(-30) translate(-5, -45) scale(0.8)">
            <path d="M-3,-60 C-22,-25 -22,25 -3,60 C-8,40 -12,18 -12,0 C-12,-18 -8,-40 -3,-60" fill="url(#forestGrad)" stroke="#14532d" stroke-width="4" />
            <line x1="-3" y1="-56" x2="-3" y2="56" stroke="#86efac" stroke-width="1.8" stroke-dasharray="2 1" />
          </g>
        ` : ''}
        ${rightHandWeapon === 'SILVER_CROSSBOW' ? `
          <g transform="rotate(15) translate(-3, -15) scale(0.72)">
            <path d="M-35,-25 C-12,-10 12,-10 35,-25" fill="none" stroke="#cbd5e1" stroke-width="4.5" />
            <rect x="-4" y="-30" width="8" height="66" fill="#78350f" stroke="#451a03" stroke-width="2.5" />
            <line x1="-32" y1="-22" x2="32" y2="-22" stroke="#fff" stroke-width="1.5" />
          </g>
        ` : ''}
        ${rightHandWeapon === 'MOON_BOW' ? `
          <g transform="rotate(-30) translate(-8, -50) scale(0.85)">
            <path d="M0,-65 C-28,-30 -28,30 0,65 C-14,40 -16,12 -16,0 Q-16,-12 -14,-40 Z" fill="#cbd5e1" stroke="#475569" stroke-width="4" />
            <line x1="0" y1="-60" x2="0" y2="60" stroke="#93c5fd" stroke-width="1.5" />
          </g>
        ` : ''}
        ${rightHandWeapon === 'TREE_BOW' ? `
          <g transform="rotate(-30) translate(-10, -56) scale(0.9)">
            <path d="M2,-72 C-32,-35 -32,35 2,72 C-11,45 -14,15 -14,0 C-14,-15 -11,-45 2,-72 Z" fill="#854d0e" stroke="#451a03" stroke-width="4.5" />
            <line x1="2" y1="-67" x2="2" y2="67" stroke="#fde047" stroke-width="2" />
          </g>
        ` : ''}
      </g>

      <!-- OFFHAND ARROW QUIVER (Left hand hip area) -->
      <g filter="url(#bodyShadow)" transform="translate(295, 390)">
        <circle cx="0" cy="10" r="12" fill="#ffedd5" stroke="#475569" stroke-width="3" />
        
        ${leftHandOffhand === 'ARROW_QUIVER' ? `
          <g transform="translate(12, -15) rotate(10) scale(0.78)">
            <rect x="-14" y="-28" width="28" height="60" rx="6" fill="#78350f" stroke="#451a03" stroke-width="4" />
            <line x1="-6" y1="-38" x2="-6" y2="-20" stroke="#fff" stroke-width="3" />
            <polygon points="-6,-42 -10,-32 -2,-32" fill="#ef4444" />
            <line x1="4" y1="-38" x2="4" y2="-20" stroke="#fff" stroke-width="3" />
            <polygon points="4,-42 0,-32 8,-32" fill="#fbbf24" />
          </g>
        ` : ''}
      </g>
    `;
  }
  
  // 4. Assassin Kage c4
  else if (id === 'c4') {
    characterBodySvg = `
      <!-- BACK CLOAK -->
      ${hasCloak ? `
        <!-- Eerie twilight dark purple cloak cape -->
        <path d="M125,295 L275,295 L325,580 L75,580 Z" fill="#24143a" stroke="#0f051d" stroke-width="5" filter="url(#bodyShadow)" />
        <ellipse cx="120" cy="480" rx="3" ry="5" fill="#7c3aed" opacity="0.6" />
        <ellipse cx="280" cy="410" rx="4" ry="7" fill="#7c3aed" opacity="0.6" />
      ` : ''}

      <!-- BASE BODY -->
      <g filter="url(#bodyShadow)">
        <rect x="180" y="470" width="13" height="60" fill="#f3a3a3" stroke="#0f172a" stroke-width="3" rx="3" />
        <rect x="207" y="470" width="13" height="60" fill="#f3a3a3" stroke="#0f172a" stroke-width="3" rx="3" />
        <!-- Silent ninja boots -->
        <rect x="175" y="525" width="20" height="24" fill="#1e293b" stroke="#0f172a" stroke-width="3" rx="4" />
        <rect x="205" y="525" width="20" height="24" fill="#1e293b" stroke="#0f172a" stroke-width="3" rx="4" />

        <!-- Black training cloth top -->
        <path d="M155,335 L245,335 L232,472 L168,472 Z" fill="#1e293b" stroke="#0f172a" stroke-width="4.5" />
      </g>

      <!-- DARK SILK ARMOR LAYER -->
      ${hasBody ? `
        <g filter="url(#bodyShadow)">
          <path d="M151,328 L249,328 L238,470 L162,470 Z" fill="${equippedItemNames.includes('夜行隐杀轻装') ? '#090d16' : '#24143a'}" stroke="#0f051d" stroke-width="4.5" />
          <!-- Red ninja cross waistband ribbons -->
          <rect x="174" y="394" width="52" height="6" fill="#ef4444" stroke="#991b1b" stroke-width="1.2" />
        </g>
      ` : ''}

      <!-- HEAD & SILVER SPIKY HAIR -->
      <g filter="url(#bodyShadow)">
        <!-- Neck -->
        <rect x="187" y="278" width="26" height="28" fill="#fecaca" stroke="#475569" stroke-width="2.5" />
        <!-- Face Circle -->
        <circle cx="200" cy="242" r="39" fill="#fecaca" stroke="#475569" stroke-width="4.5" />
        
        <!-- Silver spiky cool rogue hair -->
        ${!hasHead ? `
          <path d="M152,240 Q145,160 182,180 Q200,155 218,180 Q255,160 248,240 Q252,210 240,202 L200,215 L160,202 Q148,210 152,240 Z" fill="#e2e8f0" stroke="#475569" stroke-width="3.5" />
        ` : ''}
        
        <!-- Menacing Red Eyes -->
        <circle cx="186" cy="241" r="5" fill="#dc2626" />
        <circle cx="184.5" cy="238.5" r="1.5" fill="#fff" />
        <circle cx="214" cy="241" r="5" fill="#dc2626" />
        <circle cx="212.5" cy="238.5" r="1.5" fill="#fff" />
        <!-- Cool half smile smirk -->
        <path d="M192,258 Q200,265 204,258" fill="none" stroke="#450a0a" stroke-width="3" stroke-linecap="round" />
        <ellipse cx="174" cy="248" rx="2.5" ry="1" fill="#fca5a5" opacity="0.6" />
        <ellipse cx="226" cy="248" rx="2.5" ry="1" fill="#fca5a5" opacity="0.6" />
      </g>

      <!-- VISOR / SHADOW SKULL MASK -->
      ${hasHead ? `
        <g filter="url(#bodyShadow)" transform="translate(200, 240) scale(1.15)">
          <path d="M-26,-15 L26,-15 C26,-15 28,15 0,33 Q-28,15 -26,-15 Z" fill="#1e293b" stroke="#0f172a" stroke-width="4" />
          <path d="M-18,-2 L18,-2 Q0,-5 -18,-2 Z" fill="#ef4444" stroke="#991b1b" stroke-width="1.8" />
          <circle cx="-8" cy="14" r="1.2" fill="#0f172a" />
          <circle cx="0" cy="15" r="1.2" fill="#0f172a" />
          <circle cx="8" cy="14" r="1.2" fill="#0f172a" />
        </g>
      ` : ''}

      <!-- RIGHT HAND WEAPON -->
      <g filter="url(#bodyShadow)" transform="translate(100, 395)">
        <circle cx="0" cy="10" r="12" fill="#fecaca" stroke="#475569" stroke-width="3" />
        
        <!-- Curved Dagger / Cross Crimson blades / Gold lightning katana -->
        ${rightHandWeapon === 'DAGGER' ? `
          <g transform="rotate(45) translate(0, -22) scale(0.8)">
            <path d="M-5,-45 C0,-40 8,-10 5,15 L-5,15 C-5,15 -8,-10 -5,-45" fill="#334155" stroke="#0f172a" stroke-width="3.5" />
            <ellipse cx="0" cy="15" rx="10" ry="3.5" fill="#fbbf24" stroke="#78350f" stroke-width="1.8" />
            <rect x="-3" y="19" width="6" height="18" fill="#1e293b" />
          </g>
        ` : ''}
        ${rightHandWeapon === 'RED_DBL_BLADES' ? `
          <g transform="rotate(-15) translate(-4, -28) scale(0.85)">
            <path d="M-4,-48 C-10,-20 -5,10 -2,15 L2,15 C2,10 5,-20 -2,-48" fill="#ef4444" stroke="#7f1d1d" stroke-width="3" />
            <rect x="-3" y="15" width="6" height="15" fill="#1e293b" />
          </g>
        ` : ''}
        ${rightHandWeapon === 'GOLD_BLADE' ? `
          <g transform="rotate(45) translate(0, -38) scale(0.92)">
            <path d="M-4,-80 L4,-80 C4,-80 7,-20 5,15 L-5,15 C-5,15 -7,-20 -4,-80 Z" fill="url(#magicGold)" stroke="#78350f" stroke-width="4" />
            <line x1="0" y1="-76" x2="0" y2="12" stroke="#fff" stroke-width="2.2" />
            <rect x="-3" y="21" width="6" height="32" fill="#1e293b" stroke="#111827" stroke-width="2" />
          </g>
        ` : ''}
      </g>

      <!-- LEFT HAND COMPONENT (TOXIC SHURIKEN) -->
      <g filter="url(#bodyShadow)" transform="translate(300, 395)">
        <circle cx="0" cy="10" r="12" fill="#fecaca" stroke="#475569" stroke-width="3" />
        
        ${leftHandOffhand === 'TOXIC_SHURIKEN' ? `
          <g transform="translate(12, -10) scale(0.78)">
            <circle cx="0" cy="0" r="10" fill="#475569" stroke="#0f172a" stroke-width="2.5" />
            <path d="M-5,-8 L0,-32 L5,-8 Z" fill="#334155" stroke="#0f172a" stroke-width="2" />
            <path d="M8,-5 L32,0 L8,5 Z" fill="#334155" stroke="#0f172a" stroke-width="2" />
            <path d="M5,8 L0,32 L-5,8 Z" fill="#334155" stroke="#0f172a" stroke-width="2" />
            <path d="M-8,5 L-32,0 L-8,-5 Z" fill="#334155" stroke="#0f172a" stroke-width="2" />
            <circle cx="0" cy="-24" r="2.5" fill="#22c55e" />
          </g>
        ` : ''}
      </g>
    `;
  }

  // ACTIVE COMPANION PET DRAWING (Sitting custom on bottom right at hero's feet)
  let petSvg = '';
  if (activePetType === 'DRAGON') {
    petSvg = `
      <g filter="url(#bodyShadow)" transform="translate(310, 520) scale(0.52)">
        <circle cx="0" cy="0" r="42" fill="#2563eb" opacity="0.12" />
        <ellipse cx="0" cy="12" rx="20" ry="17" fill="#3b82f6" stroke="#1d4ed8" stroke-width="3" />
        <circle cx="0" cy="-15" r="15" fill="#3b82f6" stroke="#1d4ed8" stroke-width="3" />
        <polygon points="-6,-28 -9,-35 -3,-27" fill="#facc15" stroke="#b45309" stroke-width="1.5" />
        <polygon points="6,-28 9,-35 4,-27" fill="#facc15" stroke="#b45309" stroke-width="1.5" />
        <!-- Wing -->
        <path d="M12,-8 C26,-20 20,4 6,-1" fill="#60a5fa" stroke="#1d4ed8" stroke-width="2" />
        <circle cx="-5" cy="-15" r="3" fill="#0f172a" />
        <circle cx="5" cy="-15" r="3" fill="#0f172a" />
        <circle cx="-6" cy="-16" r="1" fill="#fff" />
        <circle cx="4" cy="-16" r="1" fill="#fff" />
        <!-- Happy blush -->
        <ellipse cx="-10" cy="-10" rx="3.5" ry="1.5" fill="#fda4af" />
        <ellipse cx="10" cy="-10" rx="3.5" ry="1.5" fill="#fda4af" />
      </g>
    `;
  } else if (activePetType === 'SLIME') {
    petSvg = `
      <g filter="url(#bodyShadow)" transform="translate(310, 520) scale(0.55)">
        <path d="M0,-28 C-25,-16 -25,18 0,18 C25,18 25,-16 0,-28 Z" fill="#38bdf8" stroke="#0284c7" stroke-width="3" />
        <circle cx="-5" cy="-9" r="2.8" fill="#0369a1" />
        <circle cx="5" cy="-9" r="2.8" fill="#0369a1" />
        <path d="M-2,-5 Q0,-2 2,-5" fill="none" stroke="#0369a1" stroke-width="2" />
        <!-- Side cute sparkles -->
        <ellipse cx="-9" cy="-5" rx="3.5" ry="1.5" fill="#fda4af" opacity="0.8" />
        <ellipse cx="9" cy="-5" rx="3.5" ry="1.5" fill="#fda4af" opacity="0.8" />
      </g>
    `;
  } else if (activePetType === 'CAT') {
    petSvg = `
      <g filter="url(#bodyShadow)" transform="translate(310, 520) scale(0.55)">
        <ellipse cx="0" cy="12" rx="20" ry="17" fill="#fff" stroke="#475569" stroke-width="3.2" />
        <circle cx="0" cy="-15" r="15" fill="#fff" stroke="#475569" stroke-width="3.2" />
        <polygon points="-12,-26 -15,-35 -3,-25" fill="#fca5a5" stroke="#475569" stroke-width="1.2" />
        <polygon points="12,-26 15,-35 3,-25" fill="#fca5a5" stroke="#475569" stroke-width="1.2" />
        <path d="M-15,5 C-20,0 -20,-10 -15,-8" fill="#fff" stroke="#475569" stroke-width="2.5" /> <!-- paw -->
        <!-- Eyes shut cute smile -->
        <path d="M-8,-17 Q-5,-20 -2,-17" stroke="#334155" stroke-width="1.8" fill="none" />
        <path d="M2,-17 Q5,-20 8,-17" stroke="#334155" stroke-width="1.8" fill="none" />
        <rect x="-6" y="8" width="12" height="14" rx="3" fill="#fbbf24" stroke="#78350f" stroke-width="1.5" /> <!-- lucky coin -->
      </g>
    `;
  } else if (activePetType === 'OWL') {
    petSvg = `
      <g filter="url(#bodyShadow)" transform="translate(310, 520) scale(0.52)">
        <rect x="-14" y="20" width="28" height="10" rx="2" fill="#854d0e" stroke="#451a03" stroke-width="1.5" />
        <path d="M-18,-15 C-20,-26 -8,-28 -3,-26 M3,-26 C8,-28 20,-26 18,-15 C21,8 13,20 0,18 C-13,20 -21,8 -18,-15 Z" fill="#b45309" stroke="#451a03" stroke-width="3" />
        <ellipse cx="0" cy="4" rx="11" ry="12" fill="#fef3c7" />
        <!-- Glasses -->
        <circle cx="-6" cy="-11" r="6.5" fill="#fff" stroke="#ca8a04" stroke-width="1.5" />
        <circle cx="-6" cy="-11" r="2" fill="#0f172a" />
        <circle cx="6" cy="-11" r="6.5" fill="#fff" stroke="#ca8a04" stroke-width="1.5" />
        <circle cx="6" cy="-11" r="2" fill="#0f172a" />
        <line x1="-1" y1="-11" x2="1" y2="-11" stroke="#ca8a04" stroke-width="2.5" />
        <polygon points="0,-10 -2.5,-4 2.5,-4" fill="#f97316" stroke="#451a03" stroke-width="1" />
      </g>
    `;
  }

  // Assemble full layered portrait vector frame
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600" width="100%" height="100%">
      ${CHARACTER_DEFS}
      ${charBgGrad}

      <!-- Background card wall -->
      <rect width="400" height="600" rx="32" fill="url(#${bgGradId})" />

      <!-- High contrast godrays/glows background elements -->
      <g opacity="0.12">
        <circle cx="200" cy="240" r="180" fill="#fff" />
        <line x1="200" y1="240" x2="-20" y2="40" stroke="#fff" stroke-width="12" />
        <line x1="200" y1="240" x2="420" y2="40" stroke="#fff" stroke-width="12" />
        <line x1="200" y1="240" x2="-20" y2="440" stroke="#fff" stroke-width="12" />
        <line x1="200" y1="240" x2="420" y2="440" stroke="#fff" stroke-width="12" />
      </g>

      <!-- Signature hand-drawn cute clouds in the background -->
      <g opacity="0.32" fill="#fff">
        <path d="M40,70 Q60,50 80,70 T120,70 Q130,90 110,100 H50 Z" />
        <path d="M280,80 Q300,60 320,80 T360,80 Q370,100 350,110 H290 Z" />
      </g>
      
      <!-- Lighting shimmer overlay -->
      <rect width="400" height="600" rx="32" fill="url(#charLight)" pointer-events="none" />

      <!-- LAYERED CONTENT RENDER -->
      ${characterBodySvg}
      ${petSvg}

      <!-- Radiant magic sparkles drifting around -->
      <g opacity="0.8">
        <path d="M50,300 L53,293 L60,290 L53,287 L50,280 L47,287 L40,290 L47,293 Z" fill="#fef08a" />
        <path d="M340,320 L342,315 L347,313 L342,311 L340,306 L338,311 L333,313 L338,315 Z" fill="#fff" />
        <path d="M310,180 L311,176 L315,175 L311,174 L310,170 L309,174 L305,175 L309,176 Z" fill="#fef08a" />
        <path d="M80,160 L81,156 L85,155 L81,154 L80,150 L79,154 L75,155 L79,156 Z" fill="#fff" />
      </g>
    </svg>
  `;

  // Clean and encode
  return svg.replace(/\s+/g, ' ').replace(/>\s+</g, '><').trim();
}

export function getCharacterPortraitSvgUri(
  character: Character, 
  equippedItemNames: string[],
  activePetType?: 'DRAGON' | 'CAT' | 'OWL' | 'SLIME'
): string {
  const cleanSvg = getCharacterPortraitSvg(character, equippedItemNames, activePetType);
  return `data:image/svg+xml;utf8,${encodeURIComponent(cleanSvg)}`;
}
