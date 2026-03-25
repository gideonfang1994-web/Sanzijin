
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, Star, Info, ChevronLeft, 
  Utensils, Sparkles, Skull, AlertCircle
} from 'lucide-react';
import { Pet, UserStats, ShopItem } from '../types';
import audio from '../utils/AudioUtils';
import confetti from 'canvas-confetti';
import { getShopImageUrl } from '../constants';

interface PetPageProps {
  stats: UserStats;
  onUpdateStats: (updater: (prev: UserStats) => UserStats) => void;
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

const PetPage: React.FC<PetPageProps> = ({ stats, onUpdateStats, onClose }) => {
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
        <h2 className="text-xl font-black text-indigo-800 tracking-tight">我的宠兽</h2>
        <button onClick={() => setShowRules(true)} className="p-2 hover:bg-indigo-100 rounded-full transition-colors">
          <Info size={24} className="text-indigo-700" />
        </button>
      </div>

      <div className="max-w-md mx-auto p-6 space-y-8">
        {stats.pets.length === 0 ? (
          <div className="text-center py-20 space-y-6">
            <div className="text-8xl opacity-20">🥚</div>
            <h3 className="text-2xl font-black text-indigo-900">你还没有宠兽</h3>
            <p className="text-indigo-500 font-bold">前往魔法商店领养一只可爱的宠兽吧！</p>
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

            {/* Pet Display */}
            <div className="bg-white rounded-[48px] p-8 shadow-2xl border-4 border-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-16 -mt-16 opacity-50" />
              
              <div className="relative z-10 text-center space-y-6">
                <div className="relative inline-block perspective-1000">
                  <motion.div
                    animate={activePet.isDead ? {} : {
                      y: [0, -15, 0],
                      scale: isFeeding ? [1, 1.2, 1] : [1, 1.05, 1],
                      rotateY: [0, 10, -10, 0],
                      rotateX: [0, 5, -5, 0],
                      skewX: [0, 2, -2, 0]
                    }}
                    transition={{ 
                      duration: isFeeding ? 0.3 : 3, 
                      repeat: isFeeding ? 2 : Infinity,
                      ease: "easeInOut" 
                    }}
                    className="w-48 h-48 flex items-center justify-center drop-shadow-[0_25px_25px_rgba(0,0,0,0.15)] relative z-20"
                    style={{ 
                      filter: activePet.isDead ? 'grayscale(100%)' : 'none',
                      transformStyle: 'preserve-3d'
                    }}
                  >
                    {activePet.imageUrl ? (
                      <img 
                        src={activePet.imageUrl} 
                        alt={activePet.name}
                        className="w-full h-full object-contain"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <span className="text-[140px]">{PET_EMOJIS[activePet.type]}</span>
                    )}
                    
                    {/* Glow Effect */}
                    {!activePet.isDead && (
                      <motion.div
                        animate={{ 
                          scale: [1, 1.3, 1],
                          opacity: [0.2, 0.4, 0.2]
                        }}
                        transition={{ duration: 4, repeat: Infinity }}
                        className="absolute inset-0 bg-indigo-400/20 blur-[50px] rounded-full -z-10"
                      />
                    )}
                  </motion.div>

                  {/* Floating Stars Effect */}
                  {!activePet.isDead && (
                    <div className="absolute inset-0 pointer-events-none">
                      {[...Array(6)].map((_, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ 
                            opacity: [0, 1, 0],
                            scale: [0, 1, 0],
                            y: [-20, -100],
                            x: [Math.random() * 40 - 20, Math.random() * 100 - 50]
                          }}
                          transition={{ 
                            duration: 2 + Math.random() * 2,
                            repeat: Infinity,
                            delay: i * 0.5
                          }}
                          className="absolute top-1/2 left-1/2 text-2xl"
                        >
                          ✨
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {activePet.isDead && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-7xl z-30">
                      👻
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <h3 className="text-3xl font-black text-indigo-900">{activePet.name}</h3>
                  <div className="flex items-center justify-center space-x-2">
                    <span className="bg-indigo-100 text-indigo-600 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest">
                      LV.{activePet.level} {activePet.type}
                    </span>
                    {activePet.isDead && (
                      <span className="bg-rose-100 text-rose-600 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest">
                        已死亡
                      </span>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-rose-50 p-4 rounded-3xl border-2 border-rose-100">
                    <div className="flex items-center justify-between mb-2">
                      <Heart size={16} className="text-rose-500" />
                      <span className="text-xs font-black text-rose-400">生命值</span>
                    </div>
                    <div className="h-3 bg-rose-200 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(activePet.health / activePet.maxHealth) * 100}%` }}
                        className="h-full bg-rose-500"
                      />
                    </div>
                    <p className="text-right text-xs font-black text-rose-600 mt-1">{activePet.health}/{activePet.maxHealth}</p>
                  </div>

                  <div className="bg-amber-50 p-4 rounded-3xl border-2 border-amber-100">
                    <div className="flex items-center justify-between mb-2">
                      <Star size={16} className="text-amber-500" />
                      <span className="text-xs font-black text-amber-400">快乐值</span>
                    </div>
                    <div className="h-3 bg-amber-200 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${activePet.happiness}%` }}
                        className="h-full bg-amber-500"
                      />
                    </div>
                    <p className="text-right text-xs font-black text-amber-600 mt-1">{activePet.happiness}/100</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Feeding Section */}
            {!activePet.isDead && (
              <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                  <h4 className="text-lg font-black text-indigo-900 flex items-center space-x-2">
                    <Utensils size={20} />
                    <span>喂养宠兽</span>
                  </h4>
                  <div className="flex items-center space-x-1 bg-amber-100 px-3 py-1 rounded-full">
                    <Sparkles size={14} className="text-amber-600" />
                    <span className="text-sm font-black text-amber-700">{stats.magicCoins}</span>
                  </div>
                </div>

                <div className="grid gap-3">
                  {FOOD_ITEMS.map(food => (
                    <motion.button
                      key={food.id}
                      whileHover={{ scale: 1.02, x: 5 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleFeed(food)}
                      disabled={isFeeding}
                      className="bg-white p-4 rounded-3xl border-2 border-indigo-50 hover:border-indigo-500 transition-all flex items-center justify-between group disabled:opacity-50"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform overflow-hidden p-1">
                          {food.imageUrl ? (
                            <img src={food.imageUrl} alt={food.name} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                          ) : (
                            <span>{food.id === 'food_apple' ? '🍎' : food.id === 'food_meat' ? '🍖' : '🧪'}</span>
                          )}
                        </div>
                        <div className="text-left">
                          <p className="font-black text-indigo-900">{food.name}</p>
                          <p className="text-xs text-indigo-400 font-bold">{food.description}</p>
                        </div>
                      </div>
                      <div className="bg-indigo-600 text-white px-4 py-2 rounded-xl font-black text-sm">
                        {food.price} 🪙
                      </div>
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
