
let currentBgm: HTMLAudioElement | null = null;
let activeUtterances: SpeechSynthesisUtterance[] = [];
let activeWordAudio: HTMLAudioElement | null = null;

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
  playBGM: (_type: 'HOME' | 'ADVENTURE' | 'ARCADE' | 'SHOP' | 'GAME') => {
    // BGM removed per user request
  },
  stopBGM: () => {
    if (currentBgm) {
      currentBgm.pause();
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
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2572/2572-preview.mp3');
    audio.volume = 0.2;
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
  playEquip: () => {
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3');
    audio.volume = 0.3;
    audio.play().catch(() => {});
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
  speak: (text: string) => {
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

      if (isZh) {
        utterance.lang = 'zh-CN';
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
        utterance.rate = rateMultiplier;
      }
      window.speechSynthesis.speak(utterance);
    };

    // If it's a real word or translation phrase, play the Youdao audio (guaranteed to bypass lock/iframe limits with beautiful, human speech)
    if (!isPhonicSegmentSound && (cleanWord.length > 1 || isChinese)) {
      isBypassed: {
        try {
          // Play Youdao Premium Human TTS
          const audioUrl = isChinese 
            ? `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(cleanWord)}&le=zh`
            : `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(cleanWord)}&type=2`; // type=2 is US Accent
          
          const aud = new Audio(audioUrl);
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
