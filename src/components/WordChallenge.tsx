
import React, { useState, useEffect, useMemo } from 'react';
import { WordGroup } from '../types';
import { Timer, Trophy, Star, Heart, Swords, X } from 'lucide-react';
import audio from '../utils/AudioUtils';
import confetti from 'canvas-confetti';

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
      setScore(prev => prev + 100 + timeLeft * 10);
      onSuccess(currentWord.text);
      setCurrentQuestion(prev => prev + 1);
    } else {
      handleWrong();
    }
  };

  const handleWrong = () => {
    audio.playError();
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
        <div className="bg-white rounded-[50px] p-10 shadow-2xl border-[8px] border-indigo-500 text-center w-full max-w-sm">
          <Trophy className="w-16 h-16 text-indigo-500 mx-auto" />
          <h2 className="text-3xl font-black mt-6">勇士归来!</h2>
          <p className="text-slate-400 font-bold mb-4">挑战完成 {Math.min(currentQuestion, pool.length)}/{pool.length}</p>
          <div className="bg-indigo-50 rounded-3xl p-6 my-6 border-2 border-indigo-100">
            <p className="text-5xl font-black text-indigo-600">{score}</p>
          </div>
          <button onClick={onClose} className="w-full puffy-button bg-indigo-600 text-white py-5 rounded-3xl font-black text-xl shadow-lg">返回游乐园</button>
        </div>
      </div>
    );
  }

  const currentWord = pool[currentQuestion];
  if (!currentWord) return null;

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="flex items-center justify-between p-5 bg-white rounded-3xl border-2 border-slate-100 shadow-sm">
        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
          <X size={20} className="text-slate-400" />
        </button>
        <div className="flex space-x-1">{[...Array(3)].map((_, i) => <Heart key={i} className={`w-5 h-5 ${i < hearts ? 'text-rose-500 fill-rose-500' : 'text-slate-200'}`} />)}</div>
        <div className="font-black text-slate-700">{currentQuestion + 1} / {pool.length}</div>
        <div className={`font-black ${timeLeft < 4 ? 'text-rose-500 animate-pulse' : 'text-indigo-500'}`}>{timeLeft}s</div>
      </div>
      <div className="flex-1 bg-white rounded-[40px] border-2 border-slate-50 shadow-puffy flex flex-col items-center justify-center p-8 text-center">
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-indigo-100 blur-3xl opacity-30 rounded-full scale-150"></div>
          <img 
            src={currentWord.imageUrl} 
            className="w-48 h-48 object-contain relative z-10 cursor-pointer hover:scale-110 transition-transform" 
            onClick={() => audio.speak(currentWord.text)}
            referrerPolicy="no-referrer"
          />
        </div>
        <h2 
          className="text-5xl font-black text-slate-800 tracking-tight cursor-pointer hover:text-indigo-600 transition-colors"
          onClick={() => audio.speak(currentWord.text)}
        >
          {currentWord.text}
        </h2>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {options.map((opt, i) => (
          <button key={i} onClick={() => handleAnswer(opt)} className="bg-white border-2 border-slate-100 p-6 rounded-[30px] font-black text-xl hover:bg-indigo-50 active:scale-95 transition-all shadow-sm border-b-4 active:border-b-0 hover:border-indigo-200">{opt}</button>
        ))}
      </div>
    </div>
  );
};

export default WordChallenge;
