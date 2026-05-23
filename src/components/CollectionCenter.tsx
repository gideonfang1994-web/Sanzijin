import React, { useState, useMemo } from 'react';
import { WordGroup, UserStats, WordItem, DifficultyLevel, WordCard } from '../types';
import { Trophy, Star, Award, Sparkles, BookOpen, Search, Eye, Filter, Info, X, Play, Volume2, BookMarked, Compass, Sparkle } from 'lucide-react';
import audio from '../utils/AudioUtils';
import { ALL_CARDS } from '../constants';
import { motion, AnimatePresence } from 'framer-motion';
import SafeImage from './SafeImage';
import PhonicsSpellingModal from './PhonicsSpellingModal';

interface Props {
  groups: WordGroup[];
  stats: UserStats;
  onClose: () => void;
}

const CollectionCenter: React.FC<Props> = ({ groups, stats, onClose }) => {
  const [activeTab, setActiveTab] = useState<'RHYME_FOREST' | 'WORD_DICTIONARY'>('RHYME_FOREST');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'PRIMARY' | 'INTERMEDIATE' | 'ADVANCED' | 'CUSTOM'>('PRIMARY');
  const [activePhonicsWord, setActivePhonicsWord] = useState<{ text: string; imageUrl: string } | null>(null);

  // Search & Filter state for Word Dictionary Tab
  const [searchQuery, setSearchQuery] = useState('');
  const [dictFilter, setDictFilter] = useState<'ALL' | 'MASTERED' | 'LEARNING'>('ALL');

  const masteredWordsCount = stats.masteredWords.length;

  // Retrieve unique words across standard cards and custom user uploads
  const allDictWords = useMemo(() => {
    const uniqueWords = new Map<string, WordItem>();
    
    // Add standard ones
    ALL_CARDS.flatMap(c => c.words).forEach(w => {
      uniqueWords.set(w.text.toLowerCase(), w);
    });
    
    // Add user uploaded custom groups
    groups.forEach(g => {
      if (g.id.startsWith('user-')) {
        g.words.forEach(w => {
          uniqueWords.set(w.text.toLowerCase(), w);
        });
      }
    });

    return Array.from(uniqueWords.values());
  }, [groups]);

  // Filtered list of words for the Word Dictionary search tab
  const filteredDictWords = useMemo(() => {
    return allDictWords.filter(w => {
      const matchesSearch = w.text.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           w.translation.includes(searchQuery);
      const mastery = stats.wordMastery[w.text] || 0;
      const matchesFilter = dictFilter === 'ALL' || 
                           (dictFilter === 'MASTERED' && mastery >= 5) || 
                           (dictFilter === 'LEARNING' && mastery > 0 && mastery < 5);
      return matchesSearch && matchesFilter;
    });
  }, [allDictWords, searchQuery, dictFilter, stats.wordMastery]);

  // Compute exact statistics for each difficulty stage (counting completed and totals)
  const levelStats = useMemo(() => {
    const getStatsForDiff = (diff: 'PRIMARY' | 'INTERMEDIATE' | 'ADVANCED' | 'CUSTOM') => {
      if (diff === 'CUSTOM') {
        const customGroups = groups.filter(g => g.id.startsWith('user-') || !ALL_CARDS.some(c => c.id === g.id));
        const total = customGroups.length;
        let mastered = 0;
        customGroups.forEach(g => {
          if (g.words.length > 0 && g.words.every(w => (stats.wordMastery[w.text] || 0) >= 5)) {
            mastered++;
          }
        });
        return { total, mastered };
      }
      const cards = ALL_CARDS.filter(c => (c.difficulty || 'PRIMARY') === diff);
      const total = cards.length;
      let mastered = 0;
      cards.forEach(c => {
        const allMastered = c.words.every(w => (stats.wordMastery[w.text] || 0) >= 5);
        if (allMastered) mastered++;
      });
      return { total, mastered };
    };

    return {
      PRIMARY: getStatsForDiff('PRIMARY'),
      INTERMEDIATE: getStatsForDiff('INTERMEDIATE'),
      ADVANCED: getStatsForDiff('ADVANCED'),
      CUSTOM: getStatsForDiff('CUSTOM')
    };
  }, [groups, stats.wordMastery]);

  // Sequentially group standard cards + user custom uploaded packages, keeping strict PDF textbook order
  const sequentialRhymingPackages = useMemo(() => {
    if (selectedDifficulty === 'CUSTOM') {
      // Return custom user uploaded packages
      const customGroups = groups.filter(g => g.id.startsWith('user-') || !ALL_CARDS.some(c => c.id === g.id));
      return customGroups.map((g, idx) => ({
        id: g.id,
        levelName: g.title || `自定义魔法 ${idx + 1}`,
        suffix: g.suffix || '自定义',
        words: g.words,
        rhyme: g.rhyme,
        difficulty: 'CUSTOM' as const,
        isCustom: true
      }));
    }

    // Filter standard ALL_CARDS to ensure matching difficulty
    const filteredCards = ALL_CARDS.filter(c => {
      const cardDiff = c.difficulty || 'PRIMARY';
      return cardDiff === selectedDifficulty;
    });

    // Explicitly sort cards to ensure absolute strict sequential order based on levelName numbers (e.g. "基础拼读 3-13", "基础拼读 4-1", etc.)
    const sortedCards = [...filteredCards].sort((a, b) => {
      const nameA = a.levelName || '';
      const nameB = b.levelName || '';

      // Match numbers like X-Y in "基础拼读 X-Y"
      const matchA = nameA.match(/(\d+)-(\d+)/);
      const matchB = nameB.match(/(\d+)-(\d+)/);

      if (matchA && matchB) {
        const majorA = parseInt(matchA[1], 10);
        const minorA = parseInt(matchA[2], 10);
        const majorB = parseInt(matchB[1], 10);
        const minorB = parseInt(matchB[2], 10);

        if (majorA !== majorB) {
          return majorA - majorB;
        }
        return minorA - minorB;
      }

      // Fallback
      if (matchA) return -1;
      if (matchB) return 1;

      return nameA.localeCompare(nameB);
    });

    return sortedCards;
  }, [groups, selectedDifficulty]);

  // Highlighting helper for "三字经" so English words look like gorgeous tags/pills
  const formatRhymeText = (text: string) => {
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
      parts.push(
        <motion.span 
          key={`word-${match.index}`}
          whileHover={{ scale: 1.05 }}
          className="inline-flex items-center mx-1 bg-gradient-to-r from-rose-50 to-pink-100 border border-pink-200 px-2.5 py-0.5 rounded-full font-black text-rose-600 shadow-sm cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            // Trigger speaking
            audio.speak(englishWord);
          }}
        >
          {englishWord}
          {translation && (
            <span className="text-[11px] text-pink-500/80 font-bold ml-1">{translation}</span>
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

  // Helper render function for the beautiful magic tier selection cards
  const renderMagicCategoryCard = (
    key: 'PRIMARY' | 'INTERMEDIATE' | 'ADVANCED' | 'CUSTOM',
    label: string,
    subLabel: string,
    icon: string,
    gradient: string,
    themeColor: string,
    glowStyle: string,
    badgeText: string
  ) => {
    const isSelected = selectedDifficulty === key;
    const statsObj = levelStats[key];
    const percentage = statsObj.total > 0 ? Math.round((statsObj.mastered / statsObj.total) * 100) : 0;

    return (
      <motion.button
        key={key}
        whileHover={{ y: -6, scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => {
          setSelectedDifficulty(key);
          if (audio.playClick) {
            audio.playClick();
          }
        }}
        className={`relative overflow-hidden p-6 rounded-[34px] text-left transition-all duration-300 border-[3px] flex flex-col justify-between h-44 group select-none ${
          isSelected 
            ? `bg-gradient-to-br ${gradient} border-transparent text-white shadow-xl ${glowStyle}`
            : 'bg-white border-slate-100 text-slate-800 hover:border-slate-200/80 shadow-sm hover:shadow-md'
        }`}
      >
        {/* Holographic magic sigil in background of active item */}
        {isSelected && (
          <motion.div
            animate={{ rotate: [360, 0] }}
            transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
            className="absolute -right-6 -bottom-6 w-32 h-32 opacity-[0.15] pointer-events-none border-4 border-dashed rounded-full flex items-center justify-center"
          >
            <div className="w-16 h-16 border-2 border-dashed rounded-full" />
          </motion.div>
        )}

        {/* Floating dust particles overlay */}
        {isSelected && (
          <div className="absolute inset-0 z-0 opacity-40 mix-blend-overlay pointer-events-none">
            <div className="absolute top-1/4 left-1/3 w-1.5 h-1.5 bg-white rounded-full animate-ping duration-1000" />
            <div className="absolute bottom-1/3 right-1/4 w-1 h-1 bg-white rounded-full animate-pulse duration-2000" />
          </div>
        )}

        {/* Floating Sparkle indicator for layout */}
        <div className={`absolute top-4 right-4 transition-transform duration-500 ${isSelected ? 'text-amber-300 rotate-45 scale-125' : 'text-slate-300 group-hover:rotate-180'}`}>
          <Sparkle size={15} />
        </div>

        {/* Header Block of Selector Card */}
        <div className="relative z-10 flex items-start space-x-3.5">
          <span className={`text-3xl flex items-center justify-center p-3.5 rounded-2xl transition-transform duration-500 group-hover:scale-110 ${
            isSelected ? 'bg-white/15 backdrop-blur-md text-white border border-white/20' : 'bg-slate-50 border border-slate-100 shadow-inner'
          }`}>
            {icon}
          </span>
          <div>
            <span className={`text-[9px] font-black tracking-widest block uppercase ${isSelected ? 'text-white/60' : 'text-slate-400'}`}>
              {badgeText}
            </span>
            <h3 className="font-extrabold text-lg leading-tight mt-0.5 tracking-tight flex items-center gap-1">
              <span>{label}</span>
            </h3>
          </div>
        </div>

        {/* Progression tracker metrics */}
        <div className="relative z-10 mt-4 space-y-2">
          <p className={`text-[11px] font-bold leading-relaxed line-clamp-2 ${isSelected ? 'text-white/80' : 'text-slate-500'}`}>
            {subLabel}
          </p>

          <div className="space-y-1 pt-1">
            <div className="flex items-center justify-between">
              <span className={`text-[9px] font-black tracking-wider ${isSelected ? 'text-white/60' : 'text-slate-400'} uppercase`}>
                已点亮 {statsObj.mastered} / {statsObj.total}
              </span>
              {statsObj.total > 0 && (
                <span className={`text-[11px] font-bold ${isSelected ? 'text-amber-200 animate-pulse' : 'text-indigo-600'}`}>
                  {percentage}%
                </span>
              )}
            </div>

            {/* Progress road of magical crystals */}
            <div className={`w-full h-1.5 rounded-full overflow-hidden p-[1px] ${
              isSelected ? 'bg-white/25' : 'bg-slate-100 border border-slate-200/50'
            }`}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${statsObj.total > 0 ? (statsObj.mastered / statsObj.total) * 100 : 0}%` }}
                className={`h-full rounded-full ${
                  isSelected ? 'bg-gradient-to-r from-amber-300 to-yellow-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]' : `bg-indigo-500`
                }`}
              />
            </div>
          </div>
        </div>
      </motion.button>
    );
  };

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
                <h2 className="text-3xl font-black tracking-tight flex items-center space-x-2">
                  <span>单词森林</span>
                  <Sparkles size={24} className="text-amber-300 animate-pulse" />
                </h2>
                <p className="text-white/70 font-bold text-[10px] uppercase tracking-widest">Magic Word Forest & Rhymes</p>
              </div>
            </div>
            <button 
              onClick={handleShare}
              className="bg-amber-400 hover:bg-amber-500 text-amber-900 px-4 py-2.5 rounded-2xl font-black text-xs shadow-lg transition-all active:scale-95 flex items-center space-x-2"
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
              <p className="text-[10px] font-bold text-white/50 uppercase mb-1">词林收集总进度</p>
              <div className="flex items-end space-x-2">
                <h3 className="text-2xl font-black text-white">{masteredWordsCount}</h3>
                <span className="text-white/50 font-bold text-xs mb-1">/ {allDictWords.length} 已掌握</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Tab Toggle: Rhymes vs Dictionary */}
      <div className="flex bg-slate-100 p-1.5 rounded-[28px] border border-slate-200 shadow-inner">
        <button
          onClick={() => setActiveTab('RHYME_FOREST')}
          className={`flex-1 flex items-center justify-center space-x-2 py-3.5 rounded-[22px] font-black tracking-wide text-sm transition-all ${
            activeTab === 'RHYME_FOREST'
              ? 'bg-white text-indigo-600 shadow-md scale-[1.01]'
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <BookMarked size={16} />
          <span>拼读神奇三字经</span>
        </button>
        <button
          onClick={() => setActiveTab('WORD_DICTIONARY')}
          className={`flex-1 flex items-center justify-center space-x-2 py-3.5 rounded-[22px] font-black tracking-wide text-sm transition-all ${
            activeTab === 'WORD_DICTIONARY'
              ? 'bg-white text-rose-500 shadow-md scale-[1.01]'
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Search size={16} />
          <span>收集魔法单字词典</span>
        </button>
      </div>

      {/* TAB 1: RHYME FOREST */}
      {activeTab === 'RHYME_FOREST' && (
        <div className="space-y-8">
          {/* Level Dashboard Board header */}
          <div className="flex items-center space-x-2 px-1">
            <Compass className="w-5 h-5 text-indigo-500 animate-spin duration-3000" />
            <h4 className="font-extrabold text-slate-700 text-sm">选择自然拼读能量法阵 (点击开启对应等级段)：</h4>
          </div>

          {/* Upgraded Magical Category Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 px-1">
            {renderMagicCategoryCard(
              'PRIMARY',
              '生机绿野',
              '包含 a/e/i/o/u 基础发音及短元音拼读，照亮魔力新手的成长足迹。',
              '🌱',
              'from-emerald-400 via-emerald-600 to-teal-800',
              'text-emerald-500',
              'shadow-[0_20px_40px_-5px_rgba(16,185,129,0.35)]',
              'LEVEL 1 · 初级基础'
            )}
            {renderMagicCategoryCard(
              'INTERMEDIATE',
              '风暴密林',
              '进阶元音、辅音混合发音组合，在三字经故事中乘风晋级。',
              '🧭',
              'from-indigo-500 via-indigo-600 to-blue-800',
              'text-indigo-500',
              'shadow-[0_20px_40px_-5px_rgba(79,70,229,0.35)]',
              'LEVEL 2 · 中级拼读'
            )}
            {renderMagicCategoryCard(
              'ADVANCED',
              '星辉神殿',
              '特殊字母发音拼写，双重语调技巧，练就出类拔萃的魔法直觉。',
              '🧙‍♂️',
              'from-amber-400 via-orange-500 to-rose-700',
              'text-amber-500',
              'shadow-[0_20px_40px_-5px_rgba(245,158,11,0.35)]',
              'LEVEL 3 · 高级拼读'
            )}
            {renderMagicCategoryCard(
              'CUSTOM',
              '魔力法阵',
              '您所上传、保存的一切魔法信件及编排创作的专属三字经秘典。',
              '✨',
              'from-purple-500 via-fuchsia-600 to-pink-600',
              'text-purple-500',
              'shadow-[0_20px_40px_-5px_rgba(168,85,247,0.35)]',
              'SPELLS · 自定义创制'
            )}
          </div>

          {/* Rhyming Cards Sequential Presentation */}
          <div className="space-y-6">
            <AnimatePresence mode="popLayout">
              {sequentialRhymingPackages.map((pkg, index) => {
                return (
                  <motion.div
                    key={pkg.id || `pkg-${index}`}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -30 }}
                    transition={{ delay: Math.min(index * 0.05, 0.4), type: "spring", stiffness: 100 }}
                    className="bg-white border-[3px] border-slate-100 rounded-[38px] p-6 shadow-sm hover:shadow-md transition-all relative overflow-hidden group"
                  >
                    {/* Background faint glow */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-rose-50 to-indigo-50/20 rounded-bl-[100px] transition-all group-hover:scale-110 pointer-events-none" />
                    
                    {/* Package Header */}
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                      <div className="flex items-center space-x-2">
                        <span className="bg-indigo-50 text-indigo-600 border border-indigo-100 font-extrabold text-[11px] px-3 py-1 rounded-full uppercase tracking-wider">
                          序号 {index + 1}
                        </span>
                        <h4 className="font-extrabold text-slate-800 text-base">
                          {pkg.levelName || `魔法拼读课 ${index + 1}`}
                        </h4>
                      </div>
                      
                      {pkg.suffix && (
                        <span className="bg-rose-50 text-rose-500 border border-rose-100 font-black text-xs px-3 py-1 rounded-xl">
                          “{pkg.suffix}” 词族拼读
                        </span>
                      )}
                    </div>

                    {/* Highly Polished Rhyming Formula Box (三字经) */}
                    <div className="bg-slate-50/50 rounded-2xl p-5 mb-5 border border-slate-100 relative leading-loose">
                      <p className="text-slate-700 font-black text-lg">
                        {formatRhymeText(pkg.rhyme)}
                      </p>
                      <button
                        onClick={() => audio.speak(pkg.rhyme)}
                        className="absolute right-3 bottom-3 p-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-full transition-all active:scale-95 shadow-sm"
                        title="聆听整句三字经节奏发音"
                      >
                        <Volume2 size={16} />
                      </button>
                    </div>

                    {/* Word row with cute images */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {pkg.words.map((word) => {
                        const mastery = stats.wordMastery[word.text] || 0;
                        const isMastered = mastery >= 5;
                        
                        return (
                          <motion.div
                            key={word.text}
                            whileHover={{ y: -4, scale: 1.02 }}
                            onClick={() => setActivePhonicsWord({ text: word.text, imageUrl: word.imageUrl })}
                            className="bg-slate-50/60 rounded-[28px] p-4 text-center border-2 border-slate-100 hover:border-indigo-100 cursor-pointer transition-all flex flex-col items-center justify-center relative"
                          >
                            <div className="relative mb-2">
                              <SafeImage 
                                src={word.imageUrl} 
                                alt={word.text} 
                                className="w-16 h-16 object-contain"
                                fallbackText={word.text}
                                width="64"
                                height="64"
                              />
                              {isMastered && (
                                <div className="absolute -top-1 -right-1 bg-amber-400 text-white p-1 rounded-full shadow-sm">
                                  <Trophy size={10} />
                                </div>
                              )}
                            </div>
                            
                            <h5 className="font-black text-slate-800 text-lg uppercase tracking-tight flex items-center justify-center space-x-1">
                              <span>{word.text}</span>
                              <Play size={12} className="text-indigo-400 fill-indigo-400 inline" />
                            </h5>
                            
                            <span className="text-xs font-bold text-slate-400 mt-0.5">
                              {word.translation}
                            </span>
                            
                            {/* Phonics click-to-learn overlay indicator */}
                            <div className="text-[9px] font-black text-slate-300 mt-2 hover:text-indigo-500 transition-colors bg-white/80 border border-slate-100 rounded-full px-2 py-0.5 shadow-sm">
                              点击开启自然拼读 🚀
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {sequentialRhymingPackages.length === 0 && (
              <div className="bg-slate-50 rounded-[40px] p-12 text-center border-2 border-dashed border-slate-200">
                <Compass className="w-12 h-12 mx-auto text-slate-300 mb-2" />
                <p className="text-slate-400 font-bold">这一章节没有任何已上传或保存的魔法三字经喔</p>
                {selectedDifficulty === 'CUSTOM' && (
                  <p className="text-slate-300 font-bold text-xs mt-1">快去“上传/魔法宝箱”板块编排属于你的魔力口诀吧！</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: DETAILED WORD DICTIONARY */}
      {activeTab === 'WORD_DICTIONARY' && (
        <div className="space-y-6">
          {/* Search & Dict Filter Inputs */}
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input 
                type="text"
                placeholder="搜索拼读单词..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border-2 border-slate-100 rounded-[24px] py-4 pl-14 pr-6 font-bold text-slate-700 focus:border-indigo-500 outline-none transition-all shadow-sm"
              />
            </div>
            
            <div className="flex space-x-2 overflow-x-auto pb-2 no-scrollbar">
              {[
                { id: 'ALL', label: '全部单字', icon: <BookOpen size={14} /> },
                { id: 'MASTERED', label: '已精通 (≥5次正确)', icon: <Trophy size={14} /> },
                { id: 'LEARNING', label: '修行中', icon: <Sparkles size={14} /> },
              ].map((btn) => (
                <button
                  key={btn.id}
                  onClick={() => setDictFilter(btn.id as any)}
                  className={`flex items-center space-x-2 px-5 py-2.5 rounded-2xl font-black text-xs whitespace-nowrap transition-all ${
                    dictFilter === btn.id 
                    ? 'bg-rose-500 text-white shadow-lg shadow-rose-200' 
                    : 'bg-white text-slate-400 border-2 border-slate-100 hover:border-rose-200'
                  }`}
                >
                  {btn.icon}
                  <span>{btn.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Grid Layout of Dict Words */}
          <div className="grid grid-cols-3 gap-4">
            {filteredDictWords.map((word) => {
              const mastery = stats.wordMastery[word.text] || 0;
              const isMastered = mastery >= 5;
              const isLearning = mastery > 0;
              
              return (
                <motion.button
                  key={word.text}
                  whileHover={{ y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActivePhonicsWord({ text: word.text, imageUrl: word.imageUrl })}
                  className={`relative bg-white rounded-[32px] p-4 border-2 transition-all flex flex-col items-center text-center ${
                    isMastered ? 'border-amber-200 shadow-md' : isLearning ? 'border-rose-100' : 'border-slate-50 opacity-60'
                  }`}
                >
                  <div className="relative mb-2">
                    <SafeImage 
                      src={word.imageUrl} 
                      alt={word.text} 
                      className={`w-14 h-14 object-contain ${!isLearning && 'grayscale'}`}
                      fallbackText={word.text}
                      width="56"
                      height="56"
                    />
                    {isMastered && (
                      <div className="absolute -top-2 -right-2 bg-amber-400 text-white p-1 rounded-full shadow-sm">
                        <Trophy size={10} />
                      </div>
                    )}
                  </div>
                  <span className="text-sm font-black text-slate-700 truncate w-full tracking-tight">{word.text}</span>
                  
                  {/* Progress Bar of Word Mastery */}
                  <div className="w-full h-1 bg-slate-100 rounded-full mt-2 overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-1000 ${isMastered ? 'bg-amber-400' : 'bg-rose-400'}`}
                      style={{ width: `${Math.min(100, (mastery / 5) * 100)}%` }}
                    />
                  </div>
                </motion.button>
              );
            })}
          </div>

          {filteredDictWords.length === 0 && (
            <div className="bg-slate-50 rounded-[40px] p-12 text-center border-2 border-dashed border-slate-200">
              <p className="text-slate-400 font-bold">没有匹配词典里的任何魔法文字喔</p>
            </div>
          )}
        </div>
      )}

      {/* Back button */}
      <button 
        onClick={onClose}
        className="w-full py-5 bg-slate-100 text-slate-500 hover:text-slate-700 rounded-[32px] font-black text-sm uppercase tracking-widest hover:bg-slate-200 transition-all shadow-sm"
      >
        返回主页
      </button>

      {/* Magical Phonics Spelling Modal */}
      {activePhonicsWord && (
        <PhonicsSpellingModal
          word={activePhonicsWord.text}
          imageUrl={activePhonicsWord.imageUrl}
          onClose={() => setActivePhonicsWord(null)}
        />
      )}
    </div>
  );
};

export default CollectionCenter;
