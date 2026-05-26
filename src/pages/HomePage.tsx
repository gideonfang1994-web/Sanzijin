
import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, Gamepad2, Sparkles, Star, Trophy, CircleDollarSign, ArrowRight, Search, X,
  Sword, Shield, Zap, ChevronDown, ChevronUp, Swords, Activity, Heart, ShoppingBag, Plus, Award
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
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-700 pb-16 relative">
      {/* Dynamic Nature Background - Ultra Rich Green */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10 bg-gradient-to-br from-[#10513e] via-[#064e3b] to-[#065f46]">
        {/* Animated Sun Rays with Glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-10%,_rgba(52,211,153,0.2)_0%,_transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_20%,_rgba(16,185,129,0.15)_0%,_transparent_40%)]" />

        {/* Floating Nature Objects (Leaves, Flowers, Petals) */}
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              x: Math.random() * 100 + '%', 
              y: -100, 
              rotate: 0,
              opacity: 0 
            }}
            animate={{ 
              y: ['0vh', '110vh'],
              x: [(Math.random() * 120 - 10) + '%', (Math.random() * 120 - 10) + '%'],
              rotate: [0, 1080],
              opacity: [0, 0.5, 0.5, 0],
              scale: [0.7, 1.3, 0.7]
            }}
            transition={{ 
              duration: 12 + Math.random() * 18, 
              repeat: Infinity, 
              delay: Math.random() * 15,
              ease: "linear"
            }}
            className="absolute text-5xl filter blur-[0.3px] select-none pointer-events-none"
          >
            {['🍃', '🌿', '🌸', '🍀', '✨', '🌼'][i % 6]}
          </motion.div>
        ))}
        
        {/* Deep Forest Layers with Silhouettes */}
        <div className="absolute bottom-0 left-0 right-0 h-96 opacity-10 flex justify-around items-end overflow-hidden">
           <div className="text-[20rem] -mb-28 -ml-32 transform -rotate-6">🌳</div>
           <div className="text-[14rem] -mb-16 text-emerald-900/30">🌲</div>
           <div className="text-[22rem] -mb-32 text-emerald-900/50 transform rotate-3">🌳</div>
           <div className="text-[15rem] -mb-12 -mr-32 text-emerald-900/30 transform -rotate-12">🌲</div>
        </div>

        {/* Ground Flora Details */}
        <div className="absolute bottom-10 left-10 text-7xl opacity-20 transform -rotate-12">🍄</div>
        <div className="absolute bottom-24 right-16 text-6xl opacity-15">🌸</div>
        <div className="absolute bottom-32 left-1/3 text-4xl opacity-10">🌿</div>
      </div>

        {/* Magical Ecosystem Accents */}
        <motion.div 
          animate={{ opacity: [0.2, 0.4, 0.2] }} 
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute bottom-32 left-16 text-6xl opacity-30 drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]"
        >
          🍄
        </motion.div>
        <motion.div 
          animate={{ 
            x: [0, 100, 0], 
            y: [0, -50, 0],
            rotate: [0, 20, 0]
          }} 
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/4 right-20 text-5xl opacity-20"
        >
          🦋
        </motion.div>
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.3, 0.1] }} 
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute top-1/3 left-10 text-4xl"
        >
          ✨
        </motion.div>

      {/* Hero Stats Section - Glassmorphism Refined */}
      <div className="bg-white rounded-[40px] p-6 shadow-[0_32px_64px_-16px_rgba(6,78,59,0.15)] border-2 border-emerald-100 flex justify-between items-center relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-transparent pointer-events-none" />
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-emerald-200/40 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-1000" />
        
        <div className="flex items-center space-x-6 relative z-10">
          <motion.div 
            whileHover={{ scale: 1.08, rotate: 5 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-emerald-400 rounded-[24px] blur-lg opacity-40 group-hover:opacity-60 transition-opacity" />
            <div className="bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-800 text-white w-16 h-16 rounded-[24px] flex flex-col items-center justify-center font-black shadow-xl border-2 border-white/50 relative overflow-hidden">
              <span className="text-[10px] font-bold opacity-70 leading-none mb-1">LV</span>
              <span className="text-3xl leading-none">{stats.level}</span>
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-tr from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            </div>
          </motion.div>
          <div className="flex flex-col space-y-2">
            <div className="flex items-center justify-between min-w-[120px]">
               <span className="text-[10px] font-black text-emerald-800/40 uppercase tracking-[0.2em]">Magical Core</span>
               <span className="text-[10px] font-bold text-emerald-600/60 uppercase tracking-widest">{Math.floor((stats.xp % 1000) / 10)}%</span>
            </div>
            <div className="w-40 h-3 bg-emerald-100/50 rounded-full overflow-hidden border border-emerald-200/50 shadow-inner p-1">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${(stats.xp % 1000) / 10}%` }}
                className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full shadow-[0_0_10px_rgba(52,211,153,0.5)]" 
              />
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3 relative z-10">
          <motion.div 
            whileHover={{ scale: 1.05, y: -2 }}
            className="flex items-center bg-white px-4 py-3 rounded-[24px] border-2 border-slate-100 shadow-sm"
          >
            <CircleDollarSign size={20} className="text-amber-500 mr-2 fill-amber-200" />
            <span className="font-black text-slate-700 text-base tabular-nums tracking-tight">{stats.starCoins}</span>
          </motion.div>
        </div>
      </div>

      {/* Expandable RPG Panel - Hook mechanism */}
      <div className="bg-white rounded-[40px] border-2 border-emerald-100 shadow-[0_20px_40px_-12px_rgba(6,78,59,0.1)] overflow-hidden transition-all duration-300">
        <button 
          onClick={() => {
            setIsProfileExpanded(!isProfileExpanded);
          }}
          className="w-full p-5 flex items-center justify-between hover:bg-emerald-50/40 transition-colors focus:outline-none"
        >
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 bg-emerald-100 rounded-2xl flex items-center justify-center text-xl shadow-inner">
              🗡️
            </div>
            <div className="text-left">
              <h4 className="font-black text-emerald-950 text-base flex items-center gap-1.5 leading-none mb-1">
                <span>勇者手账与契约兽</span>
                {unassignedPoints > 0 && (
                  <span className="inline-flex h-2.5 w-2.5 rounded-full bg-rose-500 animate-pulse" />
                )}
              </h4>
              <p className="text-[11px] font-bold text-slate-400">
                主神圣域总战斗力: <span className="font-extrabold text-emerald-600">{totalCombatPower}</span> 🗡️ · 分配奥术潜能点
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {unassignedPoints > 0 && (
              <span className="bg-rose-100 text-rose-600 font-black text-[10px] px-2.5 py-1 rounded-full border border-rose-200">
                可分配 +{unassignedPoints}点
              </span>
            )}
            <div className="p-1.5 hover:bg-emerald-100/50 rounded-xl transition-colors text-emerald-800">
              {isProfileExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </div>
          </div>
        </button>

        <AnimatePresence initial={false}>
          {isProfileExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="border-t border-emerald-50"
            >
              <div className="p-6 bg-slate-50/50">
                {/* Visual tabs inside the RPG manual */}
                <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-6">
                  <button 
                    onClick={() => setActiveProfileTab('HERO')}
                    className={`flex-1 py-3 text-xs font-black rounded-xl transition-all ${activeProfileTab === 'HERO' ? 'bg-white text-emerald-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    🗡️ 勇者属性/天赋
                  </button>
                  <button 
                    onClick={() => setActiveProfileTab('PETS')}
                    className={`flex-1 py-3 text-xs font-black rounded-xl transition-all ${activeProfileTab === 'PETS' ? 'bg-white text-emerald-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    🐾 契约守护兽 ({stats.pets?.length || 0})
                  </button>
                </div>

                {activeProfileTab === 'HERO' ? (
                  <div className="space-y-6">
                    {/* Character Card Info */}
                    <div className="bg-white rounded-3xl p-5 border border-slate-200/60 shadow-sm flex items-center space-x-5 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 text-emerald-200/40 text-7xl font-mono select-none pointer-events-none">
                        {selectedChar.avatar}
                      </div>
                      <div className="w-16 h-16 bg-emerald-50 rounded-[20px] border border-emerald-100 flex items-center justify-center text-3xl shadow-sm relative z-10">
                        {selectedChar.avatar}
                      </div>
                      <div className="relative z-10 flex-1">
                        <div className="flex items-center space-x-2">
                          <h5 className="font-extrabold text-slate-800 text-lg leading-none">{selectedChar.name}</h5>
                          <span className="text-[10px] bg-emerald-100 text-emerald-700 font-extrabold px-2 py-0.5 rounded-md">
                            英雄 LV {charStats.level}
                          </span>
                        </div>
                        <p className="text-[11px] font-medium text-slate-400 mt-1.5 italic leading-tight">
                          {selectedChar.title}
                        </p>
                        <p className="text-[11px] font-bold text-slate-500 mt-2.5 leading-relaxed">
                          {selectedChar.description}
                        </p>
                      </div>
                    </div>

                    {/* Combat Power Breakdown */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-emerald-950/5 rounded-2xl p-3 border border-emerald-950/10 text-center">
                        <span className="text-[10px] font-black text-emerald-800/60 block mb-0.5">勇者基础评分</span>
                        <span className="font-black text-slate-700 text-sm md:text-base">{characterCombatPower}</span>
                      </div>
                      <div className="bg-indigo-950/5 rounded-2xl p-3 border border-indigo-950/10 text-center">
                        <span className="text-[10px] font-black text-indigo-800/60 block mb-0.5">契约兽加功</span>
                        <span className="font-black text-slate-700 text-sm md:text-base">+{activePetPower}</span>
                      </div>
                      <div className="bg-amber-950/5 rounded-2xl p-3 border border-amber-950/10 text-center">
                        <span className="text-[10px] font-black text-amber-800/60 block mb-0.5">圣域总战斗力</span>
                        <span className="font-black text-emerald-600 text-sm md:text-base">{totalCombatPower}</span>
                      </div>
                    </div>

                    {/* Attributes Allocation Grid */}
                    <div className="bg-white rounded-3xl p-5 border border-slate-200/60 shadow-sm space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <div>
                          <h6 className="font-extrabold text-slate-800 text-sm">分配奥术潜能属性</h6>
                          <p className="text-[10px] font-bold text-slate-400 mt-0.5">使用学习积攒的奥术能量升级角色</p>
                        </div>
                        <div className="flex items-center space-x-2.5 text-right">
                          <span className="text-xs font-black text-slate-600">剩余点数:</span>
                          <span className="bg-amber-100 text-amber-800 border border-amber-200 px-3 py-1 rounded-xl text-xs font-black tabular-nums">
                            {unassignedPoints} 点
                          </span>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {/* Attribute 1: Strength */}
                        <div className="flex items-center justify-between bg-slate-50/50 p-3.5 rounded-2xl border border-slate-100">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-red-500">
                              <Sword size={16} />
                            </div>
                            <div>
                              <span className="font-extrabold text-slate-700 text-xs">力量 (Strength)</span>
                              <span className="text-[9px] font-bold text-slate-400 block mt-0.5">增加攻击强度 & 砍杀小恶魔效率</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3.5">
                            <span className="font-black text-slate-800 text-sm tabular-nums">
                              {charStats.strength}
                              {bonusStrength > 0 && (
                                <span className="text-emerald-500 text-xs font-bold ml-1.5">+{bonusStrength}</span>
                              )}
                            </span>
                            <button
                              disabled={unassignedPoints <= 0}
                              onClick={() => handleAddAttributePoint('strength')}
                              className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs shadow-md transition-all ${unassignedPoints > 0 ? 'bg-emerald-500 hover:bg-emerald-600 active:scale-90 text-white cursor-pointer' : 'bg-slate-100 text-slate-300 cursor-not-allowed'}`}
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        </div>

                        {/* Attribute 2: Magic */}
                        <div className="flex items-center justify-between bg-slate-50/50 p-3.5 rounded-2xl border border-slate-100">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-500">
                              <Zap size={16} />
                            </div>
                            <div>
                              <span className="font-extrabold text-slate-700 text-xs">魔力 (Magic)</span>
                              <span className="text-[9px] font-bold text-slate-400 block mt-0.5">增加奥术屏障 & 净化音标能量</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3.5">
                            <span className="font-black text-slate-800 text-sm tabular-nums">
                              {charStats.magic}
                              {bonusMagic > 0 && (
                                <span className="text-emerald-500 text-xs font-bold ml-1.5">+{bonusMagic}</span>
                              )}
                            </span>
                            <button
                              disabled={unassignedPoints <= 0}
                              onClick={() => handleAddAttributePoint('magic')}
                              className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs shadow-md transition-all ${unassignedPoints > 0 ? 'bg-purple-500 hover:bg-purple-600 active:scale-90 text-white cursor-pointer' : 'bg-slate-100 text-slate-300 cursor-not-allowed'}`}
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        </div>

                        {/* Attribute 3: Defense */}
                        <div className="flex items-center justify-between bg-slate-50/50 p-3.5 rounded-2xl border border-slate-100">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-500">
                              <Shield size={16} />
                            </div>
                            <div>
                              <span className="font-extrabold text-slate-700 text-xs">防御 (Defense)</span>
                              <span className="text-[9px] font-bold text-slate-400 block mt-0.5">增加生命护盾 & 拼读书写容错率</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3.5">
                            <span className="font-black text-slate-800 text-sm tabular-nums">
                              {charStats.defense}
                              {bonusDefense > 0 && (
                                <span className="text-emerald-500 text-xs font-bold ml-1.5">+{bonusDefense}</span>
                              )}
                            </span>
                            <button
                              disabled={unassignedPoints <= 0}
                              onClick={() => handleAddAttributePoint('defense')}
                              className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs shadow-md transition-all ${unassignedPoints > 0 ? 'bg-blue-500 hover:bg-blue-600 active:scale-90 text-white cursor-pointer' : 'bg-slate-100 text-slate-300 cursor-not-allowed'}`}
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        </div>

                        {/* Attribute 4: Agility */}
                        <div className="flex items-center justify-between bg-slate-50/50 p-3.5 rounded-2xl border border-slate-100">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-xl bg-green-50 border border-green-100 flex items-center justify-center text-green-500">
                              <Activity size={16} />
                            </div>
                            <div>
                              <span className="font-extrabold text-slate-700 text-xs">敏捷 (Agility)</span>
                              <span className="text-[9px] font-bold text-slate-400 block mt-0.5">增加反应闪避 & 连击拼词得分倍率</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3.5">
                            <span className="font-black text-slate-800 text-sm tabular-nums">
                              {charStats.agility}
                              {bonusAgility > 0 && (
                                <span className="text-emerald-500 text-xs font-bold ml-1.5">+{bonusAgility}</span>
                              )}
                            </span>
                            <button
                              disabled={unassignedPoints <= 0}
                              onClick={() => handleAddAttributePoint('agility')}
                              className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs shadow-md transition-all ${unassignedPoints > 0 ? 'bg-green-500 hover:bg-green-600 active:scale-90 text-white cursor-pointer' : 'bg-slate-100 text-slate-300 cursor-not-allowed'}`}
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Equipment List Section */}
                      {equippedItems.length > 0 && (
                        <div className="pt-2 border-t border-slate-150">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">正在装备</span>
                          <div className="grid grid-cols-2 gap-2">
                            {equippedItems.map(item => (
                              <div key={item.id} className="flex items-center space-x-2 p-2.5 bg-slate-50 border border-slate-200/50 rounded-xl relative overflow-hidden group/item">
                                {item.imageUrl ? (
                                  <SafeImage src={item.imageUrl} alt={item.name} className="w-8 h-8 object-contain animate-pulse" />
                                ) : (
                                  <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center text-sm font-black border border-amber-100">🛡️</div>
                                )}
                                <div className="min-w-0">
                                  <span className="text-[11px] font-extrabold text-slate-700 block truncate leading-tight">{item.name}</span>
                                  <span className="text-[9px] font-bold text-emerald-600 block leading-tight mt-0.5">
                                    {Object.entries(item.stats || {}).map(([key, value]) => {
                                      const label = key === 'strength' ? '力量' : key === 'magic' ? '魔力' : key === 'defense' ? '防御' : '敏捷';
                                      return `${label}+${value}`;
                                    }).join(', ')}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Action buttons */}
                      {spentPoints > 0 && (
                        <div className="flex justify-end pt-2">
                          <button 
                            onClick={handleResetAttributePoints}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-800 font-extrabold text-[10px] px-3.5 py-2 rounded-xl transition-all border border-slate-200 focus:outline-none"
                          >
                            🔄 重置奥术天赋点
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {stats.pets && stats.pets.length > 0 ? (
                      <div className="grid grid-cols-1 gap-3.5">
                        {stats.pets.map((pet, idx) => {
                          const cp = Math.floor(pet.level * 50 + pet.happiness * 1.5 + pet.health * 1);
                          return (
                            <div key={pet.id || idx} className="bg-white rounded-3xl p-5 border border-emerald-100 shadow-sm flex items-center justify-between relative overflow-hidden">
                              <div className="absolute top-0 right-0 p-3 opacity-[0.06] select-none pointer-events-none text-9xl leading-none">
                                {PET_EMOJIS[pet.type] || '🐾'}
                              </div>
                              
                              <div className="flex items-center space-x-4 relative z-10">
                                <span className="text-4xl leading-none p-2 bg-emerald-50 rounded-2xl border border-emerald-100">
                                  {PET_EMOJIS[pet.type] || '🐾'}
                                </span>
                                <div className="text-left">
                                  <div className="flex items-center gap-1.5 leading-none mb-1.5">
                                    <h5 className="font-extrabold text-slate-800 text-sm">{pet.name}</h5>
                                    <span className="text-[8px] bg-emerald-800 text-emerald-300 font-black px-1.5 py-0.5 rounded uppercase">
                                      LV {pet.level}
                                    </span>
                                  </div>
                                  <div className="flex items-center space-x-3 text-[10px] font-bold text-slate-400">
                                    <span className="flex items-center gap-0.5">
                                      ❤️ 生命 {pet.health}/{pet.maxHealth || 100}
                                    </span>
                                    <span className="flex items-center gap-0.5">
                                      ⭐ 快乐 {pet.happiness}/100
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className="text-right flex flex-col justify-center relative z-10 shrink-0">
                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1">守护力评分</span>
                                <span className="font-black text-emerald-600 text-base tabular-nums">+{cp} CP</span>
                              </div>
                            </div>
                          );
                        })}
                        <div className="pt-2">
                          <button
                            onClick={() => onNavigate('PETS')}
                            className="w-full bg-emerald-800 hover:bg-emerald-950 text-white font-black text-xs py-4 rounded-2xl shadow-lg shadow-emerald-900/10 transition-all flex items-center justify-center space-x-1.5"
                          >
                            <span>进入宠兽神域进行挂机特训 ⚔️</span>
                            <ArrowRight size={14} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-white rounded-3xl p-8 border border-slate-200/60 shadow-sm text-center py-10">
                        <span className="text-5xl block mb-4 select-none">🥚</span>
                        <h6 className="font-extrabold text-slate-700 text-sm mb-1.5">还未契约守护魔兽</h6>
                        <p className="text-[11px] font-medium text-slate-400 max-w-xs mx-auto mb-6 leading-relaxed">
                          背诵和拼写魔法字母可以积攒金币。快去魔法商店购买一颗珍贵魔晶兽卵，唤醒在星砂里沉睡的雷光雏龙吧！
                        </p>
                        <button
                          onClick={() => onNavigate('SHOP')}
                          className="bg-emerald-100 font-black text-emerald-800 hover:bg-emerald-800 hover:text-white border border-emerald-100 text-xs px-6 py-3.5 rounded-2xl transition-all shadow-sm focus:outline-none"
                        >
                          前往魔法商店 🪙
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Main Branding */}
      <div className="text-center py-6 relative">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex flex-col items-center"
        >
          <div className="relative mb-8">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
              className="absolute -inset-10 bg-gradient-to-r from-emerald-200/40 via-lime-200/40 to-emerald-200/40 rounded-full blur-3xl"
            />
            <motion.div 
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="w-36 h-36 bg-white rounded-[48px] shadow-2xl shadow-emerald-900/10 flex items-center justify-center text-8xl relative z-10 border-4 border-emerald-50"
            >
              <div className="absolute -top-6 -left-6 text-5xl drop-shadow-lg">🌳</div>
              🐯
              <div className="absolute -top-6 -right-6 text-5xl drop-shadow-lg animate-pulse">✨</div>
            </motion.div>
          </div>
          <div className="space-y-3">
            <h1 className="text-6xl font-black tracking-tighter text-emerald-950 pb-1">
              单词奇旅
            </h1>
            <div className="inline-flex px-6 py-2 bg-emerald-900 text-white rounded-full border border-emerald-800 shadow-lg magic-shadow">
              <span className="text-[10px] font-black uppercase tracking-[0.4em]">Adventure Forest v2.0</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Word Search Section */}
      <div className="px-1">
        <div className="relative group">
          <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
            <Search className="text-emerald-500 w-5 h-5 group-focus-within:text-emerald-600 transition-colors" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearch}
            placeholder="搜索单词，寻找它的三字经魔法..."
            className="w-full bg-white/80 backdrop-blur-md py-5 pl-14 pr-12 rounded-[28px] border-2 border-emerald-100/50 shadow-lg focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-400 outline-none transition-all text-emerald-900 font-bold placeholder:text-emerald-300"
          />
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute inset-y-0 right-4 flex items-center px-2 text-emerald-300 hover:text-emerald-500 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <AnimatePresence>
          {searchResults.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              className="mt-4 bg-white/90 backdrop-blur-xl rounded-[32px] border-2 border-emerald-100 shadow-2xl p-6 space-y-4 overflow-hidden"
            >
              <h4 className="text-[10px] font-black text-emerald-800/40 uppercase tracking-[0.2em] mb-2 px-2">发现魔法口诀</h4>
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {searchResults.map((group) => (
                  <motion.div
                    key={group.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 hover:bg-emerald-50 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex flex-wrap gap-1">
                        {group.words.map(w => (
                          <span key={w.text} className={`px-2 py-0.5 rounded-full text-[10px] font-black ${w.text.toLowerCase().includes(searchQuery.toLowerCase()) ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200' : 'bg-white text-emerald-600 border border-emerald-100'}`}>
                            {w.text}
                          </span>
                        ))}
                      </div>
                      <span className="text-[8px] font-black text-emerald-300 uppercase tracking-widest">{group.title}</span>
                    </div>
                    <p className="text-emerald-900 font-bold text-sm leading-relaxed translate-y-1">
                      {group.rhyme.split(',').map((part, i) => (
                        <span key={i} className="block">{part.trim()}</span>
                      ))}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <DailyQuestBoard quests={stats.quests} onQuestClick={onQuestClick} />

      {/* Main Navigation Grid */}
      <div className="grid grid-cols-2 gap-6 px-1">
        <motion.button 
          whileHover={{ scale: 1.02, y: -8 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onNavigate('ADVENTURE')} 
          className="puffy-card p-7 text-left relative overflow-hidden group h-64 flex flex-col justify-between border-emerald-100"
        >
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-50 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <div className="relative">
            <div className="bg-emerald-500 w-16 h-16 rounded-[28px] flex items-center justify-center mb-6 shadow-lg shadow-emerald-200 group-hover:scale-110 transition-transform">
              <BookOpen className="text-white w-8 h-8" />
            </div>
            {reviewNeeded.length > 0 && (
              <motion.div 
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="absolute -top-2 -right-2 bg-rose-500 text-white text-[11px] font-black w-7 h-7 flex items-center justify-center rounded-full shadow-lg border-2 border-white z-20"
              >
                {reviewNeeded.length}
              </motion.div>
            )}
          </div>

          <div>
            <h3 className="font-black text-2xl text-emerald-950 tracking-tight leading-tight">冒险森林</h3>
            <p className="text-[11px] font-black text-emerald-500/70 uppercase tracking-widest mt-2 flex items-center">
              EXPLORE WORLD <ArrowRight size={10} className="ml-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </p>
          </div>
        </motion.button>
        
        <motion.button 
          whileHover={{ scale: 1.02, y: -8 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onNavigate('ARCADE')} 
          className="puffy-card p-7 text-left relative overflow-hidden group h-64 flex flex-col justify-between border-amber-100"
        >
           <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-50 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
           
           <div className="bg-amber-500 w-16 h-16 rounded-[28px] flex items-center justify-center mb-6 shadow-lg shadow-amber-200 group-hover:scale-110 transition-transform">
            <Gamepad2 className="text-white w-8 h-8" />
          </div>

          <div>
            <h3 className="font-black text-2xl text-amber-950 tracking-tight leading-tight">魔法乐园</h3>
            <p className="text-[11px] font-black text-amber-600/70 uppercase tracking-widest mt-2 flex items-center">
              PLAY GAMES <ArrowRight size={10} className="ml-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </p>
          </div>
        </motion.button>

        {/* 单词森林 - 魔法三字经图鉴 */}
        <motion.button 
          whileHover={{ scale: 1.01, y: -4 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => onNavigate('COLLECTION')} 
          className="col-span-2 puffy-card p-6 text-left relative overflow-hidden group flex items-center justify-between border-rose-100 bg-gradient-to-r from-rose-50/50 to-indigo-50/30 h-40"
        >
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-rose-100 rounded-full blur-2xl opacity-40 group-hover:opacity-80 transition-opacity duration-500" />
          
          <div className="flex items-center space-x-6 relative">
            <div className="bg-rose-500 w-16 h-16 rounded-[28px] flex items-center justify-center shadow-lg shadow-rose-200 group-hover:scale-110 transition-transform">
              <BookOpen className="text-white w-8 h-8" />
            </div>
            <div>
              <h3 className="font-black text-2xl text-rose-950 tracking-tight leading-tight">单词森林 (英文三字经)</h3>
              <p className="text-rose-600/70 font-black text-xs mt-2">
                查阅神奇英文三字经与全部魔法单词
              </p>
            </div>
          </div>

          <div className="bg-white/80 border border-rose-150 px-4 py-2.5 rounded-2xl font-black text-xs text-rose-600 shadow-sm flex items-center space-x-1.5 hover:bg-rose-500 hover:text-white transition-all">
            <span>进入图鉴</span>
            <ArrowRight size={14} className="opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
          </div>
        </motion.button>
      </div>
      
      {/* Achievement Progress Bar Footprint */}
      <motion.div 
        whileHover={{ scale: 1.02 }}
        className="bg-emerald-900 rounded-[40px] p-8 text-white shadow-2xl relative overflow-hidden group border-2 border-emerald-800"
      >
        <div className="absolute top-0 right-0 p-6 opacity-20 rotate-12 scale-150">🌲</div>
        <div className="flex items-center justify-between mb-5 relative z-10">
          <div className="flex items-center space-x-3">
            <Trophy className="text-amber-400" size={24} />
            <h4 className="font-black text-emerald-50 text-base">魔法成就</h4>
          </div>
          <span className="text-xs font-black text-emerald-400">已掌握 {(stats.masteredWords || []).length} 个单词</span>
        </div>
        <div className="w-full h-3 bg-emerald-800 rounded-full overflow-hidden mb-2">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: stats.masteredWords?.length ? Math.min(100, (stats.masteredWords.length / 50) * 100) + '%' : '0%' }}
            className="h-full bg-gradient-to-r from-amber-400 to-orange-400" 
          />
        </div>
      </motion.div>

      {/* Nature Footer Accent */}
      <div className="flex justify-center items-center space-x-8 opacity-20 pointer-events-none pb-4">
        <div className="text-4xl">🌲</div>
        <div className="text-2xl">🍄</div>
        <div className="text-4xl">🌳</div>
        <div className="text-2xl">🍄</div>
        <div className="text-4xl">🌲</div>
      </div>
    </div>
  );
};

export default HomePage;
