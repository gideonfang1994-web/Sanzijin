import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  HelpCircle, 
  Volume2, 
  RefreshCw, 
  ChevronLeft, 
  Trophy, 
  Star, 
  Compass, 
  BookOpen, 
  ArrowRight,
  Heart,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import audio from '../utils/AudioUtils';
import confetti from 'canvas-confetti';
import { UserStats, WordGroup } from '../types';

// Let's define the letter details matching standard preschool worksheets
interface LetterDetail {
  upper: string;        // "A"
  lower: string;        // "a"
  word: string;         // "alligator"
  translation: string;  // "鳄鱼"
  emoji: string;        // "🐊"
  phrase: string;       // "Aa is for alligator"
  pathTemplateIndex: number; // Pick the coordinate template shape
  characterStyles: string[]; // Variations of fonts used for cells
}

// 26 letters database - fully styled with unique animal details and Chinese translations
const ALPHABET_DATA: Record<string, LetterDetail> = {
  A: { upper: 'A', lower: 'a', word: 'alligator', translation: '鳄鱼', emoji: '🐊', phrase: 'Aa is for alligator', pathTemplateIndex: 0, characterStyles: ['font-serif italic', 'font-sans font-extrabold', 'font-mono font-black', 'font-serif font-black', 'font-sans font-bold'] },
  B: { upper: 'B', lower: 'b', word: 'bear', translation: '小熊', emoji: '🐻', phrase: 'Bb is for bear', pathTemplateIndex: 1, characterStyles: ['font-serif italic', 'font-sans font-extrabold', 'font-mono font-black', 'font-serif font-bold', 'font-sans font-semibold'] },
  C: { upper: 'C', lower: 'c', word: 'cat', translation: '猫咪', emoji: '🐱', phrase: 'Cc is for cat', pathTemplateIndex: 2, characterStyles: ['font-serif font-bold', 'font-sans font-black', 'font-mono italic', 'font-serif italic', 'font-mono font-bold'] },
  D: { upper: 'D', lower: 'd', word: 'dinosaur', translation: '恐龙', emoji: '🦖', phrase: 'Dd is for dinosaur', pathTemplateIndex: 3, characterStyles: ['font-sans font-extrabold', 'font-serif font-black', 'font-mono italic', 'font-serif italic', 'font-sans font-bold'] },
  E: { upper: 'E', lower: 'e', word: 'elephant', translation: '大象', emoji: '🐘', phrase: 'Ee is for elephant', pathTemplateIndex: 4, characterStyles: ['font-serif italic', 'font-sans font-bold', 'font-mono font-black', 'font-serif font-black', 'font-sans font-semibold'] },
  F: { upper: 'F', lower: 'f', word: 'fox', translation: '狐狸', emoji: '🦊', phrase: 'Ff is for fox', pathTemplateIndex: 0, characterStyles: ['font-serif italic', 'font-sans font-extrabold', 'font-mono font-black', 'font-serif font-black', 'font-sans font-bold'] },
  G: { upper: 'G', lower: 'g', word: 'giraffe', translation: '长颈鹿', emoji: '🦒', phrase: 'Gg is for giraffe', pathTemplateIndex: 1, characterStyles: ['font-serif italic', 'font-sans font-extrabold', 'font-mono font-black', 'font-serif font-bold', 'font-sans font-semibold'] },
  H: { upper: 'H', lower: 'h', word: 'horse', translation: '小马', emoji: '🐴', phrase: 'Hh is for horse', pathTemplateIndex: 2, characterStyles: ['font-serif font-bold', 'font-sans font-black', 'font-mono italic', 'font-serif italic', 'font-mono font-bold'] },
  I: { upper: 'I', lower: 'i', word: 'iguana', translation: '鬣蜥', emoji: '🦎', phrase: 'Ii is for iguana', pathTemplateIndex: 3, characterStyles: ['font-sans font-extrabold', 'font-serif font-black', 'font-mono italic', 'font-serif italic', 'font-sans font-bold'] },
  J: { upper: 'J', lower: 'j', word: 'jellyfish', translation: '水母', emoji: '🪼', phrase: 'Jj is for jellyfish', pathTemplateIndex: 4, characterStyles: ['font-serif italic', 'font-sans font-bold', 'font-mono font-black', 'font-serif font-black', 'font-sans font-semibold'] },
  K: { upper: 'K', lower: 'k', word: 'kangaroo', translation: '袋鼠', emoji: '🦘', phrase: 'Kk is for kangaroo', pathTemplateIndex: 0, characterStyles: ['font-serif italic', 'font-sans font-extrabold', 'font-mono font-black', 'font-serif font-black', 'font-sans font-bold'] },
  L: { upper: 'L', lower: 'l', word: 'ladybug', translation: '瓢虫', emoji: '🐞', phrase: 'Ll is for ladybug', pathTemplateIndex: 1, characterStyles: ['font-serif italic', 'font-sans font-extrabold', 'font-mono font-black', 'font-serif font-bold', 'font-sans font-semibold'] },
  M: { upper: 'M', lower: 'm', word: 'mouse', translation: '小老鼠', emoji: '🐭', phrase: 'Mm is for mouse', pathTemplateIndex: 2, characterStyles: ['font-serif font-bold', 'font-sans font-black', 'font-mono italic', 'font-serif italic', 'font-mono font-bold'] },
  N: { upper: 'N', lower: 'n', word: 'nest', translation: '鸟巢', emoji: '🪹', phrase: 'Nn is for nest', pathTemplateIndex: 3, characterStyles: ['font-sans font-extrabold', 'font-serif font-black', 'font-mono italic', 'font-serif italic', 'font-sans font-bold'] },
  O: { upper: 'O', lower: 'o', word: 'owl', translation: '猫头鹰', emoji: '🦉', phrase: 'Oo is for owl', pathTemplateIndex: 4, characterStyles: ['font-serif italic', 'font-sans font-bold', 'font-mono font-black', 'font-serif font-black', 'font-sans font-semibold'] },
  P: { upper: 'P', lower: 'p', word: 'penguin', translation: '企鹅', emoji: '🐧', phrase: 'Pp is for penguin', pathTemplateIndex: 0, characterStyles: ['font-serif italic', 'font-sans font-extrabold', 'font-mono font-black', 'font-serif font-black', 'font-sans font-bold'] },
  Q: { upper: 'Q', lower: 'q', word: 'queen', translation: '女王', emoji: '👑', phrase: 'Qq is for queen', pathTemplateIndex: 1, characterStyles: ['font-serif italic', 'font-sans font-extrabold', 'font-mono font-black', 'font-serif font-bold', 'font-sans font-semibold'] },
  R: { upper: 'R', lower: 'r', word: 'rainbow', translation: '彩虹', emoji: '🌈', phrase: 'Rr is for rainbow', pathTemplateIndex: 2, characterStyles: ['font-serif font-bold', 'font-sans font-black', 'font-mono italic', 'font-serif italic', 'font-mono font-bold'] },
  S: { upper: 'S', lower: 's', word: 'sun', translation: '太阳', emoji: '☀️', phrase: 'Ss is for sun', pathTemplateIndex: 3, characterStyles: ['font-sans font-extrabold', 'font-serif font-black', 'font-mono italic', 'font-serif italic', 'font-sans font-bold'] },
  T: { upper: 'T', lower: 't', word: 'tiger', translation: '老虎', emoji: '🐯', phrase: 'Tt is for tiger', pathTemplateIndex: 4, characterStyles: ['font-serif italic', 'font-sans font-bold', 'font-mono font-black', 'font-serif font-black', 'font-sans font-semibold'] },
  U: { upper: 'U', lower: 'u', word: 'umbrella', translation: '雨伞', emoji: '☂️', phrase: 'Uu is for umbrella', pathTemplateIndex: 0, characterStyles: ['font-serif italic', 'font-sans font-extrabold', 'font-mono font-black', 'font-serif font-black', 'font-sans font-bold'] },
  V: { upper: 'V', lower: 'v', word: 'volcano', translation: '火山', emoji: '🌋', phrase: 'Vv is for volcano', pathTemplateIndex: 1, characterStyles: ['font-serif italic', 'font-sans font-extrabold', 'font-mono font-black', 'font-serif font-bold', 'font-sans font-semibold'] },
  W: { upper: 'W', lower: 'w', word: 'watermelon', translation: '西瓜', emoji: '🍉', phrase: 'Ww is for watermelon', pathTemplateIndex: 2, characterStyles: ['font-serif font-bold', 'font-sans font-black', 'font-mono italic', 'font-serif italic', 'font-mono font-bold'] },
  X: { upper: 'X', lower: 'x', word: 'xylophone', translation: '木琴', emoji: '🪘', phrase: 'Xx is for xylophone', pathTemplateIndex: 3, characterStyles: ['font-sans font-extrabold', 'font-serif font-black', 'font-mono italic', 'font-serif italic', 'font-sans font-bold'] },
  Y: { upper: 'Y', lower: 'y', word: 'yak', translation: '牦牛', emoji: '🐂', phrase: 'Yy is for yak', pathTemplateIndex: 4, characterStyles: ['font-serif italic', 'font-sans font-bold', 'font-mono font-black', 'font-serif font-black', 'font-sans font-semibold'] },
  Z: { upper: 'Z', lower: 'z', word: 'zebra', translation: '斑马', emoji: '🦓', phrase: 'Zz is for zebra', pathTemplateIndex: 0, characterStyles: ['font-serif italic', 'font-sans font-extrabold', 'font-mono font-black', 'font-serif font-black', 'font-sans font-bold'] },
};

