import React from 'react';
import { DailyQuest, ViewState } from '../types';
import { CheckCircle2, Swords, BookOpen, Gamepad2, ChevronRight, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

interface Props {
  quests: DailyQuest[];
  onQuestClick: (target: ViewState, isReview?: boolean, levelId?: number) => void;
}

const DailyQuestBoard: React.FC<Props> = ({ quests = [], onQuestClick }) => {
  const safeQuests = quests || [];
  const completedCount = safeQuests.filter(q => q.completed).length;
  const totalCount = safeQuests.length;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
  const isEverythingDone = completedCount === totalCount && totalCount > 0;
  
  // High-fidelity gameplay styles with chunky buttons, cute gradients, and bright border-shadows
  const questStyles: Record<string, { bg: string, text: string, bar: string, accent: string, border: string, iconBg: string }> = {
    q1: {
      bg: 'bg-gradient-to-br from-[#f0fdf4] to-[#dcfce7] border-emerald-300 hover:from-[#e6fcf0] hover:to-[#cffade]',
      text: 'text-emerald-950',
      bar: 'bg-emerald-500',
      accent: 'border-emerald-400 text-emerald-800',
      border: 'border-b-emerald-500',
      iconBg: 'bg-gradient-to-br from-emerald-400 to-green-600 text-white shadow-emerald-200',
    },
    q2: {
      bg: 'bg-gradient-to-br from-[#f0fdfa] to-[#ccfbf1] border-teal-300 hover:from-[#e6faf7] hover:to-[#99f6e4]',
      text: 'text-teal-950',
      bar: 'bg-teal-500',
      accent: 'border-teal-400 text-teal-800',
      border: 'border-b-teal-500',
      iconBg: 'bg-gradient-to-br from-teal-400 to-emerald-500 text-white shadow-teal-200',
    },
    q3: {
      bg: 'bg-gradient-to-br from-[#fdfbeb] to-[#fef9c3] border-amber-300 hover:from-[#fcf8da] hover:to-[#fef08a]',
      text: 'text-amber-950',
      bar: 'bg-amber-500',
      accent: 'border-amber-400 text-amber-800',
      border: 'border-b-amber-500',
      iconBg: 'bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-amber-200',
    }
  };

  const getStyle = (id: string) => {
    return questStyles[id] || questStyles.q1;
  };

  return (
    <div className="bg-gradient-to-b from-white via-[#f6fcf8] to-[#edfcf4] backdrop-blur-md rounded-[28px] p-4.5 border-2 border-emerald-250 mb-5 relative overflow-hidden shadow-md">
      {/* Dynamic background atmospheric glows */}
      <div className="absolute -top-16 -right-16 w-36 h-36 bg-emerald-150/40 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-yellow-150/50 rounded-full blur-2xl pointer-events-none" />
      
        {/* Header Container with Title on Left, Progress on Right */}
        <div className="flex items-center justify-between gap-1.1 mb-4 pb-3 border-b-2 border-dashed border-emerald-200/50 relative z-10 w-full">
          <div className="flex items-center space-x-2 min-w-0">
            {/* Animated bouncy game scroll sticker */}
            <motion.span 
              animate={{ rotate: [0, -10, 10, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="text-2xl sm:text-3xl select-none filter drop-shadow-[0_2px_3px_rgba(0,0,0,0.1)] shrink-0"
            >
              📜
            </motion.span>
            <div className="min-w-0 text-left">
              <h3 className="text-sm sm:text-lg font-sans font-black text-emerald-950 tracking-wide flex items-center gap-1 leading-tight whitespace-nowrap">
                <span>今日探险任务</span>
                <Sparkles size={14} className="text-amber-500 animate-pulse shrink-0 hidden sm:inline" />
              </h3>
              <span className="text-[9px] sm:text-[10px] text-emerald-700/80 font-extrabold tracking-wider block mt-0.5 uppercase whitespace-nowrap">Daily Quests</span>
            </div>
          </div>
          
          {/* Colorful Progress Counter Badge on the absolute right side without key emoji */}
          <div className="shrink-0">
            <div className="text-[10px] sm:text-xs font-black text-emerald-990 bg-white border-2 border-emerald-300 shadow-xs px-2.5 py-1 rounded-full select-none tracking-wide flex items-center gap-1">
              <span>进度:</span>
              <span className="bg-emerald-100 text-[#047857] px-1.5 py-0.5 rounded-md font-extrabold font-sans text-[10px] sm:text-xs shrink-0">
                {completedCount}/{totalCount}
              </span>
            </div>
          </div>
        </div>
      
         {/* Quests list with cartoonish liftable card components */}
      <div className="space-y-2 relative z-10">
        {safeQuests.map((quest, index) => {
          const style = getStyle(quest.id);
          return (
            <motion.button 
              key={quest.id} 
              whileHover={quest.completed ? {} : { scale: 1.01, y: -1 }}
              whileTap={quest.completed ? {} : { scale: 0.99 }}
              onClick={() => onQuestClick(quest.targetView, quest.isReviewType, quest.levelId)}
              className={`w-full flex items-center justify-between p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl border-2 transition-all relative overflow-hidden text-left cursor-pointer group ${
                quest.completed 
                ? 'bg-emerald-50/40 border-emerald-200/50 opacity-60 text-emerald-700/80 border-b-2' 
                : `${style.bg} ${style.border} border-b-[4px] active:border-b-2 active:translate-y-[1px] shadow-2xs`
              }`}
            >
              {/* Highlight background radial shimmer when hover */}
              {!quest.completed && (
                <div className="absolute inset-0 bg-[#fff5ea]/10 group-hover:bg-[#fff5ea]/20 rounded-xl transition-colors duration-200 pointer-events-none" />
              )}
              
              <div className="flex items-center space-x-2.5 min-w-0 flex-1 mr-2">
                {/* Visual Circle Badge with Cute Icon */}
                <div className={`shrink-0 w-9.5 h-9.5 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-xs border-2 border-white relative transition-transform ${
                  quest.completed ? 'bg-gradient-to-br from-emerald-100 to-emerald-250 text-emerald-800 border-emerald-350' : style.iconBg
                } group-hover:scale-105`}>
                  {quest.completed ? <CheckCircle2 size={16} strokeWidth={3} className="text-emerald-700 animate-[pulse_1.5s_infinite] sm:w-[20px] sm:h-[20px]" /> : 
                   quest.id === 'q1' ? <BookOpen size={16} strokeWidth={2.5} className="sm:w-[20px] sm:h-[20px]" /> : 
                   quest.id === 'q2' ? <Swords size={16} strokeWidth={2.5} className="sm:w-[20px] sm:h-[20px]" /> : <Gamepad2 size={16} strokeWidth={2.5} className="sm:w-[20px] sm:h-[20px]" />}
                </div>
                
                <div className="min-w-0">
                  <div className={`text-[13.5px] sm:text-[15px] font-black tracking-wide leading-tight flex items-center gap-1 ${
                    quest.completed ? 'text-emerald-500/80 line-through' : style.text
                  }`}>
                    <span className="truncate">{quest.label}</span>
                    {quest.completed && <span className="text-[8.5px] bg-emerald-105 text-emerald-800 border border-emerald-200 px-1 py-0.2 rounded font-black shrink-0 whitespace-nowrap">已通关</span>}
                  </div>
                  <div className={`text-[10px] sm:text-[11.5px] font-bold leading-normal truncate mt-0.5 ${
                    quest.completed ? 'text-emerald-500/60' : 'text-slate-600/90'
                  }`}>
                    {quest.completed ? '✨ 魔法修行大功告成！' : quest.id === 'q1' ? '闯关魔法森林，收获金币奖励' : quest.id === 'q2' ? '乐园音元拼字，赢取双倍快乐' : '战胜遗忘幽灵，淬炼发音精魂'}
                  </div>
                </div>
              </div>
 
              {/* Progress counter badge with gold effect */}
              <div className="flex items-center space-x-1.5 shrink-0">
                <span className={`text-[10px] sm:text-xs font-black px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg sm:rounded-xl border shadow-3xs transition-colors whitespace-nowrap ${
                  quest.completed 
                    ? 'bg-emerald-100/80 text-emerald-700 border-emerald-300/40' 
                    : 'bg-white text-amber-900 border-amber-200'
                }`}>
                  {quest.completed ? '100%' : `${quest.current}/${quest.target}`}
                </span>
                {!quest.completed && (
                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 group-hover:bg-amber-500 group-hover:text-white group-hover:border-amber-600 transition-all shrink-0">
                    <ChevronRight size={11} className="stroke-[3] sm:w-[13px] sm:h-[13px]" />
                  </div>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default DailyQuestBoard;

