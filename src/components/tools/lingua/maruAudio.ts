// Speech + spatial cues for Maru. Everything is created lazily so it only starts after a user gesture.

let ctx: AudioContext | null = null;
let muted = false;

const audioContext = () => {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
};

export const setMuted = (value: boolean) => {
  muted = value;
  if (value && typeof window !== "undefined") window.speechSynthesis?.cancel();
};

/** Maru is invented, so no voice knows it. A Danish voice reads the romanisation as pronounced syllables. */
export function speakMaru(text: string, rate = 0.7) {
  if (muted || typeof window === "undefined" || !window.speechSynthesis) return;
  const synth = window.speechSynthesis;
  synth.cancel();
  const clean = text.replace(/[·…]/g, ",").replace(/-/g, "");
  const utterance = new SpeechSynthesisUtterance(clean);
  utterance.lang = "da-DK";
  const voice = synth.getVoices().find((item) => item.lang.toLowerCase().startsWith("da"));
  if (voice) utterance.voice = voice;
  utterance.rate = rate;
  utterance.pitch = 0.95;
  synth.speak(utterance);
}

/** Short soft tone. `pan` in [-1, 1] (left to right), `gain` in [0, 1]. */
export function ping(pan: number, gain: number, freq = 660) {
  const audio = audioContext();
  if (!audio || muted) return;
  const osc = audio.createOscillator();
  const amp = audio.createGain();
  const panner = audio.createStereoPanner?.();
  osc.type = "sine";
  osc.frequency.setValueAtTime(freq, audio.currentTime);
  osc.frequency.exponentialRampToValueAtTime(freq * 1.5, audio.currentTime + 0.18);
  amp.gain.setValueAtTime(0.0001, audio.currentTime);
  amp.gain.exponentialRampToValueAtTime(Math.max(0.0002, gain * 0.16), audio.currentTime + 0.02);
  amp.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + 0.42);
  osc.connect(amp);
  if (panner) {
    panner.pan.value = Math.max(-1, Math.min(1, pan));
    amp.connect(panner).connect(audio.destination);
  } else {
    amp.connect(audio.destination);
  }
  osc.start();
  osc.stop(audio.currentTime + 0.45);
}

/** Confirmation chime for a recorded observation. */
export function chime() {
  ping(0, 1, 523);
  window.setTimeout(() => ping(0, 1, 784), 140);
}

export const unlockAudio = () => {
  audioContext();
  // Some browsers only populate voices after the first call.
  if (typeof window !== "undefined") window.speechSynthesis?.getVoices();
};
