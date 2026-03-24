
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, Play, Gamepad2, RefreshCw, Star, Trophy,
  ArrowRight, Volume2, Lock, CheckCircle2, Zap, Trash2, Wand2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { WordItem, WordCard, AdventureForestProps } from '../types';
import { ALL_CARDS } from '../constants';
import audio from '../utils/AudioUtils';
import { GoogleGenAI } from "@google/genai";
import { auth, db, doc, getDoc, setDoc, handleFirestoreError, OperationType } from '../firebase';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

type AdventureStep = 'SETUP' | 'MAP' | 'LEARN' | 'REVIEW' | 'TEST' | 'COMPLETE';

interface Level {
  id: number;
  name: string;
  cards: WordCard[];
  isUnlocked: boolean;
  isCompleted: boolean;
  isMastered: boolean;
}

const AdventurePage: React.FC<AdventureForestProps> = ({ onClose, onCompleteLevel }) => {
  const [step, setStep] = useState<AdventureStep>('SETUP');
  const [cardsPerDay, setCardsPerDay] = useState<5 | 10>(5);
  const [currentLevelId, setCurrentLevelId] = useState<number>(1);
  const [completedLevels, setCompletedLevels] = useState<number[]>([]);
  const [masteredLevels, setMasteredLevels] = useState<number[]>([]);
  const [activeLevel, setActiveLevel] = useState<Level | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncedImages, setSyncedImages] = useState<Record<string, string>>({});
  const [showMasteryPrompt, setShowMasteryPrompt] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('adventure_synced_images');
    if (saved) {
      setSyncedImages(JSON.parse(saved));
    }
  }, []);

  const syncImage = async (wordText: string) => {
    if (isSyncing) return;
    setIsSyncing(true);
    try {
      const prompt = `High-end 2D Cel-shaded digital painting of "${wordText}". Chibi style, vibrant colors, clean line art, white background, magical fantasy theme.`;
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: prompt }] },
        config: { imageConfig: { aspectRatio: "1:1" } }
      });

      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            const base64 = `data:image/png;base64,${part.inlineData.data}`;
            setSyncedImages(prev => {
              const updated = { ...prev, [wordText]: base64 };
              localStorage.setItem('adventure_synced_images', JSON.stringify(updated));
              return updated;
            });
            break;
          }
        }
      }
    } catch (error) {
      console.error("Sync error:", error);
    } finally {
      setIsSyncing(false);
    }
  };

  // Learning/Test session state
  const [cardIndex, setCardIndex] = useState(0);
  const [testQuestions, setTestQuestions] = useState<{ word: WordItem, options?: string[], correct: string, type: 'CHOICE' | 'SPELLING' }[]>([]);
  const [testAnswers, setTestAnswers] = useState<boolean[]>([]);
  const [testResult, setTestResult] = useState<{ score: number, passed: boolean } | null>(null);
  const [wrongOptions, setWrongOptions] = useState<string[]>([]);
  const [shuffledLetters, setShuffledLetters] = useState<string[]>([]);
  const [selectedLetters, setSelectedLetters] = useState<string[]>([]);
  const [spellingInput, setSpellingInput] = useState('');

  // Load progress
  useEffect(() => {
    const fetchProgress = async () => {
      if (!auth.currentUser) return;
      try {
        const userDocRef = doc(db, 'users', auth.currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const data = userDoc.data();
          // We'll store adventure progress in the user document or a subcollection
          // For simplicity, let's assume it's in the user document
          setCompletedLevels(data.completedLevels || []);
          setMasteredLevels(data.masteredLevels || []);
          if (data.cardsPerDay) {
            setCardsPerDay(data.cardsPerDay);
            setStep('MAP');
          }
        } else {
          // Fallback to local storage if firestore fails or is empty
          const saved = localStorage.getItem('adventure_forest_progress');
          if (saved) {
            const data = JSON.parse(saved);
            setCardsPerDay(data.cardsPerDay || 5);
            setCompletedLevels(data.completedLevels || []);
            setMasteredLevels(data.masteredLevels || []);
            setStep('MAP');
          }
        }
      } catch (e) {
        console.error('Failed to load adventure progress:', e);
      }
    };
    
    fetchProgress();
  }, []);

  // Save progress
  const saveProgress = async (newCompleted: number[], newMastered: number[], perDay: number = cardsPerDay) => {
    if (!auth.currentUser) return;
    
    // Save to local storage as backup
    localStorage.setItem('adventure_forest_progress', JSON.stringify({
      cardsPerDay: perDay,
      completedLevels: newCompleted,
      masteredLevels: newMastered
    }));

    // Save to Firestore
    try {
      const userDocRef = doc(db, 'users', auth.currentUser.uid);
      await setDoc(userDocRef, {
        completedLevels: newCompleted,
        masteredLevels: newMastered,
        cardsPerDay: perDay
      }, { merge: true });
    } catch (error) {
      console.error("Failed to save progress to Firestore:", error);
    }
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
        isCompleted: completedLevels.includes(levelId),
        isMastered: masteredLevels.includes(levelId)
      });
    }
    return generatedLevels;
  }, [cardsPerDay, completedLevels, masteredLevels]);

  const startLevel = (level: Level) => {
    console.log('Starting level:', level.id);
    setCurrentLevelId(level.id);
    if (!level.isUnlocked) {
      setShowMasteryPrompt(true);
      return;
    }
    if (!level || !level.cards || level.cards.length === 0) {
      console.error('Invalid level data:', level);
      return;
    }
    setActiveLevel(level);
    setCurrentLevelId(level.id);
    setCardIndex(0);
    setStep('LEARN');
  };

  const startChallenge = (level: Level) => {
    setActiveLevel(level);
    setCurrentLevelId(level.id);
    const words = level.cards.flatMap(c => c.words);
    const allWords = ALL_CARDS.flatMap(c => c.words);
    
    // Phase 1: Choice (English -> Chinese)
    const choiceQuestions = words.map(word => {
      const options = [word.translation];
      while (options.length < 4) {
        const randomWord = allWords[Math.floor(Math.random() * allWords.length)];
        if (!options.includes(randomWord.translation)) {
          options.push(randomWord.translation);
        }
      }
      return {
        word,
        options: options.sort(() => Math.random() - 0.5),
        correct: word.translation,
        type: 'CHOICE' as const
      };
    }).sort(() => Math.random() - 0.5);

    // Phase 2: Spelling (Chinese -> English)
    const spellingQuestions = words.map(word => ({
      word,
      correct: word.text,
      type: 'SPELLING' as const
    })).sort(() => Math.random() - 0.5);
    
    setTestQuestions([...choiceQuestions, ...spellingQuestions]);
    setTestAnswers([]);
    setCardIndex(0);
    setSpellingInput('');
    setWrongOptions([]);
    setStep('TEST');
    setTestResult(null);
    setShowMasteryPrompt(false);
  };

  useEffect(() => {
    if (step === 'TEST' && testQuestions[cardIndex]) {
      const currentQuestion = testQuestions[cardIndex];
      // Auto-pronounce English word in Choice stage
      if (currentQuestion.type === 'CHOICE') {
        audio.speak(currentQuestion.word.text);
      }
      
      // Prepare spelling letters
      if (currentQuestion.type === 'SPELLING') {
        const letters = currentQuestion.word.text.split('').sort(() => Math.random() - 0.5);
        setShuffledLetters(letters);
        setSelectedLetters([]);
      }
      
      setWrongOptions([]);
    }
  }, [step, cardIndex, testQuestions]);

  const handleTestAnswer = (answer: string) => {
    const currentQuestion = testQuestions[cardIndex];
    const isCorrect = answer.toLowerCase().trim() === currentQuestion.correct.toLowerCase().trim();
    
    if (isCorrect) {
      audio.playSuccess();
      confetti({
        particleCount: 30,
        spread: 40,
        origin: { y: 0.7 },
        colors: ['#10b981', '#34d399']
      });
      
      const newAnswers = [...testAnswers, true];
      setTestAnswers(newAnswers);
      
      if (cardIndex < testQuestions.length - 1) {
        setCardIndex(prev => prev + 1);
      } else {
        const correctCount = newAnswers.filter(a => a).length;
        const score = Math.round((correctCount / testQuestions.length) * 100);
        const passed = score >= 60;
        
        setTestResult({ score, passed });
        
        if (passed) {
          const newMastered = [...new Set([...masteredLevels, activeLevel!.id])];
          const newCompleted = [...new Set([...completedLevels, activeLevel!.id])];
          setMasteredLevels(newMastered);
          setCompletedLevels(newCompleted);
          saveProgress(newCompleted, newMastered);
          audio.playCheer();
          confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        }
      }
    } else {
      audio.playError();
      if (currentQuestion.type === 'CHOICE') {
        setWrongOptions(prev => [...prev, answer]);
      } else {
        // Spelling: clear and let them try again
        setSelectedLetters([]);
        const letters = currentQuestion.word.text.split('').sort(() => Math.random() - 0.5);
        setShuffledLetters(letters);
      }
    }
  };

  const handleLetterClick = (letter: string, index: number) => {
    const newSelected = [...selectedLetters, letter];
    setSelectedLetters(newSelected);
    
    // Remove one instance of the letter from shuffled
    const newShuffled = [...shuffledLetters];
    newShuffled.splice(index, 1);
    setShuffledLetters(newShuffled);
    
    const currentQuestion = testQuestions[cardIndex];
    if (newSelected.length === currentQuestion.word.text.length) {
      handleTestAnswer(newSelected.join(''));
    }
  };

  const handleRemoveLetter = (index: number) => {
    const letter = selectedLetters[index];
    const newSelected = [...selectedLetters];
    newSelected.splice(index, 1);
    setSelectedLetters(newSelected);
    
    setShuffledLetters(prev => [...prev, letter]);
  };

  const startNextLevel = () => {
    const nextLevel = levels.find(l => l.id === activeLevel!.id + 1);
    if (nextLevel) {
      startChallenge(nextLevel);
    } else {
      setStep('MAP');
    }
  };

  const startReview = () => {
    const prevLevel = levels.find(l => l.id === currentLevelId - 1);
    if (prevLevel) {
      startChallenge(prevLevel);
    } else {
      const currentLevel = levels.find(l => l.id === currentLevelId);
      if (currentLevel) startChallenge(currentLevel);
    }
  };

  const startTest = () => {
    if (activeLevel) startChallenge(activeLevel);
  };

  const nextLearn = () => {
    if (!activeLevel) return;
    if (cardIndex < activeLevel.cards.length - 1) {
      setCardIndex(prev => prev + 1);
    } else {
      if (step === 'REVIEW') {
        startTest();
      } else {
        const newCompleted = [...new Set([...completedLevels, currentLevelId])];
        setCompletedLevels(newCompleted);
        saveProgress(newCompleted, masteredLevels);
        setStep('COMPLETE');
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
      }
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

  const getRhymeFontSize = (rhyme: string) => {
    const lines = rhyme.split(/[,，.。!！?？]/).filter(l => l.trim());
    const maxLength = Math.max(...lines.map(l => l.length));
    if (maxLength > 18) return 'text-base';
    if (maxLength > 15) return 'text-lg';
    if (maxLength > 12) return 'text-xl';
    if (maxLength > 10) return 'text-2xl';
    return 'text-3xl';
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
                  onClick={() => { 
                    setCardsPerDay(5); 
                    setStep('MAP'); 
                    saveProgress([], [], 5); 
                  }} 
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
                  onClick={() => { 
                    setCardsPerDay(10); 
                    setStep('MAP'); 
                    saveProgress([], [], 10); 
                  }} 
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
                    <p className="text-xl font-black text-emerald-900 leading-none">{masteredLevels.length} / {levels.length} <span className="text-sm font-bold opacity-40">Mastered</span></p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button onClick={() => setStep('SETUP')} className="bg-emerald-100 p-3 rounded-2xl text-emerald-600 hover:bg-emerald-200 transition-all" title="切换模式"><RefreshCw size={18} /></button>
                  <button 
                    onClick={() => {
                      if (window.confirm('确定要重置所有冒险进度吗？')) {
                        localStorage.removeItem('adventure_forest_progress');
                        setCompletedLevels([]);
                        setMasteredLevels([]);
                        setStep('SETUP');
                      }
                    }} 
                    className="bg-rose-100 p-3 rounded-2xl text-rose-600 hover:bg-rose-200 transition-all" 
                    title="重置进度"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <div className="relative py-10 px-4 min-h-[600px] rounded-[40px] overflow-hidden">
                {/* Map Background Decor */}
                <div className="absolute inset-0 -z-10 opacity-20 pointer-events-none">
                  <div className="absolute top-10 left-10 text-6xl">🌲</div>
                  <div className="absolute top-40 right-10 text-6xl">🌳</div>
                  <div className="absolute bottom-20 left-20 text-6xl">🍄</div>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[200px] opacity-10">🗺️</div>
                </div>

                {/* Path Line */}
                <div className="absolute left-1/2 top-0 bottom-0 w-3 bg-emerald-100/50 -translate-x-1/2 rounded-full overflow-hidden">
                   <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: `${(masteredLevels.length / levels.length) * 100}%` }}
                    className="w-full bg-emerald-400"
                   />
                </div>

                <div className="space-y-16 relative z-20">
                  {levels.map((level, index) => {
                    const isEven = index % 2 === 0;
                    const isLocked = !level.isUnlocked;
                    const isCurrent = level.isUnlocked && !level.isMastered;
                    
                    return (
                      <div 
                        key={level.id} 
                        className={`flex items-center group ${isEven ? 'flex-row' : 'flex-row-reverse'}`}
                      >
                        <motion.div 
                          whileHover={!isLocked ? { scale: 1.05, x: isEven ? -5 : 5 } : {}}
                          className={`w-1/2 flex ${isEven ? 'justify-end pr-10' : 'justify-start pl-10'} cursor-pointer`}
                          onClick={() => startLevel(level)}
                        >
                          <div className={`${isEven ? 'text-right' : 'text-left'}`}>
                            <h4 className={`font-black text-lg leading-tight whitespace-nowrap transition-colors ${isLocked ? 'text-emerald-200' : 'text-emerald-800 group-hover:text-emerald-600'}`}>{level.name}</h4>
                            <div className="flex items-center mt-1 space-x-1 opacity-60 whitespace-nowrap">
                               <span className={`text-[10px] font-black uppercase tracking-tighter ${isLocked ? 'text-emerald-200' : 'text-emerald-500'}`}>关卡 {level.id} • {level.cards.length} 魔法</span>
                            </div>
                          </div>
                        </motion.div>

                        <div className="relative cursor-pointer" onClick={() => startLevel(level)}>
                          {isCurrent && (
                            <motion.div 
                              layoutId="current-indicator"
                              className="absolute inset-0 bg-emerald-400 rounded-full blur-xl opacity-40"
                              animate={{ scale: [1, 1.4, 1] }}
                              transition={{ duration: 2, repeat: Infinity }}
                            />
                          )}
                          <div 
                            className={`w-20 h-20 rounded-[28px] border-[6px] flex items-center justify-center transition-all shadow-xl relative z-10 ${
                              isLocked 
                                ? 'bg-emerald-50 border-emerald-100 text-emerald-200' 
                                : level.isMastered 
                                  ? 'bg-emerald-500 border-emerald-200 text-white group-hover:scale-110' 
                                  : 'bg-white border-emerald-500 text-emerald-600 scale-110 group-hover:scale-125 group-hover:rotate-6'
                            }`}
                          >
                            {isLocked ? <Lock size={28} /> : level.isMastered ? <CheckCircle2 size={32} /> : <Play size={32} className="ml-1 fill-emerald-600" />}
                            
                            {/* Level Number Badge */}
                            <div className={`absolute -top-3 -right-3 w-8 h-8 rounded-full border-4 border-white flex items-center justify-center text-[10px] font-black shadow-md ${isLocked ? 'bg-emerald-100 text-emerald-300' : 'bg-emerald-800 text-white'}`}>
                              {level.id}
                            </div>
                          </div>
                        </div>

                        <div className="w-1/2"></div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Mastery Prompt Overlay */}
              <AnimatePresence>
                {showMasteryPrompt && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-emerald-900/40 backdrop-blur-sm"
                  >
                    <motion.div 
                      initial={{ scale: 0.9, y: 20 }}
                      animate={{ scale: 1, y: 0 }}
                      className="bg-white rounded-[48px] p-8 max-w-sm w-full shadow-2xl text-center space-y-6"
                    >
                      <div className="w-20 h-20 bg-rose-100 rounded-[32px] flex items-center justify-center text-rose-500 mx-auto">
                        <Lock size={40} />
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-2xl font-black text-slate-800">魔法封印！</h4>
                        <p className="text-slate-500 font-bold leading-relaxed">
                          你需要掌握前一关至少 <span className="text-rose-500">60%</span> 的单词，才能开启下一关的学习。
                        </p>
                      </div>
                      <div className="grid gap-3">
                        <button 
                          onClick={startReview}
                          className="w-full py-4 bg-emerald-500 text-white rounded-3xl font-black text-lg shadow-lg shadow-emerald-200 hover:bg-emerald-600 transition-all"
                        >
                          闯关
                        </button>
                        <button 
                          onClick={() => setShowMasteryPrompt(false)}
                          className="w-full py-4 bg-slate-100 text-slate-400 rounded-3xl font-black"
                        >
                          稍后再说
                        </button>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {(step === 'LEARN' || step === 'REVIEW') && activeLevel && activeLevel.cards.length > 0 && (
            <motion.div key="learn" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6 py-6">
              <div className="flex items-center justify-between px-2">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest leading-none mb-1">
                    {step === 'REVIEW' ? '复习模式' : activeLevel.name}
                  </span>
                  <h3 className="text-2xl font-black text-emerald-900 leading-none">
                    {step === 'REVIEW' ? `第 ${activeLevel.id} 关复习` : `第 ${currentLevelId} 关`}
                  </h3>
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
                      <div className="w-full aspect-square bg-white rounded-2xl mb-3 flex items-center justify-center p-2 shadow-inner relative group">
                        <img 
                          src={syncedImages[word.text] || word.imageUrl} 
                          alt={word.text} 
                          className="w-full h-full object-contain" 
                          referrerPolicy="no-referrer" 
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            if (target.src.includes('fluency')) {
                              target.src = `https://img.icons8.com/clouds/200/${word.text.toLowerCase()}.png`;
                            } else if (target.src.includes('clouds')) {
                              target.src = `https://img.icons8.com/color/200/${word.text.toLowerCase()}.png`;
                            } else {
                              target.src = `https://placehold.co/200x200/emerald/white?text=${word.text}`;
                            }
                          }}
                        />
                        <button 
                          onClick={(e) => { e.stopPropagation(); syncImage(word.text); }}
                          disabled={isSyncing}
                          className="absolute bottom-2 right-2 p-2 bg-emerald-500 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                          title="魔法同步 (AI生成图片)"
                        >
                          {isSyncing ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Wand2 size={16} />}
                        </button>
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
                    <div className={`text-white font-black leading-relaxed tracking-wide space-y-2 ${getRhymeFontSize(activeLevel.cards[cardIndex].rhyme)}`}>
                      {activeLevel.cards[cardIndex].rhyme.split(/[,，.。!！?？]/).filter(s => s.trim()).map((line, idx) => (
                        <p key={idx} className="whitespace-nowrap">{line.trim()}</p>
                      ))}
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20" />
                  </motion.div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={nextLearn} 
                    className="flex-1 py-6 bg-emerald-100 text-emerald-700 rounded-[32px] font-black text-xl flex items-center justify-center space-x-3 hover:bg-emerald-500 hover:text-white transition-all shadow-lg shadow-emerald-50 group"
                  >
                    <span>{cardIndex === activeLevel.cards.length - 1 ? (step === 'REVIEW' ? '开始测试' : '完成学习') : '下一张'}</span>
                    <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                  <button 
                    onClick={() => startChallenge(activeLevel)} 
                    className="flex-1 py-6 bg-amber-100 text-amber-700 rounded-[32px] font-black text-xl flex items-center justify-center space-x-3 hover:bg-amber-500 hover:text-white transition-all shadow-lg shadow-amber-50 group"
                  >
                    <Zap size={24} />
                    <span>直接闯关</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {step === 'TEST' && (
            <motion.div key="test" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 py-6">
              <div className="flex items-center justify-between px-2">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-rose-400 uppercase tracking-widest leading-none mb-1">魔法测试</span>
                  <h3 className="text-2xl font-black text-slate-800 leading-none">第 {activeLevel?.id} 关</h3>
                </div>
                <div className="bg-white px-4 py-2 rounded-2xl border-2 border-rose-100 font-black text-rose-600 text-sm">
                  {cardIndex + 1} / {testQuestions.length}
                </div>
              </div>

              {!testResult ? (
                <div className="space-y-8">
                  <div className="bg-white rounded-[48px] p-10 shadow-2xl border-4 border-white text-center space-y-6">
                    <div className="space-y-2">
                      <p className="text-rose-400 font-black uppercase tracking-widest text-xs">
                        {testQuestions[cardIndex].type === 'CHOICE' ? '选择正确含义' : '拼写单词'}
                      </p>
                      <h2 className="text-5xl font-black text-slate-800 tracking-tight">
                        {testQuestions[cardIndex].type === 'CHOICE' ? testQuestions[cardIndex].word.text : testQuestions[cardIndex].word.translation}
                      </h2>
                    </div>
                  </div>

                  {testQuestions[cardIndex].type === 'CHOICE' ? (
                    <div className="grid grid-cols-1 gap-4">
                      {testQuestions[cardIndex].options?.map((option, i) => {
                        const isWrong = wrongOptions.includes(option);
                        return (
                          <motion.button
                            key={i}
                            whileHover={isWrong ? {} : { scale: 1.02, x: 5 }}
                            whileTap={isWrong ? {} : { scale: 0.98 }}
                            onClick={() => !isWrong && handleTestAnswer(option)}
                            className={`p-6 rounded-[32px] border-2 transition-all text-left font-black text-xl shadow-sm ${
                              isWrong 
                                ? 'bg-rose-50 border-rose-200 text-rose-300 cursor-not-allowed' 
                                : 'bg-white border-slate-100 hover:border-emerald-500 hover:bg-emerald-50 text-slate-700'
                            }`}
                          >
                            {option}
                          </motion.button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="space-y-10">
                      {/* Selected Letters Slots */}
                      <div className="flex flex-wrap justify-center gap-3">
                        {testQuestions[cardIndex].word.text.split('').map((_, i) => (
                          <motion.button
                            key={i}
                            onClick={() => i < selectedLetters.length && handleRemoveLetter(i)}
                            className={`w-14 h-16 rounded-2xl border-b-4 flex items-center justify-center text-3xl font-black shadow-md transition-all ${
                              i < selectedLetters.length 
                                ? 'bg-emerald-500 border-emerald-700 text-white' 
                                : 'bg-white border-slate-200 text-transparent'
                            }`}
                          >
                            {selectedLetters[i]}
                          </motion.button>
                        ))}
                      </div>

                      {/* Shuffled Letters Options */}
                      <div className="flex flex-wrap justify-center gap-3 p-6 bg-white/50 rounded-[40px] border-2 border-dashed border-emerald-200">
                        {shuffledLetters.map((letter, i) => (
                          <motion.button
                            key={`${letter}-${i}`}
                            whileHover={{ scale: 1.1, y: -5 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleLetterClick(letter, i)}
                            className="w-14 h-16 bg-white rounded-2xl border-b-4 border-emerald-200 flex items-center justify-center text-3xl font-black text-emerald-600 shadow-lg hover:border-emerald-500 transition-all"
                          >
                            {letter}
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white rounded-[48px] p-10 shadow-2xl border-4 border-white text-center space-y-8">
                  <div className="text-8xl">{testResult.passed ? '🏅' : '😅'}</div>
                  <div className="space-y-2">
                    <h3 className="text-3xl font-black text-slate-800">{testResult.passed ? '测试通过！' : '还需努力！'}</h3>
                    <p className="text-slate-400 font-bold">你的得分：<span className={testResult.passed ? 'text-emerald-500' : 'text-rose-500'}>{testResult.score}%</span></p>
                  </div>
                  
                  {testResult.passed ? (
                    <button 
                      onClick={startNextLevel}
                      className="w-full py-5 bg-emerald-500 text-white rounded-[32px] font-black text-xl shadow-lg shadow-emerald-200"
                    >
                      开启下一关
                    </button>
                  ) : (
                    <div className="grid gap-3">
                      <button 
                        onClick={startReview}
                        className="w-full py-5 bg-rose-500 text-white rounded-[32px] font-black text-xl shadow-lg shadow-rose-200"
                      >
                        重新复习
                      </button>
                      <button 
                        onClick={() => setStep('MAP')}
                        className="w-full py-5 bg-slate-100 text-slate-400 rounded-[32px] font-black text-xl"
                      >
                        返回地图
                      </button>
                    </div>
                  )}
                </div>
              )}
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
