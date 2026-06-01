import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, Calendar, Check, CircleDollarSign, AlertCircle, Sparkles, X, Info } from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserStats } from '../types';
import audio from '../utils/AudioUtils';

interface DailyCheckInProps {
  stats: UserStats;
  onUpdateStats: (newStats: Partial<UserStats>) => void;
  onReward: (xp: number, coins: number) => void;
  onClose: () => void;
}

interface CheckInReward {
  day: number;
  label: string;
  coins: number;
  xp: number;
  itemId?: string; // Unlock equipment id
  itemName?: string;
  itemEmoji?: string;
  itemDesc?: string;
}

const CHECKIN_REWARDS: CheckInReward[] = [
  { day: 1, label: '第 1 天', coins: 60, xp: 50 },
  { day: 2, label: '第 2 天', coins: 120, xp: 80 },
  { 
    day: 3, 
    label: '第 3 天', 
    coins: 180, 
    xp: 120, 
    itemId: 'i4', 
    itemName: '勇气头盔', 
    itemEmoji: '🪖',
    itemDesc: '闪耀勇气的钢盔，防御力 +10！'
  },
  { day: 4, label: '第 4 天', coins: 250, xp: 150 },
  { 
    day: 5, 
    label: '第 5 天', 
    coins: 300, 
    xp: 200, 
    itemId: 'pet_slime', 
    itemName: '波利史莱姆', 
    itemEmoji: '🧊',
    itemDesc: '软q可爱的水系史莱姆，陪伴你冒险！'
  },
  { day: 6, label: '第 6 天', coins: 400, xp: 250 },
  { 
    day: 7, 
    label: '第 7 天', 
    coins: 600, 
    xp: 500, 
    itemId: 'i2', 
    itemName: '法术魔典', 
    itemEmoji: '📖',
    itemDesc: '至高无上的秘法书卷，增加魔力 +25！'
  }
];

