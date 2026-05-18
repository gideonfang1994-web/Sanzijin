
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WordGroup, WordItem } from '../types';
import { X, Trophy, AlertCircle, RefreshCw, Zap, Star, Layers } from 'lucide-react';
import audio from '../utils/AudioUtils';
import confetti from 'canvas-confetti';
import SafeImage from './SafeImage';

interface Tile {
  id: string;
  wordId: string;
  type: 'text' | 'translation' | 'image';
  content: string;
  isImage: boolean;
  zIndex: number;
  x: number;
  y: number;
  isBlocked: boolean;
}

interface Props {
  groups: WordGroup[];
  onFinish: (score: number, coins: number) => void;
  onClose: () => void;
}

const SheepMatch: React.FC<Props> = ({ groups, onFinish, onClose }) => {
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [slots, setSlots] = useState<Tile[]>([]);
  const [gameState, setGameState] = useState<'PLAYING' | 'WON' | 'LOST'>('PLAYING');
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [lastMatchTime, setLastMatchTime] = useState(0);
  const [combo, setCombo] = useState(0);
  const [feedback, setFeedback] = useState<{ text: string, subtext: string, color: string, bgColor: string, borderColor: string } | null>(null);

  const feedbackLevels = [
    { 
      threshold: 2, 
      slogans: ['连消!', '精准捕捉!', '双重魔力!', '眼疾手快!', '森林律动!'],
      subtext: 'COMBO MATCH',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200'
    },
    { 
      threshold: 3, 
      slogans: ['三连奇迹!', '自然赐福!', '三阳开泰!', '森林守护!', '绝妙共响!'],
      subtext: 'NATURE BLESSED',
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-300'
    },
    { 
      threshold: 4, 
      slogans: ['魔法风暴!', '森林之王!', '瞬息万变!', '绝对掌控!', '神迹重现!'],
      subtext: 'LEGENDARY MATCH',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-300'
    },
  ];

  const triggerFeedback = (count: number) => {
    const level = [...feedbackLevels].reverse().find(l => count >= l.threshold);
    if (level) {
      const randomSlogan = level.slogans[Math.floor(Math.random() * level.slogans.length)];
      setFeedback({ 
        text: randomSlogan, 
        subtext: level.subtext,
        color: level.color,
        bgColor: level.bgColor,
        borderColor: level.borderColor
      });
      setTimeout(() => setFeedback(null), 1200);
    }
  };

  const SLOT_CAPACITY = 7;
  const [syncedImages, setSyncedImages] = useState<Record<string, string>>({});

  useEffect(() => {
    const saved = localStorage.getItem('adventure_synced_images');
    if (saved) {
      setSyncedImages(JSON.parse(saved));
    }
    initGame();
  }, [groups, level]);

  const initGame = () => {
    const learnedWords: { word: WordItem, groupId: string }[] = [];
    groups.forEach(g => {
      g.words.forEach(w => {
        learnedWords.push({ word: w, groupId: g.id });
      });
    });

    if (learnedWords.length === 0) {
      setGameState('LOST');
      return;
    }

    // Pick words for the level - more words for higher levels
    const wordCount = Math.min(learnedWords.length, 3 + level * 2);
    const selected = [...learnedWords].sort(() => Math.random() - 0.5).slice(0, wordCount);
    
    // For "Sheep-a-sheep" we want sets of 3.
    const setsOfThree = 3 + level; 
    const gameWords = [];
    for(let i=0; i<setsOfThree; i++) {
       gameWords.push(selected[i % selected.length]);
    }

    const newTiles: Tile[] = [];
    gameWords.forEach((item) => {
      const types: ('text' | 'translation' | 'image')[] = ['text', 'translation', 'image'];
      types.forEach(type => {
        newTiles.push({
          id: `${item.word.text}-${type}-${Math.random()}`,
          wordId: item.word.text,
          type,
          content: type === 'text' ? item.word.text : (type === 'translation' ? item.word.translation : item.word.imageUrl || `https://placehold.co/200x200/indigo/white?text=${item.word.text}`),
          isImage: type === 'image',
          zIndex: 0,
          x: 0,
          y: 0,
          isBlocked: false
        });
      });
    });

    const layeredTiles = newTiles.sort(() => Math.random() - 0.5).map((tile, i) => {
      const layer = Math.floor(i / 12);
      const posInLayer = i % 12;
      const row = Math.floor(posInLayer / 3);
      const col = posInLayer % 3;
      
      const offsetX = (layer % 2) * 10 + (Math.random() * 8 - 4);
      const offsetY = (layer % 3) * 10 + (Math.random() * 8 - 4);
      
      return {
        ...tile,
        zIndex: layer,
        x: col * 85 + offsetX + 20,
        y: row * 85 + offsetY + 40,
      };
    });

    setTiles(checkBlocking(layeredTiles));
    setSlots([]);
    setGameState('PLAYING');
  };

  const checkBlocking = (currentTiles: Tile[]) => {
    return currentTiles.map(tile => {
      const isBlocked = currentTiles.some(other => 
        other.zIndex > tile.zIndex && 
        Math.abs(other.x - tile.x) < 60 && 
        Math.abs(other.y - tile.y) < 60
      );
      return { ...tile, isBlocked };
    });
  };

  const handleTileClick = (tile: Tile) => {
    if (tile.isBlocked || gameState !== 'PLAYING' || slots.length >= SLOT_CAPACITY) return;

    audio.playClick();
    
    const remainingTiles = tiles.filter(t => t.id !== tile.id);
    const newSlots = [...slots, tile];
    
    // Re-order slots
    const sortedSlots: Tile[] = [];
    const grouped: Record<string, Tile[]> = {};
    newSlots.forEach(s => {
      if (!grouped[s.wordId]) grouped[s.wordId] = [];
      grouped[s.wordId].push(s);
    });
    
    Object.keys(grouped).forEach(id => {
      sortedSlots.push(...grouped[id]);
    });

    setSlots(sortedSlots);
    setTiles(checkBlocking(remainingTiles));

    if (grouped[tile.wordId]?.length === 3) {
      setTimeout(() => {
        audio.playSuccess();
        audio.speak(tile.wordId);
        
        const finalSlots = sortedSlots.filter(s => s.wordId !== tile.wordId);
        setSlots(finalSlots);

        const now = Date.now();
        let newCombo = 1;
        if (now - lastMatchTime < 3000) {
          newCombo = combo + 1;
        }
        setCombo(newCombo);
        setLastMatchTime(now);
        triggerFeedback(newCombo);
        
        const comboBonus = (newCombo - 1) * 50;
        setScore(prev => prev + 100 + comboBonus);
        
        confetti({
          particleCount: 20 + newCombo * 10,
          spread: 30 + newCombo * 5,
          origin: { y: 0.8 },
          colors: ['#10b981', '#34d399', '#fbbf24']
        });

        if (remainingTiles.length === 0 && finalSlots.length === 0) {
          setGameState('WON');
          audio.playCheer();
          confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
        }
      }, 300);
    } else if (newSlots.length >= SLOT_CAPACITY) {
      setGameState('LOST');
      audio.playError();
    }
  };

  return (
    <div className="fixed inset-0 bg-emerald-50 z-[100] flex flex-col overflow-hidden font-sans">
      {/* Background Magical Patterns */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <div 
            key={i} 
            className="absolute w-96 h-96 border-[30px] border-emerald-900 rounded-full"
            style={{ 
              left: `${(i % 2) * 60 - 10}%`, 
              top: `${Math.floor(i / 2) * 40 - 10}%`,
              transform: `rotate(${i * 25}deg)` 
            }}
          />
        ))}
      </div>
      
      {/* Floating Sparkles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -30, 0],
              opacity: [0.1, 0.3, 0.1],
              scale: [1, 1.2, 1]
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: i * 0.2
            }}
            className="absolute w-2 h-2 bg-emerald-300 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`
            }}
          />
        ))}
      </div>

      <nav className="p-6 flex items-center justify-between bg-white/80 backdrop-blur-xl border-b-2 border-emerald-100 relative z-20">
        <AnimatePresence>
          {feedback && (
            <motion.div 
              initial={{ scale: 0.6, opacity: 0, y: 60, rotate: -5 }}
              animate={{ scale: 1, opacity: 1, y: 100, rotate: 0 }}
              exit={{ scale: 1.2, opacity: 0, y: 140 }}
              className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none"
            >
              <div className={`flex flex-col items-center justify-center ${feedback.bgColor} ${feedback.borderColor} border-2 px-8 py-3.5 rounded-[32px] shadow-[0_20px_40px_rgba(0,0,0,0.12)] backdrop-blur-md`}>
                <div className="flex items-center space-x-2 mb-0.5">
                  <Star className={feedback.color} size={15} fill="currentColor" />
                  <span className={`text-[9px] font-black uppercase tracking-[0.3em] ${feedback.color} opacity-70`}>
                    {feedback.subtext}
                  </span>
                  <Star className={feedback.color} size={15} fill="currentColor" />
                </div>
                <div className={`${feedback.color} font-black text-3xl tracking-tight italic`}>
                  {feedback.text}
                </div>
              </div>
            </motion.div>
          )}
          
          {combo >= 2 && (
             <motion.div
               key="combo-badge"
               initial={{ y: -50, opacity: 0, scale: 0.5 }}
               animate={{ y: 0, opacity: 1, scale: 1 }}
               className="absolute top-2 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-400 to-teal-500 text-white px-5 py-1.5 rounded-full font-black text-xs italic shadow-lg border-b-4 border-emerald-700 flex items-center space-x-1.5 z-40"
             >
               <Zap size={14} className="animate-pulse" />
               <span>{combo} COMBO!</span>
             </motion.div>
          )}
        </AnimatePresence>
        
        <div className="flex items-center space-x-3">
          <div className="bg-emerald-600 p-3 rounded-2xl text-white shadow-xl shadow-emerald-100 relative overflow-hidden group">
            <Layers size={24} className="relative z-10" />
            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-emerald-950 tracking-tight leading-tight">遗迹残篇</h2>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100">Floor {level}</span>
              <div className="w-1 h-1 bg-emerald-200 rounded-full" />
              <div className="flex items-center text-amber-500 space-x-1">
                <Star size={12} className="fill-amber-500" />
                <span className="text-xs font-black tabular-nums">{score}</span>
              </div>
            </div>
          </div>
        </div>
        <button onClick={onClose} className="w-12 h-12 bg-white border-2 border-emerald-50 rounded-2xl flex items-center justify-center text-emerald-400 hover:bg-emerald-50 hover:text-rose-500 transition-all shadow-sm">
          <X size={24} />
        </button>
      </nav>

      <div className="flex-1 relative overflow-hidden flex items-center justify-center p-4">
        <div className="relative w-full max-w-[340px] h-[480px]">
          <AnimatePresence>
            {tiles.map((tile) => (
              <motion.button
                key={tile.id}
                layoutId={tile.id}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ 
                  opacity: 1, 
                  scale: 1,
                  left: tile.x,
                  top: tile.y,
                  zIndex: tile.zIndex,
                }}
                exit={{ scale: 1.2, opacity: 0 }}
                onClick={() => handleTileClick(tile)}
                disabled={tile.isBlocked}
                className={`absolute w-20 h-20 sm:w-24 sm:h-24 rounded-[28px] border-b-6 transition-all duration-500 flex items-center justify-center p-2 shadow-xl
                  ${tile.isBlocked 
                    ? 'bg-slate-100 border-slate-300 grayscale-[0.9] opacity-70 translate-y-2' 
                    : 'bg-white border-emerald-200 ring-4 ring-emerald-50/50 hover:border-emerald-500 hover:shadow-2xl hover:shadow-emerald-200 active:translate-y-1 active:border-b-0'}
                  group 
                `}
              >
                {!tile.isBlocked && (
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/40 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity rounded-[28px]" />
                )}
                <div className={`w-full h-full rounded-2xl flex items-center justify-center p-1 overflow-hidden ${tile.isBlocked ? 'bg-slate-50' : 'bg-emerald-50/30'}`}>
                  {tile.isImage ? (
                    <SafeImage 
                      src={syncedImages[tile.wordId] || tile.content} 
                      alt="" 
                      className="w-full h-full object-contain filter drop-shadow-sm"
                      fallbackText={tile.wordId}
                      width="96"
                      height="96"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center leading-none p-1">
                      <span className={`font-black text-center break-words ${tile.type === 'text' ? 'text-emerald-800 text-xs sm:text-sm' : 'text-emerald-500 text-[9px] sm:text-[11px]'}`}>
                        {tile.content}
                      </span>
                    </div>
                  )}
                </div>
                {/* Decorative dot */}
                <div className={`absolute top-2 right-2 w-1.5 h-1.5 rounded-full ${tile.isBlocked ? 'bg-slate-300' : 'bg-emerald-400 animate-pulse'}`} />
              </motion.button>
            ))}
          </AnimatePresence>
        </div>
      </div>

      <footer className="bg-white/90 backdrop-blur-2xl p-8 pb-12 shadow-[0_-20px_60px_-15px_rgba(0,0,0,0.15)] rounded-t-[56px] border-t-4 border-emerald-50 relative z-30">
        <div className="text-center mb-6">
           <div className="inline-flex items-center space-x-2 bg-emerald-50 px-4 py-1.5 rounded-2xl border-2 border-emerald-100/50">
              <Zap size={14} className="text-emerald-500 animate-pulse" />
              <span className="text-[10px] font-black text-emerald-700 uppercase tracking-[0.3em]">Summoning Altar</span>
           </div>
        </div>
        
        <div className="flex justify-center space-x-2.5 h-20 sm:h-24 mb-8 bg-gradient-to-b from-emerald-50/80 to-transparent rounded-[40px] p-3 items-center border-[3px] border-dashed border-emerald-200/50 relative">
          <AnimatePresence>
            {Array.from({ length: SLOT_CAPACITY }).map((_, i) => (
              <div key={i} className="w-14 h-14 sm:w-16 sm:h-16 rounded-[20px] bg-white border-2 border-dashed border-emerald-100 flex items-center justify-center overflow-hidden relative shadow-inner">
                {slots[i] && (
                  <motion.div 
                    layoutId={slots[i].id}
                    className="absolute inset-0 bg-white flex items-center justify-center p-1.5 shadow-lg z-10 border border-emerald-100"
                  >
                    {slots[i].isImage ? (
                      <SafeImage 
                        src={syncedImages[slots[i].wordId] || slots[i].content} 
                        alt="" 
                        className="w-full h-full object-contain"
                        fallbackText={slots[i].wordId}
                        width="64"
                        height="64"
                      />
                    ) : (
                      <span className="text-[10px] sm:text-xs font-black text-emerald-800 text-center leading-tight break-words">{slots[i].content}</span>
                    )}
                  </motion.div>
                )}
                {/* Slot index number subtle */}
                {!slots[i] && <span className="text-[10px] font-black text-emerald-100">{i + 1}</span>}
              </div>
            ))}
          </AnimatePresence>
          
          {/* Over-capacity warning danger glow */}
          {slots.length >= SLOT_CAPACITY - 1 && (
             <div className="absolute inset-0 ring-4 ring-rose-500/20 rounded-[40px] animate-pulse pointer-events-none" />
          )}
        </div>
        
        <AnimatePresence>
          {gameState === 'LOST' && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-4"
            >
              <div className="flex items-center justify-center text-rose-500 font-black text-lg">
                <AlertCircle className="mr-2" /> 槽位已满，法阵失效！
              </div>
              <div className="grid grid-cols-2 gap-4">
                <button onClick={initGame} className="py-4 bg-emerald-500 text-white rounded-2xl font-black shadow-lg flex items-center justify-center hover:bg-emerald-600 transition-all">
                  <RefreshCw className="mr-2" size={20} /> 重试
                </button>
                <button onClick={onClose} className="py-4 bg-slate-100 text-slate-500 rounded-2xl font-black hover:bg-slate-200 transition-all">
                  放弃
                </button>
              </div>
            </motion.div>
          )}

          {gameState === 'WON' && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-4"
            >
              <div className="flex items-center justify-center text-emerald-600 font-black text-2xl">
                <Trophy className="mr-2 text-amber-500" /> 魔法大胜利！
              </div>
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => { setLevel(l => l + 1); setScore(prev => prev + 500); }} 
                  className="py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl font-black shadow-lg flex items-center justify-center"
                >
                  <Zap className="mr-2" size={20} /> 下一关
                </button>
                <button 
                  onClick={() => onFinish(score, Math.floor(score / 5))} 
                  className="py-4 bg-white border-2 border-emerald-100 text-emerald-600 rounded-2xl font-black"
                >
                  领取奖励
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </footer>
    </div>
  );
};

export default SheepMatch;
