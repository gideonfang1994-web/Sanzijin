
import React from 'react';
import { UserStats } from '../types';
import { Star, Flame, CircleDollarSign, Trophy, ShieldCheck } from 'lucide-react';

interface Props {stats: UserStats;}

const GamifiedHeader: React.FC<Props> = ({ stats }) => {
  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 w-[94%] max-w-lg z-50">
      <div className="glass-pill rounded-[32px] px-4 py-3 flex justify-between items-center shadow-2xl">
        {/* Left: Level Sphere */}
        <div className="flex items-center space-x-3">
          <div className="relative group">
            <div className="absolute inset-0 bg-indigo-500 rounded-2xl blur-lg opacity-20 group-hover:opacity-40 transition-opacity"></div>
            <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 text-white w-12 h-12 rounded-2xl flex flex-col items-center justify-center font-black shadow-lg border-2 border-white/50 relative overflow-hidden">
               <span className="text-[8px] opacity-70 leading-none">LV</span>
               <span className="text-xl leading-none">{stats.level}</span>
               <div className="absolute -bottom-1 -right-1 bg-amber-400 p-0.5 rounded-full border-2 border-white">
                  <ShieldCheck size={10} className="text-white" />
               </div>
            </div>
          </div>
          <div className="flex flex-col space-y-1">
            <div className="w-20 h-2 bg-slate-100 rounded-full overflow-hidden border border-white shadow-inner">
              <div 
                className="h-full rainbow-progress transition-all duration-1000 ease-out"
                style={{ width: `${(stats.xp % 1000) / 10}%` }}
              />
            </div>
            <span className="text-[9px] font-black text-slate-400 tracking-widest uppercase flex items-center">
              Exp Journey <Trophy size={8} className="ml-1" />
            </span>
          </div>
        </div>
        
        {/* Right: Jewel Case */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center bg-amber-50 px-3 py-2 rounded-2xl border border-amber-100 shadow-sm transition-transform hover:scale-105 active:scale-95">
            <CircleDollarSign className="w-4 h-4 text-amber-500 mr-2 fill-amber-200" />
            <span className="font-black text-amber-700 text-xs tabular-nums">{stats.starCoins}</span>
          </div>
          <div className="flex items-center bg-indigo-600 px-3 py-2 rounded-2xl shadow-indigo-100 shadow-lg border-2 border-white/50 transition-transform hover:scale-105 active:scale-95">
            <Star className="w-4 h-4 text-white mr-2 fill-white animate-pulse" />
            <span className="font-black text-white text-xs tabular-nums">{stats.xp}</span>
          </div>
          <div className="bg-rose-50 p-2.5 rounded-2xl border border-rose-100 animate-bounce-gentle">
            <Flame className="w-4 h-4 text-rose-500 fill-rose-500" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default GamifiedHeader;
