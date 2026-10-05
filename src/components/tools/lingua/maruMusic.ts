// Procedural relaxing indie-game ambient soundtrack for Language Quest.
// Follows the 5-phase narrative arc: Observe -> Connect -> Hear -> Compose -> Speak.
// Powered by the Web Audio API with zero external audio assets, zero latency,
// and instant ducking/stopping for native Danish speech and microphone inputs.

export type NarrativePhase = "observe" | "connect" | "hear" | "compose" | "speak";

export interface PhaseTheme {
  name: string;
  label: string;
  description: string;
  rootFreq: number;
  // Four chords in the progression, each an array of frequencies (Hz)
  chords: number[][];
  // Melodic scale notes (Hz) for sparse felt piano / chime drops
  scale: number[];
  filterCutoff: number;
  tempoSec: number;
}

// 5 narrative arc themes inspired by Monument Valley, Gris, and Fez
export const THEMES: Record<NarrativePhase, PhaseTheme> = {
  // Beat 1: The Quay / Fountain Court - Stillness, peaceful canal discovery, airy pentatonic
  observe: {
    name: "observe",
    label: "01 · Observe",
    description: "Quiet cobblestones and water basin",
    rootFreq: 174.61, // F3
    chords: [
      [174.61, 261.63, 329.63, 440.0], // Fmaj7 (F3, C4, E4, A4)
      [233.08, 293.66, 349.23, 440.0], // Bbmaj7 (Bb3, D4, F4, A4)
      [146.83, 220.0, 261.63, 329.63], // Dm9 (D3, A3, C4, E4)
      [130.81, 196.0, 261.63, 329.63], // C6/9 (C3, G3, C4, E4)
    ],
    scale: [349.23, 392.0, 440.0, 523.25, 587.33, 659.25, 698.46],
    filterCutoff: 580,
    tempoSec: 7.0,
  },
  // Beat 2: The Cup Stall / Market - Playful pattern discovery, warm kalimba sprinkles
  connect: {
    name: "connect",
    label: "02 · Connect",
    description: "Market stall rhythms and curious patterns",
    rootFreq: 196.0, // G3
    chords: [
      [196.0, 246.94, 293.66, 369.99, 440.0], // Gmaj9
      [130.81, 196.0, 246.94, 329.63], // Cmaj7
      [164.81, 246.94, 293.66, 392.0], // Em7
      [146.83, 220.0, 293.66, 392.0], // Dsus4
    ],
    scale: [392.0, 440.0, 493.88, 587.33, 659.25, 783.99],
    filterCutoff: 650,
    tempoSec: 6.2,
  },
  // Beat 3: The North Arch / Guard - Reflective, modal nuances, listening to contrast
  hear: {
    name: "hear",
    label: "03 · Hear",
    description: "Stone arches, minimal pairs, and negation",
    rootFreq: 220.0, // A3
    chords: [
      [110.0, 164.81, 196.0, 246.94, 261.63], // Am9
      [146.83, 185.0, 261.63, 329.63], // D9 (Dorian)
      [174.61, 261.63, 329.63, 440.0], // Fmaj7
      [164.81, 246.94, 293.66, 392.0], // Em7
    ],
    scale: [440.0, 493.88, 523.25, 587.33, 659.25, 739.99, 783.99],
    filterCutoff: 620,
    tempoSec: 6.8,
  },
  // Beat 4: The Closed Gate - Bittersweet longing, richer emotional depth, reasoning
  compose: {
    name: "compose",
    label: "04 · Compose",
    description: "The barred gate and joining reasons",
    rootFreq: 146.83, // D3
    chords: [
      [146.83, 220.0, 261.63, 329.63, 349.23], // Dm9
      [116.54, 174.61, 220.0, 293.66, 329.63], // Bbmaj7#11
      [98.0, 146.83, 174.61, 233.08, 349.23], // Gm9
      [110.0, 164.81, 220.0, 293.66], // Asus4
    ],
    scale: [293.66, 349.23, 392.0, 440.0, 523.25, 587.33, 659.25],
    filterCutoff: 600,
    tempoSec: 7.2,
  },
  // Beat 5: The Archive / Finale - Luminous resolution, sparkling gentle indie triumph
  speak: {
    name: "speak",
    label: "05 · Speak",
    description: "The open door, the archive, and mastery",
    rootFreq: 261.63, // C4
    chords: [
      [130.81, 196.0, 246.94, 293.66, 329.63], // Cmaj9
      [87.31, 130.81, 164.81, 220.0, 246.94], // Fmaj7#11
      [110.0, 164.81, 196.0, 261.63, 329.63], // Am9
      [98.0, 146.83, 196.0, 261.63, 293.66], // Gsus4 -> G
    ],
    scale: [261.63, 329.63, 392.0, 440.0, 493.88, 523.25, 587.33, 659.25, 783.99],
    filterCutoff: 780,
    tempoSec: 6.4,
  },
};

