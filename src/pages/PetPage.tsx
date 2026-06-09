
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

const TALENT_WORDS: Record<string, { word: string; translation: string; sentence: string; trick: string }[]> = {
  DRAGON: [
    { word: "Blazing", translation: "炽热的，闪耀的", sentence: "My blazing fire will melt any vocabulary challenges!", trick: "🔥 喷出七彩魔力龙焰，在半空幻化出漂亮的字母彩虹" },
    { word: "Majestic", translation: "雄伟的，庄严的", sentence: "Look at my majestic leather wings, ready to fly!", trick: "👑 傲娇地戴上纯金闪亮王冠，并向你威武致意" },
    { word: "Fierce", translation: "凶猛的，狂热的", sentence: "I roar fiercely but only to protect my favorite master!", trick: "⚡ 震翼咆哮施展龙吟，为你震碎身边一切拼读阻碍" }
  ],
  CAT: [
    { word: "Clandestine", translation: "秘密的，隐秘的", sentence: "I hide my clandestine catnip in your dictionary!", trick: "🐾 隐形瞬移并在沙发垫底下掏出一颗极品小鱼干" },
    { word: "Mischievous", translation: "顽皮的，淘气的", sentence: "A mischievous little kitty stole your heart and gold!", trick: "🧶 光速扑滚动感大毛线球，最后把自己捆成了一个猫猫粽子" },
    { word: "Adorable", translation: "可爱的，萌度爆表的", sentence: "They say cats are adorable protectors of memory!", trick: "💖 发起超能歪头粉红杀，用软糯糯的小温爪给你踩奶" }
  ],
  OWL: [
    { word: "Sagacious", translation: "睿智的，敏锐的", sentence: "My sagacious eyes see through all complex prefix rules!", trick: "🦉 戴上古朴的黄金单片镜，睿智点头指引高级前缀词根" },
    { word: "Erudite", translation: "博学的，饱学深思的", sentence: "An erudite owl who reads dictionaries during midnight!", trick: "📖 用小爪子麻利翻开星空牛皮魔法字典，倒背如流一整页" },
    { word: "Vigilant", translation: "警觉的，警惕的", sentence: "Be vigilant! Spelling traps are everywhere around you!", trick: "🌀 召唤出一卷温暖的智慧之盾风暴，替你驱散书桌上的瞌睡虫" }
  ],
  SLIME: [
    { word: "Malleable", translation: "可塑的，有弹性的", sentence: "I am completely malleable, squeeze me when you feel tired!", trick: "🍮 随心变身成粉嫩五角星，发出啵啵声，捏起来超级解压" },
    { word: "Luminous", translation: "发光的，明亮的", sentence: "A luminous slime that guides you through dark study nights!", trick: "🫧 浑身亮起极光水球光泽，变身一盏梦幻的单词小夜灯" },
    { word: "Vivacious", translation: "活泼的，神采奕奕的", sentence: "Stay vivacious! Word learning is a joyful adventure!", trick: "🌈 在空中搭建出一条蹦跳七彩粘液软虹，为你手舞足蹈" }
  ]
};

