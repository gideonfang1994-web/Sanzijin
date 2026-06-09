import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, Gamepad2, Sparkles, Trophy, CircleDollarSign, ArrowRight, Search, X,
  Sword, Shield, Zap, Swords, Activity, Heart, Plus, Award
} from 'lucide-react';
import { UserStats, WordGroup, ViewState, ShopItem } from '../types';
import DailyQuestBoard from '../components/DailyQuestBoard';
import { CHARACTERS, SHOP_ITEMS, getShopEmoji, getShopImageUrl, ALL_CARDS } from '../constants';
import { getCharacterPortraitSvgUri } from '../utils/CharacterIllustrator';
import SafeImage from '../components/SafeImage';
import audio from '../utils/AudioUtils';
import { getVocabularyErrors } from '../utils/errorBookUtils';

const PET_EMOJIS: Record<string, string> = {
  DRAGON: '🐲',
  CAT: '🐱',
  OWL: '🦉',
  SLIME: '💧'
};

interface HomePageProps {
  stats: UserStats;
  groups: WordGroup[];
  reviewNeeded: WordGroup[];
  onNavigate: (view: ViewState) => void;
  onQuestClick: (view: ViewState, isReview?: boolean, levelId?: number, cardId?: string) => void;
  onUpdateStats?: (newStats: Partial<UserStats>) => void;
  onOpenErrorCabinet?: () => void;
}

