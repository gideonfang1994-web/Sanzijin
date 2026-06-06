
let currentBgm: HTMLAudioElement | null = null;
let activeUtterances: SpeechSynthesisUtterance[] = [];
let activeWordAudio: HTMLAudioElement | null = null;
let lastSpeakText = '';
let lastSpeakTime = 0;

let activeAudioCtx: AudioContext | null = null;

export const playRhythmicDrum = (step: number) => {
  if (typeof window === 'undefined') return;
  try {
    const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtxClass) return;
    
    if (!activeAudioCtx || activeAudioCtx.state === 'closed') {
      activeAudioCtx = new AudioCtxClass();
    }
    const ctx = activeAudioCtx;
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const now = ctx.currentTime;
    const loopStep = step % 3; // Triplet beat: 0, 1, 2

    // 1. Core resonant wood/drum oscillator
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    
    filter.type = 'bandpass';
    osc.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    // 2. High-frequency click accentuator to simulate a physical mallet hitting a block
    const clickOsc = ctx.createOscillator();
    const clickGain = ctx.createGain();
    clickOsc.type = 'triangle';
    clickOsc.connect(clickGain);
    clickGain.connect(ctx.destination);

    if (loopStep === 0) {
      // Step 1: Accent Hit "哒" (Medium-High energetic wood block / tanggu)
      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.15);
      
      filter.frequency.setValueAtTime(450, now);
      filter.Q.setValueAtTime(8, now);
      
      gainNode.gain.setValueAtTime(0.25, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      
      clickOsc.frequency.setValueAtTime(1500, now);
      clickOsc.frequency.exponentialRampToValueAtTime(300, now + 0.015);
      clickGain.gain.setValueAtTime(0.08, now);
      clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.015);
      
      osc.start(now);
      osc.stop(now + 0.16);
      clickOsc.start(now);
      clickOsc.stop(now + 0.02);

    } else if (loopStep === 1) {
      // Step 2: Pitch Transition "哒" (High crisp wooden slap)
      osc.type = 'sine';
      osc.frequency.setValueAtTime(420, now);
      osc.frequency.exponentialRampToValueAtTime(200, now + 0.1);
      
      filter.frequency.setValueAtTime(650, now);
      filter.Q.setValueAtTime(10, now);
      
      gainNode.gain.setValueAtTime(0.18, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      
      clickOsc.frequency.setValueAtTime(1850, now);
      clickOsc.frequency.exponentialRampToValueAtTime(500, now + 0.012);
      clickGain.gain.setValueAtTime(0.09, now);
      clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.012);
      
      osc.start(now);
      osc.stop(now + 0.11);
      clickOsc.start(now);
      clickOsc.stop(now + 0.02);

    } else {
      // Step 3: Resolving Drop "哒" (Deep warm resonant low woodblock)
      osc.type = 'sine';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(70, now + 0.22);
      
      filter.frequency.setValueAtTime(220, now);
      filter.Q.setValueAtTime(5, now);
      
      gainNode.gain.setValueAtTime(0.32, now); // Anchoring beat
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      
      clickOsc.frequency.setValueAtTime(1000, now);
      clickOsc.frequency.exponentialRampToValueAtTime(200, now + 0.02);
      clickGain.gain.setValueAtTime(0.06, now);
      clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);
      
      osc.start(now);
      osc.stop(now + 0.23);
      clickOsc.start(now);
      clickOsc.stop(now + 0.035);
    }
  } catch (e) {
    console.warn('[DrumSynth] playRhythmicDrum error:', e);
  }
};

export const drumController = {
  start: () => {
    // Keep for loop backward compatibility
  },
  stop: () => {
    // Keep for loop backward compatibility
  }
};

