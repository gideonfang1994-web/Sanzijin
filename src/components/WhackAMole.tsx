
import React, { useState, useEffect, useMemo } from 'react';
import { WordGroup } from '../types';
import { Hammer, Star, Heart, Zap, Sparkles, Trophy, X } from 'lucide-react';
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

export const WhackAMole: React.FC<Props> = ({ groups, isReviewMode, onFinish, onMistake, onSuccess, onClose }) => {
  const [score, setScore] = useState(0);
  const [hearts, setHearts] = useState(3);
  const [timeLeft, setTimeLeft] = useState(45);
  const [isGameOver, setIsGameOver] = useState(false);
  const [activeHole, setActiveHole] = useState<number | null>(null);
  const [clearedWords, setClearedWords] = useState<Set<string>>(new Set());

  const pool = useMemo(() => {
    if (isReviewMode) {
      const reviewWords = groups.filter(g => (g.learned && g.nextReview < Date.now()) || g.lastIncorrect).flatMap(g => g.words);
      return reviewWords.length > 0 ? reviewWords : (groups[0]?.words || []);
    }
    const activeGroup = groups.find(g => !g.learned) || groups[0];
    return activeGroup ? activeGroup.words : [];
  }, [groups, isReviewMode]);

  const targetWord = useMemo(() => {
    const remaining = pool.filter(w => !clearedWords.has(w.text));
    return remaining.length > 0 ? remaining[0] : pool[Math.floor(Math.random() * pool.length)];
  }, [pool, clearedWords]);

  useEffect(() => {
    audio.init();
    if (pool.length === 0) { onClose(); return; }
    // Fixed: Replaced ternary logic that tested void endGame() return value for truthiness
    const gameTimer = setInterval(() => setTimeLeft(prev => {
      if (prev <= 1) {
        endGame();
        return 0;
      }
      return prev - 1;
    }), 1000);
    const moleTimer = setInterval(spawnMole, 1500);
    return () => { clearInterval(gameTimer); clearInterval(moleTimer); };
  }, [pool]);

  const speak = (text: string) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  const spawnMole = () => {
    if (isGameOver) return;
    const newHole = Math.floor(Math.random() * 9);
    setActiveHole(newHole);
    
    // 出现时发出读音
    if (targetWord) {
      speak(targetWord.text);
    }

    setTimeout(() => setActiveHole(null), 2000); // Longer for kids to click
  };

  const handleWhack = (idx: number, isMoleTarget: boolean) => {
    if (idx !== activeHole) return;
    if (isMoleTarget) {
      audio.playPop();
      setScore(prev => prev + 250);
      onSuccess(targetWord.text);
      const newCleared = new Set(clearedWords);
      newCleared.add(targetWord.text);
      setClearedWords(newCleared);
      setActiveHole(null);
      
      // 成功后立即准备下一个单词（由 useMemo 自动处理 targetWord）
      if (newCleared.size === pool.length) { 
        setTimeout(endGame, 500); 
      }
    } else {
      audio.playError();
      setHearts(prev => {
        if (prev <= 1) {
          endGame();
          return 0;
        }
        return prev - 1;
      });
      setActiveHole(null);
    }
  };

  const endGame = () => {
    setIsGameOver(true);
    onFinish(score, Math.floor(score / 40));
  };

  if (isGameOver || clearedWords.size === pool.length) {
    return (
      <div className="flex flex-col items-center justify-center h-full animate-in zoom-in-95">
        <div className="bg-white rounded-[50px] p-10 shadow-2xl border-[8px] border-emerald-500 text-center w-full max-sm:max-w-xs">
          <Trophy className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
          <h2 className="text-4xl font-black text-slate-800">清剿完毕!</h2>
          <p className="text-slate-400 font-bold mb-4">全部地鼠单词已击中</p>
          <p className="text-6xl font-black text-emerald-500">{score}</p>
          <button onClick={onClose} className="w-full puffy-button bg-emerald-600 text-white py-5 rounded-[30px] font-black mt-6">完成任务</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full space-y-6 bg-emerald-50 p-6 rounded-[60px] border-4 border-white">
      <div className="flex items-center justify-between z-10">
        <button onClick={onClose} className="p-2 hover:bg-white/50 rounded-xl transition-colors">
          <X size={24} className="text-slate-400" />
        </button>
        <div className="flex items-center space-x-2">{[...Array(3)].map((_, i) => <Heart key={i} className={`w-6 h-6 ${i < hearts ? 'text-rose-500 fill-rose-500' : 'text-slate-200 opacity-50'}`} />)}</div>
        <div className="font-black text-slate-700">{clearedWords.size} / {pool.length}</div>
        <div className="text-lg font-black text-emerald-600">{timeLeft}s</div>
      </div>
      <div className="text-center bg-white rounded-[40px] p-8 border-4 border-emerald-100 shadow-puffy">
        <p className="text-xs font-black text-slate-400 uppercase mb-2">击中该地鼠：</p>
        <h2 className="text-5xl font-black text-indigo-600 tracking-tight lowercase">{targetWord?.text}</h2>
      </div>
      <div className="grid grid-cols-3 gap-6 flex-1 items-center justify-center p-4">
        {[...Array(9)].map((_, i) => {
          const isThisHoleTarget = Math.random() < 0.4;
          return (
            <div key={i} className="relative aspect-square bg-emerald-900/20 rounded-full shadow-inner">
              {activeHole === i && (
                <button onClick={() => handleWhack(i, isThisHoleTarget)} className="absolute inset-0 bg-amber-800 border-t-8 border-amber-900 rounded-t-full flex items-center justify-center shadow-lg animate-in slide-in-from-bottom-full duration-200">
                  <span className="font-black text-xs text-white px-2 text-center">{isThisHoleTarget ? targetWord?.translation : pool[Math.floor(Math.random() * pool.length)].translation}</span>
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WhackAMole;
