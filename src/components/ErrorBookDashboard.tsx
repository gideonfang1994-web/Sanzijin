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
  const [gamePool, setGamePool] = useState<IncorrectVocabularyItem[]>([]);
  const [gameIndex, setGameIndex] = useState<number>(0);
  const [gameScore, setGameScore] = useState<number>(0);
  const [gameHearts, setGameHearts] = useState<number>(3);
  const [gameTimeLeft, setGameTimeLeft] = useState<number>(10);
  const [gameFeedback, setGameFeedback] = useState<string | null>(null);
  const [gameFeedbackType, setGameFeedbackType] = useState<'SUCCESS' | 'ERROR' | null>(null);
  const [userAnswerInput, setUserAnswerInput] = useState<string>('');
  const [gameOptions, setGameOptions] = useState<string[]>([]);
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
    audio.playSuccess();
    
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
      audio.playError();
      return;
    }
    
    audio.playClick();
    // Shuffle the error list to serve as the challenge pool
    const shuffled = [...errorList].sort(() => Math.random() - 0.5);
    setGamePool(shuffled);
    setGameIndex(0);
    setGameScore(0);
    setGameHearts(3);
    setGameTimeLeft(10);
    setIsPlayingChallenge(true);
    setChallengeResult(null);
    setGameFeedback(null);
    setGameFeedbackType(null);
  };

  // Prepare a question for challenge
  useEffect(() => {
    if (isPlayingChallenge && gamePool.length > 0 && gameIndex < gamePool.length) {
      const activeWord = gamePool[gameIndex];
      
      // Auto speak correct english spelling
      setTimeout(() => speakWord(activeWord.text), 300);

      // Distractor generator for multiple choice
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
      setGameTimeLeft(10);
      setGameFeedback(null);
      setGameFeedbackType(null);
    }
  }, [isPlayingChallenge, gameIndex, gamePool]);

  // Timed challenge ticker logic
  useEffect(() => {
    let timer: any = null;
    if (isPlayingChallenge && !challengeResult && gameHearts > 0 && gameIndex < gamePool.length) {
      timer = setInterval(() => {
        setGameTimeLeft(prev => {
          if (prev <= 1) {
            handleChallengeTimeout();
            return 10;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => timer && clearInterval(timer);
  }, [isPlayingChallenge, gameIndex, gameHearts, challengeResult]);

  const handleChallengeTimeout = () => {
    audio.playError();
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

  const handleChooseOption = (option: string) => {
    if (gameFeedback) return; // Prevent double taps during animation
    
    const activeWord = gamePool[gameIndex];
    const isCorrect = option === activeWord.translation;

    if (isCorrect) {
      audio.playSuccess();
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
      audio.playError();
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
    audio.playReward();
    
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
  // SPACED REPETITION (EMER-SPACED REVIEWS) HANDLERS
  // -------------------------------------------------------------
  const startReviewSpirit = (spirit: PurifiedSpiritItem) => {
    audio.playClick();
    setActiveReviewSpirit(spirit);
    speakWord(spirit.text);

    // Dynamic distractor generation for multiple choice
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

  const handleAnswerReviewSpirit = (option: string) => {
    if (!activeReviewSpirit || spiritReviewFeedback) return;

    const isCorrect = option === activeReviewSpirit.translation;
    const wordText = activeReviewSpirit.text;

    if (isCorrect) {
      audio.playSuccess();
      const nextStage = Math.min(5, activeReviewSpirit.stage + 1);
      
      let rewardText = `✨ 契合重鸣！遗忘防线筑牢至 Stage ${nextStage}！`;
      if (nextStage === 5 && activeReviewSpirit.stage < 5) {
        rewardText = '🏆 灵力圆满！该词灵已成不灭黄金圣果，奖励50经验和20魔法币！';
        onReward(50, 20);
        audio.playLevelUp();
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
      audio.playError();
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
    audio.playPop();
    const updated = removePurifiedSpirit(spiritText);
    setPurifiedSpirits(updated);
    loadData();
  };

  // Start complete ritual workout for all due cards
  const handleReviewAllDue = () => {
    const dueList = purifiedSpirits.filter(s => s.nextReviewAt <= Date.now() || calculateRetention(s) <= 50);
    if (dueList.length === 0) {
      audio.playError();
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
              <div className="flex-1 flex flex-col justify-between py-2">
                <div className="flex items-center justify-between pb-4 border-b border-slate-800 text-xs font-black">
                  <div className="flex items-center space-x-1">
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
                    <span className="text-slate-400">时间:</span>
                    <span className={`text-xl tabular-nums ${gameTimeLeft < 4 ? 'text-rose-500 animate-pulse' : 'text-emerald-400'}`}>
                      {gameTimeLeft}s
                    </span>
                  </div>
                  
                  <span className="bg-emerald-950 text-emerald-400 border border-emerald-900 px-3 py-0.5 rounded-full">
                    第 {gameIndex + 1} / {gamePool.length} 关
                  </span>
                </div>

                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-3">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300" 
                    style={{ width: `${((gameIndex + 1) / gamePool.length) * 100}%` }}
                  />
                </div>

                <div className="my-auto py-6 space-y-5">
                  <div 
                    onClick={() => speakWord(gamePool[gameIndex].text)}
                    className="inline-block p-4.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:scale-105 active:scale-95 text-slate-950 rounded-full cursor-pointer shadow-lg transition-transform" 
                  >
                    <Volume2 size={36} className="animate-pulse" />
                  </div>
                  
                  <div>
                    <h3 className="text-4xl font-extrabold tracking-widest text-white leading-tight uppercase font-mono">
                      {gamePool[gameIndex].text}
                    </h3>
                    <p className="text-[13px] text-slate-400 font-bold mt-2">
                      按上图发音钮，选出正确的太古中译释义
                    </p>
                  </div>
                </div>

                <div className="h-10 flex items-center justify-center my-1">
                  <AnimatePresence mode="wait">
                    {gameFeedback && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={`text-[13px] font-semibold tracking-wide ${
                          gameFeedbackType === 'SUCCESS' ? 'text-emerald-400' : 'text-rose-450'
                        }`}
                      >
                        {gameFeedback}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="grid grid-cols-2 gap-3 pb-3">
                  {gameOptions.map((option) => (
                    <button
                      key={option}
                      onClick={() => {
                        setUserAnswerInput(option);
                        handleChooseOption(option);
                      }}
                      disabled={gameFeedback !== null}
                      className="py-4 px-3.5 bg-slate-950 hover:bg-slate-850 disabled:opacity-40 border-2 border-b-[5px] border-slate-800 text-[15px] font-black text-slate-200 hover:border-emerald-500 rounded-2xl active:border-b-2 active:translate-y-0.5 cursor-pointer shadow-md transition-all text-center"
                    >
                      {option}
                    </button>
                  ))}
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
            className="fixed inset-0 z-[60] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4"
          >
            <div className="bg-gradient-to-b from-slate-900 to-[#1e1b4b] rounded-[40px] border-4 border-indigo-500 p-6 w-full max-w-sm text-center relative shadow-2xl">
              <span className="text-5xl animate-spin inline-block mb-3">🔮</span>
              <h2 className="text-2xl font-black text-indigo-300">词灵唤醒复习仪式</h2>
              <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                利用艾宾浩斯重铸该词灵。回答正确可注入契合度，进入下一温习成长周期，直到大成！
              </p>

              <div className="my-6 p-6 bg-slate-950/60 border border-indigo-900 rounded-2xl space-y-4">
                <div 
                  onClick={() => speakWord(activeReviewSpirit.text)}
                  className="mx-auto w-12 h-12 flex items-center justify-center rounded-full bg-indigo-550/30 hover:bg-indigo-550 text-indigo-300 hover:text-white cursor-pointer transition-all"
                >
                  <Volume2 size={24} />
                </div>
                <h3 className="text-3xl font-black tracking-wide text-white uppercase font-mono">{activeReviewSpirit.text}</h3>
                <p className="text-xs text-slate-400">当前的记忆阶段为：Stage {activeReviewSpirit.stage} ({getStageDisplay(activeReviewSpirit.stage).name})</p>
              </div>

              {spiritReviewFeedback ? (
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`text-sm font-bold min-h-[48px] flex items-center justify-center p-2 rounded-xl ${
                    spiritReviewFeedbackType === 'SUCCESS' ? 'text-emerald-300 bg-emerald-900/20 border border-emerald-800' : 'text-rose-300 bg-rose-900/20 border border-rose-800'
                  }`}
                >
                  {spiritReviewFeedback}
                </motion.p>
              ) : (
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {spiritReviewOptions.map(option => (
                    <button
                      key={option}
                      onClick={() => handleAnswerReviewSpirit(option)}
                      className="py-3 px-2 bg-slate-950 hover:bg-indigo-950 text-xs font-black text-slate-300 hover:text-white border-2 border-indigo-900/50 hover:border-indigo-500 rounded-xl transition-all cursor-pointer shadow-sm text-center"
                    >
                      {option}
                    </button>
                  ))}
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

                          <p className="text-slate-350 text-xs font-semibold leading-relaxed">
                            释译: <strong className="text-slate-100">{item.translation}</strong>
                          </p>
                        </div>

                        <div className="flex items-center space-x-2.5 mt-5 pt-3 border-t border-slate-900/80">
                          <button 
                            onClick={() => speakWord(item.text)}
                            className="flex-1 py-1.5 bg-slate-850 hover:bg-slate-800 text-slate-300 rounded-xl font-black text-xs inline-flex items-center justify-center gap-1 transition-all cursor-pointer"
                          >
                            <Volume2 size={12} /> 纠音发声
                          </button>
                          
                          <button 
                            onClick={() => handlePurifyWord(item)}
                            className="flex-1 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-emerald-950 rounded-xl font-black text-xs inline-flex items-center justify-center gap-1 transition-all cursor-pointer shadow-md"
                          >
                            <Check size={12} className="stroke-[3]" /> 已掌握
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-20 text-center space-y-3.5">
                    <span className="text-7xl block animate-bounce">🕊️</span>
                    <h4 className="text-xl font-black text-emerald-400">词格空虚！无词错滞留</h4>
                    <p className="text-slate-400 text-xs max-w-sm mx-auto font-semibold">你完美征服了遭遇战！赶紧开启全新森林关卡或练习词灵复习吧！</p>
                  </div>
                )}
              </div>
            )}

            {/* TAB C: SPACED REPETITION SANCTUM REVIEW (EBBI-CURVE HARBOUR) */}
            {activeTab === 'SANCTUM' && (
              <div className="md:col-span-3 bg-slate-905 border border-slate-800 rounded-[35px] p-6 space-y-6">
                
                {/* Sanctum top dashboard */}
                <div className="bg-gradient-to-r from-[#111827] to-[#1e1b4b] border border-indigo-900/60 p-5 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="text-left space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="p-1 px-2.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/25 rounded-md text-[10px] font-black uppercase tracking-wider">
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
                    <p className="text-xs text-slate-400">已净化的词汇会被护送至此修行，并采用艾宾浩斯忘却速率实时演算法（5阶段周期）定时温习。进入不灭黄金圣殿即可完全内聚掌握！</p>
                  </div>

                  <div className="flex flex-col gap-2 shrink-0">
                    <div className="flex gap-2">
                      <div className="bg-slate-950/70 border border-indigo-950/60 p-2.5 rounded-xl text-center min-w-[70px]">
                        <p className="text-[9px] text-slate-400 uppercase tracking-widest leading-none">需要召唤</p>
                        <p className="text-lg font-black text-rose-400 leading-none mt-1">{metrics.dueReviewsCount}</p>
                      </div>
                      <div className="bg-slate-950/70 border border-indigo-950/60 p-2.5 rounded-xl text-center min-w-[70px]">
                        <p className="text-[9px] text-slate-400 uppercase tracking-widest leading-none">灵力圆满</p>
                        <p className="text-lg font-black text-amber-500 leading-none mt-1">{metrics.finishedMasteryCount}</p>
                      </div>
                    </div>

                    {metrics.dueReviewsCount > 0 ? (
                      <button 
                        onClick={handleReviewAllDue}
                        className="w-full py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 border border-indigo-400 text-white font-black text-xs rounded-xl active:scale-95 shadow cursor-pointer transition-all uppercase tracking-wider"
                      >
                        ⚡ 一键唤醒温习 ({metrics.dueReviewsCount})
                      </button>
                    ) : (
                      <div className="py-2.5 text-[10px] text-emerald-400 text-center font-bold bg-emerald-950/20 border border-emerald-900 border-dashed rounded-xl select-none leading-none">
                        🌿 目前记忆魂力饱满
                      </div>
                    )}
                  </div>
                </div>

                {/* Spirits container list */}
                {purifiedSpirits.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {purifiedSpirits.map((spirit) => {
                      const retentionValue = calculateRetention(spirit);
                      const isDue = spirit.nextReviewAt <= Date.now() || retentionValue <= 50;
                      const stageInfo = getStageDisplay(spirit.stage);
                      const isMaxStage = spirit.stage === 5;

                      return (
                        <div 
                          key={spirit.text}
                          className={`bg-slate-950/75 border rounded-2.5xl p-5 flex flex-col justify-between relative group hover:-translate-y-1 transition-all duration-300 ${
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
                                <span className="bg-amber-500/20 text-amber-400 border border-amber-900/60 px-2 py-0.5 rounded-md text-[9px] font-black tracking-wide leading-none uppercase pr-1.5 select-none inline-flex items-center gap-0.5">
                                  <Star size={7} fill="#fbbf24" stroke="none" /> 永恒圣果
                                </span>
                              ) : isDue ? (
                                <span className="bg-rose-500/15 text-rose-450 border border-rose-900/50 px-2 py-0.5 rounded-md text-[9px] font-black tracking-wider leading-none animate-pulse select-none uppercase">
                                  🚨 急需召唤
                                </span>
                              ) : (
                                <span className="bg-slate-900 text-slate-450 border border-slate-800/80 px-2 py-0.5 rounded-md text-[9px] font-bold tracking-wider leading-none select-none uppercase">
                                  修练中
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Central spelling */}
                          <div className="space-y-1 text-left flex-1 pb-4">
                            <div className="flex items-baseline space-x-1">
                              <h4 className="text-2xl font-black text-slate-100 font-mono uppercase leading-none tracking-wide">{spirit.text}</h4>
                              {spirit.syllables && spirit.syllables.length > 0 && (
                                <span className="text-[10px] text-slate-500 font-bold font-mono">({spirit.syllables.join('-')})</span>
                              )}
                            </div>
                            <p className="text-xs font-black text-slate-350">释义: {spirit.translation}</p>
                            
                            {/* Retention index bar */}
                            <div className="pt-3 space-y-1">
                              <div className="flex items-center justify-between text-[10px] font-black">
                                <span className="text-slate-500">记忆遗留浓度</span>
                                <span className={`${
                                  retentionValue >= 80 ? 'text-emerald-400' :
                                  retentionValue >= 50 ? 'text-amber-500' : 'text-rose-500 font-black animate-pulse'
                                }`}>
                                  {retentionValue}% ({
                                    retentionValue >= 80 ? '完美记忆' :
                                    retentionValue >= 50 ? '轻度模糊' : '面临遗忘!'
                                  })
                                </span>
                              </div>
                              <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-850">
                                <div 
                                  className={`h-full rounded-full transition-all duration-300 bg-gradient-to-r ${
                                    retentionValue >= 80 ? 'from-emerald-500 to-teal-400' :
                                    retentionValue >= 50 ? 'from-amber-400 to-amber-500' : 'from-rose-500 to-red-600'
                                  }`}
                                  style={{ width: `${retentionValue}%` }}
                                />
                              </div>
                              <p className="text-[9px] text-slate-500 font-bold leading-none mt-1 uppercase italic tracking-normal">{stageInfo.desc}</p>
                            </div>
                          </div>

                          {/* Operations */}
                          <div className="flex items-center space-x-2 pt-3 border-t border-slate-900 text-[10px]">
                            {isDue ? (
                              <button 
                                onClick={() => startReviewSpirit(spirit)}
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