// Elegant, pre-baked, fully adjacent 7x7 paths going from (0,0) down to (6,6)
const MAZE_PATHS = [
  // Path 0: winding S-curve from (0,0) -> (6,6) [Exactly matches the alligator photo!]
  [
    [0,0], [0,1], [0,2], [1,2], [2,2], [2,3], [3,3], [4,3], [4,2], [4,1], [5,1], [6,1], [6,2], [6,3], [6,4], [6,5], [6,6]
  ],
  // Path 1: Down column 0 and winding across
  [
    [0,0], [1,0], [2,0], [2,1], [2,2], [1,2], [0,2], [0,3], [0,4], [1,4], [2,4], [3,4], [4,4], [4,5], [5,5], [6,5], [6,6]
  ],
  // Path 2: Central zig-zag loop
  [
    [0,0], [0,1], [1,1], [2,1], [2,0], [3,0], [4,0], [5,0], [5,1], [5,2], [4,2], [3,2], [3,3], [3,4], [4,4], [5,4], [6,4], [6,5], [6,6]
  ],
  // Path 3: Border hugger
  [
    [0,0], [0,1], [0,2], [0,3], [0,4], [0,5], [1,5], [2,5], [3,5], [4,5], [4,4], [4,3], [5,3], [6,3], [6,4], [6,5], [6,6]
  ],
  // Path 4: Staircase step-down
  [
    [0,0], [1,0], [1,1], [2,1], [2,2], [3,2], [3,3], [4,3], [4,4], [5,4], [5,5], [6,5], [6,6]
  ]
];

