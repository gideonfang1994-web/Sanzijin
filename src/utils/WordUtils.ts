
/**
 * Improved utility to split words into syllables or phonics sounds.
 * For longer words it uses syllable rules.
 * For shorter words (phonics focus) it splits into major sounds.
 */
export const splitWord = (word: string): string[] => {
  const w = word.toLowerCase().trim();
  if (!w) return [];

  // Special cases for common phonics words
  const phonicsMap: Record<string, string[]> = {
    'sheep': ['sh', 'ee', 'p'],
    'green': ['gr', 'ee', 'n'],
    'train': ['tr', 'ai', 'n'],
    'bread': ['br', 'ea', 'd'],
    'brush': ['br', 'u', 'sh'],
    'clock': ['cl', 'o', 'ck'],
    'duck': ['d', 'u', 'ck'],
    'frog': ['fr', 'o', 'g'],
    'grape': ['gr', 'a', 'pe'],
    'plane': ['pl', 'a', 'ne'],
    'snake': ['sn', 'a', 'ke'],
    'spoor': ['sp', 'oo', 'r'],
    'spoon': ['sp', 'oo', 'n'],
    'star': ['st', 'ar'],
    'sweet': ['sw', 'ee', 't'],
    'swing': ['sw', 'i', 'ng'],
    'whale': ['wh', 'a', 'le'],
    'chair': ['ch', 'air'],
    'small': ['sm', 'all'],
    'dress': ['dr', 'e', 'ss'],
    'glass': ['gl', 'a', 'ss'],
    'truck': ['tr', 'u', 'ck'],
    'stick': ['st', 'i', 'ck'],
    'black': ['bl', 'a', 'ck'],
    'flower': ['flow', 'er'],
    'tiger': ['ti', 'ger'],
    'rabbit': ['rab', 'bit'],
    'apple': ['ap', 'ple'],
    'candy': ['can', 'dy'],
    'balloon': ['bal', 'loon'],
    'bad': ['b', 'a', 'd'],
    'dad': ['d', 'a', 'd'],
    'sad': ['s', 'a', 'd'],
    'mad': ['m', 'a', 'd'],
    'cat': ['c', 'a', 't'],
    'hat': ['h', 'a', 't'],
    'fat': ['f', 'a', 't'],
    'sat': ['s', 'a', 't'],
    'bat': ['b', 'a', 't'],
    'bag': ['b', 'a', 'g'],
    'tag': ['t', 'a', 'g'],
    'wag': ['w', 'a', 'g'],
    'fan': ['f', 'a', 'n'],
    'tan': ['t', 'a', 'n'],
    'man': ['m', 'a', 'n'],
    'can': ['c', 'a', 'n'],
    'pan': ['p', 'a', 'n'],
    'bed': ['b', 'e', 'd'],
    'red': ['r', 'e', 'd'],
    'pen': ['p', 'e', 'n'],
    'ten': ['t', 'e', 'n'],
    'pig': ['p', 'i', 'g'],
    'big': ['b', 'i', 'g'],
    'dog': ['d', 'o', 'g'],
    'log': ['l', 'o', 'g'],
    'sun': ['s', 'u', 'n'],
    'run': ['r', 'u', 'n'],
    'cup': ['c', 'u', 'p'],
    'map': ['m', 'a', 'p'],
    'tap': ['t', 'a', 'p'],
    'ship': ['sh', 'i', 'p'],
    'fish': ['f', 'i', 'sh'],
    'this': ['th', 'i', 's'],
    'that': ['th', 'a', 't'],
    'with': ['w', 'i', 'th'],
    'back': ['b', 'a', 'ck'],
    'rock': ['r', 'o', 'ck'],
    'book': ['b', 'oo', 'k'],
    'look': ['l', 'oo', 'k'],
    'cook': ['c', 'oo', 'k'],
    'food': ['f', 'oo', 'd'],
    'moon': ['m', 'oo', 'n'],
    'play': ['pl', 'ay'],
    'stay': ['st', 'ay'],
    'day': ['d', 'ay'],
    'rain': ['r', 'ai', 'n'],
    'mail': ['m', 'ai', 'l'],
    'cake': ['c', 'a', 'ke'],
    'bike': ['b', 'i', 'ke'],
    'nose': ['n', 'o', 'se'],
    'game': ['g', 'a', 'me'],
    'late': ['l', 'a', 'te'],
  };

  if (phonicsMap[w]) return phonicsMap[w];

  // If very short, just split letters
  if (w.length <= 3) return w.split('');

  // Count vowels (heuristic for syllables)
  const vowelCount = (w.match(/[aeiouy]/g) || []).length;
  
  // If likely single syllable but not in map, split phonetically
  if (vowelCount <= 1 || (vowelCount === 2 && w.endsWith('e') && !w.endsWith('le'))) {
     // Basic phonics clusters
     const clusters = /(sh|ch|th|wh|ph|ck|ng|ee|ea|oo|ai|ay|ou|ow|oi|oy|ar|er|ir|or|ur|qu|[bcdfghjklmnpqrstvwxyz])/g;
     const parts = w.match(clusters);
     if (parts) return parts;
     return w.split('');
  }

  // Multi-syllable logic (simple VCV/VCCV heuristic)
  // This is a naive implementation but better than before
  const syllables: string[] = [];
  let current = '';
  const isVowel = (c: string) => /[aeiouy]/.test(c);

  for (let i = 0; i < w.length; i++) {
    current += w[i];
    
    // Check for split points
    if (i < w.length - 1) {
      const char = w[i];
      const next = w[i + 1];
      const nextNext = w[i + 2];

      // VCCV Rule: rab-bit
      if (isVowel(char) && !isVowel(next) && !isVowel(nextNext) && isVowel(w[i + 3] || '')) {
        // Simple heuristic: split between consonants
        syllables.push(current);
        current = '';
      }
      // VCV Rule: ba-ker
      else if (isVowel(char) && !isVowel(next) && isVowel(nextNext)) {
        syllables.push(current);
        current = '';
      }
    }
  }
  
  if (current) syllables.push(current);
  
  // Post-process to ensure we don't have too many small dangling parts
  if (syllables.length > 1) {
    const last = syllables[syllables.length - 1];
    if (last.length === 1 && !isVowel(last)) {
      syllables[syllables.length - 2] += syllables.pop();
    }
  }

  return syllables.length > 0 ? syllables : [w];
};

