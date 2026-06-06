/**
 * Premium SVG Generator for Magic Shop Items (Weapons, Armors, Pets, Consumables)
 * Matches the warm, colorful, child-friendly hand-drawn cartoon "clouds" style
 * of the WordLand training arena (修炼场).
 */

const SVGGradients = `
  <defs>
    <!-- Background Gradients -->
    <linearGradient id="itemBgGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#f8fafc"/>
      <stop offset="100%" stop-color="#e2e8f0"/>
    </linearGradient>
    <linearGradient id="magicGold" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#fbbf24"/>
      <stop offset="100%" stop-color="#b45309"/>
    </linearGradient>
    <linearGradient id="fireGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#ef4444"/>
      <stop offset="100%" stop-color="#f97316"/>
    </linearGradient>
    <linearGradient id="holyGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#fffbeb"/>
      <stop offset="50%" stop-color="#fef08a"/>
      <stop offset="100%" stop-color="#ca8a04"/>
    </linearGradient>
    <linearGradient id="voidGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#8b5cf6"/>
      <stop offset="100%" stop-color="#1e1b4b"/>
    </linearGradient>
    <linearGradient id="forestGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#4ade80"/>
      <stop offset="100%" stop-color="#166534"/>
    </linearGradient>
    <linearGradient id="shadowGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#475569"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </linearGradient>
    
    <filter id="itemShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="2" dy="4" stdDeviation="3" flood-color="#475569" flood-opacity="0.15" />
    </filter>
  </defs>
`;

