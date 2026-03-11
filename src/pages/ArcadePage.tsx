
import React, { useState, useMemo } from 'react';
import { Layers, Music, Hammer, Zap, Star, Calendar, ChevronDown, CheckCircle2, Lock, Mic } from 'lucide-react';
import { ViewState, WordGroup, WordItem } from '../types';
import { ALL_CARDS } from '../constants';
import audio from '../utils/AudioUtils';

interface GameInfo {
  id: ViewState;
  title: string;
  icon: any;
  color: string;
  xp: string;
}

interface ArcadePageProps {
  groups: WordGroup[];
  lastLearnedWords?: WordItem[];
  onSelectGame: (id: ViewState, words?: WordItem[]) => void;
  onClose: () => void;
}

const ArcadePage: React.FC<ArcadePageProps> = ({ groups, lastLearnedWords = [], onSelectGame, onClose }) => {
  const [showLevelSelector, setShowLevelSelector] = useState(false);
  const [selectedLevelId, setSelectedLevelId] = useState<number | null>(null);

  // Load progress for level selection
  const progress = useMemo(() => {
    const saved = localStorage.getItem('adventure_forest_progress');
    if (saved) return JSON.parse(saved);
    return { cardsPerDay: 5, completedLevels: [] };
  }, []);

  const levels = useMemo(() => {
    const generatedLevels = [];
    const { cardsPerDay, completedLevels } = progress;
    for (let i = 0; i < ALL_CARDS.length; i += cardsPerDay) {
      const levelId = Math.floor(i / cardsPerDay) + 1;
      const levelCards = ALL_CARDS.slice(i, i + cardsPerDay);
      const isUnlocked = levelId === 1 || completedLevels.includes(levelId - 1);
      if (isUnlocked) {
        generatedLevels.push({
          id: levelId,
          name: levelCards[0]?.levelName || `关卡 ${levelId}`,
          words: levelCards.flatMap(c => c.words),
          isCompleted: completedLevels.includes(levelId)
        });
      }
    }
    return generatedLevels;
  }, [progress]);

  const games: GameInfo[] = [
    { id: 'SCRAMBLE', title: '拼词大师', icon: <Zap />, color: 'bg-rose-500', xp: '+250' },
    { id: 'WHACK', title: '地鼠行动', icon: <Hammer />, color: 'bg-emerald-500', xp: '+180' },
    { id: 'BALLOON', title: '飞飞飞刀', icon: <Music />, color: 'bg-sky-500', xp: '+150' },
    { id: 'DUBBING', title: '魔法配音', icon: <Mic />, color: 'bg-indigo-500', xp: '+300' },
    { id: 'CHALLENGE', title: '勇者决斗', icon: <Zap />, color: 'bg-indigo-500', xp: '+200' },
    { id: 'SHEEP', title: '羊羊消消乐', icon: <Layers />, color: 'bg-emerald-500', xp: '+400' },
  ];

  const currentWords = useMemo(() => {
    if (selectedLevelId) {
      return levels.find(l => l.id === selectedLevelId)?.words || [];
    }
    return lastLearnedWords.length > 0 ? lastLearnedWords : groups.flatMap(g => g.words);
  }, [selectedLevelId, levels, lastLearnedWords, groups]);

  const displayText = selectedLevelId 
    ? `关卡 ${selectedLevelId} 的魔法` 
    : lastLearnedWords.length > 0 ? '刚刚学过的魔法' : '全部已解锁魔法';

  return (
    <div className="animate-in fade-in slide-in-from-bottom-5 duration-500 space-y-6 pb-20">
      <div className="text-center">
        <h2 className="text-2xl font-black text-slate-800 tracking-tight">魔法游乐园</h2>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Practice Makes Master</p>
      </div>

      {/* Level Selector Toggle */}
      <div className="relative">
        <button 
          onClick={() => setShowLevelSelector(!showLevelSelector)}
          className={`w-full p-4 rounded-3xl border-2 flex items-center justify-between transition-all ${selectedLevelId ? 'bg-indigo-50 border-indigo-200' : 'bg-amber-50 border-amber-100'}`}
        >
          <div className="flex items-center space-x-3">
            <div className={`${selectedLevelId ? 'bg-indigo-500' : 'bg-amber-500'} p-2 rounded-xl text-white`}>
              <Calendar size={18} />
            </div>
            <div className="text-left">
              <div className={`text-[10px] font-black uppercase tracking-widest ${selectedLevelId ? 'text-indigo-400' : 'text-amber-400'}`}>{displayText}</div>
              <div className={`font-black ${selectedLevelId ? 'text-indigo-700' : 'text-amber-700'}`}>{currentWords.length} 个单词</div>
            </div>
          </div>
          <ChevronDown className={`transition-transform ${showLevelSelector ? 'rotate-180' : ''}`} />
        </button>

        {showLevelSelector && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-3xl shadow-2xl border border-slate-100 z-50 max-h-60 overflow-y-auto p-2 grid grid-cols-2 gap-2 animate-in fade-in slide-in-from-top-2">
            <button 
              onClick={() => { setSelectedLevelId(null); setShowLevelSelector(false); }}
              className={`p-3 rounded-2xl text-xs font-bold text-left flex items-center justify-between ${!selectedLevelId ? 'bg-amber-100 text-amber-700' : 'bg-slate-50 text-slate-500'}`}
            >
              <span>默认词库</span>
              {!selectedLevelId && <CheckCircle2 size={14} />}
            </button>
            {levels.map(level => (
              <button 
                key={level.id}
                onClick={() => { setSelectedLevelId(level.id); setShowLevelSelector(false); }}
                className={`p-3 rounded-2xl text-xs font-bold text-left flex items-center justify-between ${selectedLevelId === level.id ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-50 text-slate-500'}`}
              >
                <span className="truncate">关卡 {level.id}: {level.name}</span>
                {selectedLevelId === level.id && <CheckCircle2 size={14} />}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3">
        {games.map(game => (
          <button
            key={game.id}
            onClick={() => { audio.playClick(); onSelectGame(game.id, currentWords); }}
            className="flex items-center p-4 bg-white rounded-3xl border border-slate-100 hover:border-indigo-200 transition-all active:scale-[0.98]"
          >
            <div className={`${game.color} w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-sm`}>
              {React.cloneElement(game.icon, { size: 24, strokeWidth: 2.5 })}
            </div>
            <div className="ml-4 flex-1 text-left">
              <h3 className="font-bold text-slate-800 text-sm">{game.title}</h3>
              <span className="text-[9px] font-bold text-indigo-500 uppercase tracking-tighter">{game.xp} XP REWARD</span>
            </div>
            <Star className="w-4 h-4 text-slate-200" />
          </button>
        ))}
      </div>

      <button onClick={onClose} className="w-full py-4 text-xs font-bold text-slate-400 hover:text-indigo-500 uppercase tracking-widest transition-colors">
        返回主页
      </button>
    </div>
  );
};

export default ArcadePage;
