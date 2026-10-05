// Speech + sound cues. Everything is created lazily, only after a user gesture, and the game plays sound
// only in response to what the player does (a click on Listen, a word chip, a correct answer).
// The one exception is the optional guide-ping, which is off by default.

import { pickVoice, rankVoices, type VoiceStatus } from "./maruVoices";

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

// ---------- voices ----------
const VOICE_KEY = (lang: string) => `language-quest-voice:${lang}`;
type VoiceListener = () => void;
const voiceListeners = new Set<VoiceListener>();
const blockedListeners = new Set<(lang: string) => void>();

const synth = () => (typeof window === "undefined" ? undefined : window.speechSynthesis);
export const voices = (): SpeechSynthesisVoice[] => synth()?.getVoices() ?? [];
export const chosenVoiceName = (lang: string): string | null => {
  try {
    return localStorage.getItem(VOICE_KEY(lang));
  } catch {
    return null;
  }
};
export function chooseVoice(lang: string, name: string | null) {
  try {
    if (name) localStorage.setItem(VOICE_KEY(lang), name);
    else localStorage.removeItem(VOICE_KEY(lang));
  } catch {
    /* choice lasts for this session only */
  }
  voiceListeners.forEach((fn) => fn());
}

/** Voice lists load asynchronously (Chrome returns an empty list at first). Resolves when voices exist or after `ms`. */
export function whenVoicesReady(ms = 2000): Promise<SpeechSynthesisVoice[]> {
  const s = synth();
  if (!s) return Promise.resolve([]);
  if (s.getVoices().length) return Promise.resolve(s.getVoices());
  return new Promise((resolve) => {
    const done = () => {
      s.removeEventListener?.("voiceschanged", done);
      window.clearTimeout(timer);
      voiceListeners.forEach((fn) => fn());
      resolve(s.getVoices());
    };
    const timer = window.setTimeout(done, ms);
    s.addEventListener?.("voiceschanged", done);
  });
}

export interface VoiceReport {
  status: VoiceStatus;
  /** The voice that will be used for this language, if any. */
  voice: SpeechSynthesisVoice | null;
  /** True when the voice was chosen by the player and is not a voice for this language. */
  override: boolean;
  total: number;
}

export function voiceReport(lang: string): VoiceReport {
  if (!synth()) return { status: "unsupported", voice: null, override: false, total: 0 };
  const all = voices();
  const chosen = chosenVoiceName(lang);
  const voice = pickVoice(all, lang, chosen);
  const override =
    !!voice &&
    !!chosen &&
    voice.name === chosen &&
    !rankVoices(all, lang)
      .exact.concat(rankVoices(all, lang).sameLanguage)
      .some((v) => v.name === chosen);
  return { status: all.length === 0 ? "loading" : voice ? "ok" : "missing", voice, override, total: all.length };
}

/** Subscribe to voice-list changes (installation, loading, a new choice). Returns an unsubscribe function. */
export function onVoicesChanged(fn: VoiceListener) {
  voiceListeners.add(fn);
  const s = synth();
  s?.addEventListener?.("voiceschanged", fn);
  return () => {
    voiceListeners.delete(fn);
    s?.removeEventListener?.("voiceschanged", fn);
  };
}
/** Subscribe to "a strict language had no voice, so nothing was spoken". */
export function onSpeechBlocked(fn: (lang: string) => void) {
  blockedListeners.add(fn);
  return () => void blockedListeners.delete(fn);
}

export interface SpeakOptions {
  /** BCP-47 tag of the voice to use, e.g. "da-DK". */
  lang: string;
  rate?: number;
  /**
   * When true and no voice for `lang` is installed, stay silent and report it instead of letting the browser read the
   * text with its default (usually English) voice. Use it for real languages. Invented languages leave it off.
   */
  strict?: boolean;
}

export type SpeakResult = "spoken" | "muted" | "unsupported" | "no-voice";

function speakNow(text: string, { lang, rate = 0.75, strict = false }: SpeakOptions): SpeakResult {
  const s = synth();
  if (!s) return "unsupported";
  const voice = pickVoice(s.getVoices(), lang, chosenVoiceName(lang));
  if (!voice && strict) {
    blockedListeners.forEach((fn) => fn(lang));
    return "no-voice";
  }
  s.cancel();
  const utterance = new SpeechSynthesisUtterance(text.replace(/[·…]/g, ",").replace(/-/g, ""));
  utterance.lang = voice?.lang ?? lang;
  if (voice) utterance.voice = voice;
  utterance.rate = rate;
  s.speak(utterance);
  return "spoken";
}

/**
 * Speak written text. Without a matching voice a strict language is not spoken at all (see `SpeakOptions.strict`);
 * a non-strict one (an invented language) is read by the browser's default voice as syllables.
 */
export function speakText(text: string, options: SpeakOptions): SpeakResult {
  if (muted) return "muted";
  const s = synth();
  if (!s) return "unsupported";
  if (s.getVoices().length === 0) {
    // The list has not loaded yet: wait for it instead of guessing.
    void whenVoicesReady().then(() => speakNow(text, options));
    return "spoken";
  }
  return speakNow(text, options);
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
  void whenVoicesReady();
};
