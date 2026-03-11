
import React, { useState } from 'react';
import { UserStats } from '../types';
import { Trophy, Medal, Crown, Star, Info, ChevronRight, Award, Sparkles, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MOCK_RANKING = [
  { name: '超人小明', xp: 12500, level: 13, avatar: '🐰' },
  { name: '英语学霸', xp: 9800, level: 10, avatar: '🦁' },
  { name: '单词王者', xp: 8200, level: 9, avatar: '🐼' },
  { name: '开心果', xp: 5100, level: 6, avatar: '🐱' },
  { name: '练习生', xp: 3200, level: 4, avatar: '🐶' },
];

const Leaderboard: React.FC<{ stats: UserStats }> = ({ stats }) => {
  const [showRules, setShowRules] = useState(false);

  const levelTitles = [
    { range: [1, 3], title: '魔法学徒', icon: '🌱' },
    { range: [4, 6], title: '初级法师', icon: '✨' },
    { range: [7, 9], title: '高级法师', icon: '🔮' },
    { range: [10, 12], title: '大魔法师', icon: '🧙‍♂️' },
    { range: [13, 15], title: '魔法导师', icon: '🎓' },
    { range: [16, 99], title: '至尊法圣', icon: '👑' },
  ];

  const currentTitle = levelTitles.find(t => stats.level >= t.range[0] && stats.level <= t.range[1]) || levelTitles[0];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-500 pb-24">
      {/* Header Card */}
      <div className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-[44px] p-8 text-white shadow-xl relative overflow-hidden">
        <Crown className="absolute -top-4 -right-4 w-32 h-32 opacity-10 rotate-12" />
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-3xl font-black mb-1">荣誉殿堂</h2>
              <p className="text-amber-50 font-bold opacity-80">你是班里的第 {stats.rank} 名哦！</p>
            </div>
            <button 
              onClick={() => setShowRules(true)}
              className="bg-white/20 hover:bg-white/30 p-2 rounded-2xl transition-colors"
            >
              <Info size={20} />
            </button>
          </div>
          
          <div className="bg-white/20 backdrop-blur-md rounded-3xl p-4 flex items-center justify-between border border-white/10">
            <div className="flex items-center space-x-3">
              <div className="text-2xl">{currentTitle.icon}</div>
              <div>
                <p className="text-[10px] font-bold text-white/60 uppercase">当前头衔</p>
                <h3 className="text-lg font-black">{currentTitle.title}</h3>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold text-white/60 uppercase">经验值</p>
              <h3 className="text-lg font-black">{stats.xp}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Ranking List */}
      <div className="bg-white rounded-[44px] shadow-puffy border-2 border-slate-100 p-4 space-y-2">
        <div className="px-4 py-2 flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
          <span>排名 & 魔法师</span>
          <span>魔法能量 (XP)</span>
        </div>
        
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
              <p className="text-xs font-bold opacity-70">LV.{stats.level} · {currentTitle.title}</p>
            </div>
            <div className="flex items-center font-black">
              <Star className="w-4 h-4 mr-1 fill-white" />
              {stats.xp}
            </div>
          </div>
        </div>
      </div>

      {/* Rules Modal */}
      <AnimatePresence>
        {showRules && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowRules(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white w-full max-w-sm rounded-[48px] overflow-hidden shadow-2xl border-4 border-white p-8"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-black text-slate-800">魔法赋分规则</h3>
                <button onClick={() => setShowRules(false)} className="p-2 bg-slate-100 rounded-xl text-slate-400">
                  <ChevronRight size={20} />
                </button>
              </div>

              <div className="space-y-6">
                <section className="space-y-3">
                  <div className="flex items-center space-x-2 text-indigo-600">
                    <Zap size={18} fill="currentColor" />
                    <h4 className="font-black">如何获得经验 (XP)</h4>
                  </div>
                  <ul className="space-y-2">
                    {[
                      { label: '解锁新魔法', value: '+150 XP' },
                      { label: '击中正确气球', value: '+150 XP' },
                      { label: '完成连击 (Combo)', value: '+20 XP/次' },
                      { label: '每日签到', value: '+100 XP' },
                    ].map((item, i) => (
                      <li key={i} className="flex justify-between items-center bg-slate-50 p-3 rounded-2xl border border-slate-100">
                        <span className="text-xs font-bold text-slate-600">{item.label}</span>
                        <span className="text-xs font-black text-indigo-600">{item.value}</span>
                      </li>
                    ))}
                  </ul>
                </section>

                <section className="space-y-3">
                  <div className="flex items-center space-x-2 text-amber-500">
                    <Award size={18} fill="currentColor" />
                    <h4 className="font-black">升级规则</h4>
                  </div>
                  <div className="bg-amber-50 p-4 rounded-3xl border border-amber-100">
                    <p className="text-xs font-bold text-amber-700 leading-relaxed">
                      每积累 <span className="font-black">1000 XP</span> 即可提升 1 个魔法等级。等级越高，解锁的法师头衔越尊贵！
                    </p>
                  </div>
                </section>

                <section className="space-y-3">
                  <div className="flex items-center space-x-2 text-rose-500">
                    <Sparkles size={18} fill="currentColor" />
                    <h4 className="font-black">星币奖励</h4>
                  </div>
                  <p className="text-xs font-bold text-slate-500">
                    星币可用于在魔法商店兑换稀有装扮和道具（即将开启）。
                  </p>
                </section>
              </div>

              <button 
                onClick={() => setShowRules(false)}
                className="w-full mt-8 puffy-button bg-indigo-600 text-white py-4 rounded-3xl font-black"
              >
                我知道了
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Leaderboard;
