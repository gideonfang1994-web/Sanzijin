import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, Gamepad2, Sparkles, Trophy, CircleDollarSign, ArrowRight, Search, X,
  Sword, Shield, Zap, Swords, Activity, Heart, Plus, Award
} from 'lucide-react';
import { UserStats, WordGroup, ViewState, ShopItem } from '../types';
import DailyQuestBoard from '../components/DailyQuestBoard';
import { CHARACTERS, SHOP_ITEMS, getShopEmoji, getShopImageUrl } from '../constants';
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
  onQuestClick: (view: ViewState, isReview?: boolean, levelId?: number) => void;
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
    <div className="space-y-5 animate-in fade-in duration-500 pb-8 relative w-full max-w-lg mx-auto overflow-x-hidden">
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
        className="bg-gradient-to-b from-white via-[#fcfefd] to-[#eefdf5] border-2 border-emerald-300 border-b-[6px] border-emerald-400 rounded-[24px] p-3.5 sm:p-4 shadow-md text-emerald-950 relative overflow-hidden flex flex-col gap-3"
      >
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent animate-pulse" />
        
        {/* Row 1: Profile Avatar + Title & Meta badge + Coins & Attributes button */}
        <div className="flex items-center justify-between gap-2.5 w-full">
          {/* Left: Avatar portrait and level/name info */}
          <div className="flex items-center space-x-2.5 min-w-0">
            <div 
              onClick={() => {
                try { audio.playClick(); } catch(e){}
                setIsProfileExpanded(true);
              }}
              className="w-12 h-12 bg-slate-900 border-3 border-amber-300 rounded-2xl overflow-hidden shadow-md cursor-pointer shrink-0 hover:scale-105 active:scale-95 transition-transform flex items-center justify-center relative bg-gradient-to-br from-emerald-500 to-teal-800"
            >
              <img 
                src={selectedCharPortraitUri} 
                alt={selectedChar.name} 
                className="w-full h-full object-cover select-none"
              />
              {unassignedPoints > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white font-sans font-black text-[9px] px-1.5 py-0.5 rounded-full animate-bounce border border-white">
                  +{unassignedPoints}
                </span>
              )}
              {activePet && (
                <span className="absolute -bottom-1 -right-1 bg-amber-400 text-amber-950 border border-white rounded-md text-[9px] px-1 shadow-xs font-black">
                  {PET_EMOJIS[activePet.type] || '🐾'}
                </span>
              )}
            </div>

            <div className="text-left min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[15px] sm:text-[16px] font-black text-emerald-950 tracking-wide leading-none">
                  {selectedChar.name}
                </span>
                <span className="text-[9.5px] font-extrabold text-white bg-emerald-600 px-1.5 py-0.5 rounded-md shrink-0">
                  LV.{stats.level}
                </span>
              </div>
              <div className="text-[10px] font-bold text-emerald-700 mt-1 truncate">
                称号: {selectedChar.title}
              </div>
            </div>
          </div>

          {/* Right: Gold Coins display & Attribute allocation button */}
          <div className="flex items-center space-x-1.5 shrink-0">
            <span className="text-[11.5px] sm:text-[12.5px] font-black text-amber-900 bg-amber-50 border border-amber-200/60 px-2 py-1 rounded-xl flex items-center justify-center gap-0.5 shadow-3xs">
              🪙<span className="tabular-nums font-extrabold">{stats.magicCoins}</span>
            </span>
            <button 
              type="button"
              onClick={() => {
                try { audio.playClick(); } catch(e){}
                setIsProfileExpanded(true);
              }}
              className="px-2.5 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:brightness-105 active:scale-95 text-white font-black text-[10.5px] rounded-xl border-b-[3px] border-emerald-700 shadow-sm font-sans transition-all flex items-center gap-0.5 leading-none"
            >
              <span>属性 🗡️</span>
              {unassignedPoints > 0 && <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />}
            </button>
          </div>
        </div>

        {/* Row 2: Grid of RPG Metrics Stats Badges */}
        <div className="grid grid-cols-3 gap-1.5 bg-emerald-950/[0.04] border border-emerald-250/20 p-1.5 rounded-2xl">
          <div className="bg-gradient-to-r from-white to-amber-50/35 border border-amber-200/80 rounded-xl py-1.5 px-1.5 flex items-center justify-center gap-1 shadow-3xs hover:brightness-102 transition-all">
            <span className="text-[10.5px] sm:text-xs font-black text-slate-600">⚔️战力</span>
            <span className="text-[11.5px] sm:text-xs font-black text-[#be2c2c] tabular-nums font-sans">{totalCombatPower}</span>
          </div>
          <div className="bg-gradient-to-r from-white to-rose-50/35 border border-rose-200/80 rounded-xl py-1.5 px-1.5 flex items-center justify-center gap-1 shadow-3xs hover:brightness-102 transition-all">
            <span className="text-[10.5px] sm:text-xs font-black text-slate-600">❤️生命</span>
            <span className="text-[11.5px] sm:text-xs font-black text-rose-600 tabular-nums font-sans">100</span>
          </div>
          <div className="bg-gradient-to-r from-white to-indigo-50/35 border border-indigo-200/80 rounded-xl py-1.5 px-1.5 flex items-center justify-center gap-1 shadow-3xs hover:brightness-102 transition-all">
            <span className="text-[10.5px] sm:text-xs font-black text-slate-600">🪄魔力</span>
            <span className="text-[11.5px] sm:text-xs font-black text-indigo-600 tabular-nums font-sans">{stats.level * 10}</span>
          </div>
        </div>
      </motion.div>

      {/* CUTE WORD SEARCH SECTION */}
      <div className="relative group px-1">
        <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
          <span className="text-lg mr-1 select-none animate-pulse">🔮</span>
          <Search className="text-emerald-600 w-4.5 h-4.5 group-focus-within:text-amber-500 transition-colors shrink-0 stroke-[3]" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearch}
          placeholder="🧙‍♂️ 输入神秘单词或三字经拼音寻找口诀..."
          className="w-full bg-white/95 backdrop-blur-md py-4 pl-14 pr-10 rounded-[22px] border-2 border-emerald-300 shadow-sm focus:ring-4 focus:ring-emerald-400/10 focus:border-amber-400 focus:bg-white outline-none transition-all text-sm sm:text-base text-emerald-950 placeholder:text-emerald-700/60 font-black animate-in slide-in-from-top-1 duration-200 border-b-[5px] border-emerald-400"
        />
        {searchQuery && (
          <button
            onClick={clearSearch}
            className="absolute inset-y-0 right-4 flex items-center px-1 text-emerald-600 hover:text-emerald-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
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
            className="bg-gradient-to-b from-white to-[#f4fbf6] border-2 border-emerald-300 rounded-[24px] shadow-md p-4 space-y-3.5 overflow-hidden mx-1 border-b-[6px]"
          >
            <h4 className="text-xs sm:text-[13px] font-black text-amber-700 uppercase tracking-widest px-1 flex items-center gap-1.5">
              <span>📜 太古碑文口诀卷轴</span>
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
            </h4>
            <div className="space-y-2 max-h-[190px] overflow-y-auto pr-1 custom-scrollbar">
              {searchResults.map((group) => (
                <div
                  key={group.id}
                  className="p-3 bg-[#f0fdf4] rounded-2xl border border-emerald-250 hover:border-amber-400/60 hover:bg-[#e6f9ed] transition-all text-left"
                >
                  <div className="flex justify-between items-start mb-1.5">
                    <div className="flex flex-wrap gap-1">
                      {group.words.map(w => (
                        <span key={w.text} className={`px-2.5 py-1 rounded-lg text-xs sm:text-[13.5px] font-black leading-none ${w.text.toLowerCase().includes(searchQuery.toLowerCase()) ? 'bg-amber-400 text-emerald-950 shadow border border-amber-305 font-extrabold scale-105' : 'bg-white text-emerald-800 border border-emerald-200'}`}>
                          {w.text}
                        </span>
                      ))}
                    </div>
                    <span className="text-[10px] sm:text-[11px] font-black text-emerald-600/70 uppercase tracking-widest font-mono">{group.title}</span>
                  </div>
                  <p className="text-emerald-955 font-black text-sm sm:text-[15px] leading-relaxed">
                    {group.rhyme.split(',').map((part, i) => (
                      <span key={i} className="block mt-0.5 first:mt-0">{part.trim()}</span>
                    ))}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TODAY'S QUESTS BOARD CONTAINER */}
      <div className="overflow-hidden px-1">
        <DailyQuestBoard quests={stats.quests} onQuestClick={onQuestClick} />
      </div>

      {/* FANTASY ADVENTURE WORLD MAP LAYOUT (BREAKTHROUGH GAME BOARD) */}
      <div className="px-1 space-y-4">
        {/* Section title */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-lg">🗺️</span>
            <span className="font-sans font-black text-emerald-950 text-sm sm:text-base tracking-wide">魔幻奥妙世界版图 (Adventure Map)</span>
          </div>
          <span className="text-[10px] text-amber-700 font-extrabold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 animate-pulse">
            勇者探险路线
          </span>
        </div>

        {/* Graphical Board Trail Map Container */}
        <div className="relative bg-gradient-to-b from-[#f3fcf6] to-[#e6faf0] border-2 border-emerald-300 border-b-[6px] border-emerald-400 rounded-[30px] shadow-lg overflow-hidden h-[590px] w-full z-10">
          
          {/* MAP GLOW EFFECT BACKDROP (Magical light halos to enrich environment depth) */}
          {/* Sunshine shaft radiating from top-right corner */}
          <div className="absolute top-0 right-0 w-[240px] h-[240px] bg-gradient-to-bl from-amber-200/25 via-yellow-100/5 to-transparent blur-2xl pointer-events-none select-none z-0" />
          
          {/* Glow 1: Behind Adventure Forest (Pine Green Glow) */}
          <div className="absolute top-[30px] left-[5%] w-32 h-32 bg-emerald-400/15 rounded-full blur-2xl pointer-events-none select-none z-0 animate-[pulse_3s_infinite_ease-in-out]" />
          
          {/* Glow 2: Behind Magic Playground (Sunny Amber Glow) */}
          <div className="absolute top-[30px] right-[5%] w-32 h-32 bg-orange-400/15 rounded-full blur-2xl pointer-events-none select-none z-0 animate-[pulse_3.5s_infinite_ease-in-out_0.2s]" />

          {/* Glow 3: Under centerpiece Magic Picture Book (Majestic Indigo and Gold Royal Halo) */}
          <div className="absolute top-[120px] left-1/2 -translate-x-1/2 w-[180px] h-[180px] bg-indigo-500/15 rounded-full blur-3xl pointer-events-none select-none z-0 animate-[pulse_4s_infinite_ease-in-out_0.8s]" />
          <div className="absolute top-[145px] left-1/2 -translate-x-1/2 w-28 h-28 bg-amber-400/5 rounded-full blur-2xl pointer-events-none select-none z-0 animate-[pulse_2.5s_infinite_ease-in-out_0.4s]" />

          {/* Glow 4: Behind Phonics Arena (Tingling Sparks Yellow Glow) */}
          <div className="absolute top-[260px] left-[5%] w-32 h-32 bg-yellow-400/15 rounded-full blur-2xl pointer-events-none select-none z-0 animate-[pulse_3.2s_infinite_ease-in-out_0.6s]" />

          {/* Glow 5: Behind Pet Sanctuary (Friendly Pink Blossom Glow) */}
          <div className="absolute top-[260px] right-[5%] w-32 h-32 bg-pink-400/15 rounded-full blur-2xl pointer-events-none select-none z-0 animate-[pulse_3s_infinite_ease-in-out_0.9s]" />

          {/* Glow 6: Under Enchanted Shop (Ancient Blue Oracle Glow) */}
          <div className="absolute bottom-[90px] left-1/2 -translate-x-1/2 w-36 h-36 bg-cyan-400/15 rounded-full blur-2xl pointer-events-none select-none z-0 animate-[pulse_3.8s_infinite_ease-in-out_1.2s]" />

          {/* Sinuous SVG Trail/Road connecting nodes */}
          <svg className="absolute inset-x-0 inset-y-0 w-full h-full pointer-events-none select-none opacity-50 z-0" viewBox="0 0 320 530" preserveAspectRatio="none">
            <path 
              d="M 65,80 Q 160,50 255,80 Q 260,140 160,195 Q 60,250 65,315 Q 160,285 255,315 Q 260,375 160,435" 
              fill="none" 
              stroke="#10b981" 
              strokeWidth="5" 
              strokeLinecap="round" 
              strokeDasharray="8 6" 
              className="animate-[dash_60s_linear_infinite]"
            />
          </svg>

          {/* Adorable visual landmark stickers inside fantasy map to enrich the environment */}
          <div className="absolute top-[1%] left-[45%] text-xs select-none pointer-events-none opacity-25">🌳</div>
          <div className="absolute top-[10%] left-[47%] -translate-x-1/2 text-lg select-none pointer-events-none opacity-20 animate-pulse">☀️</div>
          <div className="absolute top-[85px] left-[16%] text-xl select-none opacity-20 hover:opacity-40 hover:scale-110 transition-all pointer-events-none">🌋</div>
          <div className="absolute top-[85px] right-[18%] text-base select-none opacity-20 hover:opacity-40 hover:scale-110 transition-all pointer-events-none">⛺</div>
          <div className="absolute top-[220px] left-[16%] text-2xl select-none opacity-25 animate-[bounce_4s_infinite_ease-in-out] pointer-events-none">⛵</div>
          <div className="absolute top-[350px] right-[16%] text-xl select-none opacity-15 hover:opacity-35 hover:scale-110 transition-all pointer-events-none">🏛️</div>
          <div className="absolute top-[350px] left-[15%] text-lg select-none opacity-20 hover:opacity-45 pointer-events-none">🍄</div>
          <div className="absolute bottom-[20%] left-[44%] text-xs select-none pointer-events-none opacity-15">🌈</div>

          {/* Floating puffy cartoon clouds */}
          <div className="absolute top-[5%] left-[2%] text-2xl select-none opacity-30 animate-[bounce_8s_infinite_ease-in-out] pointer-events-none">☁️</div>
          <div className="absolute top-[24%] right-[2%] text-3xl select-none opacity-20 animate-[bounce_6s_infinite_ease-in-out_1s] pointer-events-none">☁️</div>
          <div className="absolute top-[48%] left-[78%] text-2xl select-none opacity-25 animate-[pulse_5s_infinite] pointer-events-none">☁️</div>

          {/* Magical Twinkling Sparkles */}
          <div className="absolute top-[130px] left-[26%] text-amber-400 text-xs animate-ping pointer-events-none">🌟</div>
          <div className="absolute top-[385px] right-[24%] text-yellow-500 text-sm animate-pulse pointer-events-none">🌟</div>
          <div className="absolute top-[230px] right-[20%] text-amber-400 text-xs animate-pulse pointer-events-none">🌟</div>

          {/* LAYER 1: HEAD STAGES */}
          {/* Stage 1: Adventure Forest (Left-Top) */}
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              try { audio.playClick(); } catch(e){}
              onNavigate('ADVENTURE');
            }}
            className="absolute top-[40px] left-[6%] flex flex-col items-center group cursor-pointer z-10"
          >
            <div className="w-[72px] h-[72px] rounded-full bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center text-3xl shadow-lg border-4 border-white group-hover:scale-110 active:scale-95 transition-transform duration-150 shrink-0 relative">
              <span>🌲</span>
              {reviewNeeded.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white font-black text-[10px] w-5.5 h-5.5 flex items-center justify-center rounded-full border-2 border-white animate-bounce shadow">
                  {reviewNeeded.length}
                </span>
              )}
            </div>
            <span className="font-black text-emerald-950 text-xs sm:text-[13px] mt-1.5 whitespace-nowrap text-shadow-[0_1px_2px_rgba(255,255,255,0.8)]">冒险深林</span>
            <span className="text-[10px] text-emerald-800 font-extrabold whitespace-nowrap">闯关背词</span>
          </motion.button>

          {/* Stage 2: Magic Playground (Right-Top) */}
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              try { audio.playClick(); } catch(e){}
              onNavigate('ARCADE');
            }}
            className="absolute top-[40px] right-[6%] flex flex-col items-center group cursor-pointer z-10"
          >
            <div className="w-[72px] h-[72px] rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-3xl shadow-lg border-4 border-white group-hover:scale-110 active:scale-95 transition-transform duration-150 shrink-0 relative">
              <span>🎮</span>
            </div>
            <span className="font-black text-orange-950 text-xs sm:text-[13px] mt-1.5 whitespace-nowrap text-shadow-[0_1px_2px_rgba(255,255,255,0.8)]">演武乐园</span>
            <span className="text-[10px] text-orange-700 font-extrabold whitespace-nowrap">趣味拼读</span>
          </motion.button>

          {/* LAYER 2: GRAND BOOK PALACE CENTERPIECE */}
          {/* Stage 3: Magic Picture Book Palace (Library) */}
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              try { audio.playClick(); } catch (e) {}
              onNavigate('PICTURE_BOOK');
            }}
            className="absolute top-[155px] left-1/2 -translate-x-1/2 flex flex-col items-center group cursor-pointer z-10"
          >
            <div className="w-[84px] h-[84px] rounded-full bg-gradient-to-br from-[#4f46e5] to-[#6366f1] flex items-center justify-center text-4xl shadow-xl border-4 border-amber-300 ring-4 ring-white ring-offset-0 group-hover:scale-110 active:scale-95 transition-transform duration-150 shrink-0 relative">
              <span>🏰</span>
              <span className="absolute -top-1 -right-2 bg-amber-400 text-amber-950 font-black text-[8px] px-1.5 py-0.5 rounded-full border border-amber-500 animate-pulse shadow-sm">NEW</span>
            </div>
            <span className="font-black text-indigo-950 text-xs sm:text-[14px] mt-2 whitespace-nowrap text-shadow-[0_1px_2px_rgba(255,255,255,0.8)]">魔法绘本馆</span>
            <span className="text-[10px] text-indigo-700 font-extrabold whitespace-nowrap">发音配音</span>
          </motion.button>

          {/* LAYER 3: MID-SUB STAGES */}
          {/* Stage 4: Phonics Arena (Left-Middle) */}
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              try { audio.playClick(); } catch(e){}
              onNavigate('PHONICS');
            }}
            className="absolute top-[275px] left-[6%] flex flex-col items-center group cursor-pointer z-10"
          >
            <div className="w-[72px] h-[72px] rounded-full bg-gradient-to-br from-yellow-400 to-[#f59e0b] flex items-center justify-center text-3xl shadow-lg border-4 border-white group-hover:scale-110 active:scale-95 transition-transform duration-150 shrink-0 relative">
              <span>⚡</span>
            </div>
            <span className="font-black text-amber-950 text-xs sm:text-[13px] mt-1.5 whitespace-nowrap text-shadow-[0_1px_2px_rgba(255,255,255,0.8)]">节奏修炼场</span>
            <span className="text-[10px] text-amber-800 font-extrabold whitespace-nowrap">说唱拼读</span>
          </motion.button>

          {/* Stage 5: Pet Sanctuary (Right-Middle) */}
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              try { audio.playClick(); } catch(e){}
              onNavigate('PETS');
            }}
            className="absolute top-[275px] right-[6%] flex flex-col items-center group cursor-pointer z-10"
          >
            <div className="w-[72px] h-[72px] rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-3xl shadow-lg border-4 border-white group-hover:scale-110 active:scale-95 transition-transform duration-150 shrink-0 relative">
              <span>🐾</span>
            </div>
            <span className="font-black text-rose-950 text-xs sm:text-[13px] mt-1.5 whitespace-nowrap text-shadow-[0_1px_2px_rgba(255,255,255,0.8)]">兽神圣域</span>
            <span className="text-[10px] text-rose-700 font-extrabold whitespace-nowrap">仙宠养成</span>
          </motion.button>

          {/* LAYER 4: BOTTOM STAGES */}
          {/* Stage 6: Enchanted Shop (Center-Bottom) */}
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              try { audio.playClick(); } catch(e){}
              onNavigate('SHOP');
            }}
            className="absolute top-[395px] left-1/2 -translate-x-1/2 flex flex-col items-center group cursor-pointer z-10"
          >
            <div className="w-[72px] h-[72px] rounded-full bg-gradient-to-br from-[#64b5f6] to-[#1e88e5] flex items-center justify-center text-3xl shadow-lg border-4 border-white group-hover:scale-110 active:scale-95 transition-transform duration-150 shrink-0 relative">
              <span>🪙</span>
            </div>
            <span className="font-black text-blue-950 text-[13px] mt-1.5 whitespace-nowrap text-shadow-[0_1px_2px_rgba(255,255,255,0.8)]">法秘商行</span>
            <span className="text-[10px] text-blue-700 font-extrabold whitespace-nowrap">神装置备</span>
          </motion.button>

          {/* LAYER 5: INTERACTIVE COMPACT CHRONICLES BAR / ERROR BUBBLE */}
          <div className="absolute bottom-[16px] inset-x-[4%] py-2.5 px-4 border-2 border-emerald-300/35 bg-[#ffffff]/50 backdrop-blur-md rounded-2xl flex justify-between items-center z-10 shadow-lg">
            {/* Quick stats feedback */}
            <div className="text-left flex flex-col justify-center">
              <span className="text-[10px] font-black text-emerald-800 uppercase block tracking-wider">太古冒险战史</span>
              <span className="text-xs sm:text-[13px] font-black text-emerald-950 mt-1 flex items-center gap-1">
                已学口诀 <strong className="text-emerald-700 text-sm font-extrabold">{stats.totalWordsLearned}</strong> 册
              </span>
            </div>

            {/* Floating Purification Error Bubble renamed to 错词汇 */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                try { audio.playClick(); } catch(e){}
                onOpenErrorCabinet?.();
              }}
              className="relative px-5 py-2.5 bg-gradient-to-r from-[#8126e8] to-[#601be0] hover:brightness-115 border-2 border-[#b573f9] border-b-[5px] border-b-[#4710ab] text-white font-extrabold text-[#ffffff] text-sm rounded-2xl shadow-[0_4px_12px_rgba(109,40,217,0.35)] hover:translate-y-[-1px] hover:shadow-[0_6px_16px_rgba(109,40,217,0.45)] active:border-b-2 active:translate-y-[2px] active:shadow-md transition-all duration-150 flex items-center justify-center gap-1.5 cursor-pointer select-none"
            >
              <span className="text-lg">📔</span>
              <span className="font-sans font-black tracking-wide">错词汇</span>
              {incorrectCount > 0 ? (
                <span className="bg-[#b9215b] text-[#ffffff] font-sans text-[11.5px] font-extrabold rounded-full px-2.5 py-0.5 shadow-inner flex items-center justify-center border border-white/20 ml-1.5 min-w-[28px] h-[21px]">
                  {incorrectCount}
                </span>
              ) : (
                <span className="bg-[#b9215b]/45 text-purple-200 text-[11.5px] font-extrabold rounded-full px-2.5 py-0.5 ml-1.5 min-w-[28px] h-[21px] flex items-center justify-center border border-white/15">
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
