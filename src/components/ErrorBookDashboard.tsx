import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, Volume2, Sparkles, Trash2, Heart, Timer, Check, Flame, Zap, 
  BookOpen, Star, Shield, Award, Skull, Swords, RefreshCw, Sparkle, Info,
  Trophy, Target, Square, CheckSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserStats } from '../types';
import audio from '../utils/AudioUtils';
import confetti from 'canvas-confetti';
import { 
  getVocabularyErrors, 
  IncorrectVocabularyItem,
  getPurifiedSpirits,
  promoteToSpirit,
  reviewPurifiedSpirit,
  removePurifiedSpirit,
  calculateRetention,
  PurifiedSpiritItem
} from '../utils/errorBookUtils';
import { getCharacterPortraitSvgUri } from '../utils/CharacterIllustrator';
import { getShopItemSvgUri } from '../utils/ShopItemIllustrator';
import { CHARACTERS, SHOP_ITEMS } from '../constants';

export interface BountyChallenge {
  id: string;
  word: IncorrectVocabularyItem;
  type: 'EN_TO_ZH' | 'ZH_TO_EN' | 'SPELLING';
  prompt: string;
  correctAnswer: string;
  options: string[];
}

interface ErrorBookDashboardProps {
  stats: UserStats;
  onReward: (xp: number, coins: number) => void;
  onClose: () => void;
}

