
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
    const loopStep = step % 3; // Align with the 3 characters of Three Character Classic!

    // Helper to generate closed hi-hat on-the-fly (次)
    const playHihatNode = (timeOffset: number, volMultiplier: number = 1.0) => {
      try {
        const hTime = now + timeOffset;
        const bufferSize = ctx.sampleRate * 0.022;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(10500, hTime);

        const gainNode = ctx.createGain();
        gainNode.gain.setValueAtTime(0.58 * volMultiplier, hTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, hTime + 0.02);

        noise.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(ctx.destination);

        noise.start(hTime);
        noise.stop(hTime + 0.025);
      } catch (e) {}
    };

    if (loopStep === 0) {
      // Step 1: "动" - Booming 808-style Rap Sub Kick + Heavy Sub-bass progression!
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.18);
      
      gainNode.gain.setValueAtTime(1.25, now); // Thumping dynamic volume
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.19);
      
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      osc.start(now);
      osc.stop(now + 0.20);

      // Beater click to make the kick cut cleanly on mobile speakers
      const clickOsc = ctx.createOscillator();
      const clickGain = ctx.createGain();
      clickOsc.type = 'triangle';
      clickOsc.frequency.setValueAtTime(2800, now);
      clickOsc.frequency.exponentialRampToValueAtTime(110, now + 0.022);
      clickGain.gain.setValueAtTime(0.38, now);
      clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.022);
      clickOsc.connect(clickGain);
      clickGain.connect(ctx.destination);
      clickOsc.start(now);
      clickOsc.stop(now + 0.025);

      // Smooth, warm sliding 808 sub-bass to follow a lovely rap chord root cycle (F -> Bb -> Eb -> Db)
      const bassRoots = [87.31, 116.54, 77.78, 69.30];
      const bassIndex = Math.floor(step / 3) % 4;
      let targetFreq = bassRoots[bassIndex];
      while (targetFreq > 72) {
        targetFreq /= 2;
      }

      const bassOsc = ctx.createOscillator();
      const bassGain = ctx.createGain();
      bassOsc.type = 'sine';
      bassOsc.frequency.setValueAtTime(targetFreq, now);
      bassOsc.frequency.exponentialRampToValueAtTime(targetFreq * 0.90, now + 0.35); // gliding slide down

      bassGain.gain.setValueAtTime(0.48, now);
      bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      bassOsc.connect(bassGain);
      bassGain.connect(ctx.destination);
      bassOsc.start(now);
      bassOsc.stop(now + 0.36);

      // Crisp background open hi-hat splash or warm vinyl crackle
      playHihatNode(0, 0.4);

    } else if (loopStep === 1) {
      // Step 2: "次" - Trap doublet hi-hat roll (ch-ch) for extreme hip-hop pace!
      playHihatNode(0, 1.2); 
      playHihatNode(0.07, 0.8); // Doublet tick separated by 70ms

      // Soft vinyl crackle mic pop to enrich acoustic atmosphere
      try {
        const popOsc = ctx.createOscillator();
        const popGain = ctx.createGain();
        popOsc.type = 'triangle';
        popOsc.frequency.setValueAtTime(2500 + Math.random() * 500, now);
        popGain.gain.setValueAtTime(0.05, now);
        popGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.005);
        popOsc.connect(popGain);
        popGain.connect(ctx.destination);
        popOsc.start(now);
        popOsc.stop(now + 0.006);
      } catch (e) {}

    } else {
      // Step 3: "打" - Staggered Trap Clap + Snare hybrid for a fat backbeat impact!
      // 1. Snare core body (triangle wave)
      const bodyOsc = ctx.createOscillator();
      const bodyGain = ctx.createGain();
      bodyOsc.type = 'triangle';
      bodyOsc.frequency.setValueAtTime(210, now);
      bodyOsc.frequency.exponentialRampToValueAtTime(105, now + 0.12);
      bodyGain.gain.setValueAtTime(0.85, now); 
      bodyGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      
      bodyOsc.connect(bodyGain);
      bodyGain.connect(ctx.destination);
      
      bodyOsc.start(now);
      bodyOsc.stop(now + 0.13);

      // 2. Pre-clap micro delay for the ultimate "staggered fat click" clap signature
      try {
        const pBufferSize = ctx.sampleRate * 0.05;
        const pBuffer = ctx.createBuffer(1, pBufferSize, ctx.sampleRate);
        const pData = pBuffer.getChannelData(0);
        for (let i = 0; i < pBufferSize; i++) { pData[i] = Math.random() * 2 - 1; }
        
        const pNoise = ctx.createBufferSource();
        pNoise.buffer = pBuffer;
        const pFilter = ctx.createBiquadFilter();
        pFilter.type = 'bandpass';
        pFilter.frequency.setValueAtTime(1800, now);
        
        const pGain = ctx.createGain();
        pGain.gain.setValueAtTime(0.45, now);
        pGain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);
        
        pNoise.connect(pFilter);
        pFilter.connect(pGain);
        pGain.connect(ctx.destination);
        pNoise.start(now);
        pNoise.stop(now + 0.025);
      } catch (e) {}

      // 3. Main white-noise snare crack
      const bufferSize = ctx.sampleRate * 0.15;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1600, now); 
      filter.Q.setValueAtTime(2.0, now);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(1.25, now); // Strong, explosive crack!
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12); 

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(ctx.destination);

      noise.start(now);
      noise.stop(now + 0.13);

      // Play soft offbeat hihat tail
      playHihatNode(0.18, 0.65);
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

      const bpm = 92;
      const stepTime = 60 / bpm / 2; // eighth notes (0.326s per step)
      let nextNoteTime = ctx.currentTime;
      synthBgmStep = 0;

      const triggerKick = (time: number) => {
        try {
          const osc = ctx.createOscillator();
          const gainNode = ctx.createGain();
          
          osc.type = 'sine';
          // Deep, booming 808-style rap kick sweep
          osc.frequency.setValueAtTime(145, time);
          osc.frequency.exponentialRampToValueAtTime(42, time + 0.18);

          // Full punchy presence matching the human vocal level
          gainNode.gain.setValueAtTime(1.15, time);
          gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.18);

          osc.connect(gainNode);
          gainNode.connect(ctx.destination);

          osc.start(time);
          osc.stop(time + 0.20);

          // Beater click layer to cut cleanly through phone/laptop speakers
          const clickOsc = ctx.createOscillator();
          const clickGain = ctx.createGain();
          clickOsc.type = 'triangle';
          clickOsc.frequency.setValueAtTime(2400, time);
          clickOsc.frequency.exponentialRampToValueAtTime(120, time + 0.022);

          clickGain.gain.setValueAtTime(0.42, time);
          clickGain.gain.exponentialRampToValueAtTime(0.001, time + 0.022);

          clickOsc.connect(clickGain);
          clickGain.connect(ctx.destination);

          clickOsc.start(time);
          clickOsc.stop(time + 0.025);
        } catch (e) {}
      };

      const triggerSnap = (time: number) => {
        try {
          // Sharp cracking Hip-hop snare/clap layer (White Noise)
          const bufferSize = ctx.sampleRate * 0.16;
          const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
          const data = buffer.getChannelData(0);
          for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
          }

          const noise = ctx.createBufferSource();
          noise.buffer = buffer;

          const filter = ctx.createBiquadFilter();
          filter.type = 'bandpass';
          filter.frequency.setValueAtTime(1400, time);
          filter.Q.setValueAtTime(2.0, time);

          const noiseGain = ctx.createGain();
          // Full crisp volume impact for that classic rap backbone
          noiseGain.gain.setValueAtTime(1.20, time);
          noiseGain.gain.exponentialRampToValueAtTime(0.001, time + 0.12);

          noise.connect(filter);
          filter.connect(noiseGain);
          noiseGain.connect(ctx.destination);

          noise.start(time);
          noise.stop(time + 0.13);

          // Woody snappy body to emulate a high-end rimshot/snare cross-stick
          const bodyOsc = ctx.createOscillator();
          const bodyGain = ctx.createGain();
          bodyOsc.type = 'triangle';
          bodyOsc.frequency.setValueAtTime(210, time);
          bodyOsc.frequency.exponentialRampToValueAtTime(105, time + 0.10);
          
          bodyGain.gain.setValueAtTime(0.78, time);
          bodyGain.gain.exponentialRampToValueAtTime(0.001, time + 0.10);

          bodyOsc.connect(bodyGain);
          bodyGain.connect(ctx.destination);

          bodyOsc.start(time);
          bodyOsc.stop(time + 0.11);
        } catch (e) {}
      };

      const triggerHihat = (time: number, accent: boolean = false, volumeMultiplier: number = 1.0) => {
        try {
          const bufferSize = ctx.sampleRate * 0.022;
          const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
          const data = buffer.getChannelData(0);
          for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
          }

          const noise = ctx.createBufferSource();
          noise.buffer = buffer;

          const filter = ctx.createBiquadFilter();
          filter.type = 'highpass';
          filter.frequency.setValueAtTime(accent ? 11000 : 9000, time);

          const gainNode = ctx.createGain();
          // High-frequency trap hi-hat tick volume
          gainNode.gain.setValueAtTime((accent ? 0.44 : 0.26) * volumeMultiplier, time);
          gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.02);

          noise.connect(filter);
          filter.connect(gainNode);
          gainNode.connect(ctx.destination);

          noise.start(time);
          noise.stop(time + 0.025);
        } catch (e) {}
      };

      const triggerOpenHihat = (time: number) => {
        try {
          const bufferSize = ctx.sampleRate * 0.16;
          const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
          const data = buffer.getChannelData(0);
          for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
          }

          const noise = ctx.createBufferSource();
          noise.buffer = buffer;

          const filter = ctx.createBiquadFilter();
          filter.type = 'highpass';
          filter.frequency.setValueAtTime(7500, time);

          const gainNode = ctx.createGain();
          // Spacious open hat offbeat splash
          gainNode.gain.setValueAtTime(0.18, time);
          gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.13);

          noise.connect(filter);
          filter.connect(gainNode);
          gainNode.connect(ctx.destination);

          noise.start(time);
          noise.stop(time + 0.15);
        } catch (e) {}
      };

      const triggerMelodyPluck = (freq: number, time: number, vol: number = 0.18) => {
        try {
          const osc = ctx.createOscillator();
          const gainNode = ctx.createGain();
          
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, time);
          // Rhythmic pluck pitch glide
          osc.frequency.exponentialRampToValueAtTime(freq * 0.98, time + 0.15);

          gainNode.gain.setValueAtTime(vol, time);
          gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.35);

          const filter = ctx.createBiquadFilter();
          filter.type = 'bandpass';
          filter.frequency.setValueAtTime(1800, time);
          filter.Q.setValueAtTime(1.0, time);

          osc.connect(filter);
          filter.connect(gainNode);
          gainNode.connect(ctx.destination);

          osc.start(time);
          osc.stop(time + 0.40);

          // Crystalline high-end chime bell harmonic layer
          const bellOsc = ctx.createOscillator();
          const bellGain = ctx.createGain();
          bellOsc.type = 'sine';
          bellOsc.frequency.setValueAtTime(freq * 3.0, time); // 3rd overtone chordal shimmer

          bellGain.gain.setValueAtTime(vol * 0.45, time);
          bellGain.gain.exponentialRampToValueAtTime(0.001, time + 0.22);

          bellOsc.connect(bellGain);
          bellGain.connect(ctx.destination);

          bellOsc.start(time);
          bellOsc.stop(time + 0.25);
        } catch (e) {}
      };

      const triggerScratchFX = (time: number, isPitchUp: boolean = true) => {
        try {
          const bufferSize = ctx.sampleRate * 0.11;
          const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
          const data = buffer.getChannelData(0);
          for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
          }

          const noise = ctx.createBufferSource();
          noise.buffer = buffer;

          const filter = ctx.createBiquadFilter();
          filter.type = 'bandpass';
          filter.frequency.setValueAtTime(isPitchUp ? 750 : 1800, time);
          filter.frequency.exponentialRampToValueAtTime(isPitchUp ? 2400 : 550, time + 0.10);
          filter.Q.setValueAtTime(3.8, time);

          const gainNode = ctx.createGain();
          gainNode.gain.setValueAtTime(0.13, time);
          gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.10);

          noise.connect(filter);
          filter.connect(gainNode);
          gainNode.connect(ctx.destination);

          noise.start(time);
          noise.stop(time + 0.11);
        } catch (e) {}
      };

      const triggerVinylCrackle = (time: number) => {
        try {
          // Micro-pop to emulate real vinyl record warmth
          const osc = ctx.createOscillator();
          const gainNode = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(2800 + Math.random() * 800, time);
          gainNode.gain.setValueAtTime(0.04, time);
          gainNode.gain.exponentialRampToValueAtTime(0.0001, time + 0.006);

          osc.connect(gainNode);
          gainNode.connect(ctx.destination);

          osc.start(time);
          osc.stop(time + 0.008);
        } catch (e) {}
      };

      const triggerBassTarget = (rootFreq: number, time: number, dur: number = 0.5) => {
        try {
          const osc = ctx.createOscillator();
          const gainNode = ctx.createGain();
          
          osc.type = 'sine'; // Super clean, room-shaking 808 fundamental sub pitch
          
          let subFreq = rootFreq;
          while (subFreq > 80) {
            subFreq /= 2;
          }
          
          osc.frequency.setValueAtTime(subFreq, time);
          // Gliding pitch slide mimicking sliding 808s in modern rap music
          osc.frequency.exponentialRampToValueAtTime(subFreq * 0.88, time + dur);
          
          gainNode.gain.setValueAtTime(0.48, time); // High rumble presence
          gainNode.gain.exponentialRampToValueAtTime(0.001, time + dur - 0.02);
          
          osc.connect(gainNode);
          gainNode.connect(ctx.destination);
          
          osc.start(time);
          osc.stop(time + dur);

          // Harmonic saturation layer (triangle wave at 2x freq to be heard on phones/small speakers)
          const midOsc = ctx.createOscillator();
          const midGain = ctx.createGain();
          const midFilter = ctx.createBiquadFilter();
          
          midOsc.type = 'triangle';
          midOsc.frequency.setValueAtTime(subFreq * 2.0, time);
          midOsc.frequency.exponentialRampToValueAtTime(subFreq * 2.0 * 0.88, time + dur);
          
          midFilter.type = 'lowpass';
          midFilter.frequency.setValueAtTime(180, time);
          
          midGain.gain.setValueAtTime(0.18, time);
          midGain.gain.exponentialRampToValueAtTime(0.001, time + dur - 0.02);
          
          midOsc.connect(midFilter);
          midFilter.connect(midGain);
          midGain.connect(ctx.destination);
          
          midOsc.start(time);
          midOsc.stop(time + dur);
        } catch (e) {}
      };

      const playRhodesChord = (frequencies: number[], time: number) => {
        try {
          const filterNode = ctx.createBiquadFilter();
          filterNode.type = 'lowpass';
          filterNode.frequency.setValueAtTime(800, time); // Cozy warmth
          filterNode.Q.setValueAtTime(1.0, time);

          // Tremolo effect for neo-soul/lo-fi rap chord vibe
          const lfo = ctx.createOscillator();
          const lfoGain = ctx.createGain();
          lfo.type = 'sine';
          lfo.frequency.setValueAtTime(4.8, time);
          lfoGain.gain.setValueAtTime(0.15, time);

          const masterChordGain = ctx.createGain();
          masterChordGain.gain.setValueAtTime(0.12, time);

          lfo.connect(lfoGain);
          lfoGain.connect(masterChordGain.gain);

          filterNode.connect(masterChordGain);
          masterChordGain.connect(ctx.destination);

          lfo.start(time);
          lfo.stop(time + 2.5);

          frequencies.forEach(freq => {
            const osc = ctx.createOscillator();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, time);
            osc.detune.setValueAtTime(Math.random() * 8 - 4, time);

            const oscGain = ctx.createGain();
            oscGain.gain.setValueAtTime(0, time);
            oscGain.gain.linearRampToValueAtTime(0.12, time + 0.05); // Rapid slick swell
            oscGain.gain.exponentialRampToValueAtTime(0.001, time + 2.1);

            osc.connect(oscGain);
            oscGain.connect(filterNode);

            osc.start(time);
            osc.stop(time + 2.2);
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

      // Beautiful synco-pentatonic chime bell pitch maps aligned with each chord
      const MELODY_MAP = [
        [523.25, 622.25], // Fm9 (C5, Eb5)
        [349.22, 415.30], // Bbm9 (F4, Ab4)
        [466.16, 587.33], // Ebmaj9 (Bb4, D5)
        [415.30, 523.25]  // Dbmaj9 (Ab4, C5)
      ];

      const scheduleNextBeats = () => {
        if (!activeAudioCtx || activeAudioCtx.state === 'closed') return;

        while (nextNoteTime < ctx.currentTime + 0.1) {
          const currentStepLocal = synthBgmStep;
          const tickIndex = currentStepLocal % 8;
          const measureIndex = Math.floor(currentStepLocal / 8) % 4;

          // 1. Trap-Style Hi-Hat Rolls & Patterns (Dynamic Triplets and Doublets for Rap texture!)
          // - We implement a sixteenth note doublet roll on tick indices 3 and 7.
          // - We implement a rapid triplet roll on tick index 7 of the fourth measure.
          if (measureIndex === 3 && tickIndex === 7) {
            // Trap Triplet Roll (takes place over the 8th note duration)
            triggerHihat(nextNoteTime, true, 1.1);
            triggerHihat(nextNoteTime + stepTime / 3, false, 0.85);
            triggerHihat(nextNoteTime + (2 * stepTime) / 3, false, 0.85);
          } else if (tickIndex === 3 || tickIndex === 5) {
            // Trap Doublet Roll (two 16th notes)
            triggerHihat(nextNoteTime, true, 1.0);
            triggerHihat(nextNoteTime + stepTime / 2, false, 0.75);
          } else {
            // Standard crisp 8th notes
            triggerHihat(nextNoteTime, tickIndex % 2 === 0, 1.0);
          }

          // Offbeat Open Hihat splash exactly on the backbeat off-side (tick index 4)
          if (tickIndex === 4) {
            triggerOpenHihat(nextNoteTime);
          }

          // 2. Heavy Syncopated Rap Boom-Bap Kick syncopations
          // - Standard heavy boom on tick 0
          // - Syncopated bounce syncopation picks on tick 3 and tick 5 for the trap feel
          // - Additional pickup kick on tick 6 in the alternate measures
          const shouldPlayKick = (tickIndex === 0) || 
                                 (tickIndex === 3) || 
                                 (tickIndex === 5) || 
                                 (measureIndex % 2 === 0 && tickIndex === 4);
          if (shouldPlayKick) {
            triggerKick(nextNoteTime);
          }

          // 3. Crisp Snare Backbeats on counts 2 and 6
          if (tickIndex === 2 || tickIndex === 6) {
            triggerSnap(nextNoteTime);
          }

          // 4. Warm background Rhodes electric keyboard chord progression on downbeats (tick 0)
          if (tickIndex === 0) {
            playRhodesChord(CHORDS_MAP[measureIndex], nextNoteTime);
          }

          // 5. Thumping gliding 808 sub-bass following the kick drum pattern securely (ticks 0, 3, 5)
          if (tickIndex === 0 || tickIndex === 3 || tickIndex === 5) {
            const chordNotes = CHORDS_MAP[measureIndex];
            const rootFrequency = chordNotes[0];
            const bassDuration = (tickIndex === 3 || tickIndex === 5) ? 0.22 : 0.42;
            triggerBassTarget(rootFrequency, nextNoteTime, bassDuration);
          }

          // 6. Pentatonic high bell counter melodies (ticks 2 and 5)
          if (tickIndex === 2) {
            triggerMelodyPluck(MELODY_MAP[measureIndex][0], nextNoteTime, 0.16);
          } else if (tickIndex === 5) {
            triggerMelodyPluck(MELODY_MAP[measureIndex][1], nextNoteTime, 0.16);
          }

          // 7. Transition Fill (Vinyl Scratch FX on step 7 of alternating measures)
          if (tickIndex === 7 && (measureIndex === 1 || measureIndex === 3)) {
            triggerScratchFX(nextNoteTime, measureIndex === 3);
          }

          // 8. Physical warm vinyl record hum & pop on the downbeat
          if (tickIndex === 0) {
            triggerVinylCrackle(nextNoteTime);
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
  playPetFeed: () => {
    if (typeof window === 'undefined') return;
    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtxClass) return;
      const ctx = new AudioCtxClass();
      const now = ctx.currentTime;
      
      const playBite = (timeOffset: number) => {
        const t = now + timeOffset;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(320, t);
        osc.frequency.exponentialRampToValueAtTime(80, t + 0.08);
        
        gain.gain.setValueAtTime(0.25, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.08);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.09);
        
        // Add a high frequency crunch burst
        const bufferSize = ctx.sampleRate * 0.04;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(0.08, t);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
        noise.connect(noiseGain);
        noiseGain.connect(ctx.destination);
        noise.start(t);
        noise.stop(t + 0.05);
      };
      
      playBite(0);
      playBite(0.12);
      playBite(0.24);
    } catch (e) {
      console.warn('[AudioUtils] playPetFeed error:', e);
    }
  },
  playPetStroke: () => {
    if (typeof window === 'undefined') return;
    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtxClass) return;
      const ctx = new AudioCtxClass();
      const now = ctx.currentTime;
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.linearRampToValueAtTime(190, now + 0.08);
      osc.frequency.linearRampToValueAtTime(150, now + 0.16);
      
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.type = 'sine';
      lfo.frequency.setValueAtTime(18, now);
      lfoGain.gain.setValueAtTime(15, now);
      
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.25, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      lfo.start(now);
      osc.start(now);
      
      lfo.stop(now + 0.24);
      osc.stop(now + 0.24);
    } catch (e) {
      console.warn('[AudioUtils] playPetStroke error:', e);
    }
  },
  playCelestialMagic: () => {
    if (typeof window === 'undefined') return;
    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtxClass) return;
      const ctx = new AudioCtxClass();
      const now = ctx.currentTime;
      
      const notes = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50];
      notes.forEach((freq, index) => {
        const time = now + index * 0.07;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, time);
        osc.detune.setValueAtTime(4, time);
        
        gain.gain.setValueAtTime(0, time);
        gain.gain.linearRampToValueAtTime(0.15, time + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.38);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start(time);
        osc.stop(time + 0.42);
      });
    } catch (e) {
      console.warn('[AudioUtils] playCelestialMagic error:', e);
    }
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
      
      // Duck background music volume dramatically to boost voice volume relatively by 30%+
      const originalBgmVolume = currentBgm ? currentBgm.volume : 0.08;
      if (currentBgm) {
        currentBgm.volume = 0.02; 
      }

      const cleanup = () => {
        activeUtterances = activeUtterances.filter(u => u !== utterance);
        if (currentBgm) {
          currentBgm.volume = originalBgmVolume; // Restore BGM volume
        }
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

      // Set full output volume for maximum audibility
      utterance.volume = 1.0;

      if (isZh) {
        utterance.lang = 'zh-CN';
        // Natural human recitation tempo & original smooth pitch curve (removing mechanical pitch bends)
        utterance.rate = 0.88; 
        utterance.pitch = 1.0;
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
        // Removed the slow-down divisor (1.5x) to prevent mechanical audio fragmentation stutter
        utterance.rate = rateMultiplier; 
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
          aud.volume = 1.0; // Boosted volume

          // Duck background music volume during word narration to increase perceived speech volume relatively
          const originalBgmVolume = currentBgm ? currentBgm.volume : 0.08;
          if (currentBgm) {
            currentBgm.volume = 0.02;
          }

          const restoreBgm = () => {
            if (currentBgm) currentBgm.volume = originalBgmVolume;
          };

          aud.onended = restoreBgm;
          aud.onerror = restoreBgm;

          aud.play().catch(() => {
            // Autoplay restriction fallback to synthesis
            if (activeWordAudio === aud) activeWordAudio = null;
            restoreBgm();
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
