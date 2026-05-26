import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { WordGroup, WordItem, UserStats } from '../types';
import { 
  X, ArrowLeft, RotateCcw, Volume2, ShieldAlert, Sparkles, AlertTriangle, Play
} from 'lucide-react';
import audio from '../utils/AudioUtils';
import confetti from 'canvas-confetti';
import { CHARACTERS } from '../constants';

interface PolarWordFishingProps {
  groups: WordGroup[];
  stats: UserStats;
  onFinish: (score: number, coins: number) => void;
  onClose: () => void;
}

interface Fish {
  id: string;
  translation: string;
  isCorrect: boolean;
  x: number; // 0 to 100
  y: number; // 25 (shallow) to 75 (deep)
  speed: number;
  direction: 'left' | 'right';
  emoji: string;
  isCaught?: boolean;
}

interface Bubble {
  id: string;
  x: number;
  y: number;
  size: number;
  speed: number;
}

export const PolarWordFishing: React.FC<PolarWordFishingProps> = ({ groups, stats, onFinish, onClose }) => {
  const allWords = useMemo(() => {
    let list: WordItem[] = [];
    groups.forEach(g => {
      g.words.forEach(w => {
        list.push(w);
      });
    });
    if (list.length === 0) {
      list = [
        { text: 'fish', translation: '鱼', imageUrl: '' },
        { text: 'ice', translation: '冰', imageUrl: '' },
        { text: 'ocean', translation: '海洋', imageUrl: '' },
        { text: 'water', translation: '水', imageUrl: '' }
      ];
    }
    return [...list].sort(() => Math.random() - 0.5);
  }, [groups]);

  const [gameState, setGameState] = useState<'INTRO' | 'PLAYING' | 'WON' | 'LOST'>('INTRO');
  const [score, setScore] = useState(0);
  const [coinsEarned, setCoinsEarned] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  const [oxygen, setOxygen] = useState(100); // 0 to 100 representing life/time
  
  const [fishList, setFishList] = useState<Fish[]>([]);
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [targetWord, setTargetWord] = useState<WordItem | null>(null);

  // Fishing line state
  const [lineState, setLineState] = useState<'IDLE' | 'CASTING' | 'REELING'>('IDLE');
  const [hookX, setHookX] = useState(50); // horizontal position 10% to 90%
  const [hookDepth, setHookDepth] = useState(15); // vertical position: 15% to 75%
  const [caughtFishId, setCaughtFishId] = useState<string | null>(null);

  const hero = useMemo(() => {
    return CHARACTERS.find(c => c.id === stats.selectedCharacterId) || CHARACTERS[0];
  }, [stats.selectedCharacterId]);

  const wordIdx = useRef(0);
  const loopTimer = useRef<NodeJS.Timeout | null>(null);

  // Setup Ice game
  const startFishing = () => {
    setGameState('PLAYING');
    setScore(0);
    setCoinsEarned(0);
    setXpEarned(0);
    setOxygen(100);
    setFishList([]);
    setCaughtFishId(null);
    setLineState('IDLE');
    setHookDepth(15);
    wordIdx.current = 0;
    
    // Generate bubbles
    const initialBubbles: Bubble[] = [];
    for (let i = 0; i < 15; i++) {
      initialBubbles.push({
        id: `b-${i}-${Date.now()}`,
        x: Math.random() * 95,
        y: Math.random() * 80 + 20,
        size: Math.random() * 4 + 2,
        speed: Math.random() * 1.5 + 0.5
      });
    }
    setBubbles(initialBubbles);

    audio.playPop();
    nextFishingTask();
  };

  const nextFishingTask = () => {
    if (allWords.length === 0) return;
    const target = allWords[wordIdx.current % allWords.length];
    wordIdx.current += 1;
    setTargetWord(target);

    // Spawn new batch of fish
    const wrongTranslations = allWords
      .filter(w => w.text !== target.text)
      .map(w => w.translation);
    const shuffledWrong = [...wrongTranslations].sort(() => Math.random() - 0.5).slice(0, 3);
    
    const elements = [
      { text: target.translation, isCorrect: true, emoji: '🐠' },
      ...shuffledWrong.map(t => ({ text: t, isCorrect: false, emoji: Math.random() > 0.6 ? '🐡' : '🐟' }))
    ];

    // Ensure 4 items
    while (elements.length < 4) {
      elements.push({ text: '金币冰钻' + Math.floor(Math.random() * 10), isCorrect: false, emoji: '🐙' });
    }

    const fishes = elements.map((elem, i) => {
      const dir = Math.random() > 0.5 ? 'left' : 'right';
      return {
        id: `fish-${i}-${Date.now()}`,
        translation: elem.text,
        isCorrect: elem.isCorrect,
        x: dir === 'left' ? 100 : -10,
        y: 25 + i * 15 + Math.random() * 5,
        speed: 0.6 + Math.random() * 0.7,
        direction: dir,
        emoji: elem.emoji
      } as Fish;
    });

    setFishList(fishes);
    setLineState('IDLE');
    setHookDepth(15);
    setCaughtFishId(null);

    try { audio.speak(target.text); } catch(e){}
  };

  useEffect(() => {
    if (gameState !== 'PLAYING') {
      if (loopTimer.current) clearInterval(loopTimer.current);
      return;
    }

    loopTimer.current = setInterval(() => {
      // 1. Oxygen depletion representing timer
      setOxygen(ox => {
        const nextOx = ox - 0.25;
        if (nextOx <= 0) {
          setGameState('LOST');
          audio.playError();
        }
        return Math.max(0, nextOx);
      });

      // 2. Swim Fish
      setFishList(prev => {
        return prev.map(f => {
          if (f.id === caughtFishId) return f; // Caught fish doesn't swim freely
          
          let nextX = f.direction === 'right' ? f.x + f.speed : f.x - f.speed;
          let nextDirection = f.direction;
          
          if (nextX > 110) {
            nextX = 110;
            nextDirection = 'left';
          } else if (nextX < -20) {
            nextX = -20;
            nextDirection = 'right';
          }

          return { ...f, x: nextX, direction: nextDirection };
        });
      });

      // 3. Float Bubbles
      setBubbles(prev => prev.map(b => {
        let nextY = b.y - b.speed;
        if (nextY < 15) {
          nextY = 95;
        }
        return { ...b, y: nextY };
      }));

      // 4. Update Hook Physics
      setLineState(st => {
        if (st === 'CASTING') {
          setHookDepth(currentDepth => {
            const nextDepth = currentDepth + 3;
            
            // Check collision with any swimming fish
            let didColl = false;
            setFishList(currentFishes => {
              const collidedFish = currentFishes.find(f => 
                Math.abs(f.y - nextDepth) < 5 && Math.abs(f.x - hookX) < 7
              );

              if (collidedFish) {
                didColl = true;
                setCaughtFishId(collidedFish.id);
                audio.playPop();
              }
              return currentFishes;
            });

            if (didColl) {
              setLineState('REELING');
              return nextDepth;
            }

            if (nextDepth >= 80) {
              setLineState('REELING'); // reached maximum depth, reel in empty hook
              return 80;
            }
            return nextDepth;
          });
        } else if (st === 'REELING') {
          setHookDepth(currentDepth => {
            const nextDepth = currentDepth - 3.5;
            
            // Bring caught fish up synchronously
            if (caughtFishId) {
              setFishList(prev => prev.map(f => f.id === caughtFishId ? { ...f, y: nextDepth } : f));
            }

            if (nextDepth <= 15) {
              // Reached water surface! Resolve outcome
              setLineState('IDLE');
              setHookX(50); // Center hook
              
              if (caughtFishId) {
                resolveCatch();
              }
              return 15;
            }
            return nextDepth;
          });
        }
        return st;
      });

    }, 80);

    return () => {
      if (loopTimer.current) clearInterval(loopTimer.current);
    };
  }, [gameState, caughtFishId, hookX]);

  const resolveCatch = () => {
    const catchObj = fishList.find(f => f.id === caughtFishId);
    if (!catchObj) return;

    if (catchObj.isCorrect) {
      audio.playSuccess();

      setScore(s => s + 50);
      setCoinsEarned(c => c + 4);
      setXpEarned(x => x + 8);
      setOxygen(ox => Math.min(100, ox + 15)); // oxygen award

      // Check win parameters
      if (wordIdx.current >= 8) {
        setGameState('WON');
        audio.playCheer();
        try {
          confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
        } catch(e){}
      } else {
        nextFishingTask();
      }
    } else {
      audio.playError();
      setOxygen(ox => Math.max(0, ox - 20)); // big decay loss
      setScore(s => Math.max(0, s - 10));
      nextFishingTask();
    }
  };

  const castFishingHook = (touchX: number) => {
    if (lineState !== 'IDLE') return;
    audio.playClick();
    setHookX(touchX);
    setLineState('CASTING');
  };

  const finishGameAndClaim = () => {
    audio.playClick();
    onFinish(score, coinsEarned);
  };

  return (
    <div className="w-full max-w-xl mx-auto rounded-[40px] border-4 border-sky-400 shadow-[0_32px_64px_-16px_rgba(14,165,233,0.15)] bg-gradient-to-b from-[#e0f2fe] to-[#bae6fd] text-[#0f172a] overflow-hidden font-sans relative">
      <h3 className="hidden">极地冰上钓词翁</h3>
      
      {/* Top Header */}
      <div className="bg-[#0369a1] p-4 flex items-center justify-between border-b border-[#0284c7] text-white">
        <div className="flex items-center space-x-3">
          <button onClick={onClose} className="p-2 hover:bg-sky-800 rounded-xl transition-all cursor-pointer">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h4 className="font-extrabold text-[#e0f2fe] text-sm leading-none flex items-center gap-1.5">
              <span>冰川钓词翁</span>
              <span className="text-[9px] bg-sky-400/30 text-sky-200 font-extrabold px-1.5 py-0.5 rounded">Ice Fishing</span>
            </h4>
            <span className="text-[10px] text-sky-200 block font-bold mt-1">控制鱼竿吊钩，钓上正确翻译的游鱼</span>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <div className="bg-[#0284c7] px-2.5 py-1 rounded-xl font-bold flex items-center space-x-1">
            <span>🪙</span>
            <span className="text-amber-300">+{coinsEarned}</span>
          </div>
          <button onClick={onClose} className="p-1.5 bg-rose-500/10 hover:bg-rose-500/25 rounded-lg text-rose-300 transition-colors">
            <X size={15} />
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {gameState === 'INTRO' && (
          <motion.div 
            key="intro" 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="p-8 py-16 text-center space-y-6 bg-gradient-to-b from-[#bae6fd] to-[#7dd3fc]"
          >
            <div className="text-6xl animate-bounce">🎣</div>
            <div className="space-y-2">
              <h4 className="text-2xl font-black text-[#0369a1] tracking-tight">极地钓词翁：冰窟垂钓</h4>
              <p className="text-xs text-sky-900 font-extrabold leading-relaxed uppercase">
                高纬度坚冰之下游荡着魔法词灵之鱼！观察冰面上的单词，点击水底不同方向游动的汉字释义鱼即可下钩捞取！注意补充空气氧气，别钓错食人鱼哦！
              </p>
            </div>

            <div className="p-4 bg-sky-200/40 border border-sky-300 rounded-2xl text-left text-xs max-w-sm mx-auto space-y-1">
              <span className="font-black text-[#0369a1] uppercase block mb-1">🎣 垂钓纲领</span>
              <p className="font-bold text-sky-950 leading-relaxed">
                冰床上的企鹅戴夫会播报需要寻找的英文词。湖中汉字小鱼不断穿行。在合适的水平方向点击一次即可甩线，深度满足后自动回拉。
              </p>
            </div>

            <button 
              onClick={startFishing}
              className="w-full max-w-xs bg-sky-500 hover:bg-sky-600 border-b-4 border-sky-700 py-3.5 rounded-[24px] text-white font-black text-sm transition-all cursor-pointer shadow-md"
            >
              破冰铸钩 🧊
            </button>
          </motion.div>
        )}

        {gameState === 'PLAYING' && (
          <motion.div key="playing" className="flex flex-col relative bg-sky-100">
            
            {/* HUD Life Meter */}
            <div className="bg-[#0c4a6e]/90 px-4 py-2 flex items-center justify-between text-white text-xs">
              <div className="flex items-center space-x-2 flex-1 max-w-[180px]">
                <span className="font-black text-sky-200">冰下氧气:</span>
                <div className="w-full bg-slate-900/60 h-2.5 rounded-full overflow-hidden border border-slate-800 flex items-center relative">
                  <div 
                    className="bg-sky-400 h-full rounded-full transition-all duration-150"
                    style={{ width: `${oxygen}%` }}
                  />
                </div>
                <span className="text-[10px] font-black">{Math.floor(oxygen)}%</span>
              </div>

              <div className="bg-sky-900/50 px-2.5 py-1 rounded-full border border-sky-700/60 text-[10px] font-black">
                渔获物进度 (Fish): {wordIdx.current - 1}/7
              </div>
            </div>

            {/* FISHING WATER BODY AREA */}
            <div 
              className="w-full aspect-[1.8/1] min-h-[250px] bg-gradient-to-b from-[#38bdf8] via-[#0284c7] to-[#0c4a6e] relative overflow-hidden cursor-crosshair pb-2 pt-1 px-1 border-b border-sky-900"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const clickXPercent = ((e.clientX - rect.left) / rect.width) * 100;
                castFishingHook(clickXPercent);
              }}
            >
              {/* Frozen Ice Cover Platform on Top */}
              <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-white/95 to-sky-100/30 border-b border-white flex items-end px-4 py-1 select-none pointer-events-none text-[10px] font-black text-sky-700/80">
                <span>🧊 极地浮冰面 (Ice Surface)</span>
              </div>

              {/* Float Bubbles */}
              {bubbles.map(b => (
                <div 
                  key={b.id}
                  className="absolute bg-white/30 rounded-full border border-white/10 shrink-0 pointer-events-none"
                  style={{ 
                    left: `${b.x}%`, 
                    top: `${b.y}%`, 
                    width: `${b.size}px`, 
                    height: `${b.size}px` 
                  }}
                />
              ))}

              {/* Render Hook and Lines */}
              <div 
                className="absolute top-8 pointer-events-none select-none z-10"
                style={{ left: `${hookX}%` }}
              >
                {/* Elastic Nylon Line */}
                <div 
                  className="w-0.5 bg-sky-200/90 h-full border-r border-[#0f172a]/20"
                  style={{ height: `${hookDepth}px` }}
                />
                
                {/* Iron hook */}
                <div 
                  className="text-lg -ml-2 -mt-1 block scale-x-[-1] duration-75 relative z-10 animate-pulse"
                  style={{ transform: `translateY(${hookDepth - 10}px)` }}
                >
                  🪝
                </div>
              </div>

              {/* Water Layer Swim Fish */}
              {fishList.map(f => (
                <div
                  key={f.id}
                  style={{ 
                    left: `${f.x}%`, 
                    top: `${f.y}%` 
                  }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 flex items-center bg-slate-950/40 hover:bg-slate-950/60 transition-colors border border-sky-400/40 p-1 rounded-xl text-white select-none whitespace-nowrap z-20 shadow cursor-pointer text-[10px] font-black"
                >
                  <span className={`text-sm ${f.direction === 'left' ? 'scale-x-[-1]' : ''} mr-1.5 inline-block shrink-0`}>
                    {f.emoji}
                  </span>
                  <span className="pr-1">{f.translation}</span>
                </div>
              ))}

              {/* Fisherman info corner */}
              <div className="absolute left-2.5 top-10 bg-white/90 p-1.5 rounded-xl text-[9px] font-black text-sky-800 border border-sky-200 leading-none select-none pointer-events-none shadow-sm flex items-center space-x-1">
                <span>💂</span>
                <span>{hero.name} (极寒抛击)</span>
              </div>
            </div>

            {/* LOWER SPELL CONTROLLER - QUESTION PROMPT */}
            <div className="p-6 bg-white space-y-4 border-t border-sky-200">
              {targetWord ? (
                <div className="space-y-3.5 text-center">
                  <div className="inline-flex items-center space-x-1 border border-sky-200 bg-sky-50 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider text-sky-600 leading-none shrink-0">
                    <span>❄️ 破冰探钻</span>
                  </div>
                  
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 block tracking-wider uppercase">英语词元</span>
                    <div className="flex items-center justify-center space-x-1.5">
                      <h4 className="text-3xl font-black text-[#0369a1] tracking-tight">{targetWord.text}</h4>
                      <button 
                        onClick={() => { audio.speak(targetWord.text); }}
                        className="p-1 text-sky-500 hover:text-sky-700 hover:bg-sky-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <Volume2 size={16} />
                      </button>
                    </div>
                  </div>

                  <p className="text-[10px] font-bold text-slate-400 uppercase leading-none">
                    点击下方水流中穿行的汉字鱼类。在吊钩正下方游过时下钓！
                  </p>
                </div>
              ) : (
                <div className="text-center py-6 text-slate-300 font-bold uppercase text-xs">正在连通冰核奥术...</div>
              )}
            </div>

          </motion.div>
        )}

        {gameState === 'WON' && (
          <motion.div 
            key="won" 
            className="p-8 py-14 text-center space-y-6 bg-gradient-to-b from-[#e0f2fe] to-[#bae6fd]"
          >
            <div className="w-16 h-16 bg-sky-500 text-white rounded-full flex items-center justify-center text-3xl mx-auto shadow-lg animate-bounce">
              🐟
            </div>
            
            <div className="space-y-1">
              <h4 className="text-3xl font-black text-[#0369a1]">爱斯基摩大渔翁！</h4>
              <p className="text-xs text-sky-800 uppercase font-black tracking-wider">
                完美的防线渔获！你用钓钩彻底驯服了冰下词灵小鱼！
              </p>
            </div>

            {/* Rewards Card */}
            <div className="bg-sky-100 border border-sky-200 rounded-3xl p-5 max-w-sm mx-auto space-y-3">
              <div className="flex items-center justify-around divide-x divide-sky-200">
                <div className="text-center">
                  <span className="text-[9px] font-black text-slate-400 uppercase block mb-1">星晨分数</span>
                  <span className="text-xl font-black text-sky-900 tabular-nums">{score}</span>
                </div>
                <div className="text-center pl-4">
                  <span className="text-[9px] font-black text-amber-500 uppercase block mb-1">极地契约币</span>
                  <span className="text-xl font-black text-amber-600 tabular-nums">+{coinsEarned}</span>
                </div>
                <div className="text-center pl-4">
                  <span className="text-[9px] font-black text-cyan-500 uppercase block mb-1">词律经验</span>
                  <span className="text-xl font-black text-cyan-600 tabular-nums">+{xpEarned}</span>
                </div>
              </div>
            </div>

            <button 
              onClick={finishGameAndClaim}
              className="w-full max-w-xs bg-sky-500 hover:bg-sky-600 border-b-4 border-sky-700 py-3.5 rounded-[24px] text-white font-black text-sm cursor-pointer transition-colors"
            >
              满载而归，收取渔获
            </button>
          </motion.div>
        )}

        {gameState === 'LOST' && (
          <motion.div 
            key="lost" 
            className="p-8 py-14 text-center space-y-6 bg-gradient-to-b from-[#e0f2fe] to-[#bae6fd]"
          >
            <div className="w-16 h-16 bg-rose-100 border border-rose-200 text-rose-500 rounded-full flex items-center justify-center text-3xl mx-auto animate-pulse">
              🐙
            </div>

            <div className="space-y-1">
              <h4 className="text-2xl font-black text-rose-600">冰湖缺氧！坚冰合拢！</h4>
              <p className="text-xs text-slate-500 font-extrabold uppercase leading-relaxed text-slate-600">
                氧气耗尽或钓到食人魔兽！不要气馁，观察游鱼穿行方向再次冰钓吧！
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto pt-4">
              <button 
                onClick={startFishing}
                className="bg-sky-500 hover:bg-sky-600 border-b-4 border-sky-700 py-3 rounded-2xl text-white font-black text-xs cursor-pointer"
              >
                重新上鱼钩 (Retry)
              </button>
              <button 
                onClick={finishGameAndClaim}
                className="bg-slate-250 hover:bg-slate-300 border border-slate-300 py-3 rounded-2xl text-slate-600 font-black text-xs cursor-pointer"
              >
                结束本局 (Leave)
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PolarWordFishing;