export function normalizePhase(raw?: string): NarrativePhase {
  if (!raw) return "observe";
  const s = raw.toLowerCase();
  if (s.includes("speak") || s.includes("final") || s.includes("archive")) return "speak";
  if (s.includes("compose") || s.includes("gate") || s.includes("reason")) return "compose";
  if (s.includes("hear") || s.includes("arch") || s.includes("contrast") || s.includes("guard")) return "hear";
  if (s.includes("connect") || s.includes("stall") || s.includes("vendor") || s.includes("pattern")) return "connect";
  return "observe";
}

const STORAGE_KEY = "language-quest-music";
const NORMAL_GAIN = 0.18;
const DUCKED_GAIN = 0.02;

type MusicListener = (enabled: boolean, playing: boolean, phase: NarrativePhase) => void;

class IndieMusicEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private filterNode: BiquadFilterNode | null = null;
  private waterGain: GainNode | null = null;
  private waterSource: AudioBufferSourceNode | null = null;

  private currentPhase: NarrativePhase = "observe";
  private chordIndex = 0;
  private timer: number | null = null;
  private melodyTimer: number | null = null;

  private activeNodes: Array<{ oscs: OscillatorNode[]; gain: GainNode }> = [];

  private isEnabled = true;
  private isPlaying = false;
  private isDucked = false;
  private isMicPaused = false;
  private isMasterMuted = false;

  private listeners = new Set<MusicListener>();

  constructor() {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored !== null) {
          this.isEnabled = stored === "on";
        }
      } catch {
        this.isEnabled = true;
      }
    }
  }

  public subscribe(fn: MusicListener): () => void {
    this.listeners.add(fn);
    fn(this.isEnabled, this.isPlaying, this.currentPhase);
    return () => this.listeners.delete(fn);
  }

  private notify() {
    this.listeners.forEach((fn) => fn(this.isEnabled, this.isPlaying, this.currentPhase));
  }

  public getPhase(): NarrativePhase {
    return this.currentPhase;
  }

  public getEnabled(): boolean {
    return this.isEnabled;
  }

  public getPlaying(): boolean {
    return this.isPlaying;
  }

  public setPhase(phaseStr?: string) {
    const next = normalizePhase(phaseStr);
    if (next === this.currentPhase) return;
    this.currentPhase = next;
    this.chordIndex = 0;
    if (this.filterNode && this.ctx) {
      const theme = THEMES[this.currentPhase];
      this.filterNode.frequency.setTargetAtTime(theme.filterCutoff, this.ctx.currentTime, 1.2);
    }
    this.notify();
  }

  public setEnabled(val: boolean) {
    this.isEnabled = val;
    try {
      localStorage.setItem(STORAGE_KEY, val ? "on" : "off");
    } catch {
      /* ignore storage errors */
    }
    if (!val) {
      this.stop();
    } else {
      this.start();
    }
    this.notify();
  }

  public toggle(): boolean {
    this.setEnabled(!this.isEnabled);
    return this.isEnabled;
  }

  public duck(duck: boolean) {
    this.isDucked = duck;
    this.updateGain();
  }

  public pauseForMic(pause: boolean) {
    this.isMicPaused = pause;
    this.updateGain();
  }

  public setMasterMuted(muted: boolean) {
    this.isMasterMuted = muted;
    this.updateGain();
  }

  private updateGain() {
    if (!this.masterGain || !this.ctx) return;
    let target = 0;
    if (this.isEnabled && this.isPlaying && !this.isMasterMuted && !this.isMicPaused) {
      target = this.isDucked ? DUCKED_GAIN : NORMAL_GAIN;
    }
    const timeConstant = this.isDucked || this.isMicPaused ? 0.08 : 0.6;
    this.masterGain.gain.setTargetAtTime(target, this.ctx.currentTime, timeConstant);
  }

  public init(context: AudioContext) {
    if (this.ctx === context && this.masterGain) return;
    this.ctx = context;

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0, this.ctx.currentTime);

    this.filterNode = this.ctx.createBiquadFilter();
    this.filterNode.type = "lowpass";
    this.filterNode.frequency.setValueAtTime(THEMES[this.currentPhase].filterCutoff, this.ctx.currentTime);
    this.filterNode.Q.setValueAtTime(0.7, this.ctx.currentTime);

    this.filterNode.connect(this.masterGain);
    this.masterGain.connect(this.ctx.destination);

    this.initWaterAmbience();
  }

  private initWaterAmbience() {
    if (!this.ctx || !this.masterGain) return;
    try {
      // 2 seconds loop of pink/brownish filtered noise to simulate gentle canal water lapping
      const bufferSize = this.ctx.sampleRate * 2;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let b0 = 0,
        b1 = 0,
        b2 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.969 * b2 + white * 0.153852;
        output[i] = (b0 + b1 + b2) * 0.05;
      }

      this.waterSource = this.ctx.createBufferSource();
      this.waterSource.buffer = noiseBuffer;
      this.waterSource.loop = true;

      const waterFilter = this.ctx.createBiquadFilter();
      waterFilter.type = "bandpass";
      waterFilter.frequency.setValueAtTime(320, this.ctx.currentTime);
      waterFilter.Q.setValueAtTime(1.8, this.ctx.currentTime);

      this.waterGain = this.ctx.createGain();
      this.waterGain.gain.setValueAtTime(0.015, this.ctx.currentTime);

      this.waterSource.connect(waterFilter);
      waterFilter.connect(this.waterGain);
      this.waterGain.connect(this.masterGain);

      this.waterSource.start();
    } catch {
      /* Web Audio buffer source optional fallback */
    }
  }

  public start() {
    if (!this.isEnabled) return;
    if (this.isPlaying) return;

    if (!this.ctx) {
      if (typeof window === "undefined") return;
      const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return;
      this.init(new Ctor());
    }

    if (this.ctx && this.ctx.state === "suspended") {
      void this.ctx.resume();
    }

    this.isPlaying = true;
    this.updateGain();
    this.scheduleNextChord();
    this.scheduleMelodyNote();
    this.notify();
  }

  public stop() {
    if (!this.isPlaying) return;
    this.isPlaying = false;
    this.updateGain();

    if (this.timer) {
      window.clearTimeout(this.timer);
      this.timer = null;
    }
    if (this.melodyTimer) {
      window.clearTimeout(this.melodyTimer);
      this.melodyTimer = null;
    }

    // Smoothly release all active voices
    const now = this.ctx ? this.ctx.currentTime : 0;
    this.activeNodes.forEach(({ gain, oscs }) => {
      try {
        if (this.ctx) gain.gain.setTargetAtTime(0.0001, now, 0.4);
        window.setTimeout(() => {
          oscs.forEach((o) => {
            try {
              o.stop();
              o.disconnect();
            } catch {
              /* ignore */
            }
          });
          gain.disconnect();
        }, 500);
      } catch {
        /* ignore */
      }
    });
    this.activeNodes = [];
    this.notify();
  }

  private scheduleNextChord = () => {
    if (!this.isPlaying || !this.ctx || !this.filterNode) return;

    const theme = THEMES[this.currentPhase];
    const chordFrequencies = theme.chords[this.chordIndex % theme.chords.length];
    this.chordIndex++;

    const now = this.ctx.currentTime;
    const chordDuration = theme.tempoSec;

    // Prune expired voices
    this.activeNodes = this.activeNodes.filter(({ gain }) => {
      try {
        return gain.gain.value > 0.0002;
      } catch {
        return false;
      }
    });

    const voiceGain = this.ctx.createGain();
    voiceGain.gain.setValueAtTime(0.0001, now);
    voiceGain.gain.linearRampToValueAtTime(0.22, now + 1.6);
    voiceGain.gain.setValueAtTime(0.22, now + chordDuration - 1.6);
    voiceGain.gain.linearRampToValueAtTime(0.0001, now + chordDuration + 0.8);
    voiceGain.connect(this.filterNode);

    const oscs: OscillatorNode[] = [];

    // Synthesize notes in the chord
    chordFrequencies.forEach((freq, idx) => {
      if (!this.ctx) return;
      // Primary warm triangle
      const osc1 = this.ctx.createOscillator();
      osc1.type = "triangle";
      osc1.frequency.setValueAtTime(freq, now);
      osc1.detune.setValueAtTime(idx % 2 === 0 ? 3 : -3, now);

      // Subtle pure sine overtone
      const osc2 = this.ctx.createOscillator();
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(freq, now);
      osc2.detune.setValueAtTime(idx % 2 === 0 ? -4 : 4, now);

      const noteGain = this.ctx.createGain();
      noteGain.gain.setValueAtTime(0.35 / chordFrequencies.length, now);

      osc1.connect(noteGain);
      osc2.connect(noteGain);
      noteGain.connect(voiceGain);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + chordDuration + 1.0);
      osc2.stop(now + chordDuration + 1.0);

      oscs.push(osc1, osc2);
    });

    this.activeNodes.push({ oscs, gain: voiceGain });

    this.timer = window.setTimeout(this.scheduleNextChord, (chordDuration - 1.2) * 1000);
  };

  private scheduleMelodyNote = () => {
    if (!this.isPlaying || !this.ctx || !this.filterNode) return;

    const theme = THEMES[this.currentPhase];
    const now = this.ctx.currentTime;

    // Pick a note from the theme scale
    const noteFreq = theme.scale[Math.floor(Math.random() * theme.scale.length)];

    const noteGain = this.ctx.createGain();
    const panNode = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;

    if (panNode) {
      panNode.pan.setValueAtTime((Math.random() - 0.5) * 0.7, now);
      noteGain.connect(panNode);
      panNode.connect(this.filterNode);
    } else {
      noteGain.connect(this.filterNode);
    }

    noteGain.gain.setValueAtTime(0.0001, now);
    noteGain.gain.exponentialRampToValueAtTime(0.12, now + 0.04);
    noteGain.gain.exponentialRampToValueAtTime(0.0001, now + 2.2);

    // Warm bell / felt piano sound: sine with soft overtone
    const osc = this.ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(noteFreq, now);

    const overtone = this.ctx.createOscillator();
    overtone.type = "sine";
    overtone.frequency.setValueAtTime(noteFreq * 2.76, now); // inharmonic bell sparkle
    const overGain = this.ctx.createGain();
    overGain.gain.setValueAtTime(0.02, now);
    overtone.connect(overGain);
    overGain.connect(noteGain);

    osc.connect(noteGain);

    osc.start(now);
    overtone.start(now);
    osc.stop(now + 2.3);
    overtone.stop(now + 2.3);

    // Schedule next note between 2.5s and 4.2s
    const delay = 2500 + Math.random() * 1700;
    this.melodyTimer = window.setTimeout(this.scheduleMelodyNote, delay);
  };
}

export const musicEngine = new IndieMusicEngine();

export const startMusic = () => musicEngine.start();
export const stopMusic = () => musicEngine.stop();
export const toggleMusic = () => musicEngine.toggle();
export const isMusicEnabled = () => musicEngine.getEnabled();
export const isMusicPlaying = () => musicEngine.getPlaying();
export const setMusicEnabled = (val: boolean) => musicEngine.setEnabled(val);
export const setMusicPhase = (phase?: string) => musicEngine.setPhase(phase);
export const getMusicPhase = () => musicEngine.getPhase();
export const duckMusic = (duck: boolean) => musicEngine.duck(duck);
export const pauseMusicForVoice = (pause: boolean) => musicEngine.pauseForMic(pause);
export const setMusicMuted = (muted: boolean) => musicEngine.setMasterMuted(muted);
export const onMusicChange = (fn: MusicListener) => musicEngine.subscribe(fn);
export const initMusicContext = (ctx: AudioContext) => musicEngine.init(ctx);
