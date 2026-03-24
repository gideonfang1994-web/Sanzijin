
import React, { useState } from 'react';
import { UserStats, ShopItem, Character } from '../types';
import { CHARACTERS, SHOP_ITEMS } from '../constants';
import { Sparkles, ShoppingBag, Check, Lock, User, Shield, Sword, Wand2, Book, ArrowUp, Zap, BookOpen, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface MagicShopProps {
  stats: UserStats;
  onPurchase: (item: ShopItem) => void;
  onEquip: (characterId: string, itemId: string) => void;
  onSelectCharacter: (characterId: string) => void;
}

const ParticleEffect: React.FC<{ color: string }> = ({ color }) => {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ 
            x: Math.random() * 200 - 100, 
            y: Math.random() * 200 - 100, 
            opacity: 0,
            scale: 0 
          }}
          animate={{ 
            y: [null, -150], 
            opacity: [0, 0.8, 0],
            scale: [0, 1, 0.5]
          }}
          transition={{ 
            duration: 2 + Math.random() * 2, 
            repeat: Infinity, 
            delay: Math.random() * 2 
          }}
          className="absolute w-1 h-1 rounded-full blur-[1px]"
          style={{ backgroundColor: color, boxShadow: `0 0 10px ${color}` }}
        />
      ))}
    </div>
  );
};

