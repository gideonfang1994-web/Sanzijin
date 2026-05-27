import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, BookOpen, Clock, Activity, ArrowRight, Play, CheckCircle2, ChevronRight, Award, Trophy, Star, Volume2, RotateCcw } from 'lucide-react';
import { UserStats, WordItem } from '../types';
import { ALL_CARDS } from '../constants';
import audio from '../utils/AudioUtils';
import confetti from 'canvas-confetti';

interface RepetitiveMagicStudyModalProps {
  stats: UserStats;
  onClose: () => void;
  onCompleteReview: () => void;
  onSelectReviewLevel: (levelId: number) => void;
}

export const RepetitiveMagicStudyModal: React.FC<RepetitiveMagicStudyModalProps> = ({
  stats,
  onClose,
  onCompleteReview,
  onSelectReviewLevel,
}) => {
  const [selectedLevelId, setSelectedLevelId] = useState<number | null>(null);
  
  // Game states inside the review modal
  const [isReviewingWords, setIsReviewingWords] = useState(false);
  const [reviewPhase, setReviewPhase] = useState<'CHOICE' | 'PHASE_TRANSITION' | 'SPELLING' | 'VICTORY'>('CHOICE');
  const [wordIdx, setWordIdx] = useState(0);

  // States for Phase 1: CHOICE
  const [choiceOptions, setChoiceOptions] = useState<string[]>([]);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [choiceStatus, setChoiceStatus] = useState<'CORRECT' | 'WRONG' | null>(null);

  // States for Phase 2: SPELLING
  const [scrambledLetters, setScrambledLetters] = useState<{ id: string; letter: string; isUsed: boolean }[]>([]);
  const [spelledLetters, setSpelledLetters] = useState<string[]>([]);
  const [spellingStatus, setSpellingStatus] = useState<'IDLE' | 'CORRECT' | 'WRONG'>('IDLE');

  const savedDifficulty = useMemo(() => {
    return localStorage.getItem('selected_adventure_difficulty') || 'PRIMARY';
  }, []);

  const cardsPerDay = stats.cardsPerDay || 5;

  const getLevelInfo = (levelId: number) => {
    let offset = 0;
    if (savedDifficulty === 'INTERMEDIATE') offset = 100;
    if (savedDifficulty === 'ADVANCED') offset = 200;

    const relativeId = levelId - offset;
    const cardsOfDifficulty = ALL_CARDS.filter(card => (card.difficulty || 'PRIMARY') === savedDifficulty);
    const levelCards = cardsOfDifficulty.slice((relativeId - 1) * cardsPerDay, relativeId * cardsPerDay);
    
    // Level name matching Fig 2
    let levelName = levelCards[0]?.levelName || `中级课时 ${relativeId}`;
    if (!levelName.includes('课时') && !levelName.includes('Section')) {
      levelName = `${savedDifficulty === 'ADVANCED' ? '高级' : savedDifficulty === 'INTERMEDIATE' ? '中级' : '初级'}课时 ${relativeId}`;
    }
    const words = levelCards.flatMap(c => c.words);

    return {
      id: levelId,
      displayId: relativeId,
      name: levelName,
      words,
    };
  };

  // 1. 最近学过的关卡 (Last Learned Level) - Styled exactly like Fig 2
  const lastLearnedLevel = useMemo(() => {
    const completed = stats.completedLevelIds || [];
    if (completed.length > 0) {
      const levelId = Number(completed[completed.length - 1]);
      return getLevelInfo(levelId);
    }
    return null;
  }, [stats.completedLevelIds, savedDifficulty, cardsPerDay]);

  // 2. 按记忆曲线需要复习的其他关卡 (Spaced Repetition due items)
  const dueReviews = useMemo(() => {
    const now = Date.now();
    const schedules = stats.reviewSchedules || {};
    
    return Object.entries(schedules)
      .filter(([_, s]: [string, any]) => now >= s.nextReviewAt)
      .map(([levelIdStr, _s]: [string, any]) => {
        const levelId = Number(levelIdStr);
        const info = getLevelInfo(levelId);
        // Spacing curve - magic concentration decays nicely over time
        const timeSinceDue = now - _s.nextReviewAt;
        const decayHours = timeSinceDue / (1000 * 60 * 60);
        const concentration = Math.max(10, Math.round(100 - (decayHours * 1.5)));
        return {
          ...info,
          concentration,
          intervalDays: _s.intervalDays,
        };
      })
      .sort((a, b) => a.concentration - b.concentration); // Most decayed levels first
  }, [stats.reviewSchedules, savedDifficulty, cardsPerDay]);

  const currentLevelWords = useMemo(() => {
    if (!selectedLevelId) return [];
    return getLevelInfo(selectedLevelId).words;
  }, [selectedLevelId]);

  // Launch review flow inside this modal
  const handleStartReview = (levelId: number) => {
    audio.playClick();
    setSelectedLevelId(levelId);
    setWordIdx(0);
    setReviewPhase('CHOICE');
    setIsReviewingWords(true);
  };

  const currentWord = useMemo(() => {
    if (!currentLevelWords || currentLevelWords.length === 0) return null;
    return currentLevelWords[wordIdx];
  }, [currentLevelWords, wordIdx]);

  // SPEAK WORD
  const speakCurrentWord = () => {
    if (currentWord) {
      audio.speak(currentWord.text);
    }
  };

  // ----------------------------------------------------
  // Phase 1: CHOICE LOGIC (English -> Chinese)
  // ----------------------------------------------------
  useEffect(() => {
    if (isReviewingWords && reviewPhase === 'CHOICE' && currentWord) {
      speakCurrentWord();
      // Generate options
      const correctText = currentWord.translation;
      const allWords = ALL_CARDS.flatMap(c => c.words);
      const uniqueTranslations = Array.from(new Set(allWords.map(w => w.translation))).filter(t => t !== correctText);
      const shuffledWrong = uniqueTranslations.sort(() => Math.random() - 0.5).slice(0, 3);
      const finalOptions = [...shuffledWrong, correctText].sort(() => Math.random() - 0.5);

      setChoiceOptions(finalOptions);
      setSelectedChoice(null);
      setChoiceStatus(null);
    }
  }, [isReviewingWords, reviewPhase, wordIdx, currentWord]);

  const handleChoiceSelect = (selected: string) => {
    if (selectedChoice !== null) return; // Prevent double taps during transition

    setSelectedChoice(selected);
    const isCorrect = selected === currentWord?.translation;

    if (isCorrect) {
      setChoiceStatus('CORRECT');
      audio.playPop();
      setTimeout(() => {
        if (wordIdx < currentLevelWords.length - 1) {
          setWordIdx(prev => prev + 1);
        } else {
          // Choice phase finished! Advance to Spelling phase
          audio.playSuccess();
          setReviewPhase('PHASE_TRANSITION');
        }
      }, 700);
    } else {
      setChoiceStatus('WRONG');
      audio.playError();
      setTimeout(() => {
        setSelectedChoice(null);
        setChoiceStatus(null);
      }, 900);
    }
  };

  // ----------------------------------------------------
  // Phase 2: SPELLING LOGIC (Chinese -> English)
  // ----------------------------------------------------
  useEffect(() => {
    if (isReviewingWords && reviewPhase === 'SPELLING' && currentWord) {
      audio.speak(currentWord.text);
      setSpelledLetters([]);
      setSpellingStatus('IDLE');

      const wordLetters = currentWord.text.toLowerCase().split('');
      const alphabet = 'abcdefghijklmnopqrstuvwxyz';
      const lettersNeeded = [...wordLetters];
      
      // Add a couple of decoy letters for added difficulty
      while (lettersNeeded.length < Math.max(6, wordLetters.length + 2)) {
        const decoy = alphabet[Math.floor(Math.random() * alphabet.length)];
        if (!lettersNeeded.includes(decoy)) {
          lettersNeeded.push(decoy);
        }
      }

      setScrambledLetters(
        lettersNeeded
          .sort(() => Math.random() - 0.5)
          .map((char, idx) => ({
            id: `bubble-${idx}-${Date.now()}`,
            letter: char,
            isUsed: false,
          }))
      );
    }
  }, [isReviewingWords, reviewPhase, wordIdx, currentWord]);

  const handleLetterTapped = (letterObj: { id: string; letter: string; isUsed: boolean }) => {
    if (spellingStatus === 'CORRECT') return;

    audio.playClick();
    const targetIdx = spelledLetters.length;
    const expectedLetter = currentWord?.text.toLowerCase().charAt(targetIdx);

    if (letterObj.letter === expectedLetter) {
      // Mark as used
      setScrambledLetters(prev => prev.map(l => l.id === letterObj.id ? { ...l, isUsed: true } : l));
      const nextSpelled = [...spelledLetters, letterObj.letter];
      setSpelledLetters(nextSpelled);

      // Check if word completed
      if (nextSpelled.join('') === currentWord?.text.toLowerCase()) {
        setSpellingStatus('CORRECT');
        audio.speak(currentWord?.text || '');
        confetti({
          particleCount: 20,
          spread: 30,
          origin: { y: 0.65 },
          colors: ['#10b981', '#fbbf24']
        });
        
        setTimeout(() => {
          if (wordIdx < currentLevelWords.length - 1) {
            setWordIdx(prev => prev + 1);
          } else {
            // Completed spell phase!
            setReviewPhase('VICTORY');
            audio.playCheer();
            confetti({
              particleCount: 120,
              spread: 80,
              origin: { y: 0.5 }
            });
          }
        }, 900);
      }
    } else {
      // Wrong tapping
      setSpellingStatus('WRONG');
      audio.playError();
      setTimeout(() => {
        setSpellingStatus('IDLE');
        // Reset spelling
        setSpelledLetters([]);
        setScrambledLetters(prev => prev.map(l => ({ ...l, isUsed: false })));
      }, 900);
    }
  };

  const handleResetSpelling = () => {
    audio.playClick();
    setSpelledLetters([]);
    setSpellingStatus('IDLE');
    setScrambledLetters(prev => prev.map(l => ({ ...l, isUsed: false })));
  };

  const handleClaimFinalReward = () => {
    audio.playClick();
    onCompleteReview();
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 30 }}
        className="bg-white rounded-[40px] shadow-2xl border-[4px] border-emerald-400 max-w-lg w-full relative overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Floating stars top accent */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 via-yellow-400 to-indigo-500 z-10" />

        {/* Modal Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 p-2 bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-600 rounded-2xl transition-all cursor-pointer border border-transparent hover:border-slate-300"
        >
          <X size={16} />
        </button>

        {/* ---------------------------------------------------- */}
        {/* LIST VIEW (Ebbinghaus & Last Learned level selection) */}
        {/* ---------------------------------------------------- */}
        {!isReviewingWords && (
          <div className="p-6 flex flex-col h-full overflow-hidden">
            {/* Header Title */}
            <div className="flex items-center space-x-3 mb-5 mt-2">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-100">
                <Activity size={24} className="animate-pulse" />
              </div>
              <div className="text-left">
                <h3 className="text-xl font-black text-slate-800 leading-tight">反复研习魔法</h3>
                <p className="text-[10px] uppercase font-black text-emerald-500 tracking-widest font-mono">Spaced Repetition & Spell Review</p>
              </div>
            </div>

            {/* Ebbinghaus Info Box */}
            <div className="bg-gradient-to-br from-[#ecfdf5] to-[#f0fdf4] rounded-3xl p-4 border border-emerald-100/60 leading-relaxed text-slate-600 text-xs font-bold mb-5 flex flex-col gap-1">
              <p className="text-emerald-800 font-extrabold flex items-center gap-1 text-xs">
                <Sparkles size={14} className="text-amber-400 animate-pulse" />
                <span>艾宾浩斯记忆防忘预警</span>
              </p>
              <p className="opacity-90 leading-normal text-[11px]">
                新学奥术词族在24h、3天、7天后具有极高的褪淡率。在此期间进行“反复研习”，可永久固结拼读魔力！
              </p>
            </div>

            <div className="flex-1 overflow-y-auto pr-1 space-y-5 custom-scrollbar mb-4 py-1 pb-4">
              {/* SECTION A: Last Study Card - Exactly structured like Fig 2 */}
              <div className="space-y-3">
                <div className="flex items-center gap-1 pl-1">
                  <span className="text-xs">📖</span>
                  <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest leading-none">
                    最近通关进度与推荐复习
                  </h4>
                </div>
                
                {lastLearnedLevel ? (
                  <div className="bg-white rounded-[32px] p-5 border-2 border-slate-100 shadow-sm flex items-center justify-between group hover:border-emerald-300 hover:shadow-md transition-all">
                    <div className="flex items-center space-x-3.5 mr-2">
                      <div className="w-12 h-12 bg-emerald-50 border border-emerald-100/50 rounded-2xl flex items-center justify-center text-2xl select-none shrink-0 shadow-inner">
                        📖
                      </div>
                      <div className="text-left">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-slate-800 text-sm">
                            第 {lastLearnedLevel.displayId} 关 · {lastLearnedLevel.name}
                          </span>
                          
                          {/* Vertical label matching Fig 2 */}
                          <div className="text-[8px] bg-emerald-100 text-emerald-800 font-extrabold px-1.5 py-0.5 rounded-md uppercase tracking-wider scale-95 select-none shrink-0 flex items-center gap-0.5">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                            <span>上次学习</span>
                          </div>
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 mt-2 line-clamp-2">
                          核心咒语 ({lastLearnedLevel.words.length} 词):{' '}
                          <span className="text-emerald-600 font-mono font-black">{lastLearnedLevel.words.map(w => w.text).join(', ')}</span>
                        </p>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleStartReview(lastLearnedLevel.id)}
                      className="bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-500 text-white font-black text-xs px-4.5 py-3 rounded-2xl shadow-md cursor-pointer hover:shadow-lg transition-all active:scale-95 shrink-0 flex items-center space-x-1"
                    >
                      <span>开启复习</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>
                ) : (
                  <div className="bg-slate-50 rounded-[32px] p-6 text-center border-2 border-dashed border-slate-200">
                    <p className="text-slate-400 font-semibold text-xs leading-normal">
                      目前尚无通关记录。首度出击，请先前往 <b className="text-emerald-600 cursor-pointer" onClick={() => onSelectReviewLevel(1)}>冒险森林</b> 学习并通关！
                    </p>
                  </div>
                )}
              </div>

              {/* SECTION B: Ebbinghaus list */}
              <div className="space-y-3.5">
                <div className="flex items-center justify-between px-1">
                  <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest leading-none">
                    记忆曲线即将过期的关卡（{dueReviews.length}）
                  </h4>
                  {dueReviews.length > 0 && (
                    <span className="text-[9px] bg-red-50 text-red-500 border border-red-100 font-black px-2 py-0.5 rounded-full animate-pulse">
                      能量衰退中
                    </span>
                  )}
                </div>

                <div className="space-y-3">
                  {dueReviews.map((level) => (
                    <div 
                      key={level.id}
                      className="bg-white rounded-[32px] p-5 border-2 border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between hover:border-indigo-200 transition-all gap-4"
                    >
                      <div className="flex-1 text-left min-w-0">
                        <div className="flex items-center space-x-2.5">
                          <span className="w-6 h-6 bg-slate-50 border border-slate-200 rounded-full flex items-center justify-center text-[10px] font-black text-slate-500">
                            {level.displayId}
                          </span>
                          <span className="font-extrabold text-slate-800 text-sm truncate">
                            第 {level.displayId} 关 · {level.name}
                          </span>
                        </div>
                        
                        {/* Memory Decay Bar Indicator */}
                        <div className="mt-3.5 space-y-1">
                          <div className="flex items-center justify-between text-[9px] font-extrabold text-slate-400">
                            <span>魔力残留度</span>
                            <span className={level.concentration <= 30 ? 'text-rose-500 font-black' : 'text-slate-400'}>
                              {level.concentration}%
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${level.concentration}%` }}
                              className={`h-full rounded-full ${
                                level.concentration <= 30 
                                  ? 'bg-gradient-to-r from-red-400 to-rose-500'
                                  : 'bg-gradient-to-r from-emerald-400 to-indigo-500'
                              }`}
                            />
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleStartReview(level.id)}
                        className="bg-white hover:bg-emerald-50/50 text-emerald-600 hover:text-emerald-700 font-black text-xs px-4 py-3 rounded-2xl border-2 border-emerald-100 hover:border-emerald-200 transition-all cursor-pointer active:scale-95 shrink-0 text-center"
                      >
                        唤醒魔力 ⚡
                      </button>
                    </div>
                  ))}

                  {dueReviews.length === 0 && (
                    <div className="bg-slate-50 rounded-[32px] p-6 text-center border-2 border-dashed border-slate-200/80">
                      <div className="text-3xl mb-1 select-none">🛡️</div>
                      <h5 className="font-extrabold text-slate-700 text-xs mb-1">守护力充盈！</h5>
                      <p className="text-[10.5px] font-bold text-slate-400 max-w-xs mx-auto leading-normal">
                        所有的艾宾浩斯抗褪巩固均已拉满。去探索新拼读或前往商店消费吧！
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-slate-100 pt-4 flex justify-between items-center shrink-0">
              <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                <span>🛡️ 复学巩固，抵抗遗忘</span>
              </span>
              <button
                onClick={onClose}
                className="text-xs font-black text-emerald-600 hover:underline"
              >
                结束关闭
              </button>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* REVIEW ACTIVE INTERACTIVE GAMEPLAY LAYOUT */}
        {/* ---------------------------------------------------- */}
        {isReviewingWords && (
          <div className="p-6 flex flex-col h-full justify-between select-none">
            {/* Top header navigation */}
            <div className="flex items-center justify-between pb-3 border-b border-light-100">
              <span className="bg-emerald-50 text-emerald-800 font-black text-[10px] px-3 py-1.5 rounded-full border border-emerald-100 shadow-sm flex items-center space-x-1">
                <span>🎯 复习进度：{wordIdx + 1} / {currentLevelWords.length}</span>
              </span>
              
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-mono text-slate-400">
                  {reviewPhase === 'CHOICE' ? '第一阶段：认字辨义' : reviewPhase === 'SPELLING' ? '第二阶段：拼读认写' : ''}
                </span>
                <button
                  onClick={() => setIsReviewingWords(false)}
                  className="text-[10px] text-slate-400 hover:text-slate-600 font-bold hover:underline"
                >
                  退出本次
                </button>
              </div>
            </div>

            {/* Main Interactive Stage Box */}
            <div className="flex-1 my-6 flex flex-col justify-center items-center min-h-[300px]">
              <AnimatePresence mode="wait">
                
                {/* CHOICE (English to Chinese MCQ) */}
                {reviewPhase === 'CHOICE' && currentWord && (
                  <motion.div
                    key="phase-choice"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="w-full space-y-6 flex flex-col items-center text-center"
                  >
                    <div className="space-y-2">
                      <div className="inline-flex items-center gap-1 bg-amber-50 border border-amber-200 text-amber-700 px-3 py-1 rounded-full text-[10px] font-black animate-pulse">
                        <span>第一阶段：看英文选中文 🌟</span>
                      </div>
                      
                      <h2 className="text-4xl font-black capitalize tracking-tight text-slate-800 font-sans mt-3">
                        {currentWord.text}
                      </h2>
                    </div>

                    {/* Speaker clicker */}
                    <button
                      onClick={speakCurrentWord}
                      className="p-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-full border border-emerald-100 transition-all scale-105 hover:scale-110 shadow-md cursor-pointer"
                    >
                      <Volume2 size={24} className="animate-pulse" />
                    </button>

                    {/* Options list */}
                    <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-3.5 max-w-sm mt-4">
                      {choiceOptions.map((opt, idx) => {
                        const isThisSelected = selectedChoice === opt;
                        let btnStyle = 'bg-slate-50 border-slate-200 hover:bg-slate-100 hover:border-slate-300 text-slate-700';
                        if (isThisSelected) {
                          btnStyle = choiceStatus === 'CORRECT' 
                            ? 'bg-emerald-500 border-emerald-600 text-white shadow-lg scale-102' 
                            : 'bg-red-500 border-red-600 text-white shadow-lg animate-shake animate-duration-200';
                        }
                        
                        return (
                          <button
                            key={idx}
                            disabled={selectedChoice !== null}
                            onClick={() => handleChoiceSelect(opt)}
                            className={`p-4 rounded-3xl border-2 font-black text-sm text-center transition-all cursor-pointer ${btnStyle}`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {/* TWO-PHASE TRANSITION GAVE OVERLAY */}
                {reviewPhase === 'PHASE_TRANSITION' && (
                  <motion.div
                    key="phase-transition"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="w-full text-center space-y-5 flex flex-col items-center"
                  >
                    <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center text-4xl shadow-inner animate-bounce">
                      🔑
                    </div>
                    <div className="space-y-4">
                      <h4 className="text-xl font-black text-slate-800">第一阶段 辨义顺利过关！</h4>
                      <p className="text-xs text-slate-400 font-bold max-w-xs mx-auto leading-relaxed">
                        现在，开启极具挑战的 <b>第二阶段：看中文拼写</b>！准备拼写出这些魔法字词吧。
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        audio.playClick();
                        setWordIdx(0);
                        setReviewPhase('SPELLING');
                      }}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs px-8 py-4 rounded-3xl shadow-lg cursor-pointer transform hover:scale-105 active:scale-95 transition-all"
                    >
                      开启拼词大挑战 ✨
                    </button>
                  </motion.div>
                )}

                {/* SPELLING (Chinese to English Input bubbles) */}
                {reviewPhase === 'SPELLING' && currentWord && (
                  <motion.div
                    key="phase-spelling"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="w-full space-y-6 flex flex-col items-center text-center"
                  >
                    <div className="space-y-2">
                      <div className="inline-flex items-center gap-1 bg-violet-50 border border-violet-200 text-violet-700 px-3 py-1 rounded-full text-[10px] font-black animate-pulse">
                        <span>第二阶段：看中文拼写 🔑🧩</span>
                      </div>
                      <h2 className="text-3xl font-black text-slate-800 mt-2 font-mono">
                        {currentWord.translation}
                      </h2>
                    </div>

                    {/* Display current typed blanks */}
                    <div className="flex items-center justify-center space-x-2 min-h-[50px] bg-slate-50 border-2 border-slate-100 px-4 py-2 rounded-2xl w-full max-w-xs">
                      {spelledLetters.length === 0 ? (
                        <div className="text-[10px] font-black text-slate-400 tracking-wider">点击字母进行拼写...</div>
                      ) : (
                        spelledLetters.map((letter, i) => (
                          <motion.span
                            key={i}
                            initial={{ scale: 0.5, y: -5 }}
                            animate={{ scale: 1, y: 0 }}
                            className={`w-9 h-9 border-b-4 font-black text-[15px] rounded-xl flex items-center justify-center uppercase ${
                              spellingStatus === 'CORRECT' 
                                ? 'bg-emerald-500 text-white border-emerald-600'
                                : spellingStatus === 'WRONG'
                                ? 'bg-red-500 text-white border-red-600'
                                : 'bg-amber-400 text-slate-800 border-amber-500'
                            }`}
                          >
                            {letter}
                          </motion.span>
                        ))
                      )}

                      {/* Reset back to zero */}
                      {spelledLetters.length > 0 && spellingStatus !== 'CORRECT' && (
                        <button
                          onClick={handleResetSpelling}
                          className="ml-2.5 p-1.5 bg-slate-200 hover:bg-slate-300 text-slate-500 hover:text-slate-700 rounded-lg cursor-pointer"
                        >
                          <RotateCcw size={12} />
                        </button>
                      )}
                    </div>

                    {/* Scrambled alphabet bubbles */}
                    <div className="flex flex-wrap items-center justify-center gap-2 max-w-sm mt-2">
                      {scrambledLetters.map((obj) => (
                        <motion.button
                          key={obj.id}
                          disabled={obj.isUsed || spellingStatus !== 'IDLE'}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleLetterTapped(obj)}
                          className={`w-10 h-10 font-mono font-black text-[15px] rounded-full shadow border-2 uppercase transition-all flex items-center justify-center ${
                            obj.isUsed
                              ? 'bg-slate-100 text-slate-300 border-slate-200 cursor-not-allowed opacity-40'
                              : spellingStatus === 'WRONG'
                              ? 'bg-red-500 text-white border-red-600'
                              : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 cursor-pointer active:scale-95'
                          }`}
                        >
                          {obj.letter}
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* VICTORY COMPLETED STAGE */}
                {reviewPhase === 'VICTORY' && (
                  <motion.div
                    key="phase-victory"
                    initial={{ scale: 0.85, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.85, opacity: 0 }}
                    className="w-full text-center space-y-6 flex flex-col items-center py-4"
                  >
                    <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-amber-500 text-white rounded-full flex items-center justify-center text-5xl shadow-xl shadow-amber-100 relative">
                      🏆
                      <div className="absolute inset-0 bg-yellow-400/20 rounded-full blur-2xl animate-pulse" />
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-2xl font-black text-slate-800 leading-none">抗忘复习圆满完成！</h4>
                      <p className="text-[11px] text-slate-400 font-extrabold tracking-wide uppercase">
                        艾宾浩斯记忆网抗阻已全面提升（魔力留存100%）
                      </p>
                    </div>

                    {/* Floating Reward Item details */}
                    <div className="bg-slate-50 border border-slate-150 p-4 rounded-[28px] max-w-xs w-full space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-xl">✨</span>
                          <span className="text-xs font-black text-slate-700">奥术学术经验 (XP)</span>
                        </div>
                        <span className="text-xs font-black text-emerald-600">+300 XP</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-xl">🪙</span>
                          <span className="text-xs font-black text-slate-700">获得星星魔法币</span>
                        </div>
                        <span className="text-xs font-black text-amber-500">+50 金币</span>
                      </div>
                    </div>

                    <button
                      onClick={handleClaimFinalReward}
                      className="w-full max-w-sm bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-white font-black text-sm py-4 rounded-3xl cursor-pointer border-b-4 border-amber-600 active:border-b-0 active:translate-y-1 transition-all shadow-lg hover:shadow-xl mt-4"
                    >
                      领取复习宝箱 🎁✨
                    </button>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
