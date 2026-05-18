
import React, { useState, useMemo } from 'react';
import { Layers, Music, Hammer, Zap, Star, Calendar, ChevronDown, CheckCircle2, Mic, Gamepad2, ArrowRight, RefreshCw, ChevronLeft, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ViewState, WordGroup, WordItem, UserStats } from '../types';
import { ALL_CARDS } from '../constants';
import audio from '../utils/AudioUtils';

interface GameInfo {
  id: ViewState;
  title: string;
  icon: any;
  color: string;
  xp: string;
  description: string;
  category: 'CHALLENGE' | 'ARCADE';
}

interface ArcadePageProps {
  groups: WordGroup[];
  stats: UserStats;
  lastLearnedWords?: WordItem[];
  onSelectGame: (id: ViewState, words?: WordItem[]) => void;
  onClose: () => void;
}

const ArcadePage: React.FC<ArcadePageProps> = ({ groups, stats, lastLearnedWords = [], onSelectGame, onClose }) => {
  const [showLevelSelector, setShowLevelSelector] = useState(false);
  const [selectedLevelId, setSelectedLevelId] = useState<number | null>(null);

  // Load progress for level selection
  const progress = useMemo(() => {
    return {
      cardsPerDay: stats.cardsPerDay || 5,
      completedLevels: stats.completedLevelIds || []
    };
  }, [stats.cardsPerDay, stats.completedLevelIds]);

  const levels = useMemo(() => {
    const generatedLevels = [];
    const { cardsPerDay, completedLevels } = progress;
    const now = Date.now();

    for (let i = 0; i < ALL_CARDS.length; i += cardsPerDay) {
      const levelId = Math.floor(i / cardsPerDay) + 1;
      const levelCards = ALL_CARDS.slice(i, i + cardsPerDay);
      const isUnlocked = levelId === 1 || completedLevels.includes(levelId - 1);
      
      const schedule = stats.reviewSchedules?.[levelId.toString()];
      const isDue = schedule && now >= schedule.nextReviewAt;

      if (isUnlocked) {
        generatedLevels.push({
          id: levelId,
          name: levelCards[0]?.levelName || `关卡 ${levelId}`,
          words: levelCards.flatMap(c => c.words),
          isCompleted: completedLevels.includes(levelId),
          isDue
        });
      }
    }
    return generatedLevels;
  }, [progress, stats.reviewSchedules]);

  const games: GameInfo[] = [
    { id: 'SHEEP', title: '羊羊消消乐', icon: <Layers />, color: 'bg-emerald-500', xp: '+400', description: '消除3个相同魔法，清空法阵！', category: 'ARCADE' },
    { id: 'SPELLING', title: '单词拼写蜂', icon: <Sparkles />, color: 'bg-amber-500', xp: '+350', description: '听音辨词，像勤劳的蜜蜂一样拼写。', category: 'CHALLENGE' },
    { id: 'SCRAMBLE', title: '拼词大师', icon: <Zap />, color: 'bg-rose-500', xp: '+250', description: '释放字母能量，拼出正确的咒语。', category: 'CHALLENGE' },
    { id: 'WHACK', title: '地鼠行动', icon: <Hammer />, color: 'bg-orange-500', xp: '+180', description: '快！打掉那些淘气的魔法地鼠。', category: 'ARCADE' },
    { id: 'BALLOON', title: '飞飞飞刀', icon: <Music />, color: 'bg-teal-500', xp: '+150', description: '精准投掷魔力飞刀，刺破单词气球。', category: 'ARCADE' },
    { id: 'DUBBING', title: '魔法配音', icon: <Mic />, color: 'bg-emerald-600', xp: '+300', description: '用魔法声音重复你的单词咒语。', category: 'CHALLENGE' },
    { id: 'CHALLENGE', title: '森林对决', icon: <Zap />, color: 'bg-green-700', xp: '+200', description: '最极致的单词对决，测试你的反应。', category: 'CHALLENGE' },
  ];

  const dueLevels = useMemo(() => levels.filter(l => l.isDue), [levels]);
  const dueWords = useMemo(() => dueLevels.flatMap(l => l.words), [dueLevels]);

  const currentWords = useMemo(() => {
    if (selectedLevelId === 0 && dueWords.length > 0) return dueWords; // 0 for SRS filter
    if (selectedLevelId) {
      return levels.find(l => l.id === selectedLevelId)?.words || [];
    }
    const learnedGroups = groups.filter(g => g.learned);
    if (lastLearnedWords.length > 0) return lastLearnedWords;
    if (learnedGroups.length > 0) return learnedGroups.flatMap(g => g.words);
    return groups.flatMap(g => g.words);
  }, [selectedLevelId, levels, lastLearnedWords, groups, dueWords]);

  const displayText = selectedLevelId === 0
    ? '待复习的魔法'
    : selectedLevelId 
      ? `关卡 ${selectedLevelId} 的魔法` 
      : lastLearnedWords.length > 0 ? '刚刚学过的魔法' : '全部已解锁魔法';

  return (
    <div className="space-y-8 pb-32 max-w-md mx-auto">
      <header className="text-center space-y-3 relative pt-4">
        <button 
          onClick={onClose}
          className="absolute left-0 top-4 p-3 bg-white hover:bg-emerald-50 rounded-2xl shadow-xl shadow-emerald-200/50 border-2 border-emerald-100 transition-all text-emerald-700 active:scale-90"
        >
          <ChevronLeft size={20} />
        </button>
        <div className="inline-flex items-center px-4 py-1.5 bg-emerald-500 text-white rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-2 shadow-lg shadow-emerald-100">
          <Gamepad2 size={12} className="mr-2" />
          Forest Arcade
        </div>
        <h2 className="text-5xl font-black text-emerald-950 tracking-tighter">森林奇乐园</h2>
        <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-widest leading-loose">Choose your forest challenge</p>
      </header>

      {/* Level Selector Toggle */}
      <div className="relative z-[60]">
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => { audio.playClick(); setShowLevelSelector(!showLevelSelector); }}
          className={`w-full p-6 rounded-[32px] border-b-[8px] transition-all flex items-center justify-between group shadow-2xl ${
            selectedLevelId 
              ? 'bg-gradient-to-br from-indigo-500 to-blue-700 border-indigo-800 text-white shadow-indigo-200' 
              : 'bg-white border-slate-100 text-slate-800 shadow-slate-100/50'
          }`}
        >
          <div className="flex items-center space-x-4">
            <div className={`p-3.5 rounded-2xl shadow-sm ${selectedLevelId ? 'bg-white/20' : 'bg-indigo-50 text-indigo-500'}`}>
              <Calendar size={20} />
            </div>
            <div className="text-left">
              <div className={`text-[10px] font-black uppercase tracking-widest mb-0.5 ${selectedLevelId ? 'text-indigo-100' : 'text-slate-400'}`}>{displayText}</div>
              <div className={`text-xl font-black tracking-tight ${selectedLevelId ? 'text-white' : 'text-slate-800'}`}>{currentWords.length} <span className="text-sm opacity-60">MAGICAL WORDS</span></div>
            </div>
          </div>
          <motion.div
            animate={{ rotate: showLevelSelector ? 180 : 0 }}
            className={selectedLevelId ? 'text-white' : 'text-indigo-500'}
          >
            <ChevronDown size={24} />
          </motion.div>
        </motion.button>

        <AnimatePresence>
          {showLevelSelector && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[-1]"
                onClick={() => setShowLevelSelector(false)}
              />
              <motion.div 
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                className="absolute top-full left-0 right-0 mt-4 bg-white rounded-[40px] shadow-[0_40px_80px_-24px_rgba(0,0,0,0.2)] border-2 border-slate-50 z-50 p-4 max-h-[400px] overflow-y-scroll scrollbar-hide"
              >
                <div className="grid grid-cols-1 gap-3">
                  <button 
                    onClick={() => { setSelectedLevelId(null); setShowLevelSelector(false); audio.playClick(); }}
                    className={`p-5 rounded-[24px] text-sm font-black text-left flex items-center justify-between group transition-all border-2 ${selectedLevelId === null ? 'bg-indigo-500 border-indigo-600 text-white shadow-lg' : 'bg-slate-50 border-transparent text-slate-600 hover:bg-slate-100'}`}
                  >
                    <div className="flex items-center space-x-3">
                      <Star size={18} className={selectedLevelId === null ? 'text-amber-300' : 'text-slate-300'} />
                      <span>默认全库 (All Magic)</span>
                    </div>
                    {selectedLevelId === null && <CheckCircle2 size={18} />}
                  </button>

                  {dueWords.length > 0 && (
                    <button 
                      onClick={() => { setSelectedLevelId(0); setShowLevelSelector(false); audio.playClick(); }}
                      className={`p-5 rounded-[24px] text-sm font-black text-left flex items-center justify-between group transition-all border-2 ${selectedLevelId === 0 ? 'bg-rose-500 border-rose-600 text-white shadow-lg' : 'bg-rose-50 border-rose-100/50 text-rose-500 hover:bg-rose-100'}`}
                    >
                      <div className="flex items-center space-x-3">
                        <RefreshCw size={18} className={selectedLevelId === 0 ? 'text-white' : 'text-rose-500'} />
                        <span>急需复习 (Review) · {dueWords.length}</span>
                      </div>
                      {selectedLevelId === 0 && <CheckCircle2 size={18} />}
                    </button>
                  )}
                  
                  <div className="h-px bg-slate-100 my-2 mx-4" />
                  {levels.map(level => (
                    <button 
                      key={level.id}
                      onClick={() => { setSelectedLevelId(level.id); setShowLevelSelector(false); audio.playClick(); }}
                      className={`p-5 rounded-[24px] text-sm font-black text-left flex items-center justify-between transition-all border-2 ${selectedLevelId === level.id ? 'bg-indigo-500 border-indigo-600 text-white shadow-lg' : 'bg-slate-50 border-transparent text-slate-600 hover:bg-slate-100'}`}
                    >
                      <div className="flex items-center space-x-4 text-left">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs shadow-sm ${selectedLevelId === level.id ? 'bg-indigo-400' : 'bg-white text-slate-500'}`}>
                          {level.id}
                        </div>
                        <span className="truncate max-w-[180px] tracking-tight">{level.name}</span>
                      </div>
                      {selectedLevelId === level.id ? <CheckCircle2 size={18} /> : level.isCompleted && <CheckCircle2 size={16} className="text-emerald-400" />}
                    </button>
                  ))}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      <div className="grid grid-cols-1 gap-5">
        {games.map((game, idx) => (
          <motion.button
            key={game.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 + 0.2 }}
            whileHover={{ scale: 1.02, x: 8 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => { audio.playClick(); onSelectGame(game.id, currentWords); }}
            className="group flex items-center p-6 bg-white rounded-[40px] border-2 border-slate-50 hover:border-indigo-100 transition-all shadow-[0_15px_30px_-10px_rgba(0,0,0,0.05)] relative overflow-hidden"
          >
            <div className={`absolute top-0 right-0 w-32 h-32 ${game.color} opacity-[0.04] rounded-full -mr-16 -mt-16 group-hover:scale-125 transition-transform duration-700`} />
            
            <div className={`${game.color} w-20 h-20 rounded-[32px] flex items-center justify-center text-white shadow-2xl ${game.color.replace('bg-', 'shadow-')}/20 shrink-0 group-hover:rotate-6 transition-transform border-4 border-white/20`}>
              {React.cloneElement(game.icon, { size: 36, strokeWidth: 2.5 })}
            </div>
            
            <div className="ml-6 flex-1 text-left">
              <div className="flex items-center space-x-2 mb-1.5">
                <h3 className="font-black text-slate-950 text-xl tracking-tight">{game.title}</h3>
                <div className="bg-amber-100 px-2.5 py-1 rounded-full text-[10px] font-black text-amber-600 uppercase flex items-center border border-amber-200">
                  <Star size={10} className="mr-1 fill-amber-600" />
                  {game.xp} XP
                </div>
              </div>
              <p className="text-[11px] font-bold text-slate-400 line-clamp-1 uppercase tracking-wider">{game.description}</p>
            </div>
            
            <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all group-hover:rotate-45">
              <ArrowRight size={24} />
            </div>
          </motion.button>
        ))}
      </div>

      <button 
        onClick={onClose} 
        className="w-full py-6 text-sm font-black text-slate-400 hover:text-indigo-500 uppercase tracking-widest transition-colors flex items-center justify-center space-x-2"
      >
        <span>返回主页</span>
      </button>
    </div>
  );
};

export default ArcadePage;
