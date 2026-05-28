
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
  const [isTraining, setIsTraining] = useState(false);
  const [trainingLog, setTrainingLog] = useState('');
  const [activeConsoleTab, setActiveConsoleTab] = useState<'FEED' | 'PLAY' | 'TRAIN' | 'CLEAN'>('FEED');
  const [showRules, setShowRules] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [flyingFoods, setFlyingFoods] = useState<{ id: string; emoji: string; x: number; y: number }[]>([]);

  const activePet = stats.pets[selectedPetIndex];

  const petSizeMultiplier = activePet 
    ? (1 + (activePet.level - 1) * 0.05 + (activePet.health / activePet.maxHealth) * 0.12)
    : 1;

  const PET_SPEECHES: Record<string, string[]> = {
    DRAGON: [
      "嗷呜！背单词累了吗？让我的龙气吐息给你暖暖！🔥",
      "主人主人！我的魔力古籍又被我们点亮了！✨",
      "摸摸我的小龙角，我会吐彩虹爆米花给你吃！🌈",
      "咕嘟嘟，想和我一起去单词秘林探险寻宝嘛？🌳",
      "吼嗷！生命力变弱了，真想吃香喷喷的魔力肉块啊... 🍖"
    ],
    CAT: [
      "喵呜~ 主人辛苦啦！快来摸摸抓下巴，呼噜呼噜... 🥰",
      "主子！你今天背单词没？可不要偷懒当小趴菜哦！🐾",
      "咪呜！我刚才闻到了森林里拼音小蜜蜂的花粉香气！🐝",
      "喵！快喂我魔法苹果，吃完我能踩奶给你看哦！🍎",
      "等我特训满级，我就载着你飞跃整片单词群岛！👑"
    ],
    OWL: [
      "咕咕！微风微凉，正适合在月色下静心默单词。🦉",
      "哈！我的猫头鹰之眼已经看穿了所有的字母谜团！⚡",
      "智慧的符文正漂浮在你的额头前，棒棒哒！💡",
      "咕！苹果才是飞翔的基础养料，快来一个！🍏",
      "历练真好玩！我的心智护盾又变厚实了！🛡️"
    ],
    SLIME: [
      "咕噜咕噜~ 戳我肚肚一下！Duangduang的冰凉十足！🍮",
      "主人听我唱歌：咕嘟咕嘟，七彩气泡升起咯！🫧",
      "我是全林最乖、最听话的可爱魔药史莱姆！💖",
      "咕... 觉得疲惫的话，我能帮你做庄园净化spa哦！🧼",
      "我的胃空荡荡的，想喝生命灵药啦，带人家去买买嘛！🧪"
    ]
  };

  const [petSpeech, setPetSpeech] = useState<string | null>(null);

  // Set initial pet speech
  useEffect(() => {
    if (!activePet) return;
    if (activePet.isDead) {
      setPetSpeech("（回到了星空中，变成遥远灿烂的一颗星... 👻）");
      return;
    }
    const speeches = PET_SPEECHES[activePet.type] || ["咕噜咕噜！今天一起冒险呀！"];
    setPetSpeech(speeches[0]);
  }, [selectedPetIndex, activePet?.id]);

  // Handle clicking on pet
  const handlePetClick = () => {
    if (!activePet || activePet.isDead) return;
    audio.playPop();
    const speeches = PET_SPEECHES[activePet.type] || ["咕噜咕噜！今天一起冒险呀！"];
    const rand = Math.floor(Math.random() * speeches.length);
    setPetSpeech(speeches[rand]);
    // heart effect
    confetti({
      particleCount: 15,
      spread: 40,
      origin: { y: 0.45, x: 0.5 },
      colors: ['#FF6B6B', '#FF8E8E', '#FFB7B7']
    });
  };

  // 1. Feeding Care Method
  const handleFeed = (food: ShopItem) => {
    if (!activePet || activePet.isDead || isFeeding || isTraining) return;
    if (stats.magicCoins < food.price) {
      audio.playError();
      setMessage('魔法币不足！');
      setTimeout(() => setMessage(null), 2000);
      return;
    }

    setIsFeeding(true);
    audio.playPurchase();
    setPetSpeech(`嗷呜！敲好吃！正在美滋滋地享用「${food.name}」中！🍔✨`);

    // Spawn flying food particles towards pet
    const foodEmojis: Record<string, string> = {
      'food_apple': '🍎',
      'food_meat': '🍖',
      'food_elixir': '🧪'
    };
    const emoji = foodEmojis[food.id] || '🍎';
    const newFlyingFoods = Array.from({ length: 6 }).map((_, i) => ({
      id: Math.random().toString(),
      emoji,
      x: 20 + Math.random() * 60, // scatter horizontally
      y: 85 + Math.random() * 10  // start at the bottom area
    }));
    setFlyingFoods(newFlyingFoods);
    
    setTimeout(() => {
      onUpdateStats(prev => {
        const newPets = [...prev.pets];
        const pet = { ...newPets[selectedPetIndex] };
        pet.health = Math.min(pet.maxHealth, pet.health + (food.foodValue || 0));
        pet.happiness = Math.min(100, pet.happiness + 8);
        pet.lastFed = Date.now();
        newPets[selectedPetIndex] = pet;

        return {
          ...prev,
          magicCoins: prev.magicCoins - food.price,
          pets: newPets
        };
      });
      setIsFeeding(false);
      setFlyingFoods([]);
      audio.playSuccess();
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.5, x: 0.5 },
        colors: ['#FFD93D', '#6BCB77', '#FF8E8E']
      });
      setPetSpeech("嗝~ 真香！我感觉又长大了一圈，元气和魔力源源不断！🍎💖");
    }, 1200);
  };

  // 2. Playtime Interaction
  const handlePlayWithPet = () => {
    if (!activePet || activePet.isDead || isFeeding || isTraining) return;
    audio.playSuccess();
    
    onUpdateStats(prev => {
      const newPets = [...prev.pets];
      const pet = { ...newPets[selectedPetIndex] };
      pet.happiness = Math.min(100, pet.happiness + 15);
      newPets[selectedPetIndex] = pet;
      return { ...prev, pets: newPets };
    });
    
    setPetSpeech("哈哈！好痒呀，主人最疼我啦！快乐值瞬间拉满！🥰🎈");
    confetti({
      particleCount: 25,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#FF8E8E', '#FFA8E2', '#FFD93D']
    });
  };

  // 3. Forest Special Training Game Simulation
  const handleTrainPet = () => {
    if (!activePet || activePet.isDead || isFeeding || isTraining) return;
    if (stats.magicCoins < 15) {
      audio.playError();
      setMessage('特训魔源金币不足 (需要 15 🪙)！');
      setTimeout(() => setMessage(null), 2000);
      return;
    }

    setIsTraining(true);
    audio.playClick();
    
    const logs = [
      "正在带上行囊进入暮光单词森林... 🌲🦌",
      "遇到野生重读小恶魔！正在进行音标法对抗... 💥",
      "拼读狂飙！用连贯的拼法顺利破解了守护石碑！🔮",
      "击溃怪物！正在搜括森林遗迹里的魔力黄金圣器... 🎁"
    ];

    setTrainingLog(logs[0]);
    
    setTimeout(() => setTrainingLog(logs[1]), 800);
    setTimeout(() => setTrainingLog(logs[2]), 1600);
    setTimeout(() => setTrainingLog(logs[3]), 2400);

    setTimeout(() => {
      onUpdateStats(prev => {
        const newPets = [...prev.pets];
        const pet = { ...newPets[selectedPetIndex] };
        
        let currentXp = (pet as any).xp || 0;
        let pLevel = pet.level;
        let nextXp = currentXp + 35;
        let didLeveledUp = false;
        
        if (nextXp >= 100) {
          pLevel += 1;
          nextXp -= 100;
          didLeveledUp = true;
        }
        
        pet.level = pLevel;
        (pet as any).xp = nextXp;
        pet.happiness = Math.min(100, pet.happiness + 10);
        pet.health = Math.max(15, pet.health - 6); // consume fatigueness
        newPets[selectedPetIndex] = pet;

        const lootedCoins = 22 + Math.floor(Math.random() * 20); // random loot gold 22-42

        if (didLeveledUp) {
          setTimeout(() => {
            audio.playLevelUp();
            confetti({
              particleCount: 120,
              spread: 80,
              origin: { y: 0.45 },
              colors: ['#FFD93D', '#38BDF8', '#4ADE80', '#A855F7']
            });
          }, 150);
        }

        return {
          ...prev,
          magicCoins: prev.magicCoins - 15 + lootedCoins,
          pets: newPets
        };
      });

      setIsTraining(false);
      audio.playCheer();
      confetti({
        particleCount: 30,
        spread: 60,
        origin: { y: 0.7 }
      });
      
      const bootGolds = 22 + Math.floor(Math.random() * 20); // reference
      setPetSpeech(`呼~ 历练打怪回来啦！等级经验狂升，还给主人捎回了魔法金币！⚔️💎`);
    }, 3200);
  };

  // 4. Clean Sanctuary Method
  const handleCleanSanctuary = () => {
    if (!activePet || activePet.isDead || isFeeding || isTraining) return;
    if (stats.magicCoins < 10) {
      audio.playError();
      setMessage('打扫资金不足 (需要 10 🪙)！');
      setTimeout(() => setMessage(null), 2000);
      return;
    }

    audio.playEquip();
    onUpdateStats(prev => {
      const newPets = [...prev.pets];
      const pet = { ...newPets[selectedPetIndex] };
      pet.health = Math.min(pet.maxHealth, pet.health + 20);
      newPets[selectedPetIndex] = pet;
      return {
        ...prev,
        magicCoins: prev.magicCoins - 10,
        pets: newPets
      };
    });

    setPetSpeech("哗！好干净，异味和浮沉被清空啦！整个宠兽屋都充满了栀子花的香气！🍃🧼");
    confetti({
      particleCount: 20,
      angle: 60,
      spread: 40,
      colors: ['#34D399', '#6EE7B7']
    });
  };

  // Dynamic Battle Power Calculation
  const combatPower = activePet 
    ? Math.floor(activePet.level * 40 + activePet.happiness * 1.5 + activePet.health * 1) 
    : 0;

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-[#eafaf1] via-emerald-50 to-indigo-50 z-[60] overflow-y-auto pb-24">
      {/* Header */}
      <div className="sticky top-0 bg-white/80 backdrop-blur-md p-4 flex items-center justify-between border-b border-emerald-100 z-50 shadow-sm">
        <button onClick={onClose} className="p-2.5 hover:bg-emerald-100 rounded-2xl transition-all text-emerald-800 active:scale-95">
          <ChevronLeft size={22} />
        </button>
        <div className="text-center">
          <h2 className="text-xl font-black text-emerald-950 tracking-tight flex items-center justify-center gap-1.5">
            <span>🐾 宠兽守护神域</span>
          </h2>
          <div className="flex items-center justify-center space-x-1">
             <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
             <span className="text-[9px] font-black text-emerald-600 uppercase tracking-[0.2em]">Magical Pet Guardian Sphere</span>
          </div>
        </div>
        <button onClick={() => setShowRules(true)} className="p-2.5 hover:bg-emerald-100 rounded-2xl transition-all text-emerald-800">
          <Info size={22} />
        </button>
      </div>

      <div className="max-w-md mx-auto p-5 space-y-6 relative z-10">
        {stats.pets.length === 0 ? (
          <div className="space-y-8 py-4">
            {/* Summon empty state details (Already polished) */}
            <div className="text-center space-y-3 px-4">
              <div className="relative inline-block">
                <motion.div 
                  initial={{ scale: 0.5, rotate: -10 }}
                  animate={{ scale: 1, rotate: 0 }}
                  className="w-32 h-32 bg-gradient-to-br from-amber-400 to-orange-500 rounded-[40px] flex items-center justify-center mx-auto shadow-2xl shadow-orange-200 relative z-10"
                >
                  <Sparkle size={56} className="text-white animate-pulse" />
                </motion.div>
                <motion.div 
                  animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.2, 0.1] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="absolute inset-0 bg-amber-500 rounded-full blur-3xl -z-10"
                />
                <motion.div 
                   animate={{ y: [0, -15, 0], x: [0, 10, 0] }}
                   transition={{ duration: 5, repeat: Infinity }}
                   className="absolute -top-4 -right-4 text-4xl"
                >
                  ✨
                </motion.div>
              </div>
              <h3 className="text-5xl font-black text-emerald-950 tracking-tight leading-tight pt-4">契约召唤你的宠兽</h3>
              <p className="text-emerald-700 font-extrabold text-xl leading-relaxed pt-2">在冒险森林中，拥有一位忠诚的伙伴能让你的单词探索效率暴涨！</p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {[
                { icon: <Trophy className="text-amber-500" size={24} />, title: "荣耀历练", desc: "专属宠兽勋章，带在身边极具安全感。" },
                { icon: <Gamepad2 className="text-sky-500" size={24} />, title: "特训探险", desc: "把金币分给宠兽特训，在野外可带回丰厚金币！" },
                { icon: <Sword className="text-rose-500" size={24} />, title: "战力增益", desc: "宠兽拥有战斗力模块，伴随你在奇旅大杀四方。" },
              ].map((benefit, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white p-6 rounded-[28px] border-2 border-emerald-50 shadow-sm flex items-center space-x-5"
                >
                  <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center shrink-0">
                    {benefit.icon}
                  </div>
                  <div>
                    <h4 className="font-black text-[20px] text-emerald-950">{benefit.title}</h4>
                    <p className="text-[13.5px] text-slate-600 font-extrabold mt-1">{benefit.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Teaser Circle */}
            <div className="relative h-48 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-48 h-48 border-2 border-emerald-200 rounded-full animate-magic-rotate flex items-center justify-center">
                  <div className="w-40 h-40 border border-dashed border-emerald-300 rounded-full" />
                </div>
              </div>

              <div className="flex justify-around items-end opacity-25 filter grayscale blur-[1px] relative z-10 w-full px-12">
                <div className="text-6xl transform -rotate-12 translate-y-2">🐲</div>
                <div className="text-7xl transform">🦉</div>
                <div className="text-6xl transform rotate-12 translate-y-2">🐱</div>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => { audio.playClick(); onNavigate('SHOP'); }}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-6 rounded-[32px] font-black text-xl shadow-xl shadow-emerald-200 flex items-center justify-center space-x-3 cursor-pointer"
            >
              <ShoppingBag size={24} />
              <span>前往魔法商店领养宠兽</span>
            </motion.button>
          </div>
        ) : (
          <>
            {/* Pet Selector Tab Menu */}
            {stats.pets.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto pb-1 px-1">
                {stats.pets.map((pet, idx) => (
                  <button
                    key={pet.id}
                    onClick={() => setSelectedPetIndex(idx)}
                    className={`flex-shrink-0 px-5 py-2.5 rounded-[20px] font-extrabold text-xs transition-all border-2 ${
                      selectedPetIndex === idx 
                        ? 'bg-emerald-600 border-emerald-700 text-white shadow-md' 
                        : 'bg-white text-[#0f766e] border-emerald-100 hover:bg-emerald-50'
                    }`}
                  >
                    {PET_EMOJIS[pet.type]} {pet.name}
                  </button>
                ))}
              </div>
            )}

            {/* Pet Live Playground Simulator */}
            <div className="bg-white rounded-[50px] p-6 shadow-xl border-4 border-white relative overflow-hidden group">
              {/* Meadow Backdrop Layer */}
              <div className="absolute inset-0 bg-gradient-to-b from-[#f2fdf7] to-[#ffffff] pointer-events-none" />
              
              {/* Sunbeam Radiance Circle Behind Pet */}
              <div className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 pointer-events-none opacity-[0.25]">
                 <div className="w-full h-full border-4 border-emerald-200 rounded-full animate-magic-rotate flex items-center justify-center">
                    <div className="w-52 h-52 border border-dashed border-emerald-305 rounded-full" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      {[...Array(8)].map((_, i) => (
                        <div 
                          key={i} 
                          className="absolute w-2.5 h-2.5 bg-emerald-400 rounded-full"
                          style={{ transform: `rotate(${i * 45}deg) translateY(-100px)` }}
                        />
                      ))}
                    </div>
                 </div>
              </div>

              {/* Floating Ambient Forest Particles */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                <span className="absolute top-4 left-6 text-xl opacity-35 animate-bounce select-none">🦋</span>
                <span className="absolute bottom-16 right-8 text-xl opacity-35 animate-pulse select-none" style={{ animationDelay: '1.5s' }}>🌸</span>
                <span className="absolute top-1/2 right-12 text-sm opacity-20 rotate-12 select-none">🌱</span>
              </div>

              <div className="relative z-10 text-center space-y-4 font-sans">
                {/* Battle Power and Size Scale Rating Header */}
                {!activePet.isDead && (
                  <div className="flex justify-center items-center gap-3">
                    <div className="bg-gradient-to-r from-amber-400 to-orange-500 text-amber-950 font-black text-[10px] px-3 py-1 rounded-full border border-white shadow-md uppercase tracking-wider flex items-center gap-1 scale-105">
                     <span>⭐ 契约兽战力</span>
                     <span className="bg-white/80 text-orange-600 px-1.5 py-0.2 rounded-md font-extrabold">{combatPower}</span>
                    </div>
                    <div className="bg-gradient-to-r from-emerald-400 to-teal-500 text-teal-900 font-black text-[10px] px-3 py-1 rounded-full border border-white shadow-md uppercase tracking-wider flex items-center gap-1 scale-105">
                     <span>⚖️ 萌宠体格</span>
                     <span className="bg-white/90 text-teal-700 px-1.5 py-0.2 rounded-md font-extrabold">x{petSizeMultiplier.toFixed(2)}</span>
                    </div>
                  </div>
                )}

                {/* Animated Speech Bubble */}
                <AnimatePresence mode="wait">
                  {petSpeech && (
                    <div 
                      className="bg-[#eefcf5] text-emerald-950 font-black text-xs px-4 py-3 rounded-2xl border border-emerald-200/80 shadow-sm relative inline-block max-w-[85%] mx-auto font-sans leading-relaxed text-center filter drop-shadow-sm select-none"
                    >
                      <span className="block">{petSpeech}</span>
                      {/* Triangle Pointer */}
                      <div className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-3 h-3 bg-[#eefcf5] border-r border-b border-emerald-200/80 rotate-45" />
                    </div>
                  )}
                </AnimatePresence>

                {/* Pet Animated Avatar Node */}
                <div className="relative inline-block py-2">
                  {/* Flying Food Particles Inside Playground */}
                  {flyingFoods.map(item => (
                    <motion.div
                      key={item.id}
                      initial={{ left: `${item.x}%`, top: `${item.y}%`, scale: 1, opacity: 1, rotate: 0 }}
                      animate={{ 
                        left: '50%', 
                        top: '50%', 
                        scale: 0.2, 
                        opacity: 0,
                        rotate: 360
                      }}
                      transition={{ duration: 1.05, ease: 'easeInOut' }}
                      className="absolute text-5xl z-30 pointer-events-none select-none -translate-x-1/2 -translate-y-1/2"
                    >
                      {item.emoji}
                    </motion.div>
                  ))}

                  <motion.div
                    onClick={handlePetClick}
                    animate={activePet.isDead ? {} : (isTraining ? {
                      y: [0, -25, 0, -15, 0],
                      scale: [petSizeMultiplier, petSizeMultiplier * 1.08, petSizeMultiplier * 0.95, petSizeMultiplier * 1.05, petSizeMultiplier],
                      rotate: [0, -10, 10, -5, 0]
                    } : {
                      y: [0, -12, 0],
                      scale: isFeeding 
                        ? [petSizeMultiplier, petSizeMultiplier * 1.35, petSizeMultiplier * 1.1, petSizeMultiplier * 1.25, petSizeMultiplier] 
                        : [petSizeMultiplier, petSizeMultiplier * 1.03, petSizeMultiplier],
                      rotateY: [0, 8, -8, 0]
                    })}
                    transition={{ 
                      duration: isTraining ? 1 : (isFeeding ? 0.35 : 4), 
                      repeat: isTraining || isFeeding ? Infinity : Infinity,
                      ease: "easeInOut" 
                    }}
                    className="w-48 h-48 flex items-center justify-center drop-shadow-[0_20px_25px_rgba(5,150,105,0.18)] relative z-20 cursor-pointer animate-none"
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
                        width="192"
                        height="192"
                      />
                    ) : (
                      <span className="text-[130px] filter drop-shadow-md select-none">{PET_EMOJIS[activePet.type]}</span>
                    )}
                    
                    {/* Glowing Aura Base */}
                    {!activePet.isDead && (
                      <motion.div
                        animate={{ 
                          scale: [1, 1.2, 1],
                          opacity: [0.15, 0.35, 0.15]
                        }}
                        transition={{ duration: 3, repeat: Infinity }}
                        className="absolute inset-0 bg-emerald-400/20 blur-[50px] rounded-full -z-10 animate-none"
                      />
                    )}
                  </motion.div>
                  
                  {/* Click Pointer Tag */}
                  {!activePet.isDead && (
                    <div className="text-[9px] text-emerald-500 font-extrabold uppercase tracking-widest pointer-events-none mt-1 select-none animate-pulse">
                      👈 点击宠兽互动摸摸 👈
                    </div>
                  )}
                </div>

                {/* Pet Title Profile */}
                <div className="space-y-1">
                  <h3 className="text-3xl font-black text-emerald-950 tracking-tight leading-none">{activePet.name}</h3>
                  <div className="flex items-center justify-center space-x-2">
                    <span className="bg-emerald-100 text-emerald-800 px-3.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider">
                      Rank.{activePet.level} • {activePet.type === 'DRAGON' ? '幻影巨龙' : activePet.type === 'CAT' ? '橘胖巫师' : activePet.type === 'OWL' ? '贤者雪鸮' : '晶透粘液兽'}
                    </span>
                    {activePet.happiness > 80 && (
                      <span className="bg-amber-100 text-amber-700 font-extrabold px-3 py-1 rounded-full text-[9px] uppercase tracking-wide flex items-center gap-1 shadow-sm">
                        ✨ 心灵共鸣
                      </span>
                    )}
                  </div>
                </div>

                {/* Highly Polished Statistics Gauges */}
                <div className="space-y-3 pt-2">
                  {/* Vitality (HP) Progress Gauge */}
                  <div className="bg-[#fcfdfa] p-3 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wider mb-1 px-1">
                      <span className="text-rose-500 flex items-center font-bold">❤️ 生命魔元 (Vitality)</span>
                      <span className="text-rose-600 font-extrabold">{activePet.health}/{activePet.maxHealth}</span>
                    </div>
                    <div className="h-3 bg-rose-50 rounded-full overflow-hidden p-0.5 border border-rose-100/50">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(activePet.health / activePet.maxHealth) * 100}%` }}
                        className="h-full bg-gradient-to-r from-rose-400 to-rose-500 rounded-full"
                      />
                    </div>
                  </div>

                  {/* Aura (Happiness) Progress Gauge */}
                  <div className="bg-[#fcfdfa] p-3 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wider mb-1 px-1">
                      <span className="text-amber-500 flex items-center font-bold">✨ 心灵愉悦 (Aura / SOL)</span>
                      <span className="text-amber-600 font-extrabold">{activePet.happiness}/100</span>
                    </div>
                    <div className="h-3 bg-amber-50 rounded-full overflow-hidden p-0.5 border border-amber-100/40">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${activePet.happiness}%` }}
                        className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full"
                      />
                    </div>
                  </div>

                  {/* Level Progression (XP) Progress Gauge */}
                  <div className="bg-[#fcfdfa] p-3 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wider mb-1 px-1">
                      <span className="text-[#3b82f6] flex items-center font-bold">🎓 特训经验 (Progression XP)</span>
                      <span className="text-[#3b82f6] font-extrabold">{((activePet as any).xp || 0)}/100</span>
                    </div>
                    <div className="h-3 bg-blue-50 rounded-full overflow-hidden p-0.5 border border-blue-100/40">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${((activePet as any).xp || 0)}%` }}
                        className="h-full bg-gradient-to-r from-blue-400 to-sky-500 rounded-full"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Special Training Active Game Overlay Screen */}
              <AnimatePresence>
                {isTraining && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-[#022c22]/95 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-40"
                  >
                    <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-400/40 animate-pulse mb-4">
                      <Trophy size={32} className="text-amber-400 animate-bounce" />
                    </div>
                    <h4 className="text-lg font-black text-amber-300">⚔️ 执勤特训历练中</h4>
                    <p className="text-emerald-200 mt-0.5 text-[9px] tracking-wider uppercase">Magical Forest Field Exploration</p>
                    
                    {/* Live Progress loading bar */}
                    <div className="w-48 h-2.5 bg-[#011f18] rounded-full mt-4 p-0.5 overflow-hidden border border-emerald-500/25">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 3.2, ease: "linear" }}
                        className="h-full bg-gradient-to-r from-emerald-400 to-yellow-400 rounded-full"
                      />
                    </div>

                    {/* Sequential simulation text ticker */}
                    <div className="mt-6 bg-[#011f18]/60 border border-emerald-500/15 rounded-xl p-3 w-full h-16 flex items-center justify-center">
                     <p className="text-emerald-50 font-black text-xs animate-pulse leading-snug">
                       {trainingLog}
                     </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Interactive care console controller */}
            {!activePet.isDead && (
              <div className="space-y-3">
                {/* Console controller header navigation tabs */}
                <div className="flex bg-slate-100 p-1.5 rounded-2xl gap-1 border border-slate-250 shadow-inner">
                  <button 
                    onClick={() => { audio.playClick(); setActiveConsoleTab('FEED'); }}
                    className={`flex-1 py-2 rounded-xl font-black text-[10px] transition-all flex flex-col items-center justify-center ${activeConsoleTab === 'FEED' ? 'bg-white text-[#115e59] shadow' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    <Utensils size={13} className="mb-0.5 text-emerald-600" />
                    <span>喂食滋养</span>
                  </button>
                  <button 
                    onClick={() => { audio.playClick(); setActiveConsoleTab('PLAY'); }}
                    className={`flex-1 py-2 rounded-xl font-black text-[10px] transition-all flex flex-col items-center justify-center ${activeConsoleTab === 'PLAY' ? 'bg-white text-[#115e59] shadow' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    <Gamepad2 size={13} className="mb-0.5 text-amber-500" />
                    <span>陪伴抚摸</span>
                  </button>
                  <button 
                    onClick={() => { audio.playClick(); setActiveConsoleTab('TRAIN'); }}
                    className={`flex-1 py-2 rounded-xl font-black text-[10px] transition-all flex flex-col items-center justify-center ${activeConsoleTab === 'TRAIN' ? 'bg-white text-[#115e59] shadow' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    <Sword size={13} className="mb-0.5 text-[#3b82f6]" />
                    <span>特训战斗</span>
                  </button>
                  <button 
                    onClick={() => { audio.playClick(); setActiveConsoleTab('CLEAN'); }}
                    className={`flex-1 py-2 rounded-xl font-black text-[10px] transition-all flex flex-col items-center justify-center ${activeConsoleTab === 'CLEAN' ? 'bg-white text-[#115e59] shadow' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    <Sparkles size={13} className="mb-0.5 text-emerald-500" />
                    <span>庄园清扫</span>
                  </button>
                </div>

                {/* Console display area */}
                <div className="bg-white rounded-[32px] p-4 border border-slate-50 shadow-md">
                  {/* FEED TAB DISPLAY */}
                  {activeConsoleTab === 'FEED' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-extrabold text-emerald-950 text-xs flex items-center gap-1">
                          <span>🍔 魔法金币余额:</span>
                          <span className="text-emerald-700 font-black">{stats.magicCoins} 🪙</span>
                        </h4>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Feed Pantry</span>
                      </div>

                      <div className="grid grid-cols-1 gap-2.5">
                        {FOOD_ITEMS.map(food => (
                          <button
                            key={food.id}
                            onClick={() => handleFeed(food)}
                            className="w-full bg-slate-50 p-3 rounded-2xl border border-slate-100 hover:border-emerald-200 transition-all flex items-center justify-between group cursor-pointer active:bg-emerald-50/40"
                          >
                            <div className="flex items-center space-x-2.5 text-left">
                              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-lg border border-slate-100 shadow-sm shrink-0">
                                {food.id === 'food_apple' ? '🍎' : food.id === 'food_meat' ? '🍖' : '🧪'}
                              </div>
                              <div>
                                <p className="font-extrabold text-[#064e3b] text-xs">{food.name}</p>
                                <p className="text-[9px] text-slate-400 font-semibold">{food.description}</p>
                              </div>
                            </div>
                            <div className="bg-[#059669] text-white px-3 py-1.5 rounded-xl font-extrabold text-[11px] shadow">
                              {food.price} 🪙
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* PLAY TAB DISPLAY */}
                  {activeConsoleTab === 'PLAY' && (
                    <div className="text-center py-2 space-y-3">
                      <p className="text-[11px] text-[#064e3b] leading-relaxed font-bold">
                        不需要消耗金币！你可以拨弄抚摸它以使它开心。心灵愉悦值越高，战斗力增益越突出哦！💖
                      </p>
                      <button
                        onClick={handlePlayWithPet}
                        className="w-full bg-gradient-to-r from-pink-400 to-rose-500 text-white font-extrabold py-3.5 rounded-2xl shadow flex items-center justify-center space-x-2 text-xs cursor-pointer border-b-4 border-rose-700 hover:scale-102 active:scale-97 transition-all"
                      >
                        <span>🧸 亲密抚摸逗逗宠兽</span>
                        <span>(+15 愉悦度)</span>
                      </button>
                    </div>
                  )}

                  {/* TRAIN TAB DISPLAY */}
                  {activeConsoleTab === 'TRAIN' && (
                    <div className="space-y-3 py-1">
                      <p className="text-[10px] text-slate-500 leading-relaxed font-bold">
                        开展单词历练。收获极其丰厚的特训经验并捡回巨额魔法金币！
                      </p>
                      <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100 text-[10px] text-[#064e3b] font-bold space-y-1 text-left leading-normal">
                        <p>🔥 单次魔力特训资费: 15 金币</p>
                        <p>🎁 特训历练奖励: +35 经验 + 随机 22~42 星星金币掉落</p>
                        <p>⚠️ 体力消耗: 特训需额外消耗 6 点生命体力 HP</p>
                      </div>

                      <button
                        onClick={handleTrainPet}
                        className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-extrabold py-3.5 rounded-2xl shadow flex items-center justify-center gap-1 text-xs border-b-4 border-emerald-800 cursor-pointer hover:scale-102 active:scale-97 transition-all animate-none"
                      >
                        <span>⚔️ 支付 15 金币启动特训 ⚔️</span>
                      </button>
                    </div>
                  )}

                  {/* CLEAN TAB DISPLAY */}
                  {activeConsoleTab === 'CLEAN' && (
                    <div className="space-y-3 py-1">
                      <p className="text-[10px] text-slate-500 leading-relaxed font-bold text-center">
                        庄园尘埃可能诱发细菌，这能帮契约兽净化异常，快速补充精气生命值！
                      </p>
                      <div className="bg-sky-50 p-3 rounded-xl border border-sky-100 text-[10px] text-sky-850 font-bold space-y-1 text-left leading-normal">
                        <p>🧼 净化打扫资费: 10 金币</p>
                        <p>❤️ 净化特享收益: 极速恢复 +20 点精气生命值 HP</p>
                      </div>

                      <button
                        onClick={handleCleanSanctuary}
                        className="w-full bg-gradient-to-r from-sky-400 to-blue-500 text-white font-extrabold py-3.5 rounded-2xl shadow flex items-center justify-center gap-1 text-xs border-b-4 border-blue-700 cursor-pointer hover:scale-102 active:scale-97 transition-all animate-none"
                      >
                        <span>🧹 支付 10 金币净化庄园 🧴</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* DEAD RESURRECT INFO */}
            {activePet.isDead && (
              <div className="bg-rose-50 p-6 rounded-[36px] border border-rose-100 text-center space-y-3">
                <Skull size={40} className="text-rose-500 mx-auto" />
                <h4 className="text-xl font-black text-rose-900">契约印记已消逝</h4>
                <p className="text-rose-600 font-bold text-[11px] leading-relaxed">
                  由于此前遭遇极度饥饿，宠兽已重塑为原初星光飞返星盘。别难过，你可以携带积累的金币，前往契约商店寻觅更加逗人喜爱的新伙伴！
                </p>
                <div className="pt-2">
                 <button 
                   onClick={() => onNavigate('SHOP')}
                   className="bg-emerald-600 border-2 border-emerald-700 text-white font-extrabold px-5 py-2.5 rounded-2xl text-xs hover:bg-emerald-700 transition"
                 >
                   前往神之圣所召唤新伙伴
                 </button>
                </div>
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
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-emerald-950/40 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-[36px] p-6 max-w-sm w-full shadow-2xl space-y-4 border-4 border-emerald-500"
            >
              <div className="w-14 h-14 bg-emerald-50 rounded-[20px] flex items-center justify-center text-emerald-600 mx-auto border border-emerald-100">
                <Info size={28} />
              </div>
              <h3 className="text-xl font-black text-center text-[#064e3b]">宠兽神域育成典仪</h3>
              <div className="space-y-3 text-xs text-slate-600 font-bold leading-relaxed text-left">
                <div className="flex items-start space-x-2">
                  <div className="mt-0.5 text-emerald-600 shrink-0"><AlertCircle size={13} /></div>
                  <p>【每日饥饿】：生命值每隔 24h 减少 20 点。当 HP 归零，契约宠兽便会在夜色下返还星辰古河。</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="mt-0.5 text-emerald-600 shrink-0"><AlertCircle size={13} /></div>
                  <p>【特训收益】：特训开支 6 点体力，但必定获取 35 XP，并随行捡回 22~42 星星金币！</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="mt-0.5 text-emerald-600 shrink-0"><AlertCircle size={13} /></div>
                  <p>【摸头抚摸】：不消耗任何金币，心灵共鸣可以让经验、气场时刻拔高。</p>
                </div>
              </div>
              <button 
                onClick={() => setShowRules(false)}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-xs shadow-md transition-colors"
              >
                深悉守护法则
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
            className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-rose-500 text-white px-5 py-2.5 rounded-full text-xs font-black shadow-xl z-[110]"
          >
            {message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PetPage;
