
import React from 'react';
import { WordGroup, UserStats, WordItem } from '../types';
import { Trophy, Star, Award, Medal, Sparkles, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import constants from '../constants';

interface Props {
  groups: WordGroup[];
  stats: UserStats;
  onClose: () => void;
}

const CollectionCenter: React.FC<Props> = ({ groups, stats, onClose }) => {
  const [forestWords, setForestWords] = React.useState<WordItem[]>([]);
  
  React.useEffect(() => {
    const savedProgress = localStorage.getItem('adventure_forest_progress');
    if (savedProgress) {
      const progress = JSON.parse(savedProgress);
      // Extract all words from completed levels
      const learned = constants.ALL_CARDS.filter(level => progress[level.id]?.completed).flatMap(level => level.words);
      setForestWords(learned);
    }
  }, []);

  const learnedGroups = groups.filter(g => g.learned);
  const totalWords = stats.totalWordsLearned || (learnedGroups.length * 3 + forestWords.length);

  const titles = [
    { threshold: 0, name: '初级魔法徒', icon: '🌱', color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { threshold: 10, name: '词汇探险家', icon: '🧭', color: 'text-sky-500', bg: 'bg-sky-50' },
    { threshold: 30, name: '大魔法师', icon: '🧙‍♂️', color: 'text-indigo-500', bg: 'bg-indigo-50' },
    { threshold: 60, name: '知识守护者', icon: '🛡️', color: 'text-rose-500', bg: 'bg-rose-50' },
    { threshold: 100, name: '词海之王', icon: '👑', color: 'text-amber-500', bg: 'bg-amber-50' },
    { threshold: 200, name: '魔法主宰', icon: '🌌', color: 'text-violet-500', bg: 'bg-violet-50' },
  ];

  const currentTitleIdx = [...titles].reverse().findIndex(t => totalWords >= t.threshold);
  const currentTitle = currentTitleIdx !== -1 ? [...titles].reverse()[currentTitleIdx] : titles[0];
  const nextTitle = titles[titles.indexOf(currentTitle) + 1];
  const progressToNext = nextTitle ? (totalWords / nextTitle.threshold) * 100 : 100;

  const rankings = [
    { name: '魔法小虎 (你)', score: totalWords, avatar: '🐯', isMe: true },
    { name: '智慧猫头鹰', score: 185, avatar: '🦉' },
    { name: '勤奋小兔', score: 142, avatar: '🐰' },
    { name: '勇敢狮子', score: 98, avatar: '🦁' },
    { name: '调皮猴子', score: 45, avatar: '🐒' },
  ].sort((a, b) => b.score - a.score);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-10 duration-700 space-y-8 pb-24">
      {/* Header Card with Upgrade System */}
      <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-[48px] p-8 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20 blur-2xl"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center text-4xl shadow-inner border border-white/20">
                {currentTitle.icon}
              </div>
              <div>
                <h2 className="text-3xl font-black tracking-tight">图鉴中心</h2>
                <p className="text-white/70 font-bold text-[10px] uppercase tracking-widest">Collection Gallery</p>
              </div>
            </div>
            <div className="bg-amber-400 text-amber-900 px-4 py-2 rounded-2xl font-black text-xs shadow-lg border-2 border-amber-200">
              LV.{stats.level}
            </div>
          </div>
          
          <div className="bg-black/20 backdrop-blur-sm rounded-[32px] p-6 border border-white/10">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-[10px] font-bold text-white/50 uppercase mb-1">当前称号</p>
                <h3 className="text-2xl font-black text-amber-300 tracking-tight">{currentTitle.name}</h3>
              </div>
              <Award className="text-amber-300 animate-pulse" size={40} />
            </div>
            
            {nextTitle && (
              <div className="space-y-2">
                <div className="flex justify-between items-end">
                  <span className="text-[10px] font-bold text-white/40 uppercase">升级进度</span>
                  <span className="text-xs font-black text-white/80">{totalWords} / {nextTitle.threshold} 词</span>
                </div>
                <div className="h-3 bg-white/10 rounded-full overflow-hidden border border-white/5 shadow-inner">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progressToNext}%` }}
                    className="h-full bg-gradient-to-r from-amber-300 to-amber-500 rounded-full"
                  />
                </div>
                <p className="text-[9px] text-white/40 font-bold text-center italic">距离 {nextTitle.name} 还差 {nextTitle.threshold - totalWords} 个单词</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-[32px] p-6 border-2 border-indigo-50 shadow-sm flex flex-col items-center text-center group hover:border-indigo-200 transition-all">
          <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-500 mb-3 group-hover:scale-110 transition-transform">
            <Star fill="currentColor" size={24} />
          </div>
          <span className="text-3xl font-black text-slate-800 tabular-nums">{learnedGroups.length + Math.floor(forestWords.length / 3)}</span>
          <span className="text-[10px] font-bold text-slate-400 uppercase mt-1">已解锁章节</span>
        </div>
        <div className="bg-white rounded-[32px] p-6 border-2 border-rose-50 shadow-sm flex flex-col items-center text-center group hover:border-rose-200 transition-all">
          <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500 mb-3 group-hover:scale-110 transition-transform">
            <Medal fill="currentColor" size={24} />
          </div>
          <span className="text-3xl font-black text-slate-800 tabular-nums">{totalWords}</span>
          <span className="text-[10px] font-bold text-slate-400 uppercase mt-1">掌握词汇量</span>
        </div>
      </div>

      {/* Ranking System */}
      <div className="bg-white rounded-[40px] p-6 border-2 border-slate-50 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-black text-slate-800 flex items-center">
            <Trophy className="text-amber-400 mr-2" size={24} /> 魔法排行榜
          </h3>
          <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Global Rank</span>
        </div>
        <div className="space-y-3">
          {rankings.map((rank, idx) => (
            <div key={rank.name} className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${rank.isMe ? 'bg-indigo-50 border-indigo-200 scale-105 shadow-md' : 'bg-slate-50 border-transparent'}`}>
              <div className="flex items-center space-x-3">
                <span className={`w-6 text-center font-black ${idx === 0 ? 'text-amber-500' : idx === 1 ? 'text-slate-400' : idx === 2 ? 'text-amber-700' : 'text-slate-300'}`}>
                  {idx + 1}
                </span>
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-xl shadow-sm">
                  {rank.avatar}
                </div>
                <span className={`font-black text-sm ${rank.isMe ? 'text-indigo-700' : 'text-slate-600'}`}>{rank.name}</span>
              </div>
              <span className="font-black text-slate-800 tabular-nums">{rank.score} <span className="text-[8px] opacity-50 uppercase">Words</span></span>
            </div>
          ))}
        </div>
      </div>

      {/* Gallery List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-xl font-black text-slate-800">成就图鉴</h3>
          <Sparkles className="text-amber-400" size={20} />
        </div>
        
        <div className="grid grid-cols-1 gap-4">
          {/* Forest Words Gallery */}
          {forestWords.length > 0 && (
            <div className="bg-emerald-50 rounded-[32px] p-6 border-2 border-emerald-100">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-black text-emerald-800">森林冒险词汇</h4>
                <span className="bg-emerald-200 text-emerald-800 px-2 py-0.5 rounded-full text-[10px] font-black">{forestWords.length} 词</span>
              </div>
              <div className="flex flex-wrap gap-3">
                {forestWords.slice(0, 12).map((word, i) => (
                  <div key={i} className="w-12 h-12 bg-white rounded-xl p-1 shadow-sm border border-emerald-100 group relative">
                    <img src={word.imageUrl} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                    <div className="absolute inset-0 bg-emerald-600/90 text-white text-[8px] font-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-xl p-1 text-center">
                      {word.text}
                    </div>
                  </div>
                ))}
                {forestWords.length > 12 && (
                  <div className="w-12 h-12 bg-white/50 rounded-xl flex items-center justify-center text-emerald-600 font-black text-xs border border-emerald-100">
                    +{forestWords.length - 12}
                  </div>
                )}
              </div>
            </div>
          )}

          {learnedGroups.map(group => (
            <div key={group.id} className="bg-white rounded-[32px] p-5 border-2 border-slate-50 shadow-sm flex items-center justify-between group hover:border-indigo-100 transition-all">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 bg-slate-50 rounded-2xl overflow-hidden flex items-center justify-center border border-slate-100">
                  <img 
                    src={group.words[0]?.imageUrl} 
                    alt={group.title} 
                    className="w-10 h-10 object-contain"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div>
                  <h4 className="font-black text-slate-800">{group.title}</h4>
                  <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-tighter">已完美收集</p>
                </div>
              </div>
              <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-indigo-50 group-hover:text-indigo-500 transition-all">
                <ChevronRight size={20} />
              </div>
            </div>
          ))}
        </div>
      </div>

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