const PetPage: React.FC<PetPageProps> = ({ stats, onUpdateStats, onNavigate, onClose }) => {
  const [selectedPetIndex, setSelectedPetIndex] = useState(0);
  const [isFeeding, setIsFeeding] = useState(false);
  const [isTraining, setIsTraining] = useState(false);
  const [trainingLog, setTrainingLog] = useState('');
  const [activeConsoleTab, setActiveConsoleTab] = useState<'FEED' | 'PLAY' | 'TRAIN' | 'CLEAN'>('FEED');
  const [showRules, setShowRules] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [flyingFoods, setFlyingFoods] = useState<{ id: string; emoji: string; x: number; y: number }[]>([]);

  // Selected training map state
  const [selectedMapId, setSelectedMapId] = useState<'meadow' | 'canyon' | 'abyss'>('meadow');

  // Interactive Rock-Paper-Scissors states for Play tab
  const [playerChoice, setPlayerChoice] = useState<'ROCK' | 'PAPER' | 'SCISSORS' | null>(null);
  const [petChoice, setPetChoice] = useState<'ROCK' | 'PAPER' | 'SCISSORS' | null>(null);
  const [gameResult, setGameResult] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState(false);
  const [petSpeech, setPetSpeech] = useState<string | null>(null);
  const [isTalentedShow, setIsTalentedShow] = useState(false);
  const [talentWordInfo, setTalentWordInfo] = useState<{ word: string; translation: string; sentence: string; trick: string } | null>(null);

  const activePet = stats.pets[selectedPetIndex];

  const [flyingParticles, setFlyingParticles] = useState<{ id: string; emoji: string; x: number; y: number; rotate: number; scale: number }[]>([]);

  const triggerFlyingParticles = (petType: string) => {
    let emojiPool = ['⭐', '✨', '💖', '❤️'];
    if (petType === 'DRAGON') {
      emojiPool = ['⭐', '✨', '🔥', '🌟', '💥'];
    } else if (petType === 'CAT') {
      emojiPool = ['💖', '❤️', '🐾', '🌸', '🌹'];
    } else if (petType === 'OWL') {
      emojiPool = ['⭐', '✨', '🔮', '📖', '🌟', '🎓'];
    } else if (petType === 'SLIME') {
      emojiPool = ['🫧', '🍮', '💖', '❤️', '✨', '💧'];
    }

    const count = 4 + Math.floor(Math.random() * 4);
    const newParticles = Array.from({ length: count }).map((_, i) => ({
      id: Math.random().toString() + i,
      emoji: emojiPool[Math.floor(Math.random() * emojiPool.length)],
      x: (Math.random() * 80 - 40), 
      y: (Math.random() * 10 - 20), 
      rotate: Math.random() * 120 - 60,
      scale: 0.8 + Math.random() * 0.6
    }));

    setFlyingParticles(prev => [...prev, ...newParticles]);

    setTimeout(() => {
      setFlyingParticles(prev => prev.filter(p => !newParticles.find(np => np.id === p.id)));
    }, 1500);
  };

  useEffect(() => {
    if (activePet) {
      const greets: Record<string, string> = {
        DRAGON: "吼！我是尊贵的契约魔龙，快来和我探讨生词、提升战力吧！🔥",
        CAT: "喵呜~ 愚蠢的人类... 噢不，亲爱的主人，快在背单词之余喂喂我！🐱",
        OWL: "咕咕！学者，我的智慧之眼与你同在，准备好开启特训了吗？🦉",
        SLIME: "咕噜咕噜~ 软萌的史莱姆向你问好，戳一戳我超解压！🍮"
      };
      setPetSpeech(greets[activePet.type] || "咕嘟咕嘟，准备好特训和喂食了吗？✨");
    }
  }, [selectedPetIndex, activePet?.type]);

  const handlePetClick = () => {
    if (!activePet || activePet.isDead) return;
    try { 
      audio.playPetStroke(); 
      setTimeout(() => {
        audio.playCelestialMagic();
      }, 100);
    } catch (e) {}
    
    // Trigger floating love hearts or stars according to pet type
    triggerFlyingParticles(activePet.type);

    const speechArray = PET_SPEECHES[activePet.type] || ["来和我玩儿吧~ ✨"];
    const randomSpeech = speechArray[Math.floor(Math.random() * speechArray.length)];
    setPetSpeech(randomSpeech);
    
    onUpdateStats(prev => {
      const newPets = [...prev.pets];
      const pet = { ...newPets[selectedPetIndex] };
      pet.happiness = Math.min(100, pet.happiness + 3);
      newPets[selectedPetIndex] = pet;
      return { ...prev, pets: newPets };
    });

    confetti({
      particleCount: 15,
      spread: 40,
      origin: { y: 0.6 }
    });
  };

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
      "咕... 觉得疲惫的话，我能帮你做庄园净化哦！🧙‍♂️"
    ]
  };

  // 1. Feeding Care Method with Crit delicious bonus!
  const handleFeed = (food: ShopItem) => {
    if (!activePet || activePet.isDead || isFeeding || isTraining) return;
    if (stats.magicCoins < food.price) {
      audio.playError();
      setMessage('魔法币不足！');
      setTimeout(() => setMessage(null), 2000);
      return;
    }

    setIsFeeding(true);
    try {
      audio.playPurchase();
      audio.playPetFeed();
    } catch (e) {}
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
      const isCrit = Math.random() < 0.35; // 35% delicious crit!
      const finalHeal = Math.round((food.foodValue || 0) * (isCrit ? 1.5 : 1.0));
      const coinsBack = isCrit ? 15 : 0;

      onUpdateStats(prev => {
        const newPets = [...prev.pets];
        const pet = { ...newPets[selectedPetIndex] };
        pet.health = Math.min(pet.maxHealth, pet.health + finalHeal);
        pet.happiness = Math.min(100, pet.happiness + (isCrit ? 16 : 8));
        pet.lastFed = Date.now();
        newPets[selectedPetIndex] = pet;

        return {
          ...prev,
          magicCoins: prev.magicCoins - food.price + coinsBack,
          pets: newPets
        };
      });
      setIsFeeding(false);
      setFlyingFoods([]);
      
      try {
        audio.playSuccess();
        audio.playCelestialMagic();
      } catch (e) {}
      
      // Trigger particles as health/happiness increased!
      triggerFlyingParticles(activePet.type);
      
      confetti({
        particleCount: isCrit ? 80 : 50,
        spread: isCrit ? 90 : 60,
        origin: { y: 0.5, x: 0.5 },
        colors: isCrit ? ['#FFD700', '#FF8E8E', '#4ADE80', '#F472B6'] : ['#FFD93D', '#6BCB77', '#FF8E8E']
      });

      if (isCrit) {
        setPetSpeech(`🎉【神级美味暴击！】「${food.name}」绝顶美味，散发出契约魔法微光！体力超量恢复 +${finalHeal}！心情好爆！还在盘子底下刨出宠兽藏的 15 🪙 金币！✨😋💖`);
      } else {
        setPetSpeech(`嗝~ 真香！我感觉又长大了一圈，恢复了 ${finalHeal} 点生命，体力元气满满！🍎💖`);
      }
    }, 1200);
  };

  // 2. Playtime Interaction
  const handlePlayWithPet = () => {
    if (!activePet || activePet.isDead || isFeeding || isTraining || isTalentedShow) return;
    audio.playSuccess();
    
    onUpdateStats(prev => {
      const newPets = [...prev.pets];
      const pet = { ...newPets[selectedPetIndex] };
      pet.happiness = Math.min(100, pet.happiness + 15);
      newPets[selectedPetIndex] = pet;
      return { ...prev, pets: newPets };
    });
    
    setPetSpeech("哈哈！好痒呀，等一下要不要和我猜拳玩嘛？快乐瞬间上涨！🥰🎈");
    confetti({
      particleCount: 25,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#FF8E8E', '#FFA8E2', '#FFD93D']
    });
  };

  // 2.5 Pet Talent Show / Inspirational Bilingual Growth Trick
  const handlePetTalentShow = () => {
    if (!activePet || activePet.isDead || isTalentedShow || isFeeding || isTraining) return;
    setIsTalentedShow(true);
    setTalentWordInfo(null);
    try { audio.playClick(); } catch (e) {}

    const list = TALENT_WORDS[activePet.type] || TALENT_WORDS.SLIME;
    const picked = list[Math.floor(Math.random() * list.length)];
    setTalentWordInfo(picked);

    setPetSpeech(`✨「${activePet.name}」正在努力思索筹备，即将为你大展才艺：\n【${picked.trick}】... 🔮`);

    setTimeout(() => {
      setIsTalentedShow(false);
      const coinsGift = Math.random() < 0.45 ? 8 : 0; // 45% chance pet drops 8 gold as gift!

      onUpdateStats(prev => {
        const newPets = [...prev.pets];
        const pet = { ...newPets[selectedPetIndex] };
        pet.happiness = Math.min(100, pet.happiness + 18);
        newPets[selectedPetIndex] = pet;
        return {
          ...prev,
          magicCoins: prev.magicCoins + coinsGift,
          pets: newPets
        };
      });

      try {
        if (coinsGift > 0) {
          audio.playPurchase();
        } else {
          audio.playCheer();
        }
      } catch (e) {}

      const maybeGiftText = coinsGift > 0 ? ` 还超级大方地从百宝兜里塞给你 ${coinsGift} 🪙 金币作为学习奖励！` : "";
      
      setPetSpeech(`🎉【才艺大秀 · 单词启迪】\n「${activePet.name}」表演了：${picked.trick}！\n\n💡 互动启迪词：${picked.word}\n📖 词义译释：${picked.translation}\n📢 英文例句：\"${picked.sentence}\"\n${maybeGiftText}🐾💖`);
      
      confetti({
        particleCount: 50,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#A855F7', '#EC4899', '#3B82F6', '#10B981']
      });
    }, 1500);
  };

  // Interactive Rock-Paper-Scissors action
  const handleRPS = (choice: 'ROCK' | 'PAPER' | 'SCISSORS') => {
    if (!activePet || activePet.isDead || isShaking || isFeeding || isTraining) return;
    audio.playClick();
    setPlayerChoice(choice);
    setIsShaking(true);
    setGameResult(null);
    setPetChoice(null);

    const choices: ('ROCK' | 'PAPER' | 'SCISSORS')[] = ['ROCK', 'PAPER', 'SCISSORS'];
    const pChoice = choices[Math.floor(Math.random() * 3)];

    setTimeout(() => {
      setPetChoice(pChoice);
      setIsShaking(false);

      let result: 'WIN' | 'DRAW' | 'LOSE';
      if (choice === pChoice) {
        result = 'DRAW';
      } else if (
        (choice === 'ROCK' && pChoice === 'SCISSORS') ||
        (choice === 'PAPER' && pChoice === 'ROCK') ||
        (choice === 'SCISSORS' && pChoice === 'PAPER')
      ) {
        result = 'WIN';
      } else {
        result = 'LOSE';
      }

      onUpdateStats(prev => {
        const newPets = [...prev.pets];
        const pet = { ...newPets[selectedPetIndex] };
        
        let coinsBonus = 0;
        if (result === 'WIN') {
          pet.happiness = Math.min(100, pet.happiness + 25);
          coinsBonus = 10; // Pet rewards 10 coins!
          setGameResult('WIN');
          setPetSpeech(`🎉 哇！主人出了「${choice === 'ROCK' ? '✊ 石头' : choice === 'PAPER' ? '🖐️ 布' : '✌️ 剪刀'}」，我出了「${pChoice === 'ROCK' ? '✊ 石头' : pChoice === 'PAPER' ? '🖐️ 布' : '✌️ 剪刀'}」，猜拳完胜我！奉上 10 🪙 私房金币，主人赛高！💖🌟`);
        } else if (result === 'DRAW') {
          pet.happiness = Math.min(100, pet.happiness + 15);
          setGameResult('DRAW');
          setPetSpeech(`✨ 双生默契！我都出「${pChoice === 'ROCK' ? '✊ 石头' : pChoice === 'PAPER' ? '🖐️ 布' : '✌️ 剪刀'}」，这叫契约神兽的量子幽灵感应！🍎`);
        } else {
          pet.happiness = Math.min(100, pet.happiness + 12);
          setGameResult('LOSE');
          setPetSpeech(`🤪 耶~ 胜利啦！我出了「${pChoice === 'ROCK' ? '✊ 石头' : pChoice === 'PAPER' ? '🖐️ 布' : '✌️ 剪刀'}」，主人下次要看准哦，抱抱摸摸一下！✨`);
        }

        newPets[selectedPetIndex] = pet;
        return {
          ...prev,
          magicCoins: prev.magicCoins + coinsBonus,
          pets: newPets
        };
      });

      audio.playSuccess();
      confetti({
        particleCount: result === 'WIN' ? 45 : 20,
        spread: 50,
        origin: { y: 0.6 }
      });
    }, 800);
  };

  // 3. Forest Special Training Game Simulation with chosen maps
  const handleTrainPet = () => {
    if (!activePet || activePet.isDead || isFeeding || isTraining) return;

    // Define chosen map values
    const mapConfig = {
      meadow: { cost: 15, xp: 35, fatigue: 6, maxLoot: 42, name: '🌲 暮光单词草甸' },
      canyon: { cost: 30, xp: 80, fatigue: 15, maxLoot: 85, name: '🌋 雷炎重难峡谷' },
      abyss: { cost: 50, xp: 150, fatigue: 26, maxLoot: 145, name: '🌌 雅思托福深渊' }
    }[selectedMapId];

    if (stats.magicCoins < mapConfig.cost) {
      audio.playError();
      setMessage(`金币不足！探索需要 ${mapConfig.cost} 🪙`);
      setTimeout(() => setMessage(null), 2000);
      return;
    }

    if (activePet.health <= mapConfig.fatigue) {
      audio.playError();
      setMessage(`宠兽体力过低！需要生命 HP > ${mapConfig.fatigue}`);
      setTimeout(() => setMessage(null), 2000);
      return;
    }

    setIsTraining(true);
    audio.playClick();
    
    // Choose custom combat/adventure texts based on map and pet type
    const battleLogs = [
      `🤺【启程探索】携带能量干粮，带上行囊进入 「${mapConfig.name}」！`,
      `🦁 契约兽 「${activePet.name}」 发现守护词兽，张口释放本源大招！`,
      `💥 重难点拼写魔法激荡！疯狂抗衡英标、音调陷阱！`,
      `🏆 怪物溃退！在落叶石碑底掏出金光闪闪的宝藏钱袋！`
    ];

    setTrainingLog(battleLogs[0]);
    setTimeout(() => setTrainingLog(battleLogs[1]), 800);
    setTimeout(() => setTrainingLog(battleLogs[2]), 1600);
    setTimeout(() => setTrainingLog(battleLogs[3]), 2450);

    setTimeout(() => {
      // Calculate loot rewards
      const costAmount = mapConfig.cost;
      const minLoot = Math.floor(costAmount * 1.25);
      const lootedCoins = minLoot + Math.floor(Math.random() * (mapConfig.maxLoot - minLoot + 1));

      onUpdateStats(prev => {
        const newPets = [...prev.pets];
        const pet = { ...newPets[selectedPetIndex] };
        
        let currentXp = (pet as any).xp || 0;
        let pLevel = pet.level;
        let nextXp = currentXp + mapConfig.xp;
        let didLeveledUp = false;
        
        while (nextXp >= 100) {
          pLevel += 1;
          nextXp -= 100;
          didLeveledUp = true;
        }
        
        pet.level = pLevel;
        (pet as any).xp = nextXp;
        pet.happiness = Math.min(100, pet.happiness + 12);
        pet.health = Math.max(1, pet.health - mapConfig.fatigue); // consume weight
        newPets[selectedPetIndex] = pet;

        if (didLeveledUp) {
          setTimeout(() => {
            audio.playLevelUp();
            confetti({
              particleCount: 120,
              spread: 85,
              origin: { y: 0.45 },
              colors: ['#FFD93D', '#38BDF8', '#4ADE80', '#A855F7']
            });
          }, 150);
        }

        return {
          ...prev,
          magicCoins: prev.magicCoins - costAmount + lootedCoins,
          pets: newPets
        };
      });

      setIsTraining(false);
      audio.playCheer();
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.7 }
      });
      
      setPetSpeech(`呼~ 从「${mapConfig.name}」凯旋而退！我的历练等级暴增，还给主人捎回了 ${lootedCoins} 🪙 闪金！⚔️💎`);
    }, 3200);
  };

  // 4. Clean Sanctuary Method using Pet active skills!
  const handleCleanSanctuary = (isSkillClean: boolean) => {
    if (!activePet || activePet.isDead || isFeeding || isTraining) return;
    
    const cost = isSkillClean ? 20 : 10;
    const healVal = isSkillClean ? 55 : 20;

    if (stats.magicCoins < cost) {
      audio.playError();
      setMessage(`金币不足！打扫费需要 ${cost} 🪙`);
      setTimeout(() => setMessage(null), 2000);
      return;
    }

    audio.playEquip();

    const doubleBonusChance = Math.random() < 0.35; // 35% chance to find a bookmark
    const bonusGold = doubleBonusChance ? 18 : 0;

    onUpdateStats(prev => {
      const newPets = [...prev.pets];
      const pet = { ...newPets[selectedPetIndex] };
      pet.health = Math.min(pet.maxHealth, pet.health + healVal);
      pet.happiness = Math.min(100, pet.happiness + (isSkillClean ? 15 : 6));
      newPets[selectedPetIndex] = pet;
      return {
        ...prev,
        magicCoins: prev.magicCoins - cost + bonusGold,
        pets: newPets
      };
    });

    const skillNames = {
      DRAGON: '🔥【羽翼圣星明炎火化】',
      CAT: '🐾【梦幻肉垫粉红芳香踩奶】',
      OWL: '🦉【智慧之眼龙卷风飓风净化】',
      SLIME: '🧼【全浸润史莱姆吞噬微粒】'
    };
    const activeSkillName = skillNames[activePet.type] || '✨【宠兽净化气旋】';

    if (isSkillClean) {
      if (doubleBonusChance) {
        setPetSpeech(`哇！施展净化奥义 ${activeSkillName}，房间一尘不染！生命恢复 +${healVal}！还在缝隙里找到一张遗忘金色书签，折现奖励 +${bonusGold} 🪙！🐾🧼✨`);
      } else {
        setPetSpeech(`哈！施发大招 ${activeSkillName} 卷走万千浮尘，连墙角也闪闪发亮了！魔力生命极其丰厚加持 +${healVal}！💨🌟`);
      }
    } else {
      if (doubleBonusChance) {
        setPetSpeech(`拂去几缕凡尘！宠兽屋干净了不少，体力 +${healVal}！打扫中意外捡到落叶古币袋，魔法币增加 +18 🪙！🍒`);
      } else {
        setPetSpeech(`呼！简单拂尘清扫毕！浮灰退散，栀子花清风扑面而来，舒展舒适！🧼🍃`);
      }
    }

    confetti({
      particleCount: isSkillClean ? 45 : 20,
      angle: 90,
      spread: 50,
      colors: isSkillClean ? ['#38BDF8', '#34D399', '#FB7185'] : ['#34D399', '#A7F3D0']
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
          <h2 className="text-xl font-black text-emerald-950 tracking-tight flex items-center justify-center gap-1.5 flex-wrap">
            <span>🐾 宠兽守护神域</span>
          </h2>
          <div className="flex items-center justify-center space-x-1 mt-0.5">
             <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping shrink-0" />
             <span className="text-[13px] font-black text-emerald-600 uppercase tracking-widest">Magical Pet Guardian Sphere</span>
          </div>
        </div>
        <button onClick={() => setShowRules(true)} className="p-2.5 hover:bg-emerald-100 rounded-2xl transition-all text-emerald-800">
          <Info size={22} />
        </button>
      </div>

      <div className="max-w-md mx-auto p-3 space-y-4 relative z-10">
        {stats.pets.length === 0 ? (
          <div className="space-y-6 py-2">
            {/* Summon empty state details (Already polished) */}
            <div className="text-center space-y-2.5 px-4">
              <div className="relative inline-block">
                <motion.div 
                  initial={{ scale: 0.5, rotate: -10 }}
                  animate={{ scale: 1, rotate: 0 }}
                  className="w-28 h-28 bg-gradient-to-br from-amber-400 to-orange-500 rounded-[30px] flex items-center justify-center mx-auto shadow-2xl shadow-orange-200 relative z-10"
                >
                  <Sparkle size={48} className="text-white animate-pulse" />
                </motion.div>
                <motion.div 
                  animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.2, 0.1] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="absolute inset-0 bg-amber-500 rounded-full blur-3xl -z-10"
                />
                <motion.div 
                   animate={{ y: [0, -10, 0], x: [0, 8, 0] }}
                   transition={{ duration: 5, repeat: Infinity }}
                   className="absolute -top-3 -right-3 text-3xl"
                >
                  ✨
                </motion.div>
              </div>
              <h3 className="text-4xl font-black text-emerald-950 tracking-tight leading-tight pt-2">契约召唤你的宠兽</h3>
              <p className="text-emerald-700 font-extrabold text-lg leading-relaxed pt-1">在冒险森林中，拥有一位忠诚的伙伴能让你的单词探索效率暴涨！</p>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {[
                { icon: <Trophy className="text-amber-500" size={20} />, title: "荣耀历练", desc: "专属宠兽勋章，带在身边极具安全感。" },
                { icon: <Gamepad2 className="text-sky-500" size={20} />, title: "特训探险", desc: "把金币分给宠兽特训，在野外可带回丰厚金币！" },
                { icon: <Sword className="text-rose-500" size={20} />, title: "战力增益", desc: "宠兽拥有战斗力模块，伴随你在奇旅大杀四方。" },
              ].map((benefit, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: -25 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="bg-white p-4 rounded-[20px] border-2 border-emerald-50 shadow-sm flex items-center space-x-4"
                >
                  <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center shrink-0">
                    {benefit.icon}
                  </div>
                  <div>
                    <h4 className="font-black text-[18px] text-emerald-950">{benefit.title}</h4>
                    <p className="text-[13px] text-slate-600 font-extrabold mt-0.5">{benefit.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Teaser Circle */}
            <div className="relative h-32 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-32 h-32 border-2 border-emerald-200 rounded-full animate-magic-rotate flex items-center justify-center">
                  <div className="w-24 h-24 border border-dashed border-emerald-300 rounded-full" />
                </div>
              </div>

              <div className="flex justify-around items-end opacity-25 filter grayscale blur-[1px] relative z-10 w-full px-12">
                <div className="text-5xl transform -rotate-12 translate-y-2">🐲</div>
                <div className="text-6xl transform">🦉</div>
                <div className="text-5xl transform rotate-12 translate-y-2">🐱</div>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => { audio.playClick(); onNavigate('SHOP'); }}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-4.5 rounded-[24px] font-black text-lg shadow-lg shadow-emerald-200 flex items-center justify-center space-x-2.5 cursor-pointer"
            >
              <ShoppingBag size={22} />
              <span>前往魔法商店领养宠兽</span>
            </motion.button>
          </div>
        ) : (
          <>
            {/* Pet Selector Tab Menu */}
            {stats.pets.length > 1 && (
              <div className="flex space-x-1.5 overflow-x-auto pb-0.5 px-0.5">
                {stats.pets.map((pet, idx) => (
                  <button
                    key={pet.id}
                    onClick={() => setSelectedPetIndex(idx)}
                    className={`flex-shrink-0 px-4 py-2 rounded-[16px] font-extrabold text-[#022c22] text-xs transition-all border-2 ${
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
            <div className="bg-white rounded-[32px] p-4 shadow-lg border-2 border-white relative overflow-hidden group">
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

              <div className="relative z-10 text-center space-y-3 font-sans">
                {/* Battle Power and Size Scale Rating Header */}
                {!activePet.isDead && (
                  <div className="flex justify-center items-center gap-2.5">
                    <div className="bg-gradient-to-r from-amber-400 to-orange-500 text-amber-950 font-black text-[13px] px-2.5 py-1 rounded-full border border-white shadow-md uppercase tracking-wider flex items-center gap-1">
                     <span>⭐ 战力</span>
                     <span className="bg-white/85 text-orange-600 px-1.5 py-0.1 rounded-md font-extrabold">{combatPower}</span>
                    </div>
                    <div className="bg-gradient-to-r from-emerald-400 to-teal-500 text-teal-900 font-black text-[13px] px-2.5 py-1 rounded-full border border-white shadow-md uppercase tracking-wider flex items-center gap-1">
                     <span>⚖️ 体格</span>
                     <span className="bg-white/90 text-teal-700 px-1.5 py-0.1 rounded-md font-extrabold">x{petSizeMultiplier.toFixed(2)}</span>
                    </div>
                  </div>
                )}

                {/* Animated Speech Bubble */}
                <AnimatePresence mode="wait">
                  {petSpeech && (
                    <div 
                      className="bg-[#eefcf5] text-emerald-950 font-black text-[14px] px-4.5 py-2.5 rounded-2xl border border-emerald-250/80 shadow-sm relative inline-block max-w-[92%] mx-auto font-sans leading-relaxed text-center filter drop-shadow-sm select-none"
                    >
                      <span className="block whitespace-pre-line">{petSpeech}</span>
                      {/* Triangle Pointer */}
                      <div className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-3 h-3 bg-[#eefcf5] border-r border-b border-emerald-200/80 rotate-45" />
                    </div>
                  )}
                </AnimatePresence>

                {/* Pet Animated Avatar Node */}
                <div className="relative inline-block py-1">
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

                  {/* Floating Hearts/Stars Custom Interactive Animators */}
                  <AnimatePresence>
                    {flyingParticles.map(p => (
                      <motion.div
                        key={p.id}
                        initial={{ x: p.x, y: 0, scale: 0.5, opacity: 1, rotate: 0 }}
                        animate={{ 
                          x: p.x + (Math.random() * 80 - 40), 
                          y: p.y - 130 - Math.random() * 50, 
                          scale: p.scale * 1.6, 
                          opacity: 0,
                          rotate: p.rotate
                        }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.3, ease: "easeOut" }}
                        className="absolute text-3xl sm:text-4xl z-40 pointer-events-none select-none filter drop-shadow-md"
                        style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
                      >
                        {p.emoji}
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  <motion.div
                    onClick={handlePetClick}
                    animate={activePet.isDead ? {} : (isTraining ? {
                      y: [0, -20, 0, -12, 0],
                      scale: [petSizeMultiplier, petSizeMultiplier * 1.06, petSizeMultiplier * 0.96, petSizeMultiplier * 1.04, petSizeMultiplier],
                      rotate: [0, -8, 8, -4, 0]
                    } : {
                      y: [0, -10, 0],
                      scale: isFeeding 
                        ? [petSizeMultiplier, petSizeMultiplier * 1.3, petSizeMultiplier * 1.1, petSizeMultiplier * 1.2, petSizeMultiplier] 
                        : [petSizeMultiplier, petSizeMultiplier * 1.03, petSizeMultiplier],
                      rotateY: [0, 8, -8, 0]
                    })}
                    transition={{ 
                      duration: isTraining ? 1 : (isFeeding ? 0.35 : 4), 
                      repeat: isTraining || isFeeding ? Infinity : Infinity,
                      ease: "easeInOut" 
                    }}
                    className="w-36 h-36 flex items-center justify-center drop-shadow-[0_15px_18px_rgba(5,150,105,0.15)] relative z-20 cursor-pointer animate-none"
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
                        width="144"
                        height="144"
                      />
                    ) : (
                      <span className="text-[100px] filter drop-shadow-md select-none">{PET_EMOJIS[activePet.type]}</span>
                    )}
                    
                    {/* Glowing Aura Base */}
                    {!activePet.isDead && (
                      <motion.div
                        animate={{ 
                          scale: [1, 1.2, 1],
                          opacity: [0.15, 0.35, 0.15]
                        }}
                        transition={{ duration: 3, repeat: Infinity }}
                        className="absolute inset-0 bg-emerald-400/25 blur-[40px] rounded-full -z-10 animate-none"
                      />
                    )}
                  </motion.div>
                  
                  {/* Click Pointer Tag */}
                  {!activePet.isDead && (
                    <div className="text-[12px] text-emerald-600 font-black uppercase tracking-widest pointer-events-none mt-0.5 select-none animate-pulse">
                      👈 点击宠兽互动摸摸 👈
                    </div>
                  )}
                </div>

                {/* Pet Title Profile */}
                <div className="space-y-0.5">
                  <h3 className="text-2xl font-black text-emerald-950 tracking-tight leading-none">{activePet.name}</h3>
                  <div className="flex items-center justify-center space-x-1.5 mt-1 flex-wrap gap-1">
                    <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-[12px] font-black uppercase tracking-wider">
                      Rank.{activePet.level} • {activePet.type === 'DRAGON' ? '幻影巨龙' : activePet.type === 'CAT' ? '橘胖巫师' : activePet.type === 'OWL' ? '贤者雪鸮' : '晶透粘液兽'}
                    </span>
                    {activePet.happiness > 80 && (
                      <span className="bg-amber-100 text-amber-700 font-extrabold px-3 py-1 rounded-full text-[12px] uppercase tracking-wide flex items-center gap-1 shadow-sm">
                        ✨ 心灵共鸣
                      </span>
                    )}
                  </div>
                </div>

                {/* Highly Polished Statistics Gauges */}
                <div className="space-y-2.5 pt-2.5">
                  {/* Vitality (HP) Progress Gauge */}
                  <div className="bg-[#fcfdfa] p-3 rounded-2xl border border-slate-150 shadow-sm">
                    <div className="flex justify-between items-center text-[13px] font-black uppercase tracking-wider mb-1.5 px-1">
                      <span className="text-rose-500 flex items-center font-black">❤️ 生命魔元 (VITALITY)</span>
                      <span className="text-rose-600 font-extrabold">{activePet.health}/{activePet.maxHealth}</span>
                    </div>
                    <div className="h-4.5 bg-rose-50 rounded-full overflow-hidden p-0.5 border border-rose-100/50">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(activePet.health / activePet.maxHealth) * 100}%` }}
                        className="h-full bg-gradient-to-r from-rose-400 to-rose-500 rounded-full"
                      />
                    </div>
                  </div>

                  {/* Aura (Happiness) Progress Gauge */}
                  <div className="bg-[#fcfdfa] p-3 rounded-2xl border border-slate-150 shadow-sm">
                    <div className="flex justify-between items-center text-[13px] font-black uppercase tracking-wider mb-1.5 px-1">
                      <span className="text-amber-500 flex items-center font-black">✨ 心灵愉悦 (AURA / SOL)</span>
                      <span className="text-amber-600 font-extrabold">{activePet.happiness}/100</span>
                    </div>
                    <div className="h-4.5 bg-amber-50 rounded-full overflow-hidden p-0.5 border border-amber-100/40">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${activePet.happiness}%` }}
                        className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full"
                      />
                    </div>
                  </div>

                  {/* Level Progression (XP) Progress Gauge */}
                  <div className="bg-[#fcfdfa] p-3 rounded-2xl border border-slate-150 shadow-sm">
                    <div className="flex justify-between items-center text-[13px] font-black uppercase tracking-wider mb-1.5 px-1">
                      <span className="text-[#3b82f6] flex items-center font-black">🎓 特训经验 (PROGRESSION XP)</span>
                      <span className="text-[#3b82f6] font-extrabold">{((activePet as any).xp || 0)}/100</span>
                    </div>
                    <div className="h-4.5 bg-blue-50 rounded-full overflow-hidden p-0.5 border border-blue-100/40">
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
                <div className="flex bg-[#f1f5f9] p-1 bg-slate-100/90 rounded-2xl gap-1 border border-slate-200 shadow-sm">
                  <button 
                    onClick={() => { audio.playClick(); setActiveConsoleTab('FEED'); }}
                    className={`flex-1 py-1.5 px-1 rounded-xl font-black text-[15px] transition-all flex flex-col items-center justify-center ${activeConsoleTab === 'FEED' ? 'bg-white text-emerald-800 shadow-md border border-slate-100' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    <Utensils size={20} className="mb-0.5 text-emerald-600 font-bold" />
                    <span>喂食滋养</span>
                  </button>
                  <button 
                    onClick={() => { audio.playClick(); setActiveConsoleTab('PLAY'); }}
                    className={`flex-1 py-1.5 px-1 rounded-xl font-black text-[15px] transition-all flex flex-col items-center justify-center ${activeConsoleTab === 'PLAY' ? 'bg-white text-emerald-800 shadow-md border border-slate-100' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    <Gamepad2 size={20} className="mb-0.5 text-amber-500 font-semibold" />
                    <span>陪伴抚摸</span>
                  </button>
                  <button 
                    onClick={() => { audio.playClick(); setActiveConsoleTab('TRAIN'); }}
                    className={`flex-1 py-1.5 px-1 rounded-xl font-black text-[15px] transition-all flex flex-col items-center justify-center ${activeConsoleTab === 'TRAIN' ? 'bg-white text-emerald-800 shadow-md border border-slate-100' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    <Sword size={20} className="mb-0.5 text-sky-500 font-bold" />
                    <span>特训战斗</span>
                  </button>
                  <button 
                    onClick={() => { audio.playClick(); setActiveConsoleTab('CLEAN'); }}
                    className={`flex-1 py-1.5 px-1 rounded-xl font-black text-[15px] transition-all flex flex-col items-center justify-center ${activeConsoleTab === 'CLEAN' ? 'bg-white text-emerald-800 shadow-md border border-slate-100' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    <Sparkles size={20} className="mb-0.5 text-teal-500 font-bold" />
                    <span>庄园清扫</span>
                  </button>
                </div>

                {/* Console display area */}
                <div className="bg-white rounded-[24px] p-2.5 border border-slate-100 shadow-lg">
                  {/* FEED TAB DISPLAY */}
                  {activeConsoleTab === 'FEED' && (
                    <div className="space-y-1.5 py-0.5 text-left">
                      <p className="text-[12.5px] text-emerald-800 leading-tight font-extrabold text-center mb-1 bg-emerald-50/50 p-1.5 rounded-xl border border-emerald-150">
                        喂养美味的魔法食材可以恢复生命魔元 HP，高几率触发美味暴击哦！🍖✨
                      </p>
                      <div className="grid grid-cols-1 gap-1">
                        {FOOD_ITEMS.map(food => {
                          const foodEmojis: Record<string, string> = {
                            'food_apple': '🍎',
                            'food_meat': '🍖',
                            'food_elixir': '🧪'
                          };
                          const emoji = foodEmojis[food.id] || '🍎';
                          return (
                            <div 
                              key={food.id} 
                              className="bg-slate-50/50 hover:bg-slate-50 p-1.5 px-2 rounded-xl border border-slate-200/60 flex items-center justify-between gap-2 transition-all"
                            >
                              <div className="flex items-center gap-1.5 min-w-0">
                                <span className="text-xl p-1 bg-white rounded-lg border border-slate-100 shadow-xs shrink-0 select-none">
                                  {emoji}
                                </span>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-1">
                                    <span className="font-extrabold text-[#022c22] text-[13px] leading-tight truncate">{food.name}</span>
                                    <span className="text-[9.5px] font-black text-rose-500 bg-rose-50 border border-rose-100 px-1.5 py-0.2 rounded shrink-0">HP +{food.foodValue}</span>
                                  </div>
                                  <p className="text-[11px] text-slate-400 font-bold leading-none mt-0.5 truncate">{food.description}</p>
                                </div>
                              </div>
                              <button
                                onClick={() => handleFeed(food)}
                                disabled={isFeeding}
                                className="px-2.5 py-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:scale-102 hover:brightness-105 active:scale-97 text-white font-black text-[12px] rounded-lg border-b-2 border-emerald-700 shadow-xs flex items-center gap-0.5 shrink-0 cursor-pointer transition-all disabled:opacity-50"
                              >
                                <span>喂食</span>
                                <span className="bg-white/25 text-white px-1 py-0.1 rounded text-[9.5px] font-extrabold">{food.price}🪙</span>
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* PLAY TAB DISPLAY */}
                  {activeConsoleTab === 'PLAY' && (
                    <div className="text-center py-1 space-y-3">
                      <p className="text-[15px] text-[#064e3b] leading-relaxed font-extrabold px-1">
                        不需要消耗金币！你可以让契约兽亲密抚摸或表演词汇才艺，心灵愉悦更高其战力更强！💖
                      </p>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <button
                          onClick={handlePlayWithPet}
                          disabled={isTalentedShow}
                          className="w-full bg-gradient-to-r from-pink-400 to-rose-500 text-white font-black py-3 px-3 rounded-xl shadow-md flex items-center justify-center space-x-1.5 text-[15px] cursor-pointer border-b-2 border-rose-700 hover:scale-101 active:scale-98 transition-all disabled:opacity-50"
                        >
                          <span>🧸 亲密抚摸宠兽 (+15 护灵)</span>
                        </button>

                        <button
                          onClick={handlePetTalentShow}
                          disabled={isTalentedShow}
                          className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black py-3 px-3 rounded-xl shadow-md flex items-center justify-center space-x-1.5 text-[15px] cursor-pointer border-b-2 border-indigo-800 hover:scale-101 active:scale-98 transition-all disabled:opacity-50"
                        >
                          <span>{isTalentedShow ? '🔮 才艺表演中...' : '🔮 词汇才艺秀 (+18)'}</span>
                        </button>
                      </div>

                      <div className="border-t border-slate-100 pt-3 mt-1">
                        <div className="text-left mb-1.5 px-1 flex justify-between items-center">
                          <span className="font-extrabold text-[#022c22] text-[16px]">🎮 陪宠兽玩猜拳</span>
                          <span className="text-[12px] bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full font-black">免费玩 • 赢 10 🪙</span>
                        </div>
                        
                        {/* Choice Row */}
                        <div className="grid grid-cols-3 gap-2">
                          {(['ROCK', 'PAPER', 'SCISSORS'] as const).map(choice => {
                            const icons = { ROCK: '✊ 石头', PAPER: '🖐️ 布', SCISSORS: '✌️ 剪刀' };
                            return (
                              <button
                                key={choice}
                                disabled={isShaking}
                                onClick={() => handleRPS(choice)}
                                className={`py-2 rounded-xl text-[16px] font-black border-2 transition-all cursor-pointer ${
                                  playerChoice === choice 
                                    ? 'bg-amber-500 border-amber-600 text-white shadow-md scale-103' 
                                    : 'bg-white border-slate-200 text-slate-700 hover:border-amber-300 hover:bg-amber-50/20'
                                  }`}
                              >
                                {icons[choice]}
                              </button>
 
                            );
                          })}
                        </div>

                        {/* Game Status Block */}
                        <AnimatePresence mode="wait">
                          {(isShaking || gameResult) && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              className="mt-2.5 bg-slate-50 border border-slate-150 p-3 rounded-xl space-y-2"
                            >
                              {isShaking ? (
                                <div className="flex flex-col items-center justify-center py-1 space-y-1">
                                  <div className="text-2xl animate-bounce">✊🖐️✌️</div>
                                  <p className="text-[14px] font-black text-amber-600 animate-pulse">宠兽出手蓄力猜拳中...</p>
                                </div>
                              ) : (
                                <div className="space-y-1.5">
                                  <div className="flex justify-around items-center py-0.5">
                                    <div className="text-center">
                                      <p className="text-[12px] text-slate-400 font-extrabold">你的出拳</p>
                                      <p className="text-xl mt-0.5">
                                        {playerChoice === 'ROCK' ? '✊ 石头' : playerChoice === 'PAPER' ? '🖐️ 布' : '✌️ 剪刀'}
                                      </p>
                                    </div>
                                    <span className="text-slate-300 font-black text-xs">VS</span>
                                    <div className="text-center">
                                      <p className="text-[12px] text-slate-400 font-extrabold">宠兽出拳</p>
                                      <p className="text-xl mt-0.5">
                                        {petChoice === 'ROCK' ? '✊ 石头' : petChoice === 'PAPER' ? '🖐️ 布' : '✌️ 剪刀'}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="border-t border-slate-200/60 pt-1.5 text-center">
                                    {gameResult === 'WIN' && (
                                      <span className="bg-emerald-100 text-emerald-800 font-black text-[13px] px-3 py-1 rounded-full border border-emerald-200">
                                        🎉 胜出！好心情 +25，赢取 10 🪙
                                      </span>
                                    )}
                                    {gameResult === 'DRAW' && (
                                      <span className="bg-amber-100 text-amber-800 font-black text-[13px] px-3 py-1 rounded-full border border-amber-200">
                                        📊 平局！获得默契感应，好心情 +15
                                      </span>
                                    )}
                                    {gameResult === 'LOSE' && (
                                      <span className="bg-rose-100 text-rose-800 font-black text-[13px] px-3 py-1 rounded-full border border-rose-200">
                                        😿 惜败！宠兽开心扭臀，好心情 +12
                                      </span>
                                    )}
                                  </div>
                                </div>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  )}


                  {/* TRAIN TAB DISPLAY */}
                  {activeConsoleTab === 'TRAIN' && (
                    <div className="space-y-3.5 py-1 text-left animate-none">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-extrabold text-[#022c22] text-[16px]">🗺️ 请选择特训历练副本地图</span>
                        <span className="text-[12px] font-black text-slate-400">SELECT FIELD PORTAL</span>
                      </div>
                      
                      {/* Map Cards list */}
                      <div className="grid grid-cols-1 gap-2.5">
                        {(['meadow', 'canyon', 'abyss'] as const).map(mapId => {
                          const config = {
                            meadow: { cost: 15, xp: 35, fatigue: 6, rewards: '22~42', name: '🌲 暮光词汇草甸', desc: '微风轻拂，适合轻量词汇练兵与常规历练' },
                            canyon: { cost: 30, xp: 80, fatigue: 15, rewards: '45~85', name: '🌋 雷炎重难峡谷', desc: '雷电交加，专克重难点和多级拼写陷阱' },
                            abyss: { cost: 50, xp: 150, fatigue: 26, rewards: '75~145', name: '🌌 雅思托福深渊', desc: '星空旧道，爆肝进阶核心难词，暴增生命精元' }
                          }[mapId];

                          const isSelected = selectedMapId === mapId;

                          return (
                            <button
                              key={mapId}
                              type="button"
                              onClick={() => { audio.playClick(); setSelectedMapId(mapId); }}
                              className={`w-full p-3.5 rounded-2xl border-2 transition-all cursor-pointer text-left block flex flex-col justify-between ${
                                isSelected 
                                  ? 'bg-emerald-50/70 border-emerald-500 shadow-sm ring-1 ring-emerald-500/10' 
                                  : 'bg-white border-slate-200 hover:border-slate-300'
                              }`}
                            >
                              <div className="flex justify-between items-center w-full">
                                <span className={`text-[16px] font-black ${isSelected ? 'text-emerald-800' : 'text-slate-800'}`}>
                                  {config.name}
                                </span>
                                <span className={`text-[12px] font-black px-2.5 py-0.5 rounded-full ${isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                                  消耗 {config.cost} 🪙
                                </span>
                              </div>
                              <p className="text-[12px] text-slate-500 font-medium mt-1 leading-normal">{config.desc}</p>
                              <div className="flex justify-between gap-2 items-center w-full mt-2.5 border-t border-slate-105 pt-2 text-[12px] font-black text-slate-600">
                                <span className="text-emerald-600 shrink-0">🎓 XP: +{config.xp}</span>
                                <span className="text-amber-600 shrink-0">🪙 星金: {config.rewards}</span>
                                <span className="text-rose-500 shrink-0">❤️ 消耗: -{config.fatigue} HP</span>
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      <button
                        onClick={handleTrainPet}
                        className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black py-4 rounded-2xl shadow-md flex items-center justify-center gap-1.5 text-[15px] border-b-4 border-emerald-800 cursor-pointer hover:scale-101 active:scale-98 transition-all animate-none"
                      >
                        <span>⚔️ 携契约伙伴启动特训 ⚔️</span>
                      </button>
                    </div>
                  )}

                  {/* CLEAN TAB DISPLAY */}
                  {activeConsoleTab === 'CLEAN' && (
                    <div className="space-y-4 py-1">
                      <p className="text-[15px] text-slate-500 leading-relaxed font-extrabold text-center">
                        庄园落灰可能增加异常病兆。打扫除旧可以极速补充生命魔元，消除宠兽疲惫感！
                      </p>

                      <div className="grid grid-cols-1 gap-3.5">
                        {/* Option 1: Basic Sweep */}
                        <div className="bg-slate-50 p-4 rounded-3xl border border-slate-150 flex flex-col justify-between">
                          <div className="flex justify-between items-center w-full">
                            <div>
                              <span className="font-extrabold text-[#022c22] text-[16px]">🧹 基础手动轻扫拂尘</span>
                              <p className="text-[12px] text-slate-500 font-semibold mt-0.5">简单洗刮，消除污点和表面落叶</p>
                            </div>
                            <span className="text-[14px] font-black bg-slate-200 text-slate-700 px-3.5 py-1 rounded-xl shrink-0">10 🪙</span>
                          </div>
                          
                          <div className="flex justify-between items-center text-[12px] font-black text-slate-500 mt-2.5 pb-2.5 border-b border-slate-200/50">
                            <span className="text-rose-500">❤️ 生命精气恢复: +20 HP</span>
                            <span className="text-amber-500">✨ 心灵共鸣: +6 愉悦度</span>
                          </div>

                          <button
                            onClick={() => handleCleanSanctuary(false)}
                            className="w-full bg-slate-200 hover:bg-slate-300 text-slate-800 font-extrabold py-3.5 rounded-xl text-[15px] cursor-pointer transition-all active:scale-98 mt-2.5"
                          >
                            <span>开始常规手动清扫</span>
                          </button>
                        </div>

                        {/* Option 2: Pet Secret Skill Clean */}
                        <div className="bg-sky-50 p-4 rounded-3xl border-2 border-sky-200 flex flex-col justify-between shadow-sm relative overflow-hidden">
                          <div className="absolute top-0 right-0 bg-sky-500 text-white font-black text-[9px] px-2.5 py-0.5 rounded-bl-xl uppercase tracking-wider">
                            宠师绝技
                          </div>
                          
                          <div className="flex justify-between items-center w-full">
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-black text-sky-950 text-[16px]">🔮 契约奥义大扫除</span>
                                <span className="text-sky-500 animate-pulse">⚡</span>
                              </div>
                              <p className="text-[12px] text-sky-700 font-extrabold mt-0.5">
                                施展宠兽独特的 {activePet.type === 'DRAGON' ? '【明炎火化】' : activePet.type === 'CAT' ? '【梦幻肉垫踩奶】' : activePet.type === 'OWL' ? '【智慧眼卷风】' : '【全溶解净化】'} 奥义！
                              </p>
                            </div>
                            <span className="text-[14px] font-black bg-sky-600 text-white px-3.5 py-1 rounded-xl shrink-0">20 🪙</span>
                          </div>
                          
                          <div className="flex justify-between items-center text-[12px] font-black text-sky-850 mt-2.5 pb-2.5 border-b border-sky-100">
                            <span className="text-rose-600">❤️ 极速大额恢复: +55 HP!</span>
                            <span className="text-amber-600">✨ 心灵愉悦跃升: +15 愉悦度</span>
                          </div>

                          <button
                            onClick={() => handleCleanSanctuary(true)}
                            className="w-full bg-gradient-to-r from-sky-400 to-blue-500 hover:scale-101 text-white font-black py-3.5 rounded-xl text-[16px] cursor-pointer transition-all active:scale-98 border-b-4 border-blue-700 shadow-sm mt-3"
                          >
                            <span>释放契约奥义狂风狂洗 💫</span>
                          </button>
                        </div>
                      </div>
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
