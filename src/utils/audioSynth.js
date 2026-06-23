// Web Audio API Synthesizer & Speech Synthesis for 5-Year-Olds

let audioCtx = null;
let isMuted = localStorage.getItem('kids_math_muted') === 'true';
let activeWeatherNodes = [];
let activeWeatherGain = null;

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export const audioSynth = {
  getMuteState() {
    return isMuted;
  },

  setMuteState(muted) {
    isMuted = muted;
    localStorage.setItem('kids_math_muted', muted ? 'true' : 'false');
    if (muted) {
      window.speechSynthesis.cancel();
    }
  },

  // Speak text using SpeechSynthesis
  speak(text, lang = 'zh') {
    if (isMuted || !window.speechSynthesis) return;
    
    // Stop any ongoing speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === 'en' ? 'en-US' : 'zh-CN';
    utterance.rate = lang === 'en' ? 0.9 : 0.85; // Slightly slower for kids
    utterance.pitch = 1.3; // Higher pitch for a friendlier voice
    
    window.speechSynthesis.speak(utterance);
  },

  // Soft click
  playClick() {
    if (isMuted) return;
    try {
      const ctx = getAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch (e) {}
  },

  // Single bright 'Ding' for correct
  playCorrect() {
    if (isMuted) return;
    try {
      const ctx = getAudioContext();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine'; // Pure tone for bell
      osc.frequency.setValueAtTime(1200, now); // High pitch C6ish
      
      // Quick attack, long slow decay
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.3, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 1.0);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 1.0);
    } catch (e) {}
  },

  // Distinct buzz/uh-oh for incorrect
  playIncorrect() {
    if (isMuted) return;
    try {
      const ctx = getAudioContext();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth'; // Buzzy sound
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.linearRampToValueAtTime(100, now + 0.3);

      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.4);
    } catch (e) {}
  },

  // Level up sparkles
  playLevelUp() {
    if (isMuted) return;
    try {
      const ctx = getAudioContext();
      const now = ctx.currentTime;
      [392.00, 523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
        const time = now + idx * 0.08;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, time);
        
        gain.gain.setValueAtTime(0, now);
        gain.gain.setValueAtTime(0.08, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.3);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(time);
        osc.stop(time + 0.35);
      });
    } catch (e) {}
  },

  // Cheerful victory sound
  playWin() {
    if (isMuted) return;
    try {
      const ctx = getAudioContext();
      const now = ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const time = now + idx * 0.1;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, time);

        gain.gain.setValueAtTime(0, now);
        gain.gain.setValueAtTime(0.1, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.4);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(time);
        osc.stop(time + 0.45);
      });
    } catch (e) {}
  },

  // Deep rumble for bomb explosion
  playBomb() {
    if (isMuted) return;
    try {
      const ctx = getAudioContext();
      const now = ctx.currentTime;
      
      // Create noise buffer for explosion sound
      const bufferSize = ctx.sampleRate * 0.6; // 0.6 seconds
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      // Filter noise to sound like a deep boom
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, now);
      filter.frequency.exponentialRampToValueAtTime(50, now + 0.5);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(1.0, now); // loud start
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6); // fade out

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start(now);
      noise.stop(now + 0.6);
    } catch (e) {}
  },

  stopWeatherAmbiance() {
    try {
      const ctx = getAudioContext();
      if (activeWeatherGain) {
        activeWeatherGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);
      }
      const nodesToStop = [...activeWeatherNodes];
      activeWeatherNodes = [];
      setTimeout(() => {
        nodesToStop.forEach(n => {
          try { n.stop(); } catch(e) {}
        });
      }, 500);
    } catch(e) {}
  },

  startWeatherAmbiance(type) {
    this.stopWeatherAmbiance();
    if (isMuted || !type) return;
    
    try {
      const ctx = getAudioContext();
      const now = ctx.currentTime;
      activeWeatherGain = ctx.createGain();
      activeWeatherGain.connect(ctx.destination);
      
      if (type === 'rain') {
        const bufferSize = ctx.sampleRate * 2;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
        
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        noise.loop = true;
        
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 1000;
        
        activeWeatherGain.gain.setValueAtTime(0.0, now);
        activeWeatherGain.gain.linearRampToValueAtTime(0.04, now + 1);
        
        noise.connect(filter);
        filter.connect(activeWeatherGain);
        noise.start(now);
        activeWeatherNodes.push(noise);
        
      } else if (type === 'snow') {
        const bufferSize = ctx.sampleRate * 2;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
        
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        noise.loop = true;
        
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 250;
        
        activeWeatherGain.gain.setValueAtTime(0.0, now);
        activeWeatherGain.gain.linearRampToValueAtTime(0.06, now + 2);
        
        noise.connect(filter);
        filter.connect(activeWeatherGain);
        noise.start(now);
        activeWeatherNodes.push(noise);
        
      } else if (type === 'fog') {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = 60;
        
        activeWeatherGain.gain.setValueAtTime(0.0, now);
        activeWeatherGain.gain.linearRampToValueAtTime(0.1, now + 3);
        
        osc.connect(activeWeatherGain);
        osc.start(now);
        activeWeatherNodes.push(osc);
        
      } else if (type === 'sun') {
        const osc = ctx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.value = 3500;
        
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 3500;
        
        activeWeatherGain.gain.setValueAtTime(0.0, now);
        activeWeatherGain.gain.linearRampToValueAtTime(0.01, now + 1);
        
        osc.connect(filter);
        filter.connect(activeWeatherGain);
        osc.start(now);
        activeWeatherNodes.push(osc);
      }
    } catch(e) {}
  }
};
