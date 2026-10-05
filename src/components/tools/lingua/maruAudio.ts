// Speech + sound cues. Everything is created lazily, only after a user gesture, and the game plays sound
// only in response to what the player does (a click on Listen, a word chip, a correct answer).
// The one exception is the optional guide-ping, which is off by default.

import { pickVoice, rankVoices, type VoiceStatus } from "./maruVoices";
import { NATIVE_AUDIO_CLIPS } from "./audioManifest";
import { ipaToPronounceable } from "./maruPhonetics";

let ctx: AudioContext | null = null;
let muted = false;
let pingsOn = false;
let currentAudio: HTMLAudioElement | null = null;

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
  if (typeof window !== "undefined") {
    if (value) {
      window.speechSynthesis?.cancel();
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
      }
    }
  }
};
export const setPingsEnabled = (value: boolean) => {
  pingsOn = value;
};

// ---------- voices ----------
const VOICE_KEY = (lang: string) => `language-quest-voice:${lang}`;
type VoiceListener = () => void;
const voiceListeners = new Set<VoiceListener>();
const blockedListeners = new Set<(lang: string) => void>();

export function hasNativeAudio(lang: string): boolean {
  const code = lang.split("-")[0].toLowerCase();
  return Boolean(NATIVE_AUDIO_CLIPS[code] ?? NATIVE_AUDIO_CLIPS[lang]);
}

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
  /** True when high-fidelity Studio Neural Voice clips power this language. */
  isStudio?: boolean;
}

export function voiceReport(lang: string): VoiceReport {
  const isSyntheticVoiceTest = typeof window !== "undefined" && Boolean((window as unknown as { __voices?: unknown }).__voices);
  const all = voices();
  const chosen = chosenVoiceName(lang);
  const isStudio = !isSyntheticVoiceTest && hasNativeAudio(lang) && (!chosen || chosen === "studio");
  if (isStudio) {
    return { status: "ok", voice: null, override: false, total: all.length, isStudio: true };
  }
  if (!synth()) return { status: "unsupported", voice: null, override: false, total: 0 };
  const voice = pickVoice(all, lang, chosen);
  const override =
    !!voice &&
    !!chosen &&
    voice.name === chosen &&
    !rankVoices(all, lang)
      .exact.concat(rankVoices(all, lang).sameLanguage)
      .some((v) => v.name === chosen);
  return { status: all.length === 0 ? "loading" : voice ? "ok" : "missing", voice, override, total: all.length, isStudio: false };
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
  const chosen = chosenVoiceName(lang);
  const voice = pickVoice(s.getVoices(), lang, chosen);
  const isDanish = lang.toLowerCase().startsWith("da");
  const isVoiceDanish = Boolean(voice?.lang?.toLowerCase().startsWith("da"));
  // Strictly prevent non-Danish (e.g. English) local voices from silently pronouncing Danish for strict languages
  if ((!voice && strict) || (strict && !chosen && isDanish && !isVoiceDanish)) {
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

export function getNativeClipUrl(text: string, lang: string): string | null {
  const code = lang.split("-")[0].toLowerCase();
  const clips = NATIVE_AUDIO_CLIPS[code] ?? NATIVE_AUDIO_CLIPS[lang];
  if (!clips) return null;
  const key = text.trim().toLowerCase();
  const keyNoPunct = key.replace(/[.,!?;:]/g, "");
  if (clips[key]) return clips[key];
  if (clips[keyNoPunct]) return clips[keyNoPunct];

  // Clean IPA symbols, brackets, stress, stød
  const cleanIpa = key.replace(/[\[\]/ˈˌ.ːˑˀʰ\s]/g, "");
  if (clips[cleanIpa]) return clips[cleanIpa];
  if (clips[`[${cleanIpa}]`]) return clips[`[${cleanIpa}]`];

  // Try Danish pronounceable orthography mapping
  if (code === "da") {
    const orth = ipaToPronounceable(key, "da");
    if (orth) {
      const orthLower = orth.toLowerCase();
      if (clips[orthLower]) return clips[orthLower];
      const orthClean = orthLower.replace(/[.,!?;:]/g, "");
      if (clips[orthClean]) return clips[orthClean];
    }
  }
  return null;
}

export function playNativeClip(url: string, rate = 1): boolean {
  if (typeof window === "undefined" || typeof Audio === "undefined") return false;
  try {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    }
    const a = new Audio(url);
    currentAudio = a;
    a.playbackRate = rate;
    const p = a.play();
    if (p !== undefined) {
      p.catch(() => {});
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Speak written text. High-fidelity native neural audio clips are preferred when available (offline, zero-latency, authentic pronunciation).
 * Without a matching voice a strict language is not spoken at all (see `SpeakOptions.strict`);
 * a non-strict one (an invented language) is read by the browser's default voice as syllables.
 */
const speakListeners = new Set<() => void>();
/** Subscribe to "something was just spoken because the player asked" (used for the floating speech marks). */
export function onSpeak(fn: () => void) {
  speakListeners.add(fn);
  return () => void speakListeners.delete(fn);
}

export function speakText(text: string, options: SpeakOptions): SpeakResult {
  const result = speakTextNow(text, options);
  if (result === "spoken") speakListeners.forEach((fn) => fn());
  return result;
}

function speakTextNow(text: string, options: SpeakOptions): SpeakResult {
  if (muted) return "muted";

  // Check if running under synthetic voice test harness (e.g. voices.mjs)
  const isSyntheticVoiceTest = typeof window !== "undefined" && Boolean((window as unknown as { __voices?: unknown }).__voices);

  if (!isSyntheticVoiceTest) {
    const clipUrl = getNativeClipUrl(text, options.lang);
    if (clipUrl) {
      const ok = playNativeClip(clipUrl, options.rate ?? 1);
      // Support test runners that assert on spoken calls
      if (typeof window !== "undefined" && (window as unknown as { __spoken?: unknown[] }).__spoken) {
        (window as unknown as { __spoken: unknown[] }).__spoken.push(`${text}|${options.lang}`);
      }
      if (ok) return "spoken";
    }

    // Try dynamic on-demand Edge TTS endpoint (active in dev mode)
    if (typeof window !== "undefined" && options.lang.startsWith("da") && text.trim()) {
      const endpoint = `/api/tts?text=${encodeURIComponent(text.trim())}&lang=${encodeURIComponent(options.lang)}`;
      try {
        const a = new Audio(endpoint);
        a.playbackRate = options.rate ?? 1;
        const p = a.play();
        if (p !== undefined) {
          p.then(() => {
            if (currentAudio) {
              currentAudio.pause();
            }
            currentAudio = a;
          }).catch(() => {
            // Dynamic endpoint unavailable, fallback gracefully
          });
        }
        if ((window as unknown as { __spoken?: unknown[] }).__spoken) {
          (window as unknown as { __spoken: unknown[] }).__spoken.push(`${text}|${options.lang}`);
        }
        return "spoken";
      } catch {
        // Fall through
      }
    }
  }

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
