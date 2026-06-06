
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
    const loopStep = step % 3; // Triplet: 0 (Medium Rim Snare + Kick), 1 (Crisp Snap Rim + Hi-Hat Shaker), 2 (Cinematic Marching Snare + Deep Sub Bass)

    // Helper: Synthesize premium metallic snare rattle using white noise high-pass filters
    const playSnareRattle = (startTime: number, duration: number, gainVal: number, highpassFreq: number) => {
      const bufferSize = ctx.sampleRate * duration;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      
      const noiseNode = ctx.createBufferSource();
      noiseNode.buffer = buffer;
      
      const filterNode = ctx.createBiquadFilter();
      filterNode.type = 'highpass';
      filterNode.frequency.setValueAtTime(highpassFreq, startTime);
      
      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(gainVal, startTime);
      // Clean snare rattle exponential decay over time
      gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
      
      noiseNode.connect(filterNode);
      filterNode.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      noiseNode.start(startTime);
      noiseNode.stop(startTime + duration + 0.01);
    };

    // Helper: Synthesize standard low drum shell resonance (kick or tom drop)
    const playBassKick = (startTime: number, duration: number, startFreq: number, endFreq: number, gainVal: number) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(startFreq, startTime);
      osc.frequency.exponentialRampToValueAtTime(endFreq, startTime + duration);
      
      gainNode.gain.setValueAtTime(gainVal, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
      
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      osc.start(startTime);
      osc.stop(startTime + duration + 0.01);
    };

    // Helper: Synthesize tight high-frequency metallic shaker / tambourine tap
    const playMetallicShaker = (startTime: number, duration: number, frequency: number, gainVal: number) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(frequency, startTime);
      osc.frequency.exponentialRampToValueAtTime(1100, startTime + duration);
      
      gainNode.gain.setValueAtTime(gainVal, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
      
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      osc.start(startTime);
      osc.stop(startTime + duration + 0.01);
    };

    // 1-to-1 marching rhythmic structure for "San Zi Jing"
    if (loopStep === 0) {
      // Step 0: Solid foundation beat ("人")
      // Kick: Deep grounding punch
      playBassKick(now, 0.16, 115, 55, 0.24);
      // Snare drum sound: Tight rim-tick
      playBassKick(now, 0.10, 230, 160, 0.14); // Snare shell body resonance
      playSnareRattle(now, 0.12, 0.18, 1300);   // Snare chains rattle
      // Metallic shaker:
      playMetallicShaker(now, 0.03, 6200, 0.07);

    } else if (loopStep === 1) {
      // Step 1: Upbeat crisp transition swing ("之")
      // Kick: Light tempo-retaining pop
      playBassKick(now, 0.12, 90, 50, 0.07);
      // Snare: Crisp, higher pitch double rimshot
      playBassKick(now, 0.08, 290, 210, 0.16); 
      playSnareRattle(now, 0.08, 0.24, 2100);   // Tighter snare slap rattle
      // High frequency open hat/tambourine splash:
      playMetallicShaker(now, 0.045, 8200, 0.11);

    } else {
      // Step 2: Powerful parade finale blow ("初")
      // Kick: Resonant heavy bass thud for character 3 landing
      playBassKick(now, 0.24, 145, 42, 0.35);
      // Snare: Deep echoing explosive military snare impact
      playBassKick(now, 0.22, 195, 95, 0.26);  // Deep marching shell body
      playSnareRattle(now, 0.25, 0.30, 850);    // Dense, rich snare chains resonance
      // Crisp splash tail:
      playMetallicShaker(now, 0.08, 9200, 0.14);
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
