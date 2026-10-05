import { allWords, encounter as encounterOf, word as wordOf } from "./packs/helpers";
import type { Clue, ClueKind, EncounterId, LanguagePack, MeaningId, WordId } from "./packs/types";

/** What the player has done and believes. Saved per language pack. Contains no answers. */
export interface WordNote {
  heard: boolean;
  /** The sound task was passed (or the transcription was revealed). */
  sound: boolean;
  /** The player had to reveal the transcription. */
  revealed?: boolean;
  /** The meaning the player currently believes. */
  hypothesis?: MeaningId;
  hintsUsed: number;
}

export interface Progress {
  v: 1;
  done: EncounterId[];
  words: Record<WordId, WordNote>;
  /** Clue ids the player chose to look at. */
  noticed: string[];
  /** The final sentence has been said. Unlocks the verdicts in the notebook. */
  finished: boolean;
  /** Ids of the story beats the player has read, oldest first (the story log). */
  story?: string[];
}

export const emptyProgress = (): Progress => ({ v: 1, done: [], words: {}, noticed: [], finished: false, story: [] });
const key = (packId: string) => `language-quest-progress-v1:${packId}`;

export function loadProgress(packId: string): Progress {
  try {
    const raw = JSON.parse(localStorage.getItem(key(packId)) ?? "null");
    if (raw && raw.v === 1) return { ...emptyProgress(), ...raw };
  } catch {
    /* storage unavailable or corrupt: start fresh */
  }
  return emptyProgress();
}
export function saveProgress(packId: string, progress: Progress) {
  try {
    localStorage.setItem(key(packId), JSON.stringify(progress));
  } catch {
    /* progress lasts for this session only */
  }
}
export function clearProgress(packId: string) {
  try {
    localStorage.removeItem(key(packId));
  } catch {
    /* nothing to clear */
  }
}

export const noteOf = (progress: Progress, id: WordId): WordNote => progress.words[id] ?? { heard: false, sound: false, hintsUsed: 0 };

/** Clues that are about a word and that the player has looked at. */
export function noticedClues(pack: LanguagePack, id: WordId, progress: Progress): Clue[] {
  return pack.encounters.flatMap((e) => e.clues).filter((c) => c.about?.includes(id) && progress.noticed.includes(c.id));
}
export function allClues(pack: LanguagePack, id: WordId): Clue[] {
  return pack.encounters.flatMap((e) => e.clues).filter((c) => c.about?.includes(id));
}

export type EvidenceState = "none" | "untested" | "unsupported" | "conflict" | "suspected" | "probable" | "supported";
export interface Evidence {
  state: EvidenceState;
  dots: 0 | 1 | 2 | 3;
  label: string;
  support: Clue[];
  against: Clue[];
}

const distinctKinds = (clues: Clue[]) => new Set<ClueKind>(clues.map((c) => c.kind)).size;

/**
 * How well the player's observations back their current guess. This measures consistency with what they
 * noticed, NOT correctness: a well-supported guess can still be wrong, and only the finale reveals the truth.
 */
export function evidenceFor(pack: LanguagePack, id: WordId, hypothesis: MeaningId | undefined, progress: Progress): Evidence {
  if (!hypothesis) return { state: "none", dots: 0, label: "no guess yet", support: [], against: [] };
  const seen = noticedClues(pack, id, progress);
  if (!seen.length) return { state: "untested", dots: 0, label: "no observations yet", support: [], against: [] };
  const support = seen.filter((c) => c.supports.includes(hypothesis));
  const against = seen.filter((c) => c.supports.length > 0 && !c.supports.includes(hypothesis));
  if (!support.length) return { state: "unsupported", dots: 0, label: "none of your observations point that way", support, against };
  if (against.length > support.length) return { state: "conflict", dots: 0, label: "more of your observations point elsewhere", support, against };
  const dots = Math.min(3, distinctKinds(support)) as 1 | 2 | 3;
  return {
    state: dots === 1 ? "suspected" : dots === 2 ? "probable" : "supported",
    dots,
    label: dots === 1 ? "suspected" : dots === 2 ? "probable" : "well supported",
    support,
    against,
  };
}

/** How many of the clues the player noticed about a word are compatible with a candidate meaning. */
export function compatibility(pack: LanguagePack, id: WordId, meaning: MeaningId, progress: Progress): { fits: number; of: number } {
  const seen = noticedClues(pack, id, progress).filter((c) => c.supports.length > 0);
  return { fits: seen.filter((c) => c.supports.includes(meaning)).length, of: seen.length };
}

/** Deterministic hash for stable ordering of distractor cards. */
const hash = (text: string) => Array.from(text).reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);

/**
 * The candidate meaning cards offered for a word: the truth, close meanings, every meaning that one of the word's
 * clues is also compatible with (the plausible wrong answers, so the player must discriminate), then stable fillers.
 */
export function candidatesFor(pack: LanguagePack, id: WordId, count = 8) {
  const w = wordOf(pack, id);
  const rivals = allClues(pack, id).flatMap((c) => c.supports);
  const must = new Set([w.meaning, ...(w.alsoMeaning ?? []), ...rivals]);
  const known = new Set(pack.meanings.map((m) => m.id));
  const required = pack.meanings.filter((m) => must.has(m.id) && known.has(m.id));
  const pool = pack.meanings.filter((m) => !must.has(m.id)).sort((a, b) => hash(id + a.id) - hash(id + b.id));
  const chosen = [...required, ...pool.slice(0, Math.max(0, count - required.length))];
  return chosen.sort((a, b) => hash(id + "~" + a.id) - hash(id + "~" + b.id));
}

export interface Verdict {
  word: WordId;
  guess?: MeaningId;
  truth: MeaningId;
  result: "correct" | "close" | "wrong" | "unanswered";
}
/** Compare the player's guesses with the truth. Only meaningful after the finale. */
export function verdicts(pack: LanguagePack, progress: Progress): Verdict[] {
  return allWords(pack)
    .filter((id) => progress.words[id])
    .map((id) => {
      const w = wordOf(pack, id);
      const guess = progress.words[id].hypothesis;
      const result = !guess ? "unanswered" : guess === w.meaning ? "correct" : w.alsoMeaning?.includes(guess) ? "close" : "wrong";
      return { word: id, guess, truth: w.meaning, result };
    });
}

/** A word's sound task is complete: its transcription may now be shown. */
export const soundKnown = (progress: Progress, id: WordId) => !!progress.words[id]?.sound;

/** Has the player met the encounter that teaches this word? */
export const encounterOfWord = (pack: LanguagePack, id: WordId): EncounterId | undefined =>
  pack.encounters.find((e) => e.drills.includes(id) || e.exposure?.includes(id))?.id;
export { encounterOf };