export interface PhonicsSegment {
  letter: string;   // The grapheme (e.g., 'cr', 'sh', 'a')
  ipa: string;      // The IPA phonetic sound of this grapheme in the word
  sound: string;    // Highly optimized audio text for SpeechSynthesis Utterance
}

const MANUAL_PHONICS: Record<string, PhonicsSegment[]> = {
  // CVC - ad
  'bad': [
    { letter: 'b', ipa: '[b]', sound: 'buh' },
    { letter: 'a', ipa: '[æ]', sound: 'aah' },
    { letter: 'd', ipa: '[d]', sound: 'duh' }
  ],
  'dad': [
    { letter: 'd', ipa: '[d]', sound: 'duh' },
    { letter: 'a', ipa: '[æ]', sound: 'aah' },
    { letter: 'd', ipa: '[d]', sound: 'duh' }
  ],
  'sad': [
    { letter: 's', ipa: '[s]', sound: 'sss' },
    { letter: 'a', ipa: '[æ]', sound: 'aah' },
    { letter: 'd', ipa: '[d]', sound: 'duh' }
  ],
  'mad': [
    { letter: 'm', ipa: '[m]', sound: 'mmm' },
    { letter: 'a', ipa: '[æ]', sound: 'aah' },
    { letter: 'd', ipa: '[d]', sound: 'duh' }
  ],
  // CVC - ab
  'cab': [
    { letter: 'c', ipa: '[k]', sound: 'kuh' },
    { letter: 'a', ipa: '[æ]', sound: 'aah' },
    { letter: 'b', ipa: '[b]', sound: 'buh' }
  ],
  'lab': [
    { letter: 'l', ipa: '[l]', sound: 'lll' },
    { letter: 'a', ipa: '[æ]', sound: 'aah' },
    { letter: 'b', ipa: '[b]', sound: 'buh' }
  ],
  // CVC - at
  'cat': [
    { letter: 'c', ipa: '[k]', sound: 'kuh' },
    { letter: 'a', ipa: '[æ]', sound: 'aah' },
    { letter: 't', ipa: '[t]', sound: 'tuh' }
  ],
  'rat': [
    { letter: 'r', ipa: '[r]', sound: 'rrr' },
    { letter: 'a', ipa: '[æ]', sound: 'aah' },
    { letter: 't', ipa: '[t]', sound: 'tuh' }
  ],
  'fat': [
    { letter: 'f', ipa: '[f]', sound: 'fff' },
    { letter: 'a', ipa: '[æ]', sound: 'aah' },
    { letter: 't', ipa: '[t]', sound: 'tuh' }
  ],
  'sat': [
    { letter: 's', ipa: '[s]', sound: 'sss' },
    { letter: 'a', ipa: '[æ]', sound: 'aah' },
    { letter: 't', ipa: '[t]', sound: 'tuh' }
  ],
  'bat': [
    { letter: 'b', ipa: '[b]', sound: 'buh' },
    { letter: 'a', ipa: '[æ]', sound: 'aah' },
    { letter: 't', ipa: '[t]', sound: 'tuh' }
  ],
  // CVC - ag
  'bag': [
    { letter: 'b', ipa: '[b]', sound: 'buh' },
    { letter: 'a', ipa: '[æ]', sound: 'aah' },
    { letter: 'g', ipa: '[g]', sound: 'guh' }
  ],
  'tag': [
    { letter: 't', ipa: '[t]', sound: 'tuh' },
    { letter: 'a', ipa: '[æ]', sound: 'aah' },
    { letter: 'g', ipa: '[g]', sound: 'guh' }
  ],
  'wag': [
    { letter: 'w', ipa: '[w]', sound: 'wuh' },
    { letter: 'a', ipa: '[æ]', sound: 'aah' },
    { letter: 'g', ipa: '[g]', sound: 'guh' }
  ],
  // CVC - an
  'man': [
    { letter: 'm', ipa: '[m]', sound: 'mmm' },
    { letter: 'a', ipa: '[æ]', sound: 'aah' },
    { letter: 'n', ipa: '[n]', sound: 'nnn' }
  ],
  'pan': [
    { letter: 'p', ipa: '[p]', sound: 'puh' },
    { letter: 'a', ipa: '[æ]', sound: 'aah' },
    { letter: 'n', ipa: '[n]', sound: 'nnn' }
  ],
  'tan': [
    { letter: 't', ipa: '[t]', sound: 'tuh' },
    { letter: 'a', ipa: '[æ]', sound: 'aah' },
    { letter: 'n', ipa: '[n]', sound: 'nnn' }
  ],
  'fan': [
    { letter: 'f', ipa: '[f]', sound: 'fff' },
    { letter: 'a', ipa: '[æ]', sound: 'aah' },
    { letter: 'n', ipa: '[n]', sound: 'nnn' }
  ],
  'can': [
    { letter: 'c', ipa: '[k]', sound: 'kuh' },
    { letter: 'a', ipa: '[æ]', sound: 'aah' },
    { letter: 'n', ipa: '[n]', sound: 'nnn' }
  ],
  // CVC - ed
  'bed': [
    { letter: 'b', ipa: '[b]', sound: 'buh' },
    { letter: 'e', ipa: '[e]', sound: 'ehh' },
    { letter: 'd', ipa: '[d]', sound: 'duh' }
  ],
  'red': [
    { letter: 'r', ipa: '[r]', sound: 'rrr' },
    { letter: 'e', ipa: '[e]', sound: 'ehh' },
    { letter: 'd', ipa: '[d]', sound: 'duh' }
  ],
  // CVC - en
  'pen': [
    { letter: 'p', ipa: '[p]', sound: 'puh' },
    { letter: 'e', ipa: '[e]', sound: 'ehh' },
    { letter: 'n', ipa: '[n]', sound: 'nnn' }
  ],
  'ten': [
    { letter: 't', ipa: '[t]', sound: 'tuh' },
    { letter: 'e', ipa: '[e]', sound: 'ehh' },
    { letter: 'n', ipa: '[n]', sound: 'nnn' }
  ],
  // CVC - ig
  'pig': [
    { letter: 'p', ipa: '[p]', sound: 'puh' },
    { letter: 'i', ipa: '[ɪ]', sound: 'ihh' },
    { letter: 'g', ipa: '[g]', sound: 'guh' }
  ],
  'big': [
    { letter: 'b', ipa: '[b]', sound: 'buh' },
    { letter: 'i', ipa: '[ɪ]', sound: 'ihh' },
    { letter: 'g', ipa: '[g]', sound: 'guh' }
  ],
  // CVC - og
  'dog': [
    { letter: 'd', ipa: '[d]', sound: 'duh' },
    { letter: 'o', ipa: '[ɒ]', sound: 'ah' },
    { letter: 'g', ipa: '[g]', sound: 'guh' }
  ],
  'log': [
    { letter: 'l', ipa: '[l]', sound: 'lll' },
    { letter: 'o', ipa: '[ɒ]', sound: 'ah' },
    { letter: 'g', ipa: '[g]', sound: 'guh' }
  ],
  // CVC - un / up / ug
  'sun': [
    { letter: 's', ipa: '[s]', sound: 'sss' },
    { letter: 'u', ipa: '[ʌ]', sound: 'uhh' },
    { letter: 'n', ipa: '[n]', sound: 'nnn' }
  ],
  'run': [
    { letter: 'r', ipa: '[r]', sound: 'rrr' },
    { letter: 'u', ipa: '[ʌ]', sound: 'uhh' },
    { letter: 'n', ipa: '[n]', sound: 'nnn' }
  ],
  'cup': [
    { letter: 'c', ipa: '[k]', sound: 'kuh' },
    { letter: 'u', ipa: '[ʌ]', sound: 'uhh' },
    { letter: 'p', ipa: '[p]', sound: 'puh' }
  ],
  'map': [
    { letter: 'm', ipa: '[m]', sound: 'mmm' },
    { letter: 'a', ipa: '[æ]', sound: 'aah' },
    { letter: 'p', ipa: '[p]', sound: 'puh' }
  ],
  'tap': [
    { letter: 't', ipa: '[t]', sound: 'tuh' },
    { letter: 'a', ipa: '[æ]', sound: 'aah' },
    { letter: 'p', ipa: '[p]', sound: 'puh' }
  ]
};

