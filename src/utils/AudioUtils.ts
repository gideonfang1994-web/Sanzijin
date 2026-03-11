
export const audio = {
  init: () => {
    // Initialize audio context if needed
  },
  playClick: () => {
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3');
    audio.volume = 0.2;
    audio.play().catch(() => {});
  },
  playSuccess: () => {
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3');
    audio.volume = 0.3;
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
    ];
    const randomCheer = cheers[Math.floor(Math.random() * cheers.length)];
    const audio = new Audio(randomCheer);
    audio.volume = 0.3;
    audio.play().catch(() => {});
  },
  speak: (text: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    
    // Remove content inside brackets/parentheses for cleaner speech
    const speechText = text.replace(/\([^)]*\)/g, '').replace(/（[^）]*）/g, '').replace(/\s+/g, ' ').trim();
    
    const utterance = new SpeechSynthesisUtterance(speechText);
    // Detect if it contains Chinese characters
    const hasChinese = /[\u4e00-\u9fa5]/.test(speechText);
    utterance.lang = hasChinese ? 'zh-CN' : 'en-US';
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  }
};

export default audio;
