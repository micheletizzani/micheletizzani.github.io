// Choosing a speech-synthesis voice. Pure functions, so they can be tested without a browser.
//
// Why this matters: if no voice for the target language is installed, browsers fall back to their default
// voice (usually English) and read the text with that language's sound rules. For a pronunciation game that is
// worse than silence, so the caller must be able to tell "a matching voice exists" from "it does not".

export interface VoiceLike {
  name: string;
  lang: string;
  localService?: boolean;
  default?: boolean;
}

const norm = (tag: string) => tag.toLowerCase().replace("_", "-");
const primary = (tag: string) => norm(tag).split("-")[0];

/** Online "natural/neural" voices usually sound best; then on-device voices; then by name for a stable order. */
const quality = (v: VoiceLike) => (/natural|neural|online|premium|enhanced/i.test(v.name) ? 0 : 1) + (v.localService === false ? 0.5 : 0);

export interface RankedVoices<T extends VoiceLike> {
  /** Same language and region (da-DK for da-DK). */
  exact: T[];
  /** Same language, other region (da-GL, or "da" alone). */
  sameLanguage: T[];
  /** Everything else, for the "use another voice anyway" list. */
  other: T[];
}

export function rankVoices<T extends VoiceLike>(voices: readonly T[], lang: string): RankedVoices<T> {
  const order = (a: T, b: T) => quality(a) - quality(b) || a.name.localeCompare(b.name);
  const exact = voices.filter((v) => norm(v.lang) === norm(lang)).sort(order);
  const sameLanguage = voices.filter((v) => norm(v.lang) !== norm(lang) && primary(v.lang) === primary(lang)).sort(order);
  const other = voices.filter((v) => primary(v.lang) !== primary(lang)).sort(order);
  return { exact, sameLanguage, other };
}

/**
 * The voice to speak with: the player's own choice if it is still installed, otherwise the best voice for the
 * language, otherwise null (meaning: there is no voice for this language on this device).
 */
export function pickVoice<T extends VoiceLike>(voices: readonly T[], lang: string, chosenName?: string | null): T | null {
  if (chosenName) {
    const chosen = voices.find((v) => v.name === chosenName);
    if (chosen) return chosen;
  }
  const { exact, sameLanguage } = rankVoices(voices, lang);
  return exact[0] ?? sameLanguage[0] ?? null;
}

export type VoiceStatus = "ok" | "missing" | "unsupported" | "loading";

/** Platform-specific instructions for installing a voice. Menu names change between OS versions: verify on your device. */
export function installHints(languageName: string, userAgent: string): { platform: string; steps: string }[] {
  const all = [
    {
      platform: "Windows",
      match: /windows/i,
      steps: `Settings → Time & language → Speech → Add voices → search for ${languageName}. Restart the browser afterwards. Edge may also list online “Natural” voices.`,
    },
    {
      platform: "macOS",
      match: /macintosh|mac os/i,
      steps: `System Settings → Accessibility → Spoken Content → System Voice → Manage Voices → add a ${languageName} voice. Restart the browser afterwards.`,
    },
    {
      platform: "iPhone / iPad",
      match: /iphone|ipad/i,
      steps: `Settings → Accessibility → Spoken Content → Voices → ${languageName} → download a voice.`,
    },
    {
      platform: "Android",
      match: /android/i,
      steps: `Settings → System → Languages → Text-to-speech output → Google Speech Services (or your engine) → install ${languageName} voice data.`,
    },
    {
      platform: "Linux",
      match: /linux|x11/i,
      steps: `Install speech-dispatcher and a synthesiser with ${languageName} support (for example espeak-ng). Quality is usually low.`,
    },
  ];
  const mine = all.filter((h) => h.match.test(userAgent) && !(h.platform === "Linux" && /android/i.test(userAgent)));
  return (mine.length ? mine : all).map(({ platform, steps }) => ({ platform, steps }));
}
