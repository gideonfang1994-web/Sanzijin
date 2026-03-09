
import React from 'react';
import { BookOpen, Gamepad2, Sparkles, Star, Trophy } from 'lucide-react';
import { UserStats, WordGroup, ViewState } from '../types';
import DailyQuestBoard from '../components/DailyQuestBoard';

interface HomePageProps {
  stats: UserStats;
  groups: WordGroup[];
  reviewNeeded: WordGroup[];
  onNavigate: (view: ViewState) => void;
  onQuestClick: (view: ViewState, isReview?: boolean) => void;
}

const HomePage: React.FC<HomePageProps> = ({ stats, groups, reviewNeeded, onNavigate, onQuestClick }) => {
  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-700">
      {/* Stats Card */}
      <div className="bg-white rounded-[40px] p-6 shadow-xl border-2 border-indigo-50 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 text-white w-12 h-12 rounded-2xl flex flex-col items-center justify-center font-black shadow-lg border-2 border-white/50">
            <span className="text-[8px] opacity-70 leading-none">LV</span>
            <span className="text-xl leading-none">{stats.level}</span>
          </div>
          <div className="flex flex-col">
            <div className="w-20 h-2 bg-slate-100 rounded-full overflow-hidden border border-white shadow-inner">
              <div className="h-full rainbow-progress" style={{ width: `${(stats.xp % 1000) / 10}%` }} />
            </div>
            <span className="text-[9px] font-black text-slate-400 tracking-widest uppercase mt-1">Exp Journey</span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center bg-amber-50 px-3 py-2 rounded-2xl border border-amber-100">
            <Star size={14} className="text-amber-500 mr-1 fill-amber-200" />
            <span className="font-black text-amber-700 text-xs">{stats.starCoins}</span>
          </div>
          <div className="flex items-center bg-indigo-600 px-3 py-2 rounded-2xl border-2 border-white/50 text-white">
            <Trophy size={14} className="mr-1" />
            <span className="font-black text-xs">{stats.xp}</span>
          </div>
        </div>
      </div>

      <div className="text-center py-6 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl -z-10 animate-pulse"></div>
        <div className="flex flex-col items-center">
          <div className="w-28 h-28 bg-white rounded-[40px] shadow-2xl flex items-center justify-center text-6xl mb-4 animate-bounce-gentle border-4 border-indigo-100 transform rotate-3">
            🐯
          </div>
          <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-rose-500 tracking-tighter drop-shadow-sm">单词奇旅</h1>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5">
        <button onClick={() => onNavigate('ADVENTURE')} className="bg-rose-500 p-8 rounded-[40px] puffy-button text-white relative overflow-hidden group border-none">
          <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform"></div>
          <div className="bg-white/20 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4 backdrop-blur-md">
            <BookOpen className="text-white w-9 h-9" />
          </div>
          <h3 className="font-black text-xl">冒险森林</h3>
          <p className="text-[10px] opacity-80 font-bold mt-1 uppercase tracking-widest">Story Mode</p>
          {reviewNeeded.length > 0 && <div className="absolute top-4 right-4 bg-white text-rose-600 text-[10px] font-black px-2 py-0.5 rounded-full shadow-lg">{reviewNeeded.length}</div>}
        </button>
        
        <button onClick={() => onNavigate('ARCADE')} className="bg-indigo-600 p-8 rounded-[40px] puffy-button text-white relative overflow-hidden group border-none">
          <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform"></div>
          <div className="bg-white/20 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4 backdrop-blur-md">
            <Gamepad2 className="text-white w-9 h-9" />
          </div>
          <h3 className="font-black text-xl">游乐园</h3>
          <p className="text-[10px] opacity-80 font-bold mt-1 uppercase tracking-widest">Skill Training</p>
        </button>
      </div>

      <div className="bg-white rounded-[40px] p-6 border-2 border-indigo-50 shadow-sm flex items-center justify-between group cursor-pointer hover:border-indigo-200 transition-all" onClick={() => onNavigate('COLLECTION')}>
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 bg-amber-100 rounded-3xl flex items-center justify-center text-3xl shadow-inner group-hover:rotate-12 transition-transform">🏆</div>
          <div>
            <h4 className="font-black text-slate-800 text-base">图鉴收集中心</h4>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Collection Gallery</p>
          </div>
        </div>
        <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-amber-50 group-hover:text-amber-500 transition-all">
          <Sparkles size={20} />
        </div>
      </div>

      <DailyQuestBoard quests={stats.quests} onQuestClick={onQuestClick} />
      
      {/* Achievement Preview */}
      <div className="glass-pill rounded-[36px] p-6 flex items-center justify-between border-indigo-50">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center text-2xl">🏆</div>
          <div>
            <h4 className="font-black text-slate-800 text-sm">小小单词家</h4>
            <p className="text-[10px] font-bold text-slate-400">已解锁 {groups.filter(g => g.learned).length} 个图鉴</p>
          </div>
        </div>
        <Sparkles className="text-amber-400" size={20} />
      </div>
    </div>
  );
};

export default HomePage;
