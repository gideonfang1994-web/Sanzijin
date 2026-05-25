import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { WordGroup, WordItem, UserStats } from '../types';
import { 
  X, ArrowLeft, Volume2, ShieldAlert, Sparkles, Zap, Flame, Target
} from 'lucide-react';
import audio from '../utils/AudioUtils';
import confetti from 'canvas-confetti';
import { CHARACTERS } from '../constants';

interface WordNinjaSlasherProps {
  groups: WordGroup[];
  stats: UserStats;
  onFinish: (score: number, coins: number) => void;
  onClose: () => void;
}

interface SlasherItem {
  id: string;
  word: WordItem;
  translation: string;
  isCorrect: boolean;
  x: number;          // percent (10 - 90)
  y: number;          // percent (105 starting, goes up then down)
  vx: number;         // x velocity
  vy: number;         // y velocity
  isSliced: boolean;
  angle: number;
  rotationSpeed: number;
  emoji: string;
}

interface SliceTrailPoint {
  x: number;
  y: number;
  opacity: number;
}

export const WordNinjaSlasher: React.FC<WordNinjaSlasherProps> = ({ groups, stats, onFinish, onClose }) => {
  const allWords = useMemo(() => {
    let list: WordItem[] = [];
    groups.forEach(g => {
      g.words.forEach(w => {
        list.push(w);
      });
    });
    if (list.length === 0) {
      list = [
        { text: 'ninja', translation: '忍者', imageUrl: '' },
        { text: 'sword', translation: '剑术', imageUrl: '' },
        { text: 'shadow', translation: '影子', imageUrl: '' },
        { text: 'forest', translation: '森林', imageUrl: '' },
        { text: 'moon', translation: '月亮', imageUrl: '' }
      ];
    }
    return [...list].sort(() => Math.random() - 0.5);
  }, [groups]);

  const [gameState, setGameState] = useState<'INTRO' | 'PLAYING' | 'WON' | 'LOST'>('INTRO');
  const [score, setScore] = useState(0);
  const [coinsEarned, setCoinsEarned] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  const [health, setHealth] = useState(5); // 5 hearts
  const [combo, setCombo] = useState(0);

  const [items, setItems] = useState<SlasherItem[]>([]);
  const [targetWord, setTargetWord] = useState<WordItem | null>(null);
  
  // Sword slice trail capture
  const [trail, setTrail] = useState<SliceTrailPoint[]>([]);
  const playAreaRef = useRef<HTMLDivElement>(null);

  const hero = useMemo(() => {
    return CHARACTERS.find(c => c.id === stats.selectedCharacterId) || CHARACTERS[0];
  }, [stats.selectedCharacterId]);

  const wordIdx = useRef(0);
  const loopTimer = useRef<NodeJS.Timeout | null>(null);
  const spawnTimer = useRef<NodeJS.Timeout | null>(null);

  const fruits = ['🍎', '🍊', '🍉', '🍌', '🍍', '🍈', '🥥', '🍑'];

  const startNinjaGame = () => {
    setGameState('PLAYING');
    setScore(0);
    setCoinsEarned(0);
    setXpEarned(0);
    setHealth(5);
    setCombo(0);
    setItems([]);
    wordIdx.current = 0;

    audio.playPop();
    nextNinjaTask();
  };

  const nextNinjaTask = () => {
    if (allWords.length === 0) return;
    const target = allWords[wordIdx.current % allWords.length];
    wordIdx.current += 1;
    setTargetWord(target);

    // Setup initial fly-up items
    spawnBatchOfScrolls(target);
    try { audio.speak(target.text); } catch(e){}
  };

  const spawnBatchOfScrolls = (target: WordItem) => {
    const wrongList = allWords
      .filter(w => w.text !== target.text)
      .map(w => w.translation);
    const shuffledWrong = [...wrongList].sort(() => Math.random() - 0.5).slice(0, 3);

    const pool = [
      { translation: target.translation, isCorrect: true, word: target },
      ...shuffledWrong.map(t => {
        const matchingWord = allWords.find(w => w.translation === t) || target;
        return { translation: t, isCorrect: false, word: matchingWord };
      })
    ];

    // Shuffle pool
    const shuffledPool = pool.sort(() => Math.random() - 0.5);

    const newItems = shuffledPool.map((elm, index) => {
      // parabolic flight parameters
      const startX = 15 + index * 20 + Math.random() * 10;
      return {
        id: `scroll-${index}-${Date.now()}`,
        word: elm.word,
        translation: elm.translation,
        isCorrect: elm.isCorrect,
        x: startX,
        y: 110, // starts below screen
        vx: (50 - startX) * 0.05 + (Math.random() * 2 - 1), // drift toward center
        vy: -(12 + Math.random() * 5), // rapid upward thrust
        isSliced: false,
        angle: Math.random() * 360,
        rotationSpeed: Math.random() * 6 - 3,
        emoji: fruits[Math.floor(Math.random() * fruits.length)]
      } as SlasherItem;
    });

    setItems(newItems);
  };

  // Main Loop
  useEffect(() => {
    if (gameState !== 'PLAYING') {
      if (loopTimer.current) clearInterval(loopTimer.current);
      if (spawnTimer.current) clearInterval(spawnTimer.current);
      return;
    }

    // 100ms Physics ticks
    loopTimer.current = setInterval(() => {
      setItems(prev => {
        const updated = prev.map(item => {
          const nextY = item.y + item.vy;
          const nextX = item.x + item.vx;
          const nextVy = item.vy + 0.6; // gravity acts downwards

          return {
            ...item,
            x: nextX,
            y: nextY,
            vy: nextVy,
            angle: item.angle + item.rotationSpeed
          };
        });

        // If correct translation fell off screen unsliced, combo is lost and we lose 1 health
        const missedCorrect = updated.some(item => item.isCorrect && !item.isSliced && item.y > 115 && item.vy > 0);
        if (missedCorrect) {
          audio.playError();
          setHealth(h => {
            const nextH = h - 1;
            if (nextH <= 0) {
              setGameState('LOST');
            }
            return nextH;
          });
          setCombo(0);
          // Auto trigger next word
          setTimeout(() => nextNinjaTask(), 400);
          return [];
        }

        // If all items of the current batch fell off or were sliced, trigger next task!
        const allDone = updated.every(item => item.isSliced || item.y > 120);
        if (allDone && updated.length > 0) {
          setTimeout(() => nextNinjaTask(), 200);
          return [];
        }

        return updated.filter(item => item.y < 125);
      });

      // Decay slice trail points
      setTrail(t => t.map(p => ({ ...p, opacity: p.opacity - 0.15 })).filter(p => p.opacity > 0));

    }, 50);

    // Spare spontaneous spawns if pool is dry
    spawnTimer.current = setInterval(() => {
      setItems(curr => {
        if (curr.length === 0 && targetWord) {
          spawnBatchOfScrolls(targetWord);
        }
        return curr;
      });
    }, 4500);

    return () => {
      if (loopTimer.current) clearInterval(loopTimer.current);
      if (spawnTimer.current) clearInterval(spawnTimer.current);
    };
  }, [gameState, targetWord]);

  // Pointer drag event handlers for mouse slicing
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (gameState !== 'PLAYING' || !playAreaRef.current) return;
    const rect = playAreaRef.current.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * 100;
    const py = ((e.clientY - rect.top) / rect.height) * 100;

    // Append to slash trail
    setTrail(prev => [...prev, { x: px, y: py, opacity: 1.0 }].slice(-15));

    // Collision check: check if pointer passes over any unsliced scroll
    setItems(currentItems => {
      return currentItems.map(item => {
        if (item.isSliced) return item;

        // Calculate distance in coordinates
        const distance = Math.sqrt(Math.pow(item.x - px, 2) + Math.pow(item.y - py, 2));

        if (distance < 7.5) {
          // SLICED! 🎋
          const nextItemState = { ...item, isSliced: true };
          handleItemSliced(nextItemState);
          return nextItemState;
        }

        return item;
      });
    });
  };

  const handleItemSliced = (sliced: SlasherItem) => {
    if (sliced.isCorrect) {
      audio.playSuccess();
      setScore(s => s + 50 + combo * 10);
      setCoinsEarned(c => c + 3);
      setXpEarned(x => x + 5);
      setCombo(c => c + 1);

      // Play particle effect or speak
      try { audio.speak(targetWord?.text || ''); } catch(e){}

      // Check win parameters
      if (wordIdx.current >= 8) {
        setGameState('WON');
        audio.playCheer();
        try { confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } }); } catch(e){}
      }
    } else {
      // Wrong slice! Detonate bomb!
      audio.playError();
      setHealth(h => {
        const nextH = h - 1;
        if (nextH <= 0) {
          setGameState('LOST');
        }
        return nextH;
      });
      setCombo(0);
      setScore(s => Math.max(0, s - 20));
    }
  };

  const claimFinish = () => {
    audio.playClick();
    onFinish(score, coinsEarned);
  };

  return (
    <div className="w-full max-w-xl mx-auto rounded-[40px] border-4 border-emerald-500 shadow-[0_32px_64px_-16px_rgba(16,185,129,0.15)] bg-[#0c120c] text-slate-100 overflow-hidden font-sans relative select-none">
      <h3 className="hidden">词境神斩忍者</h3>

      {/* Top Bar */}
      <div className="bg-[#142215] p-4 flex items-center justify-between border-b border-[#203623] text-white">
        <div className="flex items-center space-x-3">
          <button onClick={onClose} className="p-2 hover:bg-[#1a301c] rounded-xl transition-all cursor-pointer">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h4 className="font-extrabold text-[#a7f3d0] text-sm leading-none flex items-center gap-1.5">
              <span>词境神斩 (Word Slasher)</span>
              <span className="text-[9px] bg-emerald-500/25 text-emerald-300 font-extrabold px-1.5 py-0.5 rounded">Dojo</span>
            </h4>
            <span className="text-[10px] text-emerald-400 block font-bold mt-1">在面板中划划手指/鼠标，切碎所有正确的翻译！</span>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <div className="bg-[#1b2f1d] px-2.5 py-1 rounded-xl font-bold flex items-center space-x-1 border border-[#203c23]">
            <span>🪙</span>
            <span className="text-amber-300">+{coinsEarned}</span>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {gameState === 'INTRO' && (
          <motion.div 
            key="intro" 
            className="p-8 py-16 text-center space-y-6 bg-gradient-to-b from-[#0e170f] to-[#122313]"
          >
            <div className="text-6xl animate-pulse">🗡️</div>
            <div className="space-y-2">
              <h4 className="text-2xl font-black text-emerald-400 tracking-tight">忍者词境神斩：忍法碎空</h4>
              <p className="text-xs text-emerald-200 font-extrabold leading-relaxed uppercase">
                影之流派武士！用利刃斩断在空中划写的咒叶！观察顶部的目标英文单词，在水果叶卷掠过虚空时切烂正确的翻译汉字。切错有引爆咒弹扣除生命的可能！
              </p>
            </div>

            <div className="p-4 bg-emerald-950/40 border border-emerald-900/40 rounded-3xl max-w-sm mx-auto text-left flex items-start space-x-3">
              <Target size={18} className="text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] font-black text-emerald-300 uppercase block mb-1">🎋 剑客秘笈 (Ninja Blade)</span>
                <p className="text-[11px] font-bold text-slate-400 leading-normal">
                  水果纸卷一旦飞起，在屏幕区域点住滑动，挥舞出炫酷的剑气。连续斩击正确释义可以累积超额连击（Combo）加分哦！
                </p>
              </div>
            </div>

            <button 
              onClick={startNinjaGame}
              className="w-full max-w-xs bg-gradient-to-r from-emerald-500 to-teal-500 hover:brightness-110 border-b-4 border-emerald-700 py-3.5 rounded-[24px] text-white font-black text-sm transition-all cursor-pointer shadow-lg"
            >
              拔剑神斩 🔪
            </button>
          </motion.div>
        )}

        {gameState === 'PLAYING' && (
          <motion.div key="playing" className="flex flex-col relative bg-[#090e09]">
            
            {/* HUD */}
            <div className="bg-[#0e190f] px-4 py-2 flex items-center justify-between text-xs border-b border-[#203623]">
              <div className="flex items-center space-x-2.5">
                <span className="font-extrabold text-emerald-400">御敌生命:</span>
                <div className="flex space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-sm">
                      {i < health ? '❤️' : '💀'}
                    </span>
                  ))}
                </div>
              </div>

              {combo > 1 && (
                <motion.div 
                  initial={{ scale: 0.8 }} 
                  animate={{ scale: [1, 1.2, 1] }} 
                  className="bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded text-[10px] font-black text-emerald-300"
                >
                  🔥 连击 {combo}x COMBO
                </motion.div>
              )}

              <div className="bg-[#142516] px-2 py-0.5 rounded text-[10px] text-slate-400 font-black">
                斩中进度: {wordIdx.current - 1}/7
              </div>
            </div>

            {/* INTEGRATED SLICE SLASHER DOJO FIELD */}
            <div 
              ref={playAreaRef}
              onPointerMove={handlePointerMove}
              className="w-full aspect-[1.8/1] min-h-[260px] bg-[#0c140c] bg-radial-gradient relative overflow-hidden select-none cursor-crosshair border-b border-[#203623]"
            >
              {/* Backdrops Sparks or Lanterns */}
              <div className="absolute top-2 right-4 text-xs font-black text-emerald-800/60 leading-none">
                🎋 影魂道场 (Wind Dojo)
              </div>

              {/* Render Slice Neon Path line */}
              <svg className="absolute inset-0 pointer-events-none w-full h-full z-30">
                {trail.length > 1 && (
                  <path
                    d={`M ${trail.map(p => `${(p.x * playAreaRef.current!.clientWidth) / 100} ${(p.y * playAreaRef.current!.clientHeight) / 100}`).join(' L ')}`}
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ filter: 'drop-shadow(0px 0px 8px #10b981)', opacity: 0.8 }}
                  />
                )}
              </svg>

              {/* Slasher items array */}
              {items.map(item => {
                if (item.isSliced) {
                  // Sliced Splatter half-slice rendering
                  return (
                    <div 
                      key={item.id} 
                      className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none scale-90"
                      style={{ left: `${item.x}%`, top: `${item.y}%`, transform: `rotate(${item.angle}deg)` }}
                    >
                      <div className="flex space-x-4 animate-out fade-out-50 zoom-out duration-300">
                        <span className="text-xl rotate-45 transform">💥 {item.translation}</span>
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={item.id}
                    className="absolute -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer"
                    style={{ 
                      left: `${item.x}%`, 
                      top: `${item.y}%`,
                      transform: `rotate(${item.angle}deg)`
                    }}
                  >
                    <div className="bg-[#182a1a] hover:bg-[#203823] p-2 py-1.5 border border-emerald-500 rounded-xl shadow-lg flex items-center space-x-1 select-none pointer-events-none">
                      <span className="text-xs">{item.emoji}</span>
                      <span className="text-[10px] font-black text-emerald-100 uppercase tracking-tight">
                        {item.translation}
                      </span>
                    </div>
                  </div>
                );
              })}

            </div>

            {/* SPELL COGNITION INTERACTION */}
            <div className="p-6 bg-[#162218] border-t border-[#203c23]">
              {targetWord ? (
                <div className="space-y-3.5 text-center">
                  <div className="inline-flex items-center space-x-1 bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-1 rounded-full text-[9px] font-black uppercase text-emerald-400 tracking-wider">
                    <span>🥋 影之斩击</span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-emerald-400 block tracking-wider uppercase">
                      寻找对应翻译
                    </span>
                    <div className="flex items-center justify-center space-x-1.5">
                      <h4 className="text-3xl font-black text-emerald-300 tracking-tight select-all">
                        {targetWord.text}
                      </h4>
                      <button 
                        onClick={() => { audio.speak(targetWord.text); }}
                        className="p-1 text-emerald-400 hover:text-emerald-300 hover:bg-[#1f3622] rounded-lg transition-colors cursor-pointer"
                      >
                        <Volume2 size={16} />
                      </button>
                    </div>
                  </div>

                  <p className="text-[10px] font-bold text-slate-400 leading-none">
                    在上方屏幕内快速划线，切碎写有对应中文字样飞卷！
                  </p>
                </div>
              ) : (
                <div className="py-6 text-center text-slate-500 font-bold">连接道林神识中...</div>
              )}
            </div>

          </motion.div>
        )}

        {gameState === 'WON' && (
          <motion.div 
            key="won" 
            className="p-8 py-14 text-center space-y-6 bg-gradient-to-b from-[#0c120c] to-[#121f15]"
          >
            <div className="w-16 h-16 bg-emerald-500 text-white rounded-full flex items-center justify-center text-3xl mx-auto shadow-lg animate-bounce">
              🗡️
            </div>

            <div className="space-y-1">
              <h4 className="text-3xl font-black text-emerald-400">影流碎心大名！</h4>
              <p className="text-xs text-slate-400 uppercase font-black leading-relaxed">
                完美的防线斩击！你在暴风叶影中寻获了所有神格契约！
              </p>
            </div>

            <div className="bg-[#182319] border border-[#203c23] rounded-3xl p-5 max-w-sm mx-auto space-y-3">
              <div className="flex items-center justify-around divide-x divide-[#203c23]">
                <div className="text-center">
                  <span className="text-[9px] font-black text-slate-400 uppercase block mb-1">修罗分数</span>
                  <span className="text-xl font-black text-[#a7f3d0] tabular-nums">{score}</span>
                </div>
                <div className="text-center pl-4">
                  <span className="text-[9px] font-black text-amber-500 uppercase block mb-1">契约刃币</span>
                  <span className="text-xl font-black text-amber-400 tabular-nums">+{coinsEarned}</span>
                </div>
                <div className="text-center pl-4">
                  <span className="text-[9px] font-black text-cyan-400 block mb-1 uppercase">影级经验</span>
                  <span className="text-xl font-black text-cyan-300 tabular-nums">+{xpEarned} XP</span>
                </div>
              </div>
            </div>

            <button 
              onClick={claimFinish}
              className="w-full max-w-xs bg-emerald-600 hover:bg-emerald-500 border-b-4 border-emerald-800 py-3.5 rounded-[24px] text-white font-black text-sm cursor-pointer transition-colors"
            >
              回归营地 收刀
            </button>
          </motion.div>
        )}

        {gameState === 'LOST' && (
          <motion.div 
            key="lost" 
            className="p-8 py-14 text-center space-y-6 bg-gradient-to-b from-[#0e170f] to-[#112313]"
          >
            <div className="w-16 h-16 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-full flex items-center justify-center text-3xl mx-auto animate-pulse">
              🛡️
            </div>

            <div className="space-y-1">
              <h4 className="text-2xl font-black text-rose-500">法阵破碎！气血枯竭</h4>
              <p className="text-xs text-slate-400 font-extrabold uppercase leading-normal">
                切错符弹或错失过量绿叶。重振精神，把注意力集中在单词翻译上！
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto pt-4">
              <button 
                onClick={startNinjaGame}
                className="bg-emerald-600 hover:bg-emerald-500 border-b-4 border-emerald-800 py-3 rounded-2xl text-white font-black text-xs cursor-pointer"
              >
                重启剑道 (Retry)
              </button>
              <button 
                onClick={claimFinish}
                className="bg--slate-900 border border-slate-800 py-3 rounded-2xl text-slate-300 font-black text-xs cursor-pointer"
              >
                结束修业 (Leave)
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WordNinjaSlasher;
