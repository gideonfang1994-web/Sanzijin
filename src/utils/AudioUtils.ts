
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
  speak: (text: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  }
};

export default audio;
