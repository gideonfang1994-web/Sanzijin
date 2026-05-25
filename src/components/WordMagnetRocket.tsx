import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { WordGroup, WordItem, UserStats } from '../types';
import { 
  X, ArrowLeft, Rocket, Sparkles, AlertCircle, ChevronLeft, ChevronRight, Volume2
} from 'lucide-react';
import audio from '../utils/AudioUtils';
import confetti from 'canvas-confetti';

interface WordMagnetRocketProps {
  groups: WordGroup[];
  stats: UserStats;
  onFinish: (score: number, coins: number) => void;
  onClose: () => void;
}

interface StarItem {
  id: string;
  x: number;
  y: number;
  size: number;
  speed: number;
}

interface LetterMeteor {
  id: string;
  char: string;
  x: number; // percentage (5 to 95)
  y: number; // percentage (-10 to 110)
  speed: number;
  vx: number;
  size: number;
}

export const WordMagnetRocket: React.FC<WordMagnetRocketProps> = ({ groups, stats, onFinish, onClose }) => {
  const allWords = useMemo(() => {
    let list: WordItem[] = [];
    groups.forEach(g => {
      g.words.forEach(w => {
        list.push(w);
      });
    });
    if (list.length === 0) {
      list = [
        { text: 'rocket', translation: '火箭', imageUrl: '' },
        { text: 'planet', translation: '行星', imageUrl: '' },
        { text: 'star', translation: '星星', imageUrl: '' },
        { text: 'earth', translation: '地球', imageUrl: '' },
        { text: 'comet', translation: '彗星', imageUrl: '' }
      ];
    }
    return [...list].sort(() => Math.random() - 0.5);
  }, [groups]);

  const [gameState, setGameState] = useState<'INTRO' | 'PLAYING' | 'WON' | 'LOST'>('INTRO');
  const [score, setScore] = useState(0);
  const [coinsEarned, setCoinsEarned] = useState(0);
  const [health, setHealth] = useState(5);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);

  const [rocketX, setRocketX] = useState(50); // percentage 10-90
  const [meteors, setMeteors] = useState<LetterMeteor[]>([]);
  const [spelledText, setSpelledText] = useState('');
  
  const moveDirectionRef = useRef<'LEFT' | 'RIGHT' | null>(null);
  const activeWord = allWords[currentWordIndex % allWords.length];

  // Particle background
  const starField = useMemo(() => {
    return Array.from({ length: 48 }).map((_, i) => ({
      id: `star-${i}`,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 1 + Math.random() * 2,
      speed: 0.5 + Math.random() * 1.5
    }));
  }, []);

  const [stars, setStars] = useState<StarItem[]>(starField);

  const startPlaying = () => {
    setGameState('PLAYING');
    setScore(0);
    setCoinsEarned(0);
    setHealth(5);
    setCurrentWordIndex(0);
    setSpelledText('');
    setRocketX(50);
    setMeteors([]);
    audio.speak(allWords[0].text);
  };

  // Keyboard driving hook
  useEffect(() => {
    if (gameState !== 'PLAYING') return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') moveDirectionRef.current = 'LEFT';
      if (e.key === 'ArrowRight') moveDirectionRef.current = 'RIGHT';
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && moveDirectionRef.current === 'LEFT') moveDirectionRef.current = null;
      if (e.key === 'ArrowRight' && moveDirectionRef.current === 'RIGHT') moveDirectionRef.current = null;
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState]);

  // Steer loop
  useEffect(() => {
    if (gameState !== 'PLAYING') return;
    let timerId = setInterval(() => {
      if (moveDirectionRef.current === 'LEFT') {
        setRocketX(x => Math.max(10, x - 2.5));
      } else if (moveDirectionRef.current === 'RIGHT') {
        setRocketX(x => Math.min(90, x + 2.5));
      }
    }, 20);
    return () => clearInterval(timerId);
  }, [gameState]);

  // Physics, meteor fall & check collision
  useEffect(() => {
    if (gameState !== 'PLAYING') return;
    let frameId: number;
    let lastSpawn = 0;

    const gameLoop = (timestamp: number) => {
      // 1. Move space stars (scrolling background effect)
      setStars(prev => prev.map(s => ({
        ...s,
        y: (s.y + s.speed) % 100
      })));

      // 2. Spawn meteor periodically
      if (timestamp - lastSpawn > 1800) {
        lastSpawn = timestamp;
        
        // Find letters to spawn
        // We want to spawn the CURRENT required letter, some distractors, or a random correct letter
        const targetWordText = activeWord.text.toUpperCase();
        const nextRequiredChar = targetWordText[spelledText.length];

        if (nextRequiredChar) {
          const possibleChars = [
            nextRequiredChar, // The correct needed letter
            activeWord.text[Math.floor(Math.random() * activeWord.text.length)].toUpperCase(), // General letter in word
            String.fromCharCode(65 + Math.floor(Math.random() * 26)) // Absolute random
          ];

          // Choose one random char
          const chosenChar = possibleChars[Math.floor(Math.random() * possibleChars.length)];
          const newMeteor: LetterMeteor = {
            id: `meteor-${Date.now()}-${Math.random()}`,
            char: chosenChar,
            x: 8 + Math.random() * 84, // keep from hard edge collisions
            y: -10,
            speed: 0.8 + Math.random() * 0.9,
            vx: (Math.random() - 0.5) * 0.2, // drifting horizontal wave
            size: 54
          };

          setMeteors(m => [...m, newMeteor]);
        }
      }

      // 3. Move meteor and check collision with rocket
      // Rocket sits at bottom around y=85%, with a horizontal width of ~15%
      setMeteors(prev => {
        const kept: LetterMeteor[] = [];
        
        prev.forEach(m => {
          const nextY = m.y + m.speed;
          const nextX = m.x + m.vx;

          // Check collision with rocket
          // Rocket bounding box: x is rocketX +/- 8, y is 82 - 90
          const collisionX = Math.abs(nextX - rocketX) < 9;
          const collisionY = nextY > 78 && nextY < 88;

          if (collisionX && collisionY) {
            // Collision event! This runs inside React setState state updates safely:
            setTimeout(() => {
              handleCollided(m.char);
            }, 0);
            return; // delete from screen
          }

          if (nextY < 105) {
            kept.push({
              ...m,
              x: Math.max(5, Math.min(95, nextX)),
              y: nextY
            });
          }
        });

        return kept;
      });

      frameId = requestAnimationFrame(gameLoop);
    };

    frameId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(frameId);
  }, [gameState, rocketX, activeWord, spelledText]);

  const handleCollided = (char: string) => {
    const targetWordText = activeWord.text.toUpperCase();
    const nextRequiredChar = targetWordText[spelledText.length];

    if (char === nextRequiredChar) {
      // CORRECT LETTER CAPTURED!
      audio.playPop();
      const updatedSpelled = spelledText + char;
      setSpelledText(updatedSpelled);

      // Flash cute sparkle
      confetti({
        particleCount: 8,
        spread: 20,
        origin: { x: rocketX / 100, y: 0.82 }
      });

      // Is Word complete?
      if (updatedSpelled === targetWordText) {
        audio.playSuccess();
        const matchesXp = activeWord.text.length * 5;
        setScore(curr => curr + matchesXp + 20);
        setCoinsEarned(curr => curr + 3);

        confetti({
          particleCount: 50,
          spread: 60,
          origin: { x: 0.5, y: 0.4 }
        });

        // Advance to next word
        setTimeout(() => {
          if (currentWordIndex + 1 >= allWords.length) {
            // Finish all
            setGameState('WON');
            audio.playCheer();
          } else {
            setCurrentWordIndex(idx => idx + 1);
            setSpelledText('');
            // Speak next word
            audio.speak(allWords[(currentWordIndex + 1) % allWords.length].text);
          }
        }, 1200);
      }
    } else {
      // WRONG LETTER SUCKED IN
      audio.playError();
      setHealth(h => {
        const next = h - 1;
        if (next <= 0) {
          setGameState('LOST');
        }
        return next;
      });
    }
  };

  const speakActiveWord = () => {
    if (activeWord) {
      audio.speak(activeWord.text);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950 text-white flex flex-col justify-between overflow-hidden z-50 font-sans">
      {/* Absolute Space Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {stars.map(s => (
          <div
            key={s.id}
            className="absolute bg-white rounded-full opacity-60 transition-transform"
            style={{
              left: `${s.x}%`,
              top: `${s.y}%`,
              width: `${s.size}px`,
              height: `${s.size}px`,
              boxShadow: s.size > 2 ? '0 0 4px #fff' : 'none'
            }}
          />
        ))}

        {/* Dynamic Nebulae */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-900/10 rounded-full filter blur-[100px]" />
        <div className="absolute bottom-1/3 right-1/4 w-[500px] h-[500px] bg-blue-900/10 rounded-full filter blur-[120px]" />
      </div>

      {/* Top HUD */}
      <div className="p-4 flex items-center justify-between relative z-10">
        <button 
          id="rocket_back_btn"
          onClick={onClose} 
          className="p-3 bg-white/10 hover:bg-white/20 active:scale-95 rounded-full transition-transform"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="text-center">
          <span className="block text-slate-400 text-xs tracking-wider uppercase">WORD PROGRESS</span>
          <span className="font-bold text-slate-200">
            单词 {currentWordIndex + 1} / {allWords.length}
          </span>
        </div>

        <div className="flex space-x-1">
          {Array.from({ length: 5 }).map((_, idx) => (
            <span key={idx} className="text-lg">
              {idx < health ? '❤️' : '🖤'}
            </span>
          ))}
        </div>
      </div>

      {/* Spelled Clue Dashboard */}
      {gameState === 'PLAYING' && (
        <div className="px-6 py-2 relative z-10 text-center flex flex-col items-center">
          <div className="bg-slate-900/80 border border-slate-700/50 px-6 py-3 rounded-2xl flex items-center space-x-6 shadow-xl backdrop-blur-md">
            <div>
              <p className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest text-left">Spelling Target</p>
              <h2 className="text-2xl font-black text-white italic tracking-wide">{activeWord.translation}</h2>
            </div>

            <button
              id="rocket_play_sound"
              onClick={speakActiveWord}
              className="p-3 bg-cyan-500 hover:bg-cyan-600 active:scale-95 text-slate-950 font-bold rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/10"
            >
              <Volume2 className="w-5 h-5" />
            </button>
          </div>

          {/* Letter targets */}
          <div className="flex justify-center space-x-2 mt-4">
            {activeWord.text.toUpperCase().split('').map((char, index) => {
              const learned = index < spelledText.length;
              const currentTarget = index === spelledText.length;
              return (
                <motion.div
                  key={index}
                  animate={currentTarget ? { scale: [1, 1.15, 1], borderColor: '#22d3ee' } : {}}
                  transition={currentTarget ? { repeat: Infinity, duration: 1.2 } : {}}
                  className={`w-10 h-12 rounded-xl border flex items-center justify-center font-bold text-lg font-mono transition-all ${
                    learned 
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300' 
                      : currentTarget 
                        ? 'bg-slate-800 border-cyan-500 text-white animate-pulse' 
                        : 'bg-slate-900/60 border-slate-800 text-slate-600'
                  }`}
                >
                  {learned ? char : '?'}
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Outer game-play view container */}
      <div className="flex-1 relative flex flex-col justify-between p-4">
        {gameState === 'INTRO' && (
          <div className="flex-1 flex flex-col items-center justify-center text-center max-w-sm mx-auto relative z-10">
            <motion.div
              animate={{ y: [0, -12, 0] }}
              transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
              className="w-24 h-24 bg-cyan-600 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-cyan-500/30"
            >
              <Rocket className="w-14 h-14 text-white" />
            </motion.div>

            <h2 className="text-3xl font-extrabold mb-2">磁吸太空火箭号</h2>
            <p className="text-slate-400 text-sm leading-relaxed mb-8">
              太空中漂浮着各异的英文字母。控制火箭左右穿行，用磁力防雨罩<b>按照正确的单词拼写顺序</b>吸纳正确的字母！
            </p>

            <button
              id="rocket_start"
              onClick={startPlaying}
              className="w-full py-4 bg-gradient-to-r from-blue-500 to-cyan-400 text-slate-950 font-extrabold text-lg rounded-2xl shadow-xl shadow-cyan-400/20 transition-all active:scale-95"
            >
              点火！向极星进发 💫
            </button>
          </div>
        )}

        {gameState === 'PLAYING' && (
          <div className="flex-1 flex flex-col justify-between relative">
            
            {/* Playfield box container */}
            <div className="flex-1 relative w-full border border-white/5 bg-slate-900/20 rounded-3xl overflow-hidden mt-2">
              
              {/* Floating Meteors */}
              <AnimatePresence>
                {meteors.map(m => (
                  <motion.div
                    key={m.id}
                    id={`meteor-${m.id}`}
                    className="absolute bg-gradient-to-b from-slate-800 to-slate-900 border-2 border-slate-600 shadow-md flex items-center justify-center text-xl font-mono font-black rounded-full"
                    style={{
                      left: `${m.x}%`,
                      top: `${m.y}%`,
                      width: `${m.size}px`,
                      height: `${m.size}px`,
                      transform: 'translate(-50%, -50%)',
                      boxShadow: '0 0 10px rgba(100,200,255,0.1)'
                    }}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    transition={{ duration: 0.15 }}
                  >
                    <span className="text-indigo-200 drop-shadow">{m.char}</span>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Controllable Rocket Ship */}
              <motion.div
                className="absolute flex flex-col items-center"
                style={{
                  left: `${rocketX}%`,
                  bottom: '10%',
                  transform: 'translateX(-50%)',
                  width: '64px'
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              >
                {/* Magnetic Energy Dome Shield lines */}
                <span className="w-12 h-6 border-t-2 border-dashed border-cyan-400 animate-pulse rounded-t-full block mb-1 opacity-80" />
                
                <Rocket className="w-12 h-14 text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]" />
                
                {/* Rocket Thrust flame particle */}
                <span className="w-3 h-5 bg-gradient-to-t from-red-500 via-yellow-500 to-transparent rounded-b-md animate-bounce mt-1" />
              </motion.div>
            </div>

            {/* Steer Control pads (Super vital for comfortable mobile gameplay!) */}
            <div className="grid grid-cols-2 gap-4 mt-4 h-18">
              <button
                id="rocket_left_steer"
                onTouchStart={() => { moveDirectionRef.current = 'LEFT'; }}
                onTouchEnd={() => { moveDirectionRef.current = null; }}
                onMouseDown={() => { moveDirectionRef.current = 'LEFT'; }}
                onMouseUp={() => { moveDirectionRef.current = null; }}
                onMouseLeave={() => { moveDirectionRef.current = null; }}
                className="bg-slate-900/80 active:bg-cyan-900/30 border border-slate-800 rounded-2xl flex items-center justify-center text-slate-350 select-none cursor-pointer"
              >
                <ChevronLeft className="w-8 h-8 mr-1 text-cyan-400" />
                <span className="font-bold text-xs">重力左拉</span>
              </button>
              <button
                id="rocket_right_steer"
                onTouchStart={() => { moveDirectionRef.current = 'RIGHT'; }}
                onTouchEnd={() => { moveDirectionRef.current = null; }}
                onMouseDown={() => { moveDirectionRef.current = 'RIGHT'; }}
                onMouseUp={() => { moveDirectionRef.current = null; }}
                onMouseLeave={() => { moveDirectionRef.current = null; }}
                className="bg-slate-900/80 active:bg-cyan-900/30 border border-slate-800 rounded-2xl flex items-center justify-center text-slate-355 select-none cursor-pointer"
              >
                <span className="font-bold text-xs text-right text-slate-400">重力右拉</span>
                <ChevronRight className="w-8 h-8 ml-1 text-cyan-400" />
              </button>
            </div>
          </div>
        )}

        {(gameState === 'WON' || gameState === 'LOST') && (
          <div className="flex-1 flex flex-col items-center justify-center text-center max-w-sm mx-auto relative z-10">
            <span className="text-6xl mb-6">
              {gameState === 'WON' ? '🛸' : '🚀'}
            </span>

            <h2 className="text-3xl font-black mb-2">
              {gameState === 'WON' ? '银河神笔拼写者！' : '飞船磁暴抛锚'}
            </h2>
            <p className="text-slate-400 text-sm mb-8 leading-relaxed">
              {gameState === 'WON'
                ? '你以百分之百的拼写准确率穿越了乱石彗星带，在航海日志上重重刻下胜利的词组！'
                : '别担心，太空中偶尔会吹拂起磁暴大风！调整方向，我们再次升空！'}
            </p>

            <div className="w-full bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex justify-around mb-8">
              <div className="text-center">
                <span className="block text-slate-400 text-xs">累积经验</span>
                <span className="text-2xl font-black text-cyan-400">+{score} XP</span>
              </div>
              <div className="text-center border-l border-slate-800 pl-8">
                <span className="block text-slate-400 text-xs">缴获钱币</span>
                <span className="text-2xl font-black text-amber-400">+{coinsEarned} 🪙</span>
              </div>
            </div>

            <button
              id="rocket_win_exit"
              onClick={() => onFinish(score, coinsEarned)}
              className="w-full py-4 bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-bold rounded-2xl hover:opacity-95 active:scale-95 transition-all"
            >
              返回大本营
            </button>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-slate-900 text-center text-xs text-slate-500 font-mono relative z-10">
        STEERING HUD V.1 // CALIBRATED ACCORDING TO SYSTEM JET PROPULSIONS
      </div>
    </div>
  );
};

export default WordMagnetRocket;
