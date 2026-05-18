
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, Star, Info, ChevronLeft, 
  Utensils, Sparkles, Skull, AlertCircle,
  ShoppingBag, Sparkle, Trophy, Gamepad2, Sword
} from 'lucide-react';
import { Pet, UserStats, ShopItem, ViewState } from '../types';
import audio from '../utils/AudioUtils';
import confetti from 'canvas-confetti';
import { getShopImageUrl } from '../constants';
import SafeImage from '../components/SafeImage';

interface PetPageProps {
  stats: UserStats;
  onUpdateStats: (updater: (prev: UserStats) => UserStats) => void;
  onNavigate: (view: ViewState) => void;
  onClose: () => void;
}

const PET_EMOJIS: Record<string, string> = {
  DRAGON: '🐲',
  CAT: '🐱',
  OWL: '🦉',
  SLIME: '💧'
};

const FOOD_ITEMS: ShopItem[] = [
  { id: 'food_apple', name: '魔法苹果', description: '恢复 10 点生命值', price: 50, type: 'FOOD', characterId: 'all', slot: 'NONE', foodValue: 10, imageUrl: getShopImageUrl('魔法苹果') },
  { id: 'food_meat', name: '优质肉块', description: '恢复 25 点生命值', price: 100, type: 'FOOD', characterId: 'all', slot: 'NONE', foodValue: 25, imageUrl: getShopImageUrl('优质肉块') },
  { id: 'food_elixir', name: '生命灵药', description: '恢复 50 点生命值', price: 200, type: 'FOOD', characterId: 'all', slot: 'NONE', foodValue: 50, imageUrl: getShopImageUrl('生命灵药') },
];

