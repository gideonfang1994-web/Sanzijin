
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import HomePage from './pages/HomePage';
import AdventurePage from './pages/AdventurePage';
import ArcadePage from './pages/ArcadePage';
import NavButton from './components/NavButton';
import WordLandCard from './components/WordLandCard';
import WordChallenge from './components/WordChallenge';
import LetterScramble from './components/LetterScramble';
import SheepMatch from './components/SheepMatch';
import FlyingDagger from './components/FlyingDagger';
import WhackAMole from './components/WhackAMole';
import VoiceDubbing from './components/VoiceDubbing';
import SpellingBee from './components/SpellingBee';
import PlantsVsMonsters from './components/PlantsVsMonsters';
import SpaceWordRaider from './components/SpaceWordRaider';
import PolarWordFishing from './components/PolarWordFishing';
import CauldronSorter from './components/CauldronSorter';
import WordGoldMiner from './components/WordGoldMiner';
import WordNinjaSlasher from './components/WordNinjaSlasher';
import DeepSeaSonar from './components/DeepSeaSonar';
import SizzlingWordKitchen from './components/SizzlingWordKitchen';
import WordMonsterFeeding from './components/WordMonsterFeeding';
import WordHamsterWhack from './components/WordHamsterWhack';
import WordBubbleShooter from './components/WordBubbleShooter';
import IceCreamSpelling from './components/IceCreamSpelling';
import DinoRockJumper from './components/DinoRockJumper';
import WordDJBeat from './components/WordDJBeat';
import WordMagnetRocket from './components/WordMagnetRocket';
import WordSpellingPopit from './components/WordSpellingPopit';
import WordPotionLab from './components/WordPotionLab';
import WordParrotDubbing from './components/WordParrotDubbing';
import Leaderboard from './components/Leaderboard';
import UploadContent from './components/UploadContent';
import MagicShop from './components/MagicShop';
import PetPage from './pages/PetPage';
import CollectionCenter from './components/CollectionCenter';
import constants, { ALL_CARDS } from './constants';
import { RepetitiveMagicStudyModal } from './components/RepetitiveMagicStudyModal';
import { WordGroup, UserStats, ViewState, DailyQuest, Word, WordItem, ShopItem, Pet } from './types';
import { Home, BookOpen, Gamepad2, BarChart3, Award, ShoppingBag, Heart, Compass, AlertCircle, X, ShieldAlert, Globe, Sparkles, ExternalLink } from 'lucide-react';
import audio from './utils/AudioUtils';
import confetti from 'canvas-confetti';
import { generateCharacterPortrait } from './services/portraitService';
import { motion, AnimatePresence } from 'framer-motion';
import { auth, db, doc, getDoc, setDoc, onAuthStateChanged, FirebaseUser, handleFirestoreError, OperationType, signInWithPopup, googleProvider, signOut, signInAnonymously } from './firebase';
import SafeImage from './components/SafeImage';

