import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, Gamepad2, Sparkles, Trophy, CircleDollarSign, ArrowRight, Search, X,
  Sword, Shield, Zap, Swords, Activity, Heart, Plus, Award
} from 'lucide-react';
import { UserStats, WordGroup, ViewState } from '../types';
import DailyQuestBoard from '../components/DailyQuestBoard';
import { CHARACTERS, SHOP_ITEMS } from '../constants';
import SafeImage from '../components/SafeImage';

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
}

const HomePage: React.FC<HomePageProps> = ({ stats, groups, reviewNeeded, onNavigate, onQuestClick, onUpdateStats }) => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [searchResults, setSearchResults] = React.useState<WordGroup[]>([]);
  const [isProfileExpanded, setIsProfileExpanded] = React.useState(false);
  const [activeProfileTab, setActiveProfileTab] = React.useState<'HERO' | 'PETS'>('HERO');

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
    <div className="space-y-4 animate-in fade-in duration-500 pb-4 relative w-full max-w-lg mx-auto overflow-x-hidden">
      {/* Dynamic Magical Forest Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10 bg-gradient-to-br from-[#022c22] via-[#011c12] to-[#0b1320]">
        {/* Soft glowing sunbeams and magical star lights */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-10%,_rgba(16,185,129,0.22)_0%,_transparent_65%)]" />
        <div className="absolute top-10 left-1/4 text-emerald-400/20 text-xl pointer-events-none animate-pulse">⭐</div>
        <div className="absolute top-1/3 right-12 text-yellow-300/15 text-2xl pointer-events-none animate-pulse">✨</div>
        <div className="absolute bottom-1/4 left-10 text-emerald-400/10 text-3xl pointer-events-none">✨</div>
        
        {/* Floating Spore Particles / Fireflies */}
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-emerald-400/20 blur-[2px]"
            style={{
              width: Math.random() * 6 + 4,
              height: Math.random() * 6 + 4,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [-10, -130],
              x: [0, Math.random() * 50 - 25],
              opacity: [0, 0.75, 0],
              scale: [0.6, 1.2, 0.6],
            }}
            transition={{
              duration: Math.random() * 12 + 10,
              repeat: Infinity,
              delay: Math.random() * 6,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      {/* COMPACT INTEGRATED MAGICAL ACADEMY DASHBOARD HEADER */}
      <div className="bg-gradient-to-b from-[#042f20]/90 to-[#022c22]/90 backdrop-blur-md rounded-2xl p-3 border border-emerald-500/30 shadow-2xl flex items-center justify-between text-white relative overflow-hidden">
        {/* Decorative ambient runic golden stream line */}
        <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-amber-400/60 to-transparent animate-pulse" />
        
        {/* Left: Branding Identity */}
        <div className="flex items-center space-x-2.5">
          <div className="relative">
            <span className="text-3xl select-none block animate-bounce filter drop-shadow-[0_2px_10px_rgba(52,211,153,0.5)]">🐯</span>
          </div>
          <div className="text-left shrink-0">
            <h1 className="text-sm font-black text-emerald-300 tracking-wider leading-none flex items-center gap-1 font-serif">
              <span>单词奇旅</span>
              <span className="text-[7.5px] bg-emerald-500/20 text-emerald-300 font-extrabold px-1 py-0.5 rounded leading-none border border-emerald-500/30">v2.1</span>
            </h1>
            <span className="text-[9px] text-emerald-400/60 font-black block mt-1 tracking-widest uppercase font-mono">Enchanted Realm</span>
          </div>
        </div>

        {/* Middle: Integrated XP & Level Counter (Small and neat) */}
        <div className="hidden sm:flex flex-col items-start space-y-1">
          <div className="flex items-center space-x-1.5 font-mono leading-none">
            <span className="text-[9px] font-black text-emerald-300 bg-emerald-900/50 border border-emerald-500/20 px-1 py-0.5 rounded">勇者.L{stats.level}</span>
            <span className="text-[8.5px] font-black text-emerald-400/80">({Math.floor((stats.xp % 1000) / 10)}%)</span>
          </div>
          <div className="w-[72px] h-1 bg-emerald-950/80 rounded-full overflow-hidden border border-emerald-800/20">
            <div className="bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500 h-full shadow-[0_0_8px_rgba(52,211,153,0.6)]" style={{ width: `${(stats.xp % 1000) / 10}%` }} />
          </div>
        </div>

        {/* Right: Gold and Attributes Character book trigger */}
        <div className="flex items-center space-x-2 relative">
          <div className="bg-[#011c12] border border-emerald-500/30 px-2 py-1 rounded-xl flex items-center space-x-1 shadow-inner">
            <CircleDollarSign size={13} className="text-amber-400 fill-amber-200 shrink-0" />
            <span className="font-extrabold text-[#fcd34d] text-xs tabular-nums">{stats.starCoins}</span>
          </div>

          <button 
            onClick={() => {
              setIsProfileExpanded(true);
            }}
            className="px-2.5 py-1.5 bg-emerald-800 hover:bg-emerald-700 text-emerald-100 border border-emerald-500/40 font-extrabold text-[10px] rounded-xl flex items-center gap-1 filter drop-shadow-[0_2px_4px_rgba(4,120,87,0.3)] hover:brightness-110 active:scale-95 transition-all cursor-pointer"
          >
            <span>🗡️ 契约符文</span>
            {unassignedPoints > 0 && (
              <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse shrink-0" />
            )}
          </button>
        </div>
      </div>

      {/* COMPACT WORD SEARCH SECTION */}
      <div className="relative group">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <Search className="text-emerald-400 w-4 h-4 group-focus-within:text-emerald-300 transition-colors" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearch}
          placeholder="搜索收录的魔法单词..."
          className="w-full bg-[#032219]/60 backdrop-blur-md py-3 pl-11 pr-10 rounded-xl border border-emerald-500/20 shadow-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 outline-none transition-all text-sm text-emerald-100 placeholder:text-emerald-600/70 font-bold"
        />
        {searchQuery && (
          <button
            onClick={clearSearch}
            className="absolute inset-y-0 right-3 flex items-center px-1 text-emerald-400 hover:text-emerald-200 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
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
            className="bg-gradient-to-b from-emerald-950 to-[#022c22] border-2 border-emerald-500/30 rounded-2xl shadow-2xl p-4 space-y-3.5 overflow-hidden"
          >
            <h4 className="text-[9px] font-black text-emerald-400 uppercase tracking-widest px-1">收录魔法口诀</h4>
            <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1 custom-scrollbar">
              {searchResults.map((group) => (
                <div
                  key={group.id}
                  className="p-3 bg-slate-900/60 rounded-xl border border-emerald-500/10 hover:bg-[#032219]/40 transition-colors text-left"
                >
                  <div className="flex justify-between items-start mb-1.5">
                    <div className="flex flex-wrap gap-1">
                      {group.words.map(w => (
                        <span key={w.text} className={`px-1.5 py-0.5 rounded text-[9px] font-black ${w.text.toLowerCase().includes(searchQuery.toLowerCase()) ? 'bg-amber-400 text-emerald-950 shadow-md font-extrabold' : 'bg-emerald-950/80 text-emerald-300'}`}>
                          {w.text}
                        </span>
                      ))}
                    </div>
                    <span className="text-[8px] font-black text-emerald-400/60 uppercase tracking-widest font-mono">{group.title}</span>
                  </div>
                  <p className="text-slate-200 font-bold text-xs leading-relaxed">
                    {group.rhyme.split(',').map((part, i) => (
                      <span key={i} className="block">{part.trim()}</span>
                    ))}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TODAY'S QUESTS BOARD CONTAINER (Highly snugged and beautifully integrated) */}
      <div className="overflow-hidden">
        <DailyQuestBoard quests={stats.quests} onQuestClick={onQuestClick} />
      </div>

      {/* COMPACT INTERACTIVE NAVIGATION PORTALS GRID - HIGHER DENSITY */}
      <div className="grid grid-cols-2 gap-4">
        {/* Portal A: Adventure Forest */}
        <motion.button 
          whileHover={{ scale: 1.02, boxShadow: "0 10px 30px -10px rgba(16,185,129,0.4)" }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onNavigate('ADVENTURE')} 
          className="p-4 bg-gradient-to-br from-[#064e3b]/50 to-[#022c22]/80 border-2 border-emerald-500/30 rounded-2xl text-left relative overflow-hidden group h-28 flex flex-col justify-between cursor-pointer shadow-lg"
        >
          <div className="absolute top-0 right-0 p-3 opacity-[0.05] group-hover:opacity-15 group-hover:scale-110 transition-all select-none pointer-events-none text-5xl">🌲</div>
          <div className="relative">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-400 w-8 h-8 rounded-xl flex items-center justify-center shadow-md shadow-emerald-900/30">
              <BookOpen className="text-[#022c22] w-4.5 h-4.5 stroke-[3]" />
            </div>
            {reviewNeeded.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[9px] font-black w-4 h-4 flex items-center justify-center rounded-full animate-pulse border border-[#022c22]">
                {reviewNeeded.length}
              </span>
            )}
          </div>
          <div>
            <h3 className="font-extrabold text-emerald-50 text-sm leading-none flex items-center gap-1 font-serif tracking-wide">
              <span>冒险深林密境</span>
              <ArrowRight size={10} className="text-emerald-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
            </h3>
            <span className="text-[9px] font-black text-emerald-400/55 block mt-1 uppercase tracking-wider font-mono">Spellbound Levels</span>
          </div>
        </motion.button>
        
        {/* Portal B: Magic Playground */}
        <motion.button 
          whileHover={{ scale: 1.02, boxShadow: "0 10px 30px -10px rgba(245,158,11,0.3)" }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onNavigate('ARCADE')} 
          className="p-4 bg-gradient-to-br from-amber-950/40 via-[#78350f]/35 to-[#451a03]/80 border-2 border-amber-500/30 rounded-2xl text-left relative overflow-hidden group h-28 flex flex-col justify-between cursor-pointer shadow-lg"
        >
          <div className="absolute top-0 right-0 p-3 opacity-[0.05] group-hover:opacity-15 group-hover:scale-110 transition-all select-none pointer-events-none text-5xl">🔮</div>
          <div className="bg-gradient-to-r from-amber-400 to-yellow-300 w-8 h-8 rounded-xl flex items-center justify-center shadow-md shadow-amber-900/30">
            <Gamepad2 className="text-amber-950 w-4.5 h-4.5 stroke-[3]" />
          </div>
          <div>
            <h3 className="font-extrabold text-amber-50 text-sm leading-none flex items-center gap-1 font-serif tracking-wide">
              <span>魔法演武乐园</span>
              <ArrowRight size={10} className="text-amber-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
            </h3>
            <span className="text-[9px] font-black text-amber-400/55 block mt-1 uppercase tracking-wider font-mono">Arcade Portal</span>
          </div>
        </motion.button>

        {/* Portal C: Word Classic Album (Full Width / Sleek banner style) */}
        <motion.button 
          whileHover={{ scale: 1.01, boxShadow: "0 10px 25px -10px rgba(20,184,166,0.2)" }}
          whileTap={{ scale: 0.99 }}
          onClick={() => onNavigate('COLLECTION')} 
          className="col-span-2 p-3.5 bg-gradient-to-r from-[#03241b]/95 via-[#022c22]/90 to-[#0e1726]/90 border-2 border-emerald-500/20 rounded-2xl text-left relative overflow-hidden group flex items-center justify-between cursor-pointer shadow-md"
        >
          <div className="flex items-center space-x-3.5 relative">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-400 w-8 h-8 rounded-xl flex items-center justify-center shadow-md">
              <Award className="text-[#022c22] w-4.5 h-4.5 stroke-[3]" />
            </div>
            <div>
              <h3 className="font-extrabold text-emerald-100 text-xs leading-none font-serif tracking-wide">太古百神之森 · 魔法秘图鉴</h3>
              <p className="text-[9.5px] font-bold text-emerald-400/75 mt-1">
                查阅我炼造的专属三字密经口诀卡、已征服 <span className="text-yellow-300 font-extrabold">{(stats.masteredWords || []).length}</span> 字咒语
              </p>
            </div>
          </div>
          <span className="text-[9px] bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 font-black px-2.5 py-1 rounded-xl group-hover:bg-gradient-to-r group-hover:from-emerald-500 group-hover:to-teal-400 group-hover:text-emerald-950 transition-all shrink-0">
            启阅秘阁 📖
          </span>
        </motion.button>
      </div>

      {/* IMMERSIVE RPG ATTRIBUTE / INVENTORY SHEET OVERLAY MODAL */}
      <AnimatePresence>
        {isProfileExpanded && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#01140e]/85 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="w-full max-w-sm bg-gradient-to-b from-[#011c13] to-[#042e20] border-2 border-emerald-500/35 rounded-3xl p-5 text-white shadow-2xl relative overflow-hidden max-h-[92vh] flex flex-col"
            >
              {/* Magical Header scroll effect */}
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-500 via-amber-400 to-emerald-500" />
              
              <div className="flex items-center justify-between mb-4 border-b border-emerald-500/10 pb-3">
                <div className="flex items-center space-x-2">
                  <span className="text-xl">🗡️</span>
                  <div className="text-left">
                    <h4 className="font-serif font-black text-sm text-emerald-300 tracking-wide">大勇者奥术契约书</h4>
                    <span className="text-[9px] text-emerald-400/60 block font-bold">主神圣域总战斗力: <span className="text-yellow-300 font-extrabold">{totalCombatPower} CP</span></span>
                  </div>
                </div>

                <button 
                  onClick={() => setIsProfileExpanded(false)}
                  className="p-1.5 hover:bg-emerald-900/50 bg-[#01140e] border border-emerald-500/30 rounded-lg text-emerald-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Scrollable Panel Area */}
              <div className="flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar">
                
                {/* Visual Tab Selector inside stats overlay */}
                <div className="flex bg-[#01120d] border border-emerald-500/10 p-1 rounded-xl">
                  <button 
                    onClick={() => setActiveProfileTab('HERO')}
                    className={`flex-1 py-1.5 text-[10px] font-black rounded-lg transition-all ${activeProfileTab === 'HERO' ? 'bg-gradient-to-r from-emerald-800 to-teal-800 border border-emerald-500/30 text-emerald-100 shadow-sm' : 'text-emerald-400/50 hover:text-emerald-200'}`}
                  >
                    🗡️ 勇者奥术属性
                  </button>
                  <button 
                    onClick={() => setActiveProfileTab('PETS')}
                    className={`flex-1 py-1.5 text-[10px] font-black rounded-lg transition-all ${activeProfileTab === 'PETS' ? 'bg-gradient-to-r from-emerald-800 to-teal-800 border border-emerald-500/30 text-emerald-100 shadow-sm' : 'text-emerald-400/50 hover:text-emerald-200'}`}
                  >
                    🐾 契约守护兽 ({stats.pets?.length || 0})
                  </button>
                </div>

                {activeProfileTab === 'HERO' ? (
                  <div className="space-y-4">
                    {/* Character Card Info */}
                    <div className="bg-[#01130d] border border-emerald-500/20 rounded-2xl p-4 flex items-center space-x-3.5 relative overflow-hidden">
                      <div className="absolute top-0 right-0 opacity-[0.06] select-none pointer-events-none text-9xl">
                        {selectedChar.avatar}
                      </div>
                      <div className="w-12 h-12 bg-emerald-550/10 rounded-xl border border-emerald-500/35 flex items-center justify-center text-2xl shrink-0">
                        {selectedChar.avatar}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h5 className="font-serif font-black text-white text-sm truncate">{selectedChar.name}</h5>
                          <span className="text-[8px] bg-emerald-900/50 text-emerald-300 font-extrabold px-1.5 py-0.5 rounded leading-none shrink-0 border border-emerald-500/30">
                            英雄 LV.{charStats.level}
                          </span>
                        </div>
                        <p className="text-[9px] font-semibold text-emerald-400/60 mt-1 italic leading-none truncate">{selectedChar.title}</p>
                        <p className="text-[10px] font-bold text-emerald-100/75 leading-normal mt-1.5 line-clamp-2">
                          {selectedChar.description}
                        </p>
                      </div>
                    </div>

                    {/* Compact rating pills */}
                    <div className="grid grid-cols-3 gap-2 bg-[#01140f]/60 p-2 rounded-2xl border border-emerald-500/20">
                      <div className="text-center">
                        <span className="text-[8px] font-black text-emerald-400/40 block mb-0.5 uppercase tracking-wide">基础战力</span>
                        <span className="font-extrabold text-[#fda4af] text-xs tabular-nums">{characterCombatPower}</span>
                      </div>
                      <div className="text-center border-x border-emerald-505/10">
                        <span className="text-[8px] font-black text-emerald-400/40 block mb-0.5 uppercase tracking-wide">守护加功</span>
                        <span className="font-extrabold text-teal-300 text-xs tabular-nums">+{activePetPower}</span>
                      </div>
                      <div className="text-center">
                        <span className="text-[8px] font-black text-emerald-400/40 block mb-0.5 uppercase tracking-wide">契约评分</span>
                        <span className="font-black text-yellow-300 text-xs tabular-nums">{totalCombatPower}</span>
                      </div>
                    </div>

                    {/* Attributes Distribution */}
                    <div className="space-y-3 bg-[#01130d]/35 border border-emerald-500/20 p-4 rounded-2xl">
                      <div className="flex items-center justify-between border-b border-emerald-500/10 pb-2 mb-1">
                        <span className="text-xs font-serif font-extrabold text-emerald-100">分配奥术神力属性</span>
                        <span className="bg-amber-400/10 text-[#fcd34d] border border-amber-500/30 px-2 py-0.5 rounded-lg text-[9px] font-black">
                          剩余 {unassignedPoints} 点
                        </span>
                      </div>

                      {/* Attribute Row strength */}
                      <div className="flex items-center justify-between bg-[#01150f] p-2 border border-emerald-500/10 rounded-xl">
                        <div className="flex items-center space-x-2">
                          <Sword size={12} className="text-red-400" />
                          <div>
                            <span className="font-black text-slate-200 text-xs block leading-none">力量</span>
                            <span className="text-[8px] text-emerald-400/50 font-bold block mt-0.5">提高扫尾和词怪击落度</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="font-black text-xs text-slate-200 tabular-nums">
                            {charStats.strength}
                            {bonusStrength > 0 && <span className="text-emerald-400 text-[10px] font-bold ml-1">+{bonusStrength}</span>}
                          </span>
                          <button
                            disabled={unassignedPoints <= 0}
                            onClick={() => handleAddAttributePoint('strength')}
                            className={`w-5 h-5 rounded flex items-center justify-center font-bold text-xs ${unassignedPoints > 0 ? 'bg-emerald-700 hover:bg-emerald-600 cursor-pointer text-white' : 'bg-emerald-950 text-emerald-800'}`}
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Attribute Row magic */}
                      <div className="flex items-center justify-between bg-[#01150f] p-2 border border-emerald-500/10 rounded-xl">
                        <div className="flex items-center space-x-2">
                          <Zap size={12} className="text-purple-400" />
                          <div>
                            <span className="font-black text-slate-200 text-xs block leading-none">魔力</span>
                            <span className="text-[8px] text-emerald-400/50 font-bold block mt-0.5">净化音标及闪避护盾</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="font-black text-xs text-slate-200 tabular-nums">
                            {charStats.magic}
                            {bonusMagic > 0 && <span className="text-emerald-400 text-[10px] font-bold ml-1">+{bonusMagic}</span>}
                          </span>
                          <button
                            disabled={unassignedPoints <= 0}
                            onClick={() => handleAddAttributePoint('magic')}
                            className={`w-5 h-5 rounded flex items-center justify-center font-bold text-xs ${unassignedPoints > 0 ? 'bg-purple-700 hover:bg-purple-600 cursor-pointer text-white' : 'bg-emerald-950 text-emerald-800'}`}
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Attribute Row defense */}
                      <div className="flex items-center justify-between bg-[#01150f] p-2 border border-emerald-500/10 rounded-xl">
                        <div className="flex items-center space-x-2">
                          <Shield size={12} className="text-blue-400" />
                          <div>
                            <span className="font-black text-slate-200 text-xs block leading-none">防御</span>
                            <span className="text-[8px] text-emerald-400/50 font-bold block mt-0.5">提供更高的拼读防守度</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="font-black text-xs text-slate-200 tabular-nums">
                            {charStats.defense}
                            {bonusDefense > 0 && <span className="text-emerald-400 text-[10px] font-bold ml-1">+{bonusDefense}</span>}
                          </span>
                          <button
                            disabled={unassignedPoints <= 0}
                            onClick={() => handleAddAttributePoint('defense')}
                            className={`w-5 h-5 rounded flex items-center justify-center font-bold text-xs ${unassignedPoints > 0 ? 'bg-blue-705 hover:bg-blue-600 cursor-pointer text-white' : 'bg-emerald-950 text-emerald-800'}`}
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Attribute Row agility */}
                      <div className="flex items-center justify-between bg-[#01150f] p-2 border border-emerald-500/10 rounded-xl">
                        <div className="flex items-center space-x-2">
                          <Activity size={12} className="text-[#34d399]" />
                          <div>
                            <span className="font-black text-slate-200 text-xs block leading-none">敏捷</span>
                            <span className="text-[8px] text-emerald-400/50 font-bold block mt-0.5">提升连击爆伤倍率</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="font-black text-xs text-slate-200 tabular-nums">
                            {charStats.agility}
                            {bonusAgility > 0 && <span className="text-[#34d399] text-[10px] font-bold ml-1">+{bonusAgility}</span>}
                          </span>
                          <button
                            disabled={unassignedPoints <= 0}
                            onClick={() => handleAddAttributePoint('agility')}
                            className={`w-5 h-5 rounded flex items-center justify-center font-bold text-xs ${unassignedPoints > 0 ? 'bg-emerald-700 hover:bg-emerald-600 cursor-pointer text-white' : 'bg-emerald-950 text-emerald-800'}`}
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {spentPoints > 0 && (
                        <div className="flex justify-end pt-1">
                          <button 
                            onClick={handleResetAttributePoints}
                            className="bg-emerald-950/80 hover:bg-emerald-900 text-emerald-400 font-extrabold text-[9px] px-2.5 py-1.5 rounded-lg border border-emerald-500/20 focus:outline-none transition-all cursor-pointer"
                          >
                            🔄 重置大奥术潜能点
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Active Equipments List */}
                    {equippedItems.length > 0 && (
                      <div className="bg-[#01130d]/35 border border-emerald-500/25 p-3 rounded-2xl">
                        <span className="text-[9px] font-black text-emerald-355 block mb-2 uppercase px-1 font-mono tracking-wider">正在装备魔法圣护具</span>
                        <div className="grid grid-cols-2 gap-2">
                          {equippedItems.map(item => (
                            <div key={item.id} className="flex items-center space-x-2 p-2 bg-emerald-950/70 border border-emerald-500/10 rounded-xl">
                              <div className="w-6 h-6 bg-amber-500/10 text-xs flex items-center justify-center rounded-lg border border-amber-500/20">🛡️</div>
                              <div className="min-w-0">
                                <span className="text-[10px] font-extrabold text-emerald-100 block truncate leading-none">{item.name}</span>
                                <span className="text-[8px] font-bold text-emerald-400 block mt-0.5 truncate leading-none">
                                  {Object.entries(item.stats || {}).map(([key, value]) => `${key === 'strength' ? '力' : key === 'magic' ? '魔' : key === 'defense' ? '防' : '敏'}+${value}`).join(',')}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3.5">
                    {stats.pets && stats.pets.length > 0 ? (
                      <div className="space-y-2.5">
                        {stats.pets.map((pet, idx) => {
                          const cp = Math.floor(pet.level * 50 + pet.happiness * 1.5 + pet.health * 1);
                          return (
                            <div key={pet.id || idx} className="bg-[#01130d] border border-emerald-500/20 rounded-2xl p-3 flex justify-between items-center relative overflow-hidden">
                              <div className="absolute top-0 right-0 p-1 opacity-[0.03] select-none pointer-events-none text-7xl">
                                {PET_EMOJIS[pet.type] || '🐾'}
                              </div>
                              <div className="flex items-center space-x-3 relative z-10 min-w-0">
                                <span className="text-3xl p-1.5 bg-[#01110c] rounded-xl border border-emerald-500/20 shrink-0">
                                  {PET_EMOJIS[pet.type] || '🐾'}
                                </span>
                                <div className="text-left min-w-0">
                                  <div className="flex items-center gap-1">
                                    <h5 className="font-extrabold text-white text-xs truncate">{pet.name}</h5>
                                    <span className="text-[7.5px] bg-[#10b981]/15 text-emerald-300 font-extrabold px-1 rounded uppercase">
                                      LV.{pet.level}
                                    </span>
                                  </div>
                                  <div className="flex items-center space-x-2 text-[8.5px] font-bold text-emerald-400/50 mt-1">
                                    <span>❤️生命 {pet.health}/100</span>
                                    <span>⭐快乐 {pet.happiness}/100</span>
                                  </div>
                                </div>
                              </div>
                              <div className="text-right flex flex-col justify-center relative z-10 shrink-0 select-none">
                                <span className="text-[7.5px] font-black text-emerald-500/50 uppercase">守护力</span>
                                <span className="font-black text-emerald-400 text-xs tabular-nums">+{cp} CP</span>
                              </div>
                            </div>
                          );
                        })}
                        <button
                          onClick={() => {
                            setIsProfileExpanded(false);
                            onNavigate('PETS');
                          }}
                          className="w-full bg-emerald-805 hover:bg-emerald-900 bg-gradient-to-r from-emerald-800 to-teal-800 text-white font-black text-[10px] py-3 rounded-xl transition-all flex items-center justify-center space-x-1 border border-emerald-700 shadow-md cursor-pointer mt-2"
                        >
                          <span>进入契约兽神域进行特训 ⚔️</span>
                          <ArrowRight size={11} />
                        </button>
                      </div>
                    ) : (
                      <div className="bg-[#01110c] rounded-2xl p-6 border border-emerald-500/10 text-center py-8">
                        <span className="text-4xl block mb-2 pointer-events-none select-none">🥚</span>
                        <h6 className="font-extrabold text-[#f1f5f9] text-xs">暂无在役宠兽</h6>
                        <p className="text-[10px] font-bold text-emerald-400/50 max-w-xs mx-auto mb-4 leading-normal mt-1.5">
                          可累积符文金币前往魔法商店购买雷光雏龙/萌兔之卵！在背词挑战中展现奥术魔法吧！
                        </p>
                        <button
                          onClick={() => {
                            setIsProfileExpanded(false);
                            onNavigate('SHOP');
                          }}
                          className="bg-emerald-650 hover:bg-emerald-700 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-extrabold text-[10px] px-4 py-2 rounded-xl transition-all shadow-md cursor-pointer focus:outline-none"
                        >
                          前往魔法秘宝商店 🪙
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Close attributes footer info */}
              <div className="bg-[#01110c] rounded-xl p-2.5 border border-emerald-500/10 text-center mt-4 justify-center">
                <span className="text-[8px] font-bold text-emerald-400/40 block">
                  得到的奥术金币可以前往 [魔法商店] 购买神兽与圣域护甲
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
