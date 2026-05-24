import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { WordGroup, WordItem, UserStats } from '../types';
import { 
  X, Trophy, Heart, Shield, Sword, Sparkles, 
  HelpCircle, Volume2, Flame, Play, ArrowLeft, RotateCcw, AlertTriangle, Coins, Zap
} from 'lucide-react';
import audio from '../utils/AudioUtils';
import confetti from 'canvas-confetti';
import SafeImage from './SafeImage';
import { CHARACTERS } from '../constants';

interface PlantsVsMonstersProps {
  groups: WordGroup[];
  stats: UserStats;
  onFinish: (score: number, coins: number) => void;
  onClose: () => void;
}

interface Monster {
  id: string;
  lane: number;
  word: WordItem;
  type: 'ZOMBIE' | 'GOBLIN' | 'GIANT';
  emoji: string;
  name: string;
  hp: number;
  maxHp: number;
  progress: number; // 0 to 100 representing position (100% right, 5% left)
  speed: number;
  isHit?: boolean;
}

interface Projectile {
  id: string;
  lane: number;
  x: number; // 10% (starting plant) to monster's progress
  type: 'PEA' | 'FIREBALL' | 'MELON';
  targetMonsterId: string;
}

interface FloatingText {
  id: string;
  text: string;
  x: number; // lane or position
  y: number;
  color: string;
}

