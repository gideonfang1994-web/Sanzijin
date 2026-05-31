import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, BarChart3, HelpCircle, Volume2, Sparkles, AlertCircle, Play, 
  Trash2, RefreshCw, Trophy, Heart, Timer, Check, ShieldAlert, Award,
  Flame, TrendingUp, Calendar, Zap, BookOpen, Gamepad2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { WordItem, UserStats } from '../types';
import audio from '../utils/AudioUtils';
import confetti from 'canvas-confetti';
import { 
  getVocabularyErrors, 
  removeVocabularyError, 
  addVocabularyError,
  IncorrectVocabularyItem 
} from '../utils/errorBookUtils';

interface ErrorBookDashboardProps {
  stats: UserStats;
  onReward: (xp: number, coins: number) => void;
  onClose: () => void;
}

export const ErrorBookDashboard: React.FC<ErrorBookDashboardProps> = ({ stats, onReward, onClose }) => {
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'WORDLIST'>('DASHBOARD');
  const [errorList, setErrorList] = useState<IncorrectVocabularyItem[]>([]);
  
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

  // Initialize and reload collected incorrect words list
  const loadErrors = () => {
    setErrorList(getVocabularyErrors());
  };

  useEffect(() => {
    loadErrors();
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

    return {
      totalErrors,
      adventureCount,
      arcadeCount,
      topHardest,
      masteryPercentage
    };
  }, [errorList, stats]);

  // Handle word text-to-speech pronunciation
  const speakWord = (wordText: string) => {
    try {
      audio.speak(wordText);
    } catch (e) {
      console.warn("Speech synthesis error:", e);
    }
  };

  // One-click purification (manually remove/master a word)
  const handlePurifyWord = (wordText: string) => {
    audio.playSuccess();
    const updated = removeVocabularyError(wordText);
    setErrorList(updated);
    
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
      // Gather translation terms in system
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
    setGameFeedback('⏰ 时间耗尽！魔雾来袭！');
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
      setGameFeedback('✨ 净化成功！黑雾驱散！');
      setGameFeedbackType('SUCCESS');
      setGameScore(prev => prev + 100 + gameTimeLeft * 10);
      
      // Instantly remove this word from local error storage since it is purified!
      removeVocabularyError(activeWord.text);
      
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
      // If loss, the final item was wrong. For others, let's tally based on score.
      return idx < gameIndex || (idx === gameIndex && gameFeedbackType === 'SUCCESS');
    });

    const purifiedWordsList = correctItems.map(item => item.text);
    
    // Calculate rewards
    const xpReward = correctItems.length * 20 + 30;
    const coinsReward = correctItems.length * 8 + 10;
    
    onReward(xpReward, coinsReward);
    
    setChallengeResult({
      wordsPurified: purifiedWordsList,
      xpEarned: xpReward,
      coinsEarned: coinsReward,
      totalAttempted: processedWords.length,
      correctCount: correctItems.length
    });

    // Refresh remaining error items listing
    loadErrors();
  };

  const handleExitChallenge = () => {
    setIsPlayingChallenge(false);
    setChallengeResult(null);
    loadErrors();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#022c22]/95 backdrop-blur-xl flex flex-col items-center justify-start p-4 overflow-y-auto font-sans text-slate-100">
      
      {/* 1. CENTRAL CHALLENGE VIEWPLAY OVERLAY (Active Mode) */}
      <AnimatePresence>
        {isPlayingChallenge && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-md mx-auto my-auto bg-gradient-to-b from-slate-900 to-[#022c22] rounded-[40px] border-4 border-emerald-500/80 shadow-2xl overflow-hidden flex flex-col p-6 min-h-[550px] justify-between text-center relative"
          >
            {/* Exit/Cancel absolute tag */}
            <button 
              onClick={handleExitChallenge}
              className="absolute top-4 right-4 p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-2xl transition-all cursor-pointer"
            >
              <X size={18} />
            </button>

            {/* If Results Summary Board Ready */}
            {challengeResult ? (
              <motion.div 
                initial={{ opacity: 0, y: 15 }} 
                animate={{ opacity: 1, y: 0 }} 
                className="space-y-6 py-6"
              >
                <div className="flex justify-center select-none">
                  <span className="text-7xl animate-bounce">🛡️</span>
                </div>
                
                <div>
                  <span className="bg-emerald-900/80 border border-emerald-700/80 text-emerald-400 font-black px-3.5 py-1 text-xs rounded-full select-none tracking-widest uppercase">
                    消灭黑雾·净化特训报告
                  </span>
                  <h2 className="text-3xl font-black mt-3 leading-snug">
                    神力复苏！
                  </h2>
                  <p className="text-[13px] text-emerald-300 font-semibold mt-1 leading-relaxed px-2">
                    你勇敢地荡涤了森林音律黑雾，以下词灵已完全重获光明：
                  </p>
                </div>

                {/* Healed list of words */}
                {challengeResult.wordsPurified.length > 0 ? (
                  <div className="bg-slate-950/60 p-4 border border-emerald-990 rounded-2xl max-h-36 overflow-y-auto space-y-1 text-left scrollbar-thin">
                    <p className="text-[11px] text-emerald-400 font-extrabold mb-1 px-1">🕊️ 已掌握净化净化：</p>
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
                    这次由于黑雾太浓，没有词灵成功取得完全净化，别气馁，多听古音，继续努力！🍃
                  </div>
                )}

                {/* Rewards widget */}
                <div className="bg-gradient-to-r from-[#022c22] to-slate-900 border-2 border-emerald-900/60 p-4.5 rounded-2xl flex items-center justify-around">
                  <div className="text-center">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">净化战果</p>
                    <p className="text-2xl font-black text-emerald-400 mt-1">
                      {challengeResult.wordsPurified.length} <span className="text-xs font-black">词</span>
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
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">收获魔钻</p>
                    <p className="text-2xl font-black text-amber-500 mt-1">
                      +{challengeResult.coinsEarned} <span className="text-xs">🪙</span>
                    </p>
                  </div>
                </div>

                {/* Accuracy percentage gauge/widget */}
                <div className="bg-slate-950/40 p-4.5 border border-emerald-800/30 rounded-2xl flex items-center justify-between">
                  <div className="text-left">
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">本次净化正确率</p>
                    <p className="text-[11px] text-emerald-500/80 mt-1">（第二次/当前次专属结算）</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-2xl font-black ${
                      (challengeResult.correctCount / Math.max(1, challengeResult.totalAttempted)) >= 0.8 ? 'text-emerald-400' :
                      (challengeResult.correctCount / Math.max(1, challengeResult.totalAttempted)) >= 0.5 ? 'text-amber-400' : 'text-rose-400'
                    }`}>
                      {challengeResult.totalAttempted > 0 ? Math.round((challengeResult.correctCount / challengeResult.totalAttempted) * 100) : 0}%
                    </span>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                      {challengeResult.correctCount} / {challengeResult.totalAttempted} 答对
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-2.5">
                  {/* If there are still mistakes, or remaining errors in the vocabulary list, allow continuing/re-challenging */}
                  {(challengeResult.correctCount < challengeResult.totalAttempted || getVocabularyErrors().length > 0) ? (
                    <button 
                      onClick={() => {
                        audio.playClick();
                        startTimedChallenge();
                      }}
                      className="w-full py-4 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-350 hover:to-orange-450 text-slate-950 font-black text-md rounded-2xl border-b-[5px] border-amber-700 active:border-b-2 active:translate-y-0.5 shadow-md transition-all cursor-pointer"
                    >
                      再次尝试/继续挑战 ⚡
                    </button>
                  ) : null}

                  <button 
                    onClick={handleExitChallenge}
                    className="w-full py-4 bg-emerald-500 border border-emerald-400 hover:bg-emerald-600 text-emerald-950 font-black text-sm rounded-2xl border-b-[5px] border-emerald-700 active:border-b-2 active:translate-y-0.5 shadow-md transition-all cursor-pointer"
                  >
                    凯旋出关 📜
                  </button>
                </div>
              </motion.div>
            ) : (
              /* Active timed quiz session gameplay */
              <div className="flex-1 flex flex-col justify-between py-2">
                
                {/* Header status strip */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <div className="flex items-center space-x-1">
                    {[...Array(3)].map((_, i) => (
                      <Heart 
                        key={i} 
                        size={20} 
                        className={`transition-all duration-300 ${
                          i < gameHearts ? 'text-rose-500 fill-rose-500 filter drop-shadow(0 0 4px #f43f5e)' : 'text-slate-800'
                        }`} 
                      />
                    ))}
                  </div>
                  
                  {/* Circular visual timer */}
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] text-slate-400 font-bold">倒计时:</span>
                    <span className={`text-xl font-black tabular-nums ${gameTimeLeft < 4 ? 'text-rose-500 animate-pulse' : 'text-emerald-400'}`}>
                      {gameTimeLeft}
                    </span>
                  </div>
                  
                  <span className="text-[11px] font-black bg-emerald-950 text-emerald-400 border border-emerald-900 px-3 py-0.5 rounded-full">
                    第 {gameIndex + 1} / {gamePool.length} 关
                  </span>
                </div>

                {/* Progress indicators wrapper */}
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-3">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300" 
                    style={{ width: `${((gameIndex + 1) / gamePool.length) * 100}%` }}
                  />
                </div>

                {/* Central main question block */}
                <div className="my-auto py-6 space-y-5">
                  <div className="inline-block p-4.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:scale-105 active:scale-95 text-slate-950 rounded-full cursor-pointer shadow-lg transition-transform" onClick={() => speakWord(gamePool[gameIndex].text)}>
                    <Volume2 size={36} className="animate-pulse" />
                  </div>
                  
                  <div>
                    <h3 className="text-4xl font-extrabold tracking-widest text-white leading-tight uppercase font-mono">
                      {gamePool[gameIndex].text}
                    </h3>
                    <p className="text-[13px] text-slate-400 font-bold mt-2 leading-none uppercase tracking-wider">
                      点击播音听单词发音，请在下方点击正确释义
                    </p>
                  </div>
                </div>

                {/* Answer validation alert banners */}
                <div className="h-10 flex items-center justify-center my-1">
                  <AnimatePresence mode="wait">
                    {gameFeedback && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={`text-[13px] font-semibold tracking-wide ${
                          gameFeedbackType === 'SUCCESS' ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {gameFeedback}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Distractor translation options grid */}
                <div className="grid grid-cols-2 gap-3 pb-3">
                  {gameOptions.map((option) => {
                    const isSelected = userAnswerInput === option;
                    return (
                      <button
                        key={option}
                        onClick={() => {
                          setUserAnswerInput(option);
                          handleChooseOption(option);
                        }}
                        disabled={gameFeedback !== null}
                        className="py-4 px-3.5 bg-slate-950 hover:bg-slate-850 disabled:opacity-40 border-2 border-b-[5px] border-slate-800 select-none text-[15px] font-black text-slate-200 hover:text-white hover:border-emerald-500 rounded-2xl active:border-b-2 active:translate-y-0.5 cursor-pointer shadow-md transition-all text-center"
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>

              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. PERSISTENT ERROR HANDBOOK VIEW (MAIN LAYOUT) */}
      {!isPlayingChallenge && (
        <div className="w-full max-w-rpg max-w-4xl mx-auto flex flex-col space-y-6 pb-20 pt-2 relative">
          
          {/* Header section panel */}
          <div className="bg-gradient-to-r from-slate-900 to-[#022c22] border-2 border-emerald-900/60 p-6 sm:p-8 rounded-[40px] text-center relative overflow-hidden shadow-2xl">
            <button 
              onClick={onClose}
              className="absolute top-5 right-5 p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-2xl transition-all cursor-pointer"
            >
              <X size={20} />
            </button>
            
            {/* Glowing magic ring overlay */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border-4 border-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
            
            <div className="inline-flex items-center px-4.5 py-1.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-4 shadow">
              <ShieldAlert size={12} className="mr-2" />
              INCORRECT WORDS CHAMBER
            </div>
            
            <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-none">
              神识净化阁 · 错词汇报汇总
            </h2>
            <p className="text-sm font-semibold text-emerald-400/90 mt-3 leading-relaxed max-w-lg mx-auto">
              此秘卷自动收集你在 <strong>冒险深林</strong> 以及 <strong>森林奇乐园</strong> 各类神兽特训中答错的音律。在此潜心听读、进行限时净化特训能够斩断心魔，圆满修炼。
            </p>

            {/* Quick stats grid inside header card */}
            <div className="grid grid-cols-3 gap-3.5 mt-8 max-w-xl mx-auto bg-slate-950/60 p-4 border border-emerald-990 rounded-3xl">
              <div className="text-center">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">错词总数</p>
                <p className="text-2xl sm:text-3xl font-black text-rose-400">{errorList.length}</p>
              </div>
              <div className="h-10 w-px bg-slate-800/80 my-auto" />
              <div className="text-center">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">当前词库健康度</p>
                <p className="text-2xl sm:text-3xl font-black text-emerald-400">{metrics.masteryPercentage}%</p>
              </div>
            </div>
          </div>

          {/* Quick Action bar launcher */}
          {errorList.length > 0 ? (
            <motion.div 
              whileHover={{ y: -3 }}
              className="bg-gradient-to-r from-amber-400 to-orange-500 p-1.5 rounded-[32px] shadow-2xl border-2 border-white/20"
            >
              <button 
                onClick={startTimedChallenge}
                className="w-full p-5 bg-gradient-to-r from-slate-900 to-slate-950 hover:bg-slate-900 text-amber-400 font-black text-md rounded-[28px] cursor-pointer"
              >
                <div className="flex items-center justify-between px-3">
                  <div className="flex items-center space-x-3.5 text-left">
                    <span className="p-3 bg-amber-500/10 rounded-2xl shrink-0">
                      <Timer className="text-amber-400 animate-spin" size={24} />
                    </span>
                    <div>
                      <p className="text-lg font-black text-white">启动限时净化专项挑战</p>
                      <p className="text-xs font-semibold text-slate-400">10秒高压急速挑战错词，回答正确立即彻底消灭并奖励丰原经验！</p>
                    </div>
                  </div>
                  <span className="bg-amber-400 text-slate-950 px-4 py-2 font-black text-xs rounded-xl shadow-inner inline-flex items-center gap-1">
                    PLAY ⚡
                  </span>
                </div>
              </button>
            </motion.div>
          ) : (
            <div className="bg-slate-900/40 col-span-2 p-10 border-2 border-dashed border-emerald-900/40 rounded-[36px] text-center space-y-3">
               <span className="text-5xl block animate-bounce">🕊️</span>
               <p className="text-emerald-400 font-black text-lg">心灵通畅！你的神识中完全没有错词黑雾</p>
               <p className="text-slate-400 text-xs font-semibold max-w-sm mx-auto">所有的拼读跟和鸣发音都已极致通透。请继续探索更广阔的的自然原野吧！</p>
            </div>
          )}

          {/* Tab Selection */}
          <div className="flex bg-slate-950/80 p-1.5 border border-slate-800 rounded-2xl w-full max-w-xs mx-auto">
            <button 
              onClick={() => { audio.playClick(); setActiveTab('DASHBOARD'); }}
              className={`flex-1 py-2.5 text-center text-xs font-black rounded-xl transition-all cursor-pointer inline-flex items-center justify-center space-x-2 ${
                activeTab === 'DASHBOARD' ? 'bg-emerald-500 text-slate-950 shadow' : 'text-slate-400 hover:text-slate-250'
              }`}
            >
              <BarChart3 size={14} /> <span>诊断报告</span>
            </button>
            
            <button 
              onClick={() => { audio.playClick(); setActiveTab('WORDLIST'); }}
              className={`flex-1 py-2.5 text-center text-xs font-black rounded-xl transition-all cursor-pointer inline-flex items-center justify-center space-x-2 ${
                activeTab === 'WORDLIST' ? 'bg-emerald-500 text-slate-950 shadow' : 'text-slate-400 hover:text-slate-250'
              }`}
            >
              <BookOpen size={14} /> <span>错词管理({errorList.length})</span>
            </button>
          </div>

          {/* Sub Tab View rendering */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* TAB A: DETAILED DIAGNOSTICS */}
            {activeTab === 'DASHBOARD' && (
              <>
                {/* 1. Interactive Error sources breakdown (Gauges) */}
                <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-[36px] p-6 space-y-6">
                  <h3 className="text-lg font-black text-white flex items-center gap-2">
                    <TrendingUp className="text-emerald-400" size={18} />
                    错误来源场景分布诊断
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-2">
                    {/* Adventure count gauge */}
                    <div className="bg-slate-950/50 p-4 border border-emerald-990/40 rounded-2xl flex items-center space-x-4">
                      <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
                        <svg className="absolute w-16 h-16 rotate-[-90deg]">
                          <circle cx="32" cy="32" r="28" fill="transparent" stroke="#111827" strokeWidth="6" />
                          <circle 
                            cx="32" cy="32" r="28" fill="transparent" stroke="#10b981" strokeWidth="6" 
                            strokeDasharray="176" 
                            strokeDashoffset={176 - (176 * (errorList.length ? metrics.adventureCount / Math.max(1, errorList.length) : 0))}
                          />
                        </svg>
                        <span className="text-slate-300 font-extrabold text-xs select-none">
                          {errorList.length ? Math.round((metrics.adventureCount / errorList.length) * 100) : 0}%
                        </span>
                      </div>
                      
                      <div className="text-left">
                        <p className="text-xs text-emerald-400 font-extrabold flex items-center gap-1 mb-1">
                          <BookOpen size={12} /> 🌲 冒险深林
                        </p>
                        <p className="text-[20px] font-black text-white">{metrics.adventureCount} 次错起词</p>
                        <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">拼词自修试炼或多重释义识别错误导致。</p>
                      </div>
                    </div>

                    {/* Arcade count gauge */}
                    <div className="bg-slate-950/50 p-4 border border-emerald-990/40 rounded-2xl flex items-center space-x-4">
                      <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
                        <svg className="absolute w-16 h-16 rotate-[-90deg]">
                          <circle cx="32" cy="32" r="28" fill="transparent" stroke="#111827" strokeWidth="6" />
                          <circle 
                            cx="32" cy="32" r="28" fill="transparent" stroke="#fbbf24" strokeWidth="6" 
                            strokeDasharray="176" 
                            strokeDashoffset={176 - (176 * (errorList.length ? metrics.arcadeCount / Math.max(1, errorList.length) : 0))}
                          />
                        </svg>
                        <span className="text-slate-300 font-extrabold text-xs select-none">
                          {errorList.length ? Math.round((metrics.arcadeCount / errorList.length) * 100) : 0}%
                        </span>
                      </div>
                      
                      <div className="text-left">
                        <p className="text-xs text-amber-400 font-extrabold flex items-center gap-1 mb-1">
                          <Gamepad2 size={12} /> 🎮 森林奇乐园
                        </p>
                        <p className="text-[20px] font-black text-white">{metrics.arcadeCount} 次错起词</p>
                        <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">萌兽射击、消消乐或吹气球特训错杀触发。</p>
                      </div>
                    </div>
                  </div>

                  {/* Built-in high performance Custom Bar Chart illustration (Tailwind/SVG bar chart) */}
                  <div className="border-t border-slate-800 pt-5 space-y-4">
                    <p className="text-[11px] font-black uppercase text-slate-400 tracking-wider">
                      🎚️ 错词重分布极值分析 (由黑雾厚度排布)
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
                                <div className="flex items-center justify-between text-xs font-bold px-1.5">
                                  <span className="text-slate-300 font-mono text-[13px]">{item.text} ({item.translation})</span>
                                  <span className="text-rose-400">🔥 触发致错 {item.errorCount} 次</span>
                                </div>
                                <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800 select-none">
                                  <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${fillPercent}%` }}
                                    transition={{ duration: 0.6, delay: idx * 0.1 }}
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
                        <div className="py-8 text-center text-slate-500 text-xs font-bold">
                          暂无统计条形，神识清透！
                        </div>
                      )}
                    </div>
                  </div>

                </div>

                {/* 2. Top pituitary hardest words sidebar card (Left pane) */}
                <div className="bg-slate-900 border border-slate-800 rounded-[36px] p-6 space-y-5">
                  <h3 className="text-lg font-black text-white flex items-center gap-1.5 leading-none">
                    <Flame className="text-rose-500" size={18} />
                    急需净化 Top3 重灾词
                  </h3>
                  
                  <div className="space-y-3.5">
                    {metrics.topHardest.length > 0 ? (
                      metrics.topHardest.map((item, idx) => (
                        <div 
                          key={item.text} 
                          className="bg-slate-950 border border-slate-800 p-4.5 rounded-2xl relative overflow-hidden flex flex-col justify-between"
                        >
                          <div className="absolute top-0 right-0 p-1.5 flex flex-col items-end select-none">
                            <span className="text-rose-500 animate-pulse text-xs inline-flex items-center gap-0.5">
                              <Flame size={12} fill="#f43f5e" /> {item.errorCount}次
                            </span>
                            <span className="text-[9px] bg-slate-900 border border-slate-800 text-slate-400 px-1 py-0.2 rounded mt-1 font-black">
                              #0{idx + 1}
                            </span>
                          </div>

                          <span className="text-xs text-rose-450 font-bold tracking-widest uppercase">
                            致错频率极高
                          </span>
                          
                          <h4 className="text-[25px] font-black text-rose-100 font-mono mt-1 uppercase leading-none">
                            {item.text}
                          </h4>
                          
                          <p className="text-slate-400 text-xs font-semibold mt-1">
                            释义: {item.translation}
                          </p>

                          <div className="flex items-center justify-between mt-4.5 pt-3 border-t border-slate-900">
                            <button 
                              onClick={() => speakWord(item.text)}
                              className="p-1 px-3 bg-slate-800 hover:bg-slate-700 hover:text-white rounded-lg text-slate-300 text-xs font-black inline-flex items-center gap-1 transition-all cursor-pointer"
                            >
                              <Volume2 size={12} /> 读音
                            </button>
                            <button 
                              onClick={() => handlePurifyWord(item.text)}
                              className="p-1 px-3 bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-slate-950 rounded-lg text-xs font-black transition-all cursor-pointer"
                            >
                              🛡️ 优先净化
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-12 text-center text-slate-500 text-xs font-semibold leading-relaxed">
                        神识内没有重灾词灵，请随兴流浪冒险！🌲✨
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* TAB B: INTERACTIVE WORDPOOL LIST AND TTS TRAINING */}
            {activeTab === 'WORDLIST' && (
              <div className="md:col-span-3 bg-slate-900 border border-slate-800 rounded-[36px] p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-slate-800">
                  <h3 className="text-lg font-black text-white flex items-center gap-2">
                    <BookOpen className="text-emerald-400" size={18} />
                    太古深林错词净化法册 ({errorList.length})
                  </h3>
                  <p className="text-slate-400 text-xs font-semibold">
                    点击对应行听标准古语标准发音，矫正发音可助顿悟消灭。
                  </p>
                </div>

                {errorList.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {errorList.map((item) => (
                      <div 
                        key={item.text}
                        className="bg-slate-950 border border-slate-805 p-5 rounded-2xl flex flex-col justify-between hover:border-emerald-500/50 transition-all duration-300 relative group"
                      >
                        {/* Word error frequency tag */}
                        <span className="absolute top-4 right-4 bg-rose-950/40 text-rose-305 border border-rose-900/60 font-mono text-[10px] font-bold px-2 py-0.5 rounded-full z-10 select-none">
                          致错: {item.errorCount}
                        </span>

                        <div className="space-y-2">
                          <span className="text-[10px] text-slate-500 font-extrabold tracking-widest uppercase">
                            {item.sources.map(s => s === 'ADVENTURE' ? '🌲 冒险深林' : '🎮 森林游乐园').join(' / ')}
                          </span>
                          
                          <div className="flex items-baseline space-x-2">
                            <h4 className="text-2xl font-black text-white font-mono uppercase tracking-wide leading-none">
                              {item.text}
                            </h4>
                            {item.syllables && item.syllables.length > 0 && (
                              <span className="text-[11px] text-slate-500 font-bold font-mono">
                                ({item.syllables.join('-')})
                              </span>
                            )}
                          </div>

                          <p className="text-slate-350 text-xs font-semibold leading-relaxed">
                            中译: <strong className="text-slate-100 font-extrabold">{item.translation}</strong>
                          </p>
                        </div>

                        {/* Interactive operations drawer */}
                        <div className="flex items-center space-x-2.5 mt-5 pt-3.5 border-t border-slate-900">
                          <button 
                            onClick={() => { audio.playClick(); speakWord(item.text); }}
                            className="flex-1 py-2 bg-slate-850 hover:bg-emerald-500 hover:text-slate-950 rounded-xl text-slate-300 font-black text-xs inline-flex items-center justify-center gap-1 shadow-sm transition-all cursor-pointer"
                          >
                            <Volume2 size={13} />听音
                          </button>
                          
                          <button 
                            onClick={() => handlePurifyWord(item.text)}
                            className="flex-1 py-2 bg-emerald-505/10 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950 border border-emerald-900/30 rounded-xl font-black text-xs inline-flex items-center justify-center gap-1 shadow-sm transition-all cursor-pointer"
                          >
                            <Check size={13} className="stroke-[3]" />已掌握
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-20 text-center space-y-3.5">
                    <span className="text-7xl block animate-bounce select-none">🕊️</span>
                    <h4 className="text-xl font-black text-emerald-400">词册内空空如也！法网恢恢，无错漏可乘</h4>
                    <p className="text-slate-400 text-xs max-w-sm mx-auto font-semibold">你完美征服了所有遭遇战！请继续保持敏捷睿智的心性，去解锁新关卡吧！</p>
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
