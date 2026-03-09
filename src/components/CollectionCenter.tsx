
import React from 'react';
import { WordGroup, UserStats } from '../types';
import { Trophy, Star, Award, Medal, Sparkles, ChevronRight } from 'lucide-react';

interface Props {
  groups: WordGroup[];
  stats: UserStats;
  onClose: () => void;
}

const CollectionCenter: React.FC<Props> = ({ groups, stats, onClose }) => {
  const learnedGroups = groups.filter(g => g.learned);
  const totalWords = groups.filter(g => g.learned).length * 3; // Approximate

  const titles = [
    { threshold: 0, name: '初级魔法徒', icon: '🌱', color: 'text-emerald-500' },
    { threshold: 10, name: '词汇探险家', icon: '🧭', color: 'text-sky-500' },
    { threshold: 30, name: '大魔法师', icon: '🧙‍♂️', color: 'text-indigo-500' },
    { threshold: 50, name: '知识守护者', icon: '🛡️', color: 'text-rose-500' },
    { threshold: 100, name: '词海之王', icon: '👑', color: 'text-amber-500' },
  ];

  const currentTitle = [...titles].reverse().find(t => totalWords >= t.threshold) || titles[0];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-10 duration-700 space-y-8 pb-24">
      {/* Header Card */}
      <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-[48px] p-8 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20 blur-2xl"></div>
        <div className="relative z-10">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center text-4xl shadow-inner">
              {currentTitle.icon}
            </div>
            <div>
              <h2 className="text-3xl font-black tracking-tight">图鉴中心</h2>
              <p className="text-white/70 font-bold text-xs uppercase tracking-widest">Collection Gallery</p>
            </div>
          </div>
          
          <div className="bg-black/20 backdrop-blur-sm rounded-3xl p-4 flex items-center justify-between border border-white/10">
            <div>
              <p className="text-[10px] font-bold text-white/50 uppercase mb-1">当前称号</p>
              <h3 className="text-xl font-black text-amber-300">{currentTitle.name}</h3>
            </div>
            <Award className="text-amber-300" size={32} />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-[32px] p-6 border-2 border-indigo-50 shadow-sm flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-500 mb-3">
            <Star fill="currentColor" size={24} />
          </div>
          <span className="text-3xl font-black text-slate-800">{learnedGroups.length}</span>
          <span className="text-[10px] font-bold text-slate-400 uppercase mt-1">已解锁章节</span>
        </div>
        <div className="bg-white rounded-[32px] p-6 border-2 border-rose-50 shadow-sm flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500 mb-3">
            <Medal fill="currentColor" size={24} />
          </div>
          <span className="text-3xl font-black text-slate-800">{totalWords}</span>
          <span className="text-[10px] font-bold text-slate-400 uppercase mt-1">掌握词汇量</span>
        </div>
      </div>

      {/* Gallery List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-xl font-black text-slate-800">我的成就图鉴</h3>
          <Sparkles className="text-amber-400" size={20} />
        </div>
        
        {learnedGroups.length === 0 ? (
          <div className="bg-slate-50 rounded-[32px] p-12 text-center border-2 border-dashed border-slate-200">
            <p className="text-slate-400 font-bold">还没有收集到图鉴哦，快去冒险吧！</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
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
        )}
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
