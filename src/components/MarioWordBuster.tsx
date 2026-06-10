import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Volume2, Trophy, RefreshCw, ArrowRight, Play, Heart, Gamepad2, Sparkles, Star, 
  ArrowLeft as ArrowLeftIcon, ArrowRight as ArrowRightIcon, ChevronUp, Zap, Gift, AlertTriangle
} from 'lucide-react';
import { WordGroup, WordItem, UserStats } from '../types';
import audio from '../utils/AudioUtils';
import confetti from 'canvas-confetti';

interface MarioWordBusterProps {
  groups: WordGroup[];
  stats: UserStats;
  onFinish: (score: number, coins: number) => void;
  onClose: () => void;
}

// Sub-modes of English-to-Chinese gameplay
type GameMode = 'CORE_VOCAB' | 'BLANK_COMPLETION';

interface QuestionState {
  englishChallenge: string; // The English word or sentence containing ___
  phoneticSymbol?: string;  // Simulated phonetic guide
  sentenceContext?: string; // Example sentence in English
  chineseCorrectAnswer: string; // The correct Chinese translations
  options: { id: string; label: string; isCorrect: boolean }[];
}

// Dynamic Mario Avatar rendering in pure SVG inline so it is super polished & highly customizable
const MarioAvatar: React.FC<{ state: 'IDLE' | 'WALKING' | 'JUMPING' | 'HIT' | 'FALLEN'; facingLeft: boolean }> = ({ state, facingLeft }) => {
  return (
    <div 
      className={`relative w-16 h-18 transition-all duration-100 ${facingLeft ? 'scale-x-[-1]' : ''}`}
    >
      <svg viewBox="0 0 64 64" className="w-full h-full drop-shadow-[0_4px_6px_rgba(0,0,0,0.3)]">
        {/* Cap Shadow */}
        <path d="M 14 18 L 48 18 L 46 22 L 16 22 Z" fill="#991111" />
        
        {/* Cap Main Red */}
        <path d="M 16 14 C 16 14, 20 8, 32 8 C 44 8, 48 14, 48 14 L 52 19 L 14 19 Z" fill="#E52521" />
        {/* Cap Brim Visor */}
        <path d="M 38 17 L 51 17 C 53 19, 52 21, 48 21 L 38 21 Z" fill="#E52521" />
        
        {/* Emblem White Circle & M */}
        <circle cx="30" cy="13" r="4.5" fill="#FFFFFF" />
        <path d="M 28 15 L 29.5 12 L 30 13.5 L 30.5 12 L 32 15" stroke="#E52521" strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        
        {/* Face skin */}
        <path d="M 20 20 L 46 20 C 46 20, 50 26, 46 36 C 42 42, 34 41, 30 41 C 24 41, 20 37, 20 30 Z" fill="#FDE0D1" />
        
        {/* Sideburns Hair */}
        <path d="M 17 20 L 22 20 L 22 27 L 17 25 Z" fill="#6A3B16" />
        <path d="M 15 24 L 20 24 L 20 30 L 15 28 Z" fill="#6A3B16" />

        {/* Eyes */}
        {state === 'FALLEN' ? (
          // Dead dizzy cross eyes
          <>
            <path d="M 26 23 L 30 27 M 30 23 L 26 27" stroke="#000000" strokeWidth="2" strokeLinecap="round" />
            <path d="M 36 23 L 40 27 M 40 23 L 36 27" stroke="#000000" strokeWidth="2" strokeLinecap="round" />
          </>
        ) : (
          // Sparkling black pupil eyes
          <>
            <ellipse cx="28.5" cy="24" rx="2.2" ry="4.5" fill="#000000" />
            <ellipse cx="37.5" cy="24" rx="2.2" ry="4.5" fill="#000000" />
            <circle cx="28" cy="22.5" r="0.8" fill="#FFFFFF" />
            <circle cx="37" cy="22.5" r="0.8" fill="#FFFFFF" />
          </>
        )}

        {/* Animated Cute Round Nose */}
        <ellipse cx="34" cy="28.5" rx="5" ry="3.8" fill="#FABA9C" />

        {/* Thick Italian Mustache */}
        <path d="M 24 31.5 C 24 31.5, 27 29.5, 32 29.5 C 37 29.5, 41 31.5, 41 31.5 C 43 33.5, 43 35.5, 41 35.5 C 37 35.5, 35 32.5, 32 32.5 C 29 32.5, 27 35.5, 23 35.5 C 21 35.5, 21 33.5, 24 31.5 Z" fill="#000000" />

        {/* Ear */}
        <circle cx="18" cy="28" r="3.5" fill="#FDE0D1" />

        {/* Animated Mouth */}
        {state === 'HIT' || state === 'JUMPING' ? (
          // Big shouting open mouth
          <ellipse cx="31.5" cy="35.5" rx="2" ry="3" fill="#E52521" />
        ) : state === 'FALLEN' ? (
          // Dizzy line mouth
          <path d="M 28 36 Q 31.5 33 35 36" stroke="#000000" strokeWidth="1.8" fill="none" strokeLinecap="round" />
        ) : (
          // Delighted open mustache smile
          <path d="M 28 35.5 Q 31.5 38 35 35.5" stroke="#000000" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        )}

        {/* Red Shirt Sleeves & Torso */}
        <path d="M 20 40 L 44 40 L 44 54 L 20 54 Z" fill="#E52521" />

        {/* Oversize Denim Blue Overalls */}
        <path d="M 23.5 40 L 27.5 40 L 27.5 54 L 23.5 54 Z" fill="#0E429E" /> {/* Straps Left */}
        <path d="M 36.5 40 L 40.5 40 L 40.5 54 L 36.5 54 Z" fill="#0E429E" /> {/* Straps Right */}
        <path d="M 22 44.5 L 42 44.5 C 42 44.5, 44 49, 42 54 L 22 54 Z" fill="#0E429E" /> {/* Bottom Pants */}

        {/* Glowing Golden Overall Buttons */}
        <circle cx="25.5" cy="45.5" r="1.8" fill="#FCD34D" stroke="#B45309" strokeWidth="0.5" />
        <circle cx="38.5" cy="45.5" r="1.8" fill="#FCD34D" stroke="#B45309" strokeWidth="0.5" />

        {/* Dynamic Arms based on activity state */}
        {state === 'JUMPING' || state === 'HIT' ? (
          // High power arms pointing to sky vector
          <>
            {/* Red left sleeve upward */}
            <path d="M 12 28 C 12 28, 14 34, 21 38 L 17 41 L 10 32 Z" fill="#E52521" />
            <circle cx="9" cy="30" r="4" fill="#FFFFFF" stroke="#000000" strokeWidth="0.6" /> {/* Glove */}
            
            {/* Red right sleeve upward */}
            <path d="M 52 28 C 52 28, 50 34, 43 38 L 47 41 L 54 32 Z" fill="#E52521" />
            <circle cx="55" cy="30" r="4" fill="#FFFFFF" stroke="#000000" strokeWidth="0.6" /> {/* Glove */}
          </>
        ) : state === 'WALKING' ? (
          // Pendulum swinging arms
          <>
            {/* Walk swing left */}
            <path d="M 16 41 L 11 47 L 14 50 L 20 44 Z" fill="#E52521" />
            <circle cx="10" cy="48" r="3.5" fill="#FFFFFF" stroke="#000000" strokeWidth="0.5" />
            
            {/* Walk swing right */}
            <path d="M 48 41 L 52 45 L 49 49 L 44 44 Z" fill="#E52521" />
            <circle cx="53" cy="46" r="3.5" fill="#FFFFFF" stroke="#000000" strokeWidth="0.5" />
          </>
        ) : (
          // Standard standing posture dangling arms
          <>
            {/* Standing Left Arm */}
            <path d="M 16 41 L 13 47 L 16 50 L 20 44 Z" fill="#E52521" />
            <circle cx="12" cy="49" r="3.5" fill="#FFFFFF" stroke="#D1D5DB" strokeWidth="0.5" />
            
            {/* Standing Right Arm */}
            <path d="M 48 41 L 51 47 L 48 50 L 44 44 Z" fill="#E52521" />
            <circle cx="52" cy="49" r="3.5" fill="#FFFFFF" stroke="#D1D5DB" strokeWidth="0.5" />
          </>
        )}

        {/* Dynamic Legs and Shoes */}
        {state === 'WALKING' ? (
          // Staggered walking feet
          <>
            <path d="M 23 54 L 28 54 L 28 59 L 21 58 Z" fill="#0E429E" />
            <path d="M 36 54 L 41 54 L 42 57 L 35 57 Z" fill="#0E429E" />
            
            {/* Red cap style brown boots */}
            <path d="M 20 58 C 17 58, 17 62, 26 62 L 26 58 Z" fill="#5C3818" />
            <path d="M 34 57 C 32 57, 32 61, 41 61 L 41 57 Z" fill="#5C3818" />
          </>
        ) : (
          // Balanced standing legs
          <>
            <path d="M 23 54 L 29 54 L 29 59 L 23 59 Z" fill="#0E429E" />
            <path d="M 35 54 L 41 54 L 41 59 L 35 59 Z" fill="#0E429E" />
            
            <path d="M 21 59 C 17 59, 17 63, 29 63 L 29 59 Z" fill="#5C3818" stroke="#3D220A" strokeWidth="0.5" />
            <path d="M 35 59 C 35 59, 47 63, 43 59 L 41 59 Z" fill="#5C3818" stroke="#3D220A" strokeWidth="0.5" />
          </>
        )}
      </svg>
    </div>
  );
};

