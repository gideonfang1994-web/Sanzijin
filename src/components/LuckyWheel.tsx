import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, Sparkles, HelpCircle, AlertCircle, CircleDollarSign, Compass, RotateCw, X } from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserStats } from '../types';
import audio from '../utils/AudioUtils';

interface LuckyWheelProps {
  stats: UserStats;
  onUpdateStats: (newStats: Partial<UserStats>) => void;
  onReward: (xp: number, coins: number) => void;
  onClose: () => void;
  targetMinutes: number; // 5, 10 or 15
}

interface WheelPrize {
  name: string;
  emoji: string;
  color: string;
  coins: number;
  xp: number;
  itemId?: string;
  isJackpot?: boolean;
}

const WHEEL_PRIZES: WheelPrize[] = [
  { name: '150 魔法币', emoji: '🪙', color: '#6366f1', coins: 150, xp: 50 },
  { name: '少儿魔法苹果', emoji: '🍎', color: '#ec4899', coins: 80, xp: 100, itemId: 'f2' },
  { name: '游侠皮装', emoji: '🎽', color: '#10b981', coins: 100, xp: 150, itemId: 'i3' },
  { name: '智慧魔法药水', emoji: '🧪', color: '#f59e0b', coins: 120, xp: 120, itemId: 'f1' },
  { name: '神兽招财猫', emoji: '🐱', color: '#8b5cf6', coins: 200, xp: 200, itemId: 'pet_cat' },
  { name: '特等大奖 500币', emoji: '🌟', color: '#ef4444', coins: 500, xp: 500, isJackpot: true },
  { name: '优质补给鲜肉', emoji: '🥩', color: '#06b6d4', coins: 80, xp: 80, itemId: 'food_meat' },
  { name: '潜行忍者长靴', emoji: '👟', color: '#14b8a6', coins: 150, xp: 150, itemId: 'i5' },
];

