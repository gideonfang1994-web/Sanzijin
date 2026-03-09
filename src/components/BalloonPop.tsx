
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { WordGroup, WordItem } from '../types';
import { Timer, Star, Heart, Cloud, Wind, Sparkles, Trophy, X } from 'lucide-react';
import audio from '../utils/AudioUtils';
import confetti from 'canvas-confetti';

interface Balloon {
  id: number;
  word: WordItem;
  x: number;
  y: number;
  speed: number;
  color: string;
}

interface Props {
  groups: WordGroup[];
  isReviewMode?: boolean;
  onFinish: (score: number, coins: number) => void;
  onMistake: (wordText: string) => void;
  onSuccess: (wordText: string) => void;
  onClose: () => void;
}

const BalloonPop: React.FC<Props> = ({ groups, isReviewMode, onFinish, onMistake, onSuccess, onClose }) => {
  const [balloons, setBalloons] = useState<Balloon[]>([]);
  const [score, setScore] = useState(0);
  const [hearts, setHearts] = useState(3);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isGameOver, setIsGameOver] = useState(false);
  const [clearedWords, setClearedWords] = useState<Set<string>>(new Set());
  
  // 核心改进：锁定任务单词池
  const pool = useMemo(() => {
    return groups.flatMap(g => g.words);
  }, [groups]);

  // 当前需要点击的目标（从未完成的词中随机或按顺序选择）
  const targetWord = useMemo(() => {
    const remaining = pool.filter(w => !clearedWords.has(w.text));
    return remaining.length > 0 ? remaining[0] : null;
  }, [pool, clearedWords]);

  const requestRef = useRef<number>(0);
  const lastSpawnTime = useRef<number>(0);

  const colors = ['bg-rose-400', 'bg-sky-400', 'bg-amber-400', 'bg-emerald-400', 'bg-indigo-400'];

  useEffect(() => {
    audio.init();
    if (pool.length === 0) { onClose(); return; }
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { endGame(); return 0; }
        return prev - 1;
      });
    }, 1000);
    
    requestRef.current = requestAnimationFrame(updateBalloons);
    return () => {
      clearInterval(timer);
      cancelAnimationFrame(requestRef.current);
    };
  }, [pool]);

  const spawnBalloon = () => {
    if (!targetWord || isGameOver) return;
    
    // 增加目标词出现的概率
    const isTarget = Math.random() < 0.4;
    const word = isTarget ? targetWord : pool[Math.floor(Math.random() * pool.length)];
    
    const newBalloon: Balloon = {
      id: Math.random(),
      word: word,
      x: 10 + Math.random() * 80,
      y: 110,
      speed: 0.15 + Math.random() * 0.25,
      color: colors[Math.floor(Math.random() * colors.length)]
    };
    setBalloons(prev => [...prev, newBalloon]);
  };

  const updateBalloons = (time: number) => {
    if (time - lastSpawnTime.current > 1200) {
      spawnBalloon();
      lastSpawnTime.current = time;
    }
    setBalloons(prev => prev.map(b => ({ ...b, y: b.y - b.speed })).filter(b => b.y > -20));
    requestRef.current = requestAnimationFrame(updateBalloons);
  };

  const speak = (text: string) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  const handlePop = (balloon: Balloon) => {
    if (isGameOver) return;

    if (balloon.word.text === targetWord?.text) {
      audio.playPop();
      speak(balloon.word.text); // 点中时发音
      setScore(prev => prev + 150);
      onSuccess(balloon.word.text);
      
      const newCleared = new Set(clearedWords);
      newCleared.add(balloon.word.text);
      setClearedWords(newCleared);
      
      confetti({ 
        particleCount: 20, 
        spread: 40, 
        origin: { x: balloon.x / 100, y: balloon.y / 100 },
        colors: ['#38BDF8', '#818CF8']
      });

      setBalloons(prev => prev.filter(b => b.id !== balloon.id));

      // 检查是否全词通关
      if (newCleared.size === pool.length) {
        setTimeout(endGame, 500);
      }
    } else {
      audio.playError();
      onMistake(balloon.word.text);
      setHearts(prev => {
        if (prev <= 1) { endGame(); return 0; }
        return prev - 1;
      });
      setBalloons(prev => prev.filter(b => b.id !== balloon.id));
    }
  };

  const endGame = () => {
    setIsGameOver(true);
    cancelAnimationFrame(requestRef.current);
    onFinish(score, Math.floor(score / 50));
  };

  if (isGameOver || (pool.length > 0 && clearedWords.size === pool.length)) {
    return (
      <div className="flex flex-col items-center justify-center h-full animate-in zoom-in-95 duration-500">
        <div className="bg-white rounded-[50px] p-10 shadow-2xl border-[8px] border-sky-400 text-center w-full max-w-sm">
          <Trophy className="w-16 h-16 text-sky-500 mx-auto mb-4" />
          <h2 className="text-4xl font-black text-slate-800">任务达成!</h2>
          <p className="text-slate-400 font-bold my-4">你消灭了本组所有的任务气球</p>
          <p className="text-6xl font-black text-sky-500 tabular-nums">{score}</p>
          <button onClick={onClose} className="w-full puffy-button bg-sky-500 text-white py-5 rounded-[30px] font-black mt-6">完成挑战</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full space-y-4 relative overflow-hidden bg-gradient-to-b from-sky-50 to-white rounded-[60px] border-4 border-white shadow-inner">
      <div className="flex items-center justify-between p-6 z-10 relative">
        <button onClick={onClose} className="p-2 hover:bg-white/50 rounded-xl transition-colors">
          <X size={24} className="text-slate-400" />
        </button>
        <div className="flex items-center space-x-2">
          {[...Array(3)].map((_, i) => (
            <Heart key={i} className={`w-6 h-6 ${i < hearts ? 'text-rose-500 fill-rose-500' : 'text-slate-200'}`} />
          ))}
        </div>
        <div className="font-black text-slate-400">通关进度: {clearedWords.size}/{pool.length}</div>
        <div className="text-xl font-black text-slate-400 tabular-nums">{timeLeft}s</div>
      </div>

      <div className="absolute top-20 left-1/2 -translate-x-1/2 z-20 w-full px-10 text-center animate-bounce-subtle">
        <div className="bg-white/90 backdrop-blur-md rounded-[40px] p-6 border-4 border-sky-200 shadow-xl inline-block min-w-[240px]">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">请点破对应的气球：</p>
          <h2 className="text-4xl font-black text-slate-800">{targetWord?.translation}</h2>
        </div>
      </div>

      <div className="flex-1 relative">
        {balloons.map(b => (
          <button 
            key={b.id} 
            onClick={() => handlePop(b)} 
            className={`absolute w-24 h-28 ${b.color} rounded-[50%_50%_50%_50%_/_40%_40%_60%_60%] shadow-lg border-4 border-white/30 flex items-center justify-center transition-transform hover:scale-110 active:scale-90`} 
            style={{ left: `${b.x}%`, top: `${b.y}%` }}
          >
            <span className="font-black text-white text-lg tracking-tight">{b.word.text}</span>
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-0.5 h-6 bg-slate-300 opacity-40"></div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default BalloonPop;