const App: React.FC = () => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<ViewState>('HOME');
  const [groups, setGroups] = useState<WordGroup[]>(constants.INITIAL_GROUPS);
  const [isReviewChallenge, setIsReviewChallenge] = useState(false);
  const [challengeGroupId, setChallengeGroupId] = useState<string | null>(null);
  const [selectedDayId, setSelectedDayId] = useState<string | null>(null);
  const [lastLearnedWords, setLastLearnedWords] = useState<WordItem[]>([]);
  const [lastLearnedLevelId, setLastLearnedLevelId] = useState<number | null>(null);
  const [pendingLevelId, setPendingLevelId] = useState<number | undefined>(undefined);
  
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [newLevel, setNewLevel] = useState(1);
  const navigateTimestamp = React.useRef<number>(0);
  
  const initialQuests: DailyQuest[] = [
    { id: 'q1', label: '解锁一个新魔法', target: 1, current: 0, completed: false, rewardXp: 100, rewardCoins: 10, targetView: 'ADVENTURE' },
    { id: 'q2', label: '游乐园大获全胜', target: 1, current: 0, completed: false, rewardXp: 200, rewardCoins: 25, targetView: 'ARCADE' },
    { id: 'q3', label: '反复研习魔法', target: 1, current: 0, completed: false, rewardXp: 300, rewardCoins: 50, targetView: 'HOME', isReviewType: true },
  ];

  const [showReviewModal, setShowReviewModal] = useState(false);

  const initialCharacterStats = useMemo(() => {
    const stats: Record<string, any> = {};
    constants.CHARACTERS.forEach(char => {
      stats[char.id] = {
        level: 1,
        strength: char.baseStats.strength,
        magic: char.baseStats.magic,
        defense: char.baseStats.defense,
        agility: char.baseStats.agility
      };
    });
    return stats;
  }, []);

  const [stats, setStats] = useState<UserStats>({
    xp: 0, level: 1, streak: 1, starCoins: 50, magicCoins: 500,
    totalWordsLearned: 0, masteredWords: [], wordMastery: {},
    bestChallengeScore: 0,
    rank: 12, hearts: 3, maxCombo: 0, quests: initialQuests,
    selectedCharacterId: 'c1',
    equippedItems: {},
    unlockedItems: [],
    completedLevelsCount: 0,
    completedLevelIds: [],
    masteredLevelIds: [],
    characterStats: initialCharacterStats,
    pets: []
  });

  const [showWelcome, setShowWelcome] = useState(true);

  // Auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    // Safety timeout: if auth takes more than 1.5 seconds, just show the app
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);

    return () => {
      unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  const [authError, setAuthError] = useState<{ code: string; message: string } | null>(null);

  const handleLogin = async () => {
    try {
      setAuthError(null);
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      console.error("Login failed:", error);
      const code = error?.code || "unknown_error";
      const message = error?.message || String(error);
      setAuthError({ code, message });
    }
  };

  const handleGuestLogin = async () => {
    try {
      setAuthError(null);
      await signInAnonymously(auth);
    } catch (error: any) {
      console.error("Guest login failed:", error);
      setAuthError({
        code: error?.code || "guest_failed",
        message: error?.message || "无法开启极速访客会话，请检查配额或网络链接。"
      });
    }
  };

  const handleLogout = async () => {
    try {
      setAuthError(null);
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Fetch/Sync user stats from Firestore
  useEffect(() => {
    if (!user) return;

    const fetchStats = async () => {
      try {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const data = userDoc.data() as UserStats;
          setStats(prev => ({
            ...prev,
            ...data,
            quests: data.quests || initialQuests,
            characterStats: data.characterStats || initialCharacterStats
          }));
        } else {
          // Create initial user doc
          const initialData = {
            ...stats,
            uid: user.uid,
            displayName: user.displayName || (user.isAnonymous ? '魔法访客' : '魔法学徒'),
            photoURL: user.photoURL || null,
            lastLogin: new Date().toISOString()
          };
          await setDoc(userDocRef, initialData);
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, `users/${user.uid}`);
      }
    };

    fetchStats();
  }, [user, initialQuests, initialCharacterStats]);

  // Sync stats to Firestore whenever they change
  useEffect(() => {
    // Also save to local storage for guest users or as backup
    localStorage.setItem('wordland_stats', JSON.stringify(stats));

    if (!user) return;
    
    const syncStats = async () => {
      try {
        const userDocRef = doc(db, 'users', user.uid);
        await setDoc(userDocRef, {
          ...stats,
          uid: user.uid,
          lastLogin: new Date().toISOString()
        }, { merge: true });
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}`);
      }
    };

    // Debounce sync to avoid too many writes
    const timeout = setTimeout(syncStats, 2000);
    return () => clearTimeout(timeout);
  }, [stats, user]);

  // Pet Health Decay Logic
  useEffect(() => {
    if (!stats.pets || stats.pets.length === 0) return;

    const now = Date.now();
    let updated = false;
    const updatedPets = stats.pets.map(pet => {
      if (pet.isDead) return pet;

      const hoursSinceFed = (now - pet.lastFed) / (1000 * 60 * 60);
      // Decay health: 2 points per hour if not fed
      if (hoursSinceFed > 12) {
        const decayAmount = Math.floor((hoursSinceFed - 12) * 2);
        if (decayAmount > 0) {
          const newHealth = Math.max(0, pet.health - decayAmount);
          const newHappiness = Math.max(0, pet.happiness - Math.floor(decayAmount / 2));
          
          if (newHealth !== pet.health || newHappiness !== pet.happiness) {
            updated = true;
            return {
              ...pet,
              health: newHealth,
              happiness: newHappiness,
              isDead: newHealth <= 0
            };
          }
        }
      }
      return pet;
    });

    if (updated) {
      setStats(prev => ({ ...prev, pets: updatedPets }));
    }
  }, [loading]); // Run once after loading is complete

  useEffect(() => {
    audio.init();
    
    const savedGroups = localStorage.getItem('wordland_groups');
    if (savedGroups) {
      try {
        setGroups(JSON.parse(savedGroups));
      } catch (e) {
        console.error("Failed to parse saved groups:", e);
        setGroups(constants.INITIAL_GROUPS);
      }
    } else {
      setGroups(constants.INITIAL_GROUPS);
    }
    
    const savedStats = localStorage.getItem('wordland_stats');
    if (savedStats) {
      try {
        const parsedStats = JSON.parse(savedStats);
        setStats(prev => ({
          ...prev,
          ...parsedStats,
          quests: parsedStats.quests || prev.quests,
          characterStats: parsedStats.characterStats || prev.characterStats
        }));
      } catch (e) {
        console.error("Failed to parse saved stats:", e);
      }
    }
    
    const initializePortraits = async (currentStats: UserStats) => {
      let updated = false;
      
      const savedPortraits = JSON.parse(localStorage.getItem('wordland_portraits') || '{}');
      
      for (const char of constants.CHARACTERS) {
        if (char.portraitUrl && char.portraitUrl.includes('storage.googleapis.com')) {
          continue;
        }

        if (savedPortraits[char.id] && (!char.portraitUrl || !char.portraitUrl.startsWith('http'))) {
          char.portraitUrl = savedPortraits[char.id];
          continue;
        }

        if (!char.portraitUrl || !char.portraitUrl.startsWith('http')) {
          const equipped = currentStats.equippedItems[char.id] || [];
          const portrait = await generateCharacterPortrait(char.id, equipped);
          if (portrait) {
            savedPortraits[char.id] = portrait;
            char.portraitUrl = portrait;
            updated = true;
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
      }
      
      if (updated) {
        localStorage.setItem('wordland_portraits', JSON.stringify(savedPortraits));
        setStats(prev => ({ ...prev }));
      }
    };

    initializePortraits(stats);
  }, [initialCharacterStats]);

  // Global View-Based BGM Orchestration
  useEffect(() => {
    const gameViews = [
      'CHALLENGE', 'SCRAMBLE', 'SHEEP', 'BALLOON', 'WHACK', 'DUBBING', 'SPELLING', 'PLANTS', 
      'RAIDEN', 'FISHING', 'ALCHEMIST', 'MINER', 'SLASHER', 'SONAR', 'COOKING', 'FEEDING', 
      'HAMSTER', 'SHOOTER', 'ICECREAM', 'DINO', 'DJ', 'ROCKET', 'POPIT', 'POTION', 'PARROT'
    ];
    if (gameViews.includes(view)) {
      try {
        audio.playBGM(view);
      } catch (e) {
        console.warn('Failed to start game BGM:', e);
      }
    } else {
      try {
        audio.stopBGM();
      } catch (e) {}
    }
    
    return () => {
      try {
        audio.stopBGM();
      } catch (e) {}
    };
  }, [view]);

  const updateQuest = (questId: string, amount: number = 1) => {
    setStats(prev => {
      const newQuests = prev.quests.map(q => {
        if (q.id === questId && !q.completed) {
          const newCurrent = Math.min(q.target, q.current + amount);
          return { ...q, current: newCurrent, completed: newCurrent >= q.target };
        }
        return q;
      });
      if (newQuests.some((q, i) => q.completed && !prev.quests[i].completed)) {
        audio.playSuccess();
        confetti({ 
            particleCount: 100, 
            spread: 70, 
            origin: { y: 0.6 },
            colors: ['#FF6B6B', '#FFD93D', '#6BCB77', '#4D96FF', '#6366F1']
        });
      }
      return { ...prev, quests: newQuests };
    });
  };

  const getLevelWords = useCallback((levelId: number): WordItem[] => {
    const savedDifficulty = localStorage.getItem('selected_adventure_difficulty') || 'PRIMARY';
    const cardsPerDay = stats.cardsPerDay || 5;
    
    let offset = 0;
    if (savedDifficulty === 'INTERMEDIATE') offset = 100;
    if (savedDifficulty === 'ADVANCED') offset = 200;

    const cardsOfDifficulty = ALL_CARDS.filter(card => (card.difficulty || 'PRIMARY') === savedDifficulty);
    const relativeId = levelId - offset;
    const levelCards = cardsOfDifficulty.slice((relativeId - 1) * cardsPerDay, relativeId * cardsPerDay);
    return levelCards.flatMap(c => c.words);
  }, [stats.cardsPerDay]);

  const handleNavigate = useCallback((newView: ViewState, levelId?: number) => {
    try {
      // Fault tolerance: prevent rapid double-clicks using a stable ref
      const now = Date.now();
      if (now - navigateTimestamp.current < 300) return;
      navigateTimestamp.current = now;

      console.log(`[Navigation] Navigating to ${newView}`, levelId ? `with level ${levelId}` : '');
      
      // Clear level ID if we're not going to adventure explicitly with a level
      if (newView !== 'ADVENTURE') {
        setPendingLevelId(undefined);
      } else if (levelId !== undefined) {
        setPendingLevelId(levelId);
      }
      
      setView(newView);
      audio.playClick();
    } catch (error) {
      console.error("[Navigation Error]", error);
      // Fallback to home if navigation fails
      setView('HOME');
    }
  }, []);

  const handleLearned = useCallback((id: string) => {
    audio.playSuccess();
    setGroups(prev => prev.map(g => g.id === id ? { ...g, learned: true, nextReview: Date.now() + 86400000 } : g));
    updateQuest('q1');
    setStats(prev => {
      const newXp = prev.xp + 100; // Optimized from 200
      const newLevel = Math.floor(newXp / 1000) + 1;
      
      if (newLevel > prev.level) {
        audio.playLevelUp();
        setNewLevel(newLevel);
        setShowLevelUp(true);
        confetti({
          particleCount: 150,
          spread: 100,
          origin: { y: 0.3 },
          colors: ['#FFD93D', '#6BCB77', '#4D96FF']
        });
      }

      const newRank = Math.max(1, 15 - Math.floor(newXp / 500));
      
      const newStats = { 
          ...prev, 
          xp: newXp, 
          starCoins: prev.starCoins + 10, // Optimized from 20
          magicCoins: prev.magicCoins + 50, // Optimized from 150
          level: newLevel,
          rank: newRank,
          masteredWords: Array.from(new Set([...prev.masteredWords, id]))
      };
      return newStats;
    });
  }, []);

  const handleChallenge = (id: string) => {
    setChallengeGroupId(id);
    handleNavigate('ARCADE');
  };

  const handleAddWord = (word: Word) => {
    const newWordItem = { text: word.term, translation: word.translation, imageUrl: word.imageUrl };
    setGroups(prev => [{ id: `user-${Date.now()}`, title: '自定义魔法', words: [newWordItem], learned: false, suffix: '', rhyme: '我亲手创造的魔法！', srsLevel: 0, nextReview: 0 }, ...prev]);
    handleNavigate('CARDS');
  };

  const dueReviews = useMemo(() => {
    const now = Date.now();
    const schedules = stats.reviewSchedules || {};
    const srsDue = Object.entries(schedules)
      .filter(([_, s]: [string, any]) => now >= s.nextReviewAt)
      .map(([id, _]) => Number(id));
    
    return srsDue.sort((a, b) => a - b); // Earliest levels first
  }, [stats.reviewSchedules]);

  const reviewNeeded = useMemo(() => {
    const groupDueCount = groups.filter(g => g.learned && g.nextReview < Date.now()).length;
    const srsDueCount = dueReviews.length;
    // Return a dummy array with the right length so the UI shows the badge
    return Array(groupDueCount + srsDueCount).fill({});
  }, [groups, dueReviews]);

  const dynamicQuests = useMemo(() => {
    const baseQuests = [...stats.quests];
    
    // Compute first uncompleted level ID
    const savedDifficulty = localStorage.getItem('selected_adventure_difficulty') || 'PRIMARY';
    const cardsPerDay = stats.cardsPerDay || 5;
    let offset = 0;
    if (savedDifficulty === 'INTERMEDIATE') offset = 100;
    if (savedDifficulty === 'ADVANCED') offset = 200;

    const cardsOfDifficulty = ALL_CARDS.filter(card => (card.difficulty || 'PRIMARY') === savedDifficulty);
    const completedLevels = stats.completedLevelIds || [];
    let firstUncompletedLevelId = offset + 1;
    
    for (let i = 0; i < cardsOfDifficulty.length; i += cardsPerDay) {
      const relativeId = Math.floor(i / cardsPerDay) + 1;
      const levelId = offset + relativeId;
      if (!completedLevels.map(Number).includes(levelId)) {
        firstUncompletedLevelId = levelId;
        break;
      }
    }

    // Assign dynamically to q1
    const q1Idx = baseQuests.findIndex(q => q.id === 'q1');
    if (q1Idx !== -1) {
      baseQuests[q1Idx] = {
        ...baseQuests[q1Idx],
        levelId: firstUncompletedLevelId,
      };
    }

    if (dueReviews.length > 0) {
      // Find the review quest or add it
      const reviewQuestIdx = baseQuests.findIndex(q => q.id === 'q3');
      if (reviewQuestIdx !== -1) {
        const targetLevelId = dueReviews[0];
        baseQuests[reviewQuestIdx] = {
          ...baseQuests[reviewQuestIdx],
          label: `反复研习魔法 (第 ${targetLevelId % 100} 关)`,
          isReviewType: true,
          targetView: 'HOME',
          levelId: targetLevelId,
          completed: false, // Force active if due
        };
      }
    }
    return baseQuests;
  }, [stats.quests, stats.completedLevelIds, stats.cardsPerDay, dueReviews]);

  const activeGroups = useMemo(() => {
    if (lastLearnedWords.length > 0) {
      return [{
        id: 'last-learned',
        title: '刚刚学过的魔法',
        suffix: '',
        words: lastLearnedWords,
        rhyme: '',
        learned: true,
        srsLevel: 0,
        nextReview: 0
      }];
    }
    if (challengeGroupId) return groups.filter(g => g.id === challengeGroupId);
    if (selectedDayId) return groups.filter(g => g.id === selectedDayId);
    return groups;
  }, [groups, challengeGroupId, selectedDayId, lastLearnedWords]);

  const handleGameSuccess = (wordText: string) => {
    setStats(prev => {
      const newMastery = { ...prev.wordMastery };
      newMastery[wordText] = (newMastery[wordText] || 0) + 1;
      
      const newMasteredWords = [...prev.masteredWords];
      if (!newMasteredWords.includes(wordText)) {
        newMasteredWords.push(wordText);
      }
      
      const newStats = { ...prev, wordMastery: newMastery, masteredWords: newMasteredWords };
      return newStats;
    });
  };

  const handleGameFinish = useCallback((score: number, coins: number) => {
    setStats(prev => {
      const newXp = prev.xp + score;
      const newCoins = (prev.starCoins || 0) + coins;
      const newMagicCoins = (prev.magicCoins || 0) + Math.floor(score / 10);
      const newLevel = Math.floor(newXp / 1000) + 1;
      
      if (newLevel > prev.level) {
        audio.playLevelUp();
        setNewLevel(newLevel);
        setShowLevelUp(true);
        confetti({
          particleCount: 150,
          spread: 100,
          origin: { y: 0.3 }
        });
      }

      const newRank = Math.max(1, 15 - Math.floor(newXp / 500));
      
      return { 
        ...prev, 
        xp: newXp, 
        starCoins: newCoins, 
        magicCoins: newMagicCoins,
        level: newLevel,
        rank: newRank,
        bestChallengeScore: Math.max(prev.bestChallengeScore, score)
      };
    });
    handleNavigate('ARCADE');
    updateQuest('q2');
    audio.playCheer();
  }, [handleNavigate]);

  const handlePurchase = (item: ShopItem) => {
    setStats(prev => {
      if (prev.magicCoins < item.price) {
        audio.playError();
        return prev;
      }
      
      let newStats = { ...prev };
      
      if (item.type === 'PET') {
        audio.playUnlock();
        const newPet: Pet = {
          id: `pet-${Date.now()}`,
          name: item.name,
          type: item.petType || 'SLIME',
          health: 100,
          maxHealth: 100,
          happiness: 100,
          level: 1,
          lastFed: Date.now(),
          isDead: false,
          birthDate: Date.now()
        };
        newStats = {
          ...prev,
          magicCoins: prev.magicCoins - item.price,
          pets: [...(prev.pets || []), newPet],
          unlockedItems: [...prev.unlockedItems, item.id]
        };
      } else if (item.type === 'CONSUMABLE') {
        audio.playPurchase();
        // Handle consumables like Level Up Potion
        if (item.id === 'gen_1') {
          const charId = prev.selectedCharacterId;
          const charStats = prev.characterStats[charId];
          newStats = {
            ...prev,
            magicCoins: prev.magicCoins - item.price,
            characterStats: {
              ...prev.characterStats,
              [charId]: {
                ...charStats,
                level: charStats.level + 1,
                strength: charStats.strength + 2,
                magic: charStats.magic + 2,
                defense: charStats.defense + 1,
                agility: charStats.agility + 1
              }
            }
          };
        } else {
           newStats = {
            ...prev,
            magicCoins: prev.magicCoins - item.price,
          };
        }
      } else {
        // Handle equipment
        audio.playUnlock();
        newStats = {
          ...prev,
          magicCoins: prev.magicCoins - item.price,
          unlockedItems: [...prev.unlockedItems, item.id]
        };
      }
      
      return newStats;
    });
  };

  const handleEquip = async (characterId: string, itemId: string) => {
    audio.playEquip();
    let updatedEquipped: string[] = [];
    
    setStats(prev => {
      const currentEquipped = prev.equippedItems[characterId] || [];
      const item = constants.SHOP_ITEMS.find(i => i.id === itemId);
      if (!item) return prev;

      // Toggle logic
      const isEquipped = currentEquipped.includes(itemId);
      let newEquipped: string[] = [];

      if (isEquipped) {
        // Unequip
        newEquipped = currentEquipped.filter(id => id !== itemId);
      } else {
        // Equip: Remove other items in the same slot first
        const filtered = currentEquipped.filter(id => {
          const otherItem = constants.SHOP_ITEMS.find(i => i.id === id);
          // If slot is NONE, it doesn't conflict with others (except itself)
          if (item.slot === 'NONE') return id !== itemId;
          return otherItem?.slot !== item.slot;
        });
        newEquipped = [...filtered, itemId];
      }

      updatedEquipped = newEquipped;

      const newStats = {
        ...prev,
        equippedItems: {
          ...prev.equippedItems,
          [characterId]: newEquipped
        }
      };
      return newStats;
    });

    // Re-generate portrait to reflect equipment changes
    try {
      const portrait = await generateCharacterPortrait(characterId, updatedEquipped);
      if (portrait) {
        const char = constants.CHARACTERS.find(c => c.id === characterId);
        if (char) {
          char.portraitUrl = portrait;
          // Save to local storage for persistence
          const saved = JSON.parse(localStorage.getItem('wordland_portraits') || '{}');
          saved[characterId] = portrait;
          localStorage.setItem('wordland_portraits', JSON.stringify(saved));
          
          // Force a re-render
          setStats(prev => ({ ...prev }));
        }
      }
    } catch (error) {
      console.error("Failed to update portrait with equipment:", error);
    }
  };

  const handleSelectCharacter = useMemo(() => (characterId: string) => {
    setStats(prev => {
      const newStats = { ...prev, selectedCharacterId: characterId };
      return newStats;
    });
  }, []);

  const handleReward = useCallback((xp: number, coins: number) => {
    setStats(prev => {
      const newXp = prev.xp + xp;
      const newLevel = Math.floor(newXp / 1000) + 1;
      const newMagicCoins = (prev.magicCoins || 0) + coins;
      const newStarCoins = (prev.starCoins || 0) + coins;
      
      if (newLevel > prev.level) {
        audio.playLevelUp();
        setNewLevel(newLevel);
        setShowLevelUp(true);
        confetti({
          particleCount: 150,
          spread: 100,
          origin: { y: 0.3 }
        });
      }

      const newRank = Math.max(1, 15 - Math.floor(newXp / 500));
      
      return { 
        ...prev, 
        xp: newXp, 
        magicCoins: newMagicCoins,
        starCoins: newStarCoins,
        level: newLevel,
        rank: newRank
      };
    });
  }, []);

  const handleUpdateStats = useCallback((newStats: Partial<UserStats>) => {
    setStats(prev => {
      let updatedQuests = prev.quests;
      if (newStats.reviewSchedules && JSON.stringify(newStats.reviewSchedules) !== JSON.stringify(prev.reviewSchedules)) {
        updatedQuests = prev.quests.map(q => {
          if (q.id === 'q3' && !q.completed) {
            const newCurrent = Math.min(q.target, q.current + 1);
            const completed = newCurrent >= q.target;
            if (completed) {
              audio.playSuccess();
              confetti({ 
                  particleCount: 100, 
                  spread: 70, 
                  origin: { y: 0.6 },
                  colors: ['#FF6B6B', '#FFD93D', '#6BCB77', '#4D96FF', '#6366F1']
              });
            }
            return { ...q, current: newCurrent, completed };
          }
          return q;
        });
      }
      return { ...prev, ...newStats, quests: updatedQuests };
    });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-indigo-50">
        <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-indigo-600 font-bold animate-pulse">正在开启魔法冒险...</p>
      </div>
    );
  }

  if (showWelcome) {
    return (
      <motion.div 
        className="fixed inset-0 z-[200] bg-gradient-to-br from-emerald-400 via-green-300 to-emerald-200 flex flex-col items-center justify-center overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Animated Background Blobs */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              x: [-10, 10, -10],
              y: [-10, 10, -10],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-white/30 rounded-full blur-[100px]"
          />
          <motion.div 
            animate={{ 
              scale: [1, 1.3, 1],
              x: [10, -10, 10],
              y: [10, -10, 10],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-emerald-100/40 rounded-full blur-[120px]"
          />
        </div>

        {/* Animated Forest Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Floating Sparkles/Fireflies */}
          {[...Array(25)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-yellow-100 rounded-full blur-[1px]"
              initial={{ 
                x: Math.random() * 100 + "%", 
                y: Math.random() * 100 + "%",
                opacity: 0
              }}
              animate={{ 
                y: [null, "-10%", "10%"],
                x: [null, "5%", "-5%"],
                opacity: [0, 0.7, 0],
                scale: [0.5, 1.2, 0.5]
              }}
              transition={{ 
                duration: 4 + Math.random() * 4, 
                repeat: Infinity, 
                ease: "easeInOut",
                delay: Math.random() * 5
              }}
            />
          ))}
          
          {/* Falling Leaves */}
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={`leaf-${i}`}
              className="absolute text-5xl filter drop-shadow-sm opacity-60"
              initial={{ 
                x: Math.random() * 110 - 5 + "%", 
                y: -100,
                rotate: Math.random() * 360 
              }}
              animate={{ 
                y: window.innerHeight + 100,
                x: [null, (Math.random() - 0.5) * 300 + "px"],
                rotate: 720
              }}
              transition={{ 
                duration: 12 + Math.random() * 10, 
                repeat: Infinity, 
                ease: "linear",
                delay: Math.random() * 15
              }}
            >
              {['🍃', '🌿', '🌱'][Math.floor(Math.random() * 3)]}
            </motion.div>
          ))}
        </div>

        <motion.div
           initial={{ scale: 0.8, opacity: 0, y: 30 }}
           animate={{ scale: 1, opacity: 1, y: 0 }}
           transition={{ type: "spring", damping: 20, stiffness: 100 }}
           className="relative z-10 flex flex-col items-center"
        >
          {/* Main Visual Container */}
          <div className="relative mb-14">
            <motion.div
              animate={{ 
                y: [0, -10, 0],
                rotate: [-1, 1, -1]
              }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="w-52 h-52 bg-white/40 backdrop-blur-3xl rounded-[64px] border-4 border-white/60 flex items-center justify-center shadow-[0_25px_60px_rgba(0,0,0,0.1)] relative"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 border-2 border-white/40 rounded-[64px] border-dashed scale-105"
              />
              <span className="text-[120px] relative z-10 filter drop-shadow-lg">🌳</span>
              
              {/* Character Pipi/Tiger popping up */}
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8, type: "spring", bounce: 0.5 }}
                className="absolute -bottom-8 -right-8 w-24 h-24 bg-white rounded-3xl border-4 border-emerald-50 shadow-2xl flex items-center justify-center text-5xl"
              >
                🐯
              </motion.div>
            </motion.div>
          </div>
          
          <div className="text-center space-y-4">
            <motion.h1 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-7xl font-black text-emerald-900 drop-shadow-[0_4px_10px_rgba(255,255,255,1)] tracking-tighter"
            >
              单词奇旅
            </motion.h1>
            <motion.div 
              className="flex items-center justify-center space-x-4 text-emerald-800/60"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <div className="h-[2px] w-12 bg-current opacity-30" />
              <p className="text-xl font-bold uppercase tracking-[0.6em] ml-2">
                单词魔法乐园
              </p>
              <div className="h-[2px] w-12 bg-current opacity-30" />
            </motion.div>
          </div>
          
          <div className="mt-20 relative">
            <motion.button
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => { audio.playClick(); setShowWelcome(false); }}
              className="group relative px-20 py-7 bg-white rounded-[44px] font-black text-3xl text-emerald-600 shadow-[0_20px_40px_rgba(16,185,129,0.15),inset_0_-8px_0_#ECFDF5] hover:shadow-[0_25px_50px_rgba(16,185,129,0.2)] transition-all flex items-center space-x-5 overflow-hidden"
            >
              <span className="relative z-10 text-emerald-700">开启探险</span>
              <motion.div
                animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.1, 0.9, 1] }}
                transition={{ repeat: Infinity, duration: 3 }}
                className="relative z-10 text-emerald-500"
              >
                <Compass className="w-10 h-10" />
              </motion.div>
              
              <motion.div 
                className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-50/50 to-transparent -translate-x-full group-hover:animate-shine"
                style={{ skewX: '-20deg' }}
              />
            </motion.button>
          </div>
        </motion.div>
        
        {/* Decorative elements in corners */}
        <motion.div 
          animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-12 left-12 text-7xl filter drop-shadow-xl"
        >
          🍄
        </motion.div>
        <motion.div 
          animate={{ y: [0, -10, 0], rotate: [0, -5, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          className="absolute bottom-16 right-16 text-7xl filter drop-shadow-xl"
        >
          🌺
        </motion.div>
        <div className="absolute top-1/4 right-[15%] text-6xl opacity-30 animate-pulse">🦋</div>
        <div className="absolute bottom-1/3 left-[12%] text-6xl opacity-20 rotate-12">🦉</div>
      </motion.div>
    );
  }

        



  return (
    <div className="min-h-screen pt-10 pb-32 px-5 flex flex-col items-center max-w-lg mx-auto overflow-x-hidden relative">
      {/* User Auth Header */}
      <div className="absolute top-4 right-4 z-[70]">
        {user ? (
          <button 
            onClick={handleLogout}
            className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm p-1.5 pr-3 rounded-full border border-indigo-100 shadow-sm hover:bg-white transition-all"
          >
            {user.photoURL ? (
              <SafeImage src={user.photoURL} alt="" className="w-7 h-7 rounded-full border border-indigo-200" width="28" height="28" />
            ) : (
              <div className="w-7 h-7 rounded-full bg-indigo-500 flex items-center justify-center text-white text-[10px] font-black">
                {user.displayName?.charAt(0) || 'U'}
              </div>
            )}
            <span className="text-[10px] font-black text-slate-600 truncate max-w-[60px]">退出</span>
          </button>
        ) : (
          <button 
            onClick={handleLogin}
            className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-full shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all text-xs font-black"
          >
            <Award size={14} />
            <span>登录同步</span>
          </button>
        )}
      </div>

      <main className="w-full flex-1 flex flex-col pt-4">
        <AnimatePresence mode="wait">
          {view === 'HOME' && (
            <motion.div key="home" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
              <HomePage 
                stats={{ ...stats, quests: dynamicQuests }} 
                groups={groups} 
                reviewNeeded={reviewNeeded} 
                onNavigate={handleNavigate} 
                onQuestClick={(v, r, l) => {
                  if (r) {
                    setShowReviewModal(true);
                  } else if (v === 'ARCADE') {
                    // Preload words from highest completed/learned level if lastLearnedWords is empty
                    const completed = stats.completedLevelIds || [];
                    if (completed.length > 0 && lastLearnedWords.length === 0) {
                      const levelId = Number(completed[completed.length - 1]);
                      const words = getLevelWords(levelId);
                      if (words && words.length > 0) {
                        setLastLearnedWords(words);
                      }
                    } else if (lastLearnedWords.length === 0) {
                      // Fallback to first level if none completed yet
                      const words = getLevelWords(1);
                      if (words && words.length > 0) {
                        setLastLearnedWords(words);
                      }
                    }
                    handleNavigate(v, l);
                  } else {
                    setIsReviewChallenge(!!r); 
                    handleNavigate(v, l);
                  }
                }} 
                onUpdateStats={handleUpdateStats}
              />
            </motion.div>
          )}

          {view === 'ADVENTURE' && (
            <motion.div key="adventure" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <AdventurePage 
                onClose={() => handleNavigate('HOME')} 
                onReward={handleReward}
                stats={stats}
                onUpdateStats={handleUpdateStats}
                initialLevelId={pendingLevelId}
                onConsumedLevelId={() => setPendingLevelId(undefined)}
                onCompleteLevel={(words, levelId) => {
                  setLastLearnedWords(words);
                  setLastLearnedLevelId(levelId);
                  updateQuest('q1');
                  setStats(prev => ({
                    ...prev,
                    totalWordsLearned: prev.totalWordsLearned + words.length,
                    masteredWords: [...new Set([...prev.masteredWords, ...words.map(w => w.text)])],
                    completedLevelsCount: prev.completedLevelsCount + 1,
                    completedLevelIds: [...new Set([...prev.completedLevelIds, levelId])]
                  }));
                  handleNavigate('ARCADE');
                }}
              />
            </motion.div>
          )}

          {view === 'CARDS' && (
            <motion.div key="cards" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <div className="text-center mb-4">
                 <h2 className="text-2xl font-black text-slate-800 tracking-tight">今日任务词库</h2>
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Daily Magic Words</p>
              </div>
              {activeGroups.map(g => (
                <WordLandCard 
                  key={g.id} 
                  card={g} 
                  onLearned={() => handleLearned(g.id)} 
                  onNext={() => {}} 
                  isLast={true} 
                  onChallenge={() => handleChallenge(g.id)} 
                />
              ))}
            </motion.div>
          )}

          {view === 'ARCADE' && (
            <motion.div key="arcade" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <ArcadePage 
                groups={groups} 
                stats={stats}
                lastLearnedWords={lastLearnedWords}
                lastLearnedLevelId={lastLearnedLevelId}
                onSelectGame={(id, words) => {
                  if (words) setLastLearnedWords(words);
                  handleNavigate(id as ViewState);
                }} 
                onClose={() => { handleNavigate('HOME'); setChallengeGroupId(null); setLastLearnedWords([]); setLastLearnedLevelId(null); }} 
              />
            </motion.div>
          )}

          {view === 'SHOP' && (
            <motion.div key="shop" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }}>
              <MagicShop 
                stats={stats} 
                onPurchase={handlePurchase} 
                onEquip={handleEquip} 
                onSelectCharacter={handleSelectCharacter} 
                onClose={() => handleNavigate('HOME')}
              />
            </motion.div>
          )}
          
          {view === 'PETS' && (
            <motion.div key="pets" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <PetPage 
                stats={stats}
                onUpdateStats={(updater) => setStats(prev => updater(prev))}
                onNavigate={handleNavigate}
                onClose={() => handleNavigate('HOME')}
              />
            </motion.div>
          )}
          
          {/* Game Views - Smooth Scale Entrance */}
          {['CHALLENGE', 'SCRAMBLE', 'SHEEP', 'BALLOON', 'WHACK', 'DUBBING', 'SPELLING', 'PLANTS', 'RAIDEN', 'FISHING', 'ALCHEMIST', 'MINER', 'SLASHER', 'SONAR', 'COOKING', 'FEEDING', 'HAMSTER', 'SHOOTER', 'ICECREAM', 'DINO', 'DJ', 'ROCKET', 'POPIT', 'POTION', 'PARROT'].includes(view) && (
            <motion.div key="game" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 1.1, opacity: 0 }} transition={{ type: "spring", damping: 20 }}>
              {view === 'CHALLENGE' && <WordChallenge groups={activeGroups} isReviewMode={isReviewChallenge} onFinish={handleGameFinish} onMistake={() => {}} onSuccess={handleGameSuccess} onClose={() => handleNavigate('ARCADE')} />}
              {view === 'SCRAMBLE' && <LetterScramble groups={activeGroups} onFinish={handleGameFinish} onClose={() => handleNavigate('ARCADE')} />}
              {view === 'SHEEP' && <SheepMatch groups={activeGroups} onFinish={handleGameFinish} onClose={() => handleNavigate('ARCADE')} />}
              {view === 'BALLOON' && <FlyingDagger groups={activeGroups} onFinish={handleGameFinish} onMistake={() => {}} onSuccess={handleGameSuccess} onClose={() => handleNavigate('ARCADE')} />}
              {view === 'WHACK' && <WhackAMole groups={activeGroups} onFinish={handleGameFinish} onMistake={() => {}} onSuccess={handleGameSuccess} onClose={() => handleNavigate('ARCADE')} />}
              {view === 'DUBBING' && <VoiceDubbing items={activeGroups.flatMap(g => g.words.map((w, idx) => ({ id: `${g.id}-${idx}`, ...w })))} onFinish={handleGameFinish} onClose={() => handleNavigate('ARCADE')} />}
              {view === 'SPELLING' && <SpellingBee groups={activeGroups} onFinish={handleGameFinish} onClose={() => handleNavigate('ARCADE')} />}
              {view === 'PLANTS' && <PlantsVsMonsters groups={activeGroups} stats={stats} onFinish={handleGameFinish} onClose={() => handleNavigate('ARCADE')} />}
              {view === 'RAIDEN' && <SpaceWordRaider groups={activeGroups} stats={stats} onFinish={handleGameFinish} onClose={() => handleNavigate('ARCADE')} />}
              {view === 'FISHING' && <PolarWordFishing groups={activeGroups} stats={stats} onFinish={handleGameFinish} onClose={() => handleNavigate('ARCADE')} />}
              {view === 'ALCHEMIST' && <CauldronSorter groups={activeGroups} stats={stats} onFinish={handleGameFinish} onClose={() => handleNavigate('ARCADE')} />}
              {view === 'MINER' && <WordGoldMiner groups={activeGroups} stats={stats} onFinish={handleGameFinish} onClose={() => handleNavigate('ARCADE')} />}
              {view === 'SLASHER' && <WordNinjaSlasher groups={activeGroups} stats={stats} onFinish={handleGameFinish} onClose={() => handleNavigate('ARCADE')} />}
              {view === 'SONAR' && <DeepSeaSonar groups={activeGroups} stats={stats} onFinish={handleGameFinish} onClose={() => handleNavigate('ARCADE')} />}
              {view === 'COOKING' && <SizzlingWordKitchen groups={activeGroups} stats={stats} onFinish={handleGameFinish} onClose={() => handleNavigate('ARCADE')} />}
              {view === 'FEEDING' && <WordMonsterFeeding groups={activeGroups} stats={stats} onFinish={handleGameFinish} onClose={() => handleNavigate('ARCADE')} />}
              {view === 'HAMSTER' && <WordHamsterWhack groups={activeGroups} stats={stats} onFinish={handleGameFinish} onClose={() => handleNavigate('ARCADE')} />}
              {view === 'SHOOTER' && <WordBubbleShooter groups={activeGroups} stats={stats} onFinish={handleGameFinish} onClose={() => handleNavigate('ARCADE')} />}
              {view === 'ICECREAM' && <IceCreamSpelling groups={activeGroups} stats={stats} onFinish={handleGameFinish} onClose={() => handleNavigate('ARCADE')} />}
              {view === 'DINO' && <DinoRockJumper groups={activeGroups} stats={stats} onFinish={handleGameFinish} onClose={() => handleNavigate('ARCADE')} />}
              {view === 'DJ' && <WordDJBeat groups={activeGroups} stats={stats} onFinish={handleGameFinish} onClose={() => handleNavigate('ARCADE')} />}
              {view === 'ROCKET' && <WordMagnetRocket groups={activeGroups} stats={stats} onFinish={handleGameFinish} onClose={() => handleNavigate('ARCADE')} />}
              {view === 'POPIT' && <WordSpellingPopit groups={activeGroups} stats={stats} onFinish={handleGameFinish} onClose={() => handleNavigate('ARCADE')} />}
              {view === 'POTION' && <WordPotionLab groups={activeGroups} stats={stats} onFinish={handleGameFinish} onClose={() => handleNavigate('ARCADE')} />}
              {view === 'PARROT' && <WordParrotDubbing groups={activeGroups} stats={stats} onFinish={handleGameFinish} onClose={() => handleNavigate('ARCADE')} />}
            </motion.div>
          )}

          {view === 'RANKING' && (
            <motion.div key="ranking" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <Leaderboard stats={stats} />
            </motion.div>
          )}
          
          {view === 'UPLOAD' && (
            <motion.div key="upload" initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }}>
              <UploadContent onAddWord={handleAddWord} onAddVideo={() => {}} />
            </motion.div>
          )}

          {view === 'COLLECTION' && (
            <motion.div key="collection" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <CollectionCenter 
                groups={groups} 
                stats={stats} 
                onUpdateStats={handleUpdateStats}
                onReward={(xp, coins) => {
                  handleReward(xp, coins);
                  audio.playCoin();
                }}
                onClose={() => handleNavigate('HOME')} 
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {showReviewModal && (
          <RepetitiveMagicStudyModal
            stats={stats}
            onClose={() => setShowReviewModal(false)}
            onCompleteReview={() => {
              updateQuest('q3');
              setShowReviewModal(false);
            }}
            onSelectReviewLevel={(levelId) => {
              setShowReviewModal(false);
              handleNavigate('ADVENTURE', levelId);
            }}
          />
        )}

        {showLevelUp && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/80 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.5, y: 100 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.5, y: 100 }}
              className="bg-white rounded-[48px] p-10 shadow-2xl border-4 border-indigo-500 max-w-sm w-full text-center relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
              
              <div className="w-24 h-24 bg-indigo-100 rounded-[32px] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-indigo-100">
                <Award size={48} className="text-indigo-600" />
              </div>
              
              <h2 className="text-4xl font-black text-slate-800 mb-2">等级提升！</h2>
              <p className="text-slate-500 font-bold mb-8">恭喜你达到了等级 {newLevel}</p>
              
              <div className="bg-indigo-50 rounded-3xl p-6 mb-8 border border-indigo-100">
                <p className="text-indigo-700 font-black text-sm">解锁了新的魔法商店道具！</p>
              </div>
              
              <button 
                onClick={() => setShowLevelUp(false)}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-5 rounded-[24px] shadow-xl shadow-indigo-200 transition-all active:scale-95"
              >
                继续冒险
              </button>
            </motion.div>
          </motion.div>
        )}

        {authError && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 30 }}
              className="bg-white rounded-[40px] p-8 shadow-2xl border-4 border-indigo-600 max-w-md w-full relative overflow-hidden flex flex-col max-h-[95vh]"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-400 via-rose-500 to-indigo-600" />
              
              <button 
                onClick={() => setAuthError(null)}
                className="absolute top-5 right-5 p-2 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full transition-all cursor-pointer border border-transparent hover:border-slate-300"
              >
                <X size={16} />
              </button>

              <div className="flex items-center space-x-3 mb-5 mt-2 shrink-0">
                <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 shrink-0">
                  <ShieldAlert size={26} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-800 leading-tight">登录通道受阻</h3>
                  <p className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Login Process Interrupted</p>
                </div>
              </div>

              <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200/60 text-slate-700 text-xs font-bold leading-relaxed space-y-2 mb-6 overflow-y-auto max-h-[160px] scrollbar-thin shrink-0">
                <p className="text-amber-800 font-extrabold flex items-center gap-1.5 shrink-0">
                  <AlertCircle size={14} className="shrink-0" />
                  <span>为什么会出现这个情况？</span>
                </p>
                <p className="opacity-90 leading-relaxed">
                  检测到登录账号弹窗未完成。由于 AI Studio 预览环境运行在沙盒 Safe-iFrame 中，浏览器的安全拦截限制可能会导致 Google 登录窗口被阻止弹出，从而触发 <code className="bg-amber-100/80 text-amber-900 px-1 py-0.5 rounded font-mono">auth/popup-closed-by-user</code> 错误。
                </p>
                <p className="text-[10.5px] text-slate-400">
                  系统错误代码: {authError.code}
                </p>
              </div>

              <div className="space-y-4 overflow-y-auto flex-1 pr-1 scrollbar-thin">
                <div className="space-y-1.5 bg-slate-50/50 p-3 rounded-[24px] border border-slate-100">
                  <button 
                    onClick={handleGuestLogin}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold py-3 px-4 rounded-[18px] shadow-lg shadow-indigo-200 flex items-center justify-between transition-all active:scale-[0.98] text-xs cursor-pointer"
                  >
                    <div className="flex items-center space-x-2">
                      <Sparkles size={14} className="text-amber-300 animate-pulse" />
                      <span>✨ 开启「魔法访客」(极速直登)</span>
                    </div>
                    <span className="text-[9px] bg-white/20 px-2 py-0.5 rounded-full uppercase font-black text-white">推荐</span>
                  </button>
                  <p className="text-[10px] text-slate-500 pl-1 leading-relaxed">
                    一键创建访客身份，同样能将你的宠物、金币和冒险进度安全记录于 Firestore 数据库！(完美避开 iframe 限制)
                  </p>
                </div>

                <div className="space-y-1.5 bg-slate-50/50 p-3 rounded-[24px] border border-slate-100">
                  <button 
                    onClick={() => {
                      window.open(window.location.href, '_blank');
                    }}
                    className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold py-3 px-4 rounded-[18px] flex items-center justify-between transition-all active:scale-[0.98] text-xs cursor-pointer border border-slate-200"
                  >
                    <div className="flex items-center space-x-2">
                      <Globe size={14} className="text-slate-500" />
                      <span>🌐 在新标签页打开网页登录</span>
                    </div>
                    <ExternalLink size={12} className="text-slate-400" />
                  </button>
                  <p className="text-[10px] text-slate-500 pl-1 leading-relaxed">
                    在新独立的标签浏览器窗口中打开应用，彻底摆脱外部沙盒，即可完美支持 Google 登录同步！
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex gap-2.5 shrink-0">
                <button 
                  onClick={handleLogin}
                  className="flex-1 bg-teal-500 hover:bg-teal-600 text-white font-black text-xs py-3 rounded-[16px] transition-all cursor-pointer text-center"
                >
                  重试登录
                </button>
                <button 
                  onClick={() => setAuthError(null)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-black text-xs py-3 rounded-[16px] transition-all cursor-pointer text-center"
                >
                  取消
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[95%] glass-pill h-20 rounded-[32px] flex items-center justify-around px-4 z-50 border-white/80 shadow-2xl">
        <NavButton icon={<Home />} label="主页" active={view === 'HOME'} onClick={() => handleNavigate('HOME')} color="text-indigo-600" />
        <NavButton icon={<BookOpen />} label="冒险" active={view === 'ADVENTURE'} onClick={() => handleNavigate('ADVENTURE')} color="text-rose-500" />
        <NavButton icon={<Gamepad2 />} label="游玩" active={view === 'ARCADE' || ['CHALLENGE', 'SCRAMBLE', 'SHEEP', 'BALLOON', 'WHACK', 'DUBBING', 'SPELLING', 'PLANTS', 'RAIDEN', 'FISHING', 'ALCHEMIST', 'MINER', 'SLASHER', 'SONAR', 'COOKING', 'FEEDING', 'HAMSTER', 'SHOOTER', 'ICECREAM', 'DINO', 'DJ', 'ROCKET', 'POPIT', 'POTION', 'PARROT'].includes(view)} onClick={() => handleNavigate('ARCADE')} color="text-sky-500" />
        <NavButton icon={<Heart />} label="宠兽" active={view === 'PETS'} onClick={() => handleNavigate('PETS')} color="text-rose-400" />
        <NavButton icon={<ShoppingBag />} label="商店" active={view === 'SHOP'} onClick={() => handleNavigate('SHOP')} color="text-purple-500" />
        <NavButton icon={<BarChart3 />} label="排行" active={view === 'RANKING'} onClick={() => handleNavigate('RANKING')} color="text-amber-500" />
      </nav>
    </div>
  );
};

export default App;
