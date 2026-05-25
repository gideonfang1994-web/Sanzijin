import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { WordGroup, WordItem, UserStats } from '../types';
import { ArrowLeft, Volume2, ShieldAlert, Sparkles, Smile, Trophy } from 'lucide-react';
import audio from '../utils/AudioUtils';
import confetti from 'canvas-confetti';
import { CHARACTERS } from '../constants';

interface WordMonsterFeedingProps {
  groups: WordGroup[];
  stats: UserStats;
  onFinish: (score: number, coins: number) => void;
  onClose: () => void;
}

interface CandyBall {
  id: string;
  translation: string;
  isCorrect: boolean;
  x: number;      // percent left
  y: number;      // percent top
  vx: number;     // speed x
  vy: number;     // speed y
  color: string;
  emoji: string;
  isFed: boolean;
}

export const WordMonsterFeeding: React.FC<WordMonsterFeedingProps> = ({ groups, stats, onFinish, onClose }) => {
  const allWords = useMemo(() => {
    let list: WordItem[] = [];
    groups.forEach(g => {
      g.words.forEach(w => list.push(w));
    });
    if (list.length === 0) {
      list = [
        { text: 'monster', translation: '小怪兽', imageUrl: '' },
        { text: 'candy', translation: '糖果', imageUrl: '' },
        { text: 'sugar', translation: '白糖', imageUrl: '' },
        { text: 'cookie', translation: '曲奇饼', imageUrl: '' },
        { text: 'sweet', translation: '甜美的', imageUrl: '' }
      ];
    }
    return [...list].sort(() => Math.random() - 0.5);
  }, [groups]);

  const [gameState, setGameState] = useState<'INTRO' | 'PLAYING' | 'WON' | 'LOST'>('INTRO');
  const [score, setScore] = useState(0);
  const [coinsEarned, setCoinsEarned] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  const [hearts, setHearts] = useState(5);
  const [targetWord, setTargetWord] = useState<WordItem | null>(null);
  const [candies, setCandies] = useState<CandyBall[]>([]);
  
  // Monster visual expressions: 'HUNGRY' | 'YUMMY' | 'YUCK'
  const [monsterState, setMonsterState] = useState<'HUNGRY' | 'YUMMY' | 'YUCK'>('HUNGRY');

  const hero = useMemo(() => {
    return CHARACTERS.find(c => c.id === stats.selectedCharacterId) || CHARACTERS[0];
  }, [stats.selectedCharacterId]);

  const wordPointer = useRef(0);
  const physicsTimer = useRef<NodeJS.Timeout | null>(null);

  const candyEmojis = ['🍬', '🍭', '🍩', '🧁', '🍪', '🍫', '🍮', '🍨'];
  const candyColors = [
    'from-pink-400 to-rose-500 text-white',
    'from-purple-400 to-indigo-500 text-white',
    'from-amber-300 to-orange-500 text-slate-950',
    'from-emerald-300 to-teal-500 text-slate-950',
    'from-cyan-400 to-sky-500 text-slate-950',
    'from-yellow-300 to-amber-500 text-slate-950'
  ];

  const startGame = () => {
    setGameState('PLAYING');
    setScore(0);
    setCoinsEarned(0);
    setXpEarned(0);
    setHearts(5);
    setCandies([]);
    setMonsterState('HUNGRY');
    wordPointer.current = 0;
    audio.playPop();
    nextFeedingTask();
  };

  const nextFeedingTask = () => {
    if (allWords.length === 0) return;
    const target = allWords[wordPointer.current % allWords.length];
    wordPointer.current += 1;
    setTargetWord(target);
    setMonsterState('HUNGRY');
    
    // Spawn immediate wave of candies carrying translations
    spawnCandyWave(target);
    try { audio.speak(target.text); } catch (e) {}
  };

  const spawnCandyWave = (target: WordItem) => {
    const wrongTranslations = allWords
      .filter(w => w.text !== target.text)
      .map(w => w.translation);
    const shuffledWrong = [...wrongTranslations].sort(() => Math.random() - 0.5).slice(0, 3);

    const matchPool = [
      { text: target.translation, isCorrect: true },
      ...shuffledWrong.map(t => ({ text: t, isCorrect: false }))
    ].sort(() => Math.random() - 0.5);

    const newCandies = matchPool.map((item, idx) => {
      return {
        id: `candy-${idx}-${Date.now()}`,
        translation: item.text,
        isCorrect: item.isCorrect,
        x: 15 + idx * 22 + Math.random() * 5,
        y: -15, // start above
        vx: (Math.random() * 2 - 1) * 0.5,
        vy: 1.0 + Math.random() * 0.8,
        color: candyColors[Math.floor(Math.random() * candyColors.length)],
        emoji: candyEmojis[Math.floor(Math.random() * candyEmojis.length)],
        isFed: false
      } as CandyBall;
    });

    setCandies(newCandies);
  };

  // Physics animation loop
  useEffect(() => {
    if (gameState !== 'PLAYING') {
      if (physicsTimer.current) clearInterval(physicsTimer.current);
      return;
    }

    physicsTimer.current = setInterval(() => {
      setCandies(prev => {
        const moved = prev.map(c => {
          if (c.isFed) {
            // Animating suck towards bottom center mouth (50%, 82%)
            const dx = 50 - c.x;
            const dy = 82 - c.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 4) {
              // Reached mouth!
              triggerEatResolve(c);
              return null; // remove from list
            }
            return {
              ...c,
              x: c.x + dx * 0.25,
              y: c.y + dy * 0.25
            };
          }

          // Ordinary descending floating candies bouncing off sides
          let nextX = c.x + c.vx;
          let nextVx = c.vx;
          if (nextX < 5 || nextX > 95) {
            nextVx = -c.vx;
          }
          return {
            ...c,
            x: nextX,
            y: c.y + c.vy,
            vx: nextVx
          };
        }).filter((item): item is CandyBall => item !== null);

        // Did correct candy drop below bottom screen un-fed? Reduce hearts.
        const missedCorrect = moved.some(c => c.isCorrect && !c.isFed && c.y > 95);
        if (missedCorrect) {
          audio.playError();
          setHearts(h => {
            const nextH = h - 1;
            if (nextH <= 0) setGameState('LOST');
            return nextH;
          });
          // Go to next word
          setTimeout(() => nextFeedingTask(), 400);
          return [];
        }

        // If screen gets completely empty, refresh
        if (moved.length === 0) {
          setTimeout(() => {
            if (targetWord) spawnCandyWave(targetWord);
          }, 300);
        }

        return moved.filter(c => c.y < 100);
      });
    }, 60);

    return () => {
      if (physicsTimer.current) clearInterval(physicsTimer.current);
    };
  }, [gameState, targetWord]);

  const triggerEatResolve = (candy: CandyBall) => {
    if (candy.isCorrect) {
      // YUMMY!
      setMonsterState('YUMMY');
      audio.playSuccess();
      setScore(s => s + 50);
      setCoinsEarned(c => c + 3);
      setXpEarned(x => x + 5);

      if (wordPointer.current >= 7) {
        setGameState('WON');
        audio.playCheer();
        try { confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } }); } catch (e) {}
      } else {
        setTimeout(() => nextFeedingTask(), 1000);
      }
    } else {
      // YUCK! Tummyache!
      setMonsterState('YUCK');
      audio.playError();
      setHearts(h => {
        const nextH = h - 1;
        if (nextH <= 0) setGameState('LOST');
        return nextH;
      });
      setScore(s => Math.max(0, s - 20));
      setTimeout(() => setMonsterState('HUNGRY'), 1200);
    }
  };

  const handleCandyClick = (candy: CandyBall) => {
    if (candy.isFed || monsterState !== 'HUNGRY') return;
    // Set fly to mouth animation state
    setCandies(prev => prev.map(c => c.id === candy.id ? { ...c, isFed: true } : c));
  };

  const claimFinish = () => {
    audio.playClick();
    onFinish(score, coinsEarned);
  };

  return (
    <div className="w-full max-w-xl mx-auto rounded-[40px] border-4 border-rose-400 shadow-[0_32px_64px_-16px_rgba(244,63,94,0.15)] bg-gradient-to-b from-[#fff1f2] to-[#ffe4e6] text-[#4c0519] overflow-hidden font-sans relative select-none">
      <h3 className="hidden">词灵大胃喂养记</h3>

      {/* Top Header */}
      <div className="bg-[#9f1239] p-4 flex items-center justify-between border-b border-[#be123c] text-white">
        <div className="flex items-center space-x-3">
          <button onClick={onClose} className="p-2 hover:bg-[#881337] rounded-xl transition-all cursor-pointer">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h4 id="monster-feeding-title" className="font-extrabold text-[#ffe4e6] text-sm leading-none flex items-center gap-1.5">
              <span>萌兽喂词大胃王</span>
              <span className="text-[9px] bg-rose-500/35 text-rose-200 font-extrabold px-1.5 py-0.5 rounded">Feeding</span>
            </h4>
            <span className="text-[10px] text-pink-200 block font-bold mt-1">点击飘落的正确汉字糖果，直接砸入小萌兽大嘴里！</span>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <div className="bg-[#881337] px-2.5 py-1 rounded-xl font-bold flex items-center space-x-1 border border-rose-900">
            <span>🪙</span>
            <span className="text-yellow-300">+{coinsEarned}</span>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {gameState === 'INTRO' && (
          <motion.div 
            key="intro" 
            className="p-8 py-16 text-center space-y-6 bg-gradient-to-b from-[#fff1f2] to-[#fecdd3]"
          >
            <div className="text-6xl animate-bounce">👾🍬</div>
            <div className="space-y-2 animate-pulse">
              <h4 className="text-2xl font-black text-rose-800 tracking-tight">小怪兽饥饿派对：投糖高手</h4>
              <p className="text-xs text-rose-950 font-extrabold leading-relaxed uppercase">
                咕噜噜！小萌兽的肚子打雷啦！它发出英语求投喂口令。点按空中降落的装配着对应翻译汉字的晶莹糖果，以完美弧线投进怪兽嘴里，它会高兴地为你喷吐宝箱金币！
              </p>
            </div>

            <button 
              onClick={startGame}
              className="w-full max-w-xs bg-gradient-to-r from-rose-500 to-pink-500 hover:brightness-110 border-b-4 border-rose-700 py-3.5 rounded-[24px] text-white font-black text-sm transition-all cursor-pointer shadow-lg"
            >
              开启美食派对 😋
            </button>
          </motion.div>
        )}

        {gameState === 'PLAYING' && (
          <motion.div key="playing" className="flex flex-col relative bg-[#fffafb]">
            
            {/* HUD */}
            <div className="bg-[#4c0519] px-4 py-2 flex items-center justify-between text-white text-xs">
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-pink-300">萌兽饱腹心:</span>
                <div className="flex space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-sm">
                      {i < hearts ? '🍖' : '🦴'}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-[#881337] px-2.5 py-0.5 rounded text-[10px] font-black uppercase text-rose-200">
                喂饱进度: {wordPointer.current - 1}/6 饱
              </div>
            </div>

            {/* SKY CANDY FALLING SCREEN */}
            <div className="w-full aspect-[1.8/1] min-h-[250px] bg-gradient-to-b from-[#ffe4e6] via-[#fff1f2] to-[#fbcfe8] relative overflow-hidden px-1 border-b border-rose-100">
              
              {/* Candies mapping */}
              {candies.map(c => (
                <motion.div
                  key={c.id}
                  onClick={() => handleCandyClick(c)}
                  style={{ left: `${c.x}%`, top: `${c.y}%` }}
                  className={`absolute cursor-pointer -translate-x-1/2 -translate-y-1/2 p-2 rounded-full shadow-md bg-gradient-to-r ${c.color} border border-white/60 flex items-center space-x-1 z-10`}
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <span className="text-sm">{c.emoji}</span>
                  <span className="font-black text-[11px] whitespace-nowrap tracking-tight">
                    {c.translation}
                  </span>
                </motion.div>
              ))}

              {/* HUNGY MONSTER AT BOTTOM CENTER (50%, 82%) */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex flex-col items-center">
                
                {/* Speech balloon target word bubble pointing from candy monster */}
                <div className="bg-white border-2 border-rose-400 p-2.5 px-4 rounded-2xl shadow-lg flex flex-col items-center relative mb-2.5 max-w-[150px] text-center">
                  <div className="absolute bottom-[-10px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-8 border-t-rose-400" />
                  <div className="absolute bottom-[-8px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[7px] border-l-transparent border-r-[7px] border-r-transparent border-t-[7px] border-t-white" />
                  <span className="text-[10px] text-rose-500 font-black tracking-widest block leading-none mb-1">
                    CRAVING FOR:
                  </span>
                  <div className="flex items-center space-x-1">
                    <span className="font-black text-rose-900 text-sm tracking-tight">{targetWord?.text}</span>
                    <button 
                      onClick={() => { if(targetWord) audio.speak(targetWord.text); }}
                      className="p-0.5 hover:bg-rose-100 rounded text-rose-500 cursor-pointer"
                    >
                      <Volume2 size={12} />
                    </button>
                  </div>
                </div>

                {/* Animated Monster Body */}
                <motion.div
                  animate={monsterState === 'HUNGRY' ? {
                    scale: [1, 1.05, 1],
                  } : monsterState === 'YUMMY' ? {
                    scale: [1, 1.3, 1],
                    rotate: [0, 8, -8, 0],
                  } : {
                    rotate: [0, 15, -15, 0],
                    scale: [1, 0.9, 1]
                  }}
                  transition={{ duration: 0.5, repeat: monsterState === 'HUNGRY' ? Infinity : 0 }}
                  className="text-6xl relative select-none pointer-events-none"
                >
                  {monsterState === 'HUNGRY' && '👾'}
                  {monsterState === 'YUMMY' && '😋🥰'}
                  {monsterState === 'YUCK' && '🤢😭'}

                  {/* Mouth collision ring indicator for visualization */}
                  <div className="absolute top-[50%] left-1/2 -translate-x-1/2 w-8 h-8 rounded-full border-2 border-dashed border-rose-400 opacity-20 pointer-events-none" />
                </motion.div>
                
                <span className="text-[9px] font-black text-rose-800 bg-rose-200/55 rounded p-0.5 px-1.5 mt-1">
                  {monsterState === 'HUNGRY' && '肚子咕咕叫中...'}
                  {monsterState === 'YUMMY' && '超好吃！太香啦！'}
                  {monsterState === 'YUCK' && '呜呜，吃错肚子疼！'}
                </span>
              </div>

            </div>

            {/* LOWER COGNITION SPELLING BOARD */}
            <div className="p-5 bg-[#fff8f9] border-t border-rose-100 text-center space-y-3">
              <span className="text-[10px] font-black uppercase tracking-wider text-rose-600 block">
                🍖 给小怪兽匹配最美味食物 🍖
              </span>
              <p className="text-[11px] text-slate-500 leading-normal max-w-sm mx-auto">
                观察小怪兽头顶的英语美食气泡「 <span className="font-black text-rose-800 text-xs">{targetWord?.text}</span> 」，然后在上方点击写有相应汉字释义的彩色糖果进行丢投。
              </p>
            </div>

          </motion.div>
        )}

        {gameState === 'WON' && (
          <motion.div 
            key="won" 
            className="p-8 py-14 text-center space-y-6 bg-gradient-to-b from-[#fff1f2] to-[#ffe4e6]"
          >
            <div className="w-16 h-16 bg-rose-500 text-white rounded-full flex items-center justify-center text-3xl mx-auto shadow-lg animate-bounce">
              🍔
            </div>

            <div className="space-y-1">
              <h4 className="text-3xl font-black text-rose-700">超级美食岛主诞生！</h4>
              <p className="text-xs text-rose-950 uppercase font-black leading-relaxed">
                小萌兽终于打饱嗝了！心满意足地打着盹，为你的关照奉上闪耀金币！
              </p>
            </div>

            <div className="bg-rose-100 border border-rose-200 rounded-3xl p-5 max-w-sm mx-auto space-y-3">
              <div className="flex items-center justify-around divide-x divide-rose-200 text-slate-800">
                <div className="text-center">
                  <span className="text-[9px] font-black text-rose-700 block mb-1 uppercase">大胃得分</span>
                  <span className="text-xl font-black text-rose-900 tabular-nums">{score}</span>
                </div>
                <div className="text-center pl-4">
                  <span className="text-[9px] font-black text-rose-600 block mb-1 uppercase">赏赐金币</span>
                  <span className="text-xl font-black text-amber-500 tabular-nums">+{coinsEarned}</span>
                </div>
                <div className="text-center pl-4">
                  <span className="text-[9px] font-black text-pink-600 block mb-1 uppercase">喂食XP</span>
                  <span className="text-xl font-black text-pink-700 tabular-nums">+{xpEarned} XP</span>
                </div>
              </div>
            </div>

            <button 
              onClick={claimFinish}
              className="w-full max-w-xs bg-rose-600 hover:bg-rose-500 border-b-4 border-rose-800 py-3.5 rounded-[24px] text-white font-black text-sm cursor-pointer transition-colors"
            >
              告别小萌兽 下山
            </button>
          </motion.div>
        )}

        {gameState === 'LOST' && (
          <motion.div 
            key="lost" 
            className="p-8 py-14 text-center space-y-6 bg-gradient-to-b from-[#fff1f2] to-[#ffe4e6]"
          >
            <div className="w-16 h-16 bg-rose-150 border border-rose-200 text-rose-500 rounded-full flex items-center justify-center text-3xl mx-auto animate-pulse">
              🦴
            </div>

            <div className="space-y-1 text-slate-800">
              <h4 className="text-2xl font-black text-rose-600">怪兽睡着了！体能枯竭</h4>
              <p className="text-xs text-slate-500 font-extrabold uppercase leading-normal">
                喂食错误过多或有甜点掉在泥地里啦！再次备足干粮，快给怪兽做好吃的大餐吧！
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto pt-4">
              <button 
                onClick={startGame}
                className="bg-rose-600 hover:bg-rose-500 border-b-4 border-rose-800 py-3 rounded-2xl text-white font-black text-xs cursor-pointer"
              >
                点火做饭 (Retry)
              </button>
              <button 
                onClick={claimFinish}
                className="bg-slate-200 border border-slate-350 py-3 rounded-2xl text-slate-600 font-black text-xs cursor-pointer"
              >
                结束本场 (Leave)
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WordMonsterFeeding;
