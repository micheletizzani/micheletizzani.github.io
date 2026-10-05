// Speech + sound cues. Everything is created lazily, only after a user gesture, and the game plays sound
// only in response to what the player does (a click on Listen, a word chip, a correct answer).
// The one exception is the optional guide-ping, which is off by default.

let ctx: AudioContext | null = null;
let muted = false;
let pingsOn = false;

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
export const setPingsEnabled = (value: boolean) => {
  pingsOn = value;
};

export interface SpeakOptions {
  /** BCP-47 tag of the voice to use, e.g. "da-DK". */
  lang: string;
  rate?: number;
}

/** Speak written text with a voice for `lang`. For an invented language the nearest real voice reads it as syllables. */
export function speakText(text: string, { lang, rate = 0.75 }: SpeakOptions) {
  if (muted || typeof window === "undefined" || !window.speechSynthesis) return;
  const synth = window.speechSynthesis;
  synth.cancel();
  const utterance = new SpeechSynthesisUtterance(text.replace(/[·…]/g, ",").replace(/-/g, ""));
  utterance.lang = lang;
  const prefix = lang.toLowerCase().split("-")[0];
  const voice =
    synth.getVoices().find((item) => item.lang.toLowerCase() === lang.toLowerCase()) ??
    synth.getVoices().find((item) => item.lang.toLowerCase().startsWith(prefix));
  if (voice) utterance.voice = voice;
  utterance.rate = rate;
  utterance.pitch = 0.95;
  synth.speak(utterance);
}

/** Short soft tone. `pan` in [-1, 1] (left to right), `gain` in [0, 1]. */
export function ping(pan: number, gain: number, freq = 660, force = false) {
  const audio = audioContext();
  if (!audio || muted || (!pingsOn && !force)) return;
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

/** Confirmation chime for a correct answer. */
export function chime() {
  ping(0, 1, 523, true);
  window.setTimeout(() => ping(0, 1, 784, true), 140);
}

export const unlockAudio = () => {
  audioContext();
  // Some browsers only populate voices after the first call.
  if (typeof window !== "undefined") window.speechSynthesis?.getVoices();
};
