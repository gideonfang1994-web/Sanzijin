
export interface WordItem {
  text: string;
  translation: string;
  imageUrl: string;
}

export interface Word {
  id: string;
  term: string;
  translation: string;
  example: string;
  imageUrl: string;
  learned: boolean;
  xpValue: number;
}

export interface WordGroup {
  id: string;
  title: string;
  suffix: string;
  words: WordItem[];
  rhyme: string;
  learned: boolean;
  srsLevel: number; 
  nextReview: number; 
  lastIncorrect?: boolean; 
}

export interface DailyQuest {
  id: string;
  label: string;
  target: number;
  current: number;
  completed: boolean;
  rewardXp: number;
  rewardCoins: number;
  targetView: ViewState;
  isReviewType?: boolean;
}

export interface UserStats {
  xp: number;
  level: number;
  streak: number;
  starCoins: number;
  totalWordsLearned: number;
  bestChallengeScore: number;
  rank: number;
  hearts: number;
  maxCombo: number;
  quests: DailyQuest[];
}

export interface VideoLesson {
  id: string;
  title: string;
  url: string;
  thumbnail: string;
}

export interface WordCard {
  id: string;
  suffix: string;
  levelName?: string;
  words: WordItem[];
  rhyme: string;
  learned: boolean;
}

export interface AdventureDay {
  id: string;
  title: string;
  cards: WordCard[];
}

export type AdventureMode = 'RELAXED' | 'SPEED';

export interface AdventureForestProps {
  onClose: () => void;
  onCompleteLevel?: (words: WordItem[]) => void;
}

export type ViewState = 'HOME' | 'CARDS' | 'VIDEOS' | 'CHALLENGE' | 'SCRAMBLE' | 'MEMORY' | 'BALLOON' | 'WHACK' | 'RANKING' | 'UPLOAD' | 'ARCADE' | 'SHEEP' | 'COLLECTION' | 'ADVENTURE' | 'DUBBING';
