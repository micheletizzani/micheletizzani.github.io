export function createAudioEngine() {
  let ctx = null;
  let masterGain = null;
  let oscillators = [];
  let isPlaying = false;

  // Base frequencies for consonant chord
  const baseFrequencies = [
    220.0, // A3
    330.0, // E4 (perfect fifth)
    440.0, // A4 (octave)
    550.0, // C#5 (major third)
    660.0  // E5
  ];

  async function init() {
    if (ctx) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    ctx = new AudioContext();
    
    masterGain = ctx.createGain();
    masterGain.gain.value = 0; // start muted
    masterGain.connect(ctx.destination);

    baseFrequencies.forEach(freq => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.value = freq;
      
      gain.gain.value = 0.1; // soft volume
      
      osc.connect(gain);
      gain.connect(masterGain);
      
      osc.start();
      oscillators.push({ osc, gain, baseFreq: freq });
    });
  }

  function start() {
    if (!ctx) return;
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    masterGain.gain.setTargetAtTime(1.0, ctx.currentTime, 0.5);
    isPlaying = true;
  }

  function stop() {
    if (!ctx || !isPlaying) return;
    masterGain.gain.setTargetAtTime(0.0, ctx.currentTime, 0.5);
    isPlaying = false;
  }

  function update({ controversy, stanceMix }) {
    if (!ctx || !isPlaying) return;
    
    const maxDetune = 200; // 2 semitones
    
    oscillators.forEach((o, i) => {
      const sign = i % 2 === 0 ? 1 : -1;
      const detuneAmount = sign * controversy * maxDetune * (i + 1) / oscillators.length;
      
      o.osc.detune.setTargetAtTime(detuneAmount, ctx.currentTime, 0.1);
      
      if (stanceMix && stanceMix.length === oscillators.length) {
        const targetVolume = (stanceMix[i] || 0) * 0.2;
        o.gain.gain.setTargetAtTime(targetVolume + 0.01, ctx.currentTime, 0.1); 
      }
    });
  }

  async function dispose() {
    if (!ctx) return;
    masterGain.gain.setTargetAtTime(0.0, ctx.currentTime, 0.1);
    
    return new Promise(resolve => {
      setTimeout(async () => {
        oscillators.forEach(o => {
          try { o.osc.stop(); } catch (e) {}
          o.osc.disconnect();
          o.gain.disconnect();
        });
        oscillators = [];
        masterGain.disconnect();
        if (ctx.state !== 'closed') {
            await ctx.close();
        }
        ctx = null;
        resolve();
      }, 150);
    });
  }

  return { init, start, stop, update, dispose, isPlaying: () => isPlaying };
}
