
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

    const difficulties: ('PRIMARY' | 'INTERMEDIATE' | 'ADVANCED')[] = ['PRIMARY', 'INTERMEDIATE', 'ADVANCED'];
    
    for (const diff of difficulties) {
      let offset = 0;
      if (diff === 'INTERMEDIATE') offset = 100;
      if (diff === 'ADVANCED') offset = 200;

      const diffCards = ALL_CARDS.filter(c => (c.difficulty || 'PRIMARY') === diff);
      
      for (let i = 0; i < diffCards.length; i += cardsPerDay) {
        const relativeId = Math.floor(i / cardsPerDay) + 1;
        const levelId = offset + relativeId;
        const levelCards = diffCards.slice(i, i + cardsPerDay);
        
        // A level is unlocked if it's the first level of any difficulty, or if the previous level is completed.
        const isUnlocked = relativeId === 1 || completedLevels.includes(levelId - 1) || completedLevels.includes(levelId);
        
        const schedule = stats.reviewSchedules?.[levelId.toString()];
        const isDue = schedule && now >= schedule.nextReviewAt;

        if (isUnlocked) {
          const difficultyLabel = diff === 'PRIMARY' ? '初级' : diff === 'INTERMEDIATE' ? '中级' : '高级';
          generatedLevels.push({
            id: levelId,
            displayId: relativeId,
            name: `[${difficultyLabel}] ${levelCards[0]?.levelName || `第 ${relativeId} 关`}`,
            words: levelCards.flatMap(c => c.words),
            isCompleted: completedLevels.includes(levelId),
            isDue
          });
        }
      }
    }
    return generatedLevels;
  }, [progress, stats.reviewSchedules]);

  const games: GameInfo[] = [
    { id: 'PLANTS', title: '植物守卫战', icon: <Zap />, color: 'bg-emerald-600', xp: '+450', description: '召唤绿植词灵射手，击退单词僵尸！', category: 'ARCADE' },
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

  const targetLevel = levels.find(l => l.id === selectedLevelId);
  const displayText = selectedLevelId === 0
    ? '待复习的魔法'
    : selectedLevelId 
      ? `${targetLevel?.name || `关卡 ${selectedLevelId}`} 的魔法` 
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
                          {(level as any).displayId || level.id}
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

      {/* 3D Magical Winding Road Map Container */}
      <div className="relative px-2 py-4 space-y-4">
        {/* Decorative Map Title */}
        <div className="text-center pb-2">
          <span className="text-[10px] font-black text-emerald-600/60 uppercase tracking-[0.2em] bg-emerald-50 border border-emerald-100/60 px-3 py-1 rounded-full animate-pulse select-none">
            ✨ 点击关卡小岛，开始单词特训魔法仪式 ✨
          </span>
        </div>

        {games.map((game, idx) => {
          const mapLayouts = [
            { align: 'justify-start', decor: 'right-[4%] top-4', decorIcon: '🌲' },
            { align: 'justify-center', decor: 'left-[10%] top-2', decorIcon: '🍄' },
            { align: 'justify-end', decor: 'left-[4%] top-5', decorIcon: '☁️' },
            { align: 'justify-center', decor: 'right-[12%] top-3 animate-pulse', decorIcon: '🦋' },
            { align: 'justify-start', decor: 'right-[8%] top-1 rotate-12', decorIcon: '🌺' },
            { align: 'justify-center', decor: 'left-[15%] top-4 animate-bounce', decorIcon: '🎁' },
            { align: 'justify-end', decor: 'left-[6%] top-2', decorIcon: '🧙⭐' },
          ];

          const gameMapEmojis: Record<string, string> = {
            PLANTS: '🧟',
            SHEEP: '🐑',
            SPELLING: '🐝',
            SCRAMBLE: '🌀',
            WHACK: '🐹',
            BALLOON: '🎈',
            DUBBING: '🎙️',
            CHALLENGE: '⚔️'
          };

          const layout = mapLayouts[idx % mapLayouts.length];
          const emoji = gameMapEmojis[game.id] || '🎮';
          
          return (
            <div key={game.id} className="relative z-10 flex flex-col items-center">
              {/* Outer Alignment Box */}
              <div className={`w-full flex ${layout.align} items-center relative py-1`}>
                
                {/* Visual Scenic Decoration Floating on empty spaces */}
                <span className={`absolute ${layout.decor} text-3xl select-none pointer-events-none filter drop-shadow-md transition-all duration-300 z-0`}>
                  {layout.decorIcon}
                </span>

                {/* Magical Stage Button/Island Card */}
                <motion.button
                  initial={{ opacity: 0, scale: 0.9, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: idx * 0.08 + 0.1, type: 'spring', stiffness: 100 }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => { audio.playClick(); onSelectGame(game.id, currentWords); }}
                  className="w-[85%] bg-white rounded-[32px] p-4 border-2 border-slate-100 hover:border-emerald-200 transition-all shadow-[0_12px_24px_rgba(16,185,129,0.05)] hover:shadow-[0_20px_40px_rgba(16,185,129,0.12)] flex items-center relative overflow-hidden text-left border-b-[6px] border-b-slate-200 cursor-pointer active:border-b-2 active:translate-y-1"
                >
                  {/* Glowing Mini Platform Base under Emoji */}
                  <div className={`w-14 h-14 rounded-2xl ${game.color} bg-gradient-to-br flex items-center justify-center text-white shrink-0 shadow-lg border-2 border-white/40 group-hover:rotate-6 transition-transform relative z-10`}>
                    <span className="text-3xl filter drop-shadow-sm">{emoji}</span>
                    
                    {/* Stage Number Badge */}
                    <div className="absolute -top-3.5 -left-3.5 bg-amber-400 text-amber-950 font-black text-[9px] px-2 py-0.5 rounded-full border border-white shadow-md uppercase tracking-wider scale-90">
                      S.{idx + 1}
                    </div>
                  </div>

                  <div className="ml-4 flex-1 pr-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className="font-extrabold text-[#064e3b] text-[15px] tracking-tight">{game.title}</h3>
                      <span className="bg-amber-100 text-amber-700 font-extrabold px-1.5 py-0.5 rounded-md text-[8.5px]">
                        {game.xp} XP
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 line-clamp-1 font-bold leading-normal uppercase select-none">{game.description}</p>
                  </div>

                  <div className="w-8 h-8 rounded-full bg-slate-50 hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 flex items-center justify-center shrink-0">
                    <ArrowRight size={16} />
                  </div>
                </motion.button>
              </div>

              {/* Dotted Pathway Footprints Segment in between nodes */}
              {idx < games.length - 1 && (
                <div className="py-2 flex items-center justify-center w-full relative h-7 select-none">
                  <motion.div 
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ repeat: Infinity, duration: 2, delay: idx * 0.3 }}
                    className="flex items-center gap-2.5 text-slate-300 font-extrabold text-sm"
                  >
                    <span>🐾</span>
                    <span>•</span>
                    <span>•</span>
                    <span>🐾</span>
                  </motion.div>
                </div>
              )}
            </div>
          );
        })}
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
