
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, ChevronDown, Play, Gamepad2, RefreshCw, Star, Trophy,
  ArrowRight, Volume2, Lock, CheckCircle2, Zap, Trash2, Wand2,
  BookOpen, Flame, Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { WordItem, WordCard, AdventureForestProps, DifficultyLevel } from '../types';
import { ALL_CARDS } from '../constants';
import audio from '../utils/AudioUtils';
import { GoogleGenAI } from "@google/genai";
import VoiceDubbing from '../components/VoiceDubbing';
import SafeImage from '../components/SafeImage';
import PhonicsSpellingModal from '../components/PhonicsSpellingModal';

const getAi = () => {
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
  if (!apiKey) {
    console.warn("GEMINI_API_KEY is missing. AI features will be disabled.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

type AdventureStep = 'SETUP' | 'MAP' | 'LEARN' | 'REVIEW' | 'DUBBING' | 'TEST' | 'COMPLETE';

interface Level {
  id: number;
  displayId?: number;
  name: string;
  cards: WordCard[];
  isUnlocked: boolean;
  isCompleted: boolean;
  isMastered: boolean;
  isDue?: boolean;
  intervalDays?: number;
}

interface AdventurePageProps extends AdventureForestProps {
  onConsumedLevelId?: () => void;
}

// Memoized Level Node for performance
const LevelNode = React.memo(({ 
  level, 
  index, 
  isLocked, 
  isCurrent, 
  onSelect 
}: { 
  level: Level, 
  index: number, 
  isLocked: boolean, 
  isCurrent: boolean, 
  onSelect: (level: Level) => void 
}) => {
  const isEven = index % 2 === 0;

  return (
    <motion.div 
      initial={{ opacity: 0, x: isEven ? -20 : 20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      className={`flex items-center group cursor-pointer relative z-30 ${isEven ? 'flex-row' : 'flex-row-reverse'}`}
      onClick={() => onSelect(level)}
      whileTap={!isLocked ? { scale: 0.98 } : {}}
    >
      <div className={`flex-1 flex ${isEven ? 'justify-end pr-10' : 'justify-start pl-10'}`}>
        <div className={`${isEven ? 'text-right' : 'text-left'}`}>
          <h4 className={`font-black text-lg leading-tight whitespace-nowrap transition-colors ${isLocked ? 'text-emerald-200' : 'text-emerald-800 group-hover:text-emerald-600'}`}>{level.name}</h4>
          <div className="flex items-center mt-1 space-x-1 opacity-60 whitespace-nowrap">
             <span className={`text-[10px] font-black uppercase tracking-tighter ${isLocked ? 'text-emerald-200' : 'text-emerald-500'}`}>关卡 {level.displayId || level.id} • {level.cards.length} 魔法</span>
             <span className={`text-[10px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md ${isLocked ? 'bg-emerald-50/50 text-emerald-200' : 'bg-emerald-100 text-emerald-800'}`}>
               {level.cards[0]?.difficulty === 'PRIMARY' ? '初级' : level.cards[0]?.difficulty === 'INTERMEDIATE' ? '中级' : '高级'}
             </span>
          </div>
        </div>
      </div>

      <div className="relative">
        {isCurrent && (
          <motion.div 
            layoutId="current-indicator"
            className="absolute inset-0 bg-emerald-400 rounded-full blur-xl opacity-40"
            animate={{ scale: [1, 1.4, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}

        {/* @ts-ignore */}
        {level.isDue && (
          <motion.div 
            className="absolute -top-4 -left-4 z-40 bg-rose-500 text-white px-3 py-1 rounded-full text-[10px] font-black shadow-lg border-2 border-white flex items-center space-x-1"
            animate={{ y: [0, -5, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
             <RefreshCw size={10} className="animate-spin-slow" />
             <span>该复习了</span>
          </motion.div>
        )}

        <div 
          className={`w-20 h-20 rounded-[28px] border-[6px] flex items-center justify-center transition-all shadow-xl relative z-10 ${
            isLocked 
              ? 'bg-emerald-50 border-emerald-100 text-emerald-200' 
              : level.isMastered 
                ? 'bg-emerald-500 border-emerald-200 text-white group-hover:scale-110' 
                // @ts-ignore
                : level.isDue
                  ? 'bg-rose-50 border-rose-500 text-rose-500 scale-110 group-hover:scale-125'
                  : 'bg-white border-emerald-500 text-emerald-600 scale-110 group-hover:scale-125 group-hover:rotate-6'
          }`}
        >
          {/* @ts-ignore */}
          {isLocked ? <Lock size={28} /> : level.isMastered ? <CheckCircle2 size={32} /> : level.isDue ? <RefreshCw size={32} /> : <Play size={32} className="ml-1 fill-emerald-600" />}
          
          <div className={`absolute -top-3 -right-3 w-8 h-8 rounded-full border-4 border-white flex items-center justify-center text-[10px] font-black shadow-md ${isLocked ? 'bg-emerald-100 text-emerald-300' : 'bg-emerald-800 text-white'}`}>
            {level.displayId || level.id}
          </div>
          
          {/* @ts-ignore */}
          {level.intervalDays > 0 && !isLocked && (
             <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex space-x-0.5">
               {/* @ts-ignore */}
               {[...Array(Math.min(5, level.intervalDays === 1 ? 1 : level.intervalDays === 3 ? 2 : level.intervalDays === 7 ? 3 : level.intervalDays === 14 ? 4 : 5))].map((_, i) => (
                  <div key={i} className="w-2 h-2 rounded-full bg-amber-400 border border-white shadow-sm" />
               ))}
             </div>
          )}
        </div>
      </div>

      <div className="flex-1"></div>
    </motion.div>
  );
});

const AdventurePage: React.FC<AdventurePageProps> = ({ 
  onClose, 
  onCompleteLevel, 
  onReward, 
  stats, 
  onUpdateStats, 
  initialLevelId,
  onConsumedLevelId 
}) => {
  const [step, setStep] = useState<AdventureStep>('SETUP');
  const [cardsPerDay, setCardsPerDay] = useState<5 | 10>(5);
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel>(() => {
    const saved = localStorage.getItem('selected_adventure_difficulty');
    return (saved as any) || 'PRIMARY';
  });
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  const [localCompletedLevels, setLocalCompletedLevels] = useState<number[]>([]);
  const [localMasteredLevels, setLocalMasteredLevels] = useState<number[]>([]);

  useEffect(() => {
    if (stats.completedLevelIds) {
      setLocalCompletedLevels(stats.completedLevelIds.map(Number));
    }
    if (stats.masteredLevelIds) {
      setLocalMasteredLevels(stats.masteredLevelIds.map(Number));
    }
  }, [stats.completedLevelIds, stats.masteredLevelIds]);

  const completedLevels = useMemo(() => localCompletedLevels, [localCompletedLevels]);
  const masteredLevels = useMemo(() => localMasteredLevels, [localMasteredLevels]);
  const [activeLevel, setActiveLevel] = useState<Level | null>(null);
  const [reviewSchedules, setReviewSchedules] = useState<Record<string, { nextReviewAt: number, intervalDays: number, levelId: number }>>({});
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncedImages, setSyncedImages] = useState<Record<string, string>>({});
  const [showMasteryPrompt, setShowMasteryPrompt] = useState(false);

  useEffect(() => {
    if (stats.reviewSchedules) {
      setReviewSchedules(stats.reviewSchedules);
    }
  }, [stats.reviewSchedules]);

  useEffect(() => {
    const saved = localStorage.getItem('adventure_synced_images');
    if (saved) {
      setSyncedImages(JSON.parse(saved));
    }
  }, []);

  const syncImage = async (wordText: string) => {
    if (isSyncing) return;
    const ai = getAi();
    if (!ai) {
      console.warn("AI service not available. Please check your API key.");
      return;
    }
    setIsSyncing(true);
    try {
      const prompt = `High-end 2D Cel-shaded digital painting of "${wordText}". Chibi style, vibrant colors, clean line art, white background, magical fantasy theme.`;
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: prompt }] },
        config: { imageConfig: { aspectRatio: "1:1" } }
      });

      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            const base64 = `data:image/png;base64,${part.inlineData.data}`;
            setSyncedImages(prev => {
              const updated = { ...prev, [wordText]: base64 };
              localStorage.setItem('adventure_synced_images', JSON.stringify(updated));
              return updated;
            });
            break;
          }
        }
      }
    } catch (error) {
      console.error("Sync error:", error);
    } finally {
      setIsSyncing(false);
    }
  };

  // Learning/Test session state
  const [cardIndex, setCardIndex] = useState(0);
  const [activeWordIdx, setActiveWordIdx] = useState(0);

  useEffect(() => {
    setActiveWordIdx(0);
  }, [cardIndex]);
  const [streak, setStreak] = useState(() => {
    const saved = localStorage.getItem('adventure_streak');
    return saved ? parseInt(saved, 10) : 0;
  });

  useEffect(() => {
    localStorage.setItem('adventure_streak', streak.toString());
  }, [streak]);
  const [combo, setCombo] = useState(0);
  const [showCombo, setShowCombo] = useState(false);
  const [testQuestions, setTestQuestions] = useState<{ word: WordItem, options?: string[], correct: string, type: 'CHOICE' | 'SPELLING' }[]>([]);
  const [testAnswers, setTestAnswers] = useState<boolean[]>([]);
  const [testResult, setTestResult] = useState<{ score: number, passed: boolean } | null>(null);
  const [wrongOptions, setWrongOptions] = useState<string[]>([]);
  const [shuffledLetters, setShuffledLetters] = useState<string[]>([]);
  const [selectedLetters, setSelectedLetters] = useState<string[]>([]);
  const [spellingInput, setSpellingInput] = useState('');

  // Load progress
  useEffect(() => {
    if (stats.cardsPerDay) {
      setCardsPerDay(stats.cardsPerDay as 5 | 10);
      setStep('MAP');
    }
  }, [stats.cardsPerDay]);

  // Save progress
  const saveProgress = (newCompleted: number[], newMastered: number[], perDay: number = cardsPerDay, newSchedules?: Record<string, any>) => {
    setLocalCompletedLevels(newCompleted);
    setLocalMasteredLevels(newMastered);
    if (newSchedules) setReviewSchedules(newSchedules);
    
    onUpdateStats({
      completedLevelIds: newCompleted,
      masteredLevelIds: newMastered,
      reviewSchedules: newSchedules || reviewSchedules,
      cardsPerDay: perDay
    } as any);
  };

  const [showLevelModeSelector, setShowLevelModeSelector] = useState(false);
  const [spellingWord, setSpellingWord] = useState<WordItem | null>(null);

  // Scroll to top when step changes
  useEffect(() => {
    const container = document.getElementById('adventure-content-container');
    if (container) {
      container.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [step]);

  // Generate levels
  const levels = useMemo(() => {
    const generatedLevels: Level[] = [];
    const now = Date.now();
    
    // Creative level names
    const adventureNames = [
      "启程之森", "萤火幽谷", "鸣蝉林径", "翡翠湿地", "幻影草甸", 
      "碎星海滩", "迷失荒原", "遗忘部落", "岩石旷野", "回声峡谷",
      "云端阶梯", "寒风岭", "极寒冰原", "极光之林", "璀璨洞窟",
      "岩浆脉动", "炽热之心", "飞石之路", "圣地入口", "月神祭坛",
      "星轨回廊", "梦幻湖泊", "魔法学院", "知识塔林", "破晓平原",
      "暮色小镇", "幽灵废墟", "远古码头", "迷心沼泽", "龙息高地",
      "飞龙谷", "守护之巅", "光明圣殿", "无尽深渊", "终焉之地",
      "归途港湾", "时光港口", "时空裂缝", "虚空境界", "最终祭坛",
      "永恒之塔", "星辉殿堂", "生命古树", "混沌裂隙", "晨曦之光",
      "黄金之城", "荒岛余生", "秘密花园", "深海之渊", "极光之巅",
      "雷鸣峡谷", "风语平原", "暗影迷宫", "秩序之塔", "古神遗迹",
      "星海战境", "幽蓝冰洞", "炽焰荒漠", "流沙古堡", "幻象之都",
      "荆棘王座", "凛冬要塞", "暖春溪谷", "盛夏群岛", "金秋麦浪",
      "永夜之国", "极昼之岛", "空中花园", "量子荒野", "遗失世界",
      "命运阶梯", "真理圣殿", "虚幻泡影", "轮回法阵", "起源之地",
      "光影回廊", "元素祭坛", "空谷寻宝", "迷雾山脉", "落日之森"
    ];

    const cardsOfDifficulty = ALL_CARDS.filter(card => (card.difficulty || 'PRIMARY') === selectedDifficulty);

    let offset = 0;
    if (selectedDifficulty === 'INTERMEDIATE') offset = 100;
    if (selectedDifficulty === 'ADVANCED') offset = 200;

    for (let i = 0; i < cardsOfDifficulty.length; i += cardsPerDay) {
      const relativeId = Math.floor(i / cardsPerDay) + 1;
      const levelId = offset + relativeId;
      const levelCards = cardsOfDifficulty.slice(i, i + cardsPerDay);
      
      const isCompleted = completedLevels.includes(levelId);
      const isMastered = masteredLevels.includes(levelId);
      const prevLevelCompleted = relativeId === 1 || completedLevels.includes(levelId - 1);

      const schedule = reviewSchedules[levelId.toString()];
      const isDue = schedule && now >= schedule.nextReviewAt;

      generatedLevels.push({
        id: levelId,
        displayId: relativeId,
        name: adventureNames[(levelId - 1) % adventureNames.length],
        cards: levelCards,
        isUnlocked: relativeId === 1 || isCompleted || isMastered || prevLevelCompleted,
        isCompleted,
        isMastered,
        // @ts-ignore
        isDue: isDue,
        // @ts-ignore
        intervalDays: schedule?.intervalDays || 0
      });
    }
    return generatedLevels;
  }, [selectedDifficulty, cardsPerDay, completedLevels, masteredLevels, reviewSchedules]);

  // Trigger initial level review if requested
  useEffect(() => {
    if (initialLevelId && levels.length > 0 && (step === 'MAP' || step === 'SETUP')) {
      const level = levels.find(l => l.id === initialLevelId);
      if (level && level.isUnlocked) {
        console.log('[Adventure] Auto-starting review for level:', initialLevelId);
        setActiveLevel(level);
        startChallenge(level);
        
        // Notify parent that we've handled this ID
        if (onConsumedLevelId) {
          onConsumedLevelId();
        }
      }
    }
  }, [initialLevelId, levels, step, onConsumedLevelId]);

  // Derive current level from levels array to avoid stale state issues
  const currentActiveLevel = useMemo(() => {
    if (!activeLevel) return null;
    return levels.find(l => l.id === activeLevel.id) || activeLevel;
  }, [activeLevel, levels]);

  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [xpPopups, setXpPopups] = useState<{ id: number, xp: number, x: number, y: number }[]>([]);

  const motivationalQuotes = [
    "你简直是个魔法天才！🐯",
    "发音真标准，皮皮为你点赞！✨",
    "每一张卡片都是你的魔法能量！🔥",
    "保持这个节奏，你就是最强大师！🏆",
    "好厉害，又掌握了一个新咒语！🪄",
    "你的进步比火箭还快！🚀",
    "皮皮觉得你今天状态满分！💯",
  ];

  const triggerFeedback = () => {
    const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
    setFeedbackMessage(randomQuote);
    setTimeout(() => setFeedbackMessage(null), 3500);
  };

  const showXpPopup = (xp: number) => {
    const id = Date.now();
    const x = 50 + (Math.random() * 20 - 10); // Center-ish
    const y = 30 + (Math.random() * 20 - 10);
    setXpPopups(prev => [...prev, { id, xp, x, y }]);
    setTimeout(() => {
      setXpPopups(prev => prev.filter(p => p.id !== id));
    }, 2000);
  };

  const awardRewards = (earnedXp: number, earnedCoins: number) => {
    showXpPopup(earnedXp);
    onReward?.(earnedXp, earnedCoins);
    // Explicitly update local stats to ensure UI reacts immediately
    onUpdateStats({
      xp: (stats.xp || 0) + earnedXp,
      starCoins: (stats.starCoins || 0) + earnedCoins
    } as any);
    
    // Occasionally show tiger praise
    if (Math.random() > 0.7) {
      triggerFeedback();
    }
  };

  const startLevel = (level: Level) => {
    console.log('[Adventure] Clicked level icon on map:', level.id);
    setActiveLevel(level);
    
    if (!level.isUnlocked) {
      setShowMasteryPrompt(true);
      return;
    }

    // If already unlocked, show mode selector
    setShowLevelModeSelector(true);
  };

  const startLearningMode = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    
    console.log('[Adventure] Attempting to start LEARN mode', activeLevel?.id);

    // We want to use the fresh level data from our derived levels list
    const targetId = activeLevel?.id;
    const freshLevel = levels.find(l => l.id === targetId);
    
    if (!freshLevel) {
      console.warn('[Adventure] No target level found for learning mode', targetId);
      setStep('MAP');
      setShowLevelModeSelector(false);
      return;
    }

    console.log('[Adventure] Starting LEARN mode for Level:', freshLevel.id);
    
    // Set active level to the fresh one just in case
    setActiveLevel(freshLevel);
    setCardIndex(0);
    setStep('LEARN');
    setShowLevelModeSelector(false);
  };

  const startReviewMode = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }

    console.log('[Adventure] Attempting to start REVIEW mode', activeLevel?.id);

    const targetId = activeLevel?.id;
    const freshLevel = levels.find(l => l.id === targetId);
    
    if (!freshLevel) {
      console.warn('[Adventure] No target level found for review mode', targetId);
      setStep('MAP');
      setShowLevelModeSelector(false);
      return;
    }

    console.log('[Adventure] Starting REVIEW mode for Level:', freshLevel.id);
    
    setShowLevelModeSelector(false);
    startChallenge(freshLevel);
  };

  const startChallenge = (level: Level) => {
    console.log('[Adventure] Preparing Challenge Questions for level:', level.id);
    setActiveLevel(level);
    
    const words = level.cards.flatMap(c => c.words);
    const allWords = ALL_CARDS.flatMap(c => c.words);
    
    // Phase 1: Choice (English -> Chinese)
    const choiceQuestions = words.map(word => {
      const options = [word.translation];
      while (options.length < 4) {
        const randomWord = allWords[Math.floor(Math.random() * allWords.length)];
        if (!options.includes(randomWord.translation)) {
          options.push(randomWord.translation);
        }
      }
      return {
        word,
        options: options.sort(() => Math.random() - 0.5),
        correct: word.translation,
        type: 'CHOICE' as const
      };
    }).sort(() => Math.random() - 0.5);

    // Phase 2: Spelling (Chinese -> English)
    const spellingQuestions = words.map(word => ({
      word,
      correct: word.text,
      type: 'SPELLING' as const
    })).sort(() => Math.random() - 0.5);
    
    setTestQuestions([...choiceQuestions, ...spellingQuestions]);
    setTestAnswers([]);
    setCardIndex(0);
    setCombo(0);
    setSpellingInput('');
    setWrongOptions([]);
    setStep('TEST');
    setTestResult(null);
    setShowMasteryPrompt(false);
  };

  useEffect(() => {
    if (step === 'TEST' && testQuestions[cardIndex]) {
      const currentQuestion = testQuestions[cardIndex];
      // Auto-pronounce English word in Choice stage
      if (currentQuestion.type === 'CHOICE') {
        audio.speak(currentQuestion.word.text);
      }
      
      // Prepare spelling letters
      if (currentQuestion.type === 'SPELLING') {
        const letters = currentQuestion.word.text.split('').sort(() => Math.random() - 0.5);
        setShuffledLetters(letters);
        setSelectedLetters([]);
      }
      
      setWrongOptions([]);
    }
  }, [step, cardIndex, testQuestions]);

  const handleTestAnswer = (answer: string) => {
    const currentQuestion = testQuestions[cardIndex];
    const isCorrect = answer.toLowerCase().trim() === currentQuestion.correct.toLowerCase().trim();
    
    if (isCorrect) {
      audio.playSuccess();
      const newCombo = combo + 1;
      setCombo(newCombo);
      if (newCombo > 1) setShowCombo(true);
      
      const xpReward = 5;
      const coinReward = 1 + (newCombo >= 5 ? 2 : 0);
      awardRewards(xpReward, coinReward);

      confetti({
        particleCount: 30,
        spread: 40,
        origin: { y: 0.7 },
        colors: ['#10b981', '#34d399']
      });
      
      const newAnswers = [...testAnswers, true];
      setTestAnswers(newAnswers);
      
      if (cardIndex < testQuestions.length - 1) {
        setCardIndex(prev => prev + 1);
      } else {
        const correctCount = newAnswers.filter(a => a).length;
        const score = Math.round((correctCount / testQuestions.length) * 100);
        const passed = score >= 60;
        
        setTestResult({ score, passed });
        
        if (passed) {
          const currentId = currentActiveLevel!.id;
          
          const newMastered = [...new Set([...masteredLevels, currentId])];
          const newCompleted = [...new Set([...completedLevels, currentId])];
          
          // SRS Logic
          const SRS_INTERVALS = [0, 1, 3, 7, 14, 30, 60, 90];
          const currentSchedule = reviewSchedules[currentId.toString()];
          const currentIntervalIdx = currentSchedule ? SRS_INTERVALS.indexOf(currentSchedule.intervalDays) : 0;
          const nextInterval = SRS_INTERVALS[Math.min(currentIntervalIdx + 1, SRS_INTERVALS.length - 1)] || 1;
          
          const newSchedules = {
            ...reviewSchedules,
            [currentId.toString()]: {
              levelId: currentId,
              nextReviewAt: Date.now() + nextInterval * 24 * 60 * 60 * 1000,
              intervalDays: nextInterval
            }
          };

          setActiveLevel(levels.find(l => l.id === currentId) || null);
          saveProgress(newCompleted, newMastered, cardsPerDay, newSchedules);
          awardRewards(100, 50);
          
          audio.playCheer();
          confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        }
      }
    } else {
      audio.playError();
      setCombo(0);
      setShowCombo(false);
      if (currentQuestion.type === 'CHOICE') {
        setWrongOptions(prev => [...prev, answer]);
      } else {
        // Spelling: clear and let them try again
        setSelectedLetters([]);
        const letters = currentQuestion.word.text.split('').sort(() => Math.random() - 0.5);
        setShuffledLetters(letters);
      }
    }
  };

  const handleLetterClick = (letter: string, index: number) => {
    const newSelected = [...selectedLetters, letter];
    setSelectedLetters(newSelected);
    
    // Remove one instance of the letter from shuffled
    const newShuffled = [...shuffledLetters];
    newShuffled.splice(index, 1);
    setShuffledLetters(newShuffled);
    
    const currentQuestion = testQuestions[cardIndex];
    if (newSelected.length === currentQuestion.word.text.length) {
      handleTestAnswer(newSelected.join(''));
    }
  };

  const handleRemoveLetter = (index: number) => {
    const letter = selectedLetters[index];
    const newSelected = [...selectedLetters];
    newSelected.splice(index, 1);
    setSelectedLetters(newSelected);
    
    setShuffledLetters(prev => [...prev, letter]);
  };

  useEffect(() => {
    if (showCombo) {
      const timer = setTimeout(() => setShowCombo(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [showCombo, combo]);

  const startReview = () => {
    if (currentActiveLevel) {
      startChallenge(currentActiveLevel);
    } else {
      setStep('MAP');
    }
  };

  const startTest = () => {
    if (currentActiveLevel) startChallenge(currentActiveLevel);
  };

  const nextLearn = () => {
    if (!currentActiveLevel) return;
    
    // Positive feedback for finishing a card
    if (Math.random() > 0.5) triggerFeedback();
    showXpPopup(5);

    if (cardIndex < currentActiveLevel.cards.length - 1) {
      setCardIndex(prev => prev + 1);
    } else {
      if (step === 'REVIEW') {
        startTest();
      } else if (step === 'LEARN') {
        // Finishing a level in LEARN mode increments streak
        setStreak(prev => prev + 1);
        setStep('DUBBING');
      } else {
        try {
          const currentId = currentActiveLevel.id;
          const newCompleted = [...new Set([...completedLevels, currentId])];
          saveProgress(newCompleted, masteredLevels);
          
          // Reward for finishing learning level: 50 XP, 20 Coins
          awardRewards(50, 20);
          
          setStep('COMPLETE');
          
          // Optional: slight delay for confetti to ensure UI has rendered
          setTimeout(() => {
            confetti({ 
              particleCount: 150, 
              spread: 70, 
              origin: { y: 0.6 },
              zIndex: 200
            });
          }, 100);
        } catch (error) {
          console.error("Error finalizing learning step:", error);
          // Fallback to ensure user isn't stuck
          setStep('COMPLETE');
        }
      }
    }
  };

  const speakRhyme = (rhyme: string) => {
    // Remove content inside brackets/parentheses (the Chinese translations)
    const cleanRhyme = rhyme.replace(/\([^)]*\)|（[^）]*）/g, '').replace(/\s+/g, ' ').trim();
    audio.speak(cleanRhyme);
  };

  const handleNextLevel = () => {
    const currentId = activeLevel?.id || 0;
    const nextLevelId = currentId + 1;
    const nextLevel = levels.find(l => l.id === nextLevelId);
    
    if (nextLevel && nextLevel.isUnlocked) {
      console.log('[Adventure] Transitioning to Next Level:', nextLevel.id);
      setActiveLevel(nextLevel);
      setCardIndex(0);
      setStep('LEARN');
    } else {
      console.log('[Adventure] Next level either not found or locked. Returning to map.');
      setStep('MAP');
      setActiveLevel(null);
    }
  };

  const handleGoToArcade = () => {
    if (currentActiveLevel && onCompleteLevel) {
      const levelWords = currentActiveLevel.cards.flatMap(c => c.words);
      onCompleteLevel(levelWords, currentActiveLevel.id);
    }
  };

  const getRhymeFontSize = (rhyme: string) => {
    const lines = rhyme.split(/[,，.。!！?？]/).filter(l => l.trim());
    const maxLength = Math.max(...lines.map(l => l.length));
    if (maxLength > 24) return 'text-xs';
    if (maxLength > 20) return 'text-sm';
    if (maxLength > 16) return 'text-base';
    if (maxLength > 12) return 'text-lg';
    return 'text-xl';
  };

  const formatInteractiveRhymeText = (text: string, suffix: string = '') => {
    const regex = /([a-zA-Z]+)\s*(（[^）]+）|\([^)]+\))?/g;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(<span key={`text-${lastIndex}`} className="text-emerald-950 font-black text-xl md:text-2xl">{text.substring(lastIndex, match.index)}</span>);
      }
      const englishWord = match[1];
      const translation = match[2] || '';
      
      const isSuffixWord = suffix ? (englishWord.toLowerCase().endsWith(suffix.toLowerCase()) || englishWord.toLowerCase().includes(suffix.toLowerCase())) : false;

      parts.push(
        <motion.span 
          key={`word-${match.index}`}
          whileHover={{ scale: 1.15, rotate: -1.5 }}
          whileTap={{ scale: 0.9 }}
          onClick={(e) => {
            e.stopPropagation();
            audio.playPop();
            audio.speak(englishWord);
          }}
          className={`inline-flex items-center mx-1.5 px-4 py-1.5 rounded-[22px] font-black text-xl md:text-2xl shadow-md cursor-pointer select-none transition-all ${
            isSuffixWord 
              ? 'bg-gradient-to-r from-amber-300 to-yellow-400 border-2 border-amber-200 text-slate-900 shadow-amber-500/10'
              : 'bg-white border-2 border-slate-200 text-slate-800'
          }`}
        >
          {englishWord}
          {translation && (
            <span className={`text-[12px] md:text-[13px] font-extrabold ml-1.5 px-2 py-0.5 rounded-lg ${
              isSuffixWord 
                ? 'bg-amber-950/10 text-amber-950/80' 
                : 'bg-slate-100 text-slate-500'
            }`}>
              {translation.replace(/[（）()]/g, '')}
            </span>
          )}
        </motion.span>
      );
      lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push(<span key={`text-end`} className="text-emerald-950 font-black text-xl md:text-2xl">{text.substring(lastIndex)}</span>);
    }

    return parts.length > 0 ? parts : text;
  };

  const renderSanzijingLine = (line: string, suffix: string = '') => {
    // Regex matches any English word optionally followed by translation inside parenthesis
    const regex = /([a-zA-Z]+)\s*([（(][^）)]+[）)])?/g;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(line)) !== null) {
      if (match.index > lastIndex) {
        parts.push(
          <span key={`text-${lastIndex}`} className="text-slate-800 font-extrabold text-lg md:text-xl">
            {line.substring(lastIndex, match.index)}
          </span>
        );
      }

      const englishWord = match[1];
      const translation = match[2] || '';

      const renderWordPart = () => {
        if (!suffix) {
          return <span className="text-indigo-600 font-black">{englishWord}</span>;
        }
        
        const lowerWord = englishWord.toLowerCase();
        const lowerSuffix = suffix.toLowerCase();
        
        if (lowerWord.endsWith(lowerSuffix)) {
          const rootLen = englishWord.length - suffix.length;
          const root = englishWord.substring(0, rootLen);
          const endPart = englishWord.substring(rootLen);
          return (
            <span className="font-black text-xl md:text-2xl">
              <span className="text-indigo-600">{root}</span>
              <span className="text-red-500">{endPart}</span>
            </span>
          );
        } else if (lowerWord.includes(lowerSuffix)) {
          const idx = lowerWord.indexOf(lowerSuffix);
          const part1 = englishWord.substring(0, idx);
          const part2 = englishWord.substring(idx, idx + suffix.length);
          const part3 = englishWord.substring(idx + suffix.length);
          return (
            <span className="font-black text-xl md:text-2xl">
              <span className="text-indigo-600">{part1}</span>
              <span className="text-red-500">{part2}</span>
              {part3 && <span className="text-indigo-600">{part3}</span>}
            </span>
          );
        }
        
        return <span className="text-indigo-600 font-black text-xl md:text-2xl">{englishWord}</span>;
      };

      parts.push(
        <span 
          key={`word-${match.index}`}
          onClick={(e) => {
            e.stopPropagation();
            audio.playPop();
            audio.speak(englishWord);
          }}
          className="cursor-pointer hover:underline mx-1 inline-flex items-center"
          title="点击发音"
        >
          {renderWordPart()}
          {translation && (
            <span className="text-slate-700 font-bold text-lg md:text-xl ml-1">
              {translation}
            </span>
          )}
        </span>
      );

      lastIndex = regex.lastIndex;
    }

    if (lastIndex < line.length) {
      const remaining = line.substring(lastIndex);
      parts.push(
        <span key={`text-end`} className="text-slate-800 font-extrabold text-lg md:text-xl">
          {remaining}
        </span>
      );
    }

    return parts.length > 0 ? parts : line;
  };

  const handleBack = () => {
    if (step === 'MAP' || step === 'SETUP') {
      onClose();
    } else {
      setStep('MAP');
    }
  };

  return (
    <div className="fixed inset-0 z-[60]">
      {/* Background Decor - Forest Style */}
      <div id="adventure-content-container" className="absolute inset-0 bg-emerald-50 overflow-y-auto pb-20">
        <div className="fixed inset-0 pointer-events-none opacity-40 -z-10 mix-blend-overlay">
          <div className="absolute top-40 left-10 text-8xl">🌲</div>
          <div className="absolute bottom-40 right-20 text-8xl">🌳</div>
          <div className="absolute top-1/2 right-10 text-6xl">✨</div>
        </div>

        {/* Floating XP Popups */}
        <AnimatePresence>
          {xpPopups.map(popup => (
            <motion.div
              key={popup.id}
              initial={{ opacity: 0, y: 100, x: `${popup.x}%` }}
              animate={{ opacity: 1, y: -200 }}
              exit={{ opacity: 0 }}
              className="fixed bottom-1/2 z-[1000] pointer-events-none"
            >
              <div className="flex items-center space-x-2 bg-indigo-600 text-white px-6 py-2 rounded-full shadow-2xl font-black text-2xl border-4 border-white animate-pulse">
                <Zap size={24} className="fill-white" />
                <span>+{popup.xp} XP</span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Motivational Tiger Bubble */}
        <AnimatePresence>
          {feedbackMessage && (
            <motion.div
              initial={{ opacity: 0, x: 100, y: 0 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              className="fixed bottom-24 right-4 z-[500] flex items-end space-x-3 pointer-events-none"
            >
              <div className="bg-white p-4 rounded-[28px] rounded-br-none shadow-2xl border-2 border-emerald-100 max-w-[200px] relative">
                <div className="absolute -bottom-2 right-0 w-4 h-4 bg-white border-r-2 border-b-2 border-emerald-100 rotate-45" />
                <p className="text-emerald-900 font-black text-sm leading-relaxed">
                  {feedbackMessage}
                </p>
              </div>
              <div className="w-16 h-16 bg-white rounded-3xl border-4 border-emerald-50 shadow-xl flex items-center justify-center text-3xl">
                🐯
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      {/* Header */}
      <div className="sticky top-0 bg-white/90 backdrop-blur-xl p-4 flex items-center justify-between border-b border-emerald-100 z-[100] shadow-sm">
          <button onClick={handleBack} className="p-3 hover:bg-emerald-100 rounded-2xl transition-all text-emerald-700 bg-white border-2 border-emerald-50">
            <ChevronLeft size={24} />
          </button>
           <div className="flex flex-col items-center">
            <h2 className="text-xl font-black text-emerald-900 tracking-tight">冒险森林</h2>
            <div className="flex items-center space-x-1">
               <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
               <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">魔法探险</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {streak > 0 && (
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="bg-orange-100 px-3 py-1.5 rounded-2xl flex items-center space-x-1.5 border-2 border-white shadow-sm"
              >
                <Flame className="text-orange-500 fill-orange-500" size={16} />
                <span className="font-black text-orange-700 text-sm">{streak}</span>
              </motion.div>
            )}
            <div className="bg-emerald-100 px-4 py-2 rounded-2xl flex items-center space-x-2 border-2 border-white shadow-sm">
              <Star className="text-amber-500 fill-amber-500" size={16} />
              <span className="font-black text-emerald-800 text-sm">{stats.starCoins}</span>
            </div>
          </div>
        </div>

      <div className="max-w-md mx-auto p-6 relative z-10">
      <AnimatePresence>
          {step === 'SETUP' && (
            <motion.div key="setup" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8 py-10">
              <div className="text-center space-y-4">
                <motion.div 
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="text-8xl mb-6 drop-shadow-2xl"
                >
                  🏰
                </motion.div>
                <h3 className="text-4xl font-black text-emerald-900 tracking-tight">魔法森林大冒险</h3>
                <p className="text-emerald-600 font-bold text-lg max-w-[280px] mx-auto leading-relaxed">
                  勇敢的小魔法师，准备好开启你的单词探险之旅了吗？
                </p>
              </div>

              <div className="grid gap-6">
                <motion.button 
                  whileHover={{ scale: 1.02, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { 
                    setCardsPerDay(5); 
                    setStep('MAP'); 
                    saveProgress(completedLevels, masteredLevels, 5); 
                  }} 
                  className="bg-white p-8 rounded-[40px] border-4 border-emerald-100 hover:border-emerald-500 transition-all text-left shadow-xl shadow-emerald-100/50 relative overflow-hidden group"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Star size={64} className="text-emerald-500" />
                  </div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-2xl font-black text-emerald-800">森林漫步</span>
                    <span className="bg-emerald-100 text-emerald-700 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">轻松模式</span>
                  </div>
                  <p className="text-emerald-600 font-bold">每天挑战 5 张魔法卡片</p>
                  <p className="text-[10px] font-black text-emerald-300 uppercase tracking-widest mt-4">适合初级魔法学徒</p>
                </motion.button>

                <motion.button 
                  whileHover={{ scale: 1.02, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { 
                    setCardsPerDay(10); 
                    setStep('MAP'); 
                    saveProgress(completedLevels, masteredLevels, 10); 
                  }} 
                  className="bg-white p-8 rounded-[40px] border-4 border-emerald-100 hover:border-emerald-500 transition-all text-left shadow-xl shadow-emerald-100/50 relative overflow-hidden group"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Zap size={64} className="text-amber-500" />
                  </div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-2xl font-black text-emerald-800">极速穿梭</span>
                    <span className="bg-amber-100 text-amber-700 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">极速模式</span>
                  </div>
                  <p className="text-emerald-600 font-bold">每天挑战 10 张魔法卡片</p>
                  <p className="text-[10px] font-black text-emerald-300 uppercase tracking-widest mt-4">适合高级魔法大师</p>
                </motion.button>
              </div>
            </motion.div>
          )}

          {step === 'MAP' && (
            <motion.div key="map" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
              <div className="text-center space-y-2">
                <h3 className="text-3xl font-black text-emerald-900">魔法森林地图</h3>
                <p className="text-emerald-600 font-medium">开启你的单词冒险之旅</p>
              </div>

              {/* Difficulty/Level Selector */}
              <div className="bg-white rounded-[44px] p-6 border-2 border-[#e6faf3] shadow-[0_16px_40px_-10px_rgba(16,185,129,0.08)] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 relative select-none animate-fade-in z-30">
                <div className="flex items-center space-x-4 sm:space-x-5">
                  <div className="w-[56px] h-[86px] bg-[#e6fcf5] rounded-[22px] flex items-center justify-center text-3xl shrink-0 shadow-[inset_0_2px_4px_rgba(0,0,0,0.03)] border border-[#c2f3e1]/50">
                    🗺️
                  </div>
                  <div className="flex flex-row items-center gap-4 sm:gap-6">
                    <div className="flex flex-col text-[#00c280] font-black tracking-widest text-[10px] sm:text-[11px] leading-[1.2] uppercase font-sans select-none opacity-90">
                      <span>SELECT</span>
                      <span>FOREST</span>
                      <span>STAGE</span>
                    </div>
                    <div className="flex flex-col text-slate-800 font-black text-xl sm:text-2xl leading-[1.2]">
                      <span>选择探险</span>
                      <span>等级</span>
                    </div>
                  </div>
                </div>

                {/* Highly Custom Interactive Dropdown Selection Pill */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => {
                      setIsDropdownOpen(!isDropdownOpen);
                      audio.playClick();
                    }}
                    className="bg-[#00c280] hover:bg-[#00b073] text-white font-extrabold px-6 py-4 rounded-[28px] shadow-lg shadow-emerald-500/15 flex items-center justify-between gap-4 text-sm sm:text-base transition-all focus:outline-none min-w-[240px] sm:min-w-[280px] active:scale-[0.98] cursor-pointer border-2 border-transparent z-40"
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-xl">
                        {selectedDifficulty === 'PRIMARY' ? '🌱' : selectedDifficulty === 'INTERMEDIATE' ? '🧭' : '🧙‍♂️'}
                      </span>
                      <span>
                        {selectedDifficulty === 'PRIMARY' ? '初级拼读 (Beginner)' : selectedDifficulty === 'INTERMEDIATE' ? '中级拼读 (Intermediate)' : '高级拼读 (Advanced)'}
                      </span>
                    </div>
                    <ChevronDown size={18} className={`transition-transform duration-300 text-white/90 shrink-0 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {isDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 15, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 15, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="absolute right-0 top-full mt-3 bg-white border-2 border-[#e6faf3] rounded-[30px] p-3 shadow-[0_20px_50px_rgba(16,185,129,0.12)] min-w-[280px] z-50 flex flex-col gap-1.5"
                      >
                        {[
                          { key: 'PRIMARY', label: '初级拼读', english: 'Beginner', icon: '🌱' },
                          { key: 'INTERMEDIATE', label: '中级拼读', english: 'Intermediate', icon: '🧭' },
                          { key: 'ADVANCED', label: '高级拼读', english: 'Advanced', icon: '🧙‍♂️' }
                        ].map((item) => {
                          const isSelected = selectedDifficulty === item.key;
                          return (
                            <button
                              key={item.key}
                              onClick={() => {
                                setSelectedDifficulty(item.key as DifficultyLevel);
                                localStorage.setItem('selected_adventure_difficulty', item.key);
                                setIsDropdownOpen(false);
                                audio.playClick();
                              }}
                              className={`flex items-center justify-between px-4.5 py-3.5 rounded-[22px] transition-all text-left font-black text-sm select-none cursor-pointer ${
                                isSelected
                                  ? 'bg-[#e6fcf5] text-[#00c280] border border-[#c2f3e1]'
                                  : 'text-slate-600 hover:bg-slate-50 border border-transparent hover:text-slate-900'
                              }`}
                            >
                              <div className="flex items-center space-x-2.5">
                                <span className="text-lg">{item.icon}</span>
                                <span>
                                  {item.label} <span className={`text-xs font-bold ${isSelected ? 'text-[#00c280]/70' : 'text-slate-400'}`}>({item.english})</span>
                                </span>
                              </div>
                              {isSelected && (
                                <div className="w-2 h-2 rounded-full bg-[#00c280] animate-pulse shrink-0" />
                              )}
                            </button>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
              
              <div className="bg-white/60 backdrop-blur-sm rounded-[32px] p-6 border-2 border-emerald-100 shadow-sm flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-emerald-500 text-white p-2.5 rounded-2xl shadow-lg shadow-emerald-100"><Trophy size={24} /></div>
                  <div>
                    <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest leading-none mb-1">Adventure Progress</p>
                    <p className="text-xl font-black text-emerald-900 leading-none">{masteredLevels.length} / {levels.length} <span className="text-sm font-bold opacity-40">Mastered</span></p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button onClick={() => setStep('SETUP')} className="bg-emerald-100 p-3 rounded-2xl text-emerald-600 hover:bg-emerald-200 transition-all" title="切换模式"><RefreshCw size={18} /></button>
                  <button 
                    onClick={() => {
                      if (window.confirm('确定要重置所有冒险进度吗？')) {
                        localStorage.removeItem('adventure_forest_progress');
                        onUpdateStats({ completedLevelIds: [], masteredLevelIds: [] });
                        setStep('SETUP');
                      }
                    }} 
                    className="bg-rose-100 p-3 rounded-2xl text-rose-600 hover:bg-rose-200 transition-all" 
                    title="重置进度"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <div className="relative py-10 px-4 min-h-[600px] rounded-[40px] overflow-hidden">
                {/* Map Background Decor */}
                <div className="absolute inset-0 -z-10 opacity-20 pointer-events-none">
                  <div className="absolute top-10 left-10 text-6xl pointer-events-none">🌲</div>
                  <div className="absolute top-40 right-10 text-6xl pointer-events-none">🌳</div>
                  <div className="absolute bottom-20 left-20 text-6xl pointer-events-none">🍄</div>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[200px] opacity-10 pointer-events-none">🗺️</div>
                </div>

                {/* Path Line */}
                <div className="absolute left-1/2 top-0 bottom-0 w-3 bg-emerald-100/50 -translate-x-1/2 rounded-full overflow-hidden pointer-events-none">
                   <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: `${(masteredLevels.length / levels.length) * 100}%` }}
                    className="w-full bg-emerald-400"
                   />
                </div>

                <div className="space-y-16 relative z-20">
                  {levels.map((level, index) => (
                    <LevelNode 
                      key={level.id}
                      level={level}
                      index={index}
                      isLocked={!level.isUnlocked}
                      isCurrent={level.isUnlocked && !level.isMastered}
                      onSelect={startLevel}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {(step === 'LEARN' || step === 'REVIEW') && currentActiveLevel && (
            <motion.div key={`learn-${currentActiveLevel.id}`} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6 py-6">
              {currentActiveLevel.cards.length > 0 ? (
                <>
                  <div className="flex items-center justify-between px-2">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest leading-none mb-1">
                        {step === 'REVIEW' ? '复习模式' : currentActiveLevel.name}
                      </span>
                      <h3 className="text-2xl font-black text-emerald-900 leading-none">
                        {step === 'REVIEW' ? `第 ${(currentActiveLevel as any).displayId || currentActiveLevel.id} 关复习` : `第 ${(currentActiveLevel as any).displayId || currentActiveLevel.id} 关`}
                      </h3>
                    </div>
                    <div className="bg-white px-4 py-2 rounded-2xl border-2 border-emerald-100 font-black text-emerald-700 text-sm">
                      {cardIndex + 1} <span className="opacity-30 mx-1">/</span> {currentActiveLevel.cards.length}
                    </div>
                  </div>

                  <div className="bg-white rounded-[48px] p-8 shadow-[0_40px_80px_-24px_rgba(6,78,59,0.12)] border-b-[8px] border-emerald-100/50 space-y-10 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full -mr-16 -mt-16 opacity-50 pointer-events-none group-hover:scale-110 transition-transform duration-700" />
                    
                    {/* Top: 3 words parallel layout */}
                    <div className="grid grid-cols-3 gap-3 sm:gap-4 relative z-10">
                      {(currentActiveLevel?.cards?.[cardIndex]?.words || []).map((word, i) => {
                        const isSelected = activeWordIdx === i;
                        const wordSuffix = currentActiveLevel?.cards?.[cardIndex]?.suffix || currentActiveLevel?.suffix || '';
                        
                        return (
                          <motion.div 
                            key={i} 
                            whileHover={{ scale: 1.05, y: -4 }}
                            whileTap={{ scale: 0.96 }}
                            onClick={() => {
                              audio.playPop();
                              setActiveWordIdx(i);
                              audio.speak(word.text);
                            }} 
                            className={`flex flex-col items-center p-3 rounded-[28px] cursor-pointer border-2 transition-all relative ${
                              isSelected 
                                ? 'bg-indigo-50/60 border-indigo-200 shadow-md ring-2 ring-indigo-100' 
                                : 'bg-slate-50 border-slate-100 hover:border-slate-200 hover:bg-white shadow-sm'
                            }`}
                          >
                            <div className="w-full aspect-square bg-white rounded-2xl mb-2.5 flex items-center justify-center p-2 shadow-inner relative group/img overflow-hidden">
                              <SafeImage 
                                src={syncedImages[word.text] || word.imageUrl} 
                                alt={word.text} 
                                className="w-full h-full object-contain"
                                fallbackText={word.text}
                                width="72"
                                height="72"
                              />
                              <button 
                                onClick={(e) => { e.stopPropagation(); syncImage(word.text); }}
                                disabled={isSyncing}
                                className="absolute bottom-1 right-1 p-1 bg-emerald-500 text-white rounded-lg shadow-sm opacity-0 group-hover/img:opacity-100 transition-opacity disabled:opacity-50 z-20"
                                title="魔法同步由AI生成新插图"
                              >
                                {isSyncing ? <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Wand2 size={11} />}
                              </button>
                            </div>
                            
                            <div className="text-center w-full">
                              <span className="text-base sm:text-lg font-black text-slate-800 tracking-tight leading-none block mb-1">
                                {(() => {
                                  if (!wordSuffix) return <span>{word.text}</span>;
                                  
                                  const text = word.text;
                                  const lowerWord = text.toLowerCase();
                                  const lowerSuffix = wordSuffix.toLowerCase();
                                  
                                  if (lowerWord.endsWith(lowerSuffix)) {
                                    const rootLen = text.length - wordSuffix.length;
                                    const root = text.substring(0, rootLen);
                                    const endPart = text.substring(rootLen);
                                    return (
                                      <span>
                                        <span className="text-slate-800">{root}</span>
                                        <span className="text-red-500 font-extrabold">{endPart}</span>
                                      </span>
                                    );
                                  } else if (lowerWord.includes(lowerSuffix)) {
                                    const idx = lowerWord.indexOf(lowerSuffix);
                                    const part1 = text.substring(0, idx);
                                    const part2 = text.substring(idx, idx + wordSuffix.length);
                                    const part3 = text.substring(idx + wordSuffix.length);
                                    return (
                                      <span>
                                        <span className="text-slate-800">{part1}</span>
                                        <span className="text-red-500 font-extrabold">{part2}</span>
                                        {part3 && <span className="text-slate-800">{part3}</span>}
                                      </span>
                                    );
                                  }
                                  return <span className="text-slate-800">{text}</span>;
                                })()}
                              </span>
                              <span className="text-[11px] sm:text-xs font-bold text-slate-500 block leading-tight truncate">
                                {word.translation}
                              </span>
                            </div>

                            {/* Click to Speak/Spell buttons for individual words */}
                            <div className="mt-2 flex items-center justify-center gap-1.5 w-full">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  audio.playPop();
                                  audio.speak(word.text);
                                }}
                                className="p-1 px-1.5 bg-slate-200/50 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors"
                                title="发音"
                              >
                                <Volume2 size={12} />
                              </button>
                              
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  audio.playPop();
                                  setSpellingWord(word);
                                }}
                                className="px-2 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg font-extrabold text-[10px] flex items-center space-x-0.5 transition-colors"
                                title="拼写闯关"
                              >
                                <Sparkles size={9} className="text-amber-650" />
                                <span>拼写</span>
                              </button>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>

                    {/* Bottom: Rhyme - Structured perfectly matching the screenshot */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-center space-x-3 px-4">
                        <div className="h-px flex-1 bg-slate-100" />
                        <span className="text-[10px] font-black text-slate-350 uppercase tracking-[0.3em]">Magical Rhyme 三字经拼读</span>
                        <div className="h-px flex-1 bg-slate-100" />
                      </div>
                      
                      {currentActiveLevel.cards[cardIndex] && (
                        <div className="bg-[#f8fafc] border-2 border-slate-100/70 p-6 sm:p-8 rounded-[36px] w-full flex flex-col justify-center space-y-4 relative group">
                          <div className={`space-y-3.5 w-full justify-center flex flex-col items-center ${getRhymeFontSize(currentActiveLevel.cards[cardIndex].rhyme)}`}>
                            {currentActiveLevel.cards[cardIndex].rhyme.split(/[,，.。!！?？]/).filter(s => s.trim()).map((line, idx) => (
                              <div key={idx} className="flex flex-wrap justify-center items-center drop-shadow-sm font-black text-center whitespace-nowrap leading-relaxed tracking-wide">
                                {renderSanzijingLine(line, currentActiveLevel.cards[cardIndex]?.suffix || currentActiveLevel.suffix || '')}
                              </div>
                            ))}
                          </div>

                          <div className="pt-2 flex flex-col items-center justify-center border-t border-slate-100/50 space-y-2">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => speakRhyme(currentActiveLevel.cards[cardIndex].rhyme)}
                              className="px-5 py-2 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 font-extrabold text-xs flex items-center space-x-1.5 shadow-sm hover:bg-indigo-100 transition-colors"
                            >
                              <Volume2 size={14} className="text-indigo-500 animate-pulse" />
                              <span>聆听整句三字经 Chanting!</span>
                            </motion.button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Mastery Level Info in UI */}
                    {/* @ts-ignore */}
                    {currentActiveLevel.intervalDays > 0 && (
                      <div className="bg-amber-50 rounded-3xl p-4 flex items-center space-x-4 border border-amber-100 mb-2">
                        <div className="bg-amber-400 p-2 rounded-xl text-white">
                           <Star size={16} className="fill-white" />
                        </div>
                        <div className="flex-1">
                          <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest leading-none mb-1">记忆强度</p>
                          <div className="flex items-center space-x-0.5">
                            {/* @ts-ignore */}
                            {[...Array(8)].map((_, i) => {
                              // @ts-ignore
                              const isActive = i < [0, 1, 3, 7, 14, 30, 60, 90].indexOf(currentActiveLevel.intervalDays);
                              return (
                                <div key={i} className={`h-1.5 flex-1 rounded-full ${isActive ? 'bg-amber-400' : 'bg-amber-100'}`} />
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 gap-4">
                      <button 
                        onClick={nextLearn} 
                        className="flex-1 py-6 bg-emerald-100 text-emerald-700 rounded-[32px] font-black text-xl flex items-center justify-center space-x-3 hover:bg-emerald-500 hover:text-white transition-all shadow-lg shadow-emerald-50 group"
                      >
                        <span>{cardIndex === currentActiveLevel.cards.length - 1 ? (step === 'REVIEW' ? '开始测试' : '完成学习') : '下一张'}</span>
                        <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-20 bg-white rounded-[48px] shadow-xl border-2 border-emerald-50">
                  <p className="text-emerald-800 font-black">正在初始化魔法卡片...</p>
                  <button onClick={() => setStep('MAP')} className="mt-4 text-emerald-500 font-bold underline">返回地图</button>
                </div>
              )}
            </motion.div>
          )}

          {step === 'DUBBING' && currentActiveLevel && (
            <div className="py-2 h-[80vh] min-h-[450px] flex flex-col">
              <VoiceDubbing 
                language="zh-CN"
                title={`${currentActiveLevel.name} • 魔法配音`}
                items={currentActiveLevel.cards.map((card, i) => ({
                  id: `dub-${currentActiveLevel.id}-${i}`,
                  text: card.rhyme,
                  translation: '大声读出你的魔法口诀吧！',
                  imageUrl: card.words[0]?.imageUrl || 'https://img.icons8.com/clouds/200/microphone.png'
                }))}
                onFinish={(score) => {
                  try {
                    const currentId = currentActiveLevel.id;
                    const newCompleted = [...new Set([...completedLevels, currentId])];
                    saveProgress(newCompleted, masteredLevels);
                    
                    // Extra reward for dubbing
                    awardRewards(20, 10);
                    
                    setStep('COMPLETE');
                    setTimeout(() => {
                      confetti({ 
                        particleCount: 150, 
                        spread: 70, 
                        origin: { y: 0.6 },
                        zIndex: 200
                      });
                    }, 100);
                  } catch (e) {
                    setStep('COMPLETE');
                  }
                }}
                onClose={() => setStep('MAP')}
              />
            </div>
          )}

          {step === 'TEST' && (
            <motion.div key="test" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 py-6">
              <div className="flex items-center justify-between px-2">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-rose-400 uppercase tracking-widest leading-none mb-1">魔法测试</span>
                  <h3 className="text-2xl font-black text-slate-800 leading-none">第 {activeLevel?.id} 关</h3>
                </div>
                <div className="bg-white px-4 py-2 rounded-2xl border-2 border-rose-100 font-black text-rose-600 text-sm">
                  {cardIndex + 1} / {testQuestions.length}
                </div>
              </div>

              {/* Combo Display - Ultra Polished */}
              <AnimatePresence>
                {showCombo && combo > 1 && (
                  <motion.div 
                    initial={{ scale: 0, y: 50, opacity: 0 }}
                    animate={{ scale: 1, y: 0, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0, y: -50 }}
                    key={`combo-${combo}`}
                    className="fixed top-24 left-1/2 -translate-x-1/2 z-[300] pointer-events-none"
                  >
                    <div className="relative group scale-90 md:scale-100">
                      {/* Glow Behind */}
                      <div className="absolute inset-0 bg-amber-400 rounded-full blur-2xl opacity-40 animate-pulse" />
                      
                      <div className="bg-gradient-to-br from-amber-400 via-orange-500 to-rose-600 text-white px-6 py-3 rounded-full shadow-2xl border-4 border-white flex items-center space-x-3 relative z-10">
                        <motion.div
                          animate={{ 
                            scale: [1, 1.3, 1], 
                            rotate: [0, 15, -15, 0],
                          }}
                          transition={{ repeat: Infinity, duration: 1.5 }}
                        >
                          <Zap size={24} className="fill-white" />
                        </motion.div>
                        <span className="text-2xl font-black italic tracking-tighter whitespace-nowrap">
                          连对 × {combo}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {!testResult ? (
                <div className="space-y-8">
                  {testQuestions[cardIndex] ? (
                    <>
                      <div className="bg-white rounded-[48px] p-10 shadow-2xl border-4 border-white text-center space-y-6">
                        <div className="space-y-2">
                          <p className="text-rose-400 font-black uppercase tracking-widest text-xs">
                            {testQuestions[cardIndex].type === 'CHOICE' ? '选择正确含义' : '拼写单词'}
                          </p>
                          <h2 className="text-5xl font-black text-slate-800 tracking-tight">
                            {testQuestions[cardIndex].type === 'CHOICE' ? testQuestions[cardIndex].word.text : testQuestions[cardIndex].word.translation}
                          </h2>
                        </div>
                      </div>

                      {testQuestions[cardIndex].type === 'CHOICE' ? (
                        <div className="grid grid-cols-1 gap-4">
                          {testQuestions[cardIndex].options?.map((option, i) => {
                            const isWrong = wrongOptions.includes(option);
                            return (
                              <motion.button
                                key={i}
                                whileHover={isWrong ? {} : { scale: 1.02, x: 5 }}
                                whileTap={isWrong ? {} : { scale: 0.98 }}
                                animate={isWrong ? { x: [-10, 10, -10, 10, 0] } : {}}
                                transition={isWrong ? { duration: 0.4 } : {}}
                                onClick={() => !isWrong && handleTestAnswer(option)}
                                className={`p-6 rounded-[32px] border-2 transition-all text-left font-black text-xl shadow-puffy ${
                                  isWrong 
                                    ? 'bg-rose-50 border-rose-200 text-rose-300 cursor-not-allowed' 
                                    : 'bg-white border-slate-100 hover:border-emerald-500 hover:bg-emerald-50 text-slate-700'
                                }`}
                              >
                                {option}
                              </motion.button>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="space-y-10">
                          {/* Selected Letters Slots */}
                          <div className="flex flex-wrap justify-center gap-3">
                            {testQuestions[cardIndex].word.text.split('').map((_, i) => (
                              <motion.button
                                key={i}
                                onClick={() => i < selectedLetters.length && handleRemoveLetter(i)}
                                className={`w-14 h-16 rounded-2xl border-b-4 flex items-center justify-center text-3xl font-black shadow-md transition-all ${
                                  i < selectedLetters.length 
                                    ? 'bg-emerald-500 border-emerald-700 text-white' 
                                    : 'bg-white border-slate-200 text-transparent'
                                }`}
                              >
                                {selectedLetters[i]}
                              </motion.button>
                            ))}
                          </div>

                          {/* Shuffled Letters Options */}
                          <div className="flex flex-wrap justify-center gap-3 p-6 bg-white/50 rounded-[40px] border-2 border-dashed border-emerald-200">
                            {shuffledLetters.map((letter, i) => (
                              <motion.button
                                key={`${letter}-${i}`}
                                whileHover={{ scale: 1.1, y: -5 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleLetterClick(letter, i)}
                                className="w-14 h-16 bg-white rounded-2xl border-b-4 border-emerald-200 flex items-center justify-center text-3xl font-black text-emerald-600 shadow-lg hover:border-emerald-500 transition-all"
                              >
                                {letter}
                              </motion.button>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-20 text-slate-400">正在开启探险模式...</div>
                  )}
                </div>
              ) : (
                <div className="bg-white rounded-[48px] p-10 shadow-2xl border-4 border-white text-center space-y-8">
                  <div className="text-8xl">{testResult.passed ? '🏅' : '😅'}</div>
                  <div className="space-y-2">
                    <h3 className="text-3xl font-black text-slate-800">{testResult.passed ? '测试通过！' : '还需努力！'}</h3>
                    <p className="text-slate-400 font-bold">你的得分：<span className={testResult.passed ? 'text-emerald-500' : 'text-rose-500'}>{testResult.score}%</span></p>
                  </div>
                  
                  {testResult.passed ? (
                    <div className="grid gap-3">
                      <button 
                        onClick={handleNextLevel}
                        className="w-full py-5 bg-emerald-500 text-white rounded-[32px] font-black text-xl shadow-lg shadow-emerald-200"
                      >
                        进入下一关
                      </button>
                      <button 
                        onClick={() => setStep('MAP')}
                        className="w-full py-5 bg-emerald-100 text-emerald-700 rounded-[32px] font-black text-xl hover:bg-emerald-200"
                      >
                        返回地图
                      </button>
                    </div>
                  ) : (
                    <div className="grid gap-3">
                      <button 
                        onClick={startReview}
                        className="w-full py-5 bg-rose-500 text-white rounded-[32px] font-black text-xl shadow-lg shadow-rose-200"
                      >
                        重新复习
                      </button>
                      <button 
                        onClick={() => setStep('MAP')}
                        className="w-full py-5 bg-slate-100 text-slate-400 rounded-[32px] font-black text-xl"
                      >
                        返回地图
                      </button>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {step === 'COMPLETE' && (
            <motion.div key="complete" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8 py-10 text-center animate-success-pop">
              <div className="relative inline-block">
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", damping: 10, stiffness: 100 }}
                  className="text-9xl relative z-10"
                >
                  🏆
                </motion.div>
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }} className="absolute inset-0 border-4 border-dashed border-emerald-400 rounded-full -m-6" />
                <motion.div 
                  animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0.7, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 bg-amber-200 rounded-full blur-3xl -z-10"
                />
              </div>
              <div className="space-y-2">
                <h3 className="text-5xl font-black text-emerald-900 tracking-tight">登峰造极！</h3>
                <p className="text-emerald-600 font-bold text-xl">你简直是天才小法师，本关所有咒语已存入魔典</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/80 p-6 rounded-[32px] border-b-8 border-emerald-100 shadow-xl text-center transform -rotate-2">
                  <p className="text-[12px] font-black text-emerald-400 uppercase tracking-widest mb-1">XP 奖励</p>
                  <p className="text-4xl font-black text-emerald-800">+100</p>
                </div>
                <div className="bg-white/80 p-6 rounded-[32px] border-b-8 border-amber-100 shadow-xl text-center transform rotate-2">
                  <p className="text-[12px] font-black text-amber-500 uppercase tracking-widest mb-1">星星币</p>
                  <p className="text-4xl font-black text-amber-600">+50</p>
                </div>
              </div>

              <div className="space-y-4 pt-4">
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleNextLevel}
                  className="w-full py-6 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-[32px] font-black text-2xl shadow-xl shadow-emerald-100 flex items-center justify-center space-x-3 puffy-button border-b-6 border-emerald-700 active:border-b-0 active:translate-y-1 transition-all"
                >
                  <Wand2 size={28} className="fill-white" />
                  <span>冲击下一关</span>
                </motion.button>
                
                <div className="grid grid-cols-2 gap-4">
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      if (currentActiveLevel) {
                        startChallenge(currentActiveLevel);
                      }
                    }}
                    className="py-4 bg-white text-indigo-600 rounded-[28px] font-black border-2 border-indigo-50 shadow-sm flex items-center justify-center space-x-2"
                  >
                    <RefreshCw size={20} />
                    <span>这就复习</span>
                  </motion.button>
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleGoToArcade}
                    className="py-4 bg-white text-emerald-700 rounded-[28px] font-black border-2 border-emerald-50 shadow-sm flex items-center justify-center space-x-2"
                  >
                    <Gamepad2 size={20} />
                    <span>去游乐园</span>
                  </motion.button>
                </div>

                <button onClick={() => setStep('MAP')} className="text-emerald-400 font-black text-sm uppercase tracking-widest hover:text-emerald-600 transition-colors pt-4">
                  返回森林地图
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showLevelModeSelector && currentActiveLevel && (
          <div className="fixed inset-0 z-[600] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLevelModeSelector(false)}
              className="absolute inset-0 bg-emerald-950/90 backdrop-blur-xl cursor-default"
            />
            
            <motion.div 
              initial={{ scale: 0.8, y: 30, rotate: -3 }}
              animate={{ scale: 1, y: 0, rotate: 0 }}
              exit={{ scale: 0.7, opacity: 0, y: 50 }}
              onClick={(e) => e.stopPropagation()} 
              className="bg-white rounded-[56px] p-6 sm:p-10 max-w-sm w-full shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] space-y-6 sm:space-y-10 relative z-10 overflow-hidden border-4 border-emerald-50 pointer-events-auto"
            >
              <div className="absolute top-0 right-0 p-6 opacity-10 text-8xl -mr-8 -mt-8 rotate-12">⭐</div>
              <div className="text-center space-y-3 relative z-10">
                <motion.div 
                  animate={{ y: [0, -10, 0], rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-emerald-100 to-teal-50 rounded-[35px] flex items-center justify-center text-emerald-600 mx-auto mb-4 border-4 border-white shadow-xl shadow-emerald-100/50"
                >
                  <Wand2 size={40} />
                </motion.div>
                <h4 className="text-2xl sm:text-4xl font-black text-emerald-950 tracking-tight leading-tight">{currentActiveLevel.name}</h4>
                <div className="flex items-center justify-center space-x-2">
                  <div className="h-1 w-6 bg-emerald-200 rounded-full" />
                  <p className="text-emerald-700/60 font-black text-xs uppercase tracking-widest italic">
                    Magical Selection
                  </p>
                  <div className="h-1 w-6 bg-emerald-200 rounded-full" />
                </div>
              </div>

              <div className="grid gap-4 relative z-10 pb-2">
                {!currentActiveLevel.isCompleted ? (
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => startLearningMode(e)}
                    className="w-full py-5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-[28px] font-black text-xl shadow-[0_10px_25px_-5px_rgba(16,185,129,0.4)] flex items-center justify-center space-x-3 border-b-6 border-emerald-700 active:border-b-0 active:translate-y-1 transition-all cursor-pointer relative z-20"
                  >
                    <BookOpen size={28} />
                    <span>立即开始学习</span>
                  </motion.button>
                ) : (
                  <>
                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        startReviewMode(e);
                      }}
                      className={`w-full py-5 bg-gradient-to-r ${
                        currentActiveLevel.isDue ? 'from-rose-500 to-pink-600 shadow-rose-200 border-rose-700' : 'from-indigo-500 to-blue-600 shadow-indigo-200 border-indigo-700'
                      } text-white rounded-[28px] font-black text-xl shadow-[0_10px_25px_-5px_rgba(79,70,229,0.4)] flex items-center justify-center space-x-3 border-b-6 active:border-b-0 active:translate-y-1 transition-all cursor-pointer relative z-20`}
                    >
                      {currentActiveLevel.isDue ? <RefreshCw size={28} className="animate-spin-slow" /> : <Zap size={28} className="fill-white" />}
                      <span>{currentActiveLevel.isDue ? '立即开启记忆复习' : '快速温故知新'}</span>
                    </motion.button>
                    
                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        startLearningMode(e);
                      }}
                      className="w-full py-4 bg-white text-emerald-600 rounded-[24px] font-black text-lg flex items-center justify-center space-x-2 border-2 border-emerald-100 hover:bg-emerald-50 transition-all shadow-md cursor-pointer relative z-20"
                    >
                      <BookOpen size={20} />
                      <span>再次进行学习</span>
                    </motion.button>
                  </>
                )}

                <button 
                  onClick={() => setShowLevelModeSelector(false)}
                  className="w-full py-4 text-slate-400 font-black text-base uppercase tracking-widest hover:text-slate-600 transition-colors bg-slate-50 rounded-[20px] cursor-pointer"
                >
                  返回地图
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showMasteryPrompt && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-rose-950/90 backdrop-blur-xl"
          >
            <motion.div 
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-[56px] p-10 max-w-sm w-full shadow-2xl text-center space-y-8"
            >
              <motion.div 
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="w-24 h-24 bg-rose-100 rounded-[35px] flex items-center justify-center text-rose-500 mx-auto"
              >
                <Lock size={48} />
              </motion.div>
              <div className="space-y-3">
                <h4 className="text-3xl font-black text-slate-900 leading-tight">未开启！</h4>
                <p className="text-slate-500 font-bold leading-relaxed px-2">
                  你需要完成前一关的学习，才能开启下一关的冒险。
                </p>
              </div>
              <div className="grid gap-4">
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowMasteryPrompt(false)}
                  className="w-full py-5 bg-emerald-500 text-white rounded-3xl font-black text-xl shadow-xl shadow-emerald-200 hover:bg-emerald-600 transition-all"
                >
                  我知道了
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {spellingWord && (
          <PhonicsSpellingModal
            word={spellingWord.text}
            translation={spellingWord.translation}
            imageUrl={syncedImages[spellingWord.text] || spellingWord.imageUrl}
            onClose={() => setSpellingWord(null)}
          />
        )}
      </AnimatePresence>
    </div>
    </div>
  );
};

export default AdventurePage;
