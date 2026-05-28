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
    <div className="bg-gradient-to-b from-white via-[#f3fbf6] to-[#ecfdf3] backdrop-blur-md rounded-[28px] p-4.5 border-2 border-emerald-250 mb-4 relative overflow-hidden shadow-sm">
      {/* Light bubbles decorative backdrop */}
      <div className="absolute -top-12 -right-12 w-28 h-28 bg-emerald-100/40 rounded-full blur-xl pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-amber-100/50 rounded-full blur-xl pointer-events-none" />
      
      <div className="flex items-center justify-between mb-4 border-b border-emerald-200/60 pb-3">
        <div className="flex items-center space-x-2 relative z-10">
          <span className="text-2xl select-none animate-bounce block">📜</span>
          <h3 className="text-base sm:text-[17.5px] font-black text-emerald-900 tracking-wide flex items-center gap-1.5">
            <span>森林魔法书 · 今日奥术任务</span>
            <Sparkles size={15} className="text-amber-500 animate-pulse shrink-0" />
          </h3>
        </div>
        <div className="text-xs sm:text-[13px] font-black text-emerald-800 bg-white border border-emerald-250 shadow-sm px-3.5 py-1.2 rounded-full select-none tracking-wider relative z-10">
           任务完成 {safeQuests.filter(q => q.completed).length} / {safeQuests.length} 🔑
         </div>
      </div>
      
      <div className="space-y-2.5 relative z-10">
        {safeQuests.map((quest, index) => {
          const style = getStyle(quest.id);
          return (
            <motion.button 
              key={quest.id} 
              whileHover={quest.completed ? {} : { scale: 1.015, y: -0.5 }}
              whileTap={quest.completed ? {} : { scale: 0.985 }}
              onClick={() => onQuestClick(quest.targetView, quest.isReviewType, quest.levelId)}
              className={`w-full flex flex-col p-3.5 rounded-2xl border transition-all relative overflow-hidden text-left cursor-pointer ${
                quest.completed 
                ? 'bg-emerald-50/50 border-emerald-250/50 opacity-60 text-emerald-600' 
                : `${style.bg} border-2 shadow-sm hover:shadow-md`
              }`}
            >
              <div className="flex items-center w-full justify-between">
                <div className="flex items-center space-x-3.5">
                  <div className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center shadow-sm ${
                    quest.completed ? 'bg-emerald-200 text-emerald-800 border border-emerald-300' : style.accent
                  }`}>
                    {quest.completed ? <CheckCircle2 size={15} strokeWidth={3} /> : 
                     quest.id === 'q1' ? <BookOpen size={15} strokeWidth={2.5} /> : 
                     quest.id === 'q2' ? <Swords size={15} strokeWidth={2.5} /> : <Gamepad2 size={15} strokeWidth={2.5} />}
                  </div>
                  
                  <div>
                    <div className={`text-base sm:text-[17.5px] font-black tracking-wide leading-tight ${quest.completed ? 'text-emerald-500/80 line-through' : style.text}`}>
                      {quest.label}
                    </div>
                    <div className={`text-xs sm:text-[14px] font-bold mt-1.5 ${quest.completed ? 'text-emerald-500/70' : 'text-emerald-700/75'}`}>
                      {quest.completed ? '✨ 魔法已完美修成！' : quest.id === 'q1' ? '闯关深林密境，收获亮闪闪金币' : quest.id === 'q2' ? '和小萌兽快乐拼字斗法' : '战胜忘却，淬炼核心拼音魔法'}
                    </div>
                  </div>
                </div>

                {!quest.completed && <ChevronRight size={15} className="text-emerald-400 group-hover:text-emerald-600 transition-colors shrink-0" />}
              </div>

              {/* Polished progress segment */}
              <div className="w-full mt-3">
                <div className="flex justify-between items-center text-xs sm:text-[13px] font-black uppercase mb-1" style={{ color: quest.completed ? '#10b981' : '#047857' }}>
                  <span>魔法潜能开发度</span>
                  <span className="font-extrabold">{quest.completed ? '100% 已连通' : `${quest.current} / ${quest.target}`}</span>
                </div>
                <div className="w-full h-1.5 bg-emerald-100 border border-emerald-250/30 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(quest.current / quest.target) * 100}%` }}
                    className={`h-full rounded-full ${quest.completed ? 'bg-emerald-500' : style.bar}`} 
                  />
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default DailyQuestBoard;
