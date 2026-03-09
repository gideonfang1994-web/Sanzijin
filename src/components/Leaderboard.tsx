
import React from 'react';
import { UserStats } from '../types';
import { Trophy, Medal, Crown, Star } from 'lucide-react';

const MOCK_RANKING = [
  { name: '超人小明', xp: 4500, level: 9, avatar: '🐰' },
  { name: '英语学霸', xp: 3800, level: 8, avatar: '🦁' },
  { name: '单词王者', xp: 3200, level: 7, avatar: '🐼' },
  { name: '开心果', xp: 2100, level: 5, avatar: '🐱' },
  { name: '练习生', xp: 1200, level: 3, avatar: '🐶' },
];

const Leaderboard: React.FC<{ stats: UserStats }> = ({ stats }) => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-500">
      <div className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-[44px] p-8 text-white shadow-xl relative overflow-hidden">
        <Crown className="absolute -top-4 -right-4 w-32 h-32 opacity-10 rotate-12" />
        <h2 className="text-3xl font-black mb-1">荣誉殿堂</h2>
        <p className="text-amber-50 font-bold opacity-80">你是班里的第 {stats.rank} 名哦！加油！</p>
      </div>

      <div className="bg-white rounded-[44px] shadow-puffy border-2 border-slate-100 p-4 space-y-2">
        {MOCK_RANKING.map((user, i) => (
          <div key={i} className={`flex items-center p-4 rounded-3xl transition-all ${i === 0 ? 'bg-amber-50 border-amber-100' : 'hover:bg-slate-50'}`}>
            <div className="w-10 font-black text-xl text-slate-400">
              {i === 0 ? <Medal className="text-amber-500 w-8 h-8" /> : i + 1}
            </div>
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-2xl shadow-sm border-2 border-slate-50 mr-4">
              {user.avatar}
            </div>
            <div className="flex-1">
              <h4 className="font-black text-slate-700">{user.name}</h4>
              <p className="text-xs font-bold text-slate-400">LV.{user.level}</p>
            </div>
            <div className="flex items-center text-amber-500 font-black">
              <Star className="w-4 h-4 mr-1 fill-amber-500" />
              {user.xp}
            </div>
          </div>
        ))}

        {/* User's own entry */}
        <div className="mt-6 pt-6 border-t-4 border-dashed border-slate-50">
          <div className="flex items-center p-5 rounded-3xl bg-indigo-600 text-white shadow-lg shadow-indigo-200">
            <div className="w-10 font-black text-xl">{stats.rank}</div>
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-2xl mr-4">🐯</div>
            <div className="flex-1">
              <h4 className="font-black">你自己 (You)</h4>
              <p className="text-xs font-bold opacity-70">LV.{stats.level}</p>
            </div>
            <div className="flex items-center font-black">
              <Star className="w-4 h-4 mr-1 fill-white" />
              {stats.xp}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
