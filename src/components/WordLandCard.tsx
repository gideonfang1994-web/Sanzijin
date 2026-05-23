
import React, { useState, useEffect } from 'react';
import { WordCard, WordItem } from '../types';
import { Volume2, Music, Sparkles, Star, RotateCw, ChevronRight, PlayCircle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import audio from '../utils/AudioUtils';
import SafeImage from './SafeImage';
import PhonicsSpellingModal from './PhonicsSpellingModal';

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
  const [spellingWord, setSpellingWord] = useState<WordItem | null>(null);
  const [activeWordIdx, setActiveWordIdx] = useState(0);

  useEffect(() => {
    setIsFlipped(false);
    setHasLearned(false);
    setActiveWordIdx(0);
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

  const formatInteractiveRhymeText = (text: string) => {
    const regex = /([a-zA-Z]+)\s*(（[^）]+）|\([^)]+\))?/g;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(<span key={`text-${lastIndex}`}>{text.substring(lastIndex, match.index)}</span>);
      }
      const englishWord = match[1];
      const translation = match[2] || '';
      
      const isSuffixWord = englishWord.toLowerCase().endsWith(card.suffix.toLowerCase()) || englishWord.toLowerCase().includes(card.suffix.toLowerCase());

      parts.push(
        <motion.span 
          key={`word-${match.index}`}
          whileHover={{ scale: 1.15, rotate: -1.5 }}
          whileTap={{ scale: 0.9 }}
          onClick={(e) => {
            e.stopPropagation();
            audio.playPop();
            audio.speak(englishWord);
          }}
          className={`inline-flex items-center mx-1.5 px-3.5 py-1.5 rounded-[20px] font-black text-xl shadow-md cursor-pointer select-none transition-all ${
            isSuffixWord 
              ? 'bg-gradient-to-r from-amber-300 to-yellow-400 border-2 border-amber-200 text-slate-900 shadow-amber-500/10'
              : 'bg-white border border-slate-200 text-slate-800'
          }`}
        >
          {englishWord}
          {translation && (
            <span className={`text-[12px] font-extrabold ml-1.5 px-2 py-0.5 rounded-lg ${
              isSuffixWord 
                ? 'bg-amber-950/10 text-amber-950/90' 
                : 'bg-slate-100 text-slate-500'
            }`}>
              {translation.replace(/[（）()]/g, '')}
            </span>
          )}
        </motion.span>
      );
      lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push(<span key={`text-end`}>{text.substring(lastIndex)}</span>);
    }

    return parts.length > 0 ? parts : text;
  };

  const renderWordHighlight = (text: string, suffix: string, highlightClass: string = 'text-rose-500') => {
    if (!suffix) {
      return <span>{text}</span>;
    }
    const lowerText = text.toLowerCase();
    const lowerSuffix = suffix.toLowerCase();
    
    if (lowerText.endsWith(lowerSuffix)) {
      const rootLen = text.length - suffix.length;
      const root = text.substring(0, rootLen);
      const endPart = text.substring(rootLen);
      return (
        <span>
          <span>{root}</span>
          <span className={highlightClass}>{endPart}</span>
        </span>
      );
    } else if (lowerText.includes(lowerSuffix)) {
      const idx = lowerText.indexOf(lowerSuffix);
      const part1 = text.substring(0, idx);
      const part2 = text.substring(idx, idx + suffix.length);
      const part3 = text.substring(idx + suffix.length);
      return (
        <span>
          <span>{part1}</span>
          <span className={highlightClass}>{part2}</span>
          {part3 && <span>{part3}</span>}
        </span>
      );
    }
    return <span>{text}</span>;
  };

  const renderSanzijingLine = (line: string, suffix: string = '') => {
    const regex = /([a-zA-Z]+)\s*([（(][^）)]+[）)])?/g;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(line)) !== null) {
      if (match.index > lastIndex) {
        parts.push(
          <span key={`text-${lastIndex}`} className="text-white/95 font-extrabold text-lg md:text-xl">
            {line.substring(lastIndex, match.index)}
          </span>
        );
      }

      const englishWord = match[1];
      const translation = match[2] || '';

      const renderWordPart = () => {
        if (!suffix) {
          return <span className="text-amber-300 font-black">{englishWord}</span>;
        }
        
        const lowerWord = englishWord.toLowerCase();
        const lowerSuffix = suffix.toLowerCase();
        
        if (lowerWord.endsWith(lowerSuffix)) {
          const rootLen = englishWord.length - suffix.length;
          const root = englishWord.substring(0, rootLen);
          const endPart = englishWord.substring(rootLen);
          return (
            <span className="font-black text-xl md:text-2xl">
              <span className="text-amber-300">{root}</span>
              <span className="text-red-400">{endPart}</span>
            </span>
          );
        } else if (lowerWord.includes(lowerSuffix)) {
          const idx = lowerWord.indexOf(lowerSuffix);
          const part1 = englishWord.substring(0, idx);
          const part2 = englishWord.substring(idx, idx + suffix.length);
          const part3 = englishWord.substring(idx + suffix.length);
          return (
            <span className="font-black text-xl md:text-2xl">
              <span className="text-amber-300">{part1}</span>
              <span className="text-red-400">{part2}</span>
              {part3 && <span className="text-amber-300">{part3}</span>}
            </span>
          );
        }
        
        return <span className="text-amber-300 font-black text-xl md:text-2xl">{englishWord}</span>;
      };

      parts.push(
        <span 
          key={`word-${match.index}`}
          onClick={(e) => {
            e.stopPropagation();
            audio.playPop();
            audio.speak(englishWord);
          }}
          className="cursor-pointer hover:underline mx-1 inline-flex items-center"
          title="点击发音"
        >
          {renderWordPart()}
          {translation && (
            <span className="text-emerald-50/80 font-bold text-lg md:text-xl ml-1">
              {translation}
            </span>
          )}
        </span>
      );

      lastIndex = regex.lastIndex;
    }

    if (lastIndex < line.length) {
      const remaining = line.substring(lastIndex);
      parts.push(
        <span key={`text-end`} className="text-white/95 font-extrabold text-lg md:text-xl">
          {remaining}
        </span>
      );
    }

    return parts.length > 0 ? parts : line;
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
                onClick={(e) => { e.stopPropagation(); setSpellingWord(word); }}
              >
                <div className="flex items-center space-x-4">
                  <div className="text-4xl font-black tracking-tight text-slate-800">
                    {renderWordHighlight(word.text, card.suffix, 'text-rose-500')}
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
        <div className="absolute inset-0 backface-hidden bg-gradient-to-br from-emerald-600 via-teal-700 to-emerald-900 rounded-[60px] shadow-2xl border-[6px] border-white/20 p-8 flex flex-col justify-between rotate-y-180">
          <div className="flex justify-between items-start" onClick={(e) => e.stopPropagation()}>
            <div className="text-left space-y-0.5">
              <span className="inline-block bg-white/20 text-white font-black text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-white/15">
                “{card.suffix}” 魔法节奏
              </span>
              <h2 className="text-2xl font-black text-white/95 tracking-tight">拼读三字经</h2>
            </div>
            
            <button 
              onClick={() => setIsFlipped(false)}
              className="p-2.5 bg-white/10 rounded-2xl text-white hover:bg-white/25 active:scale-95 transition-all shadow-sm"
              title="翻转看单词"
            >
              <RotateCw size={18} />
            </button>
          </div>

          {/* Word Selector Tabs */}
          {card.words && card.words.length > 1 && (
            <div className="flex justify-center bg-white/10 backdrop-blur-md p-1.5 rounded-2xl border border-white/10 space-x-1 gap-y-1 z-20" onClick={(e) => e.stopPropagation()}>
              {card.words.map((word, i) => (
                <button
                  key={i}
                  onClick={(e) => {
                    e.stopPropagation();
                    audio.playPop();
                    setActiveWordIdx(i);
                    audio.speak(word.text);
                  }}
                  className={`px-3 py-1.5 rounded-xl font-black text-xs transition-all ${
                    activeWordIdx === i
                      ? 'bg-amber-400 text-slate-900 shadow-md font-black scale-105'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  {word.text}
                </button>
              ))}
            </div>
          )}

          {/* Single Word Focus Area on the back card */}
          {(() => {
            const activeWord = card.words[activeWordIdx] || card.words[0];
            if (!activeWord) return null;
            return (
              <div className="flex items-center justify-between bg-white/10 rounded-3xl p-3 border border-white/10 space-x-4 h-22 select-none" onClick={(e) => { e.stopPropagation(); audio.playPop(); audio.speak(activeWord.text); }}>
                <div className="flex items-center space-x-3">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center p-2 shadow-inner overflow-hidden shrink-0">
                    <SafeImage 
                      src={activeWord.imageUrl} 
                      alt={activeWord.text} 
                      className="w-full h-full object-contain"
                      fallbackText={activeWord.text}
                      width="48"
                      height="48"
                    />
                  </div>
                  <div className="text-left">
                    <h3 className="text-2xl font-black text-white flex items-center space-x-2">
                      <span>
                        {renderWordHighlight(activeWord.text, card.suffix, 'text-amber-300')}
                      </span>
                    </h3>
                    <p className="text-emerald-100/80 font-bold text-xs">（{activeWord.translation}）</p>
                  </div>
                </div>
                
                <div className="flex space-x-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                  <button 
                    onClick={() => { audio.playPop(); audio.speak(activeWord.text); }}
                    className="p-1.5 bg-white/10 text-white rounded-xl hover:bg-white/20 active:scale-95 shadow-sm"
                    title="播放发音"
                  >
                    <Volume2 size={16} />
                  </button>
                  <button 
                    onClick={() => setSpellingWord(activeWord)}
                    className="p-1.5 bg-amber-400 text-slate-900 rounded-xl hover:bg-amber-305 active:scale-95 shadow-sm font-bold text-[10px]"
                    title="拼写挑战"
                  >
                    拼写
                  </button>
                </div>
              </div>
            );
          })()}

          {/* Beautiful and tidy SanZijing container on the back card */}
          <div 
            className="bg-white/10 backdrop-blur-md border-[2px] border-white/15 p-5 md:p-6 rounded-[32px] w-full flex flex-col justify-center space-y-3 relative overflow-hidden text-center shadow-lg"
            onClick={(e) => { e.stopPropagation(); handleSpeak(card.rhyme, true); }}
          >
            <div className={`space-y-2.5 w-full justify-center flex flex-col items-center select-text ${getRhymeFontSize(card.rhyme)}`}>
              {card.rhyme.split(/[,，.。!！?？]/).filter(s => s.trim()).map((part, i) => (
                <div 
                  key={i} 
                  className="flex justify-center flex-wrap items-center leading-relaxed tracking-wide font-bold"
                >
                  {renderSanzijingLine(part, card.suffix)}
                </div>
              ))}
            </div>
            
            <div className="pt-1.5 flex flex-col items-center justify-center border-t border-white/10 space-y-1">
              <button
                onClick={(e) => { e.stopPropagation(); handleSpeak(card.rhyme, true); }}
                className="px-4 py-1.5 rounded-full bg-white/15 hover:bg-white/20 border border-white/10 text-white font-extrabold text-[11px] flex items-center space-x-1 shadow-sm transition-all"
              >
                <Volume2 size={12} className={isPlaying === card.rhyme ? 'animate-pulse text-amber-300' : ''} />
                <span>大声说唱口诀 Chant Along!</span>
              </button>
            </div>
          </div>

          <div className="text-center text-white/40 font-black text-[10px] uppercase tracking-widest leading-none">
            点击右上角返回或卡片空白处
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

      <AnimatePresence>
        {spellingWord && (
          <PhonicsSpellingModal
            word={spellingWord.text}
            translation={spellingWord.translation}
            imageUrl={spellingWord.imageUrl}
            onClose={() => setSpellingWord(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default WordLandCard;
