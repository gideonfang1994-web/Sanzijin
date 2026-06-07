
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

let synthBgmIntervalId: any = null;
let synthBgmStep = 0;

export const drumController = {
  start: () => {
    if (typeof window === 'undefined') return;
    if (synthBgmIntervalId) return;

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

      const bpm = 90;
      const stepTime = 60 / bpm / 2; // eighth notes (0.3333s per step)
      let nextNoteTime = ctx.currentTime;
      synthBgmStep = 0;

      const triggerKick = (time: number) => {
        try {
          const osc = ctx.createOscillator();
          const gainNode = ctx.createGain();
          osc.connect(gainNode);
          gainNode.connect(ctx.destination);

          // Deep, elastic sub kick sweep
          osc.frequency.setValueAtTime(130, time);
          osc.frequency.exponentialRampToValueAtTime(45, time + 0.12);

          // Balanced, powerful but non-intrusive envelope
          gainNode.gain.setValueAtTime(0.22, time);
          gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.12);

          osc.start(time);
          osc.stop(time + 0.14);
        } catch (e) {}
      };

      const triggerSnap = (time: number) => {
        try {
          // 1. Crisp clean physical finger snap high pass noise burst
          const bufferSize = ctx.sampleRate * 0.08;
          const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
          const data = buffer.getChannelData(0);
          for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
          }

          const noise = ctx.createBufferSource();
          noise.buffer = buffer;

          const filter = ctx.createBiquadFilter();
          filter.type = 'bandpass';
          filter.frequency.setValueAtTime(1400, time); // crisp mid-high focus
          filter.Q.setValueAtTime(4.5, time); // resonant hollow knock

          const gainNode = ctx.createGain();
          gainNode.gain.setValueAtTime(0.20, time);
          gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.06);

          noise.connect(filter);
          filter.connect(gainNode);
          gainNode.connect(ctx.destination);

          noise.start(time);
          noise.stop(time + 0.07);

          // 2. High-frequency click accentuator transient (triangle wave)
          const clickOsc = ctx.createOscillator();
          const clickGain = ctx.createGain();
          clickOsc.type = 'triangle';
          clickOsc.frequency.setValueAtTime(1550, time);

          clickGain.gain.setValueAtTime(0.09, time);
          clickGain.gain.exponentialRampToValueAtTime(0.001, time + 0.015);

          clickOsc.connect(clickGain);
          clickGain.connect(ctx.destination);

          clickOsc.start(time);
          clickOsc.stop(time + 0.02);
        } catch (e) {}
      };

      const triggerHihat = (time: number) => {
        try {
          const bufferSize = ctx.sampleRate * 0.025;
          const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
          const data = buffer.getChannelData(0);
          for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
          }

          const noise = ctx.createBufferSource();
          noise.buffer = buffer;

          const filter = ctx.createBiquadFilter();
          filter.type = 'highpass';
          filter.frequency.setValueAtTime(8000, time); // High-frequency wash

          const gainNode = ctx.createGain();
          gainNode.gain.setValueAtTime(0.014, time); // Extremely quiet ticks to maintain spacious mid-highs
          gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.02);

          noise.connect(filter);
          filter.connect(gainNode);
          gainNode.connect(ctx.destination);

          noise.start(time);
          noise.stop(time + 0.035);
        } catch (e) {}
      };

      const playRhodesChord = (frequencies: number[], time: number) => {
        try {
          const filterNode = ctx.createBiquadFilter();
          filterNode.type = 'lowpass';
          filterNode.frequency.setValueAtTime(850, time); // Strict top-end filter for spacious mix
          filterNode.Q.setValueAtTime(1.1, time);

          // Iconic stereo-tremolo swirling effect (modulating volume at 4.2Hz)
          const lfo = ctx.createOscillator();
          const lfoGain = ctx.createGain();
          lfo.type = 'sine';
          lfo.frequency.setValueAtTime(4.2, time);
          lfoGain.gain.setValueAtTime(0.12, time);

          const masterChordGain = ctx.createGain();
          masterChordGain.gain.setValueAtTime(0.09, time); // Warm background level

          lfo.connect(lfoGain);
          lfoGain.connect(masterChordGain.gain);

          filterNode.connect(masterChordGain);
          masterChordGain.connect(ctx.destination);

          lfo.start(time);
          lfo.stop(time + 2.5);

          frequencies.forEach(freq => {
            const osc = ctx.createOscillator();
            osc.type = 'triangle'; // Mellifluous wood/bell harmonics
            osc.frequency.setValueAtTime(freq, time);
            osc.detune.setValueAtTime(Math.random() * 6 - 3, time);

            const oscGain = ctx.createGain();
            oscGain.gain.setValueAtTime(0, time);
            oscGain.gain.linearRampToValueAtTime(0.12, time + 0.06); // Smooth attack
            oscGain.gain.exponentialRampToValueAtTime(0.001, time + 2.2); // Slow, lush decay

            osc.connect(oscGain);
            oscGain.connect(filterNode);

            osc.start(time);
            osc.stop(time + 2.3);
          });
        } catch (e) {}
      };

      // F minor jazzy chord cycle: Fm9 -> Bbm9 -> Ebmaj9 -> Dbmaj9
      const CHORDS_MAP = [
        [87.31, 196.00, 207.65, 261.63, 311.13],   // Fm9 (F2, G3, Ab3, C4, Eb4)
        [116.54, 138.59, 174.61, 207.65, 261.63], // Bbm9 (Bb2, Db3, F3, Ab3, C4)
        [77.78, 196.00, 233.08, 293.66, 349.23],  // Ebmaj9 (Eb2, G3, Bb3, D4, F4)
        [69.30, 174.61, 207.65, 261.63, 311.13]   // Dbmaj9 (Db2, F3, Ab3, C4, Eb4)
      ];

      const scheduleNextBeats = () => {
        if (!activeAudioCtx || activeAudioCtx.state === 'closed') return;

        while (nextNoteTime < ctx.currentTime + 0.1) {
          const currentStepLocal = synthBgmStep;
          const tickIndex = currentStepLocal % 8;
          const measureIndex = Math.floor(currentStepLocal / 8) % 4;

          // 1. Stable closed hi-hat tick on every eighth note
          triggerHihat(nextNoteTime);

          // 2. Deep bouncy Kick: beat 1 (tick 0), beat 3 (tick 4), beat 3.5 (tick 5) for syncopated rap bounce
          if (tickIndex === 0 || tickIndex === 4 || tickIndex === 5) {
            triggerKick(nextNoteTime);
          }

          // 3. Crisp Snaps / Claps on beat 2 (tick 2) and beat 4 (tick 6)
          if (tickIndex === 2 || tickIndex === 6) {
            triggerSnap(nextNoteTime);
          }

          // 4. Warm Rhodes chord played at Step 0 of every measure
          if (tickIndex === 0) {
            playRhodesChord(CHORDS_MAP[measureIndex], nextNoteTime);
          }

          nextNoteTime += stepTime;
          synthBgmStep = (synthBgmStep + 1) % 32;
        }
      };

      scheduleNextBeats();
      synthBgmIntervalId = setInterval(scheduleNextBeats, 40);
    } catch (e) {
      console.warn('[DrumSynth] Failed starting synthesized accompaniment:', e);
    }
  },
  stop: () => {
    if (synthBgmIntervalId) {
      clearInterval(synthBgmIntervalId);
      synthBgmIntervalId = null;
    }
    synthBgmStep = 0;
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
    try { drumController.stop(); } catch (e) {}

    if (gameId === 'DUBBING' || gameId === 'DJ') {
      try { drumController.start(); } catch (e) {}
      return;
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
      PARROT: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3'
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
    try { drumController.stop(); } catch (e) {}
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
