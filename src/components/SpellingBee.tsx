
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WordGroup, WordItem } from '../types';
import { Volume2, Star, Trophy, X, Zap, Heart, Search, MousePointer2 } from 'lucide-react';
import audio from '../utils/AudioUtils';
import confetti from 'canvas-confetti';
import SafeImage from './SafeImage';

interface Props {
  groups: WordGroup[];
  onFinish: (score: number, coins: number) => void;
  onClose: () => void;
}

const SpellingBee: React.FC<Props> = ({ groups, onFinish, onClose }) => {
  const [pool, setPool] = useState<WordItem[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [hearts, setHearts] = useState(3);
  const [guess, setGuess] = useState<string[]>([]);
  const [options, setOptions] = useState<string[]>([]);
  const [isGameOver, setIsGameOver] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [combo, setCombo] = useState(0);
  const [shake, setShake] = useState(false);

  useEffect(() => {
    const allWords = groups.flatMap(g => g.words);
    if (allWords.length > 0) {
      setPool([...allWords].sort(() => Math.random() - 0.5));
    }
  }, [groups]);

  const currentWord = pool[currentIdx];

  const initRound = () => {
    if (!currentWord) return;
    
    const word = currentWord.text.toLowerCase();
    const letters = word.split('');
    
    // Add some random letters as distractors
    const alphabet = 'abcdefghijklmnopqrstuvwxyz';
    const distractors = Array.from({ length: 4 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]);
    
    const allLetters = [...letters, ...distractors].sort(() => Math.random() - 0.5);
    setOptions(allLetters);
    setGuess([]);
    setShowHint(false);
    
    // Auto speak
    setTimeout(() => audio.speak(currentWord.text), 500);
  };

  useEffect(() => {
    if (pool.length > 0) {
      initRound();
    }
  }, [pool, currentIdx]);

  const handleLetterClick = (letter: string, optionIdx: number) => {
    if (isGameOver || !currentWord) return;
    
    const nextGuess = [...guess, letter];
    const target = currentWord.text.toLowerCase();
    
    if (target.startsWith(nextGuess.join(''))) {
      audio.playClick();
      setGuess(nextGuess);
      
      // Check if finished
      if (nextGuess.join('') === target) {
        handleSuccess();
      }
    } else {
      handleMistake();
    }
  };

  const handleSuccess = () => {
    audio.playSuccess();
    setCombo(prev => prev + 1);
    const earned = 100 + (combo * 20);
    setScore(prev => prev + earned);
    
    confetti({
      particleCount: 40,
      spread: 70,
      origin: { y: 0.8 },
      colors: ['#FCD34D', '#FBBF24', '#D97706'] // Bee colors
    });

    setTimeout(() => {
      if (currentIdx + 1 >= pool.length) {
        handleGameEnd();
      } else {
        setCurrentIdx(prev => prev + 1);
      }
    }, 1000);
  };

  const handleMistake = () => {
    audio.playError();
    setShake(true);
    setCombo(0);
    setHearts(prev => {
      const next = prev - 1;
      if (next <= 0) {
        setTimeout(handleGameEnd, 500);
      }
      return next;
    });
    setTimeout(() => setShake(false), 500);
    setGuess([]); // Reset current guess on mistake
  };

  const handleGameEnd = () => {
    setIsGameOver(true);
    audio.playCheer();
    onFinish(score, Math.floor(score / 50));
  };

  if (!currentWord && !isGameOver) return null;

  return (
    <div className="fixed inset-0 bg-amber-50 z-[100] flex flex-col font-sans overflow-hidden">
      {/* Decorative Honeycomb Background */}
      <div className="absolute inset-0 opacity-5 pointer-events-none overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => (
          <div 
            key={i} 
            className="absolute w-32 h-32 border-4 border-amber-400 rounded-[2rem] rotate-45"
            style={{ 
              left: `${(i % 5) * 25}%`, 
              top: `${Math.floor(i / 5) * 25}%`,
              transform: `rotate(${(i * 15)}deg)`
            }}
          />
        ))}
      </div>

      <header className="p-6 flex items-center justify-between bg-white/80 backdrop-blur-xl border-b-2 border-amber-200 relative z-30 shadow-sm">
        <button onClick={onClose} className="p-2 hover:bg-amber-100 rounded-2xl transition-colors">
          <X size={28} className="text-amber-700" />
        </button>

        <div className="flex flex-col items-center">
          <div className="flex space-x-1.5 mb-1">
            {[...Array(3)].map((_, i) => (
              <Heart key={i} className={`w-6 h-6 transition-all duration-500 ${i < hearts ? 'text-rose-500 fill-rose-500 scale-110' : 'text-slate-200 scale-90'}`} />
            ))}
          </div>
          <div className="text-[10px] font-black text-amber-600 uppercase tracking-[0.2em]">
            Word {currentIdx + 1} / {pool.length}
          </div>
        </div>

        <div className="flex items-center space-x-3 bg-amber-100 px-4 py-2 rounded-2xl border-2 border-white shadow-sm">
          <Star className="text-amber-500 fill-amber-500" size={18} />
          <span className="text-xl font-black text-amber-700 tabular-nums">{score}</span>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 relative z-20 space-y-12">
        {/* The Bee Character / Audio Button */}
        <div className="relative group">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            animate={shake ? { x: [-10, 10, -10, 10, 0] } : { y: [0, -10, 0] }}
            transition={shake ? { duration: 0.4 } : { duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            onClick={() => audio.speak(currentWord.text)}
            className="w-48 h-48 bg-gradient-to-br from-amber-300 to-amber-500 rounded-full flex flex-col items-center justify-center shadow-2xl border-8 border-white relative magic-glow-pulse"
          >
            {/* Wings */}
            <motion.div 
               animate={{ rotate: [0, 40, 0, -40, 0], scale: [1, 1.1, 1] }}
               transition={{ duration: 0.1, repeat: Infinity }}
               className="absolute -left-10 top-10 w-20 h-14 bg-white/40 rounded-full border-2 border-white/50 blur-[1px] origin-right" 
            />
            <motion.div 
               animate={{ rotate: [0, -40, 0, 40, 0], scale: [1, 1.1, 1] }}
               transition={{ duration: 0.1, repeat: Infinity }}
               className="absolute -right-10 top-10 w-20 h-14 bg-white/40 rounded-full border-2 border-white/50 blur-[1px] origin-left" 
            />
            
            <div className="relative z-10 flex flex-col items-center">
              <Volume2 size={64} className="text-white mb-2 filter drop-shadow-md" />
              <span className="text-[10px] font-black text-amber-950/60 uppercase tracking-widest px-4 py-1.5 bg-white/30 rounded-full backdrop-blur-sm border border-white/20">Listen Spell</span>
            </div>

            {/* Stripes */}
            <div className="absolute inset-0 flex flex-col justify-around py-12 opacity-20 pointer-events-none">
              <div className="h-4 bg-amber-900" />
              <div className="h-4 bg-amber-900" />
            </div>
          </motion.button>

          {/* Hint Toggle */}
          <button 
            onClick={() => { audio.playClick(); setShowHint(!showHint); }}
            className="absolute -bottom-4 -right-4 w-14 h-14 bg-indigo-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-200 border-4 border-white transition-all hover:scale-110 active:scale-95"
          >
            <Search size={24} />
          </button>
        </div>

        {/* Word Display Area */}
        <div className="space-y-6 w-full max-w-sm">
          <div className="flex flex-wrap justify-center gap-3">
            {currentWord.text.split('').map((char, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={`w-14 h-14 rounded-2xl border-4 flex items-center justify-center text-3xl font-black transition-all duration-300 ${
                  guess[i] 
                    ? 'bg-white border-amber-400 text-amber-600 shadow-lg' 
                    : 'bg-amber-100/30 border-amber-100 text-transparent'
                }`}
              >
                {guess[i] || ''}
              </motion.div>
            ))}
          </div>

          <AnimatePresence>
            {showHint && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="bg-white/80 backdrop-blur-md p-6 rounded-[32px] border-2 border-amber-100 flex items-center space-x-6 shadow-xl"
              >
                <div className="w-24 h-24 bg-amber-50 rounded-2xl relative overflow-hidden border-2 border-amber-100">
                   <SafeImage src={currentWord.imageUrl} alt={currentWord.text} className="w-full h-full object-contain" fallbackText={currentWord.text} width="96" height="96" />
                </div>
                <div className="flex-1">
                   <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest mb-1">Magical Hint</p>
                   <p className="text-xl font-bold text-slate-800">{currentWord.translation}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Letter Pool */}
        <div className="w-full grid grid-cols-4 gap-4 max-w-sm mt-auto">
          {options.map((letter, i) => (
            <motion.button
              key={`${letter}-${i}`}
              whileHover={{ scale: 1.05, backgroundColor: '#FEF3C7' }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleLetterClick(letter, i)}
              className="aspect-square bg-white rounded-3xl shadow-xl shadow-amber-900/5 border-2 border-amber-50 flex items-center justify-center text-2xl font-black text-amber-800 transition-all active:shadow-none active:translate-y-1 puffy-button"
            >
              {letter.toUpperCase()}
            </motion.button>
          ))}
        </div>
      </main>

      {/* Game Over Modal */}
      <AnimatePresence>
        {isGameOver && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-amber-950/80 backdrop-blur-xl"
          >
            <motion.div 
              initial={{ scale: 0.8, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-[56px] p-10 max-w-sm w-full shadow-2xl text-center space-y-8"
            >
              <div className="text-8xl">🐝</div>
              <div className="space-y-2">
                <h3 className="text-4xl font-black text-slate-900 leading-tight">勤劳奖章！</h3>
                <p className="text-slate-500 font-bold">你像蜜蜂一样勤奋，拼出了所有咒语。</p>
              </div>
              
              <div className="bg-amber-50 rounded-3xl p-6 space-y-2 border-2 border-amber-100">
                <div className="flex justify-between items-center text-amber-800 font-black">
                  <span>最终得分</span>
                  <span className="text-4xl tracking-tighter tabular-nums">{score}</span>
                </div>
                <div className="h-px bg-amber-200/50" />
                <div className="flex justify-between items-center text-amber-500/60 font-black text-[10px] uppercase tracking-widest">
                  <span>COMBO BONUS</span>
                  <span>+{combo * 10}</span>
                </div>
              </div>

              <button 
                onClick={onClose}
                className="w-full py-6 bg-amber-500 text-white rounded-[32px] font-black text-xl shadow-xl shadow-amber-200 border-b-8 border-amber-700 active:border-b-0 transition-all"
              >
                收集蜂蜜奖励
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SpellingBee;
