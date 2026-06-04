/**
 * Premium Dynamic SVG Illustration Generator for WordLand Adventure Picture Books.
 * Renders gorgeous, warm, high-contrast and child-friendly vector illustrations
 * matching the cute hand-held cartoon picture book style.
 * Uses 100% stable inline-svg encoded to DataURIs.
 */

// Existing high-quality pre-generated image assets
const CAT_PNG = '/src/assets/images/picbook_cat_1780562998321.png';
const FAT_CAT_PNG = '/src/assets/images/picbook_fat_cat_1780563015884.png';
const RAT_PNG = '/src/assets/images/picbook_rat_1780563032822.png';
const BAD_RAT_PNG = '/src/assets/images/picbook_bad_rat_1780563050522.png';
const BAT_PNG = '/src/assets/images/picbook_bat_1780563068637.png';
const SAD_BAT_PNG = '/src/assets/images/picbook_sad_bat_1780563086634.png';

const DAD_MAD_PNG = '/src/assets/images/dad_mad_1780575595863.png';
const DAD_SAD_PNG = '/src/assets/images/dad_sad_1780575614289.png';
const DAD_GLAD_PNG = '/src/assets/images/dad_glad_1780575633904.png';

const PICBOOK_FAT_RAT_PNG = '/src/assets/images/picbook_fat_rat_1780576877687.png';
const PICBOOK_FAT_BAT_PNG = '/src/assets/images/picbook_fat_bat_1780576896015.png';
const PICBOOK_SPORTS_BAT_PNG = '/src/assets/images/picbook_sports_bat_1780576914796.png';
const PICBOOK_COZY_MAT_PNG = '/src/assets/images/picbook_cozy_mat_1780576929177.png';
const PICBOOK_CUTE_HAT_PNG = '/src/assets/images/picbook_cute_hat_1780576943479.png';
const PICBOOK_TOY_PAD_PNG = '/src/assets/images/picbook_toy_pad_1780576959864.png';

// Cute shared SVG design fragments (represented as inline SVG nodes)
const SVGGradients = `
  <defs>
    <!-- Background Gradients -->
    <linearGradient id="bgGradCozy" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#fff5f5"/>
      <stop offset="100%" stop-color="#fffcf0"/>
    </linearGradient>
    <linearGradient id="bgGradAqua" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#e0f2fe"/>
      <stop offset="100%" stop-color="#f0fdf4"/>
    </linearGradient>
    <linearGradient id="bgGradViolet" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#faf5ff"/>
      <stop offset="100%" stop-color="#fdf2f8"/>
    </linearGradient>
    <linearGradient id="bgGradWarm" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#ffedd5"/>
      <stop offset="100%" stop-color="#fef3c7"/>
    </linearGradient>

    <!-- Cute patterns and shadows -->
    <filter id="softShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="2" dy="5" stdDeviation="4" flood-color="#475569" flood-opacity="0.12" />
    </filter>
  </defs>
`;

/**
 * Renders a full SVG image wrapped as a clean Data URI.
 */
