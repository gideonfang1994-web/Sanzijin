import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { WordGroup, WordItem, UserStats } from '../types';
import { ArrowLeft, Volume2, ShieldAlert, Sparkles, Smile, Trophy } from 'lucide-react';
import audio from '../utils/AudioUtils';
import confetti from 'canvas-confetti';
import { CHARACTERS } from '../constants';

interface WordHamsterWhackProps {
  groups: WordGroup[];
  stats: UserStats;
  onFinish: (score: number, coins: number) => void;
  onClose: () => void;
}

interface HamsterMole {
  id: number; // hole index (0 to 3)
  translation: string;
  isCorrect: boolean;
  isPopped: boolean;
  isHit: boolean;
  emoji: string;
}

export const WordHamsterWhack: React.FC<WordHamsterWhackProps> = ({ groups, stats, onFinish, onClose }) => {
  const allWords = useMemo(() => {
    let list: WordItem[] = [];
    groups.forEach(g => {
      g.words.forEach(w => list.push(w));
    });
    if (list.length === 0) {
      list = [
        { text: 'hamster', translation: '仓鼠', imageUrl: '' },
        { text: 'rabbit', translation: '兔子', imageUrl: '' },
        { text: 'panda', translation: '大熊猫', imageUrl: '' },
        { text: 'monkey', translation: '猴子', imageUrl: '' },
        { text: 'squirrel', translation: '松鼠', imageUrl: '' }
      ];
    }
    return [...list].sort(() => Math.random() - 0.5);
  }, [groups]);

  const [gameState, setGameState] = useState<'INTRO' | 'PLAYING' | 'WON' | 'LOST'>('INTRO');
  const [score, setScore] = useState(0);
  const [coinsEarned, setCoinsEarned] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  const [hearts, setHearts] = useState(5);
  const [targetWord, setTargetWord] = useState<WordItem | null>(null);

  // 4 Holes hamster state
  const [holes, setHoles] = useState<HamsterMole[]>([
    { id: 0, translation: '', isCorrect: false, isPopped: false, isHit: false, emoji: '🐹' },
    { id: 1, translation: '', isCorrect: false, isPopped: false, isHit: false, emoji: '🐹' },
    { id: 2, translation: '', isCorrect: false, isPopped: false, isHit: false, emoji: '🐹' },
    { id: 3, translation: '', isCorrect: false, isPopped: false, isHit: false, emoji: '🐹' }
  ]);

  const hero = useMemo(() => {
    return CHARACTERS.find(c => c.id === stats.selectedCharacterId) || CHARACTERS[0];
  }, [stats.selectedCharacterId]);

  useEffect(() => {
    try { audio.playBGM('HAMSTER'); } catch(e){}
    return () => {
      try { audio.stopBGM(); } catch(e){}
    };
  }, []);

  const wordPointer = useRef(0);
  const mainCycleTimer = useRef<NodeJS.Timeout | null>(null);

  const hamsterEmojis = ['🐹', '🐭', '🐿️', '🦫'];

  const startGame = () => {
    setGameState('PLAYING');
    setScore(0);
    setCoinsEarned(0);
    setXpEarned(0);
    setHearts(5);
    wordPointer.current = 0;
    audio.playPop();
    nextWhackTask();
  };

  const nextWhackTask = () => {
    if (allWords.length === 0) return;
    const target = allWords[wordPointer.current % allWords.length];
    wordPointer.current += 1;
    setTargetWord(target);

    // Setup holes with translation designations
    const wrongTranslations = allWords
      .filter(w => w.text !== target.text)
      .map(w => w.translation);
    const shuffledWrong = [...wrongTranslations].sort(() => Math.random() - 0.5).slice(0, 3);

    const pool = [
      { translation: target.translation, isCorrect: true },
      ...shuffledWrong.map(t => ({ translation: t, isCorrect: false }))
    ];

    // Shuffle pool among 4 holes
    const shuffledPool = pool.sort(() => Math.random() - 0.5);

    const configuredHoles = [0, 1, 2, 3].map(idx => {
      const data = shuffledPool[idx] || { translation: '???', isCorrect: false };
      return {
        id: idx,
        translation: data.translation,
        isCorrect: data.isCorrect,
        isPopped: false,
        isHit: false,
        emoji: hamsterEmojis[Math.floor(Math.random() * hamsterEmojis.length)]
      } as HamsterMole;
    });

    setHoles(configuredHoles);
    try { audio.speak(target.text); } catch (e) {}

    // Trigger sequential mole popping trigger mechanics
    triggerHamsterPops();
  };

  const triggerHamsterPops = () => {
    // Pop them up sequentially or all together based on speed
    setHoles(prev => prev.map(h => ({ ...h, isPopped: true })));
  };

  const whackHamster = (holeId: number) => {
    if (gameState !== 'PLAYING') return;
    const currentHole = holes.find(h => h.id === holeId);
    if (!currentHole || !currentHole.isPopped || currentHole.isHit) return;

    // Trigger visual hit hammer shock
    audio.playClick();
    setHoles(prev => prev.map(h => h.id === holeId ? { ...h, isHit: true } : h));

    if (currentHole.isCorrect) {
      // Correct Smack! 😂
      audio.playSuccess();
      setScore(s => s + 60);
      setCoinsEarned(c => c + 3);
      setXpEarned(x => x + 6);

      // Flash golden dust on winner
      setTimeout(() => {
        if (wordPointer.current >= 7) {
          setGameState('WON');
          audio.playCheer();
          try { confetti({ particleCount: 160, spread: 80, origin: { y: 0.6 } }); } catch (e) {}
        } else {
          nextWhackTask();
        }
      }, 800);
    } else {
      // Bad smack! Hit the cute innocent wrong translate mole
      audio.playError();
      setHearts(h => {
        const nextH = h - 1;
        if (nextH <= 0) setGameState('LOST');
        return nextH;
      });
      setScore(s => Math.max(0, s - 15));

      // Pop hit one down
      setTimeout(() => {
        setHoles(prev => prev.map(h => h.id === holeId ? { ...h, isPopped: false } : h));
      }, 400);
    }
  };

  const claimFinish = () => {
    audio.playClick();
    onFinish(score, coinsEarned);
  };

  return (
    <div className="w-full max-w-xl mx-auto rounded-[40px] border-4 border-amber-500 shadow-[0_32px_64px_-16px_rgba(245,158,11,0.15)] bg-gradient-to-b from-[#fef3c7] to-[#fde68a] text-[#78350f] overflow-hidden font-sans relative select-none">
      <h3 className="hidden">萌兽战甲锤击汉字记</h3>

      {/* Header Bar */}
      <div className="bg-[#78350f] p-4 flex items-center justify-between border-b border-[#92400e] text-white">
        <div className="flex items-center space-x-3">
          <button onClick={onClose} className="p-2 hover:bg-[#92400e] rounded-xl transition-all cursor-pointer">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h4 id="hamster-game-title" className="font-extrabold text-[#fef3c7] text-[18px] leading-tight flex items-center gap-1.5">
              <span>疯狂打地鼠</span>
              <span className="text-[10px] bg-amber-500/35 text-amber-200 font-extrabold px-1.5 py-0.5 rounded">Whack</span>
            </h4>
            <span className="text-[14px] text-amber-100 block font-bold mt-1">小松鼠爬出了脑袋！砸中装载着正确翻译汉字的松鼠牌子</span>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <div className="bg-[#92400e] px-2.5 py-1 rounded-xl font-bold flex items-center space-x-1 border border-amber-800">
            <span>🪙</span>
            <span className="text-yellow-300">+{coinsEarned}</span>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {gameState === 'INTRO' && (
          <motion.div 
            key="intro" 
            className="p-8 py-16 text-center space-y-6 bg-gradient-to-b from-[#fef3c7] to-[#fcd34d]"
          >
            <div className="text-6xl animate-bounce">🔨🐹</div>
            <div className="space-y-4">
              <h4 className="text-[28px] font-black text-amber-800 tracking-tight leading-snug">丛林仓鼠大乱斗：敲击金牌</h4>
              <p className="text-[18px] text-amber-950 font-extrabold leading-relaxed">
                小仓鼠们躲藏在深秋原野地洞。顶端将发布英文单词和视控。仓鼠探头时分别背着不同汉字。快速发现正确的词灵并【挥锤砸中它】，收获炫目星星！中错牌扣减铁锤耐久生命噢。
              </p>
            </div>

            <button 
              onClick={startGame}
              className="w-full max-w-xs bg-gradient-to-r from-amber-500 to-orange-500 hover:brightness-110 border-b-4 border-amber-700 py-4 rounded-[24px] text-white font-black text-[18px] transition-all cursor-pointer shadow-lg"
            >
              扛起充气锤 开敲 🔨
            </button>
          </motion.div>
        )}

        {gameState === 'PLAYING' && (
          <motion.div key="playing" className="flex flex-col relative bg-[#fffae6]">
            
            {/* HUD */}
            <div className="bg-[#451a03] px-4 py-3 flex items-center justify-between text-white text-[14px]">
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-[#fde68a] text-[15px]">铁锤气血:</span>
                <div className="flex space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-[15px]">
                      {i < hearts ? '🔨' : '❌'}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-[#78350f] px-2.5 py-1 rounded text-[12px] font-black uppercase text-amber-200">
                出击进度: {wordPointer.current - 1}/6 锤
              </div>
            </div>

            {/* MOUND FIELDS SCREEN (2x2 bending grids) */}
            <div className="w-full min-h-[340px] bg-gradient-to-b from-[#d97706] to-[#78350f] p-4 relative overflow-hidden flex flex-col justify-around rounded-b-lg">
              
              {/* Target Word banner floating above */}
              <div className="bg-white/95 border-2 border-amber-300 rounded-2xl p-2.5 max-w-xs mx-auto text-center flex items-center justify-center space-x-2.5 shadow-lg relative z-20">
                <CompassIcon />
                <div className="space-y-0.5">
                  <span className="text-[10px] font-black text-amber-600 block leading-none">TARGET ENG WORD</span>
                  <div className="flex items-center space-x-1.5 justify-center leading-none">
                    <span className="font-extrabold text-[22px] text-amber-950">{targetWord?.text}</span>
                    <button 
                      onClick={() => { if(targetWord) audio.speak(targetWord.text); }}
                      className="p-1 hover:bg-amber-100 rounded text-amber-600 cursor-pointer"
                    >
                      <Volume2 size={16} />
                    </button>
                  </div>
                </div>
              </div>

              {/* 2x2 Grid system */}
              <div className="grid grid-cols-2 gap-4 max-w-md mx-auto w-full pt-1.5">
                {holes.map(hole => (
                  <div 
                    key={hole.id}
                    className="relative aspect-[2/1] bg-[#451a03] border-t-4 border-[#351502] rounded-full flex flex-col items-center justify-end shadow-[inset_0_8px_16px_rgba(0,0,0,0.6)] group cursor-crosshair pb-1.5 h-[95px]"
                    onClick={() => whackHamster(hole.id)}
                  >
                    {/* Grassy dirt visual mound around the rim */}
                    <div className="absolute inset-x-2 bottom-[-2px] h-3 bg-gradient-to-t from-emerald-600 to-green-500 rounded-b-lg border-t-2 border-green-300 pointer-events-none z-15" />

                    {/* Popping Hamster */}
                    <AnimatePresence>
                      {hole.isPopped && (
                        <motion.div
                          initial={{ y: 32, opacity: 0 }}
                          animate={hole.isHit ? {
                            y: [0, 8, 2],
                            scale: [1, 0.85, 1],
                            rotate: [0, -10, 10, 0]
                          } : {
                            y: 0,
                            opacity: 1
                          }}
                          exit={{ y: 32, opacity: 0 }}
                          className="absolute bottom-1 w-full flex flex-col items-center z-10"
                        >
                          {/* Hamster Character Face */}
                          <div className="text-4xl select-none leading-none relative mb-0.5">
                            {hole.isHit ? (hole.isCorrect ? '😵💫✨' : '💥💨') : hole.emoji}
                          </div>

                          {/* Wooden translation sign name placard */}
                          <div className={`mt-0.5 p-1 px-3 border rounded-lg text-[18px] font-black text-center shadow-md select-none pointer-events-none whitespace-nowrap min-w-[75px] ${
                            hole.isHit 
                              ? (hole.isCorrect ? 'bg-amber-400 border-yellow-200 text-[#451a03]' : 'bg-rose-500 border-rose-300 text-white line-through opacity-70')
                              : 'bg-amber-100 border-amber-300 text-[#78350f] uppercase'
                          }`}>
                            {hole.translation}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>

            </div>

            {/* LOWER SPELL CONTROLLER COGNITION */}
            <div className="p-4 bg-[#fff9eb] border-t border-amber-100 text-center space-y-2.5">
              <span className="text-[14px] font-black uppercase tracking-wider text-amber-700 block">
                🔨 萌鼠抢字大冒险 🔨
              </span>
              <p className="text-[18px] text-slate-700 font-bold leading-normal max-w-sm mx-auto">
                仓鼠会带上干扰翻译。唯有砸中真正能表达「 <span className="font-extrabold text-[#78350f] underline">{targetWord?.text}</span> 」的那只，才能过关斩将！
              </p>
            </div>

          </motion.div>
        )}

        {gameState === 'WON' && (
          <motion.div 
            key="won" 
            className="p-8 py-14 text-center space-y-6 bg-gradient-to-b from-[#fef3c7] to-[#fde68a]"
          >
            <div className="w-16 h-16 bg-amber-500 text-white rounded-full flex items-center justify-center text-3xl mx-auto shadow-lg animate-bounce">
              👑
            </div>

            <div className="space-y-1">
              <h4 className="text-3xl font-black text-amber-700">秋获松果大天尊！</h4>
              <p className="text-xs text-amber-950 uppercase font-black leading-relaxed">
                你和森林小动物冰释前嫌！它们将堆成小山般的松塔金币送给你！
              </p>
            </div>

            <div className="bg-amber-100 border border-amber-200 rounded-3xl p-5 max-w-sm mx-auto space-y-3">
              <div className="flex items-center justify-around divide-x divide-amber-200 text-slate-800">
                <div className="text-center">
                  <span className="text-[9px] font-black text-amber-700 block mb-1 uppercase">狂锤得分</span>
                  <span className="text-xl font-black text-amber-900 tabular-nums">{score}</span>
                </div>
                <div className="text-center pl-4">
                  <span className="text-[9px] font-black text-amber-600 block mb-1 uppercase">赏赐金币</span>
                  <span className="text-xl font-black text-amber-500 tabular-nums">+{coinsEarned}</span>
                </div>
                <div className="text-center pl-4">
                  <span className="text-[9px] font-black text-pink-600 block mb-1 uppercase">锤地鼠XP</span>
                  <span className="text-xl font-black text-pink-700 tabular-nums">+{xpEarned} XP</span>
                </div>
              </div>
            </div>

            <button 
              onClick={claimFinish}
              className="w-full max-w-xs bg-amber-600 hover:bg-amber-500 border-b-4 border-amber-800 py-3.5 rounded-[24px] text-white font-black text-sm cursor-pointer transition-colors"
            >
              收拾锤子 鸣金收兵
            </button>
          </motion.div>
        )}

        {gameState === 'LOST' && (
          <motion.div 
            key="lost" 
            className="p-8 py-14 text-center space-y-6 bg-gradient-to-b from-[#fef3c7] to-[#fde68a]"
          >
            <div className="w-16 h-16 bg-rose-150 border border-rose-200 text-rose-500 rounded-full flex items-center justify-center text-3xl mx-auto animate-pulse">
              🔨
            </div>

            <div className="space-y-1 text-slate-800">
              <h4 className="text-2xl font-black text-rose-600">锤头裂开！出师未捷</h4>
              <p className="text-xs text-slate-500 font-extrabold uppercase leading-normal">
                敲错萌鼠多次使充气锤丧失了弹性。平复心情，认真识别后再挥下气锤吧！
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto pt-4">
              <button 
                onClick={startGame}
                className="bg-amber-600 hover:bg-amber-500 border-b-4 border-amber-800 py-3 rounded-2xl text-white font-black text-xs cursor-pointer"
              >
                点火再敲 (Retry)
              </button>
              <button 
                onClick={claimFinish}
                className="bg-slate-200 border border-slate-350 py-3 rounded-2xl text-slate-600 font-black text-xs cursor-pointer"
              >
                返回公野 (Leave)
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const CompassIcon = () => (
  <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center animate-spin-slow text-amber-600 shrink-0">
    🎯
  </div>
);

export default WordHamsterWhack;