export const MarioWordBuster: React.FC<MarioWordBusterProps> = ({ groups, stats, onFinish, onClose }) => {
  // Load words from active groups
  const poolWords = useMemo(() => {
    const arr = groups.flatMap(g => g.words);
    if (arr.length > 0) return arr;
    // Fallback dictionary in case user has no books loaded yet
    return [
      { text: 'wonderful', translation: '极好的', imageUrl: '' },
      { text: 'adventure', translation: '奇妙大冒险', imageUrl: '' },
      { text: 'experience', translation: '实践经验', imageUrl: '' },
      { text: 'courage', translation: '惊人勇气', imageUrl: '' },
      { text: 'victory', translation: '热血胜利', imageUrl: '' },
      { text: 'legend', translation: '不朽传说', imageUrl: '' },
      { text: 'treasure', translation: '稀世珍宝', imageUrl: '' },
      { text: 'dangerous', translation: '充满危险的', imageUrl: '' },
      { text: 'brilliant', translation: '聪颖绝伦的', imageUrl: '' },
      { text: 'champion', translation: '世界冠军', imageUrl: '' },
    ];
  }, [groups]);

  // Game configuration
  const TOTAL_ROUNDS = 5;
  const [currentRound, setCurrentRound] = useState(1);
  const [gameMode, setGameMode] = useState<GameMode>('CORE_VOCAB');
  const [gameState, setGameState] = useState<'INTRO' | 'PLAYING' | 'SUMMARY'>('INTRO');

  // Interactive metrics
  const [score, setScore] = useState(0);
  const [coins, setCoins] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [hearts, setHearts] = useState(3);

  // Active question state
  const [question, setQuestion] = useState<QuestionState | null>(null);

  // Items / Powerups State
  const [hasShield, setHasShield] = useState(false);
  const [powerupCoinsMultiplier, setPowerupCoinsMultiplier] = useState(1);

  // Mario physics & state in the playground
  const [marioX, setMarioX] = useState(15); // percentage (15 to 85)
  const [marioY, setMarioY] = useState(0);   // jump offset
  const [marioState, setMarioState] = useState<'IDLE' | 'WALKING' | 'JUMPING' | 'HIT' | 'FALLEN'>('IDLE');
  const [facingLeft, setFacingLeft] = useState(false);

  // Interactive single-click selection to avoid accidental touch errors
  const [selectedBrickId, setSelectedBrickId] = useState<string | null>(null);
  const [popCoinAnim, setPopCoinAnim] = useState<{ id: number; x: number; y: number } | null>(null);
  const walkTimerRef = useRef<any>(null);

  // Animation ticks & floating coin FX states
  const [coinPop, setCoinPop] = useState<{ x: number; text: string; id: number } | null>(null);
  const [scrollyBgOffset, setScrollyBgOffset] = useState(0);

  // Question brick configuration
  const [bricks, setBricks] = useState<{
    id: string;
    label: string;
    x: number; // 0 to 100 on the screen width
    y: number; // constant height
    isHit: boolean;
    isCorrect: boolean;
  }[]>([]);

  // Sound generator (custom synthesized retro Beeps)
  const playRetroSound = (type: 'JUMP' | 'COIN' | 'HIT_BLOCKED' | 'ERROR' | 'WIN' | 'UPGRADE' | 'SELECT_CHIRP') => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const now = ctx.currentTime;

      if (type === 'SELECT_CHIRP') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(700, now + 0.08);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.09);
      } else if (type === 'JUMP') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(800, now + 0.15);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.17);
      } else if (type === 'COIN') {
        // Classic Mario double-note coin ping
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(987.77, now); // B5
        osc1.frequency.setValueAtTime(1318.51, now + 0.08); // E6
        gain1.gain.setValueAtTime(0.2, now);
        gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.start(now);
        osc1.stop(now + 0.38);
      } else if (type === 'ERROR') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(280, now);
        osc.frequency.linearRampToValueAtTime(100, now + 0.28);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.28);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.3);
      } else if (type === 'WIN') {
        // Star win fan fare sounds
        [523.25, 659.25, 783.99, 1046.50].forEach((f, idx) => {
          const t = now + idx * 0.09;
          const oscNode = ctx.createOscillator();
          const gainNode = ctx.createGain();
          oscNode.type = 'sine';
          oscNode.frequency.setValueAtTime(f, t);
          gainNode.gain.setValueAtTime(0.15, t);
          gainNode.gain.exponentialRampToValueAtTime(0.01, t + 0.3);
          oscNode.connect(gainNode);
          gainNode.connect(ctx.destination);
          oscNode.start(t);
          oscNode.stop(t + 0.35);
        });
      } else if (type === 'UPGRADE') {
        // Retro powerup scale notes
        [330, 392, 659, 523, 587, 784].forEach((f, idx) => {
          const t = now + idx * 0.06;
          const oscNode = ctx.createOscillator();
          const gainNode = ctx.createGain();
          oscNode.type = 'triangle';
          oscNode.frequency.setValueAtTime(f, t);
          gainNode.gain.setValueAtTime(0.12, t);
          gainNode.gain.exponentialRampToValueAtTime(0.01, t + 0.2);
          oscNode.connect(gainNode);
          gainNode.connect(ctx.destination);
          oscNode.start(t);
          oscNode.stop(t + 0.25);
        });
      } else {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.linearRampToValueAtTime(80, now + 0.1);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.12);
      }
    } catch (e) {
      console.warn("Speech API audio error", e);
    }
  };

  // Walk timer cleanup
  useEffect(() => {
    return () => {
      if (walkTimerRef.current) {
        clearInterval(walkTimerRef.current);
      }
    };
  }, []);

  // Keyboard and Control binds
  useEffect(() => {
    if (gameState !== 'PLAYING') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'KeyA'].includes(e.code)) {
        moveLeft();
      } else if (['ArrowRight', 'KeyD'].includes(e.code)) {
        moveRight();
      } else if (['Space', 'ArrowUp', 'KeyW'].includes(e.code)) {
        e.preventDefault();
        triggerJump();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [marioX, marioY, marioState, gameState]);

  // Backdrop moving scroll helper
  const addScrollClue = (change: number) => {
    setScrollyBgOffset(prev => (prev + change + 360) % 360);
  };

  // Walk controls
  const moveLeft = () => {
    if (marioState === 'JUMPING' || marioState === 'FALLEN') return;
    setFacingLeft(true);
    setMarioState('WALKING');
    setMarioX(prev => {
      const nextX = Math.max(8, prev - 8);
      // Auto-target the nearest brick at this vertical column if any
      const matched = bricks.find(b => Math.abs(b.x - nextX) < 6 && !b.isHit);
      if (matched) setSelectedBrickId(matched.id);
      return nextX;
    });
    addScrollClue(4);
    setTimeout(() => setMarioState('IDLE'), 120);
  };

  const moveRight = () => {
    if (marioState === 'JUMPING' || marioState === 'FALLEN') return;
    setFacingLeft(false);
    setMarioState('WALKING');
    setMarioX(prev => {
      const nextX = Math.min(92, prev + 8);
      // Auto-target the nearest brick at this vertical column if any
      const matched = bricks.find(b => Math.abs(b.x - nextX) < 6 && !b.isHit);
      if (matched) setSelectedBrickId(matched.id);
      return nextX;
    });
    addScrollClue(-4);
    setTimeout(() => setMarioState('IDLE'), 120);
  };

  const triggerJump = () => {
    if (marioState === 'JUMPING' || marioState === 'FALLEN') return;

    // Find selected brick or nearest active brick
    let targetBrick = bricks.find(b => b.id === selectedBrickId);
    if (!targetBrick) {
      const activeBricks = bricks.filter(b => !b.isHit);
      if (activeBricks.length > 0) {
        // Nearest in terms of X distance to Mario
        targetBrick = activeBricks.reduce((closest, current) => {
          return Math.abs(current.x - marioX) < Math.abs(closest.x - marioX) ? current : closest;
        }, activeBricks[0]);
        setSelectedBrickId(targetBrick.id);
        setMarioX(targetBrick.x);
      } else {
        return; // nothing to hit
      }
    } else {
      // Snap Mario X coordinate perfectly underneath the targeted brick
      setMarioX(targetBrick.x);
    }

    setMarioState('JUMPING');
    playRetroSound('JUMP');

    // Smooth physics trajectory (Peak height 90px matches perfectly centered level blocks)
    let peakReached = false;
    let height = 0;
    const interval = setInterval(() => {
      if (!peakReached) {
        height += 15;
        if (height >= 90) {
          peakReached = true;
          // Check collision at top peak!
          checkBrickHits(targetBrick ? targetBrick.x : marioX);
        }
      } else {
        height -= 15;
        if (height <= 0) {
          height = 0;
          clearInterval(interval);
          setMarioState('IDLE');
        }
      }
      setMarioY(height);
    }, 20);
  };

  // Helper to extract incorrect distractor answers dynamically from other words in the book
  const getDynamicDistractors = (correctTranslation: string, count: number = 3) => {
    const otherTranslations = poolWords
      .filter(w => w.translation !== correctTranslation)
      .map(w => w.translation);
    
    const uniqueTranslations = otherTranslations.filter((val, idx, self) => self.indexOf(val) === idx);
    const shuffled = uniqueTranslations.sort(() => Math.random() - 0.5);

    // Fallbacks if user active pool has too few items
    const fallbacks = [
      '极棒的冒险者', '神奇魔法森林', '炽热火球术', '冰封古盾', '狂暴加速器', '巨型霸王龙', '金币磁铁', '七彩幸运星'
    ];

    const results: string[] = [];
    for (let i = 0; i < count; i++) {
      if (shuffled[i]) {
        results.push(shuffled[i]);
      } else {
        const item = fallbacks.filter(f => f !== correctTranslation && !results.includes(f))[0] || '神秘宝箱';
        results.push(item);
      }
    }
    return results;
  };

  // Initialize word study target and build question state
  const generateQuestion = (round: number) => {
    if (poolWords.length === 0) return;

    // Direct look-at English, Select Chinese core mechanic
    const selectedIndex = (round - 1) % poolWords.length;
    const currentWord = poolWords[selectedIndex];

    // Direct vocabulary dictionary mapping exclusively
    const nextGameMode: GameMode = 'CORE_VOCAB';
    setGameMode(nextGameMode);

    let newQuestion: QuestionState;

    if (nextGameMode === 'CORE_VOCAB') {
      const dists = getDynamicDistractors(currentWord.translation, 3);
      const options = [
        { id: 'correct', label: currentWord.translation, isCorrect: true },
        ...dists.map((d, index) => ({ id: `wrong-${index}`, label: d, isCorrect: false }))
      ].sort(() => Math.random() - 0.5);

      newQuestion = {
        englishChallenge: currentWord.text,
        phoneticSymbol: currentWord.text.length > 5 ? `/${currentWord.text.substring(0, 4)}...ic/` : undefined,
        chineseCorrectAnswer: currentWord.translation,
        options
      };
    } else {
      // BLANK_COMPLETION mode (Read contextual sentence containing blank in English, choose translation)
      const contextualSentenceBank = [
        { en: 'We had a ___ adventure in the green woods.', wordText: 'wonderful', wordZh: '奇妙的' },
        { en: 'This is an unforgettable ___ for us.', wordText: 'experience', wordZh: '经历 / 体验' },
        { en: 'We got the ultimate ___ after hard work.', wordText: 'victory', wordZh: '红利胜利' },
        { en: 'He wrote an ancient ___ about the dragon.', wordText: 'legend', wordZh: '英雄传说' },
        { en: 'It takes great ___ to defeat the monster.', wordText: 'courage', wordZh: '非凡勇气' },
      ];

      // Match or fallback to custom generator based on the active word
      const selectedContext = contextualSentenceBank[(round - 1) % contextualSentenceBank.length];
      const challengeSentence = selectedContext.en.replace('___', `[ ${currentWord.text} ]`);
      
      const dists = getDynamicDistractors(currentWord.translation, 3);
      const options = [
        { id: 'correct', label: currentWord.translation, isCorrect: true },
        ...dists.map((d, index) => ({ id: `wrong-${index}`, label: d, isCorrect: false }))
      ].sort(() => Math.random() - 0.5);

      newQuestion = {
        englishChallenge: challengeSentence,
        chineseCorrectAnswer: currentWord.translation,
        options
      };
    }

    setQuestion(newQuestion);

    // Clear previous selection states
    setSelectedBrickId(null);

    // Position bricks evenly in the middle height sky (4 choices)
    const computedBricks = newQuestion.options.map((opt, i) => {
      // 14% to 86% width spacing to maximize clearance and prevent collision/overlap
      const spacing = 72 / 3;
      const xPercent = 14 + i * spacing;
      return {
        id: opt.id,
        label: opt.label,
        x: xPercent,
        y: 110, // vertical height in state updated
        isHit: false,
        isCorrect: opt.isCorrect
      };
    });

    setBricks(computedBricks);

    // Auto trigger audio pronunciation of English card
    audio.speak(currentWord.text);
  };

  // Collision inspector
  const checkBrickHits = (xPos: number) => {
    let hitIdx = -1;
    let minDistance = 12; // collision target threshold in percent

    // If there is an active selection, favor it, otherwise find matching brick
    if (selectedBrickId) {
      const idx = bricks.findIndex(b => b.id === selectedBrickId);
      if (idx !== -1 && !bricks[idx].isHit) {
        hitIdx = idx;
      }
    } else {
      bricks.forEach((brick, idx) => {
        if (brick.isHit) return;
        const d = Math.abs(brick.x - xPos);
        if (d < minDistance) {
          hitIdx = idx;
        }
      });
    }

    if (hitIdx !== -1) {
      handleStepActivation(hitIdx);
    } else {
      playRetroSound('HIT_BLOCKED');
    }
  };

  // Direct brick selection & confirm tap support
  const handleBrickTap = (brickId: string) => {
    if (marioState === 'JUMPING' || marioState === 'FALLEN') return;

    const targetBrick = bricks.find(b => b.id === brickId);
    if (!targetBrick || targetBrick.isHit) return;

    // Clear any running walk interval to avoid overlapping motion timers
    if (walkTimerRef.current) {
      clearInterval(walkTimerRef.current);
      walkTimerRef.current = null;
    }

    if (selectedBrickId !== brickId) {
      // 1. FIRST CLICK: Target & Select the brick. Mario walks directly underneath it.
      setSelectedBrickId(brickId);
      playRetroSound('SELECT_CHIRP');
      setMarioState('WALKING');
      setFacingLeft(targetBrick.x < marioX);

      let currentX = marioX;
      const speedStep = targetBrick.x > currentX ? 4 : -4;
      walkTimerRef.current = setInterval(() => {
        currentX += speedStep;
        if ((speedStep > 0 && currentX >= targetBrick.x) || (speedStep < 0 && currentX <= targetBrick.x)) {
          currentX = targetBrick.x;
          if (walkTimerRef.current) clearInterval(walkTimerRef.current);
          setMarioX(targetBrick.x);
          setMarioState('IDLE');
        } else {
          setMarioX(currentX);
          addScrollClue(speedStep * -0.3);
        }
      }, 15);
    } else {
      // 2. SECOND CLICK (or confirmation): Strike!
      if (Math.abs(marioX - targetBrick.x) < 2) {
        triggerJump();
      } else {
        // Walk quickly and then trigger jump
        setMarioState('WALKING');
        setFacingLeft(targetBrick.x < marioX);
        let currentX = marioX;
        const speedStep = targetBrick.x > currentX ? 5 : -5;
        walkTimerRef.current = setInterval(() => {
          currentX += speedStep;
          if ((speedStep > 0 && currentX >= targetBrick.x) || (speedStep < 0 && currentX <= targetBrick.x)) {
            currentX = targetBrick.x;
            if (walkTimerRef.current) clearInterval(walkTimerRef.current);
            setMarioX(targetBrick.x);
            setMarioState('IDLE');
            setTimeout(() => triggerJump(), 50);
          } else {
            setMarioX(currentX);
            addScrollClue(speedStep * -0.3);
          }
        }, 12);
      }
    }
  };

  // Brick resolution logic
  const handleStepActivation = (idx: number) => {
    const brick = bricks[idx];
    if (!question) return;

    const modifiedBricks = [...bricks];
    modifiedBricks[idx].isHit = true;
    setBricks(modifiedBricks);

    // Punch strike frame animation trigger
    setMarioState('HIT');
    setTimeout(() => {
      if (marioState !== 'FALLEN') setMarioState('IDLE');
    }, 280);

    if (brick.isCorrect) {
      // 1. Calculate and add coins with multipliers
      const baseCoinPayout = 8;
      const finalCoinPayout = baseCoinPayout * powerupCoinsMultiplier;

      playRetroSound('COIN');
      setCoins(c => c + finalCoinPayout);
      setScore(s => s + 30 * (combo + 1));
      setCombo(cb => cb + 1);

      setCoinPop({
        x: brick.x,
        text: `+${30 * (combo + 1)} XP (连击 x${combo + 1})`,
        id: Date.now()
      });

      // Spawn traditional Mario floating/spinning coin popping out of the block!
      setPopCoinAnim({
        id: Date.now(),
        x: brick.x,
        y: 110 // height of middle sky box
      });
      setTimeout(() => setPopCoinAnim(null), 950);

      // Show confetti splash on brick position
      confetti({
        particleCount: 25,
        spread: 35,
        origin: { x: brick.x / 100, y: 0.55 }
      });

      triggerRoundStepComplete();
    } else {
      // Handles incorrect brick strikes
      if (hasShield) {
        // Shield absorbs the strike
        playRetroSound('HIT_BLOCKED');
        setHasShield(false);
        setCoinPop({
          x: brick.x,
          text: `🛡️ 护盾抵挡了错误伤害！`,
          id: Date.now()
        });
        setTimeout(() => {
          setBricks(prev => prev.map((b, i) => i === idx ? { ...b, isHit: false } : b));
        }, 1200);
      } else {
        // Normal mistake penalty
        playRetroSound('ERROR');
        setCombo(0);
        setMarioState('FALLEN');
        setTimeout(() => setMarioState('IDLE'), 800);

        setCoinPop({
          x: marioX,
          text: `💥 选错啦！正确释义是: "${question.chineseCorrectAnswer}"`,
          id: Date.now()
        });

        setHearts(prev => {
          const remaining = prev - 1;
          if (remaining <= 0) {
            setTimeout(() => finishGame(), 1500);
          }
          return remaining;
        });

        // Restore choice brick so they can try again
        setTimeout(() => {
          setBricks(prev => prev.map((b, i) => i === idx ? { ...b, isHit: false } : b));
        }, 1300);
      }
    }
  };

  // Next Round flow
  const triggerRoundStepComplete = () => {
    setMaxCombo(prev => Math.max(prev, combo + 1));

    setTimeout(() => {
      if (currentRound >= TOTAL_ROUNDS) {
        finishGame();
      } else {
        setCurrentRound(prev => prev + 1);
        generateQuestion(currentRound + 1);
      }
    }, 1400);
  };

  // Power up shop items selection inside gameplay context
  const claimPowerup = (item: 'SHIELD' | 'DOUBLE_COINS' | 'HEAL') => {
    if (item === 'SHIELD') {
      if (coins < 15) return;
      setCoins(c => c - 15);
      setHasShield(true);
      playRetroSound('UPGRADE');
    } else if (item === 'DOUBLE_COINS') {
      if (coins < 20) return;
      setCoins(c => c - 20);
      setPowerupCoinsMultiplier(2);
      playRetroSound('UPGRADE');
      setTimeout(() => setPowerupCoinsMultiplier(1), 8000); // lasts 8 seconds
    } else if (item === 'HEAL') {
      if (coins < 25) return;
      setCoins(c => c - 25);
      setHearts(h => Math.min(3, h + 1));
      playRetroSound('UPGRADE');
    }
  };

  const startGame = () => {
    setScore(0);
    setCoins(20); // Provide 20 initial gold coins for purchasing start items!
    setCombo(0);
    setMaxCombo(0);
    setHearts(3);
    setHasShield(false);
    setPowerupCoinsMultiplier(1);
    setCurrentRound(1);
    setGameState('PLAYING');
    generateQuestion(1);
    audio.playClick();
  };

  const finishGame = () => {
    setGameState('SUMMARY');
    playRetroSound('WIN');
    confetti({
      particleCount: 150,
      spread: 85,
      origin: { y: 0.55 }
    });
  };

  const handleCollectRewards = () => {
    audio.playReward();
    onFinish(score, coins);
  };

  return (
    <div id="mario_game_root" className="min-h-screen w-full bg-[#090b14] text-white flex flex-col items-center justify-start p-3 sm:p-6 font-mono relative overflow-hidden select-none">
      
      {/* Moving pixel stars backdrop */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(16,24,64,0.45)_0%,_rgba(3,5,15,1)_100%)] pointer-events-none" />
      <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(45deg,#fff_25%,transparent_25%),linear-gradient(-45deg,#fff_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#fff_75%),linear-gradient(-45deg,transparent_75%,#fff_75%)] bg-[size:20px_20px] pointer-events-none" />

      {/* Arcade cabinet outer glow effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-red-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blue-600/10 rounded-full blur-[90px] pointer-events-none" />

      {/* Header bar: Arcade Console Marquee */}
      <div className="w-full max-w-4xl flex flex-col sm:flex-row items-center justify-between gap-3 border-b-4 border-red-500/80 pb-4 mb-5 relative z-20 bg-slate-900/40 p-4 rounded-3xl backdrop-blur-md shadow-lg shadow-red-950/20">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-red-650 to-red-500 text-white p-3 rounded-2xl border-2 border-yellow-400 shadow-[0_0_15px_rgba(239,68,68,0.4)] animate-pulse">
            <span className="text-2xl font-black block leading-none transform hover:rotate-12 transition-transform duration-200">🍄</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-2xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-yellow-400 to-amber-300 uppercase">
                SUPER MARIO
              </h1>
              <span className="text-[11px] font-black text-slate-950 bg-yellow-400 px-2 py-0.5 rounded-md border border-yellow-500 shadow-sm animate-bounce">
                Buster V2
              </span>
            </div>
            <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">English → Chinese Core Learning Arena</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => playRetroSound('UPGRADE')}
            className="p-2 bg-slate-950 hover:bg-slate-800 border-2 border-slate-800 text-yellow-400 rounded-xl cursor-pointer text-xs flex items-center justify-center transition-all active:scale-95 outline-none"
            title="查看帮助"
          >
            <span>📖 秘籍说明</span>
          </button>
          
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-gradient-to-r from-red-600/90 to-red-500 hover:from-red-500 hover:to-red-400 text-white border-b-4 border-red-800 rounded-xl cursor-pointer text-xs font-bold uppercase tracking-wide flex items-center gap-1.5 active:scale-95 transition-all outline-none"
          >
            <X size={14} className="stroke-[3]" /> <span>退出大厅</span>
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 1. INTRO START WELCOME SCREEN */}
      {/* ------------------------------------------------------------- */}
      {gameState === 'INTRO' && (
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full max-w-2xl bg-gradient-to-b from-[#192147] via-[#0b1029] to-[#040612] rounded-[40px] border-4 border-[#ff4545] p-6 sm:p-10 text-center shadow-2xl relative overflow-hidden my-auto border-b-8 shadow-red-950/50"
        >
          {/* Animated decorative retro symbols */}
          <div className="absolute top-4 left-6 text-2xl opacity-20 animate-pulse">☁️</div>
          <div className="absolute top-12 right-12 text-3.5xl opacity-15">☁️</div>
          <div className="absolute bottom-16 left-8 text-3xl opacity-10 animate-bounce">⭐</div>
          <div className="absolute top-36 right-8 text-2.5xl opacity-10 animate-spin">🪙</div>

          {/* Glowing ring under Mario avatar */}
          <div className="w-32 h-32 mx-auto flex items-center justify-center relative mb-6">
            <div className="absolute inset-0 bg-yellow-400/10 rounded-full blur-xl animate-ping" style={{ animationDuration: '3s' }} />
            <div className="absolute inset-1.5 bg-red-500/25 rounded-full border border-dashed border-red-500/40 animate-spin" style={{ animationDuration: '12s' }} />
            
            {/* The beautiful custom rendered vector Mario avatar in the preview card! */}
            <div className="relative z-10 filter drop-shadow-[0_8px_16px_rgba(229,37,33,0.35)] scale-110">
              <MarioAvatar state="IDLE" facingLeft={false} />
            </div>
            
            {/* Hanging question box */}
            <motion.div 
              animate={{ y: [0, -6, 0] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
              className="absolute -top-1.5 -right-1.5 w-10 h-10 bg-yellow-450 border-3 border-yellow-700/80 rounded-xl flex items-center justify-center text-slate-950 font-black text-sm shadow-md"
            >
              ❔
            </motion.div>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-amber-400 to-yellow-300 drop-shadow-sm select-none">
            马里奥看英文选中文
          </h2>
          <p className="text-[#a4bcfc] max-w-lg mx-auto text-xs sm:text-sm mt-3.5 mb-8 leading-relaxed font-semibold">
            在绿意盎然的马里奥天空世界中，悬浮着四个写有中文释义的 <strong className="text-yellow-400 font-extrabold">【?方块 question-box】</strong>。
            辨析屏幕中醒目的英语单词，指挥马里奥狂奔或高高跃起顶破正确的英文方块，就能夺取巨额金币和经验红利，让单词记忆牢固印入脑海！
          </p>

          {/* Highlight feature grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto text-left mb-8">
            <div className="bg-[#0c0f24] border-2 border-slate-800 hover:border-red-500/40 transition-colors p-4 rounded-2xl flex items-start gap-3">
              <span className="text-3xl mt-0.5 filter drop-shadow">🎮</span>
              <div>
                <span className="text-xs sm:text-sm font-black text-yellow-300 block mb-1">极速自适应点触定位</span>
                <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                  无冗余杂乱健盘阻碍！直接<strong>手轻戳天空悬浮的问号宝箱</strong>，马里奥将极速狂奔、高度定位并凌空击顶，快感十足！
                </p>
              </div>
            </div>
            
            <div className="bg-[#0c0f24] border-2 border-slate-800 hover:border-teal-500/40 transition-colors p-4 rounded-2xl flex items-start gap-3">
              <span className="text-3xl mt-0.5 filter drop-shadow">🛡️</span>
              <div>
                <span className="text-xs sm:text-sm font-black text-teal-300 block mb-1">随身背囊防错道具</span>
                <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                  使用累积的游戏金币快捷兑换【防错护盾】、生命恢复等好礼！支持电脑端 A/D/Space 键盘方向行跳控制！
                </p>
              </div>
            </div>
          </div>

          <button 
            onClick={startGame}
            className="px-10 py-5 bg-gradient-to-r from-red-600 via-orange-550 to-yellow-500 hover:from-red-500 hover:to-yellow-450 text-white font-black text-2xl rounded-3xl shadow-[0_10px_25px_-5px_rgba(239,68,68,0.4)] border-b-8 border-red-800 active:border-b-2 hover:scale-[1.03] active:scale-[0.98] transition-all flex items-center justify-center gap-3 mx-auto cursor-pointer outline-none"
          >
            <Play size={22} className="fill-white" />
            <span>开启冒险 (START MISSION)</span>
          </button>
        </motion.div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 2. PLAYING GAMEPLAY SCREEN CONTAINER */}
      {/* ------------------------------------------------------------- */}
      {gameState === 'PLAYING' && question && (
        <div className="w-full max-w-4xl flex flex-col space-y-4 relative z-10">
          
          {/* LED CLASSIC HUD BAR (Monochrome black panel styled with retro glow text) */}
          <div className="grid grid-cols-4 gap-2 bg-black border-4 border-slate-700/80 p-3 rounded-2xl text-center select-none shadow-2xl relative">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent pointer-events-none rounded-xl" />
            
            <div className="border-r border-slate-900">
              <p className="text-[10px] text-slate-500 font-extrabold uppercase mb-0.5 tracking-wider">WORLD ROUND</p>
              <p className="text-sm sm:text-lg font-black text-red-500 leading-none font-mono">0{currentRound} / 0{TOTAL_ROUNDS}</p>
            </div>
            
            <div className="border-r border-slate-900">
              <p className="text-[10px] text-slate-500 font-extrabold uppercase mb-0.5 tracking-wider">MY COINS</p>
              <p className="text-sm sm:text-lg font-black text-yellow-400 leading-none flex items-center justify-center gap-1 font-mono">
                <span className="text-yellow-500 scale-110 drop-shadow-[0_0_4px_rgba(234,179,8,0.5)]">🪙</span>
                <span>{coins}</span>
              </p>
            </div>
            
            <div className="border-r border-slate-900">
              <p className="text-[10px] text-slate-500 font-extrabold uppercase mb-0.5 tracking-wider">TOTAL POINTS</p>
              <p className="text-sm sm:text-lg font-black text-emerald-400 leading-none font-mono tracking-tight">{score} XP</p>
            </div>
            
            <div className="flex flex-col items-center justify-center">
              <p className="text-[10px] text-slate-500 font-extrabold uppercase mb-0.5 tracking-wider">LIVES LEFT</p>
              <div className="flex items-center gap-1">
                {[...Array(3)].map((_, i) => (
                  <Heart 
                    key={i} 
                    size={14} 
                    className={`${
                      i < hearts 
                        ? 'fill-red-600 text-red-500 drop-shadow-[0_0_6px_rgba(239,68,68,0.6)] animate-pulse' 
                        : 'text-slate-800'
                    }`} 
                  />
                ))}
              </div>
            </div>
          </div>

          {/* MAIN 2D PLAYGROUND STAGE WITH CRT MOCK BEZEL */}
          <div className="relative rounded-[36px] bg-slate-950 p-2.5 border-4 border-slate-800 shadow-2xl">

            <div 
              id="mario-stage"
              className="w-full h-[320px] bg-[#5c94fc] rounded-[26px] relative overflow-hidden shadow-inner flex flex-col justify-end pointer-events-auto"
              style={{ imageRendering: 'pixelated' }}
            >
              {/* Retro television CRT raster grid lines */}
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,_rgba(0,0,0,0.15)_50%),_linear-gradient(90deg,_rgba(255,0,0,0.04),_rgba(0,255,0,0.01),_rgba(0,0,255,0.04))] bg-[size:100%_4px,_6px_100%] z-25 opacity-25" />
              <div className="absolute inset-0 bg-radial-vignette opacity-20 pointer-events-none z-25" />

              {/* TARGET WORD BANNER FLOATING IN THE SKY CLOUDS (IN LOWERCASE) - MOVED SIGNIFICANTLY UPWARD FOR AN IMPROVED VIEW & COMFORT */}
              <div className="absolute top-[4px] sm:top-[6px] left-1/2 -translate-x-1/2 z-30 flex flex-col items-center pointer-events-auto">
                <div className="bg-white/98 border-[3px] border-sky-200 px-7 py-2 rounded-2xl shadow-[0_6px_22px_rgba(14,165,233,0.25)] flex items-center gap-3">
                  <span className="text-3xl sm:text-4xl font-extrabold text-slate-950 font-sans tracking-tight lowercase select-text">
                    {gameMode === 'CORE_VOCAB' 
                      ? question.englishChallenge.toLowerCase() 
                      : poolWords[(currentRound - 1) % poolWords.length].text.toLowerCase()}
                  </span>
                  
                  {/* Micro pronunciation audio button inside target banner */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const speakTarget = gameMode === 'CORE_VOCAB' 
                        ? question.englishChallenge 
                        : poolWords[(currentRound - 1) % poolWords.length].text;
                      audio.speak(speakTarget);
                    }}
                    className="p-2 hover:bg-sky-50 rounded-full text-indigo-750 bg-slate-50 hover:text-indigo-850 transition-all cursor-pointer flex items-center justify-center border border-sky-100 shadow-sm active:scale-95 duration-75"
                    title="播放发音"
                  >
                    <Volume2 size={20} className="stroke-[3]" />
                  </button>
                </div>
              </div>

              {/* 1. Scrolling background Cloud vectors */}
              <div className="absolute top-4 left-0 right-0 h-10 overflow-hidden pointer-events-none">
                <div 
                  className="flex gap-40 w-[600%] absolute transition-all duration-75"
                  style={{ transform: `translateX(${scrollyBgOffset * 0.15}px)` }}
                >
                  <div className="w-24 h-8 bg-white/75 rounded-full relative filter drop-shadow opacity-90 shrink-0">
                    <div className="w-10 h-10 bg-white/75 rounded-full absolute -top-4 left-4" />
                    <div className="w-12 h-12 bg-white/75 rounded-full absolute -top-5 left-10" />
                  </div>
                  <div className="w-16 h-6 bg-white/60 rounded-full relative filter drop-shadow opacity-85 shrink-0">
                    <div className="w-8 h-8 bg-white/60 rounded-full absolute -top-3 left-4" />
                  </div>
                  <div className="w-28 h-9 bg-white/75 rounded-full relative filter drop-shadow opacity-95 shrink-0">
                    <div className="w-12 h-12 bg-white/75 rounded-full absolute -top-5 left-6" />
                  </div>
                </div>
              </div>

              {/* 2. Scrolling vintage hills / trees with retro pine tree visual design */}
              <div className="absolute bottom-[44px] left-0 right-0 h-14 overflow-hidden pointer-events-none">
                <div 
                  className="flex gap-20 w-[600%] absolute transition-all duration-100"
                  style={{ transform: `translateX(${scrollyBgOffset * 0.5}px)` }}
                >
                  {[...Array(14)].map((_, i) => (
                    <div key={i} className="flex flex-col items-center shrink-0 relative mt-2.5">
                      {/* Tree top structure: 2 stacked retro triangles */}
                      <div className="w-0 h-0 border-l-[14px] border-r-[14px] border-b-[16px] border-l-transparent border-r-transparent border-b-emerald-600 drop-shadow-sm relative">
                        <div className="w-0 h-0 border-l-[10px] border-r-[10px] border-b-[12px] border-l-transparent border-r-transparent border-b-emerald-500 absolute -bottom-[16px] -left-[10px] scale-y-95 pointer-events-none" />
                      </div>
                      <div className="w-0 h-0 border-l-[18px] border-r-[18px] border-b-[18px] border-l-transparent border-r-transparent border-b-emerald-700 -mt-2 drop-shadow-sm" />
                      {/* Trunk */}
                      <div className="w-3 h-5 bg-amber-850 border-x-2 border-amber-955" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Pop-up retro Mario Gold Coin Animation */}
              {popCoinAnim && (
                <motion.div
                  initial={{ y: 0, scale: 0.8, opacity: 1, rotate: 0 }}
                  animate={{ 
                    y: [-120, -185, -145], 
                    scale: [1, 1.7, 1.3], 
                    rotate: [0, 270, 540],
                    opacity: [1, 1, 0] 
                  }}
                  transition={{ duration: 0.7, ease: "easeOut" }}
                  style={{ left: `${popCoinAnim.x}%`, transform: 'translateX(-50%)' }}
                  className="absolute bottom-[44px] z-35 pointer-events-none text-3xl select-none filter drop-shadow-[0_0_12px_rgba(253,224,71,1)]"
                >
                  🪙
                </motion.div>
              )}

              {/* 3. FLOATING QUESTION BRICKS (Positioned in the middle of the stage height: top-[115px]) */}
              <div className="absolute top-[115px] left-0 right-0 z-10 flex items-center">
                {bricks.map((brick) => {
                  const isSelected = selectedBrickId === brick.id;
                  return (
                    <div 
                      key={brick.id}
                      style={{ left: `${brick.x}%`, transform: 'translateX(-50%)' }}
                      className="absolute"
                    >
                      {/* Active target cursor pointer helper */}
                      {isSelected && !brick.isHit && (
                        <motion.div 
                          initial={{ y: -6, opacity: 0 }}
                          animate={{ y: [ -12, -4, -12 ], opacity: 1 }}
                          transition={{ repeat: Infinity, duration: 1 }}
                          className="absolute -top-6 left-1/2 -translate-x-1/2 z-20 text-[10px] bg-red-600 border border-yellow-300 text-white font-black px-1.5 py-0.5 rounded-md whitespace-nowrap shadow-md filter drop-shadow animate-pulse"
                        >
                          🎯 确认撞击
                        </motion.div>
                      )}

                      <motion.div
                        animate={brick.isHit ? { y: [-24, 0] } : isSelected ? { y: [-3, 3, -3] } : {}}
                        transition={brick.isHit ? { type: 'spring', stiffness: 500, damping: 12 } : isSelected ? { repeat: Infinity, duration: 1.4 } : {}}
                        onClick={() => handleBrickTap(brick.id)}
                        className={`w-[65px] sm:w-[85px] min-h-[55px] sm:min-h-[68px] flex flex-col items-center justify-between border-2 sm:border-3 rounded-xl sm:rounded-2xl cursor-pointer p-1 sm:p-1.5 text-center transition-all shadow-md select-none ${
                          brick.isHit 
                            ? 'bg-[#1b0a04]/90 border-amber-950 text-amber-500 shadow-inner scale-95 opacity-80' 
                            : isSelected
                              ? 'bg-gradient-to-b from-[#fef08a] via-[#facc15] to-[#ca8a04] border-[#ef4444] scale-105 shadow-[0_0_15px_rgba(239,68,68,0.7)] text-slate-950'
                              : 'bg-gradient-to-b from-yellow-400 to-yellow-500 hover:from-yellow-350 hover:to-yellow-450 border-yellow-800 hover:border-yellow-600 text-slate-950 shadow-md shadow-amber-955/30'
                        }`}
                      >
                        {/* Selector/Interrogation Icon at top (reduced size to favor massive Chinese text) */}
                        <div className="text-[8px] sm:text-[9.5px] font-black tracking-widest leading-none mb-0.5 opacity-80">
                          {brick.isHit ? '✔' : isSelected ? '👆' : '❔'}
                        </div>

                        {/* HIGH-CONTRAST ENLARGED CHINESE MEANINGS (MUCH BIGGER) */}
                        <div className={`text-[14px] sm:text-[17px] font-sans font-black leading-tight tracking-tight break-all line-clamp-2 text-center justify-center flex items-center flex-1 w-full ${isSelected ? 'text-red-950 font-extrabold' : 'text-slate-950'}`}>
                          {brick.label}
                        </div>

                        {/* Brick bottom detail rivets */}
                        <div className="w-full h-1 mt-0.5 border-t border-yellow-300/20 flex justify-between px-0.5 opacity-40">
                          <div className={`w-0.5 h-0.5 rounded-full ${isSelected ? 'bg-red-500' : 'bg-yellow-700'}`} />
                          <div className={`w-0.5 h-0.5 rounded-full ${isSelected ? 'bg-red-500' : 'bg-yellow-700'}`} />
                        </div>
                      </motion.div>
                    </div>
                  );
                })}
              </div>

              {/* 4. MARIO PLAYER COMPONENT (Custom inline vector) */}
              <div 
                style={{ 
                  left: `${marioX}%`, 
                  bottom: `${44 + marioY}px`,
                  transform: 'translateX(-50%)'
                }}
                className="absolute z-20 w-16 h-18 transition-all duration-75 flex items-center justify-center pointer-events-none"
              >
                <MarioAvatar state={marioState} facingLeft={facingLeft} />
              </div>

              {/* 5. Retro platform blocks ground (Grass-top with beautiful brick details) */}
              <div className="absolute bottom-0 left-0 right-0 h-11 flex flex-col justify-between select-none border-t-2 border-[#16600c]">
                {/* Grass top line with vibrant retro green styling */}
                <div className="h-2.5 bg-[#4ef037] border-b-2 border-[#16600c] w-full" />
                {/* Underneath orange-brown dirt blocks */}
                <div 
                  className="flex-1 w-full border-t border-[#f4841a]"
                  style={{
                    backgroundColor: '#d85800',
                    backgroundImage: 'repeating-linear-gradient(45deg, #e47c1a 0px, #e47c1a 10px, #943000 10px, #943000 20px)'
                  }}
                />
              </div>

              {/* 6. Coins or XP floating notification triggers */}
              <AnimatePresence>
                {coinPop && (
                  <motion.div 
                    key={coinPop.id}
                    initial={{ opacity: 0, scale: 0.8, y: 130 }}
                    animate={{ opacity: 1, scale: 1.1, y: 35 }}
                    exit={{ opacity: 0, y: -25 }}
                    transition={{ duration: 1.8 }}
                    style={{ left: `${coinPop.x}%`, transform: 'translateX(-50%)' }}
                    className="absolute z-40 pointer-events-none select-none text-center"
                  >
                    <div className="inline-block bg-gradient-to-r from-red-600 via-yellow-400 to-amber-500 border-2 border-white text-slate-950 font-black px-3 py-1.5 rounded-2xl shadow-xl border-b-4 border-yellow-750 text-xs text-shadow-sm whitespace-nowrap animate-pulse">
                      🌟 {coinPop.text}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Combo notification badge */}
              {combo >= 2 && (
                <motion.div 
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="absolute top-3 left-3 bg-gradient-to-r from-yellow-500 to-orange-550 text-slate-950 font-black px-3.5 py-2 rounded-full border border-yellow-300 select-none text-[10px] inline-flex items-center gap-1.5 shadow"
                >
                  <Star size={11} className="fill-slate-950 animate-spin" />
                  <span>连击 COMBO x{combo}!</span>
                </motion.div>
              )}
            </div>
          </div>

          {/* DOCK BAR WITH COMPACT TOOLS & BACKPACK ACCESSORIES */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0d1024]/80 border-2 border-slate-800 p-3 px-4.5 rounded-[22px] backdrop-blur-md relative z-10 w-full shadow-lg">
            <div className="flex items-center gap-1.5 shrink-0 select-none">
              <span className="text-shadow text-xs font-black text-slate-400 uppercase tracking-widest">🎒 我的随身背囊：</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => claimPowerup('SHIELD')}
                disabled={coins < 15 || hasShield}
                className={`px-3.5 py-2 border-2 rounded-xl text-[11px] font-black flex items-center gap-1.5 transition-all outline-none select-none ${
                  hasShield 
                    ? 'bg-teal-500/25 border-teal-500/40 text-teal-300 opacity-90' 
                    : coins >= 15 
                      ? 'bg-slate-950 hover:bg-[#1a1f49] border-teal-500/40 hover:border-teal-500 text-teal-400 hover:text-teal-300 cursor-pointer active:scale-95' 
                      : 'bg-slate-950/40 border-slate-900 text-slate-600 cursor-not-allowed'
                }`}
                title="购买防错护盾（需要15金币）"
              >
                <span>🛡️ {hasShield ? '防护盾 (已装配)' : '购买免错盾 (15🪙)'}</span>
              </button>

              <button
                onClick={() => claimPowerup('HEAL')}
                disabled={coins < 25 || hearts >= 3}
                className={`px-3.5 py-2 border-2 rounded-xl text-[11px] font-black flex items-center gap-1.5 transition-all outline-none select-none ${
                  hearts >= 3 
                    ? 'bg-red-500/15 border-red-500/30 text-red-300 opacity-90' 
                    : coins >= 25 
                      ? 'bg-slate-950 hover:bg-[#1a1f49] border-red-500/40 hover:border-red-500 text-red-500 hover:text-red-400 cursor-pointer active:scale-95' 
                      : 'bg-slate-950/40 border-slate-900 text-slate-600 cursor-not-allowed'
                }`}
                title="回复一点气血（需要25金币）"
              >
                <span>❤️ {hearts >= 3 ? '生命值饱满' : '购买恢复菇 (25🪙)'}</span>
              </button>

              {powerupCoinsMultiplier > 1 && (
                <span className="px-2.5 py-1.5 bg-yellow-450/15 border border-yellow-500/30 rounded-lg text-[10px] font-black text-yellow-350 flex items-center gap-1 animate-pulse select-none shadow-sm">
                  ⚡ 2x 金币加成
                </span>
              )}
            </div>
          </div>

        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 3. GAME SUMMARY RESULT CONSOLE */}
      {/* ------------------------------------------------------------- */}
      {gameState === 'SUMMARY' && (
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full max-w-xl bg-gradient-to-br from-[#12193b] via-[#090d23] to-[#030510] rounded-[48px] border-4 border-slate-700 p-6 sm:p-10 text-center shadow-2xl relative overflow-hidden my-auto"
        >
          <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-600/10 rounded-full blur-[45px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-600/10 rounded-full blur-[50px] pointer-events-none" />
          
          <div className="w-24 h-24 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-full mx-auto flex items-center justify-center border-4 border-white shadow-[0_0_20px_rgba(16,185,129,0.5)] relative mb-5">
            <Trophy size={48} className="text-white fill-emerald-600 scale-110" />
          </div>

          <h3 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-green-300 to-teal-300 uppercase tracking-tighter block leading-none">
            STAGE CLEAR!
          </h3>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1.5 mb-8">冒险关卡圆满终结，通关神光普照！</p>

          <div className="grid grid-cols-2 gap-4 max-w-md mx-auto mb-8 text-left select-none">
            <div className="bg-[#070a1a] p-4.5 rounded-2xl border-2 border-slate-850 hover:border-emerald-500/30 transition-colors text-center">
              <span className="text-[10px] text-slate-500 leading-none block mb-1 font-bold">XP ACQUIRED 经验值</span>
              <p className="text-3xl font-black text-emerald-400 font-mono">+{score} <span className="text-xs text-slate-450 font-normal">XP</span></p>
            </div>
            
            <div className="bg-[#070a1a] p-4.5 rounded-2xl border-2 border-slate-850 hover:border-yellow-500/30 transition-colors text-center">
              <span className="text-[10px] text-slate-500 leading-none block mb-1 font-bold">COINS EARNED 金币</span>
              <p className="text-3xl font-black text-yellow-400 font-mono">🪙 +{coins}</p>
            </div>

            <div className="col-span-2 bg-[#070a1a] p-3.5 rounded-2xl border-2 border-slate-850 flex justify-between px-6 text-xs text-slate-300 font-semibold items-center select-none font-sans">
              <span>🏆 最高连击记录 (Max Combo):</span>
              <span className="text-yellow-400 font-black text-sm tracking-widest bg-yellow-500/10 border border-yellow-500/30 px-3 py-1 rounded-full font-mono">
                {maxCombo} 连击
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-400 italic max-w-sm mx-auto mb-8 leading-relaxed font-medium">
            “词灵神光，不灭金身。恭喜你在马里奥看词大冒险中斩获大量金币！这些词汇释义已经在跌宕起伏的冒险中深深烙刻在你心中！”
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={startGame}
              className="flex-1 py-4 bg-slate-900 hover:bg-slate-800 border-2 border-[#1f2937] text-slate-350 font-black rounded-2xl text-xs active:scale-95 cursor-pointer transition-all flex items-center justify-center gap-1.5 outline-none font-semibold select-none shadow-md"
            >
              <RefreshCw size={14} /> 重新挑战一次
            </button>
            
            <button
              onClick={handleCollectRewards}
              className="flex-[2] py-4 bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-black rounded-2xl text-sm shadow-[0_8px_20px_-4px_rgba(16,185,129,0.35)] hover:shadow-[0_12px_24px_-4px_rgba(16,185,129,0.45)] border-b-4 border-emerald-850 active:border-b-2 active:scale-95 transition-all flex items-center justify-center gap-2 outline-none select-none"
            >
              <span>收下红利并退出 (Collect Rewards)</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </motion.div>
      )}

    </div>
  );
};

export default MarioWordBuster;