const PetPage: React.FC<PetPageProps> = ({ stats, onUpdateStats, onNavigate, onClose }) => {
  const [selectedPetIndex, setSelectedPetIndex] = useState(0);
  const [isFeeding, setIsFeeding] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const activePet = stats.pets[selectedPetIndex];

  const handleFeed = (food: ShopItem) => {
    if (!activePet || activePet.isDead) return;
    if (stats.magicCoins < food.price) {
      audio.playError();
      setMessage('魔法币不足！');
      setTimeout(() => setMessage(null), 2000);
      return;
    }

    setIsFeeding(true);
    audio.playPurchase();
    
    setTimeout(() => {
      onUpdateStats(prev => {
        const newPets = [...prev.pets];
        const pet = { ...newPets[selectedPetIndex] };
        pet.health = Math.min(pet.maxHealth, pet.health + (food.foodValue || 0));
        pet.happiness = Math.min(100, pet.happiness + 5);
        pet.lastFed = Date.now();
        newPets[selectedPetIndex] = pet;

        return {
          ...prev,
          magicCoins: prev.magicCoins - food.price,
          pets: newPets
        };
      });
      setIsFeeding(false);
      audio.playSuccess();
      confetti({
        particleCount: 40,
        spread: 50,
        origin: { y: 0.7 },
        colors: ['#FFD93D', '#6BCB77']
      });
    }, 1000);
  };

  return (
    <div className="fixed inset-0 bg-indigo-50 z-[60] overflow-y-auto pb-20">
      {/* Header */}
      <div className="sticky top-0 bg-white/80 backdrop-blur-md p-4 flex items-center justify-between border-b border-indigo-100 z-10">
        <button onClick={onClose} className="p-2 hover:bg-indigo-100 rounded-full transition-colors">
          <ChevronLeft size={24} className="text-indigo-700" />
        </button>
        <div className="text-center">
          <h2 className="text-xl font-black text-indigo-800 tracking-tight">契约宠兽</h2>
          <div className="flex items-center justify-center space-x-1">
             <div className="w-1 h-1 bg-indigo-300 rounded-full animate-ping" />
             <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Soul Contract</span>
          </div>
        </div>
        <button onClick={() => setShowRules(true)} className="p-2 hover:bg-indigo-100 rounded-full transition-colors">
          <Info size={24} className="text-indigo-700" />
        </button>
      </div>

      {/* Background Magical Patterns */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <div 
            key={i} 
            className="absolute w-96 h-96 border-[20px] border-indigo-900 rounded-full"
            style={{ 
              left: `${(i % 2) * 60 - 20}%`, 
              top: `${Math.floor(i / 2) * 40 - 10}%`,
              transform: `rotate(${i * 25}deg)` 
            }}
          />
        ))}
      </div>

      <div className="max-w-md mx-auto p-6 space-y-10 relative z-10">
        {stats.pets.length === 0 ? (
          <div className="space-y-8 py-4">
            {/* Motivational Header */}
            <div className="text-center space-y-3 px-4">
              <div className="relative inline-block">
                <motion.div 
                  initial={{ scale: 0.5, rotate: -10 }}
                  animate={{ scale: 1, rotate: 0 }}
                  className="w-32 h-32 bg-gradient-to-br from-amber-400 to-orange-500 rounded-[40px] flex items-center justify-center mx-auto shadow-2xl shadow-orange-200 relative z-10"
                >
                  <Sparkle size={56} className="text-white animate-pulse" />
                </motion.div>
                {/* Decorative background egg shape */}
                <motion.div 
                  animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.2, 0.1] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="absolute inset-0 bg-amber-500 rounded-full blur-3xl -z-10"
                />
                
                {/* Floating elements */}
                <motion.div 
                   animate={{ y: [0, -15, 0], x: [0, 10, 0] }}
                   transition={{ duration: 5, repeat: Infinity }}
                   className="absolute -top-4 -right-4 text-4xl"
                >
                  ✨
                </motion.div>
              </div>
              <h3 className="text-4xl font-black text-indigo-950 tracking-tight leading-tight pt-4">开启你的宠兽物语</h3>
              <p className="text-indigo-500 font-bold text-lg">在冒险森林中，拥有一位忠诚的伙伴能让你的旅程事半功倍！</p>
            </div>

            {/* Benefit Cards */}
            <div className="grid grid-cols-1 gap-4">
              {[
                { icon: <Trophy className="text-amber-500" />, title: "荣耀加成", desc: "专属宠兽勋章，彰显探险者身份" },
                { icon: <Gamepad2 className="text-sky-500" />, title: "游戏助力", desc: "某些宠兽在特定小游戏中能提供额外生命" },
                { icon: <Sword className="text-rose-500" />, title: "魔法守护", desc: "照顾宠兽可以获得每日额外的星星币奖励" },
              ].map((benefit, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white p-5 rounded-[32px] border-2 border-indigo-50 shadow-sm flex items-center space-x-4"
                >
                  <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center shrink-0">
                    {benefit.icon}
                  </div>
                  <div>
                    <h4 className="font-black text-indigo-900">{benefit.title}</h4>
                    <p className="text-xs text-indigo-400 font-bold">{benefit.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Pet Silhouettes / Teasers with Summoning Circle */}
            <div className="relative h-64 flex items-center justify-center">
              {/* Summoning Circle Background */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-56 h-56 border-2 border-indigo-200/50 rounded-full animate-magic-rotate flex items-center justify-center">
                  <div className="w-48 h-48 border border-dashed border-indigo-300/30 rounded-full" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    {[...Array(8)].map((_, i) => (
                      <div 
                        key={i} 
                        className="absolute w-2 h-2 bg-indigo-200 rounded-full"
                        style={{ transform: `rotate(${i * 45}deg) translateY(-112px)` }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-around items-end opacity-20 filter grayscale blur-[1.5px] relative z-10 w-full px-8">
                <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 4, repeat: Infinity, delay: 0.2 }} className="text-7xl transform -rotate-12 translate-y-4">🐲</motion.div>
                <motion.div animate={{ y: [0, -15, 0] }} transition={{ duration: 5, repeat: Infinity }} className="text-8xl transform translate-y-2">🦉</motion.div>
                <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 4, repeat: Infinity, delay: 0.4 }} className="text-7xl transform rotate-12 translate-y-4 shadow-2xl">🐱</motion.div>
              </div>
              
              <div className="absolute bottom-4 left-0 right-0 text-center">
                <p className="text-indigo-400 font-black text-[10px] uppercase tracking-[0.4em] animate-pulse">Waiting for your call</p>
              </div>
            </div>

            {/* CTA Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                audio.playClick();
                onNavigate('SHOP');
              }}
              className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 text-white p-6 rounded-[32px] font-black text-xl shadow-2xl shadow-indigo-200 flex items-center justify-center space-x-3 group relative overflow-hidden"
            >
              <motion.div 
                 animate={{ rotate: [0, 15, -15, 0] }}
                 transition={{ repeat: Infinity, duration: 2 }}
              >
                <ShoppingBag size={24} />
              </motion.div>
              <span>前往魔法商店领养</span>
              <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 skew-x-12" />
            </motion.button>
          </div>
        ) : (
          <>
            {/* Pet Selector */}
            {stats.pets.length > 1 && (
              <div className="flex space-x-3 overflow-x-auto pb-2 px-2">
                {stats.pets.map((pet, idx) => (
                  <button
                    key={pet.id}
                    onClick={() => setSelectedPetIndex(idx)}
                    className={`flex-shrink-0 px-6 py-3 rounded-2xl font-black transition-all ${
                      selectedPetIndex === idx 
                        ? 'bg-indigo-600 text-white shadow-lg' 
                        : 'bg-white text-indigo-400 border-2 border-indigo-50'
                    }`}
                  >
                    {pet.name}
                  </button>
                ))}
              </div>
            )}

            {/* Pet Display - Enhanced Magical Sanctuary Feel */}
            <div className="bg-white rounded-[56px] p-8 shadow-2xl border-4 border-white relative overflow-hidden group magic-glow-pulse">
              {/* Decorative Background Elements */}
              <div className="absolute inset-0 bg-gradient-to-b from-indigo-50/70 to-white pointer-events-none" />
              
              {/* Rotating Magic Circle (Subtle) */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 pointer-events-none opacity-[0.15]">
                 <div className="w-full h-full border-4 border-indigo-200 rounded-full animate-magic-rotate flex items-center justify-center">
                    <div className="w-64 h-64 border border-dashed border-indigo-300 rounded-full" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      {[...Array(12)].map((_, i) => (
                        <div 
                          key={i} 
                          className="absolute w-3 h-3 bg-indigo-300 rounded-full"
                          style={{ transform: `rotate(${i * 30}deg) translateY(-156px)` }}
                        />
                      ))}
                    </div>
                 </div>
              </div>
              
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-100 rounded-full -mr-32 -mt-32 opacity-30 blur-3xl" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-rose-100 rounded-full -ml-32 -mb-32 opacity-20 blur-3xl" />
              
              {/* Magical Particles */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(12)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{
                      y: [0, -30, 0],
                      x: [0, Math.random() * 20 - 10, 0],
                      opacity: [0.1, 0.4, 0.1],
                      scale: [1, 1.3, 1]
                    }}
                    transition={{
                      duration: 4 + (i % 3),
                      repeat: Infinity,
                      delay: i * 0.3
                    }}
                    className="absolute w-1.5 h-1.5 bg-indigo-400/40 rounded-full blur-[1px]"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`
                    }}
                  />
                ))}
              </div>

              <div className="relative z-10 text-center space-y-6">
                <div className="relative inline-block perspective-1000">
                  <motion.div
                    animate={activePet.isDead ? {} : {
                      y: [0, -12, 0],
                      scale: isFeeding ? [1, 1.15, 1] : [1, 1.03, 1],
                      rotateY: [0, 8, -8, 0],
                    }}
                    transition={{ 
                      duration: isFeeding ? 0.3 : 4, 
                      repeat: isFeeding ? 2 : Infinity,
                      ease: "easeInOut" 
                    }}
                    className="w-52 h-52 flex items-center justify-center drop-shadow-[0_35px_35px_rgba(99,102,241,0.25)] relative z-20"
                    style={{ 
                      filter: activePet.isDead ? 'grayscale(100%)' : 'none',
                    }}
                  >
                    {activePet.imageUrl ? (
                      <SafeImage 
                        src={activePet.imageUrl} 
                        alt={activePet.name}
                        className="w-full h-full object-contain"
                        fallbackText={activePet.name}
                        width="208"
                        height="208"
                      />
                    ) : (
                      <span className="text-[150px]">{PET_EMOJIS[activePet.type]}</span>
                    )}
                    
                    {/* Glowing Aura Base */}
                    {!activePet.isDead && (
                      <motion.div
                        animate={{ 
                          scale: [1, 1.2, 1],
                          opacity: [0.2, 0.5, 0.2]
                        }}
                        transition={{ duration: 4, repeat: Infinity }}
                        className="absolute inset-0 bg-indigo-500/10 blur-[60px] rounded-full -z-10"
                      />
                    )}
                  </motion.div>
                </div>

                <div className="space-y-2">
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={activePet.id}
                    className="flex flex-col items-center"
                  >
                    <h3 className="text-4xl font-black text-indigo-950 tracking-tight leading-none mb-2">{activePet.name}</h3>
                    <div className="flex items-center space-x-2">
                      <span className="bg-indigo-600/10 text-indigo-700 px-4 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-sm">
                        LV.{activePet.level} • {activePet.type}
                      </span>
                      {activePet.happiness > 80 && (
                        <span className="bg-emerald-100 text-emerald-600 px-3 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                          <Sparkle size={10} className="fill-emerald-500" /> 完美契约
                        </span>
                      )}
                    </div>
                  </motion.div>
                </div>

                {/* Enhanced Stats with Neumorphic Details */}
                <div className="grid grid-cols-2 gap-5 pt-2">
                  <div className="bg-gradient-to-br from-rose-50 to-white p-5 rounded-[32px] border-2 border-rose-100/50 shadow-lg shadow-rose-100/20 relative overflow-hidden">
                    <div className="flex items-center justify-between mb-3 relative z-10">
                      <Heart size={18} className="text-rose-500 fill-rose-500/20" />
                      <span className="text-[10px] font-black text-rose-400 uppercase tracking-widest">Vitality</span>
                    </div>
                    <div className="h-4 bg-rose-100 rounded-full overflow-hidden p-1 shadow-inner relative z-10">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(activePet.health / activePet.maxHealth) * 100}%` }}
                        className="h-full bg-gradient-to-r from-rose-400 to-rose-600 rounded-full shadow-[0_0_10px_rgba(244,63,94,0.5)]"
                      />
                    </div>
                    <div className="flex justify-between items-center mt-2 relative z-10">
                       <p className="text-[10px] font-black text-rose-300">HP</p>
                       <p className="text-sm font-black text-rose-600 tabular-nums">{activePet.health}/{activePet.maxHealth}</p>
                    </div>
                    {/* Background decoration */}
                    <div className="absolute -right-4 -bottom-4 text-4xl opacity-[0.03] pointer-events-none">❤️</div>
                  </div>

                  <div className="bg-gradient-to-br from-amber-50 to-white p-5 rounded-[32px] border-2 border-amber-100/50 shadow-lg shadow-amber-100/20 relative overflow-hidden">
                    <div className="flex items-center justify-between mb-3 relative z-10">
                      <Star size={18} className="text-amber-500 fill-amber-500/20" />
                      <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest">Aura</span>
                    </div>
                    <div className="h-4 bg-amber-100 rounded-full overflow-hidden p-1 shadow-inner relative z-10">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${activePet.happiness}%` }}
                        className="h-full bg-gradient-to-r from-amber-400 to-amber-600 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.5)]"
                      />
                    </div>
                    <div className="flex justify-between items-center mt-2 relative z-10">
                       <p className="text-[10px] font-black text-amber-300">SOL</p>
                       <p className="text-sm font-black text-amber-600 tabular-nums">{activePet.happiness}%</p>
                    </div>
                    {/* Background decoration */}
                    <div className="absolute -right-4 -bottom-4 text-4xl opacity-[0.03] pointer-events-none">✨</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Feeding Section */}
            {!activePet.isDead && (
              <div className="space-y-6">
                <div className="flex items-center justify-between px-2">
                  <h4 className="text-xl font-black text-indigo-900 flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600">
                       <Utensils size={20} />
                    </div>
                    <span>魔力滋养</span>
                  </h4>
                  <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-md px-4 py-2 rounded-2xl border-2 border-indigo-50 shadow-sm">
                    <Star size={16} className="text-amber-500 fill-amber-500" />
                    <span className="text-lg font-black text-indigo-700 tabular-nums">{stats.magicCoins}</span>
                  </div>
                </div>

                <div className="grid gap-4">
                  {FOOD_ITEMS.map(food => (
                    <motion.button
                      key={food.id}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleFeed(food)}
                      disabled={isFeeding}
                      className="bg-white p-5 rounded-[32px] border-2 border-indigo-50 hover:border-indigo-500 transition-all flex items-center justify-between group disabled:opacity-50 shadow-sm hover:shadow-xl hover:shadow-indigo-100 relative overflow-hidden"
                    >
                      <div className="flex items-center space-x-5 relative z-10">
                        <div className="w-16 h-16 bg-gradient-to-br from-indigo-50 to-white rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform overflow-hidden p-2 shadow-inner border border-indigo-100/50">
                          {food.imageUrl ? (
                            <SafeImage src={food.imageUrl} alt={food.name} className="w-full h-full object-contain" width="64" height="64" />
                          ) : (
                            <span>{food.id === 'food_apple' ? '🍎' : food.id === 'food_meat' ? '🍖' : '🧪'}</span>
                          )}
                        </div>
                        <div className="text-left">
                          <p className="font-black text-indigo-950 text-lg">{food.name}</p>
                          <p className="text-[11px] text-indigo-400 font-bold uppercase tracking-widest">{food.description}</p>
                        </div>
                      </div>
                      <div className="bg-indigo-600 text-white px-5 py-3 rounded-2xl font-black text-base shadow-lg shadow-indigo-200 group-hover:bg-indigo-700 transition-colors z-10">
                        {food.price} 🪙
                      </div>
                      
                      {/* Hover background splash */}
                      <div className="absolute inset-0 bg-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {activePet.isDead && (
              <div className="bg-rose-50 p-8 rounded-[40px] border-4 border-rose-100 text-center space-y-4">
                <Skull size={48} className="text-rose-500 mx-auto" />
                <h4 className="text-2xl font-black text-rose-900">宠兽已离世</h4>
                <p className="text-rose-600 font-bold">由于长期未喂养，你的宠兽已经回到了星辰大海。请在以后更加用心地照顾你的伙伴。</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Rules Modal */}
      <AnimatePresence>
        {showRules && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-indigo-900/40 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-[48px] p-8 max-w-sm w-full shadow-2xl space-y-6"
            >
              <div className="w-16 h-16 bg-indigo-100 rounded-[24px] flex items-center justify-center text-indigo-600 mx-auto">
                <Info size={32} />
              </div>
              <h3 className="text-2xl font-black text-center text-indigo-900">宠兽养成规则</h3>
              <div className="space-y-4 text-indigo-600 font-bold">
                <div className="flex items-start space-x-3">
                  <div className="mt-1"><AlertCircle size={16} /></div>
                  <p>宠兽每天需要喂养，否则生命值会下降。</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="mt-1"><AlertCircle size={16} /></div>
                  <p>每 24 小时未喂食，生命值减少 20 点。</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="mt-1"><AlertCircle size={16} /></div>
                  <p>生命值为 0 时，宠兽将会死亡。</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="mt-1"><AlertCircle size={16} /></div>
                  <p>喂食可以恢复生命值并增加快乐值。</p>
                </div>
              </div>
              <button 
                onClick={() => setShowRules(false)}
                className="w-full py-4 bg-indigo-600 text-white rounded-3xl font-black text-lg shadow-lg shadow-indigo-200"
              >
                我知道了
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast Message */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-rose-500 text-white px-6 py-3 rounded-full font-black shadow-xl z-[110]"
          >
            {message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PetPage;
