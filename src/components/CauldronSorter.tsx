import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { WordGroup, WordItem, UserStats } from '../types';
import { 
  X, ArrowLeft, RotateCcw, Volume2, ShieldAlert, Sparkles, AlertTriangle, ShieldCheck
} from 'lucide-react';
import audio from '../utils/AudioUtils';
import confetti from 'canvas-confetti';
import { CHARACTERS } from '../constants';

interface CauldronSorterProps {
  groups: WordGroup[];
  stats: UserStats;
  onFinish: (score: number, coins: number) => void;
  onClose: () => void;
}

interface FallingGem {
  id: string;
  word: WordItem;
  x: number; // 15% to 85%
  y: number; // 10% to 90%
  speed: number;
  size: number;
  color: string;
}

interface Cauldron {
  id: string;
  index: number;
  translation: string;
  color: string;
  smokeColor: string;
  emoji: string;
}

interface PotionLiquid {
  id: string;
  name: string;
  emoji: string;
  rarity: 'COMMON' | 'EPIC' | 'LEGENDARY';
}

export const CauldronSorter: React.FC<CauldronSorterProps> = ({ groups, stats, onFinish, onClose }) => {
  const allWords = useMemo(() => {
    let list: WordItem[] = [];
    groups.forEach(g => {
      g.words.forEach(w => {
        list.push(w);
      });
    });
    if (list.length === 0) {
      list = [
        { text: 'fire', translation: '火', imageUrl: '' },
        { text: 'gold', translation: '黄金', imageUrl: '' },
        { text: 'stone', translation: '石头', imageUrl: '' },
        { text: 'magic', translation: '魔法', imageUrl: '' }
      ];
    }
    return [...list].sort(() => Math.random() - 0.5);
  }, [groups]);

  const [gameState, setGameState] = useState<'INTRO' | 'PLAYING' | 'WON' | 'LOST'>('INTRO');
  const [score, setScore] = useState(0);
  const [coinsEarned, setCoinsEarned] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  const [labIntegrity, setLabIntegrity] = useState(100); // Life points (0 to 100)
  
  const [fallingGems, setFallingGems] = useState<FallingGem[]>([]);
  const [cauldrons, setCauldrons] = useState<Cauldron[]>([]);
  const [brewedPotions, setBrewedPotions] = useState<PotionLiquid[]>([]);
  
  // Track currently active highlighted target gem
  const [activeGem, setActiveGem] = useState<FallingGem | null>(null);

  const hero = useMemo(() => {
    return CHARACTERS.find(c => c.id === stats.selectedCharacterId) || CHARACTERS[0];
  }, [stats.selectedCharacterId]);

  const loopTimer = useRef<NodeJS.Timeout | null>(null);
  const spawnTimer = useRef<NodeJS.Timeout | null>(null);
  const wordPointer = useRef(0);

  const startAlchemyJob = () => {
    setGameState('PLAYING');
    setScore(0);
    setCoinsEarned(0);
    setXpEarned(0);
    setLabIntegrity(100);
    setFallingGems([]);
    setBrewedPotions([]);
    setActiveGem(null);
    wordPointer.current = 0;

    // Build the 3 cauldrons representing options
    setUpCauldrons();
    audio.playPop();
  };

  const setUpCauldrons = () => {
    if (allWords.length === 0) return;
    
    // Choose 3 translations from current batch
    const currentBatch = allWords.slice(wordPointer.current, wordPointer.current + 3);
    if (currentBatch.length < 3) {
      wordPointer.current = 0;
    }
    
    const colors = ['border-purple-500 bg-purple-950/60', 'border-emerald-500 bg-emerald-950/60', 'border-amber-500 bg-amber-950/60'];
    const smokeColors = ['text-purple-400', 'text-emerald-400', 'text-amber-400'];
    const emojis = ['🔮', '🧪', '⚗️'];

    const newCauldrons = [0, 1, 2].map(idx => {
      const w = allWords[(wordPointer.current + idx) % allWords.length];
      return {
        id: `cauldron-${idx}-${Date.now()}`,
        index: idx,
        translation: w ? w.translation : '混沌魔法',
        color: colors[idx],
        smokeColor: smokeColors[idx],
        emoji: emojis[idx]
      } as Cauldron;
    });

    setCauldrons(newCauldrons);
    wordPointer.current += 3;
    
    // Spawn initial gem
    spawnCrystalGem(newCauldrons);
  };

  const spawnCrystalGem = (activeCauldrons: Cauldron[]) => {
    if (activeCauldrons.length === 0) return;
    
    // Pick one cauldron to be correct
    const pivot = activeCauldrons[Math.floor(Math.random() * activeCauldrons.length)];
    // Find matching word
    const matchWordItem = allWords.find(w => w.translation === pivot.translation);
    if (!matchWordItem) return;

    const gemColorList = [
      'from-purple-400 to-indigo-600 shadow-[0_4px_12px_rgba(99,102,241,0.5)]',
      'from-emerald-400 to-cyan-500 shadow-[0_4px_12px_rgba(16,185,129,0.5)]',
      'from-amber-400 to-pink-500 shadow-[0_4px_12px_rgba(245,158,11,0.5)]'
    ];

    const newGem: FallingGem = {
      id: `gem-${Date.now()}`,
      word: matchWordItem,
      x: 20 + Math.random() * 60,
      y: 10,
      speed: 1.2 + Math.random() * 0.5,
      size: 44,
      color: gemColorList[Math.floor(Math.random() * gemColorList.length)]
    };

    setFallingGems(prev => [...prev, newGem]);
    setActiveGem(newGem);
    try { audio.speak(matchWordItem.text); } catch(e){}
  };

  useEffect(() => {
    if (gameState !== 'PLAYING') {
      if (loopTimer.current) clearInterval(loopTimer.current);
      if (spawnTimer.current) clearInterval(spawnTimer.current);
      return;
    }

    // Engine loop
    loopTimer.current = setInterval(() => {
      setFallingGems(prev => {
        const fall = prev.map(g => ({ ...g, y: g.y + g.speed }));
        
        // If target gem touches bottom ground (y >= 75) without sorting, damage laboratory!
        const exploded = fall.filter(g => g.y >= 75);
        if (exploded.length > 0) {
          audio.playError();
          setLabIntegrity(curr => {
            const next = Math.max(0, curr - 25);
            if (next <= 0) {
              setGameState('LOST');
            }
            return next;
          });
          setActiveGem(null);
        }

        return fall.filter(g => g.y < 75);
      });
    }, 90);

    // Keep spawning new word crystals regularly
    spawnTimer.current = setInterval(() => {
      setFallingGems(currGems => {
        if (currGems.length === 0) {
          setUpCauldrons();
        }
        return currGems;
      });
    }, 2800);

    return () => {
      if (loopTimer.current) clearInterval(loopTimer.current);
      if (spawnTimer.current) clearInterval(spawnTimer.current);
    };
  }, [gameState, cauldrons]);

  // Click sorting action
  const handleSortChoice = (cauldronObj: Cauldron) => {
    if (!activeGem) return;

    if (activeGem.word.translation === cauldronObj.translation) {
      // High match! Success
      audio.playSuccess();
      try { audio.speak(activeGem.word.text); } catch(e){}

      setScore(s => s + 40);
      setCoinsEarned(c => c + 3);
      setXpEarned(x => x + 6);
      
      const potions = ['力量药剂 🍷', '隐身圣水 🌀', '圣翼神露 🧪', '超晶药剂 🔮', '词律仙药 🍶'];
      const pickedPotion = potions[Math.floor(Math.random() * potions.length)];
      setBrewedPotions(prev => [
        { id: `p-${Date.now()}`, name: pickedPotion, emoji: '🧪', rarity: Math.random() > 0.85 ? 'LEGENDARY' : 'COMMON' },
        ...prev
      ].slice(0, 4));

      // Destroy active gem safely
      setFallingGems([]);
      setActiveGem(null);

      // Check win parameters
      if (score >= 400 || brewedPotions.length >= 6) {
        setGameState('WON');
        audio.playCheer();
        try {
          confetti({ particleCount: 100, spread: 60, origin: { y: 0.6 } });
        } catch(e){}
      } else {
        // Quickly set up next task
        setTimeout(() => {
          setUpCauldrons();
        }, 500);
      }
    } else {
      // Wrong cauldron! Damage
      audio.playError();
      setLabIntegrity(curr => {
        const next = Math.max(0, curr - 20);
        if (next <= 0) {
          setGameState('LOST');
        }
        return next;
      });
      setScore(s => Math.max(0, s - 10));
    }
  };

  const finishAlchemyClaim = () => {
    audio.playClick();
    onFinish(score, coinsEarned);
  };

  return (
    <div className="w-full max-w-xl mx-auto rounded-[40px] border-4 border-purple-500 shadow-[0_32px_64px_-16px_rgba(168,85,247,0.2)] bg-[#0c0a0f] text-white overflow-hidden font-sans relative">
      <h3 className="hidden">巫术炼金：词晶大分类</h3>

      {/* Header bar */}
      <div className="bg-[#1e152a] p-4 flex items-center justify-between border-b border-[#3b2a54]">
        <div className="flex items-center space-x-3">
          <button onClick={onClose} className="p-2 hover:bg-[#322345] rounded-xl text-purple-300 hover:text-white transition-all cursor-pointer">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h4 className="font-extrabold text-purple-300 text-sm leading-none flex items-center gap-1.5">
              <span>阿瓦隆炼金研究所</span>
              <span className="text-[9px] bg-purple-500/30 text-purple-200 font-extrabold px-1.5 py-0.5 rounded">Alchemist Lab</span>
            </h4>
            <span className="text-[10px] text-purple-400 block font-bold mt-1">融合空中下落的词组，将其分类入对应的大魔埚</span>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <div className="bg-[#2a1d3b] px-2.5 py-1 rounded-xl font-bold flex items-center space-x-1 border border-[#3b2a54]">
            <span className="text-yellow-400">🪙</span>
            <span className="text-yellow-200">+{coinsEarned}</span>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {gameState === 'INTRO' && (
          <motion.div 
            key="intro" 
            className="p-8 py-16 text-center space-y-6 bg-gradient-to-b from-[#0f0917] to-[#1a1028]"
          >
            <div className="text-6xl animate-pulse">⚗️</div>
            <div className="space-y-2">
              <h4 className="text-2xl font-black text-purple-400 tracking-tight">阿瓦隆拼读炼金：魔液萃取</h4>
              <p className="text-xs text-purple-300 font-bold leading-relaxed uppercase">
                天空裂隙下落珍贵的「能量词晶石」。将对应的汉字释义大魔埚点燃！正确熔融可提炼极其稀有的古代黄金经验魔液！失败则会导致实验室护盾过载损毁哦！
              </p>
            </div>

            <div className="p-4 bg-purple-950/20 border border-purple-900/40 rounded-3xl max-w-sm mx-auto text-left flex items-start space-x-3">
              <ShieldAlert size={18} className="text-purple-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] font-black text-purple-300 uppercase block mb-1">🧪 炼金条例 (LAB RULE)</span>
                <p className="text-[11px] font-bold text-slate-400 leading-normal">
                  水晶石在半空浮现。仔细查阅其拼写，在它坠地前，点击最合乎翻译的大魔埚按键进行充能。
                </p>
              </div>
            </div>

            <button 
              onClick={startAlchemyJob}
              className="w-full max-w-xs bg-gradient-to-r from-purple-500 to-pink-500 hover:brightness-110 border-b-4 border-purple-700 py-3.5 rounded-[24px] text-white font-black text-sm transition-all cursor-pointer shadow-lg"
            >
              启动魔法坩埚炉 🔥
            </button>
          </motion.div>
        )}

        {gameState === 'PLAYING' && (
          <motion.div key="playing" className="flex flex-col relative bg-[#09060c]">
            
            {/* HUD */}
            <div className="bg-[#140f1a] px-4 py-2 flex items-center justify-between text-xs border-b border-purple-900/30">
              <div className="flex items-center space-x-2.5 flex-1 max-w-[170px]">
                <span className="font-extrabold text-purple-300">防爆盾:</span>
                <div className="w-full bg-[#1b1524] h-2.5 rounded-full overflow-hidden border border-[#2d213b] flex items-center relative">
                  <div 
                    className="bg-purple-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${labIntegrity}%` }}
                  />
                </div>
                <span className="text-[10px] font-black tabular-nums">{labIntegrity}%</span>
              </div>

              <div className="bg-[#1c1527] px-2.5 py-1 rounded-full text-[10px] font-black text-purple-300 border border-purple-900/40">
                提炼量进度 (🧪): {brewedPotions.length}/6 瓶
              </div>
            </div>

            {/* ALCHEMY CRUCIBLE FIELD SCREEN */}
            <div className="w-full aspect-[2/1] min-h-[240px] bg-[#07040a] relative overflow-hidden px-1 border-b border-[#22182f]">
              
              {/* Mystic falling gemstones */}
              {fallingGems.map(g => (
                <motion.div
                  key={g.id}
                  style={{ left: `${g.x}%`, top: `${g.y}%` }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 z-20"
                >
                  <div className={`p-3 bg-gradient-to-r ${g.color} rounded-2xl flex items-center space-x-1 border border-white/20 select-none animate-pulse`}>
                    <span className="text-sm">💎</span>
                    <span className="font-black text-white text-xs drop-shadow-[0_1.5px_4px_rgba(0,0,0,0.8)] uppercase">
                      {g.word.text}
                    </span>
                  </div>
                </motion.div>
              ))}

              {/* Boiling Cauldrons array at bottom */}
              <div className="absolute bottom-2 left-0 right-0 px-4 flex justify-around items-end z-10 select-none pointer-events-none">
                {cauldrons.map((caul) => (
                  <div key={caul.id} className="flex flex-col items-center max-w-[100px] text-center">
                    {/* Steam bubble */}
                    <div className="text-xl animate-bounce mb-1">
                      {caul.emoji}
                    </div>
                    {/* Cauldron cup */}
                    <div className="w-14 h-11 bg-slate-900 border border-purple-800 rounded-b-2xl rounded-t-lg relative shadow-inner">
                      {/* Boiling broth level */}
                      <div className="absolute bottom-1.5 left-1.5 right-1.5 top-3.5 bg-gradient-to-t from-purple-800 to-indigo-500 rounded-b-xl animate-pulse" />
                      <div className="absolute top-1 left-1.5 right-1.5 h-1 bg-white/20 rounded-full" />
                    </div>
                    <span className="bg-slate-950/90 text-[8.5px] border border-purple-900/40 p-1 rounded-lg text-purple-300 font-extrabold truncate w-[80px] mt-1.5">
                      {caul.translation}
                    </span>
                  </div>
                ))}
              </div>

              {/* Alchemy assistant label */}
              <div className="absolute left-3 top-3 bg-slate-900/80 px-2 py-1 rounded-xl text-[9px] font-black border border-purple-900/40 text-purple-400 flex items-center space-x-1 select-none pointer-events-none">
                <span>🪄</span>
                <span>{hero.name} 魔法坩埚组</span>
              </div>
            </div>

            {/* LOWER COGNITIVE CHOOSE INTERACTION AREA */}
            <div className="p-6 bg-[#110c18] space-y-4 border-t border-[#2d213b]">
              {activeGem ? (
                <div className="space-y-4">
                  <div className="text-center">
                    <span className="bg-purple-500/10 border border-purple-500/30 px-3 py-0.5 text-purple-400 font-extrabold text-[9px] uppercase tracking-wider rounded-full inline-block">
                      魔埚精准熔接 Active Crucible Sorting
                    </span>
                    <h4 className="text-xs text-slate-500 font-black uppercase mt-1">
                      点击下方对应释义的锅炉进行融合
                    </h4>
                  </div>

                  <div className="flex items-center justify-center space-x-2.5 max-w-sm mx-auto">
                    {cauldrons.map((caul) => (
                      <motion.button
                        key={caul.id}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => handleSortChoice(caul)}
                        className="flex-1 p-3 bg-[#1e142c] hover:bg-[#2c1d42] border border-purple-900 rounded-2xl font-black text-xs text-slate-200 transition-all cursor-pointer text-center whitespace-nowrap overflow-hidden shadow"
                      >
                        🔥 {caul.translation}
                      </motion.button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="py-6 text-center text-slate-500 font-medium">魔力涌动中，调配下一个药剂配方...</div>
              )}

              {/* Real-time Brewed Potions Storage Display */}
              {brewedPotions.length > 0 && (
                <div className="pt-2 border-t border-purple-950/50">
                  <span className="text-[8.5px] font-black text-purple-500 uppercase tracking-wider block mb-2">
                    已收储的炼金晶瓶药汁 (Potions Case):
                  </span>
                  <div className="flex items-center space-x-2.5">
                    {brewedPotions.map((p) => (
                      <div 
                        key={p.id}
                        className="bg-[#0c0910] border border-purple-900/30 px-2 py-1 rounded-xl flex items-center space-x-1 text-[9px] font-bold text-slate-300 shadow"
                      >
                        <span>{p.emoji}</span>
                        <span>{p.name}</span>
                      </div>
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
            className="p-8 py-14 text-center space-y-6 bg-gradient-to-b from-[#0f0917] to-[#1e142c]"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-3xl mx-auto shadow-lg animate-bounce">
              🧪
            </div>

            <div className="space-y-1">
              <h4 className="text-3xl font-black text-purple-400">大炼金术师凯旋！</h4>
              <p className="text-xs text-purple-300 uppercase font-black leading-relaxed">
                全套黄金词晶药汁成功萃取！实验室护盾坚不可摧！
              </p>
            </div>

            <div className="bg-purple-950/20 border border-purple-900/40 rounded-3xl p-5 max-w-sm mx-auto space-y-3">
              <div className="flex items-center justify-around divide-x divide-purple-900/30">
                <div className="text-center">
                  <span className="text-[9px] font-black text-slate-400 uppercase block mb-1">经验金库</span>
                  <span className="text-xl font-black text-white tabular-nums">{score}</span>
                </div>
                <div className="text-center pl-4">
                  <span className="text-[9px] font-black text-purple-400 uppercase block mb-1">契约晶币</span>
                  <span className="text-xl font-black text-purple-300 tabular-nums">+{coinsEarned}</span>
                </div>
                <div className="text-center pl-4">
                  <span className="text-[9px] font-black text-pink-400 uppercase block mb-1">魔法经验</span>
                  <span className="text-xl font-black text-pink-300 tabular-nums">+{xpEarned} XP</span>
                </div>
              </div>
            </div>

            <button 
              onClick={finishAlchemyClaim}
              className="w-full max-w-xs bg-purple-500 hover:bg-purple-600 border-b-4 border-purple-700 py-3.5 rounded-[24px] text-white font-black text-sm cursor-pointer transition-colors"
            >
              收成经验、凯旋退场
            </button>
          </motion.div>
        )}

        {gameState === 'LOST' && (
          <motion.div 
            key="lost" 
            className="p-8 py-14 text-center space-y-6 bg-gradient-to-b from-[#0f0917] to-[#1e142c]"
          >
            <div className="w-16 h-16 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-full flex items-center justify-center text-3xl mx-auto animate-pulse">
              💀
            </div>

            <div className="space-y-1">
              <h4 className="text-2xl font-black text-rose-500">坩埚爆沸！尘土湮灭</h4>
              <p className="text-xs text-slate-400 font-extrabold uppercase leading-normal">
                魔埚融合比例失衡引起轻度熔毁。别灰心，整理思路，重新控制魔力融合吧！
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto pt-4">
              <button 
                onClick={startAlchemyJob}
                className="bg-purple-500 hover:bg-purple-600 border-b-4 border-purple-700 py-3 rounded-2xl text-white font-black text-xs cursor-pointer"
              >
                重启炼金工程 (Retry)
              </button>
              <button 
                onClick={finishAlchemyClaim}
                className="bg-slate-900 border border-slate-800 py-3 rounded-2xl text-slate-300 font-black text-xs cursor-pointer"
              >
                收集余烬 (Leave)
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CauldronSorter;