const splitGraphemes = (text: string): string[] => {
  if (!text) return [];
  const patterns = [
    // 4 letters
    'eigh', 'tion', 'sion', 
    // 3 letters
    'all', 'alk', 'ark', 'arn', 'arp', 'art', 'ord', 'ork', 'orm', 'orn', 'ort', 'erb', 'erd', 'erm', 'ern', 'ird', 'irk', 'irl', 'irt', 'urn', 'urp', 'urt', 'ash', 'ell', 'ick', 'est', 'ard', 'ish', 'ame', 'ake', 'tch', 'igh', 'ohr', 'air', 'are', 'ear', 'oor', 'our', 'uhr', 'ing', 'ang', 'ong', 'ung', 'ink', 'ank', 'onk', 'unk',
    // 2 letters
    'sh', 'ch', 'th', 'wh', 'ph', 'ck', 'ng', 'nk', 'nd', 'nt', 'mp', 'ft', 'st', 'pl', 'cl', 'bl', 'fl', 'gl', 'sl', 'br', 'cr', 'dr', 'fr', 'gr', 'pr', 'tr', 'tw', 'sc', 'sk', 'sm', 'sn', 'sp', 'sw', 'ee', 'ea', 'oo', 'ai', 'ay', 'ou', 'ow', 'oi', 'oy', 'ar', 'er', 'ir', 'or', 'ur', 'le', 'se', 'll', 'ss', 'ff', 'zz', 'qu'
  ];

  let remaining = text;
  const result: string[] = [];

  while (remaining.length > 0) {
    let matched = false;
    for (const pattern of patterns) {
      if (remaining.startsWith(pattern)) {
        result.push(pattern);
        remaining = remaining.slice(pattern.length);
        matched = true;
        break;
      }
    }
    if (!matched) {
      result.push(remaining[0]);
      remaining = remaining.slice(1);
    }
  }

  return result;
};

