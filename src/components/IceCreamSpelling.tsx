import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { WordGroup, WordItem, UserStats } from '../types';
import { ArrowLeft, Volume2, ShieldAlert, Sparkles, AlertTriangle } from 'lucide-react';
import audio from '../utils/AudioUtils';
import confetti from 'canvas-confetti';
import { CHARACTERS } from '../constants';

interface IceCreamSpellingProps {
  groups: WordGroup[];
  stats: UserStats;
  onFinish: (score: number, coins: number) => void;
  onClose: () => void;
}

interface SkyScoop {
  id: string;
  letter: string;
  x: number;      // percent (10 to 90)
  y: number;      // percent starting at -10
  speed: number;
  color: string;
  emoji: string;
}

export const IceCreamSpelling: React.FC<IceCreamSpellingProps> = ({ groups, stats, onFinish, onClose }) => {
  const allWords = useMemo(() => {
    let list: WordItem[] = [];
    groups.forEach(g => {
      g.words.forEach(w => {
        // Only include words with length between 3 and 7 for perfect heap towers
        if (w.text.length >= 2 && w.text.length <= 7) {
          list.push(w);
        }
      });
    });
    if (list.length === 0) {
      list = [
        { text: 'cat', translation: '猫咪', imageUrl: '' },
        { text: 'dog', translation: '小狗', imageUrl: '' },
        { text: 'sun', translation: '太阳', imageUrl: '' },
        { text: 'cake', translation: '蛋糕', imageUrl: '' },
        { text: 'milk', translation: '牛奶', imageUrl: '' }
      ];
    }
    return [...list].sort(() => Math.random() - 0.5);
  }, [groups]);

  const [gameState, setGameState] = useState<'INTRO' | 'PLAYING' | 'WON' | 'LOST'>('INTRO');
  const [score, setScore] = useState(0);
  const [coinsEarned, setCoinsEarned] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  const [hearts, setHearts] = useState(5);

  const [coneX, setConeX] = useState(50); // cone positioning (15% to 85%)
  const [targetWord, setTargetWord] = useState<WordItem | null>(null);
  const [spelledLetters, setSpelledLetters] = useState<string[]>([]);
  const [scoops, setScoops] = useState<SkyScoop[]>([]);

  const hero = useMemo(() => {
    return CHARACTERS.find(c => c.id === stats.selectedCharacterId) || CHARACTERS[0];
  }, [stats.selectedCharacterId]);

  const wordPointer = useRef(0);
  const engineLoop = useRef<NodeJS.Timeout | null>(null);
  const spawnLoop = useRef<NodeJS.Timeout | null>(null);

  const scoopColors = [
    'from-pink-300 to-rose-400 border-pink-200',  // Strawberry
    'from-amber-200 to-yellow-300 border-amber-100', // Vanilla custard
    'from-emerald-300 to-green-400 border-emerald-200', // Matcha
    'from-amber-400 to-orange-500 border-orange-350', // Mango
    'from-sky-300 to-cyan-400 border-sky-200', // Bubblegum
    'from-purple-300 to-violet-400 border-purple-200' // Blueberry
  ];

  const scoopEmojis = ['🍓', '🍌', '🍦', '🍨', '🍿', '🍑', '🫐', '🍒'];

  const startGame = () => {
    setGameState('PLAYING');
    setScore(0);
    setCoinsEarned(0);
    setXpEarned(0);
    setHearts(5);
    setConeX(50);
    setSpelledLetters([]);
    setScoops([]);
    wordPointer.current = 0;

    audio.playPop();
    nextSpellingTask();
  };

  const nextSpellingTask = () => {
    if (allWords.length === 0) return;
    const target = allWords[wordPointer.current % allWords.length];
    wordPointer.current += 1;
    setTargetWord(target);
    setSpelledLetters([]);
    setScoops([]);

    // Trigger letters immediate spawning
    spawnScoopLayer(target, []);
    try { audio.speak(target.text); } catch (e) {}
  };

  const spawnScoopLayer = (target: WordItem, currentlySpelled: string[]) => {
    const lettersPool = target.text.toLowerCase().split('');
    const targetIndex = currentlySpelled.length;
    const coreNext = lettersPool[targetIndex];

    if (!coreNext) return;

    // Build letter choices: 1 correct next scoop, other wrong random characters
    const alphabets = 'abcdefghijklmnopqrstuvwxyz';
    const batchList: string[] = [coreNext];

    for (let i = 0; i < 3; i++) {
      const randomLetter = alphabets[Math.floor(Math.random() * alphabets.length)];
      if (randomLetter !== coreNext && !batchList.includes(randomLetter)) {
        batchList.push(randomLetter);
      }
    }

    // Shuffle spatial drops
    const shuffled = batchList.sort(() => Math.random() - 0.5);

    const columns = [22, 40, 58, 76];
    const shuffledCols = [...columns].sort(() => Math.random() - 0.5);

    const newScoops = shuffled.map((char, index) => {
      return {
        id: `scoop-${index}-${Date.now()}`,
        letter: char,
        x: shuffledCols[index % shuffledCols.length],
        y: -10, // above screen
        speed: 1.0 + Math.random() * 0.8,
        color: scoopColors[Math.floor(Math.random() * scoopColors.length)],
        emoji: scoopEmojis[Math.floor(Math.random() * scoopEmojis.length)]
      } as SkyScoop;
    });

    setScoops(curr => {
      // Clear old un-caught ones to clean pipeline memory
      return [...curr.filter(c => c.y < 85), ...newScoops];
    });
  };

  // Flying physics thread
  useEffect(() => {
    if (gameState !== 'PLAYING') {
      if (engineLoop.current) clearInterval(engineLoop.current);
      if (spawnLoop.current) clearInterval(spawnLoop.current);
      return;
    }

    engineLoop.current = setInterval(() => {
      setScoops(prev => {
        const moved = prev.map(s => {
          return { ...s, y: s.y + s.speed };
        });

        // Check if any scoop collided with the cone at Y=83
        const caught = moved.find(s => s.y >= 78 && s.y <= 85 && Math.abs(s.x - coneX) < 13);
        if (caught) {
          resolveConeCatch(caught);
          return moved.filter(s => s.id !== caught.id);
        }

        // Did correct letter scoop leak off un-caught? Penalty!
        const targetLetters = targetWord?.text.toLowerCase().split('') || [];
        const nextRequired = targetLetters[spelledLetters.length];
        const missedCorrect = moved.some(s => s.letter === nextRequired && s.y > 90);
        if (missedCorrect) {
          audio.playError();
          setHearts(h => {
            const nextH = h - 1;
            if (nextH <= 0) setGameState('LOST');
            return nextH;
          });
          // respawn items
          setTimeout(() => {
            if (targetWord) spawnScoopLayer(targetWord, spelledLetters);
          }, 300);
          return [];
        }

        return moved.filter(s => s.y < 100);
      });
    }, 70);

    // Dynamic spawn scheduler
    spawnLoop.current = setInterval(() => {
      setScoops(curr => {
        const onscreenLeft = curr.filter(c => c.y < 80);
        if (onscreenLeft.length <= 1 && targetWord) {
          spawnScoopLayer(targetWord, spelledLetters);
        }
        return curr;
      });
    }, 3800);

    return () => {
      if (engineLoop.current) clearInterval(engineLoop.current);
      if (spawnLoop.current) clearInterval(spawnLoop.current);
    };
  }, [gameState, coneX, spelledLetters, targetWord]);

  const resolveConeCatch = (scoop: SkyScoop) => {
    if (!targetWord) return;
    const targetSeq = targetWord.text.toLowerCase().split('');
    const targetIdx = spelledLetters.length;
    const expected = targetSeq[targetIdx];

    if (scoop.letter === expected) {
      // Correct layer stack! 🍦
      audio.playSuccess();
      const loaded = [...spelledLetters, scoop.letter];
      setSpelledLetters(loaded);

      setScore(s => s + 50);
      setCoinsEarned(c => c + 2);
      setXpEarned(x => x + 5);

      if (loaded.join('') === targetWord.text.toLowerCase()) {
        // Complete Spelling combo! Speak and claim gourmet ice cream
        try { audio.speak(targetWord.text); } catch (e) {}

        if (wordPointer.current >= 6) {
          setGameState('WON');
          audio.playCheer();
          try { confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } }); } catch (e) {}
        } else {
          setTimeout(() => nextSpellingTask(), 1000);
        }
      } else {
        // replenishment
        setTimeout(() => spawnScoopLayer(targetWord, loaded), 150);
      }
    } else {
      // Melted SPLAT! Caught wrong letter
      audio.playError();
      setHearts(h => {
        const nextH = h - 1;
        if (nextH <= 0) setGameState('LOST');
        return nextH;
      });
      setScore(s => Math.max(0, s - 15));
    }
  };

  const moveLeft = () => setConeX(x => Math.max(15, x - 13));
  const moveRight = () => setConeX(x => Math.min(85, x + 13));

  const claimFinish = () => {
    audio.playClick();
    onFinish(score, coinsEarned);
  };

  return (
    <div className="w-full max-w-xl mx-auto rounded-[40px] border-4 border-rose-300 shadow-[0_32px_64px_-16px_rgba(244,63,94,0.15)] bg-gradient-to-b from-[#fff1f2] to-[#ffe4e6] text-[#4c0519] overflow-hidden font-sans relative select-none">
      <h3 className="hidden">美味冰淇淋叠高塔</h3>

      {/* Header Info */}
      <div className="bg-[#9f1239] p-4 flex items-center justify-between border-b border-[#be123c] text-white">
        <div className="flex items-center space-x-3">
          <button onClick={onClose} className="p-2 hover:bg-[#881337] rounded-xl transition-all cursor-pointer">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h4 id="icecream-title" className="font-extrabold text-[#ffe4e6] text-sm leading-none flex items-center gap-1.5">
              <span>冰淇淋叠糖拼 (Ice Cream Tower)</span>
              <span className="text-[9px] bg-rose-500/25 text-pink-200 font-extrabold px-1.5 py-0.5 rounded">Store</span>
            </h4>
            <span className="text-[10px] text-pink-200 block font-bold mt-1">控制木接斗左右位移，按字母拼写顺序接住落下的冰淇淋球</span>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <div className="bg-[#881337] px-2.5 py-1 rounded-xl font-bold flex items-center space-x-1 border border-pink-900">
            <span>🪙</span>
            <span className="text-yellow-300">+{coinsEarned}</span>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {gameState === 'INTRO' && (
          <motion.div 
            key="intro" 
            className="p-8 py-16 text-center space-y-6 bg-gradient-to-b from-[#fff1f2] to-[#fdba74]"
          >
            <div className="text-6xl animate-bounce">🍨🍦</div>
            <div className="space-y-2">
              <h4 className="text-2xl font-black text-rose-950 tracking-tight">冰淇淋店营业：叠叠乐大派对</h4>
              <p className="text-xs text-rose-950 font-extrabold leading-relaxed uppercase">
                雪糕控集合！顶端将显示英文美食对应的中文涵义（比如「小狗」即为 DOG）。各种印有彩色字母的奶油球正从云朵滑落，控制纸蛋筒左右横摆，按着顺序 D ➡️ O ➡️ G 叠配。看看雪糕塔能耸入几天空吧！
              </p>
            </div>

            <button 
              onClick={startGame}
              className="w-full max-w-xs bg-gradient-to-r from-pink-500 to-orange-500 hover:brightness-110 border-b-4 border-pink-700 py-3.5 rounded-[24px] text-white font-black text-sm transition-all cursor-pointer shadow-lg"
            >
              打桩雪糕店 开工 🍦
            </button>
          </motion.div>
        )}

        {gameState === 'PLAYING' && (
          <motion.div key="playing" className="flex flex-col relative bg-[#fffdfa]">
            
            {/* HUD Status */}
            <div className="bg-[#4c0519] px-4 py-2 flex items-center justify-between text-white text-xs">
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-pink-300 flex items-center">
                  🍦 破冰勺生命:
                </span>
                <div className="flex space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-sm">
                      {i < hearts ? '🍦' : '❌'}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-[#881337] px-2.5 py-0.5 rounded text-[10px] font-black uppercase text-rose-200">
                雪糕柜台: {wordPointer.current - 1}/5 支
              </div>
            </div>

            {/* FALLING SCOOPS ICE CREAM RANGE CANVAS */}
            <div className="w-full aspect-[1.8/1] min-h-[250px] bg-gradient-to-b from-[#ffedd5] via-[#ffe4e6] to-[#fbcfe8] relative overflow-hidden px-1 border-b border-rose-200">
              
              {/* Star sparkles */}
              <div className="absolute top-2 right-4 text-[9px] font-black text-rose-700/45 tracking-widest pointer-events-none select-none">
                🍨 ICE-CREAM KITCHEN
              </div>

              {/* Falling scoop balls */}
              {scoops.map(s => (
                <div
                  key={s.id}
                  style={{ left: `${s.x}%`, top: `${s.y}%` }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 p-1 rounded-full bg-gradient-to-b ${s.color} border-2 border-dashed flex flex-col items-center justify-center shadow-lg w-11 h-11 z-10`}
                >
                  <span className="text-[10px] m-0 leading-none">{s.emoji}</span>
                  <span className="font-black text-sm text-[#4c0519] leading-none uppercase select-none">
                    {s.letter}
                  </span>
                </div>
              ))}

              {/* Stacked scoops on top of core cone bucket at bottom (coneX%, 83%) */}
              <div 
                className="absolute top-[82%] -translate-y-1/2 -translate-x-1/2 z-20 flex flex-col items-center transition-all duration-75"
                style={{ left: `${coneX}%` }}
              >
                {/* Wobbling stacked scoop layers showing caught spelling */}
                <div className="flex flex-col-reverse items-center justify-end h-auto relative mb-[-12px]">
                  {spelledLetters.map((l, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ y: -15, scale: 0.6 }}
                      animate={{ y: 0, scale: 1 }}
                      className={`w-12 h-6 rounded-t-full border-t bg-gradient-to-r from-pink-300 to-rose-400 border-white/40 shadow-sm text-[#4c0519] font-black text-[11px] flex items-center justify-center uppercase mt-[-10px] z-${10 + idx}`}
                      style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}
                    >
                      {l}
                    </motion.div>
                  ))}
                </div>

                {/* Baked Waffle cone */}
                <span className="text-4xl leading-none select-none pointer-events-none drop-shadow">
                  📐
                </span>
                
                <span className="text-[8px] font-black tracking-widest px-1.5 py-0.5 bg-rose-500 text-white rounded mt-1 shadow-sm leading-none whitespace-nowrap uppercase">
                  Cone Bucket
                </span>
              </div>

            </div>

            {/* DIRECTION CONTROLLER PANEL WITH SENSORY COGNITION TARGETS */}
            <div className="p-4 bg-[#fff9fa] border-t border-rose-100 space-y-4">
              {targetWord ? (
                <div className="text-center space-y-3 pb-1">
                  
                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-rose-500 tracking-wider block leading-none uppercase">
                      寻找该汉字的英文拼写字母: 「 {targetWord.translation} 」
                    </span>
                    
                    <div className="flex items-center justify-center space-x-1 min-h-[42px]">
                      {targetWord.text.toLowerCase().split('').map((letter, idx) => {
                        const caught = spelledLetters[idx] === letter;
                        return (
                          <div
                            key={idx}
                            className={`w-9 h-9 font-black flex items-center justify-center rounded-xl border-2 text-sm uppercase shadow-inner ${
                              caught 
                                ? 'bg-gradient-to-br from-pink-400 to-rose-500 text-white border-pink-300' 
                                : 'bg-white text-rose-200 border-rose-100'
                            }`}
                          >
                            {caught ? letter : '?'}
                          </div>
                        );
                      })}

                      <button 
                        onClick={() => { audio.speak(targetWord.text); }}
                        className="ml-2.5 p-1 bg-rose-500/10 hover:bg-rose-500/25 border border-rose-500/20 text-rose-700 hover:text-rose-950 rounded-lg transition-colors cursor-pointer"
                      >
                        <Volume2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-2 text-center text-rose-300 font-extrabold text-sm">冷却雪糕机中...</div>
              )}

              {/* DIRECTION FLAGGING BUTTON KEYPAD */}
              <div className="flex items-center gap-3 max-w-sm mx-auto">
                <button 
                  onClick={moveLeft}
                  className="flex-1 py-3.5 bg-rose-100 hover:bg-rose-200 border-rose-300 font-black text-xs text-rose-800 rounded-2xl cursor-pointer active:scale-95 text-center shadow border"
                >
                  ◀️ 蛋筒向左
                </button>

                <button 
                  onClick={moveRight}
                  className="flex-1 py-3.5 bg-rose-100 hover:bg-rose-200 border-rose-300 font-black text-xs text-rose-800 rounded-2xl cursor-pointer active:scale-95 text-center shadow border"
                >
                  蛋筒向右 ▶️
                </button>
              </div>
            </div>

          </motion.div>
        )}

        {gameState === 'WON' && (
          <motion.div 
            key="won" 
            className="p-8 py-14 text-center space-y-6 bg-gradient-to-b from-[#fff1f2] to-[#ffe4e6]"
          >
            <div className="w-16 h-16 bg-pink-500 text-white rounded-full flex items-center justify-center text-3xl mx-auto shadow-lg animate-bounce">
              🍦
            </div>

            <div className="space-y-1">
              <h4 className="text-3xl font-black text-rose-700">冰品大师大功成！</h4>
              <p className="text-xs text-rose-950 uppercase font-black leading-relaxed">
                全套超高雪糕高塔完美奉客！店门外长龙齐贺，财源滚滚！
              </p>
            </div>

            <div className="bg-rose-100 border border-rose-200 rounded-3xl p-5 max-w-sm mx-auto space-y-3">
              <div className="flex items-center justify-around divide-x divide-rose-200 text-slate-800">
                <div className="text-center">
                  <span className="text-[9px] font-black text-rose-700 block mb-1 uppercase">叠雪糕得分</span>
                  <span className="text-xl font-black text-rose-900 tabular-nums">{score}</span>
                </div>
                <div className="text-center pl-4">
                  <span className="text-[9px] font-black text-rose-600 block mb-1 uppercase">赏赐金币</span>
                  <span className="text-xl font-black text-amber-500 tabular-nums">+{coinsEarned}</span>
                </div>
                <div className="text-center pl-4">
                  <span className="text-[9px] font-black text-pink-600 block mb-1 uppercase">雪糕店XP</span>
                  <span className="text-xl font-black text-pink-700 tabular-nums">+{xpEarned} XP</span>
                </div>
              </div>
            </div>

            <button 
              onClick={claimFinish}
              className="w-full max-w-xs bg-rose-600 hover:bg-rose-500 border-b-4 border-rose-800 py-3.5 rounded-[24px] text-white font-black text-sm cursor-pointer transition-colors"
            >
              打烊关店 下班
            </button>
          </motion.div>
        )}

        {gameState === 'LOST' && (
          <motion.div 
            key="lost" 
            className="p-8 py-14 text-center space-y-6 bg-gradient-to-b from-[#fff1f2] to-[#ffe4e6]"
          >
            <div className="w-16 h-16 bg-rose-150 border border-rose-200 text-rose-500 rounded-full flex items-center justify-center text-3xl mx-auto animate-pulse">
              🍨
            </div>

            <div className="space-y-1 text-slate-800">
              <h4 className="text-2xl font-black text-rose-600">雪糕掉在地上啦！</h4>
              <p className="text-xs text-slate-500 font-extrabold uppercase leading-normal">
                接错球或扣除冰铲耐久归零。收拾碎雪糕，重新打点一下设备再来吧！
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto pt-4">
              <button 
                onClick={startGame}
                className="bg-rose-600 hover:bg-rose-500 border-b-4 border-rose-800 py-3 rounded-2xl text-white font-black text-xs cursor-pointer"
              >
                洗筒再战 (Retry)
              </button>
              <button 
                onClick={claimFinish}
                className="bg-slate-200 border border-slate-350 py-3 rounded-2xl text-slate-600 font-black text-xs cursor-pointer"
              >
                结束本支 (Leave)
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default IceCreamSpelling;
