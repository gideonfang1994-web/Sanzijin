
import React, { useState, useMemo } from 'react';
import { Layers, Music, Hammer, Zap, Star, Calendar, ChevronDown, CheckCircle2, Mic, Gamepad2, ArrowRight, RefreshCw, ChevronLeft, Sparkles, Coffee, Smile } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ViewState, WordGroup, WordItem, UserStats } from '../types';
import { ALL_CARDS } from '../constants';
import audio from '../utils/AudioUtils';
import { getVocabularyErrors } from '../utils/errorBookUtils';

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
  lastLearnedLevelId?: number | null;
  onSelectGame: (id: ViewState, words?: WordItem[]) => void;
  onClose: () => void;
}

const ArcadePage: React.FC<ArcadePageProps> = ({ groups, stats, lastLearnedWords = [], lastLearnedLevelId, onSelectGame, onClose }) => {
  const [showLevelSelector, setShowLevelSelector] = useState(false);
  const [selectedLevelId, setSelectedLevelId] = useState<number | null>(lastLearnedLevelId || null);

  React.useEffect(() => {
    if (lastLearnedLevelId !== undefined && lastLearnedLevelId !== null) {
      setSelectedLevelId(lastLearnedLevelId);
    }
  }, [lastLearnedLevelId]);

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
    { id: 'LETTER_LINK', title: '大小写字母连连看', icon: <Sparkles />, color: 'bg-indigo-500', xp: '+185', description: '配对连线认字母！拉出彩色流光线条，将大写字母与正确的小写字母连接到一起，解锁好玩字母百科！', category: 'ARCADE' },
    { id: 'CLAW', title: '神奇抓娃娃机', icon: <Gamepad2 />, color: 'bg-fuchsia-500', xp: '+350', description: '控制悬臂机械夹爪！听准英文单词语音，在堆积如山的可可爱爱玩偶中抓起正确翻译！', category: 'ARCADE' },
    { id: 'MARIO', title: '马里奥拼词造句', icon: <Gamepad2 />, color: 'bg-red-500', xp: '+500', description: '化身马里奥跳跃撞击！顶碎拼写、词义与整排整句Token，获取巨额金币与经验红利！', category: 'ARCADE' },
    { id: 'SCRAMBLE', title: '拼词大师', icon: <Zap />, color: 'bg-rose-500', xp: '+250', description: '释放字母能量，拼出正确的咒语。', category: 'CHALLENGE' },
    { id: 'HAMSTER', title: '疯狂打地鼠', icon: <Hammer />, color: 'bg-amber-500', xp: '+380', description: '仓鼠背着翻译牌出洞！看准正确翻译，一气呵成锤击它！', category: 'ARCADE' },
    { id: 'FISHING', title: '冰川吊词翁', icon: <Star />, color: 'bg-sky-500', xp: '+400', description: '控制悬挂的吊钩，钓起正确翻译的冰湖群鱼！', category: 'ARCADE' },
    { id: 'PLANTS', title: '植物守卫战', icon: <Zap />, color: 'bg-emerald-600', xp: '+450', description: '召唤绿植词灵射手，击退单词僵尸！', category: 'ARCADE' },
    { id: 'SHEEP', title: '洋洋消消乐', icon: <Layers />, color: 'bg-emerald-500', xp: '+400', description: '消除3个相同魔法，清空法阵！', category: 'ARCADE' },
  ];

  const dueLevels = useMemo(() => levels.filter(l => l.isDue), [levels]);
  const dueWords = useMemo(() => dueLevels.flatMap(l => l.words), [dueLevels]);

  const errorWords = useMemo(() => {
    try {
      const errs = getVocabularyErrors();
      return errs.map((item, idx) => ({
        id: `err-${idx}`,
        text: item.text,
        translation: item.translation,
        imageUrl: item.imageUrl,
        syllables: item.syllables || [],
        learned: true
      }));
    } catch (e) {
      return [];
    }
  }, [showLevelSelector]);

  const currentWords = useMemo(() => {
    if (selectedLevelId === -1) return errorWords;
    if (selectedLevelId === 0 && dueWords.length > 0) return dueWords; // 0 for SRS filter
    if (selectedLevelId) {
      return levels.find(l => l.id === selectedLevelId)?.words || [];
    }
    const learnedGroups = groups.filter(g => g.learned);
    if (lastLearnedWords.length > 0) return lastLearnedWords;
    if (learnedGroups.length > 0) return learnedGroups.flatMap(g => g.words);
    return groups.flatMap(g => g.words);
  }, [selectedLevelId, levels, lastLearnedWords, groups, dueWords, errorWords]);

  const targetLevel = levels.find(l => l.id === selectedLevelId);
  const displayText = selectedLevelId === -1
    ? '个人神识净化阁 · 错词净化库'
    : selectedLevelId === 0
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

                  {errorWords.length > 0 && (
                    <button 
                      onClick={() => { setSelectedLevelId(-1); setShowLevelSelector(false); audio.playClick(); }}
                      className={`p-5 rounded-[24px] text-sm font-black text-left flex items-center justify-between group transition-all border-2 ${selectedLevelId === -1 ? 'bg-amber-500 border-amber-600 text-slate-950 shadow-lg' : 'bg-amber-50 border-amber-100/50 text-amber-500 hover:bg-amber-100'}`}
                    >
                      <div className="flex items-center space-x-3">
                        <Smile size={18} className={selectedLevelId === -1 ? 'text-slate-950' : 'text-amber-500'} />
                        <span>个人错词净化库 ({errorWords.length})</span>
                      </div>
                      {selectedLevelId === -1 && <CheckCircle2 size={18} />}
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
      <div className="relative px-2 py-6 space-y-6">
        {/* Decorative Map Title */}
        <div className="text-center pb-4">
          <span className="text-[11px] sm:text-xs font-black text-emerald-850 uppercase tracking-[0.2em] bg-emerald-100/60 border-2 border-emerald-300/40 px-4 py-2 rounded-full shadow-xs animate-pulse select-none inline-flex items-center gap-1.5">
            <span>✨ 点击神奇关卡小岛，释放你的词灵魔力！ ✨</span>
          </span>
        </div>

        {games.map((game, idx) => {
          const mapLayouts = [
            { align: 'justify-start', rotate: -2, decor: 'right-[2%] -top-4', decorIcon: '🌲', cardBg: 'from-[#fef2f2] to-[#fff1f2] border-rose-300 border-b-rose-400 text-rose-950', badgeBg: 'bg-rose-450 text-white' },
            { align: 'justify-center', rotate: 1.5, decor: 'left-[4%] -top-2', decorIcon: '🍄', cardBg: 'from-[#fffbeb] to-[#fef3c7] border-amber-300 border-b-amber-400 text-amber-950', badgeBg: 'bg-amber-400 text-amber-950' },
            { align: 'justify-end', rotate: 3, decor: 'left-[2%] -top-4', decorIcon: '☁️', cardBg: 'from-[#f0f9ff] to-[#e0f2fe] border-sky-300 border-b-sky-400 text-sky-950', badgeBg: 'bg-sky-450 text-white' },
            { align: 'justify-center', rotate: -1.5, decor: 'right-[6%] -top-3 animate-pulse', decorIcon: '🦋', cardBg: 'from-[#ecfdf5] to-[#d1fae5] border-emerald-300 border-b-emerald-400 text-emerald-950', badgeBg: 'bg-emerald-500 text-white' },
            { align: 'justify-start', rotate: 2, decor: 'right-[8%] -top-2 rotate-12', cardBg: 'from-[#fdf4ff] to-[#fae8ff] border-purple-300 border-b-purple-400 text-purple-950', badgeBg: 'bg-purple-500 text-white', decorIcon: '🌺' },
          ];

          const gameMapEmojis: Record<string, string> = {
            CLAW: '🧸',
            FEEDING: '👾',
            HAMSTER: '🐹',
            SHOOTER: '🎈',
            ICECREAM: '🍦',
            DINO: '🦖',
            SLASHER: '🗡️',
            SONAR: '⚓',
            COOKING: '🍳',
            FISHING: '🎣',
            ALCHEMIST: '🧪',
            MINER: '⛏️',
            RAIDEN: '🚀',
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
              <div className={`w-full flex ${layout.align} items-center relative py-2`}>
                
                {/* Visual Scenic Decoration Floating on empty spaces */}
                <span className={`absolute ${layout.decor} text-4xl select-none pointer-events-none filter drop-shadow-md transition-all duration-300 z-0`}>
                  {layout.decorIcon}
                </span>

                {/* Magical Stage Button/Island Card - Layout arranged beautifully with alternating rotation */}
                <motion.button
                  initial={{ opacity: 0, scale: 0.85, y: 25 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: idx * 0.08 + 0.1, type: 'spring', stiffness: 120, damping: 14 }}
                  whileHover={{ scale: 1.05, rotate: layout.rotate * 1.5, y: -4 }}
                  whileTap={{ scale: 0.96 }}
                  style={{ rotate: layout.rotate }}
                  onClick={() => { audio.playClick(); onSelectGame(game.id, currentWords); }}
                  className={`w-[88%] bg-gradient-to-br ${layout.cardBg} rounded-[28px] p-5 border-2 border-b-[8px] transition-all shadow-md hover:shadow-xl flex items-center relative overflow-hidden text-left cursor-pointer`}
                >
                  {/* Glowing Mini Platform Base under Emoji */}
                  <div className={`w-16 h-16 rounded-2xl ${game.color} bg-gradient-to-br flex items-center justify-center text-white shrink-0 shadow-lg border-2 border-white/40 group-hover:rotate-6 transition-transform relative z-10`}>
                    <span className="text-4xl filter drop-shadow-sm select-none">{emoji}</span>
                    
                    {/* Stage Number Badge */}
                    <div className="absolute -top-3.5 -left-3.5 bg-amber-400 text-amber-950 font-black text-[10px] px-2 py-0.5 rounded-full border border-white shadow-md uppercase tracking-wider scale-95">
                      关卡 {idx + 1}
                    </div>
                  </div>

                  {/* Text Content Area with enlarged titles! */}
                  <div className="ml-4 flex-1 pr-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className="font-extrabold text-2xl sm:text-[23px] tracking-tight text-emerald-950 drop-shadow-xs leading-none">
                        {game.title}
                      </h3>
                      <span className={`font-black px-2 py-0.5 rounded-full text-[10px] tracking-wide shadow-xs uppercase ${layout.badgeBg}`}>
                        {game.xp} XP
                      </span>
                    </div>
                    <p className="text-[12.5px] sm:text-[13.5px] text-emerald-900/80 mt-1.5 font-bold leading-relaxed line-clamp-2 select-none">
                      {game.description}
                    </p>
                  </div>

                  <div className="w-8 h-8 rounded-full bg-white/70 hover:bg-white text-emerald-900 flex items-center justify-center shrink-0 shadow-xs">
                    <ArrowRight size={18} className="stroke-[3px]" />
                  </div>
                </motion.button>
              </div>

              {/* Dotted Pathway Footprints Segment in between nodes */}
              {idx < games.length - 1 && (
                <div className="py-2 flex items-center justify-center w-full relative h-10 select-none">
                  <motion.div 
                    animate={{ opacity: [0.5, 1, 0.5], scale: [0.95, 1.05, 0.95] }}
                    transition={{ repeat: Infinity, duration: 2.2, delay: idx * 0.3 }}
                    className="flex items-center gap-3 text-emerald-400/70 font-black text-lg"
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

      {/* Styled wood-tag visual for go-back button */}
      <div className="pt-4 px-4">
        <button 
          onClick={onClose} 
          className="w-full py-4.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-450 hover:to-amber-550 text-white font-black text-lg rounded-2xl border-b-4 border-amber-700 hover:scale-102 active:scale-98 transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>返回主站魔法庭 🏠</span>
        </button>
      </div>
    </div>
  );
};

export default ArcadePage;
