import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { WordGroup, WordItem, UserStats } from '../types';
import { 
  X, Trophy, Heart, ArrowLeft, Play, RotateCcw, Volume2, HelpCircle, 
  Zap, Compass, ShieldAlert, Sparkles, AlertTriangle, MessageSquare, Flame
} from 'lucide-react';
import audio from '../utils/AudioUtils';
import confetti from 'canvas-confetti';
import { CHARACTERS } from '../constants';

interface SpaceWordRaiderProps {
  groups: WordGroup[];
  stats: UserStats;
  onFinish: (score: number, coins: number) => void;
  onClose: () => void;
}

interface Star {
  id: string;
  x: number;
  y: number;
  size: number;
  speed: number;
}

interface AlienShip {
  id: string;
  word: WordItem;
  x: number; // 0% to 100%
  y: number; // 0% to 100%
  isBoss: boolean;
  hp: number;
  maxHp: number;
  type: 'SCOUT' | 'FIGHTER' | 'BOSS';
  speed: number;
  emoji: string;
  isHit?: boolean;
}

interface SpaceLaser {
  id: string;
  x: number;
  y: number;
  type: 'PROTON' | 'HYPER' | 'BOMB';
  targetAlienId: string;
}

interface FloatingStarScore {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
}

export const SpaceWordRaider: React.FC<SpaceWordRaiderProps> = ({ groups, stats, onFinish, onClose }) => {
  // Extract words
  const allWords = useMemo(() => {
    let list: WordItem[] = [];
    groups.forEach(g => {
      g.words.forEach(w => {
        list.push(w);
      });
    });
    if (list.length === 0) {
      list = [
        { text: 'space', translation: '太空', imageUrl: '' },
        { text: 'star', translation: '星星', imageUrl: '' },
        { text: 'laser', translation: '激光', imageUrl: '' },
        { text: 'planet', translation: '行星', imageUrl: '' }
      ];
    }
    return [...list].sort(() => Math.random() - 0.5);
  }, [groups]);

  // States
  const [gameState, setGameState] = useState<'INTRO' | 'PLAYING' | 'WON' | 'LOST'>('INTRO');
  const [score, setScore] = useState(0);
  const [coinsEarned, setCoinsEarned] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  const [shield, setShield] = useState(100); // Spaceship Shield HP (0 to 100)
  
  const [aliens, setAliens] = useState<AlienShip[]>([]);
  const [lasers, setLasers] = useState<SpaceLaser[]>([]);
  const [floatingScores, setFloatingScores] = useState<FloatingStarScore[]>([]);
  
  // Quiz
  const [currentWord, setCurrentWord] = useState<WordItem | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [spelledWord, setSpelledWord] = useState<string[]>([]);
  const [scrambledLetters, setScrambledLetters] = useState<{ id: string; letter: string; isUsed: boolean }[]>([]);
  const [gameMode, setGameMode] = useState<'CHOOSE' | 'SPELL'>('CHOOSE');
  const [wave, setWave] = useState(1);
  const [waveProgress, setWaveProgress] = useState(0); // 0 to 100%
  
  // Stars for Background parallax
  const [stars, setStars] = useState<Star[]>([]);
  
  const wordIdx = useRef(0);
  const spawnTimer = useRef<NodeJS.Timeout | null>(null);
  const mainLoop = useRef<NodeJS.Timeout | null>(null);

  const hero = useMemo(() => {
    return CHARACTERS.find(c => c.id === stats.selectedCharacterId) || CHARACTERS[0];
  }, [stats.selectedCharacterId]);

  // Generate background stars
  useEffect(() => {
    const list: Star[] = [];
    for (let i = 0; i < 40; i++) {
      list.push({
        id: `star-${i}`,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 3 + 1,
        speed: Math.random() * 1.5 + 0.5
      });
    }
    setStars(list);
  }, []);

  // Set up Word Task
  const generateNewChoice = () => {
    if (allWords.length === 0) return;
    const targetIdx = wordIdx.current % allWords.length;
    const word = allWords[targetIdx];
    wordIdx.current += 1;
    
    setCurrentWord(word);
    
    // Switch game modes randomly to keep it fresh
    const nextMode = Math.random() > 0.45 ? 'CHOOSE' : 'SPELL';
    setGameMode(nextMode);

    if (nextMode === 'CHOOSE') {
      const wrong = allWords
        .filter(w => w.text !== word.text)
        .map(w => w.translation);
      const shuffledWrong = [...wrong].sort(() => Math.random() - 0.5).slice(0, 3);
      const list = [...shuffledWrong, word.translation].sort(() => Math.random() - 0.5);
      while (list.length < 4) {
        list.push('星际光线' + Math.floor(Math.random() * 100));
      }
      setOptions(list);
    } else {
      // SPELL mode
      const chars = word.text.toLowerCase().split('');
      const alphabet = 'abcdefghijklmnopqrstuvwxyz';
      while (chars.length < Math.max(6, word.text.length + 2)) {
        const extraChar = alphabet[Math.floor(Math.random() * alphabet.length)];
        if (!chars.includes(extraChar)) chars.push(extraChar);
      }
      const scrambled = chars
        .sort(() => Math.random() - 0.5)
        .map((ch, idx) => ({ id: `${ch}-${idx}-${Date.now()}`, letter: ch, isUsed: false }));
      
      setScrambledLetters(scrambled);
      setSpelledWord([]);
    }

    try {
      audio.speak(word.text);
    } catch(e){}
  };

  const spawnAlien = () => {
    if (gameState !== 'PLAYING') return;

    // Word item selection
    const wordItem = allWords[Math.floor(Math.random() * allWords.length)];
    if (!wordItem) return;

    // Check if spawning boss
    const isBoss = waveProgress >= 90 && !aliens.some(a => a.isBoss);
    
    let type: 'SCOUT' | 'FIGHTER' | 'BOSS' = 'SCOUT';
    let emoji = '🛸';
    let hp = 30;
    let speed = 0.5 + Math.random() * 0.5;

    if (isBoss) {
      type = 'BOSS';
      emoji = '👾';
      hp = 250;
      speed = 0.15;
    } else if (Math.random() > 0.6) {
      type = 'FIGHTER';
      emoji = '🛰️';
      hp = 60;
      speed = 0.4;
    }

    // Scale via waves
    hp = Math.floor(hp * (1 + wave * 0.2));
    speed = speed * (1 + wave * 0.1);

    const alien: AlienShip = {
      id: `alien-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      word: wordItem,
      x: 10 + Math.random() * 80, // stay clear of margins
      y: 10,
      isBoss,
      hp,
      maxHp: hp,
      type,
      speed,
      emoji
    };

    setAliens(prev => [...prev, alien]);
  };

  const triggerFloat = (text: string, x: number, y: number, color = 'text-green-400') => {
    const id = `fl-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    setFloatingScores(prev => [...prev, { id, text, x, y, color }]);
    setTimeout(() => {
      setFloatingScores(prev => prev.filter(item => item.id !== id));
    }, 1200);
  };

  const startSpaceGame = () => {
    setGameState('PLAYING');
    setScore(0);
    setCoinsEarned(0);
    setXpEarned(0);
    setShield(100);
    setAliens([]);
    setLasers([]);
    setFloatingScores([]);
    setWave(1);
    setWaveProgress(0);
    wordIdx.current = 0;
    
    audio.playPop();
    generateNewChoice();
  };

  useEffect(() => {
    if (gameState !== 'PLAYING') {
      if (spawnTimer.current) clearInterval(spawnTimer.current);
      if (mainLoop.current) clearInterval(mainLoop.current);
      return;
    }

    // Spawning frequency linked to wave progression
    spawnTimer.current = setInterval(() => {
      setWaveProgress(p => {
        const next = Math.min(100, p + 8);
        if (next < 95) {
          spawnAlien();
        }
        return next;
      });
    }, 4500);

    // Main Engine Loop
    mainLoop.current = setInterval(() => {
      // 1. Parallax starry drift
      setStars(prev => prev.map(s => {
        let nextY = s.y + s.speed;
        if (nextY > 100) nextY = 0;
        return { ...s, y: nextY };
      }));

      // 2. Drive Drones / Alien ships downwards
      setAliens(prev => {
        const updated = prev.map(a => {
          const nextY = a.y + a.speed;
          return { ...a, y: nextY };
        });

        // If alien breaches bottom boundary, hit player shields!
        const breaching = updated.filter(a => a.y >= 88);
        if (breaching.length > 0) {
          setShield(s => {
            const hitVal = breaching.reduce((acc, current) => acc + (current.isBoss ? 50 : 20), 0);
            const nextShield = Math.max(0, s - hitVal);
            if (nextShield <= 0) {
              setGameState('LOST');
              audio.playError();
            }
            return nextShield;
          });

          breaching.forEach(a => {
            audio.playError();
            triggerFloat(`💥 冲击防御壁! -${a.isBoss ? 50 : 20}`, a.x, 80, 'text-rose-500 font-extrabold');
          });
        }

        return updated.filter(a => a.y < 88);
      });

      // 3. Slide Lasers upwards
      setLasers(prevLasers => {
        const nextList = prevLasers.map(l => ({ ...l, y: l.y - 7 }));
        const currentRemaining: SpaceLaser[] = [];

        nextList.forEach(laser => {
          let hasCollided = false;

          setAliens(currentAliens => {
            const target = currentAliens.find(a => a.id === laser.targetAlienId);
            if (target && Math.abs(laser.y - target.y) < 6 && Math.abs(laser.x - target.x) < 8) {
              hasCollided = true;
              const dmg = laser.type === 'FIREBALL' ? 60 : laser.type === 'HYPER' ? 45 : 25;
              
              const damagedList = currentAliens.map(a => {
                if (a.id === target.id) {
                  const finalHp = Math.max(0, a.hp - dmg);
                  const dead = finalHp <= 0;

                  if (dead) {
                    audio.playCoin();
                    setScore(s => s + (a.isBoss ? 500 : 80));
                    setCoinsEarned(c => c + (a.isBoss ? 25 : 3));
                    setXpEarned(x => x + (a.isBoss ? 60 : 6));
                    
                    triggerFloat(a.isBoss ? '👾 斩杀领主! +500 XP' : '🛸 击毁! +80 XP', a.x, a.y, 'text-yellow-400 font-black text-sm');

                    if (a.isBoss) {
                      setTimeout(() => {
                        handleVictory();
                      }, 500);
                    }
                  } else {
                    triggerFloat(`-${dmg}`, a.x, a.y - 4, 'text-cyan-400 font-bold');
                  }

                  return { ...a, hp: finalHp, isHit: true };
                }
                return a;
              });

              setTimeout(() => {
                setAliens(p => p.map(alien => alien.id === target.id ? { ...alien, isHit: false } : alien));
              }, 120);

              return damagedList.filter(a => a.hp > 0);
            }
            return currentAliens;
          });

          if (!hasCollided && laser.y > 0) {
            currentRemaining.push(laser);
          }
        });

        return currentRemaining;
      });

    }, 70);

    return () => {
      if (spawnTimer.current) clearInterval(spawnTimer.current);
      if (mainLoop.current) clearInterval(mainLoop.current);
    };
  }, [gameState, wave, waveProgress]);

  const handleVictory = () => {
    setGameState('WON');
    audio.playCheer();
    try {
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.55 }
      });
    } catch(e){}
  };

  const fireLaserCannon = (laserType: 'PROTON' | 'HYPER' | 'BOMB') => {
    setAliens(current => {
      // Find closest alien starting from below (largest y)
      const target = [...current].sort((a,b) => b.y - a.y)[0];
      if (target) {
        const id = `laser-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        setLasers(prev => [...prev, {
          id,
          x: 50, // Spaceship is always centered at x = 50%
          y: 83,
          type: laserType,
          targetAlienId: target.id
        }]);
      }
      return current;
    });
  };

  const handleChoiceAnswer = (selected: string) => {
    if (!currentWord) return;

    if (selected === currentWord.translation) {
      audio.playSuccess();
      try { audio.speak(currentWord.text); } catch(e){}

      // Fire powerful rapid laser streak
      fireLaserCannon('HYPER');
      setTimeout(() => fireLaserCannon('HYPER'), 100);
      
      triggerFloat('✨ 能量涌动! 双发激光!', 50, 75, 'text-emerald-400 font-extrabold animate-pulse');
      
      setScore(s => s + 20);
      setCoinsEarned(c => c + 1);
      setXpEarned(x => x + 2);

      generateNewChoice();
    } else {
      audio.playError();
      triggerFloat('❌ 频率错位! 开火失败!', 50, 75, 'text-rose-500 font-bold');
      setScore(s => Math.max(0, s - 10));
    }
  };

  const handleSpellLetter = (letterItem: { id: string; letter: string; isUsed: boolean }) => {
    if (!currentWord) return;

    const nextIdx = spelledWord.length;
    const required = currentWord.text.toLowerCase().charAt(nextIdx);

    if (letterItem.letter === required) {
      audio.playPop();
      const updatedSpell = [...spelledWord, letterItem.letter];
      setSpelledWord(updatedSpell);
      
      setScrambledLetters(prev => prev.map(item => item.id === letterItem.id ? { ...item, isUsed: true } : item));
      
      // Fire small proton shell on each typed character
      fireLaserCannon('PROTON');

      if (updatedSpell.join('') === currentWord.text.toLowerCase()) {
        audio.playSuccess();
        try { audio.speak(currentWord.text); } catch(e){}
        
        // Massive antimatter spell bomb! Hits hard
        fireLaserCannon('BOMB');
        setTimeout(() => fireLaserCannon('HYPER'), 120);

        triggerFloat('🔮 终极拼读爆发: 轰天词能弹!', 50, 75, 'text-purple-400 font-black');

        setScore(s => s + 50);
        setCoinsEarned(c => c + 3);
        setXpEarned(x => x + 5);

        setTimeout(() => {
          generateNewChoice();
        }, 1100);
      }
    } else {
      audio.playError();
      triggerFloat('💥 电磁火花! 字符拼错', 50, 75, 'text-rose-400 font-bold');
      setScore(s => Math.max(0, s - 5));
    }
  };

  const handleRestartSpell = () => {
    setSpelledWord([]);
    setScrambledLetters(prev => prev.map(item => ({ ...item, isUsed: false })));
  };

  const finishGameClaim = () => {
    audio.playClick();
    onFinish(score, coinsEarned);
  };

  return (
    <div className="w-full max-w-xl mx-auto rounded-[40px] border-4 border-indigo-600/40 shadow-[0_32px_64px_-16px_rgba(30,58,138,0.2)] bg-[#030712] text-white overflow-hidden font-sans relative">
      
      {/* HUD Bar */}
      <h3 className="hidden">雷电词皇太空白刃战</h3>
      <div className="bg-[#090d16] p-4 flex items-center justify-between border-b border-indigo-900/40 relative z-30">
        <div className="flex items-center space-x-3">
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-900/80 rounded-xl transition-colors cursor-pointer text-slate-400 hover:text-white"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h4 id="raiden-game-title" className="font-extrabold text-sm text-indigo-400 tracking-tight flex items-center gap-1.5 leading-none">
              <span>雷电词皇 · 空战</span>
              <span className="text-[9px] bg-indigo-500/20 text-indigo-300 font-black px-1.5 py-0.5 rounded border border-indigo-500/30">Raiden Mode</span>
            </h4>
            <span className="text-[10px] text-slate-500 font-bold mt-1 block">霓虹星战：回答单词充能激光炮</span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="bg-[#0b1329] border border-indigo-950 px-2.5 py-1.5 rounded-2xl flex items-center space-x-1">
            <span className="text-yellow-400 text-xs">🪙</span>
            <span className="font-black text-xs tabular-nums text-yellow-200">+{coinsEarned}</span>
          </div>
          <div className="bg-[#0b1329] border border-indigo-950 px-2.5 py-1.5 rounded-2xl flex items-center space-x-1">
            <span className="text-cyan-400 text-xs">⚡</span>
            <span className="font-black text-xs tabular-nums text-cyan-200">+{xpEarned} XP</span>
          </div>
          <button 
            onClick={onClose}
            className="p-2 bg-rose-500/10 hover:bg-rose-500/25 border border-rose-500/20 rounded-xl text-rose-400 transition-colors cursor-pointer"
          >
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
            className="p-8 py-16 text-center space-y-8 bg-[#030712] relative overflow-hidden"
          >
            {/* Ambient retro glowing grid background */}
            <div className="absolute inset-0 bg-retro-grid opacity-15 pointer-events-none" />
            
            <div className="relative inline-block">
              <span className="text-6xl block select-none drop-shadow-[0_8px_16px_rgba(99,102,241,0.5)] animate-pulse">🚀</span>
              <span className="text-3xl absolute -top-2 -right-2 block select-none">🛸</span>
            </div>

            <div className="space-y-3 max-w-sm mx-auto relative z-10">
              <h4 id="raiden-intro-title" className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 tracking-tight leading-none">太空港防卫：霓虹战纪</h4>
              <p className="text-xs text-slate-400 uppercase font-black leading-relaxed tracking-wider">
                答对英文单词/释义可以为雷霆战舰充能，发射质子重炮气化坠落敌军。最终波次击毁「极道词霸母舰」即可夺取星际结晶！
              </p>
            </div>

            <div className="p-4 bg-indigo-950/20 border border-indigo-900/30 rounded-3xl max-w-sm mx-auto text-left flex items-start space-x-3 relative z-10">
              <ShieldAlert size={18} className="text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] font-black text-indigo-300 uppercase tracking-widest block mb-1">星际守则 (COSMIC PROTOCOLS)</span>
                <p className="text-[11px] font-bold text-slate-400 leading-normal">
                  选择汉语对应释义可迅速倾泻轻型激光束。使用英文字母正确拼写则可积蓄原子暗能炮！双向切换，克敌机先！
                </p>
              </div>
            </div>

            <div className="space-y-4 pt-4 relative z-10">
              <button 
                onClick={startSpaceGame}
                className="w-full max-w-xs bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:brightness-110 active:scale-98 border-b-4 border-indigo-700 active:border-b-0 py-4 rounded-[24px] text-white font-black text-base transition-all flex items-center justify-center space-x-2.5 cursor-pointer shadow-[0_8px_24px_rgba(99,102,241,0.3)]"
              >
                <span>进入作战空间战位 🚀</span>
              </button>
              <button 
                onClick={onClose}
                className="text-xs font-black uppercase text-slate-600 hover:text-slate-400 transition-colors"
              >
                拒绝空战
              </button>
            </div>
          </motion.div>
        )}

        {gameState === 'PLAYING' && (
          <motion.div key="playing" className="flex flex-col relative bg-[#030712] z-10">
            
            {/* Secondary Header: Shield & Mission process */}
            <div className="bg-[#060912]/90 px-4 py-2.5 flex items-center justify-between border-b border-indigo-950 text-xs">
              <div className="flex items-center space-x-2.5">
                <span className="font-extrabold text-slate-400 shrink-0">护盾 (Energy Shields):</span>
                <div className="w-24 bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800 flex items-center relative">
                  <div 
                    className="bg-indigo-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${shield}%` }}
                  />
                </div>
                <span className="text-[10px] font-black tracking-tight text-indigo-300 tabular-nums">{shield}%</span>
              </div>

              {/* Boss/Mission Wave state */}
              <div className="flex items-center space-x-3 max-w-[140px] flex-1 justify-end">
                <span className="font-extrabold text-pink-400 shrink-0 tracking-tight">星际雷达:</span>
                <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800 flex items-center relative">
                  <div 
                    className="bg-pink-500 h-full rounded-full transition-all duration-300" 
                    style={{ width: `${waveProgress}%` }}
                  />
                </div>
                <span className="text-[10px] font-black text-pink-300 shrink-0 uppercase tabular-nums">
                  {waveProgress >= 90 ? 'BOSS波' : `${Math.floor(waveProgress)}%`}
                </span>
              </div>
            </div>

            {/* SPACESHIP RADAR BATTLEFIELD STAGED SCREEN */}
            <div className="w-full aspect-[2/1] min-h-[230px] bg-[#020510] border-b border-indigo-950/60 relative overflow-hidden px-1">
              
              {/* Dynamic canvas stars parallax movement */}
              {stars.map(s => (
                <div 
                  key={s.id}
                  className="absolute bg-white/60 rounded-full shrink-0"
                  style={{ 
                    left: `${s.x}%`, 
                    top: `${s.y}%`, 
                    width: `${s.size}px`, 
                    height: `${s.size}px` 
                  }}
                />
              ))}

              {/* Render Enemy Alien drones */}
              {aliens.map(a => {
                const hpPct = (a.hp / a.maxHp) * 100;
                return (
                  <motion.div
                    key={a.id}
                    style={{ left: `${a.x}%`, top: `${a.y}%` }}
                    animate={a.isHit ? { scale: [1.2, 0.9, 1] } : {}}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 select-none z-10 flex flex-col items-center ${a.isBoss ? '-mt-6' : ''}`}
                  >
                    {/* Health meter standard */}
                    <div className={`${a.isBoss ? 'w-20' : 'w-10'} h-1.5 bg-slate-950 rounded border border-indigo-900/50 overflow-hidden mb-1 shadow shrink-0`}>
                      <div 
                        className={`h-full rounded ${hpPct > 55 ? 'bg-indigo-400' : 'bg-pink-500'}`}
                        style={{ width: `${hpPct}%` }}
                      />
                    </div>

                    <div className="text-center relative">
                      <span className={`${a.isBoss ? 'text-4xl' : 'text-xl'} block animate-bounce filter drop-shadow-[0_4px_8px_rgba(99,102,241,0.4)]`}>
                        {a.emoji}
                      </span>

                      {/* Attached Clue label on outer edge */}
                      <div className="absolute top-[102%] left-1/2 -translate-x-1/2 bg-slate-950/90 text-[7.5px] font-black text-slate-300 px-1.5 py-0.5 rounded border border-indigo-900/40 w-[60px] truncate leading-none shrink-0 text-center uppercase tracking-tighter">
                        {a.word.text}
                      </div>
                    </div>
                  </motion.div>
                );
              })}

              {/* Render player battleship gun centered below */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-center scale-95 duration-150 relative z-20">
                <motion.div 
                  animate={{ y: [-2, 1, -2] }}
                  transition={{ repeat: Infinity, duration: 1.8 }}
                  className="text-3xl relative"
                >
                  🚀
                  {/* Fire exhaust spark animate */}
                  <span className="absolute top-full left-1/2 -translate-x-1/2 text-[9px] block shrink-0 select-none animate-ping text-indigo-400">🔥</span>
                </motion.div>
                
                {/* Visual command character label */}
                <div className="bg-indigo-950/80 border border-indigo-800 px-2 py-0.5 rounded-full text-[8px] font-black text-indigo-300 tracking-wider inline-block scale-90 whitespace-nowrap mt-2">
                  {hero.avatar} {hero.name} 词核重巡
                </div>
              </div>

              {/* Render flying Lasers */}
              {lasers.map(l => {
                const laserColor = l.type === 'BOMB' ? 'from-purple-400 to-pink-500' : l.type === 'HYPER' ? 'from-cyan-400 to-blue-500' : 'from-indigo-400 to-indigo-500';
                return (
                  <motion.div
                    key={l.id}
                    className="absolute -translate-x-1/2 pointer-events-none select-none z-15 shrink-0"
                    style={{ left: `${l.x}%`, top: `${l.y}%` }}
                  >
                    <div className={`w-1 h-6 bg-gradient-to-b ${laserColor} rounded-full filter blur-[1.2px] animate-pulse`} />
                  </motion.div>
                );
              })}

              {/* Render Floating Texts scores */}
              <AnimatePresence>
                {floatingScores.map(f => (
                  <motion.div
                    key={f.id}
                    initial={{ opacity: 0, y: 15, scale: 0.8 }}
                    animate={{ opacity: 1, y: -25, scale: 1.15 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1 }}
                    className={`absolute pointer-events-none select-none text-[11px] font-black ${f.color} drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] z-45`}
                    style={{ left: `${f.x}%`, top: `${f.y}%` }}
                  >
                    {f.text}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* LOWER COGNITIVE ACTION AREA */}
            <div className="p-6 bg-[#060912] space-y-5 border-t border-indigo-950 relative z-30">
              {currentWord ? (
                <div className="space-y-4">
                  
                  {/* Task Clue Banner */}
                  <div className="text-center space-y-1">
                    <span className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-extrabold text-[10px] uppercase tracking-[0.15em] px-2.5 py-0.5 rounded-full inline-block">
                      {gameMode === 'CHOOSE' ? '极速释义充能 Proton Shot' : '拼写核晶校正 Matter Bomb'}
                    </span>
                    
                    <div className="flex items-center justify-center space-x-2">
                      <h4 id="space-task-word-header" className="text-2xl font-black text-white tracking-tight">
                        {gameMode === 'CHOOSE' ? currentWord.text : `「 ${currentWord.translation} 」`}
                      </h4>
                      <button 
                        onClick={() => { audio.speak(currentWord.text); }}
                        className="p-1.5 hover:bg-slate-950 rounded-lg text-indigo-400 hover:text-indigo-300 transition-colors"
                      >
                        <Volume2 size={15} />
                      </button>
                    </div>

                    <p className="text-[10px] font-extrabold text-slate-500 uppercase mt-1 leading-none">
                      {gameMode === 'CHOOSE' ? '提供正确汉语释义，发射超负荷激光' : '重组下方星际符文，拼出完整拼音单词'}
                    </p>
                  </div>

                  {/* Mode A: Choose Translation options */}
                  {gameMode === 'CHOOSE' && (
                    <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
                      {options.map((opt, id) => (
                        <motion.button
                          key={id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleChoiceAnswer(opt)}
                          className="p-3.5 bg-[#090e1f] hover:bg-[#111836] active:bg-indigo-900 border-2 border-indigo-950 active:border-indigo-500 rounded-2xl text-xs font-black text-slate-100 transition-all flex items-center justify-center space-x-1.5 cursor-pointer shadow-md select-none"
                        >
                          <span className="text-base">🚀</span>
                          <span>{opt}</span>
                        </motion.button>
                      ))}
                    </div>
                  )}

                  {/* Mode B: Spelling letter clicks */}
                  {gameMode === 'SPELL' && (
                    <div className="space-y-4 max-w-sm mx-auto">
                      
                      {/* Current Spelled Display deck */}
                      <div className="flex items-center justify-center space-x-1.5 min-h-[46px] bg-[#020510] border border-indigo-950/60 p-2 rounded-2xl">
                        {spelledWord.length === 0 ? (
                          <span className="text-[10.5px] font-extrabold text-indigo-500/60 tracking-wider">校正星际核晶...</span>
                        ) : (
                          spelledWord.map((letter, idx) => (
                            <motion.span
                              key={idx}
                              initial={{ scale: 0.7, y: 5 }}
                              animate={{ scale: 1, y: 0 }}
                              className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-white font-black flex items-center justify-center text-sm border-b-2 border-indigo-700 uppercase"
                            >
                              {letter}
                            </motion.span>
                          ))
                        )}
                        
                        {spelledWord.length > 0 && (
                          <button
                            onClick={handleRestartSpell}
                            className="ml-2 p-1.5 bg-slate-900 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
                            title="Reset code"
                          >
                            <RotateCcw size={12} />
                          </button>
                        )}
                      </div>

                      {/* Scrambled alphabet letter triggers */}
                      <div className="flex flex-wrap items-center justify-center gap-2">
                        {scrambledLetters.map((obj) => (
                          <motion.button
                            key={obj.id}
                            disabled={obj.isUsed}
                            whileHover={obj.isUsed ? {} : { scale: 1.1 }}
                            whileTap={obj.isUsed ? {} : { scale: 0.9 }}
                            onClick={() => handleSpellLetter(obj)}
                            className={`w-9 h-9 rounded-full font-black text-xs uppercase transition-all shadow ${
                              obj.isUsed 
                                ? 'bg-slate-950 text-slate-800 border border-transparent scale-90 opacity-30 cursor-not-allowed' 
                                : 'bg-gradient-to-br from-indigo-600 to-pink-600 hover:brightness-110 active:from-yellow-400 active:to-yellow-550 text-white border-2 border-white/10 cursor-pointer'
                            }`}
                          >
                            {obj.letter}
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              ) : (
                <div className="py-6 text-center text-slate-500">正在链接超空间雷达...</div>
              )}
            </div>

          </motion.div>
        )}

        {gameState === 'WON' && (
          <motion.div 
            key="won"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="p-8 text-center space-y-6 py-14 bg-[#030712] relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-retro-grid opacity-10 pointer-events-none" />
            
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center text-3xl mx-auto shadow-[0_8px_24px_rgba(245,158,11,0.4)] animate-bounce relative z-10">
              🏆
            </div>

            <div className="space-y-1 relative z-10">
              <h4 id="victory-space-title" className="text-3xl font-black text-[#818cf8]">星战奇迹之战：大捷！</h4>
              <p className="text-xs text-slate-400 uppercase font-bold leading-relaxed">
                全域敌舰悉数摧毁！奥木太空秩序在此恢复重构！
              </p>
            </div>

            <div className="bg-indigo-950/15 border border-indigo-900/30 rounded-3xl p-5 max-w-sm mx-auto space-y-4 relative z-10">
              <div className="flex items-center justify-around divide-x divide-indigo-900/40">
                <div className="text-center">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">星战总分</span>
                  <span className="text-xl font-black text-white tabular-nums">{score}</span>
                </div>
                <div className="text-center pl-4">
                  <span className="text-[10px] font-black text-yellow-400 uppercase tracking-widest block mb-1">能量契约币 (Coins)</span>
                  <span className="text-xl font-black text-yellow-200 tabular-nums">+{coinsEarned}</span>
                </div>
                <div className="text-center pl-4">
                  <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest block mb-1">角色经验 (XP)</span>
                  <span className="text-xl font-black text-cyan-300 tabular-nums">+{xpEarned}</span>
                </div>
              </div>

              <p className="text-[10.5px] font-bold text-slate-500 leading-normal border-t border-indigo-900/30 pt-3">
                你为终极契约勇者再次累积了高级战斗素质！可在 [魔法商店] 兑换更多高阶英豪圣遗物与宠物。
              </p>
            </div>

            <div className="relative z-10 pt-4">
              <button 
                onClick={finishGameClaim}
                className="w-full max-w-xs bg-indigo-500 hover:bg-indigo-600 border-b-4 border-indigo-700 py-4 rounded-[24px] text-white font-black text-sm cursor-pointer transition-colors"
              >
                收受战功，凯旋而归
              </button>
            </div>
          </motion.div>
        )}

        {gameState === 'LOST' && (
          <motion.div 
            key="lost"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="p-8 text-center space-y-6 py-14 bg-[#030712] relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-retro-grid opacity-10 pointer-events-none" />
            
            <div className="w-16 h-16 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-full flex items-center justify-center text-3xl mx-auto animate-pulse shadow-lg relative z-10">
              💀
            </div>

            <div className="space-y-1 relative z-10">
              <h4 id="space-gameover-title" className="text-2xl font-black text-rose-400">警报！护盾过载损毁！</h4>
              <p className="text-xs text-slate-400 font-extrabold uppercase leading-relaxed">
                战舰防线失守了！你需要更熟练、更迅捷的对质子重炮进行单词符文配对！
              </p>
            </div>

            <div className="bg-slate-900/40 border border-[#334155]/20 rounded-3xl p-5 text-left max-w-sm mx-auto space-y-3 relative z-10">
              <div className="flex items-center space-x-2 text-slate-300">
                <AlertTriangle size={14} className="text-yellow-400 shrink-0" />
                <span className="text-[11px] font-black">词航战术指令 (Tactic Instruction)</span>
              </div>
              <p className="text-[11px] font-bold text-slate-500 leading-normal leading-relaxed">
                拼写模式积攒大威力能量弹。如果前方航路杂波过多、速度极快，请集中点击 [重新选择] 或者通过基础词意点击快速开火净化碎屑！
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto pt-4 relative z-10">
              <button 
                onClick={startSpaceGame}
                className="bg-indigo-500 hover:bg-indigo-600 border-b-4 border-indigo-700 py-3.5 rounded-2xl text-white font-black text-xs cursor-pointer transition-colors"
              >
                重整战旗 (Retry Launch)
              </button>
              <button 
                onClick={finishGameClaim}
                className="bg-slate-900 hover:bg-slate-800 border border-slate-800 py-3.5 rounded-2xl text-slate-300 font-black text-xs cursor-pointer transition-colors"
              >
                保存残部 (Save & Retreat)
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default SpaceWordRaider;
