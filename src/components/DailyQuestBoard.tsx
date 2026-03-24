
import React from 'react';
import { DailyQuest, ViewState } from '../types';
import { CheckCircle2, Swords, BookOpen, Gamepad2, ChevronRight, Sparkles } from 'lucide-react';

interface Props {
  quests: DailyQuest[];
  onQuestClick: (target: ViewState, isReview?: boolean) => void;
}

const DailyQuestBoard: React.FC<Props> = ({ quests = [], onQuestClick }) => {
  const safeQuests = quests || [];
  return (
    <div className="glass-pill rounded-[36px] p-6 shadow-xl border-indigo-50/50">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center">
            今日勇者任务 <Sparkles size={10} className="ml-1 text-amber-400" />
        </h3>
        <div className="text-[10px] font-black text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full">
           {safeQuests.filter(q => q.completed).length}/{safeQuests.length} DONE
        </div>
      </div>
      
      <div className="space-y-3">
        {safeQuests.map((quest, index) => {
          const colors = index === 0 ? 'rose' : index === 1 ? 'indigo' : 'emerald';
          return (
            <button 
              key={quest.id} 
              disabled={quest.completed}
              onClick={() => onQuestClick(quest.targetView, quest.isReviewType)}
              className={`w-full flex items-center p-4 rounded-3xl border-2 transition-all relative overflow-hidden group ${
                quest.completed 
                ? 'bg-slate-50 border-slate-100 opacity-60' 
                : `bg-white border-white hover:border-${colors}-100 hover:shadow-lg active:scale-95`
              }`}
            >
              <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${
                quest.completed ? 'bg-emerald-500 text-white' : `bg-${colors}-50 text-${colors}-500`
              }`}>
                {quest.completed ? <CheckCircle2 size={22} strokeWidth={3} /> : 
                 index === 0 ? <BookOpen size={20} /> : 
                 index === 1 ? <Swords size={20} /> : <Gamepad2 size={20} />}
              </div>
              <div className="ml-4 flex-1 text-left">
                <div className={`text-sm font-black transition-colors ${quest.completed ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                    {quest.label}
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full mt-2 overflow-hidden border border-white">
                  <div 
                    className={`h-full transition-all duration-1000 ${quest.completed ? 'bg-emerald-400' : `bg-${colors}-400`}`} 
                    style={{ width: `${(quest.current / quest.target) * 100}%` }} 
                  />
                </div>
              </div>
              {!quest.completed && <ChevronRight size={16} className="text-slate-300 ml-2 group-hover:text-indigo-400 transition-colors" />}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default DailyQuestBoard;
