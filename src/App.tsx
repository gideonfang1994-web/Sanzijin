
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
import Leaderboard from './components/Leaderboard';
import UploadContent from './components/UploadContent';
import MagicShop from './components/MagicShop';
import PetPage from './pages/PetPage';
import constants from './constants';
import { WordGroup, UserStats, ViewState, DailyQuest, Word, WordItem, ShopItem, Pet } from './types';
import { Home, BookOpen, Gamepad2, BarChart3, Award, ShoppingBag, Heart } from 'lucide-react';
import audio from './utils/AudioUtils';
import confetti from 'canvas-confetti';
import { generateCharacterPortrait } from './services/portraitService';
import { motion, AnimatePresence } from 'framer-motion';
import { auth, db, doc, getDoc, setDoc, onAuthStateChanged, FirebaseUser, handleFirestoreError, OperationType, signInWithPopup, googleProvider, signOut } from './firebase';
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
  const [pendingLevelId, setPendingLevelId] = useState<number | undefined>(undefined);
  
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [newLevel, setNewLevel] = useState(1);
  const navigateTimestamp = React.useRef<number>(0);
  
  const initialQuests: DailyQuest[] = [
    { id: 'q1', label: '解锁一个新魔法', target: 1, current: 0, completed: false, rewardXp: 100, rewardCoins: 10, targetView: 'CARDS' },
    { id: 'q2', label: '游乐园大获全胜', target: 1, current: 0, completed: false, rewardXp: 200, rewardCoins: 25, targetView: 'ARCADE' },
    { id: 'q3', label: '魔法净化行动', target: 1, current: 0, completed: false, rewardXp: 300, rewardCoins: 50, targetView: 'ARCADE', isReviewType: true },
  ];

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

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const handleLogout = async () => {
    try {
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
            displayName: user.displayName,
            photoURL: user.photoURL,
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
    if (dueReviews.length > 0) {
      // Find the review quest or add it
      const reviewQuestIdx = baseQuests.findIndex(q => q.id === 'q3');
      if (reviewQuestIdx !== -1) {
        const targetLevelId = dueReviews[0];
        baseQuests[reviewQuestIdx] = {
          ...baseQuests[reviewQuestIdx],
          label: `复习魔法 (关卡 ${targetLevelId})`,
          isReviewType: true,
          targetView: 'ADVENTURE',
          levelId: targetLevelId,
          completed: false, // Force active if due
        };
      }
    }
    return baseQuests;
  }, [stats.quests, dueReviews]);

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
    setStats(prev => ({ ...prev, ...newStats }));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-indigo-50">
        <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-indigo-600 font-bold animate-pulse">正在开启魔法冒险...</p>
      </div>
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
                onQuestClick={(v, r, l) => { setIsReviewChallenge(!!r); handleNavigate(v, l); }} 
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
                onSelectGame={(id, words) => {
                  if (words) setLastLearnedWords(words);
                  handleNavigate(id as ViewState);
                }} 
                onClose={() => { handleNavigate('HOME'); setChallengeGroupId(null); setLastLearnedWords([]); }} 
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
          {['CHALLENGE', 'SCRAMBLE', 'SHEEP', 'BALLOON', 'WHACK', 'DUBBING', 'SPELLING'].includes(view) && (
            <motion.div key="game" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 1.1, opacity: 0 }} transition={{ type: "spring", damping: 20 }}>
              {view === 'CHALLENGE' && <WordChallenge groups={activeGroups} isReviewMode={isReviewChallenge} onFinish={handleGameFinish} onMistake={() => {}} onSuccess={handleGameSuccess} onClose={() => handleNavigate('ARCADE')} />}
              {view === 'SCRAMBLE' && <LetterScramble groups={activeGroups} onFinish={handleGameFinish} onClose={() => handleNavigate('ARCADE')} />}
              {view === 'SHEEP' && <SheepMatch groups={activeGroups} onFinish={handleGameFinish} onClose={() => handleNavigate('ARCADE')} />}
              {view === 'BALLOON' && <FlyingDagger groups={activeGroups} onFinish={handleGameFinish} onMistake={() => {}} onSuccess={handleGameSuccess} onClose={() => handleNavigate('ARCADE')} />}
              {view === 'WHACK' && <WhackAMole groups={activeGroups} onFinish={handleGameFinish} onMistake={() => {}} onSuccess={handleGameSuccess} onClose={() => handleNavigate('ARCADE')} />}
              {view === 'DUBBING' && <VoiceDubbing items={activeGroups.flatMap(g => g.words.map((w, idx) => ({ id: `${g.id}-${idx}`, ...w })))} onFinish={handleGameFinish} onClose={() => handleNavigate('ARCADE')} />}
              {view === 'SPELLING' && <SpellingBee groups={activeGroups} onFinish={handleGameFinish} onClose={() => handleNavigate('ARCADE')} />}
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
        </AnimatePresence>
      </main>

      <AnimatePresence>
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
      </AnimatePresence>

      <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[95%] glass-pill h-20 rounded-[32px] flex items-center justify-around px-4 z-50 border-white/80 shadow-2xl">
        <NavButton icon={<Home />} label="主页" active={view === 'HOME'} onClick={() => handleNavigate('HOME')} color="text-indigo-600" />
        <NavButton icon={<BookOpen />} label="冒险" active={view === 'ADVENTURE'} onClick={() => handleNavigate('ADVENTURE')} color="text-rose-500" />
        <NavButton icon={<Gamepad2 />} label="游玩" active={view === 'ARCADE' || ['CHALLENGE', 'SCRAMBLE', 'SHEEP', 'BALLOON', 'WHACK', 'DUBBING', 'SPELLING'].includes(view)} onClick={() => handleNavigate('ARCADE')} color="text-sky-500" />
        <NavButton icon={<Heart />} label="宠兽" active={view === 'PETS'} onClick={() => handleNavigate('PETS')} color="text-rose-400" />
        <NavButton icon={<ShoppingBag />} label="商店" active={view === 'SHOP'} onClick={() => handleNavigate('SHOP')} color="text-purple-500" />
        <NavButton icon={<BarChart3 />} label="排行" active={view === 'RANKING'} onClick={() => handleNavigate('RANKING')} color="text-amber-500" />
      </nav>
    </div>
  );
};

export default App;
