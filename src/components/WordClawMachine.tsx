import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WordGroup, WordItem, UserStats } from '../types';
import { 
  X, ArrowLeft, RotateCcw, Volume2, ShieldAlert, Sparkles, Heart, HelpCircle, Play, Trophy, Coins, Zap
} from 'lucide-react';
import audio from '../utils/AudioUtils';
import confetti from 'canvas-confetti';
import { CHARACTERS } from '../constants';

interface WordClawMachineProps {
  groups: WordGroup[];
  stats: UserStats;
  onFinish: (score: number, coins: number) => void;
  onClose: () => void;
}

interface ToyItem {
  id: string;
  word: WordItem;
  label: string; // The translation
  isCorrect: boolean;
  xPercent: number; // Horizontal placement in the glass tank
  yOffset: number; // Vertical stacking offset in pixels to avoid overlaps
  plushEmoji: string;
  colorClass: string;
  textColor: string;
  animalName: string;
  isGrabbed: boolean;
  isCleared: boolean;
  isGolden?: boolean;
}

export const WordClawMachine: React.FC<WordClawMachineProps> = ({ groups, stats, onFinish, onClose }) => {
  const letterGroups = useMemo(() => [
    { name: 'A - E', letters: ['A', 'B', 'C', 'D', 'E'] },
    { name: 'F - J', letters: ['F', 'G', 'H', 'I', 'J'] },
    { name: 'K - O', letters: ['K', 'L', 'M', 'N', 'O'] },
    { name: 'P - T', letters: ['P', 'Q', 'R', 'S', 'T'] },
    { name: 'U - Z', letters: ['U', 'V', 'W', 'X', 'Y', 'Z'] },
  ], []);

  const [selectedLetterGroup, setSelectedLetterGroup] = useState<number>(5); // 0: A-E, 1: F-J, 2: K-O, 3: P-T, 4: U-Z, 5: All (A-Z)
  const [letterCaseMode, setLetterCaseMode] = useState<'UPPER' | 'LOWER' | 'MIXED'>('MIXED');

  // Generate selected letters representing the core learning items
  const allWords = useMemo(() => {
    let baseLetters: string[] = [];
    if (selectedLetterGroup === 5) {
      baseLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    } else {
      baseLetters = [...letterGroups[selectedLetterGroup].letters];
    }

    const list: WordItem[] = baseLetters.map((letter, idx) => {
      let text = letter;
      if (letterCaseMode === 'LOWER') {
        text = letter.toLowerCase();
      } else if (letterCaseMode === 'MIXED') {
        text = idx % 2 === 0 ? letter.toUpperCase() : letter.toLowerCase();
      } else {
        text = letter.toUpperCase();
      }
      return {
        text: text,
        translation: `字母 ${text}`,
        imageUrl: ''
      };
    });

    // Shuffle alphabet so each game round starts with random letters
    return list.sort(() => Math.random() - 0.5);
  }, [selectedLetterGroup, letterCaseMode, letterGroups]);

  // Play short, ultra-quiet local synthesized chime for correct answer
  const playQuietCorrectSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;
      
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(523.25, now); // C5
      osc1.frequency.exponentialRampToValueAtTime(1046.50, now + 0.12); // Slips up nicely to C6
      
      gain1.gain.setValueAtTime(0.06, now); // soft volume
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.13);

      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(659.25, now + 0.05); // E5
      osc2.frequency.exponentialRampToValueAtTime(1318.51, now + 0.17); // Slips up nicely to E6
      
      gain2.gain.setValueAtTime(0.05, now + 0.05);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.17);
      
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.05);
      osc2.stop(now + 0.18);
    } catch (e) {}
  };

  // Play short, polite synth buzz for incorrect answer
  const playQuietWrongSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.linearRampToValueAtTime(110, now + 0.15);
      
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.16);
    } catch (e) {}
  };

  // Game States
  const [gameState, setGameState] = useState<'INTRO' | 'PLAYING' | 'SUMMARY'>('INTRO');
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [coinsEarned, setCoinsEarned] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  const [hearts, setHearts] = useState(3);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [timeLeft, setTimeLeft] = useState(90);

  // Powerups State
  const [hasShield, setHasShield] = useState(false);
  const [helperHintActive, setHelperHintActive] = useState(false);

  // Active Question Details
  const [currentWord, setCurrentWord] = useState<WordItem | null>(null);
  const [toys, setToys] = useState<ToyItem[]>([]);
  const [selectedToyId, setSelectedToyId] = useState<string | null>(null);

  // Claw Animation States
  const [clawX, setClawX] = useState(50); // Horizontal path percentage (10% to 90%). Standard centering starts around 50%.
  const [clawHeight, setClawHeight] = useState(40); // String cord height in pixels (min 40px to drop max 210px)
  const [clawOpenAngle, setClawOpenAngle] = useState(24); // Degree angle of the claw fingers
  const [clawState, setClawState] = useState<'IDLE' | 'MOVING' | 'DESCENDING' | 'CLASPING' | 'ASCENDING' | 'RETURNING' | 'RELEASING' | 'RESET'>('IDLE');
  const [grabbedToyId, setGrabbedToyId] = useState<string | null>(null);

  // Refs for tracking animation loops
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const soundWaveAnimationRef = useRef<boolean>(false);
  const [isWaving, setIsWaving] = useState(false);

  // Selected avatar character of the player
  const hero = useMemo(() => {
    return CHARACTERS.find(c => c.id === stats.selectedCharacterId) || CHARACTERS[0];
  }, [stats.selectedCharacterId]);

  // PLUSH ANIMAL DATA TEMPLATES
  const PLUSH_TEMPLATES = [
    { emoji: '🐱', color: 'from-amber-300 to-orange-400', text: 'text-amber-950', name: '橘猫咪咪' },
    { emoji: '🐻', color: 'from-amber-600 to-amber-800', text: 'text-amber-50', name: '小熊壮壮' },
    { emoji: '🐰', color: 'from-pink-300 to-rose-450', text: 'text-rose-950', name: '兔兔粉粉' },
    { emoji: '🐼', color: 'from-slate-100 to-slate-300 border-slate-400', text: 'text-slate-900', name: '胖达滚滚' },
    { emoji: '🦊', color: 'from-orange-500 to-red-650', text: 'text-orange-50', name: '狐狸灵灵' },
    { emoji: '🦁', color: 'from-yellow-500 to-amber-600', text: 'text-amber-950', name: '狮子卡卡' },
    { emoji: '🐳', color: 'from-sky-300 to-blue-500', text: 'text-blue-950', name: '小鲸泡泡' },
    { emoji: '🐸', color: 'from-green-400 to-emerald-600', text: 'text-emerald-950', name: '蛙蛙呱呱' }
  ];

  // Initialize and play round
  const startGame = () => {
    setGameState('PLAYING');
    setScore(0);
    setCoinsEarned(0);
    setXpEarned(0);
    setHearts(3);
    setCombo(0);
    setMaxCombo(0);
    setTimeLeft(90);
    setHasShield(false);
    setHelperHintActive(false);
    setCurrentWordIndex(0);
    setClawX(50);
    setClawHeight(40);
    setClawOpenAngle(24);
    setClawState('IDLE');
    setGrabbedToyId(null);
    setSelectedToyId(null);

    setupRound(0);
    audio.playPop();
  };

  // Build the Claw Toy capsules for the current word
  const setupRound = (wordIdx: number) => {
    if (allWords.length === 0) return;
    const target = allWords[wordIdx % allWords.length];
    setCurrentWord(target);
    setSelectedToyId(null);
    setGrabbedToyId(null);
    setHelperHintActive(false);

    // Play pronunciation of the new word automatically
    setTimeout(() => {
      audio.speak(target.text);
      triggerSoundWave();
    }, 400);

    // Grab 3 distractor words with unique English texts
    const distractors: WordItem[] = [];
    const usedTexts = new Set<string>([target.text]);

    const randomPool = [...allWords].sort(() => Math.random() - 0.5);
    for (const w of randomPool) {
      if (distractors.length >= 3) break;
      if (!usedTexts.has(w.text) && w.text !== target.text) {
        distractors.push(w);
        usedTexts.add(w.text);
      }
    }

    // Handcraft placeholders if needed (ensure they are single letters in the correct style)
    while (distractors.length < 3) {
      const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
      let foundDummy = false;
      for (const char of alphabet) {
        let textToUse = char;
        if (letterCaseMode === 'LOWER') {
          textToUse = char.toLowerCase();
        } else if (letterCaseMode === 'UPPER') {
          textToUse = char.toUpperCase();
        }
        if (!usedTexts.has(textToUse) && textToUse.toUpperCase() !== target.text.toUpperCase()) {
          distractors.push({ text: textToUse, translation: `字母 ${textToUse}`, imageUrl: '' });
          usedTexts.add(textToUse);
          foundDummy = true;
          break;
        }
      }
      if (!foundDummy) {
        const randomChar = String.fromCharCode(65 + Math.floor(Math.random() * 26));
        const finalChar = letterCaseMode === 'LOWER' ? randomChar.toLowerCase() : randomChar;
        distractors.push({ text: finalChar, translation: `字母 ${finalChar}`, imageUrl: '' });
        usedTexts.add(finalChar);
      }
    }

    // Pool target and distractors (displays English words on the 4 dolls)
    const chosenOptions = [
      { word: target, label: target.text, isCorrect: true },
      ...distractors.map(d => ({ word: d, label: d.text, isCorrect: false }))
    ].sort(() => Math.random() - 0.5);

    // Position options evenly across the bottom of the machine (widely spread out thanks to smaller exit)
    const spreadSpacing = [19, 41, 63, 85];
    // Stagger heights to prevent overlay and create 3D piled up look
    const yOffsets = [2, 18, 5, 21];
    const randomizedTemplates = [...PLUSH_TEMPLATES].sort(() => Math.random() - 0.5);

    const generatedToys: ToyItem[] = chosenOptions.map((opt, i) => {
      const template = randomizedTemplates[i % randomizedTemplates.length];
      return {
        id: `toy-${i}-${Date.now()}`,
        word: opt.word,
        label: opt.label,
        isCorrect: opt.isCorrect,
        xPercent: spreadSpacing[i],
        yOffset: yOffsets[i],
        plushEmoji: template.emoji,
        colorClass: template.color,
        textColor: template.text,
        animalName: template.name,
        isGrabbed: false,
        isCleared: false,
        isGolden: opt.isCorrect && Math.random() < 0.3
      };
    });

    setToys(generatedToys);
  };

  // Timer loop
  useEffect(() => {
    if (gameState === 'PLAYING') {
      timerIntervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [gameState]);

  // Handle time out
  useEffect(() => {
    if (gameState === 'PLAYING' && timeLeft === 0) {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      endGame();
    }
  }, [timeLeft, gameState]);

  // Handle game finish
  const endGame = () => {
    setGameState('SUMMARY');
    try {
      // Shorter, delightful chime instead of the loud crowd cheer
      audio.playUnlock();
    } catch (e) {}

    // Reward calculations
    const finalScore = score;
    const finalCoins = coinsEarned;
    // Broadcast back to custom app context
    onFinish(finalScore, finalCoins);
  };

  // Pronounce voice trigger
  const playTargetAudio = () => {
    if (currentWord) {
      audio.speak(currentWord.text);
      triggerSoundWave();
    }
  };

  const triggerSoundWave = () => {
    setIsWaving(true);
    setTimeout(() => {
      setIsWaving(false);
    }, 1200);
  };

  // Joystick move action
  const moveClawHand = (direction: 'LEFT' | 'RIGHT') => {
    if (clawState !== 'IDLE') return;
    audio.playClick();
    setClawX(curr => {
      const step = 8;
      let nextX = direction === 'LEFT' ? curr - step : curr + step;
      // Clamp bounds (10% to 90% space)
      if (nextX < 15) nextX = 15;
      if (nextX > 85) nextX = 85;

      // Find the closest toy to highlight/select automatic
      let closestToy: ToyItem | null = null;
      let minDist = 999;
      toys.forEach(t => {
        if (!t.isCleared) {
          const dist = Math.abs(t.xPercent - nextX);
          if (dist < minDist) {
            minDist = dist;
            closestToy = t;
          }
        }
      });

      if (closestToy) {
        setSelectedToyId((closestToy as ToyItem).id);
      }

      return nextX;
    });
  };

  // Direct click selection to auto slide claw
  const selectPlushDoll = (toy: ToyItem) => {
    if (clawState !== 'IDLE' || toy.isCleared) return;
    setSelectedToyId(toy.id);
    setClawX(toy.xPercent);
    audio.playClick();
    audio.speak(toy.label);
  };

  // Execute Claw sequence
  const grabPlushDoll = () => {
    if (clawState !== 'IDLE') return;

    // Use current highlighted selection
    const activeToy = toys.find(t => t.id === selectedToyId);
    if (!activeToy) {
      // Pick closest toy if none highlighted
      let closest: ToyItem | null = null;
      let minDist = 999;
      toys.forEach(t => {
        if (!t.isCleared) {
          const dist = Math.abs(t.xPercent - clawX);
          if (dist < minDist) {
            minDist = dist;
            closest = t;
          }
        }
      });
      if (closest) {
        setSelectedToyId((closest as ToyItem).id);
        setClawX((closest as ToyItem).xPercent);
      } else {
        return; // nothing to grab
      }
    }

    // Start Sequence
    setClawState('MOVING');
  };

  // Handle Crane Claw core state machine sequences
  useEffect(() => {
    if (clawState === 'IDLE') return;

    // 1. Moving Crane Slider to align with chosen Toy target X
    if (clawState === 'MOVING') {
      const activeToy = toys.find(t => t.id === selectedToyId);
      if (!activeToy) {
        setClawState('IDLE');
        return;
      }
      
      const targetPercent = activeToy.xPercent;
      let stepSpeed = Math.abs(targetPercent - clawX) > 20 ? 4 : 2;
      const moveInterval = setInterval(() => {
        setClawX(prev => {
          if (Math.abs(prev - targetPercent) <= stepSpeed) {
            clearInterval(moveInterval);
            // Move completed, next sequence: DESCENDING
            setTimeout(() => {
              setClawState('DESCENDING');
              setClawOpenAngle(35); // open fingers before going down
            }, 150);
            return targetPercent;
          }
          return prev < targetPercent ? prev + stepSpeed : prev - stepSpeed;
        });
      }, 16);

      return () => clearInterval(moveInterval);
    }

    // 2. Extending the crane hoist cord down to bottom
    if (clawState === 'DESCENDING') {
      const descendInterval = setInterval(() => {
        setClawHeight(prev => {
          // target height is ~205px representing bottom chamber
          if (prev >= 205) {
            clearInterval(descendInterval);
            setTimeout(() => {
              setClawState('CLASPING');
            }, 200);
            return 205;
          }
          return prev + 6;
        });
      }, 16);
      return () => clearInterval(descendInterval);
    }

    // 3. Clasp the claw fingers tight around the toy capsule
    if (clawState === 'CLASPING') {
      audio.playClick();
      const clampInterval = setInterval(() => {
        setClawOpenAngle(prev => {
          if (prev <= 12) {
            clearInterval(clampInterval);

            // Hook current toy state cleanly
            if (selectedToyId) {
              setGrabbedToyId(selectedToyId);
            }
            setToys(prevToys => {
              return prevToys.map(toy => {
                if (toy.id === selectedToyId) {
                  return { ...toy, isGrabbed: true };
                }
                return toy;
              });
            });

            setTimeout(() => {
              setClawState('ASCENDING');
            }, 300);
            return 12;
          }
          return prev - 2;
        });
      }, 16);
      return () => clearInterval(clampInterval);
    }

    // 4. Retract the claw hoist upward with the grabbed toy!
    if (clawState === 'ASCENDING') {
      const ascendInterval = setInterval(() => {
        setClawHeight(prev => {
          if (prev <= 40) {
            clearInterval(ascendInterval);
            setTimeout(() => {
              setClawState('RETURNING');
            }, 250);
            return 40;
          }
          return prev - 5;
        });
      }, 16);
      return () => clearInterval(ascendInterval);
    }

    // 5. Carry the toy capsule sideways back to Left-hoop chute/basket (X: ~8%)
    if (clawState === 'RETURNING') {
      const returnInterval = setInterval(() => {
        setClawX(prev => {
          const chuteTargetX = 8;
          if (prev <= chuteTargetX) {
            clearInterval(returnInterval);
            setTimeout(() => {
              setClawState('RELEASING');
            }, 200);
            return chuteTargetX;
          }
          return prev - 3;
        });
      }, 16);
      return () => clearInterval(returnInterval);
    }

    // 6. Open claws and drop doll to the prize basket
    if (clawState === 'RELEASING') {
      audio.playPop();
      const openInterval = setInterval(() => {
        setClawOpenAngle(prev => {
          if (prev >= 32) {
            clearInterval(openInterval);

            // Trigger actual drop physics for doll
            setToys(prevToys => {
              return prevToys.map(t => {
                if (t.id === grabbedToyId) {
                  return { ...t, isGrabbed: false, isCleared: true };
                }
                return t;
              });
            });

            // Perform answer evaluation instantly!
            const finalGrabbed = toys.find(t => t.id === grabbedToyId);
            setTimeout(() => {
              if (finalGrabbed) {
                assessChosenAnswer(finalGrabbed);
              } else {
                setClawState('RESET');
              }
            }, 400);

            return 32;
          }
          return prev + 3;
        });
      }, 16);
      return () => clearInterval(openInterval);
    }

    // 7. Reset claw back to starting center position
    if (clawState === 'RESET') {
      const resetInterval = setInterval(() => {
        setClawX(prev => {
          if (Math.abs(prev - 50) <= 2) {
            clearInterval(resetInterval);
            setClawOpenAngle(24);
            setClawState('IDLE');
            setSelectedToyId(null);
            setGrabbedToyId(null);
            return 50;
          }
          return prev < 50 ? prev + 2 : prev - 2;
        });
      }, 16);
      return () => clearInterval(resetInterval);
    }

  }, [clawState, selectedToyId, toys, clawX, grabbedToyId]);

  // Game grading and correct answers handling
  const assessChosenAnswer = (toy: ToyItem) => {
    if (toy.isCorrect) {
      // 1. CLEAR! Correct Word.
      // Light, short success chime (very crisp synthetic sound) + grand cheer sound effect
      playQuietCorrectSound();
      audio.playSuccess();

      const newCombo = combo + 1;
      setCombo(newCombo);
      if (newCombo > maxCombo) setMaxCombo(newCombo);

      // Score details and multiplier boosts! (Fever & Gold capsules)
      const isFeverMode = newCombo >= 3;
      const scoreMultiplier = isFeverMode ? 2 : 1;
      const coinMultiplier = isFeverMode ? 2 : 1;

      const isGoldenToy = !!toy.isGolden;
      const goldCoinMult = isGoldenToy ? 3 : 1;
      const goldScoreBonus = isGoldenToy ? 200 : 0;

      // Base reward calculation
      const basePoints = 100 + (newCombo * 10);
      const points = (basePoints * scoreMultiplier) + goldScoreBonus;
      const coinsGained = (12 + Math.floor(newCombo * 1.5)) * coinMultiplier * goldCoinMult;
      const xpGained = 15 * scoreMultiplier;

      setScore(s => s + points);
      setCoinsEarned(c => c + coinsGained);
      setXpEarned(x => x + xpGained);

      // Next word or end
      setTimeout(() => {
        const nextIdx = currentWordIndex + 1;
        if (nextIdx >= allWords.length) {
          endGame();
        } else {
          setCurrentWordIndex(nextIdx);
          setupRound(nextIdx);
          setClawState('RESET');
        }
      }, 1400);

    } else {
      // 2. ERROR! Incorrect toy word
      playQuietWrongSound();
      audio.playError();
      if (hasShield) {
        // Shield saves life
        setHasShield(false);
        audio.playCelestialMagic(); // Nice clean crystal bubble pop
        
        // Give positive warning
        setTimeout(() => {
          setClawState('RESET');
          setSelectedToyId(null);
        }, 1200);
      } else {
        // Deduct life
        setCombo(0);
        const newHearts = hearts - 1;
        setHearts(newHearts);

        if (newHearts <= 0) {
          setTimeout(() => {
            endGame();
          }, 1200);
        } else {
          // Remind the pronunciation and let them retry selection!
          setTimeout(() => {
            audio.speak(currentWord?.text || '');
            triggerSoundWave();
            // Restore choices so they can try again
            setToys(prev => prev.map(t => t.id === toy.id ? { ...t, isCleared: false } : t));
            setClawState('RESET');
          }, 1400);
        }
      }
    }
  };

  // BUY SHIELD (15 COINS)
  const buyShieldItem = () => {
    if (coinsEarned >= 15 && !hasShield) {
      setCoinsEarned(c => c - 15);
      setHasShield(true);
      audio.playUnlock();
    }
  };

  // BUY MUSHROOM RESTORE HEALTH (25 COINS)
  const buyHealMushroom = () => {
    if (coinsEarned >= 25 && hearts < 3) {
      setCoinsEarned(c => c - 25);
      setHearts(h => Math.min(3, h + 1));
      audio.playLevelUp();
    }
  };

  // TRIGGER 1 EXCLUSION HINT (10 COINS)
  const triggerHintBlast = () => {
    if (coinsEarned >= 10 && !helperHintActive) {
      setCoinsEarned(c => c - 10);
      setHelperHintActive(true);
      audio.playCelestialMagic();

      // Mask one random incorrect doll so that it is cleared/marked
      const incorrectToys = toys.filter(t => !t.isCorrect && !t.isCleared);
      if (incorrectToys.length > 0) {
        const targetToMask = incorrectToys[Math.floor(Math.random() * incorrectToys.length)];
        setToys(prev => prev.map(t => t.id === targetToMask.id ? { ...t, isCleared: true } : t));
      }
    }
  };

  return (
    <div id="word-claw-machine-root" className="w-full max-w-md mx-auto bg-slate-900 rounded-[35px] border-4 border-slate-950 overflow-hidden text-white shadow-2xl relative font-sans">
      
      {/* 1. INTRO SCREEN */}
      {gameState === 'INTRO' && (
        <div className="flex flex-col items-center justify-center p-8 py-16 text-center space-y-6 relative overflow-hidden min-h-[550px] bg-gradient-to-b from-[#1e152a] to-[#0d0914]">
          {/* Animated Retro Neon Marquee Header */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-fuchsia-500 via-pink-400 to-indigo-500 animate-pulse" />
          
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-fuchsia-500 to-indigo-650 flex items-center justify-center text-5xl shadow-[0_0_30px_rgba(217,70,239,0.35)] hover:rotate-12 transition-transform duration-300">
            🧸
          </div>

          <div className="space-y-2">
            <h1 className="text-4xl font-black tracking-tight text-white drop-shadow-[0_2px_10px_rgba(217,70,239,0.5)]">
              神奇抓娃娃机
            </h1>
            <p className="text-[11px] font-black tracking-widest text-fuchsia-400 uppercase">
              Magical Crane Claw Arcade
            </p>
          </div>

          {/* Custom Range & Case Selection */}
          <div className="w-full max-w-sm space-y-4 bg-slate-950/65 border border-indigo-500/20 p-4.5 rounded-2xl text-left">
            <div>
              <h3 className="text-xs font-black tracking-wider text-indigo-400 select-none text-left uppercase flex items-center gap-1.5 mb-2">
                <span>🎯</span> 字母范围分组 (5-6个一组)
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {letterGroups.map((g, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      audio.playClick();
                      setSelectedLetterGroup(idx);
                    }}
                    className={`py-2 px-1 text-xs font-black rounded-xl border-2 transition-all cursor-pointer ${
                      selectedLetterGroup === idx
                        ? 'bg-gradient-to-r from-fuchsia-600 to-indigo-600 border-fuchsia-400 text-white shadow-lg shadow-fuchsia-500/25 scale-105'
                        : 'bg-slate-900 border-indigo-950 text-slate-400 hover:border-indigo-800 hover:text-slate-200'
                    }`}
                  >
                    {g.name}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    audio.playClick();
                    setSelectedLetterGroup(5);
                  }}
                  className={`py-2 px-1 text-xs font-black rounded-xl border-2 transition-all col-span-3 cursor-pointer ${
                    selectedLetterGroup === 5
                      ? 'bg-gradient-to-r from-fuchsia-600 to-indigo-600 border-fuchsia-400 text-white shadow-lg shadow-fuchsia-500/25 scale-102'
                      : 'bg-slate-900 border-indigo-950 text-slate-400 hover:border-indigo-800 hover:text-slate-200'
                  }`}
                >
                  全部 26 个字母 (A - Z)
                </button>
              </div>
            </div>

            <div className="border-t border-slate-900/60 pt-3">
              <h3 className="text-xs font-black tracking-wider text-indigo-400 select-none text-left uppercase flex items-center gap-1.5 mb-2">
                <span>🔤</span> 字母大小写模式
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'MIXED', label: '大+小写混合' },
                  { value: 'UPPER', label: '纯大写 (A-Z)' },
                  { value: 'LOWER', label: '纯小写 (a-z)' },
                ].map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => {
                      audio.playClick();
                      setLetterCaseMode(item.value as any);
                    }}
                    className={`py-2 px-1 text-[11px] font-extrabold rounded-xl border-2 transition-all cursor-pointer ${
                      letterCaseMode === item.value
                        ? 'bg-gradient-to-r from-indigo-600 via-indigo-650 to-indigo-500 border-indigo-400 text-white shadow'
                        : 'bg-slate-900 border-indigo-950 text-slate-400 hover:border-indigo-800 hover:text-slate-200'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Tutorial description */}
          <div className="bg-slate-950/40 border border-slate-900/50 p-4 rounded-xl w-full max-w-sm space-y-2.5 text-[11px] text-left leading-relaxed text-slate-400">
            <div className="flex items-start gap-2">
              <span className="text-xs select-none">🔊</span>
              <p><strong>听音辨字：</strong>点击金蛋可收听发音，操控夹子选中对应的字母娃娃即可兑奖！</p>
            </div>
          </div>

          <button 
            onClick={startGame}
            className="w-full max-w-sm py-4 bg-gradient-to-r from-fuchsia-500 hover:from-fuchsia-400 to-pink-600 hover:to-pink-500 text-white font-extrabold text-lg rounded-2xl transition-all shadow-[0_5px_20px_rgba(219,39,119,0.4)] active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Play size={20} className="fill-white stroke-none" />
            开始抓娃娃！
          </button>

          <button 
            onClick={onClose}
            className="text-xs font-bold text-slate-500 hover:text-slate-300 flex items-center gap-1 transition-colors"
          >
            <ArrowLeft size={12} />
            返回奇乐园
          </button>
        </div>
      )}

      {/* 2. MAIN CORE PLAYING CONTAINER */}
      {gameState === 'PLAYING' && (
        <div className="flex flex-col bg-slate-950 relative min-h-[550px]">
          
          {/* Neon Header Marquee Bar */}
          <div className="bg-slate-950 border-b border-indigo-950 px-4 py-2 flex items-center justify-between select-none shrink-0 relative z-40">
            <div className="flex items-center gap-1.5">
              <button 
                onClick={() => { audio.playClick(); endGame(); }}
                className="p-1.5 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors"
                title="退出游戏"
              >
                <X size={18} />
              </button>
              
              {/* HP Lights */}
              <div className="flex items-center gap-0.5 ml-1">
                {[...Array(3)].map((_, i) => (
                  <Heart 
                    key={i} 
                    size={16} 
                    className={`transition-colors ${i < hearts ? 'fill-red-500 text-red-500 scale-105' : 'fill-slate-800 text-slate-900'}`}
                  />
                ))}
              </div>
            </div>

            {/* Score & Coins indicators */}
            <div className="flex items-center gap-3">
              {/* Star point scores */}
              <div className="bg-slate-900 border border-indigo-500/20 rounded-full px-2.5 py-0.5 flex items-center gap-1 animate-pulse">
                <span className="text-[10px] text-fuchsia-400 font-extrabold select-none">✨</span>
                <span className="text-xs font-extrabold font-mono text-fuchsia-250">{score}</span>
              </div>

              {/* Gold coin counts */}
              <div className="bg-slate-900 border border-yellow-500/20 rounded-full px-2.5 py-0.5 flex items-center gap-1">
                <span className="text-[10px] text-yellow-400 font-extrabold select-none">🪙</span>
                <span className="text-xs font-extrabold font-mono text-yellow-400">{coinsEarned}</span>
              </div>
            </div>

            {/* Neon level round tracker */}
            <div className="bg-indigo-950 px-3 py-0.5 rounded-full text-[10px] font-black text-indigo-300 font-mono tracking-widest border border-indigo-500/25 uppercase shrink-0">
              字母 {currentWordIndex + 1}/{allWords.length}
            </div>
          </div>

          {/* Countdown timer line bar */}
          <div className="w-full h-1 bg-slate-900 overflow-hidden relative z-40 select-none">
            <div 
              className={`h-full transition-all duration-1000 ${timeLeft <= 20 ? 'bg-red-500 animate-pulse' : 'bg-gradient-to-r from-pink-500 to-indigo-500'}`}
              style={{ width: `${(timeLeft / 90) * 100}%` }}
            />
          </div>

          {/* THE MAGICAL SPEAKER BOX SOUND TRANSMITTER & PROMPTS */}
          <div className="bg-indigo-950/45 px-4.5 py-3 border-b border-indigo-950/60 flex items-center justify-between gap-3 relative z-30 shrink-0">
            <div className="flex-1 text-left">
              <span className="text-[9px] font-black text-fuchsia-400 tracking-wider block uppercase mb-0.5 select-none font-sans">
                🔊 点击金蛋收听字母发音
              </span>
              <span className="text-xs font-bold text-slate-300 leading-tight">
                听完读音，选择下方带有对应英文字母的小玩偶吧：
              </span>
            </div>

            {/* Glowing Golden Speaker Transmitter Button */}
            <div className="relative shrink-0">
              {isWaving && (
                <div className="absolute inset-0 bg-yellow-400/20 rounded-full scale-140 animate-ping pointer-events-none" />
              )}
              <button
                onClick={playTargetAudio}
                className="relative w-14 h-14 bg-gradient-to-b from-yellow-300 to-yellow-500 rounded-full border-3 border-yellow-200 hover:border-white shadow-[0_0_18px_rgba(234,179,8,0.45)] flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95 transition-all text-slate-900 group"
                title="播放发音"
              >
                <div className="bg-white/30 rounded-full absolute inset-1.5 animate-pulse" />
                <Volume2 size={24} className="stroke-[3] relative z-10 text-yellow-950 group-hover:rotate-12 transition-transform duration-150" />
              </button>
            </div>
          </div>

          {/* CABINET GLASS CHAMBER WIND (The physical stage representation) */}
          <div 
            className="flex-1 w-full bg-[#130d24] relative overflow-hidden flex flex-col justify-end p-2.5 pb-0 select-none min-h-[300px] border-x-[10px] border-slate-950"
            style={{ backgroundImage: 'radial-gradient(circle at 50% 30%, #20173a 0%, #0d081b 100%)' }}
          >
            {/* Left and Right Glowing Neon Tube Side-Bezels */}
            <div className="absolute top-0 bottom-0 left-0 w-1.5 bg-gradient-to-r from-pink-500 via-fuchsia-500 to-transparent opacity-85 z-25 pointer-events-none shadow-[0_0_12px_#ec4899]" />
            <div className="absolute top-0 bottom-0 right-0 w-1.5 bg-gradient-to-l from-pink-500 via-fuchsia-500 to-transparent opacity-85 z-25 pointer-events-none shadow-[0_0_12px_#ec4899]" />

            {/* Glowing marquee bulb sequence (flashing miniature arcade dots) */}
            <div className="absolute top-1 inset-x-0 flex justify-around px-4 opacity-75 z-25 pointer-events-none">
              <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping [animation-delay:0.3s]" />
              <div className="w-1.5 h-1.5 rounded-full bg-pink-400 animate-pulse [animation-delay:0.6s]" />
              <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-ping [animation-delay:0.9s]" />
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse [animation-delay:1.2s]" />
              <div className="w-1.5 h-1.5 rounded-full bg-pink-400 animate-ping [animation-delay:1.5s]" />
            </div>

            {/* Mirror reflection slash line on glass overlay side background */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/2 opacity-[0.035] pointer-events-none z-10" />

            {/* Left side Chute / Prize collector hopper box bottom */}
            <div className="absolute bottom-0 left-1 w-[13%] min-w-[34px] h-20 bg-slate-900 rounded-t-2xl border-2 border-slate-800 z-10 overflow-hidden flex flex-col items-center justify-end font-sans">
              <div className="absolute inset-0 bg-radial-vignette opacity-20 pointer-events-none" />
              {/* Prize label sign */}
              <div className="text-[7.5px] font-black tracking-normal text-[#d946ef] text-center w-full bg-slate-950 border-b border-indigo-950 py-0.5 select-none uppercase">
                🎁出口
              </div>
              <div className="h-10 text-center flex items-center justify-center text-xl sm:text-2xl">
                {grabbedToyId ? '🤖' : '✨'}
              </div>
            </div>

            {/* Glass Chamber Retro Laser Sign indicator */}
            <div className="absolute top-5 inset-x-0 text-center z-12 select-none pointer-events-none">
              {combo >= 3 ? (
                <span className="px-3 py-1 border border-orange-500 bg-slate-950/90 text-[10px] font-bold tracking-widest text-orange-400 rounded-md shadow-[0_0_15px_rgba(249,115,22,0.4)] animate-pulse uppercase">
                  🔥 FEVER DOUBLE COINS ACTIVE 🔥
                </span>
              ) : (
                <span className="px-3 py-0.5 border border-fuchsia-500/20 text-[8px] font-mono tracking-widest text-fuchsia-400 rounded-sm bg-slate-950/50 font-black uppercase opacity-40">
                  ⚡ CRANE ARCADE SYSTEM ⚡
                </span>
              )}
            </div>

            {/* CRANE MECHANICS OVERLAY PANEL (Top of Chamber) */}
            <div className="absolute top-0 inset-x-0 h-4 bg-slate-950 border-b-2 border-indigo-950 flex items-center relative z-20">
              {/* Slider rail beam */}
              <div className="w-full h-1 bg-slate-800 border-b border-slate-900" />
            </div>

            {/* MECHANICAL CRANE CLAW ASSEMBLY UNIT */}
            <div 
              className="absolute top-2.5 z-20 pointer-events-none transition-all duration-75"
              style={{ left: `${clawX}%`, transform: 'translateX(-50%)' }}
            >
              {/* Steel suspension lift cord */}
              <div 
                className="w-1 bg-[#d4d4d8] border-x border-slate-650 mx-auto transition-all duration-75"
                style={{ height: `${clawHeight}px` }}
              />

              {/* Claw frame core crown */}
              <div className="w-8 h-4 bg-[#71717a] rounded-b-md border border-[#52525b] mx-auto -mt-1 relative flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee] animate-pulse" />
              </div>

              {/* Claws Left & Right fingers with active rotation */}
              <div className="flex justify-between w-12 -mt-0.5 mx-auto relative px-0.5">
                {/* Left Finger */}
                <div 
                  className="w-4 h-6 border-2 border-[#a1a1aa] bg-[#71717a] rounded-bl-full border-t-0 rounded-tl-sm transition-all origin-top-right duration-75"
                  style={{ transform: `rotate(${-clawOpenAngle}deg)` }}
                />
                
                {/* Grabbed Doll nested element (moves down attached directly to tip of clamp) */}
                {grabbedToyId && (
                  <div className="-mt-1 relative z-30 scale-85 animate-bounce">
                    <div className="text-3xl filter drop-shadow">
                      {toys.find(t => t.id === grabbedToyId)?.plushEmoji}
                    </div>
                  </div>
                )}

                {/* Right Finger */}
                <div 
                  className="w-4 h-6 border-2 border-[#a1a1aa] bg-[#71717a] rounded-br-full border-t-0 rounded-tr-sm transition-all origin-top-left duration-75"
                  style={{ transform: `rotate(${clawOpenAngle}deg)` }}
                />
              </div>
            </div>

            {/* COPIOUS RETRO COMBO COUNTER FLOATER */}
            {combo > 1 && (
              <div className="absolute top-[3px] left-1/2 -translate-x-1/2 z-30 pointer-events-none">
                <span className={`px-2.5 py-0.5 border border-white text-[9.5px] font-black text-white rounded-full uppercase tracking-wider block shadow-md ${combo >= 3 ? 'bg-orange-500 animate-pulse scale-105' : 'bg-pink-500'}`}>
                  {combo >= 3 ? `🔥 FEVER 双倍金币 ×${combo}` : `⚡ 连击 COMBOS ×${combo}`}
                </span>
              </div>
            )}

            {/* CUTE PLUSH TOYS BED (Piled at the chamber ground) */}
            <div className="w-full h-24 relative flex items-end justify-center z-20 select-none">
              
              <AnimatePresence>
                {toys.map((toy) => {
                  if (toy.isCleared) return null;

                  const isHighlighted = selectedToyId === toy.id;
                  
                  return (
                    <motion.div
                      key={toy.id}
                      initial={{ opacity: 0, scale: 0.1, y: 30 }}
                      animate={toy.isGrabbed 
                        ? { 
                            y: -10, 
                            scale: 1, 
                            opacity: 1,
                            rotate: [0, -10, 10, -5, 5, 0],
                            transition: { repeat: Infinity, duration: 1.5 }
                          } 
                        : isHighlighted 
                          ? { y: -8, scale: 1.05, opacity: 1, filter: 'brightness(1.1)' } 
                          : { y: 0, scale: 1, opacity: 1 }
                      }
                      exit={{ 
                        y: 110, 
                        rotate: 180, 
                        scale: 0.2, 
                        opacity: 0,
                        transition: { duration: 0.4, ease: 'easeIn' }
                      }}
                      onClick={() => selectPlushDoll(toy)}
                      className="absolute cursor-pointer flex flex-col items-center justify-between text-center group pointer-events-auto select-none"
                      style={{ 
                        left: `${toy.xPercent}%`, 
                        bottom: `${6 + toy.yOffset}px`,
                        transform: 'translateX(-50%)',
                        width: '76px'
                      }}
                    >
                      {/* Interactive Pointer Ring Tag */}
                      <div className="h-4 flex items-center justify-center mb-0.5">
                        {isHighlighted && (
                          <span className="text-xs animate-bounce text-yellow-300 filter drop-shadow-md select-none">
                            👇
                          </span>
                        )}
                      </div>

                      {/* Golden crown tag overlay */}
                      {toy.isGolden && (
                        <div className="absolute top-3 right-3 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center border border-white text-[8px] animate-bounce shadow-md shadow-yellow-500 z-30">
                          👑
                        </div>
                      )}

                      {/* Plush capsule bubble shape body */}
                      <div 
                        className={`w-12 sm:w-13 h-12 sm:h-13 rounded-full flex items-center justify-center p-1 transition-all select-none duration-150 border-3 ${
                          toy.isGolden 
                            ? 'bg-gradient-to-b from-yellow-300 via-amber-400 to-yellow-600 border-yellow-300 shadow-[0_0_12px_rgba(234,179,8,0.7)]'
                            : `bg-gradient-to-b ${toy.colorClass} border-slate-950 shadow-md`
                        } ${isHighlighted ? 'ring-4 ring-yellow-400/50 scale-105 saturate-110' : ''}`}
                      >
                        {/* Animal Facials */}
                        <div className="text-xl sm:text-2xl select-none flex items-center justify-center">
                          {toy.plushEmoji}
                        </div>
                      </div>

                      {/* HIGH-CONTRAST CHUBBY WORDS LABEL - STANDOUT CONTRAST & READABLE FONT */}
                      <div 
                        className={`mt-1 px-1.5 py-0.5 bg-yellow-300 border-2 border-slate-950 rounded-xl text-center shadow shadow-black/40 w-full overflow-hidden text-ellipsis whitespace-nowrap transition-transform duration-100 ${
                          isHighlighted ? 'scale-105 bg-yellow-250' : ''
                        }`}
                      >
                        <span className="font-extrabold tracking-wider leading-none text-slate-950 font-sans block truncate select-none text-[16px] sm:text-[18px]">
                          {toy.label}
                        </span>
                      </div>

                      {/* Cute Animal Foot Base Decal */}
                      <div className={`text-[10px] font-extrabold mt-1 uppercase scale-90 select-none ${
                        toy.isGolden ? 'text-yellow-400 font-bold saturate-150' : 'text-slate-400 group-hover:text-fuchsia-300'
                      } transition-colors`}>
                        {toy.isGolden ? `✨金${toy.animalName.slice(2)}` : toy.animalName}
                      </div>

                    </motion.div>
                  );
                })}
              </AnimatePresence>

            </div>

            {/* Glass capsule base dirt shelf board floor layout */}
            <div className="h-4 w-full bg-slate-950 border-t-3 border-indigo-950 flex justify-between px-6 z-20 relative">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-800" />
              <div className="w-1.5 h-1.5 rounded-full bg-slate-800" />
              <div className="w-1.5 h-1.5 rounded-full bg-slate-800" />
            </div>

          </div>

          {/* RETRO CONTROL PANEL DOCK (Dashboard Buttons & Joystick) */}
          <div className="bg-slate-900 border-t-4 border-slate-950 p-4 relative z-30 shrink-0">
            <div className="flex items-center justify-between gap-4">
              
              {/* JOYSTICK LEFT & RIGHT PUSH CONTROLS */}
              <div className="flex flex-col items-center gap-1">
                <span className="text-[8px] font-extrabold text-slate-500 uppercase tracking-widest select-none">
                  🕹️ 机械爪微调
                </span>
                
                <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
                  <button 
                    onClick={() => moveClawHand('LEFT')}
                    className="w-10 h-10 bg-slate-900 hover:bg-slate-800 border-2 border-slate-750 text-slate-350 hover:text-white rounded-lg flex items-center justify-center active:scale-90 select-none font-bold cursor-pointer"
                  >
                    ◀
                  </button>
                  {/* Virtual glowing stick head */}
                  <div className="w-5 h-5 rounded-full bg-gradient-to-br from-fuchsia-400 to-indigo-650 shadow-[0_0_8px_rgba(168,85,247,0.5)] select-none" />
                  
                  <button 
                    onClick={() => moveClawHand('RIGHT')}
                    className="w-10 h-10 bg-slate-900 hover:bg-slate-800 border-2 border-slate-750 text-slate-350 hover:text-white rounded-lg flex items-center justify-center active:scale-90 select-none font-bold cursor-pointer"
                  >
                    ▶
                  </button>
                </div>
              </div>

              {/* COIN INLET DOOR LIGHT ACCENT */}
              <div className="hidden sm:flex flex-col items-center justify-center border border-slate-800 bg-slate-950 px-4 py-1.5 rounded-xl">
                <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest select-none">COIN RETURN</span>
                <div className="w-2 h-5 bg-amber-500/80 rounded shadow-[0_0_8px_rgba(245,158,11,0.6)] animate-pulse mt-1" />
                <span className="text-[7.5px] font-extrabold text-amber-500 mt-0.5 select-none font-mono">INSERT COIN</span>
              </div>

              {/* ACTION: RED CRANE GRAB ACTION PANEL BAR */}
              <div className="flex-1 max-w-[140px]">
                <button
                  onClick={grabPlushDoll}
                  disabled={clawState !== 'IDLE'}
                  className={`w-full py-3.5 border-b-[6px] border-amber-900 rounded-2xl flex flex-col items-center justify-center text-center font-extrabold transition-all relative select-none ${
                    clawState === 'IDLE'
                      ? 'bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-350 hover:to-amber-450 text-slate-950 cursor-pointer active:scale-95 active:border-b-[2px] active:translate-y-[4px]'
                      : 'bg-slate-950 border-slate-900 text-slate-650 cursor-not-allowed opacity-40'
                  }`}
                >
                  <span className="text-sm font-black uppercase tracking-wider block">
                    {clawState === 'IDLE' ? '⚡ 启动抓取' : '🤖 动作中...'}
                  </span>
                  <span className="text-[10px] font-bold block opacity-75">
                    GRAB MACHINE
                  </span>
                </button>
              </div>

            </div>

            {/* DOCK BAR FOR TRAVELING BACKPACK POWERUPS ACCESSORIES */}
            <div className="mt-4 flex items-center justify-between flex-wrap gap-2 pt-3 border-t border-slate-800">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest select-none">
                🎒 随身金币小商店：
              </span>

              <div className="flex items-center gap-1.5 flex-wrap">
                {/* Immune protection shield */}
                <button
                  onClick={buyShieldItem}
                  disabled={coinsEarned < 15 || hasShield}
                  className={`px-2.5 py-1.5 border rounded-xl text-[10px] font-black flex items-center gap-1 transition-all select-none ${
                    hasShield 
                      ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' 
                      : coinsEarned >= 15 
                        ? 'bg-slate-950 hover:bg-indigo-950/40 border-cyan-500/40 text-cyan-400 cursor-pointer active:scale-95' 
                        : 'bg-slate-950/20 border-slate-850 text-slate-600 cursor-not-allowed font-medium'
                  }`}
                  title="防护盾：免去一次答错扣血（需要15金币）"
                >
                  🛡️ {hasShield ? '免错盾 (已装配)' : '买遮错盾 (15🪙)'}
                </button>

                {/* Healing heart mushroom */}
                <button
                  onClick={buyHealMushroom}
                  disabled={coinsEarned < 25 || hearts >= 3}
                  className={`px-2.5 py-1.5 border rounded-xl text-[10px] font-black flex items-center gap-1 transition-all select-none ${
                    hearts >= 3 
                      ? 'bg-slate-950/20 border-slate-850 text-slate-600 cursor-not-allowed' 
                      : coinsEarned >= 25 
                        ? 'bg-slate-950 hover:bg-indigo-950/40 border-rose-500/40 text-rose-450 cursor-pointer active:scale-95' 
                        : 'bg-slate-950/20 border-slate-850 text-slate-600 cursor-not-allowed font-medium'
                  }`}
                  title="恢复生命：回复一点气血（需要25金币）"
                >
                  ❤️ {hearts >= 3 ? '生命饱满' : '买恢复菇 (25🪙)'}
                </button>

                {/* Exclude wrong answers with magical spell */}
                <button
                  onClick={triggerHintBlast}
                  disabled={coinsEarned < 10 || helperHintActive}
                  className={`px-2.5 py-1.5 border rounded-xl text-[10px] font-black flex items-center gap-1 transition-all select-none ${
                    helperHintActive 
                      ? 'bg-slate-950/20 border-slate-850 text-slate-600 cursor-not-allowed' 
                      : coinsEarned >= 10 
                        ? 'bg-slate-950 hover:bg-indigo-950/40 border-amber-500/40 text-amber-450 cursor-pointer active:scale-95' 
                        : 'bg-slate-950/20 border-slate-850 text-slate-600 cursor-not-allowed font-medium'
                  }`}
                  title="智慧提示：直接消解排除一个错误娃娃玩偶（需要10金币）"
                >
                  🧪 排除错误 (10🪙)
                </button>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* 3. VICTORY / SUMMARY STATISTICS BOARD */}
      {gameState === 'SUMMARY' && (
        <div className="flex flex-col items-center justify-center p-6 py-10 text-center space-y-6 bg-gradient-to-b from-[#1b1e36] to-[#0b0c16] min-h-[550px] relative overflow-hidden font-sans">
          
          <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500" />

          {/* Decorative glowing backplate */}
          <div className="w-20 h-20 bg-gradient-to-tr from-amber-400 to-yellow-500 rounded-full flex items-center justify-center text-4xl shadow-[0_0_35px_rgba(245,158,11,0.3)] select-none">
            🏆
          </div>

          <div className="space-y-1.5">
            <h2 className="text-3xl font-black text-white tracking-tight drop-shadow-sm">
              娃娃机大满贯！
            </h2>
            <p className="text-[10px] font-black tracking-widest text-[#fbbf24] uppercase">
              Claw Machine Mission Clear
            </p>
          </div>

          <div className="w-full max-w-sm bg-slate-950/60 p-5 rounded-2xl border-2 border-slate-850 grid grid-cols-2 gap-4">
            {/* XP indicator */}
            <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl text-center space-y-1">
              <span className="text-xs font-black text-slate-400 uppercase tracking-wider block select-none">获得经验</span>
              <span className="text-2xl font-black text-indigo-400 font-mono">+{xpEarned} <span className="text-[10px] font-extrabold">XP</span></span>
            </div>

            {/* Gold coins gained */}
            <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl text-center space-y-1">
              <span className="text-xs font-black text-slate-400 uppercase tracking-wider block select-none">金币进账</span>
              <span className="text-2xl font-black text-yellow-400 font-mono">+{coinsEarned} <span className="text-[10px] font-extrabold">🪙</span></span>
            </div>

            {/* Best combo streak */}
            <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl text-center space-y-1">
              <span className="text-xs font-black text-slate-400 uppercase tracking-wider block select-none">最大连击</span>
              <span className="text-2xl font-black text-pink-400 font-mono">{maxCombo} <span className="text-[10px] font-extrabold">次</span></span>
            </div>

            {/* Total Game Score */}
            <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl text-center space-y-1">
              <span className="text-xs font-black text-slate-400 uppercase tracking-wider block select-none">总计积分</span>
              <span className="text-2xl font-black text-fuchsia-400 font-mono">{score}</span>
            </div>
          </div>

          {/* User's profile summary banner */}
          <div className="bg-slate-900 p-3 rounded-2xl border border-slate-800 w-full max-w-sm flex items-center justify-between gap-3 text-left">
            <div className="flex items-center gap-2.5">
              <span className="text-3xl select-none">{hero.avatar}</span>
              <div>
                <span className="font-extrabold text-sm block tracking-wide">{hero.name}</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase">魔法学院特工</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-black text-slate-400 uppercase block select-none">结算状态</span>
              <span className={`text-xs font-black px-2 py-0.5 rounded-full ${hearts > 0 ? 'bg-emerald-500/15 border border-emerald-500/20 text-emerald-400' : 'bg-red-500/15 border border-red-500/20 text-red-400'}`}>
                {hearts > 0 ? '⭐ 凯旋而归' : '❌ 体力竭尽'}
              </span>
            </div>
          </div>

          <div className="w-full max-w-sm space-y-2.5">
            <button 
              onClick={startGame}
              className="w-full py-4 bg-slate-900 hover:bg-slate-800 border-2 border-slate-750 text-white font-extrabold text-sm rounded-xl transition-all select-none active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <RotateCcw size={15} />
              重新再玩一次
            </button>

            <button 
              onClick={onClose}
              className="w-full py-4 bg-gradient-to-r from-fuchsia-500 to-pink-600 hover:brightness-105 text-white font-extrabold text-sm rounded-xl transition-all select-none active:scale-95 cursor-pointer shadow-md"
            >
              关闭并退出
            </button>
          </div>

        </div>
      )}

    </div>
  );
};

export default WordClawMachine;
