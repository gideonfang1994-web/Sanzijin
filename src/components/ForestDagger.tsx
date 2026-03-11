
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { WordGroup, WordItem } from '../types';
import { Heart, Trophy, X, Sparkles } from 'lucide-react';
import audio from '../utils/AudioUtils';
import confetti from 'canvas-confetti';

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

const ForestDagger: React.FC<Props> = ({ groups, isReviewMode, onFinish, onMistake, onSuccess, onClose }) => {
  const [balloons, setBalloons] = useState<Balloon[]>([]);
  const [daggers, setDaggers] = useState<Dagger[]>([]);
  const [score, setScore] = useState(0);
  const [hearts, setHearts] = useState(3);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isGameOver, setIsGameOver] = useState(false);
  const [clearedWords, setClearedWords] = useState<Set<string>>(new Set());
  const [questionType, setQuestionType] = useState<'WORD_TO_TRANS' | 'TRANS_TO_WORD'>('TRANS_TO_WORD');
  const [combo, setCombo] = useState(0);
  const [showCombo, setShowCombo] = useState(false);
  
  const pool = useMemo(() => {
    const allWords = groups.flatMap(g => g.words);
    return allWords.length > 0 ? allWords : [];
  }, [groups]);

  const targetWord = useMemo(() => {
    const remaining = pool.filter(w => !clearedWords.has(w.text));
    const next = remaining.length > 0 ? remaining[0] : (pool.length > 0 ? pool[Math.floor(Math.random() * pool.length)] : null);
    // Randomly switch question type for each new target
    if (next) {
      setQuestionType(Math.random() > 0.5 ? 'WORD_TO_TRANS' : 'TRANS_TO_WORD');
    }
    return next;
  }, [pool, clearedWords]);

  const requestRef = useRef<number>(0);
  const lastSpawnTime = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const colors = ['bg-rose-400', 'bg-sky-400', 'bg-amber-400', 'bg-emerald-400', 'bg-indigo-400'];

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
    
    // Higher probability for target word to appear
    const isTarget = Math.random() < 0.4;
    const word = isTarget && targetWord ? targetWord : pool[Math.floor(Math.random() * pool.length)];
    
    const newBalloon: Balloon = {
      id: Math.random(),
      word: word,
      x: 10 + Math.random() * 80,
      y: 110,
      speed: 0.15 + Math.random() * 0.25,
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
      const nextDaggers = prev.map(d => ({ ...d, progress: d.progress + 0.12 }))
        .filter(d => d.progress <= 1.1);
      
      // Check for hits
      nextDaggers.forEach(d => {
        if (d.progress >= 1 && d.progress < 1.12) {
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
        audio.playSuccess();
        audio.speak(balloon.word.text);
        
        const bonus = combo * 20;
        setScore(s => s + 150 + bonus);
        setCombo(c => c + 1);
        setShowCombo(true);
        setTimeout(() => setShowCombo(false), 1000);
        
        onSuccess(balloon.word.text);
        
        const newCleared = new Set(clearedWords);
        newCleared.add(balloon.word.text);
        setClearedWords(newCleared);
        
        confetti({ 
          particleCount: 30, 
          spread: 60, 
          origin: { x: balloon.x / 100, y: balloon.y / 100 },
          colors: ['#38BDF8', '#818CF8', '#F472B6', '#FBBF24']
        });

        if (newCleared.size === pool.length) {
          setTimeout(endGame, 500);
        }
        return prev.map(b => b.id === balloonId ? { ...b, isPopped: true } : b);
      } else {
        audio.playError();
        setCombo(0);
        onMistake(balloon.word.text);
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
      startX: 50, // Bottom center
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
    onFinish(score, Math.floor(score / 50));
  };

  if (isGameOver || (pool.length > 0 && clearedWords.size === pool.length)) {
    return (
      <div className="flex flex-col items-center justify-center h-full animate-in zoom-in-95 duration-500">
        <div className="bg-white rounded-[50px] p-10 shadow-2xl border-[8px] border-emerald-400 text-center w-full max-w-sm">
          <Trophy className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
          <h2 className="text-4xl font-black text-slate-800">任务达成!</h2>
          <p className="text-slate-400 font-bold my-4">你击中了本组所有的任务气球</p>
          <p className="text-6xl font-black text-emerald-500 tabular-nums">{score}</p>
          <button onClick={onClose} className="w-full puffy-button bg-emerald-500 text-white py-5 rounded-[30px] font-black mt-6">完成挑战</button>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="flex flex-col h-full space-y-4 relative overflow-hidden bg-gradient-to-b from-emerald-50 to-white rounded-[60px] border-4 border-white shadow-inner"
    >
      <div className="flex items-center justify-between p-6 z-10 relative">
        <button onClick={onClose} className="p-2 hover:bg-white/50 rounded-xl transition-colors cursor-pointer">
          <X size={24} className="text-slate-400" />
        </button>
        <div className="flex items-center space-x-2">
          {[...Array(3)].map((_, i) => (
            <Heart key={i} className={`w-6 h-6 ${i < hearts ? 'text-rose-500 fill-rose-500' : 'text-slate-200'}`} />
          ))}
        </div>
        <div className="font-black text-slate-400">进度: {clearedWords.size}/{pool.length}</div>
        <div className="text-xl font-black text-slate-400 tabular-nums">{timeLeft}s</div>
      </div>

      <div className="absolute top-20 left-1/2 -translate-x-1/2 z-20 w-full px-10 text-center">
        <div className="bg-white/90 backdrop-blur-md rounded-[40px] p-6 border-4 border-emerald-200 shadow-xl inline-block min-w-[240px] animate-in slide-in-from-top-4 duration-500 relative">
          {showCombo && combo > 1 && (
            <div className="absolute -top-8 -right-8 bg-amber-400 text-white px-4 py-2 rounded-2xl font-black text-xl shadow-lg rotate-12 animate-bounce">
              {combo} COMBO!
            </div>
          )}
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">请击中对应的气球：</p>
          <h2 className="text-4xl font-black text-slate-800">
            {questionType === 'TRANS_TO_WORD' ? targetWord?.translation : targetWord?.text}
          </h2>
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
          <div className="w-1 h-8 bg-slate-700 rounded-full mx-auto shadow-sm"></div>
          <div className="w-4 h-2 bg-emerald-500 rounded-sm -mt-1 mx-auto"></div>
        </div>
      ))}

      {/* Hand with Dagger (Static at bottom) */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
        <div className="relative w-24 h-24">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-20 bg-amber-200 rounded-t-full border-2 border-amber-300 shadow-lg"></div>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-12 bg-slate-700 rounded-full"></div>
          <div className="absolute top-8 left-1/2 -translate-x-1/2 w-8 h-2 bg-emerald-500 rounded-sm"></div>
        </div>
      </div>

      <div className="flex-1 relative">
        {balloons.map(b => !b.isPopped && (
          <button 
            key={b.id} 
            onClick={() => throwDagger(b)} 
            className={`absolute w-24 h-28 ${b.color} rounded-[50%_50%_50%_50%_/_40%_40%_60%_60%] shadow-lg border-4 border-white/30 flex items-center justify-center transition-transform hover:scale-110 active:scale-90`} 
            style={{ left: `${b.x}%`, top: `${b.y}%`, transform: 'translate(-50%, -50%)' }}
          >
            <span className="font-black text-white text-lg tracking-tight">
              {questionType === 'TRANS_TO_WORD' ? b.word.text : b.word.translation}
            </span>
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-0.5 h-6 bg-slate-300 opacity-40"></div>
            <Sparkles className="absolute -top-2 -right-2 text-white/40" size={16} />
          </button>
        ))}
      </div>
    </div>
  );
};

export default ForestDagger;
