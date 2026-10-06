// Grading for "write what you hear" and "say it" in Maru. Pure functions, no UI.
import type { LanguagePack, WordId } from "./packs/types";

const FOLD: Record<string, string> = { æ: "ae", ø: "o", å: "a", œ: "oe", ß: "ss" };

/** Lower-case letters only (any script): no spaces, hyphens, accents. Speech recognisers return Danish spellings, so æ/ø/å are folded; Greek tonos and final sigma are folded too. */
export const normalize = (text: string) =>
  text
    .toLowerCase()
    .replace(/[æøåœß]/g, (c) => FOLD[c])
    .replace(/ς/g, "σ") // Greek final sigma
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^\p{L}]/gu, ""); // letters of any script

export function distance(a: string, b: string) {
  const row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = row[0];
    row[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const keep = row[j];
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = keep;
    }
  }
  return row[b.length];
}

export const syllableCount = (text: string) => (normalize(text).match(/[ptkmnsvlrg]?[aeiou]/g) ?? []).length;

export type Verdict = "exact" | "accepted" | "close" | "miss";
export interface Grade {
  verdict: Verdict;
  passed: boolean;
  distance: number;
  /** Target with the letters you got right in place and "·" for the rest (spaces kept). */
  pattern: string;
}

/**
 * Typed guesses must match exactly. Spoken guesses go through a recogniser trained on Danish, not Maru, so one slip
 * per four letters is accepted ("accepted"), which is a deliberate leniency, not a pronunciation score.
 */
export function grade(target: string, guess: string, spoken = false): Grade {
  const t = normalize(target);
  const g = normalize(guess);
  const d = distance(t, g);
  const tolerance = spoken ? Math.max(1, Math.floor(t.length / 4)) : 0;
  let verdict: Verdict = "miss";
  if (d === 0) verdict = "exact";
  else if (d <= tolerance) verdict = "accepted";
  else if (d <= Math.max(1, Math.floor(t.length / 3))) verdict = "close";
  let i = 0;
  const pattern = Array.from(target.toLowerCase())
    .map((c) => {
      if (!/\p{L}/u.test(c)) return c;
      const ok = g[i] === t[i];
      i += 1;
      return ok ? c : "·";
    })
    .join("");
  return { verdict, passed: verdict === "exact" || verdict === "accepted", distance: d, pattern };
}

// ---------- notation-aware grading (IPA or romanisation) ----------

export interface NotationRules {
  kind: "ipa" | "romanisation";
  /** Characters ignored when comparing (stress, length, glottal stop, spaces...). */
  ignore: string;
  /** Groups of symbols treated as one sound (the first symbol of a group is its representative). */
  equivalent?: string[][];
}

const COMBINING = /[̀-ͯ͡]/g;

/** Canonical comparison form of a transcription: no ignored marks, one symbol per sound class. */
export function normalizeSound(text: string, rules: NotationRules): string {
  const ignore = new Set(Array.from(rules.ignore));
  const rep = new Map<string, string>();
  for (const group of rules.equivalent ?? []) for (const symbol of group) if (!rep.has(symbol)) rep.set(symbol, group[0]);
  return Array.from(text.normalize("NFD").replace(COMBINING, "").replace(/ɡ/g, "g").toLowerCase())
    .filter((c) => !ignore.has(c) && /\S/.test(c))
    .map((c) => rep.get(c) ?? c)
    .join("");
}

export interface SoundGrade extends Grade {
  /** The accepted transcription the guess came closest to. */
  matched: string;
}

/**
 * Grade a transcription against the main transcription and its accepted alternatives.
 * IPA guesses get a small tolerance (one slip in five sounds) because transcription is hard and the
 * reference may carry its own uncertainty; romanisation must match exactly.
 */
