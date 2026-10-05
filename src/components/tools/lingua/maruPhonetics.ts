// Grading for "write what you hear" and "say it" in Maru. Pure functions, no UI.

const FOLD: Record<string, string> = { æ: "ae", ø: "o", å: "a", œ: "oe", ß: "ss" };

/** Lower-case letters only: no spaces, hyphens, accents. Speech recognisers return Danish spellings, so æ/ø/å are folded. */
export const normalize = (text: string) =>
  text
    .toLowerCase()
    .replace(/[æøåœß]/g, (c) => FOLD[c])
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z]/g, "");

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
      if (!/[a-z]/.test(c)) return c;
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
