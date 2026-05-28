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
import audio from '../utils/AudioUtils';

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

  // Interactive Mascot dialogues to engage children
  const MASCOT_DIALOGUES = React.useMemo(() => [
    "哈罗！我是魔法学院小向导波波！今天要去哪里探险呢？🧙‍♀️",
    "哇！大勇者你今天的奥术魔力值非常饱满，感觉拼词可以发挥超群！✨",
    "开拓视野的秘诀：去【冒险深林密境】关卡挑战，能得到好多星星币和经验奖励哦！🌲",
    "要是有点累了，就去【魔法演武乐园】跟萌宠玩会儿双音拼写、打地鼠，可好玩啦！🎮",
    "在【契约符文】里，你可以分配升级属性点，提升力量以斩落更高级的单词魔王！🗡️",
    "悄悄和你说，商店老板最近新上架了超酷炫的剑帽和守护兽龙蛋，快往秘宝商店看看吧！🪙",
    "摸摸我的小卷卷，好运气加倍！今天背诵的三字口诀全都牢牢印在脑海里！💖",
    "听！太古魔法林里的仙鸟在唱歌，说明你今天非常有奥语拼写的天赋哦！🦉"
  ], []);

  const [mascotDialogueIdx, setMascotDialogueIdx] = React.useState(0);
  const [mascotBounce, setMascotBounce] = React.useState(false);

  const handleMascotClick = () => {
    try {
      audio.playPop();
    } catch (e) {}
    setMascotBounce(true);
    setTimeout(() => setMascotBounce(false), 500);
    setMascotDialogueIdx((prev) => (prev + 1) % MASCOT_DIALOGUES.length);
  };

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
    <div className="space-y-4.5 animate-in fade-in duration-500 pb-6 relative w-full max-w-lg mx-auto overflow-x-hidden">
      {/* Dynamic Magical Forest & Astro-Core Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10 bg-gradient-to-b from-[#eafaf1] via-[#f3fcf7] to-[#f9fef6]">
        {/* Soft glowing fairy lights and magical sunbeams */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-10%,_rgba(16,185,129,0.18)_0%,_transparent_70%)]" />
        <div className="absolute top-8 left-1/10 text-emerald-500/40 text-xl pointer-events-none animate-bounce">🌱</div>
        <div className="absolute top-1/4 right-8 text-amber-400/50 text-2xl pointer-events-none animate-pulse">✨</div>
        <div className="absolute bottom-1/3 left-6 text-emerald-400/30 text-3xl pointer-events-none animate-bounce">🍀</div>
        <div className="absolute bottom-1/5 right-10 text-teal-400/30 text-2xl pointer-events-none animate-pulse">🌸</div>

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

      {/* COMPACT INTEGRATED MAGICAL ACADEMY DASHBOARD HEADER */}
      <div className="bg-gradient-to-b from-white via-[#f3fbf6] to-[#ebfaf0] border-2 border-emerald-300 border-b-[5px] border-emerald-400 rounded-3xl p-3.5 shadow-sm flex items-center justify-between text-emerald-950 relative overflow-hidden">
        {/* Soft glowing line at top */}
        <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-amber-400/60 to-transparent animate-pulse" />

        {/* Left: Branding Identity */}
        <div className="flex items-center space-x-2">
          <motion.div 
            whileHover={{ scale: 1.15, rotate: [0, -10, 10, 0] }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 12 }}
            className="cursor-pointer select-none"
            onClick={() => {
              try { audio.playCheer(); } catch(e){}
            }}
          >
            <span className="text-3.5xl block filter drop-shadow-[0_2px_8px_rgba(52,211,153,0.5)]">🐯</span>
          </motion.div>
          <div className="text-left shrink-0">
            <h1 className="text-xs font-black text-emerald-900 tracking-wider leading-none flex items-center gap-1">
              <span>单词奇旅</span>
              <span className="text-[7px] bg-amber-400 text-amber-950 font-black px-1 py-0.5 rounded shadow-sm">v2.5</span>
            </h1>
            <span className="text-[8px] text-emerald-600/70 font-bold block mt-1 tracking-wider font-mono">ENCHANTED FOREST</span>
          </div>
        </div>

        {/* Middle: Integrated XP and Level Potion Bottle */}
        <div className="flex flex-col items-start space-y-1 bg-white/60 border border-emerald-200/50 px-2 py-1 rounded-2xl">
          <div className="flex items-center space-x-1 font-mono leading-none">
            <span className="text-[8.5px] font-black text-emerald-850">🌟 魔力 LV.{stats.level}</span>
          </div>
          <div className="w-[64px] h-2 bg-emerald-100 rounded-full overflow-hidden border border-emerald-250 relative">
            <div className="bg-gradient-to-r from-emerald-400 via-amber-400 to-teal-400 h-full" style={{ width: `${(stats.xp % 1000) / 10}%` }} />
            {/* Tiny stars sparkle inside HP bar */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.4)_1px,_transparent_1px)] bg-[length:6px_6px] animate-pulse" />
          </div>
        </div>

        {/* Right: Gold and Attributes Character book trigger */}
        <div className="flex items-center space-x-1.5 relative">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="bg-white border-2 border-amber-300 px-2 py-1 rounded-2xl flex items-center space-x-0.5 shadow-sm cursor-default"
          >
            <CircleDollarSign size={12} className="text-amber-500 fill-amber-250 shrink-0" />
            <span className="font-extrabold text-amber-705 text-xs tabular-nums">{stats.starCoins}</span>
          </motion.div>

          <button 
            onClick={() => {
              try { audio.playClick(); } catch(e){}
              setIsProfileExpanded(true);
            }}
            className="px-2.5 py-1.5 bg-gradient-to-r from-[#10b981] to-[#059669] hover:brightness-105 hover:scale-103 active:scale-97 text-white font-black text-[9px] rounded-2xl border-b-3 border-emerald-700 flex items-center gap-1 shadow-sm transition-all cursor-pointer"
          >
            <span>属性 🗡️</span>
            {unassignedPoints > 0 && (
              <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse shrink-0" />
            )}
          </button>
        </div>
      </div>

      {/* INTERACTIVE ELFIN MASCOT Companion (波波 speech bubble layout) */}
      <div className="flex items-end space-x-3.5 relative px-1">
        {/* Mascot Figure with wooden-tag label */}
        <div className="flex flex-col items-center shrink-0">
          <motion.div 
            animate={{ 
              y: [0, -6, 0],
              rotate: [-2, 2, -2]
            }}
            transition={{ 
              repeat: Infinity, 
              duration: 2.2, 
              ease: "easeInOut" 
            }}
            whileHover={{ scale: 1.15 }}
            onClick={handleMascotClick}
            className="w-14 h-14 bg-gradient-to-b from-[#eefcf4] via-emerald-100 to-[#d1fae5] border-2 border-emerald-300 rounded-full flex items-center justify-center text-4xl shadow-md cursor-pointer select-none filter drop-shadow-[0_4px_10px_rgba(16,185,129,0.25)] relative"
          >
            🧚‍♀️
            <div className="absolute -bottom-1 -right-1 bg-amber-450 text-emerald-950 font-black text-[7px] w-4.5 h-4.5 flex items-center justify-center rounded-full border border-emerald-600 shadow animate-bounce">
              💬
            </div>
          </motion.div>
          
          {/* Wooden style small label tag */}
          <div className="bg-[#b45309] text-[#fef3c7] text-[8px] font-black px-1.5 py-0.5 rounded-md mt-1 border border-[#92400e] text-center shadow-sm select-none leading-none">
            精灵教官·波波
          </div>
        </div>

        {/* Real Game dialogue Speech Bubble next to Bobo */}
        <motion.div 
          animate={mascotBounce ? { scale: [1, 1.04, 0.97, 1.02, 1] } : {}}
          onClick={handleMascotClick}
          className="relative bg-white border-2 border-emerald-250 p-3 rounded-2xl shadow-sm text-left flex-1 min-w-0 cursor-pointer hover:bg-emerald-50/20 active:scale-99 transition-all"
        >
          {/* Bubble Arrow pointing left to Bobo */}
          <div className="absolute left-[-8px] top-6 w-0 h-0 border-y-[6px] border-y-transparent border-r-[8px] border-r-white z-10" />
          <div className="absolute left-[-10px] top-[23px] w-0 h-0 border-y-[7px] border-y-transparent border-r-[9px] border-r-emerald-250" />

          <div className="flex items-center justify-between border-b border-emerald-100/50 pb-1 mb-1 relative z-10">
            <span className="text-[8.5px] font-black text-emerald-800 tracking-wider">🌟 训练场密教导师</span>
            <span className="text-[7.5px] text-amber-600 font-extrabold animate-pulse">✨ 戳我有魔法秘语！</span>
          </div>

          <p className="text-[11px] font-black text-emerald-950 leading-relaxed min-h-[30px] flex items-center select-none relative z-10 pr-2">
            {MASCOT_DIALOGUES[mascotDialogueIdx]}
          </p>

          <div className="absolute bottom-1 right-2 w-3.5 h-3.5 bg-emerald-100/50 rounded-full flex items-center justify-center text-[7px] text-emerald-600 font-black opacity-0 group-hover:opacity-100">
            ➔
          </div>
        </motion.div>
      </div>

      {/* COMPACT WORD SEARCH SECTION */}
      <div className="relative group px-1">
        <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
          <Search className="text-emerald-500 w-4 h-4 group-focus-within:text-amber-500 transition-colors shrink-0" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearch}
          placeholder="🧙‍♂️ 寻觅隐藏的太古奥术词 (比如 dad, van, class)..."
          className="w-full bg-white/95 backdrop-blur-md py-3 pl-11 pr-10 rounded-2xl border-2 border-emerald-350 shadow-sm focus:ring-2 focus:ring-emerald-400/20 focus:border-amber-500 outline-none transition-all text-[11.5px] text-emerald-950 placeholder:text-emerald-700/50 font-black animate-in slide-in-from-top-2 duration-300 border-b-[4px] border-emerald-400"
        />
        {searchQuery && (
          <button
            onClick={clearSearch}
            className="absolute inset-y-0 right-4 flex items-center px-1 text-emerald-600 hover:text-emerald-800 transition-colors cursor-pointer"
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
            className="bg-gradient-to-b from-white to-[#f4fbf6] border-2 border-emerald-300 rounded-3xl shadow-md p-4 space-y-3.5 overflow-hidden mx-1"
          >
            <h4 className="text-[9.5px] font-black text-amber-700 uppercase tracking-widest px-1 flex items-center gap-1">
              <span>📜 太古碑文口诀卷轴</span>
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
            </h4>
            <div className="space-y-2 max-h-[190px] overflow-y-auto pr-1 custom-scrollbar">
              {searchResults.map((group) => (
                <div
                  key={group.id}
                  className="p-3 bg-[#f0fdf4] rounded-2xl border border-emerald-200 hover:border-amber-400/60 hover:bg-[#e6f9ed] transition-all text-left"
                >
                  <div className="flex justify-between items-start mb-1.5">
                    <div className="flex flex-wrap gap-1">
                      {group.words.map(w => (
                        <span key={w.text} className={`px-2 py-0.5 rounded-lg text-[9.5px] font-black leading-none ${w.text.toLowerCase().includes(searchQuery.toLowerCase()) ? 'bg-amber-400 text-emerald-950 shadow border border-amber-305 font-extrabold scale-105' : 'bg-white text-emerald-800 border border-emerald-200'}`}>
                          {w.text}
                        </span>
                      ))}
                    </div>
                    <span className="text-[8px] font-black text-emerald-600/70 uppercase tracking-widest font-mono">{group.title}</span>
                  </div>
                  <p className="text-emerald-950 font-black text-xs leading-relaxed">
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

      {/* COMPACT INTERACTIVE NAVIGATION PORTALS GRID - RATIONAL GAME MAP BENTO LAYOUT */}
      <div className="grid grid-cols-2 gap-3.5 px-1 pb-1">
        {/* Portal A: Adventure Forest (Major game mode - Green 3D Toy Button) */}
        <motion.button 
          whileHover={{ scale: 1.03, y: -2 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => {
            try { audio.playClick(); } catch(e){}
            onNavigate('ADVENTURE');
          }} 
          className="p-3.5 bg-gradient-to-br from-[#acd65c] via-[#4caf50] to-[#15803d] border-2 border-emerald-200 border-b-[6px] border-emerald-700 hover:border-emerald-100 rounded-3xl text-left relative overflow-hidden group h-28 flex flex-col justify-between cursor-pointer shadow-md transition-all active:border-b-[2px] active:translate-y-[4px]"
        >
          {/* Animated leaf inside backdrop */}
          <div className="absolute top-[-20px] right-[-20px] w-18 h-18 bg-white/10 rounded-full blur-xl group-hover:scale-125 transition-transform" />
          <div className="absolute bottom-1 right-1 p-1 opacity-12 group-hover:opacity-30 group-hover:rotate-12 group-hover:scale-125 transition-all select-none pointer-events-none text-4xl">🌲</div>
          
          <div className="relative">
            <div className="bg-white/80 w-8 h-8 rounded-xl flex items-center justify-center shadow">
              <BookOpen className="text-emerald-800 w-4.5 h-4.5 stroke-[3] group-hover:animate-bounce" />
            </div>
            {reviewNeeded.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[9px] font-black w-4.5 h-4.5 flex items-center justify-center rounded-full animate-pulse border border-white shadow-md">
                {reviewNeeded.length}
              </span>
            )}
          </div>
          <div>
            <h3 className="font-black text-white text-xs leading-none flex items-center gap-1">
              <span>冒险深林密境</span>
            </h3>
            <span className="text-[7.5px] font-bold text-white/90 block mt-1 leading-none">
              闯关收割星星币 ⚔️
            </span>
          </div>
        </motion.button>
        
        {/* Portal B: Magic Playground (Major game mode - Orange 3D Toy Button) */}
        <motion.button 
          whileHover={{ scale: 1.03, y: -2 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => {
            try { audio.playClick(); } catch(e){}
            onNavigate('ARCADE');
          }} 
          className="p-3.5 bg-gradient-to-br from-[#fccf31] via-[#f69d3c] to-[#c2410c] border-2 border-amber-200 border-b-[6px] border-amber-700 hover:border-amber-100 rounded-3xl text-left relative overflow-hidden group h-28 flex flex-col justify-between cursor-pointer shadow-md transition-all active:border-b-[2px] active:translate-y-[4px]"
        >
          {/* Interactive bubble behind banner */}
          <div className="absolute top-[-20px] right-[-20px] w-18 h-18 bg-white/10 rounded-full blur-xl group-hover:scale-125 transition-transform" />
          <div className="absolute bottom-1 right-1 p-1 opacity-12 group-hover:opacity-30 group-hover:-rotate-12 group-hover:scale-125 transition-all select-none pointer-events-none text-4xl">🔮</div>
          
          <div className="bg-white/80 w-8 h-8 rounded-xl flex items-center justify-center shadow">
            <Gamepad2 className="text-amber-800 w-4.5 h-4.5 stroke-[3] group-hover:rotate-12" />
          </div>
          <div>
            <h3 className="font-black text-white text-xs leading-none flex items-center gap-1">
              <span>魔法演武乐园</span>
            </h3>
            <span className="text-[7.5px] font-bold text-white/95 block mt-1 leading-none">
              超萌神兽对决游戏 🎮
            </span>
          </div>
        </motion.button>

        {/* Portal C: Pet Sanctuary (Direct access to Pets - Pink 3D Toy Button) */}
        <motion.button 
          whileHover={{ scale: 1.03, y: -2 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => {
            try { audio.playClick(); } catch(e){}
            onNavigate('PETS');
          }} 
          className="p-3.5 bg-gradient-to-br from-[#fda4af] via-[#f43f5e] to-[#be123c] border-2 border-rose-200 border-b-[6px] border-rose-700 hover:border-rose-100 rounded-3xl text-left relative overflow-hidden group h-28 flex flex-col justify-between cursor-pointer shadow-md transition-all active:border-b-[2px] active:translate-y-[4px]"
        >
          <div className="absolute top-[-20px] right-[-20px] w-18 h-18 bg-white/10 rounded-full blur-xl group-hover:scale-125 transition-transform" />
          <div className="absolute bottom-1 right-1 p-1 opacity-12 group-hover:opacity-30 group-hover:rotate-6 group-hover:scale-125 transition-all select-none pointer-events-none text-4xl">🐾</div>
          
          <div className="bg-white/80 w-8 h-8 rounded-xl flex items-center justify-center shadow">
            <span className="text-base select-none">🐾</span>
          </div>
          <div>
            <h3 className="font-black text-white text-xs leading-none flex items-center gap-1">
              <span>契约兽神域</span>
            </h3>
            <span className="text-[7.5px] font-bold text-white/95 block mt-1 leading-none">
              特训喂养你的高分宠 🍔
            </span>
          </div>
        </motion.button>

        {/* Portal D: Enchanted Shop (Direct access to Shop - Blue 3D Toy Button) */}
        <motion.button 
          whileHover={{ scale: 1.03, y: -2 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => {
            try { audio.playClick(); } catch(e){}
            onNavigate('SHOP');
          }} 
          className="p-3.5 bg-gradient-to-br from-[#93c5fd] via-[#3b82f6] to-[#1d4ed8] border-2 border-blue-200 border-b-[6px] border-blue-700 hover:border-blue-100 rounded-3xl text-left relative overflow-hidden group h-28 flex flex-col justify-between cursor-pointer shadow-md transition-all active:border-b-[2px] active:translate-y-[4px]"
        >
          <div className="absolute top-[-20px] right-[-20px] w-18 h-18 bg-white/10 rounded-full blur-xl group-hover:scale-125 transition-transform" />
          <div className="absolute bottom-1 right-1 p-1 opacity-12 group-hover:opacity-30 group-hover:-rotate-6 group-hover:scale-125 transition-all select-none pointer-events-none text-4xl">🪙</div>
          
          <div className="bg-white/80 w-8 h-8 rounded-xl flex items-center justify-center shadow">
            <span className="text-sm select-none">💎</span>
          </div>
          <div>
            <h3 className="font-black text-white text-xs leading-none flex items-center gap-1">
              <span>魔法秘宝商店</span>
            </h3>
            <span className="text-[7.5px] font-bold text-white/95 block mt-1 leading-none">
              星星币换高强法套 🪙
            </span>
          </div>
        </motion.button>

        {/* Portal E: Word Classic Album (Full Width / Epic Scroll Portal with golden trim) */}
        <motion.button 
          whileHover={{ scale: 1.015, y: -1 }}
          whileTap={{ scale: 0.985 }}
          onClick={() => {
            try { audio.playClick(); } catch(e){}
            onNavigate('COLLECTION');
          }} 
          className="col-span-2 p-3.5 bg-gradient-to-r from-[#eefaf2] via-white to-[#fffbe8] border-2 border-emerald-300 border-b-[6px] border-emerald-500 rounded-3xl text-left relative overflow-hidden group flex items-center justify-between cursor-pointer shadow-sm active:border-b-[2px] active:translate-y-[4px]"
        >
          <div className="absolute inset-y-0 right-0 w-[40%] bg-gradient-to-l from-emerald-500/5 to-transparent pointer-events-none" />
          
          <div className="flex items-center space-x-3 relative z-10 min-w-0">
            <div className="bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-350 w-9 h-9 rounded-xl flex items-center justify-center shadow-sm">
              <Award className="text-emerald-950 w-4.5 h-4.5 stroke-[3]" />
            </div>
            <div className="min-w-0 text-left">
              <h3 className="font-black text-emerald-900 text-xs leading-none flex items-center gap-1">
                <span>太古百神之森 · 魔法秘图鉴</span>
                <span className="bg-emerald-100/90 text-emerald-700 text-[8px] font-black px-1.5 py-0.5 rounded border border-emerald-200">秘阁</span>
              </h3>
              <p className="text-[9.5px] font-bold text-emerald-700/85 mt-2 leading-none">
                已点亮魔法徽记卡 <span className="text-amber-600 font-black">{(stats.masteredWords || []).length}</span> 枚 🔮
              </p>
            </div>
          </div>
          <span className="text-[9.5px] bg-white border border-emerald-250 text-emerald-850 font-black px-2.5 py-2 rounded-xl group-hover:bg-[#acd65c] group-hover:text-emerald-950 group-hover:border-transparent transition-all shrink-0 shadow-xs relative z-10">
            启阅秘卡 📖
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
            className="fixed inset-0 z-50 bg-[#062419]/60 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="w-full max-w-sm bg-gradient-to-b from-[#fbfcf3] via-[#f7faf0] to-[#edf3e8] border-2 border-emerald-405/85 rounded-3xl p-5 text-emerald-950 shadow-2xl relative overflow-hidden max-h-[92vh] flex flex-col"
            >
              {/* Magical Header scroll effect */}
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-500 via-amber-400 to-emerald-500" />
              
              <div className="flex items-center justify-between mb-4 border-b border-emerald-200 pb-3">
                <div className="flex items-center space-x-2">
                  <span className="text-xl">🗡️</span>
                  <div className="text-left">
                    <h4 className="font-serif font-black text-sm text-emerald-900 tracking-wide">大勇者奥术契约书</h4>
                    <span className="text-[9.5px] text-emerald-700 font-bold">主神圣域总战斗力: <span className="text-amber-600 font-extrabold">{totalCombatPower} CP</span></span>
                  </div>
                </div>

                <button 
                  onClick={() => setIsProfileExpanded(false)}
                  className="p-1.5 hover:bg-emerald-100 bg-white border border-emerald-300 rounded-lg text-emerald-700 hover:text-emerald-950 transition-colors cursor-pointer"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Scrollable Panel Area */}
              <div className="flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar">
                
                {/* Visual Tab Selector inside stats overlay */}
                <div className="flex bg-emerald-50/80 border border-emerald-250 p-1 rounded-xl">
                  <button 
                    onClick={() => setActiveProfileTab('HERO')}
                    className={`flex-1 py-1.5 text-[10px] font-black rounded-lg transition-all ${activeProfileTab === 'HERO' ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-sm' : 'text-emerald-700 hover:text-emerald-900'}`}
                  >
                    🗡️ 勇者奥术属性
                  </button>
                  <button 
                    onClick={() => setActiveProfileTab('PETS')}
                    className={`flex-1 py-1.5 text-[10px] font-black rounded-lg transition-all ${activeProfileTab === 'PETS' ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-sm' : 'text-emerald-700 hover:text-emerald-900'}`}
                  >
                    🐾 契约守护兽 ({stats.pets?.length || 0})
                  </button>
                </div>

                {activeProfileTab === 'HERO' ? (
                  <div className="space-y-4">
                    {/* Character Card Info */}
                    <div className="bg-white border border-emerald-200 shadow-sm rounded-2xl p-4 flex items-center space-x-3.5 relative overflow-hidden">
                      <div className="absolute top-0 right-0 opacity-[0.04] select-none pointer-events-none text-9xl">
                        {selectedChar.avatar}
                      </div>
                      <div className="w-12 h-12 bg-emerald-50 rounded-xl border border-emerald-250 flex items-center justify-center text-2xl shrink-0">
                        {selectedChar.avatar}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h5 className="font-serif font-black text-emerald-950 text-sm truncate">{selectedChar.name}</h5>
                          <span className="text-[8px] bg-emerald-100 text-emerald-800 font-extrabold px-1.5 py-0.5 rounded leading-none shrink-0 border border-emerald-250">
                            英雄 LV.{charStats.level}
                          </span>
                        </div>
                        <p className="text-[9px] font-semibold text-emerald-700/65 mt-1 italic leading-none truncate">{selectedChar.title}</p>
                        <p className="text-[10px] font-extrabold text-[#115e59] leading-normal mt-1.5 line-clamp-2">
                          {selectedChar.description}
                        </p>
                      </div>
                    </div>

                    {/* Compact rating pills */}
                    <div className="grid grid-cols-3 gap-2 bg-white/70 p-2 rounded-2xl border border-emerald-200 shadow-sm">
                      <div className="text-center">
                        <span className="text-[8px] font-black text-emerald-600/60 block mb-0.5 uppercase tracking-wide">基础战力</span>
                        <span className="font-extrabold text-rose-600 text-xs tabular-nums">{characterCombatPower}</span>
                      </div>
                      <div className="text-center border-x border-emerald-200/60">
                        <span className="text-[8px] font-black text-emerald-600/60 block mb-0.5 uppercase tracking-wide">守护加功</span>
                        <span className="font-extrabold text-teal-600 text-xs tabular-nums">+{activePetPower}</span>
                      </div>
                      <div className="text-center">
                        <span className="text-[8px] font-black text-emerald-600/60 block mb-0.5 uppercase tracking-wide">契约评分</span>
                        <span className="font-black text-amber-600 text-xs tabular-nums">{totalCombatPower}</span>
                      </div>
                    </div>

                    {/* Attributes Distribution */}
                    <div className="space-y-3 bg-white/40 border border-emerald-200 p-4 rounded-2xl">
                      <div className="flex items-center justify-between border-b border-emerald-200 pb-2 mb-1">
                        <span className="text-xs font-serif font-extrabold text-emerald-900">分配奥术神力属性</span>
                        <span className="bg-amber-100 text-amber-800 border border-amber-300 px-2 py-0.5 rounded-lg text-[9px] font-black shadow-sm">
                          剩余 {unassignedPoints} 点
                        </span>
                      </div>

                      {/* Attribute Row strength */}
                      <div className="flex items-center justify-between bg-white/90 p-2 border border-emerald-200 rounded-xl shadow-sm">
                        <div className="flex items-center space-x-2">
                          <Sword size={12} className="text-red-500 animate-pulse" />
                          <div>
                            <span className="font-black text-emerald-950 text-xs block leading-none">力量</span>
                            <span className="text-[8px] text-emerald-600/60 font-bold block mt-0.5">提高扫尾和词怪击落度</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="font-black text-xs text-emerald-950 tabular-nums">
                            {charStats.strength}
                            {bonusStrength > 0 && <span className="text-emerald-600 text-[10px] font-bold ml-1">+{bonusStrength}</span>}
                          </span>
                          <button
                            disabled={unassignedPoints <= 0}
                            onClick={() => handleAddAttributePoint('strength')}
                            className={`w-5 h-5 rounded flex items-center justify-center font-bold text-xs ${unassignedPoints > 0 ? 'bg-emerald-605 hover:bg-emerald-500 bg-gradient-to-r from-emerald-600 to-teal-600 cursor-pointer text-white shadow-sm' : 'bg-emerald-100 text-emerald-400'}`}
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Attribute Row magic */}
                      <div className="flex items-center justify-between bg-white/90 p-2 border border-emerald-200 rounded-xl shadow-sm">
                        <div className="flex items-center space-x-2">
                          <Zap size={12} className="text-purple-500 animate-pulse" />
                          <div>
                            <span className="font-black text-emerald-950 text-xs block leading-none">魔力</span>
                            <span className="text-[8px] text-emerald-600/60 font-bold block mt-0.5">净化音标及闪避护盾</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="font-black text-xs text-emerald-950 tabular-nums">
                            {charStats.magic}
                            {bonusMagic > 0 && <span className="text-emerald-600 text-[10px] font-bold ml-1">+{bonusMagic}</span>}
                          </span>
                          <button
                            disabled={unassignedPoints <= 0}
                            onClick={() => handleAddAttributePoint('magic')}
                            className={`w-5 h-5 rounded flex items-center justify-center font-bold text-xs ${unassignedPoints > 0 ? 'bg-purple-650 hover:bg-purple-500 bg-gradient-to-r from-purple-600 to-indigo-600 cursor-pointer text-white shadow-sm' : 'bg-emerald-100 text-emerald-400'}`}
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Attribute Row defense */}
                      <div className="flex items-center justify-between bg-white/90 p-2 border border-emerald-200 rounded-xl shadow-sm">
                        <div className="flex items-center space-x-2">
                          <Shield size={12} className="text-blue-500 animate-pulse" />
                          <div>
                            <span className="font-black text-emerald-950 text-xs block leading-none">防御</span>
                            <span className="text-[8px] text-emerald-600/60 font-bold block mt-0.5">提供更高的拼读防守度</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="font-black text-xs text-emerald-950 tabular-nums">
                            {charStats.defense}
                            {bonusDefense > 0 && <span className="text-emerald-600 text-[10px] font-bold ml-1">+{bonusDefense}</span>}
                          </span>
                          <button
                            disabled={unassignedPoints <= 0}
                            onClick={() => handleAddAttributePoint('defense')}
                            className={`w-5 h-5 rounded flex items-center justify-center font-bold text-xs ${unassignedPoints > 0 ? 'bg-blue-650 hover:bg-blue-500 bg-gradient-to-r from-blue-600 to-sky-600 cursor-pointer text-white shadow-sm' : 'bg-emerald-100 text-emerald-400'}`}
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Attribute Row agility */}
                      <div className="flex items-center justify-between bg-white/90 p-2 border border-emerald-200 rounded-xl shadow-sm">
                        <div className="flex items-center space-x-2">
                          <Activity size={12} className="text-emerald-500 animate-pulse" />
                          <div>
                            <span className="font-black text-emerald-950 text-xs block leading-none">敏捷</span>
                            <span className="text-[8px] text-emerald-600/60 font-bold block mt-0.5">提升连击爆伤倍率</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="font-black text-xs text-emerald-950 tabular-nums">
                            {charStats.agility}
                            {bonusAgility > 0 && <span className="text-emerald-600 text-[10px] font-bold ml-1">+{bonusAgility}</span>}
                          </span>
                          <button
                            disabled={unassignedPoints <= 0}
                            onClick={() => handleAddAttributePoint('agility')}
                            className={`w-5 h-5 rounded flex items-center justify-center font-bold text-xs ${unassignedPoints > 0 ? 'bg-emerald-605 hover:bg-emerald-500 bg-gradient-to-r from-emerald-600 to-teal-600 cursor-pointer text-white shadow-sm' : 'bg-emerald-100 text-emerald-400'}`}
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {spentPoints > 0 && (
                        <div className="flex justify-end pt-1">
                          <button 
                            onClick={handleResetAttributePoints}
                            className="bg-red-50 hover:bg-red-100 text-rose-700 font-extrabold text-[9px] px-2.5 py-1.5 rounded-lg border border-red-200 focus:outline-none transition-all cursor-pointer shadow-sm"
                          >
                            🔄 重置大奥术潜能点
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Active Equipments List */}
                    {equippedItems.length > 0 && (
                      <div className="bg-white/40 border border-emerald-200 p-3 rounded-2xl">
                        <span className="text-[9px] font-black text-emerald-800 block mb-2 uppercase px-1 font-mono tracking-wider">正在装备魔法圣护具</span>
                        <div className="grid grid-cols-2 gap-2">
                          {equippedItems.map(item => (
                            <div key={item.id} className="flex items-center space-x-2 p-2 bg-white border border-emerald-250 shadow-sm rounded-xl">
                              <div className="w-6 h-6 bg-amber-50 text-xs flex items-center justify-center rounded-lg border border-amber-200 shrink-0">🛡️</div>
                              <div className="min-w-0">
                                <span className="text-[10px] font-extrabold text-emerald-950 block truncate leading-none">{item.name}</span>
                                <span className="text-[8px] font-bold text-[#0f766e] block mt-0.5 truncate leading-none">
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
                            <div key={pet.id || idx} className="bg-white border border-emerald-200 shadow-sm rounded-2xl p-3 flex justify-between items-center relative overflow-hidden">
                              <div className="absolute top-0 right-0 p-1 opacity-[0.03] select-none pointer-events-none text-7xl">
                                {PET_EMOJIS[pet.type] || '🐾'}
                              </div>
                              <div className="flex items-center space-x-3 relative z-10 min-w-0">
                                <span className="text-3xl p-1.5 bg-emerald-50 rounded-xl border border-emerald-200 shrink-0">
                                  {PET_EMOJIS[pet.type] || '🐾'}
                                </span>
                                <div className="text-left min-w-0">
                                  <div className="flex items-center gap-1">
                                    <h5 className="font-extrabold text-emerald-950 text-xs truncate">{pet.name}</h5>
                                    <span className="text-[7.5px] bg-[#10b981]/15 text-emerald-700 font-extrabold px-1 rounded uppercase border border-emerald-200">
                                      LV.{pet.level}
                                    </span>
                                  </div>
                                  <div className="flex items-center space-x-2 text-[8.5px] font-bold text-[#14532d] mt-1">
                                    <span>❤️生命 {pet.health}/100</span>
                                    <span>⭐快乐 {pet.happiness}/100</span>
                                  </div>
                                </div>
                              </div>
                              <div className="text-right flex flex-col justify-center relative z-10 shrink-0 select-none">
                                <span className="text-[7.5px] font-black text-emerald-600 block">守护力</span>
                                <span className="font-black text-emerald-700 text-xs tabular-nums">+{cp} CP</span>
                              </div>
                            </div>
                          );
                        })}
                        <button
                          onClick={() => {
                            setIsProfileExpanded(false);
                            onNavigate('PETS');
                          }}
                          className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-110 text-white font-black text-[10px] py-3 rounded-xl transition-all flex items-center justify-center space-x-1 border border-emerald-500 shadow-md cursor-pointer mt-2"
                        >
                          <span>进入契约兽神域进行特训 ⚔️</span>
                          <ArrowRight size={11} />
                        </button>
                      </div>
                    ) : (
                      <div className="bg-white rounded-2xl p-6 border border-emerald-200 text-center py-8">
                        <span className="text-4xl block mb-2 pointer-events-none select-none">🥚</span>
                        <h6 className="font-extrabold text-[#115e59] text-xs">暂无在役宠兽</h6>
                        <p className="text-[10px] font-bold text-emerald-600/60 max-w-xs mx-auto mb-4 leading-normal mt-1.5">
                          可累积符文金币前往魔法商店购买雷光雏龙/萌兔之卵！在背词挑战中展现奥术魔法吧！
                        </p>
                        <button
                          onClick={() => {
                            setIsProfileExpanded(false);
                            onNavigate('SHOP');
                          }}
                          className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-extrabold text-[10px] py-3 rounded-xl transition-all shadow-md cursor-pointer focus:outline-none"
                        >
                          前往魔法秘宝商店 🪙
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Close attributes footer info */}
              <div className="bg-emerald-50 rounded-xl p-2.5 border border-emerald-200 text-center mt-4 justify-center shadow-inner">
                <span className="text-[8px] font-bold text-emerald-800/80 block">
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
