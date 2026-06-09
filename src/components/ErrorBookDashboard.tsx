import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, BarChart3, HelpCircle, Volume2, Sparkles, AlertCircle, Play, 
  Trash2, RefreshCw, Trophy, Heart, Timer, Check, ShieldAlert, Award,
  Flame, TrendingUp, Calendar, Zap, BookOpen, Gamepad2, Compass, ArrowRight, Star
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { WordItem, UserStats } from '../types';
import audio from '../utils/AudioUtils';
import confetti from 'canvas-confetti';
import { 
  getVocabularyErrors, 
  removeVocabularyError, 
  addVocabularyError,
  IncorrectVocabularyItem,
  getPurifiedSpirits,
  promoteToSpirit,
  reviewPurifiedSpirit,
  removePurifiedSpirit,
  calculateRetention,
  PurifiedSpiritItem
} from '../utils/errorBookUtils';

interface ErrorBookDashboardProps {
  stats: UserStats;
  onReward: (xp: number, coins: number) => void;
  onClose: () => void;
}

export const ErrorBookDashboard: React.FC<ErrorBookDashboardProps> = ({ stats, onReward, onClose }) => {
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'WORDLIST' | 'SANCTUM'>('DASHBOARD');
  const [errorList, setErrorList] = useState<IncorrectVocabularyItem[]>([]);
  const [purifiedSpirits, setPurifiedSpirits] = useState<PurifiedSpiritItem[]>([]);
  
  // Game states for Timed Challenge Mode
  const [isPlayingChallenge, setIsPlayingChallenge] = useState<boolean>(false);
  const [challengeGameMode, setChallengeGameMode] = useState<'SPELLING' | 'MCQ'>('SPELLING');
  const [gamePool, setGamePool] = useState<IncorrectVocabularyItem[]>([]);
  const [gameIndex, setGameIndex] = useState<number>(0);
  const [gameScore, setGameScore] = useState<number>(0);
  const [gameHearts, setGameHearts] = useState<number>(3);
  const [gameTimeLeft, setGameTimeLeft] = useState<number>(15);
  const [gameFeedback, setGameFeedback] = useState<string | null>(null);
  const [gameFeedbackType, setGameFeedbackType] = useState<'SUCCESS' | 'ERROR' | null>(null);
  const [userAnswerInput, setUserAnswerInput] = useState<string>('');
  const [gameOptions, setGameOptions] = useState<string[]>([]);
  
  // Keyboard Spelling interactive states
  const [spellInput, setSpellInput] = useState<string>('');
  const [spellRuneBubbles, setSpellRuneBubbles] = useState<{ id: number; char: string; used: boolean }[]>([]);

  // Sanctum advanced visual layout states
  const [sanctumViewMode, setSanctumViewMode] = useState<'GRID' | 'CONSTELLATION'>('CONSTELLATION');
  const [activeConstellationNode, setActiveConstellationNode] = useState<PurifiedSpiritItem | null>(null);

  const [challengeResult, setChallengeResult] = useState<{
    wordsPurified: string[];
    xpEarned: number;
    coinsEarned: number;
    totalAttempted: number;
    correctCount: number;
  } | null>(null);

  // Spaced repetition spirit review states
  const [activeReviewSpirit, setActiveReviewSpirit] = useState<PurifiedSpiritItem | null>(null);
  const [spiritReviewOptions, setSpiritReviewOptions] = useState<string[]>([]);
  const [spiritReviewFeedback, setSpiritReviewFeedback] = useState<string | null>(null);
  const [spiritReviewFeedbackType, setSpiritReviewFeedbackType] = useState<'SUCCESS' | 'ERROR' | null>(null);
  
  // Review spell states
  const [reviewSpellInput, setReviewSpellInput] = useState<string>('');
  const [reviewRuneBubbles, setReviewRuneBubbles] = useState<{ id: number; char: string; used: boolean }[]>([]);

  // Initialize and reload collected data
  const loadData = () => {
    setErrorList(getVocabularyErrors());
    setPurifiedSpirits(getPurifiedSpirits());
  };

  useEffect(() => {
    loadData();
  }, []);

  // -------------------------------------------------------------
  // DIAGNOSTIC METRICS CALCULATIONS
  // -------------------------------------------------------------
  const metrics = useMemo(() => {
    const totalErrors = errorList.length;
    const totalLearned = stats.totalWordsLearned || 10;
    
    // Distribution metrics
    const adventureCount = errorList.filter(item => item.sources.includes('ADVENTURE')).length;
    const arcadeCount = errorList.filter(item => item.sources.includes('ARCADE')).length;
    
    // Top hardest/high-frequency error words
    const topHardest = [...errorList]
      .sort((a, b) => b.errorCount - a.errorCount)
      .slice(0, 3);
      
    // Mastery estimate
    const healthyCount = totalLearned - totalErrors > 0 ? totalLearned - totalErrors : 0;
    const masteryPercentage = Math.round((healthyCount / Math.max(1, totalLearned)) * 100);

    // Calc reviews that are due right now according to Ebbinghaus timers
    const dueReviewsCount = purifiedSpirits.filter(s => s.nextReviewAt <= Date.now() || calculateRetention(s) <= 50).length;
    const finishedMasteryCount = purifiedSpirits.filter(s => s.stage === 5).length;

    return {
      totalErrors,
      adventureCount,
      arcadeCount,
      topHardest,
      masteryPercentage,
      dueReviewsCount,
      finishedMasteryCount
    };
  }, [errorList, purifiedSpirits, stats]);

  // Handle word text-to-speech pronunciation
  const speakWord = (wordText: string) => {
    try {
      audio.speak(wordText);
    } catch (e) {
      console.warn("Speech synthesis error:", e);
    }
  };

  // One-click purification (manually remove/master a word from kesalahan)
  const handlePurifyWord = (wordItem: IncorrectVocabularyItem) => {
    try { audio.playSuccess(); } catch (e) {}
    
    // Promote to a Purified spirit for spaced repetition instead of deleting completely!
    const updatedSpirits = promoteToSpirit(wordItem);
    setPurifiedSpirits(updatedSpirits);

    const updatedErrors = getVocabularyErrors();
    setErrorList(updatedErrors);
    
    // Reward small encouragement
    onReward(5, 2);
    confetti({
      particleCount: 20,
      spread: 30,
      origin: { y: 0.8 },
      colors: ['#34d399', '#10b981']
    });
  };

  // -------------------------------------------------------------
  // TIMED CHALLENGE CORE ENGINE
  // -------------------------------------------------------------
  const startTimedChallenge = () => {
    if (errorList.length === 0) {
      try { audio.playError(); } catch (e) {}
      return;
    }
    
    try { audio.playClick(); } catch (e) {}
    // Shuffle the error list to serve as the challenge pool
    const shuffled = [...errorList].sort(() => Math.random() - 0.5);
    setGamePool(shuffled);
    setGameIndex(0);
    setGameScore(0);
    setGameHearts(3);
    setGameTimeLeft(challengeGameMode === 'SPELLING' ? 15 : 10);
    setIsPlayingChallenge(true);
    setChallengeResult(null);
    setGameFeedback(null);
    setGameFeedbackType(null);
  };

  // Prepare a question for challenge (watching active question and gameplay mode)
  useEffect(() => {
    if (isPlayingChallenge && gamePool.length > 0 && gameIndex < gamePool.length) {
      const activeWord = gamePool[gameIndex];
      
      // Auto speak correct english spelling
      setTimeout(() => speakWord(activeWord.text), 300);

      // MCQ Choice list builder
      const allTranslations = [
        '苹果', '橘子', '香蕉', '写字', '裹入', '神兽', '火山', '踏步', '跳跃', '魔法', 
        '汉字', '萌宠', '地鼠', '冰川', '植物', '射手', '僵尸', '吊钩', '清除', '消除'
      ];
      const incorrectDistractors = allTranslations
        .filter(t => t !== activeWord.translation)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);
      const options = [...incorrectDistractors, activeWord.translation].sort(() => Math.random() - 0.5);
      setGameOptions(options);

      // SPELLING scrambled letter setup
      if (activeWord?.text) {
        const letters = activeWord.text.split('');
        const alphabet = 'abcdefghijklmnopqrstuvwxyz';
        const extras: string[] = [];
        // Add dynamic letters to build standard pool of up to 8 interactive bubbles
        if (letters.length < 8) {
          const distCount = Math.max(1, 8 - letters.length);
          for (let i = 0; i < distCount; i++) {
            const rChar = alphabet[Math.floor(Math.random() * alphabet.length)];
            if (!letters.includes(rChar) && !extras.includes(rChar)) {
              extras.push(rChar);
            }
          }
        }
        const combination = [...letters, ...extras]
          .map((char, index) => ({ id: index, char, used: false }))
          .sort(() => Math.random() - 0.5);
        setSpellRuneBubbles(combination);
      }

      setSpellInput('');
      setGameTimeLeft(challengeGameMode === 'SPELLING' ? 15 : 10);
      setGameFeedback(null);
      setGameFeedbackType(null);
    }
  }, [isPlayingChallenge, gameIndex, gamePool, challengeGameMode]);

  // Timed challenge ticker logic
  useEffect(() => {
    let timer: any = null;
    if (isPlayingChallenge && !challengeResult && gameHearts > 0 && gameIndex < gamePool.length) {
      timer = setInterval(() => {
        setGameTimeLeft(prev => {
          if (prev <= 1) {
            handleChallengeTimeout();
            return challengeGameMode === 'SPELLING' ? 15 : 10;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => timer && clearInterval(timer);
  }, [isPlayingChallenge, gameIndex, gameHearts, challengeResult, challengeGameMode]);

  const handleChallengeTimeout = () => {
    try { audio.playError(); } catch (e) {}
    setGameFeedback('⏰ 时间耗尽！心魔黑雾暴涨！');
    setGameFeedbackType('ERROR');
    
    setGameHearts(prev => {
      const nextHearts = prev - 1;
      if (nextHearts <= 0) {
        finishChallenge(true);
      }
      return nextHearts;
    });

    setTimeout(() => {
      setGameIndex(prev => prev + 1);
    }, 1500);
  };

  // Click handler for letters clicked/choosed in interactive Spelling board
  const handleSpellLetterClick = (bubbleId: number, letterValue: string) => {
    if (gameFeedback) return;
    
    const activeWord = gamePool[gameIndex];
    if (!activeWord) return;
    
    const nextExpectedIndex = spellInput.length;
    const nextExpectedChar = activeWord.text[nextExpectedIndex];
    
    if (letterValue.toLowerCase() === nextExpectedChar.toLowerCase()) {
      // Correct character clicked
      const updatedInput = spellInput + nextExpectedChar;
      setSpellInput(updatedInput);
      
      // Consume bubble representing that exact occurrence
      setSpellRuneBubbles(prev => prev.map(b => b.id === bubbleId ? { ...b, used: true } : b));
      try { audio.playPop(); } catch (e) {}

      // Did they complete the spelling correctly?
      if (updatedInput.toLowerCase() === activeWord.text.toLowerCase()) {
        try { audio.playSuccess(); } catch (e) {}
        setGameFeedback('✨ 符文归位！黑雾散尽，净化神效！');
        setGameFeedbackType('SUCCESS');
        setGameScore(prev => prev + 120 + gameTimeLeft * 10);
        
        // Promote from Active Errors list to persistent Sanctum Spaced Repetition queue!
        promoteToSpirit(activeWord);
        
        confetti({
          particleCount: 15,
          spread: 30,
          origin: { y: 0.75 }
        });

        setTimeout(() => {
          if (gameIndex >= gamePool.length - 1) {
            finishChallenge(false);
          } else {
            setGameIndex(prev => prev + 1);
          }
        }, 1500);
      }
    } else {
      // Incorrect click during spell
      try { audio.playError(); } catch (e) {}
      setGameFeedback('💥 咒语出错！黑雾暴乱，符文消散！');
      setGameFeedbackType('ERROR');
      
      setGameHearts(prev => {
        const nextHearts = prev - 1;
        if (nextHearts <= 0) {
          finishChallenge(true);
        }
        return nextHearts;
      });

      // Clear layout progress so they retry typing this very word from the starting character
      setTimeout(() => {
        setSpellInput('');
        setSpellRuneBubbles(prev => prev.map(b => ({ ...b, used: false })));
        setGameFeedback(null);
        setGameFeedbackType(null);
      }, 1200);
    }
  };

  // Magic Hint powerup trades 2 seconds of remaining time to cast next correct letter
  const handleUseMagicHint = () => {
    const activeWord = gamePool[gameIndex];
    if (!activeWord || gameFeedback) return;
    
    const nextExpectedIndex = spellInput.length;
    if (nextExpectedIndex >= activeWord.text.length) return;
    
    const nextExpectedChar = activeWord.text[nextExpectedIndex];
    const matchingBubble = spellRuneBubbles.find(b => b.char.toLowerCase() === nextExpectedChar.toLowerCase() && !b.used);
    
    if (matchingBubble) {
      const updatedInput = spellInput + nextExpectedChar;
      setSpellInput(updatedInput);
      setSpellRuneBubbles(prev => prev.map(b => b.id === matchingBubble.id ? { ...b, used: true } : b));
      try { audio.playPop(); } catch (e) {}
      
      // Deduct 2 seconds penalty for hints
      setGameTimeLeft(prev => Math.max(1, prev - 2));

      // Check if this finalizes the spell
      if (updatedInput.toLowerCase() === activeWord.text.toLowerCase()) {
        try { audio.playSuccess(); } catch (e) {}
        setGameFeedback('✨ 念咒达成！净化成功！');
        setGameFeedbackType('SUCCESS');
        setGameScore(prev => prev + 80 + gameTimeLeft * 5);
        
        promoteToSpirit(activeWord);
        
        setTimeout(() => {
          if (gameIndex >= gamePool.length - 1) {
            finishChallenge(false);
          } else {
            setGameIndex(prev => prev + 1);
          }
        }, 1400);
      }
    }
  };

  const handleChooseOption = (option: string) => {
    if (gameFeedback) return; // Prevent double taps during animation
    
    const activeWord = gamePool[gameIndex];
    const isCorrect = option === activeWord.translation;

    if (isCorrect) {
      try { audio.playSuccess(); } catch (e) {}
      setGameFeedback('✨ 净化成功！黑雾退散，收为词灵！');
      setGameFeedbackType('SUCCESS');
      setGameScore(prev => prev + 100 + gameTimeLeft * 10);
      
      // Promote from Active Errors list to Spaced Repetition queue!
      promoteToSpirit(activeWord);
      
      // Animate single confetti burst
      confetti({
        particleCount: 15,
        spread: 30,
        origin: { y: 0.75 }
      });
    } else {
      try { audio.playError(); } catch (e) {}
      setGameFeedback(`💥 法术暴走！正确释义是: ${activeWord.translation}`);
      setGameFeedbackType('ERROR');
      
      setGameHearts(prev => {
        const nextHearts = prev - 1;
        if (nextHearts <= 0) {
          finishChallenge(true);
        }
        return nextHearts;
      });
    }

    // Move to next question after show feedback delay
    setTimeout(() => {
      if (gameIndex >= gamePool.length - 1) {
        finishChallenge(false);
      } else {
        setGameIndex(prev => prev + 1);
      }
    }, 1800);
  };

  const finishChallenge = (isLoss: boolean) => {
    // Compile results
    const processedWords = gamePool.slice(0, isLoss ? gameIndex + 1 : gamePool.length);
    const correctItems = processedWords.filter((w, idx) => {
      return idx < gameIndex || (idx === gameIndex && gameFeedbackType === 'SUCCESS');
    });

    const purifiedWordsList = correctItems.map(item => item.text);
    
    // Calculate rewards
    const xpReward = correctItems.length * 20 + 30;
    const coinsReward = correctItems.length * 8 + 10;
    
    onReward(xpReward, coinsReward);
    try { audio.playReward(); } catch (e) {}
    
    setChallengeResult({
      wordsPurified: purifiedWordsList,
      xpEarned: xpReward,
      coinsEarned: coinsReward,
      totalAttempted: processedWords.length,
      correctCount: correctItems.length
    });

    // Refresh remaining error items listing and spirits listing
    loadData();
  };

  const handleExitChallenge = () => {
    setIsPlayingChallenge(false);
    setChallengeResult(null);
    loadData();
  };

  // -------------------------------------------------------------
  // SPACED REPETITION (RE-MASTERY ORTHOGRAPHIC WORKOUT)
  // -------------------------------------------------------------
  const startReviewSpirit = (spirit: PurifiedSpiritItem) => {
    try { audio.playClick(); } catch (e) {}
    setActiveReviewSpirit(spirit);
    speakWord(spirit.text);

    // MCQ Backup Options Distractors setup
    const distractorPool = [
      '城堡', '森林', '海洋', '书写', '跳跃', '奔跑', '闪电', '星光', '羽毛', '红叶',
      '龙鳞', '精灵', '神话', '魔法', '金币', '弓箭', '神盾', '巨龙', '智慧', '挑战'
    ];
    const incorrectChoices = distractorPool
      .filter(d => d !== spirit.translation)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);

    const choices = [...incorrectChoices, spirit.translation].sort(() => Math.random() - 0.5);
    setSpiritReviewOptions(choices);
    setSpiritReviewFeedback(null);
    setSpiritReviewFeedbackType(null);
  };

  // Load review spell scrambled tiles when user selects a due spirit review card
  useEffect(() => {
    if (activeReviewSpirit) {
      const letters = activeReviewSpirit.text.split('');
      const alphabet = 'abcdefghijklmnopqrstuvwxyz';
      const extras: string[] = [];
      if (letters.length < 8) {
        const distCount = Math.max(1, 8 - letters.length);
        for (let i = 0; i < distCount; i++) {
          const rChar = alphabet[Math.floor(Math.random() * alphabet.length)];
          if (!letters.includes(rChar) && !extras.includes(rChar)) {
            extras.push(rChar);
          }
        }
      }
      const scrambledCombined = [...letters, ...extras]
        .map((char, index) => ({ id: index, char, used: false }))
        .sort(() => Math.random() - 0.5);
      
      setReviewRuneBubbles(scrambledCombined);
      setReviewSpellInput('');
    }
  }, [activeReviewSpirit]);

  // Handle letter click inside Spaced Repetition Spell Overlay
  const handleReviewLetterClick = (bubbleId: number, letterValue: string) => {
    if (!activeReviewSpirit || spiritReviewFeedback) return;
    
    const nextExpectedIndex = reviewSpellInput.length;
    const nextExpectedChar = activeReviewSpirit.text[nextExpectedIndex];
    
    if (letterValue.toLowerCase() === nextExpectedChar.toLowerCase()) {
      const updatedSpell = reviewSpellInput + nextExpectedChar;
      setReviewSpellInput(updatedSpell);
      setReviewRuneBubbles(prev => prev.map(b => b.id === bubbleId ? { ...b, used: true } : b));
      try { audio.playPop(); } catch (e) {}

      // Did they complete the spelling correctly?
      if (updatedSpell.toLowerCase() === activeReviewSpirit.text.toLowerCase()) {
        try { audio.playSuccess(); } catch (e) {}
        const nextStage = Math.min(5, activeReviewSpirit.stage + 1);
        
        let rewardText = `✨ 契合重鸣！遗忘防线筑牢至 Stage ${nextStage}！`;
        if (nextStage === 5 && activeReviewSpirit.stage < 5) {
          rewardText = '🏆 灵力圆满！该词灵已成不灭黄金圣果，奖励50经验和20魔法币！';
          onReward(50, 20);
          try { audio.playLevelUp(); } catch (e) {}
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          });
        } else {
          onReward(10, 3);
        }

        setSpiritReviewFeedback(rewardText);
        setSpiritReviewFeedbackType('SUCCESS');
        
        const updatedSpirits = reviewPurifiedSpirit(activeReviewSpirit.text, true);
        setPurifiedSpirits(updatedSpirits);

        setTimeout(() => {
          setActiveReviewSpirit(null);
          setSpiritReviewFeedback(null);
          setSpiritReviewFeedbackType(null);
          loadData();
        }, 1800);
      }
    } else {
      // Wrong spell assembly click in Review
      try { audio.playError(); } catch (e) {}
      setSpiritReviewFeedback(`💔 咒诀崩溃！词灵能量落回 Stage 1，请重试！`);
      setSpiritReviewFeedbackType('ERROR');
      
      const updatedSpirits = reviewPurifiedSpirit(activeReviewSpirit.text, false);
      setPurifiedSpirits(updatedSpirits);

      setTimeout(() => {
        setReviewSpellInput('');
        setReviewRuneBubbles(prev => prev.map(b => ({ ...b, used: false })));
        setSpiritReviewFeedback(null);
        setSpiritReviewFeedbackType(null);
        loadData();
      }, 1400);
    }
  };

  const handleAnswerReviewSpirit = (option: string) => {
    if (!activeReviewSpirit || spiritReviewFeedback) return;

    const isCorrect = option === activeReviewSpirit.translation;
    const wordText = activeReviewSpirit.text;

    if (isCorrect) {
      try { audio.playSuccess(); } catch (e) {}
      const nextStage = Math.min(5, activeReviewSpirit.stage + 1);
      
      let rewardText = `✨ 契合重鸣！遗忘防线筑牢至 Stage ${nextStage}！`;
      if (nextStage === 5 && activeReviewSpirit.stage < 5) {
        rewardText = '🏆 灵力圆满！该词灵已成不灭黄金圣果，奖励50经验和20魔法币！';
        onReward(50, 20);
        try { audio.playLevelUp(); } catch (e) {}
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      } else {
        onReward(10, 3);
      }

      setSpiritReviewFeedback(rewardText);
      setSpiritReviewFeedbackType('SUCCESS');
      
      const updatedSpirits = reviewPurifiedSpirit(wordText, true);
      setPurifiedSpirits(updatedSpirits);
    } else {
      try { audio.playError(); } catch (e) {}
      setSpiritReviewFeedback(`💔 魂力崩解！正确释义应为：${activeReviewSpirit.translation}。已落入 Stage 1。`);
      setSpiritReviewFeedbackType('ERROR');
      
      const updatedSpirits = reviewPurifiedSpirit(wordText, false);
      setPurifiedSpirits(updatedSpirits);
    }

    // Refresh after delay
    setTimeout(() => {
      setActiveReviewSpirit(null);
      setSpiritReviewFeedback(null);
      setSpiritReviewFeedbackType(null);
      loadData();
    }, 2200);
  };

  const handleReleaseSpirit = (spiritText: string) => {
    try { audio.playPop(); } catch (e) {}
    const updated = removePurifiedSpirit(spiritText);
    setPurifiedSpirits(updated);
    loadData();
  };

  // Start complete ritual workout for all due cards
  const handleReviewAllDue = () => {
    const dueList = purifiedSpirits.filter(s => s.nextReviewAt <= Date.now() || calculateRetention(s) <= 50);
    if (dueList.length === 0) {
      try { audio.playError(); } catch (e) {}
      return;
    }
    
    // Choose one random due card to start testing
    const chosen = dueList[Math.floor(Math.random() * dueList.length)];
    startReviewSpirit(chosen);
  };

  // Helper arrays for visualizing Stage properties
  const getStageDisplay = (stage: number) => {
    switch (stage) {
      case 1: return { name: '萌芽期', icon: '🌱', color: 'from-amber-500 to-emerald-400', desc: '半衰期30秒，随时可能遗忘' };
      case 2: return { name: '含苞期', icon: '🌿', color: 'from-emerald-400 to-teal-400', desc: '半衰期12h，逐步刻画脑回路' };
      case 3: return { name: '碧叶期', icon: '☘️', color: 'from-teal-400 to-emerald-500', desc: '半衰期24h，形成较深印象' };
      case 4: return { name: '凡生花', icon: '🌸', color: 'from-purple-400 to-pink-500', desc: '半衰期3天，已可条件反射拼读' };
      case 5: return { name: '黄金圣果', icon: '👑', color: 'from-amber-400 via-yellow-400 to-orange-500 animate-pulse', desc: '半衰期7天，烙印进太古长期记忆' };
      default: return { name: '未知', icon: '❓', color: 'from-slate-400 to-slate-500', desc: '' };
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#022c22]/95 backdrop-blur-xl flex flex-col items-center justify-start p-4 overflow-y-auto font-sans text-slate-100 select-none">
      
      {/* 1. TIMED CHALLENGE OVERLAY VIEW */}
      <AnimatePresence>
        {isPlayingChallenge && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-md mx-auto my-auto bg-gradient-to-b from-slate-900 to-[#022c22] rounded-[40px] border-4 border-emerald-500/80 shadow-2xl overflow-hidden flex flex-col p-6 min-h-[550px] justify-between text-center relative z-50"
          >
            <button 
              onClick={handleExitChallenge}
              className="absolute top-4 right-4 p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-2xl transition-all cursor-pointer"
            >
              <X size={18} />
            </button>

            {challengeResult ? (
              <motion.div 
                initial={{ opacity: 0, y: 15 }} 
                animate={{ opacity: 1, y: 0 }} 
                className="space-y-6 py-6"
              >
                <div className="flex justify-center">
                  <span className="text-7xl animate-bounce">🛡️</span>
                </div>
                
                <div>
                  <span className="bg-emerald-900/80 border border-emerald-700/80 text-emerald-400 font-black px-3.5 py-1 text-xs rounded-full tracking-widest uppercase">
                    消灭心魔·魔学特训报告
                  </span>
                  <h2 className="text-3xl font-black mt-3 leading-snug">
                    神识复苏！
                  </h2>
                  <p className="text-[13px] text-emerald-300 font-semibold mt-1 leading-relaxed px-2">
                    你击破了黑雾，以下词灵重获新生，已被转移至 <strong>记忆圣殿</strong> 进行遗忘复习巩固：
                  </p>
                </div>

                {challengeResult.wordsPurified.length > 0 ? (
                  <div className="bg-slate-950/60 p-4 border border-emerald-900 rounded-2xl max-h-36 overflow-y-auto space-y-1 text-left scrollbar-thin">
                    <p className="text-[11px] text-emerald-400 font-extrabold mb-1 px-1">🕊️ 转化进入圣殿的词灵：</p>
                    <div className="flex flex-wrap gap-1.5 p-1">
                      {challengeResult.wordsPurified.map(wordText => (
                        <span key={wordText} className="bg-emerald-500/20 text-emerald-300 border border-emerald-800/80 px-2.5 py-1 rounded-xl text-xs font-black inline-flex items-center gap-1">
                          <Check size={11} className="stroke-[3]" /> {wordText}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-950/60 p-5 border border-slate-800 rounded-2xl text-slate-400 text-xs font-bold leading-relaxed">
                    由于黑雾略浓，这次没有词汇完成彻底净化。不用灰心，去错题管理直接听发音温读看看！🌿
                  </div>
                )}

                <div className="bg-gradient-to-r from-[#022c22] to-slate-900 border-2 border-emerald-900/60 p-4 rounded-2xl flex items-center justify-around">
                  <div className="text-center">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">净化成功</p>
                    <p className="text-2xl font-black text-emerald-400 mt-1">
                      {challengeResult.wordsPurified.length} <span className="text-xs">词</span>
                    </p>
                  </div>
                  <div className="h-8 w-px bg-slate-800" />
                  <div className="text-center">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">经验奖励</p>
                    <p className="text-2xl font-black text-amber-500 mt-1">
                      +{challengeResult.xpEarned} <span className="text-xs">XP</span>
                    </p>
                  </div>
                  <div className="h-8 w-px bg-slate-800" />
                  <div className="text-center">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">收获魔法币</p>
                    <p className="text-2xl font-black text-amber-500 mt-1">
                      +{challengeResult.coinsEarned} <span className="text-xs">🪙</span>
                    </p>
                  </div>
                </div>

                <div className="bg-slate-950/40 p-3.5 border border-emerald-800/30 rounded-2xl flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-bold">本次训练正确率</span>
                  <span className={`text-xl font-black ${
                    (challengeResult.correctCount / Math.max(1, challengeResult.totalAttempted)) >= 0.8 ? 'text-emerald-400' :
                    (challengeResult.correctCount / Math.max(1, challengeResult.totalAttempted)) >= 0.5 ? 'text-amber-400' : 'text-rose-450'
                  }`}>
                    {challengeResult.totalAttempted > 0 ? Math.round((challengeResult.correctCount / challengeResult.totalAttempted) * 100) : 0}% ({challengeResult.correctCount}/{challengeResult.totalAttempted})
                  </span>
                </div>

                <div className="flex flex-col gap-2">
                  {(challengeResult.correctCount < challengeResult.totalAttempted || getVocabularyErrors().length > 0) && (
                    <button 
                      onClick={startTimedChallenge}
                      className="w-full py-3.5 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-350 hover:to-orange-450 text-slate-950 font-black text-sm rounded-2xl border-b-[5px] border-amber-700 active:border-b-2 active:translate-y-0.5 shadow-md cursor-pointer transition-all"
                    >
                      再次净化心魔 ⚡
                    </button>
                  )}

                  <button 
                    onClick={handleExitChallenge}
                    className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-emerald-950 font-black text-xs rounded-2xl border-b-[5px] border-emerald-700 active:border-b-2 active:translate-y-0.5 shadow-md cursor-pointer transition-all"
                  >
                    返回阁楼 📜
                  </button>
                </div>
              </motion.div>
            ) : (
              <div className="flex-1 flex flex-col justify-between py-1">
                {/* Mode Selector and Stats Header */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between pb-3 border-b border-emerald-950 text-xs font-black">
                    <div className="flex items-center space-x-1.5">
                      {[...Array(3)].map((_, i) => (
                        <Heart 
                          key={i} 
                          size={18} 
                          className={`transition-all duration-300 ${
                            i < gameHearts ? 'text-rose-500 fill-rose-500 filter drop-shadow(0 0 4px #f43f5e)' : 'text-slate-800'
                          }`} 
                        />
                      ))}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className="text-slate-400 font-bold">时间:</span>
                      <span className={`text-xl tabular-nums ${gameTimeLeft < 4 ? 'text-rose-500 animate-pulse' : 'text-emerald-400'}`}>
                        {gameTimeLeft}s
                      </span>
                    </div>
                    
                    <span className="bg-emerald-950 text-emerald-400 border border-emerald-900 px-3 py-0.5 rounded-full font-mono">
                      第 {gameIndex + 1} / {gamePool.length} 关
                    </span>
                  </div>

                  {/* Mode Slider / Toggle */}
                  <div className="grid grid-cols-2 bg-slate-950 p-1 rounded-xl border border-emerald-900/40">
                    <button
                      type="button"
                      onClick={() => setChallengeGameMode('SPELLING')}
                      className={`py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                        challengeGameMode === 'SPELLING' 
                          ? 'bg-emerald-500 text-slate-950 shadow-md' 
                          : 'text-slate-400 hover:text-slate-100'
                      }`}
                    >
                      🔮 符文拼写拼读
                    </button>
                    <button
                      type="button"
                      onClick={() => setChallengeGameMode('MCQ')}
                      className={`py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                        challengeGameMode === 'MCQ' 
                          ? 'bg-emerald-500 text-slate-950 shadow-md' 
                          : 'text-slate-400 hover:text-slate-100'
                      }`}
                    >
                      🎯 汉字中译抉择
                    </button>
                  </div>
                </div>

                <div className="w-full bg-slate-800/80 h-1.5 rounded-full overflow-hidden mt-2.5">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-350" 
                    style={{ width: `${((gameIndex + 1) / gamePool.length) * 100}%` }}
                  />
                </div>

                <div className="my-auto py-4 space-y-4">
                  {/* Speaker action */}
                  <div 
                    onClick={() => speakWord(gamePool[gameIndex].text)}
                    className="inline-block p-4 bg-gradient-to-r from-emerald-500 to-teal-400 hover:scale-105 active:scale-95 text-slate-950 rounded-full cursor-pointer shadow-lg transition-transform" 
                  >
                    <Volume2 size={32} className="animate-pulse" />
                  </div>
                  
                  <div>
                    {challengeGameMode === 'SPELLING' ? (
                      <div className="space-y-4">
                        <div className="bg-emerald-950/20 border border-emerald-950 rounded-2xl py-2 px-4 inline-block">
                          <p className="text-[10px] text-emerald-400 font-extrabold uppercase tracking-widest">
                            当前净化目标释义:
                          </p>
                          <p className="text-lg font-black text-white mt-0.5">
                            {gamePool[gameIndex].translation}
                          </p>
                        </div>

                        {/* Spelling word display boxes */}
                        <div className="flex flex-wrap justify-center gap-1.5 font-mono py-2">
                          {gamePool[gameIndex].text.split('').map((char, charIdx) => {
                            const isTyped = charIdx < spellInput.length;
                            return (
                              <span 
                                key={charIdx} 
                                className={`w-9 h-11 border-2 rounded-xl text-xl font-bold flex items-center justify-center transition-all ${
                                  isTyped 
                                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500 shadow-[0_0_10px_rgba(52,211,153,0.3)] animate-bounce' 
                                    : 'bg-slate-950 border-slate-800 text-slate-700'
                                }`}
                              >
                                {isTyped ? spellInput[charIdx] : '_'}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <h3 className="text-4xl font-extrabold tracking-widest text-white leading-tight uppercase font-mono">
                          {gamePool[gameIndex].text}
                        </h3>
                        <p className="text-xs text-slate-400 font-semibold mt-1">
                          按发音钮，选出正确的太古中译释义
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Feedbacks container */}
                <div className="h-10 flex items-center justify-center my-0.5">
                  <AnimatePresence mode="wait">
                    {gameFeedback && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className={`text-xs font-black tracking-wide py-1 px-3.5 rounded-full ${
                          gameFeedbackType === 'SUCCESS' 
                            ? 'text-emerald-300 bg-emerald-950/50 border border-emerald-900/60' 
                            : 'text-rose-400 bg-rose-950/50 border border-rose-900/60'
                        }`}
                      >
                        {gameFeedback}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Subgame dynamic boards */}
                <div className="pb-3 text-center">
                  {challengeGameMode === 'SPELLING' ? (
                    <div className="space-y-3.5">
                      {/* Scrambled Bubble Buttons */}
                      <div className="flex flex-wrap justify-center gap-2.5 max-w-sm mx-auto p-1.5 bg-slate-950/60 border border-emerald-950/40 rounded-3xl">
                        {spellRuneBubbles.map((bubble) => (
                          <button
                            key={bubble.id}
                            disabled={bubble.used || gameFeedback !== null}
                            onClick={() => handleSpellLetterClick(bubble.id, bubble.char)}
                            className={`w-11 h-11 rounded-full font-mono text-base font-black flex items-center justify-center transition-all cursor-pointer shadow border-b-4 ${
                              bubble.used 
                                ? 'opacity-25 scale-75 cursor-default border-transparent bg-slate-900 text-transparent' 
                                : 'bg-gradient-to-b from-slate-900 to-slate-800 text-slate-100 hover:from-slate-800 hover:to-slate-700 border-slate-950 border-b-slate-600 active:border-b-0 active:translate-y-1'
                            }`}
                          >
                            {bubble.char}
                          </button>
                        ))}
                      </div>

                      {/* Hint Trigger */}
                      <div className="flex items-center justify-center">
                        <button
                          type="button"
                          onClick={handleUseMagicHint}
                          disabled={gameFeedback !== null || spellInput.length >= gamePool[gameIndex].text.length}
                          className="flex items-center gap-1 bg-[#064e3b]/80 hover:bg-[#065f46] disabled:opacity-40 border border-emerald-500/30 text-emerald-300 hover:text-white px-3.5 py-1.5 rounded-full text-[11px] font-bold transition-all cursor-pointer shadow-md"
                        >
                          <Sparkles size={13} className="text-amber-400 animate-pulse" /> 魔法水晶提示 (时间-2秒)
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
                      {gameOptions.map((option) => (
                        <button
                          key={option}
                          onClick={() => {
                            setUserAnswerInput(option);
                            handleChooseOption(option);
                          }}
                          disabled={gameFeedback !== null}
                          className="py-4 px-3.5 bg-slate-950 hover:bg-slate-850 disabled:opacity-40 border-2 border-b-[5px] border-slate-900 text-[15px] font-black text-slate-200 hover:border-emerald-500 rounded-2xl active:border-b-2 active:translate-y-0.5 cursor-pointer shadow-md transition-all text-center"
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. SPECIFIC WORD SPIRIT RE-MASTERY OVERLAY */}
      <AnimatePresence>
        {activeReviewSpirit && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-[60] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
          >
            <div className="bg-gradient-to-b from-slate-900 to-[#1e1b4b] rounded-[40px] border-4 border-indigo-500 p-6 w-full max-w-sm text-center relative shadow-2xl">
              <button 
                onClick={() => {
                  setActiveReviewSpirit(null);
                  setSpiritReviewFeedback(null);
                  loadData();
                }}
                className="absolute top-4 right-4 p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl transition-all cursor-pointer"
              >
                <X size={15} />
              </button>

              <span className="text-5xl animate-spin inline-block mb-2">🔮</span>
              <h2 className="text-xl font-black text-indigo-300">词灵拼写唤醒仪式</h2>
              <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                回忆其中意，通过字母符文板拼写复苏该词灵！
              </p>

              <div className="my-5 p-5 bg-slate-950/80 border border-indigo-900/60 rounded-3xl space-y-3.5">
                <div 
                  onClick={() => speakWord(activeReviewSpirit.text)}
                  className="mx-auto w-11 h-11 flex items-center justify-center rounded-full bg-indigo-550/20 hover:bg-indigo-550 text-indigo-300 hover:text-white cursor-pointer transition-transform duration-200 hover:scale-105"
                >
                  <Volume2 size={22} className="animate-pulse" />
                </div>
                
                <div className="bg-indigo-950/40 p-2.5 rounded-xl border border-indigo-950 inline-block">
                  <p className="text-[9px] text-indigo-400 font-extrabold uppercase tracking-widest">太古中译释义提示：</p>
                  <p className="text-[15px] font-black text-indigo-100">{activeReviewSpirit.translation}</p>
                </div>

                {/* Review spelling boxes visual */}
                <div className="flex flex-wrap justify-center gap-1 font-mono pt-1">
                  {activeReviewSpirit.text.split('').map((char, charIdx) => {
                    const isTyped = charIdx < reviewSpellInput.length;
                    return (
                      <span 
                        key={charIdx} 
                        className={`w-7 h-9 border-2 rounded-lg text-base font-bold flex items-center justify-center transition-all ${
                          isTyped 
                            ? 'bg-indigo-500/20 text-indigo-300 border-indigo-400 shadow-[0_0_8px_rgba(99,102,241,0.4)]' 
                            : 'bg-slate-950 border-slate-800 text-slate-700'
                        }`}
                      >
                        {isTyped ? reviewSpellInput[charIdx] : '_'}
                      </span>
                    );
                  })}
                </div>

                <p className="text-[9.5px] text-slate-400 max-w-xs mx-auto">
                  阶段为：Stage {activeReviewSpirit.stage} - {getStageDisplay(activeReviewSpirit.stage).name}
                </p>
              </div>

              {spiritReviewFeedback ? (
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`text-xs font-black min-h-[48px] flex items-center justify-center p-2.5 rounded-2xl leading-relaxed ${
                    spiritReviewFeedbackType === 'SUCCESS' 
                      ? 'text-emerald-300 bg-emerald-950/60 border border-emerald-900' 
                      : 'text-rose-300 bg-rose-950/60 border border-rose-900'
                  }`}
                >
                  {spiritReviewFeedback}
                </motion.p>
              ) : (
                <div className="space-y-3 pt-1">
                  {/* Letters Keyboard spelling */}
                  <div className="flex flex-wrap justify-center gap-2 max-w-sm mx-auto p-2 bg-slate-950 border border-indigo-950 rounded-2xl">
                    {reviewRuneBubbles.map((bubble) => (
                      <button
                        key={bubble.id}
                        disabled={bubble.used || spiritReviewFeedback !== null}
                        onClick={() => handleReviewLetterClick(bubble.id, bubble.char)}
                        className={`w-9 h-9 rounded-full font-mono text-sm font-bold flex items-center justify-center transition-all cursor-pointer shadow border-b-2 ${
                          bubble.used 
                            ? 'opacity-20 scale-75 cursor-default border-transparent bg-slate-900 text-transparent' 
                            : 'bg-gradient-to-b from-slate-950 to-slate-900 text-indigo-100 hover:from-indigo-950 hover:to-indigo-900 border-indigo-950/50 border-b-indigo-705 active:translate-y-0.5'
                        }`}
                      >
                        {bubble.char}
                      </button>
                    ))}
                  </div>

                  <p className="text-[10px] text-slate-500 font-semibold italic">💡 温馨提示：拼写拼错会重置噢，请细心施咒</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. MAIN STATIC WORKSPACE */}
      {!isPlayingChallenge && (
        <div className="w-full max-w-4xl mx-auto flex flex-col space-y-6 pb-20 pt-2 relative">
          
          {/* Header Panel */}
          <div className="bg-gradient-to-r from-slate-900 to-[#022c22] border-2 border-emerald-900/60 p-6 sm:p-8 rounded-[40px] text-center relative overflow-hidden shadow-2xl">
            <button 
              onClick={onClose}
              className="absolute top-5 right-5 p-3 bg-slate-800 hover:bg-slate-700 text-slate-305 hover:text-white rounded-2xl transition-all cursor-pointer z-20"
            >
              <X size={20} />
            </button>
            
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border-4 border-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
            
            <div className="inline-flex items-center px-4.5 py-1.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-4 shadow">
              <ShieldAlert size={12} className="mr-2" />
              INCORRECT WORDS & MEMORY SANCTUM
            </div>
            
            <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-none">
              神识修炼馆 · 错词与记忆圣殿
            </h2>
            <p className="text-sm font-semibold text-emerald-400/90 mt-3 leading-relaxed max-w-xl mx-auto">
              此空间汇总 <strong>冒险深林</strong> 与 <strong>游乐园</strong> 特训中的错误记忆，并应用 <strong>Ebbinghaus 艾宾浩斯遗忘曲线</strong> 全天候跟踪消灭掉的词灵，安排阶段自修重铸！
            </p>

            {/* Micro statistic badges */}
            <div className="grid grid-cols-3 gap-3.5 mt-8 max-w-xl mx-auto bg-slate-950/60 p-4 border border-emerald-900/30 rounded-3xl">
              <div className="text-center">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">活跃心魔 (错词量)</p>
                <p className="text-2xl sm:text-3xl font-black text-rose-450">{errorList.length}</p>
              </div>
              <div className="h-10 w-px bg-slate-800/80 my-auto" />
              <div className="text-center">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">圣殿看守词灵数</p>
                <p className="text-2xl sm:text-3xl font-black text-indigo-400">{purifiedSpirits.length}</p>
              </div>
              <div className="h-10 w-px bg-slate-800/80 my-auto" />
              <div className="text-center">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">长效记忆健康度</p>
                <p className="text-2xl sm:text-3xl font-black text-emerald-400">{metrics.masteryPercentage}%</p>
              </div>
            </div>
          </div>

          {/* Quick Timed Challenge trigger strip (Only clickable if mistakes exist) */}
          {activeTab !== 'SANCTUM' && errorList.length > 0 && (
            <motion.div 
              whileHover={{ y: -3 }}
              className="bg-gradient-to-r from-amber-400 to-orange-500 p-1.5 rounded-[32px] shadow-xl border-2 border-white/10"
            >
              <button 
                onClick={startTimedChallenge}
                className="w-full p-4 bg-gradient-to-r from-slate-900 to-slate-950 hover:bg-slate-900 text-amber-400 font-black text-xs rounded-[28px] cursor-pointer"
              >
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center space-x-3 text-left">
                    <span className="p-2.5 bg-amber-500/10 rounded-2xl shrink-0">
                      <Timer className="text-amber-400 animate-spin" size={20} />
                    </span>
                    <div>
                      <p className="text-md font-black text-white">进入心魔限时净化挑战</p>
                      <p className="text-[11px] text-slate-400">10秒高压训练极速掌握错词。正确答出可消灭词错且直接将其护送入“记忆圣殿”！</p>
                    </div>
                  </div>
                  <span className="bg-amber-400 text-slate-950 px-4 py-2 font-black text-[10px] rounded-xl shadow inline-flex items-center gap-1">
                    PLAY ⚡
                  </span>
                </div>
              </button>
            </motion.div>
          )}

          {/* Tab switches */}
          <div className="flex bg-slate-950/80 p-1.5 border border-slate-800 rounded-3xl w-full max-w-lg mx-auto">
            <button 
              onClick={() => { audio.playClick(); setActiveTab('DASHBOARD'); }}
              className={`flex-1 py-3 text-center text-xs font-black rounded-2xl transition-all cursor-pointer inline-flex items-center justify-center space-x-1.5 ${
                activeTab === 'DASHBOARD' ? 'bg-emerald-500 text-slate-950 shadow font-extrabold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BarChart3 size={15} /> <span>修炼诊断</span>
            </button>
            
            <button 
              onClick={() => { audio.playClick(); setActiveTab('WORDLIST'); }}
              className={`flex-1 py-3 text-center text-xs font-black rounded-2xl transition-all cursor-pointer inline-flex items-center justify-center space-x-1.5 ${
                activeTab === 'WORDLIST' ? 'bg-emerald-500 text-slate-950 shadow font-extrabold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BookOpen size={15} /> <span>错词自修({errorList.length})</span>
            </button>

            <button 
              onClick={() => { audio.playClick(); setActiveTab('SANCTUM'); }}
              className={`flex-1 py-3 text-center text-xs font-black rounded-2xl transition-all cursor-pointer inline-flex items-center justify-center space-x-1.5 ${
                activeTab === 'SANCTUM' ? 'bg-emerald-500 text-slate-950 shadow font-extrabold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Star size={15} className="text-yellow-450 animate-pulse" /> <span>记忆圣殿({purifiedSpirits.length})</span>
            </button>
          </div>

          {/* Panels switcher Container */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* TAB A: DETAILED DIAGNOSTICS */}
            {activeTab === 'DASHBOARD' && (
              <>
                <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-[36px] p-6 space-y-6">
                  <h3 className="text-lg font-black text-white flex items-center gap-2">
                    <TrendingUp className="text-emerald-400" size={18} />
                    太古词误高发期特征分布
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-slate-950/50 p-4 border border-emerald-900/30 rounded-2xl flex items-center space-x-4">
                      <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
                        <svg className="absolute w-16 h-16 rotate-[-90deg]">
                          <circle cx="32" cy="32" r="28" fill="transparent" stroke="#111827" strokeWidth="6" />
                          <circle 
                            cx="32" cy="32" r="28" fill="transparent" stroke="#10b981" strokeWidth="6" 
                            strokeDasharray="176" 
                            strokeDashoffset={176 - (176 * (errorList.length ? metrics.adventureCount / Math.max(1, errorList.length) : 0))}
                          />
                        </svg>
                        <span className="text-slate-350 font-black text-xs">
                          {errorList.length ? Math.round((metrics.adventureCount / errorList.length) * 100) : 0}%
                        </span>
                      </div>
                      
                      <div className="text-left">
                        <p className="text-xs text-emerald-400 font-extrabold flex items-center gap-1 mb-1">
                          🌲 冒险森林
                        </p>
                        <p className="text-lg font-black text-white">{metrics.adventureCount} 次错词</p>
                        <p className="text-[10px] text-slate-400 font-semibold">自学拼读或跟读评估致错</p>
                      </div>
                    </div>

                    <div className="bg-slate-950/50 p-4 border border-emerald-900/30 rounded-2xl flex items-center space-x-4">
                      <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
                        <svg className="absolute w-16 h-16 rotate-[-90deg]">
                          <circle cx="32" cy="32" r="28" fill="transparent" stroke="#111827" strokeWidth="6" />
                          <circle 
                            cx="32" cy="32" r="28" fill="transparent" stroke="#fbbf24" strokeWidth="6" 
                            strokeDasharray="176" 
                            strokeDashoffset={176 - (176 * (errorList.length ? metrics.arcadeCount / Math.max(1, errorList.length) : 0))}
                          />
                        </svg>
                        <span className="text-slate-350 font-black text-xs">
                          {errorList.length ? Math.round((metrics.arcadeCount / errorList.length) * 100) : 0}%
                        </span>
                      </div>
                      
                      <div className="text-left">
                        <p className="text-xs text-amber-500 font-extrabold flex items-center gap-1 mb-1">
                          🎮 游乐园
                        </p>
                        <p className="text-lg font-black text-white">{metrics.arcadeCount} 次错词</p>
                        <p className="text-[10px] text-slate-400 font-semibold">射击热气球，卡片游戏时致错</p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-slate-800 pt-5 space-y-4">
                    <p className="text-[11px] font-black uppercase text-slate-400 tracking-wider">
                      📊 极值起因与常任致错深度：
                    </p>
                    
                    <div className="space-y-3">
                      {errorList.length > 0 ? (
                        [...errorList]
                          .sort((a, b) => b.errorCount - a.errorCount)
                          .slice(0, 4)
                          .map((item, idx) => {
                            const maxError = Math.max(...errorList.map(e => e.errorCount), 4);
                            const fillPercent = Math.min(100, Math.max(15, (item.errorCount / maxError) * 100));
                            
                            return (
                              <div key={item.text} className="space-y-1">
                                <div className="flex items-center justify-between text-xs font-bold px-1">
                                  <span className="text-slate-300 font-mono text-[13px]">{item.text} / {item.translation}</span>
                                  <span className="text-rose-400">致错值: {item.errorCount} 次</span>
                                </div>
                                <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
                                  <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${fillPercent}%` }}
                                    transition={{ duration: 0.5, delay: idx * 0.05 }}
                                    className={`h-full rounded-full bg-gradient-to-r ${
                                      idx === 0 ? 'from-rose-500 to-rose-600' :
                                      idx === 1 ? 'from-orange-400 to-rose-500' :
                                      'from-amber-400 to-orange-400'
                                    }`}
                                  />
                                </div>
                              </div>
                            );
                          })
                      ) : (
                        <div className="py-6 text-center text-slate-500 text-xs font-semibold leading-loose">
                          修炼心如止水，毫无阴霾黑雾！去冒险大显身手吧 🌟
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-[36px] p-6 space-y-5">
                  <h3 className="text-lg font-black text-white flex items-center gap-1.5 leading-none">
                    <Flame className="text-rose-500" size={18} />
                    急需磨炼 Top3 重点错词
                  </h3>
                  
                  <div className="space-y-3">
                    {metrics.topHardest.length > 0 ? (
                      metrics.topHardest.map((item, idx) => (
                        <div 
                          key={item.text} 
                          className="bg-slate-950 border border-slate-850 p-4 rounded-2xl relative overflow-hidden flex flex-col justify-between"
                        >
                          <div className="absolute top-2 right-2 flex flex-col items-end">
                            <span className="text-rose-450 animate-pulse text-xs font-black">
                              🔥 {item.errorCount}次
                            </span>
                          </div>

                          <span className="text-[10px] text-rose-400 font-bold tracking-widest uppercase">
                            急需降伏
                          </span>
                          
                          <h4 className="text-2xl font-black text-rose-100 font-mono mt-1 uppercase">
                            {item.text}
                          </h4>
                          
                          <p className="text-slate-450 text-xs mt-1">
                            中译: {item.translation}
                          </p>

                          <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-900/60">
                            <button 
                              onClick={() => speakWord(item.text)}
                              className="p-1 px-3 bg-slate-800 hover:bg-slate-700 hover:text-white rounded-lg text-slate-350 text-xs font-black inline-flex items-center gap-1 transition-all cursor-pointer"
                            >
                              <Volume2 size={11} /> 播音
                            </button>
                            <button 
                              onClick={() => handlePurifyWord(item)}
                              className="p-1 px-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 rounded-lg text-xs font-black transition-all cursor-pointer shadow-md"
                            >
                              🛡️ 手动降伏
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-10 text-center text-slate-500 text-xs font-bold leading-normal">
                        暂无重点词。极好！🕊️
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* TAB B: INTERACTIVE WORDPOOL LIST AND SELF STUDY */}
            {activeTab === 'WORDLIST' && (
              <div className="md:col-span-3 bg-slate-900 border border-slate-800 rounded-[35px] p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
                  <h3 className="text-md sm:text-lg font-black text-white flex items-center gap-2">
                    <BookOpen className="text-emerald-400" size={18} />
                    太古错词自修阁 ({errorList.length})
                  </h3>
                  <p className="text-slate-400 text-xs">
                    点击播音矫正读法，按 “已掌握” 转换进入圣殿，通过科学曲线阶段复审巩固！
                  </p>
                </div>

                {errorList.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {errorList.map((item) => (
                      <div 
                        key={item.text}
                        className="bg-slate-950 border border-slate-900 p-5 rounded-2xl flex flex-col justify-between hover:border-emerald-500/50 transition-all duration-200 relative group"
                      >
                        <span className="absolute top-4 right-4 bg-rose-950/40 text-rose-350 border border-rose-900/40 font-mono text-[9px] font-bold px-2 py-0.5 rounded-full select-none">
                          致错: {item.errorCount}
                        </span>

                        <div className="space-y-1.5 text-left">
                          <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">
                            {item.sources.map(s => s === 'ADVENTURE' ? '🌲冒险森林' : '🎮游乐园').join(' / ')}
                          </span>
                          
                          <div className="flex items-baseline space-x-1.5">
                            <h4 className="text-2xl font-black text-white font-mono uppercase tracking-wide leading-none">
                              {item.text}
                            </h4>
                            {item.syllables && item.syllables.length > 0 && (
                              <span className="text-[10px] text-slate-500 font-mono font-bold">
                                ({item.syllables.join('-')})
                              </span>
                            )}
                          </div>
                          
                          <p className="text-slate-400 text-xs font-medium">
                            中译: {item.translation}
                          </p>
                        </div>

                        <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-slate-950">
                          <button
                            onClick={() => { speakWord(item.text); audio.playClick(); }}
                            className="p-1 px-3 bg-slate-800 hover:bg-slate-700 hover:text-white rounded-lg text-slate-350 text-xs font-black inline-flex items-center gap-1 transition-all cursor-pointer"
                          >
                            <Volume2 size={11} /> 播音
                          </button>
                          
                          <button
                            onClick={() => handlePurifyWord(item)}
                            className="p-1 px-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 rounded-lg text-xs font-black transition-all cursor-pointer shadow-md"
                          >
                            🛡️ 掌握消灭
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-20 text-center space-y-4">
                    <span className="text-7xl block animate-bounce">⚔️</span>
                    <h4 className="text-xl font-black text-indigo-400">自修阁静谧，无错词心魔</h4>
                    <p className="text-slate-400 text-xs max-w-sm mx-auto font-medium leading-relaxed">
                      你在森林冒险或极速清除特训中，暂无未消灭的错词！
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* TAB C: SPACED REPETITION SANCTUM REVIEW (EBBI-CURVE HARBOUR) */}
            {activeTab === 'SANCTUM' && (
              <div className="md:col-span-3 bg-slate-900 border border-slate-800 rounded-[35px] p-6 space-y-6">
                
                {/* Sanctum top dashboard */}
                <div className="bg-gradient-to-r from-[#111827] to-[#1e1b4b] border border-indigo-900/60 p-5 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="text-left space-y-1">
                    <div className="flex items-center justify-between sm:justify-start gap-2">
                      <span className="p-1 px-2.5 bg-indigo-550/20 text-indigo-300 border border-indigo-500/25 rounded-md text-[10px] font-black uppercase tracking-wider">
                        Ebbinghaus Curve Sanctum
                      </span>
                      {metrics.dueReviewsCount > 0 && (
                        <span className="flex h-2.5 w-2.5 relative">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
                        </span>
                      )}
                    </div>
                    <h3 className="text-2xl font-black text-white">太古智慧记忆圣殿</h3>
                    <p className="text-xs text-slate-400 max-w-xl">
                      已净化的词位护送至此，安排 <strong>艾宾浩斯曲线5阶段</strong> 算法离线成长重铸。拼写通关注入契合度，极速达到永久记忆！
                    </p>
                  </div>

                  {/* Switchers and Controls */}
                  <div className="flex flex-col items-stretch gap-2 shrink-0">
                    <div className="flex bg-slate-950 p-1 rounded-xl border border-indigo-900/40 text-[10px] font-black self-end">
                      <button 
                        type="button"
                        onClick={() => { audio.playClick(); setSanctumViewMode('CONSTELLATION'); }}
                        className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                          sanctumViewMode === 'CONSTELLATION' 
                            ? 'bg-indigo-600 text-white shadow-md' 
                            : 'text-slate-450 hover:text-white'
                        }`}
                      >
                        🌌 智识星脉图
                      </button>
                      <button 
                        type="button"
                        onClick={() => { audio.playClick(); setSanctumViewMode('GRID'); }}
                        className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                          sanctumViewMode === 'GRID' 
                            ? 'bg-indigo-600 text-white shadow-md' 
                            : 'text-slate-450 hover:text-white'
                        }`}
                      >
                        🗂️ 灵馆卡牌
                      </button>
                    </div>

                    <div className="flex gap-2 justify-end">
                      <div className="bg-slate-950/70 border border-indigo-950/60 p-2.5 rounded-xl text-center min-w-[70px]">
                        <p className="text-[9px] text-slate-400 uppercase tracking-widest leading-none">需要召唤</p>
                        <p className="text-lg font-black text-rose-450 leading-none mt-1">{metrics.dueReviewsCount}</p>
                      </div>
                      <div className="bg-slate-950/70 border border-indigo-950/60 p-2.5 rounded-xl text-center min-w-[70px]">
                        <p className="text-[9px] text-slate-400 uppercase tracking-widest leading-none">契合圆满</p>
                        <p className="text-lg font-black text-amber-400 leading-none mt-1">{metrics.finishedMasteryCount}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {purifiedSpirits.length > 0 ? (
                  <div>
                    {sanctumViewMode === 'CONSTELLATION' ? (
                      /* CONSTELLATION GALAXY VIEW MODE */
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* The interactive Space Canvas */}
                        <div className="lg:col-span-2 bg-slate-950/80 rounded-3xl border-2 border-indigo-950 p-4 relative overflow-hidden h-[420px] flex flex-col justify-between shadow-inner">
                          {/* Twinkly deep space stars decoration */}
                          <div className="absolute inset-0 pointer-events-none">
                            {backgroundStars.map((star) => (
                              <div
                                key={star.id}
                                className="absolute bg-white rounded-full transition-opacity duration-1000"
                                style={{
                                  left: `${star.x}%`,
                                  top: `${star.y}%`,
                                  width: `${star.size}px`,
                                  height: `${star.size}px`,
                                  opacity: star.opacity,
                                }}
                              />
                            ))}
                          </div>

                          <div className="z-10 flex items-center justify-between text-[11px] font-bold text-indigo-300 pointer-events-none bg-slate-900/60 backdrop-blur-sm self-start px-3 py-1.5 rounded-full border border-indigo-900/40">
                            🌌 点击星网节点激发该词灵神识
                          </div>

                          {/* Constellation SVG layout coordinates graph */}
                          <div className="absolute inset-x-0 top-6 bottom-4 flex items-center justify-center">
                            <svg 
                              viewBox="0 0 400 400" 
                              className="w-full h-full max-w-[390px] max-h-[390px]"
                            >
                              {/* Connector Links path */}
                              {(() => {
                                const spiralNodes = purifiedSpirits.map((spirit, idx) => {
                                  const angle = idx * 2.3; 
                                  const radius = 25 + idx * (145 / Math.max(purifiedSpirits.length, 6));
                                  return {
                                    spirit,
                                    x: 200 + Math.cos(angle) * Math.min(160, radius),
                                    y: 200 + Math.sin(angle) * Math.min(160, radius),
                                  };
                                });

                                return (
                                  <>
                                    {spiralNodes.map((node, idx) => {
                                      if (idx === 0) return null;
                                      const prev = spiralNodes[idx - 1];
                                      return (
                                        <line
                                          key={`link-${idx}`}
                                          x1={prev.x}
                                          y1={prev.y}
                                          x2={node.x}
                                          y2={node.y}
                                          stroke="rgba(99, 102, 241, 0.45)"
                                          strokeWidth="1.5"
                                          strokeDasharray="4 3"
                                        />
                                      );
                                    })}

                                    {/* Core spiral node buttons */}
                                    {spiralNodes.map((node, idx) => {
                                      const retentionValue = calculateRetention(node.spirit);
                                      const isDue = node.spirit.nextReviewAt <= Date.now() || retentionValue <= 50;
                                      const isMastered = node.spirit.stage === 5;
                                      const isSelected = activeConstellationNode?.text === node.spirit.text;

                                      // Node theme styles
                                      let glowColor = "rgba(129, 140, 248, 0.4)";
                                      let coreColor = "#6366f1";
                                      if (isMastered) {
                                        glowColor = "rgba(245, 158, 11, 0.5)";
                                        coreColor = "#f59e0b";
                                      } else if (isDue) {
                                        glowColor = "rgba(239, 68, 68, 0.6)";
                                        coreColor = "#ef4444";
                                      }

                                      return (
                                        <g 
                                          key={node.spirit.text}
                                          className="cursor-pointer"
                                          onClick={() => {
                                            audio.playClick();
                                            setActiveConstellationNode(node.spirit);
                                          }}
                                        >
                                          {/* Hover halo outer glow */}
                                          <circle
                                            cx={node.x}
                                            cy={node.y}
                                            r={isSelected ? 16 : 10}
                                            fill={glowColor}
                                            className={`${isDue ? 'animate-ping' : ''} transition-all duration-300`}
                                          />

                                          {/* Core star dot */}
                                          <circle
                                            cx={node.x}
                                            cy={node.y}
                                            r={isSelected ? 6 : 4}
                                            fill={coreColor}
                                            stroke="#fff"
                                            strokeWidth={isSelected ? 2 : 1}
                                            className="transition-all duration-300"
                                          />

                                          {/* Text tag label */}
                                          <text
                                            x={node.x}
                                            y={node.y + 16}
                                            textAnchor="middle"
                                            fill={isSelected ? "#fff" : "rgba(203, 213, 225, 0.75)"}
                                            fontSize="9"
                                            fontWeight={isSelected ? "900" : "700"}
                                            fontFamily="monospace"
                                            className="select-none tracking-tight pointer-events-none drop-shadow"
                                          >
                                            {node.spirit.text.toUpperCase()}
                                          </text>
                                        </g>
                                      );
                                    })}
                                  </>
                                );
                              })()}
                            </svg>
                          </div>

                          <div className="z-10 flex text-[10px] text-slate-500 font-bold justify-between w-full self-end bg-slate-950/80 p-2 rounded-2xl border border-indigo-950/40">
                            <span>🔴 红色：虚弱需补充</span>
                            <span>🔵 蓝色：成长充能中</span>
                            <span>🟡 金色：大圆满永久内聚</span>
                          </div>
                        </div>

                        {/* Node detail and summoning review panel */}
                        <div className="bg-slate-950/60 rounded-3xl border-2 border-indigo-950/40 p-5 flex flex-col justify-between min-h-[420px]">
                          {activeConstellationNode ? (
                            <div className="space-y-4 text-left flex flex-col justify-between h-full">
                              <div className="space-y-3">
                                <div className="flex items-center justify-between border-b border-indigo-950 pb-3">
                                  <span className="text-xs bg-indigo-950 text-indigo-300 px-2.5 py-1 rounded-lg font-black border border-indigo-900">
                                    Stage {activeConstellationNode.stage} · {getStageDisplay(activeConstellationNode.stage).name}
                                  </span>
                                  <button
                                    onClick={() => speakWord(activeConstellationNode.text)}
                                    className="p-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 rounded-lg transition-transform hover:scale-105"
                                  >
                                    <Volume2 size={15} />
                                  </button>
                                </div>

                                <div className="space-y-1">
                                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">词灵圣殿神像:</span>
                                  <h4 className="text-3xl font-black text-white font-mono uppercase tracking-wide leading-none">
                                    {activeConstellationNode.text}
                                  </h4>
                                  <p className="text-xs font-bold text-slate-300">
                                    释义: {activeConstellationNode.translation}
                                  </p>
                                </div>

                                {/* Retention metrics bar */}
                                <div className="p-3.5 bg-slate-900/60 border border-indigo-950/60 rounded-2xl space-y-2">
                                  <div className="flex justify-between items-center text-[10.5px] font-black">
                                    <span className="text-slate-400">当前记忆残留值</span>
                                    <span className={
                                      calculateRetention(activeConstellationNode) >= 80 ? 'text-emerald-400' :
                                      calculateRetention(activeConstellationNode) >= 50 ? 'text-amber-400' : 'text-red-400 animate-pulse'
                                    }>
                                      {calculateRetention(activeConstellationNode)}%
                                    </span>
                                  </div>

                                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                                    <div 
                                      className="h-full bg-gradient-to-r from-indigo-500 to-teal-400"
                                      style={{ width: `${calculateRetention(activeConstellationNode)}%` }}
                                    />
                                  </div>
                                  <p className="text-[9.5px] text-slate-500 uppercase italic">
                                    {getStageDisplay(activeConstellationNode.stage).desc}
                                  </p>
                                </div>

                                <div className="space-y-1.5 text-xs text-slate-400 pl-1 leading-snug">
                                  <p>• <strong>首次修成:</strong> {new Date(activeConstellationNode.purifiedAt).toLocaleDateString()}</p>
                                  <p>• <strong>温习期限:</strong> {new Date(activeConstellationNode.nextReviewAt).toLocaleString()}</p>
                                </div>
                              </div>

                              <div className="space-y-2 pt-4 border-t border-indigo-950">
                                {(() => {
                                  const isDue = activeConstellationNode.nextReviewAt <= Date.now() || calculateRetention(activeConstellationNode) <= 50;
                                  return (
                                    <>
                                      {isDue ? (
                                        <button
                                          onClick={() => startReviewSpirit(activeConstellationNode)}
                                          className="w-full py-2.5 bg-gradient-to-r from-rose-500 to-red-600 border border-rose-400 hover:scale-[1.02] text-white rounded-xl font-black text-xs inline-flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-rose-950/20"
                                        >
                                          <Zap size={11} fill="currentColor" /> 温习召唤仪式
                                        </button>
                                      ) : (
                                        <button
                                          onClick={() => speakWord(activeConstellationNode.text)}
                                          className="w-full py-2.5 bg-indigo-900/30 hover:bg-slate-800 border border-indigo-800 text-indigo-300 rounded-xl font-bold text-xs inline-flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                                        >
                                          <Volume2 size={11} /> 圣音自听
                                        </button>
                                      )}
                                      
                                      <button
                                        onClick={() => handleReleaseSpirit(activeConstellationNode.text)}
                                        className="w-full py-2 hover:bg-rose-950/10 text-slate-500 hover:text-rose-450 border border-transparent hover:border-rose-950/30 rounded-xl font-bold text-[10px] transition-all cursor-pointer"
                                      >
                                        🕊️ 提前超度释放该词灵
                                      </button>
                                    </>
                                  );
                                })()}
                              </div>
                            </div>
                          ) : (
                            <div className="my-auto text-center space-y-3.5 py-8">
                              <span className="text-4xl block animate-pulse">🛰️</span>
                              <h5 className="text-xs font-black text-slate-400">词灵图谱节点未就绪</h5>
                              <p className="text-[10px] text-slate-500 leading-normal max-w-[200px] mx-auto">
                                请在左侧星网中，点击具体的星辰节点，即可获取该词灵的具体修炼记忆生命条，并实施神识施咒法术。
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      /* CLASSIC LIST GRID VIEW MODE */
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {purifiedSpirits.map((spirit) => {
                          const retentionValue = calculateRetention(spirit);
                          const isDue = spirit.nextReviewAt <= Date.now() || retentionValue <= 50;
                          const stageInfo = getStageDisplay(spirit.stage);
                          const isMaxStage = spirit.stage === 5;

                          return (
                            <div 
                              key={spirit.text}
                              className={`bg-slate-950/75 border rounded-2.5xl p-5 flex flex-col justify-between relative group hover:-translate-y-1 transition-all duration-305 ${
                                isDue ? 'border-indigo-500 shadow-lg shadow-indigo-500/10' : 'border-slate-850'
                              }`}
                            >
                              {/* Top Status */}
                              <div className="flex items-center justify-between pb-3.5 border-b border-slate-900 mb-4 text-xs font-black">
                                <span className="p-1 px-2.5 bg-slate-900 text-slate-300 border border-slate-800 rounded-lg shrink-0 flex items-center md:gap-1 tracking-wide leading-none select-none">
                                  {stageInfo.icon} Stage {spirit.stage} · {stageInfo.name}
                                </span>
                                
                                <div className="text-right">
                                  {isMaxStage ? (
                                    <span className="bg-amber-500/20 text-amber-405 border border-amber-900/60 px-2 py-0.5 rounded-md text-[9px] font-black tracking-wide leading-none uppercase pr-1.5 select-none inline-flex items-center gap-0.5">
                                      <Star size={7} fill="#fbbf24" stroke="none" /> 永恒圣果
                                    </span>
                                  ) : isDue ? (
                                    <span className="bg-rose-500/15 text-rose-450 border border-rose-900/50 px-2 py-0.5 rounded-md text-[9px] font-black tracking-wider leading-none animate-pulse select-none uppercase">
                                      🚨 急需召唤
                                    </span>
                                  ) : (
                                    <span className="bg-slate-900 text-slate-450 border border-slate-800/85 px-2 py-0.5 rounded-md text-[9px] font-bold tracking-wider leading-none select-none uppercase">
                                      修练中
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Central spelling */}
                              <div className="space-y-1 text-left flex-1 pb-4">
                                <div className="flex items-baseline space-x-1">
                                  <h4 className="text-2xl font-black text-slate-100 font-mono uppercase tracking-wide leading-none">
                                    {spirit.text}
                                  </h4>
                                  {spirit.syllables && spirit.syllables.length > 0 && (
                                    <span className="text-[10px] text-slate-400 font-mono font-bold">
                                      ({spirit.syllables.join('-')})
                                    </span>
                                  )}
                                </div>
                                <p className="text-slate-400 text-xs font-medium">{spirit.translation}</p>
                                
                                <div className="mt-3 bg-slate-900/60 p-2.5 rounded-xl border border-slate-900 space-y-1">
                                  <div className="flex justify-between text-[9.5px] font-black">
                                    <span className="text-slate-500">记忆残留</span>
                                    <span className={retentionValue >= 80 ? 'text-emerald-400' : retentionValue >= 50 ? 'text-amber-400' : 'text-rose-450'}>
                                      {retentionValue}%
                                    </span>
                                  </div>
                                  <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                                    <div 
                                      className="h-full bg-gradient-to-r from-indigo-550 to-teal-400"
                                      style={{ width: `${retentionValue}%` }}
                                    />
                                  </div>
                                </div>
                              </div>

                              {/* Operations */}
                              <div className="flex items-center space-x-2 pt-3 border-t border-slate-900 text-[10px]">
                                {isDue ? (
                                  <button 
                                    onClick={() =>};�点被护送入圣殿进行永恒不灭的高频重构哦！
                    </p>
                  </div>
                )}

              </div>
            )}

          </div>

        </div>
      )}

    </div>
  );
};
};�选或通过已被消灭的错词，它们就会化成光点被护送入圣殿进行永恒不灭的高频重构哦！
                    </p>
                  </div>
                )}

              </div>
            )}(spirit)}
                                className="flex-1 py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-white rounded-xl font-black inline-flex items-center justify-center gap-1 transition-all cursor-pointer shadow-md shadow-indigo-900/50 outline-none"
                              >
                                <Zap size={10} fill="currentColor" /> 温习召唤仪式
                              </button>
                            ) : (
                              <button 
                                onClick={() => { speakWord(spirit.text); audio.playClick(); }}
                                className="flex-1 py-2 bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-white border border-slate-800 rounded-xl font-black inline-flex items-center justify-center gap-1 transition-all cursor-pointer shadow-sm"
                              >
                                <Volume2 size={11} /> 圣音自听
                              </button>
                            )}

                            <button 
                              onClick={() => handleReleaseSpirit(spirit.text)}
                              title="超度词灵：将词灵彻底释放，不再进行遗忘复习温习"
                              className="p-2 bg-slate-900/40 hover:bg-rose-950/20 text-slate-600 hover:text-rose-400 border border-slate-900 hover:border-rose-950 rounded-xl transition-all cursor-pointer"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-20 text-center space-y-4">
                    <span className="text-7xl block animate-bounce">⚔️</span>
                    <h4 className="text-xl font-black text-indigo-400">圣殿静谧，尚未收容词灵</h4>
                    <p className="text-slate-400 text-xs max-w-sm mx-auto font-medium leading-relaxed">
                      你在 <strong>错词自修</strong> 或者 <strong>限时净化特训</strong> 中，只要勾选或通过已被消灭的错词，它们就会化成光点被护送入圣殿进行永恒不灭的高频重构哦！
                    </p>
                  </div>
                )}

              </div>
            )}

          </div>

        </div>
      )}

    </div>
  );
};