// Draw item SVGs based on their names
export function getShopItemSvg(itemName: string): string {
  let content = '';
  const cleanName = itemName.trim();

  if (cleanName === '破魔者之剑') {
    content = `
      <!-- Iron sword with hilt and slight rust/scratches -->
      <g filter="url(#itemShadow)" transform="translate(100, 100) rotate(45)">
        <!-- Blade -->
        <path d="M-6,-65 L6,-65 L8,15 L-8,15 Z" fill="#cbd5e1" stroke="#475569" stroke-width="4" stroke-linejoin="round" />
        <line x1="0" y1="-60" x2="0" y2="15" stroke="#94a3b8" stroke-width="2" />
        <!-- Scratches -->
        <path d="M-3,-20 L2,-15" stroke="#64748b" stroke-width="2" />
        <path d="M2,-40 L-2,-35" stroke="#64748b" stroke-width="2" />
        <!-- Guard -->
        <path d="M-18,15 L18,15 L12,22 L-12,22 Z" fill="#b45309" stroke="#78350f" stroke-width="3" stroke-linejoin="round" />
        <!-- Grip -->
        <rect x="-4" y="22" width="8" height="25" rx="2" fill="#78350f" stroke="#451a03" stroke-width="3" />
        <!-- Pommel -->
        <circle cx="0" cy="51" r="7" fill="#fbbf24" stroke="#78350f" stroke-width="2.5" />
      </g>
    `;
  } else if (cleanName === '勇气头盔') {
    content = `
      <g filter="url(#itemShadow)" transform="translate(100, 100)">
        <!-- Red crest plume -->
        <path d="M-5,-45 Q-25,-40 -20,-15 Q-5,-25 5,-45" fill="#ef4444" stroke="#991b1b" stroke-width="3" />
        <path d="M5,-45 Q25,-40 20,-15 Q5,-25 -5,-45" fill="#ef4444" stroke="#991b1b" stroke-width="3" />
        <!-- Plume center -->
        <path d="M-2,-50 C-10,-65 10,-65 2,-50 Z" fill="#f43f5e" />
        <!-- Helmet Bowl -->
        <path d="M-35,15 C-35,-35 35,-35 35,15 Z" fill="#94a3b8" stroke="#334155" stroke-width="4.5" />
        <!-- Visor / Face guard -->
        <path d="M-28,0 L28,0 Q25,25 0,28 Q-25,25 -28,0 Z" fill="#cbd5e1" stroke="#334155" stroke-width="3.5" />
        <line x1="-15" y1="12" x2="15" y2="12" stroke="#475569" stroke-width="3" stroke-dasharray="2 3" stroke-linecap="round" />
        <!-- Golden Forehead Plate -->
        <path d="M-12,-15 L12,-15 L8,-5 L-8,-5 Z" fill="#fbbf24" stroke="#b45309" stroke-width="2" />
        <circle cx="0" cy="-10" r="2.5" fill="#ef4444" />
      </g>
    `;
  } else if (cleanName === '狮心盾') {
    content = `
      <g filter="url(#itemShadow)" transform="translate(100, 100)">
        <!-- Shield base -->
        <path d="M-35,-35 L35,-35 Q38,15 0,45 Q-38,15 -35,-35 Z" fill="url(#magicGold)" stroke="#78350f" stroke-width="4.5" stroke-linejoin="round" />
        <!-- Inner Crimson Roundel -->
        <path d="M-25,-25 L25,-25 Q27,10 0,33 Q-27,10 -25,-25 Z" fill="#ef4444" opacity="0.9" />
        <!-- Cute roaring lion crest in gold -->
        <circle cx="0" cy="-4" r="10" fill="#fef08a" stroke="#b45309" stroke-width="2" />
        <!-- Lion Mane -->
        <path d="M-12,-12 L-4,-15 L0,-12 L4,-15 L12,-12 L15,-4 L12,0 L15,4 L8,10 L0,7 L-8,10 L-15,4 L-12,0 Z" fill="#f59e0b" opacity="0.5" />
        <!-- Lion Face details -->
        <circle cx="-3" cy="-6" r="1" fill="#334155" />
        <circle cx="3" cy="-6" r="1" fill="#334155" />
        <path d="M-2,-2 L2,-2 L0,0 Z" fill="#78350f" />
        <path d="M-4,2 Q0,5 4,2" fill="none" stroke="#78350f" stroke-width="1.5" />
      </g>
    `;
  } else if (cleanName === '钢铁护肩') {
    content = `
      <g filter="url(#itemShadow)" transform="translate(100, 100)">
        <!-- Right shoulder guard -->
        <g transform="translate(-18, 0)">
          <path d="M-22,-10 C-22,-25 15,-30 22,-5 C25,12 -5,25 -22,-10 Z" fill="#94a3b8" stroke="#334155" stroke-width="4.5" />
          <path d="M-15,-8 C-15,-18 10,-22 15,-5 C16,8 -3,17 -15,-8 Z" fill="#cbd5e1" />
          <!-- Rivets -->
          <circle cx="-14" cy="5" r="2" fill="#475569" />
          <circle cx="12" cy="6" r="2" fill="#475569" />
        </g>
        <!-- Left shoulder guard -->
        <g transform="translate(18, 0) scale(-1, 1)">
          <path d="M-22,-10 C-22,-25 15,-30 22,-5 C25,12 -5,25 -22,-10 Z" fill="#94a3b8" stroke="#334155" stroke-width="4.5" />
          <path d="M-15,-8 C-15,-18 10,-22 15,-5 C16,8 -3,17 -15,-8 Z" fill="#cbd5e1" />
          <circle cx="-14" cy="5" r="2" fill="#475569" />
          <circle cx="12" cy="6" r="2" fill="#475569" />
        </g>
        <!-- Connecting leather leash strap -->
        <path d="M-18,-4 L18,-4" stroke="#78350f" stroke-width="3" stroke-linecap="round" />
        <rect x="-4" y="-7" width="8" height="6" fill="#fbbf24" stroke="#78350f" stroke-width="1.5" />
      </g>
    `;
  } else if (cleanName === '炎龙重剑') {
    content = `
      <g filter="url(#itemShadow)" transform="translate(100, 100) rotate(45)">
        <!-- Massive wide fire blade -->
        <path d="M-12,-75 L12,-75 L15,10 L-15,10 Z" fill="url(#fireGrad)" stroke="#7f1d1d" stroke-width="4.5" stroke-linejoin="round" />
        <!-- Molten magma veins dynamic glow -->
        <path d="M-3,-65 L5,-50 L-4,-30 L3,-10 L-2,5" fill="none" stroke="#fef08a" stroke-width="3.5" stroke-linecap="round" />
        <path d="M3,-60 L-3,-45 L4,-25" fill="none" stroke="#facc15" stroke-width="2" stroke-linecap="round" />
        <!-- Dragon wing style Guard -->
        <path d="M-32,10 Q0,5 32,10 L25,24 L0,15 L-25,24 Z" fill="#3f1414" stroke="#7f1d1d" stroke-width="3" stroke-linejoin="round" />
        <!-- Glowing ruby center -->
        <circle cx="0" cy="14" r="5" fill="#ef4444" stroke="#fff" stroke-width="1.5" />
        <!-- Grip -->
        <rect x="-6" y="24" width="12" height="35" rx="3" fill="#451a03" stroke="#1c0a00" stroke-width="3.5" />
        <!-- Spiky Pommel -->
        <polygon points="0,70 -7,58 7,58" fill="#7f1d1d" stroke="#3f1414" stroke-width="2" />
      </g>
    `;
  } else if (cleanName === '皇家卫队蓝甲') {
    content = `
      <g filter="url(#itemShadow)" transform="translate(100, 100)">
        <!-- Polished Sapphire Blue breastplate -->
        <path d="M-28,-25 C-15,-32 15,-32 28,-25 L24,15 C20,32 -20,32 -24,15 Z" fill="#0284c7" stroke="#1e293b" stroke-width="4.5" stroke-linejoin="round" />
        <!-- Inner bright guard chest plate -->
        <path d="M-20,-20 Q0,-25 20,-20 L16,8 Q0,20 -16,8 Z" fill="#0ea5e9" />
        <!-- Gold Trim borders -->
        <path d="M-28,-25 C-15,-32 15,-32 28,-25" fill="none" stroke="#fbbf24" stroke-width="3" />
        <!-- Royal lion crest sketch in gold -->
        <path d="M-6,0 Q0,-8 6,0 Q0,8 -6,0" fill="#fbbf24" stroke="#b45309" stroke-width="1.5" />
        <circle cx="0" cy="0" r="1.5" fill="#ef4444" />
        <!-- Shoulder guards and leather straps -->
        <rect x="-26" y="-12" width="6" height="15" rx="1" fill="#78350f" stroke="#334155" stroke-width="1.5" />
        <rect x="20" y="-12" width="6" height="15" rx="1" fill="#78350f" stroke="#334155" stroke-width="1.5" />
      </g>
    `;
  } else if (cleanName === '不屈誓言巨盾') {
    content = `
      <g filter="url(#itemShadow)" transform="translate(100, 100)">
        <!-- Giant steel towering shield -->
        <path d="M-32,-45 L32,-45 L36,15 C36,35 0,55 0,55 C0,55 -36,35 -36,15 Z" fill="#64748b" stroke="#1e293b" stroke-width="5" stroke-linejoin="round" />
        <!-- Silver steel borders -->
        <path d="M-25,-38 L25,-38 L28,12 C28,28 0,45 0,45 C0,45 -28,28 -28,12 Z" fill="#475569" />
        <!-- Golden Holy Cross in the center -->
        <path d="M-5,-25 L5,-25 L5,-10 L20,-10 L20,0 L5,0 L5,25 L-5,25 L-5,0 L-20,0 L-20,-10 L-5,-10 Z" fill="url(#magicGold)" stroke="#78350f" stroke-width="2.5" />
        <!-- Holy lights tiny diamond particles -->
        <path d="M22,20 L24,16 L26,20 L24,24 Z" fill="#fff" />
        <path d="M-25,-10 L-23,-14 L-21,-10 L-23,-6 Z" fill="#fff" />
      </g>
    `;
  } else if (cleanName === '弑神圣光巨剑') {
    content = `
      <g filter="url(#itemShadow)" transform="translate(100, 100) rotate(45)">
        <!-- Glowing angelic laser blade -->
        <path d="M-8,-82 L8,-82 L12,12 L-12,12 Z" fill="url(#holyGrad)" stroke="#d97706" stroke-width="4" stroke-linejoin="round" />
        <!-- High frequency celestial core lines -->
        <line x1="0" y1="-78" x2="0" y2="10" stroke="#ffffff" stroke-width="3" stroke-linecap="round" />
        <!-- Angel Wing Guard styling in gold-white -->
        <path d="M-35,12 C-15,8 0,16 0,16 C0,16 15,8 35,12 L22,25 Q0,18 -22,25 Z" fill="#fef08a" stroke="#ca8a04" stroke-width="3.5" stroke-linejoin="round" />
        <!-- Glowing diamond blue gem in hilt center -->
        <polygon points="0,2 6,10 0,18 -6,10" fill="#38bdf8" stroke="#fff" stroke-width="1.5" />
        <!-- Pure white handle grip -->
        <rect x="-5" y="24" width="10" height="38" rx="2" fill="#fff" stroke="#94a3b8" stroke-width="3" />
        <line x1="-5" y1="36" x2="5" y2="36" stroke="#e2e8f0" stroke-width="1.5" />
        <!-- Holy cross star pommel -->
        <path d="M0,62 L3,65 L0,70 L-3,65 Z M-4,66 L0,62 L4,66 L0,69 Z" fill="#fbbf24" />
      </g>
    `;
  } else if (cleanName === '泰坦神域重甲') {
    content = `
      <g filter="url(#itemShadow)" transform="translate(100, 100)">
        <!-- Dense mythical golden plates -->
        <path d="M-30,-28 C-18,-35 18,-35 30,-28 L26,-10 L34,18 C28,38 -28,38 -34,18 L-26,-10 Z" fill="url(#magicGold)" stroke="#3f2305" stroke-width="4.5" stroke-linejoin="round" />
        <!-- Glowing starcore magic battery in middle chest -->
        <circle cx="0" cy="5" r="12" fill="#0284c7" stroke="#fbbf24" stroke-width="3" />
        <polygon points="0,-7 6,5 -6,5" fill="#fef08a" />
        <polygon points="0,8 5,-2 -5,-2" fill="#38bdf8" />
        <!-- Engraved runic lines -->
        <path d="M-22,-15 Q-10,-10 -5,-20" fill="none" stroke="#331800" stroke-width="2.5" stroke-linecap="round" />
        <path d="M22,-15 Q10,-10 5,-20" fill="none" stroke="#331800" stroke-width="2.5" stroke-linecap="round" />
        <!-- Heavy steel collar guards -->
        <path d="M-15,-28 C-5,-32 5,-32 15,-28 L10,-20 C3,-22 -3,-22 -10,-20 Z" fill="#94a3b8" stroke="#475569" stroke-width="2" />
      </g>
    `;
  } 
  // Mage Gear (Elara c2)
  else if (cleanName === '星辰法杖') {
    content = `
      <g filter="url(#itemShadow)" transform="translate(100, 100) rotate(-15)">
        <!-- Magical wooden rod -->
        <rect x="-4" y="-45" width="8" height="105" rx="3" fill="#78350f" stroke="#451a03" stroke-width="3.5" />
        <!-- Wooden knots and vines details wrapping -->
        <path d="M-4,-20 Q4,-10 -4,0 Q4,10 -4,20" fill="none" stroke="#451a03" stroke-width="2" />
        <!-- Magical gold crescent tip holder -->
        <path d="M-16,-55 C-12,-40 12,-40 16,-55 C12,-52 -12,-52 -16,-55" fill="url(#magicGold)" stroke="#78350f" stroke-width="2" />
        <path d="M-18,-45 A18,18 0 0,1 18,-45 L10,-42 A12,12 0 0,0 -10,-42 Z" fill="#fbbf24" stroke="#78350f" stroke-width="2.5" />
        <!-- Sapphire glowing energy crystal orb -->
        <circle cx="0" cy="-55" r="14" fill="#38bdf8" stroke="#fff" stroke-width="2" />
        <circle cx="-4" cy="-59" r="4" fill="#fff" opacity="0.6" />
        <!-- Tiny magic star sparkles floating around -->
        <path d="M-20,-70 Q-15,-72 -18,-76 Q-21,-72 -20,-70 Z" fill="#fef08a" />
        <path d="M22,-60 Q25,-58 24,-64 Q21,-58 22,-60 Z" fill="#fef08a" />
      </g>
    `;
  } else if (cleanName === '星光法帽') {
    content = `
      <g filter="url(#itemShadow)" transform="translate(100, 100)">
        <!-- Wide floppy purple hat brim -->
        <ellipse cx="0" cy="22" rx="48" ry="12" fill="#7c3aed" stroke="#2e1065" stroke-width="4" />
        <!-- Hat fabric cone bending slightly left -->
        <path d="M-28,16 Q-30,-22 -5,-44 Q28,16 28,16" fill="none" stroke="#2e1065" stroke-width="5" />
        <path d="M-28,16 Q-25,-25 -10,-43 Q-14,-50 -22,-44 Q-24,-33 -26,-22 C-34,-12 -38,10 -28,16 Z" fill="#a78bfa" opacity="0.3" />
        <path d="M-28,16 Q-18,-45 -12,-52 Q18,-20 28,16 Z" fill="#6d28d9" stroke="#2e1065" stroke-width="4.5" stroke-linejoin="round" />
        <!-- Gold belt strapping -->
        <path d="M-21,12 Q0,9 21,12 L22,17 Q0,14 -22,17 Z" fill="#fbbf24" stroke="#78350f" stroke-width="2" />
        <!-- Belt square bucket -->
        <rect x="-6" y="9" width="12" height="11" rx="2" fill="#fbbf24" stroke="#b45309" stroke-width="2" />
        <rect x="-2" y="13" width="4" height="3" fill="#6d28d9" />
        <!-- Star shapes printed on felt -->
        <polygon points="10,-12 12,-7 17,-7 13,-4 15,1 10,-2 5,1 7,-4 3,-7 8,-7" fill="#fde047" stroke="#ca8a04" stroke-width="1" />
        <polygon points="-12,-20 -10,-16 -6,-16 -9,-14 -8,-10 -12,-12 -16,-10 -15,-14 -18,-16 -14,-16" fill="#fde047" stroke="#ca8a04" stroke-width="1" />
      </g>
    `;
  } else if (cleanName === '星光披风') {
    content = `
      <g filter="url(#itemShadow)" transform="translate(100, 100)">
        <!-- Cloak cape backing -->
        <path d="M-15,-30 L15,-30 L38,40 Q0,50 -38,40 Z" fill="#5b21b6" stroke="#2e1065" stroke-width="4" stroke-linejoin="round" />
        <!-- Inside lining folds -->
        <path d="M-15,-30 L0,-30 L-22,38 Q-12,42 -38,40 Z" fill="#7c3aed" opacity="0.8" />
        <path d="M15,-30 L0,-30 L22,38 Q12,42 38,40 Z" fill="#7c3aed" opacity="0.8" />
        <!-- Gold necklace clasp with center red amulet -->
        <path d="M-15,-30 Q0,-18 15,-30" fill="none" stroke="#fbbf24" stroke-width="3.5" stroke-linecap="round" />
        <rect x="-5" y="-24" width="10" height="10" rx="2" fill="#ef4444" stroke="#b45309" stroke-width="2" />
        <!-- Stars designs -->
        <path d="M16,10 L19,13 L16,16 L13,13 Z" fill="#fef08a" />
        <path d="M-18,-5 L-15,-2 L-18,1 L-21,-2 Z" fill="#fef08a" />
      </g>
    `;
  } else if (cleanName === '法术魔典') {
    content = `
      <g filter="url(#itemShadow)" transform="translate(100, 100)">
        <!-- Thick antique book leather sleeve -->
        <rect x="-30" y="-40" width="60" height="80" rx="8" fill="#78350f" stroke="#3b1704" stroke-width="4.5" />
        <!-- Gold reinforced book corners -->
        <path d="M-30,-32 L-30,-40 L-22,-40 Z" fill="#fbbf24" />
        <path d="M30,-32 L30,-40 L22,-40 Z" fill="#fbbf24" />
        <path d="M-30,32 L-30,40 L-22,40 Z" fill="#fbbf24" />
        <path d="M30,32 L30,40 L22,40 Z" fill="#fbbf24" />
        <!-- Thick paper stack sides visible underneath -->
        <rect x="-24" y="-34" width="48" height="68" fill="#fef3c7" stroke="#d97706" stroke-width="2" />
        <!-- Book spine strap -->
        <rect x="-4" y="-40" width="8" height="80" fill="#451a03" />
        <!-- Mystical glowing magic circle emblem -->
        <circle cx="0" cy="0" r="14" fill="none" stroke="#a78bfa" stroke-width="2.5" stroke-dasharray="4 2" />
        <polygon points="0,-10 8,5 -8,5" fill="none" stroke="#c084fc" stroke-width="2" />
        <polygon points="0,10 8,-5 -8,-5" fill="none" stroke="#c084fc" stroke-width="2" />
      </g>
    `;
  } else if (cleanName === '虚空秘典') {
    content = `
      <g filter="url(#itemShadow)" transform="translate(100, 100)">
        <!-- Eerie cosmic tome -->
        <rect x="-32" y="-42" width="64" height="84" rx="10" fill="url(#voidGrad)" stroke="#1e1b4b" stroke-width="4" />
        <rect x="-24" y="-36" width="48" height="72" fill="#111827" stroke="#4c1d95" stroke-width="1.5" />
        <!-- Void purple glowing eye glyph -->
        <path d="M-18,0 Q0,-12 18,0 Q0,12 -18,0 Z" fill="#6d28d9" stroke="#c084fc" stroke-width="2" />
        <circle cx="0" cy="0" r="6" fill="#111827" />
        <circle cx="0" cy="0" r="2.5" fill="#a78bfa" />
        <circle cx="2" cy="-2" r="1" fill="#fff" />
        <!-- Cosmic stars sparkles -->
        <circle cx="-16" cy="-24" r="1.5" fill="#fff" />
        <circle cx="16" cy="24" r="1.5" fill="#fff" />
        <circle cx="18" cy="-20" r="1" fill="#a78bfa" opacity="0.8" />
        <circle cx="-20" cy="18" r="1" fill="#a78bfa" opacity="0.8" />
      </g>
    `;
  } else if (cleanName === '高阶法袍') {
    content = `
      <g filter="url(#itemShadow)" transform="translate(100, 100)">
        <!-- Velvet violet gown -->
        <path d="M-18,-35 L18,-35 L28,40 L-28,40 Z" fill="#6d28d9" stroke="#2e1065" stroke-width="4" stroke-linejoin="round" />
        <!-- Bell sleeves standard witch clothing -->
        <path d="M-18,-30 L-34,-10 L-26,0 L-14,-15 Z" fill="#5b21b6" stroke="#2e1065" stroke-width="3" />
        <path d="M18,-30 L34,-10 L26,0 L14,-15 Z" fill="#5b21b6" stroke="#2e1065" stroke-width="3" />
        <!-- Shiny Silver Embroidery collars -->
        <path d="M-18,-35 L0,-8 L18,-35" fill="none" stroke="#e2e8f0" stroke-width="3" stroke-linecap="round" />
        <path d="M-8,-15 Q0,-8 8,-15" fill="none" stroke="#e2e8f0" stroke-width="2" />
        <!-- Gold sash belt -->
        <rect x="-16" y="8" width="32" height="6" fill="#fbbf24" stroke="#78350f" stroke-width="1.5" />
      </g>
    `;
  } else if (cleanName === '潮汐圣歌法杖') {
    content = `
      <g filter="url(#itemShadow)" transform="translate(100, 100) rotate(-15)">
        <!-- Pearl white divine stick -->
        <rect x="-3" y="-45" width="6" height="105" rx="3" fill="#f1f5f9" stroke="#475569" stroke-width="3.5" />
        <!-- Golden spirals and shell structure tips -->
        <path d="M-12,-55 C-8,-38 8,-38 12,-55 C5,-45 -5,-45 -12,-55" fill="url(#magicGold)" stroke="#78350f" stroke-width="2" />
        <!-- Shell dynamic motif -->
        <path d="M-15,-52 L0,-72 L15,-52 Q7,-48 0,-54 Q-7,-48 -15,-52 Z" fill="#fef08a" stroke="#ca8a04" stroke-width="2" stroke-linejoin="round" />
        <!-- Sea Water crest swirls -->
        <path d="M-16,-35 Q-8,-42 0,-35 Q8,-42 16,-35" fill="none" stroke="#38bdf8" stroke-width="2.5" stroke-linecap="round" />
        <!-- Shiny diamond aqua core -->
        <circle cx="0" cy="-57" r="8" fill="#06b6d4" stroke="#fff" stroke-width="1.5" />
        <circle cx="3" cy="-55" r="5" fill="#38bdf8" />
      </g>
    `;
  } else if (cleanName === '混沌天演魔杖') {
    content = `
      <g filter="url(#itemShadow)" transform="translate(100, 100) rotate(-15)">
        <!-- Tall dark magical scepter of chaotic gravity -->
        <rect x="-4.5" y="-55" width="9" height="120" rx="4" fill="url(#shadowGrad)" stroke="#1e1b4b" stroke-width="4" />
        <!-- Cosmic space dark matter rings crossing diagonally -->
        <ellipse cx="0" cy="-62" rx="26" ry="6" fill="none" stroke="#c084fc" stroke-width="3.5" stroke-dasharray="10 3" transform="rotate(22, 0, -62)" />
        <ellipse cx="0" cy="-62" rx="26" ry="6" fill="none" stroke="#f43f5e" stroke-width="2" transform="rotate(-15, 0, -62)" />
        <!-- Black hole gravity core sphere -->
        <circle cx="0" cy="-62" r="15" fill="#090d16" stroke="#a78bfa" stroke-width="4.5" />
        <!-- Swirling violet corona flare -->
        <circle cx="0" cy="-62" r="9" fill="none" stroke="#e879f9" stroke-width="3" stroke-dasharray="2 1" />
        <!-- Mini sparkles -->
        <circle cx="-13" cy="-35" r="1.5" fill="#f43f5e" />
        <circle cx="15" cy="-80" r="1.5" fill="#c084fc" />
      </g>
    `;
  } else if (cleanName === '星界不灭神袍') {
    content = `
      <g filter="url(#itemShadow)" transform="translate(100, 100)">
        <!-- Majestic dark space gown with cosmic star sparkles -->
        <path d="M-22,-36 L22,-36 L34,44 L-34,44 Z" fill="url(#voidGrad)" stroke="#1e1b4b" stroke-width="4.5" stroke-linejoin="round" />
        <!-- Elegant celestial golden shoulder crest wraps -->
        <path d="M-26,-36 L-10,-36 L-8,-14 L-28,-14 Z" fill="url(#magicGold)" stroke="#78350f" stroke-width="2" />
        <path d="M26,-36 L10,-36 L8,-14 L28,-14 Z" fill="url(#magicGold)" stroke="#78350f" stroke-width="2" />
        <!-- Cosmic galaxy print inside gown front -->
        <path d="M-15,-20 L15,-20 L22,40 L-22,40 Z" fill="#0f172a" opacity="0.6" />
        <!-- Star spots -->
        <polygon points="0,-10 2,-4 8,-4 4,0 6,6 0,2 -6,6 -4,0 -8,-4 -2,-4" fill="#fff" />
        <circle cx="-12" cy="15" r="1.5" fill="#fff" />
        <circle cx="12" cy="15" r="1.5" fill="#fff" />
        <circle cx="8" cy="-2" r="1" fill="#fde047" />
        <circle cx="-10" cy="-2" r="1" fill="#fde047" />
      </g>
    `;
  } 
  // Ranger Gear (Inari c3)
  else if (cleanName === '森之弓') {
    content = `
      <g filter="url(#itemShadow)" transform="translate(100, 100) rotate(-45)">
        <!-- Living organic wooden crescent bow -->
        <path d="M-3,-65 C-28,-30 -28,30 -3,65 C-8,45 -12,20 -12,0 C-12,-20 -8,-45 -3,-65 Z" fill="url(#forestGrad)" stroke="#14532d" stroke-width="4.5" stroke-linejoin="round" />
        <!-- Glowing bow string -->
        <line x1="-3" y1="-61" x2="-3" y2="61" stroke="#86efac" stroke-width="2" stroke-dasharray="2 2" />
        <!-- Living leafy foliage shoots decoration -->
        <path d="M-24,-24 C-35,-26 -35,-12 -24,-11 Z" fill="#22c55e" stroke="#166534" stroke-width="1.5" />
        <path d="M-22,11 C-33,12 -33,26 -22,24 Z" fill="#22c55e" stroke="#166534" stroke-width="1.5" />
        <!-- Comfy brown leather handle wrap -->
        <rect x="-13" y="-12" width="6" height="24" fill="#78350f" stroke="#451a03" stroke-width="1.5" />
      </g>
    `;
  } else if (cleanName === '森林兜帽') {
    content = `
      <g filter="url(#itemShadow)" transform="translate(100, 100)">
        <!-- Green leaf-styled cloak hood -->
        <path d="M-30,22 C-34,-12 -30,-38 0,-40 C30,-38 34,-12 30,22 C18,22 10,14 0,16 C-10,14 -18,22 -30,22 Z" fill="#15803d" stroke="#14532d" stroke-width="4" stroke-linejoin="round" />
        <!-- Inner shadow/opening detail -->
        <path d="M-12,14 Q0,2 12,14 Q16,-20 0,-24 Q-16,-20 -12,14 Z" fill="#14532d" opacity="0.9" />
        <!-- Cute leaf-vein stitches on sides -->
        <path d="M-15,-20 L-24,-25 M-16,-10 L-25,-12 M15,-20 L24,-25 M16,-10 L25,-12" stroke="#86efac" stroke-width="1.5" stroke-linecap="round" />
        <!-- Tiny leaf bud charm in front collar -->
        <path d="M-4,18 C-10,24 0,35 0,35 C0,35 10,24 4,18 Z" fill="#4ade80" stroke="#15803d" stroke-width="1.5" />
      </g>
    `;
  } else if (cleanName === '鹰眼箭袋') {
    content = `
      <g filter="url(#itemShadow)" transform="translate(100, 100) rotate(15)">
        <!-- Arrow quiver basket -->
        <rect x="-16" y="-30" width="32" height="70" rx="8" fill="#78350f" stroke="#451a03" stroke-width="4" />
        <rect x="-11" y="-24" width="22" height="58" fill="#b45309" />
        <!-- Eagle wing icon engraved -->
        <path d="M-8,-5 Q0,-12 8,-5 Q2,5 -8,-5" fill="#fbbf24" stroke="#78350f" stroke-width="1.5" />
        <!-- Arrows stuffed inside -->
        <g transform="translate(0, -10)">
          <!-- Arrow 1 -->
          <line x1="-8" y1="-32" x2="-8" y2="-12" stroke="#e2e8f0" stroke-width="3.5" />
          <polygon points="-8,-42 -13,-32 -3,-32" fill="#ef4444" />
          <!-- Arrow 2 -->
          <line x1="4" y1="-35" x2="4" y2="-12" stroke="#e2e8f0" stroke-width="3.5" />
          <polygon points="4,-45 -1,-35 9,-35" fill="#fbbf24" />
        </g>
        <!-- Strap belt -->
        <path d="M-16,-15 L-30,-22 M16,10 L30,15" stroke="#451a03" stroke-width="4" stroke-linecap="round" />
      </g>
    `;
  } else if (cleanName === '疾风靴') {
    content = `
      <g filter="url(#itemShadow)" transform="translate(100, 100)">
        <!-- Dynamic winged boots -->
        <!-- Right Boot -->
        <g transform="translate(-16, 10)">
          <path d="M-12,-25 Q0,-25 2,-12 L6,14 C6,14 18,15 15,22 L-10,22 C-15,10 -15,-10 -12,-25 Z" fill="#b45309" stroke="#451a03" stroke-width="3" />
          <!-- Little white winged speed charm -->
          <path d="M-10,-5 Q-20,-10 -22,-2 C-18,-3 -12,-3 -10,-5 Z" fill="#fff" stroke="#94a3b8" stroke-width="1.5" />
          <path d="M-10,-10 Q-24,-16 -26,-7 C-20,-8 -12,-8 -10,-10 Z" fill="#fff" stroke="#94a3b8" stroke-width="1.5" />
          <!-- Golden trim -->
          <path d="M-12,-25 L-2,-25" fill="none" stroke="#fbbf24" stroke-width="2.5" />
        </g>
        <!-- Left Boot -->
        <g transform="translate(16, 10) scale(-1, 1)">
          <path d="M-12,-25 Q0,-25 2,-12 L6,14 C6,14 18,15 15,22 L-10,22 C-15,10 -15,-10 -12,-25 Z" fill="#b45309" stroke="#451a03" stroke-width="3" />
          <path d="M-10,-5 Q-20,-10 -22,-2 C-18,-3 -12,-3 -10,-5 Z" fill="#fff" stroke="#94a3b8" stroke-width="1.5" />
          <path d="M-10,-10 Q-24,-16 -26,-7 C-20,-8 -12,-8 -10,-10 Z" fill="#fff" stroke="#94a3b8" stroke-width="1.5" />
          <path d="M-12,-25 L-2,-25" fill="none" stroke="#fbbf24" stroke-width="2.5" />
        </g>
      </g>
    `;
  } else if (cleanName === '秘银轻弩') {
    content = `
      <g filter="url(#itemShadow)" transform="translate(100, 100) rotate(30)">
        <!-- Quick shooter mechanical crossbow -->
        <!-- Bow limb -->
        <path d="M-36,-26 C-12,-8 12,-8 36,-26" fill="none" stroke="#cbd5e1" stroke-width="5" stroke-linecap="round" />
        <path d="M-36,-26 C-12,-12 12,-12 36,-26" fill="none" stroke="#94a3b8" stroke-width="3" />
        <!-- Bow string -->
        <line x1="-34" y1="-23" x2="34" y2="-23" stroke="#e2e8f0" stroke-width="1.5" />
        <!-- Stock / handle shaft -->
        <rect x="-5" y="-35" width="10" height="75" rx="3" fill="#78350f" stroke="#451a03" stroke-width="3" />
        <rect x="-3" y="-32" width="6" height="30" fill="#94a3b8" />
        <!-- Trigger clip -->
        <path d="M-3,20 Q0,32 5,28" fill="none" stroke="#fbbf24" stroke-width="2.5" />
        <!-- Small arrow nested -->
        <line x1="0" y1="-25" x2="0" y2="-5" stroke="#ef4444" stroke-width="2.5" />
        <polygon points="0,-32 -4,-25 4,-25" fill="#ef4444" />
      </g>
    `;
  } else if (cleanName === '游侠皮甲套装') {
    content = `
      <g filter="url(#itemShadow)" transform="translate(100, 100)">
        <!-- Organic forest green leather setup -->
        <path d="M-22,-28 Q0,-32 22,-28 L18,18 C14,30 -14,30 -18,18 Z" fill="#1e3a1e" stroke="#14532d" stroke-width="4.5" stroke-linejoin="round" />
        <path d="M-15,-20 L15,-20 L12,12 L-12,12 Z" fill="#2f5233" />
        <!-- Golden leafy chest harness clips -->
        <path d="M-14,-25 L14,10 M14,-25 L-14,10" stroke="#78350f" stroke-width="3" />
        <rect x="-4" y="-12" width="8" height="8" rx="1.5" fill="#facc15" stroke="#78350f" stroke-width="1.5" />
        <rect x="-20" y="5" width="4" height="8" fill="#78350f" />
        <rect x="16" y="5" width="4" height="8" fill="#78350f" />
      </g>
    `;
  } else if (cleanName === '月影追风长弓') {
    content = `
      <g filter="url(#itemShadow)" transform="translate(100, 100) rotate(-45)">
        <!-- Silver Moon shadow crescent bow -->
        <path d="M0,-72 C-32,-35 -32,35 0,72 C-15,45 -18,15 -18,0 C-18,-15 -15,-45 0,-72 Z" fill="#cbd5e1" stroke="#475569" stroke-width="4.5" stroke-linejoin="round" />
        <!-- Blue glowing line along crescent -->
        <path d="M-8,-55 C-22,-25 -22,25 -8,55" fill="none" stroke="#38bdf8" stroke-width="3" stroke-linecap="round" />
        <line x1="0" y1="-67" x2="0" y2="67" stroke="#93c5fd" stroke-width="1.5" stroke-dasharray="3 1" />
        <!-- Glowing moon charms at tips -->
        <circle cx="0" cy="-72" r="4.5" fill="#fbbf24" stroke="#fff" stroke-width="1" />
        <circle cx="0" cy="72" r="4.5" fill="#fbbf24" stroke="#fff" stroke-width="1" />
      </g>
    `;
  } else if (cleanName === '神树万物长弓') {
    content = `
      <g filter="url(#itemShadow)" transform="translate(100, 100) rotate(-45)">
        <!-- Ancient World Tree massive wooden bow -->
        <path d="M2,-78 C-36,-40 -36,40 2,78 C-12,50 -16,20 -16,0 C-16,-20 -12,-50 2,-78 Z" fill="#854d0e" stroke="#451a03" stroke-width="5" stroke-linejoin="round" />
        <!-- Flowering blossom branch wraps -->
        <path d="M-18,-35 Q-28,-25 -22,-15 Q-16,-5 -22,15" fill="none" stroke="#22c55e" stroke-width="2.5" />
        <!-- Pink blooming sakura petals -->
        <circle cx="-25" cy="-28" r="4" fill="#f472b6" />
        <circle cx="-23" cy="5" r="4" fill="#f472b6" />
        <circle cx="-16" cy="45" r="3.5" fill="#f59e0b" />
        <!-- Magical golden strings -->
        <line x1="2" y1="-73" x2="2" y2="73" stroke="#fef08a" stroke-width="2" />
      </g>
    `;
  } else if (cleanName === '疾风虚空轻甲') {
    content = `
      <g filter="url(#itemShadow)" transform="translate(100, 100)">
        <!-- Void leather tight phantom top -->
        <path d="M-22,-26 C-10,-30 10,-30 22,-26 L18,15 L12,28 L-12,28 L-18,15 Z" fill="#111827" stroke="#312e81" stroke-width="4" stroke-linejoin="round" />
        <!-- Eerie cosmic amethyst gem center -->
        <polygon points="0,-12 6,-2 0,8 -6,-2" fill="#c084fc" stroke="#fff" stroke-width="1.5" />
        <!-- Dark carbon plate overlays -->
        <rect x="-18" y="-6" width="6" height="15" rx="1" fill="#312e81" />
        <rect x="12" y="-6" width="6" height="15" rx="1" fill="#312e81" />
        <line x1="-12" y1="18" x2="12" y2="18" stroke="#818cf8" stroke-width="2" stroke-dasharray="3 3" />
      </g>
    `;
  } 
  // Assassin Gear (Kage c4)
  else if (cleanName === '刺客短刃') {
    content = `
      <g filter="url(#itemShadow)" transform="translate(100, 100) rotate(45)">
        <!-- Curved dark iron rogue dagger -->
        <path d="M-5,-45 L4,-45 C4,-45 10,-10 6,15 L-6,15 C-6,15 -10,-20 -5,-45 Z" fill="#334155" stroke="#0f172a" stroke-width="4" stroke-linejoin="round" />
        <path d="M0,-40 L2,-40 C2,-40 6,-8 4,12 L0,12 Z" fill="#64748b" />
        <!-- Poison/blood channel groove -->
        <line x1="-2" y1="-30" x2="-2" y2="8" stroke="#ef4444" stroke-width="1.5" stroke-linecap="round" />
        <!-- Guard ring -->
        <ellipse cx="0" cy="15" rx="12" ry="4" fill="#fbbf24" stroke="#78350f" stroke-width="2" />
        <!-- Grip wrapped in black tape -->
        <rect x="-4" y="19" width="8" height="22" rx="1" fill="#1e293b" stroke="#0f172a" stroke-width="2.5" />
        <line x1="-3.5" y1="26" x2="3.5" y2="26" stroke="#475569" stroke-width="1.5" />
        <!-- Iron ring Pommel -->
        <circle cx="0" cy="46" r="6" fill="none" stroke="#0f172a" stroke-width="3" />
      </g>
    `;
  } else if (cleanName === '影杀面具') {
    content = `
      <g filter="url(#itemShadow)" transform="translate(100, 100)">
        <!-- Scary rogue dark steel visor mask -->
        <path d="M-26,-15 L26,-15 C26,-15 28,15 0,34 C-28,15 -26,-15 -26,-15 Z" fill="#1e293b" stroke="#0f172a" stroke-width="4.5" stroke-linejoin="round" />
        <!-- Glowing ruby slit eye visor hole -->
        <path d="M-18,-2 Q-10,-6 0,-2 Q10,-6 18,-2 L14,2 Q0,-1 -14,2 Z" fill="#ef4444" stroke="#991b1b" stroke-width="2" />
        <!-- Ventilation plate holes -->
        <circle cx="-8" cy="14" r="1.5" fill="#0f172a" />
        <circle cx="0" cy="16" r="1.5" fill="#0f172a" />
        <circle cx="8" cy="14" r="1.5" fill="#0f172a" />
        <!-- Tribal cheek battle paints crimson color -->
        <path d="M-22,6 L-15,4 L-18,12 Z" fill="#ef4444" />
        <path d="M22,6 L15,4 L18,12 Z" fill="#ef4444" />
      </g>
    `;
  } else if (cleanName === '毒蝎手里剑') {
    content = `
      <g filter="url(#itemShadow)" transform="translate(100, 100)">
        <!-- Four-pointed toxic steel shuriken -->
        <!-- Center core circle of shuriken -->
        <circle cx="0" cy="0" r="11" fill="#475569" stroke="#0f172a" stroke-width="3" />
        <circle cx="0" cy="0" r="4.5" fill="#1e293b" />
        <!-- Blade 1 (Top) -->
        <path d="M-6,-10 L0,-40 L6,-10 L0,-8 Z" fill="#334155" stroke="#0f172a" stroke-width="3" stroke-linejoin="round" />
        <!-- Blade 2 (Right) -->
        <path d="M10,-6 L40,0 L10,6 L8,0 Z" fill="#334155" stroke="#0f172a" stroke-width="3" stroke-linejoin="round" />
        <!-- Blade 3 (Bottom) -->
        <path d="M6,10 L0,40 L-6,10 L0,8 Z" fill="#334155" stroke="#0f172a" stroke-width="3" stroke-linejoin="round" />
        <!-- Blade 4 (Left) -->
        <path d="M-10,6 L-40,0 L-10,-6 L-8,0 Z" fill="#334155" stroke="#0f172a" stroke-width="3" stroke-linejoin="round" />
        <!-- Green poison drops dripping from blades -->
        <circle cx="0" cy="-28" r="3.2" fill="#22c55e" />
        <circle cx="28" cy="0" r="3.2" fill="#22c55e" />
        <circle cx="3" cy="24" r="2.5" fill="#22c55e" />
      </g>
    `;
  } else if (cleanName === '血月暗黑双刃') {
    content = `
      <g filter="url(#itemShadow)" transform="translate(100, 100)">
        <!-- Twin crimson moon-phase swords crossing -->
        <!-- Main Saber -->
        <g transform="rotate(-30)">
          <path d="M-4,-48 C-12,-20 -6,10 -3,15 L3,15 C3,10 6,-20 -2,-48" fill="#ef4444" stroke="#7f1d1d" stroke-width="3" />
          <rect x="-3" y="15" width="6" height="15" rx="1" fill="#1e293b" />
          <circle cx="0" cy="33" r="3" fill="#fbbf24" />
        </g>
        <!-- Crossing Saber -->
        <g transform="rotate(30) scale(-1, 1)">
          <path d="M-4,-48 C-12,-20 -6,10 -3,15 L3,15 C3,10 6,-20 -2,-48" fill="#ef4444" stroke="#7f1d1d" stroke-width="3" />
          <rect x="-3" y="15" width="6" height="15" rx="1" fill="#1e293b" />
          <circle cx="0" cy="33" r="3" fill="#fbbf24" />
        </g>
      </g>
    `;
  } else if (cleanName === '潜行长靴') {
    content = `
      <g filter="url(#itemShadow)" transform="translate(100, 100)">
        <!-- Silent soundless leather footwear -->
        <g transform="translate(-16, 12)">
          <path d="M-10,-20 L4,-20 L6,10 Q14,12 12,18 L-8,18 C-12,8 -12,-8 -10,-20 Z" fill="#334155" stroke="#0f172a" stroke-width="3" />
          <rect x="-10" y="15" width="22" height="3" fill="#1e293b" />
        </g>
        <g transform="translate(16, 12) scale(-1, 1)">
          <path d="M-10,-20 L4,-20 L6,10 Q14,12 12,18 L-8,18 C-12,8 -12,-8 -10,-20 Z" fill="#334155" stroke="#0f172a" stroke-width="3" />
          <rect x="-10" y="15" width="22" height="3" fill="#1e293b" />
        </g>
      </g>
    `;
  } else if (cleanName === '夜行隐杀轻装') {
    content = `
      <g filter="url(#itemShadow)" transform="translate(100, 100)">
        <!-- Ninja tight tunic apparel -->
        <path d="M-20,-24 C-10,-28 10,-28 20,-24 L16,22 C12,30 -12,30 -16,22 Z" fill="#0f172a" stroke="#334155" stroke-width="4.5" stroke-linejoin="round" />
        <!-- Red ninja ribbon belt sash -->
        <rect x="-17" y="5" width="34" height="6" fill="#ef4444" stroke="#991b1b" stroke-width="1.5" />
        <!-- Floating ribbons behind belt -->
        <path d="M-6,11 Q-14,28 -10,32 Q-7,25 -2,11 Z" fill="#ef4444" />
        <path d="M4,11 Q12,25 8,30 Q6,20 2,11 Z" fill="#ef4444" />
      </g>
    `;
  } else if (cleanName === '暗影斗篷') {
    content = `
      <g filter="url(#itemShadow)" transform="translate(100, 100)">
        <path d="M-15,-28 L15,-28 L35,42 C20,38 -20,38 -35,42 Z" fill="#2e1065" stroke="#0f051d" stroke-width="4.5" />
        <!-- Purple smoky dynamic wisps -->
        <path d="M-22,0 Q-34,22 -15,35" fill="none" stroke="#7c3aed" stroke-width="2" opacity="0.6" stroke-linecap="round" />
        <path d="M22,0 Q34,22 15,35" fill="none" stroke="#7c3aed" stroke-width="2" opacity="0.6" stroke-linecap="round" />
        <!-- Shadow mask neck clasp -->
        <circle cx="0" cy="-21" r="5" fill="#ef4444" stroke="#fff" stroke-width="1" />
      </g>
    `;
  } else if (cleanName === '天诛无影神刃') {
    content = `
      <g filter="url(#itemShadow)" transform="translate(100, 100) rotate(45)">
        <!-- Swift katana glowing golden lightning energy -->
        <path d="M-4,-86 L4,-86 C4,-86 8,-20 5,15 L-5,15 C-5,15 -8,-20 -4,-86 Z" fill="url(#magicGold)" stroke="#78350f" stroke-width="4" stroke-linejoin="round" />
        <!-- Golden power rays -->
        <line x1="0" y1="-82" x2="0" y2="12" stroke="#fff" stroke-width="2.5" />
        <!-- Yellow electricity spark sparks overlay -->
        <path d="M-15,-50 L-8,-45 L-12,-38 L-4,-42" fill="none" stroke="#fde047" stroke-width="2.5" stroke-linecap="round" />
        <rect x="-12" y="15" width="24" height="6" rx="1.5" fill="#111827" stroke="#fbbf24" stroke-width="1.5" />
        <rect x="-4" y="21" width="8" height="36" fill="#1e293b" stroke="#111827" stroke-width="2.5" />
        <circle cx="0" cy="57.5" r="5.5" fill="#fbbf24" />
      </g>
    `;
  } else if (cleanName === '寂灭影流神装') {
    content = `
      <g filter="url(#itemShadow)" transform="translate(100, 100)">
        <!-- Master assassin crimson wrapping armor chest piece -->
        <path d="M-22,-26 L22,-26 L18,22 C14,32 -14,32 -18,22 Z" fill="#1e293b" stroke="#0f172a" stroke-width="4.5" stroke-linejoin="round" />
        <!-- Crimson ninja chest plate cross wraps -->
        <path d="M-20,-18 L16,16" stroke="#991b1b" stroke-width="3" />
        <path d="M20,-18 L-16,16" stroke="#991b1b" stroke-width="3" />
        <path d="M-20,-18 L16,16" stroke="#ef4444" stroke-width="1.5" />
        <path d="M20,-18 L-16,16" stroke="#ef4444" stroke-width="1.5" />
        <!-- Silver steel waist armor block -->
        <rect x="-10" y="14" width="20" height="10" rx="2" fill="#94a3b8" stroke="#475569" stroke-width="2" />
      </g>
    `;
  } 
  // Consumables & Food
  else if (cleanName === '经验药水') {
    content = `
      <g filter="url(#itemShadow)" transform="translate(100, 100)">
        <!-- Glass potion jar -->
        <path d="M-12,-32 L12,-32 L8,-18 L24,15 C28,26 18,36 6,36 L-6,36 C-18,36 -28,26 -24,15 L-8,-18 Z" fill="#cbd5e1" stroke="#475569" stroke-width="4.5" stroke-linejoin="round" />
        <!-- Glowing green inner chemicals liquid -->
        <path d="M-18,5 L18,5 C18,5 24,15 22,22 C20,29 12,32 0,32 C-12,32 -20,29 -22,22 Z" fill="#22c55e" opacity="0.9" />
        <!-- Magic floating bubbles -->
        <circle cx="-5" cy="18" r="3.2" fill="#86efac" />
        <circle cx="6" cy="12" r="2.2" fill="#86efac" />
        <circle cx="-2" cy="-2" r="2" fill="#fff" opacity="0.7" />
        <!-- Golden bottle cork cap -->
        <rect x="-10" y="-39" width="20" height="7" fill="#b45309" stroke="#78350f" stroke-width="2" />
        <!-- Glass reflections -->
        <path d="M-16,10 A24,24 0 0,1 -6,28" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" />
      </g>
    `;
  } else if (cleanName === '魔法苹果') {
    content = `
      <g filter="url(#itemShadow)" transform="translate(100, 100)">
        <!-- Bright cute cartoon apple -->
        <path d="M0,22 C-18,22 -32,10 -32,-15 C-32,-35 -15,-35 -4,-30 C-2,-30 2,-30 4,-30 C15,-35 32,-35 32,-15 C32,10 18,22 0,22 Z" fill="#ef4444" stroke="#991b1b" stroke-width="4.5" stroke-linejoin="round" />
        <!-- Apple Stem -->
        <path d="M0,-30 Q6,-42 16,-40" fill="none" stroke="#78350f" stroke-width="3" stroke-linecap="round" />
        <!-- Green leaf -->
        <path d="M10,-38 Q18,-42 20,-32 Q12,-30 10,-38" fill="#22c55e" stroke="#14532d" stroke-width="1.5" />
        <!-- Magic star shine -->
        <path d="M-14,-10 Q-10,-10 -10,-14 Q-10,-10 -6,-10 Q-10,-10 -10,-6 Z" fill="#fff" />
        <!-- Skin highlight reflection -->
        <ellipse cx="-16" cy="-18" rx="5" ry="8" fill="#fff" opacity="0.45" transform="rotate(-15, -16, -18)" />
      </g>
    `;
  } else if (cleanName === '优质肉块') {
    content = `
      <g filter="url(#itemShadow)" transform="translate(100, 100)">
        <!-- Chunky juicy steak on a bone -->
        <!-- White bone -->
        <rect x="-42" y="-5" width="48" height="10" rx="3" fill="#f1f5f9" stroke="#94a3b8" stroke-width="3.5" />
        <circle cx="-42" cy="-8" r="6" fill="#f1f5f9" stroke="#94a3b8" stroke-width="3" />
        <circle cx="-42" cy="8" r="6" fill="#f1f5f9" stroke="#94a3b8" stroke-width="3" />
        <!-- Meat slice body -->
        <path d="M-15,-24 C6,-34 36,-26 36,0 C36,26 6,34 -15,24 C-25,12 -25,-12 -15,-24 Z" fill="#ea580c" stroke="#7c2d12" stroke-width="4.5" />
        <!-- Center white bone core section -->
        <circle cx="16" cy="0" r="9" fill="#fff" stroke="#94a3b8" stroke-width="3" />
        <!-- Meat texture stripes patterns -->
        <path d="M-2,-14 Q8,-5 12,12" stroke="#f97316" stroke-width="3" stroke-linecap="round" fill="none" />
        <path d="M6,-11 Q14,-3 18,10" stroke="#f97316" stroke-width="2" stroke-linecap="round" fill="none" />
      </g>
    `;
  } else if (cleanName === '生命灵药') {
    content = `
      <g filter="url(#itemShadow)" transform="translate(100, 100)">
        <!-- Ruby red glass flask health elixir -->
        <rect x="-8" y="-36" width="16" height="15" rx="2" fill="#cbd5e1" stroke="#475569" stroke-width="4" />
        <!-- Bottle cork cap -->
        <rect x="-10" y="-42" width="20" height="7" fill="#b45309" stroke="#78350f" stroke-width="2" />
        <!-- Round bottle bulb -->
        <circle cx="0" cy="10" r="28" fill="#f1f5f9" stroke="#475569" stroke-width="4.5" />
        <!-- Red healing potion fluid -->
        <circle cx="0" cy="12" r="21" fill="#ec4899" />
        <path d="M-21,12 C-21,12 -10,3 -2,12 C6,21 21,12 21,12 C21,20  14,29 0,29 C-14,29 -21,20 -21,12 Z" fill="#ef4444" />
        <!-- Sparkle cross -->
        <path d="M0,-2 L0,10 M-6,4 L6,4" stroke="#fff" stroke-width="3" stroke-linecap="round" />
        <path d="M-18,-2 Q-10,-5 -14,-10 Q-18,-5 -18,-2 Z" fill="#fff" opacity="0.8" />
      </g>
    `;
  } 
  // Pets (General items but cute)
  else if (cleanName === '小蓝龙' || cleanName === '蓝龙宠兽') {
    content = `
      <g filter="url(#itemShadow)" transform="translate(100, 100)">
        <!-- Cute baby blue dragon -->
        <!-- Tail -->
        <path d="M12,18 Q36,18 32,32" fill="none" stroke="#2563eb" stroke-width="8.5" stroke-linecap="round" />
        <!-- Wings -->
        <path d="M-15,-10 C-36,-24 -28,8 -10,-2 Z" fill="#60a5fa" stroke="#1d4ed8" stroke-width="2.5" />
        <path d="M15,-10 C36,-24 28,8 10,-2 Z" fill="#60a5fa" stroke="#1d4ed8" stroke-width="2.5" />
        <!-- Body blob -->
        <ellipse cx="0" cy="12" rx="24" ry="20" fill="#3b82f6" stroke="#1d4ed8" stroke-width="4" />
        <ellipse cx="0" cy="16" rx="15" ry="12" fill="#93c5fd" />
        <!-- Dragon head -->
        <circle cx="0" cy="-18" r="18" fill="#3b82f6" stroke="#1d4ed8" stroke-width="4" />
        <!-- Tiny dragon horns yellow -->
        <polygon points="-8,-34 -11,-42 -4,-33" fill="#facc15" stroke="#b45309" stroke-width="2" />
        <polygon points="8,-34 11,-42 4,-33" fill="#facc15" stroke="#b45309" stroke-width="2" />
        <!-- Big cute puppy eyes -->
        <circle cx="-6" cy="-18" r="4" fill="#0f172a" />
        <circle cx="-7" cy="-19" r="1.5" fill="#fff" />
        <circle cx="6" cy="-18" r="4" fill="#0f172a" />
        <circle cx="5" cy="-19" r="1.5" fill="#fff" />
        <!-- Happy smiling snout mouth -->
        <path d="M-4,-10 Q0,-6 4,-10" fill="none" stroke="#1d4ed8" stroke-width="2" />
        <!-- Flame bubble -->
        <circle cx="16" cy="-5" r="5" fill="#f97316" opacity="0.6" />
      </g>
    `;
  } else if (cleanName === '波利史莱姆' || cleanName === '史莱姆') {
    content = `
      <g filter="url(#itemShadow)" transform="translate(100, 100)">
        <!-- Bouncy teardrop slime -->
        <path d="M0,-34 C-32,-20 -32,22 0,22 C32,22 32,-20 0,-34 Z" fill="#38bdf8" stroke="#0284c7" stroke-width="4" stroke-linejoin="round" />
        <!-- Floating internal sparkles -->
        <circle cx="-10" cy="-6" r="3" fill="#fff" opacity="0.5" />
        <circle cx="12" cy="4" r="2" fill="#fff" opacity="0.5" />
        <!-- Cute smiling face -->
        <circle cx="-6" cy="-11" r="3.2" fill="#0369a1" />
        <circle cx="-7.5" cy="-12" r="1" fill="#fff" />
        <circle cx="6" cy="-11" r="3.2" fill="#0369a1" />
        <circle cx="4.5" cy="-12" r="1" fill="#fff" />
        <!-- Smiling arc -->
        <path d="M-3,-5 Q0,-2 3,-5" fill="none" stroke="#0369a1" stroke-width="2.5" stroke-linecap="round" />
        <!-- Rosy pink cheeks -->
        <ellipse cx="-12" cy="-6" rx="3.5" ry="1.8" fill="#fda4af" opacity="0.75" />
        <ellipse cx="12" cy="-6" rx="3.5" ry="1.8" fill="#fda4af" opacity="0.75" />
      </g>
    `;
  } else if (cleanName === '招财猫') {
    content = `
      <g filter="url(#itemShadow)" transform="translate(100, 100)">
        <!-- White lucky beckoning cat -->
        <!-- Body -->
        <ellipse cx="0" cy="14" rx="24" ry="20" fill="#fff" stroke="#475569" stroke-width="4" />
        <!-- Red Collar and Gold bell -->
        <path d="M-18,0 Q0,5 18,0" stroke="#ef4444" stroke-width="3" fill="none" />
        <circle cx="0" cy="5" r="5" fill="#fbbf24" stroke="#78350f" stroke-width="1" />
        <!-- Head -->
        <circle cx="0" cy="-18" r="18" fill="#fff" stroke="#475569" stroke-width="4" />
        <!-- Pink inner ears -->
        <polygon points="-14,-31 -18,-42 -4,-30" fill="#fca5a5" stroke="#475569" stroke-width="1.5" />
        <polygon points="14,-31 18,-42 4,-30" fill="#fca5a5" stroke="#475569" stroke-width="1.5" />
        <!-- Waving left paw up -->
        <path d="M-19,8 C-25,2 -25,-12 -18,-10 C-12,-8 -12,2 -19,8 Z" fill="#fff" stroke="#475569" stroke-width="3" />
        <!-- Big gold coin held in lap -->
        <rect x="-8" y="10" width="16" height="18" rx="4" fill="#fbbf24" stroke="#78350f" stroke-width="2" />
        <line x1="0" y1="12" x2="0" y2="26" stroke="#b45309" stroke-width="1.5" />
        <!-- Cat face lines -->
        <!-- Eyes squinting shut in joy -->
        <path d="M-10,-20 Q-7,-23 -4,-20" stroke="#334155" stroke-width="2" fill="none" stroke-linecap="round" />
        <path d="M4,-20 Q7,-23 10,-20" stroke="#334155" stroke-width="2" fill="none" stroke-linecap="round" />
        <!-- Nose / Mouth -->
        <path d="M-2,-14 Q0,-16 2,-14" stroke="#334155" stroke-width="2" fill="none" />
        <!-- Whiskers -->
        <line x1="-14" y1="-15" x2="-22" y2="-17" stroke="#94a3b8" stroke-width="1.5" />
        <line x1="-14" y1="-11" x2="-21" y2="-11" stroke="#94a3b8" stroke-width="1.5" />
        <line x1="14" y1="-15" x2="22" y2="-17" stroke="#94a3b8" stroke-width="1.5" />
        <line x1="14" y1="-11" x2="21" y2="-11" stroke="#94a3b8" stroke-width="1.5" />
      </g>
    `;
  } else if (cleanName === '智慧之鸮') {
    content = `
      <g filter="url(#itemShadow)" transform="translate(100, 100)">
        <!-- Chubby sage owl perched on timber log -->
        <rect x="-18" y="24" width="36" height="12" rx="3" fill="#854d0e" stroke="#451a03" stroke-width="2" />
        <path d="M-22,-18 C-25,-32 -10,-35 -4,-32 C-2,-32 2,-32 4,-32 C10,-35 25,-32 22,-18 C26,10 16,24 0,22 C-16,24 -26,10 -22,-18 Z" fill="#b45309" stroke="#451a03" stroke-width="4" />
        <ellipse cx="0" cy="5" rx="14" ry="15" fill="#fef3c7" />
        <!-- Owl feathers checks -->
        <path d="M-5,4 L0,1 L5,4" stroke="#d97706" stroke-width="2" fill="none" />
        <path d="M-5,11 L0,8 L5,11" stroke="#d97706" stroke-width="2" fill="none" />
        <!-- Big wise spectacles eyes -->
        <circle cx="-8" cy="-14" r="8" fill="#fff" stroke="#ca8a04" stroke-width="2" />
        <circle cx="-8" cy="-14" r="3" fill="#0f172a" />
        <circle cx="8" cy="-14" r="8" fill="#fff" stroke="#ca8a04" stroke-width="2" />
        <circle cx="8" cy="-14" r="3" fill="#0f172a" />
        <!-- Spectacles bridge -->
        <line x1="-1" y1="-14" x2="1" y2="-14" stroke="#ca8a04" stroke-width="3.5" />
        <!-- Cute orange beak beak -->
        <polygon points="0,-12 -3.5,-5 3.5,-5" fill="#f97316" stroke="#451a03" stroke-width="1.5" />
      </g>
    `;
  } 
  // Fallbacks if unknown name
  else {
    content = `
      <g filter="url(#itemShadow)" transform="translate(100, 100)">
        <rect x="-24" y="-24" width="48" height="48" rx="8" fill="url(#magicGold)" stroke="#78350f" stroke-width="3" />
        <polygon points="0,-12 3,-3 12,-3 5,2 8,11 0,6 -8,11 -5,2 -12,-3 -3,-3" fill="#fff" />
        <circle cx="0" cy="30" r="3" fill="#b45309" />
      </g>
    `;
  }

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100%" height="100%">
      ${SVGGradients}
      <!-- Soft colorful base circle behind -->
      <circle cx="100" cy="100" r="90" fill="url(#itemBgGrad)" stroke="#f1f5f9" stroke-width="3" />
      
      <!-- Ambient child clouds behind item matching word training arena -->
      <g opacity="0.25">
        <path d="M20,60 C30,50 45,50 55,60 C65,50 80,50 90,60" fill="none" stroke="#64748b" stroke-width="3.5" stroke-linecap="round" />
        <path d="M110,140 C120,130 135,130 145,140 C155,130 170,130 180,140" fill="none" stroke="#64748b" stroke-width="3.5" stroke-linecap="round" />
        <circle cx="155" cy="50" r="6" fill="#fff" />
        <circle cx="45" cy="150" r="8" fill="#fff" />
      </g>
      
      ${content}
    </svg>
  `;

  // Clean formatting to make it a safe inline DataURI
  return svg.replace(/\s+/g, ' ').replace(/>\s+</g, '><').trim();
}

export function getShopItemSvgUri(itemName: string): string {
  const cleanSvg = getShopItemSvg(itemName);
  return `data:image/svg+xml;utf8,${encodeURIComponent(cleanSvg)}`;
}