export const ErrorBookDashboard: React.FC<ErrorBookDashboardProps> = ({ stats, onReward, onClose }) => {
  // Navigation: Subzones
  // PEDIA = 怪兽天牢, ENCHANT = 铁匠铺·装备附魔, WANTED = 败将通缉令, SANCTUM = 圣殿·净化魂魄
  const [activeTab, setActiveTab] = useState<'PEDIA' | 'ENCHANT' | 'WANTED' | 'SANCTUM'>('PEDIA');
  
  const [errorList, setErrorList] = useState<IncorrectVocabularyItem[]>([]);
  const [purifiedSpirits, setPurifiedSpirits] = useState<PurifiedSpiritItem[]>([]);

  // Local persistent enchantment buffs
  const [activeEnchantBuff, setActiveEnchantBuff] = useState<{
    itemName: string;
    buffDuration: number; // 2 battles
    strengthBoost: number;
    agilityBoost: number;
  } | null>(null);

  // Sound and Speech Synthesis
  const speakWord = (wordText: string) => {
    try {
      audio.speak(wordText);
    } catch (e) {
      console.warn("Speech synthesis error:", e);
    }
  };

  // Reload data from local storage
  const loadData = () => {
    setErrorList(getVocabularyErrors());
    setPurifiedSpirits(getPurifiedSpirits());
  };

  useEffect(() => {
    loadData();
  }, []);

  // -------------------------------------------------------------
  // METRICS & USER HERO RESOLVERS
  // -------------------------------------------------------------
  const metrics = useMemo(() => {
    const totalErrors = errorList.length;
    const totalLearned = stats.totalWordsLearned || 10;
    
    const topHardest = [...errorList]
      .sort((a, b) => b.errorCount - a.errorCount)
      .slice(0, 3);
       
    const dueReviewsCount = purifiedSpirits.filter(s => s.nextReviewAt <= Date.now() || calculateRetention(s) <= 50).length;
    const finishedMasteryCount = purifiedSpirits.filter(s => s.stage === 5).length;
    
    const errorRatio = totalErrors / Math.max(1, totalLearned);
    const memoryHealthPercentage = Math.max(15, Math.min(100, Math.round((1 - errorRatio) * 105)));

    return {
      totalErrors,
      topHardest,
      dueReviewsCount,
      finishedMasteryCount,
      memoryHealthPercentage
    };
  }, [errorList, purifiedSpirits, stats]);

  const activeHero = useMemo(() => {
    const char = CHARACTERS.find(c => c.id === (stats.selectedCharacterId || 'c1')) || CHARACTERS[0];
    const equippedIds = stats.equippedItems?.[char.id] || [];
    const equippedNames = SHOP_ITEMS.filter(item => equippedIds.includes(item.id)).map(item => item.name);
    const petType = stats.pets?.[0]?.type;
    const avatarUri = getCharacterPortraitSvgUri(char, equippedNames, petType);
    
    return {
      char,
      equippedNames,
      avatarUri,
      level: stats.characterStats?.[char.id]?.level || stats.level || 1,
      stats: stats.characterStats?.[char.id] || { strength: 10, magic: 10, defense: 10, agility: 10 }
    };
  }, [stats]);

  // Exorcise monster manually
  const handleManualPurify = (item: IncorrectVocabularyItem) => {
    audio.playSuccess();
    const updatedSpirits = promoteToSpirit(item);
    setPurifiedSpirits(updatedSpirits);
    loadData();

    onReward(10, 5);
    confetti({
      particleCount: 40,
      spread: 50,
      origin: { y: 0.7 },
      colors: ['#a855f7', '#6366f1', '#3b82f6']
    });
  };

  const handleManualRelease = (spiritText: string) => {
    audio.playPop();
    const updated = removePurifiedSpirit(spiritText);
    setPurifiedSpirits(updated);
    loadData();
  };

  // Helper inside Jail: Monster Level Details
  const getMonsterClass = (errorCount: number) => {
    if (errorCount >= 5) {
      return {
        name: '烈焰毁灭领主 / World Boss',
        emoji: '🌋',
        desc: '极其顽固的五级心魔：吸纳万劫业火，防线固若金汤。将其战胜可获取丰厚神光馈赠！',
        color: 'from-rose-600 via-orange-500 to-red-650',
        borderColor: 'border-rose-500 shadow-[0_0_15px_rgba(239,68,68,0.7)] animate-pulse',
        badgeColor: 'bg-rose-950/80 border-rose-500 text-rose-350',
        glowBg: 'rgba(239,68,68,0.2)'
      };
    } else if (errorCount >= 3) {
      return {
        name: '玄铁双钩魔将 / Elite',
        emoji: '💀',
        desc: '三至四级精英邪灵：身覆带刺玄铠，常驻于潜意识深处纠缠。不可大意！',
        color: 'from-purple-600 to-indigo-700',
        borderColor: 'border-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]',
        badgeColor: 'bg-purple-950/80 border-purple-550 text-purple-300',
        glowBg: 'rgba(168,85,247,0.1)'
      };
    } else if (errorCount === 2) {
      return {
        name: '捣蛋赤面小妖 / Rogue Imp',
        emoji: '👹',
        desc: '二级游荡小魔：喜好偷啃记忆之火，行踪诡谲飘忽。',
        color: 'from-amber-500 to-rose-400',
        borderColor: 'border-amber-500/50 shadow-md',
        badgeColor: 'bg-amber-950/60 border-amber-500/40 text-amber-350',
        glowBg: 'rgba(245,158,11,0.05)'
      };
    } else {
      return {
        name: '迷途虚无幽灵 / Stray Ghost',
        emoji: '👻',
        desc: '一级微弱幽魂：记忆波形溢散而成的幻影。只需轻颂一遍释义即可引渡净化。',
        color: 'from-cyan-400 to-blue-500',
        borderColor: 'border-cyan-500/30',
        badgeColor: 'bg-slate-900 border-slate-800 text-cyan-350',
        glowBg: 'rgba(34,211,238,0.02)'
      };
    }
  };

  // Helper inside Sanctum: Ebbinghaus Stage Info
  const getSpiritStageDisplay = (stage: number) => {
    switch (stage) {
      case 1: 
        return { 
          name: '🌱 萌芽魂魄', 
          icon: '🌱', 
          color: 'from-teal-600 to-emerald-400', 
          desc: '初生弱魄（半衰期30秒）：覆有三重古老厚重枷锁锁闭。',
          chains: '⛓️⛓️⛓️ 枷锁厚重', 
          lockEmoji: '🔒',
          glowEffect: 'shadow-[0_0_8px_rgba(20,184,166,0.3)]'
        };
      case 2: 
        return { 
          name: '🌿 舒展幼灵', 
          icon: '🌿', 
          color: 'from-emerald-400 to-teal-400', 
          desc: '稳步入定（半衰期12h）：核心解禁，剩一缕精铁戒环环绕。',
          chains: '⛓️ 精铁单环', 
          lockEmoji: '🔓',
          glowEffect: 'shadow-[0_0_12px_rgba(52,211,153,0.4)]'
        };
      case 3: 
        return { 
          name: '☘️ 翠羽守护仙', 
          icon: '☘️', 
          color: 'from-teal-400 to-cyan-500', 
          desc: '渐入佳境（半衰期24h）：枷锁全碎，沐浴于记忆轻拂气场。',
          chains: '💫 灵能微风', 
          lockEmoji: '🕊️',
          glowEffect: 'shadow-[0_0_15px_rgba(45,212,191,0.5)]'
        };
      case 4: 
        return { 
          name: '🌸 凡尘神秀瓣', 
          icon: '🌸', 
          color: 'from-purple-400 to-pink-500', 
          desc: '融会贯通（半衰期3天）：在华逸的水晶音晶能量秘盒中沉浮自修。',
          chains: '🔮 水晶音盒', 
          lockEmoji: '✨',
          glowEffect: 'shadow-[0_0_20px_rgba(192,132,252,0.6)]'
        };
      case 5: 
        return { 
          name: '👑 黄金永恒圣果', 
          icon: '👑', 
          color: 'from-amber-400 via-yellow-450 to-orange-500 animate-pulse', 
          desc: '圆满终结（半衰期7天）：永不退化！金身大成，刻骨铭心！',
          chains: '👑 永恒金身', 
          lockEmoji: '👼',
          glowEffect: 'shadow-[0_0_35px_rgba(245,158,11,0.95)] shadow-yellow-500/40 border-yellow-300'
        };
      default: 
        return { 
          name: '未知元神', 
          icon: '❓', 
          color: 'from-slate-400 to-slate-500', 
          desc: '',
          chains: '', 
          lockEmoji: '❓',
          glowEffect: ''
        };
    }
  };


  // =============================================================
  // 🕹️ GAMEPLAY MODE A: 【铁匠铺·装备附魔】
  // =============================================================
  const [selectedEnchantJob, setSelectedEnchantJob] = useState<string | null>(null);
  const [isEnchantingActive, setIsEnchantingActive] = useState<boolean>(false);
  const [enchantPool, setEnchantPool] = useState<IncorrectVocabularyItem[]>([]);
  const [enchantIndex, setEnchantIndex] = useState<number>(0);
  const [enchantCorrectCount, setEnchantCorrectCount] = useState<number>(0);
  const [enchantOptions, setEnchantOptions] = useState<string[]>([]);
  const [enchantFeedback, setEnchantFeedback] = useState<string | null>(null);
  const [enchantFeedbackType, setEnchantFeedbackType] = useState<'SUCCESS' | 'ERROR' | null>(null);
  const [enchantSuccessAlert, setEnchantSuccessAlert] = useState<{
    itemName: string;
    xpEarned: number;
    coinsEarned: number;
  } | null>(null);

  // Default forgeable weapons in case player has empty equipped items
  const FORGEABLE_DEFAULT_ITEMS = useMemo(() => {
    return [
      { id: 'def_w1', name: '誓约破魔者之剑', desc: '学院特配双手猎魔巨剑，纹理完美，易吸纳魔法词灵！', requiredSlot: 'RIGHT_HAND' },
      { id: 'def_w2', name: '太古真理盾牌', desc: '龙骨合铸的圆形坚御圣盾，唯有纯烈智慧才能点亮其中护体灵光。', requiredSlot: 'BODY' },
      { id: 'def_w3', name: '星辉奥术圣杖', desc: '流溢着湛蓝星流能的符文木梳。契合高词力学生。', requiredSlot: 'RIGHT_HAND' },
    ];
  }, []);

  // Merge actual character equipped gear with defaults to prioritize real personalization
  const playerForgeableItems = useMemo(() => {
    if (activeHero.equippedNames && activeHero.equippedNames.length > 0) {
      const equippedList = activeHero.equippedNames.map((name, i) => ({
        id: `real_equip_${i}`,
        name: name,
        desc: `【当前穿戴中】你在换装商店中辛苦入手的极品行头，最适合刻画词灵能量！`,
        requiredSlot: name.includes('头盔') || name.includes('铠') || name.includes('盾') ? 'BODY' : 'RIGHT_HAND'
      }));
      // Pad with defaults if too short
      return [...equippedList, ...FORGEABLE_DEFAULT_ITEMS.slice(0, 1)];
    }
    return FORGEABLE_DEFAULT_ITEMS;
  }, [activeHero.equippedNames, FORGEABLE_DEFAULT_ITEMS]);

  const startEnchantmentProcess = (itemName: string) => {
    let pWords: IncorrectVocabularyItem[] = [...errorList];
    if (pWords.length < 5) {
      // Guarantee 5 words to let players play
      const fillers: IncorrectVocabularyItem[] = [
        { text: 'adventure', translation: '冒险', imageUrl: '', errorCount: 1, lastErrorAt: Date.now(), sources: ['ADVENTURE'] },
        { text: 'legend', translation: '传奇', imageUrl: '', errorCount: 1, lastErrorAt: Date.now(), sources: ['ADVENTURE'] },
        { text: 'glorious', translation: '辉煌的', imageUrl: '', errorCount: 1, lastErrorAt: Date.now(), sources: ['ADVENTURE'] },
        { text: 'conquer', translation: '征服', imageUrl: '', errorCount: 1, lastErrorAt: Date.now(), sources: ['ADVENTURE'] },
        { text: 'phoenix', translation: '凤凰', imageUrl: '', errorCount: 1, lastErrorAt: Date.now(), sources: ['ADVENTURE'] },
      ];
      pWords = [...pWords, ...fillers].slice(0, 5);
    } else {
      pWords = pWords.sort(() => Math.random() - 0.5).slice(0, 5);
    }

    setEnchantPool(pWords);
    setEnchantIndex(0);
    setEnchantCorrectCount(0);
    setSelectedEnchantJob(itemName);
    setIsEnchantingActive(true);
    setEnchantFeedback(null);
    setEnchantFeedbackType(null);
    setEnchantSuccessAlert(null);
    audio.playClick();
  };

  useEffect(() => {
    if (isEnchantingActive && enchantPool.length > 0 && enchantIndex < enchantPool.length) {
      const activeWord = enchantPool[enchantIndex];
      const audioTimer = setTimeout(() => speakWord(activeWord.text), 400);

      // Distractors pool
      const distractPool = ['古塔', '圣女', '圣光守护', '恶灵退散', '极速闪现', '火龙狂啸', '森之物语', '圣杯秘药', '虚弱药水', '金币增幅', '无畏重击', '审判利刃'];
      const incorrectChoices = distractPool
        .filter(t => t !== activeWord.translation)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);
      const shuffledOptions = [...incorrectChoices, activeWord.translation].sort(() => Math.random() - 0.5);
      
      setEnchantOptions(shuffledOptions);
      setEnchantFeedback(null);
      setEnchantFeedbackType(null);

      return () => clearTimeout(audioTimer);
    }
  }, [isEnchantingActive, enchantIndex, enchantPool]);

  const handleEnchantAnswer = (option: string) => {
    if (enchantFeedback) return;

    const activeWord = enchantPool[enchantIndex];
    const isCorrect = option === activeWord.translation;

    if (isCorrect) {
      audio.playSuccess();
      setEnchantCorrectCount(prev => prev + 1);
      setEnchantFeedback('✨ 完美刻印！附魔光晶亮起！');
      setEnchantFeedbackType('SUCCESS');
      promoteToSpirit(activeWord);
    } else {
      audio.playError();
      setEnchantFeedback(`💥 属性崩裂！正确释义应为：${activeWord.translation}`);
      setEnchantFeedbackType('ERROR');
    }

    setTimeout(() => {
      if (enchantIndex >= 4) {
        finishEnchantment();
      } else {
        setEnchantIndex(prev => prev + 1);
      }
    }, 1500);
  };

  const finishEnchantment = () => {
    setIsEnchantingActive(false);
    audio.playReward();
    
    // Reward ratios
    const xpReward = enchantCorrectCount * 15 + 20;
    const coinsReward = enchantCorrectCount * 5 + 10;
    onReward(xpReward, coinsReward);

    setEnchantSuccessAlert({
      itemName: selectedEnchantJob || '极佳装备',
      xpEarned: xpReward,
      coinsEarned: coinsReward
    });

    // Write temp active buff visible on main UI
    if (enchantCorrectCount === 5) {
      setActiveEnchantBuff({
        itemName: selectedEnchantJob || '附魔装备',
        buffDuration: 2,
        strengthBoost: 5,
        agilityBoost: 3
      });
    }

    // Exploding double confetti
    confetti({
      particleCount: 100,
      angle: 60,
      spread: 60,
      origin: { x: 0.1 },
      colors: ['#3b82f6', '#ec4899', '#f59e0b']
    });
    confetti({
      particleCount: 100,
      angle: 120,
      spread: 60,
      origin: { x: 0.9 },
      colors: ['#3b82f6', '#ec4899', '#f59e0b']
    });

    loadData();
  };

  const exitEnchantmentGame = () => {
    setSelectedEnchantJob(null);
    setIsEnchantingActive(false);
    loadData();
  };


  // =============================================================
  // 🕹️ GAMEPLAY MODE B: 【战场·败将通缉令】
  // =============================================================
  const [activeBountyWanted, setActiveBountyWanted] = useState<IncorrectVocabularyItem | null>(null);
  const [bountyOptions, setBountyOptions] = useState<string[]>([]);
  const [bountyFeedback, setBountyFeedback] = useState<string | null>(null);
  const [bountyStatus, setBountyStatus] = useState<'IDLE' | 'SUCCESS' | 'ERROR' | 'TIMEOUT'>('IDLE');
  const [bountyTimer, setBountyTimer] = useState<number>(10);
  const [bountyHP, setBountyHP] = useState<number>(3);
  const [isBountyBoardShaking, setIsBountyBoardShaking] = useState<boolean>(false);
  const [lastSlashedText, setLastSlashedText] = useState<boolean>(false);
  // Track cleared words on this session to show persistent stamp directly on the wanted list
  const [clearedBountyTexts, setClearedBountyTexts] = useState<string[]>([]);

  // =============================================================
  // 🕹️ GAMEPLAY MODE B2: NEW GROUP BOUNTY HUNT (逃犯缉拿大作战)
  // =============================================================
  const [selectedBountyTexts, setSelectedBountyTexts] = useState<string[]>([]);
  const [huntGameActive, setHuntGameActive] = useState<boolean>(false);
  const [huntChallenges, setHuntChallenges] = useState<BountyChallenge[]>([]);
  const [huntCurrentIndex, setHuntCurrentIndex] = useState<number>(0);
  const [huntLives, setHuntLives] = useState<number>(3);
  const [huntScore, setHuntScore] = useState<number>(0);
  const [huntEarnedCoins, setHuntEarnedCoins] = useState<number>(0);
  const [huntEarnedXP, setHuntEarnedXP] = useState<number>(0);
  const [huntAnimation, setHuntAnimation] = useState<'NONE' | 'SLASH' | 'CAPTURE' | 'ERROR'>('NONE');
  const [huntFeedback, setHuntFeedback] = useState<string | null>(null);

  // Spelling state
  const [huntSpellingInput, setHuntSpellingInput] = useState<string>('');
  const [huntScrambledLetters, setHuntScrambledLetters] = useState<string[]>([]);
  const [huntSelectedLetterIndices, setHuntSelectedLetterIndices] = useState<number[]>([]);

  const initSpellingLetters = (text: string) => {
    const letters = text.toLowerCase().replace(/[^a-z]/g, '').split('');
    const alphabet = 'abcdefghijklmnopqrstuvwxyz';
    const minLetters = Math.max(6, letters.length + 2);
    while (letters.length < minLetters) {
      const randChar = alphabet[Math.floor(Math.random() * 26)];
      if (!letters.includes(randChar)) {
        letters.push(randChar);
      }
    }
    return letters.sort(() => Math.random() - 0.5);
  };

  const getBountyDistractors = (correct: string, type: 'en' | 'zh', list: IncorrectVocabularyItem[]) => {
    const others = list
      .filter(item => (type === 'en' ? item.text.toLowerCase() : item.translation) !== correct.toLowerCase())
      .map(item => (type === 'en' ? item.text.toLowerCase() : item.translation));
    
    const fallbackZh = ['守护神光', '幽火护盾', '复原秘药', '圣洁之水', '星界晶核', '太古尘埃', '迷失虚空', '远古号角', '秘法符文', '金辉勋章'];
    const fallbackEn = ['temple', 'legend', 'victory', 'courage', 'wisdom', 'glory', 'quest', 'dragon', 'knight', 'avatar'];

    const fallback = type === 'en' ? fallbackEn : fallbackZh;
    const combined = Array.from(new Set([...others, ...fallback])).filter(item => item !== correct);
    
    return combined.sort(() => Math.random() - 0.5).slice(0, 3);
  };

  const startHuntForWords = (words: IncorrectVocabularyItem[]) => {
    if (words.length === 0) return;
    
    audio.playClick();
    const preparedChallenges: BountyChallenge[] = [];
    
    words.forEach((word) => {
      const lowerText = word.text.toLowerCase();
      // 1. EN_TO_ZH
      const zhDists = getBountyDistractors(word.translation, 'zh', errorList);
      preparedChallenges.push({
        id: `${word.text}-en2zh`,
        word,
        type: 'EN_TO_ZH',
        prompt: lowerText,
        correctAnswer: word.translation,
        options: [word.translation, ...zhDists].sort(() => Math.random() - 0.5)
      });
      
      // 2. ZH_TO_EN
      const enDists = getBountyDistractors(lowerText, 'en', errorList);
      preparedChallenges.push({
        id: `${word.text}-zh2en`,
        word,
        type: 'ZH_TO_EN',
        prompt: word.translation,
        correctAnswer: lowerText,
        options: [lowerText, ...enDists.map(o => o.toLowerCase())].sort(() => Math.random() - 0.5)
      });
      
      // 3. SPELLING
      preparedChallenges.push({
        id: `${word.text}-spelling`,
        word,
        type: 'SPELLING',
        prompt: word.translation,
        correctAnswer: lowerText,
        options: []
      });
    });
    
    const shuffledChallenges = preparedChallenges.sort(() => Math.random() - 0.5);
    
    setHuntChallenges(shuffledChallenges);
    setHuntCurrentIndex(0);
    setHuntLives(3);
    setHuntScore(0);
    setHuntEarnedCoins(0);
    setHuntEarnedXP(0);
    setHuntAnimation('NONE');
    setHuntFeedback(null);
    setHuntGameActive(true);
    
    if (shuffledChallenges[0]) {
      speakWord(shuffledChallenges[0].word.text);
      if (shuffledChallenges[0].type === 'SPELLING') {
        const letters = initSpellingLetters(shuffledChallenges[0].word.text);
        setHuntScrambledLetters(letters);
        setHuntSelectedLetterIndices([]);
        setHuntSpellingInput('');
      }
    }
  };

  const handleHuntAnswer = (answer: string) => {
    if (huntAnimation !== 'NONE') return;
    
    const activeChallenge = huntChallenges[huntCurrentIndex];
    const isCorrect = answer.trim().toLowerCase() === activeChallenge.correctAnswer.trim().toLowerCase();
    
    if (isCorrect) {
      audio.playSuccess();
      const isSpelling = activeChallenge.type === 'SPELLING';
      const animType: 'SLASH' | 'CAPTURE' = isSpelling ? 'CAPTURE' : 'SLASH';
      setHuntAnimation(animType);
      
      const stepXP = activeChallenge.type === 'SPELLING' ? 15 : 10;
      const stepCoins = activeChallenge.type === 'SPELLING' ? 5 : 2;
      setHuntEarnedXP(prev => prev + stepXP);
      setHuntEarnedCoins(prev => prev + stepCoins);
      setHuntScore(prev => prev + 100);
      
      setHuntFeedback(`🎯 完美命中！[${activeChallenge.word.text}] 被你精准削弱打击！XP +${stepXP} 🪙 +${stepCoins}`);
      
      confetti({
        particleCount: 25,
        spread: 35,
        colors: ['#3b82f6', '#10b981', '#f59e0b']
      });
      
      setTimeout(() => {
        setHuntAnimation('NONE');
        setHuntFeedback(null);
        
        const nextIndex = huntCurrentIndex + 1;
        if (nextIndex >= huntChallenges.length) {
          finishHuntSession(true);
        } else {
          setHuntCurrentIndex(nextIndex);
          const nextChallenge = huntChallenges[nextIndex];
          speakWord(nextChallenge.word.text);
          if (nextChallenge.type === 'SPELLING') {
            const letters = initSpellingLetters(nextChallenge.word.text);
            setHuntScrambledLetters(letters);
            setHuntSelectedLetterIndices([]);
            setHuntSpellingInput('');
          }
        }
      }, 1500);
      
    } else {
      audio.playError();
      setHuntAnimation('ERROR');
      
      const newLives = huntLives - 1;
      setHuntLives(newLives);
      
      setHuntFeedback(`⚠️ 击空！心魔发起噬魂反震！${activeChallenge.type === 'SPELLING' ? `拼写应为: ${activeChallenge.correctAnswer.toLowerCase()}` : `真译是: ${activeChallenge.correctAnswer}`}`);
      
      if (newLives <= 0) {
        setTimeout(() => {
          finishHuntSession(false);
        }, 1800);
      } else {
        setTimeout(() => {
          setHuntAnimation('NONE');
          setHuntFeedback(null);
          
          const nextIndex = huntCurrentIndex + 1;
          if (nextIndex >= huntChallenges.length) {
            finishHuntSession(true);
          } else {
            setHuntCurrentIndex(nextIndex);
            const nextChallenge = huntChallenges[nextIndex];
            speakWord(nextChallenge.word.text);
            if (nextChallenge.type === 'SPELLING') {
              const letters = initSpellingLetters(nextChallenge.word.text);
              setHuntScrambledLetters(letters);
              setHuntSelectedLetterIndices([]);
              setHuntSpellingInput('');
            }
          }
        }, 2100);
      }
    }
  };

  const finishHuntSession = (isVictory: boolean) => {
    const selectedWordsList = huntChallenges.map(c => c.word.text);
    const uniqueSelectedWords = Array.from(new Set(selectedWordsList));

    if (isVictory) {
      audio.playSuccess();
      confetti({
        particleCount: 150,
        spread: 85,
        origin: { y: 0.6 }
      });
      
      // Promote all unique playing words to purified spirits
      uniqueSelectedWords.forEach(wordText => {
        const item = errorList.find(i => i.text === wordText);
        if (item) promoteToSpirit(item);
      });
      
      const bonusXP = 40;
      const bonusCoins = 15;
      const finalXP = huntEarnedXP + bonusXP;
      const finalCoins = huntEarnedCoins + bonusCoins;
      onReward(finalXP, finalCoins);
      
      setClearedBountyTexts(prev => [...prev, ...uniqueSelectedWords]);
      
      setTimeout(() => {
        loadData();
      }, 500);
    } else {
      if (huntEarnedXP > 0 || huntEarnedCoins > 0) {
        onReward(huntEarnedXP, huntEarnedCoins);
      }
      setTimeout(() => {
        loadData();
      }, 500);
    }
    setHuntFeedback(isVictory ? 'VICTORY_SCREEN' : 'DEFEAT_SCREEN');
  };

  const toggleSelectCard = (wordText: string) => {
    audio.playClick();
    setSelectedBountyTexts(prev => {
      if (prev.includes(wordText)) {
        return prev.filter(t => t !== wordText);
      } else {
        return [...prev, wordText];
      }
    });
  };

  const startBountyBattle = (item: IncorrectVocabularyItem) => {
    setActiveBountyWanted(item);
    setBountyStatus('IDLE');
    setBountyFeedback(null);
    setBountyTimer(10);
    setBountyHP(3);
    speakWord(item.text);

    const distractors = ['炽天使羽翼', '流光重甲', '寒金战盔', '太古圣物', '虚空迷宫', '元素圣坛', '破旧木剑', '神秘药水', '剧毒之物', '幽冥禁地'];
    const filteredDistractors = distractors
      .filter(d => d !== item.translation)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    setBountyOptions([...filteredDistractors, item.translation].sort(() => Math.random() - 0.5));
    audio.playClick();
  };

  // Timer ticker for Bounty Battle
  useEffect(() => {
    let ticker: any = null;
    if (activeBountyWanted && bountyStatus === 'IDLE' && bountyHP > 0) {
      ticker = setInterval(() => {
        setBountyTimer(prev => {
          if (prev <= 1) {
            handleBountyTimeout();
            return 10;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => ticker && clearInterval(ticker);
  }, [activeBountyWanted, bountyStatus, bountyHP]);

  const handleBountyTimeout = () => {
    audio.playError();
    setBountyStatus('TIMEOUT');
    setBountyFeedback('⏰ 倒计时归零！魔物狂化反扑，对你造成1点猛烈伤害！');
    setIsBountyBoardShaking(true);
    setTimeout(() => setIsBountyBoardShaking(false), 500);

    setBountyHP(h => {
      const nextH = h - 1;
      if (nextH <= 0) {
        setTimeout(() => setActiveBountyWanted(null), 2500);
      }
      return nextH;
    });

    setTimeout(() => {
      if (bountyHP > 1) {
        setBountyStatus('IDLE');
        setBountyFeedback(null);
        setBountyTimer(10);
      }
    }, 2000);
  };

  const attemptCaptureBounty = (option: string) => {
    if (bountyStatus !== 'IDLE') return;

    const isCorrect = option === activeBountyWanted?.translation;
    if (isCorrect && activeBountyWanted) {
      audio.playSuccess();
      setLastSlashedText(true);
      setTimeout(() => setLastSlashedText(false), 800);
      
      setBountyStatus('SUCCESS');
      setBountyFeedback('👊 一剑击飞魔魂！在重度破防通缉令上盖下圣印中！💫');
      
      // Update persistent session stamps
      setClearedBountyTexts(prev => [...prev, activeBountyWanted.text]);
      promoteToSpirit(activeBountyWanted);

      onReward(25, 10);
      confetti({
        particleCount: 30,
        spread: 40,
        origin: { y: 0.6 }
      });
      
      setTimeout(() => {
        setActiveBountyWanted(null);
        loadData();
      }, 2300);

    } else if (activeBountyWanted) {
      audio.playError();
      setIsBountyBoardShaking(true);
      setTimeout(() => setIsBountyBoardShaking(false), 500);
      
      setBountyStatus('ERROR');
      setBountyFeedback(`⚠️ 剑锋落空！正确含义应为: ${activeBountyWanted.translation}！气血受创！`);

      setBountyHP(h => {
        const nextH = h - 1;
        if (nextH <= 0) {
          setTimeout(() => {
            setActiveBountyWanted(null);
            loadData();
          }, 2500);
        }
        return nextH;
      });

      setTimeout(() => {
        if (bountyHP > 1) {
          setBountyStatus('IDLE');
          setBountyFeedback(null);
          setBountyTimer(10);
        }
      }, 2300);
    }
  };


  // =============================================================
  // 🕹️ GAMEPLAY MODE C: 【圣殿·净化魂魄】（3D卡牌翻转）
  // =============================================================
  const [activeFlippedSpirits, setActiveFlippedSpirits] = useState<string[]>([]);
  // Store intermediate text verification option logic inside the flipped cards
  const [interactiveSpiritChallenge, setInteractiveSpiritChallenge] = useState<{
    spiritText: string;
    options: string[];
    feedback: string | null;
    success: boolean | null;
  } | null>(null);

  const toggleSpiritCardFlip = (spirit: PurifiedSpiritItem) => {
    const isCurrentlyFlipped = activeFlippedSpirits.includes(spirit.text);
    audio.playPop();

    if (isCurrentlyFlipped) {
      // Flip back to face-down monochromatic state
      setActiveFlippedSpirits(prev => prev.filter(t => t !== spirit.text));
      if (interactiveSpiritChallenge?.spiritText === spirit.text) {
        setInteractiveSpiritChallenge(null);
      }
    } else {
      // Flip forward to colourful glowing spirit state!
      setActiveFlippedSpirits(prev => [...prev, spirit.text]);
      
      // Trigger voice read aloud
      speakWord(spirit.text);

      // Create interactive micro multiple-choice check right inside the card frame!
      const distractPool = ['古树', '巨剑', '火把', '王冠', '精灵', '恶魔', '冰晶', '奥术', '魔法', '守护', '治愈', '雷霆'];
      const incorrectChoices = distractPool
        .filter(d => d !== spirit.translation)
        .sort(() => Math.random() - 0.5)
        .slice(0, 2);
      const options = [...incorrectChoices, spirit.translation].sort(() => Math.random() - 0.5);

      setInteractiveSpiritChallenge({
        spiritText: spirit.text,
        options,
        feedback: null,
        success: null,
      });
    }
  };

  const handleReviewAllDue = () => {
    const dueList = purifiedSpirits.filter(s => s.nextReviewAt <= Date.now() || calculateRetention(s) <= 50);
    if (dueList.length === 0) {
      audio.playError();
      return;
    }
    const dueTexts = dueList.map(s => s.text);
    setActiveFlippedSpirits(prev => {
      const merged = [...new Set([...prev, ...dueTexts])];
      return merged;
    });
    audio.playSuccess();
    
    // Focus challenge on the first due card
    const first = dueList[0];
    const distractPool = ['古树', '巨剑', '火把', '王冠', '精灵', '恶魔', '冰晶', '奥术', '魔法', '守护', '治愈', '雷霆'];
    const incorrectChoices = distractPool
      .filter(d => d !== first.translation)
      .sort(() => Math.random() - 0.5)
      .slice(0, 2);
    const options = [...incorrectChoices, first.translation].sort(() => Math.random() - 0.5);

    setInteractiveSpiritChallenge({
      spiritText: first.text,
      options,
      feedback: null,
      success: null,
    });
    speakWord(first.text);
  };

  const handleSpiritVerification = (spirit: PurifiedSpiritItem, selectedOpt: string) => {
    if (!interactiveSpiritChallenge || interactiveSpiritChallenge.feedback !== null) return;

    const isCorrect = selectedOpt === spirit.translation;
    if (isCorrect) {
      audio.playSuccess();
      const nextStage = Math.min(5, spirit.stage + 1);
      reviewPurifiedSpirit(spirit.text, true);

      let feedbackString = `🌿 净化神鸣！防线晋升至 Stage ${nextStage}！`;
      if (nextStage === 5 && spirit.stage < 5) {
        feedbackString = '👑 圆满永恒！金身大成暴增经验！ XP+50';
        onReward(50, 20);
        confetti({ particleCount: 50, spread: 65, origin: { y: 0.7 } });
      } else {
        onReward(15, 5);
      }

      setInteractiveSpiritChallenge(prev => prev ? {
        ...prev,
        feedback: feedbackString,
        success: true
      } : null);

      setTimeout(() => {
        setInteractiveSpiritChallenge(null);
        loadData();
      }, 2000);

    } else {
      audio.playError();
      reviewPurifiedSpirit(spirit.text, false);
      
      setInteractiveSpiritChallenge(prev => prev ? {
        ...prev,
        feedback: '💔 魂魄受阻！阶段跌落至 Stage 1，重新温养。',
        success: false
      } : null);

      setTimeout(() => {
        setInteractiveSpiritChallenge(null);
        loadData();
      }, 2000);
    }
  };

  return (
    <div id="oracledashboard_root" className="fixed inset-0 z-50 bg-[#070913] backdrop-blur-3xl flex flex-col items-center justify-start p-3 sm:p-5 overflow-y-auto text-slate-100 select-none scrollbar-none">
      
      {/* Active Buff status header banner */}
      {activeEnchantBuff && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-4xl bg-gradient-to-r from-amber-500/10 via-yellow-500/15 to-orange-500/10 border-2 border-yellow-500/40 rounded-2xl p-3 mb-3 text-center flex items-center justify-center gap-3 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-yellow-400/5 animate-pulse" />
          <span className="text-lg">⚡</span>
          <p className="text-xs font-black text-amber-300">
            锻炎附魔狂热中: 【{activeEnchantBuff.itemName}】临时获得全队增幅 (力量 +{activeEnchantBuff.strengthBoost}, 敏捷 +{activeEnchantBuff.agilityBoost})！
          </p>
          <div className="bg-amber-550/20 text-yellow-400 border border-yellow-500 text-[10px] font-black px-2 py-0.5 rounded-lg">
            持续2场战役中
          </div>
        </motion.div>
      )}

      {/* 1. MAIN MENU & HEADER SECTION (Only visible when active overlays are false) */}
      {!isEnchantingActive && !activeBountyWanted && (
        <div id="main_dashboard_body" className="w-full max-w-4xl mx-auto flex flex-col space-y-4 pt-2 pb-16">
          
          {/* Brand Premium Banner */}
          <div className="bg-gradient-to-r from-[#0a0a16] via-[#10142c] to-[#0c0a15] border-2 border-slate-800 p-5 sm:p-6 rounded-[34px] sm:rounded-[42px] relative overflow-hidden shadow-2xl flex flex-col md:flex-row items-center gap-6">
            
            {/* Close cross */}
            <button 
              id="btn_close_oracle"
              onClick={onClose}
              className="absolute top-4 right-4 p-2 sm:p-3 bg-slate-900/40 hover:bg-slate-850 border border-slate-800/80 hover:border-indigo-500 rounded-2xl transition-all cursor-pointer z-20 outline-none"
            >
              <X size={16} className="text-slate-400 hover:text-white" />
            </button>

            {/* Radiant decorative blurred circle */}
            <div className="absolute top-0 right-0 w-80 h-40 bg-indigo-600/10 rounded-full blur-[80px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-60 h-30 bg-purple-600/10 rounded-full blur-[60px] pointer-events-none" />

            {/* User Profile Avatar Graphics */}
            <div className="relative flex-shrink-0 animate-bounce-gentle mt-2">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-[28px] bg-slate-950 border-2 border-purple-500/80 overflow-hidden shadow-2xl flex items-center justify-center p-1 relative">
                <img 
                  src={activeHero.avatarUri} 
                  alt="activeHero" 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain filter drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]"
                />
                <div className="absolute bottom-1 right-1 bg-purple-600 text-[9px] font-black px-1.5 py-0.5 rounded border border-purple-400 select-none">
                  LV {activeHero.level}
                </div>
              </div>
              <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-gradient-to-br from-indigo-505 to-purple-600 flex items-center justify-center text-xs shadow-md border border-indigo-400 animate-pulse">
                🔮
              </div>
            </div>

            {/* Brand details */}
            <div className="text-center md:text-left flex-1 space-y-2">
              <div className="inline-flex items-center px-3 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full text-[9px] font-extrabold uppercase tracking-widest leading-none">
                🧠 LEXICAL HERO RPG FORGING LEDGER
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-100 via-indigo-150 to-purple-300 leading-tight">
                词魂神炼馆 · 遗忘圣殿
              </h1>
              <p className="text-xs sm:text-[12.5px] text-slate-405 max-w-xl font-medium leading-relaxed">
                这里将错词拟态化作为心魔怪灵。点击上方导航，进入铁匠铺为你的狮子头盔或大剑进行<strong>“附魔强化”</strong>，或者前往<strong>“败将通缉墙”</strong>讨伐心魔，亦或在<strong>“圣殿”</strong>中净化翻转卡牌！
              </p>

              {/* Grid counter */}
              <div className="grid grid-cols-3 gap-2.5 sm:gap-3.5 pt-2 max-w-lg">
                <div className="bg-slate-950/70 border border-slate-800/80 p-2 rounded-2xl text-center">
                  <p className="text-[9px] text-slate-500 font-extrabold uppercase mb-0.5">捕获心魔</p>
                  <p className="text-xl font-black text-rose-450">{errorList.length} <span className="text-[10px] text-slate-500">怪</span></p>
                </div>
                <div className="bg-slate-950/70 border border-slate-800/80 p-2 rounded-2xl text-center">
                  <p className="text-[9px] text-slate-500 font-extrabold uppercase mb-0.5">自修词魄</p>
                  <p className="text-xl font-black text-indigo-405">{purifiedSpirits.length} <span className="text-[10px] text-slate-500">魄</span></p>
                </div>
                <div className="bg-slate-950/70 border border-slate-800/80 p-2 rounded-2xl text-center">
                  <p className="text-[9px] text-slate-500 font-extrabold uppercase mb-0.5">记忆神识健康</p>
                  <p className="text-xl font-black text-emerald-400">{metrics.memoryHealthPercentage}%</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sub Navigation Selectors */}
          <div className="flex bg-slate-950/80 p-1.5 border border-slate-850 rounded-[24px] max-w-3xl mx-auto w-full overflow-x-auto select-none scrollbar-none gap-1 shadow-lg">
            <button
              onClick={() => { audio.playClick(); setActiveTab('PEDIA'); }}
              className={`flex-1 py-3 px-1.5 text-center text-xs font-black rounded-xl transition-all min-w-[100px] shrink-0 inline-flex items-center justify-center space-x-1.5 cursor-pointer outline-none ${
                activeTab === 'PEDIA' ? 'bg-gradient-to-r from-violet-600 to-indigo-650 text-white shadow font-extrabold' : 'text-slate-405 hover:text-slate-200'
              }`}
            >
              <Skull size={14} className={activeTab === 'PEDIA' ? 'text-indigo-200 animate-pulse' : 'text-slate-500'} />
              <span>怪兽天牢</span>
            </button>

            <button
              onClick={() => { audio.playClick(); setActiveTab('ENCHANT'); }}
              className={`flex-1 py-3 px-1.5 text-center text-xs font-black rounded-xl transition-all min-w-[100px] shrink-0 inline-flex items-center justify-center space-x-1.5 cursor-pointer outline-none ${
                activeTab === 'ENCHANT' ? 'bg-gradient-to-r from-violet-600 to-indigo-650 text-white shadow font-extrabold' : 'text-slate-405 hover:text-slate-200'
              }`}
            >
              <Flame size={14} className={activeTab === 'ENCHANT' ? 'text-amber-400 animate-pulse' : 'text-slate-500'} />
              <span>铁匠铺·附魔</span>
            </button>

            <button
              onClick={() => { audio.playClick(); setActiveTab('WANTED'); }}
              className={`flex-1 py-3 px-1.5 text-center text-xs font-black rounded-xl transition-all min-w-[100px] shrink-0 inline-flex items-center justify-center space-x-1.5 cursor-pointer outline-none ${
                activeTab === 'WANTED' ? 'bg-gradient-to-r from-violet-600 to-indigo-650 text-white shadow font-extrabold' : 'text-slate-405 hover:text-slate-200'
              }`}
            >
              <Swords size={14} className={activeTab === 'WANTED' ? 'text-red-400 animate-spin-slow' : 'text-slate-500'} />
              <span>败将通缉令</span>
            </button>

            <button
              onClick={() => { audio.playClick(); setActiveTab('SANCTUM'); }}
              className={`flex-1 py-3 px-1.5 text-center text-xs font-black rounded-xl transition-all min-w-[100px] shrink-0 inline-flex items-center justify-center space-x-1.5 cursor-pointer outline-none ${
                activeTab === 'SANCTUM' ? 'bg-gradient-to-r from-violet-600 to-indigo-650 text-white shadow font-extrabold' : 'text-slate-405 hover:text-slate-200'
              }`}
            >
              <Award size={14} className={activeTab === 'SANCTUM' ? 'text-yellow-405 animate-pulse' : 'text-slate-500'} />
              <span>圣殿·净化魂魄</span>
            </button>
          </div>

          <div className="pt-2">
            {/* ----------------------------------------------------------- */}
            {/* TAB 1: 怪兽天牢 (Overview list of all mistakes) */}
            {/* ----------------------------------------------------------- */}
            {activeTab === 'PEDIA' && (
              <div className="space-y-4 text-left">
                <div className="pb-2 border-b border-slate-850">
                  <h3 className="text-lg font-black text-rose-350 flex items-center gap-2">
                    <Skull size={18} /> 识心密锁 · 浮游心魔牢笼
                  </h3>
                  <p className="text-xs text-slate-400">
                    此天牢羁押着近期冒险途中阻挠你的错词邪灵。你可通过点击“直接度化”对其进行斩邪温养并护送至圣殿。
                  </p>
                </div>

                {errorList.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {errorList.map((item) => {
                      const mInfo = getMonsterClass(item.errorCount);
                      return (
                        <div 
                          key={item.text}
                          style={{ backgroundColor: mInfo.glowBg }}
                          className={`bg-slate-950/40 p-4 rounded-2xl border-2 flex flex-col justify-between transition-all hover:scale-[1.01] ${mInfo.borderColor}`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex gap-3">
                              <span className="text-4xl select-none shrink-0">{mInfo.emoji}</span>
                              <div className="space-y-1">
                                <h4 className="text-lg font-extrabold text-white font-mono uppercase tracking-wide">
                                  {item.text}
                                </h4>
                                <p className="text-xs font-bold text-slate-405">中译: {item.translation}</p>
                                <span className={`inline-block px-1.5 py-0.5 border text-[8px] font-black rounded-md ${mInfo.badgeColor}`}>
                                  {mInfo.name}
                                </span>
                              </div>
                            </div>

                            <div className="text-right">
                              <span className="text-[10px] text-rose-450 font-black tracking-wider uppercase bg-rose-950/40 border border-rose-900/60 px-2 py-0.5 rounded-md">
                                犯错 x{item.errorCount} 次
                              </span>
                              <p className="text-[9px] text-slate-500 font-mono mt-1">最后露面: {new Date(item.lastErrorAt).toLocaleDateString()}</p>
                            </div>
                          </div>

                          <p className="my-3 text-slate-400 text-xs leading-relaxed font-semibold italic">
                            {mInfo.desc}
                          </p>

                          <div className="flex items-center gap-2 border-t border-slate-900 pt-3">
                            <button
                              onClick={() => { speakWord(item.text); audio.playClick(); }}
                              className="px-3 py-1.5 bg-slate-900 rounded-lg hover:bg-slate-850 border border-slate-800 text-slate-350 text-xs font-black inline-flex items-center gap-1 cursor-pointer transition-all shadow-inner outline-none"
                            >
                              <Volume2 size={12} /> 听其真发音
                            </button>
                            <button
                              onClick={() => handleManualPurify(item)}
                              className="flex-1 py-1.5 bg-gradient-to-r from-teal-505 to-emerald-600 hover:from-teal-400 hover:to-emerald-505 text-white rounded-lg font-extrabold text-xs inline-flex items-center justify-center gap-1 cursor-pointer shadow-md shadow-emerald-900/30 outline-none"
                            >
                              🍀 彻底超拔度化 (XP+10)
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-16 text-center space-y-4 bg-slate-950/40 border border-dashed border-slate-850 rounded-[35px] max-w-lg mx-auto p-4">
                    <span className="text-5xl block animate-bounce">🛡️</span>
                    <h4 className="text-md font-black text-emerald-400">天牢彻底清空！</h4>
                    <p className="text-slate-400 text-xs font-semibold leading-relaxed">
                      你完美降服了所有心魔。继续去主线关卡历练吧，如果有任何出错的字词，这里将会再次重铸封印印记！
                    </p>
                  </div>
                )}
              </div>
            )}


            {/* ----------------------------------------------------------- */}
            {/* TAB 2: 铁匠铺·装备附魔 */}
            {/* ----------------------------------------------------------- */}
            {activeTab === 'ENCHANT' && (
              <div className="space-y-4 text-left">
                <div className="pb-2 border-b border-indigo-900/60 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-black text-indigo-350 flex items-center gap-2">
                      <Sparkle size={18} className="text-amber-400" /> 狮心附魔烈火铁匠铺
                    </h3>
                    <p className="text-xs text-slate-400">
                      选择一件你的当前装备（或大剑），注入 5 个古老错词。全部融合正确后，装备耀目升级，获得为期2场战役的<strong>力量+5, 敏捷+3属性加成</strong>！
                    </p>
                  </div>
                  <div className="px-3 py-1.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-yellow-450 text-[10px] font-black uppercase tracking-wider animate-pulse">
                    🔥 属性灌注增益激活中!
                  </div>
                </div>

                {enchantSuccessAlert && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-[#121228] border-2 border-amber-550/60 rounded-[28px] p-5 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <h4 className="text-md font-black text-white flex items-center gap-2">
                        <Star size={16} className="text-yellow-400 fill-yellow-400 animate-spin-slow" />
                        【{enchantSuccessAlert.itemName}】临时极品完美附魔激活！
                      </h4>
                      <p className="text-xs text-slate-400 font-semibold">
                        在后续 2 场战斗里狂暴触发：<strong>力量 +5，敏捷 +3！</strong>。相关的所有温养词灵已护送封印入圣殿自修。
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 w-full md:w-auto">
                      <div className="bg-emerald-500/10 text-emerald-400 border border-emerald-950 px-3 py-1.5 rounded-xl text-xs font-black">
                        +{enchantSuccessAlert.xpEarned} XP
                      </div>
                      <div className="bg-amber-500/10 text-yellow-500 border border-amber-950 px-3 py-1.5 rounded-xl text-xs font-black">
                        +{enchantSuccessAlert.coinsEarned} 🪙
                      </div>
                      <button 
                        onClick={() => setEnchantSuccessAlert(null)}
                        className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-900 cursor-pointer"
                      >
                        <X size={15} />
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Forging gear card board grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-1">
                  {playerForgeableItems.map((item) => {
                    const itemSvgUri = getShopItemSvgUri(item.name);
                    return (
                      <div
                        key={item.id}
                        className="bg-slate-950/40 rounded-[28px] border-2 border-slate-850 p-5 flex flex-col justify-between hover:border-indigo-500 hover:bg-slate-950/70 transition-all shadow-lg"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 rounded-2xl bg-[#0f0e21] border border-indigo-950 flex items-center justify-center p-2 shrink-0 relative overflow-hidden">
                            {itemSvgUri ? (
                              <img 
                                src={itemSvgUri} 
                                alt={item.name} 
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-contain filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]"
                              />
                            ) : (
                              <span className="text-3xl">⚔️</span>
                            )}
                            <div className="absolute top-0.5 left-0.5 font-mono text-[7px] tracking-wide font-black px-1.5 bg-blue-950/80 text-blue-450 rounded uppercase leading-none scale-90">
                              {item.requiredSlot === 'RIGHT_HAND' ? '武器' : '防具'}
                            </div>
                          </div>

                          <div>
                            <h4 className="text-md sm:text-lg font-black text-white">{item.name}</h4>
                            <span className="text-[10px] text-yellow-550 font-extrabold uppercase tracking-widest leading-none">
                              🌟 神铸装备槽
                            </span>
                          </div>
                        </div>

                        <p className="text-xs text-slate-400 font-medium leading-relaxed my-4 min-h-[44px]">
                          {item.desc}
                        </p>

                        <button
                          onClick={() => startEnchantmentProcess(item.name)}
                          className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-450 hover:to-indigo-550 text-[#070913] hover:text-white font-black text-xs rounded-xl shadow border-b-[3px] border-indigo-900 cursor-pointer transition-all outline-none"
                        >
                          ⚒️ 选择该装备发起词印附魔
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}


            {/* ----------------------------------------------------------- */}
            {/* TAB 3: 败将通缉令 (Wanted Wall) */}
            {/* ----------------------------------------------------------- */}
            {activeTab === 'WANTED' && (
              <div className="space-y-4 text-left">
                <div className="pb-2 border-b border-slate-850">
                  <h3 className="text-lg font-black text-yellow-500 flex items-center gap-2">
                    <Swords size={18} /> 赏金围守 · 败将英魄通缉墙
                  </h3>
                  <p className="text-xs text-slate-400">
                    这里是贴满心魔逃犯的赏金通缉墙。每次讨伐开启，单词将化身凶神小魔向你进行10秒狂击倒数！若能看破它的正确中译，即可将其<strong>一剑斩飞(Cleared)</strong>！
                  </p>
                </div>

                {errorList.length > 0 ? (
                  /* Custom dark medieval bounty wooden board styling */
                  <div 
                    className="p-6 bg-gradient-to-br from-[#20150d] via-[#2f1f13] to-[#150d08] border-8 border-[#3c2514] shadow-2xl rounded-3xl min-h-[450px]"
                    style={{ boxShadow: 'inset 0 0 35px rgba(0,0,0,0.95), 0 10px 25px rgba(0,0,0,0.6)' }}
                  >
                    {/* Header Controls for Multi-Select and Group Hunt */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 pb-4 border-b-2 border-dashed border-[#54341c]">
                      <div>
                        <span className="font-serif text-[#a88265] tracking-widest font-black text-sm uppercase block">⚔️ BOUNTY BOARD OF DESPAIR ⚔️</span>
                        <span className="text-[11px] text-[#866854] font-serif mt-1 block">
                          点击卡牌可选中/取消。选中心魔心腹，发起缉拿大作战，将其全部捉拿净化！
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        <button
                          onClick={() => {
                            audio.playClick();
                            setSelectedBountyTexts(errorList.map(item => item.text));
                          }}
                          className="px-3 py-1.5 bg-[#4a2e16] hover:bg-[#623c1d] text-amber-250 border border-[#8a5732] text-[11px] font-black rounded-lg cursor-pointer transition-all active:scale-95"
                        >
                          📜 全选心魔
                        </button>
                        <button
                          onClick={() => {
                            audio.playPop();
                            setSelectedBountyTexts([]);
                          }}
                          className="px-3 py-1.5 bg-[#1b1008] hover:bg-[#2c1c11] text-stone-400 border border-[#3e2819] text-[11px] font-black rounded-lg cursor-pointer transition-all active:scale-95"
                        >
                          ❌ 清空选择
                        </button>
                        
                        <button
                          onClick={() => startHuntForWords(errorList.filter(item => selectedBountyTexts.includes(item.text)))}
                          disabled={selectedBountyTexts.length === 0}
                          className="px-4 py-1.5 bg-gradient-to-r from-red-600 via-amber-500 to-yellow-500 hover:brightness-110 disabled:opacity-40 disabled:pointer-events-none text-slate-950 font-black text-xs rounded-xl shadow-lg border border-yellow-300 animate-pulse active:scale-95 transition-all cursor-pointer"
                        >
                          ⚔️ 开启缉拿消灭战 ({selectedBountyTexts.length} 词)
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-5">
                      {errorList.map((item, idx) => {
                        const mInfo = getMonsterClass(item.errorCount);
                        const isClearedInSession = clearedBountyTexts.includes(item.text);
                        const isSelected = selectedBountyTexts.includes(item.text);

                        return (
                          <div
                            key={item.text}
                            onClick={() => !isClearedInSession && toggleSelectCard(item.text)}
                            className={`rounded-2xl border-2 p-4 text-center flex flex-col justify-between relative overflow-hidden shadow-xl min-h-[250px] transform hover:scale-102 transition-all cursor-[#54341c] ${
                              isSelected 
                                ? 'border-[#e4a853] shadow-[0_0_15px_rgba(245,158,11,0.45)] ring-2 ring-amber-500/20' 
                                : 'border-dashed border-[#8c7457] hover:border-[#b09678]'
                            } ${isClearedInSession ? 'opacity-65' : ''}`}
                            style={{ 
                              backgroundImage: isSelected
                                ? 'linear-gradient(150deg, #f5eacf 0%, #dfcbab 100%)'
                                : 'linear-gradient(150deg, #ecdfcb 0%, #d8cbb5 100%)',
                              boxShadow: isSelected
                                ? 'inset 0 0 20px rgba(245,158,11,0.1), 4px 8px 18px rgba(0,0,0,0.3)'
                                : 'inset 0 0 15px rgba(0,0,0,0.05), 3px 6px 15px rgba(0,0,0,0.3)',
                              transform: `rotate(${idx % 2 === 0 ? '-1.5deg' : '1.5deg'})`
                            }}
                          >
                            {/* Wax Seal / Medieval Selector */}
                            {!isClearedInSession && (
                              <div className="absolute top-2.5 right-2 text-right">
                                <div
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleSelectCard(item.text);
                                  }}
                                  className={`w-5.5 h-5.5 rounded-full flex items-center justify-center cursor-pointer border transition-all ${
                                    isSelected
                                      ? 'bg-amber-600 border-amber-300 text-white shadow-[0_0_8px_rgba(245,158,11,0.6)] scale-110'
                                      : 'bg-[#614931]/20 border-[#786146]/45 text-transparent hover:border-amber-600 hover:bg-[#614931]/30'
                                  }`}
                                >
                                  <Check size={11} className="stroke-[4]" />
                                </div>
                              </div>
                            )}

                            <div className="border border-[#786146]/20 bg-[#614931]/10 py-0.5 text-[#593d25] font-serif text-[9px] font-black tracking-widest select-none leading-none pr-8 text-left pl-2">
                              ⚔️ WANTED ⚔️
                            </div>

                            <div className="my-5 flex flex-col items-center space-y-2">
                              {/* Monster symbol */}
                              <div className="w-14 h-14 rounded-xl bg-[#0a0a09]/10 border-2 border-[#80674c] flex items-center justify-center text-4xl shadow-inner relative select-none">
                                {mInfo.emoji}
                              </div>
                              
                              <div className="space-y-0.5">
                                <h4 className="text-lg font-extrabold font-mono text-[#4a2e16] tracking-wide uppercase">
                                  {item.text}
                                </h4>
                                <p className="text-[10px] text-[#70563e] font-black">罪障致错震频: {item.errorCount}层</p>
                              </div>
                            </div>

                            <div className="bg-[#503720] border border-[#3e2815] p-1 px-3 rounded-xl max-w-[140px] mx-auto text-center flex items-center justify-center gap-1.5 select-none leading-none">
                              <span className="text-[9px] text-[#c2aba0] font-bold">捕获红利:</span>
                              <span className="text-amber-300 font-extrabold text-xs">🪙 {item.errorCount * 15}</span>
                            </div>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                startHuntForWords([item]);
                              }}
                              disabled={isClearedInSession}
                              className={`w-full mt-3 py-2 bg-gradient-to-r from-[#85532c] to-[#54341c] hover:from-[#9c6338] hover:to-[#6c4426] text-amber-100 rounded-xl font-black text-xs cursor-pointer shadow border-b-[3px] border-[#3a200d] ${
                                isClearedInSession ? 'opacity-40 pointer-events-none' : ''
                              }`}
                            >
                              ⚔️ 发起对决讨伐
                            </button>

                            {/* Retro dual-border distress Red Cleared/Captured Stamp */}
                            {isClearedInSession && (
                              <div 
                                className="absolute inset-x-0 top-[28%] mx-auto w-32 h-14 border-4 border-double border-red-650 rounded-xl flex items-center justify-center font-black text-red-650 bg-[#e08e8e]/20 select-none tracking-widest text-md uppercase active:scale-105"
                                style={{ transform: 'rotate(-25deg)', textShadow: '1px 1px 0px rgba(0,0,0,0.1)' }}
                              >
                                已捉拿!
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="py-16 text-center space-y-4 bg-slate-950/40 border border-dashed border-slate-850 rounded-[35px] max-w-lg mx-auto p-4">
                    <span className="text-5xl block animate-bounce">📜</span>
                    <h4 className="text-md font-black text-yellow-505">通缉告示板空了！</h4>
                    <p className="text-slate-400 text-xs font-semibold leading-relaxed">
                      证明周围十里词能怪兽已被清剿一空。极智无双！去主线卡牌探险积累新的词汇挑战吧！
                    </p>
                  </div>
                )}
              </div>
            )}


            {/* ----------------------------------------------------------- */}
            {/* TAB 4: 圣殿·净化魂魄 (3D Card fip) */}
            {/* ----------------------------------------------------------- */}
            {activeTab === 'SANCTUM' && (
              <div className="space-y-4 text-left">
                <div className="pb-2 border-b border-purple-900/40 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className="text-lg font-black text-purple-350 flex items-center gap-2">
                      <Star size={18} className="text-purple-400" /> 遗忘倒流 · 艾宾浩斯记忆圣殿
                    </h3>
                    <p className="text-xs text-slate-400">
                      已被降伏和解救的词灵魂魄集结在圣殿底层自修。
                      <strong>错词以反面的黑白卡牌排列</strong>。点击卡牌进行3D立体翻转。若为超危险词（错误x4以上），将唤醒其真实法音！拼对释义便能释放七彩色流，推进魂魄至永恒黄金神格。
                    </p>
                  </div>

                  {metrics.dueReviewsCount > 0 && (
                    <button 
                      onClick={handleReviewAllDue}
                      className="py-2.5 px-4 bg-gradient-to-r from-purple-550 to-indigo-650 hover:from-purple-450 hover:to-indigo-550 text-white rounded-xl font-black text-xs inline-flex items-center justify-center gap-1 cursor-pointer transition-all shadow-lg"
                    >
                      ⚡ 极速召唤临界词灵 ({metrics.dueReviewsCount})
                    </button>
                  )}
                </div>

                {purifiedSpirits.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-3">
                    {purifiedSpirits.map((spirit) => {
                      const retentionValue = calculateRetention(spirit);
                      const isDue = spirit.nextReviewAt <= Date.now() || retentionValue <= 50;
                      const stageInfo = getSpiritStageDisplay(spirit.stage);
                      const isMaxStage = spirit.stage === 5;
                      const isSuperStubborn = spirit.lapsesCount >= 4 || isDue;
                      
                      // Identify whether is currently Y-axis 3D flipped
                      const isCurrentlyFlipped = activeFlippedSpirits.includes(spirit.text);
                      const isCurrentlySelectedInChallenge = interactiveSpiritChallenge?.spiritText === spirit.text;

                      return (
                        <div 
                          key={spirit.text}
                          className="w-full h-64 [perspective:1000px] cursor-pointer"
                        >
                          {/* Inner 3D layout container */}
                          <div 
                            onClick={() => !isCurrentlyFlipped && toggleSpiritCardFlip(spirit)}
                            className={`relative w-full h-full transition-transform duration-700 [transform-style:preserve-3d] ${
                              isCurrentlyFlipped ? '[transform:rotateY(180deg)]' : ''
                            }`}
                          >
                            
                            {/* ---------------- CARD FACE A: REVERSE FACE (Monochromatic Sealed Dark Stone Card) ---------------- */}
                            <div className="absolute inset-0 [backface-visibility:hidden] bg-[#0c0d12]/95 border-2 border-stone-880 rounded-2xl p-4 flex flex-col justify-between shadow-2xl overflow-hidden">
                              {/* Chain decorative locks overlays */}
                              <div className="absolute top-1 right-2 flex items-center gap-1">
                                <span className="bg-[#1a1c22] text-xs px-2 py-0.5 rounded-md text-stone-550 font-mono font-black border border-stone-800 leading-none">
                                  SEALED
                                </span>
                              </div>

                              <div className="flex-1 flex flex-col items-center justify-center space-y-3 mt-4 text-center">
                                {/* Large gray stone emblem */}
                                <div className="w-14 h-14 rounded-full bg-stone-900 border border-stone-800 flex items-center justify-center text-4xl shadow-inner relative filter grayscale opacity-60">
                                  🗿
                                </div>
                                
                                <div className="space-y-1">
                                  <h4 className="text-xl font-bold font-mono tracking-widest text-[#8c8d93] uppercase leading-none">
                                    {spirit.text}
                                  </h4>
                                  <p className="text-[10px] text-stone-500 font-extrabold uppercase">
                                    [ 点击法阵 · 立体翻转 ]
                                  </p>
                                </div>
                              </div>

                              <div className="border-t border-stone-900 pt-2 flex items-center justify-between text-[9px] text-stone-505 font-bold">
                                <span>密封契合度: {stageInfo.lockEmoji}</span>
                                <span className="text-yellow-600 font-extrabold">点击以超拔</span>
                              </div>
                            </div>

                            {/* ---------------- CARD FACE B: OBSERVE FACE (Brilliant Purified Neon Spirit Card) ---------------- */}
                            <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] bg-gradient-to-br from-[#0e1026] via-[#120d2c] to-[#070514] border-2 border-purple-500 rounded-2xl p-4 flex flex-col justify-between shadow-lg overflow-hidden relative">
                              {/* Shiny sparkles animation effect inside neon card */}
                              <div className="absolute inset-0 bg-gradient-to-t from-purple-500/5 to-transparent pointer-events-none" />
                              
                              <div className="flex items-center justify-between pb-2 border-b border-white/5 text-[9px] font-black">
                                <span className="bg-purple-950/60 border border-purple-500 text-purple-300 px-1.5 py-0.5 rounded-lg">
                                  {stageInfo.icon} Stage {spirit.stage} · {stageInfo.name}
                                </span>

                                <button 
                                  onClick={(e) => { e.stopPropagation(); toggleSpiritCardFlip(spirit); }}
                                  className="text-slate-500 hover:text-white p-0.5 rounded-lg hover:bg-slate-900 outline-none"
                                >
                                  <X size={10} />
                                </button>
                              </div>

                              {/* Interactive Spell selection right inside the card! */}
                              <div className="my-2 flex-1 flex flex-col justify-center text-left space-y-1">
                                <div className="flex items-baseline gap-2">
                                  <h4 className="text-lg font-black font-mono text-white tracking-wide uppercase leading-none">
                                    {spirit.text}
                                  </h4>
                                  {isSuperStubborn && (
                                    <span className="text-[8px] font-black tracking-widest px-1 py-0.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded animate-pulse">
                                      ⚠️ 顽固词
                                    </span>
                                  )}
                                </div>

                                <p className="text-[10.5px] text-slate-400 font-bold">真理释义: {spirit.translation}</p>
                                
                                <div className="space-y-1 pt-1">
                                  <div className="flex items-center justify-between text-[8px] text-slate-550 uppercase font-black">
                                    <span>自修稳固势能</span>
                                    <span className="text-purple-400">{retentionValue}%</span>
                                  </div>
                                  <div className="w-full bg-slate-950 h-1.5 border border-slate-900 rounded-full overflow-hidden">
                                    <div 
                                      className="h-full rounded-full bg-gradient-to-r from-purple-550 to-pink-500 transition-all"
                                      style={{ width: `${retentionValue}%` }}
                                    />
                                  </div>
                                </div>

                                {/* Multi-choice subchallenge */}
                                {isCurrentlySelectedInChallenge && interactiveSpiritChallenge && (
                                  <div className="pt-2">
                                    {interactiveSpiritChallenge.feedback ? (
                                      <p className={`text-[9.5px] font-black text-center p-1 rounded border ${
                                        interactiveSpiritChallenge.success ? 'text-emerald-400 bg-emerald-950/20 border-emerald-900' : 'text-rose-450 bg-rose-950/20 border-rose-950'
                                      }`}>
                                        {interactiveSpiritChallenge.feedback}
                                      </p>
                                    ) : (
                                      <div className="flex flex-col gap-1">
                                        <p className="text-[8.5px] text-[#868da3] font-bold">请点击与之应答的中译唤醒自修：</p>
                                        <div className="grid grid-cols-3 gap-1">
                                          {interactiveSpiritChallenge.options.map(option => (
                                            <button
                                              key={option}
                                              onClick={(e) => { e.stopPropagation(); handleSpiritVerification(spirit, option); }}
                                              className="py-1 bg-slate-900 hover:bg-purple-900 text-[9px] font-extrabold text-slate-300 rounded border border-purple-950/80 transition-all cursor-pointer text-center outline-none"
                                            >
                                              {option}
                                            </button>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>

                              <div className="border-t border-slate-900 pt-1.5 flex items-center justify-between text-[9px]">
                                <button 
                                  onClick={(e) => { e.stopPropagation(); speakWord(spirit.text); audio.playClick(); }}
                                  className="py-1 px-2.5 bg-slate-950 hover:bg-slate-900 rounded-lg text-slate-400 hover:text-white border border-slate-900 inline-flex items-center gap-0.5 cursor-pointer outline-none"
                                >
                                  <Volume2 size={9} /> 真实原音
                                </button>

                                <button 
                                  onClick={(e) => { e.stopPropagation(); handleManualRelease(spirit.text); }}
                                  title="驱解羁绊"
                                  className="p-1 hover:bg-rose-950/25 text-slate-600 hover:text-rose-400 rounded-lg outline-none"
                                >
                                  <Trash2 size={10} />
                                </button>
                              </div>

                            </div>

                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-16 text-center space-y-4 bg-slate-950/40 border border-dashed border-slate-850 rounded-[35px] max-w-lg mx-auto p-4">
                    <span className="text-5xl block animate-bounce">🔮</span>
                    <h4 className="text-md font-black text-purple-400">目前暂无度化仙灵</h4>
                    <p className="text-slate-400 text-xs font-semibold leading-relaxed">
                      你在“怪兽天牢”中手动超度消灭的心魔怪物，或者在通缉挑战胜利后，极智灵魄才会作为不灭星能转移至圣殿自修！
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>
      )}


      {/* ============================================================= */}
      {/* 2. OVERLAY FULLSCREEN ENCHANT PANEL (黑色高能附魔强化熔炉) */}
      {/* ============================================================= */}
      <AnimatePresence>
        {isEnchantingActive && selectedEnchantJob && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-md mx-auto my-auto bg-gradient-to-b from-slate-950 via-[#0a0a19] to-slate-900 rounded-[36px] border-4 border-indigo-550 shadow-2xl overflow-hidden flex flex-col p-6 min-h-[580px] justify-between text-center relative z-50 animate-jelly scrollbar-none"
          >
            {/* Close cross */}
            <button 
              onClick={exitEnchantmentGame}
              className="absolute top-4 right-4 p-2 bg-slate-900/60 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500 rounded-xl transition-all cursor-pointer z-30 outline-none"
            >
              <X size={15} />
            </button>

            {/* Runes tick progress container */}
            <div className="flex items-center justify-between pb-3 border-b border-indigo-900/40 text-xs font-black">
              <span className="bg-[#0e0e22] text-indigo-400 border border-indigo-950 px-3 py-1 rounded-xl">
                🔨 附魔融词熔炉 · 第 {enchantIndex + 1} / 5 个字符
              </span>
              
              {/* Magic runic spots */}
              <div className="flex items-center space-x-1.5 select-none">
                {['ᛋ', 'ᚺ', 'ᛏ', 'ᚱ', 'ᛗ'].map((runeChar, i) => (
                  <div 
                    key={i} 
                    title={`附魔第 ${i + 1} 个神符`}
                    className={`w-6 h-6 rounded-full border flex items-center justify-center font-mono text-[10px] font-black transition-all duration-300 ${
                      i < enchantCorrectCount 
                        ? 'bg-amber-450 border-amber-300 text-slate-950 shadow-[0_0_10px_rgba(245,158,11,0.9)] scale-110' 
                        : 'bg-slate-950 border-slate-850 text-slate-650'
                    }`} 
                  >
                    {runeChar}
                  </div>
                ))}
              </div>
            </div>

            {/* Forge layout graphics */}
            <div className="flex-1 flex flex-col justify-around py-5 space-y-4">
              
              {/* Weapon artwork enclosed inside a spinning star compass */}
              <div className="relative w-40 h-40 sm:w-44 sm:h-44 mx-auto flex items-center justify-center">
                <div className="absolute inset-0 border border-indigo-505/10 rounded-full animate-spin-slow pointer-events-none" />
                <div className="absolute inset-2 border-2 border-dashed border-indigo-505/5 rounded-full animate-rotate-slow-reverse pointer-events-none" />
                
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-indigo-950/20 flex items-center justify-center relative p-3 backdrop-blur z-10">
                  <img 
                    src={getShopItemSvgUri(selectedEnchantJob)} 
                    alt={selectedEnchantJob} 
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain filter drop-shadow-[0_0_15px_rgba(245,158,11,0.85)] animate-bounce-slow" 
                  />
                </div>

                {enchantFeedbackType === 'SUCCESS' && (
                  <div className="absolute inset-0 bg-amber-500/10 rounded-full animate-ping pointer-events-none" />
                )}
              </div>

              {/* Central text prompt */}
              <div className="space-y-1">
                <div className="flex items-center justify-center gap-2">
                  <button 
                    onClick={() => speakWord(enchantPool[enchantIndex].text)}
                    className="p-1 px-3 bg-indigo-650 hover:bg-indigo-555 rounded-xl text-xs font-black inline-flex items-center gap-0.5 cursor-pointer text-white animate-pulse shadow-md outline-none"
                  >
                    <Volume2 size={13} /> {enchantPool[enchantIndex].text}
                  </button>
                </div>
                <h3 className="text-3xl sm:text-4xl font-black font-mono text-white tracking-widest uppercase mt-1">
                  {enchantPool[enchantIndex].text}
                </h3>
                <p className="text-[11px] text-[#818cb4] font-semibold">
                  选择与之契合的远古中译释义，凝聚魔灵附体：
                </p>
              </div>
            </div>

            {/* Status alerts */}
            <div className="h-10 flex items-center justify-center mb-1 select-none">
              <AnimatePresence mode="wait">
                {enchantFeedback && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className={`text-xs font-black ${
                      enchantFeedbackType === 'SUCCESS' ? 'text-emerald-400' : 'text-rose-450'
                    }`}
                  >
                    {enchantFeedback}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Interactive Rune Selection Button Grid */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              {enchantOptions.map((opt) => (
                <button
                  key={opt}
                  onClick={() => handleEnchantAnswer(opt)}
                  disabled={enchantFeedback !== null}
                  className="py-3 px-3 bg-slate-950 hover:bg-slate-900 border-2 border-slate-850 hover:border-indigo-500 rounded-xl text-xs font-black text-slate-300 active:translate-y-0.5 disabled:opacity-50 cursor-pointer shadow transition-all duration-150 outline-none"
                >
                  {opt}
                </button>
              ))}
            </div>

          </motion.div>
        )}
      </AnimatePresence>


      {/* ============================================================= */}
      {/* 3. OVERLAY BATTLE PLAY BOARD - BOUNTY WANTED败将通缉令 */}
      {/* ============================================================= */}
      <AnimatePresence>
        {activeBountyWanted && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`fixed inset-0 z-55 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 ${
              isBountyBoardShaking ? 'animate-shake' : ''
            }`}
          >
            <div 
              className="bg-[#241a12] rounded-[36px] w-full max-w-sm border-4 border-[#85532c] p-6 text-center shadow-2xl flex flex-col justify-between min-h-[500px] relative scrollbar-none"
              style={{
                backgroundImage: 'radial-gradient(circle at center, #3c2919 0%, #150e09 100%)'
              }}
            >
              {/* Close battle button */}
              <button 
                onClick={() => setActiveBountyWanted(null)}
                className="absolute top-4 right-4 p-2 bg-[#1a120b] border border-[#3e2819] hover:border-red-500 text-slate-400 hover:text-white rounded-xl cursor-pointer outline-none"
              >
                <X size={15} />
              </button>

              {/* Status score ticker */}
              <div className="flex items-center justify-between font-serif border-b border-[#473020] pb-3 text-xs">
                {/* Heart containers HP */}
                <div className="flex items-center space-x-1 font-sans">
                  {[...Array(3)].map((_, i) => (
                    <Heart 
                      key={i} 
                      size={14} 
                      className={`transition-all ${
                        i < bountyHP ? 'text-red-500 fill-red-500 filter drop-shadow-[0_0_4px_#ef4444]' : 'text-stone-700'
                      }`} 
                    />
                  ))}
                </div>

                <div className="text-[#85654d] font-black tracking-widest uppercase text-[10px]">
                  ⚔️ 征讨决战 · 速记狂击
                </div>

                {/* Fuse ticking down */}
                <div className={`font-mono font-extrabold ${bountyTimer <= 3 ? 'text-red-400 animate-pulse' : 'text-amber-500'}`}>
                  {bountyTimer}s
                </div>
              </div>

              {/* Progress visual bar */}
              <div className="w-full bg-black/50 h-1.5 rounded-full overflow-hidden mt-3">
                <div 
                  className={`h-full transition-all duration-1000 bg-gradient-to-r ${(bountyTimer <= 3) ? 'from-red-650 to-red-500 animate-pulse' : 'from-amber-500 to-amber-300'}`}
                  style={{ width: `${(bountyTimer / 10) * 100}%` }}
                />
              </div>

              {/* Arena graphics container */}
              <div className="flex-1 flex flex-col justify-around py-5 space-y-4">
                
                {/* Combat portrait arena */}
                <div className="relative w-36 h-36 mx-auto bg-black/40 border-2 border-[#503522] rounded-3xl flex items-center justify-center text-6xl shadow-inner overflow-hidden group">
                  <span className="transform group-hover:scale-105 transition-transform">
                    {getMonsterClass(activeBountyWanted.errorCount).emoji}
                  </span>

                  {/* Sword Strike line overlay slash */}
                  <AnimatePresence>
                    {lastSlashedText && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.5, rotate: -25 }}
                        animate={{ opacity: 1, scale: 1.2, rotate: 15 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-red-600/20 z-10 flex items-center justify-center font-black"
                      >
                        <span className="text-5xl animate-pulse">💥⚔️</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-center gap-1.5">
                    <button 
                      onClick={() => speakWord(activeBountyWanted.text)}
                      className="p-1 px-3.5 bg-[#150e09] hover:bg-black/50 border border-[#4e321e] rounded-lg text-amber-300 text-xs font-black inline-flex items-center gap-1 cursor-pointer transition-all outline-none"
                    >
                      <Volume2 size={13} /> {activeBountyWanted.text}
                    </button>
                  </div>
                  <p className="font-serif text-[11px] text-[#866854] pt-1">
                    心魔已经发起神魂冲击！在倒计时耗尽前刺中下方真译神格：
                  </p>
                </div>
              </div>

              {/* Combat feedback */}
              <div className="h-12 flex items-center justify-center mb-1 font-serif text-xs px-2 text-rose-350">
                {bountyFeedback}
              </div>

              {/* Runic translation choice tags */}
              <div className="grid grid-cols-2 gap-2.5 pt-1">
                {bountyOptions.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => attemptCaptureBounty(opt)}
                    disabled={bountyStatus !== 'IDLE'}
                    className="py-3 px-2 bg-black hover:bg-[#1a0f07] border border-[#523219] hover:border-[#a855f7] rounded-xl text-xs font-black text-amber-100 cursor-pointer disabled:opacity-45 transition-all outline-none"
                  >
                    {opt}
                  </button>
                ))}
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>


      {/* ============================================================= */}
      {/* 4. OVERLAY MASS GAME BOARD - 逃犯缉拿大作战 (Group Bounty Hunt) */}
      {/* ============================================================= */}
      <AnimatePresence>
        {huntGameActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-55 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
          >
            <div 
              className={`bg-[#20150d] rounded-[36px] w-full max-w-lg border-4 border-[#85532c] p-6 text-center shadow-2xl flex flex-col justify-between min-h-[550px] relative transition-transform ${
                huntAnimation === 'ERROR' ? 'animate-shake' : ''
              }`}
              style={{
                backgroundImage: 'radial-gradient(circle at center, #352214 0%, #110905 100%)',
                boxShadow: '0 20px 50px rgba(0,0,0,0.8), inset 0 0 40px rgba(0,0,0,0.8)'
              }}
            >
              {/* Close Button only if not in animations or end screen */}
              {huntFeedback !== 'VICTORY_SCREEN' && huntFeedback !== 'DEFEAT_SCREEN' && (
                <button 
                  onClick={() => {
                    audio.playPop();
                    setHuntGameActive(false);
                  }}
                  className="absolute top-4 right-4 p-2 bg-[#1a120b] border border-[#3e2819] hover:border-red-500 text-slate-400 hover:text-white rounded-xl cursor-pointer transition-all outline-none"
                  title="撤军离场"
                >
                  <X size={15} />
                </button>
              )}

              {/* GAMEPLAY ACTIVE PLAY VIEW */}
              {huntFeedback !== 'VICTORY_SCREEN' && huntFeedback !== 'DEFEAT_SCREEN' && huntChallenges.length > 0 && (
                (() => {
                  const activeChallenge = huntChallenges[huntCurrentIndex];
                  if (!activeChallenge) return null;
                  
                  return (
                    <div className="flex-1 flex flex-col justify-between h-full pt-2">
                      {/* Game Header Stats Dashboard */}
                      <div>
                        <div className="flex items-center justify-between font-serif border-b border-[#473020] pb-3 text-xs">
                          {/* Heart representation */}
                          <div className="flex items-center space-x-1.5 bg-black/20 px-2 py-1 rounded-lg">
                            {[...Array(3)].map((_, i) => (
                              <Heart 
                                key={i} 
                                size={14} 
                                className={`transition-all ${
                                  i < huntLives 
                                    ? 'text-red-500 fill-red-500 filter drop-shadow-[0_0_5px_#f43f5e]' 
                                    : 'text-stone-700 stroke-[1.5]'
                                }`} 
                              />
                            ))}
                          </div>

                          <div className="text-yellow-501 font-black tracking-widest uppercase text-[10.5px]">
                            ⚔️ 逃犯缉拿消灭战 ⚔️
                          </div>

                          <div className="font-mono text-amber-200 text-[11px] font-black bg-amber-900/20 px-2 py-1 rounded-lg border border-amber-800/30">
                            进度: {huntCurrentIndex + 1} / {huntChallenges.length}
                          </div>
                        </div>

                        {/* Progress visual energy bar */}
                        <div className="w-full bg-black/50 h-1.5 rounded-full overflow-hidden mt-3">
                          <div 
                            className="h-full bg-gradient-to-r from-yellow-600 via-amber-500 to-amber-300 transition-all duration-300"
                            style={{ width: `${((huntCurrentIndex) / huntChallenges.length) * 100}%` }}
                          />
                        </div>
                      </div>

                      {/* Interactive Battle Arena Graphic */}
                      <div className="my-6 space-y-4">
                        {/* Combat Portrait Frame */}
                        <div className="relative w-32 h-32 mx-auto bg-gradient-to-br from-stone-900 to-black border-4 border-[#503522] rounded-3xl flex items-center justify-center text-6xl shadow-2xl overflow-hidden group">
                          {/* Monster Avatar */}
                          <span className={`transform transition-transform ${huntAnimation === 'NONE' ? 'group-hover:scale-105' : ''}`}>
                            {getMonsterClass(activeChallenge.word.errorCount).emoji}
                          </span>

                          {/* Dynamic Action Animations Overlay */}
                          
                          {/* 1. CAPTURE EFFECT (看词选义捉拿特效) */}
                          <AnimatePresence>
                            {huntAnimation === 'SLASH' && (
                              <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-amber-500/10 z-25 flex flex-col items-center justify-center pointer-events-none"
                              >
                                {/* Glowing capturing golden chains/bars */}
                                <motion.div 
                                  initial={{ width: '0%', height: '4px', rotate: -45, top: '20%', left: '10%' }}
                                  animate={{ width: '130%', height: '6px' }}
                                  transition={{ duration: 0.25, ease: "easeOut" }}
                                  className="absolute bg-gradient-to-r from-amber-500 via-yellow-250 to-amber-300 shadow-[0_0_15px_#f59e0b] rounded"
                                />
                                <motion.div 
                                  initial={{ width: '0%', height: '4px', rotate: 45, top: '20%', right: '10%' }}
                                  animate={{ width: '130%', height: '6px' }}
                                  transition={{ delay: 0.1, duration: 0.25, ease: "easeOut" }}
                                  className="absolute bg-gradient-to-r from-amber-500 via-white to-yellow-250 shadow-[0_0_15px_#fbbf24] rounded"
                                />
                                <motion.span 
                                  initial={{ scale: 0 }}
                                  animate={{ scale: [0, 1.4, 1] }}
                                  className="text-3xl font-extrabold text-amber-400 animate-bounce tracking-widest z-30"
                                  style={{ textShadow: '2px 2px 0px #000' }}
                                >
                                  🔒 捉拿归案!
                                </motion.span>
                              </motion.div>
                            )}
                          </AnimatePresence>

                          {/* 2. CAPTURE EFFECT (拼写缚神网捉拿特效) */}
                          <AnimatePresence>
                            {huntAnimation === 'CAPTURE' && (
                              <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-emerald-950/20 z-25 flex flex-col items-center justify-center pointer-events-none"
                              >
                                {/* Grid network net line draws */}
                                <motion.div 
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1.1 }}
                                  transition={{ type: 'spring', damping: 10 }}
                                  className="absolute inset-2 border-2 border-dashed border-emerald-400 rounded-2xl animate-spin-slow shadow-[inset_0_0_15px_#10b981]"
                                />
                                <motion.div 
                                  initial={{ scale: 0, rotate: -15 }}
                                  animate={{ scale: 1, rotate: -15 }}
                                  className="z-30 px-2.5 py-1.5 border-4 border-double border-emerald-400 text-emerald-300 font-serif font-black bg-stone-900 rounded-xl text-center flex flex-col items-center leading-none"
                                >
                                  <span className="text-[9px] uppercase tracking-widest text-[#5eead4]">CAPTURED</span>
                                  <span className="text-sm mt-0.5">🔒 捕获归案!</span>
                                </motion.div>
                              </motion.div>
                            )}
                          </AnimatePresence>

                          {/* 3. SHAKE & BLOOD VIGNETTE (失败反之震荡) */}
                          {huntAnimation === 'ERROR' && (
                            <div className="absolute inset-0 bg-rose-950/40 border-2 border-red-500 p-2 flex items-center justify-center z-25 pointer-events-none animate-pulse">
                              <span className="text-4xl">🔱</span>
                            </div>
                          )}
                        </div>

                        {/* Title Clue Area */}
                        <div className="space-y-1 mt-3">
                          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-black/40 border border-[#503522] rounded-2xl">
                            {activeChallenge.type === 'EN_TO_ZH' && (
                              <>
                                <span className="text-[10px] bg-amber-500/10 text-amber-300 border border-amber-500/20 px-2 py-0.5 rounded-lg font-bold">
                                  看英文选中文
                                </span>
                                <h4 className="text-lg font-serif font-black text-amber-100 tracking-wide select-text">
                                  {activeChallenge.prompt}
                                </h4>
                              </>
                            )}

                            {activeChallenge.type === 'ZH_TO_EN' && (
                              <>
                                <span className="text-[10px] bg-purple-500/10 text-purple-300 border border-purple-500/20 px-2 py-0.5 rounded-lg font-bold">
                                  看中文选英文
                                </span>
                                <h4 className="text-xs font-serif font-medium text-amber-100 select-text">
                                  {activeChallenge.prompt}
                                </h4>
                              </>
                            )}

                            {activeChallenge.type === 'SPELLING' && (
                              <>
                                <span className="text-[10px] bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2 py-0.5 rounded-lg font-bold">
                                  拼写大作战
                                </span>
                                <h4 className="text-xs font-serif font-medium text-[#c084fc] select-text">
                                  [ {activeChallenge.prompt} ]
                                </h4>
                              </>
                            )}

                            <button 
                              onClick={() => speakWord(activeChallenge.word.text)}
                              className="p-1 hover:bg-black/50 rounded text-amber-300 transition-all outline-none"
                              title="发音朗读"
                            >
                              <Volume2 size={13} />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Score accumulation logs preview */}
                      <div className="h-10 flex items-center justify-center my-1 font-serif text-xs px-2 text-stone-300">
                        {huntFeedback ? (
                          <div className="text-[#a78bfa] font-black tracking-wide animate-pulse">
                            {huntFeedback}
                          </div>
                        ) : (
                          <p className="text-[10px] text-stone-500 font-serif">
                            提示：{activeChallenge.type === 'SPELLING' ? '根据中译，在下方拼出英文单词。' : '看上方词汇，点选下方对应的正确卡牌破防。'}
                          </p>
                        )}
                      </div>

                      {/* ANSWERS PORT - MULTI CHOICE VS SPELLING */}
                      <div className="mt-2 min-h-[140px]">
                        {/* 1. Multi choices */}
                        {activeChallenge.type !== 'SPELLING' && (
                          <div className="grid grid-cols-2 gap-3 pb-2">
                            {activeChallenge.options.map((option) => (
                              <button
                                key={option}
                                onClick={() => handleHuntAnswer(option)}
                                disabled={huntAnimation !== 'NONE'}
                                className={`py-3.5 px-3 bg-black/60 hover:bg-[#1a0f07] border border-[#523219] hover:border-amber-500 rounded-2xl text-xs font-extrabold text-amber-100 cursor-pointer disabled:opacity-45 transition-all outline-none text-center ${
                                  huntAnimation !== 'NONE' ? 'pointer-events-none' : ''
                                }`}
                              >
                                {option}
                              </button>
                            ))}
                          </div>
                        )}

                        {/* 2. Interactive Spelling board */}
                        {activeChallenge.type === 'SPELLING' && (
                          <div className="space-y-4">
                            {/* Blanks/Tiles represent current spelt string */}
                            <div className="flex flex-wrap gap-1.5 justify-center my-3">
                              {activeChallenge.correctAnswer.split('').map((char, index) => {
                                const charInput = huntSpellingInput[index] || '';
                                return (
                                  <div
                                    key={index}
                                    className={`w-9 h-9 rounded-lg border-2 flex items-center justify-center font-black text-sm lowercase ${
                                      charInput 
                                        ? 'bg-[#1b1008] text-amber-300 border-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.3)]' 
                                        : 'bg-black/30 text-stone-500 border-stone-800 animate-pulse'
                                    }`}
                                  >
                                    {charInput}
                                  </div>
                                );
                              })}
                            </div>

                            {/* Letter select grid (Interactive touch keyboard scrambler) */}
                            <div className="bg-black/30 p-3 rounded-2xl border border-[#4e321e]/60 space-y-3">
                              {/* Selection row */}
                              <div className="flex flex-wrap gap-1.5 justify-center">
                                {huntScrambledLetters.map((letter, idx) => {
                                  const isSelected = huntSelectedLetterIndices.includes(idx);
                                  return (
                                    <button
                                      key={idx}
                                      disabled={isSelected || huntAnimation !== 'NONE'}
                                      onClick={() => {
                                        audio.playPop();
                                        setHuntSpellingInput(prev => prev + letter);
                                        setHuntSelectedLetterIndices(prev => [...prev, idx]);
                                      }}
                                      className={`w-8 h-8 rounded-lg font-black text-xs flex items-center justify-center border cursor-pointer transition-all ${
                                        isSelected
                                          ? 'bg-stone-900 border-stone-950 text-stone-700 pointer-events-none opacity-20'
                                          : 'bg-[#402917] hover:bg-[#5a3a21] border-[#7d502d] text-amber-100 hover:scale-105 active:scale-95'
                                      }`}
                                    >
                                      {letter}
                                    </button>
                                  );
                                })}
                              </div>

                              {/* Helper actions */}
                              <div className="flex items-center justify-between gap-2.5 pt-1">
                                <button
                                  onClick={() => {
                                    audio.playClick();
                                    setHuntSpellingInput('');
                                    setHuntSelectedLetterIndices([]);
                                  }}
                                  className="flex-1 py-1.5 bg-stone-900 hover:bg-stone-850 text-stone-400 border border-stone-800 rounded-lg text-[10px] font-bold cursor-pointer transition-all active:scale-95 outline-none"
                                >
                                  🧹 重置
                                </button>
                                <button
                                  onClick={() => {
                                    if (huntSpellingInput.length === 0) return;
                                    audio.playClick();
                                    // Undo last selected char
                                    const lastIdx = huntSelectedLetterIndices[huntSelectedLetterIndices.length - 1];
                                    setHuntSelectedLetterIndices(prev => prev.slice(0, -1));
                                    setHuntSpellingInput(prev => prev.slice(0, -1));
                                  }}
                                  disabled={huntSpellingInput.length === 0}
                                  className="flex-1 py-1.5 bg-[#5d3118] hover:bg-[#723d1f] text-amber-250 border border-[#834927] rounded-lg text-[10px] font-bold cursor-pointer transition-all disabled:opacity-45 active:scale-95 outline-none"
                                >
                                  ⬅️ 退格
                                </button>
                                <button
                                  onClick={() => handleHuntAnswer(huntSpellingInput)}
                                  disabled={huntSpellingInput.length === 0 || huntAnimation !== 'NONE'}
                                  className="flex-1 py-1.5 bg-gradient-to-r from-amber-550 to-orange-550 hover:brightness-110 text-stone-950 rounded-lg text-[10px] font-extrabold cursor-pointer transition-all shadow border border-amber-300 disabled:opacity-45 active:scale-95 outline-none"
                                >
                                  🔨 捉拿归案
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()
              )}

              {/* VICTORY OVERLAY SCREEN (大获全胜) */}
              {huntFeedback === 'VICTORY_SCREEN' && (
                <div className="flex-1 flex flex-col justify-center items-center py-6 space-y-6">
                  {/* Rotating radiant shield aura */}
                  <div className="relative w-24 h-24 bg-gradient-to-tr from-amber-500 to-yellow-400 rounded-full flex items-center justify-center border-4 border-yellow-250 shadow-[0_0_25px_rgba(245,158,11,0.5)] animate-bounce">
                    <Trophy size={48} className="text-slate-950 filter drop-shadow-[1px_2px_0px_#fff]" />
                    <Sparkles className="absolute -top-2 -right-2 text-yellow-300 animate-pulse" size={24} />
                  </div>

                  <div className="space-y-2">
                    <h2 className="font-serif text-2xl font-black text-yellow-501 tracking-widest uppercase">
                      大获全胜 · 精心清剿
                    </h2>
                    <p className="text-xs text-[#a08470] max-w-sm mx-auto font-serif leading-relaxed">
                      赏金猎人智算无双！成功将所选通缉心魔全数捉拿归案。功勋已经入档！
                    </p>
                  </div>

                  {/* Loot reward cards details */}
                  <div className="bg-black/35 rounded-2xl border-2 border-dashed border-[#573b24] p-4 w-full max-w-xs space-y-3 select-none">
                    <p className="text-[10px] text-stone-500 font-extrabold uppercase tracking-widest">领赏名录与奖赏</p>
                    
                    <div className="flex items-center justify-around font-bold py-1 border-b border-[#402a1a]/40">
                      <div className="flex items-center gap-1">
                        <span className="text-base text-yellow-405">🪙</span>
                        <span className="text-sm font-extrabold text-amber-200">+{huntEarnedCoins + 15} 金鹰金币</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-base">✨</span>
                        <span className="text-sm font-extrabold text-blue-300">+{huntEarnedXP + 40} 心力XP</span>
                      </div>
                    </div>
                    
                    <div className="text-[10px] text-stone-400 max-h-[100px] overflow-y-auto scrollbar-none space-y-1 text-left px-1">
                      <p className="font-semibold text-center text-[#90735e] mb-1.5 border-b border-stone-850 pb-0.5">净化心魔清单</p>
                      {Array.from(new Set(huntChallenges.map(c => c.word.text))).map((originalText) => {
                        const wordObj = errorList.find(e => e.text === originalText);
                        const strText = originalText as string;
                        return (
                          <div key={strText} className="flex justify-between items-center text-[11px] leading-tight text-amber-200/80">
                            <span>💀 {strText.toLowerCase()}</span>
                            <span className="text-[9.5px] text-[#866854] truncate max-w-[140px]" title={wordObj?.translation}>
                              {wordObj?.translation}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Finish action buttons */}
                  <button
                    onClick={() => {
                      audio.playReward();
                      setHuntGameActive(false);
                      setSelectedBountyTexts([]);
                    }}
                    className="w-full max-w-xs py-3.5 bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500 hover:brightness-110 border border-yellow-300 rounded-2xl font-black text-sm text-slate-950 cursor-pointer shadow-lg tracking-wider active:scale-95 transition-all outline-none"
                  >
                    🏛️ 凯旋复命
                  </button>
                </div>
              )}

              {/* DEFEAT OVERLAY SCREEN (负伤离场) */}
              {huntFeedback === 'DEFEAT_SCREEN' && (
                <div className="flex-1 flex flex-col justify-center items-center py-6 space-y-6">
                  {/* Cracked gravestone monument */}
                  <div className="relative w-24 h-24 bg-stone-900 border-4 border-stone-600 rounded-3xl flex items-center justify-center shadow-xl animate-shake">
                    <Skull size={44} className="text-stone-500" />
                    <span className="absolute text-xs font-black text-red-500 bg-black/9 hover:scale-105 rounded-md px-1.5 top-1 right-1">HP 0</span>
                  </div>

                  <div className="space-y-2">
                    <h2 className="font-serif text-2xl font-black text-rose-500 tracking-widest uppercase">
                      英勇负伤 · 捕获未竟
                    </h2>
                    <p className="text-xs text-stone-400 max-w-sm mx-auto font-serif leading-relaxed">
                      本次缉拿心魔过于凶猛，神魂震频过高。少侠护体气血耗尽！别气馁，重整攻势再来！
                    </p>
                  </div>

                  {/* Mini compensation details */}
                  <div className="bg-black/35 rounded-2xl border border-stone-800 p-4 w-full max-w-xs space-y-2 text-center text-xs text-stone-400">
                    <p className="text-[10px] text-stone-500 font-extrabold uppercase">英勇抚恤金</p>
                    <div className="flex items-center justify-center gap-3 font-semibold text-stone-200">
                      <span>🪙 +{huntEarnedCoins} 金币</span>
                      <span>✨ +{huntEarnedXP} XP</span>
                    </div>
                  </div>

                  {/* Actions buttons row */}
                  <div className="flex gap-3 w-full max-w-xs">
                    <button
                      onClick={() => {
                        audio.playClick();
                        startHuntForWords(errorList.filter(item => selectedBountyTexts.includes(item.text)));
                      }}
                      className="flex-1 py-3 bg-[#523219] hover:bg-[#6c4222] border border-[#7d502d] text-amber-200 rounded-xl font-black text-xs cursor-pointer transition-all active:scale-95 outline-none"
                    >
                      🛡️ 重整旗鼓
                    </button>
                    <button
                      onClick={() => {
                        audio.playPop();
                        setHuntGameActive(false);
                      }}
                      className="flex-1 py-3 bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-400 rounded-xl font-black text-xs cursor-pointer transition-all active:scale-95 outline-none"
                    >
                      🚪 暂退休息
                    </button>
                  </div>
                </div>
              )}

            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

