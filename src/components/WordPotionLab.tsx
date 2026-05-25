import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { WordGroup, WordItem, UserStats } from '../types';
import { 
  X, ArrowLeft, Volume2, Sparkles, Award, Compass, Info, ShieldAlert
} from 'lucide-react';
import audio from '../utils/AudioUtils';
import confetti from 'canvas-confetti';

interface WordPotionLabProps {
  groups: WordGroup[];
  stats: UserStats;
  onFinish: (score: number, coins: number) => void;
  onClose: () => void;
}

interface FlaskWord {
  id: string;
  word: WordItem;
  text: string;
  translation: string;
  x: number;
  y: number;
  potionColor: string;
  active: boolean;
}

interface PotionCauldron {
  id: string;
  translation: string;
  colorName: string;
  themeClass: string;
}

export const WordPotionLab: React.FC<WordPotionLabProps> = ({ groups, stats, onFinish, onClose }) => {
  const allWords = useMemo(() => {
    let list: WordItem[] = [];
    groups.forEach(g => {
      g.words.forEach(w => {
        list.push(w);
      });
    });
    if (list.length === 0) {
      list = [
        { text: 'cat', translation: '猫咪', imageUrl: '' },
        { text: 'dog', translation: '小狗', imageUrl: '' },
        { text: 'happy', translation: '开心的', imageUrl: '' },
        { text: 'angry', translation: '生气的', imageUrl: '' },
        { text: 'milk', translation: '牛奶', imageUrl: '' },
        { text: 'water', translation: '清水', imageUrl: '' }
      ];
    }
    return [...list].sort(() => Math.random() - 0.5);
  }, [groups]);

  const [gameState, setGameState] = useState<'INTRO' | 'PLAYING' | 'WON' | 'LOST'>('INTRO');
  const [score, setScore] = useState(0);
  const [coinsEarned, setCoinsEarned] = useState(0);
  const [health, setHealth] = useState(5);
  const [combo, setCombo] = useState(0);

  const [flasks, setFlasks] = useState<FlaskWord[]>([]);
  const [cauldrons, setCauldrons] = useState<PotionCauldron[]>([]);
  const [currentActiveFlask, setCurrentActiveFlask] = useState<FlaskWord | null>(null);

  const flaskIndexRef = useRef(0);

  const colors = [
    'from-emerald-400 to-green-500 shadow-emerald-400/50',
    'from-purple-500 to-indigo-500 shadow-purple-500/50',
    'from-pink-400 to-rose-500 shadow-pink-400/50',
    'from-amber-400 to-orange-500 shadow-amber-400/50'
  ];

  const startPlaying = () => {
    setGameState('PLAYING');
    setScore(0);
    setCoinsEarned(0);
    setHealth(5);
    setCombo(0);
    flaskIndexRef.current = 0;
    setupNextLabRound();
  };

  const setupNextLabRound = () => {
    if (allWords.length === 0) return;

    // Pick a primary target word
    const index = flaskIndexRef.current;
    if (index >= allWords.length) {
      setGameState('WON');
      audio.playCheer();
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
      return;
    }

    const targetWord = allWords[index];
    
    // Choose the distractors
    const competitors = allWords
      .filter(w => w.text !== targetWord.text)
      .sort(() => Math.random() - 0.5)
      .slice(0, 1); // 1 competitor cauldron

    if (competitors.length === 0) {
      // safe fallback
      competitors.push({ text: 'dummy', translation: '虚拟药水', imageUrl: '' });
    }

    // Set cauldron tags
    const options = [targetWord, competitors[0]].sort(() => Math.random() - 0.5);
    const labCauldrons: PotionCauldron[] = [
      { id: 'c-1', translation: options[0].translation, colorName: '紫色魔锅', themeClass: 'from-purple-600 to-indigo-800 border-purple-400 shadow-purple-500/30 text-purple-200' },
      { id: 'c-2', translation: options[1].translation, colorName: '翠绿药釜', themeClass: 'from-emerald-600 to-teal-800 border-emerald-400 shadow-emerald-500/30 text-emerald-200' }
    ];

    setCauldrons(labCauldrons);

    // Active flask
    const currentFlask: FlaskWord = {
      id: `flask-${Date.now()}`,
      word: targetWord,
      text: targetWord.text,
      translation: targetWord.translation,
      x: 50,
      y: 0,
      potionColor: colors[Math.floor(Math.random() * colors.length)],
      active: true
    };

    setCurrentActiveFlask(currentFlask);
    
    // Auto speak
    setTimeout(() => {
      audio.speak(targetWord.text);
    }, 400);
  };

  const handleDragDropPotion = (chosenCauldron: PotionCauldron) => {
    if (!currentActiveFlask || gameState !== 'PLAYING') return;

    const isMatch = chosenCauldron.translation === currentActiveFlask.translation;

    if (isMatch) {
      // SUCCESS ALCHEMY!
      audio.playSuccess();
      const nextCombo = combo + 1;
      setCombo(nextCombo);
      const reward = 20 + Math.min(nextCombo * 5, 40);
      setScore(s => s + reward);
      setCoinsEarned(c => c + 2);

      // Sparkles at cauldron location index
      confetti({
        particleCount: 20,
        spread: 30,
        origin: { y: 0.72 }
      });

      // Clear flask and load next
      setCurrentActiveFlask(null);
      setTimeout(() => {
        flaskIndexRef.current += 1;
        setupNextLabRound();
      }, 700);
    } else {
      // FAILING ALCHEMY, EXPLOSION SMOKE!
      audio.playError();
      setCombo(0);
      setHealth(h => {
        const next = h - 1;
        if (next <= 0) {
          setGameState('LOST');
        }
        return next;
      });

      // Flash cauldron warning briefly
    }
  };

  const speakWord = () => {
    if (currentActiveFlask) {
      audio.speak(currentActiveFlask.text);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950 text-white flex flex-col justify-between overflow-hidden z-50 font-sans">
      {/* Mystical potion shelves & bubbles backdrop elements */}
      <div className="absolute inset-0 pointer-events-none opacity-15">
        <div className="absolute top-24 left-10 w-4 h-4 bg-teal-400 rounded-full animate-bounce [animation-duration:3s]" />
        <div className="absolute bottom-32 right-12 w-6 h-6 bg-purple-400 rounded-full animate-bounce [animation-duration:4s]" />
        <div className="absolute top-1/2 left-2/3 w-3 h-3 bg-pink-400 rounded-full animate-ping" />
      </div>

      {/* Top HUD */}
      <div className="p-4 flex items-center justify-between relative z-10">
        <button 
          id="potion_back_btn"
          onClick={onClose} 
          className="p-3 bg-white/10 hover:bg-white/20 active:scale-95 rounded-full transition-transform"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="text-center">
          <span className="block text-purple-400 text-[10px] tracking-widest font-bold font-mono">ALCHEMY LAB</span>
          <span className="font-bold text-slate-350 text-sm">
            本期实验 {flaskIndexRef.current + 1} / {allWords.length}
          </span>
        </div>

        <div className="flex space-x-1">
          {Array.from({ length: 5 }).map((_, idx) => (
            <span key={idx} className="text-lg">
              {idx < health ? '🔮' : '💀'}
            </span>
          ))}
        </div>
      </div>

      {/* Game body */}
      <div className="flex-1 flex flex-col justify-between p-6 relative z-10">
        {gameState === 'INTRO' && (
          <div className="my-auto flex flex-col items-center justify-center text-center max-w-sm mx-auto">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 3 }}
              className="w-24 h-24 bg-gradient-to-tr from-purple-500 to-pink-500 rounded-3xl flex items-center justify-center mb-6 shadow-xl shadow-purple-500/30"
            >
              <Award className="w-14 h-14 text-white animate-pulse" />
            </motion.div>

            <h2 className="text-3xl font-extrabold mb-2 tracking-tight">奇幻药水融合坩埚</h2>
            <p className="text-slate-400 text-sm leading-relaxed mb-8">
              桌上放着贴着英文单词密语的魔法试剂瓶。在下方两个沸腾起烟、分别贴着不同译文翻译标记的坩埚里，抓准时机倾倒正确的坩埚吧！
            </p>

            <button
              id="potion_start_btn"
              onClick={startPlaying}
              className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-extrabold text-lg rounded-2xl shadow-xl shadow-purple-500/20 active:scale-95 transition-all"
            >
              配置神药 🧪
            </button>
          </div>
        )}

        {gameState === 'PLAYING' && (
          <div className="flex-1 flex flex-col justify-between">
            {/* Shelf & Active Flask to assign */}
            <div className="flex-1 flex flex-col items-center justify-center relative">
              <AnimatePresence mode="wait">
                {currentActiveFlask && (
                  <motion.div
                    key={currentActiveFlask.id}
                    initial={{ y: -80, scale: 0.5, opacity: 0 }}
                    animate={{ y: 0, scale: 1, opacity: 1 }}
                    exit={{ scale: 0.2, opacity: 0, transition: { duration: 0.2 } }}
                    className="flex flex-col items-center"
                  >
                    {/* Alchemist Glowing Magic Circle */}
                    <div className="absolute w-44 h-44 border-2 border-dashed border-indigo-500/30 rounded-full animate-spin [animation-duration:20s] pointer-events-none" />

                    {/* Flask flask representation */}
                    <div className="w-28 h-32 relative cursor-pointer group flex flex-col items-center justify-center">
                      <div className="w-8 h-6 bg-slate-700/60 border border-slate-600 rounded-t-md relative z-10" />
                      <div className={`w-28 h-28 rounded-b-[40px] rounded-t-[14px] bg-gradient-to-b ${currentActiveFlask.potionColor} border-2 border-white/30 flex items-center justify-center relative shadow-lg`}>
                        {/* Bubble anim inside */}
                        <div className="absolute top-6 left-6 w-3.5 h-3.5 bg-white/25 rounded-full animate-ping pointer-events-none" />
                        
                        <span className="font-mono text-xl font-black text-slate-950 bg-white/90 px-3 py-1 rounded-xl shadow border border-slate-200 uppercase tracking-wider text-center max-w-[100px] truncate">
                          {currentActiveFlask.text}
                        </span>
                      </div>
                    </div>

                    <button
                      id="potion_sound_btn"
                      onClick={speakWord}
                      className="mt-6 px-4 py-2 bg-slate-900 border border-slate-800 rounded-full flex items-center space-x-2 text-xs text-indigo-300 hover:text-white"
                    >
                      <Volume2 className="w-4 h-4" />
                      <span>发音默读朗读</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Cauldrons Selection Row */}
            <div className="grid grid-cols-2 gap-4 mt-8">
              {cauldrons.map(cauldron => (
                <motion.button
                  key={cauldron.id}
                  id={`cauldron_btn_${cauldron.id}`}
                  onClick={() => handleDragDropPotion(cauldron)}
                  whileHover={{ y: -6, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`py-8 px-4 rounded-[32px] bg-gradient-to-b ${cauldron.themeClass} border-4 shadow-2xl flex flex-col items-center justify-center relative cursor-pointer overflow-hidden group`}
                >
                  {/* Boiling animation ring */}
                  <div className="absolute -top-6 w-24 h-6 bg-white/10 rounded-full animate-pulse filter blur-sm pointer-events-none" />

                  {/* Bubbles float representation */}
                  <div className="absolute top-1/2 left-1/4 w-3.5 h-3.5 bg-white/20 rounded-full animate-bounce [animation-duration:2s]" />
                  <div className="absolute top-1/3 right-1/4 w-2 h-2 bg-white/20 rounded-full animate-bounce [animation-duration:3.2s]" />

                  <span className="text-3xl mb-3 animate-pulse">🍯</span>
                  <span className="block text-[10px] text-white/50 uppercase tracking-widest font-mono mb-1">{cauldron.colorName}</span>
                  <h4 className="text-xl font-black drop-shadow text-white tracking-tight">{cauldron.translation}</h4>
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {(gameState === 'WON' || gameState === 'LOST') && (
          <div className="my-auto flex flex-col items-center justify-center text-center max-w-sm mx-auto">
            <span className="text-6xl mb-6">
              {gameState === 'WON' ? '👑' : '🔥'}
            </span>

            <h2 className="text-3xl font-black mb-2">
              {gameState === 'WON' ? '满级大炼金术士！' : '炼金炉炉温过高'}
            </h2>
            <p className="text-slate-400 text-sm mb-8 leading-relaxed">
              {gameState === 'WON'
                ? '你对所有的英文含义了如指掌！这炉魔法药水炼制得无比纯净，将大大增强小宠物的法力！'
                : '真可惜，魔药稍微混进了一点杂质！重新温习一下单词，继续我们的融合实验！'}
            </p>

            <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 flex justify-around mb-8">
              <div className="text-center">
                <span className="block text-slate-400 text-xs">药力经验</span>
                <span className="text-2xl font-black text-purple-400">+{score} XP</span>
              </div>
              <div className="text-center border-l border-slate-800 pl-8">
                <span className="block text-slate-400 text-xs">出炉精金</span>
                <span className="text-2xl font-black text-amber-400">+{coinsEarned} 🪙</span>
              </div>
            </div>

            <button
              id="potion_win_exit"
              onClick={() => onFinish(score, coinsEarned)}
              className="w-full py-4 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold rounded-2xl shadow-xl active:scale-95 transition-all"
            >
              返回大本营
            </button>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-slate-900 text-center text-xs text-slate-600 font-mono">
        POTION SYNTHESIS STABILIZED // ALCHEMY CODECS SECURE
      </div>
    </div>
  );
};

export default WordPotionLab;