const getSingleGraphemeSegment = (g: string, fullWord?: string): PhonicsSegment => {
  const graphemeMap: Record<string, { ipa: string; sound: string }> = {
    // Basic Consonants
    'b': { ipa: '[b]', sound: 'buh' },
    'c': { ipa: '[k]', sound: 'kuh' },
    'd': { ipa: '[d]', sound: 'duh' },
    'f': { ipa: '[f]', sound: 'fff' },
    'g': { ipa: '[g]', sound: 'guh' },
    'h': { ipa: '[h]', sound: 'hhh' },
    'j': { ipa: '[dʒ]', sound: 'juh' },
    'k': { ipa: '[k]', sound: 'kuh' },
    'l': { ipa: '[l]', sound: 'lll' },
    'm': { ipa: '[m]', sound: 'mmm' },
    'n': { ipa: '[n]', sound: 'nnn' },
    'p': { ipa: '[p]', sound: 'puh' },
    'q': { ipa: '[kw]', sound: 'kwuh' },
    'r': { ipa: '[r]', sound: 'rrr' },
    's': { ipa: '[s]', sound: 'sss' },
    't': { ipa: '[t]', sound: 'tuh' },
    'v': { ipa: '[v]', sound: 'vvv' },
    'w': { ipa: '[w]', sound: 'wuh' },
    'x': { ipa: '[ks]', sound: 'ks' },
    'y': { ipa: '[j]', sound: 'yuh' }, 
    'z': { ipa: '[z]', sound: 'zzz' },

    // Digraphs & Blends
    'sh': { ipa: '[ʃ]', sound: 'shhh' },
    'ch': { ipa: '[tʃ]', sound: 'tch' },
    'th': { ipa: '[ð]', sound: 'thhh' },
    'wh': { ipa: '[w]', sound: 'wuh' },
    'ph': { ipa: '[f]', sound: 'fff' },
    'ck': { ipa: '[k]', sound: 'kuh' },
    'ng': { ipa: '[ŋ]', sound: 'ng' },
    'nk': { ipa: '[ŋk]', sound: 'nk' },
    'nd': { ipa: '[nd]', sound: 'nd' },
    'nt': { ipa: '[nt]', sound: 'nt' },
    'mp': { ipa: '[mp]', sound: 'mp' },
    'ft': { ipa: '[ft]', sound: 'ft' },
    'st': { ipa: '[st]', sound: 'st' },
    'pl': { ipa: '[pl]', sound: 'pl' },
    'cl': { ipa: '[cl]', sound: 'cl' },
    'bl': { ipa: '[bl]', sound: 'bl' },
    'fl': { ipa: '[fl]', sound: 'fl' },
    'gl': { ipa: '[gl]', sound: 'gl' },
    'sl': { ipa: '[sl]', sound: 'sl' },
    'br': { ipa: '[br]', sound: 'br' },
    'cr': { ipa: '[cr]', sound: 'cr' },
    'dr': { ipa: '[dr]', sound: 'dr' },
    'fr': { ipa: '[fr]', sound: 'fr' },
    'gr': { ipa: '[gr]', sound: 'gr' },
    'pr': { ipa: '[pr]', sound: 'pr' },
    'tr': { ipa: '[tr]', sound: 'tr' },
    'tw': { ipa: '[tw]', sound: 'tw' },
    'sc': { ipa: '[sk]', sound: 'sk' },
    'sk': { ipa: '[sk]', sound: 'sk' },
    'sm': { ipa: '[sm]', sound: 'sm' },
    'sn': { ipa: '[sn]', sound: 'sn' },
    'sp': { ipa: '[sp]', sound: 'sp' },
    'sw': { ipa: '[sw]', sound: 'sw' },

    // Double letters
    'll': { ipa: '[l]', sound: 'lll' },
    'ss': { ipa: '[s]', sound: 'sss' },
    'ff': { ipa: '[f]', sound: 'fff' },
    'zz': { ipa: '[z]', sound: 'zzz' },

    // Vowels
    'a': { ipa: '[æ]', sound: 'aah' },
    'e': { ipa: '[e]', sound: 'ehh' },
    'i': { ipa: '[ɪ]', sound: 'ihh' },
    'o': { ipa: '[ɒ]', sound: 'ah' },
    'u': { ipa: '[u]', sound: 'uhh' },

    // Vowel digraphs & R-controlled vowels
    'ee': { ipa: '[iː]', sound: 'eee' },
    'ea': { ipa: '[iː]', sound: 'eee' },
    'oo': { ipa: '[uː]', sound: 'ooo' },
    'ai': { ipa: '[eɪ]', sound: 'ay' },
    'ay': { ipa: '[eɪ]', sound: 'ay' },
    'ou': { ipa: '[aʊ]', sound: 'ow' },
    'ow': { ipa: '[oʊ]', sound: 'oh' },
    'oi': { ipa: '[ɔɪ]', sound: 'oy' },
    'oy': { ipa: '[ɔɪ]', sound: 'oy' },
    'ar': { ipa: '[ɑː]', sound: 'ar' },
    'er': { ipa: '[ɜː]', sound: 'er' },
    'ir': { ipa: '[ɜː]', sound: 'er' },
    'or': { ipa: '[ɔː]', sound: 'or' },
    'ur': { ipa: '[ɜː]', sound: 'er' },
    'qu': { ipa: '[kw]', sound: 'kwuh' },

    // Common trigraphs & ending clusters
    'all': { ipa: '[ɔːl]', sound: 'all' },
    'alk': { ipa: '[ɔːk]', sound: 'awk' },
    'ark': { ipa: '[ɑːk]', sound: 'ark' },
    'arn': { ipa: '[ɑːn]', sound: 'arn' },
    'arp': { ipa: '[ɑːp]', sound: 'arp' },
    'art': { ipa: '[ɑːt]', sound: 'art' },
    'ord': { ipa: '[ɔːd]', sound: 'ord' },
    'ork': { ipa: '[ɔːk]', sound: 'ork' },
    'orm': { ipa: '[ɔːm]', sound: 'orm' },
    'orn': { ipa: '[ɔːn]', sound: 'orn' },
    'ort': { ipa: '[ɔːt]', sound: 'ort' },
    'erb': { ipa: '[ɜːb]', sound: 'erb' },
    'erd': { ipa: '[ɜːd]', sound: 'erd' },
    'erm': { ipa: '[ɜːm]', sound: 'erm' },
    'ern': { ipa: '[ɜːn]', sound: 'ern' },
    'ird': { ipa: '[ɜːd]', sound: 'ird' },
    'irk': { ipa: '[ɜːk]', sound: 'irk' },
    'irl': { ipa: '[ɜːl]', sound: 'irl' },
    'irt': { ipa: '[ɜːt]', sound: 'irt' },
    'urn': { ipa: '[ɜːn]', sound: 'urn' },
    'urp': { ipa: '[ɜːp]', sound: 'urp' },
    'urt': { ipa: '[ɜːt]', sound: 'urt' },
    'ash': { ipa: '[æʃ]', sound: 'ash' },
    'ell': { ipa: '[el]', sound: 'ell' },
    'ick': { ipa: '[ɪk]', sound: 'ick' },
    'est': { ipa: '[est]', sound: 'est' },
    'ard': { ipa: '[ɑːd]', sound: 'ard' },
    'ish': { ipa: '[ɪʃ]', sound: 'ish' },
    'ame': { ipa: '[eɪm]', sound: 'ame' },
    'ake': { ipa: '[eɪk]', sound: 'ake' },
    'tch': { ipa: '[tʃ]', sound: 'tch' },
    'igh': { ipa: '[aɪ]', sound: 'eye' }
  };

  if (fullWord) {
    const wordLower = fullWord.toLowerCase();
    if (g === 'ea' && ['bread', 'head', 'deaf', 'pant'].includes(wordLower)) {
      return { letter: 'ea', ipa: '[e]', sound: 'ehh' };
    }
    if (g === 'oo' && ['book', 'look', 'cook'].includes(wordLower)) {
      return { letter: 'oo', ipa: '[ʊ]', sound: 'uh' };
    }
    if (g === 'ow' && ['cow', 'how', 'now', 'bow', 'row', 'flower', 'power', 'shower'].includes(wordLower)) {
      return { letter: 'ow', ipa: '[aʊ]', sound: 'ow' };
    }
    if (g === 'y') {
      if (wordLower.length <= 4) {
        return { letter: 'y', ipa: '[aɪ]', sound: 'eye' };
      } else {
        return { letter: 'y', ipa: '[iː]', sound: 'eee' };
      }
    }
  }

  const match = graphemeMap[g];
  if (match) {
    return { letter: g, ipa: match.ipa, sound: match.sound };
  }

  return { letter: g, ipa: `[${g}]`, sound: g };
};

