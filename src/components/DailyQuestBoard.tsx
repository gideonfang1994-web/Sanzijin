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
  
  // Static Tailwind class mappings to ensure total styling robustness with clean, polished pastel colors
  const questStyles: Record<string, { bg: string, text: string, bar: string, accent: string }> = {
    q1: {
      bg: 'bg-rose-50/50 border-rose-100/50 hover:bg-rose-50 hover:border-rose-200',
      text: 'text-rose-600',
      bar: 'bg-rose-500',
      accent: 'bg-rose-100/60 text-rose-600',
    },
    q2: {
      bg: 'bg-violet-50/50 border-violet-100/50 hover:bg-violet-50 hover:border-violet-200',
      text: 'text-violet-600',
      bar: 'bg-violet-500',
      accent: 'bg-violet-100/60 text-violet-600',
    },
    q3: {
      bg: 'bg-teal-50/50 border-teal-100/50 hover:bg-teal-50 hover:border-teal-200',
      text: 'text-teal-600',
      bar: 'bg-teal-500',
      accent: 'bg-teal-100/60 text-teal-600',
    }
  };

  const getStyle = (id: string) => {
    return questStyles[id] || questStyles.q1;
  };

  return (
    <div className="bg-white rounded-[32px] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.02)] border-[2.5px] border-slate-100/80 mb-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center space-x-2">
          <span className="text-base select-none">🧙‍♂️</span>
          <h3 className="text-sm font-black text-slate-700 tracking-tight flex items-center">
            今日勇者学术任务
            <Sparkles size={11} className="ml-1 text-amber-400 animate-pulse animate-duration-1000" />
          </h3>
        </div>
        <div className="text-[10px] font-black text-indigo-600 bg-indigo-50 border border-indigo-100/60 px-3 py-1 rounded-full select-none">
           {safeQuests.filter(q => q.completed).length} / {safeQuests.length} DONE
        </div>
      </div>
      
      <div className="space-y-4">
        {safeQuests.map((quest, index) => {
          const style = getStyle(quest.id);
          return (
            <motion.button 
              key={quest.id} 
              whileHover={quest.completed ? {} : { scale: 1.01 }}
              whileTap={quest.completed ? {} : { scale: 0.99 }}
              onClick={() => onQuestClick(quest.targetView, quest.isReviewType, quest.levelId)}
              className={`w-full flex flex-col p-4 rounded-2xl border-2 transition-all relative overflow-hidden text-left cursor-pointer ${
                quest.completed 
                ? 'bg-slate-50/80 border-slate-100/80 opacity-60' 
                : `${style.bg} border-transparent hover:shadow-md`
              }`}
            >
              <div className="flex items-center w-full justify-between">
                <div className="flex items-center space-x-3.5">
                  <div className={`shrink-0 w-11 h-11 rounded-xl flex items-center justify-center shadow-inner ${
                    quest.completed ? 'bg-emerald-500 text-white' : style.accent
                  }`}>
                    {quest.completed ? <CheckCircle2 size={18} strokeWidth={3} /> : 
                     quest.id === 'q1' ? <BookOpen size={18} strokeWidth={2.5} /> : 
                     quest.id === 'q2' ? <Swords size={18} strokeWidth={2.5} /> : <Gamepad2 size={18} strokeWidth={2.5} />}
                  </div>
                  
                  <div>
                    <div className={`text-xs font-black tracking-wide leading-tight uppercase ${quest.completed ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                      {quest.label}
                    </div>
                    <div className="text-[9px] font-extrabold text-slate-400 mt-0.5">
                      {quest.completed ? '任务已圆满完成！' : quest.id === 'q1' ? '点击直接穿越至新魔法关卡' : quest.id === 'q2' ? '挑战游乐园并收获游戏大捷' : '记忆重淬与抗遗忘复习'}
                    </div>
                  </div>
                </div>

                {!quest.completed && <ChevronRight size={14} className="text-slate-300 group-hover:text-slate-500 transition-colors" />}
              </div>

              {/* Polished progress segment */}
              <div className="w-full mt-3">
                <div className="flex justify-between items-center text-[8px] font-black text-slate-400/80 uppercase mb-1">
                  <span>进化状态</span>
                  <span>{quest.completed ? '100%' : `${quest.current} / ${quest.target}`}</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100/90 border border-white/50 rounded-full overflow-hidden">
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