export const LuckyWheel: React.FC<LuckyWheelProps> = ({ stats, onUpdateStats, onReward, onClose, targetMinutes }) => {
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [rotationDegrees, setRotationDegrees] = useState<number>(0);
  const [winningPrize, setWinningPrize] = useState<WheelPrize | null>(null);
  const [showPrizeClaim, setShowPrizeClaim] = useState<boolean>(false);

  const startSpin = () => {
    if (isSpinning) return;

    audio.playClick();
    setIsSpinning(true);

    // Pick a random prize index (0 to 7)
    // Make jackpot slightly harder if desired, but let's keep it fair and exciting!
    const prizeIndex = Math.floor(Math.random() * WHEEL_PRIZES.length);
    
    // Slices are 45 degrees each (360 / 8)
    const prizeDegrees = indexToDegrees(prizeIndex);
    
    // Spin around multiple times then decelerate onto target
    const fullSpins = 5; // 5 full rotations
    const targetDegrees = fullSpins * 360 + (360 - prizeDegrees);
    
    setRotationDegrees(targetDegrees);

    // Tick audio sound effects while spinning!
    let tickCount = 0;
    const interval = setInterval(() => {
      if (tickCount < 25) {
        audio.playPop();
        tickCount++;
      } else {
        clearInterval(interval);
      }
    }, 150);

    setTimeout(() => {
      clearInterval(interval);
      setIsSpinning(false);
      const prize = WHEEL_PRIZES[prizeIndex];
      setWinningPrize(prize);
      setShowPrizeClaim(true);

      // Award XP & Coins of the prize
      onReward(prize.xp, prize.coins);

      // Unlock item if any
      if (prize.itemId) {
        const alreadyUnlocked = stats.unlockedItems || [];
        if (!alreadyUnlocked.includes(prize.itemId)) {
          onUpdateStats({
            unlockedItems: [...alreadyUnlocked, prize.itemId]
          });
        }
      }

      // Play victory/celebration sound
      audio.playReward();
      confetti({
        particleCount: 180,
        spread: 90,
        origin: { y: 0.4 },
        colors: ['#F59E0B', '#EF4444', '#10B981', '#3B82F6', '#8B5CF6']
      });

    }, 3600); // Deceleration time match
  };

  const indexToDegrees = (index: number) => {
    // Offset so target center of slice points to the top indicator pointer (0 degrees / 360)
    return index * 45;
  };

  return (
    <div id="lucky-wheel-modal" className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-slate-900 border-2 border-amber-400 rounded-3xl p-5 shadow-[0_0_50px_rgba(245,158,11,0.25)] max-w-md w-full relative overflow-hidden text-center"
      >
        {/* Glow behind */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close button (only if not actively spinning to prevent exploits) */}
        {!isSpinning && (
          <button 
            type="button" 
            onClick={onClose}
            className="absolute right-4 top-4 hover:scale-105 active:scale-95 text-slate-400 hover:text-white transition-all p-1"
          >
            <X size={20} />
          </button>
        )}

        <div className="space-y-1 mb-5">
          <div className="bg-amber-500/10 w-fit mx-auto px-4 py-1.5 rounded-full border border-amber-500/30 flex items-center gap-1.5 animate-pulse">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-black text-amber-300">已在线达 {targetMinutes} 分钟奖励</span>
          </div>
          <h2 className="text-2xl font-black text-white font-cute tracking-wide mt-2">
            🎡 奇迹幸运大转盘
          </h2>
          <p className="text-[11px] text-slate-300 leading-relaxed max-w-xs mx-auto">
            极速旋转，好礼相送！极高概率开出史诗招财猫与魔法金币！
          </p>
        </div>

        {/* Wheel Apparatus */}
        <div className="relative w-72 h-72 mx-auto my-6 flex items-center justify-center">
          {/* External Lights / Ring */}
          <div className="absolute w-full h-full rounded-full border-[8px] border-amber-400 bg-slate-950 shadow-[0_0_20px_rgba(245,158,11,0.4)] flex items-center justify-center overflow-hidden">
            {/* Blinking decorative nodes */}
            {[...Array(8)].map((_, i) => (
              <div 
                key={i} 
                className={`absolute w-2 h-2 rounded-full ${i % 2 === 0 ? 'bg-amber-300 animate-pulse' : 'bg-orange-400'}`}
                style={{
                  top: `${50 + 44 * Math.sin((i * Math.PI) / 4)}%`,
                  left: `${50 + 44 * Math.cos((i * Math.PI) / 4)}%`,
                  transform: 'translate(-50%, -50%)'
                }}
              />
            ))}
          </div>

          {/* Slices of the Wheel */}
          <motion.div 
            className="absolute w-[252px] h-[252px] rounded-full overflow-hidden border border-amber-300/30"
            animate={{ rotate: rotationDegrees }}
            transition={isSpinning ? { duration: 3.6, ease: [0.15, 0.85, 0.35, 1] } : { duration: 0 }}
            style={{ transformOrigin: 'center center' }}
          >
            {WHEEL_PRIZES.map((prize, idx) => {
              const rotation = idx * 45;
              return (
                <div 
                  key={idx}
                  className="absolute w-full h-full"
                  style={{
                    transform: `rotate(${rotation}deg)`,
                    transformOrigin: '50% 50%',
                  }}
                >
                  {/* Visual colored slice wedges */}
                  <div 
                    className="absolute top-0 left-1/2 -translateX-1/2 w-0 h-0"
                    style={{
                      borderLeft: '53px solid transparent',
                      borderRight: '53px solid transparent',
                      borderTop: `126px solid ${prize.color}dd`,
                      transform: 'translateX(-50%)',
                      transformOrigin: 'top center'
                    }}
                  />
                  {/* Prize Info Text/Emoji */}
                  <div 
                    className="absolute top-4 left-1/2 -translate-x-1/2 flex flex-col items-center justify-start text-center z-10 pointer-events-none"
                    style={{ height: '110px' }}
                  >
                    <span className="text-xl filter drop-shadow">{prize.emoji}</span>
                    <span className="text-[7.5px] font-black text-white bg-black/60 px-1 py-0.2 rounded mt-0.5 max-w-[55px] truncate">
                      {prize.name}
                    </span>
                  </div>
                </div>
              );
            })}
          </motion.div>

          {/* Center Spin Button / Anchor */}
          <button
            type="button"
            disabled={isSpinning}
            onClick={startSpin}
            className={`absolute z-30 w-16 h-16 rounded-full border-4 border-amber-300 flex flex-col items-center justify-center text-slate-950 font-black text-xs transition-all shadow-md active:scale-95 ${
              isSpinning 
                ? 'bg-amber-600 border-amber-700 text-amber-200 cursor-not-allowed filter brightness-90' 
                : 'bg-gradient-to-br from-amber-400 via-yellow-300 to-amber-500 hover:brightness-110 cursor-pointer shadow-[0_0_15px_rgba(245,158,11,0.5)] animate-bounce'
            }`}
          >
            <RotateCw size={14} className={isSpinning ? 'animate-spin' : ''} />
            <span className="text-[10px] uppercase font-black tracking-tighter mt-0.5">SPIN!</span>
          </button>

          {/* Pointer/Arrow at top */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-30 pointer-events-none drop-shadow">
            <Compass className="w-7 h-7 text-amber-300 stroke-[3px] rotate-185" />
          </div>
        </div>

        {/* SPIN Prompt Label */}
        <p className="text-[10px] text-slate-400 font-bold mb-4 uppercase tracking-[0.1em]">
          {isSpinning ? '🪄 轮盘正在加速转动...' : '👉 点击中央按钮转动轮盘'}
        </p>

        {/* Claim Rewards Popup */}
        <AnimatePresence>
          {showPrizeClaim && winningPrize && (
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="absolute inset-4 bg-emerald-950/95 border-2 border-emerald-400 rounded-3xl z-40 p-5 flex flex-col items-center justify-center text-center space-y-3"
            >
              <div className="text-5xl animate-bounce filter drop-shadow">{winningPrize.emoji}</div>
              <h3 className="text-lg font-black text-rose-300 font-cute">恭喜你中奖啦！🎉</h3>
              <p className="text-xs text-slate-100 max-w-xs px-2 leading-relaxed">
                你在幸运转盘中抽取获得了
                <strong className="text-amber-300 block text-base font-black my-1">
                  {winningPrize.emoji} {winningPrize.name}
                </strong>
                包含 <strong className="text-teal-300 font-black">+{winningPrize.coins} 魔法币</strong> 和 <strong className="text-emerald-300 font-black">+{winningPrize.xp} XP</strong>
                {winningPrize.itemId && (
                  <span className="block mt-1 text-yellow-300 font-extrabold bg-indigo-900/40 px-2 py-1 rounded border border-yellow-500/20 text-[10px]">
                    🎁 装备或珍稀道具已自动加入背包！
                  </span>
                )}
              </p>
              
              <button
                type="button"
                onClick={() => {
                  audio.playClick();
                  setShowPrizeClaim(false);
                  onClose();
                }}
                className="w-full max-w-xs bg-gradient-to-r from-emerald-400 to-teal-500 text-slate-950 font-black text-xs py-3 rounded-2xl cursor-pointer hover:scale-102 transition-all border-b-4 border-emerald-700"
              >
                得意地收下这波福利 🥳
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