export const getPhonicsBreakdown = (word: string): PhonicsSegment[] => {
  const w = word.toLowerCase().trim();
  if (!w) return [];

  if (MANUAL_PHONICS[w]) {
    return MANUAL_PHONICS[w];
  }

  const silentERegex = /^([a-z]*)([aeiou])([^aeiou]{1,2})e$/;
  if (silentERegex.test(w)) {
    const match = w.match(silentERegex);
    if (match) {
      const prefix = match[1];
      const vowel = match[2];
      const cons = match[3];

      const segments: PhonicsSegment[] = [];

      const prefixGraphemes = splitGraphemes(prefix);
      for (const g of prefixGraphemes) {
        segments.push(getSingleGraphemeSegment(g));
      }

      if (vowel === 'a') {
        segments.push({ letter: 'a', ipa: '[eɪ]', sound: 'ay' });
      } else if (vowel === 'i') {
        segments.push({ letter: 'i', ipa: '[aɪ]', sound: 'eye' });
      } else if (vowel === 'o') {
        segments.push({ letter: 'o', ipa: '[oʊ]', sound: 'oh' });
      } else if (vowel === 'u') {
        segments.push({ letter: 'u', ipa: '[juː]', sound: 'you' });
      } else if (vowel === 'e') {
        segments.push({ letter: 'e', ipa: '[iː]', sound: 'eee' });
      }

      const consGraphemes = splitGraphemes(cons);
      for (const g of consGraphemes) {
        segments.push(getSingleGraphemeSegment(g));
      }

      segments.push({ letter: 'e', ipa: '[silent]', sound: '' });

      return segments;
    }
  }

  const graphemes = splitGraphemes(w);
  return graphemes.map(g => getSingleGraphemeSegment(g, w));
};

