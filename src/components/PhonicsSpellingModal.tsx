import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Volume2, Sparkles, Play, Star, Award, Heart } from 'lucide-react';
import { splitWord, getPhonicsBreakdown } from '../utils/WordUtils';
import audio from '../utils/AudioUtils';

interface PhonicsSpellingModalProps {
  word: string;
  translation: string;
  imageUrl?: string;
  syllables?: string[];
  onClose: () => void;
}

type SpellingStep = 'IDLE' | 'SYLLABLES' | 'STEP_BY_STEP' | 'FINAL';

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  rotateSpeed: number;
  isStar: boolean;
}

const CANDY_COLORS = [
  { bg: 'bg-rose-100 hover:bg-rose-200 border-rose-400 text-rose-600 shadow-rose-200/50', activeBg: 'bg-rose-500 text-white border-rose-600 shadow-rose-400/60' },
  { bg: 'bg-sky-100 hover:bg-sky-200 border-sky-400 text-sky-600 shadow-sky-200/50', activeBg: 'bg-sky-500 text-white border-sky-600 shadow-sky-400/60' },
  { bg: 'bg-amber-100 hover:bg-amber-200 border-amber-400 text-amber-600 shadow-amber-200/50', activeBg: 'bg-amber-500 text-white border-amber-600 shadow-amber-400/60' },
  { bg: 'bg-violet-100 hover:bg-violet-200 border-violet-400 text-violet-600 shadow-violet-200/50', activeBg: 'bg-violet-500 text-white border-violet-600 shadow-violet-400/60' },
  { bg: 'bg-emerald-100 hover:bg-emerald-200 border-emerald-400 text-emerald-600 shadow-emerald-200/50', activeBg: 'bg-emerald-500 text-white border-emerald-600 shadow-emerald-400/60' },
  { bg: 'bg-fuchsia-100 hover:bg-fuchsia-200 border-fuchsia-400 text-fuchsia-600 shadow-fuchsia-200/50', activeBg: 'bg-fuchsia-500 text-white border-fuchsia-600 shadow-fuchsia-400/60' },
];

const KIKI_FUN_QUOTES = [
  "你真棒！点一点字母，听听它们的魔法声音吧！✨",
  "太聪明了！我们一起成为拼读小玩家！🦁",
  "太好听啦！英语单词最喜欢和你交朋友了！🌈",
  "加油！我们很快就能收服所有的魔法单词！🍒",
  "哇，你刚才听得真仔细，耳朵像小兔子一样灵敏！🐰",
  "嗒啦啦~ 快乐的自然拼读魔法森林，你最厉害啦！🎉"
];

