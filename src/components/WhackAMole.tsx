
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WordGroup } from '../types';
import { Hammer, Star, Heart, Zap, Sparkles, Trophy, X, Volume2 } from 'lucide-react';
import audio from '../utils/AudioUtils';
import confetti from 'canvas-confetti';

interface Props {
  groups: WordGroup[];
  isReviewMode?: boolean;
  onFinish: (score: number, coins: number) => void;
  onMistake: (wordText: string) => void;
  onSuccess: (wordText: string) => void;
  onClose: () => void;
}

export const WhackAMole: React.FC<Props> = ({ groups, isReviewMode, onFinish, onMistake, onSuccess, onClose }) => {
  const [score, setScore] = useState(0);
  const [hearts, setHearts] = useState(3);
  const [timeLeft, setTimeLeft] = useState(45);
  const [isGameOver, setIsGameOver] = useState(false);
  const [activeHole, setActiveHole] = useState<number | null>(null);
  const [holeContent, setHoleContent] = useState<{ translation: string, isTarget: boolean } | null>(null);
  const [clearedWords, setClearedWords] = useState<Set<string>>(new Set());
  const [showCelebration, setShowCelebration] = useState(false);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [combo, setCombo] = useState(0);
  const [feedback, setFeedback] = useState<{ text: string, subtext: string, color: string, bgColor: string, borderColor: string } | null>(null);

  const feedbackLevels = [
    { 
      threshold: 2, 
      slogans: ['连连净化!', '精准打击!', '林间卫士!', '草丛之灵!', '守护微光!'],
      subtext: 'COMBO BURST',
      color: 'text-sky-600',
      bgColor: 'bg-sky-50',
      borderColor: 'border-sky-200'
    },
    { 
      threshold: 5, 
      slogans: ['净化之光!', '森之英雄!', '灵能爆发!', '圣洁之力!', '破晓而生!'],
      subtext: 'PURE SPIRIT',
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200'
    },
    { 
      threshold: 10, 
      slogans: ['魔力禁域!', '万物归元!', '森林主宰!', '自然之怒!', '神迹降临!'],
      subtext: 'ULTIMATE',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-200'
    },
  ];

  const triggerFeedback = (count: number) => {
    const level = [...feedbackLevels].reverse().find(l => count >= l.threshold);
    if (level) {
      const randomSlogan = level.slogans[Math.floor(Math.random() * level.slogans.length)];
      setFeedback({ 
        text: randomSlogan, 
        subtext: level.subtext,
        color: level.color,
        bgColor: level.bgColor,
        borderColor: level.borderColor
      });
      setTimeout(() => setFeedback(null), 1200);
    }
  };

  const pool = useMemo(() => {
    if (isReviewMode) {
      const reviewWords = groups.filter(g => (g.learned && g.nextReview < Date.now()) || g.lastIncorrect).flatMap(g => g.words);
      return reviewWords.length > 0 ? reviewWords : (groups[0]?.words || []);
    }
    const activeGroup = groups.find(g => !g.learned) || groups[0];
    return activeGroup ? activeGroup.words : [];
  }, [groups, isReviewMode]);

  const targetWord = useMemo(() => {
    const remaining = pool.filter(w => !clearedWords.has(w.text));
    return remaining.length > 0 ? remaining[0] : null;
  }, [pool, clearedWords]);

  useEffect(() => {
    if (!isGameStarted || isGameOver || !targetWord) return;
    
    const gameTimer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    const moleTimer = setInterval(spawnMole, Math.max(800, 1500 - (60 - timeLeft) * 20)); 
    return () => { clearInterval(gameTimer); clearInterval(moleTimer); };
  }, [isGameStarted, isGameOver, targetWord, pool]);

  const speak = (text: string) => {
    audio.speak(text);
  };

  const spawnMole = () => {
    if (isGameOver || showCelebration || !targetWord) return;
    
    const newHole = Math.floor(Math.random() * 9);
    const isTarget = Math.random() < 0.6;
    const translation = isTarget 
      ? targetWord.translation 
      : pool[Math.floor(Math.random() * pool.length)].translation;
    
    setHoleContent({ translation, isTarget });
    setActiveHole(newHole);
    
    // Add a quick flash to the hole
    audio.playClick();

    if (Math.random() > 0.4) {
       speak(targetWord.text);
    }

    setTimeout(() => {
      setActiveHole(null);
      setHoleContent(null);
    }, Math.max(900, 1800 - (60 - timeLeft) * 15)); 
  };

  const handleWhack = (idx: number) => {
    if (idx !== activeHole || !holeContent || showCelebration) return;
    
    if (holeContent.isTarget) {
      audio.playSuccess();
      const newCombo = combo + 1;
      setCombo(newCombo);
      triggerFeedback(newCombo);
      
      const comboBonus = Math.floor(newCombo / 2) * 20;
      const timeLeftBonus = timeLeft > 30 ? 50 : 0;
      setScore(prev => prev + 250 + timeLeftBonus + comboBonus);
      onSuccess(targetWord.text);
      
      setShowCelebration(true);
      setActiveHole(null);
      
      confetti({
        particleCount: 20 + newCombo * 5,
        spread: 60 + newCombo * 2,
        origin: { y: 0.7 },
        colors: ['#10b981', '#fbbf24', '#6366f1']
      });

      setTimeout(() => {
        setShowCelebration(false);
        const newCleared = new Set(clearedWords);
        newCleared.add(targetWord.text);
        setClearedWords(newCleared);
        
        if (newCleared.size === pool.length) { 
          endGame(); 
        }
      }, 1000);
    } else {
      audio.playError();
      setCombo(0);
      if (onMistake && targetWord) {
        onMistake(targetWord.text);
      }
      setHearts(prev => {
        if (prev <= 1) {
          endGame();
          return 0;
        }
        return prev - 1;
      });
      setActiveHole(null);
      setHoleContent(null);
    }
  };

  const endGame = () => {
    setIsGameOver(true);
    audio.playCheer();
    onFinish(score, Math.floor(score / 30));
  };

  if (!isGameStarted) {
    return (
      <div className="fixed inset-0 bg-emerald-50 z-[100] flex items-center justify-center p-6">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-[48px] p-10 shadow-2xl border-4 border-emerald-100 text-center space-y-6 max-w-sm w-full"
        >
          <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
             <Hammer size={48} className="text-emerald-600 rotate-12" />
          </div>
          <h2 className="text-3xl font-black text-slate-800">地鼠行动</h2>
          <p className="text-slate-500 font-bold leading-relaxed px-4">
            听单词发音，在洞穴中寻找对应的中文含义。打中它！
          </p>
          <button 
            onClick={() => { audio.playClick(); setIsGameStarted(true); }}
            className="w-full py-5 bg-emerald-500 text-white rounded-[32px] font-black text-xl shadow-xl shadow-emerald-100 uppercase tracking-widest"
          >
            开始任务
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-indigo-950 z-[100] flex flex-col font-sans overflow-hidden">
      {/* Background Portal Effect */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.15)_0%,transparent_70%)]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border-2 border-indigo-500/20 rounded-full animate-magic-rotate opacity-20" />
      </div>

      {/* Header */}
      <div className="p-6 flex items-center justify-between bg-white/5 backdrop-blur-xl border-b border-white/10 relative z-20">
        <div className="flex items-center space-x-4">
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-2xl transition-all">
            <X size={28} className="text-white/50 hover:text-white" />
          </button>
          <div>
            <h2 className="text-xl font-black text-white tracking-tight leading-none mb-1">次元净化</h2>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-black text-indigo-400 tracking-widest uppercase">Portal Purge</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-6">
          <div className="flex space-x-1.5">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                animate={i < hearts ? { scale: [1, 1.2, 1] } : { scale: 0.8, opacity: 0.3 }}
              >
                <Heart className={`w-6 h-6 transition-all duration-300 ${i < hearts ? 'text-rose-500 fill-rose-500 filter drop-shadow-sm' : 'text-white/10'}`} />
              </motion.div>
            ))}
          </div>
          <div className="bg-white/10 backdrop-blur-md px-5 py-2.5 rounded-2xl font-black text-indigo-300 border border-white/10 tabular-nums">
            {timeLeft}s
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col p-6 space-y-6 overflow-hidden relative z-10">
        {/* Target Word Display */}
        <motion.div 
          layout
          className="bg-white/5 backdrop-blur-2xl rounded-[48px] p-8 border border-white/10 shadow-2xl relative overflow-hidden text-center magic-glow-pulse"
        >
          <AnimatePresence>
            {feedback && (
              <motion.div 
                initial={{ scale: 0.6, opacity: 0, y: 50, rotate: 5 }}
                animate={{ scale: 1, opacity: 1, y: -100, rotate: 0 }}
                exit={{ scale: 1.2, opacity: 0, y: -140 }}
                className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none"
              >
                <div className={`flex flex-col items-center justify-center ${feedback.bgColor} ${feedback.borderColor} border-2 px-8 py-3.5 rounded-[32px] shadow-[0_20px_40px_rgba(0,0,0,0.12)] backdrop-blur-md`}>
                  <div className="flex items-center space-x-2 mb-0.5">
                    <Zap className={feedback.color} size={15} fill="currentColor" />
                    <span className={`text-[9px] font-black uppercase tracking-[0.3em] ${feedback.color} opacity-70`}>
                      {feedback.subtext}
                    </span>
                    <Zap className={feedback.color} size={15} fill="currentColor" />
                  </div>
                  <div className={`${feedback.color} font-black text-3xl tracking-tight italic`}>
                    {feedback.text}
                  </div>
                </div>
              </motion.div>
            )}
            
            {combo >= 2 && (
               <motion.div
                 key="combo-puck"
                 initial={{ x: -50, opacity: 0, scale: 0.5 }}
                 animate={{ x: 0, opacity: 1, scale: 1 }}
                 className="absolute top-4 left-6 bg-gradient-to-r from-amber-400 to-orange-500 text-white px-5 py-2 rounded-2xl font-black text-sm italic shadow-xl z-40 border-b-4 border-orange-700 flex items-center space-x-2"
               >
                 <Zap size={16} className="animate-pulse" />
                 <span>{combo} COMBO!</span>
               </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {showCelebration ? (
              <motion.div 
                key="yay"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.2 }}
                className="absolute inset-0 bg-indigo-600 flex items-center justify-center z-10"
              >
                <div className="flex items-center space-x-3 text-white">
                  <Sparkles size={32} className="animate-pulse" />
                  <span className="text-4xl font-black tracking-tight">净化成功!</span>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key={targetWord?.text || 'empty'}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-center space-x-3">
                  <div className="h-px w-10 bg-indigo-500/30" />
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400">{clearedWords.size} / {pool.length} SPIRITS</span>
                  <div className="h-px w-10 bg-indigo-500/30" />
                </div>
                <div className="flex items-center justify-center space-x-6">
                   <h2 className="text-6xl font-black text-white tracking-tight">
                     {targetWord?.text}
                   </h2>
                   <button 
                     onClick={() => speak(targetWord?.text || '')}
                     className="w-14 h-14 bg-white/10 text-white rounded-2xl hover:bg-white/20 transition-all active:scale-90 border border-white/10 flex items-center justify-center shadow-lg"
                   >
                     <Volume2 size={32} />
                   </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Game Grid */}
        <div className="flex-1 grid grid-cols-3 gap-4 sm:gap-10 items-center justify-center relative py-6">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="relative aspect-square group">
              {/* Portal Hole */}
              <div className="absolute inset-0 bg-black/40 rounded-full shadow-[inset_0_0_20px_rgba(0,0,0,0.8)] border-b-2 border-white/5 overflow-hidden">
                 <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent,rgba(99,102,241,0.1),transparent)] animate-magic-rotate opacity-50" />
              </div>
              
              {/* Magic Orb / Gopher */}
              <AnimatePresence>
                {activeHole === i && holeContent && (
                  <motion.button
                    initial={{ y: 80, opacity: 0, scale: 0.5 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    exit={{ y: 80, opacity: 0, scale: 0.5 }}
                    onClick={() => handleWhack(i)}
                    className="absolute inset-[-10px] flex flex-col items-center justify-center z-20 group"
                  >
                    <div className={`w-full h-full rounded-full border-4 shadow-[0_0_30px_rgba(255,255,255,0.2)] flex items-center justify-center p-4 relative overflow-hidden transition-all group-active:scale-95 border-white
                      ${holeContent.isTarget ? 'bg-gradient-to-br from-indigo-400 to-indigo-600' : 'bg-gradient-to-br from-slate-600 to-slate-800'}
                    `}>
                       <span className="font-black text-sm sm:text-base text-white px-1 leading-tight relative z-10 break-words w-full text-center drop-shadow-md">
                         {holeContent.translation}
                       </span>
                       {/* Aura */}
                       <div className="absolute inset-0 bg-white/10 animate-pulse" />
                    </div>
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Stat */}
      <div className="px-10 pb-12 pt-4 bg-white/50 backdrop-blur-md rounded-t-[48px] flex items-center justify-between border-t-2 border-emerald-100 shadow-inner">
         <div className="flex items-center space-x-3">
           <div className="bg-amber-100 p-2 rounded-xl text-amber-600">
             <Star size={20} className="fill-amber-600" />
           </div>
           <div>
             <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Score</div>
             <div className="text-xl font-black text-slate-800 tabular-nums">{score}</div>
           </div>
         </div>
         <div className="bg-emerald-500 text-white px-6 py-2 rounded-2xl font-black text-sm shadow-lg shadow-emerald-100">
           {Math.floor((clearedWords.size / pool.length) * 100)}%
         </div>
      </div>

      {/* End Game Modal */}
      <AnimatePresence>
        {isGameOver && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-emerald-950/90 backdrop-blur-xl"
          >
            <motion.div 
              initial={{ scale: 0.8, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-[56px] p-10 max-w-sm w-full shadow-2xl text-center space-y-8 border-4 border-emerald-100"
            >
              <div className="text-7xl">🏅</div>
              <div className="space-y-2">
                <h3 className="text-4xl font-black text-slate-900 tracking-tight">行动圆满！</h3>
                <p className="text-slate-500 font-bold">地鼠单词已经全部被魔法感化。</p>
              </div>
              
              <div className="bg-emerald-50 rounded-3xl p-6 space-y-2 border-2 border-emerald-100">
                <div className="flex justify-between items-center text-emerald-800 font-black">
                  <span>最终得分</span>
                  <span className="text-2xl">{score}</span>
                </div>
                <div className="flex justify-between items-center text-amber-600 font-bold text-sm">
                  <span>获得星币</span>
                  <div className="flex items-center">
                    <Star size={14} className="mr-1 fill-amber-600" />
                    {Math.floor(score / 30)}
                  </div>
                </div>
              </div>

              <button 
                onClick={onClose}
                className="w-full py-5 bg-emerald-500 text-white rounded-[32px] font-black text-xl shadow-xl shadow-emerald-200"
              >
                领取并返回
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WhackAMole;
