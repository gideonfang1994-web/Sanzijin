
import React, { useState, useEffect, useMemo } from 'react';
import { WordGroup } from '../types';
import { Timer, Trophy, Star, Heart, Compass, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import audio from '../utils/AudioUtils';
import confetti from 'canvas-confetti';
import SafeImage from './SafeImage';

interface Props {
  groups: WordGroup[];
  isReviewMode?: boolean;
  onFinish: (score: number, coins: number) => void;
  onMistake: (wordText: string) => void;
  onSuccess: (wordText: string) => void;
  onClose: () => void;
}

const WordChallenge: React.FC<Props> = ({ groups, isReviewMode, onFinish, onMistake, onSuccess, onClose }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [isGameOver, setIsGameOver] = useState(false);
  const [options, setOptions] = useState<string[]>([]);
  const [hearts, setHearts] = useState(3);

  const pool = useMemo(() => {
    if (isReviewMode) {
      const reviewWords = groups.filter(g => (g.learned && g.nextReview < Date.now()) || g.lastIncorrect).flatMap(g => g.words);
      return reviewWords.length > 0 ? reviewWords : (groups[0]?.words || []);
    }
    // 获取第一个还没学会的组，或者最后一组
    const activeGroup = groups.find(g => !g.learned) || groups[0];
    return activeGroup ? activeGroup.words : [];
  }, [groups, isReviewMode]);

  useEffect(() => {
    if (pool.length > 0) {
      if (currentQuestion < pool.length) {
        generateQuestion();
      } else {
        finish();
      }
    }
  }, [currentQuestion, pool]);

  useEffect(() => {
    if (timeLeft <= 0 && !isGameOver && pool.length > 0) {
      handleWrong();
      return;
    }
    const timer = !isGameOver && timeLeft > 0 && setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => timer && clearInterval(timer);
  }, [timeLeft, isGameOver, pool]);

  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [feedback, setFeedback] = useState<{ text: string, subtext: string, color: string, bgColor: string, borderColor: string } | null>(null);

  const feedbackLevels = [
    { 
      threshold: 2, 
      slogans: ['步步为营!', '初窥门径!', '森林学徒!', '林间探索!', '树影婆娑!'],
      subtext: 'KEEP GOING',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200'
    },
    { 
      threshold: 5, 
      slogans: ['丛林之影!', '游刃有余!', '森林猎手!', '绿意盎然!', '势如破竹!'],
      subtext: 'NATURE SPIRIT',
      color: 'text-emerald-700',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-300'
    },
    { 
      threshold: 8, 
      slogans: ['森之守护!', '万木之灵!', '森林之翼!', '自然之子!', '森林之盾!'],
      subtext: 'PROTECTOR',
      color: 'text-green-700',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-300'
    },
    { 
      threshold: 12, 
      slogans: ['自然之神!', '丛林主宰!', '万物共鸣!', '翡翠之光!', '森罗万象!'],
      subtext: 'LEGENDARY',
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
      setTimeout(() => setFeedback(null), 1500);
    }
  };

  const generateQuestion = () => {
    const correct = pool[currentQuestion];
    if (!correct) return;
    
    const allWords = groups.flatMap(g => g.words);
    const distractors = allWords
      .filter(w => w.text !== correct.text)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);
      
    setOptions([...distractors.map(d => d.translation), correct.translation].sort(() => 0.5 - Math.random()));
    setTimeLeft(10);
    setTimeout(() => audio.speak(correct.text), 300);
  };

  const handleAnswer = (answer: string) => {
    if (isGameOver || currentQuestion >= pool.length) return;
    
    const currentWord = pool[currentQuestion];
    if (answer === currentWord.translation) {
      audio.playSuccess();
      confetti({
        particleCount: 30,
        spread: 50,
        origin: { y: 0.8 }
      });
      
      const newCombo = combo + 1;
      setCombo(newCombo);
      setMaxCombo(prev => Math.max(prev, newCombo));
      triggerFeedback(newCombo);
      
      const comboBonus = Math.floor(newCombo / 2) * 5;
      setScore(prev => prev + 100 + timeLeft * 10 + comboBonus);
      
      onSuccess(currentWord.text);
      setCurrentQuestion(prev => prev + 1);
    } else {
      handleWrong();
    }
  };

  const handleWrong = () => {
    audio.playError();
    setCombo(0);
    if (pool[currentQuestion]) {
      onMistake(pool[currentQuestion].text);
    }
    
    setHearts(prev => {
      if (prev <= 1) {
        finish();
        return 0;
      }
      return prev - 1;
    });
    setCurrentQuestion(prev => prev + 1);
  };

  const finish = () => {
    if (isGameOver) return;
    setIsGameOver(true);
    audio.playCheer();
    onFinish(score, Math.floor(score / 50));
  };

  if (isGameOver || (pool.length > 0 && currentQuestion >= pool.length)) {
    return (
      <div className="flex flex-col items-center justify-center h-full animate-in zoom-in-95">
        <div className="bg-white rounded-[50px] p-10 shadow-2xl border-[8px] border-indigo-500 text-center w-full max-w-sm relative">
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-amber-400 w-20 h-20 rounded-full border-4 border-white flex items-center justify-center shadow-lg">
             <Trophy className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-black mt-8">勇士归来!</h2>
          <p className="text-slate-400 font-bold mb-4">挑战完成 {Math.min(currentQuestion, pool.length)}/{pool.length}</p>
          
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-indigo-50 rounded-3xl p-4 border-2 border-indigo-100">
               <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">总分</p>
               <p className="text-2xl font-black text-indigo-600">{score}</p>
            </div>
            <div className="bg-amber-50 rounded-3xl p-4 border-2 border-amber-100">
               <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-1">最高连击</p>
               <p className="text-2xl font-black text-amber-600">{maxCombo}</p>
            </div>
          </div>

          <button onClick={onClose} className="w-full puffy-button bg-indigo-600 text-white py-5 rounded-3xl font-black text-xl shadow-lg border-b-6 border-indigo-800 active:border-b-0 active:translate-y-1 transition-all">返回游乐园</button>
        </div>
      </div>
    );
  }

  const currentWord = pool[currentQuestion];
  if (!currentWord) return null;

  return (
    <div className="flex flex-col h-full space-y-4 font-sans">
      <div className="flex items-center justify-between p-5 bg-white/80 backdrop-blur-md rounded-3xl border-2 border-emerald-50 shadow-sm relative z-20">
        <button onClick={onClose} className="p-2 hover:bg-rose-50 rounded-xl transition-colors group">
          <X size={20} className="text-slate-400 group-hover:text-rose-500" />
        </button>
        <div className="flex space-x-1.5">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              initial={false}
              animate={{ scale: i < hearts ? 1 : 0.8 }}
            >
              <Heart key={i} className={`w-6 h-6 transition-all duration-300 ${i < hearts ? 'text-rose-500 fill-rose-500 filter drop-shadow-sm' : 'text-slate-200'}`} />
            </motion.div>
          ))}
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex flex-col items-end">
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Progress</span>
            <div className="font-black text-slate-700 tabular-nums">{currentQuestion + 1} / {pool.length}</div>
          </div>
          <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center relative overflow-hidden">
             <motion.div 
               animate={{ height: `${(timeLeft / 10) * 100}%` }}
               className="absolute bottom-0 left-0 right-0 bg-emerald-500/20"
             />
             <span className={`font-black relative z-10 tabular-nums ${timeLeft < 4 ? 'text-rose-500 animate-pulse' : 'text-emerald-600'}`}>{timeLeft}</span>
          </div>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-[56px] border-4 border-white shadow-2xl flex flex-col items-center justify-center p-8 text-center relative overflow-hidden magic-glow-pulse">
        {/* Magical Background deco */}
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-50/50 to-white pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border-2 border-emerald-100 rounded-full animate-magic-rotate opacity-20 pointer-events-none" />
        
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full -mr-16 -mt-16 opacity-50 blur-2xl" />
        
        {/* Combo & Feedback Overlay */}
        <AnimatePresence>
          {combo > 1 && (
            <motion.div 
              key="combo-badge"
              initial={{ scale: 0, rotate: -20, x: -30 }}
              animate={{ scale: 1, rotate: -10, x: 0 }}
              exit={{ scale: 2, opacity: 0 }}
              className="absolute top-12 left-8 z-20 pointer-events-none"
            >
              <div className="bg-gradient-to-br from-amber-400 to-orange-500 text-white px-5 py-2.5 rounded-2xl font-black text-xl shadow-xl border-b-4 border-orange-700 flex items-center space-x-2">
                <Star size={20} className="fill-white animate-spin-slow" />
                <span>{combo} COMBO!</span>
              </div>
            </motion.div>
          )}
          
          {feedback && (
            <motion.div 
              initial={{ y: 60, opacity: 0, scale: 0.7, rotate: 5 }}
              animate={{ y: -100, opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 1.2, y: -140 }}
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
        </AnimatePresence>

        <div className="relative mb-8">
          <motion.div 
            animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.2, 0.1] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute inset-0 bg-indigo-400 blur-3xl rounded-full scale-150"
          />
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => audio.speak(currentWord.text)}
            className="relative z-10 cursor-pointer"
          >
            <SafeImage 
              src={currentWord.imageUrl} 
              className="w-56 h-56 object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.2)]" 
              fallbackText={currentWord.text}
              width="224"
              height="224"
            />
          </motion.div>
        </div>

        <div className="space-y-2 relative z-10">
          <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.4em] mb-2">Forest Vocabulary</p>
          <motion.div
            key={currentWord.text}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center"
          >
            <h2 className="text-6xl font-black text-emerald-950 tracking-tight leading-none">
              {currentWord.text}
            </h2>
            <div className="mt-4 flex items-center bg-emerald-50 px-4 py-2 rounded-2xl border border-emerald-100">
               <Compass className="text-emerald-500 mr-2" size={20} />
               <span className="text-[10px] font-black text-emerald-600 uppercase">Nature Quest</span>
            </div>
          </motion.div>
        </div>

        {/* Floating Particles */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1.5 h-1.5 bg-emerald-300/30 rounded-full blur-[1px]"
              animate={{
                y: [0, -40, 0],
                opacity: [0.1, 0.4, 0.1],
              }}
              transition={{
                duration: 3 + i,
                repeat: Infinity,
                delay: i * 0.5
              }}
              style={{
                left: `${15 + i * 15}%`,
                top: `${40 + (i % 3) * 10}%`
              }}
            />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 pb-4">
        {options.map((opt, i) => (
          <motion.button 
            key={`${opt}-${i}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ scale: 1.02, y: -4 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleAnswer(opt)} 
            className="group bg-white border-2 border-emerald-50 p-6 rounded-[32px] font-black text-xl text-slate-700 hover:border-emerald-500 hover:text-emerald-700 transition-all shadow-lg shadow-emerald-100/20 active:shadow-inner relative overflow-hidden"
          >
            <span className="relative z-10">{opt}</span>
            <div className="absolute inset-0 bg-emerald-50/50 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default WordChallenge;