function createSvgUri(content: string, bgType: 'cozy' | 'aqua' | 'violet' | 'warm' = 'cozy'): string {
  const bgColors = {
    cozy: 'url(#bgGradCozy)',
    aqua: 'url(#bgGradAqua)',
    violet: 'url(#bgGradViolet)',
    warm: 'url(#bgGradWarm)',
  };

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="100%" height="100%">
      ${SVGGradients}
      <!-- Canvas frame background -->
      <rect width="400" height="300" rx="24" fill="${bgColors[bgType]}" />
      
      <!-- Hand-drawn background clouds or details -->
      <g opacity="0.3">
        <path d="M40,50 Q60,30 80,50 T120,50 Q130,70 110,80 H50 Z" fill="#ffffff" />
        <path d="M280,60 Q300,40 320,60 T360,60 Q370,80 350,90 H290 Z" fill="#ffffff" />
        <circle cx="50" cy="270" r="40" fill="#ffffff" />
        <circle cx="350" cy="260" r="30" fill="#ffffff" />
      </g>
      
      <!-- Inner Main Illustration Content -->
      ${content}
    </svg>
  `;
  
  // Clean up formatting to make it a safe DataURI
  const cleaned = svg
    .replace(/\s+/g, ' ')
    .replace(/>\s+</g, '><')
    .trim();
  
  return `data:image/svg+xml;utf8,${encodeURIComponent(cleaned)}`;
}

// ==========================================
// INDIVIDUAL ITEM DRAWINGS (SVG FRAGMENTS)
// ==========================================

function drawCozyMat(x: number, y: number, scale = 1): string {
  return `
    <g transform="translate(${x}, ${y}) scale(${scale})" filter="url(#softShadow)">
      <!-- Woven fringed Mat/Rug -->
      <!-- Left side fringes -->
      <path d="M-85,-12 L-85,12 M-85,-8 L-89,-8 M-85,-4 L-89,-4 M-85,0 L-89,0 M-85,4 L-89,4 M-85,8 L-89,8" stroke="#f43f5e" stroke-width="2.5" stroke-linecap="round" />
      <!-- Right side fringes -->
      <path d="M85,-12 L85,12 M85,-8 L89,-8 M85,-4 L89,-4 M85,0 L89,0 M85,4 L89,4 M85,8 L89,8" stroke="#f43f5e" stroke-width="2.5" stroke-linecap="round" />
      
      <!-- Mat Base -->
      <rect x="-80" y="-15" width="160" height="30" rx="8" fill="#fda4af" stroke="#e11d48" stroke-width="3" />
      <!-- Woven stripes -->
      <rect x="-60" y="-15" width="12" height="30" fill="#ec4899" opacity="0.3" />
      <rect x="-30" y="-15" width="12" height="30" fill="#facc15" opacity="0.4" />
      <rect x="0" y="-15" width="12" height="30" fill="#2dd4bf" opacity="0.3" />
      <rect x="30" y="-15" width="12" height="30" fill="#facc15" opacity="0.4" />
      <rect x="60" y="-15" width="12" height="30" fill="#ec4899" opacity="0.3" />
      <!-- Stitch detail -->
      <line x1="-75" y1="0" x2="75" y2="0" stroke="#fff" stroke-width="2" stroke-dasharray="4 4" />
    </g>
  `;
}

function drawWitchHat(x: number, y: number, scale = 1): string {
  return `
    <g transform="translate(${x}, ${y}) scale(${scale})" filter="url(#softShadow)">
      <!-- Cute witch/explorer hat -->
      <ellipse cx="0" cy="20" rx="45" ry="10" fill="#8b5cf6" stroke="#4c1d95" stroke-width="3" />
      <path d="M-25,15 Q0,-35 0,-40 Q0,-35 25,15 Z" fill="#6d28d9" stroke="#4c1d95" stroke-width="3" stroke-linejoin="round" />
      <!-- Hat ribbon -->
      <path d="M-18,10 Q0,8 18,10 L19,16 Q0,14 -19,16 Z" fill="#facc15" stroke="#4c1d95" stroke-width="1.5" />
      <!-- Gold buckle -->
      <rect x="-5" y="8" width="10" height="10" rx="2" fill="#fbbf24" stroke="#d97706" stroke-width="2" />
      <rect x="-2" y="11" width="4" height="4" fill="#6d28d9" />
      <!-- Sparles/Stars on Hat -->
      <path d="M-10,-10 Q-10,-14 -12,-14 Q-10,-14 -10,-18 Q-10,-14 -8,-14 Q-10,-14 -10,-10 Z" fill="#fff" />
      <path d="M12,-5 Q12,-8 10,-8 Q12,-8 12,-11 Q12,-8 14,-8 Q12,-8 12,-5 Z" fill="#fef08a" />
    </g>
  `;
}

function drawAdventureMap(x: number, y: number, scale = 1): string {
  return `
    <g transform="translate(${x}, ${y}) scale(${scale})" filter="url(#softShadow)">
      <!-- Rolled parchment treasure map -->
      <rect x="-50" y="-35" width="100" height="70" rx="6" fill="#fef3c7" stroke="#b45309" stroke-width="3" />
      <!-- Torn edges details -->
      <path d="M-50,-20 Q-53,-15 -50,-10 M50,-15 Q53,-10 50,-5 M-50,10 Q-53,15 -50,20" stroke="#b45309" stroke-width="2" />
      <!-- Compass Rose -->
      <circle cx="-30" cy="-15" r="8" fill="none" stroke="#d97706" stroke-width="1.5" />
      <line x1="-30" y1="-25" x2="-30" y2="-5" stroke="#d97706" stroke-width="1.5" />
      <line x1="-40" y1="-15" x2="-20" y2="-15" stroke="#d97706" stroke-width="1.5" />
      <!-- Island outlines -->
      <path d="M15,-15 Q30,-25 35,-10 Q40,5 25,15 Q10,10 15,-15 Z" fill="#fde047" opacity="0.6" stroke="#b45309" stroke-width="1.5" />
      <path d="M-15,15 Q-5,10 0,20 Q5,30 -5,25 Q-15,25 -15,15 Z" fill="#fde047" opacity="0.6" stroke="#b45309" stroke-width="1.5" />
      <!-- Red Dotted Trail & X marks the spot -->
      <path d="M-20,-5 Q15,-3 20,5 Q20,15 -5,18" fill="none" stroke="#ef4444" stroke-width="2.5" stroke-dasharray="3 3" />
      <path d="M-8,14 L-2,22 M-2,14 L-8,22" stroke="#ef4444" stroke-width="3" stroke-linecap="round" />
      <!-- Tiny Palm tree -->
      <path d="M28,-8 Q25,-1 24,5" fill="none" stroke="#78350f" stroke-width="2" />
      <path d="M24,-10 Q28,-14 32,-10 Q28,-5 24,-10" fill="#22c55e" />
    </g>
  `;
}

function drawSchoolBag(x: number, y: number, scale = 1): string {
  return `
    <g transform="translate(${x}, ${y}) scale(${scale})" filter="url(#softShadow)">
      <!-- Cute explorer backpack orange & teal -->
      <rect x="-35" y="-30" width="70" height="75" rx="16" fill="#f97316" stroke="#c2410c" stroke-width="3" />
      <!-- Front pocket -->
      <rect x="-22" y="10" width="44" height="28" rx="8" fill="#06b6d4" stroke="#0891b2" stroke-width="2.5" />
      <!-- Flap overhead -->
      <path d="M-35,-15 Q0,-35 35,-15 C35,-5 20,5 0,5 C-20,5 -35,-5 -35,-15 Z" fill="#ea580c" stroke="#c2410c" stroke-width="3" />
      <!-- Cute buckles and straps -->
      <rect x="-16" y="0" width="6" height="15" fill="#facc15" stroke="#c2410c" stroke-width="1.5" />
      <rect x="10" y="0" width="6" height="15" fill="#facc15" stroke="#c2410c" stroke-width="1.5" />
      <!-- Keyring / Star embellishment -->
      <path d="M28,8 Q35,8 35,16" stroke="#475569" stroke-width="2" fill="none" />
      <path d="M35,18 Q35,15 37,15 Q35,15 35,12 Q35,15 33,15 Q35,15 35,18 Z" fill="#fbbf24" stroke="#d97706" stroke-width="1" />
      <!-- Top handle -->
      <path d="M-15,-30 Q0,-45 15,-30" fill="none" stroke="#22d3ee" stroke-width="4" stroke-linecap="round" />
    </g>
  `;
}

function drawRoyalFlag(x: number, y: number, scale = 1): string {
  return `
    <g transform="translate(${x}, ${y}) scale(${scale})" filter="url(#softShadow)">
      <!-- Gold pole flag staff -->
      <line x1="-25" y1="-55" x2="-25" y2="45" stroke="#78350f" stroke-width="4" stroke-linecap="round" />
      <circle cx="-25" cy="-57" r="5" fill="#fbbf24" stroke="#d97706" stroke-width="1.5" />
      
      <!-- Triangular waving flag -->
      <path d="M-23,-50 L25,-32 L-23,-14 Z" fill="#ef4444" stroke="#b91c1c" stroke-width="3" stroke-linejoin="round" />
      <!-- Mini crown/star design inside -->
      <path d="M-12,-35 L-10,-28 L-5,-28 L-9,-24 L-7,-18 L-12,-22 L-17,-18 L-15,-24 L-19,-28 L-14,-28 Z" fill="#fdeb61" stroke="#d97706" stroke-width="1" />
      <!-- Motion wind breeze trails -->
      <path d="M20,-48 Q35,-42 30,-32" fill="none" stroke="#38bdf8" stroke-width="2" stroke-linecap="round" opacity="0.6"/>
      <path d="M15,-10 Q25,-15 30,-8" fill="none" stroke="#38bdf8" stroke-width="2" stroke-linecap="round" opacity="0.6"/>
    </g>
  `;
}

function drawSportBat(x: number, y: number, scale = 1): string {
  return `
    <g transform="translate(${x}, ${y}) scale(${scale})" filter="url(#softShadow)">
      <!-- Cute wooden tennis/baseball bat -->
      <g transform="rotate(-30)">
        <!-- Grip -->
        <rect x="-6" y="25" width="12" height="25" rx="3" fill="#ea580c" stroke="#c2410c" stroke-width="2.5" />
        <line x1="-6" y1="35" x2="6" y2="35" stroke="#fff" stroke-width="1.5" />
        <line x1="-6" y1="42" x2="6" y2="42" stroke="#fff" stroke-width="1.5" />
        <!-- Main wooden stick body -->
        <path d="M-8,25 Q-14,-35 -14,-45 C-14,-50 14,-50 14,-45 Q14,-35 8,25 Z" fill="#fde047" stroke="#ca8a04" stroke-width="3" stroke-linejoin="round" />
        <!-- Wood grains -->
        <path d="M-4,-20 Q-2,-50 -6,-40" fill="none" stroke="#eab308" stroke-width="2" />
        <path d="M4,-10 Q6,-35 2,-25" fill="none" stroke="#eab308" stroke-width="2" />
        <!-- Smile face on bat -->
        <circle cx="-4" cy="-15" r="2.5" fill="#ca8a04" />
        <circle cx="4" cy="-15" r="2.5" fill="#ca8a04" />
        <path d="M-3,-8 Q0,-5 3,-8" fill="none" stroke="#ca8a04" stroke-width="2" stroke-linecap="round" />
      </g>
    </g>
  `;
}

function drawInteractivePad(x: number, y: number, scale = 1): string {
  return `
    <g transform="translate(${x}, ${y}) scale(${scale})" filter="url(#softShadow)">
      <!-- Tablet with bright display -->
      <rect x="-42" y="-32" width="84" height="64" rx="10" fill="#334155" stroke="#1e293b" stroke-width="4.5" />
      <!-- Glowing display screen -->
      <rect x="-34" y="-24" width="68" height="48" rx="4" fill="#06b6d4" stroke="#0891b2" stroke-width="1.5" />
      <!-- Cute smiley sun showing on tablet -->
      <circle cx="0" cy="0" r="14" fill="#fdeb61" stroke="#ea580c" stroke-width="1.5" />
      <!-- Sun eyes and mouth -->
      <circle cx="-4" cy="-2" r="1.5" fill="#451a03" />
      <circle cx="4" cy="-2" r="1.5" fill="#451a03" />
      <path d="M-3,3 Q0,6 3,3" fill="none" stroke="#451a03" stroke-width="1.5" stroke-linecap="round" />
      <!-- Sun rays -->
      <line x1="0" y1="-20" x2="0" y2="-17" stroke="#ea580c" stroke-width="2" stroke-linecap="round" />
      <line x1="0" y1="20" x2="0" y2="17" stroke="#ea580c" stroke-width="2" stroke-linecap="round" />
      <line x1="-20" y1="0" x2="-17" y2="0" stroke="#ea580c" stroke-width="2" stroke-linecap="round" />
      <line x1="20" y1="0" x2="17" y2="0" stroke="#ea580c" stroke-width="2" stroke-linecap="round" />
      <!-- Interactive glowing sparkle rings -->
      <path d="M-25,-15 Q-30,-22 -24,-20" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" />
      <circle cx="26" cy="16" r="3" fill="#fff" />
      <!-- Home Button -->
      <circle cx="38" cy="0" r="2" fill="#94a3b8" />
    </g>
  `;
}

function drawSportyCap(x: number, y: number, scale = 1): string {
  return `
    <g transform="translate(${x}, ${y}) scale(${scale})" filter="url(#softShadow)">
      <!-- Trendy baseball cap -->
      <!-- Back strap detail -->
      <path d="M-30,5 Q-32,15 -20,16" fill="none" stroke="#475569" stroke-width="3" stroke-linecap="round" />
      <!-- Crown dome -->
      <path d="M-32,10 Q-35,-25 0,-25 Q35,-25 32,10 Z" fill="#ef4444" stroke="#991b1b" stroke-width="3" />
      <!-- Front visor/brim -->
      <path d="M15,5 Q40,4 48,15 Q30,22 15,10 Z" fill="#b91c1c" stroke="#7f1d1d" stroke-width="3" />
      <!-- Segment stitch seams -->
      <path d="M0,-25 Q12,-5 15,10" fill="none" stroke="#b91c1c" stroke-width="2" />
      <path d="M0,-25 Q-12,-5 -15,10" fill="none" stroke="#b91c1c" stroke-width="2" />
      <!-- Top button -->
      <circle cx="0" cy="-25" r="4.5" fill="#facc15" stroke="#991b1b" stroke-width="1.5" />
      <!-- Cute star badge on the crown -->
      <path d="M-5,-5 Q0,-8 5,-5 Q0,-2 -5,-5" fill="#fbbf24" stroke="#d97706" stroke-width="1" />
      <polygon points="0,-8 2,-2 8,0 2,2 0,8 -2,2 -8,0 -2,-2" fill="#fbbf24" />
    </g>
  `;
}

function drawCamperVan(x: number, y: number, scale = 1): string {
  return `
    <g transform="translate(${x}, ${y}) scale(${scale})" filter="url(#softShadow)">
      <!-- Adorable retro tiny toy van -->
      <!-- Wheels -->
      <circle cx="-32" cy="30" r="14" fill="#1e293b" />
      <circle cx="-32" cy="30" r="6" fill="#cbd5e1" stroke="#475569" stroke-width="2" />
      <circle cx="32" cy="30" r="14" fill="#1e293b" />
      <circle cx="32" cy="30" r="6" fill="#cbd5e1" stroke="#475569" stroke-width="2" />
      
      <!-- Van Chassis -->
      <!-- Top Half (Cream) -->
      <path d="M-48,-5 C-48,-25 -25,-28 0,-28 C25,-28 48,-25 48,-5 L48,15 L-48,15 Z" fill="#fef3c7" stroke="#ca8a04" stroke-width="3" />
      <!-- Bottom Half (Teal) -->
      <rect x="-48" y="10" width="96" height="20" fill="#0d9488" stroke="#115e59" stroke-width="3" />
      
      <!-- Divider strip -->
      <rect x="-48" y="8" width="96" height="4" fill="#fbbf24" />
      
      <!-- Windows -->
      <rect x="-35" y="-18" width="22" height="15" rx="3" fill="#38bdf8" stroke="#115e59" stroke-width="2" />
      <rect x="-5" y="-18" width="22" height="15" rx="3" fill="#38bdf8" stroke="#115e59" stroke-width="2" />
      <path d="M24,-18 L40,-18 C43,-18 44,-10 42,-3 L24,-3 Z" fill="#38bdf8" stroke="#115e59" stroke-width="2" />

      <!-- Cute Blinking Headlight -->
      <circle cx="48" cy="18" r="7.5" fill="#fef08a" stroke="#ca8a04" stroke-width="2" />
      <!-- Cozy light ray -->
      <polygon points="54,12 85,-5 90,40 54,24" fill="#fef08a" opacity="0.30" />
      
      <!-- Back bumper -->
      <rect x="-52" y="18" width="6" height="8" rx="2" fill="#94a3b8" />
    </g>
  `;
}

function drawRetroFan(x: number, y: number, scale = 1): string {
  return `
    <g transform="translate(${x}, ${y}) scale(${scale})" filter="url(#softShadow)">
      <!-- Retro electrical desk fan -->
      <!-- Core Base and neck -->
      <path d="M-20,40 Q0,38 20,40 L10,5 Q0,4 -10,5 Z" fill="#64748b" stroke="#334155" stroke-width="3" />
      <rect x="-35" y="38" width="70" height="8" rx="3" fill="#475569" stroke="#334155" stroke-width="2.5" />
      <!-- Control dials -->
      <circle cx="-15" cy="42" r="2.5" fill="#ef4444" />
      <circle cx="-5" cy="42" r="2.5" fill="#facc15" />
      <circle cx="5" cy="42" r="2.5" fill="#4ade80" />
      
      <!-- Outer Metal Guard wireframe -->
      <circle cx="0" cy="-10" r="42" fill="none" stroke="#cbd5e1" stroke-width="4" />
      <circle cx="0" cy="-10" r="40" fill="#f1f5f9" stroke="#94a3b8" stroke-width="2" opacity="0.4" />
      <!-- Spokes -->
      <line x1="-40" y1="-10" x2="40" y2="-10" stroke="#94a3b8" stroke-width="1.5" />
      <line x1="0" y1="-50" x2="0" y2="30" stroke="#94a3b8" stroke-width="1.5" />
      <line x1="-28" y1="-38" x2="28" y2="18" stroke="#94a3b8" stroke-width="1.5" />
      <line x1="-28" y1="18" x2="28" y2="-38" stroke="#94a3b8" stroke-width="1.5" />

      <!-- Blades spinning (Teal) -->
      <g transform="rotate(25)">
        <path d="M0,-10 C5,-35 25,-40 5,-10 C-15,-10 0,-10 0,-10" fill="#0d9488" stroke="#0f766e" stroke-width="1.5" />
        <path d="M0,-10 C35,-5 40,15 10,5 C10,-15 0,-10 0,-10" fill="#0d9488" stroke="#0f766e" stroke-width="1.5" />
        <path d="M0,-10 C-5,15 -25,20 -5,10 C15,10 0,-10 0,-10" fill="#0d9488" stroke="#0f766e" stroke-width="1.5" />
        <path d="M0,-10 C-35,5 -40,-15 -10,-5 C-10,15 0,-10 0,-10" fill="#0d9488" stroke="#0f766e" stroke-width="1.5" />
      </g>
      <!-- Center cap -->
      <circle cx="0" cy="-10" r="10" fill="#facc15" stroke="#ca8a04" stroke-width="2" />
      
      <!-- Cool dynamic wind swirls -->
      <path d="M45,-25 Q65,-30 60,-15" fill="none" stroke="#60a5fa" stroke-width="2.5" stroke-linecap="round" opacity="0.7" />
      <path d="M35,-2 Q55,-10 50,5" fill="none" stroke="#60a5fa" stroke-width="2.5" stroke-linecap="round" opacity="0.7" />
      <path d="M40,20 Q60,12 55,25" fill="none" stroke="#60a5fa" stroke-width="2.5" stroke-linecap="round" opacity="0.7" />
    </g>
  `;
}

function drawFryingPan(x: number, y: number, scale = 1): string {
  return `
    <g transform="translate(${x}, ${y}) scale(${scale})" filter="url(#softShadow)">
      <!-- Iron skillet frying pan with a golden handle -->
      <!-- Handle -->
      <rect x="-82" y="-6" width="55" height="12" rx="4" fill="#fbbf24" stroke="#b45309" stroke-width="2.5" />
      <!-- Handle hole -->
      <circle cx="-74" cy="0" r="4" fill="#fdf6e2" stroke="#b45309" stroke-width="1.5" />
      
      <!-- Skillet Pan outline -->
      <circle cx="0" cy="0" r="42" fill="#334155" stroke="#1e293b" stroke-width="5.5" />
      <circle cx="0" cy="0" r="37" fill="#475569" />
      
      <!-- Fried Egg cooked inside with happy face yolk -->
      <path d="M-18,-8 Q-28,-14 -12,-24 Q4,-18 12,-16 Q25,-8 14,14 Q-8,22 -20,12 Q-16,2 -18,-8 Z" fill="#ffffff" stroke="#cbd5e1" stroke-width="1" />
      
      <!-- Yolk -->
      <circle cx="-2" cy="-2" r="11" fill="#fbbf24" stroke="#ca8a04" stroke-width="2" />
      <!-- Twinkle on Yolk -->
      <circle cx="2" cy="-5" r="2.5" fill="#fff" />
      <!-- Yolk Smiley -->
      <circle cx="-5" cy="-2" r="1.5" fill="#78350f" />
      <circle cx="1" cy="-2" r="1.5" fill="#78350f" />
      <path d="M-4,3 Q-2,5 0,3" fill="none" stroke="#78350f" stroke-width="1.5" stroke-linecap="round" />
    </g>
  `;
}

function drawReadingLamp(x: number, y: number, scale = 1): string {
  return `
    <g transform="translate(${x}, ${y}) scale(${scale})" filter="url(#softShadow)">
      <!-- Cute Reading Desk Lamp -->
      <!-- Base of lamp -->
      <ellipse cx="-15" cy="40" rx="22" ry="6" fill="#ea580c" stroke="#c2410c" stroke-width="3" />
      <!-- Curved gooseneck pipe -->
      <path d="M-15,38 Q-12,5 5,0 Q18,-5 12,-20" fill="none" stroke="#94a3b8" stroke-width="5" stroke-linecap="round" />
      
      <!-- Lamp bell head (Green / Pink) -->
      <g transform="translate(10, -22) rotate(35)">
        <path d="M-15,-10 C-15,-22 15,-22 15,-10 L25,12 L-25,12 Z" fill="#ec4899" stroke="#be185d" stroke-width="3" stroke-linejoin="round" />
        <!-- On/Off Switch pin -->
        <line x1="0" y1="-22" x2="0" y2="-28" stroke="#475569" stroke-width="2" />
        <circle cx="0" cy="-29" r="2.5" fill="#94a3b8" />
        
        <!-- Bulb inside -->
        <circle cx="0" cy="12" r="10" fill="#fef08a" />
      </g>
      
      <!-- Big bright yellow projection light beam -->
      <polygon points="12,-15 50,75 145,55 32,-28" fill="#fef08a" opacity="0.25" />
    </g>
  `;
}

function drawPostageStamp(x: number, y: number, scale = 1): string {
  return `
    <g transform="translate(${x}, ${y}) scale(${scale})" filter="url(#softShadow)">
      <!-- Rectangular Stamp with scallops -->
      <!-- Scalloped Background -->
      <rect x="-35" y="-45" width="70" height="90" rx="3" fill="#cbd5e1" />
      <!-- Scallop punches -->
      <circle cx="-35" cy="-35" r="3" fill="#fffcf0" />
      <circle cx="-35" cy="-20" r="3" fill="#fffcf0" />
      <circle cx="-35" cy="-5" r="3" fill="#fffcf0" />
      <circle cx="-35" cy="10" r="3" fill="#fffcf0" />
      <circle cx="-35" cy="25" r="3" fill="#fffcf0" />
      <circle cx="-35" cy="40" r="3" fill="#fffcf0" />
      <circle cx="35" cy="-35" r="3" fill="#fffcf0" />
      <circle cx="35" cy="-20" r="3" fill="#fffcf0" />
      <circle cx="35" cy="-5" r="3" fill="#fffcf0" />
      <circle cx="35" cy="10" r="3" fill="#fffcf0" />
      <circle cx="35" cy="25" r="3" fill="#fffcf0" />
      <circle cx="35" cy="40" r="3" fill="#fffcf0" />
      <circle cx="-25" cy="-45" r="3" fill="#fffcf0" />
      <circle cx="-10" cy="-45" r="3" fill="#fffcf0" />
      <circle cx="5" cy="-45" r="3" fill="#fffcf0" />
      <circle cx="20" cy="-45" r="3" fill="#fffcf0" />
      <circle cx="-25" cy="45" r="3" fill="#fffcf0" />
      <circle cx="-10" cy="45" r="3" fill="#fffcf0" />
      <circle cx="5" cy="45" r="3" fill="#fffcf0" />
      <circle cx="20" cy="45" r="3" fill="#fffcf0" />
      
      <!-- Real stamp inner block -->
      <rect x="-27" y="-37" width="54" height="74" fill="#a855f7" stroke="#7e22ce" stroke-width="2" />
      
      <!-- Cute Sprout Drawing in the center -->
      <circle cx="0" cy="15" r="12" fill="#d8b4fe" />
      <!-- Sprout stem -->
      <path d="M0,15 Q3,0 0,-15" fill="none" stroke="#22c55e" stroke-width="3" stroke-linecap="round" />
      <!-- Sprout leaves -->
      <path d="M0,-15 Q-8,-20 -5,-12 Q0,-10 0,-15" fill="#4ade80" stroke="#15803d" stroke-width="1" />
      <path d="M0,-10 Q8,-15 5,-7 Q0,-5 0,-10" fill="#4ade80" stroke="#15803d" stroke-width="1" />
      
      <!-- Postmark circular stamp mark -->
      <path d="M-15,-20 A35,35 0 0,0 20,25" fill="none" stroke="#000" stroke-width="1" stroke-dasharray="2 3" opacity="0.4" />
    </g>
  `;
}

// ------------------------------------------------------------
// SCENE RENDERERS CALLED BASED ON TOPICS
// ------------------------------------------------------------

export function getIllustrationForSentence(english: string, originalImage: string): string {
  const norm = english.toLowerCase().replace(/[.,'’"!?？/\-]/g, ' ').replace(/\s+/g, ' ').trim();
  
  // 1. Keep original premium PNGs if configured!
  if (originalImage && (
    originalImage.includes('dad_') || 
    originalImage.includes('picbook_')
  )) {
    return originalImage;
  }

  // --- BOOK 20 ---
  if (norm === 'what are they they are cats' || norm === 'what are they  they are cats') {
    return createSvgUri(`
      <g transform="translate(200, 150) scale(1.15)" filter="url(#softShadow)">
        <ellipse cx="0" cy="45" rx="80" ry="15" fill="#facc15" opacity="0.3" />
        <!-- Orange Fat Cat -->
        <g transform="translate(-35, 10) scale(0.9)">
          <ellipse cx="0" cy="15" rx="28" ry="20" fill="#f59e0b" stroke="#78350f" stroke-width="2.5" />
          <circle cx="0" cy="-15" r="18" fill="#f59e0b" stroke="#78350f" stroke-width="2.5" />
          <polygon points="-10,-30 -16,-14 -4,-22" fill="#d97706" stroke="#78350f" stroke-width="1.5" />
          <polygon points="10,-30 16,-14 4,-22" fill="#d97706" stroke="#78350f" stroke-width="1.5" />
          <circle cx="-6" cy="-16" r="2.5" fill="#000" />
          <circle cx="6" cy="-16" r="2.5" fill="#000" />
          <path d="M-3,-11 Q0,-8 3,-11" fill="none" stroke="#78350f" stroke-width="1.5" />
        </g>
        <!-- Gray Chubby Cat -->
        <g transform="translate(35, 15) scale(0.9)">
          <ellipse cx="0" cy="15" rx="28" ry="20" fill="#94a3b8" stroke="#334155" stroke-width="2.5" />
          <circle cx="0" cy="-15" r="18" fill="#cbd5e1" stroke="#334155" stroke-width="2.5" />
          <polygon points="-10,-30 -16,-14 -4,-22" fill="#64748b" stroke="#334155" stroke-width="1.5" />
          <polygon points="10,-30 16,-14 4,-22" fill="#64748b" stroke="#334155" stroke-width="1.5" />
          <circle cx="-6" cy="-16" r="2.5" fill="#000" />
          <circle cx="6" cy="-16" r="2.5" fill="#000" />
          <path d="M-3,-11 Q0,-8 3,-11" fill="none" stroke="#334155" stroke-width="1.5" />
        </g>
      </g>
      <text x="200" y="65" font-size="32" font-weight="black" fill="#c2410c" text-anchor="middle">They are Cats! 🐱🐾</text>
    `, 'warm');
  }

  if (norm === 'what are they they are rats') {
    return createSvgUri(`
      <g transform="translate(200, 150) scale(1.1)" filter="url(#softShadow)">
        <polygon points="-25,35 25,35 0,-5" fill="#facc15" stroke="#ca8a04" stroke-width="2.5" />
        <circle cx="-8" cy="24" r="3" fill="#a16207" opacity="0.3" />
        <circle cx="8" cy="20" r="2" fill="#a16207" opacity="0.3" />
        <!-- Mouse Left -->
        <g transform="translate(-40, 15) scale(0.75)">
          <ellipse cx="0" cy="10" rx="20" ry="14" fill="#94a3b8" stroke="#475569" stroke-width="2" />
          <circle cx="-10" cy="-4" r="8" fill="#fda4af" stroke="#475569" stroke-width="2" />
          <circle cx="10" cy="-4" r="8" fill="#fda4af" stroke="#475569" stroke-width="2" />
          <circle cx="-5" cy="8" r="2" fill="#000" />
          <circle cx="5" cy="8" r="2" fill="#000" />
        </g>
        <!-- Mouse Right -->
        <g transform="translate(40, 18) scale(0.72)">
          <ellipse cx="0" cy="10" rx="20" ry="14" fill="#cbd5e1" stroke="#475569" stroke-width="2" />
          <circle cx="-10" cy="-4" r="8" fill="#fda4af" stroke="#475569" stroke-width="2" />
          <circle cx="10" cy="-4" r="8" fill="#fda4af" stroke="#475569" stroke-width="2" />
          <circle cx="-5" cy="8" r="2" fill="#000" />
          <circle cx="5" cy="8" r="2" fill="#000" />
        </g>
      </g>
      <text x="200" y="65" font-size="32" font-weight="black" fill="#0f766e" text-anchor="middle">They are Rats! 🐭🧀</text>
    `, 'aqua');
  }

  if (norm === 'what are they they are bats') {
    return createSvgUri(`
      <circle cx="200" cy="140" r="80" fill="#1e1b4b" stroke="#312e81" stroke-width="4" />
      <circle cx="150" cy="95" r="16" fill="#fef08a" opacity="0.8" />
      <!-- Starry Sky & 2 bats hanging from a branch -->
      <path d="M100,80 Q200,98 300,80" fill="none" stroke="#78350f" stroke-width="5" stroke-linecap="round" />
      <g transform="translate(170, 140) scale(0.8)">
        <ellipse cx="0" cy="0" rx="15" ry="20" fill="#4f46e5" stroke="#1e1b4b" stroke-width="2" />
        <circle cx="-5" cy="-5" r="4" fill="#fff" />
        <circle cx="5" cy="-5" r="4" fill="#fff" />
      </g>
      <g transform="translate(230, 145) scale(0.8)">
        <ellipse cx="0" cy="0" rx="15" ry="20" fill="#312e81" stroke="#1e1b4b" stroke-width="2" />
        <circle cx="-5" cy="-5" r="4" fill="#fff" />
        <circle cx="5" cy="-5" r="4" fill="#fff" />
      </g>
      <text x="200" y="55" font-size="30" font-weight="black" fill="#a855f7" text-anchor="middle">They are Bats! 🦇⭐</text>
    `, 'violet');
  }

  if (norm === 'what are these they are caps') {
    return createSvgUri(`
      <g transform="translate(200, 150) scale(1.1)" filter="url(#softShadow)">
        <rect x="-80" y="40" width="160" height="6" fill="#d97706" rx="3" />
        <!-- Cap 1 -->
        <g transform="translate(-35, 12)">
          <path d="M-20,12 Q0,-20 20,12 Z" fill="#2563eb" stroke="#1e3a8a" stroke-width="2.5" />
          <ellipse cx="0" cy="12" rx="25" ry="5" fill="#1d4ed8" stroke="#1e3a8a" stroke-width="2" />
          <text x="0" y="4" font-size="10" fill="#fff">⭐</text>
        </g>
        <!-- Cap 2 -->
        <g transform="translate(35, 12)">
          <ellipse cx="0" cy="12" rx="25" ry="6" fill="#8b5cf6" stroke="#4c1d95" stroke-width="2" />
          <path d="M-15,10 Q0,-25 15,10 Z" fill="#6d28d9" stroke="#4c1d95" stroke-width="2" />
        </g>
      </g>
      <text x="200" y="65" font-size="32" font-weight="black" fill="#1e3a8a" text-anchor="middle">They are Caps! 🧢👒</text>
    `, 'warm');
  }

  if (norm === 'what are these they are maps') {
    return createSvgUri(`
      <g transform="translate(200, 155) scale(1.15)" filter="url(#softShadow)">
        <!-- Map 1 -->
        <g transform="translate(-35, 5) rotate(-5)">
          <rect x="-30" y="-20" width="60" height="40" rx="4" fill="#fef3c7" stroke="#b45309" stroke-width="2.5" />
          <path d="M-15,-5 Q10,-5 5,10" fill="none" stroke="#ef4444" stroke-width="2" stroke-dasharray="3 2" />
        </g>
        <!-- Map 2 -->
        <g transform="translate(35, 10) rotate(5)">
          <rect x="-30" y="-20" width="60" height="40" rx="4" fill="#fafaf9" stroke="#1c1917" stroke-width="2.5" />
          <circle cx="-10" cy="-5" r="4" fill="none" stroke="#3b82f6" />
        </g>
      </g>
      <text x="200" y="65" font-size="32" font-weight="black" fill="#0d9488" text-anchor="middle">They are Maps! 🗺️🧭</text>
    `, 'aqua');
  }

  if (norm === 'what are those they are vans') {
    return createSvgUri(`
      <g transform="translate(200, 150) scale(1.1)" filter="url(#softShadow)">
        <path d="M-100,45 L100,45" stroke="#22c55e" stroke-width="4" stroke-linecap="round" />
        <!-- Pink Van -->
        <g transform="translate(-35, 10) scale(0.9)">
          <rect x="-35" y="-20" width="70" height="40" rx="10" fill="#ec4899" stroke="#be185d" stroke-width="3" />
          <rect x="-28" y="-10" width="56" height="10" fill="#ffe4e6" />
          <circle cx="-16" cy="20" r="8" fill="#000" />
          <circle cx="16" cy="20" r="8" fill="#000" />
        </g>
        <!-- Blue Van -->
        <g transform="translate(35, 15) scale(0.9)">
          <rect x="-35" y="-20" width="70" height="40" rx="10" fill="#06b6d4" stroke="#0891b2" stroke-width="3" />
          <rect x="-28" y="-10" width="56" height="10" fill="#ecfeff" />
          <circle cx="-16" cy="20" r="8" fill="#000" />
          <circle cx="16" cy="20" r="8" fill="#000" />
        </g>
      </g>
      <text x="200" y="65" font-size="32" font-weight="black" fill="#0284c7" text-anchor="middle">They are Vans! 🚐🚚</text>
    `, 'aqua');
  }

  if (norm === 'what are those they are fans') {
    return createSvgUri(`
      <g transform="translate(200, 150) scale(1.1)" filter="url(#softShadow)">
        <path d="M-70,40 Q0,25 70,40" fill="none" stroke="#cbd5e1" stroke-width="2" />
        <!-- Mint Fan -->
        <g transform="translate(-30, 5) scale(0.8)">
          <circle cx="0" cy="0" r="25" fill="#2dd4bf" stroke="#0f766e" stroke-width="3" />
          <rect x="-6" y="25" width="12" height="25" fill="#0f766e" />
          <ellipse cx="0" cy="50" rx="15" ry="5" fill="#0f766e" />
        </g>
        <!-- Blue Fan -->
        <g transform="translate(30, 10) scale(0.8)">
          <circle cx="0" cy="0" r="25" fill="#38bdf8" stroke="#0284c7" stroke-width="3" />
          <rect x="-6" y="25" width="12" height="25" fill="#0284c7" />
          <ellipse cx="0" cy="50" rx="15" ry="5" fill="#0284c7" />
        </g>
      </g>
      <text x="200" y="65" font-size="32" font-weight="black" fill="#0d9488" text-anchor="middle">They are Fans! 🌬️🌀</text>
    `, 'aqua');
  }

  // --- BOOK 21 ---
  if (norm === 'the hat is on the mat') {
    return createSvgUri(`
      <g transform="translate(200, 155) scale(1.2)" filter="url(#softShadow)">
        <rect x="-65" y="15" width="130" height="15" rx="4" fill="#fda4af" stroke="#be185d" stroke-width="3" />
        <g transform="translate(0, -10)">
          <ellipse cx="0" cy="18" rx="30" ry="6" fill="#fbbf24" stroke="#b45309" stroke-width="2.5" />
          <path d="M-16,13 Q0,-15 16,13 Z" fill="#f59e0b" stroke="#b45309" stroke-width="2.5" />
        </g>
      </g>
      <text x="200" y="65" font-size="30" font-weight="black" fill="#be185d" text-anchor="middle">ON the Mat! 👒🩹</text>
    `, 'warm');
  }

  if (norm === 'the mat is on the bat') {
    return createSvgUri(`
      <g transform="translate(200, 155) scale(1.15)" filter="url(#softShadow)">
        <!-- Bat -->
        <rect x="-50" y="20" width="100" height="10" rx="4" fill="#fdba74" stroke="#78350f" stroke-width="2.5" />
        <!-- Mat folded -->
        <rect x="-35" y="0" width="70" height="20" rx="4" fill="#2dd4bf" stroke="#0f766e" stroke-width="3" />
      </g>
      <text x="200" y="65" font-size="30" font-weight="black" fill="#0f766e" text-anchor="middle">ON the Bat! 🩹🏏</text>
    `, 'aqua');
  }

  if (norm === 'the rat is in the bag') {
    return createSvgUri(`
      <g transform="translate(200, 155) scale(1.15)" filter="url(#softShadow)">
        <rect x="-35" y="0" width="70" height="60" rx="12" fill="#06b6d4" stroke="#0891b2" stroke-width="3" />
        <!-- Mouse peaking -->
        <g transform="translate(0, -20) scale(0.85)">
          <ellipse cx="0" cy="5" rx="15" ry="12" fill="#cbd5e1" stroke="#475569" stroke-width="2" />
          <circle cx="-12" cy="-5" r="7" fill="#fda4af" stroke="#475569" stroke-width="2" />
          <circle cx="12" cy="-5" r="7" fill="#fda4af" stroke="#475569" stroke-width="2" />
          <circle cx="-5" cy="4" r="2" fill="#000" />
          <circle cx="5" cy="4" r="2" fill="#000" />
        </g>
      </g>
      <text x="200" y="65" font-size="30" font-weight="black" fill="#0891b2" text-anchor="middle">IN the Bag! 🐭🎒</text>
    `, 'warm');
  }

  if (norm === 'the bag is in the gap') {
    return createSvgUri(`
      <g transform="translate(200, 155) scale(1.15)" filter="url(#softShadow)">
        <rect x="-80" y="-10" width="35" height="70" rx="6" fill="#c084fc" stroke="#7e22ce" stroke-width="2.5" />
        <rect x="45" y="-10" width="35" height="70" rx="6" fill="#c084fc" stroke="#7e22ce" stroke-width="2.5" />
        <!-- Squeezed bag -->
        <rect x="-25" y="10" width="50" height="50" rx="10" fill="#f97316" stroke="#ea580c" stroke-width="3" />
      </g>
      <text x="200" y="65" font-size="30" font-weight="black" fill="#7e22ce" text-anchor="middle">IN the Gap! 🎒🕳️</text>
    `, 'violet');
  }

  if (norm === 'the bat is under the map') {
    return createSvgUri(`
      <g transform="translate(200, 155) scale(1.15)">
        <!-- Bat at bottom -->
        <rect x="-45" y="32" width="90" height="8" rx="2" fill="#fdba74" stroke="#78350f" stroke-width="2" />
        <!-- Map above -->
        <rect x="-35" y="-15" width="70" height="42" rx="4" fill="#fef3c7" stroke="#b45309" stroke-width="3" filter="url(#softShadow)" />
      </g>
      <text x="200" y="65" font-size="30" font-weight="black" fill="#b45309" text-anchor="middle">UNDER the Map! 🏏🗺️</text>
    `, 'cozy');
  }

  if (norm === 'the map is under the fan') {
    return createSvgUri(`
      <g transform="translate(200, 155) scale(1.15)">
        <!-- Map at bottom -->
        <rect x="-40" y="35" width="80" height="22" rx="2" fill="#fafaf9" stroke="#1c1917" stroke-width="1.8" />
        <!-- Fan above -->
        <g transform="translate(0, -15) scale(0.9)" filter="url(#softShadow)">
          <circle cx="0" cy="0" r="24" fill="#38bdf8" stroke="#0284c7" stroke-width="3" />
          <rect x="-5" y="24" width="10" height="20" fill="#0284c7" />
          <ellipse cx="0" cy="44" rx="14" ry="4" fill="#0284c7" />
        </g>
      </g>
      <text x="200" y="65" font-size="30" font-weight="black" fill="#0284c7" text-anchor="middle">UNDER the Fan! 🗺️🌬️</text>
    `, 'aqua');
  }

  // --- BOOK 22 ---
  if (norm === 'i have a cat i have a mat') {
    return createSvgUri(`
      <g transform="translate(200, 155) scale(1.1)" filter="url(#softShadow)">
        <rect x="-70" y="20" width="140" height="15" rx="5" fill="#38bdf8" stroke="#0284c7" stroke-width="2.5" />
        <!-- Happy sitting cat -->
        <g transform="translate(0, -10)">
          <ellipse cx="0" cy="15" rx="30" ry="20" fill="#f59e0b" stroke="#78350f" stroke-width="2.5" />
          <circle cx="0" cy="-15" r="16" fill="#f59e0b" stroke="#78350f" stroke-width="2.5" />
          <polygon points="-12,-28 -18,-14 -4,-21" fill="#ea580c" stroke="#7c2d12" stroke-width="1.5" />
          <polygon points="12,-28 18,-14 4,-21" fill="#ea580c" stroke="#7c2d12" stroke-width="1.5" />
          <circle cx="-5" cy="-15" r="2" fill="#000" />
          <circle cx="5" cy="-15" r="2" fill="#000" />
          <path d="M-3,-11 Q0,-8 3,-11" fill="none" stroke="#78350f" stroke-width="1.5" />
        </g>
      </g>
      <text x="200" y="65" font-size="30" font-weight="black" fill="#b45309" text-anchor="middle">I Have a Cat &amp; Mat! 🐱🛋️</text>
    `, 'warm');
  }

  if (norm === 'you have a hat you have a map') {
    return createSvgUri(`
      <g transform="translate(200, 155) scale(1.15)" filter="url(#softShadow)">
        <rect x="-40" y="10" width="80" height="40" rx="4" fill="#fef3c7" stroke="#b45309" stroke-width="2.5" />
        <!-- Hat sitting above map -->
        <g transform="translate(0, -15)">
          <ellipse cx="0" cy="15" rx="26" ry="6" fill="#8b5cf6" stroke="#4c1d95" stroke-width="2" />
          <path d="M-14,12 Q0,-12 14,12 Z" fill="#6d28d9" stroke="#4c1d95" stroke-width="2" />
        </g>
      </g>
      <text x="200" y="65" font-size="30" font-weight="black" fill="#4c1d95" text-anchor="middle">You Have a Hat &amp; Map! 👒🗺️</text>
    `, 'violet');
  }

  if (norm === 'they have a plan they have a land') {
    return createSvgUri(`
      <g transform="translate(200, 150) scale(1.1)" filter="url(#softShadow)">
        <path d="M-80,45 Q-40,-5 0,35 Q40,15 80,45 Z" fill="#86efac" stroke="#15803d" stroke-width="2.5" />
        <rect x="-25" y="25" width="50" height="20" rx="3" fill="#fff" stroke="#1e293b" stroke-width="2" />
        <text x="0" y="39" font-size="10" font-weight="black" fill="#1e293b" text-anchor="middle">PLAN</text>
      </g>
      <text x="200" y="65" font-size="30" font-weight="black" fill="#15803d" text-anchor="middle">They Have a Plan &amp; Land! 🏝️🏰</text>
    `, 'aqua');
  }

  if (norm === 'he has a bat he has a pan') {
    return createSvgUri(`
      <g transform="translate(200, 150) scale(1.1)">
        <g transform="translate(-15, 0) rotate(35)" filter="url(#softShadow)">
          <rect x="-5" y="15" width="10" height="35" rx="2" fill="#475569" stroke="#1e293b" stroke-width="2" />
          <circle cx="0" cy="0" r="22" fill="#cbd5e1" stroke="#1e293b" stroke-width="2.5" />
        </g>
        <g transform="translate(15, 10) rotate(-35)" filter="url(#softShadow)">
          <rect x="-4" y="-30" width="8" height="65" rx="3" fill="#fdba74" stroke="#78350f" stroke-width="2.5" />
        </g>
      </g>
      <text x="200" y="65" font-size="30" font-weight="black" fill="#7c2d12" text-anchor="middle">He Has a Bat &amp; Pan! 🏏🍳</text>
    `, 'warm');
  }

  if (norm === 'she has a lamp she has a stamp') {
    return createSvgUri(`
      <g transform="translate(200, 150)">
        <g transform="translate(-40, 0) scale(1.1)" filter="url(#softShadow)">
          <ellipse cx="0" cy="30" rx="15" ry="5" fill="#8b5cf6" stroke="#4c1d95" stroke-width="2" />
          <rect x="-4" y="-15" width="8" height="45" rx="2" fill="#8b5cf6" stroke="#4c1d95" stroke-width="2" />
          <path d="M-12,-15 Q0,-35 12,-15 Z" fill="#6d28d9" stroke="#4c1d95" stroke-width="2" />
        </g>
        <g transform="translate(40, 10) rotate(5)" filter="url(#softShadow)">
          <rect x="-30" y="-20" width="60" height="40" rx="3" fill="#fff" stroke="#4c1d95" stroke-width="2" />
          <rect x="12" y="-15" width="12" height="12" fill="#fda4af" stroke="#e11d48" stroke-width="1.5" />
        </g>
      </g>
      <text x="200" y="65" font-size="30" font-weight="black" fill="#4c1d95" text-anchor="middle">She Has a Lamp &amp; Stamp! 💡✉️</text>
    `, 'violet');
  }

  // --- BOOK 23 ---
  if (norm === 'i don t have a cat i don t have a mat') {
    return createSvgUri(`
      <g transform="translate(200, 155) scale(1.1)" filter="url(#softShadow)">
        <ellipse cx="0" cy="20" rx="60" ry="12" fill="none" stroke="#cbd5e1" stroke-width="2.5" stroke-dasharray="4 4" />
        <circle cx="0" cy="-15" r="28" fill="none" stroke="#ef4444" stroke-width="6" opacity="0.85" />
        <line x1="-20" y1="5" x2="20" y2="-35" stroke="#ef4444" stroke-width="6" opacity="0.85" />
        <text x="0" y="-5" font-size="30" text-anchor="middle">🐱❓</text>
      </g>
      <text x="200" y="65" font-size="30" font-weight="black" fill="#475569" text-anchor="middle">No Cat, No Mat! 🚫🛋️</text>
    `, 'cozy');
  }

  if (norm === 'you don t have a hat you don t have a map') {
    return createSvgUri(`
      <g transform="translate(200, 155) scale(1.15)" filter="url(#softShadow)">
        <line x1="-30" y1="-20" x2="-30" y2="35" stroke="#cbd5e1" stroke-width="3" stroke-dasharray="3 3" />
        <rect x="20" y="-10" width="20" height="45" rx="2" fill="none" stroke="#cbd5e1" stroke-width="2" stroke-dasharray="3 3" />
        <text x="0" y="10" font-size="48" fill="#ef4444" font-weight="black" text-anchor="middle">❌🤠</text>
      </g>
      <text x="200" y="65" font-size="30" font-weight="black" fill="#475569" text-anchor="middle">No Hat, No Map! 🚫🗺️</text>
    `, 'warm');
  }

  if (norm === 'they don t have a plan they don t have a land') {
    return createSvgUri(`
      <g transform="translate(200, 155) scale(1.1)" filter="url(#softShadow)">
        <rect x="-35" y="-20" width="70" height="45" rx="3" fill="#f8fafc" stroke="#dc2626" stroke-width="2.5" />
        <text x="0" y="10" font-size="36" fill="#dc2626" text-anchor="middle">❓🏝️</text>
      </g>
      <text x="200" y="65" font-size="30" font-weight="black" fill="#dc2626" text-anchor="middle">No Plan, No Land! 🚫📋</text>
    `, 'aqua');
  }

  if (norm === 'he doesn t have a bat he doesn t have a pan') {
    return createSvgUri(`
      <g transform="translate(200, 155) scale(1.15)">
        <text x="0" y="10" font-size="48" fill="#ef4444" text-anchor="middle">❌🍳</text>
        <text x="-40" y="-10" font-size="24" opacity="0.2">🏏</text>
        <text x="40" y="-10" font-size="24" opacity="0.2">🍳</text>
      </g>
      <text x="200" y="65" font-size="30" font-weight="black" fill="#475569" text-anchor="middle">No Bat, No Pan! 🚫🏏🍳</text>
    `, 'warm');
  }

  if (norm === 'she doesn t have a lamp she doesn t have a stamp') {
    return createSvgUri(`
      <g transform="translate(200, 155) scale(1.1)" filter="url(#softShadow)">
        <rect x="-35" y="-15" width="70" height="40" rx="3" fill="#f1f5f9" stroke="#dc2626" stroke-width="2" />
        <rect x="15" y="-10" width="12" height="12" fill="none" stroke="#ef4444" stroke-dasharray="2 1" />
        <text x="-45" y="10" font-size="30" opacity="0.2">💡</text>
        <text x="0" y="15" font-size="30" fill="#ef4444" text-anchor="middle">🚫💡</text>
      </g>
      <text x="200" y="65" font-size="30" font-weight="black" fill="#475569" text-anchor="middle">No Lamp, No Stamp! 🚫✉️</text>
    `, 'violet');
  }

  // --- BOOK 24 ---
  if (norm === 'i can rap') {
    return createSvgUri(`
      <g transform="translate(200, 155) scale(1.15)" filter="url(#softShadow)">
        <polygon points="-65,-140 -20,10 20,10 65,-140" fill="#fef08a" opacity="0.25" />
        <!-- Cool Rapping Cat -->
        <g transform="translate(0, -5)">
          <circle cx="0" cy="-10" r="20" fill="#fbbf24" stroke="#78350f" stroke-width="2.5" />
          <rect x="-14" y="-15" width="11" height="8" rx="2" fill="#000" />
          <rect x="3" y="-15" width="11" height="8" rx="2" fill="#000" />
          <path d="M-3,-3 Q0,1 3,-3" fill="none" stroke="#78350f" stroke-width="1.8" />
        </g>
        <line x1="0" y1="20" x2="0" y2="50" stroke="#475569" stroke-width="4" />
      </g>
      <text x="200" y="65" font-size="32" font-weight="black" fill="#be185d" text-anchor="middle">I Can Rap! Yo! 🎤🐱</text>
    `, 'violet');
  }

  if (norm === 'you can chant') {
    return createSvgUri(`
      <g transform="translate(200, 160) scale(1.15)" filter="url(#softShadow)">
        <rect x="-3" y="-15" width="6" height="50" fill="#78350f" stroke="#451a03" stroke-width="2" transform="rotate(30)" rx="2" />
        <!-- Glowing wand star -->
        <path d="M10,-20 Q20,-38 30,-20 Q48,-15 30,-10 Q20,10 10,-10 Q-8,-15 10,-20 Z" fill="#ebf8ff" stroke="#38bdf8" stroke-width="2" />
        <circle cx="-30" cy="-30" r="12" fill="#a855f7" opacity="0.15" />
        <text x="-37" y="-23" font-size="12" fill="#7e22ce" font-weight="black">♬</text>
      </g>
      <text x="200" y="65" font-size="32" font-weight="black" fill="#a855f7" text-anchor="middle">You Can Chant! 🪄🔮</text>
    `, 'violet');
  }

  if (norm === 'she can wag') {
    return createSvgUri(`
      <g transform="translate(200, 155) scale(1.15)" filter="url(#softShadow)">
        <ellipse cx="-10" cy="15" rx="24" ry="18" fill="#f59e0b" stroke="#78350f" stroke-width="2.5" />
        <circle cx="-10" cy="-10" r="14" fill="#f59e0b" stroke="#78350f" stroke-width="2.5" />
        <!-- Happy tail movement -->
        <path d="M12,12 Q30,15 26,0" fill="none" stroke="#f59e0b" stroke-width="5.5" stroke-linecap="round" />
        <path d="M32,-6 Q38,2 32,10" fill="none" stroke="#ea580c" stroke-width="1.8" stroke-dasharray="2 2" />
        <circle cx="-15" cy="-12" r="2" fill="#000" />
        <circle cx="-5" cy="-12" r="2" fill="#000" />
      </g>
      <text x="200" y="65" font-size="32" font-weight="black" fill="#b45309" text-anchor="middle">She Can Wag! 🐶💖</text>
    `, 'warm');
  }

  if (norm === 'we can act') {
    return createSvgUri(`
      <g transform="translate(200, 150)" filter="url(#softShadow)">
        <path d="M-100,-40 L100,-40" stroke="#7f1d1d" stroke-width="4" />
        <g transform="translate(-25, 10) rotate(-15)">
          <polygon points="-18,15 -14,-10 -6,-1 0,-15 6,-1 14,-10 18,15" fill="#facc15" stroke="#92400e" stroke-width="2" />
        </g>
        <g transform="translate(25, 12) rotate(15)">
          <rect x="-16" y="-15" width="32" height="30" rx="6" fill="#818cf8" stroke="#3730a3" stroke-width="2" />
          <path d="M-6,6 Q0,0 6,6" fill="none" stroke="#3730a3" stroke-width="2" />
        </g>
      </g>
      <text x="200" y="65" font-size="32" font-weight="black" fill="#1e1b4b" text-anchor="middle">We Can Act! 🎭👑</text>
    `, 'cozy');
  }

  // --- BOOK 25 ---
  if (norm === 'i can t rap') {
    return createSvgUri(`
      <g transform="translate(200, 155) scale(1.15)" filter="url(#softShadow)">
        <g transform="rotate(20)">
          <line x1="0" y1="20" x2="0" y2="50" stroke="#94a3b8" stroke-width="4" stroke-linecap="round" />
          <rect x="-5" y="8" width="10" height="12" rx="2" fill="#94a3b8" stroke="#475569" stroke-width="1.8" />
        </g>
        <text x="-35" y="-25" font-size="18">💤</text>
        <text x="35" y="-15" font-size="24" fill="#ef4444">💥</text>
      </g>
      <text x="200" y="65" font-size="32" font-weight="black" fill="#475569" text-anchor="middle">I Can't Rap... 🎤🚫</text>
    `, 'cozy');
  }

  if (norm === 'you can t chant') {
    return createSvgUri(`
      <g transform="translate(200, 160) scale(1.15)">
        <rect x="-3" y="10" width="6" height="20" fill="#78350f" stroke="#451a03" stroke-width="1.8" transform="rotate(15)" />
        <rect x="15" y="-10" width="6" height="20" fill="#78350f" stroke="#451a03" stroke-width="1.8" transform="rotate(-30)" />
        <path d="M-10,-25 Q0,-35 10,-25 Q20,-15 10,-5 Q-5,0 -10,-10 Z" fill="#cbd5e1" stroke="#94a3b8" stroke-width="1.5" />
        <text x="0" y="-15" font-size="10" font-weight="black" fill="#475569">POOF!</text>
      </g>
      <text x="200" y="65" font-size="32" font-weight="black" fill="#475569" text-anchor="middle">You Can't Chant! 🪄💨</text>
    `, 'cozy');
  }

  if (norm === 'she can t wag') {
    return createSvgUri(`
      <g transform="translate(200, 155) scale(1.15)" filter="url(#softShadow)">
        <ellipse cx="-10" cy="15" rx="24" ry="18" fill="#ca8a04" stroke="#78350f" stroke-width="2.5" />
        <circle cx="-10" cy="-10" r="14" fill="#ca8a04" stroke="#78350f" stroke-width="2.5" />
        <!-- Tail with bandaid -->
        <path d="M12,15 Q22,20 28,18" fill="none" stroke="#ca8a04" stroke-width="5" stroke-linecap="round" />
        <g transform="translate(20, 14) scale(0.65)">
          <rect x="-8" y="-2" width="16" height="4" rx="1" fill="#fda4af" stroke="#ef4444" stroke-width="0.8" />
          <rect x="-2" y="-8" width="4" height="16" rx="1" fill="#fda4af" stroke="#ef4444" stroke-width="0.8" />
        </g>
      </g>
      <text x="200" y="65" font-size="32" font-weight="black" fill="#475569" text-anchor="middle">She Can't Wag... 🐶🩹</text>
    `, 'warm');
  }

  if (norm === 'we can t act') {
    return createSvgUri(`
      <g transform="translate(200, 150)">
        <path d="M-90,-40 L90,-40" stroke="#450a0a" stroke-width="3" />
        <rect x="-80" y="-30" width="160" height="75" fill="#7f1d1d" stroke="#450a0a" stroke-width="2.5" />
        <g transform="translate(0, 5)">
          <rect x="-50" y="-12" width="100" height="24" rx="3" fill="#d97706" stroke="#78350f" stroke-width="2" />
          <text x="0" y="4" font-size="10" font-weight="black" fill="#fff" text-anchor="middle">VACATION / 休息中</text>
        </g>
      </g>
      <text x="200" y="65" font-size="32" font-weight="black" fill="#475569" text-anchor="middle">We Can't Act! 🎭🚫</text>
    `, 'cozy');
  }

  // --- BOOK 26 ---
  if (norm === 'can you rap yes i can no i can t') {
    return createSvgUri(`
      <line x1="200" y1="85" x2="200" y2="245" stroke="#94a3b8" stroke-width="3" stroke-dasharray="4 3" />
      <g transform="translate(100, 160)" filter="url(#softShadow)">
        <ellipse cx="0" cy="15" r="25" fill="#dcfce7" opacity="0.6" />
        <circle cx="0" cy="-15" r="14" fill="#fdeb61" stroke="#b45309" stroke-width="2" />
        <text x="0" y="-32" font-size="14">🎤✨</text>
        <rect x="-20" y="24" width="40" height="12" rx="2" fill="#22c55e" />
        <text x="0" y="33" font-size="9" font-weight="black" fill="#fff" text-anchor="middle">YES</text>
      </g>
      <g transform="translate(300, 160)" filter="url(#softShadow)">
        <ellipse cx="0" cy="15" r="25" fill="#fee2e2" opacity="0.6" />
        <text x="0" y="-15" font-size="14">💤🎤</text>
        <rect x="-20" y="24" width="40" height="12" rx="2" fill="#ef4444" />
        <text x="0" y="33" font-size="9" font-weight="black" fill="#fff" text-anchor="middle">NO</text>
      </g>
      <text x="200" y="65" font-size="30" font-weight="black" fill="#4338ca" text-anchor="middle">Can You Rap? 🎤❓</text>
    `, 'violet');
  }

  if (norm === 'can you chant yes i can no i can t') {
    return createSvgUri(`
      <line x1="200" y1="85" x2="200" y2="245" stroke="#94a3b8" stroke-width="3" stroke-dasharray="4 3" />
      <g transform="translate(100, 160)" filter="url(#softShadow)">
        <ellipse cx="0" cy="15" r="25" fill="#dcfce7" opacity="0.6" />
        <text x="0" y="-5" font-size="14">✨🪄</text>
        <rect x="-20" y="24" width="40" height="12" rx="2" fill="#22c55e" />
        <text x="0" y="33" font-size="9" font-weight="black" fill="#fff" text-anchor="middle">YES</text>
      </g>
      <g transform="translate(300, 160)" filter="url(#softShadow)">
        <ellipse cx="0" cy="15" r="25" fill="#fee2e2" opacity="0.6" />
        <text x="0" y="-5" font-size="14">💨🚫</text>
        <rect x="-20" y="24" width="40" height="12" rx="2" fill="#ef4444" />
        <text x="0" y="33" font-size="9" font-weight="black" fill="#fff" text-anchor="middle">NO</text>
      </g>
      <text x="200" y="65" font-size="30" font-weight="black" fill="#4338ca" text-anchor="middle">Can You Chant? 🪄❓</text>
    `, 'violet');
  }

  if (norm === 'can she wag yes she can no she can t') {
    return createSvgUri(`
      <line x1="200" y1="85" x2="200" y2="245" stroke="#94a3b8" stroke-width="3" stroke-dasharray="4 3" />
      <g transform="translate(100, 160)" filter="url(#softShadow)">
        <ellipse cx="0" cy="15" r="25" fill="#dcfce7" opacity="0.6" />
        <text x="0" y="5" font-size="22">🐶🐕</text>
        <rect x="-20" y="24" width="40" height="12" rx="2" fill="#22c55e" />
        <text x="0" y="33" font-size="9" font-weight="black" fill="#fff" text-anchor="middle">YES</text>
      </g>
      <g transform="translate(300, 160)" filter="url(#softShadow)">
        <ellipse cx="0" cy="15" r="25" fill="#fee2e2" opacity="0.6" />
        <text x="0" y="5" font-size="22">🐶🩹</text>
        <rect x="-20" y="24" width="40" height="12" rx="2" fill="#ef4444" />
        <text x="0" y="33" font-size="9" font-weight="black" fill="#fff" text-anchor="middle">NO</text>
      </g>
      <text x="200" y="65" font-size="30" font-weight="black" fill="#4338ca" text-anchor="middle">Can She Wag? 🐾❓</text>
    `, 'warm');
  }

  if (norm === 'can he act yes he can no he can t') {
    return createSvgUri(`
      <line x1="200" y1="85" x2="200" y2="245" stroke="#94a3b8" stroke-width="3" stroke-dasharray="4 3" />
      <g transform="translate(100, 160)" filter="url(#softShadow)">
        <ellipse cx="0" cy="15" r="25" fill="#dcfce7" opacity="0.6" />
        <text x="0" y="5" font-size="22">🎭👑</text>
        <rect x="-20" y="24" width="40" height="12" rx="2" fill="#22c55e" />
        <text x="0" y="33" font-size="9" font-weight="black" fill="#fff" text-anchor="middle">YES</text>
      </g>
      <g transform="translate(300, 160)" filter="url(#softShadow)">
        <ellipse cx="0" cy="15" r="25" fill="#fee2e2" opacity="0.6" />
        <text x="0" y="5" font-size="22">🎭🚫</text>
        <rect x="-20" y="24" width="40" height="12" rx="2" fill="#ef4444" />
        <text x="0" y="33" font-size="9" font-weight="black" fill="#fff" text-anchor="middle">NO</text>
      </g>
      <text x="200" y="65" font-size="30" font-weight="black" fill="#4338ca" text-anchor="middle">Can He Act? 🎬❓</text>
    `, 'cozy');
  }

  if (norm === 'can we chat yes we can no we can t') {
    return createSvgUri(`
      <line x1="200" y1="85" x2="200" y2="245" stroke="#94a3b8" stroke-width="3" stroke-dasharray="4 3" />
      <g transform="translate(100, 160)" filter="url(#softShadow)">
        <ellipse cx="0" cy="15" r="25" fill="#dcfce7" opacity="0.6" />
        <text x="-6" y="2" font-size="14">💬</text>
        <text x="6" y="-8" font-size="14">💬</text>
        <rect x="-20" y="24" width="40" height="12" rx="2" fill="#22c55e" />
        <text x="0" y="33" font-size="9" font-weight="black" fill="#fff" text-anchor="middle">YES</text>
      </g>
      <g transform="translate(300, 160)" filter="url(#softShadow)">
        <ellipse cx="0" cy="15" r="25" fill="#fee2e2" opacity="0.6" />
        <text x="0" y="2" font-size="14">✂️💬</text>
        <rect x="-20" y="24" width="40" height="12" rx="2" fill="#ef4444" />
        <text x="0" y="33" font-size="9" font-weight="black" fill="#fff" text-anchor="middle">NO</text>
      </g>
      <text x="200" y="65" font-size="30" font-weight="black" fill="#4338ca" text-anchor="middle">Can We Chat? 💬❓</text>
    `, 'cozy');
  }

  // 2. Direct exact-keyword override to keep premium PNGs for single characters/custom scenes
  if (norm === 'what is it it s a cat' || norm.includes('it a cat') || norm.includes('its a cat')) {
    return createSvgUri(`
      <text x="80" y="80" font-size="48" fill="#a855f7" opacity="0.3">❓</text>
      <text x="320" y="90" font-size="36" fill="#fbbf24" opacity="0.4">⭐</text>
      <g transform="translate(200, 150) scale(1.15)" filter="url(#softShadow)">
        <path d="M-50,60 Q0,80 50,60 L40,-10 Q0,0 -40,-10 Z" fill="#78350f" stroke="#451a03" stroke-width="3" />
        <ellipse cx="0" cy="40" rx="35" ry="18" fill="#eab308" opacity="0.15" />
        <g transform="translate(0, 15)">
          <circle cx="0" cy="-20" r="28" fill="#fda4af" stroke="#be185d" stroke-width="3" />
          <polygon points="-22,-36 -28,-14 -10,-24" fill="#f43f5e" stroke="#be185d" stroke-width="2" />
          <polygon points="22,-36 28,-14 10,-24" fill="#f43f5e" stroke="#be185d" stroke-width="2" />
          <polygon points="-19,-30 -23,-16 -12,-22" fill="#ffe4e6" />
          <polygon points="19,-30 23,-16 12,-22" fill="#ffe4e6" />
          <ellipse cx="-8" cy="-22" rx="3" ry="5" fill="#000" />
          <ellipse cx="8" cy="-22" rx="3" ry="5" fill="#000" />
          <circle cx="-9" cy="-24" r="1" fill="#fff" />
          <circle cx="7" cy="-24" r="1" fill="#fff" />
          <polygon points="0,-16 -3,-14 3,-14" fill="#be185d" />
          <path d="M-3,-13 Q0,-10 3,-13" fill="none" stroke="#be185d" stroke-width="1.5" />
          <line x1="-12" y1="-14" x2="-26" y2="-16" stroke="#475569" stroke-width="1.5" />
          <line x1="-12" y1="-11" x2="-28" y2="-11" stroke="#475569" stroke-width="1.5" />
          <line x1="12" y1="-14" x2="26" y2="-16" stroke="#475569" stroke-width="1.5" />
          <line x1="12" y1="-11" x2="28" y2="-11" stroke="#475569" stroke-width="1.5" />
          <circle cx="-16" cy="10" r="7" fill="#fff" stroke="#be185d" stroke-width="2.5" />
          <circle cx="16" cy="10" r="7" fill="#fff" stroke="#be185d" stroke-width="2.5" />
        </g>
      </g>
      <g transform="translate(290, 80) scale(0.9)">
        <path d="M-40,-20 L20,-20 Q30,-20 30,-10 L30,10 Q30,20 15,20 L5,28 L0,20 L-40,20 Q-50,20 -50,10 L-50,-10 Q-50,-20 -40,-20 Z" fill="#ec4899" stroke="#9d174d" stroke-width="2" />
        <text x="-10" y="5" font-weight="black" fill="#fff" font-size="12" text-anchor="middle">It's a cat! 🐱</text>
      </g>
    `, 'warm');
  }

  if (norm === 'what is it it s a rat' || norm.includes('it a rat') || norm.includes('its a rat')) {
    return createSvgUri(`
      <text x="320" y="80" font-size="48" fill="#0d9488" opacity="0.3">❓</text>
      <text x="80" y="90" font-size="36" fill="#38bdf8" opacity="0.4">✨</text>
      <g transform="translate(200, 150) scale(1.15)" filter="url(#softShadow)">
        <polygon points="-60,60 60,60 0,-20" fill="#fef08a" stroke="#ca8a04" stroke-width="3" />
        <circle cx="-35" cy="40" r="8" fill="#fda4af" opacity="0.3" />
        <circle cx="30" cy="45" r="6" fill="#fda4af" opacity="0.3" />
        <circle cx="-10" cy="10" r="10" fill="#fda4af" opacity="0.3" />
        <g transform="translate(5, 20)">
          <ellipse cx="0" cy="0" rx="22" ry="18" fill="#cbd5e1" stroke="#475569" stroke-width="2.5" />
          <circle cx="-16" cy="-14" r="10" fill="#fda4af" stroke="#475569" stroke-width="2.5" />
          <circle cx="16" cy="-14" r="10" fill="#fda4af" stroke="#475569" stroke-width="2.5" />
          <circle cx="-16" cy="-14" r="5" fill="#f43f5e" />
          <circle cx="16" cy="-14" r="5" fill="#f43f5e" />
          <circle cx="-6" cy="-3" r="2.5" fill="#000" />
          <circle cx="6" cy="-3" r="2.5" fill="#000" />
          <circle cx="0" cy="4" r="4.5" fill="#f43f5e" />
          <line x1="-10" y1="3" x2="-24" y2="2" stroke="#475569" stroke-width="1.5" />
          <line x1="-10" y1="7" x2="-22" y2="10" stroke="#475569" stroke-width="1.5" />
          <line x1="10" y1="3" x2="24" y2="2" stroke="#475569" stroke-width="1.5" />
          <line x1="10" y1="7" x2="22" y2="10" stroke="#475569" stroke-width="1.5" />
        </g>
      </g>
      <g transform="translate(110, 80) scale(0.9)">
        <path d="M-40,-20 L20,-20 Q30,-20 30,-10 L30,10 Q30,20 15,20 L5,28 L0,20 L-40,20 Q-50,20 -50,10 L-50,-10 Q-50,-20 -40,-20 Z" fill="#0d9488" stroke="#0f766e" stroke-width="2" />
        <text x="-10" y="5" font-weight="black" fill="#fff" font-size="12" text-anchor="middle">It's a rat! 🐭</text>
      </g>
    `, 'aqua');
  }

  if (norm === 'what is it it s a bat' || norm.includes('it a bat') || norm.includes('its a bat')) {
    return createSvgUri(`
      <text x="80" y="80" font-size="44" fill="#6366f1" opacity="0.35">❓</text>
      <text x="320" y="100" font-size="40" fill="#a855f7" opacity="0.45">⭐</text>
      <circle cx="200" cy="150" r="85" fill="#1e1b4b" stroke="#312e81" stroke-width="4.5" />
      <circle cx="150" cy="100" r="18" fill="#fef08a" opacity="0.85" filter="url(#softShadow)" />
      <g transform="translate(200, 150) scale(1.15)" filter="url(#softShadow)">
        <path d="M-45,-15 Q-20,-35 -5,-8 Q-12,12 -30,8 Q-38,18 -45,-15 Z" fill="#4f46e5" stroke="#1e1b4b" stroke-width="2" />
        <path d="M45,-15 Q20,-35 5,-8 Q12,12 30,8 Q38,18 45,-15 Z" fill="#4f46e5" stroke="#1e1b4b" stroke-width="2" />
        <ellipse cx="0" cy="0" rx="18" ry="15" fill="#312e81" stroke="#1e1b4b" stroke-width="2.5" />
        <polygon points="-12,-12 -16,-26 -4,-18" fill="#4f46e5" stroke="#1e1b4b" stroke-width="2" />
        <polygon points="12,-12 16,-26 4,-18" fill="#4f46e5" stroke="#1e1b4b" stroke-width="2" />
        <circle cx="-6" cy="-2" r="5" fill="#fff" />
        <circle cx="6" cy="-2" r="5" fill="#fff" />
        <circle cx="-5" cy="-2" r="2.5" fill="#000" />
        <circle cx="5" cy="-2" r="2.5" fill="#000" />
        <polygon points="-4,6 -2,12 0,6" fill="#fff" />
        <polygon points="4,6 2,12 0,6" fill="#fff" />
      </g>
      <g transform="translate(290, 80) scale(0.9)">
        <path d="M-40,-20 L20,-20 Q30,-20 30,-10 L30,10 Q30,20 15,20 L5,28 L0,20 L-40,20 Q-50,20 -50,10 L-50,-10 Q-50,-20 -40,-20 Z" fill="#4f46e5" stroke="#3730a3" stroke-width="2" />
        <text x="-10" y="5" font-weight="black" fill="#fff" font-size="12" text-anchor="middle">It's a bat! 🦇</text>
      </g>
    `, 'violet');
  }

  // 2. Direct exact-keyword override to keep premium PNGs for single characters
  if (norm === 'a cat' || norm === 'this is a cat' || norm === 'that is a cat') return CAT_PNG;
  if (norm === 'a fat cat' || norm === 'this is a fat cat' || norm === 'that is my cat') return FAT_CAT_PNG;
  if (norm === 'a rat' || norm === 'this is a rat' || norm === 'what is it it s a rat') return RAT_PNG;
  if (norm === 'a fat rat') return PICBOOK_FAT_RAT_PNG;
  if (norm === 'this is a bad rat' || norm === 'those are bad rats' || norm === 'these are bad rats') return BAD_RAT_PNG;
  if (norm === 'a bat' || norm === 'this is a bat' || norm === 'what is it it s a bat') return BAT_PNG;
  if (norm === 'a fat bat') return PICBOOK_FAT_BAT_PNG;
  if (norm === 'this is a sad bat' || norm === 'those are sad bats' || norm === 'these are sad bats') return SAD_BAT_PNG;
  if (norm.includes('mat')) return PICBOOK_COZY_MAT_PNG;
  if (norm.includes('hat')) return PICBOOK_CUTE_HAT_PNG;
  if (norm.includes('pad')) return PICBOOK_TOY_PAD_PNG;
  
  if (norm.includes('mad dad')) return DAD_MAD_PNG;
  if (norm.includes('sad dad')) return DAD_SAD_PNG;
  if (norm.includes('glad dad')) return DAD_GLAD_PNG;

  // 3. Dynamic Composite scenes or Single SVG graphics maps
  
  // A. PLURAL AND GROUP COMBINATIONS FOR ANIMALS (Cats, Rats, Bats)
  if (norm.includes('these are cats') || norm.includes('those are cats') || norm.includes('what are they they are cats')) {
    return createSvgUri(`
      <text x="200" y="80" font-size="64" text-anchor="middle" filter="url(#softShadow)">🐱🐱🐾</text>
      <text x="200" y="170" font-size="18" font-weight="bold" fill="#1e1b4b" text-anchor="middle">🐱🐾 Playful Kitty Team 🐾🐱</text>
      <!-- Sub drawings -->
      <g opacity="0.95" transform="translate(140, 240) scale(0.65)">
        <ellipse cx="0" cy="0" rx="35" ry="25" fill="#fdba74" stroke="#c2410c" stroke-width="3"/>
        <circle cx="0" cy="-20" r="16" fill="#fdba74" stroke="#c2410c" stroke-width="3"/>
        <path d="M-16,-28 L-10,-18 L-4,-24 Z" fill="#ea580c"/>
        <path d="M16,-28 L10,-18 L4,-24 Z" fill="#ea580c"/>
      </g>
      <g opacity="0.95" transform="translate(260, 240) scale(0.65)">
        <ellipse cx="0" cy="0" rx="35" ry="25" fill="#fdba74" stroke="#c2410c" stroke-width="3"/>
        <circle cx="0" cy="-20" r="16" fill="#fdba74" stroke="#c2410c" stroke-width="3"/>
      </g>
    `, 'violet');
  }

  if (norm.includes('fat cats') || norm.includes('chubby cats')) {
    return createSvgUri(`
      <text x="200" y="80" font-size="64" text-anchor="middle" filter="url(#softShadow)">🐈🐈🧁</text>
      <text x="200" y="170" font-size="18" font-weight="bold" fill="#1e1b4b" text-anchor="middle">🐈 Super Fluffy Bread Loaves 🐈</text>
      <!-- Double giant fat cats sitting -->
      <circle cx="150" cy="240" r="30" fill="#f97316" filter="url(#softShadow)" />
      <circle cx="250" cy="240" r="30" fill="#f59e0b" filter="url(#softShadow)" />
    `, 'violet');
  }

  if (norm.includes('these are rats') || norm.includes('those are rats') || norm.includes('what are they they are rats')) {
    return createSvgUri(`
      <text x="200" y="90" font-size="60" text-anchor="middle" filter="url(#softShadow)">🐭🐭🐭</text>
      <text x="200" y="165" font-size="18" font-weight="bold" fill="#0f172a" text-anchor="middle">Squeaky Mouse Whisker Club</text>
      <circle cx="170" cy="235" r="15" fill="#94a3b8" />
      <circle cx="155" cy="225" r="10" fill="#fda4af" />
      <circle cx="230" cy="235" r="15" fill="#cbd5e1" />
      <circle cx="245" cy="225" r="10" fill="#fda4af" />
    `, 'cozy');
  }

  if (norm.includes('these are bats') || norm.includes('those are bats') || norm.includes('what are they they are bats')) {
    return createSvgUri(`
      <text x="200" y="85" font-size="60" text-anchor="middle" filter="url(#softShadow)">🦇🦇🌌</text>
      <text x="200" y="165" font-size="18" font-weight="bold" fill="#312e81" text-anchor="middle">Spooky Flapping Bat Family</text>
      <!-- Flying vector silhouettes -->
      <path d="M120,240 Q150,210 180,240 Q150,250 120,240 Z" fill="#6366f1" />
      <path d="M220,240 Q250,210 280,240 Q250,250 220,240 Z" fill="#4f46e5" />
    `, 'violet');
  }

  if (norm.includes('they are caps') || norm.includes('these are caps')) {
    return createSvgUri(`
      <text x="200" y="75" font-size="56" text-anchor="middle" filter="url(#softShadow)">🧢🧢⭐</text>
      <text x="200" y="145" font-size="18" font-weight="extrabold" fill="#4f46e5" text-anchor="middle">Colorful Cute Caps!</text>
      <g transform="translate(130, 220) scale(0.65)">
        ${drawWitchHat(0, 0, 1.35)}
      </g>
      <g transform="translate(270, 225) scale(0.65) rotate(15)">
        ${drawWitchHat(0, 0, 1.35)}
      </g>
    `, 'warm');
  }

  if (norm.includes('they are maps') || norm.includes('these are maps')) {
    return createSvgUri(`
      <text x="200" y="75" font-size="56" text-anchor="middle" filter="url(#softShadow)">🗺️🗺️✨</text>
      <text x="200" y="145" font-size="18" font-weight="extrabold" fill="#0d9488" text-anchor="middle">Secret Explorer Maps!</text>
      <g transform="translate(130, 225) scale(0.65) rotate(-10)">
        ${drawAdventureMap(0, 0, 1.35)}
      </g>
      <g transform="translate(270, 225) scale(0.65) rotate(10)">
        ${drawAdventureMap(0, 0, 1.35)}
      </g>
    `, 'aqua');
  }

  if (norm.includes('they are vans') || norm.includes('those are vans')) {
    return createSvgUri(`
      <text x="200" y="70" font-size="56" text-anchor="middle" filter="url(#softShadow)">🚐🚐💨</text>
      <text x="200" y="140" font-size="18" font-weight="extrabold" fill="#0369a1" text-anchor="middle">Tiny Adventure Vans!</text>
      <g transform="translate(125, 230) scale(0.65)">
        ${drawCamperVan(0, 0, 1.3)}
      </g>
      <g transform="translate(275, 230) scale(0.65)">
        ${drawCamperVan(0, 0, 1.3)}
      </g>
    `, 'aqua');
  }

  if (norm.includes('they are fans') || norm.includes('those are fans')) {
    return createSvgUri(`
      <text x="200" y="70" font-size="56" text-anchor="middle" filter="url(#softShadow)">🌬️🌀✨</text>
      <text x="200" y="140" font-size="18" font-weight="extrabold" fill="#0d9488" text-anchor="middle">Cool Swirling Fans!</text>
      <g transform="translate(125, 225) scale(0.65)">
        ${drawRetroFan(0, 0, 1.25)}
      </g>
      <g transform="translate(275, 225) scale(0.65)">
        ${drawRetroFan(0, 0, 1.25)}
      </g>
    `, 'aqua');
  }

  // B. SPECIFIC POSITIONAL冒险 SCENES (Book 21: On, In, Under)
  
  if (norm.includes('hat is on the mat') || (norm.includes('hat') && norm.includes('mat') && norm.includes('on'))) {
    return createSvgUri(`
      <!-- Drawing mat first, then hat sitting on it -->
      ${drawCozyMat(200, 240, 1.4)}
      ${drawWitchHat(200, 185, 1.3)}
      <!-- Sparkle sparks -->
      <circle cx="130" cy="130" r="4" fill="#fbbf24" />
      <circle cx="280" cy="140" r="3" fill="#38bdf8" />
    `, 'warm');
  }

  if (norm.includes('mat is on the bat') || (norm.includes('mat') && norm.includes('bat') && norm.includes('on'))) {
    return createSvgUri(`
      <!-- Bat at base, then mat on top -->
      ${drawSportBat(200, 255, 1.5)}
      ${drawCozyMat(200, 175, 1.4)}
      <path d="M120,130 Q105,150 115,160" fill="none" stroke="#fbbf24" stroke-width="2" />
    `, 'aqua');
  }

  if (norm.includes('rat is in the bag') || (norm.includes('rat') && norm.includes('bag') && norm.includes('in'))) {
    return createSvgUri(`
      <!-- Large Bag, with cute Rat peeking out -->
      ${drawSchoolBag(200, 195, 1.4)}
      <!-- Rat head peaking inside bag flap -->
      <g transform="translate(200, 110) scale(0.65)" filter="url(#softShadow)">
        <polygon points="-15,10 0,-15 15,10" fill="#94a3b8" stroke="#475569" stroke-width="2.5" />
        <circle cx="-16" cy="-12" r="9" fill="#fda4af" stroke="#475569" stroke-width="2" />
        <circle cx="16" cy="-12" r="9" fill="#fda4af" stroke="#475569" stroke-width="2" />
        <circle cx="-5" cy="0" r="2" fill="#000" />
        <circle cx="5" cy="0" r="2" fill="#000" />
        <circle cx="0" cy="4" r="3" fill="#e11d48" />
        <line x1="-12" y1="5" x2="-2" y2="3" stroke="#475569" stroke-width="1.5" />
        <line x1="12" y1="5" x2="2" y2="3" stroke="#475569" stroke-width="1.5" />
      </g>
    `, 'warm');
  }

  if (norm.includes('bag is in the gap') || (norm.includes('bag') && norm.includes('gap') && norm.includes('in'))) {
    return createSvgUri(`
      <!-- Wooden blocks representing the GAP canyon, bag snuggled inside -->
      <!-- Left post -->
      <rect x="40" y="80" width="70" height="190" rx="12" fill="#c084fc" stroke="#6b21a8" stroke-width="3" />
      <!-- Right post -->
      <rect x="290" y="80" width="70" height="190" rx="12" fill="#c084fc" stroke="#6b21a8" stroke-width="3" />
      
      <!-- Bag nested in between -->
      ${drawSchoolBag(200, 210, 1.25)}
      <!-- Fun question marks -->
      <text x="200" y="100" font-size="32" font-weight="black" fill="#db2777" text-anchor="middle">⁉️😅</text>
    `, 'violet');
  }

  if (norm.includes('bat is under the map') || (norm.includes('bat') && norm.includes('map') && norm.includes('under'))) {
    return createSvgUri(`
      <!-- Bat under, Map on top -->
      ${drawSportBat(200, 250, 1.4)}
      ${drawAdventureMap(200, 155, 1.4)}
    `, 'aqua');
  }

  if (norm.includes('map is under the fan') || (norm.includes('map') && norm.includes('fan') && norm.includes('under'))) {
    return createSvgUri(`
      <!-- Map under, blowing Fan on top -->
      ${drawAdventureMap(190, 240, 1.35)}
      ${drawRetroFan(210, 105, 1.2)}
    `, 'aqua');
  }

  // C. THEMATIC COMPOSITIONS (Books 22 & 23: I Have... / I Don't Have...)
  
  if (norm.includes('have a cat') && norm.includes('have a mat')) {
    return createSvgUri(`
      <!-- Cat resting happily on a floor mat -->
      ${drawCozyMat(200, 230, 1.4)}
      <!-- Embedded Cute Little Cat drawings -->
      <g transform="translate(200, 150) scale(1.15)" filter="url(#softShadow)">
        <ellipse cx="0" cy="15" rx="30" ry="20" fill="#fdba74" stroke="#c2410c" stroke-width="3" />
        <circle cx="0" cy="-12" r="16" fill="#fdba74" stroke="#c2410c" stroke-width="3" />
        <polygon points="-12,-26 -16,-14 -4,-20" fill="#f97316" stroke="#c2410c" stroke-width="2"/>
        <polygon points="12,-26 16,-14 4,-20" fill="#f97316" stroke="#c2410c" stroke-width="2"/>
        <circle cx="-5" cy="-14" r="2" fill="#000" />
        <circle cx="5" cy="-14" r="2" fill="#000" />
        <path d="M-3,-10 Q0,-8 3,-10" fill="none" stroke="#000" stroke-width="1.5" />
      </g>
    `, 'cozy');
  }

  if (norm.includes('have a hat') && norm.includes('have a map')) {
    return createSvgUri(`
      <!-- Map with hat sitting beautifully over it -->
      ${drawAdventureMap(180, 220, 1.3)}
      ${drawWitchHat(220, 140, 1.35)}
    `, 'warm');
  }

  if (norm.includes('have a plan') && norm.includes('have a land')) {
    return createSvgUri(`
      <text x="200" y="80" font-size="64" text-anchor="middle" filter="url(#softShadow)">🗺️🏰🏞️</text>
      <text x="200" y="160" font-size="20" font-weight="black" fill="#15803d" text-anchor="middle">Our Dream Land & Project Plans</text>
      <!-- Draw dynamic tiny blueprint -->
      <rect x="140" y="200" width="120" height="70" rx="8" fill="#1d4ed8" stroke="#1e3a8a" stroke-width="3" />
      <line x1="150" y1="215" x2="250" y2="215" stroke="#93c5fd" stroke-width="2" />
      <line x1="150" y1="235" x2="220" y2="235" stroke="#93c5fd" stroke-width="2" />
      <path d="M190,240 L210,240 L200,260 Z" fill="none" stroke="#60a5fa" stroke-width="2" />
    `, 'aqua');
  }

  if (norm.includes('has a bat') && norm.includes('has a pan')) {
    return createSvgUri(`
      <!-- Bat and Pan crossed like a hero chef tool -->
      ${drawFryingPan(160, 200, 1.3)}
      ${drawSportBat(250, 160, 1.35)}
    `, 'warm');
  }

  if (norm.includes('has a lamp') && norm.includes('has a stamp')) {
    return createSvgUri(`
      <!-- Glow Lamp shining brightly on a cute pink stamp -->
      ${drawReadingLamp(135, 180, 1.35)}
      ${drawPostageStamp(265, 205, 1.2)}
    `, 'violet');
  }

  // D. NEGATIVE STATE OUTLINE (Book 23: I Don't Have...)
  if (norm.includes('don t have a cat') && norm.includes('don t have a mat')) {
    return createSvgUri(`
      <g transform="translate(200, 150)" filter="url(#softShadow)">
        <ellipse cx="0" cy="50" rx="75" ry="20" fill="none" stroke="#cbd5e1" stroke-width="3" stroke-dasharray="6 4" />
        <path d="M-40,45 Q-40,60 -10,60 Q20,60 20,45 Z" fill="#94a3b8" />
        <ellipse cx="-10" cy="45" rx="30" ry="8" fill="#fda4af" stroke="#f43f5e" stroke-width="1.5" />
        <text x="-10" y="48" font-size="8" font-weight="black" fill="#be185d" text-anchor="middle">CAT</text>
        <g opacity="0.1" transform="translate(-10, -20) scale(0.9)">
          <circle cx="0" cy="0" r="22" fill="#000" />
          <polygon points="-12,-30 -18,-15 -4,-20" fill="#000" />
          <polygon points="12,-30 18,-15 4,-20" fill="#000" />
        </g>
        <circle cx="45" cy="-20" r="28" fill="none" stroke="#ef4444" stroke-width="6" opacity="0.85" />
        <line x1="25" y1="0" x2="65" y2="-40" stroke="#ef4444" stroke-width="6" opacity="0.85" />
        <text x="45" y="-10" font-size="28" text-anchor="middle">🐱</text>
      </g>
      <text x="200" y="70" font-size="52" text-anchor="middle" filter="url(#softShadow)">🚫🐱🛋️</text>
    `, 'cozy');
  }

  if (norm.includes('don t have a hat') && norm.includes('don t have a map')) {
    return createSvgUri(`
      <g transform="translate(200, 150)" filter="url(#softShadow)">
        <line x1="-50" y1="-40" x2="-50" y2="60" stroke="#b45309" stroke-width="5" stroke-linecap="round" />
        <line x1="-50" y1="60" x2="-20" y2="60" stroke="#b45309" stroke-width="5" stroke-linecap="round" />
        <line x1="-50" y1="60" x2="-80" y2="60" stroke="#b45309" stroke-width="5" stroke-linecap="round" />
        <path d="M-50,-35 Q-30,-25 -35,-20" fill="none" stroke="#b45309" stroke-width="3.5" />
        <path d="M-50,-25 Q-70,-15 -65,-10" fill="none" stroke="#b45309" stroke-width="3.5" />
        <text x="-50" y="-10" font-size="28" text-anchor="middle">❌</text>
        
        <path d="M40,20 L60,20 L55,60 L45,60 Z" fill="#94a3b8" stroke="#475569" stroke-width="2.5" />
        <text x="50" y="45" font-size="18" text-anchor="middle">🗺️</text>
        <text x="50" y="30" font-size="24" text-anchor="middle">❌</text>
      </g>
      <text x="200" y="70" font-size="52" text-anchor="middle" filter="url(#softShadow)">🚫👒🗺️</text>
    `, 'warm');
  }

  if (norm.includes('don t have a plan') && norm.includes('don t have a land')) {
    return createSvgUri(`
      <g transform="translate(200, 150)" filter="url(#softShadow)">
        <rect x="-85" y="-30" width="70" height="50" rx="4" fill="#3b82f6" stroke="#1d4ed8" stroke-width="3" />
        <text x="-50" y="5" font-size="14" font-weight="black" fill="#fff" text-anchor="middle">PLAN ?</text>
        <text x="-50" y="-15" font-size="20" text-anchor="middle">❌</text>
        
        <path d="M20,50 Q50,25 80,50 Z" fill="#7c2d12" stroke="#451a03" stroke-width="2.5" />
        <text x="50" y="25" font-size="24" text-anchor="middle">🪧</text>
        <text x="50" y="32" font-size="16" text-anchor="middle">❌</text>
      </g>
      <text x="200" y="70" font-size="52" text-anchor="middle" filter="url(#softShadow)">🚫📋🏝️</text>
    `, 'aqua');
  }

  if (norm.includes('doesn t have a bat') && norm.includes('doesn t have a pan')) {
    return createSvgUri(`
      <g transform="translate(200, 155)" filter="url(#softShadow)">
        <rect x="-85" y="-20" width="70" height="70" rx="8" fill="#e2e8f0" stroke="#cbd5e1" stroke-width="2" />
        <circle cx="-70" cy="0" r="4" fill="#94a3b8" />
        <circle cx="-50" cy="0" r="4" fill="#94a3b8" />
        <text x="-50" y="25" font-size="28" text-anchor="middle">🏏</text>
        <text x="-50" y="15" font-size="28" text-anchor="middle">❌</text>
        
        <rect x="15" y="-20" width="70" height="70" rx="8" fill="#e2e8f0" stroke="#cbd5e1" stroke-width="2" />
        <line x1="50" y1="-15" x2="50" y2="5" stroke="#94a3b8" stroke-width="3" stroke-linecap="round" />
        <text x="50" y="25" font-size="28" text-anchor="middle">🍳</text>
        <text x="50" y="15" font-size="28" text-anchor="middle">❌</text>
      </g>
      <text x="200" y="70" font-size="52" text-anchor="middle" filter="url(#softShadow)">🚫🥎🍳</text>
    `, 'warm');
  }

  if (norm.includes('doesn t have a lamp') && norm.includes('doesn t have a stamp')) {
    return createSvgUri(`
      <g transform="translate(200, 150)" filter="url(#softShadow)">
        <line x1="-90" y1="50" x2="90" y2="50" stroke="#475569" stroke-width="4" stroke-linecap="round" />
        
        <rect x="-55" y="15" width="12" height="35" fill="#f87171" stroke="#b91c1c" stroke-width="2" />
        <path d="M-49,15 L-49,5" stroke="#000" stroke-width="2" />
        <path d="M-49,5 Q-43,-3 -49,-12 Q-55,-3 -49,5" fill="#fbbf24" />
        <text x="-15" y="25" font-size="20">💡❌</text>
        
        <rect x="25" y="15" width="55" height="35" rx="3" fill="#fff" stroke="#94a3b8" stroke-width="2" />
        <rect x="60" y="20" width="15" height="15" fill="none" stroke="#ef4444" stroke-width="1.5" stroke-dasharray="2 2" />
        <text x="68" y="32" font-size="12" fill="#ef4444" font-weight="black" text-anchor="middle">?</text>
        <line x1="30" y1="40" x2="52" y2="40" stroke="#cbd5e1" stroke-width="1.5" />
      </g>
      <text x="200" y="70" font-size="52" text-anchor="middle" filter="url(#softShadow)">🚫💡✉️</text>
    `, 'violet');
  }

  if (norm.includes('don t') || norm.includes('doesn t')) {
    return createSvgUri(`
      <g transform="translate(200, 195) scale(1.35)" filter="url(#softShadow)">
        <rect x="-40" y="0" width="80" height="40" rx="4" fill="#a1a1aa" stroke="#52525b" stroke-width="3" />
        <path d="M-40,0 Q0,-35 40,0 Z" fill="none" stroke="#52525b" stroke-width="3" />
        <text x="0" y="-8" font-size="28" text-anchor="middle" opacity="0.8">❔💨</text>
      </g>
      <text x="200" y="90" font-size="64" text-anchor="middle" filter="url(#softShadow)">🚫📦✨</text>
      <text x="200" y="145" font-size="16" font-weight="extrabold" fill="#4b5563" text-anchor="middle">“Oops! Nothing inside here!”</text>
    `, 'cozy');
  }

  // E1. CAN ACTION PLAYGROUND (Book 24: I Can...)
  if (norm === 'i can rap' || norm.includes('can rap')) {
    return createSvgUri(`
      <g transform="translate(200, 155)" filter="url(#softShadow)">
        <ellipse cx="0" cy="55" rx="75" ry="15" fill="#eab308" opacity="0.3" />
        <rect x="-8" y="25" width="16" height="30" rx="4" fill="#d97706" />
        <rect x="-12" y="-15" width="24" height="42" rx="6" fill="#fbbf24" stroke="#b45309" stroke-width="2.5" />
        <circle cx="0" cy="-5" r="7" fill="#475569" />
        <line x1="-3" y1="5" x2="3" y2="5" stroke="#1e293b" stroke-width="1.5" />
        <!-- Spotlight beams -->
        <polygon points="-75,-140 -20,10 20,10 75,-140" fill="#fef08a" opacity="0.15" />
        <text x="35" y="-10" font-size="28">🎤✨</text>
        <text x="-55" y="10" font-size="28">🎵🎶</text>
      </g>
      <text x="200" y="70" font-size="52" text-anchor="middle" filter="url(#softShadow)">🎤🌟🔥</text>
    `, 'violet');
  }

  if (norm === 'you can chant' || norm.includes('can chant')) {
    return createSvgUri(`
      <g transform="translate(200, 160)" filter="url(#softShadow)">
        <!-- Magical Wand -->
        <rect x="-3" y="-15" width="6" height="60" fill="#7c2d12" stroke="#451a03" stroke-width="2" transform="rotate(35)" rx="3" />
        <!-- Star burst at the tip of the wand -->
        <path d="M15,-20 Q25,-40 35,-20 Q55,-15 35,-10 Q25,10 15,-10 Q-5,-15 15,-20 Z" fill="#ebf8ff" stroke="#38bdf8" stroke-width="2" />
        <path d="M15,-18 C20,-28 28,-18 15,-10 C8,-18 10,-28 15,-18 Z" fill="#fed7aa" />
        
        <!-- Flying sparkles -->
        <circle cx="0" cy="-35" r="4" fill="#a855f7" />
        <circle cx="45" cy="-25" r="3" fill="#38bdf8" />
        <circle cx="30" cy="15" r="5" fill="#f43f5e" />
        <text x="0" y="45" font-size="28">🪄✨🟣</text>
      </g>
      <text x="200" y="70" font-size="52" text-anchor="middle" filter="url(#softShadow)">🪄💫🔮</text>
    `, 'violet');
  }

  if (norm === 'she can wag' || norm.includes('can wag')) {
    return createSvgUri(`
      <g transform="translate(200, 155)" filter="url(#softShadow)">
        <ellipse cx="0" cy="35" rx="60" ry="12" fill="#ca8a04" opacity="0.25" />
        <!-- Happy Dog wagging tail -->
        <ellipse cx="-15" cy="15" rx="28" ry="22" fill="#f59e0b" stroke="#78350f" stroke-width="3" />
        <circle cx="-15" cy="-15" r="18" fill="#f59e0b" stroke="#78350f" stroke-width="3" />
        <circle cx="-21" cy="-18" r="2" fill="#000" />
        <circle cx="-9" cy="-18" r="2" fill="#000" />
        <path d="M-17,-12 Q-15,-9 -13,-12" fill="none" stroke="#78350f" stroke-width="1.5" stroke-linecap="round" />
        <!-- Wagging Tail path -->
        <path d="M10,18 Q40,5 35,-15" fill="none" stroke="#f59e0b" stroke-width="5" stroke-linecap="round" />
        <path d="M10,18 Q35,18 25,5" fill="none" stroke="#78350f" stroke-width="2" />
        <!-- Movement indicators -->
        <path d="M38,-20 Q48,-15 42,-5" fill="none" stroke="#78350f" stroke-width="1.5" stroke-dasharray="2 2" />
        <path d="M30,-25 Q40,-20 34,-10" fill="none" stroke="#ed8936" stroke-width="1.5" />
      </g>
      <text x="200" y="70" font-size="52" text-anchor="middle" filter="url(#softShadow)">🐾🐶💖</text>
    `, 'warm');
  }

  if (norm === 'we can act' || norm.includes('can act')) {
    return createSvgUri(`
      <g transform="translate(200, 150)" filter="url(#softShadow)">
        <ellipse cx="0" cy="55" rx="90" ry="15" fill="#f43f5e" opacity="0.2" />
        <!-- Stage curtain background -->
        <path d="M-90,-40 L90,-40 L90,50 L-90,50 Z" fill="#991b1b" stroke="#7f1d1d" stroke-width="3" opacity="0.25" />
        <!-- Two acting masks (Happy/Comedy and Sad/Tragedy) -->
        <g transform="translate(-40, 5) rotate(-10)">
          <rect x="-24" y="-28" width="48" height="42" rx="10" fill="#fef08a" stroke="#ca8a04" stroke-width="2.5" />
          <ellipse cx="-8" cy="-12" rx="2" ry="4" fill="#000" />
          <ellipse cx="8" cy="-12" rx="2" ry="4" fill="#000" />
          <path d="M-10,4 Q0,12 10,4" fill="none" stroke="#ca8a04" stroke-width="2.5" stroke-linecap="round" />
        </g>
        <g transform="translate(35, 10) rotate(10)">
          <rect x="-24" y="-28" width="48" height="42" rx="10" fill="#a5b4fc" stroke="#4f46e5" stroke-width="2.5" />
          <ellipse cx="-8" cy="-12" rx="2" ry="4" fill="#000" />
          <ellipse cx="8" cy="-12" rx="2" ry="4" fill="#000" />
          <path d="M-10,8 Q0,0 10,8" fill="none" stroke="#4f46e5" stroke-width="2.5" stroke-linecap="round" />
        </g>
      </g>
      <text x="200" y="70" font-size="52" text-anchor="middle" filter="url(#softShadow)">🎭🎬👑</text>
    `, 'cozy');
  }

  // E. CAN'T ACTION OUTLINE (Book 25: I Can't...)
  if (norm.includes('can t rap')) {
    return createSvgUri(`
      <g transform="translate(200, 160)" filter="url(#softShadow)">
        <rect x="-45" y="15" width="90" height="40" rx="8" fill="#a5b4fc" stroke="#4f46e5" stroke-width="2.5" />
        <rect x="-45" y="15" width="90" height="15" fill="#818cf8" opacity="0.5" />
        
        <g transform="translate(0, 5) rotate(75)">
          <line x1="0" y1="10" x2="0" y2="35" stroke="#475569" stroke-width="4.5" />
          <rect x="-10" y="-10" width="20" height="24" rx="8" fill="#94a3b8" stroke="#334155" stroke-width="2.5" />
          <path d="M-6,-2 Q-4,0 -2,-2" fill="none" stroke="#000" stroke-width="1.5" stroke-linecap="round" />
          <path d="M2,-2 Q4,0 6,-2" fill="none" stroke="#000" stroke-width="1.5" stroke-linecap="round" />
        </g>
        <path d="M-12,-8 Q-12,-18 -22,-15 Q-15,-10 -12,4 Z" fill="#60a5fa" transform="translate(0, 5) rotate(75)" />
        <circle cx="-12" cy="-14" r="4" fill="#fff" transform="translate(0, 5) rotate(75)" />
        
        <text x="35" y="-15" font-size="16" font-weight="black" fill="#3b82f6">Z</text>
        <text x="45" y="-27" font-size="20" font-weight="black" fill="#60a5fa">z</text>
        <text x="55" y="-35" font-size="24" font-weight="black" fill="#93c5fd">z</text>
      </g>
      <text x="200" y="80" font-size="56" text-anchor="middle" filter="url(#softShadow)">🎤💤🚫</text>
    `, 'violet');
  }

  if (norm.includes('can t chant')) {
    return createSvgUri(`
      <g transform="translate(200, 160)" filter="url(#softShadow)">
        <rect x="-55" y="10" width="110" height="45" rx="6" fill="#7c2d12" stroke="#451a03" stroke-width="3" />
        <path d="M0,10 L0,55" stroke="#451a03" stroke-width="2" />
        <path d="M-50,15 Q-40,20 -45,35" fill="none" stroke="#cbd5e1" stroke-width="1" />
        
        <g transform="translate(-15, -20) rotate(-20)">
          <rect x="-2" y="-12" width="4" height="24" fill="#78350f" />
          <path d="M0,-12 Q5,-15 10,-8" fill="none" stroke="#ef4444" stroke-dasharray="2 2" />
        </g>
        <g transform="translate(15, -15) rotate(40)">
          <rect x="-2" y="-12" width="4" height="24" fill="#78350f" />
        </g>
        
        <path d="M0,-25 Q-15,-32 -25,-25 Q-35,-15 -20,-5 Q0,-10 0,-25 Z" fill="#84cc16" opacity="0.75" />
        <path d="M5,-25 Q20,-32 30,-25 Q40,-15 25,-5 Q5,-10 5,-25 Z" fill="#4ade80" opacity="0.6" />
        
        <text x="0" y="-15" font-size="28" font-weight="black" fill="#e11d48">⁉️💨</text>
      </g>
      <text x="200" y="80" font-size="56" text-anchor="middle" filter="url(#softShadow)">🪄🚫💨</text>
    `, 'violet');
  }

  if (norm.includes('can t wag')) {
    return createSvgUri(`
      <g transform="translate(200, 160)" filter="url(#softShadow)">
        <ellipse cx="-15" cy="20" rx="25" ry="32" fill="#ca8a04" stroke="#78350f" stroke-width="3" />
        <circle cx="-15" cy="-20" r="22" fill="#eab308" stroke="#78350f" stroke-width="3" />
        <path d="M-35,-25 Q-45,-10 -35,5 Q-28,-5 -32,-20 Z" fill="#78350f" stroke="#451a03" stroke-width="2" />
        <circle cx="-20" cy="-22" r="2.5" fill="#000" />
        <circle cx="-10" cy="-22" r="2.5" fill="#000" />
        <path d="M-18,-14 Q-15,-17 -12,-14" fill="none" stroke="#000" stroke-width="1.5" stroke-linecap="round" />
        <path d="M-1,-26 Q-3,-22 1,-21 Q3,-25 -1,-26" fill="#38bdf8" />
        
        <g transform="translate(20, 25) rotate(-35)">
          <path d="M0,0 Q25,-5 30,-15 Q15,-18 0,0" fill="#ca8a04" stroke="#78350f" stroke-width="2.5" />
          <rect x="8" y="-12" width="8" height="18" fill="#fda4af" stroke="#e11d48" stroke-width="1" rx="2" />
          <rect x="3" y="-7" width="18" height="8" fill="#fda4af" stroke="#e11d48" stroke-width="1" rx="2" />
        </g>
      </g>
      <text x="200" y="80" font-size="56" text-anchor="middle" filter="url(#softShadow)">🐶🩹🚫</text>
    `, 'warm');
  }

  if (norm.includes('can t act')) {
    return createSvgUri(`
      <rect x="80" y="50" width="240" height="190" rx="8" fill="#991b1b" stroke="#7f1d1d" stroke-width="4.5" />
      <line x1="200" y1="50" x2="200" y2="240" stroke="#7f1d1d" stroke-width="3" />
      
      <path d="M85,55 Q105,75 125,55 M85,75 Q115,105 145,55" fill="none" stroke="#cbd5e1" stroke-width="1.5" opacity="0.6" />
      
      <g transform="translate(200, 140)" filter="url(#softShadow)">
        <rect x="-60" y="-20" width="120" height="40" rx="4" fill="#1e293b" stroke="#d97706" stroke-width="3.5" />
        <line x1="-35" y1="-20" x2="-35" y2="-32" stroke="#475569" stroke-width="3" />
        <line x1="35" y1="-20" x2="35" y2="-32" stroke="#475569" stroke-width="3" />
        <text x="0" y="5" font-size="14" font-weight="extrabold" fill="#fbbf24" text-anchor="middle">OFF AIR / 休息</text>
      </g>
      <text x="200" y="80" font-size="52" text-anchor="middle" filter="url(#softShadow)">🎭🚫🪧</text>
    `, 'cozy');
  }

  // F. CAN YOU? QUESTIONS COMPARATIVE PANELS (Book 26: Can You...?)
  if (norm.includes('can you rap') && (norm.includes('yes') || norm.includes('no') || norm.includes('can t'))) {
    return createSvgUri(`
      <line x1="200" y1="90" x2="200" y2="245" stroke="#94a3b8" stroke-width="3" stroke-dasharray="4 4" />
      
      <g transform="translate(110, 160)" filter="url(#softShadow)">
        <circle cx="0" cy="15" r="38" fill="#fef08a" opacity="0.3" />
        <rect x="-8" y="5" width="16" height="30" rx="4" fill="#d97706" />
        <rect x="-12" y="-15" width="24" height="22" rx="6" fill="#fbbf24" stroke="#b45309" stroke-width="2" />
        <text x="0" y="-30" font-size="20">✨🎤</text>
        <rect x="-24" y="24" width="48" height="15" rx="3" fill="#22c55e" />
        <text x="0" y="34" font-size="9" font-weight="black" fill="#fff" text-anchor="middle">YES! YES</text>
      </g>
      
      <g transform="translate(290, 160)" filter="url(#softShadow)">
        <ellipse cx="0" cy="15" rx="32" ry="12" fill="#cbd5e1" />
        <g transform="rotate(30)">
          <rect x="-6" y="-3" width="12" height="22" rx="3" fill="#64748b" />
          <circle cx="0" cy="-10" r="10" fill="#94a3b8" stroke="#475569" stroke-width="2" />
        </g>
        <text x="0" y="-30" font-size="20">🚫💤</text>
        <rect x="-24" y="24" width="48" height="15" rx="3" fill="#ef4444" />
        <text x="0" y="34" font-size="9" font-weight="black" fill="#fff" text-anchor="middle">NO... NO</text>
      </g>
      <text x="200" y="65" font-size="34" font-weight="black" fill="#4338ca" text-anchor="middle">Can you rap? 🎤❓</text>
    `, 'violet');
  }

  if (norm.includes('can you chant') && (norm.includes('yes') || norm.includes('no') || norm.includes('can t'))) {
    return createSvgUri(`
      <line x1="200" y1="90" x2="200" y2="245" stroke="#94a3b8" stroke-width="3" stroke-dasharray="4 4" />
      
      <g transform="translate(100, 160)" filter="url(#softShadow)">
        <polygon points="0,-35 8,-15 28,-15 12,0 18,22 0,8 -18,22 -12,0 -28,-15 -8,-15" fill="#fdeb61" stroke="#d97706" stroke-width="2" transform="scale(0.85)" />
        <rect x="-3" y="15" width="6" height="35" fill="#a855f7" stroke="#7e22ce" stroke-width="1.5" rx="3" />
        <circle cx="15" cy="-25" r="3" fill="#fff" />
        <circle cx="-15" cy="-10" r="2.5" fill="#fff" />
        <text x="0" y="-45" font-size="16">✨🪄</text>
        <rect x="-24" y="28" width="48" height="15" rx="3" fill="#22c55e" />
        <text x="0" y="38" font-size="9" font-weight="black" fill="#fff" text-anchor="middle">YES</text>
      </g>
      
      <g transform="translate(300, 160)" filter="url(#softShadow)">
        <rect x="-2" y="-15" width="4" height="42" fill="#78350f" transform="rotate(25)" />
        <text x="15" y="-12" font-size="16">❓💨</text>
        <rect x="-24" y="28" width="48" height="15" rx="3" fill="#ef4444" />
        <text x="0" y="38" font-size="9" font-weight="black" fill="#fff" text-anchor="middle">NO</text>
      </g>
      <text x="200" y="65" font-size="34" font-weight="black" fill="#4338ca" text-anchor="middle">Can you chant? 🪄❓</text>
    `, 'violet');
  }

  if (norm.includes('can she wag') && (norm.includes('yes') || norm.includes('no') || norm.includes('can t'))) {
    return createSvgUri(`
      <line x1="200" y1="90" x2="200" y2="245" stroke="#94a3b8" stroke-width="3" stroke-dasharray="4 4" />
      
      <g transform="translate(100, 160)" filter="url(#softShadow)">
        <text x="0" y="-20" font-size="32">🐶</text>
        <path d="M5,5 Q20,-10 25,5 Q10,12 5,5" fill="#f59e0b" stroke="#b45309" stroke-width="1.5" />
        <path d="M12,-16 Q20,-20 18,-10" fill="none" stroke="#f59e0b" stroke-width="2.5" stroke-dasharray="2 2" />
        <text x="0" y="-38" font-size="12">🐾❤</text>
        <rect x="-24" y="22" width="48" height="15" rx="3" fill="#22c55e" />
        <text x="0" y="32" font-size="9" font-weight="black" fill="#fff" text-anchor="middle">YES</text>
      </g>
      
      <g transform="translate(300, 160)" filter="url(#softShadow)">
        <text x="0" y="-15" font-size="32">🐌</text>
        <text x="15" y="-25" font-size="14">💤</text>
        <rect x="-24" y="22" width="48" height="15" rx="3" fill="#ef4444" />
        <text x="0" y="32" font-size="9" font-weight="black" fill="#fff" text-anchor="middle">NO</text>
      </g>
      <text x="200" y="65" font-size="34" font-weight="black" fill="#4338ca" text-anchor="middle">Can she wag? 🐶❓</text>
    `, 'warm');
  }

  if (norm.includes('can he act') && (norm.includes('yes') || norm.includes('no') || norm.includes('can t'))) {
    return createSvgUri(`
      <line x1="200" y1="90" x2="200" y2="245" stroke="#94a3b8" stroke-width="3" stroke-dasharray="4 4" />
      
      <g transform="translate(100, 160)" filter="url(#softShadow)">
        <text x="0" y="-15" font-size="38">🎭</text>
        <text x="14" y="-28" font-size="14">⭐</text>
        <text x="-24" y="-3" font-size="12">✨</text>
        <rect x="-24" y="22" width="48" height="15" rx="3" fill="#22c55e" />
        <text x="0" y="32" font-size="9" font-weight="black" fill="#fff" text-anchor="middle">YES</text>
      </g>
      
      <g transform="translate(300, 160)" filter="url(#softShadow)">
        <rect x="-20" y="-20" width="40" height="35" rx="2" fill="#d97706" stroke="#9a3412" stroke-width="2.5" />
        <circle cx="-6" cy="-8" r="1.5" fill="#000" />
        <circle cx="6" cy="-8" r="1.5" fill="#000" />
        <line x1="-8" y1="2" x2="8" y2="2" stroke="#000" stroke-width="1.5" />
        <text x="15" y="-25" font-size="12">❔</text>
        <rect x="-24" y="22" width="48" height="15" rx="3" fill="#ef4444" />
        <text x="0" y="32" font-size="9" font-weight="black" fill="#fff" text-anchor="middle">NO</text>
      </g>
      <text x="200" y="65" font-size="34" font-weight="black" fill="#4338ca" text-anchor="middle">Can he act? 🎬❓</text>
    `, 'cozy');
  }

  if (norm.includes('can we chat') && (norm.includes('yes') || norm.includes('no') || norm.includes('can t'))) {
    return createSvgUri(`
      <line x1="200" y1="90" x2="200" y2="245" stroke="#94a3b8" stroke-width="3" stroke-dasharray="4 4" />
      
      <g transform="translate(100, 160)" filter="url(#softShadow)">
        <text x="-12" y="-5" font-size="28">💬</text>
        <text x="12" y="-18" font-size="28">💬</text>
        <text x="0" y="-35" font-size="16">💖</text>
        <rect x="-24" y="22" width="48" height="15" rx="3" fill="#22c55e" />
        <text x="0" y="32" font-size="9" font-weight="black" fill="#fff" text-anchor="middle">YES</text>
      </g>
      
      <g transform="translate(300, 160)" filter="url(#softShadow)">
        <rect x="-35" y="-10" width="16" height="24" rx="2" fill="#94a3b8" stroke="#475569" stroke-width="2" />
        <rect x="20" y="-10" width="16" height="24" rx="2" fill="#94a3b8" stroke="#475569" stroke-width="2" />
        <path d="M-19,2 L-5,5 M3,5 L20,2" stroke="#ef4444" stroke-width="2" />
        <text x="0" y="-24" font-size="14" font-weight="extrabold" fill="#ef4444">✂️</text>
        <rect x="-24" y="22" width="48" height="15" rx="3" fill="#ef4444" />
        <text x="0" y="32" font-size="9" font-weight="black" fill="#fff" text-anchor="middle">NO</text>
      </g>
      <text x="200" y="65" font-size="34" font-weight="black" fill="#4338ca" text-anchor="middle">Can we chat? 💬❓</text>
    `, 'cozy');
  }

  // G. ACTION CARTOONS (Books 24, 25, 26: Rap, Chant, Wag, Act, Chat)
  if (norm.includes('rap')) {
    return createSvgUri(`
      <circle cx="200" cy="150" r="75" fill="#fdeb61" opacity="0.3" />
      <g transform="translate(200, 175) scale(1.4)" filter="url(#softShadow)">
        <line x1="0" y1="20" x2="0" y2="60" stroke="#475569" stroke-width="4" />
        <rect x="-15" y="58" width="30" height="6" rx="2" fill="#475569" />
        <rect x="-12" y="-12" width="24" height="32" rx="10" fill="#64748b" stroke="#334155" stroke-width="3" />
        <line x1="-12" y1="-2" x2="12" y2="-2" stroke="#cbd5e1" stroke-width="2" />
        <line x1="-12" y1="8" x2="12" y2="8" stroke="#cbd5e1" stroke-width="2" />
        <path d="M-8,-12 Q0,-25 8,-12 Z" fill="#cbd5e1" stroke="#334155" stroke-width="2" />
      </g>
      <g transform="translate(100, 80) scale(1.15)">
        <path d="M-40,-20 L20,-20 Q30,-20 30,-10 L30,10 Q30,20 15,20 L5,28 L0,20 L-40,20 Q-50,20 -50,10 L-50,-10 Q-50,-20 -40,-20 Z" fill="#ef4444" stroke="#991b1b" stroke-width="2" />
        <text x="-10" y="5" font-weight="black" fill="#fff" font-size="16" text-anchor="middle">YO!🎤</text>
      </g>
      <text x="290" y="90" font-size="34">♬</text>
      <text x="80" y="220" font-size="34" fill="#a855f7">♪</text>
      <text x="310" y="210" font-size="34" fill="#60a5fa">♫</text>
    `, 'violet');
  }

  if (norm.includes('chant')) {
    return createSvgUri(`
      <circle cx="200" cy="140" r="55" fill="none" stroke="#a855f7" stroke-width="3" stroke-dasharray="8 6" opacity="0.75" />
      <circle cx="200" cy="140" r="35" fill="none" stroke="#22d3ee" stroke-width="2" opacity="0.6" />
      <text x="200" y="105" font-size="64" text-anchor="middle" filter="url(#softShadow)">🪄✨🌟</text>
      <text x="200" y="160" font-size="18" font-weight="black" fill="#6d28d9" text-anchor="middle">🧙‍♂️ Enchanted Melodic Chants 🧙‍♀️</text>
      <text x="200" y="230" font-size="15" fill="#c084fc" text-anchor="middle">“La-La-La~ ✨ Pure Phonics Magic”</text>
    `, 'violet');
  }

  if (norm.includes('wag')) {
    return createSvgUri(`
      <text x="200" y="100" font-size="64" text-anchor="middle" filter="url(#softShadow)">🐶🐾🦴</text>
      <path d="M120,220 Q160,180 200,220" fill="none" stroke="#f59e0b" stroke-width="4.5" stroke-dasharray="5 4" stroke-linecap="round" />
      <path d="M200,220 Q240,180 280,220" fill="none" stroke="#f59e0b" stroke-width="4.5" stroke-dasharray="5 4" stroke-linecap="round" />
      <text x="200" y="170" font-size="18" font-weight="black" fill="#b45309" text-anchor="middle">Tail-Wagging Happiness!</text>
    `, 'warm');
  }

  if (norm.includes('act')) {
    return createSvgUri(`
      <polygon points="200,0 120,290 280,290" fill="#fef08a" opacity="0.25" />
      <path d="M0,0 L60,0 Q40,150 60,300 L0,300 Z" fill="#b91c1c" stroke="#7f1d1d" stroke-width="2" />
      <circle cx="35" cy="150" r="10" fill="#fbbf24" />
      <path d="M400,0 L340,0 Q360,150 340,300 L400,300 Z" fill="#b91c1c" stroke="#7f1d1d" stroke-width="2" />
      <circle cx="365" cy="150" r="10" fill="#fbbf24" />
      
      <text x="200" y="125" font-size="56" text-anchor="middle" filter="url(#softShadow)">🎭⭐🎬</text>
      <text x="200" y="180" font-size="18" font-weight="black" fill="#fff" text-anchor="middle">Athelred Super Cinema Stage</text>
    `, 'cozy');
  }

  if (norm.includes('chat') || norm.includes('talk')) {
    return createSvgUri(`
      <g transform="translate(140, 130) scale(1.15)" filter="url(#softShadow)">
        <path d="M-45,-25 C-45,-25 45,-25 45,-25 C45,-25 45,25 45,25 C45,25 15,25 5,35 L-5,25 C-45,25 -45,25 -45,25 Z" fill="#fce7f3" stroke="#db2777" stroke-width="2.5" />
        <text x="0" y="5" font-size="14" font-weight="bold" fill="#be185d">Hello!💬</text>
      </g>
      <g transform="translate(260, 175) scale(1.1)" filter="url(#softShadow)">
        <path d="M-45,-25 C-45,-25 45,-25 45,-25 C45,-25 45,25 45,25 C45,25 -15,25 -25,35 L-25,25 C-45,25 -45,25 -45,25 Z" fill="#fef9c3" stroke="#ca8a04" stroke-width="2.5" />
        <text x="0" y="5" font-size="14" font-weight="bold" fill="#ca8a04">Hi! Friend❤</text>
      </g>
      <text x="200" y="60" font-size="36" filter="url(#softShadow)">💖</text>
    `, 'cozy');
  }

  // F. GENERIC SINGLE ITEMS
  if (norm.includes('mat')) return createSvgUri(drawCozyMat(200, 150, 1.8), 'cozy');
  if (norm.includes('hat') || norm.includes('caps') || norm.includes('cap')) return createSvgUri(drawWitchHat(200, 150, 1.8), 'warm');
  if (norm.includes('map') || norm.includes('maps')) return createSvgUri(drawAdventureMap(200, 150, 1.8), 'aqua');
  if (norm.includes('bag')) return createSvgUri(drawSchoolBag(200, 150, 1.7), 'warm');
  if (norm.includes('flag')) return createSvgUri(drawRoyalFlag(200, 150, 1.6), 'aqua');
  if (norm.includes('pad')) return createSvgUri(drawInteractivePad(200, 150, 1.7), 'aqua');
  if (norm.includes('van')) return createSvgUri(drawCamperVan(200, 140, 1.6), 'aqua');
  if (norm.includes('fan')) return createSvgUri(drawRetroFan(200, 135, 1.5), 'aqua');
  if (norm.includes('pan')) return createSvgUri(drawFryingPan(200, 150, 1.65), 'warm');
  if (norm.includes('lamp')) return createSvgUri(drawReadingLamp(200, 140, 1.55), 'violet');
  if (norm.includes('stamp')) return createSvgUri(drawPostageStamp(200, 150, 1.6), 'violet');

  // G. FALLBACK BOOK SCENE
  return createSvgUri(`
    <path d="M120,180 Q200,165 200,120 Q200,165 280,180" fill="none" stroke="#22d3ee" stroke-width="5" stroke-linecap="round"/>
    <text x="200" y="110" font-size="76" text-anchor="middle" filter="url(#softShadow)">📖⭐✨</text>
    <text x="200" y="180" font-size="18" font-weight="black" fill="#1e1b4b" text-anchor="middle">Word Adventure Realm</text>
    <text x="200" y="210" font-size="11" font-weight="bold" fill="#6366f1" text-anchor="middle">Step by Step Phonics Castle</text>
  `, 'cozy');
}

export const BOOK_20_COVER_SVG = createSvgUri(`
  <g transform="translate(200, 140) scale(1.1)" filter="url(#softShadow)">
    <text x="0" y="-10" font-size="76" text-anchor="middle">🎁⭐</text>
    <text x="-45" y="-55" font-size="28" text-anchor="middle">🧢</text>
    <text x="35" y="-55" font-size="28" text-anchor="middle">🗺️</text>
    <text x="-65" y="-15" font-size="28" text-anchor="middle">🚐</text>
    <text x="65" y="-15" font-size="28" text-anchor="middle">🌬️</text>
  </g>
  <text x="200" y="225" font-size="22" font-weight="black" fill="#1e1b4b" text-anchor="middle">Caps, Maps, Vans &amp; Fans</text>
  <text x="200" y="250" font-size="11" font-weight="bold" fill="#6366f1" text-anchor="middle">WordLand Adventure Vol. 20</text>
`, 'violet');

export const BOOK_21_COVER_SVG = createSvgUri(`
  <g transform="translate(200, 130) scale(1.1)" filter="url(#softShadow)">
    <text x="-20" y="10" font-size="64" text-anchor="middle">🗺️</text>
    <text x="30" y="-10" font-size="56" text-anchor="middle">📍</text>
    <text x="0" y="-40" font-size="36" text-anchor="middle">👒</text>
  </g>
  <text x="200" y="215" font-size="22" font-weight="black" fill="#1e1b4b" text-anchor="middle">On, In, Under 方位冒险</text>
  <text x="200" y="240" font-size="11" font-weight="bold" fill="#0d9488" text-anchor="middle">WordLand Adventure Vol. 21</text>
`, 'aqua');

export const BOOK_22_COVER_SVG = createSvgUri(`
  <g transform="translate(200, 130) scale(1.1)" filter="url(#softShadow)">
    <text x="0" y="5" font-size="76" text-anchor="middle">⭐👑</text>
    <text x="-50" y="-15" font-size="34" text-anchor="middle">🐱</text>
    <text x="50" y="-15" font-size="34" text-anchor="middle">🛡️</text>
  </g>
  <text x="200" y="215" font-size="22" font-weight="black" fill="#1e1b4b" text-anchor="middle">I Have a Cat 🌟</text>
  <text x="200" y="240" font-size="11" font-weight="bold" fill="#ca8a04" text-anchor="middle">WordLand Adventure Vol. 22</text>
`, 'warm');

export const BOOK_23_COVER_SVG = createSvgUri(`
  <g transform="translate(200, 140) scale(1.15)" filter="url(#softShadow)">
    <rect x="-40" y="0" width="80" height="40" rx="4" fill="#a1a1aa" stroke="#52525b" stroke-width="3" />
    <path d="M-40,0 Q0,-35 40,0 Z" fill="none" stroke="#52525b" stroke-width="3" />
    <text x="0" y="-8" font-size="28" text-anchor="middle" opacity="0.8">❔💨</text>
  </g>
  <text x="200" y="90" font-size="64" text-anchor="middle" filter="url(#softShadow)">🚫📦✨</text>
  <text x="200" y="220" font-size="21" font-weight="black" fill="#1e1b4b" text-anchor="middle">I Don't Have a Cat 城堡</text>
  <text x="200" y="245" font-size="11" font-weight="bold" fill="#4b5563" text-anchor="middle">WordLand Adventure Vol. 23</text>
`, 'cozy');

export const BOOK_24_COVER_SVG = createSvgUri(`
  <g transform="translate(200, 130) scale(1.15)" filter="url(#softShadow)">
    <text x="0" y="-5" font-size="72" text-anchor="middle">🎤🌟</text>
    <text x="-45" y="-35" font-size="24" text-anchor="middle">🎵</text>
    <text x="45" y="-35" font-size="24" text-anchor="middle">🎶</text>
  </g>
  <text x="200" y="215" font-size="22" font-weight="black" fill="#1e1b4b" text-anchor="middle">I Can Rap! 🎤</text>
  <text x="200" y="240" font-size="11" font-weight="bold" fill="#be185d" text-anchor="middle">WordLand Adventure Vol. 24</text>
`, 'violet');

export const BOOK_25_COVER_SVG = createSvgUri(`
  <g transform="translate(200, 130) scale(1.15)" filter="url(#softShadow)">
    <text x="0" y="-5" font-size="72" text-anchor="middle">💤😴</text>
    <text x="-40" y="-30" font-size="28" text-anchor="middle">🎤</text>
    <text x="40" y="-30" font-size="28" text-anchor="middle">🚫</text>
  </g>
  <text x="200" y="215" font-size="22" font-weight="black" fill="#1e1b4b" text-anchor="middle">I Can't Rap 💤</text>
  <text x="200" y="240" font-size="11" font-weight="bold" fill="#64748b" text-anchor="middle">WordLand Adventure Vol. 25</text>
`, 'cozy');

export const BOOK_26_COVER_SVG = createSvgUri(`
  <g transform="translate(200, 130) scale(1.15)" filter="url(#softShadow)">
    <text x="0" y="-5" font-size="72" text-anchor="middle">🏁❓</text>
    <text x="-45" y="-30" font-size="24" text-anchor="middle">👍</text>
    <text x="45" y="-30" font-size="24" text-anchor="middle">👎</text>
  </g>
  <text x="200" y="215" font-size="22" font-weight="black" fill="#1e1b4b" text-anchor="middle">Can You Rap? 🏁</text>
  <text x="200" y="240" font-size="11" font-weight="bold" fill="#4338ca" text-anchor="middle">Can You Rap? 🏁</text>
`, 'violet');

export const BOOK_19_COVER_SVG = createSvgUri(`
  <g transform="translate(200, 130) scale(1.15)" filter="url(#softShadow)">
    <rect x="-40" y="-10" width="80" height="60" rx="6" fill="#f59e0b" stroke="#b45309" stroke-width="3.5" />
    <path d="M-40,-10 L-5,-30 L0,-10 Z" fill="#d97706" stroke="#b45309" stroke-width="2.5" />
    <path d="M40,-10 L5,-30 L0,-10 Z" fill="#d97706" stroke="#b45309" stroke-width="2.5" />
    <text x="0" y="30" font-size="36" text-anchor="middle">🐱📦</text>
    <text x="0" y="-35" font-size="44" text-anchor="middle">❓</text>
  </g>
  <text x="200" y="215" font-size="22" font-weight="black" fill="#1e1b4b" text-anchor="middle">What Is It? It's a Cat</text>
  <text x="200" y="240" font-size="11" font-weight="bold" fill="#b45309" text-anchor="middle">WordLand Adventure Vol. 19</text>
`, 'warm');
