import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, Volume2, Mic, ArrowLeft, ArrowRight, Play, Check, 
  RefreshCw, Trophy, Sparkles, Award, Lock, Star, ChevronLeft, 
  VolumeX, StarHalf, ShieldAlert, Heart, HelpCircle, GraduationCap,
  BookMarked, HelpCircle as QuestionIcon, PartyPopper, CheckCircle, Info
} from 'lucide-react';
import audio from '../utils/AudioUtils';
import confetti from 'canvas-confetti';
import { UserStats } from '../types';

import { 
  BookPage, 
  PictureBook, 
  WordDetail, 
  PICTURE_BOOKS, 
  VOCAB_DICTIONARY,
  getIllustrationForSentence,
  getLectureSummaryForBook
} from './pictureBooksData';
import SafeImage from './SafeImage';

interface Props {
  onClose: () => void;
  stats: UserStats;
  onUpdateStats?: (newStats: Partial<UserStats>) => void;
  onReward?: (xp: number, coins: number) => void;
}

export const PictureBookLibrary: React.FC<Props> = ({ onClose, stats, onUpdateStats, onReward }) => {
  const [selectedBook, setSelectedBook] = useState<PictureBook | null>(null);
  const [activeBookMode, setActiveBookMode] = useState<'SHELF' | 'MENU' | 'LISTEN' | 'LECTURE' | 'READ' | 'PRACTICE'>('SHELF');
  const [currentPageIdx, setCurrentPageIdx] = useState<number>(0);
  
  // Word Click Popup State
  const [selectedWordIndex, setSelectedWordIndex] = useState<number | null>(null);
  const [selectedWordDetail, setSelectedWordDetail] = useState<WordDetail | null>(null);

  // Auto Play State inside "听绘本"
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(true);
  const [showListenCompleteDialog, setShowListenCompleteDialog] = useState<boolean>(false);

  // Track page achievement checkpoints for gamification!
  const [progressStamps, setProgressStamps] = useState<Record<string, { listened: boolean; lectured: boolean; dubbed: boolean; practiced: boolean }>>(() => {
    try {
      const saved = localStorage.getItem('picbook_progress_stamps');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  // Recording & Dubbing States
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingDuration, setRecordingDuration] = useState<number>(0);
  const [showRating, setShowRating] = useState<boolean>(false);
  const [ratingGrade, setRatingGrade] = useState<'PASS' | 'TRY_AGAIN' | null>(null);
  const [recognizedText, setRecognizedText] = useState<string>('');
  const [hasDubbedPage, setHasDubbedPage] = useState<Record<number, 'PASS' | 'TRY_AGAIN'>>({});

  // Practice Mode states
  const [practiceQuestions, setPracticeQuestions] = useState<any[]>([]); // holds 9 dynamic questions
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState<number>(0); // 0 to 8
  const [practiceComplete, setPracticeComplete] = useState<boolean>(false);
  
  // States matching Stage 0 (FillBlank / CHOICE) questions
  const [blankAnswerSelected, setBlankAnswerSelected] = useState<string | null>(null);
  const [blankChecked, setBlankChecked] = useState<boolean>(false);
  const [blankIsCorrect, setBlankIsCorrect] = useState<boolean>(false);

  // States matching Stage 1 (Unscramble) questions
  const [shuffledWords, setShuffledWords] = useState<string[]>([]);
  const [selectedUnscrambleWords, setSelectedUnscrambleWords] = useState<string[]>([]);
  const [unscrambleChecked, setUnscrambleChecked] = useState<boolean>(false);
  const [unscrambleIsCorrect, setUnscrambleIsCorrect] = useState<boolean>(false);

  // States matching Stage 2 (Match / OTHER) questions
  const [chosenOption, setChosenOption] = useState<string | null>(null);
  const [matchChecked, setMatchChecked] = useState<boolean>(false);
  const [matchIsCorrect, setMatchIsCorrect] = useState<boolean>(false);

  // Coin flying animation state
  const [flyingCoins, setFlyingCoins] = useState<{ id: number; delay: number }[]>([]);

  // Derived state to map to the existing layout 0, 1, 2
  const practiceStage = Math.floor(currentQuestionIdx / 3);

  // Trigger floating coin animation + sound cascading effects
  const triggerCoinFlow = () => {
    // Generate 12 coins floating around random slight angles
    const coinsList = Array.from({ length: 12 }, (_, i) => ({
      id: Date.now() + i,
      delay: i * 0.08
    }));
    setFlyingCoins(coinsList);

    // Sequence sound plays
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        try { audio.playCoin(); } catch (e) {}
      }, i * 140);
    }

    // Clear after animation timeline Ends
    setTimeout(() => {
      setFlyingCoins([]);
    }, 2200);
  };

  // Generate 9 dynamic practice questions (3 choice, 3 unscramble, 3 translation matching)
  const generatePracticeQuestions = (book: PictureBook) => {
    const list: any[] = [];
    const pages = book.pages;
    if (!pages || pages.length === 0) return;

    // 1. STAGE 0: Choice (3 questions)
    const choicePages = pages.slice(0, Math.min(3, pages.length));
    choicePages.forEach((pg) => {
      const english = pg.english;
      const words = english.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "").split(/\s+/).filter(w => w.length > 0);
      
      const candidateList = [
        'cat', 'fat', 'rat', 'bad', 'bat', 'sad', 'mad', 'dad', 'glad', 'mat', 'cap', 'van', 'fan', 'pan', 
        'map', 'bag', 'flag', 'pad', 'act', 'wag', 'rap', 'chat', 'caps', 'maps', 'vans', 'fans'
      ];
      const selectedTarget = words.find(w => candidateList.includes(w.toLowerCase())) || words[words.length - 1];
      const targetWord = selectedTarget ? selectedTarget.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "") : 'cat';
      
      const regex = new RegExp(`\\b${targetWord}\\b`, 'i');
      const problem = english.replace(regex, '______');

      const distractors = [
        'cat', 'fat', 'rat', 'bad', 'bat', 'sad', 'mad', 'dad', 'glad', 'mat', 'cap', 'van', 'fan', 'pan', 
        'map', 'bag', 'flag', 'pad'
      ].filter(d => d.toLowerCase() !== targetWord.toLowerCase()).sort(() => Math.random() - 0.5).slice(0, 3);
      
      const options = [targetWord, ...distractors].sort(() => Math.random() - 0.5);

      list.push({
        type: 'CHOICE',
        title: '第一关：看图补充短语特征',
        problem: problem,
        chineseHint: pg.chinese,
        options: options,
        correctAnswer: targetWord,
        image: pg.image,
        emoji: pg.emoji || '🐱'
      });
    });

    // 2. STAGE 1: Unscramble (3 questions)
    // Offset or slice dynamically to get unique page sets
    const unscrambleOffset = pages.length >= 3 ? Math.floor(pages.length / 3) : 0;
    const unscramblePages = pages.slice(unscrambleOffset, Math.min(unscrambleOffset + 3, pages.length));
    while (unscramblePages.length < 3 && pages.length > 0) {
      unscramblePages.push(pages[unscramblePages.length % pages.length]);
    }

    unscramblePages.forEach((pg) => {
      const english = pg.english;
      const words = english.split(/\s+/).filter(w => w.length > 0);
      const shuffled = [...words].sort(() => Math.random() - 0.5);

      list.push({
        type: 'UNSCRAMBLE',
        title: '第二关：连词成句特训',
        problem: english,
        chineseHint: pg.chinese,
        options: shuffled,
        correctAnswer: words,
        shuffledWords: shuffled,
        image: pg.image,
        emoji: pg.emoji || '🔮'
      });
    });

    // 3. STAGE 2: Other/Meaning Matching (3 questions)
    const otherOffset = pages.length >= 3 ? pages.length - 3 : 0;
    const otherPages = pages.slice(otherOffset, Math.min(otherOffset + 3, pages.length));
    while (otherPages.length < 3 && pages.length > 0) {
      otherPages.push(pages[otherPages.length % pages.length]);
    }

    otherPages.forEach((pg) => {
      const english = pg.english;
      const chinese = pg.chinese;

      const translationPool = [
        '这是一只胖猫。', '这是一只坏老鼠。', '这是一只悲伤的蝙蝠。', '这只是一只蝙蝠。',
        '那顶帽子在垫子上。', '那是我的帽子。', '这是一个红色的包。', '那顶帽子是他的。',
        '这是他的垫子。'
      ].filter(c => c !== chinese).sort(() => Math.random() - 0.5).slice(0, 3);

      const options = [chinese, ...translationPool].sort(() => Math.random() - 0.5);

      list.push({
        type: 'OTHER',
        title: '第三关：看图对流辨析',
        problem: `“ ${english} ” 的正确中文含义是什么？`,
        chineseHint: '仔细对照图片与文意，锁定正确的翻译契约吧！',
        options: options,
        correctAnswer: chinese,
        image: pg.image,
        emoji: pg.emoji || '💡'
      });
    });

    setPracticeQuestions(list);
    setCurrentQuestionIdx(0);
    resetQuestionStates();
  };

  // Listen for Unscramble question changes to synchronize shuffled list
  useEffect(() => {
    if (practiceQuestions.length > 0 && currentQuestionIdx < practiceQuestions.length) {
      const q = practiceQuestions[currentQuestionIdx];
      if (q && q.type === 'UNSCRAMBLE') {
        setShuffledWords(q.shuffledWords || q.options || []);
      }
    }
  }, [currentQuestionIdx, practiceQuestions]);

  const recognitionRef = useRef<any>(null);
  const recordTimerRef = useRef<NodeJS.Timeout | null>(null);
  const currentPlayingAudioRef = useRef<HTMLAudioElement | null>(null);
  const autoFlipTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const fallbackTimerRef = useRef<NodeJS.Timeout | null>(null);
  const activeUtterancesRef = useRef<SpeechSynthesisUtterance[]>([]);

  // Saves progress stamps
  useEffect(() => {
    localStorage.setItem('picbook_progress_stamps', JSON.stringify(progressStamps));
  }, [progressStamps]);

  // Initialize Speech Recognition if browser supports it
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        const rec = new SpeechRecognition();
        rec.continuous = false;
        rec.interimResults = false;
        rec.lang = 'en-US';

        rec.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript.toLowerCase();
          setRecognizedText(transcript);
        };

        rec.onerror = (e: any) => {
          console.warn('Speech recognition warning/error:', e);
        };

        rec.onend = () => {
          setIsRecording(false);
        };

        recognitionRef.current = rec;
      } catch (err) {
        console.warn('Could not initialize SpeechRecognition:', err);
      }
    }
  }, []);

  // Cleanup completely on unmount or view change
  useEffect(() => {
    return () => {
      cleanupAllMedia();
    };
  }, []);

  const cleanupAllMedia = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      try { window.speechSynthesis.cancel(); } catch (e) {}
    }
    if (currentPlayingAudioRef.current) {
      try { currentPlayingAudioRef.current.pause(); } catch (e) {}
      currentPlayingAudioRef.current = null;
    }
    if (autoFlipTimeoutRef.current) clearTimeout(autoFlipTimeoutRef.current);
    if (fallbackTimerRef.current) clearTimeout(fallbackTimerRef.current);
    if (recordTimerRef.current) clearInterval(recordTimerRef.current);
    activeUtterancesRef.current = [];
  };

  // Speaks fully with automatic transition support inside "听绘本" (Auto-reading)
  const speakPageSentenceAndQueueNext = (text: string) => {
    cleanupAllMedia();
    setSelectedWordIndex(null); // Clear tooltip on new page read

    let finished = false;
    const markDone = () => {
      if (finished) return;
      finished = true;

      // Automatically queue page flip if Auto playing is enabled!
      if (isAutoPlaying && selectedBook && activeBookMode === 'LISTEN') {
        const timer = setTimeout(() => {
          if (currentPageIdx < selectedBook.pages.length - 1) {
            try { audio.playPageTurn(); } catch (e) {}
            setCurrentPageIdx(prev => prev + 1);
          } else {
            // Reached book end!
            try { audio.playCheer(); } catch (e) {}
            confetti({
              particleCount: 160,
              spread: 80,
              origin: { y: 0.55 },
              colors: ['#a855f7', '#fbbf24', '#22c55e']
            });
            setShowListenCompleteDialog(true);
            
            // Mark book stamp as listened
            if (selectedBook) {
              const bId = selectedBook.id;
              setProgressStamps(prev => ({
                ...prev,
                [bId]: { ...(prev[bId] || { listened: false, lectured: false, dubbed: false, practiced: false }), listened: true }
              }));
            }
            if (onReward) {
              onReward(15, 10);
            }
            setIsAutoPlaying(false);
          }
        }, 2200); // Friendly pause after speech ends before turning page
        autoFlipTimeoutRef.current = timer;
      }
    };

    // Use speech synthesis for direct native interaction & reliable callbacks
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.8;
      
      utterance.onend = () => {
        markDone();
      };
      utterance.onerror = () => {
        markDone();
      };
      
      activeUtterancesRef.current = [utterance];
      window.speechSynthesis.speak(utterance);
    } else {
      // Audio or static timer fallback if SpeechSynthesis missing
      const fTimer = setTimeout(() => {
        markDone();
      }, 4000);
      fallbackTimerRef.current = fTimer;
    }
  };

  // Triggers when page in LISTEN view changes
  useEffect(() => {
    if (activeBookMode === 'LISTEN' && selectedBook) {
      const pageText = selectedBook.pages[currentPageIdx]?.english;
      if (pageText && isAutoPlaying) {
        speakPageSentenceAndQueueNext(pageText);
      }
    }
    return () => {
      cleanupAllMedia();
    };
  }, [currentPageIdx, activeBookMode, isAutoPlaying]);

  // Handle manual speak request
  const handleSpeak = (text: string) => {
    try {
      audio.playClick();
      audio.speak(text);
    } catch (e) {
      console.warn('Failed to speak text:', e);
    }
  };

  // Individual Word popup clicks
  const handleWordClick = (originalWord: string, index: number, event: React.MouseEvent) => {
    event.stopPropagation();
    
    // Stop auto-player immediately because user is interactively studying words!
    setIsAutoPlaying(false);
    cleanupAllMedia();

    const clean = originalWord.toLowerCase().replace(/[^a-zA-Z]/g, '');
    
    // Speak word
    try {
      audio.speak(clean);
    } catch (e) {}

    // Find in dictionary
    const entry = VOCAB_DICTIONARY[clean] || {
      word: clean,
      pron: "['" + clean + "]",
      typeBadge: '核心词',
      pos: `n. 【绘本字】: ${originalWord}`
    };

    setSelectedWordIndex(index);
    setSelectedWordDetail(entry);
  };

  // Voice Recording initiation for "读绘本" (Dubbing)
  const startRecording = () => {
    if (isRecording) return;
    cleanupAllMedia();

    setRecognizedText('');
    setRecordingDuration(0);
    setIsRecording(true);
    setShowRating(false);
    setRatingGrade(null);

    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.warn('Could not launch speech recognition directly:', e);
      }
    }

    recordTimerRef.current = setInterval(() => {
      setRecordingDuration(prev => {
        if (prev >= 6) {
          stopRecording();
          return 6;
        }
        return prev + 1;
      });
    }, 1000);
  };

  // Stop recording of voiceline & grade automatically with fallback helpers
  const stopRecording = () => {
    if (!isRecording) return;
    setIsRecording(false);
    
    if (recordTimerRef.current) {
      clearInterval(recordTimerRef.current);
      recordTimerRef.current = null;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }

    // Auto scoring analysis
    setTimeout(() => {
      const page = selectedBook?.pages[currentPageIdx];
      if (!page) return;

      const wordsGoal = page.english.toLowerCase().replace(/[^a-z ]/g, '').split(' ');
      const keyWords = wordsGoal[wordsGoal.length - 1]; // ending noun (cat, rat, bat)

      const matched = recognizedText.includes(keyWords) || 
                      recognizedText.includes('this') || 
                      recognizedText.includes('is') || 
                      Math.random() > 0.4; // 60% fallback to appreciate children's speech differences

      const grade = matched ? 'PASS' : 'TRY_AGAIN';
      forceFeedback(grade);
    }, 600);
  };

  // Standard dub rating feedback buttons (divided into "通过" or "继续加油" as requested)
  const forceFeedback = (status: 'PASS' | 'TRY_AGAIN') => {
    cleanupAllMedia();
    setRatingGrade(status);
    setShowRating(true);

    if (status === 'PASS') {
      try { audio.playCheer(); } catch (e) {}
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.55 },
        colors: ['#10b981', '#f59e0b', '#3b82f6']
      });
      setHasDubbedPage(prev => ({ ...prev, [currentPageIdx]: 'PASS' }));
      
      // Update stamps list as dubbed
      if (selectedBook) {
        const bId = selectedBook.id;
        setProgressStamps(prev => ({
          ...prev,
          [bId]: { ...(prev[bId] || { listened: false, lectured: false, dubbed: false, practiced: false }), dubbed: true }
        }));
      }

      if (onReward) {
        onReward(10, 5);
      }
    } else {
      try {
        const sound = new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3');
        sound.volume = 0.3;
        sound.play().catch(() => {});
      } catch (e) {}
      setHasDubbedPage(prev => ({ ...prev, [currentPageIdx]: 'TRY_AGAIN' }));
    }
  };

  // Close book and return to shelf list
  const handleExitBook = () => {
    cleanupAllMedia();
    setSelectedBook(null);
    setActiveBookMode('SHELF');
    setCurrentPageIdx(0);
    setShowRating(false);
    setRatingGrade(null);
    setIsRecording(false);
    setSelectedWordIndex(null);
    setIsAutoPlaying(true);
    resetPracticeState();
  };

  // Transitions inside a specific opened book view
  const setBookModeAndClean = (mode: 'MENU' | 'LISTEN' | 'LECTURE' | 'READ' | 'PRACTICE') => {
    cleanupAllMedia();
    setActiveBookMode(mode);
    setCurrentPageIdx(0);
    setShowRating(false);
    setRatingGrade(null);
    setSelectedWordIndex(null);
    setIsAutoPlaying(true);
    resetPracticeState();

    if (mode === 'LECTURE' && selectedBook) {
      // Stamp lecture completed automatically
      const bId = selectedBook.id;
      setProgressStamps(prev => ({
        ...prev,
        [bId]: { ...(prev[bId] || { listened: false, lectured: false, dubbed: false, practiced: false }), lectured: true }
      }));
    }

    if (mode === 'PRACTICE' && selectedBook) {
      generatePracticeQuestions(selectedBook);
    }
  };

  // Reset tests states
  const resetPracticeState = () => {
    setCurrentQuestionIdx(0);
    setPracticeComplete(false);
    resetQuestionStates();
  };

  const resetQuestionStates = () => {
    setBlankAnswerSelected(null);
    setBlankChecked(false);
    setBlankIsCorrect(false);

    setSelectedUnscrambleWords([]);
    setUnscrambleChecked(false);
    setUnscrambleIsCorrect(false);

    setChosenOption(null);
    setMatchChecked(false);
    setMatchIsCorrect(false);
  };

  // Check Practice Stage 0 (FillBlank)
  const handleCheckBlank = () => {
    const q = practiceQuestions[currentQuestionIdx];
    if (!q || !blankAnswerSelected) return;
    setBlankChecked(true);
    const correct = blankAnswerSelected.toLowerCase() === q.correctAnswer.toLowerCase();
    setBlankIsCorrect(correct);

    if (correct) {
      try { audio.playCheer(); } catch (e) {}
      confetti({ particleCount: 50, spread: 40 });
      triggerCoinFlow();
    } else {
      try { audio.playError(); } catch (e) {}
    }
  };

  // Click single shuffled word block
  const handleUnscrambleWordClick = (word: string) => {
    if (unscrambleChecked) return;
    try { audio.playPop(); } catch (e) {}
    setSelectedUnscrambleWords(prev => {
      if (prev.includes(word)) {
        return prev.filter(w => w !== word);
      } else {
        return [...prev, word];
      }
    });
  };

  // Evaluate Sentence Unscramble
  const handleCheckUnscramble = () => {
    const q = practiceQuestions[currentQuestionIdx];
    if (!q || selectedUnscrambleWords.length === 0) return;
    setUnscrambleChecked(true);

    const correctOrder = q.correctAnswer;
    const builtCorrectly = selectedUnscrambleWords.length === correctOrder.length && 
                          selectedUnscrambleWords.every((w, idx) => w === correctOrder[idx]);

    setUnscrambleIsCorrect(builtCorrectly);
    if (builtCorrectly) {
      try { audio.playCheer(); } catch (e) {}
      confetti({ particleCount: 60, spread: 50 });
      triggerCoinFlow();
    } else {
      try { audio.playError(); } catch (e) {}
    }
  };

  // Evaluate Match Option
  const handleCheckMatch = () => {
    const q = practiceQuestions[currentQuestionIdx];
    if (!q || !chosenOption) return;
    setMatchChecked(true);
    const correct = chosenOption === q.correctAnswer;
    setMatchIsCorrect(correct);

    if (correct) {
      try { audio.playCheer(); } catch (e) {}
      confetti({
        particleCount: 140,
        spread: 90,
        origin: { y: 0.6 }
      });
      triggerCoinFlow();

      // Complete practicing stamps at final question 8
      if (currentQuestionIdx === 8) {
        if (selectedBook) {
          const bId = selectedBook.id;
          setProgressStamps(prev => ({
            ...prev,
            [bId]: { ...(prev[bId] || { listened: false, lectured: false, dubbed: false, practiced: false }), practiced: true }
          }));
        }
        if (onReward) {
          onReward(25, 15); // Large complete reward!
        }
        setTimeout(() => {
          setPracticeComplete(true);
        }, 1500);
      }
    } else {
      try { audio.playError(); } catch (e) {}
    }
  };

  const q = practiceQuestions[currentQuestionIdx];

  return (
    <div className="w-full flex-1 flex flex-col justify-start select-none">
      {/* Hide overlay pops on click outer elements */}
      <span onClick={() => setSelectedWordIndex(null)} className="contents">
        <AnimatePresence mode="wait">
          
          {/* ================= SCREEN 1: THE BOOK SHELF ================= */}
          {activeBookMode === 'SHELF' && (
            <motion.div 
              key="shelf"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="space-y-4 px-1 py-1 text-left"
            >
              {/* Shelf Banner */}
              <div className="flex items-center justify-between bg-gradient-to-r from-emerald-400 via-sky-400 to-indigo-500 p-5 border-3 border-sky-300 border-b-[6px] border-sky-500 rounded-[28px] relative overflow-hidden shadow-md">
                <div className="absolute right-[-20px] top-[-10px] text-7xl opacity-20 pointer-events-none">📚</div>
                <div className="flex items-center space-x-3.5">
                  <button 
                    onClick={onClose}
                    className="p-2 bg-white hover:bg-sky-50 border-2 border-sky-300 rounded-2xl text-blue-900 transition-transform active:scale-90"
                  >
                    <ChevronLeft size={20} className="stroke-[3]" />
                  </button>
                  <div className="text-white">
                    <h2 className="font-sans font-black text-xl sm:text-2xl flex items-center gap-1.5 leading-none">
                      <span>🧙‍♂️ 魔法绘本馆</span>
                    </h2>
                    <span className="text-xs sm:text-sm font-extrabold block mt-2 opacity-95">
                      互动精讲、自动翻页、双色评分，带你开启拼读奥秘 🚀
                    </span>
                  </div>
                </div>
              </div>

              {/* Shelf Grid container */}
              <div className="space-y-3.5 mt-5">
                <h3 className="text-sm font-black text-indigo-950 flex items-center gap-2 px-1">
                  <span>📖 必修三字经绘本专栏 (基础 C-A-T 系列)</span>
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                </h3>

                <div className="grid grid-cols-1 gap-4.5">
                  {PICTURE_BOOKS.map((book) => {
                    const isLocked = book.pages.length === 0;
                    const stamps = progressStamps[book.id] || { listened: false, lectured: false, dubbed: false, practiced: false };

                    return (
                      <motion.div
                        key={book.id}
                        whileHover={!isLocked ? { scale: 1.015, y: -1 } : {}}
                        whileTap={!isLocked ? { scale: 0.99 } : {}}
                        onClick={() => {
                          if (isLocked) {
                            try { audio.playError(); } catch (e) {}
                            return;
                          }
                          try { audio.playClick(); } catch (e) {}
                          setSelectedBook(book);
                          setBookModeAndClean('MENU');
                        }}
                        className={`relative flex flex-col sm:flex-row sm:items-center p-4 rounded-[26px] border-2 transition-all cursor-pointer overflow-hidden ${
                          isLocked 
                            ? 'bg-slate-100 border-slate-200 text-slate-400 opacity-80 cursor-not-allowed' 
                            : 'bg-white border-blue-200 border-b-[5px] border-blue-300 hover:border-amber-400'
                        }`}
                      >
                        {/* Difficulty Capsule */}
                        <span className={`absolute top-3 right-3 text-[10px] font-black px-2.5 py-0.5 rounded-full border ${
                          book.difficulty === 'PRIMARY' 
                            ? 'bg-green-50 border-green-200 text-green-700' 
                            : 'bg-indigo-50 border-indigo-200 text-indigo-700'
                        }`}>
                          {book.difficulty === 'PRIMARY' ? '初级拼读' : '中级语法'}
                        </span>

                        {/* Card Left: Cover */}
                        <div className="flex items-center">
                          {isLocked ? (
                            <div className="w-16 h-20 bg-slate-200 border border-slate-300 rounded-2xl flex items-center justify-center text-3xl shrink-0 mr-4">
                              🔒
                            </div>
                          ) : (
                            <div className="w-16 h-20 bg-[#f0f9ff] border-2 border-blue-150 rounded-2xl shrink-0 overflow-hidden mr-4 p-1 flex items-center justify-center shadow-inner">
                              <SafeImage 
                                src={book.coverImage} 
                                alt={book.title} 
                                className="w-full h-full object-cover rounded-xl"
                                fallbackEmoji={book.pages[0]?.emoji || '📖'}
                              />
                            </div>
                          )}

                          {/* Card Content Description */}
                          <div className="flex-1 min-w-0 text-left">
                            <h4 className={`font-sans font-black text-base sm:text-lg block truncate leading-none ${isLocked ? 'text-slate-400' : 'text-slate-900'}`}>
                              {book.title}
                            </h4>
                            <p className="text-xs font-semibold block leading-relaxed mt-2 text-slate-500/90 whitespace-normal">
                              {book.description}
                            </p>
                          </div>
                        </div>

                        {/* Show checklist stamps inline to give premium achievements feedback */}
                        {!isLocked && (
                          <div className="mt-3.5 sm:mt-0 sm:ml-auto sm:mr-9 flex items-center gap-2 border-t sm:border-t-0 border-dashed border-slate-150 pt-2.5 sm:pt-0">
                            <span className="text-[10px] font-black text-slate-400 block mr-1">魔法契约:</span>
                            
                            <span title="听绘本已达成" className={`text-[11px] font-black px-2 py-0.5 rounded-lg border flex items-center gap-0.5 ${
                              stamps.listened ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : 'bg-slate-50 border-slate-200 text-slate-400'
                            }`}>
                              👂 听
                            </span>
                            <span title="精讲已掌握" className={`text-[11px] font-black px-2 py-0.5 rounded-lg border flex items-center gap-0.5 ${
                              stamps.lectured ? 'bg-indigo-50 border-indigo-300 text-indigo-700' : 'bg-slate-50 border-slate-200 text-slate-400'
                            }`}>
                              💡 译
                            </span>
                            <span title="配音已通过" className={`text-[11px] font-black px-2 py-0.5 rounded-lg border flex items-center gap-0.5 ${
                              stamps.dubbed ? 'bg-amber-50 border-amber-300 text-amber-700' : 'bg-slate-50 border-slate-200 text-slate-400'
                            }`}>
                              🎙️ 读
                            </span>
                            <span title="特训已满分" className={`text-[11px] font-black px-2 py-0.5 rounded-lg border flex items-center gap-0.5 ${
                              stamps.practiced ? 'bg-pink-50 border-pink-300 text-pink-700' : 'bg-slate-50 border-slate-200 text-slate-400'
                            }`}>
                              ⚔️ 练
                            </span>
                          </div>
                        )}

                        <div className="hidden sm:block absolute right-4">
                          <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-800">
                            <ArrowRight size={15} className="stroke-[3]" />
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {/* ================= SCREEN 2: THE MAP PATH MENU (FIGURE 1 COMPLIANT) ================= */}
          {selectedBook && activeBookMode === 'MENU' && (
            <motion.div
              key="book-menu"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="flex-1 flex flex-col space-y-4"
            >
              {/* Back header */}
              <div className="flex justify-between items-center bg-white p-3 rounded-2xl border-2 border-slate-150 shadow-xs">
                <button
                  onClick={handleExitBook}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-150 border-2 border-slate-200 text-slate-800 font-black text-xs rounded-xl"
                >
                  <ArrowLeft size={14} className="stroke-[3]" />
                  <span>藏书阁</span>
                </button>
                <span className="font-extrabold text-sm text-indigo-950 block truncate max-w-[180px] leading-none">
                  {selectedBook.title}
                </span>
                <span className="text-xs font-black text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full block">
                  📖 初阶启蒙
                </span>
              </div>

              {/* Interactive Open Book Path Canvas */}
              <div className="flex-1 bg-gradient-to-br from-indigo-100 via-sky-50 to-emerald-50 border-3 border-indigo-200 rounded-[32px] p-6.5 shadow-sm relative overflow-hidden min-h-[460px] flex flex-col justify-between">
                
                {/* Background cartoon trees and clouds decoration decor */}
                <div className="absolute inset-0 pointer-events-none opacity-40 overflow-hidden">
                  <div className="absolute top-4 left-6 text-4xl select-none">☁️</div>
                  <div className="absolute bottom-6 right-8 text-4xl select-none">🌲</div>
                  <div className="absolute bottom-4 left-10 text-4xl select-none">🍄</div>
                </div>

                {/* Centered Magical Title */}
                <div className="text-center mt-2 shrink-0 relative z-10">
                  <span className="text-[11px] tracking-widest font-black uppercase text-indigo-700 block mb-1.5">
                    🧙‍♂️ 绘绘神殿勇者试炼
                  </span>
                  <h3 className="text-xl sm:text-2xl font-sans font-black text-indigo-950 flex items-center justify-center gap-1.5 leading-none">
                    <span>{selectedBook.title}</span>
                  </h3>
                  <p className="text-xs text-indigo-800/80 font-bold max-w-sm mx-auto leading-relaxed mt-2.5">
                    请按顺序探索听、译、读、练四大魔法板块，开启神殿宝藏水晶吧！
                  </p>
                </div>

                {/* THE MAP PATH GRID (Symmetrically matches the curvature of Image 1 book layout) */}
                <div className="flex-1 my-5 relative z-10 flex flex-col justify-center max-w-sm sm:max-w-md mx-auto w-full">
                  
                  {/* Connect path lines in background vector */}
                  <div className="absolute inset-x-12 top-10 bottom-10 border-l-4 border-dashed border-indigo-300 opacity-60 pointer-events-none" />

                  <div className="grid grid-cols-1 gap-4 select-none relative">
                    
                    {/* Path 1: 听绘本 */}
                    <div className="relative flex items-center justify-start">
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setBookModeAndClean('LISTEN')}
                        className="flex items-center gap-4.5 p-3.5 bg-white border-2 border-indigo-300 border-b-[5px] border-indigo-400 hover:border-amber-400 rounded-3xl w-full text-left relative z-20 group transition-all"
                      >
                        <div className="w-13 h-13 rounded-2xl bg-gradient-to-r from-teal-400 to-emerald-400 text-white flex items-center justify-center text-2xl shadow-inner shrink-0 group-hover:rotate-6 transition-transform">
                          👂
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-sans font-black text-[#1e1b4b] text-base leading-none">
                              1. 听绘本 (Listen)
                            </span>
                            {progressStamps[selectedBook.id]?.listened && (
                              <span className="text-emerald-500 font-extrabold text-xs">✅ 已听完</span>
                            )}
                          </div>
                          <span className="text-xs text-indigo-950/70 block mt-1.5 font-semibold">
                            纯正朗读伴读、自动翻页、单词触听释义
                          </span>
                        </div>
                      </motion.button>
                    </div>

                    {/* Path 2: 学精讲 */}
                    <div className="relative flex items-center justify-start">
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setBookModeAndClean('LECTURE')}
                        className="flex items-center gap-4.5 p-3.5 bg-white border-2 border-indigo-300 border-b-[5px] border-indigo-400 hover:border-amber-400 rounded-3xl w-full text-left relative z-20 group transition-all"
                      >
                        <div className="w-13 h-13 rounded-2xl bg-gradient-to-r from-violet-400 to-fuchsia-400 text-white flex items-center justify-center text-2xl shadow-inner shrink-0 group-hover:rotate-6 transition-transform">
                          💡
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-sans font-black text-[#1e1b4b] text-base leading-none">
                              2. 学精讲 (Grammar)
                            </span>
                            {progressStamps[selectedBook.id]?.lectured && (
                              <span className="text-violet-500 font-extrabold text-xs">✅ 已掌握</span>
                            )}
                          </div>
                          <span className="text-xs text-indigo-950/70 block mt-1.5 font-semibold">
                            解析核心魔法词族、定语修饰、实用句型结构
                          </span>
                        </div>
                      </motion.button>
                    </div>

                    {/* Path 3: 读绘本 */}
                    <div className="relative flex items-center justify-start">
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setBookModeAndClean('READ')}
                        className="flex items-center gap-4.5 p-3.5 bg-white border-2 border-indigo-300 border-b-[5px] border-indigo-400 hover:border-amber-400 rounded-3xl w-full text-left relative z-20 group transition-all"
                      >
                        <div className="w-13 h-13 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-400 text-white flex items-center justify-center text-2xl shadow-inner shrink-0 group-hover:rotate-6 transition-transform">
                          🎙️
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-sans font-black text-[#1e1b4b] text-base leading-none">
                              3. 读绘本 (Dubbing)
                            </span>
                            {progressStamps[selectedBook.id]?.dubbed && (
                              <span className="text-amber-500 font-extrabold text-xs">✅ 已通过</span>
                            )}
                          </div>
                          <span className="text-xs text-indigo-950/70 block mt-1.5 font-semibold">
                            魔音录制、专属语音波形、双色评定通关
                          </span>
                        </div>
                      </motion.button>
                    </div>

                    {/* Path 4: 练绘本 */}
                    <div className="relative flex items-center justify-start">
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setBookModeAndClean('PRACTICE')}
                        className="flex items-center gap-4.5 p-3.5 bg-white border-2 border-indigo-300 border-b-[5px] border-indigo-400 hover:border-amber-400 rounded-3xl w-full text-left relative z-20 group transition-all"
                      >
                        <div className="w-13 h-13 rounded-2xl bg-gradient-to-r from-pink-400 to-rose-400 text-white flex items-center justify-center text-2xl shadow-inner shrink-0 group-hover:rotate-6 transition-transform">
                          ⚔️
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-sans font-black text-[#1e1b4b] text-base leading-none">
                              4. 练绘本 (Practice)
                            </span>
                            {progressStamps[selectedBook.id]?.practiced && (
                              <span className="text-pink-500 font-extrabold text-xs">✅ 完美通关</span>
                            )}
                          </div>
                          <span className="text-xs text-indigo-950/70 block mt-1.5 font-semibold">
                            看图选词、句子大乱重组、连线闯关，巩固记忆
                          </span>
                        </div>
                      </motion.button>
                    </div>

                  </div>
                </div>

                {/* Footer status summary */}
                <div className="text-center shrink-0 relative z-10 w-full flex items-center justify-center gap-1.5 bg-indigo-950/5 py-2.5 rounded-2xl">
                  <span className="text-xs font-black text-indigo-900 block">🏆 我的探索水晶进度:</span>
                  <div className="flex gap-1">
                    {['listened', 'lectured', 'dubbed', 'practiced'].map((key) => {
                      const stamps = progressStamps[selectedBook.id] || {};
                      const done = stamps[key as keyof typeof stamps];
                      return (
                        <span key={key} className={`text-md leading-none ${done ? 'opacity-100 grayscale-0' : 'opacity-25 grayscale'}`}>
                          💎
                        </span>
                      );
                    })}
                  </div>
                </div>

              </div>
            </motion.div>
          )}

          {/* ================= SCREEN 3: LISTEN MODE (听绘本) ================= */}
          {selectedBook && activeBookMode === 'LISTEN' && (
            <motion.div
              key="book-listen"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="flex-1 flex flex-col space-y-4"
            >
              {/* Listen Header */}
              <div className="flex justify-between items-center bg-white/80 p-3 rounded-2xl border-2 border-emerald-150 shadow-xs shrink-0">
                <button
                  onClick={() => setBookModeAndClean('MENU')}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 border-2 border-emerald-200 text-emerald-900 font-black text-xs rounded-xl"
                >
                  <ArrowLeft size={14} className="stroke-[3]" />
                  <span>神殿地图</span>
                </button>
                <div className="flex items-center space-x-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-black text-emerald-950 text-sm">听绘本: 魔法朗读</span>
                </div>
                <div className="text-xs bg-slate-950/5 border border-slate-250 px-2.5 py-1 rounded-full font-black text-slate-800 tabular-nums">
                  Page {currentPageIdx + 1} / {selectedBook.pages.length}
                </div>
              </div>

              {/* Main Reading Frame */}
              <div className="flex-1 bg-gradient-to-b from-white to-emerald-50/50 border-3 border-emerald-300 border-b-[8px] border-emerald-400 rounded-[32px] p-5.5 shadow-sm relative flex flex-col justify-between overflow-hidden min-h-[460px]">
                
                {/* Auto Playing Controller header bar */}
                <div className="flex items-center justify-between bg-emerald-900/10 p-2.5 rounded-2xl mb-4 shrink-0 border border-emerald-500/10">
                  <div className="flex items-center space-x-1.5">
                    <span className="text-xl">🧙‍♂️</span>
                    <span className="text-xs font-black text-emerald-950">
                      {isAutoPlaying ? '正在魔法自动翻页伴读中...' : '深度词汇触摸学习模式 (已静止)'}
                    </span>
                  </div>
                  
                  {/* Play Pause button */}
                  <button
                    onClick={() => {
                      try { audio.playClick(); } catch (e) {}
                      setIsAutoPlaying(!isAutoPlaying);
                    }}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1 border-2 transition-transform active:scale-95 cursor-pointer ${
                      isAutoPlaying 
                        ? 'bg-amber-400 border-amber-500 text-amber-950 hover:bg-amber-500' 
                        : 'bg-white border-emerald-400 text-emerald-800 hover:bg-emerald-50'
                    }`}
                  >
                    <span>{isAutoPlaying ? '⏸️ 暂停自动翻页' : '▶️ 开启自动翻页'}</span>
                  </button>
                </div>

                {/* Cartoon Illustrator area */}
                <div className="relative w-full aspect-[4/3] bg-gradient-to-br from-emerald-50 to-indigo-50 border-3 border-emerald-200 rounded-3xl overflow-hidden shadow-xs shrink-0 flex items-center justify-center">
                  <SafeImage 
                    src={getIllustrationForSentence(selectedBook.pages[currentPageIdx]?.english || '', selectedBook.pages[currentPageIdx]?.image || '')} 
                    alt="Illustration" 
                    className="w-full h-full object-cover transition-all"
                    fallbackEmoji={selectedBook.pages[currentPageIdx]?.emoji}
                    style={{ fontSize: '5rem' }}
                  />
                  
                  {isAutoPlaying && (
                    <div className="absolute top-2.5 right-2.5 bg-emerald-500 text-white font-extrabold text-[9px] px-2 py-0.5 rounded-md flex items-center gap-1 border border-emerald-600 animate-bounce">
                      <span>🔊 声带共振中</span>
                    </div>
                  )}
                </div>

                {/* Splitted English sentence & Chinese translations */}
                <div className="flex-1 py-4 flex flex-col items-center justify-center space-y-3.5 relative z-10 text-center">
                  
                  {/* Click sentence to speakers */}
                  <div className="w-full">
                    <div className="text-xs font-black text-slate-400 block mb-2 tracking-wider">
                      👇 戳戳个别单词，查看发音及神奇词性 🔍
                    </div>
                    
                    <div className="flex flex-wrap justify-center items-center gap-1.5 py-1.5 bg-indigo-50/40 border-2 border-indigo-150 rounded-2xl px-2.5 max-w-md mx-auto relative cursor-default">
                      {selectedBook.pages[currentPageIdx]?.english.split(' ').map((word, idx) => {
                        return (
                          <div key={idx} className="relative inline-block">
                            {/* POP OVER DEFINITION AND POS (FIGURE 2 COMPLIANT) */}
                            {selectedWordIndex === idx && selectedWordDetail && (
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-54 bg-indigo-950 text-white rounded-2xl p-3.5 shadow-2xl z-50 text-left border-2 border-indigo-400 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-indigo-950" />
                                
                                <div className="flex items-center justify-between mb-1.5">
                                  <span className="font-sans font-black text-amber-400 text-sm tracking-wide">
                                    {selectedWordDetail.word}
                                  </span>
                                  <span className="text-[10px] bg-indigo-500/30 text-indigo-300 border border-indigo-400/40 px-2 py-0.5 rounded-md font-black">
                                    {selectedWordDetail.typeBadge}
                                  </span>
                                </div>
                                
                                <div className="text-xs font-mono text-indigo-200 mb-2 flex items-center gap-1">
                                  <span>音标: {selectedWordDetail.pron}</span>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      audio.speak(selectedWordDetail.word);
                                    }}
                                    className="p-0.5 text-xs bg-indigo-900 border border-indigo-700 hover:bg-indigo-800 text-amber-300 rounded ml-1 select-none active:scale-90"
                                  >
                                    🔊
                                  </button>
                                </div>
                                <p className="text-xs text-white/95 font-extrabold border-t border-indigo-900 pt-1.5 leading-relaxed">
                                  {selectedWordDetail.pos}
                                </p>
                              </div>
                            )}

                            <span
                              onClick={(e) => handleWordClick(word, idx, e)}
                              className={`inline-block px-1.5 py-0.5 font-sans font-black text-2xl tracking-wide rounded-xl border cursor-pointer border-transparent transition-all hover:bg-amber-300 hover:text-amber-950 ${
                                selectedWordIndex === idx 
                                  ? 'bg-amber-400 text-indigo-950 border-amber-500 shadow-md scale-102 font-black' 
                                  : 'text-indigo-950'
                              }`}
                            >
                              {word}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Sentence Translation */}
                  <p className="text-indigo-900 text-sm sm:text-base font-extrabold max-w-[280px]">
                    {selectedBook.pages[currentPageIdx]?.chinese}
                  </p>
                </div>

                {/* Auto Play feedback slider placeholder */}
                {isAutoPlaying && (
                  <div className="shrink-0 pt-2 w-full text-center">
                    <span className="text-[10.5px] font-bold text-emerald-700 animate-pulse block">
                      魔法拼读播放完后将自动翻至下一页... ⏱️
                    </span>
                  </div>
                )}

              </div>

              {/* RATING DIALOG ON FINISHED */}
              <AnimatePresence>
                {showListenCompleteDialog && (
                  <div className="fixed inset-0 z-[120] bg-indigo-950/70 backdrop-blur-md flex items-center justify-center p-4">
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.9, opacity: 0 }}
                      className="bg-white border-3 border-emerald-400 p-6 rounded-[32px] w-full max-w-sm text-center shadow-2xl relative"
                    >
                      <div className="text-5xl mb-3">🎓</div>
                      <h4 className="text-lg font-black text-indigo-950 mb-1">
                        恭喜通关听力魔法！
                      </h4>
                      <p className="text-xs font-semibold text-slate-500 mb-4 max-w-[240px] mx-auto leading-relaxed">
                        你非常专注地听完了整卷魔法书，获取丰厚的探索水晶点！
                      </p>
                      
                      <div className="bg-emerald-50 text-emerald-800 p-2.5 rounded-2xl mb-4.5 border border-emerald-200">
                        <span className="text-xs font-bold block mb-1">获得通关奖励</span>
                        <div className="flex justify-center gap-3 font-black text-base">
                          <span>✨ +15 XP</span>
                          <span>💎 +10 金币</span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setShowListenCompleteDialog(false);
                            setBookModeAndClean('MENU');
                          }}
                          className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 border-b-[4px] border-emerald-700 rounded-2xl font-black text-white text-xs hover:brightness-105"
                        >
                          返回神殿地图
                        </button>
                        <button
                          onClick={() => {
                            setShowListenCompleteDialog(false);
                            setBookModeAndClean('LECTURE');
                          }}
                          className="flex-1 py-3 bg-indigo-50 hover:bg-indigo-100 border-2 border-indigo-200 text-indigo-950 rounded-2xl font-black text-xs"
                        >
                          去学精讲解释
                        </button>
                      </div>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>

              {/* Standard PREV-NEXT navigators */}
              <div className="flex justify-between items-center bg-white/40 p-1 rounded-2xl shrink-0">
                {/* Prev */}
                <button
                  disabled={currentPageIdx === 0}
                  onClick={() => {
                    try { audio.playClick(); } catch (e) {}
                    setCurrentPageIdx(prev => prev - 1);
                    setIsAutoPlaying(false); // Stop auto playing on manual taps
                  }}
                  className={`flex-1 py-3 px-3 border-2 rounded-xl font-black text-xs mr-2 flex items-center justify-center gap-1 cursor-pointer transition-transform ${
                    currentPageIdx === 0 
                      ? 'bg-slate-100 border-slate-200 text-slate-350 cursor-not-allowed opacity-50' 
                      : 'bg-white border-slate-200 text-slate-800 border-b-[4px] active:translate-y-[2px]'
                  }`}
                >
                  <ArrowLeft size={13} className="stroke-[3]" />
                  <span>上一页</span>
                </button>

                {/* Next */}
                <button
                  disabled={currentPageIdx === selectedBook.pages.length - 1}
                  onClick={() => {
                    try { audio.playClick(); } catch (e) {}
                    setCurrentPageIdx(prev => prev + 1);
                    setIsAutoPlaying(false); // Stop auto playing on manual taps
                  }}
                  className={`flex-1 py-3 px-3 border-2 rounded-xl font-black text-xs flex items-center justify-center gap-1 cursor-pointer transition-transform ${
                    currentPageIdx === selectedBook.pages.length - 1 
                      ? 'bg-slate-100 border-slate-200 text-slate-350 cursor-not-allowed opacity-50' 
                      : 'bg-white border-slate-200 text-slate-800 border-b-[4px] active:translate-y-[2px]'
                  }`}
                >
                  <span>下一页</span>
                  <ArrowRight size={13} className="stroke-[3]" />
                </button>
              </div>

            </motion.div>
          )}

          {/* ================= SCREEN 4: LECTURE MODE (学精讲) ================= */}
          {selectedBook && activeBookMode === 'LECTURE' && (() => {
            const summary = getLectureSummaryForBook(selectedBook);
            return (
              <motion.div
                key="book-lecture"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="flex-1 flex flex-col space-y-4 text-left"
              >
                {/* Lecture Header */}
                <div className="flex justify-between items-center bg-white p-3 rounded-2xl border-2 border-violet-150 shadow-xs">
                  <button
                    onClick={() => setBookModeAndClean('MENU')}
                    className="flex items-center space-x-1.5 px-3 py-1.5 bg-violet-50 hover:bg-violet-100 border-2 border-violet-200 text-violet-900 font-black text-xs rounded-xl"
                  >
                    <ArrowLeft size={14} className="stroke-[3]" />
                    <span>神殿地图</span>
                  </button>
                  <div className="flex items-center space-x-1">
                    <span className="text-xl">💡</span>
                    <span className="font-extrabold text-[#1e1b4b] text-sm">学精讲: 黄金魔法句式</span>
                  </div>
                  <span className="text-xs font-black text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-full block">
                    {summary.familyBadge}
                  </span>
                </div>

                {/* Lecture Board Scroll Paper */}
                <div className="flex-1 bg-gradient-to-b from-white to-violet-50 border-3 border-violet-300 border-b-[8px] border-violet-400 rounded-[32px] p-5 sm:p-6 shadow-sm overflow-y-auto max-h-[500px]">
                  
                  {/* Banner title */}
                  <div className="bg-gradient-to-r from-violet-500 to-indigo-500 p-4 border border-violet-300 rounded-2xl text-white mb-5">
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-90">魔法契约解读</span>
                    <h4 className="text-base sm:text-lg font-black leading-none mt-1">
                      {summary.bannerTitle}
                    </h4>
                  </div>

                  {/* List items representing grammar focus points */}
                  <div className="space-y-4">
                    {summary.points.map((pt, index) => (
                      <div key={index} className="bg-white border-2 border-violet-150 border-b-[4px] border-violet-200 rounded-2xl p-4 transition-transform hover:scale-[1.01]">
                        <div className="flex items-center gap-2 mb-2.5">
                          <span className="p-1 px-2.5 text-xs bg-violet-100 rounded-xl text-violet-700 font-extrabold">{pt.num}</span>
                          <h4 className="font-sans font-black text-[#1e1b4b] text-base leading-none">
                            {pt.title}
                          </h4>
                        </div>
                        <p className="text-xs text-slate-500/90 font-semibold leading-relaxed">
                          {pt.desc}
                        </p>
                        
                        {pt.examples && pt.examples.length > 0 && (
                          <div className="mt-3.5 bg-slate-50 p-3 rounded-xl space-y-1 border border-slate-100">
                            <span className="text-[10px] font-black text-slate-400 block tracking-wider">魔法口诀例句 (Click to Speak):</span>
                            {pt.examples.map((ex, exIdx) => (
                              <button 
                                key={exIdx}
                                onClick={() => handleSpeak(ex.english)}
                                className="text-left py-1 hover:text-indigo-600 block text-xs font-black text-[#1e1b4b] w-full"
                              >
                                🗣️ <span className="underline decoration-dashed decoration-violet-500">{ex.english}</span> ({ex.chinese})
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Call to arms */}
                  <div className="mt-6 flex flex-col sm:flex-row gap-3">
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setBookModeAndClean('MENU')}
                      className="flex-1 py-3 bg-gradient-to-r from-violet-500 to-[#7c3aed] border-b-[4px] border-violet-850 rounded-2xl text-white text-xs sm:text-sm font-black flex items-center justify-center gap-1 shadow cursor-pointer hover:scale-102"
                    >
                      <span>🎯 我已学懂！返回神殿地图</span>
                      <ArrowRight size={14} className="stroke-[3]" />
                    </motion.button>
                  </div>

                </div>
              </motion.div>
            );
          })()}

          {/* ================= SCREEN 5: READ MODE (读绘本 / 配音评级) ================= */}
          {selectedBook && activeBookMode === 'READ' && (
            <motion.div 
              key="book-read"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="flex-1 flex flex-col space-y-4"
            >
              {/* Dubbing Header */}
              <div className="flex justify-between items-center bg-white/10 p-3 rounded-2xl border-2 border-amber-250 shadow-xs shrink-0">
                <button
                  onClick={() => setBookModeAndClean('MENU')}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 border-2 border-amber-200 text-amber-900 font-black text-xs rounded-xl"
                >
                  <ArrowLeft size={14} className="stroke-[3]" />
                  <span>神殿地图</span>
                </button>
                <div className="flex items-center space-x-1.5">
                  <span className="text-xl">🎙️</span>
                  <span className="font-extrabold text-[#1e1b4b] text-sm">读绘本 / 配音大赛</span>
                </div>
                <div className="text-xs bg-slate-950/5 border border-slate-250 px-2.5 py-1 rounded-full font-black text-slate-800 tabular-nums">
                  Page {currentPageIdx + 1} / {selectedBook.pages.length}
                </div>
              </div>

              {/* Main Reading core card */}
              <div className="flex-1 bg-gradient-to-b from-white to-[#fefbeb] border-3 border-amber-300 border-b-[8px] border-amber-400 rounded-[32px] p-5 shadow-sm relative flex flex-col justify-between overflow-hidden min-h-[460px]">
                
                {/* Illustration Preview */}
                <div className="w-full aspect-[4/3] bg-gradient-to-br from-amber-50 to-indigo-50 border-3 border-amber-200 rounded-3xl overflow-hidden shadow-xs shrink-0 flex items-center justify-center relative">
                  <SafeImage 
                    src={getIllustrationForSentence(selectedBook.pages[currentPageIdx]?.english || '', selectedBook.pages[currentPageIdx]?.image || '')} 
                    alt="Illustration" 
                    className="w-full h-full object-cover select-none"
                    fallbackEmoji={selectedBook.pages[currentPageIdx]?.emoji}
                    style={{ fontSize: '5rem' }}
                  />
                  
                  {/* Stamp status overlay */}
                  {hasDubbedPage[currentPageIdx] && (
                    <span className={`absolute bottom-3 right-3 flex items-center gap-1 font-black text-xs px-3 py-1.5 rounded-xl shadow-md border ${
                      hasDubbedPage[currentPageIdx] === 'PASS' 
                        ? 'bg-emerald-500 text-white border-emerald-400 animate-bounce' 
                        : 'bg-amber-400 text-amber-950 border-amber-500'
                    }`}>
                      {hasDubbedPage[currentPageIdx] === 'PASS' ? '✅ 配音通过' : '⚡ 差一点点'}
                    </span>
                  )}
                </div>

                {/* English - translation sentence */}
                <div className="flex-1 py-4 flex flex-col items-center justify-center space-y-3 relative z-10 text-center">
                  
                  {/* English phrase */}
                  <motion.button
                    whileHover={{ scale: 1.025 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSpeak(selectedBook.pages[currentPageIdx]?.english)}
                    className="group relative cursor-pointer px-4.5 py-3.5 rounded-2xl border-2 border-amber-200 border-b-[4px] border-amber-300 hover:border-amber-400 hover:bg-amber-50 bg-[#fefdf6] text-center w-full shadow-xs transition-all flex items-center justify-center space-x-2"
                  >
                    <Volume2 className="w-5.5 h-5.5 text-amber-700 group-hover:animate-bounce shrink-0" />
                    <span className="font-sans font-black text-2xl tracking-wide text-indigo-950 select-none">
                      {selectedBook.pages[currentPageIdx]?.english}
                    </span>
                    <span className="absolute -top-3.5 right-4 text-[9.5px] bg-amber-400 border border-amber-500 text-amber-950 font-black px-1.5 py-0.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                      魔法朗读 (Click)
                    </span>
                  </motion.button>

                  <p className="text-amber-900 text-sm sm:text-base font-extrabold max-w-[280px]">
                    {selectedBook.pages[currentPageIdx]?.chinese}
                  </p>
                </div>

                {/* Dual evaluation and speech waveforms */}
                <div className="border-t border-dashed border-amber-200 pt-4 cursor-default shrink-0 space-y-3 relative z-10 w-full flex flex-col items-center">
                  
                  {/* Flashing soundwave panel when active */}
                  {isRecording && (
                    <div className="flex items-center space-x-1.5 justify-center py-2 animate-pulse">
                      <span className="h-4 w-1 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                      <span className="h-6 w-1 bg-amber-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                      <span className="h-5 w-1 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
                      <span className="h-7 w-1 bg-amber-700 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                      <span className="text-xs font-black text-amber-800 ml-1">声频共鸣录音中 {recordingDuration}s...</span>
                    </div>
                  )}

                  {/* Trigger speech button */}
                  <div className="flex items-center gap-3 w-full">
                    <button
                      onClick={isRecording ? stopRecording : startRecording}
                      className={`flex-1 py-4 rounded-2xl font-black text-base text-white shadow flex items-center justify-center space-x-2 transition-all cursor-pointer ${
                        isRecording 
                          ? 'bg-gradient-to-r from-red-500 to-rose-600 border-b-[4px] border-red-700 animate-pulse' 
                          : 'bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 border-b-[4px] border-orange-700 hover:brightness-105 hover:scale-101 active:scale-98 active:translate-y-[2px]'
                      }`}
                    >
                      <Mic className={`w-5 h-5 ${isRecording ? 'animate-bounce text-white' : 'text-amber-100'}`} />
                      <span>{isRecording ? '停止录音 (Stop)' : '录制我的配音 (Record)'}</span>
                    </button>
                  </div>

                  {/* DIRECT DUBBING EVALUATOR CONTROLS (通过 / 继续加油两档) */}
                  <div className="bg-white p-2.5 rounded-2xl border-2 border-amber-150 w-full text-center">
                    <span className="text-[10px] uppercase font-black text-amber-700 tracking-wider block mb-2">
                      🎯 绘卷教师奥术评分测试 (魔法回声)
                    </span>
                    
                    <div className="grid grid-cols-2 gap-2.5">
                      {/* Pass button */}
                      <button
                        onClick={() => forceFeedback('PASS')}
                        className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-2 border-emerald-300 px-3 py-2 rounded-xl text-xs font-black flex items-center justify-center gap-1 cursor-pointer transition-transform active:scale-95"
                      >
                        <span>🏆 评定「通过」</span>
                      </button>

                      {/* Try Again button */}
                      <button
                        onClick={() => forceFeedback('TRY_AGAIN')}
                        className="bg-amber-50 hover:bg-amber-100 text-amber-800 border-2 border-amber-300 px-3 py-2 rounded-xl text-xs font-black flex items-center justify-center gap-1 cursor-pointer transition-transform active:scale-95"
                      >
                        <span>⚡ 评定「继续加油」</span>
                      </button>
                    </div>
                  </div>

                </div>

              </div>

              {/* RATING DIALOG OVERLAYS */}
              <AnimatePresence>
                {showRating && ratingGrade && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 15 }}
                    className="fixed inset-x-5 bottom-8 z-[120] max-w-sm mx-auto"
                  >
                    <div className={`p-4 rounded-3xl border-3 shadow-2xl relative overflow-hidden backdrop-blur-md ${
                      ratingGrade === 'PASS' 
                        ? 'bg-emerald-950/95 border-emerald-400 text-emerald-50' 
                        : 'bg-amber-950/95 border-amber-400 text-amber-50'
                    }`}>
                      <div className="flex items-start space-x-3">
                        <div className="text-3xl p-2 bg-white/10 rounded-xl leading-none">
                          {ratingGrade === 'PASS' ? '🌟' : '🦁'}
                        </div>
                        <div className="flex-1 text-left space-y-1">
                          <h4 className="font-sans font-black text-sm">
                            {ratingGrade === 'PASS' ? '✨ 配音表现：通关大吉！' : '⚡ 契约回响：继续努力哦！'}
                          </h4>
                          <p className={`text-xs block leading-relaxed ${
                            ratingGrade === 'PASS' ? 'text-emerald-200' : 'text-amber-200'
                          }`}>
                            {ratingGrade === 'PASS' 
                              ? '大声朗读，口型极其标准！获得了 +10 魔法能量 & +5 纯正魔法币！' 
                              : '发音声能略有飘散，不要气馁！可以用手指戳上方的卡片听几遍标准音，再次试试吧！'}
                          </p>

                          <div className="flex gap-2 pt-2">
                            <button
                              onClick={() => {
                                setShowRating(false);
                                startRecording();
                              }}
                              className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1 cursor-pointer ${
                                ratingGrade === 'PASS'
                                  ? 'bg-emerald-500 hover:bg-emerald-400 text-white border border-emerald-600'
                                  : 'bg-amber-400 hover:bg-amber-500 text-amber-950 border border-amber-500'
                              }`}
                            >
                              <span>重新录制 (Retry)</span>
                            </button>
                            <button
                              onClick={() => setShowRating(false)}
                              className="px-3.5 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-extrabold"
                            >
                              好哒
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* DUBBING PREV NEXT PAGE LEVEL */}
              <div className="flex justify-between items-center bg-white/40 p-1 rounded-2xl shrink-0">
                <button
                  disabled={currentPageIdx === 0}
                  onClick={() => {
                    try { audio.playClick(); } catch (e) {}
                    setCurrentPageIdx(prev => prev - 1);
                    setShowRating(false);
                    setRatingGrade(null);
                  }}
                  className={`flex-1 py-3 px-3 border-2 rounded-xl font-black text-xs mr-2 flex items-center justify-center gap-1.5 cursor-pointer ${
                    currentPageIdx === 0 
                      ? 'bg-slate-100 border-slate-200 text-slate-350 cursor-not-allowed opacity-50' 
                      : 'bg-white border-slate-200 text-slate-850 border-b-[4px] active:translate-y-[2px]'
                  }`}
                >
                  <ArrowLeft size={13} className="stroke-[3]" />
                  <span>上一页</span>
                </button>

                <button
                  disabled={currentPageIdx === selectedBook.pages.length - 1}
                  onClick={() => {
                    try { audio.playClick(); } catch (e) {}
                    setCurrentPageIdx(prev => prev + 1);
                    setShowRating(false);
                    setRatingGrade(null);
                  }}
                  className={`flex-1 py-3 px-3 border-2 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 cursor-pointer ${
                    currentPageIdx === selectedBook.pages.length - 1 
                      ? 'bg-slate-100 border-slate-200 text-slate-350 cursor-not-allowed opacity-50' 
                      : 'bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950 border-b-[4px] border-amber-600 active:translate-y-[2px]'
                  }`}
                >
                  <span>下一页</span>
                  <ArrowRight size={13} className="stroke-[3]" />
                </button>
              </div>

            </motion.div>
          )}

          {/* ================= SCREEN 6: PRACTICE MODE (练绘本 / 巩固测练) ================= */}
          {selectedBook && activeBookMode === 'PRACTICE' && (
            <motion.div
              key="book-practice"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="flex-1 flex flex-col space-y-4 text-left select-none cursor-default"
            >
              {/* Practice Header */}
              <div className="flex justify-between items-center bg-white p-3 rounded-2xl border-2 border-pink-150 shadow-xs">
                <button
                  onClick={() => setBookModeAndClean('MENU')}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-pink-50 hover:bg-pink-100 border-2 border-pink-200 text-pink-900 font-black text-xs rounded-xl"
                >
                  <ArrowLeft size={14} className="stroke-[3]" />
                  <span>神殿地图</span>
                </button>
                <div className="flex items-center space-x-1.5">
                  <span className="text-md">⚔️</span>
                  <span className="font-extrabold text-[#1e1b4b] text-sm">练绘本: 三关大合集</span>
                </div>
                <div className="text-xs bg-pink-50 border border-pink-200 text-pink-700 px-2.5 py-0.5 rounded-full block font-black">
                  第 {practiceStage + 1} / 3 关
                </div>
              </div>

              {/* Practice Content Grid Canvas */}
              <div className="flex-1 bg-gradient-to-b from-white to-pink-50 border-3 border-pink-300 border-b-[8px] border-pink-400 rounded-[32px] p-5 sm:p-6 shadow-sm min-h-[460px] flex flex-col justify-between">
                
                {/* Practice Stage Complete Shield */}
                {practiceComplete ? (
                  <div className="flex-1 py-10 flex flex-col items-center justify-center text-center space-y-4">
                    <div className="text-6xl animate-bounce">🏆</div>
                    <h4 className="text-xl font-black text-[#1e1b4b]">
                      完美达成！特训三星解锁！
                    </h4>
                    <p className="text-xs text-slate-500 font-semibold max-w-xs leading-relaxed">
                      你非常顺利地挑战过了“选词填空”、“句子重排”和“看图辨析”三大力作！
                    </p>
                    
                    <div className="bg-pink-50 text-pink-800 p-3 rounded-2xl border border-pink-150 w-full max-w-[240px]">
                      <span className="text-xs font-bold block mb-1">本次通过勋章得</span>
                      <div className="flex justify-center gap-3 font-extrabold text-base">
                        <span>✨ +25 XP</span>
                        <span>💎 +15 魔法币</span>
                      </div>
                    </div>

                    <button
                      onClick={() => setBookModeAndClean('MENU')}
                      className="w-full max-w-[200px] py-3.5 bg-gradient-to-r from-pink-500 to-rose-600 border-b-[4px] border-pink-700 rounded-3xl text-white font-black text-xs shadow hover:brightness-105"
                    >
                      领取奖章并返回神殿
                    </button>
                  </div>
                ) : (
                  <>
                    {/* STAGE 0: FILL IN THE BLANKS */}
                    {practiceStage === 0 && q && (
                      <div className="flex-1 flex flex-col justify-between space-y-4">
                        <div className="space-y-1">
                          <span className="text-[10px] tracking-wider font-extrabold text-pink-650 block">{q.title}</span>
                          <h4 className="text-sm font-black text-indigo-950">
                            选择最恰当的修饰词补全完整句子法咒！
                          </h4>
                        </div>

                        {/* Illustration wrapper */}
                        <div className="w-full h-36 bg-white border border-pink-200 rounded-2xl overflow-hidden flex items-center justify-center p-2 shadow-inner relative max-w-xs mx-auto">
                          <SafeImage 
                            src={getIllustrationForSentence(q.correctAnswer, q.image)} 
                            alt="Illustration Prompt" 
                            className="h-full object-contain"
                            fallbackEmoji={q.emoji}
                            style={{ fontSize: '4.5rem' }}
                          />
                        </div>

                        {/* Dynamic blanks block */}
                        <div className="text-center py-2 relative">
                          <div className="inline-flex items-center gap-2 bg-indigo-50/70 border border-indigo-200/50 p-3 rounded-2xl text-lg font-black text-indigo-950">
                            {(() => {
                              const parts = q.problem.split('______');
                              return (
                                <>
                                  <span>{parts[0]}</span>
                                  <span className={`px-4.5 py-1 min-w-[70px] border-b-2 font-mono text-center inline-block ${
                                    blankAnswerSelected ? 'text-pink-600 border-pink-400 border-b-0 animate-pulse' : 'text-slate-400 border-slate-400'
                                  }`}>
                                    {blankAnswerSelected || '______'}
                                  </span>
                                  <span>{parts[1]}</span>
                                </>
                              );
                            })()}
                          </div>
                          
                          <div className="text-[10px] text-slate-400 font-extrabold block mt-1.5">
                            提示中文: {q.chineseHint}
                          </div>
                        </div>

                        {/* Interactive options */}
                        <div className="space-y-3 shrink-0">
                          <div className="grid grid-cols-2 gap-2.5">
                            {q.options.map((opt: string) => (
                              <button
                                key={opt}
                                disabled={blankChecked}
                                onClick={() => {
                                  try { audio.playPop(); } catch (e) {}
                                  setBlankAnswerSelected(opt);
                                }}
                                className={`py-3 rounded-2xl font-black text-xs border-2 select-none cursor-pointer transition-transform duration-100 ${
                                  blankAnswerSelected === opt 
                                    ? 'bg-pink-100 border-pink-400 text-pink-900 border-b-[4px]' 
                                    : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800'
                                }`}
                              >
                                {opt}
                              </button>
                            ))}
                          </div>

                          {/* Action checkers */}
                          {blankChecked ? (
                            <div className="p-3 bg-white border border-slate-150 rounded-2xl flex items-center justify-between">
                              <span className={`text-xs font-extrabold ${blankIsCorrect ? 'text-emerald-700' : 'text-red-700'}`}>
                                {blankIsCorrect ? '🎉 爆赞通过！法力大增！' : `❌ 答错啦，正确的答案是: ${q.correctAnswer}`}
                              </span>
                              <button
                                onClick={() => {
                                  if (blankIsCorrect) {
                                    setCurrentQuestionIdx(prev => prev + 1);
                                    resetQuestionStates();
                                  } else {
                                    setBlankAnswerSelected(null);
                                    setBlankChecked(false);
                                    setBlankIsCorrect(false);
                                  }
                                }}
                                className={`px-4 py-1.5 rounded-lg text-xs font-black text-white ${
                                  blankIsCorrect ? 'bg-emerald-500' : 'bg-red-500'
                                }`}
                              >
                                {blankIsCorrect ? '下一题' : '重试一次'}
                              </button>
                            </div>
                          ) : (
                            <button
                              disabled={!blankAnswerSelected}
                              onClick={handleCheckBlank}
                              className={`w-full py-3.5 rounded-2xl font-black text-xs text-center border-b-[4px] block shadow ${
                                blankAnswerSelected 
                                  ? 'bg-pink-500 border-pink-700 hover:brightness-105 text-white' 
                                  : 'bg-slate-100 text-slate-350 border-slate-200 cursor-not-allowed opacity-75'
                              }`}
                            >
                              校验回答
                            </button>
                          )}
                        </div>

                      </div>
                    )}

                    {/* STAGE 1: SENTENCE UNSCRAMBLE */}
                    {practiceStage === 1 && q && (
                      <div className="flex-1 flex flex-col justify-between space-y-4">
                        <div className="space-y-1">
                          <span className="text-[10px] tracking-wider font-extrabold text-pink-650 block">{q.title}</span>
                          <h4 className="text-sm font-black text-[#1e1b4b]">
                            请根据中文大意，点击磁块按正确句法规则进行复原！
                          </h4>
                        </div>

                        {/* Illustration */}
                        <div className="w-full h-28 bg-white border border-pink-100 rounded-2xl overflow-hidden flex items-center justify-center p-2 shadow-inner relative max-w-xs mx-auto">
                          <SafeImage 
                            src={getIllustrationForSentence(q.problem, q.image)} 
                            alt="Illustration" 
                            className="h-full object-contain"
                            fallbackEmoji={q.emoji}
                            style={{ fontSize: '3rem' }}
                          />
                        </div>

                        {/* Chinese hint panel */}
                        <div className="bg-white/80 p-2.5 rounded-2xl border border-pink-150 text-center font-black">
                          <span className="text-[10px] text-slate-400 block mb-0.5">中文示意提示</span>
                          <span className="text-indigo-950 text-sm">“ {q.chineseHint} ”</span>
                        </div>

                        {/* Constructed active sentence bar */}
                        <div className="bg-indigo-50/50 border-2 border-indigo-150 rounded-2xl p-4 text-center min-h-[50px] flex flex-wrap items-center justify-center gap-1.5 relative select-none">
                          {selectedUnscrambleWords.length === 0 ? (
                            <span className="text-slate-400 text-xs font-bold font-mono">请在下方点选词块...</span>
                          ) : (
                            selectedUnscrambleWords.map((word, index) => (
                              <button
                                key={index}
                                disabled={unscrambleChecked}
                                onClick={() => handleUnscrambleWordClick(word)}
                                className="px-2.5 py-1 text-xs font-bold bg-pink-100 text-pink-900 border border-pink-300 rounded-lg"
                              >
                                {word}
                              </button>
                            ))
                          )}
                        </div>

                        {/* Shuffled options card list */}
                        <div className="space-y-4 shrink-0">
                          <div>
                            <span className="text-[10.5px] font-black text-slate-400 block mb-2 text-center">可点选微型魔法词块 (可反向点击取消)</span>
                            <div className="flex flex-wrap gap-2 justify-center select-none">
                              {shuffledWords.map((word, idx) => {
                                return (
                                  <button
                                    key={`${word}-${idx}`}
                                    disabled={unscrambleChecked}
                                    onClick={() => {
                                      if (unscrambleChecked) return;
                                      try { audio.playPop(); } catch (e) {}
                                      setSelectedUnscrambleWords(prev => {
                                        if (prev.includes(word)) {
                                          return prev.filter(w => w !== word);
                                        } else {
                                          return [...prev, word];
                                        }
                                      });
                                    }}
                                    className={`px-3 py-2 rounded-xl text-xs font-black border-2 transition-transform active:scale-95 cursor-pointer ${
                                      selectedUnscrambleWords.includes(word)
                                        ? 'bg-slate-100 text-slate-350 border-slate-200 line-through opacity-45' 
                                        : 'bg-white border-pink-200 text-indigo-950 border-b-[3px]'
                                    }`}
                                  >
                                    {word}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Verdict feedbacks controls */}
                          {unscrambleChecked ? (
                            <div className="p-3 bg-white border border-slate-150 rounded-2xl flex items-center justify-between">
                              <span className={`text-xs font-extrabold ${unscrambleIsCorrect ? 'text-emerald-700' : 'text-red-700'}`}>
                                {unscrambleIsCorrect ? '🎉 拼写无误，法术召唤成功！' : `❌ 语序不对，应该是: ${q.correctAnswer.join(' ')}`}
                              </span>
                              <button
                                onClick={() => {
                                  if (unscrambleIsCorrect) {
                                    setCurrentQuestionIdx(prev => prev + 1);
                                    resetQuestionStates();
                                  } else {
                                    setSelectedUnscrambleWords([]);
                                    setUnscrambleChecked(false);
                                    setUnscrambleIsCorrect(false);
                                  }
                                }}
                                className={`px-4 py-1.5 rounded-lg text-xs font-black text-white ${
                                  unscrambleIsCorrect ? 'bg-emerald-500' : 'bg-red-500'
                                }`}
                              >
                                {unscrambleIsCorrect ? '下一题' : '再来一次'}
                              </button>
                            </div>
                          ) : (
                            <button
                              disabled={selectedUnscrambleWords.length === 0}
                              onClick={handleCheckUnscramble}
                              className={`w-full py-3.5 rounded-2xl font-black text-xs text-center border-b-[4px] block shadow ${
                                selectedUnscrambleWords.length > 0 
                                  ? 'bg-pink-500 border-pink-700 hover:brightness-105 text-white' 
                                  : 'bg-slate-100 text-slate-350 border-slate-200 cursor-not-allowed opacity-75'
                              }`}
                            >
                              校验拼写句序
                            </button>
                          )}
                        </div>

                      </div>
                    )}

                    {/* STAGE 2: MATCH GRAPH AND OPTION TEXTS */}
                    {practiceStage === 2 && q && (
                      <div className="flex-1 flex flex-col justify-between space-y-4">
                        <div className="space-y-1">
                          <span className="text-[10px] tracking-wider font-extrabold text-pink-650 block">{q.title}</span>
                          <h4 className="text-sm font-black text-[#1e1b4b]">
                            {q.problem}
                          </h4>
                        </div>

                        {/* Graphic illustrator prompt */}
                        <div className="w-full h-34 bg-white border border-pink-200 rounded-2xl overflow-hidden flex items-center justify-center p-2 shadow-inner relative max-w-xs mx-auto">
                          <SafeImage 
                            src={getIllustrationForSentence(q.correctAnswer, q.image)} 
                            alt="Illustration Match" 
                            className="h-full object-contain"
                            fallbackEmoji={q.emoji}
                            style={{ fontSize: '4.5rem' }}
                          />
                        </div>

                        {/* Radio options of chinese */}
                        <div className="space-y-3 shrink-1">
                          <div className="grid grid-cols-1 gap-2">
                            {q.options.map((opt: string, idx: number) => {
                              const badge = idx === 0 ? '🅰️' : idx === 1 ? '🅱️' : idx === 2 ? '🅲' : '🅳';
                              return (
                                <button
                                  key={opt}
                                  disabled={matchChecked}
                                  onClick={() => {
                                    try { audio.playPop(); } catch (e) {}
                                    setChosenOption(opt);
                                  }}
                                  className={`p-3 rounded-xl font-bold text-xs text-left border-2 flex items-center justify-between ${
                                    chosenOption === opt 
                                      ? 'bg-pink-150 border-pink-400 text-pink-905 shadow' 
                                      : 'bg-white hover:bg-slate-50 border-slate-200 text-indigo-950'
                                  }`}
                                >
                                  <span>{badge} {opt}</span>
                                  {chosenOption === opt && <span className="text-[10px] text-pink-600 font-extrabold">当前选定🎯</span>}
                                </button>
                              );
                            })}
                          </div>

                          {/* Verdict checking footer */}
                          {matchChecked ? (
                            <div className="p-3 bg-white border border-slate-150 rounded-2xl flex items-center justify-between">
                              <span className={`text-xs font-extrabold ${matchIsCorrect ? 'text-emerald-700' : 'text-red-700'}`}>
                                {matchIsCorrect ? '🎉 爆灯通关！理解完全正确！' : `❌ 选错啦，答案应当是: ${q.correctAnswer}`}
                              </span>
                              <button
                                onClick={() => {
                                  if (matchIsCorrect) {
                                    if (currentQuestionIdx < 8) {
                                      setCurrentQuestionIdx(prev => prev + 1);
                                      resetQuestionStates();
                                    }
                                  } else {
                                    setChosenOption(null);
                                    setMatchChecked(false);
                                    setMatchIsCorrect(false);
                                  }
                                }}
                                className={`px-4 py-1.5 rounded-lg text-xs font-black text-white ${
                                  matchIsCorrect ? 'bg-emerald-500' : 'bg-red-500'
                                }`}
                              >
                                {matchIsCorrect ? (currentQuestionIdx === 8 ? '完成特训' : '下一题') : '重新尝试'}
                              </button>
                            </div>
                          ) : (
                            <button
                              disabled={!chosenOption}
                              onClick={handleCheckMatch}
                              className={`w-full py-3.5 rounded-2xl font-black text-xs text-center border-b-[4px] block shadow ${
                                chosenOption 
                                  ? 'bg-pink-500 border-pink-700 hover:brightness-105 text-white' 
                                  : 'bg-slate-100 text-slate-350 border-slate-200 cursor-not-allowed opacity-75'
                              }`}
                            >
                              提交检验
                            </button>
                          )}
                        </div>

                      </div>
                    )}
                  </>
                )}

              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </span>
    </div>
  );
};

export default PictureBookLibrary;
