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
  const norm = english.toLowerCase().replace(/[.,'!?\-]/g, ' ').replace(/\s+/g, ' ').trim();
  
  // 1. Keep original premium PNGs if configured!
  if (originalImage && (
    originalImage.includes('dad_') || 
    originalImage.includes('picbook_')
  )) {
    return originalImage;
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
  if (norm.includes('don t') || norm.includes('doesn t')) {
    // Renders a funny empty chest/box with sparkles and question marks to denote not having it!
    return createSvgUri(`
      <!-- Empty toy treasure chest box open -->
      <g transform="translate(200, 195) scale(1.35)" filter="url(#softShadow)">
        <rect x="-40" y="0" width="80" height="40" rx="4" fill="#a1a1aa" stroke="#52525b" stroke-width="3" />
        <!-- Open lid -->
        <path d="M-40,0 Q0,-35 40,0 Z" fill="none" stroke="#52525b" stroke-width="3" />
        <!-- Huge colorful empty sparkle clouds and no coin icon -->
        <text x="0" y="-8" font-size="28" text-anchor="middle" opacity="0.8">❔💨</text>
      </g>
      <text x="200" y="90" font-size="64" text-anchor="middle" filter="url(#softShadow)">🚫📦✨</text>
      <text x="200" y="145" font-size="16" font-weight="extrabold" fill="#4b5563" text-anchor="middle">“Oops! Nothing inside here!”</text>
    `, 'cozy');
  }

  // E. ACTION CARTOONS (Books 24, 25, 26: Rap, Chant, Wag, Act, Chat)
  
  if (norm.includes('rap')) {
    return createSvgUri(`
      <!-- Hip hop silver vintage microphone, music note sparkles -->
      <circle cx="200" cy="150" r="75" fill="#fdeb61" opacity="0.3" />
      <g transform="translate(200, 175) scale(1.4)" filter="url(#softShadow)">
        <!-- Stand -->
        <line x1="0" y1="20" x2="0" y2="60" stroke="#475569" stroke-width="4" />
        <rect x="-15" y="58" width="30" height="6" rx="2" fill="#475569" />
        <!-- Mic Head -->
        <rect x="-12" y="-12" width="24" height="32" rx="10" fill="#64748b" stroke="#334155" stroke-width="3" />
        <line x1="-12" y1="-2" x2="12" y2="-2" stroke="#cbd5e1" stroke-width="2" />
        <line x1="-12" y1="8" x2="12" y2="8" stroke="#cbd5e1" stroke-width="2" />
        <path d="M-8,-12 Q0,-25 8,-12 Z" fill="#cbd5e1" stroke="#334155" stroke-width="2" />
      </g>
      <!-- Large comic YO! bubble -->
      <g transform="translate(100, 80) scale(1.15)">
        <path d="M-40,-20 L20,-20 Q30,-20 30,-10 L30,10 Q30,20 15,20 L5,28 L0,20 L-40,20 Q-50,20 -50,10 L-50,-10 Q-50,-20 -40,-20 Z" fill="#ef4444" stroke="#991b1b" stroke-width="2" />
        <text x="-10" y="5" font-weight="black" fill="#fff" font-size="16" text-anchor="middle">YO!🎤</text>
      </g>
      <!-- Floating musical stave decorations -->
      <text x="290" y="90" font-size="34">♬</text>
      <text x="80" y="220" font-size="34" fill="#a855f7">♪</text>
      <text x="310" y="210" font-size="34" fill="#60a5fa">♫</text>
    `, 'violet');
  }

  if (norm.includes('chant')) {
    return createSvgUri(`
      <!-- Chanting magic circles and sparkles -->
      <circle cx="200" cy="140" r="55" fill="none" stroke="#a855f7" stroke-width="3" stroke-dasharray="8 6" opacity="0.75" />
      <circle cx="200" cy="140" r="35" fill="none" stroke="#22d3ee" stroke-width="2" opacity="0.6" />
      <text x="200" y="105" font-size="64" text-anchor="middle" filter="url(#softShadow)">🪄✨🌟</text>
      <text x="200" y="160" font-size="18" font-weight="black" fill="#6d28d9" text-anchor="middle">🧙‍♂️ Enchanted Melodic Chants 🧙‍♀️</text>
      <text x="200" y="230" font-size="15" fill="#c084fc" text-anchor="middle">“La-La-La~ ✨ Pure Phonics Magic”</text>
    `, 'violet');
  }

  if (norm.includes('wag')) {
    return createSvgUri(`
      <!-- Happy Wagging Dog tail cartoon action trail -->
      <text x="200" y="100" font-size="64" text-anchor="middle" filter="url(#softShadow)">🐶🐾🦴</text>
      <!-- Action trail arc paths -->
      <path d="M120,220 Q160,180 200,220" fill="none" stroke="#f59e0b" stroke-width="4.5" stroke-dasharray="5 4" stroke-linecap="round" />
      <path d="M200,220 Q240,180 280,220" fill="none" stroke="#f59e0b" stroke-width="4.5" stroke-dasharray="5 4" stroke-linecap="round" />
      <text x="200" y="170" font-size="18" font-weight="black" fill="#b45309" text-anchor="middle">Tail-Wagging Happiness!</text>
    `, 'warm');
  }

  if (norm.includes('act')) {
    return createSvgUri(`
      <!-- Stage spotlight on wooden boards with red curtain folds on sides -->
      <!-- Spotlight wedge -->
      <polygon points="200,0 120,290 280,290" fill="#fef08a" opacity="0.25" />
      <!-- Left curtain fold -->
      <path d="M0,0 L60,0 Q40,150 60,300 L0,300 Z" fill="#b91c1c" stroke="#7f1d1d" stroke-width="2" />
      <circle cx="35" cy="150" r="10" fill="#fbbf24" />
      <!-- Right curtain fold -->
      <path d="M400,0 L340,0 Q360,150 340,300 L400,300 Z" fill="#b91c1c" stroke="#7f1d1d" stroke-width="2" />
      <circle cx="365" cy="150" r="10" fill="#fbbf24" />
      
      <!-- Center stage theater masks or smiley -->
      <text x="200" y="125" font-size="56" text-anchor="middle" filter="url(#softShadow)">🎭⭐🎬</text>
      <text x="200" y="180" font-size="18" font-weight="black" fill="#fff" text-anchor="middle">Athelred Super Cinema Stage</text>
    `, 'cozy');
  }

  if (norm.includes('chat') || norm.includes('talk')) {
    return createSvgUri(`
      <!-- Overlapping pink and cream speech bubbles with hearts -->
      <g transform="translate(140, 130) scale(1.15)" filter="url(#softShadow)">
        <path d="M-45,-25 C-45,-25 45,-25 45,-25 C45,-25 45,25 45,25 C45,25 15,25 5,35 L-5,25 C-45,25 -45,25 -45,25 Z" fill="#fce7f3" stroke="#db2777" stroke-width="2.5" />
        <text x="0" y="5" font-size="14" font-weight="bold" fill="#be185d">Hello!💬</text>
      </g>
      <g transform="translate(260, 175) scale(1.1)" filter="url(#softShadow)">
        <path d="M-45,-25 C-45,-25 45,-25 45,-25 C45,-25 45,25 45,25 C45,25 -15,25 -25,35 L-25,25 C-45,25 -45,25 -45,25 Z" fill="#fef9c3" stroke="#ca8a04" stroke-width="2.5" />
        <text x="0" y="5" font-size="14" font-weight="bold" fill="#ca8a04">Hi! Friend❤</text>
      </g>
      <!-- Floating heart bubbles -->
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
    <!-- Open Book scene with star sparkles flying out -->
    <path d="M120,180 Q200,165 200,120 Q200,165 280,180" fill="none" stroke="#22d3ee" stroke-width="5" stroke-linecap="round"/>
    <text x="200" y="110" font-size="76" text-anchor="middle" filter="url(#softShadow)">📖⭐✨</text>
    <text x="200" y="180" font-size="18" font-weight="black" fill="#1e1b4b" text-anchor="middle">Word Adventure Realm</text>
    <text x="200" y="210" font-size="11" font-weight="bold" fill="#6366f1" text-anchor="middle">Step by Step Phonics Castle</text>
  `, 'cozy');
}
