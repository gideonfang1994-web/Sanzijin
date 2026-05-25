import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { WordGroup, WordItem, UserStats } from '../types';
import { 
  X, ArrowLeft, Volume2, Sparkles, Flame, Play, Disc, Music, ShieldAlert
} from 'lucide-react';
import audio from '../utils/AudioUtils';
import confetti from 'canvas-confetti';
import { CHARACTERS } from '../constants';

interface WordDJBeatProps {
  groups: WordGroup[];
  stats: UserStats;
  onFinish: (score: number, coins: number) => void;
  onClose: () => void;
}

interface NeonNote {
  id: string;
  word: WordItem;
  text: string;
  isCorrect: boolean;
  x: number; // percentage
  y: number; // percentage
  speed: number;
  rotation: number;
  active: boolean;
  color: string;
}

export const WordDJBeat: React.FC<WordDJBeatProps> = ({ groups, stats, onFinish, onClose }) => {
  const allWords = useMemo(() => {
    let list: WordItem[] = [];
    groups.forEach(g => {
      g.words.forEach(w => {
        list.push(w);
      });
    });
    if (list.length === 0) {
      list = [
        { text: 'music', translation: '音乐', imageUrl: '' },
        { text: 'rhythm', translation: '节奏', imageUrl: '' },
        { text: 'dance', translation: '舞蹈', imageUrl: '' },
        { text: 'happy', translation: '快乐', imageUrl: '' },
        { text: 'guitar', translation: '吉他', imageUrl: '' }
      ];
    }
    return [...list].sort(() => Math.random() - 0.5);
  }, [groups]);

  const [gameState, setGameState] = useState<'INTRO' | 'PLAYING' | 'WON' | 'LOST'>('INTRO');
  const [score, setScore] = useState(0);
  const [coinsEarned, setCoinsEarned] = useState(0);
  const [health, setHealth] = useState(5);
  const [combo, setCombo] = useState(0);
  const [targetWord, setTargetWord] = useState<WordItem | null>(null);
  const [notes, setNotes] = useState<NeonNote[]>([]);
  const [isSpinning, setIsSpinning] = useState(false);
  
  const currentWordIndex = useRef(0);
  const animationFrameId = useRef<number | null>(null);
  const lastSpawnTime = useRef<number>(0);

  const hero = useMemo(() => {
    return CHARACTERS.find(c => c.id === stats.selectedCharacterId) || CHARACTERS[0];
  }, [stats.selectedCharacterId]);

  const startNewChallenge = (index: number) => {
    if (allWords.length === 0) return;
    const target = allWords[index % allWords.length];
    setTargetWord(target);
    setNotes([]);
    setIsSpinning(true);
    
    // Auto speak the target word
    setTimeout(() => {
      audio.speak(target.text);
    }, 400);

    // Create a pool of options
    const distractors = allWords
      .filter(w => w.text !== target.text)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    
    const options = [target, ...distractors].sort(() => Math.random() - 0.5);

    // Generate neon notes
    const colors = [
      'from-pink-500 to-rose-500 shadow-pink-500/50',
      'from-cyan-500 to-blue-500 shadow-cyan-500/50',
      'from-emerald-500 to-teal-500 shadow-emerald-500/50',
      'from-purple-500 to-indigo-500 shadow-purple-500/50'
    ];

    const generatedNotes: NeonNote[] = options.map((opt, i) => {
      // Space them across the horizontal axis
      const fraction = 100 / (options.length + 1);
      const x = fraction * (i + 1) + (Math.random() * 6 - 3);
      return {
        id: `note-${i}-${Date.now()}`,
        word: opt,
        text: opt.translation,
        isCorrect: opt.text === target.text,
        x,
        y: -15 - (Math.random() * 15), // Stagger starting heights above viewport
        speed: 1.2 + Math.random() * 0.6,
        rotation: Math.random() * 360,
        active: true,
        color: colors[i % colors.length]
      };
    });

    setNotes(generatedNotes);
  };

  const startPlaying = () => {
    setGameState('PLAYING');
    setScore(0);
    setCoinsEarned(0);
    setHealth(5);
    setCombo(0);
    currentWordIndex.current = 0;
    startNewChallenge(0);
  };

  const handleSpeak = () => {
    if (targetWord) {
      audio.speak(targetWord.text);
      setIsSpinning(true);
      setTimeout(() => setIsSpinning(false), 800);
    }
  };

  const tapNote = (note: NeonNote) => {
    if (!note.active || gameState !== 'PLAYING') return;

    // de-activate chosen note
    setNotes(prev => prev.map(n => n.id === note.id ? { ...n, active: false } : n));

    if (note.isCorrect) {
      // Correct!
      audio.playSuccess();
      const newCombo = combo + 1;
      setCombo(newCombo);
      const points = 20 + Math.min(newCombo * 5, 50);
      setScore(prev => prev + points);
      setCoinsEarned(prev => prev + 2);
      
      // Flash DJ trigger
      setIsSpinning(true);
      setTimeout(() => setIsSpinning(false), 1000);

      // Trigger sparkles
      confetti({
        particleCount: 30,
        spread: 40,
        origin: { y: 0.7 }
      });

      // Advance
      setTimeout(() => {
        if (currentWordIndex.current + 1 >= allWords.length) {
          // Win the game
          setGameState('WON');
          audio.playCheer();
          confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
        } else {
          currentWordIndex.current += 1;
          startNewChallenge(currentWordIndex.current);
        }
      }, 700);

    } else {
      // Incorrect Note
      audio.playError();
      setCombo(0);
      setHealth(prev => {
        const next = prev - 1;
        if (next <= 0) {
          setGameState('LOST');
        }
        return next;
      });

      // Let note fall off
    }
  };

  // Game physics / note dropping loop
  useEffect(() => {
    if (gameState !== 'PLAYING') return;

    let active = true;
    const updateTick = () => {
      if (!active) return;

      setNotes(prevNotes => {
        let cleanMatch = false;
        const updated = prevNotes.map(note => {
          if (!note.active) return note;
          const nextY = note.y + note.speed;
          
          // Check if note escaped off the bottom (y > 105) WITHOUT being cleared
          if (nextY > 105 && note.active) {
            cleanMatch = note.isCorrect; // If correct note falls past bottom, it's a miss
            return { ...note, active: false };
          }

          return {
            ...note,
            y: nextY,
            rotation: (note.rotation + 1) % 360
          };
        });

        if (cleanMatch) {
          // Correct note missed!
          setTimeout(() => {
            audio.playError();
            setCombo(0);
            setHealth(h => {
              const next = h - 1;
              if (next <= 0) setGameState('LOST');
              return next;
            });
            // Auto reload next
            if (currentWordIndex.current + 1 < allWords.length) {
              currentWordIndex.current += 1;
              startNewChallenge(currentWordIndex.current);
            } else {
              setGameState('WON');
            }
          }, 0);
        }

        return updated;
      });

      animationFrameId.current = requestAnimationFrame(updateTick);
    };

    animationFrameId.current = requestAnimationFrame(updateTick);
    return () => {
      active = false;
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    };
  }, [gameState, allWords]);

  const handleFinished = () => {
    onFinish(score, coinsEarned);
  };

  return (
    <div className="fixed inset-0 bg-slate-950 flex flex-col justify-between overflow-hidden text-white z-50 font-sans">
      {/* Dynamic Grid Background Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.15),transparent_70%)] pointer-events-none" />
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none" 
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
          backgroundSize: '30px 30px'
        }}
      />

      {/* Top HUD */}
      <div className="p-4 flex items-center justify-between relative z-10">
        <button 
          id="dj_back_btn"
          onClick={onClose} 
          className="p-3 bg-white/10 hover:bg-white/20 active:scale-95 rounded-full transition-transform"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        <div className="flex items-center space-x-6">
          <div className="px-4 py-2 bg-indigo-500/20 border border-indigo-400/30 rounded-2xl flex items-center space-x-2">
            <Music className="w-5 h-5 text-indigo-400 animate-pulse" />
            <span className="font-mono text-xl font-bold tracking-wider text-indigo-300">{score} XP</span>
          </div>

          <div className="flex space-x-1.5">
            {Array.from({ length: 5 }).map((_, idx) => (
              <motion.div
                key={idx}
                animate={{ scale: idx < health ? [1, 1.1, 1] : 1 }}
                className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  idx < health ? 'text-rose-500' : 'text-slate-700'
                }`}
              >
                ❤️
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Game Screen */}
      <div className="flex-1 flex flex-col justify-between relative px-6 py-4">
        {gameState === 'INTRO' && (
          <div className="flex-1 flex flex-col items-center justify-center text-center max-w-md mx-auto relative z-10">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1, rotate: [0, 5, -5, 0] }}
              className="w-32 h-32 bg-indigo-600 rounded-full flex items-center justify-center shadow-lg shadow-indigo-500/50 mb-6"
            >
              <Disc className="w-20 h-20 text-white animate-spin [animation-duration:8s]" />
            </motion.div>
            
            <h2 className="text-3xl font-extrabold tracking-tight mb-2">听力 DJ 节奏控</h2>
            <p className="text-slate-400 text-sm leading-relaxed mb-8">
              音箱里将播放神秘的英文。滑动双眸，在落下的七彩音符符纸中，精准拍打对应的正确中文翻译！
            </p>

            <button
              id="dj_start_btn"
              onClick={startPlaying}
              className="w-full py-4 bg-gradient-to-r from-pink-500 to-indigo-600 hover:opacity-90 active:scale-95 text-lg font-bold rounded-2xl shadow-xl shadow-indigo-500/20 transition-all"
            >
              开启音乐节拍 🚀
            </button>
          </div>
        )}

        {gameState === 'PLAYING' && (
          <div className="flex-1 flex flex-col relative justify-between">
            {/* Note stream field */}
            <div className="flex-1 relative w-full border border-white/5 bg-slate-900/40 rounded-3xl overflow-hidden shadow-inner">
              
              {/* Note options */}
              <AnimatePresence>
                {notes.map(note => {
                  if (!note.active) return null;
                  return (
                    <motion.button
                      key={note.id}
                      id={`dj_note_${note.id}`}
                      onClick={() => tapNote(note)}
                      className={`absolute px-5 py-3 rounded-full bg-gradient-to-br ${note.color} border border-white/30 shadow-lg text-white font-bold text-base cursor-pointer hover:scale-105 active:scale-95 transition-transform`}
                      style={{
                        left: `${note.x}%`,
                        top: `${note.y}%`,
                        transform: `translate(-50%, -50%) rotate(${note.rotation}deg)`
                      }}
                      initial={{ opacity: 0, scale: 0.3 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.2 }}
                      transition={{ duration: 0.15 }}
                    >
                      <span className="drop-shadow">{note.text}</span>
                    </motion.button>
                  );
                })}
              </AnimatePresence>

              {/* Laser Trigger Line */}
              <div className="absolute bottom-10 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400/80 to-transparent animate-pulse" />
            </div>

            {/* Turntable Core */}
            <div className="mt-6 flex flex-col items-center justify-center relative py-4">
              {/* Combo feedback toast */}
              {combo >= 2 && (
                <motion.div 
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: [1, 1.2, 1], opacity: 1 }}
                  className="absolute -top-6 bg-yellow-500 text-slate-950 px-4 py-1.5 rounded-full font-black text-sm tracking-wider shadow"
                >
                  ⚡ COMBO ×{combo}!
                </motion.div>
              )}

              {/* DJ Vinyl */}
              <div className="flex items-center space-x-6">
                <motion.button
                  id="dj_speaker_button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSpeak}
                  className="w-24 h-24 bg-gradient-to-tr from-slate-900 via-slate-800 to-indigo-950 border-4 border-cyan-500 rounded-full flex items-center justify-center shadow-lg relative group overflow-hidden cursor-pointer"
                >
                  {/* Dynamic spinning groove details */}
                  <motion.div 
                    animate={isSpinning ? { rotate: 360 } : { rotate: 0 }}
                    transition={isSpinning ? { repeat: Infinity, ease: 'linear', duration: 1.5 } : {}}
                    className="absolute inset-2 border border-dashed border-white/20 rounded-full pointer-events-none"
                  />
                  <motion.div 
                    animate={isSpinning ? { scale: [1, 1.1, 1] } : {}}
                    transition={{ repeat: Infinity, duration: 0.8 }}
                    className="w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center shadow-md relative z-10"
                  >
                    <Volume2 className="w-6 h-6 text-white" />
                  </motion.div>
                </motion.button>

                <div className="text-left flex-1 min-w-[150px]">
                  <p className="text-cyan-400 text-xs font-mono font-bold tracking-widest uppercase">AUDIO STREAMING</p>
                  <h3 className="text-xl font-bold mt-1 text-slate-100 italic">“点击黑胶听音圈”</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    点击重听, 请挑出正确的音符。
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {(gameState === 'WON' || gameState === 'LOST') && (
          <div className="flex-1 flex flex-col items-center justify-center text-center max-w-sm mx-auto relative z-10">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className={`w-28 h-28 rounded-full flex items-center justify-center mb-6 shadow-xl ${
                gameState === 'WON' ? 'bg-emerald-500 shadow-emerald-500/30' : 'bg-rose-500 shadow-rose-500/30'
              }`}
            >
              <Sparkles className="w-16 h-16 text-white" />
            </motion.div>

            <h2 className="text-3xl font-black mb-2 tracking-tight">
              {gameState === 'WON' ? '制霸 DJ 音乐节！ 🎉' : 'DJ 混音挑战终结 😭'}
            </h2>
            <p className="text-slate-400 text-sm mb-8 leading-relaxed">
              {gameState === 'WON' 
                ? '你对这些单词的读音记忆力惊人，音乐节现场的观众都被你的旋律征服了！' 
                : '别灰心！多戴耳机听听看，旋律一定能印入你的脑海！'}
            </p>

            <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 flex justify-around mb-8">
              <div className="text-center">
                <span className="block text-slate-400 text-xs">获得经验</span>
                <span className="text-2xl font-black text-indigo-400">+{score} XP</span>
              </div>
              <div className="text-center border-l border-white/10 pl-8">
                <span className="block text-slate-400 text-xs">爆出金币</span>
                <span className="text-2xl font-black text-amber-400">+{coinsEarned} 🪙</span>
              </div>
            </div>

            <button
              id="dj_finish_btn"
              onClick={handleFinished}
              className="w-full py-4 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:opacity-90 active:scale-95 text-lg font-bold rounded-2xl transition-all"
            >
              返回大本营
            </button>
          </div>
        )}
      </div>

      {/* Footer Branding Decor */}
      <div className="p-4 border-t border-white/5 text-center text-xs text-slate-500 font-mono">
        NEON BEATS ACCENT // STUDY RHYTHM DJ MODULE 1.0
      </div>
    </div>
  );
};

export default WordDJBeat;
