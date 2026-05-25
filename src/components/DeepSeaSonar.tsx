import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { WordGroup, WordItem, UserStats } from '../types';
import { 
  X, ArrowLeft, Volume2, ShieldAlert, Sparkles, Navigation, Shield, Compass, Zap
} from 'lucide-react';
import audio from '../utils/AudioUtils';
import confetti from 'canvas-confetti';
import { CHARACTERS } from '../constants';

interface DeepSeaSonarProps {
  groups: WordGroup[];
  stats: UserStats;
  onFinish: (score: number, coins: number) => void;
  onClose: () => void;
}

interface SeaMine {
  id: string;
  translation: string;
  isCorrect: boolean;
  x: number; // 10% to 90%
  y: number; // -10% to 95%
  speed: number;
  radius: number;
  emoji: string;
  isBlasted?: boolean;
}

interface SonarPulse {
  id: string;
  x: number; // percent
  y: number; // percent
  speed: number;
}

interface Bubble {
  id: string;
  x: number;
  y: number;
  size: number;
  speed: number;
}

export const DeepSeaSonar: React.FC<DeepSeaSonarProps> = ({ groups, stats, onFinish, onClose }) => {
  const allWords = useMemo(() => {
    let list: WordItem[] = [];
    groups.forEach(g => {
      g.words.forEach(w => {
        list.push(w);
      });
    });
    if (list.length === 0) {
      list = [
        { text: 'sub', translation: '潜艇', imageUrl: '' },
        { text: 'deep', translation: '深海', imageUrl: '' },
        { text: 'sonar', translation: '声呐', imageUrl: '' },
        { text: 'laser', translation: '激光', imageUrl: '' },
        { text: 'wave', translation: '波浪', imageUrl: '' }
      ];
    }
    return [...list].sort(() => Math.random() - 0.5);
  }, [groups]);

  const [gameState, setGameState] = useState<'INTRO' | 'PLAYING' | 'WON' | 'LOST'>('INTRO');
  const [score, setScore] = useState(0);
  const [coinsEarned, setCoinsEarned] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  const [hullIntegrity, setHullIntegrity] = useState(100); // Life/Shield (0 to 100)

  const [subX, setSubX] = useState(50); // Centered sub (0 - 100)
  const [mines, setMines] = useState<SeaMine[]>([]);
  const [pulses, setPulses] = useState<SonarPulse[]>([]);
  const [bubbles, setBubbles] = useState<Bubble[]>([]);

  const [targetWord, setTargetWord] = useState<WordItem | null>(null);

  const hero = useMemo(() => {
    return CHARACTERS.find(c => c.id === stats.selectedCharacterId) || CHARACTERS[0];
  }, [stats.selectedCharacterId]);

  const wordIdx = useRef(0);
  const loopTimer = useRef<NodeJS.Timeout | null>(null);
  const spawnTimer = useRef<NodeJS.Timeout | null>(null);

  const startSonarMission = () => {
    setGameState('PLAYING');
    setScore(0);
    setCoinsEarned(0);
    setXpEarned(0);
    setHullIntegrity(100);
    setSubX(50);
    setMines([]);
    setPulses([]);
    wordIdx.current = 0;

    // generate sea bubbles
    const initBubbs: Bubble[] = [];
    for (let i = 0; i < 20; i++) {
      initBubbs.push({
        id: `bubble-${i}-${Date.now()}`,
        x: Math.random() * 95,
        y: Math.random() * 90,
        size: Math.random() * 5 + 2,
        speed: Math.random() * 2 + 1
      });
    }
    setBubbles(initBubbs);

    audio.playPop();
    nextSonarTask();
  };

  const nextSonarTask = () => {
    if (allWords.length === 0) return;
    const target = allWords[wordIdx.current % allWords.length];
    wordIdx.current += 1;
    setTargetWord(target);

    // Spawn new mine waves that contains the answer + wrong ones
    spawnMineWave(target);
    try { audio.speak(target.text); } catch(e){}
  };

  const spawnMineWave = (target: WordItem) => {
    const wrongTranslations = allWords
      .filter(w => w.text !== target.text)
      .map(w => w.translation);
    const shuffledWrong = [...wrongTranslations].sort(() => Math.random() - 0.5).slice(0, 3);

    const matchPool = [
      { text: target.translation, isCorrect: true, emoji: '💣' },
      ...shuffledWrong.map(t => ({ text: t, isCorrect: false, emoji: '⚙️' }))
    ];

    // Align in columns
    const columns = [20, 40, 60, 80];
    const shuffledCols = [...columns].sort(() => Math.random() - 0.5);

    const newMines = matchPool.map((item, index) => {
      return {
        id: `mine-${index}-${Date.now()}`,
        translation: item.text,
        isCorrect: item.isCorrect,
        x: shuffledCols[index % shuffledCols.length],
        y: -15, // start high above screen
        speed: 1.0 + Math.random() * 0.8,
        radius: 12,
        emoji: item.emoji
      } as SeaMine;
    });

    setMines(newMines);
  };

  // Game Engine
  useEffect(() => {
    if (gameState !== 'PLAYING') {
      if (loopTimer.current) clearInterval(loopTimer.current);
      if (spawnTimer.current) clearInterval(spawnTimer.current);
      return;
    }

    loopTimer.current = setInterval(() => {
      // 1. Move Naval Mines downwards
      setMines(prev => {
        const moved = prev.map(m => {
          if (m.isBlasted) return m;
          return { ...m, y: m.y + m.speed };
        });

        // Did any mine crash directly into submarine at y >= 82?
        const crashed = moved.find(m => !m.isBlasted && m.y >= 78 && m.y <= 88 && Math.abs(m.x - subX) < 13);
        if (crashed) {
          audio.playError();
          setHullIntegrity(curr => {
            const next = Math.max(0, curr - 25);
            if (next <= 0) {
              setGameState('LOST');
            }
            return next;
          });
          // Remove crashed mine so it doesn't double hit
          return moved.filter(m => m.id !== crashed.id);
        }

        // Did correct mine escape off the bottom untouched? Penalty!
        const missedCorrect = moved.some(m => m.isCorrect && !m.isBlasted && m.y > 90);
        if (missedCorrect) {
          audio.playError();
          setHullIntegrity(curr => Math.max(0, curr - 15));
          setTimeout(() => nextSonarTask(), 300);
          return [];
        }

        // If all mines left the screen as debris, spawn next
        const allDone = moved.every(m => m.isBlasted || m.y > 95);
        if (allDone && moved.length > 0) {
          setTimeout(() => nextSonarTask(), 200);
          return [];
        }

        return moved.filter(m => m.y < 100);
      });

      // 2. Move Sonar Pulses upwards
      setPulses(prev => {
        const moved = prev.map(p => ({ ...p, y: p.y - p.speed }));

        // Collision Check: did pulse hit any active mine?
        let hitMineId: string | null = null;
        let pIdToRemove: string | null = null;

        moved.forEach(p => {
          mines.forEach(m => {
            if (!m.isBlasted && Math.abs(p.x - m.x) < 8 && Math.abs(p.y - m.y) < 7) {
              hitMineId = m.id;
              pIdToRemove = p.id;
            }
          });
        });

        if (hitMineId) {
          resolvePulseCollision(hitMineId);
          return moved.filter(p => p.id !== pIdToRemove);
        }

        return moved.filter(p => p.y > 5);
      });

      // 3. Floating bubbles ascending
      setBubbles(prev => prev.map(b => {
        let nextY = b.y - b.speed;
        if (nextY < 5) nextY = 95;
        return { ...b, y: nextY };
      }));

    }, 80);

    return () => {
      if (loopTimer.current) clearInterval(loopTimer.current);
      if (spawnTimer.current) clearInterval(spawnTimer.current);
    };
  }, [gameState, subX, mines]);

  const resolvePulseCollision = (mineId: string) => {
    const hit = mines.find(m => m.id === mineId);
    if (!hit) return;

    // Trigger mine blast state
    setMines(prev => prev.map(m => m.id === mineId ? { ...m, isBlasted: true, speed: 0 } : m));

    if (hit.isCorrect) {
      audio.playSuccess();
      try { audio.speak(targetWord?.text || ''); } catch(e){}

      setScore(s => s + 60);
      setCoinsEarned(c => c + 3);
      setXpEarned(x => x + 8);
      setHullIntegrity(curr => Math.min(100, curr + 12)); // healing shield on correct kill

      // Check win parameters
      if (wordIdx.current >= 8) {
        setGameState('WON');
        audio.playCheer();
        try { confetti({ particleCount: 140, spread: 80, origin: { y: 0.6 } }); } catch(e){}
      } else {
        setTimeout(() => nextSonarTask(), 500);
      }
    } else {
      // Blasted the wrong mine, feedback sonic shock
      audio.playError();
      setHullIntegrity(curr => {
        const next = Math.max(0, curr - 20);
        if (next <= 0) {
          setGameState('LOST');
        }
        return next;
      });
      setScore(s => Math.max(0, s - 10));
    }
  };

  // Shoot Acoustic Sonar Wave upward
  const triggerSonarPulse = () => {
    if (gameState !== 'PLAYING') return;
    audio.playClick();
    
    const newPulse: SonarPulse = {
      id: `pulse-${Date.now()}`,
      x: subX,
      y: 78,
      speed: 4.5
    };

    setPulses(prev => [...prev, newPulse]);
  };

  const steerLeft = () => {
    setSubX(x => Math.max(10, x - 12));
  };

  const steerRight = () => {
    setSubX(x => Math.min(90, x + 12));
  };

  const claimFinish = () => {
    audio.playClick();
    onFinish(score, coinsEarned);
  };

  return (
    <div className="w-full max-w-xl mx-auto rounded-[40px] border-4 border-cyan-500 shadow-[0_32px_64px_-16px_rgba(6,182,212,0.15)] bg-gradient-to-b from-[#083344] to-[#0f172a] text-[#f1f5f9] overflow-hidden font-sans relative">
      <h3 className="hidden">深海声呐特遣队</h3>

      {/* Top Banner */}
      <div className="bg-[#164e63] p-4 flex items-center justify-between border-b border-[#0e7490] text-white">
        <div className="flex items-center space-x-3">
          <button onClick={onClose} className="p-2 hover:bg-[#155e75] rounded-xl transition-all cursor-pointer">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h4 id="sonar-game-title" className="font-extrabold text-[#cffafe] text-sm leading-none flex items-center gap-1.5">
              <span>探幽声呐 (Deep Sea Sonar)</span>
              <span className="text-[9px] bg-cyan-400/25 text-cyan-200 font-extrabold px-1.5 py-0.5 rounded">Hangar</span>
            </h4>
            <span className="text-[10px] text-cyan-200 block font-bold mt-1">控制深海核潜艇，发射高震声呐波引爆对应翻译的水雷</span>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <div className="bg-[#155e75] px-2.5 py-1 rounded-xl font-bold flex items-center space-x-1">
            <span>🪙</span>
            <span className="text-cyan-300">+{coinsEarned}</span>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {gameState === 'INTRO' && (
          <motion.div 
            key="intro" 
            className="p-8 py-16 text-center space-y-6 bg-gradient-to-b from-[#083344] to-[#0c4a6e]"
          >
            <div className="text-6xl animate-bounce">🛥️</div>
            <div className="space-y-2">
              <h4 className="text-2xl font-black text-cyan-400 tracking-tight">深海声呐避障：声震寰宇</h4>
              <p className="text-xs text-cyan-200 font-extrabold leading-relaxed uppercase">
                核海指挥官！深海海底布满了词灵核水雷。查看浮上海面的英文指令，操纵潜艇左右腾挪，捕捉合适时机【点击发射声呐】高频激波震碎带有匹配中文字样的水雷，确保潜艇安全下潜！
              </p>
            </div>

            <div className="p-4 bg-cyan-950/40 border border-cyan-800/40 rounded-3xl max-w-sm mx-auto text-left flex items-start space-x-3">
              <Compass size={18} className="text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] font-black text-cyan-300 uppercase block mb-1">🌊 声呐控制系统</span>
                <p className="text-[11px] font-bold text-slate-300 leading-normal">
                  使用下方两侧【方向舵 ◀️ ▶️】指挥潜艇位移。避开雷区，用底部的声呐按钮在它接近前进行破片爆破。
                </p>
              </div>
            </div>

            <button 
              onClick={startSonarMission}
              className="w-full max-w-xs bg-cyan-505 hover:bg-cyan-600 border-b-4 border-cyan-700 bg-cyan-500 py-3.5 rounded-[24px] text-white font-black text-sm transition-all cursor-pointer shadow-lg"
            >
              满载潜航 ⚓
            </button>
          </motion.div>
        )}

        {gameState === 'PLAYING' && (
          <motion.div key="playing" className="flex flex-col relative bg-[#020617]">
            
            {/* HUD Status */}
            <div className="bg-[#082f49] px-4 py-2 flex items-center justify-between text-xs border-b border-cyan-900/40 text-cyan-100">
              <div className="flex items-center space-x-2.5 flex-1 max-w-[170px]">
                <span className="font-extrabold text-cyan-400">潜艇外壳:</span>
                <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-cyan-900 flex items-center relative">
                  <div 
                    className="bg-cyan-400 h-full rounded-full transition-all duration-300"
                    style={{ width: `${hullIntegrity}%` }}
                  />
                </div>
                <span className="text-[10px] font-black">{hullIntegrity}%</span>
              </div>

              <div className="bg-[#0f3e5c] px-2.5 py-0.5 rounded text-[10px] font-black border border-cyan-800/50">
                深探里程: {wordIdx.current - 1}/7 海里
              </div>
            </div>

            {/* SEABED CANVAS SCREEN */}
            <div className="w-full aspect-[1.8/1] min-h-[250px] bg-gradient-to-b from-[#0c4a6e] via-[#083344] to-[#020617] relative overflow-hidden px-1 border-b border-cyan-950">
              
              {/* Aquatic Bubble Particles */}
              {bubbles.map(b => (
                <div
                  key={b.id}
                  className="absolute bg-white/20 rounded-full border border-white/5 shrink-0 pointer-events-none"
                  style={{ left: `${b.x}%`, top: `${b.y}%`, width: `${b.size}px`, height: `${b.size}px` }}
                />
              ))}

              {/* Render Vertical Pulse laser lines */}
              {pulses.map(p => (
                <div
                  key={p.id}
                  className="absolute bg-cyan-400/90 w-1 rounded shadow-[0_0_12px_rgba(34,211,238,0.8)] z-15"
                  style={{ left: `${p.x}%`, top: `${p.y}%`, height: '24px' }}
                />
              ))}

              {/* Ocean Mines dropping */}
              {mines.map(m => {
                if (m.isBlasted) {
                  return (
                    <div 
                      key={m.id}
                      className="absolute -translate-x-1/2 -translate-y-1/2 text-2xl animate-out fade-out-50 duration-200 pointer-events-none select-none"
                      style={{ left: `${m.x}%`, top: `${m.y}%` }}
                    >
                      💥
                    </div>
                  );
                }

                return (
                  <div
                    key={m.id}
                    className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center bg-[#0d2a4a]/85 border border-cyan-500 rounded-2xl p-1.5 px-2.5 select-none pointer-events-none z-10 shadow cursor-pointer text-[10px] font-black"
                    style={{ left: `${m.x}%`, top: `${m.y}%` }}
                  >
                    <span className="text-[11px] mb-0.5">{m.emoji}</span>
                    <span className="text-cyan-100 whitespace-nowrap">{m.translation}</span>
                  </div>
                );
              })}

              {/* Submarine Vessel */}
              <div 
                className="absolute top-[82%] -translate-y-1/2 -translate-x-1/2 z-20 flex flex-col items-center transition-all duration-100"
                style={{ left: `${subX}%` }}
              >
                <div className="text-3xl animate-pulse select-none pointer-events-none">
                  🛥️
                </div>
                <div className="w-5 h-1.5 bg-cyan-400 rounded-full animate-ping mt-1 opacity-60" />
              </div>

              {/* Operator display */}
              <div className="absolute left-3 bottom-3 bg-black/60 px-2.5 py-1 rounded-xl text-[8px] border border-cyan-900/60 font-black text-cyan-300 pointer-events-none select-none flex items-center space-x-1">
                <span>🛰️ Pilot:</span>
                <span>{hero.name} (声强核控制舱)</span>
              </div>
            </div>

            {/* CONTROLLERS - LEFT/RIGHT STEERING AND FIRE PULSE */}
            <div className="p-5 bg-[#0a121d] border-t border-cyan-950/70 space-y-4">
              {targetWord ? (
                <div className="text-center space-y-3 pb-2">
                  <div className="inline-flex items-center space-x-1 bg-cyan-950 border border-cyan-500/30 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase text-cyan-400">
                    <span>⚓ 雷抗防核声呐锁</span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[9px] font-bold text-slate-500 block uppercase">
                      寻找该国话所指的声呐雷核:
                    </span>
                    
                    <div className="flex items-center justify-center space-x-1.5 min-h-[38px]">
                      <h4 className="text-2xl font-black text-cyan-300 tracking-tight">{targetWord.text}</h4>
                      <button 
                        onClick={() => { audio.speak(targetWord.text); }}
                        className="p-1 px-2.5 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 text-cyan-300 hover:text-cyan-100 rounded-lg transition-colors cursor-pointer"
                      >
                        <Volume2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-4 text-center text-slate-500 font-medium">声信号解析中...</div>
              )}

              {/* DIRECTION AND ATTACK BUTTON KEYPAD */}
              <div className="flex items-center gap-3 max-w-sm mx-auto">
                <button 
                  onClick={steerLeft}
                  className="flex-1 py-3 bg-[#111c2e] hover:bg-[#182942] border border-cyan-950/80 rounded-2xl font-black text-sm text-cyan-400 transition-all cursor-pointer active:scale-95 text-center shadow-lg"
                >
                  ◀️ 潜艇左旋
                </button>
                
                <button 
                  onClick={triggerSonarPulse}
                  className="flex-1.5 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-500 hover:brightness-110 rounded-2xl font-black text-sm text-white transition-all cursor-pointer active:scale-95 text-center shadow-lg uppercase relative"
                >
                  ⚡ 声震打击
                </button>

                <button 
                  onClick={steerRight}
                  className="flex-1 py-3 bg-[#111c2e] hover:bg-[#182942] border border-cyan-950/80 rounded-2xl font-black text-sm text-cyan-400 transition-all cursor-pointer active:scale-95 text-center shadow-lg"
                >
                  潜艇右旋 ▶️
                </button>
              </div>
            </div>

          </motion.div>
        )}

        {gameState === 'WON' && (
          <motion.div 
            key="won" 
            className="p-8 py-14 text-center space-y-6 bg-gradient-to-b from-[#083344] to-[#020617]"
          >
            <div className="w-16 h-16 bg-cyan-500 text-white rounded-full flex items-center justify-center text-3xl mx-auto shadow-lg animate-bounce">
              ⚓
            </div>

            <div className="space-y-1">
              <h4 className="text-3xl font-black text-cyan-400">海狼指挥官大捷！</h4>
              <p className="text-xs text-cyan-300 uppercase font-black leading-relaxed">
                潜艇成功穿越核防风暴区！你为海域恢复了蔚蓝平静！
              </p>
            </div>

            <div className="bg-[#0e273a] border border-cyan-900/40 rounded-3xl p-5 max-w-sm mx-auto space-y-3">
              <div className="flex items-center justify-around divide-x divide-cyan-950">
                <div className="text-center">
                  <span className="text-[9px] font-black text-slate-400 uppercase block mb-1">声震积分</span>
                  <span className="text-xl font-black text-white tabular-nums">{score}</span>
                </div>
                <div className="text-center pl-4">
                  <span className="text-[9px] font-black text-amber-500 block mb-1">契约声币</span>
                  <span className="text-xl font-black text-amber-400 tabular-nums">+{coinsEarned}</span>
                </div>
                <div className="text-center pl-4">
                  <span className="text-[9px] font-black text-cyan-400 block mb-1">潜航经验</span>
                  <span className="text-xl font-black text-cyan-300 tabular-nums">+{xpEarned} XP</span>
                </div>
              </div>
            </div>

            <button 
              onClick={claimFinish}
              className="w-full max-w-xs bg-cyan-500 hover:bg-cyan-600 border-b-4 border-cyan-700 py-3.5 rounded-[24px] text-white font-black text-sm cursor-pointer transition-colors"
            >
              声呐入库 退港
            </button>
          </motion.div>
        )}

        {gameState === 'LOST' && (
          <motion.div 
            key="lost" 
            className="p-8 py-14 text-center space-y-6 bg-gradient-to-b from-[#083344] to-[#0c4a6e]"
          >
            <div className="w-16 h-16 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-full flex items-center justify-center text-3xl mx-auto animate-pulse">
              🛡️
            </div>

            <div className="space-y-1">
              <h4 className="text-2xl font-black text-rose-500">水压爆壳！声力沉默</h4>
              <p className="text-xs text-slate-300 font-extrabold uppercase leading-normal">
                潜艇装甲归零或未能阻击雷核下沉。重整声呐，重新征召对战吧！
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto pt-4">
              <button 
                onClick={startSonarMission}
                className="bg-cyan-500 hover:bg-cyan-600 border-b-4 border-cyan-700 py-3 rounded-2xl text-white font-black text-xs cursor-pointer"
              >
                重启下潜 (Retry)
              </button>
              <button 
                onClick={claimFinish}
                className="bg-slate-900 border border-slate-800 py-3 rounded-2xl text-slate-300 font-black text-xs cursor-pointer"
              >
                返回坞站 (Leave)
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DeepSeaSonar;
