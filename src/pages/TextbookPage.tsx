import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, MapPin, Sparkles, Volume2, ArrowLeft, ArrowRight, Compass, ChevronRight, GraduationCap, CheckCircle, Mic, Award, RotateCcw, Check, RotateCw, X, Play, RefreshCw, Zap, ChevronDown, ChevronUp } from 'lucide-react';
import { ViewState, UserStats } from '../types';
import { ALL_CARDS } from '../constants';
import { TEXTBOOK_STAGES, TextbookVersion, TextbookBook, TextbookUnit, TextbookWord } from '../data/TextbookData';
import audio from '../utils/AudioUtils';
import VoiceDubbing from '../components/VoiceDubbing';

// Utility helper functions to support clean localized unit sequences
const getUnitOrdinal = (uIdx: number): string => {
  const ordinals = ["第一单元", "第二单元", "第三单元", "第四单元", "第五单元", "第六单元", "第七单元", "第八单元", "第九单元", "第十单元"];
  return ordinals[uIdx] || `第 ${uIdx + 1} 单元`;
};

const getUnitIndex = (unitId: string): number => {
  const match = unitId.match(/u(\d+)/i);
  return match ? parseInt(match[1], 10) : 1;
};

interface TextbookPageProps {
  stats: UserStats;
  onNavigate: (view: ViewState) => void;
  onQuestClick: (view: ViewState, isReview?: boolean, levelId?: number, cardId?: string) => void;
  onClose: () => void;
}

