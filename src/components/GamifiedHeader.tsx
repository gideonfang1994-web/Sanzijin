
import React, { useState, useEffect } from 'react';
import { UserStats } from '../types';
import { Star, Flame, CircleDollarSign, Trophy, ShieldCheck, WifiOff } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {stats: UserStats;}

const GamifiedHeader: React.FC<Props> = ({ stats }) => {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    // Check initial state
    import('../firebase').then(({ isOfflineMode }) => {
      if (isOfflineMode) setOffline(true);
    });

    const handleOffline = () => setOffline(true);
    window.addEventListener('firestore-offline', handleOffline);
    return () => {
      window.removeEventListener('firestore-offline', handleOffline);
    };
  }, []);

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 w-[92%] max-w-lg z-50">
      <div className="glass-pill rounded-[32px] px-5 py-3.5 flex justify-between items-center shadow-2xl border-b-4 border-slate-100/30">
        {/* Left: Level Sphere */}
        <div className="flex items-center space-x-4">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="relative group cursor-help"
          >
            <div className="absolute inset-0 bg-indigo-500 rounded-2xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
            <div className="bg-gradient-to-br from-indigo-500 via-indigo-600 to-indigo-800 text-white w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-black shadow-lg border-2 border-white/40 relative overflow-hidden">
               <span className="text-[9px] opacity-60 leading-none mb-0.5 tracking-tighter">LEVEL</span>
               <span className="text-2xl leading-none">{stats.level}</span>
               <div className="absolute -bottom-1 -right-1 bg-amber-400 p-1 rounded-full border-2 border-white shadow-sm scale-90">
                  <ShieldCheck size={10} className="text-white" />
               </div>
               {/* Shine effect */}
               <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-tr from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            </div>
          </motion.div>
          <div className="flex flex-col space-y-1.5 flex-1 min-w-[80px]">
            <div className="flex items-center justify-between">
               <span className="text-[10px] font-black text-slate-400 tracking-wider uppercase flex items-center">
                Magic Xp
              </span>
              <span className="text-[9px] font-bold text-indigo-400">{(stats.xp % 1000)} / 1000</span>
            </div>
            <div className="w-full h-2.5 bg-slate-100/50 rounded-full overflow-hidden border border-white/50 shadow-inner p-0.5">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${(stats.xp % 1000) / 10}%` }}
                className="h-full rainbow-progress rounded-full transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(99,102,241,0.4)]"
              />
            </div>
          </div>
        </div>
        
        {/* Middle: Offline / Local Sync Info */}
        {offline && (
          <motion.div 
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mx-1 flex items-center space-x-1.5 bg-amber-50/90 border border-amber-200 text-amber-700 px-2.5 py-1 rounded-full text-[10px] font-extrabold shadow-sm"
            title="离线持久缓存模式已启动。您的学习进度将安全保存于本地，并在网络恢复时自动与云端同步。"
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500"></span>
            </span>
            <span className="font-bold text-amber-600 hidden xs:inline">本地同步中</span>
            <WifiOff size={11} className="text-amber-500 xs:hidden" />
          </motion.div>
        )}
        
        {/* Right: Jewel Case */}
        <div className="flex items-center space-x-3">
          <motion.div 
            whileHover={{ y: -2 }}
            title="魔法币"
            className="flex items-center bg-white/50 backdrop-blur-sm px-3.5 py-2.5 rounded-2xl border-2 border-white shadow-sm transition-all hover:bg-white active:scale-95"
          >
            <CircleDollarSign className="w-4.5 h-4.5 text-amber-500 mr-2 fill-amber-300 animate-spin-slow" />
            <span className="font-black text-slate-700 text-sm tabular-nums">{stats.magicCoins} 魔法币</span>
          </motion.div>
          
          <motion.div 
            whileHover={{ y: -2 }}
            className="flex items-center bg-rose-50 px-3.5 py-2.5 rounded-2xl border-2 border-rose-100 shadow-sm transition-all hover:bg-rose-100 active:scale-95 group"
          >
            <Flame className={`w-4.5 h-4.5 text-rose-500 mr-2 ${stats.streak > 0 ? 'fill-rose-500 animate-pulse' : 'opacity-30'}`} />
            <span className="font-black text-rose-600 text-sm tabular-nums">{stats.streak || 0}</span>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default GamifiedHeader;
