
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { WordGroup, WordItem } from '../types';
import { Heart, Trophy, X, Sparkles } from 'lucide-react';
import audio from '../utils/AudioUtils';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'framer-motion';

interface Balloon {
  id: number;
  word: WordItem;
  x: number;
  y: number;
  speed: number;
  color: string;
  isPopped: boolean;
}

interface Dagger {
  id: number;
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  progress: number; // 0 to 1
  balloonId: number;
}

interface Props {
  groups: WordGroup[];
  isReviewMode?: boolean;
  onFinish: (score: number, coins: number) => void;
  onMistake: (wordText: string) => void;
  onSuccess: (wordText: string) => void;
  onClose: () => void;
}

const FlyingDagger: React.FC<Props> = ({ groups, isReviewMode, onFinish, onMistake, onSuccess, onClose }) => {
  const [balloons, setBalloons] = useState<Balloon[]>([]);
  const [daggers, setDaggers] = useState<Dagger[]>([]);
  const [score, setScore] = useState(0);
  const [hearts, setHearts] = useState(3);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isGameOver, setIsGameOver] = useState(false);
  const [clearedWords, setClearedWords] = useState<Set<string>>(new Set());
  const [isWordToMeaning, setIsWordToMeaning] = useState(Math.random() > 0.5);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  
  const pool = useMemo(() => {
    const allWords = groups.flatMap(g => g.words);
    return allWords.length > 0 ? allWords : [];
  }, [groups]);

  const targetWord = useMemo(() => {
    const remaining = pool.filter(w => !clearedWords.has(w.text));
    return remaining.length > 0 ? remaining[0] : (pool.length > 0 ? pool[Math.floor(Math.random() * pool.length)] : null);
  }, [pool, clearedWords]);

  const requestRef = useRef<number>(0);
  const lastSpawnTime = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const colors = [
    'bg-gradient-to-br from-rose-400 to-rose-500', 
    'bg-gradient-to-br from-sky-400 to-sky-500', 
    'bg-gradient-to-br from-amber-400 to-amber-500', 
    'bg-gradient-to-br from-emerald-400 to-emerald-500', 
    'bg-gradient-to-br from-indigo-400 to-indigo-500'
  ];

  useEffect(() => {
    audio.init();
    if (pool.length === 0) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { endGame(); return 0; }
        return prev - 1;
      });
    }, 1000);
    
    requestRef.current = requestAnimationFrame(updateGame);
    return () => {
      clearInterval(timer);
      cancelAnimationFrame(requestRef.current);
    };
  }, [pool]);

  const spawnBalloon = () => {
    if (pool.length === 0 || isGameOver) return;
    
    // Increase frequency of target word: 70% chance to be the target word
    const isTarget = Math.random() < 0.7;
    const word = isTarget && targetWord ? targetWord : pool[Math.floor(Math.random() * pool.length)];
    
    const newBalloon: Balloon = {
      id: Math.random(),
      word: word,
      x: 15 + Math.random() * 70,
      y: 110,
      speed: 0.2, // Constant speed
      color: colors[Math.floor(Math.random() * colors.length)],
      isPopped: false
    };
    setBalloons(prev => [...prev, newBalloon]);
  };

  const updateGame = (time: number) => {
    if (time - lastSpawnTime.current > 1200) {
      spawnBalloon();
      lastSpawnTime.current = time;
    }

    // Update balloons
    setBalloons(prev => prev.map(b => ({ ...b, y: b.y - b.speed })).filter(b => b.y > -20));

    // Update daggers
    setDaggers(prev => {
      const nextDaggers = prev.map(d => {
        const dx = d.targetX - d.startX;
        const dy = d.targetY - d.startY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        // Constant speed: progress increment depends on distance
        // Base speed: 5 units per frame
        const progressIncrement = 5 / (distance || 1);
        return { ...d, progress: d.progress + progressIncrement };
      }).filter(d => d.progress <= 1.1);
      
      // Check for hits
      nextDaggers.forEach(d => {
        if (d.progress >= 1 && d.progress < 1.1) {
          handleHit(d.balloonId);
        }
      });

      return nextDaggers;
    });

    requestRef.current = requestAnimationFrame(updateGame);
  };

  const handleHit = (balloonId: number) => {
    setBalloons(prev => {
      const balloon = prev.find(b => b.id === balloonId);
      if (!balloon || balloon.isPopped) return prev;

      if (balloon.word.text === targetWord?.text) {
        audio.playPop();
        audio.playSuccess(); // Added cheer for correct answer
        audio.speak(balloon.word.text);
        
        // Scoring: Base 150 + Combo bonus
        const comboBonus = combo * 20;
        const newScore = score + 150 + comboBonus;
        setScore(newScore);
        setCombo(c => {
          const next = c + 1;
          if (next > maxCombo) setMaxCombo(next);
          return next;
        });
        
        onSuccess(balloon.word.text);
        
        const newCleared = new Set(clearedWords);
        newCleared.add(balloon.word.text);
        setClearedWords(newCleared);
        setIsWordToMeaning(Math.random() > 0.5);
        
        confetti({ 
          particleCount: 25, 
          spread: 50, 
          origin: { x: balloon.x / 100, y: balloon.y / 100 },
          colors: ['#38BDF8', '#818CF8', '#F472B6']
        });

        if (newCleared.size === pool.length) {
          setTimeout(endGame, 500);
        }
        return prev.map(b => b.id === balloonId ? { ...b, isPopped: true } : b);
      } else {
        audio.playError();
        onMistake(balloon.word.text);
        setCombo(0);
        setHearts(h => {
          if (h <= 1) { endGame(); return 0; }
          return h - 1;
        });
        return prev.map(b => b.id === balloonId ? { ...b, isPopped: true } : b);
      }
    });
  };

  const throwDagger = (balloon: Balloon) => {
    if (isGameOver || balloon.isPopped) return;
    
    const newDagger: Dagger = {
      id: Math.random(),
      startX: 50, 
      startY: 100,
      targetX: balloon.x,
      targetY: balloon.y,
      progress: 0,
      balloonId: balloon.id
    };
    
    setDaggers(prev => [...prev, newDagger]);
    audio.playClick();
  };

  const endGame = () => {
    setIsGameOver(true);
    cancelAnimationFrame(requestRef.current);
    
    audio.playCheer();
    setTimeout(() => audio.playCheer(), 400);
    setTimeout(() => audio.playCheer(), 800);

    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) return clearInterval(interval);
      const particleCount = 50 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);

    // Final coins: Score / 50 + Combo bonus
    const finalCoins = Math.floor(score / 50) + Math.floor(maxCombo / 2);
    onFinish(score, finalCoins);
  };

  if (pool.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] bg-slate-50 rounded-[60px] p-10 text-center border-4 border-white shadow-inner">
        <div className="bg-white p-8 rounded-[40px] shadow-xl border-4 border-slate-100">
          <Sparkles className="w-16 h-16 text-amber-400 mx-auto mb-4" />
          <h2 className="text-2xl font-black text-slate-800 mb-2">魔法库空空如也</h2>
          <p className="text-slate-400 font-bold mb-6">先去冒险岛解锁一些新魔法吧！</p>
          <button onClick={onClose} className="w-full puffy-button bg-indigo-500 text-white py-4 rounded-3xl font-black">返回游乐园</button>
        </div>
      </div>
    );
  }

  if (isGameOver || (pool.length > 0 && clearedWords.size === pool.length)) {
    return (
      <div className="flex flex-col items-center justify-center h-full animate-in zoom-in-95 duration-500">
        <div className="bg-white rounded-[50px] p-10 shadow-2xl border-[8px] border-rose-400 text-center w-full max-w-sm">
          <Trophy className="w-16 h-16 text-rose-500 mx-auto mb-4" />
          <h2 className="text-4xl font-black text-slate-800">任务达成!</h2>
          <div className="flex justify-center space-x-4 my-6">
            <div className="text-center">
              <p className="text-[10px] font-black text-slate-400 uppercase">最终得分</p>
              <p className="text-4xl font-black text-rose-500">{score}</p>
            </div>
            <div className="text-center border-l border-slate-100 pl-4">
              <p className="text-[10px] font-black text-slate-400 uppercase">最大连击</p>
              <p className="text-4xl font-black text-sky-500">{maxCombo}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-full puffy-button bg-rose-500 text-white py-5 rounded-[30px] font-black">完成挑战</button>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="flex flex-col min-h-[600px] h-[70vh] space-y-4 relative overflow-hidden bg-gradient-to-b from-sky-100 via-sky-50 to-white rounded-[60px] border-4 border-white shadow-inner"
    >
      {/* Background Clouds */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <motion.div 
          animate={{ x: [0, 50, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-20 left-10 w-32 h-12 bg-white rounded-full blur-xl"
        />
        <motion.div 
          animate={{ x: [0, -40, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute top-40 right-20 w-40 h-16 bg-white rounded-full blur-xl"
        />
        <motion.div 
          animate={{ x: [0, 30, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-60 left-1/4 w-48 h-20 bg-white rounded-full blur-xl"
        />
      </div>

      <div className="flex items-center justify-between p-6 z-10 relative">
        <button onClick={onClose} className="p-2 hover:bg-white/50 rounded-xl transition-colors cursor-pointer">
          <X size={24} className="text-slate-400" />
        </button>
        <div className="flex flex-col items-center">
          <div className="flex items-center space-x-1 mb-1">
            {[...Array(3)].map((_, i) => (
              <Heart key={i} className={`w-5 h-5 ${i < hearts ? 'text-rose-500 fill-rose-500' : 'text-slate-200'}`} />
            ))}
          </div>
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Combo: <span className="text-sky-500">{combo}</span>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <div className="font-black text-slate-800 text-sm">进度: {clearedWords.size}/{pool.length}</div>
          <div className="text-lg font-black text-rose-500 tabular-nums">{timeLeft}s</div>
        </div>
      </div>

      {/* Daggers */}
      {daggers.map(d => (
        <div 
          key={d.id}
          className="absolute w-8 h-8 z-40"
          style={{ 
            left: `${d.startX + (d.targetX - d.startX) * d.progress}%`, 
            top: `${d.startY + (d.targetY - d.startY) * d.progress}%`,
            transform: `translate(-50%, -50%) rotate(${Math.atan2(d.targetY - d.startY, d.targetX - d.startX) * 180 / Math.PI + 90}deg)`
          }}
        >
          <div className="w-1.5 h-10 bg-slate-700 rounded-full mx-auto shadow-md"></div>
          <div className="w-5 h-2.5 bg-rose-500 rounded-sm -mt-2 mx-auto shadow-sm"></div>
        </div>
      ))}

      {/* Hand with Dagger */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 z-50 pointer-events-none flex flex-col items-center pb-4">
        <AnimatePresence mode="wait">
          <motion.div 
            key={targetWord?.text}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            className="bg-white px-6 py-3 rounded-[24px] border-[4px] border-rose-400 shadow-[0_8px_0_0_rgba(251,113,133,1)] mb-6 relative"
          >
            <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest text-center mb-1">瞄准目标</p>
            <p 
              className="text-2xl font-black text-slate-800 whitespace-nowrap cursor-pointer hover:text-rose-500 transition-colors"
              onClick={() => audio.speak(targetWord?.text || '')}
            >
              {isWordToMeaning ? targetWord?.text : targetWord?.translation}
            </p>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-r-[4px] border-b-[4px] border-rose-400 rotate-45"></div>
          </motion.div>
        </AnimatePresence>
        <div className="relative w-24 h-24">
          <div className="absolute bottom-[-20px] left-1/2 -translate-x-1/2 w-16 h-24 bg-amber-200 rounded-t-[40px] border-4 border-amber-300 shadow-lg"></div>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-14 bg-slate-700 rounded-full shadow-sm"></div>
          <div className="absolute top-10 left-1/2 -translate-x-1/2 w-10 h-3 bg-rose-500 rounded-full shadow-sm"></div>
        </div>
      </div>

      <div className="flex-1 relative">
        {balloons.map(b => !b.isPopped && (
          <button 
            key={b.id} 
            onClick={() => throwDagger(b)} 
            className={`absolute w-24 h-28 ${b.color} rounded-[50%_50%_50%_50%_/_40%_40%_60%_60%] shadow-lg border-4 border-white/30 flex flex-col items-center justify-center transition-all hover:scale-110 active:scale-95 ${b.word.text === targetWord?.text ? 'scale-125 z-30' : 'z-20'}`} 
            style={{ 
              left: `${b.x}%`, 
              top: `${b.y}%`, 
              transform: 'translate(-50%, -50%)' 
            }}
          >
            <span className="font-black text-white text-lg tracking-tight leading-tight px-2 text-center drop-shadow-md">
              {isWordToMeaning ? b.word.translation : b.word.text}
            </span>
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-0.5 h-8 bg-slate-300 opacity-40"></div>
            <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 w-2 h-2 bg-white/40 rounded-full blur-[1px]"></div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default FlyingDagger;