const HomePage: React.FC<HomePageProps> = ({ stats, groups, reviewNeeded, onNavigate, onQuestClick, onUpdateStats, onOpenErrorCabinet }) => {
  const incorrectCount = React.useMemo(() => {
    try {
      return getVocabularyErrors().length;
    } catch (e) {
      return 0;
    }
  }, [stats]);

  const [searchQuery, setSearchQuery] = React.useState('');
  const [searchResults, setSearchResults] = React.useState<WordGroup[]>([]);
  const [isProfileExpanded, setIsProfileExpanded] = React.useState(false);
  const [activeProfileTab, setActiveProfileTab] = React.useState<'HERO' | 'PETS'>('HERO');

  const pipiQuote = React.useMemo(() => {
    if (reviewNeeded?.length > 0) {
      return "小勇士，有词汇需要复习哦，快去深林冒险吧！🐾";
    }
    const completedQuests = stats.quests?.filter(q => q.completed).length || 0;
    if (completedQuests === stats.quests?.length && stats.quests?.length > 0) {
      return "哇塞！今日任务已全部完成，你是最强魔法师！🎉";
    }
    return "跟我一起踩着伴奏，把单词变成好听的三字经吧！🐯🎵";
  }, [reviewNeeded, stats]);

  const activePet = React.useMemo(() => {
    return stats.pets?.find(p => !p.isDead);
  }, [stats.pets]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    if (query.trim() === '') {
      setSearchResults([]);
      return;
    }
    const filtered = groups.filter(group => 
      group.words.some(word => word.text.toLowerCase().includes(query)) ||
      group.title.toLowerCase().includes(query)
    );
    setSearchResults(filtered);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleSearchResultClick = (group: WordGroup) => {
    try {
      const difficulty = group.difficulty || 'PRIMARY';
      const cardsOfDifficulty = ALL_CARDS.filter(c => (c.difficulty || 'PRIMARY') === difficulty);
      const cardIndex = cardsOfDifficulty.findIndex(c => c.id === group.id);
      if (cardIndex === -1) return;

      const cardsPerDay = stats.cardsPerDay || 5;

      let offset = 0;
      if (difficulty === 'INTERMEDIATE') offset = 100;
      if (difficulty === 'ADVANCED') offset = 200;

      const relativeId = Math.floor(cardIndex / cardsPerDay) + 1;
      const levelId = offset + relativeId;

      localStorage.setItem('selected_adventure_difficulty', difficulty);
      onQuestClick('ADVENTURE', false, levelId, group.id);
    } catch (e) {
      console.warn('[SearchClick] navigation failure:', e);
    }
  };

  const selectedChar = React.useMemo(() => {
    return CHARACTERS.find(c => c.id === stats.selectedCharacterId) || CHARACTERS[0];
  }, [stats.selectedCharacterId]);

  const charStats = stats.characterStats[selectedChar.id] || {
    level: 1,
    strength: selectedChar.baseStats.strength,
    magic: selectedChar.baseStats.magic,
    defense: selectedChar.baseStats.defense,
    agility: selectedChar.baseStats.agility
  };

  const baseStrength = selectedChar.baseStats.strength;
  const baseMagic = selectedChar.baseStats.magic;
  const baseDefense = selectedChar.baseStats.defense;
  const baseAgility = selectedChar.baseStats.agility;

  const spentPoints = React.useMemo(() => {
    return (charStats.strength - baseStrength) + 
           (charStats.magic - baseMagic) + 
           (charStats.defense - baseDefense) + 
           (charStats.agility - baseAgility);
  }, [charStats, baseStrength, baseMagic, baseDefense, baseAgility]);

  const totalAvailablePoints = stats.level * 3;
  const unassignedPoints = Math.max(0, totalAvailablePoints - spentPoints);

  const handleAddAttributePoint = (attr: 'strength' | 'magic' | 'defense' | 'agility') => {
    if (unassignedPoints <= 0) return;
    if (!onUpdateStats) return;

    const updatedCharStat = {
      ...charStats,
      [attr]: charStats[attr] + 1
    };

    const newCharacterStats = {
      ...stats.characterStats,
      [selectedChar.id]: updatedCharStat
    };

    onUpdateStats({
      characterStats: newCharacterStats
    });
  };

  const handleResetAttributePoints = () => {
    if (!onUpdateStats) return;

    const updatedCharStat = {
      ...charStats,
      strength: baseStrength,
      magic: baseMagic,
      defense: baseDefense,
      agility: baseAgility
    };

    const newCharacterStats = {
      ...stats.characterStats,
      [selectedChar.id]: updatedCharStat
    };

    onUpdateStats({
      characterStats: newCharacterStats
    });
  };

  // Equipment Bonuses
  const equippedItemIds = stats.equippedItems[selectedChar.id] || [];
  const equippedItems = SHOP_ITEMS.filter(item => equippedItemIds.includes(item.id));
  const equippedItemNames = equippedItems.map(i => i.name);
  const selectedCharPortraitUri = getCharacterPortraitSvgUri(selectedChar, equippedItemNames, stats.pets?.find(p => !p.isDead)?.type);

  const bonusStrength = equippedItems.reduce((acc, item) => acc + (item.stats?.strength || 0), 0);
  const bonusMagic = equippedItems.reduce((acc, item) => acc + (item.stats?.magic || 0), 0);
  const bonusDefense = equippedItems.reduce((acc, item) => acc + (item.stats?.defense || 0), 0);
  const bonusAgility = equippedItems.reduce((acc, item) => acc + (item.stats?.agility || 0), 0);

  const finalStrength = charStats.strength + bonusStrength;
  const finalMagic = charStats.magic + bonusMagic;
  const finalDefense = charStats.defense + bonusDefense;
  const finalAgility = charStats.agility + bonusAgility;

  // Combat Ratings
  const characterCombatPower = (charStats.level * 100) + (finalStrength * 10) + (finalMagic * 10) + (finalDefense * 10) + (finalAgility * 10);
  const activePetPower = stats.pets?.reduce((acc, pet) => {
    if (pet.isDead) return acc;
    return acc + Math.floor(pet.level * 50 + pet.happiness * 1.5 + pet.health * 1);
  }, 0) || 0;

  const totalCombatPower = characterCombatPower + activePetPower;

  return (
    <div className="space-y-3 animate-in fade-in duration-500 pb-3 relative w-full max-w-md mx-auto overflow-x-hidden">
      {/* Dynamic Magical Forest & Astro-Core Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10 bg-gradient-to-b from-[#eafaf1] via-[#f3fcf7] to-[#f9fef6]">
        {/* Soft glowing fairy lights and magical sunbeams */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-10%,_rgba(16,185,129,0.18)_0%,_transparent_70%)]" />
        <div className="absolute top-8 left-1/10 text-emerald-500/40 text-xl pointer-events-none animate-bounce">🌱</div>
        <div className="absolute top-1/4 right-8 text-amber-400/50 text-2xl pointer-events-none animate-pulse">✨</div>
        <div className="absolute bottom-1/3 left-6 text-emerald-400/30 text-3xl pointer-events-none animate-bounce">🍀</div>
        <div className="absolute bottom-1/5 right-10 text-teal-400/30 text-2xl pointer-events-none animate-pulse">🌸</div>

        {/* Adorable Floating Cartoon Map Stickers */}
        <motion.div 
          animate={{ y: [0, -10, 0], rotate: [0, 5, -5, 0] }}
          transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
          className="absolute top-[18%] left-[4%] text-4xl opacity-[0.25] pointer-events-none select-none"
        >
          🏰
        </motion.div>
        <motion.div 
          animate={{ y: [0, 12, 0], scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
          className="absolute top-[52%] left-[3%] text-3xl opacity-[0.22] pointer-events-none select-none"
        >
          🍄
        </motion.div>
        <motion.div 
          animate={{ y: [5, -15, 5], rotate: [0, -8, 8, 0] }}
          transition={{ repeat: Infinity, duration: 7, ease: "easeInOut" }}
          className="absolute top-[35%] right-[4%] text-4xl opacity-[0.25] pointer-events-none select-none"
        >
          🧚
        </motion.div>
        <motion.div 
          animate={{ scale: [0.9, 1.1, 0.9] }}
          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
          className="absolute bottom-[28%] right-[5%] text-2xl opacity-[0.2] pointer-events-none select-none"
        >
          🌲
        </motion.div>

        {/* Soft Cartoon Floating Clouds */}
        <motion.div 
          animate={{ x: [-20, 400] }} 
          transition={{ repeat: Infinity, duration: 32, ease: "linear" }}
          className="absolute top-[12%] left-[-100px] text-4xl opacity-[0.25] pointer-events-none select-none"
        >
          ☁️
        </motion.div>
        <motion.div 
          animate={{ x: [420, -120] }} 
          transition={{ repeat: Infinity, duration: 28, ease: "linear" }}
          className="absolute top-[45%] right-[-100px] text-3xl opacity-[0.22] pointer-events-none select-none"
        >
          ☁️
        </motion.div>
        
        {/* Magic Runes / Fairy Ring rotating auras */}
        <div className="absolute top-[-4%] left-1/2 -translate-x-1/2 w-[300px] h-[300px] rounded-full border border-emerald-300/30 pointer-events-none select-none animate-[spin_60s_linear_infinite] flex items-center justify-center opacity-45">
          <div className="w-[260px] h-[260px] rounded-full border border-dashed border-emerald-300/40" />
        </div>
        <div className="absolute top-[-1%] left-1/2 -translate-x-1/2 w-[220px] h-[220px] rounded-full border border-emerald-400/25 pointer-events-none select-none animate-[spin_30s_linear_infinite_reverse] flex items-center justify-center opacity-60">
          <div className="text-[7.5px] text-emerald-700/50 tracking-widest font-mono uppercase font-black">
            ✦ PHONICS WORLD ✦ LEARN & PLAY ✦ LEVEL UP ✦
          </div>
        </div>

        {/* Little Floating Magical Sparkles */}
        {['#10b981', '#fbbf24', '#f43f5e', '#3b82f6'].map((color, idx) => (
          [...Array(1)].map((_, i) => (
            <motion.div
              key={`${idx}-${i}`}
              className="absolute rounded-full blur-[1px]"
              style={{
                width: Math.random() * 5 + 3,
                height: Math.random() * 5 + 3,
                backgroundColor: color,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 80 + 10}%`,
              }}
              animate={{
                y: [0, -120],
                x: [0, Math.random() * 40 - 20],
                opacity: [0, 0.8, 0],
                scale: [0.6, 1.3, 0.6],
              }}
              transition={{
                duration: Math.random() * 8 + 6,
                repeat: Infinity,
                delay: Math.random() * 4,
                ease: "easeInOut"
              }}
            />
          ))
        ))}
      </div>

      {/* COMBINED SINGLE-ROW RPG INTEGRATED ADVENTURE HEADER */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-b from-white via-[#fcfefd] to-[#eefdf5] border-2 border-emerald-300 border-b-[5px] border-emerald-400 rounded-[20px] p-2.5 shadow-md text-emerald-950 relative overflow-hidden flex flex-col gap-2"
      >
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent animate-pulse" />
        
        {/* Row 1: Profile Avatar + Title & Meta badge + Coins & Attributes button */}
        <div className="flex items-center justify-between gap-1.5 w-full">
          {/* Left: Avatar portrait and level/name info */}
          <div className="flex items-center space-x-2 min-w-0">
            <div 
              onClick={() => {
                try { audio.playClick(); } catch(e){}
                setIsProfileExpanded(true);
              }}
              className="w-10 h-10 bg-slate-900 border-2 border-amber-300 rounded-xl overflow-hidden shadow-sm cursor-pointer shrink-0 hover:scale-105 active:scale-95 transition-transform flex items-center justify-center relative bg-gradient-to-br from-emerald-500 to-teal-800"
            >
              <img 
                src={selectedCharPortraitUri} 
                alt={selectedChar.name} 
                className="w-full h-full object-cover select-none"
              />
              {unassignedPoints > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white font-sans font-black text-[8px] px-1 rounded-full animate-bounce border border-white">
                  +{unassignedPoints}
                </span>
              )}
              {activePet && (
                <span className="absolute -bottom-1 -right-1 bg-amber-400 text-amber-950 border border-white rounded-md text-[8px] px-1 shadow-xs font-black">
                  {PET_EMOJIS[activePet.type] || '🐾'}
                </span>
              )}
            </div>

            <div className="text-left min-w-0">
              <div className="flex items-center gap-1 whitespace-nowrap">
                <span className="text-[13.5px] sm:text-[14.5px] font-black text-emerald-950 tracking-wide leading-none whitespace-nowrap select-none">
                  {selectedChar.name}
                </span>
                <span className="text-[8.5px] font-extrabold text-white bg-emerald-600 px-1 py-0.2 rounded-md shrink-0 select-none">
                  LV.{stats.level}
                </span>
              </div>
              <div className="text-[9.5px] font-extrabold text-emerald-700 mt-0.5 truncate whitespace-nowrap select-none leading-none">
                称号: {selectedChar.title}
              </div>
            </div>
          </div>

          {/* Right: Gold Coins display & Attribute allocation button */}
          <div className="flex items-center space-x-1.5 shrink-0">
            <span className="text-[11px] sm:text-[12px] font-black text-amber-900 bg-amber-50 border border-amber-200/60 px-1.5 py-0.5 rounded-lg flex items-center justify-center gap-0.5 shadow-3xs">
              🪙<span className="tabular-nums font-extrabold">{stats.magicCoins}</span>
            </span>
            <button 
              type="button"
              onClick={() => {
                try { audio.playClick(); } catch(e){}
                setIsProfileExpanded(true);
              }}
              className="px-2 py-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:brightness-105 active:scale-95 text-white font-black text-[9.5px] rounded-lg border-b-[2px] border-emerald-700 shadow-sm font-sans transition-all flex items-center gap-0.5 leading-none"
            >
              <span>属性 🗡️</span>
              {unassignedPoints > 0 && <span className="h-1 w-1 rounded-full bg-rose-500 animate-pulse" />}
            </button>
          </div>
        </div>

        {/* Row 2: Grid of RPG Metrics Stats Badges */}
        <div className="grid grid-cols-3 gap-1 bg-emerald-950/[0.03] border border-emerald-250/20 p-1 rounded-xl">
          <div className="bg-gradient-to-r from-white to-amber-50/20 border border-amber-200/60 rounded-lg py-0.5 px-1 flex items-center justify-center gap-0.5 shadow-3xs hover:brightness-102 transition-all">
            <span className="text-[10px] font-black text-slate-500">⚔️战力</span>
            <span className="text-[10px] font-black text-[#be2c2c] tabular-nums font-sans">{totalCombatPower}</span>
          </div>
          <div className="bg-gradient-to-r from-white to-rose-50/20 border border-rose-200/60 rounded-lg py-0.5 px-1 flex items-center justify-center gap-0.5 shadow-3xs hover:brightness-102 transition-all">
            <span className="text-[10px] font-black text-slate-500">❤️生命</span>
            <span className="text-[10px] font-black text-rose-600 tabular-nums font-sans">100</span>
          </div>
          <div className="bg-gradient-to-r from-white to-indigo-50/20 border border-indigo-200/60 rounded-lg py-0.5 px-1 flex items-center justify-center gap-0.5 shadow-3xs hover:brightness-102 transition-all">
            <span className="text-[10px] font-black text-slate-500">🪄魔力</span>
            <span className="text-[10px] font-black text-indigo-600 tabular-nums font-sans">{stats.level * 10}</span>
          </div>
        </div>
      </motion.div>

      {/* CUTE WORD SEARCH SECTION */}
      <div className="relative group px-0.5">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <span className="text-base mr-1 select-none animate-pulse">🔮</span>
          <Search className="text-emerald-600 w-4 h-4 group-focus-within:text-amber-500 transition-colors shrink-0 stroke-[3]" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearch}
          placeholder="🧙‍♂️ 输入神秘单词或拼音寻找口诀..."
          className="w-full bg-white/95 backdrop-blur-md py-2.5 pl-11 pr-8 rounded-[16px] border-2 border-emerald-300 shadow-sm focus:ring-4 focus:ring-emerald-400/10 focus:border-amber-400 focus:bg-white outline-none transition-all text-xs sm:text-sm text-emerald-950 placeholder:text-emerald-700/60 font-black animate-in slide-in-from-top-1 duration-200 border-b-[4px] border-emerald-400"
        />
        {searchQuery && (
          <button
            onClick={clearSearch}
            className="absolute inset-y-0 right-3 flex items-center px-1 text-emerald-600 hover:text-emerald-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        )}
      </div>

      {/* SEARCH RESULTS DROP-DOWN */}
      <AnimatePresence>
        {searchResults.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -8, height: 0 }}
            className="bg-gradient-to-b from-white to-[#f4fbf6] border-2 border-emerald-300 rounded-[20px] shadow-md p-3 space-y-2 overflow-hidden mx-0.5 border-b-[5px]"
          >
            <h4 className="text-[11px] font-black text-amber-700 uppercase tracking-widest px-1 flex items-center gap-1">
              <span>📜 太古碑文口诀卷轴</span>
              <span className="h-1 w-1 rounded-full bg-amber-500 animate-pulse" />
            </h4>
            <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1 custom-scrollbar">
              {searchResults.map((group) => (
                <div
                  key={group.id}
                  onClick={() => handleSearchResultClick(group)}
                  className="p-2.5 bg-[#f0fdf4] rounded-xl border border-emerald-250 hover:border-amber-400/60 hover:bg-[#e6f9ed] transition-all text-left cursor-pointer active:scale-[0.99] group/card relative pr-16"
                >
                  <div className="flex justify-between items-start mb-1 flex-wrap gap-1">
                    <div className="flex flex-wrap gap-1">
                      {group.words.map(w => (
                        <span key={w.text} className={`px-1.5 py-0.5 rounded text-[11px] sm:text-xs font-black leading-none ${w.text.toLowerCase().includes(searchQuery.toLowerCase()) ? 'bg-amber-400 text-emerald-950 border border-amber-305 scale-102' : 'bg-white text-emerald-800 border border-emerald-200'}`}>
                          {w.text}
                        </span>
                      ))}
                    </div>
                    <span className="text-[9px] font-black text-emerald-600/70 uppercase tracking-widest font-mono">{group.title}</span>
                  </div>
                  <p className="text-emerald-955 font-black text-xs sm:text-sm leading-normal">
                    {group.rhyme.split(',').map((part, i) => (
                      <span key={i} className="block first:mt-0">{part.trim()}</span>
                    ))}
                  </p>
                  
                  {/* Visual Hint Indicator */}
                  <div className="absolute right-2.5 top-1/2 -translate-y-1/2 opacity-0 group-hover/card:opacity-100 transition-all duration-300 translate-x-1 group-hover/card:translate-x-0 flex items-center gap-0.5 text-[9px] sm:text-[10px] font-black text-amber-600">
                    <span>走起仙林</span>
                    <ArrowRight size={10} className="stroke-[3.5] animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TODAY'S QUESTS BOARD CONTAINER */}
      <div className="overflow-hidden px-0.5">
        <DailyQuestBoard quests={stats.quests} onQuestClick={onQuestClick} />
      </div>

      {/* FANTASY ADVENTURE WORLD MAP LAYOUT (BREAKTHROUGH GAME BOARD) */}
      <div className="px-0.5 space-y-2">
        {/* Section title */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1.5">
            <span className="text-base">🗺️</span>
            <span className="font-sans font-black text-emerald-950 text-xs sm:text-sm tracking-wide">魔幻奥妙世界版图 (Adventure Map)</span>
          </div>
          <span className="text-[9px] text-amber-700 font-extrabold bg-amber-50 px-1.5 py-0.2 rounded-full border border-amber-200 animate-pulse">
            学说唱背单词路线
          </span>
        </div>

        {/* Graphical Board Trail Map Container */}
        <div className="relative bg-gradient-to-b from-[#f3fcf6] to-[#e6faf0] border-2 border-emerald-300 border-b-[5px] border-emerald-400 rounded-[24px] shadow-lg overflow-hidden h-[410px] sm:h-[440px] w-full z-10">
          
          {/* MAP GLOW EFFECT BACKDROP (Magical light halos to enrich environment depth) */}
          {/* Sunshine shaft radiating from top-right corner */}
          <div className="absolute top-0 right-0 w-[180px] h-[180px] bg-gradient-to-bl from-amber-200/25 via-yellow-100/5 to-transparent blur-2xl pointer-events-none select-none z-0" />
          
          {/* Glow 1: Behind Rhythm Arena (Sunny Amber/Yellow Glow) */}
          <div className="absolute top-[20px] left-[6%] w-24 h-24 bg-yellow-400/12 rounded-full blur-2xl pointer-events-none select-none z-0 animate-[pulse_3s_infinite_ease-in-out]" />
          
          {/* Glow 2: Behind Adventure Forest (Pine Green Glow) */}
          <div className="absolute top-[20px] right-[6%] w-24 h-24 bg-emerald-400/12 rounded-full blur-2xl pointer-events-none select-none z-0 animate-[pulse_3.5s_infinite_ease-in-out_0.2s]" />

          {/* Glow 3: Behind Arcade Mode (Fruit Orange Glow) */}
          <div className="absolute top-[115px] left-[6%] w-24 h-24 bg-orange-400/12 rounded-full blur-2xl pointer-events-none select-none z-0 animate-[pulse_4s_infinite_ease-in-out_0.8s]" />

          {/* Glow 4: Behind Picture Book Library (Indigo/Royal Pearl Glow) */}
          <div className="absolute top-[115px] right-[6%] w-24 h-24 bg-indigo-500/12 rounded-full blur-2xl pointer-events-none select-none z-0 animate-[pulse_3.2s_infinite_ease-in-out_0.6s]" />

          {/* Glow 5: Behind Sync Textbook (Teal Fresh Glow) */}
          <div className="absolute top-[210px] left-[6%] w-24 h-24 bg-teal-400/12 rounded-full blur-2xl pointer-events-none select-none z-0 animate-[pulse_3.8s_infinite_ease-in-out_1.2s]" />

          {/* Glow 6: Behind Pet Sanctuary (Friendly Pink Blossom Glow) */}
          <div className="absolute top-[210px] right-[6%] w-24 h-24 bg-pink-400/12 rounded-full blur-2xl pointer-events-none select-none z-0 animate-[pulse_3s_infinite_ease-in-out_0.9s]" />

          {/* Glow 7: Behind Enchanted Shop (Ancient Blue Oracle Glow) */}
          <div className="absolute top-[300px] left-1/2 -translate-x-1/2 w-24 h-24 bg-cyan-400/12 rounded-full blur-2xl pointer-events-none select-none z-0 animate-[pulse_4s_infinite_ease-in-out_1.5s]" />

          {/* Sinuous SVG Trail/Road connecting nodes */}
          <svg className="absolute inset-x-0 inset-y-0 w-full h-full pointer-events-none select-none opacity-50 z-0" viewBox="0 0 320 440" preserveAspectRatio="none">
            <path 
              d="M 50,47 C 120,30 200,30 270,47 C 255,100 115,85 50,142 C 120,125 200,125 270,142 C 255,195 115,180 50,237 C 120,220 200,220 270,237 C 240,280 190,310 160,325" 
              fill="none" 
              stroke="#10b981" 
              strokeWidth="4" 
              strokeLinecap="round" 
              strokeDasharray="6 5" 
              className="animate-[dash_60s_linear_infinite]"
            />
          </svg>

          {/* Adorable visual landmark stickers inside fantasy map to enrich the environment */}
          <div className="absolute top-[1%] left-[45%] text-[10px] select-none pointer-events-none opacity-20">🌳</div>
          <div className="absolute top-[8%] left-[47%] -translate-x-1/2 text-sm select-none pointer-events-none opacity-15 animate-pulse">☀️</div>
          <div className="absolute top-[65px] left-[16%] text-sm select-none opacity-15 pointer-events-none">🌋</div>
          <div className="absolute top-[65px] right-[18%] text-xs select-none opacity-15 pointer-events-none">⛺</div>
          <div className="absolute top-[160px] left-[16%] text-lg select-none opacity-20 animate-[bounce_4s_infinite_ease-in-out] pointer-events-none">⛵</div>
          <div className="absolute top-[260px] right-[16%] text-sm select-none opacity-10 pointer-events-none">🏛️</div>
          <div className="absolute top-[260px] left-[15%] text-xs select-none opacity-15 pointer-events-none">🍄</div>
          <div className="absolute bottom-[20%] left-[44%] text-xs select-none pointer-events-none opacity-10">🌈</div>

          {/* LAYER 1: HEAD STAGES */}
          {/* Stage 1: Phonics Arena (Rhythm Arena - Left-Top) */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              try { audio.playClick(); } catch(e){}
              onNavigate('PHONICS');
            }}
            className="absolute top-[15px] left-[6%] flex flex-col items-center group cursor-pointer z-10"
          >
            <div className="w-[58px] h-[58px] sm:w-[64px] sm:h-[64px] rounded-full bg-gradient-to-br from-yellow-400 to-[#f59e0b] flex items-center justify-center text-[22px] sm:text-[26px] shadow-md border-3 border-white group-hover:scale-108 active:scale-95 transition-transform duration-150 shrink-0 relative">
              <span>⚡</span>
            </div>
            <span className="font-black text-amber-950 text-[11px] sm:text-xs mt-1 whitespace-nowrap text-shadow-[0_1px_2px_rgba(255,255,255,0.8)] leading-none">节奏修炼场</span>
            <span className="text-[9px] text-amber-800 font-extrabold whitespace-nowrap leading-none mt-0.5">说唱拼读</span>
          </motion.button>

          {/* Stage 2: Adventure Forest (Right-Top) */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              try { audio.playClick(); } catch(e){}
              onNavigate('ADVENTURE');
            }}
            className="absolute top-[15px] right-[6%] flex flex-col items-center group cursor-pointer z-10"
          >
            <div className="w-[58px] h-[58px] sm:w-[64px] sm:h-[64px] rounded-full bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center text-[22px] sm:text-[26px] shadow-md border-3 border-white group-hover:scale-108 active:scale-95 transition-transform duration-150 shrink-0 relative">
              <span>🌲</span>
              {reviewNeeded.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white font-black text-[8.5px] w-4.5 h-4.5 flex items-center justify-center rounded-full border border-white animate-bounce shadow">
                  {reviewNeeded.length}
                </span>
              )}
            </div>
            <span className="font-black text-emerald-950 text-[11px] sm:text-xs mt-1 whitespace-nowrap text-shadow-[0_1px_2px_rgba(255,255,255,0.8)] leading-none">冒险深林</span>
            <span className="text-[9px] text-emerald-800 font-extrabold whitespace-nowrap leading-none mt-0.5">闯关背词</span>
          </motion.button>

          {/* LAYER 2: MID-UP STAGES */}
          {/* Stage 3: Magic Playground (Arcade Mode - Left-Middle-Up) */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              try { audio.playClick(); } catch(e){}
              onNavigate('ARCADE');
            }}
            className="absolute top-[110px] left-[6%] flex flex-col items-center group cursor-pointer z-10"
          >
            <div className="w-[58px] h-[58px] sm:w-[64px] sm:h-[64px] rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-[22px] sm:text-[26px] shadow-md border-3 border-white group-hover:scale-108 active:scale-95 transition-transform duration-150 shrink-0 relative">
              <span>🎮</span>
            </div>
            <span className="font-black text-orange-950 text-[11px] sm:text-xs mt-1 whitespace-nowrap text-shadow-[0_1px_2px_rgba(255,255,255,0.8)] leading-none">演武乐园</span>
            <span className="text-[9px] text-orange-700 font-extrabold whitespace-nowrap leading-none mt-0.5">趣味拼读</span>
          </motion.button>

          {/* Stage 4: Magic Picture Book Palace (Library - Right-Middle-Up) */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              try { audio.playClick(); } catch (e) {}
              onNavigate('PICTURE_BOOK');
            }}
            className="absolute top-[110px] right-[6%] flex flex-col items-center group cursor-pointer z-10"
          >
            <div className="w-[58px] h-[58px] sm:w-[64px] sm:h-[64px] rounded-full bg-gradient-to-br from-[#4f46e5] to-[#6366f1] flex items-center justify-center text-[22px] sm:text-[26px] shadow-md border-3 border-white group-hover:scale-108 active:scale-95 transition-transform duration-150 shrink-0 relative">
              <span>🏰</span>
              <span className="absolute -top-1 -right-2 bg-amber-400 text-amber-950 font-black text-[7px] px-1 rounded-full border border-amber-500 animate-pulse shadow-sm">NEW</span>
            </div>
            <span className="font-black text-indigo-950 text-[11px] sm:text-xs mt-1 whitespace-nowrap text-shadow-[0_1px_2px_rgba(255,255,255,0.8)] leading-none">魔法绘本馆</span>
            <span className="text-[9px] text-indigo-700 font-extrabold whitespace-nowrap leading-none mt-0.5">发音配音</span>
          </motion.button>

          {/* LAYER 3: MID-DOWN STAGES */}
          {/* Stage 5: Sync Textbook Palace (Left-Middle-Down) */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              try { audio.playClick(); } catch(e){}
              onNavigate('TEXTBOOK');
            }}
            className="absolute top-[205px] left-[6%] flex flex-col items-center group cursor-pointer z-10"
          >
            <div className="w-[58px] h-[58px] sm:w-[64px] sm:h-[64px] rounded-full bg-gradient-to-br from-teal-400 to-[#0d9488] flex items-center justify-center text-[22px] sm:text-[26px] shadow-md border-3 border-white group-hover:scale-108 active:scale-95 transition-transform duration-150 shrink-0 relative">
              <span>🎒</span>
              <span className="absolute -top-1.5 -right-1.5 bg-yellow-400 text-yellow-950 font-black text-[7px] px-1 rounded-full border border-yellow-500 animate-bounce shadow">同步</span>
            </div>
            <span className="font-black text-teal-950 text-[11px] sm:text-xs mt-1 whitespace-nowrap text-shadow-[0_1px_2px_rgba(255,255,255,0.8)] leading-none">同步馆</span>
            <span className="text-[9px] text-teal-700 font-extrabold whitespace-nowrap leading-none mt-0.5">教材对应</span>
          </motion.button>

          {/* Stage 6: Pet Sanctuary (Right-Middle-Down) */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              try { audio.playClick(); } catch(e){}
              onNavigate('PETS');
            }}
            className="absolute top-[205px] right-[6%] flex flex-col items-center group cursor-pointer z-10"
          >
            <div className="w-[58px] h-[58px] sm:w-[64px] sm:h-[64px] rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-[22px] sm:text-[26px] shadow-md border-3 border-white group-hover:scale-108 active:scale-95 transition-transform duration-150 shrink-0 relative">
              <span>🐾</span>
            </div>
            <span className="font-black text-rose-950 text-[11px] sm:text-xs mt-1 whitespace-nowrap text-shadow-[0_1px_2px_rgba(255,255,255,0.8)] leading-none">兽神圣域</span>
            <span className="text-[9px] text-rose-700 font-extrabold whitespace-nowrap leading-none mt-0.5">仙宠养成</span>
          </motion.button>

          {/* LAYER 4: BOTTOM STAGES */}
          {/* Stage 7: Enchanted Shop (Center-Bottom) */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              try { audio.playClick(); } catch(e){}
              onNavigate('SHOP');
            }}
            className="absolute top-[295px] left-1/2 -translate-x-1/2 flex flex-col items-center group cursor-pointer z-10"
          >
            <div className="w-[58px] h-[58px] sm:w-[64px] sm:h-[64px] rounded-full bg-gradient-to-br from-[#64b5f6] to-[#1e88e5] flex items-center justify-center text-[22px] sm:text-[26px] shadow-md border-3 border-white group-hover:scale-108 active:scale-95 transition-transform duration-150 shrink-0 relative">
              <span>🪙</span>
            </div>
            <span className="font-black text-blue-950 text-[11px] sm:text-xs mt-1.5 whitespace-nowrap text-shadow-[0_1px_2px_rgba(255,255,255,0.8)] leading-none">法秘商行</span>
            <span className="text-[9px] text-blue-700 font-extrabold whitespace-nowrap leading-none mt-0.5">神装置备</span>
          </motion.button>

          {/* LAYER 5: INTERACTIVE COMPACT CHRONICLES BAR / ERROR BUBBLE */}
          <div className="absolute bottom-[10px] inset-x-[3%] py-1.5 px-3 border border-emerald-300 bg-white/75 backdrop-blur-md rounded-xl flex justify-between items-center z-10 shadow-md">
            {/* Quick stats feedback */}
            <div className="text-left flex flex-col justify-center">
              <span className="text-[9px] font-black text-emerald-800 uppercase block tracking-wider leading-none">冒险战史</span>
              <span className="text-xs font-black text-emerald-950 mt-1 flex items-center gap-0.5 leading-none">
                已学口诀 <strong className="text-emerald-700 text-sm font-extrabold">{stats.totalWordsLearned}</strong> 册
              </span>
            </div>

            {/* Floating Purification Error Bubble renamed to 错词汇 */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                try { audio.playClick(); } catch(e){}
                onOpenErrorCabinet?.();
              }}
              className="relative px-3.5 py-1.5 bg-gradient-to-r from-[#8126e8] to-[#601be0] hover:brightness-115 border-2 border-[#b573f9] border-b-[3.5px] border-b-[#4710ab] text-white font-extrabold text-xs rounded-xl shadow-md active:border-b-2 active:translate-y-[1px] transition-all duration-150 flex items-center justify-center gap-1 cursor-pointer select-none"
            >
              <span className="text-sm">📔</span>
              <span className="font-sans font-black tracking-wide">错词汇</span>
              {incorrectCount > 0 ? (
                <span className="bg-[#b9215b] text-white font-sans text-[10px] font-extrabold rounded-full px-1.5 py-0.2 shadow-inner border border-white/20">
                  {incorrectCount}
                </span>
              ) : (
                <span className="bg-[#b9215b]/45 text-purple-200 text-[10px] font-extrabold rounded-full px-1.5 py-0.2 border border-white/15">
                  0
                </span>
              )}
            </motion.button>
          </div>

        </div>
      </div>


      {/* IMMERSIVE RPG ATTRIBUTE / INVENTORY SHEET OVERLAY MODAL */}
      <AnimatePresence>
        {isProfileExpanded && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#062419]/60 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="w-full max-w-md bg-gradient-to-b from-[#fbfcf3] via-[#f7faf0] to-[#edf3e8] border-3 border-emerald-400 rounded-3xl p-6 text-emerald-950 shadow-2xl relative overflow-hidden max-h-[92vh] flex flex-col"
            >
              {/* Magical Header scroll effect */}
              <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-emerald-500 via-amber-400 to-emerald-500 animate-pulse" />
              
              <div className="flex items-center justify-between mb-5 border-b-2 border-emerald-200 pb-4">
                <div className="flex items-center space-x-3.5">
                  <span className="text-3xl animate-bounce">🗡️</span>
                  <div className="text-left">
                    <h4 className="font-sans font-black text-lg sm:text-2xl text-emerald-900 tracking-wide">我的英雄魔法契约书</h4>
                    <span className="text-xs sm:text-sm text-emerald-800 font-extrabold block mt-1">主神圣域总战斗力: <span className="text-amber-600 font-black text-sm sm:text-lg">{totalCombatPower} CP ⚔️</span></span>
                  </div>
                </div>

                <button 
                  onClick={() => {
                    try { audio.playClick(); } catch(e){}
                    setIsProfileExpanded(false);
                  }}
                  className="p-2 hover:bg-emerald-100 bg-white border-2 border-emerald-300 rounded-xl text-emerald-700 hover:text-emerald-950 transition-colors cursor-pointer"
                >
                  <X size={20} className="stroke-[2.5]" />
                </button>
              </div>

              {/* Scrollable Panel Area */}
              <div className="flex-1 overflow-y-auto space-y-5 pr-1 custom-scrollbar">
                
                {/* Visual Tab Selector inside stats overlay */}
                <div className="flex bg-emerald-100/60 border-2 border-emerald-250 p-1 rounded-2xl">
                  <button 
                    onClick={() => {
                      try { audio.playClick(); } catch(e){}
                      setActiveProfileTab('HERO');
                    }}
                    className={`flex-1 py-3 text-sm sm:text-lg font-black rounded-xl transition-all ${activeProfileTab === 'HERO' ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-md' : 'text-emerald-800 hover:text-emerald-900'}`}
                  >
                    🗡️ 勇者魔法属性
                  </button>
                  <button 
                    onClick={() => {
                      try { audio.playClick(); } catch(e){}
                      setActiveProfileTab('PETS');
                    }}
                    className={`flex-1 py-3 text-sm sm:text-lg font-black rounded-xl transition-all ${activeProfileTab === 'PETS' ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-md' : 'text-emerald-800 hover:text-emerald-950'}`}
                  >
                    🐾 契约守护兽 ({stats.pets?.length || 0})
                  </button>
                </div>

                {activeProfileTab === 'HERO' ? (
                  <div className="space-y-4.5">
                    {/* Character Card Info */}
                    <div className="bg-white border-2 border-emerald-300 shadow-md rounded-2xl p-4.5 flex items-center space-x-4 relative overflow-hidden">
                      <div className="absolute top-0 right-0 opacity-[0.05] select-none pointer-events-none text-9xl">
                        {selectedChar.avatar}
                      </div>
                      <div className="w-20 h-20 bg-slate-950 border border-emerald-400 rounded-2xl overflow-hidden shrink-0 flex items-center justify-center shadow-inner">
                        <img 
                          src={selectedCharPortraitUri} 
                          alt={selectedChar.name} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h5 className="font-sans font-black text-emerald-955 text-lg sm:text-xl truncate">{selectedChar.name}</h5>
                          <span className="text-[11px] bg-emerald-100 text-emerald-900 font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-300">
                            英雄 LV.{charStats.level}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-amber-700 mt-1 italic block leading-none truncate">★ {selectedChar.title}</p>
                        <p className="text-xs sm:text-[14px] font-bold text-emerald-800 leading-normal mt-2">
                          {selectedChar.description}
                        </p>
                      </div>
                    </div>

                    {/* Compact rating pills */}
                    <div className="grid grid-cols-3 gap-2.5 bg-white border-2 border-emerald-200 p-3.5 rounded-3xl shadow-sm">
                      <div className="text-center">
                        <span className="text-[11px] sm:text-xs font-black text-emerald-700 block mb-1 uppercase tracking-wide">基础战力</span>
                        <span className="font-black text-rose-600 text-sm sm:text-xl tabular-nums">{characterCombatPower}</span>
                      </div>
                      <div className="text-center border-x-2 border-emerald-100">
                        <span className="text-[11px] sm:text-xs font-black text-emerald-700 block mb-1 uppercase tracking-wide">契约守护</span>
                        <span className="font-black text-teal-600 text-sm sm:text-lxl tabular-nums">+{activePetPower}</span>
                      </div>
                      <div className="text-center">
                        <span className="text-[11px] sm:text-xs font-black text-emerald-700 block mb-1 uppercase tracking-wide">总神威力</span>
                        <span className="font-black text-amber-600 text-sm sm:text-xl tabular-nums">{totalCombatPower}</span>
                      </div>
                    </div>

                    {/* Attributes Distribution */}
                    <div className="space-y-3.5 bg-gradient-to-b from-emerald-50/50 to-white border-2 border-emerald-250 p-4.5 rounded-3xl shadow-sm">
                      <div className="flex items-center justify-between border-b-2 border-emerald-150 pb-2.5 mb-1.5 flex-wrap gap-2">
                        <span className="text-base font-black text-emerald-950">分配神力属性点</span>
                        <span className="bg-amber-400 text-amber-950 border-2 border-amber-500 px-3 py-1 rounded-full text-xs font-black shadow-sm">
                          剩余 {unassignedPoints} 点 🔑
                        </span>
                      </div>

                      {/* Attribute Row strength */}
                      <div className="flex items-center justify-between bg-white p-3 border-2 border-emerald-200 rounded-2xl shadow-sm hover:border-emerald-300 transition-colors">
                        <div className="flex items-center space-x-3">
                          <Sword size={20} className="text-red-500 animate-pulse shrink-0" />
                          <div>
                            <span className="font-black text-emerald-955 text-sm sm:text-base block leading-none">力量 (Strength)</span>
                            <span className="text-xs text-emerald-700 font-bold block mt-1">提高扫尾和词怪击落度 🗡️</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className="font-black text-base sm:text-lg text-emerald-950 tabular-nums">
                            {charStats.strength}
                            {bonusStrength > 0 && <span className="text-emerald-600 text-xs font-extrabold ml-1">+{bonusStrength}</span>}
                          </span>
                          <button
                            type="button"
                            disabled={unassignedPoints <= 0}
                            onClick={() => {
                              try { audio.playClick(); } catch(e){}
                              handleAddAttributePoint('strength');
                            }}
                            className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-lg shadow-sm border ${unassignedPoints > 0 ? 'bg-gradient-to-r from-emerald-500 to-teal-500 border-emerald-400 cursor-pointer text-white hover:scale-105 active:scale-95' : 'bg-emerald-100 text-emerald-400 border-emerald-200'}`}
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Attribute Row magic */}
                      <div className="flex items-center justify-between bg-white p-3 border-2 border-emerald-200 rounded-2xl shadow-sm hover:border-emerald-300 transition-colors">
                        <div className="flex items-center space-x-3">
                          <Zap size={20} className="text-purple-500 animate-pulse shrink-0" />
                          <div>
                            <span className="font-black text-emerald-955 text-sm sm:text-base block leading-none">魔力 (Magic)</span>
                            <span className="text-xs text-emerald-700 font-bold block mt-1">提供魔法拼读闪避护盾 ⚡</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className="font-black text-base sm:text-lg text-emerald-950 tabular-nums">
                            {charStats.magic}
                            {bonusMagic > 0 && <span className="text-emerald-600 text-xs font-extrabold ml-1">+{bonusMagic}</span>}
                          </span>
                          <button
                            type="button"
                            disabled={unassignedPoints <= 0}
                            onClick={() => {
                              try { audio.playClick(); } catch(e){}
                              handleAddAttributePoint('magic');
                            }}
                            className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-lg shadow-sm border ${unassignedPoints > 0 ? 'bg-gradient-to-r from-purple-500 to-indigo-500 border-purple-400 cursor-pointer text-white hover:scale-105 active:scale-95' : 'bg-emerald-100 text-emerald-400 border-emerald-200'}`}
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Attribute Row defense */}
                      <div className="flex items-center justify-between bg-white p-3 border-2 border-emerald-200 rounded-2xl shadow-sm hover:border-emerald-300 transition-colors">
                        <div className="flex items-center space-x-3">
                          <Shield size={20} className="text-blue-500 animate-pulse shrink-0" />
                          <div>
                            <span className="font-black text-emerald-955 text-sm sm:text-base block leading-none">防御 (Defense)</span>
                            <span className="text-xs text-emerald-700 font-bold block mt-1">大幅增强护盾防御系数 🛡️</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className="font-black text-base sm:text-lg text-emerald-950 tabular-nums">
                            {charStats.defense}
                            {bonusDefense > 0 && <span className="text-emerald-600 text-xs font-extrabold ml-1">+{bonusDefense}</span>}
                          </span>
                          <button
                            type="button"
                            disabled={unassignedPoints <= 0}
                            onClick={() => {
                              try { audio.playClick(); } catch(e){}
                              handleAddAttributePoint('defense');
                            }}
                            className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-lg shadow-sm border ${unassignedPoints > 0 ? 'bg-gradient-to-r from-blue-500 to-sky-500 border-blue-400 cursor-pointer text-white hover:scale-105 active:scale-95' : 'bg-emerald-100 text-emerald-400 border-emerald-200'}`}
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Attribute Row agility */}
                      <div className="flex items-center justify-between bg-white p-3 border-2 border-emerald-200 rounded-2xl shadow-sm hover:border-emerald-300 transition-colors">
                        <div className="flex items-center space-x-3">
                          <Activity size={20} className="text-emerald-500 animate-pulse shrink-0" />
                          <div>
                            <span className="font-black text-emerald-955 text-sm sm:text-base block leading-none">敏捷 (Agility)</span>
                            <span className="text-xs text-emerald-700 font-bold block mt-1">提升暴击倍率与身手速度 👣</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className="font-black text-base sm:text-lg text-emerald-950 tabular-nums">
                            {charStats.agility}
                            {bonusAgility > 0 && <span className="text-emerald-600 text-xs font-extrabold ml-1">+{bonusAgility}</span>}
                          </span>
                          <button
                            type="button"
                            disabled={unassignedPoints <= 0}
                            onClick={() => {
                              try { audio.playClick(); } catch(e){}
                              handleAddAttributePoint('agility');
                            }}
                            className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-lg shadow-sm border ${unassignedPoints > 0 ? 'bg-gradient-to-r from-emerald-500 to-teal-500 border-emerald-400 cursor-pointer text-white hover:scale-105 active:scale-95' : 'bg-emerald-100 text-emerald-400 border-emerald-200'}`}
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {spentPoints > 0 && (
                        <div className="flex justify-end pt-1">
                          <button 
                            type="button"
                            onClick={() => {
                              try { audio.playClick(); } catch(e){}
                              handleResetAttributePoints();
                            }}
                            className="bg-red-50 hover:bg-red-100 text-rose-700 font-extrabold text-[12.5px] px-3.5 py-2.5 rounded-xl border border-red-250 focus:outline-none transition-all cursor-pointer shadow-sm hover:scale-101 select-none flex items-center gap-1.5"
                          >
                            🔄 一键重置我的属性点
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Active Equipments List */}
                    {equippedItems.length > 0 && (
                      <div className="bg-white/40 border-2 border-emerald-200 p-3.5 rounded-2xl">
                        <span className="text-sm font-black text-emerald-800 block mb-2 px-1 tracking-wider">正在穿着的魔法圣护具 🛡️</span>
                        <div className="grid grid-cols-2 gap-2.5">
                          {equippedItems.map(item => (
                            <div key={item.id} className="flex items-center space-x-2.5 p-2 bg-white border border-emerald-250 shadow-sm rounded-xl">
                              <div className="w-8 h-8 bg-amber-50 flex items-center justify-center rounded-lg border border-amber-200 shrink-0 p-0.5">
                                <SafeImage 
                                  src={getShopImageUrl(item.name)} 
                                  alt={item.name} 
                                  fallbackEmoji={getShopEmoji(item.name)}
                                  className="w-full h-full object-contain filter drop-shadow select-none"
                                />
                              </div>
                              <div className="min-w-0">
                                <span className="text-xs sm:text-sm font-black text-emerald-950 block truncate leading-none">{item.name}</span>
                                <span className="text-[10px] sm:text-xs font-bold text-[#0f766e] block mt-1 truncate leading-none">
                                  {Object.entries(item.stats || {}).map(([key, value]) => `${key === 'strength' ? '力' : key === 'magic' ? '魔' : key === 'defense' ? '防' : '敏'}+${value}`).join(', ')}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {stats.pets && stats.pets.length > 0 ? (
                      <div className="space-y-3">
                        {stats.pets.map((pet, idx) => {
                          const cp = Math.floor(pet.level * 50 + pet.happiness * 1.5 + pet.health * 1);
                          return (
                            <div key={pet.id || idx} className="bg-white border-2 border-emerald-200 shadow-sm rounded-3xl p-4 flex justify-between items-center relative overflow-hidden">
                              <div className="absolute top-0 right-0 p-1 opacity-[0.04] select-none pointer-events-none text-8xl">
                                {PET_EMOJIS[pet.type] || '🐾'}
                              </div>
                              <div className="flex items-center space-x-4 relative z-10 min-w-0">
                                <span className="text-4xl p-2 bg-emerald-50 rounded-2xl border-2 border-emerald-200 shrink-0">
                                  {PET_EMOJIS[pet.type] || '🐾'}
                                </span>
                                <div className="text-left min-w-0">
                                  <div className="flex items-center gap-2">
                                    <h5 className="font-sans font-black text-emerald-950 text-base sm:text-lg truncate">{pet.name}</h5>
                                    <span className="text-xs bg-[#10b981]/15 text-emerald-800 font-extrabold px-2 py-0.5 rounded-full uppercase border border-emerald-200">
                                      LV.{pet.level}
                                    </span>
                                  </div>
                                  <div className="flex items-center space-x-3 text-xs font-black text-[#14532d] mt-2">
                                    <span className="flex items-center gap-1">❤️生命: {pet.health}/100</span>
                                    <span className="flex items-center gap-1">⭐快乐: {pet.happiness}/100</span>
                                  </div>
                                </div>
                              </div>
                              <div className="text-right flex flex-col justify-center relative z-10 shrink-0 select-none">
                                <span className="text-[10px] sm:text-xs font-black text-emerald-600 block">守护力</span>
                                <span className="font-black text-emerald-700 text-sm sm:text-base tabular-nums">+{cp} CP</span>
                              </div>
                            </div>
                          );
                        })}
                        <button
                          onClick={() => {
                            try { audio.playClick(); } catch(e){}
                            setIsProfileExpanded(false);
                            onNavigate('PETS');
                          }}
                          className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-110 text-white font-black text-sm sm:text-base py-4 rounded-2xl transition-all flex items-center justify-center space-x-2 border-2 border-emerald-500 shadow-md cursor-pointer mt-3 hover:scale-[1.02] active:scale-98"
                        >
                          <span>进入契约兽神域进行特训 ⚔️</span>
                          <ArrowRight size={16} className="stroke-[2.5]" />
                        </button>
                      </div>
                    ) : (
                      <div className="bg-white rounded-3xl p-8 border-2 border-emerald-200 text-center py-10">
                        <span className="text-6xl block mb-3 pointer-events-none select-none animate-bounce">🥚</span>
                        <h6 className="font-black text-[#115e59] text-base sm:text-lg">暂无在役宠兽</h6>
                        <p className="text-xs sm:text-sm font-bold text-emerald-700 max-w-xs mx-auto mb-6 leading-relaxed mt-3">
                          可累积符文金币前往魔法商店购买雷光雏龙/萌兔之卵！在背词挑战中展现奥术魔法吧！
                        </p>
                        <button
                          onClick={() => {
                            try { audio.playClick(); } catch(e){}
                            setIsProfileExpanded(false);
                            onNavigate('SHOP');
                          }}
                          className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black text-sm py-4 rounded-2xl transition-all shadow-md cursor-pointer focus:outline-none hover:brightness-110 hover:scale-[1.02] active:scale-98"
                        >
                          前往魔法秘宝商店 🪙
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Close attributes footer info */}
              <div className="bg-emerald-100/80 rounded-2xl p-3 border-2 border-emerald-300 text-center mt-5 justify-center shadow-inner">
                <span className="text-xs sm:text-sm font-black text-emerald-900 block">
                  得到的奥术金币可以前往 [魔法商店] 购买神兽与圣域护甲 ✨
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HomePage;
