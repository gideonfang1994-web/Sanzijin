
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, Play, Gamepad2, RefreshCw, Star, Trophy,
  ArrowRight, Volume2, Lock, CheckCircle2, Zap
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { WordItem, WordCard, AdventureForestProps } from '../types';
import { ALL_CARDS } from '../constants';
import audio from '../utils/AudioUtils';

type AdventureStep = 'SETUP' | 'MAP' | 'LEARN' | 'GAME' | 'COMPLETE';

interface Level {
  id: number;
  name: string;
  cards: WordCard[];
  isUnlocked: boolean;
  isCompleted: boolean;
}

const AdventurePage: React.FC<AdventureForestProps> = ({ onClose, onCompleteLevel }) => {
  const [step, setStep] = useState<AdventureStep>('SETUP');
  const [cardsPerDay, setCardsPerDay] = useState<5 | 10>(5);
  const [currentLevelId, setCurrentLevelId] = useState<number>(1);
  const [completedLevels, setCompletedLevels] = useState<number[]>([]);
  const [activeLevel, setActiveLevel] = useState<Level | null>(null);
  
  // Learning session state
  const [cardIndex, setCardIndex] = useState(0);
  const [gameOptions, setGameOptions] = useState<string[]>([]);
  const [currentGameWord, setCurrentGameWord] = useState<WordItem | null>(null);

  // Load progress
  useEffect(() => {
    const saved = localStorage.getItem('adventure_forest_progress');
    if (saved) {
      const data = JSON.parse(saved);
      setCardsPerDay(data.cardsPerDay || 5);
      setCompletedLevels(data.completedLevels || []);
      setStep('MAP');
    }
  }, []);

  // Save progress
  const saveProgress = (newCompleted: number[]) => {
    localStorage.setItem('adventure_forest_progress', JSON.stringify({
      cardsPerDay,
      completedLevels: newCompleted
    }));
  };

  // Generate levels
  const levels = useMemo(() => {
    const generatedLevels: Level[] = [];
    for (let i = 0; i < ALL_CARDS.length; i += cardsPerDay) {
      const levelId = Math.floor(i / cardsPerDay) + 1;
      const levelCards = ALL_CARDS.slice(i, i + cardsPerDay);
      generatedLevels.push({
        id: levelId,
        name: levelCards[0]?.levelName || `神秘关卡 ${levelId}`,
        cards: levelCards,
        isUnlocked: levelId === 1 || completedLevels.includes(levelId - 1),
        isCompleted: completedLevels.includes(levelId)
      });
    }
    return generatedLevels;
  }, [cardsPerDay, completedLevels]);

  const startLevel = (level: Level) => {
    setActiveLevel(level);
    setCurrentLevelId(level.id);
    setCardIndex(0);
    setStep('LEARN');
  };

  const nextLearn = () => {
    if (!activeLevel) return;
    if (cardIndex < activeLevel.cards.length - 1) {
      setCardIndex(prev => prev + 1);
    } else {
      // Mark level as completed immediately after learning
      const newCompleted = [...new Set([...completedLevels, currentLevelId])];
      setCompletedLevels(newCompleted);
      saveProgress(newCompleted);
      setStep('COMPLETE');
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  };

  const speakRhyme = (rhyme: string) => {
    // Remove content inside brackets/parentheses (the Chinese translations)
    const cleanRhyme = rhyme.replace(/\([^)]*\)|（[^）]*）/g, '').replace(/\s+/g, ' ').trim();
    audio.speak(cleanRhyme);
  };

  const handleGoToArcade = () => {
    if (activeLevel && onCompleteLevel) {
      const levelWords = activeLevel.cards.flatMap(c => c.words);
      onCompleteLevel(levelWords);
    }
  };

  return (
    <div className="fixed inset-0 bg-emerald-50 z-[60] overflow-y-auto pb-20">
      {/* Header */}
      <div className="sticky top-0 bg-white/80 backdrop-blur-md p-4 flex items-center justify-between border-b border-emerald-100 z-10">
        <button onClick={onClose} className="p-2 hover:bg-emerald-100 rounded-full transition-colors">
          <ChevronLeft size={24} className="text-emerald-700" />
        </button>
        <h2 className="text-xl font-black text-emerald-800 tracking-tight">冒险森林</h2>
        <div className="w-10"></div>
      </div>

      <div className="max-w-md mx-auto p-6">
        <AnimatePresence mode="wait">
          {step === 'SETUP' && (
            <motion.div key="setup" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8 py-10">
              <div className="text-center space-y-4">
                <motion.div 
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="text-8xl mb-6 drop-shadow-2xl"
                >
                  🏰
                </motion.div>
                <h3 className="text-4xl font-black text-emerald-900 tracking-tight">魔法森林大冒险</h3>
                <p className="text-emerald-600 font-bold text-lg max-w-[280px] mx-auto leading-relaxed">
                  勇敢的小魔法师，准备好开启你的单词探险之旅了吗？
                </p>
              </div>

              <div className="grid gap-6">
                <motion.button 
                  whileHover={{ scale: 1.02, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { setCardsPerDay(5); setStep('MAP'); saveProgress([]); }} 
                  className="bg-white p-8 rounded-[40px] border-4 border-emerald-100 hover:border-emerald-500 transition-all text-left shadow-xl shadow-emerald-100/50 relative overflow-hidden group"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Star size={64} className="text-emerald-500" />
                  </div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-2xl font-black text-emerald-800">森林漫步</span>
                    <span className="bg-emerald-100 text-emerald-700 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">轻松模式</span>
                  </div>
                  <p className="text-emerald-600 font-bold">每天挑战 5 张魔法卡片</p>
                  <p className="text-[10px] font-black text-emerald-300 uppercase tracking-widest mt-4">适合初级魔法学徒</p>
                </motion.button>

                <motion.button 
                  whileHover={{ scale: 1.02, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { setCardsPerDay(10); setStep('MAP'); saveProgress([]); }} 
                  className="bg-white p-8 rounded-[40px] border-4 border-emerald-100 hover:border-emerald-500 transition-all text-left shadow-xl shadow-emerald-100/50 relative overflow-hidden group"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Zap size={64} className="text-amber-500" />
                  </div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-2xl font-black text-emerald-800">极速穿梭</span>
                    <span className="bg-amber-100 text-amber-700 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">极速模式</span>
                  </div>
                  <p className="text-emerald-600 font-bold">每天挑战 10 张魔法卡片</p>
                  <p className="text-[10px] font-black text-emerald-300 uppercase tracking-widest mt-4">适合高级魔法大师</p>
                </motion.button>
              </div>
            </motion.div>
          )}

          {step === 'MAP' && (
            <motion.div key="map" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
              <div className="text-center space-y-2">
                <h3 className="text-3xl font-black text-emerald-900">魔法森林地图</h3>
                <p className="text-emerald-600 font-medium">开启你的单词冒险之旅</p>
              </div>
              
              <div className="bg-white/60 backdrop-blur-sm rounded-[32px] p-6 border-2 border-emerald-100 shadow-sm flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-emerald-500 text-white p-2.5 rounded-2xl shadow-lg shadow-emerald-100"><Trophy size={24} /></div>
                  <div>
                    <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest leading-none mb-1">Adventure Progress</p>
                    <p className="text-xl font-black text-emerald-900 leading-none">{completedLevels.length} / {levels.length} <span className="text-sm font-bold opacity-40">Levels</span></p>
                  </div>
                </div>
                <button onClick={() => setStep('SETUP')} className="bg-emerald-100 p-3 rounded-2xl text-emerald-600 hover:bg-emerald-200 transition-all"><RefreshCw size={18} /></button>
              </div>

              <div className="relative py-10 px-4">
                {/* Path Line */}
                <div className="absolute left-1/2 top-0 bottom-0 w-3 bg-emerald-100/50 -translate-x-1/2 rounded-full overflow-hidden">
                   <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: `${(completedLevels.length / levels.length) * 100}%` }}
                    className="w-full bg-emerald-400"
                   />
                </div>

                <div className="space-y-16 relative z-10">
                  {levels.map((level, index) => {
                    const isEven = index % 2 === 0;
                    const isLocked = !level.isUnlocked;
                    const isCurrent = level.isUnlocked && !level.isCompleted;
                    
                    return (
                      <div key={level.id} className={`flex items-center ${isEven ? 'flex-row' : 'flex-row-reverse'}`}>
                        <motion.div 
                          whileHover={!isLocked ? { scale: 1.05 } : {}}
                          className={`w-1/2 flex ${isEven ? 'justify-end pr-10' : 'justify-start pl-10'}`}
                        >
                          <div className={`${isEven ? 'text-right' : 'text-left'}`}>
                            <h4 className={`font-black text-lg leading-tight whitespace-nowrap ${isLocked ? 'text-emerald-200' : 'text-emerald-800'}`}>{level.name}</h4>
                            <div className="flex items-center mt-1 space-x-1 opacity-60 whitespace-nowrap">
                               <span className={`text-[10px] font-black uppercase tracking-tighter ${isLocked ? 'text-emerald-200' : 'text-emerald-500'}`}>关卡 {level.id} • {level.cards.length} 魔法</span>
                            </div>
                          </div>
                        </motion.div>

                        <div className="relative">
                          {isCurrent && (
                            <motion.div 
                              layoutId="current-indicator"
                              className="absolute inset-0 bg-emerald-400 rounded-full blur-xl opacity-40"
                              animate={{ scale: [1, 1.4, 1] }}
                              transition={{ duration: 2, repeat: Infinity }}
                            />
                          )}
                          <button 
                            onClick={() => level.isUnlocked && startLevel(level)} 
                            disabled={isLocked} 
                            className={`w-20 h-20 rounded-[28px] border-[6px] flex items-center justify-center transition-all shadow-xl relative z-10 ${
                              isLocked 
                                ? 'bg-emerald-50 border-emerald-100 text-emerald-200 cursor-not-allowed' 
                                : level.isCompleted 
                                  ? 'bg-emerald-500 border-emerald-200 text-white hover:scale-105' 
                                  : 'bg-white border-emerald-500 text-emerald-600 scale-110 hover:scale-125 hover:rotate-6'
                            }`}
                          >
                            {isLocked ? <Lock size={28} /> : level.isCompleted ? <CheckCircle2 size={32} /> : <Play size={32} className="ml-1 fill-emerald-600" />}
                            
                            {/* Level Number Badge */}
                            <div className={`absolute -top-3 -right-3 w-8 h-8 rounded-full border-4 border-white flex items-center justify-center text-[10px] font-black shadow-md ${isLocked ? 'bg-emerald-100 text-emerald-300' : 'bg-emerald-800 text-white'}`}>
                              {level.id}
                            </div>
                          </button>
                        </div>

                        <div className="w-1/2"></div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {step === 'LEARN' && activeLevel && (
            <motion.div key="learn" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6 py-6">
              <div className="flex items-center justify-between px-2">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest leading-none mb-1">{activeLevel.name}</span>
                  <h3 className="text-2xl font-black text-emerald-900 leading-none">第 {currentLevelId} 关</h3>
                </div>
                <div className="bg-white px-4 py-2 rounded-2xl border-2 border-emerald-100 font-black text-emerald-700 text-sm">
                  {cardIndex + 1} <span className="opacity-30 mx-1">/</span> {activeLevel.cards.length}
                </div>
              </div>

              <div className="bg-white rounded-[48px] p-8 shadow-2xl border-4 border-white space-y-10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full -mr-16 -mt-16 opacity-50" />
                
                {/* Top: 3 words + images */}
                <div className="grid grid-cols-3 gap-4 relative z-10">
                  {activeLevel.cards[cardIndex].words.map((word, i) => (
                    <motion.div 
                      key={i} 
                      whileHover={{ scale: 1.05, y: -5 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => audio.speak(word.text)} 
                      className="flex flex-col items-center p-3 bg-emerald-50/50 rounded-[32px] cursor-pointer border-2 border-transparent hover:border-emerald-200 hover:bg-white transition-all shadow-sm"
                    >
                      <div className="w-full aspect-square bg-white rounded-2xl mb-3 flex items-center justify-center p-2 shadow-inner">
                        <img 
                          src={word.imageUrl} 
                          alt={word.text} 
                          className="w-full h-full object-contain" 
                          referrerPolicy="no-referrer" 
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            if (target.src.includes('fluency')) {
                              // Try Clouds style if Fluency fails
                              target.src = `https://img.icons8.com/clouds/200/${word.text.toLowerCase()}.png`;
                            } else if (target.src.includes('clouds')) {
                              // Try Color style if Clouds fails
                              target.src = `https://img.icons8.com/color/200/${word.text.toLowerCase()}.png`;
                            } else {
                              // Final fallback to placeholder
                              target.src = `https://placehold.co/200x200/emerald/white?text=${word.text}`;
                            }
                          }}
                        />
                      </div>
                      <span className="text-base font-black text-emerald-900 tracking-tight">{word.text}</span>
                      <span className="text-[10px] font-bold text-emerald-500 mt-0.5">{word.translation}</span>
                    </motion.div>
                  ))}
                </div>

                {/* Bottom: Rhyme */}
                <div className="space-y-4">
                  <div className="flex items-center justify-center space-x-2">
                    <div className="h-px flex-1 bg-emerald-100" />
                    <span className="text-[10px] font-black text-emerald-300 uppercase tracking-widest">魔法三字经</span>
                    <div className="h-px flex-1 bg-emerald-100" />
                  </div>
                  
                  <motion.div 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => speakRhyme(activeLevel.cards[cardIndex].rhyme)} 
                    className="bg-gradient-to-br from-emerald-500 to-emerald-700 p-8 rounded-[40px] text-center cursor-pointer shadow-xl shadow-emerald-100 relative overflow-hidden group"
                  >
                    <div className="absolute top-4 right-4 p-2 bg-white/20 rounded-xl backdrop-blur-md opacity-40 group-hover:opacity-100 transition-opacity">
                      <Volume2 size={20} className="text-white" />
                    </div>
                    <div className="text-white font-black text-2xl leading-relaxed tracking-wide space-y-2">
                      {activeLevel.cards[cardIndex].rhyme.split(/[,，.。!！?？]/).filter(s => s.trim()).map((line, idx) => (
                        <p key={idx} className="whitespace-nowrap">{line.trim()}</p>
                      ))}
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20" />
                  </motion.div>
                </div>

                <button 
                  onClick={nextLearn} 
                  className="w-full py-6 bg-emerald-100 text-emerald-700 rounded-[32px] font-black text-xl flex items-center justify-center space-x-3 hover:bg-emerald-500 hover:text-white transition-all shadow-lg shadow-emerald-50 group"
                >
                  <span>{cardIndex === activeLevel.cards.length - 1 ? '完成学习' : '下一张魔法卡'}</span>
                  <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </motion.div>
          )}

          {step === 'COMPLETE' && (
            <motion.div key="complete" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8 py-20 text-center">
              <div className="relative inline-block">
                <div className="text-9xl">🎉</div>
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }} className="absolute inset-0 border-4 border-dashed border-emerald-200 rounded-full -m-4" />
              </div>
              <div className="space-y-2">
                <h3 className="text-4xl font-black text-emerald-900">关卡完成！</h3>
                <p className="text-emerald-600 font-bold">你学会了本关的所有魔法！</p>
              </div>
              <div className="space-y-3">
                <button onClick={handleGoToArcade} className="w-full py-5 bg-indigo-600 text-white rounded-[32px] font-black text-xl shadow-xl hover:bg-indigo-700 transition-all flex items-center justify-center space-x-2">
                  <Gamepad2 size={24} />
                  <span>前往游乐园</span>
                </button>
                <button onClick={() => setStep('MAP')} className="w-full py-5 bg-emerald-100 text-emerald-700 rounded-[32px] font-black text-xl hover:bg-emerald-200 transition-all">
                  返回地图
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AdventurePage;
