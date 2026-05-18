
import React, { useState, useEffect } from 'react';
import { WordCard } from '../types';
import { Volume2, Music, Sparkles, Star, RotateCw, ChevronRight, PlayCircle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import audio from '../utils/AudioUtils';
import SafeImage from './SafeImage';

interface Props {
  card: WordCard;
  onLearned: () => void;
  onNext: () => void;
  isLast: boolean;
  onChallenge: () => void;
}

const WordLandCard: React.FC<Props> = ({ card, onLearned, onNext, isLast, onChallenge }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isPlaying, setIsPlaying] = useState<string | null>(null);
  const [hasLearned, setHasLearned] = useState(false);

  useEffect(() => {
    setIsFlipped(false);
    setHasLearned(false);
  }, [card.id]);

  const handleSpeak = (text: string, isRhyme: boolean = false) => {
    setIsPlaying(text);
    audio.speak(text);
    // Reset playing state after a short delay since we don't have onend callback in audio.speak
    setTimeout(() => setIsPlaying(null), 2000);
  };

  const handleFinishCard = () => {
    if (!hasLearned) {
      onLearned();
      setHasLearned(true);
    }
  };

  const getRhymeFontSize = (rhyme: string) => {
    const lines = rhyme.split(/[,，.。!！?？]/).filter(l => l.trim());
    const maxLength = Math.max(...lines.map(l => l.length));
    if (maxLength > 20) return 'text-base';
    if (maxLength > 16) return 'text-lg';
    if (maxLength > 12) return 'text-xl';
    return 'text-2xl';
  };

  return (
    <div className="w-full perspective-1000 min-h-[500px] flex flex-col items-center">
      <motion.div 
        className="relative w-full h-[450px] transition-all duration-500 preserve-3d cursor-pointer"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        {/* Front Side: Words */}
        <div className="absolute inset-0 backface-hidden bg-white rounded-[60px] shadow-2xl border-[6px] border-emerald-50 p-10 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <h2 className="text-4xl font-black text-emerald-800 tracking-tight">{card.suffix} 魔法</h2>
            <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600">
              <RotateCw size={24} />
            </div>
          </div>

          <div className="space-y-8 flex-1 flex flex-col justify-center">
            {card.words.map((word, idx) => (
              <div 
                key={idx} 
                className="flex items-center justify-between group"
                onClick={(e) => { e.stopPropagation(); handleSpeak(word.text); }}
              >
                <div className="flex items-center space-x-4">
                  <div className="text-4xl font-black tracking-tight text-slate-800">
                    {word.text.split(new RegExp(`(${card.suffix})`, 'i')).map((p, i) => (
                      <span key={i} className={p.toLowerCase() === card.suffix.toLowerCase() ? 'text-rose-500' : ''}>{p}</span>
                    ))}
                  </div>
                  <span className="text-2xl font-bold text-slate-400">（{word.translation}）</span>
                </div>
                <div className="relative">
                  <SafeImage 
                    src={word.imageUrl} 
                    className={`w-20 h-20 object-contain transition-transform duration-500 ${isPlaying === word.text ? 'scale-125 -rotate-6' : 'group-hover:scale-110'}`} 
                    alt={word.text} 
                    fallbackText={word.text}
                    width="80"
                    height="80"
                  />
                  {isPlaying === word.text && <Sparkles className="absolute -top-2 -right-2 text-amber-400 animate-spin-slow" size={20} />}
                </div>
              </div>
            ))}
          </div>

          <div className="text-center text-slate-300 font-black text-xs uppercase tracking-widest">
            点击翻转查看三字经
          </div>
        </div>

        {/* Back Side: Rhyme */}
        <div className="absolute inset-0 backface-hidden bg-emerald-600 rounded-[60px] shadow-2xl border-[6px] border-white/20 p-10 flex flex-col justify-between rotate-y-180">
          <div className="flex justify-between items-start">
            <h2 className="text-4xl font-black text-white/50 tracking-tight">三字经</h2>
            <div className="p-3 bg-white/10 rounded-2xl text-white">
              <RotateCw size={24} />
            </div>
          </div>

          <div 
            className="flex-1 flex flex-col justify-center items-center space-y-6 text-center"
            onClick={(e) => { e.stopPropagation(); handleSpeak(card.rhyme, true); }}
          >
            <div className="relative p-8 rounded-[40px] border-[4px] border-white/30 bg-white/10 backdrop-blur-md shadow-xl w-full">
              <p className={`font-black text-white leading-relaxed whitespace-pre-line ${getRhymeFontSize(card.rhyme)}`}>
                {card.rhyme.split(/[,，.。!！?？]/).filter(s => s.trim()).map((part, i) => (
                  <span key={i} className="block whitespace-nowrap">
                    {part.split(new RegExp(`(${card.suffix})`, 'gi')).map((tp, j) => (
                      <span key={j} className={tp.toLowerCase() === card.suffix.toLowerCase() ? 'text-amber-300' : ''}>{tp}</span>
                    ))}
                  </span>
                ))}
              </p>
              <div className={`absolute top-4 right-4 ${isPlaying === card.rhyme ? 'text-amber-300 animate-pulse' : 'text-white/30'}`}>
                <Music size={24} />
              </div>
            </div>
          </div>

          <div className="text-center text-white/30 font-black text-xs uppercase tracking-widest">
            点击翻转回单词
          </div>
        </div>
      </motion.div>

      {/* Action Buttons */}
      <div className="mt-10 w-full space-y-4">
        {!isLast ? (
          <button 
            onClick={() => { handleFinishCard(); onNext(); }}
            className="w-full py-6 rounded-[32px] font-black text-xl bg-emerald-600 text-white shadow-[0_8px_0_#064E3B] flex items-center justify-center transition-all puffy-button"
          >
            下一张 <ChevronRight className="ml-2" />
          </button>
        ) : (
          <div className="space-y-4 animate-in slide-in-from-bottom-5">
            <div className="bg-emerald-50 p-6 rounded-[32px] border-2 border-emerald-100 flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg">
                <CheckCircle2 size={28} />
              </div>
              <div>
                <h4 className="font-black text-emerald-800">今日探险完成！</h4>
                <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Adventure Accomplished</p>
              </div>
            </div>
            <button 
              onClick={onChallenge}
              className="w-full py-6 rounded-[32px] font-black text-xl bg-amber-500 text-white shadow-[0_8px_0_#92400E] flex items-center justify-center transition-all puffy-button"
            >
              <PlayCircle className="mr-3" /> 进入游乐园练习
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default WordLandCard;