interface LetterLinkGameProps {
  groups?: WordGroup[];
  stats: UserStats;
  onFinish: (score: number, coins: number) => void;
  onClose: () => void;
}

const LetterLinkGame: React.FC<LetterLinkGameProps> = ({ stats, onFinish, onClose }) => {
  const [activeLetter, setActiveLetter] = useState<string>('A');
  const [grid, setGrid] = useState<string[][]>([]);
  const [fontStylesGrid, setFontStylesGrid] = useState<string[][]>([]); // Random styling for each cell to look authentic
  const [solvedPath, setSolvedPath] = useState<[number, number][]>([[0, 0]]); // Coordinates solved so far
  const [wrongCell, setWrongCell] = useState<{r: number, c: number} | null>(null); // Flashing error cell
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [cellCenters, setCellCenters] = useState<Record<string, { x: number, y: number }>>({});
  const [stars, setStars] = useState<number>(3);
  const [score, setScore] = useState<number>(0);
  const [showHowToPlay, setShowHowToPlay] = useState<boolean>(true);

  const gridRef = useRef<HTMLDivElement>(null);
  const lastPronouncedCellRef = useRef<{ r: number; c: number } | null>(null);
  const activeDetail = ALPHABET_DATA[activeLetter];
  const activePath = MAZE_PATHS[activeDetail.pathTemplateIndex];

  // Initialize/Regenerate level for selected letter
  const initLevelForLetter = (letter: string) => {
    setSolvedPath([[0, 0]]);
    setWrongCell(null);
    setIsDrawing(false);
    setStars(3);
    lastPronouncedCellRef.current = null;

    const detail = ALPHABET_DATA[letter];
    const pathCoords = MAZE_PATHS[detail.pathTemplateIndex];

    // Create 7x7 grid
    const newGrid: string[][] = Array(7).fill(null).map(() => Array(7).fill(''));
    const stylesGrid: string[][] = Array(7).fill(null).map(() => Array(7).fill(''));

    // Populate helper dictionary of coordinates for checking
    const pathSet = new Set(pathCoords.map(([r, c]) => `${r},${c}`));

    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        // Select matching typography style representation
        const randomStyle = detail.characterStyles[Math.floor(Math.random() * detail.characterStyles.length)];
        stylesGrid[r][c] = randomStyle;

        if (pathSet.has(`${r},${c}`)) {
          // Path cells must alternate between uppercase and lowercase of active target letter
          const isUpper = Math.random() > 0.45;
          newGrid[r][c] = isUpper ? detail.upper : detail.lower;
        } else {
          // Distractor cells must be random letters other than active letter (both upper and lowercase)
          let distractor = '';
          const filteredKeys = Object.keys(ALPHABET_DATA).filter(k => k !== letter);
          const randKey = filteredKeys[Math.floor(Math.random() * filteredKeys.length)];
          const isUpper = Math.random() > 0.5;
          distractor = isUpper ? ALPHABET_DATA[randKey].upper : ALPHABET_DATA[randKey].lower;
          newGrid[r][c] = distractor;
        }
      }
    }

    // Force start cell (0, 0) to be a valid target letter
    newGrid[0][0] = Math.random() > 0.5 ? detail.upper : detail.lower;
    // Force end cell (6, 6) to be a valid target letter
    newGrid[6][6] = Math.random() > 0.5 ? detail.upper : detail.lower;

    setGrid(newGrid);
    setFontStylesGrid(stylesGrid);

    // Speak introductory phrase
    try {
      audio.speak(`${detail.upper} is for ${detail.word}!`);
    } catch(e) {}

    // Measure centers after DOM rendering
    setTimeout(() => {
      measureCellCenters();
    }, 400);
  };

  // Measure center coordinates of cell circles for drawing laser connector lines
  const measureCellCenters = () => {
    const gridEl = gridRef.current;
    if (!gridEl) return;
    const gridRect = gridEl.getBoundingClientRect();
    const centers: Record<string, { x: number, y: number }> = {};

    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        const cellEl = document.getElementById(`cell-${r}-${c}`);
        if (cellEl) {
          const rect = cellEl.getBoundingClientRect();
          centers[`${r},${c}`] = {
            x: rect.left - gridRect.left + rect.width / 2,
            y: rect.top - gridRect.top + rect.height / 2
          };
        }
      }
    }
    setCellCenters(centers);
  };

  // Initialize level whenever we swap letters
  useEffect(() => {
    initLevelForLetter(activeLetter);
  }, [activeLetter]);

  // Recalculate centers on screen resizes to keep tracing line accurate
  useEffect(() => {
    let timeoutId: any;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        measureCellCenters();
      }, 150);
    };

    window.addEventListener('resize', handleResize);
    // Extra interval in case layout modifies dynamically
    const intervalId = setInterval(measureCellCenters, 1500);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearInterval(intervalId);
      clearTimeout(timeoutId);
    };
  }, [grid]);

  // Interaction resolver for clicking/dragging on a cell (r, c)
  const handleCellInteract = (r: number, c: number) => {
    // If already solved, ignore
    const isAlreadySolved = solvedPath.some(([sr, sc]) => sr === r && sc === c);
    if (isAlreadySolved) return;

    const lastCorrect = solvedPath[solvedPath.length - 1];
    const pathIndex = solvedPath.length; // Next step we expect in activePath

    if (pathIndex >= activePath.length) return; // Completely full

    const nextExpected = activePath[pathIndex];

    // Check if user is touching/clicking exactly the next expected cell in path
    if (r === nextExpected[0] && c === nextExpected[1]) {
      // SUCCESS! Extending path
      const updatedPath = [...solvedPath, [r, c] as [number, number]];
      setSolvedPath(updatedPath);
      setWrongCell(null);

      // Play feedback audio
      try {
        audio.playCoin();
      } catch (e) {}

      // Validate Level Complete Condition!
      if (updatedPath.length === activePath.length) {
        handleLevelComplete();
      }
    } else {
      // WRONG! Highlight wrong selection with flashing red line
      // Only penalize if it is a neighbor of the current path tip (avoids distant accidental touches)
      const dist = Math.abs(r - lastCorrect[0]) + Math.abs(c - lastCorrect[1]);
      if (dist === 1) {
        setWrongCell({ r, c });
        setStars(curr => Math.max(1, curr - 0.5));
        try {
          audio.playError();
        } catch (e) {}

        // Reset the incorrect target visual highlight after a short delay
        setTimeout(() => {
          setWrongCell(null);
        }, 800);
      }
    }
  };

  const handleLevelComplete = () => {
    try {
      // Shoot double confetti canons
      audio.playSuccess();
      confetti({
        particleCount: 180,
        spread: 90,
        origin: { y: 0.6 },
        colors: ['#10b981', '#f59e0b', '#3b82f6', '#ec4899', '#8b5cf6']
      });
    } catch (e) {}

    // Calculate level rewards
    const xpReward = Math.round(stars * 40 + 60); // 100 - 180 XP
    const coinsReward = Math.round(stars * 10 + 10); // 20 - 40 Coins
    setScore(prev => prev + xpReward);

    // Speak final celebration
    setTimeout(() => {
      try {
        audio.speak(`Wow! You found the way for the ${activeDetail.word}! Excellent work!`);
      } catch(e) {}
    }, 1200);

    // Continue to next letter automatically after 4 seconds OR trigger final finishing
    setTimeout(() => {
      const allLetterKeys = Object.keys(ALPHABET_DATA);
      const currentIndex = allLetterKeys.indexOf(activeLetter);
      if (currentIndex < allLetterKeys.length - 1) {
        // Shift to next letter
        const nextLetter = allLetterKeys[currentIndex + 1];
        setActiveLetter(nextLetter);
      } else {
        // Complete the collection cycle
        onFinish(score + xpReward, Math.round(score / 3 + 30));
      }
    }, 4000);
  };

  // Support responsive mobile drag-drawing
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDrawing) return;
    const touch = e.touches[0];
    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    if (element) {
      const coordAttr = element.getAttribute('data-coord');
      if (coordAttr) {
        const [r, c] = coordAttr.split(',').map(Number);
        handleCellInteract(r, c);
      }
    }
  };

  // Draw connecting pathways (felt-tip green/red highlights) between cells
  const renderPathways = () => {
    if (Object.keys(cellCenters).length === 0) return null;

    const pathList: React.ReactNode[] = [];

    // 1. Draw correct connected path segments
    for (let i = 0; i < solvedPath.length - 1; i++) {
      const [r1, c1] = solvedPath[i];
      const [r2, c2] = solvedPath[i + 1];
      const p1 = cellCenters[`${r1},${c1}`];
      const p2 = cellCenters[`${r2},${c2}`];

      if (p1 && p2) {
        pathList.push(
          <g key={`solved-path-${i}`}>
            {/* Glowing translucent overlay */}
            <motion.line 
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              x1={p1.x}
              y1={p1.y}
              x2={p2.x}
              y2={p2.y}
              className="stroke-emerald-400 stroke-[18] opacity-35 stroke-linecap-round"
              style={{ strokeLinecap: 'round' }}
            />
            {/* Solid marker center line */}
            <motion.line 
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              x1={p1.x}
              y1={p1.y}
              x2={p2.x}
              y2={p2.y}
              className="stroke-emerald-500 stroke-[6]"
              style={{ strokeLinecap: 'round' }}
            />
          </g>
        );
      }
    }

    // 2. Draw active error mismatch line with gorgeous laser warning effect
    if (wrongCell) {
      const lastCorrect = solvedPath[solvedPath.length - 1];
      const p1 = cellCenters[`${lastCorrect[0]},${lastCorrect[1]}`];
      const p2 = cellCenters[`${wrongCell.r},${wrongCell.c}`];
      if (p1 && p2) {
        pathList.push(
          <g key="wrong-line">
            <line 
              x1={p1.x}
              y1={p1.y}
              x2={p2.x}
              y2={p2.y}
              className="stroke-rose-400 stroke-[14] opacity-55 animate-pulse"
              style={{ strokeLinecap: 'round' }}
            />
            <line 
              x1={p1.x}
              y1={p1.y}
              x2={p2.x}
              y2={p2.y}
              className="stroke-rose-500 stroke-[5]"
              style={{ strokeLinecap: 'round' }}
            />
          </g>
        );
      }
    }

    return pathList;
  };

  return (
    <div 
      id="letter-maze-game-root" 
      className="w-full max-w-5xl mx-auto bg-gradient-to-b from-[#eef2f3] to-[#e4e8eb] min-h-screen flex flex-col md:flex-row gap-6 p-4 font-sans text-slate-800"
    >
      {/* LEFT COLUMN: Letter Selector Rail (List of 26 letters with score metrics) */}
      <div className="w-full md:w-56 shrink-0 bg-white rounded-3xl p-4 shadow-md border-2 border-slate-200/60 flex flex-col h-[220px] md:h-[84vh] shrink-0">
        <div className="flex items-center justify-between mb-3 shrink-0">
          <button 
            id="btn-close-maze"
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-xl transition-all text-slate-600 active:scale-95 border border-slate-200 flex items-center gap-1.5"
            title="返回游戏大厅"
          >
            <ChevronLeft size={16} />
            <span className="text-xs font-black">返回</span>
          </button>
          
          <button 
            id="btn-how"
            onClick={() => {
              audio.playClick();
              setShowHowToPlay(true);
            }}
            className="p-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-xl transition-all text-xs font-black flex items-center gap-1"
          >
            <HelpCircle size={14} />
            帮助
          </button>
        </div>

        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 px-1.5 shrink-0 hidden md:block">
          📚 所有字母关卡 (A-Z)
        </h3>

        {/* Scrollable Letter Catalog Cards */}
        <div className="flex-1 overflow-x-auto md:overflow-y-auto flex md:flex-col gap-2 pb-2 pr-1 scrollbar-thin select-none">
          {Object.keys(ALPHABET_DATA).map(letter => {
            const isCompleted = activeLetter !== letter && activeLetter.charCodeAt(0) > letter.charCodeAt(0);
            const isCurrent = activeLetter === letter;

            return (
              <button
                key={letter}
                id={`btn-letter-${letter}`}
                onClick={() => {
                  audio.playClick();
                  setActiveLetter(letter);
                }}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-left border-b-4 transition-all shrink-0 md:w-full ${
                  isCurrent
                    ? 'bg-emerald-500 text-white border-b-emerald-700 shadow-md scale-102 ring-2 ring-emerald-200'
                    : isCompleted
                      ? 'bg-emerald-50 text-emerald-800 border-slate-200 hover:bg-emerald-100 border-b-emerald-200'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 border-b-slate-300'
                }`}
              >
                <span className="text-xl font-black font-mono">{letter}{letter.toLowerCase()}</span>
                <span className="text-sm shrink-0 font-bold hidden md:inline ml-auto opacity-90">
                  {isCompleted ? '⭐ 3' : isCurrent ? '进行中' : '待解锁'}
                </span>
                <span className="text-base select-none">{ALPHABET_DATA[letter].emoji}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* RIGHT COLUMN / CENTER: Active Letter Pathfinder Worksheet Grid */}
      <div className="flex-1 flex flex-col space-y-2.5">
        {/* Dynamic Head Stat Indicators */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white py-2.5 px-4 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 shadow-xs">
              <Trophy size={18} />
            </div>
            <div className="text-left">
              <span className="text-[10px] font-black text-slate-400 block uppercase tracking-wider">魔法积分</span>
              <span className="text-lg font-black text-indigo-600 font-mono">{score} XP</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500 shadow-xs">
              <Star size={18} className="fill-amber-400" />
            </div>
            <div className="text-left">
              <span className="text-[10px] font-black text-slate-400 block uppercase tracking-wider">挑战星级</span>
              <div className="flex items-center gap-0.5 mt-0.5">
                {[...Array(3)].map((_, i) => (
                  <Star 
                    key={i} 
                    size={16} 
                    className={i < Math.ceil(stars) ? "fill-amber-400 text-amber-400" : "text-slate-200"} 
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="reset-current-maze"
              onClick={() => {
                audio.playClick();
                initLevelForLetter(activeLetter);
              }}
              className="p-2 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all border border-slate-200 text-slate-600 active:scale-95 flex items-center justify-center"
              title="重新加载当前迷宫"
            >
              <RefreshCw size={14} />
            </button>
          </div>
        </div>

        {/* PRIMARY WORKSHEET CARD */}
        <div className="bg-[#FAF8F5] border-4 border-dotted border-slate-400/90 rounded-[36px] shadow-lg p-4 sm:p-5 relative overflow-hidden flex flex-col pb-6">
          
          {/* Top Background Notebook lines design */}
          <div className="absolute top-0 inset-x-0 h-4 bg-gradient-to-b from-sky-100/40 to-transparent" />

          {/* Worksheet Header Box */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center border-b-[3px] border-dashed border-slate-300 pb-3.5 z-10">
            {/* Display "Aa" mascot card */}
            <div className="sm:col-span-5 flex items-center gap-4 text-left">
              <div className="text-5xl sm:text-6xl font-black font-serif tracking-tight text-slate-800 relative select-none">
                {activeDetail.upper}
                <span className="text-4xl text-slate-600 font-normal">{activeDetail.lower}</span>
                <span className="absolute -top-3 -right-3 text-sm font-sans px-1.5 py-0.5 bg-emerald-500 text-white font-black rounded-lg uppercase tracking-widest shadow-xs">
                  LEVEL
                </span>
              </div>
              <div className="h-10 w-[2px] bg-slate-300 rounded-full" />
              <div className="text-left">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">连线追踪</p>
                <p className="text-xs font-bold text-slate-600 leading-relaxed">
                  让大小写 <span className="font-black text-emerald-600 font-mono">{activeDetail.upper}{activeDetail.lower}</span> 铺满林间小道！
                </p>
              </div>
            </div>

            {/* Vocab mascot cartoon block */}
            <div className="sm:col-span-7 flex items-center sm:justify-end gap-3.5 bg-white/70 border-2 border-slate-200 p-3.5 rounded-2xl shadow-xs">
              <span className="text-4xl select-none filter drop-shadow-sm shrink-0 animate-bounce">
                {activeDetail.emoji}
              </span>
              <div className="text-left shrink-0">
                <span className="text-[9px] font-black tracking-widest text-[#0e835c] uppercase bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded-md block w-fit">
                  {activeDetail.phrase}
                </span>
                <h2 className="text-xl font-extrabold text-[#0d3b2c] mt-0.5 capitalize font-mono leading-none flex items-center gap-1.5">
                  <span>{activeDetail.word}</span>
                  <span className="text-sm font-semibold text-slate-500 font-sans">({activeDetail.translation})</span>
                </h2>
              </div>
              <button 
                id={`btn-pronounce-${activeLetter}`}
                onClick={() => {
                  try {
                    audio.speak(`${activeDetail.word}`);
                  } catch (e) {}
                }}
                className="p-2.5 bg-emerald-500 hover:bg-emerald-600 rounded-xl text-white transition-all ml-auto hover:scale-105 active:scale-95"
                title={`标准发音: ${activeDetail.word}`}
              >
                <Volume2 size={16} />
              </button>
            </div>
          </div>

          {/* Guidelines instruction banner */}
          <div className="flex items-center gap-2 text-left my-2 text-slate-500 text-[11px] font-bold px-1.5 py-0.5 z-10 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
            <span>玩法指南：从左上角 ⬇️ 红色箭头开始，用手指拖动或逐个点击毗邻的 {activeLetter}/{activeLetter.toLowerCase()} 字符，铺成连贯小路直至右下角 exit ➡️ 出口！</span>
          </div>

          {/* INTERACTIVE 7X7 LETTER MAZE CONTAINER */}
          <div className="flex-1 flex justify-center items-center py-4 relative z-10">
            <div 
              ref={gridRef}
              className="relative aspect-square w-full max-w-[430px] bg-white border-[3.5px] border-slate-700/80 rounded-3xl p-5 shadow-inner touch-none"
              onMouseDown={() => setIsDrawing(true)}
              onMouseUp={() => setIsDrawing(false)}
              onMouseLeave={() => setIsDrawing(false)}
              onTouchStart={() => setIsDrawing(true)}
              onTouchEnd={() => setIsDrawing(false)}
              onTouchCancel={() => setIsDrawing(false)}
              onTouchMove={handleTouchMove}
            >
              {/* Entrance pointing arrow icon (Row 0, Col 0) */}
              <div className="absolute -top-11 left-7 sm:left-9 flex flex-col items-center z-30 select-none animate-bounce pointer-events-none">
                <span className="text-xs font-black text-rose-500 opacity-90 uppercase bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded-full scale-90 mb-0.5 shadow-sm">
                  START
                </span>
                <span className="text-2xl text-rose-500">⬇️</span>
              </div>

              {/* Exit escape pointer arrow icon (Row 6, Col 6) */}
              <div className="absolute -bottom-1 left-[84%] sm:left-[86%] flex flex-col items-center z-30 select-none animate-pulse pointer-events-none">
                <span className="text-xs font-black text-emerald-600 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full scale-90 mb-0.5 shadow-sm">
                  EXIT
                </span>
                <span className="text-2xl text-emerald-500">⬇️</span>
              </div>

              {/* SVG Connector path highlighters layer */}
              <svg 
                className="absolute inset-0 w-full h-full pointer-events-none z-10"
                style={{ width: '100%', height: '100%' }}
              >
                {renderPathways()}
              </svg>

              {/* 7x7 Grid grid */}
              <div className="w-full h-full grid grid-cols-7 grid-rows-7 gap-1.5 sm:gap-2 relative z-20">
                {grid.map((row, r) => 
                  row.map((char, c) => {
                    const isSolved = solvedPath.some(([sr, sc]) => sr === r && sc === c);
                    const isCurrentTip = solvedPath[solvedPath.length - 1][0] === r && solvedPath[solvedPath.length - 1][1] === c;
                    const isFailed = wrongCell?.r === r && wrongCell?.c === c;
                    const customFont = fontStylesGrid[r]?.[c] || 'font-sans font-bold';

                    return (
                      <div
                        key={`cell-${r}-${c}`}
                        id={`cell-${r}-${c}`}
                        data-coord={`${r},${c}`}
                        onMouseEnter={() => isDrawing && handleCellInteract(r, c)}
                        onMouseDown={() => {
                          lastPronouncedCellRef.current = null;
                          handleCellInteract(r, c);
                        }}
                        onTouchStart={() => {
                          lastPronouncedCellRef.current = null;
                          handleCellInteract(r, c);
                        }}
                        className={`aspect-square w-full rounded-full border-2 flex items-center justify-center transition-all duration-300 relative select-none cursor-pointer text-base sm:text-lg ${
                          isSolved
                            ? isCurrentTip
                              ? 'bg-emerald-400 border-emerald-600 text-white font-extrabold shadow-md scale-108 ring-2 ring-emerald-200 animate-pulse'
                              : 'bg-emerald-100 border-emerald-500 text-emerald-700 font-bold scale-102 font-mono'
                            : isFailed
                              ? 'bg-rose-100 border-rose-500 text-rose-700 font-extrabold animate-shake scale-105 shadow-sm shadow-rose-300'
                              : 'bg-slate-50 border-slate-350 hover:bg-slate-100 font-normal hover:scale-102 active:scale-95 text-slate-750'
                        }`}
                      >
                        <span 
                          data-coord={`${r},${c}`} 
                          className={`${customFont} pointer-events-none select-none`}
                        >
                          {char}
                        </span>

                        {/* Little pulsing orb shown on the active tip cell */}
                        {isCurrentTip && (
                          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 border border-white animate-ping" />
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Letter unlock information display bar */}
          <div className="mt-2 text-center text-xs text-slate-450 z-10 px-4">
            <span className="inline-flex items-center gap-1 bg-slate-100 border border-slate-200 text-slate-600 font-black px-3 py-1 rounded-full uppercase tracking-widest scale-95">
              💡 已经连接 {solvedPath.length} / {activePath.length} 步
            </span>
          </div>

        </div>
      </div>

      {/* HOW TO PLAY INSTRUCTIONS DIALOG MODAL */}
      <AnimatePresence>
        {showHowToPlay && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[150] flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white rounded-[32px] border-[4px] border-emerald-500 shadow-2xl p-6 relative w-full max-w-md flex flex-col space-y-4"
            >
              <div className="text-center">
                <span className="text-4xl filter drop-shadow">🐊</span>
                <h3 className="text-2xl font-black text-slate-800 mt-2">开心字母迷宫寻路！</h3>
                <p className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mt-1">
                  Alphabet Maze Pathfinder Instructions
                </p>
              </div>

              <div className="bg-emerald-50 p-4 rounded-2xl font-bold text-slate-700 text-xs text-left leading-relaxed space-y-2.5 border border-emerald-100">
                <p className="flex items-center gap-1.5 text-emerald-800 font-black text-sm">
                  <CheckCircle size={15} className="text-emerald-600" />
                  <span>核心玩法大剖析</span>
                </p>
                <div className="pl-4 space-y-1.5 text-slate-600 text-[11px] font-semibold leading-relaxed">
                  <p>1. 找出顶部指引中的大写字母和小写字母（比如大写 A 和小写 a）。</p>
                  <p>2. 从标有 <span className="text-rose-500 font-extrabold">START ⬇️</span> 的左上角圆形泡泡出发。</p>
                  <p>3. 可以用手指/鼠标<span className="text-indigo-600 font-bold">按住拖拽连线</span>或者<span className="text-indigo-600 font-bold">依次点击</span>相邻的目标字母。</p>
                  <p>4. 连对会画出<span className="text-emerald-600 font-bold">漂亮的绿色粉笔线 🟢</span>并带发音指导。</p>
                  <p>5. 连错则会有<span className="text-rose-500 font-bold">醒目的红线警告 🔴</span>，助你及时修正！</p>
                </div>
              </div>

              <button 
                id="btn-close-how"
                onClick={() => {
                  try { audio.playClick(); } catch(e){}
                  setShowHowToPlay(false);
                }}
                className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-sm rounded-2xl border-b-4 border-emerald-700 transition-all hover:scale-101 active:scale-[0.98]"
              >
                我知道了，马上开启寻路魔法！
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default LetterLinkGame;
