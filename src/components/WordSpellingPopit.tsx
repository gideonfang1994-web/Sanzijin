import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { WordGroup, WordItem, UserStats } from '../types';
import { 
  X, ArrowLeft, Volume2, Sparkles, Smile, Star
} from 'lucide-react';
import audio from '../utils/AudioUtils';
import confetti from 'canvas-confetti';

interface WordSpellingPopitProps {
  groups: WordGroup[];
  stats: UserStats;
  onFinish: (score: number, coins: number) => void;
  onMistake?: (wordText: string) => void;
  onClose: () => void;
}

export const WordSpellingPopit: React.FC<WordSpellingPopitProps> = ({ groups, stats, onFinish, onMistake, onClose }) => {
  const allWords = useMemo(() => {
    let list: WordItem[] = [];
    groups.forEach(g => {
      g.words.forEach(w => {
        list.push(w);
      });
    });
    if (list.length === 0) {
      list = [
        { text: 'apple', translation: '苹果', imageUrl: '' },
        { text: 'candy', translation: '糖果', imageUrl: '' },
        { text: 'jelly', translation: '果冻', imageUrl: '' },
        { text: 'sweet', translation: '甜甜的', imageUrl: '' },
        { text: 'bear', translation: '熊宝宝', imageUrl: '' }
      ];
    }
    return [...list].sort(() => Math.random() - 0.5);
  }, [groups]);

  const [gameState, setGameState] = useState<'INTRO' | 'PLAYING' | 'WON' | 'LOST'>('INTRO');
  const [score, setScore] = useState(0);
  const [coinsEarned, setCoinsEarned] = useState(0);
  const [currentWordIdx, setCurrentWordIdx] = useState(0);
  const [spelledLetters, setSpelledLetters] = useState<string[]>([]);
  const [health, setHealth] = useState(5);
  const [poppedLetters, setPoppedLetters] = useState<Record<string, boolean>>({});

  const activeWord = allWords[currentWordIdx % allWords.length];

  // Grid keys layout
  // 3 beautiful cute colored row layers of bubbles
  const keyboardRows = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['Z', 'X', 'C', 'V', 'B', 'N', 'M']
  ];

  const rowColors = [
    'from-pink-400 to-rose-400',
    'from-amber-400 to-orange-400',
    'from-emerald-400 to-teal-400'
  ];

  const startPlaying = () => {
    setGameState('PLAYING');
    setScore(0);
    setCoinsEarned(0);
    setHealth(5);
    setCurrentWordIdx(0);
    setSpelledLetters([]);
    setPoppedLetters({});
    audio.speak(allWords[0].text);
  };

  const handlePopLetter = (letter: string) => {
    if (gameState !== 'PLAYING') return;

    // Standardize letter to target matching capitalization
    const upperLetter = letter.toUpperCase();
    const targetWordUpper = activeWord.text.toUpperCase();
    const nextCharIndex = spelledLetters.length;
    const requiredChar = targetWordUpper[nextCharIndex];

    // Trigger pop tactile animation
    setPoppedLetters(prev => ({ ...prev, [upperLetter]: true }));
    setTimeout(() => {
      setPoppedLetters(prev => ({ ...prev, [upperLetter]: false }));
    }, 150);

    // Audio popped trigger
    audio.playPop();

    if (upperLetter === requiredChar) {
      // CORRECT POP!
      const updatedList = [...spelledLetters, upperLetter];
      setSpelledLetters(updatedList);

      // Sparkles
      confetti({
        particleCount: 5,
        spread: 15,
        origin: { y: 0.7 }
      });

      // Done?
      if (updatedList.join('') === targetWordUpper) {
        audio.playSuccess();
        const baseReward = activeWord.text.length * 6;
        setScore(prev => prev + baseReward + 15);
        setCoinsEarned(prev => prev + 2);

        confetti({
          particleCount: 30,
          spread: 45,
          colors: ['#f472b6', '#fbbf24', '#34d399', '#60a5fa']
        });

        // Advance
        setTimeout(() => {
          if (currentWordIdx + 1 >= allWords.length) {
            setGameState('WON');
            audio.playCheer();
          } else {
            setCurrentWordIdx(idx => idx + 1);
            setSpelledLetters([]);
            audio.speak(allWords[(currentWordIdx + 1) % allWords.length].text);
          }
        }, 1200);
      }
    } else {
      // WRONG POP!
      audio.playError();
      if (onMistake && activeWord) {
        onMistake(activeWord.text);
      }
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
    <div className="fixed inset-0 bg-pink-50/70 dark:bg-slate-950 text-slate-900 dark:text-white flex flex-col justify-between overflow-hidden z-50 font-sans">
      {/* Playful Floating Pattern Backdrops */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div className="absolute top-10 left-10 w-32 h-32 bg-pink-100 rounded-full blur-2xl" />
        <div className="absolute bottom-20 right-10 w-44 h-44 bg-yellow-100 rounded-full blur-3xl" />
      </div>

      {/* Header HUD */}
      <div className="p-4 flex items-center justify-between relative z-10">
        <button 
          id="popit_back_btn"
          onClick={onClose} 
          className="p-3 bg-white/50 border border-pink-200/50 hover:bg-white active:scale-95 rounded-full shadow-sm transition-transform"
        >
          <ArrowLeft className="w-5 h-5 text-pink-600" />
        </button>

        <div className="text-center font-bold">
          <span className="block text-pink-500 text-xs tracking-wider uppercase">Bubble Popit Spelling</span>
          <span className="text-slate-800 dark:text-slate-200">
            气泡网 {currentWordIdx + 1} / {allWords.length}
          </span>
        </div>

        <div className="flex space-x-1.5 bg-white/60 px-3 py-1.5 rounded-full shadow-sm border border-pink-100">
          {Array.from({ length: 5 }).map((_, idx) => (
            <span key={idx} className="text-base">
              {idx < health ? '🎈' : '💨'}
            </span>
          ))}
        </div>
      </div>

      {/* Target Clue Board */}
      {gameState === 'PLAYING' && (
        <div className="px-6 py-2 relative z-10 flex flex-col items-center">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white/95 dark:bg-slate-900 border border-pink-200/80 rounded-3xl p-5 shadow-lg flex items-center space-x-6 max-w-sm w-full"
          >
            {/* Mascot */}
            <span className="text-4xl animate-bounce">🐹</span>
            
            <div className="flex-1">
              <span className="text-[10px] text-pink-500 font-bold uppercase tracking-widest block">中文词义</span>
              <h3 className="text-2xl font-black text-rose-600 dark:text-rose-450 tracking-tight">{activeWord.translation}</h3>
            </div>

            <button
              id="popit_speaker"
              onClick={speakActiveWord}
              className="p-3 hover:bg-slate-100 active:scale-95 bg-pink-100 hover:bg-pink-200 dark:bg-slate-800 rounded-2xl flex items-center justify-center transition-all shadow"
            >
              <Volume2 className="w-6 h-6 text-pink-600" />
            </button>
          </motion.div>

          {/* Spell Indicator Trackers */}
          <div className="flex justify-center space-x-2 mt-4 flex-wrap">
            {activeWord.text.toUpperCase().split('').map((char, idx) => {
              const solved = idx < spelledLetters.length;
              return (
                <motion.div
                  key={idx}
                  animate={solved ? { scale: [1, 1.15, 1] } : {}}
                  className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-lg font-mono border-2 shadow-inner transition-all ${
                    solved 
                      ? 'bg-gradient-to-br from-pink-400 to-rose-400 border-rose-300 text-white shadow-md' 
                      : 'bg-white/90 border-slate-200 text-slate-350 dark:bg-slate-900 dark:border-slate-800'
                  }`}
                >
                  {solved ? char : '_'}
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Play Area */}
      <div className="flex-1 flex flex-col justify-end p-6 relative z-10">
        {gameState === 'INTRO' && (
          <div className="my-auto flex flex-col items-center justify-center text-center max-w-sm mx-auto">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-24 h-24 bg-gradient-to-tr from-pink-400 to-amber-300 rounded-3xl flex items-center justify-center mb-6 shadow-xl shadow-pink-300/30"
            >
              <Smile className="w-14 h-14 text-white" />
            </motion.div>

            <h2 className="text-3xl font-extrabold text-pink-600 mb-2">马卡龙拼拼消消乐</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-8">
              触按粉嘟嘟的马卡龙减压泡泡！伴随解压的脆响，将<b>单词字母按顺序</b>一个个愉快地捏爆吧！拼写就是这么解压！
            </p>

            <button
              id="popit_play_btn"
              onClick={startPlaying}
              className="w-full py-4 bg-gradient-to-r from-pink-500 to-amber-500 hover:opacity-95 text-white font-black text-lg rounded-2xl shadow-xl shadow-pink-500/20 active:scale-95 transition-all"
            >
              开心戳气泡 ⭐
            </button>
          </div>
        )}

        {gameState === 'PLAYING' && (
          <div className="w-full max-w-3xl mx-auto bg-white/70 dark:bg-slate-900/60 border border-pink-200/50 rounded-[40px] p-6 shadow-2xl relative">
            {/* Pop-it board rows */}
            <div className="flex flex-col space-y-4">
              {keyboardRows.map((row, rowIndex) => (
                <div key={rowIndex} className="flex justify-center space-x-2 w-full">
                  {row.map(letter => {
                    const isPopped = poppedLetters[letter] || false;
                    const isTargetCandidate = activeWord.text.toUpperCase()[spelledLetters.length] === letter;
                    return (
                      <motion.button
                        key={letter}
                        id={`popit_btn_${letter}`}
                        onClick={() => handlePopLetter(letter)}
                        whileTap={{ scale: 0.8 }}
                        animate={{ 
                          scale: isPopped ? 0.75 : 1,
                          boxShadow: isPopped 
                            ? 'inset 0 4px 6px rgba(0,0,0,0.15)' 
                            : '0 4px 6px rgba(0,0,0,0.06), inset 0 -2px 0 rgba(0,0,0,0.1)'
                        }}
                        className={`flex-1 max-w-[50px] aspect-square rounded-full flex items-center justify-center text-white text-lg font-black font-mono transition-colors border-2 border-white/40 cursor-pointer ${
                          isPopped 
                            ? 'bg-slate-300 text-slate-500' 
                            : `${rowColors[rowIndex % rowColors.length]} active:opacity-95 hover:brightness-105`
                        } ${isTargetCandidate ? 'ring-4 ring-pink-500/50 shadow-lg' : ''}`}
                      >
                        <span className="drop-shadow-sm select-none">{letter}</span>
                      </motion.button>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Bubble Border Embellishments */}
            <div className="absolute top-2 right-6 flex space-x-1.5 opacity-60">
              <span className="w-2.5 h-2.5 bg-yellow-400 rounded-full" />
              <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full" />
              <span className="w-2.5 h-2.5 bg-pink-400 rounded-full" />
            </div>
          </div>
        )}

        {(gameState === 'WON' || gameState === 'LOST') && (
          <div className="my-auto flex flex-col items-center justify-center text-center max-w-sm mx-auto p-4 bg-white/90 dark:bg-slate-900 border border-pink-200 rounded-[32px] shadow-2xl">
            <span className="text-6xl mb-4 animate-bounce">🍦</span>

            <h2 className="text-2xl font-black text-pink-600 mb-2">
              {gameState === 'WON' ? '气泡泄压完成！ 🍓' : '气泡气压泄露 🎈'}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-8 leading-relaxed">
              {gameState === 'WON'
                ? '每一个字母泡泡都被你以标准的拼写法爆破了！手指太灵活，词义也顺滑地记牢了！'
                : '捏爆的速度不重要，重要的是找对字母！我们平缓呼吸再试一次！'}
            </p>

            <div className="w-full bg-slate-50/50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 flex justify-around mb-8">
              <div className="text-center">
                <span className="block text-slate-400 text-xs">积累解压分</span>
                <span className="text-xl font-bold text-pink-500">+{score} XP</span>
              </div>
              <div className="text-center border-l border-slate-150 pl-8 dark:border-slate-800">
                <span className="block text-slate-400 text-xs">掉落彩糖</span>
                <span className="text-xl font-bold text-amber-500">+{coinsEarned} 🪙</span>
              </div>
            </div>

            <button
              id="popit_finish_btn"
              onClick={() => onFinish(score, coinsEarned)}
              className="w-full py-4 bg-gradient-to-r from-pink-500 to-amber-500 hover:opacity-95 text-white font-bold rounded-2xl active:scale-95 transition-all shadow"
            >
              返回大本营
            </button>
          </div>
        )}
      </div>

      <div className="p-4 text-center text-[10px] text-pink-400/80 font-mono tracking-wider relative z-10">
        FIDGET SPINNER WORD POPIT SYSTEM V.1.2 // SMOOTH SPELLING REWIND
      </div>
    </div>
  );
};

export default WordSpellingPopit;
