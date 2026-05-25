import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { WordGroup, WordItem, UserStats } from '../types';
import { 
  X, ArrowLeft, RotateCcw, Volume2, ShieldAlert, Sparkles, Zap, AlertTriangle
} from 'lucide-react';
import audio from '../utils/AudioUtils';
import confetti from 'canvas-confetti';
import { CHARACTERS } from '../constants';

interface WordGoldMinerProps {
  groups: WordGroup[];
  stats: UserStats;
  onFinish: (score: number, coins: number) => void;
  onClose: () => void;
}

interface MiningItem {
  id: string;
  letter: string;
  isCorrectNextLetter: boolean;
  x: number; // 10% to 90%
  y: number; // 35% to 80%
  radius: number;
  type: 'GOLD_NUGGET' | 'BOULDER' | 'DIAMOND';
  weight: number; // higher weight means reels in slower
  isHarvested: boolean;
}

export const WordGoldMiner: React.FC<WordGoldMinerProps> = ({ groups, stats, onFinish, onClose }) => {
  const allWords = useMemo(() => {
    let list: WordItem[] = [];
    groups.forEach(g => {
      g.words.forEach(w => {
        list.push(w);
      });
    });
    if (list.length === 0) {
      list = [
        { text: 'gold', translation: '黄金', imageUrl: '' },
        { text: 'mine', translation: '矿区', imageUrl: '' },
        { text: 'rock', translation: '岩石', imageUrl: '' },
        { text: 'star', translation: '星星', imageUrl: '' }
      ];
    }
    return [...list].sort(() => Math.random() - 0.5);
  }, [groups]);

  const [gameState, setGameState] = useState<'INTRO' | 'PLAYING' | 'WON' | 'LOST'>('INTRO');
  const [score, setScore] = useState(0);
  const [coinsEarned, setCoinsEarned] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  const [dynamites, setDynamites] = useState(3); // Allows exploding a heavy grabbed boulder
  const [timeLeft, setTimeLeft] = useState(90); // 90 seconds timer

  const [materials, setMaterials] = useState<MiningItem[]>([]);
  const [currentWord, setCurrentWord] = useState<WordItem | null>(null);
  const [spelledLetters, setSpelledLetters] = useState<string[]>([]);

  // Claw mechanics state
  const [clawAngle, setClawAngle] = useState(0); // -65 to 65 degrees
  const [clawState, setClawState] = useState<'SWINGING' | 'SHOOTING' | 'REELING'>('SWINGING');
  const [clawLength, setClawLength] = useState(40); // 40px to 320px
  const [grabbedItemId, setGrabbedItemId] = useState<string | null>(null);

  const hero = useMemo(() => {
    return CHARACTERS.find(c => c.id === stats.selectedCharacterId) || CHARACTERS[0];
  }, [stats.selectedCharacterId]);

  const angleDirection = useRef(1); // 1 = right, -1 = left
  const wordIdx = useRef(0);
  const loopTimer = useRef<NodeJS.Timeout | null>(null);

  const startMining = () => {
    setGameState('PLAYING');
    setScore(0);
    setCoinsEarned(0);
    setXpEarned(0);
    setDynamites(3);
    setTimeLeft(90);
    setSpelledLetters([]);
    setClawState('SWINGING');
    setClawLength(40);
    setGrabbedItemId(null);
    wordIdx.current = 0;

    audio.playPop();
    setupMiningTask();
  };

  const setupMiningTask = () => {
    if (allWords.length === 0) return;
    const target = allWords[wordIdx.current % allWords.length];
    wordIdx.current += 1;
    setCurrentWord(target);
    setSpelledLetters([]);

    // Generate mineral elements
    const wordLetters = target.text.toLowerCase().split('');
    const alphabet = 'abcdefghijklmnopqrstuvwxyz';
    
    const items: MiningItem[] = [];

    // 1. Add correct letters
    wordLetters.forEach((letter, idx) => {
      items.push({
        id: `correct-${idx}-${Date.now()}`,
        letter,
        isCorrectNextLetter: idx === 0, // initially, first letter is next
        x: 15 + (idx * 16) + Math.random() * 8,
        y: 40 + Math.random() * 35,
        radius: 18,
        type: 'GOLD_NUGGET',
        weight: 1.2,
        isHarvested: false
      });
    });

    // 2. Add bad letter boulders
    for (let i = 0; i < 5; i++) {
      const randLetter = alphabet[Math.floor(Math.random() * alphabet.length)];
      if (!wordLetters.includes(randLetter)) {
        items.push({
          id: `boulder-${i}-${Date.now()}`,
          letter: randLetter,
          isCorrectNextLetter: false,
          x: 12 + Math.random() * 76,
          y: 35 + Math.random() * 45,
          radius: 20,
          type: 'BOULDER',
          weight: 4.5, // extremely heavy
          isHarvested: false
        });
      }
    }

    // 3. Add one shiny Diamond bag
    items.push({
      id: `diamond-${Date.now()}`,
      letter: '💎',
      isCorrectNextLetter: false,
      x: 10 + Math.random() * 80,
      y: 45 + Math.random() * 32,
      radius: 14,
      type: 'DIAMOND',
      weight: 0.8, // super light
      isHarvested: false
    });

    setMaterials(items);
    setClawState('SWINGING');
    setClawLength(40);
    setGrabbedItemId(null);

    try { audio.speak(target.text); } catch(e){}
  };

  useEffect(() => {
    if (gameState !== 'PLAYING') {
      if (loopTimer.current) clearInterval(loopTimer.current);
      return;
    }

    loopTimer.current = setInterval(() => {
      // 1. Countdown timer
      setTimeLeft(t => {
        const next = t - 0.1;
        if (next <= 0) {
          setGameState('LOST');
          audio.playError();
        }
        return Math.max(0, next);
      });

      // 2. Swinging & Shooting Claw Physics
      setClawState(st => {
        if (st === 'SWINGING') {
          setClawAngle(ang => {
            let nextAng = ang + angleDirection.current * 3;
            if (nextAng > 65) {
              nextAng = 65;
              angleDirection.current = -1;
            } else if (nextAng < -65) {
              nextAng = -65;
              angleDirection.current = 1;
            }
            return nextAng;
          });
        } else if (st === 'SHOOTING') {
          setClawLength(len => {
            const nextLen = len + 10;
            
            // Calculate coordinates of claw tip
            const rad = (clawAngle * Math.PI) / 180;
            const tipX = 50 + (nextLen * Math.sin(rad)) / 4.4; // horizontal screen scale offset
            const tipY = 15 + (nextLen * Math.cos(rad)) / 3.4;

            // Check collision with any mineral rock
            let collidedItem: MiningItem | null = null;
            setMaterials(currentMaterials => {
              const hit = currentMaterials.find(m => {
                if (m.isHarvested) return false;
                // Calculate distance based on coordinate math
                const dist = Math.sqrt(Math.pow(m.x - tipX, 2) + Math.pow(m.y - tipY, 2));
                return dist < 8; // hit box
              });

              if (hit) {
                collidedItem = hit;
              }
              return currentMaterials;
            });

            if (collidedItem) {
              const hitObj = collidedItem as MiningItem;
              setGrabbedItemId(hitObj.id);
              setClawState('REELING');
              audio.playPop();
              return nextLen;
            }

            if (nextLen >= 310) {
              setClawState('REELING'); // limit reach
              return 310;
            }
            return nextLen;
          });
        } else if (st === 'REELING') {
          setClawLength(len => {
            // Retrieve grabbed item weight index
            let reelSpeedMultiplier = 7;
            if (grabbedItemId) {
              const grabbedItem = materials.find(m => m.id === grabbedItemId);
              if (grabbedItem) {
                reelSpeedMultiplier = 8 / grabbedItem.weight;
              }
            }

            const nextLen = len - reelSpeedMultiplier;
            
            // Move item holding with claw tip
            if (grabbedItemId) {
              const rad = (clawAngle * Math.PI) / 180;
              const tipX = 50 + (nextLen * Math.sin(rad)) / 4.4;
              const tipY = 15 + (nextLen * Math.cos(rad)) / 3.4;
              setMaterials(prev => prev.map(m => m.id === grabbedItemId ? { ...m, x: tipX, y: tipY } : m));
            }

            if (nextLen <= 40) {
              // Claw retrieved! Resolve harvested element
              setClawState('SWINGING');
              if (grabbedItemId) {
                resolveHarvestedItem();
              }
              return 40;
            }
            return nextLen;
          });
        }
        return st;
      });

    }, 100);

    return () => {
      if (loopTimer.current) clearInterval(loopTimer.current);
    };
  }, [gameState, clawState, clawLength, grabbedItemId, materials, clawAngle]);

  const resolveHarvestedItem = () => {
    const harvested = materials.find(m => m.id === grabbedItemId);
    if (!harvested) return;

    // Discard from mines
    setMaterials(prev => prev.map(m => m.id === grabbedItemId ? { ...m, isHarvested: true } : m));
    setGrabbedItemId(null);

    if (harvested.type === 'DIAMOND') {
      audio.playSuccess();
      setScore(s => s + 100);
      setCoinsEarned(c => c + 10);
      return;
    }

    if (!currentWord) return;

    // Spelling check
    const wordLetters = currentWord.text.toLowerCase().split('');
    const targetIdx = spelledLetters.length;
    const requiredLetter = wordLetters[targetIdx];

    if (harvested.letter === requiredLetter) {
      audio.playSuccess();
      const updatedLetters = [...spelledLetters, harvested.letter];
      setSpelledLetters(updatedLetters);

      // Award marks
      setScore(s => s + 40);
      setCoinsEarned(c => c + 2);
      setXpEarned(x => x + 4);

      // Mark the next required letter correct indicator
      setMaterials(curr => curr.map(m => {
        const nextRequired = wordLetters[updatedLetters.length];
        return {
          ...m,
          isCorrectNextLetter: m.letter === nextRequired && !m.isHarvested
        };
      }));

      // Check spelling completion
      if (updatedLetters.join('') === currentWord.text.toLowerCase()) {
        try { audio.speak(currentWord.text); } catch(e){}
        setTimeout(() => {
          if (wordIdx.current >= 6) {
            setGameState('WON');
            audio.playCheer();
            try {
              confetti({ particleCount: 130, spread: 80, origin: { y: 0.6 } });
            } catch(e){}
          } else {
            setupMiningTask();
          }
        }, 700);
      }
    } else {
      // Wrong mineral clawed
      audio.playError();
      setScore(s => Math.max(0, s - 15));
    }
  };

  const throwDynamite = () => {
    if (clawState !== 'REELING' || !grabbedItemId || dynamites <= 0) return;
    audio.playCoin(); // throw sound / fuse sparks
    setDynamites(d => d - 1);
    
    // Blast grabbed boulder, set claw back to reeling fast
    setMaterials(prev => prev.map(m => m.id === grabbedItemId ? { ...m, isHarvested: true } : m));
    setGrabbedItemId(null);
  };

  const shootClaw = () => {
    if (clawState !== 'SWINGING') return;
    setClawState('SHOOTING');
  };

  const finishMinerClaim = () => {
    audio.playClick();
    onFinish(score, coinsEarned);
  };

  return (
    <div className="w-full max-w-xl mx-auto rounded-[40px] border-4 border-amber-600 shadow-[0_32px_64px_-16px_rgba(245,158,11,0.15)] bg-gradient-to-b from-[#fef3c7] to-[#fde68a] text-[#1e293b] overflow-hidden font-sans relative">
      <h3 className="hidden">地心拼词大探险</h3>

      {/* Top Banner */}
      <div className="bg-[#b45309] p-4 flex items-center justify-between border-b border-[#d97706] text-white">
        <div className="flex items-center space-x-3">
          <button onClick={onClose} className="p-2 hover:bg-[#92400e] rounded-xl transition-all cursor-pointer">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h4 id="miner-game-title" className="font-extrabold text-amber-100 text-sm leading-none flex items-center gap-1.5">
              <span>黄金词矿工：地底掘金</span>
              <span className="text-[9px] bg-amber-500/35 text-amber-200 font-extrabold px-1.5 py-0.5 rounded">Gold Miner</span>
            </h4>
            <span className="text-[10px] text-amber-200 block font-bold mt-1">对准摇摆的机械吊爪，按下开采字母金矿</span>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <div className="bg-[#92400e] px-2.5 py-1 rounded-xl font-bold flex items-center space-x-1">
            <span>🪙</span>
            <span className="text-yellow-200">+{coinsEarned}</span>
          </div>
          <button onClick={onClose} className="p-1.5 bg-rose-500/15 text-rose-300 hover:bg-rose-500/25 rounded-xl cursor-pointer">
            <X size={15} />
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {gameState === 'INTRO' && (
          <motion.div 
            key="intro" 
            className="p-8 py-16 text-center space-y-6 bg-gradient-to-b from-[#fef3c7] to-[#fde68a]"
          >
            <div className="text-6xl animate-bounce">🪙</div>
            <div className="space-y-2">
              <h4 className="text-2xl font-black text-amber-800 tracking-tight">黄金拼词矿工：地核宝藏</h4>
              <p className="text-xs text-amber-900 font-extrabold leading-relaxed uppercase">
                探险家！地层深处富含金色字母晶石。摇摆的机械爪在来回晃动！抓住时机按【屏幕或发射键】伸出抓手，按单词拼写的字母顺序依次抓取，避开沉重无比的灰色暗石！
              </p>
            </div>

            <div className="p-4 bg-amber-200/40 border border-amber-300 rounded-3xl text-left text-xs max-w-sm mx-auto space-y-1">
              <span className="font-black text-amber-800 uppercase block mb-1">🪙 矿工爆破法则</span>
              <p className="font-bold text-amber-950 leading-relaxed">
                爪子晃动时，点击挖掘池任意位置射出吊机。如果抓住了极重的垃圾石头，可以点击【雷管炸弹 🧨】直接炸碎，免除缓慢回拉消耗时间！
              </p>
            </div>

            <button 
              onClick={startMining}
              className="w-full max-w-xs bg-amber-600 hover:bg-amber-700 border-b-4 border-amber-800 py-3.5 rounded-[24px] text-white font-black text-sm transition-all cursor-pointer shadow-md"
            >
              扛起铁镐开工 ⛏️
            </button>
          </motion.div>
        )}

        {gameState === 'PLAYING' && (
          <motion.div key="playing" className="flex flex-col relative bg-[#f3f4f6]">
            
            {/* HUD Status line */}
            <div className="bg-[#78350f] px-4 py-2 flex items-center justify-between text-white text-xs">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-amber-200">倒计时 (Time):</span>
                <span className="text-sm font-black text-yellow-300 tabular-nums">{Math.ceil(timeLeft)}s</span>
              </div>

              {/* Dynamite Inventory */}
              <div className="flex items-center space-x-2">
                <button 
                  onClick={throwDynamite}
                  disabled={clawState !== 'REELING' || !grabbedItemId || dynamites <= 0}
                  className={`px-3 py-1 rounded-full text-[10px] font-black border uppercase flex items-center space-x-1 transition-all ${
                    clawState === 'REELING' && grabbedItemId && dynamites > 0
                      ? 'bg-rose-600 border-rose-500 hover:scale-105 active:scale-95 text-white cursor-pointer animate-pulse'
                      : 'bg-slate-800 border-slate-700 text-slate-500 cursor-not-allowed opacity-50'
                  }`}
                >
                  <span>🧨 使用雷管 ({dynamites})</span>
                </button>
              </div>

              <div className="bg-amber-900/60 border border-amber-700/40 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase text-amber-300">
                坑产进度 (Word): {wordIdx.current - 1}/5
              </div>
            </div>

            {/* MINING POOL CLAW WINDOW */}
            <div 
              className="w-full aspect-[1.8/1] min-h-[250px] bg-gradient-to-b from-[#b45309] to-[#78350f] relative overflow-hidden pb-4"
              onClick={shootClaw}
            >
              {/* Miner platform on top */}
              <div className="absolute top-0 left-0 right-0 h-10 bg-gradient-to-b from-[#d97706]/95 to-[#b45309]/80 border-b border-white/10 flex items-center justify-between px-4 text-white text-[10px] font-black select-none pointer-events-none">
                <span>🚠 地形表面 (Excavation Camp)</span>
                <span className="text-yellow-300">⛏️ 等待抓取命令 (Tap below to cast)</span>
              </div>

              {/* Swinging shaft hook cord rope */}
              <svg className="absolute inset-0 pointer-events-none select-none z-10 w-full h-full">
                {/* Draw string line from origin (50%, 15%) down to tip */}
                {(() => {
                  const rad = (clawAngle * Math.PI) / 180;
                  // Calculate raw end tip coords (percentage width & height)
                  const tipXPercent = 50 + (clawLength * Math.sin(rad)) / 4.4;
                  const tipYPercent = 15 + (clawLength * Math.cos(rad)) / 3.4;
                  return (
                    <line
                      x1="50%"
                      y1="13%"
                      x2={`${tipXPercent}%`}
                      y2={`${tipYPercent}%`}
                      stroke="#d97706"
                      strokeWidth="2.5"
                      strokeDasharray="1.5 2"
                    />
                  );
                })()}
              </svg>

              {/* Hook graphic wrapper */}
              {(() => {
                const rad = (clawAngle * Math.PI) / 180;
                const tipX = 50 + (clawLength * Math.sin(rad)) / 4.4;
                const tipY = 15 + (clawLength * Math.cos(rad)) / 3.4;
                return (
                  <div 
                    className="absolute pointer-events-none select-none z-15 -translate-x-1/2 -translate-y-1/2 text-2xl duration-75"
                    style={{ left: `${tipX}%`, top: `${tipY}%` }}
                  >
                    ✊
                  </div>
                );
              })()}

              {/* Render underground Gold nuggets & grey heavy stone boulders */}
              {materials.map(m => {
                if (m.isHarvested) return null;
                const itemBg = m.type === 'BOULDER' ? 'bg-[#475569] border-[#64748b] text-slate-300' : m.type === 'GOLD_NUGGET' ? 'bg-gradient-to-br from-amber-400 to-yellow-500 border-yellow-200 text-amber-950 shadow-[0_4px_10px_rgba(234,179,8,0.5)]' : 'bg-gradient-to-br from-cyan-400 to-blue-500 border-cyan-100 text-white';
                return (
                  <div
                    key={m.id}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center font-black text-xs border select-none pointer-events-none z-10 ${itemBg}`}
                    style={{ left: `${m.x}%`, top: `${m.y}%` }}
                  >
                    <span>{m.letter}</span>
                  </div>
                );
              })}

              {/* Miner Operator label */}
              <div className="absolute left-3.5 top-12 bg-black/50 border border-amber-900/60 p-1 rounded-xl text-[8px] text-amber-300 font-extrabold select-none pointer-events-none flex items-center space-x-1">
                <span>🚧 Operator:</span>
                <span>{hero.name} (词压重型吊装)</span>
              </div>
            </div>

            {/* LOWER SPELL CONTROLLER - QUESTION COGNITION PROMPT */}
            <div className="p-6 bg-[#fdfaf2] space-y-4 border-t border-amber-200 text-[#1e293b]">
              
              {currentWord ? (
                <div className="space-y-3.5 text-center">
                  <div className="inline-flex items-center space-x-1 bg-amber-100 border border-amber-200 text-amber-700 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider leading-none">
                    <span>💎 魔法拼矿</span>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[10px] font-extrabold text-[#78350f] block tracking-normal uppercase">
                      拼词目标释义: 「 {currentWord.translation} 」
                    </span>
                    
                    <div className="flex items-center justify-center space-x-1.5 min-h-[44px]">
                      {currentWord.text.toLowerCase().split('').map((letter, idx) => {
                        const isSpelled = spelledLetters[idx] === letter;
                        return (
                          <span
                            key={idx}
                            className={`w-9 h-9 font-black flex items-center justify-center text-sm uppercase rounded-xl border shadow ${
                              isSpelled 
                                ? 'bg-gradient-to-br from-amber-400 to-yellow-500 text-amber-950 border-yellow-200' 
                                : 'bg-white text-slate-400 border-slate-200'
                            }`}
                          >
                            {isSpelled ? letter : '?'}
                          </span>
                        );
                      })}

                      <button 
                        onClick={() => { audio.speak(currentWord.text); }}
                        className="ml-2.5 p-1 bg-amber-500/10 hover:bg-amber-500/25 border border-amber-500/20 text-amber-700 hover:text-amber-800 rounded-lg transition-colors cursor-pointer"
                      >
                        <Volume2 size={16} />
                      </button>
                    </div>
                  </div>

                  <p className="text-[10px] font-bold text-slate-500 uppercase leading-none">
                    对准地底字母金矿。按上面词序依次下钩抓取。抓错倒扣分数！
                  </p>
                </div>
              ) : (
                <div className="py-6 text-center text-slate-300 font-bold uppercase text-xs">正在接通黄金词缆...</div>
              )}
            </div>

          </motion.div>
        )}

        {gameState === 'WON' && (
          <motion.div 
            key="won" 
            className="p-8 py-14 text-center space-y-6 bg-gradient-to-b from-[#fef3c7] to-[#fde68a]"
          >
            <div className="w-16 h-16 bg-amber-500 text-white rounded-full flex items-center justify-center text-3xl mx-auto shadow-lg animate-bounce">
              🪙
            </div>

            <div className="space-y-1">
              <h4 className="text-3xl font-black text-amber-800">地心采矿奇迹！捷报！</h4>
              <p className="text-xs text-amber-900 uppercase font-black tracking-wider">
                地底拼词法阵成功构筑！你开发了最高密度的英文能量矿脉！
              </p>
            </div>

            <div className="bg-amber-100 border border-amber-200 rounded-3xl p-5 max-w-sm mx-auto space-y-3 text-slate-800">
              <div className="flex items-center justify-around divide-x divide-amber-200">
                <div className="text-center">
                  <span className="text-[9px] font-black text-amber-700 uppercase block mb-1">矿山总积分</span>
                  <span className="text-xl font-black text-amber-900 tabular-nums">{score}</span>
                </div>
                <div className="text-center pl-4">
                  <span className="text-[9px] font-black text-amber-600 uppercase block mb-1">能量契约币</span>
                  <span className="text-xl font-black text-amber-800 tabular-nums">+{coinsEarned}</span>
                </div>
                <div className="text-center pl-4">
                  <span className="text-[9px] font-black text-cyan-600 uppercase block mb-1">角色经验(XP)</span>
                  <span className="text-xl font-black text-cyan-700 tabular-nums">+{xpEarned} XP</span>
                </div>
              </div>
            </div>

            <button 
              onClick={finishMinerClaim}
              className="w-full max-w-xs bg-amber-600 hover:bg-amber-700 border-b-4 border-amber-800 py-3.5 rounded-[24px] text-white font-black text-sm cursor-pointer transition-colors"
            >
              装载矿石，凯旋收获
            </button>
          </motion.div>
        )}

        {gameState === 'LOST' && (
          <motion.div 
            key="lost" 
            className="p-8 py-14 text-center space-y-6 bg-gradient-to-b from-[#fef3c7] to-[#fde68a]"
          >
            <div className="w-16 h-16 bg-rose-100 border border-rose-200 text-rose-500 rounded-full flex items-center justify-center text-3xl mx-auto animate-pulse">
              💀
            </div>

            <div className="space-y-1 text-slate-800">
              <h4 className="text-2xl font-black text-rose-600">地压过载！矿井塌方</h4>
              <p className="text-xs text-slate-500 font-extrabold uppercase leading-relaxed">
                剩余采矿限时耗尽！别气馁，注意时机并避开沉重灰色石头，重新挖掘金币！
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto pt-4">
              <button 
                onClick={startMining}
                className="bg-amber-600 hover:bg-amber-700 border-b-4 border-amber-800 py-3 rounded-2xl text-white font-black text-xs cursor-pointer"
              >
                重启采矿机 (Retry)
              </button>
              <button 
                onClick={finishMinerClaim}
                className="bg-slate-200 hover:bg-slate-350 border border-slate-300 py-3 rounded-2xl text-slate-600 font-black text-xs cursor-pointer"
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

export default WordGoldMiner;
