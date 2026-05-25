import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { WordGroup, WordItem, UserStats } from '../types';
import { ArrowLeft, Volume2, ShieldAlert, Sparkles, Smile, Trophy } from 'lucide-react';
import audio from '../utils/AudioUtils';
import confetti from 'canvas-confetti';
import { CHARACTERS } from '../constants';

interface DinoRockJumperProps {
  groups: WordGroup[];
  stats: UserStats;
  onFinish: (score: number, coins: number) => void;
  onClose: () => void;
}

interface JumperRock {
  id: string;
  translation: string;
  isCorrect: boolean;
  position: 'LEFT' | 'RIGHT'; // left side or right side rock
  color: string;
}

export const DinoRockJumper: React.FC<DinoRockJumperProps> = ({ groups, stats, onFinish, onClose }) => {
  const allWords = useMemo(() => {
    let list: WordItem[] = [];
    groups.forEach(g => {
      g.words.forEach(w => list.push(w));
    });
    if (list.length === 0) {
      list = [
        { text: 'jump', translation: '跳跃', imageUrl: '' },
        { text: 'stone', translation: '石头', imageUrl: '' },
        { text: 'green', translation: '绿色的', imageUrl: '' },
        { text: 'dinosaur', translation: '恐龙', imageUrl: '' },
        { text: 'rock', translation: '岩石', imageUrl: '' }
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
  const [rocks, setRocks] = useState<JumperRock[]>([]);
  const [altitude, setAltitude] = useState(0); // height meters

  // Dino jumping rendering state
  const [dinoPosition, setDinoPosition] = useState<'BASE' | 'LEFT' | 'RIGHT'>('BASE');
  const [isJumping, setIsJumping] = useState(false);

  const hero = useMemo(() => {
    return CHARACTERS.find(c => c.id === stats.selectedCharacterId) || CHARACTERS[0];
  }, [stats.selectedCharacterId]);

  const wordPointer = useRef(0);

  const rockThemes = [
    'bg-gradient-to-b from-stone-400 to-stone-650 border-stone-300 shadow-[0_6px_0_#44403c]',
    'bg-gradient-to-b from-amber-650 to-amber-800 border-amber-500 shadow-[0_6px_0_#78350f]'
  ];

  const startGame = () => {
    setGameState('PLAYING');
    setScore(0);
    setCoinsEarned(0);
    setXpEarned(0);
    setHearts(5);
    setAltitude(0);
    setDinoPosition('BASE');
    setIsJumping(false);
    wordPointer.current = 0;

    audio.playPop();
    nextJumperTask();
  };

  const nextJumperTask = () => {
    if (allWords.length === 0) return;
    const target = allWords[wordPointer.current % allWords.length];
    wordPointer.current += 1;
    setTargetWord(target);

    // Setup left/right rocks
    const wrongTranslations = allWords
      .filter(w => w.text !== target.text)
      .map(w => w.translation);
    const shuffledWrong = [...wrongTranslations].sort(() => Math.random() - 0.5)[0] || '未知';

    const leftIsCorrect = Math.random() > 0.5;

    const currentRocks = [
      {
        id: `rock-left`,
        translation: leftIsCorrect ? target.translation : shuffledWrong,
        isCorrect: leftIsCorrect,
        position: 'LEFT',
        color: 'from-amber-500 to-amber-700 border-amber-400 shadow-[0_5px_0_#78350f]'
      },
      {
        id: `rock-right`,
        translation: leftIsCorrect ? shuffledWrong : target.translation,
        isCorrect: !leftIsCorrect,
        position: 'RIGHT',
        color: 'from-orange-500 to-orange-700 border-orange-400 shadow-[0_5px_0_#9a3412]'
      }
    ] as JumperRock[];

    setRocks(currentRocks);
    try { audio.speak(target.text); } catch (e) {}
  };

  const jumpToRock = (rock: JumperRock) => {
    if (isJumping || gameState !== 'PLAYING') return;

    setIsJumping(true);
    setDinoPosition(rock.position);
    audio.playClick();

    if (rock.isCorrect) {
      // SUCCESS ARC CLIMB 🎉
      audio.playSuccess();
      try { audio.speak(targetWord?.text || ''); } catch (e) {}

      setScore(s => s + 60);
      setCoinsEarned(c => c + 3);
      setXpEarned(x => x + 8);
      setAltitude(a => a + 15);

      setTimeout(() => {
        setIsJumping(false);
        setDinoPosition('BASE'); // camera scrolls, resetting dino to center base 

        if (wordPointer.current >= 7) {
          setGameState('WON');
          audio.playCheer();
          try { confetti({ particleCount: 160, spread: 80, origin: { y: 0.6 } }); } catch (e) {}
        } else {
          nextJumperTask();
        }
      }, 950);
    } else {
      // Rocky crumbles and dinosaur tumbles back with rubber spring leaf bounce
      audio.playError();
      setHearts(h => {
        const nextH = h - 1;
        if (nextH <= 0) setGameState('LOST');
        return nextH;
      });
      setScore(s => Math.max(0, s - 20));

      setTimeout(() => {
        setIsJumping(false);
        setDinoPosition('BASE'); // restore dino stand position
      }, 900);
    }
  };

  const claimFinish = () => {
    audio.playClick();
    onFinish(score, coinsEarned);
  };

  return (
    <div className="w-full max-w-xl mx-auto rounded-[40px] border-4 border-amber-600 shadow-[0_32px_64px_-16px_rgba(217,119,6,0.15)] bg-gradient-to-b from-[#fef3c7] to-[#fde68a] text-[#78350f] overflow-hidden font-sans relative select-none">
      <h3 className="hidden">恐龙踏岩登高记</h3>

      {/* Header Info */}
      <div className="bg-[#78350f] p-4 flex items-center justify-between border-b border-[#92400e] text-white">
        <div className="flex items-center space-x-3">
          <button onClick={onClose} className="p-2 hover:bg-[#92400e] rounded-xl transition-all cursor-pointer">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h4 id="dino-title" className="font-extrabold text-[#fef3c7] text-sm leading-none flex items-center gap-1.5">
              <span>恐龙跳词岩 (Dino Rock Jumper)</span>
              <span className="text-[9px] bg-amber-500/35 text-amber-200 font-extrabold px-1.5 py-0.5 rounded">Climb</span>
            </h4>
            <span className="text-[10px] text-amber-200 block font-bold mt-1">点击带有该单词正确解释的浮石，让小恐龙一跃而上</span>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <div className="bg-[#92400e] px-2.5 py-1 rounded-xl font-bold flex items-center space-x-1 border border-amber-850">
            <span>🪙</span>
            <span className="text-yellow-300">+{coinsEarned}</span>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {gameState === 'INTRO' && (
          <motion.div 
            key="intro" 
            className="p-8 py-16 text-center space-y-6 bg-gradient-to-b from-[#fef3c7] to-[#fed7aa]"
          >
            <div className="text-6xl animate-bounce">🦖⛰️</div>
            <div className="space-y-2">
              <h4 className="text-2xl font-black text-amber-900 tracking-tight">恐龙火山行：飞石大跨越</h4>
              <p className="text-xs text-amber-950 font-extrabold leading-relaxed uppercase">
                咕呜！火山岩不断向上生长，勇敢的恐龙宝宝想爬上天极摘星星。屏幕上方浮起两个岩石踏脚。只有点击有「正确中文解释」的那个，恐龙才会跃升。点错石块，石块会塌陷掉落噢。
              </p>
            </div>

            <button 
              onClick={startGame}
              className="w-full max-w-xs bg-gradient-to-r from-amber-500 to-orange-500 hover:brightness-110 border-b-4 border-amber-700 py-3.5 rounded-[24px] text-white font-black text-sm transition-all cursor-pointer shadow-lg"
            >
              踩石跳山 🦖🏔️
            </button>
          </motion.div>
        )}

        {gameState === 'PLAYING' && (
          <motion.div key="playing" className="flex flex-col relative bg-[#fffae6]">
            
            {/* HUD Status */}
            <div className="bg-[#451a03] px-4 py-2 flex items-center justify-between text-white text-xs">
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-[#fde68a]">恐龙气血:</span>
                <div className="flex space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-sm">
                      {i < hearts ? '❤️' : '🖤'}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-[#78350f] px-2.5 py-0.5 rounded text-[10px] font-black uppercase text-amber-200">
                登高高度: {altitude} 米
              </div>
            </div>

            {/* DINO JUMP FIELD MOUNTAIN (250px min height scrollable background effect) */}
            <div className="w-full aspect-[1.8/1] min-h-[250px] bg-gradient-to-bx from-sky-300 via-[#fef3c7] to-orange-200 relative overflow-hidden px-1 border-b border-amber-200">
              
              {/* Parallax layered absolute scenery sun and cloud clouds */}
              <div className="absolute top-4 left-10 text-4xl animate-pulse pointer-events-none select-none opacity-40">☁️</div>
              <div className="absolute top-8 right-12 text-3xl pointer-events-none select-none opacity-45">☁️</div>
              <div className="absolute top-2 right-4 text-[9px] font-black text-amber-900/40 tracking-widest uppercase">🌋 Mount Rex Climbing</div>

              {/* FLOATING OPTIONS ROCKS */}
              <div className="absolute top-[28%] inset-x-8 flex justify-around items-center">
                {rocks.map(r => (
                  <motion.button
                    key={r.id}
                    onClick={() => jumpToRock(r)}
                    disabled={isJumping}
                    whileHover={{ scale: 1.06 }}
                    whileTap={{ scale: 0.95 }}
                    className={`w-[45%] p-3 rounded-2xl border bg-gradient-to-b ${r.color} text-white font-black text-xs text-center flex flex-col items-center justify-center cursor-pointer transition-transform relative`}
                  >
                    <span className="text-[8px] font-black tracking-widest text-[#fde68a] block leading-none mb-1">
                      {r.position === 'LEFT' ? '🧗 ROCK A' : '🧗 ROCK B'}
                    </span>
                    <span className="font-extrabold text-sm">{r.translation}</span>
                  </motion.button>
                ))}
              </div>

              {/* DINO CHARACTER SPRITE */}
              <motion.div
                animate={
                  dinoPosition === 'BASE' 
                    ? { y: 165, x: 'calc(50% - 24px)', scale: 1 } 
                    : dinoPosition === 'LEFT' 
                    ? { y: [165, 30, 75], x: 'calc(25% - 24px)', rotate: [0, -15, 0] } 
                    : { y: [165, 30, 75], x: 'calc(75% - 24px)', rotate: [0, 15, 0] }
                }
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="absolute w-12 h-12 flex items-center justify-center text-5xl z-30 pointer-events-none select-none"
              >
                🦖
              </motion.div>

              {/* Ground base safe rock step at bottom center */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-44 h-11 bg-gradient-to-b from-stone-500 to-stone-700 border-t-4 border-stone-400 rounded-t-xl shadow-inner flex items-center justify-center z-15">
                <span className="text-[9px] font-black text-stone-200 tracking-wider">🌋 MOUNTAIN BASE ROCKS</span>
              </div>

            </div>

            {/* LOWER DIALOGUE STUDY BAR */}
            <div className="p-4 bg-[#fff9eb] border-t border-amber-100 text-[#78350f] text-center space-y-1">
              {targetWord ? (
                <div className="space-y-1">
                  <span className="text-[9px] font-black text-amber-500 tracking-wider block leading-none uppercase">TARGET ENGLISH COMMAND:</span>
                  <div className="flex items-center space-x-1.5 justify-center">
                    <span className="font-extrabold text-lg text-[#7c2d12] font-sans tracking-tight">「 {targetWord.text} 」</span>
                    <button 
                      onClick={() => { audio.speak(targetWord.text); }}
                      className="p-1 hover:bg-amber-100 rounded text-amber-700 cursor-pointer"
                    >
                      <Volume2 size={13} />
                    </button>
                  </div>
                  <p className="text-[11px] text-stone-500 max-w-xs mx-auto leading-relaxed">
                    选择上方与其意吻合的汉字台阶跳跃，带领恐龙冲出火山，极速登顶！
                  </p>
                </div>
              ) : (
                <div className="text-stone-400 font-extrabold py-3 text-xs">装载石刻中...</div>
              )}
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
              <h4 className="text-3xl font-black text-amber-700">火山征服者！</h4>
              <p className="text-xs text-amber-950 uppercase font-black leading-relaxed">
                你在火山之巅挥舞着胜利的战旗！小恐龙成功在太空摘到了最亮的星星！
              </p>
            </div>

            <div className="bg-amber-100 border border-amber-200 rounded-3xl p-5 max-w-sm mx-auto space-y-3">
              <div className="flex items-center justify-around divide-x divide-amber-200 text-slate-800">
                <div className="text-center">
                  <span className="text-[9px] font-black text-amber-700 block mb-1 uppercase">跨登得分</span>
                  <span className="text-xl font-black text-amber-900 tabular-nums">{score}</span>
                </div>
                <div className="text-center pl-4">
                  <span className="text-[9px] font-black text-amber-600 block mb-1 uppercase">赏赐金币</span>
                  <span className="text-xl font-black text-amber-500 tabular-nums">+{coinsEarned}</span>
                </div>
                <div className="text-center pl-4">
                  <span className="text-[9px] font-black text-pink-600 block mb-1 uppercase">跨岩XP</span>
                  <span className="text-xl font-black text-pink-700 tabular-nums">+{xpEarned} XP</span>
                </div>
              </div>
            </div>

            <button 
              onClick={claimFinish}
              className="w-full max-w-xs bg-amber-600 hover:bg-amber-500 border-b-4 border-amber-800 py-3.5 rounded-[24px] text-white font-black text-sm cursor-pointer transition-colors"
            >
              收拾登山包 下山
            </button>
          </motion.div>
        )}

        {gameState === 'LOST' && (
          <motion.div 
            key="lost" 
            className="p-8 py-14 text-center space-y-6 bg-gradient-to-b from-[#fef3c7] to-[#fde68a]"
          >
            <div className="w-16 h-16 bg-rose-150 border border-rose-200 text-rose-500 rounded-full flex items-center justify-center text-3xl mx-auto animate-pulse">
              🌋
            </div>

            <div className="space-y-1 text-slate-800">
              <h4 className="text-2xl font-black text-rose-600">跌落叶垫！登山折返</h4>
              <p className="text-xs text-slate-500 font-extrabold uppercase leading-normal">
                跳跃空踩或踩到松散石台太多。抱抱受伤的小恐龙，养精蓄锐重新攀登吧！
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto pt-4">
              <button 
                onClick={startGame}
                className="bg-amber-600 hover:bg-amber-500 border-b-4 border-amber-800 py-3 rounded-2xl text-white font-black text-xs cursor-pointer"
              >
                再次起跃 (Retry)
              </button>
              <button 
                onClick={claimFinish}
                className="bg-slate-200 border border-slate-350 py-3 rounded-2xl text-slate-600 font-black text-xs cursor-pointer"
              >
                安全下野 (Leave)
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DinoRockJumper;