export const PlantsVsMonsters: React.FC<PlantsVsMonstersProps> = ({ groups, stats, onFinish, onClose }) => {
  // Extract all available words
  const allWords = useMemo(() => {
    let list: WordItem[] = [];
    groups.forEach(g => {
      g.words.forEach(w => {
        list.push(w);
      });
    });
    // Fallback if empty
    if (list.length === 0) {
      list = [
        { text: 'cat', translation: '猫', imageUrl: '' },
        { text: 'dog', translation: '狗', imageUrl: '' },
        { text: 'bad', translation: '坏的', imageUrl: '' },
        { text: 'red', translation: '红色的', imageUrl: '' }
      ];
    }
    // Shuffle and slice to 15 max
    return [...list].sort(() => Math.random() - 0.5);
  }, [groups]);

  // Game States
  const [gameState, setGameState] = useState<'INTRO' | 'PLAYING' | 'WON' | 'LOST'>('INTRO');
  const [score, setScore] = useState(0);
  const [coinsEarned, setCoinsEarned] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  const [hearts, setHearts] = useState(5);
  const [monstersDefeated, setMonstersDefeated] = useState(0);
  const [wave, setWave] = useState(1);
  const [totalMonstersInWave] = useState(12);

  // Gameplay lists
  const [monsters, setMonsters] = useState<Monster[]>([]);
  const [projectiles, setProjectiles] = useState<Projectile[]>([]);
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);

  // Current Card Challenge states
  const [currentWord, setCurrentWord] = useState<WordItem | null>(null);
  const [challengeMode, setChallengeMode] = useState<'SPELLING' | 'MEANING'>('MEANING');
  
  // MCQ Options for meaning
  const [meaningOptions, setMeaningOptions] = useState<string[]>([]);
  
  // Scrambled letters for spelling
  const [scrambledLetters, setScrambledLetters] = useState<{ id: string; letter: string; isUsed: boolean }[]>([]);
  const [spelledWord, setSpelledWord] = useState<string[]>([]);

  // Track monster spawn timer
  const monsterSpawnTimer = useRef<NodeJS.Timeout | null>(null);
  const gameLoopTimer = useRef<NodeJS.Timeout | null>(null);
  const usedWordsIdx = useRef(0);

  // Active User character
  const hero = useMemo(() => {
    return CHARACTERS.find(c => c.id === stats.selectedCharacterId) || CHARACTERS[0];
  }, [stats.selectedCharacterId]);

  // Pet buddy if available
  const activePet = useMemo(() => {
    return stats.pets && stats.pets.length > 0 ? stats.pets[0] : null;
  }, [stats.pets]);

  const petEmoji = activePet ? (activePet.type === 'DRAGON' ? '🐲' : activePet.type === 'CAT' ? '🐱' : activePet.type === 'OWL' ? '🦉' : '💧') : '🐾';

  // Spawn monster
  const spawnMonster = () => {
    if (gameState !== 'PLAYING') return;
    
    // Choose a random word
    const wordItem = allWords[Math.floor(Math.random() * allWords.length)];
    if (!wordItem) return;

    // Pick a lane (0, 1, or 2)
    const lane = Math.floor(Math.random() * 3);

    // Pick monster type
    const rand = Math.random();
    let type: 'ZOMBIE' | 'GOBLIN' | 'GIANT' = 'ZOMBIE';
    let emoji = '🧟';
    let name = '食词僵尸';
    let hp = 40;
    let speed = 0.5 + Math.random() * 0.4; // Base speed

    if (rand > 0.75) {
      type = 'GIANT';
      emoji = '👿';
      name = '呆呆独眼巨人';
      hp = 90;
      speed = 0.3; // Very slow
    } else if (rand > 0.45) {
      type = 'GOBLIN';
      emoji = '👺';
      name = '语法小邪灵';
      hp = 25;
      speed = 1.0; // Speedy!
    }

    // Scale difficulty slightly with wave
    hp = Math.floor(hp * (1 + wave * 0.15));
    speed = speed * (1 + wave * 0.1);

    const newMonster: Monster = {
      id: `m-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      lane,
      word: wordItem,
      type,
      emoji,
      name,
      hp,
      maxHp: hp,
      progress: 95, // Spawn right side
      speed
    };

    setMonsters(prev => [...prev, newMonster]);
  };

  // Next Word Task Generator
  const generateNewTask = () => {
    if (allWords.length === 0) return;
    
    // Select index
    const targetIdx = usedWordsIdx.current % allWords.length;
    const word = allWords[targetIdx];
    usedWordsIdx.current += 1;
    
    setCurrentWord(word);
    
    // Choose mode randomly (50% meaning, 50% spelling)
    const mode = Math.random() > 0.5 ? 'SPELLING' : 'MEANING';
    setChallengeMode(mode);

    if (mode === 'MEANING') {
      // Pick 3 random wrong options
      const wrongTranslationList = allWords
        .filter(w => w.text !== word.text)
        .map(w => w.translation);
      
      const shuffledWrong = [...wrongTranslationList].sort(() => Math.random() - 0.5).slice(0, 3);
      const options = [...shuffledWrong, word.translation].sort(() => Math.random() - 0.5);
      
      // Ensure we always have 4 unique options
      while (options.length < 4) {
        options.push('草地魔法' + Math.floor(Math.random() * 50));
      }

      setMeaningOptions(options);
    } else {
      // SPELLING mode
      const wordLetters = word.text.toLowerCase().split('');
      // Add a couple of random extra decoy letters to space/scramble, up to total count
      const alphabet = 'abcdefghijklmnopqrstuvwxyz';
      while (wordLetters.length < Math.max(6, word.text.length + 2)) {
        const randomChar = alphabet[Math.floor(Math.random() * alphabet.length)];
        if (!wordLetters.includes(randomChar)) {
          wordLetters.push(randomChar);
        }
      }

      const letterObjects = wordLetters
        .sort(() => Math.random() - 0.5)
        .map((ch, idx) => ({
          id: `letter-${idx}-${Date.now()}`,
          letter: ch,
          isUsed: false
        }));

      setScrambledLetters(letterObjects);
      setSpelledWord([]);
    }

    // Automatically speak word in some cases to prompt listening
    if (audio) {
      setTimeout(() => {
        try { audio.speak(word.text); } catch(e){}
      }, 500);
    }
  };

  // Setup loop
  const startGame = () => {
    setGameState('PLAYING');
    setScore(0);
    setCoinsEarned(0);
    setXpEarned(0);
    setHearts(5);
    setMonstersDefeated(0);
    setWave(1);
    setMonsters([]);
    setProjectiles([]);
    setFloatingTexts([]);
    usedWordsIdx.current = 0;
    
    audio.playPop();
    generateNewTask();
  };

  // Spawns and Ticks
  useEffect(() => {
    if (gameState !== 'PLAYING') {
      if (monsterSpawnTimer.current) clearInterval(monsterSpawnTimer.current);
      if (gameLoopTimer.current) clearInterval(gameLoopTimer.current);
      return;
    }

    // Spawn zombie every 5.5s (speeds up as wave increases)
    const spawnRate = Math.max(2800, 6000 - wave * 600);
    monsterSpawnTimer.current = setInterval(() => {
      spawnMonster();
    }, spawnRate);

    // Game loop running every 100ms
    gameLoopTimer.current = setInterval(() => {
      // 1. Move Monsters towards left
      setMonsters(prev => {
        const nextList = prev.map(m => {
          const nextProgress = m.progress - m.speed;
          return { ...m, progress: nextProgress };
        });

        // Check if any monster breaks the defense line (progress <= 5)
        const leaked = nextList.filter(m => m.progress <= 5);
        if (leaked.length > 0) {
          setHearts(h => {
            const nextH = h - leaked.length;
            if (nextH <= 0) {
              setGameState('LOST');
              audio.playError();
            }
            return Math.max(0, nextH);
          });
          
          // Trigger floating popup at home base
          leaked.forEach(m => {
            audio.playError();
            triggerFloatingText('❤️ -1', 5, 30 + m.lane * 25, 'text-rose-500 font-extrabold');
          });
        }

        return nextList.filter(m => m.progress > 5);
      });

      // 2. Move Projectiles and resolve collisions with Monsters in one loop
      setProjectiles(prevProjectiles => {
        const updatedProj = prevProjectiles.map(p => ({ ...p, x: p.x + 8 }));
        const remainingProj: Projectile[] = [];

        updatedProj.forEach(p => {
          let collided = false;
          
          setMonsters(currentMonsters => {
            const targetM = currentMonsters.find(m => m.id === p.targetMonsterId);
            if (targetM && Math.abs(p.x - targetM.progress) < 7) {
              collided = true;
              
              // Calculate Damage
              const dmg = p.type === 'FIREBALL' ? 50 : p.type === 'MELON' ? 35 : 20;
              
              const updated = currentMonsters.map(m => {
                if (m.id === targetM.id) {
                  const remainsHp = Math.max(0, m.hp - dmg);
                  const isKilled = remainsHp <= 0;
                  
                  if (isKilled) {
                    audio.playCoin();
                    setMonstersDefeated(count => {
                      const newCount = count + 1;
                      setCoinsEarned(c => c + (m.type === 'GIANT' ? 10 : m.type === 'GOBLIN' ? 5 : 4));
                      setXpEarned(x => x + (m.type === 'GIANT' ? 25 : m.type === 'GOBLIN' ? 12 : 8));
                      setScore(s => s + (m.type === 'GIANT' ? 150 : m.type === 'GOBLIN' ? 80 : 50));
                      if (newCount >= totalMonstersInWave) {
                        handleVictory();
                      }
                      return newCount;
                    });
                    triggerFloatingText(`💥 击败! +${m.type === 'GIANT' ? '150' : '50'} XP`, targetM.progress, 20 + targetM.lane * 25, 'text-yellow-400 font-black');
                  } else {
                    triggerFloatingText(`-${dmg}`, targetM.progress, 25 + targetM.lane * 25, 'text-rose-400 font-extrabold text-sm');
                  }
                  
                  return { ...m, hp: remainsHp, isHit: true };
                }
                return m;
              });

              // Auto turn off 'isHit' flash after 150ms
              const hitMonsterId = targetM.id;
              setTimeout(() => {
                setMonsters(prev => prev.map(m => m.id === hitMonsterId ? { ...m, isHit: false } : m));
              }, 150);

              return updated.filter(m => m.hp > 0);
            }
            return currentMonsters;
          });

          if (!collided && p.x < 100) {
            remainingProj.push(p);
          }
        });

        return remainingProj;
      });

    }, 80);

    // Initial first zombie fast spawn
    spawnMonster();

    return () => {
      if (monsterSpawnTimer.current) clearInterval(monsterSpawnTimer.current);
      if (gameLoopTimer.current) clearInterval(gameLoopTimer.current);
    };
  }, [gameState, wave]);

  // Create floating texts
  const triggerFloatingText = (text: string, x: number, y: number, color = 'text-green-500') => {
    const id = `f-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    setFloatingTexts(p => [...p, { id, text, x, y, color }]);
    setTimeout(() => {
      setFloatingTexts(p => p.filter(item => item.id !== id));
    }, 1000);
  };

  // Win Ceremony
  const handleVictory = () => {
    setGameState('WON');
    audio.playCheer();
    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });
    } catch(e){}
  };

  // Launch Plant Projectiles to attack foremost monsters
  const launchAttack = (laneToFire: number, bulletType: 'PEA' | 'FIREBALL' | 'MELON') => {
    // Find monsters in this lane or closest
    setMonsters(currentMonsters => {
      // Find closest monster in that specific lane, else any lane
      let targetM = currentMonsters
        .filter(m => m.lane === laneToFire)
        .sort((a, b) => a.progress - b.progress)[0]; // Closest to home (smallest progress)

      if (!targetM) {
        // Fallback: Fire at closest monster on ANY lane
        targetM = currentMonsters.sort((a, b) => a.progress - b.progress)[0];
      }

      if (targetM) {
        // Spawn actual projectile towards it
        const projId = `p-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        setProjectiles(prev => [...prev, {
          id: projId,
          lane: targetM.lane,
          x: 15,
          type: bulletType,
          targetMonsterId: targetM.id
        }]);
      }
      return currentMonsters;
    });
  };

  // Submit Answer (MEANING MATCH)
  const handleOptionSelect = (selectedTranslation: string) => {
    if (!currentWord) return;

    if (selectedTranslation === currentWord.translation) {
      // Correct!
      audio.playSuccess();
      try { audio.speak(currentWord.text); } catch (e){}

      // Attack Lane 1 & randomly another lane with standard peas
      launchAttack(1, 'PEA');
      setTimeout(() => launchAttack(Math.floor(Math.random() * 3), 'PEA'), 150);

      triggerFloatingText('🎯 意思正确！双重射击！', 20, 45, 'text-emerald-500 font-extrabold');
      
      // XP/Coin bonus
      setCoinsEarned(c => c + 1);
      setXpEarned(xp => xp + 2);
      setScore(s => s + 30);

      // Generate next word task
      generateNewTask();
    } else {
      // Incorrect translation
      audio.playError();
      triggerFloatingText('❌ 翻译有误! 伤害抵抗!', 15, 60, 'text-rose-500 font-bold');
      
      // Shake screen visually or small penalty
      setScore(s => Math.max(0, s - 10));
    }
  };

  // Click letters in spelling bee mode
  const handleLetterClick = (letterObj: { id: string; letter: string; isUsed: boolean }) => {
    if (!currentWord) return;
    
    // Check if index matches the required letter in the spelling sequence
    const nextRequiredIdx = spelledWord.length;
    const requiredLetter = currentWord.text.toLowerCase().charAt(nextRequiredIdx);

    if (letterObj.letter === requiredLetter) {
      // Correct letter tapped!
      audio.playPop();

      const newSpelled = [...spelledWord, letterObj.letter];
      setSpelledWord(newSpelled);

      // Mark letter object as used
      setScrambledLetters(prev => prev.map(item => item.id === letterObj.id ? { ...item, isUsed: true } : item));

      // Small visual blast from sunflower or current spelling plant
      launchAttack(0, 'PEA');

      // Check if full spelling complete!
      if (newSpelled.join('') === currentWord.text.toLowerCase()) {
        triggerFloatingText('🔥 成功拼写！超大瓜皮手投掷！', 20, 15, 'text-amber-500 font-black');
        audio.playSuccess();
        try { audio.speak(currentWord.text); } catch (e){}

        // Fire giant spell fireballs or melons in MULTIPLE lanes!
        launchAttack(0, 'FIREBALL');
        setTimeout(() => launchAttack(1, 'MELON'), 100);
        setTimeout(() => launchAttack(2, 'FIREBALL'), 250);

        setCoinsEarned(c => c + 3);
        setXpEarned(xp => xp + 6);
        setScore(s => s + 60);

        // Next word wait
        setTimeout(() => {
          generateNewTask();
        }, 1000);
      }
    } else {
      // Misspelled letter
      audio.playError();
      triggerFloatingText('💥 拼写字母错误！', 50, 85, 'text-rose-500 font-bold');
      
      // Small bounce/vibe penalty but don't reset all immediately
      setScore(s => Math.max(0, s - 5));
    }
  };

  const handleResetSpelling = () => {
    setSpelledWord([]);
    setScrambledLetters(prev => prev.map(item => ({ ...item, isUsed: false })));
  };

  // Submit back to home with stats update
  const finishGameAndClaim = () => {
    audio.playClick();
    onFinish(score, coinsEarned);
  };

  return (
    <div className="w-full max-w-xl mx-auto rounded-[40px] border-4 border-emerald-500/30 shadow-[0_32px_64px_-16px_rgba(4,120,87,0.15)] bg-[#1e293b] text-white overflow-hidden font-sans relative">
      
      {/* Upper Status Header */}
      <h3 className="hidden">植物大战单词魔怪</h3>
      <div className="bg-[#0f172a] p-4 flex items-center justify-between border-b border-[#334155] relative z-20">
        <div className="flex items-center space-x-3">
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-xl transition-all cursor-pointer text-slate-400 hover:text-white"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h4 id="plants-game-title" className="font-extrabold text-[15px] text-emerald-400 flex items-center gap-1.5 leading-none">
              <span>词灵守护战</span>
              <span className="text-[9px] bg-emerald-500/20 text-emerald-300 font-black px-1.5 py-0.5 rounded animate-pulse">PvZ Mode & PvE</span>
            </h4>
            <span className="text-[10px] text-slate-400 font-bold leading-none mt-1 block">植物词灵 VS 释义魔兽</span>
          </div>
        </div>

        {/* HUD Statistics */}
        <div className="flex items-center space-x-3.5">
          <div className="bg-[#1e293b] rounded-2xl px-3 py-1.5 border border-[#334155] flex items-center space-x-1 text-slate-300">
            <Coins size={14} className="text-amber-400 shrink-0" />
            <span className="font-black text-xs tabular-nums text-amber-200">+{coinsEarned}</span>
          </div>

          <div className="bg-[#1e293b] rounded-2xl px-3 py-1.5 border border-[#334155] flex items-center space-x-1 text-slate-300">
            <Zap size={14} className="text-cyan-400 shrink-0" />
            <span className="font-black text-xs tabular-nums text-cyan-200">+{xpEarned} XP</span>
          </div>

          <button 
            onClick={onClose}
            className="p-2 bg-rose-500/10 hover:bg-rose-500/25 border border-rose-500/20 rounded-xl text-rose-400 transition-all cursor-pointer"
          >
            <X size={16} />
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
            className="p-8 text-center space-y-8 py-16 bg-[#0f172a]"
          >
            <div className="relative inline-block">
              <span className="text-7xl block select-none drop-shadow-lg filter scale-x-[-1] animate-bounce">🧟</span>
              <span className="text-4xl absolute -bottom-2 -right-3 block select-none animate-pulse">🫛</span>
            </div>
            
            <div className="space-y-3.5 max-w-sm mx-auto">
              <h4 id="pvz-rules-header" className="text-3xl font-black text-emerald-400 tracking-tight leading-tight">植物守护战：词怪入侵！</h4>
              <p className="text-xs text-slate-400 leading-relaxed font-bold uppercase">
                植物词灵正在誓死捍卫你的奥木脑域！拼写单词/选择对应汉语释义可以为植物充能发射强力弹药。阻止魔怪冲进后花园，否则他们会吃掉你脑子里的所有单词！
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
              <div className="p-4 bg-slate-800/40 border border-[#334155] rounded-3xl text-left">
                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest block mb-1">🪴 绿植词灵</span>
                <p className="text-[11px] font-bold text-slate-300 leading-normal">
                  🌻 黄金音标葵、🫛 前线豌豆射手 和 🍉 西瓜投手 会随时待命！
                </p>
              </div>
              <div className="p-4 bg-slate-800/40 border border-[#334155] rounded-3xl text-left">
                <span className="text-[10px] font-black text-rose-400 uppercase tracking-widest block mb-1">🧟 敌军类型</span>
                <p className="text-[11px] font-bold text-slate-300 leading-normal">
                  突袭小邪灵移速快、呆呆巨人皮糙肉厚！答题连击是取得胜利的秘诀！
                </p>
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <button 
                onClick={startGame}
                className="w-full max-w-xs bg-emerald-500 hover:bg-emerald-600 border-b-4 border-emerald-700 active:border-b-0 py-4 rounded-[24px] text-white font-black text-base shadow-lg transition-all flex items-center justify-center space-x-2.5 cursor-pointer"
              >
                <Play size={18} />
                <span>开启种植魔法阵 🔮</span>
              </button>
              <button 
                onClick={onClose}
                className="text-xs font-black uppercase text-slate-500 hover:text-slate-300 transition-colors"
              >
                暂时离开
              </button>
            </div>
          </motion.div>
        )}

        {gameState === 'PLAYING' && (
          <motion.div key="playing" className="flex flex-col relative z-10 bg-[#1e293b]">
            
            {/* Top wave slider & hearts */}
            <div className="bg-[#0f172a]/80 px-4 py-3 flex items-center justify-between border-b border-[#334155] text-xs">
              <div className="flex items-center space-x-3">
                <span className="font-extrabold text-slate-400">生命值 (Hearts):</span>
                <div className="flex items-center space-x-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Heart 
                      key={i} 
                      size={15} 
                      className={`${i < hearts ? 'text-rose-500 fill-rose-500' : 'text-slate-600'} transition-colors duration-300`} 
                    />
                  ))}
                </div>
              </div>

              {/* Progress to Wave Complete */}
              <div className="flex items-center space-x-3 flex-1 max-w-[140px] justify-end">
                <span className="font-extrabold text-[#34d399] tracking-tight shrink-0">入侵防守:</span>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden border border-[#334155] flex items-center relative">
                  <div 
                    className="bg-[#34d399] h-full rounded-full transition-all duration-300" 
                    style={{ width: `${(monstersDefeated / totalMonstersInWave) * 100}%` }}
                  />
                </div>
                <span className="text-[10px] font-black text-slate-400 shrink-0 tabular-nums">
                  {monstersDefeated}/{totalMonstersInWave}
                </span>
              </div>
            </div>

            {/* PVZ BATTLEFIELD GRID (3 HORIZONTAL LANES) */}
            <div className="w-full aspect-[2/1] min-h-[220px] bg-gradient-to-b from-[#15803d]/40 via-[#16a34a]/30 to-[#14532d]/50 border-b border-[#334155] relative overflow-hidden flex flex-col justify-around py-2 px-1">
              
              {/* Back ambient forest details */}
              <div className="absolute inset-0 select-none pointer-events-none opacity-10">
                <div className="absolute top-[10%] left-[25%] text-2xl">🌲</div>
                <div className="absolute top-[60%] left-[65%] text-2xl">🌲</div>
                <div className="absolute top-[35%] left-[80%] text-3xl">⛰️</div>
              </div>

              {/* 3 Horizontal track guide lines */}
              <div className="absolute inset-0 flex flex-col justify-around select-none pointer-events-none">
                <div className="h-0 border-t border-[#34d399]/20 w-full" />
                <div className="h-0 border-t border-[#34d399]/20 w-full" />
                <div className="h-0 border-t border-[#34d399]/20 w-full" />
              </div>

              {/* Lane list */}
              {[0, 1, 2].map((laneIndex) => {
                // Determine layout or decorative emojis for plants
                const plantEmoji = laneIndex === 0 ? '🌻' : laneIndex === 1 ? '🫛' : '🍉';
                const plantName = laneIndex === 0 ? 'Sunflower' : laneIndex === 1 ? 'Pea' : 'Melon';

                return (
                  <div key={laneIndex} className="w-full flex items-center relative h-[32%] px-2">
                    
                    {/* Plant Defender Base on Left */}
                    <div className="w-[15%] h-full flex items-center justify-center relative">
                      
                      {/* Interactive Plant avatar bubble */}
                      <motion.div 
                        animate={{ 
                          scale: [1, 1.08, 1],
                          rotate: laneIndex % 2 === 0 ? [-3, 3, -3] : [3, -3, 3]
                        }}
                        transition={{ repeat: Infinity, duration: 2.2, delay: laneIndex * 0.4 }}
                        className="w-10 h-10 rounded-full bg-slate-900/60 border border-[#34d399]/40 flex items-center justify-center text-xl shadow-lg relative"
                      >
                        <span>{plantEmoji}</span>
                        
                        {/* Lane label */}
                        <div className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-emerald-800 text-[8px] font-extrabold flex items-center justify-center border border-white/60">
                          {laneIndex + 1}
                        </div>
                      </motion.div>
                    </div>

                    {/* Middle track area for Zombies to walk & Projectiles to fly */}
                    <div className="flex-1 h-full relative border-r border-[#34d399]/10">
                      
                      {/* Render monsters on this specific lane */}
                      {monsters.filter(m => m.lane === laneIndex).map(m => {
                        const hpPct = (m.hp / m.maxHp) * 100;
                        return (
                          <motion.div 
                            key={m.id}
                            style={{ left: `${m.progress}%` }}
                            animate={m.isHit ? { x: [-10, 10, -5, 0] } : {}}
                            className="absolute -translate-y-1/2 top-1/2 -ml-5 w-10 h-10 select-none z-10 flex flex-col items-center justify-center transition-all duration-100"
                          >
                            {/* Health standard bar */}
                            <div className="w-8 h-1.5 bg-slate-800/80 rounded border border-[#334155] overflow-hidden mb-1 shadow-sm shrink-0">
                              <div 
                                className={`h-full rounded ${hpPct > 55 ? 'bg-emerald-400' : hpPct > 25 ? 'bg-amber-400' : 'bg-rose-500'}`}
                                style={{ width: `${hpPct}%` }}
                              />
                            </div>

                            {/* Main Animated emoji representing zombie */}
                            <motion.div 
                              animate={{ 
                                y: [-4, 0, -4],
                                rotate: m.type === 'GOBLIN' ? [-4, 4, -4] : [-2, 2, -2]
                              }}
                              transition={{ repeat: Infinity, duration: m.type === 'GOBLIN' ? 0.7 : 1.5 }}
                              className="text-2xl relative"
                            >
                              <span className={m.isHit ? 'filter invert hue-rotate-180 brightness-110' : ''}>
                                {m.emoji}
                              </span>
                              
                              {/* Attached Word translation clue on top */}
                              <div className="absolute top-[102%] left-1/2 -translate-x-1/2 bg-slate-900/90 text-[7px] font-bold px-1 py-0.5 rounded leading-none shrink-0 border border-[#475569] truncate w-[54px] text-center text-slate-300">
                                {m.word.text}
                              </div>
                            </motion.div>
                          </motion.div>
                        );
                      })}

                      {/* Render flying projectiles on this lane */}
                      {projectiles.filter(p => p.lane === laneIndex).map(p => {
                        // Emoji for projectile
                        const bEmoji = p.type === 'FIREBALL' ? '🔥' : p.type === 'MELON' ? '🍉' : '🟢';
                        return (
                          <motion.div
                            key={p.id}
                            style={{ left: `${p.x}%` }}
                            className="absolute top-1/2 -translate-y-1/2 text-sm z-20 shrink-0 pointer-events-none drop-shadow-md"
                          >
                            <span>{bEmoji}</span>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {/* Display Hero Card on the absolute left corner (Command Deck) */}
              <div className="absolute left-1 bottom-1 bg-[#0f172a]/90 border border-slate-700 p-2 rounded-2xl flex items-center space-x-1.5 shadow-xl scale-75 md:scale-95 origin-bottom-left z-30">
                <span className="text-xl p-1 bg-slate-800 rounded-xl">{hero.avatar}</span>
                <div className="text-left">
                  <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest block leading-none">守御英豪</span>
                  <span className="text-[10px] font-bold text-slate-200 block truncate max-w-[50px] mt-0.5">{hero.name}</span>
                </div>
                {/* Active contract beast support */}
                {activePet && (
                  <div className="w-5 h-5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs flex items-center justify-center" title="Contract beast protection">
                    {petEmoji}
                  </div>
                )}
              </div>

              {/* Overlay Flash Renderings (Floating Damage Indicators) */}
              <AnimatePresence>
                {floatingTexts.map(f => (
                  <motion.div
                    key={f.id}
                    initial={{ opacity: 0, y: 10, scale: 0.8 }}
                    animate={{ opacity: 1, y: -20, scale: 1.1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8 }}
                    className={`absolute pointer-events-none select-none text-xs ${f.color} z-40 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] shrink-0`}
                    style={{ left: `${f.x}%`, top: `${f.y}%` }}
                  >
                    {f.text}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* LOWER INTERACTIVE SPELL ACTION AREA */}
            <div className="p-6 bg-[#0f172a] space-y-5 border-t border-[#334155] relative z-20">
              {currentWord ? (
                <div className="space-y-4">
                  
                  {/* Clue Prompt Banner */}
                  <div className="text-center space-y-1">
                    <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-extrabold text-[10px] uppercase tracking-[0.15em] px-2.5 py-0.5 rounded-full inline-block">
                      {challengeMode === 'MEANING' ? '释义防御 Pea Attack' : '魔法拼写 Melon launch'}
                    </span>
                    
                    <div className="flex items-center justify-center space-x-2">
                      <h4 id="current-clue-word" className="text-3xl font-black text-white tracking-tight">
                        {challengeMode === 'MEANING' ? currentWord.text : `「 ${currentWord.translation} 」`}
                      </h4>
                      <button 
                        onClick={() => { audio.speak(currentWord.text); }}
                        className="p-1.5 hover:bg-slate-800 rounded-lg text-emerald-400 hover:text-emerald-300 transition-colors"
                        title="朗读发音 (Audio)"
                      >
                        <Volume2 size={16} />
                      </button>
                    </div>

                    <p className="text-[10.5px] font-bold text-slate-400 uppercase leading-none mt-1">
                      {challengeMode === 'MEANING' ? '选择对应汉字给豌豆射手加魔' : '点击下方字母，拼出符合上方释义的单词'}
                    </p>
                  </div>

                  {/* Mode 1: Translation option selection buttons */}
                  {challengeMode === 'MEANING' && (
                    <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
                      {meaningOptions.map((opt, id) => (
                        <motion.button
                          key={id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleOptionSelect(opt)}
                          className="p-3.5 bg-slate-800 hover:bg-slate-700/80 active:bg-emerald-900 border-2 border-[#334155] active:border-emerald-500 rounded-2xl text-xs font-black text-slate-100 transition-all flex items-center justify-center space-x-1.5 cursor-pointer shadow-md select-none"
                        >
                          <span className="text-base select-none">🍃</span>
                          <span>{opt}</span>
                        </motion.button>
                      ))}
                    </div>
                  )}

                  {/* Mode 2: Click bubbles in sequence to spell */}
                  {challengeMode === 'SPELLING' && (
                    <div className="space-y-4 max-w-sm mx-auto">
                      
                      {/* Active spelled words deck */}
                      <div className="flex items-center justify-center space-x-1.5 min-h-[46px] bg-slate-900/80 border border-slate-700/60 p-2 rounded-2xl">
                        {spelledWord.length === 0 ? (
                          <span className="text-[11px] font-extrabold text-slate-500 select-none uppercase tracking-wider">点击下方字母进行拼词...</span>
                        ) : (
                          spelledWord.map((letter, idx) => (
                            <motion.span
                              key={idx}
                              initial={{ scale: 0.6, y: 5 }}
                              animate={{ scale: 1, y: 0 }}
                              className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 font-black flex items-center justify-center text-sm border-b-2 border-amber-700 uppercase"
                            >
                              {letter}
                            </motion.span>
                          ))
                        )}
                        
                        {spelledWord.length > 0 && (
                          <button
                            onClick={handleResetSpelling}
                            className="ml-2 p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
                            title="Reset spelled letters"
                          >
                            <RotateCcw size={12} />
                          </button>
                        )}
                      </div>

                      {/* Scrambled letter layout selection */}
                      <div className="flex flex-wrap items-center justify-center gap-2">
                        {scrambledLetters.map((obj) => (
                          <motion.button
                            key={obj.id}
                            disabled={obj.isUsed}
                            whileHover={obj.isUsed ? {} : { scale: 1.1 }}
                            whileTap={obj.isUsed ? {} : { scale: 0.9 }}
                            onClick={() => handleLetterClick(obj)}
                            className={`w-9 h-9 rounded-full font-black text-sm uppercase transition-all shadow ${
                              obj.isUsed 
                                ? 'bg-slate-800 text-slate-600 border border-transparent cursor-not-allowed scale-90 opacity-40' 
                                : 'bg-gradient-to-br from-emerald-500 to-teal-600 hover:brightness-110 active:from-amber-400 active:to-amber-500 text-white border-2 border-white/20 cursor-pointer'
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
                <div className="py-6 text-center text-slate-500">正在吟唱词怪召唤术...</div>
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
            className="p-8 text-center space-y-6 py-14 bg-[#0f172a]"
          >
            <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-full flex items-center justify-center text-3xl mx-auto animate-bounce shadow-lg">
              🏆
            </div>

            <div className="space-y-2">
              <h4 id="victory-header-title" className="text-3xl font-black text-emerald-400">戴夫的荣誉大捷！</h4>
              <p className="text-xs text-slate-400 uppercase font-black leading-relaxed">脑域防守大功告成！所有的单词僵尸都已被净化！</p>
            </div>

            {/* Rewards Card */}
            <div className="bg-slate-800/60 rounded-3xl p-5 border border-slate-700 max-w-sm mx-auto space-y-4">
              <div className="flex items-center justify-around divide-x divide-slate-700/50">
                <div className="text-center flex flex-col items-center justify-center">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">结算星辰分 (Score)</span>
                  <span className="text-xl font-black text-white tabular-nums">{score}</span>
                </div>
                <div className="text-center pl-4 flex flex-col items-center justify-center">
                  <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest mb-1.5 block">收获金币 (Coins)</span>
                  <span className="text-xl font-black text-amber-300 flex items-center justify-center gap-1.5 tabular-nums">
                    <span>🪙</span>
                    <span>+{coinsEarned}</span>
                  </span>
                </div>
                <div className="text-center pl-4 flex flex-col items-center justify-center">
                  <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest mb-1.5 block">角色经验 (XP)</span>
                  <span className="text-xl font-black text-cyan-300 flex items-center justify-center gap-1.5 tabular-nums">
                    <span>⚡</span>
                    <span>+{xpEarned}</span>
                  </span>
                </div>
              </div>

              {/* Character upgrade reminder */}
              <p className="text-[10px] font-bold text-slate-400 leading-normal border-t border-slate-700/50 pt-3">
                获得的金币可前往 [魔法商店] 购买精良护手与魔兽蛋！奥术潜能点可在 [主页契约书] 提升基本勇者属性！
              </p>
            </div>

            <div className="pt-4 max-w-xs mx-auto">
              <button 
                onClick={finishGameAndClaim}
                className="w-full bg-emerald-500 hover:bg-emerald-600 border-b-4 border-emerald-700 py-4 rounded-[24px] text-white font-black text-sm shadow-md cursor-pointer transition-all"
              >
                收下奖励 & 返回
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
            className="p-8 text-center space-y-6 py-14 bg-[#0f172a]"
          >
            <div className="w-16 h-16 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-full flex items-center justify-center text-3xl mx-auto animate-pulse shadow-lg">
              💀
            </div>

            <div className="space-y-2">
              <h4 id="gameover-header-title" className="text-2xl font-black text-rose-400">脑域警报！僵尸吃掉了你的脑子！</h4>
              <p className="text-xs text-slate-400 font-extrabold uppercase leading-relaxed">
                哎呀！防御线失守了！你需要训练得更快、更纯熟才可以击落高速入侵者！
              </p>
            </div>

            {/* Retain score options */}
            <div className="bg-slate-800/60 rounded-3xl p-5 border border-slate-700 max-w-sm mx-auto text-left space-y-3">
              <div className="flex items-center space-x-2.5 text-slate-300">
                <AlertTriangle size={15} className="text-amber-400 shrink-0" />
                <span className="text-[11px] font-extrabold">小奥术诀窍 (Helper hint)</span>
              </div>
              <p className="text-[11px] font-bold text-slate-400 leading-normal leading-relaxed">
                1. 保持双手敲击顺畅，利用 [重置] 按钮迅速回收投错的字母符咒。<br />
                2. 多通过 [魔法配音 (Dubbing)] 与 [词组蜂 (Spelling Bee)] 加深记忆。
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto pt-4">
              <button 
                onClick={startGame}
                className="bg-emerald-500 hover:bg-emerald-600 border-b-4 border-emerald-700 py-3.5 rounded-2xl text-white font-black text-xs shadow cursor-pointer transition-all"
              >
                重新开始 (Retry)
              </button>
              <button 
                onClick={finishGameAndClaim}
                className="bg-slate-800 hover:bg-slate-700 border border-slate-700 py-3.5 rounded-2xl text-slate-300 hover:text-white font-black text-xs cursor-pointer transition-all"
              >
                抱憾认输 (Claim & Leave)
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PlantsVsMonsters;