const CharacterVisual: React.FC<{ 
  character: Character; 
  equippedItems: string[]; 
  charStats: { level: number; strength: number; magic: number; defense: number; agility: number } 
}> = ({ character, equippedItems, charStats }) => {
  const items = equippedItems.map(id => SHOP_ITEMS.find(i => i.id === id)).filter(Boolean) as ShopItem[];
  
  // Define equipment icons based on the reference image
  const getEquipIcon = (slot: string) => {
    if (character.id === 'c1') {
      if (slot === 'RIGHT_HAND') return <Sword size={24} className="text-sky-400" />;
      if (slot === 'LEFT_HAND') return <Shield size={24} className="text-amber-400" />;
      if (slot === 'BODY') return <Zap size={24} className="text-blue-500" />;
      if (slot === 'HEAD') return <Check size={24} className="text-indigo-400" />;
      if (slot === 'BACK') return <ArrowUp size={24} className="text-rose-400" />;
    }
    if (character.id === 'c2') {
      if (slot === 'RIGHT_HAND') return <Sparkles size={24} className="text-purple-400" />;
      if (slot === 'LEFT_HAND') return <BookOpen size={24} className="text-indigo-400" />;
      if (slot === 'BODY') return <ShoppingBag size={24} className="text-purple-600" />;
      if (slot === 'HEAD') return <Check size={24} className="text-pink-400" />;
      if (slot === 'BACK') return <ArrowUp size={24} className="text-blue-400" />;
    }
    if (character.id === 'c3') {
      if (slot === 'RIGHT_HAND') return <ArrowRight size={24} className="text-green-500" />;
      if (slot === 'BACK') return <ShoppingBag size={24} className="text-emerald-600" />;
      if (slot === 'BODY') return <Zap size={24} className="text-green-400" />;
      if (slot === 'HEAD') return <Check size={24} className="text-lime-400" />;
      if (slot === 'NONE') return <Zap size={24} className="text-teal-400" />;
    }
    if (character.id === 'c4') {
      if (slot === 'RIGHT_HAND') return <Sword size={24} className="text-red-600" />;
      if (slot === 'LEFT_HAND') return <Zap size={24} className="text-red-500" />;
      if (slot === 'BODY') return <ShoppingBag size={24} className="text-slate-800" />;
      if (slot === 'HEAD') return <Check size={24} className="text-slate-400" />;
      if (slot === 'NONE') return <Zap size={24} className="text-red-400" />;
    }
    return <ShoppingBag size={24} />;
  };

  return (
    <div className="relative w-full max-w-md h-[480px] flex flex-col items-center bg-slate-900/60 rounded-[40px] border border-white/10 p-4 overflow-hidden group">
      {/* Background Glow */}
      <motion.div 
        animate={{ opacity: [0.1, 0.2, 0.1] }}
        transition={{ duration: 4, repeat: Infinity }}
        className="absolute inset-0 blur-[80px]"
        style={{ backgroundColor: character.color }}
      />
      
      <ParticleEffect color={character.color} />

      {/* Hero Title & Level */}
      <div className="relative z-30 text-center mb-2">
        <div className="flex items-center justify-center space-x-2">
          <h3 className="text-xl font-black text-white tracking-widest uppercase">{character.name}</h3>
          <span className="bg-white/20 px-2 py-0.5 rounded-lg text-[10px] font-black text-white">LV.{charStats.level}</span>
        </div>
        <p className="text-[8px] text-white/40 font-bold tracking-[0.2em] uppercase">{character.title}</p>
      </div>

      {/* Stats Display */}
      <div className="relative z-30 grid grid-cols-4 gap-2 w-full px-4 mb-4">
        {[
          { label: 'STR', value: charStats.strength, icon: <Sword size={10} />, color: 'text-red-400' },
          { label: 'MAG', value: charStats.magic, icon: <Wand2 size={10} />, color: 'text-purple-400' },
          { label: 'DEF', value: charStats.defense, icon: <Shield size={10} />, color: 'text-blue-400' },
          { label: 'AGI', value: charStats.agility, icon: <Zap size={10} />, color: 'text-green-400' },
        ].map(stat => (
          <div key={stat.label} className="bg-black/40 rounded-xl p-1.5 flex flex-col items-center border border-white/5">
            <div className={`flex items-center space-x-1 ${stat.color} mb-0.5`}>
              {stat.icon}
              <span className="text-[8px] font-black">{stat.label}</span>
            </div>
            <span className="text-xs font-black text-white">{stat.value}</span>
          </div>
        ))}
      </div>

      <div className="relative w-full flex-1 flex items-center justify-center">
        {/* Equipment Slots - Left Side */}
        <div className="absolute left-2 top-1/2 -translate-y-1/2 flex flex-col space-y-3 z-30">
          {['RIGHT_HAND', 'LEFT_HAND', 'BODY'].map(slot => {
            const equipped = items.find(i => i.slot === slot);
            return (
              <div key={slot} className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center transition-all duration-300 ${equipped ? 'bg-white/10 border-white/40 shadow-[0_0_15px_rgba(255,255,255,0.2)]' : 'bg-black/40 border-white/5'}`}>
                {equipped ? (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                    {getEquipIcon(slot)}
                  </motion.div>
                ) : (
                  <div className="w-5 h-5 bg-white/5 rounded-full" />
                )}
              </div>
            );
          })}
        </div>

        {/* Main Character Portrait */}
        <div className="relative z-10 w-40 h-60 rounded-[32px] overflow-hidden border-2 border-white/20 shadow-2xl bg-black/20">
          {character.portraitUrl ? (
            <div className="relative w-full h-full">
              <img 
                src={character.portraitUrl} 
                alt={character.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = `https://placehold.co/400x600/${character.color.replace('#', '')}/white?text=${character.name}`;
                }}
              />
              
              {/* Equipment Overlays (Visual Feedback) */}
              {items.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 pointer-events-none"
                >
                  <div className="absolute inset-0 shadow-[inset_0_0_40px_rgba(255,255,255,0.3)] mix-blend-overlay" />
                </motion.div>
              )}
            </div>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center space-y-3">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full" />
              <p className="text-[7px] text-white/30 uppercase tracking-widest">召唤中...</p>
            </div>
          )}
          
          {/* Lighting Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-white/10" />
        </div>

        {/* Equipment Slots - Right Side */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col space-y-3 z-30">
          {['BACK', 'HEAD', 'NONE'].map(slot => {
            const equipped = items.find(i => i.slot === slot);
            const hasItemForSlot = SHOP_ITEMS.some(i => i.characterId === character.id && i.slot === slot);
            if (!hasItemForSlot) return null;

            return (
              <div key={slot} className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center transition-all duration-300 ${equipped ? 'bg-white/10 border-white/40 shadow-[0_0_15px_rgba(255,255,255,0.2)]' : 'bg-black/40 border-white/5'}`}>
                {equipped ? (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                    {getEquipIcon(slot)}
                  </motion.div>
                ) : (
                  <div className="w-5 h-5 bg-white/5 rounded-full" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Hero Subtitle Footer */}
      <div className="relative z-30 mt-4 pt-3 border-t border-white/5 w-full text-center">
        <p className="text-[8px] text-white/30 font-medium tracking-widest uppercase">
          {character.description.slice(0, 40)}...
        </p>
      </div>
    </div>
  );
};

const MagicShop: React.FC<MagicShopProps> = ({ stats, onPurchase, onEquip, onSelectCharacter }) => {
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null);
  const selectedChar = CHARACTERS.find(c => c.id === stats.selectedCharacterId) || CHARACTERS[0];
  const baseStats = stats.characterStats[selectedChar.id];
  const equippedIds = stats.equippedItems[selectedChar.id] || [];
  
  // Calculate total stats including equipment bonuses
  const totalStats = { ...baseStats };
  equippedIds.forEach(id => {
    const item = SHOP_ITEMS.find(i => i.id === id);
    if (item?.stats) {
      if (item.stats.strength) totalStats.strength += item.stats.strength;
      if (item.stats.magic) totalStats.magic += item.stats.magic;
      if (item.stats.defense) totalStats.defense += item.stats.defense;
      if (item.stats.agility) totalStats.agility += item.stats.agility;
    }
  });

  const charItems = SHOP_ITEMS.filter(item => item.characterId === selectedChar.id || item.characterId === 'all');

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-8 duration-500 pb-24">
      <AnimatePresence mode="wait">
        {isSelecting ? (
          <motion.div 
            key="selector"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-[32px] p-6 shadow-xl border-2 border-indigo-50"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black text-slate-800">选择你的英雄</h2>
              <button 
                onClick={() => setIsSelecting(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                取消
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {CHARACTERS.map(char => (
                <button
                  key={char.id}
                  onClick={() => {
                    onSelectCharacter(char.id);
                    setIsSelecting(false);
                  }}
                  className={`flex flex-col items-center p-4 rounded-3xl transition-all border-2 ${
                    stats.selectedCharacterId === char.id 
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg scale-105' 
                      : 'bg-slate-50 text-slate-600 border-transparent hover:border-indigo-200'
                  }`}
                >
                  <span className="text-4xl mb-2">{char.avatar}</span>
                  <span className="text-sm font-black">{char.name}</span>
                  <p className="text-[10px] opacity-60 text-center mt-1">{char.title}</p>
                </button>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="preview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {/* Header with Coins and Change Hero */}
            <div className="flex items-center justify-between px-2">
              <button 
                onClick={() => setIsSelecting(true)}
                className="flex items-center space-x-2 bg-white px-4 py-2 rounded-2xl shadow-sm border border-slate-100 hover:bg-slate-50 transition-colors"
              >
                <User size={16} className="text-indigo-600" />
                <span className="text-xs font-black text-slate-700">切换英雄</span>
              </button>
              
              <div className="flex items-center bg-indigo-600 px-4 py-2 rounded-2xl shadow-lg">
                <Sparkles size={16} className="text-white mr-2" />
                <span className="text-sm font-black text-white">{stats.magicCoins}</span>
              </div>
            </div>

            {/* Selected Character Preview */}
            <div 
              className="w-full rounded-[40px] p-6 text-white shadow-2xl relative overflow-hidden flex flex-col items-center"
              style={{ 
                background: `linear-gradient(135deg, ${selectedChar.color}, #0f172a)`,
                border: `1px solid ${selectedChar.color}44`
              }}
            >
              <CharacterVisual 
                character={selectedChar} 
                equippedItems={stats.equippedItems?.[selectedChar.id] || []} 
                charStats={totalStats}
              />
            </div>

            {/* Shop Items Grid */}
            <div className="bg-white/80 backdrop-blur-md rounded-[48px] p-8 shadow-2xl border border-white/40">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
                    <ShoppingBag size={20} className="text-white" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-800 tracking-tight">魔法商店</h3>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-6">
                {charItems.map(item => {
                  const isUnlocked = (stats.unlockedItems || []).includes(item.id);
                  const isEquipped = (stats.equippedItems?.[selectedChar.id] || []).includes(item.id);
                  const isConsumable = item.type === 'CONSUMABLE';
                  const isLevelLocked = item.requiredLevel ? stats.level < item.requiredLevel : false;
                  
                  return (
                    <motion.button 
                      key={item.id} 
                      whileHover={isLevelLocked ? {} : { scale: 1.05, y: -5 }}
                      whileTap={isLevelLocked ? {} : { scale: 0.95 }}
                      onClick={() => !isLevelLocked && setSelectedItem(item)}
                      className={`bg-white rounded-[40px] p-4 shadow-xl border-2 flex flex-col items-center justify-between min-h-[160px] relative overflow-hidden transition-all duration-300 ${
                        isEquipped ? 'border-emerald-500 shadow-emerald-100' : 
                        isLevelLocked ? 'border-slate-100 opacity-60 grayscale' :
                        'border-slate-50 hover:border-indigo-100'
                      }`}
                    >
                      {isEquipped && (
                        <div className="absolute top-3 right-3 bg-emerald-500 text-white p-1 rounded-full shadow-lg">
                          <Check size={10} />
                        </div>
                      )}

                      {isLevelLocked && (
                        <div className="absolute inset-0 bg-slate-900/5 flex flex-col items-center justify-center z-10">
                          <Lock size={20} className="text-slate-400 mb-1" />
                          <span className="text-[8px] font-bold text-slate-500">LV.{item.requiredLevel} 解锁</span>
                        </div>
                      )}
                      
                      <div className="text-center mb-2">
                        <span className="text-[10px] font-black text-slate-800 tracking-tight line-clamp-1">{item.name}</span>
                      </div>

                      <div className={`flex-1 flex items-center justify-center w-full mb-3 ${
                        (isUnlocked || isConsumable) && !isLevelLocked ? '' : 'grayscale opacity-50'
                      }`}>
                        {item.imageUrl ? (
                          <img 
                            src={item.imageUrl} 
                            alt={item.name} 
                            className="w-16 h-16 object-contain drop-shadow-xl"
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = `https://placehold.co/100x100/indigo/white?text=${item.name}`;
                            }}
                          />
                        ) : (
                          <Sparkles className="text-slate-200" size={32} />
                        )}
                      </div>

                      <div className="flex items-center space-x-1.5 bg-indigo-50 px-4 py-1.5 rounded-2xl border border-indigo-100/50">
                        <Sparkles size={12} className="text-indigo-600" />
                        <span className="text-xs font-black text-indigo-700">{item.price}</span>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Item Detail Modal */}
      <AnimatePresence>
        {selectedItem && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-[40px] w-full max-w-sm overflow-hidden shadow-2xl"
            >
              <div className="relative h-48 bg-slate-50 flex items-center justify-center">
                <button 
                  onClick={() => setSelectedItem(null)}
                  className="absolute top-6 right-6 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-slate-400 hover:text-slate-600 z-10"
                >
                  <Lock size={20} />
                </button>
                
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/50" />
                
                <motion.img 
                  layoutId={`item-img-${selectedItem.id}`}
                  src={selectedItem.imageUrl} 
                  alt={selectedItem.name}
                  className="w-32 h-32 object-contain relative z-10 drop-shadow-2xl"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = `https://placehold.co/200x200/indigo/white?text=${selectedItem.name}`;
                  }}
                />
              </div>

              <div className="p-8 space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-2xl font-black text-slate-800 tracking-tight">{selectedItem.name}</h3>
                    <div className="flex items-center space-x-1 bg-indigo-600 px-3 py-1 rounded-full">
                      <Sparkles size={14} className="text-white" />
                      <span className="text-sm font-black text-white">{selectedItem.price}</span>
                    </div>
                  </div>
                  <p className="text-slate-500 font-medium leading-relaxed">
                    {selectedItem.description}
                  </p>
                </div>

                {selectedItem.stats && Object.keys(selectedItem.stats).length > 0 && (
                  <div className="bg-slate-50 rounded-3xl p-4 grid grid-cols-2 gap-3">
                    {Object.entries(selectedItem.stats).map(([key, val]) => (
                      <div key={key} className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-white rounded-xl shadow-sm flex items-center justify-center">
                          {key === 'strength' && <Sword size={14} className="text-red-500" />}
                          {key === 'magic' && <Wand2 size={14} className="text-purple-500" />}
                          {key === 'defense' && <Shield size={14} className="text-blue-500" />}
                          {key === 'agility' && <Zap size={14} className="text-green-500" />}
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase">{key}</p>
                          <p className="text-sm font-black text-slate-800">+{val}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="pt-2">
                  {((stats.unlockedItems || []).includes(selectedItem.id)) && selectedItem.type !== 'CONSUMABLE' ? (
                    <button
                      onClick={() => {
                        onEquip(selectedChar.id, selectedItem.id);
                        setSelectedItem(null);
                      }}
                      className={`w-full py-4 rounded-2xl font-black text-lg transition-all duration-300 ${
                        (stats.equippedItems?.[selectedChar.id] || []).includes(selectedItem.id)
                          ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200' 
                          : 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 hover:scale-[1.02]'
                      }`}
                    >
                      {(stats.equippedItems?.[selectedChar.id] || []).includes(selectedItem.id) ? '已装备' : '立即装备'}
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        onPurchase(selectedItem);
                        if (selectedItem.type !== 'CONSUMABLE') setSelectedItem(null);
                      }}
                      disabled={stats.magicCoins < selectedItem.price}
                      className={`w-full py-4 rounded-2xl font-black text-lg flex items-center justify-center space-x-3 transition-all duration-300 ${
                        stats.magicCoins >= selectedItem.price
                          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 hover:scale-[1.02]'
                          : 'bg-slate-100 text-slate-300 cursor-not-allowed'
                      }`}
                    >
                      <Sparkles size={20} />
                      <span>{selectedItem.type === 'CONSUMABLE' ? '立即购买' : '解锁装备'}</span>
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MagicShop;