export function gradeSound(target: string, alsoAccept: readonly string[] | undefined, guess: string, rules: NotationRules): SoundGrade {
  const g = normalizeSound(guess, rules);
  let best: SoundGrade | null = null;
  for (const candidate of [target, ...(alsoAccept ?? [])]) {
    const t = normalizeSound(candidate, rules);
    const d = distance(t, g);
    const tolerance = rules.kind === "ipa" ? Math.floor(t.length / 5) : 0;
    let verdict: Verdict = "miss";
    if (d === 0) verdict = "exact";
    else if (d <= tolerance) verdict = "accepted";
    else if (d <= Math.max(1, Math.floor(t.length / 3))) verdict = "close";
    const ignore = new Set(Array.from(rules.ignore));
    const rep = new Map<string, string>();
    for (const group of rules.equivalent ?? []) for (const symbol of group) if (!rep.has(symbol)) rep.set(symbol, group[0]);
    let i = 0;
    const pattern = Array.from(candidate)
      .map((c) => {
        if (ignore.has(c) || /\s/.test(c) || COMBINING.test(c)) return c;
        COMBINING.lastIndex = 0;
        const base = rep.get(c.toLowerCase() === "ɡ" ? "g" : c.toLowerCase()) ?? c.toLowerCase();
        const ok = g[i] === base;
        i += 1;
        return ok ? c : "·";
      })
      .join("");
    const result: SoundGrade = { verdict, passed: verdict === "exact" || verdict === "accepted", distance: d, pattern, matched: candidate };
    if (!best || result.distance < best.distance) best = result;
  }
  return best!;
}

/** Syllable count of a written word, for the first hint. */
export function syllablesOf(written: string, kind: "ipa" | "romanisation"): number {
  const w = written.toLowerCase();
  if (kind === "romanisation") return (w.match(/[ptkmnsvlrg]?[aeiou]/g) ?? []).length;
  return Math.max(1, (w.match(/[aeiouyæøå]+/g) ?? []).length);
}

const IPA_DANISH_MAP: [string, string][] = [
  ["pʰ", "p"],
  ["tˢ", "t"],
  ["kʰ", "k"],
  ["b̥", "b"],
  ["d̥", "d"],
  ["ɡ̊", "g"],
  ["iː", "i"],
  ["yː", "y"],
  ["eː", "e"],
  ["ɛː", "æ"],
  ["øː", "ø"],
  ["œː", "ø"],
  ["aː", "a"],
  ["ɑː", "ar"],
  ["uː", "u"],
  ["oː", "o"],
  ["ɔː", "å"],
  ["ɛ", "æ"],
  ["ɑ", "ar"],
  ["ɔ", "å"],
  ["ʌ", "o"],
  ["ə", "e"],
  ["ɐ", "er"],
  ["ð", "d"],
  ["ŋ", "ng"],
  ["ʁ", "r"],
  ["ɡ", "g"],
  ["ˀ", ""],
  ["ː", ""],
];

const IPA_GREEK_MAP: [string, string][] = [
  ["ts", "τσ"],
  ["dz", "τζ"],
  ["ʝ", "γι"],
  ["ʎ", "λι"],
  ["ç", "χ"],
  ["ɣ", "γ"],
  ["ð", "δ"],
  ["ɾ", "ρ"],
  ["ɡ", "γκ"],
  ["g", "γκ"],
  ["b", "μπ"],
  ["d", "ντ"],
  ["u", "ου"],
  ["a", "α"],
  ["e", "ε"],
  ["i", "ι"],
  ["o", "ο"],
  ["p", "π"],
  ["t", "τ"],
  ["k", "κ"],
  ["f", "φ"],
  ["v", "β"],
  ["θ", "θ"],
  ["s", "σ"],
  ["z", "ζ"],
  ["x", "χ"],
  ["m", "μ"],
  ["n", "ν"],
  ["l", "λ"],
];

