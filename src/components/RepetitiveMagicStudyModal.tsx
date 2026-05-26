import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, BookOpen, Clock, Activity, ArrowRight, Play, CheckCircle2, ChevronRight, Award, Trophy, Star } from 'lucide-react';
import { UserStats, WordItem, WordCard } from '../types';
import { ALL_CARDS } from '../constants';
import audio from '../utils/AudioUtils';
import SafeImage from './SafeImage';
import PhonicsSpellingModal from './PhonicsSpellingModal';

interface RepetitiveMagicStudyModalProps {
  stats: UserStats;
  onClose: () => void;
  onCompleteReview: () => void;
  onSelectReviewLevel: (levelId: number) => void;
}

export const RepetitiveMagicStudyModal: React.FC<RepetitiveMagicStudyModalProps> = ({
  stats,
  onClose,
  onCompleteReview,
  onSelectReviewLevel,
}) => {
  const [selectedLevelId, setSelectedLevelId] = useState<number | null>(null);
  const [activePhonicsWord, setActivePhonicsWord] = useState<string | null>(null);
  const [activePhonicsWordImg, setActivePhonicsWordImg] = useState<string>('');

  // Active review progress inside the modal
  const [isReviewingWords, setIsReviewingWords] = useState(false);
  const [wordReviewIndex, setWordReviewIndex] = useState(0);
  const [reviewedList, setReviewedList] = useState<Record<string, boolean>>({});

  const savedDifficulty = useMemo(() => {
    return localStorage.getItem('selected_adventure_difficulty') || 'PRIMARY';
  }, []);

  const cardsPerDay = stats.cardsPerDay || 5;

  const getLevelInfo = (levelId: number) => {
    let offset = 0;
    if (savedDifficulty === 'INTERMEDIATE') offset = 100;
    if (savedDifficulty === 'ADVANCED') offset = 200;

    const relativeId = levelId - offset;
    const cardsOfDifficulty = ALL_CARDS.filter(card => (card.difficulty || 'PRIMARY') === savedDifficulty);
    const levelCards = cardsOfDifficulty.slice((relativeId - 1) * cardsPerDay, relativeId * cardsPerDay);
    
    const levelName = levelCards[0]?.levelName || `第 ${relativeId} 关`;
    const words = levelCards.flatMap(c => c.words);

    return {
      id: levelId,
      displayId: relativeId,
      name: levelName,
      words,
    };
  };

  // 1. 最近学过的关卡 (Last Learned Level)
  const lastLearnedLevel = useMemo(() => {
    const completed = stats.completedLevelIds || [];
    if (completed.length > 0) {
      const levelId = Number(completed[completed.length - 1]);
      return getLevelInfo(levelId);
    }
    return null;
  }, [stats.completedLevelIds, savedDifficulty, cardsPerDay]);

  // 2. 按记忆曲线需要复习的其他关卡 (Spaced Repetition / Due for Review levels)
  const dueReviews = useMemo(() => {
    const now = Date.now();
    const schedules = stats.reviewSchedules || {};
    
    return Object.entries(schedules)
      .filter(([_, s]: [string, any]) => now >= s.nextReviewAt)
      .map(([levelIdStr, s]: [string, any]) => {
        const levelId = Number(levelIdStr);
        const info = getLevelInfo(levelId);
        // Calculate dynamic decay percentage (approximate based on interval)
        const timeSinceDue = now - s.nextReviewAt;
        const decayHours = timeSinceDue / (1000 * 60 * 60);
        // Spacing curve - magic concentration decays
        const concentration = Math.max(10, Math.round(100 - (decayHours * 1.5)));
        return {
          ...info,
          concentration,
          intervalDays: s.intervalDays,
        };
      })
      .sort((a, b) => a.concentration - b.concentration); // Most decayed levels first
  }, [stats.reviewSchedules, savedDifficulty, cardsPerDay]);

  const currentReviewWords = useMemo(() => {
    if (!selectedLevelId) return [];
    return getLevelInfo(selectedLevelId).words;
  }, [selectedLevelId]);

  const startReviewSession = (levelId: number) => {
    audio.playClick();
    setSelectedLevelId(levelId);
    setIsReviewingWords(true);
    setWordReviewIndex(0);
    setReviewedList({});
  };

  const handleWordSpeak = (text: string) => {
    audio.speak(text);
  };

  const handleNextWordReview = () => {
    const currentWord = currentReviewWords[wordReviewIndex];
    if (currentWord) {
      setReviewedList(prev => ({ ...prev, [currentWord.text]: true }));
    }

    if (wordReviewIndex < currentReviewWords.length - 1) {
      setWordReviewIndex(prev => prev + 1);
      audio.playPop();
    } else {
      // Finished all review words for this level
      audio.playSuccess();
      onCompleteReview();
      setSelectedLevelId(null);
      setIsReviewingWords(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 30 }}
        className="bg-white rounded-[40px] p-6 shadow-2xl border-[3px] border-emerald-100 max-w-lg w-full relative overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Colorful Gradient Border header */}
        <div className="absolute top-0 left-0 w-full h-2.5 bg-gradient-to-r from-teal-400 via-emerald-500 to-indigo-500" />
        
        {/* Header Section */}
        <div className="flex items-center justify-between mb-5 mt-2">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
              <Activity size={24} className="animate-pulse" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-800 leading-tight">反复研习魔法</h3>
              <p className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Spaced Repetition & Memory Study</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-2xl transition-all cursor-pointer border border-transparent hover:border-slate-200 shadow-sm"
          >
            <X size={18} />
          </button>
        </div>

        {/* Learning & Review Content */}
        {!isReviewingWords ? (
          <div className="flex-1 overflow-y-auto pr-1 space-y-6 custom-scrollbar mb-4 py-1">
            <div className="bg-gradient-to-br from-[#ecfdf5] to-[#f0fdf4] rounded-3xl p-5 border border-emerald-100/60 leading-relaxed text-slate-700 text-xs font-bold space-y-2">
              <p className="text-emerald-800 font-extrabold flex items-center gap-1.5 text-sm">
                <Sparkles size={16} className="text-amber-400 animate-pulse" />
                <span>艾宾浩斯忘却预警！</span>
              </p>
              <p className="opacity-90 leading-relaxed">
                研究显示，所学的奥术词族在24小时、3天、7天后具有极高的魔力衰退率。在此期间进行“反复研习”，由于抗力叠加，魔力凝聚将永不消退！
              </p>
            </div>

            {/* SECTION 1: LAST STUDY LEVEL */}
            <div className="space-y-3">
              <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">
                最近研习记录及今日推荐巩固
              </h4>
              {lastLearnedLevel ? (
                <div className="bg-white rounded-[32px] p-5 border-2 border-slate-100 shadow-sm flex items-center justify-between group hover:border-teal-300 hover:shadow-md transition-all">
                  <div className="flex items-center space-x-3.5 mr-2">
                    <div className="w-11 h-11 bg-teal-50 border border-teal-100 rounded-xl flex items-center justify-center text-xl select-none">
                      📖
                    </div>
                    <div className="text-left">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-800 text-sm">
                          第 {lastLearnedLevel.displayId} 关 · {lastLearnedLevel.name}
                        </span>
                        <span className="text-[9px] bg-teal-100 text-teal-700 font-extrabold px-2 py-0.5 rounded">上次学习</span>
                      </div>
                      <p className="text-[10px] font-bold text-slate-400 mt-1">
                        核心咒语 ({lastLearnedLevel.words.length} 词): {lastLearnedLevel.words.map(w => w.text).join(', ')}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => startReviewSession(lastLearnedLevel.id)}
                    className="bg-gradient-to-r from-teal-500 to-emerald-600 text-white font-black text-xs px-4 py-2.5 rounded-2xl shadow-md cursor-pointer hover:shadow-lg transition-all active:scale-95 shrink-0 flex items-center space-x-1"
                  >
                    <span>开启复习</span>
                    <ArrowRight size={12} />
                  </button>
                </div>
              ) : (
                <div className="bg-slate-50 rounded-[32px] p-6 text-center border border-dashed border-slate-200">
                  <p className="text-slate-400 font-bold text-xs">尚无最近通关记录，请先去“冒险森林”闯关吧！</p>
                </div>
              )}
            </div>

            {/* SECTION 2: EBBINGHAUS DUE REVIEWS */}
            <div className="space-y-3.5">
              <div className="flex items-center justify-between px-1">
                <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                  按记忆曲线已过期的拼读关卡 ({dueReviews.length})
                </h4>
                {dueReviews.length > 0 && (
                  <span className="text-[9px] bg-rose-50 text-rose-500 border border-rose-100 font-black px-2 py-0.5 rounded-full animate-pulse">
                    魔力衰退中
                  </span>
                )}
              </div>

              <div className="space-y-3">
                {dueReviews.map((level) => (
                  <div 
                    key={level.id}
                    className="bg-white rounded-[32px] p-5 border-2 border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between hover:border-indigo-200 transition-all gap-4"
                  >
                    <div className="flex-1 text-left min-w-0">
                      <div className="flex items-center space-x-2.5">
                        <span className="w-6 h-6 bg-indigo-50 border border-indigo-100 rounded-full flex items-center justify-center text-[10px] font-black text-indigo-600">
                          {level.displayId}
                        </span>
                        <span className="font-extrabold text-slate-800 text-xs sm:text-sm truncate">
                          第 {level.displayId} 关 · {level.name}
                        </span>
                      </div>
                      
                      {/* Magical Decay Bar Indicator */}
                      <div className="mt-3.5 space-y-1">
                        <div className="flex items-center justify-between text-[9px] font-extrabold text-slate-400">
                          <span>魔力留存能量</span>
                          <span className={`${level.concentration <= 30 ? 'text-rose-500 font-black' : 'text-slate-400'}`}>
                            {level.concentration}% 剩余
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 border border-slate-200/50 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${level.concentration}%` }}
                            className={`h-full rounded-full ${
                              level.concentration <= 30 
                                ? 'bg-gradient-to-r from-rose-400 to-red-500 shadow-[0_0_6px_rgba(239,68,68,0.4)]'
                                : 'bg-gradient-to-r from-indigo-400 to-teal-500'
                            }`}
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => startReviewSession(level.id)}
                      className="bg-white hover:bg-indigo-50 text-indigo-600 font-black text-xs px-4 py-3 rounded-2xl border-2 border-indigo-100 hover:border-indigo-300 transition-all cursor-pointer active:scale-95 shrink-0 text-center"
                    >
                      唤醒记忆 ⚡
                    </button>
                  </div>
                ))}

                {dueReviews.length === 0 && (
                  <div className="bg-slate-50 rounded-[32px] p-8 text-center border-2 border-dashed border-slate-200/80">
                    <div className="text-3xl mb-2 select-none">🛡️</div>
                    <h5 className="font-extrabold text-slate-700 text-xs mb-1">当前的魔力防护极其充沛！</h5>
                    <p className="text-[10.5px] font-bold text-slate-400 max-w-xs mx-auto">所有拼复巩固均已按约完成，您现在可以随心去魔法商店消费或通关新自然拼读了！</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* ACTIVE INTERACTIVE WORD STUDY PANEL */
          <div className="flex-1 flex flex-col justify-between py-2 overflow-y-auto scrollbar-none">
            <div className="text-center relative">
              {/* Back out inside review warning */}
              <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-2.5">
                <span className="text-[10px] bg-indigo-50 border border-indigo-100 text-indigo-600 font-black px-2.5 py-1 rounded-full">
                  复习进度: {wordReviewIndex + 1} / {currentReviewWords.length}
                </span>
                <button
                  onClick={() => setIsReviewingWords(false)}
                  className="text-[10px] text-slate-400 hover:text-slate-600 font-bold"
                >
                  退出研习
                </button>
              </div>

              {/* Displaying Word Core card */}
              <div className="bg-slate-50/50 rounded-[36px] p-6 border-2 border-slate-100 shadow-sm relative overflow-hidden flex flex-col items-center">
                {/* Visual of the reviewed card */}
                {currentReviewWords[wordReviewIndex]?.imageUrl ? (
                  <div className="relative mb-5 shrink-0">
                    <SafeImage
                      src={currentReviewWords[wordReviewIndex]?.imageUrl}
                      alt={currentReviewWords[wordReviewIndex]?.text}
                      className="w-36 h-36 object-contain cursor-pointer transform hover:scale-105 transition-transform"
                      onClick={() => handleWordSpeak(currentReviewWords[wordReviewIndex]?.text)}
                    />
                    <div className="absolute bottom-1 right-1 bg-white/90 border border-slate-200/60 p-2 rounded-full shadow-sm text-slate-400 hover:text-indigo-600 transition-colors pointer-events-none">
                      <Volume2 size={14} className="fill-slate-100" />
                    </div>
                  </div>
                ) : (
                  <div className="w-24 h-24 bg-teal-100 rounded-[24px] flex items-center justify-center text-3xl mb-4 select-none">🧙‍♂️</div>
                )}

                <h3 className="text-3xl font-black text-slate-700 tracking-tight uppercase select-none mb-1">
                  {currentReviewWords[wordReviewIndex]?.text}
                </h3>
                
                {/* Syllables layout helpful for phonetic awareness */}
                {currentReviewWords[wordReviewIndex]?.syllables && currentReviewWords[wordReviewIndex].syllables!.length > 0 && (
                  <div className="flex space-x-1.5 mb-3.5 select-none">
                    {currentReviewWords[wordReviewIndex].syllables!.map((syl, i) => (
                      <span key={i} className="text-[11px] font-black bg-indigo-50 border border-indigo-100 text-indigo-500 px-2 py-0.5 rounded">
                        {syl}
                      </span>
                    ))}
                  </div>
                )}
                
                <p className="text-sm font-black text-slate-400 tracking-wide select-none">
                  中文意: <span className="text-indigo-600 font-extrabold">{currentReviewWords[wordReviewIndex]?.translation}</span>
                </p>
                
                {/* Phonetics click helper */}
                <button
                  onClick={() => {
                    audio.unlockSpeech();
                    setActivePhonicsWord(currentReviewWords[wordReviewIndex]?.text);
                    setActivePhonicsWordImg(currentReviewWords[wordReviewIndex]?.imageUrl);
                  }}
                  className="mt-5 inline-flex items-center space-x-1 hover:space-x-1.5 transition-all text-[11px] font-black text-emerald-600 bg-white hover:bg-emerald-50 shadow-sm border border-emerald-200/50 px-4 py-2 rounded-full cursor-pointer"
                >
                  <span>🎹 进入字母琴拼写练习</span>
                  <ChevronRight size={12} />
                </button>
              </div>
            </div>

            {/* Bottom active block - speaker action & next */}
            <div className="mt-8 space-y-3 shrink-0">
              <div className="flex gap-3">
                <button
                  onClick={() => handleWordSpeak(currentReviewWords[wordReviewIndex]?.text)}
                  className="flex-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-black py-4 rounded-[22px] shadow-sm transition-all text-xs cursor-pointer text-center"
                >
                  🔊 聆听魔法纯音
                </button>
                <button
                  onClick={handleNextWordReview}
                  className="flex-1 bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-700 text-white font-black py-4 rounded-[22px] shadow-lg shadow-indigo-100 transition-all text-xs cursor-pointer text-center"
                >
                  {wordReviewIndex === currentReviewWords.length - 1 ? '🎉 完成此关卡复习' : '💪 复习下一个单词'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Closing Footnote info in footer */}
        {!isReviewingWords && (
          <div className="border-t border-slate-100 pt-4 flex justify-between items-center shrink-0">
            <span className="text-[10px] font-bold text-slate-400">复习关卡巩固艾宾浩斯，点亮奥术勋章 🌟</span>
            <button
              onClick={onClose}
              className="text-xs font-black text-indigo-500 hover:text-indigo-700"
            >
              我知道了
            </button>
          </div>
        )}
      </motion.div>

      {/* Floating Phonics spelling tool inside review modal */}
      {activePhonicsWord && (
        <PhonicsSpellingModal
          word={activePhonicsWord}
          imageUrl={activePhonicsWordImg}
          onClose={() => setActivePhonicsWord(null)}
        />
      )}
    </div>
  );
};

// Help helper icon component
const Volume2 = ({ size, className }: { size: number, className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="3" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
    <path d="M15.54 8.46a5 5 0 0 1 0 7.07M19.07 4.93a10 10 0 0 1 0 14.14"></path>
  </svg>
);
