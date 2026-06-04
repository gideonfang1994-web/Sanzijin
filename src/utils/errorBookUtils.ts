import { WordItem } from '../types';

export interface IncorrectVocabularyItem {
  text: string;
  translation: string;
  imageUrl: string;
  syllables?: string[];
  errorCount: number;
  lastErrorAt: number;
  sources: ('ADVENTURE' | 'ARCADE')[];
}

export interface PurifiedSpiritItem {
  text: string;
  translation: string;
  imageUrl: string;
  syllables?: string[];
  stage: number; // 1 to 5 (Mastery level)
  nextReviewAt: number; // timestamp for next scheduled card review
  lastReviewedAt: number; // timestamp of last correct review
  lapsesCount: number; // number of times forgotten of this spirit
}

const STORAGE_KEY = 'wordland_saved_vocab_incorrect_items';
const SPIRITS_STORAGE_KEY = 'wordland_saved_vocab_purified_spirits';

// Dynamic helper to calculate standard interval offset based on Stage (Ebbinghaus review schedules)
export const getStageIntervalMs = (stage: number): number => {
  switch (stage) {
    case 1: return 30 * 1000; // 30 seconds for immediate mini-loop testing
    case 2: return 12 * 60 * 60 * 1000; // 12 hours
    case 3: return 24 * 60 * 60 * 1000; // 1 day
    case 4: return 3 * 24 * 60 * 60 * 1000; // 3 days
    case 5: return 7 * 24 * 60 * 60 * 1000; // 7 days (fully stabilized, but still can review)
    default: return 24 * 60 * 60 * 1000;
  }
};

/**
 * Retrieves all stored incorrect vocabulary words from local storage
 */
export const getVocabularyErrors = (): IncorrectVocabularyItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Failed to parse vocabulary errors:', e);
    return [];
  }
};

/**
 * Adds an incorrect vocabulary word representation to the pool
 */
export const addVocabularyError = (word: WordItem, source: 'ADVENTURE' | 'ARCADE'): IncorrectVocabularyItem[] => {
  if (!word || !word.text) return getVocabularyErrors();
  
  try {
    const list = getVocabularyErrors();
    const existingIdx = list.findIndex(item => item.text.toLowerCase() === word.text.toLowerCase());
    
    const now = Date.now();
    if (existingIdx > -1) {
      // Word already exists - increment error count and update time
      list[existingIdx].errorCount += 1;
      list[existingIdx].lastErrorAt = now;
      if (!list[existingIdx].sources.includes(source)) {
        list[existingIdx].sources.push(source);
      }
    } else {
      // New incorrect word
      list.push({
        text: word.text,
        translation: word.translation,
        imageUrl: word.imageUrl,
        syllables: word.syllables || [],
        errorCount: 1,
        lastErrorAt: now,
        sources: [source]
      });
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    return list;
  } catch (e) {
    console.error('Failed to add vocabulary error:', e);
    return getVocabularyErrors();
  }
};

/**
 * Removes a word from the incorrect vocabulary database index (e.g. once mastered/purified)
 */
export const removeVocabularyError = (wordText: string): IncorrectVocabularyItem[] => {
  try {
    const list = getVocabularyErrors();
    const filtered = list.filter(item => item.text.toLowerCase() !== wordText.toLowerCase());
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return filtered;
  } catch (e) {
    console.error('Failed to remove vocabulary error:', e);
    return getVocabularyErrors();
  }
};

/**
 * Retrieves stored purified vocabulary spirits undergoing Spaced Repetition (以往遗忘曲线)
 */
export const getPurifiedSpirits = (): PurifiedSpiritItem[] => {
  try {
    const raw = localStorage.getItem(SPIRITS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Failed to parse purified spirits:', e);
    return [];
  }
};

/**
 * Moves an incorrect word to the Purified Spirits queue to trigger Spaced Repetition life cycle
 */
export const promoteToSpirit = (word: { text: string; translation: string; imageUrl?: string; syllables?: string[] }): PurifiedSpiritItem[] => {
  const spirits = getPurifiedSpirits();
  const existingIdx = spirits.findIndex(item => item.text.toLowerCase() === word.text.toLowerCase());
  const now = Date.now();

  if (existingIdx > -1) {
    // Already is a spirit - renew it at stage 1
    spirits[existingIdx].stage = 1;
    spirits[existingIdx].nextReviewAt = now + getStageIntervalMs(1);
    spirits[existingIdx].lastReviewedAt = now;
  } else {
    // Spawn brand new spirit representing this purified entity
    spirits.push({
      text: word.text,
      translation: word.translation,
      imageUrl: word.imageUrl || '',
      syllables: word.syllables || [],
      stage: 1,
      nextReviewAt: now + getStageIntervalMs(1),
      lastReviewedAt: now,
      lapsesCount: 0
    });
  }

  localStorage.setItem(SPIRITS_STORAGE_KEY, JSON.stringify(spirits));
  // Remove this from incorrect list if it exists there
  removeVocabularyError(word.text);
  return spirits;
};

/**
 * Updates a spirit's memory state on review completion
 */
export const reviewPurifiedSpirit = (wordText: string, isCorrect: boolean): PurifiedSpiritItem[] => {
  const spirits = getPurifiedSpirits();
  const idx = spirits.findIndex(item => item.text.toLowerCase() === wordText.toLowerCase());
  if (idx === -1) return spirits;

  const now = Date.now();
  if (isCorrect) {
    // Level up the spirit stage up to Stage 5 max
    const newStage = Math.min(5, spirits[idx].stage + 1);
    spirits[idx].stage = newStage;
    spirits[idx].lastReviewedAt = now;
    spirits[idx].nextReviewAt = now + getStageIntervalMs(newStage);
  } else {
    // Relapse to Stage 1 to study again
    spirits[idx].stage = 1;
    spirits[idx].lapsesCount += 1;
    spirits[idx].lastReviewedAt = now;
    spirits[idx].nextReviewAt = now + getStageIntervalMs(1);
  }

  localStorage.setItem(SPIRITS_STORAGE_KEY, JSON.stringify(spirits));
  return spirits;
};

/**
 * Fully removes a spirit from recollection lists
 */
export const removePurifiedSpirit = (wordText: string): PurifiedSpiritItem[] => {
  const spirits = getPurifiedSpirits();
  const filtered = spirits.filter(item => item.text.toLowerCase() !== wordText.toLowerCase());
  localStorage.setItem(SPIRITS_STORAGE_KEY, JSON.stringify(filtered));
  return filtered;
};

// Calculates dynamic Ebbinghaus retention percentage purely in real-time
export const calculateRetention = (spirit: PurifiedSpiritItem): number => {
  const timePassed = Date.now() - spirit.lastReviewedAt;
  const interval = getStageIntervalMs(spirit.stage);
  
  // Halflife metric: standard decay function to model Ebbinghaus forgetting rate
  // R = 100 * (0.5 ^ (timePassed / halfLife))
  const halfLife = interval * 0.5;
  if (halfLife <= 0) return 100;
  
  const retention = Math.round(100 * Math.pow(0.5, timePassed / halfLife));
  return Math.min(100, Math.max(5, retention));
};

/**
 * Fully cleanses the error database
 */
export const clearAllVocabularyErrors = (): void => {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(SPIRITS_STORAGE_KEY);
};