/** Map common IPA sequences to pronounceable orthography for a target language */
export function ipaToPronounceable(ipa: string, lang = "da"): string {
  let s = ipa.replace(/[\[\]\/ˈˌ.]/g, "").toLowerCase();
  if (lang.startsWith("el")) {
    // Greek: write the transcription in Greek letters so that a Greek voice reads it with Greek sounds
    for (const [from, to] of IPA_GREEK_MAP) s = s.replaceAll(from, to);
    s = s.replace(/[ˀː]/g, "");
  } else if (lang.startsWith("da")) {
    for (const [from, to] of IPA_DANISH_MAP) {
      s = s.replaceAll(from, to);
    }
  } else {
    s = s.replace(/ˀ/g, "").replace(/ː/g, "").replace(/ɡ/g, "g");
  }
  return s.trim();
}

export interface PhoneticAudioResolution {
  speakable: string;
  label: string;
  source: "exact-target" | "lexicon" | "keyword" | "phoneme" | "synthesized";
}

/**
 * Resolves a phonetic transcription input into speech-ready text and a descriptive label,
 * preferring authentic words and phoneme keywords before synthesized fallback.
 */
export function resolvePhoneticAudio(input: string, pack: LanguagePack, targetWordId?: WordId): PhoneticAudioResolution | null {
  const clean = input.trim();
  if (!clean) return null;

  const rules: NotationRules = {
    kind: pack.notation.kind,
    ignore: pack.notation.ignore,
    equivalent: pack.notation.equivalent,
  };
  const normInput = normalizeSound(clean, rules);

  // 1. If targetWordId is provided, check if input matches the target word
  if (targetWordId) {
    const targetWord = pack.lexicon.find((w) => w.id === targetWordId);
    if (targetWord) {
      const matchSound = normalizeSound(targetWord.sound, rules) === normInput;
      const matchAlso = targetWord.alsoAccept?.some((a) => normalizeSound(a, rules) === normInput);
      const matchWritten = normalize(targetWord.written) === normalize(clean);
      if (matchSound || matchAlso || matchWritten) {
        return {
          speakable: targetWord.speak ?? targetWord.written,
          label: `“${targetWord.written}” [${targetWord.sound}]`,
          source: "exact-target",
        };
      }
    }
  }

  // 2. Check if input matches any word in the lexicon
  for (const w of pack.lexicon) {
    const matchSound = normalizeSound(w.sound, rules) === normInput;
    const matchAlso = w.alsoAccept?.some((a) => normalizeSound(a, rules) === normInput);
    const matchWritten = normalize(w.written) === normalize(clean);
    if (matchSound || matchAlso || matchWritten) {
      return {
        speakable: w.speak ?? w.written,
        label: `“${w.written}” [${w.sound}]`,
        source: "lexicon",
      };
    }
  }

  // 3. Check if input matches a keyword in phonology
  for (const p of pack.phonology) {
    for (const k of p.keywords) {
      if (normalizeSound(k.sound, rules) === normInput || normalize(k.written) === normalize(clean)) {
        return {
          speakable: k.written,
          label: `keyword “${k.written}” [${k.sound}]`,
          source: "keyword",
        };
      }
    }
  }

  // 4. Check if input matches a single phoneme symbol (exact symbol first, then normalized)
  const phoneme =
    pack.phonology.find((p) => p.symbol.toLowerCase() === clean.toLowerCase()) ??
    pack.phonology.find((p) => normalizeSound(p.symbol, rules) === normInput);
  if (phoneme && phoneme.keywords.length > 0) {
    const k = phoneme.keywords[0];
    return {
      speakable: k.written,
      label: `[${phoneme.symbol}] in “${k.written}”`,
      source: "phoneme",
    };
  }

  // 5. Custom transcription sequence
  if (pack.notation.kind === "ipa") {
    const pronounceable = ipaToPronounceable(clean, pack.id);
    return {
      speakable: pronounceable || clean,
      label: `[${clean}] → “${pronounceable || clean}”`,
      source: "synthesized",
    };
  }

  // Romanisation (e.g. Maru)
  return {
    speakable: clean,
    label: `“${clean}”`,
    source: "synthesized",
  };
}
