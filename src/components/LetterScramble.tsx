
import React, { useState, useEffect, useMemo } from 'react';
import { WordGroup, WordItem } from '../types';
import { Timer, Star, Zap, Headphones, Trophy, X } from 'lucide-react';
import audio from '../utils/AudioUtils';
import confetti from 'canvas-confetti';

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
    setCombo(prev => prev + 1);
    
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
          <img src="https://img.icons8.com/bubbles/150/empty-box.png" className="w-40 h-40 mb-4" referrerPolicy="no-referrer" />
          <h2 className="text-2xl font-black text-slate-700 font-heading">魔法宝箱空空如也</h2>
          <p className="text-slate-400 font-bold mt-2 max-w-[200px] text-sm">看来今天还没有开启新的冒险词汇呢！</p>
          <button onClick={onClose} className="mt-8 puffy-button px-8 py-4 bg-indigo-600 text-white rounded-[24px] font-black text-base">回到森林开启冒险</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Dynamic Header */}
      <div className="flex items-center justify-between glass-card rounded-[32px] p-4 shadow-sm">
        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
          <X size={20} className="text-slate-400" />
        </button>
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-rose-500 rounded-xl flex items-center justify-center shadow-lg shadow-rose-200">
            <Star className="w-5 h-5 text-white fill-white" />
          </div>
          <span className="font-black text-xl text-slate-700 tabular-nums">{score}</span>
        </div>
        <div className="flex items-center space-x-4">
           <div className="flex flex-col items-end">
             <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Progress</span>
             <div className="text-slate-500 font-black text-xs">{currentIdx + 1} / {pool.length}</div>
           </div>
           <div className={`flex items-center space-x-1 font-black text-xl tabular-nums ${timeLeft < 10 ? 'text-rose-500 animate-pulse' : 'text-slate-300'}`}>
             <Timer className="w-5 h-5" />
             <span>{timeLeft}s</span>
           </div>
        </div>
      </div>

      <div className={`flex-1 glass-card rounded-[48px] shadow-puffy p-6 flex flex-col items-center justify-between relative overflow-hidden transition-all ${isWrong ? 'bg-rose-50 translate-x-1' : ''}`}>
        
        {/* Animated Progress Bar */}
        <div className="absolute top-0 left-0 w-full h-2 bg-slate-100 card-inner-shadow">
           <div className="h-full bg-gradient-to-r from-rose-400 via-indigo-500 to-indigo-600 transition-all duration-1000 rounded-r-full" style={{ width: `${((currentIdx + 1) / pool.length) * 100}%` }}></div>
        </div>

        <div className="mt-2">
          <div className="inline-block bg-white border-[4px] border-indigo-100 px-8 py-3 rounded-[32px] shadow-sm relative group cursor-help">
            <div className="absolute -top-3 -right-3 bg-amber-400 text-white p-1.5 rounded-full shadow-lg group-hover:scale-125 transition-transform"><Headphones size={16} /></div>
            <span className="text-3xl font-black text-slate-800 tracking-tight font-formal">{currentWord?.translation}</span>
          </div>
        </div>

        <div className="cursor-pointer group relative" onClick={() => speak(currentWord?.text || '')}>
          <div className="absolute inset-0 bg-indigo-300 blur-[60px] opacity-20 scale-150 rounded-full"></div>
          <img 
            src={currentWord?.imageUrl || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${currentWord?.text}`} 
            className={`w-40 h-40 object-contain relative z-10 transition-transform ${isWrong ? 'grayscale scale-90' : 'group-hover:scale-110 group-active:scale-95'}`} 
            alt="word" 
            referrerPolicy="no-referrer"
          />
        </div>

        <div className={`flex flex-wrap justify-center gap-2 mt-4 min-h-[80px] transition-all ${isWrong ? 'animate-bounce' : ''}`}>
          {currentWord?.text.split('').map((_, i) => (
            <div 
              key={i} 
              className={`w-12 h-16 rounded-[18px] border-b-[6px] border-2 flex items-center justify-center text-2xl font-black transition-all duration-300 ${
                guess[i] 
                ? 'bg-indigo-600 border-indigo-800 text-white translate-y-[-4px] shadow-lg' 
                : isWrong ? 'bg-rose-100 border-rose-200' : 'bg-slate-50 border-slate-100 text-slate-200'
              }`}
            >
              {guess[i]?.char || ''}
            </div>
          ))}
        </div>

        <div className="w-full bg-slate-100/30 p-4 rounded-[40px] border-[3px] border-white border-dashed flex flex-wrap justify-center gap-2 card-inner-shadow">
          {scrambled.map((item, i) => (
            <button
              key={item.id}
              onClick={() => handleLetterClick(item, i)}
              className="w-14 h-14 bg-white rounded-[20px] shadow-puffy text-2xl font-black text-slate-700 hover:border-indigo-400 hover:text-indigo-600 active:scale-90 transition-all flex items-center justify-center puffy-button border-2 border-slate-50"
            >
              {item.char}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LetterScramble;