export const DailyCheckIn: React.FC<DailyCheckInProps> = ({ stats, onUpdateStats, onReward, onClose }) => {
  const [streak, setStreak] = useState<number>(0);
  const [hasCheckedInToday, setHasCheckedInToday] = useState<boolean>(false);
  const [selectedReward, setSelectedReward] = useState<CheckInReward | null>(null);
  const [successAnimation, setSuccessAnimation] = useState<boolean>(false);
  const [claimedRewardToday, setClaimedRewardToday] = useState<CheckInReward | null>(null);

  useEffect(() => {
    // Determine streak and today check-in status
    const todayStr = new Date().toISOString().split('T')[0];
    const lastCheckin = localStorage.getItem('wordland_last_checkin_date');
    const savedStreak = parseInt(localStorage.getItem('wordland_checkin_streak') || '0', 10);
    
    setStreak(savedStreak);
    
    if (lastCheckin === todayStr) {
      setHasCheckedInToday(true);
    } else if (lastCheckin) {
      // Check if they skipped a day (streak broken)
      const lastDate = new Date(lastCheckin);
      const todayDate = new Date(todayStr);
      const diffTime = Math.abs(todayDate.getTime() - lastDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays > 1) {
        // Streak broken
        setStreak(0);
        localStorage.setItem('wordland_checkin_streak', '0');
      }
    }
    
    // Default select today's reward or tomorrow's reward for display details
    const currentDayIndex = Math.min(savedStreak, 6);
    setSelectedReward(CHECKIN_REWARDS[currentDayIndex]);
  }, []);

  const handleCheckIn = () => {
    if (hasCheckedInToday) return;

    const todayStr = new Date().toISOString().split('T')[0];
    const newStreak = (streak % 7) + 1;
    
    localStorage.setItem('wordland_last_checkin_date', todayStr);
    localStorage.setItem('wordland_checkin_streak', newStreak.toString());
    
    setStreak(newStreak);
    setHasCheckedInToday(true);

    const currentReward = CHECKIN_REWARDS[newStreak - 1];
    setClaimedRewardToday(currentReward);

    // Apply currency & experience reward
    onReward(currentReward.xp, currentReward.coins);

    // Update unlocked items if available
    if (currentReward.itemId) {
      const alreadyUnlocked = stats.unlockedItems || [];
      if (!alreadyUnlocked.includes(currentReward.itemId)) {
        onUpdateStats({
          unlockedItems: [...alreadyUnlocked, currentReward.itemId]
        });
      }
    }

    // Play satisfactory chimes and explosion confetti
    audio.playReward();
    setSuccessAnimation(true);
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.4 },
      colors: ['#34D399', '#FBBF24', '#60A5FA', '#E879F9']
    });

    setTimeout(() => {
      setSuccessAnimation(false);
    }, 4000);
  };

  return (
    <div id="daily-checkin-modal" className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-indigo-950/95 border-2 border-indigo-400 rounded-3xl p-5 shadow-2xl max-w-lg w-full relative overflow-hidden"
      >
        {/* Glow decoration */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 hover:scale-105 active:scale-95 text-indigo-300 hover:text-white transition-all p-1"
        >
          <X size={20} />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-1 relative mb-4">
          <div className="bg-amber-100 dark:bg-amber-500/10 w-fit mx-auto px-4 py-1.5 rounded-full border border-amber-300 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-500 fill-amber-300" />
            <span className="text-xs font-black text-amber-800 dark:text-amber-300">
              {hasCheckedInToday ? `已连续打卡 ${streak} 天` : `今日待打卡：连续打卡领大奖`}
            </span>
          </div>
          <h2 className="text-2xl font-black text-white font-cute tracking-wider mt-2">
            📅 魔法签到大典
          </h2>
          <p className="text-[11px] text-indigo-200">
            天天打卡，吸收词汇魔力！稀有防御钢盔和软Q史莱姆等你带走！
          </p>
        </div>

        {/* 7 Days Grid */}
        <div className="grid grid-cols-4 xs:grid-cols-7 gap-2 my-4">
          {CHECKIN_REWARDS.map((rew) => {
            const isClaimed = rew.day <= streak && (rew.day < streak || hasCheckedInToday);
            const isToday = rew.day === (hasCheckedInToday ? streak : streak + 1);
            const isSelected = selectedReward?.day === rew.day;

            return (
              <motion.div
                key={rew.day}
                whileHover={{ y: isClaimed ? 0 : -2 }}
                onClick={() => {
                  audio.playClick();
                  setSelectedReward(rew);
                }}
                className={`relative rounded-xl p-2 flex flex-col items-center justify-between border-2 transition-all cursor-pointer select-none ${
                  isClaimed 
                    ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' 
                    : isToday 
                    ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.2)]' 
                    : 'bg-indigo-900/40 border-indigo-700/60 text-indigo-300 hover:bg-indigo-900/60'
                } ${isSelected ? 'ring-4 ring-indigo-400 bg-indigo-900/80 border-indigo-300' : ''}`}
              >
                {/* Day label */}
                <span className="text-[9px] font-black tracking-wide">{rew.label}</span>
                
                {/* Reward Visual */}
                <div className="my-1.5 flex items-center justify-center h-8 w-8 relative">
                  {rew.itemId ? (
                    <span className="text-2xl filter drop-shadow">{rew.itemEmoji}</span>
                  ) : (
                    <Gift className={`w-6 h-6 ${isClaimed ? 'text-emerald-400' : 'text-amber-400'}`} />
                  )}
                  
                  {/* Status Indicator */}
                  {isClaimed && (
                    <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-slate-950 rounded-full p-0.5 border border-white">
                      <Check className="w-2 h-2 stroke-[4px]" />
                    </div>
                  )}
                </div>

                {/* Coins amount */}
                <span className="text-[8px] font-bold tracking-tight bg-slate-950/40 px-1 rounded-md">
                  +{rew.coins}🪙
                </span>
                
                {isToday && !hasCheckedInToday && (
                  <span className="absolute -top-1 -right-1 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                  </span>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Selected Reward Details (Interactive View) */}
        <AnimatePresence mode="wait">
          {selectedReward && (
            <motion.div
              key={selectedReward.day}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -10, opacity: 0 }}
              className="bg-indigo-950/80 border border-indigo-500/40 rounded-2xl p-3.5 my-3 flex gap-3 items-center"
            >
              <div className="h-12 w-12 rounded-xl bg-indigo-900/60 flex items-center justify-center text-3xl shadow-inner border border-indigo-800/40">
                {selectedReward.itemId ? selectedReward.itemEmoji : '🎁'}
              </div>
              <div className="flex-1 space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black text-amber-300">[{selectedReward.label} 奖励细节]</span>
                  {selectedReward.itemId && (
                    <span className="bg-amber-400 text-slate-950 text-[8px] font-extrabold px-1.5 py-0.2 rounded-full uppercase scale-90">
                      稀有装备
                    </span>
                  )}
                </div>
                <h4 className="text-sm font-black text-white flex items-center gap-1">
                  {selectedReward.itemId ? selectedReward.itemName : '充沛词汇魔力补给'}
                </h4>
                <p className="text-[10px] text-indigo-200">
                  {selectedReward.itemId 
                    ? selectedReward.itemDesc 
                    : `内含 ${selectedReward.coins} 魔法币与 ${selectedReward.xp} 点经验力。每日坚持，轻松掌握英语单词三字经！`}
                </p>
                <div className="flex gap-2.5 pt-1">
                  <span className="text-[9px] font-black text-amber-300 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 flex items-center">
                    💰 +{selectedReward.coins} 魔法币
                  </span>
                  <span className="text-[9px] font-black text-emerald-300 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 flex items-center">
                    🌟 +{selectedReward.xp} XP
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Claim Actions */}
        <div className="flex gap-2.5 mt-4">
          <button
            onClick={onClose}
            className="flex-1 bg-indigo-900/40 hover:bg-indigo-900/60 text-indigo-300 font-bold text-xs py-3 rounded-2xl transition-all border border-indigo-800/60"
          >
            以后再说
          </button>
          
          <button
            disabled={hasCheckedInToday}
            onClick={handleCheckIn}
            className={`flex-[2] py-3 font-black text-sm rounded-2xl active:translate-y-0.5 border-b-4 transition-all flex items-center justify-center gap-2 ${
              hasCheckedInToday
                ? 'bg-emerald-500/20 text-emerald-400 border-b-0 cursor-not-allowed border-emerald-500/35'
                : 'bg-gradient-to-r from-amber-400 to-yellow-500 hover:brightness-105 active:scale-98 text-slate-950 border-amber-600 shadow-md cursor-pointer'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>{hasCheckedInToday ? '今日已打卡成功 ✓' : '领取今日大礼 & 打卡'}</span>
          </button>
        </div>

        {/* Feedback celebration popup inside Daily Checkin */}
        <AnimatePresence>
          {successAnimation && claimedRewardToday && (
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="absolute inset-x-4 top-[10%] bottom-4 bg-emerald-950/95 border-2 border-emerald-400 rounded-2xl z-40 p-4 flex flex-col items-center justify-center text-center space-y-3"
            >
              <div className="text-5xl animate-bounce">✨💎🎁✨</div>
              <h3 className="text-lg font-black text-emerald-300 font-cute">打卡签到成功！</h3>
              <p className="text-xs text-white max-w-xs leading-relaxed">
                恭喜你收获
                <strong className="text-amber-300 mx-1">+{claimedRewardToday.coins} 魔法币</strong>和
                <strong className="text-emerald-400 mx-1">+{claimedRewardToday.xp} XP 经验</strong>！
                {claimedRewardToday.itemId && (
                  <span>
                    以及专属奇迹装备：
                    <strong className="text-yellow-300 font-bold block mt-1">
                      {claimedRewardToday.itemEmoji} {claimedRewardToday.itemName} 已收入囊中！
                    </strong>
                  </span>
                )}
              </p>
              <button 
                onClick={() => setSuccessAnimation(false)}
                className="bg-emerald-500 text-slate-950 font-black text-xs px-6 py-2 rounded-full cursor-pointer hover:bg-emerald-400"
              >
                好的 🤹‍♂️
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
