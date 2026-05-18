
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { WordGroup, WordItem } from '../types';
import { Heart, Trophy, X, Sparkles, Volume2, Zap, Star } from 'lucide-react';
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
  scale: number;
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
  const [isGameStarted, setIsGameStarted] = useState(false);
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
    'from-rose-400 to-rose-500', 
    'from-sky-400 to-sky-500', 
    'from-amber-400 to-amber-500', 
    'from-emerald-400 to-emerald-500', 
    'from-indigo-400 to-indigo-500',
    'from-purple-400 to-purple-500'
  ];

  useEffect(() => {
    if (!isGameStarted || isGameOver || pool.length === 0) return;
    
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
  }, [isGameStarted, isGameOver, pool, targetWord]);

  const speak = (text: string) => {
    audio.speak(text);
  };

  const spawnBalloon = () => {
    if (pool.length === 0 || isGameOver) return;
    
    const isTarget = Math.random() < 0.6;
    const word = isTarget && targetWord ? targetWord : pool[Math.floor(Math.random() * pool.length)];
    
    const newBalloon: Balloon = {
      id: Math.random(),
      word: word,
      x: 10 + Math.random() * 80,
      y: 110,
      speed: 0.15 + Math.random() * 0.1,
      color: colors[Math.floor(Math.random() * colors.length)],
      isPopped: false,
      scale: word === targetWord ? 1.2 : 0.9 + Math.random() * 0.2
    };
    setBalloons(prev => [...prev, newBalloon]);
  };

  const updateGame = (time: number) => {
    if (time - lastSpawnTime.current > 1400 - (60 - timeLeft) * 10) {
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
        const progressIncrement = 9 / (distance || 1); // Faster speed
        return { ...d, progress: d.progress + progressIncrement };
      }).filter(d => d.progress <= 1.1);
      
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
        audio.playSuccess();
        audio.speak(balloon.word.text);
        
        const comboBonus = combo * 30;
        setScore(score + 150 + comboBonus);
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
          particleCount: 30, 
          spread: 60, 
          origin: { x: balloon.x / 100, y: balloon.y / 100 },
          colors: ['#0ea5e9', '#6366f1', '#ec4899']
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
      startY: 95,
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
    
    const finalCoins = Math.floor(score / 40) + Math.floor(maxCombo / 2);
    onFinish(score, finalCoins);
  };

  if (!isGameStarted) {
    return (
      <div className="fixed inset-0 bg-sky-50 z-[100] flex items-center justify-center p-6">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-[48px] p-10 shadow-2xl border-4 border-sky-100 text-center space-y-6 max-w-sm w-full"
        >
          <div className="w-24 h-24 bg-sky-100 rounded-full flex items-center justify-center mx-auto mb-4 relative">
             <Zap size={48} className="text-sky-500 absolute -top-2 -right-2" />
             <div className="w-16 h-20 bg-rose-400 rounded-full border-2 border-rose-500 shadow-md translate-y-1" />
          </div>
          <h2 className="text-3xl font-black text-slate-800">飞飞飞刀</h2>
          <p className="text-slate-500 font-bold leading-relaxed px-4">
            精准投掷，刺破气球！<br />击中目标单词对应的气球来获得能量。
          </p>
          <button 
            onClick={() => { audio.playClick(); setIsGameStarted(true); }}
            className="w-full py-5 bg-sky-500 text-white rounded-[32px] font-black text-xl shadow-xl shadow-sky-100 uppercase tracking-widest"
          >
            开启挑战
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 bg-gradient-to-b from-sky-200 via-white to-sky-50 z-[100] flex flex-col font-sans overflow-hidden"
    >
      {/* Background Decor - Magic Particles */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]">
        {[...Array(6)].map((_, i) => (
          <div 
            key={i} 
            className="absolute w-96 h-96 border-[40px] border-sky-900 rounded-full"
            style={{ 
              left: `${(i % 2) * 60 - 20}%`, 
              top: `${Math.floor(i / 2) * 40 - 10}%`,
              transform: `rotate(${i * 20}deg)` 
            }}
          />
        ))}
      </div>
      
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -30, 0],
              opacity: [0.1, 0.4, 0.1],
              scale: [1, 1.5, 1]
            }}
            transition={{
              duration: 3 + i,
              repeat: Infinity,
              delay: i * 0.3
            }}
            className="absolute w-1.5 h-1.5 bg-sky-400 rounded-full blur-[1px]"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`
            }}
          />
        ))}
      </div>

      {/* Header */}
      <header className="p-6 flex items-center justify-between bg-white/80 backdrop-blur-xl border-b-2 border-sky-100 relative z-30 shadow-sm">
        <button onClick={onClose} className="p-2 hover:bg-sky-50 rounded-2xl transition-all group">
          <X size={28} className="text-slate-400 group-hover:text-rose-500" />
        </button>

        <div className="flex flex-col items-center">
           <div className="flex space-x-1.5 mb-1.5">
             {[...Array(3)].map((_, i) => (
               <motion.div
                 key={i}
                 initial={false}
                 animate={{ scale: i < hearts ? 1 : 0.8 }}
               >
                 <Heart className={`w-6 h-6 transition-all duration-300 ${i < hearts ? 'text-rose-500 fill-rose-500 filter drop-shadow-sm' : 'text-slate-200'}`} />
               </motion.div>
             ))}
           </div>
           <div className="flex items-center space-x-2 bg-sky-50 px-3 py-1 rounded-full border border-sky-100">
             <div className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-pulse" />
             <span className="text-[9px] font-black text-sky-600 uppercase tracking-widest leading-none">
               Captured: {clearedWords.size}/{pool.length}
             </span>
           </div>
        </div>

        <div className="w-14 h-14 bg-sky-600 rounded-2xl flex items-center justify-center shadow-lg shadow-sky-100 border-b-4 border-sky-800 relative overflow-hidden">
           <motion.div 
             animate={{ height: `${(timeLeft / 60) * 100}%` }}
             className="absolute bottom-0 left-0 right-0 bg-white/20"
           />
           <span className={`text-xl font-black text-white relative z-10 tabular-nums ${timeLeft < 10 ? 'animate-pulse' : ''}`}>{timeLeft}</span>
        </div>
      </header>

      {/* Daggers (Arcane Bolts) in Flight */}
      {daggers.map(d => (
        <div 
          key={d.id}
          className="absolute w-12 h-12 z-40 origin-center"
          style={{ 
            left: `${d.startX + (d.targetX - d.startX) * d.progress}%`, 
            top: `${d.startY + (d.targetY - d.startY) * d.progress}%`,
            transform: `translate(-50%, -50%) rotate(${Math.atan2(d.targetY - d.startY, d.targetX - d.startX) * 180 / Math.PI + 90}deg)`
          }}
        >
          {/* Trail effect */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-4 h-32 bg-gradient-to-t from-sky-400/0 via-sky-400/30 to-sky-400/0 blur-md -z-10" />
          <div className="w-2 h-12 bg-white rounded-full mx-auto shadow-[0_0_15px_rgba(56,189,248,0.8)] border border-sky-200" />
          <motion.div 
            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 0.2, repeat: Infinity }}
            className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4 bg-sky-200 rounded-full blur-sm"
          />
        </div>
      ))}

      {/* Game Field */}
      <div className="flex-1 relative">
         <AnimatePresence>
            {balloons.map(b => !b.isPopped && (
              <motion.button 
                key={b.id} 
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: b.scale }}
                exit={{ opacity: 0, scale: 2, filter: 'blur(10px)' }}
                onClick={() => throwDagger(b)} 
                className={`absolute w-24 h-24 sm:w-28 sm:h-28 bg-gradient-to-br ${b.color} rounded-full shadow-2xl border-4 border-white flex flex-col items-center justify-center transition-all hover:scale-110 active:scale-95 group relative magic-glow-pulse`} 
                style={{ 
                  left: `${b.x}%`, 
                  top: `${b.y}%`, 
                  transform: 'translate(-50%, -50%)' 
                }}
              >
                {/* Internal Glow */}
                <div className="absolute inset-2 bg-white/20 rounded-full blur-xl pointer-events-none" />
                
                <span className="font-black text-white text-base sm:text-lg tracking-tight leading-tight px-3 text-center drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)] relative z-10 break-words w-full">
                  {isWordToMeaning ? b.word.translation : b.word.text}
                </span>

                {/* Magical Aura */}
                <motion.div 
                  animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.3, 0.1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-[-10px] bg-white rounded-full blur-xl -z-10"
                />
              </motion.button>
            ))}
         </AnimatePresence>
      </div>

      {/* Control Altar */}
      <div className="px-10 pb-12 pt-8 bg-white/90 backdrop-blur-2xl border-t-4 border-sky-100 relative z-40 rounded-t-[56px] flex flex-col items-center shadow-[0_-20px_60px_-15px_rgba(0,0,0,0.1)]">
         {/* Combo Badge */}
         <AnimatePresence>
            {combo > 1 && (
              <motion.div 
                initial={{ opacity: 0, y: 20, scale: 0.5 }}
                animate={{ opacity: 1, y: -45, scale: 1.2 }}
                exit={{ opacity: 0, scale: 2 }}
                className="absolute top-0 bg-gradient-to-br from-amber-400 to-orange-500 text-white px-6 py-2 rounded-[24px] font-black text-sm shadow-xl flex items-center space-x-2 border-2 border-white"
              >
                <Zap size={16} className="fill-white animate-pulse" />
                <span className="tracking-widest">COMBO × {combo}</span>
              </motion.div>
            )}
         </AnimatePresence>

         <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4 items-center mb-8">
            <div className="bg-sky-600 text-white p-5 rounded-[32px] shadow-xl shadow-sky-100 flex items-center justify-between group overflow-hidden relative">
               <div className="relative z-10">
                  <p className="text-[10px] font-black text-sky-200 uppercase tracking-widest mb-1">Spirit Score</p>
                  <p className="text-3xl font-black tabular-nums">{score}</p>
               </div>
               <Star size={32} className="text-white/20 fill-white/10 group-hover:rotate-12 transition-transform relative z-10" />
               <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
            </div>
            
            <motion.div 
              key={targetWord?.text}
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="bg-white p-5 rounded-[32px] border-2 border-sky-400 shadow-[0_12px_24px_rgba(14,165,233,0.1)] flex items-center justify-between group"
            >
               <div className="text-left">
                  <p className="text-[9px] font-black text-sky-400 uppercase tracking-widest mb-1 flex items-center">
                    Target Spirit <Sparkles size={10} className="ml-1 animate-pulse" />
                  </p>
                  <p className="text-2xl font-black text-slate-800 tracking-tight leading-tight">
                    {isWordToMeaning ? targetWord?.text : targetWord?.translation}
                  </p>
               </div>
               <button 
                 onClick={() => speak(targetWord?.text || '')}
                 className="w-14 h-14 bg-sky-50 text-sky-500 rounded-2xl hover:bg-sky-600 hover:text-white transition-all shadow-inner flex items-center justify-center border border-sky-100"
               >
                 <Volume2 size={28} />
               </button>
            </motion.div>
         </div>

         {/* The Arcane Altar Asset */}
         <div className="relative w-24 h-24 group">
            <div className="absolute bottom-[-10px] left-1/2 -translate-x-1/2 w-16 h-28 bg-gradient-to-b from-sky-400 to-sky-600 rounded-t-[48px] border-4 border-white shadow-2xl relative z-10 overflow-hidden">
               <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            </div>
            {/* The Arcane Bolt (Shooter) */}
            <motion.div 
               animate={{ y: [0, -5, 0] }}
               transition={{ duration: 2, repeat: Infinity }}
               className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-20 bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,1)] z-20" 
            />
            <div className="absolute top-12 left-1/2 -translate-x-1/2 w-12 h-4 bg-sky-200 rounded-full z-30 blur-[1px] shadow-md" />
         </div>
      </div>

      {/* End Modal */}
      <AnimatePresence>
        {isGameOver && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-sky-950/90 backdrop-blur-xl"
          >
            <motion.div 
              initial={{ scale: 0.8, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-[56px] p-10 max-w-sm w-full shadow-2xl text-center space-y-8"
            >
              <div className="text-8xl">🎯</div>
              <div className="space-y-2">
                <h3 className="text-4xl font-black text-slate-900 leading-tight">神箭手！</h3>
                <p className="text-slate-500 font-bold">气球已经被你全部击落。</p>
              </div>
              
              <div className="bg-sky-50 rounded-3xl p-6 space-y-2 border-2 border-sky-100">
                <div className="flex justify-between items-center text-sky-800 font-black">
                  <span>总得分</span>
                  <span className="text-3xl tracking-tighter">{score}</span>
                </div>
                <div className="flex justify-between items-center text-sky-500/60 font-black text-[10px] uppercase tracking-widest">
                  <span>MAX COMBO</span>
                  <span>{maxCombo}</span>
                </div>
              </div>

              <button 
                onClick={onClose}
                className="w-full py-5 bg-sky-500 text-white rounded-[32px] font-black text-xl shadow-xl shadow-sky-200"
              >
                领取奖励
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FlyingDagger;
