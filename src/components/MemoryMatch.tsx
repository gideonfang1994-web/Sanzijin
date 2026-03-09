
import React, { useState, useEffect, useMemo } from 'react';
import { WordGroup } from '../types';
import { Timer, Star, Music, Award, X } from 'lucide-react';
import audio from '../utils/AudioUtils';
import confetti from 'canvas-confetti';

interface Props {
  groups: WordGroup[];
  onFinish: (score: number) => void;
  onClose: () => void;
}

interface Card {
  id: number;
  content: string;
  type: 'EN' | 'CN';
  matchId: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const MemoryMatch: React.FC<Props> = ({ groups, onFinish, onClose }) => {
  const [cards, setCards] = useState<Card[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);

  // Sync pool with current active group, but limit for memory match gameplay (max 8 pairs)
  const taskWords = useMemo(() => {
    const activeGroup = groups.find(g => !g.learned) || groups[0];
    const words = activeGroup?.words || [];
    return words.length > 8 ? words.slice(0, 8) : words;
  }, [groups]);

  useEffect(() => {
    if (taskWords.length === 0) return;
    
    audio.init();
    const gameCards: Card[] = [];
    taskWords.forEach((w, idx) => {
      gameCards.push({ id: idx * 2, content: w.text, type: 'EN', matchId: w.text, isFlipped: false, isMatched: false });
      gameCards.push({ id: idx * 2 + 1, content: w.translation, type: 'CN', matchId: w.text, isFlipped: false, isMatched: false });
    });
    setCards(gameCards.sort(() => 0.5 - Math.random()));
  }, [taskWords]);

  useEffect(() => {
    if (timeLeft <= 0 && !isGameOver) { 
      setIsGameOver(true); 
      onFinish(score); 
    }
    const timer = !isGameOver && timeLeft > 0 && setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => timer && clearInterval(timer);
  }, [timeLeft, isGameOver]);

  const handleFlip = (idx: number) => {
    if (flipped.length === 2 || cards[idx].isFlipped || cards[idx].isMatched) return;
    audio.playPop();
    
    const newCards = [...cards];
    newCards[idx].isFlipped = true;
    setCards(newCards);
    
    const newFlipped = [...flipped, idx];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      const [first, second] = newFlipped;
      if (cards[first].matchId === cards[second].matchId && cards[first].type !== cards[second].type) {
        audio.playSuccess();
        setTimeout(() => {
          const matched = [...cards];
          matched[first].isMatched = true;
          matched[second].isMatched = true;
          setCards(matched);
          setFlipped([]);
          setScore(prev => prev + 300);
          if (matched.every(c => c.isMatched)) {
            confetti({ particleCount: 50 });
            setIsGameOver(true);
            onFinish(score + timeLeft * 10);
          }
        }, 400);
      } else {
        setTimeout(() => {
          const reset = [...cards];
          reset[first].isFlipped = false;
          reset[second].isFlipped = false;
          setCards(reset);
          setFlipped([]);
        }, 700);
      }
    }
  };

  if (isGameOver) {
    return (
      <div className="flex flex-col items-center justify-center h-full animate-in zoom-in-95 duration-500">
        <div className="bg-white rounded-[50px] p-10 shadow-2xl border-[8px] border-amber-400 text-center w-full max-w-sm">
          <Award className="w-16 h-16 text-amber-500 mx-auto" />
          <h2 className="text-3xl font-black mt-6">记忆大师!</h2>
          <p className="text-5xl font-black text-amber-500 my-6 tabular-nums">{score}</p>
          <button onClick={onClose} className="w-full puffy-button bg-amber-500 text-white py-4 rounded-3xl font-black">返回游乐园</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="flex justify-between items-center p-4 bg-white rounded-3xl border-2 border-slate-50 shadow-sm">
        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
          <X size={20} className="text-slate-400" />
        </button>
        <div className="font-black text-amber-500 text-xl flex items-center">
          <Star className="w-5 h-5 mr-2 fill-amber-500" /> 单词连连看
        </div>
        <div className={`font-black tabular-nums ${timeLeft < 10 ? 'text-rose-500 animate-pulse' : 'text-slate-400'}`}>{timeLeft}s</div>
      </div>
      <div className={`grid ${cards.length > 12 ? 'grid-cols-4' : 'grid-cols-3'} gap-3 flex-1 overflow-y-auto pb-4`}>
        {cards.map((card, i) => (
          <div 
            key={card.id} 
            onClick={() => handleFlip(i)} 
            className={`relative rounded-2xl cursor-pointer transition-all duration-500 transform preserve-3d h-24 sm:h-32 ${card.isFlipped || card.isMatched ? 'rotate-y-180' : 'active:scale-95'}`}
          >
            {/* Front of card (Yellow with Star) */}
            <div className={`absolute inset-0 bg-amber-400 border-b-8 border-amber-600 rounded-2xl flex items-center justify-center backface-hidden ${card.isFlipped || card.isMatched ? 'opacity-0' : 'opacity-100'}`}>
              <Star className="text-white/40 w-8 h-8" />
            </div>

            {/* Back of card (White with Content) */}
            <div className={`absolute inset-0 bg-white border-2 border-amber-100 rounded-2xl flex items-center justify-center text-center p-2 backface-hidden rotate-y-180 ${card.isFlipped || card.isMatched ? 'opacity-100' : 'opacity-0'}`}>
              <span className={`font-black leading-tight break-words ${card.type === 'EN' ? 'text-indigo-600 text-sm sm:text-lg' : 'text-slate-700 text-xs sm:text-base'}`}>{card.content}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MemoryMatch;
