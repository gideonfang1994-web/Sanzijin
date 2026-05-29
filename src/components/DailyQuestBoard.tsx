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
  
  // Magical forest styling with premium light pastel colors and child-appealing themes
  const questStyles: Record<string, { bg: string, text: string, bar: string, accent: string }> = {
    q1: {
      bg: 'bg-[#f0fdf4] border-emerald-200 hover:bg-[#e6f9ed] hover:border-emerald-300',
      text: 'text-emerald-950',
      bar: 'bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.3)]',
      accent: 'bg-emerald-100 border border-emerald-250 text-emerald-800',
    },
    q2: {
      bg: 'bg-[#f0fdfa] border-teal-200 hover:bg-[#e6f7f4] hover:border-teal-300',
      text: 'text-teal-980',
      bar: 'bg-gradient-to-r from-teal-400 via-emerald-400 to-cyan-400 shadow-[0_0_6px_rgba(45,212,191,0.3)]',
      accent: 'bg-teal-100 border border-teal-250 text-teal-800',
    },
    q3: {
      bg: 'bg-[#fdfbeb] border-amber-200 hover:bg-[#fcf8da] hover:border-amber-300',
      text: 'text-amber-950',
      bar: 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.3)]',
      accent: 'bg-amber-100 border border-amber-250 text-amber-800',
    }
  };

  const getStyle = (id: string) => {
    return questStyles[id] || questStyles.q1;
  };

  return (
    <div className="bg-gradient-to-b from-white via-[#f3fbf6] to-[#ecfdf3] backdrop-blur-md rounded-[24px] p-3 border-2 border-emerald-250 mb-4 relative overflow-hidden shadow-sm">
      {/* Light bubbles decorative backdrop */}
      <div className="absolute -top-12 -right-12 w-28 h-28 bg-emerald-100/40 rounded-full blur-xl pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-amber-100/50 rounded-full blur-xl pointer-events-none" />
      
      <div className="flex items-center justify-between mb-3 border-b border-emerald-200/60 pb-2.5">
        <div className="flex items-center space-x-2 relative z-10">
          <span className="text-2xl select-none animate-bounce block">📜</span>
          <h3 className="text-[17px] sm:text-[18px] font-black text-emerald-900 tracking-wide flex items-center gap-1.5 leading-tight">
            <span>今日任务</span>
            <Sparkles size={14} className="text-amber-500 animate-pulse shrink-0" />
          </h3>
        </div>
        <div className="text-[10px] sm:text-xs font-black text-emerald-800 bg-white border border-emerald-250 shadow-sm px-3 py-1 rounded-full select-none tracking-wider relative z-10">
           完成 {safeQuests.filter(q => q.completed).length} / {safeQuests.length} 🔑
         </div>
      </div>
      
      <div className="space-y-1.5 relative z-10">
        {safeQuests.map((quest, index) => {
          const style = getStyle(quest.id);
          return (
            <motion.button 
              key={quest.id} 
              whileHover={quest.completed ? {} : { scale: 1.01, y: -0.5 }}
              whileTap={quest.completed ? {} : { scale: 0.99 }}
              onClick={() => onQuestClick(quest.targetView, quest.isReviewType, quest.levelId)}
              className={`w-full flex items-center justify-between p-2.5 rounded-xl border transition-all relative overflow-hidden text-left cursor-pointer ${
                quest.completed 
                ? 'bg-emerald-50/50 border-emerald-250/50 opacity-60 text-emerald-600' 
                : `${style.bg} border shadow-inner`
              }`}
            >
              <div className="flex items-center space-x-3 min-w-0">
                <div className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center shadow-xs ${
                  quest.completed ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : style.accent
                }`}>
                  {quest.completed ? <CheckCircle2 size={16} strokeWidth={3} /> : 
                   quest.id === 'q1' ? <BookOpen size={16} strokeWidth={2.5} /> : 
                   quest.id === 'q2' ? <Swords size={16} strokeWidth={2.5} /> : <Gamepad2 size={16} strokeWidth={2.5} />}
                </div>
                
                <div className="min-w-0">
                  <div className={`text-[17px] sm:text-[18px] font-black tracking-wide leading-tight ${quest.completed ? 'text-emerald-500/80 line-through' : style.text}`}>
                    {quest.label}
                  </div>
                  <div className={`text-[11px] sm:text-xs font-bold leading-normal truncate mt-0.5 ${quest.completed ? 'text-emerald-500/70' : 'text-emerald-700/75'}`}>
                    {quest.completed ? '✨ 魔法已完美修成！' : quest.id === 'q1' ? '闯关深林密境，收获亮闪闪金币' : quest.id === 'q2' ? '和小萌兽快乐拼字斗法' : '战胜忘却，淬炼核心拼音魔法'}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                <span className={`text-[10px] sm:text-xs font-black px-2 py-0.5 rounded-full ${
                  quest.completed ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-800 border border-amber-200/50'
                }`}>
                  {quest.completed ? '已完成' : `${quest.current} / ${quest.target}`}
                </span>
                {!quest.completed && <ChevronRight size={14} className="text-emerald-400 group-hover:text-emerald-600 transition-colors shrink-0" />}
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default DailyQuestBoard;
