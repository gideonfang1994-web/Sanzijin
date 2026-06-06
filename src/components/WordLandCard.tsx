
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
  wordMastery?: Record<string, number>;
}

const WordLandCard: React.FC<Props> = ({ card, onLearned, onNext, isLast, onChallenge, wordMastery = {} }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const [triggerCount, setTriggerCount] = useState(() => {
    try {
      const saved = localStorage.getItem('wordland_sanzijing_trigger_clicks');
      return saved ? parseInt(saved, 10) : 0;
    } catch(e) {
      return 0;
    }
  });

  const handleTriggerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFlipped(true);
    try { audio.playClick(); } catch(err){}
    const nextCount = triggerCount + 1;
    setTriggerCount(nextCount);
    try {
      localStorage.setItem('wordland_sanzijing_trigger_clicks', nextCount.toString());
    } catch(err) {}
  };

  const getWordMasteryInfo = (wordText: string) => {
    const text = wordText.trim().toLowerCase();
    const count = wordMastery[text] || 0;
    
    if (count >= 3) {
      return {
        label: '完美 Master',
        colorClass: 'bg-indigo-50 border-indigo-200 text-indigo-700',
        starCount: 3,
        emoji: '💎'
      };
    } else if (count === 2) {
      return {
        label: '精通 Expert',
        colorClass: 'bg-emerald-50 border-emerald-250 text-emerald-700',
        starCount: 2,
        emoji: '🌟'
      };
    } else if (count === 1) {
      return {
        label: '熟练 Learner',
        colorClass: 'bg-amber-50 border-amber-200 text-amber-700',
        starCount: 1,
        emoji: '✨'
      };
    } else {
      return {
        label: '初学 Novice',
        colorClass: 'bg-slate-50 border-slate-200 text-slate-500',
        starCount: 0,
        emoji: '🌱'
      };
    }
  };

  const getCardMasteryStats = () => {
    const totalWords = card.words.length;
    if (totalWords === 0) return null;
    
    let masteredCount = 0;
    let totalScore = 0;
    
    card.words.forEach(w => {
      const text = w.text.trim().toLowerCase();
      const score = wordMastery[text] || 0;
      totalScore += score;
      if (score >= 1) masteredCount++;
    });
    
    const avgScore = totalScore / totalWords;
    
    if (avgScore >= 3) {
      return {
        label: '完美掌握 Perfect',
        colorClass: 'from-purple-500 to-indigo-600 border-purple-400 text-white',
        emoji: '🏆'
      };
    } else if (avgScore >= 1.5) {
      return {
        label: '驾轻就熟 Proficient',
        colorClass: 'from-emerald-500 to-teal-600 border-emerald-400 text-white',
        emoji: '💡'
      };
    } else if (masteredCount > 0) {
      return {
        label: '正在探索 Learning',
        colorClass: 'from-amber-400 to-amber-500 border-amber-300 text-slate-900',
        emoji: '🌱'
      };
    } else {
      return {
        label: '尚未开始 Unstarted',
        colorClass: 'from-slate-100 to-slate-200 border-slate-300 text-slate-600',
        emoji: '🔑'
      };
    }
  };

  const [isPlaying, setIsPlaying] = useState<string | null>(null);
  const [hasLearned, setHasLearned] = useState(false);
  const [spellingWord, setSpellingWord] = useState<WordItem | null>(null);
  const [activeWordIdx, setActiveWordIdx] = useState(0);
  const [revealedWords, setRevealedWords] = useState<Record<string, boolean>>({});
  const [globalReveal, setGlobalReveal] = useState(false);

  useEffect(() => {
    setIsFlipped(false);
    setHasLearned(false);
    setActiveWordIdx(0);
    setRevealedWords({});
    setGlobalReveal(false);
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
          <span key={`text-${lastIndex}`} className="text-white font-black text-xl md:text-2xl font-cute tracking-wide drop-shadow-sm">
            {line.substring(lastIndex, match.index)}
          </span>
        );
      }

      const englishWord = match[1];
      const translation = match[2] || '';

      const renderWordPart = () => {
        if (!suffix) {
          return <span className="text-amber-300 font-black font-cute">{englishWord}</span>;
        }
        
        const lowerWord = englishWord.toLowerCase();
        const lowerSuffix = suffix.toLowerCase();
        
        if (lowerWord.endsWith(lowerSuffix)) {
          const rootLen = englishWord.length - suffix.length;
          const root = englishWord.substring(0, rootLen);
          const endPart = englishWord.substring(rootLen);
          return (
            <span className="font-black text-2xl md:text-3xl font-cute tracking-normal scale-105 inline-block">
              <span className="text-amber-300 hover:text-amber-200 transition-colors">{root}</span>
              <span className="text-red-400 hover:text-red-350 transition-colors">{endPart}</span>
            </span>
          );
        } else if (lowerWord.includes(lowerSuffix)) {
          const idx = lowerWord.indexOf(lowerSuffix);
          const part1 = englishWord.substring(0, idx);
          const part2 = englishWord.substring(idx, idx + suffix.length);
          const part3 = englishWord.substring(idx + suffix.length);
          return (
            <span className="font-black text-2xl md:text-3xl font-cute tracking-normal scale-105 inline-block">
              <span className="text-amber-300 hover:text-amber-200 transition-colors">{part1}</span>
              <span className="text-red-400 hover:text-red-350 transition-colors">{part2}</span>
              {part3 && <span className="text-amber-300 hover:text-amber-200 transition-colors">{part3}</span>}
            </span>
          );
        }
        
        return <span className="text-amber-300 font-black text-2xl md:text-3xl font-cute tracking-normal scale-105 inline-block">{englishWord}</span>;
      };

      const isWordRevealed = globalReveal || !!revealedWords[englishWord.toLowerCase()];

      parts.push(
        <span 
          key={`word-${match.index}`}
          onClick={(e) => {
            e.stopPropagation();
            try { audio.playPop(); } catch (e){}
            audio.speak(englishWord);
            setRevealedWords(prev => ({
              ...prev,
              [englishWord.toLowerCase()]: !prev[englishWord.toLowerCase()]
            }));
          }}
          className={`cursor-pointer transition-all duration-300 mx-1 px-3 py-0.5 rounded-xl border-2 select-none inline-flex items-center ${
            isWordRevealed 
              ? 'bg-white/10 border-white/20 hover:scale-110 active:scale-95' 
              : 'bg-amber-400/10 border-dashed border-amber-400/40 hover:bg-amber-400/20 hover:scale-105 active:scale-95'
          }`}
          title={isWordRevealed ? "点击发音 / 再次挖空" : "点击揭晓并朗读单词"}
        >
          {isWordRevealed ? (
            <motion.span
              key="revealed"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 15 }}
            >
              {renderWordPart()}
            </motion.span>
          ) : (
            <span key="blank" className="text-amber-300/80 font-sans tracking-wide font-black text-xl md:text-2xl px-1">
              ____
            </span>
          )}
          {translation && (
            <span className="text-amber-100 font-bold text-xl md:text-2xl ml-1 font-cute drop-shadow-sm">
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
        <span key={`text-end`} className="text-white font-black text-xl md:text-2xl font-cute tracking-wide drop-shadow-sm">
          {remaining}
        </span>
      );
    }

    return parts.length > 0 ? parts : line;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        type: "spring",
        stiffness: 90,
        damping: 15,
        mass: 0.8
      }}
      className="w-full perspective-1000 min-h-[500px] flex flex-col items-center"
    >
      <motion.div 
        className="relative w-full h-[450px] preserve-3d cursor-pointer rounded-[60px]"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        whileHover={isFlipped ? {} : {
          y: -12,
          scale: 1.025,
          z: 10,
          boxShadow: "0 35px 80px -15px rgba(16, 185, 129, 0.2)"
        }}
        transition={{ 
          rotateY: { duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }, // Elastic bezier timing curve
          y: { type: "spring", stiffness: 200, damping: 15 },
          scale: { type: "spring", stiffness: 200, damping: 15 },
          boxShadow: { duration: 0.3 }
        }}
        onClick={() => {
          setIsFlipped(!isFlipped);
          try { audio.playClick(); } catch(e){}
        }}
      >
        {/* Front Side: Words */}
        <div 
          className="absolute inset-0 bg-white rounded-[60px] shadow-2xl border-[6px] border-emerald-50 p-10 flex flex-col justify-between"
          style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
        >
          <div className="flex justify-between items-start w-full">
            <div className="space-y-2 text-left">
              <h2 className="text-4xl font-black text-emerald-800 tracking-tight">{card.suffix} 魔法</h2>
              {(() => {
                const cardStats = getCardMasteryStats();
                if (!cardStats) return null;
                return (
                  <div className={`inline-flex items-center space-x-1.5 px-3 py-0.5 text-xs font-black rounded-full border shadow-sm bg-gradient-to-r ${cardStats.colorClass}`}>
                    <span className="text-sm">{cardStats.emoji}</span>
                    <span className="tracking-wide uppercase text-[10px]">{cardStats.label}</span>
                  </div>
                );
              })()}
            </div>
            
            <div className="flex flex-col items-end space-y-1">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                animate={triggerCount < 3 ? { 
                  scale: [1, 1.06, 1],
                  boxShadow: [
                    "0 4px 6px -1px rgba(16, 185, 129, 0.1), 0 2px 4px -1px rgba(16, 185, 129, 0.06)",
                    "0 10px 15px -3px rgba(16, 185, 129, 0.35), 0 4px 6px -2px rgba(16, 185, 129, 0.15)",
                    "0 4px 6px -1px rgba(16, 185, 129, 0.1), 0 2px 4px -1px rgba(16, 185, 129, 0.06)"
                  ]
                } : {}}
                transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
                onClick={handleTriggerClick}
                className="px-4 py-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-600 hover:to-teal-600 text-white rounded-2xl font-black text-xs tracking-wider shadow-md flex items-center space-x-1.5 transition-all outline-none border border-emerald-400 z-20"
                title="切换到三字经自测"
              >
                <RotateCw size={14} className="animate-spin-slow" />
                <span>🔮 自测三字经</span>
              </motion.button>
              
              {triggerCount < 3 && (
                <motion.div 
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-lg px-2.5 py-1 shadow-sm text-right leading-tight max-w-[155px]"
                >
                  💡 点击进入“挖空自测”模式
                </motion.div>
              )}
            </div>
          </div>

          <div className="space-y-8 flex-1 flex flex-col justify-center">
            {card.words.map((word, idx) => (
              <div 
                key={idx} 
                className="flex items-center justify-between group"
                onClick={(e) => { 
                  e.stopPropagation(); 
                  audio.unlockSpeech();
                  setSpellingWord(word); 
                }}
              >
                <div className="flex items-center space-x-4">
                  <div className="text-4xl font-black tracking-tight text-slate-800">
                    {renderWordHighlight(word.text, card.suffix, 'text-rose-500')}
                  </div>
                  <div className="flex flex-col items-start leading-none space-y-1">
                    <span className="text-2xl font-bold text-slate-400 leading-none">（{word.translation}）</span>
                    {(() => {
                      const m = getWordMasteryInfo(word.text);
                      return (
                        <div className={`flex items-center space-x-1 px-2.5 py-0.5 text-[11px] font-black rounded-full border ${m.colorClass}`}>
                          <span>{m.emoji}</span>
                          <span className="tracking-wide text-[10px] uppercase">{m.label}</span>
                          {m.starCount > 0 && (
                            <span className="flex items-center text-amber-500 gap-0.5">
                              {Array.from({ length: m.starCount }).map((_, i) => (
                                <Star key={i} size={8} className="fill-current" />
                              ))}
                            </span>
                          )}
                        </div>
                      );
                    })()}
                  </div>
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

          <div className="text-center text-slate-350 font-black text-xs uppercase tracking-widest">
            点击空白或右上角按钮翻转查看三字经
          </div>
        </div>

        {/* Back Side: Rhyme */}
        <div 
          className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-teal-700 to-emerald-950 rounded-[60px] shadow-2xl border-[6px] border-white/20 p-8 flex flex-col justify-between"
          style={{ transform: 'rotateY(180deg)', backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
        >
          <div className="flex justify-between items-center w-full" onClick={(e) => e.stopPropagation()}>
            <div className="text-left space-y-0.5">
              <span className="inline-block bg-white/20 text-white font-black text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-white/15">
                “{card.suffix}” 魔法自测
              </span>
              <h2 className="text-2xl font-black text-white font-cute tracking-wide">口诀挖空卡</h2>
            </div>
            
            <div className="flex items-center space-x-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => {
                  e.stopPropagation();
                  try { audio.playPop(); } catch(e){}
                  setGlobalReveal(!globalReveal);
                }}
                className={`px-3 py-2 rounded-2xl border transition-all shadow-sm text-xs font-black flex items-center space-x-1.5 backdrop-blur-md ${
                  globalReveal
                    ? 'bg-amber-400 text-slate-900 border-amber-300 hover:bg-amber-350'
                    : 'bg-white/10 text-white border-white/15 hover:bg-white/25'
                }`}
                title={globalReveal ? '切换至自测挖空模式' : '显示所有答案词'}
              >
                <span>{globalReveal ? '🙈 挖空自测' : '👁️ 显示答案'}</span>
              </motion.button>
              
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsFlipped(false);
                  try { audio.playClick(); } catch(e){}
                }}
                className="px-3 py-2 bg-white/10 text-white hover:bg-white/25 transition-all shadow-sm border border-white/15 rounded-2xl text-xs font-black flex items-center space-x-1.5"
                title="返回正面"
              >
                <RotateCw size={12} className="animate-spin-slow duration-1000" />
                <span>卡片正面</span>
              </motion.button>
            </div>
          </div>

          {/* Beautiful and tidy SanZijing container on the back card */}
          <div 
            className="bg-white/10 backdrop-blur-md border-[2px] border-white/15 p-6 md:p-8 rounded-[40px] w-full flex-1 flex flex-col justify-center space-y-4 md:space-y-6 relative overflow-hidden text-center shadow-lg my-4"
            onClick={(e) => { e.stopPropagation(); handleSpeak(card.rhyme, true); }}
          >
            <div className={`space-y-4 w-full justify-center flex flex-col items-center select-text ${getRhymeFontSize(card.rhyme)}`}>
              {card.rhyme.split(/[,，.。!！?？]/).filter(s => s.trim()).map((part, i) => (
                <div 
                  key={i} 
                  className="flex flex-row flex-nowrap whitespace-nowrap justify-center items-center leading-relaxed tracking-wider font-extrabold"
                >
                  {renderSanzijingLine(part, card.suffix)}
                </div>
              ))}
            </div>
            
            <div className="pt-3 flex flex-col items-center justify-center border-t border-white/10 space-y-2">
              <button
                onClick={(e) => { e.stopPropagation(); handleSpeak(card.rhyme, true); }}
                className="px-6 py-2 rounded-full bg-white/15 hover:bg-white/20 border border-white/10 text-white font-extrabold text-[12px] flex items-center space-x-2 shadow-sm transition-all active:scale-95"
              >
                <Volume2 size={14} className={isPlaying === card.rhyme ? 'animate-pulse text-amber-300' : ''} />
                <span>🎙️ 大声说唱口诀 Chant Along!</span>
              </button>
            </div>
          </div>

          <div className="text-center text-white/40 font-black text-[10px] uppercase tracking-widest leading-none">
            点击空白区域朗读口诀，或点击挖空部分显示单词/播放发音
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
    </motion.div>
  );
};

export default WordLandCard;
