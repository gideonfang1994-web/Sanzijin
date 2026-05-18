
import React, { useState, useEffect, useMemo } from 'react';
import { WordGroup, WordItem } from '../types';
import { Timer, Star, Zap, Headphones, Trophy, X, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import audio from '../utils/AudioUtils';
import confetti from 'canvas-confetti';
import SafeImage from './SafeImage';

interface Props {
  groups: WordGroup[];
  isReviewMode?: boolean;
  onFinish: (score: number, coins: number) => void;
  onClose: () => void;
}

const LetterScramble: React.FC<Props> = ({ groups, isReviewMode, onFinish, onClose }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [scrambled, setScrambled] = useState<{char: string, id: number}[]>([]);
  const [guess, setGuess] = useState<{char: string, id: number}[]>([]);
  const [isGameOver, setIsGameOver] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [combo, setCombo] = useState(0);
  const [isWrong, setIsWrong] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string, subtext: string, color: string, bgColor: string, borderColor: string } | null>(null);

  const feedbackLevels = [
    { 
      threshold: 2, 
      slogans: ['林间疾风!', '灵感火花!', '初露锋芒!', '草木共鸣!', '星火燎原!'],
      subtext: 'LEVEL UP',
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200'
    },
    { 
      threshold: 5, 
      slogans: ['丛林智者!', '词海弄潮!', '秘境探险!', '博雅之才!', '灵犀一指!'],
      subtext: 'EXPERT',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200'
    },
    { 
      threshold: 10, 
      slogans: ['森罗万象!', '神迹降临!', '星辰指引!', '绝对掌控!', '词灵合一!'],
      subtext: 'LEGEND',
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
    return groups.flatMap(g => g.words);
  }, [groups]);

  const currentWord = useMemo(() => {
    if (currentIdx < pool.length) return pool[currentIdx];
    return null;
  }, [pool, currentIdx]);

  const speak = (text: string) => {
    if (!text) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.8;
    window.speechSynthesis.speak(utterance);
  };

  const initRound = () => {
    if (!currentWord) {
      handleGameEnd();
      return;
    }
    const word = currentWord.text.toLowerCase();
    const letters = word.split('').map((l, i) => ({ char: l, id: Math.random() + i }));
    setScrambled([...letters].sort(() => 0.5 - Math.random()));
    setGuess([]);
    setTimeLeft(30);
    setIsWrong(false);
    setTimeout(() => speak(word), 400);
  };

  useEffect(() => {
    audio.init();
    if (pool.length > 0) initRound();
  }, [currentIdx, pool]);

  useEffect(() => {
    if (timeLeft <= 0 && !isGameOver && !isWrong) {
      setCombo(0);
      moveToNext();
      return;
    }
    const timer = !isGameOver && timeLeft > 0 && setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => timer && clearInterval(timer);
  }, [timeLeft, isGameOver]);

  const moveToNext = () => {
    if (currentIdx + 1 >= pool.length) {
      handleGameEnd();
    } else {
      setCurrentIdx(prev => prev + 1);
    }
  };

  const handleLetterClick = (item: {char: string, id: number}, index: number) => {
    if (isWrong || isGameOver || !currentWord) return;
    audio.playClick();
    
    const newGuess = [...guess, item];
    setGuess(newGuess);
    setScrambled(prev => prev.filter((_, i) => i !== index));

    const targetWord = currentWord.text.toLowerCase();
    const currentStr = newGuess.map(g => g.char).join('');

    if (!targetWord.startsWith(currentStr)) {
      triggerError();
      return;
    }

    if (currentStr === targetWord) {
      triggerSuccess();
    }
  };

  const triggerError = () => {
    audio.playError();
    setIsWrong(true);
    setCombo(0);
    setTimeout(() => {
      setGuess([]);
      if (currentWord) {
        const letters = currentWord.text.toLowerCase().split('').map((l, i) => ({ char: l, id: Math.random() + i }));
        setScrambled(letters.sort(() => 0.5 - Math.random()));
      }
      setIsWrong(false);
    }, 600);
  };

  const triggerSuccess = () => {
    audio.playSuccess();
    const earned = 200 + timeLeft * 10 + (combo * 50);
    setScore(prev => prev + earned);
    const newCombo = combo + 1;
    setCombo(newCombo);
    triggerFeedback(newCombo);
    
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#F43F5E', '#34D399', '#60A5FA']
    });

    setTimeout(() => moveToNext(), 1000);
  };

  const handleGameEnd = () => {
    if (isGameOver) return;
    setIsGameOver(true);
    audio.playCheer();
    onFinish(score, Math.floor(score / 50));
  };

  if (isGameOver || (pool.length > 0 && currentIdx >= pool.length)) {
    return (
      <div className="flex flex-col items-center justify-center h-full animate-in zoom-in-95 duration-700">
        <div className="bg-white rounded-[60px] p-8 shadow-2xl border-[12px] border-amber-400 text-center w-full max-w-sm relative">
          <div className="absolute -top-14 left-1/2 -translate-x-1/2 w-24 h-24 bg-amber-500 rounded-[36px] flex items-center justify-center border-4 border-white shadow-2xl rotate-12">
            <Trophy className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-3xl font-black text-slate-800 mt-8 mb-2 font-heading italic">魔法拼词大师</h2>
          <p className="text-slate-400 font-bold mb-6 text-sm">你完成了本次所有的挑战任务！</p>
          <div className="bg-amber-50 rounded-[32px] p-6 border-4 border-amber-100 mb-8 card-inner-shadow">
            <p className="text-amber-500 font-black uppercase tracking-[0.2em] text-[10px] mb-1">Adventure Score</p>
            <p className="text-6xl font-black text-amber-600 italic font-heading tabular-nums">{score}</p>
          </div>
          <button onClick={onClose} className="w-full puffy-button bg-amber-500 text-white py-5 rounded-[28px] font-black text-lg shadow-lg border-b-[8px] border-amber-700 active:border-b-0 transition-all">
            领取奖励并返回
          </button>
        </div>
      </div>
    );
  }

  if (pool.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <div className="bg-white p-8 rounded-[48px] shadow-puffy border-4 border-white flex flex-col items-center">
          <SafeImage src="https://img.icons8.com/bubbles/150/empty-box.png" className="w-40 h-40 mb-4" width="160" height="160" />
          <h2 className="text-2xl font-black text-slate-700 font-heading">魔法宝箱空空如也</h2>
          <p className="text-slate-400 font-bold mt-2 max-w-[200px] text-sm">看来今天还没有开启新的冒险词汇呢！</p>
          <button onClick={onClose} className="mt-8 puffy-button px-8 py-4 bg-indigo-600 text-white rounded-[24px] font-black text-base">回到森林开启冒险</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full space-y-4 font-sans relative overflow-hidden">
      {/* Combo feedback overlay */}
      <AnimatePresence>
        {feedback && (
          <motion.div 
            initial={{ scale: 0.6, opacity: 0, y: 100, rotate: -5 }}
            animate={{ scale: 1, opacity: 1, y: -100, rotate: 0 }}
            exit={{ scale: 1.2, opacity: 0, y: -140 }}
            className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none"
          >
            <div className={`flex flex-col items-center justify-center ${feedback.bgColor} ${feedback.borderColor} border-2 px-8 py-3.5 rounded-[32px] shadow-[0_20px_40px_rgba(0,0,0,0.12)] backdrop-blur-md`}>
              <div className="flex items-center space-x-2 mb-0.5">
                <Sparkles className={feedback.color} size={16} />
                <span className={`text-[9px] font-black uppercase tracking-[0.3em] ${feedback.color} opacity-70`}>
                  {feedback.subtext}
                </span>
                <Sparkles className={feedback.color} size={16} />
              </div>
              <div className={`${feedback.color} font-black text-3xl tracking-tight italic`}>
                {feedback.text}
              </div>
              <div className="mt-2 flex space-x-1">
                 {[...Array(3)].map((_, i) => (
                   <motion.div
                     key={i}
                     animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0.8, 0.3] }}
                     transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                     className={`w-1 h-1 rounded-full ${feedback.color} bg-current`}
                   />
                 ))}
              </div>
            </div>
          </motion.div>
        )}
        
        {combo >= 2 && (
           <motion.div
             key="combo-badge"
             initial={{ x: 50, opacity: 0, scale: 0.5 }}
             animate={{ x: 0, opacity: 1, scale: 1 }}
             className="absolute top-24 right-6 bg-gradient-to-r from-amber-400 to-orange-500 text-white px-5 py-2 rounded-2xl font-black text-sm italic shadow-xl z-40 border-b-4 border-orange-700 flex items-center space-x-2"
           >
             <Zap size={16} className="animate-pulse" />
             <span>{combo} COMBO!</span>
           </motion.div>
        )}
      </AnimatePresence>

      {/* Dynamic Header */}
      <div className="flex items-center justify-between bg-white/80 backdrop-blur-md rounded-[32px] p-4 shadow-sm border-2 border-indigo-50 relative z-20">
        <button onClick={onClose} className="p-2 hover:bg-rose-50 rounded-xl transition-all group">
          <X size={20} className="text-slate-400 group-hover:text-rose-500" />
        </button>
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-100 border-b-4 border-orange-700">
            <Star className="w-6 h-6 text-white fill-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-[8px] font-black text-amber-500 uppercase tracking-widest leading-none mb-1">Adventure Score</span>
            <span className="font-black text-xl text-slate-800 tabular-nums leading-none">{score}</span>
          </div>
        </div>
        <div className="flex items-center space-x-4">
           <div className="flex flex-col items-end">
             <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Progress</span>
             <div className="text-slate-500 font-black text-xs tabular-nums">{currentIdx + 1} / {pool.length}</div>
           </div>
           <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center relative overflow-hidden">
              <motion.div 
                animate={{ height: `${(timeLeft / 30) * 100}%` }}
                className="absolute bottom-0 left-0 right-0 bg-indigo-500/20"
              />
              <span className={`font-black text-indigo-600 relative z-10 tabular-nums ${timeLeft < 10 ? 'text-rose-500 animate-pulse' : ''}`}>{timeLeft}</span>
           </div>
        </div>
      </div>

      <div className={`flex-1 bg-white rounded-[56px] shadow-2xl p-8 flex flex-col items-center justify-between relative overflow-hidden transition-all duration-500 border-4 border-white ${isWrong ? 'bg-rose-50 shake' : 'magic-glow-pulse'}`}>
        
        {/* Magical Background deco */}
        <div className="absolute inset-x-0 top-0 h-2 bg-slate-50 overflow-hidden">
           <motion.div 
             className="h-full bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500"
             animate={{ width: `${((currentIdx + 1) / pool.length) * 100}%` }}
           />
        </div>

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.05)_0%,transparent_70%)] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] border border-indigo-100 rounded-full opacity-20 pointer-events-none animate-magic-rotate" />

        <div className="w-full flex flex-col items-center space-y-6 relative z-10">
          <div className="inline-flex items-center px-6 py-2.5 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100 font-black text-sm shadow-sm group cursor-help transition-all hover:bg-white" onClick={() => speak(currentWord?.text || '')}>
             <Headphones size={18} className="mr-2 group-hover:scale-110" />
             <span>{currentWord?.translation}</span>
          </div>

          <motion.div 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="cursor-pointer group relative" 
            onClick={() => speak(currentWord?.text || '')}
          >
            <div className="absolute inset-[-20px] bg-indigo-400 blur-3xl opacity-10 rounded-full animate-pulse" />
            <SafeImage 
              src={currentWord?.imageUrl || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${currentWord?.text}`} 
              className={`w-44 h-44 object-contain relative z-10 drop-shadow-[0_20px_40px_rgba(0,0,0,0.1)] transition-all ${isWrong ? 'grayscale opacity-50 px-4' : ''}`} 
              alt="word" 
              fallbackText={currentWord?.text}
              width="176"
              height="176"
            />
          </motion.div>
        </div>

        <div className={`flex flex-wrap justify-center gap-3 mt-4 min-h-[90px] relative z-10`}>
          {currentWord?.text.split('').map((_, i) => (
            <div 
              key={i} 
              className={`w-14 h-18 rounded-[24px] border-b-6 border-2 flex items-center justify-center text-3xl font-black transition-all duration-300 transform
                ${guess[i] 
                  ? 'bg-gradient-to-b from-indigo-500 to-indigo-700 border-indigo-900 text-white translate-y-[-4px] shadow-xl' 
                  : isWrong ? 'bg-rose-100 border-rose-300 border-opacity-50' : 'bg-slate-50 border-slate-100 text-slate-100'
                }`}
            >
              {guess[i]?.char || ''}
            </div>
          ))}
        </div>

        <div className="w-full bg-indigo-50/50 p-6 rounded-[48px] border-4 border-white flex flex-wrap justify-center gap-3 card-inner-shadow relative z-10">
          {scrambled.map((item, i) => (
            <motion.button
              key={item.id}
              whileHover={{ scale: 1.1, rotate: 3, y: -4 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleLetterClick(item, i)}
              className="w-16 h-16 bg-white rounded-[24px] shadow-lg text-2xl font-black text-slate-800 border-b-4 border-indigo-50 flex items-center justify-center transition-all hover:border-indigo-400 hover:text-indigo-600 hover:shadow-indigo-100"
            >
              {item.char}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LetterScramble;