export const EMOJI_MAP: Record<string, string> = {
  // CVC / Short vowels & Phonics Arena handout words
  'apple': '🍎', 'ant': '🐜', 'cat': '🐱', 'bag': '🎒',
  'elephant': '🐘', 'egg': '🥚', 'elf': '🧚', 'bed': '🛏️',
  'in': '📥', 'itchy': '🦗', 'pig': '🐷', 'big': '🐘',
  'on': '🔛', 'octopus': '🐙', 'sock': '🧦', 'hot': '🥵',
  'up': '⬆️', 'under': '👇', 'jump': '🦘', 'cup': '🥛',
  'boy': '👦', 'black': '⬛', 'crab': '🦀', 'car': '🚗',
  'down': '⬇️', 'dog': '🐶', 'duck': '🦆',
  'five': '5️⃣', 'fast': '⚡', 'fox': '🦊',
  'girl': '👧', 'glass': '🥛', 'leg': '🦵',
  'hug': '🤗', 'hit': '🎯', 'house': '🏠',
  'jacket': '🧥', 'jet': '✈️', 'jam': '🍓',
  'kiss': '💋', 'kick': '⚽', 'stinky': '🦨',
  'loud': '📢', 'smell': '👃',
  'moon': '🌙', 'man': '🧔',
  'no': '❌', 'neck': '🧣', 'men': '👥', 'sun': '☀️',
  'panda': '🐼', 'quiet': '🤫', 'quilt': '🛌', 'quack': '🦆', 'squid': '🦑',
  'run': '🏃', 'red': '🔴', 'truck': '🚚', 'slow': '🐌',
  'ten': '🔟', 'van': '🚐', 'vet': '🥼', 'vest': '🎽',
  'watermelon': '🍉', 'wind': '💨', 'web': '🕸', 'swim': '🏊',
  'six': '6️⃣', 'exit': '🚪', 't-rex': '🦖',
  'yes': '👍', 'yogurt': '🥛', 'yell': '🗣️', 'yen': '💴',
  'zero': '0️⃣', 'zip': '🤐', 'zigzag': '〰️', 'buzz': '🐝',

  // Long vowels / other words
  'sheep': '🐑', 'green': '🟢', 'train': '🚄', 'bread': '🍞', 'brush': '🖌️',
  'clock': '⏰', 'frog': '🐸', 'grape': '🍇', 'plane': '✈️', 'snake': '🐍',
  'spoon': '🥄', 'star': '⭐', 'sweet': '🍬', 'swing': '🎡', 'whale': '🐋',
  'chair': '🪑', 'small': '🔎', 'dress': '👗', 'flower': '🌸', 'tiger': '🐯',
  'rabbit': '🐰', 'candy': '🍬', 'balloon': '🎈', 'bad': '👎', 'dad': '🧔',
  'sad': '😢', 'mad': '😠', 'rat': '🐀', 'fat': '🍔', 'sat': '🪑', 'bat': '🦇',
  'tag': '🏷️', 'wag': '🐶', 'fan': '🪭', 'tan': '🔄', 'pan': '🍳',
  'log': '🪵', 'map': '🗺️', 'tap': '🚰', 'ship': '🚢', 'fish': '🐟', 'this': '👉',
  'that': '👈', 'with': '👥', 'back': '🔙', 'rock': '🪨', 'book': '📖', 'look': '👀',
  'cook': '🧑‍🍳', 'food': '🍔', 'play': '🎮', 'stay': '🏠', 'day': '☀️', 'rain': '🌧️',
  'mail': '✉️', 'cake': '🍰', 'bike': '🚲', 'nose': '👃', 'game': '🎮', 'late': '⏰',
};

export const getWordEmoji = (word: string): string | undefined => {
  const w = word.toLowerCase().trim();
  return EMOJI_MAP[w];
};


