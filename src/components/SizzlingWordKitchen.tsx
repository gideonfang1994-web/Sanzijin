import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { WordGroup, WordItem, UserStats } from '../types';
import { 
  X, ArrowLeft, Volume2, ShieldAlert, Sparkles, Flame, Coffee, Trophy, ChefHat
} from 'lucide-react';
import audio from '../utils/AudioUtils';
import confetti from 'canvas-confetti';
import { CHARACTERS } from '../constants';

interface SizzlingWordKitchenProps {
  groups: WordGroup[];
  stats: UserStats;
  onFinish: (score: number, coins: number) => void;
  onClose: () => void;
}

interface ConveyorPlate {
  id: string;
  letter: string;
  x: number; // 0% to 110% (moving across a belt conveyor left-to-right)
  speed: number;
  emoji: string;
  isCorrectNext: boolean;
  isHarvested: boolean;
}

interface DishResult {
  id: string;
  name: string;
  emoji: string;
}

export const SizzlingWordKitchen: React.FC<SizzlingWordKitchenProps> = ({ groups, stats, onFinish, onClose }) => {
  const allWords = useMemo(() => {
    let list: WordItem[] = [];
    groups.forEach(g => {
      g.words.forEach(w => {
        list.push(w);
      });
    });
    if (list.length === 0) {
      list = [
        { text: 'egg', translation: '鸡蛋', imageUrl: '' },
        { text: 'rice', translation: '米饭', imageUrl: '' },
        { text: 'bun', translation: '包子', imageUrl: '' },
        { text: 'beef', translation: '牛肉', imageUrl: '' },
        { text: 'tea', translation: '茶水', imageUrl: '' }
      ];
    }
    return [...list].sort(() => Math.random() - 0.5);
  }, [groups]);

  const [gameState, setGameState] = useState<'INTRO' | 'PLAYING' | 'WON' | 'LOST'>('INTRO');
  const [score, setScore] = useState(0);
  const [coinsEarned, setCoinsEarned] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  
  const [stoveFire, setStoveFire] = useState(100); // Heat retention timer (0 to 100)
  const [plates, setPlates] = useState<ConveyorPlate[]>([]);
  const [spelledText, setSpelledText] = useState<string[]>([]);
  const [targetWord, setTargetWord] = useState<WordItem | null>(null);
  const [cookedDishes, setCookedDishes] = useState<DishResult[]>([]);

  // Sizzling feedback triggers
  const [wokSparks, setWokSparks] = useState(false);

  const hero = useMemo(() => {
    return CHARACTERS.find(c => c.id === stats.selectedCharacterId) || CHARACTERS[0];
  }, [stats.selectedCharacterId]);

  const wordPointer = useRef(0);
  const loopTimer = useRef<NodeJS.Timeout | null>(null);
  const beltTimer = useRef<NodeJS.Timeout | null>(null);

  const startKitchenGame = () => {
    setGameState('PLAYING');
    setScore(0);
    setCoinsEarned(0);
    setXpEarned(0);
    setStoveFire(100);
    setSpelledText([]);
    setPlates([]);
    setCookedDishes([]);
    wordPointer.current = 0;

    audio.playPop();
    nextKitchenTask();
  };

  const nextKitchenTask = () => {
    if (allWords.length === 0) return;
    const target = allWords[wordPointer.current % allWords.length];
    wordPointer.current += 1;
    setTargetWord(target);
    setSpelledText([]);
    setPlates([]);

    // Populate initial conveyor belt ingredients
    spawnIngredientPlates(target, []);
    try { audio.speak(target.text); } catch(e){}
  };

  const spawnIngredientPlates = (target: WordItem, currentSpelled: string[]) => {
    const lettersNeeded = target.text.toLowerCase().split('');
    const targetIndex = currentSpelled.length;
    const nextRequired = lettersNeeded[targetIndex];

    const alphabets = 'abcdefghijklmnopqrstuvwxyz';
    const emojis = ['🥟', '🥠', '🍜', '🍤', '🥯', '🍗', '🍄', '🥕'];

    // Assemble dynamic list of plates
    const batchList: string[] = [];
    
    // Always include the next required spelled letter!
    if (nextRequired) {
      batchList.push(nextRequired);
    }
    
    // Add 3 random noise letters
    for (let i = 0; i < 3; i++) {
      const randChar = alphabets[Math.floor(Math.random() * alphabets.length)];
      if (!batchList.includes(randChar) && randChar !== nextRequired) {
        batchList.push(randChar);
      }
    }

    const shuffledBatch = batchList.sort(() => Math.random() - 0.5);

    setPlates(curr => {
      const activeIds = curr.map(c => c.id);
      const newItems = shuffledBatch.map((letter, idx) => {
        return {
          id: `plate-${idx}-${Date.now()}`,
          letter,
          x: -15 - (idx * 22), // staggered enters on conveyor belt left
          speed: 1.0 + Math.random() * 0.5,
          emoji: emojis[Math.floor(Math.random() * emojis.length)],
          isCorrectNext: letter === nextRequired,
          isHarvested: false
        } as ConveyorPlate;
      });

      return [...curr, ...newItems].filter(c => c.x < 115);
    });
  };

  // Cooking Engine loop
  useEffect(() => {
    if (gameState !== 'PLAYING') {
      if (loopTimer.current) clearInterval(loopTimer.current);
      if (beltTimer.current) clearInterval(beltTimer.current);
      return;
    }

    loopTimer.current = setInterval(() => {
      // 1. Stove fire decay
      setStoveFire(f => {
        const nextF = f - 0.25;
        if (nextF <= 0) {
          setGameState('LOST');
          audio.playError();
        }
        return Math.max(0, nextF);
      });

      // 2. Conveyor belt scrolling physics (Left to Right plates scrolling)
      setPlates(prev => {
        const scrolled = prev.map(p => {
          if (p.isHarvested) return p;
          return { ...p, x: p.x + p.speed };
        });

        // If the correct required letter slipped off the conveyer belt unsizzled, stove fire cools significantly
        const missedCorrect = scrolled.some(p => p.isCorrectNext && !p.isHarvested && p.x >= 105);
        if (missedCorrect) {
          audio.playError();
          setStoveFire(curr => Math.max(0, curr - 15));
        }

        return scrolled.filter(p => p.x < 110);
      });

    }, 80);

    // Continuous replenishment of conveyor letters
    beltTimer.current = setInterval(() => {
      setPlates(currPlates => {
        const onscreenActive = currPlates.filter(p => !p.isHarvested && p.x < 90);
        if (onscreenActive.length <= 2 && targetWord) {
          spawnIngredientPlates(targetWord, spelledText);
        }
        return currPlates;
      });
    }, 2500);

    return () => {
      if (loopTimer.current) clearInterval(loopTimer.current);
      if (beltTimer.current) clearInterval(beltTimer.current);
    };
  }, [gameState, spelledText, targetWord]);

  // Handle addition of plate ingredient to frying pan
  const handleTossToPan = (plateObj: ConveyorPlate) => {
    if (plateObj.isHarvested || !targetWord) return;

    // Trigger slice absorb animation
    setPlates(curr => curr.map(p => p.id === plateObj.id ? { ...p, isHarvested: true } : p));

    const wordLetters = targetWord.text.toLowerCase().split('');
    const targetIndex = spelledText.length;
    const nextRequired = wordLetters[targetIndex];

    if (plateObj.letter === nextRequired) {
      // Hot Sizzle Success! 🔥
      audio.playSuccess();
      setWokSparks(true);
      setTimeout(() => setWokSparks(false), 300);

      const nextSpelled = [...spelledText, plateObj.letter];
      setSpelledText(nextSpelled);

      setScore(s => s + 40);
      setCoinsEarned(c => c + 2);
      setXpEarned(x => x + 5);
      setStoveFire(f => Math.min(100, f + 15)); // adding wood restores boiler fuel

      // If word spell completes
      if (nextSpelled.join('') === targetWord.text.toLowerCase()) {
        try { audio.speak(targetWord.text); } catch(e){}

        const gourmetMeals = ['中华翡翠包 🥟', '龙井功夫茶 🍵', '金沙佛跳墙 🍲', '大红大虾饺 🥟', '五香北京鸭 🍗'];
        const plateDishes = [...cookedDishes, { id: `dish-${Date.now()}`, name: gourmetMeals[Math.floor(Math.random() * gourmetMeals.length)], emoji: '🍲' }];
        setCookedDishes(plateDishes);

        // Check overall win
        if (wordPointer.current >= 6 || plateDishes.length >= 5) {
          setGameState('WON');
          audio.playCheer();
          try { confetti({ particleCount: 130, spread: 70, origin: { y: 0.6 } }); } catch(e){}
        } else {
          setTimeout(() => nextKitchenTask(), 850);
        }
      } else {
        // replenishment matching plate status tags
        setTimeout(() => {
          spawnIngredientPlates(targetWord, nextSpelled);
        }, 100);
      }
    } else {
      // Spilled wrong ingredient, bad burn
      audio.playError();
      setStoveFire(f => Math.max(0, f - 20));
      setScore(s => Math.max(0, s - 10));
    }
  };

  const claimFinish = () => {
    audio.playClick();
    onFinish(score, coinsEarned);
  };

  return (
    <div className="w-full max-w-xl mx-auto rounded-[40px] border-4 border-orange-500 shadow-[0_32px_64px_-16px_rgba(249,115,22,0.15)] bg-gradient-to-b from-[#fef3c7] to-[#ffedd5] text-[#431407] overflow-hidden font-sans relative">
      <h3 className="hidden">美味中华词膳厨</h3>

      {/* Header Info */}
      <div className="bg-[#7c2d12] p-4 flex items-center justify-between border-b border-[#9a3412] text-white">
        <div className="flex items-center space-x-3">
          <button onClick={onClose} className="p-2 hover:bg-[#9a3412] rounded-xl transition-all cursor-pointer">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h4 id="kitchen-title" className="font-extrabold text-orange-100 text-sm leading-none flex items-center gap-1.5">
              <span>中华词飨厨神</span>
              <span className="text-[9px] bg-orange-500/35 text-orange-200 font-extrabold px-1.5 py-0.5 rounded">Kitchen</span>
            </h4>
            <span className="text-[10px] text-orange-200 block font-bold mt-1">点击竹林传送带滑盘，将正确英文字母甩入大铁锅拼出词膳食谱</span>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <div className="bg-[#9a3412] px-2.5 py-1 rounded-xl font-bold flex items-center space-x-1 border border-orange-700">
            <span>🪙</span>
            <span className="text-yellow-300">+{coinsEarned}</span>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {gameState === 'INTRO' && (
          <motion.div 
            key="intro" 
            className="p-8 py-16 text-center space-y-6 bg-gradient-to-b from-[#ffedd5] to-[#fed7aa]"
          >
            <div className="text-6xl animate-bounce">🥟</div>
            <div className="space-y-2">
              <h4 className="text-2xl font-black text-orange-850 tracking-tight">中华词飨大厨：火焰大铁锅</h4>
              <p className="text-xs text-orange-950 font-extrabold leading-relaxed uppercase">
                大厨先生！食评家们排起长龙！竹制传送带正输送着写有英文拼写配方的食材飞盘，查看客人的食谱配方，点击输送食材中的特定拼音字母丢入底下红润的词火大炒锅中爆炒！别放错焦炭调料哦！
              </p>
            </div>

            <div className="p-4 bg-orange-200/40 border border-orange-300 rounded-3xl max-w-sm mx-auto text-left flex items-start space-x-3">
              <ChefHat size={18} className="text-orange-600 shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] font-black text-orange-800 uppercase block mb-1">🔥 厨神温控规范</span>
                <p className="text-[11px] font-bold text-orange-950 leading-normal">
                  灶台柴火会缓慢耗损冷却，把配料准确拨入锅里能够快速保持大火。每拼成一道菜肴玩家即可获得稀有的极品食玩 Dim-sum！
                </p>
              </div>
            </div>

            <button 
              onClick={startKitchenGame}
              className="w-full max-w-xs bg-orange-600 hover:bg-orange-700 border-b-4 border-orange-800 py-3.5 rounded-[24px] text-white font-black text-sm transition-all cursor-pointer shadow-lg"
            >
              生柴开勺炉 🍲
            </button>
          </motion.div>
        )}

        {gameState === 'PLAYING' && (
          <motion.div key="playing" className="flex flex-col relative bg-[#fffaf5]">
            
            {/* Stove Fuel indicators */}
            <div className="bg-[#431407] px-4 py-2 flex items-center justify-between text-white text-xs">
              <div className="flex items-center space-x-2 flex-1 max-w-[170px]">
                <span className="font-extrabold text-orange-300 flex items-center gap-1">
                  <Flame size={12} className="text-orange-500" />
                  灶温:
                </span>
                <div className="w-full bg-[#301007] h-2.5 rounded-full overflow-hidden border border-orange-900/45 flex items-center relative">
                  <div 
                    className="bg-gradient-to-r from-orange-500 to-yellow-400 h-full rounded-full transition-all duration-300"
                    style={{ width: `${stoveFire}%` }}
                  />
                </div>
                <span className="text-[10px] font-black">{Math.floor(stoveFire)}%</span>
              </div>

              <div className="bg-[#561f10] px-2.5 py-0.5 rounded text-[10px] font-black uppercase text-orange-200">
                出菜柜台: {cookedDishes.length}/5 蒸笼
              </div>
            </div>

            {/* CONVEYER BELT BAMBOO TIER FRAME SCREEN */}
            <div className="w-full aspect-[2/1] min-h-[240px] bg-gradient-to-b from-[#fed7aa] via-[#fde8e5] to-[#fbcfe8] relative overflow-hidden px-1 border-b border-orange-200">
              
              {/* Wooden Bamboo Conveyer lines */}
              <div className="absolute top-10 left-0 right-0 h-10 bg-gradient-to-b from-[#c2410c] to-[#9a3412] border-y-2 border-orange-100 flex items-center px-4 justify-between z-10 shadow-sm pointer-events-none select-none">
                <span className="text-[9px] text-orange-100 font-black">🎋 竹韵自动食材道 (Bamboo Conveyor Belt)</span>
                <span className="text-[9px] text-yellow-300">▶️▶️▶️ SHIPPING LETTERS</span>
              </div>

              {/* Rolling plates with letters scrolling along belt */}
              {plates.map(plate => {
                if (plate.isHarvested) return null;
                return (
                  <motion.div
                    key={plate.id}
                    onClick={() => handleTossToPan(plate)}
                    style={{ left: `${plate.x}%`, top: '15px' }}
                    className="absolute cursor-pointer p-1 py-1.5 bg-white hover:bg-orange-50 border border-orange-400 rounded-full w-10 h-10 flex items-center justify-center shadow-md z-20"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <div className="flex flex-col items-center">
                      <span className="text-xs leading-none">{plate.emoji}</span>
                      <span className="font-black text-[12px] text-orange-850 uppercase leading-none mt-0.5">
                        {plate.letter}
                      </span>
                    </div>
                  </motion.div>
                );
              })}

              {/* Sizzling Frying Pot/Wok at bottom */}
              <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex flex-col items-center z-15 select-none pointer-events-none duration-100">
                
                {/* Visual heat steam rising */}
                <div className="text-lg animate-bounce leading-none mb-1 opacity-70">
                  {wokSparks ? '🔥⚡ SIZZLE! 🥟' : '☁️♨️'}
                </div>

                {/* Big Iron Wok bowl */}
                <div className={`w-32 h-14 bg-gradient-to-b from-slate-800 to-slate-950 border-2 rounded-b-[40px] rounded-t-sm relative transition-all ${
                  wokSparks ? 'border-yellow-400 scale-105' : 'border-slate-700'
                }`}>
                  {/* Fire burner under wok */}
                  <div className="absolute bottom-[-16px] left-[25px] right-[25px] h-4 bg-gradient-to-t from-orange-600 via-orange-500 to-transparent rounded-full animate-bounce" />
                  
                  {/* Soup boiling broth depth */}
                  <div className="absolute top-1 left-2.5 right-2.5 bottom-1 rounded-b-[32px] bg-amber-950/40 flex items-center justify-center text-xs">
                    <span className="font-bold text-orange-300 text-[10px] tracking-widest uppercase">
                      Chopsticks Ready
                    </span>
                  </div>
                </div>
              </div>

              {/* Kitchen chef character label */}
              <div className="absolute left-3 bottom-3 bg-white/90 px-2 py-0.5 border border-orange-200 rounded-lg text-[8px] font-black text-orange-800 pointer-events-none select-none flex items-center space-x-1 shadow-sm">
                <span>🏮 Chef:</span>
                <span>{hero.name} (火候词飨灶)</span>
              </div>
            </div>

            {/* LOWER SPELL CONTROLLER COGNITION */}
            <div className="p-5 bg-[#fff7ed] border-t border-orange-200 text-[#431407]">
              {targetWord ? (
                <div className="space-y-4 text-center">
                  
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-extrabold text-[#9a3412] block uppercase">
                      寻找菜肴食谱翻译: 「 {targetWord.translation} 」
                    </span>

                    <div className="flex items-center justify-center space-x-1.5 min-h-[44px]">
                      {targetWord.text.toLowerCase().split('').map((letter, idx) => {
                        const isSpelled = spelledText[idx] === letter;
                        return (
                          <span
                            key={idx}
                            className={`w-9 h-9 font-black flex items-center justify-center text-sm uppercase rounded-xl border shadow ${
                              isSpelled 
                                ? 'bg-gradient-to-br from-orange-400 to-amber-500 text-white border-orange-300' 
                                : 'bg-white text-orange-200 border-orange-100'
                            }`}
                          >
                            {isSpelled ? letter : '?'}
                          </span>
                        );
                      })}

                      <button 
                        onClick={() => { audio.speak(targetWord.text); }}
                        className="ml-2.5 p-1 bg-orange-500/10 hover:bg-orange-500/25 border border-orange-500/20 text-orange-700 hover:text-orange-950 rounded-lg transition-colors cursor-pointer"
                      >
                        <Volume2 size={16} />
                      </button>
                    </div>
                  </div>

                  <p className="text-[10px] font-bold text-orange-950/60 uppercase leading-none">
                    比对照单，点击传送盘中按顺序排布的字母投入大铁锅爆炒！
                  </p>
                </div>
              ) : (
                <div className="py-6 text-center text-orange-300 font-extrabold">架起材火灶头...</div>
              )}

              {/* Cooked plates rack */}
              {cookedDishes.length > 0 && (
                <div className="pt-2 border-t border-orange-200/50">
                  <span className="text-[8px] font-black text-orange-500 uppercase block mb-1">
                    灶台已装配蒸笼 (Served Dishes):
                  </span>
                  <div className="flex items-center space-x-2">
                    {cookedDishes.map(d => (
                      <span 
                        key={d.id} 
                        className="bg-orange-100/50 border border-orange-200/60 p-1 px-1.5 rounded-lg text-[9px] font-bold text-orange-900 shadow-sm"
                      >
                        {d.emoji} {d.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </motion.div>
        )}

        {gameState === 'WON' && (
          <motion.div 
            key="won" 
            className="p-8 py-14 text-center space-y-6 bg-gradient-to-b from-[#ffedd5] to-[#fed7aa]"
          >
            <div className="w-16 h-16 bg-orange-500 text-white rounded-full flex items-center justify-center text-3xl mx-auto shadow-lg animate-bounce">
              🏆
            </div>

            <div className="space-y-1">
              <h4 className="text-3xl font-black text-orange-800">特级御厨大圆满！</h4>
              <p className="text-xs text-orange-950 uppercase font-black tracking-normal leading-relaxed">
                全套黄金词膳大筵席成功奉桌！客人们无不叹服，大赏四方！
              </p>
            </div>

            <div className="bg-orange-100 border border-orange-200 rounded-3xl p-5 max-w-sm mx-auto space-y-3">
              <div className="flex items-center justify-around divide-x divide-orange-200 text-slate-800">
                <div className="text-center">
                  <span className="text-[9px] font-black text-orange-700 block mb-1 uppercase">大宴大得分</span>
                  <span className="text-xl font-black text-orange-900 tabular-nums">{score}</span>
                </div>
                <div className="text-center pl-4">
                  <span className="text-[9px] font-black text-orange-600 block mb-1 uppercase">赏赐契料币</span>
                  <span className="text-xl font-black text-orange-850 tabular-nums">+{coinsEarned}</span>
                </div>
                <div className="text-center pl-4">
                  <span className="text-[9px] font-black text-cyan-600 block mb-1 uppercase">厨道XP</span>
                  <span className="text-xl font-black text-cyan-700 tabular-nums">+{xpEarned} XP</span>
                </div>
              </div>
            </div>

            <button 
              onClick={claimFinish}
              className="w-full max-w-xs bg-orange-600 hover:bg-orange-500 border-b-4 border-orange-800 py-3.5 rounded-[24px] text-white font-black text-sm cursor-pointer transition-colors"
            >
              收拾锅碗瓢盆 收工
            </button>
          </motion.div>
        )}

        {gameState === 'LOST' && (
          <motion.div 
            key="lost" 
            className="p-8 py-14 text-center space-y-6 bg-gradient-to-b from-[#ffedd5] to-[#fed7aa]"
          >
            <div className="w-16 h-16 bg-rose-150 border border-rose-200 text-rose-500 rounded-full flex items-center justify-center text-3xl mx-auto animate-pulse">
              💀
            </div>

            <div className="space-y-1 text-slate-800">
              <h4 className="text-2xl font-black text-rose-600">柴火耗竭！灶温冰冻</h4>
              <p className="text-xs text-slate-500 font-extrabold uppercase leading-normal">
                大铁锅温度归零或未及时捞取正确拼料。重振声威，注意控制好大火火候吧！
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto pt-4">
              <button 
                onClick={startKitchenGame}
                className="bg-orange-600 hover:bg-orange-500 border-b-4 border-orange-800 py-3 rounded-2xl text-white font-black text-xs cursor-pointer"
              >
                点火再战 (Retry)
              </button>
              <button 
                onClick={claimFinish}
                className="bg-slate-200 border border-slate-350 py-3 rounded-2xl text-slate-600 font-black text-xs cursor-pointer"
              >
                结束本餐 (Leave)
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SizzlingWordKitchen;
