import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { WordGroup, WordItem, UserStats } from '../types';
import { ArrowLeft, Volume2, Sparkles, Sliders } from 'lucide-react';
import audio from '../utils/AudioUtils';
import confetti from 'canvas-confetti';
import { CHARACTERS } from '../constants';

interface WordBubbleShooterProps {
  groups: WordGroup[];
  stats: UserStats;
  onFinish: (score: number, coins: number) => void;
  onClose: () => void;
}

interface SkyBalloon {
  id: string;
  translation: string;
  isCorrect: boolean;
  x: number;      // percent
  y: number;      // percent
  vx: number;     // speed drift x
  color: string;
  size: number;
}

interface MovingProjectile {
  active: boolean;
  x: number; // percent starting 50
  y: number; // percent starting 90
  targetX: number;
  targetY: number;
}

export const WordBubbleShooter: React.FC<WordBubbleShooterProps> = ({ groups, stats, onFinish, onClose }) => {
  const allWords = useMemo(() => {
    let list: WordItem[] = [];
    groups.forEach(g => {
      g.words.forEach(w => list.push(w));
    });
    if (list.length === 0) {
      list = [
        { text: 'star', translation: '星星', imageUrl: '' },
        { text: 'moon', translation: '月亮', imageUrl: '' },
        { text: 'sun', translation: '太阳', imageUrl: '' },
        { text: 'cloud', translation: '乌云', imageUrl: '' },
        { text: 'sky', translation: '天空', imageUrl: '' }
      ];
    }
    return [...list].sort(() => Math.random() - 0.5);
  }, [groups]);

  const [gameState, setGameState] = useState<'INTRO' | 'PLAYING' | 'WON' | 'LOST'>('INTRO');
  const [score, setScore] = useState(0);
  const [coinsEarned, setCoinsEarned] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  const [ammo, setAmmo] = useState(10); // limited total bolts
  const [targetWord, setTargetWord] = useState<WordItem | null>(null);

  const [balloons, setBalloons] = useState<SkyBalloon[]>([]);
  const [projectile, setProjectile] = useState<MovingProjectile>({
    active: false, x: 50, y: 90, targetX: 50, targetY: 10
  });

  const hero = useMemo(() => {
    return CHARACTERS.find(c => c.id === stats.selectedCharacterId) || CHARACTERS[0];
  }, [stats.selectedCharacterId]);

  const wordPointer = useRef(0);
  const engineTimer = useRef<NodeJS.Timeout | null>(null);

  const bubbleGradients = [
    'from-pink-400 to-rose-400 shadow-[0_0_15px_pink]',
    'from-sky-400 to-cyan-400 shadow-[0_0_15px_cyan]',
    'from-purple-400 to-indigo-400 shadow-[0_0_15px_purple]',
    'from-amber-400 to-yellow-300 shadow-[0_0_15px_yellow]',
    'from-emerald-400 to-teal-400 shadow-[0_0_15px_lime]'
  ];

  const startGame = () => {
    setGameState('PLAYING');
    setScore(0);
    setCoinsEarned(0);
    setXpEarned(0);
    setAmmo(10);
    setBalloons([]);
    setProjectile({ active: false, x: 50, y: 90, targetX: 50, targetY: 10 });
    wordPointer.current = 0;
    audio.playPop();
    nextShooterTask();
  };

  const nextShooterTask = () => {
    if (allWords.length === 0) return;
    const target = allWords[wordPointer.current % allWords.length];
    wordPointer.current += 1;
    setTargetWord(target);

    // Spawn 4 sky balloons on high row
    spawnSkyBalloons(target);
    try { audio.speak(target.text); } catch (e) {}
  };

  const spawnSkyBalloons = (target: WordItem) => {
    const wrongTranslations = allWords
      .filter(w => w.text !== target.text)
      .map(w => w.translation);
    const shuffledWrong = [...wrongTranslations].sort(() => Math.random() - 0.5).slice(0, 3);

    const matchPool = [
      { text: target.translation, isCorrect: true },
      ...shuffledWrong.map(t => ({ text: t, isCorrect: false }))
    ].sort(() => Math.random() - 0.5);

    const configured = matchPool.map((p, idx) => {
      return {
        id: `ball-${idx}-${Date.now()}`,
        translation: p.text,
        isCorrect: p.isCorrect,
        x: 15 + idx * 22 + Math.random() * 4,
        y: 18 + Math.random() * 10,
        vx: (Math.random() - 0.5) * 0.4, // micro gentle breeze drift
        color: bubbleGradients[idx % bubbleGradients.length],
        size: 56
      } as SkyBalloon;
    });

    setBalloons(configured);
  };

  // Game physical flight ticking
  useEffect(() => {
    if (gameState !== 'PLAYING') {
      if (engineTimer.current) clearInterval(engineTimer.current);
      return;
    }

    engineTimer.current = setInterval(() => {
      // 1. Gently drift sky balloons back/forth
      setBalloons(curr => curr.map(b => {
        let nextX = b.x + b.vx;
        let nextVx = b.vx;
        if (nextX <= 10 || nextX >= 90) {
          nextVx = -b.vx;
        }
        return { ...b, x: nextX, vx: nextVx };
      }));

      // 2. Animate flying projectile
      setProjectile(p => {
        if (!p.active) return p;

        // Calculate travel steps
        const dx = p.targetX - p.x;
        const dy = p.targetY - p.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 5) {
          // Point of target reaches! Match evaluation
          resolveBalloonCollision(p.targetX, p.targetY);
          return { ...p, active: false, x: 50, y: 90 };
        }

        // Travel 15% closer per step
        return {
          ...p,
          x: p.x + dx * 0.22,
          y: p.y + dy * 0.22
        };
      });

    }, 50);

    return () => {
      if (engineTimer.current) clearInterval(engineTimer.current);
    };
  }, [gameState, balloons]);

  const resolveBalloonCollision = (targetX: number, targetY: number) => {
    // Determine closest balloon to the targeted vector
    let closest: SkyBalloon | null = null;
    let minDist = 999;

    balloons.forEach(b => {
      const dist = Math.sqrt(Math.pow(b.x - targetX, 2) + Math.pow(b.y - targetY, 2));
      if (dist < minDist) {
        minDist = dist;
        closest = b;
      }
    });

    if (closest && minDist < 15) {
      const targetB = closest as SkyBalloon;
      if (targetB.isCorrect) {
        // HIT TARGET! POP! 🎉
        audio.playSuccess();
        try { audio.speak(targetWord?.text || ''); } catch (e) {}

        // Explode
        setBalloons(curr => curr.filter(b => b.id !== targetB.id));
        setScore(s => s + 50);
        setCoinsEarned(c => c + 3);
        setXpEarned(x => x + 7);
        setAmmo(a => Math.min(15, a + 1)); // bonus ball on perfect aim

        // Next
        setTimeout(() => {
          if (wordPointer.current >= 7) {
            setGameState('WON');
            audio.playCheer();
            try { confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } }); } catch (e) {}
          } else {
            nextShooterTask();
          }
        }, 750);
      } else {
        // MATCH ERROR BOING
        audio.playError();
        setAmmo(a => {
          const nextA = a - 1;
          if (nextA <= 0) setGameState('LOST');
          return nextA;
        });
        setScore(s => Math.max(0, s - 10));
      }
    } else {
      // Shipped standard blanks
      audio.playClick();
    }
  };

  const handleShootBallAt = (targetX: number, targetY: number) => {
    if (projectile.active || gameState !== 'PLAYING') return;
    
    setAmmo(a => {
      const nextA = a - 1;
      if (nextA <= 0 && balloons.some(b => b.isCorrect)) {
        setTimeout(() => setGameState('LOST'), 1000);
      }
      return nextA;
    });

    setProjectile({
      active: true,
      x: 50,
      y: 90,
      targetX,
      targetY
    });
  };

  const claimFinish = () => {
    audio.playClick();
    onFinish(score, coinsEarned);
  };

  return (
    <div className="w-full max-w-xl mx-auto rounded-[40px] border-4 border-indigo-400 shadow-[0_32px_64px_-16px_rgba(99,102,241,0.15)] bg-gradient-to-b from-[#e0e7ff] to-[#c7d2fe] text-[#1e1b4b] overflow-hidden font-sans relative select-none">
      <h3 className="hidden">词元极光消消球</h3>

      {/* Header Bar */}
      <div className="bg-[#312e81] p-4 flex items-center justify-between border-b border-[#3730a3] text-white">
        <div className="flex items-center space-x-3">
          <button onClick={onClose} className="p-2 hover:bg-[#3730a3] rounded-xl transition-all cursor-pointer">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h4 id="shooter-title" className="font-extrabold text-[#e0e7ff] text-sm leading-none flex items-center gap-1.5">
              <span>神力彩弹消词泡</span>
              <span className="text-[9px] bg-indigo-500/35 text-indigo-200 font-extrabold px-1.5 py-0.5 rounded">Shooter</span>
            </h4>
            <span className="text-[10px] text-indigo-200 block font-bold mt-1">点击飘浮的彩弹气球，发射底下瞄准对应的单词神弹！</span>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <div className="bg-[#3730a3] px-2.5 py-1 rounded-xl font-bold flex items-center space-x-1 border border-indigo-900">
            <span>🪙</span>
            <span className="text-yellow-300">+{coinsEarned}</span>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {gameState === 'INTRO' && (
          <motion.div 
            key="intro" 
            className="p-8 py-16 text-center space-y-6 bg-gradient-to-b from-[#e0e7ff] to-[#a5b4fc]"
          >
            <div className="text-6xl animate-bounce">🎈🏹</div>
            <div className="space-y-2">
              <h4 className="text-2xl font-black text-indigo-900 tracking-tight">彩泡消词炮：瞄准发射</h4>
              <p className="text-xs text-indigo-950 font-extrabold leading-relaxed uppercase">
                彩泡满天飞，词元乐无边！空中浮动着写有各种汉字词义的泡泡气球。检查泡泡发射塔填装的英语单词。直接【触碰空中对应气球】开火发射，泡泡爆破可爆开七彩晶币！子弹是有限的哦。
              </p>
            </div>

            <button 
              onClick={startGame}
              className="w-full max-w-xs bg-gradient-to-r from-indigo-505 to-purple-500 bg-indigo-505 hover:brightness-110 border-b-4 border-indigo-700 py-3.5 rounded-[24px] text-white font-black text-sm transition-all cursor-pointer shadow-lg"
            >
              装填神弓 开炮 🏹
            </button>
          </motion.div>
        )}

        {gameState === 'PLAYING' && (
          <motion.div key="playing" className="flex flex-col relative bg-[#f8f9ff]">
            
            {/* HUD Status */}
            <div className="bg-[#1e1b4b] px-4 py-2 flex items-center justify-between text-white text-xs">
              <div className="flex items-center space-x-2.5">
                <span className="font-extrabold text-[#c7d2fe]">可用弹球:</span>
                <div className="flex space-x-0.5 text-xs">
                  {[...Array(Math.max(0, ammo))].slice(0, 10).map((_, i) => (
                    <span key={i} className="animate-pulse">🔮</span>
                  ))}
                  {ammo > 10 && <span className="font-bold text-[10px] text-indigo-300">+{ammo - 10}</span>}
                </div>
              </div>

              <div className="bg-[#312e81] px-2.5 py-0.5 rounded text-[10px] font-black uppercase text-indigo-200">
                爆球进度: {wordPointer.current - 1}/6 泡
              </div>
            </div>

            {/* SHOOTING RANGE CANVAS FIELD */}
            <div 
              onClick={(e) => {
                if (!e.currentTarget) return;
                const rect = e.currentTarget.getBoundingClientRect();
                const clickX = ((e.clientX - rect.left) / rect.width) * 100;
                const clickY = ((e.clientY - rect.top) / rect.height) * 100;
                handleShootBallAt(clickX, clickY);
              }}
              className="w-full aspect-[1.8/1] min-h-[250px] bg-gradient-to-b from-[#1e1b4b] via-[#312e81] to-[#4338ca] relative overflow-hidden px-1 border-b border-indigo-350 cursor-crosshair"
            >
              {/* Star dust space lights backdrops */}
              <div className="absolute top-2 right-4 text-[9px] font-black text-indigo-300/40 tracking-widest pointer-events-none uppercase">
                🏹 Stellar Battery (瞄击星空)
              </div>

              {/* Glowing Space Balloons */}
              {balloons.map(b => (
                <div
                  key={b.id}
                  style={{ left: `${b.x}%`, top: `${b.y}%` }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 p-1.5 rounded-full bg-gradient-to-br ${b.color} border border-white/40 flex flex-col items-center justify-center shadow-lg transition-transform duration-75 select-none pointer-events-none z-10 w-14 h-14`}
                >
                  <span className="text-[10px] font-black tracking-tight text-indigo-950 font-sans break-all pointer-events-none">
                    {b.translation}
                  </span>
                  {/* Small thread bottom circle string of balloon */}
                  <div className="w-0.5 h-3 bg-white/45 absolute bottom-[-11px]" />
                </div>
              ))}

              {/* Fly moving projectile ball */}
              {projectile.active && (
                <div 
                  className="absolute bg-gradient-to-r from-amber-400 to-yellow-300 border-2 border-yellow-200 rounded-full p-2 py-1 shadow-[0_0_12px_#fbbf24] z-20 font-black text-[9px] text-[#451a03] uppercase tracking-wide -translate-x-1/2 -translate-y-1/2"
                  style={{ left: `${projectile.x}%`, top: `${projectile.y}%` }}
                >
                  ⚡ {targetWord?.text}
                </div>
              )}

              {/* Launcher battery bottom center base (50%, 90%) */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex flex-col items-center z-15 pointer-events-none">
                
                {/* Ammo target ball preview */}
                <div className="bg-white/95 border-2 border-indigo-400 p-2 py-1.5 rounded-xl shadow-md text-center flex flex-col items-center select-all cursor-alias min-w-[110px]">
                  <span className="text-[8px] font-black text-indigo-500 tracking-wider block">LAUNCHER ENG:</span>
                  <div className="flex items-center space-x-1">
                    <span className="font-extrabold text-indigo-950 text-xs">{targetWord?.text}</span>
                    <button 
                      onClick={(e) => { e.stopPropagation(); if (targetWord) audio.speak(targetWord.text); }}
                      className="p-0.5 text-indigo-500"
                    >
                      <Volume2 size={11} />
                    </button>
                  </div>
                </div>

                {/* Star Gun Launcher Base */}
                <div className="w-16 h-8 bg-gradient-to-b from-indigo-900 to-slate-950 rounded-t-full border border-indigo-400/50 mt-1 flex items-center justify-center">
                  <div className="w-3.5 h-6 bg-cyan-400 rounded-full animate-bounce shadow-[0_0_8px_cyan] mt-[-15px]" />
                </div>
              </div>

            </div>

            {/* LOWER STATS AND TUTORIAL TIPS */}
            <div className="p-4 bg-[#f1f3ff] border-t border-indigo-100 text-[#1e1b4b] text-center space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-indigo-700 block">
                🎯 点击飘挂的目标泡泡 🎯
              </span>
              <p className="text-[11px] text-slate-500 leading-normal max-w-sm mx-auto">
                直接触摸顶端带有「 <span className="font-black text-indigo-800">{targetWord?.translation}</span> 」意义的氢气球。消灭彩弹，获取大胜。
              </p>
            </div>

          </motion.div>
        )}

        {gameState === 'WON' && (
          <motion.div 
            key="won" 
            className="p-8 py-14 text-center space-y-6 bg-gradient-to-b from-[#e0e7ff] to-[#c7d2fe]"
          >
            <div className="w-16 h-16 bg-indigo-500 text-white rounded-full flex items-center justify-center text-3xl mx-auto shadow-lg animate-bounce">
              🎆
            </div>

            <div className="space-y-1">
              <h4 className="text-3xl font-black text-indigo-800">词尊极夜射手！</h4>
              <p className="text-xs text-indigo-950 uppercase font-black leading-relaxed">
                完美的炮轰！星芒夜空中所有的干扰泡都被彻底熔炼净化！
              </p>
            </div>

            <div className="bg-indigo-100 border border-indigo-200 rounded-3xl p-5 max-w-sm mx-auto space-y-3">
              <div className="flex items-center justify-around divide-x divide-indigo-200 text-slate-800">
                <div className="text-center">
                  <span className="text-[9px] font-black text-indigo-700 block mb-1 uppercase">大消得分</span>
                  <span className="text-xl font-black text-indigo-950 tabular-nums">{score}</span>
                </div>
                <div className="text-center pl-4">
                  <span className="text-[9px] font-black text-indigo-600 block mb-1 uppercase">赏赐金币</span>
                  <span className="text-xl font-black text-amber-500 tabular-nums">+{coinsEarned}</span>
                </div>
                <div className="text-center pl-4">
                  <span className="text-[9px] font-black text-pink-600 block mb-1 uppercase">消气球XP</span>
                  <span className="text-xl font-black text-pink-700 tabular-nums">+{xpEarned} XP</span>
                </div>
              </div>
            </div>

            <button 
              onClick={claimFinish}
              className="w-full max-w-xs bg-indigo-600 hover:bg-indigo-500 border-b-4 border-indigo-800 py-3.5 rounded-[24px] text-white font-black text-sm cursor-pointer transition-colors"
            >
              清仓弹药 撤退
            </button>
          </motion.div>
        )}

        {gameState === 'LOST' && (
          <motion.div 
            key="lost" 
            className="p-8 py-14 text-center space-y-6 bg-gradient-to-b from-[#e0e7ff] to-[#c7d2fe]"
          >
            <div className="w-16 h-16 bg-rose-150 border border-rose-200 text-rose-500 rounded-full flex items-center justify-center text-3xl mx-auto animate-pulse">
              🔮
            </div>

            <div className="space-y-1 text-slate-800">
              <h4 className="text-2xl font-black text-rose-600">弹药耗尽！火力熄灭</h4>
              <p className="text-xs text-slate-500 font-extrabold uppercase leading-normal">
                打错气球过多导致备用彩弹全部耗扣。打起精神，精确校准后再点火射击吧！
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto pt-4">
              <button 
                onClick={startGame}
                className="bg-indigo-300 hover:bg-indigo-500 border-b-4 border-indigo-800 py-3 rounded-2xl text-white font-black text-xs cursor-pointer bg-indigo-500"
              >
                点火再消 (Retry)
              </button>
              <button 
                onClick={claimFinish}
                className="bg-slate-200 border border-slate-350 py-3 rounded-2xl text-slate-600 font-black text-xs cursor-pointer"
              >
                返回操场 (Leave)
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WordBubbleShooter;
