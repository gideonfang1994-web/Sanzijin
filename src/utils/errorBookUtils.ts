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

const STORAGE_KEY = 'wordland_saved_vocab_incorrect_items';

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
 * Fully cleanses the error database
 */
export const clearAllVocabularyErrors = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};
