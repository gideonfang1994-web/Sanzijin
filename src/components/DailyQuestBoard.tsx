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
  
  // Magical forest styling with deep moss, enchanted teal, and ancient amber elements
  const questStyles: Record<string, { bg: string, text: string, bar: string, accent: string }> = {
    q1: {
      bg: 'bg-emerald-950/40 border-emerald-500/20 hover:bg-emerald-900/50 hover:border-emerald-400/40',
      text: 'text-emerald-100',
      bar: 'bg-gradient-to-r from-emerald-400 to-teal-400 shadow-[0_0_10px_rgba(52,211,153,0.4)]',
      accent: 'bg-emerald-900/40 border border-emerald-500/30 text-emerald-300',
    },
    q2: {
      bg: 'bg-teal-900/30 border-teal-500/20 hover:bg-teal-900/50 hover:border-teal-400/40',
      text: 'text-teal-100',
      bar: 'bg-gradient-to-r from-teal-400 to-emerald-400 shadow-[0_0_10px_rgba(45,212,191,0.4)]',
      accent: 'bg-teal-900/40 border border-teal-500/30 text-teal-300',
    },
    q3: {
      bg: 'bg-amber-950/30 border-amber-500/20 hover:bg-amber-900/40 hover:border-amber-400/40',
      text: 'text-amber-100',
      bar: 'bg-gradient-to-r from-amber-400 to-yellow-300 shadow-[0_0_10px_rgba(245,158,11,0.4)]',
      accent: 'bg-amber-900/30 border border-amber-500/30 text-amber-300',
    }
  };

  const getStyle = (id: string) => {
    return questStyles[id] || questStyles.q1;
  };

  return (
    <div className="bg-gradient-to-b from-teal-950/90 to-[#022c22]/90 backdrop-blur-md rounded-[28px] p-5 shadow-[0_12px_45px_0_rgba(2,44,34,0.6)] border-2 border-emerald-500/30 mb-6 relative overflow-hidden">
      {/* Runes accent element */}
      <div className="absolute top-0 right-0 p-8 select-none opacity-[0.02] text-white font-mono text-8xl pointer-events-none">
        ᛟ ᛉ ᛗ
      </div>
      
      <div className="flex items-center justify-between mb-4 border-b border-emerald-500/10 pb-3">
        <div className="flex items-center space-x-2">
          <span className="text-lg select-none">🧙‍♂️</span>
          <h3 className="text-xs font-black text-emerald-300 tracking-wider flex items-center gap-1 uppercase">
            森林魔法书 · 今日奥术任务
            <Sparkles size={11} className="text-[#fcd34d] animate-pulse" />
          </h3>
        </div>
        <div className="text-[9px] font-black text-emerald-300 bg-emerald-950/80 border border-emerald-500/40 px-2.5 py-1 rounded-full select-none shadow-inner tracking-widest">
           {safeQuests.filter(q => q.completed).length} / {safeQuests.length} 已解封
         </div>
      </div>
      
      <div className="space-y-3.5">
        {safeQuests.map((quest, index) => {
          const style = getStyle(quest.id);
          return (
            <motion.button 
              key={quest.id} 
              whileHover={quest.completed ? {} : { scale: 1.015 }}
              whileTap={quest.completed ? {} : { scale: 0.985 }}
              onClick={() => onQuestClick(quest.targetView, quest.isReviewType, quest.levelId)}
              className={`w-full flex flex-col p-3.5 rounded-xl border transition-all relative overflow-hidden text-left cursor-pointer ${
                quest.completed 
                ? 'bg-emerald-950/10 border-emerald-950/40 opacity-40 text-emerald-500' 
                : `${style.bg} hover:shadow-[0_4px_16px_rgba(16,185,129,0.1)]`
              }`}
            >
              <div className="flex items-center w-full justify-between">
                <div className="flex items-center space-x-3.5">
                  <div className={`shrink-0 w-10 h-10 rounded-lg flex items-center justify-center shadow-md ${
                    quest.completed ? 'bg-emerald-800 text-emerald-200 border border-emerald-600' : style.accent
                  }`}>
                    {quest.completed ? <CheckCircle2 size={16} strokeWidth={3} /> : 
                     quest.id === 'q1' ? <BookOpen size={16} strokeWidth={2.5} /> : 
                     quest.id === 'q2' ? <Swords size={16} strokeWidth={2.5} /> : <Gamepad2 size={16} strokeWidth={2.5} />}
                  </div>
                  
                  <div>
                    <div className={`text-xs font-extrabold tracking-wide leading-tight ${quest.completed ? 'text-emerald-700 line-through' : 'text-emerald-100'}`}>
                      {quest.label}
                    </div>
                    <div className="text-[9px] font-bold text-emerald-400/70 mt-0.5">
                      {quest.completed ? '本魔法已完美筑基！' : quest.id === 'q1' ? '穿越森林密境，收割新符文' : quest.id === 'q2' ? '斗法演武场，激发敏捷奥术勋章' : '抗遗忘太古磨砺，重铸咒语锁链'}
                    </div>
                  </div>
                </div>

                {!quest.completed && <ChevronRight size={13} className="text-emerald-500/50 group-hover:text-emerald-400 transition-colors" />}
              </div>

              {/* Polished progress segment */}
              <div className="w-full mt-2.5">
                <div className="flex justify-between items-center text-[8px] font-bold text-emerald-400/50 uppercase mb-0.5">
                  <span>奥术同调值</span>
                  <span className="font-extrabold">{quest.completed ? '已同调 100%' : `${quest.current} / ${quest.target}`}</span>
                </div>
                <div className="w-full h-1 bg-emerald-950/50 border border-emerald-500/10 rounded-full overflow-hidden">
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
