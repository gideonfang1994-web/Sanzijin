
export interface WordItem {
  text: string;
  translation: string;
  imageUrl: string;
  syllables?: string[];
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

export type DifficultyLevel = 'PRIMARY' | 'INTERMEDIATE' | 'ADVANCED';

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
  difficulty?: DifficultyLevel;
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
  levelId?: number;
}

export interface Pet {
  id: string;
  name: string;
  type: 'DRAGON' | 'CAT' | 'OWL' | 'SLIME';
  health: number;
  maxHealth: number;
  happiness: number;
  level: number;
  lastFed: number; // timestamp
  isDead: boolean;
  birthDate: number;
}

export interface UserStats {
  xp: number;
  level: number;
  streak: number;
  starCoins: number;
  magicCoins: number;
  totalWordsLearned: number;
  masteredWords: string[]; 
  wordMastery: Record<string, number>; // word text -> count of correct answers
  bestChallengeScore: number;
  rank: number;
  hearts: number;
  maxCombo: number;
  quests: DailyQuest[];
  selectedCharacterId: string;
  equippedItems: Record<string, string[]>; // characterId -> itemIds
  unlockedItems: string[];
  completedLevelsCount: number;
  completedLevelIds: number[];
  masteredLevelIds: number[];
  claimedMilestones?: number[];
  reviewSchedules?: Record<string, { nextReviewAt: number, intervalDays: number, levelId: number }>;
  cardsPerDay?: number;
  characterStats: Record<string, {
    level: number;
    strength: number;
    magic: number;
    defense: number;
    agility: number;
  }>;
  pets: Pet[];
}

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  price: number;
  type: 'WEAPON' | 'ARMOR' | 'OUTFIT' | 'OFFHAND' | 'CONSUMABLE' | 'PET' | 'FOOD';
  characterId: string;
  slot: 'RIGHT_HAND' | 'LEFT_HAND' | 'BODY' | 'BACK' | 'HEAD' | 'NONE';
  imageUrl?: string;
  requiredLevel?: number;
  stats?: {
    strength?: number;
    magic?: number;
    defense?: number;
    agility?: number;
  };
  petType?: 'DRAGON' | 'CAT' | 'OWL' | 'SLIME';
  foodValue?: number;
}

export interface Character {
  id: string;
  name: string;
  title: string;
  description: string;
  avatar: string;
  color: string;
  portraitUrl: string;
  baseStats: {
    strength: number;
    magic: number;
    defense: number;
    agility: number;
  };
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
  difficulty?: DifficultyLevel;
}

export interface AdventureDay {
  id: string;
  title: string;
  cards: WordCard[];
}

export type AdventureMode = 'RELAXED' | 'SPEED';

export interface AdventureForestProps {
  onClose: () => void;
  onCompleteLevel?: (words: WordItem[], levelId: number) => void;
  onReward?: (xp: number, coins: number) => void;
  stats: UserStats;
  onUpdateStats: (stats: Partial<UserStats>) => void;
  initialLevelId?: number;
  initialCardId?: string;
}

export type ViewState = 'HOME' | 'CARDS' | 'VIDEOS' | 'CHALLENGE' | 'SCRAMBLE' | 'MEMORY' | 'BALLOON' | 'WHACK' | 'RANKING' | 'UPLOAD' | 'ARCADE' | 'SHEEP' | 'COLLECTION' | 'ADVENTURE' | 'DUBBING' | 'SHOP' | 'PETS' | 'SPELLING' | 'PLANTS' | 'RAIDEN' | 'FISHING' | 'ALCHEMIST' | 'MINER' | 'SLASHER' | 'SONAR' | 'COOKING' | 'FEEDING' | 'HAMSTER' | 'SHOOTER' | 'ICECREAM' | 'DINO' | 'DJ' | 'ROCKET' | 'POPIT' | 'POTION' | 'PARROT' | 'PHONICS' | 'TUTOR' | 'PICTURE_BOOK' | 'TEXTBOOK' | 'MARIO' | 'CLAW';