export const audio = {
  init: () => {
    // Initialize audio context if needed
  },
  unlockSpeech: () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      if (window.speechSynthesis.paused) {
        try { window.speechSynthesis.resume(); } catch (e) {}
      }
      try {
        const u = new SpeechSynthesisUtterance(' ');
        u.volume = 0;
        u.rate = 1;
        activeUtterances.push(u); // Prevent GC
        const cleanup = () => {
          activeUtterances = activeUtterances.filter(item => item !== u);
        };
        u.onend = cleanup;
        u.onerror = cleanup;
        window.speechSynthesis.speak(u);
      } catch (e) {}
    }
  },
  playBGM: (gameId: string) => {
    if (typeof window === 'undefined') return;
    
    // Stop any existing BGM
    if (currentBgm) {
      try {
        currentBgm.pause();
      } catch (e) {}
      currentBgm = null;
    }

    const tracks: Record<string, string> = {
      SCRAMBLE: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', // Upbeat synth
      HAMSTER: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',  // Playful fast-beat
      FISHING: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',  // Smooth flow
      PLANTS: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',   // Intense battlefield
      SHEEP: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',    // Cheerful puzzle
      
      // Extended magical tracks for extra immersion
      CHALLENGE: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3',
      DINO: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
      ICECREAM: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
      RAIDEN: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3',
      MINER: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3',
      SLASHER: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3',
      SONAR: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3',
      COOKING: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3',
      FEEDING: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3',
      BALLOON: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3',
      ALCHEMIST: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-16.mp3',
      WHACK: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
      SPELLING: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      SHOOTER: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
      ROCKET: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3',
      POPIT: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
      POTION: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-16.mp3',
      PARROT: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
      DUBBING: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3'
    };

    const url = tracks[gameId];
    if (!url) return;

    try {
      const audioObj = new Audio(url);
      audioObj.loop = true;
      audioObj.volume = 0.08; // Balanced background volume (reduced by 30%)
      currentBgm = audioObj;
      audioObj.play().catch(err => {
        console.log('[BGM] Failed to autoplay:', err);
      });
    } catch (e) {
      console.warn('[BGM] Error playing BGM:', e);
    }
  },
  stopBGM: () => {
    if (currentBgm) {
      try {
        currentBgm.pause();
      } catch (e) {}
      currentBgm = null;
    }
  },
  playClick: () => {
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3');
    audio.volume = 0.2;
    audio.play().catch(() => {});
  },
  playSuccess: () => {
    const successSounds = [
      'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3', // Cheer 1
      'https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3', // Cheer 2
      'https://assets.mixkit.co/active_storage/sfx/2018/2018-preview.mp3', // Cheer 3
      'https://assets.mixkit.co/active_storage/sfx/1434/1434-preview.mp3', // Victory cheer
    ];
    const randomSound = successSounds[Math.floor(Math.random() * successSounds.length)];
    const audio = new Audio(randomSound);
    audio.volume = 0.6; // Higher volume for cheer
    audio.play().catch(() => {});
  },
  playError: () => {
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2573/2573-preview.mp3');
    audio.volume = 0.3;
    audio.play().catch(() => {});
  },
  playPop: () => {
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3');
    audio.volume = 0.1;
    audio.play().catch(() => {});
  },
  playCheer: () => {
    const cheers = [
      'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3', // Success
      'https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3', // Crowd cheer
      'https://assets.mixkit.co/active_storage/sfx/2018/2018-preview.mp3', // Small cheer
      'https://assets.mixkit.co/active_storage/sfx/1434/1434-preview.mp3', // Victory
      'https://assets.mixkit.co/active_storage/sfx/2017/2017-preview.mp3', // Applause
    ];
    const randomCheer = cheers[Math.floor(Math.random() * cheers.length)];
    const audio = new Audio(randomCheer);
    audio.volume = 0.3;
    audio.play().catch(() => {});
  },
  playPurchase: () => {
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3');
    audio.volume = 0.4;
    audio.play().catch(() => {});
  },
  playEquip: (itemType?: string) => {
    // Satisfying custom item-type sound effects
    let url = 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3'; // Default light snap/pop
    let volume = 0.3;

    if (itemType === 'WEAPON') {
      // Blade unsheathe / metal slice sword sound
      url = 'https://assets.mixkit.co/active_storage/sfx/1460/1460-preview.mp3';
      volume = 0.45;
    } else if (itemType === 'ARMOR' || itemType === 'OUTFIT') {
      // Solid buckle metal lock/fastener armor sound
      url = 'https://assets.mixkit.co/active_storage/sfx/1110/1110-preview.mp3';
      volume = 0.5;
    } else if (itemType === 'PET') {
      // Magic chime sparkle sound
      url = 'https://assets.mixkit.co/active_storage/sfx/2017/2017-preview.mp3';
      volume = 0.4;
    }

    const audioObj = new Audio(url);
    audioObj.volume = volume;
    audioObj.play().catch(() => {});
  },
  playUnlock: () => {
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3');
    audio.volume = 0.5;
    audio.play().catch(() => {});
  },
  playCoin: () => {
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2017/2017-preview.mp3');
    audio.volume = 0.2;
    audio.play().catch(() => {});
  },
  playLevelUp: () => {
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/1434/1434-preview.mp3');
    audio.volume = 0.5;
    audio.play().catch(() => {});
  },
  playReward: () => {
    // Shimmering chimes and magic sparkle for rewards and gift claiming
    const audioObj = new Audio('https://assets.mixkit.co/active_storage/sfx/2017/2017-preview.mp3');
    audioObj.volume = 0.6;
    audioObj.play().catch(() => {});
  },
  playPageTurn: () => {
    // Elegant airy swoosh/card turn sound from Mixkit
    const audioObj = new Audio('https://assets.mixkit.co/active_storage/sfx/730/730-preview.mp3');
    audioObj.volume = 0.35;
    audioObj.play().catch(() => {});
  },
  speak: (text: string) => {
    // Stop any existing drum rhythm
    try { drumController.stop(); } catch (e) {}

    const now = Date.now();
    if (text && text === lastSpeakText && now - lastSpeakTime < 800) {
      console.log("[AudioUtils] Deduplicated rapid repeat speak request for:", text);
      return;
    }
    lastSpeakText = text || '';
    lastSpeakTime = now;

    if (typeof window !== 'undefined') {
      if (activeWordAudio) {
        try { activeWordAudio.pause(); } catch (e) {}
        activeWordAudio = null;
      }
      if (window.speechSynthesis) {
        try { window.speechSynthesis.cancel(); } catch (e) {}
      }
    }
    if (!text || typeof window === 'undefined') return;
    
    const cleanWord = text.trim();
    if (!cleanWord) return;

    const isChinese = /[\u4e00-\u9fa5]/.test(cleanWord);
    
    // Master IPA dictionary
    const ipaMap: Record<string, string> = {
      'æ': 'aah', 'ɑː': 'ah', 'aː': 'ah', 'ʌ': 'uhh', 'ɔː': 'aw', 'ɒ': 'ah', 'ə': 'uh', 'ɜː': 'err',
      'e': 'ehh', 'ɛ': 'ehh', 'iː': 'eee', 'ɪ': 'ihh', 'uː': 'ooo', 'ʊ': 'uuh',
      'eɪ': 'ae', 'aɪ': 'eye', 'ɔɪ': 'oy', 'oʊ': 'oh', 'əʊ': 'oh', 'aʊ': 'ow', 'ɪə': 'ear', 'eə': 'air', 'ʊə': 'yoor',
      'p': 'puh', 'b': 'buh', 't': 'tuh', 'd': 'duh', 'k': 'kuh', 'g': 'guh', 'ɡ': 'guh', 'f': 'fff', 'v': 'vvv',
      'θ': 'thhh', 'ð': 'thuh', 's': 'sss', 'z': 'zzz', 'ʃ': 'shhh', 'ʒ': 'zh', 'h': 'hhh', 'm': 'mmm', 'n': 'nnn',
      'ŋ': 'ing', 'l': 'lll', 'r': 'rrr', 'j': 'yuh', 'w': 'wuh', 'tʃ': 'tch', 'dʒ': 'juh', 'kw': 'kwuh'
    };

    const normText = cleanWord.toLowerCase().replace(/[\[\]\/\/]/g, '').trim();

    // Short phonic segment sounds like "buh", "duh", "fff" or explicit IPA representations
    const isPhonicSegmentSound = [
      'buh', 'duh', 'guh', 'kuh', 'puh', 'tuh', 'fff', 'hhh', 'lll', 'mmm', 'nnn', 'rrr', 'sss', 'vvv', 'zzz',
      'aah', 'ehh', 'ihh', 'uhh', 'shhh', 'tch', 'thhh', 'wuh', 'kwuh', 'eee', 'ooo', 'ow', 'oy'
    ].includes(cleanWord.toLowerCase()) || 
    cleanWord.startsWith('[') || 
    cleanWord.endsWith(']') || 
    cleanWord.startsWith('/') ||
    cleanWord.endsWith('/') ||
    !!ipaMap[normText];

    const speakSynth = (phrase: string, isZh: boolean) => {
      if (!window.speechSynthesis) return;
      if (window.speechSynthesis.paused) {
        try { window.speechSynthesis.resume(); } catch (e) {}
      }
      try { window.speechSynthesis.cancel(); } catch (e) {}

      let finalPhrase = phrase;
      let rateMultiplier = 0.85;

      if (!isZh) {
        const norm = phrase.toLowerCase().replace(/[\[\]\/\/]/g, '').trim();
        const ipaRes = ipaMap[norm];
        if (ipaRes) {
          finalPhrase = ipaRes;
          rateMultiplier = 0.65; // slow down phonics for maximum clarity
        }
      }

      const utterance = new SpeechSynthesisUtterance(finalPhrase);
      activeUtterances.push(utterance); // Prevent GC
      const cleanup = () => {
        activeUtterances = activeUtterances.filter(u => u !== utterance);
      };
      utterance.onend = cleanup;
      utterance.onerror = cleanup;

      // Triple-beat synchronized "da-da-da" drum hits precisely matching character boundaries
      let boundaryCount = 0;
      let lastTriggeredCharIndex = -1;

      utterance.onboundary = (event) => {
        if (event.name === 'word' || event.name === 'char') {
          const charIdx = event.charIndex;
          if (charIdx !== lastTriggeredCharIndex) {
            const char = utterance.text.charAt(charIdx);
            // Verify if spoken element is a classic alphanumeric/Han zi symbol to skip commas and whitespace
            if (/[\u4e00-\u9fa5a-zA-Z0-9]/.test(char)) {
              lastTriggeredCharIndex = charIdx;
              playRhythmicDrum(boundaryCount);
              boundaryCount++;
            }
          }
        }
      };

      if (isZh) {
        utterance.lang = 'zh-CN';
        // Precise lyrical reading tempo (slower pacing makes character boundaries feel like a stately, crisp ancient classroom recitation)
        utterance.rate = 0.58; 
      } else {
        const voices = window.speechSynthesis.getVoices();
        const normalizeLang = (lang: string) => lang.toLowerCase().replace('_', '-');
        const englishVoice = voices.find(v => {
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
            name.includes('david')
          );
        }) || voices.find(v => normalizeLang(v.lang).startsWith('en-us'))
          || voices.find(v => normalizeLang(v.lang).startsWith('en'));
          
        if (englishVoice) {
          utterance.voice = englishVoice;
          utterance.lang = englishVoice.lang;
        } else {
          utterance.lang = 'en-US';
        }
        utterance.rate = rateMultiplier / 1.5; // Slowed down by 1.5x
      }
      window.speechSynthesis.speak(utterance);
    };

    // For single word items, Youdao's premium pre-recorded human speech is magnificent.
    // For full rhythmic classics (Sanzijing lines of length >= 3), we use native SpeechSynthesis 
    // to unlock exact, grain-level pronunciation character boundaries for our triplet drumroll hits!
    const isSanzijingOrPhrase = cleanWord.length >= 3 && (isChinese || cleanWord.includes(' '));

    if (!isPhonicSegmentSound && (cleanWord.length > 1 || isChinese) && !isSanzijingOrPhrase) {
      isBypassed: {
        try {
          // Play Youdao Premium Human TTS
          const audioUrl = isChinese 
            ? `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(cleanWord)}&le=zh`
            : `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(cleanWord)}&type=2`; // type=2 is US Accent
          
          const aud = new Audio(audioUrl);
          aud.defaultPlaybackRate = 0.67; // set playback rate to 1.5 times slower (1 / 1.5 ≈ 0.67) Before loading
          aud.playbackRate = 0.67;
          activeWordAudio = aud;
          aud.volume = 0.95;

          aud.play().catch(() => {
            // Autoplay restriction fallback to synthesis
            if (activeWordAudio === aud) activeWordAudio = null;
            speakSynth(cleanWord, isChinese);
          });
        } catch (e) {
          speakSynth(cleanWord, isChinese);
        }
      }
    } else {
      speakSynth(cleanWord, isChinese);
    }
  }
};

export default audio;