export default function TextbookPage({ stats, onNavigate, onQuestClick, onClose }: TextbookPageProps) {
  const [selectedStageId, setSelectedStageId] = useState<'primary' | 'junior' | 'senior'>('primary');
  const [selectedVersionId, setSelectedVersionId] = useState<string>('');
  const [selectedBookId, setSelectedBookId] = useState<string>('');
  const [selectedUnitId, setSelectedUnitId] = useState<string>('');
  const [isMobileDetailOpen, setIsMobileDetailOpen] = useState<boolean>(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [isBookDropdownOpen, setIsBookDropdownOpen] = useState<boolean>(false);
  const [activeChantFlow, setActiveChantFlow] = useState<{
    word: TextbookWord;
    unit: TextbookUnit;
    step: 'chant' | 'shadow' | 'practice';
    isRecording?: boolean;
    userScore?: number | null;
    practiceAnswered?: boolean;
    practiceCorrect?: boolean;
    selectedOptionIdx?: number | null;
  } | null>(null);

  const [isChantFlipped, setIsChantFlipped] = useState(false);
  const [globalReveal, setGlobalReveal] = useState(false);
  const [revealedWords, setRevealedWords] = useState<Record<string, boolean>>({});

  // Reset chant state when activeChantFlow changes or is started
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState<number>(0);
  const [speltLetters, setSpeltLetters] = useState<string[]>([]);
  const [shuffledLetters, setShuffledLetters] = useState<{ id: string; char: string; used: boolean }[]>([]);
  const [practiceAnsweredArray, setPracticeAnsweredArray] = useState<boolean[]>([]);
  const [practiceCorrectArray, setPracticeCorrectArray] = useState<boolean[]>([]);
  const [selectedOptionsArray, setSelectedOptionsArray] = useState<(number | null)[]>([]);

  React.useEffect(() => {
    setIsChantFlipped(false);
    setGlobalReveal(false);
    setRevealedWords({});
    
    // Explicitly reset multi-phase practices
    setCurrentQuestionIdx(0);
    setSpeltLetters([]);
    setShuffledLetters([]);
  }, [activeChantFlow?.word?.english]);

  const getRhymeFontSize = (rhyme: string) => {
    const lines = rhyme.split(/[,，.。!！?？]/).filter(l => l.trim());
    const maxLength = Math.max(...lines.map(l => l.length));
    if (maxLength > 20) return 'text-xs sm:text-sm';
    if (maxLength > 16) return 'text-sm sm:text-base';
    if (maxLength > 12) return 'text-base sm:text-lg';
    return 'text-lg sm:text-xl';
  };

  const renderSanzijingLine = (line: string, suffix: string = '') => {
    // Regex matches any English word optionally followed by translation inside parenthesis
    const regex = /([a-zA-Z]+)\s*([（(][^）)]+[）)])?/g;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(line)) !== null) {
      if (match.index > lastIndex) {
        parts.push(
          <span key={`text-${lastIndex}`} className={`${isChantFlipped ? 'text-white' : 'text-slate-800'} font-black text-xl md:text-2xl tracking-wide ${isChantFlipped ? 'drop-shadow-sm' : ''}`}>
            {line.substring(lastIndex, match.index)}
          </span>
        );
      }

      const englishWord = match[1];
      const translation = match[2] || '';

      const renderWordPart = () => {
        if (!suffix) {
          return <span className={isChantFlipped ? "text-amber-300 font-black" : "text-indigo-600 font-black"}>{englishWord}</span>;
        }
        
        const lowerWord = englishWord.toLowerCase();
        const lowerSuffix = suffix.toLowerCase();
        
        if (lowerWord.endsWith(lowerSuffix)) {
          const rootLen = englishWord.length - suffix.length;
          const root = englishWord.substring(0, rootLen);
          const endPart = englishWord.substring(rootLen);
          return (
            <span className="font-black text-2xl md:text-3xl tracking-normal scale-105 inline-block">
              <span className={isChantFlipped ? "text-amber-300 hover:text-amber-200 transition-colors" : "text-indigo-600 hover:text-indigo-500 transition-colors"}>{root}</span>
              <span className={isChantFlipped ? "text-red-400 hover:text-red-350 transition-colors" : "text-red-500 hover:text-red-450 transition-colors"}>{endPart}</span>
            </span>
          );
        } else if (lowerWord.includes(lowerSuffix)) {
          const idx = lowerWord.indexOf(lowerSuffix);
          const part1 = englishWord.substring(0, idx);
          const part2 = englishWord.substring(idx, idx + suffix.length);
          const part3 = englishWord.substring(idx + suffix.length);
          return (
            <span className="font-black text-2xl md:text-3xl tracking-normal scale-105 inline-block">
              <span className={isChantFlipped ? "text-amber-300 hover:text-amber-200 transition-colors" : "text-indigo-600 hover:text-indigo-500 transition-colors"}>{part1}</span>
              <span className={isChantFlipped ? "text-red-400 hover:text-red-350 transition-colors" : "text-red-500 hover:text-red-450 transition-colors"}>{part2}</span>
              {part3 && <span className={isChantFlipped ? "text-amber-300 hover:text-amber-200 transition-colors" : "text-indigo-600 hover:text-indigo-500 transition-colors"}>{part3}</span>}
            </span>
          );
        }
        
        return <span className={isChantFlipped ? "text-amber-300 font-black text-2xl md:text-3xl tracking-normal scale-105 inline-block" : "text-indigo-600 font-black text-2xl md:text-3xl tracking-normal scale-105 inline-block"}>{englishWord}</span>;
      };

      const isWordRevealed = !isChantFlipped || globalReveal || !!revealedWords[englishWord.toLowerCase()];

      parts.push(
        <span 
          key={`word-${match.index}`}
          onClick={(e) => {
            e.stopPropagation();
            try { audio.playPop(); } catch (e){}
            audio.speak(englishWord);
            if (isChantFlipped) {
              setRevealedWords(prev => ({
                ...prev,
                [englishWord.toLowerCase()]: !prev[englishWord.toLowerCase()]
              }));
            }
          }}
          className={`cursor-pointer transition-all duration-300 mx-1 px-3 py-0.5 rounded-xl border-2 select-none inline-flex items-center ${
            !isChantFlipped 
              ? 'bg-transparent border-transparent hover:scale-110 active:scale-95' 
              : isWordRevealed
                ? 'bg-white/10 border-white/20 hover:scale-110 active:scale-95'
                : 'bg-amber-400/10 border-dashed border-amber-400/40 hover:bg-amber-400/20 hover:scale-105 active:scale-95'
          }`}
          title={!isChantFlipped ? "点击发音" : isWordRevealed ? "点击发音 / 再次挖空" : "点击揭晓并朗读单词"}
        >
          {isWordRevealed ? (
            <motion.span
              key="revealed"
              initial={isChantFlipped ? { scale: 0.8, opacity: 0 } : false}
              animate={isChantFlipped ? { scale: 1, opacity: 1 } : false}
              transition={{ type: 'spring', stiffness: 300, damping: 15 }}
            >
              {renderWordPart()}
            </motion.span>
          ) : (
            <span key="blank" className="text-amber-300/80 tracking-wide font-black text-xl md:text-2xl px-1">
              ____
            </span>
          )}
          {translation && (
            <span className={`${isChantFlipped ? 'text-amber-100' : 'text-indigo-500'} font-black text-xl md:text-2xl ml-1 ${isChantFlipped ? 'drop-shadow-sm' : ''}`}>
              {translation}
            </span>
          )}
        </span>
      );

      lastIndex = regex.lastIndex;
    }

    if (lastIndex < line.length) {
      parts.push(<span key={`text-end`} className={`${isChantFlipped ? 'text-white' : 'text-slate-800'} font-black text-xl md:text-2xl`}>{line.substring(lastIndex)}</span>);
    }

    return parts.length > 0 ? parts : line;
  };

  // Find active data objects based on states safely
  const activeStage = useMemo(() => {
    return TEXTBOOK_STAGES.find(s => s.id === selectedStageId) || TEXTBOOK_STAGES[0];
  }, [selectedStageId]);

  // Set default version when stage changes
  React.useEffect(() => {
    if (activeStage.versions.length > 0) {
      setSelectedVersionId(activeStage.versions[0].id);
    }
  }, [selectedStageId, activeStage]);

  const activeVersion = useMemo(() => {
    return activeStage.versions.find(v => v.id === selectedVersionId) || activeStage.versions[0];
  }, [selectedVersionId, activeStage]);

  // Set default book when version changes
  React.useEffect(() => {
    if (activeVersion && activeVersion.books.length > 0) {
      setSelectedBookId(activeVersion.books[0].id);
    } else {
      setSelectedBookId('');
    }
  }, [selectedVersionId, activeVersion]);

  const activeBook = useMemo(() => {
    if (!activeVersion) return null;
    return activeVersion.books.find(b => b.id === selectedBookId) || activeVersion.books[0];
  }, [selectedBookId, activeVersion]);

  // Set default unit when book changes
  React.useEffect(() => {
    if (activeBook && activeBook.units.length > 0) {
      setSelectedUnitId(activeBook.units[0].id);
      setIsMobileDetailOpen(false); // Default to unit list on book/semester change
      setActiveChantFlow(null);
    } else {
      setSelectedUnitId('');
      setIsMobileDetailOpen(false);
      setActiveChantFlow(null);
    }
  }, [selectedBookId, activeBook]);

  // Reset chant flow when unit changes explicitly
  React.useEffect(() => {
    setActiveChantFlow(null);
  }, [selectedUnitId]);

  const activeUnit = useMemo(() => {
    if (!activeBook) return null;
    return activeBook.units.find(u => u.id === selectedUnitId) || activeBook.units[0];
  }, [selectedUnitId, activeBook]);

  const unitMappedRhymes = useMemo(() => {
    if (!activeUnit) return [];
    const rhymesSet = new Set<string>();
    const cardsList: { id: string; suffix: string; rhyme: string; words: string[] }[] = [];
    
    const isPrimaryTextbook = selectedStageId === 'primary';

    activeUnit.words.forEach(w => {
      const clean = w.english.toLowerCase().trim();
      let matched = undefined;

      if (isPrimaryTextbook) {
        // Primary textbook: ONLY map to PRIMARY ('pri_') cards (100% 1-to-1 match with PRIMARY)
        matched = ALL_CARDS.find(card => 
          card.id.startsWith('pri_') &&
          card.words.some(wordItem => wordItem.text.toLowerCase().trim() === clean)
        );
      } else {
        // Non-primary level textbook: try INTERMEDIATE first, then PRIMARY, and NEVER map to ADVANCED
        matched = ALL_CARDS.find(card => 
          card.id.startsWith('int_') &&
          card.words.some(wordItem => wordItem.text.toLowerCase().trim() === clean)
        );
        if (!matched) {
          matched = ALL_CARDS.find(card => 
            card.id.startsWith('pri_') &&
            card.words.some(wordItem => wordItem.text.toLowerCase().trim() === clean)
          );
        }
      }

      if (matched && matched.rhyme && !rhymesSet.has(matched.id)) {
        rhymesSet.add(matched.id);
        cardsList.push({
          id: matched.id,
          suffix: matched.suffix,
          rhyme: matched.rhyme,
          words: matched.words.map(mw => mw.text)
        });
      }
    });
    return cardsList;
  }, [activeUnit, activeBook, selectedStageId]);

  // Helper: Find matching Adventure Level mapping for a textbook word
  const getWordMapInfo = (englishWord: string) => {
    const clean = englishWord.toLowerCase().trim();
    const isPrimaryTextbook = selectedStageId === 'primary';

    let matchedCard = undefined;

    if (isPrimaryTextbook) {
      // Primary textbook: ONLY map to PRIMARY ('pri_') cards (100% 1-to-1 match with PRIMARY)
      matchedCard = ALL_CARDS.find(card => 
        card.id.startsWith('pri_') &&
        card.words.some(w => w.text.toLowerCase().trim() === clean)
      );
    } else {
      // Non-primary level textbook: try INTERMEDIATE first, then PRIMARY, and NEVER map to ADVANCED
      matchedCard = ALL_CARDS.find(card => 
        card.id.startsWith('int_') &&
        card.words.some(w => w.text.toLowerCase().trim() === clean)
      );
      if (!matchedCard) {
        matchedCard = ALL_CARDS.find(card => 
          card.id.startsWith('pri_') &&
          card.words.some(w => w.text.toLowerCase().trim() === clean)
        );
      }
    }

    if (!matchedCard) return null;

    const difficulty = matchedCard.difficulty || 'PRIMARY';
    const cardsOfDifficulty = ALL_CARDS.filter(c => (c.difficulty || 'PRIMARY') === difficulty);
    const cardIndex = cardsOfDifficulty.findIndex(c => c.id === matchedCard.id);

    if (cardIndex === -1) return null;

    const cardsPerDay = stats.cardsPerDay || 5;
    let offset = 0;
    if (difficulty === 'INTERMEDIATE') offset = 100;
    if (difficulty === 'ADVANCED') offset = 200;

    const relativeId = Math.floor(cardIndex / cardsPerDay) + 1;
    const levelId = offset + relativeId;

    return {
      cardId: matchedCard.id,
      cardTitle: matchedCard.levelName || `卡片 #${cardIndex + 1}`,
      suffix: matchedCard.suffix,
      levelId,
      difficulty,
      rhyme: matchedCard.rhyme
    };
  };

  const handleSpeak = (text: string) => {
    try {
      audio.speak(text);
    } catch (e) {
      console.warn('[TextbookSpeech] speak error:', e);
    }
  };

  const matchedSpellCard = useMemo(() => {
    if (!activeChantFlow) return null;
    const clean = activeChantFlow.word.english.toLowerCase().trim();
    const isPrimaryTextbook = selectedStageId === 'primary';

    let matched = undefined;

    if (isPrimaryTextbook) {
      // Primary textbook: ONLY map to PRIMARY ('pri_') cards (100% 1-to-1 match with PRIMARY)
      matched = ALL_CARDS.find(card => 
        card.id.startsWith('pri_') &&
        card.words.some(w => w.text.toLowerCase().trim() === clean)
      );
    } else {
      // Non-primary level textbook: try INTERMEDIATE first, then PRIMARY, and NEVER map to ADVANCED
      matched = ALL_CARDS.find(card => 
        card.id.startsWith('int_') &&
        card.words.some(w => w.text.toLowerCase().trim() === clean)
      );
      if (!matched) {
        matched = ALL_CARDS.find(card => 
          card.id.startsWith('pri_') &&
          card.words.some(w => w.text.toLowerCase().trim() === clean)
        );
      }
    }

    return matched;
  }, [activeChantFlow, activeBook, selectedStageId]);

  const chantGroupWords = useMemo(() => {
    if (!activeChantFlow) return [];
    if (matchedSpellCard) {
      return matchedSpellCard.words.map(w => ({
        english: w.text,
        chinese: w.translation,
        phonetic: '',
        imageUrl: w.imageUrl || ''
      }));
    }
    const mainWord = activeChantFlow.word;
    const others = activeChantFlow.unit.words.filter(w => w.english.toLowerCase() !== mainWord.english.toLowerCase());
    return [mainWord, ...others.slice(0, 2)];
  }, [matchedSpellCard, activeChantFlow]);

  const activeChantText = useMemo(() => {
    if (!activeChantFlow) return '';
    const { word } = activeChantFlow;
    const mapInfo = getWordMapInfo(word.english);
    if (mapInfo && mapInfo.rhyme) {
      return mapInfo.rhyme;
    }
    // Fallback: extract clause with this word from unit's rhythmicChant
    const unitChant = activeChantFlow.unit.rhythmicChant || '';
    const clauses = unitChant.split(/[，。？！、\s]+/).filter(Boolean);
    const targetClause = clauses.find(c => c.toLowerCase().includes(word.english.toLowerCase()));
    if (targetClause) return targetClause;
    return unitChant; // ultimate fallback
  }, [activeChantFlow, stats?.cardsPerDay]);

  interface PracticeQuestion {
    type: 'blank' | 'spell' | 'choice';
    title: string;
    instruction: string;
    questionText: string;
    hint?: string;
    options?: string[];
    correctIndex?: number;
    targetWord?: string;
    chinese?: string;
  }

  const practiceQuestions = useMemo(() => {
    if (!activeChantFlow) return [];
    const chant = activeChantText; // Matches the magic forest rhymes or unit chants
    
    const list: PracticeQuestion[] = [];
    
    chantGroupWords.forEach((gWord, gIdx) => {
      // QUESTION 1: 口诀完形填空 (看口诀选英文)
      const clauses = chant.split(/[,，.。!！?？]/).filter(s => s.trim());
      const matchedClause = clauses.find(c => c.toLowerCase().includes(gWord.english.toLowerCase())) || clauses[0] || '';
      
      const blankRegex = new RegExp(gWord.english, 'gi');
      const questionText1 = matchedClause.replace(blankRegex, ' ______ ');
      
      const otherWords = chantGroupWords
        .filter(w => w.english.toLowerCase() !== gWord.english.toLowerCase())
        .map(w => w.english);
        
      const options1 = [gWord.english];
      otherWords.forEach(o => {
        if (!options1.includes(o)) options1.push(o);
      });
      
      const fallbacks = ['nice', 'ear', 'hand', 'eye', 'smile', 'look', 'book', 'toy', 'name'];
      while (options1.length < 4) {
        const fb = fallbacks.pop();
        if (fb && !options1.includes(fb)) {
          options1.push(fb);
        }
      }
      const shuffledOptions1 = [...options1].sort(() => 0.5 - Math.random());
      const correctIndex1 = shuffledOptions1.indexOf(gWord.english);
      
      list.push({
        type: 'blank',
        title: `看口诀选英文 (${gWord.english})`,
        instruction: `看口诀选英文：请选出最适合填入下方三字经口诀空白处的正确单词！`,
        questionText: questionText1,
        options: shuffledOptions1,
        correctIndex: correctIndex1,
        targetWord: gWord.english,
        chinese: gWord.chinese
      });
      
      // QUESTION 2: 看中文写英文 (拼写拼图 / spelling constructor)
      list.push({
        type: 'spell',
        title: `看中文拼英文 (${gWord.english})`,
        instruction: `看中文拼英文：请通过点击下方字母，拼写出对应中文释义的英文单词！`,
        questionText: gWord.chinese,
        targetWord: gWord.english,
        chinese: gWord.chinese
      });
      
      // QUESTION 3: 词汇释义选择
      const options3 = [gWord.chinese];
      const otherChineses = chantGroupWords
        .filter(w => w.english.toLowerCase() !== gWord.english.toLowerCase())
        .map(w => w.chinese);
      otherChineses.forEach(c => {
        if (!options3.includes(c)) options3.push(c);
      });
      const fbChinese = ['好的', '耳朵', '手', '眼睛', '微笑', '玩具', '名字'];
      while (options3.length < 4) {
        const fb = fbChinese.pop();
        if (fb && !options3.includes(fb)) {
          options3.push(fb);
        }
      }
      const shuffledOptions3 = [...options3].sort(() => 0.5 - Math.random());
      const correctIndex3 = shuffledOptions3.indexOf(gWord.chinese);
      
      list.push({
        type: 'choice',
        title: `魔法释义抉择 (${gWord.english})`,
        instruction: `请选择单词「${gWord.english}」的正确中文释义：`,
        questionText: gWord.english,
        options: shuffledOptions3,
        correctIndex: correctIndex3,
        targetWord: gWord.english,
        chinese: gWord.chinese
      });
    });
    
    return list;
  }, [activeChantFlow, activeChantText, chantGroupWords]);

  React.useEffect(() => {
    if (practiceQuestions && practiceQuestions.length > 0) {
      setPracticeAnsweredArray(new Array(practiceQuestions.length).fill(false));
      setPracticeCorrectArray(new Array(practiceQuestions.length).fill(false));
      setSelectedOptionsArray(new Array(practiceQuestions.length).fill(null));
    } else {
      setPracticeAnsweredArray([]);
      setPracticeCorrectArray([]);
      setSelectedOptionsArray([]);
    }
  }, [practiceQuestions]);

  const initSpellingPuzzle = (targetWord: string) => {
    const chars = targetWord.toLowerCase().split('');
    const letters = chars.map((char, index) => ({
      id: `${char}-${index}`,
      char,
      used: false
    }));
    const shuffled = [...letters].sort(() => 0.5 - Math.random());
    setShuffledLetters(shuffled);
    setSpeltLetters([]);
  };

  React.useEffect(() => {
    if (activeChantFlow && practiceQuestions[currentQuestionIdx]) {
      const q = practiceQuestions[currentQuestionIdx];
      if (q.type === 'spell') {
        const target = q.targetWord || '';
        initSpellingPuzzle(target);
      } else {
        setSpeltLetters([]);
        setShuffledLetters([]);
      }
    }
  }, [activeChantFlow?.word?.english, currentQuestionIdx, practiceQuestions]);

  const handleSelectSpellingLetter = (letterItem: { id: string; char: string; used: boolean }) => {
    if (practiceAnsweredArray[currentQuestionIdx]) return;
    
    setShuffledLetters(prev => prev.map(item => item.id === letterItem.id ? { ...item, used: true } : item));
    
    const newSpelt = [...speltLetters, letterItem.char];
    setSpeltLetters(newSpelt);
    
    const target = (practiceQuestions[currentQuestionIdx]?.targetWord || '').toLowerCase();
    if (newSpelt.length === target.length) {
      const speltStr = newSpelt.join('').toLowerCase();
      const isCorrect = speltStr === target;
      
      const nextAnswered = [...practiceAnsweredArray];
      const nextCorrect = [...practiceCorrectArray];
      nextAnswered[currentQuestionIdx] = true;
      nextCorrect[currentQuestionIdx] = isCorrect;
      
      setPracticeAnsweredArray(nextAnswered);
      setPracticeCorrectArray(nextCorrect);
      
      if (isCorrect) {
        try { audio.playSuccess(); } catch (e) {}
      } else {
        try { audio.playError(); } catch (e) {}
      }
    } else {
      try { audio.playPop(); } catch (e) {}
    }
  };

  const handleResetSpelling = () => {
    setSpeltLetters([]);
    setShuffledLetters(prev => prev.map(item => ({ ...item, used: false })));
    const nextAnswered = [...practiceAnsweredArray];
    const nextCorrect = [...practiceCorrectArray];
    nextAnswered[currentQuestionIdx] = false;
    nextCorrect[currentQuestionIdx] = false;
    setPracticeAnsweredArray(nextAnswered);
    setPracticeCorrectArray(nextCorrect);
  };

  const handleSelectMultipleChoiceOption = (idx: number) => {
    if (practiceAnsweredArray[currentQuestionIdx]) return;
    
    const question = practiceQuestions[currentQuestionIdx];
    if (!question) return;
    
    const isCorrect = idx === question.correctIndex;
    
    const nextAnswered = [...practiceAnsweredArray];
    const nextCorrect = [...practiceCorrectArray];
    const nextSelected = [...selectedOptionsArray];
    
    nextAnswered[currentQuestionIdx] = true;
    nextCorrect[currentQuestionIdx] = isCorrect;
    nextSelected[currentQuestionIdx] = idx;
    
    setPracticeAnsweredArray(nextAnswered);
    setPracticeCorrectArray(nextCorrect);
    setSelectedOptionsArray(nextSelected);
    
    if (isCorrect) {
      try { audio.playSuccess(); } catch (e) {}
    } else {
      try { audio.playError(); } catch (e) {}
    }
  };

  const handleStartChantFlow = (word: TextbookWord) => {
    if (!activeUnit) return;
    try { audio.playClick(); } catch (e) {}
    setActiveChantFlow({
      word,
      unit: activeUnit,
      step: 'chant',
      isRecording: false,
      userScore: null,
      practiceAnswered: false,
      practiceCorrect: false,
      selectedOptionIdx: null
    });
  };

  const handleSimulateRecord = () => {
    if (!activeChantFlow) return;
    setActiveChantFlow(prev => prev ? { ...prev, isRecording: true, userScore: null } : null);
    try { audio.speak(activeChantFlow.word.english); } catch (e) {}
    
    setTimeout(() => {
      const randomScore = Math.floor(Math.random() * 8) + 92; // 92-99 score
      try { audio.playSuccess(); } catch(e){}
      setActiveChantFlow(prev => prev ? { 
        ...prev, 
        isRecording: false, 
        userScore: randomScore 
      } : null);
    }, 2000);
  };

  const handleJumpToCard = (difficulty: string, levelId: number, cardId: string) => {
    try {
      try { audio.playClick(); } catch (e) {}
      localStorage.setItem('selected_adventure_difficulty', difficulty);
      onQuestClick('ADVENTURE', false, levelId, cardId);
    } catch (e) {
      console.warn('[TextbookPage] Jump reference fail:', e);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#eefaf2] via-white to-[#f0f9f3] text-slate-800 pb-16 font-sans">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 text-white shadow-md border-b-4 border-emerald-700/30">
        <div className="max-w-4xl mx-auto px-4 h-16 sm:h-20 flex items-center justify-between">
          <button 
            onClick={onClose}
            className="flex items-center gap-1.5 bg-white/12 hover:bg-white/20 text-white font-black text-xs sm:text-base px-4 py-2 rounded-full transition-all cursor-pointer select-none active:scale-95 shadow-sm"
          >
            <ArrowLeft size={16} className="stroke-[3]" />
            <span>返回大厅</span>
          </button>
          
          <div className="flex items-center gap-2.5">
            <span className="text-2xl sm:text-3xl">🎒</span>
            <h1 className="font-sans font-black text-lg sm:text-2xl tracking-normal text-shadow-sm">同步仙境馆</h1>
          </div>

          <div className="flex items-center gap-2 bg-yellow-400/20 px-3.5 py-1.5 rounded-full border border-yellow-300/30">
            <span className="text-xs sm:text-sm font-black text-yellow-300">同步教材口诀</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-5 sm:mt-8">
        <AnimatePresence mode="wait">
          {activeChantFlow ? (
            /* 🧙‍♂️ COMPLETE IMMERSIVE FULL-WIDTH CHANT LEARNING SUBFLOW WIZARD (魔法森林形式，不嵌在单词表列中) */
            <motion.div
              key={`chant-flow-${activeChantFlow.word.english}`}
              initial={{ opacity: 0, scale: 0.98, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: -15 }}
              transition={{ duration: 0.25 }}
              className="bg-white rounded-[32px] border border-slate-200/90 p-6 sm:p-10 shadow-[0_32px_64px_-12px_rgba(6,78,59,0.08)] space-y-6 sm:space-y-8 text-left"
            >
              {/* Wizard Header Banner */}
              <div className="flex items-center justify-between pb-5 border-b border-indigo-100/50 flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-13 h-13 rounded-2xl bg-amber-100 flex items-center justify-center text-2xl shadow-sm">
                    🧙‍♂️
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-amber-800 uppercase tracking-widest block leading-none">同步口诀特训口诀</span>
                    <h2 className="font-sans font-black text-slate-800 text-lg sm:text-2xl mt-1 leading-none">
                      特训单词: <span className="text-emerald-600 font-sans font-black text-xl sm:text-2xl">{activeChantFlow.word.english}</span>
                    </h2>
                  </div>
                </div>
                
                {/* Step Indicator Progress Pills */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-xs font-black px-2.5 py-1.5 rounded-full transition-all ${
                    activeChantFlow.step === 'chant' ? 'bg-amber-100 text-amber-800 ring-2 ring-amber-400/40 font-bold' : 'bg-slate-50 text-slate-400'
                  }`}>
                    1. 读一读
                  </span>
                  <span className="text-slate-300 text-xs">➔</span>
                  <span className={`text-xs font-black px-2.5 py-1.5 rounded-full transition-all ${
                    activeChantFlow.step === 'shadow' ? 'bg-emerald-100 text-emerald-800 ring-2 ring-emerald-400/40 font-bold' : 'bg-slate-50 text-slate-400'
                  }`}>
                    2. 跟跟读
                  </span>
                  <span className="text-slate-300 text-xs">➔</span>
                  <span className={`text-xs font-black px-2.5 py-1.5 rounded-full transition-all ${
                    activeChantFlow.step === 'practice' ? 'bg-indigo-100 text-indigo-800 ring-2 ring-indigo-400/40 font-bold' : 'bg-slate-50 text-slate-400'
                  }`}>
                    3. 练一练
                  </span>
                </div>
              </div>

              {/* STEP 1: 'chant' (可以看到三字经 - 3D Flippable card design) */}
              {activeChantFlow.step === 'chant' && (
                <div className="space-y-6">
                  {/* Top instruction box matching Magic Forest */}
                  <div className="flex justify-between items-center bg-indigo-50/55 p-4 rounded-2xl border border-indigo-150/60 gap-4">
                    <div>
                      <h3 className="font-sans font-black text-indigo-900 text-sm sm:text-base flex items-center gap-1.5 leading-none">
                        <span>📜</span>
                        <span>第一步：阅读并体悟三字经口诀</span>
                      </h3>
                      <p className="text-xs text-slate-500 mt-1.5 leading-normal">
                        请大声朗读，感悟单词拼写与语义的妙配。点击卡片或点击「自测三字经」进入背诵挖空自测模式！
                      </p>
                    </div>
                  </div>

                  {/* The 3D dual-sided flip card */}
                  <div className="w-full perspective-1000 min-h-[390px] flex flex-col items-center relative z-20">
                    <motion.div 
                      className="relative w-full h-[360px] preserve-3d cursor-pointer rounded-[36px]"
                      animate={{ rotateY: isChantFlipped ? 180 : 0 }}
                      whileHover={isChantFlipped ? {} : {
                        y: -6,
                        scale: 1.01,
                        boxShadow: "0 25px 50px -12px rgba(99, 102, 241, 0.12)"
                      }}
                      transition={{ 
                        rotateY: { duration: 0.8, ease: [0.34, 1.56, 0.64, 1] },
                        y: { type: "spring", stiffness: 200, damping: 15 },
                        scale: { type: "spring", stiffness: 200, damping: 15 },
                        boxShadow: { duration: 0.3 }
                      }}
                      onClick={() => {
                        setIsChantFlipped(!isChantFlipped);
                        try { audio.playClick(); } catch(e){}
                      }}
                    >
                      {/* Front Side: Normal Rhyme */}
                      <div 
                        className="absolute inset-0 bg-[#f8fafc] border-2 border-slate-100/70 p-6 sm:p-8 rounded-[36px] w-full h-full flex flex-col justify-between shadow-md"
                        style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
                      >
                        <div className="flex justify-between items-center w-full mb-2" onClick={(e) => e.stopPropagation()}>
                          <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                            📖 口诀背诵
                          </span>
                          
                          <div className="flex flex-col items-end space-y-1">
                            <motion.button 
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={(e) => {
                                  e.stopPropagation();
                                  setIsChantFlipped(true);
                                  try { audio.playClick(); } catch(err){}
                              }}
                              className="px-3.5 py-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white rounded-xl font-black text-[11px] tracking-wider shadow-md flex items-center space-x-1 outline-none border border-indigo-400/40 cursor-pointer"
                              title="切换到三字经自测"
                            >
                              <RotateCw size={12} className="animate-spin-slow" />
                              <span>🔮 自测三字经</span>
                            </motion.button>
                          </div>
                        </div>

                        <div className="flex-1 flex flex-col justify-center my-4 overflow-y-auto">
                          <div className="space-y-3.5 w-full justify-center flex flex-col items-center">
                            {(activeChantText || '').split(/[,，.。!！?？]/).filter(s => s.trim()).map((line, idx) => (
                              <div key={idx} className="flex flex-row flex-nowrap whitespace-nowrap justify-center items-center font-black text-center leading-relaxed tracking-wide text-slate-800 text-xl sm:text-2xl">
                                {renderSanzijingLine(line, matchedSpellCard?.suffix || activeChantFlow.word.english)}
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="pt-2 flex flex-col items-center justify-center border-t border-slate-100/50 space-y-1.5" onClick={(e) => e.stopPropagation()}>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                              try { audio.playClick(); } catch(e){}
                              audio.speak(activeChantText || '');
                            }}
                            className="px-5 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 font-extrabold text-[11px] flex items-center space-x-1.5 shadow-sm hover:bg-indigo-100 transition-colors cursor-pointer"
                          >
                            <Volume2 size={13} className="text-indigo-500 animate-pulse" />
                            <span>聆听整句英文三字经 Chanting!</span>
                          </motion.button>
                          <span className="text-[9px] font-bold text-slate-400">点击空白或右上角按钮翻转进行自测</span>
                        </div>
                      </div>

                      {/* Back Side: Self-test Rhyme (Blanked) */}
                      <div 
                        className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 border-2 border-white/20 p-6 sm:p-8 rounded-[36px] w-full h-full flex flex-col justify-between shadow-2xl"
                        style={{ transform: 'rotateY(180deg)', backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
                      >
                        <div className="flex justify-between items-center w-full mb-2" onClick={(e) => e.stopPropagation()}>
                          <span className="text-[10px] font-black text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                            🎯 挖空自测中
                          </span>
                          
                          <div className="flex items-center space-x-1.5">
                            <motion.button 
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => {
                                try { audio.playPop(); } catch(e){}
                                setGlobalReveal(!globalReveal);
                              }}
                              className={`px-2.5 py-1 rounded-xl border text-[10px] font-black flex items-center space-x-1 shadow-sm cursor-pointer ${
                                globalReveal 
                                  ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-lg scale-105'
                                  : 'bg-white/10 text-white border-white/15 hover:bg-white/20'
                              }`}
                            >
                              <span>{globalReveal ? '🙈 隐藏答案' : '👁️ 显示答案'}</span>
                            </motion.button>

                            <motion.button 
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => {
                                setIsChantFlipped(false);
                                try { audio.playClick(); } catch(e){}
                              }}
                              className="p-1 px-2.5 bg-white/10 text-white hover:bg-white/25 border border-white/15 rounded-xl text-[10px] font-black flex items-center space-x-1 cursor-pointer"
                              title="返回正面"
                            >
                              <RotateCw size={10} className="animate-spin-slow" />
                              <span>正面</span>
                            </motion.button>
                          </div>
                        </div>

                        <div className="flex-1 flex flex-col justify-center my-4 overflow-y-auto">
                          <div className="space-y-3.5 w-full justify-center flex flex-col items-center">
                            {(activeChantText || '').split(/[,，.。!！?？]/).filter(s => s.trim()).map((line, idx) => (
                              <div key={idx} className="flex flex-row flex-nowrap whitespace-nowrap justify-center items-center font-black text-center leading-relaxed tracking-wide text-white text-xl sm:text-2xl">
                                {renderSanzijingLine(line, matchedSpellCard?.suffix || activeChantFlow.word.english)}
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="pt-2 flex flex-col items-center justify-center border-t border-white/10 space-y-1.5" onClick={(e) => e.stopPropagation()}>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                              try { audio.playClick(); } catch(e){}
                              audio.speak(activeChantText || '');
                            }}
                            className="px-5 py-1.5 rounded-full bg-white/15 border border-white/10 hover:bg-white/25 text-white font-extrabold text-[11px] flex items-center space-x-1.5 shadow-sm transition-all cursor-pointer"
                          >
                            <Volume2 size={13} className="text-amber-400 animate-pulse" />
                            <span>🎙️ 说唱口诀 Chant Along!</span>
                          </motion.button>
                          <span className="text-[9px] font-bold text-white/40">点击空白处学发音，或点击挖空词直接揭晓</span>
                        </div>
                      </div>
                    </motion.div>
                  </div>

                  {/* Navigation action at bottom */}
                  <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                    <button
                      onClick={() => {
                        try { audio.playClick(); } catch(e){}
                        setActiveChantFlow(null); // Return to wordbook list dashboard
                      }}
                      className="flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 font-extrabold px-4 py-2.5 rounded-xl cursor-pointer select-none active:scale-95 transition-all text-xs sm:text-sm"
                    >
                      <ArrowLeft size={14} className="stroke-[2.5]" />
                      <span>返回单词表</span>
                    </button>

                    <button
                      onClick={() => {
                        try { audio.playClick(); } catch(e){}
                        setActiveChantFlow(prev => prev ? { ...prev, step: 'shadow' } : null);
                      }}
                      className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-green-600 hover:brightness-105 active:scale-95 text-white font-black px-6 py-3.5 rounded-2xl shadow-md border-b-4 border-emerald-700 select-none cursor-pointer transition-all text-sm tracking-wide"
                    >
                      <span>下一页：跟读口诀仙法</span>
                      <ArrowRight size={15} className="stroke-[3]" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: 'shadow' (魔法跟读 - Fully uses components/VoiceDubbing.tsx for 105% exact reproduction) */}
              {activeChantFlow.step === 'shadow' && (() => {
                const targetClause = activeChantText || '';
                
                return (
                  <div className="space-y-4">
                    <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100">
                      <h3 className="font-sans font-black text-emerald-950 text-sm sm:text-base flex items-center gap-1.5 leading-none">
                        <span>🎤</span>
                        <span>第二步：魔法模仿跟读</span>
                      </h3>
                      <p className="text-xs text-slate-500 mt-1.5 leading-normal">
                        请使用麦克风开口跟读下方的魔法句段，评判声能分值！
                      </p>
                    </div>

                    <div className="py-2">
                       <VoiceDubbing 
                        language="en-US"
                        title={`魔法跟读特训 • ${activeChantFlow.word.english}`}
                        items={[
                          {
                            id: `dub-textbook-${activeChantFlow.word.english}`,
                            text: targetClause,
                            translation: `「${activeChantFlow.word.chinese}」对应口诀名句段`,
                            imageUrl: activeChantFlow.word.imageUrl || 'https://img.icons8.com/clouds/200/microphone.png',
                            suffix: activeChantFlow.word.english
                          }
                        ]}
                        onFinish={(score) => {
                          // Once they finish, update score and move to Step 3 (practice)
                          setActiveChantFlow(prev => prev ? { ...prev, step: 'practice', userScore: score } : null);
                        }}
                        onClose={() => {
                          setActiveChantFlow(null);
                        }}
                      />
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-slate-100 flex-wrap gap-3">
                      <button
                        onClick={() => {
                          try { audio.playClick(); } catch(e){}
                          setActiveChantFlow(prev => prev ? { ...prev, step: 'chant' } : null);
                        }}
                        className="flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 font-extrabold px-4 py-2.5 rounded-xl cursor-pointer select-none active:scale-95 transition-all text-xs sm:text-sm"
                      >
                        <ArrowLeft size={14} className="stroke-[2.5]" />
                        <span>返回上页看口诀</span>
                      </button>
                      
                      <button
                        onClick={() => {
                          try { audio.playClick(); } catch(e){}
                          setActiveChantFlow(prev => prev ? { ...prev, step: 'practice' } : null);
                        }}
                        className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-green-600 hover:brightness-105 active:scale-95 text-white font-black px-6 py-3.5 rounded-2xl shadow-md border-b-4 border-emerald-700 select-none cursor-pointer transition-all text-xs sm:text-sm"
                      >
                        <span>下一页：魔法巩固练习</span>
                        <ArrowRight size={15} className="stroke-[3]" />
                      </button>
                    </div>
                  </div>
                );
              })()}

              {/* STEP 3: 'practice' (趣味填空拼写多维度练习) */}
              {activeChantFlow.step === 'practice' && (() => {
                const question = practiceQuestions[currentQuestionIdx];
                const word = activeChantFlow.word;
                
                return (
                  <div className="space-y-5">
                    {/* Progress Bar & Header */}
                    <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div>
                        <h3 className="font-sans font-black text-indigo-950 text-sm sm:text-base flex items-center gap-1.5 leading-none">
                          <span>⚡</span>
                          <span>第三步：魔法巩固强化训练</span>
                        </h3>
                        <p className="text-xs text-slate-500 mt-1.5 leading-normal">
                          {question?.instruction || '请选择并完成作答'}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2 self-start sm:self-center">
                        <span className="text-xs font-bold text-slate-400">闯关进度:</span>
                        <span className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-805 text-xs font-black">
                          {currentQuestionIdx + 1} / {practiceQuestions.length}
                        </span>
                      </div>
                    </div>

                    {/* Question Interactive Panel */}
                    <div className="space-y-6">
                      
                      {/* TYPE 1: 'blank' (口诀完形填空) */}
                      {question?.type === 'blank' && (
                        <div className="p-6 bg-gradient-to-b from-indigo-50/20 to-indigo-100/10 rounded-2xl border border-indigo-250 text-center relative overflow-hidden">
                          <div className="absolute top-2 left-2 px-2.5 py-0.5 rounded-md bg-indigo-50 border border-indigo-100 text-[10px] font-black text-indigo-600">
                            1. 看口诀选英文
                          </div>
                          <div className="mt-4 font-sans font-black text-slate-800 text-lg sm:text-2xl leading-relaxed whitespace-normal px-2">
                            {question.questionText}
                          </div>
                        </div>
                      )}

                      {/* TYPE 2: 'spell' (看中文写英文 / Spelling Constructor) */}
                      {question?.type === 'spell' && (
                        <div className="p-6 bg-gradient-to-b from-indigo-50/20 to-indigo-100/10 rounded-2xl border border-indigo-250 text-center flex flex-col items-center relative overflow-hidden">
                          <div className="absolute top-2 left-2 px-2.5 py-0.5 rounded-md bg-indigo-50 border border-indigo-100 text-[10px] font-black text-indigo-600">
                            2. 拼写魔法城堡
                          </div>
                          
                          <div className="mt-4 font-sans font-black text-slate-800 text-lg sm:text-2xl leading-relaxed">
                            {question.questionText}
                          </div>
                          
                          {/* Spelling Slots */}
                          <div className="flex gap-1.5 sm:gap-2.5 mt-6 flex-wrap justify-center">
                            {Array.from({ length: question.targetWord?.length || 0 }).map((_, i) => {
                              const letter = speltLetters[i] || '';
                              return (
                                <div 
                                  key={i} 
                                  className={`w-9 h-11 sm:w-12 sm:h-14 rounded-xl border-2 flex items-center justify-center font-sans font-black text-lg sm:text-xl transition-all shadow-xs ${
                                    letter 
                                      ? 'bg-indigo-50 border-indigo-550 text-indigo-700 font-black scale-102' 
                                      : 'bg-slate-50/50 border-dashed border-slate-300'
                                  }`}
                                >
                                  {letter}
                                </div>
                              );
                            })}
                          </div>
                          
                          {/* Letter Choices */}
                          <div className="flex flex-wrap gap-2 sm:gap-2.5 justify-center mt-6">
                            {shuffledLetters.map((item) => (
                              <button
                                key={item.id}
                                disabled={item.used || practiceAnsweredArray[currentQuestionIdx]}
                                onClick={() => handleSelectSpellingLetter(item)}
                                className={`w-9 h-9 sm:w-12 sm:h-12 rounded-xl font-sans font-black text-sm sm:text-base border-2 shadow-2xs transition-all flex items-center justify-center cursor-pointer ${
                                  item.used 
                                    ? 'bg-slate-100 border-slate-200 text-slate-350 cursor-default opacity-40 scale-95' 
                                    : 'bg-white hover:bg-indigo-50 border-slate-250 hover:border-indigo-400 text-slate-850 hover:scale-105 active:scale-95'
                                }`}
                              >
                                {item.char}
                              </button>
                            ))}
                          </div>
                          
                          {/* Clear / Reset button */}
                          {!practiceAnsweredArray[currentQuestionIdx] && speltLetters.length > 0 && (
                            <button
                              onClick={handleResetSpelling}
                              className="mt-4 text-xs font-black text-rose-500 hover:text-rose-600 bg-rose-50 px-3.5 py-1.5 rounded-lg border border-rose-200 cursor-pointer shadow-2xs transition-all active:scale-95"
                            >
                              清空拼写 🗑️
                            </button>
                          )}
                        </div>
                      )}

                      {/* TYPE 3: 'choice' (中英词义选择) */}
                      {question?.type === 'choice' && (
                        <div className="p-6 bg-gradient-to-b from-indigo-50/20 to-indigo-100/10 rounded-2xl border border-indigo-250 text-center relative overflow-hidden">
                          <div className="absolute top-2 left-2 px-2.5 py-0.5 rounded-md bg-indigo-50 border border-indigo-100 text-[10px] font-black text-indigo-600">
                            3. 释义魔法召唤
                          </div>
                          <div className="mt-4 font-sans font-black text-slate-805 text-lg sm:text-2xl leading-relaxed">
                            选择词汇 「 <span className="text-indigo-600">{question.questionText}</span> 」 的正确意思
                          </div>
                        </div>
                      )}

                      {/* Answer Options Grid (only applicable to multiple choices type 'blank' or 'choice') */}
                      {(question?.type === 'blank' || question?.type === 'choice') && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                          {question.options?.map((option, idx) => {
                            const isSelected = selectedOptionsArray[currentQuestionIdx] === idx;
                            const isCorrectVal = idx === question.correctIndex;
                            const isAnswered = practiceAnsweredArray[currentQuestionIdx];
                            
                            let btnStyle = "bg-[#f8fafc] hover:bg-slate-100 border-slate-200 text-slate-800 hover:border-slate-350 active:scale-98 shadow-2xs";
                            if (isAnswered) {
                              if (isCorrectVal) {
                                btnStyle = "bg-green-100 border-green-500 text-green-900 font-extrabold ring-4 ring-green-400/20 shadow-xs";
                              } else if (isSelected) {
                                btnStyle = "bg-red-100 border-red-500 text-red-900 font-extrabold ring-4 ring-red-400/20 shadow-xs";
                              } else {
                                btnStyle = "bg-slate-50 opacity-60 border-slate-150 text-slate-400 cursor-not-allowed";
                              }
                            }

                            return (
                              <button
                                key={idx}
                                disabled={isAnswered}
                                onClick={() => handleSelectMultipleChoiceOption(idx)}
                                className={`p-4 rounded-2xl border-2 transition-all flex items-center justify-between text-left cursor-pointer ${btnStyle}`}
                              >
                                <span className="font-sans font-black text-sm sm:text-base tracking-wide">
                                  {idx + 1}. {option}
                                </span>
                                {isAnswered && isCorrectVal && (
                                  <span className="w-5 h-5 rounded-full bg-green-500 text-white flex items-center justify-center font-black text-xs shrink-0">
                                    ✓
                                  </span>
                                )}
                                {isAnswered && isSelected && !isCorrectVal && (
                                  <span className="w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center font-black text-xs shrink-0">
                                    ✗
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {/* Interactive Answer Feedback Dialog box */}
                      {practiceAnsweredArray[currentQuestionIdx] && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`p-4 rounded-2xl text-sm font-black border flex items-center justify-between shadow-sm relative ${
                            practiceCorrectArray[currentQuestionIdx] 
                              ? 'bg-green-50/90 text-green-800 border-green-250' 
                              : 'bg-red-50/90 text-red-800 border-red-250'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="text-xl">
                              {practiceCorrectArray[currentQuestionIdx] ? '🎉' : '💡'}
                            </span>
                            <div>
                              <p className="p-0 leading-snug">
                                {practiceCorrectArray[currentQuestionIdx] 
                                  ? '完全正确！你获得了奥术魔力的加持！' 
                                  : `差一点点！正确内容应该是「${question.type === 'spell' ? question.targetWord : question.options?.[question.correctIndex || 0]}」噢！`}
                              </p>
                              <p className="text-xs font-bold text-slate-500 mt-1 leading-none">
                                中英对照: {word.english} ➔ {word.chinese} (/{word.phonetic}/)
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </div>

                    {/* Step bottom controls bar */}
                    <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="flex items-center gap-3 w-full sm:w-auto">
                        {currentQuestionIdx > 0 ? (
                          <button
                            onClick={() => {
                              try { audio.playClick(); } catch(e){}
                              setCurrentQuestionIdx(prev => prev - 1);
                            }}
                            className="w-full sm:w-auto flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 font-extrabold px-4 py-2.5 rounded-xl cursor-pointer select-none active:scale-95 transition-all justify-center text-xs sm:text-sm shadow-2xs"
                          >
                            <ArrowLeft size={14} className="stroke-[2.5]" />
                            <span>上一题</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              try { audio.playClick(); } catch(e){}
                              setActiveChantFlow(prev => prev ? { ...prev, step: 'shadow' } : null);
                            }}
                            className="w-full sm:w-auto flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 font-extrabold px-4 py-2.5 rounded-xl cursor-pointer select-none active:scale-95 transition-all justify-center text-xs sm:text-sm shadow-2xs"
                          >
                            <ArrowLeft size={14} className="stroke-[2.5]" />
                            <span>返回上一步跟读</span>
                          </button>
                        )}
                      </div>
                      
                      {practiceAnsweredArray[currentQuestionIdx] && currentQuestionIdx < practiceQuestions.length - 1 ? (
                        <button
                          onClick={() => {
                            try { audio.playClick(); } catch(e){}
                            setCurrentQuestionIdx(prev => prev + 1);
                          }}
                          className="w-full sm:w-auto flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:brightness-105 active:scale-95 text-white font-black px-8 py-3.5 rounded-2xl shadow-md border-b-4 border-indigo-700 select-none cursor-pointer transition-all justify-center text-sm tracking-wide"
                        >
                          <span>下一题：{practiceQuestions[currentQuestionIdx + 1]?.title}</span>
                          <ArrowRight size={15} className="stroke-[3]" />
                        </button>
                      ) : practiceAnsweredArray[currentQuestionIdx] && currentQuestionIdx === practiceQuestions.length - 1 ? (
                        <button
                          onClick={() => {
                            try { audio.playClick(); } catch(e){}
                            setActiveChantFlow(null); // Back to spelling word list
                            window.scrollTo({ top: 300, behavior: 'smooth' });
                          }}
                          className="w-full sm:w-auto flex items-center gap-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-green-600 hover:brightness-105 active:scale-95 text-white font-black px-8 py-3.5 rounded-2xl shadow-lg border-b-4 border-emerald-700 select-none cursor-pointer transition-all justify-center text-sm tracking-wide animate-pulse"
                        >
                          <CheckCircle size={16} className="text-white" />
                          <span>完美通关：返回单词表</span>
                        </button>
                      ) : (
                        <span className="text-xs font-bold text-slate-400">请先在上方进行魔法练习作答 🧙‍♂️</span>
                      )}
                    </div>
                  </div>
                );
              })()}
            </motion.div>
          ) : (
            /* 🎒 STANDARD VIEW WHEN NOT IN ACTIVE CHANT FLOW */
            <motion.div
              key="standard-textbook-grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {/* Stage Tabs (Primary, Junior High, High School) */}
              <div className="flex gap-2.5 p-2 bg-emerald-100/50 rounded-2xl border border-emerald-250 backdrop-blur-sm shadow-inner mb-6">
                {TEXTBOOK_STAGES.map(stage => {
                  const isSelected = selectedStageId === stage.id;
                  return (
                    <button
                      key={stage.id}
                      onClick={() => {
                        try { audio.playClick(); } catch(e){}
                        if (stage.id === 'senior') {
                          setFeedbackMessage("请等待");
                          setTimeout(() => setFeedbackMessage(null), 2500);
                          return;
                        }
                        setSelectedStageId(stage.id);
                      }}
                      className={`flex-1 py-2.5 sm:py-3.5 px-4 rounded-xl font-sans font-black text-sm sm:text-lg transition-all duration-200 cursor-pointer select-none flex items-center justify-center gap-1.5 ${
                        isSelected 
                          ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-md scale-[1.02]' 
                          : 'text-emerald-800 hover:bg-emerald-200/50 hover:text-emerald-950'
                      }`}
                    >
                      <GraduationCap size={18} />
                      <span>{stage.name.split(' ')[0]}</span>
                    </button>
                  );
                })}
              </div>

              {/* Versions sub-bar selector */}
              {activeStage && activeStage.versions.length > 1 && (
                <div className="flex gap-2.5 overflow-x-auto pb-2.5 scrollbar-none mb-5 -mx-1 px-1">
                  {activeStage.versions.map(version => {
                    const isSelected = selectedVersionId === version.id;
                    return (
                      <button
                        key={version.id}
                        onClick={() => {
                          try { audio.playClick(); } catch(e){}
                          setSelectedVersionId(version.id);
                        }}
                        className={`px-5 py-2 rounded-full font-black text-xs sm:text-sm border transition-all whitespace-nowrap cursor-pointer select-none ${
                          isSelected
                            ? 'bg-amber-400 text-amber-950 border-amber-500 shadow-sm'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-emerald-50 hover:border-emerald-200'
                        }`}
                      >
                        {version.name}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Selected book semester list (Dropdown Selector) */}
              {activeVersion && activeVersion.books.length > 1 && (
                <div className="relative mb-6 w-full max-w-sm">
                  <label className="block text-xs font-black text-emerald-800 uppercase tracking-wider mb-2 flex items-center gap-1.5 select-none">
                    <span>📖</span>
                    <span>选择年级分册</span>
                  </label>
                  
                  <div className="relative">
                    <button
                      onClick={() => {
                        try { audio.playClick(); } catch(e){}
                        setIsBookDropdownOpen(!isBookDropdownOpen);
                      }}
                      className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3.5 flex items-center justify-between text-left shadow-sm hover:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all cursor-pointer select-none font-sans"
                    >
                      <div className="flex items-center gap-3 font-medium">
                        <span className="text-xl">📔</span>
                        <div className="leading-tight text-left">
                          <p className="text-sm sm:text-base font-black text-slate-850 font-cute text-[15px]">
                            {activeBook ? activeBook.title.replace(/\s*\(.*\)/, '') : '请选择年级'}
                          </p>
                          <p className="text-[11px] font-bold text-slate-400 mt-0.5">
                            {activeBook ? `${activeBook.units.length} 个单元` : '暂无单元'}
                          </p>
                        </div>
                      </div>
                      <div className="text-slate-400">
                        {isBookDropdownOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </div>
                    </button>

                    {/* Backing backdrop to close drop list if clicked outside */}
                    {isBookDropdownOpen && (
                      <div 
                        className="fixed inset-0 z-40 cursor-default" 
                        onClick={() => setIsBookDropdownOpen(false)}
                      />
                    )}

                    <AnimatePresence>
                      {isBookDropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.15 }}
                          className="absolute left-0 right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-xl z-50 overflow-hidden max-h-60 overflow-y-auto"
                        >
                          <div className="py-1">
                            {activeVersion.books.map(book => {
                              const isSelected = selectedBookId === book.id;
                              return (
                                <button
                                  key={book.id}
                                  onClick={() => {
                                    try { audio.playClick(); } catch(e){}
                                    setSelectedBookId(book.id);
                                    setIsBookDropdownOpen(false);
                                  }}
                                  className={`w-full px-5 py-3 text-left flex items-center justify-between transition-colors hover:bg-emerald-50/50 cursor-pointer ${
                                    isSelected 
                                      ? 'bg-emerald-50/70 text-emerald-950 font-black' 
                                      : 'text-slate-700 hover:text-slate-900'
                                  }`}
                                >
                                  <div className="flex items-center gap-3">
                                    <span className="text-lg">📔</span>
                                    <div className="leading-tight text-left">
                                      <p className="text-sm font-black font-cute text-[15px]">
                                        {book.title.replace(/\s*\(.*\)/, '')}
                                      </p>
                                      <p className="text-[11px] font-bold text-slate-400 mt-0.5">
                                        {book.units.length} 个单元
                                      </p>
                                    </div>
                                  </div>
                                  {isSelected && (
                                    <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center text-[10px] text-white font-bold">
                                      ✓
                                    </div>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              )}

              {/* Interactive layout: left units side, right vocabulary detail */}
              {activeBook ? (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start mt-4">
                  
                  {/* LEFT SIDEBAR: Units Directory */}
                  <div className={`md:col-span-5 lg:col-span-4 bg-white/90 rounded-2xl border border-emerald-250 p-4 shadow-sm max-h-[550px] overflow-y-auto ${isMobileDetailOpen ? 'hidden md:block' : 'block'}`}>
                    <h3 className="px-2 pb-3 mb-3 border-b border-slate-100 font-sans font-black text-xs sm:text-sm uppercase tracking-wider text-emerald-800 flex items-center gap-2">
                      <span>📂</span>
                      <span>课程单元选择</span>
                    </h3>
                    <div className="space-y-2.5">
                      {activeBook.units.map((unit, uIdx) => {
                        const isSelected = selectedUnitId === unit.id;

                        return (
                          <button
                            key={unit.id}
                            onClick={() => {
                              try { audio.playClick(); } catch(e){}
                              setSelectedUnitId(unit.id);
                              setIsMobileDetailOpen(true); // Open vocabulary detail view on click
                            }}
                            className={`w-full p-3 sm:p-4.5 rounded-2xl border transition-all flex flex-col items-center justify-center gap-1 sm:gap-1.5 cursor-pointer select-none relative overflow-hidden group ${
                              isSelected
                                ? 'bg-gradient-to-b from-emerald-500 to-green-600 text-white border-emerald-600 shadow-md scale-[1.02]'
                                : 'bg-slate-50/80 border-slate-200/80 text-slate-700 hover:bg-emerald-50/40 hover:border-emerald-250/50'
                            }`}
                          >
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-sans font-black text-xs tracking-tight transition-transform ${
                              isSelected ? 'bg-white/20 text-white scale-105' : 'bg-emerald-100/90 text-emerald-800'
                            }`}>
                              U{uIdx + 1}
                            </div>
                            <span className={`font-sans font-black text-xs sm:text-sm tracking-wide transition-colors ${
                              isSelected ? 'text-white' : 'text-slate-800 group-hover:text-emerald-700'
                            }`}>
                              Unit {uIdx + 1}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* RIGHT SIDEBAR: Vocabulary List */}
                  <div className={`md:col-span-7 lg:col-span-8 space-y-6 ${isMobileDetailOpen ? 'block' : 'hidden md:block'}`}>
                    <AnimatePresence mode="wait">
                      {activeUnit ? (
                        /* 📔 STANDARD SYNCHRONIZED VOCABULARY VIEW & RHYTHMIC CHANT CARD */
                        <motion.div
                          key={activeUnit.id}
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -15 }}
                          transition={{ duration: 0.2 }}
                          className="space-y-6"
                        >
                          {/* Mobile Back to Units Button at Top */}
                          <button
                            onClick={() => {
                              try { audio.playClick(); } catch(e){}
                              setIsMobileDetailOpen(false);
                            }}
                            className="md:hidden flex items-center gap-2.5 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-black text-sm px-5 py-3 rounded-2xl cursor-pointer active:scale-95 transition-all w-full justify-center shadow-md border-b-2 border-emerald-700"
                          >
                            <ArrowLeft size={16} className="stroke-[3]" />
                            <span>返回课程单元目录</span>
                          </button>

                          {/* Unit Title Banner */}
                          <div className="p-4.5 bg-gradient-to-r from-emerald-50 to-green-50/40 rounded-3xl border-2 border-dashed border-emerald-300 shadow-sm flex items-center justify-between">
                            <div>
                              <span className="text-[11px] font-black uppercase text-emerald-800 tracking-wider">当前正在学习</span>
                              <h2 className="font-sans font-black text-slate-800 text-lg sm:text-2xl leading-snug mt-1 text-left">
                                Unit {getUnitIndex(activeUnit.id)}
                              </h2>
                            </div>
                            <span className="text-3xl shrink-0">🎒</span>
                          </div>

                          {/* FIRST: Unit Words Grids with larger readability size */}
                          <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm space-y-4">
                            <h3 className="font-black text-xs sm:text-sm uppercase tracking-wider text-slate-450 flex items-center gap-1.5">
                              <span>📖</span>
                              <span>本单元同步词汇表 ({activeUnit.words.length} 词)</span>
                            </h3>

                            <div className="divide-y divide-slate-105">
                              {activeUnit.words.map((word, wIdx) => {
                                const mapInfo = getWordMapInfo(word.english);
                                return (
                                  <div 
                                    key={wIdx}
                                    className="py-5 flex items-center justify-between gap-4 group/word hover:bg-emerald-50/15 px-3 rounded-2xl transition-all"
                                  >
                                    {/* Left side: vertical column (word, phonetic, chinese) */}
                                    <div className="flex flex-col items-start text-left gap-1.5 flex-1 min-w-0">
                                      
                                      {/* Row 1: Word + Small Speak button */}
                                      <div className="flex items-center gap-2">
                                        <span 
                                          className="font-sans font-black text-slate-800 text-lg sm:text-2xl tracking-wide cursor-pointer hover:text-emerald-600 transition-colors select-none"
                                          onClick={() => handleSpeak(word.english)}
                                          title="试听发音"
                                        >
                                          {word.english}
                                        </span>
                                        <button
                                          onClick={() => handleSpeak(word.english)}
                                          className="w-7 h-7 rounded-full bg-[#f0fdf4] text-emerald-600 hover:bg-emerald-100 flex items-center justify-center transition-all cursor-pointer border border-emerald-100 active:scale-90 animate-none shrink-0"
                                          title="试听发音"
                                        >
                                          <Volume2 size={13} className="stroke-[2.5]" />
                                        </button>
                                      </div>

                                      {/* Row 2: Phonetic */}
                                      {word.phonetic && (
                                        <span className="font-sans text-xs sm:text-sm font-bold text-emerald-600 bg-emerald-50/80 px-2 py-0.5 rounded-lg border border-emerald-100/60 leading-none">
                                          /{word.phonetic}/
                                        </span>
                                      )}

                                      {/* Row 3: Chinese Translation */}
                                      <span className="text-[14px] sm:text-[16px] font-black text-slate-500/90 leading-normal">
                                        {word.chinese}
                                      </span>
                                    </div>

                                    {/* Right side Action: Redesigned Vertical "三字经 ⚡" button */}
                                    <div className="shrink-0 flex items-center">
                                      <button
                                        onClick={() => handleStartChantFlow(word)}
                                        className="flex flex-col items-center justify-center bg-gradient-to-b from-amber-400 to-amber-500 hover:brightness-105 hover:scale-102 active:scale-95 border-b-[3.5px] border-amber-600 px-3.5 sm:px-4 py-3 rounded-2xl text-amber-950 font-black tracking-widest shadow-md transition-all cursor-pointer select-none"
                                        title="学习该单词的魔法三字经口诀"
                                      >
                                        <Sparkles size={11} className="text-amber-950 mb-0.5 animate-spin" />
                                        <span className="text-[12px] leading-tight flex flex-col items-center font-black">
                                          <span>三</span>
                                          <span>字</span>
                                          <span>经</span>
                                        </span>
                                        <span className="text-[9px] mt-0.5 text-amber-950/85 font-black leading-none">⚡</span>
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>



                          {/* Mobile Back to Units Button at Bottom */}
                          <button
                            onClick={() => {
                              try { audio.playClick(); } catch(e){}
                              setIsMobileDetailOpen(false);
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className="md:hidden flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-sm px-4 py-3 rounded-2xl border border-slate-200 cursor-pointer active:scale-95 transition-all w-full justify-center shadow-sm"
                          >
                            <ArrowLeft size={16} className="stroke-[2.5]" />
                            <span>返回课程单元目录</span>
                          </button>
                        </motion.div>
                      ) : (
                        <div className="bg-slate-50 border border-slate-200 h-96 rounded-3xl flex flex-col items-center justify-center text-slate-400">
                          <span>✨ 正在翻开魔法书页...</span>
                        </div>
                      )}
                    </AnimatePresence>
                  </div>

                </div>
              ) : (
                <div className="bg-white border rounded-3xl p-12 text-center text-slate-400">
                  <span>📚 教材库正在初始化中，请选择上方学段或版本</span>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <AnimatePresence>
        {feedbackMessage && (
          <motion.div
            initial={{ opacity: 0, x: 100, y: 0 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="fixed bottom-24 right-4 z-[500] flex items-end space-x-3 pointer-events-none"
          >
            <div className="bg-white p-4 rounded-[28px] rounded-br-none shadow-2xl border-2 border-emerald-100 max-w-[200px] relative">
              <div className="absolute -bottom-2 right-0 w-4 h-4 bg-white border-r-2 border-b-2 border-emerald-100 rotate-45" />
              <p className="text-emerald-950 font-black text-sm leading-relaxed">
                {feedbackMessage}
              </p>
            </div>
            <div className="w-16 h-16 bg-white rounded-3xl border-4 border-emerald-50 shadow-xl flex items-center justify-center text-3xl">
              🐯
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