const PhonicsSpellingModal: React.FC<PhonicsSpellingModalProps> = ({ 
  word, 
  translation, 
  imageUrl, 
  syllables, 
  onClose 
}) => {
  const [step, setStep] = useState<SpellingStep>('IDLE');
  const [currentSyllableIdx, setCurrentSyllableIdx] = useState(-1);
  const [englishVoice, setEnglishVoice] = useState<SpeechSynthesisVoice | null>(null);
  
  // Game state
  const [speech, setSpeech] = useState("✨ 拼读魔法准备开始！");
  const [kikiState, setKikiState] = useState<'idle' | 'talking' | 'excited'>('idle');
  const [particles, setParticles] = useState<Particle[]>([]);
  const [hasCompletedGuide, setHasCompletedGuide] = useState(false);

  const animatingRef = useRef(false);
  const isMountedRef = useRef(true);
  const particleIdRef = useRef(0);

  const safeSetStep = (newStep: SpellingStep) => {
    if (isMountedRef.current) setStep(newStep);
  };

  const safeSetCurrentSyllableIdx = (idx: number) => {
    if (isMountedRef.current) setCurrentSyllableIdx(idx);
  };

  // Fetch the definitive phonics segments (letters, IPAs, sound-outs)
  const phonicsSegments = getPhonicsBreakdown(word);
  const wordParts = syllables || phonicsSegments.map(s => s.letter);

  const findBestEnglishVoice = (voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null => {
    if (!voices || voices.length === 0) return null;
    const normalizeLang = (l: string) => l.toLowerCase().replace('_', '-');

    const preferred = voices.find(v => {
      const l = normalizeLang(v.lang);
      const name = v.name.toLowerCase();
      const isEnglish = l.startsWith('en-us') || l.startsWith('en-gb') || l === 'en';
      if (!isEnglish) return false;
      return (
        name.includes('samantha') ||
        name.includes('google') ||
        name.includes('natural') ||
        name.includes('microsoft') ||
        name.includes('karen') ||
        name.includes('daniel') ||
        name.includes('zira') ||
        name.includes('david') ||
        name.includes('moira')
      );
    });
    if (preferred) return preferred;

    const enUS = voices.find(v => normalizeLang(v.lang).startsWith('en-us'));
    if (enUS) return enUS;

    const anyEn = voices.find(v => normalizeLang(v.lang).startsWith('en'));
    if (anyEn) return anyEn;

    return null;
  };

  useEffect(() => {
    isMountedRef.current = true;
    const updateVoice = () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        const voices = window.speechSynthesis.getVoices();
        const found = findBestEnglishVoice(voices);
        if (found) {
          setEnglishVoice(found);
        }
      }
    };

    updateVoice();
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = updateVoice;
    }

    // Start automatically after a brief delay so it triggers in the user gesture window
    const timer = setTimeout(() => {
      startAnimation();
    }, 150);

    return () => {
      isMountedRef.current = false;
      clearTimeout(timer);
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        try { window.speechSynthesis.cancel(); } catch (e) {}
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  // Animation Loop for Stars / Confetti Particle Physics
  useEffect(() => {
    let frameId: number;
    const updateParticles = () => {
      setParticles(prev => {
        if (prev.length === 0) return prev;
        return prev
          .map(p => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            vy: p.vy + 0.25, // gravity
            vx: p.vx * 0.98, // drag
          }))
          .filter(p => p.y < 300 && p.x > -250 && p.x < 250); // boundary check
      });
      frameId = requestAnimationFrame(updateParticles);
    };

    if (particles.length > 0) {
      frameId = requestAnimationFrame(updateParticles);
    }
    return () => cancelAnimationFrame(frameId);
  }, [particles]);

  const triggerConfettiFountain = () => {
    const colors = ['#FF6B6B', '#4ECDC4', '#FFD166', '#A29BFE', '#FF8B94', '#FF2E93', '#10B981', '#3B82F6', '#FFA07A'];
    const newParticles: Particle[] = [];
    
    // Shoot out 32 particles
    for (let i = 0; i < 35; i++) {
      const angle = (Math.PI * 5) / 4 + Math.random() * (Math.PI / 2); // mostly upwards spread
      const speed = 6 + Math.random() * 9;
      newParticles.push({
        id: particleIdRef.current++,
        x: 0,
        y: 40,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 4, // initial boost up
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 8 + Math.random() * 12,
        rotateSpeed: (Math.random() - 0.5) * 10,
        isStar: Math.random() > 0.45
      });
    }
    setParticles(prev => [...prev, ...newParticles]);
  };

  const speakPart = (text: string, rate = 0.8) => {
    return new Promise<void>((resolve) => {
      if (typeof window === 'undefined' || !window.speechSynthesis) {
        resolve();
        return;
      }
      
      // Auto-resume if in a weird paused state
      if (window.speechSynthesis.paused) {
        try { window.speechSynthesis.resume(); } catch (e) {}
      }
      
      let activeVoice = englishVoice;
      if (!activeVoice) {
        const voices = window.speechSynthesis.getVoices();
        activeVoice = findBestEnglishVoice(voices);
      }

      let soundText = text.toLowerCase();
      let activeRate = rate;
      let activePitch = 1.15; // Pleasant high-pitch, but within safe boundaries for all operating systems

      const activeWordLower = word.toLowerCase().trim();
      
      if (soundText === 'y') {
        if (activeWordLower.length <= 4) {
          soundText = 'eye';
        } else {
          soundText = 'eee';
        }
      }
      else if (soundText === 'ea') {
        if (['bread', 'head', 'deaf', 'pant'].includes(activeWordLower)) {
          soundText = 'ehh';
        } else {
          soundText = 'eee';
        }
      }
      else if (soundText === 'oo') {
        if (['book', 'look', 'cook'].includes(activeWordLower)) {
          soundText = 'uh';
        } else {
          soundText = 'ooo';
        }
      }
      else if (soundText === 'a' && (activeWordLower.endsWith('e') && activeWordLower.length > 3)) {
        soundText = 'ae';
      }
      else if (soundText === 'i' && (activeWordLower.endsWith('e') && activeWordLower.length > 3)) {
        soundText = 'eye';
      }
      else if (soundText === 'o' && (activeWordLower.endsWith('e') && activeWordLower.length > 3)) {
        soundText = 'oh';
      }

      interface PhonicsConfig {
        sound: string;
        rate?: number;
        pitch?: number;
      }

      const phonicsConfigs: Record<string, PhonicsConfig> = {
        'b': { sound: 'buh', rate: 1.45, pitch: 1.15 },
        'c': { sound: 'kuh', rate: 1.45, pitch: 1.15 },
        'd': { sound: 'duh', rate: 1.45, pitch: 1.15 },
        'g': { sound: 'guh', rate: 1.45, pitch: 1.15 },
        'j': { sound: 'juh', rate: 1.45, pitch: 1.15 },
        'k': { sound: 'kuh', rate: 1.45, pitch: 1.15 },
        'p': { sound: 'puh', rate: 1.45, pitch: 1.15 },
        't': { sound: 'tuh', rate: 1.45, pitch: 1.15 },
        'q': { sound: 'kwuh', rate: 1.35, pitch: 1.15 },
        'w': { sound: 'wuh', rate: 1.35, pitch: 1.15 },
        'y': { sound: 'yuh', rate: 1.35, pitch: 1.15 },

        'f': { sound: 'fff', rate: 0.85, pitch: 1.1 },
        'h': { sound: 'hhh', rate: 0.9, pitch: 1.1 },
        'l': { sound: 'lll', rate: 0.8, pitch: 1.15 },
        'm': { sound: 'mmm', rate: 0.8, pitch: 1.15 },
        'n': { sound: 'nnn', rate: 0.8, pitch: 1.15 },
        'r': { sound: 'rrr', rate: 0.8, pitch: 1.15 },
        's': { sound: 'sss', rate: 0.9, pitch: 1.15 },
        'v': { sound: 'vvv', rate: 0.8, pitch: 1.15 },
        'x': { sound: 'ks', rate: 1.2, pitch: 1.15 },
        'z': { sound: 'zzz', rate: 0.85, pitch: 1.15 },

        'a': { sound: 'aah', rate: 0.75, pitch: 1.15 },
        'e': { sound: 'ehh', rate: 0.75, pitch: 1.15 },
        'i': { sound: 'ihh', rate: 0.75, pitch: 1.15 },
        'o': { sound: 'ah', rate: 0.75, pitch: 1.15 },
        'u': { sound: 'uhh', rate: 0.75, pitch: 1.15 },

        'sh': { sound: 'shhh', rate: 0.85, pitch: 1.15 },
        'ch': { sound: 'tch', rate: 1.1, pitch: 1.15 },
        'th': { sound: 'thhh', rate: 0.85, pitch: 1.15 },
        'wh': { sound: 'wuh', rate: 1.35, pitch: 1.15 },
        'ph': { sound: 'fff', rate: 0.85, pitch: 1.15 },
        'ck': { sound: 'kuh', rate: 1.45, pitch: 1.15 },
        'ng': { sound: 'ng', rate: 0.8, pitch: 1.15 },
        'ee': { sound: 'eee', rate: 0.7, pitch: 1.15 },
        'ea': { sound: 'eee', rate: 0.7, pitch: 1.15 },
        'oo': { sound: 'ooo', rate: 0.7, pitch: 1.15 },
        'ai': { sound: 'ae', rate: 0.7, pitch: 1.15 },
        'ay': { sound: 'ae', rate: 0.7, pitch: 1.15 },
        'ar': { sound: 'ar', rate: 0.75, pitch: 1.1 },
        'er': { sound: 'er', rate: 0.75, pitch: 1.1 },
        'ir': { sound: 'er', rate: 0.75, pitch: 1.1 },
        'or': { sound: 'or', rate: 0.75, pitch: 1.1 },
        'ur': { sound: 'er', rate: 0.75, pitch: 1.1 },
        'ou': { sound: 'ow', rate: 0.75, pitch: 1.1 },
        'ow': { sound: 'ow', rate: 0.75, pitch: 1.1 },
        'oi': { sound: 'oy', rate: 0.75, pitch: 1.1 },
        'oy': { sound: 'oy', rate: 0.75, pitch: 1.1 }
      };

      const config = phonicsConfigs[soundText];
      if (config) {
        soundText = config.sound;
        if (config.rate !== undefined) activeRate = config.rate;
        if (config.pitch !== undefined) activePitch = config.pitch;
      }

      const utterance = new SpeechSynthesisUtterance(soundText);
      if (activeVoice) {
        utterance.voice = activeVoice;
        utterance.lang = activeVoice.lang;
      } else {
        utterance.lang = 'en-US';
      }
      utterance.rate = activeRate;
      utterance.pitch = activePitch;

      let isResolved = false;
      const done = () => {
        if (!isResolved) {
          isResolved = true;
          resolve();
        }
      };

      utterance.onend = done;
      utterance.onerror = done;
      
      window.speechSynthesis.speak(utterance);
      // safety timeout fallback
      setTimeout(done, 1500);
    });
  };

  const startAnimation = async () => {
    if (animatingRef.current) return;
    animatingRef.current = true;
    setHasCompletedGuide(false);

    safeSetCurrentSyllableIdx(-1);

    try {
      // Clear any pending speech synthesis once at the start of animation
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        try { window.speechSynthesis.cancel(); } catch (e) {}
      }
      
      // Direct Stage 1: STEP_BY_STEP (Show each letter block and read its phonetic sound)
      if (!isMountedRef.current) return;
      setSpeech("🌈 听一听！我们要把每个字母の発音拼起来哦！");
      safeSetStep('STEP_BY_STEP');
      
      // Give the cancel action a moment to process and view to settle
      await new Promise(r => setTimeout(r, 450));

      const totalSteps = syllables ? wordParts.length : phonicsSegments.length;
      for (let i = 0; i < totalSteps; i++) {
        if (!isMountedRef.current) break;
        safeSetCurrentSyllableIdx(i);
        audio.playPop(); // short playful pop sound
        const speakTarget = syllables ? wordParts[i] : (phonicsSegments[i].sound || phonicsSegments[i].letter);
        
        setKikiState('talking');
        // Briefly update companion speech balloon
        const charName = wordParts[i];
        setSpeech(`✨ [ ${charName} ] 读作 /${syllables ? charName : phonicsSegments[i].ipa.replace(/[\[\]]/g, '')}/`);
        
        await speakPart(speakTarget, 0.65);
        await new Promise(r => setTimeout(r, 250)); // sweet brief delay between letters
      }

      // Stage 2: FINAL (Coalesce and read the whole word)
      if (!isMountedRef.current) return;
      safeSetCurrentSyllableIdx(-1); // reset selection highlight
      setSpeech("🍭 现在把所有发音连起来拼出单词！");
      await new Promise(r => setTimeout(r, 600));
      
      if (!isMountedRef.current) return;
      setKikiState('excited');
      setSpeech(`🏆 太好听啦！你成功拼读了【${word}】！🎉`);
      safeSetStep('FINAL');
      audio.playSuccess();
      triggerConfettiFountain();
      
      await speakPart(word, 0.85); 
      setHasCompletedGuide(true);
      await new Promise(r => setTimeout(r, 1200));
      setKikiState('idle');
    } finally {
      if (isMountedRef.current) {
        animatingRef.current = false;
      }
    }
  };

  // Click on a letter block to practice on demand (Interactive Xylophone Mode)
  const handleLetterBlockClick = async (idx: number, clickType: 'letter' | 'phoneme' = 'letter') => {
    if (animatingRef.current) return; // ignore during auto-run
    audio.playPop();
    safeSetCurrentSyllableIdx(idx);
    
    // Animate mascot briefly
    setKikiState('talking');
    
    const letterName = wordParts[idx];
    
    if (clickType === 'letter') {
      // Pronounce the plain letter name, e.g., 'A', 'B', 'C'
      setSpeech(`✨ 这是字母 [ ${letterName.toUpperCase()} ] ！`);
      await speakPart(letterName, 0.85);
    } else {
      // Pronounce the phonetic spelling sound, e.g., 'aah', 'buh', 'lll'
      const segment = !syllables ? phonicsSegments[idx] : null;
      const targetSound = segment ? (segment.sound || segment.letter) : letterName;
      const ipaRepr = segment ? segment.ipa : `[${letterName}]`;
      setSpeech(`🔑 字母组合 [ ${letterName} ] 的自然拼读发音是 ${ipaRepr} ！`);
      await speakPart(targetSound, 0.62);
    }
    
    setTimeout(() => {
      setKikiState('idle');
    }, 800);
  };

  const handleKikiTap = () => {
    audio.playPop();
    setKikiState('excited');
    const randomQuote = KIKI_FUN_QUOTES[Math.floor(Math.random() * KIKI_FUN_QUOTES.length)];
    setSpeech(randomQuote);
    
    // Small confetti sparkle on mascot touch
    triggerConfettiFountain();
    
    setTimeout(() => {
      setKikiState('idle');
    }, 1200);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.85, y: 50, rotate: -1.5 }}
        animate={{ scale: 1, y: 0, rotate: 0 }}
        className="bg-white w-full max-w-md rounded-[48px] overflow-hidden shadow-[0_30px_120px_rgba(0,0,0,0.35)] border-4 border-emerald-400 relative p-8 flex flex-col items-center"
        onClick={e => e.stopPropagation()}
      >
        {/* Magical Background Accent (Sunny playfulness) */}
        <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-yellow-100/40 via-emerald-50/20 to-transparent -z-10 opacity-80" />

        {/* Floating Stars Decorative */}
        <div className="absolute top-10 left-10 text-yellow-300 pointer-events-none animate-bounce" style={{ animationDuration: '3s' }}>
          <Star fill="currentColor" size={24} />
        </div>
        <div className="absolute top-24 right-14 text-rose-300 pointer-events-none animate-bounce" style={{ animationDuration: '4s' }}>
          <Star fill="currentColor" size={16} />
        </div>

        {/* Close Button */}
        <button 
          onClick={onClose}
          aria-label="关闭"
          className="absolute top-6 right-6 p-2 bg-slate-100/80 rounded-2xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all active:scale-90 z-20"
        >
          <X size={22} strokeWidth={3} />
        </button>

        {/* --- Cute Companion Ribbon: Kiki the Chick --- */}
        <div className="w-full mb-6 flex items-center space-x-3 bg-gradient-to-r from-emerald-500/10 via-yellow-100/30 to-rose-50/20 px-4 py-3 rounded-3xl border border-emerald-100 relative">
          
          {/* Animated SVG Mascot Kiki */}
          <motion.div 
            onClick={handleKikiTap}
            whileHover={{ scale: 1.15, rotate: [0, -5, 5, 0] }}
            whileTap={{ scale: 0.9 }}
            className="cursor-pointer relative flex-shrink-0"
          >
            <div className="absolute -inset-1 bg-yellow-400 rounded-full blur-sm opacity-30 animate-pulse" />
            
            {/* Mascot Vector Drawing Chicks container */}
            <motion.div 
              animate={kikiState === 'excited' ? {
                y: [0, -12, 0, -8, 0],
                rotate: [0, 8, -8, 5, 0]
              } : kikiState === 'talking' ? {
                scaleY: [1, 1.08, 0.94, 1],
              } : {
                y: [0, -3, 0]
              }}
              transition={kikiState === 'excited' ? { duration: 0.8 } : kikiState === 'talking' ? { repeat: Infinity, duration: 0.5 } : { repeat: Infinity, duration: 2.2 }}
              className="w-14 h-14 bg-gradient-to-br from-yellow-300 to-amber-400 rounded-full relative flex items-center justify-center shadow-md border-2 border-yellow-400 overflow-visible"
            >
              {/* Little Feather Hairtuft */}
              <div className="absolute -top-1.5 left-5 w-3 h-3 bg-yellow-300 rounded-full rotate-45 border-t border-l border-yellow-400" />
              <div className="absolute -top-2 left-6.5 w-2 h-2.5 bg-yellow-300 rounded-full -rotate-12" />

              {/* Rosy Cheeks */}
              <div className="absolute bottom-3.5 left-2 w-3 h-2 bg-rose-400/60 rounded-full" />
              <div className="absolute bottom-3.5 right-2 w-3 h-2 bg-rose-400/60 rounded-full" />

              {/* Shiny Blinking Eyes */}
              <div className="flex space-x-2.5 absolute top-4">
                <motion.div 
                  animate={{ scaleY: [1, 1, 0.1, 1, 1] }} 
                  transition={{ repeat: Infinity, duration: 3.2, repeatDelay: 1.5 }}
                  className="w-2.5 h-2.5 bg-slate-800 rounded-full flex items-center justify-center"
                />
                <motion.div 
                  animate={{ scaleY: [1, 1, 0.1, 1, 1] }} 
                  transition={{ repeat: Infinity, duration: 3.2, repeatDelay: 1.5 }}
                  className="w-2.5 h-2.5 bg-slate-800 rounded-full flex items-center justify-center"
                />
              </div>

              {/* Cute Smiling Mouth/Beak */}
              <div className="w-3.5 h-2.5 bg-amber-500 rounded-b-full absolute top-7.5 border-t border-amber-600 shadow-inner flex items-center justify-center">
                <div className="w-1 h-1 bg-red-400 rounded-full" />
              </div>

              {/* Animated Tiny Angel Wings */}
              <motion.div 
                animate={kikiState === 'excited' ? { rotate: [0, 45, -45, 0] } : { rotate: [0, 10, 0] }}
                transition={{ duration: 0.4, repeat: kikiState === 'excited' ? 4 : Infinity, repeatType: "reverse" }}
                className="absolute -left-1.5 top-5 w-3 h-4 bg-yellow-300 rounded-full origin-right border-l border-yellow-400"
              />
              <motion.div 
                animate={kikiState === 'excited' ? { rotate: [0, -45, 45, 0] } : { rotate: [0, -10, 0] }}
                transition={{ duration: 0.4, repeat: kikiState === 'excited' ? 4 : Infinity, repeatType: "reverse" }}
                className="absolute -right-1.5 top-5 w-3 h-4 bg-yellow-300 rounded-full origin-left border-r border-yellow-400"
              />
            </motion.div>
          </motion.div>

          {/* Dialog Bubble */}
          <div className="flex-1 text-xs font-bold text-slate-600 bg-white px-3 py-2 rounded-2xl border border-emerald-100 shadow-sm relative leading-relaxed">
            {speech}
            {/* Speech Bubble Arrow */}
            <div className="absolute top-1/2 -left-1.5 -translate-y-1/2 w-3 h-3 bg-white rotate-45 border-l border-b border-emerald-100" />
          </div>
        </div>

        {/* Word Image */}
        {imageUrl && (
          <motion.div 
            initial={{ scale: 0.8, rotate: -2 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", bounce: 0.4 }}
            className="mb-8 relative"
          >
            {/* Bubble Shadow Backing */}
            <div className="absolute inset-x-2 inset-y-0 bg-yellow-200 blur-2xl opacity-30 rounded-full animate-pulse" />
            <div className="w-36 h-36 bg-gradient-to-tr from-emerald-50 to-white hover:rotate-2 transition-transform duration-300 rounded-[36px] flex items-center justify-center border-3 border-emerald-100 shadow-[0_12px_24px_-10px_rgba(16,185,129,0.2)] p-4 relative overflow-visible">
              
              {/* Crown/Award icon overlay for game look */}
              <div className="absolute -top-3 -right-3 bg-amber-400 text-white p-1.5 rounded-2xl border-2 border-white shadow-md animate-bounce" style={{ animationDuration: '3.5s' }}>
                <Award size={18} fill="currentColor" />
              </div>

              <img referrerPolicy="no-referrer" src={imageUrl} alt={word} className="w-full h-full object-contain relative z-10" />
            </div>
          </motion.div>
        )}

        {/* Playable sandbox tip */}
        {step === 'STEP_BY_STEP' && hasCompletedGuide && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-[11px] font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full mb-3 shadow-inner flex items-center space-x-1 animate-pulse"
          >
            <Sparkles size={12} className="text-yellow-500" />
            <span>玩具琴模式：点下面的积木能重复发音哦！</span>
          </motion.div>
        )}

        {/* Major Animation Stages container */}
        <div className="text-center mb-10 w-full min-h-[140px] flex items-center justify-center relative">
          
          <AnimatePresence mode="wait">
            {step === 'SYLLABLES' && (
              <motion.div 
                key="syllables"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex items-center justify-center flex-wrap gap-2"
              >
                {wordParts.map((part, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, y: 15, scale: 0.6 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: i * 0.15, type: 'spring', damping: 11 }}
                    className="flex items-center"
                  >
                    <span className="text-4xl font-black text-rose-500 tracking-tight bg-rose-50 px-4 py-2 rounded-3xl border-3 border-rose-300 shadow-md shadow-rose-100/40">
                      {part}
                    </span>
                    {i < wordParts.length - 1 && (
                      <motion.span 
                        animate={{ scale: [1, 1.4, 1] }}
                        transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.2 }}
                        className="text-2xl font-black text-rose-300 mx-1.5 text-center"
                      >
                        🍭
                      </motion.span>
                    )}
                  </motion.div>
                ))}
              </motion.div>
            )}

            {step === 'STEP_BY_STEP' && (
              <motion.div 
                key="step"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center w-full"
              >
                <div className="flex items-center justify-center flex-wrap gap-y-8 gap-x-2.5">
                  {wordParts.map((part, i) => {
                    const segment = phonicsSegments[i];
                    const isCurrent = i === currentSyllableIdx;
                    const isBefore = i < currentSyllableIdx;
                    
                    // Assign alternate tilts for playroom wooden blocks look
                    const blockRotation = (i % 2 === 0) ? -3 : 3;
                    const paletteColor = CANDY_COLORS[i % CANDY_COLORS.length];

                    return (
                      <div key={i} className="flex flex-col items-center">
                        <motion.button 
                          onClick={() => handleLetterBlockClick(i, 'letter')}
                          whileHover={{ scale: 1.15, y: -4, rotate: blockRotation * 2 }}
                          whileTap={{ scale: 0.9, y: 2 }}
                          animate={{ 
                            scale: isCurrent ? 1.25 : 1,
                            rotate: isCurrent ? blockRotation * 1.5 : blockRotation,
                            boxShadow: isCurrent 
                              ? '0 12px 18px rgba(16,185,129,0.45)' 
                              : '0 6px 0px rgba(0,0,0,0.15)',
                            y: isCurrent ? -8 : 0
                          }}
                          transition={{ type: "spring", stiffness: 350, damping: 15 }}
                          className={`
                            h-16 px-4 md:px-5 rounded-2xl md:rounded-[24px] font-black text-4xl font-sans text-center flex items-center justify-center border-b-6 select-none transition-colors duration-200
                            ${isCurrent ? paletteColor.activeBg : paletteColor.bg}
                          `}
                        >
                          {part}
                        </motion.button>

                        <AnimatePresence>
                          {!syllables && segment && (
                            <motion.button
                              onClick={() => handleLetterBlockClick(i, 'phoneme')}
                              whileHover={{ scale: 1.12, rotate: -2 }}
                              whileTap={{ scale: 0.92 }}
                              initial={{ opacity: 0, y: 10, scale: 0.8 }}
                              animate={{ 
                                opacity: isCurrent ? 1 : 0.9,
                                scale: isCurrent ? 1.15 : 1,
                                color: isCurrent ? '#047857' : '#475569'
                              }}
                              className={`
                                text-sm font-bold mt-2.5 font-mono px-3 py-1 rounded-xl transition-all cursor-pointer select-none border shadow-sm
                                ${isCurrent 
                                  ? 'bg-emerald-100 border-emerald-300 scale-100 shadow-emerald-100/50' 
                                  : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-500 hover:text-slate-800'
                                }
                              `}
                            >
                              {segment.ipa}
                            </motion.button>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {step === 'FINAL' && (
              <motion.div 
                key="final"
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ 
                  opacity: 1, 
                  scale: [1, 1.25, 0.95, 1.05, 1],
                  rotate: [0, 4, -4, 2, 0]
                }}
                transition={{ 
                  duration: 0.6,
                  scale: { duration: 0.55 },
                  rotate: { duration: 0.5 }
                }}
                className="flex flex-col items-center w-full relative"
              >
                {/* Background celebratory radial flash */}
                <div className="absolute inset-0 -z-10 flex items-center justify-center">
                  <motion.div 
                    animate={{ scale: [1, 1.3, 1], rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
                    className="w-48 h-48 bg-radial from-amber-200/40 via-yellow-100/10 to-transparent rounded-full"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Star className="text-yellow-400 animate-spin" style={{ animationDuration: '6s' }} fill="currentColor" size={24} />
                  <span className="text-rose-400 font-extrabold text-sm uppercase tracking-wider bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-100">
                    魔法大成功！
                  </span>
                  <Star className="text-yellow-400 animate-spin" style={{ animationDuration: '4s' }} fill="currentColor" size={24} />
                </div>

                <motion.div 
                  whileHover={{ scale: 1.1, rotate: [-1, 1, -1] }}
                  className="text-6xl md:text-7xl font-black text-emerald-600 tracking-tighter mt-3 mb-2 drop-shadow-[0_4px_8px_rgba(16,185,129,0.15)] flex items-center space-x-1 cursor-pointer"
                  onClick={() => audio.speak(word)}
                >
                  <span>{word}</span>
                  <Volume2 className="text-emerald-400 inline-block w-8 h-8 ml-1" />
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  className="text-2xl font-black text-amber-700 bg-amber-100/60 border border-amber-200/50 px-6 py-1.5 rounded-3xl flex items-center space-x-2"
                >
                  <Heart size={20} fill="currentColor" className="text-rose-500 animate-pulse" />
                  <span>{translation}</span>
                </motion.div>
              </motion.div>
            )}

            {step === 'IDLE' && (
              <motion.div key="idle" className="text-emerald-300 text-4xl font-extrabold italic animate-pulse">
                准备召唤...
              </motion.div>
            )}
          </AnimatePresence>

          {/* Particle Fountain layer */}
          <div className="absolute inset-0 pointer-events-none overflow-visible flex items-center justify-center">
            {particles.map(p => {
              if (p.isStar) {
                return (
                  <div
                    key={p.id}
                    className="absolute pointer-events-none"
                    style={{
                      transform: `translate(${p.x}px, ${p.y}px) rotate(${p.id * p.rotateSpeed}deg)`,
                      color: p.color,
                    }}
                  >
                    <Star fill="currentColor" size={p.size} />
                  </div>
                );
              }
              return (
                <div
                  key={p.id}
                  className="absolute pointer-events-none rounded-full"
                  style={{
                    transform: `translate(${p.x}px, ${p.y}px)`,
                    backgroundColor: p.color,
                    width: p.size,
                    height: p.size,
                  }}
                />
              );
            })}
          </div>

        </div>

        {/* Action Controls Panel */}
        <div className="flex space-x-4 w-full relative z-10 p-1 bg-slate-50 border border-slate-100 rounded-[32px] shadow-sm">
          <button 
            onClick={startAnimation}
            disabled={animatingRef.current}
            className={`
              flex-1 py-4 rounded-[26px] font-black text-lg transition-all flex items-center justify-center space-x-2.5 active:scale-95 border-b-4
              ${animatingRef.current 
                ? 'bg-slate-200 border-slate-300 text-slate-400 cursor-not-allowed shadow-none' 
                : 'bg-emerald-600 text-white border-emerald-700 shadow-[0_8px_16px_rgba(16,185,129,0.3)] hover:bg-emerald-500'
              }
            `}
          >
            <Play size={20} fill="currentColor" />
            <span>魔法复读</span>
          </button>
          
          <button 
            onClick={() => {
              audio.playClick();
              audio.speak(word);
            }}
            aria-label="整词发音"
            className="p-4 rounded-[26px] bg-sky-100 hover:bg-sky-200 text-sky-600 border-b-4 border-sky-300 transition-all active:scale-95 shadow-[0_6px_0_rgba(14,165,233,0.15)]"
          >
            <Volume2 size={24} strokeWidth={3.5} />
          </button>
        </div>

        {/* Progress Tracker (Child-friendly Magical Steps) */}
        <div className="mt-8 flex justify-center space-x-5">
          {(['SYLLABLES', 'STEP_BY_STEP', 'FINAL'] as const).map((s, idx) => {
            const isActive = step === s;
            const isCompleted = (step === 'STEP_BY_STEP' && idx < 1) || (step === 'FINAL' && idx < 2);
            
            return (
              <div key={s} className="flex flex-col items-center">
                <div 
                  className={`
                    w-12 h-2.5 rounded-full transition-all duration-500 overflow-hidden relative border
                    ${isActive ? 'border-amber-400' : 'border-slate-100'}
                  `}
                >
                  <div className="absolute inset-0 bg-slate-100" />
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: isActive || isCompleted ? '100%' : '0%' }}
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-400 to-amber-400"
                  />
                </div>
                <span className={`text-[9px] font-extrabold mt-1.5 uppercase tracking-wider transition-colors ${isActive ? 'text-emerald-500 scale-105' : 'text-slate-300'}`}>
                  🌟 关卡 {idx + 1}
                </span>
              </div>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default PhonicsSpellingModal;
