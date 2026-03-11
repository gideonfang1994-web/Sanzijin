
import React, { useState, useEffect, useMemo } from 'react';
import { WordGroup, UserStats, WordItem } from '../types';
import { Trophy, Star, Award, Medal, Sparkles, BookOpen, Search, Filter, Info, X } from 'lucide-react';
import audio from '../utils/AudioUtils';
import { ALL_CARDS } from '../constants';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  groups: WordGroup[];
  stats: UserStats;
  onClose: () => void;
}

const CollectionCenter: React.FC<Props> = ({ groups, stats, onClose }) => {
  const [selectedWord, setSelectedWord] = useState<WordItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'MASTERED' | 'LEARNING'>('ALL');
  
  const masteredWordsCount = stats.masteredWords.length;

  const allWords = useMemo(() => {
    const uniqueWords = new Map<string, WordItem>();
    [...groups.flatMap(g => g.words), ...ALL_CARDS.flatMap(c => c.words)].forEach(w => {
      uniqueWords.set(w.text, w);
    });
    return Array.from(uniqueWords.values());
  }, [groups]);

  const filteredWords = useMemo(() => {
    return allWords.filter(w => {
      const matchesSearch = w.text.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           w.translation.includes(searchQuery);
      const mastery = stats.wordMastery[w.text] || 0;
      const matchesFilter = filter === 'ALL' || 
                           (filter === 'MASTERED' && mastery >= 5) || 
                           (filter === 'LEARNING' && mastery > 0 && mastery < 5);
      return matchesSearch && matchesFilter;
    });
  }, [allWords, searchQuery, filter, stats.wordMastery]);

  const handleShare = () => {
    const shareText = `我在魔法单词岛已经学习了 ${stats.streak} 天，掌握了 ${masteredWordsCount} 个魔法单词！快来和我一起探险吧！`;
    alert(`分享成功！\n\n内容：${shareText}\n\n获得奖励：200 经验 & 50 星币！`);
    audio.playCheer();
  };

  const titles = [
    { threshold: 0, name: '初级魔法徒', icon: '🌱', color: 'text-emerald-500' },
    { threshold: 10, name: '词汇探险家', icon: '🧭', color: 'text-sky-500' },
    { threshold: 30, name: '大魔法师', icon: '🧙‍♂️', color: 'text-indigo-500' },
    { threshold: 60, name: '知识守护者', icon: '🛡️', color: 'text-rose-500' },
    { threshold: 100, name: '词海之王', icon: '👑', color: 'text-amber-500' },
  ];

  const currentTitle = [...titles].reverse().find(t => masteredWordsCount >= t.threshold) || titles[0];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-10 duration-700 space-y-6 pb-24">
      {/* Header Card */}
      <div className="bg-gradient-to-br from-indigo-600 via-violet-700 to-purple-800 rounded-[48px] p-8 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-400/20 rounded-full -ml-24 -mb-24 blur-2xl"></div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center text-4xl shadow-inner border border-white/30">
                {currentTitle.icon}
              </div>
              <div>
                <h2 className="text-3xl font-black tracking-tight">魔法图鉴</h2>
                <p className="text-white/70 font-bold text-[10px] uppercase tracking-widest">Magic Collection Gallery</p>
              </div>
            </div>
            <button 
              onClick={handleShare}
              className="bg-amber-400 hover:bg-amber-500 text-amber-900 px-4 py-2 rounded-2xl font-black text-xs shadow-lg transition-all active:scale-95 flex items-center space-x-2"
            >
              <Sparkles size={14} />
              <span>分享成就</span>
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-black/20 backdrop-blur-sm rounded-3xl p-4 border border-white/10">
              <p className="text-[10px] font-bold text-white/50 uppercase mb-1">当前称号</p>
              <h3 className="text-lg font-black text-amber-300 flex items-center space-x-2">
                <span>{currentTitle.name}</span>
                <Award size={16} />
              </h3>
            </div>
            <div className="bg-black/20 backdrop-blur-sm rounded-3xl p-4 border border-white/10">
              <p className="text-[10px] font-bold text-white/50 uppercase mb-1">掌握进度</p>
              <div className="flex items-end space-x-2">
                <h3 className="text-2xl font-black text-white">{masteredWordsCount}</h3>
                <span className="text-white/50 font-bold text-xs mb-1">/ {allWords.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text"
            placeholder="搜索你掌握的魔法..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border-2 border-slate-100 rounded-[24px] py-4 pl-14 pr-6 font-bold text-slate-700 focus:border-indigo-500 outline-none transition-all shadow-sm"
          />
        </div>
        
        <div className="flex space-x-2 overflow-x-auto pb-2 no-scrollbar">
          {[
            { id: 'ALL', label: '全部魔法', icon: <BookOpen size={14} /> },
            { id: 'MASTERED', label: '已精通', icon: <Trophy size={14} /> },
            { id: 'LEARNING', label: '修行中', icon: <Sparkles size={14} /> },
          ].map((btn) => (
            <button
              key={btn.id}
              onClick={() => setFilter(btn.id as any)}
              className={`flex items-center space-x-2 px-5 py-2.5 rounded-2xl font-black text-xs whitespace-nowrap transition-all ${
                filter === btn.id 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' 
                : 'bg-white text-slate-400 border-2 border-slate-100 hover:border-indigo-200'
              }`}
            >
              {btn.icon}
              <span>{btn.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Word Grid */}
      <div className="grid grid-cols-3 gap-4">
        {filteredWords.map((word) => {
          const mastery = stats.wordMastery[word.text] || 0;
          const isMastered = mastery >= 5;
          const isLearning = mastery > 0;
          
          return (
            <motion.button
              key={word.text}
              whileHover={{ y: -5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedWord(word)}
              className={`relative bg-white rounded-[32px] p-4 border-2 transition-all flex flex-col items-center text-center ${
                isMastered ? 'border-amber-200 shadow-md' : isLearning ? 'border-sky-100' : 'border-slate-50 opacity-60'
              }`}
            >
              <div className="relative mb-2">
                <img 
                  src={word.imageUrl} 
                  alt={word.text} 
                  className={`w-14 h-14 object-contain ${!isLearning && 'grayscale'}`}
                  referrerPolicy="no-referrer"
                />
                {isMastered && (
                  <div className="absolute -top-2 -right-2 bg-amber-400 text-white p-1 rounded-full shadow-sm">
                    <Trophy size={10} />
                  </div>
                )}
              </div>
              <span className="text-[10px] font-black text-slate-700 truncate w-full">{word.text}</span>
              
              {/* Mini Progress Bar */}
              <div className="w-full h-1 bg-slate-100 rounded-full mt-2 overflow-hidden">
                <div 
                  className={`h-full transition-all duration-1000 ${isMastered ? 'bg-amber-400' : 'bg-sky-400'}`}
                  style={{ width: `${Math.min(100, (mastery / 5) * 100)}%` }}
                />
              </div>
            </motion.button>
          );
        })}
      </div>

      {filteredWords.length === 0 && (
        <div className="bg-slate-50 rounded-[40px] p-12 text-center border-2 border-dashed border-slate-200">
          <p className="text-slate-400 font-bold">没有找到匹配的魔法哦</p>
        </div>
      )}

      {/* Word Detail Modal */}
      <AnimatePresence>
        {selectedWord && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedWord(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white w-full max-w-sm rounded-[48px] overflow-hidden shadow-2xl border-4 border-white"
            >
              <div className="bg-gradient-to-br from-indigo-500 to-violet-600 p-8 text-center relative">
                <button 
                  onClick={() => setSelectedWord(null)}
                  className="absolute top-6 right-6 p-2 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors"
                >
                  <X size={20} />
                </button>
                <img 
                  src={selectedWord.imageUrl} 
                  alt={selectedWord.text} 
                  className="w-32 h-32 object-contain mx-auto drop-shadow-2xl mb-4"
                  referrerPolicy="no-referrer"
                />
                <h3 className="text-3xl font-black text-white tracking-tight">{selectedWord.text}</h3>
                <p className="text-white/80 font-bold text-lg">{selectedWord.translation}</p>
              </div>
              
              <div className="p-8 space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between items-end">
                    <span className="text-xs font-black text-slate-400 uppercase">掌握程度</span>
                    <span className="text-lg font-black text-indigo-600">
                      {Math.min(100, Math.floor(((stats.wordMastery[selectedWord.text] || 0) / 5) * 100))}%
                    </span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, ((stats.wordMastery[selectedWord.text] || 0) / 5) * 100)}%` }}
                      className="h-full bg-indigo-500 rounded-full"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 rounded-3xl p-4 border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">正确次数</p>
                    <p className="text-xl font-black text-slate-800">{stats.wordMastery[selectedWord.text] || 0}</p>
                  </div>
                  <div className="bg-slate-50 rounded-3xl p-4 border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">魔法等级</p>
                    <p className="text-xl font-black text-slate-800">
                      {(stats.wordMastery[selectedWord.text] || 0) >= 5 ? '精通' : '修行'}
                    </p>
                  </div>
                </div>
                
                <button 
                  onClick={() => {
                    audio.speak(selectedWord.text);
                  }}
                  className="w-full puffy-button bg-indigo-500 text-white py-4 rounded-3xl font-black flex items-center justify-center space-x-2"
                >
                  <Info size={18} />
                  <span>聆听魔法发音</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <button 
        onClick={onClose}
        className="w-full py-5 bg-slate-100 text-slate-500 rounded-[32px] font-black text-sm uppercase tracking-widest hover:bg-slate-200 transition-all"
      >
        返回主页
      </button>
    </div>
  );
};

export default CollectionCenter;
